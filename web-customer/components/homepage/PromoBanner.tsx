import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const PromoBanner = () => {
  return (
    <section className="py-24">
      <Container>
        <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl group">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
            alt="Exclusive Promo"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent mix-blend-multiply" />
          
          <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-24 text-white max-w-3xl space-y-8">
            <div className="animate-in fade-in slide-in-from-left-4 duration-1000">
              <span className="inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/30">
                Exclusive Season Offer
              </span>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] uppercase tracking-tighter mb-6">
                Redefine Your <br /> Essentials
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-md font-medium leading-relaxed mb-8">
                Experience the pinnacle of premium craftsmanship. Use code <span className="font-black text-white bg-black px-2 py-1 rounded-lg">ELSHALOM30</span> for instant 30% discount.
              </p>
              <div>
                <Link href="/shop">
                  <Button variant="outline" className="h-14 px-10 text-sm font-black uppercase tracking-widest rounded-2xl border-2 border-white text-white hover:bg-white hover:text-black transition-all group-hover:shadow-2xl group-hover:shadow-white/20">
                    Claim Your Offer
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
