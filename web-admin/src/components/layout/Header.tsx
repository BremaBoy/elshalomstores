'use client'

import { Bell, Search, Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useUIStore, useAuthStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

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

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-muted-foreground">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
