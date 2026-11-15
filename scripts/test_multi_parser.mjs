const sentences = [
  'so i love raw, i love verge, i hate rare reef and absolutely hate zanzibar, love summer fragrances',
  'i tried 3 on this list, caprice was too ambery, maahir legacy was too dry, nocturno is too harsh',
  'tried tres nuit and al caprice, hated both',
  'i also absolutely love historic olmeda, and amalfi bleu',
  'so i love raw, verge, historic olmeda, and bleu de chanel, but i hate rare reef, turathi blue, zanzibar, caprice, and tres nuit'
];

function extractDeterministicDislikes(chatHistory) {
  const dislikes = new Set();
  const genericDislikeWords = new Set([
    'it', 'them', 'that', 'this', 'summer', 'winter', 'fragrance', 'fragrances',
    'perfume', 'perfumes', 'notes', 'scents', 'ones', 'one', 'clones', 'anything',
    'citrus', 'citruses', 'sweet', 'sweetness', 'vanilla', 'amber', 'aquatic',
    'marine', 'oud', 'leather', 'floral', 'flowers', 'rose', 'lavender', 'mint',
    'musk', 'fruits', 'fruity', 'gourmand', 'spices', 'spicy', 'cardamom',
    'pepper', 'wood', 'woody', 'fresh', 'freshness', 'powdery', 'smoke', 'smoky',
    'tobacco', 'heavy sweetness', 'overly sweet', 'too sweet', 'over citrusy',
    'sweet fragrances', 'citrus fragrances', 'sweet perfumes', 'heavy fragrances',
    'either', 'both', 'all', 'any'
  ]);

  const stopForHate = /(?:\b(?:but|however|though|although|while|whereas|love|loved|like|liked|favorite|own|suggest|recommend|give\s+me|find\s+me|show\s+me|looking|want|need)\b|[.!?;\n])/;

  for (const m of (chatHistory || [])) {
    const rawContent = (m.content || '').toLowerCase();
    const normalized = rawContent.replace(/([a-z])[;’`]+([a-z])/gi, "$1'$2").replace(/\b(?:absolutely|completely|totally|really|truly|strongly)\s+/gi, '');

    // Pattern 1: Verb + List of perfumes (e.g. hate X, Y, and Z)
    const re1 = new RegExp('\\b(?:didn\'?t\\s+like|did\\s+not\\s+like|don\'?t\\s+like|do\\s+not\\s+like|not\\s+a\\s+fan\\s+of|wasn\'?t\\s+a\\s+fan\\s+of|hate|hated|dislike|disliked|avoid|done\\s+with|sick\\s+of)\\b\\s+([\\s\\S]+?)(?=' + stopForHate.source + '|$)', 'gi');
    for (const match of normalized.matchAll(re1)) {
      const parts = match[1].split(/,|\band\b|&|\+/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an|also|both|all|i|and)\s+/gi, '').trim();
        term = term.replace(/^(?:hate|hated|dislike|disliked|avoid|done\s+with|didn'?t\s+like|don'?t\s+like)\s+/gi, '').trim();
        if (term && !genericDislikeWords.has(term) && term.length > 2) {
          dislikes.add(term);
        }
      }
    }

    // Pattern 2: [perfume] was too [adjective] / [perfume] is too [adjective]
    const re2 = /\b([a-z0-9\s]+?)\s+(?:was|is|found)\s+(?:too|overly|a\s+bit|super)\s+(?:ambery|sweet|dry|harsh|sharp|fruity|cloying|heavy|synthetic|bitter)/gi;
    for (const match of normalized.matchAll(re2)) {
      const parts = match[1].split(/,|\band\b/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an|but|and|i\s+tried|tried)\s+/gi, '').trim();
        if (term && !genericDislikeWords.has(term) && term.length > 2 && !term.includes('was ') && !term.includes('is ')) {
          dislikes.add(term);
        }
      }
    }

    // Pattern 3: tried [X, Y, Z] ... hated / didn't like
    const re3 = /(?:tried|wore|bought|tested)\s+([\s\S]+?)(?:\s+(?:and\s+)?(?:hated|didn'?t\s+like|disliked|not\s+good|missed\s+the\s+mark|didn'?t\s+work|disappointing|wasn'?t)|\s+but\s+|\.|\?|!|$)/gi;
    for (const match of normalized.matchAll(re3)) {
      const parts = match[1].split(/,|\band\b|&|\+/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an|both|either|all)\s+/gi, '').trim();
        if (term.includes('was ') || term.includes('is ') || term.includes('too ') || term.includes('found ')) continue;
        if (term && !genericDislikeWords.has(term) && term.length > 2 && !/\b(?:on\s+this\s+list|of\s+these|from\s+this|options|samples|\d+)\b/i.test(term)) {
          dislikes.add(term);
        }
      }
    }
  }

  return Array.from(dislikes);
}

function extractDeterministicLiked(chatHistory) {
  const liked = new Set();
  const genericWords = new Set([
    'it', 'them', 'that', 'this', 'summer', 'winter', 'fragrance', 'fragrances',
    'perfume', 'perfumes', 'notes', 'scents', 'ones', 'one', 'summer fragrances',
    'minty and lavendery ones', 'minty', 'lavendery', 'fresh', 'fresh ones'
  ]);

  const stopForLove = /(?:\b(?:but|however|though|although|while|whereas|hate|hated|dislike|disliked|didn'?t\s+like|don'?t\s+like|avoid|suggest|recommend|give\s+me|find\s+me|show\s+me|looking|want|need)\b|[.!?;\n])/;

  for (const m of (chatHistory || [])) {
    const text = (m.content || '').toLowerCase().replace(/([a-z])[;’`]+([a-z])/gi, "$1'$2");

    const re = new RegExp('\\b(?:love|loved|like|liked|own|have|wearing|favorite(?:\\s+is)?)\\b\\s+([\\s\\S]+?)(?=' + stopForLove.source + '|$)', 'gi');
    for (const match of text.matchAll(re)) {
      const parts = match[1].split(/,|\band\b|&|\+/);
      for (const p of parts) {
        let term = p.trim().replace(/^(?:the|a|an|also|both|all|i|and)\s+/gi, '').trim();
        term = term.replace(/^(?:love|loved|like|liked)\s+/gi, '').trim();
        if (term && !genericWords.has(term) && term.length > 2) {
          liked.add(term);
        }
      }
    }
  }
  return Array.from(liked);
}

for (const s of sentences) {
  console.log('INPUT:', s);
  console.log('  -> LIKED:   ', extractDeterministicLiked([{ content: s }]));
  console.log('  -> DISLIKED:', extractDeterministicDislikes([{ content: s }]));
  console.log('---');
}
