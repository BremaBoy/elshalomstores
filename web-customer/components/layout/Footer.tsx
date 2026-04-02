import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/shop" },
      { name: "Featured Products", href: "/shop?featured=true" },
      { name: "New Arrivals", href: "/shop?new=true" },
      { name: "Categories", href: "/categories" },
    ],
    customerService: [
      { name: "Track Order", href: "/profile" },
      { name: "Return Policy", href: "/returns" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact Us", href: "/contact" },
      { name: "FAQs", href: "/faqs" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  };

  return (
    <footer className="bg-card pt-20 pb-10 border-t border-border">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-8">
            <Link href="/" className="inline-block group">
              <span className="text-3xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform inline-block">
                ELSHALOM<span className="text-secondary">STORES</span>
              </span>
            </Link>
            <p className="text-text-secondary text-base leading-relaxed max-w-xs">
              Your one-stop shop for premium quality products. We handpick the best selection of electronics, fashion, and home essentials just for you.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-11 w-11 rounded-xl border border-border flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-1 transition-all shadow-sm"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="font-black text-text-primary uppercase tracking-widest text-[10px]">Shop Collection</h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-text-secondary text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-8">
            <h4 className="font-black text-text-primary uppercase tracking-widest text-[10px]">Customer Service</h4>
            <ul className="space-y-4">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-text-secondary text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="font-black text-text-primary uppercase tracking-widest text-[10px]">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <span className="text-text-secondary text-sm font-medium leading-relaxed">123 E-commerce St, Shopping District, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <span className="text-text-secondary text-sm font-bold tracking-tight">+234 800 123 4567</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <span className="text-text-secondary text-sm font-bold tracking-tight">support@elshalomstores.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-secondary text-xs font-bold uppercase tracking-widest text-center">
            &copy; {currentYear} Elshalomstores. Built for excellence.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-text-secondary text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-text-secondary text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
