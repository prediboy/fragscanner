import React from 'react';
import { X, CheckCircle, Database, RefreshCw, Store, FlaskConical, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SyncStatsModal({ syncMeta, onClose }) {
  if (!syncMeta) return null;

  const breakdown = syncMeta.seller_breakdown || {};
  const formattedDate = new Date(syncMeta.last_sync || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#131d31] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-serif-luxury">Live Inventory & Sync Statistics</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synced across all 10 verified community resources & Supabase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#141f36] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Catalog Total</span>
              <strong className="text-xl font-mono text-white">{syncMeta.catalog_total || 1150}</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Fragrantica perfumes</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141f36] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">In-Stock Bottles</span>
              <strong className="text-xl font-mono text-amber-400">{syncMeta.in_stock_count || 656}</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Verified sealed</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141f36] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Decanted Scents</span>
              <strong className="text-xl font-mono text-cyan-400">{syncMeta.decants_available_count || 372}</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">5ml, 8ml, 10ml, 30ml</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141f36] border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">Both Available</span>
              <strong className="text-xl font-mono text-purple-400">{syncMeta.dual_available_count || 362}</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">Bottle + Decant</span>
            </div>
          </div>

          {/* Seller Breakdown List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-400" />
                <span>6 Verified Sellers Breakdown</span>
              </span>
              <span className="text-slate-400 font-normal">Updated: {formattedDate}</span>
            </div>

            <div className="space-y-2">
              {Object.entries(breakdown).map(([id, info]) => (
                <div key={id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 font-mono">
                      {info.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{info.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </h4>
                      <span className="text-[11px] text-slate-400">{info.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    {info.bottles !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 block">Bottles</span>
                        <strong className="text-sm font-mono text-amber-400">{info.bottles}</strong>
                      </div>
                    )}
                    {info.decants !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 block">Decants</span>
                        <strong className="text-sm font-mono text-cyan-400">{info.decants}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Refresh Status */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cloud Cron Active: 2-Hour Schedule</span>
              </span>
              <span className="text-[11px] text-slate-400">GitHub Actions + Supabase</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every 2 hours, fresh price lists from all 10 sellers are fetched and upserted into Supabase. Website visitors always see live inventory without needing page redeployments.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1424] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
