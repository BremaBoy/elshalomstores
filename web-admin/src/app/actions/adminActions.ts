'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireSuperAdmin } from '@/lib/admin-auth'

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
    await requireSuperAdmin()
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
    const actor = await requireSuperAdmin()
    const supabaseAdmin = getAdminClient()
    
    let adminId = data.id
    if (!adminId) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://elshalomstores1.vercel.app'
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          redirectTo: `${adminUrl.replace(/\/+$/, '')}/auth/confirm`,
          data: { role: data.role, full_name: data.name, name: data.name },
        }
      )

      if (authError) {
        throw authError
      }
      adminId = authUser.user.id
    }

    if (adminId === actor.id && (data.role !== 'SUPER_ADMIN' || data.status === 'suspended')) {
      throw new Error('You cannot demote or suspend your own Super Admin account.')
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

    const { error: upsertError } = await supabaseAdmin.from('admins').upsert([adminData])
    if (upsertError) throw upsertError

    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(adminId, {
      app_metadata: { role: data.role },
      user_metadata: { role: data.role, status: adminData.status, name: data.name, full_name: data.name },
      ban_duration: adminData.status === 'suspended' ? '876000h' : 'none',
    })
    if (metadataError) throw metadataError
    revalidatePath('/dashboard/admins')
    return { success: true }
  } catch (error: any) {
    console.error('Save Admin Detailed Error:', error)
    return { success: false, error: error.message || 'An unknown error occurred during admin creation.' }
  }
}

export async function updateAdminStatus(id: string, status: 'active' | 'suspended') {
  try {
    const actor = await requireSuperAdmin()
    if (id === actor.id && status === 'suspended') {
      throw new Error('You cannot suspend your own Super Admin account.')
    }
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin
      .from('admins')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: status === 'suspended' ? '876000h' : 'none',
      user_metadata: { status },
    })
    if (authError) throw authError
    revalidatePath('/dashboard/admins')
    return { success: true }
  } catch (error: any) {
    console.error('Update Status Error:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteAdmin(id: string) {
  try {
    const actor = await requireSuperAdmin()
    if (id === actor.id) throw new Error('You cannot permanently delete your own account.')
    const supabaseAdmin = getAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) throw error
    revalidatePath('/dashboard/admins')
    return { success: true }
  } catch (error: any) {
    console.error('Delete Admin Error:', error)
    return { success: false, error: error.message }
  }
}
