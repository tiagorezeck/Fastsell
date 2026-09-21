"use client";

import React, { useState } from 'react';
import { Trash2, Smartphone, Edit3, Award, Search, X } from 'lucide-react';
import { Database, Customer } from '../types';

interface CustomersManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
}

const CustomersManager: React.FC<CustomersManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const filteredCustomers = db.customers.filter(c => 
    c.name.toLowerCase().includes(localSearch.toLowerCase()) || 
    c.whatsapp.includes(localSearch)
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
         <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600">Clientes Cadastrados</h2>
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
            <button onClick={onAdd} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">+ Novo Cliente</button>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filteredCustomers.map((c: Customer) => (
           <div key={c.id} className="bg-white p-5 rounded-[2rem] border shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm"> {c.name[0]} </div>
              <div className="flex-1 min-w-0">
                 <p className="font-black text-sm leading-tight mb-1 truncate">{c.name}</p>
                 <p className="text-[10px] text-emerald-600 font-bold mb-2 flex items-center gap-1.5"><Smartphone className="w-3 h-3"/> {c.whatsapp}</p>
                 <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg w-fit"><Award className="w-3 h-3" /><span className="text-[9px] font-black uppercase">{c.loyaltyPoints || 0} Pontos</span></div>
              </div>
              <div className="flex flex-col gap-1"><button className="p-2 text-indigo-300 hover:text-indigo-500 transition-all" onClick={() => onEdit(c)}><Edit3 className="w-4 h-4"/></button><button className="p-2 text-red-300 hover:text-red-500 transition-all" onClick={()=>setDb({...db, customers: db.customers.filter((x: Customer)=>x.id!==c.id)})}><Trash2 className="w-4 h-4"/></button></div>
           </div>
         ))}
         {filteredCustomers.length === 0 && (<div className="col-span-full py-10 text-center opacity-20 font-black uppercase tracking-widest">Nenhum cliente encontrado</div>)}
      </div>
    </div>
  );
};

export default CustomersManager;