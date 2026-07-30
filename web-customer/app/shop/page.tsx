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
  }>;
}) {
  const {
    q = "",
    category = "",
    sort = "newest",
    new: newOnly = "",
    featured = "",
  } = await searchParams;
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
  const queryParams = q ? `&q=${encodeURIComponent(q)}` : "";

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
                <div>
                  <h3 className="text-lg font-bold mb-4">Categories</h3>
                  <div className="space-y-2">
                    <Link href={`/shop${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${!category ? "bg-primary/10 font-bold text-primary" : "text-text-secondary hover:text-primary"}`}>
                      <span className="flex h-4 w-4 items-center justify-center rounded border border-border">{!category && <Check className="h-3 w-3" />}</span>
                      All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/shop?category=${encodeURIComponent(cat.slug)}${queryParams}`} className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${category === cat.slug || category === cat.id ? "bg-primary/10 font-bold text-primary" : "text-text-secondary hover:text-primary"}`}>
                        <span className="flex h-4 w-4 items-center justify-center rounded border border-border">{(category === cat.slug || category === cat.id) && <Check className="h-3 w-3" />}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href="/shop" className="block">
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
