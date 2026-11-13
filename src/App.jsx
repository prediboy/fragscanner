import React, { useState, useMemo, useEffect } from 'react';
import PowerFilterSidebar from './components/PowerFilterSidebar';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import MobileBottomDock from './components/MobileBottomDock';
import PowerFragranceCard from './components/PowerFragranceCard';
import MarketPulseBar from './components/MarketPulseBar';
import FragranceDetailModal from './components/FragranceDetailModal';
import ModalErrorBoundary from './components/ModalErrorBoundary';
import SyncStatsModal from './components/SyncStatsModal';
import CuratedSpotlightHub from './components/CuratedSpotlightHub';
import PaginationControls from './components/PaginationControls';
import { fetchInventoryPage, fetchFragranceDetail, fetchCatalogBrands, fetchInventoryCounts, fetchSyncMetadata } from './services/inventoryApi.js';
import { logSearchQuery, logSessionVisit } from './lib/supabaseTelemetry';
import { Analytics } from '@vercel/analytics/react';
import { Sparkles, Moon, Sun, ShieldCheck, Database, RefreshCw, Loader2 } from 'lucide-react';

const COMMUNITY_SELLERS = [
  { id: 'all', name: 'All 11 Verified Sellers' },
  { id: 'enigma_perfumes', name: 'Enigma Perfumes' },
  { id: 'sovereign_scents', name: 'Sovereign Scents' },
  { id: 'aromatic_rabbit', name: 'Aromatic Rabbit' },
  { id: 'fragfever', name: 'FragFever' },
  { id: 'second_theory', name: 'Second Theory' },
  { id: 'apex_aroma', name: 'Apex Aroma' },
  { id: 'whiffculture', name: 'Whiff Culture' },
  { id: 'rp_decants', name: 'RP Decants' },
  { id: 'gryv_scents', name: 'GRYV Scents' },
  { id: 'bluewings', name: 'Blue Wings' },
  { id: 'aar_fragrances', name: 'AAR Fragrances' }
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
        document.documentElement.classList.add('dark', 'theme-night');
        document.documentElement.classList.remove('theme-fresh');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark', 'theme-night');
        document.documentElement.classList.add('theme-fresh');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {}
  }, [isDark]);

  // Session attribution visit logging
  useEffect(() => {
    logSessionVisit();
    try {
      const modalParam = new URLSearchParams(window.location.search).get('modal');
      if (modalParam) {
        fetchFragranceDetail(modalParam).then(f => {
          if (f) setActiveFragrance(f);
        });
      }
    } catch {}
  }, []);

  // Modals state
  const [activeFragrance, setActiveFragrance] = useState(null);
  const [syncStatsOpen, setSyncStatsOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('drawer') === 'open';
    } catch {
      return false;
    }
  });

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

  // Pagination state (24 perfumes per page for fast DOM rendering & mobile battery)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  // Unified Filter State
  const [filterState, setFilterState] = useState(() => {
    try {
      const dealsParam = new URLSearchParams(window.location.search).get('deals');
      const formatParam = new URLSearchParams(window.location.search).get('format');
      return {
        formats: formatParam ? [formatParam] : ['retail'],
        maxBudget: 15000,
        selectedSeller: 'all',
        selectedBrand: 'all',
        dealsOnly: dealsParam === 'drops' ? 'drops' : null,
        selectedDna: null,
        selectedVibe: null,
        sortBy: 'price_asc'
      };
    } catch {
      return {
        formats: ['retail'],
        maxBudget: 15000,
        selectedSeller: 'all',
        selectedBrand: 'all',
        dealsOnly: null,
        selectedDna: null,
        selectedVibe: null,
        sortBy: 'price_asc'
      };
    }
  });

  // 1. PAGE-WISE INVENTORY STATE (Loads strictly 24 items per page on-demand)
  const [pageItems, setPageItems] = useState([]);
  const [totalMatching, setTotalMatching] = useState(921);
  const [totalPages, setTotalPages] = useState(Math.ceil(921 / 24));
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [spotlightDrops, setSpotlightDrops] = useState([]);
  const [spotlightNew, setSpotlightNew] = useState([]);

  // Live brand list loaded directly from Supabase DB, pre-sorted A-Z
  const [brandsList, setBrandsList] = useState([]);

  useEffect(() => {
    fetchCatalogBrands().then(list => {
      if (list && list.length > 0) {
        setBrandsList(list);
      }
    }).catch(err => {
      console.warn('Could not refresh brands from DB:', err);
    });
  }, []);

  // Live verified catalog statistics and sync metadata directly from Supabase
  const [syncMetadata, setSyncMetadata] = useState(null);
  const [sellerCounts, setSellerCounts] = useState({});
  const [catalogCounts, setCatalogCounts] = useState(() => ({
    inStock: 965,
    retail: 921,
    decant: 808,
    decants: 808,
    tester: 18,
    testers: 18,
    partial: 1,
    partials: 1,
    drops: 23,
    newArrivals: 17
  }));

  useEffect(() => {
    fetchInventoryCounts().then(counts => {
      if (counts) setCatalogCounts(counts);
    }).catch(err => {
      console.warn('Could not refresh inventory counts from DB:', err);
    });

    fetchSyncMetadata().then(meta => {
      if (meta) {
        setSyncMetadata(meta);
        if (meta.seller_counts) {
          setSellerCounts(meta.seller_counts);
        }
      }
    }).catch(err => {
      console.warn('Could not refresh sync metadata from DB:', err);
    });

    // Load spotlight drops and new arrivals directly from Supabase for the spotlight hub
    fetchInventoryPage({ dealsOnly: 'drops', page: 1, pageSize: 12 })
      .then(res => {
        setSpotlightDrops(res.items || []);
        if (res.totalCount) {
          setCatalogCounts(prev => ({ ...prev, drops: res.totalCount }));
        }
      })
      .catch(e => console.warn('Spotlight drops error:', e));

    fetchInventoryPage({ dealsOnly: 'new', page: 1, pageSize: 12 })
      .then(res => {
        setSpotlightNew(res.items || []);
        if (res.totalCount) {
          setCatalogCounts(prev => ({ ...prev, newArrivals: res.totalCount }));
        }
      })
      .catch(e => console.warn('Spotlight new arrivals error:', e));
  }, []);

  // Compute live seller inventory count list from Supabase sync metadata
  const sellersWithLiveCounts = useMemo(() => {
    return COMMUNITY_SELLERS.map(s => {
      if (s.id === 'all') return s;
      return {
        ...s,
        count: (sellerCounts && sellerCounts[s.id]) || 0
      };
    });
  }, [sellerCounts]);

  // Fetch only the requested 24 items page-wise on demand
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingPage(true);

    fetchInventoryPage({
      page: currentPage,
      pageSize,
      search: searchQuery,
      seller: filterState.selectedSeller,
      brand: filterState.selectedBrand,
      formats: filterState.formats,
      maxBudget: filterState.maxBudget,
      sortBy: filterState.sortBy,
      dealsOnly: filterState.dealsOnly
    }).then(res => {
      if (!isCancelled) {
        setPageItems(res.items);
        setTotalMatching(res.totalCount);
        setTotalPages(res.totalPages);
        setIsLoadingPage(false);
      }
    }).catch(err => {
      if (!isCancelled) {
        setIsLoadingPage(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, pageSize, searchQuery, filterState]);

  // Reset page to 1 whenever search, filter, or catalog mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterState, showFullCatalog]);

  // Debounced search query telemetry
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const t = setTimeout(() => {
        logSearchQuery(searchQuery.trim(), totalMatching);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [searchQuery, totalMatching]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setQuickFilterTab('all');
    setShowFullCatalog(false);
    setCurrentPage(1);
    setFilterState({
      formats: ['retail'],
      maxBudget: 15000,
      selectedSeller: 'all',
      selectedBrand: 'all',
      dealsOnly: null,
      selectedDna: null,
      selectedVibe: null,
      sortBy: 'price_asc'
    });
  };

  // Determine whether we are in the default unfiltered landing state
  const isUnfiltered = useMemo(() => {
    const isDefaultFormat = (filterState.formats.length === 1 && filterState.formats[0] === 'retail') || filterState.formats.length === 0;
    return !showFullCatalog &&
      !searchQuery.trim() &&
      filterState.selectedSeller === 'all' &&
      filterState.selectedBrand === 'all' &&
      !filterState.dealsOnly &&
      !filterState.selectedDna &&
      !filterState.selectedVibe &&
      filterState.maxBudget >= 15000 &&
      isDefaultFormat;
  }, [showFullCatalog, searchQuery, filterState]);

  // Active filter count for mobile badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.formats.length > 0 && filterState.formats.length < 4) {
      count += filterState.formats.length;
    }
    if (filterState.maxBudget < 15000) count++;
    if (filterState.selectedSeller !== 'all') count++;
    if (filterState.selectedBrand && filterState.selectedBrand !== 'all') count++;
    if (filterState.dealsOnly) count++;
    if (filterState.selectedDna) count++;
    if (filterState.selectedVibe) count++;
    return count;
  }, [filterState]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* GLOBAL NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
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
                10 Community Sellers • Pan-India Verified Rates
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
              <span className="hidden md:inline">10 Sellers Synced</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-24 md:pb-8 w-full max-w-full min-w-0">
        
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
          totalMatching={totalMatching}
          quickFilterTab={quickFilterTab}
          setQuickFilterTab={setQuickFilterTab}
          counts={catalogCounts}
          isCuratedActive={isUnfiltered}
          onShowAll={() => setShowFullCatalog(true)}
        />

        {/* 2-Column Responsive Layout: Power Rail Sidebar + Card Grid */}
        <div className="flex flex-col md:flex-row items-start gap-0 md:gap-6 w-full max-w-full min-w-0">
          
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
            brands={brandsList}
          />

          {/* MAIN FRAGRANCE CONTENT STREAM */}
          <div className="flex-1 min-w-0">
            {isUnfiltered ? (
              <CuratedSpotlightHub
                priceDrops={spotlightDrops}
                newArrivals={spotlightNew}
                totalDropsCount={catalogCounts.drops || 23}
                totalNewArrivalsCount={catalogCounts.newArrivals || 17}
                catalogCount={catalogCounts.inStock || 965}
                selectedFormats={filterState.formats}
                onSelectFragrance={async (selected) => {
                  setActiveFragrance(selected);
                  const detail = await fetchFragranceDetail(selected.id);
                  if (detail) setActiveFragrance(detail);
                }}
                onApplyFilter={(newFilter) => {
                  setFilterState(prev => ({ ...prev, ...newFilter }));
                  setShowFullCatalog(false);
                }}
                expandedCardId={expandedCardId}
                onToggleExpand={(id) => setExpandedCardId(prev => prev === id ? null : id)}
                sellers={sellersWithLiveCounts.filter(s => s.id !== 'all')}
                onShowAll={() => setShowFullCatalog(true)}
              />
            ) : !isLoadingPage && pageItems.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-xl font-mono">
                  ∅
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">
                    No matching fragrances found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Try relaxing your budget, clearing specific seller filters, or searching for a broader fragrance term.
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
                <div id="fragrance-grid-top" className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      Filtered Inventory
                    </span>
                    <span className="text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800 flex items-center gap-1">
                      {isLoadingPage ? (
                        <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />
                      ) : null}
                      <span>{totalMatching.toLocaleString()} matches</span>
                    </span>
                    {totalPages > 1 && (
                      <span className="text-[11px] font-mono text-slate-400">
                        (Page {currentPage} of {totalPages})
                      </span>
                    )}
                    {searchQuery.trim() ? (
                      <span className="text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                        🔍 &ldquo;{searchQuery.trim()}&rdquo; (Global Catalog Search)
                      </span>
                    ) : (
                      <>
                        {filterState.selectedSeller !== 'all' && (
                          <span className="text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            Seller: {sellersWithLiveCounts.find(s => s.id === filterState.selectedSeller)?.name || filterState.selectedSeller}
                          </span>
                        )}
                        {filterState.dealsOnly && (
                          <span className="text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            {filterState.dealsOnly === 'drops' ? '📉 Price Drops (Latest First)' : '✨ New Stock'}
                          </span>
                        )}
                        {filterState.maxBudget < 15000 && (
                          <span className="text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            &lt; ₹{filterState.maxBudget.toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    ← Back to Highlights
                  </button>
                </div>

                {/* Paginated 24-Card Grid or Loading Shimmer */}
                {isLoadingPage ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                          <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pageItems.map((f, idx) => (
                      <PowerFragranceCard
                        key={f.id || idx}
                        fragrance={f}
                        selectedFormats={filterState.formats}
                        onSelect={async (selected) => {
                          setActiveFragrance(selected);
                          const detail = await fetchFragranceDetail(selected.id);
                          if (detail) setActiveFragrance(detail);
                        }}
                        isExpanded={expandedCardId === f.id}
                        onToggleExpand={(id) => setExpandedCardId(prev => prev === id ? null : id)}
                        selectedSeller={searchQuery.trim() ? 'all' : filterState.selectedSeller}
                      />
                    ))}
                  </div>
                )}

                {/* E-Commerce Standard Pagination Controls */}
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalMatching}
                  pageSize={pageSize}
                  onPageChange={(p) => setCurrentPage(p)}
                  onPageSizeChange={(sz) => {
                    setPageSize(sz);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>

        </div>

      </main>

      {/* MOBILE STICKY BOTTOM THUMB DOCK */}
      <MobileBottomDock
        filterState={filterState}
        setFilterState={(updater) => {
          setFilterState(updater);
          setShowFullCatalog(false);
        }}
        onResetFilters={resetAllFilters}
        onOpenFilters={() => setIsMobileDrawerOpen(true)}
        activeFilterCount={activeFiltersCount}
        resultCount={totalMatching}
        counts={catalogCounts}
        isCuratedActive={isUnfiltered}
      />

      {/* MOBILE BOTTOM SHEET DRAWER */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        filterState={filterState}
        setFilterState={(updater) => {
          setFilterState(updater);
          setShowFullCatalog(false);
        }}
        onResetFilters={resetAllFilters}
        resultCount={totalMatching}
        activeFilterCount={activeFiltersCount}
        counts={catalogCounts}
        sellers={sellersWithLiveCounts.filter(s => s.id !== 'all')}
        brands={brandsList}
      />

      {/* FRAGRANCE DETAIL MODAL (Opens on Card Click) */}
      {activeFragrance && (
        <ModalErrorBoundary resetKey={activeFragrance.id} onClose={() => setActiveFragrance(null)}>
          <FragranceDetailModal
            fragrance={activeFragrance}
            allFragrances={pageItems}
            onClose={() => setActiveFragrance(null)}
            onSelectOther={async (other) => {
              setActiveFragrance(other);
              const detail = await fetchFragranceDetail(other.id);
              if (detail) setActiveFragrance(detail);
            }}
            selectedSeller={filterState.selectedSeller}
          />
        </ModalErrorBoundary>
      )}

      {/* SYNC STATS MODAL */}
      {syncStatsOpen && (
        <SyncStatsModal
          onClose={() => setSyncStatsOpen(false)}
          syncMeta={syncMetadata}
          totalCatalog={syncMetadata?.catalog_total || 1188}
          inStockBottles={catalogCounts.inStock}
          availableDecants={catalogCounts.decants}
        />
      )}

      <Analytics />
    </div>
  );
}
