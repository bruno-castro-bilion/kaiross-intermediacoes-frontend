"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCcw, DollarSign, AlertTriangle, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";

const PERIODS = ["7 dias", "30 dias", "3 meses"];

const CHART_DATA = [
  { date: "01/04", estornos: 3 },
  { date: "08/04", estornos: 5 },
  { date: "15/04", estornos: 2 },
  { date: "22/04", estornos: 4 },
  { date: "29/04", estornos: 3 },
];

const TABLE_DATA = [
  { id: "#KAI-30410", client: "Ricardo O.",  prod: "Massageador Cervical Shiatsu", val: 197.00, reason: "Produto danificado",     status: "aprovado" as const, date: "20/04" },
  { id: "#KAI-30389", client: "Patrícia F.", prod: "Smartwatch Fit Pro 2026",      val: 249.00, reason: "Não autorizado",         status: "pendente" as const, date: "18/04" },
  { id: "#KAI-30371", client: "Gustavo M.", prod: "Fone Bluetooth Pro Max",        val: 229.00, reason: "Produto não chegou",     status: "aprovado" as const, date: "15/04" },
  { id: "#KAI-30358", client: "Larissa T.", prod: "Kit Skincare Coreano",          val: 179.00, reason: "Produto diferente",      status: "negado"  as const,  date: "12/04" },
  { id: "#KAI-30340", client: "Henrique A.",prod: "Escova Alisadora 3D",           val: 149.00, reason: "Arrependimento 7 dias",  status: "aprovado" as const, date: "10/04" },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  aprovado: { bg: "var(--kai-success-bg)", fg: "var(--kai-success)",  label: "Aprovado" },
  pendente: { bg: "var(--kai-warn-bg)",    fg: "var(--kai-warn)",     label: "Pendente" },
  negado:   { bg: "var(--kai-danger-bg)", fg: "var(--kai-danger)",   label: "Negado"   },
};

export default function RelatoriosEstornos() {
  const [period, setPeriod] = useState("30 dias");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Estornos"
        subtitle="Acompanhe chargebacks e solicitações de estorno."
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
        <StatCard icon={RefreshCcw}   label="Total de estornos"  value="17"    />
        <StatCard icon={DollarSign}   label="Valor estornado"    value="R$ 3.2K" highlight />
        <StatCard icon={AlertTriangle} label="Taxa de estorno"   value="1,8%"  />
        <StatCard icon={TrendingDown} label="vs. mês anterior"   value="-0,3%" />
      </div>

      {/* Chart */}
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Estornos por semana</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={CHART_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--ink-500)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--ink-500)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: 12, fontSize: 13 }} />
            <Bar dataKey="estornos" fill="#DC2626" radius={[6, 6, 0, 0]} name="Estornos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ink-200)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Histórico de estornos</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 2fr 1fr 2fr 1fr", gap: 16, padding: "10px 20px", fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid var(--ink-200)" }}>
          <div>Pedido</div><div>Cliente</div><div>Produto</div><div>Valor</div><div>Motivo</div><div>Status</div>
        </div>
        {TABLE_DATA.map((row, i) => {
          const s = STATUS_STYLE[row.status];
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 2fr 1fr 2fr 1fr", gap: 16, padding: "14px 20px", alignItems: "center", borderBottom: "1px solid var(--ink-100)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12 }}>{row.id}</span>
                <span style={{ fontSize: 11, color: "var(--ink-500)" }}>{row.date}</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{row.client}</span>
              <span style={{ fontSize: 13, color: "var(--ink-700)" }}>{row.prod}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--kai-danger)" }}>{fmtBRL(row.val)}</span>
              <span style={{ fontSize: 12, color: "var(--ink-600)" }}>{row.reason}</span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, background: s.bg, color: s.fg, fontSize: 11, fontWeight: 700 }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
