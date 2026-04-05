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
    
    // 1. Fetch Orders
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    // 2. Fetch Profiles for these orders separately
    const userIds = Array.from(new Set((ordersData || []).map(o => o.user_id).filter(Boolean)))
    let profilesMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      if (!profilesError && profilesData) {
        profilesMap = profilesData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
      }
    }

    // 3. Format
    const formattedOrders = (ordersData || []).map((order: any) => ({
      ...order,
      users: { 
        name: profilesMap[order.user_id]?.full_name || 'Guest',
        email: 'N/A' // Email is in auth.users, keeping it simple for now or fetch via auth admin later if needed
      }
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
