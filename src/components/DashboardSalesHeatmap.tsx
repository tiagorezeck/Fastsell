"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import { Sale } from '../types';

interface DashboardSalesHeatmapProps {
  sales: Sale[];
}

const DashboardSalesHeatmap: React.FC<DashboardSalesHeatmapProps> = ({ sales }) => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 12 }, (_, i) => i * 2 + 8); // 8h às 30h (simplificado)

  const heatmapData = React.useMemo(() => {
    const data: Record<string, number> = {};
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const day = date.getDay();
      const hour = Math.floor(date.getHours() / 2) * 2;
      const key = `${day}-${hour}`;
      data[key] = (data[key] || 0) + 1;
    });
    return data;
  }, [sales]);

  const maxVal = Math.max(...Object.values(heatmapData), 1);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
          <Clock className="w-4 h-4 text-indigo-500"/> Fluxo de Vendas (Horário)
        </h3>
      </div>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex gap-1 mb-2">
          <div className="w-8" />
          {hours.map(h => (
            <div key={h} className="flex-1 text-[8px] font-black text-slate-300 text-center uppercase">{h}h</div>
          ))}
        </div>
        
        {days.map((day, dIdx) => (
          <div key={day} className="flex gap-1 items-center">
            <div className="w-8 text-[8px] font-black text-slate-400 uppercase">{day}</div>
            {hours.map(h => {
              const val = heatmapData[`${dIdx}-${h}`] || 0;
              const opacity = val / maxVal;
              return (
                <div 
                  key={h} 
                  className="flex-1 aspect-square rounded-md transition-all hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: `rgba(79, 70, 229, ${Math.max(0.05, opacity)})` }}
                  title={`${val} vendas`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <span className="text-[8px] font-black text-slate-300 uppercase">Menos</span>
        <div className="flex gap-0.5">
          {[0.1, 0.3, 0.6, 1].map(o => <div key={o} className="w-2 h-2 rounded-sm bg-indigo-600" style={{ opacity: o }} />)}
        </div>
        <span className="text-[8px] font-black text-slate-300 uppercase">Mais</span>
      </div>
    </div>
  );
};

export default DashboardSalesHeatmap;