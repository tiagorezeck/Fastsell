"use client";

import React, { useState } from 'react';
import { Trash2, Edit3, ChefHat, Plus, Package, Info, ShoppingBag, ClipboardList, X, Search } from 'lucide-react';
import { Database, Product } from '../types';
import { toast } from 'react-hot-toast';
import Modal from './Modal';

interface ProductionCatalogManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  searchQuery: string;
}

const ProductionCatalogManager: React.FC<ProductionCatalogManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const [viewingRecipe, setViewingRecipe] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');

  const filteredItems = db.products.filter(p => 
    p.type === 'Produzido' && 
    (p.name.toLowerCase().includes(localSearch.toLowerCase()) || p.barcode.includes(localSearch)) &&
    (catFilter === 'Todas' || p.category === catFilter)
  );

  const getIngredientName = (id: string) => {
    return db.products.find(p => p.id === id)?.name || 'Insumo não encontrado';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
               <ChefHat className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-lg font-black uppercase tracking-tight">Fabricação</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cardápio e Ficha Técnica</p>
            </div>
         </div>
         
         <div className="flex items-center gap-2 w-full md:w-auto">
            {isSearchOpen ? (
              <div className="flex-1 md:w-64 relative animate-in slide-in-from-right-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  autoFocus 
                  type="text" 
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20" 
                  placeholder="Buscar item..." 
                  value={localSearch} 
                  onChange={e => setLocalSearch(e.target.value)} 
                />
                <button onClick={() => { setIsSearchOpen(false); setLocalSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                <Search className="w-5 h-5" />
              </button>
            )}

            <select 
              className="bg-slate-50 border-none p-3 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 ring-indigo-500/20" 
              value={catFilter} 
              onChange={e => setCatFilter(e.target.value)}
            >
              <option value="Todas">Todas Categorias</option>
              {db.categories.filter(c => c.type === 'Venda').map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
              + Novo Item
            </button>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm overflow-x-auto">
         <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 font-black border-b uppercase text-[9px] tracking-widest text-slate-400">
              <tr>
                <th className="p-6">Item</th>
                <th className="p-6">Categoria</th>
                <th className="p-6">Status Ficha</th>
                <th className="p-6">Preço Venda</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((p)=>(
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /> : <ChefHat className="w-5 h-5 text-slate-300" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black uppercase text-xs">{p.name}</span>
                        <button 
                          onClick={() => setViewingRecipe(p)}
                          className="text-[9px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1 mt-1"
                        >
                          <ClipboardList className="w-3 h-3" /> Ver Ficha Técnica
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{p.category}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${p.recipe && p.recipe.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {p.recipe?.length || 0} Insumos
                      </span>
                    </div>
                  </td>
                  <td className="p-6 font-black text-indigo-600 text-sm">R$ {Number(p.price || 0).toFixed(2)}</td>
                  <td className="p-6 text-right space-x-1">
                    <button className="p-2.5 text-indigo-400 hover:bg-indigo-50 rounded-2xl transition-all" onClick={() => onEdit(p)}><Edit3 className="w-4 h-4"/></button>
                    <button className="p-2.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all" onClick={() => { if(window.confirm('Excluir este item?')) setDb({...db, products: db.products.filter(x => x.id !== p.id)}); }}><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhum item de fabricação encontrado</td>
                </tr>
              )}
            </tbody>
         </table>
      </div>

      {/* Modal de Ficha Técnica */}
      <Modal 
        isOpen={!!viewingRecipe} 
        onClose={() => setViewingRecipe(null)} 
        title={`Ficha Técnica: ${viewingRecipe?.name}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Composição do Produto</p>
                <p className="text-sm font-black uppercase text-slate-700">{viewingRecipe?.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              {viewingRecipe?.recipe && viewingRecipe.recipe.length > 0 ? (
                viewingRecipe.recipe.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-[11px] font-bold text-slate-600 uppercase">{getIngredientName(ing.productId)}</span>
                    </div>
                    <span className="text-[11px] font-black text-indigo-600">{ing.netQuantity} un.</span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-30">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-[10px] font-black uppercase">Nenhum insumo vinculado</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-950 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase text-indigo-400 mb-1">Preço de Venda</p>
                <p className="text-2xl font-black">R$ {Number(viewingRecipe?.price || 0).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase text-indigo-400 mb-1">Margem Bruta</p>
                <p className="text-xl font-black text-emerald-400">
                  {viewingRecipe && Number(viewingRecipe.price) > 0 
                    ? (((Number(viewingRecipe.price) - Number(viewingRecipe.costPrice)) / Number(viewingRecipe.price)) * 100).toFixed(1) 
                    : '0.0'}%
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setViewingRecipe(null)}
            className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Fechar Visualização
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductionCatalogManager;