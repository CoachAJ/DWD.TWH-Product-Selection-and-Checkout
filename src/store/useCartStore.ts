import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartStore } from '../types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      distributorId: '101289416',

      addItem: (product: Product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.sku === product.sku);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.sku === product.sku
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        });
      },

      removeItem: (sku: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.sku !== sku),
        }));
      },

      updateQuantity: (sku: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(sku);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.sku === sku ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setDistributorId: (id: string) => {
        set({ distributorId: id });
      },

      getCheckoutUrl: () => {
        const { items, distributorId } = get();
        if (items.length === 0) return '';

        // Build item parameters: item-1=SKU|QTY&item-2=SKU|QTY...
        const itemParams = items
          .map((item, index) => `item-${index + 1}=${encodeURIComponent(`${item.sku}|${item.quantity}`)}`)
          .join('&');

        return `https://ygy1.com/customer-checkout/v1.3/?sponsorid=${distributorId}&${itemParams}&destroy=1`;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'dwd-cart-storage',
      partialize: (state) => ({
        items: state.items,
        distributorId: state.distributorId,
      }),
    }
  )
);
