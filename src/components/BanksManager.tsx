"use client";

import React from 'react';
import { Landmark, Trash2, Edit3 } from 'lucide-react';
import { Database, Bank } from '../types';

interface BanksManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (bank: Bank) => void;
}

const BanksManager: React.FC<BanksManagerProps> = ({ db, setDb, onAdd, onEdit }) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
       <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
             <Landmark className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tight">Contas Bancárias</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Disponibilidades</p>
          </div>
       </div>
       <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Nova Conta</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       {db.banks.map((b) => (
         <div key={b.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col group hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">
                  <Landmark className="w-5 h-5" />
               </div>
               <div className="flex gap-1">
                 <button className="p-2 text-indigo-300 hover:text-indigo-500" onClick={() => onEdit(b)}><Edit3 className="w-4 h-4"/></button>
                 <button className="p-2 text-red-300 hover:text-red-500" onClick={()=>setDb({...db, banks: db.banks.filter(x=>x.id!==b.id)})}><Trash2 className="w-4 h-4"/></button>
               </div>
            </div>
            <p className="font-black text-sm mb-1 uppercase">{b.name}</p>
            <p className="text-[10px] text-slate-400 font-bold mb-4">Ag: {b.agency} | CC: {b.account}</p>
            <div className="mt-auto pt-4 border-t border-slate-50">
               <p className="text-[8px] font-black text-slate-400 uppercase">Saldo Inicial</p>
               <p className="text-lg font-black text-indigo-600">R$ {b.initialBalance.toFixed(2)}</p>
            </div>
         </div>
       ))}
    </div>
  </div>
);

export default BanksManager;