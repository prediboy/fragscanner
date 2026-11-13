import { supabase } from '../lib/supabaseTelemetry.js';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

/**
 * 1. Multi-turn Conversational Olfactory Analyzer
 * Extracts cumulative preferences, exclusions, and strictly distinguishes Top, Middle, and Base notes.
 */
export async function analyzeConversationalIntent(chatHistory) {
  if (!GEMINI_KEY) {
    const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';
    return fallbackExtractIntent(lastUserMsg);
  }

  const systemInstruction = `You are "Khushboo", a world-class Indian fragrance sommelier and database query analyzer.
Analyze this ongoing conversation between a fragrance seeker and Khushboo:

${JSON.stringify(chatHistory, null, 2)}

Your task:
1. Extract cumulative user preferences, strictly preserving any exclusions or dislikes mentioned throughout the chat.
2. CRITICAL NOTE PYRAMID EXTRACTION:
   - Carefully identify which phase of a fragrance the user cares about:
     * TOP NOTES: Opening blast, initial spray, fresh burst (e.g. Watermelon, Bergamot, Lemon, Mandarin, Mint, Pink Pepper).
     * MIDDLE / HEART NOTES: Transition floral/spicy heart (e.g. Jasmine, Rose, Geranium, Lavender, Cardamom, Violet Leaf).
     * BASE NOTES: Drydown, skin scent, lingering sillage (e.g. Ambroxan, Sandalwood, Patchouli, Amber, Vanilla, Musk, Cedar, Oud).
   - If user names perfumes they love (e.g. "Titan Skinn Raw", "J'adore", "Celeste", "Bleu de Chanel", "Sauvage"), infer their authentic, ground-truth note pyramid and populate target_top_notes, target_middle_notes, and target_base_notes accordingly.
3. NEGATIONS & FATIGUE:
   - If user says they hate, dislike, want to avoid, or are "done with" certain perfumes, clones, or genres (e.g. "hate rare reef", "done with bleu de chanel clones"), place them into "exclude_inspirations" or "exclude_terms".
   - NEVER place excluded fragrances into target_inspirations!
4. Write Khushboo's warm, conversational response acknowledging their specific note preferences (e.g. opening vs drydown) and budget.

Return strictly raw JSON with this schema:
{
  "conversational_reply": "Khushboo's personalized 2-3 sentence conversational response explaining her curation strategy and noting the top/base notes she focused on.",
  "taste_summary": "1-sentence summary of the current cumulative profile (e.g. 'Crisp watermelon-citrus opening with a warm sandalwood drydown under ₹3,000, excluding BDC clones.')",
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
  "suggestions": ["Follow-up question or refinement 1", "Refinement 2", "Refinement 3"]
}

Rules:
- Wrap all SQL target/exclude terms with % for ILIKE (e.g. "%Watermelon%", "%Bergamot%", "%Patchouli%").
- Return raw JSON only, no markdown.`;

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
      if (text) {
        const parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, ''));
        const wrap = arr => (arr || []).map(item => (typeof item === 'string' && !item.startsWith('%')) ? `%${item}%` : item);
        
        // Clean exclusions: strip words like "clone", "clones", "direct inspiration" so SQL matches bare brand/fragrance names
        const rawExclusions = wrap(parsed.exclude_inspirations);
        const cleanExclusions = rawExclusions.map(ex =>
          ex.replace(/clones?|direct|inspirations?|inspired by/gi, '').replace(/%+/g, '%').trim()
        ).filter(Boolean);

        // Strip any excluded archetypes from positive target_inspirations
        const rawTargets = wrap(parsed.target_inspirations);
        const safeTargets = rawTargets.filter(tgt => {
          const tClean = tgt.replace(/%/g, '').toLowerCase().trim();
          return !cleanExclusions.some(ex => {
            const exClean = ex.replace(/%/g, '').toLowerCase().trim();
            return exClean && (tClean.includes(exClean) || exClean.includes(tClean));
          });
        });

        return {
          conversational_reply: parsed.conversational_reply || "Here are tailored selections honoring your exact fragrance notes and style.",
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
            "Under ₹2,000 only",
            "Show only full bottles",
            "More woody in the drydown",
            "Heavier citrus blast"
          ]
        };
      }
    }
  } catch (err) {
    console.warn('[Khushboo] Conversational intent error, using fallback:', err.message);
  }

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';
  return fallbackExtractIntent(lastUserMsg);
}

/**
 * Heuristic fallback with note-pyramid awareness
 */
function fallbackExtractIntent(prompt) {
  const p = (prompt || '').toLowerCase();
  const inspirations = [];
  const excludeInspirations = [];
  const excludeTerms = [];
  const accords = [];
  const topNotes = [];
  const middleNotes = [];
  const baseNotes = [];

  const hasBdcExclusion = /not.*(?:bleu|bdc)|done with.*(?:bleu|bdc)|hate.*(?:bleu|bdc)/i.test(p);
  const hasRareReefExclusion = /hate.*rare reef|not.*rare reef|avoid.*rare reef/i.test(p);

  if (hasBdcExclusion) {
    excludeInspirations.push('%Bleu de Chanel%');
  } else if (/bleu de chanel|bdc/i.test(p)) {
    inspirations.push('%Bleu de Chanel%');
  }

  if (hasRareReefExclusion) {
    excludeTerms.push('%Rare Reef%');
    excludeInspirations.push('%Rare Reef%');
  }

  if (/raw|skinn raw/i.test(p)) {
    accords.push('%Citrus%', '%Fresh Spicy%', '%Aquatic%');
    topNotes.push('%Watermelon%', '%Bergamot%', '%Mandarin%');
    middleNotes.push('%Geranium%', '%Violet Leaf%');
    baseNotes.push('%Patchouli%', '%Sandalwood%', '%Amber%');
  }

  if (/aventus/i.test(p)) {
    inspirations.push('%Aventus%');
    accords.push('%Fruity%', '%Smoky%');
    topNotes.push('%Pineapple%', '%Bergamot%');
    baseNotes.push('%Birch%', '%Oakmoss%');
  }

  if (/j'?adore|jadore/i.test(p)) {
    inspirations.push('%J\'adore%');
    accords.push('%White Floral%', '%Fruity%');
    topNotes.push('%Pear%', '%Melon%', '%Peach%');
    middleNotes.push('%Jasmine%', '%Lily of the Valley%');
    baseNotes.push('%Musk%', '%Vanilla%');
  }

  if (/celeste/i.test(p)) {
    inspirations.push('%Celeste%');
    accords.push('%White Floral%', '%Fruity%');
    topNotes.push('%Peach%', '%Blood Orange%');
    middleNotes.push('%Jasmine%', '%Water Lily%');
    baseNotes.push('%Sandalwood%', '%Patchouli%');
  }

  if (/citrus|citrusy/i.test(p)) {
    accords.push('%Citrus%');
    topNotes.push('%Bergamot%', '%Grapefruit%', '%Lemon%');
  }

  if (/vanilla|sweet/i.test(p)) {
    accords.push('%Vanilla%', '%Sweet%');
    baseNotes.push('%Vanilla%', '%Amber%');
  }

  const budgetMatch = p.match(/(?:under|below|budget|within|upto|up to|rs\.?|inr|₹)\s*(\d{3,5})/i);
  const maxPrice = budgetMatch ? parseInt(budgetMatch[1], 10) : 15000;

  const allNotes = [...topNotes, ...middleNotes, ...baseNotes];

  return {
    conversational_reply: `I've analyzed your notes preferences and curated recommendations respecting your opening, heart, and drydown preferences.`,
    taste_summary: `Identified profile based on: "${prompt.slice(0, 50)}..."`,
    target_inspirations: inspirations,
    exclude_inspirations: excludeInspirations,
    exclude_terms: excludeTerms,
    target_accords: accords,
    target_top_notes: topNotes,
    target_middle_notes: middleNotes,
    target_base_notes: baseNotes,
    target_notes: allNotes,
    max_price: maxPrice,
    min_rating: 3.8,
    suggestions: [
      "Show options under ₹2,000",
      "More citrus opening",
      "Heavier drydown",
      "Full bottles only"
    ]
  };
}

/**
 * 2. Generate personalized "Why this fits you" sommelier reasoning
 * Explicitly breaks down Top opening vs Heart vs Base drydown harmony.
 */
async function synthesizeWhys(chatHistory, matches, criteria) {
  if (!matches || matches.length === 0) return [];
  if (!GEMINI_KEY) {
    return matches.map(m => ({ ...m, why: generateFallbackWhy(m) }));
  }

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user')?.content || '';

  const prompt = `You are "Khushboo", a world-class fragrance sommelier and scent curator.
The user asked: "${lastUserMsg}".
User's Note Focus:
- Top Notes (Opening): ${JSON.stringify(criteria.target_top_notes || [])}
- Middle Notes (Heart): ${JSON.stringify(criteria.target_middle_notes || [])}
- Base Notes (Drydown): ${JSON.stringify(criteria.target_base_notes || [])}
- Exclusions: ${JSON.stringify(criteria.exclude_inspirations || [])}

Here are the selected perfumes from our verified database:
${JSON.stringify(matches.map(m => ({
  id: m.id,
  brand: m.brand,
  name: m.name,
  inspiration: m.dna_inspiration,
  dna_type: m.dna_type,
  price: m.community_price ? `₹${m.community_price}` : (m.lowest_decant_price ? `Decant from ₹${m.lowest_decant_price}` : 'Available'),
  seller: m.best_seller
})), null, 2)}

For EACH perfume, write a deeply personalized, knowledgeable 1-2 sentence "Why this fits you" explanation.
Mention specifically how its notes align (e.g. "Shares the crisp watermelon/bergamot opening blast you love...", "Delivers that woody-patchouli drydown without the BDC clone baggage...").
Return strictly raw JSON:
{
  "whys": {
    "perfume_id": "Exact 1-2 sentence reason"
  }
}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, ''));
        const whys = parsed.whys || {};
        return matches.map(m => ({
          ...m,
          why: whys[m.id] || generateFallbackWhy(m)
        }));
      }
    }
  } catch (err) {
    console.warn('[Khushboo] synthesizeWhys error, using fallback:', err.message);
  }

  return matches.map(m => ({
    ...m,
    why: generateFallbackWhy(m)
  }));
}

function generateFallbackWhy(m) {
  if (m.dna_inspiration && !m.dna_inspiration.toLowerCase().includes('original creation')) {
    return `Captures the ${m.dna_type || 'harmonious'} olfactory structure inspired by ${m.dna_inspiration}. Verified community price at ₹${m.community_price || m.lowest_decant_price}.`;
  }
  return `Matches your requested notes profile across the top and base phases with verified ${m.rating_value ? `★ ${m.rating_value}` : 'community'} rating.`;
}

/**
 * 3. End-to-end Chat Turn with Khushboo
 * Maintains ongoing conversation, queries Supabase, applies negative filters, and synthesizes results.
 */
export async function sendChatMessageToKhushboo(chatHistory) {
  const criteria = await analyzeConversationalIntent(chatHistory);

  let rawMatches = [];

  // Attempt RPC query with full note pyramid support
  try {
    const allNotes = [
      ...(criteria.target_top_notes || []),
      ...(criteria.target_middle_notes || []),
      ...(criteria.target_base_notes || []),
      ...(criteria.target_notes || [])
    ];

    const { data, error } = await supabase.rpc('match_fragrance_concierge', {
      target_inspirations: criteria.target_inspirations || [],
      target_accords: criteria.target_accords || [],
      target_notes: allNotes,
      max_price: criteria.max_price || 15000,
      min_rating: criteria.min_rating || 3.8,
      exclude_inspirations: criteria.exclude_inspirations || [],
      exclude_names: criteria.exclude_terms || []
    });

    if (error) {
      // Fallback to 5-param signature if needed
      const fallbackRpc = await supabase.rpc('match_fragrance_concierge', {
        target_inspirations: criteria.target_inspirations || [],
        target_accords: criteria.target_accords || [],
        target_notes: allNotes,
        max_price: criteria.max_price || 15000,
        min_rating: criteria.min_rating || 3.8
      });
      if (fallbackRpc.error) throw fallbackRpc.error;
      rawMatches = fallbackRpc.data || [];
    } else {
      rawMatches = data || [];
    }
  } catch (err) {
    console.error('[Khushboo] Supabase RPC error:', err);
    throw err;
  }

  // Double-layer defense: Client-side strict filter to guarantee zero excluded items leak through
  const safeMatches = (rawMatches || []).filter(m => {
    const insp = (m.dna_inspiration || '').toLowerCase();
    const name = (m.name || '').toLowerCase();

    for (const ex of (criteria.exclude_inspirations || [])) {
      const clean = ex.replace(/%/g, '').toLowerCase().trim();
      if (clean && insp.includes(clean)) return false;
    }
    for (const ex of (criteria.exclude_terms || [])) {
      const clean = ex.replace(/%/g, '').toLowerCase().trim();
      if (clean && (name.includes(clean) || insp.includes(clean))) return false;
    }
    return true;
  });

  const matchesWithWhys = await synthesizeWhys(chatHistory, safeMatches, criteria);

  return {
    reply: criteria.conversational_reply,
    tasteSummary: criteria.taste_summary,
    criteria,
    matches: matchesWithWhys,
    suggestions: criteria.suggestions || []
  };
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