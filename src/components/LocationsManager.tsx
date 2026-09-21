"use client";

import React from 'react';
import { MapPin, Trash2, Edit3, Box, Refrigerator, LayoutGrid, Store } from 'lucide-react';
import { Database, StorageLocation } from '../types';

interface LocationsManagerProps {
  db: Database;
  setDb: (db: Database) => void;
  onAdd: () => void;
  onEdit: (loc: StorageLocation) => void;
}

const LocationsManager: React.FC<LocationsManagerProps> = ({ db, setDb, onAdd, onEdit }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Estoque': return <Box className="w-5 h-5" />;
      case 'Loja': return <Store className="w-5 h-5" />;
      case 'Refrigeração': return <Refrigerator className="w-5 h-5" />;
      default: return <LayoutGrid className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
               <MapPin className="w-6 h-6" />
            </div>
            <div>
               <h2 className="text-lg font-black uppercase tracking-tight">Locais de Armazenamento</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Endereçamento Logístico</p>
            </div>
         </div>
         <button onClick={onAdd} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">+ Novo Local</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {db.locations?.map(loc => (
          <div key={loc.id} className="bg-white p-5 rounded-[2rem] border shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 rounded-xl text-indigo-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                {getIcon(loc.type)}
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-700">{loc.name}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{loc.type}</p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(loc)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => {
                if(window.confirm('Remover este local?')) {
                  setDb({...db, locations: db.locations.filter(l => l.id !== loc.id)});
                }
              }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {(!db.locations || db.locations.length === 0) && (
          <div className="col-span-full py-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhum local cadastrado</div>
        )}
      </div>
    </div>
  );
};

export default LocationsManager;