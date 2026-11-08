/**
 * Full Migration Script: Migrates all 1,188 fragrances (with full price history,
 * drops, new arrivals, decants, sellers) + sync_metadata into Supabase.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Auto-load .env if environment variables are not set in the shell
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log("🚀 Starting complete data migration to Supabase...");

  // 1. Verify connection and schema
  const { data: testCheck, error: testErr } = await supabase.from('fragrances').select('id, is_price_drop').limit(1);
  if (testErr) {
    if (testErr.message.includes('is_price_drop')) {
      console.error("\n❌ Schema not updated yet! Please execute 'supabase_migration.sql' in your Supabase SQL Editor first.");
      console.error("Error details:", testErr.message);
      process.exit(1);
    } else {
      console.error("❌ Connection error:", testErr.message);
      process.exit(1);
    }
  }
  console.log("✓ Connected to Supabase and verified schema has is_price_drop column!");

  // 2. Load current local data
  const fragrancesPath = path.join(__dirname, '../src/data/fragrances.json');
  const syncMetaPath = path.join(__dirname, '../src/data/sync_meta.json');
  const highlightsPath = path.join(__dirname, '../src/data/curated_highlights.json');

  const fragrances = JSON.parse(fs.readFileSync(fragrancesPath, 'utf-8'));
  const syncMeta = fs.existsSync(syncMetaPath) ? JSON.parse(fs.readFileSync(syncMetaPath, 'utf-8')) : {};
  const highlights = fs.existsSync(highlightsPath) ? JSON.parse(fs.readFileSync(highlightsPath, 'utf-8')) : {};

  console.log(`\n📦 Uploading ${fragrances.length} fragrances to Supabase with full price action...`);

  const CHUNK_SIZE = 50;
  let totalUploaded = 0;

  for (let i = 0; i < fragrances.length; i += CHUNK_SIZE) {
    const chunk = fragrances.slice(i, i + CHUNK_SIZE).map(f => ({
      id: f.id,
      name: f.name,
      brand: f.brand,
      rating_value: f.rating_value,
      rating_count: f.rating_count,
      collection: f.collection,
      concentration: f.concentration,
      primary_season: f.primary_season,
      day_night: f.day_night,
      longevity: f.longevity,
      sillage: f.sillage,
      gender: f.gender,
      dna_type: f.dna_type,
      dna_inspiration: f.dna_inspiration,
      description: f.description,
      notes: f.notes,
      top_notes: f.top_notes || (f.notes?.top) || [],
      middle_notes: f.middle_notes || (f.notes?.middle) || [],
      base_notes: f.base_notes || (f.notes?.base) || [],
      accords: f.accords || [],
      review_summary: f.review_summary,
      seasons: f.seasons,
      release_year: f.release_year,
      flankers: f.flankers,
      dna_twins: f.dna_twins,
      in_seller_stock: !!f.in_seller_stock,
      community_price: f.community_price || null,
      has_decants: !!f.has_decants,
      lowest_decant_price: f.lowest_decant_price || null,
      community_sellers: f.community_sellers || [],
      community_decants: f.community_decants || [],
      decant_comparison: f.decant_comparison || null,
      best_bottle_seller: f.best_bottle_seller || null,
      best_decant_seller: f.best_decant_seller || null,
      is_price_drop: !!f.is_price_drop,
      previous_price: f.previous_price || null,
      price_change: f.price_change || null,
      price_change_percentage: f.price_change_percentage || null,
      price_change_date: f.price_change_date || null,
      price_change_time: f.price_change_time || null,
      previous_price_date: f.previous_price_date || null,
      price_history: f.price_history || [],
      is_new_arrival: !!f.is_new_arrival,
      new_arrival_date: f.new_arrival_date || null,
      discovered_at: f.discovered_at || (f.new_arrival_date ? new Date(f.new_arrival_date).toISOString() : null),
      price_updated_at: f.price_updated_at || null,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('fragrances').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`  Warning: Chunk ${i} - ${i + chunk.length} error:`, error.message);
    } else {
      totalUploaded += chunk.length;
      process.stdout.write(`  Uploaded ${totalUploaded}/${fragrances.length} fragrances...\r`);
    }
  }

  console.log(`\n✓ Successfully synced all ${totalUploaded} fragrances with complete price action!`);

  // 3. Upload sync_metadata
  console.log("\n📊 Uploading sync_metadata and seller breakdown to Supabase...");
  const metaPayload = {
    id: 'latest',
    last_sync: syncMeta.last_sync || new Date().toISOString(),
    sync_date: syncMeta.sync_date || new Date().toISOString().split('T')[0],
    catalog_total: syncMeta.catalog_total || fragrances.length,
    in_stock_count: syncMeta.in_stock_count || 0,
    decants_available_count: syncMeta.decants_available_count || 0,
    dual_available_count: syncMeta.dual_available_count || 0,
    enriched_new_arrivals_count: syncMeta.enriched_new_arrivals_count || 0,
    price_drops_count: syncMeta.price_drops_count || 0,
    new_arrivals_count: syncMeta.new_arrivals_count || 0,
    active_price_drops: syncMeta.active_price_drops || [],
    active_new_arrivals: syncMeta.active_new_arrivals || [],
    seller_breakdown: syncMeta.seller_breakdown || {},
    seller_counts: highlights.sellerCounts || {},
    updated_at: new Date().toISOString()
  };

  const { error: metaErr } = await supabase.from('sync_metadata').upsert([metaPayload], { onConflict: 'id' });
  if (metaErr) {
    console.error("  Warning: sync_metadata error:", metaErr.message);
  } else {
    console.log("✓ Successfully saved sync_metadata to Supabase!");
  }

  console.log("\n🎉 Full migration to Supabase completed successfully!");
}

runMigration();
