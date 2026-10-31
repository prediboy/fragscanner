// User Profile & Dual-Preference Recommendation Engine: Mix & Match Likes, Filter Dislikes

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
  return l;
}

export function analyzeLikedProfile(likedPerfumes) {
  if (!likedPerfumes || likedPerfumes.length === 0) return null;

  const accordWeights = {};
  const noteFrequency = {};
  const seasonWeights = { winter: 0, fall: 0, spring: 0, summer: 0 };
  const allLikedNotes = new Set();
  const likedDnas = new Set();

  likedPerfumes.forEach(p => {
    // Accords
    (p.accords || []).forEach(a => {
      accordWeights[a.name] = (accordWeights[a.name] || 0) + a.score;
    });

    // Notes (normalized & deduplicated per perfume bottle)
    const notes = [
      ...(p.notes?.top || []),
      ...(p.notes?.middle || []),
      ...(p.notes?.base || [])
    ];
    const uniqueNotesInPerfume = new Set(notes.map(n => normalizeNote(n)));
    uniqueNotesInPerfume.forEach(norm => {
      noteFrequency[norm] = (noteFrequency[norm] || 0) + 1;
      allLikedNotes.add(norm);
    });

    // DNA
    if (p.dna_inspiration) likedDnas.add(p.dna_inspiration.toLowerCase());
    if (p.dna_type) likedDnas.add(p.dna_type.toLowerCase());

    // Seasons
    if (p.seasons) {
      Object.entries(p.seasons).forEach(([s, val]) => {
        seasonWeights[s] = (seasonWeights[s] || 0) + val;
      });
    }
  });

  const topAccords = Object.entries(accordWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, weight]) => ({ name, weight }));

  const topNotes = Object.entries(noteFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([note]) => note);

  // Core Consensus & Signature Notes (notes recurring across selections)
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
    signatureNotes,
    universalNotes,
    noteFrequency,
    allLikedNotes: Array.from(allLikedNotes),
    likedDnas: Array.from(likedDnas),
    seasonWeights,
    count: likedPerfumes.length
  };
}

export function analyzeDislikedProfile(dislikedPerfumes) {
  if (!dislikedPerfumes || dislikedPerfumes.length === 0) return null;

  const accordWeights = {};
  const noteFrequency = {};
  const allDislikedNotes = new Set();
  const dislikedDnas = new Set();

  dislikedPerfumes.forEach(p => {
    (p.accords || []).forEach(a => {
      accordWeights[a.name] = (accordWeights[a.name] || 0) + a.score;
    });

    const notes = [
      ...(p.notes?.top || []),
      ...(p.notes?.middle || []),
      ...(p.notes?.base || [])
    ];
    notes.forEach(n => {
      const lower = n.toLowerCase();
      noteFrequency[lower] = (noteFrequency[lower] || 0) + 1;
      allDislikedNotes.add(lower);
    });

    if (p.dna_inspiration) dislikedDnas.add(p.dna_inspiration.toLowerCase());
    if (p.dna_type) dislikedDnas.add(p.dna_type.toLowerCase());
  });

  const topDislikedAccords = Object.entries(accordWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, weight]) => ({ name, weight }));

  return {
    topDislikedAccords,
    allDislikedNotes: Array.from(allDislikedNotes),
    dislikedDnas: Array.from(dislikedDnas),
    count: dislikedPerfumes.length
  };
}

export function getProfileRecommendations(likedPerfumes = [], dislikedPerfumes = [], allFragrances = []) {
  const hasLikes = likedPerfumes && likedPerfumes.length > 0;
  const hasDislikes = dislikedPerfumes && dislikedPerfumes.length > 0;

  if (!hasLikes && !hasDislikes) {
    return { likes: [], dislikes: [], likedProfile: null, dislikedProfile: null };
  }

  const likedProfile = analyzeLikedProfile(likedPerfumes);
  const dislikedProfile = analyzeDislikedProfile(dislikedPerfumes);

  // Exclude perfumes already chosen by user in either list
  const chosenIds = new Set([
    ...likedPerfumes.map(p => p.id),
    ...dislikedPerfumes.map(p => p.id)
  ]);
  const candidates = allFragrances.filter(f => !chosenIds.has(f.id));

  // Dominant tendency flags from likes
  const userHasSweetGourmand = likedProfile?.topAccords.some(a => ['Sweet', 'Vanilla', 'Warm Spicy'].includes(a.name));
  const userHasFreshAquatic = likedProfile?.topAccords.some(a => ['Marine / Aquatic', 'Citrus', 'Fresh Spicy', 'Aromatic'].includes(a.name));
  const userHasHeavyOudLeather = likedProfile?.topAccords.some(a => ['Oud', 'Leather', 'Smoky'].includes(a.name));
  const userHasBarbershop = likedProfile?.topAccords.some(a => ['Aromatic', 'Green', 'Lavender', 'Earthy / Oakmoss'].includes(a.name));

  const scoredList = candidates.map(candidate => {
    const rawCandidateNotes = [
      ...(candidate.notes?.top || []),
      ...(candidate.notes?.middle || []),
      ...(candidate.notes?.base || [])
    ];
    const candidateNotes = rawCandidateNotes.map(n => normalizeNote(n));

    // 1. Calculate Accord Harmony with Liked Accords (Positive)
    let accordHarmony = 0;
    const sharedLikedAccords = [];
    if (likedProfile) {
      (candidate.accords || []).forEach(ca => {
        const match = likedProfile.topAccords.find(ta => ta.name.toLowerCase() === ca.name.toLowerCase());
        if (match) {
          accordHarmony += (ca.score * match.weight) / 1000;
          sharedLikedAccords.push(ca.name);
        }
      });
    }

    // 2. Shared notes with Liked Perfumes (Positive)
    const sharedLikedNotes = likedProfile 
      ? candidateNotes.filter(cn => likedProfile.allLikedNotes.includes(cn))
      : [];
    const noteOverlapScore = candidateNotes.length > 0 ? (sharedLikedNotes.length / candidateNotes.length) : 0;

    // 3. Consensus & Universal Signature Notes
    // Universal notes are notes present in 100% of the user's liked perfumes (e.g. Lavender & Patchouli)
    const universalNotes = likedProfile?.universalNotes || [];
    const matchedUniversalNotes = universalNotes.filter(un => candidateNotes.includes(un));
    const missedUniversalNotes = universalNotes.filter(un => !candidateNotes.includes(un));

    let universalBonus = 0;
    let missedUniversalPenalty = 0;
    if (universalNotes.length > 0) {
      // Strong boost for keeping the user's universal anchor notes
      universalBonus = matchedUniversalNotes.length * 14;
      // If user selected 2+ perfumes and candidate completely misses the universal anchor notes:
      if (matchedUniversalNotes.length === 0) {
        missedUniversalPenalty = 16;
      } else if (missedUniversalNotes.length > 0) {
        missedUniversalPenalty = missedUniversalNotes.length * 6;
      }
    }

    // 4. DNA Twin / Synergy with Liked Perfumes (Positive)
    const isLikedDnaTwin = hasLikes && likedPerfumes.some(sp => 
      (sp.dna_inspiration && candidate.dna_inspiration && (
        sp.dna_inspiration.toLowerCase().includes(candidate.dna_inspiration.toLowerCase()) ||
        candidate.dna_inspiration.toLowerCase().includes(sp.dna_inspiration.toLowerCase())
      )) ||
      (sp.dna_twins && sp.dna_twins.includes(candidate.id)) ||
      (sp.flankers && sp.flankers.includes(candidate.id))
    );

    // ==================== DISLIKE PENALTY & FILTERING ====================
    let dislikePenalty = 0;
    const sharedDislikedAccords = [];
    const sharedDislikedNotes = [];
    let isDislikedDnaTwin = false;

    if (dislikedProfile) {
      // Accord overlap with disliked perfumes
      (candidate.accords || []).forEach(ca => {
        const match = dislikedProfile.topDislikedAccords.find(da => da.name.toLowerCase() === ca.name.toLowerCase());
        if (match) {
          // Penalty proportional to candidate's prominence in the disliked accord
          dislikePenalty += (ca.score * match.weight) / 600;
          sharedDislikedAccords.push(ca.name);
        }
      });

      // Note overlap with disliked perfumes
      candidateNotes.forEach(cn => {
        if (dislikedProfile.allDislikedNotes.includes(cn)) {
          dislikePenalty += 12;
          sharedDislikedNotes.push(cn);
        }
      });

      // DNA Twin of a disliked perfume? Immediate heavy penalty!
      isDislikedDnaTwin = dislikedPerfumes.some(dp => 
        (dp.dna_inspiration && candidate.dna_inspiration && (
          dp.dna_inspiration.toLowerCase().includes(candidate.dna_inspiration.toLowerCase()) ||
          candidate.dna_inspiration.toLowerCase().includes(dp.dna_inspiration.toLowerCase())
        )) ||
        (dp.dna_twins && dp.dna_twins.includes(candidate.id)) ||
        (dp.flankers && dp.flankers.includes(candidate.id))
      );

      if (isDislikedDnaTwin) {
        dislikePenalty += 60;
      }
    }

    // ==================== CLASH REASONS (FOR SECTION 2) ====================
    const clashReasons = [];
    let clashScoreRaw = 0;

    // Direct overlap with user's explicitly disliked perfumes
    if (isDislikedDnaTwin) {
      clashReasons.push(`Shares identical DNA lineage with perfumes you marked as disliked (${candidate.dna_inspiration}).`);
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

    // Profile clash logic against liked wardrobe
    if (hasLikes) {
      if (userHasFreshAquatic && !userHasHeavyOudLeather) {
        if ((candidate.accords || []).some(a => ['Oud', 'Smoky', 'Leather'].includes(a.name) && a.score >= 70)) {
          clashScoreRaw += 35;
          clashReasons.push('Heavy dark animalic oud or smoky leather clashes with your preferred fresh aquatic clean aesthetic.');
        }
      }
      if (userHasFreshAquatic && !userHasSweetGourmand) {
        if ((candidate.accords || []).some(a => a.name === 'Lactonic / Milky' || (a.name === 'Sweet' && a.score > 90))) {
          clashScoreRaw += 30;
          clashReasons.push('Dense syrupy caramel/milky sweetness will feel heavy and cloying compared to your fresh choices.');
        }
      }
      if (userHasSweetGourmand && !userHasFreshAquatic) {
        if ((candidate.accords || []).some(a => ['Fresh / Inky', 'Earthy / Oakmoss', 'Green'].includes(a.name) && a.score > 75)) {
          clashScoreRaw += 30;
          clashReasons.push('Bitter green oakmoss or inky metallic notes clash with the comforting sweet warm vanilla you enjoy.');
        }
      }
      if (userHasBarbershop && !userHasSweetGourmand) {
        if ((candidate.accords || []).some(a => a.name === 'Sweet' && a.score > 92)) {
          clashScoreRaw += 30;
          clashReasons.push('Extreme bubblegum sweetness contrasts with your clean aromatic barbershop preference.');
        }
      }
    }

    // ==================== NET AFFINITY SCORE ====================
    let rawAffinity = 0;
    if (hasLikes) {
      rawAffinity = (accordHarmony * 1.5) + (noteOverlapScore * 30) + universalBonus - missedUniversalPenalty + (isLikedDnaTwin ? 30 : 0);
      // Deduct the dislike penalty directly to actively filter out what the user doesn't like!
      rawAffinity = rawAffinity - (dislikePenalty * 0.9);
      rawAffinity = Math.max(10, Math.min(99, Math.round(rawAffinity)));
    } else {
      // If user only checked disliked perfumes, recommendations are perfumes that avoid those accords!
      rawAffinity = Math.max(10, 85 - Math.round(dislikePenalty));
    }

    // Scale to Closest Match Out of 5.0 (e.g. 4.9, 4.8, 4.6, etc.)
    const matchOutOfFive = Number((2.8 + (rawAffinity / 100) * 2.2).toFixed(1));
    const finalMatchOutOfFive = Math.min(5.0, Math.max(2.0, matchOutOfFive));

    // Clash score out of 5.0
    const clashOutOfFive = Number(Math.min(5.0, Math.max(1.0, (clashScoreRaw / 22) + (5.0 - finalMatchOutOfFive * 0.65))).toFixed(1));

    // Human-readable Like reasons
    const likeReasons = [];
    if (isLikedDnaTwin) {
      likeReasons.push(`Shares identical DNA lineage with your liked perfumes (${candidate.dna_inspiration}).`);
    }
    if (matchedUniversalNotes.length > 0) {
      const formattedNotes = matchedUniversalNotes.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      likeReasons.push(`Preserves your consensus signature notes: ${formattedNotes} (present in 100% of your selections).`);
    } else if (universalNotes.length > 0 && missedUniversalNotes.length > 0 && sharedLikedNotes.length > 0) {
      const formattedShared = sharedLikedNotes.slice(0, 3).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      const formattedMissed = missedUniversalNotes.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      likeReasons.push(`Fresh alternative: mirrors your secondary ${formattedShared} notes, swapping ${formattedMissed} for crisp modern tones.`);
    }
    if (sharedLikedAccords.length > 0) {
      likeReasons.push(`Matches your loved accords: ${sharedLikedAccords.slice(0, 3).join(', ')}.`);
    }
    if (matchedUniversalNotes.length === 0 && sharedLikedNotes.length > 0) {
      const formattedNotes = sharedLikedNotes.slice(0, 3).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ');
      likeReasons.push(`Shares signature notes with your go-to scents: ${formattedNotes}.`);
    }
    if (hasDislikes && sharedDislikedNotes.length === 0 && sharedDislikedAccords.length === 0) {
      likeReasons.push(`Safely avoids the notes and profiles you marked as disliked.`);
    }
    likeReasons.push(`Fragrantica score: ${candidate.rating_value.toFixed(2)}/5 (${(candidate.rating_count/1000).toFixed(1)}k votes) • ${candidate.longevity}.`);

    return {
      fragrance: candidate,
      matchOutOfFive: finalMatchOutOfFive,
      clashOutOfFive,
      rawAffinity,
      clashScoreRaw,
      dislikePenalty,
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
    .filter(item => item.dislikePenalty < 35) // strictly exclude perfumes that carry high dislike baggage!
    .sort((a, b) => b.matchOutOfFive - a.matchOutOfFive || b.rawAffinity - a.rawAffinity)
    .slice(0, 5);

  // Section 2: "2. Best Match Available with Seller" (Verified In-Stock with Community Sellers: Second Theory / FragFever)
  const topSellerMatches = [...scoredList]
    .filter(item => item.dislikePenalty < 35 && Boolean(item.fragrance.in_seller_stock) && Boolean(item.fragrance.community_price))
    .sort((a, b) => b.matchOutOfFive - a.matchOutOfFive || b.rawAffinity - a.rawAffinity)
    .slice(0, 5);

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
