-- =========================================================================
-- FragranceHub Price Trends & History SQL Migration
-- Run this script in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Create the dedicated price_trends table
CREATE TABLE IF NOT EXISTS public.price_trends (
  id BIGSERIAL PRIMARY KEY,
  fragrance_id TEXT REFERENCES public.fragrances(id) ON DELETE CASCADE,
  fragrance_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_id TEXT,
  format TEXT NOT NULL DEFAULT 'retail', -- 'retail' | 'tester' | 'decant'
  size TEXT,                            -- e.g. '100ml', '5ml', '10ml', '50ml'
  volume_ml NUMERIC,
  price NUMERIC NOT NULL,
  previous_price NUMERIC,
  price_change NUMERIC,
  is_best_price BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'seller_sync',     -- 'seller_sync' | 'whatsapp_lead' | 'catalog_snapshot'
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for ultra-fast time-series queries and price trend charts
CREATE INDEX IF NOT EXISTS idx_price_trends_fragrance_time 
  ON public.price_trends(fragrance_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_trends_name_time 
  ON public.price_trends(LOWER(fragrance_name), recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_trends_brand 
  ON public.price_trends(LOWER(brand));

CREATE INDEX IF NOT EXISTS idx_price_trends_seller 
  ON public.price_trends(seller_name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_trends_format_time 
  ON public.price_trends(format, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_trends_recorded_at 
  ON public.price_trends(recorded_at DESC);

-- 3. Row Level Security (RLS) policies
ALTER TABLE public.price_trends ENABLE ROW LEVEL SECURITY;

-- Allow public read of price trends (for frontend price charts and analytics)
DROP POLICY IF EXISTS "Allow public read price_trends" ON public.price_trends;
CREATE POLICY "Allow public read price_trends"
  ON public.price_trends FOR SELECT
  USING (true);

-- Allow inserts from backend sync scripts and telemetry
DROP POLICY IF EXISTS "Allow public insert price_trends" ON public.price_trends;
CREATE POLICY "Allow public insert price_trends"
  ON public.price_trends FOR INSERT
  WITH CHECK (true);

-- Allow updates (for corrections / backfills)
DROP POLICY IF EXISTS "Allow public update price_trends" ON public.price_trends;
CREATE POLICY "Allow public update price_trends"
  ON public.price_trends FOR UPDATE
  USING (true)
  WITH CHECK (true);
