import React, { useMemo } from 'react';
import { TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import PowerFragranceCard from './PowerFragranceCard';

export default function CuratedSpotlightHub({
  catalog = [],
  priceDrops = [],
  newArrivals: customNewArrivals = [],
  onSelectFragrance,
  onApplyFilter,
  expandedCardId,
  onToggleExpand,
  sellers = [],
  onShowAll
}) {
  // 1. Top Verified Price Drops (highest discount percentage first)
  const topPriceDrops = useMemo(() => {
    if (priceDrops && priceDrops.length > 0) return priceDrops.slice(0, 6);
    return (catalog || [])
      .filter(f => f.is_price_drop && Number(f.community_price) > 0)
      .sort((a, b) => {
        const pctA = Number(a.price_change_percentage) || 0;
        const pctB = Number(b.price_change_percentage) || 0;
        return pctB - pctA;
      })
      .slice(0, 6);
  }, [catalog, priceDrops]);

  // 2. New Community Arrivals
  const newArrivals = useMemo(() => {
    if (customNewArrivals && customNewArrivals.length > 0) return customNewArrivals.slice(0, 6);
    return (catalog || [])
      .filter(f => f.is_new_arrival && Number(f.community_price) > 0)
      .sort((a, b) => new Date(b.new_arrival_date || 0) - new Date(a.new_arrival_date || 0))
      .slice(0, 6);
  }, [catalog, customNewArrivals]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* SHELF 1: TODAY'S VERIFIED ARBITRAGE PRICE DROPS */}
      {topPriceDrops.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Verified Arbitrage Price Drops</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Hot Deals
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bottles discounted by community sellers compared to previous price sheets
                </p>
              </div>
            </div>

            <button
              onClick={() => onApplyFilter({ dealsOnly: 'drops' })}
              className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all {catalog.filter(f => f.is_price_drop).length} drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPriceDrops.map(f => (
              <PowerFragranceCard
                key={`drop-${f.id}`}
                fragrance={f}
                onSelect={onSelectFragrance}
                isExpanded={expandedCardId === f.id}
                onToggleExpand={onToggleExpand}
                selectedSeller="all"
              />
            ))}
          </div>
        </section>
      )}

      {/* SHELF 2: FRESH COMMUNITY ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>New Stock Arrivals</span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Recently Added
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fresh listings scraped from verified seller catalogs
                </p>
              </div>
            </div>

            <button
              onClick={() => onApplyFilter({ dealsOnly: 'new' })}
              className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View all {catalog.filter(f => f.is_new_arrival).length} arrivals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newArrivals.map(f => (
              <PowerFragranceCard
                key={`new-${f.id}`}
                fragrance={f}
                onSelect={onSelectFragrance}
                isExpanded={expandedCardId === f.id}
                onToggleExpand={onToggleExpand}
                selectedSeller="all"
              />
            ))}
          </div>
        </section>
      )}

      {/* BOTTOM ACTION: EXPLICIT BROWSE ALL */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Ready to explore all 965 in-stock fragrances across 11 sellers?
        </p>
        <button
          onClick={onShowAll}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-all shadow-sm"
        >
          View Full Verified Catalog (965) →
        </button>
      </div>

    </div>
  );
}
