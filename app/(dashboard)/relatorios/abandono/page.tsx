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
import { ShoppingCart, TrendingDown, DollarSign, Mail } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";

const PERIODS = ["7 dias", "30 dias", "3 meses"];

const CHART_DATA = [
  { date: "01/04", abandonados: 38, recuperados: 12 },
  { date: "08/04", abandonados: 45, recuperados: 18 },
  { date: "15/04", abandonados: 52, recuperados: 22 },
  { date: "22/04", abandonados: 41, recuperados: 16 },
  { date: "29/04", abandonados: 48, recuperados: 20 },
];

const TABLE_DATA = [
  { client: "Ana P.",     prod: "Massageador Cervical Shiatsu",  val: 197.00, time: "há 2h",  step: "Pagamento", recovered: false },
  { client: "João S.",    prod: "Smartwatch Fit Pro 2026",       val: 249.00, time: "há 4h",  step: "Endereço",  recovered: true  },
  { client: "Bianca L.",  prod: "Fone Bluetooth Pro Max",        val: 229.00, time: "há 6h",  step: "Pagamento", recovered: false },
  { client: "Carlos M.",  prod: "Kit Skincare Coreano",          val: 179.00, time: "há 8h",  step: "Revisão",   recovered: true  },
  { client: "Fernanda R.",prod: "Escova Alisadora 3D",           val: 149.00, time: "há 10h", step: "Pagamento", recovered: false },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

export default function RelatoriosAbandono() {
  const [period, setPeriod] = useState("30 dias");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Abandono de Carrinho"
        subtitle="Identifique e recupere clientes que não finalizaram a compra."
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
        <StatCard icon={ShoppingCart}  label="Carrinhos abandonados" value="224"    />
        <StatCard icon={TrendingDown}  label="Taxa de abandono"       value="38,4%"  />
        <StatCard icon={DollarSign}    label="Receita perdida"        value="R$ 41K" highlight />
        <StatCard icon={Mail}          label="E-mails recuperados"    value="88"     />
      </div>

      {/* Chart */}
      <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Abandonados vs. Recuperados</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={CHART_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--ink-500)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--ink-500)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: 12, fontSize: 13 }} />
            <Bar dataKey="abandonados" fill="#FF6B1A" radius={[6, 6, 0, 0]} name="Abandonados" />
            <Bar dataKey="recuperados" fill="#16A34A" radius={[6, 6, 0, 0]} name="Recuperados" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ink-200)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Carrinhos abandonados recentes</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 1fr 1fr 1fr 0.8fr", gap: 16, padding: "10px 20px", fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid var(--ink-200)" }}>
          <div>Cliente</div><div>Produto</div><div>Valor</div><div>Quando</div><div>Etapa</div><div>Status</div>
        </div>
        {TABLE_DATA.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 1fr 1fr 1fr 0.8fr", gap: 16, padding: "14px 20px", alignItems: "center", borderBottom: "1px solid var(--ink-100)" }}>
            <span style={{ fontWeight: 600 }}>{row.client}</span>
            <span style={{ fontSize: 13, color: "var(--ink-700)" }}>{row.prod}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtBRL(row.val)}</span>
            <span style={{ fontSize: 12, color: "var(--ink-500)" }}>{row.time}</span>
            <span style={{ fontSize: 12, display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999, background: "var(--ink-100)", color: "var(--ink-700)", fontWeight: 600 }}>{row.step}</span>
            <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999, background: row.recovered ? "var(--kai-success-bg)" : "var(--kai-warn-bg)", color: row.recovered ? "var(--kai-success)" : "var(--kai-warn)", fontSize: 11, fontWeight: 700 }}>
              {row.recovered ? "Recuperado" : "Pendente"}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
