"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Eye, Check, Pencil, X } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

interface Bump {
  id: string; active: boolean;
  title: string; desc: string;
  mainProduct: string; bumpProduct: string;
  discountType: "percent" | "fixed";
  discountVal: number;
  views: number; accepts: number; revenue: number;
}

const INITIAL_BUMPS: Bump[] = [
  { id: "b1", active: true,  title: "Adicione case + película de brinde",  desc: "Proteja seu massageador com 30% de desconto.", mainProduct: "Massageador Cervical Shiatsu", bumpProduct: "Luminária LED Aroma", discountType: "percent", discountVal: 30, views: 1842, accepts: 458, revenue: 12492.20 },
  { id: "b2", active: true,  title: "Garantia estendida 12 meses",          desc: "Tranquilidade para o cliente, ticket maior pra você.", mainProduct: "Mini Projetor Galaxy", bumpProduct: "Smartwatch Fit Pro", discountType: "fixed",   discountVal: 39.90, views: 1124, accepts: 204, revenue: 4081.80 },
  { id: "b3", active: false, title: "Kit limpeza para projetor",             desc: "Mantenha sua imagem nítida por mais tempo.", mainProduct: "Mini Projetor Galaxy", bumpProduct: "Mochila Antifurto", discountType: "percent", discountVal: 25, views: 612, accepts: 47, revenue: 873.00 },
];

export default function OrderBump() {
  const [bumps, setBumps] = useState<Bump[]>(INITIAL_BUMPS);

  const totalRevenue  = bumps.reduce((s, b) => s + b.revenue, 0);
  const totalViews    = bumps.reduce((s, b) => s + b.views, 0);
  const totalAccepts  = bumps.reduce((s, b) => s + b.accepts, 0);
  const acceptRate    = totalViews ? ((totalAccepts / totalViews) * 100).toFixed(1) : "0.0";

  const toggle = (id: string) =>
    setBumps((prev) => prev.map((b) => b.id === id ? { ...b, active: !b.active } : b));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Order Bump"
        subtitle="Ofereça produtos complementares no checkout para aumentar o ticket médio."
        actions={
          <button style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={15} /> Novo order bump
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard icon={Eye}        label="Exibições"      value={totalViews.toLocaleString("pt-BR")} />
        <StatCard icon={Check}      label="Aceites"        value={totalAccepts.toLocaleString("pt-BR")} />
        <StatCard icon={TrendingUp} label="Taxa de aceite" value={`${acceptRate}%`} highlight />
        <StatCard icon={TrendingUp} label="Receita extra"  value={fmtBRL(totalRevenue)} />
      </div>

      {/* Table */}
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ink-200)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Bumps configurados ({bumps.length})</h3>
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-pill)" }}>
            {["Todos", "Ativos", "Pausados"].map((t) => (
              <button key={t} style={{ padding: "6px 14px", borderRadius: "var(--r-pill)", border: 0, background: t === "Todos" ? "var(--ink-900)" : "transparent", color: t === "Todos" ? "white" : "var(--ink-600)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 0.8fr 0.5fr", gap: 16, padding: "10px 20px", fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid var(--ink-200)" }}>
          <div>Bump</div><div>Desconto</div><div>Aceite</div><div>Receita</div><div>Status</div><div />
        </div>

        {bumps.map((b) => {
          const rate = b.views ? ((b.accepts / b.views) * 100).toFixed(1) : "0.0";
          return (
            <div key={b.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 0.8fr 0.5fr", gap: 16, padding: "14px 20px", alignItems: "center", borderBottom: "1px solid var(--ink-100)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{b.title}</span>
                <span style={{ fontSize: 12, color: "var(--ink-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.desc}</span>
              </div>
              <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {b.discountType === "percent" ? `${b.discountVal}%` : fmtBRL(b.discountVal)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 13 }}>{rate}%</span>
                <span style={{ fontSize: 11, color: "var(--ink-500)" }}>{b.accepts}/{b.views}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13, color: "var(--kai-success)" }}>{fmtBRL(b.revenue)}</div>
              <div><StatusBadge status={b.active ? "ativo" : "pausado"} /></div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => toggle(b.id)}
                  title={b.active ? "Pausar" : "Ativar"}
                  style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-600)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  {b.active ? <X size={12} /> : <Check size={12} />}
                </button>
                <button title="Editar" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-600)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Pencil size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
