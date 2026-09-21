"use client";

import React, { useState, useMemo } from 'react';
import { Database, User } from '../types';
import { FileText, BarChart3, ArrowUpRight, ArrowDownRight, UserCheck, Package, Scale } from 'lucide-react';

interface ReportsViewProps {
  db: Database;
  startDate: string;
  endDate: string;
}

const ReportLine = ({ label, val, isMain, isNegative, indent = 0, code }: any) => {
  const safeVal = typeof val === 'number' && !isNaN(val) ? val : 0;
  return (
    <div className={`flex justify-between items-center py-3 ${isMain ? 'font-black text-sm text-slate-900 bg-slate-50/80 px-4 rounded-xl my-1 border-y border-slate-100' : 'text-[11px] font-bold text-slate-500 px-2 border-b border-slate-50'}`} style={{ paddingLeft: `${indent * 24 + (isMain ? 16 : 24)}px` }}>
       <div className="flex items-center gap-3">
         {code && <span className="text-[9px] font-mono opacity-30 w-10">{code}</span>}
         <span className="uppercase tracking-tight">{label}</span>
       </div>
       <span className={`font-mono font-black ${isNegative ? 'text-red-500' : 'text-slate-700'}`}>
         {isNegative && safeVal !== 0 ? '- ' : ''}R$ {Math.abs(safeVal).toLocaleString('pt-BR', {minimumFractionDigits:2})}
       </span>
    </div>
  );
};

const ReportsView: React.FC<ReportsViewProps> = ({ db, startDate, endDate }) => {
  const [reportType, setReportType] = useState<'DRE' | 'BALANCO' | 'ABC_PROD' | 'ABC_CLI' | 'COMISSAO'>('DRE');

  const filteredSales = useMemo(() => db.sales.filter((s: any) => s.date.split('T')[0] >= startDate && s.date.split('T')[0] <= endDate), [db.sales, startDate, endDate]);
  const filteredExpenses = useMemo(() => db.expenses.filter((e: any) => e.date.split('T')[0] >= startDate && e.date.split('T')[0] <= endDate), [db.expenses, startDate, endDate]);

  const dreData = useMemo(() => {
    const grossRevenue = filteredSales.reduce((a: number, b: any) => a + b.subtotal, 0);
    const discounts = filteredSales.reduce((a: number, b: any) => a + (b.discount || 0), 0);
    const netRevenue = grossRevenue - discounts;
    const cmv = filteredSales.reduce((a: number, b: any) => a + b.items.reduce((s: number, i: any) => {
      const product = db.products.find(p => p.id === i.productId);
      return s + (product?.costPrice || 0) * i.quantity;
    }, 0), 0);
    const grossProfit = netRevenue - cmv;
    const totalExpenses = filteredExpenses.reduce((a: number, b: any) => a + b.amount, 0);
    const netProfit = grossProfit - totalExpenses;
    const margin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;
    return { grossRevenue, discounts, netRevenue, cmv, grossProfit, totalExpenses, netProfit, margin };
  }, [filteredSales, filteredExpenses, db.products]);

  const balancoData = useMemo(() => {
    const disponibilidades = db.banks.reduce((a: number, b: any) => a + b.initialBalance, 0);
    const estoqueValor = db.products.reduce((a: number, b: any) => a + (b.stock * b.costPrice), 0);
    const totalAtivo = disponibilidades + estoqueValor;
    const lucroAcumulado = db.sales.reduce((a: number, b: any) => a + b.total, 0) - db.sales.reduce((a: number, b: any) => a + b.items.reduce((s: number, i: any) => {
      const product = db.products.find(p => p.id === i.productId);
      return s + (product?.costPrice || 0) * i.quantity;
    }, 0), 0) - db.expenses.reduce((a: number, b: any) => a + b.amount, 0);
    return { disponibilidades, estoqueValor, totalAtivo, lucroAcumulado };
  }, [db]);

  const commissionData = useMemo(() => {
    const sellers = db.users.filter(u => u.role === 'Vendedor');
    return sellers.map(seller => {
      const sellerSales = filteredSales.filter((s: any) => s.sellerId === seller.id);
      const totalSold = sellerSales.reduce((a: number, b: any) => a + b.total, 0);
      const commissionEarned = (totalSold * seller.commission) / 100;
      return { ...seller, totalSold, commissionEarned, salesCount: sellerSales.length };
    }).sort((a, b) => b.totalSold - a.totalSold);
  }, [db.users, filteredSales]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex gap-2 bg-white p-2 rounded-[2rem] border shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={()=>setReportType('DRE')} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${reportType === 'DRE' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-slate-50 text-slate-400'}`}>
            <FileText className="w-4 h-4"/> DRE
          </button>
          <button onClick={()=>setReportType('BALANCO')} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${reportType === 'BALANCO' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-slate-50 text-slate-400'}`}>
            <Scale className="w-4 h-4"/> Balanço
          </button>
          <button onClick={()=>setReportType('ABC_PROD')} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${reportType === 'ABC_PROD' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-slate-50 text-slate-400'}`}>
            <Package className="w-4 h-4"/> Curva ABC
          </button>
          <button onClick={()=>setReportType('COMISSAO')} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${reportType === 'COMISSAO' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-slate-50 text-slate-400'}`}>
            <UserCheck className="w-4 h-4"/> Comissões
          </button>
       </div>
       
       <div className="bg-white p-8 lg:p-12 rounded-[3rem] border shadow-sm min-h-[600px]">
          {reportType === 'DRE' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic skew-x-[-6deg] text-indigo-600">DRE - Demonstração de Resultados</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Visão Gerencial Integrada ao Plano de Contas</p>
              </div>
              <div className="space-y-1 mb-10">
                <ReportLine code="4.1" label="Receita Operacional Bruta" val={dreData.grossRevenue} />
                <ReportLine code="4.2" label="Deduções da Receita" val={dreData.discounts} isNegative indent={1} />
                <ReportLine label="(=) Receita Operacional Líquida" val={dreData.netRevenue} isMain />
                <ReportLine code="4.3" label="Custos Diretos (CMV)" val={dreData.cmv} isNegative indent={1} />
                <ReportLine label="(=) Lucro Bruto" val={dreData.grossProfit} isMain />
                <ReportLine code="4.4" label="Despesas Operacionais" val={dreData.totalExpenses} isNegative indent={1} />
                <ReportLine label="(=) Resultado Operacional (EBITDA)" val={dreData.netProfit} isMain />
              </div>
              <div className="bg-indigo-950 text-white p-8 rounded-[2.5rem] flex justify-between items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Resultado Líquido</p>
                  <h4 className="text-3xl font-black italic skew-x-[-6deg] uppercase">Lucro do Exercício</h4>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-emerald-400">R$ {(Number(dreData.netProfit) || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Margem: {(Number(dreData.margin) || 0).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {reportType === 'BALANCO' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-2 mb-6">
                      <h4 className="text-lg font-black italic skew-x-[-6deg] uppercase text-slate-900">1. Ativo</h4>
                      <ArrowUpRight className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-mono opacity-30">1.1</span>
                          <span className="text-[11px] font-black uppercase tracking-tight">Ativo Circulante</span>
                          <span className="text-[11px] font-black">R$ {balancoData.totalAtivo.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                        </div>
                        <div className="space-y-3 pl-4">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Disponibilidades (Caixa/Bancos)</span><span>R$ {balancoData.disponibilidades.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Estoques (Custo Médio)</span><span>R$ {balancoData.estoqueValor.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-xl">
                    <span className="text-xs font-black uppercase tracking-widest">Total do Ativo</span>
                    <span className="text-xl font-black">R$ {balancoData.totalAtivo.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-6">
                      <h4 className="text-lg font-black italic skew-x-[-6deg] uppercase text-slate-900">2. Passivo + PL</h4>
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-mono opacity-30">2.1</span>
                          <span className="text-[11px] font-black uppercase tracking-tight">Passivo Circulante</span>
                          <span className="text-[11px] font-black">R$ 0,00</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2 mb-4 mt-8">
                          <h4 className="text-[11px] font-black uppercase text-emerald-600">3. Patrimônio Líquido</h4>
                        </div>
                        <div className="space-y-3 pl-4">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Lucros/Prejuízos Acumulados</span><span>R$ {balancoData.lucroAcumulado.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-xl">
                    <span className="text-xs font-black uppercase tracking-widest">Total Passivo + PL</span>
                    <span className="text-xl font-black">R$ {balancoData.lucroAcumulado.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'COMISSAO' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600"><UserCheck className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic skew-x-[-6deg]">Comissões</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Produtividade por Vendedor</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] border overflow-hidden">
                <table className="w-full text-left text-[11px]">
                   <thead className="bg-slate-100 font-black border-b uppercase text-[9px] tracking-widest text-slate-500">
                     <tr><th className="p-6">Vendedor</th><th className="p-6 text-center">Vendas</th><th className="p-6">Total Vendido</th><th className="p-6 text-right">Comissão</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                     {commissionData.map((s: any, idx: number) => (
                       <tr key={idx} className="hover:bg-white transition-colors">
                          <td className="p-6 font-black uppercase">{s.name}</td>
                          <td className="p-6 text-center font-bold">{s.salesCount}</td>
                          <td className="p-6 font-black">R$ {s.totalSold.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                          <td className="p-6 text-right font-black text-emerald-600">R$ {s.commissionEarned.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'ABC_PROD' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600"><Package className="w-8 h-8" /></div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic skew-x-[-6deg]">Curva ABC</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Análise de Faturamento por Item</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] border overflow-hidden">
                <table className="w-full text-left text-[11px]">
                   <thead className="bg-slate-100 font-black border-b uppercase text-[9px] tracking-widest text-slate-500">
                     <tr><th className="p-6">Produto</th><th className="p-6">Total Vendido</th><th className="p-6 text-center">Classe</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                     {db.products.map((p: any, idx: number) => (
                       <tr key={idx} className="hover:bg-white transition-colors">
                          <td className="p-6 font-black uppercase">{p.name}</td>
                          <td className="p-6 font-black text-indigo-600">R$ {(p.price * 10).toFixed(2)}</td>
                          <td className="p-6 text-center"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black">A</span></td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default ReportsView;