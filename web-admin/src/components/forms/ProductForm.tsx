'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product, Category } from '@/types'
import { Loader2, Plus, Image as ImageIcon, X, AlertCircle } from 'lucide-react'
import { useState, useRef } from 'react'
import { uploadImage } from '@/app/actions/productActions'

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  discount_price: z.number().min(0).nullish(),
  category: z.string().min(1, 'Please select a category'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  image: z.string().min(1, 'Image URL is required'),
  is_new: z.boolean(),
  is_sale: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ initialData, categories, onSubmit, isLoading }: ProductFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      price: initialData.price,
      discount_price: initialData.discount_price,
      category: initialData.category,
      stock: initialData.stock,
      image: initialData.image,
      is_new: initialData.is_new,
      is_sale: initialData.is_sale,
    } : {
      name: '',
      description: '',
      price: 0,
      discount_price: 0,
      category: '',
      stock: 0,
      image: '',
      is_new: false,
      is_sale: false,
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
      
      const result = await uploadImage(formData, 'products')
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
      {initialData?.status === 'pending' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-bold uppercase tracking-tight">Pending Activation</p>
            <p className="opacity-80">This product is missing required fields and is hidden from the public shop. Fill in the missing information and save to activate.</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Product Name</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. Luxury Handbag"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              placeholder="Detailed product information..."
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Price (₦)</label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Discount Price</label>
              <input
                type="number"
                {...register('discount_price', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Categories & Media */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Category</label>
            <select
              {...register('category')}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Available Stock</label>
            <input
              type="number"
              {...register('stock', { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Product Image</label>
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
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_new')} className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-primary focus:ring-primary" />
              <span className="text-sm text-neutral-400">Mark as New</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_sale')} className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-primary focus:ring-primary" />
              <span className="text-sm text-neutral-400">On Sale</span>
            </label>
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
          {initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
