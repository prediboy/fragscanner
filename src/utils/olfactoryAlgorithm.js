/**
 * olfactoryAlgorithm.js
 * 
 * Multi-dimensional Olfactory & Community Recommendation Engine:
 * 1. Summer / Winter Seasonal Profile & Match Percentage
 * 2. Independent Top, Middle, and Base Notes Decomposition
 * 3. Overall Notes Percentage Overlap (Dice + Weighted Pyramid)
 * 4. Semantic Match on User Community Comments (Quotes, Pros, Cons, Verdict)
 * 5. Composite Olfactory Scoring & Multi-Factor Explanations
 */

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

// Map each note term to its canonical family key
const NOTE_TO_FAMILY = {};
Object.entries(NOTE_FAMILIES).forEach(([family, notes]) => {
  notes.forEach(note => {
    NOTE_TO_FAMILY[note.toLowerCase()] = family;
  });
});

// Common note aliases & botanical normalizations
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
  'oud wood': 'oud'
};

/**
 * Clean & normalize a note string
 */
export function normalizeNote(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let clean = raw.toLowerCase()
    .replace(/\b(notes?|accord|oil|absolute|extract|natural|essence)\b/gi, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
  return NOTE_SYNONYMS[clean] || clean;
}

/**
 * Extracts normalized lists for Top, Middle, and Base notes from any fragrance schema
 */
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

/**
 * Calculates accurate seasonal profile (Summer %, Winter %, Spring %, Fall %)
 * Works with both explicit `seasons` object and derives from `primary_season` + `accords`.
 */
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

/**
 * Calculates seasonal match percentage between two fragrances or a target season criteria
 */
export function calculateSeasonMatch(profileA, profileB) {
  const profA = profileA.summer !== undefined ? profileA : calculateSeasonalProfile(profileA);
  const profB = profileB.summer !== undefined ? profileB : calculateSeasonalProfile(profileB);

  // Euclidean distance normalized across 4 dimensions
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

/**
 * Checks if two note strings match either exactly or share an olfactory family
 */
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

/**
 * Calculates overlap for a single note tier (top, middle, or base)
 */
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

  // Jaccard / Dice overlap scaled
  const denominator = Math.max(listA.length, listB.length);
  const score = denominator > 0 ? (totalMatchScore / denominator) : 0;
  const matchPct = Math.min(100, Math.round(score * 100));

  return {
    matchPct,
    sharedNotes: Array.from(new Set(sharedNotes)),
    score
  };
}

/**
 * Calculates independent Top, Middle, and Base notes overlap + weighted composite
 */
export function calculateTieredNotesOverlap(fragranceA, fragranceB) {
  const pyrA = extractNotePyramid(fragranceA);
  const pyrB = extractNotePyramid(fragranceB);

  // 1. Independent tier analysis
  const topRes = calculateTierOverlap(pyrA.top, pyrB.top);
  const midRes = calculateTierOverlap(pyrA.middle, pyrB.middle);
  const baseRes = calculateTierOverlap(pyrA.base, pyrB.base);

  // 2. Global Notes Overlap (Set Dice coefficient across all combined notes)
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

  // 3. Weighted Olfactory Pyramid:
  // Base notes linger longest (40%), heart defines character (35%), top is initial impression (25%)
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
// 4. SEMANTIC MATCH ON USER COMMUNITY COMMENTS & REVIEWS
// ---------------------------------------------------------------------------

// High-value olfactory community descriptors & their semantic cluster mappings
export const SEMANTIC_COMMUNITY_THESAURUS = {
  beast_mode: {
    terms: ['beast mode', 'longevity', 'lasts all day', 'nuclear', 'projection', 'staying power', 'full workday', '8-10 hours', '10+ hours', 'monster performance'],
    sentiment: 'positive',
    category: 'performance'
  },
  smooth_opening: {
    terms: ['zero harshness', 'smooth opening', 'no chemical edge', 'natural smelling', 'zero harsh chemical edge', 'well blended', 'balanced blend', 'crisp and refreshing', 'sparkling'],
    sentiment: 'positive',
    category: 'quality'
  },
  harsh_screechy: {
    terms: ['screechy', 'synthetic', 'harsh opening', 'chemical', 'headache', 'alcohol blast', 'synthetic sharpness', 'sharpness', 'cloying', 'overbearing'],
    sentiment: 'negative',
    category: 'quality'
  },
  indian_summer: {
    terms: ['indian heat', 'high heat', 'summer heat', 'humid', 'humidity', 'sweat', 'refreshing', 'monsoon', 'cool down', 'refreshing watermelon'],
    sentiment: 'positive',
    category: 'climate'
  },
  office_versatile: {
    terms: ['office safe', 'daily driver', 'work wear', 'college', 'daily casual', 'signature scent', 'mass-appealing', 'mass appealing', 'versatile', 'inoffensive', 'crowd pleaser'],
    sentiment: 'positive',
    category: 'occasion'
  },
  date_night_warmth: {
    terms: ['date night', 'sexy', 'compliment monster', 'compliments consistently', 'intimate', 'cozy', 'warm embrace', 'gourmand', 'seductive', 'sweet vanilla'],
    sentiment: 'positive',
    category: 'occasion'
  },
  blind_buy_value: {
    terms: ['easy blind buy', 'safe blind buy', 'exceptional value', 'best value blind buy', 'smells expensive', 'worth every rupee', 'bang for buck'],
    sentiment: 'positive',
    category: 'value'
  }
};

/**
 * Extracts all textual reviewer signals into a unified searchable corpus
 */
export function extractReviewCorpus(fragrance) {
  if (!fragrance) return { pros: [], cons: [], quotes: [], verdict: '', fullText: '', fullPositiveText: '', fullNegativeText: '' };

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
  const fullPositiveText = [...pros, ...quotes, verdict, desc].filter(Boolean).join(' ');
  const fullNegativeText = cons.filter(Boolean).join(' ');
  const fullText = `${fullPositiveText} ${fullNegativeText}`.trim();

  return {
    pros,
    cons,
    quotes,
    verdict,
    desc,
    fullPositiveText,
    fullNegativeText,
    fullText
  };
}

/**
 * Semantic review matcher: scores how well candidate reviews match a user prompt or target profile
 */
export function calculateSemanticReviewMatch(fragrance, userPromptOrTarget) {
  const corpus = extractReviewCorpus(fragrance);
  if (!corpus.fullText) {
    return {
      semanticMatchPct: 70,
      matchedThemes: ['Community Approved'],
      highlightQuote: 'Balanced and verified by community reviewers.',
      consensusSnippet: 'Solid community rating.'
    };
  }

  let queryText = '';
  if (typeof userPromptOrTarget === 'string') {
    queryText = userPromptOrTarget.toLowerCase();
  } else if (userPromptOrTarget && typeof userPromptOrTarget === 'object') {
    const targetCorpus = extractReviewCorpus(userPromptOrTarget);
    queryText = targetCorpus.fullPositiveText.toLowerCase();
  }

  const posText = corpus.fullPositiveText.toLowerCase();
  const negText = corpus.fullNegativeText.toLowerCase();

  // 1. Semantic Thesaurus Cluster Matches
  let clusterScore = 0;
  const matchedThemes = [];
  const matchedKeywords = [];

  Object.entries(SEMANTIC_COMMUNITY_THESAURUS).forEach(([clusterKey, cluster]) => {
    // Check if query is looking for this theme
    const queryMentionsTheme = cluster.terms.some(t => queryText.includes(t.toLowerCase()));

    if (queryMentionsTheme || queryText.length < 10) {
      if (cluster.sentiment === 'positive') {
        const hasHit = cluster.terms.some(t => {
          if (posText.includes(t.toLowerCase())) {
            matchedKeywords.push(t);
            return true;
          }
          return false;
        });

        if (hasHit) {
          clusterScore += 1.5;
          matchedThemes.push(clusterKey.replace(/_/g, ' '));
        }
      } else if (cluster.sentiment === 'negative') {
        // If user specifically asked to AVOID this (e.g. "no screechy", "not harsh")
        const userAversion = /not|no|avoid|hate|dislike|zero/i.test(queryText);
        const perfumeHasFlaw = cluster.terms.some(t => negText.includes(t.toLowerCase()));

        if (userAversion && perfumeHasFlaw) {
          clusterScore -= 2.0; // Penalty for having the exact flaw user wants to avoid
        } else if (userAversion && posText.includes('zero harsh')) {
          clusterScore += 2.0; // Bonus: verified safe from that flaw!
          matchedThemes.push('Zero Harshness Verified');
        }
      }
    }
  });

  // 2. Token overlap with stop-word filtration
  const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'was', 'were', 'not', 'you', 'your', 'about', 'want', 'like', 'give', 'show', 'looking']);
  const queryTokens = queryText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  let tokenHits = 0;
  queryTokens.forEach(token => {
    if (posText.includes(token)) {
      tokenHits++;
      matchedKeywords.push(token);
    }
  });

  const tokenRatio = queryTokens.length > 0 ? (tokenHits / queryTokens.length) : 0.5;
  const rawSemantic = (tokenRatio * 60) + (Math.min(4, clusterScore) * 10);
  const semanticMatchPct = Math.min(99, Math.max(40, Math.round(rawSemantic)));

  // 3. Highlight Quote Finder: Select the best verbatim quote from actual reviewers
  let bestQuote = '';
  let bestScore = -1;
  const allCandidateQuotes = [...corpus.quotes, ...corpus.pros, corpus.verdict].filter(Boolean);

  allCandidateQuotes.forEach(q => {
    const qLower = q.toLowerCase();
    let score = 0;
    queryTokens.forEach(t => { if (qLower.includes(t)) score++; });
    if (qLower.includes('compliment') || qLower.includes('unbeatable') || qLower.includes('blown away')) score += 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestQuote = q;
    }
  });

  return {
    semanticMatchPct,
    matchedThemes: Array.from(new Set(matchedThemes)),
    matchedKeywords: Array.from(new Set(matchedKeywords)).slice(0, 6),
    highlightQuote: bestQuote || corpus.verdict || 'Highly regarded across community fragrance reviews.',
    consensusSnippet: corpus.verdict || 'Community approved fragrance profile.'
  };
}

// ---------------------------------------------------------------------------
// 5. MASTER OLFACTORY MATCH EVALUATOR
// ---------------------------------------------------------------------------

/**
 * Computes complete multi-dimensional olfactory match between target and candidate
 * Combines:
 * - Summer / Winter Seasonal Profile
 * - Independent Top, Middle, Base Notes Overlap
 * - Overall Notes Overlap
 * - Semantic Match on User Community Comments & Reviewer Quotes
 */
export function evaluateOlfactoryMatch(candidate, targetOrQuery, weights = {}) {
  const wSemantic = weights.semantic ?? 0.35;
  const wNotes = weights.notes ?? 0.30;
  const wSeason = weights.season ?? 0.20;
  const wAccord = weights.accord ?? 0.15;

  // 1. Seasonal Profile & Match
  const candidateSeason = calculateSeasonalProfile(candidate);
  let seasonRes;
  if (typeof targetOrQuery === 'object' && targetOrQuery !== null && !Array.isArray(targetOrQuery)) {
    seasonRes = calculateSeasonMatch(targetOrQuery, candidateSeason);
  } else {
    // If target is text (e.g. user search prompt)
    const q = String(targetOrQuery || '').toLowerCase();
    const wantsSummer = /summer|heat|hot|fresh|beach|citrus|aquatic/i.test(q);
    const wantsWinter = /winter|cold|cozy|warm|amber|vanilla|date night/i.test(q);

    let targetProf = { summer: 25, winter: 25, spring: 25, fall: 25 };
    if (wantsSummer && !wantsWinter) targetProf = { summer: 80, spring: 15, fall: 5, winter: 0 };
    else if (wantsWinter && !wantsSummer) targetProf = { winter: 80, fall: 15, spring: 5, summer: 0 };
    else if (wantsSummer && wantsWinter) targetProf = { summer: 50, winter: 50, spring: 0, fall: 0 };

    seasonRes = calculateSeasonMatch(targetProf, candidateSeason);
  }

  // 2. Independent Tiered Notes Breakdown
  let notesRes;
  if (typeof targetOrQuery === 'object' && targetOrQuery !== null) {
    notesRes = calculateTieredNotesOverlap(targetOrQuery, candidate);
  } else {
    // If target is text query, extract mentioned notes
    const qTokens = String(targetOrQuery || '').split(/[,\s]+/).map(normalizeNote).filter(Boolean);
    const candPyr = extractNotePyramid(candidate);
    const topOverlap = calculateTierOverlap(qTokens, candPyr.top);
    const midOverlap = calculateTierOverlap(qTokens, candPyr.middle);
    const baseOverlap = calculateTierOverlap(qTokens, candPyr.base);

    notesRes = {
      topNotesMatchPct: topOverlap.matchPct,
      sharedTopNotes: topOverlap.sharedNotes,
      midNotesMatchPct: midOverlap.matchPct,
      sharedMidNotes: midOverlap.sharedNotes,
      baseNotesMatchPct: baseOverlap.matchPct,
      sharedBaseNotes: baseOverlap.sharedNotes,
      overallNotesMatchPct: Math.round((baseOverlap.matchPct * 0.4) + (midOverlap.matchPct * 0.35) + (topOverlap.matchPct * 0.25)),
      totalSharedNotes: Array.from(new Set([...topOverlap.sharedNotes, ...midOverlap.sharedNotes, ...baseOverlap.sharedNotes]))
    };
  }

  // 3. Semantic Review & Comment Match
  const semanticRes = calculateSemanticReviewMatch(candidate, targetOrQuery);

  // 4. Accord Harmony (if target has accords)
  let accordMatchPct = 75;
  if (typeof targetOrQuery === 'object' && targetOrQuery?.accords && candidate.accords) {
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
    (semanticRes.semanticMatchPct * wSemantic) +
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
      semanticMatchPct: semanticRes.semanticMatchPct,
      matchedThemes: semanticRes.matchedThemes,
      matchedKeywords: semanticRes.matchedKeywords,
      highlightQuote: semanticRes.highlightQuote,
      consensusSnippet: semanticRes.consensusSnippet
    },
    accordMatchPct
  };
}
