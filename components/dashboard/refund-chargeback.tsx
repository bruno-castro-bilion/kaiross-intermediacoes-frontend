"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, AlertTriangle, TrendingUp } from "lucide-react";

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

export function RefundChargeback({ data, loading }: RefundChargebackProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="border-border/50 bg-card min-h-45 p-6 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Reembolsos</h3>
          <div className="rounded-full bg-yellow-500/10 p-2">
            <RotateCcw className="h-4 w-4 text-yellow-500" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reembolsos</span>
            <div className="flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <>
                  <span className="font-semibold">{data.reembolsos}</span>
                  <Badge className="border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +68%
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vendas Reembolsadas</span>
            <div className="flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <>
                  <span className="font-semibold">
                    {data.vendasReembolsadas}
                  </span>
                  <Badge className="border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +68%
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Reembolso (%)</span>
            {loading ? (
              <Skeleton className="h-4 w-12" />
            ) : (
              <span className="font-semibold">{data.taxaReembolso}</span>
            )}
          </div>
        </div>
      </Card>

      <Card className="border-border/50 bg-card min-h-45 p-6 dark:bg-[radial-gradient(ellipse_at_top_left,rgba(22,22,28,1)_0%,rgba(10,10,15,1)_70%)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Chargebacks</h3>
          <div className="rounded-full bg-red-500/10 p-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Chargebacks</span>
            <div className="flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <>
                  <span className="font-semibold">{data.chargebacks}</span>
                  <Badge className="border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +68%
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total de Chargebacks</span>
            <div className="flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <>
                  <span className="font-semibold">{data.totalChargebacks}</span>
                  <Badge className="border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +68%
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Taxa de Chargeback (%)
            </span>
            {loading ? (
              <Skeleton className="h-4 w-12" />
            ) : (
              <span className="font-semibold">{data.taxaChargeback}</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
