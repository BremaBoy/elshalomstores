"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { NotificationBell } from "./NotificationBell";

import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const hasSolidBackground = isScrolled || pathname !== "/";
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        hasSolidBackground
          ? "bg-bg/92 backdrop-blur-xl border-b border-border py-2"
          : "bg-transparent py-4 text-white"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between gap-6">
          {/* Mobile Menu Toggle */}
          <button
            className={`lg:hidden p-2 hover:text-primary transition-colors ${hasSolidBackground ? "text-text-secondary" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex-shrink-0 group">
            <span className={`text-xl md:text-2xl font-black tracking-[-.06em] transition-transform group-hover:scale-105 inline-block uppercase ${hasSolidBackground ? "text-text-primary" : "text-white"}`}>
              ELSHALOM<span className="text-primary">/</span>STORES
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-grow max-w-xl relative group">
            <input
              type="text"
              placeholder="Search for premium products..."
              className={`w-full border rounded-full py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 ${hasSolidBackground ? "bg-card border-border text-text-primary placeholder:text-text-secondary/60" : "bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md"}`}
            />
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 group-focus-within:text-primary transition-colors ${hasSolidBackground ? "text-text-secondary" : "text-white/70"}`} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-6 mr-4 border-r border-border dark:border-slate-700 pr-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] uppercase tracking-[.14em] font-black transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : hasSolidBackground ? "text-text-secondary" : "text-white/80"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle className={hasSolidBackground ? "" : "!text-white hover:!text-primary"} />

              {mounted && user ? (
                <div className="flex items-center gap-1 md:gap-2">
                  <NotificationBell userId={user.id} />
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className={hasSolidBackground ? "text-text-secondary hover:text-primary" : "text-white hover:text-primary"}>
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              ) : mounted ? (
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" className={`${hasSolidBackground ? "text-text-secondary" : "text-white"} hover:text-primary font-bold uppercase tracking-widest text-[10px]`}>
                    Sign In <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              ) : null}

              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative ${hasSolidBackground ? "text-text-secondary" : "text-white"} hover:text-primary`}
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
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
