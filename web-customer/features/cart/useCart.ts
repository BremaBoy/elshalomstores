import { useCartStore } from "@/store/cartStore";

export const useCart = () => {
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCartStore();

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount: getTotalItems(),
    totalPrice: getTotalPrice(),
  };
};
