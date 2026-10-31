import fragrancesData from '../data/fragrances.json';

/**
 * Tool 1: Search Fragrances by Name, DNA, Notes, or Accords
 */
export function searchFragrancesTool({ query, brand, season, maxResults = 5 }) {
  const q = (query || '').toLowerCase().trim();
  const b = (brand || '').toLowerCase().trim();
  const s = (season || '').toLowerCase().trim();

  let results = fragrancesData.filter(item => {
    if (b && item.brand.toLowerCase() !== b) return false;
    if (s && s !== 'all' && item.primary_season.toLowerCase() !== s) return false;
    if (!q) return true;

    const matchesName = item.name.toLowerCase().includes(q);
    const matchesBrand = item.brand.toLowerCase().includes(q);
    const matchesDNA = (item.dna_inspiration || '').toLowerCase().includes(q);
    const matchesAccords = (item.accords || []).some(a => a.name.toLowerCase().includes(q));
    const allNotes = [
      ...(item.notes?.top || []),
      ...(item.notes?.middle || []),
      ...(item.notes?.base || [])
    ].map(n => n.toLowerCase());
    const matchesNotes = allNotes.some(n => n.includes(q));

    return matchesName || matchesBrand || matchesDNA || matchesAccords || matchesNotes;
  });

  results.sort((a, b) => b.rating_value - a.rating_value);
  return results.slice(0, maxResults);
}

/**
 * Tool 2: Check Live Community Seller Quotes & Compare Prices
 */
export function checkSellerPricesTool({ fragranceName, maxPrice }) {
  const q = fragranceName.toLowerCase().trim();
  const matched = fragrancesData.filter(item => 
    item.name.toLowerCase().includes(q) || 
    (item.brand.toLowerCase() + ' ' + item.name.toLowerCase()).includes(q)
  );

  if (matched.length === 0) {
    return {
      found: false,
      message: `No perfume found matching "${fragranceName}".`
    };
  }

  const reports = matched.slice(0, 4).map(fragrance => {
    const sellers = fragrance.community_sellers || [];
    const inStock = fragrance.in_seller_stock && sellers.length > 0;

    let filteredSellers = sellers;
    if (maxPrice) {
      filteredSellers = sellers.filter(s => parseInt(s.price) <= parseInt(maxPrice));
    }

    return {
      id: fragrance.id,
      name: fragrance.name,
      brand: fragrance.brand,
      dna_inspiration: fragrance.dna_inspiration,
      in_stock: inStock,
      lowest_price: fragrance.community_price ? `₹${fragrance.community_price}` : null,
      lowest_seller: fragrance.lowest_seller,
      sellers_count: sellers.length,
      sellers: filteredSellers.map(s => ({
        seller_name: s.seller_name,
        price: `₹${s.price}`,
        shipping: s.shipping,
        dispatch: s.dispatch,
        whatsapp_link: `https://wa.me/91${s.whatsapp}?text=${encodeURIComponent(`Hi ${s.seller_name}, I am interested in purchasing ${fragrance.brand} ${fragrance.name} quoted at ₹${s.price}. Is it available?`)}`
      }))
    };
  });

  return {
    found: true,
    count: reports.length,
    results: reports
  };
}

/**
 * Tool 3: Budget In-Stock Scanner
 * Finds perfumes currently in-stock with sellers under a given price threshold.
 */
export function findInStockDealsByBudgetTool({ maxBudget = 3000, profile = 'all', season = 'all', limit = 5 }) {
  const budgetNum = parseInt(maxBudget) || 3000;
  const prof = profile.toLowerCase();
  const seas = season.toLowerCase();

  const deals = fragrancesData.filter(item => {
    if (!item.in_seller_stock || !item.community_price) return false;
    const priceNum = parseInt(item.community_price);
    if (priceNum > budgetNum) return false;
    if (seas !== 'all' && item.primary_season.toLowerCase() !== seas) return false;

    if (prof !== 'all') {
      const accords = (item.accords || []).map(a => a.name.toLowerCase());
      const hasAccord = accords.some(a => a.includes(prof));
      const hasDna = (item.dna_inspiration || '').toLowerCase().includes(prof);
      if (!hasAccord && !hasDna) return false;
    }

    return true;
  });

  deals.sort((a, b) => (b.rating_value || 4) - (a.rating_value || 4));
  return deals.slice(0, limit).map(item => ({
    name: item.name,
    brand: item.brand,
    dna_inspiration: item.dna_inspiration,
    community_price: `₹${item.community_price}`,
    lowest_seller: item.lowest_seller,
    sellers_count: item.community_sellers?.length || 1,
    accords: (item.accords || []).slice(0, 3).map(a => a.name),
    rating: item.rating_value
  }));
}
