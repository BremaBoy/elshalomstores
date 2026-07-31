-- Admin dashboard support tables and role policies.
-- Run once in the Supabase SQL editor.

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
      AND status = 'active'
      AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admins manage settings" ON public.settings;
CREATE POLICY "Super admins manage settings" ON public.settings
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Admins manage the four operational modules; Super Admins inherit access.
DROP POLICY IF EXISTS "Active admins manage products" ON public.products;
CREATE POLICY "Active admins manage products" ON public.products
  FOR ALL USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Active admins manage categories" ON public.categories;
CREATE POLICY "Active admins manage categories" ON public.categories
  FOR ALL USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Active admins manage orders" ON public.orders;
CREATE POLICY "Active admins manage orders" ON public.orders
  FOR ALL USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Active admins view customers" ON public.profiles;
CREATE POLICY "Active admins view customers" ON public.profiles
  FOR SELECT USING (public.is_active_admin());
