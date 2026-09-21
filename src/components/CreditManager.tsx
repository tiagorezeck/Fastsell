"use client";

import React, { useMemo, useState } from 'react';
import { Wallet, Search, Clock, Banknote, ArrowRight } from 'lucide-react';
import { Database, Customer, CartItem } from '../types';
import { toast } from 'react-hot-toast';
import { differenceInDays, parseISO } from 'date-fns';

interface CreditManagerProps {
  db: Database;
  onPayDebt: (customer: Customer, amount: number) => void;
}

const CreditManager: React.FC<CreditManagerProps> = ({ db, onPayDebt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const customersWithCredit = useMemo(() => {
    return db.customers.filter(c => 
      (c.creditEnabled || c.currentDebt > 0) && 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.currentDebt - a.currentDebt);
  }, [db.customers, searchTerm]);

  const handleStartPayment = () => {
    if (!selectedCustomer || paymentAmount <= 0) return;
    if (paymentAmount > selectedCustomer.currentDebt) {
      toast.error("Valor maior que a dívida atual!");
      return;
    }
    onPayDebt(selectedCustomer, paymentAmount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Gestão de Crediário</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Controle de Fiado e Aging de Cobrança</p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {customersWithCredit.map(c => {
            const daysPast = c.lastCreditPurchase ? differenceInDays(new Date(), parseISO(c.lastCreditPurchase)) : 0;
            return (
              <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                    c.creditStatus === 'Liberado' ? 'bg-emerald-50 text-emerald-600' :
                    c.creditStatus === 'Alerta' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase text-slate-700">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${
                        c.creditStatus === 'Liberado' ? 'bg-emerald-50 text-emerald-600' :
                        c.creditStatus === 'Alerta' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {c.creditStatus}
                      </span>
                      {c.currentDebt > 0 && (
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {daysPast} dias em aberto
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Saldo Devedor</p>
                    <p className="text-lg font-black text-red-600">R$ {c.currentDebt.toFixed(2)}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">Limite: R$ {c.creditLimit.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedCustomer(c); setPaymentAmount(c.currentDebt); }}
                    className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <Banknote className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
          {customersWithCredit.length === 0 && (
            <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhum crediário ativo</div>
          )}
        </div>

        <div className="space-y-6">
          {selectedCustomer ? (
            <div className="bg-white p-8 rounded-[3rem] border-2 border-indigo-600 shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">Receber Pagamento</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cliente</p>
                  <p className="text-sm font-black uppercase text-slate-700">{selectedCustomer.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valor do Pagamento R$</label>
                  <input 
                    type="number" 
                    className="w-full border-none bg-slate-100 p-4 rounded-2xl text-lg font-black outline-none focus:ring-2 ring-indigo-500/20"
                    value={paymentAmount || ''}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleStartPayment} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    Ir para o PDV <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedCustomer(null)} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Sair</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-950 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-60">Resumo de Crédito</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400">Total a Receber</p>
                  <p className="text-3xl font-black">R$ {db.customers.reduce((a, b) => a + b.currentDebt, 0).toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-amber-400">Em Alerta</p>
                    <p className="text-lg font-black">{db.customers.filter(c => c.creditStatus === 'Alerta').length}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-red-400">Bloqueados</p>
                    <p className="text-lg font-black">{db.customers.filter(c => c.creditStatus === 'Bloqueado' || c.creditStatus === 'Banido').length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditManager;