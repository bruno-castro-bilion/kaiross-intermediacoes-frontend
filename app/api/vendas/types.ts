/**
 * Tipos espelhados de vendas-service (OpenAPI 1.0.0).
 * Cobre o ciclo de pedidos do vendedor: checkout, pedidos, reembolsos
 * e eventos de integração com o fornecedor (3Cliques etc.).
 */

export type PedidoStatus =
  | "PENDENTE"
  | "PAGO"
  | "FALHA"
  | "REEMBOLSADO"
  | "CARRINHO_ABANDONADO";

export type TipoIntegracaoFornecedor = "THREE_CLIQUES";

export type FormaPagamento =
  | "PIX"
  | "CREDITO"
  | "BOLETO"
  | "DOIS_CARTOES";

export type FornecedorEventoTipo =
  | "ORDER_CREATED"
  | "SHIPMENT_READY"
  | "ORDER_CANCEL_REFUND"
  | "QUERY_ORDER_STATUS";

export interface PedidoItemView {
  id?: string;
  sellerProdutoId?: string;
  produtoId?: string;
  produtoNome?: string;
  produtoCodigo?: string;
  imagemPrincipalUrl?: string | null;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
}

export interface PedidoView {
  id: string;
  compradorId?: string;
  compradorEmail?: string;
  vendedorId?: string;
  fornecedorId?: string;
  quantidadeTotal?: number;
  valorTotal?: number;
  status?: PedidoStatus;
  formaPagamento?: FormaPagamento | null;
  pagarmeChargeId?: string;
  pagarmeOrderId?: string;
  itens?: PedidoItemView[];
  numeroPedido?: string;
  fornecedor?: TipoIntegracaoFornecedor;
  trackingCode?: string;
  labelUrlA4?: string;
  statusFornecedor?: string;
  // True quando o pedido foi integrado com sucesso ao fornecedor (3cliques etc.).
  integrado?: boolean;
  dataIntegracao?: string;
  dataCriacao?: string;
  pagoEm?: string;
  enviadoEm?: string;
}

export interface RelatorioVendas {
  vendedorId?: string;
  pagos?: number;
  pendentes?: number;
  falhas?: number;
  reembolsados?: number;
  abandonados?: number;
}

export interface FornecedorIntegracaoEvento {
  id?: string;
  pedidoId?: string;
  fornecedor?: TipoIntegracaoFornecedor;
  eventoTipo?: FornecedorEventoTipo;
  requestPayload?: string;
  httpStatus?: number;
  responsePayload?: string;
  erro?: string;
  sucesso?: boolean;
  enviadoEm?: string;
}

export interface StatusFornecedorView {
  fornecedor?: TipoIntegracaoFornecedor;
  numeroPedido?: string;
  shopName?: string;
  orderStatusCodigo?: string;
  orderStatusDescricao?: string;
  expressTime?: string;
  trackNumber?: string;
}
