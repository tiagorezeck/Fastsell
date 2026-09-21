"use client";

import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, ShieldCheck, AlertCircle, ExternalLink, Save, Database as DbIcon, Sparkles, Lock, ArrowRight, Key, ToggleLeft, ToggleRight } from 'lucide-react';
import { Database } from '../types';
import { driveService } from '../services/googleDriveService';
import { toast } from 'react-hot-toast';
import { sanitizeDB, saveDB } from '../db';

interface CloudSyncManagerProps {
  db: Database;
  setDb: (db: Database) => void;
}

const CloudSyncManager: React.FC<CloudSyncManagerProps> = ({ db, setDb }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState(db.companyInfo.cloudSync?.apiKey || '');
  const [clientId, setClientId] = useState(db.companyInfo.cloudSync?.clientId || '');
  const [geminiKey, setGeminiKey] = useState(db.companyInfo.geminiApiKey || '');
  const [isSyncing, setIsSyncing] = useState(false);

  const config = db.companyInfo.cloudSync;

  const handleCheckPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessPassword === 'Admin') {
      setIsAuthenticated(true);
      toast.success("Acesso liberado!");
    } else {
      toast.error("Senha incorreta!");
    }
  };

  const handleSaveGeminiKey = () => {
    setDb({
      ...db,
      companyInfo: {
        ...db.companyInfo,
        geminiApiKey: geminiKey
      }
    });
    toast.success("Chave Gemini salva!");
  };

  const handleConnect = async () => {
    if (!apiKey || !clientId) {
      toast.error("Informe a Cloud API Key e o Client ID do Google Cloud");
      return;
    }

    setIsConnecting(true);
    try {
      await driveService.init(clientId);
      const fileId = await driveService.findOrCreateFile('fastsell_db.json');
      
      const updatedDb = {
        ...db,
        companyInfo: {
          ...db.companyInfo,
          cloudSync: {
            enabled: true,
            apiKey,
            clientId,
            fileId,
            autoSync: true,
            lastSync: new Date().toISOString()
          }
        }
      };
      
      await driveService.saveFile(fileId, updatedDb);
      setDb(updatedDb);
      toast.success("Conectado ao Google Drive com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar com Google Drive. Verifique as credenciais.");
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleAutoSync = () => {
    if (!config) return;
    const updatedDb = {
      ...db,
      companyInfo: {
        ...db.companyInfo,
        cloudSync: { ...config, autoSync: !config.autoSync }
      }
    };
    setDb(updatedDb);
    toast.success(config.autoSync ? "Auto-sincronização desativada" : "Auto-sincronização ativada");
  };

  const handleSyncNow = async (direction: 'upload' | 'download') => {
    if (!config?.fileId) return;
    
    setIsSyncing(true);
    try {
      if (direction === 'upload') {
        await driveService.saveFile(config.fileId, db);
        setDb({
          ...db,
          companyInfo: {
            ...db.companyInfo,
            cloudSync: { ...config, lastSync: new Date().toISOString() }
          }
        });
        toast.success("Dados enviados para a nuvem!");
      } else {
        const cloudData = await driveService.loadFile(config.fileId);
        const sanitized = sanitizeDB(cloudData);
        const finalDb = {
          ...sanitized,
          companyInfo: {
            ...sanitized.companyInfo,
            cloudSync: { ...config, lastSync: new Date().toISOString() }
          }
        };
        saveDB(finalDb);
        setDb(finalDb);
        toast.success("Dados baixados da nuvem e restaurados com sucesso!");
      }
    } catch (err) {
      toast.error("Erro na sincronização.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-8 rounded-[3rem] border shadow-xl space-y-6 text-center">
          <div className="p-4 bg-indigo-50 rounded-3xl w-fit mx-auto text-indigo-600">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Configurações de Nuvem</h2>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Área Restrita - Digite a Senha</p>
          </div>
          <form onSubmit={handleCheckPassword} className="space-y-4">
            <input 
              autoFocus
              type="password" 
              className="w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl text-center font-black outline-none focus:border-indigo-500 transition-all"
              placeholder="••••••••"
              value={accessPassword}
              onChange={e => setAccessPassword(e.target.value)}
            />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              Acessar Painel <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Google Gemini API Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Inteligência Artificial (Google Gemini)</h2>
            <p className="text-xs text-slate-400 font-bold">Auxílio em scanner, cadastros e automações</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Gemini API Key</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="password" 
                className="w-full border-2 border-slate-50 bg-slate-50 p-4 pl-12 rounded-2xl text-xs font-mono outline-none focus:bg-white focus:border-amber-500 transition-all"
                placeholder="Cole sua chave da API aqui..."
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={handleSaveGeminiKey}
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar Chave Gemini
          </button>
          <p className="text-[9px] font-bold text-slate-400 uppercase text-center">
            Obtenha sua chave gratuita em <a href="https://aistudio.google.com/" target="_blank" className="text-indigo-600 underline">Google AI Studio</a>
          </p>
        </div>
      </div>

      {/* Google Drive Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${config?.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {config?.enabled ? <Cloud className="w-6 h-6" /> : <CloudOff className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Banco de Dados Online (Google Drive)</h2>
            <p className="text-xs text-slate-400 font-bold">Sincronize seus dados entre múltiplos dispositivos</p>
          </div>
        </div>

        {!config?.enabled ? (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-indigo-800">Como configurar:</p>
                  <ol className="text-[10px] font-bold text-indigo-700 space-y-1 list-decimal ml-4">
                    <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" className="underline flex inline-items gap-1">Google Cloud Console <ExternalLink className="w-2 h-2" /></a></li>
                    <li>Crie um projeto e habilite a "Google Drive API"</li>
                    <li>Em "Tela de consentimento OAuth", configure como Externo</li>
                    <li>Em "Credenciais", crie uma "Chave de API" e um "ID do cliente OAuth"</li>
                    <li>Adicione a URL do sistema em "Origens JavaScript autorizadas"</li>
                    <li>Cole a API Key e o Client ID abaixo</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cloud API Key</label>
                <input 
                  className="w-full border p-4 rounded-2xl text-xs font-mono bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Google Client ID</label>
                <input 
                  className="w-full border p-4 rounded-2xl text-xs font-mono bg-slate-50 outline-none focus:ring-2 ring-indigo-500/20"
                  placeholder="000000000000-xxxxxxxxxxxx.apps.googleusercontent.com"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isConnecting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Ativar Sincronização em Nuvem
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status da Conexão</p>
                <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Conectado e Ativo</span>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Última Sincronização</p>
                <div className="flex items-center gap-2 text-slate-600">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-black uppercase">
                    {config.lastSync ? new Date(config.lastSync).toLocaleString('pt-BR') : 'Nunca'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
              <div>
                <p className="text-xs font-black uppercase text-indigo-900">Auto-Sincronização</p>
                <p className="text-[9px] font-bold text-indigo-400 uppercase">Salvar dados na nuvem automaticamente ao alterar</p>
              </div>
              <button 
                onClick={toggleAutoSync}
                className={`p-2 rounded-xl transition-all ${config.autoSync ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-400'}`}
              >
                {config.autoSync ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => handleSyncNow('upload')}
                disabled={isSyncing}
                className="p-6 bg-white border-2 border-indigo-100 rounded-[2rem] text-center hover:bg-indigo-50 transition-all group"
              >
                <Save className="w-8 h-8 mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase tracking-widest">Enviar para Nuvem</p>
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Substitui o arquivo no Drive</p>
              </button>
              <button 
                onClick={() => handleSyncNow('download')}
                disabled={isSyncing}
                className="p-6 bg-white border-2 border-emerald-100 rounded-[2rem] text-center hover:bg-emerald-50 transition-all group"
              >
                <DbIcon className="w-8 h-8 mx-auto mb-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase tracking-widest">Baixar da Nuvem</p>
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Atualiza este dispositivo</p>
              </button>
            </div>

            <button 
              onClick={() => setDb({ ...db, companyInfo: { ...db.companyInfo, cloudSync: undefined } })}
              className="w-full py-4 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
            >
              Desconectar Google Drive
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudSyncManager;