import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import type { StoredOrderItem } from "@/lib/checkout-server";

const TOPSHIP_API_URL = "https://api.terminal.africa/v1";
const QUOTE_TTL_MS = 15 * 60 * 1000;

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export interface TopshipRate {
  rate_id: string;
  amount: number;
  currency: string;
  carrier_name: string;
  carrier_rate_description?: string;
  delivery_time?: string;
  delivery_date?: string;
}

interface SignedQuote {
  rateId: string;
  amount: number;
  currency: string;
  carrierName: string;
  service?: string;
  deliveryTime?: string;
  deliveryDate?: string;
  userId: string;
  addressHash: string;
  itemsHash: string;
  expiresAt: number;
}

function configuredValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Topship is not configured. Add ${name} to the customer deployment.`);
  return value;
}

function topShipHeaders() {
  return {
    Authorization: `Bearer ${configuredValue("TOPSHIP_SECRET_KEY")}`,
    "Content-Type": "application/json",
  };
}

function normalizedAddress(address: ShippingAddress) {
  return [address.firstName, address.lastName, address.email, address.phone, address.address, address.city, address.state]
    .map((value) => value.trim().toLowerCase())
    .join("|");
}

export function itemsFingerprint(items: StoredOrderItem[]) {
  return items
    .map((item) => `${item.product_id}:${item.quantity}:${item.unit_price}`)
    .sort()
    .join("|");
}

function hash(value: string) {
  return createHmac("sha256", configuredValue("TOPSHIP_SECRET_KEY")).update(value).digest("hex");
}

function signature(payload: string) {
  return createHmac("sha256", configuredValue("TOPSHIP_SECRET_KEY")).update(payload).digest("base64url");
}

function pickupAddress() {
  return {
    first_name: configuredValue("TOPSHIP_PICKUP_FIRST_NAME"),
    last_name: configuredValue("TOPSHIP_PICKUP_LAST_NAME"),
    email: configuredValue("TOPSHIP_PICKUP_EMAIL"),
    phone: configuredValue("TOPSHIP_PICKUP_PHONE"),
    line1: configuredValue("TOPSHIP_PICKUP_ADDRESS"),
    line2: configuredValue("TOPSHIP_PICKUP_ADDRESS_LINE2"),
    city: configuredValue("TOPSHIP_PICKUP_CITY"),
    state: configuredValue("TOPSHIP_PICKUP_STATE"),
    country: process.env.TOPSHIP_PICKUP_COUNTRY?.trim() || "NG",
    zip: process.env.TOPSHIP_PICKUP_ZIP?.trim() || "100001",
  };
}

function deliveryAddress(address: ShippingAddress) {
  return {
    first_name: address.firstName.trim(),
    last_name: address.lastName.trim(),
    email: address.email.trim(),
    phone: address.phone.trim(),
    line1: address.address.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    country: "NG",
    // Nigeria does not use postcodes uniformly. Topship requires one when a
    // quote is persisted, so allow the store to configure its fallback.
    zip: process.env.TOPSHIP_DELIVERY_ZIP?.trim() || "100001",
  };
}

function parcel(items: StoredOrderItem[]) {
  const defaultWeight = Number(process.env.TOPSHIP_DEFAULT_ITEM_WEIGHT_KG || "0.5");
  const weight = Number.isFinite(defaultWeight) && defaultWeight > 0 ? defaultWeight : 0.5;
  return {
    description: `El Shalom Stores order (${items.length} product${items.length === 1 ? "" : "s"})`,
    weight_unit: "kg",
    items: items.map((item) => ({
      name: item.name,
      description: item.name,
      type: "parcel",
      currency: "NGN",
      value: item.unit_price,
      quantity: item.quantity,
      weight,
    })),
  };
}

async function topShipRequest(path: string, init: RequestInit) {
  const response = await fetch(`${TOPSHIP_API_URL}${path}`, { ...init, headers: topShipHeaders(), cache: "no-store" });
  const payload = await response.json().catch(() => null) as { status?: boolean; message?: string; data?: unknown } | null;
  if (!response.ok || !payload?.status) {
    throw new Error(`Topship request failed: ${payload?.message || response.statusText}`);
  }
  return payload.data;
}

function createQuoteToken(quote: SignedQuote) {
  const payload = Buffer.from(JSON.stringify(quote)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyTopshipQuote(token: string, userId: string, address: ShippingAddress, items: StoredOrderItem[]) {
  const [encoded, receivedSignature] = token.split(".");
  if (!encoded || !receivedSignature) throw new Error("Choose a shipping option before placing your order.");
  const expectedSignature = signature(encoded);
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))) {
    throw new Error("Your shipping quote is invalid. Please get a new quote.");
  }

  let quote: SignedQuote;
  try {
    quote = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SignedQuote;
  } catch {
    throw new Error("Your shipping quote is invalid. Please get a new quote.");
  }
  if (quote.expiresAt < Date.now() || quote.userId !== userId || quote.addressHash !== hash(normalizedAddress(address)) || quote.itemsHash !== hash(itemsFingerprint(items))) {
    throw new Error("Your shipping quote has expired or no longer matches this order. Please get a new quote.");
  }
  return quote;
}

export async function getTopshipQuotes(address: ShippingAddress, items: StoredOrderItem[], userId: string) {
  const data = await topShipRequest("/rates/shipment/quotes", {
    method: "POST",
    body: JSON.stringify({
      pickup_address: pickupAddress(),
      delivery_address: deliveryAddress(address),
      parcel: parcel(items),
      currency: "NGN",
      persist_data: true,
    }),
  });
  const rates = Array.isArray(data) ? data as TopshipRate[] : [];
  return rates
    .filter((rate) => typeof rate.rate_id === "string" && Number.isFinite(Number(rate.amount)) && Number(rate.amount) >= 0 && rate.currency === "NGN")
    .sort((a, b) => Number(a.amount) - Number(b.amount))
    .slice(0, 6)
    .map((rate) => ({
      ...rate,
      amount: Number(rate.amount),
      quote_token: createQuoteToken({
        rateId: rate.rate_id,
        amount: Number(rate.amount),
        currency: rate.currency,
        carrierName: rate.carrier_name,
        service: rate.carrier_rate_description,
        deliveryTime: rate.delivery_time,
        deliveryDate: rate.delivery_date,
        userId,
        addressHash: hash(normalizedAddress(address)),
        itemsHash: hash(itemsFingerprint(items)),
        expiresAt: Date.now() + QUOTE_TTL_MS,
      }),
    }));
}

export async function getAuthoritativeTopshipRate(rateId: string) {
  const data = await topShipRequest(`/rates/${encodeURIComponent(rateId)}`, { method: "GET" }) as TopshipRate;
  if (!data || data.currency !== "NGN" || !Number.isFinite(Number(data.amount)) || Number(data.amount) < 0) {
    throw new Error("The selected Topship rate is no longer available. Please get a new quote.");
  }
  return { ...data, amount: Number(data.amount) };
}

export async function arrangeTopshipPickup(rateId: string) {
  return topShipRequest("/shipments/pickup", {
    method: "POST",
    body: JSON.stringify({ rate_id: rateId }),
  }) as Promise<Record<string, unknown>>;
}
