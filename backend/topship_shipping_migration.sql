-- Topship checkout fields. Run this once in the Supabase SQL editor.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS provider_shipment_id TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS provider_payload JSONB;
