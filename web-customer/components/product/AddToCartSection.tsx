"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Minus, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface AddToCartSectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
    category: string;
    stock?: number;
  };
}

export const AddToCartSection = ({ product }: AddToCartSectionProps) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlistStore();
  const inWishlist = isMounted ? isInWishlist(product.id) : false;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.image,
      category: product.category,
      stock: product.stock,
      quantity,
    });

    // Show confirmation feedback
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(product.stock ?? 99, q + 1));

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden h-12">
          <button
            onClick={decrease}
            disabled={quantity <= 1}
            className="px-4 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors h-full font-bold text-lg"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="px-4 font-bold text-base w-12 text-center">{quantity}</span>
          <button
            onClick={increase}
            disabled={quantity >= (product.stock ?? 99)}
            className="px-4 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors h-full font-bold text-lg"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className={`flex-grow h-12 text-lg rounded-xl gap-2 font-bold uppercase tracking-wide transition-all ${
            added ? "bg-emerald-500 hover:bg-emerald-600" : ""
          }`}
        >
          {added ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </>
          )}
        </Button>

        {/* Wishlist Button */}
        <Button 
          variant="outline" 
          size="icon" 
          className={`h-12 w-12 rounded-xl flex-shrink-0 transition-colors ${inWishlist ? "bg-red-50 border-red-200" : "border-slate-200 hover:border-red-200"}`}
          onClick={() => {
            if (inWishlist) {
              removeWishlistItem(product.id);
            } else {
              addWishlistItem({
                id: product.id,
                name: product.name,
                price: product.price,
                discountPrice: product.discountPrice,
                image: product.image,
                category: product.category,
                stock: product.stock,
              });
            }
          }}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "text-red-500 fill-current" : "text-slate-400 hover:text-red-500"}`} />
        </Button>
      </div>
    </div>
  );
};
