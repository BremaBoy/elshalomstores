'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseAuth } from '@/lib/supabase'
import { Store, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLinkReady, setIsLinkReady] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const establishRecoverySession = async () => {
      const params = new URLSearchParams(window.location.search)
      const authError = params.get('error_description') || params.get('error')

      if (authError) {
        if (isMounted) {
          setError(
            authError.replace(/\+/g, ' ') ||
            'Your reset link has expired or is invalid. Please request a new one.'
          )
          setIsLinkReady(true)
        }
        return
      }

      const code = params.get('code')
      if (code) {
        const { error: exchangeError } =
          await supabaseAuth.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          if (isMounted) {
            setError('Your reset link has expired or is invalid. Please request a new one.')
            setIsLinkReady(true)
          }
          return
        }

        // Remove the one-time code so a refresh does not try to redeem it again.
        window.history.replaceState({}, '', window.location.pathname)
      }

      const { data: { session } } = await supabaseAuth.auth.getSession()
      if (isMounted) {
        if (!session) {
          setError('Your reset link has expired or is invalid. Please request a new one.')
        }
        setIsLinkReady(true)
      }
    }

    establishRecoverySession()
    return () => {
      isMounted = false
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabaseAuth.auth.updateUser({ password })
      if (updateError) throw updateError
      setIsSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password.')
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
          <h1 className="text-2xl font-bold text-foreground">New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Set a secure password for your account</p>
        </div>

        {isSuccess ? (
          <div className="bg-blue-soft/50 border border-primary/15 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">Password Updated</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Your password has been changed successfully. Redirecting to login...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
                className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isLinkReady || Boolean(error)}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {!isLinkReady ? 'Verifying Link...' : isLoading ? 'Updating...' : 'Reset Password'}
            </button>
            {error && (
              <a
                href="/forgot-password"
                className="block text-center text-sm text-primary hover:underline"
              >
                Request a new reset link
              </a>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
