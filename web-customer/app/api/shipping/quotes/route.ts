import { NextResponse } from "next/server";

import { getServerErrorMessage, type StoredOrderItem } from "@/lib/checkout-server";
import { authenticateCheckoutRequest } from "@/lib/supabase-admin";
import { getTopshipQuotes, type ShippingAddress } from "@/lib/topship";

interface CartItem { id?: unknown; product_id?: unknown; quantity?: unknown; }

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await authenticateCheckoutRequest(request);
    const body = asRecord(await request.json());
    const address = asRecord(body?.shipping_details) as ShippingAddress | null;
    const incoming = Array.isArray(body?.items) ? body.items as CartItem[] : [];
    if (!address?.firstName || !address.lastName || !address.email || !address.phone || !address.address || !address.addressLine2 || !address.city || !address.state) {
      throw new Error("Enter a complete delivery address to get shipping options.");
    }
    const requested = incoming.map((item) => ({
      id: typeof item.product_id === "string" ? item.product_id : typeof item.id === "string" ? item.id : "",
      quantity: Number(item.quantity),
    }));
    if (!requested.length || requested.some((item) => !item.id || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      throw new Error("Your cart contains an invalid item.");
    }
    const ids = [...new Set(requested.map((item) => item.id))];
    const { data: products, error } = await supabase.from("products").select("id, name, price, discount_price, status").in("id", ids);
    if (error || !products || products.length !== ids.length) throw new Error("One or more products are no longer available.");
    const items: StoredOrderItem[] = requested.map((requestedItem) => {
      const product = products.find((candidate) => candidate.id === requestedItem.id);
      const price = Number(product?.discount_price) > 0 ? Number(product?.discount_price) : Number(product?.price);
      if (!product || product.status !== "active" || !Number.isFinite(price) || price <= 0) throw new Error("One or more products are no longer available.");
      return { id: product.id, product_id: product.id, name: product.name, image: "", quantity: requestedItem.quantity, unit_price: price, price, subtotal: price * requestedItem.quantity };
    });
    const rates = await getTopshipQuotes(address, items, user.id);
    if (!rates.length) throw new Error("Topship could not find a delivery option for this address.");
    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    const message = getServerErrorMessage(error);
    return NextResponse.json({ success: false, message }, { status: message.includes("session expired") ? 401 : message.includes("not configured") ? 503 : 400 });
  }
}
