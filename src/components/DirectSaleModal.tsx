"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Truck, Clock, CheckCircle2, Save, Landmark
} from 'lucide-react';
import Modal from './Modal';
import SearchableSelect from './SearchableSelect';
import { Database, Payment, CartItem, Sale } from '../types';
import { toast } from 'react-hot-toast';

interface DirectSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: Database;
  setDb: (db: Database) => void;
  cart: CartItem[];
  isDarkMode?: boolean;
  initialPaymentMethod?: Payment['method'];
  onFinalize: (saleData: Partial<Sale>) => void;
  onSendToCounter: (customerId: string) => void;
}

const DirectSaleModal: React.FC<DirectSaleModalProps> = ({ 
  isOpen, onClose, db, cart, isDarkMode = false, initialPaymentMethod = 'Dinheiro', onFinalize, onSendToCounter 
}) => {
  const [deliveryType, setDeliveryType] = useState<'Retirada' | 'Entrega' | 'Balcão'>('Retirada');
  const [customerId, setCustomerId] = useState('');
  const [sellerId, setSellerId] = useState(db.users?.[0]?.id || '');
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingPayer, setShippingPayer] = useState<'Cliente' | 'Empresa'>('Cliente');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'currency' | 'percentage'>('currency');
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>(initialPaymentMethod);
  const [bankId, setBankId] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [pickupTime, setPickupTime] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculatedDiscount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
  const total = Math.max(0, subtotal + (deliveryType === 'Entrega' && shippingPayer === 'Cliente' ? shippingFee : 0) - calculatedDiscount);

  const change = Math.max(0, receivedAmount - total);

  const selectedCustomer = useMemo(() => (db.customers || []).find(c => c.id === customerId), [db.customers, customerId]);

  const creditCheck = useMemo(() => {
    if (!selectedCustomer) return { allowed: false, reason: 'Selecione um cliente' };
    if (!selectedCustomer.creditEnabled) return { allowed: false, reason: 'Crediário não habilitado' };
    
    if (selectedCustomer.creditStatus === 'Bloqueado' || selectedCustomer.creditStatus === 'Banido') {
      return { allowed: false, reason: `Crédito ${selectedCustomer.creditStatus}` };
    }

    const availableLimit = selectedCustomer.creditLimit - selectedCustomer.currentDebt;
    if (total > availableLimit) {
      return { allowed: false, reason: `Limite insuficiente (Disp: R$ ${availableLimit.toFixed(2)})` };
    }

    return { allowed: true, availableLimit };
  }, [selectedCustomer, total]);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(initialPaymentMethod);
      setReceivedAmount(0);
      setDiscount(0);
      setShippingFee(0);
      setPickupTime('');
      // Sugestão inteligente de conta
      if (initialPaymentMethod === 'Dinheiro') setBankId('b_gaveta');
      else {
        const firstBank = (db.banks || []).find(b => b.id !== 'b_gaveta' && b.id !== 'b_cofre');
        setBankId(firstBank?.id || db.banks?.[0]?.id || 'b_gaveta');
      }
    }
  }, [isOpen, initialPaymentMethod, db.banks]);

  const handleFinalize = () => {
    if (deliveryType === 'Balcão') {
      onSendToCounter(customerId);
      return;
    }

    if (paymentMethod === 'Crediário' && !creditCheck.allowed) {
      toast.error(creditCheck.reason || "Erro no crediário");
      return;
    }

    const targetBank = paymentMethod === 'Crediário' ? undefined : (bankId || (paymentMethod === 'Dinheiro' ? 'b_gaveta' : (db.banks?.[0]?.id || 'b_gaveta')));

    const saleData: Partial<Sale> = {
      customerId,
      sellerId,
      subtotal,
      discount: calculatedDiscount,
      total,
      deliveryType: deliveryType === 'Entrega' ? 'Entrega' : 'Retirada',
      shippingFee: deliveryType === 'Entrega' ? shippingFee : 0,
      shippingPayer,
      payments: [{ method: paymentMethod, amount: total, bankId: targetBank }],
      paymentMethod: paymentMethod,
      type: 'Venda',
      status: 'Pendente',
      pickupTime: deliveryType === 'Retirada' ? pickupTime : undefined
    };

    onFinalize(saleData);
  };

  const labelClass = "text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 ml-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Venda" maxWidth="max-w-3xl" isDarkMode={isDarkMode}>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[2rem]">
          {[
            { id: 'Retirada', label: 'Retirada', icon: <ShoppingBag /> },
            { id: 'Entrega', label: 'Delivery', icon: <Truck /> },
            { id: 'Balcão', label: 'P/ Balcão', icon: <Clock /> },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setDeliveryType(t.id as any)}
              className={`flex flex-col items-center justify-center py-4 rounded-[1.5rem] transition-all ${deliveryType === t.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600'}`}
            >
              {React.cloneElement(t.icon as any, { className: 'w-5 h-5 mb-1' })}
              <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <SearchableSelect label="Cliente" placeholder="Consumidor Final" options={(db.customers || []).map(c => ({ id: c.id, name: c.name, subtext: c.whatsapp }))} value={customerId} onChange={setCustomerId} />
              
              <div className="space-y-1">
                <label className={labelClass}>Vendedor</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 p-3 rounded-2xl text-xs font-bold outline-none text-slate-900 dark:text-white" value={sellerId} onChange={e => setSellerId(e.target.value)}>
                  {(db.users || []).filter(u => u.role === 'Vendedor' || u.role === 'Admin').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {deliveryType === 'Retirada' && (
                <div className="space-y-1 animate-in slide-in-from-top-2">
                  <label className={labelClass}>Horário Previsto p/ Retirada</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                    <input 
                      type="time" 
                      className="w-full bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-100 dark:border-indigo-800 p-3 pl-10 rounded-2xl text-sm font-black outline-none focus:ring-4 ring-indigo-500/10 text-slate-900 dark:text-white"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {deliveryType === 'Entrega' && (
              <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-[2rem] border border-indigo-100 dark:border-indigo-800 space-y-4 animate-in slide-in-from-left-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelClass}>Taxa de Entrega</label>
                    <input type="number" className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 p-3 rounded-xl text-xs font-black outline-none text-slate-900 dark:text-white" value={shippingFee} onChange={e => setShippingFee(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Quem Paga?</label>
                    <select className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 p-3 rounded-xl text-[10px] font-black uppercase outline-none text-slate-900 dark:text-white" value={shippingPayer} onChange={e => setShippingPayer(e.target.value as any)}>
                      <option value="Cliente">Cliente</option>
                      <option value="Empresa">Empresa</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className={labelClass}>Aplicar Desconto</label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border dark:border-slate-700">
                <div className="flex bg-white dark:bg-slate-700 rounded-xl border dark:border-slate-600 p-0.5 shrink-0">
                  <button onClick={() => setDiscountType('currency')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${discountType === 'currency' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>R$</button>
                  <button onClick={() => setDiscountType('percentage')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${discountType === 'percentage' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>%</button>
                </div>
                <input type="number" className="w-full bg-transparent border-none text-sm font-black outline-none px-2 text-slate-900 dark:text-white" placeholder="0,00" value={discount || ''} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-indigo-400">Total a Pagar</span>
                  <span className="text-3xl font-black">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {deliveryType !== 'Balcão' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={labelClass}>Forma de Pagamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Dinheiro', 'Pix', 'Crédito', 'Débito'].map(m => (
                      <button key={m} onClick={() => {
                        setPaymentMethod(m as any);
                        if (m === 'Dinheiro') setBankId('b_gaveta');
                        else {
                          const nonGaveta = (db.banks || []).find(b => b.id !== 'b_gaveta' && b.id !== 'b_cofre');
                          setBankId(nonGaveta?.id || db.banks?.[0]?.id || 'b_gaveta');
                        }
                      }} className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === m ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400'}`}>
                        <span className="text-[9px] font-black uppercase">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod !== 'Crediário' && (
                  <div className="space-y-1 animate-in slide-in-from-top-2">
                    <label className={labelClass}>Conta de Destino</label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 p-3 pl-9 rounded-2xl text-[10px] font-black uppercase outline-none text-slate-900 dark:text-white" value={bankId} onChange={e => setBankId(e.target.value)}>
                        {(db.banks || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Dinheiro' && (
                  <div className="grid grid-cols-2 gap-3 animate-in zoom-in-95 duration-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 ml-1">Valor Recebido</label>
                      <input type="number" className="w-full bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-100 dark:border-emerald-800 p-3 rounded-xl text-base font-black text-emerald-700 dark:text-emerald-300 outline-none" value={receivedAmount || ''} onFocus={(e) => e.target.select()} onChange={e => setReceivedAmount(Number(e.target.value))} placeholder="0,00" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 ml-1">Troco</label>
                      <div className="w-full bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-100 dark:border-orange-800 p-3 rounded-xl text-base font-black text-orange-700 dark:text-orange-300 flex items-center justify-center">
                        R$ {change.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleFinalize} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
          {deliveryType === 'Balcão' ? <><Save className="w-5 h-5" /> Enviar para o Balcão</> : <><CheckCircle2 className="w-5 h-5" /> Finalizar e Imprimir</>}
        </button>
      </div>
    </Modal>
  );
};

export default DirectSaleModal;
