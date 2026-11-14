-- =========================================================================
-- FragranceHub Price Trends Cleanup: Delete Duplicates and Anomalies
-- Run in Supabase SQL Editor to permanently purge archived duplicate/outlier rows
-- =========================================================================

-- 1. Delete duplicate historical rows
DELETE FROM public.price_trends
WHERE format = 'duplicate_archived';

-- 2. Delete mistagged outliers (deodorants/attars/typos that fell > 50% from bottle median)
DELETE FROM public.price_trends
WHERE format = 'outlier_anomalous';

-- 3. Delete decant rows from bottle price trends (so decant quotes don't collide with bottles)
DELETE FROM public.price_trends
WHERE format = 'decant';
