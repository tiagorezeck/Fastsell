"use client";

import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, Upload, Trash2, AlertCircle, Database as DbIcon, Building2, Save, Zap, 
  LayoutDashboard, Banknote, Wallet, Package, Boxes, Tags, Users, Truck, TrendingDown, 
  Landmark, ClipboardList, ShoppingBag, FileText, FileSpreadsheet, Shield, Clock, 
  Receipt, Scale, RefreshCw, CheckSquare, Square, X, AlertTriangle, Layout, Award,
  ChefHat, Trophy, Info, FileDown, CheckCircle2, FileJson, ArrowRightLeft, ListChecks, Sparkles, Cloud,
  Smartphone, MousePointer2, Monitor, Barcode, Wrench, Plus, History, RotateCcw, BellRing, Moon, Sun
} from 'lucide-react';
import { TableWithChairs } from './CustomIcons';
import { Database, CompanyInfo, DatabaseBackup } from '../types';
import { toast } from 'react-hot-toast';
import { maskPhone, maskCNPJ, maskCEP } from '../utils/masks';
import { resetDB, DB_VERSION, DEFAULT_DRE_STRUCTURE, ERP_ACCOUNTS, sanitizeDB, saveDB, parseJSONBackup } from '../db';
import { generateCSVContent, parseCSV, exportToCSV } from '../utils/csv';
import Modal from './Modal';
import JSZip from 'jszip';
import CloudSyncManager from './CloudSyncManager';

interface SettingsViewProps {
  db: Database;
  setDb: (db: Database) => void;
  forcedTab?: 'Empresa' | 'PDV' | 'Módulos' | 'Fidelidade' | 'Dados' | 'Nuvem';
}

const SettingsView: React.FC<SettingsViewProps> = ({ db, setDb, forcedTab = 'Empresa' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvImportRef = useRef<HTMLInputElement>(null);
  const [companyForm, setCompanyForm] = useState<CompanyInfo>(db.companyInfo);
  
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [cleanupOptions, setCleanupOptions] = useState<Record<string, boolean>>({
    sales: false, expenses: false, stockHistory: false, cashier: false, purchases: false, credit: false
  });

  const exportableItems = [
    'Produtos', 'Clientes', 'Fornecedores', 'Usuários', 'Categorias', 'Locais de Estoque',
    'Vendas', 'Despesas', 'Estoque', 'Caixa', 'Compras', 'Crediário',
    'Plano de Contas', 'Bancos', 'DRE (Estrutura)'
  ];

  const [selectedExports, setSelectedExports] = useState<string[]>([]);

  useEffect(() => {
    setCompanyForm(db.companyInfo);
  }, [db.companyInfo]);

  const handleSaveSettings = () => {
    setDb({ ...db, companyInfo: companyForm });
    toast.success("Configurações salvas com sucesso!");
  };

  const toggleModule = (moduleId: string) => {
    const current = companyForm.enabledModules || [];
    const updated = current.includes(moduleId) 
      ? current.filter(m => m !== moduleId) 
      : [...current, moduleId];
    setCompanyForm({ ...companyForm, enabledModules: updated });
  };

  const toggleShortcut = (id: string) => {
    const current = companyForm.headerShortcuts || [];
    const updated = current.includes(id) 
      ? current.filter(s => s !== id) 
      : [...current, id];
    setCompanyForm({ ...companyForm, headerShortcuts: updated });
  };

  const createRestorePoint = () => {
    const name = window.prompt("Dê um nome para este ponto de restauração:", `Backup ${new Date().toLocaleString('pt-BR')}`);
    if (!name) return;

    const newBackup: DatabaseBackup = {
      id: `BK${Date.now()}`,
      date: new Date().toISOString(),
      name,
      data: JSON.parse(JSON.stringify(db)) // Deep clone
    };

    const updatedBackups = [newBackup, ...(db.backups || [])].slice(0, 10); // Mantém os últimos 10
    setDb({ ...db, backups: updatedBackups });
    toast.success("Ponto de restauração criado!");
  };

  const restoreFromPoint = (backup: DatabaseBackup) => {
    if (window.confirm(`ATENÇÃO: Restaurar o ponto "${backup.name}" substituirá todos os dados atuais. Deseja continuar?`)) {
      const currentBackups = db.backups;
      const restored = sanitizeDB(backup.data);
      restored.backups = currentBackups;
      saveDB(restored);
      setDb(restored);
      toast.success("Sistema restaurado com sucesso!");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const deleteBackup = (id: string) => {
    if (window.confirm("Excluir este ponto de restauração?")) {
      setDb({ ...db, backups: db.backups?.filter(b => b.id !== id) });
      toast.success("Backup removido.");
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        const sanitized = parseJSONBackup(rawContent);
        
        // Salva imediatamente no localStorage
        saveDB(sanitized);
        setDb(sanitized);
        
        toast.success(
          `Backup restaurado com sucesso! (${sanitized.products.length} produtos, ${sanitized.customers.length} clientes, ${sanitized.sales.length} vendas)`,
          { duration: 4000 }
        );
        setTimeout(() => window.location.reload(), 1200);
      } catch (err: any) { 
        console.error("Erro na restauração do backup:", err);
        toast.error(err?.message || "Erro ao ler arquivo JSON. Verifique o formato."); 
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      toast.error("Não foi possível ler o arquivo selecionado.");
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportSelectedCSV = async () => {
    if (selectedExports.length === 0) return;
    try {
      const zip = new JSZip();
      const dateStr = new Date().toISOString().split('T')[0];

      const exportMap: Record<string, any[]> = {
        'Produtos': db.products.map(p => ({
          ID: p.id,
          Nome: p.name,
          PrecoVenda: p.price,
          PrecoCusto: p.costPrice,
          Estoque: p.stock,
          EstoqueMinimo: p.minStock,
          Categoria: p.category,
          CodigoBarras: p.barcode,
          Tipo: p.type,
          Unidade: p.unit
        })),
        'Clientes': db.customers.map(c => ({
          ID: c.id,
          Nome: c.name,
          WhatsApp: c.whatsapp,
          Endereco: c.address,
          CEP: c.cep,
          Numero: c.number,
          Complemento: c.complement,
          DataNascimento: c.birthDate || '',
          PontosFidelidade: c.loyaltyPoints,
          CrediarioAtivo: c.creditEnabled ? 'Sim' : 'Não',
          LimiteCredito: c.creditLimit,
          DividaAtual: c.currentDebt,
          StatusCredito: c.creditStatus
        })),
        'Fornecedores': db.suppliers.map(s => ({
          ID: s.id,
          Nome: s.name,
          Responsavel: s.responsible || '',
          WhatsApp: s.whatsapp,
          CNPJ: s.cnpj || '',
          Endereco: s.address || s.endereco || ''
        })),
        'Usuários': db.users.map(u => ({
          ID: u.id,
          Codigo: u.code,
          Nome: u.name,
          Perfil: u.role,
          Status: u.status,
          Contrato: u.contractType,
          Comissao: u.commission
        })),
        'Categorias': db.categories.map(c => ({
          ID: c.id,
          Nome: c.name,
          ExibirNoPDV: c.showInPOS ? 'Sim' : 'Não',
          Tipo: c.type
        })),
        'Locais de Estoque': db.locations.map(l => ({
          ID: l.id,
          Nome: l.name,
          Tipo: l.type
        })),
        'Vendas': db.sales.map(s => ({
          ID: s.id,
          Data: s.date,
          ClienteID: s.customerId || '',
          VendedorID: s.sellerId,
          Subtotal: s.subtotal,
          Desconto: s.discount,
          Total: s.total,
          MetodoPagamento: s.paymentMethod,
          TipoEntrega: s.deliveryType,
          Status: s.status,
          Tipo: s.type
        })),
        'Despesas': db.expenses.map(e => ({
          ID: e.id,
          Descricao: e.description,
          Valor: e.amount,
          Data: e.date,
          ContaID: e.accountId
        })),
        'Estoque': db.stockMovements.map(m => ({
          ID: m.id,
          ProdutoID: m.productId,
          Direcao: m.direction,
          NaturezaID: m.natureId,
          Quantidade: m.quantity,
          Motivo: m.reason,
          Data: m.date
        })),
        'Caixa': db.cashierSessions.map(c => ({
          ID: c.id,
          Abertura: c.openedAt,
          Fechamento: c.closedAt || '',
          SaldoInicial: c.openingBalance,
          Status: c.status
        })),
        'Compras': db.purchaseOrders.map(p => ({
          ID: p.id,
          Data: p.date,
          FornecedorID: p.supplierId,
          Total: p.total,
          Status: p.status
        })),
        'Crediário': db.creditTransactions.map(t => ({
          ID: t.id,
          ClienteID: t.customerId,
          Data: t.date,
          Tipo: t.type,
          Valor: t.amount,
          Status: t.status
        })),
        'Plano de Contas': db.accounts.map(a => ({
          ID: a.id,
          Codigo: a.code,
          Nome: a.name,
          Tipo: a.type,
          Classificacao: a.classification || ''
        })),
        'Bancos': db.banks.map(b => ({
          ID: b.id,
          Nome: b.name,
          Agencia: b.agency,
          Conta: b.account,
          SaldoInicial: b.initialBalance
        })),
        'DRE (Estrutura)': (db.companyInfo.dreStructure || DEFAULT_DRE_STRUCTURE).map(d => ({
          ID: d.id,
          Rotulo: d.label,
          Operacao: d.operation,
          CodigosContas: d.accountCodes.join(','),
          Principal: d.isMain ? 'Sim' : 'Não'
        }))
      };

      if (selectedExports.length === 1) {
        const item = selectedExports[0];
        const data = exportMap[item] || [];
        exportToCSV(`Fastsell-${item}-${dateStr}.csv`, data);
        toast.success(`Exportado ${item}.csv com sucesso!`);
        return;
      }

      selectedExports.forEach(item => {
        const data = exportMap[item];
        if (data && data.length > 0) {
          zip.file(`Fastsell-${item}-${dateStr}.csv`, generateCSVContent(data));
        }
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `FASTSELL_PASTA_EXPORT_${dateStr}.zip`;
      link.click();
      toast.success("Pacote ZIP gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar exportação.");
    }
  };

  const handleImportCSVOrZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const updated = { ...db };
      let importedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.name.endsWith('.zip')) {
          const zip = await JSZip.loadAsync(file);
          for (const filename of Object.keys(zip.files)) {
            if (filename.endsWith('.csv') && !zip.files[filename].dir) {
              const text = await zip.files[filename].async('text');
              const parsed = parseCSV(text);
              const lowerName = filename.toLowerCase();
              if (lowerName.includes('produto')) {
                const newProds = parsed.map((row, pIdx) => ({
                  id: row.ID ? String(row.ID) : `p_${Date.now()}_${pIdx}`,
                  name: row.Nome || row.name || `Produto ${pIdx + 1}`,
                  price: Number(row.PrecoVenda || row.price || 0),
                  costPrice: Number(row.PrecoCusto || row.costPrice || 0),
                  stock: Number(row.Estoque || row.stock || 0),
                  minStock: Number(row.EstoqueMinimo || row.minStock || 0),
                  category: row.Categoria || row.category || 'Geral',
                  barcode: row.CodigoBarras ? String(row.CodigoBarras) : '',
                  imageUrl: '',
                  type: (row.Tipo || 'Revenda') as any,
                  unit: (row.Unidade || 'UN') as any,
                  batches: []
                }));
                updated.products = newProds;
                importedCount += newProds.length;
              } else if (lowerName.includes('cliente')) {
                const newCusts = parsed.map((row, cIdx) => ({
                  id: row.ID ? String(row.ID) : `c_${Date.now()}_${cIdx}`,
                  name: row.Nome || row.name || `Cliente ${cIdx + 1}`,
                  whatsapp: row.WhatsApp || row.whatsapp || '',
                  address: row.Endereco || row.address || '',
                  cep: row.CEP || row.cep || '',
                  number: String(row.Numero || row.number || ''),
                  complement: row.Complemento || row.complement || '',
                  birthDate: row.DataNascimento || undefined,
                  loyaltyPoints: Number(row.PontosFidelidade || 0),
                  creditEnabled: row.CrediarioAtivo === 'Sim' || row.creditEnabled === true,
                  creditLimit: Number(row.LimiteCredito || 0),
                  currentDebt: Number(row.DividaAtual || 0),
                  creditStatus: (row.StatusCredito || 'Liberado') as any
                }));
                updated.customers = newCusts;
                importedCount += newCusts.length;
              }
            }
          }
        } else if (file.name.endsWith('.csv')) {
          const text = await file.text();
          const parsed = parseCSV(text);
          const lowerName = file.name.toLowerCase();
          if (lowerName.includes('produto')) {
            const newProds = parsed.map((row, pIdx) => ({
              id: row.ID ? String(row.ID) : `p_${Date.now()}_${pIdx}`,
              name: row.Nome || row.name || `Produto ${pIdx + 1}`,
              price: Number(row.PrecoVenda || row.price || 0),
              costPrice: Number(row.PrecoCusto || row.costPrice || 0),
              stock: Number(row.Estoque || row.stock || 0),
              minStock: Number(row.EstoqueMinimo || row.minStock || 0),
              category: row.Categoria || row.category || 'Geral',
              barcode: row.CodigoBarras ? String(row.CodigoBarras) : '',
              imageUrl: '',
              type: (row.Tipo || 'Revenda') as any,
              unit: (row.Unidade || 'UN') as any,
              batches: []
            }));
            updated.products = newProds;
            importedCount += newProds.length;
          } else if (lowerName.includes('cliente')) {
            const newCusts = parsed.map((row, cIdx) => ({
              id: row.ID ? String(row.ID) : `c_${Date.now()}_${cIdx}`,
              name: row.Nome || row.name || `Cliente ${cIdx + 1}`,
              whatsapp: row.WhatsApp || row.whatsapp || '',
              address: row.Endereco || row.address || '',
              cep: row.CEP || row.cep || '',
              number: String(row.Numero || row.number || ''),
              complement: row.Complemento || row.complement || '',
              birthDate: row.DataNascimento || undefined,
              loyaltyPoints: Number(row.PontosFidelidade || 0),
              creditEnabled: row.CrediarioAtivo === 'Sim' || row.creditEnabled === true,
              creditLimit: Number(row.LimiteCredito || 0),
              currentDebt: Number(row.DividaAtual || 0),
              creditStatus: (row.StatusCredito || 'Liberado') as any
            }));
            updated.customers = newCusts;
            importedCount += newCusts.length;
          }
        }
      }

      const sanitized = sanitizeDB(updated);
      saveDB(sanitized);
      setDb(sanitized);
      toast.success(`Importação concluída! ${importedCount} registros processados.`);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao importar arquivo CSV/ZIP.");
    } finally {
      if (csvImportRef.current) csvImportRef.current.value = '';
    }
  };

  const labelClass = "text-[10px] font-black uppercase text-slate-400 ml-1";
  const inputClass = "w-full border p-3 rounded-2xl text-xs font-bold bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20 transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-6">
        
        {forcedTab === 'Empresa' && (
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Building2 className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Dados da Empresa</h2>
                <p className="text-xs text-slate-400 font-bold">Informações para recibos e documentos</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1"><label className={labelClass}>Nome Fantasia</label><input className={inputClass} value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} /></div>
              <div className="space-y-1"><label className={labelClass}>CNPJ</label><input className={inputClass} value={companyForm.cnpj} onChange={e => setCompanyForm({...companyForm, cnpj: maskCNPJ(e.target.value)})} /></div>
              <div className="space-y-1"><label className={labelClass}>CEP</label><input className={inputClass} value={companyForm.cep} onChange={e => setCompanyForm({...companyForm, cep: maskCEP(e.target.value)})} /></div>
              <div className="space-y-1"><label className={labelClass}>Telefone</label><input className={inputClass} value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: maskPhone(e.target.value)})} /></div>
              <div className="md:col-span-2 space-y-1"><label className={labelClass}>Endereço Completo</label><input className={inputClass} value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} /></div>
            </div>
            <button onClick={handleSaveSettings} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"><Save className="w-5 h-5" /> Salvar Alterações</button>
          </div>
        )}

        {forcedTab === 'PDV' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Layout className="w-6 h-6" /></div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Interface do PDV</h2>
                  <p className="text-xs text-slate-400 font-bold">Personalize o comportamento das vendas</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className={labelClass}>Modo de Operação</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'Varejo', label: 'Varejo Tradicional', icon: <ShoppingBag />, desc: 'Grade de produtos com fotos' },
                    { id: 'Uniproduto', label: 'Foco em Scanner', icon: <Barcode />, desc: 'Busca rápida e bipagem' },
                    { id: 'Serviço', label: 'Prestação de Serviço', icon: <Wrench />, desc: 'Foco em mão de obra' },
                  ].map(mode => (
                    <button 
                      key={mode.id}
                      onClick={() => setCompanyForm({ ...companyForm, posMode: mode.id as any })}
                      className={`p-6 rounded-[2rem] border-2 text-left transition-all ${companyForm.posMode === mode.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                    >
                      <div className={`p-3 rounded-2xl w-fit mb-4 ${companyForm.posMode === mode.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {React.cloneElement(mode.icon as any, { className: 'w-5 h-5' })}
                      </div>
                      <p className="text-xs font-black uppercase mb-1">{mode.label}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className={labelClass}>Atalhos do Cabeçalho (Header)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['PDV', 'Mesas', 'Atendimento', 'Produção', 'Estoque', 'Compras', 'Despesas', 'Dashboard', 'Caixa'].map(id => {
                    const isSelected = companyForm.headerShortcuts?.includes(id);
                    return (
                      <button 
                        key={id}
                        onClick={() => toggleShortcut(id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        <span className="text-[10px] font-black uppercase">{id}</span>
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4 opacity-20" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleSaveSettings} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"><Save className="w-5 h-5" /> Salvar Preferências</button>
            </div>
          </div>
        )}

        {forcedTab === 'Módulos' && (
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Zap className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Módulos do Sistema</h2>
                <p className="text-xs text-slate-400 font-bold">Ative ou desative funcionalidades para simplificar o uso</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'Dashboard', label: 'Dashboard Estratégico', icon: <LayoutDashboard /> },
                { id: 'PDV', label: 'Vendas (PDV)', icon: <Zap /> },
                { id: 'Mesas', label: 'Mesas e Comandas', icon: <TableWithChairs /> },
                { id: 'Produção', label: 'Monitor de Cozinha', icon: <ChefHat /> },
                { id: 'Atendimento', label: 'Monitor de Garçom', icon: <BellRing /> },
                { id: 'Caixa', label: 'Controle de Caixa', icon: <Wallet /> },
                { id: 'Estoque', label: 'Gestão de Estoque', icon: <Boxes /> },
                { id: 'Compras', label: 'Gestão de Compras', icon: <ShoppingBag /> },
                { id: 'Fidelidade', label: 'Programa de Pontos', icon: <Award /> },
                { id: 'Metas', label: 'Metas de Vendedores', icon: <Trophy /> },
                { id: 'Bancos', label: 'Contas Bancárias', icon: <Landmark /> },
                { id: 'PlanoDeContas', label: 'Plano de Contas ERP', icon: <ClipboardList /> },
              ].map(mod => {
                const isEnabled = companyForm.enabledModules?.includes(mod.id);
                return (
                  <button 
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all ${isEnabled ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-slate-50/30 opacity-60'}`}
                  >
                    <div className={`p-3 rounded-2xl ${isEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {React.cloneElement(mod.icon as any, { className: 'w-5 h-5' })}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-black uppercase ${isEnabled ? 'text-indigo-900' : 'text-slate-400'}`}>{mod.label}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{isEnabled ? 'Ativado' : 'Desativado'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={handleSaveSettings} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"><Save className="w-5 h-5" /> Salvar Módulos</button>
          </div>
        )}

        {forcedTab === 'Fidelidade' && (
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Award className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Programa de Fidelidade</h2>
                <p className="text-xs text-slate-400 font-bold">Configure como seus clientes ganham e trocam pontos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-700">Ativar Fidelidade</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Habilita o acúmulo de pontos nas vendas</p>
                  </div>
                  <button 
                    onClick={() => setCompanyForm({ ...companyForm, loyalty: { ...companyForm.loyalty, enabled: !companyForm.loyalty.enabled } })}
                    className={`w-14 h-8 rounded-full transition-all relative ${companyForm.loyalty.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${companyForm.loyalty.enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Pontos por cada R$ 1,00 vendido</label>
                    <input type="number" className={inputClass} value={companyForm.loyalty.pointsPerReal} onChange={e => setCompanyForm({...companyForm, loyalty: {...companyForm.loyalty, pointsPerReal: Number(e.target.value)}})} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Mínimo de pontos para resgate</label>
                    <input type="number" className={inputClass} value={companyForm.loyalty.minPointsToRedeem} onChange={e => setCompanyForm({...companyForm, loyalty: {...companyForm.loyalty, minPointsToRedeem: Number(e.target.value)}})} />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500"></div>
                <p className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Exemplo de Conversão</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] font-black uppercase opacity-40">Venda de R$ 100,00</span>
                    <span className="text-sm font-black text-amber-400">+{100 * companyForm.loyalty.pointsPerReal} Pontos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase opacity-40">Valor de Resgate</span>
                    <span className="text-sm font-black text-emerald-400">R$ {(companyForm.loyalty.minPointsToRedeem / companyForm.loyalty.pointsToCashRatio).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleSaveSettings} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"><Save className="w-5 h-5" /> Salvar Regras de Fidelidade</button>
          </div>
        )}

        {forcedTab === 'Nuvem' && <CloudSyncManager db={db} setDb={setDb} />}

        {forcedTab === 'Dados' && (
          <div className="space-y-6">
            {/* Pontos de Restauração */}
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><History className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Pontos de Restauração</h2>
                    <p className="text-xs text-slate-400 font-bold">Crie backups internos para segurança imediata</p>
                  </div>
                </div>
                <button 
                  onClick={createRestorePoint}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100"
                >
                  <Plus className="w-4 h-4" /> Criar Ponto Agora
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {db.backups?.map(backup => (
                  <div key={backup.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-slate-700 truncate">{backup.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(backup.date).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => restoreFromPoint(backup)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        title="Restaurar este ponto"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteBackup(backup.id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                        title="Excluir backup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!db.backups || db.backups.length === 0) && (
                  <div className="col-span-full py-10 text-center opacity-20 font-black uppercase tracking-widest text-[10px]">
                    Nenhum ponto de restauração criado
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><Sparkles className="w-6 h-6" /></div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Backup Ultra Compacto</h2>
                  <p className="text-xs text-slate-400 font-bold">Reduz o tamanho do arquivo em até 90% usando mapeamento de chaves</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => {
                  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
                  const blob = new Blob([JSON.stringify(db)], { type: 'application/json' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `FASTSELL_BACKUP_${date}.json`;
                  link.click();
                  toast.success("Backup gerado!");
                }} className="p-6 bg-indigo-50 rounded-3xl border border-dashed border-indigo-200 text-center hover:bg-indigo-100 transition-all group">
                  <FileJson className="w-8 h-8 mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Exportar Backup (.JSON)</p>
                  <p className="text-[8px] font-bold text-indigo-400 mt-1 uppercase">Recomendado para segurança total</p>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center hover:bg-slate-100 transition-all group">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Restaurar Dados (.JSON)</p>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Substitui os dados atuais</p>
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportJSON} />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><FileSpreadsheet className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Gestão de Dados (CSV/ZIP)</h2>
                    <p className="text-xs text-slate-400 font-bold">Exporte pastas organizadas ou importe o ZIP completo</p>
                  </div>
                </div>
                <button onClick={() => setSelectedExports(selectedExports.length === exportableItems.length ? [] : exportableItems)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"><ListChecks className="w-4 h-4" /> {selectedExports.length === exportableItems.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Cadastros Base</h3>
                  <div className="space-y-2">
                    {['Produtos', 'Clientes', 'Fornecedores', 'Usuários', 'Categorias', 'Locais de Estoque'].map(id => (
                      <button key={id} onClick={() => setSelectedExports(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedExports.includes(id) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}><span className="text-[10px] font-bold uppercase">{id}</span>{selectedExports.includes(id) ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Movimentações</h3>
                  <div className="space-y-2">
                    {['Vendas', 'Despesas', 'Estoque', 'Caixa', 'Compras', 'Crediário'].map(id => (
                      <button key={id} onClick={() => setSelectedExports(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedExports.includes(id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}><span className="text-[10px] font-bold uppercase">{id}</span>{selectedExports.includes(id) ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Landmark className="w-3.5 h-3.5" /> Estrutura</h3>
                  <div className="space-y-2">
                    {['Plano de Contas', 'Bancos', 'DRE (Estrutura)'].map(id => (
                      <button key={id} onClick={() => setSelectedExports(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedExports.includes(id) ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-100 text-slate-400'}`}><span className="text-[10px] font-bold uppercase">{id}</span>{selectedExports.includes(id) ? <CheckCircle2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <button onClick={handleExportSelectedCSV} disabled={selectedExports.length === 0} className={`flex-1 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${selectedExports.length > 0 ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><FileDown className="w-5 h-5" /> Exportar Selecionados ({selectedExports.length})</button>
                <button onClick={() => csvImportRef.current?.click()} className="flex-1 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"><Upload className="w-5 h-5" /> Importar Pasta (.ZIP) / .CSV</button>
                <input type="file" ref={csvImportRef} className="hidden" accept=".csv,.zip" multiple onChange={handleImportCSVOrZip} />
              </div>
            </div>

            <div className="bg-red-50 p-8 rounded-[3rem] border border-red-100 space-y-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                  <h2 className="text-xl font-black text-red-600 uppercase">Zona de Perigo</h2>
                  <p className="text-[10px] text-red-400 font-bold uppercase">Ações irreversíveis de limpeza de dados</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-[2rem] border border-red-100 flex flex-col gap-4">
                  <div><p className="text-xs font-black text-slate-700 uppercase">Limpar Dados do Sistema</p><p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">Escolha áreas específicas para retornar ao zero.</p></div>
                  <button onClick={() => setIsCleanupModalOpen(true)} className="w-full py-3 bg-white border-2 border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Limpar Dados</button>
                </div>
                <div className="p-6 bg-white rounded-[2rem] border border-red-100 flex flex-col gap-4">
                  <div><p className="text-xs font-black text-red-600 uppercase">Reset Total (Fábrica)</p><p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">Apaga TUDO e restaura os padrões de fábrica.</p></div>
                  <button onClick={() => { if(window.confirm('ATENÇÃO: Isso apagará todos os seus dados. Continuar?')) { resetDB(); } }} className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-red-700 shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Resetar Tudo</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isCleanupModalOpen} onClose={() => setIsCleanupModalOpen(false)} title="Limpeza Seletiva de Dados" maxWidth="max-w-4xl">
        <div className="space-y-8">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /><p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">Atenção: Se você não tiver um backup exportado (JSON), os dados selecionados serão perdidos definitivamente.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2"><div className="w-1 h-4 bg-indigo-500 rounded-full" /> Movimentações</h3>
              <div className="grid grid-cols-1 gap-2">
                {['sales', 'expenses', 'stockHistory', 'cashier', 'purchases', 'credit'].map(key => (
                  <button key={key} onClick={() => setCleanupOptions({...cleanupOptions, [key]: !cleanupOptions[key]})} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${cleanupOptions[key] ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}><span className="text-[10px] font-black uppercase">{key}</span>{cleanupOptions[key] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-6 border-t"><button onClick={() => toast.success("Limpando...")} className="flex-1 bg-red-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-3"><Trash2 className="w-5 h-5" /> Confirmar Limpeza Definitiva</button><button onClick={() => setIsCleanupModalOpen(false)} className="px-10 bg-slate-100 text-slate-400 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button></div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsView;