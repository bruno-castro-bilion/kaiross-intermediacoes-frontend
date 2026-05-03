/**
 * Tipos espelhados de seller-produtos-service (OpenAPI 1.0.0).
 * Vitrine do VENDEDOR: afiliação a produtos do fornecedor + precificação +
 * slug de checkout.
 */

export interface SellerProdutoView {
  id: string;
  vendedorId?: string;
  produtoId?: string;
  fornecedorId?: string;
  precoVenda?: number;
  slugCheckout?: string;
  checkoutUrl?: string;
  ativo?: boolean;
  // true quando o preço atual gera margem inviável e o checkout fica
  // bloqueado pra clientes (split do gateway daria vendedor negativo).
  bloqueado?: boolean;
  dataCriacao?: string;
}

export interface CheckoutDetalhesView {
  slugCheckout: string;
  vendedorId: string;
  produtoId: string;
  fornecedorId: string;
  precoVenda: number;
  nomeProduto: string;
  descricao: string | null;
  sku: string | null;
  imagemPrincipalUrl: string | null;
}

export interface AfiliarProdutoRequest {
  produtoId: string;
  precoVenda: number;
}

export interface AtualizarPrecoRequest {
  precoVenda: number;
}
