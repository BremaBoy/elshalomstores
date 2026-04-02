import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter">Privacy Policy</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Last Updated: March 2024</p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">1. Information We Collect</h2>
                <p className="text-slate-500 leading-relaxed font-medium">We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">2. How We Use Your Information</h2>
                <p className="text-slate-500 leading-relaxed font-medium">We use the information we collect to provide, maintain, and improve our services, such as to facilitate payments, send receipts, provide products and services you request, and send related information, including confirmations and invoices.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">3. Data Security</h2>
                <p className="text-slate-500 leading-relaxed font-medium">We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no security system is impenetrable and we cannot guarantee the security of our data.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">4. Cookies</h2>
                <p className="text-slate-500 leading-relaxed font-medium">We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users of our services. This helps us to provide you with a good experience when you browse our services and also allows us to improve our services.</p>
              </section>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
