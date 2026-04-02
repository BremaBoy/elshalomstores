-- ELSHALOMSTORES MASTER SCHEMA FIX
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/yevreptswbayuxmxlblt/sql)

-- 1. FIX PRODUCTS TABLE
-- Ensure 'stock' exists and 'status' is added
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending'));

-- (Optional) If you prefer 'quantity' as the column name, run this:
-- ALTER TABLE products RENAME COLUMN stock TO quantity;
-- BUT the current code is being synced to use 'stock' to match your initial schema.

-- 2. CREATE MISSING TABLES FOR RELATIONAL LOGIC
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    previous_qty INTEGER NOT NULL,
    change_qty INTEGER NOT NULL,
    new_qty INTEGER NOT NULL,
    reason TEXT,
    admin_id TEXT, -- Can be UUID or 'system'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- 4. BASIC POLICIES (drop first to avoid duplicates)
DROP POLICY IF EXISTS "Public read order items" ON order_items;
DROP POLICY IF EXISTS "Users manage own cart" ON cart_items;
DROP POLICY IF EXISTS "Admins manage inventory logs" ON inventory_logs;

CREATE POLICY "Public read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage inventory logs" ON inventory_logs FOR ALL USING (true); -- Adjust as needed
