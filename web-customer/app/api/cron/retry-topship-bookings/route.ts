import { NextResponse } from "next/server";

import { arrangeOrderShipment, getServerErrorMessage } from "@/lib/checkout-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getTopshipWalletBalance } from "@/lib/topship";

export const maxDuration = 60;

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

function bookingStatus(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const topship = (value as Record<string, unknown>).topship;
  return topship && typeof topship === "object"
    ? String((topship as Record<string, unknown>).booking_status || "")
    : "";
}

/**
 * Vercel invokes this route hourly. It deliberately only retries orders that
 * are waiting for wallet funding, preventing a temporary Terminal shortfall
 * from becoming a permanent manual task for the store team.
 */
export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, user_id, items, shipping_details, payment_method, total_amount, shipping_cost")
      .eq("status", "Processing")
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw new Error(error.message);

    const waitingOrders = (orders || []).filter((order) => bookingStatus(order.shipping_details) === "waiting_for_funds");
    if (!waitingOrders.length) {
      return NextResponse.json({ success: true, retried: 0, message: "No delivery bookings are waiting for wallet funding." });
    }

    const balance = await getTopshipWalletBalance();
    const reserve = Math.max(0, Number(process.env.TOPSHIP_WALLET_RESERVE_NGN || "0"));
    let available = balance - reserve;
    let retried = 0;

    for (const order of waitingOrders) {
      const cost = Number(order.shipping_cost || 0);
      if (!Number.isFinite(cost) || cost <= 0 || available < cost) continue;

      try {
        await arrangeOrderShipment(supabase, order);
        available -= cost;
        retried += 1;
      } catch (error) {
        // A later order may still be bookable with a different carrier/rate.
        console.error(`Topship retry failed for order ${order.id}:`, getServerErrorMessage(error));
      }
    }

    return NextResponse.json({ success: true, retried, waiting: waitingOrders.length, wallet_balance: balance });
  } catch (error) {
    console.error("Topship retry job failed:", getServerErrorMessage(error));
    return NextResponse.json({ success: false, message: getServerErrorMessage(error) }, { status: 500 });
  }
}
