"use client";

import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, Banknote, Package, Users, UserCheck, Truck, 
  ClipboardList, ShoppingBag, TrendingDown, History, BarChart3, Settings, X, Sun, Moon, Zap,
  ChevronDown, ChevronRight, Tags, Boxes, Wallet, Landmark, Building2, ChefHat, FileText, Wrench, Target, Shield, Award, Database as DbIcon, Layout, Scale, Trophy, RefreshCw, Cake, MapPin, BellRing, Cloud
} from 'lucide-react';
import { TableWithChairs } from './CustomIcons';
import { Database } from '../types';

interface SidebarProps {
  activeTab: string;
  forcedSubTab?: string;
  setActiveTab: (tab: any, subTab?: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  db: Database;
}

const SidebarGroup = ({ label, icon, children, isOpen, onToggle }: any) => {
  const hasVisibleChildren = React.Children.toArray(children).some((child: any) => child !== null);
  if (!hasVisibleChildren) return null;

  return (
    <div className="space-y-0.5">
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-1.5 rounded-xl transition-all group ${isOpen ? 'bg-white/5 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
      >
        <div className="flex items-center gap-3">
          {React.cloneElement(icon, { className: `w-3.5 h-3.5 transition-colors ${isOpen ? 'text-indigo-400' : 'group-hover:text-indigo-400'}` })}
          <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        {isOpen ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
      </button>
      {isOpen && (
        <div className="pl-5 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick, id, enabledModules, alwaysVisible, onSelect }: any) => {
  // Se enabledModules estiver vazio (ex: após importação), assume que tudo está habilitado
  const isEnabled = alwaysVisible || !enabledModules || enabledModules.length === 0 || enabledModules.includes(id);
  
  if (!isEnabled) return null;

  return (
    <button 
      onClick={() => {
        onClick();
        if (onSelect) onSelect();
      }} 
      className="w-full flex items-center gap-3 px-4 py-1 rounded-lg transition-all text-white/40 hover:bg-white/5 hover:text-white/70"
    >
      {React.cloneElement(icon, { className: "w-3 h-3" })}
      <span className="text-[10px] font-bold truncate">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  setActiveTab, sidebarOpen, setSidebarOpen, isDarkMode, setIsDarkMode, db
}) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledModules = db?.companyInfo?.enabledModules || [];

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? [] : [group]
    );
  };

  const closeAllGroups = () => {
    setExpandedGroups([]);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSidebarOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
      closeAllGroups();
    }, 300);
  };

  return (
    <>
      <div 
        className="fixed inset-y-0 left-0 w-6 z-40 hidden lg:block"
        onMouseEnter={handleMouseEnter}
      />

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40"
          onClick={() => { setSidebarOpen(false); closeAllGroups(); }}
        />
      )}

      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-50 w-64 ${isDarkMode ? 'bg-slate-800' : 'bg-indigo-950'} text-white transition-all duration-500 ease-in-out transform ${sidebarOpen ? 'translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]' : '-translate-x-full'} border-r border-white/5`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={() => { setActiveTab('PDV'); closeAllGroups(); }} className="text-lg font-black flex items-center gap-2 tracking-tighter italic skew-x-[-6deg]">
              <div className="bg-white p-1 rounded-lg shadow-md skew-x-[6deg]"><Zap className="text-indigo-600 w-4 h-4 fill-indigo-600 animate-pulse" /></div>
              <span className="bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">FASTSELL</span>
              <div className="bg-indigo-500/30 px-1.5 py-0.5 rounded-md border border-indigo-400/20 skew-x-[6deg]">
                <span className="text-[7px] font-black text-indigo-200 tracking-widest">PRO</span>
              </div>
            </button>
            <button onClick={() => { setSidebarOpen(false); closeAllGroups(); }} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5 text-white/50" /></button>
          </div>
          
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            <div className="mb-2">
              <SidebarItem 
                id="Dashboard"
                enabledModules={enabledModules}
                icon={<LayoutDashboard />} 
                label="Dashboard Geral" 
                onClick={() => setActiveTab('Dashboard')} 
                onSelect={closeAllGroups}
              />
            </div>

            <SidebarGroup label="Comercial" icon={<Banknote />} isOpen={expandedGroups.includes('Comercial')} onToggle={() => toggleGroup('Comercial')}>
              <SidebarItem id="Caixa" enabledModules={enabledModules} icon={<Wallet />} label="Caixa" onClick={() => setActiveTab('Caixa')} onSelect={closeAllGroups} />
              <SidebarItem id="PDV" enabledModules={enabledModules} icon={<Zap />} label="PDV (Vendas)" onClick={() => setActiveTab('PDV')} onSelect={closeAllGroups} />
              <SidebarItem id="Mesas" enabledModules={enabledModules} icon={<TableWithChairs />} label="Mesas / Comandas" onClick={() => setActiveTab('Mesas')} onSelect={closeAllGroups} />
              <SidebarItem id="Atendimento" enabledModules={enabledModules} icon={<BellRing />} label="Atendimento" onClick={() => setActiveTab('Atendimento')} onSelect={closeAllGroups} />
              {db?.companyInfo?.creditEnabled && (
                <SidebarItem alwaysVisible icon={<Wallet />} label="Crediário" onClick={() => setActiveTab('Crediário')} onSelect={closeAllGroups} />
              )}
            </SidebarGroup>

            <SidebarGroup label="Operacional" icon={<ChefHat />} isOpen={expandedGroups.includes('Operacional')} onToggle={() => toggleGroup('Operacional')}>
              <SidebarItem id="Produção" enabledModules={enabledModules} icon={<ChefHat />} label="Produção" onClick={() => setActiveTab('Produção')} onSelect={closeAllGroups} />
              <SidebarItem id="Compras" enabledModules={enabledModules} icon={<ShoppingBag />} label="Compras" onClick={() => setActiveTab('Compras')} onSelect={closeAllGroups} />
              <SidebarItem id="Estoque" enabledModules={enabledModules} icon={<Boxes />} label="Estoque" onClick={() => setActiveTab('Estoque')} onSelect={closeAllGroups} />
            </SidebarGroup>

            <SidebarGroup label="Cadastros" icon={<Users />} isOpen={expandedGroups.includes('Cadastros')} onToggle={() => toggleGroup('Cadastros')}>
              <SidebarItem id="Categorias" enabledModules={enabledModules} icon={<Tags />} label="Categorias" onClick={() => setActiveTab('Categorias')} onSelect={closeAllGroups} />
              <SidebarItem id="Clientes" enabledModules={enabledModules} icon={<Users />} label="Clientes" onClick={() => setActiveTab('Clientes')} onSelect={closeAllGroups} />
              <SidebarItem id="Fornecedores" enabledModules={enabledModules} icon={<Truck />} label="Fornecedores" onClick={() => setActiveTab('Fornecedores')} onSelect={closeAllGroups} />
              <SidebarItem id="Produtos" enabledModules={enabledModules} icon={<Package />} label="Estoque" onClick={() => setActiveTab('Produtos')} onSelect={closeAllGroups} />
              <SidebarItem id="Produção" enabledModules={enabledModules} icon={<ChefHat />} label="Fabricação" onClick={() => setActiveTab('ItensProduzidos')} onSelect={closeAllGroups} />
              <SidebarItem id="Serviços" enabledModules={enabledModules} icon={<Wrench />} label="Serviços" onClick={() => setActiveTab('Serviços')} onSelect={closeAllGroups} />
              <SidebarItem id="Usuários" enabledModules={enabledModules} icon={<Shield />} label="Usuários" onClick={() => setActiveTab('Usuários')} onSelect={closeAllGroups} />
              <SidebarItem alwaysVisible icon={<MapPin />} label="Locais de Estoque" onClick={() => setActiveTab('Locais')} onSelect={closeAllGroups} />
            </SidebarGroup>

            <SidebarGroup label="Financeiro" icon={<TrendingDown />} isOpen={expandedGroups.includes('Financeiro')} onToggle={() => toggleGroup('Financeiro')}>
              <SidebarItem id="Bancos" enabledModules={enabledModules} icon={<Landmark />} label="Bancos" onClick={() => setActiveTab('Bancos')} onSelect={closeAllGroups} />
              <SidebarItem alwaysVisible icon={<RefreshCw />} label="Conciliação" onClick={() => setActiveTab('Conciliação')} onSelect={closeAllGroups} />
              <SidebarItem id="Despesas" enabledModules={enabledModules} icon={<TrendingDown />} label="Despesas" onClick={() => setActiveTab('Despesas')} onSelect={closeAllGroups} />
              <SidebarItem id="Fidelidade" enabledModules={enabledModules} icon={<Award />} label="Fidelidade" onClick={() => setActiveTab('Fidelidade')} onSelect={closeAllGroups} />
              <SidebarItem id="Metas" enabledModules={enabledModules} icon={<Target />} label="Metas" onClick={() => setActiveTab('Metas')} onSelect={closeAllGroups} />
              <SidebarItem id="PlanoDeContas" enabledModules={enabledModules} icon={<ClipboardList />} label="Plano de Contas" onClick={() => setActiveTab('PlanoDeContas')} onSelect={closeAllGroups} />
            </SidebarGroup>

            <SidebarGroup label="Análise" icon={<BarChart3 />} isOpen={expandedGroups.includes('Análise')} onToggle={() => toggleGroup('Análise')}>
              <SidebarItem id="Aniversariantes" enabledModules={enabledModules} icon={<Cake />} label="Aniversariantes" onClick={() => setActiveTab('Aniversariantes')} onSelect={closeAllGroups} />
              <SidebarItem id="RelatorioVendas" enabledModules={enabledModules} icon={<Users />} label="ABC Clientes" onClick={() => setActiveTab('RelatorioVendas', 'ABC_CLI')} onSelect={closeAllGroups} />
              <SidebarItem id="RelatorioVendas" enabledModules={enabledModules} icon={<Package />} label="ABC Produtos" onClick={() => setActiveTab('RelatorioVendas', 'ABC_PROD')} onSelect={closeAllGroups} />
              <SidebarItem id="RelatorioFinanceiro" enabledModules={enabledModules} icon={<Scale />} label="Balanço" onClick={() => setActiveTab('RelatorioFinanceiro', 'BALANCO')} onSelect={closeAllGroups} />
              <SidebarItem id="RelatorioFinanceiro" enabledModules={enabledModules} icon={<Wallet />} label="DFC" onClick={() => setActiveTab('RelatorioFinanceiro', 'DFC')} onSelect={closeAllGroups} />
              <SidebarItem id="RelatorioFinanceiro" enabledModules={enabledModules} icon={<FileText />} label="DRE" onClick={() => setActiveTab('RelatorioFinanceiro', 'DRE')} onSelect={closeAllGroups} />
              <SidebarItem id="RelatorioVendas" enabledModules={enabledModules} icon={<Trophy />} label="Ranking de Vendedores" onClick={() => setActiveTab('RelatorioVendas', 'RANKING')} onSelect={closeAllGroups} />
            </SidebarGroup>

            <SidebarGroup label="Configurações" icon={<Settings />} isOpen={expandedGroups.includes('Configurações')} onToggle={() => toggleGroup('Configurações')}>
              <SidebarItem alwaysVisible icon={<Building2 />} label="Empresa" onClick={() => setActiveTab('Empresa')} onSelect={closeAllGroups} />
              <SidebarItem alwaysVisible icon={<Layout />} label="PDV" onClick={() => setActiveTab('ConfigPDV')} onSelect={closeAllGroups} />
              <SidebarItem alwaysVisible icon={<Zap />} label="Módulos" onClick={() => setActiveTab('Modulos')} onSelect={closeAllGroups} />
              <SidebarItem alwaysVisible icon={<Award />} label="Fidelidade" onClick={() => setActiveTab('Fidelidade')} onSelect={closeAllGroups} />
              <SidebarItem alwaysVisible icon={<Cloud />} label="Nuvem" onClick={() => setActiveTab('Nuvem')} onSelect={closeAllGroups} />
              <SidebarItem alwaysVisible icon={<DbIcon />} label="Dados" onClick={() => setActiveTab('Dados')} onSelect={closeAllGroups} />
            </SidebarGroup>
          </nav>

          <div className="p-3 border-t border-white/5 bg-black/10 flex justify-between items-center">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
            </button>
            <span className="text-[7px] opacity-40 font-mono tracking-widest uppercase">v20.0.0 PRO</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;