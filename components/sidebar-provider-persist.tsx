"use client";

import { useState, useCallback, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

const SIDEBAR_KEY = "sidebar-collapsed";

export function clearSidebarPreference() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SIDEBAR_KEY);
  }
}

export function SidebarProviderPersist({
  children,
  ...props
}: React.ComponentProps<typeof SidebarProvider>) {
  // Sempre inicia como "open" no servidor para evitar hydration mismatch
  const [open, setOpen] = useState(true);

  // Após montar no cliente, aplica o estado salvo no localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) {
      setOpen(stored !== "true");
    }
  }, []);

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    localStorage.setItem(SIDEBAR_KEY, value ? "false" : "true");
  }, []);

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange} {...props}>
      {children}
    </SidebarProvider>
  );
}
