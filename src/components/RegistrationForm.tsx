"use client";

import React, { useRef, useState } from 'react';
import { Database } from '../types';
import { maskPhone, maskCNPJ, maskCEP } from '../utils/masks';
import { 
  ChefHat, Package, Zap, Wrench, 
  Calendar, Hash, Scale, ClipboardList
} from 'lucide-react';
import ImageCropper from './ImageCropper';
import WebSearchInstructionsModal from './WebSearchInstructionsModal';
import RecipeModal from './RecipeModal';

interface RegistrationFormProps {
  type: string;
  db: Database;
  formData: any;
  setFormData: (data: any) => void;
  isDarkMode?: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ type, db, formData, setFormData, isDarkMode = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const inputClass = "w-full border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20 transition-all";
  const labelClass = "text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 ml-1";

  const handleChange = (field: string, value: any) => {
    let formattedValue = value;
    if (field === 'whatsapp' || field === 'phone') formattedValue = maskPhone(value);
    else if (field === 'cnpj') formattedValue = maskCNPJ(value);
    else if (field === 'cep') formattedValue = maskCEP(value);
    setFormData({ ...formData, [field]: formattedValue });
  };

  if (isCropping && tempImage) {
    return <ImageCropper image={tempImage} onCropComplete={(img) => { setFormData({...formData, imageUrl: img}); setIsCropping(false); }} onCancel={() => setIsCropping(false)} />;
  }

  if (type === 'Produtos' || type === 'ItensProduzidos' || type === 'Serviços') {
    const showConversion = ['UN', 'CX', 'DZ'].includes(formData.unit);

    return (
      <div className="space-y-6">
        <WebSearchInstructionsModal isOpen={isInstructionsOpen} onClose={() => setIsInstructionsOpen(false)} onConfirm={() => { window.open(`https://www.google.com/search?q=${encodeURIComponent(formData.name)}&tbm=isch`, '_blank'); setIsInstructionsOpen(false); }} />
        <RecipeModal isOpen={isRecipeModalOpen} onClose={() => setIsRecipeModalOpen(false)} db={db} formData={formData} setFormData={setFormData} isDarkMode={isDarkMode} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'Insumo', label: 'Insumo', icon: <Zap />, desc: 'Matéria-prima' },
            { id: 'Revenda', label: 'Revenda', icon: <Package />, desc: 'Compra e Venda' },
            { id: 'Produzido', label: 'Fabricação', icon: <ChefHat />, desc: 'Ficha Técnica' },
            { id: 'Serviço', label: 'Serviço', icon: <Wrench />, desc: 'Mão de Obra' },
          ].map(t => (
            <button 
              key={t.id} 
              type="button" 
              onClick={() => setFormData({ ...formData, type: t.id as any })} 
              className={`p-3 rounded-2xl border-2 text-left transition-all ${formData.type === t.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-200'}`}
            >
              <div className={`p-2 rounded-lg w-fit mb-2 ${formData.type === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300'}`}>
                {React.cloneElement(t.icon as any, { className: 'w-3.5 h-3.5' })}
              </div>
              <p className="text-[9px] font-black uppercase leading-none mb-1">{t.label}</p>
              <p className="text-[7px] font-bold text-slate-400 dark:text-slate-400 uppercase">{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className={labelClass}>Nome do Item</label>
            <input autoFocus className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Categoria</label>
              <select className={inputClass} value={formData.category || ''} onChange={e => handleChange('category', e.target.value)}>
                <option value="">Selecione...</option>
                {db.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Unidade de Compra/Estoque</label>
              <select className={inputClass} value={formData.unit || 'UN'} onChange={e => handleChange('unit', e.target.value)}>
                {['KG', 'L', 'UN', 'CX', 'DZ', 'GR', 'ML'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Preço de Venda</label>
              <input type="number" className={inputClass} value={formData.price || ''} onChange={e => handleChange('price', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Preço de Custo</label>
              <input type="number" className={inputClass} value={formData.costPrice || ''} onChange={e => handleChange('costPrice', Number(e.target.value))} />
            </div>
          </div>

          {showConversion && (
            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-[2rem] border border-indigo-100 dark:border-indigo-800 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400"><Scale className="w-4 h-4" /></div>
                <p className="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-300 tracking-tight">Conversão para Ficha Técnica</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-indigo-400 ml-1">Conteúdo por {formData.unit}</label>
                  <input type="number" className={`${inputClass} bg-white dark:bg-slate-800`} placeholder="Ex: 300" value={formData.contentPerUnit || ''} onChange={e => handleChange('contentPerUnit', Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-indigo-400 ml-1">Unidade de Medida</label>
                  <select className={`${inputClass} bg-white dark:bg-slate-800`} value={formData.contentUnit || 'GR'} onChange={e => handleChange('contentUnit', e.target.value)}>
                    <option value="GR">Gramas (g)</option>
                    <option value="ML">Mililitros (ml)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Lote</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input className={`${inputClass} bg-white dark:bg-slate-800 pl-9`} placeholder="Ex: L2024-01" value={formData.batch || ''} onChange={e => handleChange('batch', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Data de Vencimento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="date" className={`${inputClass} bg-white dark:bg-slate-800 pl-9`} value={formData.expirationDate || ''} onChange={e => handleChange('expirationDate', e.target.value)} />
              </div>
            </div>
          </div>

          {formData.type === 'Produzido' && (
            <button 
              type="button"
              onClick={() => setIsRecipeModalOpen(true)}
              className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100 dark:shadow-none hover:bg-orange-600 transition-all flex items-center justify-center gap-3 border-4 border-white dark:border-slate-800"
            >
              <ClipboardList className="w-5 h-5" /> 
              {formData.recipe?.length > 0 ? 'Editar Ficha Técnica' : 'Configurar Ficha Técnica'}
              {formData.recipe?.length > 0 && <span className="bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg text-[10px]">{formData.recipe.length} itens</span>}
            </button>
          )}
        </div>
      </div>
    );
  }

  switch (type) {
    case 'Clientes':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className={labelClass}>Nome Completo</label><input autoFocus className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
            <div className="space-y-1"><label className={labelClass}>WhatsApp</label><input className={inputClass} placeholder="(00) 00000-0000" value={formData.whatsapp || ''} onChange={e => handleChange('whatsapp', e.target.value)} /></div>
          </div>
          <div className="space-y-1"><label className={labelClass}>Endereço</label><input className={inputClass} value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} /></div>
        </div>
      );
    case 'Usuários':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className={labelClass}>Nome</label><input autoFocus className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
            <div className="space-y-1"><label className={labelClass}>Código/ID</label><input className={inputClass} value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} /></div>
            <div className="space-y-1">
              <label className={labelClass}>Cargo/Role</label>
              <select className={inputClass} value={formData.role || 'Vendedor'} onChange={e => handleChange('role', e.target.value)}>
                <option value="Vendedor">Vendedor</option>
                <option value="Gerente">Gerente</option>
                <option value="Admin">Admin</option>
                <option value="Estoquista">Estoquista</option>
                <option value="Comprador">Comprador</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={formData.status || 'Ativo'} onChange={e => handleChange('status', e.target.value)}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
        </div>
      );
    case 'Fornecedores':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className={labelClass}>Razão Social / Nome</label><input autoFocus className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
            <div className="space-y-1"><label className={labelClass}>CNPJ</label><input className={inputClass} value={formData.cnpj || ''} onChange={e => handleChange('cnpj', e.target.value)} /></div>
            <div className="space-y-1"><label className={labelClass}>WhatsApp</label><input className={inputClass} value={formData.whatsapp || ''} onChange={e => handleChange('whatsapp', e.target.value)} /></div>
            <div className="space-y-1"><label className={labelClass}>Responsável</label><input className={inputClass} value={formData.responsible || ''} onChange={e => handleChange('responsible', e.target.value)} /></div>
          </div>
        </div>
      );
    case 'Categorias':
      return (
        <div className="space-y-6">
          <div className="space-y-1"><label className={labelClass}>Nome da Categoria</label><input autoFocus className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Tipo</label>
              <select className={inputClass} value={formData.type || 'Venda'} onChange={e => handleChange('type', e.target.value)}>
                <option value="Venda">Venda</option>
                <option value="Serviço">Serviço</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="chkShowInPos" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" checked={formData.showInPOS} onChange={e => setFormData({...formData, showInPOS: e.target.checked})} />
              <label htmlFor="chkShowInPos" className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 cursor-pointer">Mostrar no PDV</label>
            </div>
          </div>
        </div>
      );
    case 'Despesas':
      return (
        <div className="space-y-6">
          <div className="space-y-1"><label className={labelClass}>Descrição</label><input autoFocus className={inputClass} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className={labelClass}>Valor R$</label><input type="number" className={inputClass} value={formData.amount || ''} onChange={e => handleChange('amount', Number(e.target.value))} /></div>
            <div className="space-y-1"><label className={labelClass}>Data</label><input type="date" className={inputClass} value={formData.date || new Date().toISOString().split('T')[0]} onChange={e => handleChange('date', e.target.value)} /></div>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Conta (Plano de Contas)</label>
            <select className={inputClass} value={formData.accountId || ''} onChange={e => handleChange('accountId', e.target.value)}>
              <option value="">Selecione...</option>
              {db.accounts.filter(a => a.type === 'Despesa' || a.type === 'Custo').map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
            </select>
          </div>
        </div>
      );
    case 'Bancos':
      return (
        <div className="space-y-6">
          <div className="space-y-1"><label className={labelClass}>Nome do Banco / Conta</label><input autoFocus className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className={labelClass}>Agência</label><input className={inputClass} value={formData.agency || ''} onChange={e => handleChange('agency', e.target.value)} /></div>
            <div className="space-y-1"><label className={labelClass}>Conta</label><input className={inputClass} value={formData.account || ''} onChange={e => handleChange('account', e.target.value)} /></div>
          </div>
          <div className="space-y-1"><label className={labelClass}>Saldo Inicial R$</label><input type="number" className={inputClass} value={formData.initialBalance || 0} onChange={e => handleChange('initialBalance', Number(e.target.value))} /></div>
        </div>
      );
    case 'Locais':
      return (
        <div className="space-y-6">
          <div className="space-y-1"><label className={labelClass}>Nome do Local</label><input autoFocus className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
          <div className="space-y-1">
            <label className={labelClass}>Tipo</label>
            <select className={inputClass} value={formData.type || 'Estoque'} onChange={e => handleChange('type', e.target.value)}>
              <option value="Estoque">Estoque</option>
              <option value="Loja">Loja</option>
              <option value="Centro de Distribuição">Centro de Distribuição</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
      );
    case 'PlanoDeContas':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className={labelClass}>Código</label><input autoFocus className={inputClass} value={formData.code || ''} onChange={e => handleChange('code', e.target.value)} /></div>
            <div className="space-y-1">
              <label className={labelClass}>Tipo</label>
              <select className={inputClass} value={formData.type || 'Despesa'} onChange={e => handleChange('type', e.target.value)}>
                <option value="Receita">Receita</option>
                <option value="Despesa">Despesa</option>
                <option value="Custo">Custo</option>
                <option value="Ativo">Ativo</option>
                <option value="Passivo">Passivo</option>
              </select>
            </div>
          </div>
          <div className="space-y-1"><label className={labelClass}>Nome da Conta</label><input className={inputClass} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} /></div>
          <div className="space-y-1"><label className={labelClass}>Código Pai (Opcional)</label><input className={inputClass} value={formData.parentCode || ''} onChange={e => handleChange('parentCode', e.target.value)} /></div>
        </div>
      );
    default: return null;
  }
};

export default RegistrationForm;
