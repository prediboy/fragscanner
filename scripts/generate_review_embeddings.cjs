/**
 * generate_review_embeddings.cjs
 * 
 * Precomputes 3,072-dimensional dense vector embeddings for fragrances
 * using Google Gemini's `gemini-embedding-001` model and stores them directly into
 * `public.fragrances.review_embedding` in Supabase Postgres.
 * 
 * PRIORITIZATION PIPELINE:
 * Phase 1: Middle Eastern Full Bottles (Lattafa, Afnan, Armaf, French Avenue, etc. with price > 500 or in stock)
 * Phase 2: All remaining Middle Eastern fragrances
 * Phase 3: All remaining fragrances across the catalog
 */

const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['\"]|['\"]$/g, '');
}

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);
const GEMINI_KEY = envVars.VITE_GEMINI_API_KEY || envVars.GEMINI_API_KEY;
const EMBED_MODEL = 'gemini-embedding-001';

const BATCH_SIZE = 10; // 10 texts per batch request
const DELAY_MS = 4200; // 4.2s delay keeps rate strictly under free-tier 15 RPM quota (140 perfumes/min)

const ME_BRANDS = [
  'Lattafa', 'Afnan', 'Armaf', 'Rasasi', 'Ahmed Al Maghribi', 'Ajmal', 
  'Paris Corner', 'Fragrance World', 'Arabiyat Prestige', 'Albait Aldimashqi',
  'Al Haramain', 'Swiss Arabian', 'Rayhaan', 'French Avenue', 'Maison Alhambra',
  'Reef', 'Mykonos', 'Khadlaj', 'Ibraq', 'Dumont', 'Zimaya', 'Orientica',
  'Arabiyat', 'Assaf', 'Al Wataniah', 'Anfar', 'Ard Al Zaafaran', 'Al Majed Oud',
  'Alezz Oud', 'Al Rehab', 'Arabian Oud', 'Naseem', 'Ibrahim Al Qureshi',
  'Ibraheem Al Qurashi', 'Rue Broca', 'Riiffs', 'Emper', 'Mousuf', 'Gissah',
  'Laverne', 'Maison Asrar', 'Nusuk'
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function constructReviewText(fragrance) {
  const rs = fragrance.review_summary;
  let text = '';
  if (typeof rs === 'object' && rs !== null) {
    const verdict = rs.community_verdict || '';
    const pros = Array.isArray(rs.pros) ? rs.pros.join('. ') : '';
    const quotes = Array.isArray(rs.top_reviewer_quotes) ? rs.top_reviewer_quotes.join('. ') : '';
    text = `${verdict} ${pros} ${quotes}`.trim();
  } else if (typeof rs === 'string' && rs.trim()) {
    text = rs.trim();
  }

  const desc = fragrance.description || '';
  const brand = fragrance.brand || '';
  const name = fragrance.name || '';
  const accords = (fragrance.accords || []).map(a => a.name || a).join(', ');

  const full = `${brand} ${name}. ${text || desc} Accords: ${accords}`.trim();
  return full.slice(0, 1800);
}

async function fetchBatchEmbeddings(texts) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: texts.map(t => ({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text: t }] }
      }))
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${errText.slice(0, 250)}`);
  }

  const data = await res.json();
  return data.embeddings.map(e => e.values);
}

async function processQueue(phaseName, queryBuilder) {
  console.log(`\n======================================================`);
  console.log(`STARTING: ${phaseName}`);
  console.log(`======================================================`);

  let countDone = 0;

  while (true) {
    // Always fetch items currently lacking review_embedding
    let q = queryBuilder();
    const { data: batch, error } = await q.limit(BATCH_SIZE);

    if (error) {
      console.error(`Database fetch error in ${phaseName}:`, error.message);
      break;
    }

    if (!batch || batch.length === 0) {
      console.log(`\nCOMPLETED ${phaseName}! (Processed in this phase: ${countDone})`);
      break;
    }

    const texts = batch.map(constructReviewText);

    try {
      const vectors = await fetchBatchEmbeddings(texts);

      // Concurrent update of the 10 rows
      await Promise.all(batch.map((item, idx) => {
        const vec = vectors[idx];
        if (vec && Array.isArray(vec) && vec.length === 3072) {
          return sb.from('fragrances')
            .update({ review_embedding: vec })
            .eq('id', item.id);
        }
        return Promise.resolve();
      }));

      countDone += batch.length;
      const lastItem = batch[batch.length - 1];
      console.log(`[${phaseName}] +${batch.length} done (Phase Total: ${countDone}) -> Last: ${lastItem.brand} - ${lastItem.name}`);

      await sleep(DELAY_MS);
    } catch (err) {
      console.error(`\n[Notice] API rate limit or error: ${err.message.slice(0, 150)}`);
      console.log('Backing off 10s for quota window recovery...');
      await sleep(10000);
    }
  }
}

async function run() {
  console.log('=== VECTOR EMBEDDING GENERATOR ===');
  console.log(`Model: models/${EMBED_MODEL} (3,072 dimensions)`);
  console.log(`Key: ${GEMINI_KEY.slice(0, 8)}...${GEMINI_KEY.slice(-6)}`);

  // Phase 1: Middle Eastern Full Bottles
  await processQueue(
    'Phase 1: Middle Eastern Full Bottles (Stock/Price > 500)',
    () => sb.from('fragrances')
      .select('id, name, brand, review_summary, description, accords')
      .in('brand', ME_BRANDS)
      .is('review_embedding', null)
      .or('in_seller_stock.eq.true,community_price.gt.500')
  );

  // Phase 2: All other Middle Eastern Fragrances (decants or unpriced)
  await processQueue(
    'Phase 2: Remaining Middle Eastern Catalog',
    () => sb.from('fragrances')
      .select('id, name, brand, review_summary, description, accords')
      .in('brand', ME_BRANDS)
      .is('review_embedding', null)
  );

  // Phase 3: Designer & Niche Catalog
  await processQueue(
    'Phase 3: Designer & Niche Full Catalog',
    () => sb.from('fragrances')
      .select('id, name, brand, review_summary, description, accords')
      .is('review_embedding', null)
  );

  console.log('\n======================================================');
  console.log('ALL PHASES COMPLETE: Full catalog vector embeddings populated.');
  console.log('======================================================');
}

run();
