import { NextResponse } from "next/server";

import { decrementOrderStock, getServerErrorMessage, type StoredOrderItem } from "@/lib/checkout-server";
import { authenticateCheckoutRequest } from "@/lib/supabase-admin";
import { arrangeTopshipPickup, getAuthoritativeTopshipRate, verifyTopshipQuote, type ShippingAddress } from "@/lib/topship";

interface IncomingCartItem {
  id?: unknown;
  product_id?: unknown;
  quantity?: unknown;
}

async function saveTopshipShipment(supabase: Awaited<ReturnType<typeof authenticateCheckoutRequest>>["supabase"], orderId: string, shipment: Record<string, unknown>) {
  const extras = asRecord(shipment.extras);
  const rate = asRecord(shipment.rate);
  const payload = {
    order_id: orderId,
    provider: "topship",
    provider_shipment_id: typeof shipment.shipment_id === "string" ? shipment.shipment_id : typeof shipment.id === "string" ? shipment.id : null,
    courier: typeof rate?.carrier_name === "string" ? rate.carrier_name : "Topship",
    tracking_number: typeof extras?.tracking_number === "string" ? extras.tracking_number : null,
    tracking_url: typeof extras?.tracking_url === "string" ? extras.tracking_url : null,
    shipping_method: typeof rate?.carrier_rate_description === "string" ? rate.carrier_rate_description : null,
    estimated_delivery: typeof rate?.delivery_date === "string" ? rate.delivery_date : null,
    status: typeof shipment.status === "string" ? shipment.status : "Confirmed",
    provider_payload: shipment,
  };
  const { error } = await supabase.from("shipments").insert(payload);
  if (error) {
    console.warn("Topship shipment could not be saved:", error.message);
    return;
  }
  const { data: order } = await supabase.from("orders").select("shipping_details").eq("id", orderId).maybeSingle();
  const shippingDetails = asRecord(order?.shipping_details) || {};
  const topship = asRecord(shippingDetails.topship) || {};
  await supabase.from("orders").update({
    shipping_details: {
      ...shippingDetails,
      topship: {
        ...topship,
        booking_status: "booked",
        booking_error: null,
        booked_at: new Date().toISOString(),
      },
    },
  }).eq("id", orderId);
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
    const shippingQuote = typeof body.shipping_quote === "string" ? body.shipping_quote : "";

    if (!incomingItems.length) throw new Error("Your cart is empty.");
    if (!["cod", "paystack"].includes(paymentMethod)) {
      throw new Error("Please choose a valid payment method.");
    }
    if (paymentMethod === "paystack" && !process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack is not configured on the customer deployment.");
    }
    if (paymentMethod !== "cod") {
      const { error: paymentsTableError } = await supabase.from("payments").select("id").limit(1);
      if (paymentsTableError) {
        throw new Error("Payment tables are not installed. Run backend/payments_schema.sql in Supabase.");
      }
    }
    if (!shippingDetails?.address || !shippingDetails.addressLine2 || !shippingDetails.city || !shippingDetails.state || !shippingDetails.firstName || !shippingDetails.lastName || !shippingDetails.email || !shippingDetails.phone) {
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

      const regularPrice = Number(product.price);
      const discountPrice = Number(product.discount_price);
      const unitPrice =
        Number.isFinite(discountPrice) && discountPrice > 0
          ? discountPrice
          : regularPrice;
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw new Error(`${product.name} does not have a valid price.`);
      }
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
    const address: ShippingAddress = {
      firstName: String(shippingDetails.firstName),
      lastName: String(shippingDetails.lastName),
      email: String(shippingDetails.email),
      phone: String(shippingDetails.phone),
      address: String(shippingDetails.address),
      addressLine2: String(shippingDetails.addressLine2),
      city: String(shippingDetails.city),
      state: String(shippingDetails.state),
    };
    const signedQuote = verifyTopshipQuote(shippingQuote, user.id, address, storedItems);
    const currentRate = await getAuthoritativeTopshipRate(signedQuote.rateId);
    const shippingCost = currentRate.amount;
    const totalAmount = Math.round(
      (subtotal + shippingCost + Number.EPSILON) * 100,
    ) / 100;
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new Error("Order total must be greater than zero.");
    }
    if (paymentMethod === "paystack" && totalAmount < 50) {
      throw new Error("Paystack orders must total at least ₦50.");
    }

    const orderPayload = {
      user_id: user.id,
      items: storedItems,
      subtotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      shipping_details: {
        ...shippingDetails,
        topship: {
          rate_id: currentRate.rate_id,
          carrier: currentRate.carrier_name,
          service: currentRate.carrier_rate_description,
          delivery_time: currentRate.delivery_time,
          delivery_date: currentRate.delivery_date,
        },
      },
      payment_method: paymentMethod,
      // Cash-on-delivery is dispatched immediately. Payment stays pending
      // until collection, but it must not hold up the shipment workflow.
      payment_status: "Pending",
      status: paymentMethod === "cod" ? "Processing" : "Pending",
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
      try {
        const shipment = await arrangeTopshipPickup(currentRate.rate_id);
        await saveTopshipShipment(supabase, order.id, shipment);
      } catch (shipmentError) {
        // The order remains valid if the courier wallet or carrier is briefly
        // unavailable; staff can arrange it from the saved rate details.
        const shippingDetails = asRecord(order.shipping_details) || {};
        const topship = asRecord(shippingDetails.topship) || {};
        await supabase.from("orders").update({
          shipping_details: {
            ...shippingDetails,
            topship: {
              ...topship,
              booking_status: "failed",
              booking_error: getServerErrorMessage(shipmentError),
            },
          },
        }).eq("id", order.id);
        console.error("Topship COD booking failed:", getServerErrorMessage(shipmentError));
      }
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    const message = getServerErrorMessage(error);
    const status = message.includes("session expired") ? 401 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
