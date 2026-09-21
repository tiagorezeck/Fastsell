"use client";

import React from 'react';
import { ClipboardList, Trash2, Edit3 } from 'lucide-react';
import { Database, CostCenter } from '../types';

interface CostCentersManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (cc: CostCenter) => void;
}

const CostCentersManager: React.FC<CostCentersManagerProps> = ({ db, setDb, onAdd, onEdit }) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
       <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
             <ClipboardList className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tight">Centros de Custo</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Classificação Gerencial</p>
          </div>
       </div>
       <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Novo Centro</button>
    </div>
    <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
       <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
            <tr><th className="p-6">Código</th><th className="p-6">Nome do Centro de Custo</th><th className="p-6 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {db.costCenters.map((cc)=>(
              <tr key={cc.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-6 font-mono font-black text-indigo-600">{cc.code}</td>
                <td className="p-6 font-black uppercase">{cc.name}</td>
                <td className="p-6 text-right space-x-2">
                  <button className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-xl" onClick={() => onEdit(cc)}><Edit3 className="w-4 h-4"/></button>
                  <button className="p-2 text-red-300 hover:text-red-500" onClick={()=>setDb({...db, costCenters: db.costCenters.filter(x=>x.id!==cc.id)})}><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
       </table>
    </div>
  </div>
);

export default CostCentersManager;