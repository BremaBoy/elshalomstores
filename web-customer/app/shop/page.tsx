import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/products/getProducts";
import { getCategories } from "@/products/getCategories";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ShopSort } from "@/components/shop/ShopSort";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    new?: string;
    featured?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    availability?: string;
    sale?: string;
  }>;
}) {
  const {
    q = "",
    category = "",
    sort = "newest",
    new: newOnly = "",
    featured = "",
    minPrice = "",
    maxPrice = "",
    rating = "",
    availability = "",
    sale = "",
  } = await searchParams;
  const minimumPrice = Number(minPrice);
  const maximumPrice = Number(maxPrice);
  const minimumRating = Number(rating);
  const query = q.trim().toLowerCase();
  const products = await getProducts();
  const categories = await getCategories();
  const matchingCategoryNames = categories
    .filter((category) => category.name.toLowerCase().includes(query))
    .map((category) => category.name.toLowerCase());
  const searchedProducts = query
    ? products.filter((product) => {
        const name = product.name.toLowerCase();
        const category = (product.category || "").toLowerCase();
        return (
          name.includes(query) ||
          category.includes(query) ||
          matchingCategoryNames.some(
            (categoryName) =>
              category.includes(categoryName) || categoryName.includes(category)
          )
        );
      })
    : products;
  const filteredProducts = searchedProducts.filter((product) => {
    if (newOnly === "true" && !product.isNew) return false;
    if (featured === "true" && (product.rating || 0) < 4.5) return false;
    const price = product.discountPrice ?? product.price;
    if (Number.isFinite(minimumPrice) && minPrice && price < minimumPrice) return false;
    if (Number.isFinite(maximumPrice) && maxPrice && price > maximumPrice) return false;
    if (Number.isFinite(minimumRating) && rating && (product.rating || 0) < minimumRating) return false;
    const stock = product.stock ?? 0;
    if (availability === "in-stock" && stock <= 0) return false;
    if (availability === "low-stock" && (stock <= 0 || stock > 5)) return false;
    if (sale === "true" && !(product.discountPrice && product.discountPrice < product.price)) return false;
    if (!category) return true;
    const productCategory = (product.category || "").toLowerCase();
    const selectedCategory = categories.find(
      (item) => item.id === category || item.slug === category
    );
    if (!selectedCategory) return productCategory === category.toLowerCase();
    return (
      productCategory === selectedCategory.id.toLowerCase() ||
      productCategory === selectedCategory.slug.toLowerCase() ||
      productCategory === selectedCategory.name.toLowerCase()
    );
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = a.discountPrice ?? a.price;
    const bPrice = b.discountPrice ?? b.price;
    if (sort === "price-asc") return aPrice - bPrice;
    if (sort === "price-desc") return bPrice - aPrice;
    if (sort === "popular") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });
  const shopHref = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const current = { q, category, sort, new: newOnly, featured, minPrice, maxPrice, rating, availability, sale };
    Object.entries({ ...current, ...changes }).forEach(([key, value]) => {
      if (value && !(key === "sort" && value === "newest")) params.set(key, value);
    });
    return `/shop${params.size ? `?${params.toString()}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <Header />
      <div className="pt-20">
        <Breadcrumbs items={[{ label: "Shop" }]} />
        
        <section className="py-12">
          <Container>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="w-full lg:w-64 space-y-8">
                <div className="rounded-3xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-28">
                  <h3 className="text-lg font-bold mb-4">Categories</h3>
                  <div className="space-y-2">
                    <Link href={shopHref({ category: undefined })} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${!category ? "bg-blue-soft font-bold text-primary" : "text-text-secondary hover:bg-gold-soft/50 hover:text-text-primary"}`}>
                      <span className="flex h-4 w-4 items-center justify-center rounded border border-border">{!category && <Check className="h-3 w-3" />}</span>
                      All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link key={cat.id} href={shopHref({ category: cat.slug })} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${category === cat.slug || category === cat.id ? "bg-blue-soft font-bold text-primary" : "text-text-secondary hover:bg-gold-soft/50 hover:text-text-primary"}`}>
                        <span className="flex h-4 w-4 items-center justify-center rounded border border-border">{(category === cat.slug || category === cat.id) && <Check className="h-3 w-3" />}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-7 border-t border-border pt-6">
                    <h3 className="mb-3 text-lg font-bold">Price</h3>
                    <div className="space-y-2">
                      {[
                        ["Under ₦5,000", "", "5000"],
                        ["₦5,000 – ₦20,000", "5000", "20000"],
                        ["₦20,000 – ₦50,000", "20000", "50000"],
                        ["Over ₦50,000", "50000", ""],
                      ].map(([label, min, max]) => {
                        const active = minPrice === min && maxPrice === max;
                        return <Link key={label} href={shopHref({ minPrice: active ? undefined : min || undefined, maxPrice: active ? undefined : max || undefined })} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-blue-soft font-bold text-primary" : "text-text-secondary hover:bg-gold-soft/50 hover:text-text-primary"}`}><span className="flex h-4 w-4 items-center justify-center rounded border border-border">{active && <Check className="h-3 w-3" />}</span>{label}</Link>;
                      })}
                    </div>
                  </div>
                  <div className="mt-7 border-t border-border pt-6">
                    <h3 className="mb-3 text-lg font-bold">Rating</h3>
                    <div className="space-y-2">
                      {[["4 stars & up", "4"], ["3 stars & up", "3"]].map(([label, value]) => {
                        const active = rating === value;
                        return <Link key={value} href={shopHref({ rating: active ? undefined : value })} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-blue-soft font-bold text-primary" : "text-text-secondary hover:bg-gold-soft/50 hover:text-text-primary"}`}><span className="flex h-4 w-4 items-center justify-center rounded border border-border">{active && <Check className="h-3 w-3" />}</span>{label}</Link>;
                      })}
                    </div>
                  </div>
                  <div className="mt-7 border-t border-border pt-6">
                    <h3 className="mb-3 text-lg font-bold">Quantity & availability</h3>
                    <div className="space-y-2">
                      {[["In stock", "in-stock"], ["Low stock (5 or fewer)", "low-stock"]].map(([label, value]) => {
                        const active = availability === value;
                        return <Link key={value} href={shopHref({ availability: active ? undefined : value })} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-blue-soft font-bold text-primary" : "text-text-secondary hover:bg-gold-soft/50 hover:text-text-primary"}`}><span className="flex h-4 w-4 items-center justify-center rounded border border-border">{active && <Check className="h-3 w-3" />}</span>{label}</Link>;
                      })}
                    </div>
                  </div>
                  <div className="mt-7 border-t border-border pt-6">
                    <h3 className="mb-3 text-lg font-bold">More filters</h3>
                    {[['New arrivals', 'new', newOnly], ['On sale', 'sale', sale]].map(([label, key, currentValue]) => {
                      const active = currentValue === "true";
                      return <Link key={key} href={shopHref({ [key]: active ? undefined : "true" })} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-blue-soft font-bold text-primary" : "text-text-secondary hover:bg-gold-soft/50 hover:text-text-primary"}`}><span className="flex h-4 w-4 items-center justify-center rounded border border-border">{active && <Check className="h-3 w-3" />}</span>{label}</Link>;
                    })}
                  </div>
                </div>

                <Link href="/shop" className="block mt-5">
                  <Button variant="outline" className="w-full">Clear Filters</Button>
                </Link>
              </aside>

              {/* Main Content */}
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
                  <div>
                    <h1 className="text-2xl font-extrabold mb-1 uppercase tracking-tight">Our Collection</h1>
                    <p className="text-sm text-text-secondary">
                      {query
                        ? `${sortedProducts.length} result${sortedProducts.length === 1 ? "" : "s"} for “${q.trim()}”`
                        : `Showing ${sortedProducts.length} products`}
                    </p>
                  </div>
                  
                  <ShopSort value={sort} />
                </div>

                {sortedProducts.length > 0 ? (
                  <ProductGrid products={sortedProducts} columns={3} />
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card px-6 text-center">
                    <Search className="h-8 w-8 text-primary" />
                    <h2 className="mt-4 text-xl font-black text-text-primary">
                      No matching products
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-text-secondary">
                      Try another product name or category, or clear the search to browse everything.
                    </p>
                    <Link href="/shop" className="mt-6">
                      <Button>Clear Search</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      </div>
      <Footer />
    </main>
  );
}
