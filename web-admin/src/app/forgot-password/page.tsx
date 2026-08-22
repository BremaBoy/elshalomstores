'use client'

import { useState } from 'react'
import { supabase, supabaseAuth } from '@/lib/supabase'
import { Store, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 1. Validate if email exists in admins table
      const { data: exists, error: checkError } = await supabase.rpc('check_admin_exists', { 
        email_to_check: email 
      })
      
      if (checkError) throw checkError
      
      if (!exists) {
        setError('Account not found. Please contact a Super Admin.')
        setIsLoading(false)
        return
      }

      // 2. Request reset
      // Use the origin serving the admin app so preview/production deployments
      // cannot generate recovery links for a stale configured domain.
      const redirectUrl = window.location.origin.replace(/\/+$/, '')
      const { error: resetError } = await supabaseAuth.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectUrl}/auth/confirm`,
      })
      if (resetError) throw resetError
      setIsSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-gold via-lilac to-primary" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-2xl shadow-primary/10 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-primary/25 ring-4 ring-gold-soft">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your email and we&apos;ll send you a link</p>
        </div>

        {isSent ? (
          <div className="bg-blue-soft/50 border border-primary/15 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">Check your email</h3>
              <p className="text-muted-foreground text-sm mt-1">
                We have sent a password reset link to <span className="text-foreground">{email}</span>.
              </p>
            </div>
            <a
              href="/login"
              className="block w-full py-2.5 rounded-xl border border-primary/25 text-primary text-sm font-semibold hover:bg-blue-soft transition-colors"
            >
              Back to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@elshalomstores.com.ng"
                className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#244A70] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <a
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </a>
          </form>
        )}
      </div>
    </div>
  )
}
