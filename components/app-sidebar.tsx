"use client";

import {
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  LogOut,
  Users,
  FileText,
  BarChart3,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Negociações", url: "/negociacoes", icon: Briefcase },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Documentos", url: "/documentos", icon: FileText },
];

export default function AppSidebar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isLightTheme = theme === "light";

  const darkGradient =
    "radial-gradient(171.69% 126.86% at 6.05% 0%, rgba(242,106,0,0.4) 0%, rgba(12, 14, 21, 0.00) 100%), rgba(12, 14, 21, 0.70)";
  const lightGradient =
    "radial-gradient(171.69% 126.86% at 6.05% 0%, rgba(242,106,0,0.15) 0%, rgba(255, 255, 255, 0) 100%), rgba(248, 250, 252, 0.80)";

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
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-primary-foreground text-xs font-bold">K</span>
              </div>
              <h2 className="text-sidebar-foreground text-lg font-bold">Kaiross</h2>
            </div>
          </SidebarHeader>
        ) : (
          <SidebarHeader
            className={`transition-all duration-300 ${isCollapsed ? "px-3 pt-4 pb-3" : "p-6"}`}
          >
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ scale: isCollapsed && !isMobile ? 0.9 : 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-lg">
                <span className="text-primary-foreground text-lg font-bold">K</span>
              </div>
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
                  <p className="text-sidebar-foreground text-sm font-semibold tracking-wide">
                    Kaiross
                  </p>
                  <p className="text-sidebar-foreground/50 text-xs">Intermediações</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`flex justify-center py-4 ${isCollapsed ? "px-0" : "px-2"}`}>
              <div
                className="via-primary/30 h-0.5 bg-linear-to-r from-transparent to-transparent"
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
          <SidebarGroup
            className={`flex-1 ${isMobile ? "px-5 py-4" : "py-6"} ${isCollapsed ? "px-0" : ""}`}
          >
            <SidebarGroupContent className={isCollapsed ? "px-0" : ""}>
              <SidebarMenu
                className={`${isMobile ? "space-y-2" : "space-y-3"} ${isCollapsed ? "space-y-2" : ""}`}
              >
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <div key={item.title}>
                      <SidebarMenuItem
                        style={isCollapsed && !isMobile ? { padding: 0, margin: 0 } : {}}
                        className={isMobile ? "px-4" : ""}
                      >
                        {isMobile ? (
                          <Link
                            href={item.url}
                            className={`flex items-center gap-4 rounded-xl px-4 py-4 transition-all duration-200 ${
                              isActive ? "text-primary shadow-sm" : "hover:bg-muted/50"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                isActive ? "bg-primary/20" : "bg-muted"
                              }`}
                            >
                              <item.icon className="size-5 shrink-0" />
                            </div>
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        ) : isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={item.url}
                                className={`mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-300 outline-none ${
                                  isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "hover:bg-muted/50"
                                }`}
                                style={{
                                  padding: 0,
                                  margin: "0 auto",
                                  ...(isActive && !isLightTheme ? { background: darkGradient } : {}),
                                  ...(isActive && isLightTheme ? { background: lightGradient } : {}),
                                }}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <item.icon className="size-4 shrink-0" />
                                </motion.div>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-card text-card-foreground border-border border font-medium shadow-xl"
                              sideOffset={12}
                            >
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            style={
                              isActive && !isLightTheme
                                ? { background: darkGradient }
                                : isActive && isLightTheme
                                  ? { background: lightGradient }
                                  : undefined
                            }
                            className={`h-auto! min-h-10 w-full text-sm transition-all duration-300 ${
                              isActive ? "text-primary hover:bg-primary/15 rounded-lg" : ""
                            }`}
                          >
                            <Link href={item.url} className="flex items-start gap-3 pl-4">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                                className="mt-0.5 shrink-0"
                              >
                                <item.icon className="size-4 shrink-0" />
                              </motion.div>
                              <span className="overflow-hidden whitespace-normal">
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    </div>
                  );
                })}
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
          className={`transition-all duration-300 ${isCollapsed ? "p-0 pt-6 pb-6" : "p-6"}`}
        >
          <SidebarMenu>
            <SidebarMenuItem style={isCollapsed ? { padding: 0, margin: 0 } : {}}>
              {isMobile ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={user?.fotoPerfil ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
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
                      className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg transition-all duration-300"
                      style={{ padding: 0, margin: 0 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Settings className="size-4 shrink-0" />
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-2">
                    <Avatar className="size-7 shrink-0">
                      <AvatarImage src={user?.fotoPerfil ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
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
                    className="h-10 w-full text-sm transition-all duration-300"
                  >
                    <Link href="/configuracoes" className="flex items-center gap-3 pl-4">
                      <motion.div whileHover={{ scale: 1.1, rotate: 90 }} transition={{ duration: 0.3 }}>
                        <Settings className="size-4 shrink-0" />
                      </motion.div>
                      <AnimatePresence>
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden whitespace-nowrap"
                        >
                          Configurações
                        </motion.span>
                      </AnimatePresence>
                    </Link>
                  </SidebarMenuButton>
                  <button
                    onClick={handleLogout}
                    className="hover:bg-accent flex h-10 w-full items-center gap-3 rounded-lg pl-4 text-sm transition-all duration-300"
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
