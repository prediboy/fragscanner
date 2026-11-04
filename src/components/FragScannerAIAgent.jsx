import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Sparkles, ShoppingBag, ArrowRight, 
  Store, CheckCircle, ExternalLink, ShieldCheck, Flame, Star
} from 'lucide-react';
import { processSommelierQuery } from '../lib/sommelierEngine';

export default function FragScannerAIAgent({ onSelectFragrance }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I am your **FragScanner AI Sommelier**.\n\nAsk me anything: recommendations by occasion, finding twin clones for designer favorites (*Angels' Share, Sauvage, Aventus, Tygar*), comparing live prices for **Full Bottles** (*Second Theory, FragFever, Apex Aroma*) and **Decants 5ml–30ml** (*Liquid Emotions, Blue Wings, Whiff Culture*)!",
      data: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const QUICK_PROMPTS = [
    "Winter date night scents under ₹3,000",
    "Cheapest seller for Liquid Brun",
    "Decants available for SNOI & Hawas Ice",
    "Best clones of Kilian Angels' Share",
    "Tell me about Turathi Blue"
  ];

  const handleSend = async (userText) => {
    const text = userText || input;
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // 1. Try Vercel Serverless AI SDK endpoint first
      let usedServerless = false;
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
          })
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('text/plain') || contentType.includes('stream')) {
            const streamedText = await res.text();
            if (streamedText && streamedText.length > 10) {
              setMessages(prev => [...prev, { role: 'assistant', content: streamedText }]);
              usedServerless = true;
            }
          }
        }
      } catch (e) {
        // Fall through to local sommelier engine
      }

      // 2. If no serverless response, use intelligent Sommelier Engine
      if (!usedServerless) {
        // Small delay to simulate thoughtful analysis
        await new Promise(r => setTimeout(r, 400));
        const result = processSommelierQuery(text);

        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: result.text,
            data: result 
          }
        ]);
      }
    } catch (err) {
      const fallbackResult = processSommelierQuery(text);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: fallbackResult.text,
          data: fallbackResult 
        }
      ]);
    } finally {
      setIsThinking(false);
    }
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
          <div className="w-full sm:max-w-lg h-[92vh] sm:h-[86vh] bg-[#0d1424] border border-amber-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
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
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Live olfactory twins • Full Bottles & Decants (5ml–30ml) Across 8 Sellers
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
                    className={`max-w-[92%] p-3.5 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none shadow-md'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none space-y-3'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Rich Card: Fragrance Spotlight */}
                    {msg.data?.cardType === 'fragrance_spotlight' && msg.data.fragrance && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">{msg.data.fragrance.brand}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {msg.data.fragrance.community_price ? `₹${msg.data.fragrance.community_price}` : 'Unquoted'}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white">{msg.data.fragrance.name}</h4>

                        {/* Sellers list */}
                        {msg.data.sellers && msg.data.sellers.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-800">
                            {msg.data.sellers.map((s, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <div>
                                  <span className="font-bold text-white">{s.seller_name}</span>
                                  <span className="text-emerald-400 font-mono font-bold ml-2">₹{s.price}</span>
                                </div>
                                <a
                                  href={`https://wa.me/91${s.whatsapp}?text=${encodeURIComponent(`Hi ${s.seller_name}, I want to order ${msg.data.fragrance.brand} ${msg.data.fragrance.name} quoted at ₹${s.price}. Is it in stock?`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                                >
                                  <span>WhatsApp</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => onSelectFragrance?.(msg.data.fragrance)}
                          className="w-full mt-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          View Full Perfume Details
                        </button>
                      </div>
                    )}

                    {/* Rich Card: Multi-Seller Compare / Budget Picks */}
                    {(msg.data?.cardType === 'multi_seller_compare' || msg.data?.cardType === 'budget_picks' || msg.data?.cardType === 'clone_recommendations') && msg.data.items && (
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {msg.data.items.map((item, iIdx) => (
                          <div 
                            key={iIdx}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] text-amber-400 font-bold block">{item.brand}</span>
                                <h5 className="font-bold text-white text-xs">{item.name}</h5>
                                {item.dna_inspiration && (
                                  <span className="text-[10px] text-slate-400 block">Inspired by {item.dna_inspiration}</span>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                {item.in_seller_stock && item.community_price ? (
                                  <>
                                    <span className="text-xs font-mono font-black text-emerald-400 block">₹{item.community_price}</span>
                                    <span className="text-[9px] text-slate-400">{item.lowest_seller}</span>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Archive</span>
                                )}
                              </div>
                            </div>

                            {/* Direct WhatsApp button for best seller if in stock */}
                            {item.in_seller_stock && item.community_sellers?.[0] && (
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">
                                  {item.community_sellers.length > 1 ? `${item.community_sellers.length} Sellers Available` : '1 Seller'}
                                </span>
                                <a
                                  href={`https://wa.me/91${item.community_sellers[0].whatsapp}?text=${encodeURIComponent(`Hi ${item.community_sellers[0].seller_name}, I would like to purchase ${item.brand} ${item.name} quoted at ₹${item.community_sellers[0].price}. Is it available?`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                                >
                                  <span>Order via WhatsApp</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            )}
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
                  <span>Sommelier analyzing notes, closest matches & seller inventory...</span>
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
                  placeholder="Ask for date night scents, clone twins, or seller rates..."
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
