import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ProdutoView } from "@/app/api/produtos/types";
import type { CheckoutDetalhesView, SellerProdutoView } from "./types";

/**
 * Composição da vitrine do vendedor: cada item é a afiliação
 * (`SellerProdutoView`) enriquecida com o snapshot atual do produto
 * (`ProdutoView`) — preço sugerido, estoque, imagem etc. vivem em
 * produtos-service e mudam independente da afiliação.
 */
export interface MeuProduto extends SellerProdutoView {
  produto?: ProdutoView;
}

export function useListSellerProdutos() {
  return useQuery<SellerProdutoView[], Error>({
    queryKey: ["seller-produtos", "list"],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const response = await axios.get<
        SellerProdutoView[] | { data?: SellerProdutoView[] }
      >("/api/seller-produtos", { withCredentials: true });
      const payload = response.data;
      if (Array.isArray(payload)) return payload;
      if (
        payload &&
        Array.isArray((payload as { data?: SellerProdutoView[] }).data)
      ) {
        return (payload as { data: SellerProdutoView[] }).data;
      }
      return [];
    },
  });
}

/**
 * Lista os produtos afiliados pelo vendedor já com o snapshot do produto
 * embutido (join client-side). Usa cache individual por produtoId pra que
 * navegação entre lista e detalhe seja instantânea.
 */
export function useListMeusProdutos() {
  const sellerQuery = useListSellerProdutos();
  const sellerProdutos = useMemo(
    () => sellerQuery.data ?? [],
    [sellerQuery.data],
  );

  const produtoQueries = useQueries({
    queries: sellerProdutos.map((sp) => ({
      queryKey: ["produtos", sp.produtoId],
      enabled: !!sp.produtoId,
      staleTime: 60_000,
      queryFn: async () => {
        const response = await axios.get<ProdutoView>(
          `/api/produtos/${sp.produtoId}`,
          { withCredentials: true },
        );
        return response.data;
      },
    })),
  });

  const items = useMemo<MeuProduto[]>(() => {
    return sellerProdutos.map((sp, i) => ({
      ...sp,
      produto: produtoQueries[i]?.data,
    }));
  }, [sellerProdutos, produtoQueries]);

  return {
    items,
    isLoading: sellerQuery.isLoading,
    isError: sellerQuery.isError,
    error: sellerQuery.error,
    isFetching:
      sellerQuery.isFetching || produtoQueries.some((q) => q.isFetching),
    isProdutosFetching: produtoQueries.some((q) => q.isLoading),
    refetch: sellerQuery.refetch,
  };
}

/**
 * Busca uma afiliação específica do vendedor pelo ID.
 *
 * O backend não expõe GET /seller-produtos/{id} — a única forma de
 * resolver é filtrar a listagem do próprio vendedor. Isso vira um
 * "find" em memória, mas como a listagem já está cacheada pela query
 * `seller-produtos / list`, o custo é zero quando o usuário chega na
 * página vindo da grade de Meus Produtos.
 */
export function useGetMeuProdutoById(id?: string) {
  const list = useListSellerProdutos();
  const sellerProduto = useMemo(
    () => (id ? list.data?.find((sp) => sp.id === id) : undefined),
    [list.data, id],
  );

  const produtoQuery = useQuery<ProdutoView | null, Error>({
    queryKey: ["produtos", sellerProduto?.produtoId],
    enabled: !!sellerProduto?.produtoId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await axios.get<ProdutoView>(
        `/api/produtos/${sellerProduto?.produtoId}`,
        { withCredentials: true },
      );
      return response.data ?? null;
    },
  });

  return {
    sellerProduto,
    produto: produtoQuery.data ?? null,
    isLoading: list.isLoading || produtoQuery.isLoading,
    isError: list.isError || produtoQuery.isError,
    error: list.error ?? produtoQuery.error,
    notFound: !list.isLoading && !!id && !sellerProduto,
    refetch: () => {
      list.refetch();
      produtoQuery.refetch();
    },
  };
}

export function useGetSellerProdutoBySlug(slug?: string) {
  return useQuery<CheckoutDetalhesView | null, Error>({
    queryKey: ["seller-produtos", "checkout", slug],
    enabled: !!slug,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await axios.get<CheckoutDetalhesView>(
        `/api/seller-produtos/checkout/${slug}`,
        { withCredentials: true },
      );
      return response.data ?? null;
    },
  });
}
