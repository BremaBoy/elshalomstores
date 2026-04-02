"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { ProductPrice } from "@/components/product/ProductPrice";
import { useCartStore } from "@/store/cartStore";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20">
        <Breadcrumbs items={[{ label: "Shopping Cart" }]} />
        
        <section className="py-16">
          <Container>
            <SectionTitle 
              title="Your Shopping Bag" 
              subtitle={items.length > 0 ? `You have ${items.length} items in your cart` : "Your cart is currently empty"}
            />

            {items.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-shadow group">
                      <div className="relative h-32 w-full sm:w-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/product/${item.id}`} className="text-xl font-extrabold hover:text-primary transition-colors uppercase tracking-tight">
                              {item.name}
                            </Link>
                            <p className="text-sm text-slate-500 font-medium">{item.category}</p>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <ProductPrice price={item.price * item.quantity} discountPrice={item.discountPrice ? item.discountPrice * item.quantity : undefined} size="lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl sticky top-32">
                    <h3 className="text-2xl font-bold mb-8 uppercase tracking-widest text-primary">Order Summary</h3>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center text-slate-400 font-medium">
                        <span>Subtotal</span>
                        <span className="text-white">₦{getTotalPrice().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 font-medium">
                        <span>Shipping</span>
                        <span className="text-emerald-400 font-bold uppercase text-xs tracking-widest">Free</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 font-medium">
                        <span>Tax</span>
                        <span className="text-white">₦0.00</span>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-lg font-bold">Total</span>
                          <span className="text-3xl font-extrabold text-primary">
                            ₦{getTotalPrice().toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">VAT included where applicable</p>
                      </div>

                      <div className="pt-4 space-y-4">
                        <Link href="/checkout">
                          <Button className="w-full h-14 text-xl rounded-2xl font-extrabold uppercase tracking-widest group">
                            Checkout
                            <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                        <Link href="/shop" className="block text-center text-sm font-bold text-slate-400 hover:text-white transition-colors">
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-[64px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="h-32 w-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl mb-8">
                  <ShoppingBag className="h-16 w-16 text-slate-200" />
                </div>
                <h2 className="text-3xl font-extrabold mb-4 uppercase tracking-tighter">Your bag is empty</h2>
                <p className="text-slate-500 mb-10 max-w-sm text-center">
                  Looks like you haven't made your choice yet. Browse our shop to find something you'll love!
                </p>
                <Link href="/shop">
                  <Button className="h-14 px-10 text-lg rounded-full font-bold uppercase tracking-widest">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
          </Container>
        </section>
      </div>
      <Footer />
    </main>
  );
}
