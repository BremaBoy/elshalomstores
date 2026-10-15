import { NextResponse } from "next/server";

import { arrangeOrderShipment, getServerErrorMessage } from "@/lib/checkout-server";
import { authenticateCheckoutRequest } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { orderId } = await params;
    const { supabase, user } = await authenticateCheckoutRequest(request);
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, user_id, items, shipping_details, payment_method, total_amount, shipping_cost")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found.");

    await arrangeOrderShipment(supabase, order);
    return NextResponse.json({ success: true, message: "Delivery booking completed." });
  } catch (error) {
    const message = getServerErrorMessage(error);
    const status = message.includes("session expired") ? 401 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
