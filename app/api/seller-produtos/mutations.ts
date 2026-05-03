import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type {
  AfiliarProdutoRequest,
  AtualizarPrecoRequest,
  SellerProdutoView,
} from "./types";

export function useAfiliarProduto() {
  const queryClient = useQueryClient();
  return useMutation<SellerProdutoView, Error, AfiliarProdutoRequest>({
    mutationFn: async (payload) => {
      const response = await axios.post<SellerProdutoView>(
        "/api/seller-produtos",
        payload,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-produtos"] });
    },
  });
}

export function useAtualizarPrecoVenda() {
  const queryClient = useQueryClient();
  return useMutation<
    SellerProdutoView,
    Error,
    { id: string; precoVenda: number }
  >({
    mutationFn: async ({ id, precoVenda }) => {
      const payload: AtualizarPrecoRequest = { precoVenda };
      const response = await axios.put<SellerProdutoView>(
        `/api/seller-produtos/${id}/preco`,
        payload,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Atualiza o item na cache da listagem imediatamente — não espera
      // o refetch (que pode demorar ou trazer dado stale por algum cache
      // intermediário). O invalidateQueries logo abaixo ainda dispara o
      // refetch pra reconciliar com o servidor.
      queryClient.setQueryData<SellerProdutoView[]>(
        ["seller-produtos", "list"],
        (old) => {
          if (!old) return old;
          return old.map((sp) => (sp.id === data.id ? { ...sp, ...data } : sp));
        },
      );
      queryClient.invalidateQueries({ queryKey: ["seller-produtos"] });
      if (data?.slugCheckout) {
        queryClient.invalidateQueries({
          queryKey: ["seller-produtos", "checkout", data.slugCheckout],
        });
      }
    },
  });
}

export function useExcluirSellerProduto() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id) => {
      const response = await axios.delete<{ success: boolean }>(
        `/api/seller-produtos/${id}`,
        { withCredentials: true },
      );
      return response.data ?? { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-produtos"] });
    },
  });
}

export function useReativarSellerProduto() {
  const queryClient = useQueryClient();
  return useMutation<SellerProdutoView, Error, string>({
    mutationFn: async (id) => {
      const response = await axios.put<SellerProdutoView>(
        `/api/seller-produtos/${id}/reativar`,
        undefined,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-produtos"] });
      if (data?.slugCheckout) {
        queryClient.invalidateQueries({
          queryKey: ["seller-produtos", "checkout", data.slugCheckout],
        });
      }
    },
  });
}
