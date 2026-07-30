import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  stock?: number;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        if (!state.items.find((item) => item.id === newItem.id)) {
          return { items: [...state.items, newItem] };
        }
        return state;
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      isInWishlist: (id) => get().items.some((item) => item.id === id),
      clearWishlist: () => set({ items: [] }),
      getTotalItems: () => get().items.length,
    }),
    {
      name: 'elshalom-wishlist-storage',
    }
  )
);
