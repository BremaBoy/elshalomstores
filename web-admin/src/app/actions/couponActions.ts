'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { requireSuperAdmin } from '@/lib/admin-auth'

export async function saveCoupon(data: Record<string, unknown>, id?: string) {
  try {
    await requireSuperAdmin()
    const supabase = await createClient()
    const query = id
      ? supabase.from('coupons').update(data).eq('id', id)
      : supabase.from('coupons').insert(data)
    const { error } = await query
    if (error) throw error
    revalidatePath('/dashboard/coupons')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to save coupon.' }
  }
}

export async function deleteCoupon(id: string) {
  try {
    await requireSuperAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/coupons')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to delete coupon.' }
  }
}
