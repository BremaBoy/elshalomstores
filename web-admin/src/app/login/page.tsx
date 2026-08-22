'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseAuth } from '@/lib/supabase'
import { useAuthStore } from '@/store/useStore'
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabaseAuth.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      // Fetch admin profile from admins table
      const { data: profile, error: profileError } = await supabaseAuth
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        console.error('Admin Profile Fetch Error:', profileError || 'No profile found')
        setError(profileError?.message || 'Access denied. You are not registered as an admin.')
        await supabaseAuth.auth.signOut()
        return
      }

      // Update user metadata with role for middleware access
      try {
        await supabaseAuth.auth.updateUser({
          data: { role: profile.role }
        })
        // Refresh session to ensure the cookie contains the new metadata
        await supabaseAuth.auth.refreshSession()
      } catch (metaError) {
        console.error('Metadata update failed:', metaError)
        // We continue even if metadata update fails, as the local store is set
      }

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'ADMIN' | 'SUPER_ADMIN',
        status: profile.status,
      })

      // Small delay to ensure cookies are written
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-gold via-lilac to-primary" />
      <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-lilac/70 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-blue-soft/80 blur-3xl" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-border bg-card/95 p-8 shadow-2xl shadow-primary/10 backdrop-blur md:p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-primary/25 ring-4 ring-gold-soft">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Elshalom Storehouse</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <a href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#244A70] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Elshalomstores Admin Panel &bull; Authorized access only
        </p>
      </div>
    </div>
  )
}
