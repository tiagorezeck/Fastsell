"use client";

import React, { useState } from 'react';
import { Trash2, Edit3, Package, Plus, Minus, Save, X, ChefHat, Info, Filter, Barcode, Calendar, Hash, ChevronDown, ChevronRight, ShoppingCart, AlertCircle, Search, CheckCircle2 } from 'lucide-react';
import { Database, Product, StockBatch } from '../types';
import { toast } from 'react-hot-toast';

interface ProductsManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onOpenScanner: () => void;
  onStartPurchase: (items: any[], supplierId?: string) => void;
  searchQuery: string;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({ db, setDb, onAdd, onEdit, onOpenScanner, onStartPurchase }) => {
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState(0);
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Insumo' | 'Revenda'>('Todos');
  const [catFilter, setCatFilter] = useState('Todas');
  const [showOnlyShortages, setShowOnlyShortages] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  
  // Estado para seleção múltipla de compra
  const [selectedForPurchase, setSelectedForPurchase] = useState<string[]>([]);

  const filteredProducts = db.products.filter(p => {
    if (p.type === 'Produzido' || p.type === 'Serviço') return false;
    const matchesSearch = p.name.toLowerCase().includes(localSearch.toLowerCase()) || p.barcode.includes(localSearch);
    const matchesType = typeFilter === 'Todos' || p.type === typeFilter;
    const matchesCat = catFilter === 'Todas' || p.category === catFilter;
    const isShortage = p.stock <= (p.minStock || 0);
    const matchesShortage = !showOnlyShortages || isShortage;
    return matchesSearch && matchesType && matchesShortage && matchesCat;
  });

  const togglePurchaseSelection = (productId: string) => {
    setSelectedForPurchase(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleGeneratePurchase = () => {
    const itemsToBuy = selectedForPurchase.map(id => {
      const p = db.products.find(prod => prod.id === id);
      return {
        productId: id,
        quantity: Math.max(1, (p?.minStock || 0) - (p?.stock || 0)),
        cost: p?.costPrice || 0
      };
    });

    // Tenta pegar o fornecedor do primeiro item se houver
    const firstItem = db.products.find(p => p.id === selectedForPurchase[0]);
    onStartPurchase(itemsToBuy, firstItem?.supplierId);
    setSelectedForPurchase([]);
    toast.success(`${itemsToBuy.length} itens enviados para o pedido de compra!`);
  };

  const handleQuickStock = (product: Product) => {
    const newStock = product.stock + adjustValue;
    if (newStock < 0) { toast.error("Estoque não pode ser negativo!"); return; }
    let updatedBatches = [...(product.batches || [])];
    if (adjustValue > 0) {
      updatedBatches.push({ id: `B${Date.now()}`, batchNumber: 'AJUSTE', entryDate: new Date().toISOString(), expirationDate: product.expirationDate, quantity: adjustValue, costPrice: product.costPrice });
    } else {
      let remaining = Math.abs(adjustValue);
      updatedBatches = updatedBatches.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()).map(b => {
        if (remaining <= 0) return b;
        const take = Math.min(b.quantity, remaining);
        remaining -= take;
        return { ...b, quantity: b.quantity - take };
      }).filter(b => b.quantity > 0);
    }
    setDb({ ...db, products: db.products.map(p => p.id === product.id ? { ...p, batches: updatedBatches, stock: updatedBatches.reduce((acc, b) => acc + b.quantity, 0) } : p), stockMovements: [...db.stockMovements, { id: `M${Date.now()}`, productId: product.id, direction: adjustValue > 0 ? 'Entrada' : 'Saída', natureId: 'nat_ajuste', quantity: Math.abs(adjustValue), reason: 'Ajuste Rápido', date: new Date().toISOString() } as any] });
    setAdjustingId(null); setAdjustValue(0); toast.success("Estoque atualizado!");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 relative">
      <div className="bg-white p-4 md:p-6 rounded-[2rem] border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Package className="w-6 h-6" /></div>
            <div><h2 className="text-lg font-black uppercase tracking-tight">Gestão de Estoque</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Insumos e Revenda</p></div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {isSearchOpen ? (
              <div className="flex-1 lg:w-64 relative animate-in slide-in-from-right-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input autoFocus type="text" className="w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20" placeholder="Buscar..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
                <button onClick={() => { setIsSearchOpen(false); setLocalSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><Search className="w-5 h-5" /></button>
            )}
            <button onClick={onOpenScanner} className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"><Barcode className="w-4 h-4" /> Scanner</button>
            <button onClick={onAdd} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"><Plus className="w-4 h-4" /> Novo Item</button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 pt-4 border-t border-slate-50">
          <button onClick={() => setShowOnlyShortages(!showOnlyShortages)} className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${showOnlyShortages ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-100' : 'bg-white border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-500'}`}><AlertCircle className="w-3.5 h-3.5" /> {showOnlyShortages ? 'Filtrando Reposição' : 'Ver Reposição'}</button>
          <select className="w-full md:w-48 bg-slate-50 border-none p-2.5 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-indigo-500/20" value={catFilter} onChange={e => setCatFilter(e.target.value)}><option value="Todas">Todas Categorias</option>{db.categories.filter(c => c.type === 'Venda').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
          <div className="flex-1 flex gap-1 bg-slate-50 p-1 rounded-xl border w-full overflow-x-auto no-scrollbar">
            {['Todos', 'Insumo', 'Revenda'].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t as any)} className={`flex-1 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${typeFilter === t ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm overflow-x-auto">
         <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
              <tr><th className="p-6">Produto</th><th className="p-6">Estoque Atual</th><th className="p-6">Mínimo</th><th className="p-6">Preço Custo</th><th className="p-6 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((p)=>{
                const isShortage = p.stock <= (p.minStock || 0);
                const isSelected = selectedForPurchase.includes(p.id);
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group ${isShortage ? 'bg-red-50/30' : ''} ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                    <td className="p-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">{p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /> : <Package className="w-4 h-4 text-slate-300" />}</div><div className="flex flex-col"><span className="font-black uppercase text-xs">{p.name}</span><span className="text-[7px] font-bold text-slate-400 uppercase">{p.type} • {p.category}</span></div></div></td>
                    <td className="p-6">{adjustingId === p.id ? (<div className="flex items-center gap-2 animate-in zoom-in duration-200"><button onClick={() => setAdjustValue(v => v - 1)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Minus className="w-3 h-3"/></button><input type="number" className="w-16 border-none bg-slate-100 rounded-xl p-1.5 text-center font-black text-xs outline-none" value={p.stock + adjustValue} onFocus={(e) => e.target.select()} onChange={(e) => setAdjustValue((e.target.value === '' ? 0 : Number(e.target.value)) - p.stock)} /><button onClick={() => setAdjustValue(v => v + 1)} className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-100"><Plus className="w-3 h-3"/></button><button onClick={() => handleQuickStock(p)} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Save className="w-3 h-3"/></button><button onClick={() => setAdjustingId(null)} className="p-1.5 bg-slate-200 text-slate-500 rounded-lg hover:bg-slate-300"><X className="w-3 h-3"/></button></div>) : (<div className="flex items-center gap-3"><span className={`font-black text-sm ${isShortage ? 'text-red-500' : 'text-slate-700'}`}>{p.stock}</span><button onClick={() => { setAdjustingId(p.id); setAdjustValue(0); }} className="opacity-0 group-hover:opacity-100 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"><Plus className="w-3 h-3" /></button></div>)}</td>
                    <td className="p-6 font-bold text-slate-400">{p.minStock || 0}</td>
                    <td className="p-6 font-black text-indigo-600 text-sm">R$ {Number(p.costPrice || 0).toFixed(2)}</td>
                    <td className="p-6 text-right space-x-1">
                      {isShortage && (
                        <button 
                          onClick={() => togglePurchaseSelection(p.id)} 
                          className={`p-2.5 rounded-2xl transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`} 
                          title={isSelected ? "Remover da lista de compra" : "Marcar para compra"}
                        >
                          {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </button>
                      )}
                      <button className="p-2.5 text-indigo-400 hover:bg-indigo-50 rounded-2xl transition-all" onClick={() => onEdit(p)}><Edit3 className="w-4 h-4"/></button>
                      <button className="p-2.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all" onClick={() => { if(window.confirm('Excluir este item?')) setDb({...db, products: db.products.filter(x => x.id !== p.id)}); }}><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
         </table>
      </div>

      {/* Botão Flutuante de Geração de Pedido */}
      {selectedForPurchase.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
          <button 
            onClick={handleGeneratePurchase}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3 border-4 border-white"
          >
            <div className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center text-[10px]">
              {selectedForPurchase.length}
            </div>
            Gerar Pedido de Compra
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;