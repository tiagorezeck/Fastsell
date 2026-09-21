"use client";

import React, { useState, useMemo } from 'react';
import { Wallet, Lock, Unlock, History, ArrowUpCircle, ArrowDownCircle, Plus, Minus, Receipt, Clock } from 'lucide-react';
import { Database, CashierSession, CashierMovement } from '../types';
import { toast } from 'react-hot-toast';

interface CashierManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  isDarkMode?: boolean;
}

const CashierManager: React.FC<CashierManagerProps> = ({ db, setDb, isDarkMode = false }) => {
  const activeSession = db.cashierSessions.find(s => s.status === 'Aberto');
  const [openingValue, setOpeningValue] = useState(0);
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [adjType, setAdjType] = useState<'Suprimento' | 'Sangria'>('Suprimento');
  const [adjValue, setAdjValue] = useState(0);
  const [adjReason, setAdjReason] = useState('');

  const sessionStats = useMemo(() => {
    if (!activeSession) return null;
    const suprimentos = activeSession.movements.filter(m => m.type === 'Suprimento').reduce((a, b) => a + b.amount, 0);
    const sangrias = activeSession.movements.filter(m => m.type === 'Sangria').reduce((a, b) => a + b.amount, 0);
    const vendasDinheiro = activeSession.movements.filter(m => m.type === 'Venda' && (m.method === 'Dinheiro' || m.method === 'Múltiplo')).reduce((a, b) => a + b.amount, 0);
    const vendasOutros = activeSession.movements.filter(m => m.type === 'Venda' && m.method !== 'Dinheiro' && m.method !== 'Múltiplo').reduce((a, b) => a + b.amount, 0);
    
    return {
      suprimentos,
      sangrias,
      vendasDinheiro,
      vendasOutros,
      currentCash: activeSession.openingBalance + suprimentos + vendasDinheiro - sangrias,
      totalSales: vendasDinheiro + vendasOutros
    };
  }, [activeSession]);

  const handleOpenCashier = () => {
    // Ao abrir o caixa, o valor sai do Cofre e entra na Gaveta
    const cofre = db.banks.find(b => b.id === 'b_cofre');
    if (openingValue > (cofre?.initialBalance || 0)) {
      toast.error("Saldo insuficiente no Cofre para abertura!");
      return;
    }

    const newSession: CashierSession = {
      id: `CS${Date.now()}`,
      openedAt: new Date().toISOString(),
      openingBalance: openingValue,
      status: 'Aberto',
      operator: 'Admin',
      movements: [{
        id: `M${Date.now()}`,
        type: 'Abertura',
        description: 'Fundo de Caixa Inicial (Origem: Cofre)',
        amount: openingValue,
        method: 'Dinheiro',
        date: new Date().toISOString()
      }]
    };

    const updatedBanks = db.banks.map(b => {
      if (b.id === 'b_cofre') return { ...b, initialBalance: b.initialBalance - openingValue };
      if (b.id === 'b_gaveta') return { ...b, initialBalance: openingValue };
      return b;
    });

    setDb({ ...db, cashierSessions: [...db.cashierSessions, newSession], banks: updatedBanks });
    toast.success("Caixa aberto! Valor retirado do Cofre.");
  };

  const handleAdjustment = () => {
    if (!activeSession || adjValue <= 0) return;
    
    const cofre = db.banks.find(b => b.id === 'b_cofre');
    
    if (adjType === 'Suprimento' && adjValue > (cofre?.initialBalance || 0)) {
      toast.error("Saldo insuficiente no Cofre para suprimento!");
      return;
    }

    const newMovement: CashierMovement = {
      id: `M${Date.now()}`,
      type: adjType,
      description: adjReason || (adjType === 'Suprimento' ? 'Suprimento (Origem: Cofre)' : 'Sangria (Destino: Cofre)'),
      amount: adjValue,
      method: 'Dinheiro',
      date: new Date().toISOString()
    };

    const updatedBanks = db.banks.map(b => {
      if (b.id === 'b_cofre') {
        return { ...b, initialBalance: adjType === 'Suprimento' ? b.initialBalance - adjValue : b.initialBalance + adjValue };
      }
      if (b.id === 'b_gaveta') {
        return { ...b, initialBalance: adjType === 'Suprimento' ? b.initialBalance + adjValue : b.initialBalance - adjValue };
      }
      return b;
    });

    setDb({
      ...db,
      banks: updatedBanks,
      cashierSessions: db.cashierSessions.map(s => 
        s.id === activeSession.id ? { ...s, movements: [...s.movements, newMovement] } : s
      )
    });

    setIsAdjModalOpen(false);
    setAdjValue(0);
    setAdjReason('');
    toast.success(`${adjType} realizado com sucesso!`);
  };

  const handleCloseCashier = () => {
    if (!activeSession || !sessionStats) return;
    
    if (window.confirm(`Deseja fechar o caixa?\nSaldo em Dinheiro: R$ ${sessionStats.currentCash.toFixed(2)}\nTodo o valor será transferido para o Cofre.`)) {
      
      const updatedBanks = db.banks.map(b => {
        if (b.id === 'b_cofre') return { ...b, initialBalance: b.initialBalance + sessionStats.currentCash };
        if (b.id === 'b_gaveta') return { ...b, initialBalance: 0 };
        return b;
      });

      setDb({
        ...db,
        banks: updatedBanks,
        cashierSessions: db.cashierSessions.map(s => 
          s.id === activeSession.id 
            ? { ...s, status: 'Fechado', closedAt: new Date().toISOString(), closingBalance: sessionStats.currentCash } 
            : s
        )
      });
      toast.success("Caixa fechado! Saldo transferido para o Cofre.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className={`p-8 rounded-[2.5rem] border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-3xl ${activeSession ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'}`}>
                  {activeSession ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Controle de Caixa</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {activeSession ? `Operador: ${activeSession.operator}` : 'Sistema Bloqueado'}
                  </p>
                </div>
              </div>
              {activeSession && (
                <div className="flex gap-2">
                  <button onClick={() => { setAdjType('Suprimento'); setIsAdjModalOpen(true); }} className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all">+ Suprimento</button>
                  <button onClick={() => { setAdjType('Sangria'); setIsAdjModalOpen(true); }} className="bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all">- Sangria</button>
                  <button onClick={handleCloseCashier} className="bg-red-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-100 dark:shadow-none transition-all">Fechar Caixa</button>
                </div>
              )}
            </div>

            {!activeSession ? (
              <div className="space-y-4 p-8 bg-slate-50 dark:bg-slate-700/40 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <div className="max-w-xs mx-auto space-y-4">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-300">Para iniciar as vendas, informe o valor inicial em dinheiro no caixa.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">R$</span>
                    <input type="number" className="w-full border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-4 pl-10 rounded-2xl text-sm font-black outline-none focus:ring-2 ring-indigo-500/20" value={openingValue} onChange={e => setOpeningValue(Number(e.target.value))} />
                  </div>
                  <button onClick={handleOpenCashier} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">Abrir Caixa Agora</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-700/60 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Fundo Inicial</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">R$ {activeSession.openingBalance.toFixed(2)}</p>
                </div>
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-100 dark:border-emerald-800">
                  <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1">Vendas (Dinheiro)</p>
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">R$ {sessionStats?.vendasDinheiro.toFixed(2)}</p>
                </div>
                <div className="p-5 bg-orange-50 dark:bg-orange-950/40 rounded-3xl border border-orange-100 dark:border-orange-800">
                  <p className="text-[8px] font-black text-orange-600 dark:text-orange-400 uppercase mb-1">Sangrias</p>
                  <p className="text-sm font-black text-orange-700 dark:text-orange-300">R$ {sessionStats?.sangrias.toFixed(2)}</p>
                </div>
                <div className="p-5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-100 dark:shadow-none text-white">
                  <p className="text-[8px] font-black opacity-60 uppercase mb-1">Saldo em Dinheiro</p>
                  <p className="text-sm font-black">R$ {sessionStats?.currentCash.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Movements List */}
          {activeSession && (
            <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-widest">Movimentações da Sessão</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-[11px]">
                  <thead className={`font-black border-b uppercase text-[9px] tracking-widest ${isDarkMode ? 'bg-slate-700/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    <tr>
                      <th className="p-4">Hora</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Descrição</th>
                      <th className="p-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {activeSession.movements.slice().reverse().map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-4 text-slate-400 font-medium">{new Date(m.date).toLocaleTimeString('pt-BR')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            m.type === 'Venda' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' :
                            m.type === 'Sangria' ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400' :
                            m.type === 'Suprimento' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                          }`}>{m.type}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{m.description}</td>
                        <td className={`p-4 text-right font-black ${m.type === 'Sangria' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {m.type === 'Sangria' ? '-' : '+'} R$ {m.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col h-fit ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-black uppercase tracking-tight">Últimos Fechamentos</h3>
          </div>
          <div className="space-y-3">
            {db.cashierSessions.filter(s => s.status === 'Fechado').slice().reverse().map(s => (
              <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-700/60 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-500 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase">{new Date(s.closedAt!).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">R$ {s.closingBalance?.toFixed(2)}</span>
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Operador: {s.operator}</p>
              </div>
            ))}
            {db.cashierSessions.filter(s => s.status === 'Fechado').length === 0 && (
              <div className="py-10 text-center opacity-20 font-black uppercase tracking-widest text-[10px]">Sem histórico</div>
            )}
          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              {adjType === 'Suprimento' ? <Plus className="text-emerald-500" /> : <Minus className="text-orange-500" />}
              Lançar {adjType}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valor R$</label>
                <input type="number" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl text-sm font-black outline-none focus:ring-2 ring-indigo-500/20" value={adjValue} onChange={e => setAdjValue(Number(e.target.value))} autoFocus />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Motivo / Observação</label>
                <input type="text" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-indigo-500/20" placeholder="Ex: Troco inicial, Retirada para banco..." value={adjReason} onChange={e => setAdjReason(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleAdjustment} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">Confirmar</button>
                <button onClick={() => setIsAdjModalOpen(false)} className="px-6 bg-slate-100 dark:bg-slate-700 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierManager;