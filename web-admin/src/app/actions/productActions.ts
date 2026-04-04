'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Private server-side client with Service Role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function createProduct(data: any) {
  try {
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
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function bulkImportProducts(products: any[]) {
  try {
    // Bulk insert in chunks of 50
    const chunkSize = 50
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize)
      const { error } = await supabaseAdmin.from('products').insert(chunk)
      if (error) throw error
    }
    
    revalidatePath('/dashboard/products')
    return { success: true, count: products.length }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
