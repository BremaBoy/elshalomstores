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

export async function fetchAdmins() {
  try {
    const supabaseAdmin = getAdminClient()
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .order('role', { ascending: false })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Fetch Admins Error:', error)
    return { success: false, error: error.message }
  }
}

export async function saveAdmin(data: any) {
  try {
    const supabaseAdmin = getAdminClient()
    
    // Ensure we have an ID for new admins
    const adminData = {
      ...data,
      id: data.id || crypto.randomUUID(),
      created_at: data.created_at || new Date().toISOString()
    }

    const { error } = await supabaseAdmin.from('admins').upsert([adminData])
    if (error) throw error
    
    revalidatePath('/dashboard/admins')
    return { success: true }
  } catch (error: any) {
    console.error('Save Admin Error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateAdminStatus(id: string, status: 'active' | 'suspended') {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin
      .from('admins')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error
    revalidatePath('/dashboard/admins')
    return { success: true }
  } catch (error: any) {
    console.error('Update Status Error:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteAdmin(id: string) {
  try {
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    revalidatePath('/dashboard/admins')
    return { success: true }
  } catch (error: any) {
    console.error('Delete Admin Error:', error)
    return { success: false, error: error.message }
  }
}
