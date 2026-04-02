'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

import { supabase, supabaseAuth } from '@/lib/supabase'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Out for Delivery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded']

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(name, email)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const { data: { session } } = await supabaseAuth.auth.getSession()
      
      const res = await fetch(`${apiUrl}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    } catch (err: any) {
      alert(`Update failed: ${err.message}`)
    }
  }

  const filtered = orders.filter(o => {
    const customerMatch = o.users?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          o.id.toLowerCase().includes(search.toLowerCase())
    const statusMatch = statusFilter ? o.status === statusFilter : true
    return customerMatch && statusMatch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} orders total</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center flex-wrap shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order ID or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left bg-muted/40">
                <th className="px-5 py-3.5 font-medium">Order ID</th>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Items</th>
                <th className="px-5 py-3.5 font-medium">Amount</th>
                <th className="px-5 py-3.5 font-medium">Payment</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-primary text-[10px] uppercase truncate max-w-[100px]" title={order.id}>#{order.id.split('-')[0]}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium">{order.users?.name || 'Guest'}</div>
                    <div className="text-[10px] text-muted-foreground">{order.users?.email || 'N/A'}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {Array.isArray(order.items) ? order.items.length : 'Multiple'} items
                  </td>
                  <td className="px-5 py-4 font-semibold">₦{order.total_amount?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-muted-foreground uppercase text-[10px]">{order.payment_method}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{format(new Date(order.created_at), 'MMM dd, yyyy')}</td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="text-[10px] px-2 py-1 rounded-lg border border-input bg-background focus:outline-none cursor-pointer font-bold uppercase"
                    >
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
