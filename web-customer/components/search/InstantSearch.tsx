"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FolderSearch,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type SearchProduct = {
  id: string;
  name: string;
  category: string | null;
  image: string | null;
  price: number;
  discount_price: number | null;
};

type SearchCategory = {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string | null;
};

type SearchResult =
  | { type: "product"; label: string; href: string; product: SearchProduct }
  | { type: "category"; label: string; href: string; category: SearchCategory };

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=60";

function categorySlug(category: SearchCategory) {
  return (
    category.slug ||
    category.id ||
    category.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
  );
}

export function InstantSearch({
  mode = "desktop",
  transparent = false,
  onNavigate,
}: {
  mode?: "desktop" | "mobile";
  transparent?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      setLoading(true);
      const [productResponse, categoryResponse] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, category, image, price, discount_price")
          .eq("status", "active")
          .limit(60),
        supabase
          .from("categories")
          .select("id, name, icon")
          .order("name", { ascending: true })
          .limit(30),
      ]);

      if (!active) return;
      setProducts((productResponse.data as SearchProduct[] | null) || []);
      setCategories((categoryResponse.data as SearchCategory[] | null) || []);
      setLoading(false);
    };

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo<SearchResult[]>(() => {
    if (!normalizedQuery) return [];

    const categoryResults: SearchResult[] = categories
      .filter((category) => category.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 4)
      .map((category) => ({
        type: "category",
        label: category.name,
        href: `/categories/${encodeURIComponent(categorySlug(category))}`,
        category,
      }));

    const productResults: SearchResult[] = products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedQuery) ||
          (product.category || "").toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map((product) => ({
        type: "product",
        label: product.name,
        href: `/product/${product.id}`,
        product,
      }));

    return [...categoryResults, ...productResults];
  }, [categories, normalizedQuery, products]);

  const navigate = (href: string) => {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(href);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      navigate(results[activeIndex].href);
      return;
    }
    navigate(
      normalizedQuery
        ? `/shop?q=${encodeURIComponent(query.trim())}`
        : "/shop"
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (event.key === "Escape") setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const inputClass =
    mode === "desktop"
      ? `w-full border rounded-full py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
          transparent
            ? "bg-white/10 border-white/20 text-white placeholder:text-white/80 backdrop-blur-md"
            : "bg-card border-border text-text-primary placeholder:text-text-secondary/60"
        }`
      : "h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

  const iconClass = transparent
    ? "text-white/80 group-focus-within:text-gold-soft"
    : "text-text-secondary group-focus-within:text-primary";

  return (
    <form
      onSubmit={submitSearch}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
      className={
        mode === "desktop"
          ? "group relative hidden max-w-xl flex-grow lg:flex"
          : "group relative"
      }
      role="search"
    >
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search products and categories..."
        aria-label="Search products and categories"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`instant-search-${mode}`}
        aria-activedescendant={
          activeIndex >= 0 ? `instant-result-${mode}-${activeIndex}` : undefined
        }
        autoComplete="off"
        className={inputClass}
      />
      <button
        type="submit"
        aria-label="Submit search"
        className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:text-primary ${iconClass}`}
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <div
          id={`instant-search-${mode}`}
          role="listbox"
          aria-label="Search suggestions"
          className={`absolute left-0 right-0 top-full z-[90] mt-3 overflow-hidden border border-border bg-card text-text-primary shadow-2xl shadow-black/20 ${
            mode === "desktop" ? "rounded-3xl" : "rounded-2xl"
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-3 px-5 py-5 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Finding products…
            </div>
          ) : !normalizedQuery ? (
            <div className="p-3">
              <div className="flex items-center gap-2 px-2 pb-2 text-[10px] font-black uppercase tracking-[.18em] text-text-secondary">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Popular categories
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/categories/${encodeURIComponent(categorySlug(category))}`
                      )
                    }
                    className="rounded-full border border-border bg-bg px-3 py-2 text-xs font-bold text-text-secondary transition hover:border-primary hover:text-primary"
                  >
                    {category.icon && <span className="mr-1">{category.icon}</span>}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[min(28rem,65vh)] overflow-y-auto p-2">
              {results.map((result, index) => (
                <button
                  id={`instant-result-${mode}-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  key={`${result.type}-${result.href}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigate(result.href)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    activeIndex === index
                      ? "bg-primary/10"
                      : "hover:bg-blue-soft/60"
                  }`}
                >
                  {result.type === "product" ? (
                    <>
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-bg">
                        <Image
                          src={
                            result.product.image?.startsWith("http")
                              ? result.product.image
                              : PLACEHOLDER
                          }
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">
                          {result.product.name}
                        </span>
                        <span className="block truncate text-[11px] font-medium text-text-secondary">
                          {result.product.category || "Product"}
                        </span>
                      </span>
                      <span className="text-sm font-black text-primary">
                        ₦
                        {Number(
                          result.product.discount_price &&
                            result.product.discount_price > 0
                            ? result.product.discount_price
                            : result.product.price
                        ).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg text-primary">
                        {result.category.icon || (
                          <FolderSearch className="h-5 w-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">
                          {result.category.name}
                        </span>
                        <span className="block text-[11px] font-medium text-text-secondary">
                          Browse category
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-text-secondary" />
                    </>
                  )}
                </button>
              ))}
              <button
                type="submit"
                onMouseEnter={() => setActiveIndex(-1)}
                className="mt-1 flex w-full items-center justify-between rounded-2xl border-t border-border px-4 py-3 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5"
              >
                View all results for “{query.trim()}”
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="px-5 py-6 text-center">
              <Search className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-black">No instant matches</p>
              <button
                type="submit"
                onMouseEnter={() => setActiveIndex(-1)}
                className="mt-2 text-xs font-bold text-primary hover:underline"
              >
                Search the full shop for “{query.trim()}”
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
