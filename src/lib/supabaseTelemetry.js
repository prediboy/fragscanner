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

let debounceTimer = null;

/**
 * Debounced logger: captures likes/dislikes 2.5 seconds after user stops checking boxes
 */
export function logWardrobeSelection({
  likedPerfumes = [],
  dislikedPerfumes = [],
  umbrella = null,
  topRecommendations = []
}) {
  // Only log if user has made at least one like or dislike
  if (likedPerfumes.length === 0 && dislikedPerfumes.length === 0) {
    return;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
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

      const { data, error } = await supabase
        .from('wardrobe_logs')
        .insert([payload]);

      if (error) {
        // Table might not be created yet, fail silently
        console.warn('[FragScanner Telemetry] Log skipped (check if wardrobe_logs table exists):', error.message);
      } else {
        console.log('[FragScanner Telemetry] Preference logged successfully to Supabase:', payload);
      }
    } catch (err) {
      console.warn('[FragScanner Telemetry] Error:', err);
    }
  }, 2500);
}
