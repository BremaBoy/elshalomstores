import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Auth client — uses anon key with persistent session for login/logout
// Use this for: supabase.auth.signInWithPassword, signOut, onAuthStateChange
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

// Admin DB client — uses service role key to bypass RLS for write operations
// Use this for: products, orders, categories, admins table queries
// NEVER expose this key in the customer-facing app
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
