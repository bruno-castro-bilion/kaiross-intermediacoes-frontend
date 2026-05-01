"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Check, Trash2, ExternalLink, Info, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  useMarketingStore,
  type PixelPlatform,
} from "@/lib/store/marketing-store";

const PLATFORM_COLORS: Record<PixelPlatform, string> = {
  facebook: "#1877F2",
  google: "#EA4335",
  tiktok: "#010101",
};

const PLATFORM_LABELS: Record<PixelPlatform, string> = {
  facebook: "Meta Pixel (Facebook)",
  google: "Google Analytics / Ads",
  tiktok: "TikTok Pixel",
};

export default function PixelPage() {
  const pixels = useMarketingStore((s) => s.pixels);
  const addPixel = useMarketingStore((s) => s.addPixel);
  const removePixel = useMarketingStore((s) => s.removePixel);
  const togglePixel = useMarketingStore((s) => s.togglePixel);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: "facebook" as PixelPlatform,
    pixelId: "",
    name: "",
  });

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

  const handleAdd = () => {
    const pixelId = form.pixelId.trim();
    if (!pixelId) {
      toast.error("Informe o ID do pixel.");
      return;
    }
    if (
      pixels.some(
        (p) => p.platform === form.platform && p.pixelId === pixelId,
      )
    ) {
      toast.error("Este pixel já está cadastrado para essa plataforma.");
      return;
    }
    addPixel({
      platform: form.platform,
      pixelId,
      name: form.name.trim(),
      active: true,
    });
    toast.success("Pixel adicionado.");
    setForm({ platform: "facebook", pixelId: "", name: "" });
    setShowForm(false);
  };

  const handleRemove = (id: string, label: string) => {
    if (!confirm(`Remover pixel "${label}"?`)) return;
    removePixel(id);
    toast.success("Pixel removido.");
  };

  return (
    <motion.div
      data-testid="marketing-pixel-page"
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
            data-testid="marketing-pixel-button-create"
            onClick={() => setShowForm(true)}
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
            <Plus size={15} /> Adicionar pixel
          </button>
        }
      />

      <div
        data-testid="marketing-pixel-banner-warning"
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
        <div data-testid="marketing-pixel-banner-warning-text">
          <strong>Configuração local.</strong> O backend Kaiross ainda não
          tem onde guardar IDs de pixel — os IDs cadastrados aqui ficam só
          no seu navegador e <em>não</em> são disparados no checkout.
          Quando o marketing-service for publicado, esta tela passa a
          chamar a API e o pixel é injetado automaticamente nas conversões.
        </div>
      </div>

      {showForm && (
        <motion.div
          data-testid="marketing-pixel-modal-create"
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
          <h3 data-testid="marketing-pixel-modal-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Novo pixel
          </h3>
          <div
            data-testid="marketing-pixel-modal-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div data-testid="marketing-pixel-field-platform">
              <label
                data-testid="marketing-pixel-label-platform"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-600)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Plataforma
              </label>
              <select
                data-testid="marketing-pixel-select-platform"
                value={form.platform}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    platform: e.target.value as PixelPlatform,
                  }))
                }
                style={inputStyle}
              >
                <option data-testid="marketing-pixel-select-platform-option-facebook" value="facebook">Meta Pixel (Facebook)</option>
                <option data-testid="marketing-pixel-select-platform-option-google" value="google">Google Analytics / Ads</option>
                <option data-testid="marketing-pixel-select-platform-option-tiktok" value="tiktok">TikTok Pixel</option>
              </select>
            </div>
            <div data-testid="marketing-pixel-field-name">
              <label
                data-testid="marketing-pixel-label-name"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-600)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Nome identificador (opcional)
              </label>
              <input
                data-testid="marketing-pixel-input-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ex: Loja Principal"
                style={inputStyle}
              />
            </div>
          </div>
          <div data-testid="marketing-pixel-field-pixel-id" style={{ marginBottom: 16 }}>
            <label
              data-testid="marketing-pixel-label-pixel-id"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink-600)",
                display: "block",
                marginBottom: 5,
              }}
            >
              ID do Pixel
            </label>
            <input
              data-testid="marketing-pixel-input-pixel-id"
              value={form.pixelId}
              onChange={(e) =>
                setForm((p) => ({ ...p, pixelId: e.target.value }))
              }
              placeholder="Cole aqui o ID do seu pixel..."
              style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
            />
          </div>
          <div data-testid="marketing-pixel-modal-actions" style={{ display: "flex", gap: 8 }}>
            <button
              data-testid="marketing-pixel-button-cancel"
              onClick={() => setShowForm(false)}
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
              data-testid="marketing-pixel-button-save"
              onClick={handleAdd}
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
              Salvar pixel
            </button>
          </div>
        </motion.div>
      )}

      <div data-testid="marketing-pixel-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pixels.map((px) => {
          const label = px.name || PLATFORM_LABELS[px.platform];
          return (
            <div
              data-testid={`marketing-pixel-row-${px.id}`}
              key={px.id}
              style={{
                padding: 20,
                background: "var(--ink-0)",
                border: "1px solid var(--ink-200)",
                borderRadius: "var(--r-lg)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: px.active ? 1 : 0.7,
              }}
            >
              <div
                data-testid={`marketing-pixel-row-${px.id}-logo`}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: PLATFORM_COLORS[px.platform],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span data-testid={`marketing-pixel-row-${px.id}-logo-letter`} style={{ color: "white", fontSize: 16, fontWeight: 800 }}>
                  {px.platform === "facebook"
                    ? "f"
                    : px.platform === "google"
                      ? "G"
                      : "T"}
                </span>
              </div>

              <div data-testid={`marketing-pixel-row-${px.id}-info`} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <div data-testid={`marketing-pixel-row-${px.id}-title-row`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span data-testid={`marketing-pixel-row-${px.id}-name`} style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                  <span
                    data-testid={`marketing-pixel-row-${px.id}-status-badge`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: 18,
                      padding: "0 6px",
                      borderRadius: 999,
                      background: px.active
                        ? "var(--kai-success-bg)"
                        : "var(--ink-100)",
                      color: px.active ? "var(--kai-success)" : "var(--ink-500)",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {px.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <span data-testid={`marketing-pixel-row-${px.id}-platform-label`} style={{ fontSize: 12, color: "var(--ink-500)" }}>
                  {PLATFORM_LABELS[px.platform]}
                </span>
                <span
                  data-testid={`marketing-pixel-row-${px.id}-pixel-id`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--ink-600)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {px.pixelId}
                </span>
              </div>

              <div data-testid={`marketing-pixel-row-${px.id}-actions`} style={{ display: "flex", gap: 8 }}>
                <button
                  data-testid={`marketing-pixel-row-${px.id}-button-toggle`}
                  onClick={() => togglePixel(px.id)}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    borderRadius: "var(--r-md)",
                    border: "1px solid var(--ink-200)",
                    background: "var(--ink-0)",
                    color: "var(--ink-700)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {px.active ? (
                    <>
                      <X size={12} /> Pausar
                    </>
                  ) : (
                    <>
                      <Check size={12} /> Ativar
                    </>
                  )}
                </button>
                <button
                  data-testid={`marketing-pixel-row-${px.id}-button-remove`}
                  onClick={() => handleRemove(px.id, label)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--r-md)",
                    border: "1px solid var(--kai-danger-bg, #fde0e0)",
                    background: "var(--kai-danger-bg, #fde0e0)",
                    color: "var(--kai-danger, #dc2626)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Remover"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {pixels.length === 0 && (
          <div
            data-testid="marketing-pixel-empty"
            style={{
              padding: "48px 20px",
              textAlign: "center",
              color: "var(--ink-500)",
              background: "var(--ink-50)",
              borderRadius: "var(--r-lg)",
              border: "1px dashed var(--ink-200)",
            }}
          >
            <ExternalLink
              size={28}
              style={{ margin: "0 auto 12px", color: "var(--ink-300)" }}
            />
            <p data-testid="marketing-pixel-empty-title" style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              Nenhum pixel configurado
            </p>
            <p data-testid="marketing-pixel-empty-desc" style={{ fontSize: 13 }}>
              Adicione um pixel para começar a rastrear conversões.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
