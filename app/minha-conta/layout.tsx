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
      <div className="flex min-h-screen flex-col">
        <AppHeader showLogo />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </BalanceVisibilityProvider>
  );
}
