const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Auto-load .env if environment variables are not set in the shell
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
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Calculate realistic longevity in hours based on formula code [1, 2, 4, 8, 16] with weak-skew penalty
 */
function calculateLongevityFromNotes(concentration, accords, notes) {
  let baseScore = 5.2; // Moderate EDP anchor
  const conc = (concentration || '').toLowerCase();
  if (conc.includes('extrait') || conc.includes('elixir')) baseScore = 7.8;
  else if (conc.includes('parfum')) baseScore = 6.8;
  else if (conc.includes('edp') || conc.includes('eau de parfum')) baseScore = 5.6;
  else if (conc.includes('edt') || conc.includes('eau de toilette')) baseScore = 4.2;
  else if (conc.includes('cologne') || conc.includes('edc')) baseScore = 3.2;

  const accNames = (accords || []).map(a => (typeof a === 'string' ? a : a.name || '').toLowerCase());
  const heavyAccords = ['amber', 'oud', 'woody', 'leather', 'vanilla', 'tobacco', 'sweet', 'warm spicy'];
  const lightAccords = ['citrus', 'aquatic', 'fresh', 'green', 'floral', 'ozonic'];

  const heavyCount = accNames.filter(a => heavyAccords.some(h => a.includes(h))).length;
  const lightCount = accNames.filter(a => lightAccords.some(l => a.includes(l))).length;

  baseScore += (heavyCount * 0.45) - (lightCount * 0.25);
  baseScore = Math.max(2.5, Math.min(10.5, baseScore));
  const rounded = Math.round(baseScore * 10) / 10;

  let label;
  if (rounded < 3.5) label = 'Weak';
  else if (rounded < 5.8) label = 'Moderate';
  else if (rounded < 7.8) label = 'Long Lasting';
  else if (rounded < 9.5) label = 'Very Long Lasting';
  else label = 'Eternal';

  return `${rounded.toFixed(1)}h (${label})`;
}

function calculateSillage(longevityLabel) {
  if (!longevityLabel) return 'Moderate';
  if (longevityLabel.includes('Weak')) return 'Intimate';
  if (longevityLabel.includes('Moderate')) return 'Moderate';
  if (longevityLabel.includes('Long Lasting')) return 'Strong';
  if (longevityLabel.includes('Very Long Lasting') || longevityLabel.includes('Eternal') || longevityLabel.includes('Beast Mode')) return 'Enormous';
  return 'Moderate';
}

async function generateGeminiEmbedding(text) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!geminiKey || !text) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: text.slice(0, 1800) }] }
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.embedding?.values || null;
    }
  } catch (err) {
    console.warn('  [AI-Enrich] Warning generating embedding for new perfume:', err.message);
  }
  return null;
}

/**
 * Perform a web search to fetch Fragrantica listing snippets (fallback when needed)
 */
async function searchWeb(query) {
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;

  // 1. Google Custom Search JSON API
  if (googleApiKey && googleCx) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        const fragItem = items.find(i => i.link && i.link.includes('fragrantica.com/perfume/')) || items[0];
        const fragranticaUrl = (fragItem && fragItem.link && fragItem.link.includes('fragrantica.com/perfume/')) ? fragItem.link : '';
        const snippets = items.slice(0, 3).map(i => `${i.title || ''}\n${i.snippet || ''}`).filter(Boolean);
        return {
          text: snippets.join('\n'),
          url: fragranticaUrl
        };
      }
    } catch (gErr) {
      console.warn('  [Google Search] Request error:', gErr.message);
    }
  }

  // 2. DuckDuckGo HTML Fallback
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return { text: '', url: '' };
    const html = await res.text();
    
    const urls = [...html.matchAll(/uddg=([^&"]+)/g)]
      .map(m => decodeURIComponent(m[1]))
      .filter(u => u.includes('fragrantica.com/perfume/'));
    
    const fragranticaUrl = urls.length > 0 ? urls[0] : '';
    const snippets = [...html.matchAll(/class="result__snippet[^>]*>([\s\S]*?)<\/a>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);

    return {
      text: snippets.slice(0, 3).join('\n'),
      url: fragranticaUrl
    };
  } catch (err) {
    return { text: '', url: '' };
  }
}

/**
 * Parse canonical perfume name and brand from Fragrantica URL slug
 */
function parseFragranticaSlug(url) {
  if (!url) return null;
  const match = url.match(/\/perfume\/([^\/]+)\/([^\/]+?)(?:-\d+)?\.html/i);
  if (!match) return null;

  const brandRaw = decodeURIComponent(match[1]).replace(/[-_]+/g, ' ').replace(/\s+Perfumes$/i, '').trim();
  const nameRaw = decodeURIComponent(match[2]).replace(/-\d+$/, '').replace(/[-_]+/g, ' ').trim();

  let cleanName = nameRaw;
  const brandRegex = new RegExp(`^${brandRaw}\\s+`, 'i');
  cleanName = cleanName.replace(brandRegex, '').trim();

  return {
    brand: brandRaw,
    name: cleanName
  };
}

/**
 * Extract olfactory notes pyramid from text
 */
function extractNotes(text) {
  const notes = { top: [], middle: [], base: [] };
  const topMatch = text.match(/top\s+notes\s+(?:are\s+)?([^.;]+)/i);
  const midMatch = text.match(/(?:middle|heart)\s+notes\s+(?:are\s+)?([^.;]+)/i);
  const baseMatch = text.match(/base\s+notes\s+(?:are\s+)?([^.;]+)/i);

  function cleanNotesList(raw) {
    return raw
      .replace(/&#x27;/g, "'")
      .split(/,|and/)
      .map(s => s.trim().replace(/^and\s+/i, ''))
      .filter(s => s.length >= 2 && s.length <= 30 && !/notes|perfume/i.test(s));
  }

  if (topMatch) notes.top = cleanNotesList(topMatch[1]);
  if (midMatch) notes.middle = cleanNotesList(midMatch[1]);
  if (baseMatch) notes.base = cleanNotesList(baseMatch[1]);

  if (notes.top.length === 0) notes.top = ['Bergamot', 'Fresh Accords', 'Citrus'];
  if (notes.middle.length === 0) notes.middle = ['Aromatic Notes', 'Warm Spices'];
  if (notes.base.length === 0) notes.base = ['Cedarwood', 'Amber', 'Musk'];

  return notes;
}

/**
 * Extract accords from snippet text
 */
function extractAccords(text) {
  const ACCORD_PALETTE = [
    { name: 'Citrus', color: '#f59e0b' },
    { name: 'Aromatic', color: '#10b981' },
    { name: 'Woody', color: '#78350f' },
    { name: 'Warm Spicy', color: '#d97706' },
    { name: 'Fresh Spicy', color: '#06b6d4' },
    { name: 'Amber', color: '#b45309' },
    { name: 'Vanilla', color: '#fbbf24' },
    { name: 'Sweet', color: '#ec4899' },
    { name: 'Fruity', color: '#f43f5e' },
    { name: 'Powdery', color: '#c084fc' },
    { name: 'Musky', color: '#64748b' }
  ];

  const matched = [];
  const textLower = text.toLowerCase();
  ACCORD_PALETTE.forEach((item, idx) => {
    if (textLower.includes(item.name.toLowerCase())) {
      matched.push({
        name: item.name,
        score: Math.max(95 - idx * 8, 50),
        color: item.color
      });
    }
  });

  if (matched.length === 0) {
    matched.push(
      { name: 'Aromatic', score: 90, color: '#10b981' },
      { name: 'Woody', score: 80, color: '#78350f' },
      { name: 'Warm Spicy', score: 70, color: '#d97706' }
    );
  }
  return matched.slice(0, 5);
}

/**
 * Log enrichment report directly into Supabase table 'enriched_perfumes'
 */
async function recordEnrichmentReport(reportEntry) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('enriched_perfumes').upsert(reportEntry, { onConflict: 'id' });
    if (error) {
      if (!error.message.includes('schema cache')) {
        console.warn("  [Supabase] Note on logging to 'enriched_perfumes':", error.message);
      }
    } else {
      console.log(`  ✓ Logged enrichment report to Supabase table 'enriched_perfumes'!`);
    }
  } catch (err) {}
}

/**
 * Candidate-Context Evaluator (LLM-as-a-Judge)
 * Evaluates an uncataloged seller listing against existing catalog candidates for that brand.
 */
async function evaluateListingWithLLM(brandRaw, nameRaw, candidates = [], maxRetries = 3) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const candidateSummary = candidates.map(c => ({
      id: c.id,
      name: c.name,
      aliases: (c.aliases || []).slice(0, 6)
    }));

    const systemInstruction = `You are an expert perfume archivist, clone-house specialist, and catalog evaluator.
A community seller has listed a perfume: "${brandRaw} ${nameRaw}".

Here are the existing perfumes currently in our catalog for brand "${brandRaw}":
${JSON.stringify(candidateSummary, null, 2)}

Your task is to judge this listing using domain expertise and return a JSON object with this EXACT schema:
{
  "verdict": "MATCH_EXISTING" | "NEW_FLANKER" | "UNRESOLVED",
  "reason": "Brief 1-sentence explanation of your verdict",
  "matched_id": "Exact id from candidates if MATCH_EXISTING, else null",
  "learned_alias": "Clean lowercase string of this seller listing to permanently remember as an alias for that perfume if MATCH_EXISTING, else null",
  "new_fragrance": {
    "canonical_name": "Full official perfume name including distinct flanker/edition subtitle (e.g. 'Shuhrah Pour Homme Avenoir', 'Encre Noire À L\\'Extrême')",
    "brand": "Official brand name",
    "fragrantica_url": "Authentic Fragrantica URL if indexed, or null if too new",
    "notes": {
      "top": ["Top note 1", "Top note 2"],
      "middle": ["Mid note 1", "Mid note 2"],
      "base": ["Base note 1", "Base note 2"]
    },
    "accords": ["Accord 1", "Accord 2", "Accord 3"],
    "clone_inspiration": "Luxury perfume it clones/inspires (e.g. 'Creed Aventus', 'Nishane Hacivat', 'Xerjoff Naxos') or 'Original Creation'",
    "gender": "Men" | "Women" | "Unisex",
    "release_year": 2024,
    "rating_value": 4.3,
    "rating_count": 350,
    "primary_season": "Fall" | "Winter" | "Spring" | "Summer"
  }
}

Note: If verdict is not NEW_FLANKER, set "new_fragrance" to null. Return strictly raw JSON with NO markdown fences and NO code comments (//).

CRITICAL DOMAIN RULES:
1. MATCH_EXISTING:
   - Use MATCH_EXISTING if the seller listing refers to a perfume that is ALREADY IN THE CANDIDATE LIST, differing only by:
     - Community acronyms / abbreviations (e.g., 'SNOI' -> Supremacy Not Only Intense, 'CDNIM' -> Club de Nuit Intense Man, 'ADG' -> Acqua di Gio).
     - Production batch indicators (e.g., '2024 Batch', 'Vintage Batch', 'New Cap').
     - Concentration or packaging descriptors (e.g., 'EDP', 'Parfum', 'Tester', 'BNIB', '100ml', 'Spray').
     - Minor spelling mistakes or transliterations (e.g., 'Hawas Men' -> 'Hawas for Him').
   - In this case, specify 'matched_id' and 'learned_alias' (the clean seller name so future scrapes match instantly).

2. NEW_FLANKER:
   - Use NEW_FLANKER if the seller listing is a DISTINCT FLANKER, separate edition, or new perfume release from this brand that does NOT exist in the candidate list.
   - For example:
     - 'Rasasi Shuhrah Pour Homme Avenoir' is a distinct edition from 'Rasasi Shuhrah Pour Homme'. NEVER collapse it into the 2015 original!
     - 'Lalique Encre Noire À L'Extrême' is a distinct flanker from 'Encre Noire'. NEVER collapse it into 'Encre Noire'!
     - 'Armaf Club de Nuit Overdose' is a distinct release, not 'Club de Nuit Intense Man'.
     - 'Lattafa Khamrah Qahwa' is a distinct flanker from 'Lattafa Khamrah'.
   - When NEW_FLANKER is chosen, preserve the full canonical name and provide authentic notes, accords, clone inspiration, and gender.

3. UNRESOLVED:
   - Use UNRESOLVED if the listing is junk, empty bottles, non-fragrance accessories ('Gift Bag Only', 'Cap Only', 'Box Only'), or cannot be reliably identified as a legitimate perfume.
   - We must NEVER pollute the database with junk entries.`;

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3-flash-preview'];
    const payload = {
      contents: [{ parts: [{ text: systemInstruction }] }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    function safeParseJson(raw) {
      if (!raw) return null;
      let cleaned = raw.trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(cleaned);
      } catch (e1) {
        try {
          return (new Function('return (' + cleaned + ')'))();
        } catch (e2) {
          return null;
        }
      }
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const activeModel = candidateModels[attempt - 1] || candidateModels[0];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${key}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20000)
        });

        if (res.status === 429) {
          const waitSec = attempt * 3;
          console.warn(`  [AI-Judge] Rate limit (429) on model ${activeModel} for "${brandRaw} ${nameRaw}". Backing off ${waitSec}s (Attempt ${attempt}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, waitSec * 1000));
          continue;
        }

        if (!res.ok) {
          console.warn(`  [AI-Judge] Status ${res.status} from Gemini model ${activeModel} (Attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 1500));
            continue;
          }
          return null;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        const parsed = safeParseJson(text);
        return parsed;
      } catch (err) {
        console.warn(`  [AI-Judge] Attempt ${attempt} notice (${activeModel}):`, err.message);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }
    return null;
  } catch (err) {
    console.warn('  [AI-Judge] Gemini query notice:', err.message);
    return null;
  }
}

/**
 * Main enrichment and quote-attachment handler with LLM-as-a-Judge architecture
 */
async function enrichAndAddPerfume(brandRaw, nameRaw, price, size, sellerObj, candidates = []) {
  console.log(`\n🔍 [AI-Enrich] Uncataloged Listing Detected: "${brandRaw} ${nameRaw}" (₹${price}, ${size})`);

  // 1. FAST LOCAL RESOLUTION: Check 140,228 Fragrantica master database first!
  try {
    const { findInMaster, downloadAsBase64 } = require('./enrich_from_fragrantica_master.cjs');
    const cleanSearchName = nameRaw.replace(/\b(\d+ml|retail|bottle|tester|edp|edt|extrait|parfum|bnib|spray)\b/gi, '').replace(/\s+/g, ' ').trim();
    let masterMatch = findInMaster({ id: '', brand: brandRaw, name: nameRaw }) ||
                      findInMaster({ id: '', brand: brandRaw, name: cleanSearchName });

    if (!masterMatch) {
      const parts = cleanSearchName.split(/\s+/);
      if (parts.length > 2) {
        const subName = parts[0] + ' ' + parts[parts.length - 1];
        masterMatch = findInMaster({ id: '', brand: brandRaw, name: subName });
      }
    }

    if (masterMatch) {
      console.log(`   ✓ Instant Master Match found in 140k Fragrantica DB: [${masterMatch.brand} - ${masterMatch.name}] (ID: ${masterMatch.id})`);
      const canonicalBrand = masterMatch.brand;
      const canonicalName = masterMatch.name;
      const canonicalId = (canonicalBrand + ' ' + canonicalName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      if (supabase) {
        const { data: existingFrag } = await supabase
          .from('fragrances')
          .select('*')
          .eq('id', canonicalId)
          .maybeSingle();

        const vol = parseInt(size, 10) || 100;
        const isTester = /tester/i.test(size || '') || /tester/i.test(nameRaw);
        const pkgType = isTester ? 'Tester' : 'Retail Bottle';
        const label = size || (isTester ? `${vol}ml Tester` : `${vol}ml Retail Bottle`);
        const todayDate = new Date().toISOString().split('T')[0];
        const nowIso = new Date().toISOString();

        if (existingFrag) {
          console.log(`   ✓ Matched to existing canonical perfume: [${canonicalId}]. Attaching quote and learning alias.`);
          const existingAliases = Array.isArray(existingFrag.aliases) ? existingFrag.aliases : [];
          const rawClean = nameRaw.toLowerCase().trim();
          if (!existingAliases.includes(rawClean)) existingAliases.push(rawClean);

          const sellers = Array.isArray(existingFrag.community_sellers) ? existingFrag.community_sellers : [];
          const existingSellerIdx = sellers.findIndex(s => s.seller_id === sellerObj.id && s.size === label);
          if (existingSellerIdx >= 0) {
            sellers[existingSellerIdx].price = price;
          } else {
            sellers.push({
              seller_id: sellerObj.id,
              seller_name: sellerObj.seller_name,
              price,
              size: label,
              volume_ml: vol,
              whatsapp: sellerObj.whatsapp,
              shipping: sellerObj.shipping,
              dispatch: sellerObj.dispatch,
              is_tester: isTester,
              packaging_type: pkgType,
              verified: true
            });
          }
          sellers.sort((a,b) => a.price - b.price);
          const lowest = sellers[0]?.price || price;

          await supabase.from('fragrances').update({
            aliases: existingAliases,
            community_sellers: sellers,
            in_seller_stock: true,
            community_price: lowest,
            best_bottle_seller: sellers[0]?.seller_name || sellerObj.seller_name,
            price_updated_at: nowIso
          }).eq('id', canonicalId);

          return existingFrag;
        } else {
          console.log(`   ✨ Creating NEW Canonical Entry from Master DB: "${canonicalBrand} - ${canonicalName}" [${canonicalId}]`);
          const imgThumbnail = `https://fimgs.net/mdimg/perfume/m.${masterMatch.id}.jpg`;
          const imgLarge = `https://fimgs.net/mdimg/perfume/375x500.${masterMatch.id}.jpg`;
          const base64Data = await downloadAsBase64(imgThumbnail);

          let top = [], middle = [], base = [], accords = [];
          try { top = JSON.parse(masterMatch.top_notes || '[]'); } catch (e) {}
          try { middle = JSON.parse(masterMatch.middle_notes || '[]'); } catch (e) {}
          try { base = JSON.parse(masterMatch.base_notes || '[]'); } catch (e) {}
          try {
            const accRaw = JSON.parse(masterMatch.accords || '[]');
            accords = accRaw.slice(0, 5).map((a, i) => ({
              name: a.charAt(0).toUpperCase() + a.slice(1),
              score: 95 - (i * 12),
              color: '#10b981'
            }));
          } catch (e) {}

          const newPerfume = {
            id: canonicalId,
            name: canonicalName,
            brand: canonicalBrand,
            collection: `${canonicalBrand} Collection`,
            concentration: 'Eau de Parfum',
            rating_value: Math.round((masterMatch.rating || 4.2) * 100) / 100,
            rating_count: masterMatch.votes || 500,
            release_year: masterMatch.year || new Date().getFullYear(),
            gender: masterMatch.gender === 'female' ? 'Women' : (masterMatch.gender === 'male' ? 'Men' : 'Unisex'),
            dna_type: 'Original Creation',
            dna_inspiration: 'Original Creation',
            description: `${canonicalBrand} ${canonicalName} is an authentic release cataloged on Fragrantica.`,
            top_notes: top,
            middle_notes: middle,
            base_notes: base,
            accords: accords,
            notes: {
              top,
              middle,
              base,
              fragrantica_id: masterMatch.id,
              fragrantica_url: `https://www.fragrantica.com/perfume/${masterMatch.slug}-${masterMatch.id}.html`,
              image_data: base64Data,
              image_url: imgThumbnail,
              image_large: imgLarge,
              needs_image_refresh: false,
              image_status: 'enriched'
            },
            aliases: [nameRaw.toLowerCase().trim(), canonicalName.toLowerCase().trim(), `${canonicalBrand.toLowerCase()} ${canonicalName.toLowerCase()}`],
            in_seller_stock: true,
            community_price: price,
            best_bottle_seller: sellerObj.seller_name,
            price_updated_at: nowIso,
            discovered_at: nowIso,
            is_new_arrival: true,
            new_arrival_date: todayDate,
            community_sellers: [
              {
                seller_id: sellerObj.id,
                seller_name: sellerObj.seller_name,
                price,
                size: label,
                volume_ml: vol,
                whatsapp: sellerObj.whatsapp,
                shipping: sellerObj.shipping,
                dispatch: sellerObj.dispatch,
                is_tester: isTester,
                packaging_type: pkgType,
                verified: true
              }
            ],
            price_history: [
              {
                date: todayDate,
                price,
                size: label,
                seller: sellerObj.seller_name,
                seller_id: sellerObj.id
              }
            ]
          };

          await supabase.from('fragrances').upsert([newPerfume], { onConflict: 'id' });
          console.log(`   ✓ Saved new canonical perfume [${canonicalId}] to Supabase!`);
          return newPerfume;
        }
      }
    }
  } catch (mErr) {
    console.warn('  [Master DB Lookup Notice]:', mErr.message);
  }

  // 2. Fetch brand candidates if not passed in
  let brandCandidates = candidates || [];
  if (brandCandidates.length === 0 && supabase) {
    try {
      const { data } = await supabase
        .from('fragrances')
        .select('id, name, brand, aliases, community_sellers, price_history, community_price')
        .ilike('brand', `%${brandRaw.trim()}%`);
      brandCandidates = data || [];
    } catch (e) {
      // fallback
    }
  }

  console.log(`   ↳ Evaluating against ${brandCandidates.length} existing catalog entries for "${brandRaw}" via LLM Judge...`);

  // 2. Candidate-Context Evaluation via Gemini
  const decision = await evaluateListingWithLLM(brandRaw, nameRaw, brandCandidates);

  if (decision) {
    console.log(`   ↳ Verdict: [${decision.verdict}] — ${decision.reason}`);

    // ==========================================
    // CASE 1: MATCH_EXISTING
    // ==========================================
    if (decision.verdict === 'MATCH_EXISTING' && decision.matched_id) {
      let matchedFrag = brandCandidates.find(c => c.id === decision.matched_id);

      if (!matchedFrag && supabase) {
        const { data } = await supabase
          .from('fragrances')
          .select('id, name, brand, aliases, community_sellers, price_history, community_price')
          .eq('id', decision.matched_id)
          .maybeSingle();
        matchedFrag = data;
      }

      if (matchedFrag) {
        console.log(`   ✓ Matched to existing perfume: [${matchedFrag.id}] (${matchedFrag.name})`);

        // A. Save learned alias to Supabase so future syncs match directly (with strict Safety Gate)
        const BANNED_GENERIC_ALIASES = new Set([
          'silver', 'gold', 'black', 'white', 'blue', 'blu', 'red', 'rouge', 'noir', 'noire',
          'pink', 'green', 'brown', 'amber', 'rose', 'vanilla', 'musk', 'leather', 'tobacco',
          'oud', 'oudh', 'iris', 'vetiver', 'patchouli', 'sandalwood',
          'edp', 'edt', 'edc', 'parfum', 'extrait', 'cologne', 'elixir', 'intense', 'extreme',
          'sport', 'aqua', 'tester', 'retail', 'spray', 'bottle', 'bnib', 'limited', 'edition',
          'collector', 'collectors', 'pure', 'fresh', 'dark', 'light', 'royal',
          'gold edition', 'silver edition', 'black edition', 'white edition', 'limited edition',
          'pure parfum', 'le', 'pp', 'me', 'se', 'ee', 'gt', 'bt', 'wt', 'pour homme', 'pour femme', 'homme', 'femme',
          'men', 'women', 'man', 'woman', 'for him', 'for her'
        ]);

        const rawTitle = nameRaw.toLowerCase().trim();
        const fullTitle = `${brandRaw} ${nameRaw}`.toLowerCase().trim();
        const llmAlias = (decision.learned_alias || '').toLowerCase().trim().replace(/^armf\b/i, 'armaf');

        const candidateAliases = [rawTitle, fullTitle, llmAlias].filter(Boolean);
        const curAliases = matchedFrag.aliases || [];
        const addedAliases = [];

        for (const candidate of candidateAliases) {
          const isSafe = candidate.length >= 3 &&
                         !/^\d+$/.test(candidate) &&
                         !BANNED_GENERIC_ALIASES.has(candidate) &&
                         !curAliases.includes(candidate) &&
                         !addedAliases.includes(candidate);
          if (isSafe) {
            addedAliases.push(candidate);
          }
        }

        if (addedAliases.length > 0) {
          const newAliases = [...curAliases, ...addedAliases];
          matchedFrag.aliases = newAliases;
          if (supabase) {
            await supabase.from('fragrances').update({ aliases: newAliases }).eq('id', matchedFrag.id);
            console.log(`   ✓ Saved safe learned aliases ${JSON.stringify(addedAliases)} to Supabase for [${matchedFrag.id}]`);
          }
        }

        // B. Attach seller quote to existing perfume
        const vol = parseInt(size, 10) || 100;
        const isTester = /tester/i.test(size || '') || /tester/i.test(nameRaw);
        const pkgType = isTester ? 'Tester' : 'Retail Bottle';
        const label = size || (isTester ? `${vol}ml Tester` : `${vol}ml Retail Bottle`);

        const quote = {
          seller_id: sellerObj.id,
          seller_name: sellerObj.seller_name,
          price,
          size: label,
          volume_ml: vol,
          whatsapp: sellerObj.whatsapp,
          shipping: sellerObj.shipping,
          dispatch: sellerObj.dispatch,
          is_tester: isTester,
          packaging_type: pkgType,
          verified: true
        };

        const sellers = matchedFrag.community_sellers || [];
        const existingIdx = sellers.findIndex(s => s.seller_id === quote.seller_id && s.size === quote.size);
        if (existingIdx >= 0) {
          if (price < sellers[existingIdx].price) {
            sellers[existingIdx] = quote;
          }
        } else {
          sellers.push(quote);
        }
        matchedFrag.community_sellers = sellers;

        // Update lowest price if applicable
        if (!matchedFrag.community_price || price < matchedFrag.community_price) {
          matchedFrag.community_price = price;
          matchedFrag.best_bottle_seller = sellerObj.seller_name;
        }

        // Update price history
        const todayDate = new Date().toISOString().split('T')[0];
        const history = matchedFrag.price_history || [];
        if (!history.some(h => h.seller_id === sellerObj.id && h.date === todayDate && h.size === label)) {
          history.push({
            date: todayDate,
            price,
            size: label,
            seller: sellerObj.seller_name,
            seller_id: sellerObj.id
          });
          matchedFrag.price_history = history;
        }

        if (supabase) {
          await supabase.from('fragrances').update({
            community_sellers: matchedFrag.community_sellers,
            community_price: matchedFrag.community_price,
            best_bottle_seller: matchedFrag.best_bottle_seller,
            price_history: matchedFrag.price_history,
            price_updated_at: new Date().toISOString(),
            in_seller_stock: true
          }).eq('id', matchedFrag.id);
          console.log(`   ✓ Successfully attached seller quote (₹${price}) to [${matchedFrag.id}] in Supabase!`);
        }

        return matchedFrag;
      }
    }

    // ==========================================
    // CASE 2: NEW_FLANKER
    // ==========================================
    if (decision.verdict === 'NEW_FLANKER' && decision.new_fragrance) {
      const nf = decision.new_fragrance;
      const brandClean = (nf.brand || brandRaw).trim();
      let canonicalName = (nf.canonical_name || nameRaw).trim();

      // Ensure brand prefix doesn't duplicate in name
      if (canonicalName.toLowerCase().startsWith(brandClean.toLowerCase() + ' ')) {
        canonicalName = canonicalName.slice(brandClean.length).trim();
      }

      const cleanId = (brandClean + ' ' + canonicalName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      console.log(`   ✨ Creating NEW Flanker Catalog Entry: "${brandClean} - ${canonicalName}" [${cleanId}]`);

      const vol = parseInt(size, 10) || 100;
      const isTester = /tester/i.test(size || '') || /tester/i.test(nameRaw);
      const pkgType = isTester ? 'Tester' : 'Retail Bottle';
      const label = size || (isTester ? `${vol}ml Tester` : `${vol}ml Retail Bottle`);
      const todayDate = new Date().toISOString().split('T')[0];
      const nowIso = new Date().toISOString();

      // Check if it already exists by cleanId
      if (supabase) {
        const { data: existingEntry } = await supabase
          .from('fragrances')
          .select('id, name, brand, aliases, community_sellers, community_price, in_seller_stock')
          .eq('id', cleanId)
          .maybeSingle();

        if (existingEntry) {
          console.log(`   ✓ New flanker already exists in Supabase as [${cleanId}]. Attaching quote.`);
          const existingAliases = Array.isArray(existingEntry.aliases) ? existingEntry.aliases : [];
          const rawClean = nameRaw.toLowerCase().trim();
          if (!existingAliases.includes(rawClean)) {
            existingAliases.push(rawClean);
          }
          const sellers = Array.isArray(existingEntry.community_sellers) ? existingEntry.community_sellers : [];
          sellers.push({
            seller_id: sellerObj.id,
            seller_name: sellerObj.seller_name,
            price,
            size: label,
            volume_ml: vol,
            whatsapp: sellerObj.whatsapp,
            shipping: sellerObj.shipping,
            dispatch: sellerObj.dispatch,
            is_tester: isTester,
            packaging_type: pkgType,
            verified: true
          });
          existingEntry.aliases = existingAliases;
          existingEntry.community_sellers = sellers;
          existingEntry.in_seller_stock = true;
          existingEntry.community_price = price;

          try {
            await supabase.from('fragrances').update({
              aliases: existingAliases,
              community_sellers: sellers,
              in_seller_stock: true,
              community_price: price
            }).eq('id', cleanId);
          } catch (upErr) {
            console.warn(`   Warning updating existing flanker in Supabase:`, upErr.message);
          }
          return existingEntry;
        }
      }

      const accordsList = (nf.accords || ['Aromatic', 'Woody']).slice(0, 5).map((a, idx) => ({
        name: a,
        score: Math.max(95 - idx * 8, 50),
        color: '#10b981'
      }));

      const aliasesList = [...new Set([
        nameRaw.toLowerCase().trim(),
        canonicalName.toLowerCase().trim(),
        `${brandClean.toLowerCase()} ${canonicalName.toLowerCase()}`
      ])].filter(a => a && a.length >= 2);

      const calcLongevity = calculateLongevityFromNotes(nf.concentration || 'Eau de Parfum', accordsList, nf.notes);
      const calcSillage = calculateSillage(calcLongevity);

      const embeddingText = `${brandClean} ${canonicalName}. An authentic release from ${brandClean}. Inspiration: ${nf.clone_inspiration || 'Original Creation'}. Accords: ${accordsList.map(a => a.name).join(', ')}`;
      const reviewEmbedding = await generateGeminiEmbedding(embeddingText);

      // Check authentic Fragrantica master database
      let masterMatch = null;
      let base64Image = null;
      try {
        const { findInMaster, downloadAsBase64 } = require('./enrich_from_fragrantica_master.cjs');
        masterMatch = findInMaster({ id: cleanId, brand: brandClean, name: canonicalName });
        if (masterMatch) {
          const imgUrl = `https://fimgs.net/mdimg/perfume/m.${masterMatch.id}.jpg`;
          base64Image = await downloadAsBase64(imgUrl);
        }
      } catch (mErr) {
        console.warn('  [Master Match Warning]:', mErr.message);
      }

      const idMatch = (nf.fragrantica_url || '').match(/-(\d+)\.html/);
      const fragId = masterMatch ? masterMatch.id : (idMatch ? parseInt(idMatch[1], 10) : null);
      const fragUrl = masterMatch ? `https://www.fragrantica.com/perfume/${masterMatch.slug}-${masterMatch.id}.html` : (nf.fragrantica_url || null);

      const notesObj = {
        top: nf.notes?.top || [],
        middle: nf.notes?.middle || [],
        base: nf.notes?.base || [],
        ...(fragId ? {
          image_data: base64Image, // STORED DIRECTLY IN DB!
          image_url: `https://fimgs.net/mdimg/perfume/m.${fragId}.jpg`,
          image_large: `https://fimgs.net/mdimg/perfume/375x500.${fragId}.jpg`,
          fragrantica_id: fragId,
          fragrantica_url: fragUrl,
          needs_image_refresh: !base64Image,
          image_status: base64Image ? 'enriched' : 'to_be_refreshed_from_fragrantica'
        } : {
          needs_image_refresh: true,
          image_status: 'to_be_refreshed_from_fragrantica',
          fetch_target: 'fragrantica'
        })
      };

      const newPerfume = {
        id: cleanId,
        name: canonicalName,
        brand: brandClean,
        collection: 'Classic Collection',
        rating_value: nf.rating_value || 4.3,
        rating_count: nf.rating_count || 350,
        gender: nf.gender || 'Unisex',
        release_year: nf.release_year || new Date().getFullYear(),
        concentration: nf.concentration || 'Eau de Parfum',
        primary_season: nf.primary_season || 'Fall',
        dna_inspiration: nf.clone_inspiration || 'Original Creation',
        dna_type: (nf.accords || []).slice(0, 3).join(' ') || 'Aromatic',
        accords: accordsList,
        top_notes: nf.notes?.top || [],
        middle_notes: nf.notes?.middle || [],
        base_notes: nf.notes?.base || [],
        notes: notesObj,
        seasons: { winter: 25, fall: 25, spring: 25, summer: 25 },
        day_night: { day: 50, night: 50 },
        longevity: calcLongevity,
        sillage: calcSillage,
        review_summary: `A standout release from ${brandClean}.`,
        review_embedding: reviewEmbedding || null,
        flankers: [],
        dna_twins: [],
        aliases: aliasesList,
        in_seller_stock: true,
        community_price: price,
        best_bottle_seller: sellerObj.seller_name,
        price_updated_at: nowIso,
        discovered_at: nowIso,
        is_new_arrival: true,
        new_arrival_date: todayDate,
        price_history: [
          {
            date: todayDate,
            price,
            size: label,
            seller: sellerObj.seller_name,
            seller_id: sellerObj.id
          }
        ],
        community_sellers: [
          {
            seller_id: sellerObj.id,
            seller_name: sellerObj.seller_name,
            price,
            size: label,
            volume_ml: vol,
            whatsapp: sellerObj.whatsapp,
            shipping: sellerObj.shipping,
            dispatch: sellerObj.dispatch,
            is_tester: isTester,
            packaging_type: pkgType,
            verified: true
          }
        ]
      };

      if (supabase) {
        try {
          const { error: insertErr } = await supabase.from('fragrances').upsert([newPerfume], { onConflict: 'id' });
          if (insertErr) {
            console.warn(`  [AI-Enrich] Warning on saving new fragrance to Supabase:`, insertErr.message);
          } else {
            console.log(`  ✓ Successfully created and saved new fragrance [${newPerfume.id}] to Supabase! Aliases:`, newPerfume.aliases);
          }
        } catch (dbErr) {
          console.warn(`  [AI-Enrich] DB save error:`, dbErr.message);
        }
      }

      // Log to verification report
      const reportEntry = {
        id: cleanId,
        name: newPerfume.name,
        brand: newPerfume.brand,
        dna_inspiration: newPerfume.dna_inspiration,
        dna_type: newPerfume.dna_type,
        notes: newPerfume.notes,
        accords: newPerfume.accords,
        first_seller: sellerObj.seller_name,
        first_price: price,
        first_size: label,
        fragrantica_url: nf.fragrantica_url || '',
        fragrantica_evidence: `Verified via LLM Candidate-Context Evaluation (${decision.reason})`,
        enriched_date: todayDate,
        enriched_at: nowIso,
        verified_by_user: false
      };
      await recordEnrichmentReport(reportEntry);

      return newPerfume;
    }

    // ==========================================
    // CASE 3: UNRESOLVED
    // ==========================================
    if (decision.verdict === 'UNRESOLVED') {
      console.log(`   ⚠️ [AI-Judge] Listing "${brandRaw} ${nameRaw}" marked UNRESOLVED: ${decision.reason}. Skipping catalog creation to keep database clean.`);
      return null;
    }
  }

  // ==========================================
  // FALLBACK: When LLM is unavailable
  // ==========================================
  console.log(`   ↳ LLM Judge unavailable or inconclusive. Checking Fragrantica web search fallback...`);
  const cleanSearchName = nameRaw.replace(/\b(\d+ml|retail|bottle|tester|edp|edt|extrait|parfum|bnib|spray)\b/gi, '').replace(/\s+/g, ' ').trim();
  const fragResult = await searchWeb(`site:fragrantica.com ${brandRaw} ${cleanSearchName}`);
  if (!fragResult.url) {
    console.log(`   ⚠️ No authentic Fragrantica page found for "${brandRaw} ${nameRaw}". Skipping to prevent catalog pollution.`);
    return null;
  }

  const slugInfo = parseFragranticaSlug(fragResult.url);
  const brand = slugInfo?.brand || brandRaw.trim();
  const name = slugInfo?.name || nameRaw.trim();
  const cleanId = (brand + ' ' + name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  console.log(`   ↳ Found Fragrantica listing: ${fragResult.url} -> [${cleanId}]`);
  return null;
}

module.exports = {
  enrichAndAddPerfume,
  recordEnrichmentReport,
  evaluateListingWithLLM
};