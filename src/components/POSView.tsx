"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Package, Wrench, Search, Barcode, Save, ChevronDown, ChevronUp, Info, AlertCircle, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { Database, Product, CartItem, Sale, Comanda } from '../types';
import { calculatePotentialStock } from '../utils/stock';
import { differenceInDays, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

interface POSViewProps {
  db: Database;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onCheckout: (method: Sale['paymentMethod']) => void;
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeComanda?: Comanda | null;
  onSaveToComanda?: () => void;
  onOpenScanner: () => void;
}

const POSView: React.FC<POSViewProps> = ({ 
  db, cart, setCart, selectedCategory, setSelectedCategory, onCheckout, searchQuery, setSearchQuery, activeComanda, onSaveToComanda, onOpenScanner
}) => {
  // Proteção contra companyInfo indefinido após importação
  const mode = db?.companyInfo?.posMode || 'Varejo';
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const isExpired = (date?: string) => {
    if (!date) return false;
    return differenceInDays(parseISO(date), new Date()) <= 0;
  };

  const addToCart = (product: Product) => {
    if (!product) return;
    if (isExpired(product.expirationDate)) {
      toast.error("Produto vencido!");
      return;
    }

    const available = calculatePotentialStock(product, db.products || []);
    const inCart = cart.find(item => item.productId === product.id)?.quantity || 0;

    if (product.type !== 'Serviço' && inCart >= available) {
      toast.error("Estoque insuficiente!");
      return;
    }

    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: Date.now().toString(), productId: product.id, productName: product.name, quantity: 1, price: Number(product.price || 0) }]);
    }
    toast.success(`${product.name} adicionado!`);
  };

  const removeFromCart = (itemId: string) => setCart(cart.filter(item => item.id !== itemId));

  const filteredProducts = useMemo(() => {
    const products = db?.products || [];
    const categories = db?.categories || [];

    return products.filter(p => {
      if (p.type === 'Insumo') return false;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
      
      if (mode === 'Uniproduto') {
        return searchQuery.length > 0 && matchesSearch;
      }

      if (searchQuery.length > 0) return matchesSearch;
      if (mode === 'Serviço') return p.type === 'Serviço';

      const category = categories.find(c => c.name === p.category);
      const isCategoryVisible = category?.showInPOS ?? true;
      if (!isCategoryVisible && selectedCategory === 'Todas') return false;
      
      return selectedCategory === 'Todas' || p.category === selectedCategory;
    });
  }, [db.products, db.categories, selectedCategory, searchQuery, mode]);

  useEffect(() => {
    if (mode !== 'Uniproduto' || filteredProducts.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addToCart(filteredProducts[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, filteredProducts, selectedIndex, cart]);

  const selectedProduct = filteredProducts[selectedIndex];
  const posCategories = useMemo(() => (db?.categories || []).filter(c => c.showInPOS), [db.categories]);
  const cartSubtotal = cart.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);

  return (
    <div className="flex flex-col md:flex-row gap-3 h-full w-full animate-in fade-in duration-500 min-w-0 overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        
        {mode === 'Uniproduto' ? (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            {searchQuery.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <Barcode className="w-16 h-16 text-slate-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Aguardando Bipagem</h2>
                <p className="text-[10px] font-bold uppercase mt-1">Escaneie um produto ou digite o nome para começar</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                <div className="bg-white p-4 rounded-[2rem] border shadow-lg flex flex-col sm:flex-row gap-6 animate-in zoom-in-95 duration-300 shrink-0">
                  <div className="w-full sm:w-40 aspect-square bg-slate-50 rounded-2xl overflow-hidden border-2 border-white shadow-inner relative shrink-0">
                    {selectedProduct.imageUrl ? (
                      <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" alt={selectedProduct.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <Package className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase shadow-md">
                        {selectedProduct.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 leading-tight mb-2 italic skew-x-[-6deg]">
                        {selectedProduct.name}
                      </h2>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border">
                          <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">SKU</p>
                          <p className="text-[10px] font-mono font-black text-slate-600">{selectedProduct.barcode || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border">
                          <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Estoque</p>
                          <p className={`text-[10px] font-black ${calculatePotentialStock(selectedProduct, db.products || []) <= selectedProduct.minStock ? 'text-red-500' : 'text-emerald-600'}`}>
                            {calculatePotentialStock(selectedProduct, db.products || [])} un.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                      <div>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Preço Unitário</p>
                        <p className="text-3xl font-black text-indigo-600">R$ {Number(selectedProduct.price || 0).toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => addToCart(selectedProduct)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Adicionar (Enter)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col">
                  <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" /> Resultados Encontrados ({filteredProducts.length})
                    </h3>
                    <div className="flex items-center gap-2 text-[7px] font-black text-slate-300 uppercase">
                      <ChevronUp className="w-2.5 h-2.5" /> <ChevronDown className="w-2.5 h-2.5" /> Navegar
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredProducts.map((p, idx) => (
                      <div 
                        key={p.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => addToCart(p)}
                        className={`flex items-center justify-between p-3 border-b last:border-none cursor-pointer transition-all ${selectedIndex === idx ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${selectedIndex === idx ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className={`text-[11px] font-black uppercase ${selectedIndex === idx ? 'text-white' : 'text-slate-700'}`}>{p.name}</p>
                            <p className={`text-[8px] font-bold uppercase ${selectedIndex === idx ? 'text-indigo-200' : 'text-slate-400'}`}>{p.barcode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-black ${selectedIndex === idx ? 'text-white' : 'text-indigo-600'}`}>R$ {Number(p.price || 0).toFixed(2)}</p>
                          <p className={`text-[7px] font-bold uppercase ${selectedIndex === idx ? 'text-indigo-200' : 'text-slate-400'}`}>Estoque: {calculatePotentialStock(p, db.products || [])}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 bg-white rounded-[2rem] border border-dashed border-red-200">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-xl font-black uppercase tracking-tighter text-red-600">Nenhum Produto Encontrado</h2>
                <p className="text-[10px] font-bold uppercase mt-1">Tente outro termo ou verifique o código de barras</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {mode !== 'Serviço' && (
              <div className="flex items-center gap-2 mb-2 bg-white p-1 rounded-xl border shadow-sm overflow-hidden shrink-0">
                <button onClick={() => setSelectedCategory('Todas')} className={`flex items-center justify-center p-1 rounded-lg border transition-all shrink-0 ${selectedCategory === 'Todas' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                  <Search className="w-3 h-3" />
                </button>
                <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 pr-4">
                  {posCategories.map(c => (
                    <button key={c.id} onClick={() => setSelectedCategory(selectedCategory === c.name ? 'Todas' : c.name)} className={`px-2.5 py-1 rounded-lg text-[7px] font-black whitespace-nowrap transition-all border ${selectedCategory === c.name ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}>{c.name.toUpperCase()}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2">
                {filteredProducts.map(p => {
                  const available = calculatePotentialStock(p, db.products || []);
                  const expired = isExpired(p.expirationDate);
                  const isOutOfStock = (p.type !== 'Serviço' && available <= 0) || expired;
                  
                  return (
                    <button 
                      key={p.id}
                      onClick={() => addToCart(p)} 
                      disabled={isOutOfStock}
                      className={`bg-white border border-slate-100 rounded-xl p-1.5 group flex flex-col h-full active:scale-95 transition-all hover:shadow-lg hover:shadow-indigo-100/50 hover:border-indigo-200 ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="aspect-square bg-slate-50 rounded-lg mb-1.5 overflow-hidden relative p-1">
                        <img src={p.imageUrl} className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                        <div className="absolute top-1 left-1">
                          {p.type === 'Serviço' ? <div className="bg-amber-500 text-white p-0.5 rounded shadow-md"><Wrench className="w-2 h-2" /></div> : <div className="bg-indigo-600 text-white p-0.5 rounded shadow-md"><Package className="w-2 h-2" /></div>}
                        </div>
                        {expired ? (
                          <div className="absolute inset-0 bg-red-600/60 flex items-center justify-center rounded-lg">
                            <span className="text-[7px] font-black text-white uppercase tracking-widest rotate-[-15deg] border border-white px-1 py-0.5">VENCIDO</span>
                          </div>
                        ) : p.type !== 'Serviço' && (
                          <div className={`absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[7px] font-black uppercase shadow-md ${available <= (p.minStock || 5) ? 'bg-red-500 text-white' : 'bg-white text-slate-900'}`}>
                            {available}
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] font-black uppercase text-center mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2 h-6 flex items-center justify-center leading-tight px-0.5">{p.name}</p>
                      <div className="mt-auto bg-indigo-50/50 p-1 rounded-md">
                        <p className="text-[10px] font-black text-indigo-600 text-center">R$ {Number(p.price || 0).toFixed(2)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <aside className="w-full md:w-80 flex flex-col bg-white rounded-2xl border shadow-2xl overflow-hidden shrink-0 h-[400px] md:h-full">
        <div className="p-2.5 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest flex justify-between items-center shadow-inner">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-3 h-3 text-white"/> 
            <span>PDV</span>
            <button 
              onClick={onOpenScanner}
              className="ml-2 p-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all border border-white/10"
              title="Escanear Produto"
            >
              <Barcode className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {activeComanda && cart.length > 0 && (
              <button 
                onClick={onSaveToComanda}
                className="bg-emerald-50 hover:bg-emerald-600 px-2 py-0.5 rounded text-[7px] transition-all border border-white/20 flex items-center gap-1 shadow-sm"
              >
                <Save className="w-2.5 h-2.5" /> INCLUIR NA COMANDA
              </button>
            )}
            <button onClick={() => setCart([])} className="bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-[7px] transition-colors border border-white/10">LIMPAR</button>
          </div>
        </div>

        <div className="p-1.5 border-b bg-slate-50/50">
          <div className="relative group">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-2.5 h-2.5 group-focus-within:text-indigo-500 transition-colors" />
            <input type="text" placeholder="Pesquisar item..." className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-7 pr-1.5 text-[8px] font-bold outline-none focus:ring-2 ring-indigo-500/20 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
        
        <div className="flex-1 p-1.5 space-y-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {cart.map(item => (
            <div key={item.id} className="flex flex-col gap-1 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
              <div className="flex gap-1 items-center">
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <Package className="w-2.5 h-2.5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase leading-tight truncate text-slate-800">{item.productName}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-0.5 text-red-500 hover:bg-red-50 rounded transition-all"><Trash2 className="w-2 h-2" /></button>
              </div>
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-50">
                <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded border border-slate-100">
                  <button onClick={() => {
                    setCart(cart.map(it => {
                      if (it.id === item.id) return { ...it, quantity: Math.max(1, it.quantity - 1) };
                      return it;
                    }));
                  }} className="p-0.5 hover:bg-white rounded transition-colors text-slate-600"><Minus className="w-2 h-2"/></button>
                  <span className="text-[8px] font-black w-2.5 text-center text-slate-900">{item.quantity}</span>
                  <button onClick={() => {
                    const product = (db?.products || []).find(p => p.id === item.productId);
                    const available = product ? calculatePotentialStock(product, db.products || []) : 0;
                    if (product?.type !== 'Serviço' && item.quantity >= available) {
                      toast.error("Estoque insuficiente!");
                      return;
                    }
                    setCart(cart.map(it => {
                      if (it.id === item.id) return { ...it, quantity: it.quantity + 1 };
                      return it;
                    }));
                  }} className="p-0.5 hover:bg-white rounded transition-colors text-slate-600"><Plus className="w-2 h-2"/></button>
                </div>
                <div className="flex items-center gap-0.5 flex-1 justify-end">
                  <span className="text-[6px] font-black text-slate-400 uppercase">R$</span>
                  <span className="text-[8px] font-black text-slate-600 pr-0.5">{Number(item.price || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12 px-4">
              <div className="p-6 bg-slate-100 rounded-full mb-4">
                <ShoppingCart className="w-16 h-16 text-slate-400" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">Carrinho Vazio</p>
              <p className="text-[10px] font-bold uppercase mt-2 text-slate-400">Adicione itens para começar</p>
            </div>
          )}
        </div>

        <div className="p-2 bg-white border-t border-slate-100 space-y-2 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest">Total</span>
            <span className="text-base font-black text-indigo-600 drop-shadow-sm">R$ {cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <PaymentBtn icon={<Banknote />} label="Dinheiro" color="emerald" onClick={() => onCheckout('Dinheiro')} disabled={cart.length === 0} />
            <PaymentBtn icon={<Smartphone />} label="PIX" color="sky" onClick={() => onCheckout('Pix')} disabled={cart.length === 0} />
            <PaymentBtn icon={<CreditCard />} label="Crédito" color="orange" onClick={() => onCheckout('Crédito')} disabled={cart.length === 0} />
            <PaymentBtn icon={<CreditCard />} label="Débito" color="violet" onClick={() => onCheckout('Débito')} disabled={cart.length === 0} />
          </div>
        </div>
      </aside>
    </div>
  );
};

const PaymentBtn = ({ icon, label, color, onClick, disabled }: any) => {
  const themes: any = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    sky: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:border-sky-300',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    violet: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 transition-all active:scale-95 shadow-sm ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : themes[color]}`}>
       <div className="mb-1">{React.cloneElement(icon, { className: 'w-4 h-4' })}</div>
       <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
    </button>
  );
};

export default POSView;