/**
 * Tipos espelhados de produtos-service (OpenAPI 1.0.0).
 * Catálogo do FORNECEDOR exposto na vitrine para o vendedor escolher
 * o que afiliar via seller-produtos-service.
 */

export type TipoIntegracaoFornecedor = "THREE_CLIQUES" | "SABR" | "MANUAL";

export interface ProdutoView {
  id: string;
  fornecedorId?: string;
  fornecedor?: TipoIntegracaoFornecedor;
  externalId?: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  ean?: string;
  precoSugerido: number;
  estoque?: number;
  sku?: string;
  marca?: string;
  cor?: string;
  tamanho?: string;
  ncm?: string;
  pesoKg?: number;
  larguraCm?: number;
  alturaCm?: number;
  comprimentoCm?: number;
  garantiaDias?: number;
  urlYoutube?: string;
  imagemPrincipalUrl?: string;
  ativo?: boolean;
  version?: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ListProdutosParams {
  page?: number;
  size?: number;
}
