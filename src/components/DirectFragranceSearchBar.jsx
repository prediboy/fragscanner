import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Star, Store, FlaskConical, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function DirectFragranceSearchBar({ 
  searchQuery, 
  onSearchChange, 
  allFragrances, 
  onSelectFragrance,
  onToggleLike,
  onToggleDislike,
  likedIds = [],
  dislikedIds = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter matching fragrances for dropdown autocomplete
  const results = React.useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const matches = [];
    for (const f of allFragrances) {
      const name = (f.name || '').toLowerCase();
      const brand = (f.brand || '').toLowerCase();
      const inspo = (f.dna_inspiration || '').toLowerCase();
      
      let matchedAlias = null;
      if (Array.isArray(f.aliases)) {
        matchedAlias = f.aliases.find(a => String(a).toLowerCase().includes(q));
      }

      let matchNotes = false;
      if (f.notes && typeof f.notes === 'object') {
        const allN = [...(f.notes.top || []), ...(f.notes.middle || []), ...(f.notes.base || [])];
        matchNotes = allN.some(n => String(n).toLowerCase().includes(q));
      }

      if (
        name.includes(q) ||
        brand.includes(q) ||
        inspo.includes(q) ||
        Boolean(matchedAlias) ||
        matchNotes
      ) {
        matches.push({
          ...f,
          _matchedAlias: matchedAlias
        });
      }
    }

    return matches.slice(0, 8); // Top 8 matches
  }, [searchQuery, allFragrances]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0]);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (fragrance) => {
    if (typeof onSelectFragrance === 'function') {
      onSelectFragrance(fragrance);
    }
    if (typeof onSearchChange === 'function' && fragrance?.name) {
      onSearchChange(fragrance.name);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Container */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-cyan-600 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (searchQuery && searchQuery.trim().length >= 2) setIsOpen(true);
            }}
            placeholder="Search Fragrantica catalog or luxury scent twins (e.g. YSL Y Elixir, Absolu Aventus, Hawas, Angels' Share)..."
            className="w-full bg-white hover:bg-slate-50/50 focus:bg-white border-2 border-slate-200 focus:border-cyan-600 rounded-2xl pl-11 pr-20 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-xs"
          />

          <div className="absolute right-3.5 flex items-center gap-2">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setIsOpen(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Explicit Search Button */}
        <button
          type="submit"
          className="shrink-0 px-3.5 sm:px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-heading font-bold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-98"
        >
          <Search className="w-4 h-4 text-cyan-400 dark:text-white" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && searchQuery && searchQuery.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-cyan-200/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl max-h-[75vh] flex flex-col divide-y divide-slate-100 animate-in fade-in duration-150">
          
          <div className="p-3 bg-cyan-50/70 dark:bg-slate-800 border-b border-cyan-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 font-mono uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Fragrantica-Verified Catalog ({results.length} matches)</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Press Enter to view in full catalog
            </span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {results.length > 0 ? (
              results.map((f) => {
                const isLiked = likedIds.includes(f.id);
                const isDisliked = dislikedIds.includes(f.id);

                return (
                  <div
                    key={f.id}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div 
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => handleSelect(f)}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100/70 text-cyan-800 border border-cyan-200 uppercase font-mono">
                          {f.brand}
                        </span>
                        {f._matchedAlias && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold flex items-center gap-1">
                            <span>Alias:</span>
                            <span className="underline decoration-amber-400">{f._matchedAlias}</span>
                          </span>
                        )}
                        {f.dna_inspiration && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-600/50 font-medium truncate max-w-[280px] inline-flex items-center gap-1 shadow-2xs">
                            <span className="text-amber-700 dark:text-amber-400 font-semibold">Fragrantica Target:</span>
                            <strong className="font-bold">{f.dna_inspiration}</strong>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {f.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold" title="Fragrantica Community Rating">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{(Number(f.rating_value) || 4.2).toFixed(1)} on Fragrantica</span>
                        </span>
                        <span>•</span>
                        <span>{f.collection || f.concentration}</span>
                        {f.primary_season && (
                          <>
                            <span>•</span>
                            <span>{f.primary_season}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dual Price Highlights & Quick Action Buttons */}
                    <div className="text-right shrink-0 space-y-1.5 flex flex-col items-end">
                      <div className="flex items-center gap-3">
                        {f.community_price && !isNaN(Number(f.community_price)) && Number(f.community_price) > 0 ? (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Bottle</span>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              ₹{Number(f.community_price).toLocaleString()}
                            </span>
                          </div>
                        ) : null}

                        {f.lowest_decant_price && !isNaN(Number(f.lowest_decant_price)) && Number(f.lowest_decant_price) > 0 ? (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Decant</span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              ₹{Number(f.lowest_decant_price).toLocaleString()}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Action buttons: Rates + Like + Avoid */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleSelect(f)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>Rates</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {onToggleLike && (
                          <button
                            type="button"
                            onClick={(e) => {
                              onToggleLike(f.id, e);
                              onSearchChange('');
                              setIsOpen(false);
                            }}
                            title={isLiked ? "Remove like" : "Add to liked anchors"}
                            className={`p-1.5 rounded-lg text-xs transition-all ${
                              isLiked 
                                ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                                : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onToggleDislike && (
                          <button
                            type="button"
                            onClick={(e) => {
                              onToggleDislike(f.id, e);
                              onSearchChange('');
                              setIsOpen(false);
                            }}
                            title={isDisliked ? "Remove avoid" : "Add to avoided"}
                            className={`p-1.5 rounded-lg text-xs transition-all ${
                              isDisliked 
                                ? 'bg-rose-600 text-white font-bold shadow-xs' 
                                : 'bg-rose-50/80 hover:bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-1.5">
                <p className="text-sm text-slate-800 font-semibold">
                  No matching fragrances found for "{searchQuery}"
                </p>
                <p className="text-xs text-slate-500">
                  Try searching by house name (e.g., Lattafa, Afnan, Armaf, Rasasi) or clone target (e.g., Angels' Share, Aventus, Sauvage).
                </p>
              </div>
            )}
          </div>

          {/* Footer note in dropdown */}
          <div className="p-2.5 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Showing top {results.length} matches in stock</span>
            <span className="text-slate-400">Click any card to inspect all rates</span>
          </div>

        </div>
      )}
    </div>
  );
}