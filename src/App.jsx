import React, { useState, useMemo } from 'react';
import fragrancesData from './data/fragrances.json';
import syncMeta from './data/sync_meta.json';
import FragranceDetailModal from './components/FragranceDetailModal';
import MyWardrobeMatcher from './components/MyWardrobeMatcher';
import FragScannerAIAgent from './components/FragScannerAIAgent';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeFragrance, setActiveFragrance] = useState(null);
  const [quickTab, setQuickTab] = useState(null);

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
      <header className="sticky top-0 z-40 bg-[#0b1120]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white font-serif-luxury tracking-wide">
                  FragScanner
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Live Community Price & Match Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Olfactory Matcher • Real-time Community Seller Quotes
              </p>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Database: </span>
              <strong className="text-amber-400 font-mono">{fragrancesData.length} Fragrances</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Community Reviews: </span>
              <strong className="text-emerald-400 font-mono">{(totalReviews / 1000).toFixed(0)}k+</strong>
            </div>
          </div>

        </div>
      </header>

      {/* Community Sellers Live Status Bar */}
      <div className="bg-[#0e1628] border-b border-slate-800/80 px-4 sm:px-8 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Community Sellers Live:
            </span>
            <span className="text-slate-300">
              <strong>Second Theory</strong>, <strong>FragFever</strong> & <strong>Apex Aroma</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-emerald-300 font-mono font-semibold">
              {syncMeta?.total_in_stock || 399} In-Stock Perfumes
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-amber-400 font-mono font-semibold">
              {syncMeta?.multi_seller_comparisons || 189} Multi-Seller Comparisons Active
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Last Synced: {syncMeta?.last_synced || 'Today'}</span>
          </div>
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
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b14] py-6 px-4 pb-24 md:pb-6 text-center text-xs text-slate-400 space-y-1.5">
        <p>
          FragScanner • Real-time Middle Eastern & Niche Fragrance Matcher • Live Quotes from Second Theory, FragFever & Apex Aroma.
        </p>
        <p className="text-slate-400">
          Always check with sellers on WhatsApp to confirm batch codes and stock prior to ordering.
        </p>
      </footer>

    </div>
  );
}
