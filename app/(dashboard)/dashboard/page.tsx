"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Receipt,
  Package,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatsCards, type StatsCardData } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RefundChargeback } from "@/components/dashboard/refund-chargeback";
import { OrderStatus } from "@/components/dashboard/order-status";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBalanceVisibility } from "@/contexts/balance-visibility-context";

/* ─── Dados mock ─────────────────────────────────────────────────────────── */

const MOCK_CHART_DATA = [
  { month: "Jan", assinatura: 120, vendido: 180 },
  { month: "Fev", assinatura: 260, vendido: 520 },
  { month: "Mar", assinatura: 310, vendido: 780 },
  { month: "Abr", assinatura: 290, vendido: 420 },
  { month: "Mai", assinatura: 240, vendido: 310 },
  { month: "Jun", assinatura: 330, vendido: 470 },
  { month: "Jul", assinatura: 360, vendido: 520 },
  { month: "Ago", assinatura: 440, vendido: 640 },
  { month: "Set", assinatura: 400, vendido: 580 },
  { month: "Out", assinatura: 520, vendido: 690 },
  { month: "Nov", assinatura: 580, vendido: 720 },
  { month: "Dez", assinatura: 640, vendido: 820 },
];

const MOCK_ORDER_STATUS = [
  { label: "Aguardando", value: 48, color: "#F59E0B" },
  { label: "Em separação", value: 31, color: "#FF6B1A" },
  { label: "Enviado", value: 29, color: "#3B82F6" },
  { label: "Entregue", value: 156, color: "#16A34A" },
  { label: "Devolvido", value: 7, color: "#DC2626" },
];

const MOCK_RECENT_SALES = [
  { id: "#1532", client: "Ana Beatriz Silva", product: "Kit Beleza Premium",      date: "Hoje, 10:08", badge: "Pago",     badgeVariant: "default" as const, amount: "R$ 103,49" },
  { id: "#1531", client: "Carlos Eduardo",    product: "Whey Protein 2kg",         date: "Hoje, 07:15", badge: "Pendente", badgeVariant: "secondary" as const, amount: "R$ 117,23" },
  { id: "#1530", client: "Mariana Costa",     product: "Suplemento Vitamínico",    date: "Ontem, 22:54", badge: "Pendente", badgeVariant: "secondary" as const, amount: "R$ 92,36" },
  { id: "#1529", client: "João Paulo Lima",   product: "Pack Proteínas + Creatina", date: "Ontem, 14:23", badge: "Pago",     badgeVariant: "default" as const, amount: "R$ 350,52" },
  { id: "#1528", client: "Fernanda Oliveira", product: "Colágeno Hidrolisado",      date: "28/04, 14:40", badge: "Pago",     badgeVariant: "default" as const, amount: "R$ 246,78" },
  { id: "#1527", client: "Ricardo Mendes",    product: "BCAA 60 caps",              date: "27/04, 08:45", badge: "Cancelado",  badgeVariant: "destructive" as const, amount: "R$ 64,88" },
];

const PERIOD_TABS = [
  { value: "ontem",    label: "Ontem" },
  { value: "hoje",     label: "Hoje" },
  { value: "mes-atual", label: "Mês atual" },
  { value: "ultimos-30", label: "Últimos 30 dias" },
  { value: "ultimo-mes", label: "Último mês" },
];

/* ─── Página ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("hoje");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const isMobile = useIsMobile();
  const { showBalance } = useBalanceVisibility();

  const [statsData, setStatsData] = useState<StatsCardData[]>([]);
  const [refundData, setRefundData] = useState({
    reembolsos: "",
    vendasReembolsadas: "",
    taxaReembolso: "",
    chargebacks: "",
    totalChargebacks: "",
    taxaChargeback: "",
  });

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setStatsData([
        {
          title: "Vendas",
          value: "3.450",
          percent: "28.4",
          icon: ShoppingCart,
          sparkData: [20, 32, 28, 40, 38, 52, 55, 62, 58, 70, 75],
        },
        {
          title: "Total faturado",
          value: "R$ 62,5K",
          percent: "12.6",
          icon: TrendingUp,
          sparkData: [30, 28, 40, 38, 52, 55, 62, 68, 72, 85, 90],
          sparkColor: "var(--kai-success)",
        },
        {
          title: "Ticket médio",
          value: "R$ 18,12",
          percent: "5.2",
          icon: Receipt,
          sparkData: [40, 42, 38, 45, 48, 46, 50, 52, 49, 53, 55],
        },
        {
          title: "Pedidos pendentes",
          value: "127",
          percent: "-3.1",
          icon: Package,
          sparkData: [55, 58, 62, 60, 55, 52, 48, 52, 50, 48, 45],
          sparkColor: "var(--kai-warn)",
        },
      ]);

      setRefundData({
        reembolsos: "R$ 2.450",
        vendasReembolsadas: "14",
        taxaReembolso: "5%",
        chargebacks: "R$ 1.158",
        totalChargebacks: "3",
        taxaChargeback: "2%",
      });

      setLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, [period]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-full space-y-6 bg-[var(--ink-100)] p-8"
    >
      {/* ── Cabeçalho da página ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.025em] text-[var(--ink-900)]">
            Detalhes das vendas
          </h1>
          <p className="mt-1.5 text-[16px] text-[var(--ink-600)]">
            Acompanhe o desempenho da sua loja em tempo real.
          </p>
        </div>

        {/* Botão de data */}
        <div className="flex items-center gap-3">
          {!isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-2 rounded-[var(--r-pill)] border border-[var(--ink-200)] bg-[var(--ink-0)] px-4 text-[13px] font-semibold text-[var(--ink-700)] hover:border-[var(--ink-300)] hover:bg-[var(--ink-0)] hover:text-[var(--ink-900)]"
                >
                  <CalendarIcon size={14} />
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
              <PopoverContent
                className="w-auto rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-0 shadow-[var(--sh-lg)]"
                align="end"
              >
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="rounded-[var(--r-lg)]"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* ── Abas de período ── */}
      {!isMobile && (
        <div className="flex w-fit gap-1 rounded-[var(--r-pill)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-1.5 shadow-[var(--sh-xs)]">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setPeriod(tab.value); setDateRange(undefined); }}
              className={[
                "rounded-[var(--r-pill)] px-5 py-2 text-[14px] font-semibold transition-all",
                period === tab.value
                  ? "bg-[var(--ink-900)] text-white shadow-[var(--sh-sm)]"
                  : "text-[var(--ink-600)] hover:text-[var(--ink-900)]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Seletor mobile de período ── */}
      {isMobile && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setPeriod(tab.value); setDateRange(undefined); }}
              className={[
                "shrink-0 rounded-[var(--r-pill)] px-3.5 py-1.5 text-[12px] font-semibold transition-all",
                period === tab.value
                  ? "bg-[var(--ink-900)] text-white"
                  : "border border-[var(--ink-200)] bg-[var(--ink-0)] text-[var(--ink-600)]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── KPI cards ── */}
      <StatsCards data={statsData} loading={loading} showBalance={showBalance} />

      {/* ── Gráfico + Status ── */}
      {isMobile ? (
        <div className="space-y-5">
          <SalesChart data={MOCK_CHART_DATA} showBalance={showBalance} />
          <OrderStatus data={MOCK_ORDER_STATUS} total={271} />
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
          <div className="flex flex-col">
            <SalesChart data={MOCK_CHART_DATA} showBalance={showBalance} />
          </div>
          <div className="flex flex-col">
            <OrderStatus data={MOCK_ORDER_STATUS} total={271} />
          </div>
        </div>
      )}

      {/* ── Reembolsos + Chargebacks ── */}
      <RefundChargeback data={refundData} loading={loading} />

      {/* ── Pedidos recentes ── */}
      <RecentSales data={MOCK_RECENT_SALES} loading={loading} />
    </motion.div>
  );
}
