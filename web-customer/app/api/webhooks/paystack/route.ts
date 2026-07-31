import { createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { finalizeSuccessfulPayment, getServerErrorMessage } from "@/lib/checkout-server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

interface PaystackEvent {
  event?: string;
  data?: {
    id?: number;
    status?: string;
    reference?: string;
  };
}

interface VerifiedPaystackTransaction {
  status?: boolean;
  message?: string;
  data?: {
    id?: number;
    status?: string;
    amount?: number;
    currency?: string;
    reference?: string;
  };
}

function signaturesMatch(expected: string, received: string) {
  const expectedBytes = Buffer.from(expected, "utf8");
  const receivedBytes = Buffer.from(received, "utf8");
  return expectedBytes.length === receivedBytes.length
    && timingSafeEqual(expectedBytes, receivedBytes);
}

export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ received: false, message: "Paystack is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const receivedSignature = request.headers.get("x-paystack-signature") || "";
  const expectedSignature = createHmac("sha512", secretKey).update(rawBody).digest("hex");

  if (!receivedSignature || !signaturesMatch(expectedSignature, receivedSignature)) {
    return NextResponse.json({ received: false, message: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as PaystackEvent;
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const reference = event.data?.reference;
    if (!reference) {
      return NextResponse.json({ received: true, ignored: true, message: "Payment reference is missing." });
    }

    const supabase = createAdminClient();
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .eq("gateway", "paystack")
      .maybeSingle();

    // A valid event can refer to a transaction created outside this checkout.
    // Acknowledge it so Paystack does not repeatedly deliver an unrelated event.
    if (paymentError) throw new Error(paymentError.message);
    if (!payment) return NextResponse.json({ received: true, ignored: true });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", payment.order_id)
      .single();
    if (orderError || !order) throw new Error(orderError?.message || "Order not found.");

    // Confirm the transaction directly with Paystack instead of trusting the
    // event body alone, then compare the reference, currency and exact amount.
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" },
    );
    const verification = await verificationResponse.json() as VerifiedPaystackTransaction;
    if (!verificationResponse.ok || !verification.status || !verification.data) {
      throw new Error(`Paystack verification failed: ${verification.message || verificationResponse.statusText}`);
    }

    const verified = verification.data;
    const expectedAmountInKobo = Math.round(Number(payment.amount) * 100);
    const detailsMatch = verified.status === "success"
      && verified.reference === reference
      && verified.currency === "NGN"
      && Number(verified.amount) === expectedAmountInKobo;

    if (!detailsMatch) {
      throw new Error("Paystack returned payment details that do not match this order.");
    }

    await finalizeSuccessfulPayment({
      supabase,
      payment,
      order,
      reference,
      gateway: "paystack",
      transactionId: String(verified.id || event.data?.id || ""),
      eventType: "charge.success",
      eventPayload: { source: "paystack_webhook" },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing failed:", getServerErrorMessage(error));
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
