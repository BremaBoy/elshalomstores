"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { authService } from "@/lib/auth-service";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await authService.register({ name, email, password });
      router.push(redirectParams || "/profile");
      router.refresh();
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900">
      {/* Form Side */}
      <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white dark:bg-slate-950 order-2 md:order-1">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-slate-500 font-medium tracking-wide">Join thousands of happy shoppers today</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  required
                  className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  required
                  className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters" 
                  required
                  className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <Button disabled={isLoading} className="w-full h-14 text-lg rounded-2xl font-extrabold uppercase tracking-widest group shadow-xl shadow-primary/20">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500">
            Already have an account? <Link href="/auth/login" className="font-bold text-primary hover:underline">Sign in instead</Link>
          </p>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden order-1 md:order-2">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary/80 to-indigo-900 opacity-90" />
        <div className="absolute inset-0 p-16 flex flex-col justify-between text-white z-10 text-right">
          <Link href="/">
            <span className="text-3xl font-bold tracking-tight">ELSHALOM<span className="text-indigo-200">STORES</span></span>
          </Link>
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight uppercase tracking-tighter">
              Start Your <br /> Journey.
            </h1>
            <p className="text-xl text-indigo-100/80 ml-auto max-w-md leading-relaxed">
              Create an account to gain exclusive access to deals, track orders in real-time, and manage your wishlist.
            </p>
          </div>
          <div className="flex items-center justify-end gap-4 text-indigo-200/50">
            <span className="text-xs font-bold uppercase tracking-widest">Premium Customer Experience</span>
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
    </main>
  );
}

import { Suspense } from 'react';
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><p>Loading...</p></div>}>
      <RegisterContent />
    </Suspense>
  )
}
