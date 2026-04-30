"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  TrendingUp,
  Eye,
  Check,
  X,
  Info,
  Trash2,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  useMarketingStore,
  type OrderBump,
  type OrderBumpDiscountType,
} from "@/lib/store/marketing-store";
import { useListMeusProdutos } from "@/app/api/seller-produtos/queries";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

type FilterTab = "todos" | "ativos" | "pausados";

export default function OrderBumpPage() {
  const orderBumps = useMarketingStore((s) => s.orderBumps);
  const addOrderBump = useMarketingStore((s) => s.addOrderBump);
  const removeOrderBump = useMarketingStore((s) => s.removeOrderBump);
  const toggleOrderBump = useMarketingStore((s) => s.toggleOrderBump);

  const meusProdutos = useListMeusProdutos();

  const [filter, setFilter] = useState<FilterTab>("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    mainProductId: "",
    bumpProductId: "",
    discountType: "percent" as OrderBumpDiscountType,
    discountValue: 20,
  });

  const visible = useMemo(() => {
    if (filter === "ativos") return orderBumps.filter((b) => b.active);
    if (filter === "pausados") return orderBumps.filter((b) => !b.active);
    return orderBumps;
  }, [orderBumps, filter]);

  const totals = useMemo(() => {
    const totalRevenue = orderBumps.reduce((s, b) => s + b.revenue, 0);
    const totalViews = orderBumps.reduce((s, b) => s + b.views, 0);
    const totalAccepts = orderBumps.reduce((s, b) => s + b.accepts, 0);
    const acceptRate = totalViews
      ? ((totalAccepts / totalViews) * 100).toFixed(1)
      : "0.0";
    return { totalRevenue, totalViews, totalAccepts, acceptRate };
  }, [orderBumps]);

  const productOptions = useMemo(
    () =>
      (meusProdutos.items ?? []).map((m) => ({
        id: m.id,
        produtoId: m.produtoId,
        label: m.produto?.nome ?? "Produto sem nome",
        precoVenda: m.precoVenda ?? 0,
      })),
    [meusProdutos.items],
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
    if (!form.title.trim()) {
      toast.error("Informe o título do order bump.");
      return;
    }
    if (!form.mainProductId || !form.bumpProductId) {
      toast.error("Selecione o produto principal e o produto bump.");
      return;
    }
    if (form.mainProductId === form.bumpProductId) {
      toast.error("O produto bump precisa ser diferente do principal.");
      return;
    }
    if (form.discountValue <= 0) {
      toast.error("Informe um desconto maior que zero.");
      return;
    }

    const main = productOptions.find((p) => p.id === form.mainProductId);
    const bump = productOptions.find((p) => p.id === form.bumpProductId);
    if (!main || !bump) {
      toast.error("Produto não encontrado na sua vitrine.");
      return;
    }

    addOrderBump({
      active: true,
      title: form.title.trim(),
      description: form.description.trim(),
      mainProductId: main.produtoId,
      bumpProductId: bump.produtoId,
      mainProductLabel: main.label,
      bumpProductLabel: bump.label,
      discountType: form.discountType,
      discountValue: form.discountValue,
    });
    toast.success("Order bump criado.");
    setForm({
      title: "",
      description: "",
      mainProductId: "",
      bumpProductId: "",
      discountType: "percent",
      discountValue: 20,
    });
    setOpen(false);
  };

  const handleRemove = (b: OrderBump) => {
    if (!confirm(`Remover order bump "${b.title}"?`)) return;
    removeOrderBump(b.id);
    toast.success("Order bump removido.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Order Bump"
        subtitle="Ofereça produtos complementares no checkout para aumentar o ticket médio."
        actions={
          <button
            onClick={() => setOpen((v) => !v)}
            disabled={meusProdutos.isLoading}
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
              cursor: meusProdutos.isLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: meusProdutos.isLoading ? 0.6 : 1,
            }}
          >
            <Plus size={15} /> Novo order bump
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
          <strong>Configuração local.</strong> Os produtos da sua vitrine
          vêm do seller-produtos-service, mas o backend ainda não tem onde
          guardar a regra de order bump — a configuração fica no seu
          navegador e <em>não</em> dispara no checkout até o
          marketing-service ser publicado. As métricas de exibição/aceite
          também só serão preenchidas pelo backend.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard
          icon={Eye}
          label="Exibições"
          value={totals.totalViews.toLocaleString("pt-BR")}
        />
        <StatCard
          icon={Check}
          label="Aceites"
          value={totals.totalAccepts.toLocaleString("pt-BR")}
        />
        <StatCard
          icon={TrendingUp}
          label="Taxa de aceite"
          value={`${totals.acceptRate}%`}
          highlight
        />
        <StatCard
          icon={TrendingUp}
          label="Receita extra"
          value={fmtBRL(totals.totalRevenue)}
        />
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
            Novo order bump
          </h3>

          {meusProdutos.isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 12,
                color: "var(--ink-500)",
                fontSize: 13,
              }}
            >
              <Loader2 size={14} className="animate-spin" /> Carregando seus produtos…
            </div>
          ) : meusProdutos.isError ? (
            <div style={{ fontSize: 13, color: "var(--kai-danger, #dc2626)" }}>
              Falha ao carregar seus produtos. Tente novamente.
            </div>
          ) : productOptions.length < 2 ? (
            <div style={{ fontSize: 13, color: "var(--ink-600)" }}>
              Você precisa de pelo menos 2 produtos afiliados na sua vitrine
              para configurar um order bump.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-600)",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Título exibido no checkout
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Adicione + 1 unidade com 30% OFF"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-600)",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  Descrição (opcional)
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Cliente pode adicionar com 1 clique antes de pagar."
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-600)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Produto principal (gatilho)
                  </label>
                  <select
                    value={form.mainProductId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, mainProductId: e.target.value }))
                    }
                    style={inputStyle}
                  >
                    <option value="">Selecione…</option>
                    {productOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} · {fmtBRL(opt.precoVenda)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-600)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Produto bump (oferta)
                  </label>
                  <select
                    value={form.bumpProductId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bumpProductId: e.target.value }))
                    }
                    style={inputStyle}
                  >
                    <option value="">Selecione…</option>
                    {productOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} · {fmtBRL(opt.precoVenda)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-600)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Tipo de desconto
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        discountType: e.target.value as OrderBumpDiscountType,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-600)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Valor do desconto
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={form.discountType === "percent" ? 1 : 0.01}
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        discountValue: Number(e.target.value) || 0,
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
                  Salvar bump
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      <div
        style={{
          borderRadius: "var(--r-lg)",
          border: "1px solid var(--ink-200)",
          background: "var(--ink-0)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--ink-200)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            Bumps configurados ({orderBumps.length})
          </h3>
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-pill)",
            }}
          >
            {(
              [
                { k: "todos", l: "Todos" },
                { k: "ativos", l: "Ativos" },
                { k: "pausados", l: "Pausados" },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setFilter(t.k)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--r-pill)",
                  border: 0,
                  background:
                    filter === t.k ? "var(--ink-900)" : "transparent",
                  color: filter === t.k ? "white" : "var(--ink-600)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 0.8fr 0.6fr",
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
          <div>Bump</div>
          <div>Produtos</div>
          <div>Desconto</div>
          <div>Aceite</div>
          <div>Status</div>
          <div />
        </div>

        {visible.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--ink-500)",
              fontSize: 13,
            }}
          >
            Nenhum order bump nesse filtro.
          </div>
        ) : (
          visible.map((b) => {
            const rate = b.views
              ? ((b.accepts / b.views) * 100).toFixed(1)
              : "0.0";
            return (
              <div
                key={b.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1.5fr 1fr 1fr 0.8fr 0.6fr",
                  gap: 16,
                  padding: "14px 20px",
                  alignItems: "center",
                  borderBottom: "1px solid var(--ink-100)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600 }}>{b.title}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--ink-500)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.description || "Sem descrição"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    fontSize: 12,
                    color: "var(--ink-600)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>
                    Quando vende
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.mainProductLabel}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--ink-900)" }}>
                    Oferece
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.bumpProductLabel}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                  }}
                >
                  {b.discountType === "percent"
                    ? `${b.discountValue}%`
                    : fmtBRL(b.discountValue)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                    }}
                  >
                    {rate}%
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ink-500)" }}>
                    {b.accepts}/{b.views}
                  </span>
                </div>
                <div>
                  <StatusBadge status={b.active ? "ativo" : "pausado"} />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => toggleOrderBump(b.id)}
                    title={b.active ? "Pausar" : "Ativar"}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: "1px solid var(--ink-200)",
                      background: "var(--ink-0)",
                      color: "var(--ink-600)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {b.active ? <X size={12} /> : <Check size={12} />}
                  </button>
                  <button
                    onClick={() => handleRemove(b)}
                    title="Remover"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: "1px solid var(--kai-danger-bg, #fde0e0)",
                      background: "var(--kai-danger-bg, #fde0e0)",
                      color: "var(--kai-danger, #dc2626)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
