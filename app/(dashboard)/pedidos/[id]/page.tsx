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
  Send,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import {
  useGetPedido,
  useHistoricoFornecedor,
  useStatusFornecedor,
} from "@/app/api/vendas/queries";
import {
  useNotificarCriacaoFornecedor,
  useReembolsarPedido,
} from "@/app/api/vendas/mutations";
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

function CopyButton({ value, label }: { value: string; label?: string }) {
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
      <span style={{ fontSize: 13, color: "var(--ink-500)" }}>Carregando pedido…</span>
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
    <div style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}>
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
            marginBottom: 20,
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={16} /> Voltar para pedidos
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
        <p className="font-semibold text-[var(--ink-900)]">Pedido indisponível</p>
        <p className="text-sm text-[var(--ink-500)]">{message}</p>
        <button
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

export default function PedidoDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const { data: pedido, isLoading, isError, error, refetch } = useGetPedido(id);
  const historico = useHistoricoFornecedor(id);
  const statusFornecedor = useStatusFornecedor(id);
  const reembolsar = useReembolsarPedido();
  const notificarFornecedor = useNotificarCriacaoFornecedor();

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

  const handleForcarEnvioFornecedor = () => {
    if (
      !confirm(
        `Forçar envio do pedido ${numero} ao fornecedor (${pedido.fornecedor ?? "—"})? A operação é idempotente — se já foi enviado com sucesso, nada muda.`,
      )
    ) {
      return;
    }
    notificarFornecedor.mutate(pedido.id, {
      onSuccess: () => {
        toast.success("Pedido enviado ao fornecedor.");
        // Sem refetch manual — a mutation já invalida ["vendas"] e ["vendas",
        // "pedidos", pedidoId], o que recarrega historico e status sozinho.
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
        toast.error(apiMessage || "Erro ao notificar fornecedor.");
      },
    });
  };

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
      style={{ padding: "32px", maxWidth: 1240, margin: "0 auto", width: "100%" }}
    >
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "-0.01em",
                }}
              >
                {numero}
              </h1>
              <StatusBadge status={statusToBadge(pedido)} />
              {pedido.fornecedor && (
                <span
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
            <p style={{ fontSize: 15, color: "var(--ink-600)" }}>
              Realizado em {fmtDateTime(pedido.dataCriacao)} ·{" "}
              {relativeTime(pedido.dataCriacao)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pedido.labelUrlA4 && (
              <a
                href={pedido.labelUrlA4}
                target="_blank"
                rel="noopener noreferrer"
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
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
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
                alignItems: "center",
                marginBottom: 20,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Linha do tempo</h3>
              {pedido.trackingCode && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
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
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--ink-600)",
                    }}
                  >
                    {pedido.trackingCode}
                  </span>
                  <CopyButton value={pedido.trackingCode} />
                </div>
              )}
            </div>

            {historico.isLoading ? (
              <div
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
              <div style={{ position: "relative", paddingLeft: 28 }}>
                <div
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
                    style={{
                      position: "relative",
                      paddingBottom: i === timeline.length - 1 ? 0 : 18,
                    }}
                  >
                    <div
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
                      {step.done ? <Check size={12} /> : <span>{i + 1}</span>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span
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
                      <span style={{ fontSize: 12, color: "var(--ink-500)" }}>
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
            style={{
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--ink-200)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Itens do pedido</h3>
              <span style={{ fontSize: 12, color: "var(--ink-500)" }}>
                {pedido.quantidadeTotal ?? 0} unidades
              </span>
            </div>
            {(pedido.itens ?? []).length === 0 ? (
              <div
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
              (pedido.itens ?? []).map((item, i) => (
                <div
                  key={item.id ?? i}
                  style={{
                    padding: "16px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 16,
                    alignItems: "center",
                    borderBottom: "1px solid var(--ink-100)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontWeight: 600 }}>
                      {item.produtoNome ?? "Produto"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--ink-500)" }}>
                      {item.produtoCodigo ? `SKU ${item.produtoCodigo}` : "Sem SKU"}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--ink-600)" }}>
                    × {item.quantidade ?? 0}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-600)" }}>
                    {fmtBRL(item.valorUnitario ?? 0)}
                  </span>
                  <span
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
              ))
            )}

            <div
              style={{
                padding: "16px 20px",
                background: "var(--ink-50)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                rowGap: 8,
                fontSize: 14,
              }}
            >
              <span style={{ color: "var(--ink-600)" }}>Subtotal dos itens</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {fmtBRL(subtotal)}
              </span>
              <span
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
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                Histórico de integração com fornecedor
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                {pedido.status === "PAGO" && (
                  <button
                    onClick={handleForcarEnvioFornecedor}
                    disabled={notificarFornecedor.isPending}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 30,
                      padding: "0 10px",
                      borderRadius: "var(--r-md)",
                      border: "1px solid var(--kai-orange)",
                      background: "var(--kai-orange)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: notificarFornecedor.isPending
                        ? "not-allowed"
                        : "pointer",
                      fontFamily: "inherit",
                      opacity: notificarFornecedor.isPending ? 0.7 : 1,
                    }}
                  >
                    {notificarFornecedor.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Send size={12} />
                    )}
                    Forçar envio
                  </button>
                )}
                <button
                  onClick={() => historico.refetch()}
                  disabled={historico.isFetching}
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
            </div>
            {(historico.data ?? []).length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--ink-500)" }}>
                Nenhum evento de integração registrado ainda.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(historico.data ?? []).map((evt, i) => (
                  <div
                    key={evt.id ?? i}
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span
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
                      <span style={{ fontSize: 11, color: "var(--ink-500)" }}>
                        {fmtDateTime(evt.enviadoEm)}
                        {evt.httpStatus
                          ? ` · HTTP ${evt.httpStatus}`
                          : ""}
                        {evt.erro ? ` · ${evt.erro}` : ""}
                      </span>
                    </div>
                    <span
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              padding: 20,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              Comprador
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
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
                  <CopyButton value={pedido.compradorEmail} />
                )}
              </div>
              {pedido.compradorId && (
                <div style={{ fontSize: 11, color: "var(--ink-500)" }}>
                  ID interno:{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {pedido.compradorId.slice(0, 8)}…
                  </span>
                </div>
              )}
              <p style={{ fontSize: 11, color: "var(--ink-500)", lineHeight: 1.5 }}>
                Endereço, telefone e CPF ficam no usuarios-service e na pagar.me
                — esses dados não são expostos no detalhe do pedido pelo
                vendas-service por questões de privacidade.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: 20,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              Pagamento
            </h3>
            <div
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
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600 }}>pagar.me</span>
                <span style={{ fontSize: 12, color: "var(--ink-500)" }}>
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
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: "var(--ink-500)" }}>Order ID</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-700)" }}>
                      {pedido.pagarmeOrderId}
                    </span>
                  </div>
                )}
                {pedido.pagarmeChargeId && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: "var(--ink-500)" }}>Charge ID</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-700)" }}>
                      {pedido.pagarmeChargeId}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              padding: 20,
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
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Status no fornecedor</h3>
              <button
                onClick={() => statusFornecedor.refetch()}
                disabled={statusFornecedor.isFetching}
                title="Atualizar"
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
              <p style={{ fontSize: 12, color: "var(--ink-500)" }}>
                Status do fornecedor ainda não disponível para este pedido.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                {statusFornecedor.data.orderStatusDescricao && (
                  <div
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
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    rowGap: 6,
                    fontSize: 12,
                  }}
                >
                  {statusFornecedor.data.numeroPedido && (
                    <>
                      <span style={{ color: "var(--ink-500)" }}>
                        Nº fornecedor
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {statusFornecedor.data.numeroPedido}
                      </span>
                    </>
                  )}
                  {statusFornecedor.data.shopName && (
                    <>
                      <span style={{ color: "var(--ink-500)" }}>Loja</span>
                      <span>{statusFornecedor.data.shopName}</span>
                    </>
                  )}
                  {statusFornecedor.data.expressTime && (
                    <>
                      <span style={{ color: "var(--ink-500)" }}>Prazo</span>
                      <span>{statusFornecedor.data.expressTime}</span>
                    </>
                  )}
                  {statusFornecedor.data.trackNumber && (
                    <>
                      <span style={{ color: "var(--ink-500)" }}>Tracking</span>
                      <span style={{ fontFamily: "var(--font-mono)" }}>
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
