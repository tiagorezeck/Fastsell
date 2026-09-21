"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Trash2, Plus, Edit3, FolderTree, Tags, Wrench, ArrowRightLeft, Layers, CheckSquare, Square, Move, X, ChevronRight, ChevronDown, AlertTriangle, RotateCcw, Landmark, Wallet, Scale, TrendingUp } from 'lucide-react';
import { Database, Account } from '../types';
import { toast } from 'react-hot-toast';
import { ERP_ACCOUNTS, DEFAULT_DRE_STRUCTURE } from '../db';

// Função auxiliar para ordenação natural de planos de contas (ex: 4.9 < 4.10)
const sortAccountCodes = (a: string, b: string) => {
  const partsA = String(a).split('.').map(Number);
  const partsB = String(b).split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const valA = partsA[i] || 0;
    const valB = partsB[i] || 0;
    if (valA !== valB) return valA - valB;
  }
  return 0;
};

interface ChartOfAccountsManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (account: Account) => void;
}

const ChartOfAccountsManager: React.FC<ChartOfAccountsManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetParentCode, setTargetParentCode] = useState<string>('');
  const [expandedCodes, setExpandedCodes] = useState<string[]>([]);
  const [viewLevel, setViewLevel] = useState<1 | 2 | 3>(1);

  const fullAccounts = useMemo(() => {
    const baseAccounts = [...db.accounts];
    
    const salesCategories = db.categories
      .filter(c => {
        const hasSaleableProducts = db.products.some(p => 
          p.category === c.name && (p.type === 'Revenda' || p.type === 'Produzido')
        );
        return c.type === 'Venda' && hasSaleableProducts;
      })
      .map((c, idx) => ({
        id: `cat_${c.id}`,
        code: `1.1.${idx + 1}`,
        name: c.name,
        type: 'Receita' as const,
        parentCode: '1.1',
        isDynamic: true,
        classification: 'Item' as const
      }));

    const serviceItems = db.products
      .filter(p => p.type === 'Serviço')
      .map((s, idx) => ({
        id: `srv_item_${s.id}`,
        code: `1.2.${idx + 1}`,
        name: s.name,
        type: 'Receita' as const,
        parentCode: '1.2',
        isDynamic: true,
        classification: 'Item' as const
      }));

    const merged = [...baseAccounts];
    [...salesCategories, ...serviceItems].forEach(dyn => {
      if (!merged.find(a => a.code === dyn.code)) {
        merged.push(dyn as any);
      }
    });

    return merged;
  }, [db.accounts, db.categories, db.products]);

  useEffect(() => {
    if (viewLevel === 1) {
      setExpandedCodes([]);
    } else if (viewLevel === 2) {
      const level1Codes = fullAccounts.filter(a => !a.parentCode).map(a => a.code);
      setExpandedCodes(level1Codes);
    } else {
      const allParentCodes = Array.from(new Set(
        fullAccounts
          .filter(a => fullAccounts.some(child => String(child.parentCode) === String(a.code)))
          .map(a => a.code)
      ));
      setExpandedCodes(allParentCodes);
    }
  }, [viewLevel, fullAccounts]);

  const handleLevelChange = () => {
    const nextLevel = (viewLevel % 3) + 1;
    setViewLevel(nextLevel as any);
  };

  const handleRestoreDefault = () => {
    const msg = "ATENÇÃO: Retornar ao padrão pode dar erro e sumir informações com itens apagados.\n\nDeseja realmente restaurar o Plano de Contas padrão?";
    if (window.confirm(msg)) {
      setDb({ 
        ...db, 
        accounts: ERP_ACCOUNTS,
        companyInfo: {
          ...db.companyInfo,
          dreStructure: DEFAULT_DRE_STRUCTURE
        }
      });
      setViewLevel(1); 
      toast.success("Plano de Contas restaurado!");
    }
  };

  const toggleExpand = (code: string) => {
    setExpandedCodes(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectChildren = (parentCode: string) => {
    const childrenIds = fullAccounts
      .filter(a => String(a.parentCode).startsWith(parentCode) || String(a.code).startsWith(parentCode + '.'))
      .map(a => a.id);
    setSelectedIds(prev => Array.from(new Set([...prev, ...childrenIds])));
    toast.success("Itens selecionados!");
  };

  const handleBulkMove = () => {
    if (!targetParentCode && targetParentCode !== '') {
      toast.error("Selecione um grupo de destino");
      return;
    }

    let updatedAccounts = [...db.accounts];
    const targetParent = db.accounts.find(a => a.code === targetParentCode);
    const newType = targetParent ? targetParent.type : 'Despesa';

    const itemsToMove = db.accounts
      .filter(a => selectedIds.includes(a.id))
      .sort((a, b) => sortAccountCodes(a.code, b.code));

    itemsToMove.forEach(acc => {
      const siblings = updatedAccounts.filter(a => a.parentCode === targetParentCode);
      let nextSuffix = 1;
      if (siblings.length > 0) {
        const lastCodes = siblings.map(s => {
          const parts = String(s.code).split('.');
          return parseInt(parts[parts.length - 1]);
        }).filter(n => !isNaN(n));
        if (lastCodes.length > 0) nextSuffix = Math.max(...lastCodes) + 1;
      }

      const oldPrefix = acc.code;
      const newPrefix = targetParentCode ? `${targetParentCode}.${nextSuffix}` : `${nextSuffix}`;

      updatedAccounts = updatedAccounts.map(item => {
        if (item.id === acc.id) {
          return { ...item, parentCode: targetParentCode, code: newPrefix, type: newType };
        }
        if (String(item.code).startsWith(oldPrefix + '.')) {
          const suffix = String(item.code).substring(oldPrefix.length);
          const newChildCode = newPrefix + suffix;
          const newChildParent = newChildCode.substring(0, newChildCode.lastIndexOf('.'));
          return { ...item, code: newChildCode, parentCode: newChildParent, type: newType };
        }
        return item;
      });
    });

    setDb({ ...db, accounts: updatedAccounts });
    setIsBulkMode(false);
    setSelectedIds([]);
    setTargetParentCode('');
    toast.success(`${selectedIds.length} itens movidos!`);
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Receita': return 'bg-emerald-50 text-emerald-600';
      case 'Despesa': return 'bg-red-50 text-red-600';
      case 'Custo': return 'bg-orange-50 text-orange-600';
      case 'Dedução': return 'bg-rose-50 text-rose-600';
      case 'Ativo': return 'bg-indigo-50 text-indigo-600';
      case 'Passivo': return 'bg-slate-100 text-slate-600';
      case 'Patrimônio Líquido': return 'bg-amber-50 text-amber-600';
      case 'Resultado Financeiro': return 'bg-blue-50 text-blue-600';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  const renderAccount = (account: any, level: number = 0, visited: Set<string> = new Set()) => {
    if (visited.has(account.code) || level > 15) {
      return (
        <div key={account.id} className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-[10px] font-black uppercase">
          <AlertTriangle className="w-4 h-4" /> Erro de Hierarquia em {account.code}
        </div>
      );
    }
    
    const newVisited = new Set(visited);
    newVisited.add(account.code);

    const children = fullAccounts.filter(a => String(a.parentCode || '') === String(account.code || ''));
    const isSelected = selectedIds.includes(account.id);
    const isExpanded = expandedCodes.includes(account.code);
    const hasChildren = children.length > 0;
    
    return (
      <div key={account.id} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:border-slate-100'} ${level === 0 ? 'bg-slate-50/50' : ''}`} 
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button onClick={() => toggleExpand(account.code)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            {isBulkMode && !account.isDynamic ? (
              <button onClick={() => toggleSelection(account.id)} className={`p-1 rounded-lg transition-all ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>
                {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>
            ) : null}
            
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-[9px] font-black ${getTypeStyles(account.type)}`}>{account.code}</div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${level === 0 ? 'font-black uppercase tracking-tight' : 'font-bold text-slate-700'}`}>{account.name}</span>
                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${
                  account.isDynamic ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {account.isDynamic ? (account.code.startsWith('1.2') ? <Wrench className="w-2.5 h-2.5" /> : <Tags className="w-2.5 h-2.5" />) : <Layers className="w-2.5 h-2.5" />}
                  {account.isDynamic ? 'Catálogo' : account.classification || 'Conta'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isBulkMode ? (
              !account.isDynamic && hasChildren && (
                <button onClick={() => selectChildren(account.code)} className="px-3 py-1 bg-white border rounded-lg text-[8px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all">Selecionar Filhos</button>
              )
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                {!account.isDynamic && (
                  <>
                    <button onClick={() => onEdit({ id: '', code: '', name: '', type: account.type, parentCode: account.code, classification: 'Subgrupo' })} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl" title="Adicionar Subconta"><Plus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onEdit(account)} className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-xl" title="Editar Conta"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => {
                      if (hasChildren) {
                        toast.error("Não é possível excluir uma conta com subcontas!");
                        return;
                      }
                      if (window.confirm('Excluir conta?')) setDb({ ...db, accounts: db.accounts.filter(a => a.id !== account.id) });
                    }} className="p-2 text-red-300 hover:text-red-500 rounded-xl" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
            {children.sort((a, b) => sortAccountCodes(a.code, b.code)).map(child => renderAccount(child, level + 1, newVisited))}
          </div>
        )}
      </div>
    );
  };

  const rootAccounts = fullAccounts.filter(a => !a.parentCode).sort((a, b) => sortAccountCodes(a.code, b.code));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md pb-4 -mx-4 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><FolderTree className="w-6 h-6" /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Plano de Contas</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estrutura Dinâmica com Classificação</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLevelChange} 
              className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 group"
            >
              <div className="p-1.5 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase opacity-50 leading-none mb-1">Nível de Detalhe</p>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  {viewLevel === 1 ? 'Grupos' : viewLevel === 2 ? 'Subgrupos' : 'Completo'}
                </p>
              </div>
            </button>

            <div className="flex gap-2">
              <button 
                onClick={handleRestoreDefault}
                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"
                title="Restaurar Plano Padrão"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Padrão
              </button>
              <button 
                onClick={() => { setIsBulkMode(!isBulkMode); setSelectedIds([]); }} 
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isBulkMode ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isBulkMode ? <><X className="w-4 h-4" /> Cancelar</> : <><CheckSquare className="w-4 h-4" /> Lote</>}
              </button>
              {!isBulkMode && (
                <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Novo</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isBulkMode && selectedIds.length > 0 && (
        <div className="sticky top-[120px] z-10 bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-300 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">{selectedIds.length}</div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Itens Selecionados</p>
              <p className="text-[10px] font-bold opacity-60 uppercase">Escolha o novo grupo pai para mover a seleção</p>
            </div>
          </div>
          <div className="flex flex-1 max-w-md gap-3 w-full">
            <select 
              className="flex-1 bg-white/10 border border-white/20 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:bg-white/20 transition-all"
              value={targetParentCode}
              onChange={e => setTargetParentCode(e.target.value)}
            >
              <option value="" className="text-slate-900">Mover para Raiz (Nível 1)</option>
              {db.accounts
                .filter(a => !selectedIds.includes(a.id) && a.classification !== 'Item')
                .sort((a, b) => sortAccountCodes(a.code, b.code))
                .map(a => <option key={a.id} value={a.code} className="text-slate-900">{a.code} - {a.name}</option>)
              }
            </select>
            <button 
              onClick={handleBulkMove}
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <Move className="w-4 h-4" /> Confirmar Movimentação
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border shadow-sm p-6">
        <div className="space-y-2">{rootAccounts.length > 0 ? rootAccounts.map(account => renderAccount(account)) : <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhuma conta cadastrada</div>}</div>
      </div>
    </div>
  );
};

export default ChartOfAccountsManager;