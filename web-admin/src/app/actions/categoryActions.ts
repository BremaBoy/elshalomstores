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

export async function fetchCategories() {
  try {
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin.from('categories').select('*').order('name')
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function saveCategory(data: any) {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin.from('categories').upsert([data])
    if (error) throw error
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
