/**
 * generate_review_embeddings.cjs
 * 
 * Precomputes 3,072-dimensional dense vector embeddings for fragrances
 * using Google Gemini's `gemini-embedding-001` model and stores them directly into
 * `public.fragrances.review_embedding` in Supabase Postgres.
 * 
 * IN-STOCK PRIORITY PIPELINE:
 * Phase 1: All pending IN-STOCK Full Bottles (in_seller_stock = true or community_price > 0)
 * Phase 2: All pending IN-STOCK Decants (has_decants = true)
 * Phase 3: All remaining catalog items
 */

const fs = require('fs');
const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['\"]|['\"]$/g, '');
}

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const CANDIDATE_KEYS = [
  envVars.GEMINI_API_KEY,
  envVars.GEMINI_KEY2,
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_KEY2,
  envVars.VITE_GEMINI_API_KEY
].filter(Boolean);

const API_KEYS = [...new Set(CANDIDATE_KEYS)];
let currentKeyIndex = 0;

const EMBED_MODEL = 'gemini-embedding-001';
const BATCH_SIZE = 10;
const DELAY_MS = 4200; // 4.2s delay keeps rate strictly under free-tier 15 RPM quota (140 perfumes/min)

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
  let attempts = 0;
  while (attempts < API_KEYS.length) {
    const activeKey = API_KEYS[currentKeyIndex];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents?key=${activeKey}`;

    try {
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

      if (res.ok) {
        const data = await res.json();
        return data.embeddings.map(e => e.values);
      }

      if (res.status === 429 || res.status === 403) {
        console.warn(`[Notice] Key index ${currentKeyIndex} hit status ${res.status}. Switching to next key...`);
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        attempts++;
        continue;
      }

      const errText = await res.text();
      throw new Error(`Embedding API error ${res.status}: ${errText.slice(0, 200)}`);
    } catch (err) {
      if (err.message.includes('Embedding API error')) throw err;
      console.warn(`[Notice] Network error on key index ${currentKeyIndex}:`, err.message);
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      attempts++;
    }
  }

  throw new Error('All Gemini API keys exhausted or rate limited.');
}

async function processQueue(phaseName, queryBuilder) {
  console.log(`\n======================================================`);
  console.log(`STARTING: ${phaseName}`);
  console.log(`======================================================`);

  let countDone = 0;

  while (true) {
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
      console.error(`\n[Notice] Embedding error: ${err.message.slice(0, 150)}`);
      console.log('Backing off 10s for quota window recovery...');
      await sleep(10000);
    }
  }
}

async function run() {
  console.log('=== IN-STOCK FIRST VECTOR EMBEDDING GENERATOR ===');
  console.log(`Model: models/${EMBED_MODEL} (3,072 dimensions)`);
  console.log(`Configured keys: ${API_KEYS.length}`);

  // Phase 1: All In-Stock Full Bottles (in_seller_stock = true OR community_price > 0)
  await processQueue(
    'Phase 1: In-Stock Full Bottles (Stock = true or Price > 0)',
    () => sb.from('fragrances')
      .select('id, name, brand, review_summary, description, accords')
      .is('review_embedding', null)
      .or('in_seller_stock.eq.true,community_price.gt.0')
  );

  // Phase 2: In-Stock Decants (has_decants = true)
  await processQueue(
    'Phase 2: In-Stock Decants (has_decants = true)',
    () => sb.from('fragrances')
      .select('id, name, brand, review_summary, description, accords')
      .is('review_embedding', null)
      .eq('has_decants', true)
  );

  // Phase 3: Everything else remaining in the catalog
  await processQueue(
    'Phase 3: Remaining Catalog Fragrances',
    () => sb.from('fragrances')
      .select('id, name, brand, review_summary, description, accords')
      .is('review_embedding', null)
  );

  console.log('\n======================================================');
  console.log('ALL PHASES COMPLETE: In-stock & full catalog vector embeddings populated.');
  console.log('======================================================');
}

run();
