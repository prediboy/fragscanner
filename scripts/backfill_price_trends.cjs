const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillPriceTrends() {
  console.log('Testing connection to public.price_trends table in Supabase...');

  const { error: testErr } = await supabase.from('price_trends').select('id').limit(1);
  if (testErr) {
    console.error('\n⚠️ The table "public.price_trends" does not exist in Supabase yet.');
    console.error('Please run the migration SQL script in your Supabase SQL Editor:');
    console.error('   File: supabase_price_trends_migration.sql\n');
    console.error('Error detail:', testErr.message);
    return;
  }

  console.log('✅ "price_trends" table is ready. Starting historical backfill...\n');

  // 1. Fetch all fragrances with price_history and community_sellers
  let allFrags = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, name, brand, community_price, best_bottle_seller, price_history, community_sellers, community_decants, updated_at')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    allFrags = allFrags.concat(data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Loaded ${allFrags.length} fragrances from catalog.`);

  const recordsToInsert = [];
  const seenKeys = new Set();

  const addRecord = (rec) => {
    if (!rec.fragrance_id || !rec.price || isNaN(Number(rec.price))) return;
    const key = `${rec.fragrance_id}::${rec.seller_name}::${rec.format}::${rec.size || ''}::${rec.price}::${(rec.recorded_at || '').slice(0, 16)}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    recordsToInsert.push({
      fragrance_id: rec.fragrance_id,
      fragrance_name: rec.fragrance_name,
      brand: rec.brand,
      seller_name: rec.seller_name || 'Verified Seller',
      seller_id: rec.seller_id || null,
      format: rec.format || 'retail',
      size: rec.size || null,
      volume_ml: rec.volume_ml || null,
      price: Number(rec.price),
      previous_price: rec.previous_price ? Number(rec.previous_price) : null,
      price_change: rec.price_change ? Number(rec.price_change) : null,
      is_best_price: Boolean(rec.is_best_price),
      source: rec.source || 'seller_sync',
      recorded_at: rec.recorded_at || new Date().toISOString()
    });
  };

  // Process fragrances.price_history
  allFrags.forEach(f => {
    if (Array.isArray(f.price_history)) {
      f.price_history.forEach(ph => {
        addRecord({
          fragrance_id: f.id,
          fragrance_name: f.name,
          brand: f.brand,
          seller_name: ph.seller || ph.seller_name || f.best_bottle_seller || 'Verified Seller',
          seller_id: ph.seller_id || null,
          format: 'retail',
          size: ph.size || 'Retail Bottle',
          price: ph.price,
          is_best_price: true,
          source: 'catalog_snapshot',
          recorded_at: ph.timestamp || (ph.date ? `${ph.date}T${ph.time || '12:00:00'}Z` : f.updated_at)
        });
      });
    }

    // Process current live community_sellers
    if (Array.isArray(f.community_sellers)) {
      f.community_sellers.forEach(s => {
        addRecord({
          fragrance_id: f.id,
          fragrance_name: f.name,
          brand: f.brand,
          seller_name: s.seller_name,
          seller_id: s.seller_id,
          format: s.is_tester ? 'tester' : 'retail',
          size: s.size,
          volume_ml: s.volume_ml,
          price: s.price,
          is_best_price: Number(s.price) === Number(f.community_price),
          source: 'seller_sync',
          recorded_at: f.updated_at || new Date().toISOString()
        });
      });
    }

    // Process current live community_decants
    if (Array.isArray(f.community_decants)) {
      f.community_decants.forEach(d => {
        const sizes = ['2ml', '5ml', '10ml', '30ml'];
        sizes.forEach(sz => {
          if (d[sz] && !isNaN(Number(d[sz]))) {
            addRecord({
              fragrance_id: f.id,
              fragrance_name: f.name,
              brand: f.brand,
              seller_name: d.seller_name,
              seller_id: d.seller_id,
              format: 'decant',
              size: sz,
              volume_ml: parseInt(sz, 10),
              price: Number(d[sz]),
              is_best_price: false,
              source: 'seller_sync',
              recorded_at: f.updated_at || new Date().toISOString()
            });
          }
        });
      });
    }
  });

  // 2. Process wardrobe_logs for WhatsApp lead price observations
  const { data: logs } = await supabase
    .from('wardrobe_logs')
    .select('liked_perfumes, created_at')
    .eq('umbrella_title', 'EVENT:whatsapp_click');

  if (logs) {
    logs.forEach(l => {
      const it = l.liked_perfumes?.[0];
      if (it && it.name && it.price) {
        // Find matching fragrance_id if possible
        const matchedFrag = allFrags.find(f => 
          f.name.toLowerCase() === it.name.toLowerCase() ||
          `${f.brand} ${f.name}`.toLowerCase() === `${it.brand} ${it.name}`.toLowerCase()
        );
        addRecord({
          fragrance_id: matchedFrag ? matchedFrag.id : it.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          fragrance_name: it.name,
          brand: it.brand || (matchedFrag ? matchedFrag.brand : 'Unknown'),
          seller_name: it.seller_name,
          format: it.format || 'retail',
          price: it.price,
          is_best_price: false,
          source: 'whatsapp_lead',
          recorded_at: l.created_at
        });
      }
    });
  }

  console.log(`Prepared ${recordsToInsert.length} distinct historical price records for backfill.`);

  // 3. Batch insert into price_trends
  const chunkSize = 100;
  let inserted = 0;
  for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
    const chunk = recordsToInsert.slice(i, i + chunkSize);
    const { error: insErr } = await supabase.from('price_trends').insert(chunk);
    if (insErr) {
      console.warn(`Chunk ${i} insert error:`, insErr.message);
    } else {
      inserted += chunk.length;
    }
    if ((i + chunkSize) % 500 === 0 || i + chunkSize >= recordsToInsert.length) {
      console.log(`Backfill progress: ${Math.min(i + chunkSize, recordsToInsert.length)} / ${recordsToInsert.length} rows inserted...`);
    }
  }

  console.log(`\n🎉 Backfill complete! Successfully inserted ${inserted} price trend records into public.price_trends.`);
}

backfillPriceTrends().catch(err => {
  console.error('Backfill fatal error:', err);
});
