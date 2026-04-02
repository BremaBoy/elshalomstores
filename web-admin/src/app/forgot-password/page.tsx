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
      const { error: resetError } = await supabaseAuth.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-purple-900/40">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-neutral-400 mt-1">Enter your email and we&apos;ll send you a link</p>
        </div>

        {isSent ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Check your email</h3>
              <p className="text-neutral-400 text-sm mt-1">
                We have sent a password reset link to <span className="text-white">{email}</span>.
              </p>
            </div>
            <a
              href="/login"
              className="block w-full py-2.5 rounded-lg border border-neutral-800 text-white text-sm hover:bg-neutral-800 transition-colors"
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
              <label className="text-sm font-medium text-neutral-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@elshalomstores.com.ng"
                className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <a
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors py-2"
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
