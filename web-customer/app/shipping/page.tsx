import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function ShippingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            <SectionTitle title="Shipping Information" subtitle="Everything you need to know about our delivery process." />
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
              <section className="space-y-4">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Delivery Times</h3>
                <p className="text-slate-500 leading-relaxed font-medium italic">Standard delivery usually takes 3-5 business days within Lagos and 5-7 business days for other states.</p>
              </section>
              <section className="space-y-4">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Shipping Costs</h3>
                <p className="text-slate-500 leading-relaxed font-medium italic">We offer free shipping on all orders over $50. For orders below this amount, a flat rate of $5 applies.</p>
              </section>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
