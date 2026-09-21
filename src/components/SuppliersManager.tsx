"use client";

import React, { useState } from 'react';
import { Trash2, Truck, Edit3, User, Search, X } from 'lucide-react';
import { Database, Supplier } from '../types';

interface SuppliersManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (supplier: Supplier) => void;
}

const SuppliersManager: React.FC<SuppliersManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const filteredSuppliers = db.suppliers.filter(s => 
    s.name.toLowerCase().includes(localSearch.toLowerCase()) || 
    s.whatsapp.includes(localSearch)
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
         <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600">Fornecedores</h2>
         <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <div className="w-48 md:w-64 relative animate-in slide-in-from-right-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input autoFocus type="text" className="w-full pl-9 pr-8 py-2 bg-slate-50 border rounded-xl text-[10px] font-bold outline-none focus:ring-2 ring-indigo-500/20" placeholder="Buscar..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
                <button onClick={() => { setIsSearchOpen(false); setLocalSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"><Search className="w-4 h-4" /></button>
            )}
            <button onClick={onAdd} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100">+ Novo Fornecedor</button>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {filteredSuppliers.map((s: Supplier) => (
           <div key={s.id} className="bg-white p-5 rounded-[2.5rem] border shadow-sm flex flex-col relative group hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start mb-4"><div className="p-3 bg-slate-50 rounded-2xl"><Truck className="w-5 h-5 text-indigo-400" /></div><div className="flex gap-1"><button className="p-2 text-indigo-300 hover:text-indigo-50" onClick={() => onEdit(s)}><Edit3 className="w-4 h-4"/></button><button className="p-2 text-red-300 hover:text-red-500" onClick={()=>setDb({...db, suppliers: db.suppliers.filter((x: Supplier)=>x.id!==s.id)})}><Trash2 className="w-4 h-4"/></button></div></div>
              <p className="font-black text-sm mb-1 uppercase">{s.name}</p>
              {s.responsible && (<p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mb-1"><User className="w-3 h-3" /> {s.responsible}</p>)}
              <p className="text-[10px] text-emerald-600 font-bold">{s.whatsapp}</p>
           </div>
         ))}
         {filteredSuppliers.length === 0 && (<div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhum fornecedor cadastrado</div>)}
      </div>
    </div>
  );
};

export default SuppliersManager;