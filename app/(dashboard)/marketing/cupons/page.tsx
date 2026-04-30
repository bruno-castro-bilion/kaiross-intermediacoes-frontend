"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Copy, Check, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import {
  useMarketingStore,
  type Cupom,
  type CupomKind,
} from "@/lib/store/marketing-store";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const KIND_LABELS: Record<CupomKind, string> = {
  PERCENT: "% OFF",
  FIXED: "R$ OFF",
  FRETE_GRATIS: "Frete grátis",
};

const KIND_COLORS: Record<CupomKind, string> = {
  PERCENT: "var(--kai-orange)",
  FIXED: "var(--kai-info, #2563EB)",
  FRETE_GRATIS: "var(--kai-success)",
};

function describe(c: Cupom): string {
  if (c.kind === "PERCENT") return `${c.discountValue}% OFF`;
  if (c.kind === "FIXED") return `${fmtBRL(c.discountValue)} OFF`;
  return "Frete grátis";
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };
  return (
    <button
      onClick={copy}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "rgba(255,255,255,.18)",
        border: 0,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      title="Copiar código"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function Cupons() {
  const cupons = useMarketingStore((s) => s.cupons);
  const addCupom = useMarketingStore((s) => s.addCupom);
  const removeCupom = useMarketingStore((s) => s.removeCupom);
  const toggleCupom = useMarketingStore((s) => s.toggleCupom);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    kind: "PERCENT" as CupomKind,
    discountValue: 10,
    appliesTo: "Todos os produtos",
    maxUses: 100,
  });

  const sorted = useMemo(
    () =>
      [...cupons].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [cupons],
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 12px",
    border: "1px solid var(--ink-200)",
    borderRadius: "var(--r-md)",
    fontSize: 14,
    fontFamily: "inherit",
    background: "var(--ink-0)",
    color: "var(--ink-900)",
    outline: "none",
  };

  const handleSave = () => {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      toast.error("Informe o código do cupom.");
      return;
    }
    if (cupons.some((c) => c.code === code)) {
      toast.error("Já existe um cupom com este código.");
      return;
    }
    if (form.kind !== "FRETE_GRATIS" && form.discountValue <= 0) {
      toast.error("Informe um desconto maior que zero.");
      return;
    }
    if (form.maxUses < 1) {
      toast.error("Limite de usos deve ser pelo menos 1.");
      return;
    }
    addCupom({
      code,
      kind: form.kind,
      discountValue: form.kind === "FRETE_GRATIS" ? 0 : form.discountValue,
      appliesTo: form.appliesTo.trim() || "Todos os produtos",
      maxUses: form.maxUses,
      active: true,
    });
    toast.success("Cupom criado.");
    setForm({
      code: "",
      kind: "PERCENT",
      discountValue: 10,
      appliesTo: "Todos os produtos",
      maxUses: 100,
    });
    setOpen(false);
  };

  const handleRemove = (c: Cupom) => {
    if (!confirm(`Remover cupom ${c.code}?`)) return;
    removeCupom(c.id);
    toast.success("Cupom removido.");
  };

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
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 38,
              padding: "0 16px",
              borderRadius: "var(--r-md)",
              border: 0,
              background: "var(--kai-orange)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={15} /> Novo cupom
          </button>
        }
      />

      <div
        style={{
          display: "flex",
          gap: 10,
          padding: 14,
          background: "var(--kai-warn-bg, #FEF3C7)",
          border: "1px solid var(--kai-warn, #D97706)",
          borderRadius: "var(--r-md)",
          marginBottom: 20,
          fontSize: 13,
          color: "var(--kai-warn, #B45309)",
        }}
      >
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Configuração local.</strong> O backend Kaiross ainda não
          expõe endpoints para cupons — os códigos cadastrados aqui ficam
          salvos só no seu navegador e <em>não</em> são aplicados no
          checkout até o marketing-service ser publicado.
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 24,
            background: "var(--ink-0)",
            border: "1px solid var(--kai-orange)",
            borderRadius: "var(--r-lg)",
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Novo cupom
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>
                Código
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="BEMVINDO10"
                style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>
                Tipo
              </label>
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm((p) => ({ ...p, kind: e.target.value as CupomKind }))
                }
                style={inputStyle}
              >
                <option value="PERCENT">Percentual (% OFF)</option>
                <option value="FIXED">Valor fixo (R$ OFF)</option>
                <option value="FRETE_GRATIS">Frete grátis</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>
                {form.kind === "PERCENT"
                  ? "Desconto (%)"
                  : form.kind === "FIXED"
                    ? "Desconto (R$)"
                    : "Sem valor"}
              </label>
              <input
                type="number"
                min={0}
                step={form.kind === "PERCENT" ? 1 : 0.01}
                value={form.discountValue}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    discountValue: Number(e.target.value) || 0,
                  }))
                }
                disabled={form.kind === "FRETE_GRATIS"}
                style={{
                  ...inputStyle,
                  opacity: form.kind === "FRETE_GRATIS" ? 0.5 : 1,
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>
                Aplica em
              </label>
              <input
                value={form.appliesTo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, appliesTo: e.target.value }))
                }
                placeholder="Todos os produtos / categoria / produto específico"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>
                Limite de usos
              </label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    maxUses: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                height: 38,
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
              Cancelar
            </button>
            <button
              onClick={handleSave}
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
                fontFamily: "inherit",
              }}
            >
              Salvar cupom
            </button>
          </div>
        </motion.div>
      )}

      {sorted.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "var(--ink-50)",
            border: "1px dashed var(--ink-200)",
            borderRadius: "var(--r-lg)",
            color: "var(--ink-500)",
          }}
        >
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
            Nenhum cupom cadastrado
          </p>
          <p style={{ fontSize: 13 }}>
            Crie seu primeiro código clicando em <strong>Novo cupom</strong>.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {sorted.map((c) => {
            const usePct = c.maxUses > 0 ? (c.uses / c.maxUses) * 100 : 0;
            const color = c.active ? KIND_COLORS[c.kind] : "var(--ink-500)";
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  borderRadius: "var(--r-lg)",
                  border: "1px solid var(--ink-200)",
                  overflow: "hidden",
                  opacity: c.active ? 1 : 0.7,
                }}
              >
                <div
                  style={{
                    padding: 20,
                    background: color,
                    color: "white",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      opacity: 0.8,
                      marginBottom: 6,
                    }}
                  >
                    {KIND_LABELS[c.kind]}
                    {!c.active ? " · pausado" : ""}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {c.code}
                    </span>
                    <CopyCode code={c.code} />
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      marginTop: 12,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {describe(c)}
                  </div>
                </div>

                <div style={{ padding: 16, background: "var(--ink-0)" }}>
                  <div
                    style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}
                  >
                    Aplica em
                  </div>
                  <div
                    style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}
                  >
                    {c.appliesTo}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: "var(--ink-600)" }}>Usos</span>
                    <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                      {c.uses} / {c.maxUses}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--ink-100)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, usePct)}%`,
                        background: color,
                        borderRadius: 999,
                        transition: "width .4s",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => toggleCupom(c.id)}
                      style={{
                        flex: 1,
                        height: 32,
                        borderRadius: "var(--r-md)",
                        border: "1px solid var(--ink-200)",
                        background: "var(--ink-0)",
                        color: "var(--ink-700)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {c.active ? "Pausar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => handleRemove(c)}
                      style={{
                        flex: 1,
                        height: 32,
                        borderRadius: "var(--r-md)",
                        border: 0,
                        background: "var(--kai-danger-bg, #fde0e0)",
                        color: "var(--kai-danger, #dc2626)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <Trash2 size={12} /> Remover
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
