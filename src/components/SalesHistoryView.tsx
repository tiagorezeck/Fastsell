"use client";

import React, { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { Database, Sale } from '../types';

interface SalesHistoryViewProps {
  db: Database;
  startDate: string;
  endDate: string;
  onViewSale: (sale: Sale) => void;
}

const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ db, startDate, endDate, onViewSale }) => {
  const filteredSales = useMemo(() => {
    return db.sales.filter(s => {
      const date = s.date.split('T')[0];
      return date >= startDate && date <= endDate;
    });
  }, [db.sales, startDate, endDate]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-white p-4 rounded-2xl border shadow-sm">
        Histórico de Movimentação ({filteredSales.length} registros)
      </h2>
      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm overflow-x-auto">
         <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
              <tr>
                <th className="p-4">Pedido</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Pagamento</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
               {filteredSales.slice().reverse().map(s => {
                 const client = db.customers.find(c=>c.id === s.customerId);
                 return (
                   <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-400">
                        #{s.id.slice(-6)}
                        <br/>
                        <span className="text-[10px] opacity-60 font-medium">{new Date(s.date).toLocaleDateString('pt-BR')}</span>
                      </td>
                      <td className="p-4 font-bold">{client?.name || <span className="text-[10px] opacity-30 italic">CONSUMIDOR FINAL</span>}</td>
                      <td className="p-4 uppercase font-black opacity-60 text-[9px]">{s.paymentMethod}</td>
                      <td className="p-4 text-right font-black text-indigo-600 text-sm">R$ {s.total.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => onViewSale(s)}
                          className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Ver Recibo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                   </tr>
                 );
               })}
               {filteredSales.length === 0 && (
                 <tr>
                   <td colSpan={5} className="p-10 text-center opacity-20 font-black uppercase tracking-widest">Nenhuma venda no período selecionado</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default SalesHistoryView;