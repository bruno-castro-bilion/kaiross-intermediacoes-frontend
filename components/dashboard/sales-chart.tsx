"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesChartProps {
  data: Array<{ month: string; assinatura: number; vendido: number }>;
  showBalance?: boolean;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--ink-200)] bg-[var(--ink-0)] shadow-[var(--sh-md)]">
        <div className="border-b border-[var(--ink-100)] bg-[var(--ink-50)] px-3 py-1.5">
          <p className="text-xs font-semibold text-[var(--ink-900)]">{label}</p>
        </div>
        <div className="space-y-2 p-3">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs capitalize text-[var(--ink-600)]">{entry.name}</span>
              </div>
              <span className="mono-num text-sm font-semibold text-[var(--ink-900)]">
                R$ {entry.value.toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SalesChart({ data, showBalance = true }: SalesChartProps) {
  return (
    <div className="flex flex-1 flex-col rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-6 shadow-[var(--sh-xs)]">
      {/* Cabeçalho */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-[13px] text-[var(--ink-600)]">Saldo Total</p>
          <div className="flex items-baseline gap-2">
            <span
              className="mono-num text-[26px] font-extrabold tracking-[-0.025em] text-[var(--ink-900)]"
              style={{
                filter: showBalance ? "none" : "blur(8px)",
                transition: "filter 0.2s ease",
                userSelect: showBalance ? "auto" : "none",
              }}
            >
              R$ 23.842,00
            </span>
            <span className="inline-flex items-center gap-1 rounded-[var(--r-pill)] bg-[var(--kai-success-bg)] px-2 py-0.5 text-[12px] font-semibold text-[var(--kai-success)]">
              ↑ 6,8%
            </span>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--kai-orange)]" />
            <span className="text-[var(--ink-600)]">Vendido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--kai-success)]" />
            <span className="text-[var(--ink-600)]">Assinatura</span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gradVendido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B1A" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#FF6B1A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAssinatura" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 4"
              stroke="var(--ink-200)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="var(--ink-500)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              stroke="var(--ink-500)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontFamily="var(--font-mono)"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Area
              type="monotone"
              dataKey="assinatura"
              stroke="#16A34A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradAssinatura)"
              strokeLinecap="round"
            />
            <Area
              type="monotone"
              dataKey="vendido"
              stroke="#FF6B1A"
              strokeWidth={2.25}
              fillOpacity={1}
              fill="url(#gradVendido)"
              strokeLinecap="round"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
