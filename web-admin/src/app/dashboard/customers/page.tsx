'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  ShoppingBag, 
  UserX, 
  UserCheck,
  Eye,
  ArrowUpDown,
  Download
} from 'lucide-react'
import { Customer } from '@/types'

import { supabase, supabaseAuth } from '@/lib/supabase'
import { fetchCustomers } from '@/app/actions/customerActions'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllCustomers()
  }, [])

  const fetchAllCustomers = async () => {
    setIsLoading(true)
    try {
      const res = await fetchCustomers()
      if (res.success && res.data) setCustomers(res.data)
      else throw new Error(res.error)
    } catch (err: any) {
      console.error('Error fetching customers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentlySuspended: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const { data: { session } } = await supabaseAuth.auth.getSession()
      
      const res = await fetch(`${apiUrl}/api/customers/${id}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ is_suspended: !currentlySuspended })
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      setCustomers(prev => prev.map(c => 
        c.id === id ? { ...c, is_suspended: !currentlySuspended } : c
      ))
    } catch (err: any) {
      alert(`Update failed: ${err.message}`)
    }
  }

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-neutral-400">View and manage your store's user base</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-lg text-sm hover:text-white">
            <Filter className="w-4 h-4" />
            Status
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-lg text-sm hover:text-white">
            <ArrowUpDown className="w-4 h-4" />
            Sort by Spend
          </button>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Orders</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Total Spent</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-primary font-bold">
                        {customer.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{customer.name || 'User'}</p>
                        <p className="text-xs text-neutral-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      !customer.is_suspended ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${!customer.is_suspended ? 'bg-green-500' : 'bg-red-500'}`} />
                      {customer.is_suspended ? 'suspended' : 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-300">
                    <div className="flex items-center gap-2 font-mono text-xs">
                       Joined {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">
                    {/* Spent info would need order totals join, leaving as N/A for now */}
                    N/A
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleStatus(customer.id, customer.is_suspended)}
                        className={`p-2 rounded-lg transition-colors ${
                          !customer.is_suspended 
                            ? 'text-neutral-400 hover:text-red-500 bg-neutral-800' 
                            : 'text-green-500 hover:bg-green-500/10 bg-neutral-800'
                        }`}
                        title={!customer.is_suspended ? 'Suspend Account' : 'Activate Account'}
                      >
                        {!customer.is_suspended ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
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
