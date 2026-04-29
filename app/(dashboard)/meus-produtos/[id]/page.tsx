"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Eye,
  Copy,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Truck,
  Check,
  Pencil,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";

/* ─── Mock ─────────────────────────────────────────────────────────────────── */
const PRODUCTS: Record<string, {
  id: string; name: string; img: string; cat: string;
  price: number; cost: number; sold: number; revenue: number; status: string;
}> = {
  m1: { id: "m1", name: "Massageador Cervical Shiatsu", img: "#FFB07A", cat: "Bem-estar",   price: 197, cost: 89, sold: 84,  revenue: 16548, status: "ativo" },
  m2: { id: "m2", name: "Luminária LED Aroma 3 em 1",  img: "#FFD3B5", cat: "Casa",        price: 119, cost: 38, sold: 42,  revenue:  4998, status: "ativo" },
  m3: { id: "m3", name: "Mini Projetor Estrelas Galaxy",img: "#FFE7D5", cat: "Eletrônicos", price: 159, cost: 58, sold: 128, revenue: 20352, status: "ativo" },
  m4: { id: "m4", name: "Smartwatch Fit Pro 2026",     img: "#FFCC99", cat: "Eletrônicos", price: 249, cost: 95, sold: 31,  revenue:  7719, status: "pausado" },
  m5: { id: "m5", name: "Escova Alisadora 3D",         img: "#FFC8A2", cat: "Beleza",      price: 149, cost: 49, sold: 67,  revenue:  9983, status: "ativo" },
};

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const TAX_RATE = 0.1;
const KAIROSS_RATE = 0.0499;
const SHIPPING_COST = 18.9;

/* ─── BreakdownLine ──────────────────────────────────────────────────────────── */
function BreakdownLine({ label, val, bold, accent }: {
  label: string; val: string; bold?: boolean; accent?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
      <span style={{ color: bold ? "var(--ink-900)" : "var(--ink-600)", fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: bold ? 700 : 500, color: accent ? "var(--kai-orange-600)" : "var(--ink-900)", fontSize: bold ? 15 : 13 }}>
        {val}
      </span>
    </div>
  );
}

/* ─── Perf ─────────────────────────────────────────────────────────────────── */
function Perf({ label, val, delta, inverted }: { label: string; val: string; delta: string; inverted?: boolean }) {
  const isUp = delta.startsWith("+");
  const good = inverted ? !isUp : isUp;
  const neutral = delta === "estável";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--ink-600)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 14 }}>{val}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: neutral ? "var(--ink-500)" : good ? "var(--kai-success)" : "var(--kai-danger)" }}>
          {delta}
        </span>
      </div>
    </div>
  );
}

/* ─── ShippingOption ──────────────────────────────────────────────────────── */
function ShippingOption({ active, onClick, title, desc, badge }: {
  active: boolean; onClick: () => void;
  title: string; desc: string; badge?: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 16,
        background: active ? "var(--kai-orange-50)" : "var(--ink-0)",
        border: `1.5px solid ${active ? "var(--kai-orange)" : "var(--ink-200)"}`,
        borderRadius: "var(--r-md)",
        cursor: "pointer",
        position: "relative",
        transition: "all .15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? "var(--kai-orange)" : "var(--ink-100)", color: active ? "white" : "var(--ink-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Truck size={16} />
        </div>
        {badge && (
          <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999, background: "var(--kai-success-bg)", color: "var(--kai-success)", fontSize: 11, fontWeight: 700 }}>
            {badge}
          </span>
        )}
      </div>
      <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</h4>
      <p style={{ fontSize: 12, lineHeight: 1.4, color: "var(--ink-600)" }}>{desc}</p>
      {active && (
        <div style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderRadius: "50%", background: "var(--kai-orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={10} strokeWidth={3} color="white" />
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function MyProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const base = PRODUCTS[id] ?? PRODUCTS["m1"];

  const [price, setPrice] = useState(base.price);
  const [shippingPayer, setShippingPayer] = useState<"cliente" | "vendedor">("cliente");

  const myShipping = shippingPayer === "vendedor" ? SHIPPING_COST : 0;
  const minPrice = Math.ceil((base.cost + myShipping) / (1 - TAX_RATE - KAIROSS_RATE));

  useEffect(() => {
    if (price < minPrice) setPrice(minPrice);
  }, [minPrice]);

  const tax = price * TAX_RATE;
  const platformFee = price * KAIROSS_RATE;
  const myMargin = price - base.cost - tax - platformFee - myShipping;
  const marginPct = price > 0 ? ((myMargin / price) * 100).toFixed(1) : "0.0";
  const sku = `SKU-${base.id.toUpperCase()}-001`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
      {/* Back */}
      <Link href="/meus-produtos">
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            padding: "0 12px 0 8px",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--ink-200)",
            background: "var(--ink-0)",
            color: "var(--ink-700)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 20,
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={16} /> Voltar para Meus Produtos
        </button>
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 88, height: 88, borderRadius: "var(--r-md)", background: `linear-gradient(135deg, ${base.img}, ${base.img}cc)`, flexShrink: 0, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 10px, rgba(0,0,0,.04) 10px 11px)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 8px", borderRadius: 999, background: "var(--kai-success-bg)", color: "var(--kai-success)", fontSize: 11, fontWeight: 700, width: "fit-content" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--kai-success)" }} /> Vendendo
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{base.name}</h1>
            <div style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-600)", alignItems: "center" }}>
              <span>{base.cat}</span>
              <span>·</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{sku}</span>
              <span>·</span>
              <span>Adicionado há 12 dias</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <Eye size={14} /> Visualizar checkout
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <Copy size={14} /> Link checkout
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--kai-warn-bg)", background: "var(--kai-warn-bg)", color: "var(--kai-warn)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Pausar venda
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard icon={ShoppingCart} label="Vendas (mês)"       value={String(base.sold)} />
        <StatCard icon={TrendingUp}   label="Receita"            value={`R$ ${(base.revenue / 1000).toFixed(1).replace(".", ",")}K`} highlight />
        <StatCard icon={Receipt}      label="Lucro líquido"      value={`R$ ${((base.revenue * 0.47) / 1000).toFixed(1).replace(".", ",")}K`} />
        <StatCard icon={Eye}          label="Visualizações"      value="2.184" />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Preço */}
          <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Preço de venda</h3>
            <p style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 18 }}>Defina o preço final que o cliente verá no checkout.</p>

            <div style={{ padding: 18, background: "var(--kai-orange-50)", borderRadius: "var(--r-md)", border: "1px solid var(--kai-orange-100)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 240px", minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".1em" }}>Seu preço final</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "2px solid var(--kai-orange)", borderRadius: 12, padding: "6px 14px", boxShadow: "0 2px 6px rgba(255,107,26,0.10)" }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink-700)", fontFamily: "var(--font-mono)" }}>R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={price.toFixed(2).replace(".", ",")}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
                        const n = parseFloat(cleaned);
                        if (!isNaN(n)) setPrice(n);
                      }}
                      style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", border: 0, background: "transparent", flex: 1, minWidth: 0, outline: 0, color: "var(--ink-900)", padding: 0 }}
                    />
                    <Pencil size={14} style={{ color: "var(--kai-orange)", flexShrink: 0 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-500)" }}>Digite ou ajuste no slider abaixo</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".1em" }}>Margem estimada</span>
                  <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-mono)", color: myMargin > 0 ? "var(--kai-success)" : "var(--kai-danger)" }}>
                    {fmtBRL(myMargin)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ink-600)" }}>{marginPct}% sobre venda</span>
                </div>
              </div>
              <input
                type="range"
                min={minPrice}
                max={400}
                step={1}
                value={Math.max(price, minPrice)}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--kai-orange)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-500)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                <span>{fmtBRL(minPrice)} <span style={{ color: "var(--ink-400)" }}>· break-even</span></span>
                <span>R$ 400,00</span>
              </div>
            </div>
          </div>

          {/* Frete */}
          <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Frete</h3>
            <p style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 18 }}>Quem assume o custo do envio para o cliente?</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <ShippingOption
                active={shippingPayer === "cliente"}
                onClick={() => setShippingPayer("cliente")}
                title="Cliente paga o frete"
                desc="Calculado por CEP no checkout. Você não tem custo de envio."
                badge="Mais comum"
              />
              <ShippingOption
                active={shippingPayer === "vendedor"}
                onClick={() => setShippingPayer("vendedor")}
                title="Frete por sua conta"
                desc="Você assume o custo. Aumenta conversão mas reduz margem."
                badge="+18% conversão"
              />
            </div>
          </div>

          {/* Texto no checkout */}
          <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Texto no checkout</h3>
            <p style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 18 }}>Personalize título e descrição que o cliente verá no checkout.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6, display: "block" }}>Título no checkout</label>
                <input
                  defaultValue={`${base.name} · Frete rápido`}
                  style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid var(--ink-200)", borderRadius: "var(--r-md)", fontSize: 14, fontFamily: "inherit", background: "var(--ink-0)", color: "var(--ink-900)", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6, display: "block" }}>Sub-headline</label>
                <input
                  defaultValue="Garantia de 12 meses · Entrega em até 24h"
                  style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid var(--ink-200)", borderRadius: "var(--r-md)", fontSize: 14, fontFamily: "inherit", background: "var(--ink-0)", color: "var(--ink-900)", outline: "none" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — sticky */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 100, alignSelf: "flex-start" }}>
          {/* Breakdown */}
          <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Decomposição do preço</h3>
              <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999, background: shippingPayer === "vendedor" ? "var(--kai-orange-50)" : "var(--ink-100)", color: shippingPayer === "vendedor" ? "var(--kai-orange-600)" : "var(--ink-700)", fontSize: 11, fontWeight: 700 }}>
                {shippingPayer === "vendedor" ? "Frete: você paga" : "Frete: cliente paga"}
              </span>
            </div>
            <BreakdownLine label="Preço de venda"      val={fmtBRL(price)}        bold />
            <BreakdownLine label="− Custo do produto"  val={fmtBRL(-base.cost)} />
            <BreakdownLine label="− Impostos (10%)"    val={fmtBRL(-tax)} />
            <BreakdownLine label="− Taxa Kaiross (4,99%)" val={fmtBRL(-platformFee)} />
            {shippingPayer === "vendedor" && (
              <BreakdownLine label="− Frete (você paga)" val={fmtBRL(-myShipping)} />
            )}
            <div style={{ height: 1, background: "var(--ink-200)", margin: "12px 0" }} />
            <BreakdownLine label="Sua margem líquida"  val={fmtBRL(myMargin)}     bold accent />
            <div style={{ marginTop: 14, padding: 14, background: myMargin > 50 ? "var(--kai-success-bg)" : "var(--kai-warn-bg)", borderRadius: 12, fontSize: 13, color: myMargin > 50 ? "var(--kai-success)" : "var(--kai-warn)" }}>
              {myMargin > 50 ? "✓ Margem saudável para escalar com tráfego pago." : "⚠ Margem apertada · considere aumentar o preço."}
            </div>
          </div>

          {/* Performance */}
          <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Performance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Perf label="Conversão"       val="3,8%"     delta="+0,4pp" />
              <Perf label="Ticket médio"    val={fmtBRL(price)} delta="+R$ 12" />
              <Perf label="Avaliação cliente" val="4.8 ★"  delta="estável" />
              <Perf label="Devoluções"      val="1,2%"     delta="-0,3pp"  inverted />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
