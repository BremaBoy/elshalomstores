import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getFeaturedProducts } from "@/products/getProducts";

export const FeaturedProducts = async () => {
  const featuredProducts = await getFeaturedProducts();

  return (
    <section className="py-24 bg-card">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <SectionTitle
            title="Premium Selection"
            subtitle="Handpicked pieces from our most exclusive collections"
            className="mb-0"
          />
          <Link href="/shop" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-5 transition-all group">
            Explore Full Catalog <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} columns={4} />
      </Container>
    </section>
  );
};
