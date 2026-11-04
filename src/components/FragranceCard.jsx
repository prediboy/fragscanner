import React from 'react';
import { Star, Sparkles, Flame, Clock, Compass, Layers } from 'lucide-react';

export default function FragranceCard({ fragrance, onSelect, onOpenRecommendations }) {
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

  return (
    <div className="group relative bg-[#131d31] hover:bg-[#18243c] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getBrandBadgeColor(fragrance.brand)}`}>
            {fragrance.brand}
          </span>
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{fragrance.rating_value.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-normal">({(fragrance.rating_count / 1000).toFixed(1)}k)</span>
          </div>
        </div>

        {/* Name & Collection */}
        <div className="cursor-pointer" onClick={() => onSelect(fragrance)}>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {fragrance.name}
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            {fragrance.collection} • {fragrance.concentration} • {fragrance.release_year}
          </p>
        </div>

        {/* DNA / Inspiration Callout */}
        {fragrance.dna_inspiration && (
          <div className="my-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-0.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Closest Match</span>
            </div>
            <p className="text-slate-300 font-medium truncate">
              {fragrance.dna_inspiration}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{fragrance.dna_type}</span>
              <span className="text-amber-300 font-semibold">{fragrance.similarity_percentage}% match</span>
            </div>
          </div>
        )}

        {/* Fragrantica Accord Bars Preview */}
        <div className="space-y-1.5 my-3">
          <div className="text-[11px] font-medium text-slate-400 flex justify-between">
            <span>Main Accords</span>
            <span className="text-slate-400 font-mono text-[10px]">Fragrantica scale</span>
          </div>
          <div className="space-y-1">
            {fragrance.accords.slice(0, 4).map((accord, idx) => (
              <div key={idx} className="relative h-4 rounded bg-slate-900/80 overflow-hidden flex items-center px-2">
                <div 
                  className="absolute left-0 top-0 bottom-0 opacity-80 rounded"
                  style={{ 
                    width: `${accord.score}%`, 
                    backgroundColor: accord.color || '#d97706' 
                  }}
                />
                <span className="relative z-10 text-[10px] font-semibold text-white drop-shadow-sm">
                  {accord.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Notes Snippet */}
        <div className="flex flex-wrap gap-1 mt-3">
          {fragrance.notes.top.slice(0, 2).concat(fragrance.notes.middle.slice(0, 1)).map((note, idx) => (
            <span key={idx} className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50">
              {note}
            </span>
          ))}
          {fragrance.notes.base.length > 0 && (
            <span className="text-[10px] bg-slate-800/90 text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-700/50">
              +{fragrance.notes.top.length + fragrance.notes.middle.length + fragrance.notes.base.length - 3} notes
            </span>
          )}
        </div>
      </div>

      {/* Card Footer with Community Seller Price and Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {fragrance.in_seller_stock ? 'Community Quote' : 'Seller Status'}
            </span>
            {fragrance.is_hot_seller && (
              <span className="text-[10px] px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold" title="Hot Selling in Community List">
                🔥 Hot
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            {fragrance.in_seller_stock && fragrance.community_price ? (
              <>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {fragrance.community_sellers?.length > 1 ? 'From ' : ''}₹{fragrance.community_price}
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold">
                  {fragrance.community_sellers?.length > 1 
                    ? `(${fragrance.community_sellers.length} Sellers)` 
                    : `(${fragrance.lowest_seller || 'In Stock'})`}
                </span>
              </>
            ) : (
              <span className="text-xs font-semibold text-slate-400">
                Not in Sheet
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenRecommendations(fragrance)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all hover:scale-105"
            title="Open 'You Will Also Like' Tab"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Also Like</span>
          </button>

          <button
            onClick={() => onSelect(fragrance)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
