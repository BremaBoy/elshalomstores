"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrackingTimeline } from "@/components/order/TrackingTimeline";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Truck, Package, Calendar, MapPin, Receipt, ExternalLink } from "lucide-react";
import type { DetailedOrder } from "@/types/order";
import { Button } from "@/components/ui/Button";

export const OrderTrackingClient = ({ initialOrder }: { initialOrder: DetailedOrder }) => {
  const [order, setOrder] = useState<DetailedOrder>(initialOrder);

  useEffect(() => {
    // Real-time subscription to order changes
    const channel = supabase
      .channel(`order-updates-${order.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders', 
          filter: `id=eq.${order.id}` 
        },
        async (payload) => {
          console.log('Order Change received!', payload);
          // When order changes, re-fetch full data to get history and shipments
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*)), shipments(*), order_status_history(*)')
            .eq('id', order.id)
            .single();
          
          if (data && !error) {
            setOrder(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  const activeShipment = order.shipments?.[0];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">
                Track Order <span className="text-primary">#{order.id.slice(0, 8)}</span>
              </h1>
              <div className="flex items-center gap-3 text-sm font-bold text-text-secondary uppercase tracking-widest">
                <Calendar className="h-4 w-4" />
                <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'primary'} className="h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {order.status}
               </Badge>
               <Button variant="outline" className="rounded-full h-8 px-4 text-[10px] items-center gap-2">
                  <Receipt className="h-3 w-3" /> Invoice
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: Timeline */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden">
                <CardHeader className="bg-white border-b border-border/50 p-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-text-primary">Expedition Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-10 bg-white">
                  <TrackingTimeline 
                    currentStatus={order.status} 
                    history={order.order_status_history || []} 
                  />
                </CardContent>
              </Card>

              {/* Product List */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden">
                <CardHeader className="bg-white border-b border-border/50 p-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-text-primary">Items Ordered</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {(order.order_items?.length > 0 ? order.order_items : (order.items || [])).map((item: any, idx: number) => {
                      const name = item.products?.name || item.name || "Product";
                      const price = item.unit_price || item.price || 0;
                      const image = item.products?.image_url || item.image || null;
                      
                      return (
                        <div key={item.id || idx} className="flex px-8 py-6 gap-6 hover:bg-slate-50/50 transition-colors">
                          <div className="h-20 w-20 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden relative">
                             {image ? (
                               <img src={image} alt={name} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-slate-300">
                                 <Package className="h-8 w-8" />
                               </div>
                             )}
                          </div>
                          <div className="flex-grow space-y-1">
                            <p className="font-bold text-sm text-text-primary uppercase tracking-tight">{name}</p>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{item.quantity} x ₦{Number(price).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-primary uppercase">₦{(Number(price) * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-8 bg-slate-50/50 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-secondary uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>₦{Number(order.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-text-secondary uppercase tracking-widest">
                      <span>Shipping Cost</span>
                      <span>₦{Number(order.shipping_cost).toLocaleString()}</span>
                    </div>
                    <Separator className="my-4 bg-border/50" />
                    <div className="flex justify-between text-lg font-black text-text-primary uppercase tracking-tighter">
                      <span>Total Amount</span>
                      <span className="text-primary text-2xl">₦{Number(order.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: Shipping & Shipment */}
            <div className="space-y-8">
              {/* Delivery Info */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden">
                <CardHeader className="bg-white border-b border-border/50 p-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-text-primary">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="flex gap-4">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-text-primary uppercase tracking-tight">
                         {order.shipping_details?.firstName} {order.shipping_details?.lastName}
                       </p>
                       <p className="text-xs text-text-secondary font-medium leading-relaxed">
                          {order.shipping_details?.address}, <br />
                          {order.shipping_details?.city}, {order.shipping_details?.state}.
                       </p>
                       <p className="text-[10px] font-bold text-text-secondary">{order.shipping_details?.phone}</p>
                    </div>
                  </div>
                  {order.delivery_instructions && (
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Note to Courier</p>
                      <p className="text-[11px] font-medium text-text-secondary italic">"{order.delivery_instructions}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tracking Info (if exists) */}
              {activeShipment && (
                <Card className="rounded-[2.5rem] bg-black text-white border-none shadow-2xl shadow-primary/20 overflow-hidden">
                  <CardHeader className="border-b border-white/10 p-8">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Shipping Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-white/10 flex items-center justify-center rounded-xl">
                          <Truck className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Courier Service</p>
                          <p className="text-sm font-bold uppercase tracking-tight">{activeShipment.courier}</p>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Tracking Number</p>
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                          <span className="font-mono font-bold text-primary">{activeShipment.tracking_number}</span>
                          <button className="text-[9px] font-black uppercase tracking-widest hover:text-primary transition-colors">Copy</button>
                       </div>
                    </div>

                    {activeShipment.estimated_delivery && (
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/10 flex items-center justify-center rounded-xl">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Est. Delivery</p>
                            <p className="text-sm font-bold uppercase tracking-tight">{new Date(activeShipment.estimated_delivery).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    <Button variant="primary" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                       Track on Courier Website <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
