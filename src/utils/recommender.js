// Olfactory similarity & recommendation logic powered by the multi-dimensional Olfactory Algorithm

import {
  calculateSeasonalProfile,
  calculateSeasonMatch,
  calculateTieredNotesOverlap,
  calculateSemanticReviewMatch,
  evaluateOlfactoryMatch,
  extractNotePyramid
} from './olfactoryAlgorithm.js';

export {
  calculateSeasonalProfile,
  calculateSeasonMatch,
  calculateTieredNotesOverlap,
  calculateSemanticReviewMatch,
  evaluateOlfactoryMatch,
  extractNotePyramid
};

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
  const setA = new Set((notesA || []).map(n => String(n).toLowerCase().trim()));
  const setB = new Set((notesB || []).map(n => String(n).toLowerCase().trim()));

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

    // 3. Multi-Factor Olfactory Match:
    // - Summer / Winter seasonal match
    // - Independent Top, Middle, Base note match percentages
    // - Notes percentage overlap
    // - Semantic match on user community comments
    const matchAnalysis = evaluateOlfactoryMatch(candidate, target, {
      accord: 0.25,
      notes: 0.35,
      season: 0.20,
      semantic: 0.20
    });

    const targetAccordsArr = Array.isArray(target.accords) ? target.accords : [];
    const candAccordsArr = Array.isArray(candidate.accords) ? candidate.accords : [];
    const sharedAccords = candAccordsArr
      .filter(ca => ca?.name && targetAccordsArr.some(ta => ta?.name && String(ta.name).toLowerCase() === String(ca.name).toLowerCase()))
      .map(a => a.name);

    scoredMatches.push({
      fragrance: candidate,
      matchPercentage: matchAnalysis.finalMatchPercentage,
      season: matchAnalysis.season,
      notes: matchAnalysis.notes,
      semantic: matchAnalysis.semantic,
      sharedAccords,
      sharedNotes: matchAnalysis.notes.totalSharedNotes || []
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
