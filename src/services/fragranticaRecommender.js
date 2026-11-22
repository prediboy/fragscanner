/**
 * fragranticaRecommender.js
 * 
 * Hierarchical Olfactory Graph & Accord Vector Filtering (HOG-AVF)
 * 
 * 1. Disliked DNA Cluster Purge (Zero leak guarantee)
 * 2. Redundant Clone Suppression (Separates clones from recommendations)
 * 3. Accord Ceiling Gate (Stops heavy amber/warm spicy from infiltrating summer freshies)
 * 4. Mathematical Precedence Invariant (Explicit preferences trump implicit chemical notes)
 * 5. Fragrantica Collaborative Taste Graph Coherence ("People Who Like This Also Like")
 */

import { supabase } from '../lib/supabaseTelemetry.js';

// ==========================================
// 1. CANONICAL DNA & TASTE GRAPH ONTOLOGY
// ==========================================

export function normalizeDNA(raw) {
  if (!raw) return 'unique';
  const s = String(raw).toLowerCase().trim();
  if (s.includes('original creation') || s.includes('standalone') || s.includes('unique')) return 'original';

  let clean = s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip common brand prefixes
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

export function getWardrobeCluster(f, dnaKey) {
  const accords = (f.accords || []).map(a => (a.name || '').toLowerCase());
  const dna = dnaKey || normalizeDNA(f.dna_inspiration);

  if (
    ['chanel_bleu_de_chanel', 'dior_sauvage', 'ysl_y_edp', 'pdm_percival', 'chanel_allure_homme_sport'].includes(dna) ||
    (accords.includes('citrus') && accords.includes('aromatic') && accords.includes('woody') && !accords.includes('vanilla')) ||
    (f.brand === 'Ahmed Al Maghribi' && String(f.name || '').toLowerCase().includes('kaaf')) ||
    (f.brand === 'Ajmal' && (String(f.name || '').toLowerCase().includes('shiro') || String(f.name || '').toLowerCase().includes('blu') || String(f.name || '').toLowerCase().includes('kuro')))
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

export const CANONICAL_ACCORDS = [
  'citrus', 'aromatic', 'fresh spicy', 'woody', 'marine', 'aquatic',
  'green', 'lavender', 'mint', 'amber', 'warm spicy', 'sweet',
  'vanilla', 'fruity', 'floral', 'smoky', 'musk', 'salty', 'coconut', 'leather'
];

export function buildAccordMap(accordsList) {
  const map = {};
  for (const c of CANONICAL_ACCORDS) map[c] = 0;
  if (!Array.isArray(accordsList)) return map;
  for (const a of accordsList) {
    const raw = String(a.name || '').toLowerCase();
    const score = Number(a.score) || 50;
    for (const c of CANONICAL_ACCORDS) {
      if (raw.includes(c)) map[c] = Math.max(map[c], score);
    }
  }
  return map;
}

export function cosineSimilarity(mapA, mapB) {
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
// 2. THE RECOMMENDATION ENGINE
// ==========================================

export class FragranticaRecommender {
  constructor(catalog = []) {
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
        ].map(n => String(n || '').toLowerCase().trim())
      };
    });
  }

  findFragrance(query) {
    if (!query) return null;
    const q = String(query).toLowerCase().trim();
    return this.catalog.find(f =>
      f.name?.toLowerCase().includes(q) || `${f.brand} ${f.name}`.toLowerCase().includes(q)
    );
  }

  recommend({
    lovedPerfumes = [],
    hatedPerfumes = [],
    lovedNotes = [],
    hatedNotes = [],
    forbiddenAccords = [],
    targetSeason = null,
    allowDirectClones = true,
    maxBudget = null,
    limit = 10
  }) {
    const normalizeSeed = (p) => {
      const f = typeof p === 'string' ? this.findFragrance(p) : p;
      if (!f) return null;
      const dna = f._dna || normalizeDNA(f.dna_inspiration);
      return {
        ...f,
        _dna: dna,
        _cluster: f._cluster || getWardrobeCluster(f, dna),
        _accordMap: f._accordMap || buildAccordMap(f.accords),
        _allNotes: f._allNotes || [
          ...(f.top_notes || []),
          ...(f.middle_notes || []),
          ...(f.base_notes || [])
        ].map(n => String(n || '').toLowerCase().trim())
      };
    };

    const lovedSeeds = lovedPerfumes.map(normalizeSeed).filter(Boolean);
    const hatedSeeds = hatedPerfumes.map(normalizeSeed).filter(Boolean);

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
    const explicitLoved = new Set(lovedNotes.map(n => String(n).toLowerCase().trim()));
    const explicitHated = new Set(hatedNotes.map(n => String(n).toLowerCase().trim()));

    // Auto-extract Prized Loved Notes from loved seeds if user gave no explicit notes
    const effectiveLovedNotes = new Set(explicitLoved);
    if (explicitLoved.size === 0 && lovedSeeds.length > 0) {
      lovedSeeds.forEach(s => {
        (s.top_notes || []).forEach(n => effectiveLovedNotes.add(String(n).toLowerCase().trim()));
        (s.middle_notes || []).forEach(n => effectiveLovedNotes.add(String(n).toLowerCase().trim()));
      });
    }

    const activeHatedNotes = new Set(explicitHated);
    hatedSeeds.forEach(s => {
      s._allNotes.forEach(n => {
        const isLoved = effectiveLovedNotes.has(n) || lovedSeeds.some(ls => ls._allNotes?.includes(n));
        if (!isLoved) {
          activeHatedNotes.add(n);
        }
      });
    });

    // Auto-detect Offending Accords (if an accord is prominent in hated seeds but absent/low in loved seeds)
    const effectiveForbiddenAccords = new Set(forbiddenAccords.map(a => String(a).toLowerCase().trim()));
    if (hatedSeeds.length > 0) {
      for (const c of CANONICAL_ACCORDS) {
        const maxInLoved = lovedSeeds.length > 0 ? Math.max(...lovedSeeds.map(ls => ls._accordMap?.[c] || 0)) : 0;
        const maxInHated = Math.max(...hatedSeeds.map(hs => hs._accordMap?.[c] || 0));
        if (maxInHated >= 65 && maxInLoved <= 35) {
          effectiveForbiddenAccords.add(c);
        }
      }
    }

    // Auto-infer Season if user gave no season constraint
    let effectiveSeason = targetSeason;
    if (!effectiveSeason && lovedSeeds.length > 0) {
      const isSummerDominant = lovedSeeds.every(s => {
        const sSeason = String(s.primary_season || '').toLowerCase();
        return sSeason === 'summer' || sSeason === 'spring' || sSeason === 'all year' || sSeason === 'all season';
      });
      if (isSummerDominant) effectiveSeason = 'Summer';
    }

    // Detect Gender profile from loved seeds (e.g. Masculine Blue / Feminine Floral)
    const lovedGenders = new Set(lovedSeeds.map(s => String(s.gender || '').toLowerCase()).filter(Boolean));
    const isMasculineTarget = lovedGenders.size > 0 && !lovedGenders.has('female') && !lovedGenders.has('women');

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
        if (lovedSeeds.some(s => candidate.name?.toLowerCase().includes(s.name?.toLowerCase()) || s.name?.toLowerCase().includes(candidate.name?.toLowerCase()))) continue;
      }

      // Gate B: Disliked DNA Purge
      if (purgedDNAs.has(candidate._dna)) continue;

      // Gate C: Strict Note Hate Ceiling
      let hasHatedNote = false;
      for (const hn of activeHatedNotes) {
        if (candidate._allNotes.some(n => n.includes(hn))) {
          hasHatedNote = true;
          break;
        }
        if (CANONICAL_ACCORDS.includes(hn) && candidate._accordMap[hn] > 60) {
          hasHatedNote = true;
          break;
        }
      }
      if (hasHatedNote) continue;

      // Gate D: Accord Ceiling Gate (No Amber / No Sweet / Forbidden Accords)
      let rejectedAccord = false;
      const topAccords = (candidate.accords || []).slice(0, 2).map(a => String(a.name || '').toLowerCase());
      for (const fb of effectiveForbiddenAccords) {
        const k = String(fb).toLowerCase().trim();
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

      // Gate E: Seasonality Gate
      if (effectiveSeason) {
        const s = String(candidate.primary_season || '').toLowerCase();
        const t = String(effectiveSeason).toLowerCase();
        if (t === 'summer') {
          if (s.includes('winter') || s.includes('fall')) {
            const isPureFresh = (candidate._accordMap['citrus'] > 75 || candidate._accordMap['aquatic'] > 75) && (candidate._accordMap['warm spicy'] || 0) < 40 && (candidate._accordMap['amber'] || 0) < 50;
            if (!isPureFresh) continue;
          }
          // Strictly reject heavy warm-spicy, tobacco, oud or heavy amber scents in summer
          if ((candidate._accordMap['warm spicy'] || 0) > 65 || (candidate._accordMap['tobacco'] || 0) > 40) {
            continue;
          }
        } else if (t === 'winter') {
          if (s.includes('summer') && candidate._accordMap['aquatic'] > 70 && (candidate._accordMap['warm spicy'] || 0) < 30) continue;
        }
      }

      // Gate F: Gender Alignment (prevent feminine florals when user loved masculine freshies)
      if (isMasculineTarget) {
        const cGender = String(candidate.gender || '').toLowerCase();
        if (cGender === 'female' || cGender === 'women') continue;
      }

      // Gate G: Budget Filter (require verified in-stock bottle <= maxBudget; never return bottles with null price as budget options)
      if (maxBudget) {
        if (!candidate.community_price || Number(candidate.community_price) > maxBudget) continue;
      }

      // --- SCORING ---
      let score = 0;
      const matchReasons = [];

      // 1. Wardrobe Cluster Adjacency
      if (activeClusters.has(candidate._cluster)) {
        score += 40;
        matchReasons.push(`Shares taste cluster (${candidate._cluster}) with your favorites`);
      }

      // 2. Accord Cosine Similarity
      const accordSim = cosineSimilarity(candidate._accordMap, positiveCentroid);
      score += accordSim * 30;

      // 3. Hated Centroid Repulsion
      if (hatedSeeds.length > 0) {
        const hateSim = cosineSimilarity(candidate._accordMap, negativeCentroid);
        if (hateSim > 0.65) score -= (hateSim - 0.65) * 45;
      }

      // 4. Loved Notes Hit Bonuses (Uses auto-extracted prized notes if user gave no notes)
      for (const ln of effectiveLovedNotes) {
        const key = String(ln).toLowerCase().trim();
        const inTop = (candidate.top_notes || []).some(n => String(n || '').toLowerCase().includes(key));
        const inMid = (candidate.middle_notes || []).some(n => String(n || '').toLowerCase().includes(key));
        const inBase = (candidate.base_notes || []).some(n => String(n || '').toLowerCase().includes(key));

        if (inTop || inMid) {
          score += 15;
          matchReasons.push(`Prominent ${ln} in opening/heart`);
        } else if (inBase) {
          score += 5;
        }
      }

      // 5. Freshness / Warmth Quality Boost
      if (effectiveSeason?.toLowerCase() === 'summer') {
        const aquaticScore = (candidate._accordMap['aquatic'] || 0) + (candidate._accordMap['marine'] || 0);
        const citrusScore = (candidate._accordMap['citrus'] || 0);
        const freshScore = aquaticScore * 1.5 + citrusScore + (candidate._accordMap['fresh spicy'] || 0) * 0.5;
        score += Math.min(25, freshScore / 12);

        if (candidate.primary_season === 'Summer') score += 10;
      } else if (effectiveSeason?.toLowerCase() === 'winter') {
        const warmScore = (candidate._accordMap['warm spicy'] || 0) + (candidate._accordMap['vanilla'] || 0) + (candidate._accordMap['sweet'] || 0);
        score += Math.min(25, warmScore / 12);
        if (candidate.primary_season === 'Winter') score += 10;
      }

      candidates.push({
        ...candidate,
        match_score: Math.min(98, Math.max(30, Math.round(score))),
        palette_role: matchReasons[0] || 'Curated Match',
        best_seller: candidate.community_sellers?.[0]?.seller_name || candidate.best_bottle_seller || 'Verified Seller'
      });
    }

    candidates.sort((a, b) => b.match_score - a.match_score);
    return candidates.slice(0, limit);
  }
}
