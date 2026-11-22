import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Star, ChevronDown, ChevronUp, Sparkles, TrendingDown, Flame, MessageCircle, ExternalLink, Check } from 'lucide-react';
import { logWhatsAppClick, logFragranceCardClick } from '../lib/supabaseTelemetry';

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
  const isSpecificSeller = selectedSeller && selectedSeller !== 'all';

  // 1. Extract quotes for the card
  const { allQuotes, currentSellerQuotes, lowestRetail, lowestTester, lowestPartial, lowestDecant } = useMemo(() => {
    const listAll = [];
    const listCurrent = [];

    if (!f) {
      return {
        allQuotes: listAll,
        currentSellerQuotes: listCurrent,
        lowestRetail: null,
        lowestTester: null,
        lowestPartial: null,
        lowestDecant: null
      };
    }

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
              const mlMatch = sz.match(/(\d+)\s*ml/i);
              const ml = mlMatch ? parseInt(mlMatch[1], 10) : null;
              const pricePerMl = ml ? Math.round(p / ml) : null;
              const isTargetRange = ml && ml >= 8 && ml <= 12;

              const quoteObj = {
                seller_id: d.seller_id,
                seller_name: d.seller_name,
                label: `${sz} Decant`,
                price: p,
                ml,
                pricePerMl,
                isTargetRange,
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
            const ml = d.price_10ml ? 10 : (d.price_5ml ? 5 : null);
            const pricePerMl = ml ? Math.round(p / ml) : null;
            const isTargetRange = ml && ml >= 8 && ml <= 12;

            const quoteObj = {
              seller_id: d.seller_id,
              seller_name: d.seller_name,
              label: d.price_10ml ? '10ml Decant' : (d.price_5ml ? '5ml Decant' : 'Decant'),
              price: p,
              ml,
              pricePerMl,
              isTargetRange,
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

    // Priority 1: Best price per ml in 8-12ml sweet-spot
    const targetRangeDecants = activeQuotes.filter(q => q.type === 'decant' && q.isTargetRange && q.pricePerMl);
    let bDecant = null;
    if (targetRangeDecants.length > 0) {
      targetRangeDecants.sort((a, b) => a.pricePerMl - b.pricePerMl);
      bDecant = targetRangeDecants[0];
    } else {
      const allDecantsWithRate = activeQuotes.filter(q => q.type === 'decant' && q.pricePerMl);
      if (allDecantsWithRate.length > 0) {
        allDecantsWithRate.sort((a, b) => a.pricePerMl - b.pricePerMl);
        bDecant = allDecantsWithRate[0];
      } else {
        bDecant = activeQuotes.find(q => q.type === 'decant');
      }
    }

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

  // Active formats selected by user in filter rail (defaults to ['retail'])
  const activeFormats = Array.isArray(selectedFormats) && selectedFormats.length > 0
    ? selectedFormats
    : ['retail'];

  // Quote overrides selected by user from the Compare Rates accordion
  const [quoteOverrides, setQuoteOverrides] = useState({});

  const activeRetail = quoteOverrides['retail'] || lowestRetail;
  const activeTester = quoteOverrides['tester'] || lowestTester;
  const activePartial = quoteOverrides['partial'] || lowestPartial;
  const activeDecant = quoteOverrides['decant'] || lowestDecant;

  // Available format options for this fragrance card
  const availableFormatTabs = useMemo(() => {
    const tabs = [];
    if (lowestRetail) tabs.push({ id: 'retail', label: 'Bottle', quote: activeRetail });
    if (lowestTester) tabs.push({ id: 'tester', label: 'Tester', quote: activeTester });
    if (lowestPartial) tabs.push({ id: 'partial', label: 'Partial', quote: activePartial });
    if (lowestDecant) tabs.push({ id: 'decant', label: 'Decant', quote: activeDecant });
    return tabs;
  }, [lowestRetail, lowestTester, lowestPartial, lowestDecant, activeRetail, activeTester, activePartial, activeDecant]);

  const activeFormatsKey = (activeFormats || []).slice().sort().join(',');
  const prevActiveFormatsKeyRef = useRef(activeFormatsKey);

  // Active selected format on the card
  const [cardFormat, setCardFormat] = useState(() => {
    if (activeFormats.length === 1 && availableFormatTabs.some(t => t.id === activeFormats[0])) {
      return activeFormats[0];
    }
    if (lowestRetail) return 'retail';
    return availableFormatTabs[0]?.id || 'retail';
  });

  // Only sync cardFormat when the parent's filter format explicitly changes, or if current selection is invalid
  useEffect(() => {
    if (prevActiveFormatsKeyRef.current !== activeFormatsKey) {
      prevActiveFormatsKeyRef.current = activeFormatsKey;
      if (activeFormats.length === 1 && availableFormatTabs.some(t => t.id === activeFormats[0])) {
        setCardFormat(activeFormats[0]);
        return;
      }
    }
    if (!availableFormatTabs.some(t => t.id === cardFormat) && availableFormatTabs.length > 0) {
      setCardFormat(availableFormatTabs[0].id);
    }
  }, [activeFormatsKey, availableFormatTabs, cardFormat, activeFormats]);

  // Filter quotes strictly matching active card format for display and Compare Rates
  const formatQuotes = useMemo(() => {
    const base = isSpecificSeller ? currentSellerQuotes : allQuotes;
    const targetFormat = cardFormat;
    const matching = base.filter(q => q.type === targetFormat);
    const quotes = (matching.length > 0 ? matching : base).slice();

    if (targetFormat === 'decant') {
      quotes.sort((a, b) => (a.pricePerMl || a.price) - (b.pricePerMl || b.price));
    } else {
      quotes.sort((a, b) => a.price - b.price);
    }
    return quotes;
  }, [allQuotes, currentSellerQuotes, cardFormat, isSpecificSeller]);

  const activeTab = availableFormatTabs.find(t => t.id === cardFormat) || availableFormatTabs[0];
  const primaryQuote = activeTab?.quote || formatQuotes[0] || lowestRetail;

  const bottleDisplaySize = primaryQuote?.label
    ? primaryQuote.label.replace(' Retail Bottle', ' Bottle')
    : (f?.community_bottle_size ? f.community_bottle_size.replace(' Retail Bottle', ' Bottle') : 'Bottle');

  const displayName = f?.brand && !f?.name?.toLowerCase().includes(f.brand.toLowerCase())
    ? `${f.brand} ${f.name}`
    : (f?.name || '');

  if (!f || relevantQuotes.length === 0 || !primaryQuote) return null;

  const whatsappMessage = primaryQuote.type === 'decant'
    ? `Hi ${primaryQuote.seller_name || 'there'}, saw your decant quote for ${displayName} (${primaryQuote.label}) quoted at ₹${primaryQuote.price.toLocaleString()} on FragSeeker. Is this available?`
    : primaryQuote.type === 'tester'
    ? `Hi ${primaryQuote.seller_name || 'there'}, saw your tester quote for ${displayName} quoted at ₹${primaryQuote.price.toLocaleString()} on FragSeeker. Is this in stock?`
    : primaryQuote.type === 'partial'
    ? `Hi ${primaryQuote.seller_name || 'there'}, saw your partial bottle for ${displayName} quoted at ₹${primaryQuote.price.toLocaleString()} on FragSeeker. Can you share level pictures?`
    : `Hi ${primaryQuote.seller_name || 'there'}, saw your price for ${displayName} (${bottleDisplaySize}) quoted at ₹${primaryQuote.price.toLocaleString()} on FragSeeker. Is this in stock?`;

  const whatsappUrl = getWhatsAppUrl(primaryQuote.whatsapp || f.community_whatsapp, whatsappMessage);

  return (
    <div 
      className="bg-white dark:bg-[#12141C] rounded-2xl border border-slate-200/90 dark:border-[#232738] hover:border-slate-300 dark:hover:border-[#383E54] shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-3.5 relative w-full"
    >
      <div className="space-y-3">
        {/* Clickable Header Area: Brand, Rating & Deal Flag */}
        <div 
          onClick={() => onSelect && onSelect(f)} 
          className="cursor-pointer space-y-1.5 group"
          title="Click to view notes, longevity & reviews"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-semibold truncate">
                {f.brand}
              </span>

              {f.trendingRank ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500/30" />
                  <span>#{f.trendingRank} Trending</span>
                </span>
              ) : f.is_price_drop && !isSpecificSeller ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Price Drop</span>
                </span>
              ) : f.is_new_arrival && f.in_seller_stock ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>New</span>
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{(Number(f.rating_value) || 4.2).toFixed(1)}</span>
            </div>
          </div>

          {/* Fragrance Name & Cloned DNA */}
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
              {f.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
              {f.dna_inspiration ? (
                <span>
                  Inspiration: <strong className="font-medium text-slate-700 dark:text-zinc-300">{f.dna_inspiration}</strong>
                </span>
              ) : (
                f.dna_type || 'Verified Community Stock'
              )}
            </p>
          </div>
        </div>

        {/* Clean Format Selector (Only shown if multiple formats exist) */}
        {availableFormatTabs.length > 1 && (
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#181B26] rounded-xl border border-slate-200/80 dark:border-[#262B3D] text-[11px] font-mono">
            {availableFormatTabs.map(tab => {
              const isActive = cardFormat === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCardFormat(tab.id)}
                  className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer font-medium ${
                    isActive
                      ? 'bg-white dark:bg-[#232738] text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Streamlined Single Price & Seller Block */}
        <div className="pt-2">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`font-mono text-xl font-bold tracking-tight ${f.is_price_drop && !isSpecificSeller ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                  ₹{primaryQuote.price.toLocaleString()}
                </span>
                {f.is_price_drop && f.previous_price && (
                  <span className="text-xs text-slate-400 line-through font-mono">
                    ₹{Number(f.previous_price).toLocaleString()}
                  </span>
                )}
                {primaryQuote.type === 'decant' && primaryQuote.pricePerMl && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                    (₹{primaryQuote.pricePerMl}/ml)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {primaryQuote.label} · <strong className="font-medium text-slate-700 dark:text-zinc-300">{primaryQuote.seller_name}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent, Unmissable CTA Button */}
      <div className="space-y-2 pt-1">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => logWhatsAppClick({
              sellerName: primaryQuote.seller_name,
              fragranceName: f.name,
              brand: f.brand,
              price: primaryQuote.price,
              format: primaryQuote.type
            })}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            title={`Contact ${primaryQuote.seller_name} on WhatsApp`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire on WhatsApp</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        ) : null}

        {/* Light Sub-Toolbar: Compare Rates & Notes */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={() => {
              if (!isExpanded && f) {
                logFragranceCardClick({
                  fragranceName: f.name,
                  brand: f.brand,
                  price: primaryQuote.price,
                  format: primaryQuote.type
                });
              }
              onToggleExpand && onToggleExpand(f.id);
            }}
            className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Compare {formatQuotes.length} quotes</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => onSelect && onSelect(f)}
            className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Notes & Review →</span>
          </button>
        </div>
      </div>

      {/* Expanded Direct Quotes Drawer */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-[#232738] space-y-1.5 bg-slate-50 dark:bg-[#0E1017] p-2.5 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 font-semibold">
            <span>Direct Quotes ({formatQuotes.length})</span>
            <span>Ranked by Price ↑</span>
          </div>

          <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
            {formatQuotes.map((q, qIdx) => {
              const isSelected = primaryQuote.seller_id === q.seller_id && primaryQuote.price === q.price;

              return (
                <div 
                  key={qIdx}
                  onClick={() => setQuoteOverrides(prev => ({ ...prev, [q.type]: q }))}
                  className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-white dark:bg-[#1C202F] border border-slate-300 dark:border-[#383E54] shadow-2xs'
                      : 'hover:bg-white/60 dark:hover:bg-[#161822] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className={`w-4 h-4 rounded-full ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    } text-[9px] font-mono flex items-center justify-center shrink-0`}>
                      {isSelected ? <Check className="w-2.5 h-2.5" /> : qIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-[11px] text-slate-900 dark:text-zinc-200 truncate">
                        {q.seller_name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                        {q.label} • {q.dispatch}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                      ₹{q.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
