import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '')
  : (typeof process !== 'undefined' && process.env ? (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '') : '');

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '')
  : (typeof process !== 'undefined' && process.env ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '') : '');

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Persistent anonymous session ID per browser
function getSessionId() {
  try {
    let sess = localStorage.getItem('fragscanner_session_id');
    if (!sess) {
      sess = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('fragscanner_session_id', sess);
    }
    return sess;
  } catch (e) {
    return 'anon_session';
  }
}

// Persistent acquisition and referrer tracker
export function getAcquisitionInfo() {
  try {
    let stored = localStorage.getItem('fragscanner_acquisition');
    if (stored) {
      return JSON.parse(stored);
    }

    const ref = typeof document !== 'undefined' ? (document.referrer || '') : '';
    let source = 'direct';
    let hostname = '';

    if (ref) {
      try {
        hostname = new URL(ref).hostname;
      } catch (e) {
        hostname = ref;
      }
    }

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    if (utmSource) {
      source = utmSource.toLowerCase();
    } else if (hostname.includes('reddit.com') || hostname.includes('redd.it')) {
      source = 'reddit';
    } else if (hostname.includes('google.')) {
      source = 'google';
    } else if (hostname.includes('instagram.')) {
      source = 'instagram';
    } else if (hostname.includes('twitter.') || hostname.includes('t.co') || hostname.includes('x.com')) {
      source = 'twitter';
    } else if (hostname.includes('facebook.')) {
      source = 'facebook';
    } else if (hostname.includes('youtube.') || hostname.includes('youtu.be')) {
      source = 'youtube';
    } else if (hostname) {
      source = hostname;
    }

    const info = {
      source,
      referrer: ref || 'direct',
      hostname: hostname || 'direct',
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      first_visit: new Date().toISOString()
    };

    localStorage.setItem('fragscanner_acquisition', JSON.stringify(info));
    return info;
  } catch (e) {
    return { source: 'direct', referrer: 'direct', hostname: 'direct' };
  }
}

/**
 * Logs session visit once per browser session with acquisition attribution
 */
export async function logSessionVisit() {
  try {
    if (typeof sessionStorage === 'undefined') return;
    if (sessionStorage.getItem('fragscanner_visit_logged')) return;

    if (!supabase) return;
    sessionStorage.setItem('fragscanner_visit_logged', 'true');
    const sessionId = getSessionId();
    const acq = getAcquisitionInfo();

    const payload = {
      session_id: sessionId,
      umbrella_title: 'EVENT:session_visit',
      umbrella_season: `source:${acq.source}`,
      liked_perfumes: [{
        event: 'session_visit',
        source: acq.source,
        referrer: acq.referrer,
        hostname: acq.hostname,
        utm_source: acq.utm_source,
        utm_medium: acq.utm_medium,
        timestamp: new Date().toISOString()
      }],
      disliked_perfumes: [],
      top_recommendations: []
    };

    await supabase.from('wardrobe_logs').insert([payload]);
    console.log('[FragScanner Telemetry] Visit logged with acquisition:', acq.source, acq.referrer);
  } catch (err) {
    console.warn('[FragScanner Telemetry] Visit log error:', err);
  }
}

let wardrobeDebounceTimer = null;

/**
 * Debounced logger: captures likes/dislikes 2.5 seconds after user stops checking boxes
 */
export function logWardrobeSelection({
  likedPerfumes = [],
  dislikedPerfumes = [],
  umbrella = null,
  topRecommendations = []
}) {
  if (!supabase) return;
  if (likedPerfumes.length === 0 && dislikedPerfumes.length === 0) {
    return;
  }

  if (wardrobeDebounceTimer) {
    clearTimeout(wardrobeDebounceTimer);
  }

  wardrobeDebounceTimer = setTimeout(async () => {
    try {
      const sessionId = getSessionId();

      const payload = {
        session_id: sessionId,
        liked_perfumes: likedPerfumes.map(f => ({
          id: f.id,
          name: f.name,
          brand: f.brand
        })),
        disliked_perfumes: dislikedPerfumes.map(f => ({
          id: f.id,
          name: f.name,
          brand: f.brand
        })),
        umbrella_title: umbrella?.title || 'Custom Profile',
        umbrella_season: umbrella?.bestSeason || 'All Season',
        top_recommendations: topRecommendations.slice(0, 5).map(r => ({
          name: r.fragrance?.name || r.name,
          brand: r.fragrance?.brand || r.brand,
          match: r.matchOutOfFive || 0
        }))
      };

      const { error } = await supabase
        .from('wardrobe_logs')
        .insert([payload]);

      if (error) {
        console.warn('[FragScanner Telemetry] Log skipped:', error.message);
      } else {
        console.log('[FragScanner Telemetry] Preference logged successfully:', payload);
      }
    } catch (err) {
      console.warn('[FragScanner Telemetry] Error:', err);
    }
  }, 2500);
}

/**
 * Real-time Lead Logger: records every time a user taps an outbound WhatsApp button to buy
 */
export async function logWhatsAppClick({
  sellerName = 'Community Seller',
  fragranceName = '',
  brand = '',
  price = null,
  format = 'bottle' // 'bottle' | 'decant'
}) {
  if (!supabase) return;
  try {
    const sessionId = getSessionId();
    const acq = getAcquisitionInfo();
    const payload = {
      session_id: sessionId,
      umbrella_title: 'EVENT:whatsapp_click',
      umbrella_season: `${format}|source:${acq.source}`,
      liked_perfumes: [{
        event: 'whatsapp_click',
        seller_name: sellerName,
        name: fragranceName,
        brand: brand,
        price: price,
        format: format,
        source: acq.source,
        referrer: acq.referrer,
        timestamp: new Date().toISOString()
      }],
      disliked_perfumes: [],
      top_recommendations: []
    };

    // 1. Try dedicated table if created
    const { error } = await supabase.from('whatsapp_clicks').insert([{
      session_id: sessionId,
      seller_name: sellerName,
      fragrance_name: fragranceName,
      fragrance_brand: brand,
      price: price,
      format: format
    }]);

    // 2. If table doesn't exist, store reliably in wardrobe_logs
    if (error) {
      await supabase.from('wardrobe_logs').insert([payload]);
    }

    console.log('[FragScanner Telemetry] WhatsApp lead logged:', sellerName, fragranceName, price);
  } catch (err) {
    console.warn('[FragScanner Telemetry] WhatsApp log error:', err);
  }
}

let searchDebounceTimer = null;

/**
 * Debounced Search Logger: captures final search queries 1.5s after user stops typing
 */
export function logSearchQuery(query, resultsCount = 0) {
  if (!supabase) return;
  const cleanQ = (query || '').trim();
  if (!cleanQ || cleanQ.length < 2) return;

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      const sessionId = getSessionId();
      const acq = getAcquisitionInfo();
      const payload = {
        session_id: sessionId,
        umbrella_title: 'EVENT:search_query',
        umbrella_season: `${resultsCount} results|source:${acq.source}`,
        liked_perfumes: [{
          event: 'search_query',
          query: cleanQ,
          results_count: resultsCount,
          source: acq.source,
          referrer: acq.referrer,
          timestamp: new Date().toISOString()
        }],
        disliked_perfumes: [],
        top_recommendations: []
      };

      // 1. Try dedicated table if created
      const { error } = await supabase.from('search_logs').insert([{
        session_id: sessionId,
        query: cleanQ,
        results_count: resultsCount
      }]);

      // 2. If table doesn't exist, store reliably in wardrobe_logs
      if (error) {
        await supabase.from('wardrobe_logs').insert([payload]);
      }

      console.log('[FragScanner Telemetry] Search query logged:', cleanQ, `(${resultsCount} results)`);
    } catch (err) {
      console.warn('[FragScanner Telemetry] Search log error:', err);
    }
  }, 1500);
}
