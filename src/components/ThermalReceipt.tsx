import React from 'react';
import { Sale, CompanyInfo } from '../types';

interface ThermalReceiptProps {
  sale: Sale;
  company: CompanyInfo;
}

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ sale, company }) => {
  return (
    <div className="bg-white text-black text-[10px] w-[80mm] p-4 font-mono leading-tight shadow-lg border border-slate-100">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-lg font-bold uppercase tracking-tight">{company.name}</h2>
        <p className="text-[8px]">CNPJ: {company.cnpj}</p>
        <div className="border-b border-dashed border-black my-2"></div>
        <p className="font-bold">COMPROVANTE DE VENDA</p>
        <div className="border-b border-dashed border-black my-2"></div>
      </div>

      <div className="space-y-0.5 mb-2 text-[9px]">
        <p>Data: {new Date(sale.date).toLocaleString('pt-BR')}</p>
        <p>ID: #{sale.id.slice(-8)}</p>
        <p>Entrega: {sale.deliveryType.toUpperCase()}</p>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      <div className="space-y-2 mb-2">
        <div className="flex justify-between font-bold border-b border-black pb-1">
          <span className="w-1/2">ITEM</span>
          <span className="w-1/4 text-center">QTD</span>
          <span className="w-1/4 text-right">VALOR</span>
        </div>
        {sale.items.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="w-1/2 uppercase font-bold truncate">{item.productName}</span>
            <span className="w-1/4 text-center">{item.quantity}</span>
            <span className="w-1/4 text-right">{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      <div className="space-y-1 text-right text-[9px]">
        <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>R$ {sale.subtotal.toFixed(2)}</span>
        </div>
        {sale.discount && (
          <div className="flex justify-between text-red-600">
              <span>DESCONTO:</span>
              <span>- R$ {sale.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-xs font-black pt-1 border-t border-black mt-1">
            <span>TOTAL FINAL:</span>
            <span>R$ {sale.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>
      
      <div className="space-y-1">
        <p className="font-bold text-[8px] uppercase mb-1">Formas de Pagamento:</p>
        {sale.payments.map((p, idx) => (
          <div key={idx} className="flex justify-between text-[9px]">
            <span className="uppercase">{p.method}</span>
            <span>R$ {p.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black my-4"></div>

      <div className="text-center space-y-1">
        <p className="font-bold uppercase text-[8px]">Agradecemos a Preferência!</p>
        <p className="text-[7px]">{company.address}</p>
        <p className="text-[7px]">CONTATO: {company.phone}</p>
      </div>
    </div>
  );
};

export default ThermalReceipt;