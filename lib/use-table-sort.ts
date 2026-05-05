import { useMemo, useState } from "react";
import type { SortState } from "@/components/sortable-header";

// Hook leve pra ordenação client-side de listas. Recebe os items e um
// dicionário de comparators por chave. Estado interno: qual coluna,
// qual direção (asc/desc/null). null = sem ordenação, devolve a lista
// original. Toggling: asc → desc → null → asc.
//
// Uso típico em uma página de listagem:
//
//   const { sorted, sort, setSort } = useTableSort(pedidos, {
//     numero:  (a, b) => (a.numeroPedido ?? "").localeCompare(b.numeroPedido ?? ""),
//     data:    (a, b) => +new Date(a.dataCriacao ?? 0) - +new Date(b.dataCriacao ?? 0),
//     cliente: (a, b) => (a.clienteNome ?? "").localeCompare(b.clienteNome ?? ""),
//   }, { key: "data", dir: "desc" });
export function useTableSort<T, K extends string>(
  items: T[],
  comparators: Record<K, (a: T, b: T) => number>,
  initial?: SortState<K>,
) {
  const [sort, setSort] = useState<SortState<K>>(
    initial ?? { key: null, dir: null },
  );

  const sorted = useMemo(() => {
    if (!sort.key || !sort.dir) return items;
    const cmp = comparators[sort.key];
    if (!cmp) return items;
    const out = [...items].sort(cmp);
    return sort.dir === "desc" ? out.reverse() : out;
  }, [items, sort, comparators]);

  return { sorted, sort, setSort };
}
