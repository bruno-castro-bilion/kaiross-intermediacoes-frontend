"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Flame,
  Star,
  ShoppingCart,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useGetProdutoById } from "@/app/api/produtos/queries";
import { useAfiliarProduto } from "@/app/api/seller-produtos/mutations";
import type { ProdutoView } from "@/app/api/produtos/types";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect fill='%23eef2f7' width='600' height='600'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='22' text-anchor='middle' dominant-baseline='middle'%3ESem imagem%3C/text%3E%3C/svg%3E";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

type PricingTone = "dark" | "orange" | "green";
type PricingMode = "sugerido" | "decide" | "zero";

function PricingCard({
  active,
  onClick,
  kicker,
  title,
  desc,
  tone,
  testIdSlug,
}: {
  active: boolean;
  onClick: () => void;
  kicker: string;
  title: string;
  desc: string;
  tone: PricingTone;
  testIdSlug: string;
}) {
  const s = {
    dark: {
      bg: "var(--ink-900)",
      fg: "white",
      kFg: "rgba(255,255,255,.6)",
      dFg: "rgba(255,255,255,.7)",
    },
    orange: {
      bg: "var(--kai-orange)",
      fg: "white",
      kFg: "rgba(255,255,255,.7)",
      dFg: "rgba(255,255,255,.85)",
    },
    green: {
      bg: "#16A34A",
      fg: "white",
      kFg: "rgba(255,255,255,.7)",
      dFg: "rgba(255,255,255,.85)",
    },
  }[tone];

  return (
    <div
      data-testid={`vitrine-detail-pricing-card-${testIdSlug}`}
      onClick={onClick}
      style={{
        padding: 14,
        background: s.bg,
        color: s.fg,
        border: "1px solid transparent",
        borderRadius: "var(--r-md)",
        cursor: "pointer",
        transition: "transform .15s ease, box-shadow .15s ease",
        transform: active ? "translateY(-1px)" : "none",
        boxShadow: active ? "0 6px 16px -6px rgba(15,23,42,0.25)" : "none",
        minHeight: 130,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
      <div
        data-testid={`vitrine-detail-pricing-card-${testIdSlug}-check`}
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
      <span
        data-testid={`vitrine-detail-pricing-card-${testIdSlug}-kicker`}
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: s.kFg,
          textTransform: "uppercase",
          letterSpacing: ".1em",
        }}
      >
        {kicker}
      </span>
      <span
        data-testid={`vitrine-detail-pricing-card-${testIdSlug}-title`}
        style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}
      >
        {title}
      </span>
      <span
        data-testid={`vitrine-detail-pricing-card-${testIdSlug}-desc`}
        style={{ fontSize: 11, color: s.dFg, lineHeight: 1.4, marginTop: "auto" }}
      >
        {desc}
      </span>
    </div>
  );
}

function DescTab({ p }: { p: ProdutoView }) {
  const desc = p.descricao?.trim();
  if (!desc) {
    return (
      <p
        data-testid="vitrine-detail-tab-descricao-empty"
        style={{ fontSize: 14, color: "var(--ink-500)" }}
      >
        Este produto ainda não possui descrição cadastrada pelo fornecedor.
      </p>
    );
  }
  return (
    <div
      data-testid="vitrine-detail-tab-descricao-content"
      style={{
        maxWidth: 760,
        fontSize: 14,
        lineHeight: 1.7,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        whiteSpace: "pre-line",
      }}
    >
      {desc}
    </div>
  );
}

function SpecsTab({ p }: { p: ProdutoView }) {
  const dim =
    p.larguraCm && p.alturaCm && p.comprimentoCm
      ? `${p.larguraCm} × ${p.alturaCm} × ${p.comprimentoCm} cm`
      : null;

  const specs: [string, string | number | undefined][] = [
    ["SKU", p.sku],
    ["EAN", p.ean],
    ["Categoria", p.categoria],
    ["Marca", p.marca],
    ["Cor", p.cor],
    ["Tamanho", p.tamanho],
    ["NCM", p.ncm],
    ["Peso", p.pesoKg ? `${p.pesoKg} kg` : undefined],
    ["Dimensões", dim ?? undefined],
    ["Garantia", p.garantiaDias ? `${p.garantiaDias} dias` : undefined],
  ];
  const filled = specs.filter(([, v]) => v !== undefined && v !== null && v !== "");

  if (filled.length === 0) {
    return (
      <p
        data-testid="vitrine-detail-tab-specs-empty"
        style={{ fontSize: 14, color: "var(--ink-500)" }}
      >
        Especificações ainda não disponíveis.
      </p>
    );
  }

  return (
    <div
      data-testid="vitrine-detail-tab-specs-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0 32px",
        maxWidth: 720,
      }}
    >
      {filled.map(([k, v]) => {
        const slug = String(k).toLowerCase().replace(/\s+/g, "-");
        return (
          <div
            data-testid={`vitrine-detail-spec-${slug}`}
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px dashed var(--ink-200)",
            }}
          >
            <span
              data-testid={`vitrine-detail-spec-${slug}-key`}
              style={{ color: "var(--ink-600)", fontSize: 13 }}
            >
              {k}
            </span>
            <span
              data-testid={`vitrine-detail-spec-${slug}-value`}
              style={{ fontWeight: 600, fontSize: 13 }}
            >
              {String(v)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ComoVenderTab() {
  const steps = [
    {
      n: 1,
      t: "Adicione aos seus produtos",
      d: 'Clique em "Vender este produto" e ele aparecerá em Meus Produtos imediatamente.',
    },
    {
      n: 2,
      t: "Configure preço e frete",
      d: "Defina seu preço de venda final e escolha quem assume o frete: você ou o cliente.",
    },
    {
      n: 3,
      t: "Compartilhe seu link de checkout",
      d: "Crie sua página de vendas e leve o cliente direto pro link de checkout do produto.",
    },
    {
      n: 4,
      t: "Receba seu lucro",
      d: "A cada venda, o split é automático: o fornecedor recebe o custo + impostos, você recebe sua margem.",
    },
  ];
  return (
    <div
      data-testid="vitrine-detail-tab-comovender-grid"
      style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}
    >
      {steps.map((s) => (
        <div
          data-testid={`vitrine-detail-step-${s.n}`}
          key={s.n}
          style={{
            padding: 18,
            background: "var(--ink-50)",
            borderRadius: "var(--r-md)",
            display: "flex",
            gap: 14,
          }}
        >
          <div
            data-testid={`vitrine-detail-step-${s.n}-number`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "var(--kai-orange)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {s.n}
          </div>
          <div
            data-testid={`vitrine-detail-step-${s.n}-content`}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <h4
              data-testid={`vitrine-detail-step-${s.n}-title`}
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              {s.t}
            </h4>
            <p
              data-testid={`vitrine-detail-step-${s.n}-desc`}
              style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-600)" }}
            >
              {s.d}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div
      data-testid="vitrine-detail-loading-state"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "120px 0",
      }}
    >
      <Loader2
        data-testid="vitrine-detail-loading-spinner"
        size={28}
        className="animate-spin"
        style={{ color: "var(--kai-orange)" }}
      />
      <span
        data-testid="vitrine-detail-loading-message"
        style={{ fontSize: 13, color: "var(--ink-500)" }}
      >
        Carregando produto…
      </span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      data-testid="vitrine-detail-error-state"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "100px 0",
        textAlign: "center",
      }}
    >
      <div
        data-testid="vitrine-detail-error-icon-wrapper"
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
        <AlertCircle size={28} style={{ color: "var(--kai-error, #dc2626)" }} />
      </div>
      <div data-testid="vitrine-detail-error-text">
        <p
          data-testid="vitrine-detail-error-title"
          className="font-semibold text-[var(--ink-900)]"
        >
          Produto indisponível
        </p>
        <p
          data-testid="vitrine-detail-error-message"
          className="text-sm text-[var(--ink-500)] mt-1"
        >
          {message}
        </p>
      </div>
      <div
        data-testid="vitrine-detail-error-actions"
        style={{ display: "flex", gap: 8 }}
      >
        <Link
          data-testid="vitrine-detail-error-back-link"
          href="/vitrine-de-produtos"
        >
          <button
            data-testid="vitrine-detail-button-back-vitrine"
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
            Voltar para a vitrine
          </button>
        </Link>
        <button
          data-testid="vitrine-detail-button-retry"
          onClick={onRetry}
          style={{
            height: 36,
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
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export default function VitrineProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const { data: produto, isLoading, isError, error, refetch } = useGetProdutoById(id);
  const afiliar = useAfiliarProduto();

  const [pricingMode, setPricingMode] = useState<PricingMode>("decide");
  const [tab, setTab] = useState<"descricao" | "specs" | "comovender">("descricao");

  // O preço de venda final é configurado em Meus Produtos depois da afiliação.
  // Aqui usamos o preço sugerido pelo fornecedor como ponto de partida.
  const precoVenda = produto?.precoSugerido ?? 0;

  if (isLoading) return <LoadingState />;
  if (isError || !produto) {
    return (
      <ErrorState
        message={error?.message ?? "Não foi possível carregar este produto."}
        onRetry={() => refetch()}
      />
    );
  }

  const img = produto.imagemPrincipalUrl?.trim() || PLACEHOLDER_IMG;
  const cat = produto.categoria?.trim() || "Geral";
  const estoque = produto.estoque ?? 0;
  const thumbImages = [img, img, img, img];

  const handleAfiliar = () => {
    if (!produto.id) return;
    if (precoVenda <= 0) {
      toast.error("Defina um preço de venda maior que zero.");
      return;
    }
    afiliar.mutate(
      { produtoId: produto.id, precoVenda },
      {
        onSuccess: () => {
          toast.success("Produto adicionado à sua vitrine!");
          router.push("/meus-produtos");
        },
        onError: (err) => {
          const apiMessage =
            (err as { response?: { data?: { error?: string; message?: string } } })
              ?.response?.data?.error ??
            (err as { response?: { data?: { error?: string; message?: string } } })
              ?.response?.data?.message ??
            err.message;
          toast.error(apiMessage || "Erro ao afiliar produto.");
        },
      },
    );
  };

  return (
    <motion.div
      data-testid="vitrine-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
      <Link
        data-testid="vitrine-detail-back-link"
        href="/vitrine-de-produtos"
      >
        <button
          data-testid="vitrine-detail-button-back"
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

      <div
        data-testid="vitrine-detail-section-main"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 32,
          marginBottom: 32,
        }}
      >
        <div
          data-testid="vitrine-detail-gallery"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div
            data-testid="vitrine-detail-main-image-wrapper"
            style={{
              background: "var(--ink-100)",
              borderRadius: "var(--r-lg)",
              aspectRatio: "1 / 1",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              data-testid="vitrine-detail-main-image"
              src={img}
              alt={produto.nome}
              referrerPolicy="no-referrer"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              data-testid="vitrine-detail-image-badges"
              style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}
            >
              {estoque > 0 && estoque <= 10 && (
                <span
                  data-testid="vitrine-detail-badge-last-units"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    height: 22,
                    padding: "0 8px",
                    borderRadius: 999,
                    background: "var(--kai-orange)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <Flame size={11} /> Últimas unidades
                </span>
              )}
              {produto.ativo !== false && (
                <span
                  data-testid="vitrine-detail-badge-ativo"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 22,
                    padding: "0 8px",
                    borderRadius: 999,
                    background: "var(--kai-success-bg)",
                    color: "var(--kai-success)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Ativo
                </span>
              )}
            </div>
            <div
              data-testid="vitrine-detail-image-sku"
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "white",
                background: "rgba(0,0,0,0.45)",
                padding: "3px 6px",
                borderRadius: 4,
                letterSpacing: ".08em",
              }}
            >
              {produto.sku ?? "PRODUCT IMAGE"}
            </div>
          </div>
          <div
            data-testid="vitrine-detail-thumbs"
            style={{ display: "flex", gap: 8 }}
          >
            {thumbImages.map((src, i) => (
              <div
                data-testid={`vitrine-detail-thumb-${i}`}
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: "1 / 1",
                  borderRadius: "var(--r-md)",
                  background: "var(--ink-100)",
                  border: i === 0 ? "2px solid var(--kai-orange)" : "1px solid var(--ink-200)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  data-testid={`vitrine-detail-thumb-${i}-image`}
                  src={src}
                  alt={`${produto.nome} thumb ${i + 1}`}
                  referrerPolicy="no-referrer"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          data-testid="vitrine-detail-section-info"
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div data-testid="vitrine-detail-info-header">
            <div
              data-testid="vitrine-detail-info-category"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ink-500)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                marginBottom: 8,
              }}
            >
              {cat}
            </div>
            <h1
              data-testid="vitrine-detail-section-info-title"
              style={{ fontSize: 30, fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}
            >
              {produto.nome}
            </h1>
            <div
              data-testid="vitrine-detail-info-meta"
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
            >
              <div
                data-testid="vitrine-detail-info-stars"
                style={{ display: "flex", gap: 2 }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    data-testid={`vitrine-detail-info-star-${s}`}
                    key={s}
                    size={14}
                    style={{ color: "var(--kai-orange)", fill: "var(--kai-orange)" }}
                  />
                ))}
              </div>
              <span
                data-testid="vitrine-detail-info-brand"
                style={{ fontWeight: 700 }}
              >
                {produto.marca ?? "Kaiross"}
              </span>
              {produto.sku ? (
                <>
                  <span
                    data-testid="vitrine-detail-info-divider"
                    style={{ color: "var(--ink-300)" }}
                  >
                    ·
                  </span>
                  <span
                    data-testid="vitrine-detail-info-sku"
                    style={{ color: "var(--ink-500)" }}
                  >
                    SKU {produto.sku}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div data-testid="vitrine-detail-section-pricing">
            <div
              data-testid="vitrine-detail-pricing-label"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ink-500)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                marginBottom: 10,
              }}
            >
              Como você quer precificar
            </div>
            <div
              data-testid="vitrine-detail-pricing-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
            >
              <PricingCard
                testIdSlug="sugerido"
                active={pricingMode === "sugerido"}
                onClick={() => setPricingMode("sugerido")}
                kicker="Preço de custo"
                title={fmtBRL(produto.precoSugerido ?? 0)}
                desc="Vender pelo preço recomendado pelo fornecedor."
                tone="dark"
              />
              <PricingCard
                testIdSlug="decide"
                active={pricingMode === "decide"}
                onClick={() => setPricingMode("decide")}
                kicker="Você decide"
                title="Defina o preço"
                desc="Venda pelo preço que quiser."
                tone="orange"
              />
              <PricingCard
                testIdSlug="zero"
                active={pricingMode === "zero"}
                onClick={() => setPricingMode("zero")}
                kicker="Zero risco"
                title="Sem capital"
                desc="Fornecedor cuida da entrega."
                tone="green"
              />
            </div>

          </div>

          <div
            data-testid="vitrine-detail-section-stock"
            style={{
              padding: 16,
              background: "var(--ink-50)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-md)",
            }}
          >
            <div
              data-testid="vitrine-detail-stock-row"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div
                data-testid="vitrine-detail-stock-text"
                style={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <span
                  data-testid="vitrine-detail-stock-label"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--ink-500)",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Estoque disponível
                </span>
                <span
                  data-testid="vitrine-detail-stock-message"
                  style={{ fontSize: 12, color: "var(--ink-600)" }}
                >
                  {estoque > 0
                    ? `${estoque.toLocaleString("pt-BR")} unidades prontas para venda`
                    : "Sem estoque no momento"}
                </span>
              </div>
              <span
                data-testid="vitrine-detail-stock-value"
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "-0.02em",
                  color: estoque > 0 ? "var(--ink-900)" : "var(--kai-error, #dc2626)",
                }}
              >
                {estoque.toLocaleString("pt-BR")}{" "}
                <span
                  data-testid="vitrine-detail-stock-unit"
                  style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-500)" }}
                >
                  un
                </span>
              </span>
            </div>
          </div>

          <button
            data-testid="vitrine-detail-button-buy"
            onClick={handleAfiliar}
            disabled={afiliar.isPending || estoque === 0 || produto.ativo === false}
            style={{
              width: "100%",
              height: 48,
              borderRadius: "var(--r-md)",
              background:
                afiliar.isPending || estoque === 0 || produto.ativo === false
                  ? "var(--ink-300)"
                  : "var(--kai-orange)",
              color: "white",
              border: 0,
              fontSize: 15,
              fontWeight: 700,
              cursor:
                afiliar.isPending || estoque === 0 || produto.ativo === false
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
              boxShadow: estoque > 0 ? "var(--sh-orange)" : "none",
              opacity: afiliar.isPending ? 0.85 : 1,
              transition: "all .15s",
            }}
          >
            {afiliar.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Adicionando…
              </>
            ) : produto.ativo === false ? (
              "Produto indisponível"
            ) : estoque === 0 ? (
              "Sem estoque"
            ) : (
              <>
                <ShoppingCart size={18} /> Vender este produto
              </>
            )}
          </button>

          <div
            data-testid="vitrine-detail-benefits"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              fontSize: 12,
              color: "var(--ink-500)",
              flexWrap: "wrap",
            }}
          >
            {["Sem mensalidade", "Despacho pelo fornecedor", "Split automático"].map(
              (item, i) => {
                const slug = item.toLowerCase().replace(/\s+/g, "-");
                return (
                  <span
                    data-testid={`vitrine-detail-benefit-${slug}`}
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Check size={13} style={{ color: "var(--kai-success)" }} /> {item}
                  </span>
                );
              },
            )}
          </div>
        </div>
      </div>

      <div
        data-testid="vitrine-detail-section-tabs"
        style={{
          borderRadius: "var(--r-lg)",
          border: "1px solid var(--ink-200)",
          background: "var(--ink-0)",
          overflow: "hidden",
        }}
      >
        <div
          data-testid="vitrine-detail-tabs-list"
          style={{ display: "flex", borderBottom: "1px solid var(--ink-200)" }}
        >
          {[
            { k: "descricao", l: "Descrição" },
            { k: "specs", l: "Especificações" },
            { k: "comovender", l: "Como vender" },
          ].map((t) => (
            <button
              data-testid={`vitrine-detail-tab-${t.k}`}
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              style={{
                padding: "16px 24px",
                border: 0,
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: tab === t.k ? "var(--kai-orange-600)" : "var(--ink-600)",
                borderBottom:
                  tab === t.k ? "2px solid var(--kai-orange)" : "2px solid transparent",
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
        <div
          data-testid="vitrine-detail-tabs-content"
          style={{ padding: 28 }}
        >
          {tab === "descricao" && <DescTab p={produto} />}
          {tab === "specs" && <SpecsTab p={produto} />}
          {tab === "comovender" && <ComoVenderTab />}
        </div>
      </div>
    </motion.div>
  );
}
