'use client'

import { useState, useEffect } from 'react'
import { Truck, MapPin, Search, Filter, Loader2, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ShipmentsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Shipments Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.shipping_address as any)?.address?.toLowerCase().includes(search.toLowerCase())
  )

  const activeShipments = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length
  const deliveredToday = orders.filter(o => o.status === 'Delivered').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Shipments & Logistics</h1>
          <p className="text-neutral-400 text-sm">Track deliveries and manage fulfillment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/40 backdrop-blur border border-neutral-800 rounded-xl p-5 border-l-4 border-l-primary">
           <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">Pending Fulfillment</p>
           <div className="flex items-end justify-between">
             <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'Pending').length}</p>
             <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <Clock className="w-5 h-5" />
             </div>
           </div>
        </div>

        <div className="bg-neutral-900/40 backdrop-blur border border-neutral-800 rounded-xl p-5 border-l-4 border-l-blue-500">
           <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">In Transit</p>
           <div className="flex items-end justify-between">
             <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length}</p>
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
               <Truck className="w-5 h-5" />
             </div>
           </div>
        </div>

        <div className="bg-neutral-900/40 backdrop-blur border border-neutral-800 rounded-xl p-5 border-l-4 border-l-green-500">
           <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">Delivered Today</p>
           <div className="flex items-end justify-between">
             <p className="text-3xl font-bold text-white">{deliveredToday}</p>
             <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
               <CheckCircle2 className="w-5 h-5" />
             </div>
           </div>
        </div>

        <div className="bg-neutral-900/40 backdrop-blur border border-neutral-800 rounded-xl p-5 border-l-4 border-l-orange-500">
           <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">Service Radius</p>
           <div className="flex items-end justify-between">
             <p className="text-3xl font-bold text-white">NGN</p>
             <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
               <MapPin className="w-5 h-5" />
             </div>
           </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by ID or destination..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="divide-y divide-neutral-800">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-neutral-500 font-medium">Retrieving shipment logs...</p>
            </div>
          ) : filteredOrders.map(o => (
            <div key={o.id} className="p-5 hover:bg-neutral-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    o.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                    o.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                    o.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                       #{o.id.split('-')[0].toUpperCase()}
                       <span className="text-[10px] text-neutral-600 font-medium bg-neutral-800 px-2 rounded-full py-0.5">EL24-LOG</span>
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                       <MapPin className="w-3 h-3 text-neutral-600" />
                       {(o.shipping_address as any)?.address || 'No address provided'}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 ml-4.5">{o.users?.name || 'Guest'}</p>
                  </div>
               </div>

               <div className="flex items-center gap-8 px-4">
                  <div className="hidden lg:block text-right min-w-[120px]">
                     <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">Status</p>
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                       o.status === 'Delivered' ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                       o.status === 'Shipped' ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' :
                       'border-neutral-700 text-neutral-400 bg-neutral-800/50'
                     }`}>
                       {o.status}
                     </span>
                  </div>
                  <button className="p-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
