import { createServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { WishlistClient } from "@/components/account/WishlistClient";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const supabase = createServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?redirect=/account/wishlist");
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl min-h-[600px]">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          My <span className="text-primary">Wishlist</span>
        </h3>
      </div>
      <WishlistClient />
    </div>
  );
}
