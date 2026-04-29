"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const STORAGE_KEY = "kaiross-show-balance";

interface BalanceVisibilityContextType {
  showBalance: boolean;
  toggleBalance: () => void;
}

const BalanceVisibilityContext = createContext<
  BalanceVisibilityContextType | undefined
>(undefined);

export function BalanceVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [showBalance, setShowBalance] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === "true" : true;
  });

  const toggleBalance = () => {
    setShowBalance((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <BalanceVisibilityContext.Provider value={{ showBalance, toggleBalance }}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext);
  if (context === undefined) {
    throw new Error(
      "useBalanceVisibility must be used within a BalanceVisibilityProvider",
    );
  }
  return context;
}
