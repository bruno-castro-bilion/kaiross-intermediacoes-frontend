"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Store,
  Receipt,
  BarChart2,
  Wallet,
  Megaphone,
  Settings,
  ChevronDown,
  Tag,
  Layers,
  Radio,
  ShoppingCart,
  RefreshCcw,
  TrendingUp,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store/auth-store";
import { useListMeusProdutos } from "@/app/api/seller-produtos/queries";
import { useListPedidosVendedor } from "@/app/api/vendas/queries";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

interface NavChild {
  key: string;
  label: string;
  href: string;
}

interface NavItemDef {
  key: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  highlight?: boolean;
  children?: NavChild[];
}

/* ─── Estrutura de navegação (vendedor) ─────────────────────────────────── */

const NAV_OPERATION: NavItemDef[] = [
  { key: "dashboard",   label: "Dashboard",      href: "/dashboard",           icon: LayoutDashboard },
  { key: "meus",        label: "Meus Produtos",  href: "/meus-produtos",       icon: Package },
  { key: "vitrine",     label: "Vitrine",         href: "/vitrine-de-produtos", icon: Store,    highlight: true },
  { key: "pedidos",     label: "Pedidos",         href: "/pedidos",             icon: Receipt },
];

const NAV_GROWTH: NavItemDef[] = [
  {
    key: "relatorios", label: "Relatórios", icon: BarChart2,
    children: [
      { key: "vendas",    label: "Vendas",              href: "/relatorios/vendas" },
      { key: "abandono",  label: "Abandono de Carrinho", href: "/relatorios/abandono" },
      { key: "estornos",  label: "Estornos",             href: "/relatorios/estornos" },
    ],
  },
  { key: "financeiro", label: "Financeiro", href: "/financeiro", icon: Wallet },
  {
    key: "marketing", label: "Marketing", icon: Megaphone,
    children: [
      { key: "cupom",      label: "Cupons",     href: "/marketing/cupons" },
      { key: "orderbump",  label: "Order Bump", href: "/marketing/orderbump" },
      { key: "pixel",      label: "Pixel",      href: "/marketing/pixel" },
    ],
  },
];

/* ─── Sub-componente: Item de nav simples ───────────────────────────────── */

function SimpleNavItem({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItemDef;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const href = item.href ?? "#";

  const inner = (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 transition-all duration-150",
        isCollapsed
          ? "justify-center rounded-[var(--r-md)] p-2.5 mx-auto w-10 h-10"
          : "rounded-[var(--r-md)] px-3 py-2.5",
        isActive
          ? "bg-[var(--kai-orange)] text-white shadow-[var(--sh-orange)]"
          : item.highlight
            ? "bg-[var(--kai-orange-50)] text-[var(--kai-orange-600)] hover:bg-[var(--kai-orange-100)]"
            : "text-[var(--ink-700)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)]",
      ].join(" ")}
    >
      <item.icon
        size={18}
        className={[
          "shrink-0",
          isActive ? "text-white" : item.highlight ? "text-[var(--kai-orange-600)]" : "text-[var(--ink-600)]",
        ].join(" ")}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium leading-tight">{item.label}</span>
          {item.badge && (
            <span
              className={[
                "flex h-5 items-center justify-center rounded-[var(--r-pill)] px-2 text-[11px] font-bold",
                isActive
                  ? "bg-white/25 text-white"
                  : "bg-[var(--ink-100)] text-[var(--ink-700)]",
              ].join(" ")}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="bg-[var(--ink-900)] text-white border-0 text-xs font-medium"
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

/* ─── Sub-componente: Item de nav com filhos (colapsável) ───────────────── */

function CollapsibleNavItem({
  item,
  isAnyChildActive,
  pathname,
  isCollapsed,
}: {
  item: NavItemDef;
  isAnyChildActive: boolean;
  pathname: string;
  isCollapsed: boolean;
}) {
  const [open, setOpen] = useState(isAnyChildActive);

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen((v) => !v)}
            className={[
              "flex justify-center items-center rounded-[var(--r-md)] p-2.5 mx-auto w-10 h-10 transition-all duration-150",
              isAnyChildActive
                ? "bg-[var(--kai-orange)] text-white shadow-[var(--sh-orange)]"
                : "text-[var(--ink-700)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)]",
            ].join(" ")}
          >
            <item.icon
              size={18}
              className={isAnyChildActive ? "text-white" : "text-[var(--ink-600)]"}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="bg-[var(--ink-900)] text-white border-0 text-xs font-medium"
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex w-full items-center gap-3 rounded-[var(--r-md)] px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isAnyChildActive
            ? "text-[var(--kai-orange-600)]"
            : "text-[var(--ink-700)] hover:bg-[var(--ink-100)] hover:text-[var(--ink-900)]",
        ].join(" ")}
      >
        <item.icon
          size={18}
          className={[
            "shrink-0",
            isAnyChildActive ? "text-[var(--kai-orange-600)]" : "text-[var(--ink-600)]",
          ].join(" ")}
        />
        <span className="flex-1 text-left">{item.label}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown
            size={14}
            className={isAnyChildActive ? "text-[var(--kai-orange-500)]" : "text-[var(--ink-500)]"}
          />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={`${item.key}-children`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-[30px] mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-[var(--ink-200)] pl-1">
              {item.children?.map((child) => {
                const isChildActive =
                  pathname === child.href ||
                  pathname.startsWith(child.href + "/");
                return (
                  <Link
                    key={child.key}
                    href={child.href}
                    className={[
                      "rounded-[var(--r-sm)] px-2.5 py-2 text-[13px] transition-all duration-150",
                      isChildActive
                        ? "font-semibold text-[var(--kai-orange-600)] border-l-2 border-[var(--kai-orange)] -ml-px"
                        : "text-[var(--ink-600)] hover:text-[var(--ink-900)]",
                    ].join(" ")}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Componente principal ──────────────────────────────────────────────── */

export default function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const { items: meusProdutos } = useListMeusProdutos();
  const { data: pedidos } = useListPedidosVendedor(user?.id);

  const operationItems: NavItemDef[] = NAV_OPERATION.map((item) => {
    if (item.key === "meus" && meusProdutos.length > 0) {
      return { ...item, badge: String(meusProdutos.length) };
    }
    if (item.key === "pedidos" && pedidos && pedidos.length > 0) {
      return { ...item, badge: String(pedidos.length) };
    }
    return item;
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials =
    user?.nomeCompleto
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "VK";

  const firstName = user?.nomeCompleto?.split(" ")[0] ?? "Vendedor";

  /* Determina key ativa a partir do pathname */
  function getActiveKey(pathname: string): string {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname.startsWith("/meus-produtos")) return "meus";
    if (pathname.startsWith("/vitrine-de-produtos")) return "vitrine";
    if (pathname.startsWith("/pedidos")) return "pedidos";
    if (pathname.startsWith("/relatorios/vendas")) return "vendas";
    if (pathname.startsWith("/relatorios/abandono")) return "abandono";
    if (pathname.startsWith("/relatorios/estornos")) return "estornos";
    if (pathname.startsWith("/relatorios")) return "relatorios";
    if (pathname.startsWith("/financeiro")) return "financeiro";
    if (pathname.startsWith("/marketing/cupons")) return "cupom";
    if (pathname.startsWith("/marketing/orderbump")) return "orderbump";
    if (pathname.startsWith("/marketing/pixel")) return "pixel";
    if (pathname.startsWith("/marketing")) return "marketing";
    return "dashboard";
  }

  const activeKey = getActiveKey(pathname);

  return (
    <TooltipProvider delayDuration={250}>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="border-r border-[var(--ink-200)] bg-[var(--ink-0)]"
        suppressHydrationWarning
      >
        {/* ── Logo ── */}
        <SidebarHeader
          className={[
            "transition-all duration-300",
            isCollapsed ? "px-2 pt-5 pb-3" : "px-4 pt-5 pb-3",
          ].join(" ")}
        >
          <div className={["flex items-center", isCollapsed ? "justify-center" : "px-1 pb-2"].join(" ")}>
            {isCollapsed ? (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[var(--r-md)] bg-[var(--kai-orange)]"
              >
                <span className="text-white text-xs font-black tracking-tight">K</span>
              </div>
            ) : (
              <Image
                src="/LOGO-MENU.png"
                alt="Kaiross"
                width={148}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            )}
          </div>
          {!isCollapsed && (
            <div className="mx-1 h-px bg-[var(--ink-200)]" />
          )}
        </SidebarHeader>

        {/* ── Conteúdo de navegação ── */}
        <SidebarContent className="px-2 py-1 overflow-y-auto">
          {/* Grupo Operação */}
          {!isCollapsed && (
            <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-500)]">
              Operação
            </p>
          )}
          {isCollapsed && <div className="mt-2" />}

          <nav className="flex flex-col gap-0.5">
            {operationItems.map((item) => (
              <SimpleNavItem
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>

          {/* Grupo Crescimento */}
          {!isCollapsed && (
            <p className="px-3 pt-4 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-500)]">
              Crescimento
            </p>
          )}
          {isCollapsed && <div className="mt-3" />}

          <nav className="flex flex-col gap-0.5">
            {NAV_GROWTH.map((item) =>
              item.children ? (
                <CollapsibleNavItem
                  key={item.key}
                  item={item}
                  isAnyChildActive={
                    item.children.some((c) => activeKey === c.key)
                  }
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                />
              ) : (
                <SimpleNavItem
                  key={item.key}
                  item={item}
                  isActive={activeKey === item.key}
                  isCollapsed={isCollapsed}
                />
              )
            )}
          </nav>
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="px-2 pb-4 pt-2">
          <div className="mx-2 mb-2 h-px bg-[var(--ink-200)]" />

          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-[var(--r-md)] bg-[var(--kai-orange)] text-white text-xs font-bold transition-all hover:opacity-90"
                    onClick={() => router.push("/minha-conta")}
                  >
                    {initials}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="bg-[var(--ink-900)] text-white border-0 text-xs"
                >
                  <p className="font-semibold">{user?.nomeCompleto ?? "Vendedor Kaiross"}</p>
                  <p className="text-[var(--ink-400)]">{user?.email ?? ""}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] text-[var(--kai-danger)] hover:bg-[var(--kai-danger-bg)] transition-all duration-150"
                  >
                    <LogOut size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="bg-[var(--ink-900)] text-white border-0 text-xs"
                >
                  Sair
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div
              className="flex cursor-pointer items-center gap-2.5 rounded-[var(--r-md)] border border-[var(--ink-200)] bg-[var(--ink-50)] p-3 transition-all hover:bg-[var(--ink-100)]"
              onClick={() => router.push("/minha-conta")}
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--kai-orange)] text-white text-[13px] font-bold">
                {initials}
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-semibold text-[var(--ink-900)]">
                  {user?.nomeCompleto ?? "Vendedor Kaiross"}
                </span>
                <span className="truncate text-[11px] text-[var(--ink-500)]">
                  {user?.email ?? "vendedor@kaiross.com"}
                </span>
              </div>

              {/* Ações */}
              <div className="flex shrink-0 items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push("/minha-conta"); }}
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--r-sm)] text-[var(--ink-500)] hover:bg-[var(--ink-200)] hover:text-[var(--ink-900)] transition-all"
                    >
                      <Settings size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[var(--ink-900)] text-white border-0 text-xs">
                    Configurações
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                      className="flex h-7 w-7 items-center justify-center rounded-[var(--r-sm)] text-[var(--kai-danger)] hover:bg-[var(--kai-danger-bg)] transition-all"
                    >
                      <LogOut size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[var(--ink-900)] text-white border-0 text-xs">
                    Sair
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
