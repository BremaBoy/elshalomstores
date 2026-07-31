'use client'

import { useState, useEffect } from 'react'
import { Ticket, Plus, Loader2, Tag, Calendar, Copy, CheckCircle2, Pencil, Trash2, X } from 'lucide-react'
import { supabaseAuth } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CouponForm } from '@/components/forms/CouponForm'
import { Coupon } from '@/types'
import { deleteCoupon, saveCoupon } from '@/app/actions/couponActions'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabaseAuth
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

  const handleSave = async (values: any) => {
    setIsSaving(true)
    const result = await saveCoupon({
      ...values,
      expiry_date: values.expiry_date || null,
      usage_limit: Number.isNaN(values.usage_limit) ? null : values.usage_limit,
    }, editingCoupon?.id)
    setIsSaving(false)
    if (!result.success) return alert(result.error)
    setShowForm(false)
    setEditingCoupon(undefined)
    await fetchCoupons()
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Permanently delete coupon ${coupon.code}?`)) return
    const result = await deleteCoupon(coupon.id)
    if (!result.success) return alert(result.error)
    await fetchCoupons()
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
          <h1 className="text-2xl font-bold text-foreground">Coupons & Discounts</h1>
          <p className="text-muted-foreground text-sm">Manage promotional codes and campaign offers</p>
        </div>
        <button onClick={() => { setEditingCoupon(undefined); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm shadow-lg shadow-purple-900/20">
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
          <div key={coupon.id} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors shadow-2xl">
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
                  <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">{coupon.code}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₦${coupon.discount_value} OFF`}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Expires</span>
                  <span className="text-foreground font-medium">{coupon.expiry_date ? format(new Date(coupon.expiry_date), 'MMM dd, yyyy') : 'No Expiry'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Usage</span>
                  <span className="text-foreground font-medium">{coupon.usage_count || 0} / {coupon.usage_limit || '∞'}</span>
                </div>
              </div>

              <button 
                onClick={() => copyToClipboard(coupon.code)}
                className="w-full py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all active:scale-95 shadow-inner"
              >
                {copiedCode === coupon.code ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
              </button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => { setEditingCoupon(coupon); setShowForm(true) }} className="py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent flex items-center justify-center gap-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => handleDelete(coupon)} className="py-2 rounded-lg border border-red-500/20 text-sm text-red-500 hover:bg-red-500/10 flex items-center justify-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div><h2 className="font-bold text-foreground">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2><p className="text-sm text-muted-foreground">Configure discount rules and usage limits.</p></div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5"><CouponForm initialData={editingCoupon} onSubmit={handleSave} isLoading={isSaving} /></div>
          </div>
        </div>
      )}
    </div>
  )
}

