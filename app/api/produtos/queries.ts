import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";
import type { ListProdutosParams, ProdutoView } from "./types";

export function useListProdutos(params: ListProdutosParams = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  return useQuery<ProdutoView[], Error>({
    queryKey: ["produtos", "list", page, size],
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await axios.get<ProdutoView[] | { data?: ProdutoView[] }>(
        "/api/produtos",
        { params: { page, size }, withCredentials: true },
      );
      const payload = response.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray((payload as { data?: ProdutoView[] }).data)) {
        return (payload as { data: ProdutoView[] }).data;
      }
      return [];
    },
  });
}

export function useGetProdutoById(id?: string) {
  return useQuery<ProdutoView | null, Error>({
    queryKey: ["produtos", id],
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await axios.get<ProdutoView | { data?: ProdutoView }>(
        `/api/produtos/${id}`,
        { withCredentials: true },
      );
      const payload = response.data;
      if (!payload) return null;
      if ((payload as { data?: ProdutoView }).data) {
        return (payload as { data: ProdutoView }).data;
      }
      if ((payload as ProdutoView).id) return payload as ProdutoView;
      return null;
    },
  });
}
