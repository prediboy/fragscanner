import React, { useState, useMemo, useEffect } from 'react';
import fragrancesData from './data/fragrances.json';
import syncMeta from './data/sync_meta.json';
import PowerFilterSidebar from './components/PowerFilterSidebar';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import PowerFragranceCard from './components/PowerFragranceCard';
import MarketPulseBar from './components/MarketPulseBar';
import FragranceDetailModal from './components/FragranceDetailModal';
import SyncStatsModal from './components/SyncStatsModal';
import CuratedSpotlightHub from './components/CuratedSpotlightHub';
import { filterCatalogSemantically } from './utils/semanticSearch';
import { logSearchQuery, logSessionVisit } from './lib/supabaseTelemetry';
import { Analytics } from '@vercel/analytics/react';
import { Sparkles, Moon, Sun, ShieldCheck, Database, RefreshCw } from 'lucide-react';

const COMMUNITY_SELLERS = [
  { id: 'all', name: 'All 11 Verified Sellers' },
  { id: 'enigma_perfumes', name: 'Enigma Perfumes' },
  { id: 'sovereign_scents', name: 'Sovereign Scents' },
  { id: 'fragfever', name: 'FragFever' },
  { id: 'second_theory', name: 'Second Theory' },
  { id: 'apex_aroma', name: 'Apex Aroma' },
  { id: 'whiffculture', name: 'Whiff Culture' },
  { id: 'rp_decants', name: 'RP Decants' },
  { id: 'gryv_scents', name: 'GRYV Scents' },
  { id: 'bluewings', name: 'Blue Wings' },
  { id: 'aar_fragrances', name: 'AAR Fragrances' },
  { id: 'fragrance_heaven', name: 'Fragrance Heaven' }
];

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('theme') !== 'light';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {}
  }, [isDark]);

  // Session attribution visit logging
  useEffect(() => {
    logSessionVisit();
  }, []);

  // Modals state
  const [activeFragrance, setActiveFragrance] = useState(null);
  const [syncStatsOpen, setSyncStatsOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch {
      return '';
    }
  });

  // Top quick filter tab: 'all' | 'drops' | 'decants' | 'testers' | 'partials' | 'under2k'
  const [quickFilterTab, setQuickFilterTab] = useState('all');

  // Explicit user override to show all catalog
  const [showFullCatalog, setShowFullCatalog] = useState(false);

  // Unified Filter State
  const [filterState, setFilterState] = useState(() => {
    try {
      const dealsParam = new URLSearchParams(window.location.search).get('deals');
      return {
        formats: ['retail', 'decant'],
        maxBudget: 15000,
        selectedSeller: 'all',
        dealsOnly: dealsParam === 'drops' ? 'drops' : null,
        selectedDna: null,
        selectedVibe: null,
        sortBy: 'price_asc'
      };
    } catch {
      return {
        formats: ['retail', 'decant'],
        maxBudget: 15000,
        selectedSeller: 'all',
        dealsOnly: null,
        selectedDna: null,
        selectedVibe: null,
        sortBy: 'price_asc'
      };
    }
  });

  // 1. STRICTLY ACTIVE IN-STOCK INVENTORY BASE
  // Preserves all 1,188 in master fragrancesData, but strictly hides the 223 unquoted items from the shopping feed
  const inStockCatalog = useMemo(() => {
    return fragrancesData.filter(f => {
      const hasBottles = Array.isArray(f.community_sellers) && f.community_sellers.some(s => Number(s.price) > 0);
      const hasDecants = Array.isArray(f.community_decants) && f.community_decants.some(d => (
        Number(d.lowest_price) > 0 || (d.sizes && Object.values(d.sizes).some(v => Number(v) > 0))
      ));
      return (f.in_seller_stock || f.has_decants) && (hasBottles || hasDecants);
    });
  }, []);

  // Compute live catalog statistics on verified stock
  const catalogCounts = useMemo(() => {
    let inStock = 0;
    let drops = 0;
    let decants = 0;
    let testers = 0;
    let partials = 0;
    let retail = 0;

    for (const f of inStockCatalog) {
      if (f.in_seller_stock) inStock++;
      if (f.is_price_drop && f.community_price) drops++;
      if (f.has_decants) decants++;
      if (f.is_tester || (Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.is_tester))) testers++;
      if (f.is_partial || (Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.is_partial))) partials++;
      if (f.in_seller_stock && !f.is_tester && !f.is_partial) retail++;
    }

    return { inStock, drops, decants, testers, partials, retail };
  }, [inStockCatalog]);

  // Compute live seller inventory count list
  const sellersWithLiveCounts = useMemo(() => {
    return COMMUNITY_SELLERS.map(s => {
      if (s.id === 'all') return s;
      const count = inStockCatalog.filter(f => {
        const inB = Array.isArray(f.community_sellers) && f.community_sellers.some(q => q.seller_id === s.id && Number(q.price) > 0);
        const inD = Array.isArray(f.community_decants) && f.community_decants.some(d => d.seller_id === s.id);
        return inB || inD;
      }).length;
      return {
        ...s,
        count
      };
    });
  }, [inStockCatalog]);

  // Step 1: Base Facet Filtering (Seller, Formats, Budget, Deals, Vibe)
  const baseFiltered = useMemo(() => {
    const {
      formats,
      maxBudget,
      selectedSeller,
      dealsOnly,
      selectedDna,
      selectedVibe
    } = filterState;

    const normalizeStr = (s) => (s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    return inStockCatalog.filter(f => {
      // 1. Seller Isolation Filter: If a specific seller is selected, perfume MUST be in that seller's active stock!
      if (selectedSeller !== 'all') {
        const inBottles = Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.seller_id === selectedSeller && Number(s.price) > 0);
        const inDecants = Array.isArray(f.community_decants) && f.community_decants.some(d => d.seller_id === selectedSeller);
        if (!inBottles && !inDecants) return false;
      }

      // 2. Deals Only Filter
      if (dealsOnly === 'drops' && (!f.is_price_drop || !f.community_price)) return false;
      if (dealsOnly === 'new' && (!f.is_new_arrival || !f.community_price)) return false;

      // 3. Format & Packaging Filter
      if (formats.length > 0 && formats.length < 4) {
        let hasRetail = false;
        let hasTester = false;
        let hasPartial = false;
        let hasDecant = false;

        if (selectedSeller === 'all') {
          hasRetail = formats.includes('retail') && f.in_seller_stock && !f.is_tester && !f.is_partial;
          hasTester = formats.includes('tester') && (f.is_tester || (Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.is_tester)));
          hasPartial = formats.includes('partial') && (f.is_partial || (Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.is_partial)));
          hasDecant = formats.includes('decant') && f.has_decants;
        } else {
          // Seller-specific format check
          hasRetail = formats.includes('retail') && Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.seller_id === selectedSeller && !s.is_tester && !s.is_partial && Number(s.price) > 0);
          hasTester = formats.includes('tester') && Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.seller_id === selectedSeller && s.is_tester && Number(s.price) > 0);
          hasPartial = formats.includes('partial') && Array.isArray(f.community_sellers) && f.community_sellers.some(s => s.seller_id === selectedSeller && s.is_partial && Number(s.price) > 0);
          hasDecant = formats.includes('decant') && Array.isArray(f.community_decants) && f.community_decants.some(d => d.seller_id === selectedSeller);
        }

        if (!hasRetail && !hasTester && !hasPartial && !hasDecant) return false;
      }

      // 4. Max Budget Filter
      if (maxBudget < 15000) {
        if (selectedSeller === 'all') {
          const bottleP = Number(f.community_price || 999999);
          const decantP = Number(f.lowest_decant_price || 999999);
          if (bottleP > maxBudget && decantP > maxBudget) return false;
        } else {
          // Check against selected seller's actual price
          const sellerBottle = Array.isArray(f.community_sellers) ? f.community_sellers.find(s => s.seller_id === selectedSeller && Number(s.price) > 0) : null;
          const sellerDecant = Array.isArray(f.community_decants) ? f.community_decants.find(d => d.seller_id === selectedSeller) : null;
          const bPrice = sellerBottle ? Number(sellerBottle.price) : 999999;
          const dPrice = sellerDecant ? Number(sellerDecant.lowest_price || 999999) : 999999;
          if (bPrice > maxBudget && dPrice > maxBudget) return false;
        }
      }

      // 5. Cloned DNA Target Filter (Quick chips)
      if (selectedDna) {
        const term = selectedDna.toLowerCase();
        const inspo = normalizeStr(f.dna_inspiration);
        const name = normalizeStr(f.name);
        if (!inspo.includes(term) && !name.includes(term)) return false;
      }

      // 6. Olfactory Vibe & Accords Filter
      if (selectedVibe) {
        const accords = Array.isArray(f.accords) ? f.accords.map(a => a.name.toLowerCase()).join(' ') : '';
        const inspo = normalizeStr(f.dna_inspiration);
        if (selectedVibe === 'fresh') {
          if (!accords.includes('citrus') && !accords.includes('aquatic') && !accords.includes('fresh') && !accords.includes('aromatic')) return false;
        } else if (selectedVibe === 'beastmode') {
          if (!accords.includes('amber') && !accords.includes('spicy') && !accords.includes('tobacco') && !accords.includes('vanilla') && !(f.longevity && f.longevity.includes('Long'))) return false;
        } else if (selectedVibe === 'gourmand') {
          if (!accords.includes('sweet') && !accords.includes('vanilla') && !accords.includes('caramel') && !accords.includes('coffee') && !inspo.includes('angels')) return false;
        } else if (selectedVibe === 'office') {
          if (!accords.includes('iris') && !accords.includes('clean') && !accords.includes('vetiver') && !accords.includes('powdery')) return false;
        }
      }

      return true;
    });
  }, [inStockCatalog, filterState]);

  // Step 2: Semantic Search Filter (Typo-tolerant, clone-aware, notes-aware)
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return baseFiltered;
    return filterCatalogSemantically(baseFiltered, searchQuery.trim());
  }, [baseFiltered, searchQuery]);

  // Step 3: Sorting Engine
  const finalSortedFragrances = useMemo(() => {
    const { sortBy, selectedSeller } = filterState;
    const isSpecificSeller = selectedSeller !== 'all';

    return [...searchFiltered].sort((a, b) => {
      // Helper to extract effective price based on seller context
      const getPriceA = (item) => {
        if (isSpecificSeller) {
          const sB = Array.isArray(item.community_sellers) ? item.community_sellers.find(s => s.seller_id === selectedSeller && Number(s.price) > 0) : null;
          const sD = Array.isArray(item.community_decants) ? item.community_decants.find(d => d.seller_id === selectedSeller) : null;
          return sB ? Number(sB.price) : (sD ? Number(sD.lowest_price || 999999) : 999999);
        }
        return Number(item.community_price || item.lowest_decant_price || 999999);
      };

      const getPriceB = (item) => {
        if (isSpecificSeller) {
          const sB = Array.isArray(item.community_sellers) ? item.community_sellers.find(s => s.seller_id === selectedSeller && Number(s.price) > 0) : null;
          const sD = Array.isArray(item.community_decants) ? item.community_decants.find(d => d.seller_id === selectedSeller) : null;
          return sB ? Number(sB.price) : (sD ? Number(sD.lowest_price || 999999) : 999999);
        }
        return Number(item.community_price || item.lowest_decant_price || 999999);
      };

      if (sortBy === 'price_asc') {
        return getPriceA(a) - getPriceB(b);
      }
      if (sortBy === 'price_desc') {
        return getPriceB(b) - getPriceA(a);
      }
      if (sortBy === 'drop_percent') {
        const da = a.is_price_drop ? Number(a.price_change_percentage || 0) : -1;
        const db = b.is_price_drop ? Number(b.price_change_percentage || 0) : -1;
        return db - da;
      }
      if (sortBy === 'decant_asc') {
        const da = Number(a.lowest_decant_price || 999999);
        const db = Number(b.lowest_decant_price || 999999);
        return da - db;
      }
      if (sortBy === 'rating') {
        return (Number(b.rating_value) || 0) - (Number(a.rating_value) || 0);
      }
      if (sortBy === 'newest') {
        const ta = new Date(a.price_updated_at || a.new_arrival_date || 0).getTime();
        const tb = new Date(b.price_updated_at || b.new_arrival_date || 0).getTime();
        return tb - ta;
      }
      return 0;
    });
  }, [searchFiltered, filterState]);

  // Debounced search query telemetry
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const t = setTimeout(() => {
        logSearchQuery(searchQuery.trim(), finalSortedFragrances.length);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [searchQuery, finalSortedFragrances.length]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setQuickFilterTab('all');
    setShowFullCatalog(false);
    setFilterState({
      formats: ['retail', 'decant'],
      maxBudget: 15000,
      selectedSeller: 'all',
      dealsOnly: null,
      selectedDna: null,
      selectedVibe: null,
      sortBy: 'price_asc'
    });
  };

  // Determine whether we are in the default unfiltered landing state
  const isUnfiltered = useMemo(() => {
    return !showFullCatalog &&
      !searchQuery.trim() &&
      filterState.selectedSeller === 'all' &&
      !filterState.dealsOnly &&
      !filterState.selectedDna &&
      !filterState.selectedVibe &&
      filterState.maxBudget >= 15000 &&
      (filterState.formats.length >= 2 || filterState.formats.length === 0);
  }, [showFullCatalog, searchQuery, filterState]);

  // Active filter count for mobile badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.formats.length > 0 && filterState.formats.length < 4) count += filterState.formats.length;
    if (filterState.maxBudget < 15000) count++;
    if (filterState.selectedSeller !== 'all') count++;
    if (filterState.dealsOnly) count++;
    if (filterState.selectedDna) count++;
    if (filterState.selectedVibe) count++;
    return count;
  }, [filterState]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* GLOBAL NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetAllFilters}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 flex items-center justify-center font-black text-white text-base shadow-md font-mono">
              FS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  FragScanner
                </span>
                <span className="hidden sm:inline text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold">
                  LIVE ARBITRAGE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
                11 Community Sellers • Pan-India Verified Rates
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sync Meta Stats Button */}
            <button
              onClick={() => setSyncStatsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              title="View live catalog sync status"
            >
              <Database className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden md:inline">11 Sellers Synced</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

          </div>

        </div>
      </header>

      {/* MAIN PAGE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
        
        {/* Search, Lenses & Sorting Bar */}
        <MarketPulseBar
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim()) setShowFullCatalog(false);
          }}
          filterState={filterState}
          setFilterState={(updater) => {
            setFilterState(updater);
            setShowFullCatalog(false);
          }}
          onResetFilters={resetAllFilters}
          totalMatching={finalSortedFragrances.length}
          quickFilterTab={quickFilterTab}
          setQuickFilterTab={setQuickFilterTab}
          counts={catalogCounts}
          isCuratedActive={isUnfiltered}
        />

        {/* 2-Column Responsive Layout: Power Rail Sidebar + Card Grid */}
        <div className="flex items-start gap-6">
          
          {/* DESKTOP POWER FILTER RAIL */}
          <PowerFilterSidebar
            filterState={filterState}
            setFilterState={(updater) => {
              setFilterState(updater);
              setShowFullCatalog(false);
            }}
            onResetFilters={resetAllFilters}
            counts={catalogCounts}
            sellers={sellersWithLiveCounts.filter(s => s.id !== 'all')}
          />

          {/* MAIN FRAGRANCE CONTENT STREAM */}
          <div className="flex-1 min-w-0">
            {isUnfiltered ? (
              <CuratedSpotlightHub
                catalog={inStockCatalog}
                onSelectFragrance={(selected) => setActiveFragrance(selected)}
                onApplyFilter={(newFilter) => {
                  setFilterState(prev => ({ ...prev, ...newFilter }));
                  setShowFullCatalog(false);
                }}
                expandedCardId={expandedCardId}
                onToggleExpand={(id) => setExpandedCardId(prev => prev === id ? null : id)}
                sellers={sellersWithLiveCounts.filter(s => s.id !== 'all')}
                onShowAll={() => setShowFullCatalog(true)}
              />
            ) : finalSortedFragrances.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-xl font-mono">
                  ∅
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">
                    No matching fragrances found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Try relaxing your budget, clearing specific seller filters, or searching for a broader fragrance DNA term.
                  </p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-xs"
                >
                  Back to Curated Highlights
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Filter Bar Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      Filtered Inventory
                    </span>
                    <span className="text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                      {finalSortedFragrances.length} matches
                    </span>
                    {filterState.selectedSeller !== 'all' && (
                      <span className="text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        Seller: {sellersWithLiveCounts.find(s => s.id === filterState.selectedSeller)?.name || filterState.selectedSeller}
                      </span>
                    )}
                    {filterState.dealsOnly && (
                      <span className="text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {filterState.dealsOnly === 'drops' ? '📉 Price Drops' : '✨ New Stock'}
                      </span>
                    )}
                    {filterState.selectedDna && (
                      <span className="text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                        Clones: {filterState.selectedDna}
                      </span>
                    )}
                    {filterState.maxBudget < 15000 && (
                      <span className="text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        &lt; ₹{filterState.maxBudget.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    ← Back to Highlights
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {finalSortedFragrances.map((f, idx) => (
                    <PowerFragranceCard
                      key={f.id || idx}
                      fragrance={f}
                      onSelect={(selected) => setActiveFragrance(selected)}
                      isExpanded={expandedCardId === f.id}
                      onToggleExpand={(id) => setExpandedCardId(prev => prev === id ? null : id)}
                      selectedSeller={filterState.selectedSeller}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* MOBILE BOTTOM SHEET & FLOATING THUMB CAPSULE */}
      <MobileFilterDrawer
        filterState={filterState}
        setFilterState={(updater) => {
          setFilterState(updater);
          setShowFullCatalog(false);
        }}
        onResetFilters={resetAllFilters}
        resultCount={finalSortedFragrances.length}
        activeFilterCount={activeFiltersCount}
        counts={catalogCounts}
        sellers={sellersWithLiveCounts.filter(s => s.id !== 'all')}
      />

      {/* FRAGRANCE DETAIL MODAL (Opens on Card Click) */}
      {activeFragrance && (
        <FragranceDetailModal
          fragrance={activeFragrance}
          allFragrances={fragrancesData}
          onClose={() => setActiveFragrance(null)}
          onSelectOther={(other) => setActiveFragrance(other)}
          selectedSeller={filterState.selectedSeller}
        />
      )}

      {/* SYNC STATS MODAL */}
      {syncStatsOpen && (
        <SyncStatsModal
          onClose={() => setSyncStatsOpen(false)}
          syncMeta={syncMeta}
          totalCatalog={fragrancesData.length}
          inStockBottles={catalogCounts.inStock}
          availableDecants={catalogCounts.decants}
        />
      )}

      <Analytics />
    </div>
  );
}
