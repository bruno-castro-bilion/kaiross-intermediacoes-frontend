"use client";

import { useState, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

const SIDEBAR_KEY = "sidebar-collapsed";

export function getSidebarCollapsed(): boolean | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SIDEBAR_KEY);
  if (stored === null) return null;
  return stored === "true";
}

export function clearSidebarPreference() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SIDEBAR_KEY);
  }
}

export function SidebarProviderPersist({
  children,
  ...props
}: React.ComponentProps<typeof SidebarProvider>) {
  const [open, setOpen] = useState(() => {
    const collapsed = getSidebarCollapsed();
    return collapsed !== true;
  });

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
