"use client";

import React from 'react';
import { Truck, ShoppingBag } from 'lucide-react';
import { Sale } from '../types';

interface DashboardDeliveryChartProps {
  sales: Sale[];
}

const DashboardDeliveryChart: React.FC<DashboardDeliveryChartProps> = ({ sales }) => {
  const stats = React.useMemo(() => {
    const balcao = (sales || []).filter(s => s.deliveryType === 'Retirada').length;
    const delivery = (sales || []).filter(s => s.deliveryType === 'Entrega').length;
    const total = balcao + delivery;
    return {
      balcao,
      delivery,
      balcaoPct: total > 0 ? (balcao / total) * 100 : 0,
      deliveryPct: total > 0 ? (delivery / total) * 100 : 0
    };
  }, [sales]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col">
      <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3 mb-8">
        <Truck className="w-4 h-4 text-indigo-500"/> Balcão vs Delivery
      </h3>
      
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-black uppercase text-slate-400">Balcão</span>
            </div>
            <span className="text-sm font-black text-slate-700">{stats.balcao} <span className="text-[10px] opacity-40">({(Number(stats.balcaoPct) || 0).toFixed(0)}%)</span></span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${stats.balcaoPct}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-black uppercase text-slate-400">Delivery</span>
            </div>
            <span className="text-sm font-black text-slate-700">{stats.delivery} <span className="text-[10px] opacity-40">({(Number(stats.deliveryPct) || 0).toFixed(0)}%)</span></span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.deliveryPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDeliveryChart;