"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCartStore, CartItem } from "@/store/cartStore";

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
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock === 0;

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) {
      // Handle pre-order logic if needed, otherwise just add as normal but maybe flag as pre-order
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
      return;
    }
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
    <div className="group relative bg-white rounded-3xl border border-border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && <Badge variant="primary">New Arrival</Badge>}
        {product.isSale && <Badge variant="danger">-{discountPercentage}% Off</Badge>}
        {isOutOfStock && <Badge variant="warning">Out of Stock</Badge>}
      </div>

      {/* Action Buttons - Quick View & Wishlist */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
        <button className="h-10 w-10 rounded-xl bg-white shadow-xl flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white transition-all scale-90 hover:scale-100 border border-border hover:border-primary">
          <Heart className="h-5 w-5" />
        </button>
        <button className="h-10 w-10 rounded-xl bg-white shadow-xl flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white transition-all scale-90 hover:scale-100 border border-border hover:border-primary">
          <Eye className="h-5 w-5" />
        </button>
      </div>

      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-card">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
            {product.category}
          </p>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-black">
              {product.rating || "5.0"}
            </span>
          </div>
        </div>

        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm md:text-base font-black text-text-primary line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-tight">
            {product.name}
          </h3>
        </Link>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-primary tracking-tighter">
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
          variant={isOutOfStock ? "outline" : "primary"}
          className={`w-full mt-4 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${
            isOutOfStock ? "border-amber-200 text-amber-600 hover:bg-amber-50" : "shadow-primary/20"
          }`}
        >
          <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? "Pre-Order" : "Add to Cart"}
          </span>
        </Button>
      </div>
    </div>
  );
};
