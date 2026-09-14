import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { arrangeTopshipPickup } from "@/lib/topship";

export interface StoredOrderItem {
  id: string;
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  unit_price: number;
  price: number;
  subtotal: number;
}

interface PaymentToFinalize {
  id: string;
  status?: string | null;
}

interface OrderToFinalize {
  id: string;
  user_id: string;
  items: unknown;
  shipping_details?: unknown;
}

export function getServerErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected checkout error occurred.";
}

export function readStoredItems(value: unknown): StoredOrderItem[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is StoredOrderItem => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<StoredOrderItem>;
    return typeof candidate.product_id === "string"
      && typeof candidate.quantity === "number"
      && typeof candidate.unit_price === "number";
  });
}

export async function decrementOrderStock(
  supabase: SupabaseClient,
  items: StoredOrderItem[],
) {
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (!product || typeof product.stock !== "number") continue;

    await supabase
      .from("products")
      .update({ stock: Math.max(0, product.stock - item.quantity) })
      .eq("id", item.product_id);
  }
}

async function arrangePaidOrderShipment(supabase: SupabaseClient, order: OrderToFinalize) {
  if (!order.shipping_details || typeof order.shipping_details !== "object") return;
  const topship = (order.shipping_details as Record<string, unknown>).topship;
  if (!topship || typeof topship !== "object") return;
  const details = topship as Record<string, unknown>;
  const rateId = typeof details.rate_id === "string" ? details.rate_id : "";
  if (!rateId) return;

  const { data: existing } = await supabase
    .from("shipments")
    .select("id")
    .eq("order_id", order.id)
    .eq("provider", "topship")
    .limit(1)
    .maybeSingle();
  if (existing) return;

  const shipment = await arrangeTopshipPickup(rateId);
  const extras = shipment.extras && typeof shipment.extras === "object" ? shipment.extras as Record<string, unknown> : {};
  const { error } = await supabase.from("shipments").insert({
    order_id: order.id,
    provider: "topship",
    provider_shipment_id: typeof shipment.shipment_id === "string" ? shipment.shipment_id : typeof shipment.id === "string" ? shipment.id : null,
    courier: typeof details.carrier === "string" ? details.carrier : "Topship",
    tracking_number: typeof extras.tracking_number === "string" ? extras.tracking_number : null,
    tracking_url: typeof extras.tracking_url === "string" ? extras.tracking_url : null,
    shipping_method: typeof details.service === "string" ? details.service : null,
    estimated_delivery: typeof details.delivery_date === "string" ? details.delivery_date : null,
    status: typeof shipment.status === "string" ? shipment.status : "Confirmed",
    provider_payload: shipment,
  });
  if (error) throw new Error(error.message);
}

export async function finalizeSuccessfulPayment({
  supabase,
  payment,
  order,
  reference,
  gateway,
  transactionId,
  eventType,
  eventPayload,
}: {
  supabase: SupabaseClient;
  payment: PaymentToFinalize;
  order: OrderToFinalize;
  reference: string;
  gateway: "paystack";
  transactionId: string;
  eventType: string;
  eventPayload?: Record<string, unknown>;
}) {
  let newlyFinalized = false;

  if (payment.status !== "successful") {
    // The conditional update makes callback and webhook processing idempotent.
    // Only the request that changes the payment from a non-success state is
    // allowed to decrement stock or clear the customer's cart.
    const { data: updatedPayment, error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "successful",
        paid_at: new Date().toISOString(),
        transaction_id: transactionId,
      })
      .eq("id", payment.id)
      .neq("status", "successful")
      .select("id")
      .maybeSingle();

    if (paymentUpdateError) throw new Error(paymentUpdateError.message);
    newlyFinalized = Boolean(updatedPayment);
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({ payment_status: "Paid", status: "Processing" })
    .eq("id", order.id);
  if (orderUpdateError) throw new Error(orderUpdateError.message);

  if (newlyFinalized) {
    await decrementOrderStock(supabase, readStoredItems(order.items));
    await supabase.from("cart_items").delete().eq("user_id", order.user_id);
    await supabase.from("payment_logs").insert({
      payment_reference: reference,
      event_type: eventType,
      gateway,
      payload: {
        order_id: order.id,
        transaction_id: transactionId,
        ...eventPayload,
      },
    });
    try {
      await arrangePaidOrderShipment(supabase, order);
    } catch (shipmentError) {
      // Payment remains successful if the shipping provider is temporarily
      // unavailable. The selected rate is retained on the order for staff.
      console.error("Topship paid-order booking failed:", getServerErrorMessage(shipmentError));
    }
  }

  return { newlyFinalized };
}

export function makePaymentReference(prefix: "PAY") {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "")}`;
}
