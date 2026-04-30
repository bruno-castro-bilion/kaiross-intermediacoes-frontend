import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  FornecedorIntegracaoEvento,
  PedidoView,
  RelatorioVendas,
  StatusFornecedorView,
} from "./types";

export function useRelatorioVendedor(vendedorId?: string) {
  return useQuery<RelatorioVendas, Error>({
    queryKey: ["vendas", "relatorio", vendedorId],
    enabled: !!vendedorId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await axios.get<RelatorioVendas>(
        `/api/vendas/relatorios/vendedor/${vendedorId}`,
        { withCredentials: true },
      );
      return response.data ?? {};
    },
  });
}

export function useListPedidosVendedor(vendedorId?: string) {
  return useQuery<PedidoView[], Error>({
    queryKey: ["vendas", "pedidos", "vendedor", vendedorId],
    enabled: !!vendedorId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await axios.get<PedidoView[]>(
        `/api/vendas/pedidos/vendedor/${vendedorId}`,
        { withCredentials: true },
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });
}

export function useGetPedido(id?: string) {
  return useQuery<PedidoView | null, Error>({
    queryKey: ["vendas", "pedidos", id],
    enabled: !!id,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await axios.get<PedidoView>(
        `/api/vendas/pedidos/${id}`,
        { withCredentials: true },
      );
      return response.data ?? null;
    },
  });
}

export function useHistoricoFornecedor(pedidoId?: string) {
  return useQuery<FornecedorIntegracaoEvento[], Error>({
    queryKey: ["vendas", "pedidos", pedidoId, "historico"],
    enabled: !!pedidoId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await axios.get<FornecedorIntegracaoEvento[]>(
        `/api/vendas/pedidos/${pedidoId}/fornecedor/historico`,
        { withCredentials: true },
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });
}

export function useStatusFornecedor(pedidoId?: string) {
  return useQuery<StatusFornecedorView | null, Error>({
    queryKey: ["vendas", "pedidos", pedidoId, "fornecedor-status"],
    enabled: !!pedidoId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await axios.get<StatusFornecedorView>(
        `/api/vendas/pedidos/${pedidoId}/fornecedor/status`,
        { withCredentials: true },
      );
      return response.data ?? null;
    },
  });
}
