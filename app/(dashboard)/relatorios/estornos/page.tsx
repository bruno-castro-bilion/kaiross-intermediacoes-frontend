"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
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
  RefreshCcw,
  DollarSign,
  AlertTriangle,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  useListPedidosVendedor,
  useRelatorioVendedor,
} from "@/app/api/vendas/queries";
import { useReembolsarPedido } from "@/app/api/vendas/mutations";
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

function bucketDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function fmtDate(ts: number | null): string {
  if (ts === null) return "—";
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function slugifyId(value: string | undefined | null): string {
  if (!value) return "unknown";
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "unknown";
}

export default function RelatoriosEstornos() {
  const [periodLabel, setPeriodLabel] = useState("30 dias");
  const period =
    PERIODS.find((p) => p.label === periodLabel) ?? PERIODS[1];
  const userId = useAuthStore((s) => s.user?.id);

  const relatorio = useRelatorioVendedor(userId);
  const pedidos = useListPedidosVendedor(userId);
  const reembolsar = useReembolsarPedido();

  const isLoading = relatorio.isLoading || pedidos.isLoading;
  const isError = relatorio.isError || pedidos.isError;
  const error = relatorio.error ?? pedidos.error;

  const cutoffMs = useMemo(
    () => Date.now() - period.days * 24 * 60 * 60 * 1000,
    [period.days],
  );

  const { reembolsadosPeriodo, pagosPeriodo } = useMemo(() => {
    const all = (pedidos.data ?? []).filter((p) => {
      const ts = pedidoTimestamp(p);
      return ts !== null && ts >= cutoffMs;
    });
    return {
      reembolsadosPeriodo: all.filter((p) => p.status === "REEMBOLSADO"),
      pagosPeriodo: all.filter((p) => p.status === "PAGO"),
    };
  }, [pedidos.data, cutoffMs]);

  const kpis = useMemo(() => {
    const totalEstornos = reembolsadosPeriodo.length;
    const valor = reembolsadosPeriodo.reduce(
      (acc, p) => acc + (p.valorTotal ?? 0),
      0,
    );
    const denominador = totalEstornos + pagosPeriodo.length;
    const taxa = denominador > 0 ? (totalEstornos / denominador) * 100 : 0;
    return {
      totalEstornos,
      valor,
      taxa,
    };
  }, [reembolsadosPeriodo, pagosPeriodo]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();
    reembolsadosPeriodo.forEach((p) => {
      const ts = pedidoTimestamp(p);
      if (ts === null) return;
      const key = bucketDate(ts);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries())
      .map(([date, estornos]) => ({ date, estornos }))
      .sort((a, b) => {
        const parse = (s: string) => {
          const [d, m] = s.split("/").map(Number);
          return new Date(new Date().getFullYear(), m - 1, d).getTime();
        };
        return parse(a.date) - parse(b.date);
      });
  }, [reembolsadosPeriodo]);

  const lista = useMemo(() => {
    return [...reembolsadosPeriodo].sort((a, b) => {
      const ta = pedidoTimestamp(a) ?? 0;
      const tb = pedidoTimestamp(b) ?? 0;
      return tb - ta;
    });
  }, [reembolsadosPeriodo]);

  // Pedidos PAGOS no período que ainda podem ser reembolsados — mostramos
  // como bloco separado já que essa é uma ação real do vendedor (POST
  // /api/vendas/pedidos/{id}/reembolsar).
  const pagosReembolsaveis = useMemo(() => {
    return [...pagosPeriodo]
      .sort((a, b) => {
        const ta = pedidoTimestamp(a) ?? 0;
        const tb = pedidoTimestamp(b) ?? 0;
        return tb - ta;
      })
      .slice(0, 10);
  }, [pagosPeriodo]);

  const handleReembolsar = (pedido: PedidoView) => {
    if (!pedido.id) return;
    if (
      !confirm(
        `Confirmar reembolso do pedido ${pedido.numeroPedido ?? pedido.id} no valor de ${fmtBRL(
          pedido.valorTotal ?? 0,
        )}? Esta ação aciona o estorno na pagar.me.`,
      )
    )
      return;
    reembolsar.mutate(pedido.id, {
      onSuccess: () => {
        toast.success("Estorno solicitado com sucesso.");
      },
      onError: (err) => {
        const apiMessage =
          (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          )?.response?.data?.error ??
          (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          )?.response?.data?.message ??
          err.message;
        toast.error(apiMessage || "Erro ao reembolsar pedido.");
      },
    });
  };

  return (
    <motion.div
      data-testid="relatorios-estornos-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Estornos"
        subtitle="Acompanhe estornos processados e dispare reembolsos para pedidos pagos."
        actions={
          <div
            data-testid="relatorios-estornos-period-selector"
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
                data-testid={`relatorios-estornos-button-period-${slugifyId(p.label)}`}
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
          data-testid="relatorios-estornos-state-no-session"
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
          data-testid="relatorios-estornos-state-loading"
          style={{
            padding: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--kai-orange)" }} />
          <span data-testid="relatorios-estornos-loading-text" style={{ fontSize: 13, color: "var(--ink-500)" }}>
            Carregando estornos…
          </span>
        </div>
      ) : isError ? (
        <div
          data-testid="relatorios-estornos-state-error"
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
          <p data-testid="relatorios-estornos-error-title" className="font-semibold text-[var(--ink-900)]">
            Não foi possível carregar os estornos
          </p>
          <p data-testid="relatorios-estornos-error-message" className="text-sm text-[var(--ink-500)]">
            {error?.message ?? "Tente novamente em instantes."}
          </p>
          <button
            data-testid="relatorios-estornos-button-retry"
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
          <div data-testid="relatorios-estornos-section-kpis" className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <StatCard
              icon={RefreshCcw}
              label="Estornos no período"
              value={String(kpis.totalEstornos)}
            />
            <StatCard
              icon={DollarSign}
              label="Valor estornado"
              value={kpis.valor > 0 ? fmtBRLShort(kpis.valor) : "R$ 0"}
              highlight
            />
            <StatCard
              icon={AlertTriangle}
              label="Taxa de estorno"
              value={`${kpis.taxa.toFixed(1).replace(".", ",")}%`}
            />
            <StatCard
              icon={TrendingDown}
              label="Histórico total"
              value={String(relatorio.data?.reembolsados ?? 0)}
            />
          </div>

          <div
            data-testid="relatorios-estornos-section-chart"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
              marginBottom: 20,
            }}
          >
            <h3 data-testid="relatorios-estornos-chart-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
              Estornos por dia
            </h3>
            {chartData.length === 0 ? (
              <div
                data-testid="relatorios-estornos-chart-empty"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Nenhum estorno no período selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
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
                    allowDecimals={false}
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
                    dataKey="estornos"
                    fill="#DC2626"
                    radius={[6, 6, 0, 0]}
                    name="Estornos"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div
            data-testid="relatorios-estornos-section-historico"
            style={{
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              data-testid="relatorios-estornos-historico-header"
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--ink-200)",
              }}
            >
              <h3 data-testid="relatorios-estornos-historico-title" style={{ fontSize: 16, fontWeight: 700 }}>
                Histórico de estornos
              </h3>
            </div>
            <div
              data-testid="relatorios-estornos-historico-table-head"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr",
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
              <div data-testid="relatorios-estornos-historico-th-pedido">Pedido</div>
              <div data-testid="relatorios-estornos-historico-th-cliente">Cliente</div>
              <div data-testid="relatorios-estornos-historico-th-produto">Produto</div>
              <div data-testid="relatorios-estornos-historico-th-valor">Valor</div>
              <div data-testid="relatorios-estornos-historico-th-data">Data</div>
            </div>
            {lista.length === 0 ? (
              <div
                data-testid="relatorios-estornos-historico-empty"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Nenhum estorno registrado no período.
              </div>
            ) : (
              lista.map((p) => {
                const principalItem = p.itens?.[0];
                const ts = pedidoTimestamp(p);
                const rowId = slugifyId(p.id);
                return (
                  <div
                    data-testid={`relatorios-estornos-row-${rowId}`}
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr",
                      gap: 16,
                      padding: "14px 20px",
                      alignItems: "center",
                      borderBottom: "1px solid var(--ink-100)",
                    }}
                  >
                    <div data-testid={`relatorios-estornos-row-${rowId}-pedido-cell`} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span
                        data-testid={`relatorios-estornos-row-${rowId}-numero-pedido`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {p.numeroPedido ?? `#${p.id.slice(0, 8)}`}
                      </span>
                      <span
                        data-testid={`relatorios-estornos-row-${rowId}-status-badge`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: 18,
                          padding: "0 6px",
                          borderRadius: 999,
                          background: "var(--kai-danger-bg, #fde0e0)",
                          color: "var(--kai-danger, #dc2626)",
                          fontSize: 10,
                          fontWeight: 700,
                          width: "fit-content",
                        }}
                      >
                        Reembolsado
                      </span>
                    </div>
                    <span
                      data-testid={`relatorios-estornos-row-${rowId}-cliente`}
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.compradorEmail ?? "—"}
                    </span>
                    <span
                      data-testid={`relatorios-estornos-row-${rowId}-produto`}
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
                      data-testid={`relatorios-estornos-row-${rowId}-valor`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "var(--kai-danger, #dc2626)",
                      }}
                    >
                      {fmtBRL(p.valorTotal ?? 0)}
                    </span>
                    <span data-testid={`relatorios-estornos-row-${rowId}-data`} style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {fmtDate(ts)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div
            data-testid="relatorios-estornos-section-elegiveis"
            style={{
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              overflow: "hidden",
            }}
          >
            <div
              data-testid="relatorios-estornos-elegiveis-header"
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--ink-200)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div data-testid="relatorios-estornos-elegiveis-header-text">
                <h3 data-testid="relatorios-estornos-elegiveis-title" style={{ fontSize: 16, fontWeight: 700 }}>
                  Pedidos pagos elegíveis para reembolso
                </h3>
                <p
                  data-testid="relatorios-estornos-elegiveis-subtitle"
                  style={{
                    fontSize: 12,
                    color: "var(--ink-500)",
                    marginTop: 4,
                  }}
                >
                  Disparar reembolso aciona o estorno na pagar.me e marca o
                  pedido como REEMBOLSADO. A ação é irreversível.
                </p>
              </div>
            </div>
            <div
              data-testid="relatorios-estornos-elegiveis-table-head"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr 1fr",
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
              <div data-testid="relatorios-estornos-elegiveis-th-pedido">Pedido</div>
              <div data-testid="relatorios-estornos-elegiveis-th-cliente">Cliente</div>
              <div data-testid="relatorios-estornos-elegiveis-th-produto">Produto</div>
              <div data-testid="relatorios-estornos-elegiveis-th-valor">Valor</div>
              <div data-testid="relatorios-estornos-elegiveis-th-pago-em">Pago em</div>
              <div data-testid="relatorios-estornos-elegiveis-th-acoes" />
            </div>
            {pagosReembolsaveis.length === 0 ? (
              <div
                data-testid="relatorios-estornos-elegiveis-empty"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Nenhum pedido pago no período.
              </div>
            ) : (
              pagosReembolsaveis.map((p) => {
                const principalItem = p.itens?.[0];
                const ts = p.pagoEm ? new Date(p.pagoEm).getTime() : null;
                const isThisOne =
                  reembolsar.isPending && reembolsar.variables === p.id;
                const rowId = slugifyId(p.id);
                return (
                  <div
                    data-testid={`relatorios-estornos-elegivel-row-${rowId}`}
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr 1fr",
                      gap: 16,
                      padding: "14px 20px",
                      alignItems: "center",
                      borderBottom: "1px solid var(--ink-100)",
                    }}
                  >
                    <span
                      data-testid={`relatorios-estornos-elegivel-row-${rowId}-numero-pedido`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {p.numeroPedido ?? `#${p.id.slice(0, 8)}`}
                    </span>
                    <span
                      data-testid={`relatorios-estornos-elegivel-row-${rowId}-cliente`}
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.compradorEmail ?? "—"}
                    </span>
                    <span
                      data-testid={`relatorios-estornos-elegivel-row-${rowId}-produto`}
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
                      data-testid={`relatorios-estornos-elegivel-row-${rowId}-valor`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "var(--kai-success)",
                      }}
                    >
                      {fmtBRL(p.valorTotal ?? 0)}
                    </span>
                    <span data-testid={`relatorios-estornos-elegivel-row-${rowId}-pago-em`} style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {fmtDate(ts)}
                    </span>
                    <button
                      data-testid={`relatorios-estornos-elegivel-row-${rowId}-button-reembolsar`}
                      onClick={() => handleReembolsar(p)}
                      disabled={reembolsar.isPending}
                      style={{
                        height: 32,
                        padding: "0 12px",
                        borderRadius: "var(--r-md)",
                        border: "1px solid var(--kai-danger-bg, #fde0e0)",
                        background: "var(--kai-danger-bg, #fde0e0)",
                        color: "var(--kai-danger, #dc2626)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: reembolsar.isPending ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        opacity: reembolsar.isPending ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      {isThisOne ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Estornando…
                        </>
                      ) : (
                        <>
                          <RefreshCcw size={12} /> Reembolsar
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
