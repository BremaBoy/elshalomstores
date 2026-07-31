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

export function getServerErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected checkout error occurred.";
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

export function makePaymentReference(prefix: "PAY" | "FLW") {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "")}`;
}
