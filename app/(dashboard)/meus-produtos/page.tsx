"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  TrendingUp,
  Flame,
  ShoppingCart,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  Copy,
  Trash2,
  Play,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  useListMeusProdutos,
  type MeuProduto,
} from "@/app/api/seller-produtos/queries";
import {
  useExcluirSellerProduto,
  useReativarSellerProduto,
} from "@/app/api/seller-produtos/mutations";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect fill='%23eef2f7' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='9' text-anchor='middle' dominant-baseline='middle'%3Esem imagem%3C/text%3E%3C/svg%3E";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

function ProductThumb({ src, name }: { src: string; name: string }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "var(--r-sm)",
        background: "var(--ink-100)",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <img
        src={src || PLACEHOLDER_IMG}
        alt={name}
        referrerPolicy="no-referrer"
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

function stockLabel(estoque?: number) {
  if (estoque == null) return "—";
  if (estoque === 0) return "Sem estoque";
  if (estoque < 10) return "Baixo";
  if (estoque < 50) return "Médio";
  return "Alto";
}

function buildCheckoutLink(item: MeuProduto): string | null {
  // O domínio do checkout é decidido aqui no frontend pra não depender
  // do que o backend devolve em `checkoutUrl` (que pode estar defasado
  // em ambientes ainda não atualizados).
  if (item.slugCheckout) {
    return `https://pay.kaiross.com.br/${item.slugCheckout}`;
  }
  return item.checkoutUrl ?? null;
}

function RowMenu({
  item,
  onDelete,
  onReactivate,
}: {
  item: MeuProduto;
  onDelete: (id: string) => void;
  onReactivate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPaused = item.ativo === false;
  const isBloqueado = item.bloqueado === true;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBloqueado) {
      toast.error(
        "Checkout bloqueado — abra o produto e ajuste o preço antes de compartilhar o link.",
      );
      setOpen(false);
      return;
    }
    const link = buildCheckoutLink(item);
    if (!link) {
      toast.error("Link de checkout indisponível.");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link de checkout copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.id) return;
    setOpen(false);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!item.id) return;
    onDelete(item.id);
    setConfirmOpen(false);
  };

  const handleReactivate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.id) return;
    onReactivate(item.id);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          width: 32,
          height: 32,
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
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
            style={{ position: "fixed", inset: 0, zIndex: 30 }}
          />
          <div
            style={{
              position: "absolute",
              top: 36,
              right: 0,
              minWidth: 220,
              background: "var(--ink-0)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-md)",
              boxShadow: "var(--sh-md)",
              zIndex: 40,
              overflow: "hidden",
            }}
          >
            <button
              onClick={handleCopy}
              disabled={isBloqueado}
              title={
                isBloqueado
                  ? "Checkout bloqueado — ajuste o preço primeiro"
                  : undefined
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: 0,
                color: isBloqueado ? "var(--ink-400)" : "var(--ink-700)",
                fontSize: 13,
                fontWeight: 500,
                cursor: isBloqueado ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <Copy size={14} /> Copiar link de checkout
            </button>
            {isPaused ? (
              <button
                onClick={handleReactivate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 12px",
                  background: "transparent",
                  border: 0,
                  borderTop: "1px solid var(--ink-100)",
                  color: "var(--kai-success)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <Play size={14} /> Reativar na vitrine
              </button>
            ) : (
              <button
                onClick={handleDelete}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 12px",
                  background: "transparent",
                  border: 0,
                  borderTop: "1px solid var(--ink-100)",
                  color: "var(--kai-danger, #dc2626)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <Trash2 size={14} /> Remover da vitrine
              </button>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remover "${item.produto?.nome ?? "este produto"}" da vitrine?`}
        description="A afiliação fica pausada e o link de checkout para de funcionar imediatamente. Você pode reativar depois sem perder o histórico."
        warning={
          item.slugCheckout ? (
            <>
              Se você está rodando anúncios apontando para{" "}
              <strong className="break-all">
                pay.kaiross.com.br/{item.slugCheckout}
              </strong>
              , pause as campanhas antes — o link vai parar de responder e
              o tráfego pago será perdido.
            </>
          ) : null
        }
        confirmLabel="Remover da vitrine"
        cancelLabel="Manter ativo"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default function MeusProdutos() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { items, isLoading, isError, error, refetch, isFetching } =
    useListMeusProdutos();
  const excluir = useExcluirSellerProduto();
  const reativar = useReativarSellerProduto();

  const handleDelete = (id: string) => {
    excluir.mutate(id, {
      onSuccess: () => {
        toast.success("Produto removido da sua vitrine.");
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

  const handleReactivate = (id: string) => {
    reativar.mutate(id, {
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = items;
    if (q) {
      list = list.filter((m) =>
        (m.produto?.nome ?? "").toLowerCase().includes(q),
      );
    }
    if (tab === 1) list = list.filter((m) => m.ativo !== false);
    if (tab === 2) list = list.filter((m) => m.ativo === false);
    return list;
  }, [items, search, tab]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const tabs = useMemo(
    () =>
      [
        `Todos (${items.length})`,
        `Ativos (${items.filter((m) => m.ativo !== false).length})`,
        `Pausados (${items.filter((m) => m.ativo === false).length})`,
      ] as const,
    [items],
  );

  const stats = useMemo(() => {
    const ativos = items.filter((m) => m.ativo !== false).length;
    const maiorMargem = items.reduce((acc, m) => {
      const preco = m.precoVenda ?? 0;
      const custo = m.produto?.precoSugerido ?? 0;
      const margem = preco - custo;
      return margem > acc.value
        ? { value: margem, nome: m.produto?.nome ?? "—" }
        : acc;
    }, { value: -Infinity, nome: "—" });
    const receitaPotencialMes = items.reduce(
      (acc, m) => acc + (m.precoVenda ?? 0),
      0,
    );
    return {
      ativos,
      receitaPotencial: receitaPotencialMes,
      bestSeller: maiorMargem.value > -Infinity ? maiorMargem.nome : "—",
    };
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 max-w-[1440px] mx-auto w-full"
    >
      <PageHeader
        title="Meus Produtos"
        subtitle="Os produtos que você está vendendo, com performance em tempo real."
        actions={
          <Link href="/vitrine-de-produtos">
            <button
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
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <ShoppingCart size={14} /> Buscar produtos na vitrine
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard
          icon={Package}
          label="Produtos ativos"
          value={String(stats.ativos)}
        />
        <StatCard
          icon={ShoppingCart}
          label="Total na vitrine"
          value={String(items.length)}
        />
        <StatCard
          icon={TrendingUp}
          label="Soma dos preços"
          value={
            stats.receitaPotencial > 0 ? fmtBRL(stats.receitaPotencial) : "—"
          }
          highlight
        />
        <StatCard
          icon={Flame}
          label="Maior margem"
          value={stats.bestSeller}
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
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 360,
              height: 38,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              background: "var(--ink-50)",
              border: "1px solid var(--ink-200)",
              borderRadius: "var(--r-pill)",
            }}
          >
            <Search size={15} style={{ color: "var(--ink-500)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar nos meus produtos..."
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
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setTab(i);
                  setPage(1);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--r-pill)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: 0,
                  background: tab === i ? "var(--ink-900)" : "transparent",
                  color: tab === i ? "white" : "var(--ink-600)",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: "80px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Loader2
              size={26}
              className="animate-spin"
              style={{ color: "var(--kai-orange)" }}
            />
            <span style={{ fontSize: 13, color: "var(--ink-500)" }}>
              Carregando seus produtos…
            </span>
          </div>
        ) : isError ? (
          <div
            style={{
              padding: "80px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
            }}
          >
            <AlertCircle size={28} style={{ color: "var(--kai-danger, #dc2626)" }} />
            <div>
              <p className="font-semibold text-[var(--ink-900)]">
                Não foi possível carregar a sua vitrine
              </p>
              <p className="text-sm text-[var(--ink-500)] mt-1">
                {error?.message ?? "Tente novamente em instantes."}
              </p>
            </div>
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
        ) : items.length === 0 ? (
          <div
            style={{
              padding: "80px 20px",
              textAlign: "center",
              color: "var(--ink-500)",
            }}
          >
            <Package
              size={36}
              style={{ margin: "0 auto 16px", color: "var(--ink-300)" }}
            />
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: "var(--ink-900)" }}>
              Sua vitrine está vazia
            </p>
            <p style={{ fontSize: 13, marginBottom: 16 }}>
              Comece afiliando produtos do catálogo dos fornecedores.
            </p>
            <Link href="/vitrine-de-produtos">
              <button
                style={{
                  height: 38,
                  padding: "0 18px",
                  borderRadius: "var(--r-md)",
                  border: 0,
                  background: "var(--kai-orange)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShoppingCart size={14} /> Explorar a vitrine
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr 1fr 1.2fr 0.5fr",
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
              <div>Produto</div>
              <div>Preço de venda</div>
              <div>Sugerido</div>
              <div>Margem</div>
              <div>Status</div>
              <div />
            </div>

            {slice.map((m) => {
              const nome = m.produto?.nome ?? "Produto indisponível";
              const img = m.produto?.imagemPrincipalUrl?.trim() || PLACEHOLDER_IMG;
              const precoVenda = m.precoVenda ?? 0;
              const custo = m.produto?.precoSugerido ?? 0;
              const margem = precoVenda - custo;
              const status: "ativo" | "pausado" =
                m.ativo === false ? "pausado" : "ativo";

              return (
                <Link href={`/meus-produtos/${m.id}`} key={m.id}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 1fr 1fr 1fr 1.2fr 0.5fr",
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
                      (e.currentTarget as HTMLDivElement).style.background = "";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <ProductThumb src={img} name={nome} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              minWidth: 0,
                            }}
                          >
                            {nome}
                          </span>
                          {m.bloqueado && (
                            <span
                              title="Checkout bloqueado — preço abaixo do mínimo viável. Abra o produto e ajuste."
                              style={{
                                flexShrink: 0,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                height: 20,
                                padding: "0 8px",
                                borderRadius: 999,
                                background: "var(--kai-danger-bg, #fde0e0)",
                                color: "var(--kai-danger, #dc2626)",
                                fontSize: 10.5,
                                fontWeight: 700,
                              }}
                            >
                              <AlertCircle size={11} /> Bloqueado
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--ink-500)" }}>
                          Estoque {stockLabel(m.produto?.estoque)} ·{" "}
                          {m.produto?.fornecedor ?? "Fornecedor"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {fmtBRL(precoVenda)}
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 500,
                        fontSize: 13,
                        color: "var(--ink-600)",
                      }}
                    >
                      {custo > 0 ? fmtBRL(custo) : "—"}
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: 13,
                        color:
                          margem >= 0
                            ? "var(--kai-success)"
                            : "var(--kai-danger, #dc2626)",
                      }}
                    >
                      {fmtBRL(margem)}
                    </div>

                    <div>
                      <StatusBadge status={status} />
                    </div>

                    <RowMenu
                      item={m}
                      onDelete={handleDelete}
                      onReactivate={handleReactivate}
                    />
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
                <Package
                  size={32}
                  style={{ margin: "0 auto 12px", color: "var(--ink-300)" }}
                />
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  Nenhum produto encontrado
                </p>
                <p style={{ fontSize: 13 }}>Tente ajustar os filtros ou a busca.</p>
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
              label="produtos"
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
