'use client'

import { useState } from 'react'
import { User, Mail, Shield, Lock, Save, Camera, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/useStore'
import { supabaseAuth } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage(null)

    try {
      const { error } = await supabaseAuth.auth.updateUser({
        data: { name: formData.name }
      })

      if (error) throw error

      // Also update the admins table for persistence
      const { error: dbError } = await supabaseAuth
        .from('admins')
        .update({ name: formData.name })
        .eq('id', user?.id)

      if (dbError) throw dbError

      setUser({ ...user!, name: formData.name })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-purple-900/40 relative z-10">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors z-20 shadow-lg group-hover:scale-110">
              <Camera className="w-4 h-4" />
            </button>
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 group-hover:bg-primary/30 transition-colors" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{user?.name}</h1>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                 {user?.role?.replace('_', ' ')}
               </span>
               <span className="text-neutral-500 text-xs">• Joined 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Information
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                }`}>
                  {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-900/30 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </section>

          <section className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security & Password
            </h3>
            <p className="text-sm text-neutral-400 mb-6">Keep your account secure by changing your password periodically or if you suspect any unauthorized access.</p>
            <button className="px-6 py-2.5 bg-neutral-800 border border-neutral-700 text-white rounded-xl font-bold text-sm hover:bg-neutral-700 transition-all">
              Change Account Password
            </button>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Account Status</h4>
              <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-green-500">Fully Verified</span>
              </div>
              
              <div className="mt-6 space-y-4">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">MFA Status</span>
                    <span className="text-red-500 font-bold uppercase">Disabled</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Last Login</span>
                    <span className="text-white font-medium">Just now</span>
                 </div>
              </div>
           </section>

           <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-2 mb-2">
                 <Shield className="w-4 h-4 text-purple-500" />
                 <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Permissions</h4>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                 As a {user?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'}, you have {user?.role === 'SUPER_ADMIN' ? 'unrestricted' : 'standard admin'} access to all store modules, financial reports, and system settings.
              </p>
           </section>
        </div>
      </div>
    </div>
  )
}
