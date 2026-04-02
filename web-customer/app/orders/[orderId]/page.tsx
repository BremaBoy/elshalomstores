import { createServer } from "@/lib/supabase-server";
import { OrderTrackingClient } from "@/components/order/OrderTrackingClient";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface OrderPageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderTrackingPage({ params }: OrderPageProps) {
  const { orderId } = params;
  const supabase = createServer();

  // Fetch order data with all related info for the tracking experience
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      ),
      shipments (*),
      order_status_history (*)
    `)
    .eq('id', orderId)
    .order('timestamp', { foreignTable: 'order_status_history', ascending: false })
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        <OrderTrackingClient initialOrder={order as any} />
      </main>
      <Footer />
    </>
  );
}
