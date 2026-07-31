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

async function findAuthUserByEmail(email: string) {
  const supabaseAdmin = getAdminClient()
  const normalizedEmail = email.trim().toLowerCase()

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const match = data.users.find(user => user.email?.toLowerCase() === normalizedEmail)
    if (match) return match
    if (data.users.length < 1000) break
  }
  return null
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
    let isNewUser = false
    let notificationMessage = 'Administrator updated successfully.'
    if (!adminId) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://elshalomstores1.vercel.app'
      const callbackUrl = `${adminUrl.replace(/\/+$/, '')}/auth/confirm`
      const existingUser = await findAuthUserByEmail(data.email)

      if (existingUser) {
        adminId = existingUser.id
        const { error: notificationError } = await supabaseAdmin.auth.signInWithOtp({
          email: data.email,
          options: { shouldCreateUser: false, emailRedirectTo: callbackUrl },
        })
        if (notificationError) throw notificationError
        notificationMessage = 'Existing user promoted and sent an administrator sign-in email.'
      } else {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          data.email,
          {
            redirectTo: callbackUrl,
            data: {
              role: data.role,
              full_name: data.name,
              name: data.name,
              admin_onboarding_required: true,
            },
          }
        )
        if (authError) throw authError
        adminId = authUser.user.id
        isNewUser = true
        notificationMessage = 'New user invited. They must complete onboarding after accepting the email.'
      }
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
      onboarding_completed: isNewUser ? false : (data.onboarding_completed ?? true),
      created_at: data.created_at || new Date().toISOString()
    }

    const { error: upsertError } = await supabaseAdmin.from('admins').upsert([adminData])
    if (upsertError) throw upsertError

    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(adminId, {
      app_metadata: { role: data.role },
      user_metadata: {
        role: data.role,
        status: adminData.status,
        name: data.name,
        full_name: data.name,
        admin_onboarding_required: !adminData.onboarding_completed,
      },
      ban_duration: adminData.status === 'suspended' ? '876000h' : 'none',
    })
    if (metadataError) throw metadataError
    revalidatePath('/dashboard/admins')
    return { success: true, message: notificationMessage }
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
