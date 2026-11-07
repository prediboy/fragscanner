import React, { useState } from 'react';
import { Filter, X, RotateCcw, TrendingDown, Sparkles } from 'lucide-react';

export default function MobileFilterDrawer({
  filterState,
  setFilterState,
  onResetFilters,
  resultCount = 0,
  activeFilterCount = 0,
  counts = {},
  sellers = [],
  brands = []
}) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    formats = [],
    maxBudget = 15000,
    selectedSeller = 'all',
    selectedBrand = 'all',
    dealsOnly = null,
    selectedDna = null
  } = filterState;

  const toggleFormat = (fmt) => {
    const next = formats.includes(fmt)
      ? formats.filter(x => x !== fmt)
      : [...formats, fmt];
    setFilterState(prev => ({ ...prev, formats: next }));
  };

  const setBudget = (val) => {
    setFilterState(prev => ({ ...prev, maxBudget: val }));
  };

  return (
    <>
      {/* FLOATING THUMB CAPSULE (Visible only on mobile/tablet) */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 px-4 z-40 pointer-events-none flex justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto px-5 py-3 rounded-full bg-slate-900/95 dark:bg-slate-900/95 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2.5 active:scale-95 transition-all border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md ring-2 ring-cyan-500/10"
        >
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <span className="text-slate-400 font-normal">
            • <strong className="text-white">{resultCount}</strong> results
          </span>
        </button>
      </div>

      {/* BOTTOM SHEET DRAWER OVERLAY */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* THE SLIDING SHEET */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-[32px] z-50 p-4 pb-6 overflow-y-auto space-y-4 shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between ${
          isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <div>
          {/* Drag Handle Bar */}
          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Refine Catalog</span>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                  11 Sellers
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">1,188 perfumes scanned</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onResetFilters}
                className="text-xs font-mono text-slate-400 hover:text-cyan-500 px-2 py-1 rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Format & Stock (2x2 Touch Grid) */}
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
              Format & Stock Type
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => toggleFormat('retail')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  formats.includes('retail')
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>✓ Full Retail Bottle</span>
                <span className="text-[10px] text-slate-400">{counts.retail || 921}</span>
              </button>

              <button
                onClick={() => toggleFormat('tester')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  formats.includes('tester')
                    ? 'bg-purple-950 text-purple-300 border-purple-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🧪 Tester Box</span>
                <span className="text-[10px] text-slate-400">{counts.tester || 240}</span>
              </button>

              <button
                onClick={() => toggleFormat('partial')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  formats.includes('partial')
                    ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🏷️ Partial Bottle</span>
                <span className="text-[10px] text-slate-400">{counts.partial || 28}</span>
              </button>

              <button
                onClick={() => toggleFormat('decant')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  formats.includes('decant')
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>💧 Decant Ready</span>
                <span className="text-[10px] text-slate-400">{counts.decant || 808}</span>
              </button>
            </div>
          </div>

          {/* Max Bottle Budget */}
          <div className="mt-4 space-y-2">
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
              className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setBudget(1500)}
                className={`py-2 rounded-xl border text-center transition-colors ${
                  maxBudget === 1500
                    ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                &lt;₹1.5k
              </button>
              <button
                onClick={() => setBudget(2500)}
                className={`py-2 rounded-xl border text-center transition-colors ${
                  maxBudget === 2500
                    ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                &lt;₹2.5k
              </button>
              <button
                onClick={() => setBudget(4000)}
                className={`py-2 rounded-xl border text-center transition-colors ${
                  maxBudget === 4000
                    ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                &lt;₹4.0k
              </button>
              <button
                onClick={() => setBudget(15000)}
                className={`py-2 rounded-xl border text-center transition-colors ${
                  maxBudget >= 15000
                    ? 'bg-cyan-600 text-white font-bold border-cyan-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Any
              </button>
            </div>
          </div>

          {/* Brand & House Selector */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                Brand / House
              </span>
              {selectedBrand !== 'all' && (
                <button
                  onClick={() => setFilterState(prev => ({ ...prev, selectedBrand: 'all' }))}
                  className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Popular Brand Pills */}
            <div className="flex flex-wrap gap-1 text-[11px] font-mono">
              {['all', 'Afnan', 'Lattafa', 'Armaf', 'Rasasi', 'French Avenue'].map(bName => {
                const isSelected = (bName === 'all' && selectedBrand === 'all') || selectedBrand === bName;
                return (
                  <button
                    key={bName}
                    onClick={() => setFilterState(prev => ({ ...prev, selectedBrand: bName }))}
                    className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-medium ${
                      isSelected
                        ? 'bg-cyan-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {bName === 'all' ? 'All' : bName}
                  </button>
                );
              })}
            </div>

            {/* Full Brand Select Dropdown */}
            <select
              value={selectedBrand}
              onChange={(e) => setFilterState(prev => ({ ...prev, selectedBrand: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="all">All Brands ({brands.length || 53})</option>
              {brands.map(b => (
                <option key={b.name} value={b.name}>
                  {b.name} ({b.count})
                </option>
              ))}
            </select>
          </div>

          {/* Verified Community Seller */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
              Verified Seller
            </span>
            <select
              value={selectedSeller}
              onChange={(e) => setFilterState(prev => ({ ...prev, selectedSeller: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="all">All 11 Community Sellers</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Deals Highlight */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
              Special Deals
            </span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setFilterState(prev => ({ ...prev, dealsOnly: prev.dealsOnly === 'drops' ? null : 'drops' }))}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  dealsOnly === 'drops'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>Price Drops</span>
              </button>

              <button
                onClick={() => setFilterState(prev => ({ ...prev, dealsOnly: prev.dealsOnly === 'new' ? null : 'new' }))}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  dealsOnly === 'new'
                    ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>New In</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Confirmation Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98"
          >
            <span>Show {resultCount} Matching Fragrances</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </>
  );
}
