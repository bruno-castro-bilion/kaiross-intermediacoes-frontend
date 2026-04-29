"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  TrendingUp,
  Flame,
  ShoppingCart,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";

/* ─── Mock data ─────────────────────────────────────────────────────────────── */
const PRODUCTS = [
  { id: "m1", name: "Massageador Cervical Shiatsu", img: "#FFB07A", price: 197.00, sold: 84,  revenue: 16548, status: "ativo"   as const, stock: "Alto",  last: "há 2 min" },
  { id: "m2", name: "Luminária LED Aroma 3 em 1",  img: "#FFD3B5", price: 119.00, sold: 42,  revenue:  4998, status: "ativo"   as const, stock: "Médio", last: "há 18 min" },
  { id: "m3", name: "Mini Projetor Estrelas Galaxy",img: "#FFE7D5", price: 159.00, sold: 128, revenue: 20352, status: "ativo"   as const, stock: "Alto",  last: "há 1h" },
  { id: "m4", name: "Smartwatch Fit Pro 2026",      img: "#FFCC99", price: 249.00, sold: 31,  revenue:  7719, status: "pausado" as const, stock: "Alto",  last: "há 3h" },
  { id: "m5", name: "Escova Alisadora 3D",          img: "#FFC8A2", price: 149.00, sold: 67,  revenue:  9983, status: "ativo"   as const, stock: "Alto",  last: "há 5h" },
  { id: "m6", name: "Kit Skincare Coreano",         img: "#FFE2C8", price: 179.00, sold: 22,  revenue:  3938, status: "pausado" as const, stock: "Médio", last: "há 1d" },
  { id: "m7", name: "Fone Bluetooth Pro Max",       img: "#FFBF94", price: 229.00, sold: 55,  revenue: 12595, status: "ativo"   as const, stock: "Alto",  last: "há 2h" },
  { id: "m8", name: "Relógio Masculino Slim",       img: "#FFD5B0", price: 189.00, sold: 18,  revenue:  3402, status: "ativo"   as const, stock: "Baixo", last: "há 6h" },
  { id: "m9", name: "Tapete Yoga Antiderrapante",   img: "#FFE0C2", price: 129.00, sold: 33,  revenue:  4257, status: "ativo"   as const, stock: "Médio", last: "há 4h" },
  { id: "m10", name: "Cafeteira Portátil USB",      img: "#FFCFA8", price: 149.00, sold: 12,  revenue:  1788, status: "pausado" as const, stock: "Alto",  last: "há 2d" },
  { id: "m11", name: "Mochila Antifurto USB Pro",   img: "#F5F2EE", price: 189.00, sold: 45,  revenue:  8505, status: "ativo"   as const, stock: "Alto",  last: "há 3h" },
  { id: "m12", name: "Tênis Esportivo Caminhada",   img: "#FFD9B8", price: 199.00, sold: 8,   revenue:  1592, status: "pausado" as const, stock: "Baixo", last: "há 5d" },
];

const TABS = ["Todos (12)", "Ativos", "Pausados"] as const;

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

/* ─── ProductImage ─────────────────────────────────────────────────────────── */
function ProductThumb({ tone }: { tone: string }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "var(--r-sm)",
        background: `linear-gradient(135deg, ${tone}, ${tone}cc)`,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,.18) 8px 9px)" }} />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function MeusProdutos() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    if (tab === 1) list = list.filter((p) => p.status === "ativo");
    if (tab === 2) list = list.filter((p) => p.status === "pausado");
    return list;
  }, [search, tab]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const ativos = PRODUCTS.filter((p) => p.status === "ativo").length;
  const totalVendas = PRODUCTS.reduce((a, p) => a + p.sold, 0);
  const totalReceita = PRODUCTS.reduce((a, p) => a + p.revenue, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Meus Produtos"
        subtitle="Os produtos que você está vendendo, com performance em tempo real."
        actions={
          <Link href="/vitrine-de-produtos">
            <button
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: "var(--r-md)",
                border: 0,
                background: "var(--kai-orange)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <ShoppingCart size={14} /> Buscar produtos na vitrine
            </button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard icon={Package}    label="Produtos ativos"   value={String(ativos)} />
        <StatCard icon={ShoppingCart} label="Vendas no mês"   value={String(totalVendas)} />
        <StatCard icon={TrendingUp} label="Receita gerada"    value="R$ 49,6K" highlight />
        <StatCard icon={Flame}      label="Best-seller"       value="Massageador" />
      </div>

      {/* Table card */}
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: 16, borderBottom: "1px solid var(--ink-200)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              maxWidth: 360,
              height: 38,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              background: "var(--ink-50)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-pill)",
            }}
          >
            <Search size={15} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar nos meus produtos..."
              style={{ border: 0, outline: 0, flex: 1, font: "inherit", background: "transparent", color: "var(--ink-900)", fontSize: 14 }}
            />
          </div>

          {/* Tabs pill */}
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-pill)" }}>
            {TABS.map((t, i) => (
              <button
                key={i}
                onClick={() => { setTab(i); setPage(1); }}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--r-pill)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: 0,
                  background: tab === i ? "var(--ink-900)" : "transparent",
                  color: tab === i ? "white" : "var(--ink-600)",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr 1fr 1fr 1.2fr 0.5fr",
            gap: 16,
            padding: "10px 20px",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink-500)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            borderBottom: "1px solid var(--ink-200)",
          }}
        >
          <div>Produto</div>
          <div>Preço</div>
          <div>Vendas</div>
          <div>Receita</div>
          <div>Status</div>
          <div />
        </div>

        {/* Rows */}
        {slice.map((m) => (
          <Link href={`/meus-produtos/${m.id}`} key={m.id}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr 1fr 1.2fr 0.5fr",
                gap: 16,
                padding: "14px 20px",
                alignItems: "center",
                borderBottom: "1px solid var(--ink-100)",
                cursor: "pointer",
                transition: "background .12s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--ink-50)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
            >
              {/* Product */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ProductThumb tone={m.img} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-500)" }}>Estoque {m.stock} · atualizado {m.last}</span>
                </div>
              </div>

              {/* Price */}
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>
                {fmtBRL(m.price)}
              </div>

              {/* Sales */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{m.sold}</span>
                <span style={{ fontSize: 11, color: "var(--ink-500)" }}>este mês</span>
              </div>

              {/* Revenue */}
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13, color: "var(--kai-success)" }}>
                {fmtBRL(m.revenue)}
              </div>

              {/* Status */}
              <div>
                <StatusBadge status={m.status} />
              </div>

              {/* Actions */}
              <button
                onClick={(e) => e.preventDefault()}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid var(--ink-200)",
                  background: "var(--ink-0)",
                  color: "var(--ink-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          </Link>
        ))}

        {/* Empty state */}
        {slice.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ink-500)" }}>
            <Package size={32} style={{ margin: "0 auto 12px", color: "var(--ink-300)" }} />
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Nenhum produto encontrado</p>
            <p style={{ fontSize: 13 }}>Tente ajustar os filtros ou a busca.</p>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPage={setPage}
          onPerPage={(n) => { setPerPage(n); setPage(1); }}
          label="produtos"
        />
      </div>
    </motion.div>
  );
}
