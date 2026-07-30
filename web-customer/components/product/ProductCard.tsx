"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
    category: string;
    rating?: number;
    isNew?: boolean;
    isSale?: boolean;
    stock: number;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlistStore();
  const isOutOfStock = product.stock === 0;
  const inWishlist = isMounted ? isInWishlist(product.id) : false;

  // Guard against invalid image URLs (e.g. "n/a" from the DB)
  const validSrc =
    typeof product.image === "string" && product.image.startsWith("http")
      ? product.image
      : PLACEHOLDER;
  const [imgSrc, setImgSrc] = useState(validSrc);

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.image,
      quantity: 1,
      category: product.category,
      stock: product.stock,
    });
  };

  return (
    <div className="group relative bg-bg rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 text-text-primary">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && <Badge variant="primary">New Arrival</Badge>}
        {product.isSale && <Badge variant="danger">-{discountPercentage}% Off</Badge>}
        {isOutOfStock && <Badge variant="warning">Out of Stock</Badge>}
      </div>

      {/* Action Buttons - Quick View & Wishlist */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
        <button 
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={(e) => {
            e.preventDefault();
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
          className={`h-10 w-10 rounded-xl shadow-xl flex items-center justify-center transition-all scale-90 hover:scale-100 border ${
            inWishlist 
              ? "bg-red-50 text-red-500 border-red-200" 
              : "bg-white text-text-secondary hover:bg-primary hover:text-white border-border hover:border-primary"
          }`}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
        </button>
        <Link
          href={`/product/${product.id}`}
          aria-label={`View ${product.name}`}
          className="h-10 w-10 rounded-xl bg-card shadow-xl flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white transition-all scale-90 hover:scale-100 border border-border hover:border-primary"
        >
          <Eye className="h-5 w-5" />
        </Link>
      </div>

      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-card">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc(PLACEHOLDER)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
            {product.category}
          </p>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-black">
              {product.rating ? product.rating.toFixed(1) : "—"}
            </span>
          </div>
        </div>

        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm md:text-base font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
            {product.name}
          </h3>
        </Link>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-primary tracking-tighter">
            ₦{(product.discountPrice || product.price).toLocaleString()}
          </span>
          {product.discountPrice && (
            <span className="text-[10px] text-text-secondary line-through font-bold opacity-50">
              ₦{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart / Pre-Order Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant={isOutOfStock ? "outline" : "primary"}
          className={`w-full mt-2 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-md ${
            isOutOfStock ? "cursor-not-allowed border-border text-text-secondary opacity-60" : "shadow-primary/20"
          }`}
        >
          <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </span>
        </Button>
      </div>
    </div>
  );
};
