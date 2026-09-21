import { Database, Account, Category, Product, Customer, Supplier, User, Sale, Expense, CashierSession, Table, GoalRule, CartItem, Bank, PurchaseOrder, StockMovement, SellerGoal, DRELine, StorageLocation, MovementNature, StorageAddress, StockBatch } from './types';

export const ERP_ACCOUNTS: Account[] = [
  // 1. RECEITAS
  {id: "1", code: "1", name: "RECEITAS OPERACIONAIS", type: "Receita", classification: "Grupo"},
  {id: "1.1", code: "1.1", name: "Receita de Vendas de Produtos", type: "Receita", parentCode: "1", classification: "Subgrupo"},
  {id: "1.2", code: "1.2", name: "Receita de Serviços", type: "Receita", parentCode: "1", classification: "Subgrupo"},
  
  // 2. DEDUÇÕES
  {id: "2", code: "2", name: "DEDUÇÕES DA RECEITA", type: "Dedução", classification: "Grupo"},
  {id: "2.1", code: "2.1", name: "Impostos Sobre Receita", type: "Dedução", parentCode: "2", classification: "Subgrupo"},
  {id: "2.2", code: "2.2", name: "Dedução de Venda", type: "Dedução", parentCode: "2", classification: "Subgrupo"},

  // 3. CUSTOS
  {id: "3", code: "3", name: "CUSTOS DIRETOS", type: "Custo", classification: "Grupo"},
  {id: "3.1", code: "3.1", name: "CSP - Custo de Serviço Prestado", type: "Custo", parentCode: "3", classification: "Subgrupo"},
  {id: "3.1.1", code: "3.1.1", name: "Deslocamento para Atendimento", type: "Custo", parentCode: "3.1", classification: "Conta"},
  {id: "3.1.2", code: "3.1.2", name: "Material Aplicado", type: "Custo", parentCode: "3.1", classification: "Conta"},
  {id: "3.1.3", code: "3.1.3", name: "Royalties sobre Representação", type: "Custo", parentCode: "3.1", classification: "Conta"},
  {id: "3.1.4", code: "3.1.4", name: "Serviços Terceirizados", type: "Custo", parentCode: "3.1", classification: "Conta"},
  {id: "3.2", code: "3.2", name: "CMV - Custo de Mercadoria Vendida", type: "Custo", parentCode: "3", classification: "Subgrupo"},
  {id: "3.2.1", code: "3.2.1", name: "Frete de Material para Revenda", type: "Custo", parentCode: "3.2", classification: "Conta"},
  {id: "3.2.2", code: "3.2.2", name: "Materiais para Revenda", type: "Custo", parentCode: "3.2", classification: "Conta"},
  {id: "3.3", code: "3.3", name: "Custos Variáveis Comerciais", type: "Custo", parentCode: "3", classification: "Subgrupo"},
  {id: "3.3.1", code: "3.3.1", name: "Comissão de Vendedores", type: "Custo", parentCode: "3.3", classification: "Conta"},
  {id: "3.3.2", code: "3.3.2", name: "Deslocamento Comercial", type: "Custo", parentCode: "3.3", classification: "Conta"},
  {id: "3.3.3", code: "3.3.3", name: "Garantias", type: "Custo", parentCode: "3.3", classification: "Conta"},

  // 4. DESPESAS
  {id: "4", code: "4", name: "DESPESAS OPERACIONAIS", type: "Despesa", classification: "Grupo"},
  {id: "4.1", code: "4.1", name: "Recursos Humanos", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.1.1", code: "4.1.1", name: "Remuneração", type: "Despesa", parentCode: "4.1", classification: "Conta"},
  {id: "4.1.1.1", code: "4.1.1.1", name: "Adiantamento Salarial", type: "Despesa", parentCode: "4.1.1", classification: "Item"},
  {id: "4.1.1.2", code: "4.1.1.2", name: "Remuneração de Estagiários", type: "Despesa", parentCode: "4.1.1", classification: "Item"},
  {id: "4.1.1.3", code: "4.1.1.3", name: "Salários", type: "Despesa", parentCode: "4.1.1", classification: "Item"},
  {id: "4.1.1.4", code: "4.1.1.4", name: "Horas extras", type: "Despesa", parentCode: "4.1.1", classification: "Item"},
  {id: "4.1.1.5", code: "4.1.1.5", name: "Recisões", type: "Despesa", parentCode: "4.1.1", classification: "Item"},
  {id: "4.1.2", code: "4.1.2", name: "Encargos sociais", type: "Despesa", parentCode: "4.1", classification: "Conta"},
  {id: "4.1.2.1", code: "4.1.2.1", name: "FGTS", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.2", code: "4.1.2.2", name: "INSS", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.3", code: "4.1.2.3", name: "13o Salários", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.4", code: "4.1.2.4", name: "FGTS sobre 13º salário", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.5", code: "4.1.2.5", name: "INSS sobre 13º salário", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.6", code: "4.1.2.6", name: "Aviso prévio", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.7", code: "4.1.2.7", name: "FGTS sobre Férias", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.8", code: "4.1.2.8", name: "INSS sobre Férias", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.9", code: "4.1.2.9", name: "Férias", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.10", code: "4.1.2.10", name: "Provisionamento de Férias", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.11", code: "4.1.2.11", name: "Provisionamento de 13º", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.2.12", code: "4.1.2.12", name: "Provisionamento de Recisão", type: "Despesa", parentCode: "4.1.2", classification: "Item"},
  {id: "4.1.3", code: "4.1.3", name: "Benefícios", type: "Despesa", parentCode: "4.1", classification: "Conta"},
  {id: "4.1.3.1", code: "4.1.3.1", name: "Abono", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.2", code: "4.1.3.2", name: "Bonificação", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.3", code: "4.1.3.3", name: "Cesta Básica", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.4", code: "4.1.3.4", name: "Gratificação", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.5", code: "4.1.3.5", name: "Plano de Saúde", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.6", code: "4.1.3.6", name: "(-) Coparticipação Plano de Saúde", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.7", code: "4.1.3.7", name: "Premiação", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.8", code: "4.1.3.8", name: "PLR - Participação nos Lucros", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.9", code: "4.1.3.9", name: "Treinamentos / Cursos / Formações", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.10", code: "4.1.3.10", name: "Vale Alimentação", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.11", code: "4.1.3.11", name: "Vale Refeição", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.12", code: "4.1.3.12", name: "Vale Transporte", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  {id: "4.1.3.13", code: "4.1.3.13", name: "Seguro de Vida", type: "Despesa", parentCode: "4.1.3", classification: "Item"},
  
  {id: "4.2", code: "4.2", name: "Ocupação e Estrutura", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.2.1", code: "4.2.1", name: "Água e Saneamento", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  {id: "4.2.2", code: "4.2.2", name: "Aluguel", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  {id: "4.2.3", code: "4.2.3", name: "Condomínio", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  {id: "4.2.4", code: "4.2.4", name: "Energia Elétrica", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  {id: "4.2.5", code: "4.2.5", name: "Gás", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  {id: "4.2.6", code: "4.2.6", name: "Seguro Imóvel", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  {id: "4.2.7", code: "4.2.7", name: "Telefonia / Internet", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  {id: "4.2.8", code: "4.2.8", name: "Vigilância e Segurança Patrimonial", type: "Despesa", parentCode: "4.2", classification: "Conta"},
  
  {id: "4.3", code: "4.3", name: "Despesas Tributárias (não sobre venda)", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.3.1", code: "4.3.1", name: "Alvará de Funcionamento", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.2", code: "4.3.2", name: "IPEM - INMETRO", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.3", code: "4.3.3", name: "IPTU", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.4", code: "4.3.4", name: "IPVA / CRLV / DPVAT", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.5", code: "4.3.5", name: "Taxa de Incêndio", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.6", code: "4.3.6", name: "Taxa de Lixo", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.7", code: "4.3.7", name: "Taxas Municipais", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.8", code: "4.3.8", name: "Taxas Estaduais", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  {id: "4.3.9", code: "4.3.9", name: "Transferência Veicular (DUDA)", type: "Despesa", parentCode: "4.3", classification: "Conta"},
  
  {id: "4.4", code: "4.4", name: "Uso e Consumo", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.4.1", code: "4.4.1", name: "Bens de Pequeno Valor", type: "Despesa", parentCode: "4.4", classification: "Conta"},
  {id: "4.4.2", code: "4.4.2", name: "Ferramentas", type: "Despesa", parentCode: "4.4", classification: "Conta"},
  {id: "4.4.3", code: "4.4.3", name: "Lanches e Refeições", type: "Despesa", parentCode: "4.4", classification: "Conta"},
  {id: "4.4.4", code: "4.4.4", name: "Mantimentos", type: "Despesa", parentCode: "4.4", classification: "Conta"},
  {id: "4.4.5", code: "4.4.5", name: "Material Escritório", type: "Despesa", parentCode: "4.4", classification: "Conta"},
  {id: "4.4.6", code: "4.4.6", name: "Material Limpeza", type: "Despesa", parentCode: "4.4", classification: "Conta"},
  {id: "4.4.7", code: "4.4.7", name: "Utensílios", type: "Despesa", parentCode: "4.4", classification: "Conta"},
  
  {id: "4.5", code: "4.5", name: "Transporte", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.5.1", code: "4.5.1", name: "Aluguel de Veículos", type: "Despesa", parentCode: "4.5", classification: "Conta"},
  {id: "4.5.2", code: "4.5.2", name: "Combustível", type: "Despesa", parentCode: "4.5", classification: "Conta"},
  {id: "4.5.3", code: "4.5.3", name: "Estacionamento", type: "Despesa", parentCode: "4.5", classification: "Conta"},
  {id: "4.5.4", code: "4.5.4", name: "Multas de Trânsito", type: "Despesa", parentCode: "4.5", classification: "Conta"},
  {id: "4.5.5", code: "4.5.5", name: "Pedágios", type: "Despesa", parentCode: "4.5", classification: "Conta"},
  {id: "4.5.6", code: "4.5.6", name: "Seguro de Veículos", type: "Despesa", parentCode: "4.5", classification: "Conta"},
  {id: "4.5.7", code: "4.5.7", name: "Transporte Urbano (Táxi, Uber, 99)", type: "Despesa", parentCode: "4.5", classification: "Conta"},
  
  {id: "4.6", code: "4.6", name: "Manutenção", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.6.1", code: "4.6.1", name: "Manutenção Equipamentos", type: "Despesa", parentCode: "4.6", classification: "Conta"},
  {id: "4.6.2", code: "4.6.2", name: "Manutenção Predial", type: "Despesa", parentCode: "4.6", classification: "Conta"},
  {id: "4.6.3", code: "4.6.3", name: "Manutenção Veículos", type: "Despesa", parentCode: "4.6", classification: "Conta"},
  
  {id: "4.7", code: "4.7", name: "Prestadores de Serviços", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.7.1", code: "4.7.1", name: "Aluguel de Equipamentos", type: "Despesa", parentCode: "4.7", classification: "Conta"},
  {id: "4.7.2", code: "4.7.2", name: "Assessoria Jurídica", type: "Despesa", parentCode: "4.7", classification: "Conta"},
  {id: "4.7.3", code: "4.7.3", name: "Cartório", type: "Despesa", parentCode: "4.7", classification: "Conta"},
  {id: "4.7.4", code: "4.7.4", name: "Consultoria", type: "Despesa", parentCode: "4.7", classification: "Conta"},
  {id: "4.7.5", code: "4.7.5", name: "Contabilidade", type: "Despesa", parentCode: "4.7", classification: "Conta"},
  {id: "4.7.6", code: "4.7.6", name: "Correios", type: "Despesa", parentCode: "4.7", classification: "Conta"},
  {id: "4.7.7", code: "4.7.7", name: "Software / Licença de Uso", type: "Despesa", parentCode: "4.7", classification: "Conta"},
  
  {id: "4.8", code: "4.8", name: "Despesas com Sócios", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.8.1", code: "4.8.1", name: "Pró-Labore", type: "Despesa", parentCode: "4.8", classification: "Conta"},
  {id: "4.8.2", code: "4.8.2", name: "Plano de Saúde Sócios", type: "Despesa", parentCode: "4.8", classification: "Conta"},
  {id: "4.8.3", code: "4.8.3", name: "Plano Odontológico Sócios", type: "Despesa", parentCode: "4.8", classification: "Conta"},
  {id: "4.8.4", code: "4.8.4", name: "Estadias e Hospedágens", type: "Despesa", parentCode: "4.8", classification: "Conta"},
  {id: "4.8.5", code: "4.8.5", name: "Viagens e Translados", type: "Despesa", parentCode: "4.8", classification: "Conta"},
  {id: "4.8.6", code: "4.8.6", name: "Representação dos Sócios", type: "Despesa", parentCode: "4.8", classification: "Conta"},
  
  {id: "4.9", code: "4.9", name: "Marketing / Comercial", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.9.1", code: "4.9.1", name: "Agência de Marketing", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.2", code: "4.9.2", name: "Brindes", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.3", code: "4.9.3", name: "Campanhas", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.4", code: "4.9.4", name: "Feiras e Exposições", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.5", code: "4.9.5", name: "Investimento em Mídias", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.6", code: "4.9.6", name: "Publicidade e Propaganda", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.7", code: "4.9.7", name: "Tecnologias (IA, Landing Pages, Sites)", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.8", code: "4.9.8", name: "Tráfego Pago", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  {id: "4.9.9", code: "4.9.9", name: "Viagens para Representações", type: "Despesa", parentCode: "4.9", classification: "Conta"},
  
  {id: "4.10", code: "4.10", name: "Perdas Operacionais", type: "Despesa", parentCode: "4", classification: "Subgrupo"},
  {id: "4.10.1", code: "4.10.1", name: "Avarias de Produtos", type: "Despesa", parentCode: "4.10", classification: "Conta"},
  {id: "4.10.2", code: "4.10.2", name: "Perda de Produtos", type: "Despesa", parentCode: "4.10", classification: "Conta"},
  {id: "4.10.3", code: "4.10.3", name: "Perda em Alienação de Ativo", type: "Despesa", parentCode: "4.10", classification: "Conta"},
  {id: "4.10.4", code: "4.10.4", name: "Perdas em Sinistro (Roubo/Incêndio)", type: "Despesa", parentCode: "4.10", classification: "Conta"},
  {id: "4.10.5", code: "4.10.5", name: "Inadimplência", type: "Despesa", parentCode: "4.10", classification: "Conta"},
  {id: "4.10.6", code: "4.10.6", name: "(-) Indenizações de Seguros", type: "Despesa", parentCode: "4.10", classification: "Conta"},
  {id: "4.10.7", code: "4.10.7", name: "(-) Recuperação de inadimplência", type: "Despesa", parentCode: "4.10", classification: "Conta"},

  // 5. RESULTADO FINANCEIRO
  {id: "5", code: "5", name: "RESULTADO FINANCEIRO", type: "Resultado Financeiro", classification: "Grupo"},
  {id: "5.1", code: "5.1", name: "Despesas Financeiras", type: "Resultado Financeiro", parentCode: "5", classification: "Subgrupo"},
  {id: "5.1.1", code: "5.1.1", name: "Descontos Financeiros Concedidos", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.2", code: "5.1.2", name: "Impostos sobre Aplicações Financeiras", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.3", code: "5.1.3", name: "Juros Conta Garantida", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.4", code: "5.1.4", name: "Juros sobre Empréstimos", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.5", code: "5.1.5", name: "Multas Financeiras Pagas", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.6", code: "5.1.6", name: "Seguros de Empréstimos", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.7", code: "5.1.7", name: "Tarifas Bancárias", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.8", code: "5.1.8", name: "Tarifas de Boletos", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.9", code: "5.1.9", name: "Tarifas de Cartão de Crédito", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  {id: "5.1.10", code: "5.1.10", name: "Tarifas DOC / TED", type: "Resultado Financeiro", parentCode: "5.1", classification: "Conta"},
  
  {id: "5.2", code: "5.2", name: "Receitas Financeiras", type: "Resultado Financeiro", parentCode: "5", classification: "Subgrupo"},
  {id: "5.2.1", code: "5.2.1", name: "Descontos Financeiros Obtidos", type: "Resultado Financeiro", parentCode: "5.2", classification: "Conta"},
  {id: "5.2.2", code: "5.2.2", name: "Indenizações de Seguros", type: "Resultado Financeiro", parentCode: "5.2", classification: "Conta"},
  {id: "5.2.3", code: "5.2.3", name: "Juros Recebidos", type: "Resultado Financeiro", parentCode: "5.2", classification: "Conta"},
  {id: "5.2.4", code: "5.2.4", name: "Multas Recebidas", type: "Resultado Financeiro", parentCode: "5.2", classification: "Conta"},
  {id: "5.2.5", code: "5.2.5", name: "Recuperação de Despesas Financeiras", type: "Resultado Financeiro", parentCode: "5.2", classification: "Conta"},
  {id: "5.2.6", code: "5.2.6", name: "Rendimentos de Aplicações", type: "Resultado Financeiro", parentCode: "5.2", classification: "Conta"},

  // 6. ATIVO
  {id: "6", code: "6", name: "ATIVO", type: "Ativo", classification: "Grupo"},
  {id: "6.1", code: "6.1", name: "ATIVO CIRCULANTE", type: "Ativo", parentCode: "6", classification: "Subgrupo"},
  {id: "6.1.1", code: "6.1.1", name: "Caixa", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  {id: "6.1.2", code: "6.1.2", name: "Bancos", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  {id: "6.1.3", code: "6.1.3", name: "Aplicações Financeiras", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  {id: "6.1.4", code: "6.1.4", name: "Clientes", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  {id: "6.1.5", code: "6.1.5", name: "(-) Provisão para Inadimplência", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  {id: "6.1.6", code: "6.1.6", name: "Estoques", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  {id: "6.1.7", code: "6.1.7", name: "Material para Revenda", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  {id: "6.1.8", code: "6.1.8", name: "Materiais para Aplicação em Serviços", type: "Ativo", parentCode: "6.1", classification: "Conta"},
  
  {id: "6.2", code: "6.2", name: "ATIVO NÃO CIRCULANTE", type: "Ativo", parentCode: "6", classification: "Subgrupo"},
  {id: "6.2.1", code: "6.2.1", name: "Imobilizado", type: "Ativo", parentCode: "6.2", classification: "Conta"},
  {id: "6.2.1.1", code: "6.2.1.1", name: "Veículos", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.2", code: "6.2.1.2", name: "Benfeitorias em Bens de Terceiros", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.3", code: "6.2.1.3", name: "Computadores e Periféricos", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.4", code: "6.2.1.4", name: "Construções - Imóvel Próprio", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.5", code: "6.2.1.5", name: "Imóveis", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.6", code: "6.2.1.6", name: "Móveis, Utensílios e Instalações", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.7", code: "6.2.1.7", name: "Outras Imobilizações", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.8", code: "6.2.1.8", name: "Terrenos", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.1.9", code: "6.2.1.9", name: "Investimentos", type: "Ativo", parentCode: "6.2.1", classification: "Item"},
  {id: "6.2.2", code: "6.2.2", name: "Leasing (direito de uso)", type: "Ativo", parentCode: "6.2", classification: "Conta"},
  {id: "6.2.2.1", code: "6.2.2.1", name: "Leasing - Imóvel", type: "Ativo", parentCode: "6.2.2", classification: "Item"},
  {id: "6.2.2.2", code: "6.2.2.2", name: "Leasing - Máquinas e Equipamentos", type: "Ativo", parentCode: "6.2.2", classification: "Item"},
  {id: "6.2.2.3", code: "6.2.2.3", name: "Leasing - Veículos", type: "Ativo", parentCode: "6.2.2", classification: "Item"},
  {id: "6.2.2.4", code: "6.2.2.4", name: "Leasing - Outras Imobilizações", type: "Ativo", parentCode: "6.2.2", classification: "Item"},
  {id: "6.2.3", code: "6.2.3", name: "(-) Depreciação Acumulada", type: "Ativo", parentCode: "6.2", classification: "Conta"},
  {id: "6.2.3.1", code: "6.2.3.1", name: "Depreciação de Equipamentos", type: "Ativo", parentCode: "6.2.3", classification: "Item"},
  {id: "6.2.3.2", code: "6.2.3.2", name: "Depreciação de Imóveis", type: "Ativo", parentCode: "6.2.3", classification: "Item"},
  {id: "6.2.3.3", code: "6.2.3.3", name: "Depreciação de Móveis e Utensílios", type: "Ativo", parentCode: "6.2.3", classification: "Item"},
  {id: "6.2.3.4", code: "6.2.3.4", name: "Depreciação de Veículos", type: "Ativo", parentCode: "6.2.3", classification: "Item"},

  // 7. PASSIVO
  {id: "7", code: "7", name: "PASSIVO", type: "Passivo", classification: "Grupo"},
  {id: "7.1", code: "7.1", name: "PASSIVO CIRCULANTE", type: "Passivo", parentCode: "7", classification: "Subgrupo"},
  {id: "7.1.1", code: "7.1.1", name: "Empréstimos Bancários", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  {id: "7.1.2", code: "7.1.2", name: "Empréstimos de Outras Instituições", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  {id: "7.1.3", code: "7.1.3", name: "Parcelamento do Simples Nacional", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  {id: "7.1.4", code: "7.1.4", name: "Parcelamentos de Impostos e Encargos", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  {id: "7.1.5", code: "7.1.5", name: "Mútuo a Pagar ao Sócio", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  {id: "7.1.6", code: "7.1.6", name: "INSS sobre Pró-Labore (GPS)", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  {id: "7.1.7", code: "7.1.7", name: "IRRF sobre Pró-Labore (DARF)", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  {id: "7.1.8", code: "7.1.8", name: "Juros Conta Garantida", type: "Passivo", parentCode: "7.1", classification: "Conta"},
  
  {id: "7.2", code: "7.2", name: "PASSIVO NÃO CIRCULANTE", type: "Passivo", parentCode: "7", classification: "Subgrupo"},
  {id: "7.2.1", code: "7.2.1", name: "Parcelamentos LP", type: "Passivo", parentCode: "7.2", classification: "Conta"},
  {id: "7.2.2", code: "7.2.2", name: "Empréstimos LP", type: "Passivo", parentCode: "7.2", classification: "Conta"},

  // 8. PATRIMÔNIO LÍQUIDO
  {id: "8", code: "8", name: "PATRIMÔNIO LÍQUIDO", type: "Patrimônio Líquido", classification: "Grupo"},
  {id: "8.1", code: "8.1", name: "Aporte", type: "Patrimônio Líquido", parentCode: "8", classification: "Subgrupo"},
  {id: "8.2", code: "8.2", name: "Pagamento de Dividendos", type: "Patrimônio Líquido", parentCode: "8", classification: "Subgrupo"},
  {id: "8.3", code: "8.3", name: "Resultado do Exercício", type: "Patrimônio Líquido", parentCode: "8", classification: "Subgrupo"}
];

export const DEFAULT_DRE_STRUCTURE: DRELine[] = [
  { id: "DRE1", label: "Receita Bruta", operation: "+", accountCodes: ["1.1", "1.2"], indent: 0, isMain: true, isVisible: true },
  { id: "DRE2", label: "Deduções e Impostos", operation: "-", accountCodes: ["2.1", "2.2"], indent: 1, isMain: false, isVisible: true },
  { id: "DRE3", label: "(=) Receita Líquida", operation: "=", accountCodes: [], indent: 0, isMain: true, isVisible: true },
  { id: "DRE4", label: "Custos Diretos (CMV/CSP)", operation: "-", accountCodes: ["3.1", "3.2", "3.3"], indent: 1, isMain: false, isVisible: true },
  { id: "DRE5", label: "(=) Lucro Bruto", operation: "=", accountCodes: [], indent: 0, isMain: true, isVisible: true },
  { id: "DRE6", label: "Despesas Operacionais", operation: "-", accountCodes: ["4"], indent: 1, isMain: false, isVisible: true },
  { id: "DRE7", label: "(=) EBITDA / Resultado Op.", operation: "=", accountCodes: [], indent: 0, isMain: true, isVisible: true },
  { id: "DRE8", label: "Resultado Financeiro", operation: "+/-", accountCodes: ["5.1", "5.2"], indent: 1, isMain: false, isVisible: true },
  { id: "DRE9", label: "(=) Lucro Líquido do Exercício", operation: "=", accountCodes: [], indent: 0, isMain: true, isVisible: true }
];

const INITIAL_DB: Database = {
  products: [],
  customers: [],
  users: [{ id: 'u1', code: '001', name: 'Admin', role: 'Admin', status: 'Ativo', contractType: 'PJ', commission: 0 }],
  suppliers: [],
  banks: [
    { id: 'b_gaveta', name: 'Caixa Gaveta', agency: '001', account: 'GAVETA', initialBalance: 0 },
    { id: 'b_cofre', name: 'Cofre', agency: '001', account: 'COFRE', initialBalance: 0 }
  ],
  costCenters: [],
  companies: [{ id: 'comp1', name: 'MINHA EMPRESA', cnpj: '00.000.000/0001-00', type: 'Sede', address: 'Endereço da Empresa' }],
  accounts: ERP_ACCOUNTS,
  sales: [],
  purchases: [],
  purchaseOrders: [],
  expenses: [],
  stockMovements: [],
  categories: [
    { id: 'cat_geral', name: 'Geral', showInPOS: true, type: 'Venda' }
  ],
  locations: [
    { id: 'loc_loja', name: 'Loja Principal', type: 'Loja' }
  ],
  addresses: [],
  movementNatures: [
    { id: 'nat_suprimento', name: 'Suprimento', defaultDirection: 'Entrada' },
    { id: 'nat_venda', name: 'Venda', defaultDirection: 'Saída' },
    { id: 'nat_ajuste', name: 'Ajuste de Inventário', defaultDirection: 'Entrada' }
  ],
  companyInfo: {
    name: 'MINHA EMPRESA', cnpj: '00.000.000/0001-00', cep: '00000-000', address: 'Endereço da Empresa', number: '0', complement: '', phone: '(00) 00000-0000',
    posMode: 'Varejo', enabledModules: ['Dashboard', 'PDV', 'Mesas', 'Produção', 'Atendimento', 'Caixa', 'Produtos', 'Serviços', 'Estoque', 'Categorias', 'Clientes', 'Usuários', 'Fornecedores', 'Despesas', 'Fidelidade', 'Metas', 'Bancos', 'PlanoDeContas', 'Compras', 'RelatorioFinanceiro', 'RelatorioVendas', 'Aniversariantes'],
    headerShortcuts: ['PDV', 'Mesas', 'Produção', 'Atendimento', 'Despesas', 'Dashboard', 'Caixa'],
    loyalty: { enabled: false, pointsPerReal: 1, pointsToCashRatio: 100, minPointsToRedeem: 500 },
    dreStructure: DEFAULT_DRE_STRUCTURE,
    creditEnabled: false,
    creditRules: { alertDays: 30, blockDays: 45, banDays: 60 }
  },
  goalRules: [],
  sellerGoals: [],
  tables: [
    { id: 'balcao', number: 'Balcão', comandas: [] }
  ],
  creditTransactions: [],
  cashierSessions: []
};

export const DB_KEY = 'omnipos_db';
export const DB_VERSION = '32.1.0';

/**
 * Normaliza um valor numérico que pode vir como string, com vírgula ou nulo
 */
const parseNum = (val: any, fallback = 0): number => {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).replace(/\s/g, '').replace('R$', '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
};

/**
 * Normaliza produtos importados de qualquer versão anterior
 */
const sanitizeProduct = (p: any, idx: number): Product => {
  const id = p.id ? String(p.id) : `p_${Date.now()}_${idx}`;
  const name = p.name || p.nome || p.description || p.descricao || `Produto ${idx + 1}`;
  const price = parseNum(p.price ?? p.preco ?? p.valor, 0);
  const costPrice = parseNum(p.costPrice ?? p.custo ?? p.preco_custo ?? p.precoCusto, 0);
  const stock = parseNum(p.stock ?? p.estoque ?? p.quantidade ?? p.qtd, 0);
  const minStock = parseNum(p.minStock ?? p.estoque_minimo ?? p.estoqueMinimo, 0);
  const category = p.category || p.categoria || 'Geral';
  const barcode = p.barcode ? String(p.barcode) : (p.codigo_barras || p.codigoBarras || p.codigo ? String(p.codigo_barras || p.codigoBarras || p.codigo) : '');
  const imageUrl = p.imageUrl || p.imagem || p.foto || '';
  
  let type: 'Insumo' | 'Revenda' | 'Produzido' | 'Serviço' = 'Revenda';
  const rawType = (p.type || p.tipo || '').toString().toLowerCase();
  if (rawType.includes('insumo') || rawType.includes('materia') || rawType.includes('ingrediente')) type = 'Insumo';
  else if (rawType.includes('produz') || rawType.includes('fabric')) type = 'Produzido';
  else if (rawType.includes('servi')) type = 'Serviço';
  else type = 'Revenda';

  const unit = p.unit || p.unidade || 'UN';

  // Lotes de estoque
  let batches: StockBatch[] = [];
  if (Array.isArray(p.batches) && p.batches.length > 0) {
    batches = p.batches.map((b: any, bIdx: number) => ({
      id: b.id ? String(b.id) : `b_${id}_${bIdx}`,
      batchNumber: b.batchNumber || b.numero_lote || b.lote || 'LOTE',
      entryDate: b.entryDate || b.data_entrada || new Date().toISOString(),
      expirationDate: b.expirationDate || b.data_validade || undefined,
      quantity: parseNum(b.quantity ?? b.quantidade, 0),
      costPrice: parseNum(b.costPrice ?? b.custo, costPrice)
    }));
  } else if (stock > 0) {
    batches = [{
      id: `b_init_${id}`,
      batchNumber: p.batch || 'LOTE-INICIAL',
      entryDate: p.entryDate || new Date().toISOString(),
      expirationDate: p.expirationDate || undefined,
      quantity: stock,
      costPrice: costPrice
    }];
  }

  return {
    id,
    name,
    price,
    costPrice,
    stock,
    minStock,
    category,
    barcode,
    imageUrl,
    type,
    unit: unit as any,
    contentPerUnit: p.contentPerUnit ? parseNum(p.contentPerUnit) : undefined,
    contentUnit: p.contentUnit || undefined,
    correctionFactor: p.correctionFactor ? parseNum(p.correctionFactor, 1) : undefined,
    recipe: Array.isArray(p.recipe) ? p.recipe : undefined,
    yieldWeight: p.yieldWeight ? parseNum(p.yieldWeight) : undefined,
    portions: p.portions ? parseNum(p.portions) : undefined,
    preparationTime: p.preparationTime ? parseNum(p.preparationTime) : undefined,
    preparationMode: p.preparationMode || undefined,
    desiredProfitMargin: p.desiredProfitMargin ? parseNum(p.desiredProfitMargin) : undefined,
    supplierId: p.supplierId ? String(p.supplierId) : undefined,
    locationId: p.locationId ? String(p.locationId) : undefined,
    addressId: p.addressId ? String(p.addressId) : undefined,
    batches,
    batch: p.batch || undefined,
    expirationDate: p.expirationDate || undefined,
    entryDate: p.entryDate || undefined
  };
};

/**
 * Normaliza clientes importados
 */
const sanitizeCustomer = (c: any, idx: number): Customer => {
  return {
    id: c.id ? String(c.id) : `c_${Date.now()}_${idx}`,
    name: c.name || c.nome || `Cliente ${idx + 1}`,
    whatsapp: c.whatsapp || c.telefone || c.phone || c.celular || '',
    address: c.address || c.endereco || '',
    cep: c.cep || '',
    number: c.number || c.numero ? String(c.number || c.numero) : '',
    complement: c.complement || c.complemento || '',
    birthDate: c.birthDate || c.dataNascimento || c.data_nascimento || undefined,
    loyaltyPoints: parseNum(c.loyaltyPoints ?? c.pontos, 0),
    creditEnabled: Boolean(c.creditEnabled ?? c.crediarioAtivo ?? false),
    creditLimit: parseNum(c.creditLimit ?? c.limiteCredito ?? c.limite, 0),
    currentDebt: parseNum(c.currentDebt ?? c.saldoDevedor ?? c.divida, 0),
    creditStatus: c.creditStatus || 'Liberado',
    lastCreditPurchase: c.lastCreditPurchase || undefined,
    banUntil: c.banUntil || undefined
  };
};

/**
 * Processa e extrai o banco de dados de qualquer estrutura JSON recebida
 */
export const parseJSONBackup = (rawInput: any): Database => {
  let target = rawInput;

  // 1. Se for string, tenta decodificar (suporta BOM, markdown fences, etc.)
  if (typeof target === 'string') {
    let clean = target.replace(/^\ufeff/, '').trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
    }
    try {
      target = JSON.parse(clean);
      // Caso seja string duplamente codificada
      if (typeof target === 'string') {
        target = JSON.parse(target);
      }
    } catch (err) {
      console.error("JSON parse error:", err);
      throw new Error("Formato de arquivo JSON inválido ou corrompido.");
    }
  }

  if (!target || typeof target !== 'object') {
    throw new Error("O arquivo JSON não contém um objeto ou lista válida.");
  }

  // 2. Extrai de envelopamentos comuns (backups, cloud sync, wrappers)
  if (target.data && typeof target.data === 'object') {
    target = target.data;
  } else if (target.db && typeof target.db === 'object') {
    target = target.db;
  } else if (target.database && typeof target.database === 'object') {
    target = target.database;
  } else if (target.omnipos_db) {
    target = typeof target.omnipos_db === 'string' ? JSON.parse(target.omnipos_db) : target.omnipos_db;
  } else if (target.fastsell_db) {
    target = typeof target.fastsell_db === 'string' ? JSON.parse(target.fastsell_db) : target.fastsell_db;
  } else if (target.backup && typeof target.backup === 'object') {
    target = target.backup;
  } else if (target.state && typeof target.state === 'object') {
    target = target.state;
  }

  // 3. Se a raiz for um Array diretamente, identifica a entidade
  if (Array.isArray(target)) {
    const sample = target[0] || {};
    if (sample.price !== undefined || sample.preco !== undefined || sample.barcode !== undefined || sample.codigo !== undefined) {
      target = { products: target };
    } else if (sample.whatsapp !== undefined || sample.telefone !== undefined || sample.loyaltyPoints !== undefined) {
      target = { customers: target };
    } else if (sample.subtotal !== undefined || sample.total !== undefined || sample.paymentMethod !== undefined) {
      target = { sales: target };
    } else if (sample.amount !== undefined || sample.despesa !== undefined) {
      target = { expenses: target };
    } else if (sample.agency !== undefined || sample.account !== undefined || sample.agencia !== undefined) {
      target = { banks: target };
    } else {
      target = { products: target };
    }
  }

  // 4. Mapeia sinônimos em Português e variantes de nomenclatura
  const mapped: any = { ...target };
  if (!mapped.products && (target.produtos || target.items || target.itens || target.estoque_produtos)) {
    mapped.products = target.produtos || target.items || target.itens || target.estoque_produtos;
  }
  if (!mapped.customers && (target.clientes || target.clients)) {
    mapped.customers = target.clientes || target.clients;
  }
  if (!mapped.users && (target.usuarios || target.usuarios_rh || target.colaboradores || target.vendedores || target.users_list)) {
    mapped.users = target.usuarios || target.usuarios_rh || target.colaboradores || target.vendedores || target.users_list;
  }
  if (!mapped.suppliers && (target.fornecedores || target.fornecedor || target.suppliers_list)) {
    mapped.suppliers = target.fornecedores || target.fornecedor || target.suppliers_list;
  }
  if (!mapped.banks && (target.bancos || target.contasBancarias || target.contas_bancarias)) {
    mapped.banks = target.bancos || target.contasBancarias || target.contas_bancarias;
  }
  if (!mapped.costCenters && (target.centrosDeCusto || target.centros_custo || target.centrosCusto)) {
    mapped.costCenters = target.centrosDeCusto || target.centros_custo || target.centrosCusto;
  }
  if (!mapped.companies && (target.empresas || target.empresaList)) {
    mapped.companies = target.empresas || target.empresaList;
  }
  if (!mapped.accounts && (target.contas || target.planoDeContas || target.plano_contas || target.planoContas)) {
    mapped.accounts = target.contas || target.planoDeContas || target.plano_contas || target.planoContas;
  }
  if (!mapped.sales && (target.vendas || target.pedidos || target.historicoVendas || target.historico_vendas)) {
    mapped.sales = target.vendas || target.pedidos || target.historicoVendas || target.historico_vendas;
  }
  if (!mapped.purchases && (target.compras || target.historicoCompras)) {
    mapped.purchases = target.compras || target.historicoCompras;
  }
  if (!mapped.purchaseOrders && (target.pedidosCompra || target.pedidos_compra || target.ordensCompra)) {
    mapped.purchaseOrders = target.pedidosCompra || target.pedidos_compra || target.ordensCompra;
  }
  if (!mapped.expenses && (target.despesas || target.gastos || target.contasPagar || target.contas_pagar)) {
    mapped.expenses = target.despesas || target.gastos || target.contasPagar || target.contas_pagar;
  }
  if (!mapped.stockMovements && (target.estoqueMovements || target.movimentacoesEstoque || target.movimentacoes || target.movimentacao)) {
    mapped.stockMovements = target.estoqueMovements || target.movimentacoesEstoque || target.movimentacoes || target.movimentacao;
  }
  if (!mapped.cashierSessions && (target.caixa || target.sessoesCaixa || target.caixas || target.fechamentosCaixa)) {
    mapped.cashierSessions = target.caixa || target.sessoesCaixa || target.caixas || target.fechamentosCaixa;
  }
  if (!mapped.categories && (target.categorias || target.categoriaList)) {
    mapped.categories = target.categorias || target.categoriaList;
  }
  if (!mapped.locations && (target.locais || target.locaisEstoque || target.estoqueLocais)) {
    mapped.locations = target.locais || target.locaisEstoque || target.estoqueLocais;
  }
  if (!mapped.addresses && (target.enderecos || target.enderecosEstoque)) {
    mapped.addresses = target.enderecos || target.enderecosEstoque;
  }
  if (!mapped.movementNatures && (target.naturezasMovimentacao || target.naturezas)) {
    mapped.movementNatures = target.naturezasMovimentacao || target.naturezas;
  }
  if (!mapped.companyInfo && (target.empresa || target.dadosEmpresa || target.company_info || target.empresaInfo)) {
    mapped.companyInfo = target.empresa || target.dadosEmpresa || target.company_info || target.empresaInfo;
  }
  if (!mapped.tables && (target.mesas || target.comandas)) {
    mapped.tables = target.mesas || target.comandas;
  }
  if (!mapped.sellerGoals && (target.metas || target.metasVendedores)) {
    mapped.sellerGoals = target.metas || target.metasVendedores;
  }
  if (!mapped.goalRules && (target.regrasMetas || target.regras_metas)) {
    mapped.goalRules = target.regrasMetas || target.regras_metas;
  }
  if (!mapped.creditTransactions && (target.crediario || target.transacoesCrediario)) {
    mapped.creditTransactions = target.crediario || target.transacoesCrediario;
  }
  if (!mapped.backups && (target.pontosRestauracao || target.backupsList)) {
    mapped.backups = target.pontosRestauracao || target.backupsList;
  }

  return sanitizeDB(mapped);
};

/**
 * Garante que o objeto DB tenha todas as propriedades necessárias e dados normalizados
 */
export const sanitizeDB = (imported: any): Database => {
  const base = { ...INITIAL_DB };
  if (!imported || typeof imported !== 'object') return base;

  const result: any = { ...base, ...imported };

  // 1. Normalização de Arrays
  const arrays = [
    'products', 'customers', 'users', 'suppliers', 'banks', 'costCenters', 
    'companies', 'accounts', 'sales', 'purchases', 'purchaseOrders', 
    'expenses', 'stockMovements', 'cashierSessions', 'categories', 
    'locations', 'addresses', 'movementNatures', 'goalRules', 
    'sellerGoals', 'tables', 'creditTransactions', 'backups'
  ];

  arrays.forEach(key => {
    if (!Array.isArray(result[key])) {
      result[key] = Array.isArray(base[key as keyof Database]) ? [...(base[key as keyof Database] as any[])] : [];
    }
  });

  // 2. Normalização detalhada de Produtos
  result.products = result.products.map((p: any, idx: number) => sanitizeProduct(p, idx));

  // 3. Normalização detalhada de Clientes
  result.customers = result.customers.map((c: any, idx: number) => sanitizeCustomer(c, idx));

  // 4. Garante que categorias essenciais existam
  if (result.categories.length === 0) {
    result.categories = [{ id: 'cat_geral', name: 'Geral', showInPOS: true, type: 'Venda' }];
  }

  // 5. Garante que contas contábeis existam para DRE e Financeiro
  if (result.accounts.length === 0) {
    result.accounts = ERP_ACCOUNTS;
  }

  // 6. Garante que locais e naturezas de movimento existam
  if (result.locations.length === 0) {
    result.locations = [{ id: 'loc_loja', name: 'Loja Principal', type: 'Loja' }];
  }
  if (result.movementNatures.length === 0) {
    result.movementNatures = [
      { id: 'nat_suprimento', name: 'Suprimento', defaultDirection: 'Entrada' },
      { id: 'nat_venda', name: 'Venda', defaultDirection: 'Saída' },
      { id: 'nat_ajuste', name: 'Ajuste de Inventário', defaultDirection: 'Entrada' }
    ];
  }

  // 7. Garante que o Balcão exista nas mesas
  if (!result.tables.find((t: any) => t.id === 'balcao')) {
    result.tables = [{ id: 'balcao', number: 'Balcão', comandas: [] }, ...result.tables];
  }

  // 8. Garante que companyInfo exista e todos os módulos padrão estejam presentes
  const allStandardModules = [
    'Dashboard', 'PDV', 'Mesas', 'Produção', 'Atendimento', 'Caixa', 
    'Produtos', 'Serviços', 'Estoque', 'Categorias', 'Clientes', 
    'Usuários', 'Fornecedores', 'Despesas', 'Fidelidade', 'Metas', 
    'Bancos', 'PlanoDeContas', 'Compras', 'RelatorioFinanceiro', 
    'RelatorioVendas', 'Aniversariantes'
  ];

  if (!result.companyInfo || typeof result.companyInfo !== 'object') {
    result.companyInfo = { ...base.companyInfo };
  } else {
    const mergedModules = Array.from(new Set([
      ...(result.companyInfo.enabledModules || allStandardModules),
      'Dashboard', 'PDV', 'Caixa', 'Produtos', 'Clientes', 'Estoque'
    ]));

    result.companyInfo = {
      ...base.companyInfo,
      ...result.companyInfo,
      enabledModules: mergedModules,
      headerShortcuts: result.companyInfo.headerShortcuts || base.companyInfo.headerShortcuts,
      loyalty: { ...base.companyInfo.loyalty, ...(result.companyInfo.loyalty || {}) },
      dreStructure: result.companyInfo.dreStructure && result.companyInfo.dreStructure.length > 0 ? result.companyInfo.dreStructure : DEFAULT_DRE_STRUCTURE
    };
  }

  return result as Database;
};

export const loadDB = (): Database => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    const storedVersion = localStorage.getItem('db_version');
    if (!stored) {
      localStorage.setItem('db_version', DB_VERSION);
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
      return INITIAL_DB;
    }
    const parsed = JSON.parse(stored);
    const sanitized = sanitizeDB(parsed);
    if (storedVersion !== DB_VERSION) {
      localStorage.setItem('db_version', DB_VERSION);
      localStorage.setItem(DB_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (e) {
    console.warn("Failed to load local database, reverting to fallback:", e);
    return INITIAL_DB;
  }
};

export const saveDB = (db: Database) => { 
  localStorage.setItem(DB_KEY, JSON.stringify(db)); 
};

export const resetDB = () => {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem('db_version');
  window.location.reload();
};

export const clearTransactions = (db: Database): Database => {
  return {
    ...db,
    sales: [],
    expenses: [],
    stockMovements: [],
    cashierSessions: [],
    purchaseOrders: [],
    creditTransactions: [],
    banks: db.banks.map(b => ({ ...b, initialBalance: 0 })),
    products: db.products.map(p => ({ ...p, stock: 0, batches: [] })),
    tables: db.tables.map(t => ({ ...t, comandas: [] }))
  };
};