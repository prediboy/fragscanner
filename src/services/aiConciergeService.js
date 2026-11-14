import { supabase } from '../lib/supabaseTelemetry.js';
import { evaluateOlfactoryMatch, evaluateOlfactoryMatchWithVectors, calculateSeasonalProfile } from '../utils/olfactoryAlgorithm.js';
import { searchFragrancesBySemanticEmbedding } from './semanticEmbeddingService.js';

const GEMINI_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof process !== 'undefined' && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) || '';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Typo-tolerant and fuzzy matcher for perfume titles, nicknames, and brands.
 * Handles single/double spelling mistakes (e.g. 'nashma' -> 'nashama', 'sedly' -> 'sedley')
 */
export function isMatchFuzzy(target, phrase) {
  const p = (phrase || '').replace(/[%'"`]/g, '').toLowerCase().trim();
  if (!p || p.length < 3) return false;
  const t = (target || '').toLowerCase();

  // 1. Direct substring
  if (t.includes(p)) return true;

  // 2. Tokenized word comparison with Levenshtein distance
  const tWords = t.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !['the', 'and', 'for', 'perfume', 'eau', 'edp', 'edt', 'pour', 'homme', 'femme'].includes(w));
  const pWords = p.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !['the', 'and', 'for', 'perfume', 'eau', 'edp', 'edt', 'pour', 'homme', 'femme'].includes(w));

  // If entire phrase matches after punctuation strip
  const tClean = tWords.join(' ');
  const pClean = pWords.join(' ');
  if (tClean.includes(pClean) || pClean.includes(tClean)) return true;

  for (const pw of pWords) {
    if (pw.length < 3) continue;
    for (const tw of tWords) {
      if (tw === pw) return true;
      if (tw.includes(pw) || pw.includes(tw)) return true;
      const maxDist = pw.length >= 7 ? 2 : 1;
      if (Math.abs(pw.length - tw.length) <= maxDist) {
        if (levenshtein(pw, tw) <= maxDist) return true;
      }
    }
  }
  return false;
}

/**
 * Deterministically extract all hated / disliked perfumes from chat history.
 * Resilient against typos like semicolons ("didn;t like"), curly apostrophes ("didn’t"), etc.
 */
export function extractDeterministicDislikes(chatHistory) {
  const dislikes = new Set();
  const genericDislikeWords = new Set([
    'it', 'them', 'that', 'this', 'summer', 'winter', 'fragrance', 'fragrances',
    'perfume', 'perfumes', 'notes', 'scents', 'ones', 'one', 'clones', 'anything',
    'citrus', 'citruses', 'sweet', 'sweetness', 'vanilla', 'amber', 'aquatic',
    'marine', 'oud', 'leather', 'floral', 'flowers', 'rose', 'lavender', 'mint',
    'musk', 'fruits', 'fruity', 'gourmand', 'spices', 'spicy', 'cardamom',
    'pepper', 'wood', 'woody', 'fresh', 'freshness', 'powdery', 'smoke', 'smoky',
    'tobacco', 'heavy sweetness', 'overly sweet', 'too sweet', 'over citrusy',
    'sweet fragrances', 'citrus fragrances', 'sweet perfumes', 'heavy fragrances'
  ]);

  for (const m of (chatHistory || [])) {
    if (m.role !== 'user') continue;
    const rawContent = (m.content || '').toLowerCase();
    // Normalize semicolons or curly quotes inside contractions like didn;t -> didn't
    const normalized = rawContent.replace(/([a-z])[;’`]+([a-z])/gi, "$1'$2");
    const clean = normalized.replace(/\b(?:absolutely|completely|totally|really|truly|strongly)\s+/gi, '');

    // 1. didn't like / don't like / hate / dislike / not a fan of / avoid
    const re1 = /(?:didn'?t\s+like|did\s+not\s+like|don'?t\s+like|do\s+not\s+like|not\s+a\s+fan\s+of|wasn'?t\s+a\s+fan\s+of|hate|hated|dislike|disliked|avoid|done\s+with|sick\s+of)\s+([a-z0-9\s,]+?)(?:,|\.|\bbut\b|\bsuggest\b|\bwant\b|\blooking\b|\?|!|$)/gi;
    for (const match of clean.matchAll(re1)) {
      const parts = match[1].split(/\band\b|,/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an)\s+/i, '');
        term = term.replace(/^(?:hate|hated|dislike|disliked|avoid|done\s+with|didn'?t\s+like|don'?t\s+like)\s+/i, '').trim();
        if (term && !genericDislikeWords.has(term) && term.length > 2) {
          dislikes.add(term);
        }
      }
    }

    // 2. tried / wore / tested X and didn't like / hated / wasn't good / missed the mark
    const re2 = /(?:tried|wore|bought|tested)\s+([a-z0-9\s,]+?)(?:\s+(?:and\s+)?(?:hated|didn'?t\s+like|disliked|not\s+good|missed\s+the\s+mark|didn'?t\s+work|disappointing|wasn'?t)|\s+but\s+|\.|\?|!|$)/gi;
    for (const match of clean.matchAll(re2)) {
      const parts = match[1].split(/\band\b|,/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an)\s+/i, '');
        if (term && !genericDislikeWords.has(term) && term.length > 2) {
          dislikes.add(term);
        }
      }
    }

    // 3. X missed the mark / X was disappointing / X was too sweet/heavy
    const re3 = /(?:^|[,;]|\b(?:and|but|while|though)\b)\s*([a-z0-9\s,]+?)\s+(?:missed\s+the\s+mark|didn'?t\s+work|was\s+disappointing|was\s+too\s+(?:sweet|harsh|sharp|heavy))/gi;
    for (const match of clean.matchAll(re3)) {
      const parts = match[1].split(/\band\b|,/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an|but|and)\s+/i, '');
        if (term && !genericDislikeWords.has(term) && term.length > 2) {
          dislikes.add(term);
        }
      }
    }
  }

  // Remove any phrases containing positive sentiment words
  for (const item of Array.from(dislikes)) {
    if (/\b(?:love|loved|like|liked|favorite|own|wearing|best)\b/i.test(item)) {
      dislikes.delete(item);
    }
  }

  // Strictly ensure perfumes user loves are NEVER in dislikes
  const likedArray = extractDeterministicLiked(chatHistory);
  for (const likedItem of likedArray) {
    for (const dis of Array.from(dislikes)) {
      if (dis.includes(likedItem) || likedItem.includes(dis) || isMatchFuzzy(dis, likedItem)) {
        dislikes.delete(dis);
      }
    }
  }

  return Array.from(dislikes);
}

/**
 * Deterministically extract all perfumes the user already owns or explicitly loves
 * so recommendation mode never echoes back bottles they already have.
 */
export function extractDeterministicLiked(chatHistory) {
  const liked = new Set();
  const genericWords = new Set([
    'it', 'them', 'that', 'this', 'summer', 'winter', 'fragrance', 'fragrances',
    'perfume', 'perfumes', 'notes', 'scents', 'ones', 'one', 'summer fragrances',
    'minty and lavendery ones', 'minty', 'lavendery', 'fresh', 'fresh ones'
  ]);

  for (const m of (chatHistory || [])) {
    if (m.role !== 'user') continue;
    const text = (m.content || '').toLowerCase().replace(/([a-z])[;’`]+([a-z])/gi, "$1'$2");

    const loveMatches = text.matchAll(/(?:love|loved|like|liked|own|have|wearing|favorite(?:\s+is)?)\s+([a-z0-9\s,]+?)(?:,|\.|\bbut\b|\bsuggest\b|\bwant\b|\blooking\b|\?|!|$)/gi);
    for (const match of loveMatches) {
      const raw = match[1].trim();
      const parts = raw.split(/\band\b|,/);
      for (const p of parts) {
        const term = p.trim().replace(/^(?:the|a|an)\s+/i, '');
        if (term && !genericWords.has(term) && term.length > 2) {
          liked.add(term);
        }
      }
    }
  }
  return Array.from(liked);
}

/**
 * Resolves a perfume entity mentioned in chat against the Supabase database
 * to retrieve verified Fragrantica note pyramids, inspirations, and accords.
 */
export async function resolvePerfumeDossier(phrase) {
  const p = (phrase || '').trim().toLowerCase();
  if (!p || p.length < 2) return null;

  const clean = p.replace(/\b(?:i|love|loved|like|liked|tried|wore|tested|hate|hated|dislike|disliked|perfume|fragrance|the|a|an)\b/gi, '').trim();
  if (!clean || clean.length < 2) return null;

  try {
    const { data } = await supabase.from('fragrances')
      .select('id, name, brand, dna_inspiration, top_notes, middle_notes, base_notes, accords')
      .or(`name.ilike.%${clean}%,brand.ilike.%${clean}%,dna_inspiration.ilike.%${clean}%`)
      .limit(10);

    let candidates = data || [];

    if (candidates.length === 0) {
      const words = clean.split(/\s+/).filter(w => w.length >= 3);
      if (words.length > 0) {
        const orClauses = words.flatMap(w => {
          const variants = [w];
          if (w.includes('ei')) variants.push(w.replace('ei', 'e'));
          if (w.includes('ie')) variants.push(w.replace('ie', 'e'));
          return variants.map(v => `name.ilike.%${v}%,brand.ilike.%${v}%`);
        });
        const { data: fuzzyData } = await supabase.from('fragrances')
          .select('id, name, brand, dna_inspiration, top_notes, middle_notes, base_notes, accords')
          .or(orClauses.join(','))
          .limit(15);
        candidates = fuzzyData || [];
      }
    }

    if (candidates.length === 0) return null;

    let best = null;
    let bestScore = -1;

    for (const c of candidates) {
      const brand = (c.brand || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const full = `${brand} ${name}`;
      let score = 0;

      if (name === clean) score += 100;
      else if (name.includes(clean)) score += 60;
      else if (full.includes(clean)) score += 50;

      if (isMatchFuzzy(name, clean)) score += 40;
      if (isMatchFuzzy(full, clean)) score += 30;

      const cleanWords = clean.split(/\s+/);
      if (cleanWords.length > 1) {
        const matchesCount = cleanWords.filter(w => full.includes(w) || isMatchFuzzy(full, w)).length;
        score += matchesCount * 25;
      }

      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }

    return bestScore > 20 ? best : candidates[0];
  } catch (err) {
    console.warn('[Khushboo] resolvePerfumeDossier error:', err.message);
    return null;
  }
}

/**
 * Builds a structured Fragrantica note pyramid dossier for all perfumes
 * mentioned in the chat (both liked/owned and disliked/failed) to pass full context to Gemini.
 */
export async function buildMentionedPerfumesDossier(chatHistory) {
  const likedNames = extractDeterministicLiked(chatHistory);
  const dislikedNames = extractDeterministicDislikes(chatHistory);

  if (likedNames.length === 0 && dislikedNames.length === 0) return '';

  const likedDossiers = [];
  for (const name of likedNames) {
    const d = await resolvePerfumeDossier(name);
    if (d && !likedDossiers.some(x => x.id === d.id)) likedDossiers.push(d);
  }

  const dislikedDossiers = [];
  for (const name of dislikedNames) {
    const d = await resolvePerfumeDossier(name);
    if (d && !dislikedDossiers.some(x => x.id === d.id)) dislikedDossiers.push(d);
  }

  if (likedDossiers.length === 0 && dislikedDossiers.length === 0) return '';

  let report = '### VERIFIED DATABASE NOTE PYRAMIDS & ACCORDS FOR PERFUMES INVOLVED IN THIS CONVERSATION:\n';
  report += 'Use these ground-truth Fragrantica note pyramids to accurately diagnose why the user loved or hated them:\n';

  if (likedDossiers.length > 0) {
    report += '\n[LIKED / OWNED INSPIRATIONS (Analyze what note combinations the user loves)]:\n';
    for (const d of likedDossiers) {
      report += `- ${d.brand} - ${d.name}:\n`;
      if (d.dna_inspiration) report += `  * Inspiration: ${d.dna_inspiration}\n`;
      report += `  * Top Notes: ${(d.top_notes || []).join(', ') || 'N/A'}\n`;
      report += `  * Middle Notes: ${(d.middle_notes || []).join(', ') || 'N/A'}\n`;
      report += `  * Base Notes: ${(d.base_notes || []).join(', ') || 'N/A'}\n`;
      report += `  * Dominant Accords: ${(d.accords || []).slice(0, 5).map(a => `${a.name} (${a.score}%)`).join(', ') || 'N/A'}\n`;
    }
  }

  if (dislikedDossiers.length > 0) {
    report += '\n[DISLIKED / FAILED PERFUMES (Analyze what notes/accords caused the dislike to strictly avoid/penalize them)]:\n';
    for (const d of dislikedDossiers) {
      report += `- ${d.brand} - ${d.name}:\n`;
      if (d.dna_inspiration) report += `  * Inspiration: ${d.dna_inspiration}\n`;
      report += `  * Top Notes: ${(d.top_notes || []).join(', ') || 'N/A'}\n`;
      report += `  * Middle Notes: ${(d.middle_notes || []).join(', ') || 'N/A'}\n`;
      report += `  * Base Notes: ${(d.base_notes || []).join(', ') || 'N/A'}\n`;
      report += `  * Dominant Accords: ${(d.accords || []).slice(0, 5).map(a => `${a.name} (${a.score}%)`).join(', ') || 'N/A'}\n`;
    }
  }

  return report;
}

export function getAvailableGeminiKeys() {
  const keys = [];
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_GEMINI_API_KEY) keys.push(import.meta.env.VITE_GEMINI_API_KEY);
    if (import.meta.env.VITE_GEMINI_KEY2) keys.push(import.meta.env.VITE_GEMINI_KEY2);
    if (import.meta.env.GEMINI_API_KEY) keys.push(import.meta.env.GEMINI_API_KEY);
    if (import.meta.env.GEMINI_KEY2) keys.push(import.meta.env.GEMINI_KEY2);
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_GEMINI_API_KEY) keys.push(process.env.VITE_GEMINI_API_KEY);
    if (process.env.VITE_GEMINI_KEY2) keys.push(process.env.VITE_GEMINI_KEY2);
    if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
    if (process.env.GEMINI_KEY2) keys.push(process.env.GEMINI_KEY2);
  }
  return [...new Set(keys.filter(Boolean))];
}

/**
 * Universal Gemini Caller: Tries secure /api/concierge serverless route first,
 * then falls back to direct client call across all available keys & models with 25s timeout.
 */
async function callGemini(systemInstruction) {
  // 1. Serverless endpoint (/api/concierge)
  try {
    const res = await fetch('/api/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction }),
      signal: AbortSignal.timeout(25000)
    });
    if (res.ok) {
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const text = parts.map(p => p.text || '').join('');
      if (text) return text;
    }
  } catch {}

  // 2. Direct client-side call with multi-key and multi-model failover
  const candidateKeys = getAvailableGeminiKeys();
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-flash-latest'];

  for (const model of candidateModels) {
    for (const key of candidateKeys) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemInstruction }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }),
          signal: AbortSignal.timeout(25000)
        });
        if (res.ok) {
          const data = await res.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const text = parts.map(p => p.text || '').join('');
          if (text) return text;
        }
      } catch (err) {
        // Continue to next key or candidate model
      }
    }
  }

  return null;
}

/**
 * --- SESSION & CONVERSATION PERSISTENCE ---
 */
export function getOrCreateSessionId() {
  const STORAGE_KEY = 'khushboo_session_id';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}

export async function loadSessionHistory(sessionId) {
  // 1. Try local storage cache first for instantaneous rendering
  let localMsgs = [];
  try {
    const raw = localStorage.getItem(`khushboo_history_${sessionId}`);
    if (raw) localMsgs = JSON.parse(raw);
  } catch {
    localMsgs = [];
  }

  // 2. Try loading remote history from Supabase if table exists
  try {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        role: row.role,
        content: row.content,
        tasteSummary: row.taste_summary,
        matches: row.matched_cards || [],
        suggestions: row.suggestions || [],
        timestamp: new Date(row.created_at).getTime()
      }));
    }
  } catch {
    // Supabase table may not exist yet; gracefully fallback
  }

  return localMsgs;
}

export async function persistChatMessage(sessionId, msg) {
  // 1. Persist locally first
  try {
    const key = `khushboo_history_${sessionId}`;
    const raw = localStorage.getItem(key);
    const history = raw ? JSON.parse(raw) : [];
    history.push(msg);
    // Keep last 30 turns locally
    localStorage.setItem(key, JSON.stringify(history.slice(-30)));
  } catch (err) {
    console.warn('[Khushboo Storage] Local save error:', err);
  }

  // 2. Save asynchronously to Supabase tables (session + message)
  try {
    // Upsert session
    await supabase.from('ai_chat_sessions').upsert({
      session_id: sessionId,
      last_message: msg.content?.slice(0, 200) || '',
      updated_at: new Date().toISOString()
    });

    // Insert message
    await supabase.from('ai_chat_messages').insert({
      session_id: sessionId,
      role: msg.role,
      content: msg.content,
      taste_summary: msg.tasteSummary || null,
      intent: msg.intent || 'chat',
      matched_ids: (msg.matches || []).map(m => m.id),
      matched_cards: msg.matches || [],
      suggestions: msg.suggestions || []
    });
  } catch {
    // Silently ignore if table has not been created yet in Supabase
  }
}

/**
 * --- MULTI-QUERY INTENT ROUTER ---
 * Analyzes conversational history and routes into the best query tool
 */
export async function analyzeConversationalIntent(chatHistory, externalDossier = null) {
  const perfumesDossier = externalDossier !== null ? externalDossier : (await buildMentionedPerfumesDossier(chatHistory));

  const systemInstruction = `You are "Khushboo", a world-class Indian fragrance sommelier, conversational consultant, and database query router.
Analyze this ongoing conversation between a fragrance enthusiast and Khushboo:

${JSON.stringify(chatHistory, null, 2)}

${perfumesDossier}

CRITICAL AGENTIC EXTRACTION & OLFACORY PROFILING RULES:
1. GROUND-TRUTH DATABASE NOTE REASONING:
   - Carefully examine the verified database note pyramids and accords provided in the dossier above for both the liked and disliked fragrances!
   - Understand WHY the user loved or hated them based on their exact chemical notes:
     * LIKED SCENTS: Extract and prioritize the positive note synergies from the fragrances user loves (e.g. Spearmint, Lavender, Rosemary from Verge; Cardamom, Juniper, Cedarwood from Historic Olmeda; Watermelon, Violet from Raw).
     * STRICT NEGATION OVERRIDES: If the user explicitly negates a note or accord (e.g. "hate citrus", "remove sweet", "no aquatic"), you MUST strictly ban and remove those notes/accords from all targets, EVEN IF they were present in a liked scent (e.g. strip Lemon, Bergamot, Grapefruit entirely)!
     * DISLIKED SCENTS: Identify the clashing/heavy accords and notes that caused the negative experience (e.g. Zanzibar's heavy coconut and vanilla sweetness, Caprice's amber warmth), and ban them from recommendations.

2. MULTI-TURN CUMULATIVE STATE:
   - Unless the user explicitly says "start over" or "new search", EVERY user message is an INCREMENTAL REFINEMENT on top of the conversation so far!
   - ACCUMULATE PREFERENCES: If the user loved Raw/Verge (summer, fresh, mint, lavender) in Turn 1, asked for spicy mint & no sweet in Turn 2, says they love Historic Olmeida in Turn 3, and hates citrus in Turn 4:
     * PRESERVE & ACCUMULATE: Summer season, mint, lavender, crisp aromatic freshness, spicy cardamom facet, and Historic Olmeida style.
     * STRICT NEGATION: Strip out all citrus (Lemon, Bergamot, Grapefruit, Orange), sweet, gourmand, vanilla, tonka, and heavy fruit notes.
     * SEPARATE LIKES FROM DISLIKES:
       - liked_perfumes: Fragrances user loves or owns (e.g. Raw, Verge, Historic Olmeida). NEVER recommend buying these exact bottles, but DO use them as positive inspiration!
       - disliked_perfumes: Fragrances user hated or disliked (e.g. Rare Reef, Zanzibar, Al Nashama Caprice). STRICTLY EXCLUDE & PENALIZE!

3. TYPO-TOLERANT SENTIMENT & PERFUME ENTITY EXTRACTION:
   - Users speak informally, make typos, miss letters, use semicolons instead of apostrophes (e.g. "didn;t like", "didnt like", "hated", "not a fan", "caprice missed the mark", "nashma caprice", "zanzibar", "rare reef").
   - Extract "disliked_perfumes": ONLY perfumes user explicitly disliked, hated, tried and failed, found disappointing, or said to avoid.
     Include canonical names AND user typo variants/nicknames (e.g. ["Lattafa Al Nashama Caprice", "Al Nashama Caprice", "Nashama Caprice", "Nashma Caprice", "Caprice", "Rare Reef", "Zanzibar", "Rare Reef Zanzibar", "Tres Nuit"]).
     NEVER put liked or owned perfumes in disliked_perfumes!
   - Extract "liked_perfumes": ONLY fragrances user already loves, likes, or currently owns (e.g. ["Titan Skinn Raw", "Raw", "Titan Skinn Verge", "Verge", "Afnan Historic Olmeda", "Historic Olmeida"]). NEVER put these into disliked_perfumes!

4. AGENTIC OLFACTORY NOTE & ACCORD SYNTHESIS:
   - Do NOT just repeat literal words. Translate natural descriptions and verified note pyramids into authentic perfumery note pyramids and accords:
     * User: "minty and lavendery ones, specially the combo", "spicy mint", "only summer", "remove sweet fragrances", "love historic olmeida", "hate citrus":
     * target_top_notes: ["Mint", "Spearmint", "Peppermint", "Lavender", "Cardamom"] (ZERO citrus!)
     * target_middle_notes: ["Lavender", "Mint", "Geranium", "Cardamom", "Ginger", "Rosemary", "Black Pepper", "Cedar"]
     * target_base_notes: ["Cedarwood", "Vetiver", "Ambroxan", "White Musk"]
     * target_accords: ["Aromatic", "Fresh Spicy", "Green", "Fresh", "Lavender", "Woody"]
     * exclude_accords: Strictly ban ["Citrus", "Sweet", "Vanilla", "Warm Spicy", "Gourmand", "Caramel", "Honey", "Amber"]
     * exclude_notes: Strictly ban ["Lemon", "Bergamot", "Grapefruit", "Mandarin", "Orange", "Citrus", "Vanilla", "Tonka Bean", "Sugar", "Caramel", "Praline", "Honey", "Chocolate", "Amber"]

5. CLASSIFY THE USER'S INTENT into ONE of these query modes:
   - "brand_catalog": The user asks to list, explore, or see perfumes from a specific brand (e.g. "give me all ajmal perfumes", "show me lattafa perfumes", "what do you have from afnan?", "skinn by titan fragrances").
   - "direct_search": The user asks about a specific fragrance title or famous clone/line (e.g. "do you have hawas?", "show me khamrah", "kuro", "liquid brun", "aventus clones").
   - "decant_finder": The user specifically asks for decants, samplers, discovery vials, or budget decants (e.g. "show me cheap decants under 250", "summer decants").
   - "seller_stock": The user asks what a specific verified community seller has in stock (e.g. "what does Second Theory have?", "show Talib's stock", "darsh fragrances").
   - "deals_and_top_rated": The user asks for best rated, biggest compliments, or price drops under a budget (e.g. "best winter perfumes under 2000", "top rated beast mode scents").
   - "olfactory_match": The user describes scent preferences, notes they love or hate (opening blast vs heart vs drydown), or asks for alternatives/inspirations (e.g. "i like raw, want citrus opening with woody drydown, no bdc clones").
   - "general_qa": The user asks a pure knowledge question (e.g. "what is ambroxan?", "what does maceration mean?", "how long does Kaaf last?", "what is the difference between EDT and EDP?") where NO product cards are needed.

6. SEMANTIC SEARCH PROMPT:
   - Generate a rich, descriptive query for pgvector dense vector embedding search that captures the CUMULATIVE profile (e.g. "summer fresh spicy mint lavender crisp aromatic non-sweet zero-citrus cooling masculine daytime woody").

7. CONVERSATIONAL REPLY:
   - Write Khushboo's warm, knowledgeable, charming 1-3 sentence response directly acknowledging the user's cumulative refinements, contrasting the notes between what worked and what didn't (e.g. how we kept spicy mint, lavender, and Historic Olmeda's aromatic freshness while strictly banishing citrus and sweetness, steering clear of Caprice and Zanzibar).

Return strictly raw JSON with this schema:
{
  "intent": "brand_catalog" | "direct_search" | "decant_finder" | "seller_stock" | "deals_and_top_rated" | "olfactory_match" | "general_qa",
  "is_refinement": true | false,
  "brand_filter": "Brand name or null",
  "search_term": "Search title or null",
  "seller_filter": "Seller name or null",
  "contrast_liked": "Perfume title or null",
  "contrast_disliked": "Perfume title or null",
  "disliked_perfumes": ["Perfume name or variant 1", "variant 2"],
  "liked_perfumes": ["Perfume name or variant 1", "variant 2"],
  "is_discovery_mode": true | false,
  "conversational_reply": "Khushboo's warm personalized response",
  "taste_summary": "1-sentence summary capsule of current cumulative criteria",
  "semantic_search_prompt": "Rich search text for 3072-dim pgvector embedding",
  "target_inspirations": ["%LuxuryBrand Or Perfume%"],
  "exclude_inspirations": ["%ExcludedInspiration%"],
  "exclude_terms": ["%ExcludedPerfumeOrBrand%"],
  "exclude_perfumes": ["PerfumeName"],
  "target_accords": ["%AccordName%"],
  "exclude_accords": ["ForbiddenAccordName"],
  "target_top_notes": ["%NoteName%"],
  "target_middle_notes": ["%NoteName%"],
  "target_base_notes": ["%NoteName%"],
  "target_notes": ["%NoteName%"],
  "exclude_notes": ["ForbiddenNoteName"],
  "target_season": "summer" | "winter" | "all",
  "max_price": 15000,
  "min_rating": 3.8,
  "suggestions": ["Follow-up prompt 1", "Follow-up prompt 2", "Follow-up prompt 3"]
}

Rules:
- Return raw JSON only, no markdown.`;

  try {
    const text = await callGemini(systemInstruction);
    if (text) {
      const parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, ''));
      const wrap = arr => (arr || []).map(item => (typeof item === 'string' && !item.startsWith('%')) ? `%${item}%` : item);
      const unwrap = arr => (arr || []).map(item => String(item || '').replace(/%/g, '').trim().toLowerCase()).filter(Boolean);

      // Normalize exclusions (strip "clones", "direct inspiration")
      const rawExclusions = wrap(parsed.exclude_inspirations);
      const cleanExclusions = rawExclusions.map(ex =>
        ex.replace(/clones?|direct|inspirations?|inspired by/gi, '').replace(/%+/g, '%').trim()
      ).filter(Boolean);

      // Filter out excluded archetypes from positive target inspirations
      const rawTargets = wrap(parsed.target_inspirations);
      const safeTargets = rawTargets.filter(tgt => {
        const tClean = tgt.replace(/%/g, '').toLowerCase().trim();
        return !cleanExclusions.some(ex => {
          const exClean = ex.replace(/%/g, '').toLowerCase().trim();
          return exClean && (tClean.includes(exClean) || exClean.includes(tClean));
        });
      });

      // Keep disliked and liked strictly segregated - liked perfumes must NEVER be in disliked!
      const rawDisliked = unwrap(parsed.disliked_perfumes);
      const allLikedPerfumes = Array.from(new Set([
        ...unwrap(parsed.liked_perfumes),
        ...unwrap(parsed.liked_or_owned_perfumes)
      ]));

      const safeDislikedPerfumes = rawDisliked.filter(d =>
        !allLikedPerfumes.some(l => l.includes(d) || d.includes(l) || isMatchFuzzy(l, d))
      );

      return {
        intent: parsed.intent || 'olfactory_match',
        is_refinement: Boolean(parsed.is_refinement),
        brand_filter: parsed.brand_filter || null,
        search_term: parsed.search_term || null,
        seller_filter: parsed.seller_filter || null,
        contrast_liked: parsed.contrast_liked || null,
        contrast_disliked: parsed.contrast_disliked || null,
        disliked_perfumes: safeDislikedPerfumes,
        liked_perfumes: allLikedPerfumes,
        is_discovery_mode: Boolean(parsed.is_discovery_mode),
        conversational_reply: parsed.conversational_reply || "Here is what I found across our verified catalog.",
        taste_summary: parsed.taste_summary || "Curated olfactory selections based on your conversation.",
        semantic_search_prompt: parsed.semantic_search_prompt || parsed.taste_summary || "",
        target_inspirations: safeTargets,
        exclude_inspirations: cleanExclusions,
        exclude_terms: wrap(parsed.exclude_terms),
        exclude_perfumes: safeDislikedPerfumes,
        target_accords: wrap(parsed.target_accords),
        exclude_accords: unwrap(parsed.exclude_accords),
        target_top_notes: wrap(parsed.target_top_notes),
        target_middle_notes: wrap(parsed.target_middle_notes),
        target_base_notes: wrap(parsed.target_base_notes),
        target_notes: wrap(parsed.target_notes),
        exclude_notes: unwrap(parsed.exclude_notes),
        target_season: parsed.target_season || 'summer',
        max_price: parsed.max_price || 15000,
        min_rating: parsed.min_rating || 3.8,
        suggestions: parsed.suggestions || [
          "Show only under ₹2,000",
          "Show available decants",
          "Tell me more about #1",
          "Different brand options"
        ]
      };
    }
  } catch (err) {
    console.warn('[Khushboo] Router error:', err.message);
  }

  // If Gemini is unreachable or exhausted daily quota, inform the user cleanly
  return {
    intent: 'service_down',
    is_service_down: true,
    brand_filter: null,
    search_term: null,
    seller_filter: null,
    contrast_liked: null,
    contrast_disliked: null,
    disliked_perfumes: [],
    liked_perfumes: [],
    is_discovery_mode: false,
    conversational_reply: "Looks like we have used our daily limit for AI concierge, this is not available right now. Please check back in a little while!",
    taste_summary: null,
    semantic_search_prompt: "",
    target_inspirations: [],
    exclude_inspirations: [],
    exclude_terms: [],
    exclude_perfumes: [],
    target_accords: [],
    exclude_accords: [],
    target_top_notes: [],
    target_middle_notes: [],
    target_base_notes: [],
    target_notes: [],
    exclude_notes: [],
    target_season: 'all',
    max_price: 15000,
    min_rating: 3.8,
    suggestions: [
      "Browse top rated perfumes",
      "Explore summer fresh decants",
      "Check community sellers"
    ]
  };
}

/**
 * Agentic Multi-Turn Fallback Router
 * Reconstructs the complete cumulative olfactory profile across all conversational turns
 * even if external LLM generation is unavailable or times out.
 */
export function fallbackExtractIntent(chatHistory) {
  const messages = Array.isArray(chatHistory) ? chatHistory : [{ role: 'user', content: String(chatHistory || '') }];
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content || '');
  const combinedUserText = userMessages.join(' | ').toLowerCase().replace(/([a-z])[;’`]+([a-z])/gi, "$1'$2");
  const lastUserText = (userMessages[userMessages.length - 1] || '').toLowerCase().replace(/([a-z])[;’`]+([a-z])/gi, "$1'$2");

  // 1. Single-turn special intents on latest message (Brand / Decant)
  const brandMatch = lastUserText.match(/(?:all|show|give me|list)\s*(?:the\s*)?(ajmal|lattafa|afnan|rasasi|armaf|ahmed al maghribi|titan|skinn|paris corner|fragrance world|al haramain)/i);
  if (brandMatch) {
    const brand = brandMatch[1];
    return {
      intent: 'brand_catalog',
      is_refinement: false,
      brand_filter: brand,
      search_term: null,
      seller_filter: null,
      contrast_liked: null,
      contrast_disliked: null,
      disliked_perfumes: [],
      liked_perfumes: [],
      is_discovery_mode: false,
      conversational_reply: `Here are the top-rated in-stock perfumes from ${brand} across verified community sellers.`,
      taste_summary: `Browsing ${brand} collection`,
      semantic_search_prompt: `${brand} fragrance best sellers verified in stock`,
      target_inspirations: [],
      exclude_inspirations: [],
      exclude_terms: [],
      exclude_perfumes: [],
      target_accords: [],
      exclude_accords: [],
      target_top_notes: [],
      target_middle_notes: [],
      target_base_notes: [],
      target_notes: [],
      exclude_notes: [],
      target_season: 'all',
      max_price: 15000,
      min_rating: 3.8,
      suggestions: [`Under ₹2,500 from ${brand}`, `Best rated ${brand}`, `Decants of ${brand}`]
    };
  }

  if (/decant|sampler|vial/i.test(lastUserText)) {
    const budgetMatch = lastUserText.match(/(?:under|below|budget|within|upto|up to|rs\.?|inr|₹)\s*(\d{3,5})/i);
    const maxPrice = budgetMatch ? parseInt(budgetMatch[1], 10) : 500;
    return {
      intent: 'decant_finder',
      is_refinement: false,
      brand_filter: null,
      search_term: null,
      seller_filter: null,
      contrast_liked: null,
      contrast_disliked: null,
      disliked_perfumes: [],
      liked_perfumes: [],
      is_discovery_mode: false,
      conversational_reply: `Here are verified community decants available under ₹${maxPrice}.`,
      taste_summary: `Decants under ₹${maxPrice}`,
      semantic_search_prompt: `decants samples discovery vials under ${maxPrice}`,
      target_inspirations: [],
      exclude_inspirations: [],
      exclude_terms: [],
      exclude_perfumes: [],
      target_accords: [],
      exclude_accords: [],
      target_top_notes: [],
      target_middle_notes: [],
      target_base_notes: [],
      target_notes: [],
      exclude_notes: [],
      target_season: 'all',
      max_price: maxPrice,
      min_rating: 3.8,
      suggestions: ["Under ₹200 only", "Summer fresh decants", "Full bottle alternatives"]
    };
  }

  // 2. Cumulative Multi-Turn Olfactory Extraction
  const deterministicDislikes = extractDeterministicDislikes(messages);
  const deterministicLiked = extractDeterministicLiked(messages);

  const topNotes = new Set();
  const middleNotes = new Set();
  const baseNotes = new Set();
  const targetAccords = new Set();
  const excludeAccords = new Set();
  const excludeNotes = new Set();
  const targetInspirations = new Set();
  const excludeInspirations = new Set();

  // Accumulate notes & accords across the entire conversation
  if (/mint|spearmint|peppermint/i.test(combinedUserText)) {
    topNotes.add('%Mint%');
    topNotes.add('%Spearmint%');
    middleNotes.add('%Mint%');
    targetAccords.add('%Aromatic%');
    targetAccords.add('%Green%');
  }

  if (/lavender|lavendery/i.test(combinedUserText)) {
    topNotes.add('%Lavender%');
    middleNotes.add('%Lavender%');
    targetAccords.add('%Lavender%');
    targetAccords.add('%Aromatic%');
  }

  if (/spicy|fresh spicy|spice|cardamom|pepper/i.test(combinedUserText)) {
    middleNotes.add('%Cardamom%');
    middleNotes.add('%Black Pepper%');
    middleNotes.add('%Ginger%');
    targetAccords.add('%Fresh Spicy%');
  }

  if (/raw/i.test(combinedUserText)) {
    topNotes.add('%Bergamot%');
    topNotes.add('%Watermelon%');
    baseNotes.add('%Patchouli%');
    targetInspirations.add('%Titan Skinn Raw%');
  }

  if (/verge/i.test(combinedUserText)) {
    topNotes.add('%Lavender%');
    topNotes.add('%Lemon%');
    baseNotes.add('%Oakmoss%');
    targetInspirations.add('%Titan Skinn Verge%');
  }

  if (/historic olmeida|olmeida/i.test(combinedUserText)) {
    topNotes.add('%Grapefruit%');
    topNotes.add('%Cardamom%');
    middleNotes.add('%Lavender%');
    middleNotes.add('%Cedar%');
    baseNotes.add('%Vetiver%');
    targetInspirations.add('%Afnan Historic Olmeida%');
  }

  if (/citrus|lemon|bergamot|grapefruit|orange/i.test(combinedUserText)) {
    topNotes.add('%Bergamot%');
    topNotes.add('%Lemon%');
    targetAccords.add('%Citrus%');
  }

  if (/marine|aquatic|sea|ocean/i.test(combinedUserText)) {
    topNotes.add('%Sea Notes%');
    targetAccords.add('%Aquatic%');
    targetAccords.add('%Marine%');
  }

  // Woody & clean masculine base
  baseNotes.add('%Cedarwood%');
  baseNotes.add('%Vetiver%');
  baseNotes.add('%Ambroxan%');
  targetAccords.add('%Fresh%');

  // Negation: strictly strip sweetness if requested in ANY turn
  const noSweet = /remove sweet|no sweet|not sweet|non[- ]sweet|without sweet|stop sweet/i.test(combinedUserText);
  if (noSweet) {
    ['sweet', 'vanilla', 'warm spicy', 'gourmand', 'caramel', 'honey', 'amber'].forEach(a => excludeAccords.add(a));
    ['vanilla', 'tonka bean', 'sugar', 'caramel', 'praline', 'honey', 'chocolate', 'amber'].forEach(n => excludeNotes.add(n));
  }

  // Disliked archetypes
  if (/caprice/i.test(combinedUserText)) {
    excludeInspirations.add('%Al Nashama Caprice%');
    excludeInspirations.add('%Sedley%');
  }
  if (/tres nuit/i.test(combinedUserText)) {
    excludeInspirations.add('%Green Irish Tweed%');
  }
  if (/zanzibar/i.test(combinedUserText)) {
    excludeInspirations.add('%Zanzibar%');
  }

  // Build authentic sommelier cumulative taste summary
  const likedNames = deterministicLiked.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  const dislikedNames = deterministicDislikes.map(w => w.charAt(0).toUpperCase() + w.slice(1));

  const noteDescriptors = [];
  if (noSweet) noteDescriptors.push('non-sweet');
  if (/mint/i.test(combinedUserText)) noteDescriptors.push('crisp spicy mint');
  if (/lavender/i.test(combinedUserText)) noteDescriptors.push('lavender');
  if (/citrus/i.test(combinedUserText)) noteDescriptors.push('citrus');
  if (noteDescriptors.length === 0) noteDescriptors.push('refreshing aromatic');

  let tasteSummary = `Summer profile focused on ${noteDescriptors.join(', ')}`;
  if (likedNames.length > 0) {
    tasteSummary += ` (inspired by ${likedNames.join(', ')})`;
  }
  if (dislikedNames.length > 0) {
    tasteSummary += `, strictly avoiding ${dislikedNames.join(', ')}`;
  }

  const conversationalReply = `I've synthesized your cumulative tastes: focusing purely on ${noteDescriptors.join(' and ')} for summer${likedNames.length > 0 ? ` (in the lineage of ${likedNames.join(', ')})` : ''}${noSweet ? ', stripping out all heavy sweetness' : ''}${dislikedNames.length > 0 ? `, while completely bypassing ${dislikedNames.join(', ')}` : ''}.`;

  const semanticSearchPrompt = `summer ${noSweet ? 'non-sweet ' : ''}${noteDescriptors.join(' ')} aromatic lavender cedarwood vetiver masculine daytime cooling`;

  return {
    intent: 'olfactory_match',
    is_refinement: userMessages.length > 1,
    brand_filter: null,
    search_term: null,
    seller_filter: null,
    contrast_liked: likedNames[0] || null,
    contrast_disliked: dislikedNames[0] || null,
    disliked_perfumes: deterministicDislikes,
    liked_perfumes: deterministicLiked,
    is_discovery_mode: false,
    conversational_reply: conversationalReply,
    taste_summary: tasteSummary,
    semantic_search_prompt: semanticSearchPrompt,
    target_inspirations: Array.from(targetInspirations),
    exclude_inspirations: Array.from(excludeInspirations),
    exclude_terms: deterministicDislikes.map(d => `%${d}%`),
    exclude_perfumes: deterministicDislikes,
    target_accords: Array.from(targetAccords),
    exclude_accords: Array.from(excludeAccords),
    target_top_notes: Array.from(topNotes),
    target_middle_notes: Array.from(middleNotes),
    target_base_notes: Array.from(baseNotes),
    target_notes: [...topNotes, ...middleNotes, ...baseNotes],
    exclude_notes: Array.from(excludeNotes),
    target_season: 'summer',
    max_price: 15000,
    min_rating: 3.8,
    suggestions: [
      "Show only under ₹2,000",
      "Show available decants",
      "Tell me more about #1",
      "Different brand options"
    ]
  };
}

/**
 * --- MULTI-QUERY EXECUTOR ---
 * Executes the targeted query according to classified intent
 */
async function executeMultiQuery(criteria) {
  const intent = criteria.intent || 'olfactory_match';

  // 1. BRAND CATALOG QUERY
  if (intent === 'brand_catalog' && criteria.brand_filter) {
    const cleanBrand = criteria.brand_filter.replace(/%/g, '').trim();
    let query = supabase.from('fragrances')
      .select('id, name, brand, community_price, lowest_decant_price, dna_inspiration, dna_type, best_bottle_seller, community_sellers, rating_value, accords, in_seller_stock, has_decants')
      .ilike('brand', `%${cleanBrand}%`);

    // Strict bottle budget: if user specified a budget and did NOT ask for decants, filter retail/tester bottle price only
    if (criteria.max_price && criteria.max_price < 50000) {
      query = query.eq('in_seller_stock', true).lte('community_price', criteria.max_price);
    } else {
      query = query.or('in_seller_stock.eq.true,has_decants.eq.true');
    }

    const { data } = await query.order('rating_value', { ascending: false }).limit(10);
    return (data || []).map(f => ({
      ...f,
      best_seller: f.community_sellers?.[0]?.seller_name || f.best_bottle_seller || 'Verified Seller',
      match_score: 95
    }));
  }

  // 2. DIRECT SEARCH QUERY
  if (intent === 'direct_search' && criteria.search_term) {
    const term = criteria.search_term.replace(/%/g, '').trim();
    let query = supabase.from('fragrances')
      .select('id, name, brand, community_price, lowest_decant_price, dna_inspiration, dna_type, best_bottle_seller, community_sellers, rating_value, accords, in_seller_stock, has_decants')
      .or(`name.ilike.%${term}%,dna_inspiration.ilike.%${term}%,brand.ilike.%${term}%`);

    if (criteria.max_price && criteria.max_price < 50000) {
      query = query.eq('in_seller_stock', true).lte('community_price', criteria.max_price);
    } else {
      query = query.or('in_seller_stock.eq.true,has_decants.eq.true');
    }

    const { data } = await query.order('rating_value', { ascending: false }).limit(8);

    return (data || []).map(f => ({
      ...f,
      best_seller: f.community_sellers?.[0]?.seller_name || f.best_bottle_seller || 'Verified Seller',
      match_score: 96
    }));
  }

  // 3. DECANT FINDER QUERY
  if (intent === 'decant_finder') {
    const maxPrice = criteria.max_price || 500;
    const { data } = await supabase.from('fragrances')
      .select('id, name, brand, community_price, lowest_decant_price, dna_inspiration, dna_type, best_bottle_seller, community_sellers, rating_value, accords, in_seller_stock, has_decants')
      .eq('has_decants', true)
      .lte('lowest_decant_price', maxPrice)
      .order('lowest_decant_price', { ascending: true })
      .limit(8);

    return (data || []).map(f => ({
      ...f,
      best_seller: f.community_sellers?.[0]?.seller_name || f.best_bottle_seller || 'Verified Decanter',
      match_score: 94
    }));
  }

  // 4. SELLER INVENTORY QUERY
  if (intent === 'seller_stock' && criteria.seller_filter) {
    const seller = criteria.seller_filter.toLowerCase();
    const { data } = await supabase.from('fragrances')
      .select('id, name, brand, community_price, lowest_decant_price, dna_inspiration, dna_type, best_bottle_seller, community_sellers, rating_value, accords, in_seller_stock, has_decants')
      .or('in_seller_stock.eq.true,has_decants.eq.true')
      .limit(50);

    const matches = (data || []).filter(f => {
      const best = (f.best_bottle_seller || '').toLowerCase();
      const sJson = JSON.stringify(f.community_sellers || []).toLowerCase();
      return best.includes(seller) || sJson.includes(seller);
    }).slice(0, 8);

    return matches.map(f => ({
      ...f,
      best_seller: criteria.seller_filter,
      match_score: 92
    }));
  }

  // 5. DEALS & TOP RATED QUERY
  if (intent === 'deals_and_top_rated') {
    let query = supabase.from('fragrances')
      .select('id, name, brand, community_price, lowest_decant_price, dna_inspiration, dna_type, best_bottle_seller, community_sellers, rating_value, accords, in_seller_stock, has_decants');

    if (criteria.max_price && criteria.max_price < 50000) {
      query = query.eq('in_seller_stock', true).lte('community_price', criteria.max_price);
    } else {
      query = query.or('in_seller_stock.eq.true,has_decants.eq.true');
    }

    const { data } = await query.order('rating_value', { ascending: false }).limit(8);
    return (data || []).map(f => ({
      ...f,
      best_seller: f.community_sellers?.[0]?.seller_name || f.best_bottle_seller || 'Verified Seller',
      match_score: 90
    }));
  }

  // 6. GENERAL QA (NO CARDS NEEDED)
  if (intent === 'general_qa') {
    return [];
  }

  // 7. NATIVE PGVECTOR SEMANTIC MATCHING (PRIMARY)
  try {
    const semanticText = criteria.semantic_search_prompt || criteria.taste_summary || criteria.raw_prompt || [
      criteria.taste_summary,
      ...(criteria.target_top_notes || []),
      ...(criteria.target_base_notes || []),
      ...(criteria.target_accords || [])
    ].filter(Boolean).map(s => String(s).replace(/%/g, '')).join(' ');

    const semanticCandidates = await searchFragrancesBySemanticEmbedding(semanticText, 30);
    if (semanticCandidates && semanticCandidates.length > 0) {
      return semanticCandidates;
    }
  } catch (err) {
    console.warn('[Concierge] Native pgvector search fallback:', err.message);
  }

  // 8. OLFACTORY NOTE PYRAMID RPC (FALLBACK)
  const allNotes = [
    ...(criteria.target_top_notes || []),
    ...(criteria.target_middle_notes || []),
    ...(criteria.target_base_notes || []),
    ...(criteria.target_notes || [])
  ];

  try {
    const { data, error } = await supabase.rpc('match_fragrance_concierge', {
      target_inspirations: criteria.target_inspirations || [],
      target_accords: criteria.target_accords || [],
      target_notes: allNotes,
      max_price: criteria.max_price || 15000,
      min_rating: criteria.min_rating || 3.8,
      exclude_inspirations: criteria.exclude_inspirations || [],
      exclude_names: criteria.exclude_terms || []
    });

    if (!error && data) return data;
  } catch {
    // Fallback to 5-param signature if needed
    const { data } = await supabase.rpc('match_fragrance_concierge', {
      target_inspirations: criteria.target_inspirations || [],
      target_accords: criteria.target_accords || [],
      target_notes: allNotes,
      max_price: criteria.max_price || 15000,
      min_rating: criteria.min_rating || 3.8
    });
    return data || [];
  }

  return [];
}

/**
 * --- OLFACTORY CONTRAST & DELTA ENGINE ---
 * Compares liked perfume A vs disliked perfume B to determine why B failed and what A did right.
 */
async function computeOlfactoryDelta(likedQuery, dislikedQuery) {
  if (!likedQuery || !dislikedQuery) return null;

  const findFrag = async (query) => {
    const clean = (query || '').replace(/%/g, '').trim().toLowerCase();
    if (!clean) return null;
    const { data } = await supabase.from('fragrances')
      .select('id, name, brand, accords, top_notes, middle_notes, base_notes, review_summary, dna_inspiration, dna_twins, flankers')
      .or(`name.ilike.%${clean}%,dna_inspiration.ilike.%${clean}%`)
      .limit(1);
    return data?.[0] || null;
  };

  try {
    const [perfumeA, perfumeB] = await Promise.all([
      findFrag(likedQuery),
      findFrag(dislikedQuery)
    ]);

    if (!perfumeA || !perfumeB) return null;

    const accordsA = {};
    (perfumeA.accords || []).forEach(a => accordsA[a.name.toLowerCase()] = a.score || 0);
    const accordsB = {};
    (perfumeB.accords || []).forEach(b => accordsB[b.name.toLowerCase()] = b.score || 0);

    const prizedAccords = [];
    const offendingAccords = [];

    for (const [k, vA] of Object.entries(accordsA)) {
      const vB = accordsB[k] || 0;
      if (vA - vB >= 10 || (vA > 60 && vB === 0)) {
        prizedAccords.push({ name: k, diff: vA - vB, score: vA });
      }
    }

    for (const [k, vB] of Object.entries(accordsB)) {
      const vA = accordsA[k] || 0;
      if (vB - vA >= 10 || (vB > 60 && vA === 0)) {
        offendingAccords.push({ name: k, diff: vB - vA, score: vB });
      }
    }

    const consB = perfumeB.review_summary?.cons || [];
    const prosA = perfumeA.review_summary?.pros || [];
    const quotesA = perfumeA.review_summary?.top_reviewer_quotes || [];

    return {
      perfumeA,
      perfumeB,
      likedName: `${perfumeA.brand} ${perfumeA.name}`,
      dislikedName: `${perfumeB.brand} ${perfumeB.name}`,
      prizedAccords,
      offendingAccords,
      prosA,
      consB,
      quotesA,
      summary: `Contrast Analysis: User loved ${perfumeA.brand} ${perfumeA.name} but disliked ${perfumeB.brand} ${perfumeB.name}. Key difference: ${perfumeA.name} is prized for ${prizedAccords.map(a => a.name).join(', ') || 'its smooth balanced drydown'}, whereas ${perfumeB.name} over-indexed on ${offendingAccords.map(a => a.name).join(', ') || 'harsh sharpness'} with reviewer concerns (${consB[0] || 'synthetic sharpness'}).`
    };
  } catch (err) {
    console.warn('[Khushboo Delta] Error computing delta:', err.message);
    return null;
  }
}

function isClashingProfile(fragrance, userPrompt) {
  const p = (userPrompt || '').toLowerCase();
  const accords = fragrance.accords || [];
  
  // If user requested summer / fresh / aquatic / citrus / cooling / mint
  const wantsSummerFresh = /(?:summer|fresh|citrus|aquatic|marine|cooling|mint|clean)/i.test(p);
  if (wantsSummerFresh) {
    const leatherScore = accords.find(a => a.name.toLowerCase().includes('leather'))?.score || 0;
    const oudScore = accords.find(a => a.name.toLowerCase().includes('oud') || a.name.toLowerCase().includes('animalic'))?.score || 0;
    const heavySpicyScore = accords.find(a => a.name.toLowerCase().includes('warm spicy') || a.name.toLowerCase().includes('smoky'))?.score || 0;
    
    // Leather > 65 or Oud > 60 or Heavy Warm Spicy/Smoky > 75 directly clash with fresh summer mint/citrus
    if (leatherScore > 65 || oudScore > 60 || heavySpicyScore > 75) {
      return true;
    }
  }

  // If user explicitly dislikes or asked to remove sweet / gourmand fragrances
  const hatesSweet = /(?:don'?t like sweet|no sweet|remove sweet|hate sweet|not sweet|non-sweet|avoid sweet)/i.test(p);
  if (hatesSweet) {
    const sweetScore = accords.find(a => {
      const n = (a.name || '').toLowerCase();
      return n === 'sweet' || n.includes('gourmand') || n.includes('vanilla');
    })?.score || 0;
    if (sweetScore > 35) {
      return true;
    }
  }

  // If user requested cozy / winter / gourmand / sweet / vanilla / boozy / dates
  const wantsWinterGourmand = /(?:winter|warm|gourmand|sweet|vanilla|boozy|dates|praline|coffee)/i.test(p);
  if (wantsWinterGourmand && !wantsSummerFresh && !hatesSweet) {
    const aquaticScore = accords.find(a => a.name.toLowerCase().includes('marine') || a.name.toLowerCase().includes('aquatic'))?.score || 0;
    if (aquaticScore > 75) {
      return true;
    }
  }

  return false;
}

/**
 * --- CURATED DISCOVERY PALETTE (BEYOND CLONES) ---
 * Builds a balanced 4-quadrant discovery experience:
 * 1. Refined Sibling (fixes the flaw of the disliked twin)
 * 2. Adjacent Olfactory Cousin (different inspiration, shared loved accord harmony)
 * 3. Elevated Curveball Discovery (niche horizon)
 * 4. Clean Daily Driver (crowd-pleasing versatile performer)
 */
async function buildDiscoveryPalette(criteria, deltaInfo, deterministicDislikes, deterministicLiked = []) {
  try {
    let query = supabase.from('fragrances')
      .select('id, name, brand, accords, top_notes, middle_notes, base_notes, review_summary, dna_inspiration, dna_type, rating_value, community_price, lowest_decant_price, in_seller_stock, has_decants, best_bottle_seller, community_sellers')
      .gte('rating_value', 3.8);

    if (criteria.max_price && criteria.max_price < 50000) {
      query = query.eq('in_seller_stock', true).lte('community_price', criteria.max_price);
    } else {
      query = query.or('in_seller_stock.eq.true,has_decants.eq.true');
    }

    const { data: pool, error } = await query.limit(250);
    if (error || !pool || pool.length === 0) return null;

    const pA = deltaInfo?.perfumeA;
    const pB = deltaInfo?.perfumeB;
    const offendingAccordNames = (deltaInfo?.offendingAccords || []).map(a => a.name.toLowerCase());

    const isExcluded = (f) => {
      if (pA && f.id === pA.id) return true;
      if (pB && f.id === pB.id) return true;
      const full = `${f.brand} ${f.name} ${f.dna_inspiration || ''}`.toLowerCase();
      for (const d of (deterministicDislikes || [])) {
        if (full.includes(d.toLowerCase())) return true;
      }
      for (const l of (deterministicLiked || [])) {
        if (full.includes(l.toLowerCase())) return true;
      }
      for (const ex of (criteria.exclude_terms || [])) {
        const clean = ex.replace(/%/g, '').toLowerCase().trim();
        if (clean && full.includes(clean)) return true;
      }
      return false;
    };

    const validPool = pool.filter(f => !isExcluded(f) && !isClashingProfile(f, criteria.raw_prompt));

    // 1. Refined Sibling (if delta exists, pick sibling clone from dna_twins or inspiration that has LOW offending accord)
    let sibling = null;
    if (pA?.dna_twins && Array.isArray(pA.dna_twins) && pA.dna_twins.length > 0) {
      sibling = validPool.find(f => {
        if (!pA.dna_twins.includes(f.id)) return false;
        const accords = f.accords || [];
        const offendingScore = accords.find(a => offendingAccordNames.includes(a.name.toLowerCase()))?.score || 0;
        return offendingScore < 50;
      });
    }
    if (!sibling && pA?.dna_inspiration && !pA.dna_inspiration.toLowerCase().includes('original creation')) {
      const inspCore = pA.dna_inspiration.toLowerCase();
      sibling = validPool.find(f => {
        const candInsp = (f.dna_inspiration || '').toLowerCase();
        return candInsp && (candInsp.includes(inspCore) || inspCore.includes(candInsp));
      });
    }

    // 2. Adjacent Olfactory Cousin (different inspiration, shares prized accords like Amber/Musk/Citrus/Aquatic, no offending accords)
    const cousin = validPool.find(f => {
      if (sibling && f.id === sibling.id) return false;
      const candInsp = (f.dna_inspiration || '').toLowerCase();
      const aInsp = (pA?.dna_inspiration || '').toLowerCase();
      if (aInsp && candInsp && (candInsp.includes(aInsp) || aInsp.includes(candInsp))) return false;

      const accords = f.accords || [];
      const hasPrized = (deltaInfo?.prizedAccords || []).some(pa => accords.some(ca => ca.name.toLowerCase().includes(pa.name.toLowerCase()) && ca.score > 60));
      const hasOffending = accords.some(ca => offendingAccordNames.includes(ca.name.toLowerCase()) && ca.score > 55);

      if (hasOffending) return false;
      if (deltaInfo?.prizedAccords?.length > 0) return hasPrized;

      // Fallback: match target accords from criteria
      return (criteria.target_accords || []).some(ta => accords.some(ca => ca.name.toLowerCase().includes(ta.replace(/%/g, '').toLowerCase())));
    });

    // 3. Elevated Curveball Discovery (distinct luxury niche profile: Elysium, God of Fire, Imagination, Pacific Chill, Hacivat, etc.)
    const curveball = validPool.find(f => {
      if (sibling && f.id === sibling.id) return false;
      if (cousin && f.id === cousin.id) return false;
      const insp = (f.dna_inspiration || '').toLowerCase();
      return (
        insp.includes('god of fire') ||
        insp.includes('elysium') ||
        insp.includes('imagination') ||
        insp.includes('pacific chill') ||
        insp.includes('hacivat') ||
        insp.includes('torino21') ||
        insp.includes('gentle fluidity') ||
        insp.includes('sedley')
      );
    });

    // 4. Clean Daily Driver / Versatile Signature (high rated fresh staple with 0 sweetness/harshness)
    const dailyDriver = validPool.find(f => {
      if (sibling && f.id === sibling.id) return false;
      if (cousin && f.id === cousin.id) return false;
      if (curveball && f.id === curveball.id) return false;
      const accords = f.accords || [];
      const isFresh = accords.some(a => ['aquatic', 'fresh', 'citrus', 'aromatic', 'marine'].some(k => a.name.toLowerCase().includes(k)));
      const isSweet = accords.find(a => a.name.toLowerCase().includes('sweet'))?.score || 0;
      return isFresh && isSweet < 35 && f.rating_value >= 4.0;
    });

    const palette = [
      sibling && { ...sibling, palette_role: 'Refined Sibling (Fixes the Flaw)' },
      cousin && { ...cousin, palette_role: 'Adjacent Olfactory Cousin (New Horizon)' },
      curveball && { ...curveball, palette_role: 'Elevated Curveball Discovery' },
      dailyDriver && { ...dailyDriver, palette_role: 'Clean Daily Signature' }
    ].filter(Boolean);

    if (palette.length >= 3) {
      return palette.map(f => ({
        ...f,
        best_seller: f.community_sellers?.[0]?.seller_name || f.best_bottle_seller || 'Verified Seller',
        match_score: 95
      }));
    }
  } catch (err) {
    console.warn('[Khushboo Discovery Palette] Fallback to standard query:', err.message);
  }
  return null;
}

/**
 * --- "WHY THIS FITS YOU" SYNTHESIS WITH COMMUNITY REVIEWS & DELTA ---
 */
async function synthesizeWhys(chatHistory, matches, criteria, deltaInfo, perfumesDossier = '') {
  if (!matches || matches.length === 0) return [];

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';

  const prompt = `You are "Khushboo", a world-class Indian fragrance sommelier, educator, and scent discovery consultant.
The user is having a continuous dialogue with you:
User's last message: "${lastUserMsg}"
Query Intent: ${criteria.intent}
${deltaInfo ? `\nOLFACTORY CONTRAST INSIGHT:\n${deltaInfo.summary}\nPrized notes in liked scent: ${JSON.stringify(deltaInfo.prizedAccords.map(a => a.name))}\nOffending notes in disliked scent: ${JSON.stringify(deltaInfo.offendingAccords.map(a => a.name))}\nReviewer warning on disliked scent: "${deltaInfo.consB?.[0] || 'harsh opening'}"\n` : ''}
${perfumesDossier ? `\n${perfumesDossier}\n` : ''}
Here are the curated fragrances for this user (including verified community review quotes, accords, pros, and cons):
${JSON.stringify(matches.map(m => ({
  id: m.id,
  brand: m.brand,
  name: m.name,
  inspiration: m.dna_inspiration,
  dna_type: m.dna_type,
  price: m.community_price ? `₹${m.community_price}` : (m.lowest_decant_price ? `Decant ₹${m.lowest_decant_price}` : 'Available'),
  seller: m.best_seller,
  palette_role: m.palette_role || 'Curated Match',
  top_accords: (m.accords || []).slice(0, 4).map(a => `${a.name} (${a.score})`),
  community_verdict: m.review_summary?.community_verdict || '',
  top_quotes: (m.review_summary?.top_reviewer_quotes || []).slice(0, 2),
  pros: (m.review_summary?.pros || []).slice(0, 2),
  cons: (m.review_summary?.cons || []).slice(0, 1)
})), null, 2)}

For EACH perfume:
Write an authentic, connoisseur 1-2 sentence "Why this fits you" sommelier explanation.
CRITICAL GUIDELINES:
1. Speak as a passionate sommelier, NOT a generic sales bot.
2. If this is discovery mode or a contrast query, explain how this bottle expands their horizon beyond basic clones, avoids the harshness/sweetness they hated, and honors their loved notes.
3. GROUND your explanation in what real community wearers say (cite their quotes, skin feel in Indian heat, longevity, or smooth opening).

Return strictly raw JSON:
{
  "whys": {
    "perfume_id": "Exact 1-2 sentence reason"
  }
}`;

  try {
    const text = await callGemini(prompt);
    if (text) {
      const parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, ''));
      const whys = parsed.whys || {};
      return matches.map(m => ({
        ...m,
        why: whys[m.id] || generateFallbackWhy(m, criteria, deltaInfo)
      }));
    }
  } catch (err) {
    console.warn('[Khushboo] synthesizeWhys error:', err.message);
  }

  return matches.map(m => ({
    ...m,
    why: generateFallbackWhy(m, criteria, deltaInfo)
  }));
}

function generateFallbackWhy(m, criteria, deltaInfo) {
  if (m.palette_role) {
    return `${m.palette_role}: A standout recommendation tailored to your taste profile, in stock via ${m.best_seller || 'verified sellers'}.`;
  }
  if (criteria?.intent === 'brand_catalog') {
    return `One of ${m.brand}'s standout creations in community stock with a verified ${m.rating_value ? `★ ${m.rating_value}` : 'high'} rating.`;
  }
  if (m.dna_inspiration && !m.dna_inspiration.toLowerCase().includes('original creation')) {
    return `Captures the smooth ${m.dna_type || 'balanced'} olfactory profile inspired by ${m.dna_inspiration}. In stock via ${m.best_seller || 'verified sellers'}.`;
  }
  return `Matches your preferred scent profile and accords, available via ${m.best_seller || 'verified sellers'}.`;
}

/**
 * Agentic Sommelier Selection & Curated Whys
 * Supplies the candidate pool to Gemini to evaluate candidates against the cumulative conversation,
 * remove violating profiles, select the Top 10 best perfumes, and write authentic sommelier whys.
 */
async function curateMatchesWithGemini(chatHistory, candidates, criteria, deltaInfo, allDislikes = new Set(), perfumesDossier = '') {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];

  // Sort by algorithmic score to present the most promising 20 candidates to Gemini
  candidates.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  const candidatePool = candidates.slice(0, 20);

  if (candidatePool.length <= 10) {
    return await synthesizeWhys(chatHistory, candidatePool, criteria, deltaInfo, perfumesDossier);
  }

  const candidateSummaries = candidatePool.map(c => ({
    id: c.id,
    brand: c.brand,
    name: c.name,
    dna_inspiration: c.dna_inspiration,
    accords: (c.accords || []).slice(0, 4).map(a => a.name).join(', '),
    top_notes: (c.top_notes || []).join(', '),
    middle_notes: (c.middle_notes || []).join(', '),
    base_notes: (c.base_notes || []).join(', '),
    season: c.primary_season || 'Summer',
    price: c.community_price ? `₹${c.community_price}` : (c.lowest_decant_price ? `Decant ₹${c.lowest_decant_price}` : 'In Stock')
  }));

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';

  const prompt = `You are Master Sommelier Khushboo, a world-class Indian fragrance connoisseur and scent curator.
The user is having an ongoing conversation:
${JSON.stringify(chatHistory, null, 2)}

User's Latest Query: "${lastUserMsg}"
Cumulative Taste Profile: "${criteria.taste_summary}"
Target Notes: ${JSON.stringify(criteria.target_notes || [])}
Target Accords: ${JSON.stringify(criteria.target_accords || [])}
Excluded Accords/Notes: ${JSON.stringify([...(criteria.exclude_accords || []), ...(criteria.exclude_notes || [])])}
Forbidden/Disliked Fragrances: ${JSON.stringify(Array.from(allDislikes || []))}
${deltaInfo?.summary ? `\nOLFACTORY CONTRAST INSIGHT:\n${deltaInfo.summary}` : ''}
${perfumesDossier ? `\n${perfumesDossier}\n` : ''}

Here are ${candidateSummaries.length} available candidate perfumes in stock from verified community sellers:
${JSON.stringify(candidateSummaries, null, 2)}

TASK:
1. Review all candidates against the user's cumulative constraints.
2. STRICT DISQUALIFICATION: Never, under any circumstances, select or recommend a perfume the user disliked, tried and failed, found disappointing, or said missed the mark (including ${Array.from(allDislikes || []).join(', ')}). Reject them immediately.
3. Select and rank the TOP 10 best perfumes that strictly fulfill all user requirements (e.g. if user said "remove sweet", reject any sweet/vanilla/gourmand scent; if user wants spicy mint and lavender for summer, prioritize scents that hit those notes without sweetness).
4. For each selected perfume, write a passionate, connoisseur 1-2 sentence "why_this_fits" sommelier explanation explaining specifically how it captures the user's refined preferences.

Return strictly raw JSON with this schema:
{
  "selected_matches": [
    {
      "id": "candidate_id",
      "why_this_fits": "Exact 1-2 sentence reason"
    }
  ]
}`;

  try {
    const text = await callGemini(prompt);
    if (text) {
      const parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, ''));
      const selections = parsed.selected_matches;
      if (Array.isArray(selections) && selections.length > 0) {
        const curated = [];
        for (const s of selections) {
          const match = candidatePool.find(c => c.id === s.id);
          if (match) {
            curated.push({
              ...match,
              why: s.why_this_fits || generateFallbackWhy(match, criteria, deltaInfo)
            });
          }
        }

        if (curated.length > 0) {
          if (curated.length < 10) {
            const addedIds = new Set(curated.map(m => m.id));
            for (const cand of candidatePool) {
              if (curated.length >= 10) break;
              if (!addedIds.has(cand.id)) {
                // Ensure backfilled item doesn't violate excluded accords or notes
                const accords = cand.accords || [];
                const violatesAccord = (criteria.exclude_accords || []).some(fa => {
                  const ma = accords.find(a => (a.name || '').toLowerCase().includes(fa.toLowerCase()));
                  return ma && Number(ma.score) > 35;
                });
                if (violatesAccord) continue;

                curated.push({
                  ...cand,
                  why: generateFallbackWhy(cand, criteria, deltaInfo)
                });
                addedIds.add(cand.id);
              }
            }
          }

          // Return in sommelier curated order with smooth dynamic descending match scores (96% down to 74%)
          return curated.slice(0, 10).map((m, idx) => {
            const calibrated = Math.max(70, Math.round(96 - (idx * 2.4)));
            return {
              ...m,
              match_score: calibrated
            };
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Khushboo] Agentic curation fallback:', err.message);
  }

  // Fallback to top 10 by algorithmic match score
  const fallbackList = await synthesizeWhys(chatHistory, candidatePool.slice(0, 10), criteria, deltaInfo, perfumesDossier);
  return fallbackList.map((m, idx) => {
    const base = Number(m.match_score) || 85;
    const targetCap = 95 - (idx * 2.2);
    return {
      ...m,
      match_score: Math.min(Math.round(targetCap), Math.max(68, Math.round(base - (idx * 1.5))))
    };
  });
}

/**
 * --- MAIN ENTRYPOINT: SEND CHAT MESSAGE TO KHUSHBOO ---
 */
export async function sendChatMessageToKhushboo(chatHistory, sessionId) {
  const currentSessionId = sessionId || getOrCreateSessionId();
  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';

  // Extract and build full ground-truth Fragrantica note pyramids for all mentioned perfumes (liked & disliked)
  const perfumesDossier = await buildMentionedPerfumesDossier(chatHistory);
  const criteria = await analyzeConversationalIntent(chatHistory, perfumesDossier);
  criteria.raw_prompt = lastUserMsg;

  // If Gemini service is down or daily quota is exhausted, inform the user cleanly
  if (criteria?.is_service_down || criteria?.intent === 'service_down') {
    const assistantResponse = {
      role: 'assistant',
      content: criteria.conversational_reply || "Looks like we have used our daily limit for AI concierge, this is not available right now. Please check back in a little while!",
      tasteSummary: null,
      taste_summary: null,
      criteria,
      matches: [],
      suggestions: criteria.suggestions || [],
      intent: 'service_down',
      isServiceDown: true
    };
    persistChatMessage(currentSessionId, assistantResponse);
    return assistantResponse;
  }

  // Client-side strict filter to guarantee exclusions never slip through
  const deterministicDislikes = extractDeterministicDislikes(chatHistory);
  const deterministicLiked = extractDeterministicLiked(chatHistory);

  // Construct comprehensive liked/owned set from Gemini's agentic extraction + deterministic regexes
  const allLiked = new Set([
    ...deterministicLiked,
    ...(criteria.liked_perfumes || []),
    ...(criteria.liked_or_owned_perfumes || [])
  ].map(s => String(s || '').replace(/%/g, '').toLowerCase().trim()).filter(Boolean));

  if (criteria.contrast_liked) {
    allLiked.add(criteria.contrast_liked.toLowerCase().trim());
  }

  // Construct comprehensive disliked set from Gemini's agentic extraction + deterministic regexes
  const allDislikes = new Set([
    ...deterministicDislikes,
    ...(criteria.disliked_perfumes || []),
    ...(criteria.exclude_terms || [])
  ].map(s => String(s || '').replace(/%/g, '').toLowerCase().trim()).filter(Boolean));

  if (criteria.contrast_disliked) {
    allDislikes.add(criteria.contrast_disliked.toLowerCase().trim());
  }

  // CRITICAL: A perfume the user loves or owns must NEVER be treated as disliked!
  for (const liked of allLiked) {
    for (const dis of Array.from(allDislikes)) {
      if (dis === liked || isMatchFuzzy(dis, liked) || isMatchFuzzy(liked, dis)) {
        allDislikes.delete(dis);
      }
    }
  }

  // 1. Compute Olfactory Delta if contrast statement was detected
  let deltaInfo = null;
  if (criteria.contrast_liked && criteria.contrast_disliked) {
    deltaInfo = await computeOlfactoryDelta(criteria.contrast_liked, criteria.contrast_disliked);
  }

  // 2. Select Candidates: Vector-First Native Search (Powered by 3,072-dim embeddings)
  let rawMatches = await executeMultiQuery(criteria);
  if (!rawMatches || rawMatches.length === 0) {
    const isDiscovery = criteria.intent === 'olfactory_match' || criteria.is_discovery_mode || Boolean(deltaInfo);
    if (isDiscovery) {
      rawMatches = await buildDiscoveryPalette(criteria, deltaInfo, deterministicDislikes, deterministicLiked);
    }
  }

  const safeMatches = (rawMatches || []).filter(m => {
    const fullText = `${m.brand} ${m.name} ${m.dna_inspiration || ''}`.toLowerCase();

    // 1. Strict Disqualification: Disliked / Tried & Failed / Hated perfumes (with Levenshtein fuzzy matching)
    for (const disliked of allDislikes) {
      if (isMatchFuzzy(fullText, disliked)) return false;
    }

    // 2. Disliked contrast delta perfume B
    if (deltaInfo?.perfumeB && (m.id === deltaInfo.perfumeB.id || isMatchFuzzy(fullText, deltaInfo.perfumeB.name))) {
      return false;
    }

    // 3. Already Loved/Owned Exclusion (Never recommend bottles user already has/loves)
    if (criteria.intent !== 'direct_search') {
      for (const likedName of allLiked) {
        if (isMatchFuzzy(fullText, likedName)) return false;
      }
      if (deltaInfo?.perfumeA && (m.id === deltaInfo.perfumeA.id || isMatchFuzzy(fullText, deltaInfo.perfumeA.name))) {
        return false;
      }
    }

    // 4. Excluded Inspirations Archetypes
    for (const ex of (criteria.exclude_inspirations || [])) {
      if (isMatchFuzzy(fullText, ex)) return false;
    }

    // 5. Strict Accord Exclusions (e.g. sweet, vanilla, gourmand)
    const accords = m.accords || [];
    for (const forbidden of (criteria.exclude_accords || [])) {
      const fClean = String(forbidden || '').toLowerCase().trim();
      if (fClean) {
        const matchAccord = accords.find(a => (a.name || '').toLowerCase().includes(fClean));
        if (matchAccord && Number(matchAccord.score) > 35) {
          return false;
        }
      }
    }

    // 5. Strict Note Exclusions (e.g. vanilla base if user said no sweet)
    if (criteria.exclude_notes && criteria.exclude_notes.length > 0) {
      const allNotes = [
        ...(m.top_notes || []),
        ...(m.middle_notes || []),
        ...(m.base_notes || [])
      ].map(n => String(n).toLowerCase());

      for (const fn of criteria.exclude_notes) {
        const fnClean = String(fn || '').toLowerCase().trim();
        if (fnClean && allNotes.some(n => n.includes(fnClean))) {
          return false;
        }
      }
    }

    // 6. Strict Bottle Budget
    if (criteria.intent !== 'decant_finder' && criteria.max_price && criteria.max_price < 50000) {
      const bottlePrice = Number(m.community_price);
      if (!bottlePrice || bottlePrice > criteria.max_price) {
        return false;
      }
    }

    // 7. Olfactory Clash Filter
    if (isClashingProfile(m, `${criteria.semantic_search_prompt || ''} ${lastUserMsg}`)) {
      return false;
    }

    return true;
  });

  // 3. Enrich safeMatches with rich review summaries and accords if missing
  const needsEnrichment = safeMatches.filter(m => !m.review_summary || !m.accords);
  if (needsEnrichment.length > 0) {
    try {
      const { data: richRows } = await supabase
        .from('fragrances')
        .select('id, accords, seasons, review_summary, top_notes, middle_notes, base_notes')
        .in('id', needsEnrichment.map(m => m.id));

      if (richRows && richRows.length > 0) {
        const richMap = new Map();
        richRows.forEach(r => richMap.set(r.id, r));
        safeMatches.forEach(m => {
          const r = richMap.get(m.id);
          if (r) {
            m.accords = m.accords || r.accords;
            m.seasons = m.seasons || r.seasons;
            m.review_summary = m.review_summary || r.review_summary;
            m.top_notes = m.top_notes || r.top_notes;
            m.middle_notes = m.middle_notes || r.middle_notes;
            m.base_notes = m.base_notes || r.base_notes;
          }
        });
      }
    } catch (err) {
      console.warn('[Khushboo Enrichment] Enrichment fallback:', err.message);
    }
  }

  // 4. Multi-Factor Olfactory & Semantic Review Algorithm Scoring (Gemini gemini-embedding-001)
  const queryContext = {
    raw_prompt: criteria.semantic_search_prompt || lastUserMsg,
    taste_summary: criteria.taste_summary,
    target_notes: [
      ...(criteria.target_notes || []),
      ...(criteria.target_top_notes || []),
      ...(criteria.target_middle_notes || []),
      ...(criteria.target_base_notes || [])
    ],
    target_accords: criteria.target_accords || [],
    target_season: criteria.target_season || 'summer'
  };

  try {
    const vectorEvaluations = await evaluateOlfactoryMatchWithVectors(safeMatches, queryContext, {
      semantic: 0.35,
      notes: 0.30,
      season: 0.20,
      accord: 0.15
    });

    safeMatches.forEach((m, idx) => {
      const analysis = vectorEvaluations[idx];
      if (analysis) {
        m.match_score = analysis.finalMatchPercentage;
        m.season_match = analysis.season;
        m.notes_match = analysis.notes;
        m.semantic_match = analysis.semantic;
      }
    });
  } catch (err) {
    console.warn('[Concierge Scoring] Vector evaluation fallback:', err.message);
    safeMatches.forEach(m => {
      const analysis = evaluateOlfactoryMatch(m, queryContext);
      m.match_score = analysis.finalMatchPercentage;
      m.season_match = analysis.season;
      m.notes_match = analysis.notes;
      m.semantic_match = analysis.semantic;
    });
  }

  // 5. Agentic Sommelier Selection & Curated Whys
  const matchesWithWhys = await curateMatchesWithGemini(chatHistory, safeMatches, criteria, deltaInfo, allDislikes, perfumesDossier);

  const assistantResponse = {
    role: 'assistant',
    content: criteria.conversational_reply,
    tasteSummary: criteria.taste_summary,
    taste_summary: criteria.taste_summary,
    criteria,
    matches: matchesWithWhys,
    suggestions: criteria.suggestions || [],
    intent: criteria.intent
  };

  // Persist assistant message in background
  persistChatMessage(currentSessionId, assistantResponse);

  return assistantResponse;
}

// Backward compatibility alias
export async function getConciergeRecommendations(prompt) {
  const result = await sendChatMessageToKhushboo([{ role: 'user', content: prompt }]);
  return {
    diagnosis: result.tasteSummary,
    criteria: result.criteria,
    matches: result.matches
  };
}