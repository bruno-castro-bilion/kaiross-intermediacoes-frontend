"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Truck,
  CheckCircle,
  AlertTriangle,
  Download,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";

/* ─── Types & Data ──────────────────────────────────────────────────────────── */
type OrderStatus = "aguardando" | "separacao" | "enviado" | "entregue" | "devolvido";

interface Order {
  id: string;
  client: string;
  prod: string;
  val: number;
  status: OrderStatus;
  when: string;
  frete: string;
}

const BASE_ORDERS: Order[] = [
  { id: "#KAI-30481", client: "Mariana Costa",   prod: "Massageador Cervical Shiatsu",  val: 197.00, status: "enviado",    when: "há 12 min", frete: "Pago p/ cliente" },
  { id: "#KAI-30480", client: "Roberto Almeida", prod: "Mini Projetor Estrelas Galaxy", val: 159.00, status: "separacao",  when: "há 1h",     frete: "Por sua conta" },
  { id: "#KAI-30479", client: "Júlia Pereira",   prod: "Luminária LED Aroma 3 em 1",   val: 119.00, status: "aguardando", when: "há 2h",     frete: "Pago p/ cliente" },
  { id: "#KAI-30478", client: "Felipe Souza",    prod: "Smartwatch Fit Pro 2026",      val: 249.00, status: "entregue",   when: "há 4h",     frete: "Pago p/ cliente" },
  { id: "#KAI-30477", client: "Carla Mendes",    prod: "Massageador Cervical Shiatsu",  val: 197.00, status: "entregue",   when: "há 6h",     frete: "Por sua conta" },
  { id: "#KAI-30476", client: "Paulo Ferreira",  prod: "Escova Alisadora 3D",          val: 149.00, status: "enviado",    when: "há 7h",     frete: "Pago p/ cliente" },
  { id: "#KAI-30475", client: "Ana Rodrigues",   prod: "Kit Skincare Coreano",         val: 179.00, status: "entregue",   when: "há 9h",     frete: "Pago p/ cliente" },
  { id: "#KAI-30474", client: "Lucas Oliveira",  prod: "Fone Bluetooth Pro Max",       val: 229.00, status: "aguardando", when: "há 10h",    frete: "Por sua conta" },
  { id: "#KAI-30473", client: "Sofia Lima",      prod: "Smartwatch Fit Pro 2026",      val: 249.00, status: "enviado",    when: "há 11h",    frete: "Pago p/ cliente" },
  { id: "#KAI-30472", client: "Diego Santos",    prod: "Massageador Cervical Shiatsu",  val: 197.00, status: "separacao",  when: "há 12h",    frete: "Por sua conta" },
  { id: "#KAI-30471", client: "Renata Costa",    prod: "Relógio Masculino Slim",       val: 189.00, status: "devolvido",  when: "há 1d",     frete: "Pago p/ cliente" },
  { id: "#KAI-30470", client: "Marcos Alves",    prod: "Mochila Antifurto USB Pro",    val: 189.00, status: "entregue",   when: "há 1d",     frete: "Por sua conta" },
];

const TABS: { key: OrderStatus | "todos"; label: string }[] = [
  { key: "todos",      label: "Todos" },
  { key: "aguardando", label: "Aguardando" },
  { key: "separacao",  label: "Em separação" },
  { key: "enviado",    label: "Enviado" },
  { key: "entregue",   label: "Entregue" },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function Pedidos() {
  const [tab, setTab] = useState<"todos" | OrderStatus>("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return BASE_ORDERS.filter((o) => {
      const matchTab = tab === "todos" || o.status === tab;
      const matchSearch =
        o.id.toLowerCase().includes(q) ||
        o.client.toLowerCase().includes(q) ||
        o.prod.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [tab, search]);

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
        title="Pedidos"
        subtitle="Acompanhe cada pedido — do checkout à entrega."
        actions={
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Download size={14} /> Exportar
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard icon={ShoppingCart}  label="Hoje"        value="48" />
        <StatCard icon={Truck}         label="Em trânsito" value="29" />
        <StatCard icon={CheckCircle}   label="Entregues"   value="156" highlight />
        <StatCard icon={AlertTriangle} label="Atrasados"   value="3" />
      </div>

      {/* Table card */}
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: 16, borderBottom: "1px solid var(--ink-200)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-pill)" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1); }}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--r-pill)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: 0,
                  background: tab === t.key ? "var(--ink-900)" : "transparent",
                  color: tab === t.key ? "white" : "var(--ink-600)",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            style={{ flex: 1, minWidth: 240, height: 38, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-pill)", marginLeft: "auto" }}
          >
            <Search size={15} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por pedido, cliente, produto..."
              style={{ border: 0, outline: 0, flex: 1, font: "inherit", background: "transparent", color: "var(--ink-900)", fontSize: 14 }}
            />
          </div>
        </div>

        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr 1fr 0.5fr",
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
          <div>Pedido</div>
          <div>Cliente</div>
          <div>Produto</div>
          <div>Valor</div>
          <div>Status</div>
          <div>Frete</div>
          <div />
        </div>

        {/* Rows */}
        {slice.map((o) => (
          <Link href={`/pedidos/${encodeURIComponent(o.id)}`} key={o.id}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.5fr 2fr 1fr 1fr 1fr 0.5fr",
                gap: 16,
                padding: "16px 20px",
                alignItems: "center",
                borderBottom: "1px solid var(--ink-100)",
                cursor: "pointer",
                transition: "background .12s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--ink-50)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>{o.id}</span>
                <span style={{ fontSize: 11, color: "var(--ink-500)" }}>{o.when}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink-200)", color: "var(--ink-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {initials(o.client)}
                </div>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{o.client}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-700)" }}>{o.prod}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>{fmtBRL(o.val)}</div>
              <div><StatusBadge status={o.status} /></div>
              <div style={{ fontSize: 12, color: "var(--ink-600)" }}>{o.frete}</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ChevronRight size={16} style={{ color: "var(--ink-400)" }} />
              </div>
            </div>
          </Link>
        ))}

        {slice.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ink-500)" }}>
            <ShoppingCart size={32} style={{ margin: "0 auto 12px", color: "var(--ink-300)" }} />
            <p style={{ fontWeight: 600, fontSize: 14 }}>Nenhum pedido encontrado</p>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPage={setPage}
          onPerPage={(n) => { setPerPage(n); setPage(1); }}
          label="pedidos"
        />
      </div>
    </motion.div>
  );
}
