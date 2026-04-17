"use client";

import { Eye, EyeOff, Bell, User, LogOut, Home } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RevenueIndicator } from "@/components/revenue-indicator";
import { useAuthStore } from "@/lib/store/auth-store";
import { useBalanceVisibility } from "@/contexts/balance-visibility-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppHeader({ showLogo = false }: { showLogo?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { showBalance, toggleBalance } = useBalanceVisibility();
  const isMinhaContaPage = pathname === "/minha-conta";
  const isHomePage = pathname === "/dashboard";

  const firstName = user?.nomeCompleto?.split(" ")[0] ?? "Usuário";

  const initials =
    user?.nomeCompleto
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "KI";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="border-border bg-background text-foreground flex h-16 w-full shrink-0 items-center gap-2 overflow-visible border-b px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {showLogo ? (
          <Image
            src="/LOGO-MENU.png"
            alt="Kaiross"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        ) : (
          <div className="hidden truncate md:block">
            <h1 className="text-sidebar-foreground truncate text-sm font-semibold">
              Bem vindo de volta, {firstName}
            </h1>
          </div>
        )}
      </div>

      <div className="hidden lg:mr-3 lg:flex lg:flex-1 lg:justify-end">
        <RevenueIndicator value={6254.54} showBalance={showBalance} />
      </div>

      <section className="ml-auto flex h-full shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">
        <div className="lg:hidden">
          <RevenueIndicator value={6254.54} showBalance={showBalance} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer sm:h-10 sm:w-10"
          onClick={toggleBalance}
        >
          {showBalance ? (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer sm:h-10 sm:w-10"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button suppressHydrationWarning className="border-primary hover:shadow-primary/20 cursor-pointer rounded-full border-2 transition-all hover:scale-105 hover:shadow-lg">
              <Avatar className="size-8">
                <AvatarImage src={user?.fotoPerfil ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card min-w-48 overflow-hidden rounded-xl border p-0 shadow-lg"
          >
            <div className="border-border/50 flex items-center gap-2.5 border-b p-3">
              <Avatar className="size-9">
                <AvatarImage src={user?.fotoPerfil ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground truncate text-xs font-semibold">
                  {user?.nomeCompleto ?? "Usuário"}
                </span>
                <span className="text-muted-foreground truncate text-[10px]">
                  {user?.email ?? ""}
                </span>
              </div>
            </div>

            <div className="p-1.5">
              {!isMinhaContaPage && (
                <DropdownMenuItem
                  onClick={() => router.push("/minha-conta")}
                  className="hover:bg-accent focus:bg-accent cursor-pointer gap-2 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  <User className="text-muted-foreground size-3.5" />
                  <span className="text-xs">Minha conta</span>
                </DropdownMenuItem>
              )}

              {!isHomePage && (
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="hover:bg-accent focus:bg-accent cursor-pointer gap-2 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  <Home className="text-muted-foreground size-3.5" />
                  <span className="text-xs">Voltar para a Home</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="my-1.5" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2 rounded-lg px-2.5 py-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <LogOut className="size-3.5" />
                <span className="text-xs font-medium">Sair</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </header>
  );
}
