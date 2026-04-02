import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/products/getProducts";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const products = await getProducts();
  
  // Clean slug for display
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === slug.toLowerCase()
  );

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20">
        <Breadcrumbs items={[
          { label: "Categories", href: "/categories" },
          { label: categoryName }
        ]} />
        
        <header className="py-16 bg-slate-50 dark:bg-slate-900/50">
          <Container>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter mb-4 text-slate-900 dark:text-white">
              {categoryName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
              Browsing our collection of premium {categoryName.toLowerCase()} products. Quality and style guaranteed.
            </p>
          </Container>
        </header>

        <section className="py-16">
          <Container>
            {categoryProducts.length > 0 ? (
              <ProductGrid products={categoryProducts} columns={4} />
            ) : (
              <div className="text-center py-20 space-y-6">
                <div className="text-6xl">🔍</div>
                <h2 className="text-2xl font-bold">No products found</h2>
                <p className="text-slate-500">We couldn't find any products in this category at the moment.</p>
              </div>
            )}
          </Container>
        </section>
      </div>
      <Footer />
    </main>
  );
}
