"use client";

import React, { useState, useEffect } from 'react';
import { Users, Receipt, Trash2, User, Plus, ChevronRight, UserPlus, QrCode, XCircle, CalendarCheck, Clock, AlertTriangle } from 'lucide-react';
import { TableWithChairs, BarCounter } from './CustomIcons';
import { Database, Table, Comanda, Reservation } from '../types';
import { toast } from 'react-hot-toast';
import ReservationModal from './ReservationModal';

interface TablesManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onSelectComanda: (table: Table, comanda: Comanda) => void;
  onAddComanda: (table: Table) => void;
  onCheckoutTable: (table: Table) => void;
  onAddTable: () => void;
}

const TablesManager: React.FC<TablesManagerProps> = ({ db, setDb, onSelectComanda, onAddComanda, onCheckoutTable, onAddTable }) => {
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [selectedTableForRes, setSelectedTableForRes] = useState<Table | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const balcao = db.tables.find(t => t.id === 'balcao');
  const tables = db.tables.filter(t => t.id !== 'balcao');

  const removeTable = (id: string) => {
    if (window.confirm('Deseja remover esta mesa permanentemente?')) {
      setDb({ ...db, tables: db.tables.filter(t => t.id !== id) });
      toast.success("Mesa removida!");
    }
  };

  const cancelComanda = (tableId: string, comandaId: string) => {
    if (window.confirm('Deseja cancelar esta comanda? Todos os itens serão perdidos.')) {
      const updatedTables = db.tables.map(t => {
        if (t.id === tableId) {
          return { ...t, comandas: t.comandas.filter(c => c.id !== comandaId) };
        }
        return t;
      });
      setDb({ ...db, tables: updatedTables });
      toast.success("Comanda cancelada!");
    }
  };

  const handleSaveReservation = (resData: Omit<Reservation, 'id' | 'status'>) => {
    if (!selectedTableForRes) return;

    const newReservation: Reservation = {
      ...resData,
      id: `RES${Date.now()}`,
      status: 'Pendente'
    };

    const updatedTables = db.tables.map(t => 
      t.id === selectedTableForRes.id ? { ...t, reservation: newReservation } : t
    );

    setDb({ ...db, tables: updatedTables });
    setIsResModalOpen(false);
    setSelectedTableForRes(null);
    toast.success("Reserva confirmada!");
  };

  const cancelReservation = (tableId: string) => {
    if (window.confirm('Deseja cancelar esta reserva?')) {
      const updatedTables = db.tables.map(t => 
        t.id === tableId ? { ...t, reservation: undefined } : t
      );
      setDb({ ...db, tables: updatedTables });
      toast.success("Reserva cancelada!");
    }
  };

  const checkTolerance = (res: Reservation) => {
    const [hours, minutes] = res.time.split(':').map(Number);
    const resDateTime = new Date(res.date);
    resDateTime.setHours(hours, minutes, 0, 0);
    
    const diffInMs = currentTime.getTime() - resDateTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return diffInHours > 1;
  };

  const renderComandaList = (table: Table) => {
    const activeComandas = (table.comandas || []).filter(c => c.status === 'Aberta');
    
    if (table.reservation && activeComandas.length === 0) {
      const isExpired = checkTolerance(table.reservation);
      return (
        <div className={`h-full flex flex-col p-4 rounded-2xl border-2 border-dashed transition-all ${isExpired ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-xl ${isExpired ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
              <CalendarCheck className="w-4 h-4" />
            </div>
            <button onClick={() => cancelReservation(table.id)} className="text-slate-400 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
          </div>
          <p className={`text-[10px] font-black uppercase ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
            {isExpired ? 'Reserva Expirada' : 'Mesa Reservada'}
          </p>
          <p className="text-xs font-black uppercase text-slate-700 truncate">{table.reservation.responsibleName}</p>
          <div className="flex items-center gap-2 mt-2 text-[9px] font-bold text-slate-400">
            <Clock className="w-3 h-3" /> {table.reservation.time}
            <Users className="w-3 h-3 ml-1" /> {table.reservation.peopleCount}p
          </div>
          {isExpired && (
            <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-red-500 uppercase animate-pulse">
              <AlertTriangle className="w-3 h-3" /> Tolerância excedida
            </div>
          )}
        </div>
      );
    }

    if (activeComandas.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center opacity-20 py-6">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-[8px] font-black uppercase">{table.id === 'balcao' ? 'Ninguém no Balcão' : 'Mesa Disponível'}</p>
        </div>
      );
    }

    return activeComandas.map(comanda => {
      const customer = db.customers.find(c => c.id === comanda.customerId);
      const total = (comanda.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0);
      return (
        <div key={comanda.id} className="flex items-center gap-2 group/item">
          <button 
            onClick={() => onSelectComanda(table, comanda)}
            className="flex-1 flex items-center justify-between p-3 bg-white border rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${table.id === 'balcao' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {table.id === 'balcao' ? 'B' : comanda.number.split('-')[1]}
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] font-black uppercase truncate text-slate-700">{customer?.name || 'Consumidor'}</p>
                <span className="text-[7px] font-mono text-slate-400 uppercase">{comanda.code}</span>
              </div>
            </div>
            <span className="text-[10px] font-black text-indigo-600">R$ {total.toFixed(2)}</span>
          </button>
          <button 
            onClick={() => cancelComanda(table.id, comanda.id)}
            className="p-3 text-slate-300 hover:text-red-500 transition-all"
            title="Cancelar Comanda"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      );
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {balcao && (
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-amber-100 shadow-xl shadow-amber-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-100">
                <BarCounter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">Atendimento no Balcão</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vendas Rápidas e Rotativas</p>
              </div>
            </div>
            <button 
              onClick={() => onAddComanda(balcao)}
              className="w-full md:w-auto bg-amber-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-xl shadow-amber-100 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Abrir Nova no Balcão
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {balcao.comandas.filter(c => c.status === 'Aberta').length > 0 ? (
              balcao.comandas.filter(c => c.status === 'Aberta').map(comanda => {
                const customer = db.customers.find(c => c.id === comanda.customerId);
                const total = (comanda.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0);
                return (
                  <div key={comanda.id} className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex flex-col gap-3 hover:border-amber-300 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xs text-amber-600 shadow-sm">B</div>
                        <div>
                          <p className="text-[11px] font-black uppercase text-slate-700 truncate max-w-[120px]">{customer?.name || 'Consumidor'}</p>
                          <p className="text-[8px] font-mono text-slate-400 uppercase">{comanda.code}</p>
                        </div>
                      </div>
                      <button onClick={() => cancelComanda(balcao.id, comanda.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><XCircle className="w-4 h-4" /></button>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                      <span className="text-xs font-black text-amber-600">R$ {total.toFixed(2)}</span>
                      <button 
                        onClick={() => onSelectComanda(balcao, comanda)}
                        className="bg-white px-4 py-2 rounded-xl text-[9px] font-black uppercase text-slate-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                      >
                        Lançar
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-4 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center gap-3 opacity-40">
                <Users className="w-4 h-4 text-slate-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Nenhuma comanda ativa no balcão</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <TableWithChairs className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Mapa de Mesas</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Salão</p>
            </div>
          </div>
          <button onClick={onAddTable} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Nova Mesa</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map(table => {
            const activeComandas = (table.comandas || []).filter(c => c.status === 'Aberta');
            const isReserved = table.reservation && activeComandas.length === 0;
            const isExpired = isReserved && checkTolerance(table.reservation!);
            
            return (
              <div key={table.id} className={`bg-white rounded-[2.5rem] border-2 overflow-hidden flex flex-col group transition-all shadow-sm ${isReserved ? (isExpired ? 'border-red-200' : 'border-blue-200') : 'border-slate-100 hover:border-indigo-200'}`}>
                <div className={`p-5 border-b flex justify-between items-center ${isReserved ? (isExpired ? 'bg-red-50/50' : 'bg-blue-50/50') : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeComandas.length > 0 ? 'bg-indigo-600 text-white' : isReserved ? (isExpired ? 'bg-red-500 text-white' : 'bg-blue-500 text-white') : 'bg-slate-200 text-slate-400'}`}>
                      <TableWithChairs className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-lg font-black uppercase tracking-tighter">Mesa {table.number}</span>
                      <p className="text-[8px] font-black uppercase text-slate-400">
                        {activeComandas.length > 0 ? `${activeComandas.length} Ativas` : isReserved ? 'Reservada' : 'Disponível'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeTable(table.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100" title="Remover Mesa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 p-4 space-y-2 min-h-[120px]">
                  {renderComandaList(table)}
                </div>

                <div className={`p-4 border-t grid grid-cols-2 gap-2 ${isReserved ? (isExpired ? 'bg-red-50/30' : 'bg-blue-50/30') : 'bg-slate-50'}`}>
                  <button 
                    onClick={() => onAddComanda(table)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase transition-all ${isReserved ? 'bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> {isReserved ? 'Check-in' : 'Abrir'}
                  </button>
                  
                  {activeComandas.length > 0 ? (
                    <button 
                      onClick={() => onCheckoutTable(table)}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Fechar
                    </button>
                  ) : (
                    <button 
                      disabled={isReserved && !isExpired}
                      onClick={() => { setSelectedTableForRes(table); setIsResModalOpen(true); }}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase transition-all ${isReserved ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'}`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" /> Reservar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReservationModal 
        isOpen={isResModalOpen} 
        onClose={() => { setIsResModalOpen(false); setSelectedTableForRes(null); }}
        onSave={handleSaveReservation}
        tableNumber={selectedTableForRes?.number || ''}
      />
    </div>
  );
};

export default TablesManager;