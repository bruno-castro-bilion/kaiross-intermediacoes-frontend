import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { PedidoView } from "./types";

export function useReembolsarPedido() {
  const queryClient = useQueryClient();
  return useMutation<PedidoView, Error, string>({
    mutationFn: async (pedidoId) => {
      const response = await axios.post<PedidoView>(
        `/api/vendas/pedidos/${pedidoId}/reembolsar`,
        undefined,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (_data, pedidoId) => {
      queryClient.invalidateQueries({ queryKey: ["vendas"] });
      queryClient.invalidateQueries({ queryKey: ["vendas", "pedidos", pedidoId] });
    },
  });
}

export function useNotificarCriacaoFornecedor() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (pedidoId) => {
      const response = await axios.post(
        `/api/vendas/pedidos/${pedidoId}/fornecedor/notificar-criacao`,
        undefined,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (_data, pedidoId) => {
      // Só recarrega o que muda com o reenvio: histórico (nova entrada de
      // ORDER_CREATED), status (pode ter virado disponível) e o próprio
      // pedido (flag integrado). Antes invalidava ["vendas"] inteiro,
      // refazendo listagens e relatórios sem necessidade.
      queryClient.invalidateQueries({
        queryKey: ["vendas", "pedidos", pedidoId, "historico"],
      });
      queryClient.invalidateQueries({
        queryKey: ["vendas", "pedidos", pedidoId, "fornecedor-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["vendas", "pedidos", pedidoId],
      });
    },
  });
}
