"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Landmark, Search, ArrowUpCircle, ArrowDownCircle, CheckCircle2, AlertCircle, RefreshCw, Calculator, History, ArrowRightLeft, Wallet, Upload, FileSpreadsheet, Check, X, Info } from 'lucide-react';
import { Database, Bank, Expense } from '../types';
import { toast } from 'react-hot-toast';
import { parseCSV } from '../utils/csv';
import { format, parseISO, isSameDay } from 'date-fns';

interface StatementRecord {
  date: string;
  description: string;
  amount: number;
  matchedId?: string;
}

interface BankReconciliationProps {
  db: Database;
  setDb: (db: Database) => void;
}

const BankReconciliation: React.FC<BankReconciliationProps> = ({ db, setDb }) => {
  const [selectedBankId, setSelectedBankId] = useState<string>(db.banks[0]?.id || '');
  const [realBalance, setRealBalance] = useState<number>(0);
  const [statementRecords, setStatementRecords] = useState<StatementRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBank = db.banks.find(b => b.id === selectedBankId);

  // Transações do Sistema
  const systemTransactions = useMemo(() => {
    if (!selectedBankId) return [];
    const transactions: any[] = [];

    db.sales.forEach(s => {
      s.payments.forEach(p => {
        if (p.bankId === selectedBankId || (!p.bankId && p.method === 'Dinheiro' && selectedBankId === 'b_gaveta')) {
          transactions.push({ id: `S-${s.id}`, date: s.date, description: `Venda #${s.id.slice(-6)}`, amount: p.amount, type: 'Entrada' });
        }
      });
    });

    db.expenses.forEach(e => {
      if (e.bankId === selectedBankId) {
        transactions.push({ id: `E-${e.id}`, date: e.date, description: e.description, amount: -e.amount, type: 'Saída' });
      }
    });

    db.cashierSessions.forEach(s => {
      s.movements.forEach(m => {
        if (m.bankId === selectedBankId) {
          transactions.push({ id: `M-${m.id}`, date: m.date, description: m.description, amount: (m.type === 'Suprimento' || m.type === 'Abertura') ? m.amount : -m.amount, type: m.amount > 0 ? 'Entrada' : 'Saída' });
        }
      });
    });

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [db, selectedBankId]);

  const systemBalance = useMemo(() => {
    if (!selectedBank) return 0;
    const transTotal = systemTransactions.reduce((acc, t) => acc + t.amount, 0);
    return selectedBank.initialBalance + transTotal;
  }, [selectedBank, systemTransactions]);

  // Lógica de Cruzamento (Matching)
  const comparisonData = useMemo(() => {
    if (statementRecords.length === 0) return null;

    const matchedSystemIds = new Set<string>();
    
    const comparison = statementRecords.map(st => {
      // Tenta encontrar um par no sistema: mesmo valor e mesma data (ou próxima)
      const match = systemTransactions.find(sys => 
        !matchedSystemIds.has(sys.id) && 
        Math.abs(sys.amount - st.amount) < 0.01 &&
        isSameDay(parseISO(sys.date), parseISO(st.date))
      );

      if (match) {
        matchedSystemIds.add(match.id);
        return { statement: st, system: match, status: 'MATCHED' as const };
      }
      return { statement: st, system: null, status: 'MISSING_IN_SYSTEM' as const };
    });

    // Adiciona o que tem no sistema mas não no extrato
    const unmatchedSystem = systemTransactions
      .filter(sys => !matchedSystemIds.has(sys.id))
      .map(sys => ({ statement: null, system: sys, status: 'MISSING_IN_STATEMENT' as const }));

    return [...comparison, ...unmatchedSystem].sort((a, b) => {
      const dateA = a.statement?.date || a.system?.date || '';
      const dateB = b.statement?.date || b.system?.date || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [statementRecords, systemTransactions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rows = parseCSV(event.target?.result as string);
        // Mapeamento flexível para colunas comuns de extrato (Data, Descrição, Valor)
        const mapped: StatementRecord[] = rows.map(r => {
          const dateKey = Object.keys(r).find(k => k.toLowerCase().includes('data')) || '';
          const descKey = Object.keys(r).find(k => k.toLowerCase().includes('desc')) || '';
          const valKey = Object.keys(r).find(k => k.toLowerCase().includes('valor') || k.toLowerCase().includes('monto') || k.toLowerCase().includes('amount')) || '';
          
          let dateStr = r[dateKey];
          if (dateStr && dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            dateStr = `${y}-${m}-${d}`;
          }

          return {
            date: dateStr || new Date().toISOString(),
            description: r[descKey] || 'Sem descrição',
            amount: Number(r[valKey]) || 0
          };
        }).filter(r => r.amount !== 0);

        setStatementRecords(mapped);
        toast.success(`${mapped.length} lançamentos lidos do extrato!`);
      } catch (err) {
        toast.error("Erro ao ler o arquivo CSV. Verifique o formato.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReconcile = () => {
    if (!selectedBank) return;
    const diff = realBalance - systemBalance;
    if (Math.abs(diff) < 0.01) {
      toast.success("Saldo já está conciliado!");
      return;
    }

    if (window.confirm(`Divergência de R$ ${diff.toFixed(2)} detectada.\nDeseja criar um lançamento de ajuste para igualar o saldo do sistema ao saldo real?`)) {
      const adjustmentAccount = db.accounts.find(a => a.code === (diff > 0 ? '5.2.5' : '5.1.5'));
      const newAdjustment: Expense = {
        id: `ADJ-${Date.now()}`,
        description: `Ajuste de Conciliação Bancária - ${selectedBank.name}`,
        amount: diff > 0 ? -diff : Math.abs(diff),
        date: new Date().toISOString(),
        accountId: adjustmentAccount?.id || 'adj_acc',
        bankId: selectedBankId
      };
      setDb({ ...db, expenses: [...db.expenses, newAdjustment] });
      setRealBalance(0);
      toast.success("Conciliação realizada com sucesso!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Conciliação Bancária</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Comparativo Lado a Lado</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="bg-slate-50 border-none p-3 rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 ring-indigo-500/20 flex-1 md:w-64"
            value={selectedBankId}
            onChange={e => { setSelectedBankId(e.target.value); setStatementRecords([]); }}
          >
            {db.banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4" /> Importar Extrato
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Área de Comparação */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 border-b bg-slate-50/50">
              <div className="p-4 border-r flex items-center gap-2">
                <Landmark className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">No Extrato Bancário</span>
              </div>
              <div className="p-4 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-[8px] text-white font-black">F</div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">No Sistema (FASTSELL)</span>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar divide-y">
              {comparisonData ? (
                comparisonData.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 group hover:bg-slate-50/50 transition-all">
                    {/* Lado do Extrato */}
                    <div className={`p-4 border-r flex items-center justify-between ${!row.statement ? 'bg-slate-50/30 opacity-30' : ''}`}>
                      {row.statement ? (
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-black uppercase text-slate-700 truncate pr-2">{row.statement.description}</p>
                            <span className={`text-[10px] font-black ${row.statement.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {row.statement.amount > 0 ? '+' : ''} R$ {Math.abs(row.statement.amount).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{format(parseISO(row.statement.date), 'dd/MM/yyyy')}</p>
                        </div>
                      ) : (
                        <div className="flex-1 text-center py-2">
                          <p className="text-[8px] font-black text-slate-300 uppercase italic">Não encontrado no extrato</p>
                        </div>
                      )}
                    </div>

                    {/* Lado do Sistema */}
                    <div className={`p-4 flex items-center justify-between ${!row.system ? 'bg-red-50/30' : row.status === 'MATCHED' ? 'bg-emerald-50/20' : ''}`}>
                      {row.system ? (
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-[10px] font-black uppercase text-slate-700 truncate pr-2">{row.system.description}</p>
                              <span className={`text-[10px] font-black ${row.system.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {row.system.amount > 0 ? '+' : ''} R$ {Math.abs(row.system.amount).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">{format(parseISO(row.system.date), 'dd/MM/yyyy')}</p>
                          </div>
                          {row.status === 'MATCHED' && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-2">
                          <p className="text-[8px] font-black text-red-400 uppercase mb-1">Pendente no Sistema</p>
                          <button className="text-[7px] font-black text-indigo-600 uppercase hover:underline">+ Lançar Agora</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Aguardando Extrato</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Suba um arquivo CSV para comparar com o sistema</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Resumo e Ajuste */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border shadow-xl space-y-8">
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Saldo no Sistema</p>
                <p className="text-3xl font-black text-slate-800">R$ {systemBalance.toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-indigo-600 ml-1">Saldo Real (Extrato)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">R$</span>
                  <input 
                    type="number" 
                    className="w-full border-2 border-indigo-100 bg-white p-4 pl-10 rounded-2xl text-lg font-black outline-none focus:ring-4 ring-indigo-500/10"
                    value={realBalance || ''}
                    onChange={e => setRealBalance(Number(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                Math.abs(realBalance - systemBalance) < 0.01 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
              }`}>
                {Math.abs(realBalance - systemBalance) < 0.01 ? (
                  <><CheckCircle2 className="w-5 h-5" /><span className="text-[10px] font-black uppercase">Saldos Batendo</span></>
                ) : (
                  <><AlertCircle className="w-5 h-5" /><span className="text-[10px] font-black uppercase">Diferença: R$ {(realBalance - systemBalance).toFixed(2)}</span></>
                )}
              </div>
            </div>

            <button 
              onClick={handleReconcile}
              className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
            >
              <Calculator className="w-5 h-5" /> Conciliar Agora
            </button>
          </div>

          <div className="bg-indigo-950 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
              <Info className="w-4 h-4" /> Dica de Formato
            </h3>
            <p className="text-[10px] font-bold text-indigo-200 leading-relaxed uppercase">
              O sistema aceita arquivos CSV com colunas de "Data", "Descrição" e "Valor". Ele ignora linhas vazias e tenta cruzar automaticamente lançamentos com o mesmo valor e data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankReconciliation;