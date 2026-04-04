'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
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

    // Ensure bucket exists (best effort, might fail if already exists but that's fine)
    await supabaseAdmin.storage.createBucket(bucket, { public: true })

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
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
    
    // 1. Resolve Categories: find all unique category strings (names or IDs)
    const uniqueCategoryInputs = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
    
    // 2. Fetch existing categories to map names to IDs
    const { data: existingCategories } = await supabaseAdmin.from('categories').select('id, name')
    
    const categoryMap: Record<string, string> = {}
    existingCategories?.forEach(cat => {
      categoryMap[cat.name.toLowerCase().trim()] = cat.id
      categoryMap[cat.id] = cat.id // support direct ID
    })

    // 3. Identify and create missing categories
    for (const catInput of uniqueCategoryInputs) {
      const lowInput = String(catInput).toLowerCase().trim()
      if (!categoryMap[lowInput]) {
        // Create new category if it doesn't exist
        const { data: newCat, error: catError } = await supabaseAdmin
          .from('categories')
          .insert([{ name: catInput }])
          .select()
          .single()
        
        if (!catError && newCat) {
          categoryMap[lowInput] = newCat.id
        } else if (existingCategories && existingCategories.length > 0) {
          // Fallback to first existing if creation fails (e.g. unique constraint race)
          categoryMap[lowInput] = existingCategories[0].id
        }
      }
    }

    // 4. Map products to their final category IDs
    const finalProducts = products.map(p => ({
      ...p,
      category: categoryMap[String(p.category).toLowerCase().trim()] || (existingCategories?.[0]?.id || p.category)
    }))

    // 5. Bulk insert in chunks of 50
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
