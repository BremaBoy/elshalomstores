import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

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
  gateway: "paystack" | "flutterwave";
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
  }

  return { newlyFinalized };
}

export function makePaymentReference(prefix: "PAY" | "FLW") {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "")}`;
}
