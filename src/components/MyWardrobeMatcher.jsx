import React, { useState, useMemo } from 'react';
import { 
  Sparkles, ThumbsUp, ThumbsDown, CheckSquare, Square, 
  AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Heart, 
  Star, Search, Filter, RotateCcw, X, ShieldX, Flame,
  ShoppingBag, Store, ChevronDown, ChevronUp
} from 'lucide-react';
import { getProfileRecommendations } from '../utils/userProfiler';

export default function MyWardrobeMatcher({ allFragrances, onSelectFragrance }) {
  // Dual-Preference State (starts empty as requested)
  const [likedIds, setLikedIds] = useState([]);
  const [dislikedIds, setDislikedIds] = useState([]);
  
  // Selection tab mode: 'like' or 'dislike'
  const [selectionMode, setSelectionMode] = useState('like');
  const [showClashWarnings, setShowClashWarnings] = useState(false);
  
  const [filterBrand, setFilterBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const brands = ['All', 'French Avenue', 'Lattafa', 'Afnan', 'Armaf', 'Titan Skinn', 'Rasasi', 'Mykonos', 'Rayhaan'];

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
    return allFragrances.filter(f => {
      if (filterBrand !== 'All' && f.brand.toLowerCase() !== filterBrand.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q) || (f.dna_inspiration || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [allFragrances, filterBrand, searchQuery]);

  const likedPerfumes = useMemo(() => {
    return allFragrances.filter(f => likedIds.includes(f.id));
  }, [allFragrances, likedIds]);

  const dislikedPerfumes = useMemo(() => {
    return allFragrances.filter(f => dislikedIds.includes(f.id));
  }, [allFragrances, dislikedIds]);

  // Run dual recommendation calculation
  const { likedProfile, dislikedProfile, likes, sellerMatches, dislikes } = useMemo(() => {
    return getProfileRecommendations(likedPerfumes, dislikedPerfumes, allFragrances);
  }, [likedPerfumes, dislikedPerfumes, allFragrances]);

  const hasSelections = likedIds.length > 0 || dislikedIds.length > 0;

  return (
    <div className="bg-[#0f172a] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 my-8 shadow-2xl relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Dual-Preference Engine (Mix & Match Likes, Filter Out Dislikes)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">
            Your Scent Wardrobe & Dislike Filter
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Select perfumes you <span className="text-emerald-400 font-bold">Like / Love (1 to 10)</span> to extract your favorite accords & notes, and check perfumes you <span className="text-rose-400 font-bold">Dislike / Avoid (1 to 10)</span> so the engine actively ignores those scent types in your top recommendations.
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

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          
          {/* Brand Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setFilterBrand(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  filterBrand === b
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Quick search inside checkboxes */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search perfumes..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 w-44"
            />
          </div>
        </div>

        {/* Scrollable Checkbox Grid */}
        <div className="max-h-72 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
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

      {/* ==================== THE TWO RECOMMENDATION SECTIONS ==================== */}
      {hasSelections ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ================= SECTION 1: BEST MATCH OVERALL ================= */}
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
                        <div className="text-right">
                          {item.fragrance.in_second_theory_sheet && item.fragrance.community_price ? (
                            <>
                              <span className="text-xs font-bold text-emerald-400 font-mono">
                                ₹{item.fragrance.community_price}
                              </span>
                              <span className="block text-[9px] text-emerald-400 font-semibold">
                                (In Stock)
                              </span>
                            </>
                          ) : (
                            <span className="inline-block text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                              Not in Seller Stock
                            </span>
                          )}
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
                Top matching fragrances that are <strong className="text-amber-300">verified in-stock with community sellers (Second Theory & FragFever)</strong>, compared by best price:
              </p>

              <div className="space-y-3">
                {sellerMatches && sellerMatches.length > 0 ? (
                  sellerMatches.map((item, idx) => {
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
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
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
                                  {sellerCount} Sellers Compared
                                </span>
                              )}
                            </div>
                            
                            {/* Seller Price Highlight */}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-sm font-mono shadow-sm">
                              <span>Best: ₹{sellerQuote}</span>
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
                            {item.fragrance.collection} • {item.fragrance.concentration} • Lowest quote by <strong className="text-emerald-400 font-semibold">{bestSeller?.seller_name}</strong>
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

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onSelectFragrance(item.fragrance)}
                            className="text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                            <span>Compare {sellerCount} {sellerCount > 1 ? 'Sellers' : 'Seller'}</span>
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-transform hover:scale-105 shadow"
                          >
                            <span>Buy from {bestSeller?.seller_name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
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
            Check the boxes for <span className="text-emerald-400 font-semibold">1 to 10 fragrances you love</span> and optionally check <span className="text-rose-400 font-semibold">perfumes you dislike</span> to generate your personalized <span className="text-emerald-400 font-semibold">Top 5 Closest Matches (Out of 5.0)</span> and <span className="text-rose-400 font-semibold">Top 5 Clash Warnings</span>.
          </p>
        </div>
      )}

    </div>
  );
}
