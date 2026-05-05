import type { PedidoView } from "@/app/api/vendas/types";

export type PedidoUiStatus =
  | "pendente"
  | "pago"
  | "enviado"
  | "entregue"
  | "cancelado-fornecedor"
  | "reembolsado"
  | "falha"
  | "abandonado";

// statusFornecedor vem do backend como nome do enum StatusFornecedor (EM_SEPARACAO, ENVIADO, etc).
// Mantemos os códigos crus ("2","3","4","5") como fallback porque pedidos antigos
// na base ainda podem ter o código bruto antes do enum entrar.
export function derivePedidoUiStatus(p: PedidoView): PedidoUiStatus {
  if (p.statusPagamento === "REEMBOLSADO") return "reembolsado";
  if (p.statusPagamento === "FALHA") return "falha";
  if (p.statusPagamento === "CARRINHO_ABANDONADO") return "abandonado";
  if (p.statusPagamento === "PENDENTE") return "pendente";

  switch (p.statusFornecedor) {
    case "ENVIADO":
    case "3":
      return "enviado";
    case "CONCLUIDO":
    case "4":
      return "entregue";
    case "CANCELADO":
    case "5":
      return "cancelado-fornecedor";
    case "EM_SEPARACAO":
    case "2":
      return "pago";
  }

  if (p.codigoRastreio || p.enviadoEm) return "enviado";
  return "pago";
}
