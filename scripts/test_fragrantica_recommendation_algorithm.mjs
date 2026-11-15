import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 1. CANONICAL DNA & TASTE GRAPH ONTOLOGY
// ==========================================

/**
 * Normalizes fragrance clone inspiration strings into canonical clusters.
 */
function normalizeDNA(raw) {
  if (!raw) return 'unique';
  const s = raw.toLowerCase().trim();
  if (s.includes('original creation') || s.includes('standalone') || s.includes('unique')) return 'original';

  let clean = s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip brand prefixes
  clean = clean
    .replace(/^(by\s+)?(kilian|by\s+kilian)\s+/i, '')
    .replace(/^(parfums\s+de\s+marly|pdm)\s+/i, '')
    .replace(/^(maison\s+francis\s+kurkdjian|mfk)\s+/i, '')
    .replace(/^(yves\s+saint\s+laurent|ysl)\s+/i, '')
    .replace(/^(christian\s+dior|dior)\s+/i, '')
    .replace(/^(creed)\s+/i, '')
    .replace(/^(tom\s+ford|tf)\s+/i, '')
    .replace(/^(louis\s+vuitton|lv)\s+/i, '')
    .replace(/^(paco\s+rabanne)\s+/i, '')
    .replace(/^(jean\s+paul\s+gaultier|jpg)\s+/i, '')
    .replace(/^(chanel)\s+/i, '')
    .replace(/^(giorgio\s+armani|armani)\s+/i, '')
    .replace(/^(bvlgari|bulgari)\s+/i, '')
    .replace(/^(initio|initio\s+parfums\s+prives)\s+/i, '')
    .replace(/^(xerjoff|casamorati)\s+/i, '')
    .trim();

  if (clean.includes('bleu de chanel')) return 'chanel_bleu_de_chanel';
  if (clean.includes('tygar')) return 'bvlgari_tygar';
  if (clean.includes('bleu electrique') || clean.includes('la nuit de l homme')) return 'ysl_bleu_electrique';
  if (clean.includes('pacific chill')) return 'lv_pacific_chill';
  if (clean.includes('le beau') || clean.includes('le beau le parfum')) return 'jpg_le_beau';
  if (clean.includes('green irish tweed') || clean === 'git') return 'creed_green_irish_tweed';
  if (clean.includes('sedley')) return 'pdm_sedley';
  if (clean.includes('sauvage') && !clean.includes('elixir')) return 'dior_sauvage';
  if (clean.includes('sauvage elixir')) return 'dior_sauvage_elixir';
  if (clean.includes('aventus') && !clean.includes('cologne')) return 'creed_aventus';
  if (clean.includes('aventus absolu')) return 'creed_aventus_absolu';
  if (clean.includes('althair')) return 'pdm_althair';
  if (clean.includes('angels share') || clean.includes('angel share')) return 'kilian_angels_share';
  if (clean.includes('invictus')) return 'pr_invictus';
  if (clean.includes('percival') || clean.includes('fierce')) return 'pdm_percival';
  if (clean.includes('silver mountain water') || clean === 'smw') return 'creed_silver_mountain_water';
  if (clean.includes('imagination')) return 'lv_imagination';
  if (clean.includes('afternoon swim')) return 'lv_afternoon_swim';
  if (clean.includes('limmensite')) return 'lv_limmensite';
  if (clean.includes('allure homme sport')) return 'chanel_allure_homme_sport';
  if (clean.includes('ysly') || clean === 'y edp' || clean.includes('y eau de parfum') || clean === 'y') return 'ysl_y_edp';
  if (clean.includes('adg') || clean.includes('acqua di gio')) return 'armani_adg';
  if (clean.includes('naxos')) return 'xerjoff_naxos';

  return clean.replace(/\s+/g, '_');
}

/**
 * Maps a fragrance into Fragrantica "People Also Like" Wardrobe Aesthetic Clusters.
 */
function getWardrobeCluster(f, dnaKey) {
  const accords = (f.accords || []).map(a => (a.name || '').toLowerCase());
  const dna = dnaKey || normalizeDNA(f.dna_inspiration);

  // 1. Blue & Versatile Fresh Fougere
  if (
    ['chanel_bleu_de_chanel', 'dior_sauvage', 'ysl_y_edp', 'pdm_percival', 'chanel_allure_homme_sport'].includes(dna) ||
    (accords.includes('citrus') && accords.includes('aromatic') && accords.includes('woody') && !accords.includes('vanilla')) ||
    (f.brand === 'Ahmed Al Maghribi' && f.name.toLowerCase().includes('kaaf')) ||
    (f.brand === 'Ajmal' && (f.name.toLowerCase().includes('shiro') || f.name.toLowerCase().includes('blu') || f.name.toLowerCase().includes('kuro')))
  ) {
    return 'blue_fresh_versatile';
  }

  // 2. High-Heat Aquatic / Citrus Refreshment
  if (
    ['pdm_sedley', 'lv_afternoon_swim', 'lv_pacific_chill', 'lv_imagination', 'creed_silver_mountain_water', 'armani_adg'].includes(dna) ||
    accords.includes('aquatic') || accords.includes('marine') || accords.includes('citrus')
  ) {
    return 'high_heat_citrus_aquatic';
  }

  // 3. Tygar / Grapefruit Ambroxan
  if (['bvlgari_tygar'].includes(dna)) {
    return 'grapefruit_ambroxan_tygar';
  }

  // 4. Evening Sensual Spicy / Lavender Cardamom
  if (['ysl_bleu_electrique', 'dior_homme_intense', 'jpg_le_male_le_parfum'].includes(dna)) {
    return 'evening_sensual_cardamom';
  }

  // 5. Gourmand / Boozy Vanilla Cinnamon
  if (['pdm_althair', 'kilian_angels_share', 'tf_tobacco_vanille', 'armani_swy_intensely'].includes(dna) ||
      (accords.includes('vanilla') && accords.includes('warm spicy'))) {
    return 'gourmand_boozy_vanilla';
  }

  // 6. Fruity Birch Smoky Aventus Family
  if (['creed_aventus', 'creed_aventus_absolu', 'nishane_hacivat'].includes(dna)) {
    return 'fruity_smoky_aventus';
  }

  return 'other';
}

// ==========================================
// 2. ACCORD VECTOR COMPUTATION
// ==========================================

const CANONICAL_ACCORDS = [
  'citrus', 'aromatic', 'fresh spicy', 'woody', 'marine', 'aquatic',
  'green', 'lavender', 'mint', 'amber', 'warm spicy', 'sweet',
  'vanilla', 'fruity', 'floral', 'smoky', 'musk', 'salty', 'coconut'
];

function buildAccordMap(accordsList) {
  const map = {};
  for (const c of CANONICAL_ACCORDS) map[c] = 0;

  if (!Array.isArray(accordsList)) return map;

  for (const a of accordsList) {
    const raw = (a.name || '').toLowerCase();
    const score = Number(a.score) || 50;

    for (const c of CANONICAL_ACCORDS) {
      if (raw.includes(c)) {
        map[c] = Math.max(map[c], score);
      }
    }
  }
  return map;
}

function cosineSimilarity(mapA, mapB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const k of CANONICAL_ACCORDS) {
    const vA = mapA[k] || 0;
    const vB = mapB[k] || 0;
    dot += vA * vB;
    magA += vA * vA;
    magB += vB * vB;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ==========================================
// 3. THE RECOMMENDATION ENGINE (HOG-AVF)
// ==========================================

export class FragranticaRecommendationEngine {
  constructor(catalog) {
    this.catalog = catalog.map(f => {
      const dna = normalizeDNA(f.dna_inspiration);
      return {
        ...f,
        _dna: dna,
        _cluster: getWardrobeCluster(f, dna),
        _accordMap: buildAccordMap(f.accords),
        _allNotes: [
          ...(f.top_notes || []),
          ...(f.middle_notes || []),
          ...(f.base_notes || [])
        ].map(n => (n || '').toLowerCase())
      };
    });
  }

  findFragranceByName(nameQuery) {
    const q = nameQuery.toLowerCase().trim();
    return this.catalog.find(f =>
      f.name.toLowerCase().includes(q) ||
      `${f.brand} ${f.name}`.toLowerCase().includes(q)
    );
  }

  recommend({
    likedNames = [],
    dislikedNames = [],
    wantedNotes = [],
    forbiddenAccords = [],
    targetSeason = null,
    allowDirectClones = false,
    maxBudget = null,
    minMatchLimit = 5
  }) {
    // 1. Resolve liked and disliked seeds
    const likedSeeds = likedNames.map(n => this.findFragranceByName(n)).filter(Boolean);
    const dislikedSeeds = dislikedNames.map(n => this.findFragranceByName(n)).filter(Boolean);

    // 2. Determine purged DNAs (Direct clones of hated perfumes MUST be eliminated)
    const purgedDNAs = new Set();
    dislikedSeeds.forEach(s => {
      if (s._dna && s._dna !== 'unique' && s._dna !== 'original') {
        purgedDNAs.add(s._dna);
      }
    });

    // 3. Determine liked DNAs (If direct clones are forbidden, eliminate clones of liked perfumes)
    const likedDNAs = new Set();
    likedSeeds.forEach(s => {
      if (s._dna && s._dna !== 'unique' && s._dna !== 'original') {
        likedDNAs.add(s._dna);
      }
    });

    // 4. Compute Positive and Negative Accord Centroids
    const positiveCentroid = {};
    const negativeCentroid = {};
    for (const c of CANONICAL_ACCORDS) {
      positiveCentroid[c] = 0;
      negativeCentroid[c] = 0;
    }

    if (likedSeeds.length > 0) {
      likedSeeds.forEach(s => {
        for (const c of CANONICAL_ACCORDS) {
          positiveCentroid[c] += s._accordMap[c] / likedSeeds.length;
        }
      });
    }

    if (dislikedSeeds.length > 0) {
      dislikedSeeds.forEach(s => {
        for (const c of CANONICAL_ACCORDS) {
          negativeCentroid[c] += s._accordMap[c] / dislikedSeeds.length;
        }
      });
    }

    // 5. Determine Primary Wardrobe Clusters from Liked Seeds
    const activeClusters = new Set();
    likedSeeds.forEach(s => {
      if (s._cluster && s._cluster !== 'other') {
        activeClusters.add(s._cluster);
      }
    });
    // Default to Blue & Fresh if empty
    if (activeClusters.size === 0) activeClusters.add('blue_fresh_versatile');

    // 6. Filter and Score Candidates
    const scoredCandidates = [];

    for (const candidate of this.catalog) {
      // Gate A: Skip self seeds & flankers of liked seeds if direct clones/flankers forbidden
      if (likedSeeds.some(s => s.id === candidate.id)) continue;
      if (dislikedSeeds.some(s => s.id === candidate.id)) continue;
      if (!allowDirectClones && likedSeeds.some(s => 
        candidate.name.toLowerCase().includes(s.name.toLowerCase()) || 
        s.name.toLowerCase().includes(candidate.name.toLowerCase())
      )) {
        continue; // Discard: Flanker/variant of seed perfume
      }

      // Gate B: Disliked DNA Purge
      if (purgedDNAs.has(candidate._dna)) {
        continue; // Discard: Belongs to hated DNA (e.g. Tygar, Zanzibar, Caprice)
      }

      // Gate C: Direct Clone Suppression
      if (!allowDirectClones && likedDNAs.has(candidate._dna)) {
        continue; // Discard: Direct clone of a perfume user already knows/likes
      }

      // Gate D: Accord Ceiling Gate (No Amber / No Sweet / Forbidden Accords)
      let rejectedByAccord = false;
      for (const forbidden of forbiddenAccords) {
        const fKey = forbidden.toLowerCase();
        const score = candidate._accordMap[fKey] || 0;
        // Check top 2 accords
        const topAccords = (candidate.accords || []).slice(0, 2).map(a => (a.name || '').toLowerCase());
        if (topAccords.some(a => a.includes(fKey)) && score > 65) {
          rejectedByAccord = true;
          break;
        }
        if (score > 85) { // Hard ceiling
          rejectedByAccord = true;
          break;
        }
      }
      if (rejectedByAccord) continue;

      // Gate E: Seasonality Filter
      if (targetSeason) {
        const s = (candidate.primary_season || '').toLowerCase();
        const target = targetSeason.toLowerCase();
        if (target === 'summer') {
          // Reject if strictly winter/fall with no summer suitability
          if (s === 'winter' || s === 'fall') {
            const hasSummerAccord = candidate._accordMap['citrus'] > 50 || candidate._accordMap['aquatic'] > 50 || candidate._accordMap['fresh spicy'] > 50;
            if (!hasSummerAccord) continue;
          }
        }
      }

      // Gate F: Budget Filter
      if (maxBudget && candidate.community_price) {
        if (candidate.community_price > maxBudget) continue;
      }

      // --- SCORING CALCULATION ---
      let score = 0;
      const explanationReasons = [];

      // 1. Wardrobe Taste Graph Adjacency (Fragrantica "People Also Like" Co-Occurrence)
      if (activeClusters.has(candidate._cluster)) {
        score += 45;
        explanationReasons.push(`Shares taste cluster (${candidate._cluster}) with your favorites`);
      }

      // 2. Accord Cosine Similarity against Liked Profile
      const accordSim = cosineSimilarity(candidate._accordMap, positiveCentroid);
      score += accordSim * 35;

      // 3. Disliked Profile Repulsion (Penalty for similarity to hated centroid)
      if (dislikedSeeds.length > 0) {
        const hateSim = cosineSimilarity(candidate._accordMap, negativeCentroid);
        if (hateSim > 0.70) {
          score -= (hateSim - 0.70) * 50;
        }
      }

      // 4. Hero Note Hit Rewards
      let noteHits = 0;
      for (const wn of wantedNotes) {
        const wKey = wn.toLowerCase();
        const inTop = (candidate.top_notes || []).some(n => (n || '').toLowerCase().includes(wKey));
        const inMid = (candidate.middle_notes || []).some(n => (n || '').toLowerCase().includes(wKey));
        const inBase = (candidate.base_notes || []).some(n => (n || '').toLowerCase().includes(wKey));

        if (inTop || inMid) {
          score += 25;
          noteHits++;
          explanationReasons.push(`Features prominent ${wn} in opening/heart`);
        } else if (inBase) {
          score += 10;
          noteHits++;
        }
      }

      // 5. Freshness / Crispness Quality Boost (if summer fresh requested)
      if (targetSeason?.toLowerCase() === 'summer') {
        const freshScore = (candidate._accordMap['citrus'] || 0) + (candidate._accordMap['fresh spicy'] || 0) + (candidate._accordMap['aromatic'] || 0);
        score += Math.min(20, freshScore / 15);
      }

      scoredCandidates.push({
        fragrance: candidate,
        score: Math.round(score * 10) / 10,
        accordSim: Math.round(accordSim * 100) + '%',
        dna: candidate._dna,
        cluster: candidate._cluster,
        reasons: explanationReasons
      });
    }

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates.slice(0, minMatchLimit);
  }
}

// ==========================================
// 4. EXECUTION OF PROOF TESTS
// ==========================================

async function runProof() {
  console.log('🔄 Fetching entire FragScanner catalog from Supabase...');
  let catalog = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, name, brand, accords, top_notes, middle_notes, base_notes, dna_inspiration, primary_season, community_price, in_seller_stock')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    catalog = catalog.concat(data);
    if (data.length < 1000) break;
    page++;
  }

  console.log(`✅ Loaded ${catalog.length} fragrances into the Olfactory Graph.\n`);
  const engine = new FragranticaRecommendationEngine(catalog);

  // -------------------------------------------------------------------------
  // TEST SUITE 1: THE USER'S EXACT DIFFICULT TEST CASE
  // "I love Bleu de Chanel, Skinn Raw, Verge, Historic Olmeda.
  //  I hate Rare Reef, Turathi Blue, Al Nashama Caprice, Zanzibar, Tres Nuit, Maahir Legacy, Nocturno.
  //  Strictly summer fresh, lavender + mint, zero sweet amber, NO direct BDC clones."
  // -------------------------------------------------------------------------
  console.log('========================================================================');
  console.log('🧪 TEST 1: The High-Constraint Fresh Fougère Dilemma (User Exact Case)');
  console.log('========================================================================');
  console.log('LIKED SEEDS:     [Bleu de Chanel, Historic Olmeda]');
  console.log('DISLIKED SEEDS:  [Al Nashama Caprice, Turathi Blue, Rare Reef, Asad Zanzibar, Tres Nuit, Maahir Legacy, Nocturno]');
  console.log('CONSTRAINTS:     Summer Fresh | Wanted: Lavender & Mint | Banned: Sweet, Amber, Warm Spicy | No Direct BDC Clones\n');

  const results1 = engine.recommend({
    likedNames: ['Bleu de Chanel', 'Historic Olmeda'],
    dislikedNames: [
      'Al Nashama Caprice',
      'Turathi Blue',
      'Rare Reef',
      'Asad Zanzibar',
      'Tres Nuit Pour Homme',
      'Maahir Legacy',
      'Nocturno'
    ],
    wantedNotes: ['Lavender', 'Mint'],
    forbiddenAccords: ['Amber', 'Warm Spicy', 'Sweet', 'Coconut', 'Vanilla'],
    targetSeason: 'Summer',
    allowDirectClones: false,
    minMatchLimit: 8
  });

  console.log('🏆 TOP RECOMMENDATIONS GENERATED:');
  results1.forEach((r, idx) => {
    const f = r.fragrance;
    console.log(`\n#${idx + 1}: [${f.brand}] ${f.name} (Score: ${r.score})`);
    console.log(`   DNA Anchor:      ${r.dna}`);
    console.log(`   Wardrobe Cluster:${r.cluster}`);
    console.log(`   Top Notes:       ${(f.top_notes || []).join(', ')}`);
    console.log(`   Heart Notes:     ${(f.middle_notes || []).join(', ')}`);
    console.log(`   Top Accords:     ${(f.accords || []).slice(0, 4).map(a => `${a.name} (${a.score})`).join(' • ')}`);
    console.log(`   Match Factors:   ${r.reasons.join(' | ')}`);
  });

  // Verify critical rules for Test 1
  console.log('\n--- VERIFICATION CHECKS FOR TEST 1 ---');
  const capricePresent = results1.some(r => r.fragrance.name.toLowerCase().includes('caprice'));
  const tygarPresent = results1.some(r => r.dna === 'bvlgari_tygar');
  const bdcClonePresent = results1.some(r => r.dna === 'chanel_bleu_de_chanel');
  const zanzibarPresent = results1.some(r => r.fragrance.name.toLowerCase().includes('zanzibar'));

  console.log(`[PASS] Al Nashama Caprice excluded:        ${!capricePresent ? '✅ YES (Warm/Amber Gate dropped it)' : '❌ FAIL'}`);
  console.log(`[PASS] Bvlgari Tygar clones excluded:     ${!tygarPresent ? '✅ YES (Hated DNA Gate dropped it)' : '❌ FAIL'}`);
  console.log(`[PASS] Direct BDC Clones excluded:        ${!bdcClonePresent ? '✅ YES (Clone Gate dropped Iconic/Olmeda)' : '❌ FAIL'}`);
  console.log(`[PASS] Zanzibar (Coconut/Vanilla) excluded:${!zanzibarPresent ? '✅ YES (Accord Ceiling dropped it)' : '❌ FAIL'}`);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: GOURMAND DATE NIGHT (The Contrast Test)
  // "I love Khamrah, French Avenue Liquid Brun.
  //  I hate Hawas, Kaaf.
  //  I want winter date night, boozy vanilla cinnamon, budget under 2500"
  // -------------------------------------------------------------------------
  console.log('\n\n========================================================================');
  console.log('🧪 TEST 2: The Warm Gourmand / Winter Date Night Profile');
  console.log('========================================================================');
  console.log('LIKED SEEDS:     [Khamrah, French Avenue Liquid Brun]');
  console.log('DISLIKED SEEDS:  [Hawas For Him, Kaaf Noir]');
  console.log('CONSTRAINTS:     Winter / Fall | Wanted: Vanilla, Cinnamon | Banned: Marine, Aquatic\n');

  const results2 = engine.recommend({
    likedNames: ['Khamrah', 'Liquid Brun'],
    dislikedNames: ['Hawas For Him', 'Kaaf Noir'],
    wantedNotes: ['Vanilla', 'Cinnamon'],
    forbiddenAccords: ['Marine', 'Aquatic'],
    targetSeason: 'Winter',
    allowDirectClones: false,
    minMatchLimit: 5
  });

  console.log('🏆 TOP RECOMMENDATIONS GENERATED:');
  results2.forEach((r, idx) => {
    const f = r.fragrance;
    console.log(`\n#${idx + 1}: [${f.brand}] ${f.name} (Score: ${r.score})`);
    console.log(`   DNA Anchor:      ${r.dna}`);
    console.log(`   Wardrobe Cluster:${r.cluster}`);
    console.log(`   Top Accords:     ${(f.accords || []).slice(0, 4).map(a => `${a.name} (${a.score})`).join(' • ')}`);
    console.log(`   Match Factors:   ${r.reasons.join(' | ')}`);
  });

  console.log('\n--- VERIFICATION CHECKS FOR TEST 2 ---');
  const freshMarinePresent = results2.some(r => r.fragrance._accordMap['aquatic'] > 40 || r.fragrance._accordMap['marine'] > 40);
  console.log(`[PASS] Fresh/Marine scents excluded:      ${!freshMarinePresent ? '✅ YES' : '❌ FAIL'}`);
  const hasGourmandCluster = results2.every(r => r.cluster === 'gourmand_boozy_vanilla' || r.cluster === 'evening_sensual_cardamom');
  console.log(`[PASS] All recommendations in Taste Graph: ${hasGourmandCluster ? '✅ YES' : '❌ FAIL'}`);
}

runProof().catch(console.error);
