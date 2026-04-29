"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Trash2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";

interface Pixel {
  id: string;
  platform: "facebook" | "google" | "tiktok";
  pixelId: string;
  name: string;
  active: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  google:   "#EA4335",
  tiktok:   "#010101",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Meta Pixel (Facebook)",
  google:   "Google Analytics / Ads",
  tiktok:   "TikTok Pixel",
};

const INITIAL_PIXELS: Pixel[] = [
  { id: "px1", platform: "facebook", pixelId: "1234567890123456", name: "Loja Principal", active: true },
];

export default function Pixel() {
  const [pixels, setPixels] = useState<Pixel[]>(INITIAL_PIXELS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: "facebook", pixelId: "", name: "" });

  const add = () => {
    if (!form.pixelId) return;
    setPixels((prev) => [
      ...prev,
      { ...form, id: "px" + Date.now(), platform: form.platform as Pixel["platform"], active: true },
    ]);
    setForm({ platform: "facebook", pixelId: "", name: "" });
    setShowForm(false);
  };

  const remove = (id: string) => setPixels((prev) => prev.filter((p) => p.id !== id));
  const toggle = (id: string) => setPixels((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 40, padding: "0 12px",
    border: "1px solid var(--ink-200)", borderRadius: "var(--r-md)",
    fontSize: 14, fontFamily: "inherit",
    background: "var(--ink-0)", color: "var(--ink-900)", outline: "none",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[900px] mx-auto w-full"
    >
      <PageHeader
        title="Pixel de Rastreamento"
        subtitle="Conecte pixels de rastreamento para mensurar campanhas e conversões."
        actions={
          <button
            onClick={() => setShowForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Plus size={15} /> Adicionar pixel
          </button>
        }
      />

      {/* Info banner */}
      <div style={{ padding: 16, background: "var(--kai-info-bg)", borderRadius: "var(--r-md)", marginBottom: 24, fontSize: 13, color: "var(--kai-info)" }}>
        <strong>Como funciona:</strong> O pixel é disparado automaticamente a cada compra confirmada no checkout Kaiross, enviando eventos de conversão para sua plataforma de anúncios.
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: 24, background: "var(--ink-0)", border: "1px solid var(--kai-orange)", borderRadius: "var(--r-lg)", marginBottom: 20 }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Novo pixel</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>Plataforma</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                style={inputStyle}
              >
                <option value="facebook">Meta Pixel (Facebook)</option>
                <option value="google">Google Analytics / Ads</option>
                <option value="tiktok">TikTok Pixel</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>Nome identificador</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Loja Principal"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)", display: "block", marginBottom: 5 }}>ID do Pixel</label>
            <input
              value={form.pixelId}
              onChange={(e) => setForm((p) => ({ ...p, pixelId: e.target.value }))}
              placeholder="Cole aqui o ID do seu pixel..."
              style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            <button onClick={add} style={{ height: 38, padding: "0 16px", borderRadius: "var(--r-md)", border: 0, background: "var(--kai-orange)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Salvar pixel
            </button>
          </div>
        </motion.div>
      )}

      {/* Pixels list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pixels.map((px) => (
          <div key={px.id} style={{ padding: 20, background: "var(--ink-0)", border: "1px solid var(--ink-200)", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", gap: 16 }}>
            {/* Platform badge */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: PLATFORM_COLORS[px.platform], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: 16, fontWeight: 800 }}>
                {px.platform === "facebook" ? "f" : px.platform === "google" ? "G" : "T"}
              </span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{px.name || PLATFORM_LABELS[px.platform]}</span>
                <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 6px", borderRadius: 999, background: px.active ? "var(--kai-success-bg)" : "var(--ink-100)", color: px.active ? "var(--kai-success)" : "var(--ink-500)", fontSize: 10, fontWeight: 700 }}>
                  {px.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--ink-500)" }}>{PLATFORM_LABELS[px.platform]}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-600)" }}>{px.pixelId}</span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => toggle(px.id)}
                style={{ height: 32, padding: "0 12px", borderRadius: "var(--r-md)", border: "1px solid var(--ink-200)", background: "var(--ink-0)", color: "var(--ink-700)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}
              >
                {px.active ? <><X12 /> Pausar</> : <><Check size={12} /> Ativar</>}
              </button>
              <button
                onClick={() => remove(px.id)}
                style={{ width: 32, height: 32, borderRadius: "var(--r-md)", border: "1px solid var(--kai-danger-bg)", background: "var(--kai-danger-bg)", color: "var(--kai-danger)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {pixels.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ink-500)", background: "var(--ink-50)", borderRadius: "var(--r-lg)", border: "1px dashed var(--ink-200)" }}>
            <ExternalLink size={28} style={{ margin: "0 auto 12px", color: "var(--ink-300)" }} />
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Nenhum pixel configurado</p>
            <p style={{ fontSize: 13 }}>Adicione um pixel para começar a rastrear conversões.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function X12() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
