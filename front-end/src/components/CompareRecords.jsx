import React, { useState } from "react";

const CompareRecords = ({ records, onClose }) => {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (rec) => {
    if (selected.find(r => r.id === (rec.id || rec._id))) {
      setSelected(selected.filter(r => r.id !== (rec.id || rec._id)));
    } else if (selected.length < 2) {
      setSelected([...selected, { ...rec, id: rec.id || rec._id }]);
    }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(10,18,38,0.7)", backdropFilter: "blur(8px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 1000, height: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 40px 100px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease-out" }}>
        
        {/* Header */}
        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>Prescription Comparison</h2>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Select two records to analyze differences side-by-side</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* List Sidebar */}
          <div style={{ width: 320, borderRight: "1px solid #f1f5f9", overflowY: "auto", padding: "1rem", background: "#fcfdfe" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Available Records</div>
            {records.map(r => (
              <div 
                key={r.id || r._id} 
                onClick={() => toggleSelect(r)}
                style={{ 
                  padding: "12px", 
                  borderRadius: 12, 
                  border: `2px solid ${selected.find(s => s.id === (r.id || r._id)) ? "#0ea5e9" : "transparent"}`,
                  background: selected.find(s => s.id === (r.id || r._id)) ? "#f0f9ff" : "#fff",
                  marginBottom: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>{r.icon || "📄"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                    <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: 2 }}>{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                  {selected.find(s => s.id === (r.id || r._id)) && <span style={{ color: "#0ea5e9", fontSize: "0.8rem" }}>✓</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison View */}
          <div style={{ flex: 1, padding: "2rem", overflowY: "auto", background: "#fff" }}>
            {selected.length === 2 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {selected.map((s, idx) => (
                  <div key={s.id} style={{ animation: "fadeIn 0.4s ease" }}>
                    <div style={{ background: idx === 0 ? "#f8fafc" : "#f1f5f9", padding: "1.25rem", borderRadius: 16, marginBottom: "1.5rem", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#6366f1", textTransform: "uppercase", marginBottom: 6 }}>Record {idx + 1}</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{s.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Date: {new Date(s.date).toLocaleDateString()}</div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      <div className="comp-section">
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>AI Summary</div>
                        <div style={{ fontSize: "0.85rem", color: "#334155", background: "#f8fafc", padding: "12px", borderRadius: 12, border: "1px solid #f1f5f9", lineHeight: 1.6 }}>
                          {s.aiSummary || "No AI summary available."}
                        </div>
                      </div>

                      <div className="comp-section">
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Vitals / Values</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {Object.entries(s.vitals || {}).map(([k, v]) => (
                            <div key={k} style={{ padding: "8px 12px", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 8 }}>
                              <div style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{k}</div>
                              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="comp-section">
                        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Tags</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(s.tags || []).map(t => (
                            <span key={t} style={{ padding: "4px 10px", borderRadius: 99, background: "#f1f5f9", color: "#475569", fontSize: "0.65rem", fontWeight: 600 }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#64748b" }}>
                  {selected.length === 0 ? "Select two records to begin" : "Select one more record to compare"}
                </div>
                <p style={{ maxWidth: 300, fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  Select records from the left panel to see a side-by-side clinical comparison.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareRecords;
