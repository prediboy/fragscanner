import React, { useState, useMemo, useRef, useEffect } from 'react';
import fragrancesData from './data/fragrances.json';
import syncMeta from './data/sync_meta.json';
import FragranceDetailModal from './components/FragranceDetailModal';
import SyncStatsModal from './components/SyncStatsModal';
import DirectFragranceSearchBar from './components/DirectFragranceSearchBar';
import { getProfileRecommendations } from './utils/userProfiler';
import { logWardrobeSelection, logWhatsAppClick, logSearchQuery } from './lib/supabaseTelemetry';
import { 
  Search, ThumbsUp, ThumbsDown, Sparkles, X, 
  Store, Star, Eye, ArrowRight, CheckCircle2, FlaskConical, ChevronDown, ChevronUp
} from 'lucide-react';

const COMMUNITY_SELLERS = [
  { id: 'all', name: 'All 6 Sellers', tag: 'All' },
  { id: 'second_theory', name: 'Second Theory', tag: '🍾 Bottles' },
  { id: 'fragfever', name: 'FragFever', tag: '🍾 Bottles' },
  { id: 'apex_aroma', name: 'Apex Aroma', tag: '🍾 Bottles' },
  { id: 'liquid_emotions', name: 'Liquid Emotions', tag: '🧪 Decants' },
  { id: 'bluewings', name: 'Blue Wings', tag: '🍾 & 🧪' },
  { id: 'whiffculture', name: 'Whiff Culture', tag: '🍾 & 🧪' }
];

export default function App() {
  const [allFragrances] = useState(fragrancesData);
  
  // Theme state: 'fresh' (Glacier Fresh Day) or 'night' (Midnight Frost Dark)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('fragscanner_theme') || 'fresh';
    } catch {
      return 'fresh';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fragscanner_theme', theme);
    } catch {}
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
  }, [theme]);

  // Global Price Discovery Search Bar & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('all');
  
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

  // Dual Toggle: Like Handler (Clears anchor search textbox immediately on selection)
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

  // Dual Toggle: Avoid Handler (Clears anchor search textbox immediately on selection)
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
      'rasasi-hawas',
      'afnan-9-pm',
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
      
      let mNotes = false;
      if (f.notes && typeof f.notes === 'object') {
        const allN = [...(f.notes.top || []), ...(f.notes.middle || []), ...(f.notes.base || [])];
        mNotes = allN.some(n => String(n).toLowerCase().includes(q));
      }

      return name.includes(q) || brand.includes(q) || inspo.includes(q) || mNotes;
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
      const matchCount = allFragrances.filter(f => 
        (f.name || '').toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q)
      ).length;
      logSearchQuery(searchQuery, matchCount);
    }
  }, [searchQuery, allFragrances]);

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

  return (
    <div className="min-h-screen bg-glacier-bg text-glacier-text flex flex-col antialiased">
      
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

            {/* Monitored Sellers Button */}
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-glacier-border hover:border-glacier-accent text-glacier-textMuted hover:text-glacier-text transition-colors font-mono text-[11px] shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-glacier-success animate-pulse"></span>
              <span className="hidden md:inline">6 Community Sellers Monitored</span>
              <span className="md:hidden">6 Sellers</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Glacier Search Bar & Global Seller Filter */}
      <section className="bg-white border-b border-glacier-border px-4 sm:px-8 py-4 sm:py-6 shadow-2xs">
        <div className="max-w-6xl mx-auto space-y-4">
          
          {/* Main Direct Search Bar (Active Real-Time Filtering with Autocomplete Dropdown) */}
          <div className="w-full">
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
          </div>

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
                        ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs font-bold'
                        : 'bg-white hover:bg-glacier-bg text-glacier-text border-glacier-border hover:border-glacier-borderDark'
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

        </div>
      </section>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex-1 w-full space-y-8 pb-24">
        
        {/* ======================================================== */}
        {/* STEP 1: CLEAN TASTE ANCHORS (SEARCH & DUAL ACTION)       */}
        {/* ======================================================== */}
        <section className="bg-white rounded-2xl border border-glacier-border p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glacier-subtle pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold block">
                STEP 01 • SENSORY PROFILE
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
                      className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-cyan-700 uppercase font-bold">{f.brand}</div>
                        <div className="font-semibold text-xs text-slate-900 truncate">{f.name}</div>
                        {f.dna_inspiration && (
                          <div className="text-[11px] text-slate-500 truncate">DNA: {f.dna_inspiration}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            handleToggleLike(f.id, e);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            isLiked
                              ? 'bg-cyan-600 text-white font-bold'
                              : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200'
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
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            isDisliked
                              ? 'bg-red-600 text-white font-bold'
                              : 'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200'
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

          {/* Active Selections Area (Clean & Populated dynamically based on selections) */}
          <div className="pt-2">
            {likedIds.length === 0 && dislikedIds.length === 0 ? (
              <div className="p-4 rounded-xl bg-glacier-bg border border-glacier-border text-center text-xs text-glacier-textMuted">
                Your profile is currently clean. Use the search bar above or choose reference perfumes below to build your olfactory taste profile.
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
                        return (
                          <span 
                            key={id} 
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-50 border border-cyan-300 text-cyan-900 text-xs font-medium shadow-2xs"
                          >
                            <span>👍 {f?.name || id}</span>
                            <button 
                              onClick={(e) => handleToggleLike(id, e)} 
                              className="text-cyan-700 hover:text-cyan-950 p-0.5 rounded-full hover:bg-cyan-200/50"
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
                        return (
                          <span 
                            key={id} 
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 border border-red-300 text-red-900 text-xs font-medium shadow-2xs"
                          >
                            <span>👎 Avoid: {f?.name || id}</span>
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
        </section>

        {/* ======================================================== */}
        {/* STEP 2: THE EXACT RICH INSIGHT RECOMMENDATION CARDS      */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glacier-border pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold block">
                STEP 02 • SENSORY INTELLIGENCE
              </span>
              <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                <span>Your Tailored Scent Twins in Stock</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  {recommendations.length} Matches
                </span>
              </h2>
            </div>
            <span className="text-xs text-glacier-textMuted font-mono">
              Pure Olfactory Vector & Lineage Math • Zero AI Fluff
            </span>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-glacier-border p-12 text-center text-xs text-glacier-textMuted space-y-2">
              <p className="font-bold text-slate-900 text-sm">No preferences selected yet.</p>
              <p>Use the search box above or tap 👍 on reference perfumes in Step 01 to populate your tailored scent twins.</p>
            </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendations.slice(0, 10).map((item, idx) => {
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
                            label: s.size || '100ml Retail Bottle',
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

                  return (
                    <div 
                      key={idx}
                      className="bg-white rounded-2xl border border-glacier-border hover:border-cyan-500 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Header with Match Percentage & Brand */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-800 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
                            {f.brand}
                          </span>
                          
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                            <span>{item.matchOutOfFive.toFixed(1)} / 5.0 Match</span>
                          </div>
                        </div>

                        {/* Title & Pricing */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div>
                            <h3 className="font-heading font-bold text-lg text-slate-900 hover:text-cyan-700 transition-colors cursor-pointer" onClick={() => setActiveFragrance(f)}>
                              {f.name}
                            </h3>
                            <p className="text-xs text-glacier-textMuted mt-0.5">
                              {f.dna_inspiration ? `Inspired by ${f.dna_inspiration}` : f.dna_type}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            {hasBottlePrice ? (
                              <div className="font-mono text-lg font-bold text-slate-900">
                                ₹{bottlePriceNum.toLocaleString()}
                              </div>
                            ) : hasDecantPrice ? (
                              <div className="text-xs text-glacier-textMuted font-mono font-medium">Decant only</div>
                            ) : (
                              <div className="text-xs text-glacier-textMuted font-mono">Unquoted</div>
                            )}
                            {hasDecantPrice && (
                              <div className="text-[11px] text-emerald-600 font-semibold font-mono">
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
                            className="px-3 py-1.5 rounded-lg border border-glacier-border hover:border-slate-900 text-xs font-mono font-medium transition-colors bg-white flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Close' : 'Compare Rates'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          
                          {f.community_whatsapp ? (
                            <a
                              href={`https://wa.me/${String(f.community_whatsapp).replace(/\D/g, '').startsWith('91') ? String(f.community_whatsapp).replace(/\D/g, '') : `91${String(f.community_whatsapp).replace(/\D/g, '')}`}?text=${encodeURIComponent(
                                bestLeadPrice > 0
                                  ? `Hi, saw your price for ${displayName} quoted at ₹${bestLeadPrice.toLocaleString()} on FragScanner. Is this in stock?`
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
                              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-colors shadow-xs"
                            >
                              WhatsApp ↗
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
                                        className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[10px] hover:bg-cyan-600 transition-colors"
                                      >
                                        Message ↗
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
                })}
              </div>
            )}
          </section>

      </main>

      {/* Fragrance Details & Multi-Seller Comparison Modal */}
      {activeFragrance && (
        <FragranceDetailModal
          fragrance={activeFragrance}
          allFragrances={allFragrances}
          onClose={() => setActiveFragrance(null)}
          onSelectOther={(other) => setActiveFragrance(other)}
        />
      )}

      {/* Live Seller Sync Stats Modal */}
      {showStatsModal && (
        <SyncStatsModal
          syncMeta={syncMeta}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {/* Frosted Glacier Footer */}
      <footer className="mt-auto border-t border-glacier-border bg-white py-6 px-4 sm:px-8 text-xs text-glacier-textMuted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            FragScanner • Independent community price ledger. Direct WhatsApp contact with verified decanters. 0% markup.
          </p>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Hourly Sheet Sync Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
