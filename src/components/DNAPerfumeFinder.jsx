import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';

export default function DNAPerfumeFinder({ allFragrances, onSelectFragrance }) {
  const famousDNAs = [
    {
      name: "Kilian Angels' Share",
      category: "Warm Cinnamon & Boozy Gourmand",
      originalPrice: 295,
      icon: "🥃"
    },
    {
      name: "Creed Aventus",
      category: "Fruity Smokey Birch & Pineapple",
      originalPrice: 495,
      icon: "👑"
    },
    {
      name: "Dior Sauvage Elixir",
      category: "Dark Peppery Spices & Licorice",
      originalPrice: 250,
      icon: "⚡"
    },
    {
      name: "Jean Paul Gaultier Ultra Male",
      category: "Sweet Pear Bubblegum & Vanilla",
      originalPrice: 130,
      icon: "🎉"
    },
    {
      name: "Bvlgari Tygar",
      category: "Sparkling Tart Grapefruit & Radiant Amber",
      originalPrice: 390,
      icon: "💎"
    },
    {
      name: "Maison Francis Kurkdjian Baccarat Rouge 540",
      category: "Burnt Sugar Ambergris & Saffron",
      originalPrice: 325,
      icon: "✨"
    },
    {
      name: "BDK Gris Charnel",
      category: "Creamy Fig, Cardamom & Black Tea",
      originalPrice: 220,
      icon: "☕"
    },
    {
      name: "Creed Silver Mountain Water",
      category: "Icy Mountain Air, Inky Tea & Blackcurrant",
      originalPrice: 470,
      icon: "🏔️"
    }
  ];

  const [selectedDNA, setSelectedDNA] = useState(famousDNAs[0].name);

  // Find clones matching the selected DNA
  const matchingClones = allFragrances.filter(f => {
    if (!f.dna_inspiration) return false;
    const insp = f.dna_inspiration.toLowerCase();
    const query = selectedDNA.toLowerCase();
    
    // Short key matches
    if (query.includes("angels' share") && (insp.includes("angels' share") || f.id.includes("khamrah"))) return true;
    if (query.includes("aventus") && (insp.includes("aventus") || f.id.includes("club-de-nuit-intense") || f.id.includes("imperia") || f.id.includes("supremacy-not-only-intense"))) return true;
    if (query.includes("sauvage elixir") && (insp.includes("sauvage elixir") || f.id.includes("asad") || f.id.includes("corvus"))) return true;
    if (query.includes("ultra male") && (insp.includes("ultra male") || f.id.includes("9pm") || f.id.includes("ramz-silver") || f.id.includes("elixir"))) return true;
    if (query.includes("tygar") && (insp.includes("tygar") || f.id.includes("turathi-blue"))) return true;
    if (query.includes("baccarat rouge 540") && (insp.includes("baccarat") || f.id.includes("untold") || f.id.includes("dark-secret"))) return true;
    if (query.includes("gris charnel") && (insp.includes("gris charnel") || f.id.includes("liam-grey"))) return true;
    if (query.includes("silver mountain water") && (insp.includes("silver mountain water") || f.id.includes("sillage"))) return true;
    
    return insp.includes(query) || query.includes(insp);
  });

  const activeDNAMeta = famousDNAs.find(d => d.name === selectedDNA);

  return (
    <div className="bg-[#10192d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 my-10 shadow-2xl relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Smart Clone Matcher & Savings Finder</span>
          </div>
          <h3 className="text-2xl font-black text-white font-serif-luxury">
            "You Love the Luxury Original? Here Are Your Top Clones"
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Select a high-end designer scent to find the highest-rated Middle Eastern alternatives across Lattafa, Afnan, Armaf, Mykonos & Rayhaan.
          </p>
        </div>
      </div>

      {/* DNA Selector Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {famousDNAs.map((dna, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDNA(dna.name)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              selectedDNA === dna.name
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <span>{dna.icon}</span>
            <span>{dna.name}</span>
          </button>
        ))}
      </div>

      {/* Comparison Header */}
      {activeDNAMeta && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Target Scent Family</span>
            <span className="font-bold text-slate-200">{activeDNAMeta.category}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Designer Retail</span>
              <span className="font-extrabold text-rose-400 line-through">${activeDNAMeta.originalPrice}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Clone Alternatives</span>
              <span className="font-extrabold text-emerald-400">$20 - $48 (Save 85%+)</span>
            </div>
          </div>
        </div>
      )}

      {/* Clones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchingClones.map(clone => (
          <div
            key={clone.id}
            onClick={() => onSelectFragrance(clone)}
            className="group cursor-pointer p-5 rounded-2xl bg-[#142038] hover:bg-[#1a2b4b] border border-slate-800 hover:border-amber-400/50 transition-all shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {clone.brand}
                </span>
                <span className="font-extrabold text-amber-300">
                  ★ {clone.rating_value.toFixed(2)} ({clone.rating_count.toLocaleString()})
                </span>
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {clone.name}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {clone.collection} • {clone.concentration}
              </p>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-center justify-between">
                <span className="text-slate-400">Similarity Match</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {clone.similarity_percentage}% Match
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Price</span>
                <span className="font-extrabold text-white text-base">${clone.price_usd}</span>
              </div>
              <span className="text-amber-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Inspect details <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
