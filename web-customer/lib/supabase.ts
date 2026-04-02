import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for Browser Components
export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)

// Export a default instance for backward compatibility in client components
export const supabase = createClient()
