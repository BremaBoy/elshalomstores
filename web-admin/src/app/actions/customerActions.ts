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

export async function fetchCustomers() {
  try {
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('fetchCustomers error:', error)
    return { success: false, error: error.message }
  }
}

export async function createCustomer(customerData: { full_name: string; email: string }) {
  try {
    const supabaseAdmin = getAdminClient()
    
    // Check if profile exists by email (if possible) or just try inserting
    // Note: Profiles are linked to auth.users. For manual admin creation, 
    // we might need to create an auth user first or just a profile if it's a guest-like order.
    // However, the schema has 'id UUID PRIMARY KEY REFERENCES auth.users(id)'.
    // This means we MUST have an auth user.
    
    // For now, let's assume we create a 'ghost' profile or the admin has to provide an ID.
    // Actually, a better way is to use supabaseAdmin.auth.admin.createUser
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: customerData.email,
      password: Math.random().toString(36).slice(-10), // Random password
      email_confirm: true,
      user_metadata: { full_name: customerData.full_name }
    })

    if (userError) throw userError

    // The trigger 'handle_new_user' in the schema should automatically create the profile.
    // Line 137 in supabase_schema.sql handles this.

    return { success: true, data: userData.user }
  } catch (error: any) {
    console.error('createCustomer error:', error)
    return { success: false, error: error.message }
  }
}
