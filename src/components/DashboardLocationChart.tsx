"use client";

import React from 'react';
import { MapPin } from 'lucide-react';
import { Database, Sale } from '../types';

interface DashboardLocationChartProps {
  db: Database;
  sales: Sale[];
}

const DashboardLocationChart: React.FC<DashboardLocationChartProps> = ({ db, sales }) => {
  const locationStats = React.useMemo(() => {
    const map: Record<string, { total: number, count: number }> = {};
    
    sales.forEach(sale => {
      const customer = db.customers.find(c => c.id === sale.customerId);
      // Tenta pegar o bairro ou cidade do endereço, ou marca como 'Não Identificado'
      const location = customer?.address?.split('-')[1]?.trim() || customer?.address?.split(',')[1]?.trim() || 'Consumidor Final';
      
      if (!map[location]) map[location] = { total: 0, count: 0 };
      map[location].total += sale.total;
      map[location].count += 1;
    });

    return Object.entries(map)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5);
  }, [db.customers, sales]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col">
      <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3 mb-8">
        <MapPin className="w-4 h-4 text-indigo-500"/> Vendas por Localidade
      </h3>
      
      <div className="space-y-4">
        {locationStats.map(([loc, data], idx) => (
          <div key={idx} className="flex items-center gap-4 group">
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-[10px] group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-black uppercase truncate text-slate-600">{loc}</span>
                <span className="text-[10px] font-black text-indigo-600">R$ {data.total.toFixed(0)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600/40 group-hover:bg-indigo-600 transition-all duration-1000" 
                  style={{ width: `${(data.total / (locationStats[0][1].total || 1)) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
        {locationStats.length === 0 && (
          <div className="py-10 text-center opacity-20 font-black uppercase tracking-widest text-[10px]">Sem dados de localidade</div>
        )}
      </div>
    </div>
  );
};

export default DashboardLocationChart;