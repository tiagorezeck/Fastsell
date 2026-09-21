"use client";

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface WebImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialQuery: string;
}

const WebImagePicker: React.FC<WebImagePickerProps> = ({ isOpen, onClose, onSelect, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchImages = async (searchQuery: string) => {
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    setImages([]);

    try {
      // Usando a API do Lexica que é pública e retorna imagens de alta qualidade
      const response = await fetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) throw new Error("Falha na conexão");
      
      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        // Filtramos apenas as URLs válidas
        const urls = data.images.map((img: any) => img.src).filter((url: string) => url.startsWith('http'));
        setImages(urls);
      } else {
        setError("Nenhuma imagem encontrada para este termo.");
      }
    } catch (err) {
      console.error("Erro na busca:", err);
      setError("Erro ao buscar imagens. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      searchImages(initialQuery);
    }
  }, [isOpen, initialQuery]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seletor de Imagens Web" maxWidth="max-w-4xl">
      <div className="space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              className="w-full border bg-slate-50 p-3 pl-10 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-indigo-500/20"
              placeholder="O que você deseja buscar?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchImages(query)}
            />
          </div>
          <button 
            onClick={() => searchImages(query)}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Buscando as melhores imagens...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <p className="text-xs font-bold text-slate-500 uppercase">{error}</p>
              <button onClick={() => searchImages(query)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Tentar Novamente</button>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((url, idx) => (
                <button 
                  key={idx}
                  onClick={() => onSelect(url)}
                  className="aspect-square rounded-3xl overflow-hidden border-4 border-transparent hover:border-indigo-600 transition-all group relative bg-slate-50 shadow-sm hover:shadow-xl"
                >
                  <img 
                    src={url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={`Resultado ${idx}`}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')} 
                  />
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-all flex items-center justify-center">
                    <div className="bg-white p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all">
                      <Check className="w-5 h-5 text-indigo-600" strokeWidth={3} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center opacity-30">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-xs font-black uppercase tracking-widest">Nenhuma imagem encontrada</p>
              <p className="text-[9px] font-bold uppercase mt-2">Tente pesquisar por outro nome</p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
          <p className="text-[9px] font-bold text-indigo-100 uppercase leading-relaxed text-center">
            Clique na imagem que você deseja usar. O sistema salvará o link automaticamente no produto.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WebImagePicker;