import React, { useMemo } from 'react';
import { TrendingDown, Sparkles, DollarSign, Store, ArrowRight, Crown } from 'lucide-react';
import PowerFragranceCard from './PowerFragranceCard';

export default function CuratedSpotlightHub({
  catalog = [],
  onSelectFragrance,
  onApplyFilter,
  expandedCardId,
  onToggleExpand,
  sellers = [],
  onShowAll
}) {
  // 1. Top Verified Price Drops (highest discount percentage first)
  const topPriceDrops = useMemo(() => {
    return catalog
      .filter(f => f.is_price_drop && Number(f.community_price) > 0)
      .sort((a, b) => {
        const pctA = Number(a.price_change_percentage) || 0;
        const pctB = Number(b.price_change_percentage) || 0;
        return pctB - pctA;
      })
      .slice(0, 6);
  }, [catalog]);

  // 2. New Community Arrivals
  const newArrivals = useMemo(() => {
    return catalog
      .filter(f => f.is_new_arrival && Number(f.community_price) > 0)
      .sort((a, b) => new Date(b.new_arrival_date || 0) - new Date(a.new_arrival_date || 0))
      .slice(0, 6);
  }, [catalog]);

  // 3. High-Value Budget Monsters (< ₹2,500 with Rating >= 4.0)
  const budgetBeasts = useMemo(() => {
    return catalog
      .filter(f => {
        const p = Number(f.community_price);
        const r = Number(f.rating_value) || 0;
        return p > 0 && p <= 2500 && r >= 4.0;
      })
      .sort((a, b) => (Number(b.rating_value) || 0) - (Number(a.rating_value) || 0))
      .slice(0, 6);
  }, [catalog]);

  // 4. Iconic Luxury DNA Hub Data
  const iconicDnas = [
    {
      name: 'Creed Aventus',
      filterTerm: 'Aventus',
      tagline: 'Smoky Pineapple & Birch',
      samplePerfumes: 'CDNIM, SNOI, Cedrat Boise, Lynked',
      icon: '🍍',
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      name: 'Bvlgari Tygar',
      filterTerm: 'Tygar',
      tagline: 'Sparkling Grapefruit & Ambroxan',
      samplePerfumes: 'Turathi Blue, Theoreme, Al Qiam',
      icon: '⚡',
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
    },
    {
      name: "Kilian Angels' Share",
      filterTerm: "Angels' Share",
      tagline: 'Cognac, Cinnamon & Warm Amber',
      samplePerfumes: 'Khamrah, Kismet Magic, Sharaf Blend',
      icon: '🥃',
      color: 'from-amber-600/10 to-orange-500/10 border-amber-600/30 text-amber-700 dark:text-amber-300'
    },
    {
      name: 'Dior Sauvage Elixir',
      filterTerm: 'Sauvage Elixir',
      tagline: 'Dark Lavender, Licorice & Spices',
      samplePerfumes: 'Asad, Salvo Elixir, Ventana',
      icon: '🔥',
      color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
    },
    {
      name: 'Louis Vuitton Imagination',
      filterTerm: 'Imagination',
      tagline: 'Chinese Black Tea, Ambrox & Citrus',
      samplePerfumes: 'Art of Arabia I, Marwa, Sand Dunes',
      icon: '🍵',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    },
    {
      name: 'PDM Althair',
      filterTerm: 'Althair',
      tagline: 'Bourbon Vanilla, Orange Blossom & Praline',
      samplePerfumes: 'Liquid Brun, French Avenue',
      icon: '🍨',
      color: 'from-rose-500/10 to-amber-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Curation Guidance Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 border border-slate-700 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                Live Arbitrage Feed
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Showing Curated Market Highlights
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white tracking-tight">
              Don't browse blindly. Filter by seller, budget, or luxury DNA clone.
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Showing verified price drops, new arrivals, and top budget deals below. Use the Power Rail on the left or search above to zero in on any specific perfume.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onApplyFilter({ dealsOnly: 'drops' })}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>All Drops ({catalog.filter(f => f.is_price_drop).length})</span>
            </button>
            <button
              onClick={onShowAll}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-semibold transition-all"
              title="Show all verified in-stock fragrances"
            >
              Browse All ({catalog.length})
            </button>
          </div>
        </div>
      </div>

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

      {/* SHELF 2: BROWSE BY 11 COMMUNITY SELLERS */}
      <section className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-cyan-500" />
              <span>Browse by Community Seller</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select any verified seller to inspect their current live sheet inventory and rates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {sellers.map(s => (
            <button
              key={s.id}
              onClick={() => onApplyFilter({ selectedSeller: s.id })}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-cyan-400 dark:hover:border-cyan-500 text-left transition-all group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate">
                  {s.name}
                </span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-1">
                  {s.count} in stock
                </span>
              </div>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 truncate">
                <span>{s.dispatch || 'Fast Dispatch'}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SHELF 3: CLONED LUXURY DNA HUBS */}
      <section className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Browse by Iconic Cloned DNA</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Jump straight to the highest quality Middle Eastern alternatives to iconic luxury houses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {iconicDnas.map(dna => (
            <button
              key={dna.name}
              onClick={() => onApplyFilter({ selectedDna: dna.filterTerm })}
              className={`p-3.5 rounded-2xl border bg-gradient-to-br ${dna.color} hover:scale-[1.01] transition-all text-left flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{dna.icon}</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Explore Clones →
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  {dna.name}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {dna.tagline}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                Popular: {dna.samplePerfumes}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SHELF 4: HIGH-VALUE BUDGET BEASTS UNDER ₹2,500 */}
      {budgetBeasts.length > 0 && (
        <section className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Top Rated Under ₹2,500</span>
                  <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                    Value Kings
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fragrantica community rating ≥ 4.0/5 priced under ₹2,500
                </p>
              </div>
            </div>

            <button
              onClick={() => onApplyFilter({ maxBudget: 2500 })}
              className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View all under ₹2.5k</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetBeasts.map(f => (
              <PowerFragranceCard
                key={`budget-${f.id}`}
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

      {/* SHELF 5: FRESH COMMUNITY ARRIVALS */}
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
