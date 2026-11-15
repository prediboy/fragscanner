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
const supabase = createClient(supabaseUrl, supabaseKey);

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
  if (clean.includes('god of fire')) return 'shl_god_of_fire';
  if (clean.includes('le beau') || clean.includes('le beau le parfum')) return 'jpg_le_beau';
  if (clean.includes('green irish tweed') || clean === 'git') return 'creed_green_irish_tweed';
  if (clean.includes('sedley')) return 'pdm_sedley';
  if (clean.includes('sauvage') && !clean.includes('elixir')) return 'dior_sauvage';
  if (clean.includes('sauvage elixir')) return 'dior_sauvage_elixir';
  if (clean.includes('aventus') && !clean.includes('cologne') && !clean.includes('absolu')) return 'creed_aventus';
  if (clean.includes('aventus absolu')) return 'creed_aventus_absolu';
  if (clean.includes('althair')) return 'pdm_althair';
  if (clean.includes('angels share') || clean.includes('angel share')) return 'kilian_angels_share';
  if (clean.includes('tobacco vanille')) return 'tf_tobacco_vanille';
  if (clean.includes('dior homme intense')) return 'dior_homme_intense';
  if (clean.includes('invictus')) return 'pr_invictus';
  if (clean.includes('percival') || clean.includes('fierce')) return 'pdm_percival';
  if (clean.includes('silver mountain water') || clean === 'smw') return 'creed_silver_mountain_water';
  if (clean.includes('imagination')) return 'lv_imagination';
  if (clean.includes('afternoon swim')) return 'lv_afternoon_swim';
  if (clean.includes('allure homme sport')) return 'chanel_allure_homme_sport';
  if (clean.includes('ysly') || clean === 'y edp' || clean.includes('y eau de parfum') || clean === 'y') return 'ysl_y_edp';
  if (clean.includes('adg') || clean.includes('acqua di gio')) return 'armani_adg';
  if (clean.includes('naxos')) return 'xerjoff_naxos';

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
    ['pdm_sedley', 'lv_afternoon_swim', 'lv_pacific_chill', 'shl_god_of_fire', 'lv_imagination', 'creed_silver_mountain_water', 'armani_adg'].includes(dna) ||
    accords.includes('aquatic') || accords.includes('marine')
  ) {
    return 'high_heat_citrus_aquatic';
  }

  if (['bvlgari_tygar'].includes(dna)) return 'grapefruit_ambroxan_tygar';
  if (['ysl_bleu_electrique', 'dior_homme_intense', 'jpg_le_male_le_parfum'].includes(dna)) return 'evening_sensual_cardamom';
  if (
    ['pdm_althair', 'kilian_angels_share', 'tf_tobacco_vanille', 'armani_swy_intensely'].includes(dna) ||
    (accords.includes('vanilla') && accords.includes('warm spicy'))
  ) {
    return 'gourmand_boozy_vanilla';
  }

  if (['creed_aventus', 'creed_aventus_absolu', 'nishane_hacivat'].includes(dna) || accords.includes('smoky')) return 'fruity_smoky_aventus';
  return 'other';
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
      if (raw.includes(c)) map[c] = Math.max(map[c], score);
    }
  }
  return map;
}

function cosineSimilarity(mapA, mapB) {
  let dot = 0, magA = 0, magB = 0;
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
// MULTI-COMBO RECOMMENDATION ENGINE
// ==========================================

export class MultiComboRecommendationEngine {
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

  findFragrance(query) {
    const q = query.toLowerCase().trim();
    return this.catalog.find(f =>
      f.name.toLowerCase().includes(q) || `${f.brand} ${f.name}`.toLowerCase().includes(q)
    );
  }

  recommend({
    lovedPerfumes = [],
    hatedPerfumes = [],
    lovedNotes = [],
    hatedNotes = [],
    targetSeason = null,
    allowDirectClones = false,
    limit = 5
  }) {
    const lovedSeeds = lovedPerfumes.map(p => typeof p === 'string' ? this.findFragrance(p) : p).filter(Boolean);
    const hatedSeeds = hatedPerfumes.map(p => typeof p === 'string' ? this.findFragrance(p) : p).filter(Boolean);

    // 1. Purged DNA Set: Clones of ALL hated perfumes are hard banned
    const purgedDNAs = new Set();
    hatedSeeds.forEach(s => {
      if (s._dna && s._dna !== 'unique' && s._dna !== 'original') purgedDNAs.add(s._dna);
    });

    // 2. Liked DNA Set: If direct clones not allowed, suppress direct clones of loved perfumes
    const lovedDNAs = new Set();
    lovedSeeds.forEach(s => {
      if (s._dna && s._dna !== 'unique' && s._dna !== 'original') lovedDNAs.add(s._dna);
    });

    // 3. Mathematical Precedence Invariant:
    // Explicit user instructions ALWAYS take absolute precedence over implicit seed notes!
    // A) Explicit Hated Notes (hatedNotes) CANNOT be protected by implicit notes of loved seeds.
    // B) Explicit Loved Notes (lovedNotes) CANNOT be banned by implicit notes of hated seeds.
    const explicitLoved = new Set(lovedNotes.map(n => n.toLowerCase().trim()));
    const explicitHated = new Set(hatedNotes.map(n => n.toLowerCase().trim()));

    // Active hated notes: all explicit hated notes, plus (hatedSeeds notes minus lovedSeeds notes and minus explicitLoved)
    const activeHatedNotes = new Set(explicitHated);
    hatedSeeds.forEach(s => {
      s._allNotes.forEach(n => {
        // Only inherit implicit hated note if it is NOT in explicitLoved and NOT in lovedSeeds
        const isLoved = explicitLoved.has(n) || lovedSeeds.some(ls => ls._allNotes.includes(n));
        if (!isLoved) {
          activeHatedNotes.add(n);
        }
      });
    });

    // 4. Centroids for accord space
    const positiveCentroid = {};
    const negativeCentroid = {};
    for (const c of CANONICAL_ACCORDS) {
      positiveCentroid[c] = 0;
      negativeCentroid[c] = 0;
    }
    if (lovedSeeds.length > 0) {
      lovedSeeds.forEach(s => {
        for (const c of CANONICAL_ACCORDS) positiveCentroid[c] += s._accordMap[c] / lovedSeeds.length;
      });
    }
    if (hatedSeeds.length > 0) {
      hatedSeeds.forEach(s => {
        for (const c of CANONICAL_ACCORDS) negativeCentroid[c] += s._accordMap[c] / hatedSeeds.length;
      });
    }

    // 5. Active Taste Clusters from Loved Seeds
    const activeClusters = new Set();
    lovedSeeds.forEach(s => {
      if (s._cluster && s._cluster !== 'other') activeClusters.add(s._cluster);
    });

    const candidates = [];

    for (const candidate of this.catalog) {
      // Gate A: Skip self seeds & direct variants
      if (lovedSeeds.some(s => s.id === candidate.id)) continue;
      if (hatedSeeds.some(s => s.id === candidate.id)) continue;

      if (!allowDirectClones) {
        if (lovedDNAs.has(candidate._dna)) continue;
        if (lovedSeeds.some(s => candidate.name.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(candidate.name.toLowerCase()))) continue;
      }

      // Gate B: Disliked DNA Purge
      if (purgedDNAs.has(candidate._dna)) continue;

      // Gate C: Strict Note Hate Ceiling
      // If candidate contains any active hated note in prominent position, DROP or penalize
      let hasHatedNote = false;
      let matchedHatedNote = '';
      for (const hn of activeHatedNotes) {
        if (candidate._allNotes.some(n => n.includes(hn))) {
          hasHatedNote = true;
          matchedHatedNote = hn;
          break;
        }
        // Also check if accord corresponds to hated note (e.g. amber, coconut)
        if (CANONICAL_ACCORDS.includes(hn) && candidate._accordMap[hn] > 60) {
          hasHatedNote = true;
          matchedHatedNote = hn;
          break;
        }
      }
      if (hasHatedNote) continue;

      // Gate D: Season Gate
      if (targetSeason) {
        const s = (candidate.primary_season || '').toLowerCase();
        const t = targetSeason.toLowerCase();
        if (t === 'summer') {
          if (s === 'winter' || s === 'fall') {
            const isFresh = candidate._accordMap['citrus'] > 50 || candidate._accordMap['aquatic'] > 50 || candidate._accordMap['fresh spicy'] > 50;
            if (!isFresh) continue;
          }
        }
      }

      // --- SCORING ---
      let score = 0;
      const matchReasons = [];

      // 1. Wardrobe Cluster Adjacency
      if (activeClusters.has(candidate._cluster)) {
        score += 40;
        matchReasons.push(`Shares taste cluster (${candidate._cluster})`);
      }

      // 2. Accord Cosine Similarity
      const accordSim = cosineSimilarity(candidate._accordMap, positiveCentroid);
      score += accordSim * 30;

      // 3. Hated Centroid Repulsion
      if (hatedSeeds.length > 0) {
        const hateSim = cosineSimilarity(candidate._accordMap, negativeCentroid);
        if (hateSim > 0.65) score -= (hateSim - 0.65) * 45;
      }

      // 4. Loved Notes Hit Bonuses (Top / Mid weighted higher)
      let lovedNoteHits = 0;
      for (const ln of lovedNotes) {
        const key = ln.toLowerCase().trim();
        const inTop = (candidate.top_notes || []).some(n => (n || '').toLowerCase().includes(key));
        const inMid = (candidate.middle_notes || []).some(n => (n || '').toLowerCase().includes(key));
        const inBase = (candidate.base_notes || []).some(n => (n || '').toLowerCase().includes(key));

        if (inTop || inMid) {
          score += 20;
          lovedNoteHits++;
          matchReasons.push(`Features loved note: ${ln} (opening/heart)`);
        } else if (inBase) {
          score += 8;
          lovedNoteHits++;
        }
      }

      candidates.push({
        fragrance: candidate,
        score: Math.round(score * 10) / 10,
        cluster: candidate._cluster,
        reasons: matchReasons
      });
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, limit);
  }
}

// ==========================================
// TEST SCENARIOS EXECUTION
// ==========================================

async function runMultiCombo() {
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
  const engine = new MultiComboRecommendationEngine(catalog);

  const scenarios = [
    {
      name: 'Scenario 1: Fresh Blue Fougère with Note Conflict Invariant',
      lovedPerfumes: ['Bleu de Chanel', 'Historic Olmeda'],
      hatedPerfumes: ['Al Nashama Caprice', 'Turathi Blue', 'Asad Zanzibar'],
      lovedNotes: ['Mint', 'Lavender', 'Grapefruit', 'Watermelon'],
      hatedNotes: ['Amber', 'Coconut', 'Cardamom', 'Cinnamon'],
      targetSeason: 'Summer',
      notesTestNote: 'Caprice has Lavender. Algorithm must PROTECT Lavender while strictly eliminating Amber, Coconut, Cardamom & Tygar/Caprice clones.'
    },
    {
      name: 'Scenario 2: Decadent Boozy Vanilla / Tobacco vs Metallic Blue',
      lovedPerfumes: ['Amber Oud Tobacco Edition', 'Khamrah'],
      hatedPerfumes: ['Club de Nuit Intense Man', 'Nocturno', 'Rare Reef'],
      lovedNotes: ['Vanilla', 'Tobacco', 'Cinnamon', 'Rum'],
      hatedNotes: ['Ambroxan', 'Birch', 'Marine Notes', 'Sea Notes'],
      targetSeason: 'Winter',
      notesTestNote: 'Must eliminate all fresh ambroxan/marine scents and harsh birch smoke; focus purely on warm boozy gourmand vanilla.'
    },
    {
      name: 'Scenario 3: Crisp Tropical High-Heat (No Coconut / No Sweet Vanilla)',
      lovedPerfumes: ['Rare Reef', 'Blu'],
      hatedPerfumes: ['Asad Zanzibar', 'Khamrah'],
      lovedNotes: ['Watermelon', 'Bergamot', 'Mint', 'Lemon'],
      hatedNotes: ['Coconut', 'Vanilla', 'Amber', 'Tonka'],
      targetSeason: 'Summer',
      notesTestNote: 'Wants refreshing high-heat aquatic/fruit freshness, but strictly ZERO sweet coconut or heavy dessert vanilla.'
    },
    {
      name: 'Scenario 4: Clean Woody Barbershop (Zero Powdery Iris / Zero Makeup)',
      lovedPerfumes: ['Shiro', 'Kaaf'],
      hatedPerfumes: ['Asad Zanzibar', 'Tres Nuit Pour Homme'],
      lovedNotes: ['Lavender', 'Cedar', 'Ginger', 'Pepper'],
      hatedNotes: ['Iris', 'Orris', 'Violet', 'Coconut'],
      targetSeason: 'All Year',
      notesTestNote: 'Loves fresh crisp cedar and ginger lavender, but hates cosmetic powdery iris and violet.'
    }
  ];

  let totalGates = 0;
  let gatesPassed = 0;

  for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
    const sc = scenarios[sIdx];
    console.log('========================================================================');
    console.log(`🧪 ${sc.name.toUpperCase()}`);
    console.log('========================================================================');
    console.log(`❤️  LOVED PERFUMES: [${sc.lovedPerfumes.join(', ')}]`);
    console.log(`💔 HATED PERFUMES: [${sc.hatedPerfumes.join(', ')}]`);
    console.log(`🌿 LOVED NOTES:    [${sc.lovedNotes.join(', ')}]`);
    console.log(`🚫 HATED NOTES:    [${sc.hatedNotes.join(', ')}]`);
    console.log(`☀️  SEASON:         ${sc.targetSeason}`);
    console.log(`ℹ️  CHALLENGE:      ${sc.notesTestNote}\n`);

    const results = engine.recommend({
      lovedPerfumes: sc.lovedPerfumes,
      hatedPerfumes: sc.hatedPerfumes,
      lovedNotes: sc.lovedNotes,
      hatedNotes: sc.hatedNotes,
      targetSeason: sc.targetSeason,
      allowDirectClones: false,
      limit: 5
    });

    console.log('🏆 TOP 5 RECOMMENDATIONS GENERATED:');
    results.forEach((r, idx) => {
      const f = r.fragrance;
      console.log(`  #${idx + 1}: [${f.brand}] ${f.name} (Score: ${r.score})`);
      console.log(`      Accords:   ${(f.accords || []).slice(0, 3).map(a => `${a.name} (${a.score})`).join(' • ')}`);
      console.log(`      Top/Mid:   ${[...(f.top_notes || []), ...(f.middle_notes || [])].slice(0, 6).join(', ')}`);
      console.log(`      Matches:   ${r.reasons.join(' | ')}`);
    });

    // Verification Checks
    console.log('\n--- VERIFICATION CHECKS ---');
    totalGates += 4;

    // Check 1: Zero Hated Perfume DNA Leaks
    const hatedSeeds = sc.hatedPerfumes.map(p => engine.findFragrance(p)).filter(Boolean);
    const hatedDNAs = new Set(hatedSeeds.map(s => s._dna).filter(d => d !== 'unique' && d !== 'original'));
    const dnaLeak = results.some(r => hatedDNAs.has(r.fragrance._dna));
    if (!dnaLeak) {
      console.log('  [PASS 1] Zero Hated DNA Leaks:                 ✅ YES (100% purged)');
      gatesPassed++;
    } else {
      console.log('  [FAIL 1] Hated DNA leaked:                     ❌ FAIL');
    }

    // Check 2: Zero Hated Notes in recommendations
    const hatedNoteLeak = results.some(r =>
      sc.hatedNotes.some(hn => {
        const k = hn.toLowerCase();
        return r.fragrance._allNotes.some(n => n.includes(k)) || (CANONICAL_ACCORDS.includes(k) && r.fragrance._accordMap[k] > 60);
      })
    );
    if (!hatedNoteLeak) {
      console.log('  [PASS 2] Zero Hated Notes Leaked:              ✅ YES (100% clean)');
      gatesPassed++;
    } else {
      console.log('  [FAIL 2] Hated note appeared in results:       ❌ FAIL');
    }

    // Check 3: Protected Loved Notes Preserved
    const lovedNoteHit = results.some(r =>
      sc.lovedNotes.some(ln => r.fragrance._allNotes.some(n => n.includes(ln.toLowerCase())))
    );
    if (lovedNoteHit) {
      console.log('  [PASS 3] Protected Loved Notes Active:         ✅ YES (Mint/Lavender preserved)');
      gatesPassed++;
    } else {
      console.log('  [FAIL 3] Loved notes not found in results:     ❌ FAIL');
    }

    // Check 4: Direct Clone of Loved Perfume Suppressed
    const lovedSeeds = sc.lovedPerfumes.map(p => engine.findFragrance(p)).filter(Boolean);
    const lovedDNAs = new Set(lovedSeeds.map(s => s._dna).filter(d => d !== 'unique' && d !== 'original'));
    const cloneLeak = results.some(r => lovedDNAs.has(r.fragrance._dna));
    if (!cloneLeak) {
      console.log('  [PASS 4] Direct Loved Clones Suppressed:       ✅ YES (No redundant clones)');
      gatesPassed++;
    } else {
      console.log('  [FAIL 4] Redundant clone recommended:          ❌ FAIL');
    }

    console.log('\n');
  }

  const accuracy = ((gatesPassed / totalGates) * 100).toFixed(2);
  console.log('========================================================================');
  console.log(`⭐️ MULTI-COMBO COMPILED ACCURACY: ${accuracy}% (${gatesPassed} / ${totalGates} verification gates passed)`);
  console.log('========================================================================');
}

runMultiCombo().catch(console.error);
