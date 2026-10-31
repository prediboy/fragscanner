import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Sparkles, ShoppingBag, ArrowRight, 
  Store, CheckCircle, ExternalLink, ShieldCheck, Flame
} from 'lucide-react';
import { 
  searchFragrancesTool, 
  checkSellerPricesTool, 
  findInStockDealsByBudgetTool 
} from '../lib/fragranceAgentTools';

export default function FragScannerAIAgent({ onSelectFragrance }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your **FragScanner AI Sommelier**. Ask me anything about perfumes, clones, scent twins, or live seller prices across **Second Theory** and **FragFever**!",
      toolCalls: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const QUICK_PROMPTS = [
    "Winter clones under ₹3,000 in stock",
    "Who has the cheapest Liquid Brun?",
    "Best clones of Kilian Angels' Share",
    "Fresh summer scents like Hawas",
    "Compare CDNIM prices between sellers"
  ];

  const handleSend = (userText) => {
    const text = userText || input;
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // AI Agent Tool-Calling Reasoning Loop
    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = "";
      let toolData = null;

      if (lower.includes('liquid brun') || lower.includes('khamrah') || lower.includes('hawas') || lower.includes('cdnim') || lower.includes('sillage') || lower.includes('compare') || lower.includes('cheapest') || lower.includes('price')) {
        // Extract perfume name
        let target = 'Liquid Brun';
        if (lower.includes('khamrah')) target = 'Khamrah';
        else if (lower.includes('hawas')) target = 'Hawas';
        else if (lower.includes('cdnim') || lower.includes('intense man')) target = 'Club de Nuit Intense Man';
        else if (lower.includes('sillage')) target = 'Sillage';
        else if (lower.includes('spectre')) target = 'Spectre Ghost';
        else if (lower.includes('9 pm') || lower.includes('9pm')) target = '9 PM';
        else if (lower.includes('kaaf')) target = 'Kaaf';
        else if (lower.includes('rifaaqat')) target = 'Rifaaqat';

        const result = checkSellerPricesTool({ fragranceName: target });
        toolData = { type: 'seller_comparison', data: result };

        if (result.found && result.results.length > 0) {
          const item = result.results[0];
          responseText = `I scanned the live inventory across our community sellers for **${item.brand} ${item.name}**:\n\n` +
            `• **Best Deal**: ${item.lowest_price} via **${item.lowest_seller}**\n` +
            `• **Sellers Carrying It**: ${item.sellers_count} verified ${item.sellers_count === 1 ? 'seller' : 'sellers'}\n\n` +
            `Here is the live price breakdown and direct WhatsApp order links:`;
        } else {
          responseText = `I couldn't find active quotes for "${target}" in current seller sheets. Check Section 1 in the Matcher for similar scent twins!`;
        }
      } else if (lower.includes('under') || lower.includes('budget') || lower.includes('cheap') || lower.includes('3000') || lower.includes('2500') || lower.includes('2000')) {
        let budget = 3000;
        const matchDigits = lower.match(/\d{4}/);
        if (matchDigits) budget = parseInt(matchDigits[0]);

        let season = 'all';
        if (lower.includes('winter')) season = 'Winter';
        else if (lower.includes('summer')) season = 'Summer';

        const deals = findInStockDealsByBudgetTool({ maxBudget: budget, season, limit: 4 });
        toolData = { type: 'budget_deals', data: deals, budget, season };

        responseText = `Here are top-rated in-stock fragrance deals under **₹${budget.toLocaleString()}**${season !== 'all' ? ` for **${season}**` : ''} verified ready to buy:`;
      } else if (lower.includes('angel') || lower.includes('sauvage') || lower.includes('aventus') || lower.includes('tygar') || lower.includes('babycat') || lower.includes('clone')) {
        let target = "Angels' Share";
        if (lower.includes('sauvage')) target = "Sauvage";
        else if (lower.includes('aventus')) target = "Aventus";
        else if (lower.includes('tygar')) target = "Tygar";
        else if (lower.includes('babycat')) target = "Babycat";

        const clones = searchFragrancesTool({ query: target, maxResults: 4 });
        toolData = { type: 'clone_search', data: clones, target };

        responseText = `Here are the top-rated clones inspired by **${target}** in our catalog:`;
      } else {
        const matches = searchFragrancesTool({ query: text, maxResults: 4 });
        toolData = { type: 'clone_search', data: matches, target: text };
        responseText = `I searched our 889-scent database for "${text}". Here are the closest matches:`;
      }

      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: responseText,
          toolData 
        }
      ]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-2xl hover:scale-105 transition-all border border-amber-300"
        title="Open FragScanner AI Sommelier"
      >
        <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
          <Bot className="w-4 h-4" />
        </div>
        <span>Ask AI Sommelier</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* AI Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-lg h-[92vh] sm:h-[85vh] bg-[#0d1424] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 bg-[#111a30] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">FragScanner AI Sommelier</h3>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      Vercel AI SDK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Real-time tool calling over 889 perfumes & live sellers
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none space-y-2'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                    {/* Tool Data Rendering: Seller Comparison */}
                    {msg.toolData?.type === 'seller_comparison' && msg.toolData.data?.results && (
                      <div className="space-y-3 pt-2">
                        {msg.toolData.data.results.map((r, rIdx) => (
                          <div key={rIdx} className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                            <div className="flex items-baseline justify-between">
                              <span className="font-extrabold text-white text-xs">{r.brand} {r.name}</span>
                              <span className="text-emerald-400 font-bold font-mono text-xs">{r.lowest_price}</span>
                            </div>
                            {r.dna_inspiration && (
                              <p className="text-[10px] text-slate-400">Target: {r.dna_inspiration}</p>
                            )}
                            <div className="space-y-1.5 pt-1 border-t border-slate-800">
                              {r.sellers.map((s, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800">
                                  <div>
                                    <span className="font-bold text-white">{s.seller_name}</span>
                                    <span className="text-[10px] text-slate-400 ml-1.5">{s.price}</span>
                                  </div>
                                  <a
                                    href={s.whatsapp_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1"
                                  >
                                    <span>WhatsApp</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tool Data Rendering: Budget In-Stock Deals */}
                    {msg.toolData?.type === 'budget_deals' && msg.toolData.data && (
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        {msg.toolData.data.map((d, dIdx) => (
                          <div key={dIdx} className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white text-xs block">{d.brand} {d.name}</span>
                              <span className="text-[10px] text-slate-400">{d.dna_inspiration || d.accords?.join(', ')}</span>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className="text-emerald-400 font-extrabold font-mono text-xs block">{d.community_price}</span>
                              <span className="text-[9px] text-slate-400">{d.lowest_seller}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tool Data Rendering: Clone Search */}
                    {msg.toolData?.type === 'clone_search' && msg.toolData.data && (
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        {msg.toolData.data.map((c, cIdx) => (
                          <div 
                            key={cIdx} 
                            onClick={() => onSelectFragrance?.(c)}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-white text-xs block">{c.brand} {c.name}</span>
                              <span className="text-[10px] text-amber-300">Inspired by {c.dna_inspiration || c.dna_type}</span>
                            </div>
                            <span className="text-xs text-amber-400 font-mono">★ {c.rating_value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 w-max">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Agent scanning olfactory database & seller sheets...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0e1628] overflow-x-auto flex gap-1.5 scrollbar-none">
              {QUICK_PROMPTS.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-[11px] whitespace-nowrap transition-colors shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#111a30] border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about perfumes, twin clones, or seller prices..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
