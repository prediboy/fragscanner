import React from 'react';
import { Search, X, TrendingDown, Sparkles, Flame, Droplets, TestTube, Tag, Package } from 'lucide-react';

export default function MarketPulseBar({
  searchQuery,
  setSearchQuery,
  filterState,
  setFilterState,
  onResetFilters,
  totalMatching,
  quickFilterTab,
  setQuickFilterTab,
  counts = {},
  isCuratedActive = false,
  onShowAll
}) {
  const {
    formats = [],
    maxBudget = 15000,
    selectedSeller = 'all',
    selectedBrand = 'all',
    dealsOnly = null,
    selectedDna = null,
    selectedVibe = null,
    sortBy = 'price_asc'
  } = filterState;

  // Active filter chips (When search is active, it runs globally across the catalog)
  const activeChips = [];
  const hasSearch = Boolean(searchQuery && searchQuery.trim().length > 0);

  if (hasSearch) {
    activeChips.push({
      id: 'search-query',
      label: `"${searchQuery.trim()}" (Search)`,
      onRemove: () => setSearchQuery('')
    });
  } else {
    if (formats.length > 0 && formats.length < 4) {
      formats.forEach(f => {
        const label = f === 'retail' ? 'Full Bottle' : f === 'tester' ? 'Tester Unit' : f === 'partial' ? 'Partial Bottle' : 'Decants Ready';
        activeChips.push({
          id: `fmt-${f}`,
          label,
          onRemove: () => setFilterState(p => {
            const next = p.formats.filter(x => x !== f);
            return { ...p, formats: next.length > 0 ? next : ['retail', 'tester', 'partial', 'decant'] };
          })
        });
      });
    }
    if (maxBudget < 15000) {
      activeChips.push({
        id: 'budget',
        label: `< ₹${maxBudget.toLocaleString()}`,
        onRemove: () => setFilterState(p => ({ ...p, maxBudget: 15000 }))
      });
    }
    if (selectedSeller !== 'all') {
      activeChips.push({
        id: 'seller',
        label: `Seller: ${selectedSeller}`,
        onRemove: () => setFilterState(p => ({ ...p, selectedSeller: 'all' }))
      });
    }
    if (selectedBrand && selectedBrand !== 'all') {
      activeChips.push({
        id: 'brand',
        label: `Brand: ${selectedBrand}`,
        onRemove: () => setFilterState(p => ({ ...p, selectedBrand: 'all' }))
      });
    }
    if (dealsOnly) {
      activeChips.push({
        id: 'deals',
        label: dealsOnly === 'drops' ? 'Price Drops' : (dealsOnly === 'preferred' ? 'Most Preferred' : 'New Arrivals'),
        onRemove: () => setFilterState(p => ({ ...p, dealsOnly: null }))
      });
    }
    if (selectedDna) {
      activeChips.push({
        id: 'dna',
        label: `Clones: ${selectedDna}`,
        onRemove: () => setFilterState(p => ({ ...p, selectedDna: null }))
      });
    }
    if (selectedVibe) {
      activeChips.push({
        id: 'vibe',
        label: `Vibe: ${selectedVibe}`,
        onRemove: () => setFilterState(p => ({ ...p, selectedVibe: null }))
      });
    }
  }

  return (
    <div className="space-y-3 mb-6 w-full max-w-full min-w-0">
      
      {/* Top Search Bar */}
      <div className="bg-white dark:bg-[#12141C] rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 dark:border-[#232738] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-full min-w-0">
        
        {/* Fast Universal Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Hawas, Khamrah, Aventus, Sauvage, notes..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-[#0B0D13] rounded-xl border border-slate-200 dark:border-[#262B3D] text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-colors font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Match Count Status */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto text-xs font-mono">
          <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 whitespace-nowrap">
            {isCuratedActive ? (
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Curated Spotlight</span>
            ) : (
              <><strong className="text-slate-900 dark:text-zinc-100 font-bold">{totalMatching}</strong> in-stock</>
            )}
          </div>
        </div>

      </div>

      {/* Unified Minimal Segmented Filter Bar */}
      <div className="bg-slate-100 dark:bg-[#12141C] p-1 rounded-2xl border border-slate-200/80 dark:border-[#232738] flex items-center gap-1 overflow-x-auto hide-scrollbar text-xs font-mono shadow-2xs w-full max-w-full">
        
        {/* Toggle 1: Curated Highlights */}
        <button
          onClick={() => {
            onResetFilters();
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium cursor-pointer ${
            isCuratedActive
              ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-[#181B26]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 opacity-70" />
          <span>Curated Highlights</span>
        </button>

        {/* Toggle 2: Most Preferred */}
        <button
          onClick={() => {
            setQuickFilterTab('preferred');
            setFilterState(prev => ({ ...prev, dealsOnly: 'preferred', formats: ['retail'] }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium cursor-pointer ${
            dealsOnly === 'preferred'
              ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-[#181B26]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          <span>Most Preferred ({counts.preferred ?? 12})</span>
        </button>

        {/* Toggle 3: Price Drops */}
        <button
          onClick={() => {
            setQuickFilterTab('drops');
            setFilterState(prev => ({ ...prev, dealsOnly: 'drops', formats: ['retail'] }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium cursor-pointer ${
            dealsOnly === 'drops'
              ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-[#181B26]'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
          <span>Price Drops ({counts.drops ?? 0})</span>
        </button>

        {/* Toggle 4: New Arrivals */}
        <button
          onClick={() => {
            setQuickFilterTab('new');
            setFilterState(prev => ({ ...prev, dealsOnly: 'new', formats: ['retail'] }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium cursor-pointer ${
            dealsOnly === 'new'
              ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-[#181B26]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>New Arrivals ({counts.newArrivals ?? 0})</span>
        </button>

        {/* Toggle 5: Decants */}
        <button
          onClick={() => {
            setQuickFilterTab('decants');
            setFilterState(prev => ({ ...prev, formats: ['decant'], dealsOnly: null }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium cursor-pointer ${
            formats.length === 1 && formats.includes('decant') && !dealsOnly
              ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-[#181B26]'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 opacity-70" />
          <span>Decants Ready ({counts.decants || 808})</span>
        </button>

        {/* Toggle 6: Testers */}
        <button
          onClick={() => {
            setQuickFilterTab('testers');
            setFilterState(prev => ({ ...prev, formats: ['tester'], dealsOnly: null }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium cursor-pointer ${
            formats.length === 1 && formats.includes('tester') && !dealsOnly
              ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-[#181B26]'
          }`}
        >
          <TestTube className="w-3.5 h-3.5 opacity-70" />
          <span>Testers ({counts.testers ?? counts.tester ?? 18})</span>
        </button>

        {/* Toggle 7: Partials */}
        <button
          onClick={() => {
            setQuickFilterTab('partials');
            setFilterState(prev => ({ ...prev, formats: ['partial'], dealsOnly: null }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium cursor-pointer ${
            formats.length === 1 && formats.includes('partial') && !dealsOnly
              ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-[#181B26]'
          }`}
        >
          <Tag className="w-3.5 h-3.5 opacity-70" />
          <span>Partials ({counts.partials ?? counts.partial ?? 1})</span>
        </button>
      </div>

      {/* Active Dismissible Chips Row */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs font-mono">
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mr-1">Filtered by:</span>
          {activeChips.map(c => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#181B26] border border-slate-200 dark:border-[#262B3D] text-slate-700 dark:text-zinc-300 text-[11px]"
            >
              <span>{c.label}</span>
              <button
                onClick={c.onRemove}
                className="hover:text-red-500 dark:hover:text-red-400 ml-0.5 cursor-pointer p-0.5"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={onResetFilters}
            className="text-[11px] text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 underline ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

    </div>
  );
}
