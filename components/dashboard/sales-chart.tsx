"use client";

import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
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

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 border-border overflow-hidden rounded-lg border shadow-xl backdrop-blur-md">
        <div className="bg-primary/10 border-border/50 border-b px-3 py-1.5">
          <p className="text-foreground text-xs font-semibold">{label}</p>
        </div>
        <div className="space-y-2 p-3">
          {payload.map((entry, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground text-xs capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="text-foreground text-sm font-semibold tabular-nums">
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
  const { theme } = useTheme();

  return (
    <Card className="border-border/50 bg-card flex flex-1 flex-col p-6 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-muted-foreground mb-1 text-sm font-medium">
            Saldo Total
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold"
              style={{
                filter: showBalance ? "none" : "blur(8px)",
                transition: "filter 0.2s ease",
                userSelect: showBalance ? "auto" : "none",
              }}
            >
              R$23.8K
            </span>
            <span className="text-sm text-green-500">+68%</span>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Assinatura</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Vendido</span>
          </div>
        </div>
      </div>
      <div className="h-76">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAssinatura" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVendido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={
                theme === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
              }
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Area
              type="monotone"
              dataKey="assinatura"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorAssinatura)"
              strokeWidth={2.5}
            />
            <Area
              type="monotone"
              dataKey="vendido"
              stroke="#fbbf24"
              fillOpacity={1}
              fill="url(#colorVendido)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
