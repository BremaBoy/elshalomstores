import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/products/getProducts";
import { getCategories } from "@/products/getCategories";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const products = await getProducts();
  const categories = await getCategories();
  const matchingCategoryNames = categories
    .filter((category) => category.name.toLowerCase().includes(query))
    .map((category) => category.name.toLowerCase());
  const filteredProducts = query
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
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" defaultChecked />
                      <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">All Products</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                        <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <input type="range" className="w-full accent-primary" min="0" max="1000" />
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>₦0</span>
                      <span>₦1,000,000+</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">Clear Filters</Button>
              </aside>

              {/* Main Content */}
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
                  <div>
                    <h1 className="text-2xl font-extrabold mb-1 uppercase tracking-tight">Our Collection</h1>
                    <p className="text-sm text-text-secondary">
                      {query
                        ? `${filteredProducts.length} result${filteredProducts.length === 1 ? "" : "s"} for “${q.trim()}”`
                        : `Showing ${filteredProducts.length} products`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-text-secondary">Sort by:</label>
                    <div className="relative">
                      <select className="appearance-none bg-card border border-border rounded-lg py-2 pl-4 pr-10 text-sm text-text-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                        <option>Newest Arrivals</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Most Popular</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    </div>
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <ProductGrid products={filteredProducts} columns={3} />
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
