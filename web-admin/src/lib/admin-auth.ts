import { createClient } from '@/lib/supabase-server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in.')

  const { data: admin } = await supabase
    .from('admins')
    .select('id, name, email, role, status')
    .eq('id', user.id)
    .maybeSingle()

  if (!admin || admin.status !== 'active' || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
    throw new Error('An active administrator account is required.')
  }
  return admin
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin()
  if (admin.role !== 'SUPER_ADMIN') throw new Error('Super Admin access is required.')
  return admin
}
