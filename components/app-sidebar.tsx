"use client";

import React from "react";
import {
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  LogOut,
  Users,
  BarChart3,
  Store,
  Wallet,
  ShoppingBag,
  UserCheck,
  ShoppingCart,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth-store";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

// Menu por role
const menusByRole = {
  admin: {
    principal: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Fornecedores", url: "/fornecedores", icon: Store },
      { title: "Vendedores", url: "/vendedores", icon: UserCheck },
      { title: "Produtos", url: "/produtos", icon: ShoppingBag },
      { title: "Usuários", url: "/usuarios", icon: Users },
    ],
    relatorios: [
      { title: "Vendas", url: "/relatorios/vendas", icon: TrendingUp },
      { title: "Abandono de Carrinho", url: "/relatorios/abandono", icon: ShoppingCart },
      { title: "Estornos", url: "/relatorios/estornos", icon: RefreshCcw },
    ],
    financeiro: [
      { title: "Financeiro", url: "/financeiro", icon: Wallet },
    ],
  },
  fornecedor: {
    principal: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Meus Produtos", url: "/meus-produtos", icon: ShoppingBag },
    ],
    relatorios: [
      { title: "Vendas", url: "/relatorios/vendas", icon: TrendingUp },
      { title: "Abandono de Carrinho", url: "/relatorios/abandono", icon: ShoppingCart },
      { title: "Estornos", url: "/relatorios/estornos", icon: RefreshCcw },
    ],
    financeiro: [
      { title: "Financeiro", url: "/financeiro", icon: Wallet },
    ],
  },
  vendedor: {
    principal: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Produtos Disponíveis", url: "/produtos", icon: ShoppingBag },
    ],
    relatorios: [
      { title: "Minhas Vendas", url: "/relatorios/vendas", icon: TrendingUp },
    ],
    financeiro: [
      { title: "Financeiro", url: "/financeiro", icon: Wallet },
    ],
  },
};

type MenuItem = { title: string; url: string; icon: React.ElementType };

function renderMenuItem(item: MenuItem, pathname: string, isCollapsed: boolean, isMobile: boolean) {
  const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
  return (
    <div key={item.title}>
      <SidebarMenuItem style={isCollapsed && !isMobile ? { padding: 0, margin: 0 } : {}} className={isMobile ? "px-4" : ""}>
        {isMobile ? (
          <Link
            href={item.url}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
              isActive ? "bg-primary text-white shadow-sm" : "hover:bg-muted/50"
            }`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? "bg-white/20" : "bg-muted"}`}>
              <item.icon className="size-4 shrink-0" />
            </div>
            <span className="font-medium">{item.title}</span>
          </Link>
        ) : isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.url}
                className={`mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 outline-none ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "hover:bg-muted text-sidebar-foreground/70 hover:text-sidebar-foreground"
                }`}
                style={{ padding: 0, margin: "0 auto" }}
              >
                <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                  <item.icon className="size-4 shrink-0" />
                </motion.div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card text-card-foreground border-border border font-medium shadow-xl" sideOffset={12}>
              {item.title}
            </TooltipContent>
          </Tooltip>
        ) : (
          <SidebarMenuButton
            asChild
            className={`h-auto! min-h-10 w-full text-sm transition-all duration-200 rounded-lg ${
              isActive
                ? "bg-primary! text-white! hover:bg-primary/90! shadow-sm"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-muted"
            }`}
          >
            <Link href={item.url} className="flex items-center gap-3 px-3 py-2.5">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }} className="shrink-0">
                <item.icon className="size-4 shrink-0" />
              </motion.div>
              <span className="overflow-hidden whitespace-normal font-medium">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </div>
  );
}

export default function AppSidebar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // TODO: pegar role do usuário autenticado (admin | fornecedor | vendedor)
  const role: keyof typeof menusByRole = "vendedor";
  const menus = menusByRole[role];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.nomeCompleto
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "KI";

  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="relative transition-all duration-300 ease-in-out"
        suppressHydrationWarning
      >
        {isMobile ? (
          <SidebarHeader className="p-6" suppressHydrationWarning>
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Kaiross" width={36} height={36} className="object-contain" />
              <h2 className="text-sidebar-foreground text-lg font-bold">Kaiross</h2>
            </div>
          </SidebarHeader>
        ) : (
          <SidebarHeader
            className={`transition-all duration-300 ${isCollapsed ? "px-3 pt-4 pb-3" : "p-5"}`}
          >
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ scale: isCollapsed && !isMobile ? 0.9 : 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Image
                src="/logo.png"
                alt="Kaiross"
                width={isCollapsed ? 36 : 48}
                height={isCollapsed ? 36 : 48}
                className="object-contain drop-shadow-sm"
              />
            </motion.div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 text-center"
                >
                  <p className="text-sidebar-foreground text-sm font-bold tracking-wide">
                    Kaiross
                  </p>
                  <p className="text-sidebar-foreground/50 text-xs">Intermediações</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`flex justify-center py-3 ${isCollapsed ? "px-0" : "px-2"}`}>
              <div
                className="via-primary/30 h-px bg-linear-to-r from-transparent to-transparent"
                style={{ width: isCollapsed ? "100%" : "80%" }}
              />
            </div>
          </SidebarHeader>
        )}

        {!isMobile && (
          <motion.div
            className="absolute top-1/2 -right-3.5 z-50 -translate-y-1/2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            suppressHydrationWarning
          >
            <Button
              onClick={toggleSidebar}
              size="icon"
              className="bg-sidebar border-sidebar-border hover:bg-muted h-7 w-7 cursor-pointer rounded-full border-2 p-0 shadow-lg transition-all duration-300"
            >
              {isCollapsed ? (
                <ChevronRight className="text-sidebar-foreground size-3" />
              ) : (
                <ChevronLeft className="text-sidebar-foreground size-3" />
              )}
            </Button>
          </motion.div>
        )}

        <SidebarContent
          className={`flex flex-col justify-between ${isMobile ? "overflow-y-auto" : ""}`}
        >
          {/* Grupo principal */}
          <SidebarGroup className={`${isMobile ? "px-5 py-4" : "py-2"} ${isCollapsed ? "px-0" : ""}`}>
            <SidebarGroupContent className={isCollapsed ? "px-0" : ""}>
              <SidebarMenu className={`space-y-1 ${isCollapsed ? "space-y-2" : ""}`}>
                {menus.principal.map((item) => renderMenuItem(item, pathname, isCollapsed, isMobile))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Relatórios */}
          <SidebarGroup className={`${isMobile ? "px-5 py-2" : "py-2"} ${isCollapsed ? "px-0" : ""}`}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/40 px-3 text-[10px] font-semibold uppercase tracking-widest">
                Relatórios
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className={isCollapsed ? "px-0" : ""}>
              <SidebarMenu className={`space-y-1 ${isCollapsed ? "space-y-2" : ""}`}>
                {menus.relatorios.map((item) => renderMenuItem(item, pathname, isCollapsed, isMobile))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Financeiro */}
          <SidebarGroup className={`${isMobile ? "px-5 py-2" : "py-2"} ${isCollapsed ? "px-0" : ""}`}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/40 px-3 text-[10px] font-semibold uppercase tracking-widest">
                Financeiro
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className={isCollapsed ? "px-0" : ""}>
              <SidebarMenu className={`space-y-1 ${isCollapsed ? "space-y-2" : ""}`}>
                {menus.financeiro.map((item) => renderMenuItem(item, pathname, isCollapsed, isMobile))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className={`flex justify-center py-4 ${isCollapsed ? "px-0" : "px-2"}`}>
          <div
            className="via-primary/30 h-0.5 bg-linear-to-r from-transparent to-transparent"
            style={{ width: isCollapsed ? "90%" : "80%" }}
          />
        </div>

        <SidebarFooter
          className={`transition-all duration-300 ${isCollapsed ? "p-0 pt-6 pb-6" : "p-4"}`}
        >
          <SidebarMenu>
            <SidebarMenuItem style={isCollapsed ? { padding: 0, margin: 0 } : {}}>
              {isMobile ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user?.fotoPerfil ?? undefined} />
                    <AvatarFallback className="bg-primary text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sidebar-foreground truncate text-sm font-semibold">
                      {user?.nomeCompleto ?? "Usuário"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email ?? "usuario@kaiross.com.br"}
                    </span>
                  </div>
                </div>
              ) : isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="flex h-9 w-full cursor-pointer items-center justify-center rounded-lg transition-all duration-200 hover:bg-muted"
                      style={{ padding: 0, margin: 0 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Settings className="size-4 shrink-0 text-sidebar-foreground/70" />
                      </motion.div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-card text-card-foreground border-border border font-medium shadow-xl"
                    sideOffset={12}
                  >
                    Configurações
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
                    <Avatar className="size-7 shrink-0">
                      <AvatarImage src={user?.fotoPerfil ?? undefined} />
                      <AvatarFallback className="bg-primary text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sidebar-foreground truncate text-xs font-semibold">
                        {user?.nomeCompleto ?? "Usuário"}
                      </span>
                      <span className="text-muted-foreground truncate text-[10px]">
                        {user?.email ?? "usuario@kaiross.com.br"}
                      </span>
                    </div>
                  </div>
                  <SidebarMenuButton
                    asChild
                    className="h-10 w-full text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-muted rounded-lg transition-all duration-200"
                  >
                    <Link href="/configuracoes" className="flex items-center gap-3 px-3">
                      <motion.div whileHover={{ scale: 1.1, rotate: 90 }} transition={{ duration: 0.3 }}>
                        <Settings className="size-4 shrink-0" />
                      </motion.div>
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                  <button
                    onClick={handleLogout}
                    className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-muted transition-all duration-200"
                  >
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                      <LogOut className="size-4 shrink-0" />
                    </motion.div>
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
