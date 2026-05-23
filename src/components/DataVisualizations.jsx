import { useState } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────
function CostBar({ hospital, maxCost, rank }) {
  const pct = maxCost > 0 ? Math.min((hospital.cost || 0) / maxCost, 1) : 0;
  const fmt = v => !v ? "N/A" : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`;
  const isLowest = rank === 0;
  return (
    <div className={`cbar-row ${isLowest ? "cbar-row--best" : ""}`}>
      {isLowest && <span className="best-tag">Cheapest</span>}
      <div className="cbar-name" title={hospital.name}>
        {hospital.name?.split(" ").slice(0, 3).join(" ")}
      </div>
      <div className="cbar-track">
        <div className="cbar-fill" style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="cbar-val">{fmt(hospital.cost)}</div>
    </div>
  );
}

function DonutChart({ dist, title, colorMap }) {
  const entries = Object.entries(dist || {}).filter(([, v]) => v > 0);
  const total   = entries.reduce((s, [, v]) => s + v, 0);
  if (!total) return null;

  const COLORS = ["#22d3ee","#6366f1","#f59e0b","#4ade80","#f87171","#a78bfa"];
  const r = 42, cx = 60, cy = 60, sw = 26, circ = 2 * Math.PI * r;

  let cum = 0;
  const segs = entries.map(([label, value], i) => {
    const pct   = value / total;
    const start = cum;
    cum += pct;
    return { label, value, pct, start, color: (colorMap && colorMap[label]) || COLORS[i % COLORS.length] };
  });

  return (
    <div className="donut-wrap">
      <p className="donut-title">{title}</p>
      <div className="donut-body">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw}/>
          {segs.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={sw} opacity={0.85}
              strokeDasharray={`${seg.pct * circ} ${circ}`}
              strokeDashoffset={-seg.start * circ}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="700">{total}</text>
          <text x={cx} y={cy + 13} textAnchor="middle" fill="#475569" fontSize="9">hospitals</text>
        </svg>
        <div className="donut-legend">
          {segs.map(seg => (
            <div key={seg.label} className="legend-row">
              <span className="legend-dot" style={{ background: seg.color }}/>
              <span className="legend-lbl">{seg.label}</span>
              <span className="legend-val">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DataVisualizations({ results }) {
  const [tab, setTab] = useState("cost");

  const hospitals        = results?.hospitals || [];
  const catDist          = results?.category_distribution || null;
  const ratDist          = results?.rating_distribution || null;
  const accDist          = results?.accreditation_distribution || null;

  if (!hospitals.length) return null;

  const withCost = [...hospitals].filter(h => h.cost > 0).sort((a,b) => a.cost - b.cost);
  const maxCost  = withCost.length ? Math.max(...withCost.map(h => h.cost)) : 0;

  // Fallback: compute distributions client-side if backend didn't send them
  const computedCat = catDist || hospitals.reduce((acc,h) => {
    const k = h.category || "Other"; acc[k] = (acc[k]||0)+1; return acc;
  }, {});
  const computedAcc = accDist || hospitals.reduce((acc,h) => {
    const k = h.accreditation || "None"; acc[k] = (acc[k]||0)+1; return acc;
  }, {});
  const computedRat = ratDist || (() => {
    const b = {"4.5+":0,"4.0-4.5":0,"3.5-4.0":0,"<3.5":0};
    hospitals.forEach(h => {
      const r = h.rating;
      if (r >= 4.5) b["4.5+"]++; else if (r >= 4.0) b["4.0-4.5"]++; else if (r >= 3.5) b["3.5-4.0"]++; else b["<3.5"]++;
    });
    return Object.fromEntries(Object.entries(b).filter(([,v])=>v>0));
  })();

  const avgRating = (hospitals.reduce((s,h) => s + h.rating, 0) / hospitals.length).toFixed(1);

  const catColors  = { Private:"#6366f1", Government:"#22d3ee", Trust:"#f59e0b", "Multi-Specialty":"#4ade80" };
  const ratColors  = { "4.5+":"#22d3ee", "4.0-4.5":"#4ade80", "3.5-4.0":"#f59e0b", "<3.5":"#f87171" };

  const TABS = ["cost","distribution","ratings"];
  const TAB_LABELS = { cost:"Cost Compare", distribution:"Hospital Types", ratings:"Ratings" };

  return (
    <section className="viz-root">
      <div className="viz-head">
        <h2 className="viz-title"><span className="viz-dot"/>Data Insights</h2>
        <div className="viz-tabs">
          {TABS.map(t => (
            <button key={t} className={`viz-tab ${tab===t?"viz-tab--on":""}`} onClick={()=>setTab(t)}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="viz-card">

        {/* ── Cost bars ── */}
        {tab === "cost" && (
          <div className="tab-pane">
            <p className="chart-lbl">Estimated cost per hospital — lowest to highest</p>
            {withCost.length > 0
              ? <div className="cbar-list">
                  {withCost.map((h,i) => <CostBar key={h.id} hospital={h} maxCost={maxCost} rank={i}/>)}
                </div>
              : <p className="no-data">No cost data available for these hospitals.</p>
            }
            {results?.estimated_cost_label && (
              <div className="cost-range-strip">
                <span className="strip-label">Procedure range</span>
                <strong className="strip-range">{results.estimated_cost_label}</strong>
                {results.budget_feasible !== undefined && (
                  <span className={`strip-badge ${results.budget_feasible?"strip-badge--ok":"strip-badge--warn"}`}>
                    {results.budget_feasible ? "✓ Within budget" : "⚠ May exceed budget"}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Distribution donuts ── */}
        {tab === "distribution" && (
          <div className="tab-pane tab-pane--donuts">
            <DonutChart dist={computedCat} title="By Hospital Type"   colorMap={catColors}/>
            <DonutChart dist={computedAcc} title="By Accreditation"   colorMap={{}}/>
          </div>
        )}

        {/* ── Ratings chart ── */}
        {tab === "ratings" && (
          <div className="tab-pane">
            <p className="chart-lbl">Rating distribution across results</p>
            <div className="rat-bars">
              {Object.entries(computedRat).map(([label, count]) => (
                <div key={label} className="rat-row">
                  <span className="rat-lbl">{label} ⭐</span>
                  <div className="rat-track">
                    <div
                      className="rat-fill"
                      style={{ width:`${(count/hospitals.length)*100}%`, background: ratColors[label]||"#22d3ee" }}
                    />
                  </div>
                  <span className="rat-count">{count}</span>
                </div>
              ))}
            </div>
            <div className="avg-strip">
              <span className="avg-lbl">Average Rating</span>
              <span className="avg-num">{avgRating}</span>
              <span className="avg-star">⭐</span>
              <span className="avg-sub">across {hospitals.length} hospitals</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .viz-root { display:flex; flex-direction:column; gap:14px; font-family:'DM Sans',sans-serif; }
        .viz-head { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .viz-title { font-size:13px; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:7px; }
        .viz-dot { width:6px; height:6px; border-radius:50%; background:#22d3ee; flex-shrink:0; }
        .viz-tabs { display:flex; gap:5px; }
        .viz-tab { background:transparent; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:6px 13px; font-family:'DM Sans',sans-serif; font-size:12px; color:#475569; cursor:pointer; transition:all .18s; }
        .viz-tab:hover { color:#94a3b8; border-color:rgba(255,255,255,0.14); }
        .viz-tab--on { background:rgba(34,211,238,0.08); border-color:rgba(34,211,238,0.28); color:#22d3ee; }
        .viz-card { background:rgba(15,23,42,0.65); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:22px; backdrop-filter:blur(12px); animation:vfadeup .35s ease; }
        @keyframes vfadeup { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .tab-pane { display:flex; flex-direction:column; gap:14px; }
        .chart-lbl { font-size:11.5px; color:#334155; text-transform:uppercase; letter-spacing:.06em; }
        .no-data { font-size:13px; color:#334155; text-align:center; padding:24px 0; }

        /* Cost bars */
        .cbar-list { display:flex; flex-direction:column; gap:8px; }
        .cbar-row { display:grid; grid-template-columns:180px 1fr 72px; align-items:center; gap:10px; position:relative; }
        .cbar-row--best .cbar-name { color:#22d3ee; font-weight:500; }
        .best-tag { position:absolute; left:0; top:-14px; font-size:9px; font-weight:700; color:#22d3ee; text-transform:uppercase; letter-spacing:.08em; background:rgba(34,211,238,0.1); padding:1px 7px; border-radius:99px; }
        .cbar-name { font-size:12px; color:#64748b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .cbar-track { height:7px; background:rgba(255,255,255,0.05); border-radius:99px; overflow:hidden; }
        .cbar-fill { height:100%; background:linear-gradient(90deg,#0891b2,#22d3ee); border-radius:99px; transition:width .9s cubic-bezier(.4,0,.2,1); }
        .cbar-row--best .cbar-fill { background:linear-gradient(90deg,#059669,#10b981); }
        .cbar-val { font-size:12px; font-weight:600; color:#94a3b8; text-align:right; }

        .cost-range-strip { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:11px 15px; background:rgba(34,211,238,0.04); border:1px solid rgba(34,211,238,0.1); border-radius:10px; margin-top:4px; }
        .strip-label { font-size:12px; color:#475569; }
        .strip-range { color:#22d3ee; font-size:15px; }
        .strip-badge { border-radius:99px; padding:2px 10px; font-size:11px; font-weight:500; }
        .strip-badge--ok { background:rgba(74,222,128,.1); border:1px solid rgba(74,222,128,.25); color:#4ade80; }
        .strip-badge--warn { background:rgba(251,191,36,.1); border:1px solid rgba(251,191,36,.25); color:#fbbf24; }

        /* Donuts */
        .tab-pane--donuts { flex-direction:row; flex-wrap:wrap; justify-content:space-around; gap:20px; }
        .donut-wrap { display:flex; flex-direction:column; gap:10px; align-items:center; }
        .donut-title { font-size:12.5px; font-weight:600; color:#64748b; }
        .donut-body { display:flex; align-items:center; gap:16px; }
        .donut-legend { display:flex; flex-direction:column; gap:7px; }
        .legend-row { display:flex; align-items:center; gap:7px; font-size:12px; color:#64748b; }
        .legend-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .legend-lbl { flex:1; }
        .legend-val { font-weight:600; color:#94a3b8; min-width:18px; text-align:right; }

        /* Rating bars */
        .rat-bars { display:flex; flex-direction:column; gap:9px; }
        .rat-row { display:grid; grid-template-columns:80px 1fr 28px; align-items:center; gap:10px; }
        .rat-lbl { font-size:12px; color:#64748b; }
        .rat-track { height:7px; background:rgba(255,255,255,0.05); border-radius:99px; overflow:hidden; }
        .rat-fill { height:100%; border-radius:99px; transition:width .9s cubic-bezier(.4,0,.2,1); }
        .rat-count { font-size:12px; font-weight:600; color:#94a3b8; text-align:right; }

        .avg-strip { display:flex; align-items:center; gap:8px; padding:12px 16px; background:rgba(34,211,238,0.04); border:1px solid rgba(34,211,238,0.1); border-radius:10px; }
        .avg-lbl { font-size:12.5px; color:#475569; flex:1; }
        .avg-num { font-size:30px; font-weight:700; color:#22d3ee; line-height:1; }
        .avg-star { font-size:18px; }
        .avg-sub { font-size:11px; color:#334155; }
      `}</style>
    </section>
  );
}
