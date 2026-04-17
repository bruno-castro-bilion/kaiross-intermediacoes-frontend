"use client";

import { Card } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface OrderStatusData {
  label: string;
  value: number;
  color: string;
}

interface OrderStatusProps {
  data: OrderStatusData[];
  total: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: OrderStatusData }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-card border-border rounded-lg border px-3 py-2 shadow-lg text-xs">
        <p className="font-medium">{item.name}</p>
        <p className="text-muted-foreground">{item.value} pedidos</p>
      </div>
    );
  }
  return null;
};

export function OrderStatus({ data, total }: OrderStatusProps) {
  return (
    <Card className="border-border/50 bg-card flex h-full flex-col p-6 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]">
      <h3 className="mb-4 text-sm font-semibold">Status dos Pedidos</h3>
      <div className="relative flex flex-1 items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={90}
              outerRadius={105}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
          <span className="text-3xl font-bold">{total.toLocaleString("pt-BR")}</span>
          <span className="text-muted-foreground text-xs">pedidos hoje</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="font-medium">{item.value.toLocaleString("pt-BR")}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
