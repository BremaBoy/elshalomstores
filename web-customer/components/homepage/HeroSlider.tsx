import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getHeroSlides } from "@/products/getHomepageData";
import { HeroSliderClient } from "./HeroSliderClient";

export const HeroSlider = async () => {
  const slides = await getHeroSlides();

  if (slides.length === 0) {
    return (
      <section className="relative h-[400px] flex items-center justify-center bg-card">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">Welcome to Elshalomstores</h2>
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">New premium collection arriving soon!</p>
          <Link href="/shop">
            <Button className="rounded-full px-10">Start Exploring</Button>
          </Link>
        </div>
      </section>
    );
  }

  return <HeroSliderClient slides={slides} />;
};
