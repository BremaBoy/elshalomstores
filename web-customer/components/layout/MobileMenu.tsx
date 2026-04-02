"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronRight, User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { name: string; href: string }[];
}

export const MobileMenu = ({ isOpen, onClose, navLinks }: MobileMenuProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-[300px] bg-white z-[70] transition-transform duration-500 ease-in-out transform shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <span className="text-xl font-black text-primary tracking-tighter">ELSHALOM<span className="text-secondary">STORES</span></span>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <X className="h-6 w-6 text-text-secondary" />
            </button>
          </div>

          {/* User Section */}
          <div className="p-6">
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight text-text-primary">Welcome Guest</p>
                <Link href="/auth/login" className="text-xs text-primary font-bold uppercase tracking-widest hover:underline" onClick={onClose}>
                  Login / Register
                </Link>
              </div>
            </div>
          </div>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between px-6 py-4 rounded-xl hover:bg-slate-50 transition-colors group"
                onClick={onClose}
              >
                <span className="font-bold text-sm text-text-secondary group-hover:text-primary transition-colors">{link.name}</span>
                <ChevronRight className="h-4 w-4 text-text-secondary/30 group-hover:text-primary transition-colors" />
              </Link>
            ))}

          {/* Footer */}
          <div className="p-6 border-t border-border bg-slate-50/50">
            <Link href="/cart" onClick={onClose}>
              <Button className="w-full gap-3 h-12 rounded-xl shadow-lg shadow-primary/20">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-bold uppercase tracking-widest text-[10px]">View My Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
