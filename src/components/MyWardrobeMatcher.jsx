import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, ThumbsUp, ThumbsDown, CheckSquare, Square, 
  AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Heart, 
  Star, Search, Filter, RotateCcw, X, ShieldX, Flame,
  ShoppingBag, Store, ChevronDown, ChevronUp, Building2, FlaskConical
} from 'lucide-react';
import { getProfileRecommendations } from '../utils/userProfiler';
import { logWardrobeSelection } from '../lib/supabaseTelemetry';

const COMMUNITY_SELLERS = [
  { id: 'all', name: 'All Sellers', tag: 'All 6' },
  { id: 'second_theory', name: 'Second Theory', tag: '🍾 Bottles' },
  { id: 'fragfever', name: 'FragFever', tag: '🍾 Bottles' },
  { id: 'apex_aroma', name: 'Apex Aroma', tag: '🍾 Bottles' },
  { id: 'liquid_emotions', name: 'Liquid Emotions', tag: '🧪 Decants' },
  { id: 'bluewings', name: 'Blue Wings', tag: '🍾 & 🧪' },
  { id: 'whiffculture', name: 'Whiff Culture', tag: '🍾 & 🧪' }
];

const CORE_FEATURED_BRANDS = [
  'Lattafa', 'Armaf', 'Rasasi', 'Afnan', 'Titan Skinn', 
  'Mykonos', 'Rayhaan', 'Ahmed Al Maghribi', 'French Avenue', 
  'Paris Corner', 'Swiss Arabian', 'Al Haramain', 'Maison Alhambra', 'Dumont'
];

export default function MyWardrobeMatcher({ 
  allFragrances, 
  onSelectFragrance,
  selectedSeller: externalSeller,
  onSelectSeller: externalSetSeller 
}) {
  const [internalSeller, setInternalSeller] = useState('all');
  const selectedSeller = externalSeller !== undefined ? externalSeller : internalSeller;
  const setSelectedSeller = externalSetSeller || setInternalSeller;

  // Dual-Preference State (starts empty as requested)
  const [likedIds, setLikedIds] = useState([]);
  const [dislikedIds, setDislikedIds] = useState([]);
  
  // Selection tab mode: 'like' or 'dislike'
  const [selectionMode, setSelectionMode] = useState('like');
  const [showClashWarnings, setShowClashWarnings] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeRecTab, setActiveRecTab] = useState('overview'); // 'overview' | 'sellers' | 'companies'
  
  const [filterBrand, setFilterBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Priority-ordered brand list ensuring user's core houses are upfront
  const brands = useMemo(() => {
    const present = new Set();
    allFragrances.forEach(f => { if (f.brand) present.add(f.brand); });

    const prioritized = CORE_FEATURED_BRANDS.filter(b => present.has(b));
    const remaining = Array.from(present)
      .filter(b => !CORE_FEATURED_BRANDS.includes(b))
      .sort((a, b) => a.localeCompare(b));

    return ['All', ...prioritized, ...remaining];
  }, [allFragrances]);

  // Toggle Like handler (max 10)
  const toggleLike = (id) => {
    if (likedIds.includes(id)) {
      setLikedIds(likedIds.filter(item => item !== id));
    } else {
      if (likedIds.length >= 10) {
        alert("You have reached the maximum limit of 10 liked perfumes! Please uncheck one to add another.");
        return;
      }
      setLikedIds([...likedIds, id]);
      // Remove from dislikes if it was marked
      if (dislikedIds.includes(id)) {
        setDislikedIds(dislikedIds.filter(item => item !== id));
      }
    }
  };

  // Toggle Dislike handler (max 10)
  const toggleDislike = (id) => {
    if (dislikedIds.includes(id)) {
      setDislikedIds(dislikedIds.filter(item => item !== id));
    } else {
      if (dislikedIds.length >= 10) {
        alert("You have reached the maximum limit of 10 disliked perfumes! Please uncheck one to add another.");
        return;
      }
      setDislikedIds([...dislikedIds, id]);
      // Remove from likes if it was marked
      if (likedIds.includes(id)) {
        setLikedIds(likedIds.filter(item => item !== id));
      }
    }
  };

  const clearAll = () => {
    setLikedIds([]);
    setDislikedIds([]);
  };

  // Filtered fragrances for checkbox selection
  const visibleFragrances = useMemo(() => {
    const list = allFragrances.filter(f => {
      // Filter out unverified sheet placeholder stubs
      if (f.id.startsWith('st-9') && f.id !== 'st-9026' && f.description?.includes('Features aromatic accords with notes of Bergamot, Lavender and Amber')) {
        return false;
      }
      if (filterBrand !== 'All' && f.brand.toLowerCase() !== filterBrand.toLowerCase()) {
        return false;
      }
      if (selectedSeller !== 'all') {
        const hasBottle = f.community_sellers?.some(s => s.seller_id === selectedSeller);
        const hasDecant = f.community_decants?.some(d => d.seller_id === selectedSeller);
        if (!hasBottle && !hasDecant) return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q) || (f.dna_inspiration || '').toLowerCase().includes(q);
      }
      return true;
    });

    // Smart sorting:
    // 1. Liked or Disliked items first
    // 2. Verified In-Stock with Community Sellers next
    // 3. Alphabetical by name so collections (Hawas, Odyssey, Club de Nuit, Yara) group together
    return list.sort((a, b) => {
      const aSelected = likedIds.includes(a.id) || dislikedIds.includes(a.id);
      const bSelected = likedIds.includes(b.id) || dislikedIds.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      const aInStock = Boolean(a.in_seller_stock && a.community_price);
      const bInStock = Boolean(b.in_seller_stock && b.community_price);
      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [allFragrances, filterBrand, searchQuery, likedIds, dislikedIds]);

  const likedPerfumes = useMemo(() => {
    return allFragrances.filter(f => likedIds.includes(f.id));
  }, [allFragrances, likedIds]);

  const dislikedPerfumes = useMemo(() => {
    return allFragrances.filter(f => dislikedIds.includes(f.id));
  }, [allFragrances, dislikedIds]);

  // Run dual recommendation calculation with Olfactory Umbrella & Multi-Company Matches
  const { 
    likedProfile = null, 
    dislikedProfile = null, 
    umbrella = null, 
    likes = [], 
    sellerMatches = [], 
    companyMatches = [], 
    dislikes = [] 
  } = useMemo(() => {
    return getProfileRecommendations(likedPerfumes, dislikedPerfumes, allFragrances) || {};
  }, [likedPerfumes, dislikedPerfumes, allFragrances]);

  // Seller-filtered matches for Ready to Buy tab
  const filteredSellerMatches = useMemo(() => {
    if (selectedSeller === 'all') return sellerMatches;
    return sellerMatches.filter(item => {
      const f = item.fragrance;
      const hasBottle = f.community_sellers?.some(s => s.seller_id === selectedSeller);
      const hasDecant = f.community_decants?.some(d => d.seller_id === selectedSeller);
      return hasBottle || hasDecant;
    });
  }, [sellerMatches, selectedSeller]);

  const hasSelections = likedIds.length > 0 || dislikedIds.length > 0;

  // Real-time Supabase Telemetry: Captures likes/dislikes 2.5s after user finishes selecting
  useEffect(() => {
    if (likedPerfumes.length > 0 || dislikedPerfumes.length > 0) {
      logWardrobeSelection({
        likedPerfumes,
        dislikedPerfumes,
        umbrella,
        topRecommendations: likes
      });
    }
  }, [likedPerfumes, dislikedPerfumes, umbrella, likes]);

  return (
    <div className="bg-[#0f172a] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 my-8 shadow-2xl relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif-luxury tracking-wide">
              Scent Wardrobe & Matcher
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Likes & Dislikes Engine
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Check scents you <strong className="text-emerald-400">Like (👍)</strong> and <strong className="text-rose-400">Dislike (👎)</strong> below. The algorithm finds your scent twins and checks live stock across 6 community sellers.
          </p>
        </div>

        {/* Counter Badges & Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Liked count pill */}
          <button 
            onClick={() => setSelectionMode('like')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectionMode === 'like'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/30'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Likes:</span>
            <span className="font-mono text-white text-sm font-black">{likedIds.length}</span>
            <span className="text-slate-500 text-[10px]">/ 10</span>
          </button>

          {/* Disliked count pill */}
          <button 
            onClick={() => setSelectionMode('dislike')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectionMode === 'dislike'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/10 ring-2 ring-rose-400/30'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Dislikes:</span>
            <span className="font-mono text-white text-sm font-black">{dislikedIds.length}</span>
            <span className="text-slate-500 text-[10px]">/ 10</span>
          </button>

          {hasSelections && (
            <button
              onClick={clearAll}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1 border border-slate-700"
              title="Clear all selections"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* CHECKBOX SELECTION CONTAINER */}
      <div className="bg-[#141f36] border border-slate-800 rounded-2xl p-5 mb-8">
        
        {/* MODE TABS SWITCHER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectionMode('like')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                selectionMode === 'like'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Checking: Perfumes I Like ({likedIds.length}/10)</span>
            </button>

            <button
              onClick={() => setSelectionMode('dislike')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                selectionMode === 'dislike'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Checking: Perfumes I Dislike / Hate ({dislikedIds.length}/10)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            {selectionMode === 'like' ? (
              <span className="text-emerald-300">Tip: Click cards below to check perfumes you love.</span>
            ) : (
              <span className="text-rose-300">Tip: Click cards below to mark scent profiles you hate/avoid.</span>
            )}
          </div>
        </div>

        {/* SELLER FILTER PILLS (All 6 Verified Community Sellers) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2.5 mb-3.5 border-b border-slate-800/80">
          <span className="text-[11px] font-bold text-amber-400 whitespace-nowrap flex items-center gap-1.5 mr-1 shrink-0">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter by Seller:</span>
          </span>
          {COMMUNITY_SELLERS.map(s => {
            const isSelected = selectedSeller === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSeller(s.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{s.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {s.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          
          {/* Brand Pills (Touch swipeable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setFilterBrand(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  filterBrand === b
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Quick search inside checkboxes */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, brand, or note (e.g. Kobra, Hawas)..."
                className="pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 w-56 sm:w-72"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              {visibleFragrances.length} scents
            </span>
          </div>
        </div>

        {/* Scrollable Checkbox Grid */}
        <div className="max-h-[440px] overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {visibleFragrances.map(fragrance => {
            const isLiked = likedIds.includes(fragrance.id);
            const isDisliked = dislikedIds.includes(fragrance.id);
            const isMaxLikes = likedIds.length >= 10 && !isLiked;
            const isMaxDislikes = dislikedIds.length >= 10 && !isDisliked;

            const handleCardClick = () => {
              if (selectionMode === 'like') {
                if (!isMaxLikes) toggleLike(fragrance.id);
              } else {
                if (!isMaxDislikes) toggleDislike(fragrance.id);
              }
            };

            return (
              <div
                key={fragrance.id}
                onClick={handleCardClick}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none relative group ${
                  isLiked
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-500/10'
                    : isDisliked
                    ? 'bg-rose-950/40 border-rose-500 shadow-sm shadow-rose-500/10'
                    : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Status Indicator Icon */}
                <div className="mt-0.5 shrink-0">
                  {isLiked ? (
                    <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-slate-950">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  ) : isDisliked ? (
                    <div className="w-4 h-4 rounded bg-rose-500 flex items-center justify-center text-white">
                      <X className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800/80 group-hover:border-slate-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-amber-400 truncate">{fragrance.brand}</span>
                    <span className="text-[10px] text-slate-400">★ {fragrance.rating_value.toFixed(1)}</span>
                  </div>
                  <h4 className={`text-xs font-bold truncate ${
                    isLiked ? 'text-emerald-200' : isDisliked ? 'text-rose-200 line-through' : 'text-slate-200'
                  }`}>
                    {fragrance.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {fragrance.dna_inspiration ? `Inspired by ${fragrance.dna_inspiration}` : fragrance.collection}
                  </p>
                  
                  {/* Full Bottle & Decant Dual Price Badges */}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {fragrance.community_price ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        🍾 ₹{fragrance.community_price}
                      </span>
                    ) : null}
                    {fragrance.has_decants && fragrance.lowest_decant_price ? (
                      <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 flex items-center gap-0.5">
                        <FlaskConical className="w-2.5 h-2.5 text-cyan-400" />
                        5ml ₹{fragrance.lowest_decant_price}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Quick Action Buttons for explicit Like / Dislike */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(fragrance.id);
                    }}
                    title={isLiked ? "Remove from Liked" : "Mark as Liked"}
                    className={`p-1 rounded-md text-[10px] transition-colors ${
                      isLiked 
                        ? 'bg-emerald-500 text-slate-950 font-bold' 
                        : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDislike(fragrance.id);
                    }}
                    title={isDisliked ? "Remove from Disliked" : "Mark as Disliked"}
                    className={`p-1 rounded-md text-[10px] transition-colors ${
                      isDisliked 
                        ? 'bg-rose-500 text-white font-bold' 
                        : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected summary chips (Both Liked and Disliked) */}
        {hasSelections && (
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            {likedPerfumes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mr-1">
                  <ThumbsUp className="w-3 h-3" /> Liked ({likedPerfumes.length}):
                </span>
                {likedPerfumes.map(p => (
                  <span 
                    key={p.id}
                    onClick={() => toggleLike(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-[11px] border border-emerald-500/30 cursor-pointer transition-colors"
                    title="Click to remove from liked"
                  >
                    <span>{p.brand} {p.name}</span>
                    <X className="w-2.5 h-2.5 text-emerald-400" />
                  </span>
                ))}
              </div>
            )}

            {dislikedPerfumes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 mr-1">
                  <ThumbsDown className="w-3 h-3" /> Avoid / Dislike ({dislikedPerfumes.length}):
                </span>
                {dislikedPerfumes.map(p => (
                  <span 
                    key={p.id}
                    onClick={() => toggleDislike(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[11px] border border-rose-500/30 cursor-pointer transition-colors"
                    title="Click to remove from avoid list"
                  >
                    <span>{p.brand} {p.name}</span>
                    <X className="w-2.5 h-2.5 text-rose-400" />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== THE OLFACTORY UMBRELLA & RECOMMENDATION SECTIONS ==================== */}
      {hasSelections ? (
        <div className="space-y-8">

          {/* ================= SENSORY UMBRELLA SYNTHESIS CARD ================= */}
          {umbrella && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-[#101c33] to-slate-900/95 border-2 border-amber-500/40 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {umbrella.icon || '✨'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Your Olfactory Umbrella
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Synthesized from {umbrella.likedPerfumesCount} liked & {umbrella.dislikedPerfumesCount} avoided perfumes
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-serif-luxury tracking-wide">
                      {umbrella.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                      {umbrella.vibe}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <span className="text-[11px] px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1">
                    <span>🗓️</span> {umbrella.bestSeason}
                  </span>
                  <span className="text-[11px] px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1">
                    <span>⏱️</span> {umbrella.dayNight}
                  </span>
                </div>
              </div>

              {/* Notes Breakdown: Green Zone (Likes) vs Red Zone (Forbidden/Shielded) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                
                {/* Green Zone: Preferred Notes */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Core Notes Under Your Umbrella</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-normal">Favored by algorithm</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {umbrella.favoriteNotes.map((n, idx) => (
                      <span 
                        key={idx}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                          umbrella.universalAnchorNotes.includes(n)
                            ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold shadow-sm'
                            : 'bg-emerald-900/40 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {umbrella.universalAnchorNotes.includes(n) && '⭐ '}
                        {n.charAt(0).toUpperCase() + n.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Red Zone: Shielded Notes (Blocked) */}
                <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldX className="w-4 h-4 text-rose-400" />
                      <span>Forbidden Notes Shield (Dislike Filter)</span>
                    </span>
                    <span className="text-[10px] text-rose-400 font-normal">Actively bypassed</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {umbrella.shieldedNotes.length > 0 ? (
                      umbrella.shieldedNotes.map((n, idx) => (
                        <span 
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-900/40 border border-rose-500/30 text-rose-300 font-medium"
                        >
                          🚫 {n.charAt(0).toUpperCase() + n.slice(1)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        No dislikes checked yet — check perfumes you hate to shield their notes.
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= RECS TAB SWITCHER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <button
                onClick={() => setActiveRecTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeRecTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Best Scent Twins ({likes.length})</span>
              </button>

              <button
                onClick={() => setActiveRecTab('sellers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeRecTab === 'sellers'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>2. Ready to Buy • Live Sellers ({sellerMatches.length})</span>
              </button>

              <button
                onClick={() => setActiveRecTab('companies')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeRecTab === 'companies'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>3. Best for Every Company ({companyMatches.length} Houses)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-black">NEW</span>
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Explore recommendations tailored to your scent umbrella
            </span>
          </div>

          {/* ================= TAB CONTENT 1 & 2: OVERVIEW 2-COLUMN VIEW ================= */}
          {(activeRecTab === 'overview' || activeRecTab === 'sellers') && (
          <div className={`grid grid-cols-1 ${activeRecTab === 'overview' ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'} gap-8`}>
            
            {/* ================= SECTION 1: BEST MATCH OVERALL ================= */}
            {activeRecTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span>1. Best Matches Overall (Top Scent Twins)</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Ranked Out of 5.0
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Purest olfactory matches to your checked wardrobe notes & accords, actively ignoring any profiles you dislike:
              </p>

              <div className="space-y-3">
                {likes.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectFragrance(item.fragrance)}
                    className="group cursor-pointer p-4 rounded-2xl bg-[#142238] hover:bg-[#1a2d4a] border border-slate-800 hover:border-emerald-500/50 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Top line with brand and Match Out of 5 Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                          {item.fragrance.brand}
                        </span>
                        
                        {/* Closest Match Out of 5 */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm font-mono shadow-sm">
                          <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                          <span>{item.matchOutOfFive.toFixed(1)} / 5.0 Match</span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                          {item.fragrance.name}
                        </h4>
                        <div className="text-right space-y-0.5">
                          {item.fragrance.in_seller_stock && item.fragrance.community_price ? (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-[10px] text-slate-400">Bottle:</span>
                              <span className="text-xs font-bold text-emerald-400 font-mono">
                                ₹{item.fragrance.community_price}
                              </span>
                            </div>
                          ) : (
                            <span className="block text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                              Bottle: Unlisted
                            </span>
                          )}
                          {item.fragrance.has_decants && item.fragrance.lowest_decant_price ? (
                            <div className="flex items-center gap-1 justify-end text-cyan-300">
                              <FlaskConical className="w-2.5 h-2.5 text-cyan-400" />
                              <span className="text-[10px]">Decant:</span>
                              <span className="text-xs font-bold font-mono">
                                ₹{item.fragrance.lowest_decant_price}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-0.5 mb-2.5">
                        {item.fragrance.collection} • {item.fragrance.concentration} • {item.fragrance.primary_season}
                      </p>

                      {/* Why you will like it reasons */}
                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] space-y-1 text-slate-300">
                        {item.likeReasons.map((reason, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.fragrance.dna_inspiration ? `Inspired by ${item.fragrance.dna_inspiration}` : item.fragrance.dna_type}</span>
                      <span className="text-emerald-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View All Sellers & Prices <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* ================= SECTION 2: BEST MATCH AVAILABLE WITH SELLER ================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                  </div>
                  <span>2. Best Matches Available With Sellers</span>
                </div>
                <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Ready to Buy • In Stock
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Top matching fragrances that are <strong className="text-amber-300">verified in-stock with community sellers</strong> across Full Bottles and Decants (5ml–30ml):
                {selectedSeller !== 'all' && (
                  <span className="block mt-1 text-amber-400 font-semibold">
                    Filtered by seller: <strong>{COMMUNITY_SELLERS.find(s => s.id === selectedSeller)?.name}</strong>
                  </span>
                )}
              </p>

              <div className="space-y-3">
                {filteredSellerMatches && filteredSellerMatches.length > 0 ? (
                  filteredSellerMatches.map((item, idx) => {
                    const bestSeller = item.fragrance.community_sellers?.[0];
                    const sellerQuote = item.fragrance.community_price;
                    const sellerCount = item.fragrance.community_sellers?.length || 1;
                    const waNumber = bestSeller?.whatsapp || '8076851481';
                    const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(`Hi ${bestSeller?.seller_name || 'Seller'}, I would like to purchase ${item.fragrance.brand} ${item.fragrance.name} quoted at ₹${sellerQuote}. Is it available?`)}`;

                    return (
                      <div
                        key={idx}
                        className="group p-4 rounded-2xl bg-[#1b1928] hover:bg-[#232036] border border-amber-500/30 hover:border-amber-400 transition-all shadow-md flex flex-col justify-between"
                      >
                        <div>
                          {/* Top line with Brand and Seller Quoted Price Badge */}
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                                {item.fragrance.brand}
                              </span>
                              {item.fragrance.is_hot_seller && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                                  <span>Hot</span>
                                </span>
                              )}
                              {sellerCount > 1 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                                  {sellerCount} Bottle Sellers
                                </span>
                              )}
                              {item.fragrance.has_decants && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                                  <FlaskConical className="w-3 h-3 text-cyan-400" />
                                  Decants Available
                                </span>
                              )}
                            </div>
                            
                            {/* Dual Seller Price Highlights */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {sellerQuote && (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs font-mono shadow-sm">
                                  <span>🍾 Bottle: ₹{sellerQuote}</span>
                                </div>
                              )}
                              {item.fragrance.has_decants && item.fragrance.lowest_decant_price && (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-xs font-mono shadow-sm">
                                  <span>🧪 Decants from ₹{item.fragrance.lowest_decant_price}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-baseline justify-between gap-2">
                            <h4 
                              onClick={() => onSelectFragrance(item.fragrance)}
                              className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors cursor-pointer"
                            >
                              {item.fragrance.name}
                            </h4>
                            <span className="text-xs font-bold text-amber-300 font-mono">
                              ★ {item.matchOutOfFive.toFixed(1)} Match
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-0.5 mb-2.5">
                            {item.fragrance.collection} • {item.fragrance.concentration} • Lowest bottle quote by <strong className="text-emerald-400 font-semibold">{bestSeller?.seller_name}</strong>
                          </p>

                          {/* Why you will like it reasons (Olfactory match profile) */}
                          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] space-y-1 text-slate-300 mb-2.5">
                            {item.likeReasons.map((reason, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>

                          {/* Seller delivery & terms */}
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-[11px] space-y-1.5">
                            <div className="text-slate-300 flex items-center justify-between">
                              <span>Shipping: <strong className="text-emerald-400 font-semibold">{bestSeller?.shipping || 'Included Pan-India'}</strong></span>
                              <span className="text-slate-400">Dispatch: {bestSeller?.dispatch || '24-48 hrs'}</span>
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              {item.fragrance.dna_inspiration ? `Target: Inspired by ${item.fragrance.dna_inspiration}` : item.fragrance.dna_type}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                          <button
                            onClick={() => onSelectFragrance(item.fragrance)}
                            className="text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                            <span>Compare Quotes & Decants</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </button>

                          <div className="flex items-center gap-2">
                            {item.fragrance.has_decants && (
                              <button
                                onClick={() => onSelectFragrance(item.fragrance)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-colors"
                              >
                                <FlaskConical className="w-3 h-3 text-cyan-400" />
                                <span>Decants (5-30ml)</span>
                              </button>
                            )}

                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-transform hover:scale-105 shadow"
                            >
                              <span>Buy Bottle</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-dashed border-slate-700/80 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-300">
                      No direct match in community sellers' current in-stock list for this combination.
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Section 1 above shows your closest olfactory twins across all archive houses.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
          )}

          {/* ================= TAB 3: BROWSE YOU MAY ALSO LIKE BY COMPANY ================= */}
          {activeRecTab === 'companies' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>Your Scent Umbrella: Top Pick for Every Community House</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    For every company in the catalog, our algorithm picked their single best fragrance that fits under your customized olfactory umbrella:
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
                  {companyMatches.length} Houses Analyzed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyMatches.map((comp, cIdx) => {
                  const item = comp.bestMatch;
                  const bestSeller = item.fragrance.community_sellers?.[0];
                  const sellerQuote = item.fragrance.community_price;
                  const waNumber = bestSeller?.whatsapp || '8076851481';
                  const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(`Hi ${bestSeller?.seller_name || 'Seller'}, I want to check availability for ${comp.brand} ${item.fragrance.name} quoted at ₹${sellerQuote || ''}.`)}`;

                  return (
                    <div
                      key={cIdx}
                      className="group p-4 rounded-2xl bg-[#142238] hover:bg-[#192b47] border border-slate-800 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-md"
                    >
                      <div>
                        {/* Company Badge & Match Score */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-amber-400 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                            {comp.brand}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                            <span>{item.matchOutOfFive.toFixed(1)} / 5.0</span>
                          </div>
                        </div>

                        {/* Perfume Name */}
                        <h4 
                          onClick={() => onSelectFragrance(item.fragrance)}
                          className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          {item.fragrance.name}
                        </h4>

                        <p className="text-xs text-slate-400 mt-0.5 mb-2 line-clamp-1">
                          {item.fragrance.dna_inspiration ? `Inspired by ${item.fragrance.dna_inspiration}` : item.fragrance.dna_type}
                        </p>

                        {/* Top Reason */}
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1 mb-3">
                          <div className="flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{item.likeReasons[0] || 'Matches your core accord umbrella.'}</span>
                          </div>
                        </div>

                        {/* In-stock status & price (Full Bottle & Decant) */}
                        <div className="flex items-center justify-between text-xs mb-2 flex-wrap gap-1.5">
                          {comp.hasInStock && sellerQuote ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-extrabold font-mono text-sm">
                                🍾 ₹{sellerQuote}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                In Stock
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                              Bottle: Unlisted
                            </span>
                          )}

                          {item.fragrance.has_decants && item.fragrance.lowest_decant_price ? (
                            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                              <FlaskConical className="w-2.5 h-2.5 text-cyan-400" />
                              Decants ₹{item.fragrance.lowest_decant_price}
                            </span>
                          ) : null}
                        </div>

                        {/* Secondary options within this brand */}
                        {comp.otherOptions && comp.otherOptions.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                            <span className="font-semibold text-slate-400">Also from {comp.brand}:</span>
                            {comp.otherOptions.slice(0, 2).map((alt, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectFragrance(alt.fragrance);
                                }}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors truncate max-w-[120px]"
                              >
                                {alt.fragrance.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectFragrance(item.fragrance)}
                          className="text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect Notes</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {comp.hasInStock && sellerQuote ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-transform hover:scale-105 shadow"
                          >
                            <span>Buy ({bestSeller?.seller_name})</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => onSelectFragrance(item.fragrance)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            <span>View Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= CLASH WARNINGS COLLAPSIBLE (DISLIKED SCENTS) ================= */}
          <div className="rounded-2xl border border-rose-900/40 bg-[#16121f] p-4 sm:p-5">
            <div 
              onClick={() => setShowClashWarnings(!showClashWarnings)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Avoid List / Clash Warnings ({dislikes.length} Fragrances Detected)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-rose-400">
                <span>{showClashWarnings ? 'Hide Clash Warnings' : 'Show Polarizing Scents to Avoid'}</span>
                {showClashWarnings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showClashWarnings && (
              <div className="mt-4 pt-4 border-t border-rose-900/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dislikes.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectFragrance(item.fragrance)}
                    className="p-3.5 rounded-xl bg-[#201426] border border-rose-900/50 hover:border-rose-500 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-rose-400">{item.fragrance.brand}</span>
                      <span className="text-[11px] font-extrabold text-rose-300 font-mono">
                        {item.clashOutOfFive.toFixed(1)} / 5.0 Clash
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-white truncate">{item.fragrance.name}</h5>
                    <p className="text-[11px] text-rose-300/80 mt-1 line-clamp-2">
                      {item.clashReasons[0] || 'Very low accord harmony with your liked preferences.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-slate-900/40 rounded-2xl border border-dashed border-slate-700/80 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Active Wardrobe is Empty (0 Selected)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Check the boxes for <span className="text-emerald-400 font-semibold">1 to 10 fragrances you love</span> and optionally check <span className="text-rose-400 font-semibold">perfumes you dislike</span> to generate your personalized <span className="text-emerald-400 font-semibold">Top 8 Closest Matches</span> and <span className="text-amber-400 font-semibold">Live Community Seller Deals</span>.
          </p>
        </div>
      )}

      {/* ================= MOBILE FLOATING MATCH ACTION PILL (CONCEPT A) ================= */}
      {hasSelections && filteredSellerMatches && filteredSellerMatches.length > 0 && (
        <div 
          onClick={() => setMobileDrawerOpen(true)}
          className="fixed bottom-16 left-4 right-4 z-40 md:hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 font-black text-xs py-3 px-4 rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-between cursor-pointer active:scale-95 transition-all border border-amber-300"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>{filteredSellerMatches.length} Scent Twins Found • Bottles & Decants</span>
          </div>
          <span className="bg-slate-950 text-amber-300 px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            View Deals &uarr;
          </span>
        </div>
      )}

      {/* ================= MOBILE SLIDE-UP COMMUNITY SELLER DRAWER (CONCEPT A) ================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop blur */}
          <div 
            onClick={() => setMobileDrawerOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="relative bg-[#0b1120] border-t-2 border-amber-500 rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh] z-10 animate-in slide-in-from-bottom duration-300">
            
            {/* Notch drag bar */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
              <div>
                <h4 className="font-extrabold text-base text-white font-serif">
                  Live Community Scent Twins
                </h4>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Verified across 6 Sellers: Second Theory, FragFever, Apex Aroma, Liquid Emotions, Blue Wings & Whiff Culture
                </p>
              </div>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm"
              >
                &times;
              </button>
            </div>

            {/* In-Stock Seller Matches List */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 pb-4">
              {filteredSellerMatches.map((item, idx) => {
                const bestSeller = item.fragrance.community_sellers?.[0];
                const sellerQuote = item.fragrance.community_price;
                const waNumber = bestSeller?.whatsapp || '8076851481';
                const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(`Hi ${bestSeller?.seller_name || 'Seller'}, I would like to purchase ${item.fragrance.brand} ${item.fragrance.name} quoted at ₹${sellerQuote} on FragScanner. Is it in stock?`)}`;

                return (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-2xl bg-[#131c31] border border-amber-500/30 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                          {item.fragrance.brand}
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono font-bold">
                          ★ {item.matchOutOfFive.toFixed(1)} Match
                        </span>
                      </div>
                      <h5 
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onSelectFragrance(item.fragrance);
                        }}
                        className="font-extrabold text-xs text-white truncate cursor-pointer hover:text-amber-300"
                      >
                        {item.fragrance.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        {sellerQuote && (
                          <span>Bottle: <strong className="text-emerald-400 font-mono font-bold">₹{sellerQuote}</strong></span>
                        )}
                        {item.fragrance.has_decants && item.fragrance.lowest_decant_price && (
                          <span className="text-cyan-300 font-semibold">• Decant: <strong className="font-mono font-bold">₹{item.fragrance.lowest_decant_price}</strong></span>
                        )}
                      </div>
                    </div>

                    <a 
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shrink-0 shadow-lg shadow-emerald-600/20"
                    >
                      WhatsApp
                    </a>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ================= MOBILE STICKY BOTTOM APP BAR (CONCEPT A) ================= */}
      <div className="fixed bottom-0 inset-x-0 h-14 bg-[#070b14]/95 backdrop-blur-xl border-t border-slate-800/90 flex items-center justify-around px-3 z-30 md:hidden">
        <button 
          onClick={() => {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-amber-400"
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px] font-bold">Explore</span>
        </button>
        
        <button 
          onClick={() => {
            window.scrollTo({ top: 320, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white relative"
        >
          <Heart className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold">
            Wardrobe ({likedIds.length})
          </span>
        </button>

        <button 
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold">
            Twins {sellerMatches?.length > 0 ? `(${sellerMatches.length})` : ''}
          </span>
        </button>
      </div>

    </div>
  );
}
