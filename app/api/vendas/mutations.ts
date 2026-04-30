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
