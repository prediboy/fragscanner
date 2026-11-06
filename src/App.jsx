import React, { useState, useMemo, useRef, useEffect } from 'react';
import fragrancesData from './data/fragrances.json';
import syncMeta from './data/sync_meta.json';
import FragranceDetailModal from './components/FragranceDetailModal';
import SyncStatsModal from './components/SyncStatsModal';
import DirectFragranceSearchBar from './components/DirectFragranceSearchBar';
import { getProfileRecommendations } from './utils/userProfiler';
import { logWardrobeSelection, logWhatsAppClick, logSearchQuery, logSessionVisit } from './lib/supabaseTelemetry';
import { Analytics } from '@vercel/analytics/react';
import { 
  Search, ThumbsUp, ThumbsDown, Sparkles, X, 
  Store, Star, Eye, ArrowRight, CheckCircle2, FlaskConical, ChevronDown, ChevronUp,
  Compass, Flame, Layers, ShieldCheck
} from 'lucide-react';

const COMMUNITY_SELLERS = [
  { id: 'all', name: 'All 8 Sellers', tag: 'All' },
  { id: 'second_theory', name: 'Second Theory', tag: '🍾 Bottles' },
  { id: 'fragfever', name: 'FragFever', tag: '🍾 Bottles' },
  { id: 'apex_aroma', name: 'Apex Aroma', tag: '🍾 Bottles' },
  { id: 'liquid_emotions', name: 'Liquid Emotions', tag: '🧪 Decants' },
  { id: 'bluewings', name: 'Blue Wings', tag: '🍾 & 🧪' },
  { id: 'whiffculture', name: 'Whiff Culture', tag: '🍾 & 🧪' },
  { id: 'aar_fragrances', name: 'AAR Fragrances', tag: '🍾 & 🧪' },
  { id: 'fragrance_heaven', name: 'Fragrance Heaven', tag: '🍾 Bottles' }
];

// Top iconic luxury DNA targets for Option 2 Explorer
const LUXURY_TARGETS = [
  {
    id: 'pacific-chill',
    name: 'Louis Vuitton Pacific Chill',
    shortName: 'LV Pacific Chill',
    searchTerm: 'pacific chill',
    retailPrice: '₹32,000',
    vibe: 'California Mint, Blackcurrant & Aquatic Citrus',
    icon: '🌴'
  },
  {
    id: 'aventus',
    name: 'Creed Aventus',
    shortName: 'Creed Aventus',
    searchTerm: 'aventus',
    retailPrice: '₹38,000',
    vibe: 'Smoky Pineapple, Birch, Blackcurrant & Musk',
    icon: '👑'
  },
  {
    id: 'angels-share',
    name: "By Kilian Angels' Share",
    shortName: "Kilian Angels' Share",
    searchTerm: "angels' share",
    retailPrice: '₹28,500',
    vibe: 'Cognac, Cinnamon, Tonka Bean, Praline & Oak',
    icon: '🥃'
  },
  {
    id: 'tygar',
    name: 'Bvlgari Tygar',
    shortName: 'Bvlgari Tygar',
    searchTerm: 'tygar',
    retailPrice: '₹34,000',
    vibe: 'Sparkling Grapefruit, Ambroxan & Woody Vetiver',
    icon: '⚡'
  },
  {
    id: 'althair',
    name: 'Parfums de Marly Althaïr',
    shortName: 'PDM Althaïr',
    searchTerm: 'althair',
    retailPrice: '₹29,000',
    vibe: 'Bourbon Vanilla, Cinnamon, Cardamom & Praline',
    icon: '🍦'
  },
  {
    id: 'imagination',
    name: 'Louis Vuitton Imagination',
    shortName: 'LV Imagination',
    searchTerm: 'imagination',
    retailPrice: '₹32,000',
    vibe: 'Chinese Black Tea, Calabrian Bergamot & Ambrox',
    icon: '🍋'
  },
  {
    id: 'sauvage-elixir',
    name: 'Dior Sauvage Elixir',
    shortName: 'Dior Sauvage Elixir',
    searchTerm: 'sauvage elixir',
    retailPrice: '₹18,500',
    vibe: 'Spicy Nutmeg, Cardamom, Lavender & Rich Licorice',
    icon: '⚔️'
  },
  {
    id: 'baccarat-rouge',
    name: 'MFK Baccarat Rouge 540',
    shortName: 'BR540',
    searchTerm: 'baccarat rouge 540',
    retailPrice: '₹30,000',
    vibe: 'Saffron, Jasmine, Amberwood & Cedar Fir Balsam',
    icon: '💎'
  },
  {
    id: 'tobacco-vanille',
    name: 'Tom Ford Tobacco Vanille',
    shortName: 'TF Tobacco Vanille',
    searchTerm: 'tobacco vanille',
    retailPrice: '₹28,000',
    vibe: 'Tobacco Leaf, Vanilla, Cocoa, Spices & Dried Fruit',
    icon: '🍂'
  },
  {
    id: 'ombre-nomade',
    name: 'Louis Vuitton Ombre Nomade',
    shortName: 'LV Ombre Nomade',
    searchTerm: 'ombre nomade',
    retailPrice: '₹38,000',
    vibe: 'Oud Wood, Smoky Incense, Raspberry & Leather',
    icon: '🌑'
  }
];

// Helper to safely extract a concise review summary snippet
function getFragranceSummarySnippet(f, fallback = 'High community demand with Pan-India dispatch') {
  if (!f) return fallback;
  let text = '';
  if (typeof f.review_summary === 'string') {
    text = f.review_summary;
  } else if (f.review_summary && typeof f.review_summary === 'object') {
    text = f.review_summary.community_verdict || (Array.isArray(f.review_summary.pros) && f.review_summary.pros[0]) || '';
  } else if (typeof f.description === 'string') {
    text = f.description;
  }
  if (!text) return fallback;
  return text.length > 110 ? `${text.slice(0, 110)}...` : text;
}

export default function App() {
  const [allFragrances] = useState(fragrancesData);
  
  // Theme state: 'fresh' (Glacier Fresh Day) or 'night' (Midnight Frost Dark)
  const [theme, setTheme] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('theme');
      if (p === 'night' || p === 'fresh') return p;
      return localStorage.getItem('fragscanner_theme') || 'fresh';
    } catch {
      return 'fresh';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fragscanner_theme', theme);
      const root = document.documentElement;
      if (theme === 'night') {
        root.classList.add('theme-night', 'dark');
        root.classList.remove('theme-fresh');
        root.setAttribute('data-theme', 'night');
      } else {
        root.classList.add('theme-fresh');
        root.classList.remove('theme-night', 'dark');
        root.setAttribute('data-theme', 'fresh');
      }
    } catch {}
  }, [theme]);

  // Track session landing visit with source attribution
  useEffect(() => {
    logSessionVisit();
  }, []);

  // Primary Option 2 Mode Tab: 'deals' (Hot Deals & Price Search) | 'explorer' (Luxury Clone Explorer & Taste Lab)
  const [activeNavTab, setActiveNavTab] = useState('deals');
  const [selectedLuxuryTarget, setSelectedLuxuryTarget] = useState('pacific-chill');

  // Global Price Discovery Search Bar & Filters
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch {
      return '';
    }
  });
  const [selectedSeller, setSelectedSeller] = useState('all');
  const [dealsSubFilter, setDealsSubFilter] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('deals');
      return p === 'drops' || p === 'new' ? p : 'all';
    } catch {
      return 'all';
    }
  }); // 'all' | 'drops' | 'new'
  
  // Step 1: Taste Anchor Search & Selection (Starts Clean & Empty)
  const [anchorSearch, setAnchorSearch] = useState('');
  const [anchorDropdownOpen, setAnchorDropdownOpen] = useState(false);
  const [likedIds, setLikedIds] = useState([]);
  const [dislikedIds, setDislikedIds] = useState([]);
  
  // Modals & Card States
  const [activeFragrance, setActiveFragrance] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const anchorInputRef = useRef(null);

  // Dual Toggle: Like Handler
  const handleToggleLike = (id, e) => {
    e?.stopPropagation();
    if (likedIds.includes(id)) {
      setLikedIds(likedIds.filter(i => i !== id));
    } else {
      setLikedIds([...likedIds, id]);
      setDislikedIds(dislikedIds.filter(i => i !== id));
    }
    setAnchorSearch('');
    setAnchorDropdownOpen(false);
  };

  // Dual Toggle: Avoid Handler
  const handleToggleDislike = (id, e) => {
    e?.stopPropagation();
    if (dislikedIds.includes(id)) {
      setDislikedIds(dislikedIds.filter(i => i !== id));
    } else {
      setDislikedIds([...dislikedIds, id]);
      setLikedIds(likedIds.filter(i => i !== id));
    }
    setAnchorSearch('');
    setAnchorDropdownOpen(false);
  };

  // Popular community anchors shown when user opens search
  const popularAnchors = useMemo(() => {
    const ids = [
      'lattafa-khamrah',
      'rasasi-hawas-for-him',
      'afnan-9pm',
      'armaf-club-de-nuit-intense-man',
      'afnan-turathi-blue',
      'french-avenue-liquid-brun',
      'lattafa-asad',
      'french-avenue-after-effect'
    ];
    return allFragrances.filter(f => ids.includes(f.id));
  }, [allFragrances]);

  // Live Dropdown Search Results for Step 1 Anchor Picker
  const anchorSearchResults = useMemo(() => {
    const q = anchorSearch.trim().toLowerCase();
    if (!q || q.length < 2) return popularAnchors;

    return allFragrances.filter(f => {
      const name = (f.name || '').toLowerCase();
      const brand = (f.brand || '').toLowerCase();
      const inspo = (f.dna_inspiration || '').toLowerCase();
      const matchAlias = Array.isArray(f.aliases) && f.aliases.some(a => String(a).toLowerCase().includes(q));
      
      let mNotes = false;
      if (f.notes && typeof f.notes === 'object') {
        const allN = [...(f.notes.top || []), ...(f.notes.middle || []), ...(f.notes.base || [])];
        mNotes = allN.some(n => String(n).toLowerCase().includes(q));
      }

      return name.includes(q) || brand.includes(q) || inspo.includes(q) || matchAlias || mNotes;
    }).slice(0, 10);
  }, [anchorSearch, allFragrances, popularAnchors]);

  // Full Recommendation Engine (Exact Rich Explanations)
  const recommendations = useMemo(() => {
    const likedPerfumes = allFragrances.filter(f => likedIds.includes(f.id));
    const dislikedPerfumes = allFragrances.filter(f => dislikedIds.includes(f.id));

    if (likedPerfumes.length === 0) return [];

    const res = getProfileRecommendations(likedPerfumes, dislikedPerfumes, allFragrances, selectedSeller, 25);
    return res?.likes || [];
  }, [likedIds, dislikedIds, allFragrances, selectedSeller]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (anchorInputRef.current && !anchorInputRef.current.contains(e.target)) {
        setAnchorDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Telemetry: Log primary search queries (debounced 1.5s after typing stops)
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      const matchCount = allFragrances.filter(f => {
        const name = (f.name || '').toLowerCase();
        const brand = (f.brand || '').toLowerCase();
        const inspo = (f.dna_inspiration || '').toLowerCase();
        const matchAlias = Array.isArray(f.aliases) && f.aliases.some(a => String(a).toLowerCase().includes(q));
        return name.includes(q) || brand.includes(q) || inspo.includes(q) || matchAlias;
      }).length;
      logSearchQuery(searchQuery, matchCount);
    }
  }, [searchQuery, allFragrances]);

  // 1. Trending Community Hits (shown on first load when no search and no likes)
  const trendingCommunityHits = useMemo(() => {
    const trendingIds = [
      'rasasi-hawas-for-him',
      'rasasi-hawas-ice',
      'rasasi-hawas-fire',
      'afnan-9pm',
      'afnan-9pm-rebel',
      'french-avenue-liquid-brun',
      'afnan-supremacy-not-only-intense',
      'lattafa-khamrah-qahwa',
      'lattafa-asad',
      'ahmed-al-maghribi-kaaf',
      'armaf-club-de-nuit-intense-man',
      'armaf-club-de-nuit-intense-overdose',
      'rue-broca-theoreme-pour-homme',
      'afnan-turathi-blue',
      'lattafa-vintage-radio',
      'al-rehab-french-coffee'
    ];
    return trendingIds
      .map(id => allFragrances.find(f => f.id === id))
      .filter(Boolean)
      .filter(f => selectedSeller === 'all' || (f.community_sellers || []).some(s => s.seller_id === selectedSeller))
      .map(f => ({
        fragrance: f,
        matchOutOfFive: Number(f.rating_value) || 4.6,
        likeReasons: [
          f.dna_inspiration ? `🎯 Closest Match: ${f.dna_inspiration}` : '🔥 Community Verified Beastmode Hit',
          `⚡ Lowest Pan-India rate at ₹${Number(f.community_price || f.lowest_decant_price || 0).toLocaleString()} via ${f.community_seller_name || 'Verified Sellers'}`,
          `⭐ ${getFragranceSummarySnippet(f)}`
        ]
      }));
  }, [allFragrances, selectedSeller]);

  // 2. Direct Search Filtered Results
  const directSearchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q || q.length < 2) return [];

    return allFragrances.filter(f => {
      const name = (f.name || '').toLowerCase();
      const brand = (f.brand || '').toLowerCase();
      const inspo = (f.dna_inspiration || '').toLowerCase();
      const matchAlias = Array.isArray(f.aliases) && f.aliases.some(a => String(a).toLowerCase().includes(q));
      
      let matchNotes = false;
      if (f.notes && typeof f.notes === 'object') {
        const allN = [...(f.notes.top || []), ...(f.notes.middle || []), ...(f.notes.base || [])];
        matchNotes = allN.some(n => String(n).toLowerCase().includes(q));
      }

      const matches = name.includes(q) || brand.includes(q) || inspo.includes(q) || matchAlias || matchNotes;
      if (!matches) return false;

      if (selectedSeller !== 'all') {
        const hasSeller = (f.community_sellers || []).some(s => s.seller_id === selectedSeller) ||
                          (f.community_decants || []).some(d => d.seller_id === selectedSeller);
        if (!hasSeller) return false;
      }

      return true;
    }).map(f => {
      const inspo = (f.dna_inspiration || '').toLowerCase();
      const isCloneTargetMatch = inspo.includes(q) && !f.name.toLowerCase().includes(q);
      const matchedAlias = Array.isArray(f.aliases) ? f.aliases.find(a => String(a).toLowerCase().includes(q)) : null;

      return {
        fragrance: f,
        matchOutOfFive: Number(f.rating_value) || 4.5,
        isCloneTargetMatch,
        matchedAlias,
        likeReasons: [
          isCloneTargetMatch 
            ? `🎯 Closest Match: ${f.dna_inspiration}` 
            : matchedAlias 
              ? `🏷 Matched Community Alias "${matchedAlias}"` 
              : f.dna_inspiration ? `Closest Match: ${f.dna_inspiration}` : 'Community Verified Stock',
          `⚡ Lowest Pan-India rate at ₹${Number(f.community_price || f.lowest_decant_price || 0).toLocaleString()} via ${f.community_seller_name || 'Verified Sellers'}`,
          `⭐ ${getFragranceSummarySnippet(f)}`
        ]
      };
    });
  }, [searchQuery, allFragrances, selectedSeller]);

  // 3. Option 2: Active Luxury Clone Target Clones
  const activeTargetClones = useMemo(() => {
    if (!selectedLuxuryTarget) return [];
    const target = LUXURY_TARGETS.find(t => t.id === selectedLuxuryTarget);
    if (!target) return [];
    const term = target.searchTerm.toLowerCase();
    const normalizeStr = (s) => (s || '').normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    return allFragrances.filter(f => {
      const inspo = normalizeStr(f.dna_inspiration);
      return inspo.includes(term) && !normalizeStr(f.name).includes(term);
    }).sort((a, b) => {
      const pa = Number(a.community_price || a.lowest_decant_price || 999999);
      const pb = Number(b.community_price || b.lowest_decant_price || 999999);
      return pa - pb;
    }).map(f => ({
      fragrance: f,
      matchOutOfFive: Number(f.rating_value) || 4.7,
      isCloneTargetMatch: true,
      likeReasons: [
        `🎯 Closest Match to ${target.name} in stock`,
        `⚡ Lowest Pan-India rate at ₹${Number(f.community_price || f.lowest_decant_price || 0).toLocaleString()} via ${f.community_seller_name || 'Verified Sellers'}`,
        `⭐ ${getFragranceSummarySnippet(f, 'Save up to ~92% vs original retail price')}`
      ]
    }));
  }, [selectedLuxuryTarget, allFragrances]);

  const activeTargetObj = useMemo(() => {
    return LUXURY_TARGETS.find(t => t.id === selectedLuxuryTarget) || LUXURY_TARGETS[0];
  }, [selectedLuxuryTarget]);

  const priceDropsCount = useMemo(() => allFragrances.filter(f => f.is_price_drop && f.community_price).length, [allFragrances]);
  
  // 4-Day Rolling Window for New Arrivals
  const newArrivalsCount = useMemo(() => {
    const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
    return allFragrances.filter(f => {
      if (!f.is_new_arrival || !f.community_price) return false;
      const arrivalDate = f.new_arrival_timestamp || f.new_arrival_date || f.created_at || f.price_updated_at;
      if (!arrivalDate) return true;
      const arrivalTimeMs = new Date(arrivalDate).getTime();
      return arrivalTimeMs && (Date.now() - arrivalTimeMs <= fourDaysMs);
    }).length;
  }, [allFragrances]);

  const filteredByDealType = useMemo(() => {
    if (dealsSubFilter === 'drops') {
      return allFragrances
        .filter(f => f.is_price_drop && f.community_price)
        .map(f => ({
          fragrance: f,
          matchOutOfFive: Number(f.rating_value) || 4.8,
          likeReasons: [
            `📉 Price Drop: Saved ₹${Math.abs(f.price_change || (f.previous_price - f.community_price))} (-${f.price_change_percentage || Math.round((Math.abs(f.previous_price - f.community_price) / f.previous_price) * 100)}%) in last 2 days`,
            `🍾 Lowest quote ₹${Number(f.community_price).toLocaleString()} via ${f.lowest_seller} (${f.community_bottle_size || 'Bottle'})`,
            `🎯 Closest Match: ${f.dna_inspiration || 'Community Verified Stock'}`
          ]
        }));
    }
    if (dealsSubFilter === 'new') {
      const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
      return allFragrances
        .filter(f => {
          if (!f.is_new_arrival || !f.community_price) return false;
          const arrivalDate = f.new_arrival_timestamp || f.new_arrival_date || f.created_at || f.price_updated_at;
          if (!arrivalDate) return true;
          const arrivalTimeMs = new Date(arrivalDate).getTime();
          return arrivalTimeMs && (Date.now() - arrivalTimeMs <= fourDaysMs);
        })
        .sort((a, b) => {
          // Strict ordering by when perfume was added (newest added first)
          const timeA = new Date(a.new_arrival_timestamp || a.price_updated_at || a.new_arrival_date || a.price_date || 0).getTime();
          const timeB = new Date(b.new_arrival_timestamp || b.price_updated_at || b.new_arrival_date || b.price_date || 0).getTime();
          return timeB - timeA;
        })
        .map(f => ({
          fragrance: f,
          matchOutOfFive: Number(f.rating_value) || 4.7,
          likeReasons: [
            `✨ New Arrival: Added ${f.new_arrival_date ? new Date(f.new_arrival_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'recently'} (within last 4 days)`,
            `🍾 Lowest quote ₹${Number(f.community_price).toLocaleString()} via ${f.lowest_seller} (${f.community_bottle_size || 'Bottle'})`,
            `🎯 Closest Match: ${f.dna_inspiration || 'Community Verified Stock'}`
          ]
        }));
    }
    return null;
  }, [dealsSubFilter, allFragrances]);

  const isSearchActive = searchQuery.trim().length >= 2;
  const isProfileActive = likedIds.length > 0;

  const displayedItems = isSearchActive
    ? directSearchResults
    : (dealsSubFilter !== 'all' && filteredByDealType
        ? filteredByDealType
        : (isProfileActive ? recommendations : trendingCommunityHits));

  const displayTitle = isSearchActive
    ? `Price Discovery: "${searchQuery}"`
    : dealsSubFilter === 'drops'
      ? `📉 Live Price Drops (Last 2 Days)`
      : dealsSubFilter === 'new'
        ? `✨ New Community Arrivals (Last 4 Days)`
        : (isProfileActive ? "Your Tailored Scent Twins in Stock" : "🔥 Trending Community Hits (Live Lowest Rates)");

  const displaySubtitle = isSearchActive
    ? `Showing ${directSearchResults.length} perfumes matching "${searchQuery}" across verified sellers`
    : dealsSubFilter === 'drops'
      ? `Verified full bottles that dropped in price within the last 48 hours`
      : dealsSubFilter === 'new'
        ? `Newly listed community bottles added in the last 4 days • Ordered by newest added`
        : (isProfileActive ? "Pure Olfactory Vector & Lineage Math • Zero AI Fluff" : "Directly verified across FragFever, Second Theory, Whiff Culture, Apex Aroma & AAR");

  const displayBadge = isSearchActive
    ? `${directSearchResults.length} In Stock`
    : dealsSubFilter === 'drops'
      ? `${priceDropsCount} Drops Live`
      : dealsSubFilter === 'new'
        ? `${newArrivalsCount} New Bottles`
        : (isProfileActive ? `${recommendations.length} Matches` : `${trendingCommunityHits.length} Hot Deals`);

  // Telemetry: Log Step 01 taste anchor searches
  useEffect(() => {
    if (anchorSearch && anchorSearch.trim().length >= 2) {
      logSearchQuery(`anchor:${anchorSearch.trim()}`, anchorSearchResults.length);
    }
  }, [anchorSearch, anchorSearchResults.length]);

  // Telemetry: Log user taste anchors & recommendations (debounced 2.5s)
  useEffect(() => {
    if (likedIds.length > 0 || dislikedIds.length > 0) {
      const likedPerfumes = allFragrances.filter(f => likedIds.includes(f.id));
      const dislikedPerfumes = allFragrances.filter(f => dislikedIds.includes(f.id));
      logWardrobeSelection({
        likedPerfumes,
        dislikedPerfumes,
        umbrella: { title: 'Glacier Taste Profile', bestSeason: 'All Season' },
        topRecommendations: recommendations
      });
    }
  }, [likedIds, dislikedIds, recommendations, allFragrances]);

  // Reusable Fragrance Card Renderer
  const renderFragranceCard = (item, idx) => {
    const f = item.fragrance;
    const isExpanded = expandedCardId === f.id;
    
    const displayName = f.brand && !f.name.toLowerCase().includes(f.brand.toLowerCase())
      ? `${f.brand} ${f.name}`
      : f.name;

    const bottlePriceNum = Number(f.community_price);
    const hasBottlePrice = !isNaN(bottlePriceNum) && bottlePriceNum > 0;

    const decantPriceNum = Number(f.lowest_decant_price);
    const hasDecantPrice = !isNaN(decantPriceNum) && decantPriceNum > 0;

    const bestLeadPrice = hasBottlePrice ? bottlePriceNum : (hasDecantPrice ? decantPriceNum : 0);

    // Extract strictly valid numerical quotes (no zero, no NaN)
    const validQuotes = (() => {
      const list = [];
      
      // Bottle sellers
      if (Array.isArray(f.community_sellers)) {
        for (const s of f.community_sellers) {
          if (selectedSeller !== 'all' && s.seller_id !== selectedSeller) continue;
          const p = Number(s.price);
          if (p && !isNaN(p) && p > 0) {
            list.push({
              seller_id: s.seller_id,
              seller_name: s.seller_name,
              label: s.size || (f.bottle_size ? `${f.bottle_size} Retail Bottle` : 'Retail Bottle'),
              price: p,
              whatsapp: s.whatsapp,
              isBottle: true
            });
          }
        }
      }

      // Decant sellers
      if (Array.isArray(f.community_decants)) {
        for (const d of f.community_decants) {
          if (selectedSeller !== 'all' && d.seller_id !== selectedSeller) continue;
          if (d.sizes && typeof d.sizes === 'object') {
            for (const [sz, val] of Object.entries(d.sizes)) {
              const p = Number(val);
              if (p && !isNaN(p) && p > 0) {
                list.push({
                  seller_id: d.seller_id,
                  seller_name: d.seller_name,
                  label: `${sz} Decant`,
                  price: p,
                  whatsapp: d.whatsapp,
                  isBottle: false
                });
              }
            }
          } else {
            const p = Number(d.lowest_price || d.price_10ml || d.price_5ml || d.price);
            if (p && !isNaN(p) && p > 0) {
              list.push({
                seller_id: d.seller_id,
                seller_name: d.seller_name,
                label: d.price_10ml ? '10ml Decant' : (d.price_5ml ? '5ml Decant' : 'Decant'),
                price: p,
                whatsapp: d.whatsapp,
                isBottle: false
              });
            }
          }
        }
      }

      // Sort bottles first by price asc, then decants by price asc
      return list.sort((a, b) => {
        if (a.isBottle !== b.isBottle) return a.isBottle ? -1 : 1;
        return a.price - b.price;
      });
    })();

    const bestBottleQuote = validQuotes.find(q => q.isBottle);
    const bottleDisplaySize = bestBottleQuote 
      ? bestBottleQuote.label.replace(' Retail Bottle', ' Bottle') 
      : (f.community_bottle_size ? f.community_bottle_size.replace(' Retail Bottle', ' Bottle') : 'Bottle');

    return (
      <div 
        key={f.id || idx}
        className={`bg-white rounded-2xl border ${f.is_price_drop ? 'border-emerald-300 ring-1 ring-emerald-500/20 shadow-sm' : 'border-glacier-border'} hover:border-cyan-500 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-5 flex flex-col justify-between space-y-4 overflow-hidden relative w-full`}
      >
        <div>
          {/* Header with Match Percentage & Brand */}
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-800 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
                {f.brand}
              </span>
              {f.is_new_arrival && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-500/60 font-mono flex items-center gap-1 shadow-2xs">
                  <span className="text-xs leading-none">✨</span>
                  <span>New Arrival</span>
                </span>
              )}
              {f.is_price_drop && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 font-mono flex items-center gap-1 shadow-2xs">
                  <svg className="w-3 h-3 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                    <polyline points="17 18 23 18 23 12"></polyline>
                  </svg>
                  Price Drop
                </span>
              )}
              {item.isCloneTargetMatch && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-mono flex items-center gap-1 shadow-2xs">
                  🎯 Closest Match
                </span>
              )}
              {item.matchedAlias && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-200">
                  🏷 {item.matchedAlias}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              <span>{item.matchOutOfFive.toFixed(1)} / 5.0 Match</span>
            </div>
          </div>

          {/* Title & Pricing */}
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1">
            <div className="flex-1 min-w-0 pr-1">
              <h3 className="font-heading font-bold text-lg text-slate-900 hover:text-cyan-700 transition-colors cursor-pointer truncate" onClick={() => setActiveFragrance(f)}>
                {f.name}
              </h3>
              <p className="text-xs text-glacier-textMuted mt-0.5 break-words">
                {f.dna_inspiration ? (
                  <span>
                    Closest Match: <strong className="font-semibold text-slate-800">{f.dna_inspiration}</strong>
                  </span>
                ) : (
                  f.dna_type
                )}
              </p>
            </div>

            <div className="text-right shrink-0">
              {hasBottlePrice ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-end gap-0.5 sm:gap-1.5 items-end">
                    {f.is_price_drop && f.previous_price && (
                      <span className="text-[11px] text-slate-400 line-through font-mono font-medium">
                        ₹{Number(f.previous_price).toLocaleString()}
                      </span>
                    )}
                    <div className={`font-mono text-lg font-bold leading-tight ${f.is_price_drop ? 'text-emerald-600 font-black' : 'text-slate-900'}`}>
                      ₹{bottlePriceNum.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[11px] text-glacier-textMuted font-mono font-medium flex items-center justify-end gap-1 mt-0.5">
                    <span>{bottleDisplaySize}</span>
                    {f.is_price_drop && (
                      <span className="text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        📉 -{f.price_change_percentage || Math.round((Math.abs(f.previous_price - bottlePriceNum) / f.previous_price) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ) : hasDecantPrice ? (
                <div className="text-xs text-glacier-textMuted font-mono font-medium">Decant only</div>
              ) : (
                <div className="text-xs text-glacier-textMuted font-mono">Unquoted</div>
              )}
              {hasDecantPrice && (
                <div className="text-[11px] text-emerald-600 font-semibold font-mono mt-0.5">
                  Decant from ₹{decantPriceNum.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* EXACT STRUCTURED PROOF BREAKDOWN */}
          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            {item.likeReasons.map((reason, rIdx) => {
              const match = reason.match(/^([^\s\w]+)\s*(.*)$/u);
              const emoji = match ? match[1] : '•';
              const text = match ? match[2] : reason;

              return (
                <div key={rIdx} className="flex items-start gap-2 leading-relaxed text-slate-800">
                  <span className="shrink-0 text-sm mt-0.5">{emoji}</span>
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* In-Stock Seller Spread & Actions */}
        <div className="pt-2 border-t border-glacier-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-glacier-textMuted">
            <span>In stock: </span>
            <strong className="text-slate-900">
              {f.community_sellers && f.community_sellers.length > 0 
                ? (f.community_seller_name || f.community_sellers[0].seller_name)
                : f.community_decants && f.community_decants.length > 0
                  ? (f.community_seller_name || f.community_decants[0].seller_name)
                  : 'Verified Sellers (Inquire)'}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedCardId(isExpanded ? null : f.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-800 text-xs font-mono font-medium transition-colors bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-2xs"
            >
              <span>{isExpanded ? 'Close' : 'Compare Rates'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {f.community_whatsapp ? (
              <a
                href={`https://wa.me/${String(f.community_whatsapp).replace(/\D/g, '').startsWith('91') ? String(f.community_whatsapp).replace(/\D/g, '') : `91${String(f.community_whatsapp).replace(/\D/g, '')}`}?text=${encodeURIComponent(
                  bestLeadPrice > 0
                    ? `Hi, saw your price for ${displayName}${hasBottlePrice && bottleDisplaySize ? ` (${bottleDisplaySize})` : ''} quoted at ₹${bestLeadPrice.toLocaleString()} on FragScanner. Is this in stock?`
                    : `Hi, saw your listing for ${displayName} on FragScanner. Is this in stock?`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => logWhatsAppClick({
                  sellerName: f.lowest_seller || f.community_sellers?.[0]?.seller_name || f.lowest_decant_seller || 'Community Seller',
                  fragranceName: f.name,
                  brand: f.brand,
                  price: bestLeadPrice,
                  format: hasBottlePrice ? 'bottle' : 'decant'
                })}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-98"
              >
                <span>WhatsApp</span>
                <span className="text-[10px]">↗</span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Expanded Sellers Drawer */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-glacier-border space-y-2 bg-glacier-bg/60 p-3 rounded-xl animate-in fade-in duration-100">
            <span className="text-[11px] font-mono text-glacier-textMuted uppercase font-bold block">
              Direct Community Quotes ({validQuotes.length}):
            </span>
            {validQuotes.length === 0 ? (
              <div className="text-xs text-glacier-textMuted py-2 text-center">
                No active verified quotes found for this selection.
              </div>
            ) : (
              validQuotes.map((q, qIdx) => {
                const phoneDigits = String(q.whatsapp || '').replace(/\D/g, '');
                const intlPhone = phoneDigits.startsWith('91') ? phoneDigits : `91${phoneDigits}`;
                const msg = encodeURIComponent(`Hi ${q.seller_name}, saw your price for ${displayName}${q.label ? ` (${q.label})` : ''} quoted at ₹${q.price.toLocaleString()} on FragScanner. Is this in stock?`);
                const wa = phoneDigits ? `https://wa.me/${intlPhone}?text=${msg}` : null;

                return (
                  <div key={qIdx} className="bg-white border border-glacier-border rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{q.seller_name}</div>
                      <div className="text-[10px] text-glacier-textMuted font-mono">{q.label} • In Stock</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">₹{q.price.toLocaleString()}</span>
                      {wa && (
                        <a 
                          href={wa} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={() => logWhatsAppClick({
                            sellerName: q.seller_name,
                            fragranceName: f.name,
                            brand: f.brand,
                            price: q.price,
                            format: q.isBottle ? 'bottle' : 'decant'
                          })}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold transition-colors"
                        >
                          Order
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-glacier-bg text-glacier-text flex flex-col antialiased overflow-x-hidden">
      
      {/* Top Glacier Frost Navigation */}
      <header className="border-b border-glacier-border bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & Clickable Theme Badge */}
          <button
            type="button"
            onClick={() => setTheme(t => t === 'fresh' ? 'night' : 'fresh')}
            className="text-left flex items-center gap-3 group cursor-pointer"
            title={`Currently in ${theme === 'night' ? 'Midnight Frost' : 'Glacier Fresh'}. Click to toggle.`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md transition-all group-hover:scale-105 shrink-0 ${
              theme === 'night'
                ? 'bg-gradient-to-tr from-cyan-600 to-indigo-700 shadow-cyan-900/40 ring-1 ring-cyan-400/30'
                : 'bg-gradient-to-tr from-cyan-500 to-sky-600 shadow-cyan-500/20'
            }`}>
              {theme === 'night' ? '🌙' : '❄️'}
            </div>
            <div>
              <h1 className="text-base font-heading font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>FRAGSCANNER</span>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border transition-colors flex items-center gap-1.5 shadow-2xs ${
                  theme === 'night'
                    ? 'bg-sky-950 text-cyan-300 border-cyan-500/40'
                    : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                }`}>
                  <span>{theme === 'night' ? '🌙 MIDNIGHT FROST' : '❄️ GLACIER FRESH'}</span>
                  <span className="text-[9px] opacity-60 font-sans">⇄ Switch</span>
                </span>
              </h1>
              <p className="text-[11px] text-glacier-textMuted font-mono">
                Price Discovery & Olfactory Twin Intelligence
              </p>
            </div>
          </button>

          {/* Header Controls: High-Contrast Theme Switcher & Seller Status */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs">
            {/* Highly Visible Theme Switcher Toggle Pill */}
            <div className="flex items-center bg-glacier-subtle p-1 rounded-xl border border-glacier-border shadow-xs">
              <button
                type="button"
                onClick={() => setTheme('fresh')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  theme === 'fresh'
                    ? 'bg-white text-cyan-800 shadow-xs border border-cyan-300 ring-1 ring-cyan-300/30'
                    : 'text-glacier-textMuted hover:text-glacier-text'
                }`}
                title="Switch to Glacier Fresh (Light Day Mode)"
              >
                <span>❄️</span>
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('night')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  theme === 'night'
                    ? 'bg-slate-900 text-cyan-300 shadow-xs border border-cyan-400 ring-1 ring-cyan-400/40'
                    : 'text-glacier-textMuted hover:text-glacier-text'
                }`}
                title="Switch to Midnight Frost (Dark Night Mode)"
              >
                <span>🌙</span>
                <span>Dark</span>
              </button>
            </div>

            {/* Monitored Sellers Button (Desktop only; mobile has it in bottom dock) */}
            <button
              onClick={() => setShowStatsModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-glacier-border hover:border-glacier-accent text-glacier-textMuted hover:text-glacier-text transition-colors font-mono text-[11px] shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-glacier-success animate-pulse"></span>
              <span className="hidden md:inline">8 Community Sellers Monitored</span>
              <span className="md:hidden">8 Sellers</span>
            </button>
          </div>

        </div>
      </header>

      {/* Primary Tab Navigation Bar (Desktop Segmented Luxury Pill - hidden on mobile) */}
      <nav className="hidden sm:block bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-glacier-border px-4 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveNavTab('deals')}
              className={`px-4 sm:px-5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeNavTab === 'deals'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Flame className={`w-4 h-4 ${activeNavTab === 'deals' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span>Hot Deals & Price Discovery</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeNavTab === 'deals' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
              }`}>
                1,153
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('explorer')}
              className={`px-4 sm:px-5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeNavTab === 'explorer'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FlaskConical className={`w-4 h-4 ${activeNavTab === 'explorer' ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span>Taste Lab • Like & Dislike</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeNavTab === 'explorer' ? 'bg-cyan-100 text-cyan-900' : 'bg-slate-200 text-slate-600'
              }`}>
                MATCH
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-6 flex-1 w-full space-y-8 pb-32 sm:pb-24">
        
        {/* ======================================================== */}
        {/* TAB 1: 🔥 HOT DEALS & LIVE PRICE SEARCH                  */}
        {/* ======================================================== */}
        {activeNavTab === 'deals' && (
          <div className="space-y-6">
            
            {/* Direct Search Bar & Seller Filters Box */}
            <div className="bg-white rounded-2xl border border-glacier-border p-3.5 sm:p-5 shadow-xs space-y-4">
              <DirectFragranceSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                allFragrances={allFragrances}
                onSelectFragrance={(f) => {
                  setActiveFragrance(f);
                }}
                onToggleLike={handleToggleLike}
                onToggleDislike={handleToggleDislike}
                likedIds={likedIds}
                dislikedIds={dislikedIds}
              />

              {/* Global Community Seller Filter Chips */}
              <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pt-1">
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  <span className="text-glacier-textMuted text-[11px] font-mono uppercase font-bold flex items-center gap-1 mr-1">
                    <Store className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Seller:</span>
                  </span>
                  {COMMUNITY_SELLERS.map(s => {
                    const isSelected = selectedSeller === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSeller(s.id)}
                        className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-950 shadow-xs font-bold dark:bg-cyan-600 dark:border-cyan-500'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <span className="font-bold">{s.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-black/25 text-white font-bold' : 'bg-glacier-subtle text-glacier-textMuted font-medium'
                        }`}>
                          {s.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedSeller !== 'all' && (
                  <button
                    onClick={() => setSelectedSeller('all')}
                    className="text-[11px] text-cyan-700 hover:underline font-mono uppercase tracking-wider shrink-0 ml-2 font-bold"
                  >
                    Reset Seller [x]
                  </button>
                )}
              </div>

              {/* Quick Deals Sub-Filter Pills (Price Drops & New Arrivals) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setDealsSubFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
                    dealsSubFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-950 shadow-xs dark:bg-cyan-600 dark:border-cyan-500'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>All Deals</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDealsSubFilter(dealsSubFilter === 'drops' ? 'all' : 'drops')}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-2 shrink-0 ${
                    dealsSubFilter === 'drops'
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30 scale-[1.02]'
                      : 'from-emerald-50 bg-gradient-to-r via-teal-50 to-emerald-50/80 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 border-emerald-300 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dealsSubFilter === 'drops' ? 'bg-white' : 'bg-emerald-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${dealsSubFilter === 'drops' ? 'bg-white' : 'bg-emerald-600 dark:bg-emerald-400'}`}></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className={`w-3.5 h-3.5 ${dealsSubFilter === 'drops' ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                      <polyline points="17 18 23 18 23 12"></polyline>
                    </svg>
                    <span>Price Drops (Last 2 Days)</span>
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs ${
                    dealsSubFilter === 'drops'
                      ? 'bg-white text-emerald-800 font-extrabold dark:bg-slate-900 dark:text-emerald-300'
                      : 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                  }`}>
                    {priceDropsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDealsSubFilter(dealsSubFilter === 'new' ? 'all' : 'new')}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-2 shrink-0 ${
                    dealsSubFilter === 'new'
                      ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white border-amber-800 shadow-md ring-2 ring-amber-500/30 scale-[1.02]'
                      : 'from-amber-50 bg-gradient-to-r via-amber-50/70 to-orange-50/40 hover:from-amber-100 hover:to-orange-100 text-amber-950 border-amber-300 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dealsSubFilter === 'new' ? 'bg-white' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${dealsSubFilter === 'new' ? 'bg-white' : 'bg-amber-600 dark:bg-amber-400'}`}></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs leading-none">✨</span>
                    <span>New Arrivals (Last 4 Days)</span>
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs ${
                    dealsSubFilter === 'new'
                      ? 'bg-white text-amber-800 font-extrabold dark:bg-slate-900 dark:text-amber-300'
                      : 'bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-950'
                  }`}>
                    {newArrivalsCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Catalog Grid (Search Results or Trending Hits) */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glacier-border pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold block">
                    {isSearchActive ? 'PRICE DISCOVERY • SEARCH RESULTS' : 'COMMUNITY DEALS • VERIFIED STOCK'}
                  </span>
                  <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>{displayTitle}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                      {displayBadge}
                    </span>
                  </h2>
                </div>
                <span className="text-xs text-glacier-textMuted font-mono">
                  {displaySubtitle}
                </span>
              </div>

              {displayedItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-glacier-border p-12 text-center text-xs text-glacier-textMuted space-y-2">
                  <p className="font-bold text-slate-900 text-sm">No matching perfumes found in verified stock.</p>
                  <p>Try searching another perfume, house (e.g. Lattafa, Afnan, Rasasi, Armaf), or reset seller filters.</p>
                  {selectedSeller !== 'all' && (
                    <button
                      onClick={() => setSelectedSeller('all')}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono font-bold"
                    >
                      Reset Seller Filter to "All Sellers"
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {displayedItems.slice(0, 16).map((item, idx) => renderFragranceCard(item, idx))}
                </div>
              )}
            </section>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: 🧪 TASTE LAB • LIKE & DISLIKE SCENT PROFILER      */}
        {/* ======================================================== */}
        {activeNavTab === 'explorer' && (
          <div className="space-y-8">

            {/* SENSORY PROFILE TASTE LAB (SEARCH & CALIBRATION) */}
            <section className="bg-white rounded-2xl border border-glacier-border p-5 sm:p-6 shadow-xs space-y-6">
              
              {/* Step 1: Taste Anchors Selector */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glacier-subtle pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold block">
                      TASTE LAB • STEP 01
                    </span>
                    <h2 className="text-base font-heading font-bold text-slate-900">
                      Search & select reference perfumes you like (👍) or avoid (👎)
                    </h2>
                  </div>
                  <div className="text-xs text-glacier-textMuted font-mono">
                    <strong className="text-cyan-700">{likedIds.length} Liked</strong> • <strong className="text-red-600">{dislikedIds.length} Avoided</strong>
                  </div>
                </div>

                {/* Dedicated Search Input with Search Button for Step 1 Anchors */}
                <div ref={anchorInputRef} className="relative max-w-xl">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAnchorDropdownOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="relative flex-1 flex items-center">
                      <Search className="absolute left-3.5 w-4 h-4 text-cyan-600 pointer-events-none" />
                      <input
                        type="text"
                        value={anchorSearch}
                        onChange={(e) => {
                          setAnchorSearch(e.target.value);
                          setAnchorDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setAnchorDropdownOpen(true);
                        }}
                        placeholder="Search any perfume to add (e.g. Khamrah, Hawas, 9 PM, CDNIM)..."
                        className="w-full bg-slate-50 border border-glacier-border focus:border-cyan-600 focus:bg-white rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 transition-colors shadow-2xs"
                      />
                      {anchorSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setAnchorSearch('');
                            setAnchorDropdownOpen(false);
                          }}
                          className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs font-mono"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                  </form>

                  {/* Live Autocomplete Dropdown for Step 1 Search */}
                  {anchorDropdownOpen && anchorSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-glacier-border rounded-xl shadow-xl overflow-hidden divide-y divide-glacier-subtle max-h-80 overflow-y-auto">
                      <div className="p-2.5 bg-cyan-50/70 text-[11px] font-mono text-cyan-900 uppercase font-semibold flex items-center justify-between">
                        <span>{anchorSearch.trim().length >= 2 ? `Search Results (${anchorSearchResults.length})` : 'Popular Benchmarks (Tap 👍 Like or 👎 Avoid):'}</span>
                        <button 
                          type="button" 
                          onClick={() => setAnchorDropdownOpen(false)}
                          className="text-slate-400 hover:text-slate-700 text-xs"
                        >
                          Close ✕
                        </button>
                      </div>
                      {anchorSearchResults.map(f => {
                        const isLiked = likedIds.includes(f.id);
                        const isDisliked = dislikedIds.includes(f.id);

                        return (
                          <div 
                            key={f.id}
                            onClick={(e) => handleToggleLike(f.id, e)}
                            className="p-3 hover:bg-cyan-50/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-cyan-700 uppercase font-bold">{f.brand}</span>
                                {f.dna_inspiration && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 truncate max-w-xs inline-flex items-center gap-1">
                                    <span>Closest Match:</span>
                                    <strong className="font-bold">{f.dna_inspiration}</strong>
                                  </span>
                                )}
                              </div>
                              <div className="font-semibold text-xs text-slate-900 truncate">{f.name}</div>
                              {f.notes && typeof f.notes === 'object' && (
                                <div className="text-[10px] text-glacier-textMuted font-mono truncate max-w-sm mt-0.5">
                                  Notes: {[...(f.notes.top || []), ...(f.notes.middle || []), ...(f.notes.base || [])].slice(0, 5).join(', ')}
                                </div>
                              )}
                              {Array.isArray(f.accords) && f.accords.length > 0 && (
                                <div className="flex gap-1 mt-1 overflow-hidden">
                                  {f.accords.slice(0, 3).map((a, aIdx) => (
                                    <span key={aIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                      {typeof a === 'string' ? a : a.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  handleToggleLike(f.id, e);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                                  isLiked
                                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{isLiked ? 'Liked' : 'Like'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  handleToggleDislike(f.id, e);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                                  isDisliked
                                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>{isDisliked ? 'Avoided' : 'Avoid'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Active Selections Area */}
                <div className="pt-2">
                  {likedIds.length === 0 && dislikedIds.length === 0 ? (
                    <div className="p-4 rounded-xl bg-glacier-bg border border-glacier-border text-center text-xs text-glacier-textMuted">
                      Your profile is currently clean. Use the search bar above or choose reference perfumes to build your olfactory taste profile.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {likedIds.length > 0 && (
                        <div>
                          <span className="text-[11px] font-mono uppercase font-bold text-cyan-800 block mb-1.5">
                            Liked Fragrances ({likedIds.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {likedIds.map(id => {
                              const f = allFragrances.find(x => x.id === id);
                              const noteSnippet = f?.notes && typeof f.notes === 'object'
                                ? [...(f.notes.top || []), ...(f.notes.middle || [])].slice(0, 2).join(', ')
                                : '';
                              return (
                                <span 
                                  key={id} 
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-medium shadow-2xs"
                                >
                                  <span>👍 {f?.brand ? `${f.brand} ` : ''}{f?.name || id}{noteSnippet ? ` • ${noteSnippet}` : ''}</span>
                                  <button 
                                    onClick={(e) => handleToggleLike(id, e)} 
                                    className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded-full hover:bg-emerald-200/50"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {dislikedIds.length > 0 && (
                        <div>
                          <span className="text-[11px] font-mono uppercase font-bold text-red-700 block mb-1.5">
                            Avoided Fragrances ({dislikedIds.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {dislikedIds.map(id => {
                              const f = allFragrances.find(x => x.id === id);
                              const noteSnippet = f?.notes && typeof f.notes === 'object'
                                ? [...(f.notes.top || []), ...(f.notes.middle || [])].slice(0, 2).join(', ')
                                : '';
                              return (
                                <span 
                                  key={id} 
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 border border-red-300 text-red-950 text-xs font-medium shadow-2xs"
                                >
                                  <span>🚫 Avoid: {f?.brand ? `${f.brand} ` : ''}{f?.name || id}{noteSnippet ? ` • ${noteSnippet}` : ''}</span>
                                  <button 
                                    onClick={(e) => handleToggleDislike(id, e)} 
                                    className="text-red-700 hover:text-red-950 p-0.5 rounded-full hover:bg-red-200/50"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button 
                          onClick={() => { setLikedIds([]); setDislikedIds([]); }}
                          className="text-cyan-800 hover:underline font-mono text-[11px] font-bold"
                        >
                          Clear All Selections [x]
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Recommendations Area */}
              <div className="space-y-4 pt-4 border-t border-glacier-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glacier-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold block">
                      TASTE LAB • STEP 02 • SENSORY INTELLIGENCE
                    </span>
                    <h3 className="text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
                      <span>Your Tailored Scent Twins in Stock</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                        {recommendations.length} Matches
                      </span>
                    </h3>
                  </div>
                  <span className="text-xs text-glacier-textMuted font-mono">
                    Pure Olfactory Vector & Lineage Math • Zero AI Fluff
                  </span>
                </div>

                {recommendations.length === 0 ? (
                  <div className="bg-glacier-bg rounded-2xl border border-glacier-border p-8 text-center text-xs text-glacier-textMuted space-y-2">
                    <p className="font-bold text-slate-900 text-sm">Select reference perfumes above to unlock tailored scent twins.</p>
                    <p>Tap 👍 on perfumes in Step 01 to run the sensory vector match.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {recommendations.slice(0, 10).map((item, idx) => renderFragranceCard(item, idx))}
                  </div>
                )}
              </div>

            </section>

          </div>
        )}

      </main>

      {/* Mobile Native Bottom Navigation Dock ("Down Tab") */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E1626]/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-xl px-4 pt-2.5 pb-6 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveNavTab('deals');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeNavTab === 'deals'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Flame className={`w-5 h-5 ${activeNavTab === 'deals' ? 'text-amber-500 fill-amber-500' : ''}`} />
            <span className="absolute -top-1.5 -right-3 text-[9px] font-mono font-bold px-1 rounded-full bg-amber-500 text-slate-950">
              1.1k
            </span>
          </div>
          <span className="text-[10px] font-heading font-bold tracking-tight">Deals & Search</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNavTab('explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeNavTab === 'explorer'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <FlaskConical className={`w-5 h-5 ${activeNavTab === 'explorer' ? 'text-cyan-600 dark:text-cyan-400' : ''}`} />
            <span className="absolute -top-1.5 -right-3.5 text-[8px] font-mono font-bold px-1 rounded-full bg-cyan-500 text-slate-950">
              MATCH
            </span>
          </div>
          <span className="text-[10px] font-heading font-bold tracking-tight">Taste Lab</span>
        </button>

        <button
          type="button"
          onClick={() => setShowStatsModal(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <div className="relative flex items-center justify-center">
            <Store className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <span className="text-[10px] font-heading font-bold tracking-tight">Sellers</span>
        </button>
      </nav>

      {/* Global Modals */}
      {activeFragrance && (
        <FragranceDetailModal
          fragrance={activeFragrance}
          allFragrances={allFragrances}
          onClose={() => setActiveFragrance(null)}
          onSelectOther={(other) => setActiveFragrance(other)}
          onToggleLike={handleToggleLike}
          onToggleDislike={handleToggleDislike}
          isLiked={likedIds.includes(activeFragrance.id)}
          isDisliked={dislikedIds.includes(activeFragrance.id)}
        />
      )}

      {showStatsModal && (
        <SyncStatsModal
          onClose={() => setShowStatsModal(false)}
          syncMeta={syncMeta}
          allFragrances={allFragrances}
        />
      )}

      {/* Vercel Web Analytics */}
      <Analytics />

    </div>
  );
}
