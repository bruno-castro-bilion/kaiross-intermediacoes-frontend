import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/app/api/auth/types";
import { clearSidebarPreference } from "@/components/sidebar-provider-persist";

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user: User) => {
        set({ user });
        if (typeof window !== "undefined") {
          localStorage.setItem("kaiross-token-issued-at", Date.now().toString());
        }
      },
      clearUser: () => {
        set({ user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("kaiross-token-issued-at");
        }
      },
      logout: () => {
        set({ user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("kaiross-token-issued-at");
          fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
          localStorage.setItem("logout-event", Date.now().toString());
          clearSidebarPreference();
        }
      },
      isAuthenticated: () => get().user !== null,
    }),
    {
      name: "kaiross-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user ? { ...state.user, token: undefined } : null,
      }),
    },
  ),
);
