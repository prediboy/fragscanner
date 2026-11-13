const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Auto-load .env
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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env!');
  process.exit(1);
}
if (!GEMINI_KEY) {
  console.error('Missing GEMINI_API_KEY in .env!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

async function enrichBatchWithLLM(perfumes, maxRetries = 3) {
  const prompt = `You are an elite perfume archivist and Fragrantica data specialist.
For each perfume below, look up its authentic Fragrantica consensus profile and return a JSON array of objects.
CRITICAL RULES:
1. "dna_inspiration": If the perfume is a known clone, state the luxury fragrance it clones/inspires (e.g., 'Parfums de Marly Althaïr', 'Louis Vuitton Imagination', 'Xerjoff Naxos', 'Creed Aventus', 'Bvlgari Tygar'). If it is an authentic standalone original creation, specify 'Original Creation (brief profile descriptor)'. Do NOT guess 'Chanel Bleu de Chanel' unless it genuinely clones Bleu de Chanel (like CDN Blue Iconic).
2. "notes": Provide authentic top, middle, and base notes from Fragrantica. Do NOT use generic placeholder notes.
3. "accords": Provide 3-5 main olfactory accords with visual hex colors.

Input perfumes:
${JSON.stringify(perfumes, null, 2)}

Return strictly a raw JSON array of objects with this schema for each perfume:
[
  {
    "id": "exact item ID from input",
    "dna_inspiration": "High-end perfume it clones/inspires or 'Original Creation (brief descriptor)'",
    "dna_type": "Fragrance olfactory classification (e.g. 'Warm Spicy Amber Gourmand', 'Fresh Aromatic Aquatic', 'Leather Woody Incense', etc.)",
    "top_notes": ["Note 1", "Note 2"],
    "middle_notes": ["Note 1", "Note 2"],
    "base_notes": ["Note 1", "Note 2"],
    "accords": [
      { "name": "Accord Name", "score": 95, "color": "#hex" }
    ],
    "fragrantica_url": "Authentic URL on fragrantica.com if known, else null"
  }
]`;

  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const activeModel = candidateModels[attempt - 1] || candidateModels[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${GEMINI_KEY}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(25000)
      });

      if (res.status === 429) {
        console.warn(`  [LLM Rate Limit 429] Backing off ${attempt * 3}s...`);
        await new Promise(r => setTimeout(r, attempt * 3000));
        continue;
      }

      if (!res.ok) {
        console.warn(`  [LLM Status ${res.status}] Attempt ${attempt}/${maxRetries} on model ${activeModel}`);
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = safeParseJson(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn(`  [LLM Attempt ${attempt} Error]:`, err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function runEnrichment() {
  console.log('🔍 Step 1: Scanning Supabase for perfumes needing Fragrantica enrichment...');

  let all = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, name, brand, notes, dna_inspiration, top_notes, accords')
      .or('in_seller_stock.eq.true,has_decants.eq.true')
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    page++;
  }

  const genericP1 = JSON.stringify({"top":["Bergamot","Citrus"],"base":["Ambroxan","Cedarwood","Patchouli"],"middle":["Spices","Lavender"]});
  const genericP2 = JSON.stringify({"top":["Sea Notes","Bergamot","Grapefruit"],"base":["Ambroxan","Cedarwood","Musk"],"middle":["Lavender","Marine Notes","Cardamom"]});

  const targets = all.filter(f => {
    // Preserve manually verified items (like Ajmal Blu st-9100)
    if (f.id === 'st-9100') return false;

    const s = JSON.stringify(f.notes);
    const isPlaceholder = s === genericP1 || s === genericP2;
    const isLegacyId = f.id.startsWith('st-') || f.id.startsWith('apex-');
    const isMissingNotes = !f.notes || !f.notes.top || f.notes.top.length === 0;
    return isPlaceholder || isLegacyId || isMissingNotes;
  });

  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const maxLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : targets.length;
  const activeTargets = targets.slice(0, maxLimit);

  console.log(`📊 Target perfumes to re-enrich with Fragrantica ground truth: ${activeTargets.length} (out of ${targets.length})`);

  const batchSize = 10;
  let totalUpdated = 0;
  let totalBatches = Math.ceil(activeTargets.length / batchSize);

  for (let i = 0; i < activeTargets.length; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const batch = activeTargets.slice(i, i + batchSize).map(f => ({
      id: f.id,
      brand: f.brand,
      name: f.name
    }));

    console.log(`\n[Batch ${batchNum}/${totalBatches}] Querying Fragrantica profiles for ${batch.length} perfumes...`);
    const results = await enrichBatchWithLLM(batch);

    if (!results || !Array.isArray(results)) {
      console.warn(`  ⚠️ Failed to retrieve batch ${batchNum}. Skipping to next batch.`);
      continue;
    }

    for (const r of results) {
      if (!r.id || !r.dna_inspiration) continue;

      const top = Array.isArray(r.top_notes) ? r.top_notes : [];
      const mid = Array.isArray(r.middle_notes) ? r.middle_notes : [];
      const base = Array.isArray(r.base_notes) ? r.base_notes : [];

      const updateData = {
        dna_inspiration: r.dna_inspiration,
        dna_type: r.dna_type || 'Aromatic Woody',
        top_notes: top,
        middle_notes: mid,
        base_notes: base,
        notes: {
          top,
          middle: mid,
          base
        }
      };

      if (Array.isArray(r.accords) && r.accords.length > 0) {
        updateData.accords = r.accords;
      }

      const { error: upErr } = await supabase
        .from('fragrances')
        .update(updateData)
        .eq('id', r.id);

      if (upErr) {
        console.warn(`  ❌ Failed to update ${r.id}: ${upErr.message}`);
      } else {
        totalUpdated++;
        console.log(`  ✓ Updated [${r.id}] -> "${r.dna_inspiration}" (${top.slice(0, 2).join(', ')})`);
      }
    }

    // Pacing delay between batches to stay comfortably within rate limits
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n🎉 ENRICHMENT COMPLETE! Successfully re-enriched ${totalUpdated} / ${targets.length} perfumes in Supabase.`);
}

runEnrichment().catch(console.error);
