"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, DollarSign, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";

const PERIODS = ["7 dias", "30 dias", "3 meses", "12 meses"];

const CHART_DATA = [
  { date: "01/04", revenue: 3200, orders: 16 },
  { date: "05/04", revenue: 4800, orders: 24 },
  { date: "09/04", revenue: 3900, orders: 20 },
  { date: "13/04", revenue: 6100, orders: 31 },
  { date: "17/04", revenue: 5400, orders: 27 },
  { date: "21/04", revenue: 7800, orders: 39 },
  { date: "25/04", revenue: 6900, orders: 35 },
  { date: "29/04", revenue: 8200, orders: 41 },
];

const TABLE_DATA = [
  { prod: "Massageador Cervical Shiatsu", sales: 84, revenue: 16548, ticket: 197.00, conv: "3.8%" },
  { prod: "Mini Projetor Estrelas Galaxy", sales: 128, revenue: 20352, ticket: 159.00, conv: "4.2%" },
  { prod: "Fone Bluetooth Pro Max",        sales: 55,  revenue: 12595, ticket: 229.00, conv: "3.1%" },
  { prod: "Smartwatch Fit Pro 2026",       sales: 31,  revenue:  7719, ticket: 249.00, conv: "2.7%" },
  { prod: "Escova Alisadora 3D",           sales: 67,  revenue:  9983, ticket: 149.00, conv: "3.5%" },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

export default function RelatoriosVendas() {
  const [period, setPeriod] = useState("30 dias");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Relatório de Vendas"
        subtitle="Acompanhe o desempenho das suas vendas ao longo do tempo."
        actions={
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-pill)" }}>
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{ padding: "7px 14px", borderRadius: "var(--r-pill)", border: 0, background: period === p ? "var(--ink-900)" : "transparent", color: period === p ? "white" : "var(--ink-600)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard icon={DollarSign}  label="Receita total"    value="R$ 68,2K" highlight />
        <StatCard icon={ShoppingCart} label="Total de vendas"  value="365" />
        <StatCard icon={TrendingUp}  label="Ticket médio"     value="R$ 186,85" />
        <StatCard icon={Users}       label="Novos clientes"   value="148" />
      </div>

      {/* Chart */}
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Evolução da receita</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            {/* @ts-ignore */}
            <defs>
              {/* @ts-ignore */}
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                {/* @ts-ignore */}
                <stop offset="5%"  stopColor="#FF6B1A" stopOpacity={0.25} />
                {/* @ts-ignore */}
                <stop offset="95%" stopColor="#FF6B1A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--ink-500)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--ink-500)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: 12, fontSize: 13 }}
              formatter={(val: unknown) => [fmtBRL(Number(val)), "Receita"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#FF6B1A" strokeWidth={2.5} fill="url(#revGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ink-200)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Performance por produto</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr", gap: 16, padding: "10px 20px", fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid var(--ink-200)" }}>
          <div>Produto</div><div>Vendas</div><div>Receita</div><div>Ticket médio</div><div>Conversão</div>
        </div>
        {TABLE_DATA.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr", gap: 16, padding: "14px 20px", alignItems: "center", borderBottom: "1px solid var(--ink-100)" }}>
            <span style={{ fontWeight: 600 }}>{row.prod}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{row.sales}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--kai-success)" }}>{fmtBRL(row.revenue)}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtBRL(row.ticket)}</span>
            <span style={{ fontWeight: 600, color: "var(--kai-orange-600)" }}>{row.conv}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
