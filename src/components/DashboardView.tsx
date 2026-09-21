"use client";

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Landmark, Boxes, Activity, 
  Filter, X, ChevronDown, RefreshCw, ArrowUpRight, ArrowDownRight, TrendingUp
} from 'lucide-react';
import { Database } from '../types';
import { getPreviousPeriod, filterData } from '../utils/dashboard';
import DashboardGeneral from './DashboardGeneral';
import DashboardCommercial from './DashboardCommercial';
import DashboardFinancial from './DashboardFinancial';
import DashboardInventory from './DashboardInventory';
import DashboardOperational from './DashboardOperational';

interface DashboardViewProps {
  db: Database;
  startDate: string;
  endDate: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ db, startDate, endDate }) => {
  const [activeTab, setActiveTab] = useState<'GERAL' | 'COMERCIAL' | 'FINANCEIRO' | 'ESTOQUE' | 'OPERACIONAL'>('GERAL');
  const [filters, setFilters] = useState({
    sellerId: '',
    category: '',
    productId: '',
    unitId: ''
  });

  const prevPeriod = useMemo(() => getPreviousPeriod(startDate, endDate), [startDate, endDate]);

  const currentData = useMemo(() => ({
    sales: filterData(db.sales, startDate, endDate, filters),
    expenses: filterData(db.expenses, startDate, endDate, filters),
  }), [db, startDate, endDate, filters]);

  const prevData = useMemo(() => ({
    sales: filterData(db.sales, prevPeriod.start, prevPeriod.end, filters),
    expenses: filterData(db.expenses, prevPeriod.start, prevPeriod.end, filters),
  }), [db, prevPeriod, filters]);

  const clearFilters = () => setFilters({ sellerId: '', category: '', productId: '', unitId: '' });

  const hasFiltersActive = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* BARRA DE FILTROS GLOBAIS */}
      <div className="bg-white p-4 rounded-[2rem] border shadow-sm sticky top-0 z-40 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
        </div>

        <select 
          className="bg-slate-50 border-none p-2.5 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-indigo-500/20"
          value={filters.sellerId}
          onChange={e => setFilters({...filters, sellerId: e.target.value})}
        >
          <option value="">Todos Vendedores</option>
          {db.users.filter(u => u.role === 'Vendedor').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select 
          className="bg-slate-50 border-none p-2.5 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-indigo-500/20"
          value={filters.category}
          onChange={e => setFilters({...filters, category: e.target.value})}
        >
          <option value="">Todas Categorias</option>
          {db.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        {hasFiltersActive && (
          <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <X className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">Limpar</span>
          </button>
        )}

        <div className="ml-auto flex gap-1 bg-slate-100 p-1 rounded-2xl border">
          {[
            { id: 'GERAL', icon: LayoutDashboard, label: 'Estratégico' },
            { id: 'COMERCIAL', icon: ShoppingBag, label: 'Comercial' },
            { id: 'FINANCEIRO', icon: Landmark, label: 'Financeiro' },
            { id: 'ESTOQUE', icon: Boxes, label: 'Estoque' },
            { id: 'OPERACIONAL', icon: Activity, label: 'Operacional' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO DINÂMICO */}
      <div className="animate-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'GERAL' && <DashboardGeneral db={db} current={currentData} previous={prevData} />}
        {activeTab === 'COMERCIAL' && <DashboardCommercial db={db} current={currentData} previous={prevData} />}
        {activeTab === 'FINANCEIRO' && <DashboardFinancial db={db} current={currentData} previous={prevData} />}
        {activeTab === 'ESTOQUE' && <DashboardInventory db={db} current={currentData} previous={prevData} />}
        {activeTab === 'OPERACIONAL' && <DashboardOperational db={db} current={currentData} previous={prevData} />}
      </div>
    </div>
  );
};

export default DashboardView;