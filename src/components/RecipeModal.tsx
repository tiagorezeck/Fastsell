"use client";

import React, { useMemo, useState } from 'react';
import { 
  X, Plus, Trash2, Search, ClipboardList, Utensils, 
  FileText, Timer, Users, TrendingUp, Calculator, Package, PlusCircle, Minus, ArrowRightLeft
} from 'lucide-react';
import Modal from './Modal';
import { Database, Product, RecipeItem } from '../types';
import { toast } from 'react-hot-toast';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: Database;
  formData: any;
  setFormData: (data: any) => void;
  isDarkMode?: boolean;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, db, formData, setFormData, isDarkMode = false }) => {
  const [ingSearch, setIngSearch] = useState('');

  const systemFinancials = useMemo(() => {
    const totalRevenue = db.sales.reduce((a, b) => a + b.total, 0) || 1;
    const totalExpenses = db.expenses.reduce((a, b) => a + b.amount, 0);
    const expenseRatio = totalExpenses / totalRevenue;
    return { expenseRatio };
  }, [db.sales, db.expenses]);

  const calculateIngredientCost = (ing: RecipeItem) => {
    const product = db.products.find(p => p.id === ing.productId);
    if (!product) return 0;

    let costPerBaseUnit = product.costPrice;
    let quantityInBaseUnit = ing.netQuantity;

    // Lógica de Conversão
    if (ing.recipeUnit !== product.unit) {
      // Caso 1: Massa (KG <-> GR)
      if (product.unit === 'KG' && ing.recipeUnit === 'GR') quantityInBaseUnit = ing.netQuantity / 1000;
      else if (product.unit === 'GR' && ing.recipeUnit === 'KG') quantityInBaseUnit = ing.netQuantity * 1000;
      
      // Caso 2: Volume (L <-> ML)
      else if (product.unit === 'L' && ing.recipeUnit === 'ML') quantityInBaseUnit = ing.netQuantity / 1000;
      else if (product.unit === 'ML' && ing.recipeUnit === 'L') quantityInBaseUnit = ing.netQuantity * 1000;

      // Caso 3: Particionamento de Unidade (UN -> GR/ML)
      else if (['UN', 'CX', 'DZ'].includes(product.unit) && product.contentPerUnit) {
        const totalContent = product.contentPerUnit;
        if (ing.recipeUnit === product.contentUnit) {
          quantityInBaseUnit = ing.netQuantity / totalContent;
        }
      }
    }

    const fc = product.correctionFactor || 1;
    return (quantityInBaseUnit * fc) * costPerBaseUnit;
  };

  const totalRecipeCost = useMemo(() => {
    if (!formData.recipe) return 0;
    return formData.recipe.reduce((acc: number, ing: RecipeItem) => acc + calculateIngredientCost(ing), 0);
  }, [formData.recipe, db.products]);

  const markupFactor = useMemo(() => {
    const profitMargin = (formData.desiredProfitMargin || 0) / 100;
    const expenseRatio = systemFinancials.expenseRatio;
    const divisor = 1 - (expenseRatio + profitMargin);
    if (divisor <= 0) return 0;
    return 1 / divisor;
  }, [systemFinancials.expenseRatio, formData.desiredProfitMargin]);

  const suggestedPrice = totalRecipeCost * (markupFactor || 3);

  const addIngredient = (productId: string) => {
    const product = db.products.find(p => p.id === productId);
    const recipe = formData.recipe || [];
    if (recipe.find((r: any) => r.productId === productId)) {
      toast.error("Insumo já adicionado!");
      return;
    }
    setFormData({
      ...formData,
      recipe: [...recipe, { productId, netQuantity: 1, recipeUnit: product?.unit || 'UN' }]
    });
    setIngSearch('');
  };

  const updateIngredient = (productId: string, updates: Partial<RecipeItem>) => {
    setFormData({
      ...formData,
      recipe: formData.recipe.map((r: RecipeItem) => r.productId === productId ? { ...r, ...updates } : r)
    });
  };

  const labelClass = "text-[10px] font-black uppercase text-slate-400 ml-1";
  const inputClass = "w-full border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20 transition-all";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Engenharia de Produção / Ficha Técnica" maxWidth="max-w-6xl" isDarkMode={isDarkMode}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800/80 p-6 rounded-[2.5rem] border-2 border-orange-100 dark:border-orange-900/40 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 dark:bg-orange-950/50 rounded-2xl text-orange-600 dark:text-orange-400"><Utensils className="w-6 h-6" /></div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">Ingredientes</h3>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white p-3 pl-10 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-orange-500/20" placeholder="Adicionar Insumo..." value={ingSearch} onChange={e => setIngSearch(e.target.value)} />
                {ingSearch && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    {db.products.filter(p => (p.type === 'Insumo' || p.type === 'Revenda') && p.name.toLowerCase().includes(ingSearch.toLowerCase())).slice(0, 5).map(p => (
                      <button key={p.id} onClick={() => addIngredient(p.id)} className="w-full text-left p-4 hover:bg-orange-50 dark:hover:bg-slate-700 flex items-center justify-between border-b dark:border-slate-700 last:border-none group">
                        <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">{p.name}</span><span className="text-[8px] font-bold text-slate-400 uppercase">Estoque em: {p.unit}</span></div>
                        <PlusCircle className="w-5 h-5 text-orange-300 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {formData.recipe?.map((ing: RecipeItem, idx: number) => {
                const product = db.products.find(p => p.id === ing.productId);
                const availableUnits = ['UN', 'KG', 'GR', 'L', 'ML'];
                if (product?.contentUnit && !availableUnits.includes(product.contentUnit)) availableUnits.push(product.contentUnit);

                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-orange-200 dark:hover:border-orange-800 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 truncate">{product?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Custo: R$ {calculateIngredientCost(ing).toFixed(2)}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-[8px] font-bold text-indigo-400 uppercase">Base: {product?.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                        <button onClick={() => updateIngredient(ing.productId, { netQuantity: Math.max(0, ing.netQuantity - 1) })} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg text-slate-400"><Minus className="w-4 h-4" /></button>
                        <input type="number" className="w-14 text-center font-black text-xs outline-none bg-transparent text-slate-900 dark:text-white" value={ing.netQuantity} onChange={e => updateIngredient(ing.productId, { netQuantity: Number(e.target.value) })} />
                        <button onClick={() => updateIngredient(ing.productId, { netQuantity: ing.netQuantity + 1 })} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg text-slate-400"><Plus className="w-4 h-4" /></button>
                      </div>
                      <select 
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white p-2 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-orange-500/20"
                        value={ing.recipeUnit}
                        onChange={e => updateIngredient(ing.productId, { recipeUnit: e.target.value as any })}
                      >
                        {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <button onClick={() => setFormData({...formData, recipe: formData.recipe.filter((r:any) => r.productId !== ing.productId)})} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400"><FileText className="w-6 h-6" /></div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">Modo de Preparo</h3>
            </div>
            <textarea className={`${inputClass} h-40 resize-none`} placeholder="Descreva o passo a passo..." value={formData.preparationMode || ''} onChange={e => setFormData({...formData, preparationMode: e.target.value})} />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className={labelClass}>Tempo (Min)</label><div className="relative"><Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="number" className={`${inputClass} pl-10`} value={formData.preparationTime || ''} onChange={e => setFormData({...formData, preparationTime: Number(e.target.value)})} /></div></div>
              <div className="space-y-1"><label className={labelClass}>Porções</label><div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="number" className={`${inputClass} pl-10`} value={formData.portions || 1} onChange={e => setFormData({...formData, portions: Number(e.target.value)})} /></div></div>
            </div>
          </div>

          <div className="bg-indigo-950 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden space-y-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
            <div className="flex justify-between items-center">
              <div><p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Custo Total</p><p className="text-4xl font-black">R$ {totalRecipeCost.toFixed(2)}</p></div>
              <div className="text-right"><p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Custo p/ Porção</p><p className="text-xl font-black text-emerald-400">R$ {(totalRecipeCost / (formData.portions || 1)).toFixed(2)}</p></div>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-400" /><span className="text-[11px] font-black uppercase tracking-widest">Markup Inteligente</span></div>
                <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10">
                  <span className="text-[9px] font-black uppercase px-2">Lucro %:</span>
                  <input type="number" className="w-14 bg-white text-indigo-950 rounded-xl p-2 text-center font-black text-xs outline-none" value={formData.desiredProfitMargin || 0} onChange={e => setFormData({...formData, desiredProfitMargin: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center"><span className="text-[9px] font-bold opacity-50 uppercase">Despesas do Sistema</span><span className="text-xs font-black text-indigo-300">{(systemFinancials.expenseRatio * 100).toFixed(1)}%</span></div>
                <div className="bg-emerald-500/10 p-6 rounded-[2rem] border border-emerald-500/20 flex justify-between items-center"><span className="text-[10px] font-black uppercase text-emerald-400">Preço Sugerido</span><span className="text-2xl font-black text-emerald-400">R$ {suggestedPrice.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">Confirmar Ficha Técnica</button>
        </div>
      </div>
    </Modal>
  );
};

export default RecipeModal;