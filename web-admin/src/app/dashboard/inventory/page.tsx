'use client'

import { useState, useEffect } from 'react'
import { Warehouse, AlertTriangle, ArrowUpRight, Search, Filter, Loader2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('quantity', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Inventory Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= 5).length
  const outOfStockCount = products.filter(p => p.quantity <= 0).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-neutral-400 text-sm">Monitor stock levels and warehouse distribution</p>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
               <Package className="w-5 h-5" />
             </div>
             <p className="text-sm text-neutral-400 font-medium">Total Items</p>
          </div>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
               <AlertTriangle className="w-5 h-5" />
             </div>
             <p className="text-sm text-neutral-400 font-medium">Low Stock</p>
          </div>
          <p className="text-2xl font-bold text-white">{lowStockCount}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
               <ArrowUpRight className="w-5 h-5 rotate-45" />
             </div>
             <p className="text-sm text-neutral-400 font-medium">Out of Stock</p>
          </div>
          <p className="text-2xl font-bold text-white">{outOfStockCount}</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-neutral-950/50 text-neutral-400 font-medium border-b border-neutral-800">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-neutral-500 mt-2">Loading inventory...</p>
                  </td>
                </tr>
              ) : filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{p.name}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">{p.sku || 'N/A'}</td>
                  <td className="px-6 py-4 text-neutral-400">{p.category || 'Uncategorized'}</td>
                  <td className="px-6 py-4 font-bold text-white">{p.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      p.quantity > 5 ? 'bg-green-500/10 text-green-500' : 
                      p.quantity > 0 ? 'bg-yellow-500/10 text-yellow-500' : 
                      'bg-red-500/10 text-red-500'
                    )}>
                      {p.quantity > 5 ? 'In Stock' : p.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
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
