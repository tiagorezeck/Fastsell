"use client";

import React, { useState } from 'react';
import { Trash2, Edit3, Wrench, Search, X } from 'lucide-react';
import { Database, Product } from '../types';

interface ServicesManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (service: Product) => void;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');

  const filteredServices = db.products.filter(p => 
    p.type === 'Serviço' && 
    (p.name.toLowerCase().includes(localSearch.toLowerCase()) || p.barcode.includes(localSearch)) &&
    (catFilter === 'Todas' || p.category === catFilter)
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Wrench className="w-6 h-6" /></div>
            <div><h2 className="text-lg font-black uppercase tracking-tight">Catálogo de Serviços</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{filteredServices.length} serviços cadastrados</p></div>
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
            <select className="bg-slate-50 border-none p-3 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-indigo-500/20" value={catFilter} onChange={e => setCatFilter(e.target.value)}><option value="Todas">Todas Categorias</option>{db.categories.filter(c => c.type === 'Serviço').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
            <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Novo Serviço</button>
         </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm overflow-x-auto">
         <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
              <tr><th className="p-6">Serviço</th><th className="p-6">Categoria</th><th className="p-6">Preço Venda</th><th className="p-6 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y">
              {filteredServices.map((s)=>(
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center"><Wrench className="w-5 h-5 text-amber-500" /></div><span className="font-black uppercase text-xs">{s.name}</span></div></td>
                  <td className="p-6"><span className="text-[9px] font-bold text-slate-400 uppercase">{s.category}</span></td>
                  <td className="p-6 font-black text-indigo-600 text-sm">R$ {Number(s.price || 0).toFixed(2)}</td>
                  <td className="p-6 text-right space-x-1"><button className="p-2.5 text-indigo-400 hover:bg-indigo-50 rounded-2xl transition-all" onClick={() => onEdit(s)}><Edit3 className="w-4 h-4"/></button><button className="p-2.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all" onClick={() => { if(window.confirm('Excluir este serviço?')) setDb({...db, products: db.products.filter(x => x.id !== s.id)}); }}><Trash2 className="w-4 h-4"/></button></td>
                </tr>
              ))}
              {filteredServices.length === 0 && (<tr><td colSpan={4} className="p-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhum serviço encontrado</td></tr>)}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default ServicesManager;