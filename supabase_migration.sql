-- =========================================================================
-- FragranceHub Complete Schema Migration for Supabase
-- Run this script in the Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Add all price action, history, and status tracking columns to fragrances
ALTER TABLE public.fragrances
  ADD COLUMN IF NOT EXISTS is_price_drop BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS previous_price NUMERIC,
  ADD COLUMN IF NOT EXISTS price_change NUMERIC,
  ADD COLUMN IF NOT EXISTS price_change_percentage NUMERIC,
  ADD COLUMN IF NOT EXISTS price_change_date TEXT,
  ADD COLUMN IF NOT EXISTS price_change_time TEXT,
  ADD COLUMN IF NOT EXISTS previous_price_date TEXT,
  ADD COLUMN IF NOT EXISTS price_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS new_arrival_date TEXT,
  ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ;

-- Create indexes for ultra-fast filtering on deals and new arrivals
CREATE INDEX IF NOT EXISTS idx_fragrances_is_price_drop ON public.fragrances(is_price_drop) WHERE is_price_drop = true;
CREATE INDEX IF NOT EXISTS idx_fragrances_is_new_arrival ON public.fragrances(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_fragrances_brand_lower ON public.fragrances(LOWER(brand));

-- 2. Create sync_metadata table to capture all scraper sync runs & seller stats
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  id TEXT PRIMARY KEY DEFAULT 'latest',
  last_sync TIMESTAMPTZ,
  sync_date TEXT,
  catalog_total INTEGER DEFAULT 0,
  in_stock_count INTEGER DEFAULT 0,
  decants_available_count INTEGER DEFAULT 0,
  dual_available_count INTEGER DEFAULT 0,
  enriched_new_arrivals_count INTEGER DEFAULT 0,
  price_drops_count INTEGER DEFAULT 0,
  new_arrivals_count INTEGER DEFAULT 0,
  active_price_drops JSONB DEFAULT '[]'::jsonb,
  active_new_arrivals JSONB DEFAULT '[]'::jsonb,
  seller_breakdown JSONB DEFAULT '{}'::jsonb,
  seller_counts JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Configure Row Level Security (RLS) policies
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read of sync_metadata
DROP POLICY IF EXISTS "Allow public read sync_metadata" ON public.sync_metadata;
CREATE POLICY "Allow public read sync_metadata"
  ON public.sync_metadata FOR SELECT
  USING (true);

-- Allow public upsert/update of sync_metadata (for automated sync scripts)
DROP POLICY IF EXISTS "Allow public upsert sync_metadata" ON public.sync_metadata;
CREATE POLICY "Allow public upsert sync_metadata"
  ON public.sync_metadata FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure public can read, insert and update fragrances
DROP POLICY IF EXISTS "Allow public read fragrances" ON public.fragrances;
CREATE POLICY "Allow public read fragrances"
  ON public.fragrances FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert fragrances" ON public.fragrances;
CREATE POLICY "Allow public insert fragrances"
  ON public.fragrances FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update fragrances" ON public.fragrances;
CREATE POLICY "Allow public update fragrances"
  ON public.fragrances FOR UPDATE
  USING (true)
  WITH CHECK (true);
