"use client";

import { Container } from "@/components/ui/Container";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import type { Brand } from "@/products/getHomepageData";

// Import Swiper styles
import "swiper/css";

export const BrandSliderClient = ({ brands }: { brands: Brand[] }) => {
  return (
    <section className="py-16 border-y border-border bg-white">
      <Container>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={40}
          slidesPerView={2}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
          }}
          className="brand-slider"
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div className="flex items-center justify-center h-24 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer group">
                {brand.logo_url ? (
                  <div className="relative h-14 w-28 group-hover:scale-110 transition-transform">
                    <Image 
                      src={brand.logo_url} 
                      alt={brand.name} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{brand.logo_icon || '🏢'}</span>
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{brand.name}</span>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
};
