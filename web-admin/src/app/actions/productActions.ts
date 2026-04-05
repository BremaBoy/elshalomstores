'use server'

import { createClient } from '@supabase/supabase-js'

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
