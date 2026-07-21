import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cartId: string;
  productId: string;
  variantId: string;
  variantName: string;
  colorHex?: string | null;
  name: string;
  price: number;
  imageUrl: string | null;
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity' | 'cartId'>) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) =>
        set((state) => {
          const cartId = `${newItem.productId}:${newItem.variantId}:${newItem.size}`;
          const existingItem = state.items.find((item) => item.cartId === cartId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...newItem, cartId, quantity: 1 }], isOpen: true };
        }),
      removeItem: (cartId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartId !== cartId),
        })),
      updateQuantity: (cartId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (item.cartId === cartId ? { ...item, quantity } : item)),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'shopping-cart-v4',
    },
  ),
);
