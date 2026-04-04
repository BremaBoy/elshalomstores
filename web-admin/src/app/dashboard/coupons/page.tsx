'use client'

import { useState, useEffect } from 'react'
import { Ticket, Plus, Search, Filter, Loader2, Tag, Calendar, Copy, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoupons(data || [])
    } catch (err) {
      console.error('Coupons Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons & Discounts</h1>
          <p className="text-neutral-400 text-sm">Manage promotional codes and campaign offers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm shadow-lg shadow-purple-900/20">
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
           <div className="col-span-3 py-10 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : filteredCoupons.map(coupon => (
          <div key={coupon.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors shadow-2xl">
              <div className="absolute top-0 right-0 p-4">
                <span className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  coupon.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                )}>
                  {coupon.is_active ? 'Active' : 'Expired'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 border border-purple-500/10">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tighter">{coupon.code}</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₦${coupon.value} OFF`}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Expires</span>
                  <span className="text-neutral-300 font-medium">{coupon.expiry_date ? format(new Date(coupon.expiry_date), 'MMM dd, yyyy') : 'No Expiry'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Usage</span>
                  <span className="text-neutral-300 font-medium">{coupon.usage_count || 0} / {coupon.usage_limit || '∞'}</span>
                </div>
              </div>

              <button 
                onClick={() => copyToClipboard(coupon.code)}
                className="w-full py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-95 shadow-inner"
              >
                {copiedCode === coupon.code ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
              </button>
          </div>
        ))}
      </div>
    </div>
  )
}


