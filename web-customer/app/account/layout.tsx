import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

import { createServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login?redirect=/account/orders");
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <AccountSidebar user={user} />
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
