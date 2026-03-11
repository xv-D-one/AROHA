import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// ██  API CONFIG  ─ Replace BASE_URL and toggle USE_REAL_API when backend ready
// ─────────────────────────────────────────────────────────────────────────────
const API_CONFIG = {
  USE_REAL_API: false,            // ← flip to true when backend is ready
  BASE_URL: "http://localhost:5000/api",  // ← your backend base URL
  ENDPOINTS: {
    stats:           "/dashboard/stats",
    patientTrend:    "/dashboard/patient-trend",
    appointmentData: "/dashboard/appointments",
    departmentData:  "/dashboard/departments",
    recentPatients:  "/dashboard/recent-patients",
    doctorActivity:  "/dashboard/doctor-activity",
    alerts:          "/dashboard/alerts",
    aiInsights:      "/dashboard/ai-insights",
  },
};

async function fetchFromBackend(endpoint) {
  const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json",
               "Authorization": `Bearer ${localStorage.getItem("token") || ""}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// ██  DUMMY DATA  ─ All shapes match what the backend should return
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY = {
  stats: {
    totalPatients:     { value: 1248, delta: +6.4,  label: "Total Patients"    },
    totalDoctors:      { value: 48,   delta: +2,    label: "Active Doctors"    },
    todayAppointments: { value: 34,   delta: -3,    label: "Today's Appts"     },
    pendingRecords:    { value: 19,   delta: +12.1, label: "Pending Records"   },
    aiSummaries:       { value: 312,  delta: +28.5, label: "AI Summaries"      },
    criticalAlerts:    { value: 4,    delta: 0,     label: "Critical Alerts"   },
  },
  patientTrend: [
    { month: "Aug", new: 82, discharged: 65, readmitted: 12 },
    { month: "Sep", new: 95, discharged: 78, readmitted: 9  },
    { month: "Oct", new: 110,discharged: 91, readmitted: 14 },
    { month: "Nov", new: 98, discharged: 84, readmitted: 11 },
    { month: "Dec", new: 87, discharged: 71, readmitted: 8  },
    { month: "Jan", new: 124,discharged: 102,readmitted: 16 },
    { month: "Feb", new: 138,discharged: 115,readmitted: 13 },
  ],
  appointmentData: [
    { day: "Mon", completed: 28, cancelled: 4, pending: 8  },
    { day: "Tue", completed: 34, cancelled: 2, pending: 11 },
    { day: "Wed", completed: 22, cancelled: 7, pending: 6  },
    { day: "Thu", completed: 40, cancelled: 3, pending: 9  },
    { day: "Fri", completed: 35, cancelled: 5, pending: 7  },
    { day: "Sat", completed: 18, cancelled: 1, pending: 4  },
    { day: "Sun", completed: 10, cancelled: 0, pending: 2  },
  ],
  departmentData: [
    { name: "Cardiology",   patients: 210, color: "#0ea5e9" },
    { name: "Dermatology",  patients: 158, color: "#8b5cf6" },
    { name: "Orthopedics",  patients: 192, color: "#14b8a6" },
    { name: "Neurology",    patients: 134, color: "#f59e0b" },
    { name: "Pediatrics",   patients: 178, color: "#ec4899" },
    { name: "Oncology",     patients: 96,  color: "#ef4444" },
  ],
  recentPatients: [
    { id: "P-4821", name: "Rohan Varma",    age: 34, dept: "Cardiology",  status: "Admitted",   risk: "high",   time: "2m ago"  },
    { id: "P-4820", name: "Priya Nair",     age: 28, dept: "Pediatrics",  status: "Discharged", risk: "low",    time: "18m ago" },
    { id: "P-4819", name: "Samuel Thomas",  age: 52, dept: "Neurology",   status: "Admitted",   risk: "medium", time: "1h ago"  },
    { id: "P-4818", name: "Anita Sharma",   age: 45, dept: "Oncology",    status: "Critical",   risk: "high",   time: "2h ago"  },
    { id: "P-4817", name: "Kiran Mehta",    age: 61, dept: "Orthopedics", status: "Follow-up",  risk: "low",    time: "3h ago"  },
    { id: "P-4816", name: "Deepa Pillai",   age: 38, dept: "Dermatology", status: "Discharged", risk: "low",    time: "5h ago"  },
  ],
  doctorActivity: [
    { name: "Dr. Arjun Rao",    specialty: "Cardiology",  patients: 12, rating: 4.9, status: "online"  },
    { name: "Dr. Kavya Menon",  specialty: "Dermatology", patients: 8,  rating: 4.7, status: "online"  },
    { name: "Dr. Suresh Babu",  specialty: "Neurology",   patients: 10, rating: 4.8, status: "busy"    },
    { name: "Dr. Lena Joseph",  specialty: "Pediatrics",  patients: 15, rating: 4.6, status: "online"  },
    { name: "Dr. Ravi Kumar",   specialty: "Oncology",    patients: 6,  rating: 4.9, status: "offline" },
  ],
  alerts: [
    { id: 1, type: "critical", msg: "Patient P-4818 vitals deteriorating — ICU transfer recommended", time: "5m ago"  },
    { id: 2, type: "warning",  msg: "Lab results pending for 3 patients beyond 24h threshold",       time: "22m ago" },
    { id: 3, type: "info",     msg: "AI summary generated for 8 new admissions today",               time: "1h ago"  },
    { id: 4, type: "warning",  msg: "Dr. Suresh Babu schedule overloaded — 10 patients assigned",   time: "2h ago"  },
  ],
  aiInsights: {
    summariesGenerated: 312,
    accuracyScore: 94.2,
    avgProcessingTime: "1.8s",
    flaggedRecords: 19,
    trend: [
      { day: "M", val: 38 }, { day: "T", val: 44 }, { day: "W", val: 31 },
      { day: "T", val: 52 }, { day: "F", val: 48 }, { day: "S", val: 27 }, { day: "S", val: 19 },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ██  DATA HOOK  ─ Switches between dummy and real API automatically
// ─────────────────────────────────────────────────────────────────────────────
function useDashboardData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!API_CONFIG.USE_REAL_API) {
        // Simulate network delay for realism
        await new Promise(r => setTimeout(r, 600));
        setData(DUMMY);
        setLoading(false);
        return;
      }
      try {
        const [stats, patientTrend, appointmentData, departmentData,
               recentPatients, doctorActivity, alerts, aiInsights] =
          await Promise.all(Object.values(API_CONFIG.ENDPOINTS).map(fetchFromBackend));
        setData({ stats, patientTrend, appointmentData, departmentData,
                  recentPatients, doctorActivity, alerts, aiInsights });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // Auto-refresh every 60s when using real API
    if (API_CONFIG.USE_REAL_API) {
      const interval = setInterval(load, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  return { data, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// ██  SMALL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const RISK_COLOR  = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const STATUS_BG   = { Admitted: "#0ea5e918", Discharged: "#22c55e18", Critical: "#ef444418", "Follow-up": "#f59e0b18" };
const STATUS_TEXT = { Admitted: "#0ea5e9",   Discharged: "#22c55e",   Critical: "#ef4444",   "Follow-up": "#f59e0b"   };
const ALERT_META  = { critical: { bg:"#fff1f2", border:"#fecaca", icon:"🚨", color:"#ef4444" },
                      warning:  { bg:"#fffbeb", border:"#fed7aa", icon:"⚠️",  color:"#f59e0b" },
                      info:     { bg:"#f0f9ff", border:"#bae6fd", icon:"ℹ️",  color:"#0ea5e9" } };
const DOC_STATUS  = { online:"#22c55e", busy:"#f59e0b", offline:"#94a3b8" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10,
                  padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,0.1)",
                  fontFamily:"'Sora',sans-serif" }}>
      <p style={{ fontSize:"0.72rem", fontWeight:700, color:"#0f172a", marginBottom:6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize:"0.68rem", color: p.color, margin:"2px 0" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ██  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { data, loading, error } = useDashboardData();
  const [activeTab, setActiveTab]   = useState("week");
  const [now, setNow]               = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} />;

  const { stats, patientTrend, appointmentData, departmentData,
          recentPatients, doctorActivity, alerts, aiInsights } = data;

  const statCards = [
    { key:"totalPatients",     icon:"🧑",  accent:"#0ea5e9" },
    { key:"totalDoctors",      icon:"👨‍⚕️", accent:"#8b5cf6" },
    { key:"todayAppointments", icon:"📅",  accent:"#14b8a6" },
    { key:"pendingRecords",    icon:"🗂️",  accent:"#f59e0b" },
    { key:"aiSummaries",       icon:"🤖",  accent:"#6366f1" },
    { key:"criticalAlerts",    icon:"🚨",  accent:"#ef4444" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

        .db-root { font-family:'Sora',sans-serif; color:#0f172a; }

        /* ── Page Header ── */
        .db-header {
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:1.75rem; flex-wrap:wrap; gap:12px;
        }
        .db-title { font-size:1.4rem; font-weight:700; color:#0f172a; line-height:1.2; }
        .db-subtitle { font-size:0.75rem; color:#64748b; margin-top:4px; }
        .db-clock { text-align:right; }
        .db-clock-time { font-family:'JetBrains Mono',monospace; font-size:1.2rem; font-weight:600; color:#0f172a; }
        .db-clock-date { font-size:0.68rem; color:#94a3b8; margin-top:2px; }

        /* API badge */
        .db-api-badge {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 10px; border-radius:99px; font-size:0.62rem; font-weight:700;
          text-transform:uppercase; letter-spacing:0.08em;
          background:${API_CONFIG.USE_REAL_API ? "#f0fdf4" : "#fef9c3"};
          border:1px solid ${API_CONFIG.USE_REAL_API ? "#bbf7d0" : "#fde68a"};
          color:${API_CONFIG.USE_REAL_API ? "#15803d" : "#92400e"};
          margin-top:6px;
        }
        .db-api-dot {
          width:6px; height:6px; border-radius:50%;
          background:${API_CONFIG.USE_REAL_API ? "#22c55e" : "#f59e0b"};
          animation: blink2 2s infinite;
        }
        @keyframes blink2 { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* ── Stat Cards ── */
        .db-stats-grid {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(175px,1fr));
          gap:14px; margin-bottom:1.75rem;
        }
        .db-stat-card {
          background:#fff; border-radius:14px; padding:16px;
          border:1px solid #f1f5f9;
          box-shadow:0 1px 4px rgba(0,0,0,0.04);
          transition:transform 0.18s,box-shadow 0.18s;
          cursor:default;
          animation: fadeUp 0.4s ease both;
        }
        .db-stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.08); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .db-stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .db-stat-icon {
          width:36px; height:36px; border-radius:9px;
          display:flex; align-items:center; justify-content:center; font-size:1rem;
        }
        .db-stat-delta {
          font-size:0.62rem; font-weight:700; padding:3px 7px; border-radius:99px;
        }
        .db-stat-value {
          font-size:1.65rem; font-weight:700; line-height:1;
          font-family:'JetBrains Mono',monospace;
        }
        .db-stat-label { font-size:0.68rem; color:#64748b; margin-top:5px; font-weight:500; }

        /* ── Section Layout ── */
        .db-grid-2   { display:grid; grid-template-columns:1fr 1fr;       gap:14px; margin-bottom:14px; }
        .db-grid-3   { display:grid; grid-template-columns:2fr 1fr;       gap:14px; margin-bottom:14px; }
        .db-grid-32  { display:grid; grid-template-columns:1.2fr 1fr;     gap:14px; margin-bottom:14px; }
        .db-grid-bot { display:grid; grid-template-columns:1fr 1fr 1.1fr; gap:14px; margin-bottom:14px; }

        @media (max-width:1100px) {
          .db-grid-2,.db-grid-3,.db-grid-32,.db-grid-bot { grid-template-columns:1fr; }
        }

        /* ── Card ── */
        .db-card {
          background:#fff; border-radius:14px; padding:20px;
          border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,0.04);
          animation: fadeUp 0.45s ease both;
        }
        .db-card-header {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:16px; flex-wrap:wrap; gap:8px;
        }
        .db-card-title { font-size:0.85rem; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:7px; }
        .db-card-title span { font-size:0.95rem; }

        /* Tab pills */
        .db-tabs { display:flex; gap:4px; }
        .db-tab {
          font-size:0.65rem; font-weight:600; padding:4px 10px; border-radius:7px;
          cursor:pointer; border:none; background:#f8fafc; color:#64748b;
          transition:all 0.15s;
        }
        .db-tab.active { background:#0f172a; color:#fff; }

        /* ── Patient Trend Chart ── */
        .db-chart-wrap { width:100%; height:220px; }

        /* ── Appointments Bar Chart ── */
        .db-bar-wrap { width:100%; height:210px; }

        /* ── Department Pie ── */
        .db-pie-wrap { width:100%; height:200px; }
        .db-dept-legend { display:flex; flex-direction:column; gap:8px; margin-top:12px; }
        .db-dept-row {
          display:flex; align-items:center; justify-content:space-between;
          font-size:0.7rem;
        }
        .db-dept-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .db-dept-name { flex:1; margin-left:8px; color:#334155; font-weight:500; }
        .db-dept-bar-wrap { width:80px; background:#f1f5f9; border-radius:99px; height:5px; overflow:hidden; }
        .db-dept-bar-fill { height:100%; border-radius:99px; transition:width 0.6s ease; }
        .db-dept-count { font-weight:700; color:#0f172a; margin-left:8px; min-width:28px; text-align:right; }

        /* ── Recent Patients Table ── */
        .db-table { width:100%; border-collapse:collapse; }
        .db-table th {
          font-size:0.62rem; font-weight:700; text-transform:uppercase;
          letter-spacing:0.07em; color:#94a3b8; padding:0 10px 10px;
          text-align:left; white-space:nowrap;
        }
        .db-table td {
          font-size:0.73rem; padding:9px 10px; border-top:1px solid #f8fafc;
          color:#334155; vertical-align:middle;
        }
        .db-table tr:hover td { background:#fafbfc; }
        .db-patient-name { font-weight:600; color:#0f172a; }
        .db-patient-id   { font-size:0.6rem; color:#94a3b8; font-family:'JetBrains Mono',monospace; }
        .db-status-pill {
          display:inline-flex; padding:3px 8px; border-radius:99px;
          font-size:0.62rem; font-weight:700; white-space:nowrap;
        }
        .db-risk-dot { width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:5px; }

        /* ── Doctor Activity ── */
        .db-doctor-list { display:flex; flex-direction:column; gap:10px; }
        .db-doctor-row {
          display:flex; align-items:center; gap:10px; padding:10px 12px;
          background:#f8fafc; border-radius:10px; transition:background 0.15s;
        }
        .db-doctor-row:hover { background:#f1f5f9; }
        .db-doctor-avatar {
          width:34px; height:34px; border-radius:50%;
          background:linear-gradient(135deg,#0ea5e9,#6366f1);
          display:flex; align-items:center; justify-content:center;
          font-size:0.65rem; font-weight:700; color:#fff; flex-shrink:0;
        }
        .db-doctor-name { font-size:0.76rem; font-weight:600; color:#0f172a; }
        .db-doctor-spec { font-size:0.63rem; color:#94a3b8; margin-top:1px; }
        .db-doctor-pts  { font-size:0.68rem; font-weight:700; color:#0f172a; text-align:right; }
        .db-doctor-pts-label { font-size:0.6rem; color:#94a3b8; }
        .db-doc-status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

        /* ── Alerts ── */
        .db-alerts-list { display:flex; flex-direction:column; gap:8px; }
        .db-alert-item {
          display:flex; align-items:flex-start; gap:10px;
          padding:10px 12px; border-radius:10px;
          border:1px solid; font-size:0.73rem;
          animation: fadeUp 0.4s ease both;
        }
        .db-alert-icon { font-size:0.9rem; flex-shrink:0; margin-top:1px; }
        .db-alert-msg  { flex:1; line-height:1.4; }
        .db-alert-time { font-size:0.62rem; color:#94a3b8; white-space:nowrap; margin-top:2px; }

        /* ── AI Insights ── */
        .db-ai-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
        .db-ai-metric {
          background:linear-gradient(135deg,#0c1c3a,#0f3460);
          border-radius:10px; padding:12px 14px;
        }
        .db-ai-metric-val { font-size:1.3rem; font-weight:700; color:#fff; font-family:'JetBrains Mono',monospace; }
        .db-ai-metric-label { font-size:0.62rem; color:rgba(255,255,255,0.45); margin-top:3px; }
        .db-ai-sparkline { width:100%; height:56px; }
        .db-ai-tag {
          display:inline-flex; align-items:center; gap:5px;
          font-size:0.62rem; font-weight:700; padding:3px 8px; border-radius:99px;
          background:rgba(99,102,241,0.12); color:#818cf8;
          border:1px solid rgba(99,102,241,0.2); margin-top:10px;
        }

        /* Loading */
        .db-loading {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          min-height:60vh; gap:16px;
        }
        .db-spinner {
          width:40px; height:40px; border-radius:50%;
          border:3px solid #e2e8f0; border-top-color:#0ea5e9;
          animation:spin 0.8s linear infinite;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* Error */
        .db-error {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          min-height:60vh; gap:12px; text-align:center;
        }
      `}</style>

      <div className="db-root">

        {/* ── Header ── */}
        <div className="db-header">
          <div>
            <div className="db-title">Admin Dashboard</div>
            <div className="db-subtitle">Overview of patients, doctors, records & AI activity</div>
            <div className="db-api-badge">
              <div className="db-api-dot"/>
              {API_CONFIG.USE_REAL_API ? "Live API" : "Demo Mode — Dummy Data"}
            </div>
          </div>
          <div className="db-clock">
            <div className="db-clock-time">
              {now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
            </div>
            <div className="db-clock-date">
              {now.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="db-stats-grid">
          {statCards.map(({ key, icon, accent }, i) => {
            const s = stats[key];
            const up = s.delta >= 0;
            return (
              <div className="db-stat-card" key={key} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="db-stat-top">
                  <div className="db-stat-icon" style={{ background: accent + "18" }}>{icon}</div>
                  {s.delta !== 0 && (
                    <span className="db-stat-delta"
                      style={{ background: up ? "#f0fdf4" : "#fff1f2", color: up ? "#16a34a" : "#dc2626" }}>
                      {up ? "▲" : "▼"} {Math.abs(s.delta)}{typeof s.delta === "number" && s.delta % 1 !== 0 ? "%" : ""}
                    </span>
                  )}
                </div>
                <div className="db-stat-value" style={{ color: accent }}>{s.value.toLocaleString()}</div>
                <div className="db-stat-label">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Row 1: Patient Trend + Appointments ── */}
        <div className="db-grid-2">

          {/* Patient Trend */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title"><span>📈</span> Patient Trend</div>
              <div className="db-tabs">
                {["week","month","year"].map(t => (
                  <button key={t} className={`db-tab${activeTab===t?" active":""}`}
                    onClick={() => setActiveTab(t)}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="db-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patientTrend} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradDis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94a3b8", fontFamily:"Sora" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:"#94a3b8", fontFamily:"Sora" }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize:11, fontFamily:"Sora" }} iconType="circle" iconSize={7}/>
                  <Area type="monotone" dataKey="new"        name="New"        stroke="#0ea5e9" strokeWidth={2} fill="url(#gradNew)" dot={false}/>
                  <Area type="monotone" dataKey="discharged" name="Discharged" stroke="#22c55e" strokeWidth={2} fill="url(#gradDis)" dot={false}/>
                  <Line type="monotone" dataKey="readmitted" name="Readmitted" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Appointment Bar Chart */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title"><span>📅</span> Weekly Appointments</div>
            </div>
            <div className="db-bar-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData} barSize={10} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="day" tick={{ fontSize:11, fill:"#94a3b8", fontFamily:"Sora" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:"#94a3b8", fontFamily:"Sora" }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{ fontSize:11, fontFamily:"Sora" }} iconType="circle" iconSize={7}/>
                  <Bar dataKey="completed" name="Completed" fill="#0ea5e9" radius={[4,4,0,0]}/>
                  <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[4,4,0,0]}/>
                  <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 2: Patients Table + Department Pie ── */}
        <div className="db-grid-3">

          {/* Recent Patients */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title"><span>🧑</span> Recent Patients</div>
              <span style={{ fontSize:"0.68rem", color:"#0ea5e9", cursor:"pointer", fontWeight:600 }}>View All →</span>
            </div>
            <table className="db-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Dept</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="db-patient-name">{p.name}</div>
                      <div className="db-patient-id">{p.id} · {p.age}y</div>
                    </td>
                    <td style={{ color:"#334155" }}>{p.dept}</td>
                    <td>
                      <span className="db-status-pill"
                        style={{ background: STATUS_BG[p.status], color: STATUS_TEXT[p.status] }}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <span className="db-risk-dot" style={{ background: RISK_COLOR[p.risk] }}/>
                      <span style={{ fontSize:"0.68rem", color: RISK_COLOR[p.risk], fontWeight:600, textTransform:"capitalize" }}>
                        {p.risk}
                      </span>
                    </td>
                    <td style={{ color:"#94a3b8", fontSize:"0.67rem" }}>{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Department Distribution */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title"><span>🏥</span> By Department</div>
            </div>
            <div className="db-pie-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={departmentData} dataKey="patients" nameKey="name"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={3} strokeWidth={0}>
                    {departmentData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="db-dept-legend">
              {departmentData.map(d => {
                const max = Math.max(...departmentData.map(x => x.patients));
                return (
                  <div className="db-dept-row" key={d.name}>
                    <div className="db-dept-dot" style={{ background:d.color }}/>
                    <div className="db-dept-name">{d.name}</div>
                    <div className="db-dept-bar-wrap">
                      <div className="db-dept-bar-fill" style={{ width:`${(d.patients/max)*100}%`, background:d.color }}/>
                    </div>
                    <div className="db-dept-count">{d.patients}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Row 3: Doctors + Alerts + AI Insights ── */}
        <div className="db-grid-bot">

          {/* Doctor Activity */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title"><span>👨‍⚕️</span> Doctor Activity</div>
              <span style={{ fontSize:"0.68rem", color:"#0ea5e9", cursor:"pointer", fontWeight:600 }}>Manage →</span>
            </div>
            <div className="db-doctor-list">
              {doctorActivity.map((doc, i) => {
                const initials = doc.name.split(" ").filter((_,j)=>j>0).map(w=>w[0]).join("").slice(0,2);
                return (
                  <div className="db-doctor-row" key={i}>
                    <div className="db-doctor-avatar">{initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="db-doctor-name">{doc.name}</div>
                      <div className="db-doctor-spec">{doc.specialty}</div>
                    </div>
                    <div className="db-doc-status-dot" style={{ background: DOC_STATUS[doc.status] }}/>
                    <div style={{ textAlign:"right" }}>
                      <div className="db-doctor-pts">{doc.patients}</div>
                      <div className="db-doctor-pts-label">patients</div>
                    </div>
                    <div style={{ fontSize:"0.7rem", color:"#f59e0b", fontWeight:700, minWidth:28 }}>
                      ★ {doc.rating}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title"><span>🔔</span> System Alerts</div>
              <span style={{ background:"#fff1f2", color:"#ef4444", fontSize:"0.62rem",
                fontWeight:700, padding:"3px 8px", borderRadius:99, border:"1px solid #fecaca" }}>
                {alerts.filter(a=>a.type==="critical").length} Critical
              </span>
            </div>
            <div className="db-alerts-list">
              {alerts.map(a => {
                const m = ALERT_META[a.type];
                return (
                  <div className="db-alert-item" key={a.id}
                    style={{ background:m.bg, borderColor:m.border }}>
                    <span className="db-alert-icon">{m.icon}</span>
                    <div style={{ flex:1 }}>
                      <div className="db-alert-msg" style={{ color: m.color === "#0ea5e9" ? "#0f172a" : m.color }}>
                        {a.msg}
                      </div>
                      <div className="db-alert-time">{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights */}
          <div className="db-card" style={{ background:"linear-gradient(160deg,#0c1c3a 0%,#0f3460 100%)", border:"none" }}>
            <div className="db-card-header">
              <div className="db-card-title" style={{ color:"#fff" }}><span>🤖</span> AI Insights</div>
              <span className="db-ai-tag">Aroha AI Engine</span>
            </div>
            <div className="db-ai-grid">
              {[
                { val: aiInsights.summariesGenerated, label: "Summaries Generated" },
                { val: `${aiInsights.accuracyScore}%`, label: "Accuracy Score" },
                { val: aiInsights.avgProcessingTime, label: "Avg Processing Time" },
                { val: aiInsights.flaggedRecords, label: "Flagged Records" },
              ].map((m, i) => (
                <div className="db-ai-metric" key={i}>
                  <div className="db-ai-metric-val">{m.val}</div>
                  <div className="db-ai-metric-label">{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:4, marginBottom:6 }}>
              <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.38)", marginBottom:4 }}>
                AI Summaries — Last 7 days
              </div>
              <div className="db-ai-sparkline">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aiInsights.trend} margin={{ top:0, right:0, left:0, bottom:0 }}>
                    <defs>
                      <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" hide/>
                    <YAxis hide/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="val" name="Summaries"
                      stroke="#818cf8" strokeWidth={2} fill="url(#aiGrad)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

// ─── Loading / Error screens ───────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="db-loading">
    <div className="db-spinner"/>
    <p style={{ fontSize:"0.8rem", color:"#94a3b8", fontFamily:"Sora,sans-serif" }}>Loading dashboard…</p>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="db-error">
    <div style={{ fontSize:"2rem" }}>⚠️</div>
    <p style={{ fontSize:"0.9rem", fontWeight:600, fontFamily:"Sora,sans-serif" }}>Failed to load dashboard</p>
    <p style={{ fontSize:"0.75rem", color:"#94a3b8", fontFamily:"Sora,sans-serif" }}>{message}</p>
    <button onClick={() => window.location.reload()}
      style={{ marginTop:8, padding:"8px 20px", background:"#0ea5e9", color:"#fff",
               border:"none", borderRadius:8, cursor:"pointer", fontFamily:"Sora,sans-serif",
               fontSize:"0.78rem", fontWeight:600 }}>
      Retry
    </button>
  </div>
);

export default AdminDashboard;