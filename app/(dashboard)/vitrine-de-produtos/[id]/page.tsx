"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Flame,
  Star,
  ShoppingCart,
  Check,
} from "lucide-react";

/* ─── Mock data ────────────────────────────────────────────────────────────── */
const PRODUCTS: Record<string, {
  id: string; name: string; cat: string; img: string;
  cost: number; price: number; margin: string;
  rating: number; reviews: number; sales: number;
  stock: number; stockTotal: number; stockPct: number;
  badge?: "hot" | "novo";
}> = {
  p1: { id: "p1", name: "Massageador Cervical Shiatsu", cat: "Bem-estar",   img: "#FFB07A", cost: 89,  price: 197, margin: "54%", rating: 4.8, reviews: 312, sales: 1240, stock: 1240, stockTotal: 2000, stockPct: 62, badge: "hot"  },
  p2: { id: "p2", name: "Luminária LED Aroma 3 em 1",  cat: "Casa",        img: "#FFD3B5", cost: 38,  price: 119, margin: "68%", rating: 4.6, reviews: 185, sales:  832, stock:  800, stockTotal: 1500, stockPct: 53, badge: "novo" },
  p3: { id: "p3", name: "Mini Projetor Estrelas Galaxy",cat: "Eletrônicos", img: "#FFE7D5", cost: 58,  price: 159, margin: "63%", rating: 4.9, reviews: 421, sales: 2104, stock: 1800, stockTotal: 2000, stockPct: 90, badge: "hot"  },
  p4: { id: "p4", name: "Mochila Antifurto USB Pro",   cat: "Acessórios",  img: "#F5F2EE", cost: 72,  price: 189, margin: "62%", rating: 4.5, reviews: 134, sales:  654, stock:  900, stockTotal: 1200, stockPct: 75 },
  p5: { id: "p5", name: "Escova Alisadora 3D",         cat: "Beleza",      img: "#FFC8A2", cost: 49,  price: 149, margin: "67%", rating: 4.7, reviews: 298, sales: 1843, stock: 1400, stockTotal: 1800, stockPct: 78, badge: "hot"  },
  p6: { id: "p6", name: "Kit Skincare Coreano 5 peças",cat: "Beleza",      img: "#FFE2C8", cost: 64,  price: 179, margin: "64%", rating: 4.8, reviews: 220, sales:  922, stock:  750, stockTotal: 1200, stockPct: 63, badge: "novo" },
  p7: { id: "p7", name: "Smartwatch Fit Pro 2026",     cat: "Eletrônicos", img: "#FFCC99", cost: 95,  price: 249, margin: "62%", rating: 4.6, reviews: 540, sales: 3120, stock: 1600, stockTotal: 2000, stockPct: 80, badge: "hot"  },
  p8: { id: "p8", name: "Tênis Esportivo Caminhada",   cat: "Moda",        img: "#FFD9B8", cost: 78,  price: 199, margin: "61%", rating: 4.4, reviews:  98, sales:  478, stock:  350, stockTotal:  800, stockPct: 44 },
  p9: { id: "p9", name: "Fone Bluetooth Pro Max",      cat: "Eletrônicos", img: "#FFBF94", cost: 87,  price: 229, margin: "62%", rating: 4.7, reviews: 210, sales: 1580, stock: 1100, stockTotal: 1500, stockPct: 73, badge: "hot"  },
  p10: { id: "p10", name: "Tapete Yoga Antiderrapante", cat: "Bem-estar",   img: "#FFE0C2", cost: 42, price: 129, margin: "67%", rating: 4.5, reviews: 155, sales:  745, stock:  900, stockTotal: 1200, stockPct: 75, badge: "novo" },
  p11: { id: "p11", name: "Cafeteira Portátil USB",    cat: "Casa",        img: "#FFCFA8", cost: 55,  price: 149, margin: "63%", rating: 4.3, reviews:  87, sales:  398, stock:  600, stockTotal: 1000, stockPct: 60 },
  p12: { id: "p12", name: "Relógio Masculino Slim",    cat: "Acessórios",  img: "#FFD5B0", cost: 68,  price: 189, margin: "64%", rating: 4.6, reviews: 176, sales:  987, stock:  800, stockTotal: 1200, stockPct: 67, badge: "hot"  },
};

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

/* ─── PricingCard ──────────────────────────────────────────────────────────── */
type PricingTone = "dark" | "orange" | "green";

function PricingCard({
  active, onClick, kicker, title, desc, tone,
}: {
  active: boolean; onClick: () => void;
  kicker: string; title: string; desc: string; tone: PricingTone;
}) {
  const s = {
    dark:   { bg: active ? "var(--ink-900)"   : "var(--ink-0)", fg: active ? "white" : "var(--ink-900)", kFg: active ? "rgba(255,255,255,.6)" : "var(--ink-500)", dFg: active ? "rgba(255,255,255,.7)" : "var(--ink-600)" },
    orange: { bg: active ? "var(--kai-orange)" : "var(--ink-0)", fg: active ? "white" : "var(--ink-900)", kFg: active ? "rgba(255,255,255,.7)" : "var(--kai-orange-600)", dFg: active ? "rgba(255,255,255,.85)" : "var(--ink-600)" },
    green:  { bg: active ? "#16A34A"           : "var(--ink-0)", fg: active ? "white" : "var(--ink-900)", kFg: active ? "rgba(255,255,255,.7)" : "var(--kai-success)", dFg: active ? "rgba(255,255,255,.85)" : "var(--ink-600)" },
  }[tone];

  return (
    <div
      onClick={onClick}
      style={{
        padding: 14,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${active ? "transparent" : "var(--ink-200)"}`,
        borderRadius: "var(--r-md)",
        cursor: "pointer",
        transition: "all .15s ease",
        minHeight: 130,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(255,255,255,.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={10} strokeWidth={3} color="white" />
        </div>
      )}
      <span style={{ fontSize: 10, fontWeight: 700, color: s.kFg, textTransform: "uppercase", letterSpacing: ".1em" }}>
        {kicker}
      </span>
      <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</span>
      <span style={{ fontSize: 11, color: s.dFg, lineHeight: 1.4, marginTop: "auto" }}>{desc}</span>
    </div>
  );
}

/* ─── Tab content ────────────────────────────────────────────────────────────── */
function DescTab() {
  return (
    <div style={{ maxWidth: 760, fontSize: 14, lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
      <p>Este produto foi desenvolvido para quem exige qualidade e conforto. Com tecnologia de última geração e design ergonômico, oferece uma experiência superior tanto para uso pessoal quanto para revenda.</p>
      <p>Sua durabilidade e acabamento premium garantem alta percepção de valor pelo cliente final. A embalagem sofisticada agrega ainda mais ao ticket médio e facilita a decisão de compra.</p>
      <p>Ideal para o mercado de e-commerce, este produto apresenta alta demanda e excelente avaliação entre os compradores, tornando-se uma das melhores opções para revendedores Kaiross.</p>
    </div>
  );
}

function SpecsTab() {
  const specs = [
    ["Material",       "Premium / antiestático"],
    ["Compatibilidade","Universal"],
    ["Bateria / Energia","110–240V / recarregável"],
    ["Carga",          "USB-C · 2h carga total"],
    ["Peso",           "450g"],
    ["Dimensões",      "28 × 18 × 12 cm"],
    ["Garantia fornecedor", "12 meses"],
    ["Categoria fiscal",    "NCM 8518.30.00"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 32px", maxWidth: 720 }}>
      {specs.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px dashed var(--ink-200)" }}>
          <span style={{ color: "var(--ink-600)", fontSize: 13 }}>{k}</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function ComoVenderTab() {
  const steps = [
    { n: 1, t: "Adicione aos seus produtos",   d: "Clique em \"Vender este produto\" e ele aparecerá em Meus Produtos imediatamente." },
    { n: 2, t: "Configure preço e frete",       d: "Defina seu preço de venda final e escolha quem assume o frete: você ou o cliente." },
    { n: 3, t: "Compartilhe seu link de checkout", d: "Crie sua página de vendas e leve o cliente direto pro link de checkout do produto." },
    { n: 4, t: "Receba seu lucro",              d: "A cada venda, o split é automático: o fornecedor recebe o custo + impostos, você recebe sua margem." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {steps.map((s) => (
        <div key={s.n} style={{ padding: 18, background: "var(--ink-50)", borderRadius: "var(--r-md)", display: "flex", gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--kai-orange)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
            {s.n}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600 }}>{s.t}</h4>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-600)" }}>{s.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ rating, reviews }: { rating: number; reviews: number }) {
  const breakdown = [
    { s: 5, v: Math.round(reviews * 0.72) },
    { s: 4, v: Math.round(reviews * 0.19) },
    { s: 3, v: Math.round(reviews * 0.06) },
    { s: 2, v: Math.round(reviews * 0.02) },
    { s: 1, v: Math.round(reviews * 0.01) },
  ];
  const total = breakdown.reduce((a, b) => a + b.v, 0);
  const reviewList = [
    { n: "Carla M.",    d: "há 3 dias",    r: 5, t: "Produto excelente, muito melhor do que esperava. Já indiquei para amigos." },
    { n: "Roberto A.", d: "há 1 semana",  r: 5, t: "Comprei pra revender e os clientes adoraram. Já fiz 12 vendas em 2 semanas." },
    { n: "Mariana C.", d: "há 2 semanas", r: 4, t: "Ótimo produto. Só achei que poderia vir com embalagem ainda mais premium." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--ink-900)" }}>{rating}</div>
        <div style={{ display: "flex", gap: 3 }}>
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={16} style={{ color: "var(--kai-orange)", fill: "var(--kai-orange)" }} />
          ))}
        </div>
        <span style={{ fontSize: 13, color: "var(--ink-600)" }}>{reviews} avaliações verificadas</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {breakdown.map((b) => (
            <div key={b.s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 10, color: "var(--ink-700)" }}>{b.s}</span>
              <Star size={11} style={{ color: "var(--kai-orange)", fill: "var(--kai-orange)" }} />
              <div style={{ flex: 1, height: 6, background: "var(--ink-100)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(b.v / total) * 100}%`, background: "var(--kai-orange)", borderRadius: 999 }} />
              </div>
              <span style={{ width: 28, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-500)", textAlign: "right" }}>{b.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviewList.map((r, i) => (
          <div key={i} style={{ padding: 18, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ink-200)", color: "var(--ink-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                  {r.n.split(" ").map((s) => s[0]).join("")}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.n}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-500)" }}>{r.d}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={11} style={{ color: s <= r.r ? "var(--kai-orange)" : "var(--ink-200)", fill: s <= r.r ? "var(--kai-orange)" : "var(--ink-200)" }} />
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-700)" }}>{r.t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function VitrineProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const p = PRODUCTS[id] ?? PRODUCTS["p1"];

  const [pricingMode, setPricingMode] = useState<"fixed" | "decide" | "zero">("decide");
  const [tab, setTab] = useState<"descricao" | "specs" | "comovender" | "avaliacoes">("descricao");

  const thumbColors = [p.img, "#FFE7D5", "#FFB07A", "#FFD3B5"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
      {/* Voltar */}
      <Link href="/vitrine-de-produtos">
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
          <ChevronLeft size={16} /> Voltar para a vitrine
        </button>
      </Link>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32, marginBottom: 32 }}>
        {/* Left: gallery */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${p.img}, ${p.img}cc)`,
              borderRadius: "var(--r-lg)",
              aspectRatio: "1 / 1",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 14px, rgba(0,0,0,.04) 14px 15px)" }} />
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
              {p.badge === "hot" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", borderRadius: 999, background: "var(--kai-orange)", color: "white", fontSize: 11, fontWeight: 700 }}>
                  <Flame size={11} /> Em alta
                </span>
              )}
              <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, background: "var(--kai-success-bg)", color: "var(--kai-success)", fontSize: 11, fontWeight: 700 }}>
                Top vendas
              </span>
            </div>
            <div style={{ position: "absolute", bottom: 16, right: 16, fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(0,0,0,.35)", letterSpacing: ".08em" }}>
              PRODUCT IMAGE · 1/4
            </div>
          </div>
          {/* Thumbnails */}
          <div style={{ display: "flex", gap: 8 }}>
            {thumbColors.map((c, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: "1 / 1",
                  borderRadius: "var(--r-md)",
                  background: `linear-gradient(135deg, ${c}, ${c}cc)`,
                  border: i === 0 ? "2px solid var(--kai-orange)" : "1px solid var(--ink-200)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 10px, rgba(255,255,255,.15) 10px 11px)" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Category + Title */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
              {p.cat}
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>{p.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} style={{ color: "var(--kai-orange)", fill: "var(--kai-orange)" }} />
                ))}
              </div>
              <span style={{ fontWeight: 700 }}>{p.rating}</span>
              <span style={{ color: "var(--ink-500)" }}>· {p.reviews} avaliações</span>
              <span style={{ color: "var(--ink-300)" }}>·</span>
              <span style={{ color: "var(--kai-success)", fontWeight: 600 }}>{p.sales.toLocaleString("pt-BR")} vendas em 30d</span>
            </div>
          </div>

          {/* Pricing mode */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
              Como você quer precificar
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <PricingCard active={pricingMode === "fixed"}  onClick={() => setPricingMode("fixed")}  kicker="Seu custo"    title={fmtBRL(p.cost)} desc="Preço fixo por unidade."              tone="dark"   />
              <PricingCard active={pricingMode === "decide"} onClick={() => setPricingMode("decide")} kicker="Você decide"  title="Defina o preço" desc="Venda pelo preço que quiser."         tone="orange" />
              <PricingCard active={pricingMode === "zero"}   onClick={() => setPricingMode("zero")}   kicker="Zero risco"   title="Sem capital"    desc="Fornecedor cuida da entrega."        tone="green"  />
            </div>
          </div>

          {/* Stock */}
          <div
            style={{
              padding: 16,
              background: "var(--ink-50)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-md)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".1em" }}>Estoque disponível</span>
                <span style={{ fontSize: 12, color: "var(--ink-600)" }}>{p.stockPct}% do estoque · {p.stockTotal.toLocaleString("pt-BR")} unidades totais</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
                {p.stock.toLocaleString("pt-BR")}{" "}
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-500)" }}>un</span>
              </span>
            </div>
            <div style={{ height: 8, background: "var(--ink-200)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${p.stockPct}%`, background: "linear-gradient(90deg, var(--kai-orange-300), var(--kai-orange))", borderRadius: 999 }} />
            </div>
          </div>

          {/* CTA */}
          <button
            style={{
              width: "100%",
              height: 48,
              borderRadius: "var(--r-md)",
              background: "var(--kai-orange)",
              color: "white",
              border: 0,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
              boxShadow: "var(--sh-orange)",
            }}
          >
            <ShoppingCart size={18} /> Vender este produto
          </button>

          {/* Checkmarks */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 12, color: "var(--ink-500)", flexWrap: "wrap" }}>
            {["Sem mensalidade", "Despacho pelo fornecedor", "Split automático"].map((item, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={13} style={{ color: "var(--kai-success)" }} /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs card */}
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--ink-200)" }}>
          {[
            { k: "descricao",  l: "Descrição" },
            { k: "specs",      l: "Especificações" },
            { k: "comovender", l: "Como vender" },
            { k: "avaliacoes", l: "Avaliações" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              style={{
                padding: "16px 24px",
                border: 0,
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: tab === t.k ? "var(--kai-orange-600)" : "var(--ink-600)",
                borderBottom: tab === t.k ? "2px solid var(--kai-orange)" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: -1,
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
        <div style={{ padding: 28 }}>
          {tab === "descricao" && <DescTab />}
          {tab === "specs" && <SpecsTab />}
          {tab === "comovender" && <ComoVenderTab />}
          {tab === "avaliacoes" && <ReviewsTab rating={p.rating} reviews={p.reviews} />}
        </div>
      </div>
    </motion.div>
  );
}
