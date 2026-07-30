import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/homepage/HeroSlider";
import { CategoryGrid } from "@/components/homepage/CategoryGrid";
import { FeaturedProducts } from "@/components/homepage/FeaturedProducts";
import { PromoBanner } from "@/components/homepage/PromoBanner";
import { BrandSlider } from "@/components/homepage/BrandSlider";
import { NewsletterSection } from "@/components/homepage/NewsletterSection";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/products/getProducts";

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-bg overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <HeroSlider />

      {/* Categories */}
      <CategoryGrid />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Promo Banner */}
      <PromoBanner />

      {/* Product Sections (Category based rows) */}
      <section className="py-24 md:py-32 bg-bg">
        <Container>
          <SectionTitle
            title="Tech worth talking about"
            subtitle="Smart upgrades, useful gadgets, and everyday essentials."
          />
          <ProductGrid 
            products={products.filter(p => p.category === "Electronics").slice(0, 4)} 
            columns={4} 
          />
          
          <div className="mt-20">
            <SectionTitle
              title="A better everyday"
              subtitle="Thoughtful pieces that make home feel more like yours."
            />
            <ProductGrid 
              products={products.filter(p => p.category === "Home Decor").slice(0, 4)} 
              columns={4} 
            />
          </div>
        </Container>
      </section>

      {/* Brand Partners */}
      <BrandSlider />

      {/* Newsletter */}
      <NewsletterSection />

      <Footer />
    </main>
  );
}
