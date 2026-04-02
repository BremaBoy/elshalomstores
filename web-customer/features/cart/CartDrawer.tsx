"use client";

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white z-[110] shadow-2xl transition-transform duration-500 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-border bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">My Cart</h2>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{items.length} Unique Items</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-border transition-all shadow-sm group">
              <X className="h-6 w-6 text-text-secondary group-hover:text-primary transition-colors" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-grow overflow-y-auto p-8">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-24 w-24 bg-card rounded-full flex items-center justify-center animate-pulse">
                  <ShoppingBag className="h-10 w-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-tight">Your cart is empty</h3>
                  <p className="text-sm text-text-secondary font-medium">Start exploring our premium collection.</p>
                </div>
                <Button onClick={onClose} variant="primary" className="rounded-full px-10 h-12 shadow-lg shadow-primary/20">
                  Explore Products
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-5 group items-center">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-card border border-border flex-shrink-0 transition-transform group-hover:scale-105">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-black text-text-primary uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/50">₦{(item.discountPrice || item.price).toLocaleString()} / UNIT</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-card border border-border rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-white rounded-lg text-text-secondary hover:text-primary transition-all shadow-sm"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-4 text-xs font-black w-10 text-center text-text-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-white rounded-lg text-text-secondary hover:text-primary transition-all shadow-sm"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-lg font-black text-primary tracking-tighter">
                          ₦{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-8 border-t border-border bg-card space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-text-secondary">
                  <span>Subtotal</span>
                  <span className="tracking-tight text-sm text-text-primary">₦{getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black uppercase tracking-tighter">Estimated Total</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">₦{getTotalPrice().toLocaleString()}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-2">
                <Link href="/checkout" onClick={onClose} className="w-full">
                  <Button className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                    Secure Checkout
                  </Button>
                </Link>
                <Link href="/cart" onClick={onClose} className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
                  View Full Cart Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
