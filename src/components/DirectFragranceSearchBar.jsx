import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Star, Store, FlaskConical, ArrowRight } from 'lucide-react';

export default function DirectFragranceSearchBar({ allFragrances, onSelectFragrance }) {
  const [query, setQuery] = useState('');
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

  // Filter matching fragrances (by name, brand, DNA inspiration, or notes)
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    return allFragrances.filter(f => {
      const name = (f.name || '').toLowerCase();
      const brand = (f.brand || '').toLowerCase();
      const inspo = (f.dna_inspiration || '').toLowerCase();
      const notes = (f.notes_top || []).concat(f.notes_middle || [], f.notes_base || []).map(n => n.toLowerCase());

      return (
        name.includes(q) ||
        brand.includes(q) ||
        inspo.includes(q) ||
        notes.some(n => n.includes(q))
      );
    }).slice(0, 8); // Top 8 matches
  }, [query, allFragrances]);

  const handleSelect = (fragrance) => {
    onSelectFragrance(fragrance);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-amber-400 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="🔍 Direct Search: Find any perfume, clone inspiration, or seller deals..."
          className="w-full bg-[#131d31] hover:bg-[#16223a] focus:bg-[#172540] border border-slate-700 focus:border-amber-400/80 rounded-2xl pl-10 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded-md">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Live Results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0f172a] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-[75vh] flex flex-col">
          <div className="p-2.5 bg-[#131d31] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Fragrance Search ({results.length} results)</span>
            </span>
            <span className="text-[11px] text-slate-400">Click any fragrance to view full details</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-800/60">
            {results.length > 0 ? (
              results.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleSelect(f)}
                  className="p-3 hover:bg-slate-800/70 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {f.brand}
                      </span>
                      {f.dna_inspiration && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          Target: <strong className="text-slate-300">{f.dna_inspiration}</strong>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {f.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5 text-amber-400 font-mono font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {f.rating_value.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{f.collection}</span>
                      <span>•</span>
                      <span>{f.primary_season}</span>
                    </div>
                  </div>

                  {/* Dual Price Highlights */}
                  <div className="text-right shrink-0 space-y-1">
                    {f.in_seller_stock && f.community_price ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-[10px] text-slate-400">Bottle:</span>
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          ₹{f.community_price}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                        Bottle: Unquoted
                      </span>
                    )}

                    {f.has_decants && f.lowest_decant_price ? (
                      <div className="flex items-center gap-1 justify-end text-cyan-300 font-mono text-xs font-black">
                        <FlaskConical className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-normal text-slate-400">Decant:</span>
                        <span>₹{f.lowest_decant_price}</span>
                      </div>
                    ) : null}

                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 group-hover:translate-x-0.5 transition-transform font-semibold">
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center space-y-1.5">
                <p className="text-sm text-slate-300 font-semibold">
                  No matching fragrances found for "{query}"
                </p>
                <p className="text-xs text-slate-400">
                  Try searching by house name (e.g., Lattafa, Afnan, Armaf, Paris Corner) or clone target (e.g., Angels' Share, Aventus, Sauvage).
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
