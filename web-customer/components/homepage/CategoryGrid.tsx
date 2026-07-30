import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getCategories } from "@/products/getCategories";

export const CategoryGrid = async () => {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-bg">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <SectionTitle
            title="Find your kind of thing"
            subtitle="Browse the everyday essentials, clever finds, and giftable favorites we love."
            className="mb-0"
          />
          <Link href="/categories" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-5 transition-all group">
            Browse all categories <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative h-80 rounded-[2rem] overflow-hidden bg-card border border-border transition-all duration-700 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 even:lg:translate-y-8"
            >
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                />
              ) : (
                <div className={`absolute inset-0 ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#10261d]/90 via-[#10261d]/5 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                <div className="h-12 w-12 bg-[#F4C95D] rounded-full flex items-center justify-center text-2xl shadow-lg shadow-black/10 transform group-hover:-translate-y-2 transition-all duration-500">
                  {cat.icon || '📦'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                    {cat.name}
                    <ChevronRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                  </h3>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">
                    {cat.itemCount || 0} products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
