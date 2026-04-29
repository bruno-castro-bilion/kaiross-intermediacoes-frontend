"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const COUPONS = [
  { code: "BEMVINDO10", discount: "10% OFF",    uses: 248, max: 500, prod: "Todos os produtos",   color: "var(--kai-orange)" },
  { code: "FRETEFREE",  discount: "Frete grátis", uses: 132, max: 200, prod: "Acima de R$ 150",  color: "var(--kai-success)" },
  { code: "BLACK50",    discount: "R$ 50 OFF",  uses: 89,  max: 100, prod: "Massageador Cervical", color: "var(--kai-info)" },
];

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={copy}
      style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.18)", border: 0, color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function Cupons() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Cupons"
        subtitle="Crie códigos promocionais para acelerar conversão."
        actions={
          <button style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={15} /> Novo cupom
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {COUPONS.map((c) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--ink-200)", overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{ padding: 20, background: c.color, color: "white", position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", opacity: .8, marginBottom: 6 }}>Código</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, letterSpacing: "0.04em" }}>{c.code}</span>
                <CopyCode code={c.code} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 12, letterSpacing: "-0.02em" }}>{c.discount}</div>
              {/* Dashed divider */}
              <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "white", opacity: .15 }} />
            </div>

            {/* Body */}
            <div style={{ padding: 16, background: "var(--ink-0)" }}>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>Aplica em</div>
              <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>{c.prod}</div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "var(--ink-600)" }}>Usos</span>
                <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{c.uses} / {c.max}</span>
              </div>
              <div style={{ height: 6, background: "var(--ink-100)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(c.uses / c.max) * 100}%`, background: c.color, borderRadius: 999, transition: "width .4s" }} />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button style={{ flex: 1, height: 32, borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Editar
                </button>
                <button style={{ flex: 1, height: 32, borderRadius: "var(--r-md)", border: 0, background: "var(--kai-danger-bg)", color: "var(--kai-danger)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Desativar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
