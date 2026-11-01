import React, { useState, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import fragrancesData from './data/fragrances.json';
import syncMeta from './data/sync_meta.json';
import FragranceDetailModal from './components/FragranceDetailModal';
import MyWardrobeMatcher from './components/MyWardrobeMatcher';
import PriceDiscoveryView from './components/PriceDiscoveryView';
import FragScannerAIAgent from './components/FragScannerAIAgent';
import DirectFragranceSearchBar from './components/DirectFragranceSearchBar';
import { Sparkles, Store, RefreshCw, Tag, Compass } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('discovery'); // 'discovery' | 'matcher'

  const totalReviews = useMemo(() => {
    return fragrancesData.reduce((acc, curr) => acc + (curr.rating_count || 0), 0);
  }, []);

  const openFragranceModal = (fragrance, tab = 'overview') => {
    setActiveFragrance(fragrance);
    setQuickTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      
      {/* Top Navigation & Direct Search Header */}
      <header className="sticky top-0 z-40 bg-[#0b1120]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-lg">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white font-serif-luxury tracking-wide">
                  FragScanner
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live Deals
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Community Bottles & Decants
              </p>
            </div>
          </div>

          {/* Direct Search Bar */}
          <div className="flex-1 flex justify-center max-w-lg mx-auto w-full">
            <DirectFragranceSearchBar 
              allFragrances={fragrancesData} 
              onSelectFragrance={(f) => openFragranceModal(f, 'overview')} 
            />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shrink-0 self-center md:self-auto">
            <button
              onClick={() => setViewMode('discovery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'discovery'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Price Discovery</span>
            </button>

            <button
              onClick={() => setViewMode('matcher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matcher'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Scent Matcher</span>
            </button>
          </div>

        </div>
      </header>

      {/* Compact Status & Live Metrics Strip */}
      <div className="bg-[#0e1628] border-b border-slate-800/80 px-4 sm:px-8 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-400 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              6 Sellers Live
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono font-medium">
              <strong className="text-amber-400">{syncMeta?.in_stock_count || 647}</strong> Bottles
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono font-medium">
              <strong className="text-cyan-400">{syncMeta?.decants_available_count || 369}</strong> Decanted Scents
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono font-medium">
              <strong className="text-purple-400">{syncMeta?.dual_available_count || 359}</strong> Both Options
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
              <RefreshCw className="w-2.5 h-2.5 text-emerald-400" />
              <span>Auto-refreshes every 2 hrs</span>
            </span>
          </div>
        </div>
      </div>

      {/* Global Seller Filter Bar */}
      <div className="bg-[#0b1222] border-b border-slate-800/60 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Seller:</span>
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
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace: Price Discovery (Default) OR Scent Twin Matcher */}
      <main className="max-w-7xl mx-auto px-3 sm:px-8 py-4 sm:py-6 flex-1 w-full pb-24 md:pb-8">
        {viewMode === 'discovery' ? (
          <PriceDiscoveryView 
            allFragrances={fragrancesData}
            selectedSeller={selectedSeller}
            onSelectSeller={setSelectedSeller}
            onSelectFragrance={(f) => openFragranceModal(f, 'overview')}
          />
        ) : (
          <MyWardrobeMatcher 
            allFragrances={fragrancesData}
            onSelectFragrance={(f) => openFragranceModal(f, 'recommendations')}
            selectedSeller={selectedSeller}
            onSelectSeller={setSelectedSeller}
          />
        )}
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

      {/* AI Sommelier Agent */}
      <FragScannerAIAgent 
        onSelectFragrance={(f) => openFragranceModal(f, 'overview')} 
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b14] py-4 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <p className="text-slate-400">
          FragScanner • Live prices synced from 6 verified community sellers. Confirm stock via WhatsApp.
        </p>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Synced: {new Date(syncMeta?.last_sync || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </span>
      </footer>

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
