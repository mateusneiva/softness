import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/src/types';

export type RecentProduct = Pick<
  Product,
  'id' | 'name' | 'price' | 'imageUrl' | 'images' | 'sizes' | 'unavailableSizes' | 'available' | 'description'
>;

interface RecentlyViewedState {
  items: RecentProduct[];
  track: (product: RecentProduct) => void;
  clear: () => void;
}

const MAX_ITEMS = 4;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      track: (product) =>
        set((state) => {
          const filtered = state.items.filter((item) => item.id !== product.id);
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'recently-viewed' },
  ),
);
