import { NextResponse } from "next/server";

import { decrementOrderStock, getServerErrorMessage, type StoredOrderItem } from "@/lib/checkout-server";
import { authenticateCheckoutRequest } from "@/lib/supabase-admin";

interface IncomingCartItem {
  id?: unknown;
  product_id?: unknown;
  quantity?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await authenticateCheckoutRequest(request);
    const body = asRecord(await request.json());
    if (!body) throw new Error("Invalid checkout request.");

    const incomingItems = Array.isArray(body.items) ? body.items as IncomingCartItem[] : [];
    const paymentMethod = typeof body.payment_method === "string" ? body.payment_method : "";
    const shippingDetails = asRecord(body.shipping_details);
    const shippingCost = Number(body.shipping_cost || 0);

    if (!incomingItems.length) throw new Error("Your cart is empty.");
    if (!["cod", "paystack", "flutterwave"].includes(paymentMethod)) {
      throw new Error("Please choose a valid payment method.");
    }
    if (paymentMethod === "paystack" && !process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack is not configured on the customer deployment.");
    }
    if (paymentMethod === "flutterwave" && !process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new Error("Flutterwave is not configured on the customer deployment.");
    }
    if (paymentMethod !== "cod") {
      const { error: paymentsTableError } = await supabase.from("payments").select("id").limit(1);
      if (paymentsTableError) {
        throw new Error("Payment tables are not installed. Run backend/payments_schema.sql in Supabase.");
      }
    }
    if (!shippingDetails?.address || !shippingDetails.city || !shippingDetails.state) {
      throw new Error("Please choose a complete delivery address.");
    }

    const requestedItems = incomingItems.map((item) => {
      const id = typeof item.product_id === "string"
        ? item.product_id
        : typeof item.id === "string" ? item.id : "";
      const quantity = Number(item.quantity);
      return { id, quantity };
    });

    if (requestedItems.some((item) => !item.id || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      throw new Error("One or more cart items are invalid.");
    }

    const productIds = [...new Set(requestedItems.map((item) => item.id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, image, price, discount_price, stock, status")
      .in("id", productIds);

    if (productsError) throw new Error(productsError.message);
    if (!products || products.length !== productIds.length) {
      throw new Error("One or more products are no longer available.");
    }

    const storedItems: StoredOrderItem[] = requestedItems.map((requested) => {
      const product = products.find((candidate) => candidate.id === requested.id);
      if (!product || product.status !== "active") {
        throw new Error("One or more products are no longer available.");
      }
      if (Number(product.stock || 0) < requested.quantity) {
        throw new Error(`${product.name} does not have enough stock for this order.`);
      }

      const unitPrice = Number(product.discount_price ?? product.price);
      return {
        id: product.id,
        product_id: product.id,
        name: product.name,
        image: product.image || "",
        quantity: requested.quantity,
        unit_price: unitPrice,
        price: unitPrice,
        subtotal: unitPrice * requested.quantity,
      };
    });

    const subtotal = storedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAmount = subtotal + (Number.isFinite(shippingCost) ? Math.max(0, shippingCost) : 0);

    const orderPayload = {
      user_id: user.id,
      items: storedItems,
      total_amount: totalAmount,
      shipping_details: shippingDetails,
      payment_method: paymentMethod,
      payment_status: "Pending",
      status: "Pending",
    };

    let { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    // Older installations may not yet have the payment_status column. Cash
    // on delivery can still be recorded while the payment migration is pending.
    if (orderError?.message.includes("payment_status") && paymentMethod === "cod") {
      const legacyPayload = {
        user_id: orderPayload.user_id,
        items: orderPayload.items,
        total_amount: orderPayload.total_amount,
        shipping_details: orderPayload.shipping_details,
        payment_method: orderPayload.payment_method,
        status: orderPayload.status,
      };
      const retry = await supabase.from("orders").insert(legacyPayload).select().single();
      order = retry.data;
      orderError = retry.error;
    }

    if (orderError || !order) throw new Error(orderError?.message || "The order could not be created.");

    const relationalItems = storedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    }));
    const { error: orderItemsError } = await supabase.from("order_items").insert(relationalItems);
    if (orderItemsError) {
      console.warn("Order item rows were not created; JSON order items remain available.", orderItemsError.message);
    }

    if (paymentMethod === "cod") {
      await decrementOrderStock(supabase, storedItems);
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    const message = getServerErrorMessage(error);
    const status = message.includes("session expired") ? 401 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
