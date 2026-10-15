"use client";

import { useState } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string; slug?: string };

type FilterOption = { label: string; changes: Record<string, string | undefined>; active: boolean };

function FilterGroups({ categories, close }: { categories: Category[]; close?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const rating = searchParams.get("rating") || "";
  const availability = searchParams.get("availability") || "";
  const newOnly = searchParams.get("new") || "";
  const sale = searchParams.get("sale") || "";

  const apply = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    close?.();
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  };

  const groups: { title: string; options: FilterOption[] }[] = [
    {
      title: "Categories",
      options: [
        { label: "All products", changes: { category: undefined }, active: !category },
        ...categories.map((item) => ({
          label: item.name,
          changes: { category: item.slug || item.id },
          active: category === item.slug || category === item.id,
        })),
      ],
    },
    {
      title: "Price",
      options: [
        ["Under ₦5,000", "", "5000"],
        ["₦5,000 – ₦20,000", "5000", "20000"],
        ["₦20,000 – ₦50,000", "20000", "50000"],
        ["Over ₦50,000", "50000", ""],
      ].map(([label, min, max]) => ({
        label,
        changes: { minPrice: min || undefined, maxPrice: max || undefined },
        active: minPrice === min && maxPrice === max,
      })),
    },
    {
      title: "Rating",
      options: [
        { label: "4 stars & up", changes: { rating: "4" }, active: rating === "4" },
        { label: "3 stars & up", changes: { rating: "3" }, active: rating === "3" },
      ],
    },
    {
      title: "Quantity & availability",
      options: [
        { label: "In stock", changes: { availability: "in-stock" }, active: availability === "in-stock" },
        { label: "Low stock (5 or fewer)", changes: { availability: "low-stock" }, active: availability === "low-stock" },
        { label: "New arrivals", changes: { new: "true" }, active: newOnly === "true" },
        { label: "On sale", changes: { sale: "true" }, active: sale === "true" },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      {groups.map((group, index) => (
        <details key={group.title} open={index === 0} className="group rounded-2xl border border-border bg-bg/60">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-base font-black text-text-primary marker:content-none">
            {group.title}
            <ChevronDown className="h-4 w-4 text-text-secondary transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-1 border-t border-border px-2 py-2">
            {group.options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => apply(option.active ? Object.fromEntries(Object.keys(option.changes).map((key) => [key, undefined])) : option.changes)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${option.active ? "bg-blue-soft font-bold text-primary" : "text-text-secondary hover:bg-gold-soft/50 hover:text-text-primary"}`}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border">{option.active && <Check className="h-3 w-3" />}</span>
                {option.label}
              </button>
            ))}
          </div>
        </details>
      ))}
      <button
        type="button"
        onClick={() => apply({ category: undefined, minPrice: undefined, maxPrice: undefined, rating: undefined, availability: undefined, new: undefined, sale: undefined, featured: undefined })}
        className="w-full rounded-xl border border-border px-4 py-3 text-sm font-black text-text-secondary transition hover:border-primary hover:text-primary"
      >
        Clear filters
      </button>
    </div>
  );
}

export function ShopFilters({ categories, variant }: { categories: Category[]; variant: "sidebar" | "mobile" }) {
  const [open, setOpen] = useState(false);

  if (variant === "sidebar") {
    return (
      <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
        <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Filters</h2>
          <FilterGroups categories={categories} />
        </div>
      </aside>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold text-text-primary lg:hidden">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        Filter
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/45 p-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Shop filters">
          <div className="mx-auto flex max-h-[calc(100dvh-2rem)] max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-xl font-black">Filter products</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-text-secondary hover:bg-bg" aria-label="Close filters"><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto p-5"><FilterGroups categories={categories} close={() => setOpen(false)} /></div>
          </div>
        </div>
      )}
    </>
  );
}
