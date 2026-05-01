"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Eye,
  Copy,
  Receipt,
  Truck,
  Check,
  Pencil,
  Loader2,
  AlertCircle,
  Trash2,
  Save,
  Play,
} from "lucide-react";
import {
  useGetMeuProdutoById,
} from "@/app/api/seller-produtos/queries";
import {
  useAtualizarPrecoVenda,
  useExcluirSellerProduto,
  useReativarSellerProduto,
} from "@/app/api/seller-produtos/mutations";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect fill='%23eef2f7' width='600' height='600'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='22' text-anchor='middle' dominant-baseline='middle'%3ESem imagem%3C/text%3E%3C/svg%3E";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

// Regras de negócio do split de venda. Espelham o que o vendas-service usa
// no checkout — manter aqui só pra previsualizar a margem antes do pedido.
const TAX_RATE = 0.1;
const KAIROSS_RATE = 0.0499;
const SHIPPING_COST = 18.9;

function BreakdownLine({
  label,
  val,
  bold,
  accent,
}: {
  label: string;
  val: string;
  bold?: boolean;
  accent?: boolean;
}) {
  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return (
    <div
      data-testid={`produto-detail-breakdown-${slug}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        fontSize: 13,
      }}
    >
      <span
        data-testid={`produto-detail-breakdown-${slug}-label`}
        style={{
          color: bold ? "var(--ink-900)" : "var(--ink-600)",
          fontWeight: bold ? 600 : 400,
        }}
      >
        {label}
      </span>
      <span
        data-testid={`produto-detail-breakdown-${slug}-value`}
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: bold ? 700 : 500,
          color: accent ? "var(--kai-orange-600)" : "var(--ink-900)",
          fontSize: bold ? 15 : 13,
        }}
      >
        {val}
      </span>
    </div>
  );
}

function ShippingOption({
  active,
  onClick,
  title,
  desc,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  badge?: string;
}) {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return (
    <div
      data-testid={`produto-detail-shipping-option-${slug}`}
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
      <div
        data-testid={`produto-detail-shipping-option-${slug}-header`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          data-testid={`produto-detail-shipping-option-${slug}-icon`}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: active ? "var(--kai-orange)" : "var(--ink-100)",
            color: active ? "white" : "var(--ink-700)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Truck size={16} />
        </div>
        {badge && (
          <span
            data-testid={`produto-detail-shipping-option-${slug}-badge`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 20,
              padding: "0 8px",
              borderRadius: 999,
              background: "var(--kai-success-bg)",
              color: "var(--kai-success)",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <h4 data-testid={`produto-detail-shipping-option-${slug}-title`} style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</h4>
      <p data-testid={`produto-detail-shipping-option-${slug}-desc`} style={{ fontSize: 12, lineHeight: 1.4, color: "var(--ink-600)" }}>{desc}</p>
      {active && (
        <div
          data-testid={`produto-detail-shipping-option-${slug}-active-indicator`}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "var(--kai-orange)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={10} strokeWidth={3} color="white" />
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div
      data-testid="produto-detail-loading"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "120px 0",
      }}
    >
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--kai-orange)" }} />
      <span data-testid="produto-detail-loading-text" style={{ fontSize: 13, color: "var(--ink-500)" }}>Carregando seu produto…</span>
    </div>
  );
}

function NotFoundState({ message }: { message: string }) {
  return (
    <div
      data-testid="produto-detail-not-found"
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
        data-testid="produto-detail-not-found-icon-wrapper"
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
        <AlertCircle size={28} style={{ color: "var(--kai-danger, #dc2626)" }} />
      </div>
      <div data-testid="produto-detail-not-found-text-wrapper">
        <p data-testid="produto-detail-not-found-title" className="font-semibold text-[var(--ink-900)]">Produto não encontrado</p>
        <p data-testid="produto-detail-not-found-message" className="text-sm text-[var(--ink-500)] mt-1">{message}</p>
      </div>
      <Link data-testid="produto-detail-not-found-link-back" href="/meus-produtos">
        <button
          data-testid="produto-detail-not-found-button-back"
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
          Voltar para Meus Produtos
        </button>
      </Link>
    </div>
  );
}

function buildCheckoutLink(
  slugCheckout?: string,
  checkoutUrl?: string,
): string | null {
  if (checkoutUrl) return checkoutUrl;
  if (slugCheckout && typeof window !== "undefined") {
    return `${window.location.origin}/checkout/${slugCheckout}`;
  }
  return null;
}

export default function MyProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const {
    sellerProduto,
    produto,
    isLoading,
    isError,
    error,
    notFound,
    refetch,
  } = useGetMeuProdutoById(id);

  const atualizarPreco = useAtualizarPrecoVenda();
  const excluir = useExcluirSellerProduto();
  const reativar = useReativarSellerProduto();

  // O custo aqui é o `precoSugerido` que o fornecedor cadastra em
  // produtos-service. Se o catálogo mudar o custo (mais caro), o vendedor
  // vê a margem encolher imediatamente — fonte de verdade é o backend.
  const custo = produto?.precoSugerido ?? 0;
  const [shippingPayer, setShippingPayer] = useState<"cliente" | "vendedor">(
    "cliente",
  );
  const myShipping = shippingPayer === "vendedor" ? SHIPPING_COST : 0;
  const minPrice = useMemo(
    () =>
      Math.max(
        0.01,
        Math.ceil((custo + myShipping) / (1 - TAX_RATE - KAIROSS_RATE)),
      ),
    [custo, myShipping],
  );

  const [price, setPrice] = useState<number>(0);
  const [dirty, setDirty] = useState(false);

  // Sincroniza o input local com o valor que veio do backend assim que
  // a resposta chega (e em rerefetch). Não sobrescreve edições in-flight.
  useEffect(() => {
    if (sellerProduto?.precoVenda != null && !dirty) {
      setPrice(sellerProduto.precoVenda);
    }
  }, [sellerProduto?.precoVenda, dirty]);

  // Garante que o preço respeite o break-even quando o usuário troca o
  // pagador do frete (afeta minPrice).
  useEffect(() => {
    if (price > 0 && price < minPrice) {
      setPrice(minPrice);
      setDirty(true);
    }
  }, [minPrice, price]);

  if (isLoading) return <LoadingState />;
  if (notFound)
    return (
      <NotFoundState message="Esta afiliação não existe ou foi removida da sua vitrine." />
    );
  if (isError || !sellerProduto || !produto) {
    return (
      <div data-testid="produto-detail-error-page" style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
        <Link data-testid="produto-detail-error-link-back" href="/meus-produtos">
          <button
            data-testid="produto-detail-error-button-back"
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
        <div
          data-testid="produto-detail-error-card"
          style={{
            padding: 40,
            border: "1px solid var(--ink-200)",
            borderRadius: "var(--r-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
          }}
        >
          <AlertCircle size={28} style={{ color: "var(--kai-danger, #dc2626)" }} />
          <p data-testid="produto-detail-error-title" className="font-semibold text-[var(--ink-900)]">
            Falha ao carregar este produto
          </p>
          <p data-testid="produto-detail-error-message" className="text-sm text-[var(--ink-500)]">
            {error?.message ?? "Tente novamente em instantes."}
          </p>
          <button
            data-testid="produto-detail-button-retry"
            onClick={() => refetch()}
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

  const tax = price * TAX_RATE;
  const platformFee = price * KAIROSS_RATE;
  const myMargin = price - custo - tax - platformFee - myShipping;
  const marginPct = price > 0 ? ((myMargin / price) * 100).toFixed(1) : "0.0";
  const cat = produto.categoria?.trim() || "Geral";
  const img = produto.imagemPrincipalUrl?.trim() || PLACEHOLDER_IMG;
  const sku = produto.sku ?? `SKU-${produto.id.slice(0, 8).toUpperCase()}`;

  const checkoutLink = buildCheckoutLink(
    sellerProduto.slugCheckout,
    sellerProduto.checkoutUrl,
  );

  const isAtivo = sellerProduto.ativo !== false;

  const handleSavePrice = () => {
    if (!sellerProduto.id) return;
    if (price <= 0) {
      toast.error("Defina um preço maior que zero.");
      return;
    }
    if (price < minPrice) {
      toast.error(`Preço abaixo do break-even (${fmtBRL(minPrice)}).`);
      return;
    }
    atualizarPreco.mutate(
      { id: sellerProduto.id, precoVenda: Number(price.toFixed(2)) },
      {
        onSuccess: () => {
          toast.success("Preço atualizado.");
          setDirty(false);
        },
        onError: (err) => {
          const apiMessage =
            (
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            )?.response?.data?.error ??
            (
              err as {
                response?: { data?: { error?: string; message?: string } };
              }
            )?.response?.data?.message ??
            err.message;
          toast.error(apiMessage || "Erro ao atualizar preço.");
        },
      },
    );
  };

  const handleCopyCheckout = async () => {
    if (!checkoutLink) {
      toast.error("Link de checkout indisponível.");
      return;
    }
    try {
      await navigator.clipboard.writeText(checkoutLink);
      toast.success("Link de checkout copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handlePreviewCheckout = () => {
    if (!checkoutLink) {
      toast.error("Link de checkout indisponível.");
      return;
    }
    window.open(checkoutLink, "_blank", "noopener,noreferrer");
  };

  const handleDelete = () => {
    if (!sellerProduto.id) return;
    if (
      !confirm(
        `Remover "${produto.nome}" da sua vitrine? O link de checkout deixará de funcionar.`,
      )
    )
      return;
    excluir.mutate(sellerProduto.id, {
      onSuccess: () => {
        toast.success("Produto removido da sua vitrine.");
        router.push("/meus-produtos");
      },
      onError: (err) => {
        const apiMessage =
          (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          )?.response?.data?.error ??
          (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          )?.response?.data?.message ??
          err.message;
        toast.error(apiMessage || "Erro ao remover produto.");
      },
    });
  };

  const handleReactivate = () => {
    if (!sellerProduto.id) return;
    reativar.mutate(sellerProduto.id, {
      onSuccess: () => {
        toast.success("Produto reativado na sua vitrine.");
      },
      onError: (err) => {
        const apiMessage =
          (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          )?.response?.data?.error ??
          (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          )?.response?.data?.message ??
          err.message;
        toast.error(apiMessage || "Erro ao reativar produto.");
      },
    });
  };

  const sliderMax = Math.max(minPrice * 4, custo * 4, price * 1.5, 200);

  return (
    <motion.div
      data-testid="produto-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
      <Link data-testid="produto-detail-link-back" href="/meus-produtos">
        <button
          data-testid="produto-detail-button-back"
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

      <div
        data-testid="produto-detail-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div data-testid="produto-detail-header-info" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div
            data-testid="produto-detail-header-image-wrapper"
            style={{
              width: 88,
              height: 88,
              borderRadius: "var(--r-md)",
              background: "var(--ink-100)",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              data-testid="produto-detail-header-image"
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
          </div>
          <div data-testid="produto-detail-header-text" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              data-testid="produto-detail-status-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                height: 22,
                padding: "0 8px",
                borderRadius: 999,
                background: isAtivo ? "var(--kai-success-bg)" : "var(--kai-warn-bg)",
                color: isAtivo ? "var(--kai-success)" : "var(--kai-warn)",
                fontSize: 11,
                fontWeight: 700,
                width: "fit-content",
              }}
            >
              <span
                data-testid="produto-detail-status-badge-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isAtivo ? "var(--kai-success)" : "var(--kai-warn)",
                }}
              />{" "}
              {isAtivo ? "Vendendo" : "Pausado"}
            </span>
            <h1 data-testid="produto-detail-page-title" style={{ fontSize: 26, fontWeight: 800 }}>{produto.nome}</h1>
            <div
              data-testid="produto-detail-meta"
              style={{
                display: "flex",
                gap: 8,
                fontSize: 13,
                color: "var(--ink-600)",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span data-testid="produto-detail-meta-categoria">{cat}</span>
              <span>·</span>
              <span data-testid="produto-detail-meta-sku" style={{ fontFamily: "var(--font-mono)" }}>{sku}</span>
              {produto.fornecedor && (
                <>
                  <span>·</span>
                  <span data-testid="produto-detail-meta-fornecedor">Fornecedor {produto.fornecedor}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div data-testid="produto-detail-header-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            data-testid="produto-detail-button-preview-checkout"
            onClick={handlePreviewCheckout}
            disabled={!checkoutLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 34,
              padding: "0 12px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              color: "var(--ink-700)",
              fontSize: 13,
              fontWeight: 600,
              cursor: checkoutLink ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              opacity: checkoutLink ? 1 : 0.5,
            }}
          >
            <Eye size={14} /> Visualizar checkout
          </button>
          <button
            data-testid="produto-detail-button-copy-checkout"
            onClick={handleCopyCheckout}
            disabled={!checkoutLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 34,
              padding: "0 12px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              color: "var(--ink-700)",
              fontSize: 13,
              fontWeight: 600,
              cursor: checkoutLink ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              opacity: checkoutLink ? 1 : 0.5,
            }}
          >
            <Copy size={14} /> Link checkout
          </button>
          {isAtivo ? (
            <button
              data-testid="produto-detail-button-delete"
              onClick={handleDelete}
              disabled={excluir.isPending}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 34,
                padding: "0 12px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--kai-danger-bg, #fde0e0)",
                background: "var(--kai-danger-bg, #fde0e0)",
                color: "var(--kai-danger, #dc2626)",
                fontSize: 13,
                fontWeight: 600,
                cursor: excluir.isPending ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: excluir.isPending ? 0.7 : 1,
              }}
            >
              {excluir.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Removendo…
                </>
              ) : (
                <>
                  <Trash2 size={14} /> Remover da vitrine
                </>
              )}
            </button>
          ) : (
            <button
              data-testid="produto-detail-button-reactivate"
              onClick={handleReactivate}
              disabled={reativar.isPending}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 34,
                padding: "0 12px",
                borderRadius: "var(--r-md)",
                border: 0,
                background: "var(--kai-success)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: reativar.isPending ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: reativar.isPending ? 0.7 : 1,
              }}
            >
              {reativar.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Reativando…
                </>
              ) : (
                <>
                  <Play size={14} /> Reativar na vitrine
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {checkoutLink && (
        <div
          data-testid="produto-detail-checkout-link-bar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "var(--ink-50)",
            border: "1px solid var(--ink-200)",
            borderRadius: "var(--r-md)",
            marginBottom: 20,
            fontSize: 13,
            color: "var(--ink-700)",
            overflow: "hidden",
          }}
        >
          <Eye size={14} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
          <span
            data-testid="produto-detail-checkout-link-url"
            style={{
              fontFamily: "var(--font-mono)",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {checkoutLink}
          </span>
          <button
            data-testid="produto-detail-button-copy-checkout-bar"
            onClick={handleCopyCheckout}
            style={{
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--kai-orange-600)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Copiar
          </button>
        </div>
      )}

      <div data-testid="produto-detail-content-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <div data-testid="produto-detail-content-main" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            data-testid="produto-detail-section-price"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              data-testid="produto-detail-section-price-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div data-testid="produto-detail-section-price-heading-wrapper">
                <h3 data-testid="produto-detail-section-price-title" style={{ fontSize: 16, fontWeight: 700 }}>Preço de venda</h3>
                <p data-testid="produto-detail-section-price-description" style={{ fontSize: 13, color: "var(--ink-600)" }}>
                  Defina o preço final que o cliente verá no checkout.
                </p>
              </div>
              <button
                data-testid="produto-detail-button-save-price"
                onClick={handleSavePrice}
                disabled={!dirty || atualizarPreco.isPending}
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: "var(--r-md)",
                  border: 0,
                  background:
                    dirty && !atualizarPreco.isPending
                      ? "var(--kai-orange)"
                      : "var(--ink-200)",
                  color: dirty && !atualizarPreco.isPending ? "white" : "var(--ink-500)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    dirty && !atualizarPreco.isPending ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                }}
              >
                {atualizarPreco.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Salvando…
                  </>
                ) : (
                  <>
                    <Save size={14} /> Salvar preço
                  </>
                )}
              </button>
            </div>

            <div
              data-testid="produto-detail-price-card"
              style={{
                marginTop: 18,
                padding: 18,
                background: "var(--kai-orange-50)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--kai-orange-100)",
              }}
            >
              <div
                data-testid="produto-detail-price-card-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 16,
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  data-testid="produto-detail-price-input-wrapper"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flex: "1 1 240px",
                    minWidth: 0,
                  }}
                >
                  <span
                    data-testid="produto-detail-price-input-label"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--ink-500)",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                    }}
                  >
                    Seu preço final
                  </span>
                  <div
                    data-testid="produto-detail-price-input-field"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "white",
                      border: "2px solid var(--kai-orange)",
                      borderRadius: 12,
                      padding: "6px 14px",
                      boxShadow: "0 2px 6px rgba(255,107,26,0.10)",
                    }}
                  >
                    <span
                      data-testid="produto-detail-price-input-currency"
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--ink-700)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      R$
                    </span>
                    <input
                      data-testid="produto-detail-input-price"
                      type="text"
                      inputMode="decimal"
                      value={price.toFixed(2).replace(".", ",")}
                      onChange={(e) => {
                        const cleaned = e.target.value
                          .replace(/[^\d,]/g, "")
                          .replace(",", ".");
                        const n = parseFloat(cleaned);
                        if (!Number.isNaN(n)) {
                          setPrice(n);
                          setDirty(true);
                        }
                      }}
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "-0.02em",
                        border: 0,
                        background: "transparent",
                        flex: 1,
                        minWidth: 0,
                        outline: 0,
                        color: "var(--ink-900)",
                        padding: 0,
                      }}
                    />
                    <Pencil size={14} style={{ color: "var(--kai-orange)", flexShrink: 0 }} />
                  </div>
                  <span data-testid="produto-detail-price-input-hint" style={{ fontSize: 11, color: "var(--ink-500)" }}>
                    Digite ou ajuste no slider abaixo · custo do fornecedor:{" "}
                    {fmtBRL(custo)}
                  </span>
                </div>
                <div
                  data-testid="produto-detail-margin-display"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "flex-end",
                  }}
                >
                  <span
                    data-testid="produto-detail-margin-display-label"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--ink-500)",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                    }}
                  >
                    Margem estimada
                  </span>
                  <span
                    data-testid="produto-detail-margin-display-value"
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      color:
                        myMargin > 0
                          ? "var(--kai-success)"
                          : "var(--kai-danger, #dc2626)",
                    }}
                  >
                    {fmtBRL(myMargin)}
                  </span>
                  <span data-testid="produto-detail-margin-display-percent" style={{ fontSize: 12, color: "var(--ink-600)" }}>
                    {marginPct}% sobre venda
                  </span>
                </div>
              </div>
              <input
                data-testid="produto-detail-input-price-slider"
                type="range"
                min={minPrice}
                max={sliderMax}
                step={1}
                value={Math.max(price, minPrice)}
                onChange={(e) => {
                  setPrice(parseFloat(e.target.value));
                  setDirty(true);
                }}
                style={{ width: "100%", accentColor: "var(--kai-orange)" }}
              />
              <div
                data-testid="produto-detail-price-slider-bounds"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--ink-500)",
                  marginTop: 4,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span data-testid="produto-detail-price-slider-min">
                  {fmtBRL(minPrice)}{" "}
                  <span style={{ color: "var(--ink-400)" }}>· break-even</span>
                </span>
                <span data-testid="produto-detail-price-slider-max">{fmtBRL(sliderMax)}</span>
              </div>
            </div>
          </div>

          <div
            data-testid="produto-detail-section-shipping"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 data-testid="produto-detail-section-shipping-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Frete</h3>
            <p data-testid="produto-detail-section-shipping-description" style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 18 }}>
              Quem assume o custo do envio para o cliente? Afeta a margem
              mínima recomendada (break-even).
            </p>
            <div data-testid="produto-detail-shipping-options-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                badge="+conversão"
              />
            </div>
          </div>

          <div
            data-testid="produto-detail-section-info"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 data-testid="produto-detail-section-info-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              Informações do produto
            </h3>
            <p data-testid="produto-detail-section-info-description" style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 14 }}>
              Os dados abaixo são definidos pelo fornecedor e são compartilhados
              com todos os vendedores que estão na vitrine.
            </p>
            <div data-testid="produto-detail-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              {[
                ["SKU", produto.sku],
                ["EAN", produto.ean],
                ["Categoria", produto.categoria],
                ["Marca", produto.marca],
                ["Estoque do fornecedor", produto.estoque ?? "—"],
                ["Preço sugerido", fmtBRL(custo)],
                [
                  "Garantia",
                  produto.garantiaDias ? `${produto.garantiaDias} dias` : undefined,
                ],
                [
                  "Peso",
                  produto.pesoKg ? `${produto.pesoKg} kg` : undefined,
                ],
              ]
                .filter(([, v]) => v != null && v !== "")
                .map(([k, v]) => {
                  const slug = String(k)
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[̀-ͯ]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                  return (
                    <div
                      data-testid={`produto-detail-info-row-${slug}`}
                      key={String(k)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: "1px dashed var(--ink-200)",
                        fontSize: 13,
                      }}
                    >
                      <span data-testid={`produto-detail-info-row-${slug}-label`} style={{ color: "var(--ink-600)" }}>{k}</span>
                      <span data-testid={`produto-detail-info-row-${slug}-value`} style={{ fontWeight: 600 }}>{String(v)}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div
          data-testid="produto-detail-content-sidebar"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 100,
            alignSelf: "flex-start",
          }}
        >
          <div
            data-testid="produto-detail-section-breakdown"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              data-testid="produto-detail-section-breakdown-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3 data-testid="produto-detail-section-breakdown-title" style={{ fontSize: 16, fontWeight: 700 }}>Decomposição do preço</h3>
              <span
                data-testid="produto-detail-shipping-badge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 20,
                  padding: "0 8px",
                  borderRadius: 999,
                  background:
                    shippingPayer === "vendedor"
                      ? "var(--kai-orange-50)"
                      : "var(--ink-100)",
                  color:
                    shippingPayer === "vendedor"
                      ? "var(--kai-orange-600)"
                      : "var(--ink-700)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {shippingPayer === "vendedor"
                  ? "Frete: você paga"
                  : "Frete: cliente paga"}
              </span>
            </div>
            <BreakdownLine label="Preço de venda" val={fmtBRL(price)} bold />
            <BreakdownLine label="− Custo do fornecedor" val={fmtBRL(-custo)} />
            <BreakdownLine label="− Impostos (10%)" val={fmtBRL(-tax)} />
            <BreakdownLine
              label="− Taxa Kaiross (4,99%)"
              val={fmtBRL(-platformFee)}
            />
            {shippingPayer === "vendedor" && (
              <BreakdownLine
                label="− Frete (você paga)"
                val={fmtBRL(-myShipping)}
              />
            )}
            <div
              data-testid="produto-detail-breakdown-divider"
              style={{
                height: 1,
                background: "var(--ink-200)",
                margin: "12px 0",
              }}
            />
            <BreakdownLine
              label="Sua margem líquida"
              val={fmtBRL(myMargin)}
              bold
              accent
            />
            <div
              data-testid="produto-detail-margin-status"
              style={{
                marginTop: 14,
                padding: 14,
                background:
                  myMargin > 0 && myMargin >= custo * 0.3
                    ? "var(--kai-success-bg)"
                    : myMargin > 0
                      ? "var(--kai-warn-bg)"
                      : "var(--kai-danger-bg, #fde0e0)",
                borderRadius: 12,
                fontSize: 13,
                color:
                  myMargin > 0 && myMargin >= custo * 0.3
                    ? "var(--kai-success)"
                    : myMargin > 0
                      ? "var(--kai-warn)"
                      : "var(--kai-danger, #dc2626)",
              }}
            >
              {myMargin <= 0
                ? "⚠ Margem negativa · você está vendendo no prejuízo."
                : myMargin >= custo * 0.3
                  ? "✓ Margem saudável para escalar com tráfego pago."
                  : "⚠ Margem apertada · considere aumentar o preço."}
            </div>
          </div>

          <div
            data-testid="produto-detail-section-split-info"
            style={{
              padding: 20,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              data-testid="produto-detail-section-split-info-heading"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink-700)",
              }}
            >
              <Receipt size={14} /> Como o split funciona
            </div>
            <p data-testid="produto-detail-section-split-info-text" style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-600)" }}>
              No checkout, o pagamento é dividido automaticamente: o fornecedor
              recebe o custo do produto, a Kaiross retém a taxa e os impostos,
              e o restante é creditado na sua conta. Você não precisa adiantar
              estoque nem cuidar do envio.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
