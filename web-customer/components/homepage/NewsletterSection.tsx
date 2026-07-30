import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const NewsletterSection = () => {
  return (
    <section className="py-24 md:py-32 bg-primary/10">
      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 bg-secondary text-white p-10 md:p-20 rounded-[3rem] shadow-2xl shadow-black/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="space-y-6 text-center lg:text-left relative z-10">
            <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-[2rem] mx-auto lg:mx-0 shadow-inner">
              <Mail className="h-8 w-8 text-violet-300" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter">
              The good stuff, <br /> straight to you.
            </h2>
            <p className="text-white/65 text-lg max-w-md font-medium leading-relaxed">
              New drops, useful ideas, and subscriber-only offers. No noise—promise.
            </p>
          </div>
 
          <div className="w-full max-w-md relative z-10">
            <form className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  className="w-full h-16 bg-white/10 border border-white/20 rounded-full px-8 outline-none focus:border-violet-300 transition-all font-bold text-white placeholder:text-white/50"
                />
              </div>
              <Button className="h-16 w-full rounded-full font-black uppercase tracking-[0.2em] gap-3 text-xs shadow-xl shadow-black/20">
                Keep me in the loop <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center lg:text-left">
              By subscribing, you agree to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};
