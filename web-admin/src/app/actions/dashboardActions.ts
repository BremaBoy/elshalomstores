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

    // Log the configuration state (safely)
    console.log('Fetching dashboard stats from:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    // 1. Fetch Orders
    const { data: orders, error: oError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, status, payment_status, created_at, id, user_id')
    
    if (oError) {
      console.error('Orders fetch error:', oError)
      return { success: false, error: `Orders Error: ${oError.message}` }
    }

    // 2. Fetch Customers Count
    const { count: customers, error: cError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (cError) {
      console.error('Profiles fetch error:', cError)
      return { success: false, error: `Profiles Error: ${cError.message}` }
    }

    // 3. Fetch Products
    const { data: products, error: pError } = await supabaseAdmin
      .from('products')
      .select('stock')
    
    if (pError) {
      console.error('Products fetch error:', pError)
      return { success: false, error: `Products Error: ${pError.message}` }
    }

    // 4. Fetch Recent Orders with Profiles
    const { data: recentOrders, error: rError } = await supabaseAdmin
      .from('orders')
      .select(`
        id, 
        total_amount, 
        status, 
        created_at,
        profiles:user_id (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (rError) {
      console.error('Recent orders fetch error:', rError)
      // This is less critical; we can fallback for these
    }

    // Map recent orders to flatten the structure for the UI
    const formattedRecentOrders = (recentOrders || []).map((order: any) => ({
      ...order,
      users: { name: order.profiles?.full_name || 'Guest' }
    }))

    // Calculations
    const paidOrders = orders?.filter(o => o.payment_status === 'Paid') || []
    const totalAmount = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
    const revenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const pendingOrdersCount = orders?.filter(o => o.status?.toLowerCase() === 'pending').length || 0
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
      recentOrders: formattedRecentOrders,
      debug: { totalOrdersAmount: totalAmount }
    }

  } catch (error: any) {
    console.error('fetchDashboardStats critical catch:', error)
    return { success: false, error: `Critical Error: ${error.message}` }
  }
}
