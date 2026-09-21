"use client";

import React from 'react';
import { Trash2, Edit3, UserCheck, Briefcase, User, Shield, Calendar, BadgeCheck, XCircle } from 'lucide-react';
import { Database, User as UserType } from '../types';

interface UsersManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (user: UserType) => void;
}

const UsersManager: React.FC<UsersManagerProps> = ({ db, setDb, onAdd, onEdit }) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
       <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
             <Shield className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tight">Gestão de Usuários</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{db.users.length} colaboradores cadastrados</p>
          </div>
       </div>
       <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Novo Usuário</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {db.users.map((u) => (
         <div key={u.id} className={`bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col relative group hover:border-indigo-200 transition-all ${u.status === 'Inativo' ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 shadow-inner">
                     {u.imageUrl ? (
                       <img src={u.imageUrl} className="w-full h-full object-cover" alt={u.name} />
                     ) : (
                       <User className="w-8 h-8 text-slate-300" />
                     )}
                  </div>
                  <div>
                     <p className="font-black text-base mb-0.5 uppercase leading-tight text-slate-800">{u.name}</p>
                     <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${u.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                           {u.status}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">ID: {u.code}</span>
                     </div>
                  </div>
               </div>
               <div className="flex gap-1">
                  <button className="p-2 text-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" onClick={() => onEdit(u)}><Edit3 className="w-4 h-4"/></button>
                  <button className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" onClick={() => { if(window.confirm(`Remover ${u.name}?`)) setDb({...db, users: db.users.filter(x => x.id !== u.id)}); }}><Trash2 className="w-4 h-4"/></button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Cargo / Área</p>
                  <p className="text-[10px] font-black text-slate-700 uppercase truncate">{u.role} • {u.area}</p>
               </div>
               <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Contratação</p>
                  <p className="text-[10px] font-black text-slate-700 uppercase">{u.contractType} • {u.workload}</p>
               </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase">Entrada: {u.entryDate ? new Date(u.entryDate).toLocaleDateString('pt-BR') : '-'}</span>
               </div>
               <div className="flex items-center gap-1.5 text-indigo-600">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{u.function}</span>
               </div>
            </div>
         </div>
       ))}
       {db.users.length === 0 && (
         <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhum usuário cadastrado</div>
       )}
    </div>
  </div>
);

export default UsersManager;