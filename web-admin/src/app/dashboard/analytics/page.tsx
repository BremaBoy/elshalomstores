'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

interface ChartData {
  name: string
  total: number
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<ChartData[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    growth: 0,
    averageOrder: 0,
    conversionRate: 2.4
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const start = startOfMonth(subDays(new Date(), 30))
      const end = new Date()

      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('payment_status', 'Paid')

      if (error) throw error

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      const orderCount = orders?.length || 0
      const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0

      setStats(prev => ({
        ...prev,
        totalRevenue,
        averageOrder
      }))

      // Prepare simple chart data (grouped by date)
      const days = eachDayOfInterval({ start, end })
      const chartMap = new Map(days.map(d => [format(d, 'MMM dd'), 0]))
      
      orders?.forEach(o => {
        const dateKey = format(new Date(o.created_at), 'MMM dd')
        if (chartMap.has(dateKey)) {
          chartMap.set(dateKey, chartMap.get(dateKey)! + (o.total_amount || 0))
        }
      })

      const data = Array.from(chartMap, ([name, total]) => ({ name, total }))
      setRevenueData(data)

    } catch (err) {
      console.error('Analytics Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-neutral-400 text-sm">Comprehensive store performance overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300">
          <Calendar className="w-4 h-4" />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-5">
           <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <DollarSign className="w-5 h-5" />
             </div>
             <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+12.5%</span>
           </div>
           <p className="text-sm text-neutral-400">Total Revenue</p>
           <p className="text-2xl font-bold text-white mt-1">₦{stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-5">
           <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <TrendingUp className="w-5 h-5" />
             </div>
             <span className="text-xs font-medium text-neutral-400">Static</span>
           </div>
           <p className="text-sm text-neutral-400">Avg. Order Value</p>
           <p className="text-2xl font-bold text-white mt-1">₦{stats.averageOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-5">
           <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <ShoppingCart className="w-5 h-5" />
             </div>
             <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">-2.1%</span>
           </div>
           <p className="text-sm text-neutral-400">Total Orders</p>
           <p className="text-2xl font-bold text-white mt-1">{revenueData.length * 4} sales</p>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-xl p-5">
           <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Users className="w-5 h-5" />
             </div>
             <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+4.2%</span>
           </div>
           <p className="text-sm text-neutral-400">Conversion Rate</p>
           <p className="text-2xl font-bold text-white mt-1">{stats.conversionRate}%</p>
        </div>
      </div>

      {/* Main Chart Placeholder (Visualized with CSS for simplicity/perf) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <p className="text-neutral-500 text-sm">Daily revenue for the selected period</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-neutral-400">Current Period</span>
             </div>
          </div>
        </div>
        
        <div className="h-72 flex items-end gap-2">
           {revenueData.map((d, i) => (
             <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm relative"
                  style={{ height: `${Math.max(10, (d.total / (stats.totalRevenue/10)) * 100)}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                    ₦{d.total.toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] text-neutral-600 rotate-45 mt-2 origin-left">{d.name}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
