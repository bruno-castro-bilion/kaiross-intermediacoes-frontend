"use client";

import { Skeleton } from "@/components/ui/skeleton";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface RecentSale {
  id: string;
  client: string;
  product: string;
  date: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  amount: string;
}

interface RecentSalesProps {
  data: RecentSale[];
  loading?: boolean;
}

/* ─── Mapeamento de status ───────────────────────────────────────────────── */
const STATUS_MAP: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  Pago: {
    label: "Pago",
    bg: "var(--kai-success-bg)",
    color: "var(--kai-success)",
  },
  Pendente: {
    label: "Pendente",
    bg: "var(--kai-warn-bg)",
    color: "var(--kai-warn)",
  },
  Cancelado: {
    label: "Cancelado",
    bg: "var(--kai-danger-bg)",
    color: "var(--kai-danger)",
  },
  Enviado: {
    label: "Enviado",
    bg: "var(--kai-info-bg)",
    color: "var(--kai-info)",
  },
};

const sanitizeId = (s: string) =>
  s.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* ─── Componente ─────────────────────────────────────────────────────────── */
export function RecentSales({ data, loading }: RecentSalesProps) {
  return (
    <div
      data-testid="recent-sales"
      data-loading={loading ? "true" : "false"}
      className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-6 shadow-[var(--sh-xs)]"
    >
      {/* Cabeçalho */}
      <div
        data-testid="recent-sales-header"
        className="mb-4 flex items-center justify-between"
      >
        <h3
          data-testid="recent-sales-title"
          className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink-900)]"
        >
          Pedidos recentes
        </h3>
        <a
          data-testid="recent-sales-link-view-all"
          className="cursor-pointer text-[13px] font-semibold text-[var(--kai-orange-600)] hover:underline"
        >
          Ver todos →
        </a>
      </div>

      {/* Tabela */}
      <div
        data-testid="recent-sales-table-wrapper"
        className="overflow-x-auto"
      >
        {/* Cabeçalho da tabela */}
        <div
          data-testid="recent-sales-table-head"
          className="grid gap-4 border-b border-[var(--ink-200)] px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-500)]"
          style={{
            gridTemplateColumns: "1.2fr 1.4fr 2fr 1fr 1fr 0.4fr",
          }}
        >
          <div data-testid="recent-sales-table-head-pedido">Pedido</div>
          <div data-testid="recent-sales-table-head-cliente">Cliente</div>
          <div data-testid="recent-sales-table-head-produto">Produto</div>
          <div data-testid="recent-sales-table-head-valor">Valor</div>
          <div data-testid="recent-sales-table-head-status">Status</div>
          <div data-testid="recent-sales-table-head-actions" />
        </div>

        {/* Linhas */}
        <div data-testid="recent-sales-table-body">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  data-testid={`recent-sales-row-skeleton-${i}`}
                  className="grid gap-4 border-b border-[var(--ink-100)] px-3 py-3.5"
                  style={{ gridTemplateColumns: "1.2fr 1.4fr 2fr 1fr 1fr 0.4fr" }}
                >
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              ))
            : data.map((sale) => {
                const status = STATUS_MAP[sale.badge] ?? STATUS_MAP["Pendente"];
                const rowId = `recent-sales-row-${sanitizeId(sale.id)}`;
                return (
                  <div
                    key={sale.id}
                    data-testid={rowId}
                    className="grid gap-4 items-center border-b border-[var(--ink-100)] px-3 py-3.5 text-[14px] last:border-0 hover:bg-[var(--ink-50)]"
                    style={{
                      gridTemplateColumns: "1.2fr 1.4fr 2fr 1fr 1fr 0.4fr",
                    }}
                  >
                    {/* ID + data */}
                    <div
                      data-testid={`${rowId}-pedido`}
                      className="flex flex-col gap-0.5"
                    >
                      <span
                        data-testid={`${rowId}-pedido-id`}
                        className="mono-num text-[13px] font-semibold text-[var(--ink-900)]"
                      >
                        {sale.id}
                      </span>
                      <span
                        data-testid={`${rowId}-pedido-date`}
                        className="text-[11px] text-[var(--ink-500)]"
                      >
                        {sale.date}
                      </span>
                    </div>

                    {/* Cliente */}
                    <div
                      data-testid={`${rowId}-cliente`}
                      className="font-medium text-[var(--ink-900)] truncate"
                    >
                      {sale.client}
                    </div>

                    {/* Produto */}
                    <div
                      data-testid={`${rowId}-produto`}
                      className="truncate text-[var(--ink-700)]"
                    >
                      {sale.product}
                    </div>

                    {/* Valor */}
                    <div
                      data-testid={`${rowId}-valor`}
                      className="mono-num font-semibold text-[var(--ink-900)]"
                    >
                      {sale.amount}
                    </div>

                    {/* Status badge */}
                    <div data-testid={`${rowId}-status`}>
                      <span
                        data-testid={`${rowId}-status-badge`}
                        data-status={sale.badge}
                        className="inline-flex items-center rounded-[var(--r-pill)] px-2.5 py-0.5 text-[12px] font-semibold"
                        style={{
                          background: status.bg,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Ação */}
                    <button
                      data-testid={`${rowId}-button-actions`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink-500)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)] transition-all"
                    >
                      <span className="text-base">···</span>
                    </button>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
