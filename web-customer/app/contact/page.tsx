import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Suspense } from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <SectionTitle 
              title="Get in Touch" 
              subtitle="Have questions? We're here to help. Send us a message and we'll respond as soon as possible." 
              align="center"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
              <div className="lg:col-span-1 space-y-8">
                <div className="p-8 bg-card rounded-[40px] border border-border shadow-xl space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Email Us</p>
                      <p className="font-bold text-text-primary">support@elshalomstores.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Call Us</p>
                      <a href="tel:+2348023980907" className="font-bold text-text-primary hover:text-primary">+2348023980907</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Visit Us</p>
                      <p className="font-bold text-text-primary">199, Igbe Road, Ikorodu, Lagos</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-primary text-white rounded-[40px] shadow-2xl shadow-primary/20 space-y-4">
                    <h4 className="text-xl font-extrabold uppercase tracking-tight text-gold-soft">Working Hours</h4>
                    <div className="space-y-2 text-sm text-white/75">
                        <div className="flex justify-between"><span>Mon - Fri</span><span>9:00 - 18:00</span></div>
                        <div className="flex justify-between"><span>Saturday</span><span>10:00 - 16:00</span></div>
                        <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
                    </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-card p-8 md:p-12 rounded-[48px] border border-border shadow-xl">
                <Suspense fallback={<p className="text-sm text-text-secondary">Loading contact form…</p>}>
                  <ContactForm />
                </Suspense>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
