'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Ticket,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { CouponForm } from '@/components/forms/CouponForm'
import { Coupon } from '@/types'
import { supabase } from '@/lib/supabase'

export default function CouponsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCouponSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(data)
          .eq('id', editingCoupon.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([data])
        if (error) throw error
      }
      await fetchCoupons()
      setShowForm(false)
      setEditingCoupon(undefined)
    } catch (err: any) {
      alert(`Error saving coupon: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error
      setCoupons(coupons.filter(c => c.id !== id))
    } catch (err: any) {
      alert(`Error deleting coupon: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons & Promotions</h1>
          <p className="text-sm text-neutral-400">Direct database access for Super Admins</p>
        </div>
        <button 
          onClick={() => {
            setEditingCoupon(undefined)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Failed to load coupons</h3>
          <p className="text-neutral-500 max-w-sm mb-6">{error}</p>
          <button onClick={fetchCoupons} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Ticket className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      coupon.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {coupon.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {coupon.is_active ? 'Active' : 'Disabled'}
                    </span>
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingCoupon(coupon)
                          setShowForm(true)
                        }}
                        className="p-1.5 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 bg-neutral-800 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{coupon.code}</h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `₦${coupon.discount_value.toLocaleString()} off`} 
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-neutral-800/50">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Usage</p>
                    <p className="text-sm text-neutral-300 font-medium">
                      {coupon.usage_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : 'uses'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Expires</p>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-300 font-medium font-mono">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <div className="col-span-full h-48 flex items-center justify-center text-neutral-500 italic border-2 border-dashed border-neutral-800 rounded-2xl">
              No coupons found. Create your first promotion above!
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{editingCoupon ? 'Edit Coupon' : 'New Promotion'}</h2>
                <p className="text-sm text-neutral-500">Update will sync with store checkout</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-2 text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <CouponForm 
                initialData={editingCoupon} 
                onSubmit={handleCouponSubmit}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
