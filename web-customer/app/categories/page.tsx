import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryGrid } from "@/components/homepage/CategoryGrid";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20">
        <Breadcrumbs items={[{ label: "Categories" }]} />
        <section className="py-12 bg-white dark:bg-slate-900">
          <Container>
            <div className="max-w-3xl mb-12">
              <h1 className="text-4xl font-extrabold mb-4 uppercase tracking-tighter">Browse Categories</h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                Explore our diverse range of high-quality products curated across multiple categories. From the latest tech to timeless fashion, we have it all.
              </p>
            </div>
            
            {/* Reusing CategoryGrid component but we could customize it for this page */}
            <CategoryGrid />
            
            {/* Additional Categories / Sub-sections */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-64 rounded-3xl overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=800" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" alt="Tech" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Daily Tech</h3>
                  <p className="text-sm text-white/80 mb-4">Essential gadgets for your lifestyle.</p>
                </div>
              </div>
              <div className="relative h-64 rounded-3xl overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" alt="Fashion" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Modern Wear</h3>
                  <p className="text-sm text-white/80 mb-4">Stay ahead of the curve with our fashion selection.</p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
      <Footer />
    </main>
  );
}
