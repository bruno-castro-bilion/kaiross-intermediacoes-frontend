"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MessageCircle,
  Download,
  MoreHorizontal,
  Truck,
  Copy,
  Check,
  Zap,
  Mail,
  Phone,
  User,
  MapPin,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const timeline = [
  { key: "pedido",    label: "Pedido recebido",      when: "29 abr, 14:32", done: true,  sub: undefined },
  { key: "pago",      label: "Pagamento confirmado",  when: "29 abr, 14:33", done: true,  sub: "Pix · R$ 245,95" },
  { key: "separacao", label: "Em separação",          when: "29 abr, 15:10", done: true,  sub: "Fornecedor · CD São Paulo" },
  { key: "enviado",   label: "Enviado",               when: "29 abr, 18:45", done: true,  sub: "Sedex · BR123456789BR", current: true },
  { key: "transito",  label: "Em trânsito",           when: "Previsto 30 abr", done: false },
  { key: "entregue",  label: "Entregue",              when: "Previsto 02 mai", done: false },
];

/* ─── CopyButton ────────────────────────────────────────────────────────────── */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={copy}
      style={{
        height: 26,
        padding: "0 8px",
        borderRadius: 6,
        border: "1px solid var(--ink-200)",
        background: copied ? "var(--kai-success-bg)" : "var(--ink-0)",
        color: copied ? "var(--kai-success)" : "var(--ink-700)",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "inherit",
        flexShrink: 0,
        transition: "all .15s",
      }}
    >
      {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
    </button>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function PedidoDetail() {
  const params = useParams();
  const rawId = decodeURIComponent(params.id as string);
  const orderId = rawId.startsWith("#") ? rawId : "#KAI-30481";

  const order = {
    id: orderId,
    status: "enviado" as const,
    client: "Mariana Costa",
    placedAt: "29 abr 2026, 14:32",
    when: "há 12 min",
    email: "mariana.costa@email.com",
    phone: "+55 11 98765-4321",
    cpf: "123.456.789-00",
    address: "Rua das Acácias, 142 · Apto 71",
    city: "São Paulo · SP",
    cep: "01415-002",
    payMethod: "Pix",
    tracking: "BR123456789BR",
    carrier: "Sedex",
    shipping: 18.90,
    discount: -9.85,
    total: 245.95,
    sellerEarn: 108.00,
    fees: { gateway: 4.92, platform: 7.38 },
    items: [{ name: "Massageador Cervical Shiatsu", qty: 1, price: 197.00, img: "#FFB07A" }],
    bump: { name: "Case rígido + cabo extra", qty: 1, price: 39.90, img: "#FFD3B5" },
  };

  function maskCPF(cpf: string) {
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return d.slice(0, 3) + ".***.***-" + d.slice(9);
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0) + order.bump.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/pedidos">
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
              marginBottom: 14,
              fontFamily: "inherit",
            }}
          >
            <ChevronLeft size={16} /> Voltar para pedidos
          </button>
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>
                {order.id}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p style={{ fontSize: 15, color: "var(--ink-600)" }}>
              Realizado em {order.placedAt} · {order.when}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <MessageCircle size={14} /> Mensagem ao cliente
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Download size={14} /> Nota fiscal
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <MoreHorizontal size={14} /> Ações
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Timeline */}
          <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Linha do tempo</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 22, padding: "0 8px", borderRadius: 999, background: "var(--kai-orange-50)", color: "var(--kai-orange-600)", fontSize: 11, fontWeight: 700 }}>
                  <Truck size={12} /> {order.carrier}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-600)" }}>{order.tracking}</span>
                <button style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-600)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: "var(--ink-100)" }} />
              {timeline.map((step, i) => (
                <div key={step.key} style={{ position: "relative", paddingBottom: i === timeline.length - 1 ? 0 : 18 }}>
                  <div style={{
                    position: "absolute",
                    left: -28,
                    top: 2,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: step.done ? (step.current ? "var(--kai-orange)" : "var(--kai-success)") : "var(--ink-100)",
                    color: step.done ? "white" : "var(--ink-400)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: step.current ? "3px solid #FFE2C8" : "none",
                    boxShadow: step.current ? "0 0 0 2px var(--kai-orange)" : "none",
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {step.done ? <Check size={12} /> : <span>{i + 1}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: step.done ? "var(--ink-900)" : "var(--ink-500)", display: "flex", alignItems: "center", gap: 8 }}>
                      {step.label}
                      {step.current && (
                        <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 7px", borderRadius: 999, background: "var(--kai-orange)", color: "white", fontSize: 10, fontWeight: 700 }}>Atual</span>
                      )}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {step.when}{step.sub ? " · " + step.sub : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Itens */}
          <div style={{ background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--ink-200)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Itens do pedido</h3>
            </div>
            {order.items.map((item, i) => (
              <div key={i} style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "60px 1fr auto auto", gap: 16, alignItems: "center", borderBottom: "1px solid var(--ink-100)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${item.img}, ${item.img}aa)`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,.15) 8px 9px)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-500)" }}>SKU MAS-CER-001 · Vendedor</span>
                </div>
                <span style={{ fontSize: 13, color: "var(--ink-600)" }}>x{item.qty}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fmtBRL(item.price)}</span>
              </div>
            ))}

            {/* Bump item */}
            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "60px 1fr auto auto", gap: 16, alignItems: "center", background: "linear-gradient(90deg, rgba(255,107,26,.04), transparent)", borderBottom: "1px solid var(--ink-100)" }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${order.bump.img}, ${order.bump.img}aa)`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,.15) 8px 9px)" }} />
                <span style={{ position: "absolute", top: -6, right: -6, background: "var(--kai-orange)", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999 }}>BUMP</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{order.bump.name}</span>
                <span style={{ fontSize: 12, color: "var(--kai-orange-600)", fontWeight: 600 }}>Order bump · aceito no checkout</span>
              </div>
              <span style={{ fontSize: 13, color: "var(--ink-600)" }}>x{order.bump.qty}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fmtBRL(order.bump.price)}</span>
            </div>

            {/* Totals */}
            <div style={{ padding: "16px 20px", background: "var(--ink-50)", display: "grid", gridTemplateColumns: "1fr auto", rowGap: 8, fontSize: 14 }}>
              <span style={{ color: "var(--ink-600)" }}>Subtotal</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmtBRL(subtotal)}</span>
              <span style={{ color: "var(--ink-600)" }}>Frete · {order.carrier}</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{fmtBRL(order.shipping)}</span>
              <span style={{ color: "var(--ink-600)" }}>Desconto Pix (5%)</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--kai-success)" }}>{fmtBRL(order.discount)}</span>
              <span style={{ fontWeight: 700, fontSize: 16, paddingTop: 8, borderTop: "1px solid var(--ink-200)" }}>Total</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 18, paddingTop: 8, borderTop: "1px solid var(--ink-200)" }}>{fmtBRL(order.total)}</span>
            </div>
          </div>

          {/* Repartição */}
          <div style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Repartição financeira</h3>
              <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, background: "var(--kai-success-bg)", color: "var(--kai-success)", fontSize: 11, fontWeight: 700 }}>
                Liberado em 14 dias
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Total cobrado",             val: order.total,                               big: false, color: "var(--ink-900)" },
                { label: "Custo fornecedor",          val: 89.00,                                     big: false, color: "var(--ink-700)" },
                { label: "Taxas (gateway + plat.)",   val: order.fees.gateway + order.fees.platform,  big: false, color: "var(--ink-700)" },
                { label: "Você ganha",                val: order.sellerEarn,                          big: true,  color: "var(--kai-success)" },
              ].map((r, i) => (
                <div key={i} style={{ padding: 14, background: r.big ? "var(--kai-success-bg)" : "var(--ink-50)", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{r.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: r.big ? 800 : 700, fontSize: r.big ? 22 : 18, color: r.color }}>{fmtBRL(r.val)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Cliente */}
          <div style={{ padding: 20, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Cliente</h3>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--ink-200)", color: "var(--ink-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {order.client.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 700 }}>{order.client}</span>
                <span style={{ fontSize: 12, color: "var(--ink-500)" }}>3º pedido · cliente desde out/2025</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              {/* Email */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--ink-700)", minWidth: 0 }}>
                  <Mail size={14} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.email}</span>
                </div>
                <CopyButton value={order.email} />
              </div>
              {/* Phone */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--ink-700)", minWidth: 0 }}>
                  <Phone size={14} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
                  <span>{order.phone}</span>
                </div>
                <a
                  href={`https://wa.me/${order.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 28, height: 28, borderRadius: 6, background: "#25D366", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
              {/* CPF */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--ink-700)" }}>
                <User size={14} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
                <span>CPF {maskCPF(order.cpf)}</span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div style={{ padding: 20, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Endereço de entrega</h3>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <MapPin size={16} style={{ color: "var(--kai-orange)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{order.address}</span>
                <span style={{ color: "var(--ink-600)" }}>{order.city}</span>
                <span style={{ color: "var(--ink-600)", fontFamily: "var(--font-mono)", fontSize: 12 }}>CEP {order.cep}</span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div style={{ padding: 20, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Pagamento</h3>
            <div style={{ display: "flex", gap: 12, padding: 12, background: "var(--ink-50)", borderRadius: 10, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--ink-200)" }}>
                <Zap size={18} style={{ color: "var(--kai-orange)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{order.payMethod}</span>
                <span style={{ fontSize: 12, color: "var(--ink-500)" }}>Aprovado em 14:33 · 1 segundo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

}
