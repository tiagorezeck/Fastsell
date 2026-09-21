"use client";

import React, { useState } from 'react';
import { Tags, X, Zap, ZapOff, Edit3, ShoppingBag, Wrench, Search } from 'lucide-react';
import { Database, Category } from '../types';

interface CategoriesManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (category: Category) => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Venda' | 'Serviço'>('Todos');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  
  const categories = Array.isArray(db.categories) ? db.categories : [];
  
  const filteredCategories = categories.filter(c => {
    const matchesSearch = c && c.name && c.name.toLowerCase().includes(localSearch.toLowerCase());
    const matchesType = typeFilter === 'Todos' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Tags className="w-6 h-6" /></div>
          <div><h2 className="text-lg font-black uppercase tracking-tight">Categorias</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{categories.length} categorias no total</p></div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {isSearchOpen ? (
            <div className="flex-1 md:w-64 relative animate-in slide-in-from-right-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input autoFocus type="text" className="w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20" placeholder="Buscar..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
              <button onClick={() => { setIsSearchOpen(false); setLocalSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><Search className="w-5 h-5" /></button>
          )}
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border">
            {['Todos', 'Venda', 'Serviço'].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t as any)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${typeFilter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t}s</button>
            ))}
          </div>
          <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Nova Categoria</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-[2rem] border shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${c.type === 'Serviço' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>{c.type === 'Serviço' ? <Wrench className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}</div><div className="flex flex-col"><span className="text-xs font-black uppercase tracking-tight">{c.name}</span><div className="flex items-center gap-2"><span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${c.type === 'Serviço' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{c.type}</span><span className={`text-[7px] font-black uppercase ${c.showInPOS ? 'text-emerald-500' : 'text-slate-300'}`}>{c.showInPOS ? 'PDV Ativo' : 'Oculto'}</span></div></div></div>
            <div className="flex items-center gap-1"><button onClick={() => setDb({...db, categories: categories.map(x => x.id === c.id ? {...x, showInPOS: !x.showInPOS} : x)})} className={`p-2 rounded-xl transition-all ${c.showInPOS ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:bg-slate-50'}`}>{c.showInPOS ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}</button><button onClick={() => onEdit(c)} className="p-2 text-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 className="w-4 h-4"/></button><button onClick={() => { if(window.confirm(`Remover categoria ${c.name}?`)) setDb({...db, categories: categories.filter(x => x.id !== c.id)}); }} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="w-4 h-4"/></button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesManager;