'use server'

import { createClient } from '@supabase/supabase-js'

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

export async function fetchDashboardStats() {
  try {
    const supabaseAdmin = getAdminClient()

    // 1. Fetch Orders for revenue and status counts
    const { data: orders, error: oError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, status, payment_status, created_at, id, user_id')
    if (oError) throw oError

    // 2. Fetch Customers Count
    const { count: customers, error: cError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
    if (cError) throw cError

    // 3. Fetch Products and Stock
    const { data: products, error: pError } = await supabaseAdmin
      .from('products')
      .select('stock, status')
    if (pError) throw pError

    // 4. Fetch Recent Orders with User Names
    const { data: recentOrders, error: rError } = await supabaseAdmin
      .from('orders')
      .select(`
        id, 
        total_amount, 
        status, 
        created_at,
        users:user_id (name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    if (rError) throw rError

    // Calculations
    const paidOrders = orders?.filter(o => o.payment_status === 'Paid') || []
    const revenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const pendingOrdersCount = orders?.filter(o => o.status === 'Pending').length || 0
    const outOfStockCount = products?.filter(p => (p.stock || 0) <= 0).length || 0

    return {
      success: true,
      stats: {
        revenue,
        orders: orders?.length || 0,
        customers: customers || 0,
        products: products?.length || 0,
        outOfStock: outOfStockCount,
        pendingOrders: pendingOrdersCount
      },
      recentOrders: recentOrders || []
    }

  } catch (error: any) {
    console.error('fetchDashboardStats error:', error)
    return { success: false, error: error.message }
  }
}
