"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/cartStore";

function VerifyContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  
  const reference = searchParams.get("reference") || searchParams.get("tx_ref");
  const gateway = searchParams.get("gateway");
  const transactionId = searchParams.get("transaction_id"); // Flutterwave often sends this

  useEffect(() => {
    const verify = async () => {
      if (!reference || !gateway) {
        setStatus("error");
        setMessage("Invalid verification parameters.");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setStatus("error");
          setMessage("Your session expired. Please sign in and try again.");
          return;
        }
        const response = await axios.get(`/api/payments/${gateway}/verify/${reference}`, {
            params: { transaction_id: transactionId },
            headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (response.data.status === "success" || response.data.status === "successful") {
          clearCart();
          setStatus("success");
          setMessage("Your payment was successful! We are now processing your order.");
        } else {
          setStatus("error");
          setMessage(`Payment verification failed. Status: ${response.data.status}`);
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(error.response?.data?.message || "An error occurred during verification.");
      }
    };

    verify();
  }, [reference, gateway, transactionId, clearCart]);

  return (
    <main className="pt-32 pb-20 min-h-screen bg-bg text-text-primary flex flex-col">
      <Container className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full bg-card rounded-3xl p-10 shadow-xl shadow-black/10 border border-border text-center space-y-8">
          {status === "loading" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Verifying Payment</h1>
              <p className="text-text-secondary font-medium">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Payment Successful!</h1>
              <p className="text-text-secondary font-medium">{message}</p>
              <div className="pt-4 space-y-3">
                <Link href="/profile">
                  <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    View Your Orders
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="ghost" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                    Continue Shopping
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Payment Failed</h1>
              <p className="text-text-secondary font-medium">{message}</p>
              <div className="pt-4 space-y-3">
                <Link href="/checkout">
                  <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    Try Again
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg text-text-primary"><p>Loading verification system...</p></div>}>
        <VerifyContent />
      </Suspense>
      <Footer />
    </>
  );
}
