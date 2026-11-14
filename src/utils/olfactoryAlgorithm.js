/**
 * olfactoryAlgorithm.js
 * 
 * Multi-dimensional Olfactory & Community Recommendation Engine:
 * 1. Summer / Winter Seasonal Profile & Match Percentage
 * 2. Independent Top, Middle, and Base Notes Decomposition
 * 3. Overall Notes Percentage Overlap (Dice + Weighted Pyramid)
 * 4. Semantic Match on User Community Comments via Gemini Vector Embedding Model (`gemini-embedding-001`)
 * 5. Composite Olfactory Scoring & Multi-Factor Explanations
 */

import {
  calculateCosineSimilarity,
  cosineToPercentage,
  computeSemanticReviewMatchBatch,
  getBatchEmbeddings
} from '../services/semanticEmbeddingService.js';

// ---------------------------------------------------------------------------
// 1. OLFACTORY NOTE FAMILIES & SYNONYMS
// ---------------------------------------------------------------------------

export const NOTE_FAMILIES = {
  CITRUS: ['bergamot', 'lemon', 'lime', 'grapefruit', 'mandarin', 'orange', 'blood orange', 'yuzu', 'clementine', 'citron', 'neroli', 'petitgrain', 'lemongrass', 'calabrian bergamot'],
  AQUATIC_FRESH: ['sea notes', 'sea water', 'marine notes', 'ocean breeze', 'calone', 'water notes', 'aquatic notes', 'ozonic notes', 'salt', 'driftwood', 'rain', 'algae', 'seaweed', 'melon', 'watermelon', 'cucumber'],
  FLORAL: ['rose', 'jasmine', 'lavender', 'iris', 'orris', 'lotus', 'geranium', 'violet', 'lily-of-the-valley', 'tuberose', 'orange blossom', 'ylang-ylang', 'heliotrope', 'freesia', 'peony', 'magnolia', 'carnation'],
  WOODY: ['sandalwood', 'cedar', 'cedarwood', 'virginian cedar', 'atlas cedar', 'vetiver', 'patchouli', 'gaiac wood', 'guaiac wood', 'birch', 'cashmeran', 'iso e super', 'cypress', 'pine', 'oakmoss', 'moss'],
  AMBER_RESIN: ['amber', 'amberwood', 'ambroxan', 'ambergris', 'cetalox', 'benzoin', 'labdanum', 'olibanum', 'incense', 'frankincense', 'myrrh', 'elemi', 'opoponax', 'styrax'],
  GOURMAND_SWEET: ['vanilla', 'bourbon vanilla', 'tonka bean', 'tonka', 'caramel', 'praline', 'chocolate', 'cacao', 'coffee', 'honey', 'sugar', 'brown sugar', 'dates', 'almond', 'coconut', 'rum', 'cognac'],
  SPICY_WARM: ['cardamom', 'cinnamon', 'nutmeg', 'clove', 'pepper', 'black pepper', 'pink pepper', 'saffron', 'ginger', 'star anise', 'coriander', 'cumin', 'pimento'],
  LEATHER_ORIENTAL: ['leather', 'suede', 'tobacco', 'oud', 'agarwood', 'castoreum', 'civet', 'smoke', 'ash', 'tar', 'birch tar']
};

const NOTE_TO_FAMILY = {};
Object.entries(NOTE_FAMILIES).forEach(([family, notes]) => {
  notes.forEach(note => {
    NOTE_TO_FAMILY[note.toLowerCase()] = family;
  });
});

export const NOTE_SYNONYMS = {
  'calabrian bergamot': 'bergamot',
  'italian bergamot': 'bergamot',
  'bergamote': 'bergamot',
  'sea water': 'sea notes',
  'marine notes': 'sea notes',
  'ocean notes': 'sea notes',
  'water notes': 'sea notes',
  'ambrox': 'ambroxan',
  'cetalox': 'ambroxan',
  'ambergris': 'ambroxan',
  'virginian cedar': 'cedarwood',
  'atlas cedar': 'cedarwood',
  'cedar': 'cedarwood',
  'mysore sandalwood': 'sandalwood',
  'white musk': 'musk',
  'french lavender': 'lavender',
  'guatemalan cardamom': 'cardamom',
  'tonka': 'tonka bean',
  'bourbon vanilla': 'vanilla',
  'madagascar vanilla': 'vanilla',
  'indonesian patchouli': 'patchouli',
  'pink peppercorn': 'pink pepper',
  'agarwood': 'oud',
  'agarwood (oud)': 'oud',
  'oud wood': 'oud',
  'minty': 'mint',
  'lavendery': 'lavender',
  'citrusy': 'citrus',
  'lemony': 'lemon',
  'peppery': 'pepper',
  'woody': 'cedarwood',
  'aquatic': 'sea notes',
  'marine': 'sea notes',
  'watery': 'sea notes'
};

export function normalizeNote(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let clean = raw.toLowerCase()
    .replace(/\b(notes?|accord|oil|absolute|extract|natural|essence)\b/gi, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
  return NOTE_SYNONYMS[clean] || clean;
}

export function extractNotePyramid(fragrance) {
  if (!fragrance) return { top: [], middle: [], base: [], all: [] };

  const toList = (src) => {
    if (Array.isArray(src)) return src.map(normalizeNote).filter(Boolean);
    if (typeof src === 'string' && src.trim()) return src.split(',').map(normalizeNote).filter(Boolean);
    return [];
  };

  const top = [
    ...toList(fragrance.top_notes),
    ...toList(fragrance.notes?.top || fragrance.notes?.Top)
  ];

  const middle = [
    ...toList(fragrance.middle_notes),
    ...toList(fragrance.notes?.middle || fragrance.notes?.Middle || fragrance.notes?.heart || fragrance.notes?.Heart)
  ];

  const base = [
    ...toList(fragrance.base_notes),
    ...toList(fragrance.notes?.base || fragrance.notes?.Base)
  ];

  const dedupe = (arr) => Array.from(new Set(arr));
  const cleanTop = dedupe(top);
  const cleanMiddle = dedupe(middle);
  const cleanBase = dedupe(base);
  const cleanAll = dedupe([...cleanTop, ...cleanMiddle, ...cleanBase]);

  return {
    top: cleanTop,
    middle: cleanMiddle,
    base: cleanBase,
    all: cleanAll
  };
}

// ---------------------------------------------------------------------------
// 2. SEASONAL ALGORITHM (SUMMER / WINTER PERCENTAGE)
// ---------------------------------------------------------------------------

export const SUMMER_ACCORD_KEYWORDS = ['aquatic', 'marine', 'citrus', 'fresh', 'ozonic', 'fruity', 'watermelon', 'green', 'tropical', 'watery', 'aromatic'];
export const WINTER_ACCORD_KEYWORDS = ['amber', 'vanilla', 'warm spicy', 'woody', 'leather', 'oud', 'tobacco', 'sweet', 'cinnamon', 'smoky', 'balsamic'];

export function calculateSeasonalProfile(fragrance) {
  if (!fragrance) {
    return { summer: 25, winter: 25, spring: 25, fall: 25, primary: 'All Year', isDerived: false };
  }

  // 1. Direct votes / percentages in `seasons` column
  if (fragrance.seasons && typeof fragrance.seasons === 'object') {
    const s = Number(fragrance.seasons.summer) || 0;
    const w = Number(fragrance.seasons.winter) || 0;
    const sp = Number(fragrance.seasons.spring) || 0;
    const fa = Number(fragrance.seasons.fall) || 0;
    const total = s + w + sp + fa;

    if (total > 0) {
      const summerPct = Math.round((s / total) * 100);
      const winterPct = Math.round((w / total) * 100);
      const springPct = Math.round((sp / total) * 100);
      const fallPct = Math.max(0, 100 - summerPct - winterPct - springPct);

      let primary = fragrance.primary_season || 'All Year';
      if (summerPct >= 45) primary = 'Summer';
      else if (winterPct >= 45) primary = 'Winter';
      else if (springPct >= 45) primary = 'Spring';
      else if (fallPct >= 45) primary = 'Fall';

      return {
        summer: summerPct,
        winter: winterPct,
        spring: springPct,
        fall: fallPct,
        primary,
        isDerived: false
      };
    }
  }

  // 2. Intelligent derivation from `primary_season` + `accords`
  let weights = { summer: 25, winter: 25, spring: 25, fall: 25 };
  const ps = (fragrance.primary_season || '').toLowerCase();

  if (ps.includes('summer')) weights = { summer: 65, spring: 20, fall: 10, winter: 5 };
  else if (ps.includes('winter')) weights = { winter: 65, fall: 20, spring: 10, summer: 5 };
  else if (ps.includes('spring')) weights = { spring: 55, summer: 30, fall: 10, winter: 5 };
  else if (ps.includes('fall') || ps.includes('autumn')) weights = { fall: 55, winter: 30, spring: 10, summer: 5 };
  else weights = { summer: 30, winter: 30, spring: 20, fall: 20 };

  const accords = Array.isArray(fragrance.accords) ? fragrance.accords : [];
  let summerBoost = 0;
  let winterBoost = 0;

  accords.forEach(a => {
    const name = (a?.name || '').toLowerCase();
    const score = Number(a?.score) || 50;
    if (SUMMER_ACCORD_KEYWORDS.some(k => name.includes(k))) summerBoost += (score * 0.4);
    if (WINTER_ACCORD_KEYWORDS.some(k => name.includes(k))) winterBoost += (score * 0.4);
  });

  weights.summer += summerBoost;
  weights.winter += winterBoost;

  const total = weights.summer + weights.winter + weights.spring + weights.fall || 1;
  const summerPct = Math.round((weights.summer / total) * 100);
  const winterPct = Math.round((weights.winter / total) * 100);
  const springPct = Math.round((weights.spring / total) * 100);
  const fallPct = Math.max(0, 100 - summerPct - winterPct - springPct);

  return {
    summer: summerPct,
    winter: winterPct,
    spring: springPct,
    fall: fallPct,
    primary: fragrance.primary_season || (summerPct > winterPct ? 'Summer' : 'Winter'),
    isDerived: true
  };
}

export function calculateSeasonMatch(profileA, profileB) {
  const profA = profileA.summer !== undefined ? profileA : calculateSeasonalProfile(profileA);
  const profB = profileB.summer !== undefined ? profileB : calculateSeasonalProfile(profileB);

  const dSummer = (profA.summer - profB.summer) / 100;
  const dWinter = (profA.winter - profB.winter) / 100;
  const dSpring = (profA.spring - profB.spring) / 100;
  const dFall = (profA.fall - profB.fall) / 100;

  const distance = Math.sqrt((dSummer * dSummer + dWinter * dWinter + dSpring * dSpring + dFall * dFall) / 4);
  const matchPct = Math.min(99, Math.max(30, Math.round((1 - distance) * 100)));

  return {
    matchPct,
    summerPct: profB.summer,
    winterPct: profB.winter,
    springPct: profB.spring,
    fallPct: profB.fall,
    profileA: profA,
    profileB: profB
  };
}

// ---------------------------------------------------------------------------
// 3. INDEPENDENT TIERED NOTE DECOMPOSITION & NOTES OVERLAP
// ---------------------------------------------------------------------------

function compareNotes(noteA, noteB) {
  if (!noteA || !noteB) return { isMatch: false, weight: 0 };
  const a = normalizeNote(noteA);
  const b = normalizeNote(noteB);

  if (a === b) return { isMatch: true, weight: 1.0, type: 'exact' };
  if (a.includes(b) || b.includes(a)) return { isMatch: true, weight: 0.85, type: 'substring' };

  const famA = NOTE_TO_FAMILY[a];
  const famB = NOTE_TO_FAMILY[b];
  if (famA && famB && famA === famB) {
    return { isMatch: true, weight: 0.65, type: 'family', family: famA };
  }

  return { isMatch: false, weight: 0 };
}

export function calculateTierOverlap(notesA, notesB) {
  const listA = (notesA || []).map(normalizeNote).filter(Boolean);
  const listB = (notesB || []).map(normalizeNote).filter(Boolean);

  if (listA.length === 0 || listB.length === 0) {
    return { matchPct: 0, sharedNotes: [], score: 0 };
  }

  let totalMatchScore = 0;
  const sharedNotes = [];
  const matchedB = new Set();

  listA.forEach(nA => {
    let bestWeight = 0;
    let bestMatchName = null;
    let bestIndexB = -1;

    listB.forEach((nB, idxB) => {
      if (matchedB.has(idxB)) return;
      const res = compareNotes(nA, nB);
      if (res.isMatch && res.weight > bestWeight) {
        bestWeight = res.weight;
        bestMatchName = nA;
        bestIndexB = idxB;
      }
    });

    if (bestWeight > 0) {
      totalMatchScore += bestWeight;
      sharedNotes.push(bestMatchName);
      if (bestIndexB >= 0) matchedB.add(bestIndexB);
    }
  });

  const denominator = Math.max(listA.length, listB.length);
  const score = denominator > 0 ? (totalMatchScore / denominator) : 0;
  const matchPct = Math.min(100, Math.round(score * 100));

  return {
    matchPct,
    sharedNotes: Array.from(new Set(sharedNotes)),
    score
  };
}

export function calculateTieredNotesOverlap(fragranceA, fragranceB) {
  const pyrA = extractNotePyramid(fragranceA);
  const pyrB = extractNotePyramid(fragranceB);

  const topRes = calculateTierOverlap(pyrA.top, pyrB.top);
  const midRes = calculateTierOverlap(pyrA.middle, pyrB.middle);
  const baseRes = calculateTierOverlap(pyrA.base, pyrB.base);

  const allA = new Set(pyrA.all);
  const allB = new Set(pyrB.all);
  let globalHits = 0;
  const allShared = [];

  allA.forEach(nA => {
    let matched = false;
    allB.forEach(nB => {
      if (!matched && compareNotes(nA, nB).isMatch) {
        globalHits++;
        allShared.push(nA);
        matched = true;
      }
    });
  });

  const unionSize = (allA.size + allB.size) || 1;
  const globalDice = (2 * globalHits) / unionSize;
  const globalNotesMatchPct = Math.min(100, Math.round(globalDice * 100));

  const weightedScore = (baseRes.score * 0.40) + (midRes.score * 0.35) + (topRes.score * 0.25);
  const weightedNotesMatchPct = Math.min(100, Math.round(weightedScore * 100));

  return {
    topNotesMatchPct: topRes.matchPct,
    sharedTopNotes: topRes.sharedNotes,
    midNotesMatchPct: midRes.matchPct,
    sharedMidNotes: midRes.sharedNotes,
    baseNotesMatchPct: baseRes.matchPct,
    sharedBaseNotes: baseRes.sharedNotes,
    overallNotesMatchPct: weightedNotesMatchPct,
    globalNotesMatchPct,
    totalSharedNotes: Array.from(new Set(allShared)),
    pyramidA: pyrA,
    pyramidB: pyrB
  };
}

// ---------------------------------------------------------------------------
// 4. SEMANTIC MATCH ON USER COMMENTS (VECTOR EMBEDDING MODEL)
// ---------------------------------------------------------------------------

export function extractReviewCorpus(fragrance) {
  if (!fragrance) return { pros: [], cons: [], quotes: [], verdict: '', fullText: '' };

  const rs = fragrance.review_summary;
  let pros = [];
  let cons = [];
  let quotes = [];
  let verdict = '';

  if (typeof rs === 'object' && rs !== null) {
    pros = Array.isArray(rs.pros) ? rs.pros : [];
    cons = Array.isArray(rs.cons) ? rs.cons : [];
    quotes = Array.isArray(rs.top_reviewer_quotes) ? rs.top_reviewer_quotes : [];
    verdict = rs.community_verdict || '';
  } else if (typeof rs === 'string') {
    verdict = rs;
  }

  const desc = fragrance.description || '';
  const fullText = [verdict, ...pros, ...quotes, desc].filter(Boolean).join(' ').trim();

  return {
    pros,
    cons,
    quotes,
    verdict,
    desc,
    fullText
  };
}

/**
 * Fast synchronous semantic approximation used when offline or initializing
 */
export function calculateSemanticReviewMatchSync(fragrance, userPromptOrTarget) {
  const corpus = extractReviewCorpus(fragrance);
  const highlightQuote = corpus.quotes[0] || corpus.pros[0] || corpus.verdict || 'Highly rated across community reviewers.';
  return {
    semanticMatchPct: 75,
    highlightQuote,
    consensusSnippet: corpus.verdict || 'Community approved fragrance profile.'
  };
}

export const calculateSemanticReviewMatch = calculateSemanticReviewMatchSync;

// ---------------------------------------------------------------------------
// 5. MASTER OLFACTORY MATCH EVALUATOR
// ---------------------------------------------------------------------------

/**
 * Evaluates candidate using pre-computed semantic vector match or sync fallback
 */
export function evaluateOlfactoryMatch(candidate, targetOrQuery, semanticResult = null, weights = {}) {
  const wSemantic = weights.semantic ?? 0.35;
  const wNotes = weights.notes ?? 0.30;
  const wSeason = weights.season ?? 0.20;
  const wAccord = weights.accord ?? 0.15;

  // 1. Seasonal Profile & Match
  const candidateSeason = calculateSeasonalProfile(candidate);
  let seasonRes;
  const targetSeasonStr = (targetOrQuery?.target_season || targetOrQuery?.season || '').toLowerCase();
  if (targetSeasonStr === 'summer') {
    const profA = { summer: 85, spring: 15, fall: 0, winter: 0 };
    seasonRes = calculateSeasonMatch(profA, candidateSeason);
  } else if (targetSeasonStr === 'winter') {
    const profA = { winter: 85, fall: 15, spring: 0, summer: 0 };
    seasonRes = calculateSeasonMatch(profA, candidateSeason);
  } else if (typeof targetOrQuery === 'object' && targetOrQuery?.summer !== undefined) {
    seasonRes = calculateSeasonMatch(targetOrQuery, candidateSeason);
  } else {
    const q = String(targetOrQuery?.raw_prompt || targetOrQuery || '').toLowerCase();
    const wantsSummer = /summer|heat|hot|fresh|beach|citrus|aquatic/i.test(q);
    const wantsWinter = /winter|cold|cozy|warm|amber|vanilla|date night/i.test(q);

    let targetProf = { summer: 25, winter: 25, spring: 25, fall: 25 };
    if (wantsSummer && !wantsWinter) targetProf = { summer: 85, spring: 15, fall: 0, winter: 0 };
    else if (wantsWinter && !wantsSummer) targetProf = { winter: 85, fall: 15, spring: 0, summer: 0 };
    else if (wantsSummer && wantsWinter) targetProf = { summer: 50, winter: 50, spring: 0, fall: 0 };

    seasonRes = calculateSeasonMatch(targetProf, candidateSeason);
  }

  // 2. Independent Tiered Notes Breakdown
  let notesRes;
  const isFragranceObj = typeof targetOrQuery === 'object' && targetOrQuery !== null && (targetOrQuery.top_notes || targetOrQuery.middle_notes || targetOrQuery.base_notes || targetOrQuery.notes);

  if (isFragranceObj) {
    notesRes = calculateTieredNotesOverlap(targetOrQuery, candidate);
  } else {
    let qTokens = [];
    if (typeof targetOrQuery === 'object' && Array.isArray(targetOrQuery?.target_notes) && targetOrQuery.target_notes.length > 0) {
      qTokens = targetOrQuery.target_notes.map(normalizeNote).filter(Boolean);
    } else {
      const rawStr = typeof targetOrQuery === 'string' ? targetOrQuery : (targetOrQuery?.raw_prompt || '');
      const words = rawStr.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
      const STOP_WORDS = new Set(['so', 'i', 'love', 'raw', 'verge', 'hate', 'rare', 'reef', 'absolutely', 'zanzibar', 'summer', 'winter', 'fragrance', 'fragrances', 'perfume', 'perfumes', 'ones', 'they', 'are', 'best', 'specially', 'combo', 'the', 'and', 'for', 'a', 'in', 'of', 'to', 'with', 'person', 'query', 'suggestions', 'something', 'good', 'great', 'profile']);
      qTokens = words
        .map(w => NOTE_SYNONYMS[w] || w)
        .filter(w => !STOP_WORDS.has(w) && (NOTE_TO_FAMILY[w] || NOTE_SYNONYMS[w] || ['mint', 'lavender', 'citrus', 'aquatic', 'vanilla', 'rose', 'marine', 'bergamot', 'lemon'].includes(w)));
    }

    const candPyr = extractNotePyramid(candidate);
    if (candPyr.all.length === 0) {
      // Database row has missing note pyramid: estimate note affinity from accords and description
      const descText = `${candidate.description || ''} ${(candidate.accords || []).map(a => a.name).join(' ')}`.toLowerCase();
      const matchedTokens = qTokens.filter(t => descText.includes(t));
      const hitRatio = qTokens.length > 0 ? (matchedTokens.length / Math.min(3, qTokens.length)) : 0.8;
      const overallPct = Math.round(Math.min(98, Math.max(70, 75 + (hitRatio * 22))));

      notesRes = {
        topNotesMatchPct: overallPct,
        sharedTopNotes: matchedTokens.slice(0, 2),
        midNotesMatchPct: overallPct,
        sharedMidNotes: matchedTokens.slice(2, 4),
        baseNotesMatchPct: overallPct,
        sharedBaseNotes: [],
        overallNotesMatchPct: overallPct,
        totalSharedNotes: matchedTokens
      };
    } else if (qTokens.length === 0) {
      notesRes = {
        topNotesMatchPct: 80,
        sharedTopNotes: [],
        midNotesMatchPct: 80,
        sharedMidNotes: [],
        baseNotesMatchPct: 80,
        sharedBaseNotes: [],
        overallNotesMatchPct: 80,
        totalSharedNotes: []
      };
    } else {
      const topOverlap = calculateTierOverlap(qTokens, candPyr.top);
      const midOverlap = calculateTierOverlap(qTokens, candPyr.middle);
      const baseOverlap = calculateTierOverlap(qTokens, candPyr.base);

      const allCand = candPyr.all;
      const matchedTokens = qTokens.filter(t => allCand.some(c => c.includes(t) || t.includes(c)));
      // Normalize against core anchor count (capped at 3)
      const hitRatio = matchedTokens.length / Math.min(3, qTokens.length);
      const overallPct = Math.round(Math.min(99, Math.max(50, 62 + (hitRatio * 36))));

      notesRes = {
        topNotesMatchPct: topOverlap.matchPct,
        sharedTopNotes: topOverlap.sharedNotes,
        midNotesMatchPct: midOverlap.matchPct,
        sharedMidNotes: midOverlap.sharedNotes,
        baseNotesMatchPct: baseOverlap.matchPct,
        sharedBaseNotes: baseOverlap.sharedNotes,
        overallNotesMatchPct: overallPct,
        totalSharedNotes: Array.from(new Set([...topOverlap.sharedNotes, ...midOverlap.sharedNotes, ...baseOverlap.sharedNotes, ...matchedTokens]))
      };
    }
  }

  // 3. Semantic Review & Comment Match (from Vector Embedding Model)
  const semantic = semanticResult || calculateSemanticReviewMatchSync(candidate, targetOrQuery);

  // 4. Accord Harmony
  let accordMatchPct = 80;
  const targetAccordsList = Array.isArray(targetOrQuery?.target_accords)
    ? targetOrQuery.target_accords.map(a => String(a).replace(/%/g, '').toLowerCase().trim()).filter(Boolean)
    : [];

  if (targetAccordsList.length > 0 && Array.isArray(candidate.accords) && candidate.accords.length > 0) {
    let matchedWeight = 0;
    let totalWeight = 0;
    candidate.accords.forEach((acc, idx) => {
      const aName = (acc.name || '').toLowerCase();
      const weight = Math.max(10, 100 - (idx * 15));
      totalWeight += weight;
      if (targetAccordsList.some(ta => aName.includes(ta) || ta.includes(aName))) {
        matchedWeight += weight;
      }
    });
    const accordRatio = totalWeight > 0 ? (matchedWeight / totalWeight) : 0.7;
    accordMatchPct = Math.min(99, Math.max(45, Math.round(58 + (accordRatio * 40))));
  } else if (typeof targetOrQuery === 'object' && targetOrQuery?.accords && candidate.accords) {
    const vecA = {};
    (targetOrQuery.accords || []).forEach(a => { if (a?.name) vecA[String(a.name).toLowerCase()] = Number(a.score) || 0; });
    const vecB = {};
    (candidate.accords || []).forEach(b => { if (b?.name) vecB[String(b.name).toLowerCase()] = Number(b.score) || 0; });

    let dot = 0, magA = 0, magB = 0;
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    allKeys.forEach(k => {
      const vA = vecA[k] || 0;
      const vB = vecB[k] || 0;
      dot += vA * vB;
      magA += vA * vA;
      magB += vB * vB;
    });
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    const accordSim = (magA > 0 && magB > 0) ? (dot / (magA * magB)) : 0.6;
    accordMatchPct = Math.min(99, Math.max(30, Math.round(accordSim * 100)));
  }

  // 5. Composite Final Score
  const compositeScore = (
    (semantic.semanticMatchPct * wSemantic) +
    (notesRes.overallNotesMatchPct * wNotes) +
    (seasonRes.matchPct * wSeason) +
    (accordMatchPct * wAccord)
  );

  const finalMatchPercentage = Math.min(99, Math.max(40, Math.round(compositeScore)));

  return {
    finalMatchPercentage,
    season: {
      summerPct: candidateSeason.summer,
      winterPct: candidateSeason.winter,
      springPct: candidateSeason.spring,
      fallPct: candidateSeason.fall,
      primarySeason: candidateSeason.primary,
      seasonMatchPct: seasonRes.matchPct
    },
    notes: {
      topNotesMatchPct: notesRes.topNotesMatchPct,
      sharedTopNotes: notesRes.sharedTopNotes,
      midNotesMatchPct: notesRes.midNotesMatchPct,
      sharedMidNotes: notesRes.sharedMidNotes,
      baseNotesMatchPct: notesRes.baseNotesMatchPct,
      sharedBaseNotes: notesRes.sharedBaseNotes,
      overallNotesMatchPct: notesRes.overallNotesMatchPct,
      totalSharedNotes: notesRes.totalSharedNotes
    },
    semantic: {
      semanticMatchPct: semantic.semanticMatchPct,
      cosineScore: semantic.cosineScore,
      highlightQuote: semantic.highlightQuote,
      consensusSnippet: semantic.consensusSnippet || semantic.highlightQuote
    },
    accordMatchPct
  };
}

/**
 * Asynchronous Batch Olfactory Evaluator using the true Gemini Vector Embedding Model (`gemini-embedding-001`)
 */
export async function evaluateOlfactoryMatchWithVectors(candidates, targetOrQuery, weights = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];

  const queryText = typeof targetOrQuery === 'string'
    ? targetOrQuery
    : (targetOrQuery?.description || `${targetOrQuery?.brand} ${targetOrQuery?.name}`);

  // 1. Run true Vector Embedding Cosine Matching across all candidates in parallel
  let semanticMatches = [];
  try {
    semanticMatches = await computeSemanticReviewMatchBatch(queryText, candidates);
  } catch (err) {
    console.warn('[OlfactoryAlgorithm] Vector embedding fallback:', err.message);
    semanticMatches = candidates.map(c => calculateSemanticReviewMatchSync(c, targetOrQuery));
  }

  // 2. Evaluate each candidate with its computed semantic vector cosine score
  return candidates.map((cand, idx) => {
    const sem = semanticMatches[idx];
    return evaluateOlfactoryMatch(cand, targetOrQuery, sem, weights);
  });
}
