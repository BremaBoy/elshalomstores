-- Phase 5: Order Tracking & Notification System Migration

-- 1. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHIPMENTS TABLE (Enhancement)
-- Drop existing if we want to ensure schema matches requirements
-- DROP TABLE IF EXISTS shipments; 
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    courier TEXT,
    tracking_number TEXT,
    shipping_method TEXT,
    estimated_delivery TIMESTAMPTZ,
    status TEXT DEFAULT 'Pending',
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOTIFICATIONS TABLE
-- DROP TABLE IF EXISTS notifications;
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT, -- 'order', 'promo', 'system'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS for new tables
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- 6. Policies for Order History & Shipments
CREATE POLICY "Users can view own order history" ON order_status_history 
    FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Users can view own shipments" ON shipments 
    FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

-- Admins can do everything
CREATE POLICY "Admins can manage order history" ON order_status_history FOR ALL USING (public.is_super_admin());
CREATE POLICY "Admins can manage shipments" ON shipments FOR ALL USING (public.is_super_admin());
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (public.is_super_admin());
