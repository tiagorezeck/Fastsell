"use client";

import React from 'react';
import { Building2, Trash2, Edit3, MapPin } from 'lucide-react';
import { Database, Company } from '../types';

interface CompaniesManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (company: Company) => void;
}

const CompaniesManager: React.FC<CompaniesManagerProps> = ({ db, setDb, onAdd, onEdit }) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
       <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
             <Building2 className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tight">Unidades de Negócio</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sede e Filiais</p>
          </div>
       </div>
       <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Nova Unidade</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {db.companies.map((c) => (
         <div key={c.id} className="bg-white p-8 rounded-[3rem] border shadow-sm flex flex-col relative group hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start mb-6">
               <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${c.type === 'Sede' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {c.type}
               </div>
               <div className="flex gap-1">
                 <button className="p-2 text-indigo-300 hover:text-indigo-500" onClick={() => onEdit(c)}><Edit3 className="w-4 h-4"/></button>
                 <button className="p-2 text-red-300 hover:text-red-500" onClick={()=>setDb({...db, companies: db.companies.filter(x=>x.id!==c.id)})}><Trash2 className="w-4 h-4"/></button>
               </div>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">{c.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 mb-6">CNPJ: {c.cnpj}</p>
            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
               <MapPin className="w-4 h-4 text-indigo-400" />
               {c.address}
            </div>
         </div>
       ))}
    </div>
  </div>
);

export default CompaniesManager;