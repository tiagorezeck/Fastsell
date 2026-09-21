"use client";

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Utensils, Beer, BellRing, Check, ListChecks, User } from 'lucide-react';
import { Database, CartItem } from '../types';
import { toast } from 'react-hot-toast';

interface WaiterItem extends CartItem {
  sourceId: string;
  sourceType: 'Table' | 'Sale';
  locationName: string;
  customerName: string;
  deliveryType: string;
  sellerId: string;
}

interface WaiterMonitorProps {
  db: Database;
  setDb: (db: Database) => void;
}

const WaiterMonitor: React.FC<WaiterMonitorProps> = ({ db, setDb }) => {
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');

  const waiterGroups = useMemo(() => {
    const allItems: WaiterItem[] = [];

    // 1. Coletar de Comandas (Mesas/Balcão)
    db.tables.forEach(table => {
      table.comandas.filter(c => c.status === 'Aberta').forEach(comanda => {
        const customer = db.customers.find(cust => cust.id === comanda.customerId);
        comanda.items.filter(i => i.status !== 'Entregue').forEach(i => {
          allItems.push({
            ...i,
            sourceId: comanda.id,
            sourceType: 'Table',
            locationName: table.id === 'balcao' ? 'Balcão' : `Mesa ${table.number}`,
            customerName: customer?.name || 'Consumidor',
            deliveryType: table.id === 'balcao' ? 'Balcão' : 'Mesa',
            sellerId: comanda.sellerId
          });
        });
      });
    });

    // 2. Coletar de Vendas Diretas (Delivery/Retirada)
    db.sales.filter(s => s.status !== 'Entregue').forEach(s => {
      const customer = db.customers.find(c => c.id === s.customerId);
      s.items.filter(i => i.status !== 'Entregue').forEach(i => {
        allItems.push({
          ...i,
          sourceId: s.id,
          sourceType: 'Sale',
          locationName: s.deliveryType,
          customerName: customer?.name || 'Consumidor Final',
          deliveryType: s.deliveryType,
          sellerId: s.sellerId
        });
      });
    });

    // Filtro por Vendedor
    const filteredItems = selectedSellerId 
      ? allItems.filter(i => i.sellerId === selectedSellerId)
      : allItems;

    const groups = new Map<string, WaiterItem[]>();
    filteredItems.forEach(item => {
      const key = `${item.locationName}-${item.customerName}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    });

    return Array.from(groups.entries()).map(([key, items]) => {
      const readyItems = items.filter(i => {
        const product = db.products.find(p => p.id === i.productId);
        return (product?.type !== 'Produzido') || (i.status === 'Pronto');
      });
      const pendingItems = items.filter(i => {
        const product = db.products.find(p => p.id === i.productId);
        return product?.type === 'Produzido' && (i.status === 'Pendente' || i.status === 'Preparando');
      });

      return {
        id: key,
        location: items[0].locationName,
        customer: items[0].customerName,
        deliveryType: items[0].deliveryType,
        readyItems,
        pendingItems
      };
    }).filter(g => g.readyItems.length > 0 || g.pendingItems.length > 0);
  }, [db.tables, db.sales, db.customers, db.products, selectedSellerId]);

  const handleDeliverItem = (item: WaiterItem, deliverAll: boolean = true) => {
    let updatedDb = { ...db };

    const updateItems = (items: CartItem[]) => {
      const newItems: CartItem[] = [];
      items.forEach(i => {
        if (i.id === item.id) {
          if (deliverAll || i.quantity === 1) {
            newItems.push({ ...i, status: 'Entregue' as const });
          } else {
            newItems.push({ ...i, quantity: i.quantity - 1 });
            newItems.push({ ...i, id: `${i.id}-del-${Date.now()}`, quantity: 1, status: 'Entregue' as const });
          }
        } else {
          newItems.push(i);
        }
      });
      return newItems;
    };

    if (item.sourceType === 'Table') {
      updatedDb.tables = db.tables.map(t => ({
        ...t,
        comandas: t.comandas.map(c => c.id === item.sourceId ? { ...c, items: updateItems(c.items) } : c)
      }));
    } else {
      updatedDb.sales = db.sales.map(s => {
        if (s.id === item.sourceId) {
          const newItems = updateItems(s.items);
          const allDelivered = newItems.every(i => i.status === 'Entregue');
          return { ...s, items: newItems, status: allDelivered ? 'Entregue' : s.status };
        }
        return s;
      });
    }

    setDb(updatedDb);
    toast.success(deliverAll ? `${item.productName} entregue!` : `1x ${item.productName} entregue!`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-100">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight">Monitor de Atendimento</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Filtro por Garçom Responsável</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-indigo-500/20 transition-all"
              value={selectedSellerId}
              onChange={e => setSelectedSellerId(e.target.value)}
            >
              <option value="">Todos os Garçons</option>
              {db.users.filter(u => u.status === 'Ativo').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {waiterGroups.map(group => (
          <div key={group.id} className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden flex flex-col shadow-sm hover:border-emerald-200 transition-all">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                  group.deliveryType === 'Mesa' ? 'bg-indigo-100 text-indigo-700' : 
                  group.deliveryType === 'Balcão' ? 'bg-amber-100 text-amber-700' : 
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {group.location}
                </span>
                <h3 className="text-xs font-black uppercase text-slate-800 mt-1 truncate">{group.customer}</h3>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase">Prontos</p>
                <p className="text-xs font-black text-emerald-600">{group.readyItems.length}</p>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-4">
              {group.readyItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pronto para Coleta
                  </p>
                  <div className="space-y-1.5">
                    {group.readyItems.map((item, idx) => {
                      const product = db.products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-emerald-50/30 rounded-xl border border-emerald-100 group/item">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="shrink-0">
                              {product?.type === 'Produzido' ? <Utensils className="w-3 h-3 text-emerald-600" /> : <Beer className="w-3 h-3 text-blue-500" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-700 truncate leading-tight">{item.quantity}x {item.productName}</p>
                              <p className="text-[7px] font-black uppercase text-slate-400">{product?.type === 'Produzido' ? 'Cozinha' : 'Geladeira'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {item.quantity > 1 && (
                              <button 
                                onClick={() => handleDeliverItem(item, false)}
                                className="bg-white text-emerald-600 px-2 py-1 rounded-lg text-[8px] font-black border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Entregar apenas 1"
                              >
                                +1
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeliverItem(item, true)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md"
                              title="Entregar tudo"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {group.pendingItems.length > 0 && (
                <div className="space-y-2 opacity-60">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Em Preparo na Cozinha
                  </p>
                  <div className="space-y-1">
                    {group.pendingItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 truncate">{item.quantity}x {item.productName}</span>
                        <span className="text-[7px] font-black uppercase text-slate-400">{item.status === 'Preparando' ? 'No Fogo' : 'Fila'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t">
              <button 
                disabled={group.readyItems.length === 0}
                onClick={() => {
                  group.readyItems.forEach(item => handleDeliverItem(item, true));
                }}
                className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                  group.readyItems.length > 0 
                    ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" /> Entregar Tudo
              </button>
            </div>
          </div>
        ))}

        {waiterGroups.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-20">
            <BellRing className="w-16 h-16 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Nenhum item pendente de entrega</p>
            <p className="text-[10px] font-bold uppercase mt-2">Tudo em dia por aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterMonitor;