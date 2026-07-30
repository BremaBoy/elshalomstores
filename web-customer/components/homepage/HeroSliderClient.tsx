"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HeroSlide } from "@/products/getHomepageData";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const fallbackSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Good finds. Great living.",
    subtitle: "Useful, beautiful things for your home, your pocket, and everyone on your list.",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
    link: "/shop?category=electronics",
    badge: "The Elshalom edit",
    cta_text: "Shop the collection"
  },
  {
    id: "2",
    title: "Little luxuries, every day.",
    subtitle: "Fresh homeware, memorable gifts, and feel-good essentials—chosen with care.",
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop",
    link: "/shop?category=home-decor",
    badge: "Made for real life",
    cta_text: "Discover what’s new"
  }
];

export const HeroSliderClient = ({ slides: initialSlides }: { slides: HeroSlide[] }) => {
  const slides = initialSlides.length > 0 ? initialSlides : fallbackSlides;

  return (
    <section className="relative min-h-[720px] h-[88vh] max-h-[900px] overflow-hidden bg-secondary">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        pagination={{ clickable: true, el: ".swiper-pagination-custom" }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        effect="fade"
        loop
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#11271e]/95 via-[#11271e]/70 to-[#11271e]/5 z-10" />
                <div className="absolute inset-0 z-10 opacity-20" style={{backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px"}} />
              </div>

              {/* Content */}
              <Container className="h-full relative z-20">
                <div className="flex flex-col justify-center h-full max-w-3xl text-white pt-20">
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <span className="eyebrow text-[#F4C95D] mb-8">
                      {slide.badge}
                    </span>
                    <h1 className="display-title mb-8 max-w-3xl">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-2xl text-white/75 mb-10 max-w-xl leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link href={slide.link || '/shop'}>
                        <Button variant="primary" className="h-14 px-9 rounded-full shadow-xl shadow-black/20 font-black uppercase tracking-[.16em] text-[11px]">
                          {slide.cta_text}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Container>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <div className="swiper-pagination-custom !relative !bottom-0 !w-auto !flex items-center gap-3" />
      </div>
    </section>
  );
};
