import React, { useMemo } from 'react';
import { TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import PowerFragranceCard from './PowerFragranceCard';

export default function CuratedSpotlightHub({
  catalog = [],
  priceDrops = [],
  newArrivals: customNewArrivals = [],
  totalDropsCount,
  totalNewArrivalsCount,
  onSelectFragrance,
  onApplyFilter,
  expandedCardId,
  onToggleExpand,
  sellers = [],
  onShowAll,
  catalogCount = 965,
  selectedFormats = ['retail']
}) {
  // 1. Top Verified Price Drops (strictly sorted by latest price drop timestamp, matching Price Drops tab)
  const topPriceDrops = useMemo(() => {
    const getDropTimestamp = (item) => {
      if (item.price_change_date) {
        const timeStr = item.price_change_time || '00:00:00';
        return new Date(`${item.price_change_date}T${timeStr}Z`).getTime();
      }
      if (item.price_updated_at) return new Date(item.price_updated_at).getTime();
      if (item.discovered_at) return new Date(item.discovered_at).getTime();
      return 0;
    };

    const isTester = (item) => {
      const best = (item.community_sellers || [])[0];
      return Boolean(item.is_tester || best?.is_tester || (best?.size && /tester/i.test(best.size)));
    };

    if (priceDrops && priceDrops.length > 0) {
      return [...priceDrops]
        .filter(f => Number(f.community_price) > 0 && !isTester(f))
        .sort((a, b) => getDropTimestamp(b) - getDropTimestamp(a))
        .slice(0, 6);
    }
    return (catalog || [])
      .filter(f => f.is_price_drop && Number(f.community_price) > 0 && !isTester(f))
      .sort((a, b) => getDropTimestamp(b) - getDropTimestamp(a))
      .slice(0, 6);
  }, [catalog, priceDrops]);

  // 2. New Community Arrivals (strictly sorted by latest arrival timestamp)
  const newArrivals = useMemo(() => {
    const getArrivalTimestamp = (item) => {
      if (item.new_arrival_date) {
        const timeStr = item.new_arrival_time || '00:00:00';
        return new Date(`${item.new_arrival_date}T${timeStr}Z`).getTime();
      }
      if (item.discovered_at) return new Date(item.discovered_at).getTime();
      if (item.price_updated_at) return new Date(item.price_updated_at).getTime();
      return 0;
    };

    if (customNewArrivals && customNewArrivals.length > 0) {
      return [...customNewArrivals]
        .filter(f => Number(f.community_price) > 0)
        .sort((a, b) => getArrivalTimestamp(b) - getArrivalTimestamp(a))
        .slice(0, 6);
    }
    return (catalog || [])
      .filter(f => f.is_new_arrival && Number(f.community_price) > 0)
      .sort((a, b) => getArrivalTimestamp(b) - getArrivalTimestamp(a))
      .slice(0, 6);
  }, [catalog, customNewArrivals]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 w-full max-w-full min-w-0">
      
      {/* SHELF 1: TODAY'S VERIFIED ARBITRAGE PRICE DROPS */}
      {topPriceDrops.length > 0 && (
        <section className="space-y-3.5 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Verified Arbitrage Price Drops
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Hot Deals
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bottles discounted by community sellers compared to previous price sheets
                </p>
              </div>
            </div>

            <button
              onClick={() => onApplyFilter({ dealsOnly: 'drops' })}
              className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View all {totalDropsCount ?? (priceDrops.length || topPriceDrops.length)} drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-full min-w-0">
            {topPriceDrops.map(f => (
              <PowerFragranceCard
                key={`drop-${f.id}`}
                fragrance={f}
                selectedFormats={selectedFormats}
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
        <section className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    New Stock Arrivals
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Recently Added
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fresh listings scraped from verified seller catalogs
                </p>
              </div>
            </div>

            <button
              onClick={() => onApplyFilter({dealsOnly: 'new' })}
              className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View all {totalNewArrivalsCount ?? (customNewArrivals.length || newArrivals.length)} arrivals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newArrivals.map(f => (
              <PowerFragranceCard
                key={`new-${f.id}`}
                fragrance={f}
                selectedFormats={selectedFormats}
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
          Ready to explore all {catalogCount} in-stock fragrances across {sellers.length || 11} sellers?
        </p>
        <button
          onClick={onShowAll}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-all shadow-sm cursor-pointer"
        >
          View Full Verified Catalog ({catalogCount}) →
        </button>
      </div>

    </div>
  );
}
