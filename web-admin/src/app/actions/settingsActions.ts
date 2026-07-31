'use server'

import { createClient } from '@/lib/supabase-server'
import { requireSuperAdmin } from '@/lib/admin-auth'

export async function fetchSettings() {
  try {
    await requireSuperAdmin()
    const supabase = await createClient()
    const { data, error } = await supabase.from('settings').select('key, value')
    if (error) throw error
    return { success: true, data: Object.fromEntries((data || []).map(row => [row.key, row.value])) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to load settings.' }
  }
}

export async function saveSettings(settings: Record<string, string>) {
  try {
    await requireSuperAdmin()
    const supabase = await createClient()
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }))
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unable to save settings.' }
  }
}
