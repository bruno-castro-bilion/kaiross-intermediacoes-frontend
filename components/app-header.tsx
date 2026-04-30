"use client";

import { Bell, TrendingUp, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBalanceVisibility } from "@/contexts/balance-visibility-context";

/* ─── Botão ícone circular ────────────────────────────────────────────────── */
function IconBtn({
  children,
  onClick,
  title,
  hasDot = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  hasDot?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--ink-200)] bg-[var(--ink-0)] text-[var(--ink-700)] transition-all hover:border-[var(--ink-300)] hover:text-[var(--ink-900)]"
    >
      {children}
      {hasDot && (
        <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[var(--kai-orange)]" />
      )}
    </button>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */

export default function AppHeader({ showLogo = false }: { showLogo?: boolean }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { showBalance } = useBalanceVisibility();

  const firstName = user?.nomeCompleto?.split(" ")[0] ?? "Usuário";

  return (
    <header
      className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center gap-4 border-b border-[var(--ink-200)] px-6"
      style={{ background: "rgba(245, 242, 238, 0.85)", backdropFilter: "blur(16px) saturate(160%)" }}
    >
      {/* ── Saudação ── */}
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-500)]">
          Bem-vindo de volta
        </span>
        <span className="text-[17px] font-bold tracking-[-0.01em] text-[var(--ink-900)]">
          {firstName}
        </span>
      </div>

      {/* ── KPI Faturamento — apenas em telas grandes ── */}
      <div className="ml-auto hidden items-center gap-3 lg:flex">
        <div className="flex items-center gap-3 rounded-[var(--r-pill)] border border-[var(--ink-200)] bg-[var(--ink-0)] px-4 py-2.5 shadow-[var(--sh-xs)]">
          <TrendingUp size={15} className="shrink-0 text-[var(--kai-orange)]" />
          <div className="flex flex-col gap-0">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-500)]">
              Faturamento
            </span>
            <span
              className="mono-num text-[14px] font-bold leading-tight text-[var(--ink-900)]"
              style={{
                filter: !showBalance ? "blur(7px)" : "none",
                transition: "filter 0.2s ease",
                userSelect: !showBalance ? "none" : "auto",
              }}
            >
              R$ 6.254,54
            </span>
          </div>
          {/* Barra de progresso */}
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-24 overflow-hidden rounded-[var(--r-pill)] bg-[var(--ink-200)]">
              <div
                className="h-full rounded-[var(--r-pill)]"
                style={{
                  width: "62%",
                  background: "linear-gradient(90deg, var(--kai-orange-300), var(--kai-orange))",
                }}
              />
            </div>
            <span className="text-[10.5px] font-medium text-[var(--ink-500)]">62% / R$10K</span>
          </div>
        </div>
      </div>

      {/* ── Ações à direita ── */}
      <div className="flex items-center gap-2 lg:ml-3">
        {/* Carrinho */}
        <IconBtn title="Pedidos" onClick={() => router.push("/pedidos")}>
          <ShoppingCart size={16} />
        </IconBtn>

        {/* Notificações */}
        <IconBtn title="Notificações" hasDot>
          <Bell size={16} />
        </IconBtn>
      </div>
    </header>
  );
}
