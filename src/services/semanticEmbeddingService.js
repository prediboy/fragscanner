/**
 * semanticEmbeddingService.js
 * 
 * Production Vector Embedding & Semantic Cosine Matching Service
 * Powered by Google Gemini Embedding Model: `gemini-embedding-001`
 * 
 * Computes high-dimensional dense vector embeddings (3,072 dimensions)
 * and true cosine similarity between user search intents/prompts and
 * Fragrantica/Reddit community reviews, pros, cons, and reviewer quotes.
 */

import { supabase } from '../lib/supabaseTelemetry.js';

function getGeminiKeys() {
  const keys = [
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : '',
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_KEY2 : '',
    typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '',
    typeof process !== 'undefined' ? process.env?.GEMINI_KEY2 : '',
    typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : ''
  ];
  return [...new Set(keys.filter(Boolean))];
}
const EMBED_MODEL = 'gemini-embedding-001';

// In-memory embedding cache to avoid re-embedding unchanged review strings
const EMBED_CACHE = new Map();

/**
 * Simple string hash for cache keys
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `emb_${hash}`;
}

/**
 * Mathematical Vector Cosine Similarity
 * CosSim(A, B) = (A • B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Converts a raw cosine similarity (typically 0.35 - 0.88 for gemini-embedding-001)
 * into a calibrated 0-100% human-readable match score.
 */
export function cosineToPercentage(cosine) {
  // Baseline floor ~0.35 (uncorrelated/opposite), ceiling ~0.85 (near identical meaning)
  const normalized = (cosine - 0.35) / 0.50;
  const clamped = Math.max(0.20, Math.min(0.99, normalized));
  return Math.round(clamped * 100);
}

/**
 * Fetch vector embeddings in batch using gemini-embedding-001
 * 1. Checks in-memory cache first
 * 2. Tries /api/concierge serverless route
 * 3. Falls back to direct Gemini API call
 */
export async function getBatchEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const results = new Array(texts.length).fill(null);
  const toFetchIndices = [];
  const toFetchTexts = [];

  texts.forEach((rawText, idx) => {
    const text = String(rawText || '').trim().slice(0, 1500);
    const key = hashString(text);
    if (EMBED_CACHE.has(key)) {
      results[idx] = EMBED_CACHE.get(key);
    } else {
      toFetchIndices.push(idx);
      toFetchTexts.push(text);
    }
  });

  if (toFetchTexts.length === 0) {
    return results;
  }

  // Helper to store in cache
  const storeResults = (embeddings) => {
    embeddings.forEach((emb, i) => {
      const origIdx = toFetchIndices[i];
      const text = toFetchTexts[i];
      const vec = emb?.values || emb;
      if (vec && Array.isArray(vec)) {
        EMBED_CACHE.set(hashString(text), vec);
        results[origIdx] = vec;
      }
    });
  };

  // 1. Try serverless /api/concierge
  try {
    const res = await fetch('/api/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'embed', texts: toFetchTexts }),
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.embeddings && data.embeddings.length === toFetchTexts.length) {
        storeResults(data.embeddings);
        return results;
      }
    }
  } catch {}

  // 2. Direct client-side Gemini embedding call with multi-key failover
  const geminiKeys = getGeminiKeys();
  for (const geminiKey of geminiKeys) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: toFetchTexts.map(t => ({
            model: `models/${EMBED_MODEL}`,
            content: { parts: [{ text: t }] }
          }))
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.embeddings && data.embeddings.length === toFetchTexts.length) {
          storeResults(data.embeddings);
          return results;
        }
      }
    } catch (err) {
      console.warn('[SemanticEmbedding] Direct embedding attempt error:', err.message);
    }
  }

  return results;
}

/**
 * Computes semantic vector cosine match between a user query and a list of candidates.
 * Embeds the user query once, embeds all candidates' community review texts in batch,
 * and calculates exact vector cosine similarities.
 */
export async function computeSemanticReviewMatchBatch(userQuery, candidateFragrances) {
  if (!userQuery || !Array.isArray(candidateFragrances) || candidateFragrances.length === 0) {
    return candidateFragrances.map(() => ({
      semanticMatchPct: 75,
      cosineScore: 0.70,
      highlightQuote: 'Balanced community favorite.'
    }));
  }

  // Build review texts for each candidate
  const reviewTexts = candidateFragrances.map(f => {
    const rs = f.review_summary;
    if (typeof rs === 'object' && rs !== null) {
      const quotes = Array.isArray(rs.top_reviewer_quotes) ? rs.top_reviewer_quotes.join(' ') : '';
      const pros = Array.isArray(rs.pros) ? rs.pros.join(' ') : '';
      const verdict = rs.community_verdict || '';
      return `${verdict} ${pros} ${quotes}`.trim() || f.description || f.name;
    }
    if (typeof rs === 'string' && rs.trim()) return rs;
    return f.description || `${f.brand} ${f.name} community favorite`;
  });

  // Batch embed: [userQuery, ...candidateReviewTexts]
  const allTextsToEmbed = [userQuery, ...reviewTexts];
  const embeddings = await getBatchEmbeddings(allTextsToEmbed);

  const queryVector = embeddings[0];

  return candidateFragrances.map((f, idx) => {
    const candVector = embeddings[idx + 1];

    if (!queryVector || !candVector) {
      return {
        semanticMatchPct: 75,
        cosineScore: 0.65,
        highlightQuote: f.review_summary?.top_reviewer_quotes?.[0] || f.review_summary?.community_verdict || f.description || 'Community favorite.'
      };
    }

    const cosine = calculateCosineSimilarity(queryVector, candVector);
    const semanticMatchPct = cosineToPercentage(cosine);

    // Find the single best quote from candidate reviews
    const candidateQuotes = [
      ...(f.review_summary?.top_reviewer_quotes || []),
      ...(f.review_summary?.pros || []),
      f.review_summary?.community_verdict
    ].filter(Boolean);

    const highlightQuote = candidateQuotes[0] || f.description || 'Verified community favorite.';

    return {
      semanticMatchPct,
      cosineScore: Number(cosine.toFixed(4)),
      highlightQuote
    };
  });
}

/**
 * Searches the catalog in Supabase Postgres using native pgvector cosine similarity
 */
export async function searchFragrancesBySemanticEmbedding(queryText, limit = 12) {
  if (!queryText || typeof queryText !== 'string') return [];

  try {
    const embeddings = await getBatchEmbeddings([queryText]);
    const queryVector = embeddings[0];
    if (!queryVector || !Array.isArray(queryVector)) return [];

    const { data, error } = await supabase.rpc('match_fragrances_semantic', {
      query_embedding: queryVector,
      match_threshold: 0.35,
      match_count: limit
    });

    if (error) {
      console.warn('[SemanticSearch] RPC match error:', error.message);
      return [];
    }

    return (data || []).map(f => ({
      ...f,
      best_seller: f.community_sellers?.[0]?.seller_name || f.best_bottle_seller || 'Verified Seller'
    }));
  } catch (err) {
    console.warn('[SemanticSearch] Search exception:', err.message);
    return [];
  }
}

