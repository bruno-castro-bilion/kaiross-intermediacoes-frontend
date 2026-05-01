"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, Share2, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface MetricItem {
  label: string;
  value: string;
  isNegative?: boolean;
}

interface SalesMetricsProps {
  data: MetricItem[];
  loading?: boolean;
}

const salesSourcesData = [
  {
    icon: Link,
    label: "Link direto",
    subLabel: "Clica no link direto",
    value: 450,
    percent: "29,8%",
    key: "link-direto",
  },
  {
    icon: Share2,
    label: "Social Network",
    subLabel: "Todas as redes sociais",
    value: 2220,
    percent: "29,5%",
    key: "social-network",
  },
  {
    icon: Mail,
    label: "E-mail newsletter",
    subLabel: "Campanhas de email",
    value: 324,
    percent: "27,2%",
    key: "email-newsletter",
  },
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function SalesMetrics({ data, loading }: SalesMetricsProps) {
  return (
    <Card
      data-testid="sales-metrics"
      data-loading={loading ? "true" : "false"}
      className="border-border/50 bg-card flex h-114.5 max-h-114.5 min-h-114.5 flex-col p-6 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]"
    >
      <h3
        data-testid="sales-metrics-title"
        className="mb-3 text-sm font-semibold"
      >
        Métricas de Vendas
      </h3>
      <div data-testid="sales-metrics-table-wrapper" className="flex-1 space-y-1">
        {loading ? (
          <Table data-testid="sales-metrics-table-loading">
            <TableBody>
              {[...Array(7)].map((_, i) => (
                <TableRow
                  key={i}
                  data-testid={`sales-metrics-row-skeleton-${i}`}
                  className="border-border/50"
                >
                  <TableCell className="py-1.5">
                    <Skeleton className="h-3 w-40" />
                  </TableCell>
                  <TableCell className="py-1.5 text-right">
                    <Skeleton className="ml-auto h-3 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table data-testid="sales-metrics-table">
            <TableBody>
              {data.map((metric, index) => {
                const rowId = `sales-metrics-row-${slug(metric.label) || index}`;
                return (
                  <TableRow
                    key={index}
                    data-testid={rowId}
                    className="border-border/50"
                  >
                    <TableCell
                      data-testid={`${rowId}-label`}
                      className="text-muted-foreground py-1.5 text-xs"
                    >
                      {metric.label}
                    </TableCell>
                    <TableCell
                      data-testid={`${rowId}-value`}
                      data-negative={metric.isNegative ? "true" : "false"}
                      className={`py-1.5 text-right text-xs font-semibold ${
                        metric.isNegative ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {metric.value}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
      <div
        data-testid="sales-metrics-sources"
        className="border-border/50 border-t pt-3"
      >
        <div
          data-testid="sales-metrics-sources-header"
          className="mb-2 flex items-center justify-between"
        >
          <h4
            data-testid="sales-metrics-sources-title"
            className="text-xs font-semibold"
          >
            Vendas por fonte
          </h4>
          <span
            data-testid="sales-metrics-sources-total"
            className="text-muted-foreground text-[10px]"
          >
            3.450 vendas
          </span>
        </div>
        <div
          data-testid="sales-metrics-sources-list"
          className="space-y-2"
        >
          {loading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  data-testid={`sales-metrics-source-skeleton-${i}`}
                  className="flex items-center gap-2"
                >
                  <Skeleton className="h-6 w-6 rounded" />
                  <div className="flex-1 space-y-0.5">
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                  <div className="space-y-0.5 text-right">
                    <Skeleton className="ml-auto h-2.5 w-10" />
                    <Skeleton className="ml-auto h-2 w-12" />
                  </div>
                </div>
              ))
            : salesSourcesData.map((item, i) => {
                const Icon = item.icon;
                const itemId = `sales-metrics-source-${item.key}`;
                return (
                  <div
                    key={i}
                    data-testid={itemId}
                    className="flex items-center gap-2"
                  >
                    <div
                      data-testid={`${itemId}-icon-wrapper`}
                      className="bg-muted flex h-6 w-6 items-center justify-center rounded"
                    >
                      <Icon
                        data-testid={`${itemId}-icon`}
                        className="text-muted-foreground h-3 w-3"
                      />
                    </div>
                    <div data-testid={`${itemId}-info`} className="flex-1">
                      <div
                        data-testid={`${itemId}-label`}
                        className="text-[10px] leading-tight font-medium"
                      >
                        {item.label}
                      </div>
                      <div
                        data-testid={`${itemId}-sublabel`}
                        className="text-muted-foreground text-[9px] leading-tight"
                      >
                        {item.subLabel}
                      </div>
                    </div>
                    <div data-testid={`${itemId}-numbers`} className="text-right">
                      <div
                        data-testid={`${itemId}-value`}
                        className="text-[10px] leading-tight font-semibold"
                      >
                        {item.value}
                      </div>
                      <div
                        data-testid={`${itemId}-percent`}
                        className="text-muted-foreground text-[9px] leading-tight"
                      >
                        {item.percent}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
        <button
          data-testid="sales-metrics-button-view-report"
          className="text-primary -mt-3 w-full text-[10px] hover:underline"
        >
          Ver relatório completo
        </button>
      </div>
    </Card>
  );
}
