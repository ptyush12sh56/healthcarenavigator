import { useState } from "react";

const FIELDS = [
  { key: "rating",          label: "Rating",         format: v => v ? `⭐ ${v}/5` : "—" },
  { key: "category",        label: "Type",           format: v => v || "—" },
  { key: "cost",            label: "Est. Cost",      format: v => v ? (v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`) : "—" },
  { key: "available_beds",  label: "Available Beds", format: v => v ? `${v} beds` : "—" },
  { key: "accreditation",   label: "Accreditation",  format: v => v || "None" },
  { key: "distance",        label: "Distance",       format: v => v ? `${v} km` : "—" },
  { key: "specialities",    label: "Specialities",   format: v => v ? v.split(",").slice(0,3).join(", ") : "—" },
];

export default function HospitalComparison({ hospitals, selected, onToggle, onClear }) {
  const [open, setOpen] = useState(false);
  const compareList = hospitals.filter(h => selected.includes(h.id));

  if (selected.length === 0) return null;

  const getBest = (key) => {
    if (key === "rating") return compareList.reduce((a,b) => (b.rating > a.rating ? b : a), compareList[0])?.id;
    if (key === "cost")   return compareList.reduce((a,b) => ((b.cost||Infinity) < (a.cost||Infinity) ? b : a), compareList[0])?.id;
    if (key === "available_beds") return compareList.reduce((a,b) => ((b.available_beds||0) > (a.available_beds||0) ? b : a), compareList[0])?.id;
    return null;
  };

  return (
    <>
      {/* Sticky comparison bar */}
      <div className="compare-bar">
        <div className="compare-bar-left">
          <span className="compare-count">{selected.length}</span>
          <span className="compare-label">hospital{selected.length > 1 ? "s" : ""} selected</span>
          <div className="compare-avatars">
            {compareList.map(h => (
              <div key={h.id} className="compare-avatar" title={h.name}>
                {h.name?.charAt(0)}
              </div>
            ))}
          </div>
        </div>
        <div className="compare-bar-right">
          <button className="compare-clear" onClick={onClear}>Clear</button>
          <button
            className="compare-open-btn"
            onClick={() => setOpen(true)}
            disabled={selected.length < 2}
          >
            {selected.length < 2 ? "Select 1 more to compare" : "Compare Side-by-Side →"}
          </button>
        </div>
      </div>

      {/* Comparison drawer */}
      {open && (
        <div className="compare-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="compare-drawer">
            <div className="compare-drawer-header">
              <h2 className="compare-title">Side-by-Side Comparison</h2>
              <button className="compare-drawer-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-th compare-th--label">Feature</th>
                    {compareList.map(h => (
                      <th key={h.id} className="compare-th">
                        <div className="compare-hosp-head">
                          <div className="compare-hosp-avatar">{h.name?.charAt(0)}</div>
                          <span className="compare-hosp-name">{h.name}</span>
                          <span className="compare-hosp-city">{h.city}</span>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => { onToggle(h.id); if (selected.length <= 2) setOpen(false); }}
                          title="Remove"
                        >✕</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FIELDS.map((field, fi) => {
                    const bestId = getBest(field.key);
                    return (
                      <tr key={field.key} className={fi % 2 === 0 ? "compare-row--even" : ""}>
                        <td className="compare-td compare-td--label">{field.label}</td>
                        {compareList.map(h => {
                          const isBest = bestId === h.id;
                          return (
                            <td key={h.id} className={`compare-td ${isBest ? "compare-td--best" : ""}`}>
                              {field.format(h[field.key])}
                              {isBest && <span className="best-badge">Best</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="compare-footer">
              <button className="compare-close-btn" onClick={() => setOpen(false)}>Close</button>
              <button className="compare-clear-btn" onClick={() => { onClear(); setOpen(false); }}>Clear Selection</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .compare-bar {
          position:fixed; bottom:0; left:0; right:0; z-index:150;
          background:rgba(10,22,40,0.97); border-top:1px solid rgba(34,211,238,0.25);
          padding:14px 32px; display:flex; align-items:center;
          justify-content:space-between; gap:16px; backdrop-filter:blur(16px);
          animation:slideUp 0.3s ease;
          font-family:'DM Sans',sans-serif;
        }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .compare-bar-left { display:flex; align-items:center; gap:12px; }
        .compare-count { font-size:24px; font-weight:700; color:#22d3ee; }
        .compare-label { font-size:14px; color:#64748b; }
        .compare-avatars { display:flex; gap:-4px; }
        .compare-avatar { width:28px; height:28px; border-radius:8px; background:rgba(34,211,238,0.1); border:1px solid rgba(34,211,238,0.25); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#22d3ee; margin-left:-6px; }
        .compare-bar-right { display:flex; align-items:center; gap:10px; }
        .compare-clear { background:transparent; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 14px; font-family:'DM Sans',sans-serif; font-size:13px; color:#475569; cursor:pointer; transition:all 0.15s; }
        .compare-clear:hover { color:#94a3b8; border-color:rgba(255,255,255,0.18); }
        .compare-open-btn { background:linear-gradient(135deg,#0891b2,#22d3ee); border:none; border-radius:10px; padding:10px 20px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; color:#060d1a; cursor:pointer; transition:opacity 0.2s; white-space:nowrap; }
        .compare-open-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .compare-overlay { position:fixed; inset:0; z-index:300; background:rgba(3,9,18,0.88); backdrop-filter:blur(8px); display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .compare-drawer { background:#0a1628; border:1px solid rgba(34,211,238,0.18); border-radius:24px 24px 0 0; width:100%; max-width:900px; max-height:85vh; display:flex; flex-direction:column; animation:drawerUp 0.3s ease; font-family:'DM Sans',sans-serif; }
        @keyframes drawerUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

        .compare-drawer-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
        .compare-title { font-size:18px; font-weight:600; color:#f1f5f9; }
        .compare-drawer-close { background:rgba(255,255,255,0.05); border:none; color:#475569; width:30px; height:30px; border-radius:8px; cursor:pointer; font-size:14px; transition:all 0.15s; }
        .compare-drawer-close:hover { color:#e2e8f0; background:rgba(255,255,255,0.1); }

        .compare-table-wrap { flex:1; overflow:auto; padding:0 24px 16px; }
        .compare-table { width:100%; border-collapse:collapse; margin-top:16px; }
        .compare-th { padding:14px 16px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; font-weight:600; color:#64748b; position:relative; min-width:160px; }
        .compare-th--label { text-align:left; min-width:120px; }
        .compare-hosp-head { display:flex; flex-direction:column; align-items:center; gap:4px; padding-bottom:6px; }
        .compare-hosp-avatar { width:36px; height:36px; border-radius:10px; background:rgba(34,211,238,0.1); border:1px solid rgba(34,211,238,0.2); display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; color:#22d3ee; }
        .compare-hosp-name { font-size:13px; font-weight:600; color:#f1f5f9; text-align:center; line-height:1.3; }
        .compare-hosp-city { font-size:11px; color:#475569; }
        .remove-btn { position:absolute; top:8px; right:8px; background:transparent; border:none; color:#334155; font-size:12px; cursor:pointer; transition:color 0.15s; }
        .remove-btn:hover { color:#f87171; }

        .compare-td { padding:13px 16px; text-align:center; font-size:13px; color:#94a3b8; border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; }
        .compare-td--label { text-align:left; color:#64748b; font-weight:500; }
        .compare-row--even .compare-td { background:rgba(255,255,255,0.015); }
        .compare-td--best { color:#22d3ee !important; font-weight:600; }
        .best-badge { display:inline-block; margin-left:6px; background:rgba(34,211,238,0.15); border:1px solid rgba(34,211,238,0.3); border-radius:99px; padding:1px 7px; font-size:10px; font-weight:600; color:#22d3ee; }

        .compare-footer { display:flex; gap:10px; padding:16px 24px; border-top:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
        .compare-close-btn { background:transparent; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 20px; font-family:'DM Sans',sans-serif; font-size:14px; color:#475569; cursor:pointer; }
        .compare-clear-btn { background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); border-radius:10px; padding:10px 20px; font-family:'DM Sans',sans-serif; font-size:14px; color:#f87171; cursor:pointer; }
      `}</style>
    </>
  );
}
