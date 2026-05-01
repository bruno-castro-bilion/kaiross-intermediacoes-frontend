"use client";

import { Skeleton } from "@/components/ui/skeleton";

/* ─── Sparkline inline ───────────────────────────────────────────────────── */
function MiniSparkline({
  data,
  color,
  testId,
}: {
  data: number[];
  color: string;
  testId?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 220;
  const h = 56;

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" ");
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  const gradId = `refund-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      data-testid={testId}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${gradId})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Linha de stat ───────────────────────────────────────────────────────── */
function RefundStat({
  label,
  value,
  highlight = false,
  testId,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  testId?: string;
}) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const baseId = testId || `refund-stat-${slug}`;

  return (
    <div data-testid={baseId} className="flex flex-col gap-1">
      <span
        data-testid={`${baseId}-label`}
        className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-500)]"
      >
        {label}
      </span>
      <span
        data-testid={`${baseId}-value`}
        data-highlight={highlight ? "true" : "false"}
        className={[
          "mono-num text-[18px] font-bold",
          highlight ? "text-[var(--kai-orange-600)]" : "text-[var(--ink-900)]",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Tipos ───────────────────────────────────────────────────────────────── */
interface RefundChargebackData {
  reembolsos: string;
  vendasReembolsadas: string;
  taxaReembolso: string;
  chargebacks: string;
  totalChargebacks: string;
  taxaChargeback: string;
}

interface RefundChargebackProps {
  data: RefundChargebackData;
  loading?: boolean;
}

/* ─── Componente ─────────────────────────────────────────────────────────── */
export function RefundChargeback({ data, loading }: RefundChargebackProps) {
  const reembolsoSpark = [40, 32, 35, 28, 30, 22, 25, 18, 20, 15, 18];
  const chargebackSpark = [10, 12, 10, 14, 18, 16, 22, 20, 24, 28, 26];

  return (
    <div
      data-testid="refund-chargeback"
      data-loading={loading ? "true" : "false"}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      {/* Reembolsos */}
      <div
        data-testid="refund-chargeback-card-reembolsos"
        className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-6 shadow-[var(--sh-xs)]"
      >
        <div
          data-testid="refund-chargeback-card-reembolsos-header"
          className="mb-4 flex items-center justify-between"
        >
          <h3
            data-testid="refund-chargeback-card-reembolsos-title"
            className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink-900)]"
          >
            Reembolsos
          </h3>
          <span
            data-testid="refund-chargeback-card-reembolsos-status-badge"
            className="inline-flex h-6 items-center rounded-[var(--r-pill)] bg-[var(--kai-success-bg)] px-2.5 text-[12px] font-semibold text-[var(--kai-success)]"
          >
            Saudável
          </span>
        </div>

        <div
          data-testid="refund-chargeback-card-reembolsos-summary"
          className="flex items-flex-end gap-6"
        >
          <div data-testid="refund-chargeback-card-reembolsos-summary-text">
            {loading ? (
              <>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-2 h-7 w-24" />
                <Skeleton className="h-5 w-16" />
              </>
            ) : (
              <>
                <p
                  data-testid="refund-chargeback-card-reembolsos-summary-label"
                  className="mb-1 text-[13px] text-[var(--ink-600)]"
                >
                  Total reembolsado
                </p>
                <div
                  data-testid="refund-chargeback-card-reembolsos-summary-value"
                  className="mono-num text-[26px] font-extrabold tracking-[-0.025em] text-[var(--ink-900)]"
                >
                  R$ 2.450,00
                </div>
                <span
                  data-testid="refund-chargeback-card-reembolsos-summary-delta"
                  className="mt-1.5 inline-flex items-center gap-1 rounded-[var(--r-pill)] bg-[var(--kai-danger-bg)] px-2 py-0.5 text-[12px] font-semibold text-[var(--kai-danger)]"
                >
                  ↓ 12,4%
                </span>
              </>
            )}
          </div>
          <div
            data-testid="refund-chargeback-card-reembolsos-spark-wrapper"
            className="flex-1 ml-4"
          >
            <MiniSparkline
              testId="refund-chargeback-card-reembolsos-sparkline"
              data={reembolsoSpark}
              color="var(--kai-danger)"
            />
          </div>
        </div>

        <div
          data-testid="refund-chargeback-card-reembolsos-stats"
          className="mt-4 flex justify-between border-t border-[var(--ink-200)] pt-4"
        >
          <RefundStat
            testId="refund-chargeback-card-reembolsos-stat-solicitados"
            label="Solicitados"
            value={data.vendasReembolsadas}
          />
          <RefundStat
            testId="refund-chargeback-card-reembolsos-stat-aprovados"
            label="Aprovados"
            value="9"
          />
          <RefundStat
            testId="refund-chargeback-card-reembolsos-stat-negados"
            label="Negados"
            value="3"
          />
          <RefundStat
            testId="refund-chargeback-card-reembolsos-stat-em-analise"
            label="Em análise"
            value="2"
            highlight
          />
        </div>
      </div>

      {/* Chargebacks */}
      <div
        data-testid="refund-chargeback-card-chargebacks"
        className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-6 shadow-[var(--sh-xs)]"
      >
        <div
          data-testid="refund-chargeback-card-chargebacks-header"
          className="mb-4 flex items-center justify-between"
        >
          <h3
            data-testid="refund-chargeback-card-chargebacks-title"
            className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink-900)]"
          >
            Chargebacks
          </h3>
          <span
            data-testid="refund-chargeback-card-chargebacks-status-badge"
            className="inline-flex h-6 items-center rounded-[var(--r-pill)] bg-[var(--kai-warn-bg)] px-2.5 text-[12px] font-semibold text-[var(--kai-warn)]"
          >
            Atenção
          </span>
        </div>

        <div
          data-testid="refund-chargeback-card-chargebacks-summary"
          className="flex items-flex-end gap-6"
        >
          <div data-testid="refund-chargeback-card-chargebacks-summary-text">
            {loading ? (
              <>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-2 h-7 w-24" />
                <Skeleton className="h-5 w-16" />
              </>
            ) : (
              <>
                <p
                  data-testid="refund-chargeback-card-chargebacks-summary-label"
                  className="mb-1 text-[13px] text-[var(--ink-600)]"
                >
                  Total contestado
                </p>
                <div
                  data-testid="refund-chargeback-card-chargebacks-summary-value"
                  className="mono-num text-[26px] font-extrabold tracking-[-0.025em] text-[var(--ink-900)]"
                >
                  R$ 1.158,00
                </div>
                <span
                  data-testid="refund-chargeback-card-chargebacks-summary-delta"
                  className="mt-1.5 inline-flex items-center gap-1 rounded-[var(--r-pill)] bg-[var(--kai-danger-bg)] px-2 py-0.5 text-[12px] font-semibold text-[var(--kai-danger)]"
                >
                  ↑ 4,1%
                </span>
              </>
            )}
          </div>
          <div
            data-testid="refund-chargeback-card-chargebacks-spark-wrapper"
            className="flex-1 ml-4"
          >
            <MiniSparkline
              testId="refund-chargeback-card-chargebacks-sparkline"
              data={chargebackSpark}
              color="var(--kai-warn)"
            />
          </div>
        </div>

        <div
          data-testid="refund-chargeback-card-chargebacks-stats"
          className="mt-4 flex justify-between border-t border-[var(--ink-200)] pt-4"
        >
          <RefundStat
            testId="refund-chargeback-card-chargebacks-stat-abertos"
            label="Abertos"
            value="3"
          />
          <RefundStat
            testId="refund-chargeback-card-chargebacks-stat-contestados"
            label="Contestados"
            value="2"
          />
          <RefundStat
            testId="refund-chargeback-card-chargebacks-stat-perdidos"
            label="Perdidos"
            value="1"
          />
          <RefundStat
            testId="refund-chargeback-card-chargebacks-stat-vencendo"
            label="Vencendo"
            value="1"
            highlight
          />
        </div>
      </div>
    </div>
  );
}
