import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Persistência local das configurações de marketing (cupons, order bumps,
 * pixels). O backend Kaiross ainda não tem um marketing-service — quando
 * existir, este store é substituído por hooks que falam com a API. Até
 * lá, tudo aqui fica só no navegador do vendedor e NÃO é aplicado no
 * checkout. As páginas mostram banners deixando isso explícito.
 */

export type CupomKind = "PERCENT" | "FIXED" | "FRETE_GRATIS";

export interface Cupom {
  id: string;
  code: string;
  kind: CupomKind;
  discountValue: number;
  appliesTo: string;
  maxUses: number;
  uses: number;
  active: boolean;
  createdAt: string;
}

export type OrderBumpDiscountType = "percent" | "fixed";

export interface OrderBump {
  id: string;
  active: boolean;
  title: string;
  description: string;
  mainProductId?: string;
  bumpProductId?: string;
  mainProductLabel: string;
  bumpProductLabel: string;
  discountType: OrderBumpDiscountType;
  discountValue: number;
  views: number;
  accepts: number;
  revenue: number;
  createdAt: string;
}

export type PixelPlatform = "facebook" | "google" | "tiktok";

export interface Pixel {
  id: string;
  platform: PixelPlatform;
  pixelId: string;
  name: string;
  active: boolean;
  createdAt: string;
}

interface MarketingState {
  cupons: Cupom[];
  orderBumps: OrderBump[];
  pixels: Pixel[];

  addCupom: (data: Omit<Cupom, "id" | "createdAt" | "uses">) => void;
  updateCupom: (id: string, patch: Partial<Cupom>) => void;
  removeCupom: (id: string) => void;
  toggleCupom: (id: string) => void;

  addOrderBump: (
    data: Omit<OrderBump, "id" | "createdAt" | "views" | "accepts" | "revenue">,
  ) => void;
  updateOrderBump: (id: string, patch: Partial<OrderBump>) => void;
  removeOrderBump: (id: string) => void;
  toggleOrderBump: (id: string) => void;

  addPixel: (data: Omit<Pixel, "id" | "createdAt">) => void;
  removePixel: (id: string) => void;
  togglePixel: (id: string) => void;
}

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set) => ({
      cupons: [],
      orderBumps: [],
      pixels: [],

      addCupom: (data) =>
        set((s) => ({
          cupons: [
            ...s.cupons,
            {
              ...data,
              id: newId("cup"),
              uses: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateCupom: (id, patch) =>
        set((s) => ({
          cupons: s.cupons.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCupom: (id) =>
        set((s) => ({ cupons: s.cupons.filter((c) => c.id !== id) })),
      toggleCupom: (id) =>
        set((s) => ({
          cupons: s.cupons.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c,
          ),
        })),

      addOrderBump: (data) =>
        set((s) => ({
          orderBumps: [
            ...s.orderBumps,
            {
              ...data,
              id: newId("bmp"),
              views: 0,
              accepts: 0,
              revenue: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateOrderBump: (id, patch) =>
        set((s) => ({
          orderBumps: s.orderBumps.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
        })),
      removeOrderBump: (id) =>
        set((s) => ({
          orderBumps: s.orderBumps.filter((b) => b.id !== id),
        })),
      toggleOrderBump: (id) =>
        set((s) => ({
          orderBumps: s.orderBumps.map((b) =>
            b.id === id ? { ...b, active: !b.active } : b,
          ),
        })),

      addPixel: (data) =>
        set((s) => ({
          pixels: [
            ...s.pixels,
            {
              ...data,
              id: newId("px"),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removePixel: (id) =>
        set((s) => ({ pixels: s.pixels.filter((p) => p.id !== id) })),
      togglePixel: (id) =>
        set((s) => ({
          pixels: s.pixels.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p,
          ),
        })),
    }),
    {
      name: "kaiross-marketing-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
