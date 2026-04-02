"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { HeroSlide } from "@/products/getHomepageData";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const demoSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Premium Tech Experience",
    subtitle: "Discover the latest in high-performance electronics and premium gadgets.",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
    link: "/shop?category=electronics",
    badge: "New Tech",
    cta_text: "Explore Tech"
  },
  {
    id: "2",
    title: "Modern Lifestyle Decor",
    subtitle: "Elevate your living space with our curated collection of aesthetic home pieces.",
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop",
    link: "/shop?category=home-decor",
    badge: "Home Style",
    cta_text: "Shop Decor"
  }
];

export const HeroSliderClient = ({ slides: _initialSlides }: { slides: HeroSlide[] }) => {
  const slides = demoSlides; // Prioritize demo slides as requested

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
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
                <div className="absolute inset-0 bg-black/30 z-10" />
              </div>

              {/* Content */}
              <Container className="h-full relative z-20">
                <div className="flex flex-col justify-center h-full max-w-2xl text-white">
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-6 border border-white/30">
                      {slide.badge}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-10 max-w-lg font-medium leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link href={slide.link || '/shop'}>
                        <Button variant="primary" className="h-12 px-10 rounded-full shadow-lg shadow-black/20">
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

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <div className="swiper-pagination-custom !relative !bottom-0 !w-auto !flex items-center gap-3" />
      </div>
    </section>
  );
};
