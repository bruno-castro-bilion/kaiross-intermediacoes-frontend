"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart,
  TrendingDown,
  DollarSign,
  Percent,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { SortableHeader } from "@/components/sortable-header";
import { useTableSort } from "@/lib/use-table-sort";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  useListPedidosVendedor,
  useRelatorioVendedor,
} from "@/app/api/vendas/queries";
import type { PedidoView } from "@/app/api/vendas/types";

const PERIODS: { label: string; days: number }[] = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "3 meses", days: 90 },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const fmtBRLShort = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(1)}K`;
  return fmtBRL(n);
};

function pedidoTimestamp(p: PedidoView): number | null {
  const raw = p.dataCriacao;
  if (!raw) return null;
  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const min = Math.floor(diffMs / 60_000);
  if (min < 60) return `há ${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  const months = Math.floor(days / 30);
  return `há ${months}m`;
}

function bucketDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function RelatoriosAbandono() {
  const [periodLabel, setPeriodLabel] = useState("30 dias");
  const period =
    PERIODS.find((p) => p.label === periodLabel) ?? PERIODS[1];
  const userId = useAuthStore((s) => s.user?.id);

  const relatorio = useRelatorioVendedor(userId);
  const pedidos = useListPedidosVendedor(userId);

  const isLoading = relatorio.isLoading || pedidos.isLoading;
  const isError = relatorio.isError || pedidos.isError;
  const error = relatorio.error ?? pedidos.error;

  const cutoffMs = useMemo(
    () => Date.now() - period.days * 24 * 60 * 60 * 1000,
    [period.days],
  );

  const { abandonadosPeriodo, pagosPeriodo, allInPeriodo } = useMemo(() => {
    const all = (pedidos.data ?? []).filter((p) => {
      const ts = pedidoTimestamp(p);
      return ts !== null && ts >= cutoffMs;
    });
    return {
      abandonadosPeriodo: all.filter((p) => p.statusPagamento === "CARRINHO_ABANDONADO"),
      pagosPeriodo: all.filter((p) => p.statusPagamento === "PAGO"),
      allInPeriodo: all,
    };
  }, [pedidos.data, cutoffMs]);

  const kpis = useMemo(() => {
    const abandonados = abandonadosPeriodo.length;
    const pagos = pagosPeriodo.length;
    const total = abandonados + pagos;
    const taxa = total > 0 ? (abandonados / total) * 100 : 0;
    const receitaPerdida = abandonadosPeriodo.reduce(
      (acc, p) => acc + (p.valorTotal ?? 0),
      0,
    );
    return {
      abandonados,
      taxa,
      receitaPerdida,
      total,
    };
  }, [abandonadosPeriodo, pagosPeriodo]);

  const chartData = useMemo(() => {
    const buckets = new Map<
      string,
      { abandonados: number; pagos: number }
    >();
    allInPeriodo.forEach((p) => {
      const ts = pedidoTimestamp(p);
      if (ts === null) return;
      const key = bucketDate(ts);
      const slot = buckets.get(key) ?? { abandonados: 0, pagos: 0 };
      if (p.statusPagamento === "CARRINHO_ABANDONADO") slot.abandonados += 1;
      if (p.statusPagamento === "PAGO") slot.pagos += 1;
      buckets.set(key, slot);
    });
    return Array.from(buckets.entries())
      .map(([date, v]) => ({ date, abandonados: v.abandonados, pagos: v.pagos }))
      .sort((a, b) => {
        const parse = (s: string) => {
          const [d, m] = s.split("/").map(Number);
          return new Date(new Date().getFullYear(), m - 1, d).getTime();
        };
        return parse(a.date) - parse(b.date);
      });
  }, [allInPeriodo]);

  type AbandonoSortKey = "cliente" | "produto" | "valor" | "quantidade" | "quando";
  const abandonoComparators = useMemo<Record<AbandonoSortKey, (a: PedidoView, b: PedidoView) => number>>(() => ({
    cliente:    (a, b) => (a.clienteNome ?? "").localeCompare(b.clienteNome ?? ""),
    produto:    (a, b) => (a.itens?.[0]?.produtoNome ?? "").localeCompare(b.itens?.[0]?.produtoNome ?? ""),
    valor:      (a, b) => (a.valorTotal ?? 0) - (b.valorTotal ?? 0),
    quantidade: (a, b) => (a.quantidadeTotal ?? 0) - (b.quantidadeTotal ?? 0),
    quando:     (a, b) => (pedidoTimestamp(a) ?? 0) - (pedidoTimestamp(b) ?? 0),
  }), []);
  const { sorted: recentSorted, sort: abandonoSort, setSort: setAbandonoSort } =
    useTableSort<PedidoView, AbandonoSortKey>(abandonadosPeriodo, abandonoComparators, { key: "quando", dir: "desc" });
  const recent = useMemo(() => recentSorted.slice(0, 25), [recentSorted]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Abandono de Carrinho"
        subtitle="Identifique e recupere clientes que não finalizaram a compra."
        actions={
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-pill)",
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriodLabel(p.label)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--r-pill)",
                  border: 0,
                  background:
                    periodLabel === p.label ? "var(--ink-900)" : "transparent",
                  color:
                    periodLabel === p.label ? "white" : "var(--ink-600)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {!userId ? (
        <div
          style={{
            padding: 32,
            background: "var(--ink-0)",
            border: "1px solid var(--ink-200)",
            borderRadius: "var(--r-lg)",
            textAlign: "center",
            color: "var(--ink-500)",
          }}
        >
          Sessão inválida — faça login novamente.
        </div>
      ) : isLoading ? (
        <div
          style={{
            padding: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--kai-orange)" }} />
          <span style={{ fontSize: 13, color: "var(--ink-500)" }}>
            Carregando carrinhos abandonados…
          </span>
        </div>
      ) : isError ? (
        <div
          style={{
            padding: 32,
            background: "var(--ink-0)",
            border: "1px solid var(--ink-200)",
            borderRadius: "var(--r-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
          }}
        >
          <AlertCircle size={28} style={{ color: "var(--kai-danger, #dc2626)" }} />
          <p className="font-semibold text-[var(--ink-900)]">
            Não foi possível carregar o relatório
          </p>
          <p className="text-sm text-[var(--ink-500)]">
            {error?.message ?? "Tente novamente em instantes."}
          </p>
          <button
            onClick={() => {
              relatorio.refetch();
              pedidos.refetch();
            }}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: "var(--r-md)",
              border: 0,
              background: "var(--kai-orange)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <StatCard
              icon={ShoppingCart}
              label="Carrinhos abandonados"
              value={String(kpis.abandonados)}
            />
            <StatCard
              icon={Percent}
              label="Taxa de abandono"
              value={`${kpis.taxa.toFixed(1).replace(".", ",")}%`}
            />
            <StatCard
              icon={DollarSign}
              label="Receita perdida"
              value={kpis.receitaPerdida > 0 ? fmtBRLShort(kpis.receitaPerdida) : "R$ 0"}
              highlight
            />
            <StatCard
              icon={TrendingDown}
              label="Total no período"
              value={String(kpis.total)}
            />
          </div>

          <div
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
              Abandonados vs. Pagos
            </h3>
            {chartData.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Sem dados para o período selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--ink-500)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--ink-500)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--ink-0)",
                      border: "1px solid var(--ink-200)",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey="abandonados"
                    fill="#FF6B1A"
                    radius={[6, 6, 0, 0]}
                    name="Abandonados"
                  />
                  <Bar
                    dataKey="pagos"
                    fill="#16A34A"
                    radius={[6, 6, 0, 0]}
                    name="Pagos"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div
            style={{
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--ink-200)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                Carrinhos abandonados recentes
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 2.5fr 1fr 1fr 1fr",
                gap: 16,
                padding: "10px 20px",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ink-500)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                borderBottom: "1px solid var(--ink-200)",
              }}
            >
              <SortableHeader label="Cliente"    sortKey="cliente"    current={abandonoSort} onChange={setAbandonoSort} />
              <SortableHeader label="Produto"    sortKey="produto"    current={abandonoSort} onChange={setAbandonoSort} />
              <SortableHeader label="Valor"      sortKey="valor"      current={abandonoSort} onChange={setAbandonoSort} />
              <SortableHeader label="Quantidade" sortKey="quantidade" current={abandonoSort} onChange={setAbandonoSort} />
              <SortableHeader label="Quando"     sortKey="quando"     current={abandonoSort} onChange={setAbandonoSort} />
            </div>
            {recent.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Nenhum carrinho abandonado no período.
              </div>
            ) : (
              recent.map((p) => {
                const principalItem = p.itens?.[0];
                const ts = pedidoTimestamp(p);
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 2.5fr 1fr 1fr 1fr",
                      gap: 16,
                      padding: "14px 20px",
                      alignItems: "center",
                      borderBottom: "1px solid var(--ink-100)",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.clienteNome ?? "—"}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--ink-700)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {principalItem?.produtoNome ?? "Produto"}
                      {p.itens && p.itens.length > 1
                        ? ` +${p.itens.length - 1}`
                        : ""}
                    </span>
                    <span
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
                    >
                      {fmtBRL(p.valorTotal ?? 0)}
                    </span>
                    <span
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                    >
                      {p.quantidadeTotal ?? 0}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {ts ? relativeTime(ts) : "—"}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {relatorio.data && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "var(--ink-50)",
                border: "1px dashed var(--ink-200)",
                borderRadius: "var(--r-md)",
                fontSize: 12,
                color: "var(--ink-600)",
              }}
            >
              <strong>Histórico total:</strong>{" "}
              {relatorio.data.abandonados ?? 0} carrinhos abandonados em todos
              os tempos.
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
