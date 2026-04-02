import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { createServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login?redirect=/profile");
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900/30">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl text-center">
                <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
                <p className="text-sm text-slate-500 font-medium mb-6">{user.email}</p>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Member Since</p>
                  <p className="text-xs font-bold">{joinedDate}</p>
                </div>
              </div>

              <nav className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden">
                {[
                  { label: "My Profile", icon: User, active: true },
                  { label: "Orders", icon: Package },
                  { label: "Wishlist", icon: Heart },
                  { label: "Addresses", icon: MapPin },
                  { label: "Settings", icon: Settings },
                ].map((item) => (
                  <button 
                    key={item.label}
                    className={`w-full flex items-center justify-between px-6 py-4 transition-all ${item.active ? "bg-primary/5 text-primary border-l-4 border-primary" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-30" />
                  </button>
                ))}
                <button className="w-full flex items-center gap-3 px-6 py-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all mt-4 border-t border-slate-50 dark:border-slate-800">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">Log Out</span>
                </button>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Recent Orders</h3>
                    <Button variant="ghost" className="text-primary font-bold uppercase tracking-widest text-xs">View All</Button>
                </div>
                
                <div className="space-y-6">
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl group hover:shadow-md transition-all gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
                            <Package className="h-8 w-8 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-lg font-extrabold tracking-tight uppercase">{order.id.slice(0, 8)}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                              <Clock className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                              order.status === 'Delivered' || order.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
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
                      <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-slate-300" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No orders yet</h4>
                      <p className="text-slate-500 text-sm mt-2">Start shopping to see your orders here!</p>
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
                    <p className="text-indigo-100 font-medium">Manage your delivery locations for faster checkout.</p>
                    <Button className="bg-white text-primary hover:bg-indigo-50 font-bold rounded-2xl uppercase tracking-widest">Manage Addresses</Button>
                </div>
                <div className="p-10 rounded-[48px] bg-slate-900 text-white shadow-2xl space-y-6">
                    <h4 className="text-2xl font-extrabold uppercase tracking-tight">Security Settings</h4>
                    <p className="text-slate-400 font-medium">Update your password and enable two-factor authentication.</p>
                    <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 font-bold rounded-2xl uppercase tracking-widest">Privacy Settings</Button>
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
