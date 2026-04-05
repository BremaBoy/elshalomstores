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

export async function fetchOrders() {
  try {
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name, id)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform profiles:user_id to users: { name } for compatibility
    const formattedOrders = (data || []).map((order: any) => ({
      ...order,
      users: { name: order.profiles?.full_name || 'Guest' }
    }))

    return { success: true, data: formattedOrders }
  } catch (error: any) {
    console.error('fetchOrders error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('updateOrderStatus error:', error)
    return { success: false, error: error.message }
  }
}

export async function createOrder(orderData: {
  user_id: string;
  items: any[];
  total_amount: number;
  shipping_details: any;
  payment_method: string;
  status: string;
}) {
  try {
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('createOrder error:', error)
    return { success: false, error: error.message }
  }
}
