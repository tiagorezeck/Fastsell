"use client";

import React, { useMemo, useState, useRef } from 'react';
import { History, Plus, Search, Package, ScanLine, MoveRight, PlusCircle, X, PlusSquare, Minus, Trash2, Check } from 'lucide-react';
import { Database, StockMovement, MoveItem, StockBatch } from '../types';
import { toast } from 'react-hot-toast';
import Scanner from './Scanner';

interface StockHistoryViewProps {
  db: Database;
  setDb: (db: Database) => void;
  startDate: string;
  endDate: string;
}

const StockHistoryView: React.FC<StockHistoryViewProps> = ({ db, setDb, startDate, endDate }) => {
  const [isManualMoveOpen, setIsManualMoveOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<'Location' | 'Nature' | 'Address' | null>(null);
  const [quickAddName, setQuickAddName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isHistorySearchOpen, setIsHistorySearchOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  
  const [moveHeader, setMoveHeader] = useState({ direction: 'Entrada' as StockMovement['direction'], natureId: '', reason: '', fromLocationId: '', toLocationId: '' });
  const [moveItems, setMoveItems] = useState<MoveItem[]>([]);

  const filteredMovements = useMemo(() => {
    return db.stockMovements.filter(m => {
      const date = m.date.split('T')[0];
      const inPeriod = date >= startDate && date <= endDate;
      const product = db.products.find(p => p.id === m.productId);
      const matchesSearch = !historySearch || product?.name.toLowerCase().includes(historySearch.toLowerCase()) || product?.barcode.includes(historySearch);
      return inPeriod && matchesSearch;
    });
  }, [db.stockMovements, db.products, startDate, endDate, historySearch]);

  const handleQuickAdd = () => {
    if (!quickAddName) return;
    const id = `ID${Date.now()}`;
    if (isQuickAddOpen === 'Location') setDb({ ...db, locations: [...(db.locations || []), { id, name: quickAddName, type: 'Estoque' }] });
    else if (isQuickAddOpen === 'Address') setDb({ ...db, addresses: [...(db.addresses || []), { id, name: quickAddName }] });
    else setDb({ ...db, movementNatures: [...(db.movementNatures || []), { id, name: quickAddName, defaultDirection: moveHeader.direction }] });
    setQuickAddName(''); setIsQuickAddOpen(null); toast.success("Cadastrado!");
  };

  const addItem = (productId: string) => {
    const existing = moveItems.find(i => i.productId === productId);
    if (existing) { setMoveItems(moveItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)); }
    else { const product = db.products.find(p => p.id === productId); setMoveItems([...moveItems, { productId, quantity: 1, addressId: product?.addressId }]); }
    setSearchTerm(''); setShowResults(false);
  };

  const handleConfirmBulkMove = () => {
    if (!moveHeader.natureId || moveItems.length === 0) {
      toast.error("Selecione a natureza e adicione itens.");
      return;
    }
    let updatedProducts = [...db.products];
    let newMovements: StockMovement[] = [];
    for (const item of moveItems) {
      const product = updatedProducts.find(p => p.id === item.productId);
      if (!product) continue;
      let updatedBatches = [...(product.batches || [])];
      if (moveHeader.direction === 'Entrada') {
        updatedBatches.push({ id: `B${Date.now()}-${product.id}`, batchNumber: 'LOTE-LOTE', entryDate: new Date().toISOString(), expirationDate: product.expirationDate, quantity: item.quantity, costPrice: product.costPrice });
      } else {
        let remaining = item.quantity;
        updatedBatches = [...updatedBatches].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()).map(b => {
          if (remaining <= 0) return b;
          const take = Math.min(b.quantity, remaining);
          remaining -= take;
          return { ...b, quantity: b.quantity - take };
        }).filter(b => b.quantity > 0);
        if (remaining > 0) {
          toast.error(`Estoque insuficiente para ${product.name}!`);
          return;
        }
      }
      updatedProducts = updatedProducts.map(p => p.id === product.id ? { ...p, batches: updatedBatches, stock: updatedBatches.reduce((acc, b) => acc + b.quantity, 0) } : p);
      newMovements.push({ id: `M${Date.now()}-${product.id}`, productId: product.id, ...moveHeader, addressId: item.addressId, quantity: item.quantity, date: new Date().toISOString() } as any);
    }
    setDb({ ...db, products: updatedProducts, stockMovements: [...db.stockMovements, ...newMovements] });
    setIsManualMoveOpen(false); setMoveItems([]); toast.success("Movimentação concluída!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><History className="w-6 h-6" /></div>
          <div><h2 className="text-lg font-black uppercase tracking-tight">Movimentações de Estoque</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestão Logística em Lote</p></div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {isHistorySearchOpen ? (
            <div className="flex-1 md:w-64 relative animate-in slide-in-from-right-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input autoFocus type="text" className="w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20" placeholder="Filtrar histórico..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
              <button onClick={() => { setIsHistorySearchOpen(false); setHistorySearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setIsHistorySearchOpen(true)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><Search className="w-5 h-5" /></button>
          )}
          <button onClick={() => setIsManualMoveOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Nova Movimentação</button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
            <tr><th className="p-4">Data</th><th className="p-4">Produto</th><th className="p-4">Direção</th><th className="p-4">Natureza</th><th className="p-4">Qtd</th><th className="p-4">Origem / Destino</th><th className="p-4">Endereço</th></tr>
          </thead>
          <tbody className="divide-y">
            {filteredMovements.slice().reverse().map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-400">{new Date(m.date).toLocaleString('pt-BR')}</td>
                <td className="p-4 font-bold uppercase">{db.products.find(p => p.id === m.productId)?.name}</td>
                <td className="p-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${m.direction === 'Entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{m.direction}</span></td>
                <td className="p-4"><span className="text-[9px] font-black uppercase text-slate-500">{db.movementNatures.find(n => n.id === m.natureId)?.name || 'Geral'}</span></td>
                <td className="p-4 font-black">{m.quantity}</td>
                <td className="p-4"><div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">{db.locations?.find(l => l.id === m.fromLocationId)?.name || 'Externo'} <MoveRight className="w-2.5 h-2.5 opacity-30" /> {db.locations?.find(l => l.id === m.toLocationId)?.name || 'Externo'}</div></td>
                <td className="p-4">{m.addressId ? <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">{db.addresses?.find(a => a.id === m.addressId)?.name}</span> : <span className="text-slate-300">-</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isManualMoveOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl p-8 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4"><div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><ScanLine className="w-6 h-6" /></div><div><h3 className="text-xl font-black uppercase tracking-tight text-indigo-600">Movimentação em Lote</h3><p className="text-[10px] font-bold text-slate-400 uppercase">Bipe com scanner externo ou use a câmera</p></div></div>
              <button onClick={() => setIsManualMoveOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar pr-2">
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Direção</label><div className="flex gap-1 bg-white p-1 rounded-xl border"><button onClick={() => setMoveHeader({...moveHeader, direction: 'Entrada'})} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${moveHeader.direction === 'Entrada' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>Entrada</button><button onClick={() => setMoveHeader({...moveHeader, direction: 'Saída'})} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${moveHeader.direction === 'Saída' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'}`}>Saída</button></div></div>
                  <div className="space-y-1"><div className="flex justify-between items-center mb-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Natureza</label><button onClick={() => setIsQuickAddOpen('Nature')} className="text-[8px] font-black text-indigo-600 uppercase">+ Nova</button></div><select className="w-full border bg-white p-3 rounded-xl text-xs font-black outline-none" value={moveHeader.natureId} onChange={e => setMoveHeader({...moveHeader, natureId: e.target.value})}><option value="">Selecione...</option>{db.movementNatures.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}</select></div>
                  <div className="space-y-1"><div className="flex justify-between items-center mb-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Unidade Origem</label><button onClick={() => setIsQuickAddOpen('Location')} className="text-[8px] font-black text-indigo-600 uppercase">+ Nova</button></div><select className="w-full border bg-white p-3 rounded-xl text-xs font-black outline-none" value={moveHeader.fromLocationId} onChange={e => setMoveHeader({...moveHeader, fromLocationId: e.target.value})}><option value="">Externo</option>{db.locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                  <div className="space-y-1"><div className="flex justify-between items-center mb-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Unidade Destino</label><button onClick={() => setIsQuickAddOpen('Location')} className="text-[8px] font-black text-indigo-600 uppercase">+ Nova</button></div><select className="w-full border bg-white p-3 rounded-xl text-xs font-black outline-none" value={moveHeader.toLocationId} onChange={e => setMoveHeader({...moveHeader, toLocationId: e.target.value})}><option value="">Externo</option>{db.locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                </div>
              </div>
              <div className="lg:col-span-9 space-y-6">
                <div className="flex gap-3">
                  <button onClick={() => setIsScannerOpen(true)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"><ScanLine className="w-5 h-5" /> Scanner</button>
                  <div className="flex-[2] relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Buscar produto..." className="w-full border bg-slate-50 p-4 pl-12 rounded-2xl text-xs font-black outline-none focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setShowResults(true); }} onFocus={() => setShowResults(true)} /></div>
                      <button onClick={() => { const p = db.products.find(x => x.name.toLowerCase().includes(searchTerm.toLowerCase()) || x.barcode === searchTerm); if(p) addItem(p.id); }} className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"><PlusSquare className="w-4 h-4" /> Adicionar</button>
                    </div>
                    {showResults && searchTerm && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {db.products.filter(p => p.type !== 'Serviço' && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm))).slice(0, 5).map(p => (
                          <button key={p.id} onClick={() => addItem(p.id)} className="w-full text-left p-4 hover:bg-indigo-50 flex items-center justify-between border-b last:border-none group"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Package className="w-4 h-4 text-slate-300" /></div><div><p className="text-xs font-black uppercase text-slate-700">{p.name}</p><p className="text-[8px] font-bold text-slate-400 uppercase">{p.barcode}</p></div></div><PlusCircle className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 transition-colors" /></button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-white/50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
                      <tr><th className="p-4">Produto</th><th className="p-4 text-center">Quantidade</th><th className="p-4">Endereço</th><th className="p-4 text-right">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {moveItems.map((item, idx) => {
                        const p = db.products.find(prod => prod.id === item.productId);
                        return (
                          <tr key={idx} className="bg-white/30 group">
                            <td className="p-4 font-black uppercase text-slate-700">{p?.name}</td>
                            <td className="p-4"><div className="flex items-center justify-center gap-3"><button onClick={() => setMoveItems(moveItems.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))} className="p-1 bg-white border rounded-lg text-slate-400 hover:text-red-500"><Minus className="w-3 h-3" /></button><input type="number" className="w-12 text-center bg-transparent font-black text-xs outline-none" value={item.quantity} onChange={e => setMoveItems(moveItems.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))} /><button onClick={() => setMoveItems(moveItems.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it))} className="p-1 bg-white border rounded-lg text-slate-400 hover:text-emerald-500"><Plus className="w-3 h-3" /></button></div></td>
                            <td className="p-4"><div className="flex items-center gap-2"><select className="flex-1 border bg-white p-2 rounded-xl text-[10px] font-black uppercase outline-none" value={item.addressId || ''} onChange={e => setMoveItems(moveItems.map((it, i) => i === idx ? { ...it, addressId: e.target.value } : it))}><option value="">Geral</option>{db.addresses?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select><button onClick={() => setIsQuickAddOpen('Address')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Plus className="w-3 h-3" /></button></div></td>
                            <td className="p-4 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => setMoveItems(moveItems.filter((_, i) => i !== idx))} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-8 mt-auto border-t"><button onClick={handleConfirmBulkMove} className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"><Check className="w-5 h-5" /> Finalizar Movimentação ({moveItems.length})</button><button onClick={() => setIsManualMoveOpen(false)} className="px-10 bg-slate-100 text-slate-400 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button></div>
          </div>
        </div>
      )}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md animate-in zoom-in duration-200"><Scanner products={db.products} onScan={addItem} onManualRegister={() => setIsScannerOpen(false)} onClose={() => setIsScannerOpen(false)} /></div>
        </div>
      )}
    </div>
  );
};

export default StockHistoryView;