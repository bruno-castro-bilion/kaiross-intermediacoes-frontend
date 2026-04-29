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

/* ─── Componente ─────────────────────────────────────────────────────────── */
export function RecentSales({ data, loading }: RecentSalesProps) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-6 shadow-[var(--sh-xs)]">
      {/* Cabeçalho */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink-900)]">
          Pedidos recentes
        </h3>
        <a className="cursor-pointer text-[13px] font-semibold text-[var(--kai-orange-600)] hover:underline">
          Ver todos →
        </a>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        {/* Cabeçalho da tabela */}
        <div
          className="grid gap-4 border-b border-[var(--ink-200)] px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-500)]"
          style={{
            gridTemplateColumns: "1.2fr 1.4fr 2fr 1fr 1fr 0.4fr",
          }}
        >
          <div>Pedido</div>
          <div>Cliente</div>
          <div>Produto</div>
          <div>Valor</div>
          <div>Status</div>
          <div />
        </div>

        {/* Linhas */}
        <div>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
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
                return (
                  <div
                    key={sale.id}
                    className="grid gap-4 items-center border-b border-[var(--ink-100)] px-3 py-3.5 text-[14px] last:border-0 hover:bg-[var(--ink-50)]"
                    style={{
                      gridTemplateColumns: "1.2fr 1.4fr 2fr 1fr 1fr 0.4fr",
                    }}
                  >
                    {/* ID + data */}
                    <div className="flex flex-col gap-0.5">
                      <span className="mono-num text-[13px] font-semibold text-[var(--ink-900)]">
                        {sale.id}
                      </span>
                      <span className="text-[11px] text-[var(--ink-500)]">
                        {sale.date}
                      </span>
                    </div>

                    {/* Cliente */}
                    <div className="font-medium text-[var(--ink-900)] truncate">
                      {sale.client}
                    </div>

                    {/* Produto */}
                    <div className="truncate text-[var(--ink-700)]">
                      {sale.product}
                    </div>

                    {/* Valor */}
                    <div className="mono-num font-semibold text-[var(--ink-900)]">
                      {sale.amount}
                    </div>

                    {/* Status badge */}
                    <div>
                      <span
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
                    <button className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink-500)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)] transition-all">
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
