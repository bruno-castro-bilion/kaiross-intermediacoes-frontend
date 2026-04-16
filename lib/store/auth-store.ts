import { create } from "zustand";

interface User {
  id: string;
  email: string;
  nomeCompleto: string;
  fotoPerfil?: string | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({ user: null, token: null });
  },
}));
