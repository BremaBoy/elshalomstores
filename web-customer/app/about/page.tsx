import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ShieldCheck, Zap, Users, Globe, Target, Award } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Founded", value: "2023", icon: Target },
    { label: "Customers", value: "50k+", icon: Users },
    { label: "Products", value: "2k+", icon: Award },
    { label: "Support", value: "24/7", icon: Zap },
  ];

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto space-y-8 mb-24">
            <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-tight text-slate-900 dark:text-white">
              Redefining <br /> <span className="text-primary italic">Modern Commerce</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              Elshalomstores is more than just an e-commerce platform. We are a community-driven marketplace dedicated to bringing premium quality and exceptional value to every doorstep.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
            {stats.map((stat) => (
              <div key={stat.label} className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl text-center group hover:-translate-y-2 transition-transform duration-500">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="relative aspect-square rounded-[64px] overflow-hidden group shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                className="object-cover w-full h-full scale-110 group-hover:scale-100 transition-transform duration-1000" 
                alt="Our Team" 
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
            </div>
            
            <div className="space-y-8">
              <h2 className="text-4xl font-extrabold uppercase tracking-tighter">Our Mission & Vision</h2>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="shrink-0 h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Uncompromising Quality</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Every product in our store undergoes rigorous quality checks to ensure you receive only the best.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="shrink-0 h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Seamless Experience</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">From browsing to delivery, we've optimized every step to make your shopping journey effortless.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="shrink-0 h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Customer First</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Your satisfaction is our primary goal. Our support team is always ready to assist you.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="relative bg-slate-900 rounded-[56px] overflow-hidden p-12 md:p-24 text-center space-y-8 shadow-2xl">
            <div className="absolute top-0 right-0 h-96 w-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tighter">Ready to Start Shopping?</h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg">Join our growing community and experience the difference of premium service.</p>
                <div className="pt-4">
                    <Button className="h-16 px-12 text-lg rounded-2xl font-extrabold uppercase tracking-widest bg-white text-primary hover:bg-slate-100 shadow-xl shadow-white/5">
                        Browse Shop
                    </Button>
                </div>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
