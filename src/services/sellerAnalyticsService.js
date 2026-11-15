/**
 * sellerAnalyticsService.js
 * 
 * Aggregates live platform telemetry from Supabase for the Seller Demand Dashboard.
 * Filters by Date Range (Preset or Custom) and Seller ID.
 */

import { supabase } from '../lib/supabaseTelemetry.js';

let cachedAllLogs = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // 1 minute in-memory cache for fast tab switching

/**
 * Fetch telemetry rows from Supabase (paginated to bypass 1,000 row limits)
 */
async function fetchTelemetryRows(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedAllLogs && (now - lastFetchTime) < CACHE_TTL_MS) {
    return cachedAllLogs;
  }

  let allRows = [];
  let page = 0;
  const pageSize = 1000;

  try {
    if (!supabase) {
      console.warn('[Seller Analytics] Supabase client is null or unconfigured.');
      return [];
    }

    while (true) {
      const { data, error } = await supabase
        .from('wardrobe_logs')
        .select('created_at, session_id, umbrella_title, umbrella_season, liked_perfumes')
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) break;
      allRows = allRows.concat(data);
      if (data.length < pageSize) break;
      page++;
      // Guard against infinite loop
      if (page > 20) break;
    }

    cachedAllLogs = allRows;
    lastFetchTime = Date.now();
    return allRows;
  } catch (err) {
    console.error('[Seller Analytics] Error fetching telemetry:', err);
    return cachedAllLogs || [];
  }
}

/**
 * Computes start date and end date ISO strings based on preset filter
 */
export function getDateRangeFromPreset(preset, customStart = null, customEnd = null) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '14d':
      start.setDate(start.getDate() - 14);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case 'all':
      start = new Date('2026-11-01T00:00:00Z');
      break;
    case 'custom':
      if (customStart) start = new Date(customStart);
      if (customEnd) {
        const ce = new Date(customEnd);
        ce.setHours(23, 59, 59, 999);
        return { start: start.toISOString(), end: ce.toISOString() };
      }
      break;
    default:
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Aggregates audience and demand analytics with filters
 */
export async function getSellerDashboardMetrics({
  preset = '30d',
  customStart = null,
  customEnd = null,
  selectedSeller = 'all',
  forceRefresh = false
}) {
  const rows = await fetchTelemetryRows(forceRefresh);
  const { start: startIso, end: endIso } = getDateRangeFromPreset(preset, customStart, customEnd);

  // Filter rows within date range
  const filteredRows = rows.filter(r => {
    if (!r.created_at) return false;
    return r.created_at >= startIso && r.created_at <= endIso;
  });

  const uniqueSessions = new Set();
  const searchCounts = {};
  const sellerLeadCounts = {};
  const perfumeLeadCounts = {};
  const formatCounts = { bottle: 0, decant: 0, retail: 0, tester: 0, partial: 0 };
  const dailyMap = {};
  const sourceCounts = {};
  const sellerSpecificPerfumes = {};

  let totalVisits = 0;
  let totalSearches = 0;
  let totalLeads = 0;
  let sellerFilteredLeads = 0;

  for (const r of filteredRows) {
    const day = (r.created_at || '').slice(0, 10);
    const sess = r.session_id || 'unknown';
    uniqueSessions.add(sess);

    if (!dailyMap[day]) {
      dailyMap[day] = { date: day, visits: 0, searches: 0, leads: 0, sessions: new Set() };
    }
    dailyMap[day].sessions.add(sess);

    const title = r.umbrella_title || '';
    const items = Array.isArray(r.liked_perfumes) ? r.liked_perfumes : [];

    if (title === 'EVENT:session_visit') {
      totalVisits++;
      dailyMap[day].visits++;
      const s = items[0]?.source || 'direct';
      sourceCounts[s] = (sourceCounts[s] || 0) + 1;
    } else if (title === 'EVENT:search_query') {
      totalSearches++;
      dailyMap[day].searches++;
      for (const it of items) {
        if (it.query) {
          const q = it.query.toLowerCase().trim();
          if (q.length >= 2) {
            searchCounts[q] = (searchCounts[q] || 0) + 1;
          }
        }
      }
    } else if (title === 'EVENT:whatsapp_click') {
      totalLeads++;
      dailyMap[day].leads++;
      for (const it of items) {
        const seller = it.seller_name || 'Community Seller';
        sellerLeadCounts[seller] = (sellerLeadCounts[seller] || 0) + 1;

        const perfume = (it.brand ? `${it.brand} ` : '') + (it.name || 'Unknown Fragrance');
        perfumeLeadCounts[perfume] = (perfumeLeadCounts[perfume] || 0) + 1;

        const format = (it.format || 'bottle').toLowerCase();
        formatCounts[format] = (formatCounts[format] || 0) + 1;

        // Track seller specific performance
        if (!sellerSpecificPerfumes[seller]) sellerSpecificPerfumes[seller] = {};
        sellerSpecificPerfumes[seller][perfume] = (sellerSpecificPerfumes[seller][perfume] || 0) + 1;

        if (selectedSeller !== 'all' && seller.toLowerCase() === selectedSeller.toLowerCase()) {
          sellerFilteredLeads++;
        }
      }
    }
  }

  // Sorted list of daily metrics for the trend chart
  const dailyTrends = Object.keys(dailyMap).sort().map(d => ({
    date: d,
    displayDate: new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    visits: dailyMap[d].visits,
    searches: dailyMap[d].searches,
    leads: dailyMap[d].leads,
    uniqueUsers: dailyMap[d].sessions.size
  }));

  // Top Searches (Ranked by frequency)
  const topSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([query, count]) => ({
      query,
      count,
      share: totalSearches > 0 ? ((count / totalSearches) * 100).toFixed(1) : 0
    }));

  // Top Sellers (Ranked by outbound leads)
  const topSellers = Object.entries(sellerLeadCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([seller, count]) => ({
      seller,
      leads: count,
      share: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0
    }));

  // Top Perfumes clicked to buy
  const perfumeSource = (selectedSeller !== 'all' && sellerSpecificPerfumes[selectedSeller])
    ? sellerSpecificPerfumes[selectedSeller]
    : perfumeLeadCounts;

  const topDemandedPerfumes = Object.entries(perfumeSource)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      leads: count,
      share: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0
    }));

  // Traffic sources
  const totalAcq = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
  const trafficSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([src, count]) => {
      let label = src;
      if (src === 'com.reddit.frontpage') label = 'Reddit App';
      else if (src === 'reddit') label = 'Reddit Web';
      else if (src === 'direct') label = 'Direct / Shared Link';
      else if (src === 'google') label = 'Google Search';
      return {
        source: label,
        count,
        share: totalAcq > 0 ? ((count / totalAcq) * 100).toFixed(1) : 0
      };
    });

  const uniqueCount = uniqueSessions.size || 1;
  const conversionRate = totalLeads > 0 ? ((totalLeads / uniqueCount) * 100).toFixed(2) : '0.00';

  // Format ratio
  const totalFormats = (formatCounts.bottle + formatCounts.retail + formatCounts.decant + formatCounts.tester + formatCounts.partial) || 1;
  const bottlePercentage = (((formatCounts.bottle + formatCounts.retail) / totalFormats) * 100).toFixed(1);
  const decantPercentage = ((formatCounts.decant / totalFormats) * 100).toFixed(1);

  return {
    dateRange: { preset, start: startIso, end: endIso },
    totalVisitors: uniqueSessions.size,
    totalVisits,
    totalSearches,
    totalLeads,
    selectedSellerLeads: selectedSeller !== 'all' ? sellerFilteredLeads : totalLeads,
    conversionRate,
    bottlePercentage,
    decantPercentage,
    formatBreakdown: formatCounts,
    dailyTrends,
    topSearches,
    topSellers,
    topDemandedPerfumes,
    trafficSources,
    sellersList: Object.keys(sellerLeadCounts).sort()
  };
}
