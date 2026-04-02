'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Coupon } from '@/types'
import { Loader2, Ticket, Calendar } from 'lucide-react'

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0),
  min_order_amount: z.number().min(0),
  expiry_date: z.string().optional(),
  usage_limit: z.number().int().min(1).nullish(),
  is_active: z.boolean(),
})

type CouponFormValues = z.infer<typeof couponSchema>

interface CouponFormProps {
  initialData?: Coupon;
  onSubmit: (data: CouponFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CouponForm({ initialData, onSubmit, isLoading }: CouponFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData ? {
      ...initialData,
      expiry_date: initialData.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : undefined
    } : {
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      is_active: true,
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Coupon Code</label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                {...register('code')}
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none uppercase"
                placeholder="SAVE20"
              />
            </div>
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Discount Type</label>
              <select
                {...register('discount_type')}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Value</label>
              <input
                type="number"
                {...register('discount_value', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
              {errors.discount_value && <p className="text-xs text-destructive">{errors.discount_value.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Min. Order (₦)</label>
              <input
                type="number"
                {...register('min_order_amount', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Usage Limit</label>
              <input
                type="number"
                {...register('usage_limit', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Expiry Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="date"
                {...register('expiry_date')}
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-primary focus:ring-primary" />
            <span className="text-sm text-neutral-300 font-medium">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
          {initialData ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>
    </form>
  )
}
