/**
 * Enrich Fragrances with Fragrantica URL & In-Database Base64 Picture Data
 * ------------------------------------------------------------------------
 * 1. Matches catalog items against the 140,228 Fragrantica master database using indexed fast lookups.
 * 2. Fetches the authentic bottle thumbnail directly from the static CDN fimgs.net.
 * 3. Encodes the image bytes into a base64 Data URI (data:image/jpeg;base64,...).
 * 4. Saves the actual image data AND canonical Fragrantica URL directly into Supabase (notes JSONB).
 *
 * Result: The picture lives IN THE DATABASE (zero external URL dependency, zero 404s, zero blockers).
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const DB_PATH = path.join(__dirname, '../data/fragrantica_master.sqlite');
const GZ_PATH = path.join(__dirname, '../data/fragrantica_master.sqlite.gz');
const CACHE_PATH = path.join(__dirname, '../data/perfume_images.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let db = null;
let stmtExact = null;
let stmtBrandPrefix = null;
let stmtById = null;

function ensureDb() {
  if (db) return true;

  if (!fs.existsSync(DB_PATH)) {
    if (fs.existsSync(GZ_PATH)) {
      console.log(`📦 Uncompressing ${GZ_PATH} to ${DB_PATH}...`);
      try {
        const zlib = require('zlib');
        const input = fs.readFileSync(GZ_PATH);
        const unzipped = zlib.gunzipSync(input);
        fs.writeFileSync(DB_PATH, unzipped);
        console.log(`✓ Master SQLite database ready (${(unzipped.length / 1024 / 1024).toFixed(1)} MB)!`);
      } catch (err) {
        console.warn(`⚠️ Failed to uncompress ${GZ_PATH}:`, err.message);
        return false;
      }
    } else {
      console.warn(`⚠️ Master Fragrantica SQLite database not found at ${DB_PATH} or ${GZ_PATH}.`);
      return false;
    }
  }

  try {
    db = new DatabaseSync(DB_PATH);
    db.exec('CREATE INDEX IF NOT EXISTS idx_perfumes_brand_nocase ON perfumes(brand COLLATE NOCASE)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_perfumes_name_nocase ON perfumes(name COLLATE NOCASE)');
    stmtExact = db.prepare('SELECT id, slug, brand, name, year, gender, rating, votes, picture, thumbnail FROM perfumes WHERE brand = ? COLLATE NOCASE AND name = ? COLLATE NOCASE LIMIT 1');
    stmtBrandPrefix = db.prepare('SELECT id, slug, brand, name, year, gender, rating, votes, picture, thumbnail FROM perfumes WHERE brand LIKE ? COLLATE NOCASE LIMIT 1200');
    stmtById = db.prepare('SELECT id, slug, brand, name, year, gender, rating, votes, picture, thumbnail FROM perfumes WHERE id = ? LIMIT 1');
    return true;
  } catch (dbErr) {
    console.warn(`⚠️ Error opening Master SQLite database:`, dbErr.message);
    return false;
  }
}

const BRAND_MAP = {
  'lattafa': ['Lattafa Perfumes', 'Maison Alhambra', 'Asdaaf'],
  'al haramain': ['Al Haramain Perfumes', 'Orientica'],
  'paris corner': ['PARIS CORNER', 'Pendora Scents', 'Emir', 'Ministry of Oud', 'Killer Oud'],
  'armaf': ['Armaf', 'Hamidi', 'Hamidi Oud & Perfumes', 'Oros'],
  'afnan': ['Afnan', 'Zimaya'],
  'rasasi': ['Rasasi'],
  'ajmal': ['Ajmal'],
  'fragrance world': ['Fragrance World', 'French Avenue', 'Fa Paris'],
  'french avenue': ['French Avenue', 'Aromatix X French Avenue', 'Fragrance World'],
  'ibrahim al qureshi': ['Ibrahim Al Qurashi', 'Ibraheem AlQurashi'],
  'ibrahim al qurashi': ['Ibrahim Al Qurashi', 'Ibraheem AlQurashi'],
  'khadlaj': ['Khadlaj Perfumes', 'Khadlaj'],
  'arabiyat prestige': ['Arabiyat Prestige', 'Arabiyat', 'My Perfumes'],
  'ard al zaafaran': ['Ard Al Zaafaran'],
  'maison francis kurkdjian': ['Maison Francis Kurkdjian'],
  'maison margiela': ['Maison Martin Margiela', 'Maison Margiela'],
  'dolce & gabbana': ['Dolce&Gabbana', 'Dolce & Gabbana'],
  'dolce gabbana': ['Dolce&Gabbana', 'Dolce & Gabbana'],
  'maison alhambra': ['Maison Alhambra', 'Lattafa Perfumes'],
  'pendora scents': ['Pendora Scents', 'PARIS CORNER'],
  'titan skinn': ['Skinn', 'Titan'],
  'skinn': ['Skinn', 'Titan'],
  'viktor & rolf': ['Viktor&Rolf', 'Viktor & Rolf'],
  'viktor rolf': ['Viktor&Rolf'],
  'rayhaan': ['Rayhaan'],
  'guerlain': ['Guerlain'],
  'parfums de marly': ['Parfums de Marly'],
  'tom ford': ['Tom Ford'],
  'creed': ['Creed'],
  'dior': ['Dior'],
  'chanel': ['Chanel'],
  'nishane': ['Nishane'],
  'xerjoff': ['Xerjoff'],
  'mancera': ['Mancera'],
  'montale': ['Montale'],
  'hugo boss': ['Hugo Boss'],
  'jean paul gaultier': ['Jean Paul Gaultier']
};

function cleanStr(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/extacy/g, 'extasy')
    .replace(/blu\b/g, 'blue')
    .replace(/rifaqat/g, 'rifaaqat')
    .replace(/immortel/g, 'immortal')
    .replace(/maitre/g, 'matiere')
    .replace(/tehebak/g, 'tehbak')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function cleanBrand(b) {
  let s = (b || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  s = s.replace(/\b(perfumes|parfums|paris|fragrances|dubai|london|milano)\b/gi, '').trim();
  return s;
}

function normalizeTitle(t) {
  return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\b(emir|factory edition:?)\s*/gi, '')
    .replace(/\bno\.?\s*/gi, '')
    .replace(/extacy/g, 'extasy')
    .replace(/blu\b/g, 'blue')
    .replace(/rifaqat/g, 'rifaaqat')
    .replace(/immortel/g, 'immortal')
    .replace(/maitre/g, 'matiere')
    .replace(/tehebak/g, 'tehbak')
    .replace(/\b(pour homme|pour femme|for men|for women|men|women|edp|edt|eau de parfum|eau de toilette|parfum|extrait|cologne)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Canonical ID overrides for known tricky items
const CANONICAL_OVERRIDES = {
  'rasasi-daarej-pour-homme': 19688,
  'armaf-club-de-nuit-milestone': 64104,
  'rasasi-fattan-pour-homme': 53484,
  'rasasi-hawas': 46890,
  'afnan-9-pm': 65521,
  'lattafa-khamrah': 75805,
  'armaf-club-de-nuit-intense-man': 34696,
  'lattafa-khamrah-qahwa': 88175,
  'lattafa-his-confession': 96866,
  'afnan-tribute-blue': 71174,
  'afnan-modest-une': 69256,
  'creed-aventus': 9828,
  'st-9240': 79930,
  'st-9239': 99060,
  'paris-corner-rifaqat': 99060,
  'maison-alhambra-jean-lowe-maitre': 94060,
  'st-9041': 83666,
  'maison-alhambra-jean-lowe-immortel': 83666,
  'st-9115': 79942,
  'st-9101': 83311,
  'st-9112': 92617,
  'french-avenue-aromatix-royal-taboo': 99330,
  'french-avenue-aromatix-carnal-desire': 99331,
  'apex-frenchavenue-aromatixteasme': 117532,
  'rasasi-hawas-eclat': 112708,
  'rasasi-roohy-tehebak': 19686,
  'rasasi-taa': 47932,
  'rasasi-la-yuqawam': 19668,
  'rasasi-la-yuqawam-pour-femme': 19669,
  'armaf-opus-men': 50332,
  'armaf-tag-uomo-rosso': 90407,
  'armaf-tag-donna-colorata': 90408,
  'armaf-infinity-silver': 98715,
  'armaf-club-de-nuit-white-imperiale': 78474,
  'armaf-club-de-nuit-precieux-1': 93272,
  'guerlain-l-homme-ideal-eau-de-toilette': 25780,
  'guerlain-l-homme-ideal-cologne': 30620,
  'guerlain-l-homme-ideal-l-intense': 49416,
  'guerlain-l-homme-ideal-extreme': 60284,
  'guerlain-l-homme-ideal-platine-prive': 80691,
  'guerlain-l-homme-ideal-parfum': 90803,
  'paris-corner-emir-wild-tobacco': 113928,
  'paris-corner-emir-just-bergamot': 113930,
  'paris-corner-emir-frenetic-deliceuse': 109939
};

function findInMaster(item) {
  if (!ensureDb()) return null;

  if (CANONICAL_OVERRIDES[item.id]) {
    const row = stmtById.get(CANONICAL_OVERRIDES[item.id]);
    if (row) return row;
  }

  // 1. Direct exact match
  let exact = stmtExact.get(item.brand, item.name);
  if (exact) return exact;

  const bKey = cleanBrand(item.brand);
  const brandSearchList = BRAND_MAP[bKey] || [item.brand];

  // 2. Exact match with mapped brand names
  for (const b of brandSearchList) {
    exact = stmtExact.get(b, item.name);
    if (exact) return exact;
  }

  // 3. Search brand candidates
  const nameClean = cleanStr(item.name);
  const nameNorm = normalizeTitle(item.name);

  for (const b of brandSearchList) {
    const candidates = stmtBrandPrefix.all(b + '%');
    if (!candidates || candidates.length === 0) continue;

    for (const c of candidates) {
      if (cleanStr(c.name) === nameClean) return c;
    }

    if (nameNorm && nameNorm.length >= 3) {
      for (const c of candidates) {
        if (normalizeTitle(c.name) === nameNorm) return c;
      }
    }

    // 4. Flanker-aware token scoring (prioritizes distinguishing flanker keywords)
    const inputWords = (item.name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 3);
    const lastWord = inputWords[inputWords.length - 1];
    let bestCandidate = null;
    let maxScore = 0;

    for (const c of candidates) {
      const cWords = (c.name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 3);
      let score = 0;
      if (lastWord && cWords.includes(lastWord)) score += 50;

      let matchedTokens = 0;
      for (const w of inputWords) {
        if (cWords.includes(w)) {
          score += 15;
          matchedTokens++;
        }
      }
      score -= Math.abs(cWords.length - inputWords.length) * 2;

      if (matchedTokens >= Math.min(2, inputWords.length) && score > maxScore) {
        maxScore = score;
        bestCandidate = c;
      }
    }

    if (bestCandidate && maxScore >= 30) {
      return bestCandidate;
    }
  }

  return null;
}

// Download image bytes and return base64 Data URI
async function downloadAsBase64(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) return null;
    const b64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${b64}`;
  } catch (err) {
    return null;
  }
}

// Concurrency helper
async function mapConcurrent(items, concurrency, fn) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main(opts = {}) {
  const args = process.argv.slice(2);
  let limit = opts.limit !== undefined ? opts.limit : Infinity;
  let force = opts.force !== undefined ? opts.force : false;

  for (const a of args) {
    if (a.startsWith('--limit=')) limit = parseInt(a.split('=')[1], 10);
    if (a === '--force') force = true;
    if (a === '--all') limit = Infinity;
  }

  console.log('================================================================');
  console.log('🖼️  IN-DATABASE PICTURE & FRAGRANTICA URL ENRICHMENT PIPELINE');
  console.log(`   Corpus: 140,228 Fragrantica records | Limit: ${limit === Infinity ? 'ALL' : limit} | Force: ${force}`);
  console.log('================================================================\n');

  try {
    let cache = {};
    if (fs.existsSync(CACHE_PATH)) {
    try { cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')); } catch (e) {}
  }

  // 1. Fetch catalog from Supabase
  console.log('[1/3] Loading catalog fragrances from Supabase...');
  let catalog = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, name, brand, rating_value, rating_count, release_year, notes, in_seller_stock')
      .order('in_seller_stock', { ascending: false })
      .range(page * 1000, (page + 1) * 1000 - 1);

    if (error) {
      console.error('❌ Supabase fetch error:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    catalog.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`  Total catalog fragrances loaded: ${catalog.length}\n`);

  // Filter items needing in-db image or fragrantica_url
  const pending = catalog.filter(f => {
    if (force) return true;
    const hasData = f.notes && f.notes.image_data && f.notes.fragrantica_url;
    return !hasData;
  });

  console.log(`[2/3] Found ${pending.length} fragrances needing in-database picture / Fragrantica URL enrichment.`);
  const toProcess = pending.slice(0, limit);
  console.log(`  Processing ${toProcess.length} items (concurrency: 12)...\n`);

  // Match items against master SQLite
  const matchedItems = [];
  let unmatchedCount = 0;

  for (const item of toProcess) {
    const match = findInMaster(item);
    if (match) {
      matchedItems.push({ item, match });
    } else {
      unmatchedCount++;
    }
  }

  console.log(`  Matched in master DB: ${matchedItems.length} | Unmatched: ${unmatchedCount}`);
  console.log(`  Downloading images and encoding to Base64 in parallel...`);

  let downloadedCount = 0;
  const updates = [];

  await mapConcurrent(matchedItems, 12, async ({ item, match }) => {
    const fragUrl = `https://www.fragrantica.com/perfume/${match.slug}-${match.id}.html`;
    const imgThumbnail = `https://fimgs.net/mdimg/perfume/m.${match.id}.jpg`;
    const imgLarge = `https://fimgs.net/mdimg/perfume/375x500.${match.id}.jpg`;

    let base64Data = null;
    if (item.notes && item.notes.image_data && !force) {
      base64Data = item.notes.image_data;
    } else {
      // First try thumbnail, fallback to large packshot if needed
      base64Data = await downloadAsBase64(imgThumbnail);
      if (!base64Data) {
        base64Data = await downloadAsBase64(imgLarge);
      }
    }

    if (base64Data) {
      downloadedCount++;
      const currentNotes = (item.notes && typeof item.notes === 'object') ? item.notes : {};
      const updatedNotes = {
        ...currentNotes,
        fragrantica_id: match.id,
        fragrantica_url: fragUrl,
        image_data: base64Data, // STORED IN DB!
        image_url: imgThumbnail,
        image_large: imgLarge,
        picture: imgLarge,
        thumbnail: imgThumbnail,
        needs_image_refresh: false,
        image_status: 'enriched'
      };

      const payload = {
        id: item.id,
        notes: updatedNotes
      };

      if (match.rating && (!item.rating_value || item.rating_value === 4.2)) {
        payload.rating_value = Math.round(match.rating * 100) / 100;
      }
      if (match.votes && (!item.rating_count || item.rating_count < match.votes)) {
        payload.rating_count = match.votes;
      }
      if (match.year && !item.release_year) {
        payload.release_year = match.year;
      }

      updates.push(payload);

      cache[item.id] = {
        id: item.id,
        brand: item.brand,
        name: item.name,
        fragrantica_id: match.id,
        fragrantica_url: fragUrl,
        image_data_size: base64Data.length,
        image_url: imgThumbnail,
        image_large: imgLarge,
        source: 'fragrantica_in_db_base64',
        updated_at: new Date().toISOString()
      };
    }
  });

  console.log(`  ✓ Successfully downloaded & encoded Base64 images for ${updates.length} items.\n`);

  // 3. Batch write updates to Supabase
  if (updates.length > 0) {
    console.log(`[3/3] Writing ${updates.length} enriched records to Supabase...`);
    const BATCH_SIZE = 25;
    let written = 0;

    for (let b = 0; b < updates.length; b += BATCH_SIZE) {
      const slice = updates.slice(b, b + BATCH_SIZE);
      await Promise.all(slice.map(async (u) => {
        const { id, ...dataToUpdate } = u;
        const { error } = await supabase.from('fragrances').update(dataToUpdate).eq('id', id);
        if (!error) written++;
        else console.warn(`  Warning updating ${id}:`, error.message);
      }));

      process.stdout.write(`\r  Progress: ${written} / ${updates.length} updated in Supabase`);
    }
    console.log(`\n✅ Database update complete!`);

    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    console.log(`💾 Saved updated cache checkpoint to ${CACHE_PATH}`);
  } else {
    console.log(`\n[3/3] No updates to commit.`);
  }

  } catch (err) {
    console.error('Fatal error during Fragrantica master enrichment:', err);
  } finally {
    if (db) {
      try { db.close(); } catch (e) {}
      db = null;
    }
  }
}

module.exports = {
  runFragranticaEnrichment: main,
  findInMaster,
  downloadAsBase64
};

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
