"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

/* ─── Sparkline SVG inline ──────────────────────────────────────────────── */
interface SparklineProps {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}

function Sparkline({ data, color = "var(--kai-orange)", w = 100, h = 40 }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 2) - 1}`)
    .join(" ");
  const fillPts = `0,${h} ${pts} ${w},${h}`;

  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="absolute bottom-3 right-3 opacity-60"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
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

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
export interface StatsCardData {
  title: string;
  value: string;
  percent: string;
  icon: LucideIcon;
  sparkData?: number[];
  sparkColor?: string;
}

interface StatsCardsProps {
  data: StatsCardData[];
  loading?: boolean;
  hideBadge?: boolean;
  showBalance?: boolean;
}

/* ─── Componente ─────────────────────────────────────────────────────────── */

export function StatsCards({
  data,
  loading,
  hideBadge = false,
  showBalance = true,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(loading ? (Array.from({ length: 4 }) as undefined[]) : data).map(
        (card, index) => {
          if (loading || !card) {
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-[22px] shadow-[var(--sh-xs)]"
              >
                <Skeleton className="mb-3 h-4 w-28" />
                <Skeleton className="mb-2 h-8 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            );
          }

          const isNegative = card.percent.startsWith("-");
          const sparkColor = card.sparkColor ?? "var(--kai-orange)";

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="relative overflow-hidden rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-[22px] shadow-[var(--sh-xs)] transition-all hover:-translate-y-px hover:shadow-[var(--sh-md)]"
            >
              {/* Label com ícone */}
              <div className="mb-[14px] flex items-center gap-2.5 text-[14px] font-medium text-[var(--ink-600)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--kai-orange-50)] text-[var(--kai-orange-600)]">
                  <card.icon size={16} />
                </span>
                {card.title}
              </div>

              {/* Valor principal */}
              <div
                className="mono-num mb-[6px] text-[30px] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink-900)]"
                style={{
                  filter: !showBalance ? "blur(8px)" : "none",
                  transition: "filter 0.2s ease",
                  userSelect: !showBalance ? "none" : "auto",
                }}
              >
                {card.value}
              </div>

              {/* Delta */}
              {!hideBadge && (
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-[var(--r-pill)] px-2.5 py-1 text-[12px] font-semibold",
                      isNegative
                        ? "bg-[var(--kai-danger-bg)] text-[var(--kai-danger)]"
                        : "bg-[var(--kai-success-bg)] text-[var(--kai-success)]",
                    ].join(" ")}
                  >
                    {isNegative ? "↓" : "↑"} {card.percent.replace("-", "")}%
                  </span>
                  <span className="text-[12px] text-[var(--ink-500)]">vs. ontem</span>
                </div>
              )}

              {/* Sparkline */}
              {card.sparkData && (
                <Sparkline data={card.sparkData} color={sparkColor} />
              )}
            </motion.div>
          );
        }
      )}
    </div>
  );
}
