'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, BarChart2,
  Warehouse, CreditCard, Truck, Ticket, Star, Shield, Settings,
  Activity, ChevronLeft, ChevronRight, Store
} from 'lucide-react'
import { useUIStore, useAuthStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const adminLinks = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
]

const superAdminLinks = [
  { href: '/dashboard/superadmin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/shipments', label: 'Shipments', icon: Truck },
  { href: '/dashboard/coupons', label: 'Coupons', icon: Ticket },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/admins', label: 'Admins', icon: Shield },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/activity-logs', label: 'Activity Logs', icon: Activity },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-border transition-all duration-300 relative z-20',
        'bg-neutral-950 dark:bg-neutral-950',
        isSidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', !isSidebarOpen && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        {isSidebarOpen && (
          <span className="font-bold text-white text-sm leading-tight">
            Elshalom<br /><span className="text-purple-400 text-xs font-medium">Admin</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {isSidebarOpen && (
          <p className="text-xs text-neutral-500 uppercase tracking-wider px-3 mb-2 font-medium">Main</p>
        )}
        {adminLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-primary text-white shadow-lg shadow-purple-900/30'
                : 'text-neutral-400 hover:text-white hover:bg-white/5',
              !isSidebarOpen && 'justify-center px-2'
            )}
            title={!isSidebarOpen ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span>{label}</span>}
          </Link>
        ))}

        {isSuperAdmin && (
          <>
            {isSidebarOpen && (
              <p className="text-xs text-neutral-500 uppercase tracking-wider px-3 mt-4 mb-2 font-medium">Super Admin</p>
            )}
            {!isSidebarOpen && <div className="border-t border-white/10 my-2" />}
            {superAdminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-primary text-white shadow-lg shadow-purple-900/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5',
                  !isSidebarOpen && 'justify-center px-2'
                )}
                title={!isSidebarOpen ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {isSidebarOpen && <span>{label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
      >
        {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  )
}
