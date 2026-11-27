/**
 * Safe Perfume Picture Enrichment Script
 * --------------------------------------
 * Enriches catalog perfumes with authentic bottle pictures (small & large).
 * 
 * ZERO BLOCKERS ARCHITECTURE:
 * 1. AI Resolution: Resolves authentic Fragrantica numeric IDs via Gemini without hitting Fragrantica HTML.
 * 2. Direct Static CDN: Queries static image CDN (fimgs.net) which has NO Cloudflare challenge gates.
 * 3. Verified Seller Media Fallback: Cross-references Shopify CDN images (cdn.shopify.com) from Whiff Culture.
 * 4. Incremental Checkpointing: Saves state to data/perfume_images.json so it never re-processes completed perfumes.
 * 5. Safe Supabase Updates: Enriches the existing 'notes' JSONB column (image_url & image_large), and updates 'image_url' column if available.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Auto-load .env
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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const GEMINI_KEYS = [
  process.env.GEMINI_KEY2,
  process.env.GEMINI_API_KEY,
  process.env.VITE_GEMINI_API_KEY
].filter(Boolean);

const IMAGES_CACHE_PATH = path.join(__dirname, '../data/perfume_images.json');

const VERIFIED_CANONICAL_IDS = {
  'armaf-club-de-nuit-milestone': 64630,
  'armaf-club-de-nuit-intense-man': 27781,
  'armaf-club-de-nuit-sillage': 64105,
  'lattafa-khamrah': 75805,
  'lattafa-khamrah-qahwa': 88478,
  'afnan-9pm': 65521,
  'rasasi-hawas-for-him': 35749,
  'rasasi-daarej-pour-homme': 10228,
  'ahmed-al-maghribi-kaaf': 78248,
  'french-avenue-liquid-brun': 97412
};

const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Parse CLI flags
const args = process.argv.slice(2);
let runLimit = 30; // Default batch limit per run for fast, safe GitHub Action runs
let forceRecheck = false;
let dryRun = false;

args.forEach(arg => {
  if (arg.startsWith('--limit=')) {
    const val = arg.split('=')[1];
    runLimit = val === 'all' ? Infinity : parseInt(val, 10);
  } else if (arg === '--all') {
    runLimit = Infinity;
  } else if (arg === '--force') {
    forceRecheck = true;
  } else if (arg === '--dry-run') {
    dryRun = true;
  }
});

function loadImagesCache() {
  if (fs.existsSync(IMAGES_CACHE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(IMAGES_CACHE_PATH, 'utf-8'));
    } catch (e) {
      console.warn('  Warning: Could not parse perfume_images.json, starting fresh.');
    }
  }
  return {};
}

function saveImagesCache(cache) {
  try {
    const dir = path.dirname(IMAGES_CACHE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(IMAGES_CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (e) {
    console.warn('  Warning: Failed to save perfume_images.json:', e.message);
  }
}

async function checkImageHead(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    return res.ok && res.status === 200;
  } catch (err) {
    return false;
  }
}

async function callGeminiJson(prompt, maxRetries = 3) {
  const models = ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
  const key = GEMINI_KEYS[0];
  if (!key) throw new Error('No Gemini API key available in environment');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const model = models[attempt - 1] || models[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (res.status === 429) {
        const wait = attempt * 3000;
        console.warn(`  [AI] Rate limit (429) on ${model}. Pausing ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        console.warn(`  [AI] Status ${res.status} from ${model}`);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        return null;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      try {
        return JSON.parse(rawText);
      } catch (e) {
        return null;
      }
    } catch (err) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1500));
      } else {
        return null;
      }
    }
  }
  return null;
}

// Build Whiff Culture Shopify image map as secondary fallback
async function loadSellerFallbackImages() {
  console.log('  ↳ Pre-loading verified seller media catalog (Whiff Culture Shopify CDN)...');
  const imageMap = new Map();
  try {
    let page = 1;
    while (page <= 8) {
      const url = `https://0dzeak-1m.myshopify.com/products.json?limit=250&page=${page}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.products || data.products.length === 0) break;

      for (const p of data.products) {
        if (p.images && p.images.length > 0 && p.images[0].src) {
          const imgSrc = p.images[0].src;
          // Store by handle and clean title
          const cleanTitle = p.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
          imageMap.set(cleanTitle, imgSrc);
          imageMap.set(p.handle, imgSrc);
        }
      }
      if (data.products.length < 250) break;
      page++;
    }
    console.log(`    ✓ Loaded ${imageMap.size} secondary image references.`);
  } catch (err) {
    console.warn('    Note: Secondary seller image lookup skipped:', err.message);
  }
  return imageMap;
}

async function main() {
  console.log('=========================================================');
  console.log('🖼️  SAFE PERFUME PICTURE ENRICHMENT PIPELINE');
  console.log('   Strict rule: Zero scrapers on Fragrantica HTML | Direct CDN only');
  console.log(`   Run Mode: Limit = ${runLimit === Infinity ? 'ALL' : runLimit} | Force = ${forceRecheck} | Dry-Run = ${dryRun}`);
  console.log('=========================================================');

  if (!supabase) {
    console.error('❌ Supabase client not initialized. Check .env credentials.');
    process.exit(1);
  }

  // 1. Load Local Cache
  const cache = loadImagesCache();
  console.log(`\n[1/4] Loaded local image cache (${Object.keys(cache).length} entries cached).`);

  // 2. Fetch Fragrances from Supabase
  console.log('\n[2/4] Fetching catalog fragrances from Supabase...');
  let fragrances = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, name, brand, notes, in_seller_stock, community_price')
      .order('in_seller_stock', { ascending: false })
      .range(page * 1000, (page + 1) * 1000 - 1);

    if (error) {
      console.error('  ❌ Supabase error loading fragrances:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    fragrances.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`  Total catalog fragrances: ${fragrances.length}`);

  // 3. Filter targets needing image enrichment
  const pending = [];
  for (const f of fragrances) {
    const hasCached = cache[f.id] && cache[f.id].image_url;
    const hasDbImage = f.notes && f.notes.image_url;
    if (forceRecheck || (!hasCached && !hasDbImage)) {
      pending.push(f);
    }
  }

  console.log(`\n[3/4] Identified ${pending.length} fragrances needing picture enrichment.`);
  if (pending.length === 0) {
    console.log('✨ All fragrances already have pictures! No work needed.');
    return;
  }

  const toProcess = pending.slice(0, runLimit);
  console.log(`  Processing ${toProcess.length} perfumes in this session...`);

  // Pre-load secondary seller image references
  const sellerImages = await loadSellerFallbackImages();

  // 4. Batch Enrichment with AI + CDN HEAD checks
  console.log('\n[4/4] Starting image resolution and verification...');
  const BATCH_SIZE = 12;
  let enrichedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const batchSummary = batch.map((item, idx) => ({
      index: idx,
      id: item.id,
      brand: item.brand,
      name: item.name
    }));

    const prompt = `You are a perfume database archivist. For each perfume below, provide its authentic Fragrantica numeric perfume ID (the numeric ID at the end of its Fragrantica page URL, e.g. for 'Afnan 9 PM' it is 65521, for 'Lattafa Khamrah' it is 75805).
If the perfume is an authentic clone or creation not on Fragrantica, return null for fragrantica_id.

Perfumes:
${JSON.stringify(batchSummary, null, 2)}

Return strictly a raw JSON array matching this format:
[
  { "index": 0, "fragrantica_id": 12345 }
]`;

    try {
      const responseList = await callGeminiJson(prompt);
      const idMap = new Map();
      if (Array.isArray(responseList)) {
        responseList.forEach(r => {
          if (r && r.fragrantica_id && typeof r.fragrantica_id === 'number') {
            idMap.set(r.index, r.fragrantica_id);
          }
        });
      }

      for (let bIdx = 0; bIdx < batch.length; bIdx++) {
        const item = batch[bIdx];
        const fragId = VERIFIED_CANONICAL_IDS[item.id] || idMap.get(bIdx);

        let smallUrl = null;
        let largeUrl = null;
        let source = 'none';

        if (fragId) {
          const testSmall = `https://fimgs.net/mdimg/perfume/m.${fragId}.jpg`;
          const testLarge = `https://fimgs.net/mdimg/perfume-thumbs/375x500.${fragId}.jpg`;

          // Verify with direct CDN HEAD request (zero Cloudflare challenges)
          const isValid = await checkImageHead(testSmall);
          if (isValid) {
            smallUrl = testSmall;
            largeUrl = testLarge;
            source = 'fragrantica_cdn';
          }
        }

        // Secondary fallback to verified seller CDN if Fragrantica ID was null or 404
        if (!smallUrl) {
          const cleanQuery = `${item.brand} ${item.name}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
          const sellerSrc = sellerImages.get(cleanQuery);
          if (sellerSrc) {
            smallUrl = sellerSrc;
            largeUrl = sellerSrc;
            source = 'seller_cdn';
          }
        }

        if (smallUrl) {
          const imageRecord = {
            id: item.id,
            brand: item.brand,
            name: item.name,
            image_url: smallUrl,
            image_large: largeUrl,
            fragrantica_id: fragId || null,
            source,
            updated_at: new Date().toISOString()
          };

          // Save to local cache
          cache[item.id] = imageRecord;

          // Update Supabase
          if (!dryRun) {
            const currentNotes = (item.notes && typeof item.notes === 'object') ? item.notes : {};
            const updatedNotes = {
              ...currentNotes,
              image_url: smallUrl,
              image_large: largeUrl,
              fragrantica_id: fragId || null
            };

            const updatePayload = { notes: updatedNotes };
            // Try updating image_url column directly, or fallback to updating notes JSONB
            try {
              const { error: directErr } = await supabase
                .from('fragrances')
                .update({ ...updatePayload, image_url: smallUrl })
                .eq('id', item.id);

              if (directErr) {
                // Column image_url does not exist yet; update notes JSONB
                await supabase.from('fragrances').update(updatePayload).eq('id', item.id);
              }
            } catch (upErr) {
              await supabase.from('fragrances').update(updatePayload).eq('id', item.id);
            }
          }

          console.log(`  ✓ [${item.brand} - ${item.name}] Image linked (${source}): ${smallUrl}`);
          enrichedCount++;
        } else {
          console.log(`  ↳ [${item.brand} - ${item.name}] No authentic image found yet. Marked pending.`);
          failedCount++;
        }

        // Polite sub-second pacing between CDN HEAD checks
        await new Promise(r => setTimeout(r, 250));
      }

      // Checkpoint progress to disk after each batch
      saveImagesCache(cache);

      // Pacing between AI batches (stay well within RPM limit)
      await new Promise(r => setTimeout(r, 1800));
    } catch (batchErr) {
      console.warn(`  ❌ Batch error processing items ${i}-${i + BATCH_SIZE}:`, batchErr.message);
    }
  }

  // Final cache save
  saveImagesCache(cache);

  console.log('\n=========================================================');
  console.log('✅ ENRICHMENT RUN COMPLETE!');
  console.log(`• Enriched this session: ${enrichedCount} perfumes`);
  console.log(`• Pending / Unresolved: ${failedCount} perfumes`);
  console.log(`• Total cached pictures: ${Object.keys(cache).length}`);
  console.log(`• Saved checkpoint -> data/perfume_images.json`);
  console.log('=========================================================');
}

main().catch(err => {
  console.error('Fatal pipeline error:', err);
  process.exit(1);
});
