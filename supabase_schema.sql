-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  image TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  discount_price DECIMAL(12, 2),
  image TEXT,
  category TEXT REFERENCES categories(id),
  rating DECIMAL(3, 2) DEFAULT 0,
  is_new BOOLEAN DEFAULT FALSE,
  is_sale BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES TABLE (for Cart Sync)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  cart JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  shipping_details JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'ADMIN', -- 'ADMIN' or 'SUPER_ADMIN'
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) policies

-- 6. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(12, 2) NOT NULL,
  min_order_amount DECIMAL(12, 2) DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  usage_limit INTEGER DEFAULT NULL,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) policies

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- ─── CATEGORIES POLICIES ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read-only access to categories" ON categories;
DROP POLICY IF EXISTS "Super admins can manage categories" ON categories;
CREATE POLICY "Allow public read-only access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Super admins can manage categories" ON categories 
  FOR ALL USING (public.is_super_admin());

-- ─── PRODUCTS POLICIES ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read-only access to products" ON products;
DROP POLICY IF EXISTS "Super admins can manage products" ON products;
CREATE POLICY "Allow public read-only access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Super admins can manage products" ON products 
  FOR ALL USING (public.is_super_admin());

-- ─── PROFILES (CUSTOMERS) POLICIES ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Super admins can manage all profiles" ON profiles 
  FOR ALL USING (public.is_super_admin());

-- ─── ORDERS POLICIES ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Super admins can manage all orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Super admins can manage all orders" ON orders 
  FOR ALL USING (public.is_super_admin());

-- ─── ADMINS POLICIES ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Admins can view own record" ON admins;
DROP POLICY IF EXISTS "Super admins can manage all admins" ON admins;
CREATE POLICY "Super admins can manage all admins" ON admins 
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Admins can view own record" ON admins FOR SELECT USING (auth.uid() = id);

-- ─── COUPONS POLICIES ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Super admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Public can view active coupons" ON coupons;
CREATE POLICY "Super admins can manage coupons" ON coupons 
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Public can view active coupons" ON coupons 
  FOR SELECT USING (is_active = true AND (expiry_date IS NULL OR expiry_date > NOW()));

-- Trigger to create profile or admin record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- If email is in the designated super admin list, add to admins table
  IF NEW.email IN ('turaholowe@gmail.com', 'brematech27@gmail.com') THEN
    INSERT INTO public.admins (id, name, email, role, status)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, 'SUPER_ADMIN', 'active');
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to check if an admin exists by email (for forgot password validation)
CREATE OR REPLACE FUNCTION public.check_admin_exists(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE email = email_to_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
