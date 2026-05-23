export default function HospitalCard({ hospital, rank, isSelected, onCompare, canCompare }) {
  const {
    name, rating, distance, cost, category,
    address, speciality, available_beds, accreditation, summary,
  } = hospital;

  const categoryConfig = {
    "Government":      { bg:"#052e16", border:"#16a34a", text:"#4ade80", dot:"#22c55e" },
    "Private":         { bg:"#1e1b4b", border:"#6366f1", text:"#a5b4fc", dot:"#818cf8" },
    "Trust":           { bg:"#1c1917", border:"#a16207", text:"#fbbf24", dot:"#f59e0b" },
    "Multi-Specialty": { bg:"#0f172a", border:"#0891b2", text:"#22d3ee", dot:"#06b6d4" },
  };
  const cat = categoryConfig[category] || categoryConfig["Private"];

  const ratingColor = rating >= 4.5 ? "#22d3ee" : rating >= 4.0 ? "#4ade80" : rating >= 3.5 ? "#fbbf24" : "#f87171";

  const formatCost = (val) => {
    if (!val) return "—";
    if (val >= 100000) return `₹${(val/100000).toFixed(1)}L`;
    return `₹${(val/1000).toFixed(0)}K`;
  };

  const stars = (r) => Array.from({length:5},(_,i) => {
    if (i < Math.floor(r)) return "\u2605";
    if (i === Math.floor(r) && r % 1 >= 0.5) return "\u00BD";
    return "\u2606";
  }).join("");

  return (
    <div className={`hcard ${isSelected ? "hcard--selected" : ""}`}>
      <div className="hcard-rank">#{rank}</div>

      {/* Compare checkbox */}
      <button
        className={`hcard-compare ${isSelected ? "hcard-compare--active" : ""} ${!canCompare && !isSelected ? "hcard-compare--disabled" : ""}`}
        onClick={onCompare}
        title={isSelected ? "Remove from comparison" : "Add to comparison"}
      >
        {isSelected
          ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#060d1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        }
        {isSelected ? "Added" : "Compare"}
      </button>

      {/* Header */}
      <div className="hcard-header">
        <div className="hcard-avatar">{name?.charAt(0) || "H"}</div>
        <div className="hcard-title-block">
          <h3 className="hcard-name">{name}</h3>
          {address && <p className="hcard-address">{address}</p>}
        </div>
        <div className="hcard-category" style={{ background:cat.bg, border:`1px solid ${cat.border}`, color:cat.text }}>
          <span className="cat-dot" style={{ background:cat.dot }} />
          {category || "Hospital"}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="hcard-summary">
          <span className="hcard-summary-icon">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#22d3ee" strokeWidth="1.3"/>
              <path d="M8 7v4M8 5.5v.5" stroke="#22d3ee" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </span>
          <p className="hcard-summary-text">{summary}</p>
        </div>
      )}

      <div className="hcard-divider" />

      {/* Stats */}
      <div className="hcard-stats">
        <div className="hcard-stat">
          <span className="stat-label">Rating</span>
          <div className="stat-rating">
            <span className="rating-num" style={{ color:ratingColor }}>{rating ?? "—"}</span>
            <span className="rating-stars" style={{ color:ratingColor }}>{rating ? stars(rating) : ""}</span>
          </div>
        </div>
        <div className="hcard-stat">
          <span className="stat-label">Distance</span>
          <span className="stat-value">{distance ? `${distance} km` : "—"}</span>
        </div>
        <div className="hcard-stat">
          <span className="stat-label">Est. Cost</span>
          <span className="stat-value stat-value--cost">{formatCost(cost)}</span>
        </div>
        {available_beds != null && (
          <div className="hcard-stat">
            <span className="stat-label">Beds</span>
            <span className="stat-value">{available_beds}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="hcard-footer">
        {speciality && <span className="tag tag--teal">{speciality}</span>}
        {accreditation && <span className="tag tag--purple">{accreditation}</span>}
        <button className="hcard-cta">View Details →</button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .hcard {
          position:relative; background:rgba(15,23,42,0.85);
          border:1px solid rgba(34,211,238,0.12); border-radius:18px; padding:22px;
          font-family:'DM Sans',sans-serif;
          transition:transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          backdrop-filter:blur(12px); animation:cardIn 0.4s ease both;
        }
        .hcard:hover { transform:translateY(-3px); border-color:rgba(34,211,238,0.28); box-shadow:0 16px 48px rgba(0,0,0,0.3); }
        .hcard--selected { border-color:rgba(34,211,238,0.6) !important; box-shadow:0 0 0 2px rgba(34,211,238,0.15), 0 16px 48px rgba(0,0,0,0.3) !important; }
        @keyframes cardIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .hcard-rank { position:absolute; top:-12px; left:22px; background:linear-gradient(135deg,#0891b2,#22d3ee); color:#060d1a; font-size:11px; font-weight:700; padding:3px 10px; border-radius:99px; letter-spacing:0.04em; }

        /* Compare button */
        .hcard-compare {
          position:absolute; top:-12px; right:22px;
          display:flex; align-items:center; gap:5px;
          background:rgba(15,23,42,0.9); border:1px solid rgba(34,211,238,0.25);
          border-radius:99px; padding:3px 10px 3px 8px;
          font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600;
          color:#64748b; cursor:pointer; transition:all 0.18s;
        }
        .hcard-compare:hover:not(.hcard-compare--disabled) { border-color:rgba(34,211,238,0.5); color:#22d3ee; }
        .hcard-compare--active { background:linear-gradient(135deg,#0891b2,#22d3ee); border-color:transparent; color:#060d1a; }
        .hcard-compare--disabled { opacity:0.35; cursor:not-allowed; }

        .hcard-header { display:flex; align-items:flex-start; gap:14px; margin-top:8px; }
        .hcard-avatar { width:46px; height:46px; flex-shrink:0; border-radius:12px; background:linear-gradient(135deg,rgba(8,145,178,0.2),rgba(34,211,238,0.1)); border:1px solid rgba(34,211,238,0.2); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; color:#22d3ee; }
        .hcard-title-block { flex:1; min-width:0; }
        .hcard-name { font-size:16px; font-weight:600; color:#f1f5f9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
        .hcard-address { font-size:12px; color:#475569; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .hcard-category { flex-shrink:0; border-radius:99px; padding:4px 11px; font-size:12px; font-weight:500; display:flex; align-items:center; gap:5px; }
        .cat-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

        .hcard-summary { display:flex; align-items:flex-start; gap:8px; margin-top:14px; padding:11px 14px; background:rgba(34,211,238,0.04); border:1px solid rgba(34,211,238,0.1); border-left:3px solid rgba(34,211,238,0.5); border-radius:10px; }
        .hcard-summary-icon { flex-shrink:0; margin-top:2px; opacity:0.85; }
        .hcard-summary-text { font-size:12.5px; line-height:1.65; color:#94a3b8; margin:0; }

        .hcard-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(34,211,238,0.12),transparent); margin:16px 0; }

        .hcard-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(80px,1fr)); gap:12px; }
        .hcard-stat { display:flex; flex-direction:column; gap:4px; background:rgba(6,13,26,0.5); border-radius:10px; padding:10px 12px; border:1px solid rgba(255,255,255,0.04); }
        .stat-label { font-size:10.5px; color:#475569; text-transform:uppercase; letter-spacing:0.08em; }
        .stat-value { font-size:15px; font-weight:600; color:#e2e8f0; }
        .stat-value--cost { color:#22d3ee; }
        .stat-rating { display:flex; align-items:baseline; gap:5px; }
        .rating-num { font-size:18px; font-weight:700; }
        .rating-stars { font-size:11px; letter-spacing:1px; }

        .hcard-footer { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:16px; }
        .tag { border-radius:99px; padding:4px 11px; font-size:12px; font-weight:500; }
        .tag--teal { background:rgba(34,211,238,0.08); border:1px solid rgba(34,211,238,0.2); color:#22d3ee; }
        .tag--purple { background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.2); color:#a5b4fc; }
        .hcard-cta { margin-left:auto; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:#0891b2; padding:4px 0; transition:color 0.15s; }
        .hcard-cta:hover { color:#22d3ee; }
      `}</style>
    </div>
  );
}
