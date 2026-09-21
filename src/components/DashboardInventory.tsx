"use client";

import React, { useMemo } from 'react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const DashboardInventory = ({ current }: any) => {
  const abcData = useMemo(() => {
    const items: Record<string, number> = {};
    current.sales.forEach((s: any) => {
      s.items.forEach((i: any) => {
        items[i.product.name] = (items[i.product.name] || 0) + (i.price * i.quantity);
      });
    });

    const sorted = Object.entries(items)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = sorted.reduce((a, b) => a + (Number(b.value) || 0), 0);
    let cumulative = 0;

    return sorted.map(item => {
      cumulative += (Number(item.value) || 0);
      return {
        ...item,
        pareto: total > 0 ? (cumulative / total) * 100 : 0
      };
    }).slice(0, 10);
  }, [current.sales]);

  if (abcData.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-indigo-600" /> Curva ABC de Faturamento (Pareto)
      </h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={abcData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#6366f1'}} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
            <Bar yAxisId="left" dataKey="value" fill="#e2e8f0" radius={[10, 10, 0, 0]} barSize={40}>
              {abcData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pareto <= 80 ? '#4f46e5' : entry.pareto <= 95 ? '#818cf8' : '#e2e8f0'} />
              ))}
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="pareto" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 flex justify-center gap-6">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600" /><span className="text-[9px] font-black uppercase text-slate-400">Classe A (80%)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-400" /><span className="text-[9px] font-black uppercase text-slate-400">Classe B (15%)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200" /><span className="text-[9px] font-black uppercase text-slate-400">Classe C (5%)</span></div>
      </div>
    </div>
  );
};

export default DashboardInventory;