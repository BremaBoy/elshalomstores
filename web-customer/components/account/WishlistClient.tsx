"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

export const WishlistClient = () => {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-8">
        <div className="relative">
          <div className="h-28 w-28 bg-red-50 rounded-full flex items-center justify-center">
            <Heart className="h-14 w-14 text-red-300" />
          </div>
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
        </div>

        <div className="text-center space-y-3 max-w-md">
          <h4 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">
            Nothing saved yet
          </h4>
          <p className="text-slate-500 font-medium leading-relaxed">
            Save your favourite products by clicking the heart icon on any product page. They&apos;ll appear here for easy access.
          </p>
        </div>

        <Link href="/shop">
          <Button className="h-14 px-12 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 gap-3">
            <ShoppingBag className="h-5 w-5" />
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="group relative bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-4 transition-all hover:shadow-xl hover:shadow-slate-200/50">
          <Link href={`/product/${item.id}`} className="block relative aspect-square rounded-2xl overflow-hidden bg-slate-50">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">{item.category}</p>
            <Link href={`/product/${item.id}`} className="block">
              <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h4>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900">
                ₦{(item.discountPrice || item.price).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 font-bold rounded-xl"
              onClick={() => {
                addItem({
                  ...item,
                  quantity: 1,
                });
                removeItem(item.id);
              }}
            >
              Move to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl flex-shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
