"use client";

import React, { useMemo, useState } from 'react';
import { Clock, CheckCircle2, Play, ChefHat, PackageCheck, Printer, Package, ChevronDown, ChevronRight, Scissors } from 'lucide-react';
import { Database, CartItem } from '../types';
import { toast } from 'react-hot-toast';
import KitchenTicket from './KitchenTicket';

interface ProductionItem extends CartItem {
  sourceId: string;
  sourceType: 'Sale' | 'Table';
  tableNumber?: string;
  deliveryType: string;
  pickupTime?: string;
}

interface ProductionGroup {
  id: string;
  customerName: string;
  status: 'Pendente' | 'Preparando' | 'Pronto';
  items: ProductionItem[];
  groupKey: string;
  pickupTime?: string;
}

interface ProductionManagerProps {
  db: Database;
  setDb: (db: Database) => void;
}

const ProductionManager: React.FC<ProductionManagerProps> = ({ db, setDb }) => {
  const [showStats, setShowStats] = useState(false);
  const [expandedRecipes, setExpandedRecipes] = useState<string[]>([]);
  const [printingGroup, setPrintingGroup] = useState<ProductionGroup | null>(null);

  const groupedOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const allItems: ProductionItem[] = [];

    db.sales.filter(s => s.date.startsWith(today) && s.status !== 'Entregue' && s.sendToProduction).forEach(s => {
      s.items.forEach(i => {
        const product = db.products.find(p => p.id === i.productId);
        if (product?.type === 'Produzido' && i.status !== 'Entregue') {
          allItems.push({
            ...i,
            sourceId: s.id,
            sourceType: 'Sale',
            deliveryType: s.deliveryType,
            pickupTime: s.pickupTime,
            status: i.status || 'Pendente'
          });
        }
      });
    });

    db.tables.forEach(table => {
      table.comandas.filter(c => c.status === 'Aberta').forEach(comanda => {
        comanda.items.forEach(i => {
          const product = db.products.find(p => p.id === i.productId);
          if (product?.type === 'Produzido' && i.status !== 'Entregue') {
            allItems.push({
              ...i,
              sourceId: comanda.id,
              sourceType: 'Table',
              tableNumber: table.number,
              deliveryType: table.id === 'balcao' ? 'Balcão' : 'Mesa',
              status: i.status || 'Pendente'
            });
          }
        });
      });
    });

    const groups: ProductionGroup[] = [];
    const statuses: ('Pendente' | 'Preparando' | 'Pronto')[] = ['Pendente', 'Preparando', 'Pronto'];

    statuses.forEach(status => {
      const itemsInStatus = allItems.filter(i => i.status === status);
      const customerMap = new Map<string, ProductionItem[]>();

      itemsInStatus.forEach(item => {
        const sale = db.sales.find(s => s.id === item.sourceId);
        const comanda = db.tables.flatMap(t => t.comandas).find(c => c.id === item.sourceId);
        const customerId = sale?.customerId || comanda?.customerId;
        const key = customerId || item.tableNumber || 'Consumidor';
        if (!customerMap.has(key)) customerMap.set(key, []);
        customerMap.get(key)!.push(item);
      });

      customerMap.forEach((items, key) => {
        const customer = db.customers.find(c => c.id === key);
        groups.push({
          id: `${key}-${status}`,
          customerName: customer?.name || (items[0].tableNumber ? `Mesa ${items[0].tableNumber}` : 'Consumidor Final'),
          status,
          items,
          groupKey: key,
          pickupTime: items.find(i => i.pickupTime)?.pickupTime
        });
      });
    });

    return groups;
  }, [db.sales, db.tables, db.customers, db.products]);

  const toggleRecipe = (itemId: string) => {
    setExpandedRecipes(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const fragmentItem = (itemToMove: ProductionItem, newStatus: string) => {
    const qtyToMoveStr = window.prompt(`Quantas unidades de "${itemToMove.productName}" deseja mover para ${newStatus}? (Máx: ${itemToMove.quantity})`, itemToMove.quantity.toString());
    if (qtyToMoveStr === null) return;
    
    const qtyToMove = parseInt(qtyToMoveStr);
    if (isNaN(qtyToMove) || qtyToMove <= 0 || qtyToMove > itemToMove.quantity) {
      toast.error("Quantidade inválida!");
      return;
    }

    const now = new Date().toISOString();
    let updatedDb = { ...db };
    let totalCMV = 0;

    const updateItems = (items: CartItem[]) => {
      const newItems: CartItem[] = [];
      items.forEach(i => {
        if (i.id === itemToMove.id) {
          if (qtyToMove === i.quantity) {
            newItems.push({ 
              ...i, 
              status: newStatus as any,
              startedAt: newStatus === 'Preparando' ? now : i.startedAt,
              readyAt: newStatus === 'Pronto' ? now : i.readyAt
            });
          } else {
            newItems.push({ ...i, quantity: i.quantity - qtyToMove });
            newItems.push({ 
              ...i, 
              id: `${i.id}-frag-${Date.now()}`, 
              quantity: qtyToMove, 
              status: newStatus as any,
              startedAt: newStatus === 'Preparando' ? now : i.startedAt,
              readyAt: newStatus === 'Pronto' ? now : i.readyAt
            });
          }
        } else {
          newItems.push(i);
        }
      });
      return newItems;
    };

    if (itemToMove.sourceType === 'Sale') {
      updatedDb.sales = db.sales.map(s => {
        if (s.id === itemToMove.sourceId) {
          const newItems = updateItems(s.items);
          const allDone = newItems.every(i => i.status === 'Entregue');
          return { ...s, items: newItems, status: allDone ? 'Entregue' : s.status };
        }
        return s;
      });
    } else {
      updatedDb.tables = db.tables.map(t => ({
        ...t,
        comandas: t.comandas.map(c => c.id === itemToMove.sourceId ? { ...c, items: updateItems(c.items) } : c)
      }));
    }

    if (newStatus === 'Pronto') {
      let updatedProducts = [...updatedDb.products];
      const product = db.products.find(p => p.id === itemToMove.productId);
      if (product?.recipe) {
        product.recipe.forEach((ing: any) => {
          const ingredient = db.products.find(p => p.id === ing.productId);
          const totalQty = ing.netQuantity * qtyToMove;
          totalCMV += (ingredient?.costPrice || 0) * totalQty;
          updatedProducts = updatedProducts.map(p => p.id === ing.productId ? { ...p, stock: p.stock - totalQty } : p);
        });
      }
      updatedDb.products = updatedProducts;

      if (totalCMV > 0) {
        const cmvAccount = db.accounts.find(a => a.code === '3.2');
        updatedDb.expenses.push({
          id: `CMV-PROD-${Date.now()}`,
          description: `CMV: Produção ${qtyToMove}x ${itemToMove.productName}`,
          amount: totalCMV,
          date: now,
          accountId: cmvAccount?.id || '3.2'
        });
      }
    }

    setDb(updatedDb);
    toast.success(`${qtyToMove}x ${itemToMove.productName} movido para ${newStatus}!`);
  };

  const updateGroupStatus = (group: ProductionGroup, newStatus: 'Pendente' | 'Preparando' | 'Pronto' | 'Entregue') => {
    const now = new Date().toISOString();
    let updatedDb = { ...db };
    const itemIds = group.items.map(i => i.id);
    let totalCMV = 0;

    const updateItems = (items: CartItem[]) => items.map(i => {
      if (itemIds.includes(i.id)) {
        return { 
          ...i, 
          status: newStatus as any,
          startedAt: newStatus === 'Preparando' ? now : i.startedAt,
          readyAt: newStatus === 'Pronto' ? now : i.readyAt
        };
      }
      return i;
    });

    updatedDb.sales = db.sales.map(s => {
      const isRelevant = group.items.some(gi => gi.sourceId === s.id);
      if (isRelevant) {
        const newItems = updateItems(s.items);
        const allDone = newItems.every(i => i.status === 'Entregue');
        return { ...s, items: newItems, status: allDone ? 'Entregue' : s.status };
      }
      return s;
    });

    updatedDb.tables = db.tables.map(t => ({
      ...t,
      comandas: t.comandas.map(c => {
        const isRelevant = group.items.some(gi => gi.sourceId === c.id);
        return isRelevant ? { ...c, items: updateItems(c.items) } : c;
      })
    }));

    if (newStatus === 'Pronto') {
      let updatedProducts = [...updatedDb.products];
      group.items.forEach(item => {
        const product = db.products.find(p => p.id === item.productId);
        if (product?.recipe) {
          product.recipe.forEach((ing: any) => {
            const ingredient = db.products.find(p => p.id === ing.productId);
            const totalQty = ing.netQuantity * item.quantity;
            totalCMV += (ingredient?.costPrice || 0) * totalQty;
            updatedProducts = updatedProducts.map(p => p.id === ing.productId ? { ...p, stock: p.stock - totalQty } : p);
          });
        }
      });
      updatedDb.products = updatedProducts;

      if (totalCMV > 0) {
        const cmvAccount = db.accounts.find(a => a.code === '3.2');
        updatedDb.expenses.push({
          id: `CMV-GROUP-${Date.now()}`,
          description: `CMV: Produção Grupo ${group.customerName}`,
          amount: totalCMV,
          date: now,
          accountId: cmvAccount?.id || '3.2'
        });
      }
    }

    setDb(updatedDb);
    toast.success("Status do grupo atualizado!");
  };

  const handlePrintTicket = (group: ProductionGroup) => {
    setPrintingGroup(group);
    setTimeout(() => {
      window.print();
      setPrintingGroup(null);
    }, 100);
  };

  return (
    <div className="h-full flex flex-col gap-2 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-2 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md"><ChefHat className="w-4 h-4" /></div>
          <div><h2 className="text-xs font-black uppercase tracking-tight">Monitor de Produção</h2><p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Cozinha e Preparo</p></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 min-h-0">
        {['Pendente', 'Preparando', 'Pronto'].map(status => (
          <div key={status} className={`flex flex-col rounded-xl border border-slate-100 ${status === 'Pendente' ? 'bg-orange-50/10' : status === 'Preparando' ? 'bg-indigo-50/10' : 'bg-emerald-50/10'} overflow-hidden`}>
            <div className="p-1.5 flex items-center justify-between bg-white/80 border-b border-white backdrop-blur-sm">
              <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-500">{status === 'Pendente' ? 'Aguardando' : status === 'Preparando' ? 'No Fogo' : 'Pronto'}</h3>
              <span className="bg-white px-1.5 py-0.5 rounded-full text-[8px] font-black shadow-sm border text-indigo-600">{groupedOrders.filter(o => o.status === status).length}</span>
            </div>
            <div className="flex-1 p-1.5 space-y-2 overflow-y-auto custom-scrollbar">
              {groupedOrders.filter(o => o.status === status).map(group => (
                <div key={group.id} className="bg-white p-2 rounded-xl shadow-sm border border-white transition-all animate-in zoom-in duration-300">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="text-[9px] font-black uppercase text-slate-800 truncate">{group.customerName}</h4>
                      <span className="px-1 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[7px] font-black uppercase shrink-0">
                        {group.items[0].tableNumber ? `Mesa ${group.items[0].tableNumber}` : `#${group.items[0].sourceId.slice(-4)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handlePrintTicket(group)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Imprimir Ticket"
                      >
                        <Printer className="w-3 h-3" />
                      </button>
                      {group.pickupTime && <span className="px-1 py-0.5 rounded text-[7px] font-black uppercase flex items-center gap-0.5 shrink-0 bg-amber-100 text-amber-700"><Clock className="w-2 h-2" /> {group.pickupTime}</span>}
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    {group.items.map((item, idx) => {
                      const itemId = `${group.id}-${idx}`;
                      const isExpanded = expandedRecipes.includes(itemId);
                      const nextStatus = status === 'Pendente' ? 'Preparando' : status === 'Preparando' ? 'Pronto' : 'Entregue';
                      const product = db.products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100 group/item">
                            <div className="w-6 h-6 rounded bg-white border overflow-hidden shrink-0">
                              {product?.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" alt={item.productName} /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-2 h-2" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[8px] font-black uppercase text-slate-700 truncate">{item.quantity}x {item.productName}</p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <button 
                                onClick={() => fragmentItem(item, nextStatus)} 
                                className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-white rounded transition-all" 
                                title="Fragmentar Quantidade"
                              >
                                <Scissors className="w-2.5 h-2.5" />
                              </button>
                              {product?.recipe && (
                                <button 
                                  onClick={() => toggleRecipe(itemId)} 
                                  className={`p-0.5 rounded transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white'}`}
                                >
                                  {isExpanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                </button>
                              )}
                            </div>
                          </div>
                          {isExpanded && product?.recipe && (
                            <div className="ml-4 pl-2 border-l-2 border-indigo-100 space-y-0.5 animate-in slide-in-from-top-1">
                              {product.recipe.map((ing: any, i: number) => (
                                <div key={i} className="flex justify-between text-[7px] font-bold text-slate-400 uppercase">
                                  <span>{db.products.find(p => p.id === ing.productId)?.name}</span>
                                  <span>{ing.netQuantity * item.quantity} un.</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-1.5">
                    {status === 'Pendente' && <button onClick={() => updateGroupStatus(group, 'Preparando')} className="w-full bg-indigo-600 text-white py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-indigo-700 transition-all shadow-sm"><Play className="w-2.5 h-2.5 fill-white" /> Iniciar</button>}
                    {status === 'Preparando' && <button onClick={() => updateGroupStatus(group, 'Pronto')} className="w-full bg-emerald-600 text-white py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-all shadow-sm"><CheckCircle2 className="w-2.5 h-2.5" /> Pronto</button>}
                    {status === 'Pronto' && <button onClick={() => updateGroupStatus(group, 'Entregue')} className="w-full bg-slate-900 text-white py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-black transition-all shadow-sm"><PackageCheck className="w-2.5 h-2.5" /> Entregar</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden Print Area */}
      <div className="print-only">
        {printingGroup && (
          <KitchenTicket 
            items={printingGroup.items}
            customerName={printingGroup.customerName}
            locationName={printingGroup.items[0].tableNumber ? `Mesa ${printingGroup.items[0].tableNumber}` : printingGroup.items[0].deliveryType}
            orderId={printingGroup.items[0].sourceId}
            date={new Date().toISOString()}
            pickupTime={printingGroup.pickupTime}
            db={db}
          />
        )}
      </div>
    </div>
  );
};

export default ProductionManager;