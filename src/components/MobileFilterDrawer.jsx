import React, { useState, useMemo } from 'react';
import { Filter, X, RotateCcw, TrendingDown, Sparkles, Search } from 'lucide-react';

export default function MobileFilterDrawer({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  filterState,
  setFilterState,
  onResetFilters,
  resultCount = 0,
  activeFilterCount = 0,
  counts = {},
  sellers = [],
  brands = []
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleClose = controlledOnClose || (() => setInternalOpen(false));

  const [brandSearch, setBrandSearch] = useState('');

  const {
    formats = [],
    maxBudget = 15000,
    selectedSeller = 'all',
    selectedBrand = 'all',
    dealsOnly = null,
    selectedDna = null
  } = filterState;

  // Ensure brands are strictly sorted alphabetically A-Z, with search filter
  const sortedBrands = useMemo(() => {
    let list = [...(brands || [])].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    if (brandSearch.trim()) {
      const q = brandSearch.toLowerCase().trim();
      list = list.filter(b => b.name.toLowerCase().includes(q));
    }
    return list;
  }, [brands, brandSearch]);

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
      {/* BOTTOM SHEET DRAWER OVERLAY */}
      {isOpen && (
        <div 
          onClick={handleClose}
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
          <div 
            onClick={handleClose}
            className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 cursor-pointer" 
          />

          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Refine Catalog</span>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800 font-bold">
                  11 Sellers
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">11 Community Sellers • Real-Time Database</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-mono text-slate-400 hover:text-cyan-500 px-2 py-1 rounded-lg"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleClose}
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
                type="button"
                onClick={() => toggleFormat('retail')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                  formats.includes('retail')
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🍾 Full Bottle</span>
                <span className="text-[10px] text-slate-400">{counts.retail || 921}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFormat('tester')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                  formats.includes('tester')
                    ? 'bg-purple-950 text-purple-300 border-purple-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🧪 Tester Box</span>
                <span className="text-[10px] text-slate-400">{counts.tester ?? counts.testers ?? 18}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFormat('partial')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                  formats.includes('partial')
                    ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🏷️ Partial Bottle</span>
                <span className="text-[10px] text-slate-400">{counts.partial ?? counts.partials ?? 1}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFormat('decant')}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-98 ${
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
                type="button"
                onClick={() => setBudget(1500)}
                className={`py-2 rounded-xl border text-center transition-colors active:scale-95 ${
                  maxBudget === 1500
                    ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                &lt;₹1.5k
              </button>
              <button
                type="button"
                onClick={() => setBudget(2500)}
                className={`py-2 rounded-xl border text-center transition-colors active:scale-95 ${
                  maxBudget === 2500
                    ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                &lt;₹2.5k
              </button>
              <button
                type="button"
                onClick={() => setBudget(4000)}
                className={`py-2 rounded-xl border text-center transition-colors active:scale-95 ${
                  maxBudget === 4000
                    ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                &lt;₹4.0k
              </button>
              <button
                type="button"
                onClick={() => setBudget(15000)}
                className={`py-2 rounded-xl border text-center transition-colors active:scale-95 ${
                  maxBudget >= 15000
                    ? 'bg-cyan-600 text-white font-bold border-cyan-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Any
              </button>
            </div>
          </div>

          {/* Brand / House Selector */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                Brand / House
              </span>
              {selectedBrand !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilterState(prev => ({ ...prev, selectedBrand: 'all' }))}
                  className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Popular Brand Pills */}
            <div className="flex flex-wrap gap-1 text-[11px] font-mono">
              {['all', 'Afnan', 'Armaf', 'French Avenue', 'Lattafa', 'Rasasi'].map(bName => {
                const isSelected = (bName === 'all' && selectedBrand === 'all') || selectedBrand === bName;
                return (
                  <button
                    key={bName}
                    type="button"
                    onClick={() => setFilterState(prev => ({ ...prev, selectedBrand: bName }))}
                    className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-medium active:scale-95 ${
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

            {/* Inline Brand Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands (e.g. Mancera, Nusuk)..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Full Brand Select Dropdown (A-Z from Database) */}
            <select
              value={selectedBrand}
              onChange={(e) => setFilterState(prev => ({ ...prev, selectedBrand: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="all">All Brands ({brands.length || 53})</option>
              {sortedBrands.map(b => (
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
                type="button"
                onClick={() => setFilterState(prev => ({ ...prev, dealsOnly: prev.dealsOnly === 'drops' ? null : 'drops' }))}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                  dealsOnly === 'drops'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>Price Drops ({counts.drops || 12})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterState(prev => ({ ...prev, dealsOnly: prev.dealsOnly === 'new' ? null : 'new' }))}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                  dealsOnly === 'new'
                    ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>New In ({counts.newArrivals || 12})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Confirmation Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 cursor-pointer"
          >
            <span>Show {resultCount.toLocaleString()} Matching Fragrances</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </>
  );
}

