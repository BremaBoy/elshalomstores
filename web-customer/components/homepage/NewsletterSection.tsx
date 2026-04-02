import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const NewsletterSection = () => {
  return (
    <section className="py-24 bg-card">
      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 bg-white p-10 md:p-20 rounded-[4rem] shadow-2xl shadow-black/5 border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="space-y-6 text-center lg:text-left relative z-10">
            <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-[2rem] mx-auto lg:mx-0 shadow-inner">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary leading-none uppercase tracking-tighter">
              Join the <br /> Elshalom Elite
            </h2>
            <p className="text-text-secondary text-lg max-w-md font-medium leading-relaxed">
              Unlock exclusive early access, personalized curation, and members-only priveleges.
            </p>
          </div>
 
          <div className="w-full max-w-md relative z-10">
            <form className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Official Email Address"
                  required
                  className="w-full h-16 bg-card border-2 border-border rounded-2xl px-8 outline-none focus:border-primary transition-all font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                />
              </div>
              <Button className="h-16 w-full rounded-2xl font-black uppercase tracking-[0.2em] gap-3 text-xs shadow-xl shadow-primary/20">
                Secure Invitation <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-text-secondary/50 text-center lg:text-left">
              By subscribing, you agree to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};
