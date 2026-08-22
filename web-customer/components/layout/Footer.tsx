import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
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
    <footer className="relative overflow-hidden bg-primary pt-20 pb-10 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lilac/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-gold-soft/10 blur-3xl" />
      <Container>
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-8">
            <Link href="/" className="inline-block group">
              <span className="text-3xl font-black text-white tracking-[-.06em] group-hover:scale-105 transition-transform inline-block">
                ELSHALOM<span className="text-gold-soft">/</span>STORES
              </span>
            </Link>
            <p className="text-white/75 text-base leading-relaxed max-w-xs">
              Thoughtful products for better everyday living—selected with care and delivered across Nigeria.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="font-black text-gold-soft uppercase tracking-widest text-[10px]">Shop Collection</h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/75 text-sm font-bold hover:text-gold-soft transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-gold-soft/40 rounded-full group-hover:bg-gold-soft transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-8">
            <h4 className="font-black text-gold-soft uppercase tracking-widest text-[10px]">Customer Service</h4>
            <ul className="space-y-4">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/75 text-sm font-bold hover:text-gold-soft transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-gold-soft/40 rounded-full group-hover:bg-gold-soft transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="font-black text-gold-soft uppercase tracking-widest text-[10px]">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-gold-soft" />
                </div>
                    <span className="text-white/75 text-sm font-medium leading-relaxed">199, Igbe Road, Ikorodu, Lagos</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-gold-soft" />
                </div>
                <a href="tel:+2348023980907" className="text-white/75 text-sm font-bold tracking-tight hover:text-gold-soft">+2348023980907</a>
              </li>
              <li className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-gold-soft" />
                </div>
                <span className="text-white/75 text-sm font-bold tracking-tight">support@elshalomstores.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative pt-10 border-t border-white/15 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest text-center">
            &copy; {currentYear} Elshalomstores. Built for excellence.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-white/80 text-[10px] font-black uppercase tracking-widest hover:text-gold-soft transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/80 text-[10px] font-black uppercase tracking-widest hover:text-gold-soft transition-colors">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
