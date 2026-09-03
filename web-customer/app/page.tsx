import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarketplaceHome } from "@/components/homepage/MarketplaceHome";
import { getProducts } from "@/products/getProducts";
import { getCategories } from "@/products/getCategories";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-bg">
      <Header />
      <MarketplaceHome
        products={products}
        categories={categories}
      />
      <Footer />
    </main>
  );
}
