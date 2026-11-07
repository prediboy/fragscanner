/**
 * FragScanner Semantic Search Engine
 * 
 * Provides intelligent, typo-tolerant, clone-aware, and note-aware
 * semantic search across all 11 community sellers.
 */

// 1. Curated Luxury DNA & Synonym Map
const DNA_SYNONYMS = {
  // Creed Aventus & Flankers
  'aventus': ['aventus', 'creed aventus', 'cdnim', 'club de nuit intense', 'supremacy not only intense', 'snoi', 'l\'aventure', 'laventure', 'cedrat boise', 'shaheen silver', 'hamidi addicted', 'vibrant leather', 'shuhrah avenoir'],
  'cdnim': ['aventus', 'club de nuit intense', 'armaf'],
  'snoi': ['aventus', 'supremacy not only intense', 'afnan'],
  
  // Dior Sauvage & Elixir
  'sauvage': ['sauvage', 'dior sauvage', 'sauvage elixir', 'asad', 'ventana', 'salvo', 'kuro', 'modest une', 'afnan modest'],
  'elixir': ['sauvage elixir', 'asad', 'le male elixir', 'odyssey elixir', 'mandarin sky elixir'],
  'asad': ['sauvage elixir', 'lattafa asad'],

  // Baccarat Rouge 540
  'baccarat': ['baccarat', 'br540', 'baccarat rouge', 'rouge 540', 'untold', 'baroque rouge', 'ana abiyedh rouge', 'amber oud rouge', 'cloud'],
  'br540': ['baccarat rouge 540', 'untold', 'baroque rouge', 'ana abiyedh rouge'],

  // Kilian Angels' Share
  'angels share': ['angels share', 'angel share', 'angels\' share', 'khamrah', 'khamrah qahwa', 'kismet magic', 'kismet angel', 'cocktail intense', 'sharaf blend', 'royal blend', 'boozy cognac'],
  'khamrah': ['angels share', 'lattafa khamrah', 'qahwa', 'dukhan', 'cinnamon gourmand'],
  'kismet': ['kismet magic', 'kismet angel', 'angels share'],

  // Bvlgari Tygar
  'tygar': ['tygar', 'bvlgari tygar', 'turathi blue', 'afnan turathi', 'al qiam silver', 'theoreme', 'rue broca theoreme', 'ambroxan grapefruit'],
  'turathi': ['tygar', 'turathi blue', 'afnan'],

  // Louis Vuitton (Imagination, Pacific Chill, Ombre Nomade, Afternoon Swim)
  'imagination': ['imagination', 'louis vuitton imagination', 'art of arabia', 'marwa', 'sunrise on the red sand dunes', 'black tea citrus'],
  'pacific chill': ['pacific chill', 'jean lowe immortal', 'pinnacle', 'california mint'],
  'ombre nomade': ['ombre nomade', 'jean lowe ombre', 'royal night', 'oud raspberry rose'],
  'afternoon swim': ['afternoon swim', 'jean lowe', 'aquatic orange'],

  // Parfums de Marly (Layton, Althair, Haltane, Delina, Carlisle)
  'layton': ['layton', 'detour noir', 'lalique white in black', 'al haramain detour', 'apple vanilla cardamome'],
  'althair': ['althair', 'liquid brun', 'french avenue liquid brun', 'bourbon vanilla praline'],
  'haltane': ['haltane', 'oud for greatness', 'bade\'e al oud', 'glory', 'for greatness'],
  'delina': ['delina', 'souvenir floral bouquet', 'club de nuit white imperiale', 'rose lychee'],

  // Tom Ford (Tobacco Vanille, Tuscan Leather, Ombre Leather, Lost Cherry)
  'tobacco vanille': ['tobacco vanille', 'amber oud tobacco', 'charuto tobacco', 'warm vanilla tobacco'],
  'lost cherry': ['lost cherry', 'cherry smoke', 'lovely cherry', 'lush cherry', 'insurrection red'],
  'ombre leather': ['ombre leather', 'tuscan leather', 'rare carbon', 'la yuqawam', 'velvet oud', 'leather'],
  'tuscan leather': ['tuscan leather', 'la yuqawam', 'rare carbon'],

  // Xerjoff (Naxos, Erba Pura)
  'naxos': ['naxos', '1821 sweet tobacco', 'voux elegante', 'honey lavender tobacco'],
  'erba pura': ['erba pura', 'amber oud gold', 'ana abiyedh', 'bharara king', 'fruity musk'],

  // Bleu de Chanel & Aqua di Gio
  'bleu de chanel': ['bleu de chanel', 'bdc', 'club de nuit iconic', 'turathi brown', 'blue de chance'],
  'bdc': ['bleu de chanel', 'iconic'],
  'adg': ['acqua di gio', 'profondo', 'profumo', 'suqraat', 'porto neroli'],
  'profondo': ['acqua di gio profondo', 'suqraat'],

  // YSL (Y EDP, Tuxedo, Babycat)
  'ysl y': ['ysl y', 'y edp', 'fakhar black', 'sheikh al shuyukh final', 'albait y'],
  'fakhar': ['ysl y', 'fakhar black', 'fakhar gold'],
  'tuxedo': ['tuxedo', 'the tux', 'rochas moustache', 'suits', 'patchouli amber'],
  'babycat': ['babycat', 'rifaaqat', 'bourbon vanilla suede'],

  // Rasasi Hawas Line
  'hawas': ['hawas', 'hawas ice', 'hawas fire', 'rasasi hawas', 'invictus aqua', 'plum aquatic'],
  'hawas fire': ['hawas fire', 'rasasi hawas fire'],
  'hawas ice': ['hawas ice', 'rasasi hawas ice']
};

// 2. Olfactory Vibe & Accords Mapping
const VIBE_KEYWORDS = {
  'fresh': ['citrus', 'aquatic', 'fresh', 'mint', 'bergamot', 'lemon', 'grapefruit', 'marine', 'sea notes', 'aromatic', 'blue'],
  'summer': ['citrus', 'aquatic', 'fresh', 'mint', 'grapefruit', 'marine', 'fruity'],
  'beastmode': ['long lasting', 'beastmode', 'oud', 'leather', 'amber', 'tobacco', 'spices', 'vanilla', 'smoky'],
  'winter': ['warm spicy', 'cinnamon', 'amber', 'vanilla', 'tobacco', 'coffee', 'leather', 'oud', 'gourmand'],
  'boozy': ['cognac', 'rum', 'whiskey', 'boozy', 'liquor', 'angels share'],
  'gourmand': ['sweet', 'vanilla', 'caramel', 'coffee', 'chocolate', 'praline', 'tonka'],
  'coffee': ['coffee', 'qahwa', 'dukhan', 'espresso', 'rochas man'],
  'office': ['iris', 'clean', 'vetiver', 'lavender', 'soapy', 'white musk', 'powdery', 'prada l\'homme'],
  'clean': ['iris', 'neroli', 'clean', 'lavender', 'white musk', 'linen'],
  'date': ['sweet', 'boozy', 'vanilla', 'cinnamon', 'amber', 'iris', 'plum', 'intense']
};

// 3. Normalize string (strip accents & special chars)
function normalize(str) {
  return (str || '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Score a fragrance against a query using semantic matching
 */
export function scoreFragranceSemantic(f, rawQuery) {
  const q = normalize(rawQuery);
  if (!q) return { score: 1, reason: null };

  const name = normalize(f.name);
  const brand = normalize(f.brand);
  const inspo = normalize(f.dna_inspiration);
  const collection = normalize(f.collection);
  const sellerNames = Array.isArray(f.community_sellers) ? f.community_sellers.map(s => normalize(s.seller_name)).join(' ') : '';
  const accords = Array.isArray(f.accords) ? f.accords.map(a => normalize(a.name)).join(' ') : '';
  const notes = f.notes && typeof f.notes === 'object' 
    ? Object.values(f.notes).flat().map(n => normalize(n)).join(' ') 
    : '';

  let score = 0;
  let reason = null;

  // 1. Direct Name Exact Match
  if (name === q) {
    return { score: 100, reason: 'Exact Name Match' };
  }
  if (name.includes(q)) {
    return { score: 85, reason: 'Direct Title Match' };
  }

  // 2. Direct Brand + Name Match (e.g. "rasasi hawas fire")
  const brandAndName = `${brand} ${name}`;
  if (brandAndName.includes(q)) {
    return { score: 80, reason: `${f.brand} Match` };
  }

  // 3. DNA Inspiration Match (e.g. searching "Aventus" matches CDNIM)
  if (inspo && inspo.includes(q)) {
    return { score: 75, reason: `Clones: ${f.dna_inspiration}` };
  }

  // 4. Synonym & Knowledge Graph Match
  for (const [key, synonyms] of Object.entries(DNA_SYNONYMS)) {
    const queryMatchesKey = q.includes(key) || synonyms.some(s => q.includes(s));
    if (queryMatchesKey) {
      // Check if this fragrance matches any synonym
      const fragMatches = synonyms.some(s => name.includes(s) || inspo.includes(s) || brand.includes(s));
      if (fragMatches) {
        return { score: 70, reason: `Matched DNA: ${key.toUpperCase()}` };
      }
    }
  }

  // 5. Olfactory Vibe / Accord Match (e.g. "summer freshie", "coffee", "beastmode")
  for (const [vibe, keywords] of Object.entries(VIBE_KEYWORDS)) {
    if (q.includes(vibe)) {
      const matchedKeyword = keywords.find(k => accords.includes(k) || notes.includes(k) || inspo.includes(k));
      if (matchedKeyword) {
        return { score: 60, reason: `Matches ${vibe.toUpperCase()} notes (${matchedKeyword})` };
      }
    }
  }

  // 6. Multi-Token Intersection (e.g. "lattafa fresh" or "afnan tygar")
  const tokens = q.split(' ').filter(t => t.length >= 2);
  if (tokens.length > 1) {
    let tokenMatches = 0;
    const combinedText = `${name} ${brand} ${inspo} ${accords} ${notes} ${sellerNames}`;
    tokens.forEach(t => {
      if (combinedText.includes(t)) tokenMatches++;
    });

    if (tokenMatches === tokens.length) {
      return { score: 65, reason: 'Matches all search terms' };
    }
    if (tokenMatches > 0 && tokenMatches >= tokens.length - 1) {
      return { score: 40, reason: 'Partial semantic match' };
    }
  }

  // 7. Individual Notes / Accords Match
  if (notes.includes(q) || accords.includes(q)) {
    return { score: 50, reason: `Note / Accord match: ${q}` };
  }

  return { score: 0, reason: null };
}

/**
 * Filter and rank catalog items semantically
 */
export function filterCatalogSemantically(items, query) {
  if (!query || !query.trim()) return items;

  const scored = [];
  for (const f of items) {
    const res = scoreFragranceSemantic(f, query);
    if (res.score > 0) {
      scored.push({
        fragrance: f,
        score: res.score,
        reason: res.reason
      });
    }
  }

  // Sort by match score descending
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => {
    // Attach match reason for card badges
    s.fragrance._semanticReason = s.reason;
    return s.fragrance;
  });
}
