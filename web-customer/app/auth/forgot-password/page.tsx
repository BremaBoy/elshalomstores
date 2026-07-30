"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    setLoading(false);
    if (resetError) setError(resetError.message);
    else setMessage("Check your email for a secure password-reset link.");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <ThemeToggle className="absolute right-6 top-6 border border-border bg-card" />
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-xl md:p-10">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <h1 className="mt-8 text-3xl font-black uppercase tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm text-text-secondary">We’ll email you a secure link to choose a new password.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Email address</span>
            <span className="relative block">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-14 w-full rounded-2xl border border-border bg-bg pl-12 pr-5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </span>
          </label>
          {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}
          {message && <p role="status" className="text-sm font-medium text-emerald-500">{message}</p>}
          <Button disabled={loading} className="h-14 w-full rounded-2xl">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
      </div>
    </main>
  );
}
