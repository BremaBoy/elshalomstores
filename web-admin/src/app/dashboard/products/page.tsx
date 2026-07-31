'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  X,
  Upload,
  ArrowUpDown,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { ProductForm } from '@/components/forms/ProductForm'
import { CSVImporter } from '@/components/ui/CSVImporter'
import { Category, Product } from '@/types'
import { supabase, supabaseAuth } from '@/lib/supabase'
import { createProduct, updateProduct, deleteProduct as removeProduct, bulkImportProducts } from '@/app/actions/productActions'

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending'>('all')
  const [importProgress, setImportProgress] = useState<number | null>(null)

  // Fetch products and categories on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        supabaseAuth.from('products').select('*').order('created_at', { ascending: false }),
        supabaseAuth.from('categories').select('*')
      ])

      if (prodRes.error) throw prodRes.error
      if (catRes.error) throw catRes.error

      setProducts(prodRes.data || [])
      setCategories(catRes.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const validateProduct = (data: any) => {
    const requiredFields = ['name', 'description', 'price', 'category', 'image', 'stock']
    const isComplete = requiredFields.every(field => 
      data[field] !== undefined && 
      data[field] !== null && 
      data[field] !== '' && 
      (typeof data[field] === 'number' ? data[field] >= 0 : true)
    )
    return isComplete ? 'active' : 'pending'
  }

  const handleProductSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const status = validateProduct(data)
      const submissionData = { ...data, status }

      let result
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, submissionData)
      } else {
        result = await createProduct(submissionData)
      }
      
      if (!result.success) throw new Error(result.error)
      
      await fetchData()
      setShowForm(false)
      setEditingProduct(undefined)
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const result = await removeProduct(id)
      if (!result.success) throw new Error(result.error)
      setProducts(products.filter(p => p.id !== id))
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`)
    }
  }

  const fuzzyMapping: Record<string, string[]> = {
    name: ['name', 'title', 'product', 'item', 'label', 'heading'],
    description: ['description', 'desc', 'about', 'details', 'info', 'content'],
    price: ['price', 'cost', 'amount', 'rate', 'value', 'msrp'],
    category: ['category', 'cat', 'group', 'type', 'collection', 'department'],
    stock: ['quantity', 'qty', 'stock', 'inventory', 'count', 'units', 'available', 'balance'],
    image: ['image', 'img', 'picture', 'url', 'photo', 'thumbnail', 'src', 'link'],
    is_new: ['new', 'is_new', 'recent', 'fresh', 'latest'],
    is_sale: ['sale', 'on_sale', 'promo', 'discounted', 'clearance'],
    discount_price: ['discount', 'sale_price', 'discount_price', 'promo_price']
  }

  const findBestMatch = (row: any, targetKey: string): any => {
    const rowKeys = Object.keys(row)
    const targets = fuzzyMapping[targetKey]
    
    // 1. Try exact match (case insensitive)
    const exactMatch = rowKeys.find(k => targets.includes(k.toLowerCase().trim()))
    let value = exactMatch ? row[exactMatch] : null

    // 2. Try partial match if no exact match
    if (value === null) {
      const partialMatch = rowKeys.find(k => {
        const lowKey = k.toLowerCase().trim()
        return targets.some(t => lowKey.includes(t))
      })
      value = partialMatch ? row[partialMatch] : null
    }

    if (value === null) return null

    // Clean numeric values if target is price or stock
    if (targetKey === 'price' || targetKey === 'stock' || targetKey === 'discount_price') {
      const cleaned = String(value).replace(/[^0-9.-]+/g, "")
      return targetKey === 'stock' ? parseInt(cleaned) || 0 : parseFloat(cleaned) || 0
    }

    return value
  }

  const handleCSVImport = async (data: any[]) => {
    setIsSubmitting(true)
    setImportProgress(0)
    const total = data.length

    try {
      const formatted = data.map((item, index) => {
        const rawCategory = findBestMatch(item, 'category')
        // Efficiently find matching category ID by name
        const matchedCategory = categories.find(c => 
          c.name.toLowerCase().trim() === String(rawCategory || '').toLowerCase().trim() ||
          c.id === rawCategory // support direct ID if provided
        )

        const productData = {
          name: findBestMatch(item, 'name') || `Imported Product ${index + 1}`,
          description: findBestMatch(item, 'description') || 'No description provided.',
          price: findBestMatch(item, 'price'),
          category: matchedCategory ? matchedCategory.id : (categories[0]?.id || ''),
          stock: findBestMatch(item, 'stock'),
          image: findBestMatch(item, 'image') || '',
          is_new: String(findBestMatch(item, 'is_new')).toLowerCase() === 'true',
          is_sale: String(findBestMatch(item, 'is_sale')).toLowerCase() === 'true',
          discount_price: findBestMatch(item, 'discount_price') || null,
        }
        return { ...productData, status: validateProduct(productData) }
      })

      setImportProgress(50) // Basic progress since server action handles the rest
      const result = await bulkImportProducts(formatted)
      
      if (!result.success) throw new Error(result.error)

      setImportProgress(100)
      await fetchData()
      setShowImport(false)
      alert(`Successfully imported ${total} products!`)
    } catch (err: any) {
      console.error('CSV Import Error:', err)
      alert(`CSV Import failed: ${err.message}`)
    } finally {
      setIsSubmitting(false)
      setImportProgress(null)
    }
  }

  const filteredProducts = products.filter(p => {
    if (activeTab === 'all') return true
    return p.status === activeTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your inventory and product listings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button 
            onClick={() => {
              setEditingProduct(undefined)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          All Products ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Active ({products.filter(p => p.status === 'active').length})
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Pending ({products.filter(p => p.status === 'pending').length})
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border rounded-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="p-12 bg-card border border-border rounded-xl flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Failed to load products</h3>
          <p className="text-muted-foreground max-w-sm mb-6">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-accent text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Stats & Table logic (Similar to previous, but using products from state) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Products</p>
              <p className="text-2xl font-bold text-foreground mt-1">{products.length}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Low Stock</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{products.filter(p => p.stock > 0 && p.stock < 10).length}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Value</p>
              <p className="text-2xl font-bold text-green-500 mt-1">₦{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-accent/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-card overflow-hidden border border-border flex items-center justify-center">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-neutral-700" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground line-clamp-1">{product.name || 'Untitled Product'}</p>
                              {product.status === 'pending' && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Pending</span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">{product.stock || 0} units left</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground capitalize bg-accent/50 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-foreground">₦{product.price.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingProduct(product)
                              setShowForm(true)
                            }}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-accent rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 transition-colors hover:bg-accent rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                        No products found. Click "Add Product" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-sm text-muted-foreground">Super Admin Mode enabled</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ProductForm 
                initialData={editingProduct} 
                categories={categories} 
                onSubmit={handleProductSubmit}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between text-foreground">
              <h2 className="text-xl font-bold">Import Products</h2>
              <button onClick={() => setShowImport(false)} disabled={importProgress !== null} className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <CSVImporter 
                title="Bulk Upload Products"
                expectedHeaders={['name', 'description', 'price', 'category', 'stock', 'image', 'is_new', 'is_sale']}
                onData={handleCSVImport}
                progress={importProgress}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
