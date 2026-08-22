"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Password must contain at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) setError(updateError.message);
    else router.replace("/profile");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-gold via-lilac to-primary" />
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-xl shadow-primary/10 md:p-10">
        <h1 className="text-3xl font-black uppercase tracking-tight">Choose a new password</h1>
        <p className="mt-2 text-sm text-text-secondary">Use at least eight characters.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          {[
            { label: "New password", value: password, setter: setPassword },
            { label: "Confirm password", value: confirmPassword, setter: setConfirmPassword },
          ].map((field) => (
            <label key={field.label} className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">{field.label}</span>
              <span className="relative block">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
                <input required minLength={8} type="password" value={field.value} onChange={(event) => field.setter(event.target.value)} className="h-14 w-full rounded-2xl border border-border bg-bg pl-12 pr-5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </span>
            </label>
          ))}
          {error && <p role="alert" className="text-sm font-medium text-red-500">{error}</p>}
          <Button disabled={loading} className="h-14 w-full rounded-2xl">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
