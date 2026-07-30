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
import type { Product } from "@/products/getProducts";
import type { Category } from "@/products/getCategories";
import type { HeroSlide } from "@/products/getHomepageData";

interface MarketplaceHomeProps {
  products: Product[];
  categories: Category[];
  slides: HeroSlide[];
}

const fallbackHero: HeroSlide = {
  id: "elshalom-home",
  title: "Everything good, all in one place.",
  subtitle:
    "Discover useful finds, everyday essentials, thoughtful gifts, and the things you did not know you needed.",
  image_url:
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=85&w=1800&auto=format&fit=crop",
  link: "/shop",
  badge: "The Elshalom marketplace",
  cta_text: "Start shopping",
};

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
  const hero = slides[0] || fallbackHero;
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
      <section className="relative overflow-hidden bg-[#0A0710] pt-28 pb-8 text-white">
        <div className="absolute inset-0 marketplace-grid opacity-20" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]" />

        <Container className="relative">
          <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              [Truck, "Fast delivery", "Across Nigeria"],
              [ShieldCheck, "Secure checkout", "Protected payments"],
              [RefreshCcw, "Easy returns", "Shop with confidence"],
              [Headphones, "Real support", "We are here to help"],
            ].map(([Icon, title, copy]) => {
              const ServiceIcon = Icon as typeof Truck;
              return (
                <div
                  key={title as string}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-3 backdrop-blur-md"
                >
                  <ServiceIcon className="h-5 w-5 shrink-0 text-violet-300" />
                  <div>
                    <p className="text-xs font-black">{title as string}</p>
                    <p className="text-[10px] text-white/45">{copy as string}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)_230px]">
            <aside className="hidden rounded-3xl border border-white/10 bg-white/[.06] p-3 backdrop-blur-xl lg:block">
              <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[.22em] text-white/45">
                Shop by category
              </p>
              <nav className="space-y-0.5">
                {categories.slice(0, 8).map((category, index) => (
                  <Link
                    key={category.id}
                    href={categoryPath(category)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-sm">
                      {category.icon || categoryIcons[index]}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                ))}
              </nav>
              <Link
                href="/categories"
                className="mt-2 flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-violet-300"
              >
                See all categories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </aside>

            <div className="group relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900">
              <Image
                src={hero.image_url || fallbackHero.image_url}
                alt={hero.title}
                fill
                priority
                className="object-cover transition duration-1000 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
              <div className="absolute inset-0 flex max-w-2xl flex-col justify-center p-7 md:p-12">
                <span className="mb-5 flex w-fit items-center gap-2 rounded-full border border-violet-300/30 bg-violet-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] text-violet-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  {hero.badge || "Made for your everyday"}
                </span>
                <h1 className="max-w-xl text-4xl font-black leading-[.95] tracking-[-.055em] sm:text-5xl md:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-6 text-white/65 md:text-base">
                  {hero.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={hero.link || "/shop"}
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-[.14em] text-white shadow-xl shadow-primary/20 transition hover:bg-primary-hover hover:-translate-y-0.5"
                  >
                    {hero.cta_text || "Shop now"} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/categories"
                    className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-6 text-xs font-black uppercase tracking-[.14em] text-white backdrop-blur transition hover:bg-white/10"
                  >
                    Browse categories
                  </Link>
                </div>
              </div>
            </div>

            <aside className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <Link
                href="/shop?new=true"
                className="group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary to-violet-950 p-5"
              >
                <Gift className="absolute -bottom-4 -right-3 h-28 w-28 rotate-12 text-white/10 transition group-hover:rotate-6 group-hover:scale-110" />
                <span className="text-[10px] font-black uppercase tracking-[.2em] text-white/55">New this week</span>
                <div>
                  <p className="text-xl font-black leading-tight">Fresh finds have landed.</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
              <Link
                href="/contact"
                className="group flex min-h-44 flex-col justify-between rounded-3xl border border-white/10 bg-white/[.06] p-5 backdrop-blur-xl transition hover:bg-white/10"
              >
                <CircleHelp className="h-7 w-7 text-violet-300" />
                <div>
                  <p className="text-lg font-black">Need help choosing?</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">Talk to our shopping support team.</p>
                </div>
              </Link>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-b border-border bg-card py-6">
        <Container>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {categories.slice(0, 10).map((category, index) => (
              <Link
                key={category.id}
                href={categoryPath(category)}
                className="group flex min-w-[118px] flex-col items-center gap-3 rounded-2xl border border-border bg-bg p-3 text-center transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
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
            <div className="flex flex-col gap-4 bg-gradient-to-r from-primary to-violet-900 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Zap className="h-6 w-6 fill-current" />
                </span>
                <div>
                  <p className="text-xl font-black tracking-tight">Today&apos;s hot deals</p>
                  <p className="text-xs text-white/65">Limited offers on customer favorites</p>
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
              className="group relative min-h-64 overflow-hidden rounded-[2rem] bg-zinc-950 p-8 text-white"
            >
              <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-primary/50 blur-3xl transition group-hover:bg-primary/70" />
              <BadgePercent className="relative h-8 w-8 text-violet-300" />
              <div className="relative mt-12 max-w-sm">
                <p className="text-3xl font-black tracking-tight">Prices that feel like a win.</p>
                <p className="mt-3 text-sm text-white/55">Great value across your everyday essentials.</p>
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

      <section className="border-y border-border bg-card py-10 md:py-14">
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
          <div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-bg to-bg p-7 md:flex md:items-center md:justify-between md:p-12">
            <div className="max-w-xl">
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-primary">The Elshalom list</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary md:text-4xl">Good finds, delivered to your inbox.</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">Be first to know about new products, useful ideas, and genuinely good offers.</p>
            </div>
            <form className="mt-6 flex w-full max-w-md gap-2 md:mt-0">
              <input
                type="email"
                required
                placeholder="Email address"
                className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-bg px-4 text-sm text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <button className="h-12 rounded-xl bg-primary px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-hover">
                Join
              </button>
            </form>
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
