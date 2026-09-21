"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Users, User, Save, X } from 'lucide-react';
import Modal from './Modal';
import { Reservation } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: Omit<Reservation, 'id' | 'status'>) => void;
  tableNumber: string;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onSave, tableNumber }) => {
  const [formData, setFormData] = useState({
    responsibleName: '',
    peopleCount: 2,
    date: new Date().toISOString().split('T')[0],
    time: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ responsibleName: '', peopleCount: 2, date: new Date().toISOString().split('T')[0], time: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reservar Mesa ${tableNumber}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Responsável pela Reserva</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                autoFocus
                className="w-full border p-4 pl-10 rounded-2xl text-sm font-black bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20"
                placeholder="Nome do cliente..."
                value={formData.responsibleName}
                onChange={e => setFormData({...formData, responsibleName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="date"
                  className="w-full border p-4 pl-10 rounded-2xl text-sm font-black bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Horário</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="time"
                  className="w-full border p-4 pl-10 rounded-2xl text-sm font-black bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quantidade de Pessoas</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="number"
                min="1"
                className="w-full border p-4 pl-10 rounded-2xl text-sm font-black bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20"
                value={formData.peopleCount}
                onChange={e => setFormData({...formData, peopleCount: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Confirmar Reserva
          </button>
          <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationModal;