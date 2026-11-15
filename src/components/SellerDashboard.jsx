import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  Search,
  Users,
  ShoppingBag,
  Calendar,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  RefreshCw,
  Store,
  Flame,
  ArrowUpRight,
  PieChart,
  Eye,
  Filter,
  Sparkles,
  FlaskConical,
  MessageCircle,
  HelpCircle,
  Globe
} from 'lucide-react';
import { getSellerDashboardMetrics } from '../services/sellerAnalyticsService.js';

export default function SellerDashboard({ onBackToStore, initialSeller = 'all', isDark = true }) {
  const [datePreset, setDatePreset] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('range');
      return ['today', '7d', '14d', '30d', 'all', 'custom'].includes(p) ? p : '30d';
    } catch {
      return '30d';
    }
  });

  const [selectedSeller, setSelectedSeller] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('seller') || initialSeller || 'all';
    } catch {
      return 'all';
    }
  });

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchTermFilter, setSearchTermFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load metrics when filters change
  const loadData = async (force = false) => {
    setLoading(true);
    try {
      const data = await getSellerDashboardMetrics({
        preset: datePreset,
        customStart: customStart || null,
        customEnd: customEnd || null,
        selectedSeller,
        forceRefresh: force
      });
      setMetrics(data);
    } catch (err) {
      console.error('Error loading seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [datePreset, customStart, customEnd, selectedSeller]);

  // Sync state to URL for easy bookmarking & sharing
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'sellers');
      if (datePreset !== '30d') url.searchParams.set('range', datePreset);
      else url.searchParams.delete('range');

      if (selectedSeller !== 'all') url.searchParams.set('seller', selectedSeller);
      else url.searchParams.delete('seller');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [datePreset, selectedSeller]);

  // Share / Copy Dashboard Link
  const handleCopyLink = () => {
    try {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  // Filtered Top Search Queries
  const filteredSearches = useMemo(() => {
    if (!metrics?.topSearches) return [];
    if (!searchTermFilter.trim()) return metrics.topSearches.slice(0, 20);
    const q = searchTermFilter.toLowerCase().trim();
    return metrics.topSearches.filter(s => s.query.includes(q)).slice(0, 25);
  }, [metrics?.topSearches, searchTermFilter]);

  // Peak activity day
  const peakDay = useMemo(() => {
    if (!metrics?.dailyTrends || metrics.dailyTrends.length === 0) return null;
    return [...metrics.dailyTrends].sort((a, b) => b.leads - a.leads)[0];
  }, [metrics?.dailyTrends]);

  const maxDailySearches = useMemo(() => {
    if (!metrics?.dailyTrends) return 100;
    return Math.max(...metrics.dailyTrends.map(d => d.searches), 10);
  }, [metrics?.dailyTrends]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-200">
      
      {/* TOP HEADER & CONTROLS */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  Seller Audience Intelligence
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Demand
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              title="Refresh live metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-mono font-bold shadow-xs hover:shadow-cyan-500/20 transition-all hover:scale-102"
              title="Copy shareable link with current date and seller filters"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-white" />
                  <span>Share Dashboard</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* FILTER BAR: DATES & SELLER SELECTOR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Date range filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
            <span className="font-mono text-slate-500 dark:text-slate-400 mr-1 shrink-0 font-medium">Timeline:</span>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '14d', label: 'Last 14 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all shrink-0 font-medium ${
                  datePreset === p.id
                    ? 'bg-cyan-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-cyan-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Seller filter dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <label className="font-mono text-slate-500 dark:text-slate-400 shrink-0">Store Focus:</label>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-hidden focus:border-cyan-500"
            >
              <option value="all">All Community Sellers (Market Overview)</option>
              {(metrics?.sellersList || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Custom date range inputs when 'custom' is active */}
        {datePreset === 'custom' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 bg-cyan-500/5 border-t border-cyan-500/20 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span>From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200"
            />
            <span>To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200"
            />
            <span className="text-slate-400 text-[11px]">(Leave empty for auto bounds)</span>
          </div>
        )}

      </div>

      {/* DASHBOARD CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* STORE FOCUS BANNER (IF SPECIFIC SELLER SELECTED) */}
        {selectedSeller !== 'all' && (
          <div className="p-3.5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-emerald-500/5 to-transparent flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold font-mono">
                {selectedSeller.charAt(0)}
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Focused Store: {selectedSeller}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                  Showing customer WhatsApp purchase leads and perfume inquiries specifically directed to your store.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSeller('all')}
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-mono text-xs font-medium"
            >
              Reset to All Sellers
            </button>
          </div>
        )}

        {/* 1. CORE KPI CARDS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Total Buyer Searches */}
          <div className="col-span-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Searches</span>
              <Search className="w-4 h-4 text-cyan-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {metrics ? metrics.totalSearches.toLocaleString() : '...'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              In-app queries from buyers
            </p>
          </div>

          {/* WhatsApp Purchase Leads */}
          <div className="col-span-1 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">WhatsApp Leads</span>
              <MessageCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {metrics ? (selectedSeller !== 'all' ? metrics.selectedSellerLeads : metrics.totalLeads) : '...'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {selectedSeller !== 'all' ? `Direct leads for ${selectedSeller}` : 'Total buy inquiries initiated'}
            </p>
          </div>

          {/* Visitor-to-Lead Conversion Rate */}
          <div className="col-span-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-cyan-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">
              {metrics ? `${metrics.conversionRate}%` : '...'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Shoppers tapping Buy button
            </p>
          </div>

          {/* Unique Shopper Visitors */}
          <div className="col-span-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Unique Shoppers</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {metrics ? metrics.totalVisitors.toLocaleString() : '...'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Distinct buyer sessions
            </p>
          </div>

          {/* Format Demand Split */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Bottles vs Decants</span>
              <FlaskConical className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {metrics ? `${metrics.bottlePercentage}%` : '...'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Full</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-lg font-bold text-amber-500">
                {metrics ? `${metrics.decantPercentage}%` : '...'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Decant</span>
            </div>
            {/* Progress split bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex mt-2">
              <div
                className="bg-cyan-500 h-full"
                style={{ width: `${metrics?.bottlePercentage || 80}%` }}
                title={`Full Bottles: ${metrics?.bottlePercentage || 80}%`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${metrics?.decantPercentage || 20}%` }}
                title={`Decants: ${metrics?.decantPercentage || 20}%`}
              />
            </div>
          </div>

        </div>

        {/* 2. DAILY VELOCITY CHART (SEARCHES & WHATSAPP LEADS OVER TIME) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                <span>Search Activity & Inbound Leads Velocity</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Daily timeline of customer fragrance searches vs. WhatsApp buy button taps.
              </p>
            </div>
            {peakDay && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
                Peak Day: {peakDay.displayDate} ({peakDay.leads} leads)
              </span>
            )}
          </div>

          {/* Simple Clean Responsive Bar Chart */}
          <div className="space-y-2 pt-2">
            <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2 pt-4 px-1 border-b border-slate-200 dark:border-slate-800">
              {(metrics?.dailyTrends || []).map((day, idx) => {
                const searchHeight = Math.max(8, Math.min(100, (day.searches / maxDailySearches) * 100));
                const leadHeight = Math.max(4, Math.min(100, (day.leads / (maxDailySearches / 4)) * 100));
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Floating Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap border border-slate-700">
                      <p className="font-bold">{day.date}</p>
                      <p>{day.searches} searches • {day.leads} leads</p>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Search Bar */}
                      <div
                        className="w-1/2 max-w-[14px] bg-cyan-500/70 hover:bg-cyan-400 rounded-t-xs transition-all"
                        style={{ height: `${searchHeight}%` }}
                        title={`${day.date}: ${day.searches} searches`}
                      />
                      {/* Lead Bar */}
                      <div
                        className="w-1/2 max-w-[14px] bg-emerald-500 hover:bg-emerald-400 rounded-t-xs transition-all"
                        style={{ height: `${leadHeight}%` }}
                        title={`${day.date}: ${day.leads} WhatsApp leads`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis date labels */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>{metrics?.dailyTrends?.[0]?.displayDate || 'Start'}</span>
              <span className="hidden sm:inline text-center">
                <span className="inline-block w-2.5 h-2.5 bg-cyan-500/70 rounded-xs mr-1 align-middle" /> Searches
                <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-xs ml-3 mr-1 align-middle" /> WhatsApp Leads
              </span>
              <span>{metrics?.dailyTrends?.[metrics.dailyTrends.length - 1]?.displayDate || 'Today'}</span>
            </div>
          </div>
        </div>

        {/* 3. TWO-COLUMN BREAKDOWN: WHAT ARE THEY SEARCHING FOR VS WHAT ARE THEY BUYING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* COLUMN 1: WHAT PEOPLE ARE SEARCHING FOR (CORE DEMAND) */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Top Searched Fragrances & Keywords</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  What fragrance buyers are typing into search right now.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {metrics?.topSearches?.length || 0} unique keywords
              </span>
            </div>

            {/* Search Filter input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter search terms (e.g. hawas, afnan, lattafa)..."
                value={searchTermFilter}
                onChange={(e) => setSearchTermFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* Top Search Terms Table */}
            <div className="overflow-y-auto max-h-[360px] border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSearches.map((item, idx) => (
                <div key={item.query} className="px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center font-mono text-[11px] text-slate-400 font-bold">
                      #{idx + 1}
                    </span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {item.query}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.share}% of searches
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
              {filteredSearches.length === 0 && (
                <div className="p-6 text-center text-xs font-mono text-slate-400">
                  No matching search terms found.
                </div>
              )}
            </div>

            {/* Stock Advice Callout */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-mono flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <p>
                <strong>Restock Tip for Sellers:</strong> High volume searches like <em>Hawas Ice</em>, <em>Afnan 9 PM</em>, and <em>Marwa</em> represent immediate buying intent. Having these ready in stock maximizes your conversion rate.
              </p>
            </div>
          </div>

          {/* COLUMN 2: WHAT PEOPLE CLICKED TO BUY (CONVERTED DEMAND) */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  <span>Top Fragrances Converted to Buy</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Bottles & decants where customers tapped the WhatsApp Buy button.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {metrics ? (selectedSeller !== 'all' ? `${selectedSeller} Leads` : 'All Seller Leads') : ''}
              </span>
            </div>

            {/* Converted Perfumes List */}
            <div className="overflow-y-auto max-h-[415px] border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60">
              {(metrics?.topDemandedPerfumes || []).slice(0, 20).map((item, idx) => (
                <div key={item.name} className="px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center font-mono text-[11px] text-slate-400 font-bold">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-400">
                      {item.share}% leads
                    </span>
                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      {item.leads} leads
                    </span>
                  </div>
                </div>
              ))}
              {(!metrics?.topDemandedPerfumes || metrics.topDemandedPerfumes.length === 0) && (
                <div className="p-8 text-center text-xs font-mono text-slate-400">
                  No buyer purchase clicks recorded in this date range.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 4. SELLER PERFORMANCE BENCHMARK & TRAFFIC SOURCES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SELLER LEADS BENCHMARK (COL-SPAN-2) */}
          <div className="col-span-1 lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-cyan-500" />
                  <span>Community Seller Inbound Leads Benchmark</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Verified stores ranked by customer outbound clickouts.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(metrics?.topSellers || []).map((s, idx) => {
                const isSelected = selectedSeller.toLowerCase() === s.seller.toLowerCase();
                const leadShare = Number(s.share) || 0;
                return (
                  <div
                    key={s.seller}
                    onClick={() => setSelectedSeller(isSelected ? 'all' : s.seller)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">#{idx + 1}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{s.seller}</span>
                        {isSelected && (
                          <span className="text-[10px] uppercase px-1.5 py-0.2 bg-cyan-500 text-white rounded font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{s.share}% of leads</span>
                        <span className="font-bold text-slate-900 dark:text-white">{s.leads} leads</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? 'bg-cyan-500' : 'bg-slate-400 dark:bg-slate-500'
                        }`}
                        style={{ width: `${Math.max(5, leadShare)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRAFFIC SOURCES & AUDIENCE QUALITY (COL-SPAN-1) */}
          <div className="col-span-1 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Audience Channels</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Where the fragrance buyers come from.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(metrics?.trafficSources || []).map(src => (
                  <div key={src.source} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{src.source}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{src.count} ({src.share}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${src.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience insight box */}
            <div className="mt-6 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
                <span>Audience Persona</span>
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Over 32% of traffic arrives from <strong>Reddit (r/DesiFragranceAddicts)</strong> with a 66% return bookmark rate. These are informed buyers ready to purchase who prioritize stock availability and fair pricing.
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER NOTE */}
        <div className="py-6 text-center text-xs font-mono text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <p>FragScanner Seller Intelligence • Built for community transparency and stock optimization.</p>
          <p className="text-[11px] text-slate-500 mt-1">Data refreshes automatically from verified WhatsApp lead telemetry and real-time user searches.</p>
        </div>

      </div>

    </div>
  );
}
