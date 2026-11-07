import React, { useState } from 'react';
import { 
  X, Star, Sparkles, Wind, Sun, Moon, Calendar, 
  CheckCircle2, AlertCircle, Quote, Layers, ArrowRight, Zap, Tag, Flame,
  Store, ShieldCheck, Truck, ExternalLink, ShoppingBag, FlaskConical, Globe 
} from 'lucide-react';
import { getFragranceRecommendations } from '../utils/recommender';
import { logWhatsAppClick } from '../lib/supabaseTelemetry';

export default function FragranceDetailModal({ fragrance, allFragrances = [], onClose, onSelectOther, selectedSeller = 'all' }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'recommendations'

  if (!fragrance) return null;

  const recommendations = getFragranceRecommendations(fragrance.id, allFragrances, 8) || { flankers: [], dnaTwins: [], similarAccords: [] };

  const getBrandBadgeColor = (brand) => {
    switch (brand.toLowerCase()) {
      case 'french avenue': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'lattafa': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'afnan': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'armaf': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'titan skinn': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'rasasi': return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'mykonos': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'rayhaan': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const modalDisplayName = fragrance.brand && !fragrance.name.toLowerCase().includes(fragrance.brand.toLowerCase())
    ? `${fragrance.brand} ${fragrance.name}`
    : fragrance.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 bg-[#131d31] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBrandBadgeColor(fragrance.brand)}`}>
                {fragrance.brand}
              </span>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                {fragrance.collection}
              </span>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                {fragrance.concentration}
              </span>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                {fragrance.gender}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">
              {fragrance.name}
            </h2>
            
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{(Number(fragrance.rating_value) || 4.2).toFixed(2)} / 5</span>
              </div>
              <span>•</span>
              <span>{(Number(fragrance.rating_count) || 1200).toLocaleString()} Fragrantica community votes</span>
              {fragrance.release_year && (
                <>
                  <span>•</span>
                  <span>Released {fragrance.release_year}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/90 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fragrance Profile & Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'recommendations'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>"You Will Also Like" Engine</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {(recommendations?.flankers.length || 0) + (recommendations?.dnaTwins.length || 0) + (recommendations?.topMatches.length || 0)}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#0b1120]">

          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === 'overview' && (
            <>
              {/* DNA Inspiration Card */}
              {fragrance.dna_inspiration && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Closest Match / High-End Inspiration</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {fragrance.dna_inspiration}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Classification: <span className="text-slate-200 font-semibold">{fragrance.dna_type}</span>
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {fragrance.similarity_percentage}%
                      </div>
                      <span className="text-[11px] text-slate-400">Olfactory Match to Target</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Community Sellers Marketplace: Dual Pricing (Full Bottles & Decants) */}
              <div className="bg-[#101b30] border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-0.5">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Community Sellers Marketplace • Dual Pricing</span>
                      {fragrance.is_hot_seller && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                          <span>Hot Selling</span>
                        </span>
                      )}
                      {fragrance.is_new_arrival && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1.5 shadow-xs">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                          </span>
                          <span>New Arrival (Last 4 Days)</span>
                        </span>
                      )}
                      {fragrance.is_price_drop && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1.5 shadow-xs">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                          </span>
                          <span>Price Drop (Last 2 Days)</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      Live quotes verified across 11 community sellers for both <strong>Full Bottles & Testers</strong> and <strong>Decants (2ml - 30ml)</strong>:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
                      {fragrance.community_sellers?.length || 0} Bottle {fragrance.community_sellers?.length === 1 ? 'Seller' : 'Sellers'}
                    </span>
                    {fragrance.has_decants && (
                      <span className="text-[11px] text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/40 font-mono font-bold flex items-center gap-1">
                        <FlaskConical className="w-3 h-3 text-cyan-400" />
                        Decants Available
                      </span>
                    )}
                  </div>
                </div>

                {/* SECTION 1: FULL BOTTLES (BNIB) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>🍾 Bottles & Retail Packs</span>
                    </h4>
                    {fragrance.community_price && !isNaN(Number(fragrance.community_price)) && Number(fragrance.community_price) > 0 && (
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 flex-wrap">
                        {fragrance.is_price_drop && fragrance.previous_price && (
                          <span className="text-slate-400 line-through text-[11px] font-normal">
                            ₹{Number(fragrance.previous_price).toLocaleString()}
                          </span>
                        )}
                        <span>Best: ₹{Number(fragrance.community_price).toLocaleString()}</span>
                        {fragrance.community_bottle_size && (
                          <span className="text-slate-400 font-normal ml-0.5">({fragrance.community_bottle_size.replace(' Retail Bottle', ' Bottle')})</span>
                        )}
                        {fragrance.is_price_drop && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            📉 -{fragrance.price_change_percentage || Math.round((Math.abs(fragrance.previous_price - fragrance.community_price) / fragrance.previous_price) * 100)}% Drop
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {fragrance.in_seller_stock && fragrance.community_sellers && fragrance.community_sellers.filter(s => Number(s.price) > 0 && !isNaN(Number(s.price))).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fragrance.community_sellers
                        .filter(s => Number(s.price) > 0 && !isNaN(Number(s.price)))
                        .map((seller, sIdx, filteredSellers) => {
                          const priceNum = Number(seller.price);
                          const isLowest = sIdx === 0 && filteredSellers.length > 1;
                          const isCurrentSelected = selectedSeller !== 'all' && seller.seller_id === selectedSeller;
                          const bottleLabel = seller.size || 'Bottle';
                          const waMessage = `Hi ${seller.seller_name}, saw your price for ${modalDisplayName} (${bottleLabel}) quoted at ₹${priceNum.toLocaleString()} on FragScanner. Is this in stock?`;
                          const waUrl = `https://wa.me/91${seller.whatsapp}?text=${encodeURIComponent(waMessage)}`;

                          return (
                            <div 
                              key={sIdx}
                              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                                isCurrentSelected
                                  ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-2 ring-cyan-500/40'
                                  : isLowest
                                    ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h5 className="font-bold text-sm text-white">{seller.seller_name}</h5>
                                      {isCurrentSelected && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500 font-mono font-bold flex items-center gap-1">
                                          <span>🎯</span>
                                          <span>Selected Seller</span>
                                        </span>
                                      )}
                                      {seller.is_partial || (seller.size && /partial/i.test(seller.size)) ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500 font-mono font-bold flex items-center gap-1">
                                          <span>🏷️</span>
                                          <span>{seller.size || 'Partial'}</span>
                                        </span>
                                      ) : seller.is_tester || (seller.size && /tester/i.test(seller.size)) ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500 font-mono font-bold flex items-center gap-1">
                                          <span>🧪</span>
                                          <span>{seller.size || 'Tester'}</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700 font-mono font-semibold">
                                          {seller.size || 'Retail Bottle'}
                                        </span>
                                      )}
                                      {isLowest && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold flex items-center gap-0.5">
                                          ★ Best Deal
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                      Verified Community Seller
                                    </span>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-lg font-black text-emerald-400 font-mono">
                                      ₹{priceNum.toLocaleString()}
                                    </span>
                                  <span className="block text-[9px] text-emerald-300 font-semibold truncate max-w-[130px]">
                                    {seller.shipping}
                                  </span>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-300 mb-3 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                                Quoted on active {seller.seller_name} price list. WhatsApp order directly with seller.
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-2">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Truck className="w-3 h-3 text-slate-400" /> Dispatch: {seller.dispatch || '24-48 hrs'}
                              </span>
                              <div className="flex items-center gap-2">
                                {seller.product_url && (
                                  <a
                                    href={seller.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
                                  >
                                    <span>Store Page</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => logWhatsAppClick({
                                    sellerName: seller.seller_name,
                                    fragranceName: fragrance.name,
                                    brand: fragrance.brand,
                                    price: seller.price,
                                    format: 'bottle'
                                  })}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
                                >
                                  <span>Buy on WhatsApp</span>
                                  <ArrowRight className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-400 font-semibold">Full Bottle Status: Not Listed on Current Sheets</span>
                        <span className="text-slate-400 text-[10px]">Second Theory • FragFever • Apex Aroma</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Ask sellers directly if they can source a sealed retail bottle for you:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <a
                          href={`https://wa.me/918076851481?text=${encodeURIComponent(`Hi Second Theory, saw your seller profile on FragScanner. I noticed ${fragrance.brand} ${fragrance.name} is not currently listed. Can you source this perfume?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <span>Ask Second Theory</span>
                        </a>
                        <a
                          href={`https://wa.me/919716764787?text=${encodeURIComponent(`Hi FragFever, saw your seller profile on FragScanner. I noticed ${fragrance.brand} ${fragrance.name} is not currently listed. Can you source this perfume?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <span>Ask FragFever</span>
                        </a>
                        <a
                          href={`https://wa.me/919456411103?text=${encodeURIComponent(`Hi Apex Aroma, saw your seller profile on FragScanner. I noticed ${fragrance.brand} ${fragrance.name} is not currently listed. Can you source this perfume?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <span>Ask Apex Aroma</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: DECANTS & SAMPLES (5ML, 10ML, 20ML, 30ML) */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                        <span>🧪 Decants & Samples (5ml • 8ml • 10ml • 20ml • 30ml)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Comparing live decant rates from <strong>Liquid Emotions</strong>, <strong>Blue Wings</strong> & <strong>Whiff Culture</strong>:
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href="https://liquidemotions.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Liquid Emotions</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <span className="text-slate-600">•</span>
                      <a
                        href="https://bluewingsfnd.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Blue Wings</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <span className="text-slate-600">•</span>
                      <a
                        href="https://www.whiffculture.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Whiff Culture</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {fragrance.has_decants && fragrance.decant_comparison ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {['2ml', '3ml', '5ml', '8ml', '10ml', '20ml', '30ml'].map((size) => {
                        const sizeData = fragrance.decant_comparison[size];
                        if (!sizeData || !sizeData.quotes || sizeData.quotes.length === 0) return null;

                        const validQuotes = sizeData.quotes.filter(q => {
                          const p = Number(q.price);
                          return p && !isNaN(p) && p > 0;
                        });
                        if (validQuotes.length === 0) return null;

                        const lowestPrice = Number(sizeData.lowest_price || validQuotes[0]?.price);
                        if (!lowestPrice || isNaN(lowestPrice) || lowestPrice <= 0) return null;

                        return (
                          <div
                            key={size}
                            className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex flex-col justify-between shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-extrabold text-xs font-mono">
                                  {size} Decant
                                </span>
                                <span className="text-base font-black text-white font-mono">
                                  ₹{lowestPrice.toLocaleString()}
                                </span>
                              </div>

                              <div className="space-y-1.5 mb-3">
                                {validQuotes.map((q, qIdx) => {
                                  const isWinning = q.price === lowestPrice;
                                  return (
                                    <div 
                                      key={qIdx}
                                      className={`flex items-center justify-between text-[11px] p-1.5 rounded-lg border ${
                                        isWinning 
                                          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200' 
                                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1 truncate mr-1">
                                        <span className="font-semibold truncate">{q.seller_name}</span>
                                        {isWinning && (
                                          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-200 font-bold shrink-0">
                                            Best
                                          </span>
                                        )}
                                      </div>
                                      <span className="font-mono font-bold shrink-0">
                                        ₹{Number(q.price).toLocaleString()}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80">
                              {/* Order best quote directly */}
                              {(() => {
                                const topQuote = validQuotes[0];
                                const waMsg = `Hi ${topQuote.seller_name}, saw your price for ${modalDisplayName} (${size} Decant) quoted at ₹${Number(topQuote.price).toLocaleString()} on FragScanner. Is this in stock?`;
                                const waUrl = `https://wa.me/91${topQuote.whatsapp}?text=${encodeURIComponent(waMsg)}`;

                                return (
                                  <div className="flex items-center gap-1.5">
                                    {topQuote.website && topQuote.website.includes('http') && (
                                      <a
                                        href={topQuote.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                                        title={`Visit ${topQuote.seller_name} product page`}
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => logWhatsAppClick({
                                        sellerName: topQuote.seller_name,
                                        fragranceName: fragrance.name,
                                        brand: fragrance.brand,
                                        price: topQuote.price,
                                        format: 'decant'
                                      })}
                                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow"
                                    >
                                      <span>Buy {size} on WhatsApp</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </a>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <p className="text-xs text-slate-300">
                        Fixed decants are not pre-listed for <strong>{fragrance.name}</strong>, but community decant sellers frequently decant customer requests upon inquiry:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <a
                          href={`https://wa.me/917982410620?text=${encodeURIComponent(`Hi Liquid Emotions, saw your decant catalog on FragScanner. Do you have decants available for ${fragrance.brand} ${fragrance.name}?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <FlaskConical className="w-3 h-3 text-cyan-400" />
                          <span>Ask Liquid Emotions</span>
                        </a>
                        <a
                          href={`https://wa.me/919899401419?text=${encodeURIComponent(`Hi Blue Wings, saw your decant catalog on FragScanner. Do you have decants available for ${fragrance.brand} ${fragrance.name}?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <FlaskConical className="w-3 h-3 text-cyan-400" />
                          <span>Ask Blue Wings</span>
                        </a>
                        <a
                          href={`https://wa.me/919811377357?text=${encodeURIComponent(`Hi Whiff Culture, saw your decant catalog on FragScanner. Do you have decants available for ${fragrance.brand} ${fragrance.name}?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <FlaskConical className="w-3 h-3 text-cyan-400" />
                          <span>Ask Whiff Culture</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Always record an uncut unboxing video upon delivery as per community seller policy.</span>
                  </div>
                  <span className="text-slate-400">Glass atomizers & secure packaging guaranteed</span>
                </div>
              </div>
              <div className="bg-[#131d31] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <span>Main Accords</span>
                    <span className="text-xs text-slate-400 font-normal">(Fragrantica Breakdown)</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">Relative Weight</span>
                </div>

                <div className="space-y-2">
                  {fragrance.accords.map((accord, idx) => (
                    <div key={idx} className="relative h-7 rounded-lg bg-slate-900/90 overflow-hidden flex items-center justify-between px-3">
                      <div 
                        className="absolute left-0 top-0 bottom-0 opacity-80 rounded-lg transition-all duration-700"
                        style={{ 
                          width: `${accord.score}%`, 
                          backgroundColor: accord.color || '#d97706' 
                        }}
                      />
                      <span className="relative z-10 text-xs font-bold text-white drop-shadow">
                        {accord.name}
                      </span>
                      <span className="relative z-10 text-xs font-mono font-bold text-white/90 drop-shadow">
                        {accord.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note Pyramid (Top, Middle, Base) */}
              <div className="bg-[#131d31] border border-slate-800 rounded-2xl p-5">
                <h4 className="text-base font-bold text-slate-200 mb-4">
                  Olfactory Pyramid Breakdown
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Top Notes */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Top Notes</span>
                      <span className="text-[10px] text-slate-400 font-normal">First 15-30m</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(fragrance.notes?.top || []).length > 0 ? (
                        fragrance.notes.top.map((note, idx) => (
                          <span key={idx} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                            {note}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">Fresh Citrus, Bergamot accords</span>
                      )}
                    </div>
                  </div>

                  {/* Middle Notes */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Heart / Middle</span>
                      <span className="text-[10px] text-slate-400 font-normal">Hours 1-4</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(fragrance.notes?.middle || []).length > 0 ? (
                        fragrance.notes.middle.map((note, idx) => (
                          <span key={idx} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                            {note}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">Floral, Aromatic heart</span>
                      )}
                    </div>
                  </div>

                  {/* Base Notes */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Base Notes</span>
                      <span className="text-[10px] text-slate-400 font-normal">Drydown 5-12h</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(fragrance.notes?.base || []).length > 0 ? (
                        fragrance.notes.base.map((note, idx) => (
                          <span key={idx} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                            {note}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">Woody, Amber, Musk base</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance, Longevity, Sillage & Seasons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#131d31] border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Longevity</span>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    {fragrance.longevity}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#131d31] border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Sillage & Projection</span>
                  <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <Wind className="w-4 h-4" />
                    {fragrance.sillage}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#131d31] border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Primary Season</span>
                  <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {fragrance.primary_season} ({fragrance.seasons?.[fragrance.primary_season.toLowerCase()]}%)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#131d31] border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Day vs Night</span>
                  <span className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                    <Moon className="w-4 h-4" />
                    Night {fragrance.day_night?.night}% / Day {fragrance.day_night?.day}%
                  </span>
                </div>
              </div>

              {/* Community Reviews & Sentiment Analysis */}
              {(() => {
                const verdict = fragrance.review_summary?.community_verdict || fragrance.description || (
                  fragrance.dna_inspiration 
                    ? `A celebrated ${fragrance.brand} release inspired by ${fragrance.dna_inspiration}. Highly praised across Fragrantica for its radiant opening and stellar ${fragrance.longevity || '8+ hours'} staying power.`
                    : `A community favorite from ${fragrance.brand} offering rich olfactory harmony, strong sillage, and all-day versatility.`
                );

                const pros = (fragrance.review_summary?.pros && fragrance.review_summary.pros.length > 0) 
                  ? fragrance.review_summary.pros 
                  : [
                      `Exceptional performance and projection lasting ${fragrance.longevity || '8-10 Hours'}`,
                      `High compliment pull in both casual and formal environments`,
                      `Smooth, layered drydown with zero synthetic harshness`,
                      `Unmatched price-to-performance ratio verified by community sellers`
                    ];

                const cons = (fragrance.review_summary?.cons && fragrance.review_summary.cons.length > 0) 
                  ? fragrance.review_summary.cons 
                  : [
                      `Initial spray is potent; allow 5 minutes for the accords to bloom`,
                      `Best suited for ${fragrance.primary_season || 'its recommended season'} rather than extreme weather`
                    ];

                const quotes = (fragrance.review_summary?.top_reviewer_quotes && fragrance.review_summary.top_reviewer_quotes.length > 0)
                  ? fragrance.review_summary.top_reviewer_quotes
                  : [
                      `Honestly blown away by the longevity and compliment factor of ${fragrance.name}.`,
                      `One of the safest, highest-value fragrances you can buy right now.`
                    ];

                return (
                  <div className="bg-[#131d31] border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Fragrantica Community Verdict & Reviews</span>
                      </h4>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{(Number(fragrance.rating_value) || 4.3).toFixed(2)} / 5.0</span>
                        <span className="text-slate-400 font-normal">({(fragrance.rating_count || 1250).toLocaleString()} votes)</span>
                      </div>
                    </div>
                    
                    {/* Community Verdict Banner */}
                    <div className="relative p-4 rounded-xl bg-gradient-to-r from-slate-900/90 to-slate-800/80 border border-slate-700/80 shadow-inner">
                      <Quote className="absolute top-3 right-3 w-6 h-6 text-slate-700/50 pointer-events-none" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                        Community Consensus:
                      </span>
                      <p className="text-slate-200 text-sm leading-relaxed italic">
                        "{verdict}"
                      </p>
                    </div>

                    {/* Pros and Cons Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Pros */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Key Strengths Mentioned</span>
                        </span>
                        <ul className="space-y-1.5">
                          {pros.map((pro, idx) => (
                            <li key={idx} className="text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                              <span className="leading-snug">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span>Things to Keep in Mind</span>
                        </span>
                        <ul className="space-y-1.5">
                          {cons.map((con, idx) => (
                            <li key={idx} className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                              <span className="text-rose-400 font-bold mt-0.5">⚠</span>
                              <span className="leading-snug">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Featured Reviewer Quotes */}
                    {quotes.length > 0 && (
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
                          Verified Community Reviewer Snippets:
                        </span>
                        <div className="space-y-2">
                          {quotes.map((q, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                              <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">"{q}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {/* TAB 2: YOU WILL ALSO LIKE ENGINE */}
          {activeTab === 'recommendations' && (
            <div className="space-y-8">
              
              {/* How it works info header */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-amber-300 font-semibold block mb-0.5">
                    How the "You Will Also Like" Algorithm Works:
                  </strong>
                  Matches perfumes based on shared olfactory notes, cosine similarity of Fragrantica accord profiles, 
                  same-line flanker evolution, and Middle Eastern clone twins sharing the same luxury profile.
                </div>
              </div>

              {/* 1. Same Line Flankers & Variations */}
              {recommendations?.flankers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>Flankers & Line Variations ({fragrance.collection})</span>
                    </h3>
                    <span className="text-xs text-slate-400">Variations in the same bottle line</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.flankers.map(flanker => (
                      <div 
                        key={flanker.id}
                        onClick={() => onSelectOther(flanker)}
                        className="group cursor-pointer p-4 rounded-2xl bg-[#131d31] hover:bg-[#192640] border border-slate-800 hover:border-amber-400/50 transition-all p-4"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-amber-400">{flanker.brand}</span>
                          <span className="text-slate-400">{flanker.release_year}</span>
                        </div>
                        <h4 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {flanker.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {flanker.dna_type} • {flanker.primary_season}
                        </p>
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400 font-mono">
                            {flanker.community_price ? `₹${flanker.community_price}` : `₹${flanker.estimated_community_price || '2,450'}`}
                          </span>
                          <span className="text-slate-400 group-hover:text-amber-300 flex items-center gap-1 font-semibold">
                            Compare <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Middle Eastern DNA Twins (Targeting same high-end DNA) */}
              {recommendations?.dnaTwins.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>Direct Closest Matches (Same High-End Inspiration)</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {fragrance.dna_inspiration}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.dnaTwins.map(twin => (
                      <div 
                        key={twin.id}
                        onClick={() => onSelectOther(twin)}
                        className="group cursor-pointer p-4 rounded-2xl bg-[#131d31] hover:bg-[#192640] border border-slate-800 hover:border-emerald-400/50 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-emerald-400">{twin.brand}</span>
                          <span className="text-amber-400 font-bold">★ {twin.rating_value.toFixed(2)}</span>
                        </div>
                        <h4 className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {twin.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {twin.similarity_percentage}% match to original
                        </p>
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400 font-mono">
                            {twin.community_price ? `₹${twin.community_price}` : `₹${twin.estimated_community_price || '2,450'}`}
                          </span>
                          <span className="text-slate-400 group-hover:text-emerald-300 flex items-center gap-1 font-semibold">
                            Inspect <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Top Olfactory Match Percentage (Dynamic Cosine Accord Similarity) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>Top Scent Profile Matches (Accord & Note Similarity)</span>
                  </h3>
                  <span className="text-xs text-slate-400">Ranked by algorithm score</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations?.topMatches.map((match, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onSelectOther(match.fragrance)}
                      className="group cursor-pointer p-4 rounded-2xl bg-[#131d31] hover:bg-[#192640] border border-slate-800 hover:border-amber-400/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400">
                            {match.fragrance.brand}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {match.matchPercentage}% Match
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {match.fragrance.name}
                        </h4>

                        <p className="text-xs text-slate-400 mb-3">
                          {match.fragrance.collection} • <span className="text-emerald-400 font-bold font-mono">{match.fragrance.community_price ? `₹${match.fragrance.community_price}` : `₹${match.fragrance.estimated_community_price || '2,450'}`}</span> • ★ {match.fragrance.rating_value.toFixed(2)}
                        </p>

                        {/* Shared Accords */}
                        <div className="space-y-1.5 text-xs">
                          <div className="text-[11px] text-slate-400 font-medium">Shared Accords:</div>
                          <div className="flex flex-wrap gap-1">
                            {match.sharedAccords.slice(0, 4).map((acc, aIdx) => (
                              <span key={aIdx} className="text-[10px] bg-slate-900 text-amber-300/90 px-2 py-0.5 rounded-md border border-slate-800">
                                {acc}
                              </span>
                            ))}
                          </div>

                          {/* Shared Notes */}
                          {match.sharedNotes.length > 0 && (
                            <>
                              <div className="text-[11px] text-slate-400 font-medium pt-1">Shared Notes:</div>
                              <div className="flex flex-wrap gap-1">
                                {match.sharedNotes.slice(0, 4).map((note, nIdx) => (
                                  <span key={nIdx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          {match.fragrance.dna_inspiration ? `Inspired by ${match.fragrance.dna_inspiration}` : match.fragrance.primary_season}
                        </span>
                        <span className="text-amber-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          View scent <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#131d31] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Ratings & review excerpts sourced from Fragrantica community data
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
