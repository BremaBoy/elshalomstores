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
    
    let adminId = data.id
    console.log('--- SAVE ADMIN START ---', { adminId, email: data.email })

    // If it's a new admin (no ID provided), we must create them in Auth first
    if (!adminId) {
      console.log('Creating new Auth user...')
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: Math.random().toString(36).slice(-12) + '!', // Stronger temp password
        email_confirm: true,
        user_metadata: { role: data.role, full_name: data.name }
      })

      if (authError) {
        console.error('Auth User Creation Failed:', authError)
        throw authError
      }
      
      adminId = authUser.user.id
      console.log('Auth User Created Successfully:', adminId)
    }

    // Sanitize data for the 'admins' table
    const adminData = {
      id: adminId,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status || 'active',
      created_at: data.created_at || new Date().toISOString()
    }

    console.log('Upserting admin metadata:', adminData)
    const { error: upsertError } = await supabaseAdmin.from('admins').upsert([adminData])
    
    if (upsertError) {
      console.error('Admins Upsert Failed:', upsertError)
      throw upsertError
    }
    
    console.log('Admin Saved Successfully')
    revalidatePath('/dashboard/admins')
    return { success: true }
  } catch (error: any) {
    console.error('Save Admin Detailed Error:', error)
    return { success: false, error: error.message || 'An unknown error occurred during admin creation.' }
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
