"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { NotificationBell } from "./NotificationBell";

import { supabase } from "@/lib/supabase";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/categories" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-border py-2"
          : "bg-white py-4"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between gap-6">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-text-secondary hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex-shrink-0 group">
            <span className="text-2xl font-extrabold text-primary tracking-tighter transition-transform group-hover:scale-105 inline-block uppercase">
              ELSHALOM<span className="text-secondary">STORES</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-grow max-w-xl relative group">
            <input
              type="text"
              placeholder="Search for premium products..."
              className="w-full bg-card border-border hover:border-primary/30 border rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-text-secondary/50"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-6 mr-4 border-r border-border pr-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors hover:text-primary ${
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
                    <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              ) : mounted ? (
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-text-secondary hover:text-primary font-bold uppercase tracking-widest text-[10px]">
                    Sign In
                  </Button>
                </Link>
              ) : null}

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-text-secondary hover:text-primary"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
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
