'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

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

export async function bulkImportProducts(products: any[]) {
  try {
    const supabaseAdmin = getAdminClient()
    
    const uniqueCategoryInputs = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
    const { data: existingCategories } = await supabaseAdmin.from('categories').select('id, name')
    
    const categoryMap: Record<string, string> = {}
    existingCategories?.forEach(cat => {
      categoryMap[cat.name.toLowerCase().trim()] = cat.id
      categoryMap[cat.id] = cat.id
    })

    for (const catInput of uniqueCategoryInputs) {
      const lowInput = String(catInput).toLowerCase().trim()
      if (!categoryMap[lowInput]) {
        const { data: newCat, error: catError } = await supabaseAdmin
          .from('categories')
          .insert([{ name: catInput }])
          .select()
          .single()
        
        if (!catError && newCat) {
          categoryMap[lowInput] = newCat.id
        } else if (existingCategories && existingCategories.length > 0) {
          categoryMap[lowInput] = existingCategories[0].id
        }
      }
    }

    const finalProducts = products.map(p => ({
      ...p,
      category: categoryMap[String(p.category).toLowerCase().trim()] || (existingCategories?.[0]?.id || p.category)
    }))

    const chunkSize = 50
    for (let i = 0; i < finalProducts.length; i += chunkSize) {
      const chunk = finalProducts.slice(i, i + chunkSize)
      const { error } = await supabaseAdmin.from('products').insert(chunk)
      if (error) throw error
    }
    
    revalidatePath('/dashboard/products')
    return { success: true, count: finalProducts.length }
  } catch (error: any) {
    console.error('Bulk Import Error:', error)
    return { success: false, error: error.message }
  }
}
