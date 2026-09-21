"use client";

import React, { useState } from 'react';
import { Info, CheckCircle2, MousePointer2, X, Square, CheckSquare } from 'lucide-react';
import Modal from './Modal';

interface WebSearchInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
}

const WebSearchInstructionsModal: React.FC<WebSearchInstructionsModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Como Adicionar Imagens" maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-xs font-black uppercase text-indigo-800 tracking-tight">Siga estes passos:</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0 shadow-sm">1</div>
              <p className="text-[10px] font-bold text-indigo-700 uppercase leading-relaxed">
                Ao abrir o Google, clique na imagem que deseja usar.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0 shadow-sm">2</div>
              <p className="text-[10px] font-bold text-indigo-700 uppercase leading-relaxed">
                Clique com o <span className="text-slate-900">botão direito</span> sobre a imagem aberta.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0 shadow-sm">3</div>
              <p className="text-[10px] font-bold text-indigo-700 uppercase leading-relaxed">
                Escolha a opção <span className="text-indigo-600 font-black">"Copiar endereço da imagem"</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0 shadow-sm">4</div>
              <p className="text-[10px] font-bold text-indigo-700 uppercase leading-relaxed">
                Volte ao sistema e <span className="text-slate-900">cole (Ctrl+V)</span> no campo de URL.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setDontShowAgain(!dontShowAgain)}
            className="flex items-center gap-3 px-2 group transition-all"
          >
            <div className={`p-1 rounded-lg transition-all ${dontShowAgain ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
              {dontShowAgain ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-600">Não mostrar essa mensagem novamente</span>
          </button>

          <button 
            onClick={() => onConfirm(dontShowAgain)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Entendi, Abrir Busca
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WebSearchInstructionsModal;