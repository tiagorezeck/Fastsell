"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Database } from '../types';
import { 
  Users, Package, 
  Trophy, TrendingUp, Minus,
  ChevronDown, ChevronRight, Search, Maximize2, Minimize2, X
} from 'lucide-react';

interface SalesReportsViewProps {
  db: Database;
  startDate: string;
  endDate: string;
  forcedTab?: 'RANKING' | 'ABC_CLI' | 'ABC_PROD';
}

const SalesReportsView: React.FC<SalesReportsViewProps> = ({ db, startDate, endDate, forcedTab }) => {
  const [subTab, setSubTab] = useState<'RANKING' | 'ABC_CLI' | 'ABC_PROD'>('RANKING');
  
  useEffect(() => {
    if (forcedTab) setSubTab(forcedTab);
  }, [forcedTab]);

  const [expandedClasses, setExpandedClasses] = useState<string[]>(['A']);
  const [pctA, setPctA] = useState(80);
  const [pctB, setPctB] = useState(15);
  const [abcSearch, setAbcSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredSales = useMemo(() => db.sales.filter(s => s.date.split('T')[0] >= startDate && s.date.split('T')[0] <= endDate), [db.sales, startDate, endDate]);

  const handlePctAChange = (val: number) => {
    const newA = Math.min(100, Math.max(0, val));
    setPctA(newA);
    if (newA + pctB > 100) setPctB(100 - newA);
  };

  const handlePctBChange = (val: number) => {
    const newB = Math.min(100 - pctA, Math.max(0, val));
    setPctB(newB);
  };

  const pctC = Math.max(0, 100 - pctA - pctB);

  const abcData = useMemo(() => {
    const totalRevenue = filteredSales.reduce((a, b) => a + b.total, 0);
    const itemMap: Record<string, { name: string, total: number, count: number, months: Set<string> }> = {};

    if (subTab === 'ABC_CLI') {
      filteredSales.forEach(sale => {
        const cid = sale.customerId || 'CONSUMIDOR_FINAL';
        const cname = db.customers.find(c => c.id === cid)?.name || 'Consumidor Final';
        const monthKey = sale.date.substring(0, 7);
        if (!itemMap[cid]) itemMap[cid] = { name: cname, total: 0, count: 0, months: new Set() };
        itemMap[cid].total += sale.total;
        itemMap[cid].count += 1;
        itemMap[cid].months.add(monthKey);
      });
    } else if (subTab === 'ABC_PROD') {
      filteredSales.forEach(sale => {
        const monthKey = sale.date.substring(0, 7);
        sale.items.forEach(item => {
          const pid = item.productId;
          const pname = item.productName;
          if (!itemMap[pid]) itemMap[pid] = { name: pname, total: 0, count: 0, months: new Set() };
          itemMap[pid].total += item.price * item.quantity;
          itemMap[pid].count += item.quantity;
          itemMap[pid].months.add(monthKey);
        });
      } );
    }

    const sortedItems = Object.values(itemMap)
      .filter(i => i.name.toLowerCase().includes(abcSearch.toLowerCase()))
      .sort((a, b) => b.total - a.total);

    let cumulativeRevenue = 0;
    const classes = {
      A: { items: [] as any[], total: 0, targetPct: pctA },
      B: { items: [] as any[], total: 0, targetPct: pctB },
      C: { items: [] as any[], total: 0, targetPct: pctC }
    };

    sortedItems.forEach(item => {
      cumulativeRevenue += item.total;
      const pct = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0;
      const itemPct = totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0;

      if (pct <= pctA || classes.A.items.length === 0) {
        classes.A.items.push({ ...item, pct: itemPct });
        classes.A.total += item.total;
      } else if (pct <= (pctA + pctB)) {
        classes.B.items.push({ ...item, pct: itemPct });
        classes.B.total += item.total;
      } else {
        classes.C.items.push({ ...item, pct: itemPct });
        classes.C.total += item.total;
      }
    });

    return { classes, totalRevenue };
  }, [filteredSales, db.customers, abcSearch, pctA, pctB, pctC, subTab]);

  const toggleAll = () => {
    if (expandedClasses.length === 3) setExpandedClasses([]);
    else setExpandedClasses(['A', 'B', 'C']);
  };

  const toggleClass = (key: string) => {
    setExpandedClasses(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const sellerStats = useMemo(() => {
    const sellers = db.users.filter(u => u.role === 'Vendedor' || u.role === 'Admin');
    const stats = sellers.map(s => {
      const sales = filteredSales.filter(sale => sale.sellerId === s.id);
      const total = sales.reduce((a, b) => a + (Number(b.total) || 0), 0);
      const ticketMedio = sales.length > 0 ? total / sales.length : 0;
      const meta = 10000;
      const indicators = [
        { label: 'Superação da Meta', val: total > meta ? 2 : 0, desc: total > meta ? 'Meta superada' : 'Meta não atingida' },
        { label: 'Crescimento de Vendas', val: total > 5000 ? 2 : 1, desc: 'Crescimento constante' },
        { label: 'Tickets Atendidos', val: sales.length > 10 ? 1 : 0, desc: sales.length > 10 ? 'Mais tickets' : 'Volume baixo' },
        { label: 'Conversão de Tickets', val: 1, desc: 'Melhorou significativamente' },
        { label: 'Ticket Médio', val: ticketMedio > 200 ? 1 : 0, desc: ticketMedio > 200 ? 'Aumentou' : 'Estável' },
        { label: 'Perda de Vendas', val: 0, desc: 'Igual' }
      ];
      const score = indicators.reduce((acc, curr) => acc + curr.val, 0);
      return { 
        ...s, 
        total, 
        ticketMedio: isNaN(ticketMedio) ? 0 : ticketMedio, 
        count: sales.length, 
        meta, 
        score, 
        indicators, 
        pctMeta: meta > 0 ? (total / meta) * 100 : 0 
      };
    });
    const ranked = [...stats].sort((a, b) => b.total - a.total);
    const bestPerformance = [...stats].sort((a, b) => b.score - a.score)[0];
    return { ranked, bestPerformance };
  }, [db.users, filteredSales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {subTab === 'RANKING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Ranking de Vendedores</h3>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Top 3 Vendedores</p>
                <div className="hidden md:grid grid-cols-12 px-6 text-[9px] font-black uppercase text-slate-400 mb-2">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5">Nome</div>
                  <div className="col-span-2 text-center">Ticket</div>
                  <div className="col-span-2 text-right">T. Médio</div>
                  <div className="col-span-2 text-right">Vendas</div>
                </div>
                <div className="space-y-3">
                  {sellerStats.ranked.slice(0, 3).map((s, idx) => (
                    <div key={s.id} className={`flex flex-col md:grid md:grid-cols-12 md:items-center p-5 rounded-[2rem] border transition-all ${idx === 0 ? 'bg-amber-50/30 border-amber-200 shadow-lg shadow-amber-100/50' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className="flex items-center justify-between md:col-span-6 mb-4 md:mb-0">
                        <div className="flex items-center gap-3">
                          <div className="md:hidden text-[8px] font-black text-slate-400 uppercase">Rank</div>
                          {idx === 0 ? <Trophy className="w-5 h-5 text-amber-500" /> : <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">{idx + 1}</div>}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                              {s.imageUrl ? (
                                <img src={s.imageUrl} className="w-full h-full object-cover" alt={s.name} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">{s.name[0]}</div>
                              )}
                            </div>
                            <div className="font-black text-sm uppercase text-slate-700">{s.name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 md:contents">
                        <div className="flex flex-col md:col-span-2 md:text-center">
                          <span className="md:hidden text-[8px] font-black text-slate-400 uppercase mb-1">Tickets</span>
                          <span className="font-bold text-slate-600 text-xs md:text-sm">{s.count}</span>
                        </div>
                        <div className="flex flex-col md:col-span-2 md:text-right">
                          <span className="md:hidden text-[8px] font-black text-slate-400 uppercase mb-1">T. Médio</span>
                          <span className="font-bold text-slate-500 text-xs md:text-sm">R$ {s.ticketMedio.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col md:col-span-2 md:text-right">
                          <span className="md:hidden text-[8px] font-black text-slate-400 uppercase mb-1">Total</span>
                          <span className="font-black text-emerald-600 text-xs md:text-sm">R$ {s.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            {sellerStats.bestPerformance && (
              <div className="bg-white p-8 rounded-[3rem] border shadow-2xl border-indigo-100 sticky top-4">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-amber-100 rounded-2xl text-amber-600"><Trophy className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Destaque - Melhor Performance</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Vendedor(a) com melhor desempenho individual</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-8 flex items-center gap-4 border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm overflow-hidden shrink-0">
                    {sellerStats.bestPerformance.imageUrl ? (
                      <img src={sellerStats.bestPerformance.imageUrl} className="w-full h-full object-cover" alt={sellerStats.bestPerformance.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-black text-indigo-600">{sellerStats.bestPerformance.name[0]}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-black uppercase text-slate-800">{sellerStats.bestPerformance.name}</h4>
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Score Final</p>
                      <p className="text-2xl font-black text-emerald-500">+{sellerStats.bestPerformance.score} pts</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  {sellerStats.bestPerformance.indicators.map((ind, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        {ind.val > 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <Minus className="w-3.5 h-3.5 text-slate-300" />}
                        <span className="text-[11px] font-bold text-slate-500 uppercase">{ind.label}</span>
                      </div>
                      <span className={`text-xs font-black ${ind.val > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>+{ind.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(subTab === 'ABC_CLI' || subTab === 'ABC_PROD') && (
        <div className="bg-white p-4 md:p-8 lg:p-12 rounded-[2rem] lg:rounded-[3rem] border shadow-sm space-y-6 lg:space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                {subTab === 'ABC_CLI' ? <Users className="w-6 h-6 text-indigo-600" /> : <Package className="w-6 h-6 text-indigo-600" />}
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 italic skew-x-[-6deg]">
                  Curva ABC {subTab === 'ABC_CLI' ? 'Clientes' : 'Produtos'}
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border w-full md:w-auto overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[8px] font-black text-amber-600 uppercase">A:</span>
                  <input type="number" className="w-10 bg-white border rounded-lg p-1 text-[10px] font-black text-center outline-none focus:ring-1 ring-amber-500" value={pctA} onChange={e => handlePctAChange(Number(e.target.value))} />
                  <span className="text-[8px] font-black text-slate-400">%</span>
                </div>
                <div className="w-px h-4 bg-slate-200 mx-1 shrink-0" />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[8px] font-black text-indigo-600 uppercase">B:</span>
                  <input type="number" className="w-10 bg-white border rounded-lg p-1 text-[10px] font-black text-center outline-none focus:ring-1 ring-indigo-500" value={pctB} onChange={e => handlePctBChange(Number(e.target.value))} />
                  <span className="text-[8px] font-black text-slate-400">%</span>
                </div>
                <div className="w-px h-4 bg-slate-200 mx-1 shrink-0" />
                <div className="flex items-center gap-1 opacity-50 shrink-0">
                  <span className="text-[8px] font-black text-slate-500 uppercase">C:</span>
                  <div className="w-10 bg-slate-100 border rounded-lg p-1 text-[10px] font-black text-center">{pctC}</div>
                  <span className="text-[8px] font-black text-slate-400">%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto justify-between md:justify-start">
              {showSearch ? (
                <div className="relative flex-1 md:w-48 animate-in slide-in-from-right-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input autoFocus type="text" className="w-full bg-slate-50 border rounded-xl py-2 pl-9 pr-8 text-[10px] font-black outline-none focus:ring-2 ring-indigo-500/20" placeholder="BUSCAR..." value={abcSearch} onChange={e => setAbcSearch(e.target.value)} />
                  <button onClick={() => { setShowSearch(false); setAbcSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button onClick={() => setShowSearch(true)} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><Search className="w-4 h-4" /></button>
              )}
              <button onClick={toggleAll} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                {expandedClasses.length === 3 ? <><Minimize2 className="w-3.5 h-3.5" /> Recolher</> : <><Maximize2 className="w-3.5 h-3.5" /> Expandir</>}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {[
              { id: 'A', label: 'Classe A', count: abcData.classes.A.items.length, color: 'bg-amber-50 text-amber-600 border-amber-100' },
              { id: 'B', label: 'Classe B', count: abcData.classes.B.items.length, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
              { id: 'C', label: 'Classe C', count: abcData.classes.C.items.length, color: 'bg-slate-50 text-slate-400 border-slate-100' }
            ].map(card => (
              <div key={card.id} className={`p-3 md:p-6 rounded-2xl md:rounded-[2rem] border text-center ${card.color}`}>
                <p className="text-xl md:text-3xl font-black mb-0.5 md:mb-1">{card.count}</p>
                <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-60">{card.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Object.entries(abcData.classes).map(([key, data]) => {
              const isOpen = expandedClasses.includes(key);
              const theme = key === 'A' ? 'amber' : key === 'B' ? 'indigo' : 'slate';
              const colors: any = { amber: 'bg-amber-50/50 border-amber-100 text-amber-700', indigo: 'bg-indigo-50/50 border-indigo-100 text-indigo-700', slate: 'bg-slate-50/50 border-slate-100 text-slate-600' };
              return (
                <div key={key} className="space-y-2">
                  <button onClick={() => toggleClass(key)} className={`w-full flex items-center justify-between p-4 md:p-5 rounded-[1.5rem] border transition-all ${colors[theme]}`}>
                    <div className="flex items-center gap-2 md:gap-4">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase ${key === 'A' ? 'bg-amber-100' : key === 'B' ? 'bg-indigo-100' : 'bg-slate-200'}`}>Classe {key}</span>
                      <span className="text-[8px] md:text-[10px] font-bold opacity-60 uppercase tracking-widest hidden sm:inline">{data.targetPct}% da receita</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-black">R$ {(Number(data.total) || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                      <p className="text-[8px] md:text-[9px] font-bold opacity-40">{abcData.totalRevenue > 0 ? (((Number(data.total) || 0) / abcData.totalRevenue) * 100 || 0).toFixed(1) : '0.0'}%</p>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="bg-white border rounded-[1.5rem] overflow-x-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
                      <table className="min-w-[600px] w-full text-left text-[11px]">
                        <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
                          <tr>
                            <th className="p-4 w-12">#</th>
                            <th className="p-4">{subTab === 'ABC_CLI' ? 'Cliente' : 'Produto'}</th>
                            <th className="p-4 text-right">Valor</th>
                            <th className="p-4 text-center">(%)</th>
                            <th className="p-4 text-center">{subTab === 'ABC_CLI' ? 'Vendas' : 'Qtd'}</th>
                            <th className="p-4 text-right">T. Médio/Mês</th>
                            <th className="p-4 text-center">Meses</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {data.items.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 text-slate-400 font-bold">{idx + 1}.</td>
                              <td className="p-4 font-black uppercase text-slate-700">{item.name}</td>
                              <td className="p-4 text-right font-black">R$ {(Number(item.total) || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                              <td className="p-4 text-center text-slate-400 font-bold">({(Number(item.pct) || 0).toFixed(1)}%)</td>
                              <td className="p-4 text-center font-bold text-slate-500">{item.count}</td>
                              <td className="p-4 text-right font-black text-indigo-600">R$ {((Number(item.total) || 0) / Math.max(1, item.months?.size || 1) || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                              <td className="p-4 text-center"><span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-black text-[10px]">{item.months?.size || 1}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="space-y-4 pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distribuição de Receita</p>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${abcData.totalRevenue > 0 ? ((Number(abcData.classes.A.total) || 0) / abcData.totalRevenue) * 100 : 0}%` }} />
              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${abcData.totalRevenue > 0 ? ((Number(abcData.classes.B.total) || 0) / abcData.totalRevenue) * 100 : 0}%` }} />
              <div className="h-full bg-slate-300 transition-all duration-1000" style={{ width: `${abcData.totalRevenue > 0 ? ((Number(abcData.classes.C.total) || 0) / abcData.totalRevenue) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReportsView;