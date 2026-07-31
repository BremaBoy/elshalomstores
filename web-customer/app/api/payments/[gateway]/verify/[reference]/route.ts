import { NextResponse } from "next/server";

import { finalizeSuccessfulPayment, getServerErrorMessage } from "@/lib/checkout-server";
import { authenticateCheckoutRequest } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ gateway: string; reference: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { gateway, reference } = await context.params;
    if (gateway !== "paystack") {
      throw new Error("Unsupported payment gateway.");
    }

    const { supabase, user } = await authenticateCheckoutRequest(request);
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .eq("gateway", gateway)
      .single();

    if (paymentError || !payment) throw new Error("Payment record not found.");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", payment.order_id)
      .eq("user_id", user.id)
      .single();
    if (orderError || !order) throw new Error("Order not found.");

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error("Paystack is not configured on the customer deployment.");

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" },
    );
    const payload = await response.json() as {
      status?: boolean;
      message?: string;
      data?: { id?: number; status?: string; amount?: number; currency?: string; reference?: string };
    };
    if (!response.ok || !payload.status || !payload.data) {
      throw new Error(`Paystack verification failed: ${payload.message || response.statusText}`);
    }

    const providerStatus = payload.data.status || "failed";
    const transactionId = String(payload.data.id || "");
    const amountPaid = Number(payload.data.amount || 0) / 100;
    const currency = payload.data.currency || "";
    const providerReference = payload.data.reference || "";

    const successful = providerStatus === "success" || providerStatus === "successful";
    const detailsMatch = providerReference === reference
      && currency === "NGN"
      && amountPaid >= Number(payment.amount);

    if (!successful || !detailsMatch) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
      return NextResponse.json({
        success: false,
        status: providerStatus,
        message: "The provider did not confirm the expected payment amount and reference.",
      }, { status: 400 });
    }

    await finalizeSuccessfulPayment({
      supabase,
      payment,
      order,
      reference,
      gateway,
      transactionId,
      eventType: "payment_verified",
    });

    return NextResponse.json({ success: true, status: "success" });
  } catch (error) {
    const message = getServerErrorMessage(error);
    const status = message.includes("session expired") ? 401 : 400;
    return NextResponse.json({ success: false, status: "error", message }, { status });
  }
}
