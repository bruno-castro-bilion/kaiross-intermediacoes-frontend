"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RevenueIndicatorProps {
  value: number;
  showBalance?: boolean;
}

function formatGoalAbbr(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return value.toString();
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function RevenueIndicator({ value = 6254.54, showBalance = true }: RevenueIndicatorProps) {
  let goal = 10000;
  if (value > 1000000) goal = value > 10000000 ? Math.ceil(value / 10000000) * 10000000 : 10000000;
  else if (value > 100000) goal = 1000000;
  else if (value > 10000) goal = 100000;

  const [progress, setProgress] = useState(0);
  const percent = Math.min((value / goal) * 100, 100);

  useEffect(() => {
    const t = setTimeout(() => setProgress(percent), 150);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div
      data-testid="revenue-indicator"
      className="flex items-center gap-3 rounded-2xl border border-amber-200/40 bg-amber-50/60 px-4 py-2 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10"
    >
      {/* Labels + valor */}
      <div
        data-testid="revenue-indicator-text"
        className="flex flex-col gap-0.5 min-w-0"
      >
        <span
          data-testid="revenue-indicator-label"
          className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider leading-none"
        >
          Faturamento
        </span>
        <span
          data-testid="revenue-indicator-value"
          data-balance-hidden={!showBalance ? "true" : "false"}
          className="text-sm font-bold text-amber-700 dark:text-amber-300 leading-none tabular-nums"
          style={{
            filter: showBalance ? "none" : "blur(6px)",
            transition: "filter 0.2s ease",
            userSelect: showBalance ? "auto" : "none",
          }}
        >
          {formatCurrency(value)}
        </span>
      </div>

      {/* Barra de progresso */}
      <div
        data-testid="revenue-indicator-progress-wrapper"
        className="flex flex-col gap-1 w-36 lg:w-48"
      >
        <div
          data-testid="revenue-indicator-progress-track"
          className="relative h-2 w-full rounded-full bg-amber-200/50 dark:bg-amber-500/20 overflow-hidden"
        >
          <motion.div
            data-testid="revenue-indicator-progress-fill"
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* Bolinha indicadora */}
          <motion.div
            data-testid="revenue-indicator-progress-dot"
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-amber-400 shadow-md"
            initial={{ left: "0%" }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div
          data-testid="revenue-indicator-scale"
          className="flex justify-between"
        >
          <span
            data-testid="revenue-indicator-scale-min"
            className="text-[9px] text-amber-600/50 dark:text-amber-400/50"
          >
            0
          </span>
          <span
            data-testid="revenue-indicator-scale-goal"
            className="text-[9px] font-semibold text-amber-600/70 dark:text-amber-400/70"
          >
            Meta {formatGoalAbbr(goal)}
          </span>
        </div>
      </div>
    </div>
  );
}
