'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Admin } from '@/types'
import { Loader2, Plus, Shield, User, Mail, X } from 'lucide-react'

const adminSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']),
  status: z.enum(['active', 'suspended']),
})

type AdminFormValues = z.infer<typeof adminSchema>

interface AdminFormProps {
  initialData?: Admin;
  onSubmit: (data: AdminFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AdminForm({ initialData, onSubmit, isLoading }: AdminFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      role: 'ADMIN',
      status: 'active' as const,
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              {...register('name')}
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="e.g. John Doe"
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              {...register('email')}
              type="email"
              disabled={!!initialData}
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50"
              placeholder="admin@elshalomstores.com"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">System Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <select
                {...register('role')}
                className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:ring-1 focus:ring-primary focus:outline-none appearance-none"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Account Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:ring-1 focus:ring-primary focus:outline-none appearance-none"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {initialData ? 'Update Admin' : 'Create Admin'}
        </button>
      </div>
    </form>
  )
}
