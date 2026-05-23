import { useState } from "react";
import HospitalCard from "../components/HospitalCard";
import HospitalComparison from "../components/HospitalComparison";
import DataVisualizations from "../components/DataVisualizations";
import ChatAssistant from "../components/ChatAssistant";

export default function ResultsPage({ results, query, onBack, theme, onToggleTheme }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    condition, procedure, specialist,
    estimated_cost_min, estimated_cost_max,
    estimated_cost_label, ai_summary,
    hospitals = [], budget_feasible,
  } = results || {};

  const formatINR = (val) => {
    if (!val) return null;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  const costDisplay = estimated_cost_label ||
    (estimated_cost_min && estimated_cost_max
      ? `${formatINR(estimated_cost_min)} – ${formatINR(estimated_cost_max)}`
      : "Contact hospital for pricing");

  const toggleCompare = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  return (
    <div className={`results-root ${theme === "light" ? "results-root--light" : ""}`}>
      <div className="grid-overlay" aria-hidden="true" />
      <div className="orb-r1" aria-hidden="true" />

      {/* ── Top Nav ── */}
      <header className="results-nav">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New Search
        </button>
        <div className="brand-mini">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <path d="M14 3v8M14 17v8M3 14h8M17 14h8" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="4" fill="#22d3ee" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="1.5"/>
          </svg>
          <span>MediNav</span>
        </div>
        <div className="nav-right">
          <div className="query-pill">"{query}"</div>
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light"
              ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V1M8 15v-2M3 8H1M15 8h-2M4.22 4.22L2.8 2.8M13.2 13.2l-1.42-1.42M4.22 11.78L2.8 13.2M13.2 2.8l-1.42 1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3"/></svg>
              : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 10.5A6 6 0 015.5 2.5a6 6 0 108 8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            }
          </button>
        </div>
      </header>

      <main className="results-main">

        {/* ── Summary Cards ── */}
        <section className="summary-section">
          <h2 className="section-title">
            <span className="section-dot" />
            Analysis Summary
          </h2>
          <div className="summary-grid">
            <div className="summary-card summary-card--condition">
              <div className="scard-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM10 6v4M10 13v.5" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="scard-label">Identified Condition</span>
                <p className="scard-value">{condition || "—"}</p>
              </div>
            </div>

            <div className="summary-card summary-card--procedure">
              <div className="scard-icon scard-icon--purple">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M10 4l6 6-6 6" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <span className="scard-label">Recommended Procedure</span>
                <p className="scard-value">{procedure || "—"}</p>
              </div>
            </div>

            {specialist && (
              <div className="summary-card">
                <div className="scard-icon scard-icon--amber">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.5" stroke="#fbbf24" strokeWidth="1.5"/>
                    <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <span className="scard-label">Specialist Required</span>
                  <p className="scard-value">{specialist}</p>
                </div>
              </div>
            )}

            <div className="summary-card summary-card--cost">
              <div className="scard-icon scard-icon--green">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v14M6 6.5C6 5.12 7.79 4 10 4s4 1.12 4 2.5-1.79 2.5-4 2.5-4 1.12-4 2.5S7.79 14 10 14s4-1.12 4-2.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="scard-label">Estimated Treatment Cost</span>
                <p className="scard-value scard-value--cost">{costDisplay}</p>
                {budget_feasible !== undefined && (
                  <span className={`budget-tag ${budget_feasible ? "budget-tag--ok" : "budget-tag--warn"}`}>
                    {budget_feasible ? "✓ Within your budget" : "⚠ May exceed budget"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {ai_summary && (
            <div className="ai-summary">
              <div className="ai-summary-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z" stroke="#22d3ee" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                AI Insight
              </div>
              <p className="ai-summary-text">{ai_summary}</p>
            </div>
          )}
        </section>

        {/* ── Data Visualizations ── */}
        <DataVisualizations results={results} />

        {/* ── Hospital Results ── */}
        <section className="hospitals-section">
          <div className="hospitals-header">
            <h2 className="section-title">
              <span className="section-dot section-dot--purple" />
              {hospitals.length > 0
                ? `${hospitals.length} Hospital${hospitals.length > 1 ? "s" : ""} Found`
                : "Hospital Results"}
            </h2>
            <div className="hospitals-header-right">
              {selectedIds.length > 0 && (
                <span className="compare-hint">{selectedIds.length} selected for comparison</span>
              )}
              {hospitals.length > 0 && (
                <span className="sort-label">Sorted by rating & cost fit</span>
              )}
            </div>
          </div>

          {hospitals.length > 0 ? (
            <div className="hospitals-grid">
              {hospitals.map((h, i) => (
                <div
                  key={h.id || h.name || i}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="hospital-item"
                >
                  <HospitalCard
                    hospital={h}
                    rank={i + 1}
                    isSelected={selectedIds.includes(h.id)}
                    onCompare={() => toggleCompare(h.id)}
                    canCompare={selectedIds.length < 4 || selectedIds.includes(h.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="rgba(34,211,238,0.2)" strokeWidth="1.5"/>
                <path d="M24 16v8M24 28v.5" stroke="rgba(34,211,238,0.5)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>No hospitals found matching your criteria.</p>
              <p className="empty-sub">Try adjusting your budget or location.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="results-footer">
        Powered by AI · Data is indicative. Always consult a medical professional.
      </footer>

      {/* ── Hospital Comparison Bar ── */}
      <HospitalComparison
        hospitals={hospitals}
        selected={selectedIds}
        onToggle={toggleCompare}
        onClear={() => setSelectedIds([])}
      />

      {/* ── AI Chat Assistant ── */}
      <ChatAssistant results={results} query={query} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── Theme variables ── */
        .results-root {
          --bg:       #060d1a;
          --bg-card:  rgba(15,23,42,0.7);
          --bg-input: rgba(6,13,26,0.8);
          --border:   rgba(255,255,255,0.06);
          --text-primary: #f1f5f9;
          --text-muted:   #94a3b8;
          --text-dim:     #475569;
          --nav-bg: rgba(6,13,26,0.85);
          min-height:100vh; background:var(--bg);
          font-family:'DM Sans',sans-serif; color:var(--text-primary);
          position:relative; overflow-x:hidden;
          transition:background 0.3s, color 0.3s;
        }
        .results-root--light {
          --bg:       #f0f4f8;
          --bg-card:  rgba(255,255,255,0.85);
          --bg-input: rgba(241,245,249,0.9);
          --border:   rgba(0,0,0,0.08);
          --text-primary: #0f172a;
          --text-muted:   #334155;
          --text-dim:     #64748b;
          --nav-bg: rgba(240,244,248,0.92);
        }

        .grid-overlay {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image: linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%);
        }
        .orb-r1 {
          position:fixed; top:-100px; right:-100px; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%);
          filter:blur(60px); pointer-events:none; z-index:0;
        }

        /* ── Nav ── */
        .results-nav {
          position:sticky; top:0; z-index:10;
          display:flex; align-items:center; gap:16px; padding:14px 32px;
          background:var(--nav-bg); backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(34,211,238,0.08);
          animation:slideDown 0.4s ease;
        }
        @keyframes slideDown { from{transform:translateY(-100%)} to{transform:translateY(0)} }

        .back-btn {
          display:flex; align-items:center; gap:6px;
          background:rgba(34,211,238,0.06); border:1px solid rgba(34,211,238,0.18);
          border-radius:8px; padding:7px 14px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:var(--text-muted);
          cursor:pointer; transition:all 0.18s;
        }
        .back-btn:hover { color:#22d3ee; border-color:rgba(34,211,238,0.35); }

        .brand-mini { display:flex; align-items:center; gap:7px; font-size:15px; font-weight:600; color:var(--text-primary); }

        .nav-right { margin-left:auto; display:flex; align-items:center; gap:10px; }
        .query-pill {
          background:rgba(34,211,238,0.06); border:1px solid rgba(34,211,238,0.12);
          border-radius:99px; padding:5px 14px; font-size:12.5px; color:#64748b;
          max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }

        /* Theme toggle */
        .theme-toggle {
          width:34px; height:34px; border-radius:8px;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          color:var(--text-dim); cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.18s;
        }
        .theme-toggle:hover { color:#22d3ee; border-color:rgba(34,211,238,0.3); background:rgba(34,211,238,0.06); }

        /* ── Main ── */
        .results-main {
          position:relative; z-index:1; max-width:1080px; margin:0 auto;
          padding:40px 24px 120px;
          display:flex; flex-direction:column; gap:48px;
        }

        .section-title {
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
          color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em;
          display:flex; align-items:center; gap:8px; margin-bottom:20px;
        }
        .section-dot { width:6px; height:6px; border-radius:50%; background:#22d3ee; flex-shrink:0; }
        .section-dot--purple { background:#818cf8; }

        /* ── Summary ── */
        .summary-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px,1fr)); gap:14px; }
        .summary-card {
          display:flex; align-items:flex-start; gap:14px;
          background:var(--bg-card); border-radius:16px; padding:18px 20px;
          backdrop-filter:blur(12px); border:1px solid var(--border);
          transition:border-color 0.2s; animation:fadeUp 0.5s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .summary-card:nth-child(2){animation-delay:0.08s}
        .summary-card:nth-child(3){animation-delay:0.14s}
        .summary-card:nth-child(4){animation-delay:0.20s}
        .summary-card:hover { border-color:rgba(34,211,238,0.18); }

        .scard-icon { width:40px; height:40px; flex-shrink:0; border-radius:10px; background:rgba(34,211,238,0.08); border:1px solid rgba(34,211,238,0.18); display:flex; align-items:center; justify-content:center; }
        .scard-icon--purple { background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.2); }
        .scard-icon--amber  { background:rgba(251,191,36,0.08);  border-color:rgba(251,191,36,0.2); }
        .scard-icon--green  { background:rgba(74,222,128,0.08);  border-color:rgba(74,222,128,0.2); }

        .scard-label { font-size:11px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:5px; }
        .scard-value { font-size:17px; font-weight:600; color:var(--text-primary); line-height:1.3; }
        .scard-value--cost { color:#22d3ee; }

        .budget-tag { display:inline-block; margin-top:6px; border-radius:99px; padding:2px 10px; font-size:11.5px; font-weight:500; }
        .budget-tag--ok { background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.25); color:#4ade80; }
        .budget-tag--warn { background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.25); color:#fbbf24; }

        .ai-summary { margin-top:16px; background:rgba(34,211,238,0.04); border:1px solid rgba(34,211,238,0.12); border-left:3px solid #22d3ee; border-radius:12px; padding:16px 20px; animation:fadeUp 0.5s 0.3s ease both; }
        .ai-summary-icon { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:#22d3ee; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; }
        .ai-summary-text { font-size:14px; color:var(--text-muted); line-height:1.7; }

        /* ── Hospitals ── */
        .hospitals-section {}
        .hospitals-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
        .hospitals-header .section-title { margin-bottom:0; }
        .hospitals-header-right { display:flex; align-items:center; gap:12px; }
        .compare-hint { font-size:12px; color:#22d3ee; background:rgba(34,211,238,0.08); border:1px solid rgba(34,211,238,0.2); border-radius:99px; padding:4px 12px; }
        .sort-label { font-size:12px; color:#334155; }

        .hospitals-grid { display:grid; gap:20px; margin-top:20px; grid-template-columns:repeat(auto-fill, minmax(320px,1fr)); }
        .hospital-item { opacity:0; animation:fadeUp 0.4s ease forwards; }

        .empty-state { text-align:center; padding:64px 24px; background:rgba(15,23,42,0.5); border:1px dashed rgba(34,211,238,0.15); border-radius:16px; margin-top:20px; display:flex; flex-direction:column; align-items:center; gap:14px; }
        .empty-state p { color:#64748b; font-size:15px; }
        .empty-sub { font-size:13px !important; color:#334155 !important; }

        .results-footer { position:relative; z-index:1; text-align:center; padding:20px; font-size:12px; color:#1e293b; border-top:1px solid rgba(255,255,255,0.04); }

        @media(max-width:600px) {
          .results-nav { padding:12px 16px; }
          .query-pill { display:none; }
          .results-main { padding:24px 16px 120px; }
          .hospitals-grid { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
