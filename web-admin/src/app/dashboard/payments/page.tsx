'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search, Filter, Loader2, DollarSign, Wallet } from 'lucide-react'
import { fetchOrders } from '@/app/actions/orderActions'
import { format } from 'date-fns'

export default function PaymentsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const res = await fetchOrders()
      if (res.success && res.data) {
        setOrders(res.data)
      } else {
        throw new Error(res.error || 'Failed to fetch payments data')
      }
    } catch (err) {
      console.error('Payments Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.users?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = orders.filter(o => o.payment_status === 'Paid').reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const pendingRevenue = orders.filter(o => o.payment_status === 'Pending').reduce((sum, o) => sum + (o.total_amount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments & Transactions</h1>
          <p className="text-neutral-400 text-sm">Manage store revenue and payment processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 -mr-10 -mt-10 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
               <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-sm text-neutral-400 font-medium">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-white mb-2">₦{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
             <ArrowUpRight className="w-3 h-3" />
             +12% from last month
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 -mr-10 -mt-10 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
               <Wallet className="w-5 h-5" />
            </div>
            <p className="text-sm text-neutral-400 font-medium">Pending Payments</p>
          </div>
          <p className="text-3xl font-bold text-white mb-2">₦{pendingRevenue.toLocaleString()}</p>
          <p className="text-xs text-blue-400 font-medium">Processing 8 orders</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 -mr-10 -mt-10 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
               <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-sm text-neutral-400 font-medium">Payment Methods</p>
          </div>
          <p className="text-3xl font-bold text-white mb-2">Paystack / FW</p>
          <p className="text-xs text-neutral-400 font-medium">Active Gateways</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by order ID or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-neutral-950 text-neutral-500 font-medium border-b border-neutral-800 uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-mono text-[10px] text-primary uppercase font-bold truncate max-w-[120px]" title={o.id}>#{o.id.split('-')[0]}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{o.payment_method || 'Online Payment'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white text-xs">{o.users?.name || 'Guest'}</p>
                    <p className="text-[10px] text-neutral-500 truncate max-w-[150px]">{o.users?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">₦{o.total_amount?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      o.payment_status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                      o.payment_status === 'Failed' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {o.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 text-[11px] font-medium">
                    {format(new Date(o.created_at), 'MMM dd, yyyy · HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
