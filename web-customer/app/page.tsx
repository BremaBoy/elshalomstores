import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarketplaceHome } from "@/components/homepage/MarketplaceHome";
import { getProducts } from "@/products/getProducts";
import { getCategories } from "@/products/getCategories";
import { getHeroSlides } from "@/products/getHomepageData";

export default async function Home() {
  const [products, categories, slides] = await Promise.all([
    getProducts(),
    getCategories(),
    getHeroSlides(),
  ]);

  return (
    <main className="min-h-screen bg-bg">
      <Header />
      <MarketplaceHome
        products={products}
        categories={categories}
        slides={slides}
      />
      <Footer />
    </main>
  );
}
