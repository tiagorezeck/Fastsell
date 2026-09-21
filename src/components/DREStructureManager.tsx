"use client";

import React, { useState } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Edit3, CheckCircle2, X, Layers, Calculator, ArrowRightLeft } from 'lucide-react';
import { Database, DRELine, Account } from '../types';
import { toast } from 'react-hot-toast';

interface DREStructureManagerProps {
  db: Database;
  setDb: (db: Database) => void;
}

const DREStructureManager: React.FC<DREStructureManagerProps> = ({ db, setDb }) => {
  const [editingLine, setEditingLine] = useState<DRELine | null>(null);
  const structure = db.companyInfo.dreStructure || [];

  const handleSaveLine = (line: DRELine) => {
    const newStructure = editingLine?.id 
      ? structure.map(l => l.id === editingLine.id ? line : l)
      : [...structure, { ...line, id: `DRE${Date.now()}` }];
    
    setDb({ ...db, companyInfo: { ...db.companyInfo, dreStructure: newStructure } });
    setEditingLine(null);
    toast.success("Estrutura atualizada!");
  };

  const removeLine = (id: string) => {
    if (window.confirm("Remover esta linha da DRE?")) {
      setDb({ ...db, companyInfo: { ...db.companyInfo, dreStructure: structure.filter(l => l.id !== id) } });
    }
  };

  const moveLine = (idx: number, direction: 'up' | 'down') => {
    const newStructure = [...structure];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newStructure.length) return;
    [newStructure[idx], newStructure[targetIdx]] = [newStructure[targetIdx], newStructure[idx]];
    setDb({ ...db, companyInfo: { ...db.companyInfo, dreStructure: newStructure } });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Editor de Estrutura DRE</h3>
        <button 
          onClick={() => setEditingLine({ id: '', label: '', operation: '+', accountCodes: [], indent: 0, isMain: false, isVisible: true })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all"
        >
          + Nova Linha
        </button>
      </div>

      <div className="space-y-2">
        {structure.map((line, idx) => (
          <div key={line.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
            <div className="flex flex-col gap-1">
              <button onClick={() => moveLine(idx, 'up')} className="p-1 text-slate-300 hover:text-indigo-600"><MoveUp className="w-3 h-3" /></button>
              <button onClick={() => moveLine(idx, 'down')} className="p-1 text-slate-300 hover:text-indigo-600"><MoveDown className="w-3 h-3" /></button>
            </div>
            
            <div className="flex-1 flex items-center gap-4" style={{ marginLeft: `${line.indent * 20}px` }}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                line.operation === '+' ? 'bg-emerald-50 text-emerald-600' : 
                line.operation === '-' ? 'bg-red-50 text-red-600' : 
                'bg-indigo-50 text-indigo-600'
              }`}>
                {line.operation}
              </span>
              <div>
                <p className={`text-xs font-black uppercase ${line.isMain ? 'text-slate-900' : 'text-slate-500'}`}>{line.label}</p>
                <p className="text-[8px] font-mono text-slate-400">Contas: {line.accountCodes.join(', ') || 'Nenhuma'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingLine(line)} className="p-2 text-indigo-400 hover:bg-white rounded-xl shadow-sm"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => removeLine(line.id)} className="p-2 text-red-400 hover:bg-white rounded-xl shadow-sm"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editingLine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black uppercase tracking-tight text-indigo-600">Configurar Linha da DRE</h4>
              <button onClick={() => setEditingLine(null)}><X className="w-6 h-6 text-slate-300" /></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome da Linha</label>
                  <input 
                    className="w-full border p-4 rounded-2xl text-sm font-black bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20"
                    value={editingLine.label}
                    onChange={e => setEditingLine({ ...editingLine, label: e.target.value })}
                    placeholder="Ex: Receita de Vendas"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Operação Matemática</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['+', '-', '+/-', '='].map(op => (
                      <button 
                        key={op}
                        onClick={() => setEditingLine({ ...editingLine, operation: op as any })}
                        className={`p-3 rounded-xl border-2 font-black transition-all ${editingLine.operation === op ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nível (Subgrupo)</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border">
                    <button onClick={() => setEditingLine({ ...editingLine, indent: Math.max(0, editingLine.indent - 1) })} className="p-2 hover:bg-white rounded-xl"><Layers className="w-4 h-4 rotate-180" /></button>
                    <span className="flex-1 text-center font-black text-xs">Nível {editingLine.indent + 1}</span>
                    <button onClick={() => setEditingLine({ ...editingLine, indent: editingLine.indent + 1 })} className="p-2 hover:bg-white rounded-xl"><Layers className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Estilo Visual</label>
                  <button 
                    onClick={() => setEditingLine({ ...editingLine, isMain: !editingLine.isMain })}
                    className={`w-full p-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${editingLine.isMain ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                  >
                    {editingLine.isMain ? 'Destaque (Negrito)' : 'Normal'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <ArrowRightLeft className="w-3 h-3" /> Mapeamento de Contas (Plano de Contas)
                </label>
                <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {db.accounts
                    .sort((a, b) => String(a.code).localeCompare(String(b.code), undefined, { numeric: true }))
                    .map(acc => {
                      const isSelected = editingLine.accountCodes.includes(acc.code);
                      return (
                        <button 
                          key={acc.id}
                          onClick={() => {
                            const codes = isSelected 
                              ? editingLine.accountCodes.filter(c => c !== acc.code)
                              : [...editingLine.accountCodes, acc.code];
                            setEditingLine({ ...editingLine, accountCodes: codes });
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'bg-white border-indigo-600 shadow-sm' : 'bg-transparent border-transparent opacity-60'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-black text-indigo-600">{acc.code}</span>
                            <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{acc.name}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })}
                </div>
                <p className="text-[8px] font-bold text-slate-400 italic">* Selecione as contas que somarão o valor desta linha.</p>
              </div>

              <button 
                onClick={() => handleSaveLine(editingLine)}
                className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DREStructureManager;