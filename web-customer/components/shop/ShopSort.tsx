"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function ShopSort({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "newest") params.delete("sort");
    else params.set("sort", sort);
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="shop-sort" className="text-sm font-medium text-text-secondary">
        Sort by:
      </label>
      <div className="relative">
        <select
          id="shop-sort"
          value={value}
          onChange={(event) => updateSort(event.target.value)}
          className="appearance-none bg-card border border-border rounded-lg py-2 pl-4 pr-10 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
      </div>
    </div>
  );
}
