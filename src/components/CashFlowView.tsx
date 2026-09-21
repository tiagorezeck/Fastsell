"use client";

import React, { useMemo, useState } from 'react';
import { 
  format, startOfDay, endOfDay, parseISO, addDays, differenceInCalendarDays
} from 'date-fns';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Wallet, Search, ChevronRight, ChevronDown, CheckCircle2, Clock, ArrowRightLeft, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { Database } from '../types';

interface FlowItem {
  name: string;
  qty: number;
}

interface FlowRecord {
  id: string;
  date: Date;
  description: string;
  value: number;
  type: 'Entrada' | 'Saída' | 'Transferência' | 'Cancelado';
  status: 'REALIZADO' | 'PREVISTO' | 'NEUTRO';
  category: string;
  items?: FlowItem[];
}

interface CashFlowViewProps {
  db: Database;
  startDate: string;
  endDate: string;
}

const CashFlowView: React.FC<CashFlowViewProps> = ({ db, startDate, endDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allRecords = useMemo(() => {
    const records: FlowRecord[] = [];
    
    // Vendas
    db.sales.forEach(s => {
      const isCrediario = s.paymentMethod === 'Crediário';
      records.push({
        id: s.id, 
        date: parseISO(s.date), 
        description: `Venda #${s.id.slice(-6)}`,
        value: s.total, 
        type: 'Entrada', 
        status: isCrediario ? 'PREVISTO' : 'REALIZADO', 
        category: isCrediario ? 'Contas a Receber' : 'Receita de Vendas',
        items: s.items.map(i => ({ name: i.productName, qty: i.quantity }))
      });
    });

    // Despesas e Compras
    db.expenses.forEach(e => {
      const account = db.accounts.find(a => a.id === e.accountId);
      // Ignora apenas o CMV puramente contábil (3.2), mas mantém subcontas como 3.2.2 (Materiais)
      if (account?.code === '3.2' && !e.id.startsWith('EXP-PO')) return; 

      const isPurchase = e.id.startsWith('EXP-PO');
      let items: FlowItem[] | undefined;

      if (isPurchase) {
        const poId = e.id.replace('EXP-PO-', '');
        const po = db.purchaseOrders.find(p => p.id === poId);
        if (po) {
          items = po.items.map(i => ({
            name: db.products.find(p => p.id === i.productId)?.name || 'Item Desconhecido',
            qty: i.quantity
          }));
        }
      }

      records.push({
        id: e.id, 
        date: parseISO(e.date), 
        description: e.description,
        value: -Math.abs(e.amount), 
        type: 'Saída', 
        status: 'REALIZADO', 
        category: isPurchase ? 'COMPRA' : (account?.name || 'Despesa Geral'),
        items
      });
    });

    // Movimentações de Caixa
    db.cashierSessions.forEach(s => {
      s.movements.forEach(m => {
        if (m.type === 'Suprimento' || m.type === 'Sangria') {
          records.push({
            id: m.id,
            date: parseISO(m.date),
            description: m.description,
            value: m.type === 'Suprimento' ? m.amount : -m.amount,
            type: 'Transferência',
            status: 'NEUTRO',
            category: 'Transferência Interna'
          });
        }
      });
    });

    return records.sort((a, b) => b.date.getTime() - new Date(a.date).getTime());
  }, [db.sales, db.expenses, db.cashierSessions, db.accounts, db.purchaseOrders, db.products]);

  const filteredRecords = useMemo(() => {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));
    return allRecords.filter(r => {
      const inPeriod = r.date >= start && r.date <= end;
      const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.category.toLowerCase().includes(searchTerm.toLowerCase());
      return inPeriod && matchesSearch;
    });
  }, [allRecords, startDate, endDate, searchTerm]);

  const kpis = useMemo(() => {
    const realizedIn = filteredRecords.filter(r => r.status === 'REALIZADO' && r.value > 0).reduce((a, b) => a + b.value, 0);
    const realizedOut = filteredRecords.filter(r => r.status === 'REALIZADO' && r.value < 0).reduce((a, b) => a + Math.abs(b.value), 0);
    const predicted = filteredRecords.filter(r => r.status === 'PREVISTO').reduce((a, b) => a + b.value, 0);
    return { realizedIn, realizedOut, predicted, balance: realizedIn - realizedOut };
  }, [filteredRecords]);

  const chartData = useMemo(() => {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));
    const daily = new Map();

    filteredRecords.forEach(r => {
      const key = format(r.date, 'yyyy-MM-dd');
      const curr = daily.get(key) || { realized: 0, predicted: 0 };
      if (r.status === 'REALIZADO') curr.realized += r.value;
      else if (r.status === 'PREVISTO') curr.predicted += r.value;
      daily.set(key, curr);
    });

    const data = [];
    const days = differenceInCalendarDays(end, start) + 1;
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const key = format(d, 'yyyy-MM-dd');
      const vals = daily.get(key) || { realized: 0, predicted: 0 };
      data.push({
        day: format(d, 'dd/MM'),
        realized: vals.realized,
        predicted: vals.predicted,
        total: vals.realized + vals.predicted
      });
    }
    return data;
  }, [filteredRecords, startDate, endDate]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Entradas (Realizado)" value={kpis.realizedIn} color="text-emerald-600" />
        <KpiCard label="Saídas (Realizado)" value={kpis.realizedOut} color="text-red-500" />
        <KpiCard label="Saldo do Período" value={kpis.balance} color="text-indigo-600" isMain />
        <KpiCard label="Previsto (Crediário)" value={kpis.predicted} color="text-amber-500" />
      </div>

      <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(v) => `R$ ${v}`} />
              <Tooltip />
              <Bar dataKey="realized" name="Realizado" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="predicted" name="Previsto" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
              <Line type="monotone" dataKey="total" name="Fluxo Total" stroke="#6366f1" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Detalhamento de Lançamentos
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="divide-y">
          {filteredRecords.map(record => {
            const isExpanded = expandedIds.includes(record.id);
            const hasItems = record.items && record.items.length > 0;

            return (
              <div key={record.id} className={`transition-all ${record.status === 'NEUTRO' ? 'bg-slate-900/[0.03]' : ''}`}>
                <div 
                  onClick={() => hasItems && toggleExpand(record.id)}
                  className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-all cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {hasItems ? (
                        isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4 text-slate-300" />
                      ) : (
                        <div className="w-4" />
                      )}
                      <StatusIcon status={record.status} type={record.type} category={record.category} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-black uppercase truncate ${record.status === 'NEUTRO' ? 'text-slate-400' : 'text-slate-700'}`}>{record.description}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{format(record.date, 'dd/MM HH:mm')} • {record.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-black ${
                      record.status === 'PREVISTO' ? 'text-amber-500' :
                      record.status === 'NEUTRO' ? 'text-slate-500' :
                      record.value > 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {record.value > 0 ? '+' : ''}{formatCurrency(record.value)}
                    </p>
                    <p className="text-[8px] font-black text-slate-300 uppercase">{record.status}</p>
                  </div>
                </div>

                {isExpanded && hasItems && (
                  <div className="px-16 pb-4 bg-slate-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5 border-l-2 border-indigo-100 pl-4 py-2">
                      {record.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-500 uppercase">{item.name}</span>
                          <span className="font-black text-indigo-600">{item.qty} un.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, color, isMain }: any) => (
  <div className={`p-6 rounded-[2rem] border shadow-sm ${isMain ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white'}`}>
    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isMain ? 'text-indigo-200' : 'text-slate-400'}`}>{label}</p>
    <p className={`text-xl font-black ${isMain ? 'text-white' : color}`}>
      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
    </p>
  </div>
);

const StatusIcon = ({ status, type, category }: { status: string, type: string, category: string }) => {
  if (status === 'NEUTRO') return <div className="p-2 bg-slate-800 text-white rounded-xl"><ArrowRightLeft className="w-4 h-4" /></div>;
  if (status === 'PREVISTO') return <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Clock className="w-4 h-4" /></div>;
  if (category === 'COMPRA') return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><ShoppingBag className="w-4 h-4" /></div>;
  if (type === 'Saída') return <div className="p-2 bg-red-100 text-red-600 rounded-xl"><AlertCircle className="w-4 h-4" /></div>;
  return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></div>;
};

export default CashFlowView;