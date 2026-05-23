import { useState, useRef, useEffect } from "react";
import { queryBackend } from "../services/api";

const SUGGESTIONS = [
  "Best hospital for angioplasty under 3 lakh in Nagpur",
  "Affordable knee replacement surgery in Pune",
  "Top cardiac care hospitals in Mumbai under 5 lakh",
  "Cataract surgery cost in Hyderabad",
];

const CITIES = ["Nagpur","Mumbai","Pune","Hyderabad","Delhi","Bengaluru","Chennai","Kolkata","Lucknow","Indore","Ahmedabad","Gurugram"];
const SYMPTOMS = [
  { label:"Chest Pain",       emoji:"💔", query:"heart" },
  { label:"Knee Pain",        emoji:"🦵", query:"knee" },
  { label:"Eye Problem",      emoji:"👁️", query:"cataract" },
  { label:"Back / Spine",     emoji:"🦴", query:"spine" },
  { label:"Kidney Issue",     emoji:"🫘", query:"kidney" },
  { label:"Cancer / Tumour",  emoji:"🔬", query:"cancer" },
  { label:"Hip Pain",         emoji:"🚶", query:"hip" },
  { label:"Appendix Pain",    emoji:"🤒", query:"appendix" },
];

export default function SearchPage({ onResults }) {
  const [inputValue, setInputValue]     = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(null);

  // Voice search
  const [listening, setListening]       = useState(false);
  const recognitionRef                  = useRef(null);

  // Symptom checker
  const [showChecker, setShowChecker]   = useState(false);
  const [step, setStep]                 = useState(1);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [budget, setBudget]             = useState("");

  // Voice search setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputValue(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const toggleVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) { alert("Voice search not supported in this browser. Try Chrome."); return; }
    if (listening) { rec.stop(); setListening(false); }
    else           { rec.start(); setListening(true); }
  };

  const handleSearch = async (queryText) => {
    const q = (queryText || inputValue).trim();
    if (!q) return;
    setLoading(true); setError(null);
    try {
      const data = await queryBackend(q);
      onResults(data, q);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleSuggestion = (text) => {
    setActiveSuggestion(text);
    setInputValue(text);
  };

  // Symptom checker — build query and search
  const handleCheckerSearch = () => {
    if (!selectedSymptom) return;
    const budgetStr = budget ? ` under ${budget} lakh` : "";
    const cityStr   = selectedCity ? ` in ${selectedCity}` : "";
    const q = `Best hospital for ${selectedSymptom.label.toLowerCase()}${budgetStr}${cityStr}`;
    setInputValue(q);
    setShowChecker(false);
    setStep(1);
    handleSearch(q);
  };

  const resetChecker = () => { setStep(1); setSelectedSymptom(null); setSelectedCity(""); setBudget(""); };

  return (
    <div className="search-root">
      <div className="grid-overlay" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      <main className="search-main">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3v8M14 17v8M3 14h8M17 14h8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="4" fill="#22d3ee" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="brand-name">MediNav</span>
        </div>

        {/* Hero */}
        <div className="hero">
          <h1 className="hero-title">
            Find the right care,<br />
            <span className="hero-accent">at the right cost.</span>
          </h1>
          <p className="hero-sub">
            Describe your medical need in plain language — we'll match you with
            the best hospitals, procedures, and cost estimates in seconds.
          </p>
        </div>

        {/* Symptom Checker CTA */}
        <button className="checker-cta" onClick={() => { setShowChecker(true); resetChecker(); }}>
          <span className="checker-pulse" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v3M8 10v.5" stroke="#22d3ee" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Not sure what to search? Try the <strong>Symptom Checker</strong>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="#22d3ee" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Search box */}
        <div className="search-card">
          <div className={`search-input-wrap ${loading ? "loading" : ""}`}>
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="#22d3ee" strokeWidth="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="e.g. Best hospital for angioplasty under 3 lakh in Nagpur"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
              autoFocus
            />
            {/* Voice search button */}
            <button
              className={`voice-btn ${listening ? "voice-btn--active" : ""}`}
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Search by voice"}
              type="button"
            >
              {listening
                ? <span className="voice-wave"><span/><span/><span/><span/></span>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5.5" y="1" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M2 8c0 3.314 2.686 6 6 6s6-2.686 6-6M8 14v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
              }
            </button>
            {inputValue && !loading && (
              <button className="clear-btn" onClick={() => { setInputValue(""); setActiveSuggestion(null); }} aria-label="Clear">✕</button>
            )}
          </div>

          <button
            className={`find-btn ${loading ? "find-btn--loading" : ""}`}
            onClick={() => handleSearch()}
            disabled={loading || !inputValue.trim()}
          >
            {loading
              ? <span className="btn-loading"><span className="spinner" />Analysing...</span>
              : <><span>Find Hospitals</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>
            }
          </button>

          {error && (
            <div className="error-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.2"/>
                <path d="M8 5v4M8 11v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="suggestions">
          <span className="suggestions-label">Try:</span>
          <div className="suggestions-list">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className={`suggestion-chip ${activeSuggestion === s ? "suggestion-chip--active" : ""}`}
                onClick={() => handleSuggestion(s)}
                disabled={loading}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          {[
            { value:"40+",  label:"Hospitals" },
            { value:"15+",  label:"Procedures" },
            { value:"10+",  label:"Cities" },
            { value:"AI",   label:"Powered" },
          ].map((s) => (
            <div key={s.label} className="stat">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* ── Symptom Checker Modal ── */}
      {showChecker && (
        <div className="checker-overlay" onClick={(e) => e.target === e.currentTarget && setShowChecker(false)}>
          <div className="checker-modal">
            <button className="checker-close" onClick={() => setShowChecker(false)}>✕</button>

            {/* Progress bar */}
            <div className="checker-progress">
              {[1,2,3].map(n => (
                <div key={n} className={`progress-step ${step >= n ? "progress-step--active" : ""}`}>
                  <span className="progress-num">{n}</span>
                  <span className="progress-label">{["Symptom","City","Budget"][n-1]}</span>
                </div>
              ))}
              <div className="progress-line">
                <div className="progress-fill" style={{ width: `${(step-1) * 50}%` }} />
              </div>
            </div>

            {/* Step 1 — Select symptom */}
            {step === 1 && (
              <div className="checker-step">
                <h2 className="checker-title">What's bothering you?</h2>
                <p className="checker-sub">Select the closest match to your concern</p>
                <div className="symptom-grid">
                  {SYMPTOMS.map(sym => (
                    <button
                      key={sym.label}
                      className={`symptom-card ${selectedSymptom?.label === sym.label ? "symptom-card--selected" : ""}`}
                      onClick={() => setSelectedSymptom(sym)}
                    >
                      <span className="symptom-emoji">{sym.emoji}</span>
                      <span className="symptom-label">{sym.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="checker-next"
                  disabled={!selectedSymptom}
                  onClick={() => setStep(2)}
                >Next →</button>
              </div>
            )}

            {/* Step 2 — Select city */}
            {step === 2 && (
              <div className="checker-step">
                <h2 className="checker-title">Which city are you in?</h2>
                <p className="checker-sub">We'll find hospitals near you</p>
                <div className="city-grid">
                  {CITIES.map(city => (
                    <button
                      key={city}
                      className={`city-chip ${selectedCity === city ? "city-chip--selected" : ""}`}
                      onClick={() => setSelectedCity(city)}
                    >{city}</button>
                  ))}
                </div>
                <div className="checker-nav">
                  <button className="checker-back-btn" onClick={() => setStep(1)}>← Back</button>
                  <button className="checker-next" onClick={() => setStep(3)}>Next →</button>
                </div>
              </div>
            )}

            {/* Step 3 — Budget */}
            {step === 3 && (
              <div className="checker-step">
                <h2 className="checker-title">What's your budget?</h2>
                <p className="checker-sub">Optional — leave blank if flexible</p>
                <div className="budget-input-wrap">
                  <span className="budget-prefix">₹</span>
                  <input
                    type="number"
                    className="budget-input"
                    placeholder="e.g. 3"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    min="0"
                  />
                  <span className="budget-suffix">Lakh</span>
                </div>
                <div className="budget-presets">
                  {["1","2","3","5","10"].map(v => (
                    <button
                      key={v}
                      className={`budget-preset ${budget === v ? "budget-preset--active" : ""}`}
                      onClick={() => setBudget(v)}
                    >₹{v}L</button>
                  ))}
                </div>
                <div className="checker-summary">
                  <span>🩺 {selectedSymptom?.label}</span>
                  {selectedCity && <span>📍 {selectedCity}</span>}
                  {budget && <span>💰 ₹{budget} Lakh</span>}
                </div>
                <div className="checker-nav">
                  <button className="checker-back-btn" onClick={() => setStep(2)}>← Back</button>
                  <button className="checker-next checker-next--green" onClick={handleCheckerSearch}>
                    Find Hospitals 🔍
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&family=Playfair+Display:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .search-root {
          min-height: 100vh; background: #060d1a;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; color: #e2e8f0;
        }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .orb-1 { width:400px; height:400px; background: radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%); top:-80px; right:-60px; animation: float1 8s ease-in-out infinite; }
        .orb-2 { width:320px; height:320px; background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%); bottom:-60px; left:-40px; animation: float2 10s ease-in-out infinite; }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }

        .search-main {
          position: relative; z-index: 1; width: 100%; max-width: 760px;
          padding: 40px 24px; display: flex; flex-direction: column;
          align-items: center; gap: 28px; animation: fadeUp 0.6s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        .brand { display:flex; align-items:center; gap:10px; }
        .brand-icon { width:44px; height:44px; border-radius:12px; background:rgba(34,211,238,0.08); border:1px solid rgba(34,211,238,0.2); display:flex; align-items:center; justify-content:center; }
        .brand-name { font-size:22px; font-weight:600; letter-spacing:-0.5px; color:#f1f5f9; }

        .hero { text-align:center; }
        .hero-title { font-family:'Playfair Display',serif; font-size:clamp(32px,5vw,52px); font-weight:700; line-height:1.15; color:#f1f5f9; margin-bottom:16px; }
        .hero-accent { color:#22d3ee; }
        .hero-sub { font-size:16px; color:#94a3b8; line-height:1.7; max-width:520px; margin:0 auto; }

        /* ── Symptom checker CTA ── */
        .checker-cta {
          display:flex; align-items:center; gap:8px; position:relative;
          background:rgba(34,211,238,0.06); border:1px solid rgba(34,211,238,0.2);
          border-radius:99px; padding:10px 20px;
          font-family:'DM Sans',sans-serif; font-size:13.5px; color:#94a3b8;
          cursor:pointer; transition:all 0.2s;
        }
        .checker-cta:hover { background:rgba(34,211,238,0.1); color:#e2e8f0; border-color:rgba(34,211,238,0.4); }
        .checker-cta strong { color:#22d3ee; }
        .checker-pulse {
          position:absolute; left:10px; width:8px; height:8px; border-radius:50%;
          background:#22d3ee; animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,211,238,0.4)} 50%{box-shadow:0 0 0 8px rgba(34,211,238,0)} }

        .search-card {
          width:100%; display:flex; flex-direction:column; gap:12px;
          background:rgba(15,23,42,0.7); border:1px solid rgba(34,211,238,0.15);
          border-radius:20px; padding:20px; backdrop-filter:blur(16px);
          box-shadow:0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,211,238,0.05) inset;
        }
        .search-input-wrap {
          display:flex; align-items:center; gap:12px;
          background:rgba(6,13,26,0.8); border:1.5px solid rgba(34,211,238,0.2);
          border-radius:12px; padding:0 16px; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .search-input-wrap:focus-within { border-color:rgba(34,211,238,0.6); box-shadow:0 0 0 3px rgba(34,211,238,0.1); }
        .search-input-wrap.loading { opacity:0.7; }
        .search-icon { flex-shrink:0; }
        .search-input { flex:1; background:transparent; border:none; outline:none; font-family:'DM Sans',sans-serif; font-size:15px; color:#e2e8f0; padding:16px 0; caret-color:#22d3ee; }
        .search-input::placeholder { color:#475569; }

        /* Voice button */
        .voice-btn {
          flex-shrink:0; width:34px; height:34px; border-radius:8px;
          background:transparent; border:1px solid rgba(34,211,238,0.15);
          color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }
        .voice-btn:hover { background:rgba(34,211,238,0.08); color:#22d3ee; border-color:rgba(34,211,238,0.3); }
        .voice-btn--active { background:rgba(248,113,113,0.15); border-color:#f87171; color:#f87171; animation:voicePulse 1s ease-in-out infinite; }
        @keyframes voicePulse { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0.4)} 50%{box-shadow:0 0 0 6px rgba(248,113,113,0)} }
        .voice-wave { display:flex; align-items:center; gap:2px; height:16px; }
        .voice-wave span { width:3px; border-radius:2px; background:#f87171; animation:wave 0.6s ease-in-out infinite; }
        .voice-wave span:nth-child(1){ height:6px; animation-delay:0s; }
        .voice-wave span:nth-child(2){ height:12px; animation-delay:0.1s; }
        .voice-wave span:nth-child(3){ height:16px; animation-delay:0.2s; }
        .voice-wave span:nth-child(4){ height:10px; animation-delay:0.3s; }
        @keyframes wave { 0%,100%{transform:scaleY(0.5)} 50%{transform:scaleY(1)} }

        .clear-btn { background:none; border:none; cursor:pointer; color:#475569; font-size:13px; padding:4px 6px; border-radius:6px; transition:color 0.15s, background 0.15s; }
        .clear-btn:hover { color:#94a3b8; background:rgba(255,255,255,0.05); }

        .find-btn {
          width:100%; padding:15px 24px;
          background:linear-gradient(135deg,#0891b2,#22d3ee);
          border:none; border-radius:12px; font-family:'DM Sans',sans-serif;
          font-size:15px; font-weight:600; color:#060d1a;
          cursor:pointer; transition:opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
          box-shadow:0 4px 20px rgba(34,211,238,0.3);
        }
        .find-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 8px 28px rgba(34,211,238,0.4); }
        .find-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .find-btn--loading { background:linear-gradient(135deg,#0e7490,#0891b2); }
        .btn-loading { display:flex; align-items:center; gap:8px; }
        .spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(6,13,26,0.3); border-top-color:#060d1a; animation:spin 0.7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .error-banner { display:flex; align-items:center; gap:8px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.25); border-radius:10px; padding:10px 14px; font-size:13px; color:#fca5a5; }

        .suggestions { width:100%; }
        .suggestions-label { font-size:12px; color:#475569; text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:10px; }
        .suggestions-list { display:flex; flex-wrap:wrap; gap:8px; }
        .suggestion-chip { background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.15); border-radius:99px; padding:6px 14px; font-family:'DM Sans',sans-serif; font-size:12.5px; color:#94a3b8; cursor:pointer; transition:all 0.18s; }
        .suggestion-chip:hover:not(:disabled) { background:rgba(34,211,238,0.1); border-color:rgba(34,211,238,0.35); color:#e2e8f0; }
        .suggestion-chip--active { background:rgba(34,211,238,0.12); border-color:rgba(34,211,238,0.4); color:#22d3ee; }
        .suggestion-chip:disabled { opacity:0.4; cursor:not-allowed; }

        .stats-bar { display:flex; gap:32px; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding-top:28px; width:100%; justify-content:center; flex-wrap:wrap; }
        .stat { text-align:center; }
        .stat-value { display:block; font-size:22px; font-weight:600; color:#22d3ee; line-height:1; }
        .stat-label { display:block; font-size:11.5px; color:#475569; margin-top:4px; text-transform:uppercase; letter-spacing:0.08em; }

        /* ── Symptom Checker Modal ── */
        .checker-overlay {
          position:fixed; inset:0; z-index:100;
          background:rgba(3,9,18,0.85); backdrop-filter:blur(8px);
          display:flex; align-items:center; justify-content:center;
          padding:24px; animation:fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .checker-modal {
          background:#0a1628; border:1px solid rgba(34,211,238,0.18);
          border-radius:24px; padding:36px; width:100%; max-width:560px;
          position:relative; animation:slideUp 0.3s ease;
          box-shadow:0 40px 80px rgba(0,0,0,0.6);
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .checker-close { position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.05); border:none; color:#475569; font-size:14px; width:30px; height:30px; border-radius:6px; cursor:pointer; transition:all 0.15s; }
        .checker-close:hover { color:#e2e8f0; background:rgba(255,255,255,0.1); }

        .checker-progress { display:flex; align-items:center; gap:0; margin-bottom:32px; position:relative; }
        .progress-line { position:absolute; top:14px; left:14px; right:14px; height:2px; background:rgba(255,255,255,0.06); z-index:0; }
        .progress-fill { height:100%; background:#22d3ee; transition:width 0.4s ease; }
        .progress-step { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; position:relative; z-index:1; }
        .progress-num { width:28px; height:28px; border-radius:50%; background:#0d2030; border:2px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; color:#475569; transition:all 0.3s; }
        .progress-step--active .progress-num { border-color:#22d3ee; color:#22d3ee; background:rgba(34,211,238,0.1); }
        .progress-label { font-size:11px; color:#475569; }
        .progress-step--active .progress-label { color:#22d3ee; }

        .checker-step { display:flex; flex-direction:column; gap:20px; }
        .checker-title { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:#f1f5f9; }
        .checker-sub { font-size:14px; color:#475569; margin-top:-12px; }

        .symptom-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .symptom-card { background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:14px 8px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all 0.2s; }
        .symptom-card:hover { border-color:rgba(34,211,238,0.3); background:rgba(34,211,238,0.06); }
        .symptom-card--selected { border-color:#22d3ee; background:rgba(34,211,238,0.1); }
        .symptom-emoji { font-size:24px; }
        .symptom-label { font-size:11.5px; color:#94a3b8; text-align:center; }
        .symptom-card--selected .symptom-label { color:#22d3ee; }

        .city-grid { display:flex; flex-wrap:wrap; gap:8px; }
        .city-chip { background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.06); border-radius:99px; padding:8px 16px; font-family:'DM Sans',sans-serif; font-size:13px; color:#94a3b8; cursor:pointer; transition:all 0.18s; }
        .city-chip:hover { border-color:rgba(34,211,238,0.3); color:#e2e8f0; }
        .city-chip--selected { border-color:#22d3ee; background:rgba(34,211,238,0.1); color:#22d3ee; }

        .budget-input-wrap { display:flex; align-items:center; gap:0; background:rgba(6,13,26,0.8); border:1.5px solid rgba(34,211,238,0.2); border-radius:12px; overflow:hidden; }
        .budget-prefix,.budget-suffix { padding:14px 16px; font-size:15px; color:#475569; background:rgba(34,211,238,0.04); }
        .budget-input { flex:1; background:transparent; border:none; outline:none; font-family:'DM Sans',sans-serif; font-size:18px; font-weight:600; color:#22d3ee; padding:14px 12px; text-align:center; caret-color:#22d3ee; }

        .budget-presets { display:flex; gap:8px; flex-wrap:wrap; }
        .budget-preset { background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.15); border-radius:99px; padding:6px 14px; font-family:'DM Sans',sans-serif; font-size:13px; color:#94a3b8; cursor:pointer; transition:all 0.18s; }
        .budget-preset:hover { background:rgba(34,211,238,0.1); color:#e2e8f0; }
        .budget-preset--active { background:rgba(34,211,238,0.15); border-color:#22d3ee; color:#22d3ee; }

        .checker-summary { display:flex; flex-wrap:wrap; gap:10px; padding:14px 16px; background:rgba(34,211,238,0.04); border:1px solid rgba(34,211,238,0.1); border-radius:12px; }
        .checker-summary span { font-size:13px; color:#94a3b8; background:rgba(255,255,255,0.04); border-radius:99px; padding:4px 12px; }

        .checker-nav { display:flex; gap:10px; }
        .checker-back-btn { background:transparent; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 20px; font-family:'DM Sans',sans-serif; font-size:14px; color:#475569; cursor:pointer; transition:all 0.15s; }
        .checker-back-btn:hover { border-color:rgba(255,255,255,0.2); color:#94a3b8; }
        .checker-next { flex:1; background:linear-gradient(135deg,#0891b2,#22d3ee); border:none; border-radius:10px; padding:12px 20px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; color:#060d1a; cursor:pointer; transition:opacity 0.2s; }
        .checker-next:disabled { opacity:0.35; cursor:not-allowed; }
        .checker-next--green { background:linear-gradient(135deg,#059669,#10b981); }
      `}</style>
    </div>
  );
}
