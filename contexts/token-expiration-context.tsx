"use client";

import { useTokenExpiration } from "@/hooks/use-token-expiration";
import { TokenExpirationDialog } from "@/components/token-expiration-dialog";

interface TokenExpirationProviderProps {
  children: React.ReactNode;
}

export function TokenExpirationProvider({
  children,
}: TokenExpirationProviderProps) {
  const {
    showWarning,
    timeRemaining,
    isRefreshing,
    handleContinue,
    handleLogout,
    notifyOtherTabs,
  } = useTokenExpiration();

  const handleContinueWithNotification = async () => {
    await handleContinue();
    notifyOtherTabs();
  };

  return (
    <>
      {children}
      <TokenExpirationDialog
        open={showWarning}
        timeRemaining={timeRemaining}
        isRefreshing={isRefreshing}
        onContinue={handleContinueWithNotification}
        onLogout={handleLogout}
      />
    </>
  );
}
