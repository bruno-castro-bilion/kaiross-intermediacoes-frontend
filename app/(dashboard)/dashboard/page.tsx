"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Clock,
  Calendar as CalendarIcon,
  LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { SalesMetrics } from "@/components/dashboard/sales-metrics";
import { RefundChargeback } from "@/components/dashboard/refund-chargeback";
import { OrderStatus } from "@/components/dashboard/order-status";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBalanceVisibility } from "@/contexts/balance-visibility-context";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("hoje");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const isMobile = useIsMobile();
  const { showBalance } = useBalanceVisibility();
  const [statsData, setStatsData] = useState<
    {
      title: string;
      value: string;
      percent: string;
      icon: LucideIcon;
    }[]
  >([]);
  const [chartData, setChartData] = useState<
    { month: string; assinatura: number; vendido: number }[]
  >([
    { month: "Jan", assinatura: 400, vendido: 240 },
    { month: "Fev", assinatura: 300, vendido: 139 },
    { month: "Mar", assinatura: 200, vendido: 980 },
    { month: "Abr", assinatura: 278, vendido: 390 },
    { month: "Mai", assinatura: 189, vendido: 480 },
    { month: "Jun", assinatura: 239, vendido: 380 },
    { month: "Jul", assinatura: 349, vendido: 430 },
    { month: "Ago", assinatura: 200, vendido: 120 },
    { month: "Set", assinatura: 278, vendido: 390 },
    { month: "Out", assinatura: 400, vendido: 480 },
    { month: "Nov", assinatura: 300, vendido: 380 },
    { month: "Dez", assinatura: 200, vendido: 430 },
  ]);
  const [metricsData, setMetricsData] = useState<
    { label: string; value: string; isNegative: boolean }[]
  >([]);
  const [refundData, setRefundData] = useState<{
    reembolsos: string;
    vendasReembolsadas: string;
    taxaReembolso: string;
    chargebacks: string;
    totalChargebacks: string;
    taxaChargeback: string;
  }>({
    reembolsos: "",
    vendasReembolsadas: "",
    taxaReembolso: "",
    chargebacks: "",
    totalChargebacks: "",
    taxaChargeback: "",
  });
  const [orderStatusData, setOrderStatusData] = useState<
    { label: string; value: number; color: string }[]
  >([
    { label: "Aguardando", value: 48, color: "#fbbf24" },
    { label: "Em separação", value: 31, color: "#a78bfa" },
    { label: "Enviado", value: 29, color: "#3b82f6" },
    { label: "Entregue", value: 156, color: "#10b981" },
    { label: "Devolvido", value: 7, color: "#f87171" },
  ]);
  const [recentSalesData, setRecentSalesData] = useState<
    {
      id: string;
      date: string;
      badge: string;
      badgeVariant: "default" | "secondary" | "outline" | "destructive";
      amount: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatsData([
        { title: "Vendas", value: "3.450", percent: "28.4", icon: DollarSign },
        { title: "Total faturado", value: "R$62.5K", percent: "12.6", icon: TrendingUp },
        { title: "Ticket médio", value: "R$18,12", percent: "5.2", icon: Receipt },
        { title: "Pedidos pendentes", value: "127", percent: "-3.1", icon: Clock },
      ]);

      setChartData([
        { month: "Jan", assinatura: 400, vendido: 240 },
        { month: "Fev", assinatura: 300, vendido: 139 },
        { month: "Mar", assinatura: 200, vendido: 980 },
        { month: "Abr", assinatura: 278, vendido: 390 },
        { month: "Mai", assinatura: 189, vendido: 480 },
        { month: "Jun", assinatura: 239, vendido: 380 },
        { month: "Jul", assinatura: 349, vendido: 430 },
        { month: "Ago", assinatura: 200, vendido: 120 },
        { month: "Set", assinatura: 278, vendido: 390 },
        { month: "Out", assinatura: 400, vendido: 480 },
        { month: "Nov", assinatura: 300, vendido: 380 },
        { month: "Dez", assinatura: 200, vendido: 430 },
      ]);

      setMetricsData([
        { label: "Taxa de Aprovação", value: "98,5%", isNegative: false },
        { label: "Taxa de Reprovação", value: "2,5%", isNegative: true },
        { label: "Recusas por saldo insuficiente", value: "9", isNegative: true },
        { label: "Taxa Conversão", value: "93,5%", isNegative: false },
        { label: "Aprovação cartão", value: "97,0%", isNegative: false },
        { label: "Conversão pix", value: "92,1%", isNegative: false },
        { label: "Conversão boleto", value: "82,5%", isNegative: false },
      ]);

      setRefundData({
        reembolsos: "R$3.450",
        vendasReembolsadas: "6",
        taxaReembolso: "5%",
        chargebacks: "R$1.450",
        totalChargebacks: "2",
        taxaChargeback: "2%",
      });

      setOrderStatusData([
        { label: "Aguardando", value: 48, color: "#fbbf24" },
        { label: "Em separação", value: 31, color: "#a78bfa" },
        { label: "Enviado", value: 29, color: "#3b82f6" },
        { label: "Entregue", value: 156, color: "#10b981" },
        { label: "Devolvido", value: 7, color: "#f87171" },
      ]);

      setRecentSalesData([
        { id: "#1532", date: "Dez 30, 10:08 AM", badge: "Pago", badgeVariant: "default", amount: "$ 103.49" },
        { id: "#1531", date: "Dez 28, 07:15 AM", badge: "Pendente", badgeVariant: "secondary", amount: "$ 117.23" },
        { id: "#1530", date: "Dez 28, 12:54 AM", badge: "Pendente", badgeVariant: "secondary", amount: "$ 92.36" },
        { id: "#1529", date: "Dez 28, 2:23 PM", badge: "Pago", badgeVariant: "default", amount: "$ 350.52" },
        { id: "#1528", date: "Dez 27, 2:40 PM", badge: "Pago", badgeVariant: "default", amount: "$ 246.78" },
        { id: "#1527", date: "Dez 26, 8:45 AM", badge: "Pendente", badgeVariant: "default", amount: "$ 64.88" },
      ]);

      setLoading(false);
    };

    fetchData();
  }, [period]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-background space-y-6 p-4 md:p-6"
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">Detalhes das vendas</h1>

        {!isMobile && (
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "ontem", label: "Ontem" },
                { value: "hoje", label: "Hoje" },
                { value: "mes-atual", label: "Mês atual" },
                { value: "ultimos-30", label: "Últimos 30 dias" },
                { value: "ultimo-mes", label: "Último mês" },
              ].map((btn) => (
                <Button
                  key={btn.value}
                  variant={period === btn.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setPeriod(btn.value); setDateRange(undefined); }}
                  className={
                    period === btn.value
                      ? "bg-primary/80 hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 cursor-pointer"
                      : "bg-muted hover:bg-muted/80 cursor-pointer"
                  }
                >
                  {btn.label}
                </Button>
              ))}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-muted hover:bg-muted/80 cursor-pointer gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    "Data específica"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="border-border bg-card w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {isMobile ? (
        <>
          {statsData[0] && (
            <StatsCards data={[statsData[0]]} loading={loading} hideBadge showBalance={showBalance} />
          )}
          {statsData[1] && (
            <StatsCards data={[statsData[1]]} loading={loading} hideBadge showBalance={showBalance} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select value={period} onValueChange={(value) => { setPeriod(value); setDateRange(undefined); }}>
              <SelectTrigger className="bg-muted/50 border-border/50 hover:bg-muted hover:border-border h-11 min-h-11 w-full font-medium shadow-sm transition-colors">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="mes-atual">Mês atual</SelectItem>
                <SelectItem value="ultimos-30">Últimos 30 dias</SelectItem>
                <SelectItem value="ultimo-mes">Último mês</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-muted/50 border-border/50 hover:bg-muted hover:border-border h-11 min-h-11 w-full justify-start gap-2 font-medium shadow-sm transition-colors"
                >
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM", { locale: ptBR })
                      )
                    ) : (
                      "Selecionar"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="border-border bg-card w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  locale={ptBR}
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>

          <SalesChart data={chartData} showBalance={showBalance} />

          <RefundChargeback data={refundData} loading={loading} />
          <OrderStatus data={orderStatusData} total={271} />
        </>
      ) : (
        <>
          <StatsCards data={statsData} loading={loading} showBalance={showBalance} />

          <div className="grid grid-cols-5 gap-4 items-stretch">
            <div className="col-span-3 flex flex-col">
              <SalesChart data={chartData} showBalance={showBalance} />
            </div>
            <div className="col-span-2 flex flex-col">
              <OrderStatus data={orderStatusData} total={271} />
            </div>
          </div>

          <RefundChargeback data={refundData} loading={loading} />
        </>
      )}
    </motion.div>
  );
}
