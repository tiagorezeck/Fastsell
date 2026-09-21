"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Banknote, Package, Users, UserCheck, Truck, 
  ClipboardList, ShoppingBag, TrendingDown, History, BarChart3, Settings, X, Sun, Moon, Zap,
  ChevronDown, ChevronLeft, ChevronRight, Menu, ChefHat, FileText, Search, Wrench, Printer, Share2, FileDown, LayoutGrid, Save, Utensils, UserPlus, QrCode, Minus, Plus, CheckCircle2, Shield, ArrowRightLeft, RefreshCw, Cake, MapPin, BellRing, Barcode, Cloud, Boxes, Wallet, Calendar, Maximize, Minimize
} from 'lucide-react';
import { TableWithChairs } from './components/CustomIcons';
import { Toaster, toast } from 'react-hot-toast';
import { Database, Product, CartItem, Sale, StockMovement, Payment, Table, Comanda, Customer, Category, User, Supplier, Account, CashierMovement, CreditTransaction, Expense, StockBatch, StorageLocation } from './types';
import { loadDB, saveDB } from './db';
import { driveService } from './services/googleDriveService';
import Modal from './components/Modal';
import ThermalReceipt from './components/ThermalReceipt';
import DashboardView from './components/DashboardView';
import ProductsManager from './components/ProductsManager';
import ServicesManager from './components/ServicesManager';
import CustomersManager from './components/CustomersManager';
import UsersManager from './components/UsersManager';
import SuppliersManager from './components/SuppliersManager';
import ExpensesManager from './components/ExpensesManager';
import SalesHistoryView from './components/SalesHistoryView';
import ChartOfAccountsManager from './components/ChartOfAccountsManager';
import PurchasesManager from './components/PurchasesManager';
import SettingsView from './components/SettingsView';
import POSView from './components/POSView';
import RegistrationForm from './components/RegistrationForm';
import CheckoutModal from './components/CheckoutModal';
import DirectSaleModal from './components/DirectSaleModal';
import StockHistoryView from './components/StockHistoryView';
import CategoriesManager from './components/CategoriesManager';
import Sidebar from './components/Sidebar';
import CashierManager from './components/CashierManager';
import CashFlowView from './components/CashFlowView';
import BanksManager from './components/BanksManager';
import CostCentersManager from './components/CostCentersManager';
import CompaniesManager from './components/CompaniesManager';
import ProductionManager from './components/ProductionManager';
import WaiterMonitor from './components/WaiterMonitor';
import FinancialReportsView from './components/FinancialReportsView';
import SalesReportsView from './components/SalesReportsView';
import GoalsManager from './components/GoalsManager';
import TablesManager from './components/TablesManager';
import CreditManager from './components/CreditManager';
import BankReconciliation from './components/BankReconciliation';
import BirthdayList from './components/BirthdayList';
import LocationsManager from './components/LocationsManager';
import ProductionCatalogManager from './components/ProductionCatalogManager';
import Scanner from './components/Scanner';
import SearchableSelect from './components/SearchableSelect';
import { differenceInDays, parseISO, addYears } from 'date-fns';
import { deductFIFO } from './utils/stock';

const App: React.FC = () => {
  const [db, setDb] = useState<Database>(loadDB());
  const [activeTab, setActiveTab] = useState<'PDV' | 'Dashboard' | 'Caixa' | 'Metas' | 'Produtos' | 'Serviços' | 'Categorias' | 'Clientes' | 'Usuários' | 'Fornecedores' | 'Vendas' | 'Compras' | 'Estoque' | 'Despesas' | 'RelatorioFinanceiro' | 'RelatorioVendas' | 'PlanoDeContas' | 'Configurações' | 'Bancos' | 'CentrosDeCusto' | 'Empresas' | 'Produção' | 'Atendimento' | 'Mesas' | 'Fidelidade' | 'Empresa' | 'ConfigPDV' | 'Modulos' | 'Dados' | 'Crediário' | 'Conciliação' | 'Aniversariantes' | 'Locais' | 'ItensProduzidos' | 'Nuvem'>('PDV');
  const [forcedSubTab, setForcedSubTab] = useState<string | undefined>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [periodType, setPeriodType] = useState<'Hoje' | 'Semana' | 'Mês' | 'Trimestre' | 'Ano' | 'Personalizado'>('Hoje');
  const [pivotDate, setPivotDate] = useState(new Date());
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ numComandas: 1, isCustomer: true, sellerId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [comandaStep, setComandaStep] = useState(0);
  const [tempComandas, setTempComandas] = useState<any[]>([]);
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isDirectSaleModalOpen, setIsDirectSaleModalOpen] = useState(false);
  const [preSelectedPaymentMethod, setPreSelectedPaymentMethod] = useState<Payment['method']>('Dinheiro');
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [activeComanda, setActiveComanda] = useState<Comanda | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
      toast.error("Não foi possível alternar tela cheia.");
    }
  };

  const [purchaseDraft, setPurchaseDraft] = useState<{ items: any[], supplierId?: string } | null>(null);

  const todayBirthdays = useMemo(() => {
    if (!db?.companyInfo?.enabledModules?.includes('Aniversariantes')) return [];
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
    return (db.customers || []).filter(c => {
      if (!c.birthDate) return false;
      const [y, m, d] = c.birthDate.split('-');
      return `${d}/${m}` === todayStr;
    });
  }, [db.customers, db?.companyInfo?.enabledModules]);

  // Garantir que o Balcão exista
  useEffect(() => {
    const tables = db.tables || [];
    if (!tables.find(t => t.id === 'balcao')) {
      setDb({
        ...db,
        tables: [{ id: 'balcao', number: 'Balcão', comandas: [] }, ...tables]
      });
    }
  }, []);

  // Inicialização do Google Drive se habilitado
  useEffect(() => {
    const cloud = db?.companyInfo?.cloudSync;
    if (cloud?.enabled && cloud.clientId) {
      driveService.init(cloud.clientId).catch(() => {
        toast.error("Falha ao inicializar Google Drive. Verifique o Client ID.");
      });
    }
  }, []);

  // Auto-save para nuvem
  useEffect(() => {
    saveDB(db);
    const cloud = db?.companyInfo?.cloudSync;
    if (cloud?.enabled && cloud.autoSync && cloud.fileId) {
      driveService.saveFile(cloud.fileId, db).catch(() => {
        console.warn("Falha no auto-sync com a nuvem.");
      });
    }
  }, [db]);

  useEffect(() => {
    const today = new Date();
    let updated = false;
    const newExpenses: Expense[] = [...(db.expenses || [])];
    const newTransactions = [...(db.creditTransactions || [])];
    
    const rules = db?.companyInfo?.creditRules || { alertDays: 30, blockDays: 45, banDays: 60 };

    const newCustomers = (db.customers || []).map(c => {
      if (!c.creditEnabled || c.currentDebt <= 0) return c;
      const lastPurchase = c.lastCreditPurchase ? parseISO(c.lastCreditPurchase) : today;
      const daysPast = differenceInDays(today, lastPurchase);
      let newStatus = c.creditStatus;
      let banUntil = c.banUntil;

      if (daysPast >= rules.banDays) {
        newStatus = 'Banido';
        banUntil = addYears(today, 1).toISOString();
        const pendingTrans = newTransactions.filter(t => t.customerId === c.id && t.type === 'Compra' && !t.sentToBadDebt);
        if (pendingTrans.length > 0) {
          const totalToBadDebt = pendingTrans.reduce((a, b) => a + b.amount, 0);
          const badDebtAccount = (db.accounts || []).find(a => a.code === '4.10.5');
          if (badDebtAccount) {
            newExpenses.push({ id: `EXP-BAD-${Date.now()}`, description: `Inadimplência Automática - ${c.name}`, amount: totalToBadDebt, date: today.toISOString(), accountId: badDebtAccount.id });
            pendingTrans.forEach(t => t.sentToBadDebt = true);
            updated = true;
          }
        }
      } else if (daysPast >= rules.blockDays) { newStatus = 'Bloqueado'; updated = true; }
      else if (daysPast >= rules.alertDays) { newStatus = 'Alerta'; updated = true; }
      
      if (newStatus !== c.creditStatus) { updated = true; return { ...c, creditStatus: newStatus, banUntil }; }
      return c;
    });
    if (updated) setDb({ ...db, customers: newCustomers, expenses: newExpenses, creditTransactions: newTransactions });
  }, []);

  useEffect(() => {
    if (periodType === 'Personalizado') return;
    let start = new Date(pivotDate);
    let end = new Date(pivotDate);
    switch (periodType) {
      case 'Hoje': break;
      case 'Semana': start.setDate(start.getDate() - start.getDay()); end.setDate(start.getDate() + 6); break;
      case 'Mês': start = new Date(start.getFullYear(), start.getMonth(), 1); end = new Date(start.getFullYear(), start.getMonth() + 1, 0); break;
      case 'Trimestre': const q = Math.floor(start.getMonth() / 3); start = new Date(start.getFullYear(), q * 3, 1); end = new Date(start.getFullYear(), (q + 1) * 3, 0); break;
      case 'Ano': start = new Date(start.getFullYear(), 0, 1); end = new Date(start.getFullYear(), 11, 31); break;
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [periodType, pivotDate]);

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({ numComandas: 1, isCustomer: true, sellerId: '' });
    setComandaStep(0);
    setTempComandas([]);
  };

  const handleSaveRecord = () => {
    if (formData.type === 'Produzido' && (!formData.recipe || formData.recipe.length === 0)) {
      toast.error("Não é possível finalizar cadastro de fabricação sem ficha técnica!");
      return;
    }

    const id = editingId || `ID${Date.now()}`;
    let newRecord = { ...formData, id };
    let updatedDb = { ...db };

    if ((activeTab === 'Produtos') && !editingId && formData.type !== 'Serviço' && formData.stock > 0) {
      const initialBatch: StockBatch = {
        id: `B${Date.now()}`,
        batchNumber: formData.batch || 'INICIAL',
        entryDate: formData.entryDate || new Date().toISOString(),
        expirationDate: formData.expirationDate,
        quantity: formData.stock,
        costPrice: formData.costPrice || 0
      };
      newRecord.batches = [initialBatch];
    } else if (activeTab === 'Produtos' && !newRecord.batches) {
      newRecord.batches = [];
    }

    switch (activeTab) {
      case 'Produtos':
      case 'ItensProduzidos':
      case 'Serviços': updatedDb.products = editingId ? (db.products || []).map(p => p.id === editingId ? newRecord : p) : [...(db.products || []), newRecord]; break;
      case 'Categorias': updatedDb.categories = editingId ? (db.categories || []).map(c => c.id === editingId ? newRecord : c) : [...(db.categories || []), newRecord]; break;
      case 'Clientes': updatedDb.customers = editingId ? (db.customers || []).map(c => c.id === editingId ? newRecord : c) : [...(db.customers || []), newRecord]; break;
      case 'Usuários': updatedDb.users = editingId ? (db.users || []).map(u => u.id === editingId ? newRecord : u) : [...(db.users || []), newRecord]; break;
      case 'Fornecedores': updatedDb.suppliers = editingId ? (db.suppliers || []).map(s => s.id === editingId ? newRecord : s) : [...(db.suppliers || []), newRecord]; break;
      case 'Despesas': updatedDb.expenses = editingId ? (db.expenses || []).map(e => e.id === editingId ? newRecord : e) : [...(db.expenses || []), newRecord]; break;
      case 'Locais': updatedDb.locations = editingId ? (db.locations || []).map(l => l.id === editingId ? newRecord : l) : [...(db.locations || []), newRecord]; break;
      case 'PlanoDeContas':
        if (editingId) {
          const oldAccount = (db.accounts || []).find(a => a.id === editingId);
          if (oldAccount && oldAccount.code !== newRecord.code) {
            updatedDb.accounts = (db.accounts || []).map(a => {
              if (a.id === editingId) return newRecord;
              if (a.parentCode === oldAccount.code) return { ...a, parentCode: newRecord.code };
              return a;
            });
          } else { updatedDb.accounts = (db.accounts || []).map(a => a.id === editingId ? newRecord : a); }
        } else { updatedDb.accounts = [...(db.accounts || []), newRecord]; }
        break;
      case 'Bancos': updatedDb.banks = editingId ? (db.banks || []).map(b => b.id === editingId ? newRecord : b) : [...(db.banks || []), newRecord]; break;
      case 'CentrosDeCusto': updatedDb.costCenters = editingId ? (db.costCenters || []).map(cc => cc.id === editingId ? newRecord : cc) : [...(db.costCenters || []), newRecord]; break;
      case 'Empresas': updatedDb.companies = editingId ? (db.companies || []).map(c => c.id === editingId ? newRecord : c) : [...(db.companies || []), newRecord]; break;
    }
    setDb(updatedDb);
    handleCloseAddModal();
    toast.success("Registro salvo com sucesso!");
  };

  const handleScannerResult = (barcode: string, autoData?: any) => {
    setIsScannerOpen(false);
    const existing = (db.products || []).find(p => p.barcode === barcode);
    if (existing) {
      if (activeTab === 'PDV') {
        const inCart = cart.find(item => item.productId === existing.id);
        if (inCart) { setCart(cart.map(item => item.productId === existing.id ? { ...item, quantity: item.quantity + 1 } : item)); }
        else { setCart([...cart, { id: Date.now().toString(), productId: existing.id, productName: existing.name, quantity: 1, price: existing.price }]); }
        toast.success(`${existing.name} adicionado ao carrinho!`);
      } else {
        setFormData(existing);
        setEditingId(existing.id);
        if (existing.type === 'Produzido') setActiveTab('ItensProduzidos');
        else setActiveTab('Produtos');
        setIsAddModalOpen(true);
        toast.success(`Produto encontrado: ${existing.name}`);
      }
    } else {
      const newProdData = { barcode, name: autoData?.name || '', category: autoData?.category || '', imageUrl: autoData?.imageUrl || '', type: 'Revenda', price: 0, costPrice: 0, stock: 0, minStock: 0, batches: [] };
      setFormData(newProdData);
      setActiveTab('Produtos');
      setIsAddModalOpen(true);
      toast.success(autoData ? "Produto identificado automaticamente!" : "Novo código detectado.");
    }
  };

  const applyStockDeduction = (items: CartItem[], currentDb: Database): Database => {
    let updatedProducts = [...(currentDb.products || [])];
    let newMovements: StockMovement[] = [];
    let totalCMV = 0;
    const saleTimestamp = Date.now().toString().slice(-6);

    items.forEach(item => {
      const product = updatedProducts.find(p => p.id === item.productId);
      if (!product || product.type === 'Serviço') return;

      if (product.type === 'Revenda' || product.type === 'Insumo') {
        const { updatedBatches, deductedQuantity } = deductFIFO(product.batches || [], item.quantity);
        
        const costOfDeducted = (product.batches || [])
          .filter(b => !updatedBatches.find(ub => ub.id === b.id) || updatedBatches.find(ub => ub.id === b.id)!.quantity < b.quantity)
          .reduce((acc, b) => {
            const ub = updatedBatches.find(x => x.id === b.id);
            const qtyTaken = b.quantity - (ub?.quantity || 0);
            return acc + (qtyTaken * b.costPrice);
          }, 0);
        
        totalCMV += costOfDeducted;

        newMovements.push({
          id: `M${Date.now()}-${product.id}`,
          productId: product.id,
          direction: 'Saída',
          natureId: 'nat_venda',
          quantity: deductedQuantity,
          reason: `Venda #${saleTimestamp}`,
          date: new Date().toISOString()
        } as any);

        updatedProducts = updatedProducts.map(p => {
          if (p.id === product.id) {
            return { ...p, batches: updatedBatches, stock: updatedBatches.reduce((acc, b) => acc + b.quantity, 0) };
          }
          return p;
        });
      } else if (product.type === 'Produzido') {
        // Produto Fabricado / Produzido
        let remainingNeeded = item.quantity;
        let deductedFromDirectBatches = 0;

        // Se já tiver lotes produzidos em estoque, consome primeiro via FIFO
        if (product.batches && product.batches.length > 0) {
          const { updatedBatches, deductedQuantity } = deductFIFO(product.batches, item.quantity);
          deductedFromDirectBatches = deductedQuantity;
          remainingNeeded = Math.max(0, item.quantity - deductedQuantity);

          const costOfDeducted = product.batches
            .filter(b => !updatedBatches.find(ub => ub.id === b.id) || updatedBatches.find(ub => ub.id === b.id)!.quantity < b.quantity)
            .reduce((acc, b) => {
              const ub = updatedBatches.find(x => x.id === b.id);
              const qtyTaken = b.quantity - (ub?.quantity || 0);
              return acc + (qtyTaken * b.costPrice);
            }, 0);

          totalCMV += costOfDeducted;

          updatedProducts = updatedProducts.map(p => {
            if (p.id === product.id) {
              return { ...p, batches: updatedBatches, stock: updatedBatches.reduce((acc, b) => acc + b.quantity, 0) };
            }
            return p;
          });
        }

        // Se ainda faltar quantidade e tiver ficha técnica (receita), desconta os insumos correspondentes
        if (remainingNeeded > 0 && product.recipe && product.recipe.length > 0) {
          product.recipe.forEach(recipeItem => {
            const ingredient = updatedProducts.find(p => p.id === recipeItem.productId);
            if (ingredient) {
              const totalIngredientNeeded = (recipeItem.netQuantity || 1) * remainingNeeded;
              const { updatedBatches: ingUpdatedBatches, deductedQuantity: ingDeducted } = deductFIFO(ingredient.batches || [], totalIngredientNeeded);

              const ingCost = (ingredient.batches || [])
                .filter(b => !ingUpdatedBatches.find(ub => ub.id === b.id) || ingUpdatedBatches.find(ub => ub.id === b.id)!.quantity < b.quantity)
                .reduce((acc, b) => {
                  const ub = ingUpdatedBatches.find(x => x.id === b.id);
                  const qtyTaken = b.quantity - (ub?.quantity || 0);
                  return acc + (qtyTaken * b.costPrice);
                }, 0);

              totalCMV += ingCost;

              newMovements.push({
                id: `M${Date.now()}-${ingredient.id}`,
                productId: ingredient.id,
                direction: 'Saída',
                natureId: 'nat_consumo',
                quantity: ingDeducted,
                reason: `Consumo p/ ${product.name} (Venda #${saleTimestamp})`,
                date: new Date().toISOString()
              } as any);

              updatedProducts = updatedProducts.map(p => {
                if (p.id === ingredient.id) {
                  return { ...p, batches: ingUpdatedBatches, stock: ingUpdatedBatches.reduce((acc, b) => acc + b.quantity, 0) };
                }
                return p;
              });
            }
          });
        }

        newMovements.push({
          id: `M${Date.now()}-${product.id}`,
          productId: product.id,
          direction: 'Saída',
          natureId: 'nat_venda',
          quantity: item.quantity,
          reason: `Venda #${saleTimestamp}`,
          date: new Date().toISOString()
        } as any);
      }
    });

    let updatedDb = { ...currentDb, products: updatedProducts, stockMovements: [...(currentDb.stockMovements || []), ...newMovements] };

    if (totalCMV > 0) {
      const cmvAccount = (currentDb.accounts || []).find(a => a.code === '3.2');
      updatedDb.expenses.push({
        id: `CMV-SALE-${Date.now()}`,
        description: `CMV: Venda de Mercadorias`,
        amount: totalCMV,
        date: new Date().toISOString(),
        accountId: cmvAccount?.id || '3.2'
      });
    }

    return updatedDb;
  };

  const finalizeSale = (payments: Payment[], comandaIds: string[], discount: number = 0) => {
    const activeSession = (db.cashierSessions || []).find(s => s.status === 'Aberto');
    if (!activeSession) {
      toast.error("Abra o caixa antes de finalizar a venda!");
      setActiveTab('Caixa');
      return;
    }
    
    const saleId = `S${Date.now()}`;
    const total = payments.reduce((a, b) => a + b.amount, 0);
    const allItems: CartItem[] = [];
    comandaIds.forEach(id => {
      const comanda = activeTable?.comandas.find(c => c.id === id);
      if (comanda) allItems.push(...comanda.items);
    });

    const hasProducedItems = allItems.some(i => {
      const p = (db.products || []).find(prod => prod.id === i.productId);
      return p?.type === 'Produzido';
    });

    const newSale: Sale = { id: saleId, date: new Date().toISOString(), items: allItems, sellerId: activeComanda?.sellerId || 'v1', subtotal: total + discount, total, discount, payments, paymentMethod: payments.length > 1 ? 'Múltiplo' : (payments[0].method as any), deliveryType: 'Retirada', status: hasProducedItems ? 'Pendente' : 'Entregue', type: 'Venda', comandaIds, sendToProduction: hasProducedItems };
    
    const newMovement: CashierMovement = { id: `M${Date.now()}`, type: 'Venda', description: `Venda #${saleId.slice(-6)} (Mesa ${activeTable?.number})`, amount: total, method: newSale.paymentMethod, date: new Date().toISOString(), bankId: payments[0]?.bankId || 'b_gaveta' };
    
    let updatedDb = applyStockDeduction(allItems, db);
    
    // Sincronização bancária: credita o valor nas respectivas contas bancárias
    let updatedBanks = [...(updatedDb.banks || [])];
    payments.forEach(p => {
      if (p.amount > 0) {
        const targetBankId = p.bankId || (p.method === 'Dinheiro' ? 'b_gaveta' : ((updatedBanks.find(b => b.id !== 'b_gaveta' && b.id !== 'b_cofre')?.id) || 'b_gaveta'));
        updatedBanks = updatedBanks.map(b => b.id === targetBankId ? { ...b, initialBalance: (b.initialBalance || 0) + p.amount } : b);
      }
    });

    const updatedTables = (updatedDb.tables || []).map(t => {
      if (t.id === activeTable?.id) { return { ...t, comandas: t.comandas.map(c => comandaIds.includes(c.id) ? { ...c, status: 'Fechada' as const } : c) }; }
      return t;
    });

    const updatedSessions = (updatedDb.cashierSessions || []).map(s => s.id === activeSession.id ? { ...s, movements: [...s.movements, newMovement] } : s);
    
    setDb({ ...updatedDb, banks: updatedBanks, sales: [...(updatedDb.sales || []), newSale], tables: updatedTables, cashierSessions: updatedSessions });
    setLastSale(newSale);
    setIsCheckoutModalOpen(false);
    setIsReceiptModalOpen(true);
    setCart([]);
    setActiveComanda(null);
    setActiveTable(null);
    toast.success(hasProducedItems ? "Venda finalizada! Pedido enviado para a cozinha." : "Venda finalizada!");
  };

  const handleDirectSaleFinalize = (saleData: Partial<Sale>) => {
    const activeSession = (db.cashierSessions || []).find(s => s.status === 'Aberto');
    if (!activeSession) {
      toast.error("Abra o caixa antes de finalizar a venda!");
      setActiveTab('Caixa');
      return;
    }
    
    const hasProducedItems = cart.some(i => {
      const p = (db.products || []).find(prod => prod.id === i.productId);
      return p?.type === 'Produzido';
    });
    const isDebtPayment = cart.some(i => i.isDebtPayment);
    const saleId = `S${Date.now()}`;
    
    const newSale: Sale = { 
      id: saleId, 
      date: new Date().toISOString(), 
      items: cart, 
      ...saleData, 
      sendToProduction: hasProducedItems, 
      status: hasProducedItems ? 'Pendente' : 'Entregue', 
      isDebtPayment 
    } as Sale;
    
    let updatedDb = applyStockDeduction(cart, db);
    let updatedCustomers = [...(updatedDb.customers || [])];
    let newCreditTransactions = [...(updatedDb.creditTransactions || [])];
    let newExpenses = [...(updatedDb.expenses || [])];
    let updatedBanks = [...(updatedDb.banks || [])];

    if (newSale.customerId) {
      if (newSale.paymentMethod === 'Crediário') {
        updatedCustomers = (updatedDb.customers || []).map(c => { if (c.id === newSale.customerId) { return { ...c, currentDebt: c.currentDebt + newSale.total, lastCreditPurchase: newSale.date }; } return c; });
        newCreditTransactions.push({ id: `CT${Date.now()}`, customerId: newSale.customerId, saleId: newSale.id, type: 'Compra', amount: newSale.total, date: newSale.date, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'Pendente' });
      } else if (isDebtPayment) {
        updatedCustomers = (updatedDb.customers || []).map(c => { if (c.id === newSale.customerId) { const newDebt = Math.max(0, c.currentDebt - newSale.total); return { ...c, currentDebt: newDebt, creditStatus: newDebt === 0 ? 'Liberado' : c.creditStatus }; } return c; });
        newCreditTransactions.push({ id: `CT-PAY-${Date.now()}`, customerId: newSale.customerId, saleId: newSale.id, type: 'Pagamento', amount: newSale.total, date: newSale.date, status: 'Pago' });
        const customer = updatedCustomers.find(c => c.id === newSale.customerId);
        if (customer && (customer.creditStatus === 'Banido' || customer.creditStatus === 'Bloqueado')) {
          const recoveryAccount = (updatedDb.accounts || []).find(a => a.code === '4.10.7');
          if (recoveryAccount) { newExpenses.push({ id: `EXP-REC-${Date.now()}`, description: `Recuperação de Inadimplência - ${customer.name}`, amount: -newSale.total, date: newSale.date, accountId: recoveryAccount.id, bankId: newSale.payments?.[0]?.bankId }); }
        }
      }
    }

    // Sincronização bancária para venda direta
    if (newSale.paymentMethod !== 'Crediário') {
      const pmtList = newSale.payments && newSale.payments.length > 0 ? newSale.payments : [{ method: newSale.paymentMethod || 'Dinheiro', amount: newSale.total, bankId: 'b_gaveta' }];
      pmtList.forEach(p => {
        if (p.amount > 0) {
          const targetBankId = p.bankId || (p.method === 'Dinheiro' ? 'b_gaveta' : ((updatedBanks.find(b => b.id !== 'b_gaveta' && b.id !== 'b_cofre')?.id) || 'b_gaveta'));
          updatedBanks = updatedBanks.map(b => b.id === targetBankId ? { ...b, initialBalance: (b.initialBalance || 0) + p.amount } : b);
        }
      });
    }

    const newMovement: CashierMovement = { 
      id: `M${Date.now()}`, 
      type: 'Venda', 
      description: isDebtPayment ? `Recebimento Dívida: ${updatedCustomers.find(c => c.id === newSale.customerId)?.name}` : `Venda Direta #${saleId.slice(-6)} ${newSale.paymentMethod === 'Crediário' ? '(Crediário)' : ''}`, 
      amount: newSale.paymentMethod === 'Crediário' ? 0 : newSale.total, 
      method: newSale.paymentMethod, 
      date: new Date().toISOString(), 
      bankId: newSale.payments?.[0]?.bankId || 'b_gaveta' 
    };
    
    const updatedSessions = (updatedDb.cashierSessions || []).map(s => s.id === activeSession.id ? { ...s, movements: [...s.movements, newMovement] } : s);
    
    setDb({ 
      ...updatedDb, 
      banks: updatedBanks,
      sales: [...(updatedDb.sales || []), newSale], 
      cashierSessions: updatedSessions, 
      customers: updatedCustomers, 
      creditTransactions: newCreditTransactions, 
      expenses: newExpenses 
    });
    
    setLastSale(newSale);
    setIsDirectSaleModalOpen(false);
    setIsReceiptModalOpen(true);
    setCart([]);
    toast.success(isDebtPayment ? "Pagamento de dívida registrado!" : "Venda finalizada!");
  };

  const handlePayDebt = (customer: Customer, amount: number) => {
    const debtItem: CartItem = { id: `DEBT-${Date.now()}`, productId: 'p_debt', productName: `PAGAMENTO DE DÍVIDA: ${customer.name}`, quantity: 1, price: amount, isDebtPayment: true };
    setCart([debtItem]);
    setActiveTab('PDV');
    setIsDirectSaleModalOpen(true);
  };

  const handleSendToCounter = (customerId: string) => {
    const balcao = (db.tables || []).find(t => t.id === 'balcao');
    if (!balcao) return;
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newComanda: Comanda = { id: `COM${Date.now()}`, code: `CMD-${shortId}`, number: `B-${balcao.comandas.length + 1}`, customerId: customerId || 'c1', sellerId: formData.sellerId || 'v1', items: cart, openedAt: new Date().toISOString(), status: 'Aberta' };
    const updatedTables = (db.tables || []).map(t => t.id === 'balcao' ? { ...t, comandas: [...t.comandas, newComanda] } : t);
    setDb({ ...db, tables: updatedTables });
    setIsDirectSaleModalOpen(false);
    setCart([]);
    setActiveTab('Mesas');
    toast.success("Pedido enviado para o Balcão!");
  };

  const handleSaveToComanda = () => {
    if (!activeTable || !activeComanda) return;
    const updatedTables = (db.tables || []).map(t => { 
      if (t.id === activeTable.id) { 
        return { 
          ...t, 
          comandas: t.comandas.map(c => 
            c.id === activeComanda.id 
              ? { ...c, items: [...c.items, ...cart.map(i => ({ ...i, status: 'Pendente' as const }))] } 
              : c
          ) 
        }; 
      } 
      return t; 
    });
    setDb({ ...db, tables: updatedTables });
    setCart([]);
    setActiveComanda(null);
    setActiveTable(null);
    setActiveTab('Mesas');
    toast.success("Itens lançados na comanda e enviados para produção!");
  };

  const handleNextComandaStep = () => {
    const currentData = { isCustomer: formData.isCustomer, customerId: formData.customerId, newCustomerName: formData.newCustomerName, newCustomerPhone: formData.newCustomerPhone, newCustomerAddress: formData.newCustomerAddress };
    const newTemp = [...tempComandas, currentData];
    setTempComandas(newTemp);
    if (comandaStep < formData.numComandas) { setComandaStep(comandaStep + 1); setFormData({ ...formData, isCustomer: true, customerId: '', newCustomerName: '', newCustomerPhone: '', newCustomerAddress: '' }); }
    else { finalizeComandasAbertura(newTemp); }
  };

  const finalizeComandasAbertura = (allData: any[]) => {
    let updatedCustomers = [...(db.customers || [])];
    const newComandas: Comanda[] = [];
    allData.forEach((data, i) => {
      let customerId = 'c1';
      if (data.isCustomer && data.customerId) { customerId = data.customerId; }
      else if (!data.isCustomer && data.newCustomerName) {
        const newCust: Customer = { id: `C${Date.now()}-${i}`, name: data.newCustomerName, whatsapp: data.newCustomerPhone || '-', address: data.newCustomerAddress || '-', cep: '-', number: '-', complement: '-', loyaltyPoints: 0, creditEnabled: false, creditLimit: 0, currentDebt: 0, creditStatus: 'Liberado' };
        updatedCustomers.push(newCust);
        customerId = newCust.id;
      }
      const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
      newComandas.push({ id: `COM${Date.now()}-${i}`, code: `CMD-${shortId}`, number: `${activeTable?.number}-${(activeTable?.comandas.length || 0) + i + 1}`, customerId, sellerId: formData.sellerId || 'v1', items: [], openedAt: new Date().toISOString(), status: 'Aberta' });
    });
    const updatedTables = (db.tables || []).map(t => t.id === activeTable?.id ? { ...t, comandas: [...t.comandas, ...newComandas] } : t);
    setDb({ ...db, tables: updatedTables, customers: updatedCustomers });
    handleCloseAddModal();
    if (allData.length === 1) { setActiveComanda(newComandas[0]); setActiveTab('PDV'); }
    else { setActiveTab('Mesas'); }
    toast.success(`${allData.length} comanda(s) aberta(s)!`);
  };

  const handleShareWhatsApp = () => {
    if (!lastSale) return;
    const text = `Olá! Segue o seu comprovante de venda da ${db?.companyInfo?.name}.\nTotal: R$ ${lastSale.total.toFixed(2)}\nID: #${lastSale.id.slice(-8)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const headerShortcuts = useMemo(() => {
    const fixedOrder = ['Caixa', 'PDV', 'Mesas', 'Atendimento', 'Produção', 'Estoque', 'Compras', 'Despesas', 'Dashboard'];
    const userShortcuts = db?.companyInfo?.headerShortcuts || [];
    
    // Fallback: se não houver atalhos configurados (ex: após importação), mostra todos os principais
    if (userShortcuts.length === 0) return ['Caixa', 'PDV', 'Mesas', 'Atendimento', 'Produção', 'Estoque', 'Dashboard'];
    
    const base = fixedOrder.filter(id => userShortcuts.includes(id));
    if (db?.companyInfo?.creditEnabled) { base.push('Crediário'); }
    return base;
  }, [db?.companyInfo?.headerShortcuts, db?.companyInfo?.creditEnabled]);

  const shortcutIcons: Record<string, { icon: React.ReactNode, color: string, tab: any }> = {
    'PDV': { icon: <Banknote className="w-4 h-4" />, color: 'bg-indigo-600', tab: 'PDV' },
    'Mesas': { icon: <TableWithChairs className="w-4 h-4" />, color: 'bg-emerald-500', tab: 'Mesas' },
    'Atendimento': { icon: <BellRing className="w-4 h-4" />, color: 'bg-emerald-600', tab: 'Atendimento' },
    'Produção': { icon: <ChefHat className="w-4 h-4" />, color: 'bg-orange-500', tab: 'Produção' },
    'Estoque': { icon: <Boxes className="w-4 h-4" />, color: 'bg-slate-700', tab: 'Estoque' },
    'Compras': { icon: <ShoppingBag className="w-4 h-4" />, color: 'bg-amber-600', tab: 'Compras' },
    'Despesas': { icon: <TrendingDown className="w-4 h-4" />, color: 'bg-red-500', tab: 'Despesas' },
    'Dashboard': { icon: <LayoutDashboard className="w-4 h-4" />, color: 'bg-blue-600', tab: 'Dashboard' },
    'Caixa': { icon: <Wallet className="w-4 h-4" />, color: 'bg-violet-600', tab: 'Caixa' },
    'Crediário': { icon: <Wallet className="w-4 h-4" />, color: 'bg-indigo-950', tab: 'Crediário' },
  };

  const getModalTitle = () => {
    if (activeTab === 'Mesas') return `Mesa ${activeTable?.number} - Abrir Comanda`;
    const prefix = editingId ? 'Editar' : 'Novo';
    const label = activeTab === 'ItensProduzidos' ? 'Item de Fabricação' : activeTab.slice(0, -1);
    return `${prefix} ${label}`;
  };

  const handleStartPurchaseFromStock = (items: any[], supplierId?: string) => {
    setPurchaseDraft({ items, supplierId });
    setActiveTab('Compras');
  };

  return (
    <div className={`flex h-dvh w-full overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <Sidebar db={db} activeTab={activeTab} forcedSubTab={forcedSubTab} setActiveTab={(tab, sub) => { setActiveTab(tab); setForcedSubTab(sub); setSidebarOpen(false); }} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-16 border-b flex items-center justify-between px-4 no-print shadow-sm z-30 shrink-0 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              {headerShortcuts.map(sId => {
                const s = shortcutIcons[sId];
                if (!s) return null;
                return (
                  <button key={sId} onClick={() => setActiveTab(s.tab)} className={`flex items-center justify-center p-2 rounded-xl shadow-lg transition-all hover:scale-110 active:scale-95 ${s.color} ${activeTab === s.tab ? 'ring-4 ring-offset-2 ring-indigo-50/20' : 'opacity-80'}`} title={sId}><div className="text-white">{s.icon}</div></button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {db?.companyInfo?.cloudSync?.enabled && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                <Cloud className="w-3.5 h-3.5" /> Nuvem Ativa
              </div>
            )}
            {todayBirthdays.length > 0 && (
              <button onClick={() => setActiveTab('Aniversariantes')} className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all animate-bounce"><Cake className="w-4 h-4" /> {todayBirthdays.length} Aniversariante(s)!</button>
            )}
            <div className="relative">
              <button onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /><span className="hidden md:inline">{periodType}</span><ChevronDown className="w-3 h-3 opacity-40" /></button>
              {isPeriodMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in duration-200">
                  {['Hoje', 'Semana', 'Mês', 'Trimestre', 'Ano', 'Personalizado'].map(p => (
                    <button key={p} onClick={() => { setPeriodType(p as any); setIsPeriodMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${periodType === p ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>{p}</button>
                  ))}
                </div>
              )}
            </div>
            {periodType === 'Personalizado' ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300"><input type="date" className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-[10px] font-black outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} /><span className="text-[10px] font-black opacity-40 hidden md:inline">ATÉ</span><input type="date" className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-[10px] font-black outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            ) : (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-600"><button onClick={() => { const d = new Date(pivotDate); if (periodType === 'Mês') d.setMonth(d.getMonth() - 1); else if (periodType === 'Hoje') d.setDate(d.getDate() - 1); else if (periodType === 'Ano') d.setFullYear(d.getFullYear() - 1); setPivotDate(d); }} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-all text-slate-700 dark:text-slate-200"><ChevronLeft className="w-3.5 h-3.5" /></button><span className="text-[9px] font-black uppercase px-2 min-w-[80px] text-center hidden md:block text-slate-700 dark:text-slate-200">{periodType === 'Mês' ? pivotDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : periodType === 'Hoje' ? pivotDate.toLocaleDateString('pt-BR') : pivotDate.getFullYear()}</span><button onClick={() => { const d = new Date(pivotDate); if (periodType === 'Mês') d.setMonth(d.getMonth() + 1); else if (periodType === 'Hoje') d.setDate(d.getDate() + 1); else if (periodType === 'Ano') d.setFullYear(d.getFullYear() + 1); setPivotDate(d); }} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-all text-slate-700 dark:text-slate-200"><ChevronRight className="w-3.5 h-3.5" /></button></div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeComanda && (
              <div className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl flex items-center gap-2 animate-pulse">
                <Utensils className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Mesa {activeTable?.number} - Comanda {activeComanda.number.split('-')[1]}</span>
                <button onClick={() => { setActiveComanda(null); setActiveTable(null); setCart([]); }} className="ml-2 hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            )}
            <button
              id="btn-toggle-fullscreen"
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 transition-all shadow-sm active:scale-95 flex items-center justify-center"
              title={isFullscreen ? "Recolher Tela (Sair da Tela Cheia)" : "Expandir Tela (Tela Cheia)"}
              aria-label={isFullscreen ? "Recolher Tela" : "Expandir Tela"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Maximize className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">AD</div>
          </div>
        </header>
        <div className={`flex-1 ${activeTab === 'PDV' ? 'overflow-hidden' : 'overflow-y-auto'} p-4 no-print custom-scrollbar min-w-0`}>
          {activeTab === 'PDV' && (
            <div className="h-full w-full min-w-0">
              <POSView db={db} cart={cart} setCart={setCart} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onCheckout={(method) => { setPreSelectedPaymentMethod(method as any); if (activeComanda) setIsCheckoutModalOpen(true); else setIsDirectSaleModalOpen(true); }} isDarkMode={isDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeComanda={activeComanda} onSaveToComanda={handleSaveToComanda} onOpenScanner={() => setIsScannerOpen(true)} />
            </div>
          )}
          {activeTab === 'Mesas' && <TablesManager db={db} setDb={setDb} onSelectComanda={(t, c) => { setActiveTable(t); setActiveComanda(c); setActiveTab('PDV'); }} onAddComanda={(t) => { setActiveTable(t); setFormData({ numComandas: 1, isCustomer: true, sellerId: '' }); setComandaStep(0); setTempComandas([]); setIsAddModalOpen(true); }} onCheckoutTable={(t) => { setActiveTable(t); setIsCheckoutModalOpen(true); }} onAddTable={() => { const num = (db.tables || []).filter(t => t.id !== 'balcao').length + 1; setDb({...db, tables: [...(db.tables || []), { id: `T${num}`, number: num.toString(), comandas: [] }]}); }} />}
          {activeTab === 'Dashboard' && <DashboardView db={db} startDate={startDate} endDate={endDate} />}
          {activeTab === 'Caixa' && <CashierManager db={db} setDb={setDb} isDarkMode={isDarkMode} />}
          {activeTab === 'Metas' && <GoalsManager db={db} setDb={setDb} />}
          {activeTab === 'Produção' && <ProductionManager db={db} setDb={setDb} />}
          {activeTab === 'Atendimento' && <WaiterMonitor db={db} setDb={setDb} />}
          {activeTab === 'RelatorioFinanceiro' && <FinancialReportsView db={db} setDb={setDb} startDate={startDate} endDate={endDate} forcedTab={forcedSubTab as any} />}
          {activeTab === 'RelatorioVendas' && <SalesReportsView db={db} startDate={startDate} endDate={endDate} forcedTab={forcedSubTab as any} />}
          {activeTab === 'Produtos' && <ProductsManager db={db} setDb={setDb} onAdd={() => { setFormData({type: 'Revenda', batches: []}); setIsAddModalOpen(true); }} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} onOpenScanner={() => setIsScannerOpen(true)} onStartPurchase={handleStartPurchaseFromStock} searchQuery={searchQuery} />}
          {activeTab === 'ItensProduzidos' && <ProductionCatalogManager db={db} setDb={setDb} onAdd={() => { setFormData({type: 'Produzido', recipe: []}); setIsAddModalOpen(true); }} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} searchQuery={searchQuery} />}
          {activeTab === 'Serviços' && <ServicesManager db={db} setDb={setDb} onAdd={() => { setFormData({type: 'Serviço'}); setIsAddModalOpen(true); }} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Categorias' && <CategoriesManager db={db} setDb={setDb} onAdd={() => { setFormData({showInPOS: false, type: 'Venda'}); setIsAddModalOpen(true); }} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Clientes' && <CustomersManager db={db} setDb={setDb} onAdd={() => setIsAddModalOpen(true)} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Usuários' && <UsersManager db={db} setDb={setDb} onAdd={() => { setFormData({status: 'Ativo', contractType: 'CLT', role: 'Vendedor'}); setIsAddModalOpen(true); }} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Fornecedores' && <SuppliersManager db={db} setDb={setDb} onAdd={() => setIsAddModalOpen(true)} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Despesas' && <ExpensesManager db={db} setDb={setDb} onAdd={() => setIsAddModalOpen(true)} onEdit={(i: any) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'PlanoDeContas' && <ChartOfAccountsManager db={db} setDb={setDb} onAdd={() => setIsAddModalOpen(true)} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Compras' && <PurchasesManager db={db} setDb={setDb} initialDraft={purchaseDraft} onClearDraft={() => setPurchaseDraft(null)} />}
          {activeTab === 'Estoque' && <StockHistoryView db={db} setDb={setDb} startDate={startDate} endDate={endDate} />}
          {activeTab === 'Bancos' && <BanksManager db={db} setDb={setDb} onAdd={() => { setFormData({initialBalance: 0}); setIsAddModalOpen(true); }} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'CentrosDeCusto' && <CostCentersManager db={db} setDb={setDb} onAdd={() => setIsAddModalOpen(true)} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Empresas' && <CompaniesManager db={db} setDb={setDb} onAdd={() => setIsAddModalOpen(true)} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Crediário' && <CreditManager db={db} onPayDebt={handlePayDebt} />}
          {activeTab === 'Conciliação' && <BankReconciliation db={db} setDb={setDb} />}
          {activeTab === 'Aniversariantes' && <BirthdayList db={db} />}
          {activeTab === 'Locais' && <LocationsManager db={db} setDb={setDb} onAdd={() => setIsAddModalOpen(true)} onEdit={(i) => { setFormData(i); setEditingId(i.id); setIsAddModalOpen(true); }} />}
          {activeTab === 'Fidelidade' && <SettingsView db={db} setDb={setDb} forcedTab="Fidelidade" />}
          {activeTab === 'Empresa' && <SettingsView db={db} setDb={setDb} forcedTab="Empresa" />}
          {activeTab === 'ConfigPDV' && <SettingsView db={db} setDb={setDb} forcedTab="PDV" />}
          {activeTab === 'Modulos' && <SettingsView db={db} setDb={setDb} forcedTab="Módulos" />}
          {activeTab === 'Dados' && <SettingsView db={db} setDb={setDb} forcedTab="Dados" />}
          {activeTab === 'Nuvem' && <SettingsView db={db} setDb={setDb} forcedTab="Nuvem" />}
          {activeTab === 'Configurações' && <SettingsView db={db} setDb={setDb} />}
        </div>
      </main>
      
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} db={db} table={activeTable || undefined} isDarkMode={isDarkMode} onFinalize={finalizeSale} />
      <DirectSaleModal isOpen={isDirectSaleModalOpen} onClose={() => setIsDirectSaleModalOpen(false)} db={db} setDb={setDb} cart={cart} isDarkMode={isDarkMode} initialPaymentMethod={preSelectedPaymentMethod} onFinalize={handleDirectSaleFinalize} onSendToCounter={handleSendToCounter} />
      <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Venda Concluída" maxWidth="max-w-2xl" isDarkMode={isDarkMode}>
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center mb-6">{lastSale && <ThermalReceipt sale={lastSale} company={db?.companyInfo} />}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all shadow-lg"><Printer className="w-4 h-4" /> Imprimir</button>
            <button onClick={handleShareWhatsApp} className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-700 transition-all shadow-lg"><Share2 className="w-4 h-4" /> WhatsApp</button>
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-700 transition-all shadow-lg"><FileDown className="w-4 h-4" /> Salvar PDF</button>
          </div>
          <button onClick={() => setIsReceiptModalOpen(false)} className="mt-4 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 dark:hover:text-slate-200">Fechar Janela</button>
        </div>
      </Modal>
      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Scanner Inteligente" maxWidth="max-w-md" isDarkMode={isDarkMode}>
        <Scanner products={db.products || []} onScan={handleScannerResult} onManualRegister={() => { setIsScannerOpen(false); setActiveTab('Produtos'); setIsAddModalOpen(true); }} onClose={() => setIsScannerOpen(false)} />
      </Modal>
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title={getModalTitle()} maxWidth={activeTab === 'ItensProduzidos' || activeTab === 'Produtos' ? 'max-w-6xl' : 'max-w-lg'} isDarkMode={isDarkMode}>
        <div className="space-y-6">
          {activeTab === 'Mesas' ? (
            comandaStep === 0 ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm text-indigo-600 dark:text-indigo-400"><Users className="w-8 h-8" /></div>
                  <div><p className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Quantas pessoas na mesa?</p><p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase mt-1">Abra múltiplas comandas de uma vez</p></div>
                  <div className="flex items-center gap-6 bg-white dark:bg-slate-800 p-3 rounded-[2rem] shadow-xl"><button onClick={() => setFormData({...formData, numComandas: Math.max(1, (formData.numComandas || 1) - 1)})} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-indigo-600 dark:text-indigo-400 transition-all"><Minus className="w-6 h-6" /></button><input type="number" className="text-3xl font-black w-16 text-center bg-transparent border-none outline-none text-slate-900 dark:text-white" value={formData.numComandas || 1} onFocus={(e) => e.target.select()} onChange={(e) => setFormData({...formData, numComandas: e.target.value === '' ? 0 : Number(e.target.value)})} /><button onClick={() => setFormData({...formData, numComandas: (formData.numComandas || 1) + 1})} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-indigo-600 dark:text-indigo-400 transition-all"><Plus className="w-6 h-6" /></button></div>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Garçom Responsável</label><select className="w-full border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-sm font-black bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20" value={formData.sellerId} onChange={e => setFormData({...formData, sellerId: e.target.value})}><option value="">Selecione o garçom...</option>{(db.users || []).filter(u => u.status === 'Ativo').map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}</select></div>
                <button disabled={!formData.sellerId} onClick={() => setComandaStep(1)} className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${formData.sellerId ? 'bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none hover:bg-indigo-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>Iniciar Identificação <ChevronRight className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between px-2"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">{comandaStep}</div><p className="text-[10px] font-black uppercase text-slate-400">Identificando Comanda {comandaStep} de {formData.numComandas}</p></div><div className="flex gap-1">{Array.from({ length: formData.numComandas }).map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all ${i + 1 === comandaStep ? 'bg-indigo-600 w-4' : i + 1 < comandaStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />))}</div></div>
                <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem]"><button onClick={() => setFormData({...formData, isCustomer: true})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.isCustomer ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}><Search className="w-3.5 h-3.5" /> Cliente Base</button><button onClick={() => setFormData({...formData, isCustomer: false})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${!formData.isCustomer ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}><UserPlus className="w-3.5 h-3.5" /> Avulso / ID</button></div>
                {formData.isCustomer ? (<div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-[2rem] border border-slate-100 dark:border-slate-700 animate-in fade-in duration-300"><SearchableSelect label="Buscar Cliente" placeholder="Selecione o cliente..." options={(db.customers || []).map(c => ({ id: c.id, name: c.name, subtext: c.whatsapp }))} value={formData.customerId || ''} onChange={(id: string) => setFormData({ ...formData, customerId: id })} /></div>) : (<div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-[2rem] border border-slate-100 dark:border-slate-700 animate-in fade-in duration-300"><div className="space-y-3"><div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome de Referência</label><input autoFocus className="w-full border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-sm font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20" placeholder="Ex: João, Maria, Visitante..." value={formData.newCustomerName || ''} onChange={e => setFormData({ ...formData, newCustomerName: e.target.value })} /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp (Opcional)</label><input className="w-full border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20" value={formData.newCustomerPhone || ''} onChange={e => setFormData({ ...formData, newCustomerPhone: e.target.value })} /></div><div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">ID de Rastreio</label><div className="w-full bg-slate-200 dark:bg-slate-700 p-4 rounded-2xl text-[10px] font-mono font-black text-slate-600 dark:text-slate-300 flex items-center gap-2"><QrCode className="w-4 h-4" /> AUTO-GEN</div></div></div></div></div>)}
                <div className="flex gap-3"><button onClick={handleNextComandaStep} className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">{comandaStep < formData.numComandas ? (<>Próxima Comanda <ChevronRight className="w-4 h-4" /></>) : (<><CheckCircle2 className="w-4 h-4" /> Finalizar Abertura</>)}</button><button onClick={() => setComandaStep(0)} className="p-5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-[2rem] hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"><X className="w-5 h-5" /></button></div>
              </div>
            )
          ) : (
            <div className="space-y-6"><RegistrationForm type={activeTab} db={db} formData={formData} setFormData={setFormData} isDarkMode={isDarkMode} /><div className="flex gap-3 pt-4"><button onClick={handleSaveRecord} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Salvar Registro</button><button onClick={handleCloseAddModal} className="px-6 bg-slate-100 dark:bg-slate-700 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">Cancelar</button></div></div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default App;