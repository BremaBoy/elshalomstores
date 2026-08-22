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
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
]

const superAdminLinks = [
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
        'flex flex-col h-screen bg-[#183B5D] text-white border-r border-[#183B5D] transition-all duration-300 relative z-20 shadow-2xl shadow-blue-950/20',
        isSidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/15', !isSidebarOpen && 'justify-center px-2')}>
        <div className="w-9 h-9 rounded-xl bg-gold-soft flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10">
          <Store className="w-4 h-4 text-[#183B5D]" />
        </div>
        {isSidebarOpen && (
          <span className="font-bold text-white text-sm leading-tight">
            Elshalom<br /><span className="text-[#F3E2B8] text-xs font-medium">Storehouse</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {isSidebarOpen && (
          <p className="text-xs text-white/80 uppercase tracking-wider px-3 mb-2 font-medium">Main</p>
        )}
        
        {/* Dynamic Dashboard Link */}
        <Link
          href={isSuperAdmin ? '/dashboard/superadmin' : '/dashboard/admin'}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
            (pathname === '/dashboard/admin' || pathname === '/dashboard/superadmin')
              ? 'bg-[#FFF9EC] text-[#183B5D] shadow-lg shadow-black/15'
              : 'text-white/75 hover:text-white hover:bg-white/10',
            !isSidebarOpen && 'justify-center px-2'
          )}
          title={!isSidebarOpen ? 'Dashboard' : undefined}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          {isSidebarOpen && <span>Dashboard</span>}
        </Link>

        {adminLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-[#FFF9EC] text-[#183B5D] shadow-lg shadow-black/15'
                : 'text-white/75 hover:text-white hover:bg-white/10',
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
              <p className="text-xs text-[#F3E2B8] uppercase tracking-wider px-3 mt-4 mb-2 font-medium">Super Admin</p>
            )}
            {!isSidebarOpen && <div className="border-t border-white/15 my-2" />}
            {superAdminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-[#FFF9EC] text-[#183B5D] shadow-lg shadow-black/15'
                    : 'text-white/75 hover:text-white hover:bg-white/10',
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
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-gold-soft border border-gold shadow-sm flex items-center justify-center text-[#183B5D] hover:bg-white transition-colors"
        aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  )
}
