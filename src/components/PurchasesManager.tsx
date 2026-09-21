"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Truck, Save, X, Package, Calculator, Zap, Search, PlusCircle, ClipboardCheck, History, Clock, CheckCircle2, ChevronDown, ChevronUp, Check, AlertTriangle, ScanLine, Camera, Eye, ArrowRight, Barcode, Landmark, FileText } from 'lucide-react';
import { Database, Product, Supplier, StockMovement, PurchaseOrder, Expense } from '../types';
import { toast } from 'react-hot-toast';
import Scanner from './Scanner';

interface PurchasesManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  initialDraft?: { items: any[], supplierId?: string } | null;
  onClearDraft?: () => void;
}

const PurchasesManager: React.FC<PurchasesManagerProps> = ({ db, setDb, initialDraft, onClearDraft }) => {
  const [view, setView] = useState<'PEDIDOS' | 'HISTORICO' | 'NOVO_PEDIDO' | 'CONFERENCIA'>('PEDIDOS');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; cost: number }[]>([]);
  const [searchItem, setSearchItem] = useState('');
  const [activeOrder, setActiveOrder] = useState<PurchaseOrder | null>(null);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isListSearchOpen, setIsListSearchOpen] = useState(false);
  const [listSearch, setListSearch] = useState('');
  
  const [selectedBankId, setSelectedBankId] = useState(db.banks[0]?.id || '');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  useEffect(() => {
    if (initialDraft) {
      setView('NOVO_PEDIDO');
      setItems(initialDraft.items);
      if (initialDraft.supplierId) setSelectedSupplier(initialDraft.supplierId);
      if (onClearDraft) onClearDraft();
    }
  }, [initialDraft]);

  useEffect(() => {
    const defaultAcc = db.accounts.find(a => a.code === '6.1.6');
    if (defaultAcc) setSelectedAccountId(defaultAcc.id);
  }, [db.accounts]);

  const filteredOrders = useMemo(() => {
    const base = (view === 'PEDIDOS' || view === 'CONFERENCIA') 
      ? db.purchaseOrders.filter(o => o.status === 'Pendente') 
      : db.purchaseOrders.filter(o => o.status === 'Recebido');
    
    return base.filter(o => {
      const supplier = db.suppliers.find(s => s.id === o.supplierId);
      const matchesSearch = !listSearch || 
        supplier?.name.toLowerCase().includes(listSearch.toLowerCase()) || 
        o.id.toLowerCase().includes(listSearch.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [db.purchaseOrders, db.suppliers, view, listSearch]);

  const handleCreateOrder = () => {
    if (!selectedSupplier) {
      toast.error("Selecione um fornecedor");
      return;
    }
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }
    
    const newOrder: PurchaseOrder = { 
      id: `PO${Date.now()}`, 
      date: new Date().toISOString(), 
      supplierId: selectedSupplier, 
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity, cost: i.cost })), 
      total: items.reduce((acc, i) => acc + (i.cost * i.quantity), 0), 
      status: 'Pendente' 
    };

    setDb({ ...db, purchaseOrders: [...db.purchaseOrders, newOrder] });
    setView('PEDIDOS'); 
    setItems([]); 
    setSelectedSupplier(''); 
    toast.success("Pedido de compra gerado!");
  };

  const handleConfirmReceipt = () => {
    if (!activeOrder) return;
    if (!selectedBankId) {
      toast.error("Selecione uma conta bancária para o pagamento");
      return;
    }
    
    const receivedItems = activeOrder.items.map(item => ({
      ...item,
      receivedQty: Math.min(item.quantity, receivedQtys[item.productId] || 0)
    })).filter(i => i.receivedQty > 0);

    const pendingItems = activeOrder.items.map(item => ({
      ...item,
      remainingQty: item.quantity - (receivedQtys[item.productId] || 0)
    })).filter(i => i.remainingQty > 0);

    if (receivedItems.length === 0) {
      toast.error("Nenhum item conferido!");
      return;
    }

    let updatedProducts = [...db.products];
    const newMovements: StockMovement[] = [];
    const totalReceivedValue = receivedItems.reduce((acc, i) => acc + (i.cost * i.receivedQty), 0);

    receivedItems.forEach(item => {
      updatedProducts = updatedProducts.map(p => {
        if (p.id === item.productId) {
          const newBatch = { 
            id: `B${Date.now()}-${p.id}`, 
            batchNumber: `PO-${activeOrder.id.slice(-6)}`, 
            entryDate: new Date().toISOString(), 
            expirationDate: p.expirationDate, 
            quantity: item.receivedQty, 
            costPrice: item.cost 
          };
          const updatedBatches = [...(p.batches || []), newBatch];
          return { 
            ...p, 
            batches: updatedBatches, 
            stock: updatedBatches.reduce((acc, b) => acc + b.quantity, 0), 
            costPrice: item.cost 
          };
        }
        return p;
      });

      newMovements.push({ 
        id: `M${Date.now()}-${item.productId}`, 
        productId: item.productId, 
        direction: 'Entrada', 
        natureId: 'nat_suprimento', 
        quantity: item.receivedQty, 
        reason: `Compra de Mercadoria #${activeOrder.id.slice(-6)}`, 
        date: new Date().toISOString() 
      } as any);
    });

    const supplier = db.suppliers.find(s => s.id === activeOrder.supplierId);
    const newExpense: Expense = {
      id: `EXP-PO-${activeOrder.id}`, // Usamos o ID do pedido para vincular no DFC
      description: `Compra de Mercadoria (${supplier?.name || 'Fornecedor'})`,
      amount: totalReceivedValue,
      date: new Date().toISOString(),
      accountId: selectedAccountId || db.accounts.find(a => a.code === '6.1.6')?.id || '6.1.6',
      bankId: selectedBankId
    };

    const updatedBanks = db.banks.map(b => {
      if (b.id === selectedBankId) return { ...b, initialBalance: b.initialBalance - totalReceivedValue };
      return b;
    });

    const updatedOrders = db.purchaseOrders.map(o => {
      if (o.id === activeOrder.id) {
        if (pendingItems.length === 0) return { ...o, status: 'Recebido' as const, receivedAt: new Date().toISOString() };
        return { 
          ...o, 
          items: receivedItems.map(i => ({ productId: i.productId, quantity: i.receivedQty, cost: i.cost })), 
          total: receivedItems.reduce((a,b) => a + (b.cost * b.receivedQty), 0), 
          status: 'Recebido' as const, 
          receivedAt: new Date().toISOString() 
        };
      }
      return o;
    });

    if (pendingItems.length > 0) { 
      updatedOrders.push({ 
        id: `PO-PEND-${Date.now()}`, 
        date: activeOrder.date, 
        supplierId: activeOrder.supplierId, 
        items: pendingItems.map(i => ({ productId: i.productId, quantity: i.remainingQty, cost: i.cost })), 
        total: pendingItems.reduce((a,b) => a + (b.cost * b.remainingQty), 0), 
        status: 'Pendente' 
      }); 
    }

    setDb({ 
      ...db, 
      products: updatedProducts, 
      purchaseOrders: updatedOrders, 
      stockMovements: [...db.stockMovements, ...newMovements],
      expenses: [...db.expenses, newExpense],
      banks: updatedBanks
    });

    setView('PEDIDOS'); 
    setActiveOrder(null); 
    setReceivedQtys({}); 
    toast.success("Recebimento e Pagamento registrados!");
  };

  const addItem = (productId: string) => {
    const p = db.products.find(x => x.id === productId);
    if (!p) return;
    const existing = items.find(i => i.productId === productId);
    if (existing) {
      setItems(items.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { productId, quantity: 1, cost: p.costPrice }]);
    }
    setSearchItem('');
  };

  const toggleOrderExpansion = (id: string) => {
    setExpandedOrders(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><ShoppingBag className="w-6 h-6" /></div>
          <div><h2 className="text-lg font-black uppercase tracking-tight">Gestão de Compras</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pedidos e Recebimento de Mercadorias</p></div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {view !== 'NOVO_PEDIDO' && view !== 'CONFERENCIA' && (
            <>
              {isListSearchOpen ? (
                <div className="flex-1 md:w-64 relative animate-in slide-in-from-right-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input autoFocus type="text" className="w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20" placeholder="Buscar pedido..." value={listSearch} onChange={e => setListSearch(e.target.value)} />
                  <button onClick={() => { setIsListSearchOpen(false); setListSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => setIsListSearchOpen(true)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><Search className="w-5 h-5" /></button>
              )}
              <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border">
                <button onClick={() => setView('PEDIDOS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'PEDIDOS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Pendentes</button>
                <button onClick={() => setView('HISTORICO')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'HISTORICO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Histórico</button>
              </div>
              <button onClick={() => setView('NOVO_PEDIDO')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Novo Pedido</button>
            </>
          )}
          {(view === 'NOVO_PEDIDO' || view === 'CONFERENCIA') && (
            <button onClick={() => setView('PEDIDOS')} className="bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"><X className="w-4 h-4" /> Cancelar</button>
          )}
        </div>
      </div>

      {(view === 'PEDIDOS' || view === 'HISTORICO') && (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => {
            const supplier = db.suppliers.find(s => s.id === order.supplierId);
            const isExpanded = expandedOrders.includes(order.id);
            return (
              <div key={order.id} className="bg-white rounded-[2rem] border shadow-sm overflow-hidden transition-all hover:border-indigo-200">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${order.status === 'Recebido' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black uppercase text-sm text-slate-700">{supplier?.name || 'Fornecedor não encontrado'}</h3>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${order.status === 'Recebido' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Pedido #{order.id.slice(-6)} • {new Date(order.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Valor Total</p>
                      <p className="text-lg font-black text-indigo-600">R$ {order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      {order.status === 'Pendente' && (
                        <button 
                          onClick={() => { setActiveOrder(order); setView('CONFERENCIA'); }}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                        >
                          <ClipboardCheck className="w-4 h-4" /> Conferir
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-white/50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
                          <tr>
                            <th className="p-4">Produto</th>
                            <th className="p-4 text-center">Quantidade</th>
                            <th className="p-4 text-right">Custo Unit.</th>
                            <th className="p-4 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {order.items.map((item, idx) => {
                            const p = db.products.find(prod => prod.id === item.productId);
                            return (
                              <tr key={idx}>
                                <td className="p-4 font-bold uppercase text-slate-600">{p?.name}</td>
                                <td className="p-4 text-center font-black">{item.quantity}</td>
                                <td className="p-4 text-right text-slate-400">R$ {item.cost.toFixed(2)}</td>
                                <td className="p-4 text-right font-black text-indigo-600">R$ {(item.cost * item.quantity).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 opacity-30">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      )}

      {view === 'NOVO_PEDIDO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fornecedor</label>
                <select className="w-full border bg-slate-50 p-4 rounded-2xl text-sm font-black outline-none focus:ring-2 ring-indigo-500/20" value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                  <option value="">Selecione o fornecedor...</option>
                  {db.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="p-6 bg-indigo-950 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Total do Pedido</p>
                <p className="text-4xl font-black">R$ {items.reduce((acc, i) => acc + (i.cost * i.quantity), 0).toFixed(2)}</p>
              </div>
              <button onClick={handleCreateOrder} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"><Save className="w-5 h-5" /> Gerar Pedido</button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Package className="w-6 h-6" /></div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Itens do Pedido</h3>
                </div>
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
                >
                  <Barcode className="w-4 h-4" /> Scanner
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar produto para adicionar..." 
                  className="w-full border bg-slate-50 p-4 pl-12 rounded-2xl text-xs font-black outline-none focus:ring-2 ring-indigo-500/20"
                  value={searchItem}
                  onChange={e => setSearchItem(e.target.value)}
                />
                {searchItem && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
                    {db.products.filter(p => p.type !== 'Serviço' && p.name.toLowerCase().includes(searchItem.toLowerCase())).slice(0, 5).map(p => (
                      <button key={p.id} onClick={() => addItem(p.id)} className="w-full text-left p-4 hover:bg-indigo-50 flex items-center justify-between border-b last:border-none group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Package className="w-4 h-4 text-slate-300" /></div>
                          <span className="text-xs font-black uppercase text-slate-700">{p.name}</span>
                        </div>
                        <PlusCircle className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => {
                  const p = db.products.find(prod => prod.id === item.productId);
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Package className="w-5 h-5 text-slate-300" /></div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-700">{p?.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Custo Unit: R$ {item.cost.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border">
                          <button onClick={() => setItems(items.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><Minus className="w-3.5 h-3.5" /></button>
                          <input type="number" className="w-10 text-center font-black text-xs outline-none" value={item.quantity} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))} />
                          <button onClick={() => setItems(items.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Subtotal</p>
                          <p className="text-xs font-black text-indigo-600">R$ {(item.cost * item.quantity).toFixed(2)}</p>
                        </div>
                        <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhum item adicionado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'CONFERENCIA' && activeOrder && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in-95 duration-300">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><ClipboardCheck className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Conferência de Recebimento</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pedido #{activeOrder.id.slice(-6)} • {db.suppliers.find(s => s.id === activeOrder.supplierId)?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsScannerOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200"><ScanLine className="w-4 h-4" /> Scanner</button>
              </div>

              <div className="space-y-3">
                {activeOrder.items.map((item, idx) => {
                  const p = db.products.find(prod => prod.id === item.productId);
                  const received = receivedQtys[item.productId] || 0;
                  const isComplete = received >= item.quantity;
                  return (
                    <div key={idx} className={`flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all ${isComplete ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isComplete ? 'bg-white text-emerald-600' : 'bg-white text-slate-300'}`}>
                          {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase text-slate-700">{p?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Esperado: {item.quantity} un.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
                          <button onClick={() => setReceivedQtys({ ...receivedQtys, [item.productId]: Math.max(0, received - 1) })} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><Minus className="w-4 h-4" /></button>
                          <input type="number" className="w-12 text-center font-black text-lg outline-none" value={received} onChange={e => setReceivedQtys({ ...receivedQtys, [item.productId]: Number(e.target.value) })} />
                          <button onClick={() => setReceivedQtys({ ...receivedQtys, [item.productId]: received + 1 })} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><Plus className="w-4 h-4" /></button>
                        </div>
                        <button onClick={() => setReceivedQtys({ ...receivedQtys, [item.productId]: item.quantity })} className={`p-4 rounded-2xl transition-all ${isComplete ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300 border hover:border-emerald-200 hover:text-emerald-600'}`}><Check className="w-5 h-5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border shadow-xl space-y-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Landmark className="w-4 h-4 text-indigo-600" /> Pagamento do Pedido
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Conta de Origem</label>
                  <select 
                    className="w-full border bg-slate-50 p-4 rounded-2xl text-sm font-black outline-none focus:ring-2 ring-indigo-500/20"
                    value={selectedBankId}
                    onChange={e => setSelectedBankId(e.target.value)}
                  >
                    {db.banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Classificação (DRE)</label>
                  <select 
                    className="w-full border bg-slate-50 p-4 rounded-2xl text-sm font-black outline-none focus:ring-2 ring-indigo-500/20"
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                  >
                    {db.accounts.filter(a => a.type === 'Custo' || a.type === 'Despesa' || a.type === 'Ativo').map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="p-6 bg-indigo-950 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Valor Conferido</p>
                  <p className="text-4xl font-black">
                    R$ {activeOrder.items.reduce((acc, i) => acc + (i.cost * (receivedQtys[i.productId] || 0)), 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <button onClick={handleConfirmReceipt} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                <CheckCircle2 className="w-5 h-5" /> Confirmar e Pagar
              </button>
              <button onClick={() => setView('PEDIDOS')} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Voltar</button>
            </div>
          </div>
        </div>
      )}

      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md animate-in zoom-in duration-200">
            <Scanner 
              products={db.products} 
              onScan={(barcode) => {
                const p = db.products.find(x => x.barcode === barcode);
                if (p) {
                  if (view === 'CONFERENCIA') {
                    if (activeOrder?.items.some(i => i.productId === p.id)) {
                      setReceivedQtys(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
                      toast.success(`+1 ${p.name}`);
                    } else {
                      toast.error("Produto não pertence a este pedido!");
                    }
                  } else if (view === 'NOVO_PEDIDO') {
                    addItem(p.id);
                    toast.success(`${p.name} adicionado ao pedido!`);
                  }
                } else {
                  toast.error("Produto não cadastrado!");
                }
              }} 
              onManualRegister={() => setIsScannerOpen(false)} 
              onClose={() => setIsScannerOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesManager;