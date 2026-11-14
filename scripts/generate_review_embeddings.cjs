/**
 * generate_review_embeddings.cjs
 * 
 * Precomputes 3,072-dimensional dense vector embeddings for all fragrances
 * using Google Gemini's `gemini-embedding-001` model and stores them directly into
 * `public.fragrances.review_embedding` in Supabase Postgres.
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

const BATCH_SIZE = 25; // 25 texts per batch request
const DELAY_MS = 1200; // 1.2s buffer to stay comfortably within Gemini RPM quota

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
  const accords = (fragrance.accords || []).map(a => a.name).join(', ');

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
    throw new Error(`Embedding API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.embeddings.map(e => e.values);
}

async function run() {
  console.log('=== FRAGRANCE REVIEW VECTOR EMBEDDING PIPELINE ===');
  console.log('Model: models/gemini-embedding-001 (3,072 dimensions)');
  console.log('Destination: Supabase public.fragrances.review_embedding');

  const { count: totalCount } = await sb.from('fragrances').select('id', { count: 'exact', head: true });
  const { count: doneCount } = await sb.from('fragrances').select('id', { count: 'exact', head: true }).not('review_embedding', 'is', null);

  console.log(`Total catalog: ${totalCount} | Already embedded: ${doneCount} | Remaining: ${totalCount - doneCount}\n`);

  let processed = doneCount;

  while (true) {
    // Fetch next batch of perfumes with null review_embedding
    const { data: batch, error } = await sb.from('fragrances')
      .select('id, name, brand, review_summary, description, accords')
      .is('review_embedding', null)
      .limit(BATCH_SIZE);

    if (error) {
      console.error('Database fetch error:', error.message);
      break;
    }

    if (!batch || batch.length === 0) {
      console.log('\nAll fragrances in catalog have been successfully embedded!');
      break;
    }

    const texts = batch.map(constructReviewText);

    try {
      const vectors = await fetchBatchEmbeddings(texts);

      // Save each embedding back to Supabase
      for (let i = 0; i < batch.length; i++) {
        const vec = vectors[i];
        if (vec && Array.isArray(vec)) {
          await sb.from('fragrances')
            .update({ review_embedding: vec })
            .eq('id', batch[i].id);
        }
      }

      processed += batch.length;
      const pct = ((processed / totalCount) * 100).toFixed(1);
      process.stdout.write(`\rProgress: [${processed} / ${totalCount}] (${pct}%) - Last: ${batch[batch.length - 1].name.slice(0, 25)}`);

      await sleep(DELAY_MS);
    } catch (err) {
      console.error('\nBatch notice:', err.message.slice(0, 100));
      console.log('Backing off 8 seconds for Gemini quota window...');
      await sleep(8000);
    }
  }

  console.log('\nEmbedding pipeline complete.');
}

run();
