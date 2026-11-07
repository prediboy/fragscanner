import { supabase } from '../lib/supabaseTelemetry.js';

// In-memory LRU cache to make repeat page visits 0ms instant
const pageCache = new Map();

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
  sortBy = 'price_asc'
} = {}) {
  const cleanSearch = (search || '').trim().toLowerCase();
  const cacheKey = `${page}_${pageSize}_${cleanSearch}_${seller}_${formats.sort().join(',')}_${maxBudget}_${sortBy}`;

  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey);
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

    // 4. Search Query (Matches name, brand, or cloned DNA inspiration)
    if (cleanSearch) {
      query = query.or(`name.ilike.%${cleanSearch}%,brand.ilike.%${cleanSearch}%,dna_inspiration.ilike.%${cleanSearch}%`);
    }

    // 5. Sorting
    if (sortBy === 'price_desc') {
      query = query.order('community_price', { ascending: false, nullsFirst: false });
    } else if (sortBy === 'rating') {
      query = query.order('rating_value', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('community_price', { ascending: true, nullsFirst: false });
    }

    // 6. Pagination Range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.warn('Supabase query error, falling back:', error.message);
      throw error;
    }

    const totalCount = count || (data ? data.length : 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const result = {
      items: data || [],
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
  let filtered = catalog.filter(f => {
    if (formats.length === 1 && formats[0] === 'retail') {
      if (!f.in_seller_stock || !f.community_price) return false;
    } else if (formats.length === 1 && formats[0] === 'decant') {
      if (!f.has_decants) return false;
    } else {
      if (!f.in_seller_stock && !f.has_decants) return false;
    }

    if (seller !== 'all') {
      const inB = Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.seller_id === seller && Number(s.price) > 0);
      const inD = Array.isArray(f.community_decants) && f.community_decants.some(d => d.seller_id === seller);
      if (!inB && !inD) return false;
    }

    if (maxBudget < 15000 && Number(f.community_price || 999999) > maxBudget) return false;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const n = (f.name || '').toLowerCase();
      const b = (f.brand || '').toLowerCase();
      const d = (f.dna_inspiration || '').toLowerCase();
      if (!n.includes(q) && !b.includes(q) && !d.includes(q)) return false;
    }

    return true;
  });

  if (sortBy === 'price_desc') {
    filtered.sort((a, b) => Number(b.community_price || 0) - Number(a.community_price || 0));
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => (Number(b.rating_value) || 0) - (Number(a.rating_value) || 0));
  } else {
    filtered.sort((a, b) => Number(a.community_price || 999999) - Number(b.community_price || 999999));
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, totalCount, totalPages, page, pageSize };
}
