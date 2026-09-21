"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, User } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  subtext?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  label: string;
  emptyMessage?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  options, value, onChange, placeholder, label, emptyMessage = "Nenhum resultado" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.subtext && opt.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 10); // Limitamos a 10 resultados para performance

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-100 border-2 transition-all cursor-pointer p-3 rounded-2xl flex items-center justify-between ${isOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-transparent hover:bg-slate-200'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <User className={`w-3.5 h-3.5 ${selectedOption ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className={`text-xs font-bold truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input 
                autoFocus
                type="text" 
                className="w-full bg-white border-none rounded-xl py-2 pl-9 pr-3 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20"
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`p-3 hover:bg-indigo-50 cursor-pointer transition-colors flex flex-col ${value === opt.id ? 'bg-indigo-50/50' : ''}`}
                >
                  <span className={`text-xs font-black uppercase ${value === opt.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {opt.name}
                  </span>
                  {opt.subtext && (
                    <span className="text-[9px] font-bold text-slate-400">{opt.subtext}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;