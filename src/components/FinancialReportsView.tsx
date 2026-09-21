"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Database, DRELine } from '../types';
import { FileText, Wallet, Settings2, Eye, Plus, ArrowUpRight, ArrowDownRight, ChevronRight, ChevronDown, Layers, Package, AlertTriangle, TrendingUp, TrendingDown, Info, Minus, ArrowUp, ArrowDown, Scale } from 'lucide-react';
import CashFlowView from './CashFlowView';
import Modal from './Modal';
import DREStructureManager from './DREStructureManager';
import { DEFAULT_DRE_STRUCTURE } from '../db';
import { eachMonthOfInterval, startOfMonth, endOfMonth, format, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialReportsViewProps {
  db: Database;
  setDb: (db: Database) => void;
  startDate: string;
  endDate: string;
  forcedTab?: 'DFC' | 'DRE' | 'BALANCO';
}

const Sparkline = ({ data }: { data: number[] }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(Math.abs), 1);
  const width = 40;
  const height = 14;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (Math.abs(v) / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-40 group-hover:opacity-100 transition-opacity">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({ db, setDb, startDate, endDate, forcedTab }) => {
  const [subTab, setSubTab] = useState<'DFC' | 'DRE' | 'BALANCO'>('DRE');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [viewLevel, setViewLevel] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (forcedTab) setSubTab(forcedTab);
  }, [forcedTab]);

  const structure = useMemo(() => {
    const s = db.companyInfo?.dreStructure;
    return s && s.length > 0 ? s : DEFAULT_DRE_STRUCTURE;
  }, [db.companyInfo?.dreStructure]);

  const months = useMemo(() => {
    try {
      return eachMonthOfInterval({
        start: startOfMonth(parseISO(startDate)),
        end: endOfMonth(parseISO(endDate))
      });
    } catch (e) {
      return [startOfMonth(new Date())];
    }
  }, [startDate, endDate]);

  const getAccountValue = (code: string, start: Date, end: Date) => {
    const sStr = format(start, 'yyyy-MM-dd');
    const eStr = format(end, 'yyyy-MM-dd');

    if (code === '1.1' || code === '1.2') {
      return db.sales
        .filter((s: any) => s.date >= sStr && s.date <= eStr && s.paymentMethod !== 'Crediário')
        .reduce((acc: number, sale: any) => {
          const itemTotal = sale.items.reduce((sum: number, item: any) => {
            const product = db.products.find(p => p.id === item.productId);
            const isMatch = (code === '1.1' && (product?.type === 'Revenda' || product?.type === 'Produzido')) ||
                          (code === '1.2' && product?.type === 'Serviço');
            return isMatch ? sum + (item.price * item.quantity) : sum;
          }, 0);
          return acc + itemTotal;
        }, 0);
    }

    if (code === '2.2') {
      return db.sales
        .filter((s: any) => s.date >= sStr && s.date <= eStr && s.paymentMethod !== 'Crediário')
        .reduce((acc: number, s: any) => acc + (s.discount || 0), 0);
    }

    if (code === '3.2') {
      return db.sales
        .filter((s: any) => s.date >= sStr && s.date <= eStr && s.paymentMethod !== 'Crediário')
        .reduce((acc: number, s: any) => acc + s.items.reduce((sum: number, i: any) => {
          const product = db.products.find(p => p.id === i.productId);
          return sum + ((product?.costPrice || 0) * i.quantity);
        }, 0), 0);
    }

    const accountIds = db.accounts
      .filter((a: any) => a.code === code || a.parentCode === code || a.code.startsWith(code + '.'))
      .map((a: any) => a.id);

    return db.expenses
      .filter((e: any) => e.date >= sStr && e.date <= eStr && accountIds.includes(e.accountId))
      .reduce((acc: number, exp: any) => acc + exp.amount, 0);
  };

  const getAlert = (label: string, av: number) => {
    const l = label.toLowerCase();
    if (l.includes('folha') || l.includes('pessoal')) {
      if (av > 18) return { type: 'risk', msg: 'Folha acima de 18%. Risco crítico na margem.' };
      if (av > 15) return { type: 'warn', msg: 'Folha acima de 15%. Atenção ao custo fixo.' };
    }
    if (l.includes('cmv') || l.includes('custo')) {
      if (av > 40) return { type: 'risk', msg: 'CMV acima de 40%. Verifique desperdícios ou preços.' };
      if (av > 35) return { type: 'warn', msg: 'CMV acima de 35%. Margem de contribuição apertada.' };
    }
    return null;
  };

  const dreMatrix = useMemo(() => {
    return months.map(monthDate => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const historyMonths = Array.from({ length: 6 }, (_, i) => subMonths(monthDate, 5 - i));

      let runningTotal = 0;
      const results = structure.map((line: any) => {
        const lineValue = line.accountCodes.reduce((acc: number, code: string) => acc + getAccountValue(code, start, end), 0);
        const sparkData = historyMonths.map(hm => {
          const hStart = startOfMonth(hm);
          const hEnd = endOfMonth(hm);
          return line.accountCodes.reduce((acc: number, code: string) => acc + getAccountValue(code, hStart, hEnd), 0);
        });

        if (line.operation === '+') runningTotal += lineValue;
        else if (line.operation === '-') runningTotal -= lineValue;
        else if (line.operation === '+/-') runningTotal += lineValue;
        
        const finalValue = line.operation === '=' ? runningTotal : lineValue;
        return { ...line, value: finalValue, sparkData };
      });

      const grossRevenueLine = results.find((r: any) => r.label.toLowerCase().includes('bruta')) || results[0];
      const grossRevenue = Math.abs(grossRevenueLine?.value || 0) || 1;

      return {
        month: monthDate,
        grossRevenue,
        lines: results.map((r: any) => ({
          ...r,
          av: (r.value / grossRevenue) * 100
        }))
      };
    });
  }, [months, structure, db.sales, db.expenses, db.accounts, db.products]);

  const handleLevelChange = () => {
    const nextLevel = (viewLevel % 3) + 1;
    setViewLevel(nextLevel as any);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {subTab === 'DRE' && (
        <div className="bg-white p-6 rounded-[3rem] border shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic skew-x-[-6deg] text-indigo-600">DRE Gerencial</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Análise Vertical (AV) | Horizontal (AH) | Alertas</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleLevelChange} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">
                <Layers className="w-3.5 h-3.5" /> Nível {viewLevel}
              </button>
              <button onClick={() => setIsConfigModalOpen(true)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar -mx-6">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="p-4 sticky left-0 bg-slate-50 z-10 w-72 text-[10px] font-black uppercase text-slate-400">Estrutura de Resultados</th>
                  {dreMatrix.map((m, idx) => (
                    <th key={idx} colSpan={3} className="p-4 text-center border-l border-slate-200/50">
                      <span className="text-[10px] font-black uppercase text-indigo-600">{format(m.month, 'MMM/yy', { locale: ptBR })}</span>
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-2 sticky left-0 bg-slate-50/50 z-10"></th>
                  {dreMatrix.map((_, idx) => (
                    <React.Fragment key={idx}>
                      <th className="p-2 text-right text-[8px] font-black text-slate-400 border-l border-slate-200/30">VALOR</th>
                      <th className="p-2 text-center text-[8px] font-black text-emerald-500">AV%</th>
                      <th className="p-2 text-center text-[8px] font-black text-blue-500">AH%</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {structure.map((line: any, lineIdx: number) => {
                  if (!line.isVisible) return null;
                  if (viewLevel === 1 && !line.isMain) return null;
                  if (viewLevel === 2 && line.indent > 1) return null;

                  const isRevenue = line.operation === '+' || line.label.toLowerCase().includes('receita');
                  const isExpense = line.operation === '-' || line.label.toLowerCase().includes('despesa') || line.label.toLowerCase().includes('custo');

                  return (
                    <tr key={line.id} className={`hover:bg-indigo-50/30 transition-colors group ${line.isMain ? 'bg-slate-50/50 font-black' : ''}`}>
                      <td className={`p-4 sticky left-0 z-10 transition-colors ${line.isMain ? 'bg-slate-50/80' : 'bg-white'} border-r border-slate-100`}>
                        <div className="flex items-center justify-between" style={{ paddingLeft: `${line.indent * 12}px` }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[9px] font-black ${line.operation === '=' ? 'text-indigo-600' : 'text-slate-300'}`}>
                              {line.operation === '=' ? 'Σ' : line.operation}
                            </span>
                            <span className={`uppercase tracking-tight truncate ${line.isMain ? 'text-[11px] text-slate-900' : 'text-[10px] text-slate-500'}`}>
                              {line.label}
                            </span>
                          </div>
                          <Sparkline data={dreMatrix[0].lines[lineIdx].sparkData} />
                        </div>
                      </td>
                      {dreMatrix.map((monthData, mIdx) => {
                        const currentLine = monthData.lines[lineIdx] || { value: 0, av: 0 };
                        const prevMonthLine = mIdx > 0 ? dreMatrix[mIdx - 1]?.lines[lineIdx] : null;
                        
                        let ah = 0;
                        if (prevMonthLine && typeof prevMonthLine.value === 'number' && prevMonthLine.value !== 0) {
                          const computed = ((currentLine.value / prevMonthLine.value) - 1) * 100;
                          ah = isNaN(computed) ? 0 : computed;
                        }

                        const getTrendIcon = () => {
                          if (mIdx === 0 || Math.abs(ah) < 0.1) return <Minus className="w-2.5 h-2.5 text-slate-300" />;
                          
                          // Direção da seta baseada no valor numérico
                          const Icon = ah > 0 ? ArrowUp : ArrowDown;
                          
                          // Cor baseada no impacto no lucro (Prompt: Receita ↑ Verde, Despesa ↑ Vermelho)
                          let color = 'text-slate-300';
                          if (isRevenue) color = ah > 0 ? 'text-emerald-500' : 'text-red-500';
                          else if (isExpense) color = ah > 0 ? 'text-red-500' : 'text-emerald-500';
                          else color = ah > 0 ? 'text-blue-500' : 'text-rose-500';

                          return <Icon className={`w-2.5 h-2.5 ${color}`} />;
                        };

                        const alert = getAlert(line.label, currentLine.av);

                        return (
                          <React.Fragment key={mIdx}>
                            <td className={`p-3 text-right font-mono text-[10px] border-l border-slate-100 ${alert?.type === 'risk' ? 'bg-red-50/50' : alert?.type === 'warn' ? 'bg-amber-50/50' : ''}`}>
                              <div className="flex items-center justify-end gap-1.5">
                                {alert && (
                                  <div title={alert.msg} className="cursor-help">
                                    {alert.type === 'risk' ? <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" /> : <Info className="w-3 h-3 text-amber-500" />}
                                  </div>
                                )}
                                <span className={`${currentLine.value === 0 ? 'text-slate-300' : isRevenue ? 'text-emerald-700' : isExpense ? 'text-red-600' : 'text-slate-700'}`}>
                                  R$ {Math.abs(Number(currentLine.value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center border-l border-slate-200/10">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-[9px] text-emerald-600">{(Number(currentLine.av) || 0).toFixed(1)}%</span>
                                <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500/40" style={{ width: `${Math.min(100, Math.max(0, Number(currentLine.av) || 0))}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center border-l border-slate-200/10">
                              <div className="flex items-center justify-center gap-1">
                                {getTrendIcon()}
                                <span className={`font-bold text-[9px] ${mIdx === 0 ? 'text-slate-300' : ah > 0 ? 'text-blue-600' : ah < 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                                  {mIdx === 0 ? '-' : `${ah > 0 ? '+' : ''}${(Number(ah) || 0).toFixed(1)}%`}
                                </span>
                              </div>
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'DFC' && <CashFlowView db={db} startDate={startDate} endDate={endDate} />}
      
      {subTab === 'BALANCO' && (
        <div className="bg-white p-12 rounded-[3rem] border shadow-sm text-center opacity-40">
          <Scale className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-xs font-black uppercase tracking-widest">Balanço Patrimonial em desenvolvimento para visão mensal</p>
        </div>
      )}

      <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title="Configurar Estrutura da DRE" maxWidth="max-w-4xl">
        <DREStructureManager db={db} setDb={setDb} />
      </Modal>
    </div>
  );
};

export default FinancialReportsView;