"use client";

import React from 'react';
import { ArrowUpRight, TrendingUp, Target, AlertTriangle } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  subtext?: string;
  isCurrency?: boolean;
  isPct?: boolean;
}

const KpiCard = ({ label, value, color, icon, isPct, subtext, isCurrency = true }: KpiCardProps) => {
  const safeVal = typeof value === 'number' && !isNaN(value) ? value : 0;
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${color.replace('text', 'bg')}/10 ${color}`}>
             {icon}
          </div>
          <div className="text-right">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
             <p className={`text-2xl font-black ${color}`}>
               {isPct ? `${safeVal.toFixed(1)}%` : isCurrency ? `R$ ${safeVal.toLocaleString('pt-BR', {minimumFractionDigits:2})}` : safeVal}
             </p>
          </div>
       </div>
       {subtext && <p className="text-[10px] font-bold text-slate-400">{subtext}</p>}
       <div className={`absolute bottom-0 left-0 h-1 w-full opacity-10 ${color.replace('text', 'bg')}`}></div>
    </div>
  );
};

interface DashboardKpiGridProps {
  netRevenue: number;
  netProfit: number;
  avgTicket: number;
  margin: number;
  salesCount: number;
  alertStockCount: number;
}

const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({ 
  netRevenue, netProfit, avgTicket, margin, salesCount, alertStockCount 
}) => {
  const safeMargin = typeof margin === 'number' && !isNaN(margin) ? margin : 0;
  const safeAlerts = typeof alertStockCount === 'number' && !isNaN(alertStockCount) ? alertStockCount : 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Faturamento Líquido" value={netRevenue} color="text-indigo-600" icon={<ArrowUpRight />} subtext={`${salesCount || 0} vendas no período`} />
      <KpiCard label="Lucro Líquido" value={netProfit} color="text-emerald-600" icon={<TrendingUp />} subtext={`Margem: ${safeMargin.toFixed(1)}%`} />
      <KpiCard label="Ticket Médio" value={avgTicket} color="text-violet-600" icon={<Target />} subtext="Média por pedido" />
      <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-red-100/50 transition-all duration-500">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-red-50 text-red-500"><AlertTriangle /></div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alertas Estoque</p>
            <p className="text-2xl font-black text-red-500">{safeAlerts} <span className="text-xs opacity-50">itens</span></p>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (safeAlerts / 10) * 100)}%` }} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-2">Reposição necessária</p>
      </div>
    </div>
  );
};

export default DashboardKpiGrid;