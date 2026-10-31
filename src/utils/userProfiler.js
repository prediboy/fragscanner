// Multi-Dimensional Olfactory & Fragrantica Collaborative Recommender Engine (V3)
// Blends: Vector Cosine Accord Similarity, Tiered Pyramid Note Weighting (Base 3x, Mid 2x, Top 1x),
// Bidirectional Fragrantica Scent Twin Graph, Bayesian Community Ratings, Seasonal Alignment & Performance.

// Note normalizer to harmonize olfactory variations across houses
export function normalizeNote(note) {
  if (!note) return '';
  const l = note.toLowerCase().trim();
  if (l.includes('spearmint') || l.includes('peppermint') || l.includes('wild mint')) return 'mint';
  if (l.includes('ambroxan') || l.includes('ambergris')) return 'ambroxan';
  if (l.includes('lavender') || l.includes('wild lavender') || l.includes('sea lavender')) return 'lavender';
  if (l.includes('bergamot') || l.includes('calabrian bergamot')) return 'bergamot';
  if (l.includes('cedarwood') || l.includes('virginia cedar') || l.includes('atlas cedar')) return 'cedar';
  if (l.includes('sandalwood')) return 'sandalwood';
  if (l.includes('patchouli') || l.includes('indonesian patchouli')) return 'patchouli';
  if (l.includes('vetiver') || l.includes('haitian vetiver')) return 'vetiver';
  if (l.includes('cinnamon') || l.includes('cinnamon bark')) return 'cinnamon';
  if (l.includes('vanilla') || l.includes('bourbon vanilla')) return 'vanilla';
  return l;
}

export function analyzeLikedProfile(likedPerfumes) {
  if (!likedPerfumes || likedPerfumes.length === 0) return null;

  const accordWeights = {};
  const noteFrequency = {};
  const seasonWeights = { winter: 0, fall: 0, spring: 0, summer: 0 };
  let dayWeight = 0;
  let nightWeight = 0;
  let totalSeasonVotes = 0;

  const allLikedNotes = new Set();
  const likedNotesByLayer = {
    top: new Set(),
    middle: new Set(),
    base: new Set()
  };
  const likedDnas = new Set();
  const directTwinIds = new Set();
  const directFlankerIds = new Set();

  likedPerfumes.forEach(p => {
    // 1. Accords
    (p.accords || []).forEach(a => {
      const k = a.name.toLowerCase();
      accordWeights[k] = (accordWeights[k] || 0) + a.score;
    });

    // 2. Tiered Notes
    ['top', 'middle', 'base'].forEach(layer => {
      (p.notes?.[layer] || []).forEach(n => {
        const norm = normalizeNote(n);
        likedNotesByLayer[layer].add(norm);
        allLikedNotes.add(norm);
      });
    });

    // Deduplicate notes per perfume for frequency calculation
    const uniqueInPerfume = new Set([
      ...(p.notes?.top || []),
      ...(p.notes?.middle || []),
      ...(p.notes?.base || [])
    ].map(normalizeNote));
    uniqueInPerfume.forEach(norm => {
      noteFrequency[norm] = (noteFrequency[norm] || 0) + 1;
    });

    // 3. DNA & Target Lineage
    if (p.dna_inspiration) likedDnas.add(p.dna_inspiration.toLowerCase());
    if (p.dna_type) likedDnas.add(p.dna_type.toLowerCase());

    // 4. Fragrantica Collaborative Links
    (p.dna_twins || []).forEach(tid => directTwinIds.add(tid));
    (p.flankers || []).forEach(fid => directFlankerIds.add(fid));

    // 5. Seasons & Occasions
    if (p.seasons) {
      Object.entries(p.seasons).forEach(([s, val]) => {
        seasonWeights[s] = (seasonWeights[s] || 0) + val;
        totalSeasonVotes += val;
      });
    }
    if (p.day_night) {
      dayWeight += p.day_night.day || 50;
      nightWeight += p.day_night.night || 50;
    }
  });

  // Calculate User Accord Vector L2 Norm for Cosine Similarity
  let accordNormSq = 0;
  for (const k in accordWeights) {
    accordNormSq += accordWeights[k] * accordWeights[k];
  }
  const accordNorm = Math.sqrt(accordNormSq) || 1;

  // Calculate User Seasonal Vector L2 Norm
  let seasonNormSq = 0;
  for (const s in seasonWeights) {
    seasonNormSq += seasonWeights[s] * seasonWeights[s];
  }
  const seasonNorm = Math.sqrt(seasonNormSq) || 1;

  const topAccords = Object.entries(accordWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, weight]) => ({ name, weight }));

  const topNotes = Object.entries(noteFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([note]) => note);

  // Core Consensus Anchor Notes (present across 100% of user selections when 2+ perfumes chosen)
  const totalLiked = likedPerfumes.length;
  const signatureNotes = Object.entries(noteFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([note, count]) => ({
      note,
      count,
      isUniversal: totalLiked > 1 && count === totalLiked
    }));

  const universalNotes = signatureNotes.filter(s => s.isUniversal).map(s => s.note);

  return {
    topAccords,
    topNotes,
    accordWeights,
    accordNorm,
    likedNotesByLayer,
    signatureNotes,
    universalNotes,
    noteFrequency,
    allLikedNotes: Array.from(allLikedNotes),
    likedDnas: Array.from(likedDnas),
    directTwinIds,
    directFlankerIds,
    seasonWeights,
    seasonNorm,
    totalSeasonVotes,
    dayNightRatio: {
      day: Math.round(dayWeight / (likedPerfumes.length || 1)),
      night: Math.round(nightWeight / (likedPerfumes.length || 1))
    },
    count: likedPerfumes.length
  };
}

export function analyzeDislikedProfile(dislikedPerfumes) {
  if (!dislikedPerfumes || dislikedPerfumes.length === 0) return null;

  const accordWeights = {};
  const noteFrequency = {};
  const allDislikedNotes = new Set();
  const dislikedDnas = new Set();
  const dislikedTwinIds = new Set();

  dislikedPerfumes.forEach(p => {
    (p.accords || []).forEach(a => {
      const k = a.name.toLowerCase();
      accordWeights[k] = (accordWeights[k] || 0) + a.score;
    });

    const notes = [
      ...(p.notes?.top || []),
      ...(p.notes?.middle || []),
      ...(p.notes?.base || [])
    ];
    notes.forEach(n => {
      const lower = normalizeNote(n);
      noteFrequency[lower] = (noteFrequency[lower] || 0) + 1;
      allDislikedNotes.add(lower);
    });

    if (p.dna_inspiration) dislikedDnas.add(p.dna_inspiration.toLowerCase());
    if (p.dna_type) dislikedDnas.add(p.dna_type.toLowerCase());
    (p.dna_twins || []).forEach(tid => dislikedTwinIds.add(tid));
    (p.flankers || []).forEach(fid => dislikedTwinIds.add(fid));
  });

  const topDislikedAccords = Object.entries(accordWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, weight]) => ({ name, weight }));

  return {
    topDislikedAccords,
    allDislikedNotes: Array.from(allDislikedNotes),
    dislikedDnas: Array.from(dislikedDnas),
    dislikedTwinIds,
    count: dislikedPerfumes.length
  };
}

export function getProfileRecommendations(likedPerfumes = [], dislikedPerfumes = [], allFragrances = []) {
  const hasLikes = likedPerfumes && likedPerfumes.length > 0;
  const hasDislikes = dislikedPerfumes && dislikedPerfumes.length > 0;

  if (!hasLikes && !hasDislikes) {
    return { likes: [], sellerMatches: [], dislikes: [], likedProfile: null, dislikedProfile: null };
  }

  const likedProfile = analyzeLikedProfile(likedPerfumes);
  const dislikedProfile = analyzeDislikedProfile(dislikedPerfumes);

  // Exclude perfumes already chosen by user in either list and unverified placeholder stubs
  const chosenIds = new Set([
    ...likedPerfumes.map(p => p.id),
    ...dislikedPerfumes.map(p => p.id)
  ]);
  const candidates = allFragrances.filter(f => {
    if (chosenIds.has(f.id)) return false;
    // Exclude unverified community stubs with generic placeholder notes
    if (f.id.startsWith('st-9') && f.id !== 'st-9026' && f.description?.includes('Features aromatic accords with notes of Bergamot, Lavender and Amber')) {
      return false;
    }
    return true;
  });

  // Dominant tendency flags from likes
  const userHasSweetGourmand = likedProfile?.topAccords.some(a => ['sweet', 'vanilla', 'warm spicy'].includes(a.name));
  const userHasFreshAquatic = likedProfile?.topAccords.some(a => ['marine / aquatic', 'citrus', 'fresh spicy', 'aromatic'].includes(a.name));
  const userHasHeavyOudLeather = likedProfile?.topAccords.some(a => ['oud', 'leather', 'smoky'].includes(a.name));
  const userHasBarbershop = likedProfile?.topAccords.some(a => ['aromatic', 'green', 'lavender', 'earthy / oakmoss'].includes(a.name));

  const scoredList = candidates.map(candidate => {
    // Tiered candidate notes
    const cTop = (candidate.notes?.top || []).map(normalizeNote);
    const cMid = (candidate.notes?.middle || []).map(normalizeNote);
    const cBase = (candidate.notes?.base || []).map(normalizeNote);
    const candidateNotes = [...cTop, ...cMid, ...cBase];

    // ==================== 1. COSINE ACCORD SIMILARITY (0 to 35 pts) ====================
    let accordCosine = 0;
    const sharedLikedAccords = [];
    if (likedProfile) {
      let dotProduct = 0;
      let cNormSq = 0;
      (candidate.accords || []).forEach(ca => {
        const k = ca.name.toLowerCase();
        cNormSq += ca.score * ca.score;
        const userWeight = likedProfile.accordWeights[k];
        if (userWeight) {
          dotProduct += userWeight * ca.score;
          sharedLikedAccords.push(ca.name);
        }
      });
      const cNorm = Math.sqrt(cNormSq) || 1;
      accordCosine = dotProduct / (likedProfile.accordNorm * cNorm);
    }
    const accordScore = Math.min(35, Math.max(0, accordCosine * 35));

    // ==================== 2. TIERED PYRAMID NOTE MATCH (0 to 25 pts) ====================
    // Real fragrance physics: Base notes (3x weight - lingering drydown trail)
    // Heart notes (2x weight - body), Top notes (1x weight - opening)
    let notePts = 0;
    const matchedBaseNotes = [];
    const matchedMidNotes = [];
    const matchedTopNotes = [];
    const sharedLikedNotes = [];

    if (likedProfile) {
      cBase.forEach(n => {
        if (likedProfile.likedNotesByLayer.base.has(n) || likedProfile.allLikedNotes.includes(n)) {
          notePts += 3.0;
          matchedBaseNotes.push(n);
          if (!sharedLikedNotes.includes(n)) sharedLikedNotes.push(n);
        }
      });
      cMid.forEach(n => {
        if (likedProfile.likedNotesByLayer.middle.has(n) || likedProfile.allLikedNotes.includes(n)) {
          notePts += 2.0;
          matchedMidNotes.push(n);
          if (!sharedLikedNotes.includes(n)) sharedLikedNotes.push(n);
        }
      });
      cTop.forEach(n => {
        if (likedProfile.likedNotesByLayer.top.has(n) || likedProfile.allLikedNotes.includes(n)) {
          notePts += 1.0;
          matchedTopNotes.push(n);
          if (!sharedLikedNotes.includes(n)) sharedLikedNotes.push(n);
        }
      });
    }

    // Universal Consensus Anchor Notes (present across 100% of user selections)
    const universalNotes = likedProfile?.universalNotes || [];
    const matchedUniversalNotes = universalNotes.filter(un => candidateNotes.includes(un));
    const missedUniversalNotes = universalNotes.filter(un => !candidateNotes.includes(un));

    let universalBonus = 0;
    let missedUniversalPenalty = 0;
    if (universalNotes.length > 0 && likedPerfumes.length >= 2) {
      universalBonus = matchedUniversalNotes.length * 8; // bonus for anchor preservation
      if (matchedUniversalNotes.length === 0) {
        missedUniversalPenalty = 14; // soft dampener if user picked multiple perfumes and candidate drops all anchor notes
      } else if (missedUniversalNotes.length > 0) {
        missedUniversalPenalty = missedUniversalNotes.length * 4;
      }
    }
    const noteScore = Math.min(25, notePts * 1.5) + universalBonus - missedUniversalPenalty;

    // ==================== 3. FRAGRANTICA COLLABORATIVE FILTERING & LINEAGE GRAPH (0 to 30 pts) ====================
    let graphBonus = 0;
    // Bidirectional Scent Twin check:
    // Either liked perfume lists candidate as twin OR candidate lists liked perfume as twin!
    const isDirectTwin = likedProfile && (
      likedProfile.directTwinIds.has(candidate.id) ||
      (candidate.dna_twins && candidate.dna_twins.some(tid => likedPerfumes.some(lp => lp.id === tid)))
    );
    // Flanker relationship (sister perfume in the same line)
    const isFlanker = likedProfile && (
      likedProfile.directFlankerIds.has(candidate.id) ||
      (candidate.flankers && candidate.flankers.some(fid => likedPerfumes.some(lp => lp.id === fid)))
    );
    // Target Lineage match (e.g. both inspired by Creed Aventus, YSL Tuxedo, LV Imagination, GIT)
    const isTargetMatch = hasLikes && likedPerfumes.some(sp => 
      (sp.dna_inspiration && candidate.dna_inspiration && (
        sp.dna_inspiration.toLowerCase().includes(candidate.dna_inspiration.toLowerCase()) ||
        candidate.dna_inspiration.toLowerCase().includes(sp.dna_inspiration.toLowerCase())
      ))
    );

    let twinContext = '';
    if (isDirectTwin) {
      graphBonus += 25;
      const matchedLiked = likedPerfumes.find(lp => 
        (lp.dna_twins && lp.dna_twins.includes(candidate.id)) ||
        (candidate.dna_twins && candidate.dna_twins.includes(lp.id))
      );
      if (matchedLiked) {
        twinContext = `Direct Fragrantica Scent Twin to ${matchedLiked.brand} ${matchedLiked.name}`;
      }
    }
    if (isFlanker) {
      graphBonus += 16;
      if (!twinContext) twinContext = `Official Line Flanker to your selected collection`;
    }
    if (isTargetMatch) {
      graphBonus += 15;
    }
    graphBonus = Math.min(30, graphBonus);

    // ==================== 4. FRAGRANTICA BAYESIAN QUALITY MULTIPLIER (0 to 10 pts) ====================
    const votes = candidate.rating_count || 100;
    const rawR = candidate.rating_value || 4.15;
    // Prior threshold: 500 votes, prior mean: 4.20
    const bayesianRating = (votes * rawR + 500 * 4.20) / (votes + 500);
    const bayesBonus = Math.max(0, Math.min(10, (bayesianRating - 3.8) * 14));

    // ==================== 5. OCCASION & SEASONAL ALIGNMENT (0 to 8 pts) ====================
    let seasonBonus = 0;
    if (candidate.seasons && likedProfile?.totalSeasonVotes > 0) {
      let sDot = 0;
      let csNormSq = 0;
      for (const s in likedProfile.seasonWeights) {
        const cVal = candidate.seasons[s] || 0;
        csNormSq += cVal * cVal;
        sDot += likedProfile.seasonWeights[s] * cVal;
      }
      const csNorm = Math.sqrt(csNormSq) || 1;
      const seasonCosine = sDot / (likedProfile.seasonNorm * csNorm);
      seasonBonus = Math.min(8, Math.max(0, seasonCosine * 8));
    }

    // ==================== 6. LONGEVITY & SILLAGE PERFORMANCE (0 to 6 pts) ====================
    let perfBonus = 0;
    const longText = candidate.longevity || '';
    const silText = candidate.sillage || '';
    if (longText.includes('Eternal') || longText.includes('10+')) perfBonus += 4;
    else if (longText.includes('Long Lasting') || longText.includes('8')) perfBonus += 2.5;

    if (silText.includes('Enormous') || silText.includes('Room')) perfBonus += 2;
    else if (silText.includes('Strong')) perfBonus += 1.5;

    // ==================== 7. DUAL DISLIKE SHIELD & PENALTIES ====================
    let dislikePenalty = 0;
    const sharedDislikedAccords = [];
    const sharedDislikedNotes = [];
    let isDislikedDnaTwin = false;

    if (dislikedProfile) {
      // Direct twin of a disliked perfume? Immediate heavy disqualifier!
      isDislikedDnaTwin = dislikedProfile.dislikedTwinIds.has(candidate.id) ||
        dislikedPerfumes.some(dp => 
          (dp.dna_inspiration && candidate.dna_inspiration && (
            dp.dna_inspiration.toLowerCase().includes(candidate.dna_inspiration.toLowerCase()) ||
            candidate.dna_inspiration.toLowerCase().includes(dp.dna_inspiration.toLowerCase())
          ))
        );

      if (isDislikedDnaTwin) {
        dislikePenalty += 60;
      }

      // Accord overlap with disliked perfumes
      (candidate.accords || []).forEach(ca => {
        const match = dislikedProfile.topDislikedAccords.find(da => da.name.toLowerCase() === ca.name.toLowerCase());
        if (match) {
          dislikePenalty += (ca.score * match.weight) / 600;
          sharedDislikedAccords.push(ca.name);
        }
      });

      // Note overlap with disliked perfumes
      candidateNotes.forEach(cn => {
        if (dislikedProfile.allDislikedNotes.includes(cn)) {
          dislikePenalty += 10;
          sharedDislikedNotes.push(cn);
        }
      });
    }

    // Profile clash logic against liked wardrobe
    const clashReasons = [];
    let clashScoreRaw = 0;

    if (isDislikedDnaTwin) {
      clashReasons.push(`Shares identical DNA lineage with perfumes you marked as disliked (${candidate.dna_inspiration || 'Disliked Twin'}).`);
      clashScoreRaw += 50;
    }
    if (sharedDislikedAccords.length > 0) {
      clashReasons.push(`Heavy in accords from your avoid list: ${sharedDislikedAccords.slice(0, 3).join(', ')}.`);
      clashScoreRaw += Math.min(45, sharedDislikedAccords.length * 15);
    }
    if (sharedDislikedNotes.length > 0) {
      clashReasons.push(`Contains specific notes you marked as disliked: ${sharedDislikedNotes.slice(0, 3).join(', ')}.`);
      clashScoreRaw += Math.min(30, sharedDislikedNotes.length * 10);
    }

    if (hasLikes) {
      if (userHasFreshAquatic && !userHasHeavyOudLeather) {
        if ((candidate.accords || []).some(a => ['Oud', 'Smoky', 'Leather'].includes(a.name) && a.score >= 70)) {
          clashScoreRaw += 35;
          clashReasons.push('Heavy animalic oud/leather clashes with your clean, fresh aromatic wardrobe preference.');
        }
      }
      if (userHasFreshAquatic && !userHasSweetGourmand) {
        if ((candidate.accords || []).some(a => a.name === 'Lactonic / Milky' || (a.name === 'Sweet' && a.score > 90))) {
          clashScoreRaw += 30;
          clashReasons.push('Dense syrupy caramel/milky sweetness will feel heavy and cloying compared to your fresh choices.');
        }
      }
      if (userHasBarbershop && !userHasSweetGourmand) {
        if ((candidate.accords || []).some(a => a.name === 'Sweet' && a.score > 92)) {
          clashScoreRaw += 30;
          clashReasons.push('Extreme bubblegum sweetness contrasts with your clean aromatic barbershop preference.');
        }
      }
    }

    // ==================== NET MULTI-DIMENSIONAL SCORE ====================
    let rawAffinity = 0;
    if (hasLikes) {
      rawAffinity = accordScore + noteScore + graphBonus + bayesBonus + seasonBonus + perfBonus;
      rawAffinity = rawAffinity - (dislikePenalty * 0.9);
      rawAffinity = Math.max(10, Math.min(99, Math.round(rawAffinity)));
    } else {
      rawAffinity = Math.max(10, 85 - Math.round(dislikePenalty));
    }

    // Scale to Closest Match Out of 5.0
    const matchOutOfFive = Number((2.8 + (rawAffinity / 100) * 2.2).toFixed(1));
    const finalMatchOutOfFive = Math.min(5.0, Math.max(2.0, matchOutOfFive));
    const clashOutOfFive = Number(Math.min(5.0, Math.max(1.0, (clashScoreRaw / 22) + (5.0 - finalMatchOutOfFive * 0.65))).toFixed(1));

    // ==================== HUMAN-READABLE TRANSPARENT REASONS ====================
    const likeReasons = [];

    // 1. Direct Fragrantica Twin or Lineage
    if (twinContext) {
      likeReasons.push(`✨ ${twinContext} (${candidate.similarity_percentage || 92}% match).`);
    } else if (isTargetMatch) {
      likeReasons.push(`🧬 Shares identical DNA lineage (${candidate.dna_inspiration}).`);
    }

    // 2. Note Pyramid Drydown & Heart Alignment
    if (matchedUniversalNotes.length > 0) {
      const formatted = matchedUniversalNotes.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      likeReasons.push(`🌿 Preserves your consensus signature notes: ${formatted} (present in 100% of your selections).`);
    } else if (universalNotes.length > 0 && missedUniversalNotes.length > 0 && sharedLikedNotes.length > 0) {
      const formattedShared = sharedLikedNotes.slice(0, 3).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      const formattedMissed = missedUniversalNotes.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      likeReasons.push(`🌊 Fresh alternative: mirrors your secondary ${formattedShared} notes, swapping ${formattedMissed} for crisp modern tones.`);
    }

    if (matchedBaseNotes.length > 0) {
      const baseFormatted = matchedBaseNotes.slice(0, 3).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      likeReasons.push(`⏳ Drydown harmony: matches your preferred lingering base notes (${baseFormatted}).`);
    }

    // 3. Accord Vector Harmony Percentage
    if (accordCosine > 0.4) {
      const accordPct = Math.round(accordCosine * 100);
      likeReasons.push(`🎯 ${accordPct}% Accord Harmony: ${sharedLikedAccords.slice(0, 3).join(', ')}.`);
    }

    // 4. Fragrantica Proven Popularity & Performance
    likeReasons.push(`⭐ Fragrantica Community Rating: ${candidate.rating_value.toFixed(2)}/5 (${(candidate.rating_count/1000).toFixed(1)}k votes) • ${candidate.longevity || 'Long Lasting'}.`);

    return {
      fragrance: candidate,
      matchOutOfFive: finalMatchOutOfFive,
      clashOutOfFive,
      rawAffinity,
      clashScoreRaw,
      dislikePenalty,
      accordCosine,
      sharedLikedAccords,
      sharedLikedNotes,
      sharedDislikedAccords,
      sharedDislikedNotes,
      likeReasons,
      clashReasons
    };
  });

  // Section 1: "1. Best Match Overall" (Top Olfactory Scent Twin)
  const topLikes = [...scoredList]
    .filter(item => item.dislikePenalty < 35)
    .sort((a, b) => b.matchOutOfFive - a.matchOutOfFive || b.rawAffinity - a.rawAffinity)
    .slice(0, 8);

  // Section 2: "2. Best Match Available with Seller" (Verified In-Stock with Community Sellers: Second Theory / FragFever)
  const topSellerMatches = [...scoredList]
    .filter(item => item.dislikePenalty < 35 && Boolean(item.fragrance.in_seller_stock) && Boolean(item.fragrance.community_price))
    .sort((a, b) => b.matchOutOfFive - a.matchOutOfFive || b.rawAffinity - a.rawAffinity)
    .slice(0, 10);

  // Clash Warnings: "Top 5 Perfumes You Might Dislike / Avoid"
  const topDislikes = [...scoredList]
    .filter(item => item.clashReasons.length > 0 || item.dislikePenalty >= 20 || item.matchOutOfFive <= 3.7)
    .sort((a, b) => b.clashOutOfFive - a.clashOutOfFive || b.dislikePenalty - a.dislikePenalty || a.matchOutOfFive - b.matchOutOfFive)
    .slice(0, 5);

  return {
    likedProfile,
    dislikedProfile,
    likes: topLikes,
    sellerMatches: topSellerMatches,
    dislikes: topDislikes
  };
}
