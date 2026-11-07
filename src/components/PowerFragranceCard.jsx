import React, { useMemo, useState } from 'react';
import { Star, ChevronDown, ChevronUp, Sparkles, TrendingDown, Store } from 'lucide-react';
import { logWhatsAppClick } from '../lib/supabaseTelemetry';

function getWhatsAppUrl(phone, message) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  if (!cleaned) return null;
  const num = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export default function PowerFragranceCard({ 
  fragrance: f, 
  onSelect, 
  isExpanded, 
  onToggleExpand, 
  selectedSeller = 'all',
  selectedFormats = ['retail']
}) {
  if (!f) return null;

  const isSpecificSeller = selectedSeller && selectedSeller !== 'all';

  // 1. Extract quotes for the card
  const { allQuotes, currentSellerQuotes, lowestRetail, lowestTester, lowestPartial, lowestDecant } = useMemo(() => {
    const listAll = [];
    const listCurrent = [];

    // Process bottle quotes
    if (Array.isArray(f.community_sellers)) {
      for (const s of f.community_sellers) {
        const p = Number(s.price);
        if (p && !isNaN(p) && p > 0) {
          const isPartialQuote = !!(s.is_partial || (s.size && /partial/i.test(s.size)));
          const isTesterQuote = !isPartialQuote && !!(s.is_tester || (s.size && /tester/i.test(s.size)));
          const quoteType = isPartialQuote ? 'partial' : (isTesterQuote ? 'tester' : 'retail');
          const quoteObj = {
            seller_id: s.seller_id,
            seller_name: s.seller_name,
            label: s.size || (f.bottle_size ? `${f.bottle_size} Retail Bottle` : 'Retail Bottle'),
            price: p,
            whatsapp: s.whatsapp,
            shipping: s.shipping || 'Pan-India Delivery',
            dispatch: s.dispatch || '24-48 hrs',
            isBottle: true,
            type: quoteType,
            isTester: isTesterQuote,
            isPartial: isPartialQuote
          };
          listAll.push(quoteObj);
          if (isSpecificSeller && s.seller_id === selectedSeller) {
            listCurrent.push(quoteObj);
          }
        }
      }
    }

    // Process decant quotes
    if (Array.isArray(f.community_decants)) {
      for (const d of f.community_decants) {
        if (d.sizes && typeof d.sizes === 'object') {
          for (const [sz, val] of Object.entries(d.sizes)) {
            const p = Number(val);
            if (p && !isNaN(p) && p > 0) {
              const quoteObj = {
                seller_id: d.seller_id,
                seller_name: d.seller_name,
                label: `${sz} Decant`,
                price: p,
                whatsapp: d.whatsapp,
                shipping: d.shipping || 'Pan-India Delivery',
                dispatch: d.dispatch || '24-48 hrs',
                isBottle: false,
                type: 'decant'
              };
              listAll.push(quoteObj);
              if (isSpecificSeller && d.seller_id === selectedSeller) {
                listCurrent.push(quoteObj);
              }
            }
          }
        } else {
          const p = Number(d.lowest_price || d.price_10ml || d.price_5ml || d.price);
          if (p && !isNaN(p) && p > 0) {
            const quoteObj = {
              seller_id: d.seller_id,
              seller_name: d.seller_name,
              label: d.price_10ml ? '10ml Decant' : (d.price_5ml ? '5ml Decant' : 'Decant'),
              price: p,
              whatsapp: d.whatsapp,
              shipping: d.shipping || 'Pan-India Delivery',
              dispatch: d.dispatch || '24-48 hrs',
              isBottle: false,
              type: 'decant'
            };
            listAll.push(quoteObj);
            if (isSpecificSeller && d.seller_id === selectedSeller) {
              listCurrent.push(quoteObj);
            }
          }
        }
      }
    }

    // Sort by price ascending
    listAll.sort((a, b) => a.price - b.price);
    listCurrent.sort((a, b) => a.price - b.price);

    const activeQuotes = isSpecificSeller ? listCurrent : listAll;
    const bRetail = activeQuotes.find(q => q.type === 'retail');
    const bTester = activeQuotes.find(q => q.type === 'tester');
    const bPartial = activeQuotes.find(q => q.type === 'partial');
    const bDecant = activeQuotes.find(q => q.type === 'decant');

    return {
      allQuotes: listAll,
      currentSellerQuotes: listCurrent,
      lowestRetail: bRetail,
      lowestTester: bTester,
      lowestPartial: bPartial,
      lowestDecant: bDecant
    };
  }, [f, selectedSeller, isSpecificSeller]);

  // Determine active quotes based on seller filter
  const relevantQuotes = isSpecificSeller ? currentSellerQuotes : allQuotes;
  if (relevantQuotes.length === 0) return null; // Guard: do not render if selected seller has 0 quotes for this perfume

  // Active formats selected by user in filter rail (defaults to ['retail'])
  const activeFormats = Array.isArray(selectedFormats) && selectedFormats.length > 0
    ? selectedFormats
    : ['retail'];

  // Filter quotes strictly matching active formats for both display and Compare Rates
  const formatQuotes = useMemo(() => {
    const base = isSpecificSeller ? currentSellerQuotes : allQuotes;
    const filtered = base.filter(q => activeFormats.includes(q.type));
    return filtered.length > 0 ? filtered : base;
  }, [allQuotes, currentSellerQuotes, activeFormats, isSpecificSeller]);

  // Quote overrides selected by user from the Compare Rates accordion
  const [quoteOverrides, setQuoteOverrides] = useState({});

  const activeRetail = quoteOverrides['retail'] || lowestRetail;
  const activeTester = quoteOverrides['tester'] || lowestTester;
  const activePartial = quoteOverrides['partial'] || lowestPartial;
  const activeDecant = quoteOverrides['decant'] || lowestDecant;

  // What format pods should render on the card?
  let showRetail = activeFormats.includes('retail') && !!lowestRetail;
  let showTester = activeFormats.includes('tester') && !!lowestTester;
  let showPartial = activeFormats.includes('partial') && !!lowestPartial;
  let showDecant = activeFormats.includes('decant') && !!lowestDecant;

  // Fallback: If none of the selected formats have an offer in this perfume, show lowest available offer
  if (!showRetail && !showTester && !showPartial && !showDecant) {
    if (lowestRetail) showRetail = true;
    else if (lowestTester) showTester = true;
    else if (lowestPartial) showPartial = true;
    else if (lowestDecant) showDecant = true;
  }

  const bottleDisplaySize = activeRetail 
    ? activeRetail.label.replace(' Retail Bottle', ' Bottle') 
    : (f.community_bottle_size ? f.community_bottle_size.replace(' Retail Bottle', ' Bottle') : 'Bottle');

  const displayName = f.brand && !f.name.toLowerCase().includes(f.brand.toLowerCase())
    ? `${f.brand} ${f.name}`
    : f.name;

  return (
    <div 
      className={`bg-white dark:bg-slate-900/95 rounded-2xl border ${f.is_price_drop && !isSpecificSeller ? 'border-emerald-400 dark:border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-sm' : 'border-slate-200 dark:border-slate-800'} hover:border-cyan-500 dark:hover:border-cyan-400 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4 flex flex-col justify-between space-y-3 relative w-full`}
    >
      <div>
        {/* Clickable Header Area: Badges & Rating */}
        <div 
          onClick={() => onSelect && onSelect(f)} 
          className="cursor-pointer space-y-2 group"
          title="Click to view full notes, longevity & reviews"
        >
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-800 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/80">
                {f.brand}
              </span>
              {lowestPartial && (
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80 flex items-center gap-1" title="Authentic opened partial bottle">
                  <span>🏷️</span>
                  <span>Partial</span>
                </span>
              )}
              {lowestTester && (
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-700/80 flex items-center gap-1" title="Authentic tester packaging">
                  <span>🧪</span>
                  <span>Tester</span>
                </span>
              )}
              {f.is_price_drop && !isSpecificSeller && (
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/80 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Price Drop</span>
                </span>
              )}
              {f.is_new_arrival && (
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80 flex items-center gap-1">
                  <span>✨</span>
                  <span>New</span>
                </span>
              )}
              {f._semanticReason && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-900 border border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700/80 flex items-center gap-1" title="Semantic match explanation">
                  <Sparkles className="w-3 h-3 text-cyan-500 shrink-0" />
                  <span className="truncate max-w-[150px]">{f._semanticReason}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
              <span>{(Number(f.rating_value) || 4.2).toFixed(1)}</span>
            </div>
          </div>

          {/* Name & Cloned DNA */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
              {f.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {f.dna_inspiration ? (
                <span>
                  Clones: <strong className="font-semibold text-slate-700 dark:text-slate-200">{f.dna_inspiration}</strong>
                </span>
              ) : (
                f.dna_type || 'Community Verified Stock'
              )}
            </p>
          </div>
        </div>

        {/* Filter-Driven Dynamic Pods (Driven directly by Format checkboxes) */}
        <div className="mt-3 space-y-2">
          
          {/* POD 1: Full Retail Bottle (Rendered when Retail is ticked or active) */}
          {showRetail && activeRetail && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-xs">🍾</span>
                  <span className="font-medium truncate">{bottleDisplaySize}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  via <strong className="font-semibold text-slate-800 dark:text-slate-200" title={activeRetail.seller_name}>{activeRetail.seller_name}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  {!isSpecificSeller && f.is_price_drop && f.previous_price && (
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 line-through font-mono">
                      <span>₹{Number(f.previous_price).toLocaleString()}</span>
                    </div>
                  )}
                  <div className={`font-mono text-sm font-extrabold ${!isSpecificSeller && f.is_price_drop ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    ₹{activeRetail.price.toLocaleString()}
                  </div>
                </div>

                {getWhatsAppUrl(
                  activeRetail.whatsapp || f.community_whatsapp,
                  `Hi ${activeRetail.seller_name || 'there'}, saw your price for ${displayName} (${bottleDisplaySize}) quoted at ₹${activeRetail.price.toLocaleString()} on FragScanner. Is this in stock?`
                ) && (
                  <a
                    href={getWhatsAppUrl(
                      activeRetail.whatsapp || f.community_whatsapp,
                      `Hi ${activeRetail.seller_name || 'there'}, saw your price for ${displayName} (${bottleDisplaySize}) quoted at ₹${activeRetail.price.toLocaleString()} on FragScanner. Is this in stock?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logWhatsAppClick({
                      sellerName: activeRetail.seller_name,
                      fragranceName: f.name,
                      brand: f.brand,
                      price: activeRetail.price,
                      format: 'retail'
                    })}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                    title={`Contact ${activeRetail.seller_name} on WhatsApp`}
                  >
                    <span>WA</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* POD 2: Tester Unit Box (Rendered when Tester is ticked) */}
          {showTester && activeTester && (
            <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between gap-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-900 dark:text-purple-300">
                  <span className="text-xs">🧪</span>
                  <span className="font-medium truncate">{activeTester.label || 'Tester Unit Box'}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  via <strong className="font-semibold text-slate-800 dark:text-slate-200" title={activeTester.seller_name}>{activeTester.seller_name}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-mono text-sm font-extrabold text-purple-700 dark:text-purple-300">
                    ₹{activeTester.price.toLocaleString()}
                  </div>
                </div>

                {getWhatsAppUrl(
                  activeTester.whatsapp || f.community_whatsapp,
                  `Hi ${activeTester.seller_name || 'there'}, saw your tester quote for ${displayName} quoted at ₹${activeTester.price.toLocaleString()} on FragScanner. Is this available?`
                ) && (
                  <a
                    href={getWhatsAppUrl(
                      activeTester.whatsapp || f.community_whatsapp,
                      `Hi ${activeTester.seller_name || 'there'}, saw your tester quote for ${displayName} quoted at ₹${activeTester.price.toLocaleString()} on FragScanner. Is this available?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logWhatsAppClick({
                      sellerName: activeTester.seller_name,
                      fragranceName: f.name,
                      brand: f.brand,
                      price: activeTester.price,
                      format: 'tester'
                    })}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                    title={`Contact ${activeTester.seller_name} on WhatsApp`}
                  >
                    <span>WA</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* POD 3: Partial Bottle (Rendered when Partial is ticked) */}
          {showPartial && activePartial && (
            <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between gap-2 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                  <span className="text-xs">🏷️</span>
                  <span className="font-medium truncate">{activePartial.label || 'Partial Bottle'}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  via <strong className="font-semibold text-slate-800 dark:text-slate-200" title={activePartial.seller_name}>{activePartial.seller_name}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-mono text-sm font-extrabold text-amber-700 dark:text-amber-300">
                    ₹{activePartial.price.toLocaleString()}
                  </div>
                </div>

                {getWhatsAppUrl(
                  activePartial.whatsapp || f.community_whatsapp,
                  `Hi ${activePartial.seller_name || 'there'}, saw your partial bottle for ${displayName} quoted at ₹${activePartial.price.toLocaleString()} on FragScanner. Can you share level pictures?`
                ) && (
                  <a
                    href={getWhatsAppUrl(
                      activePartial.whatsapp || f.community_whatsapp,
                      `Hi ${activePartial.seller_name || 'there'}, saw your partial bottle for ${displayName} quoted at ₹${activePartial.price.toLocaleString()} on FragScanner. Can you share level pictures?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logWhatsAppClick({
                      sellerName: activePartial.seller_name,
                      fragranceName: f.name,
                      brand: f.brand,
                      price: activePartial.price,
                      format: 'partial'
                    })}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                    title={`Contact ${activePartial.seller_name} on WhatsApp`}
                  >
                    <span>WA</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* POD 4: Decants Ready (Rendered when Decants is ticked) */}
          {showDecant && activeDecant && (
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-xs">💧</span>
                  <span className="font-medium truncate">{activeDecant.label}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  via <strong className="font-semibold text-slate-800 dark:text-slate-200" title={activeDecant.seller_name}>{activeDecant.seller_name}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-[9px] font-mono text-slate-400">from</div>
                  <div className="font-mono text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                    ₹{activeDecant.price.toLocaleString()}
                  </div>
                </div>

                {getWhatsAppUrl(
                  activeDecant.whatsapp || f.community_whatsapp,
                  `Hi ${activeDecant.seller_name || 'there'}, saw your decant rates for ${displayName} starting at ₹${activeDecant.price.toLocaleString()} (${activeDecant.label}) on FragScanner. What sizes are available?`
                ) && (
                  <a
                    href={getWhatsAppUrl(
                      activeDecant.whatsapp || f.community_whatsapp,
                      `Hi ${activeDecant.seller_name || 'there'}, saw your decant rates for ${displayName} starting at ₹${activeDecant.price.toLocaleString()} (${activeDecant.label}) on FragScanner. What sizes are available?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logWhatsAppClick({
                      sellerName: activeDecant.seller_name,
                      fragranceName: f.name,
                      brand: f.brand,
                      price: activeDecant.price,
                      format: 'decant'
                    })}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                    title={`Contact ${activeDecant.seller_name} for decants on WhatsApp`}
                  >
                    <span>WA</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Toolbar: Compare Rates & Notes/Reviews */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={() => onToggleExpand && onToggleExpand(f.id)}
          className="px-2.5 py-1.5 sm:py-1 min-h-[32px] rounded-lg border border-slate-200 dark:border-slate-700/90 hover:border-cyan-500 dark:hover:border-cyan-400 text-[10px] font-mono font-medium transition-colors bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
          title="Compare rates from all community sellers"
        >
          <span>Compare Rates ({formatQuotes.length})</span>
          {isExpanded ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={() => onSelect && onSelect(f)}
          className="px-2.5 py-1.5 sm:py-1 min-h-[32px] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-[10px] font-medium text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer active:scale-98"
          title="View olfactory notes, longevity, and reviews"
        >
          <span>Notes & Details</span>
          <span className="text-[9px]">→</span>
        </button>
      </div>

      {/* Expanded Multi-Seller Quotes Accordion */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
            <span>Direct Quotes ({formatQuotes.length}) — Click to Select:</span>
            <span className="text-cyan-400">Ranked by Price ↑</span>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
            {formatQuotes.length === 0 ? (
              <div className="text-xs text-slate-400 py-2 text-center">
                No active quotes found for this selection.
              </div>
            ) : (
              formatQuotes.map((q, qIdx) => {
                const isSelectedSellerQuote = isSpecificSeller && q.seller_id === selectedSeller;
                const activeQuoteForType = q.type === 'retail' ? activeRetail
                  : q.type === 'tester' ? activeTester
                  : q.type === 'partial' ? activePartial
                  : activeDecant;
                const isSelected = activeQuoteForType?.seller_id === q.seller_id && activeQuoteForType?.price === q.price;

                return (
                  <div 
                    key={qIdx}
                    onClick={() => setQuoteOverrides(prev => ({ ...prev, [q.type]: q }))}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-400 dark:border-cyan-500 ring-2 ring-cyan-500/30 shadow-xs'
                        : isSelectedSellerQuote
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-400 dark:border-cyan-600 ring-1 ring-cyan-500/20'
                          : qIdx === 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400/50'
                    } flex items-center justify-between text-xs`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span className={`w-4 h-4 rounded-full ${
                        isSelected
                          ? 'bg-cyan-600 text-white font-black'
                          : isSelectedSellerQuote
                            ? 'bg-cyan-600 text-white font-black'
                            : qIdx === 0 
                              ? 'bg-emerald-600 text-white font-black' 
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      } text-[9px] font-mono flex items-center justify-center shrink-0`}>
                        {isSelected ? '✓' : qIdx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-[11px] text-slate-900 dark:text-white flex items-center gap-1 truncate">
                          <span className="truncate">{q.seller_name}</span>
                          {qIdx === 0 && (
                            <span className="text-[8px] font-mono text-emerald-700 dark:text-emerald-300 font-black bg-emerald-100 dark:bg-emerald-950 px-1 rounded shrink-0">
                              Lowest
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[8px] font-mono text-cyan-700 dark:text-cyan-300 font-black bg-cyan-100 dark:bg-cyan-950 px-1 rounded shrink-0">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {q.label} • {q.dispatch}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`font-mono text-xs font-bold ${
                        isSelected || isSelectedSellerQuote
                          ? 'text-cyan-600 dark:text-cyan-400 font-black'
                          : qIdx === 0 
                            ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                            : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        ₹{q.price.toLocaleString()}
                      </span>
                      {q.whatsapp ? (
                        <a
                          href={`https://wa.me/${String(q.whatsapp).replace(/\D/g, '').startsWith('91') ? String(q.whatsapp).replace(/\D/g, '') : `91${String(q.whatsapp).replace(/\D/g, '')}`}?text=${encodeURIComponent(
                            `Hi ${q.seller_name}, saw your quote for ${displayName} (${q.label}) at ₹${q.price.toLocaleString()} on FragScanner. Is this available?`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            logWhatsAppClick({
                              sellerName: q.seller_name,
                              fragranceName: f.name,
                              brand: f.brand,
                              price: q.price,
                              format: q.isBottle ? 'bottle' : 'decant'
                            });
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold"
                        >
                          Order ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
