"use client";

import { Card } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface TrackingData {
  category: string;
  value: number;
  color: string;
}

interface TrackingChartProps {
  data: TrackingData[];
  total: string;
}

export function TrackingChart({ data, total }: TrackingChartProps) {
  return (
    <Card className="border-border/50 bg-card flex min-h-90 flex-col p-6 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]">
      <h3 className="mb-4 text-sm font-semibold">Trackeamento</h3>
      <div className="relative flex flex-1 items-center justify-center">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={90}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-muted-foreground text-xs">
            Usuários por dispositivos
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.category}</span>
            </div>
            <span className="font-medium">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
