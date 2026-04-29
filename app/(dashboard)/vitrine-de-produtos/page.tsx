"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Flame,
  Heart,
  Star,
  Layers,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";

/* ─── Mock data ─────────────────────────────────────────────────────────────── */
const PRODUCTS = [
  { id: "p1", name: "Massageador Cervical Shiatsu", cat: "Bem-estar",    img: "#FFB07A", cost: 89.00,  price: 197.00, margin: "54%", rating: 4.8, sales: 1240, badge: "hot"  as const },
  { id: "p2", name: "Luminária LED Aroma 3 em 1",  cat: "Casa",         img: "#FFD3B5", cost: 38.00,  price: 119.00, margin: "68%", rating: 4.6, sales:  832, badge: "novo" as const },
  { id: "p3", name: "Mini Projetor Estrelas Galaxy",cat: "Eletrônicos",  img: "#FFE7D5", cost: 58.00,  price: 159.00, margin: "63%", rating: 4.9, sales: 2104, badge: "hot"  as const },
  { id: "p4", name: "Mochila Antifurto USB Pro",    cat: "Acessórios",   img: "#F5F2EE", cost: 72.00,  price: 189.00, margin: "62%", rating: 4.5, sales:  654 },
  { id: "p5", name: "Escova Alisadora 3D",          cat: "Beleza",       img: "#FFC8A2", cost: 49.00,  price: 149.00, margin: "67%", rating: 4.7, sales: 1843, badge: "hot"  as const },
  { id: "p6", name: "Kit Skincare Coreano 5 peças", cat: "Beleza",       img: "#FFE2C8", cost: 64.00,  price: 179.00, margin: "64%", rating: 4.8, sales:  922, badge: "novo" as const },
  { id: "p7", name: "Smartwatch Fit Pro 2026",      cat: "Eletrônicos",  img: "#FFCC99", cost: 95.00,  price: 249.00, margin: "62%", rating: 4.6, sales: 3120, badge: "hot"  as const },
  { id: "p8", name: "Tênis Esportivo Caminhada",    cat: "Moda",         img: "#FFD9B8", cost: 78.00,  price: 199.00, margin: "61%", rating: 4.4, sales:  478 },
  { id: "p9", name: "Fone Bluetooth Pro Max",       cat: "Eletrônicos",  img: "#FFBF94", cost: 87.00,  price: 229.00, margin: "62%", rating: 4.7, sales: 1580, badge: "hot"  as const },
  { id: "p10", name: "Tapete Yoga Antiderrapante",  cat: "Bem-estar",    img: "#FFE0C2", cost: 42.00,  price: 129.00, margin: "67%", rating: 4.5, sales:  745, badge: "novo" as const },
  { id: "p11", name: "Cafeteira Portátil USB",      cat: "Casa",         img: "#FFCFA8", cost: 55.00,  price: 149.00, margin: "63%", rating: 4.3, sales:  398 },
  { id: "p12", name: "Relógio Masculino Slim",      cat: "Acessórios",   img: "#FFD5B0", cost: 68.00,  price: 189.00, margin: "64%", rating: 4.6, sales:  987, badge: "hot"  as const },
];

const CATEGORIES = ["todas", "bem-estar", "casa", "eletrônicos", "beleza", "moda"];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

/* ─── ProductCardEditorial ──────────────────────────────────────────────────── */
function ProductCardEditorial({ p }: { p: typeof PRODUCTS[0] }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-[var(--sh-md)] hover:-translate-y-0.5">
      {/* Image area */}
      <div
        style={{
          position: "relative",
          height: 160,
          background: `linear-gradient(135deg, ${p.img}, ${p.img}aa)`,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: badge + PRODUCT label */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {p.badge ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 22,
                padding: "0 9px",
                borderRadius: 999,
                background: "var(--ink-900)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {p.badge === "hot" ? "🔥 Hot" : "✨ Novo"}
            </span>
          ) : (
            <span />
          )}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "rgba(0,0,0,0.35)",
              letterSpacing: ".08em",
            }}
          >
            PRODUCT
          </span>
        </div>

        {/* Category at bottom of image */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(0,0,0,0.55)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
          }}
        >
          {p.cat}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
          {p.name}
        </h3>

        {/* Rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 12,
            color: "var(--ink-600)",
          }}
        >
          <Star size={12} style={{ color: "var(--kai-orange)", fill: "var(--kai-orange)" }} />
          <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>{p.rating}</span>
          <span>· {p.sales.toLocaleString("pt-BR")} vendas</span>
        </div>

        {/* Você ganha + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px dashed var(--ink-200)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span
              style={{
                fontSize: 10,
                color: "var(--ink-500)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Você ganha
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--kai-orange-600)",
                fontFamily: "var(--font-mono)",
                lineHeight: 1.2,
              }}
            >
              {fmtBRL(p.price - p.cost)}
            </span>
          </div>

          <Link href={`/vitrine-de-produtos/${p.id}`}>
            <button
              style={{
                height: 34,
                padding: "0 14px",
                borderRadius: "var(--r-md)",
                background: "var(--kai-orange)",
                color: "white",
                border: 0,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Começar a vender
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function VitrineDeProtudos() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
      const matchFilter =
        filter === "todas" ||
        p.cat.toLowerCase() === filter ||
        (filter === "bem-estar" && p.cat === "Bem-estar") ||
        (filter === "eletrônicos" && p.cat === "Eletrônicos");
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Vitrine de Produtos"
        subtitle="Explore o catálogo dos fornecedores e escolha qual produto vender no seu checkout."
        actions={
          <>
            <button
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--ink-200)",
                background: "var(--ink-0)",
                color: "var(--ink-700)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <Heart size={14} /> Favoritos
            </button>
            <button
              style={{
                height: 36,
                padding: "0 14px",
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
              <Sparkles size={14} /> Recomendados pra mim
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard icon={Layers}   label="Total de produtos"        value="248" />
        <StatCard icon={TrendingUp} label="Maior margem disponível" value="68%" highlight />
        <StatCard icon={Flame}    label="Em alta esta semana"      value="32 produtos" />
      </div>

      {/* Search + Filter bar */}
      <div
        className="rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] p-4 mb-5"
        style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 240,
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 14px",
            background: "var(--ink-50)",
            border: "1px solid var(--ink-200)",
            borderRadius: "var(--r-pill)",
          }}
        >
          <Search size={16} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar produtos por nome, categoria ou fornecedor..."
            style={{
              border: 0,
              outline: 0,
              flex: 1,
              font: "inherit",
              background: "transparent",
              color: "var(--ink-900)",
              fontSize: 14,
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setPage(1); }}
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: filter === cat ? "var(--kai-orange)" : "var(--ink-200)",
                background: filter === cat ? "var(--kai-orange)" : "var(--ink-0)",
                color: filter === cat ? "white" : "var(--ink-700)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {slice.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--ink-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Search size={28} style={{ color: "var(--ink-400)" }} />
          </div>
          <div>
            <p className="font-semibold text-[var(--ink-900)]">Nenhum produto encontrado</p>
            <p className="text-sm text-[var(--ink-500)] mt-1">
              Tente ajustar os filtros ou a busca.
            </p>
          </div>
          <button
            onClick={() => { setSearch(""); setFilter("todas"); }}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              color: "var(--ink-700)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {slice.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <ProductCardEditorial p={p} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-5 rounded-[var(--r-lg)] border border-[var(--ink-200)] bg-[var(--ink-0)] overflow-hidden">
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
      )}
    </motion.div>
  );
}
