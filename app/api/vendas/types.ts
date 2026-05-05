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
  vendedorId?: string;
  fornecedorId?: string;
  clienteId?: string;
  // Nome do cliente master (vem do upsert no checkout). Null em pedidos
  // antigos sem cliente_id ou quando a tabela clientes não tem nome.
  // É o único identificador do comprador exposto pelo vendas-service —
  // email/CPF/telefone vivem no usuarios-service.
  clienteNome?: string | null;
  quantidadeTotal?: number;
  valorTotal?: number;
  statusPagamento?: PedidoStatus;
  formaPagamento?: FormaPagamento | null;
  pagarmeChargeId?: string;
  pagarmeOrderId?: string;
  itens?: PedidoItemView[];
  numeroPedido?: string;
  fornecedor?: TipoIntegracaoFornecedor;
  codigoRastreio?: string;
  labelUrlA4?: string;
  statusFornecedor?: string;
  // Quando statusFornecedor foi sincronizado com a 3cliques pela última vez.
  dataAtualizacaoStatusFornecedor?: string;
  // True quando o pedido foi integrado com sucesso ao fornecedor (3cliques etc.).
  integrado?: boolean;
  dataIntegracao?: string;
  dataCriacao?: string;
  dataPagamento?: string;
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
