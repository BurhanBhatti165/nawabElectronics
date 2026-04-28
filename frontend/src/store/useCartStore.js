import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const index = currentItems.findIndex((item) => item.id === product.id);
        if (index > -1) {
          const next = [...currentItems];
          next[index].quantity += quantity;
          set({ items: next });
          return;
        }
        set({ items: [...currentItems, { ...product, quantity }] });
      },
      removeItem: (productId) => set({ items: get().items.filter((x) => x.id !== productId) }),
      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getSubtotal: () => get().items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
      getTotalSavings: () => get().items.reduce((acc, item) => {
        const price = Number(item.price);
        const dPrice = Number(item.discount_price) || price;
        return acc + (price - dPrice) * item.quantity;
      }, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (acc, item) =>
            acc + (Number(item.discount_price) || Number(item.price)) * item.quantity,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
