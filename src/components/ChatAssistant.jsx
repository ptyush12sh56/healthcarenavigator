import { useState, useRef, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

const QUICK_QUESTIONS = [
  "Which hospital is cheapest?",
  "Which one has NABH accreditation?",
  "Government or private — which is better?",
  "How far are these hospitals?",
];

export default function ChatAssistant({ results, query }) {
  const [open, setOpen]       = useState(false);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: results?.condition
        ? `Hi! 👋 I've analysed the results for "${query}".\nI found ${results.total_found || 0} hospitals for **${results.condition}**. Ask me anything!`
        : `Hi! 👋 I'm your MediNav AI assistant.\nAsk me anything about hospitals, costs, or procedures.`,
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Build compact context object from results
  const buildContext = () => {
    if (!results) return null;
    return {
      condition:  results.condition  || null,
      procedure:  results.procedure  || null,
      city:       results.query_city || null,
      cost_label: results.estimated_cost_label || null,
      hospitals:  (results.hospitals || []).slice(0, 6).map(h => ({
        name:        h.name,
        rating:      h.rating,
        cost:        h.cost,
        category:    h.category,
        accreditation: h.accreditation,
        distance:    h.distance,
        available_beds: h.available_beds,
      })),
    };
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", text: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history to send (exclude the initial greeting)
    const chatHistory = [...history, userMsg];

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          context: buildContext(),
          history: history,   // send previous turns for multi-turn context
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const reply = data.reply || "I couldn't generate a response. Please try again.";

      const assistantMsg = { role: "assistant", text: reply };
      setMessages(prev => [...prev, assistantMsg]);
      // Keep history trimmed to last 10 messages
      setHistory(chatHistory.concat(assistantMsg).slice(-10));

    } catch (err) {
      const errMsg = { role: "assistant", text: "Sorry, I can't connect to the server right now. Make sure the backend is running on port 8000." };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        className={`chat-bubble ${open ? "chat-bubble--open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI assistant"
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          : <>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 12.5C4 8.358 7.134 5 11 5s7 3.358 7 7.5c0 1.5-.42 2.9-1.14 4.07L18 19l-3-.5A7.87 7.87 0 0111 19c-3.866 0-7-3.134-7-6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 12h6M8 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="chat-badge">AI</span>
            </>
        }
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-avatar">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                <path d="M4 12.5C4 8.358 7.134 5 11 5s7 3.358 7 7.5c0 1.5-.42 2.9-1.14 4.07L18 19l-3-.5A7.87 7.87 0 0111 19c-3.866 0-7-3.134-7-6.5z" stroke="#22d3ee" strokeWidth="1.5"/>
                <path d="M8 12h6M8 9h4" stroke="#22d3ee" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="chat-header-info">
              <p className="chat-name">MediNav Assistant</p>
              <p className="chat-status"><span className="dot" />Online · AI-powered</p>
            </div>
            <button className="chat-header-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg msg--${m.role}`}>
                {m.role === "assistant" && (
                  <div className="msg-ava">
                    <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
                      <path d="M4 12.5C4 8.358 7.134 5 11 5s7 3.358 7 7.5c0 1.5-.42 2.9-1.14 4.07L18 19l-3-.5A7.87 7.87 0 0111 19c-3.866 0-7-3.134-7-6.5z" stroke="#22d3ee" strokeWidth="1.5"/>
                    </svg>
                  </div>
                )}
                <div className="msg-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg msg--assistant">
                <div className="msg-ava">
                  <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
                    <path d="M4 12.5C4 8.358 7.134 5 11 5s7 3.358 7 7.5c0 1.5-.42 2.9-1.14 4.07L18 19l-3-.5A7.87 7.87 0 0111 19c-3.866 0-7-3.134-7-6.5z" stroke="#22d3ee" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="msg-bubble typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="quick-qs">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} className="quick-q" onClick={() => sendMessage(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask about costs, ratings, accreditation..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
              disabled={loading}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .chat-bubble {
          position:fixed; bottom:28px; right:28px; z-index:200;
          width:56px; height:56px; border-radius:50%;
          background:linear-gradient(135deg,#0891b2,#22d3ee);
          border:none; cursor:pointer; color:#060d1a;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 32px rgba(34,211,238,0.45);
          transition:transform 0.2s, box-shadow 0.2s;
          animation:popIn 0.4s 1.2s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes popIn { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
        .chat-bubble:hover { transform:scale(1.1); box-shadow:0 12px 40px rgba(34,211,238,0.55); }
        .chat-bubble--open { background:linear-gradient(135deg,#334155,#475569); box-shadow:0 4px 16px rgba(0,0,0,0.3); }
        .chat-badge {
          position:absolute; top:-4px; right:-4px;
          background:#f87171; color:#fff; font-size:9px; font-weight:700;
          padding:2px 5px; border-radius:99px; border:2px solid #060d1a;
          animation:popIn 0.4s 1.6s cubic-bezier(.34,1.56,.64,1) both;
        }

        .chat-window {
          position:fixed; bottom:96px; right:28px; z-index:200;
          width:340px; max-height:540px;
          background:#0a1628; border:1px solid rgba(34,211,238,0.2);
          border-radius:20px; display:flex; flex-direction:column;
          box-shadow:0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(34,211,238,0.05) inset;
          animation:slideUp 0.28s cubic-bezier(.4,0,.2,1);
          font-family:'DM Sans',sans-serif; overflow:hidden;
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

        .chat-header {
          display:flex; align-items:center; gap:10px; padding:14px 14px 12px;
          border-bottom:1px solid rgba(255,255,255,0.05); flex-shrink:0;
        }
        .chat-avatar { width:36px; height:36px; flex-shrink:0; border-radius:10px; background:rgba(34,211,238,0.08); border:1px solid rgba(34,211,238,0.22); display:flex; align-items:center; justify-content:center; }
        .chat-header-info { flex:1; }
        .chat-name { font-size:13.5px; font-weight:600; color:#f1f5f9; }
        .chat-status { display:flex; align-items:center; gap:5px; font-size:11px; color:#475569; margin-top:1px; }
        .dot { width:6px; height:6px; border-radius:50%; background:#4ade80; flex-shrink:0; }
        .chat-header-close { background:rgba(255,255,255,0.04); border:none; color:#334155; width:28px; height:28px; border-radius:7px; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
        .chat-header-close:hover { color:#94a3b8; background:rgba(255,255,255,0.08); }

        .chat-messages { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:10px; min-height:0; }
        .chat-messages::-webkit-scrollbar { width:3px; }
        .chat-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:2px; }

        .msg { display:flex; gap:7px; align-items:flex-end; }
        .msg--user { flex-direction:row-reverse; }
        .msg-ava { width:26px; height:26px; border-radius:8px; background:rgba(34,211,238,0.07); border:1px solid rgba(34,211,238,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .msg-bubble { max-width:80%; padding:9px 12px; border-radius:14px; font-size:13px; line-height:1.55; white-space:pre-wrap; word-break:break-word; }
        .msg--assistant .msg-bubble { background:rgba(15,31,58,0.9); border:1px solid rgba(255,255,255,0.05); color:#94a3b8; border-bottom-left-radius:4px; }
        .msg--user .msg-bubble { background:linear-gradient(135deg,#0891b2,#22d3ee); color:#060d1a; font-weight:500; border-bottom-right-radius:4px; }
        .msg-bubble.typing { display:flex; align-items:center; gap:4px; padding:12px 16px; }
        .typing span { width:6px; height:6px; border-radius:50%; background:#334155; animation:blink 1.2s ease-in-out infinite; }
        .typing span:nth-child(2){animation-delay:.2s}
        .typing span:nth-child(3){animation-delay:.4s}
        @keyframes blink { 0%,100%{opacity:.3;transform:translateY(0)} 50%{opacity:1;transform:translateY(-3px)} }

        .quick-qs { padding:8px 10px; display:flex; flex-wrap:wrap; gap:5px; border-top:1px solid rgba(255,255,255,0.04); flex-shrink:0; }
        .quick-q { background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.14); border-radius:99px; padding:4px 9px; font-family:'DM Sans',sans-serif; font-size:11px; color:#475569; cursor:pointer; transition:all 0.15s; text-align:left; }
        .quick-q:hover:not(:disabled) { background:rgba(34,211,238,0.1); color:#22d3ee; border-color:rgba(34,211,238,0.3); }
        .quick-q:disabled { opacity:0.35; cursor:not-allowed; }

        .chat-input-row { display:flex; gap:7px; padding:10px 12px; border-top:1px solid rgba(255,255,255,0.05); flex-shrink:0; }
        .chat-input { flex:1; background:rgba(6,13,26,0.9); border:1.5px solid rgba(34,211,238,0.14); border-radius:10px; padding:9px 12px; font-family:'DM Sans',sans-serif; font-size:13px; color:#e2e8f0; outline:none; transition:border-color 0.2s; caret-color:#22d3ee; }
        .chat-input:focus { border-color:rgba(34,211,238,0.38); }
        .chat-input::placeholder { color:#283548; }
        .chat-send { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,#0891b2,#22d3ee); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#060d1a; flex-shrink:0; transition:opacity 0.2s, transform 0.15s; }
        .chat-send:hover:not(:disabled) { transform:scale(1.05); }
        .chat-send:disabled { opacity:0.38; cursor:not-allowed; }

        @media(max-width:420px) { .chat-window { width:calc(100vw - 24px); right:12px; } }
      `}</style>
    </>
  );
}
