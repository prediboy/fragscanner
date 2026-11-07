import { supabase } from '../lib/supabaseTelemetry.js';

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
 * Fetch a single page of inventory on demand directly from Supabase.
 * Loads strictly 24 items per page with zero reliance on local JSON files.
 */
export async function fetchInventoryPage({
  page = 1,
  pageSize = 24,
  search = '',
  seller = 'all',
  brand = 'all',
  formats = ['retail'],
  maxBudget = 15000,
  sortBy = 'price_asc',
  dealsOnly = null
} = {}) {
  const tokens = normalizeQuery(search);
  const cleanSearch = tokens.join(' ');
  const cacheKey = `${page}_${pageSize}_${cleanSearch}_${seller}_${brand}_${(formats || []).slice().sort().join(',')}_${maxBudget}_${sortBy}_${dealsOnly || ''}`;

  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey);
  }

  try {
    if (!supabase) throw new Error("Supabase client not initialized");
    let query = supabase
      .from('fragrances')
      .select(
        'id, name, brand, rating_value, rating_count, collection, concentration, primary_season, longevity, sillage, description, accords, top_notes, middle_notes, base_notes, community_price, has_decants, lowest_decant_price, in_seller_stock, community_sellers, community_decants, dna_type, dna_inspiration, is_price_drop, previous_price, price_change, price_change_percentage, price_change_date, price_change_time, is_new_arrival, new_arrival_date, price_history, discovered_at',
        { count: 'exact' }
      );

    // 0. Deals / New Arrivals Filter
    if (dealsOnly === 'drops') {
      query = query.eq('is_price_drop', true);
    } else if (dealsOnly === 'new') {
      query = query.eq('is_new_arrival', true);
    } else {
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
    }

    // 2. Seller Isolation
    if (seller && seller !== 'all') {
      query = query.or(`community_sellers.cs.[{"seller_id":"${seller}"}],community_decants.cs.[{"seller_id":"${seller}"}]`);
    }

    // 2b. Brand Isolation
    if (brand && brand !== 'all') {
      query = query.ilike('brand', brand);
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
      } else if (dealsOnly === 'drops' || dealsOnly === 'new') {
        query = query.order('discovered_at', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('community_price', { ascending: true, nullsFirst: false });
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) {
        console.warn('Supabase query error:', error.message);
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
    return {
      items: [],
      totalCount: 0,
      totalPages: 1,
      page,
      pageSize
    };
  }
}

let cachedBrands = null;

/**
 * Fetch distinct brands with live in-stock counts directly from Supabase database
 * Sorted alphabetically A-Z
 */
export async function fetchCatalogBrands() {
  if (cachedBrands && cachedBrands.length > 0) {
    return cachedBrands;
  }

  try {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase
      .from('fragrances')
      .select('brand, in_seller_stock, community_price')
      .not('brand', 'is', null);

    if (error || !data) throw error;

    const brandStats = {};
    data.forEach(row => {
      const b = (row.brand || '').trim();
      if (!b) return;
      if (!brandStats[b]) brandStats[b] = { count: 0, inStock: 0 };
      brandStats[b].count++;
      if (row.in_seller_stock && Number(row.community_price) > 0) {
        brandStats[b].inStock++;
      }
    });

    const list = Object.entries(brandStats).map(([name, s]) => ({
      name,
      count: s.inStock || s.count
    }));

    // Sort strictly A-Z by brand name
    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    cachedBrands = list;
    return list;
  } catch (err) {
    console.warn('Failed to fetch brands from database:', err);
    return [];
  }
}

let cachedCounts = null;

/**
 * Fetch exact live inventory counts directly from Supabase using fast HEAD requests
 */
export async function fetchInventoryCounts() {
  if (cachedCounts) return cachedCounts;

  try {
    if (!supabase) throw new Error("Supabase client not initialized");
    const [
      { count: inStock },
      { count: retail },
      { count: decants },
      { count: testers },
      { count: partials },
      { count: drops },
      { count: newArrivals }
    ] = await Promise.all([
      supabase.from('fragrances').select('id', { count: 'exact', head: true }).or('in_seller_stock.eq.true,has_decants.eq.true'),
      supabase.from('fragrances').select('id', { count: 'exact', head: true }).eq('in_seller_stock', true).gt('community_price', 0),
      supabase.from('fragrances').select('id', { count: 'exact', head: true }).eq('has_decants', true).gt('lowest_decant_price', 0),
      supabase.from('fragrances').select('id', { count: 'exact', head: true }).contains('community_sellers', JSON.stringify([{ is_tester: true }])),
      supabase.from('fragrances').select('id', { count: 'exact', head: true }).contains('community_sellers', JSON.stringify([{ is_partial: true }])),
      supabase.from('fragrances').select('id', { count: 'exact', head: true }).eq('is_price_drop', true),
      supabase.from('fragrances').select('id', { count: 'exact', head: true }).eq('is_new_arrival', true)
    ]);

    cachedCounts = {
      inStock: inStock || 0,
      retail: retail || 0,
      decant: decants || 0,
      decants: decants || 0,
      tester: testers || 0,
      testers: testers || 0,
      partial: partials || 0,
      partials: partials || 0,
      drops: drops || 0,
      newArrivals: newArrivals || 0
    };

    return cachedCounts;
  } catch (e) {
    console.warn('Could not fetch live counts from Supabase:', e);
    return {
      inStock: 0,
      retail: 0,
      decant: 0,
      decants: 0,
      tester: 0,
      testers: 0,
      partial: 0,
      partials: 0,
      drops: 0,
      newArrivals: 0
    };
  }
}

/**
 * Fetch full fragrance record for the modal view on demand directly from Supabase
 */
export async function fetchFragranceDetail(id) {
  try {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { data, error } = await supabase
      .from('fragrances')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw error;
    return data;
  } catch (e) {
    console.error('Failed to fetch fragrance detail from Supabase:', e);
    return null;
  }
}

/**
 * Fetch sync metadata and seller stats from Supabase
 */
export async function fetchSyncMetadata() {
  try {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('sync_metadata')
      .select('*')
      .eq('id', 'latest')
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('Could not fetch sync metadata from Supabase:', e);
    return null;
  }
}
