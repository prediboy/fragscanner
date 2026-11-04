// Olfactory similarity & recommendation logic

export function calculateAccordSimilarity(accordsA, accordsB) {
  const vecA = {};
  accordsA.forEach(a => { vecA[a.name.toLowerCase()] = a.score; });
  const vecB = {};
  accordsB.forEach(b => { vecB[b.name.toLowerCase()] = b.score; });

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
  if (!Array.isArray(allFragrances)) return { flankers: [], dnaTwins: [], similarAccords: [] };
  const target = allFragrances.find(f => f.id === targetId);
  if (!target) return null;

  const targetNotes = [
    ...(target.notes?.top || []),
    ...(target.notes?.middle || []),
    ...(target.notes?.base || [])
  ];

  const flankers = [];
  const dnaTwins = [];
  const scoredMatches = [];

  allFragrances.forEach(candidate => {
    if (candidate.id === target.id) return;

    // 1. Direct Flankers (same brand & collection)
    if (candidate.brand === target.brand && candidate.collection && candidate.collection === target.collection) {
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
      ...(candidate.notes?.top || []),
      ...(candidate.notes?.middle || []),
      ...(candidate.notes?.base || [])
    ];

    const accordSim = calculateAccordSimilarity(target.accords || [], candidate.accords || []);
    const noteSim = calculateNotesOverlap(targetNotes, candidateNotes);
    const seasonMatch = target.primary_season === candidate.primary_season ? 1.0 : 0.6;

    // 60% Accord harmony, 28% Note identity, 12% Season match
    const overallScore = (accordSim * 0.60) + (noteSim * 0.28) + (seasonMatch * 0.12);
    const matchPercentage = Math.min(99, Math.max(35, Math.round(overallScore * 100)));

    const sharedAccords = (candidate.accords || [])
      .filter(ca => (target.accords || []).some(ta => ta.name.toLowerCase() === ca.name.toLowerCase()))
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
