import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/products/getProducts";
import { getCategories } from "@/products/getCategories";
import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function ShopPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <main className="min-h-screen">
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
                      <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">All Products</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <input type="range" className="w-full accent-primary" min="0" max="1000" />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>₦0</span>
                      <span>₦1,000,000+</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">Clear Filters</Button>
              </aside>

              {/* Main Content */}
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h1 className="text-2xl font-extrabold mb-1 uppercase tracking-tight">Our Collection</h1>
                    <p className="text-sm text-slate-500">Showing {products.length} products</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-500">Sort by:</label>
                    <div className="relative">
                      <select className="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                        <option>Newest Arrivals</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Most Popular</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <ProductGrid products={products} columns={3} />
              </div>
            </div>
          </Container>
        </section>
      </div>
      <Footer />
    </main>
  );
}
