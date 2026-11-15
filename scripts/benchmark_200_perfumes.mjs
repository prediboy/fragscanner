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
// 1. ONTOLOGY & CLUSTERING
// ==========================================

function normalizeDNA(raw) {
  if (!raw) return 'unique';
  const s = raw.toLowerCase().trim();
  if (s.includes('original creation') || s.includes('standalone') || s.includes('unique')) return 'original';

  let clean = s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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
  if (clean.includes('aventus') && !clean.includes('cologne') && !clean.includes('absolu')) return 'creed_aventus';
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
  if (clean.includes('baccarat') || clean.includes('br540') || clean.includes('br 540')) return 'mfk_br540';
  if (clean.includes('tobacco vanille')) return 'tf_tobacco_vanille';
  if (clean.includes('ombre leather') || clean.includes('tuscan leather')) return 'tf_leather';
  if (clean.includes('black phantom')) return 'kilian_black_phantom';
  if (clean.includes('oud for greatness')) return 'initio_oud_for_greatness';
  if (clean.includes('side effect')) return 'initio_side_effect';
  if (clean.includes('grand soir')) return 'mfk_grand_soir';

  return clean.replace(/\s+/g, '_');
}

function getWardrobeCluster(f, dnaKey) {
  const accords = (f.accords || []).map(a => (a.name || '').toLowerCase());
  const dna = dnaKey || normalizeDNA(f.dna_inspiration);

  if (
    ['chanel_bleu_de_chanel', 'dior_sauvage', 'ysl_y_edp', 'pdm_percival', 'chanel_allure_homme_sport'].includes(dna) ||
    (accords.includes('citrus') && accords.includes('aromatic') && accords.includes('woody') && !accords.includes('vanilla')) ||
    (f.brand === 'Ahmed Al Maghribi' && f.name.toLowerCase().includes('kaaf')) ||
    (f.brand === 'Ajmal' && (f.name.toLowerCase().includes('shiro') || f.name.toLowerCase().includes('blu') || f.name.toLowerCase().includes('kuro')))
  ) {
    return 'blue_fresh_versatile';
  }

  if (
    ['pdm_sedley', 'lv_afternoon_swim', 'lv_pacific_chill', 'lv_imagination', 'creed_silver_mountain_water', 'armani_adg'].includes(dna) ||
    accords.includes('aquatic') || accords.includes('marine')
  ) {
    return 'high_heat_citrus_aquatic';
  }

  if (['bvlgari_tygar'].includes(dna)) {
    return 'grapefruit_ambroxan_tygar';
  }

  if (['ysl_bleu_electrique', 'dior_homme_intense', 'jpg_le_male_le_parfum'].includes(dna)) {
    return 'evening_sensual_cardamom';
  }

  if (
    ['pdm_althair', 'kilian_angels_share', 'tf_tobacco_vanille', 'armani_swy_intensely', 'mfk_grand_soir'].includes(dna) ||
    (accords.includes('vanilla') && accords.includes('warm spicy'))
  ) {
    return 'gourmand_boozy_vanilla';
  }

  if (['creed_aventus', 'creed_aventus_absolu', 'nishane_hacivat'].includes(dna) || accords.includes('smoky')) {
    return 'fruity_smoky_aventus';
  }

  if (['tf_leather', 'initio_oud_for_greatness'].includes(dna) || accords.includes('leather') || accords.includes('oud')) {
    return 'dark_woody_leather_oud';
  }

  return 'fresh_floral_musk';
}

const CANONICAL_ACCORDS = [
  'citrus', 'aromatic', 'fresh spicy', 'woody', 'marine', 'aquatic',
  'green', 'lavender', 'mint', 'amber', 'warm spicy', 'sweet',
  'vanilla', 'fruity', 'floral', 'smoky', 'musk', 'salty', 'coconut', 'leather'
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
// 2. THE ENGINE
// ==========================================

export class RecommendationEngine {
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

  recommend({
    likedSeed,
    dislikedSeeds = [],
    wantedNotes = [],
    forbiddenAccords = [],
    targetSeason = null,
    allowDirectClones = false,
    limit = 5
  }) {
    if (!likedSeed) return [];

    const purgedDNAs = new Set();
    dislikedSeeds.forEach(s => {
      if (s._dna && s._dna !== 'unique' && s._dna !== 'original') {
        purgedDNAs.add(s._dna);
      }
    });

    const likedDNA = likedSeed._dna;
    const positiveCentroid = likedSeed._accordMap;

    const negativeCentroid = {};
    for (const c of CANONICAL_ACCORDS) negativeCentroid[c] = 0;
    if (dislikedSeeds.length > 0) {
      dislikedSeeds.forEach(s => {
        for (const c of CANONICAL_ACCORDS) negativeCentroid[c] += s._accordMap[c] / dislikedSeeds.length;
      });
    }

    const activeCluster = likedSeed._cluster;
    const scoredCandidates = [];

    for (const candidate of this.catalog) {
      // 1. Skip self
      if (candidate.id === likedSeed.id) continue;
      if (dislikedSeeds.some(s => s.id === candidate.id)) continue;

      // 2. Skip direct clone/flanker of liked seed if not allowed
      if (!allowDirectClones) {
        if (likedDNA !== 'unique' && likedDNA !== 'original' && candidate._dna === likedDNA) continue;
        if (candidate.name.toLowerCase().includes(likedSeed.name.toLowerCase()) || likedSeed.name.toLowerCase().includes(candidate.name.toLowerCase())) continue;
      }

      // 3. Purge disliked DNAs
      if (purgedDNAs.has(candidate._dna)) continue;

      // 4. Accord ceiling gate
      let rejectedAccord = false;
      const topAccords = (candidate.accords || []).slice(0, 2).map(a => (a.name || '').toLowerCase());
      for (const fb of forbiddenAccords) {
        const k = fb.toLowerCase();
        if (topAccords.some(a => a.includes(k)) && (candidate._accordMap[k] || 0) > 65) {
          rejectedAccord = true;
          break;
        }
        if ((candidate._accordMap[k] || 0) > 85) {
          rejectedAccord = true;
          break;
        }
      }
      if (rejectedAccord) continue;

      // 5. Seasonality filter
      if (targetSeason) {
        const s = (candidate.primary_season || '').toLowerCase();
        const t = targetSeason.toLowerCase();
        if (t === 'summer') {
          if (s === 'winter' || s === 'fall') {
            const isFresh = candidate._accordMap['citrus'] > 50 || candidate._accordMap['aquatic'] > 50 || candidate._accordMap['fresh spicy'] > 50;
            if (!isFresh) continue;
          }
        } else if (t === 'winter') {
          if (s === 'summer' && candidate._accordMap['aquatic'] > 70 && candidate._accordMap['warm spicy'] < 30) continue;
        }
      }

      // SCORING
      let score = 0;
      if (candidate._cluster === activeCluster) score += 45;

      const accordSim = cosineSimilarity(candidate._accordMap, positiveCentroid);
      score += accordSim * 35;

      if (dislikedSeeds.length > 0) {
        const hateSim = cosineSimilarity(candidate._accordMap, negativeCentroid);
        if (hateSim > 0.70) score -= (hateSim - 0.70) * 50;
      }

      for (const wn of wantedNotes) {
        const wKey = wn.toLowerCase();
        const inTop = (candidate.top_notes || []).some(n => (n || '').toLowerCase().includes(wKey));
        const inMid = (candidate.middle_notes || []).some(n => (n || '').toLowerCase().includes(wKey));
        if (inTop || inMid) score += 25;
        else if ((candidate.base_notes || []).some(n => (n || '').toLowerCase().includes(wKey))) score += 10;
      }

      if (targetSeason?.toLowerCase() === 'summer') {
        const freshScore = (candidate._accordMap['citrus'] || 0) + (candidate._accordMap['fresh spicy'] || 0) + (candidate._accordMap['aromatic'] || 0);
        score += Math.min(20, freshScore / 15);
      } else if (targetSeason?.toLowerCase() === 'winter') {
        const warmScore = (candidate._accordMap['warm spicy'] || 0) + (candidate._accordMap['vanilla'] || 0) + (candidate._accordMap['sweet'] || 0);
        score += Math.min(20, warmScore / 15);
      }

      scoredCandidates.push({ fragrance: candidate, score });
    }

    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates.slice(0, limit);
  }
}

// ==========================================
// 3. 200+ BENCHMARK TEST SUITE
// ==========================================

async function run200Benchmark() {
  console.log('🔄 Fetching catalog from Supabase...');
  let catalog = [];
  let page = 0;
  while (true) {
    const { data } = await supabase
      .from('fragrances')
      .select('id, name, brand, accords, top_notes, middle_notes, base_notes, dna_inspiration, primary_season')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    catalog = catalog.concat(data);
    if (data.length < 1000) break;
    page++;
  }

  console.log(`✅ Loaded ${catalog.length} perfumes into memory.\n`);
  const engine = new RecommendationEngine(catalog);

  // Pick top 220 well-defined perfumes across diverse brands to act as test anchors
  const candidatesForTest = engine.catalog.filter(f =>
    f.accords && f.accords.length >= 3 &&
    (f.top_notes?.length > 0 || f.middle_notes?.length > 0)
  );

  const testSeeds = candidatesForTest.slice(0, 210);
  console.log(`🎯 Generated ${testSeeds.length} distinct perfume evaluation combinations (target >= 200).\n`);

  // Define negative profiles and constraint rules based on fragrance family
  let totalEvaluations = 0;
  let checksPassed = 0;

  const metrics = {
    totalRuns: testSeeds.length,
    dnaPurgeSuccess: 0,
    cloneSuppressionSuccess: 0,
    accordCeilingSuccess: 0,
    heroNoteHitSuccess: 0,
    tasteClusterCoherence: 0,
    seasonalitySuccess: 0
  };

  const sampleLogs = [];

  for (let i = 0; i < testSeeds.length; i++) {
    const seed = testSeeds[i];
    const isSummerSeed = seed._cluster === 'blue_fresh_versatile' || seed._cluster === 'high_heat_citrus_aquatic';
    const isWinterSeed = seed._cluster === 'gourmand_boozy_vanilla' || seed._cluster === 'dark_woody_leather_oud';

    // Configure realistic user requirements based on profile
    let targetSeason = null;
    let wantedNotes = [];
    let forbiddenAccords = [];
    let dislikedSeeds = [];

    if (isSummerSeed) {
      targetSeason = 'Summer';
      wantedNotes = ['mint', 'bergamot', 'lavender', 'lemon'].filter(n => seed._allNotes.includes(n));
      if (wantedNotes.length === 0) wantedNotes = ['citrus', 'lavender'];
      forbiddenAccords = ['amber', 'warm spicy', 'sweet', 'vanilla'];
      // Dislike an opposing warm spicy/amber perfume
      const hated = engine.catalog.find(f => f._cluster === 'gourmand_boozy_vanilla');
      if (hated) dislikedSeeds.push(hated);
    } else if (isWinterSeed) {
      targetSeason = 'Winter';
      wantedNotes = ['vanilla', 'cinnamon', 'amber', 'tonka'].filter(n => seed._allNotes.includes(n));
      if (wantedNotes.length === 0) wantedNotes = ['vanilla', 'spicy'];
      forbiddenAccords = ['marine', 'aquatic', 'salty'];
      const hated = engine.catalog.find(f => f._cluster === 'high_heat_citrus_aquatic');
      if (hated) dislikedSeeds.push(hated);
    } else {
      targetSeason = 'All Year';
      wantedNotes = (seed.top_notes || []).slice(0, 2);
      forbiddenAccords = ['coconut', 'lactonic'];
      const hated = engine.catalog.find(f => f._dna === 'jpg_le_beau');
      if (hated) dislikedSeeds.push(hated);
    }

    const recs = engine.recommend({
      likedSeed: seed,
      dislikedSeeds,
      wantedNotes,
      forbiddenAccords,
      targetSeason,
      allowDirectClones: false,
      limit: 5
    });

    if (recs.length === 0) continue;

    // Evaluate accuracy across 6 objective checks for each test run:
    totalEvaluations += 6;

    // Check 1: DNA Purge Check (No recommendations from disliked seeds DNA)
    const hatedDNAs = new Set(dislikedSeeds.map(d => d._dna).filter(d => d !== 'unique' && d !== 'original'));
    const dnaLeak = recs.some(r => hatedDNAs.has(r.fragrance._dna));
    if (!dnaLeak) {
      metrics.dnaPurgeSuccess++;
      checksPassed++;
    }

    // Check 2: Clone Suppression Check (No direct clone of liked seed)
    const cloneLeak = seed._dna !== 'unique' && seed._dna !== 'original' && recs.some(r => r.fragrance._dna === seed._dna);
    if (!cloneLeak) {
      metrics.cloneSuppressionSuccess++;
      checksPassed++;
    }

    // Check 3: Accord Ceiling Check (No forbidden accords in top 2 or > 65)
    let accordLeak = false;
    for (const r of recs) {
      const top2 = (r.fragrance.accords || []).slice(0, 2).map(a => (a.name || '').toLowerCase());
      for (const fb of forbiddenAccords) {
        if (top2.some(a => a.includes(fb.toLowerCase())) && (r.fragrance._accordMap[fb.toLowerCase()] || 0) > 65) {
          accordLeak = true;
          break;
        }
      }
      if (accordLeak) break;
    }
    if (!accordLeak) {
      metrics.accordCeilingSuccess++;
      checksPassed++;
    }

    // Check 4: Hero Note Precision (Top 5 has at least 1 hero note match)
    const noteMatchCount = recs.filter(r =>
      wantedNotes.some(wn => r.fragrance._allNotes.some(n => n.includes(wn.toLowerCase())))
    ).length;
    if (noteMatchCount >= 2) {
      metrics.heroNoteHitSuccess++;
      checksPassed++;
    }

    // Check 5: Taste Cluster Coherence (Coherent with Fragrantica wardrobe graph)
    const clusterMatches = recs.filter(r => r.fragrance._cluster === seed._cluster).length;
    if (clusterMatches >= 3) {
      metrics.tasteClusterCoherence++;
      checksPassed++;
    }

    // Check 6: Seasonality Compliance
    let seasonConflict = false;
    if (targetSeason === 'Summer') {
      seasonConflict = recs.some(r =>
        (r.fragrance.primary_season || '').toLowerCase() === 'winter' &&
        (r.fragrance._accordMap['citrus'] || 0) < 40 &&
        (r.fragrance._accordMap['aquatic'] || 0) < 40
      );
    }
    if (!seasonConflict) {
      metrics.seasonalitySuccess++;
      checksPassed++;
    }

    if (i < 5 || i === 50 || i === 100 || i === 150 || i === 200) {
      sampleLogs.push({
        testNum: i + 1,
        seed: `[${seed.brand}] ${seed.name}`,
        cluster: seed._cluster,
        wantedNotes: wantedNotes.join(', '),
        forbiddenAccords: forbiddenAccords.join(', '),
        recs: recs.map(r => `[${r.fragrance.brand}] ${r.fragrance.name}`)
      });
    }
  }

  // Summary Report
  const runs = testSeeds.length;
  console.log('========================================================================');
  console.log(`📊 BENCHMARK RESULTS ACROSS ${runs} DISTINCT PERFUMES & COMBINATIONS`);
  console.log('========================================================================\n');

  const accuracyDNA = ((metrics.dnaPurgeSuccess / runs) * 100).toFixed(2);
  const accuracyClone = ((metrics.cloneSuppressionSuccess / runs) * 100).toFixed(2);
  const accuracyAccord = ((metrics.accordCeilingSuccess / runs) * 100).toFixed(2);
  const accuracyHeroNotes = ((metrics.heroNoteHitSuccess / runs) * 100).toFixed(2);
  const accuracyCluster = ((metrics.tasteClusterCoherence / runs) * 100).toFixed(2);
  const accuracySeason = ((metrics.seasonalitySuccess / runs) * 100).toFixed(2);
  const overallAccuracy = ((checksPassed / totalEvaluations) * 100).toFixed(2);

  const tableSummary = [
    { 'Evaluation Dimension': '1. Hated DNA Purge Rate (Zero Leaks)', 'Success Rate': `${accuracyDNA}%`, 'Target': '100.0%' },
    { 'Evaluation Dimension': '2. Direct Clone Suppression Rate', 'Success Rate': `${accuracyClone}%`, 'Target': '100.0%' },
    { 'Evaluation Dimension': '3. Accord Ceiling Compliance (No Amber/Sweet)', 'Success Rate': `${accuracyAccord}%`, 'Target': '100.0%' },
    { 'Evaluation Dimension': '4. Hero Note Precision (Top/Heart Hits)', 'Success Rate': `${accuracyHeroNotes}%`, 'Target': '> 90.0%' },
    { 'Evaluation Dimension': '5. Taste Cluster Coherence (Wardrobe Graph)', 'Success Rate': `${accuracyCluster}%`, 'Target': '> 90.0%' },
    { 'Evaluation Dimension': '6. Seasonality & Temperature Fit', 'Success Rate': `${accuracySeason}%`, 'Target': '100.0%' }
  ];

  console.table(tableSummary);
  console.log(`\n⭐️ OVERALL BENCHMARK ACCURACY: ${overallAccuracy}% (${checksPassed} / ${totalEvaluations} individual test gates passed)`);

  console.log('\n--- SAMPLE DIVERSE TEST LOGS ---');
  sampleLogs.forEach(l => {
    console.log(`\nTest #${l.testNum}: Seed: ${l.seed} (${l.cluster})`);
    console.log(`   Wanted Notes: ${l.wantedNotes} | Forbidden: ${l.forbiddenAccords}`);
    console.log(`   Top Recs: ${l.recs.join(' • ')}`);
  });
}

run200Benchmark().catch(console.error);
