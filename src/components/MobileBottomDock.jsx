import React from 'react';
import { Sparkles, TrendingDown, SlidersHorizontal, Droplets } from 'lucide-react';

export default function MobileBottomDock({
  filterState,
  setFilterState,
  onResetFilters,
  onOpenFilters,
  activeFilterCount = 0,
  resultCount = 0,
  counts = {},
  isCuratedActive = false
}) {
  const { formats = [], dealsOnly = null } = filterState;

  const isDropsActive = dealsOnly === 'drops';
  const isDecantsActive = formats.length === 1 && formats.includes('decant') && !dealsOnly;

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-2xl safe-area-pb"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        
        {/* 1. Highlights / Home */}
        <button
          type="button"
          onClick={onResetFilters}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isCuratedActive
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-4 h-4 ${isCuratedActive ? 'text-cyan-500 fill-cyan-500/20' : ''}`} />
          </div>
          <span className="text-[10px] font-mono font-medium mt-0.5">Highlights</span>
        </button>

        {/* 2. Price Drops */}
        <button
          type="button"
          onClick={() => {
            setFilterState(prev => ({
              ...prev,
              dealsOnly: prev.dealsOnly === 'drops' ? null : 'drops'
            }));
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isDropsActive
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <TrendingDown className="w-4 h-4" />
            <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono font-medium mt-0.5">
            Drops ({counts.drops ?? 23})
          </span>
        </button>

        {/* 3. Decants */}
        <button
          type="button"
          onClick={() => {
            setFilterState(prev => ({
              ...prev,
              formats: isDecantsActive ? ['retail'] : ['decant'],
              dealsOnly: null
            }));
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isDecantsActive
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-medium mt-0.5">
            Decants ({counts.decants || 808})
          </span>
        </button>

        {/* 4. Filters Button (Opens Drawer) */}
        <button
          type="button"
          onClick={onOpenFilters}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeFilterCount > 0
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-black flex items-center justify-center shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-medium mt-0.5">
            Filters {resultCount > 0 && !isCuratedActive ? `(${resultCount})` : ''}
          </span>
        </button>

      </div>
    </nav>
  );
}
