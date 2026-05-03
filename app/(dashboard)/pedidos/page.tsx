"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Truck,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { useAuthStore } from "@/lib/store/auth-store";
import { useListPedidosVendedor } from "@/app/api/vendas/queries";
import type { PedidoView } from "@/app/api/vendas/types";

type UiStatus =
  | "pendente"
  | "pago"
  | "enviado"
  | "reembolsado"
  | "falha"
  | "abandonado";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const fmtBRLShort = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(1)}K`;
  return fmtBRL(n);
};

const TABS: { key: "todos" | UiStatus; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendentes" },
  { key: "pago", label: "Pagos" },
  { key: "enviado", label: "Enviados" },
  { key: "reembolsado", label: "Reembolsados" },
  { key: "falha", label: "Recusados" },
  { key: "abandonado", label: "Abandonados" },
];

// Backend retorna um PedidoStatus + campos de envio. Nem todo status do
// front-end (separacao/entregue) tem mapeamento direto — separação é
// inferida quando há PAGO sem tracking, e entrega só pode ser confirmada
// pelo `statusFornecedor` (free string), então não faço esse mapping
// agressivo aqui.
function deriveUiStatus(p: PedidoView): UiStatus {
  switch (p.status) {
    case "REEMBOLSADO":
      return "reembolsado";
    case "FALHA":
      return "falha";
    case "CARRINHO_ABANDONADO":
      return "abandonado";
    case "PAGO":
      return p.trackingCode || p.enviadoEm ? "enviado" : "pago";
    case "PENDENTE":
    default:
      return "pendente";
  }
}

const STATUS_TO_BADGE: Record<
  UiStatus,
  "ativo" | "pausado" | "enviado" | "entregue" | "aguardando" | "separacao" | "devolvido" | "recusado"
> = {
  pendente: "aguardando",
  pago: "separacao",
  enviado: "enviado",
  reembolsado: "devolvido",
  falha: "recusado",
  abandonado: "pausado",
};

const STATUS_LABEL: Record<UiStatus, string> = {
  pendente: "Aguardando pagamento",
  pago: "Pago · em separação",
  enviado: "Enviado",
  reembolsado: "Reembolsado",
  falha: "Pagamento recusado",
  abandonado: "Abandonado",
};

function pedidoTimestamp(p: PedidoView): number | null {
  const raw = p.dataCriacao;
  if (!raw) return null;
  const ts = new Date(raw).getTime();
  return Number.isFinite(ts) ? ts : null;
}

function relativeTime(ts: number | null): string {
  if (ts === null) return "—";
  const diffMs = Date.now() - ts;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  const months = Math.floor(days / 30);
  return `há ${months}m`;
}

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  PIX: "PIX",
  CREDITO: "Cartão de crédito",
  BOLETO: "Boleto",
  DOIS_CARTOES: "Dois cartões",
};

const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%23eef2f7' width='40' height='40'/%3E%3C/svg%3E";

function initials(text: string): string {
  return text
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function exportCsv(rows: PedidoView[]) {
  const header = [
    "id",
    "numeroPedido",
    "comprador",
    "produto",
    "quantidade",
    "valorTotal",
    "status",
    "trackingCode",
    "dataCriacao",
    "pagoEm",
    "enviadoEm",
  ];
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [header.join(",")];
  rows.forEach((p) => {
    const principal = p.itens?.[0]?.produtoNome ?? "";
    lines.push(
      [
        p.id,
        p.numeroPedido ?? "",
        p.compradorEmail ?? "",
        principal,
        p.quantidadeTotal ?? "",
        p.valorTotal ?? "",
        p.status ?? "",
        p.trackingCode ?? "",
        p.dataCriacao ?? "",
        p.pagoEm ?? "",
        p.enviadoEm ?? "",
      ]
        .map(escape)
        .join(","),
    );
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pedidos-kaiross-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Pedidos() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useListPedidosVendedor(userId);

  const pedidos = data ?? [];

  const [tab, setTab] = useState<"todos" | UiStatus>("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const enriched = useMemo(
    () =>
      pedidos.map((p) => ({
        pedido: p,
        ui: deriveUiStatus(p),
        ts: pedidoTimestamp(p),
      })),
    [pedidos],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return enriched
      .filter((row) => {
        const matchTab = tab === "todos" || row.ui === tab;
        if (!matchTab) return false;
        if (!q) return true;
        const p = row.pedido;
        return (
          (p.numeroPedido ?? "").toLowerCase().includes(q) ||
          (p.compradorEmail ?? "").toLowerCase().includes(q) ||
          (p.itens?.[0]?.produtoNome ?? "").toLowerCase().includes(q) ||
          (p.trackingCode ?? "").toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
  }, [enriched, tab, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);
    const startMs = startMonth.getTime();

    let mes = 0;
    let pendentes = 0;
    let emTransito = 0;
    let receita = 0;
    enriched.forEach(({ pedido: p, ui, ts }) => {
      if (ui === "pendente") pendentes += 1;
      if (ui === "enviado") emTransito += 1;
      if ((ui === "pago" || ui === "enviado") && ts && ts >= startMs) {
        mes += 1;
        receita += p.valorTotal ?? 0;
      }
    });
    return { mes, pendentes, emTransito, receita };
  }, [enriched]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Pedidos"
        subtitle="Acompanhe cada pedido — do checkout à entrega."
        actions={
          <button
            onClick={() => exportCsv(filtered.map((r) => r.pedido))}
            disabled={filtered.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 14px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--ink-200)",
              background: "var(--ink-0)",
              color: "var(--ink-700)",
              fontSize: 13,
              fontWeight: 600,
              cursor: filtered.length === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: filtered.length === 0 ? 0.5 : 1,
            }}
          >
            <Download size={14} /> Exportar
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard
          icon={ShoppingCart}
          label="Vendas no mês"
          value={String(stats.mes)}
        />
        <StatCard
          icon={Truck}
          label="Em trânsito"
          value={String(stats.emTransito)}
        />
        <StatCard
          icon={CheckCircle}
          label="Receita confirmada"
          value={stats.receita > 0 ? fmtBRLShort(stats.receita) : "R$ 0"}
          highlight
        />
        <StatCard
          icon={AlertTriangle}
          label="Aguardando pagamento"
          value={String(stats.pendentes)}
        />
      </div>

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
            padding: 16,
            borderBottom: "1px solid var(--ink-200)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-pill)",
              flexWrap: "wrap",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--r-pill)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: 0,
                  background:
                    tab === t.key ? "var(--ink-900)" : "transparent",
                  color: tab === t.key ? "white" : "var(--ink-600)",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 240,
              height: 38,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              background: "var(--ink-50)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-pill)",
              marginLeft: "auto",
            }}
          >
            <Search size={15} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nº, email, produto, tracking..."
              style={{
                border: 0,
                outline: 0,
                flex: 1,
                font: "inherit",
                background: "transparent",
                color: "var(--ink-900)",
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {!userId ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: "var(--ink-500)",
              fontSize: 14,
            }}
          >
            Sessão inválida — faça login novamente.
          </div>
        ) : isLoading ? (
          <div
            style={{
              padding: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: "var(--kai-orange)" }}
            />
            <span style={{ fontSize: 13, color: "var(--ink-500)" }}>
              Carregando seus pedidos…
            </span>
          </div>
        ) : isError ? (
          <div
            style={{
              padding: 60,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
            }}
          >
            <AlertCircle size={28} style={{ color: "var(--kai-danger, #dc2626)" }} />
            <p className="font-semibold text-[var(--ink-900)]">
              Não foi possível carregar os pedidos
            </p>
            <p className="text-sm text-[var(--ink-500)]">
              {error?.message ?? "Tente novamente em instantes."}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: "var(--r-md)",
                border: 0,
                background: "var(--kai-orange)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: isFetching ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: isFetching ? 0.6 : 1,
              }}
            >
              {isFetching ? "Tentando novamente…" : "Tentar novamente"}
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: "var(--ink-500)",
            }}
          >
            <ShoppingCart
              size={36}
              style={{ margin: "0 auto 16px", color: "var(--ink-300)" }}
            />
            <p
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 6,
                color: "var(--ink-900)",
              }}
            >
              Você ainda não recebeu pedidos
            </p>
            <p style={{ fontSize: 13 }}>
              Assim que um cliente concluir o checkout, o pedido aparece aqui.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1.4fr 1.4fr 1.6fr 1.2fr 0.9fr 1fr 1.1fr 1fr 0.5fr",
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
              <div>Pedido</div>
              <div>Data</div>
              <div>Cliente</div>
              <div>Pagamento</div>
              <div>Total</div>
              <div>Status</div>
              <div>Itens</div>
              <div>Enviado ao Fornecedor</div>
              <div>Ações</div>
            </div>

            {slice.map(({ pedido: p, ui, ts }) => {
              const labelStatus = STATUS_LABEL[ui];
              const numero = p.numeroPedido ?? `#${p.id.slice(0, 8)}`;
              const email = p.compradorEmail ?? "";
              const clienteLabel = p.clienteNome?.trim() || email || "—";
              const clienteSub = p.clienteNome?.trim() && email ? email : null;
              const pagamentoLabel = p.formaPagamento
                ? FORMA_PAGAMENTO_LABEL[p.formaPagamento] ?? p.formaPagamento
                : "—";
              const enviadoFornecedor = p.integrado === true;
              return (
                <Link href={`/pedidos/${p.id}`} key={p.id}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1.4fr 1.4fr 1.6fr 1.2fr 0.9fr 1fr 1.1fr 1fr 0.5fr",
                      gap: 16,
                      padding: "14px 20px",
                      alignItems: "center",
                      borderBottom: "1px solid var(--ink-100)",
                      cursor: "pointer",
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--ink-50)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "";
                    }}
                  >
                    {/* Pedido */}
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={numero}
                    >
                      {numero}
                    </div>
                    {/* Data */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "var(--ink-700)" }}>
                        {fmtDateTime(p.dataCriacao)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ink-500)" }}>
                        {relativeTime(ts)}
                      </span>
                    </div>
                    {/* Cliente */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--ink-200)",
                          color: "var(--ink-700)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initials(clienteLabel)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: 0,
                          gap: 1,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={clienteLabel}
                        >
                          {clienteLabel}
                        </span>
                        {clienteSub && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--ink-500)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={clienteSub}
                          >
                            {clienteSub}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Pagamento */}
                    <div style={{ fontSize: 13, color: "var(--ink-700)" }}>
                      {pagamentoLabel}
                    </div>
                    {/* Total */}
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {fmtBRL(p.valorTotal ?? 0)}
                    </div>
                    {/* Status */}
                    <div title={labelStatus}>
                      <StatusBadge status={STATUS_TO_BADGE[ui]} />
                    </div>
                    {/* Itens — thumbnails */}
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      {(p.itens ?? []).slice(0, 3).map((item, idx) => (
                        <img
                          key={item.id ?? idx}
                          src={item.imagemPrincipalUrl || PRODUCT_PLACEHOLDER}
                          alt={item.produtoNome ?? "Item"}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          title={item.produtoNome ?? undefined}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            objectFit: "cover",
                            border: "1px solid var(--ink-200)",
                            background: "var(--ink-100)",
                          }}
                        />
                      ))}
                      {p.itens && p.itens.length > 3 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--ink-500)",
                            fontWeight: 600,
                          }}
                        >
                          +{p.itens.length - 3}
                        </span>
                      )}
                    </div>
                    {/* Enviado ao Fornecedor */}
                    <div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          height: 22,
                          padding: "0 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: enviadoFornecedor
                            ? "var(--kai-success-bg)"
                            : "var(--kai-warn-bg, #fef3c7)",
                          color: enviadoFornecedor
                            ? "var(--kai-success)"
                            : "var(--kai-warn, #f59e0b)",
                        }}
                      >
                        {enviadoFornecedor ? "Sim" : "Não"}
                      </span>
                    </div>
                    {/* Ações */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={(e) => {
                          // Link wrapper já navega; só evitamos double-fire.
                          e.stopPropagation();
                        }}
                        title="Ver detalhes"
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          border: "1px solid var(--ink-200)",
                          background: "var(--ink-0)",
                          color: "var(--ink-600)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}

            {slice.length === 0 && (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  color: "var(--ink-500)",
                }}
              >
                <ShoppingCart
                  size={32}
                  style={{ margin: "0 auto 12px", color: "var(--ink-300)" }}
                />
                <p style={{ fontWeight: 600, fontSize: 14 }}>
                  Nenhum pedido encontrado
                </p>
                <p style={{ fontSize: 13 }}>
                  Tente ajustar os filtros ou a busca.
                </p>
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              perPage={perPage}
              onPage={setPage}
              onPerPage={(n) => {
                setPerPage(n);
                setPage(1);
              }}
              label="pedidos"
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
