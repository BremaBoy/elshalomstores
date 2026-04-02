'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Category } from '@/types'
import { Loader2, Plus, Image as ImageIcon } from 'lucide-react'

const categorySchema = z.object({
  id: z.string().min(2, 'ID must be at least 2 characters').toLowerCase(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  icon: z.string().optional(),
  image: z.string().url('Please provide a valid image URL').optional().or(z.literal('')),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryForm({ initialData, onSubmit, isLoading }: CategoryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      id: '',
      name: '',
      icon: '',
      image: '',
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Category ID</label>
            <input
              {...register('id')}
              disabled={!!initialData}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
              placeholder="e.g. phones"
            />
            {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Name</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. Smart Phones"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Icon Name (Lucide)</label>
          <input
            {...register('icon')}
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Smartphone, Laptop, etc."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Banner Image URL</label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              {...register('image')}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="https://example.com/category-banner.jpg"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}
