"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Mail, Lock, ShoppingBag, ArrowRight, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { authService } from "@/lib/auth-service";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
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
      await authService.login({ email, password });
      router.push(redirectParams || "/profile");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-indigo-900 opacity-90" />
        <div className="absolute inset-0 p-16 flex flex-col justify-between text-white z-10">
          <Link href="/">
            <span className="text-3xl font-bold tracking-tight">ELSHALOM<span className="text-indigo-200">STORES</span></span>
          </Link>
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight uppercase tracking-tighter">
              Welcome <br /> Back Home.
            </h1>
            <p className="text-xl text-indigo-100/80 max-w-md leading-relaxed">
              Login to access your personalized dashboard, track your orders, and enjoy a seamless shopping experience.
            </p>
          </div>
          <div className="flex items-center gap-4 text-indigo-200/50">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-widest">End-to-End Secure Authorization</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">Sign In</h2>
            <p className="text-slate-500 font-medium tracking-wide">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</label>
                <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full h-14 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <Button disabled={isLoading} className="w-full h-14 text-lg rounded-2xl font-extrabold uppercase tracking-widest group shadow-xl shadow-primary/20">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500">
            Don't have an account? <Link href="/auth/register" className="font-bold text-primary hover:underline">Sign up for free</Link>
          </p>
          
          <div className="pt-10 flex items-center justify-center gap-4 opacity-30 grayscale pointer-events-none">
            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-widest shrink-0">Supported By</span>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </main>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

import { Suspense } from 'react';
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 border"><p>Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}
