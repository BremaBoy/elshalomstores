'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, Sun, Moon, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useUIStore, useAuthStore } from '@/store/useStore'
import { supabaseAuth } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function Header() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUIStore()
  const { user, setUser } = useAuthStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabaseAuth.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      {/* Mobile menu & sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products, orders..."
          className={cn(
            'w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-transparent',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-border hover:bg-accent/50 p-1 rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-purple-900/20 group-hover:scale-105 transition-transform">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none text-foreground">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</p>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isProfileOpen && "rotate-180")} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
               <div className="p-3 border-b border-neutral-800 bg-black/20">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate mt-1">{user?.email}</p>
               </div>
               <div className="p-1.5">
                  <button 
                    onClick={() => { setIsProfileOpen(false); router.push('/dashboard/settings') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <User className="w-4 h-4 text-neutral-500 group-hover:text-primary transition-colors" />
                    <span>View Profile</span>
                  </button>
                  <button 
                    onClick={() => { setIsProfileOpen(false); router.push('/dashboard/settings') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <Settings className="w-4 h-4 text-neutral-500 group-hover:text-primary transition-colors" />
                    <span>Settings</span>
                  </button>
               </div>
               <div className="p-1.5 border-t border-neutral-800 bg-red-500/5">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors group"
                  >
                    <LogOut className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" />
                    <span className="font-semibold">Sign Out</span>
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
