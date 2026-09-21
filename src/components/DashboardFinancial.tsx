"use client";

import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend
} from 'recharts';

const DashboardFinancial = ({ current }: any) => {
  const flowData = useMemo(() => {
    const days: Record<string, any> = {};
    current.sales.forEach((s: any) => {
      const d = s.date.split('T')[0].split('-').reverse().slice(0,2).join('/');
      if (!days[d]) days[d] = { name: d, entradas: 0, saídas: 0 };
      days[d].entradas += s.total;
    });
    current.expenses.forEach((e: any) => {
      const d = e.date.split('T')[0].split('-').reverse().slice(0,2).join('/');
      if (!days[d]) days[d] = { name: d, entradas: 0, saídas: 0 };
      days[d].saídas += e.amount;
    });
    return Object.values(days);
  }, [current]);

  if (flowData.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-600 rounded-full" /> Fluxo de Caixa (Entradas vs Saídas)
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
              <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981' }} />
              <Line type="monotone" dataKey="saídas" stroke="#ef4444" strokeWidth={4} dot={{ r: 4, fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinancial;