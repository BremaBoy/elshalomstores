'use client'

import { useState, useEffect } from 'react'
import { Search, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

// Dummy fallback data if API is not connected
const MOCK_PAYMENTS = [
  { id: '1', transactionId: 'TXN-099120', orderId: '#ORD-1042', customer: 'Adunola Fatimah', gateway: 'Paystack', amount: 24500, status: 'Successful', date: 'Mar 11, 2026' },
  { id: '2', transactionId: 'TXN-099121', orderId: '#ORD-1041', customer: 'Chukwuemeka Ike', gateway: 'Flutterwave', amount: 8200, status: 'Pending', date: 'Mar 11, 2026' },
  { id: '3', transactionId: 'TXN-099122', orderId: '#ORD-1040', customer: 'Blessing Osei', gateway: 'Paystack', amount: 15700, status: 'Successful', date: 'Mar 10, 2026' },
  { id: '4', transactionId: 'TXN-099123', orderId: '#ORD-1039', customer: 'Taiwo Adewale', gateway: 'Bank Transfer', amount: 3900, status: 'Failed', date: 'Mar 10, 2026' },
  { id: '5', transactionId: 'TXN-099124', orderId: '#ORD-1038', customer: 'Ngozi Okoye', gateway: 'Paystack', amount: 42000, status: 'Successful', date: 'Mar 9, 2026' },
  { id: '6', transactionId: 'TXN-099125', orderId: '#ORD-1037', customer: 'Emeka Nwachukwu', gateway: 'Flutterwave', amount: 11200, status: 'Refunded', date: 'Mar 8, 2026' },
]

const statusColors: Record<string, string> = {
  Successful: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

const ALL_STATUSES = ['Successful', 'Pending', 'Failed', 'Refunded']

export default function PaymentsPage() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // In a real app we would fetch:
  // useEffect(() => {
  //   fetch('/api/payments').then(res => res.json()).then(data => setPayments(data.data));
  // }, []);

  const filtered = payments.filter(p =>
    (p.transactionId.toLowerCase().includes(search.toLowerCase()) || 
     p.orderId.toLowerCase().includes(search.toLowerCase()) ||
     p.customer.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? p.status === statusFilter : true)
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
  }

  const totalRevenue = payments.filter(p => p.status === 'Successful').reduce((acc, curr) => acc + curr.amount, 0)
  // Dummy values for demo
  const dailyRevenue = 32700;
  const monthlyRevenue = 845000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments Monitor</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage all payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
             <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" /> All time
          </p>
        </div>
        
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Monthly Revenue</h3>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
             <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" /> +12.5% from last month
          </p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Daily Revenue</h3>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(dailyRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
             <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" /> -2% from yesterday
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center flex-wrap shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Order ID, or Customer..."
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
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left bg-muted/40">
                <th className="px-5 py-3.5 font-medium">Transaction ID</th>
                <th className="px-5 py-3.5 font-medium">Order ID</th>
                <th className="px-5 py-3.5 font-medium">Customer</th>
                <th className="px-5 py-3.5 font-medium">Gateway</th>
                <th className="px-5 py-3.5 font-medium">Amount</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(payment => (
                <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-medium font-mono text-xs">{payment.transactionId}</td>
                  <td className="px-5 py-4 text-primary font-medium">{payment.orderId}</td>
                  <td className="px-5 py-4">{payment.customer}</td>
                  <td className="px-5 py-4 text-muted-foreground">{payment.gateway}</td>
                  <td className="px-5 py-4 font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] ?? ''}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{payment.date}</td>
                  <td className="px-5 py-4 text-right">
                    {payment.status === 'Successful' && (
                        <button className="text-xs px-3 py-1.5 rounded-lg border border-input bg-background hover:bg-muted transition-colors font-medium text-red-600">
                            Refund
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">No payments found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  )
}
