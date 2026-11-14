import { supabase } from '../lib/supabaseTelemetry.js';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

/**
 * Deterministically extract all hated / disliked perfumes from chat history
 */
function extractDeterministicDislikes(chatHistory) {
  const dislikes = new Set();
  for (const m of (chatHistory || [])) {
    if (m.role !== 'user') continue;
    const text = (m.content || '').toLowerCase();

    // 1. "hate / hated / dislike X and Y"
    const hateMatches = text.matchAll(/(?:hate|hated|dislike|disliked|avoid|done with)\s+([a-z0-9\s,]+?)(?:,|\.|\bbut\b|$)/gi);
    for (const match of hateMatches) {
      const raw = match[1].trim();
      const parts = raw.split(/\band\b|,/);
      for (const p of parts) {
        const term = p.trim();
        if (term && term !== 'it' && term !== 'them' && term !== 'that' && term.length > 2) {
          dislikes.add(term);
        }
      }
    }

    // 2. "tried / wore / bought X ... hated it"
    const triedMatches = text.matchAll(/(?:tried|wore|bought|tested)\s+([a-z0-9\s]{3,35}?)(?:,|\.|\s+based on|\s+and\s+|\s+but\s+).*?(?:hated|disliked|didn't like)/gi);
    for (const match of triedMatches) {
      const term = match[1].trim();
      if (term && term !== 'it' && term !== 'them') {
        dislikes.add(term);
      }
    }
  }
  return Array.from(dislikes);
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

Your task:
1. CLASSIFY THE USER'S INTENT into ONE of these query modes:
   - "brand_catalog": The user asks to list, explore, or see perfumes from a specific brand (e.g. "give me all ajmal perfumes", "show me lattafa perfumes", "what do you have from afnan?", "skinn by titan fragrances").
   - "direct_search": The user asks about a specific fragrance title or famous clone/line (e.g. "do you have hawas?", "show me khamrah", "kuro", "liquid brun", "aventus clones").
   - "decant_finder": The user specifically asks for decants, samplers, discovery vials, or budget decants (e.g. "show me cheap decants under 250", "summer decants").
   - "seller_stock": The user asks what a specific verified community seller has in stock (e.g. "what does Second Theory have?", "show Talib's stock", "darsh fragrances").
   - "deals_and_top_rated": The user asks for best rated, biggest compliments, or price drops under a budget (e.g. "best winter perfumes under 2000", "top rated beast mode scents").
   - "olfactory_match": The user describes scent preferences, notes they love or hate (opening blast vs heart vs drydown), or asks for alternatives/inspirations (e.g. "i like raw, want citrus opening with woody drydown, no bdc clones").
   - "general_qa": The user asks a pure knowledge question (e.g. "what is ambroxan?", "what does maceration mean?", "how long does Kaaf last?", "what is the difference between EDT and EDP?") where NO product cards are needed.

2. EXTRACT PARAMETERS:
   - brand_filter: Extract brand name if brand_catalog (e.g. "Ajmal", "Lattafa", "Titan Skinn", "Afnan", "Rasasi", "Armaf").
   - search_term: Extract search string if direct_search (e.g. "Hawas", "Khamrah", "Kuro", "Aventus").
   - seller_filter: Extract seller name if seller_stock.
   - max_price: Realistic budget limit if stated (default 15000). CRITICAL RULE: When user says "under 2500" or similar budget without explicitly asking for decants/samples, they ALWAYS mean retail/tester full bottles. Never count decant prices towards a bottle budget! Only use decant prices if intent is decant_finder.
   - target_top_notes: Opening fresh blast notes (e.g. Watermelon, Bergamot, Lemon, Mint).
   - target_middle_notes: Heart transition notes (e.g. Jasmine, Geranium, Lavender).
   - target_base_notes: Drydown skin scent notes (e.g. Ambroxan, Sandalwood, Patchouli, Vanilla).
   - target_notes: General notes.
   - exclude_inspirations: Luxury archetypes user wants to avoid (e.g. ["%Bleu de Chanel%"]). NOTE: strip the word "clone", just use the bare perfume name!
   - exclude_terms: Disliked perfumes (e.g. ["%Rare Reef%"]).

3. CONVERSATIONAL REPLY:
   Write Khushboo's warm, knowledgeable, charming 1-3 sentence response acknowledging their specific query, notes, or brand heritage.

Return strictly raw JSON with this schema:
{
  "intent": "brand_catalog" | "direct_search" | "decant_finder" | "seller_stock" | "deals_and_top_rated" | "olfactory_match" | "general_qa",
  "brand_filter": "Brand name or null",
  "search_term": "Search title or null",
  "seller_filter": "Seller name or null",
  "conversational_reply": "Khushboo's warm personalized response",
  "taste_summary": "1-sentence summary capsule of current criteria",
  "target_inspirations": ["%LuxuryBrand Or Perfume%"],
  "exclude_inspirations": ["%ExcludedInspiration%"],
  "exclude_terms": ["%ExcludedPerfumeOrBrand%"],
  "target_accords": ["%AccordName%"],
  "target_top_notes": ["%NoteName%"],
  "target_middle_notes": ["%NoteName%"],
  "target_base_notes": ["%NoteName%"],
  "target_notes": ["%NoteName%"],
  "max_price": 5000,
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
          brand_filter: parsed.brand_filter || null,
          search_term: parsed.search_term || null,
          seller_filter: parsed.seller_filter || null,
          conversational_reply: parsed.conversational_reply || "Here is what I found across our verified catalog.",
          taste_summary: parsed.taste_summary || "Curated olfactory selections based on your conversation.",
          target_inspirations: safeTargets,
          exclude_inspirations: cleanExclusions,
          exclude_terms: wrap(parsed.exclude_terms),
          target_accords: wrap(parsed.target_accords),
          target_top_notes: wrap(parsed.target_top_notes),
          target_middle_notes: wrap(parsed.target_middle_notes),
          target_base_notes: wrap(parsed.target_base_notes),
          target_notes: wrap(parsed.target_notes),
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

  // 7. OLFACTORY NOTE PYRAMID MATCHING (DEFAULT)
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
 * --- "WHY THIS FITS YOU" SYNTHESIS ---
 */
async function synthesizeWhys(chatHistory, matches, criteria) {
  if (!matches || matches.length === 0) return [];

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';

  const prompt = `You are "Khushboo", a world-class fragrance sommelier.
The user asked: "${lastUserMsg}".
Query Intent: ${criteria.intent}
Top Notes Focus: ${JSON.stringify(criteria.target_top_notes || [])}
Base Notes Focus: ${JSON.stringify(criteria.target_base_notes || [])}
Brand Filter: ${criteria.brand_filter || 'None'}

Here are the selected perfumes:
${JSON.stringify(matches.map(m => ({
  id: m.id,
  brand: m.brand,
  name: m.name,
  inspiration: m.dna_inspiration,
  dna_type: m.dna_type,
  price: m.community_price ? `₹${m.community_price}` : (m.lowest_decant_price ? `Decant ₹${m.lowest_decant_price}` : 'Available'),
  seller: m.best_seller
})), null, 2)}

For EACH perfume, write a personalized, knowledgeable 1-2 sentence "Why this fits you" explanation.
Mention shared notes, brand reputation, or how it fulfills their request.
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
        why: whys[m.id] || generateFallbackWhy(m, criteria)
      }));
    }
  } catch (err) {
    console.warn('[Khushboo] synthesizeWhys error:', err.message);
  }

  return matches.map(m => ({
    ...m,
    why: generateFallbackWhy(m, criteria)
  }));
}

function generateFallbackWhy(m, criteria) {
  if (criteria?.intent === 'brand_catalog') {
    return `One of ${m.brand}'s standout creations in community stock with verified ${m.rating_value ? `★ ${m.rating_value}` : 'high'} rating.`;
  }
  if (m.dna_inspiration && !m.dna_inspiration.toLowerCase().includes('original creation')) {
    return `Captures the ${m.dna_type || 'harmonious'} olfactory structure inspired by ${m.dna_inspiration}. Verified community price at ₹${m.community_price || m.lowest_decant_price}.`;
  }
  return `Matches your requested notes profile with verified community performance via ${m.best_seller || 'verified sellers'}.`;
}

/**
 * --- MAIN ENTRYPOINT: SEND CHAT MESSAGE TO KHUSHBOO ---
 */
export async function sendChatMessageToKhushboo(chatHistory, sessionId) {
  const currentSessionId = sessionId || getOrCreateSessionId();
  const criteria = await analyzeConversationalIntent(chatHistory);

  // Execute multi-query based on intent
  const rawMatches = await executeMultiQuery(criteria);

  // Client-side strict filter to guarantee exclusions never slip through
  const deterministicDislikes = extractDeterministicDislikes(chatHistory);

  const safeMatches = (rawMatches || []).filter(m => {
    const insp = (m.dna_inspiration || '').toLowerCase();
    const name = (m.name || '').toLowerCase();

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
      if (isMatchDisliked(fullText, disliked)) {
        return false;
      }
    }

    // 2. Check LLM-extracted exclusions
    for (const ex of (criteria.exclude_inspirations || [])) {
      if (isMatchDisliked(fullText, ex)) return false;
    }
    for (const ex of (criteria.exclude_terms || [])) {
      if (isMatchDisliked(fullText, ex)) return false;
    }

    // 3. Strict Bottle Budget: when user specifies "under X" and did NOT explicitly ask for decants,
    // only count retail/tester bottles (community_price <= max_price), NEVER decant prices!
    if (criteria.intent !== 'decant_finder' && criteria.max_price && criteria.max_price < 50000) {
      const bottlePrice = Number(m.community_price);
      if (!bottlePrice || bottlePrice > criteria.max_price) {
        return false;
      }
    }

    return true;
  });

  const matchesWithWhys = await synthesizeWhys(chatHistory, safeMatches, criteria);

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