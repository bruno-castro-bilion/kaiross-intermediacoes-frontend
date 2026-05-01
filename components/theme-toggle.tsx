"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      data-testid="theme-toggle-button"
      data-theme={mounted ? theme : "unknown"}
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative cursor-pointer rounded-full transition-all duration-300 hover:scale-110"
      suppressHydrationWarning
    >
      {mounted ? (
        theme === "dark" ? (
          <Moon
            data-testid="theme-toggle-icon-dark"
            className="h-[1.2rem] w-[1.2rem]"
          />
        ) : (
          <Sun
            data-testid="theme-toggle-icon-light"
            className="h-[1.2rem] w-[1.2rem]"
          />
        )
      ) : (
        <Sun
          data-testid="theme-toggle-icon-fallback"
          className="h-[1.2rem] w-[1.2rem]"
        />
      )}
      <span data-testid="theme-toggle-sr-label" className="sr-only">
        Alternar tema
      </span>
    </Button>
  );
}
