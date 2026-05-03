"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Flame,
  Heart,
  Star,
  Layers,
  TrendingUp,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { useListProdutos } from "@/app/api/produtos/queries";
import type { ProdutoView } from "@/app/api/produtos/types";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23eef2f7' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='18' text-anchor='middle' dominant-baseline='middle'%3ESem imagem%3C/text%3E%3C/svg%3E";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function ProductCardEditorial({ p }: { p: ProdutoView }) {
  const cat = p.categoria?.trim() || "Geral";
  const img = p.imagemPrincipalUrl?.trim() || PLACEHOLDER_IMG;
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-[var(--sh-md)] hover:-translate-y-0.5">
      <div
        style={{
          position: "relative",
          height: 200,
          background: "var(--ink-100)",
          overflow: "hidden",
        }}
      >
        <img
          src={img}
          alt={p.nome}
          referrerPolicy="no-referrer"
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {typeof p.estoque === "number" && p.estoque > 0 ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 22,
                padding: "0 9px",
                borderRadius: 999,
                background: "var(--ink-900)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {p.estoque} em estoque
            </span>
          ) : (
            <span />
          )}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "white",
              background: "rgba(0,0,0,0.45)",
              padding: "3px 6px",
              borderRadius: 4,
              letterSpacing: ".08em",
            }}
          >
            {p.sku ?? "PRODUCT"}
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            fontSize: 11,
            fontWeight: 700,
            color: "white",
            background: "rgba(0,0,0,0.55)",
            padding: "4px 8px",
            borderRadius: 4,
            textTransform: "uppercase",
            letterSpacing: ".08em",
          }}
        >
          {cat}
        </div>
      </div>

      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
          {p.nome}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 12,
            color: "var(--ink-600)",
          }}
        >
          <Star size={12} style={{ color: "var(--kai-orange)", fill: "var(--kai-orange)" }} />
          <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>
            {p.marca ?? p.fornecedor ?? "Kaiross"}
          </span>
          {p.ean ? <span>· EAN {p.ean}</span> : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px dashed var(--ink-200)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span
              style={{
                fontSize: 10,
                color: "var(--ink-500)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Preço de Custo
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--kai-orange-600)",
                fontFamily: "var(--font-mono)",
                lineHeight: 1.2,
              }}
            >
              {fmtBRL(p.precoSugerido ?? 0)}
            </span>
          </div>

          <Link href={`/vitrine-de-produtos/${p.id}`}>
            <button
              style={{
                height: 34,
                padding: "0 14px",
                borderRadius: "var(--r-md)",
                background: "var(--kai-orange)",
                color: "white",
                border: 0,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Começar a vender
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const NOVIDADES_DAYS = 30;

export default function VitrineDeProtudos() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [novidadesOnly, setNovidadesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // Buscamos uma página grande do backend e fazemos filtro/paginação
  // client-side — o produtos-service ainda não suporta busca por nome
  // ou categoria, e não retorna total para paginação real.
  const { data, isLoading, isError, error, refetch, isFetching } =
    useListProdutos({ page: 0, size: 100 });

  const produtos: ProdutoView[] = useMemo(() => data ?? [], [data]);

  // [{ id, label, count }] derivado dos produtos. "todas" sempre primeiro.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    produtos.forEach((p) => {
      const c = p.categoria?.trim();
      if (!c) return;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    const list = Array.from(counts.entries())
      .map(([label, count]) => ({ id: label.toLowerCase(), label, count }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return [
      { id: "todas", label: "Todos", count: produtos.length },
      ...list,
    ];
  }, [produtos]);

  const activeCategory = categories.find((c) => c.id === filter) ?? categories[0];

  const novidadesCutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - NOVIDADES_DAYS);
    return d.getTime();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return produtos.filter((p) => {
      const matchSearch =
        !q ||
        p.nome.toLowerCase().includes(q) ||
        (p.categoria ?? "").toLowerCase().includes(q) ||
        (p.marca ?? "").toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q);
      const matchFilter =
        filter === "todas" ||
        (p.categoria ?? "").toLowerCase() === filter.toLowerCase();
      const matchStock = !inStockOnly || (p.estoque ?? 0) > 0;
      const matchNovidades =
        !novidadesOnly ||
        (p.dataCriacao ? new Date(p.dataCriacao).getTime() >= novidadesCutoff : false);
      return matchSearch && matchFilter && matchStock && matchNovidades;
    });
  }, [produtos, search, filter, inStockOnly, novidadesOnly, novidadesCutoff]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    const ativos = produtos.filter((p) => p.ativo !== false).length;
    const comEstoque = produtos.filter(
      (p) => typeof p.estoque === "number" && p.estoque > 0,
    ).length;
    const maiorPreco = produtos.reduce(
      (acc, p) => (p.precoSugerido > acc ? p.precoSugerido : acc),
      0,
    );
    return {
      total: ativos,
      comEstoque,
      maiorPreco,
    };
  }, [produtos]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Vitrine de Produtos"
        subtitle="Explore o catálogo dos fornecedores e escolha qual produto vender no seu checkout."
        actions={
          <>
            <button
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--ink-200)",
                background: "var(--ink-0)",
                color: "var(--ink-700)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <Heart size={14} /> Favoritos
            </button>
            <button
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: "var(--r-md)",
                border: 0,
                background: "var(--kai-orange)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <Sparkles size={14} /> Recomendados pra mim
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard
          icon={Layers}
          label="Total de produtos"
          value={String(stats.total)}
        />
        <StatCard
          icon={TrendingUp}
          label="Maior preço sugerido"
          value={stats.maiorPreco > 0 ? fmtBRL(stats.maiorPreco) : "—"}
          highlight
        />
        <StatCard
          icon={Flame}
          label="Com estoque disponível"
          value={`${stats.comEstoque} produtos`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr] items-start">
        <aside className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-3.5 lg:sticky lg:top-4">
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: ".08em",
              color: "var(--ink-500)",
              textTransform: "uppercase",
              margin: "6px 8px 10px",
            }}
          >
            Categorias
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {categories.map((c) => {
              const isActive = filter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setFilter(c.id);
                    setPage(1);
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    background: isActive ? "var(--kai-orange-50)" : "transparent",
                    color: isActive ? "var(--kai-orange-600)" : "var(--ink-700)",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "background .12s, color .12s",
                  }}
                >
                  <span style={{ textTransform: "capitalize" }}>{c.label}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: isActive ? "var(--kai-orange-600)" : "var(--ink-500)",
                    }}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: 12,
              background: "var(--ink-50)",
              borderRadius: 10,
              marginTop: 14,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".06em",
                color: "var(--ink-500)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Filtros
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                color: "var(--ink-700)",
                padding: "4px 0",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                style={{ accentColor: "var(--kai-orange)" }}
              />
              Em estoque
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                color: "var(--ink-700)",
                padding: "4px 0",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={novidadesOnly}
                onChange={(e) => {
                  setNovidadesOnly(e.target.checked);
                  setPage(1);
                }}
                style={{ accentColor: "var(--kai-orange)" }}
              />
              Novidades
            </label>
          </div>
        </aside>

        <div>
          <div
            className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-3.5 mb-4"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: 40,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 14px",
                background: "var(--ink-50)",
                border: "1px solid var(--ink-200)",
                borderRadius: "var(--r-pill)",
              }}
            >
              <Search size={16} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar produtos por nome, marca ou SKU..."
                style={{
                  border: 0,
                  outline: 0,
                  flex: 1,
                  font: "inherit",
                  background: "transparent",
                  color: "var(--ink-900)",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: "var(--ink-600)",
              margin: "0 4px 12px",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>
              {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
            </span>{" "}
            em{" "}
            <span style={{ color: "var(--kai-orange-600)", fontWeight: 600 }}>
              {activeCategory.label}
            </span>
          </div>

          {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--kai-orange)" }}
          />
          <p className="text-sm text-[var(--ink-500)]">Carregando produtos…</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--ink-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={28} style={{ color: "var(--kai-error, #dc2626)" }} />
          </div>
          <div>
            <p className="font-semibold text-[var(--ink-900)]">
              Não foi possível carregar a vitrine
            </p>
            <p className="text-sm text-[var(--ink-500)] mt-1">
              {error?.message ?? "Tente novamente em instantes."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: "var(--r-md)",
              border: 0,
              background: "var(--kai-orange)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: isFetching ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: isFetching ? 0.6 : 1,
            }}
          >
            {isFetching ? "Tentando novamente…" : "Tentar novamente"}
          </button>
        </div>
      ) : slice.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--ink-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Search size={28} style={{ color: "var(--ink-400)" }} />
          </div>
          <div>
            <p className="font-semibold text-[var(--ink-900)]">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-[var(--ink-500)] mt-1">
              Tente ajustar os filtros ou a busca.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setFilter("todas");
              setInStockOnly(false);
              setNovidadesOnly(false);
            }}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              color: "var(--ink-700)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Limpar filtros
          </button>
        </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 18,
              }}
            >
              {slice.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <ProductCardEditorial p={p} />
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && !isError && total > 0 && (
            <div className="mt-5 rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] overflow-hidden">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                perPage={perPage}
                onPage={setPage}
                onPerPage={(n) => {
                  setPerPage(n);
                  setPage(1);
                }}
                label="produtos"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
