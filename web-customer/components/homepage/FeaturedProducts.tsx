import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getFeaturedProducts } from "@/products/getProducts";

export const FeaturedProducts = async () => {
  const featuredProducts = await getFeaturedProducts();

  return (
    <section className="py-24 md:py-32 bg-secondary text-white">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <SectionTitle
            title="Fresh from the shelves"
            subtitle="The pieces customers are loving right now."
            className="mb-0 [&_h2]:text-white [&_p]:text-white/60"
          />
          <Link href="/shop" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-5 transition-all group">
            Shop everything <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} columns={4} />
      </Container>
    </section>
  );
};
