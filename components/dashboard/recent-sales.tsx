"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecentSale {
  id: string;
  date: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  amount: string;
}

interface RecentSalesProps {
  data: RecentSale[];
  loading?: boolean;
}

export function RecentSales({ data, loading }: RecentSalesProps) {
  const getBadgeStyles = (badge: string) => {
    if (badge === "Pago") {
      return "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0";
    }
    if (badge === "Pendente") {
      return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0";
    }
    return "";
  };

  const getStatusIcon = (badge: string) => {
    if (badge === "Pago") return "✓";
    if (badge === "Pendente") return "⏱";
    return "";
  };

  return (
    <Card className="border-border/50 bg-card p-6 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]">
      <h3 className="mb-4 text-sm font-semibold">Vendas Recentes</h3>
      <div className="min-h-76.25">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venda</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {sale.date}
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeStyles(sale.badge)}>
                        <span className="mr-1">
                          {getStatusIcon(sale.badge)}
                        </span>
                        {sale.badge}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {sale.amount}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
