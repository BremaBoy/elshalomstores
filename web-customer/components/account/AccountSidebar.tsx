"use client";

import { User, Package, Bell, MapPin, Settings, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const AccountSidebar = ({ user }: { user: any }) => {
  const pathname = usePathname();

  const navItems = [
    { label: "My Profile", icon: User, href: "/profile" },
    { label: "Orders", icon: Package, href: "/account/orders" },
    { label: "Notifications", icon: Bell, href: "/account/notifications" },
    { label: "Wishlist", icon: MapPin, href: "/wishlist" }, // Reuse existing or placeholder
    { label: "Settings", icon: Settings, href: "/account/settings" },
  ];

  return (
    <aside className="space-y-4">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
          <User className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-xl font-extrabold uppercase tracking-tight">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </h2>
        <p className="text-sm text-slate-500 font-medium mb-6">{user.email}</p>
      </div>

      <nav className="bg-white rounded-[32px] border border-slate-100 shadow-lg overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href}
              className={cn(
                "w-full flex items-center justify-between px-6 py-4 transition-all group",
                isActive 
                  ? "bg-primary/5 text-primary border-l-4 border-primary" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight className={cn("h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity", isActive && "opacity-100")} />
            </Link>
          );
        })}
        <button className="w-full flex items-center gap-3 px-6 py-6 text-red-500 hover:bg-red-50 transition-all mt-4 border-t border-slate-50">
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">Log Out</span>
        </button>
      </nav>
    </aside>
  );
};
