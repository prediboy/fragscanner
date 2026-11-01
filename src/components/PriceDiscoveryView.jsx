import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, ArrowUpDown, Store, FlaskConical, ShoppingBag, 
  Star, ExternalLink, ArrowRight, ShieldCheck, Flame, Sparkles, X, ChevronRight
} from 'lucide-react';

export default function PriceDiscoveryView({ 
  allFragrances, 
  selectedSeller, 
  onSelectSeller, 
  onSelectFragrance 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'bottles' | 'decants' | 'both'
  const [sortBy, setSortBy] = useState('best-deals'); // 'best-deals' | 'price-asc' | 'price-desc' | 'rating' | 'name'
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'u1500' | '1500-2500' | '2500-3500' | '3500plus'
  const [displayLimit, setDisplayLimit] = useState(32);

  // Derive unique brands
  const brands = useMemo(() => {
    const counts = {};
    allFragrances.forEach(f => {
      if (f.brand) counts[f.brand] = (counts[f.brand] || 0) + 1;
    });
    return ['All', ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([b]) => b)];
  }, [allFragrances]);

  // Filtered & Sorted Fragrances
  const filteredFragrances = useMemo(() => {
    return allFragrances.filter(f => {
      // 1. Seller Filter
      if (selectedSeller !== 'all') {
        const hasBottle = f.community_sellers?.some(s => s.seller_id === selectedSeller);
        const hasDecant = f.community_decants?.some(d => d.seller_id === selectedSeller);
        if (!hasBottle && !hasDecant) return false;
      }

      // 2. Format Filter
      if (formatFilter === 'bottles' && (!f.in_seller_stock || !f.community_price)) return false;
      if (formatFilter === 'decants' && (!f.has_decants || !f.lowest_decant_price)) return false;
      if (formatFilter === 'both' && (!f.in_seller_stock || !f.has_decants)) return false;

      // 3. Brand Filter
      if (brandFilter !== 'All' && f.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;

      // 4. Price Range Filter
      const effectivePrice = f.community_price || f.lowest_decant_price || 0;
      if (priceRange === 'u1500' && effectivePrice > 1500) return false;
      if (priceRange === '1500-2500' && (effectivePrice < 1500 || effectivePrice > 2500)) return false;
      if (priceRange === '2500-3500' && (effectivePrice < 2500 || effectivePrice > 3500)) return false;
      if (priceRange === '3500plus' && effectivePrice < 3500) return false;

      // 5. Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const nameMatch = f.name.toLowerCase().includes(q);
        const brandMatch = f.brand.toLowerCase().includes(q);
        const inspoMatch = (f.dna_inspiration || '').toLowerCase().includes(q);
        const sellerMatch = f.community_sellers?.some(s => s.seller_name.toLowerCase().includes(q)) ||
                            f.community_decants?.some(d => d.seller_name.toLowerCase().includes(q));
        if (!nameMatch && !brandMatch && !inspoMatch && !sellerMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'best-deals') {
        // Prioritize in-stock with multiple sellers or decants
        const aSellers = (a.community_sellers?.length || 0) + (a.community_decants?.length || 0);
        const bSellers = (b.community_sellers?.length || 0) + (b.community_decants?.length || 0);
        if (bSellers !== aSellers) return bSellers - aSellers;
        return (a.community_price || 99999) - (b.community_price || 99999);
      }
      if (sortBy === 'price-asc') {
        const aPrice = a.community_price || (a.lowest_decant_price ? a.lowest_decant_price * 5 : 99999);
        const bPrice = b.community_price || (b.lowest_decant_price ? b.lowest_decant_price * 5 : 99999);
        return aPrice - bPrice;
      }
      if (sortBy === 'price-desc') {
        const aPrice = a.community_price || a.lowest_decant_price || 0;
        const bPrice = b.community_price || b.lowest_decant_price || 0;
        return bPrice - aPrice;
      }
      if (sortBy === 'rating') {
        return b.rating_value - a.rating_value;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [allFragrances, selectedSeller, formatFilter, brandFilter, priceRange, searchQuery, sortBy]);

  const visibleItems = filteredFragrances.slice(0, displayLimit);

  return (
    <div className="space-y-6">
      
      {/* Search & Quick Controls Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        
        {/* Top Search & Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* In-page live search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by perfume, clone inspiration (e.g. Layton, Sauvage, Aventus)..."
              className="w-full bg-[#131d31] border border-slate-700 focus:border-amber-400/80 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#131d31] border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="best-deals">Most Compared / Best Deals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Fragrantica Rating</option>
              <option value="name">Name (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          
          {/* Format Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Format:</span>
            {[
              { id: 'all', label: 'All Stock' },
              { id: 'bottles', label: '🍾 Sealed Bottles Only' },
              { id: 'decants', label: '🧪 Decants Available' },
              { id: 'both', label: '⚡ Bottle + Decant' }
            ].map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setFormatFilter(fmt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                  formatFilter === fmt.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Price Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Price:</span>
            {[
              { id: 'all', label: 'Any' },
              { id: 'u1500', label: '< ₹1.5k' },
              { id: '1500-2500', label: '₹1.5k–2.5k' },
              { id: '2500-3500', label: '₹2.5k–3.5k' },
              { id: '3500plus', label: '₹3.5k+' }
            ].map(pr => (
              <button
                key={pr.id}
                onClick={() => setPriceRange(pr.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all border shrink-0 ${
                  priceRange === pr.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                {pr.label}
              </button>
            ))}
          </div>

        </div>

        {/* Brand Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Brand:</span>
          {brands.slice(0, 15).map(b => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                brandFilter === b
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-mono">{visibleItems.length}</strong> of{' '}
          <strong className="text-white font-mono">{filteredFragrances.length}</strong> matching perfumes
        </span>
        {selectedSeller !== 'all' && (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <span>Filtered by seller</span>
            <button 
              onClick={() => onSelectSeller('all')}
              className="text-slate-400 hover:text-white underline ml-1"
            >
              (Clear)
            </button>
          </span>
        )}
      </div>

      {/* Price Discovery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {visibleItems.map(fragrance => {
          const bottleSellers = fragrance.community_sellers || [];
          const bestBottle = bottleSellers[0];
          const hasBottle = Boolean(fragrance.in_seller_stock && fragrance.community_price);
          const hasDecants = Boolean(fragrance.has_decants && fragrance.lowest_decant_price);

          // WhatsApp order URL (default to best bottle or first decant seller)
          const primaryWhatsapp = bestBottle?.whatsapp || fragrance.community_decants?.[0]?.whatsapp || '8076851481';
          const primarySellerName = bestBottle?.seller_name || fragrance.community_decants?.[0]?.seller_name || 'Seller';
          const defaultPrice = fragrance.community_price || fragrance.lowest_decant_price;
          const waMsg = `Hi ${primarySellerName}, I am inquiring about ${fragrance.brand} ${fragrance.name} quoted on FragScanner at ₹${defaultPrice}. Is it in stock?`;
          const waUrl = `https://wa.me/91${primaryWhatsapp}?text=${encodeURIComponent(waMsg)}`;

          return (
            <div
              key={fragrance.id}
              onClick={() => onSelectFragrance(fragrance)}
              className="group p-4 rounded-2xl bg-[#0f172a] hover:bg-[#131d31] border border-slate-800 hover:border-amber-400/60 transition-all flex flex-col justify-between shadow-lg cursor-pointer relative"
            >
              <div>
                
                {/* Brand & Clone Target Badge */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 truncate">
                    {fragrance.brand}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{fragrance.rating_value.toFixed(1)}</span>
                  </div>
                </div>

                {/* Fragrance Name */}
                <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                  {fragrance.name}
                </h3>

                {/* Clone Target / Inspiration */}
                {fragrance.dna_inspiration ? (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                    🎯 <span className="text-slate-300 font-medium">Inspired by {fragrance.dna_inspiration}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                    {fragrance.collection} • {fragrance.concentration}
                  </p>
                )}

                {/* DUAL PRICING DISCOVERY BOX */}
                <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-slate-800/80 space-y-2 mb-3">
                  
                  {/* Full Bottle Quote */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-emerald-400" />
                      <span>100ml Retail:</span>
                    </span>
                    {hasBottle ? (
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          ₹{fragrance.community_price}
                        </span>
                        <span className="block text-[9px] text-emerald-400/80 font-semibold truncate max-w-[120px]">
                          via {bestBottle?.seller_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Bottle: Unlisted
                      </span>
                    )}
                  </div>

                  {/* Decant Quote */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-cyan-400" />
                      <span>Decants (5-30ml):</span>
                    </span>
                    {hasDecants ? (
                      <div className="text-right">
                        <span className="text-xs font-black text-cyan-300 font-mono">
                          from ₹{fragrance.lowest_decant_price}
                        </span>
                        <span className="block text-[9px] text-cyan-400/80 font-semibold">
                          {fragrance.community_decants?.length || 1} Decant {fragrance.community_decants?.length === 1 ? 'Seller' : 'Sellers'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Custom decant only
                      </span>
                    )}
                  </div>

                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFragrance(fragrance);
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <span>Compare Sellers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
                >
                  <span>Buy</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

      {/* Show More Pagination Button */}
      {displayLimit < filteredFragrances.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setDisplayLimit(prev => prev + 32)}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-colors shadow"
          >
            Load More Fragrances ({filteredFragrances.length - displayLimit} remaining)
          </button>
        </div>
      )}

      {filteredFragrances.length === 0 && (
        <div className="text-center py-16 bg-[#0f172a] rounded-2xl border border-slate-800 p-8 space-y-2">
          <p className="text-base font-bold text-slate-200">
            No perfumes match your current filters.
          </p>
          <p className="text-xs text-slate-400">
            Try resetting your seller, brand, or price range filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setBrandFilter('All');
              setFormatFilter('all');
              setPriceRange('all');
              onSelectSeller('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs mt-2"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
}
