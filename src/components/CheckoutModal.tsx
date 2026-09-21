"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Landmark, CheckCircle2, Printer, Music, Star, ShoppingBag, Minus, Plus } from 'lucide-react';
import Modal from './Modal';
import { Database, Payment, Table } from '../types';
import { toast } from 'react-hot-toast';

interface SplitPayer {
  id: string;
  name: string;
  amount: number;
  method: Payment['method'];
  bankId: string;
  status: 'pending' | 'paid';
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: Database;
  table?: Table;
  isDarkMode?: boolean;
  onFinalize: (payments: Payment[], comandaIds: string[], discount: number) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, db, table, isDarkMode = false, onFinalize }) => {
  const [selectedComandaIds, setSelectedComandaIds] = useState<string[]>([]);
  const [splitPayers, setSplitPayers] = useState<SplitPayer[]>([]);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [couvertPerPerson, setCouvertPerPerson] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'currency' | 'percentage'>('currency');
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('Dinheiro');
  const [bankId, setBankId] = useState<string>('b_gaveta');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  const activeComandas = useMemo(() => table?.comandas.filter(c => c.status === 'Aberta') || [], [table]);

  const getDefaultBankForMethod = (method: Payment['method']) => {
    if (method === 'Dinheiro') return 'b_gaveta';
    const nonGaveta = (db.banks || []).find(b => b.id !== 'b_gaveta' && b.id !== 'b_cofre');
    return nonGaveta?.id || db.banks?.[0]?.id || 'b_gaveta';
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedComandaIds(activeComandas.map(c => c.id));
      setIsSplitMode(false);
      setSplitPayers([]);
      setCouvertPerPerson(0);
      setTipPercentage(10);
      setDiscount(0);
      setDiscountType('currency');
      setPaymentMethod('Dinheiro');
      setBankId('b_gaveta');
      setReceivedAmount(0);
    }
  }, [isOpen, activeComandas]);

  const handlePaymentMethodChange = (newMethod: Payment['method']) => {
    setPaymentMethod(newMethod);
    setBankId(getDefaultBankForMethod(newMethod));
  };

  const selectedComandas = activeComandas.filter(c => selectedComandaIds.includes(c.id));
  const subtotal = selectedComandas.reduce((acc, c) => acc + c.items.reduce((s, i) => s + (i.price * i.quantity), 0), 0);
  const totalCouvert = couvertPerPerson * selectedComandas.length;
  const totalTip = (subtotal * tipPercentage) / 100;
  const calculatedDiscount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
  const grandTotal = Math.max(0, subtotal + totalCouvert + totalTip - calculatedDiscount);

  const change = Math.max(0, receivedAmount - grandTotal);

  const handleStartSplit = (count: number) => {
    const amountPerPerson = grandTotal / count;
    const newPayers: SplitPayer[] = Array.from({ length: count }, (_, i) => ({
      id: `P${Date.now()}-${i}`,
      name: `Pagador ${i + 1}`,
      amount: Number(amountPerPerson.toFixed(2)),
      method: 'Dinheiro',
      bankId: 'b_gaveta',
      status: 'pending'
    }));
    setSplitPayers(newPayers);
    setIsSplitMode(true);
  };

  const handlePayPayer = (payer: SplitPayer) => {
    toast.success(`Pagamento de ${payer.name} recebido!`);
    const updated = splitPayers.map(p => p.id === payer.id ? { ...p, status: 'paid' as const } : p);
    setSplitPayers(updated);
    if (updated.every(p => p.status === 'paid')) {
      onFinalize(
        updated.map(p => ({ method: p.method, amount: p.amount, bankId: p.bankId || getDefaultBankForMethod(p.method) })),
        selectedComandaIds,
        calculatedDiscount
      );
    }
  };

  const totalSplit = splitPayers.reduce((acc, p) => acc + p.amount, 0);
  const diff = Math.abs(grandTotal - totalSplit);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Fechar Mesa ${table?.number}`} maxWidth="max-w-3xl" isDarkMode={isDarkMode}>
      <div className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" /> Selecione as Comandas para Pagar
            </h3>
            {!isSplitMode && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Dividir:</span>
                {[2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => handleStartSplit(n)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
                  >
                    {n}x
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeComandas.map(c => {
              const customer = db.customers.find(cust => cust.id === c.customerId);
              const isSelected = selectedComandaIds.includes(c.id);
              return (
                <button 
                  key={c.id}
                  onClick={() => setSelectedComandaIds(prev => isSelected ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 opacity-60'}`}
                >
                  <p className="text-[10px] font-black uppercase truncate">{customer?.name || 'Consumidor'}</p>
                  <p className="text-[8px] font-bold text-slate-400">Comanda {c.number}</p>
                </button>
              );
            })}
          </div>
        </div>

        {!isSplitMode ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Music className="w-3 h-3" /> Couvert (p/ pessoa)</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700 overflow-hidden">
                  <button onClick={() => setCouvertPerPerson(v => Math.max(0, v - 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-indigo-600 shrink-0"><Minus className="w-4 h-4" /></button>
                  <input type="number" className="w-full bg-transparent border-none text-center font-black text-sm outline-none text-slate-900 dark:text-white" value={couvertPerPerson} onFocus={(e) => e.target.select()} onChange={e => setCouvertPerPerson(Number(e.target.value))} />
                  <button onClick={() => setCouvertPerPerson(v => v + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-indigo-600 shrink-0"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Star className="w-3 h-3" /> Gorjeta (%)</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700 overflow-hidden">
                  <button onClick={() => setTipPercentage(v => Math.max(0, v - 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-indigo-600 shrink-0"><Minus className="w-4 h-4" /></button>
                  <input type="number" className="w-full bg-transparent border-none text-center font-black text-sm outline-none text-slate-900 dark:text-white" value={tipPercentage} onFocus={(e) => e.target.select()} onChange={e => setTipPercentage(Number(e.target.value))} />
                  <button onClick={() => setTipPercentage(v => v + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-indigo-600 shrink-0"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">Desconto</label>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700 overflow-hidden">
                  <div className="flex bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 p-0.5 shrink-0">
                    <button onClick={() => setDiscountType('currency')} className={`px-2 py-1 rounded-md text-[8px] font-black transition-all ${discountType === 'currency' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>R$</button>
                    <button onClick={() => setDiscountType('percentage')} className={`px-2 py-1 rounded-md text-[8px] font-black transition-all ${discountType === 'percentage' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>%</button>
                  </div>
                  <input type="number" className="w-full bg-transparent border-none text-center font-black text-sm outline-none text-slate-900 dark:text-white" value={discount} onFocus={(e) => e.target.select()} onChange={e => setDiscount(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-[0.3em]">Total Unificado</p>
              <p className="text-5xl font-black mb-1">R$ {grandTotal.toFixed(2)}</p>
              <div className="flex justify-center gap-4 text-[9px] opacity-40 uppercase font-bold mt-2">
                <span>Consumo: R$ {subtotal.toFixed(2)}</span>
                <span>Taxas: R$ {(totalCouvert + totalTip).toFixed(2)}</span>
                {calculatedDiscount > 0 && <span className="text-red-400">Desconto: - R$ {calculatedDiscount.toFixed(2)}</span>}
              </div>
            </div>

            {paymentMethod === 'Dinheiro' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 ml-1">Valor Recebido R$</label>
                  <input type="number" className="w-full bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl text-lg font-black text-emerald-700 dark:text-emerald-300 outline-none focus:ring-4 ring-emerald-500/10" value={receivedAmount || ''} onFocus={(e) => e.target.select()} onChange={e => setReceivedAmount(Number(e.target.value))} placeholder="0,00" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 ml-1">Troco a Devolver R$</label>
                  <div className="w-full bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-100 dark:border-orange-800 p-4 rounded-2xl text-lg font-black text-orange-700 dark:text-orange-300 flex items-center justify-center">
                    {change.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Forma de Pagamento</label>
                <select className="w-full bg-slate-100 dark:bg-slate-800 border-none p-4 rounded-2xl text-xs font-black uppercase outline-none text-slate-900 dark:text-white" value={paymentMethod} onChange={e => handlePaymentMethodChange(e.target.value as any)}>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Débito">Débito</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Conta de Destino</label>
                <div className="relative">
                  <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="w-full bg-slate-100 dark:bg-slate-800 border-none p-4 pl-10 rounded-2xl text-xs font-black uppercase outline-none text-slate-900 dark:text-white" value={bankId} onChange={e => setBankId(e.target.value)}>
                    {(db.banks || []).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onFinalize([{ method: paymentMethod, amount: grandTotal, bankId }], selectedComandaIds, calculatedDiscount)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
            >
              Pagar Tudo (R$ {grandTotal.toFixed(2)})
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">Gerenciar Pagadores</h3>
              <button onClick={() => setIsSplitMode(false)} className="text-[10px] font-black text-red-500 uppercase">Voltar</button>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {splitPayers.map(payer => (
                <div key={payer.id} className={`p-4 rounded-2xl border-2 flex flex-wrap sm:flex-nowrap items-center gap-3 transition-all ${payer.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                  <input disabled={payer.status === 'paid'} className="flex-1 min-w-[120px] bg-transparent border-none font-black uppercase text-xs outline-none text-slate-900 dark:text-white" value={payer.name} onChange={e => setSplitPayers(prev => prev.map(p => p.id === payer.id ? { ...p, name: e.target.value } : p))} />
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <select 
                      disabled={payer.status === 'paid'} 
                      className="bg-slate-50 dark:bg-slate-700 border-none p-2 rounded-xl text-[10px] font-black uppercase outline-none text-slate-900 dark:text-white" 
                      value={payer.method} 
                      onChange={e => {
                        const m = e.target.value as Payment['method'];
                        setSplitPayers(prev => prev.map(p => p.id === payer.id ? { ...p, method: m, bankId: getDefaultBankForMethod(m) } : p));
                      }}
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Pix">Pix</option>
                      <option value="Crédito">Crédito</option>
                      <option value="Débito">Débito</option>
                    </select>

                    <select 
                      disabled={payer.status === 'paid'} 
                      className="bg-slate-50 dark:bg-slate-700 border-none p-2 rounded-xl text-[10px] font-black uppercase outline-none text-slate-900 dark:text-white max-w-[110px]" 
                      value={payer.bankId} 
                      onChange={e => setSplitPayers(prev => prev.map(p => p.id === payer.id ? { ...p, bankId: e.target.value } : p))}
                    >
                      {(db.banks || []).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>

                    <input type="number" disabled={payer.status === 'paid'} className="w-20 bg-slate-50 dark:bg-slate-700 border-none p-2 rounded-xl text-xs font-black outline-none text-slate-900 dark:text-white" value={payer.amount} onFocus={(e) => e.target.select()} onChange={e => setSplitPayers(prev => prev.map(p => p.id === payer.id ? { ...p, amount: Number(e.target.value) } : p))} />
                    {payer.status === 'pending' ? (
                      <button onClick={() => handlePayPayer(payer)} disabled={diff > 0.05} className={`p-2 rounded-xl ${diff > 0.05 ? 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500' : 'bg-indigo-600 text-white'}`}><Printer className="w-4 h-4" /></button>
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CheckoutModal;
