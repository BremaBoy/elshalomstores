"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { HeroSlide } from "@/products/getHomepageData";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const fallbackSlides: HeroSlide[] = [
  {
    id: "elshalom-edit",
    title: "Good things, chosen for real life.",
    subtitle: "Useful finds, everyday essentials, and thoughtful gifts without the endless scrolling.",
    image_url: "/elshalom-og.png",
    link: "/shop",
    badge: "The Elshalom edit",
    cta_text: "Shop the collection",
  },
  {
    id: "home-refresh",
    title: "Small upgrades. Better everyday living.",
    subtitle: "Discover practical homeware and feel-good essentials selected with care.",
    image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=85&w=1600",
    link: "/shop?category=home-decor",
    badge: "For home and beyond",
    cta_text: "Discover home finds",
  },
  {
    id: "gift-worthy",
    title: "Gift-worthy finds for every kind of moment.",
    subtitle: "Thoughtful picks that feel special, useful, and easy to love.",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=85&w=1600&auto=format&fit=crop",
    link: "/shop?category=gifts",
    badge: "Made for giving",
    cta_text: "Shop gifts",
  },
];

export const HeroSliderClient = ({ slides: initialSlides }: { slides: HeroSlide[] }) => {
  const slides = initialSlides.length > 0 ? initialSlides : fallbackSlides;
  const hasMultipleSlides = slides.length > 1;

  return (
    <div className="marketplace-hero-frame relative h-[480px] w-full overflow-hidden rounded-[2rem] border border-border bg-primary shadow-[0_22px_60px_rgba(116,81,143,0.2)] sm:h-[520px]">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        pagination={{ clickable: true, el: ".marketplace-hero-pagination" }}
        autoplay={hasMultipleSlides ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false } : false}
        speed={700}
        effect="fade"
        loop={hasMultipleSlides}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <Image
                src={slide.image_url || fallbackSlides[0].image_url}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#4A315F]/95 via-[#4A315F]/76 to-[#4A315F]/12" />
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#4A315F]/72 to-transparent" />

              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center p-7 text-white sm:p-10 min-[700px]:p-7 xl:p-12">
                <span className="flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-gold-soft backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  {slide.badge || "Curated by Elshalom"}
                </span>
                <h1 className="mt-6 max-w-xl text-4xl font-black leading-[.96] tracking-[-.05em] sm:text-5xl min-[700px]:text-4xl xl:text-[3.5rem]">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.link || "/shop"}
                  className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-gold-soft px-6 text-[10px] font-black uppercase tracking-[.16em] text-text-primary shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {slide.cta_text || "Shop now"} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="marketplace-hero-pagination absolute bottom-5 left-7 z-20 !flex !w-auto items-center gap-2 sm:left-10" />
    </div>
  );
};
