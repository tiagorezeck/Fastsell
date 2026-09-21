"use client";

import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { Database, Expense } from '../types';

interface ExpensesManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
}

const ExpensesManager: React.FC<ExpensesManagerProps> = ({ db, setDb, onAdd, onEdit }) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
       <h2 className="text-xs font-black uppercase tracking-widest text-red-600">Saídas e Despesas</h2>
       <button onClick={onAdd} className="bg-red-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100">+ Lançar Gasto</button>
    </div>
    <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
       <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
            <tr><th className="p-4">Descrição</th><th className="p-4">Data</th><th className="p-4">Valor</th><th className="p-4 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {db.expenses.slice().reverse().map((e: Expense)=>(
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold">{e.description}</td>
                <td className="p-4 text-slate-400">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 font-black text-red-600 text-sm">- R$ {e.amount.toFixed(2)}</td>
                <td className="p-4 text-right space-x-2">
                  <button className="p-2 text-indigo-300 hover:text-indigo-500 transition-all" onClick={() => onEdit(e)}>
                    <Edit3 className="w-4 h-4"/>
                  </button>
                  <button className="p-2 text-slate-300 hover:text-red-500 transition-all" onClick={()=>setDb({...db, expenses: db.expenses.filter((x: Expense)=>x.id!==e.id)})}>
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
            {db.expenses.length === 0 && <tr><td colSpan={4} className="p-10 text-center opacity-20 font-black uppercase tracking-widest">Sem despesas registradas</td></tr>}
          </tbody>
       </table>
    </div>
  </div>
);

export default ExpensesManager;