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
  Download,
  ArrowUpDown,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Papa from 'papaparse'
import { ProductForm } from '@/components/forms/ProductForm'
import { CSVImporter, type CSVBatchContext } from '@/components/ui/CSVImporter'
import { Category, Product } from '@/types'
import { supabase, supabaseAuth } from '@/lib/supabase'
import {
  createProduct,
  updateProduct,
  deleteProduct as removeProduct,
  bulkImportProducts,
  createProductImageUploadTarget,
} from '@/app/actions/productActions'

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
  const [showExport, setShowExport] = useState(false)
  const [exportScope, setExportScope] = useState<'all' | 'category'>('all')
  const [exportCategory, setExportCategory] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportProgress, setExportProgress] = useState<{
    stage: 'loading' | 'embedding' | 'preparing'
    current: number
    total: number
  } | null>(null)

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

  const validateProduct = (data: any): Product['status'] => {
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

  const readBlobAsDataUrl = (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error || new Error('The image could not be embedded.'))
      reader.readAsDataURL(blob)
    })
  }

  const fetchProductsForExport = async () => {
    const pageSize = 1_000
    const exportedProducts: Product[] = []
    let from = 0

    while (true) {
      let query = supabaseAuth
        .from('products')
        .select('*')
        .order('id', { ascending: true })
        .range(from, from + pageSize - 1)

      if (exportScope === 'category') {
        query = query.eq('category', exportCategory)
      }

      const { data, error: queryError } = await query
      if (queryError) throw queryError

      const page = (data || []) as Product[]
      exportedProducts.push(...page)
      setExportProgress({
        stage: 'loading',
        current: exportedProducts.length,
        total: 0,
      })

      if (page.length < pageSize) break
      from += pageSize
    }

    return exportedProducts
  }

  const embedExportImages = async (productsToExport: Product[]) => {
    const rows = new Array<Record<string, string | number | boolean | null>>(productsToExport.length)
    const categoryNames = new Map(categories.map(category => [category.id, category.name]))
    const embeddedImageCache = new Map<string, Promise<string>>()
    let nextIndex = 0
    let completed = 0
    const workerCount = Math.min(4, productsToExport.length)

    const worker = async () => {
      while (nextIndex < productsToExport.length) {
        const index = nextIndex
        nextIndex += 1
        const product = productsToExport[index]
        let embeddedImage = ''

        if (product.image) {
          if (product.image.startsWith('data:image/')) {
            embeddedImage = product.image
          } else {
            let embeddingPromise = embeddedImageCache.get(product.image)
            if (!embeddingPromise) {
              embeddingPromise = (async () => {
                let imageResponse: Response
                try {
                  imageResponse = await fetch(product.image, { cache: 'no-store' })
                } catch {
                  throw new Error(
                    `The image for "${product.name}" could not be embedded. Confirm that its image URL permits downloads.`
                  )
                }

                if (!imageResponse.ok) {
                  throw new Error(
                    `The image for "${product.name}" returned HTTP ${imageResponse.status}; export was stopped so no image is omitted.`
                  )
                }

                const imageBlob = await imageResponse.blob()
                if (!imageBlob.type.startsWith('image/')) {
                  throw new Error(`The image URL for "${product.name}" did not return an image file.`)
                }
                return readBlobAsDataUrl(imageBlob)
              })()
              embeddedImageCache.set(product.image, embeddingPromise)
            }
            embeddedImage = await embeddingPromise
          }
        }

        rows[index] = {
          name: product.name,
          description: product.description,
          price: product.price,
          discount_price: product.discount_price ?? null,
          category: categoryNames.get(product.category) || product.category,
          stock: product.stock,
          image: embeddedImage,
          is_new: product.is_new,
          is_sale: product.is_sale,
          status: product.status,
        }

        completed += 1
        setExportProgress({
          stage: 'embedding',
          current: completed,
          total: productsToExport.length,
        })
      }
    }

    await Promise.all(Array.from({ length: workerCount }, () => worker()))
    return rows
  }

  const handleProductExport = async () => {
    if (exportScope === 'category' && !exportCategory) {
      setExportError('Choose a category to export.')
      return
    }

    setIsExporting(true)
    setExportError(null)
    setExportProgress({ stage: 'loading', current: 0, total: 0 })

    try {
      const productsToExport = await fetchProductsForExport()
      if (productsToExport.length === 0) {
        throw new Error('No products were found for this export.')
      }

      setExportProgress({ stage: 'embedding', current: 0, total: productsToExport.length })
      const exportRows = await embedExportImages(productsToExport)
      setExportProgress({ stage: 'preparing', current: productsToExport.length, total: productsToExport.length })

      const csv = Papa.unparse(exportRows, {
        columns: ['name', 'description', 'price', 'discount_price', 'category', 'stock', 'image', 'is_new', 'is_sale', 'status'],
      })
      const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      if (csvBlob.size > 500 * 1024 * 1024) {
        throw new Error('The embedded-image CSV is larger than 500 MB. Export a smaller category instead.')
      }

      const categoryName = categories.find(category => category.id === exportCategory)?.name || 'all-products'
      const safeName = (exportScope === 'category' ? categoryName : 'all-products')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const objectUrl = URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `elshalom-${safeName || 'products'}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
      setShowExport(false)
    } catch (exportFailure) {
      setExportError(
        exportFailure instanceof Error ? exportFailure.message : 'The product export could not be completed.'
      )
    } finally {
      setIsExporting(false)
      setExportProgress(null)
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

  const findBestMatch = (row: Record<string, string>, targetKey: string): string | number | null => {
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
      const cleaned = String(value).replace(/,/g, '').replace(/[^0-9.-]+/g, '')
      if (!cleaned) return null
      const parsed = Number(cleaned)
      if (!Number.isFinite(parsed)) return null
      return targetKey === 'stock' ? Math.trunc(parsed) : parsed
    }

    return String(value).trim()
  }

  const parseBoolean = (value: string | number | null) => {
    return ['true', '1', 'yes', 'y', 'on'].includes(String(value ?? '').trim().toLowerCase())
  }

  const formatCSVRows = (data: Record<string, string>[], startRow: number) => {
    const rowErrors: string[] = []
    const formatted = data.map((item, index) => {
      const rowNumber = startRow + index
      const name = String(findBestMatch(item, 'name') || '').trim()
      const price = findBestMatch(item, 'price')
      const rawCategory = findBestMatch(item, 'category')
      const categoryInput = String(rawCategory || '').trim()
      const matchedCategory = categories.find(c =>
        c.name.toLowerCase().trim() === categoryInput.toLowerCase() ||
        c.id === categoryInput
      )
      const stock = findBestMatch(item, 'stock')
      const discountPrice = findBestMatch(item, 'discount_price')

      if (!name) rowErrors.push(`row ${rowNumber}: product name is required`)
      if (typeof price !== 'number' || price < 0) rowErrors.push(`row ${rowNumber}: price must be a valid non-negative number`)
      if (!categoryInput) rowErrors.push(`row ${rowNumber}: category is required`)
      if (typeof stock === 'number' && stock < 0) rowErrors.push(`row ${rowNumber}: stock cannot be negative`)
      if (typeof discountPrice === 'number' && discountPrice < 0) rowErrors.push(`row ${rowNumber}: discount price cannot be negative`)

      const productData = {
        name,
        description: findBestMatch(item, 'description') || 'No description provided.',
        price,
        // Preserve unknown category names so the server action can create them.
        category: matchedCategory ? matchedCategory.id : categoryInput,
        stock: typeof stock === 'number' ? stock : 0,
        image: findBestMatch(item, 'image') || '',
        is_new: parseBoolean(findBestMatch(item, 'is_new')),
        is_sale: parseBoolean(findBestMatch(item, 'is_sale')),
        discount_price: typeof discountPrice === 'number' && discountPrice > 0 ? discountPrice : null,
      }
      return { ...productData, status: validateProduct(productData) }
    })

    if (rowErrors.length > 0) {
      const displayedErrors = rowErrors.slice(0, 8).join('; ')
      const remaining = rowErrors.length > 8 ? `; plus ${rowErrors.length - 8} more issue(s)` : ''
      throw new Error(`Please fix the CSV before importing: ${displayedErrors}${remaining}`)
    }

    return formatted
  }

  const validateCSVRows = (data: Record<string, string>[], startRow: number) => {
    formatCSVRows(data, startRow)
  }

  const restoreEmbeddedImages = async (
    productsToRestore: ReturnType<typeof formatCSVRows>,
    startingRow: number,
  ) => {
    const restoredProducts = productsToRestore.map(product => ({
      ...product,
      image: String(product.image || ''),
    }))
    const embeddedIndexes = restoredProducts
      .map((product, index) => product.image.startsWith('data:image/') ? index : -1)
      .filter(index => index >= 0)
    let nextEmbeddedIndex = 0
    const workerCount = Math.min(4, embeddedIndexes.length)

    const worker = async () => {
      while (nextEmbeddedIndex < embeddedIndexes.length) {
        const embeddedListIndex = nextEmbeddedIndex
        nextEmbeddedIndex += 1
        const productIndex = embeddedIndexes[embeddedListIndex]
        const product = restoredProducts[productIndex]
        const imageResponse = await fetch(product.image)
        const imageBlob = await imageResponse.blob()

        if (!imageBlob.type.startsWith('image/')) {
          throw new Error(`Row ${startingRow + productIndex}: the embedded image is invalid.`)
        }

        const uploadTarget = await createProductImageUploadTarget(imageBlob.type)
        if (
          !uploadTarget.success ||
          !uploadTarget.path ||
          !uploadTarget.token ||
          !uploadTarget.publicUrl
        ) {
          throw new Error(
            `Row ${startingRow + productIndex}: ${uploadTarget.error || 'the embedded image upload could not be prepared.'}`
          )
        }

        const { error: uploadError } = await supabaseAuth.storage
          .from('products')
          .uploadToSignedUrl(uploadTarget.path, uploadTarget.token, imageBlob, {
            contentType: imageBlob.type,
            cacheControl: '31536000',
          })
        if (uploadError) {
          throw new Error(`Row ${startingRow + productIndex}: image upload failed: ${uploadError.message}`)
        }

        restoredProducts[productIndex] = {
          ...product,
          image: uploadTarget.publicUrl,
        }
      }
    }

    await Promise.all(Array.from({ length: workerCount }, () => worker()))
    return restoredProducts
  }

  const getSafeRequestChunk = <T,>(rows: T[], offset: number, startingRow: number) => {
    const maxProductsPerRequest = 100
    const maxSerializedBytes = 3 * 1024 * 1024
    let chunkSize = Math.min(maxProductsPerRequest, rows.length - offset)

    while (chunkSize > 0) {
      const chunk = rows.slice(offset, offset + chunkSize)
      const serializedBytes = new Blob([JSON.stringify(chunk)]).size
      if (serializedBytes <= maxSerializedBytes) return chunk
      chunkSize = Math.floor(chunkSize / 2)
    }

    throw new Error(`Row ${startingRow + offset} is too large to send to the server.`)
  }

  const handleCSVBatch = async (data: Record<string, string>[], context: CSVBatchContext) => {
    const formatted = formatCSVRows(data, context.startRow)
    const restoredProducts = await restoreEmbeddedImages(formatted, context.startRow)
    let importedInBatch = 0

    while (importedInBatch < restoredProducts.length) {
      const requestChunk = getSafeRequestChunk(restoredProducts, importedInBatch, context.startRow)
      const result = await bulkImportProducts(
        requestChunk,
        context.startRow + importedInBatch,
      )

      if (!result.success) {
        throw new Error(
          `Batch ${context.batchNumber} of ${context.totalBatches} stopped: ${result.error}`
        )
      }

      importedInBatch += result.count ?? requestChunk.length
      context.reportProgress(importedInBatch)
    }

    return importedInBatch
  }

  const handleCSVComplete = async (importedRows: number, totalBatches: number) => {
    try {
      await fetchData()
      setShowImport(false)
      alert(
        `Successfully imported ${importedRows.toLocaleString()} products in ${totalBatches.toLocaleString()} batch${totalBatches === 1 ? '' : 'es'}!`
      )
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error('The products were imported, but the product list could not be refreshed.')
    }
  }

  const filteredProducts = products.filter(p => {
    if (activeTab === 'all') return true
    return p.status === activeTab
  })
  const exportProgressPercent =
    exportProgress && exportProgress.total > 0
      ? Math.min(100, Math.round((exportProgress.current / exportProgress.total) * 100))
      : 0
  const exportStageLabel =
    exportProgress?.stage === 'loading'
      ? 'Loading products'
      : exportProgress?.stage === 'embedding'
        ? 'Embedding product images'
        : 'Preparing CSV download'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-neutral-400">Manage your inventory and product listings</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setExportError(null)
              setShowExport(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Products
          </button>
          <button 
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button 
            onClick={() => {
              setEditingProduct(undefined)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex border-b border-neutral-800">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
        >
          All Products ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
        >
          Active ({products.filter(p => p.status === 'active').length})
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
        >
          Pending ({products.filter(p => p.status === 'pending').length})
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Failed to load products</h3>
          <p className="text-neutral-500 max-w-sm mb-6">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Stats & Table logic (Similar to previous, but using products from state) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Total Products</p>
              <p className="text-2xl font-bold text-white mt-1">{products.length}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Low Stock</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{products.filter(p => p.stock > 0 && p.stock < 10).length}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Current Value</p>
              <p className="text-2xl font-bold text-green-500 mt-1">₦{products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/50">
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-900 overflow-hidden border border-neutral-800 flex items-center justify-center">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-neutral-700" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white line-clamp-1">{product.name || 'Untitled Product'}</p>
                              {product.status === 'pending' && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Pending</span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-500 uppercase font-mono">{product.stock || 0} units left</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-neutral-400 capitalize bg-neutral-800/50 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">₦{product.price.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingProduct(product)
                              setShowForm(true)
                            }}
                            className="p-2 text-neutral-500 hover:text-primary transition-colors hover:bg-neutral-800 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-neutral-500 hover:text-red-500 transition-colors hover:bg-neutral-800 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 italic">
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
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-sm text-neutral-500">Super Admin Mode enabled</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
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

      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold">Export Products</h2>
                <p className="mt-1 text-xs text-neutral-500">Images will be embedded inside the CSV.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExport(false)}
                disabled={isExporting}
                aria-label="Close export products"
                className="text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!isExporting ? (
                <>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">What should be exported?</p>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${exportScope === 'all' ? 'border-primary bg-primary/10' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}>
                      <input
                        type="radio"
                        name="export-scope"
                        value="all"
                        checked={exportScope === 'all'}
                        onChange={() => {
                          setExportScope('all')
                          setExportError(null)
                        }}
                        className="mt-1 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-white">All products</span>
                        <span className="mt-1 block text-xs text-neutral-500">Export the complete product catalogue.</span>
                      </span>
                    </label>

                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${exportScope === 'category' ? 'border-primary bg-primary/10' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}>
                      <input
                        type="radio"
                        name="export-scope"
                        value="category"
                        checked={exportScope === 'category'}
                        onChange={() => {
                          setExportScope('category')
                          setExportError(null)
                        }}
                        className="mt-1 accent-primary"
                      />
                      <span className="w-full">
                        <span className="block text-sm font-semibold text-white">One category</span>
                        <span className="mt-1 block text-xs text-neutral-500">Export every product from a selected category.</span>
                        {exportScope === 'category' && (
                          <select
                            value={exportCategory}
                            onChange={(event) => {
                              setExportCategory(event.target.value)
                              setExportError(null)
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                        )}
                      </span>
                    </label>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs leading-relaxed text-neutral-300">
                    Embedded images make the CSV much larger, but the file remains self-contained and can restore its images when imported again.
                  </div>
                </>
              ) : (
                <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      {exportStageLabel}
                    </span>
                    <span className="font-bold text-primary tabular-nums">{exportProgressPercent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${exportProgressPercent}%` }}
                    />
                  </div>
                  {exportProgress && exportProgress.total > 0 && (
                    <p className="text-center text-xs text-neutral-500">
                      {exportProgress.current.toLocaleString()} / {exportProgress.total.toLocaleString()} products
                    </p>
                  )}
                  {exportProgress?.stage === 'loading' && exportProgress.current > 0 && (
                    <p className="text-center text-xs text-neutral-500">
                      {exportProgress.current.toLocaleString()} products loaded
                    </p>
                  )}
                </div>
              )}

              {exportError && (
                <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                <button
                  type="button"
                  onClick={() => setShowExport(false)}
                  disabled={isExporting}
                  className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-900 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProductExport}
                  disabled={isExporting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between text-white">
              <h2 className="text-xl font-bold">Import Products</h2>
              <button onClick={() => setShowImport(false)} disabled={isSubmitting} className="text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <CSVImporter 
                title="Bulk Upload Products"
                expectedHeaders={['name', 'description', 'price', 'category', 'stock', 'image', 'is_new', 'is_sale']}
                onValidate={validateCSVRows}
                onBatch={handleCSVBatch}
                onComplete={handleCSVComplete}
                onBusyChange={setIsSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
