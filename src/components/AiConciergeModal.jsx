import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, ArrowRight, ShieldCheck, Star, RotateCcw, Bot, User } from 'lucide-react';
import { sendChatMessageToKhushboo, getOrCreateSessionId, loadSessionHistory, persistChatMessage } from '../services/aiConciergeService.js';

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm Khushboo, your fragrance assistant. Looking for a brand, a specific note, or a recommendation based on what you love or hate? Just ask!",
  suggestions: [
    "Give me all the Ajmal perfumes",
    "I like Raw by Skinn & citrus, but no direct BDC clones",
    "Show me cheap decants under ₹250",
    "Do you have Hawas or Khamrah in stock?",
    "Best rated winter date night scents under ₹2,500"
  ]
};

export default function AiConciergeModal({ isOpen, onClose, onSelectFragrance }) {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const chatEndRef = useRef(null);

  // Restore session history on mount/open
  useEffect(() => {
    if (isOpen) {
      loadSessionHistory(sessionId).then(saved => {
        if (saved && saved.length > 0) {
          const hasWelcome = saved.some(m => m.id === 'welcome');
          setMessages(hasWelcome ? saved : [INITIAL_MESSAGE, ...saved]);
        }
      });
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (userText) => {
    const text = (userText || input).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setLoadingPhase("Khushboo is routing your query across catalog tools...");

    // Persist user turn
    persistChatMessage(sessionId, userMsg);

    const timer1 = setTimeout(() => {
      setLoadingPhase("Querying brand catalog, notes & verified sellers...");
    }, 700);

    const timer2 = setTimeout(() => {
      setLoadingPhase("Synthesizing tailored recommendations & sommelier advice...");
    }, 1500);

    try {
      // Pass full conversation history for ongoing multi-turn context
      const response = await sendChatMessageToKhushboo(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        sessionId
      );

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        tasteSummary: response.tasteSummary,
        matches: response.matches || [],
        suggestions: response.suggestions || [],
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[Khushboo Error]:', err);
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Looks like we have used our daily limit, this is not available right now. Please check back in a little while!",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
      setLoadingPhase('');
    }
  };

  const handleResetChat = () => {
    try {
      localStorage.removeItem(`khushboo_history_${sessionId}`);
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('khushboo_session_id', newSessionId);
    } catch {}
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0b1120] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-[#0f172a] via-[#131d31] to-[#0f172a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b1120] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  Ask Khushboo
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI Fragrance Assistant
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                  Session Synced
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Brand Catalogs • Note Pyramids • Decants • 11 Verified Sellers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Chat Feed */}
        <div className="p-3 sm:p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shrink-0 mt-1">
                    <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[82%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-[#131d31] border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Taste Summary Pill */}
                  {msg.tasteSummary && (
                    <div className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-start gap-2 break-words whitespace-normal leading-relaxed">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="flex-1">{msg.tasteSummary}</span>
                    </div>
                  )}

                  {/* Embedded Recommendations Grid */}
                  {msg.matches && msg.matches.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
                          Khushboo's Curated Matches ({msg.matches.length})
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          Verified Community Stock
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.matches.map((m, idx) => {
                          const matchPct = Math.min(99, Math.max(50, Math.round(Number(m.match_score) || 88)));
                          const rankLabel = idx === 0 ? "🏆 Top Match" : (idx === 1 ? "💎 Direct Twin" : `#${idx + 1} Pick`);

                          return (
                            <div
                              key={m.id || idx}
                              className="group p-3.5 rounded-2xl bg-[#0e172a] hover:bg-[#131f38] border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3 shadow-md"
                            >
                              <div className="space-y-2">
                                
                                {/* Header: Rank & Score */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-mono text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                                    {rankLabel}
                                  </span>
                                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    {matchPct}% Match
                                  </span>
                                </div>

                                {/* Name & Inspiration */}
                                <div>
                                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                                    {m.brand}
                                  </span>
                                  <h4
                                    onClick={() => onSelectFragrance && onSelectFragrance(m)}
                                    className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                                  >
                                    {m.name}
                                  </h4>
                                  {m.dna_inspiration && (
                                    <span className="inline-block mt-0.5 text-[10px] font-mono text-amber-300/90 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                                      Inspired by {m.dna_inspiration}
                                    </span>
                                  )}
                                </div>

                                {/* Why this fits you */}
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/25 text-xs space-y-1">
                                  <div className="flex items-center gap-1 text-cyan-300 font-bold text-[10px] font-mono uppercase">
                                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                                    <span>Why this fits you:</span>
                                  </div>
                                  <p className="text-slate-300 font-sans leading-relaxed text-[11px] sm:text-[12px]">
                                    {m.why}
                                  </p>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {(Number(m.rating_value) || 4.2).toFixed(2)}
                                  </span>
                                  <span>•</span>
                                  <span className="line-clamp-1">{m.dna_type}</span>
                                </div>

                              </div>

                              {/* Price & CTA */}
                              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                <div>
                                  <div className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                                    {m.community_price ? `₹${m.community_price.toLocaleString()}` : (m.lowest_decant_price ? `Decant ₹${m.lowest_decant_price}` : 'Check Stock')}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span>{m.best_seller || 'Verified Seller'}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onSelectFragrance && onSelectFragrance(m)}
                                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/30 flex items-center gap-1 transition-all"
                                >
                                  <span>View</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="text-[11px] font-sans px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-left"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  )}

                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/40 p-0.5 shrink-0 mt-1 flex items-center justify-center text-cyan-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shrink-0 mt-1">
                <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#131d31] border border-slate-800 text-xs text-slate-300 space-y-2 max-w-[80%] rounded-tl-none">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="font-bold text-white font-mono text-xs">
                    {loadingPhase || "Khushboo is thinking..."}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#0f172a] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Ask for a brand (e.g. 'All Ajmal perfumes'), decants under ₹300, or describe notes..."
              className="w-full bg-[#131d31] border border-slate-700/80 focus:border-cyan-400 rounded-2xl px-4 py-3 pr-12 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Press Enter to send • Session & memory persisted across visits
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}