import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function ReturnsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            <SectionTitle title="Return Policy" subtitle="Not happy with your purchase? We've got you covered." />
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
              <section className="space-y-4">
                <h3 className="text-2xl font-bold uppercase tracking-tight">30-Day Returns</h3>
                <p className="text-slate-500 leading-relaxed font-medium italic">You can return any item within 30 days of purchase for a full refund or exchange, provided it's in its original condition.</p>
              </section>
              <section className="space-y-4">
                <h3 className="text-2xl font-bold uppercase tracking-tight">How to Return</h3>
                <p className="text-slate-500 leading-relaxed font-medium italic">Simply contact our support team at returns@elshalomstores.com with your order number and reason for return.</p>
              </section>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
