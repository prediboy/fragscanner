import { supabase } from '../lib/supabaseTelemetry.js';
import { evaluateOlfactoryMatch, evaluateOlfactoryMatchWithVectors, calculateSeasonalProfile } from '../utils/olfactoryAlgorithm.js';
import { searchFragrancesBySemanticEmbedding } from './semanticEmbeddingService.js';

const GEMINI_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof process !== 'undefined' && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) || '';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

/**
 * Deterministically extract all hated / disliked perfumes from chat history
 */
function extractDeterministicDislikes(chatHistory) {
  const dislikes = new Set();
  for (const m of (chatHistory || [])) {
    if (m.role !== 'user') continue;
    const rawContent = (m.content || '').toLowerCase();
    const text = rawContent.replace(/\b(?:absolutely|completely|totally|really|truly|strongly)\s+/gi, '');

    // 1. "hate / hated / dislike X and Y"
    const hateMatches = text.matchAll(/(?:hate|hated|dislike|disliked|avoid|done with)\s+([a-z0-9\s,]+?)(?:,|\.|\bbut\b|$)/gi);
    for (const match of hateMatches) {
      const raw = match[1].trim();
      const parts = raw.split(/\band\b|,/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an)\s+/i, '');
        term = term.replace(/^(?:hate|hated|dislike|disliked|avoid|done with)\s+/i, '').trim();
        if (term && term !== 'it' && term !== 'them' && term !== 'that' && term.length > 2) {
          dislikes.add(term);
        }
      }
    }

    // 2. "tried / wore / bought X ... hated it"
    const triedMatches = text.matchAll(/(?:tried|wore|bought|tested)\s+([a-z0-9\s]{3,35}?)(?:,|\.|\s+based on|\s+and\s+|\s+but\s+).*?(?:hated|disliked|didn't like)/gi);
    for (const match of triedMatches) {
      let term = match[1].trim().replace(/^(?:the|a|an)\s+/i, '');
      term = term.replace(/^(?:hate|hated|dislike|disliked|avoid|done with)\s+/i, '').trim();
      if (term && term !== 'it' && term !== 'them') {
        dislikes.add(term);
      }
    }
  }
  return Array.from(dislikes);
}

/**
 * Deterministically extract all perfumes the user already owns or explicitly loves
 * so recommendation mode never echoes back bottles they already have.
 */
function extractDeterministicLiked(chatHistory) {
  const liked = new Set();
  const genericWords = new Set([
    'it', 'them', 'that', 'this', 'summer', 'winter', 'fragrance', 'fragrances',
    'perfume', 'perfumes', 'notes', 'scents', 'ones', 'one', 'summer fragrances',
    'minty and lavendery ones', 'minty', 'lavendery', 'fresh', 'fresh ones'
  ]);

  for (const m of (chatHistory || [])) {
    if (m.role !== 'user') continue;
    const text = (m.content || '').toLowerCase();

    const loveMatches = text.matchAll(/(?:love|loved|like|liked|own|have|wearing|favorite(?:\s+is)?)\s+([a-z0-9\s,]+?)(?:,|\.|\bbut\b|\band\b|$)/gi);
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
 * Universal Gemini Caller: Tries secure /api/concierge serverless route first,
 * then falls back to direct client call if GEMINI_KEY is present.
 */
async function callGemini(systemInstruction) {
  // 1. Serverless endpoint (/api/concierge)
  try {
    const res = await fetch('/api/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction }),
      signal: AbortSignal.timeout(9000)
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  } catch {}

  // 2. Direct client-side call
  if (GEMINI_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(9000)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('[Khushboo] Direct Gemini call error:', err);
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
export async function analyzeConversationalIntent(chatHistory) {
  const systemInstruction = `You are "Khushboo", a world-class Indian fragrance sommelier, conversational consultant, and database query router.
Analyze this ongoing conversation between a fragrance enthusiast and Khushboo:

${JSON.stringify(chatHistory, null, 2)}

CRITICAL CONVERSATIONAL REFINEMENT & MULTI-TURN STATE RULES:
1. MULTI-TURN CUMULATIVE STATE:
   - Unless the user explicitly says "start over" or "new search", EVERY user message is an INCREMENTAL REFINEMENT on top of the conversation so far!
   - ACCUMULATE PREFERENCES: If the user loved Raw/Verge (summer, fresh, mint, lavender) in Turn 1, and in Turn 2 asks to "remove sweet fragrances, and spicy mint is something that is good, only summer":
     * PRESERVE: Summer season, mint, lavender, crisp aromatic freshness.
     * REFINE/MODIFY: Add fresh-spicy facet to the mint.
     * APPLY NEGATION: Strictly strip out all sweet, gourmand, vanilla, tonka, and heavy fruit notes.
     * EXCLUDE: Exclude perfumes user loves/owns (Raw, Verge) and hates (Rare Reef, Zanzibar).
2. CLASSIFY THE USER'S INTENT into ONE of these query modes:
   - "brand_catalog": The user asks to list, explore, or see perfumes from a specific brand (e.g. "give me all ajmal perfumes", "show me lattafa perfumes", "what do you have from afnan?", "skinn by titan fragrances").
   - "direct_search": The user asks about a specific fragrance title or famous clone/line (e.g. "do you have hawas?", "show me khamrah", "kuro", "liquid brun", "aventus clones").
   - "decant_finder": The user specifically asks for decants, samplers, discovery vials, or budget decants (e.g. "show me cheap decants under 250", "summer decants").
   - "seller_stock": The user asks what a specific verified community seller has in stock (e.g. "what does Second Theory have?", "show Talib's stock", "darsh fragrances").
   - "deals_and_top_rated": The user asks for best rated, biggest compliments, or price drops under a budget (e.g. "best winter perfumes under 2000", "top rated beast mode scents").
   - "olfactory_match": The user describes scent preferences, notes they love or hate (opening blast vs heart vs drydown), or asks for alternatives/inspirations (e.g. "i like raw, want citrus opening with woody drydown, no bdc clones").
   - "general_qa": The user asks a pure knowledge question (e.g. "what is ambroxan?", "what does maceration mean?", "how long does Kaaf last?", "what is the difference between EDT and EDP?") where NO product cards are needed.

3. SEMANTIC SEARCH PROMPT:
   - Generate a rich, descriptive query for pgvector dense vector embedding search that captures the CUMULATIVE profile (e.g. "summer fresh spicy mint lavender crisp aromatic aquatic non-sweet cooling masculine daytime").

4. CONVERSATIONAL REPLY:
   - Write Khushboo's warm, knowledgeable, charming 1-3 sentence response directly acknowledging the user's refinement (e.g. how we stripped out all sweetness to focus purely on crisp spicy mint and lavender for summer).

Return strictly raw JSON with this schema:
{
  "intent": "brand_catalog" | "direct_search" | "decant_finder" | "seller_stock" | "deals_and_top_rated" | "olfactory_match" | "general_qa",
  "is_refinement": true | false,
  "brand_filter": "Brand name or null",
  "search_term": "Search title or null",
  "seller_filter": "Seller name or null",
  "contrast_liked": "Perfume title or null",
  "contrast_disliked": "Perfume title or null",
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

      return {
        intent: parsed.intent || 'olfactory_match',
        is_refinement: Boolean(parsed.is_refinement),
        brand_filter: parsed.brand_filter || null,
        search_term: parsed.search_term || null,
        seller_filter: parsed.seller_filter || null,
        contrast_liked: parsed.contrast_liked || null,
        contrast_disliked: parsed.contrast_disliked || null,
        is_discovery_mode: Boolean(parsed.is_discovery_mode),
        conversational_reply: parsed.conversational_reply || "Here is what I found across our verified catalog.",
        taste_summary: parsed.taste_summary || "Curated olfactory selections based on your conversation.",
        semantic_search_prompt: parsed.semantic_search_prompt || parsed.taste_summary || "",
        target_inspirations: safeTargets,
        exclude_inspirations: cleanExclusions,
        exclude_terms: wrap(parsed.exclude_terms),
        exclude_perfumes: unwrap(parsed.exclude_perfumes),
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
    console.warn('[Khushboo] Router error, using fallback:', err.message);
  }

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';
  return fallbackExtractIntent(lastUserMsg);
}

/**
 * Heuristic fallback router
 */
function fallbackExtractIntent(prompt) {
  const p = (prompt || '').toLowerCase();
  
  // Brand intent
  const brandMatch = p.match(/(?:all|show|give me|list)\s*(?:the\s*)?(ajmal|lattafa|afnan|rasasi|armaf|ahmed al maghribi|titan|skinn|paris corner|fragrance world|al haramain)/i);
  if (brandMatch) {
    const brand = brandMatch[1];
    return {
      intent: 'brand_catalog',
      brand_filter: brand,
      conversational_reply: `Here are the top-rated in-stock perfumes from ${brand} across verified community sellers.`,
      taste_summary: `Browsing ${brand} collection`,
      target_inspirations: [],
      exclude_inspirations: [],
      exclude_terms: [],
      target_accords: [],
      target_top_notes: [],
      target_middle_notes: [],
      target_base_notes: [],
      target_notes: [],
      max_price: 15000,
      min_rating: 3.8,
      suggestions: [`Under ₹2,500 from ${brand}`, `Best rated ${brand}`, `Decants of ${brand}`]
    };
  }

  // Decants intent
  if (/decant|sampler|vial/i.test(p)) {
    const budgetMatch = p.match(/(?:under|below|budget|within|upto|up to|rs\.?|inr|₹)\s*(\d{3,5})/i);
    const maxPrice = budgetMatch ? parseInt(budgetMatch[1], 10) : 500;
    return {
      intent: 'decant_finder',
      brand_filter: null,
      conversational_reply: `Here are verified community decants available under ₹${maxPrice}.`,
      taste_summary: `Decants under ₹${maxPrice}`,
      target_inspirations: [],
      exclude_inspirations: [],
      exclude_terms: [],
      target_accords: [],
      target_top_notes: [],
      target_middle_notes: [],
      target_base_notes: [],
      target_notes: [],
      max_price: maxPrice,
      min_rating: 3.8,
      suggestions: ["Under ₹200 only", "Summer fresh decants", "Full bottle alternatives"]
    };
  }

  // Fallback to olfactory matching
  const inspirations = [];
  const excludeInspirations = [];
  const topNotes = [];
  const middleNotes = [];
  const baseNotes = [];

  const deterministicDislikes = extractDeterministicDislikes([{ role: 'user', content: prompt }]);

  if (/raw/i.test(p)) {
    topNotes.push('%Watermelon%', '%Bergamot%');
    baseNotes.push('%Patchouli%', '%Sandalwood%');
  }
  if (/not.*(?:bleu|bdc)|done with.*(?:bleu|bdc)/i.test(p)) {
    excludeInspirations.push('%Bleu de Chanel%');
  }
  if (/summer/i.test(p)) {
    topNotes.push('%Bergamot%', '%Lemon%', '%Sea Notes%');
  }

  const reply = deterministicDislikes.length > 0
    ? `Understood! I'm completely steering clear of ${deterministicDislikes.join(', ')} and focusing on refreshing alternatives for you.`
    : "I've analyzed your notes and preferences and curated selections honoring your opening and drydown tastes.";

  return {
    intent: 'olfactory_match',
    brand_filter: null,
    conversational_reply: reply,
    taste_summary: `Profile based on: "${prompt.slice(0, 45)}..."`,
    target_inspirations: inspirations,
    exclude_inspirations: excludeInspirations,
    exclude_terms: deterministicDislikes.map(d => `%${d}%`),
    target_accords: ['%Citrus%', '%Fresh%', '%Aquatic%'],
    target_top_notes: topNotes,
    target_middle_notes: middleNotes,
    target_base_notes: baseNotes,
    target_notes: [...topNotes, ...baseNotes],
    max_price: 15000,
    min_rating: 3.8,
    suggestions: ["Under ₹2,000 only", "Heavier woody drydown", "Only full bottles"]
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
async function synthesizeWhys(chatHistory, matches, criteria, deltaInfo) {
  if (!matches || matches.length === 0) return [];

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';

  const prompt = `You are "Khushboo", a world-class Indian fragrance sommelier, educator, and scent discovery consultant.
The user is having a continuous dialogue with you:
User's last message: "${lastUserMsg}"
Query Intent: ${criteria.intent}
${deltaInfo ? `\nOLFACTORY CONTRAST INSIGHT:\n${deltaInfo.summary}\nPrized notes in liked scent: ${JSON.stringify(deltaInfo.prizedAccords.map(a => a.name))}\nOffending notes in disliked scent: ${JSON.stringify(deltaInfo.offendingAccords.map(a => a.name))}\nReviewer warning on disliked scent: "${deltaInfo.consB?.[0] || 'harsh opening'}"\n` : ''}

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
async function curateMatchesWithGemini(chatHistory, candidates, criteria, deltaInfo) {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];

  // Sort by algorithmic score to present the most promising 20 candidates to Gemini
  candidates.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  const candidatePool = candidates.slice(0, 20);

  if (candidatePool.length <= 10) {
    return await synthesizeWhys(chatHistory, candidatePool, criteria, deltaInfo);
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
${deltaInfo?.summary ? `\nOLFACTORY CONTRAST INSIGHT:\n${deltaInfo.summary}` : ''}

Here are ${candidateSummaries.length} available candidate perfumes in stock from verified community sellers:
${JSON.stringify(candidateSummaries, null, 2)}

TASK:
1. Review all candidates against the user's cumulative constraints.
2. Select and rank the TOP 10 best perfumes that strictly fulfill all user requirements (e.g. if user said "remove sweet", reject any sweet/vanilla/gourmand scent; if user wants spicy mint and lavender for summer, prioritize scents that hit those notes without sweetness).
3. For each selected perfume, write a passionate, connoisseur 1-2 sentence "why_this_fits" sommelier explanation explaining specifically how it captures the user's refined preferences.

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
                curated.push({
                  ...cand,
                  why: generateFallbackWhy(cand, criteria, deltaInfo)
                });
                addedIds.add(cand.id);
              }
            }
          }
          return curated.slice(0, 10);
        }
      }
    }
  } catch (err) {
    console.warn('[Khushboo] Agentic curation fallback:', err.message);
  }

  // Fallback to top 10 by algorithmic match score
  return await synthesizeWhys(chatHistory, candidatePool.slice(0, 10), criteria, deltaInfo);
}

/**
 * --- MAIN ENTRYPOINT: SEND CHAT MESSAGE TO KHUSHBOO ---
 */
export async function sendChatMessageToKhushboo(chatHistory, sessionId) {
  const currentSessionId = sessionId || getOrCreateSessionId();
  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';
  const criteria = await analyzeConversationalIntent(chatHistory);
  criteria.raw_prompt = lastUserMsg;

  // Client-side strict filter to guarantee exclusions never slip through
  const deterministicDislikes = extractDeterministicDislikes(chatHistory);
  const deterministicLiked = extractDeterministicLiked(chatHistory);

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

    // Helper to check fuzzy/tokenized match against disliked phrases
    const isMatchDisliked = (target, phrase) => {
      const p = (phrase || '').replace(/%/g, '').toLowerCase().trim();
      if (!p || p.length < 3) return false;
      if (target.includes(p)) return true;
      const words = p.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'perfume', 'perfumes'].includes(w));
      if (words.length > 1 && words.every(w => target.includes(w))) return true;
      return false;
    };

    // 1. Check deterministic dislikes extracted directly from chat dialogue
    for (const disliked of deterministicDislikes) {
      if (isMatchDisliked(fullText, disliked)) return false;
    }

    // 2. Already Loved/Owned Exclusion
    if (criteria.intent !== 'direct_search') {
      for (const likedName of deterministicLiked) {
        if (isMatchDisliked(fullText, likedName)) return false;
      }
    }

    // 3. LLM-extracted fragrance exclusions
    for (const ex of (criteria.exclude_perfumes || [])) {
      if (isMatchDisliked(fullText, ex)) return false;
    }
    for (const ex of (criteria.exclude_terms || [])) {
      if (isMatchDisliked(fullText, ex)) return false;
    }
    for (const ex of (criteria.exclude_inspirations || [])) {
      if (isMatchDisliked(fullText, ex)) return false;
    }

    // 4. Strict Accord Exclusions (e.g. sweet, vanilla, gourmand)
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
  const matchesWithWhys = await curateMatchesWithGemini(chatHistory, safeMatches, criteria, deltaInfo);

  const assistantResponse = {
    role: 'assistant',
    content: criteria.conversational_reply,
    tasteSummary: criteria.taste_summary,
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