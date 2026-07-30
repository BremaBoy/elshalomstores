'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

interface BulkImportProduct {
  name: string
  description?: string | number | null
  price: string | number | null
  discount_price?: string | number | null
  image?: string | number | null
  category: string
  stock?: string | number | null
  is_new?: boolean
  is_sale?: boolean
  status?: 'active' | 'pending'
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function fetchProductsForOrder() {
  try {
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, name, price, stock, image')
      .order('name')

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('fetchProductsForOrder error:', error)
    return { success: false, error: error.message }
  }
}

export async function fetchInventory() {
  try {
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('stock', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('fetchInventory error:', error)
    return { success: false, error: error.message }
  }
}

export async function createProduct(data: any) {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin.from('products').insert([data])
    if (error) throw error
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin.from('products').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadImage(formData: FormData, bucket: string = 'products') {
  try {
    const supabaseAdmin = getAdminClient()
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    await supabaseAdmin.storage.createBucket(bucket, { public: true })

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error('Upload Error:', error)
    return { success: false, error: error.message }
  }
}

export async function bulkImportProducts(products: BulkImportProduct[]) {
  try {
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('No products were supplied for import.')
    }
    if (products.length > 2000) {
      throw new Error('A single CSV import is limited to 2,000 products.')
    }

    const supabaseAdmin = getAdminClient()
    const uniqueCategoryInputs = Array.from(
      new Set(products.map(product => String(product.category || '').trim()).filter(Boolean))
    )
    const { data: existingCategories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
    if (categoriesError) throw categoriesError
    
    const categoryMap: Record<string, string> = {}
    existingCategories?.forEach(cat => {
      categoryMap[cat.name.toLowerCase().trim()] = cat.id
      categoryMap[String(cat.id).toLowerCase().trim()] = cat.id
    })

    for (const catInput of uniqueCategoryInputs) {
      const lowInput = catInput.toLowerCase()
      if (!categoryMap[lowInput]) {
        const baseId =
          catInput
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `category-${Date.now()}`
        let categoryId = baseId
        let suffix = 2
        while (Object.values(categoryMap).includes(categoryId)) {
          categoryId = `${baseId}-${suffix}`
          suffix += 1
        }

        const { data: newCat, error: catError } = await supabaseAdmin
          .from('categories')
          .insert([{ id: categoryId, name: catInput }])
          .select('id, name')
          .single()
        
        if (catError) throw new Error(`Could not create category "${catInput}": ${catError.message}`)
        if (!newCat) throw new Error(`Could not create category "${catInput}".`)
        categoryMap[lowInput] = newCat.id
        categoryMap[String(newCat.id).toLowerCase()] = newCat.id
      }
    }

    const finalProducts = products.map((product, index) => {
      const categoryKey = String(product.category || '').toLowerCase().trim()
      const category = categoryMap[categoryKey]
      const price = Number(product.price)
      const stock = Number(product.stock ?? 0)
      if (!String(product.name || '').trim()) throw new Error(`Row ${index + 2}: product name is required.`)
      if (!Number.isFinite(price) || price < 0) throw new Error(`Row ${index + 2}: price is invalid.`)
      if (!category) throw new Error(`Row ${index + 2}: category is invalid.`)
      if (!Number.isFinite(stock) || stock < 0) throw new Error(`Row ${index + 2}: stock is invalid.`)

      const discountPrice =
        product.discount_price === null || product.discount_price === undefined
          ? null
          : Number(product.discount_price)

      return {
        name: String(product.name).trim(),
        description: String(product.description || 'No description provided.').trim(),
        price,
        discount_price:
          discountPrice !== null && Number.isFinite(discountPrice) && discountPrice >= 0
            ? discountPrice
            : null,
        image: String(product.image || '').trim(),
        category,
        stock: Math.trunc(stock),
        is_new: Boolean(product.is_new),
        is_sale: Boolean(product.is_sale),
        status: product.status === 'active' ? 'active' : 'pending',
      }
    })

    const chunkSize = 50
    let importedCount = 0
    for (let i = 0; i < finalProducts.length; i += chunkSize) {
      const chunk = finalProducts.slice(i, i + chunkSize)
      const { error } = await supabaseAdmin.from('products').insert(chunk)
      if (error) {
        throw new Error(
          `${importedCount} product(s) were imported before a database error stopped the import: ${error.message}`
        )
      }
      importedCount += chunk.length
    }
    
    revalidatePath('/dashboard/products')
    return { success: true, count: importedCount }
  } catch (error: unknown) {
    console.error('Bulk Import Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'The products could not be imported.',
    }
  }
}
