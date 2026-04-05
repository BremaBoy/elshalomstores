'use client'

import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle, Clock, DollarSign, BarChart3, Layers, Award } from 'lucide-react'
import { useAuthStore } from '@/store/useStore'
import { supabaseAuth } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fetchDashboardStats } from '@/app/actions/dashboardActions'

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  change?: string
  changeType?: 'up' | 'down'
  color?: string
}

function StatCard({ title, value, icon: Icon, change, changeType, color = 'bg-primary/10 text-primary' }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {change && (
          <p className={`text-xs mt-1 ${changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {changeType === 'up' ? '↑' : '↓'} {change} this month
          </p>
        )}
      </div>
    </div>
  )
}

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Out for Delivery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    outOfStock: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const result: any = await fetchDashboardStats()
      if (!result.success) throw new Error(result.error)

      setStats(result.stats)
      setRecentOrders(result.recentOrders)
    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const coreStats = [
    { title: 'Total Revenue', value: `₦${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { title: 'Total Orders', value: stats.orders.toString(), icon: ShoppingCart, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'Total Customers', value: stats.customers.toString(), icon: Users, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { title: 'Total Products', value: stats.products.toString(), icon: Package, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { title: 'Out of Stock', value: stats.outOfStock.toString(), icon: AlertTriangle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { title: 'Pending Orders', value: stats.pendingOrders.toString(), icon: Clock, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Core Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coreStats.map(stat => <StatCard key={stat.title} {...stat} />)}
      </div>

      {/* Super Admin Financial Widgets */}
      {isSuperAdmin && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Financial Health (Super Admin)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Net Profit (EST)</p>
              <p className="text-2xl font-black text-foreground mt-1">₦{(stats.revenue * 0.85).toLocaleString()}</p>
              <span className="text-[10px] text-green-500 font-bold">15% Margin Applied</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Platform Fees</p>
              <p className="text-2xl font-black text-foreground mt-1">₦{(stats.revenue * 0.05).toLocaleString()}</p>
              <span className="text-[10px] text-primary font-bold">5% Processing Fee</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Orders</h2>
          <a href="/dashboard/orders" className="text-sm text-primary hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-primary text-[10px] uppercase truncate max-w-[100px]" title={order.id}>#{order.id.split('-')[0]}</td>
                  <td className="px-5 py-3.5">{order.users?.name || 'Guest'}</td>
                  <td className="px-5 py-3.5 font-semibold">₦{order.total_amount?.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{format(new Date(order.created_at), 'MMM dd, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
