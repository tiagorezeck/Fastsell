"use client";

import React, { useState, useEffect } from 'react';
import { Target, Percent, Save, UserCheck, Calendar, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Database, SellerGoal, GoalRule } from '../types';
import { toast } from 'react-hot-toast';

interface GoalsManagerProps {
  db: Database;
  setDb: (db: Database) => void;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ db, setDb }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [editingRules, setEditingRules] = useState<GoalRule[]>(db.goalRules);

  useEffect(() => {
    setEditingRules(db.goalRules);
  }, [db.goalRules]);

  const handleSaveRules = () => {
    setDb({ ...db, goalRules: editingRules });
    toast.success("Regras de comissão atualizadas!");
  };

  const addRule = () => {
    const newRule: GoalRule = {
      id: `GR${Date.now()}`,
      minPct: 0,
      maxPct: 0,
      commissionRate: 0
    };
    setEditingRules([...editingRules, newRule]);
  };

  const removeRule = (id: string) => {
    setEditingRules(editingRules.filter(r => r.id !== id));
  };

  const updateGoal = (sellerId: string, amount: number) => {
    const existingIdx = db.sellerGoals.findIndex(g => g.sellerId === sellerId && g.month === selectedMonth);
    let newGoals = [...db.sellerGoals];

    if (existingIdx >= 0) {
      newGoals[existingIdx] = { ...newGoals[existingIdx], targetAmount: amount };
    } else {
      newGoals.push({
        id: `G${Date.now()}-${sellerId}`,
        sellerId,
        month: selectedMonth,
        targetAmount: amount
      });
    }

    setDb({ ...db, sellerGoals: newGoals });
  };

  const sellers = db.users.filter(u => u.role === 'Vendedor' || u.role === 'Admin');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Metas e Performance</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configuração de Objetivos e Comissões</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input 
            type="month" 
            className="bg-slate-50 border-none p-2 rounded-xl text-xs font-black outline-none focus:ring-2 ring-indigo-500/20"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Regras de Comissão */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-widest">Regras de Performance</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={addRule} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all" title="Adicionar Regra">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={handleSaveRules} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all" title="Salvar Regras">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {editingRules.map((rule, idx) => (
                <div key={rule.id} className="relative group">
                  <div className="grid grid-cols-12 gap-2 items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="col-span-4">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Atingimento Mín.</p>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          className="w-full bg-white border-none p-2 rounded-lg text-[10px] font-black outline-none"
                          value={rule.minPct}
                          onChange={e => {
                            const newRules = [...editingRules];
                            newRules[idx].minPct = Number(e.target.value);
                            setEditingRules(newRules);
                          }}
                        />
                        <span className="text-[10px] font-black text-slate-300">%</span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Atingimento Máx.</p>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          className="w-full bg-white border-none p-2 rounded-lg text-[10px] font-black outline-none"
                          value={rule.maxPct}
                          onChange={e => {
                            const newRules = [...editingRules];
                            newRules[idx].maxPct = Number(e.target.value);
                            setEditingRules(newRules);
                          }}
                        />
                        <span className="text-[10px] font-black text-slate-300">%</span>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <p className="text-[8px] font-black text-indigo-600 uppercase mb-1">Comissão</p>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full bg-indigo-600 text-white border-none p-2 rounded-lg text-[10px] font-black outline-none"
                          value={rule.commissionRate}
                          onChange={e => {
                            const newRules = [...editingRules];
                            newRules[idx].commissionRate = Number(e.target.value);
                            setEditingRules(newRules);
                          }}
                        />
                        <span className="text-[10px] font-black text-indigo-600">%</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeRule(rule.id)}
                    className="absolute -right-2 -top-2 p-1.5 bg-white text-red-500 rounded-full shadow-md border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {editingRules.length === 0 && (
                <div className="py-10 text-center opacity-20 font-black uppercase tracking-widest text-[10px]">
                  Nenhuma regra definida
                </div>
              )}
            </div>
            <p className="mt-6 text-[9px] font-bold text-slate-400 leading-relaxed italic">
              * As regras acima substituem a comissão base do vendedor caso o atingimento da meta mensal esteja dentro da faixa.
            </p>
          </div>
        </div>

        {/* Metas Individuais */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-widest">Metas por Vendedor</h3>
            </div>

            <div className="space-y-3">
              {sellers.map(seller => {
                const goal = db.sellerGoals.find(g => g.sellerId === seller.id && g.month === selectedMonth);
                return (
                  <div key={seller.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xs text-indigo-600 shadow-sm">
                        {seller.code || 'N/A'}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase text-slate-700">{seller.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{seller.role} • {seller.sector || 'Geral'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Meta Mensal</p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">R$</span>
                          <input 
                            type="number" 
                            className="bg-white border-none p-3 pl-8 rounded-xl text-xs font-black outline-none w-32 focus:ring-2 ring-indigo-500/20"
                            value={goal?.targetAmount || 0}
                            onChange={e => updateGoal(seller.id, Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {sellers.length === 0 && (
                <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">
                  Nenhum vendedor cadastrado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsManager;