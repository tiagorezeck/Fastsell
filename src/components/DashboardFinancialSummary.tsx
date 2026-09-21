"use client";

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface DashboardFinancialSummaryProps {
  grossRevenue: number;
  discounts: number;
  netRevenue: number;
  totalCMV: number;
  grossProfit: number;
  totalExp: number;
  netProfit: number;
}

const DreLine = ({ label, value, isNegative, isBold }: any) => (
  <div className="flex justify-between items-center text-[10px]">
    <span className={`uppercase tracking-tight ${isBold ? 'font-black text-slate-900' : 'font-bold text-slate-400'}`}>{label}</span>
    <span className={`font-mono font-black ${isNegative ? 'text-red-500' : isBold ? 'text-slate-900' : 'text-slate-600'}`}>
      {isNegative && value !== 0 ? '- ' : ''}R$ {Math.abs(value).toLocaleString('pt-BR', {minimumFractionDigits:2})}
    </span>
  </div>
);

const DashboardFinancialSummary: React.FC<DashboardFinancialSummaryProps> = ({
  grossRevenue, discounts, netRevenue, totalCMV, grossProfit, totalExp, netProfit
}) => (
  <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
        <BarChart3 className="w-4 h-4 text-indigo-500"/> Resumo Financeiro (DRE)
      </h3>
    </div>
    <div className="space-y-4">
      <DreLine label="Receita Bruta" value={grossRevenue} />
      <DreLine label="Descontos/Deduções" value={discounts} isNegative />
      <DreLine label="Receita Líquida" value={netRevenue} isBold />
      <DreLine label="Custos (CMV)" value={totalCMV} isNegative />
      <DreLine label="Lucro Bruto" value={grossProfit} isBold />
      <DreLine label="Despesas Operacionais" value={totalExp} isNegative />
      <div className="pt-4 mt-4 border-t border-dashed">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase text-indigo-600">Resultado Final</span>
          <span className={`text-lg font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            R$ {netProfit.toLocaleString('pt-BR', {minimumFractionDigits:2})}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardFinancialSummary;