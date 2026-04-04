import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Auth client — uses @supabase/ssr for cookie-based sessions
// Use this for: supabaseAuth.auth.signInWithPassword, signOut, onAuthStateChange
export const supabaseAuth = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Admin DB client — uses service role key to bypass RLS for write operations
// Use this for: products, orders, categories, admins table queries
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
