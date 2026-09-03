"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { HeroSlide } from "@/products/getHomepageData";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Temporary campaign images. The previous carousel configuration is commented
// out below for easy restoration.
const temporarySlides: HeroSlide[] = [
  {
    id: "five-years-of-grace",
    title: "Five years of grace",
    image_url: "/promos/hero/five-years-of-grace.jpeg",
  },
  {
    id: "cook-more-worry-less",
    title: "Cook more, worry less",
    image_url: "/promos/hero/cook-more-worry-less.jpeg",
  },
  {
    id: "website-launch",
    title: "Elshalomstores website launch",
    image_url: "/promos/hero/website-launch.jpeg",
  },
];

/* Previous carousel content — kept here for easy restoration.
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
*/

export const HeroSliderClient = () => {
  const slides = temporarySlides;
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
                src={slide.image_url}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              {/* The campaign artwork already contains its own messaging. */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="marketplace-hero-pagination absolute bottom-5 left-7 z-20 !flex !w-auto items-center gap-2 sm:left-10" />
    </div>
  );
};
