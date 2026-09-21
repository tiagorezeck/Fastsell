"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Camera, Search, Barcode, XCircle, RefreshCw, AlertCircle, Plus, ZoomIn, Loader2, Globe } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../types';
import { COLORS } from '../constants';
import { playBeep } from '../utils/audio';
import { ExternalLookupService, ExternalProductInfo } from '../services/externalLookupService';

interface ScannerProps {
  products: Product[];
  onScan: (sku: string, autoData?: ExternalProductInfo | null) => void;
  onManualRegister: () => void;
  onClose: () => void;
}

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.ITF,
];

const Scanner: React.FC<ScannerProps> = ({ products, onScan, onManualRegister, onClose }) => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomValue, setZoomValue] = useState(1);
  const [hasZoom, setHasZoom] = useState(false);
  const [zoomRange, setZoomRange] = useState({ min: 1, max: 1, step: 0.1 });
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const lookupService = useMemo(() => new ExternalLookupService(), []);

  const handleDecodedText = async (decodedText: string) => {
    playBeep();
    stopScanner();
    
    const existing = products.find(p => p.barcode === decodedText);
    if (existing) {
        onScan(decodedText);
        return;
    }

    setIsLoading(true);
    const autoData = await lookupService.lookup(decodedText);
    setIsLoading(false);
    
    onScan(decodedText, autoData);
  };

  const startScanner = async () => {
    setIsScanning(true);
    setError(null);
    
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" }, 
          { 
            fps: 20,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.0
          },
          handleDecodedText,
          () => {}
        );

        const track = html5QrCode.getRunningTrackCapabilities();
        if (track && (track as any).zoom) {
            const zoomCap = (track as any).zoom;
            setHasZoom(true);
            setZoomRange({ min: zoomCap.min || 1, max: zoomCap.max || 5, step: zoomCap.step || 0.1 });
            setZoomValue(zoomCap.min || 1);
        }
      } catch (err: any) {
        setError("Erro de câmera. Verifique as permissões.");
        setIsScanning(false);
      }
    }, 200);
  };

  const handleTapToFocus = async () => {
    if (!scannerRef.current || !isScanning) return;
    try {
        await scannerRef.current.applyVideoConstraints({
            advanced: [{ focusMode: "continuous" } as any]
        });
    } catch (err) {}
  };

  const handleZoomChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setZoomValue(value);
      if (scannerRef.current) {
          try { await scannerRef.current.applyVideoConstraints({ advanced: [{ zoom: value } as any] }); } catch (err) {}
      }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current = null; } catch (err) {}
    }
    setIsScanning(false);
    setHasZoom(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg text-white shadow-md shadow-blue-100" style={{ backgroundColor: COLORS.PRIMARY }}>
              <Barcode size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Leitor de Código</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">EAN-13 / ISBN / CODE-128</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isScanning && (
              <button onClick={stopScanner} className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                Parar
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
          </div>
        </div>

        <button 
          onClick={onManualRegister} 
          className="w-full py-3 bg-green-50 text-green-700 font-black rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center gap-2 hover:bg-green-100 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
          CADASTRO MANUAL
        </button>
        
        {isLoading ? (
          <div className="aspect-video bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-blue-100 animate-pulse">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-xs font-bold text-blue-700 uppercase">Buscando em Cascata...</p>
          </div>
        ) : !isScanning ? (
          <div onClick={startScanner} className="relative group overflow-hidden rounded-2xl aspect-video bg-gray-900 flex items-center justify-center border-4 border-dashed border-gray-200 hover:border-blue-500 cursor-pointer transition-all">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="z-10 text-center">
              <Barcode className="mx-auto mb-3 text-white/50 group-hover:text-blue-400 transition-colors" size={40} />
              <p className="text-sm font-black text-white uppercase tracking-widest">Escanear Produto</p>
              <p className="text-[10px] text-white/60 mt-1">Identificação por Código de Barras</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-4 border-blue-500 shadow-2xl" onClick={handleTapToFocus}>
              <div id="reader" className="w-full h-full"></div>
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[280px] h-[160px] border-2 border-white/30 rounded-xl relative">
                  <div className="absolute inset-x-0 h-0.5 bg-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_infinite]" />
                </div>
              </div>
            </div>

            {hasZoom && (
                <div className="px-2 py-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1"><ZoomIn size={12} /> Zoom</span>
                        <span className="text-[10px] font-bold text-blue-600">{zoomValue.toFixed(1)}x</span>
                    </div>
                    <input type="range" min={zoomRange.min} max={zoomRange.max} step={zoomRange.step} value={zoomValue} onChange={handleZoomChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
            )}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); if (manualInput.trim()) handleDecodedText(manualInput.trim()); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              ref={inputRef} 
              type="text" 
              value={manualInput} 
              onChange={(e) => setManualInput(e.target.value)} 
              placeholder="Digite SKU ou GTIN..." 
              className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase outline-none" 
            />
            <button 
              type="button"
              onClick={() => manualInput.trim() && handleDecodedText(manualInput.trim())}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              title="Pesquisar Produto"
            >
              <Globe size={16} />
            </button>
          </div>
          <button type="submit" className="px-6 py-3 text-white font-black rounded-xl hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100 transition-all" style={{ backgroundColor: COLORS.PRIMARY }}>OK</button>
        </form>
      </div>
    </div>
  );
};

export default Scanner;