import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
    const supabase = createAdminClient();
    const [{ data: products, error: productError }, { data: categories, error: categoryError }] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, category, image, price, discount_price, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("categories")
        .select("id, name, slug, icon")
        .order("name", { ascending: true })
        .limit(100),
    ]);

    if (productError) throw new Error(productError.message);
    if (categoryError) throw new Error(categoryError.message);

    const words = query.split(/\s+/).filter(Boolean);
    const matchingProducts = query
      ? (products || []).filter((product) => {
          const haystack = `${asText(product.name)} ${asText(product.category)}`.toLowerCase();
          return words.every((word) => haystack.includes(word));
        })
      : [];

    return NextResponse.json({
      success: true,
      data: {
        products: matchingProducts.slice(0, 8),
        categories: categories || [],
      },
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to search the catalogue.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
