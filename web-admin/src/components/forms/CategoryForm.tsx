'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Category } from '@/types'
import { Loader2, Plus, Image as ImageIcon, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { uploadImage } from '@/app/actions/productActions'

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
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      id: '',
      name: '',
      icon: '',
      image: '',
    }
  })

  const imageUrl = watch('image')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await uploadImage(formData, 'categories')
      if (result.success && result.url) {
        setValue('image', result.url)
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

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
          <label className="text-sm font-medium text-neutral-300">Category Image</label>
          <div className="flex flex-col gap-3">
            {/* File Upload Button */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-neutral-800 bg-neutral-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-neutral-900 transition-all group relative overflow-hidden"
            >
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                    <ImageIcon className="w-8 h-8 text-white mb-2" />
                    <p className="text-xs text-white font-medium">Change Image</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {isUploading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <ImageIcon className="w-6 h-6 text-neutral-500" />}
                  </div>
                  <p className="text-sm text-neutral-400 font-medium">Click to upload image</p>
                  <p className="text-xs text-neutral-600 mt-1">PNG, JPG or WebP (max 5MB)</p>
                </>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-xs text-primary font-bold animate-pulse">UPLOADING...</p>
                  </div>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* URL Fallback */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Or use Image URL</label>
              <input
                {...register('image')}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="https://example.com/category-banner.jpg"
              />
            </div>
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
