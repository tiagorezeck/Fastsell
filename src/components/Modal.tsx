import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  isDarkMode = false,
  maxWidth = 'max-w-lg'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 lg:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-100'} rounded-2xl lg:rounded-3xl w-full ${maxWidth} shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border`}>
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-100/10">
          <h2 className="text-lg lg:text-xl font-black text-indigo-600">{title}</h2>
          <button onClick={onClose} className={`p-2 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-xl transition-colors`}>
            <X className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400" />
          </button>
        </div>
        <div className="p-4 lg:p-6 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;