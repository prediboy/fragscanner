import React from 'react';
import { Search, X, TrendingDown, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

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
  isCuratedActive = false
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

  // Active filter count excluding default
  const activeChips = [];
  const isDefaultFormat = formats.length === 1 && formats[0] === 'retail';
  if (!isDefaultFormat && formats.length > 0 && formats.length < 4) {
    formats.forEach(f => {
      const label = f === 'retail' ? 'Retail Bottle' : f === 'tester' ? '🧪 Tester' : f === 'partial' ? '🏷️ Partial' : '💧 Decant';
      activeChips.push({
        id: `fmt-${f}`,
        label,
        onRemove: () => setFilterState(p => ({ ...p, formats: p.formats.filter(x => x !== f) }))
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
      label: dealsOnly === 'drops' ? '📉 Price Drops' : '✨ New Arrivals',
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

  return (
    <div className="space-y-3.5 mb-6 w-full max-w-full min-w-0">
      
      {/* Top Search & Sorting Bar */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-full min-w-0">
        
        {/* Fast Universal Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Hawas, Khamrah, Aventus, Sauvage, notes..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Sort Dropdown & Matches Count */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0 flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-cyan-400 focus:outline-none truncate"
            >
              {searchQuery.trim() && <option value="relevance">Best Match (Relevance)</option>}
              <option value="price_asc">Lowest Bottle (₹ ↑)</option>
              <option value="price_desc">Highest Bottle (₹ ↓)</option>
              <option value="drop_percent">Deepest Drop %</option>
              <option value="decant_asc">Lowest Decant</option>
              <option value="rating">Fragrantica Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 pl-2 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap">
            {isCuratedActive ? (
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Curated Deals</span>
            ) : (
              <><strong className="text-slate-900 dark:text-white font-bold">{totalMatching}</strong> matches</>
            )}
          </div>
        </div>

      </div>

      {/* Mutually Exclusive Mode Toggle Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto hide-scrollbar text-xs font-mono shadow-2xs w-full max-w-full">
        
        {/* Toggle 1: Curated Highlights */}
        <button
          onClick={() => {
            onResetFilters();
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium ${
            isCuratedActive
              ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>Curated Highlights</span>
        </button>

        {/* Toggle 2: Price Drops */}
        <button
          onClick={() => {
            setQuickFilterTab('drops');
            setFilterState(prev => ({ ...prev, dealsOnly: 'drops', formats: ['retail'] }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium ${
            dealsOnly === 'drops'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
          <span>Price Drops ({counts.drops || 12})</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Toggle 3: New Arrivals */}
        <button
          onClick={() => {
            setQuickFilterTab('new');
            setFilterState(prev => ({ ...prev, dealsOnly: 'new', formats: ['retail'] }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium ${
            dealsOnly === 'new'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <span>✨</span>
          <span>New Arrivals ({counts.newArrivals || 12})</span>
        </button>

        {/* Toggle 4: Decants Ready */}
        <button
          onClick={() => {
            setQuickFilterTab('decants');
            setFilterState(prev => ({ ...prev, formats: ['decant'], dealsOnly: null }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium ${
            formats.length === 1 && formats.includes('decant') && !dealsOnly
              ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-300 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <span>💧</span>
          <span>Decants Ready ({counts.decants || 808})</span>
        </button>

        {/* Toggle 5: Testers */}
        <button
          onClick={() => {
            setQuickFilterTab('testers');
            setFilterState(prev => ({ ...prev, formats: ['tester'], dealsOnly: null }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium ${
            formats.length === 1 && formats.includes('tester') && !dealsOnly
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <span>🧪</span>
          <span>Testers ({counts.testers ?? counts.tester ?? 18})</span>
        </button>

        {/* Toggle 6: Partials */}
        <button
          onClick={() => {
            setQuickFilterTab('partials');
            setFilterState(prev => ({ ...prev, formats: ['partial'], dealsOnly: null }));
          }}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 font-medium ${
            formats.length === 1 && formats.includes('partial') && !dealsOnly
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 font-bold shadow-xs border border-slate-200/80 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <span>🏷️</span>
          <span>Partials ({counts.partials ?? counts.partial ?? 1})</span>
        </button>
      </div>

      {/* Active Dismissible Chips Row */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-mono">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Active:</span>
          {activeChips.map(c => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-[11px]"
            >
              <span>{c.label}</span>
              <button
                onClick={c.onRemove}
                className="hover:text-red-500 dark:hover:text-red-400 ml-0.5"
                title="Remove filter"
              >
                ✕
              </button>
            </span>
          ))}

          <button
            onClick={onResetFilters}
            className="text-[11px] text-slate-400 hover:text-cyan-500 underline ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

    </div>
  );
}
