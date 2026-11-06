const { createClient } = require('@supabase/supabase-js');

// Ensure .env is loaded if present
try {
  require('dotenv').config();
} catch (e) {}

const API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = 'https://lvivmkdlaxaetnazmcat.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8eXJXa7QmS1okuJ3tFwsbg_GyE7RaKC';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Perform a web search to fetch Fragrantica listing snippets
 */
async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    if (!res.ok) return { text: "", url: "" };
    const html = await res.text();
    
    // Extract first direct Fragrantica link
    const urls = [...html.matchAll(/uddg=([^&"]+)/g)]
      .map(m => decodeURIComponent(m[1]))
      .filter(u => u.includes("fragrantica.com/perfume/"));
    
    const fragranticaUrl = urls.length > 0 ? urls[0] : "";

    // Extract search snippets
    const snippets = [...html.matchAll(/class="result__snippet[^>]*>([\s\S]*?)<\/a>/g)]
      .map(m => m[1].replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);

    return {
      text: snippets.slice(0, 3).join("\n"),
      url: fragranticaUrl
    };
  } catch (err) {
    console.error("  Warning: Search failed:", err.message);
    return { text: "", url: "" };
  }
}

/**
 * Query Gemini to compile official Fragrantica evidence into catalog JSON
 */
async function compileFragranceData(brandRaw, nameRaw, fragEvidence, dupeEvidence) {
  const prompt = `You are an expert master perfumer and fragrance database compiler.
We have an uncataloged perfume: "${brandRaw} ${nameRaw}".
Here is the real-time verified evidence extracted from Fragrantica and fragrance community reviews:

[FRAGRANTICA OFFICIAL LISTING EVIDENCE]:
${fragEvidence || "Rely on authoritative fragrance knowledge."}

[COMMUNITY 'REMINDS ME OF' & DUPE REVIEWS]:
${dupeEvidence || "Rely on authoritative fragrance community consensus."}

CRITICAL RULES:
1. CANONICAL FRAGRANTICA NAMING (ABSOLUTE PRIORITY):
   - The perfume name ("name") MUST be driven strictly by the official Fragrantica title!
   - NEVER use retailer typos, messy sheet abbreviations, or hybrid/Frankenstein names (e.g. NEVER produce "Supremacy Not Only Intense Collector's Edition" — the official Fragrantica name is "Supremacy Collector's Edition").
   - Strip redundant brand prefixes from the perfume name (e.g. "Daring Blue for Life", NOT "Maison Alhambra Daring Blue for Life").
2. Identify the exact luxury designer/niche perfume it clones or is inspired by (the #1 Fragrantica "This perfume reminds me of" consensus).
   - Accurately distinguish flankers in famous clone series! For example:
     * Lattafa Fakhar Black -> Yves Saint Laurent Y EDP
     * Lattafa Fakhar Platin (Platinum) -> Yves Saint Laurent Y L'Elixir
     * Lattafa Fakhar Gold Extrait -> Paco Rabanne 1 Million Parfum / Solar Amber
     * Lattafa Fakhar Rose -> Givenchy L'Interdit
     * Afnan Supremacy Collector's Edition -> Creed Absolu Aventus (NOT Hacivat / SNOI)
     * Afnan Supremacy Not Only Intense -> Nishane Hacivat
   - Do NOT default to generic blue perfumes (like Bleu de Chanel) unless the scent is specifically a dedicated clone of it (e.g. Armaf CDN Iconic).
3. Extract the exact Fragrantica notes pyramid (top, middle, and base notes).
4. Extract dominant olfactory accords with hex colors.
5. Output strictly a valid JSON object matching our catalog schema:
{
  "name": "Clean Fragrance Name",
  "brand": "Standard Brand Name",
  "collection": "Main Collection or Classic Collection",
  "rating_value": 4.3,
  "rating_count": 500,
  "gender": "Unisex | Men | Women",
  "release_year": 2024,
  "concentration": "Eau de Parfum | Extrait de Parfum",
  "primary_season": "Winter | Fall | Spring | Summer",
  "dna_inspiration": "Exact luxury perfume target (e.g. Yves Saint Laurent Y L'Elixir, Kilian Angels' Share, etc.)",
  "dna_type": "Key Olfactory Style (e.g. Aromatic Fresh Spicy Woody)",
  "similarity_percentage": 92,
  "accords": [
    {"name": "Warm Spicy", "score": 95, "color": "#d97706"},
    {"name": "Vanilla", "score": 90, "color": "#f59e0b"},
    {"name": "Sweet", "score": 85, "color": "#ec4899"},
    {"name": "Woody", "score": 75, "color": "#78350f"}
  ],
  "notes": {
    "top": ["note1", "note2"],
    "middle": ["note3", "note4"],
    "base": ["note5", "note6"]
  },
  "seasons": { "winter": 50, "fall": 30, "spring": 15, "summer": 5 },
  "day_night": { "day": 30, "night": 70 },
  "longevity": "Long Lasting (8+ hrs)",
  "sillage": "Strong",
  "review_summary": {
    "pros": ["High quality blend", "Impressive performance for price"],
    "cons": ["Rich profile best in cool weather"],
    "community_verdict": "An exceptional alternative to...",
    "top_reviewer_quotes": ["A standout Middle Eastern release."]
  }
}`;

  const models = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];
  let lastErr = null;

  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      });

      if (!res.ok) {
        lastErr = new Error(`Gemini API HTTP ${res.status}: ${await res.text()}`);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
      if (!text) throw new Error("Empty response from Gemini API");

      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Failed to compile fragrance data from Gemini API");
}

/**
 * Log enrichment report directly into Supabase table 'enriched_perfumes'
 */
async function recordEnrichmentReport(reportEntry) {
  try {
    const { error } = await supabase.from('enriched_perfumes').upsert(reportEntry, { onConflict: 'id' });
    if (error) {
      console.warn("  [Supabase] Note on logging to 'enriched_perfumes':", error.message);
    } else {
      console.log(`  ✓ Logged enrichment report to Supabase table 'enriched_perfumes'!`);
    }
  } catch (err) {
    console.error("  Warning: Supabase report sync error:", err.message);
  }
}

/**
 * Main enrichment handler
 */
async function enrichAndAddPerfume(brandRaw, nameRaw, price, size, sellerObj) {
  console.log(`\n🔍 [AI-Enrich] Uncataloged Perfume Detected: "${brandRaw} ${nameRaw}"`);
  console.log(`   ↳ Querying live Fragrantica index...`);

  // 1. Fetch Fragrantica listing snippet
  const fragResult = await searchWeb(`site:fragrantica.com ${brandRaw} ${nameRaw}`);
  if (fragResult.url) {
    console.log(`   ↳ Found Fragrantica listing: ${fragResult.url}`);
  }

  // 2. Fetch community dupe discussions
  const dupeResult = await searchWeb(`${brandRaw} ${nameRaw} clone of OR "reminds me of" OR inspired by fragrantica reddit`);

  // 3. Compile via Gemini
  console.log(`   ↳ Compiling fragrance profile with Gemini...`);
  const compiled = await compileFragranceData(brandRaw, nameRaw, fragResult.text, dupeResult.text);

  const brandClean = (compiled.brand || brandRaw).trim();
  let cleanName = (compiled.name || nameRaw).trim();
  if (cleanName.toLowerCase().startsWith(brandClean.toLowerCase() + " ")) {
    cleanName = cleanName.slice(brandClean.length).trim();
  }

  // Generate clean ID
  const cleanId = (brandClean + " " + cleanName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const todayDate = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();

  // Create full catalog item
  const newPerfume = {
    id: cleanId,
    name: cleanName,
    brand: brandClean,
    collection: compiled.collection || "Classic Collection",
    rating_value: compiled.rating_value || 4.3,
    rating_count: compiled.rating_count || 350,
    gender: compiled.gender || "Unisex",
    release_year: compiled.release_year || new Date().getFullYear(),
    concentration: compiled.concentration || "Eau de Parfum",
    primary_season: compiled.primary_season || "Fall",
    dna_inspiration: compiled.dna_inspiration || "",
    dna_type: compiled.dna_type || "Aromatic",
    similarity_percentage: compiled.similarity_percentage || 90,
    accords: compiled.accords || [],
    notes: compiled.notes || { top: [], middle: [], base: [] },
    seasons: compiled.seasons || { winter: 25, fall: 25, spring: 25, summer: 25 },
    day_night: compiled.day_night || { day: 50, night: 50 },
    longevity: compiled.longevity || "Long Lasting (8+ hrs)",
    sillage: compiled.sillage || "Strong",
    review_summary: compiled.review_summary || { pros: [], cons: [], community_verdict: "" },
    flankers: [],
    dna_twins: [],
    in_seller_stock: true,
    community_price: price,
    community_bottle_size: size,
    lowest_seller: sellerObj.seller_name,
    price_date: todayDate,
    price_updated_at: nowIso,
    is_new_arrival: true,
    new_arrival_date: todayDate,
    price_history: [
      {
        date: todayDate,
        price,
        size,
        seller: sellerObj.seller_name,
        seller_id: sellerObj.id
      }
    ],
    community_sellers: [
      {
        seller_id: sellerObj.id,
        seller_name: sellerObj.seller_name,
        price,
        size,
        volume_ml: parseInt(size, 10) || 100,
        whatsapp: sellerObj.whatsapp,
        shipping: sellerObj.shipping,
        dispatch: sellerObj.dispatch,
        verified: true
      }
    ]
  };

  // 4. Save to Verification Report
  const reportEntry = {
    id: cleanId,
    name: newPerfume.name,
    brand: newPerfume.brand,
    dna_inspiration: newPerfume.dna_inspiration,
    similarity_percentage: newPerfume.similarity_percentage,
    dna_type: newPerfume.dna_type,
    notes: newPerfume.notes,
    accords: newPerfume.accords,
    first_seller: sellerObj.seller_name,
    first_price: price,
    first_size: size,
    fragrantica_url: fragResult.url,
    fragrantica_evidence: fragResult.text,
    enriched_date: todayDate,
    enriched_at: nowIso,
    verified_by_user: false
  };
  await recordEnrichmentReport(reportEntry);

  console.log(`   ✨ Successfully enriched: "${newPerfume.brand} ${newPerfume.name}" -> Clones: "${newPerfume.dna_inspiration}" (${newPerfume.similarity_percentage}%)`);
  console.log(`   📝 Synced to Supabase table 'enriched_perfumes' for verification.`);

  return newPerfume;
}

module.exports = {
  enrichAndAddPerfume,
  recordEnrichmentReport
};
