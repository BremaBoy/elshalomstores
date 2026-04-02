-- 1. DEFINE MISSING ADMIN FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() 
    AND role = 'SUPER_ADMIN' 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENSURE USER IS REGISTERED (IMPORTANT: Replace 'YOUR_EMAIL' below)
DO $$
DECLARE
    user_id_found UUID;
    user_email TEXT := 'YOUR_EMAIL'; -- <--- CHANGE THIS
BEGIN
    SELECT id INTO user_id_found FROM auth.users WHERE email = user_email;

    IF user_id_found IS NOT NULL THEN
        INSERT INTO public.admins (id, email, name, role, status)
        VALUES (user_id_found, user_email, 'Master Admin', 'SUPER_ADMIN', 'active')
        ON CONFLICT (id) DO UPDATE SET 
            role = 'SUPER_ADMIN',
            status = 'active';
    END IF;
END $$;
