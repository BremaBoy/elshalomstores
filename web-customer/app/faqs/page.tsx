import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function FAQPage() {
  const faqs = [
    { q: "How do I track my order?", a: "You can track your order in your profile dashboard under 'Recent Orders'." },
    { q: "Do you ship internationally?", a: "Currently, we only ship within Nigeria." },
    { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards via Paystack and Cash on Delivery." },
  ];

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            <SectionTitle title="Frequently Asked Questions" subtitle="Quick answers to common inquiries." />
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-lg">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-primary">{faq.q}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium italic">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
