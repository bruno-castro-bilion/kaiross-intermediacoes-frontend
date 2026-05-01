"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
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
  { label: "12 meses", days: 365 },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const fmtBRLShort = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(1)}K`;
  return fmtBRL(n);
};

function pedidoTimestamp(p: PedidoView): number | null {
  const raw = p.pagoEm ?? p.dataCriacao;
  if (!raw) return null;
  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function bucketDate(ts: number, days: number): string {
  const d = new Date(ts);
  if (days <= 30) {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  if (days <= 90) {
    const day = d.getDate();
    const monday = new Date(d);
    monday.setDate(day - ((d.getDay() + 6) % 7));
    return monday.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
  return d.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" });
}

function slugifyId(value: string | undefined | null): string {
  if (!value) return "unknown";
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "unknown";
}

export default function RelatoriosVendas() {
  const [periodLabel, setPeriodLabel] = useState("30 dias");
  const period =
    PERIODS.find((p) => p.label === periodLabel) ?? PERIODS[1];
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const [exporting, setExporting] = useState(false);

  const relatorio = useRelatorioVendedor(userId);
  const pedidos = useListPedidosVendedor(userId);

  const handleExportPdf = async () => {
    if (!pedidos.data) {
      toast.error("Carregue os pedidos antes de exportar.");
      return;
    }
    setExporting(true);
    try {
      const [{ pdf }, { RelatorioVendasDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/reports/relatorio-vendas-pdf"),
      ]);
      const periodoTo = new Date();
      const periodoFrom = new Date(periodoTo);
      periodoFrom.setDate(periodoTo.getDate() - period.days);
      const blob = await pdf(
        <RelatorioVendasDocument
          data={{
            periodoLabel: period.label,
            periodoFrom,
            periodoTo,
            geradoEm: new Date(),
            pedidos: pedidos.data ?? [],
            relatorio: relatorio.data,
            kpis,
            chartData,
            performancePorProduto,
          }}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kaiross-relatorio-vendas-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast.error("Não foi possível gerar o PDF.");
    } finally {
      setExporting(false);
    }
  };

  const isLoading = relatorio.isLoading || pedidos.isLoading;
  const isError = relatorio.isError || pedidos.isError;
  const error = relatorio.error ?? pedidos.error;

  const cutoffMs = useMemo(
    () => Date.now() - period.days * 24 * 60 * 60 * 1000,
    [period.days],
  );

  // Filtra apenas pedidos PAGOS dentro da janela escolhida.
  const pedidosPagosNoPeriodo = useMemo(() => {
    return (pedidos.data ?? []).filter((p) => {
      if (p.status !== "PAGO") return false;
      const ts = pedidoTimestamp(p);
      return ts !== null && ts >= cutoffMs;
    });
  }, [pedidos.data, cutoffMs]);

  const kpis = useMemo(() => {
    const receita = pedidosPagosNoPeriodo.reduce(
      (acc, p) => acc + (p.valorTotal ?? 0),
      0,
    );
    const vendas = pedidosPagosNoPeriodo.length;
    const ticket = vendas > 0 ? receita / vendas : 0;
    const compradores = new Set<string>();
    pedidosPagosNoPeriodo.forEach((p) => {
      const key = p.compradorId ?? p.compradorEmail;
      if (key) compradores.add(key);
    });
    return {
      receita,
      vendas,
      ticket,
      clientes: compradores.size,
    };
  }, [pedidosPagosNoPeriodo]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, { revenue: number; orders: number }>();
    pedidosPagosNoPeriodo.forEach((p) => {
      const ts = pedidoTimestamp(p);
      if (ts === null) return;
      const key = bucketDate(ts, period.days);
      const slot = buckets.get(key) ?? { revenue: 0, orders: 0 };
      slot.revenue += p.valorTotal ?? 0;
      slot.orders += 1;
      buckets.set(key, slot);
    });
    return Array.from(buckets.entries())
      .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => {
        // datas vêm em pt-BR: parse para ordenar
        const parse = (label: string) => {
          const parts = label.split("/");
          if (parts.length === 2) {
            const [d, m] = parts.map(Number);
            return new Date(new Date().getFullYear(), m - 1, d).getTime();
          }
          if (parts.length === 3) {
            const [d, m, y] = parts.map(Number);
            return new Date(2000 + y, m - 1, d).getTime();
          }
          return 0;
        };
        return parse(a.date) - parse(b.date);
      });
  }, [pedidosPagosNoPeriodo, period.days]);

  const performancePorProduto = useMemo(() => {
    const stats = new Map<
      string,
      { sales: number; revenue: number; ticket: number; produtoId?: string }
    >();
    pedidosPagosNoPeriodo.forEach((p) => {
      (p.itens ?? []).forEach((it) => {
        const nome = it.produtoNome?.trim() || "Produto sem nome";
        const slot = stats.get(nome) ?? {
          sales: 0,
          revenue: 0,
          ticket: 0,
          produtoId: it.produtoId,
        };
        slot.sales += it.quantidade ?? 0;
        slot.revenue += it.valorTotal ?? 0;
        stats.set(nome, slot);
      });
    });
    return Array.from(stats.entries())
      .map(([prod, v]) => ({
        prod,
        sales: v.sales,
        revenue: v.revenue,
        ticket: v.sales > 0 ? v.revenue / v.sales : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);
  }, [pedidosPagosNoPeriodo]);

  return (
    <motion.div
      data-testid="relatorios-vendas-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Relatório de Vendas"
        subtitle="Acompanhe o desempenho das suas vendas ao longo do tempo."
        actions={
          <div data-testid="relatorios-vendas-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div
              data-testid="relatorios-vendas-period-selector"
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
                  data-testid={`relatorios-vendas-button-period-${slugifyId(p.label)}`}
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
            <button
              data-testid="relatorios-vendas-button-export"
              onClick={handleExportPdf}
              disabled={exporting || isLoading || !pedidos.data}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 36,
                padding: "0 14px",
                borderRadius: "var(--r-md)",
                border: 0,
                background: "var(--kai-orange)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: exporting || isLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: exporting || isLoading ? 0.6 : 1,
              }}
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              {exporting ? "Gerando..." : "Exportar PDF"}
            </button>
          </div>
        }
      />

      {!userId ? (
        <div
          data-testid="relatorios-vendas-state-no-session"
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
          data-testid="relatorios-vendas-state-loading"
          style={{
            padding: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--kai-orange)" }}
          />
          <span data-testid="relatorios-vendas-loading-text" style={{ fontSize: 13, color: "var(--ink-500)" }}>
            Carregando seus pedidos…
          </span>
        </div>
      ) : isError ? (
        <div
          data-testid="relatorios-vendas-state-error"
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
          <p data-testid="relatorios-vendas-error-title" className="font-semibold text-[var(--ink-900)]">
            Não foi possível carregar o relatório
          </p>
          <p data-testid="relatorios-vendas-error-message" className="text-sm text-[var(--ink-500)]">
            {error?.message ?? "Tente novamente em instantes."}
          </p>
          <button
            data-testid="relatorios-vendas-button-retry"
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
          <div data-testid="relatorios-vendas-section-kpis" className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <StatCard
              icon={DollarSign}
              label="Receita total"
              value={kpis.receita > 0 ? fmtBRLShort(kpis.receita) : "R$ 0"}
              highlight
            />
            <StatCard
              icon={ShoppingCart}
              label="Total de vendas"
              value={String(kpis.vendas)}
            />
            <StatCard
              icon={TrendingUp}
              label="Ticket médio"
              value={kpis.ticket > 0 ? fmtBRL(kpis.ticket) : "—"}
            />
            <StatCard
              icon={Users}
              label="Compradores únicos"
              value={String(kpis.clientes)}
            />
          </div>

          <div
            data-testid="relatorios-vendas-section-chart"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
              marginBottom: 20,
            }}
          >
            <div
              data-testid="relatorios-vendas-chart-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h3 data-testid="relatorios-vendas-chart-title" style={{ fontSize: 16, fontWeight: 700 }}>
                Evolução da receita
              </h3>
              <span data-testid="relatorios-vendas-chart-points-info" style={{ fontSize: 12, color: "var(--ink-500)" }}>
                {chartData.length === 0
                  ? "Nenhum pedido pago no período."
                  : `${chartData.length} ${chartData.length === 1 ? "ponto" : "pontos"} no gráfico`}
              </span>
            </div>
            {chartData.length === 0 ? (
              <div
                data-testid="relatorios-vendas-chart-empty"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Sem vendas pagas para o período selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  {/* @ts-ignore */}
                  <defs>
                    {/* @ts-ignore */}
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      {/* @ts-ignore */}
                      <stop offset="5%" stopColor="#FF6B1A" stopOpacity={0.25} />
                      {/* @ts-ignore */}
                      <stop offset="95%" stopColor="#FF6B1A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(v) =>
                      typeof v === "number" ? fmtBRLShort(v) : `${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--ink-0)",
                      border: "1px solid var(--ink-200)",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                    formatter={(val, name) => {
                      if (name === "revenue")
                        return [fmtBRL(Number(val)), "Receita"];
                      return [Number(val), "Pedidos"];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF6B1A"
                    strokeWidth={2.5}
                    fill="url(#revGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div
            data-testid="relatorios-vendas-section-performance"
            style={{
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              overflow: "hidden",
            }}
          >
            <div
              data-testid="relatorios-vendas-performance-header"
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--ink-200)",
              }}
            >
              <h3 data-testid="relatorios-vendas-performance-title" style={{ fontSize: 16, fontWeight: 700 }}>
                Performance por produto
              </h3>
            </div>
            <div
              data-testid="relatorios-vendas-performance-table-head"
              style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 1fr 1fr 1fr",
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
              <div data-testid="relatorios-vendas-performance-th-produto">Produto</div>
              <div data-testid="relatorios-vendas-performance-th-unidades">Unidades</div>
              <div data-testid="relatorios-vendas-performance-th-receita">Receita</div>
              <div data-testid="relatorios-vendas-performance-th-preco-medio">Preço médio</div>
            </div>
            {performancePorProduto.length === 0 ? (
              <div
                data-testid="relatorios-vendas-performance-empty"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Sem dados de produtos vendidos no período.
              </div>
            ) : (
              performancePorProduto.map((row) => {
                const rowId = slugifyId(row.prod);
                return (
                  <div
                    data-testid={`relatorios-vendas-row-${rowId}`}
                    key={row.prod}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2.5fr 1fr 1fr 1fr",
                      gap: 16,
                      padding: "14px 20px",
                      alignItems: "center",
                      borderBottom: "1px solid var(--ink-100)",
                    }}
                  >
                    <span data-testid={`relatorios-vendas-row-${rowId}-produto`} style={{ fontWeight: 600 }}>{row.prod}</span>
                    <span data-testid={`relatorios-vendas-row-${rowId}-unidades`} style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {row.sales}
                    </span>
                    <span
                      data-testid={`relatorios-vendas-row-${rowId}-receita`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "var(--kai-success)",
                      }}
                    >
                      {fmtBRL(row.revenue)}
                    </span>
                    <span data-testid={`relatorios-vendas-row-${rowId}-preco-medio`} style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {fmtBRL(row.ticket)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {relatorio.data && (
            <div
              data-testid="relatorios-vendas-section-historico"
              style={{
                marginTop: 16,
                padding: 16,
                background: "var(--ink-50)",
                border: "1px dashed var(--ink-200)",
                borderRadius: "var(--r-md)",
                fontSize: 12,
                color: "var(--ink-600)",
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span data-testid="relatorios-vendas-historico-text">
                <strong data-testid="relatorios-vendas-historico-label">Histórico total</strong> (todos os tempos): pagos{" "}
                <strong data-testid="relatorios-vendas-historico-pagos">{relatorio.data.pagos ?? 0}</strong> · pendentes{" "}
                <strong data-testid="relatorios-vendas-historico-pendentes">{relatorio.data.pendentes ?? 0}</strong> · falhas{" "}
                <strong data-testid="relatorios-vendas-historico-falhas">{relatorio.data.falhas ?? 0}</strong> · reembolsados{" "}
                <strong data-testid="relatorios-vendas-historico-reembolsados">{relatorio.data.reembolsados ?? 0}</strong> ·
                abandonados <strong data-testid="relatorios-vendas-historico-abandonados">{relatorio.data.abandonados ?? 0}</strong>
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
