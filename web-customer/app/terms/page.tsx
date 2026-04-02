import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter">Terms of Service</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Last Updated: March 2024</p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">1. Agreement to Terms</h2>
                <p className="text-slate-500 leading-relaxed font-medium">By accessing or using our services, you agree to be bound by these Terms of Service and all terms incorporated by reference. If you do not agree to all of these terms, do not use our services.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">2. Changes to Terms</h2>
                <p className="text-slate-500 leading-relaxed font-medium">We reserve the right to modify these Terms at any time. If we make changes, we will provide notice of such changes, such as by sending an email or providing notice through our services. Your continued use of the services after the modified Terms become effective signifies your acceptance of the changes.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">3. User Accounts</h2>
                <p className="text-slate-500 leading-relaxed font-medium">To use certain features of our services, you must create an account. You agree to provide accurate, current and complete information during the registration process and to update such information to keep it accurate, current and complete.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-tight">4. Prohibited Conduct</h2>
                <p className="text-slate-500 leading-relaxed font-medium">You agree not to use the services for any purpose that is prohibited by these Terms or by law. You are responsible for all of your activity in connection with the services.</p>
              </section>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
