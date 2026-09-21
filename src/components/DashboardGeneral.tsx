"use client";

import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, LayoutDashboard } from 'lucide-react';
import { calculateTrend } from '../utils/dashboard';

const KpiCard = ({ label, value, prevValue, isCurrency = true, isPct = false }: any) => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safePrev = typeof prevValue === 'number' && !isNaN(prevValue) ? prevValue : 0;
  const trend = calculateTrend(safeValue, safePrev);
  const safeTrend = typeof trend === 'number' && !isNaN(trend) ? trend : 0;
  const format = (v: number) => {
    const num = typeof v === 'number' && !isNaN(v) ? v : 0;
    return isCurrency ? `R$ ${num.toLocaleString('pt-BR', {minimumFractionDigits:2})}` : isPct ? `${num.toFixed(1)}%` : num.toLocaleString('pt-BR');
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm group hover:border-indigo-200 transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-2xl font-black text-slate-800">{format(value)}</h4>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${safeTrend > 0 ? 'bg-emerald-50 text-emerald-600' : safeTrend < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
          {safeTrend > 0 ? <TrendingUp className="w-3 h-3" /> : safeTrend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {Math.abs(safeTrend).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

const DashboardGeneral = ({ current, previous }: any) => {
  const stats = useMemo(() => {
    const getMetrics = (data: any) => {
      const revenue = data.sales.reduce((a: any, b: any) => a + b.total, 0);
      const cmv = data.sales.reduce((a: any, b: any) => a + b.items.reduce((s: any, i: any) => s + (i.product.costPrice * i.quantity), 0), 0);
      const expenses = data.expenses.reduce((a: any, b: any) => a + b.amount, 0);
      const grossProfit = revenue - cmv;
      const netProfit = grossProfit - expenses;
      return { revenue, grossProfit, netProfit, margin: revenue > 0 ? (netProfit / revenue) * 100 : 0, ticket: data.sales.length > 0 ? revenue / data.sales.length : 0 };
    };

    return { curr: getMetrics(current), prev: getMetrics(previous) };
  }, [current, previous]);

  // Dados para o gráfico evolutivo (agrupado por dia)
  const chartData = useMemo(() => {
    const days: Record<string, any> = {};
    current.sales.forEach((s: any) => {
      const d = s.date.split('T')[0].split('-').reverse().slice(0,2).join('/');
      if (!days[d]) days[d] = { name: d, faturamento: 0, lucro: 0 };
      days[d].faturamento += s.total;
      days[d].lucro += (s.total - s.items.reduce((acc:any, i:any) => acc + (i.product.costPrice * i.quantity), 0));
    });
    return Object.values(days);
  }, [current.sales]);

  if (current.sales.length === 0) {
    return (
      <div className="bg-white p-20 rounded-[3rem] border border-dashed text-center opacity-30">
        <LayoutDashboard className="w-12 h-12 mx-auto mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Sem dados suficientes para gerar a visão estratégica</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Faturamento Líquido" value={stats.curr.revenue} prevValue={stats.prev.revenue} />
        <KpiCard label="Lucro Líquido" value={stats.curr.netProfit} prevValue={stats.prev.netProfit} />
        <KpiCard label="Margem Líquida" value={stats.curr.margin} prevValue={stats.prev.margin} isCurrency={false} isPct={true} />
        <KpiCard label="Ticket Médio" value={stats.curr.ticket} prevValue={stats.prev.ticket} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border shadow-sm">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Evolução de Faturamento vs Lucro
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="faturamento" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" />
                <Area type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-indigo-950 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
          <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Ponto de Equilíbrio (Estimado)</p>
          <h4 className="text-4xl font-black italic skew-x-[-6deg] mb-4">
            R$ {(() => {
              const expTotal = (current.expenses || []).reduce((a: any, b: any) => a + (Number(b.amount) || 0), 0);
              const marginRatio = (stats.curr.grossProfit && stats.curr.revenue) ? (stats.curr.grossProfit / stats.curr.revenue) : 1;
              const pe = marginRatio > 0 ? expTotal / marginRatio : 0;
              return (isNaN(pe) ? 0 : pe).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
            })()}
          </h4>
          <p className="text-[9px] font-bold text-indigo-300/60 leading-relaxed uppercase">
            Faturamento necessário para cobrir 100% dos custos e despesas do período selecionado.
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-[10px] font-black uppercase opacity-40">ROI do Período</span>
              <span className="text-sm font-black text-emerald-400">+{(() => {
                const roi = stats.curr.revenue > 0 ? ((stats.curr.netProfit / stats.curr.revenue) * 100) : 0;
                return (isNaN(roi) ? 0 : roi).toFixed(1);
              })()}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGeneral;