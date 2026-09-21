"use client";

import React, { useMemo } from 'react';
import { Cake, Smartphone, Calendar, Search, Gift, PartyPopper } from 'lucide-react';
import { Database, Customer } from '../types';

interface BirthdayListProps {
  db: Database;
}

const BirthdayList: React.FC<BirthdayListProps> = ({ db }) => {
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

  const birthdays = useMemo(() => {
    const todayList: Customer[] = [];
    const monthList: Customer[] = [];

    db.customers.forEach(c => {
      if (!c.birthDate) return;
      const [y, m, d] = c.birthDate.split('-');
      const bStr = `${d}/${m}`;
      
      if (bStr === todayStr) todayList.push(c);
      else if (Number(m) === today.getMonth() + 1) monthList.push(c);
    });

    return { todayList, monthList };
  }, [db.customers, todayStr]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Aniversariantes de Hoje */}
      <div className="bg-white p-8 rounded-[3rem] border-2 border-indigo-100 shadow-xl shadow-indigo-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <PartyPopper className="w-32 h-32 text-indigo-600" />
        </div>
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-100">
            <Cake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Aniversariantes de Hoje</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Celebre com seus clientes ({birthdays.todayList.length})</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {birthdays.todayList.map(c => (
            <div key={c.id} className="bg-slate-50 p-5 rounded-[2rem] border border-white flex items-center gap-4 group hover:border-indigo-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm text-lg">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm uppercase truncate text-slate-700">{c.name}</p>
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3" /> {c.whatsapp}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl animate-bounce">
                <Gift className="w-4 h-4" />
              </div>
            </div>
          ))}
          {birthdays.todayList.length === 0 && (
            <div className="col-span-full py-12 text-center opacity-20 font-black uppercase tracking-widest text-xs">
              Nenhum aniversariante hoje
            </div>
          )}
        </div>
      </div>

      {/* Próximos do Mês */}
      <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Outros Aniversariantes do Mês</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {birthdays.monthList.sort((a,b) => (a.birthDate || '').localeCompare(b.birthDate || '')).map(c => {
            const [y, m, d] = (c.birthDate || '').split('-');
            return (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-indigo-600 mb-1">{d}/{m}</p>
                <p className="text-[10px] font-black uppercase text-slate-700 truncate">{c.name}</p>
              </div>
            );
          })}
          {birthdays.monthList.length === 0 && (
            <div className="col-span-full py-10 text-center opacity-20 font-black uppercase tracking-widest text-[10px]">
              Sem mais aniversariantes este mês
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayList;