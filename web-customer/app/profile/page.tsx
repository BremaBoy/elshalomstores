import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { User, Package, Heart, MapPin, Settings, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { createServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/layout/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login?redirect=/profile");
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="bg-card p-8 rounded-[40px] border border-border shadow-xl text-center">
                <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
                <p className="text-sm text-text-secondary font-medium mb-6">{user.email}</p>
                <div className="pt-6 border-t border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Member Since</p>
                  <p className="text-xs font-bold">{joinedDate}</p>
                </div>
              </div>

              <nav className="bg-card rounded-[32px] border border-border shadow-lg overflow-hidden">
                {[
                  { label: "My Profile", icon: User, href: "/profile" },
                  { label: "Orders", icon: Package, href: "/account/orders" },
                  { label: "Wishlist", icon: Heart, href: "/account/wishlist" },
                  { label: "Addresses", icon: MapPin, href: "/account/addresses" },
                  { label: "Settings", icon: Settings, href: "/account/settings" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className={`w-full flex items-center justify-between px-6 py-4 transition-all ${
                      item.href === "/profile" ? "bg-primary/10 text-primary border-l-4 border-primary" : "text-text-secondary hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-30" />
                  </Link>
                ))}
                <LogoutButton />
              </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              <div className="bg-card p-8 md:p-12 rounded-[48px] border border-border shadow-xl">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Recent Orders</h3>
                    <Link href="/account/orders">
                      <Button variant="ghost" className="text-primary font-bold uppercase tracking-widest text-xs">View All</Button>
                    </Link>
                </div>
                
                <div className="space-y-6">
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-blue-soft/40 rounded-3xl border border-primary/10 group hover:shadow-md transition-all gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-card rounded-2xl flex items-center justify-center shadow-sm">
                            <Package className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-extrabold tracking-tight uppercase">{order.id.slice(0, 8)}</p>
                            <div className="flex items-center gap-2 text-xs text-text-secondary font-bold uppercase tracking-widest">
                              <Clock className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                              order.status === 'Delivered' || order.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">Total</p>
                            <p className="text-lg font-extrabold text-primary">₦{order.total_amount?.toLocaleString()}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="h-20 w-20 bg-bg rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-text-secondary/40" />
                      </div>
                      <h4 className="text-lg font-bold text-text-secondary uppercase tracking-widest">No orders yet</h4>
                      <p className="text-text-secondary text-sm mt-2">Start shopping to see your orders here!</p>
                      <Link href="/shop" className="mt-8 inline-block">
                        <Button className="rounded-full px-8">Browse Shop</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions / Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 rounded-[48px] bg-primary text-white shadow-2xl shadow-primary/20 space-y-6">
                    <h4 className="text-2xl font-extrabold uppercase tracking-tight">Shipping Addresses</h4>
                    <p className="text-white/75 font-medium">Manage your delivery locations for faster checkout.</p>
                    <Link href="/account/addresses">
                      <Button className="bg-gold-soft text-text-primary hover:bg-white font-bold rounded-2xl uppercase tracking-widest">Manage Addresses</Button>
                    </Link>
                </div>
                <div className="p-10 rounded-[48px] bg-lilac text-text-primary border border-border shadow-2xl space-y-6">
                    <h4 className="text-2xl font-extrabold uppercase tracking-tight">Security Settings</h4>
                    <p className="text-text-secondary font-medium">Update your password and enable two-factor authentication.</p>
                    <Link href="/account/settings">
                      <Button variant="outline" className="border-primary/25 text-primary hover:bg-blue-soft font-bold rounded-2xl uppercase tracking-widest">Privacy Settings</Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
