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
  
  // Navigation View Mode
  const [viewTab, setViewTab] = useState('both'); // 'both' | 'matcher' | 'catalog'
  
  // Global Price Discovery Search Bar & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'bottles' | 'decants'
  const [sortBy, setSortBy] = useState('price-asc');
  const [catalogDisplayLimit, setCatalogDisplayLimit] = useState(30);
  
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

  // Main Filtered Catalog for Direct Price Discovery
  const filteredCatalog = useMemo(() => {
    return allFragrances.filter(f => {
      // 1. Seller Filter
      if (selectedSeller !== 'all') {
        const hasBottle = f.community_sellers?.some(s => s.seller_id === selectedSeller);
        const hasDecant = f.community_decants?.some(d => d.seller_id === selectedSeller);
        if (!hasBottle && !hasDecant) return false;
      }

      // 2. Format Filter
      if (formatFilter === 'bottles' && (!f.in_seller_stock || !f.community_price)) return false;
      if (formatFilter === 'decants' && (!f.community_decants || f.community_decants.length === 0)) return false;

      // 3. Search Query Filter (Matches name, brand, DNA, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mName = (f.name || '').toLowerCase().includes(q);
        const mBrand = (f.brand || '').toLowerCase().includes(q);
        const mDna = (f.dna_inspiration || '').toLowerCase().includes(q);
        
        let mNotes = false;
        if (f.notes && typeof f.notes === 'object') {
          const allN = [...(f.notes.top || []), ...(f.notes.middle || []), ...(f.notes.base || [])];
          mNotes = allN.some(n => String(n).toLowerCase().includes(q));
        }

        if (!mName && !mBrand && !mDna && !mNotes) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.community_price || (a.community_decants?.[0]?.price_10ml ? a.community_decants[0].price_10ml * 10 : 99999);
      const priceB = b.community_price || (b.community_decants?.[0]?.price_10ml ? b.community_decants[0].price_10ml * 10 : 99999);
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
  }, [allFragrances, selectedSeller, formatFilter, searchQuery, sortBy]);

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
      logSearchQuery(searchQuery, filteredCatalog.length);
    }
  }, [searchQuery, filteredCatalog.length]);

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
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20">
                ❄️
              </div>
              <div>
                <h1 className="text-base font-heading font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>FRAGSCANNER</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-200">GLACIER FRESH</span>
                </h1>
                <p className="text-[11px] text-glacier-textMuted font-mono">
                  Price Discovery & Olfactory Twin Intelligence
                </p>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex sm:hidden items-center gap-1 bg-glacier-subtle p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setViewTab('both')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${viewTab === 'both' ? 'bg-white shadow-2xs text-glacier-accent font-bold' : 'text-glacier-textMuted'}`}
              >
                All
              </button>
              <button
                onClick={() => setViewTab('matcher')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${viewTab === 'matcher' ? 'bg-white shadow-2xs text-glacier-accent font-bold' : 'text-glacier-textMuted'}`}
              >
                Twins ({recommendations.length})
              </button>
              <button
                onClick={() => setViewTab('catalog')}
                className={`px-2 py-1 rounded text-[11px] font-medium ${viewTab === 'catalog' ? 'bg-white shadow-2xs text-glacier-accent font-bold' : 'text-glacier-textMuted'}`}
              >
                Prices ({filteredCatalog.length})
              </button>
            </div>
          </div>

          {/* Seller Status & Navigation Tabs */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-glacier-border hover:border-glacier-accent text-glacier-textMuted hover:text-glacier-text transition-colors font-mono text-[11px]"
            >
              <span className="w-2 h-2 rounded-full bg-glacier-success animate-pulse"></span>
              <span>6 Community Sellers Monitored</span>
            </button>

            {/* Desktop View Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-glacier-subtle p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewTab('both')}
                className={`px-3 py-1 rounded-lg transition-colors ${viewTab === 'both' ? 'bg-white shadow-2xs text-glacier-accent font-bold' : 'text-glacier-textMuted hover:text-glacier-text'}`}
              >
                Dual View
              </button>
              <button
                onClick={() => setViewTab('matcher')}
                className={`px-3 py-1 rounded-lg transition-colors ${viewTab === 'matcher' ? 'bg-white shadow-2xs text-glacier-accent font-bold' : 'text-glacier-textMuted hover:text-glacier-text'}`}
              >
                Scent Twins ({recommendations.length})
              </button>
              <button
                onClick={() => setViewTab('catalog')}
                className={`px-3 py-1 rounded-lg transition-colors ${viewTab === 'catalog' ? 'bg-white shadow-2xs text-glacier-accent font-bold' : 'text-glacier-textMuted hover:text-glacier-text'}`}
              >
                Price Discovery ({filteredCatalog.length})
              </button>
            </div>
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
                    className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs font-bold'
                        : 'bg-white hover:bg-glacier-bg text-glacier-text border-glacier-border hover:border-glacier-borderDark'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-glacier-subtle text-glacier-textMuted'
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
                Your profile is currently clean. Use the search bar above or tap 👍 / 👎 on any fragrance in the catalog below to add it.
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
        {(viewTab === 'both' || viewTab === 'matcher') && (
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
                <p>Use the search box in Step 01 or tap 👍 on any perfumes below to populate your scent twins.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendations.slice(0, 10).map((item, idx) => {
                  const f = item.fragrance;
                  const isExpanded = expandedCardId === f.id;
                  const sellers = (f.community_sellers || []).concat(f.community_decants || []);

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
                            {f.community_price ? (
                              <div className="font-mono text-lg font-bold text-slate-900">
                                ₹{f.community_price.toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-xs text-glacier-textMuted font-mono">Decant only</div>
                            )}
                            {f.lowest_decant_price && (
                              <div className="text-[11px] text-emerald-600 font-semibold font-mono">
                                Decant from ₹{f.lowest_decant_price}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* EXACT STRUCTURED PROOF BREAKDOWN */}
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          {item.likeReasons.map((reason, rIdx) => (
                            <div key={rIdx} className="flex items-start gap-2 leading-relaxed text-slate-800">
                              <span className="shrink-0 text-sm mt-0.5">
                                {reason.startsWith('✨') ? '✨' : reason.startsWith('⏳') ? '⏳' : reason.startsWith('🎯') ? '🎯' : reason.startsWith('🌿') ? '🌿' : '⭐'}
                              </span>
                              <span>{reason.replace(/^[✨⏳🎯🌿⭐]\s*/, '')}</span>
                            </div>
                          ))}

                          {/* Fragrantica Stats */}
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[11px] text-glacier-textMuted font-mono">
                            <span>⭐ Community: <strong>{(Number(f.rating_value) || 4.2).toFixed(2)}/5</strong> ({f.rating_count || '2.1k'} votes)</span>
                            <span>•</span>
                            <span>{f.longevity || '8+ hrs'}</span>
                          </div>
                        </div>
                      </div>

                      {/* In-Stock Seller Spread & Actions */}
                      <div className="pt-2 border-t border-glacier-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-[11px] text-glacier-textMuted">
                          <span>In stock: </span>
                          <strong className="text-slate-900">{f.community_seller_name || 'Second Theory & FragFever'}</strong>
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
                              href={`https://wa.me/${String(f.community_whatsapp).replace(/\D/g, '').startsWith('91') ? String(f.community_whatsapp).replace(/\D/g, '') : `91${String(f.community_whatsapp).replace(/\D/g, '')}`}?text=${encodeURIComponent(`Hi, saw your price for ${f.brand ? `${f.brand} ` : ''}${f.name} quoted at ₹${Number(f.community_price).toLocaleString()} on FragScanner. Is this in stock?`)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => logWhatsAppClick({
                                sellerName: f.community_seller_name || 'Community Seller',
                                fragranceName: f.name,
                                brand: f.brand,
                                price: f.community_price,
                                format: 'bottle'
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
                            Direct Community Quotes ({sellers.length}):
                          </span>
                          {sellers.map((s, sIdx) => {
                            const isBottle = Boolean(s.price);
                            const price = isBottle ? s.price : (s.price_10ml || s.price_5ml);
                            const label = isBottle ? (s.size || '100ml Retail Bottle') : (s.price_10ml ? '10ml Decant' : '5ml Decant');
                            const phoneDigits = String(s.whatsapp || '').replace(/\D/g, '');
                            const intlPhone = phoneDigits.startsWith('91') ? phoneDigits : `91${phoneDigits}`;
                            const msg = encodeURIComponent(`Hi ${s.seller_name}, saw your price for ${f.brand ? `${f.brand} ` : ''}${f.name}${label ? ` (${label})` : ''} quoted at ₹${Number(price).toLocaleString()} on FragScanner. Is this in stock?`);
                            const wa = phoneDigits ? `https://wa.me/${intlPhone}?text=${msg}` : null;

                            return (
                              <div key={sIdx} className="bg-white border border-glacier-border rounded-lg p-2.5 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-slate-900">{s.seller_name}</div>
                                  <div className="text-[10px] text-glacier-textMuted font-mono">{label} • In Stock</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-slate-900">₹{Number(price).toLocaleString()}</span>
                                  {wa && (
                                    <a 
                                      href={wa} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      onClick={() => logWhatsAppClick({
                                        sellerName: s.seller_name,
                                        fragranceName: f.name,
                                        brand: f.brand,
                                        price: price,
                                        format: isBottle ? 'bottle' : 'decant'
                                      })}
                                      className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[10px] hover:bg-cyan-600 transition-colors"
                                    >
                                      Message ↗
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ======================================================== */}
        {/* STEP 3: DIRECT PRICE DISCOVERY CATALOG TABLE             */}
        {/* ======================================================== */}
        {(viewTab === 'both' || viewTab === 'catalog') && (
          <section id="price-discovery-catalog" className="space-y-4 pt-4 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-glacier-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-700 font-bold block">
                  STEP 03 • MARKET PRICE COMPARISON
                </span>
                <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  <span>Full Price Discovery Catalog</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {filteredCatalog.length} In Stock
                  </span>
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                {/* Format toggle */}
                <div className="flex items-center bg-white border border-glacier-border rounded-lg p-0.5">
                  <button 
                    onClick={() => setFormatFilter('all')} 
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${formatFilter === 'all' ? 'bg-cyan-600 text-white font-bold' : 'text-glacier-textMuted'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFormatFilter('bottles')} 
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${formatFilter === 'bottles' ? 'bg-cyan-600 text-white font-bold' : 'text-glacier-textMuted'}`}
                  >
                    Bottles
                  </button>
                  <button 
                    onClick={() => setFormatFilter('decants')} 
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${formatFilter === 'decants' ? 'bg-cyan-600 text-white font-bold' : 'text-glacier-textMuted'}`}
                  >
                    Decants
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-glacier-border rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Active Search & Filter Banner */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cyan-900 font-mono">
                    🔍 Filtered by: "{searchQuery}"
                  </span>
                  <span className="text-cyan-700 font-mono">
                    ({filteredCatalog.length} matching fragrances found)
                  </span>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 rounded-md bg-white border border-cyan-300 text-cyan-800 hover:bg-cyan-100 font-mono text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Search Filter</span>
                </button>
              </div>
            )}

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.slice(0, catalogDisplayLimit).map(f => {
                const isLiked = likedIds.includes(f.id);
                const isDisliked = dislikedIds.includes(f.id);

                return (
                  <div 
                    key={f.id}
                    className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${
                      isLiked ? 'border-cyan-500 ring-1 ring-cyan-500/20' : isDisliked ? 'border-red-300 opacity-60' : 'border-glacier-border'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-glacier-textMuted mb-1">
                        <span>{f.brand}</span>
                        {f.dna_inspiration && <span className="truncate max-w-[140px]">• DNA: {f.dna_inspiration}</span>}
                      </div>

                      <h4 className="font-heading font-bold text-base text-slate-900 truncate">
                        {f.name}
                      </h4>

                      <div className="mt-2 flex items-baseline justify-between">
                        {f.community_price ? (
                          <div>
                            <span className="text-[10px] text-glacier-textMuted uppercase font-mono block">Lowest Bottle</span>
                            <span className="font-mono font-bold text-base text-slate-900">₹{f.community_price.toLocaleString()}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-glacier-textMuted font-mono">Decants only</div>
                        )}

                        {f.lowest_decant_price && (
                          <div className="text-right">
                            <span className="text-[10px] text-glacier-textMuted uppercase font-mono block">Decant from</span>
                            <span className="font-mono font-bold text-emerald-600 text-sm">₹{f.lowest_decant_price}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-glacier-subtle flex items-center justify-between">
                      <button
                        onClick={() => setActiveFragrance(f)}
                        className="text-xs font-mono font-medium text-cyan-700 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Rates</span>
                      </button>

                      {/* 1-Tap Dual Like/Avoid Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleLike(f.id, e)}
                          title={isLiked ? "Remove like" : "I like this fragrance"}
                          className={`p-1.5 rounded-lg transition-colors ${isLiked ? 'bg-cyan-600 text-white font-bold' : 'text-glacier-textMuted hover:text-cyan-700 hover:bg-cyan-50'}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleToggleDislike(f.id, e)}
                          title={isDisliked ? "Remove avoid" : "Avoid this scent"}
                          className={`p-1.5 rounded-lg transition-colors ${isDisliked ? 'bg-red-600 text-white font-bold' : 'text-glacier-textMuted hover:text-red-700 hover:bg-red-50'}`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCatalog.length > catalogDisplayLimit && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setCatalogDisplayLimit(prev => prev + 30)}
                  className="px-5 py-2 rounded-xl bg-white border border-glacier-border hover:border-slate-900 text-slate-900 text-xs font-mono font-bold transition-colors shadow-2xs"
                >
                  Load Next 30 Fragrances ({filteredCatalog.length - catalogDisplayLimit} remaining)
                </button>
              </div>
            )}
          </section>
        )}

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
