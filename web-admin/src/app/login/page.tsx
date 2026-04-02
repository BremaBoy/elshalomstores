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

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'ADMIN' | 'SUPER_ADMIN',
        status: profile.status,
      })

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-purple-900/40">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Elshalom Admin</h1>
          <p className="text-sm text-neutral-400 mt-1">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-300">Password</label>
              <a href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-8">
          Elshalomstores Admin Panel &bull; Authorized access only
        </p>
      </div>
    </div>
  )
}
