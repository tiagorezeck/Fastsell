"use client";

import React from 'react';
import { Trash2, Edit3, UserCheck, User } from 'lucide-react';
import { Database, User as UserType } from '../types';

interface SellersManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (seller: UserType) => void;
}

const SellersManager: React.FC<SellersManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const sellers = db.users.filter(u => u.role === 'Vendedor');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
               <UserCheck className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-lg font-black uppercase tracking-tight">Time de Vendas</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sellers.length} vendedores ativos</p>
            </div>
         </div>
         <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Novo Vendedor</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {sellers.map((s) => (
           <div key={s.id} className="bg-white p-5 rounded-[2rem] border shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 shadow-inner">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} className="w-full h-full object-cover" alt={s.name} />
                    ) : (
                      <User className="w-6 h-6 text-slate-300" />
                    )}
                 </div>
                 <div>
                    <p className="font-black text-sm mb-0.5 uppercase leading-tight">{s.name}</p>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                        ID: {s.code} • {s.sector || 'Geral'}
                      </span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                 <button 
                   className="p-2 text-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" 
                   onClick={() => onEdit(s)}
                 >
                   <Edit3 className="w-4 h-4"/>
                 </button>
                 <button 
                   className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                   onClick={() => {
                     if(window.confirm(`Deseja remover o vendedor ${s.name}?`)) {
                       setDb({...db, users: db.users.filter(x => x.id !== s.id)});
                     }
                   }}
                 >
                   <Trash2 className="w-4 h-4"/>
                 </button>
              </div>
           </div>
         ))}
         {sellers.length === 0 && (
           <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">
             Nenhum vendedor cadastrado
           </div>
         )}
      </div>
    </div>
  );
};

export default SellersManager;