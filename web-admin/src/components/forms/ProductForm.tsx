'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Product, Category } from '@/types'
import { Loader2, Plus, Image as ImageIcon, X, AlertCircle } from 'lucide-react'
import { useState } from 'react'

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
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProductFormValues>({
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
            <label className="text-sm font-medium text-neutral-300">Product Image URL</label>
            <div className="flex gap-2">
              <input
                {...register('image')}
                className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
            
            {imageUrl && (
              <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-neutral-900/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs text-white bg-neutral-900/80 px-2 py-1 rounded">Image Preview</span>
                </div>
              </div>
            )}
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
