"use client";

import React from 'react';
import { CartItem, Database } from '../types';

interface KitchenTicketProps {
  items: CartItem[];
  customerName: string;
  locationName: string;
  orderId: string;
  date: string;
  pickupTime?: string;
  db: Database;
}

const KitchenTicket: React.FC<KitchenTicketProps> = ({ 
  items, customerName, locationName, orderId, date, pickupTime, db
}) => {
  return (
    <div className="bg-white text-black text-[12px] w-[80mm] p-4 font-mono leading-tight shadow-lg border border-slate-100">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-xl font-black uppercase tracking-tighter">PEDIDO DE PRODUÇÃO</h2>
        <div className="border-b-2 border-black my-2"></div>
        <p className="text-lg font-black bg-black text-white py-1 px-2 inline-block rounded">
          {locationName.toUpperCase()}
        </p>
      </div>

      <div className="space-y-1 mb-4 border-b border-dashed border-black pb-2">
        <p className="font-black text-sm">CLIENTE: {customerName.toUpperCase()}</p>
        <p>DATA: {new Date(date).toLocaleString('pt-BR')}</p>
        <p>PEDIDO: #{orderId.slice(-6)}</p>
        {pickupTime && (
          <p className="font-black text-base mt-2 bg-slate-100 p-1 text-center border border-black">
            HORÁRIO: {pickupTime}
          </p>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between font-black border-b border-black pb-1 text-[10px]">
          <span className="w-1/6">QTD</span>
          <span className="w-5/6">ITEM / DESCRIÇÃO</span>
        </div>
        {items.map((item, idx) => {
          const product = db.products.find(p => p.id === item.productId);
          return (
            <div key={idx} className="flex gap-3 items-start">
              <span className="w-1/6 text-lg font-black border-2 border-black flex items-center justify-center rounded h-8">
                {item.quantity}
              </span>
              <div className="w-5/6">
                <p className="text-sm font-black uppercase leading-none mb-1">{item.productName}</p>
                {product?.recipe && (
                  <div className="text-[9px] opacity-70 italic">
                    {product.recipe.map((r: any) => db.products.find(p => p.id === r.productId)?.name || r.productId).join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-black pt-4 text-center">
        <p className="text-[10px] font-black uppercase">Fim do Pedido</p>
        <p className="text-[8px] mt-1">FASTSELL PRO - SISTEMA DE GESTÃO</p>
      </div>
    </div>
  );
};

export default KitchenTicket;