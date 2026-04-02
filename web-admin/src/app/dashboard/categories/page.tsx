'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Tag as TagIcon, 
  Edit, 
  Trash2, 
  MoreVertical,
  X,
  Package,
  Layers
} from 'lucide-react'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { Category } from '@/types'

const MOCK_CATEGORIES: Category[] = [
  { id: 'fashion', name: 'Fashion', item_count: 120, icon: 'Shirt' },
  { id: 'electronics', name: 'Electronics', item_count: 85, icon: 'Smartphone' },
  { id: 'beauty', name: 'Beauty', item_count: 64, icon: 'Sparkles' },
  { id: 'furniture', name: 'Furniture', item_count: 42, icon: 'Armchair' },
  { id: 'groceries', name: 'Groceries', item_count: 156, icon: 'Apple' },
]

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)

  const handleCreate = async (data: any) => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...data } : c))
    } else {
      setCategories([...categories, { ...data, item_count: 0 }])
    }
    setShowForm(false)
    setEditingCategory(undefined)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category? This might affect products using it.')) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-neutral-400">Organize your products into collections</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(undefined)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-white font-bold">Quick Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Total Categories</span>
                <span className="text-white font-medium">{categories.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Most Popular</span>
                <span className="text-white font-medium">Groceries</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="text" 
                  placeholder="Filter categories..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="divide-y divide-neutral-800">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 hover:bg-neutral-800/20 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
                      <TagIcon className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{category.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Package className="w-3 h-3 text-neutral-600" />
                        <span className="text-[11px] text-neutral-500 font-medium">{category.item_count} Products</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingCategory(category)
                        setShowForm(true)
                      }}
                      className="p-2 text-neutral-400 hover:text-primary bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                <p className="text-sm text-neutral-500">Organize your store structure</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-2 text-neutral-500 hover:text-white bg-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-neutral-950">
              <CategoryForm initialData={editingCategory} onSubmit={handleCreate} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
