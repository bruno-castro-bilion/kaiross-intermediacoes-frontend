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
