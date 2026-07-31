import { NextResponse } from "next/server";

import { getServerErrorMessage, makePaymentReference } from "@/lib/checkout-server";
import { authenticateCheckoutRequest } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ gateway: string }>;
}

function providerError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as Record<string, unknown>).message;
  return typeof message === "string" ? message : fallback;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { gateway } = await context.params;
    if (gateway !== "paystack" && gateway !== "flutterwave") {
      throw new Error("Unsupported payment gateway.");
    }

    const { supabase, user } = await authenticateCheckoutRequest(request);
    const body = await request.json() as { order_id?: unknown };
    const orderId = typeof body.order_id === "string" ? body.order_id : "";
    if (!orderId) throw new Error("Order ID is required.");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) throw new Error("Order not found.");
    if (["paid", "successful"].includes(String(order.payment_status || "").toLowerCase())) {
      throw new Error("This order has already been paid.");
    }

    const { error: paymentsTableError } = await supabase.from("payments").select("id").limit(1);
    if (paymentsTableError) {
      throw new Error("Payment tables are not installed. Run backend/payments_schema.sql in Supabase.");
    }

    const callbackOrigin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const email = user.email;
    if (!email) throw new Error("A customer email address is required for online payment.");

    const reference = makePaymentReference(gateway === "paystack" ? "PAY" : "FLW");
    let authorizationUrl = "";

    if (gateway === "paystack") {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) throw new Error("Paystack is not configured on the customer deployment.");

      const providerResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: String(Math.round(Number(order.total_amount) * 100)),
          currency: "NGN",
          reference,
          callback_url: `${callbackOrigin}/checkout/verify?gateway=paystack`,
          metadata: JSON.stringify({ order_id: order.id }),
        }),
        cache: "no-store",
      });
      const providerPayload = await providerResponse.json() as {
        status?: boolean;
        message?: string;
        data?: { authorization_url?: string };
      };

      if (!providerResponse.ok || !providerPayload.status || !providerPayload.data?.authorization_url) {
        throw new Error(`Paystack initialization failed: ${providerError(providerPayload, providerResponse.statusText)}`);
      }
      authorizationUrl = providerPayload.data.authorization_url;
    } else {
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secretKey) throw new Error("Flutterwave is not configured on the customer deployment.");

      const shipping = order.shipping_details as Record<string, unknown> | null;
      const providerResponse = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount: Number(order.total_amount),
          currency: "NGN",
          redirect_url: `${callbackOrigin}/checkout/verify?gateway=flutterwave`,
          customer: {
            email,
            name: [shipping?.firstName, shipping?.lastName].filter(Boolean).join(" "),
            phonenumber: typeof shipping?.phone === "string" ? shipping.phone : "",
          },
          meta: { order_id: order.id },
          customizations: {
            title: "Elshalom Stores",
            description: `Payment for order ${order.id}`,
          },
        }),
        cache: "no-store",
      });
      const providerPayload = await providerResponse.json() as {
        status?: string;
        message?: string;
        data?: { link?: string };
      };

      if (!providerResponse.ok || providerPayload.status !== "success" || !providerPayload.data?.link) {
        throw new Error(`Flutterwave initialization failed: ${providerError(providerPayload, providerResponse.statusText)}`);
      }
      authorizationUrl = providerPayload.data.link;
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      customer_id: user.id,
      gateway,
      reference,
      amount: Number(order.total_amount),
      currency: "NGN",
      status: "pending",
      metadata: { authorization_url: authorizationUrl },
    });
    if (paymentError) throw new Error(paymentError.message);

    await supabase
      .from("orders")
      .update({ payment_reference: reference, payment_method: gateway, payment_status: "Pending" })
      .eq("id", order.id);

    await supabase.from("payment_logs").insert({
      payment_reference: reference,
      event_type: "payment_initialized",
      gateway,
      payload: { order_id: order.id },
    });

    return NextResponse.json({
      success: true,
      data: { authorization_url: authorizationUrl, reference },
    });
  } catch (error) {
    const message = getServerErrorMessage(error);
    const status = message.includes("session expired") ? 401 : message.includes("not configured") || message.includes("not installed") ? 503 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
