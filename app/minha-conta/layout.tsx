"use client";

import AppHeader from "@/components/app-header";
import { BalanceVisibilityProvider } from "@/contexts/balance-visibility-context";

export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BalanceVisibilityProvider>
      <div
        data-testid="minha-conta-shell"
        className="flex min-h-screen flex-col"
      >
        <AppHeader showLogo />
        <main
          data-testid="minha-conta-shell-main"
          className="flex-1 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </BalanceVisibilityProvider>
  );
}
