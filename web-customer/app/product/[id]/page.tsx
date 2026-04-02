import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getProductById, getFeaturedProducts } from "@/products/getProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Star, ShoppingCart, Heart, Share2, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = params;
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }

  const relatedProducts = await getFeaturedProducts();

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20">
        <Breadcrumbs items={[
          { label: "Shop", href: "/shop" },
          { label: product.category, href: `/categories/${product.category.toLowerCase()}` },
          { label: product.name }
        ]} />
        
        <section className="py-12">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              {/* Product Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Thumbnails (Mock) */}
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <Image src={product.image} alt="" fill className="object-cover opacity-60" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="primary">{product.category}</Badge>
                    {product.isNew && <Badge variant="success">New Arrival</Badge>}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tighter">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-slate-500 font-bold">{product.rating}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-primary hover:underline cursor-pointer">48 Reviews</span>
                  </div>
                </div>

                <ProductPrice price={product.price} discountPrice={product.discountPrice} size="lg" />

                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">
                  {product.description || "Experience superior quality and design with our flagship product. Crafted with care and built to last, it combines functionality with a modern aesthetic."}
                </p>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden h-12">
                            <button className="px-4 hover:bg-slate-50 dark:hover:bg-slate-800">-</button>
                            <span className="px-4 font-bold">1</span>
                            <button className="px-4 hover:bg-slate-50 dark:hover:bg-slate-800">+</button>
                        </div>
                        <Button className="flex-grow h-12 text-lg rounded-xl gap-2 font-bold uppercase tracking-wide">
                            <ShoppingCart className="h-5 w-5" />
                            Add to Cart
                        </Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200">
                            <Heart className="h-5 w-5 text-red-500" />
                        </Button>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" className="text-sm font-bold gap-2 text-slate-500 hover:text-primary">
                            <Share2 className="h-4 w-4" /> Share Product
                        </Button>
                    </div>
                </div>

                {/* Features Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                        <ShieldCheck className="h-6 w-6 text-emerald-600" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Extended Warranty</p>
                            <p className="text-xs text-emerald-600/80">2 Years secure protection</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                        <Truck className="h-6 w-6 text-blue-600" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Free Shipping</p>
                            <p className="text-xs text-blue-600/80">Available on orders over $50</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            <div>
                <SectionTitle title="You May Also Like" subtitle="Complete your collection with these top-rated items." />
                <ProductGrid products={relatedProducts.slice(0, 4)} columns={4} />
            </div>
          </Container>
        </section>
      </div>
      <Footer />
    </main>
  );
}
