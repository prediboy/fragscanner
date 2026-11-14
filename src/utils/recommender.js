// Olfactory similarity & recommendation logic

function toNoteList(val, fallback) {
  for (const src of [val, fallback]) {
    if (Array.isArray(src) && src.length > 0) return src.map(s => String(s || '').trim()).filter(Boolean);
    if (typeof src === 'string' && src.trim()) return src.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export function calculateAccordSimilarity(accordsA, accordsB) {
  const vecA = {};
  (Array.isArray(accordsA) ? accordsA : []).forEach(a => { if (a?.name) vecA[String(a.name).toLowerCase()] = Number(a.score) || 0; });
  const vecB = {};
  (Array.isArray(accordsB) ? accordsB : []).forEach(b => { if (b?.name) vecB[String(b.name).toLowerCase()] = Number(b.score) || 0; });

  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  if (allKeys.size === 0) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  allKeys.forEach(k => {
    const valA = vecA[k] || 0;
    const valB = vecB[k] || 0;
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  });

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

export function calculateNotesOverlap(notesA, notesB) {
  const setA = new Set(notesA.map(n => n.toLowerCase()));
  const setB = new Set(notesB.map(n => n.toLowerCase()));

  let intersectionCount = 0;
  setA.forEach(n => {
    if (setB.has(n)) intersectionCount++;
  });

  const unionSize = new Set([...setA, ...setB]).size;
  if (unionSize === 0) return 0;
  return intersectionCount / unionSize;
}

export function getFragranceRecommendations(targetId, allFragrances, limit = 6) {
  const emptyResult = { target: null, flankers: [], dnaTwins: [], topMatches: [] };
  if (!Array.isArray(allFragrances)) return emptyResult;
  
  const target = (typeof targetId === 'object' && targetId !== null)
    ? targetId
    : allFragrances.find(f => f.id === targetId);
    
  if (!target) return emptyResult;

  const targetNotes = [
    ...toNoteList(target.notes?.top, target.top_notes),
    ...toNoteList(target.notes?.middle, target.middle_notes),
    ...toNoteList(target.notes?.base, target.base_notes)
  ];

  const flankers = [];
  const dnaTwins = [];
  const scoredMatches = [];

  allFragrances.forEach(candidate => {
    if (candidate.id === target.id) return;

    // 1. Direct Flankers (same brand & series/collection, or explicit flankers link)
    const isFlanker = (
      (Array.isArray(target.flankers) && target.flankers.includes(candidate.id)) ||
      (candidate.brand === target.brand && candidate.collection && target.collection && candidate.collection === target.collection)
    );
    if (isFlanker) {
      flankers.push(candidate);
    }

    // 2. DNA Twins (inspired by same designer / profile)
    const targetInspiration = (target.dna_inspiration || '').toLowerCase();
    const candInspiration = (candidate.dna_inspiration || '').toLowerCase();
    
    // Check for matching inspiration substrings (e.g. "angels' share", "aventus", "sauvage", "ultra male")
    const isDirectTwin = (
      (targetInspiration && candInspiration && (
        targetInspiration.includes(candInspiration) || 
        candInspiration.includes(targetInspiration) ||
        (target.dna_twins && target.dna_twins.includes(candidate.id))
      ))
    );

    if (isDirectTwin) {
      dnaTwins.push(candidate);
    }

    // 3. Olfactory Accord & Note Match Computation
    const candidateNotes = [
      ...toNoteList(candidate.notes?.top, candidate.top_notes),
      ...toNoteList(candidate.notes?.middle, candidate.middle_notes),
      ...toNoteList(candidate.notes?.base, candidate.base_notes)
    ];

    const accordSim = calculateAccordSimilarity(target.accords || [], candidate.accords || []);
    const noteSim = calculateNotesOverlap(targetNotes, candidateNotes);
    const seasonMatch = target.primary_season === candidate.primary_season ? 1.0 : 0.6;

    // 60% Accord harmony, 28% Note identity, 12% Season match
    const overallScore = (accordSim * 0.60) + (noteSim * 0.28) + (seasonMatch * 0.12);
    const matchPercentage = Math.min(99, Math.max(35, Math.round(overallScore * 100)));

    const targetAccordsArr = Array.isArray(target.accords) ? target.accords : [];
    const candAccordsArr = Array.isArray(candidate.accords) ? candidate.accords : [];
    const sharedAccords = candAccordsArr
      .filter(ca => ca?.name && targetAccordsArr.some(ta => ta?.name && String(ta.name).toLowerCase() === String(ca.name).toLowerCase()))
      .map(a => a.name);

    const sharedNotes = candidateNotes.filter(cn => 
      targetNotes.some(tn => tn.toLowerCase() === cn.toLowerCase())
    );

    scoredMatches.push({
      fragrance: candidate,
      matchPercentage,
      sharedAccords,
      sharedNotes: Array.from(new Set(sharedNotes))
    });
  });

  // Sort by match percentage descending
  scoredMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return {
    target,
    flankers,
    dnaTwins,
    topMatches: scoredMatches.slice(0, limit)
  };
}
