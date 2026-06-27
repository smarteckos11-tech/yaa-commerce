"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  slug: string;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
};

type CartState = {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number; // percentage 0-100
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: string, variant?: CartItem["variant"]) => void;
  updateQuantity: (productId: string, quantity: number, variant?: CartItem["variant"]) => void;
  clear: () => void;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: (method: string) => number;
  getTotal: (shippingMethod: string) => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,

      add: (item, quantity = 1) => {
        const state = get();
        const existing = state.items.find(
          (i) => i.productId === item.productId &&
          JSON.stringify(i.variant) === JSON.stringify(item.variant)
        );

        if (existing) {
          set({
            items: state.items.map((i) =>
              i.productId === item.productId &&
              JSON.stringify(i.variant) === JSON.stringify(item.variant)
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...state.items, { ...item, quantity }] });
        }
      },

      remove: (productId, variant) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant))
          ),
        });
      },

      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().remove(productId, variant);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant)
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clear: () => set({ items: [], promoCode: null, promoDiscount: 0 }),

      applyPromo: (code, discount) => set({ promoCode: code, promoDiscount: discount }),
      removePromo: () => set({ promoCode: null, promoDiscount: 0 }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        return Math.round((subtotal * get().promoDiscount) / 100);
      },

      getShipping: (method) => {
        switch (method) {
          case "yango": return 2500;
          case "dhl": return 8500;
          case "local": return 1500;
          case "pickup": return 0;
          default: return 2500;
        }
      },

      getTotal: (shippingMethod) => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const shipping = get().getShipping(shippingMethod);
        return subtotal - discount + shipping;
      },
    }),
    {
      name: "yaa-cart", // localStorage key
    }
  )
);
