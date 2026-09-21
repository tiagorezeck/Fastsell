"use client";

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { UserCheck } from 'lucide-react';

const DashboardOperational = ({ db, current }: any) => {
  const productivityData = useMemo(() => {
    const sellers: Record<string, number> = {};
    current.sales.forEach((s: any) => {
      const name = db.users.find((u: any) => u.id === s.sellerId)?.name || 'Outros';
      sellers[name] = (sellers[name] || 0) + 1; // Conta número de atendimentos
    });
    return Object.entries(sellers).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [current.sales, db.users]);

  if (productivityData.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-indigo-600" /> Produtividade (Atendimentos por Colaborador)
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productivityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOperational;