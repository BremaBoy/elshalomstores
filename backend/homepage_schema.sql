-- Migrations for Banners and Brands
-- To support dynamic homepage content

-- 1. Create banners/hero table
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link VARCHAR(255) DEFAULT '/shop',
    badge VARCHAR(50),
    cta_text VARCHAR(50) DEFAULT 'Shop Now',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    logo_url TEXT, -- URL to image
    logo_icon VARCHAR(50), -- Emoji or icon name as fallback
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert some initial dynamic data (optional, but requested to 'let everything be fetch from the db')
-- You can add your actual content here. 
