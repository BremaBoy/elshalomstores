"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { NotificationBell } from "./NotificationBell";

import { supabase } from "@/lib/supabase";
import { InstantSearch } from "@/components/search/InstantSearch";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b border-primary/15 bg-lilac/90 py-2 text-text-primary shadow-[0_10px_35px_rgba(118,81,143,0.14)] backdrop-blur-xl"
    >
      <Container>
        <div className="flex items-center justify-between gap-6">
          {/* Mobile Menu Toggle */}
          <button
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-blue-soft hover:text-primary lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex-shrink-0 group">
            <span className="inline-block text-xl font-black uppercase tracking-[-.06em] text-text-primary transition-transform group-hover:scale-105 md:text-2xl">
              ELSHALOM<span className="text-gold">/</span>STORES
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <InstantSearch transparent={false} />

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Navigation */}
            <nav className="mr-4 hidden items-center gap-6 border-r border-border pr-6 xl:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] uppercase tracking-[.14em] font-black transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-text-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 md:gap-2">
              {mounted && user ? (
                <div className="flex items-center gap-1 md:gap-2">
                  <NotificationBell userId={user.id} />
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className="text-text-secondary hover:bg-blue-soft hover:text-primary">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              ) : mounted ? (
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:bg-blue-soft hover:text-primary">
                    Sign In <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              ) : null}

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-text-secondary hover:bg-blue-soft hover:text-primary"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-bg bg-primary text-[10px] font-black text-white">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Menu Modal */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </header>
  );
};
