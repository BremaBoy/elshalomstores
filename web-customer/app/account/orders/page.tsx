import { createServer } from "@/lib/supabase-server";
import { Package, Clock, ChevronRight, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function OrdersPage() {
  const supabase = createServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl min-h-[600px]">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
        <h3 className="text-2xl font-black uppercase tracking-tight text-text-primary">My <span className="text-primary">Orders</span></h3>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{orders?.length || 0} Orders found</p>
      </div>

      <div className="space-y-6">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl group hover:shadow-md transition-all gap-6 border border-transparent hover:border-primary/10">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <Package className="h-8 w-8 text-primary/40" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-md font-black tracking-tight uppercase text-text-primary">Order #{order.id.slice(0, 8)}</p>
                    <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      order.status === 'Delivered' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : order.status === 'Cancelled'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-primary/5 text-primary border-primary/10'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(order.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{order.items?.length || 0} Items</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-8 md:gap-12">
                <div className="text-right">
                  <p className="text-[10px] text-text-secondary/50 font-black uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-xl font-black text-primary">₦{Number(order.total_amount).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" className="rounded-full h-10 px-6 text-[10px] items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                      <Truck className="h-3.5 w-3.5" /> Track Order
                    </Button>
                  </Link>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 group-hover:translate-x-1 transition-transform bg-white shadow-sm rounded-full">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-slate-200" />
            </div>
            <h4 className="text-lg font-black text-text-secondary uppercase tracking-widest">No orders yet</h4>
            <p className="text-slate-500 text-sm mt-2 font-medium">Your shopping history will appear here once you place an order.</p>
            <Link href="/shop" className="mt-8 inline-block">
              <Button className="rounded-full px-10 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">Explore Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
