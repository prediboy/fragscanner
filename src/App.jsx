import React, { useState, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import fragrancesData from './data/fragrances.json';
import syncMeta from './data/sync_meta.json';
import FragranceDetailModal from './components/FragranceDetailModal';
import MyWardrobeMatcher from './components/MyWardrobeMatcher';
import FragScannerAIAgent from './components/FragScannerAIAgent';
import DirectFragranceSearchBar from './components/DirectFragranceSearchBar';
import { Sparkles, Store, RefreshCw } from 'lucide-react';

const COMMUNITY_SELLERS = [
  { id: 'all', name: 'All Sellers', tag: 'All 6' },
  { id: 'second_theory', name: 'Second Theory', tag: '🍾 Bottles' },
  { id: 'fragfever', name: 'FragFever', tag: '🍾 Bottles' },
  { id: 'apex_aroma', name: 'Apex Aroma', tag: '🍾 Bottles' },
  { id: 'liquid_emotions', name: 'Liquid Emotions', tag: '🧪 Decants' },
  { id: 'bluewings', name: 'Blue Wings', tag: '🍾 & 🧪' },
  { id: 'whiffculture', name: 'Whiff Culture', tag: '🍾 & 🧪' }
];

export default function App() {
  const [activeFragrance, setActiveFragrance] = useState(null);
  const [quickTab, setQuickTab] = useState('overview');
  const [selectedSeller, setSelectedSeller] = useState('all');

  const totalReviews = useMemo(() => {
    return fragrancesData.reduce((acc, curr) => acc + curr.rating_count, 0);
  }, []);

  const openFragranceModal = (fragrance, tab = 'overview') => {
    setActiveFragrance(fragrance);
    setQuickTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      
      {/* Sticky Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#0b1120]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white font-serif-luxury tracking-wide">
                  FragScanner
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Live Match & Pricing
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Olfactory Profiling • Verified Community Sellers
              </p>
            </div>
          </div>

          {/* DIRECT FRAGRANCE SEARCH BAR (Direct Search + Full Details Modal) */}
          <div className="flex-1 flex justify-center max-w-xl mx-auto w-full">
            <DirectFragranceSearchBar 
              allFragrances={fragrancesData} 
              onSelectFragrance={(f) => openFragranceModal(f, 'overview')} 
            />
          </div>

          {/* Quick Stats Bar */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Catalog: </span>
              <strong className="text-amber-400 font-mono">{fragrancesData.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Reviews: </span>
              <strong className="text-emerald-400 font-mono">{(totalReviews / 1000).toFixed(0)}k+</strong>
            </div>
          </div>

        </div>
      </header>

      {/* Community Sellers Live Status Bar */}
      <div className="bg-[#0e1628] border-b border-slate-800/80 px-4 sm:px-8 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              6 Community Sellers Live:
            </span>
            <span className="text-slate-300 text-xs">
              <strong>Second Theory</strong>, <strong>FragFever</strong>, <strong>Apex Aroma</strong> <span className="text-slate-400 font-mono">(Bottles)</span> + <strong>Liquid Emotions</strong>, <strong>Blue Wings</strong> & <strong>Whiff Culture</strong> <span className="text-cyan-400 font-mono font-semibold">(Decants & Bottles)</span>
            </span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="text-emerald-300 font-mono font-semibold">
              {syncMeta?.in_stock_count || 647} Bottles In-Stock
            </span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="text-cyan-300 font-mono font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              🧪 {syncMeta?.decants_available_count || 369} Decanted Fragrances
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-400/90 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin-slow" />
              <span>All 6 Resources Synced</span>
            </span>
          </div>
        </div>
      </div>

      {/* GLOBAL SELLER FILTER BAR AT THE TOP */}
      <div className="bg-[#0b1222] border-b border-slate-800/60 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Filter by Seller:</span>
            </span>
            {COMMUNITY_SELLERS.map(s => {
              const isSelected = selectedSeller === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeller(s.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 font-black'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedSeller !== 'all' && (
            <button
              onClick={() => setSelectedSeller('all')}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden px-4 sm:px-8 py-8 bg-gradient-to-b from-[#0f172a] to-[#0b1120] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Olfactory Profiling & Live Seller Quotes</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif-luxury leading-tight">
              Select Your Wardrobe Favorites & Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">Your Next Scent Twin</span>.
            </h2>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Check the perfumes you <strong>love</strong> (and optionally check scents you <strong>dislike</strong>). Our engine analyzes notes and accords to generate your <strong>Top Matches Overall</strong> and finds the <strong>Best Deals In-Stock with verified community sellers</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Main Wardrobe Matcher Workspace */}
      <main className="max-w-7xl mx-auto px-3 sm:px-8 py-4 sm:py-8 flex-1 w-full space-y-8 pb-24 md:pb-8">
        <MyWardrobeMatcher 
          allFragrances={fragrancesData}
          onSelectFragrance={(f) => openFragranceModal(f, 'recommendations')}
          selectedSeller={selectedSeller}
          onSelectSeller={setSelectedSeller}
        />
      </main>

      {/* Fragrance Details & Multi-Seller Comparison Modal */}
      {activeFragrance && (
        <FragranceDetailModal
          fragrance={activeFragrance}
          allFragrances={fragrancesData}
          onClose={() => setActiveFragrance(null)}
          onSelectOther={(other) => setActiveFragrance(other)}
        />
      )}

      {/* FragScanner AI Sommelier Agent (Powered by Vercel AI SDK) */}
      <FragScannerAIAgent 
        onSelectFragrance={(f) => openFragranceModal(f, 'overview')} 
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b14] py-6 px-4 pb-24 md:pb-6 text-center text-xs text-slate-400 space-y-2">
        <p>
          FragScanner • Real-time Middle Eastern & Niche Fragrance Matcher • Dual Pricing across 6 Verified Community Sellers: Second Theory, FragFever, Apex Aroma, Liquid Emotions, Blue Wings Fragrances & Whiff Culture.
        </p>
        <p className="text-slate-400">
          Always check with sellers on WhatsApp to confirm batch codes and stock prior to ordering.
        </p>
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time Community Traffic & Analytics Active</span>
          </span>
        </div>
      </footer>

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
