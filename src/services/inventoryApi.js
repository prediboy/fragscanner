import { supabase } from '../lib/supabaseTelemetry.js';
import curatedData from '../data/curated_highlights.json';

// In-memory LRU cache to make repeat page visits 0ms instant
const pageCache = new Map();

const ACRONYMS = {
  cdnim: 'club de nuit intense man',
  snoi: 'supremacy not only intense',
  sno: 'supremacy not only intense',
  bdc: 'bleu de chanel',
  br540: 'baccarat rouge',
  swy: 'stronger with you',
  adg: 'acqua di gio',
  dhi: 'dior homme intense',
  dhp: 'dior homme parfum',
  ysl: 'yves saint laurent',
  jpg: 'jean paul gaultier',
  tf: 'tom ford',
  cdni: 'club de nuit intense'
};

const TYPO_MAP = {
  latfa: 'lattafa',
  latafa: 'lattafa',
  lataffa: 'lattafa',
  rasai: 'rasasi',
  rasas: 'rasasi',
  armaff: 'armaf',
  suvage: 'sauvage',
  sauvge: 'sauvage',
  savarge: 'sauvage',
  aventus: 'aventus',
  avntus: 'aventus',
  khamra: 'khamrah',
  kamrah: 'khamrah',
  havas: 'hawas',
  hawaas: 'hawas'
};

export function normalizeQuery(raw) {
  let q = (raw || '').trim().toLowerCase();
  for (const [abbr, expansion] of Object.entries(ACRONYMS)) {
    const reg = new RegExp(`\\b${abbr}\\b`, 'gi');
    q = q.replace(reg, expansion);
  }
  const tokens = q.split(/\s+/).filter(Boolean).map(t => TYPO_MAP[t] || t);
  return tokens;
}

function scoreRelevance(item, tokens) {
  let score = 0;
  const name = (item.name || '').toLowerCase();
  const brand = (item.brand || '').toLowerCase();
  const dna = (item.dna_inspiration || '').toLowerCase();
  const words = name.split(/\s+/);

  for (const t of tokens) {
    if (brand === t) score += 60;
    else if (brand.startsWith(t)) score += 40;
    else if (brand.includes(t)) score += 15;

    if (name === t) score += 150;
    else if (name.startsWith(t)) score += 120;
    else if (words.some(w => w === t)) score += 100;
    else if (words.some(w => w.startsWith(t))) score += 80;
    else if (name.includes(t)) score += 15;

    if (dna.includes(t)) score += 35;
  }
  if (item.in_seller_stock && Number(item.community_price) > 0) score += 20;
  return score;
}

/**
 * Fetch a single page of inventory on demand from Supabase.
 * Loads strictly 24 items per page rather than downloading the entire 8MB catalog.
 */
export async function fetchInventoryPage({
  page = 1,
  pageSize = 24,
  search = '',
  seller = 'all',
  formats = ['retail'],
  maxBudget = 15000,
  sortBy = 'price_asc',
  dealsOnly = null
} = {}) {
  const tokens = normalizeQuery(search);
  const cleanSearch = tokens.join(' ');
  const cacheKey = `${page}_${pageSize}_${cleanSearch}_${seller}_${(formats || []).slice().sort().join(',')}_${maxBudget}_${sortBy}_${dealsOnly || ''}`;

  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey);
  }

  // Handle dealsOnly tabs (drops and new arrivals) directly from curated data
  if (dealsOnly === 'drops' || dealsOnly === 'new') {
    const sourceList = dealsOnly === 'drops' ? (curatedData.topPriceDrops || []) : (curatedData.newArrivals || []);
    let filtered = sourceList.filter(f => {
      if (seller && seller !== 'all') {
        const inB = Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.seller_id === seller && Number(s.price) > 0);
        const inD = Array.isArray(f.community_decants) && f.community_decants.some(d => d.seller_id === seller);
        if (!inB && !inD) return false;
      }
      if (maxBudget < 15000 && Number(f.community_price || 999999) > maxBudget) return false;
      if (tokens.length > 0) {
        const n = (f.name || '').toLowerCase();
        const b = (f.brand || '').toLowerCase();
        const d = (f.dna_inspiration || '').toLowerCase();
        const dt = (f.dna_type || '').toLowerCase();
        const full = `${b} ${n} ${d} ${dt}`;
        if (!tokens.every(t => full.includes(t))) return false;
      }
      return true;
    });

    if (tokens.length > 0) {
      const scored = filtered.map(item => ({ item, score: scoreRelevance(item, tokens) }));
      if (sortBy === 'price_desc') {
        scored.sort((a, b) => Number(b.item.community_price || 0) - Number(a.item.community_price || 0));
      } else if (sortBy === 'price_asc') {
        scored.sort((a, b) => b.score !== a.score ? b.score - a.score : (Number(a.item.community_price || 0) - Number(b.item.community_price || 0)));
      } else if (sortBy === 'rating') {
        scored.sort((a, b) => (Number(b.item.rating_value) || 0) - (Number(a.item.rating_value) || 0));
      } else {
        scored.sort((a, b) => b.score - a.score);
      }
      filtered = scored.map(x => x.item);
    } else {
      if (sortBy === 'price_desc') {
        filtered.sort((a, b) => Number(b.community_price || 0) - Number(a.community_price || 0));
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (Number(b.rating_value) || 0) - (Number(a.rating_value) || 0));
      } else {
        filtered.sort((a, b) => Number(a.community_price || 999999) - Number(b.community_price || 999999));
      }
    }

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    const result = { items, totalCount, totalPages, page, pageSize };
    pageCache.set(cacheKey, result);
    return result;
  }

  try {
    let query = supabase
      .from('fragrances')
      .select(
        'id, name, brand, rating_value, rating_count, concentration, community_price, has_decants, lowest_decant_price, in_seller_stock, community_sellers, community_decants, dna_type, dna_inspiration',
        { count: 'exact' }
      );

    // 1. Format Filtering
    if (formats.length === 1 && formats[0] === 'retail') {
      query = query.eq('in_seller_stock', true).gt('community_price', 0);
    } else if (formats.length === 1 && formats[0] === 'decant') {
      query = query.eq('has_decants', true).gt('lowest_decant_price', 0);
    } else if (formats.length === 1 && formats[0] === 'tester') {
      query = query.contains('community_sellers', JSON.stringify([{ is_tester: true }]));
    } else if (formats.length === 1 && formats[0] === 'partial') {
      query = query.contains('community_sellers', JSON.stringify([{ is_partial: true }]));
    } else {
      query = query.or('in_seller_stock.eq.true,has_decants.eq.true');
    }

    // 2. Seller Isolation
    if (seller && seller !== 'all') {
      query = query.contains('community_sellers', JSON.stringify([{ seller_id: seller }]));
    }

    // 3. Max Budget
    if (maxBudget < 15000) {
      query = query.lte('community_price', maxBudget);
    }

    // 4. Semantic Search Query (Matches all tokens across name, brand, inspiration, or notes profile)
    if (tokens.length > 0) {
      for (const t of tokens) {
        query = query.or(`name.ilike.%${t}%,brand.ilike.%${t}%,dna_inspiration.ilike.%${t}%,dna_type.ilike.%${t}%`);
      }
    }

    // 5. Sorting and Pagination
    let items = [];
    let totalCount = 0;

    if (tokens.length > 0) {
      // For search queries, fetch matching rows to rank by semantic relevance
      const { data, count, error } = await query;
      if (error) throw error;

      items = data || [];
      const scored = items.map(item => ({ item, score: scoreRelevance(item, tokens) }));

      if (sortBy === 'price_desc') {
        scored.sort((a, b) => Number(b.item.community_price || 0) - Number(a.item.community_price || 0));
      } else if (sortBy === 'price_asc') {
        // When searching, sort by relevance first, then lowest price
        scored.sort((a, b) => b.score !== a.score ? b.score - a.score : (Number(a.item.community_price || 0) - Number(b.item.community_price || 0)));
      } else if (sortBy === 'rating') {
        scored.sort((a, b) => (Number(b.item.rating_value) || 0) - (Number(a.item.rating_value) || 0));
      } else {
        scored.sort((a, b) => b.score - a.score);
      }

      totalCount = scored.length;
      const from = (page - 1) * pageSize;
      items = scored.slice(from, from + pageSize).map(x => x.item);
    } else {
      // For general catalog browsing, sort and paginate directly in Postgres
      if (sortBy === 'price_desc') {
        query = query.order('community_price', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'rating') {
        query = query.order('rating_value', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('community_price', { ascending: true, nullsFirst: false });
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) {
        console.warn('Supabase query error, falling back:', error.message);
        throw error;
      }

      items = data || [];
      totalCount = count || items.length;
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const result = {
      items,
      totalCount,
      totalPages,
      page,
      pageSize
    };

    // Cache page result (keep cache size <= 100 entries)
    if (pageCache.size > 100) {
      const firstKey = pageCache.keys().next().value;
      pageCache.delete(firstKey);
    }
    pageCache.set(cacheKey, result);

    return result;
  } catch (err) {
    console.error('Failed to fetch inventory page from Supabase:', err);
    // Dynamic import fallback so app stays resilient
    const { default: fallbackCatalog } = await import('../data/fragrances.json');
    return filterClientCatalog(fallbackCatalog, { page, pageSize, search, seller, formats, maxBudget, sortBy });
  }
}

/**
 * Fetch full fragrance record for the modal view on demand
 */
export async function fetchFragranceDetail(id) {
  try {
    const { data, error } = await supabase
      .from('fragrances')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw error;
    return data;
  } catch (e) {
    const { default: fallbackCatalog } = await import('../data/fragrances.json');
    return fallbackCatalog.find(f => f.id === id) || null;
  }
}

/**
 * Fallback client filter (only invoked if Supabase network is unavailable)
 */
function filterClientCatalog(catalog, { page, pageSize, search, seller, formats, maxBudget, sortBy }) {
  const tokens = normalizeQuery(search);

  let filtered = catalog.filter(f => {
    if (formats.length === 1 && formats[0] === 'retail') {
      if (!f.in_seller_stock || !f.community_price) return false;
    } else if (formats.length === 1 && formats[0] === 'decant') {
      if (!f.has_decants) return false;
    } else if (formats.length === 1 && formats[0] === 'tester') {
      const isT = Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.is_tester);
      if (!isT) return false;
    } else if (formats.length === 1 && formats[0] === 'partial') {
      const isP = Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.is_partial);
      if (!isP) return false;
    } else {
      if (!f.in_seller_stock && !f.has_decants) return false;
    }

    if (seller !== 'all') {
      const inB = Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.seller_id === seller && Number(s.price) > 0);
      const inD = Array.isArray(f.community_decants) && f.community_decants.some(d => d.seller_id === seller);
      if (!inB && !inD) return false;
    }

    if (maxBudget < 15000 && Number(f.community_price || 999999) > maxBudget) return false;

    if (tokens.length > 0) {
      const n = (f.name || '').toLowerCase();
      const b = (f.brand || '').toLowerCase();
      const d = (f.dna_inspiration || '').toLowerCase();
      const dt = (f.dna_type || '').toLowerCase();
      const full = `${b} ${n} ${d} ${dt}`;
      if (!tokens.every(t => full.includes(t))) return false;
    }

    return true;
  });

  if (tokens.length > 0) {
    const scored = filtered.map(item => ({ item, score: scoreRelevance(item, tokens) }));
    if (sortBy === 'price_desc') {
      scored.sort((a, b) => Number(b.item.community_price || 0) - Number(a.item.community_price || 0));
    } else if (sortBy === 'price_asc') {
      scored.sort((a, b) => b.score !== a.score ? b.score - a.score : (Number(a.item.community_price || 0) - Number(b.item.community_price || 0)));
    } else if (sortBy === 'rating') {
      scored.sort((a, b) => (Number(b.item.rating_value) || 0) - (Number(a.item.rating_value) || 0));
    } else {
      scored.sort((a, b) => b.score - a.score);
    }
    filtered = scored.map(x => x.item);
  } else {
    if (sortBy === 'price_desc') {
      filtered.sort((a, b) => Number(b.community_price || 0) - Number(a.community_price || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (Number(b.rating_value) || 0) - (Number(a.rating_value) || 0));
    } else {
      filtered.sort((a, b) => Number(a.community_price || 999999) - Number(b.community_price || 999999));
    }
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, totalCount, totalPages, page, pageSize };
}
