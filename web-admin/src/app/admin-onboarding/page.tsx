'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Eye, EyeOff, Loader2, Store } from 'lucide-react'
import { completeAdminOnboarding } from '@/app/actions/onboardingActions'
import { supabaseAuth } from '@/lib/supabase'

export default function AdminOnboardingPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabaseAuth.auth.getUser().then(({ data }) => {
      const metadata = data.user?.user_metadata
      if (!data.user) router.replace('/login')
      else {
        setFullName(metadata?.full_name || metadata?.name || '')
        setPhone(metadata?.phone || '')
      }
    })
  }, [router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setIsSubmitting(true)
    const result = await completeAdminOnboarding({ fullName, phone, password })
    setIsSubmitting(false)
    if (!result.success) return setError(result.error || 'Unable to complete onboarding.')
    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Complete your admin profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">Set your profile details and password to finish accepting the invitation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <input value={fullName} onChange={event => setFullName(event.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone number <span className="text-muted-foreground">(optional)</span></label>
            <input value={phone} onChange={event => setPhone(event.target.value)} type="tel" className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Create password</label>
            <div className="relative">
              <input value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} minLength={8} required className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary" />
              <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm password</label>
            <input value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} type={showPassword ? 'text' : 'password'} minLength={8} required className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isSubmitting ? 'Completing profile…' : 'Complete onboarding'}
          </button>
        </form>
      </div>
    </main>
  )
}
