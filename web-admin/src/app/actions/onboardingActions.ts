'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function completeAdminOnboarding(data: {
  fullName: string
  phone: string
  password: string
}) {
  try {
    const fullName = data.fullName.trim()
    if (fullName.length < 3) throw new Error('Please enter your full name.')
    if (data.password.length < 8) throw new Error('Password must be at least 8 characters.')

    const admin = await requireAdmin()
    if (admin.onboarding_completed !== false) {
      throw new Error('This administrator profile has already completed onboarding.')
    }
    const supabase = await createClient()
    const { error: passwordError } = await supabase.auth.updateUser({
      password: data.password,
      data: {
        name: fullName,
        full_name: fullName,
        phone: data.phone.trim(),
        admin_onboarding_required: false,
      },
    })
    if (passwordError) throw passwordError

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.')
    const serviceClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error: profileError } = await serviceClient.from('profiles').upsert({
      id: admin.id,
      full_name: fullName,
      phone: data.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    if (profileError) throw profileError

    const { error: adminError } = await serviceClient
      .from('admins')
      .update({ name: fullName, onboarding_completed: true })
      .eq('id', admin.id)
    if (adminError) throw adminError

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to complete onboarding.' }
  }
}
