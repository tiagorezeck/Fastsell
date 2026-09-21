export interface Category {
  id: string;
  name: string;
  showInPOS: boolean;
  type: 'Venda' | 'Serviço';
}

export interface StorageLocation {
  id: string;
  name: string;
  type: 'Estoque' | 'Loja' | 'Centro de Distribuição' | 'Outro';
}

export interface StorageAddress {
  id: string;
  name: string;
}

export interface MovementNature {
  id: string;
  name: string;
  defaultDirection: 'Entrada' | 'Saída';
}

export interface StockBatch {
  id: string;
  batchNumber: string;
  entryDate: string;
  expirationDate?: string;
  quantity: number;
  costPrice: number;
}

export interface RecipeItem {
  productId: string;
  netQuantity: number;
  recipeUnit: 'KG' | 'L' | 'UN' | 'GR' | 'ML';
}

export interface MoveItem {
  productId: string;
  quantity: number;
  addressId?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  category: string;
  barcode: string;
  imageUrl: string;
  type: 'Insumo' | 'Revenda' | 'Produzido' | 'Serviço';
  unit: 'KG' | 'L' | 'UN' | 'CX' | 'DZ' | 'GR' | 'ML'; 
  contentPerUnit?: number; 
  contentUnit?: 'GR' | 'ML';
  correctionFactor?: number; 
  recipe?: RecipeItem[];
  yieldWeight?: number; 
  portions?: number; 
  preparationTime?: number; 
  preparationMode?: string; 
  desiredProfitMargin?: number; 
  supplierId?: string;
  locationId?: string;
  addressId?: string;
  batches: StockBatch[];
  batch?: string;
  expirationDate?: string;
  entryDate?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  direction: 'Entrada' | 'Saída';
  natureId: string;
  quantity: number;
  reason: string;
  date: string;
  fromLocationId?: string;
  toLocationId?: string;
  addressId?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Receita' | 'Despesa' | 'Custo' | 'Dedução' | 'Resultado Financeiro' | 'Ativo' | 'Passivo' | 'Patrimônio Líquido';
  parentCode?: string;
  classification?: 'Grupo' | 'Subgrupo' | 'Conta' | 'Item';
}

export interface DatabaseBackup {
  id: string;
  date: string;
  name: string;
  data: any; // Snapshot do DB
}

export interface Database {
  products: Product[];
  customers: Customer[];
  users: User[];
  suppliers: Supplier[];
  banks: Bank[];
  costCenters: CostCenter[];
  companies: Company[];
  accounts: Account[];
  sales: Sale[];
  purchases: any[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  cashierSessions: CashierSession[];
  categories: Category[];
  locations: StorageLocation[];
  addresses: StorageAddress[];
  movementNatures: MovementNature[];
  companyInfo: CompanyInfo;
  goalRules: GoalRule[];
  sellerGoals: SellerGoal[];
  tables: Table[];
  creditTransactions: CreditTransaction[];
  backups?: DatabaseBackup[];
}

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  cep: string;
  number: string;
  complement: string;
  birthDate?: string;
  loyaltyPoints: number;
  creditEnabled: boolean;
  creditLimit: number;
  currentDebt: number;
  creditStatus: 'Liberado' | 'Alerta' | 'Bloqueado' | 'Banido';
  lastCreditPurchase?: string;
  banUntil?: string;
}

export interface User {
  id: string;
  code: string;
  name: string;
  password?: string;
  role: 'Vendedor' | 'Comprador' | 'Estoquista' | 'Gerente' | 'Admin' | 'Outro';
  status: 'Ativo' | 'Inativo';
  area?: string;
  function?: string;
  contractType: 'CLT' | 'PJ' | 'Estágio' | 'Temporário';
  workload?: string;
  entryDate?: string;
  terminationDate?: string;
  imageUrl?: string;
  commission: number;
  sector?: string;
}

export interface Supplier {
  id: string;
  name: string;
  responsible?: string;
  whatsapp: string;
  address?: string;
  cnpj?: string;
  category?: string;
  cep?: string;
  endereco?: string;
  number?: string;
  complement?: string;
}

export interface Bank {
  id: string;
  name: string;
  agency: string;
  account: string;
  initialBalance: number;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  type: 'Sede' | 'Filial';
  address: string;
}

export interface Sale {
  id: string;
  date: string;
  customerId?: string;
  sellerId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Dinheiro' | 'Pix' | 'Crédito' | 'Débito' | 'Crediário' | 'Múltiplo';
  payments: Payment[];
  deliveryType: 'Retirada' | 'Entrega';
  shippingFee?: number;
  shippingPayer?: 'Cliente' | 'Empresa';
  status: 'Pendente' | 'Preparando' | 'Pronto' | 'Entregue';
  type: 'Venda' | 'Orçamento';
  comandaIds?: string[];
  sendToProduction?: boolean;
  isDebtPayment?: boolean;
  interestRate?: number;
  interestAmount?: number;
  installments?: number;
  pickupTime?: string;
  startedAt?: string;
  readyAt?: string;
}

export interface Payment {
  method: 'Dinheiro' | 'Pix' | 'Crédito' | 'Débito' | 'Crediário';
  amount: number;
  bankId?: string;
}

export interface CartItem {
  id: string;
  productId: string; 
  productName: string; 
  quantity: number;
  price: number;
  isDebtPayment?: boolean;
  status?: 'Pendente' | 'Preparando' | 'Pronto' | 'Entregue';
  startedAt?: string;
  readyAt?: string;
  responsibleId?: string;
}

export interface CashierSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  status: 'Aberto' | 'Fechado';
  operator: string;
  movements: CashierMovement[];
}

export interface CashierMovement {
  id: string;
  type: 'Abertura' | 'Venda' | 'Suprimento' | 'Sangria' | 'Fechamento';
  description: string;
  amount: number;
  method: string;
  date: string;
  bankId?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  accountId: string;
  bankId?: string;
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  phone: string;
  posMode: 'Varejo' | 'Uniproduto' | 'Serviço' | 'Híbrido';
  enabledModules: string[];
  headerShortcuts: string[];
  loyalty: {
    enabled: boolean;
    pointsPerReal: number;
    pointsToCashRatio: number;
    minPointsToRedeem: number;
  };
  dreStructure: DRELine[];
  creditEnabled: boolean;
  creditRules: {
    alertDays: number;
    blockDays: number;
    banDays: number;
  };
  hideImageSearchInstructions?: boolean;
  geminiApiKey?: string;
  cloudSync?: {
    enabled: boolean;
    apiKey: string;
    clientId: string;
    fileId?: string;
    lastSync?: string;
    autoSync: boolean;
  };
}

export interface DRELine {
  id: string;
  label: string;
  operation: '+' | '-' | '+/-' | '=';
  accountCodes: string[];
  indent: number;
  isMain: boolean;
  isVisible: boolean;
}

export interface GoalRule {
  id: string;
  minPct: number;
  maxPct: number;
  commissionRate: number;
}

export interface SellerGoal {
  id: string;
  sellerId: string;
  month: string;
  targetAmount: number;
}

export interface Table {
  id: string;
  number: string;
  comandas: Comanda[];
  reservation?: Reservation;
}

export interface Comanda {
  id: string;
  code: string;
  number: string;
  customerId: string;
  sellerId: string;
  items: CartItem[];
  openedAt: string;
  status: 'Aberta' | 'Fechada';
}

export interface Reservation {
  id: string;
  responsibleName: string;
  peopleCount: number;
  date: string;
  time: string;
  status: 'Pendente' | 'Confirmada' | 'Cancelada';
}

export interface CreditTransaction {
  id: string;
  customerId: string;
  saleId?: string;
  type: 'Compra' | 'Pagamento';
  amount: number;
  date: string;
  dueDate?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  sentToBadDebt?: boolean;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  supplierId: string;
  items: { productId: string; quantity: number; cost: number }[];
  total: number;
  status: 'Pendente' | 'Recebido';
  receivedAt?: string;
}