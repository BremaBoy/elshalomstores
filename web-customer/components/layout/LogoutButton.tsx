"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-6 py-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all mt-4 border-t border-slate-50 dark:border-slate-800"
    >
      <LogOut className="h-5 w-5" />
      <span className="text-sm font-bold uppercase tracking-wider">Log Out</span>
    </button>
  );
};
