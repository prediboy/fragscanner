import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lvivmkdlaxaetnazmcat.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8eXJXa7QmS1okuJ3tFwsbg_GyE7RaKC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  try {
    const sessionId = getSessionId();
    const payload = {
      session_id: sessionId,
      umbrella_title: 'EVENT:whatsapp_click',
      umbrella_season: format,
      liked_perfumes: [{
        event: 'whatsapp_click',
        seller_name: sellerName,
        name: fragranceName,
        brand: brand,
        price: price,
        format: format,
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
  const cleanQ = (query || '').trim();
  if (!cleanQ || cleanQ.length < 2) return;

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      const sessionId = getSessionId();
      const payload = {
        session_id: sessionId,
        umbrella_title: 'EVENT:search_query',
        umbrella_season: `${resultsCount} results`,
        liked_perfumes: [{
          event: 'search_query',
          query: cleanQ,
          results_count: resultsCount,
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
