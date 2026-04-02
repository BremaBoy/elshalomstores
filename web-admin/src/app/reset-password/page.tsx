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
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if we have an active session (from the reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      if (!session) {
        setError('Your reset link has expired or is invalid. Please request a new one.')
      }
    }
    checkSession()
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-purple-900/40">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">New Password</h1>
          <p className="text-sm text-neutral-400 mt-1">Set a secure password for your account</p>
        </div>

        {isSuccess ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Password Updated</h3>
              <p className="text-neutral-400 text-sm mt-1">
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
              <label className="text-sm font-medium text-neutral-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-300">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || (error ? error.includes('expired') : false)}
              className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
