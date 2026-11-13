import React, { useMemo } from 'react';
import { Filter, RotateCcw, TrendingDown, Sparkles, Tag } from 'lucide-react';

export default function PowerFilterSidebar({
  filterState,
  setFilterState,
  onResetFilters,
  counts = {},
  sellers = [],
  brands = []
}) {
  const {
    formats = [],
    maxBudget = 15000,
    selectedSeller = 'all',
    selectedBrand = 'all',
    dealsOnly = null,
    selectedDna = null,
    selectedVibe = null
  } = filterState;

  // Ensure brands are strictly sorted alphabetically A-Z
  const sortedBrands = useMemo(() => {
    return [...(brands || [])].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [brands]);

  const toggleFormat = (fmt) => {
    const next = formats.includes(fmt)
      ? formats.filter(x => x !== fmt)
      : [...formats, fmt];
    setFilterState(prev => ({ ...prev, formats: next }));
  };

  const setBudget = (val) => {
    setFilterState(prev => ({ ...prev, maxBudget: val }));
  };

  const toggleDna = (dna) => {
    setFilterState(prev => ({
      ...prev,
      selectedDna: prev.selectedDna === dna ? null : dna
    }));
  };

  const toggleVibe = (vibe) => {
    setFilterState(prev => ({
      ...prev,
      selectedVibe: prev.selectedVibe === vibe ? null : vibe
    }));
  };

  return (
    <aside className="hidden md:block w-72 shrink-0 bg-white dark:bg-slate-900/90 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 sticky top-20 space-y-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-500" />
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Refine Catalog</h4>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] font-mono text-slate-400 hover:text-cyan-500 flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Format & Stock Type */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
          Format & Stock Type
        </span>
        <div className="space-y-1 text-xs">
          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={formats.includes('retail')}
                onChange={() => toggleFormat('retail')}
                className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span>Full Retail Bottle</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">{counts.retail || 921}</span>
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={formats.includes('tester')}
                onChange={() => toggleFormat('tester')}
                className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <span>🧪</span>
                <span>Tester Unit</span>
              </span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">{counts.tester ?? counts.testers ?? 18}</span>
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={formats.includes('partial')}
                onChange={() => toggleFormat('partial')}
                className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <span>🏷️</span>
                <span>Partial Bottle</span>
              </span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">{counts.partial ?? counts.partials ?? 1}</span>
          </label>

          <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={formats.includes('decant')}
                onChange={() => toggleFormat('decant')}
                className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <span>💧</span>
                <span>Decants In Stock</span>
              </span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">{counts.decant || 808}</span>
          </label>
        </div>
      </div>

      {/* Bottle Budget */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
            Max Bottle Budget
          </span>
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {maxBudget >= 15000 ? 'Any Budget' : `Under ₹${Number(maxBudget).toLocaleString()}`}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="15000"
          step="500"
          value={maxBudget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
        />
        <div class="grid grid-cols-4 gap-1 text-[10px] font-mono pt-1">
          <button
            onClick={() => setBudget(1500)}
            className={`py-1 rounded text-center transition-colors ${maxBudget === 1500 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            &lt;₹1.5k
          </button>
          <button
            onClick={() => setBudget(2500)}
            className={`py-1 rounded text-center transition-colors ${maxBudget === 2500 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            &lt;₹2.5k
          </button>
          <button
            onClick={() => setBudget(4000)}
            className={`py-1 rounded text-center transition-colors ${maxBudget === 4000 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            &lt;₹4.0k
          </button>
          <button
            onClick={() => setBudget(15000)}
            className={`py-1 rounded text-center transition-colors ${maxBudget >= 15000 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Any
          </button>
        </div>
      </div>

      {/* Brand & Fragrance House Selector */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
            Brand / House
          </span>
          {selectedBrand !== 'all' && (
            <button
              onClick={() => setFilterState(prev => ({ ...prev, selectedBrand: 'all' }))}
              className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Popular Brand Pills (A-Z) */}
        <div className="flex flex-wrap gap-1 text-[11px] font-mono">
          {['all', 'Afnan', 'Armaf', 'French Avenue', 'Lattafa', 'Rasasi'].map(bName => {
            const isSelected = (bName === 'all' && selectedBrand === 'all') || selectedBrand === bName;
            return (
              <button
                key={bName}
                onClick={() => setFilterState(prev => ({ ...prev, selectedBrand: bName }))}
                className={`px-2 py-1 rounded-lg transition-all text-[11px] font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {bName === 'all' ? 'All' : bName}
              </button>
            );
          })}
        </div>

        {/* Full Brand Select Dropdown (A-Z from Database) */}
        <select
          value={selectedBrand}
          onChange={(e) => setFilterState(prev => ({ ...prev, selectedBrand: e.target.value }))}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="all">All Brands ({sortedBrands.length || 53})</option>
          {sortedBrands.map(b => (
            <option key={b.name} value={b.name}>
              {b.name} ({b.count})
            </option>
          ))}
        </select>
      </div>

      {/* Verified Community Seller Selector */}
      <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
          Verified Community Seller
        </span>
        <select
          value={selectedSeller}
          onChange={(e) => setFilterState(prev => ({ ...prev, selectedSeller: e.target.value }))}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
        >
          <option value="all">All 11 Verified Sellers</option>
          {sellers.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} {s.count ? `(${s.count})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Fragrance Vibe & Occasion (Rethought Taste Lab) */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
          Vibe & Occasion
        </span>
        <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
          {[
            { id: 'fresh', label: '☀️ Summer Fresh' },
            { id: 'beastmode', label: '🔥 Beastmode' },
            { id: 'gourmand', label: '🍫 Boozy Sweet' },
            { id: 'office', label: '💼 Office Clean' }
          ].map(v => {
            const isSelected = selectedVibe === v.id;
            return (
              <button
                key={v.id}
                onClick={() => toggleVibe(v.id)}
                className={`p-1.5 rounded-lg text-left truncate transition-colors ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deal Status Filters */}
      <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
          Special Deal Velocity
        </span>
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilterState(prev => ({ ...prev, dealsOnly: prev.dealsOnly === 'drops' ? null : 'drops' }))}
            className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              dealsOnly === 'drops'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-bold'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Price Drops</span>
          </button>

          <button
            onClick={() => setFilterState(prev => ({ ...prev, dealsOnly: prev.dealsOnly === 'new' ? null : 'new' }))}
            className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              dealsOnly === 'new'
                ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>New In</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
