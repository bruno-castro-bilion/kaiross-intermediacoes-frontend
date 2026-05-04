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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
const FIXED_FEE = 2.5; // taxa fixa por transação (KairossSplitter.TAXA_FIXA_CENTS)
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
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        fontSize: 13,
      }}
    >
      <span
        style={{
          color: bold ? "var(--ink-900)" : "var(--ink-600)",
          fontWeight: bold ? 600 : 400,
        }}
      >
        {label}
      </span>
      <span
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
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
      <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</h4>
      <p style={{ fontSize: 12, lineHeight: 1.4, color: "var(--ink-600)" }}>{desc}</p>
      {active && (
        <div
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
      <span style={{ fontSize: 13, color: "var(--ink-500)" }}>Carregando seu produto…</span>
    </div>
  );
}

function NotFoundState({ message }: { message: string }) {
  return (
    <div
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
      <div>
        <p className="font-semibold text-[var(--ink-900)]">Produto não encontrado</p>
        <p className="text-sm text-[var(--ink-500)] mt-1">{message}</p>
      </div>
      <Link href="/meus-produtos">
        <button
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
  // O domínio do checkout é decidido aqui no frontend pra não depender
  // do que o backend devolve em `checkoutUrl` (que pode estar defasado
  // em ambientes ainda não atualizados).
  if (slugCheckout) {
    return `https://pay.kaiross.com.br/${slugCheckout}`;
  }
  return checkoutUrl ?? null;
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
  const [showWhyMin, setShowWhyMin] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const myShipping = shippingPayer === "vendedor" ? SHIPPING_COST : 0;
  // Mesmo cálculo do MargemValidator (backend): vendedor precisa receber > 0.
  // (custo + frete + taxa fixa) / (1 - impostos - taxa transação)
  // Sem isso o split do gateway fica incoerente e o checkout é bloqueado.
  const minPrice = useMemo(
    () =>
      Math.max(
        0.01,
        Math.ceil(
          (custo + myShipping + FIXED_FEE) / (1 - TAX_RATE - KAIROSS_RATE),
        ),
      ),
    [custo, myShipping],
  );

  const [price, setPrice] = useState<number>(0);
  // Texto cru exibido no input. Mantido separado de `price` pra permitir
  // digitação livre (sem reformatar a cada tecla, o que fazia o cursor
  // pular e dígitos somerem). É reformatado pro canônico no blur.
  const [priceText, setPriceText] = useState<string>("0,00");
  const [dirty, setDirty] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const formatPriceText = (n: number) =>
    n.toFixed(2).replace(".", ",");

  // Sincroniza o input local com o valor que veio do backend assim que
  // a resposta chega (e em rerefetch). Não sobrescreve edições in-flight.
  useEffect(() => {
    if (sellerProduto?.precoVenda != null && !dirty) {
      setPrice(sellerProduto.precoVenda);
      setPriceText(formatPriceText(sellerProduto.precoVenda));
    }
  }, [sellerProduto?.precoVenda, dirty]);

  // Não força o preço pra cima automaticamente. O vendedor decide — se
  // ficar abaixo do mínimo, mostramos um alerta vermelho de "checkout
  // bloqueado" e o save é rejeitado.
  const checkoutBloqueado = price > 0 && price < minPrice;

  if (isLoading) return <LoadingState />;
  if (notFound)
    return (
      <NotFoundState message="Esta afiliação não existe ou foi removida da sua vitrine." />
    );
  if (isError || !sellerProduto || !produto) {
    return (
      <div style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
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
        <div
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
          <p className="font-semibold text-[var(--ink-900)]">
            Falha ao carregar este produto
          </p>
          <p className="text-sm text-[var(--ink-500)]">
            {error?.message ?? "Tente novamente em instantes."}
          </p>
          <button
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
      toast.error(
        `Preço abaixo do mínimo viável (${fmtBRL(minPrice)}). Aumente o preço para liberar o checkout.`,
      );
      return;
    }
    // Validações OK — pede confirmação antes de gravar.
    setShowConfirmSave(true);
  };

  const confirmSavePrice = () => {
    if (!sellerProduto.id) return;
    setShowConfirmSave(false);
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
    if (checkoutBloqueado) {
      toast.error(
        `Checkout bloqueado — aumente o preço para no mínimo ${fmtBRL(minPrice)} antes de compartilhar o link.`,
      );
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
    if (checkoutBloqueado) {
      toast.error(
        `Checkout bloqueado — aumente o preço para no mínimo ${fmtBRL(minPrice)} antes de visualizar.`,
      );
      return;
    }
    window.open(checkoutLink, "_blank", "noopener,noreferrer");
  };

  const handleDelete = () => {
    if (!sellerProduto.id) return;
    setConfirmRemoveOpen(true);
  };

  const confirmDelete = () => {
    if (!sellerProduto.id) return;
    excluir.mutate(sellerProduto.id, {
      onSuccess: () => {
        toast.success("Produto removido da sua vitrine.");
        setConfirmRemoveOpen(false);
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

  // sliderMax NÃO depende de `price` de propósito — antes dependia (`price * 1.5`)
  // e isso gerava feedback positivo: cada onChange aumentava o max, que fazia
  // a posição do mouse mapear pra valor maior, explodindo o número até overflow
  // (`toFixed(2)` volta a notação científica acima de 1e21).
  const sliderMax = Math.max(minPrice * 4, custo * 4, 200);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div
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
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
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
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isAtivo ? "var(--kai-success)" : "var(--kai-warn)",
                }}
              />{" "}
              {isAtivo ? "Vendendo" : "Pausado"}
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{produto.nome}</h1>
            <div
              style={{
                display: "flex",
                gap: 8,
                fontSize: 13,
                color: "var(--ink-600)",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span>{cat}</span>
              <span>·</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{sku}</span>
              {produto.fornecedor && (
                <>
                  <span>·</span>
                  <span>Fornecedor {produto.fornecedor}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={handlePreviewCheckout}
            disabled={!checkoutLink || checkoutBloqueado}
            title={
              checkoutBloqueado
                ? `Checkout bloqueado — aumente o preço para no mínimo ${fmtBRL(minPrice)}`
                : undefined
            }
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
              cursor: checkoutLink && !checkoutBloqueado ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              opacity: checkoutLink && !checkoutBloqueado ? 1 : 0.5,
            }}
          >
            <Eye size={14} /> Visualizar checkout
          </button>
          <button
            onClick={handleCopyCheckout}
            disabled={!checkoutLink || checkoutBloqueado}
            title={
              checkoutBloqueado
                ? `Checkout bloqueado — aumente o preço para no mínimo ${fmtBRL(minPrice)}`
                : undefined
            }
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
              cursor: checkoutLink && !checkoutBloqueado ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              opacity: checkoutLink && !checkoutBloqueado ? 1 : 0.5,
            }}
          >
            <Copy size={14} /> Link checkout
          </button>
          {isAtivo ? (
            <button
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "var(--ink-50)",
            border: "1px solid var(--ink-200)",
            borderRadius: "var(--r-md)",
            marginBottom: checkoutBloqueado ? 12 : 20,
            fontSize: 13,
            color: "var(--ink-700)",
            overflow: "hidden",
          }}
        >
          <Eye size={14} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
          <span
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
          {checkoutBloqueado && (
            <span
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                height: 22,
                padding: "0 8px",
                borderRadius: 999,
                background: "var(--kai-danger-bg, #fde0e0)",
                color: "var(--kai-danger, #dc2626)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <AlertCircle size={11} /> Bloqueado
            </span>
          )}
          <button
            onClick={handleCopyCheckout}
            disabled={checkoutBloqueado}
            title={
              checkoutBloqueado
                ? `Checkout bloqueado — aumente o preço para no mínimo ${fmtBRL(minPrice)}`
                : undefined
            }
            style={{
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: checkoutBloqueado
                ? "var(--ink-400)"
                : "var(--kai-orange-600)",
              background: "transparent",
              border: 0,
              cursor: checkoutBloqueado ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Copiar
          </button>
        </div>
      )}

      {checkoutBloqueado && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: "var(--kai-warn-bg, #fef3c7)",
            border: "1px solid var(--kai-warn, #f59e0b)",
            borderRadius: "var(--r-md)",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <AlertCircle
            size={16}
            style={{ color: "var(--kai-warn, #f59e0b)", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 13,
              color: "var(--ink-800)",
              flex: 1,
              minWidth: 200,
            }}
          >
            Para vender este produto, ajuste o preço para no mínimo{" "}
            <strong>{fmtBRL(minPrice)}</strong>.
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => {
                setPrice(minPrice);
                setPriceText(formatPriceText(minPrice));
                setDirty(true);
              }}
              style={{
                height: 30,
                padding: "0 12px",
                borderRadius: 6,
                border: 0,
                background: "var(--kai-warn, #f59e0b)",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Definir mínimo
            </button>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowWhyMin((v) => !v)}
                style={{
                  height: 30,
                  padding: "0 10px",
                  borderRadius: 6,
                  border: "1px solid var(--ink-300)",
                  background: "transparent",
                  color: "var(--ink-700)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Por quê?
              </button>
              {showWhyMin && (
                <>
                  <div
                    onClick={() => setShowWhyMin(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 30 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 36,
                      right: 0,
                      width: 280,
                      background: "var(--ink-0)",
                      border: "1px solid var(--ink-200)",
                      borderRadius: 8,
                      boxShadow: "var(--sh-md, 0 4px 12px rgba(0,0,0,0.1))",
                      padding: 14,
                      zIndex: 40,
                      fontSize: 12.5,
                      color: "var(--ink-700)",
                      lineHeight: 1.55,
                    }}
                  >
                    O preço mínimo cobre o custo do fornecedor (
                    <strong>{fmtBRL(custo)}</strong>), impostos (10%), taxa
                    de transação (4,99%) e taxa fixa de R$ 2,50 — sem que
                    você fique no prejuízo.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Preço de venda</h3>
                <p style={{ fontSize: 13, color: "var(--ink-600)" }}>
                  Defina o preço final que o cliente verá no checkout.
                </p>
              </div>
              <button
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
              style={{
                marginTop: 18,
                padding: 18,
                background: "var(--kai-orange-50)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--kai-orange-100)",
              }}
            >
              <div
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    flex: "1 1 240px",
                    minWidth: 0,
                  }}
                >
                  <span
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
                      type="text"
                      inputMode="decimal"
                      value={priceText}
                      onChange={(e) => {
                        // Aceita dígitos, vírgula e ponto. Limita o tamanho
                        // pra evitar números absurdos (R$ 999.999.999,99).
                        const raw = e.target.value
                          .replace(/[^\d.,]/g, "")
                          .slice(0, 13);
                        setPriceText(raw);
                        const n = parseFloat(raw.replace(",", "."));
                        if (Number.isFinite(n) && n >= 0) {
                          setPrice(n);
                          setDirty(true);
                        }
                      }}
                      onBlur={() => {
                        // Ao sair do campo, reformata pro canônico
                        // (ex.: "32" vira "32,00", "32,5" vira "32,50").
                        setPriceText(formatPriceText(price));
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
                  <span style={{ fontSize: 11, color: "var(--ink-500)" }}>
                    Digite ou ajuste no slider abaixo · custo do fornecedor:{" "}
                    {fmtBRL(custo)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "flex-end",
                  }}
                >
                  <span
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
                  <span style={{ fontSize: 12, color: "var(--ink-600)" }}>
                    {marginPct}% sobre venda
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={minPrice}
                max={sliderMax}
                step={1}
                value={Math.min(Math.max(price, minPrice), sliderMax)}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  if (Number.isFinite(n)) {
                    setPrice(n);
                    setPriceText(formatPriceText(n));
                    setDirty(true);
                  }
                }}
                style={{ width: "100%", accentColor: "var(--kai-orange)" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--ink-500)",
                  marginTop: 4,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span>
                  {fmtBRL(minPrice)}{" "}
                  <span style={{ color: "var(--ink-400)" }}>· break-even</span>
                </span>
                <span>{fmtBRL(sliderMax)}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Frete</h3>
            <p style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 18 }}>
              Quem assume o custo do envio para o cliente? Afeta a margem
              mínima recomendada (break-even).
            </p>
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
                badge="+conversão"
              />
            </div>
          </div>

          <div
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              Informações do produto
            </h3>
            <p style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 14 }}>
              Os dados abaixo são definidos pelo fornecedor e são compartilhados
              com todos os vendedores que estão na vitrine.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
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
                .map(([k, v]) => (
                  <div
                    key={String(k)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px dashed var(--ink-200)",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "var(--ink-600)" }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{String(v)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div
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
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Decomposição do preço</h3>
              <span
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
              label="− Taxa Transação (4,99%)"
              val={fmtBRL(-platformFee)}
            />
            {shippingPayer === "vendedor" && (
              <BreakdownLine
                label="− Frete (você paga)"
                val={fmtBRL(-myShipping)}
              />
            )}
            <div
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
            {/* Quando bloqueado, o alerta amarelo no topo da página já avisa
                o vendedor — evitamos repetir aqui pra reduzir ruído visual. */}
            {!checkoutBloqueado && (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  background:
                    myMargin >= custo * 0.3
                      ? "var(--kai-success-bg)"
                      : "var(--kai-warn-bg)",
                  borderRadius: 12,
                  fontSize: 13,
                  color:
                    myMargin >= custo * 0.3
                      ? "var(--kai-success)"
                      : "var(--kai-warn)",
                }}
              >
                {myMargin >= custo * 0.3
                  ? "✓ Margem saudável para escalar com tráfego pago."
                  : "⚠ Margem apertada · considere aumentar o preço."}
              </div>
            )}
          </div>

          <div
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
            <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-600)" }}>
              No checkout, o pagamento é dividido automaticamente: o fornecedor
              recebe o custo do produto, a Kaiross retém a taxa e os impostos,
              e o restante é creditado na sua conta. Você não precisa adiantar
              estoque nem cuidar do envio.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmSave} onOpenChange={setShowConfirmSave}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Confirmar alteração de preço</DialogTitle>
            <DialogDescription>
              Você está alterando o preço do seu produto para{" "}
              <strong>{fmtBRL(price)}</strong>. Esta alteração ficará registrada
              no histórico. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowConfirmSave(false)}
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
              Cancelar
            </button>
            <button
              onClick={confirmSavePrice}
              disabled={atualizarPreco.isPending}
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: "var(--r-md)",
                border: 0,
                background: "var(--kai-orange)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: atualizarPreco.isPending ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: atualizarPreco.isPending ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {atualizarPreco.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Salvando…
                </>
              ) : (
                "Continuar"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        title={`Remover "${produto.nome}" da vitrine?`}
        description={
          <>
            A afiliação fica pausada e o link de checkout para de funcionar
            imediatamente. Você pode reativar depois sem perder o histórico.
          </>
        }
        warning={
          checkoutLink ? (
            <>
              Se você está rodando anúncios apontando para{" "}
              <strong className="break-all">{checkoutLink}</strong>, pause as
              campanhas antes — o link vai parar de responder e o tráfego
              pago será perdido.
            </>
          ) : null
        }
        confirmLabel="Remover da vitrine"
        cancelLabel="Manter ativo"
        destructive
        isLoading={excluir.isPending}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}
