import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
                      <p className="font-bold text-text-primary">+234 800 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Visit Us</p>
                      <p className="font-bold text-text-primary">Victoria Island, Lagos, NG</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-slate-900 text-white rounded-[40px] shadow-2xl space-y-4">
                    <h4 className="text-xl font-extrabold uppercase tracking-tight text-primary">Working Hours</h4>
                    <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex justify-between"><span>Mon - Fri</span><span>9:00 - 18:00</span></div>
                        <div className="flex justify-between"><span>Saturday</span><span>10:00 - 16:00</span></div>
                        <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
                    </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-card p-8 md:p-12 rounded-[48px] border border-border shadow-xl">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Your Name</label>
                    <input type="text" placeholder="Full Name" className="w-full h-14 bg-bg border border-border rounded-2xl px-6 text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Email Address</label>
                    <input type="email" placeholder="email@example.com" className="w-full h-14 bg-bg border border-border rounded-2xl px-6 text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Subject</label>
                    <input type="text" placeholder="How can we help?" className="w-full h-14 bg-bg border border-border rounded-2xl px-6 text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Message</label>
                    <textarea rows={5} placeholder="Tell us more about your inquiry..." className="w-full p-6 bg-bg border border-border rounded-[28px] text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <Button className="w-full h-16 text-lg rounded-2xl font-extrabold uppercase tracking-widest gap-3">
                      Send Message
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
