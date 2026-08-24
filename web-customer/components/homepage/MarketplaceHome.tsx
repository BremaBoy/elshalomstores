import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  ChevronRight,
  CircleHelp,
  Gift,
  Headphones,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HeroSliderClient } from "@/components/homepage/HeroSliderClient";
import type { Product } from "@/products/getProducts";
import type { Category } from "@/products/getCategories";
import type { HeroSlide } from "@/products/getHomepageData";

interface MarketplaceHomeProps {
  products: Product[];
  categories: Category[];
  slides: HeroSlide[];
}

const categoryIcons = ["🎁", "🏠", "💨", "🍳", "🕯️", "✨", "🔌", "🧼"];

function categoryPath(category: Category) {
  const slug =
    category.slug ||
    category.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return `/categories/${slug}`;
}

export function MarketplaceHome({
  products,
  categories,
  slides,
}: MarketplaceHomeProps) {
  const saleProducts = products
    .filter((product) => product.discountPrice || product.isSale)
    .slice(0, 8);
  const dealProducts = saleProducts.length > 0 ? saleProducts : products.slice(0, 8);
  const newest = products
    .filter((product) => product.isNew)
    .concat(products.filter((product) => !product.isNew))
    .slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-lilac via-bg to-bg pb-8 pt-24 text-text-primary md:pt-28">
        <div className="absolute inset-0 marketplace-grid opacity-20" />
        <Container className="relative">
          <div className="grid items-stretch gap-4 min-[700px]:grid-cols-[190px_minmax(0,1fr)_240px] xl:grid-cols-[250px_minmax(0,1fr)_310px]">
            <aside className="hidden min-h-[620px] rounded-[2rem] border border-primary/15 bg-card/90 shadow-sm min-[700px]:flex min-[700px]:flex-col">
              <div className="bg-primary px-5 py-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-gold-soft">Browse the store</p>
                <h2 className="mt-1 text-lg font-black">Shop by category</h2>
              </div>
              <nav className="flex-1 space-y-1 p-3">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={categoryPath(category)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-text-secondary transition hover:bg-blue-soft hover:text-text-primary"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-soft/70 text-sm">
                      {category.icon || categoryIcons[index]}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-primary/35 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="relative min-w-0 self-stretch min-[700px]:min-h-[620px]">
              <HeroSliderClient slides={slides} />
            </div>

            <aside className="grid grid-cols-1 gap-3 sm:grid-cols-3 min-[700px]:min-h-[620px] min-[700px]:self-stretch min-[700px]:!grid-cols-1 min-[700px]:grid-rows-3">
              <Link href="/shop?new=true" className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-3xl border border-gold/25 bg-cream p-5 text-text-primary transition hover:-translate-y-0.5 hover:shadow-lg min-[700px]:min-h-0 min-[700px]:flex-row min-[700px]:items-end">
                <Gift className="absolute -bottom-5 -right-4 h-28 w-28 rotate-12 text-gold/15 transition group-hover:rotate-6 group-hover:scale-110" />
                <span className="text-[9px] font-black uppercase tracking-[.2em] text-[#694B12]">New arrivals</span>
                <div className="relative">
                  <p className="max-w-[150px] text-lg font-black leading-tight">Fresh finds just landed.</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary">Explore <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>

              <Link href="/shop?featured=true" className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-3xl bg-primary p-5 text-white transition hover:-translate-y-0.5 hover:shadow-lg min-[700px]:min-h-0 min-[700px]:flex-row min-[700px]:items-end">
                <BadgePercent className="absolute -bottom-4 -right-4 h-28 w-28 -rotate-12 text-white/10 transition group-hover:rotate-0 group-hover:scale-110" />
                <span className="text-[9px] font-black uppercase tracking-[.2em] text-gold-soft">Featured deals</span>
                <div className="relative">
                  <p className="max-w-[155px] text-lg font-black leading-tight">Good value, picked with care.</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white">Shop deals <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>

              <Link href="/contact" className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-3xl border border-primary/15 bg-lilac p-5 text-text-primary transition hover:-translate-y-0.5 hover:shadow-lg min-[700px]:min-h-0 min-[700px]:flex-row min-[700px]:items-end">
                <CircleHelp className="h-7 w-7 text-primary" />
                <div>
                  <p className="text-lg font-black leading-tight">Need help choosing?</p>
                  <p className="mt-2 text-[10px] font-medium leading-4 text-text-secondary">Talk to our shopping support team.</p>
                </div>
              </Link>
            </aside>
          </div>

          <div className="mt-4 grid overflow-hidden rounded-2xl border border-primary/15 bg-lilac/65 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Truck, "Fast delivery", "Across Nigeria"],
              [ShieldCheck, "Secure checkout", "Protected payments"],
              [RefreshCcw, "Easy returns", "Shop with confidence"],
              [Headphones, "Real support", "We are here to help"],
            ].map(([Icon, title, copy], index) => {
              const ServiceIcon = Icon as typeof Truck;
              return (
                <div key={title as string} className={`flex items-center gap-3 px-4 py-4 ${index > 0 ? "lg:border-l lg:border-border" : ""} ${index % 2 === 1 ? "sm:border-l sm:border-border" : ""}`}>
                  <ServiceIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[11px] font-black">{title as string}</p>
                    <p className="text-[9px] text-text-secondary">{copy as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-b border-border bg-cream py-6">
        <Container>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={categoryPath(category)}
                className="group flex min-w-[118px] flex-col items-center gap-3 rounded-2xl border border-primary/15 bg-card p-3 text-center transition hover:-translate-y-1 hover:border-primary/40 hover:bg-lilac/55 hover:shadow-lg"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-card ring-4 ring-primary/5">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-110"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-3xl">
                      {category.icon || categoryIcons[index % categoryIcons.length]}
                    </span>
                  )}
                </div>
                <span className="line-clamp-2 text-[11px] font-extrabold leading-4 text-text-primary">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
            <div className="flex flex-col gap-4 bg-gradient-to-r from-primary to-[#4A315F] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Zap className="h-6 w-6 fill-current" />
                </span>
                <div>
                  <p className="text-xl font-black tracking-tight">Today&apos;s hot deals</p>
                  <p className="text-xs text-white/80">Limited offers on customer favorites</p>
                </div>
              </div>
              <Link href="/shop" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                See all deals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4 md:p-6">
              {dealProducts.length > 0 ? (
                <ProductGrid products={dealProducts} columns={4} />
              ) : (
                <EmptyProducts />
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-10 md:pb-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/shop"
              className="group relative min-h-64 overflow-hidden rounded-[2rem] bg-primary p-8 text-white"
            >
              <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-primary/50 blur-3xl transition group-hover:bg-primary/70" />
              <BadgePercent className="relative h-8 w-8 text-gold-soft" />
              <div className="relative mt-12 max-w-sm">
                <p className="text-3xl font-black tracking-tight">Prices that feel like a win.</p>
                <p className="mt-3 text-sm text-white/80">Great value across your everyday essentials.</p>
              </div>
            </Link>
            <Link
              href="/shop?featured=true"
              className="group relative min-h-64 overflow-hidden rounded-[2rem] border border-border bg-card p-8"
            >
              <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl transition group-hover:bg-primary/25" />
              <PackageCheck className="relative h-8 w-8 text-primary" />
              <div className="relative mt-12 max-w-sm">
                <p className="text-3xl font-black tracking-tight text-text-primary">Picked with more care.</p>
                <p className="mt-3 text-sm text-text-secondary">Useful products, trusted quality, no endless scrolling.</p>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-y border-primary/15 bg-lilac/55 py-10 md:py-14">
        <Container>
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-primary">Just in</span>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-text-primary md:text-3xl">New things worth seeing</h2>
            </div>
            <Link href="/shop?new=true" className="hidden items-center gap-2 text-xs font-black uppercase tracking-widest text-primary sm:flex">
              Shop new arrivals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {newest.length > 0 ? <ProductGrid products={newest} columns={4} /> : <EmptyProducts />}
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-lilac via-cream to-card p-7 md:flex md:items-center md:justify-between md:p-12">
            <div className="max-w-xl">
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-primary">The Elshalom list</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary md:text-4xl">Good finds, delivered to your inbox.</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">Be first to know about new products, useful ideas, and genuinely good offers.</p>
            </div>
            <Link
              href="/contact?subject=Newsletter%20subscription"
              className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-hover md:mt-0"
            >
              Join the list
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function EmptyProducts() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
      <Sparkles className="h-7 w-7 text-primary" />
      <p className="mt-3 font-bold text-text-primary">Fresh products are on the way.</p>
      <p className="mt-1 text-xs text-text-secondary">Check back soon for the latest drops.</p>
    </div>
  );
}
