"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronLeft,
  Download,
  Truck,
  Copy,
  Check,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCcw,
  ExternalLink,
  Activity,
  CreditCard,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import {
  useGetPedido,
  useHistoricoFornecedor,
  useStatusFornecedor,
} from "@/app/api/vendas/queries";
import { useReembolsarPedido } from "@/app/api/vendas/mutations";
import type {
  FornecedorIntegracaoEvento,
  PedidoView,
} from "@/app/api/vendas/types";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function fmtDateTime(raw?: string): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(raw?: string): string {
  if (!raw) return "—";
  const ts = new Date(raw).getTime();
  if (!Number.isFinite(ts)) return "—";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function CopyButton({ value, label, testId }: { value: string; label?: string; testId?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };
  return (
    <button
      onClick={copy}
      data-testid={testId ?? "pedido-detail-button-copy"}
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
      {copied ? (
        <>
          <Check size={11} /> Copiado
        </>
      ) : (
        <>
          <Copy size={11} /> {label ?? "Copiar"}
        </>
      )}
    </button>
  );
}

const EVENTO_LABEL: Record<string, string> = {
  ORDER_CREATED: "Pedido enviado ao fornecedor",
  SHIPMENT_READY: "Etiqueta de envio gerada",
  ORDER_CANCEL_REFUND: "Cancelamento/reembolso notificado",
  QUERY_ORDER_STATUS: "Consulta de status",
};

function statusToBadge(
  p: PedidoView,
):
  | "ativo"
  | "pausado"
  | "enviado"
  | "entregue"
  | "aguardando"
  | "separacao"
  | "devolvido" {
  switch (p.status) {
    case "REEMBOLSADO":
      return "devolvido";
    case "FALHA":
      return "devolvido";
    case "CARRINHO_ABANDONADO":
      return "pausado";
    case "PAGO":
      if (p.trackingCode || p.enviadoEm) return "enviado";
      return "separacao";
    case "PENDENTE":
    default:
      return "aguardando";
  }
}

interface TimelineStep {
  key: string;
  label: string;
  when?: string;
  sub?: string;
  done: boolean;
  current?: boolean;
  warn?: boolean;
}

function buildTimeline(
  pedido: PedidoView,
  historico: FornecedorIntegracaoEvento[],
): TimelineStep[] {
  const orderCreated = historico.find(
    (h) => h.eventoTipo === "ORDER_CREATED" && h.sucesso,
  );
  const shipmentReady = historico.find(
    (h) => h.eventoTipo === "SHIPMENT_READY" && h.sucesso,
  );
  const cancelRefund = historico.find(
    (h) => h.eventoTipo === "ORDER_CANCEL_REFUND" && h.sucesso,
  );
  const failedOrderCreated = historico
    .filter((h) => h.eventoTipo === "ORDER_CREATED" && !h.sucesso)
    .pop();

  const isPago =
    pedido.status === "PAGO" ||
    pedido.status === "REEMBOLSADO" ||
    !!pedido.pagoEm;
  const isEnviado = !!pedido.enviadoEm || !!pedido.trackingCode;
  const isReembolsado = pedido.status === "REEMBOLSADO";

  const steps: TimelineStep[] = [
    {
      key: "criado",
      label: "Pedido recebido",
      when: fmtDateTime(pedido.dataCriacao),
      sub: pedido.compradorEmail,
      done: true,
    },
    {
      key: "pago",
      label: "Pagamento confirmado",
      when: pedido.pagoEm ? fmtDateTime(pedido.pagoEm) : "Aguardando pagar.me",
      sub: pedido.pagarmeChargeId
        ? `Charge ${pedido.pagarmeChargeId}`
        : undefined,
      done: isPago,
      warn: pedido.status === "FALHA",
    },
    {
      key: "fornecedor",
      label: "Notificado ao fornecedor",
      when: orderCreated
        ? fmtDateTime(orderCreated.enviadoEm)
        : failedOrderCreated
          ? fmtDateTime(failedOrderCreated.enviadoEm)
          : undefined,
      sub: orderCreated
        ? `${pedido.fornecedor ?? "Fornecedor"} · HTTP ${orderCreated.httpStatus ?? 200}`
        : failedOrderCreated
          ? `Falhou: ${failedOrderCreated.erro ?? `HTTP ${failedOrderCreated.httpStatus ?? 0}`}`
          : "Pendente",
      done: !!orderCreated,
      warn: !orderCreated && !!failedOrderCreated,
    },
    {
      key: "etiqueta",
      label: "Etiqueta gerada",
      when: shipmentReady ? fmtDateTime(shipmentReady.enviadoEm) : undefined,
      sub: pedido.labelUrlA4 ? "Label A4 disponível" : "Aguardando fornecedor",
      done: !!shipmentReady,
    },
    {
      key: "enviado",
      label: "Enviado",
      when: pedido.enviadoEm ? fmtDateTime(pedido.enviadoEm) : undefined,
      sub: pedido.trackingCode
        ? `Rastreio ${pedido.trackingCode}`
        : "Aguardando rastreio",
      done: isEnviado,
      current:
        isEnviado &&
        !isReembolsado &&
        pedido.status === "PAGO",
    },
  ];

  if (isReembolsado || cancelRefund) {
    steps.push({
      key: "reembolsado",
      label: "Reembolso processado",
      when: cancelRefund
        ? fmtDateTime(cancelRefund.enviadoEm)
        : "—",
      sub: "Pagar.me devolveu o valor ao comprador",
      done: true,
      warn: true,
      current: isReembolsado,
    });
  }

  return steps;
}

function LoadingState() {
  return (
    <div
      data-testid="pedido-detail-state-loading"
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
      <span data-testid="pedido-detail-state-loading-text" style={{ fontSize: 13, color: "var(--ink-500)" }}>Carregando pedido…</span>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div data-testid="pedido-detail-state-error" style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
      <Link href="/pedidos" data-testid="pedido-detail-link-back-error">
        <button
          data-testid="pedido-detail-button-back-error"
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
          <ChevronLeft size={16} /> Voltar para pedidos
        </button>
      </Link>
      <div
        data-testid="pedido-detail-state-error-card"
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
        <p data-testid="pedido-detail-state-error-title" className="font-semibold text-[var(--ink-900)]">Pedido indisponível</p>
        <p data-testid="pedido-detail-state-error-message" className="text-sm text-[var(--ink-500)]">{message}</p>
        <button
          onClick={onRetry}
          data-testid="pedido-detail-button-retry"
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

export default function PedidoDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const { data: pedido, isLoading, isError, error, refetch } = useGetPedido(id);
  const historico = useHistoricoFornecedor(id);
  const statusFornecedor = useStatusFornecedor(id);
  const reembolsar = useReembolsarPedido();

  const timeline = useMemo(
    () => (pedido ? buildTimeline(pedido, historico.data ?? []) : []),
    [pedido, historico.data],
  );

  const subtotal = useMemo(() => {
    if (!pedido?.itens) return 0;
    return pedido.itens.reduce(
      (acc, it) => acc + (it.valorTotal ?? (it.valorUnitario ?? 0) * (it.quantidade ?? 0)),
      0,
    );
  }, [pedido]);

  if (isLoading) return <LoadingState />;
  if (isError || !pedido) {
    return (
      <ErrorState
        message={error?.message ?? "Não foi possível carregar este pedido."}
        onRetry={() => refetch()}
      />
    );
  }

  const numero = pedido.numeroPedido ?? `#${pedido.id.slice(0, 8)}`;
  const podeReembolsar = pedido.status === "PAGO";

  const handleReembolsar = () => {
    if (
      !confirm(
        `Confirmar reembolso do pedido ${numero} no valor de ${fmtBRL(
          pedido.valorTotal ?? 0,
        )}? A ação aciona o estorno na pagar.me e notifica o fornecedor.`,
      )
    ) {
      return;
    }
    reembolsar.mutate(pedido.id, {
      onSuccess: () => {
        toast.success("Reembolso solicitado.");
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
        toast.error(apiMessage || "Erro ao reembolsar pedido.");
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="pedido-detail-page"
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
      <div data-testid="pedido-detail-section-header" style={{ marginBottom: 28 }}>
        <Link href="/pedidos" data-testid="pedido-detail-link-back">
          <button
            data-testid="pedido-detail-button-back"
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
        <div
          data-testid="pedido-detail-header-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div data-testid="pedido-detail-header-info">
            <div
              data-testid="pedido-detail-header-title-row"
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <h1
                data-testid="pedido-detail-page-title"
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "-0.01em",
                }}
              >
                {numero}
              </h1>
              <StatusBadge status={statusToBadge(pedido)} testId="pedido-detail-status-badge" />
              {pedido.fornecedor && (
                <span
                  data-testid="pedido-detail-fornecedor-tag"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 22,
                    padding: "0 8px",
                    borderRadius: 999,
                    background: "var(--ink-100)",
                    color: "var(--ink-700)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Fornecedor {pedido.fornecedor}
                </span>
              )}
            </div>
            <p data-testid="pedido-detail-header-meta" style={{ fontSize: 15, color: "var(--ink-600)" }}>
              Realizado em {fmtDateTime(pedido.dataCriacao)} ·{" "}
              {relativeTime(pedido.dataCriacao)}
            </p>
          </div>
          <div data-testid="pedido-detail-header-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pedido.labelUrlA4 && (
              <a
                href={pedido.labelUrlA4}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="pedido-detail-link-download-label"
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
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "none",
                }}
              >
                <Download size={14} /> Baixar etiqueta
              </a>
            )}
            {pedido.compradorEmail && (
              <a
                href={`mailto:${pedido.compradorEmail}?subject=${encodeURIComponent(
                  `Sobre seu pedido ${numero}`,
                )}`}
                data-testid="pedido-detail-link-email-cliente"
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
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "none",
                }}
              >
                <Mail size={14} /> Email ao cliente
              </a>
            )}
            {podeReembolsar && (
              <button
                onClick={handleReembolsar}
                disabled={reembolsar.isPending}
                data-testid="pedido-detail-button-refund"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 34,
                  padding: "0 14px",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--kai-danger-bg, #fde0e0)",
                  background: "var(--kai-danger-bg, #fde0e0)",
                  color: "var(--kai-danger, #dc2626)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: reembolsar.isPending ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: reembolsar.isPending ? 0.7 : 1,
                }}
              >
                {reembolsar.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Estornando…
                  </>
                ) : (
                  <>
                    <RefreshCcw size={14} /> Reembolsar
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        data-testid="pedido-detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div data-testid="pedido-detail-column-main" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            data-testid="pedido-detail-section-timeline"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              data-testid="pedido-detail-timeline-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <h3 data-testid="pedido-detail-timeline-title" style={{ fontSize: 16, fontWeight: 700 }}>Linha do tempo</h3>
              {pedido.trackingCode && (
                <div data-testid="pedido-detail-tracking-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    data-testid="pedido-detail-tracking-tag"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      height: 22,
                      padding: "0 8px",
                      borderRadius: 999,
                      background: "var(--kai-orange-50)",
                      color: "var(--kai-orange-600)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <Truck size={12} /> Rastreio
                  </span>
                  <span
                    data-testid="pedido-detail-tracking-code"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--ink-600)",
                    }}
                  >
                    {pedido.trackingCode}
                  </span>
                  <CopyButton value={pedido.trackingCode} testId="pedido-detail-button-copy-tracking" />
                </div>
              )}
            </div>

            {historico.isLoading ? (
              <div
                data-testid="pedido-detail-timeline-loading"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--ink-500)",
                  padding: 20,
                }}
              >
                <Loader2 size={14} className="animate-spin" /> Carregando histórico do
                fornecedor…
              </div>
            ) : (
              <div data-testid="pedido-detail-timeline-list" style={{ position: "relative", paddingLeft: 28 }}>
                <div
                  data-testid="pedido-detail-timeline-line"
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    background: "var(--ink-100)",
                  }}
                />
                {timeline.map((step, i) => (
                  <div
                    key={step.key}
                    data-testid={`pedido-detail-timeline-step-${step.key}`}
                    style={{
                      position: "relative",
                      paddingBottom: i === timeline.length - 1 ? 0 : 18,
                    }}
                  >
                    <div
                      data-testid={`pedido-detail-timeline-step-${step.key}-marker`}
                      style={{
                        position: "absolute",
                        left: -28,
                        top: 2,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: step.done
                          ? step.warn
                            ? "var(--kai-danger, #dc2626)"
                            : step.current
                              ? "var(--kai-orange)"
                              : "var(--kai-success)"
                          : "var(--ink-100)",
                        color: step.done ? "white" : "var(--ink-400)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: step.current ? "3px solid #FFE2C8" : "none",
                        boxShadow: step.current
                          ? "0 0 0 2px var(--kai-orange)"
                          : "none",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {step.done ? <Check size={12} /> : <span data-testid={`pedido-detail-timeline-step-${step.key}-index`}>{i + 1}</span>}
                    </div>
                    <div data-testid={`pedido-detail-timeline-step-${step.key}-content`} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span
                        data-testid={`pedido-detail-timeline-step-${step.key}-label`}
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: step.done ? "var(--ink-900)" : "var(--ink-500)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {step.label}
                        {step.current && (
                          <span
                            data-testid={`pedido-detail-timeline-step-${step.key}-current-tag`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              height: 18,
                              padding: "0 7px",
                              borderRadius: 999,
                              background: step.warn
                                ? "var(--kai-danger, #dc2626)"
                                : "var(--kai-orange)",
                              color: "white",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            Atual
                          </span>
                        )}
                      </span>
                      <span data-testid={`pedido-detail-timeline-step-${step.key}-meta`} style={{ fontSize: 12, color: "var(--ink-500)" }}>
                        {step.when ?? "—"}
                        {step.sub ? " · " + step.sub : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            data-testid="pedido-detail-section-items"
            style={{
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
            }}
          >
            <div
              data-testid="pedido-detail-items-header"
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--ink-200)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h3 data-testid="pedido-detail-items-title" style={{ fontSize: 16, fontWeight: 700 }}>Itens do pedido</h3>
              <span data-testid="pedido-detail-items-count" style={{ fontSize: 12, color: "var(--ink-500)" }}>
                {pedido.quantidadeTotal ?? 0} unidades
              </span>
            </div>
            {(pedido.itens ?? []).length === 0 ? (
              <div
                data-testid="pedido-detail-items-empty"
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--ink-500)",
                  fontSize: 13,
                }}
              >
                Nenhum item registrado neste pedido.
              </div>
            ) : (
              (pedido.itens ?? []).map((item, i) => {
                const itemId = item.id ?? `idx-${i}`;
                return (
                <div
                  key={item.id ?? i}
                  data-testid={`pedido-detail-item-${itemId}`}
                  style={{
                    padding: "16px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 16,
                    alignItems: "center",
                    borderBottom: "1px solid var(--ink-100)",
                  }}
                >
                  <div data-testid={`pedido-detail-item-${itemId}-info`} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span data-testid={`pedido-detail-item-${itemId}-nome`} style={{ fontWeight: 600 }}>
                      {item.produtoNome ?? "Produto"}
                    </span>
                    <span data-testid={`pedido-detail-item-${itemId}-sku`} style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {item.produtoCodigo ? `SKU ${item.produtoCodigo}` : "Sem SKU"}
                    </span>
                  </div>
                  <span data-testid={`pedido-detail-item-${itemId}-qtd`} style={{ fontSize: 13, color: "var(--ink-600)" }}>
                    × {item.quantidade ?? 0}
                  </span>
                  <span data-testid={`pedido-detail-item-${itemId}-unit`} style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-600)" }}>
                    {fmtBRL(item.valorUnitario ?? 0)}
                  </span>
                  <span
                    data-testid={`pedido-detail-item-${itemId}-total`}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 14,
                      minWidth: 110,
                      textAlign: "right",
                    }}
                  >
                    {fmtBRL(item.valorTotal ?? 0)}
                  </span>
                </div>
                );
              })
            )}

            <div
              data-testid="pedido-detail-items-footer"
              style={{
                padding: "16px 20px",
                background: "var(--ink-50)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                rowGap: 8,
                fontSize: 14,
              }}
            >
              <span data-testid="pedido-detail-items-subtotal-label" style={{ color: "var(--ink-600)" }}>Subtotal dos itens</span>
              <span data-testid="pedido-detail-items-subtotal-value" style={{ fontFamily: "var(--font-mono)" }}>
                {fmtBRL(subtotal)}
              </span>
              <span
                data-testid="pedido-detail-items-total-label"
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  paddingTop: 8,
                  borderTop: "1px solid var(--ink-200)",
                }}
              >
                Total cobrado
              </span>
              <span
                data-testid="pedido-detail-items-total-value"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 800,
                  fontSize: 18,
                  paddingTop: 8,
                  borderTop: "1px solid var(--ink-200)",
                }}
              >
                {fmtBRL(pedido.valorTotal ?? 0)}
              </span>
            </div>
          </div>

          <div
            data-testid="pedido-detail-section-historico"
            style={{
              padding: 24,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              data-testid="pedido-detail-historico-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <h3 data-testid="pedido-detail-historico-title" style={{ fontSize: 16, fontWeight: 700 }}>
                Histórico de integração com fornecedor
              </h3>
              <button
                onClick={() => historico.refetch()}
                disabled={historico.isFetching}
                data-testid="pedido-detail-button-historico-refresh"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 30,
                  padding: "0 10px",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--ink-200)",
                  background: "var(--ink-0)",
                  color: "var(--ink-700)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: historico.isFetching ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: historico.isFetching ? 0.6 : 1,
                }}
              >
                {historico.isFetching ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCcw size={12} />
                )}
                Atualizar
              </button>
            </div>
            {(historico.data ?? []).length === 0 ? (
              <p data-testid="pedido-detail-historico-empty" style={{ fontSize: 13, color: "var(--ink-500)" }}>
                Nenhum evento de integração registrado ainda.
              </p>
            ) : (
              <div data-testid="pedido-detail-historico-list" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(historico.data ?? []).map((evt, i) => {
                  const evtId = evt.id ?? `idx-${i}`;
                  return (
                  <div
                    key={evt.id ?? i}
                    data-testid={`pedido-detail-historico-item-${evtId}`}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "var(--ink-50)",
                      border: `1px solid ${evt.sucesso ? "var(--kai-success-bg)" : "var(--kai-danger-bg, #fde0e0)"}`,
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div data-testid={`pedido-detail-historico-item-${evtId}-info`} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span
                        data-testid={`pedido-detail-historico-item-${evtId}-label`}
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: evt.sucesso
                            ? "var(--ink-900)"
                            : "var(--kai-danger, #dc2626)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Activity size={13} />
                        {EVENTO_LABEL[evt.eventoTipo ?? ""] ??
                          evt.eventoTipo ??
                          "Evento"}
                      </span>
                      <span data-testid={`pedido-detail-historico-item-${evtId}-meta`} style={{ fontSize: 11, color: "var(--ink-500)" }}>
                        {fmtDateTime(evt.enviadoEm)}
                        {evt.httpStatus
                          ? ` · HTTP ${evt.httpStatus}`
                          : ""}
                        {evt.erro ? ` · ${evt.erro}` : ""}
                      </span>
                    </div>
                    <span
                      data-testid={`pedido-detail-historico-item-${evtId}-status`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 22,
                        padding: "0 8px",
                        borderRadius: 999,
                        background: evt.sucesso
                          ? "var(--kai-success-bg)"
                          : "var(--kai-danger-bg, #fde0e0)",
                        color: evt.sucesso
                          ? "var(--kai-success)"
                          : "var(--kai-danger, #dc2626)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {evt.sucesso ? "Sucesso" : "Falha"}
                    </span>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div data-testid="pedido-detail-column-side" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            data-testid="pedido-detail-section-comprador"
            style={{
              padding: 20,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 data-testid="pedido-detail-comprador-title" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              Comprador
            </h3>
            <div
              data-testid="pedido-detail-comprador-content"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontSize: 13,
              }}
            >
              <div
                data-testid="pedido-detail-comprador-email-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  data-testid="pedido-detail-comprador-email-wrapper"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    color: "var(--ink-700)",
                    minWidth: 0,
                  }}
                >
                  <Mail size={14} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
                  <span
                    data-testid="pedido-detail-comprador-email"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pedido.compradorEmail ?? "—"}
                  </span>
                </div>
                {pedido.compradorEmail && (
                  <CopyButton value={pedido.compradorEmail} testId="pedido-detail-button-copy-email" />
                )}
              </div>
              {pedido.compradorId && (
                <div data-testid="pedido-detail-comprador-id" style={{ fontSize: 11, color: "var(--ink-500)" }}>
                  ID interno:{" "}
                  <span data-testid="pedido-detail-comprador-id-value" style={{ fontFamily: "var(--font-mono)" }}>
                    {pedido.compradorId.slice(0, 8)}…
                  </span>
                </div>
              )}
              <p data-testid="pedido-detail-comprador-privacy-note" style={{ fontSize: 11, color: "var(--ink-500)", lineHeight: 1.5 }}>
                Endereço, telefone e CPF ficam no usuarios-service e na pagar.me
                — esses dados não são expostos no detalhe do pedido pelo
                vendas-service por questões de privacidade.
              </p>
            </div>
          </div>

          <div
            data-testid="pedido-detail-section-pagamento"
            style={{
              padding: 20,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 data-testid="pedido-detail-pagamento-title" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              Pagamento
            </h3>
            <div
              data-testid="pedido-detail-pagamento-card"
              style={{
                display: "flex",
                gap: 12,
                padding: 12,
                background: "var(--ink-50)",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <div
                data-testid="pedido-detail-pagamento-icon-wrapper"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--ink-200)",
                }}
              >
                <CreditCard size={18} style={{ color: "var(--kai-orange)" }} />
              </div>
              <div data-testid="pedido-detail-pagamento-info" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span data-testid="pedido-detail-pagamento-provider" style={{ fontWeight: 600 }}>pagar.me</span>
                <span data-testid="pedido-detail-pagamento-status" style={{ fontSize: 12, color: "var(--ink-500)" }}>
                  {pedido.pagoEm
                    ? `Pago em ${fmtDateTime(pedido.pagoEm)}`
                    : pedido.status === "PENDENTE"
                      ? "Aguardando confirmação"
                      : pedido.status === "FALHA"
                        ? "Pagamento falhou"
                        : "Sem confirmação registrada"}
                </span>
              </div>
            </div>
            {(pedido.pagarmeChargeId || pedido.pagarmeOrderId) && (
              <div
                data-testid="pedido-detail-pagamento-ids"
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: 11,
                }}
              >
                {pedido.pagarmeOrderId && (
                  <div
                    data-testid="pedido-detail-pagamento-order-id-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <span data-testid="pedido-detail-pagamento-order-id-label" style={{ color: "var(--ink-500)" }}>Order ID</span>
                    <span data-testid="pedido-detail-pagamento-order-id-value" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-700)" }}>
                      {pedido.pagarmeOrderId}
                    </span>
                  </div>
                )}
                {pedido.pagarmeChargeId && (
                  <div
                    data-testid="pedido-detail-pagamento-charge-id-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <span data-testid="pedido-detail-pagamento-charge-id-label" style={{ color: "var(--ink-500)" }}>Charge ID</span>
                    <span data-testid="pedido-detail-pagamento-charge-id-value" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-700)" }}>
                      {pedido.pagarmeChargeId}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            data-testid="pedido-detail-section-status-fornecedor"
            style={{
              padding: 20,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              data-testid="pedido-detail-status-fornecedor-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3 data-testid="pedido-detail-status-fornecedor-title" style={{ fontSize: 14, fontWeight: 700 }}>Status no fornecedor</h3>
              <button
                onClick={() => statusFornecedor.refetch()}
                disabled={statusFornecedor.isFetching}
                title="Atualizar"
                data-testid="pedido-detail-button-status-fornecedor-refresh"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "1px solid var(--ink-200)",
                  background: "var(--ink-0)",
                  color: "var(--ink-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: statusFornecedor.isFetching ? "not-allowed" : "pointer",
                }}
              >
                {statusFornecedor.isFetching ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCcw size={12} />
                )}
              </button>
            </div>
            {statusFornecedor.isLoading ? (
              <div
                data-testid="pedido-detail-status-fornecedor-loading"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--ink-500)",
                }}
              >
                <Loader2 size={14} className="animate-spin" /> Consultando…
              </div>
            ) : statusFornecedor.isError || !statusFornecedor.data ? (
              <p data-testid="pedido-detail-status-fornecedor-empty" style={{ fontSize: 12, color: "var(--ink-500)" }}>
                Status do fornecedor ainda não disponível para este pedido.
              </p>
            ) : (
              <div
                data-testid="pedido-detail-status-fornecedor-content"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                {statusFornecedor.data.orderStatusDescricao && (
                  <div
                    data-testid="pedido-detail-status-fornecedor-descricao"
                    style={{
                      padding: 10,
                      background: "var(--kai-orange-50)",
                      border: "1px solid var(--kai-orange-100)",
                      borderRadius: 8,
                      color: "var(--kai-orange-600)",
                      fontWeight: 600,
                    }}
                  >
                    {statusFornecedor.data.orderStatusDescricao}
                    {statusFornecedor.data.orderStatusCodigo
                      ? ` (${statusFornecedor.data.orderStatusCodigo})`
                      : ""}
                  </div>
                )}
                <div
                  data-testid="pedido-detail-status-fornecedor-fields"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    rowGap: 6,
                    fontSize: 12,
                  }}
                >
                  {statusFornecedor.data.numeroPedido && (
                    <>
                      <span data-testid="pedido-detail-status-fornecedor-numero-label" style={{ color: "var(--ink-500)" }}>
                        Nº fornecedor
                      </span>
                      <span data-testid="pedido-detail-status-fornecedor-numero-value" style={{ fontFamily: "var(--font-mono)" }}>
                        {statusFornecedor.data.numeroPedido}
                      </span>
                    </>
                  )}
                  {statusFornecedor.data.shopName && (
                    <>
                      <span data-testid="pedido-detail-status-fornecedor-shop-label" style={{ color: "var(--ink-500)" }}>Loja</span>
                      <span data-testid="pedido-detail-status-fornecedor-shop-value">{statusFornecedor.data.shopName}</span>
                    </>
                  )}
                  {statusFornecedor.data.expressTime && (
                    <>
                      <span data-testid="pedido-detail-status-fornecedor-prazo-label" style={{ color: "var(--ink-500)" }}>Prazo</span>
                      <span data-testid="pedido-detail-status-fornecedor-prazo-value">{statusFornecedor.data.expressTime}</span>
                    </>
                  )}
                  {statusFornecedor.data.trackNumber && (
                    <>
                      <span data-testid="pedido-detail-status-fornecedor-track-label" style={{ color: "var(--ink-500)" }}>Tracking</span>
                      <span data-testid="pedido-detail-status-fornecedor-track-value" style={{ fontFamily: "var(--font-mono)" }}>
                        {statusFornecedor.data.trackNumber}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            {pedido.labelUrlA4 && (
              <a
                href={pedido.labelUrlA4}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="pedido-detail-link-open-label-a4"
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  height: 34,
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--ink-200)",
                  background: "var(--ink-0)",
                  color: "var(--ink-700)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={12} /> Abrir etiqueta A4
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
