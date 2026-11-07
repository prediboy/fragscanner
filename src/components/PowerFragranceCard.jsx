import React, { useMemo } from 'react';
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
  selectedSeller = 'all' 
}) {
  if (!f) return null;

  const isSpecificSeller = selectedSeller && selectedSeller !== 'all';

  // 1. Extract quotes for the card
  const { allQuotes, currentSellerQuotes, displayBottleQuote, displayDecantQuote } = useMemo(() => {
    const listAll = [];
    const listCurrent = [];

    // Process bottle quotes
    if (Array.isArray(f.community_sellers)) {
      for (const s of f.community_sellers) {
        const p = Number(s.price);
        if (p && !isNaN(p) && p > 0) {
          const isPartialQuote = !!(s.is_partial || (s.size && /partial/i.test(s.size)));
          const isTesterQuote = !isPartialQuote && !!(s.is_tester || (s.size && /tester/i.test(s.size)));
          const quoteObj = {
            seller_id: s.seller_id,
            seller_name: s.seller_name,
            label: s.size || (f.bottle_size ? `${f.bottle_size} Retail Bottle` : 'Retail Bottle'),
            price: p,
            whatsapp: s.whatsapp,
            shipping: s.shipping || 'Pan-India Delivery',
            dispatch: s.dispatch || '24-48 hrs',
            isBottle: true,
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
                isBottle: false
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
              isBottle: false
            };
            listAll.push(quoteObj);
            if (isSpecificSeller && d.seller_id === selectedSeller) {
              listCurrent.push(quoteObj);
            }
          }
        }
      }
    }

    // Sort by price ascending (bottles first, then decants)
    listAll.sort((a, b) => {
      if (a.isBottle !== b.isBottle) return a.isBottle ? -1 : 1;
      return a.price - b.price;
    });

    listCurrent.sort((a, b) => {
      if (a.isBottle !== b.isBottle) return a.isBottle ? -1 : 1;
      return a.price - b.price;
    });

    const activeQuotes = isSpecificSeller ? listCurrent : listAll;
    const bQuote = activeQuotes.find(q => q.isBottle);
    const dQuote = activeQuotes.find(q => !q.isBottle);

    return {
      allQuotes: listAll,
      currentSellerQuotes: listCurrent,
      displayBottleQuote: bQuote,
      displayDecantQuote: dQuote
    };
  }, [f, selectedSeller, isSpecificSeller]);

  // Determine active quotes based on seller filter
  const relevantQuotes = isSpecificSeller ? currentSellerQuotes : allQuotes;
  if (relevantQuotes.length === 0) return null; // Guard: do not render if selected seller has 0 quotes for this perfume

  const hasBottlePrice = !!displayBottleQuote;
  const hasDecantPrice = !!displayDecantQuote;

  const bottlePrice = displayBottleQuote ? displayBottleQuote.price : null;
  const decantPrice = displayDecantQuote ? displayDecantQuote.price : null;

  const bottleDisplaySize = displayBottleQuote 
    ? displayBottleQuote.label.replace(' Retail Bottle', ' Bottle') 
    : (f.community_bottle_size ? f.community_bottle_size.replace(' Retail Bottle', ' Bottle') : 'Bottle');

  const isLowestPartial = !!(displayBottleQuote?.isPartial || (!isSpecificSeller && f.is_partial));
  const isLowestTester = !isLowestPartial && !!(displayBottleQuote?.isTester || (!isSpecificSeller && f.is_tester));

  const displayName = f.brand && !f.name.toLowerCase().includes(f.brand.toLowerCase())
    ? `${f.brand} ${f.name}`
    : f.name;

  // Bottle WhatsApp target & message
  const bottleWhatsAppUrl = hasBottlePrice ? getWhatsAppUrl(
    displayBottleQuote.whatsapp || f.community_whatsapp,
    `Hi ${displayBottleQuote.seller_name || 'there'}, saw your price for ${displayName} (${bottleDisplaySize}) quoted at ₹${bottlePrice.toLocaleString()} on FragScanner. Is this in stock?`
  ) : null;

  // Decant WhatsApp target & message
  const decantWhatsAppUrl = hasDecantPrice ? getWhatsAppUrl(
    displayDecantQuote.whatsapp || f.community_whatsapp,
    `Hi ${displayDecantQuote.seller_name || 'there'}, saw your decant rates for ${displayName} starting at ₹${decantPrice.toLocaleString()} (${displayDecantQuote.label}) on FragScanner. What sizes are available?`
  ) : null;

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
              {isLowestPartial && (
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80 flex items-center gap-1" title="Authentic opened partial bottle">
                  <span>🏷️</span>
                  <span>Partial</span>
                </span>
              )}
              {isLowestTester && (
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

        {/* Option A: Stacked Dual-Action Pods (Bottle vs Decant with dedicated sellers & WhatsApp) */}
        <div className="mt-3 space-y-2">
          {/* Bottle Offer Pod */}
          {hasBottlePrice && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-xs">
                    {isLowestPartial ? '🏷️' : isLowestTester ? '🧪' : '🍾'}
                  </span>
                  <span className="font-medium truncate">{bottleDisplaySize}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  via <strong className="font-semibold text-slate-800 dark:text-slate-200" title={displayBottleQuote.seller_name}>{displayBottleQuote.seller_name}</strong>
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
                    ₹{bottlePrice.toLocaleString()}
                  </div>
                </div>

                {bottleWhatsAppUrl ? (
                  <a
                    href={bottleWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logWhatsAppClick({
                      sellerName: displayBottleQuote.seller_name,
                      fragranceName: f.name,
                      brand: f.brand,
                      price: bottlePrice,
                      format: 'bottle'
                    })}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                    title={`Contact ${displayBottleQuote.seller_name} on WhatsApp`}
                  >
                    <span>WA</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                ) : null}
              </div>
            </div>
          )}

          {/* Decant Offer Pod */}
          {hasDecantPrice && (
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-xs">💧</span>
                  <span className="font-medium truncate">{displayDecantQuote.label}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  via <strong className="font-semibold text-slate-800 dark:text-slate-200" title={displayDecantQuote.seller_name}>{displayDecantQuote.seller_name}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-[9px] font-mono text-slate-400">from</div>
                  <div className="font-mono text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                    ₹{decantPrice.toLocaleString()}
                  </div>
                </div>

                {decantWhatsAppUrl ? (
                  <a
                    href={decantWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logWhatsAppClick({
                      sellerName: displayDecantQuote.seller_name,
                      fragranceName: f.name,
                      brand: f.brand,
                      price: decantPrice,
                      format: 'decant'
                    })}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-mono font-bold transition-all shadow-xs flex items-center justify-center gap-1 shrink-0"
                    title={`Contact ${displayDecantQuote.seller_name} for decants on WhatsApp`}
                  >
                    <span>WA</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                ) : null}
              </div>
            </div>
          )}

          {/* Fallback if neither bottle nor decant quote is available */}
          {!hasBottlePrice && !hasDecantPrice && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center font-mono">
              Unquoted in community
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
          <span>Compare Rates ({allQuotes.length})</span>
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
            <span>Direct Verified Quotes ({allQuotes.length}):</span>
            <span className="text-cyan-400">Ranked by Price ↑</span>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
            {allQuotes.length === 0 ? (
              <div className="text-xs text-slate-400 py-2 text-center">
                No active quotes found for this selection.
              </div>
            ) : (
              allQuotes.map((q, qIdx) => {
                const isSelectedSellerQuote = isSpecificSeller && q.seller_id === selectedSeller;
                return (
                  <div 
                    key={qIdx}
                    className={`p-2 rounded-lg ${
                      isSelectedSellerQuote
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-400 dark:border-cyan-600 ring-1 ring-cyan-500/20'
                        : qIdx === 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                    } flex items-center justify-between text-xs`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span className={`w-4 h-4 rounded-full ${
                        isSelectedSellerQuote
                          ? 'bg-cyan-600 text-white font-black'
                          : qIdx === 0 
                            ? 'bg-emerald-600 text-white font-black' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      } text-[9px] font-mono flex items-center justify-center shrink-0`}>
                        {qIdx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-[11px] text-slate-900 dark:text-white flex items-center gap-1 truncate">
                          <span className="truncate">{q.seller_name}</span>
                          {qIdx === 0 && (
                            <span className="text-[8px] font-mono text-emerald-700 dark:text-emerald-300 font-black bg-emerald-100 dark:bg-emerald-950 px-1 rounded shrink-0">
                              Lowest
                            </span>
                          )}
                          {isSelectedSellerQuote && (
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
                        isSelectedSellerQuote
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
                          onClick={() => logWhatsAppClick({
                            sellerName: q.seller_name,
                            fragranceName: f.name,
                            brand: f.brand,
                            price: q.price,
                            format: q.isBottle ? 'bottle' : 'decant'
                          })}
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
