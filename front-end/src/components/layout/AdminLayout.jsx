import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    group: "Overview", 
    items: [
      { to: "/admin/dashboard",    label: "Dashboard",        icon: "▣",  badge: null },
    ],
  },
  {
    group: "Management",
    items: [
      { to: "/admin/doctors/create",      label: "Doctors"},
      { to: "/admin/patients/create",     label: "Patients" },
      { to: "/admin/records",      label: "Medical Records"},
    ],
  },
];

const NOTIFICATIONS = [
  { id: 1, title: "New patient registered",      sub: "Samuel Thomas — 2 min ago",     color: "#14b8a6", read: false },
  { id: 2, title: "Dr. Kavya Menon joined",      sub: "Dermatology dept — 18 min ago", color: "#0ea5e9", read: false },
  { id: 3, title: "Lab report uploaded",         sub: "Patient Rohan Varma — 1hr ago",  color: "#f59e0b", read: false },
  { id: 4, title: "AI summary generated",        sub: "Patient #4821 — 2 hrs ago",    color: "#8b5cf6", read: true  },
  { id: 5, title: "Appointment #1039 cancelled", sub: "By patient — 5 hrs ago",       color: "#ef4444", read: true  },
];

// ─── Breadcrumb helper ────────────────────────────────────────────────────────
const CRUMB_MAP = {
  "admin":        "Admin",
  "dashboard":    "Dashboard",
  "analytics":    "Analytics",
  "doctors":      "Doctors",
  "patients":     "Patients",
  "appointments": "Appointments",
  "records":      "Medical Records",
  "reports":      "Reports",
  "settings":     "Settings",
  "audit":        "Audit Log",
};

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed]         = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [searchVal, setSearchVal]         = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const unread = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Breadcrumbs from path
  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs   = segments.map((seg, i) => ({
    label: CRUMB_MAP[seg] || seg,
    path:  "/" + segments.slice(0, i + 1).join("/"),
    last:  i === segments.length - 1,
  }));

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sideW = collapsed ? "64px" : "240px";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root { height: 100%; }

        .al-root {
          display: flex;
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'Sora', sans-serif;
          color: #0f172a;
        }

        /* ══════════════ SIDEBAR ══════════════ */
        .al-sidebar {
          width: ${sideW};
          min-height: 100vh;
          background: linear-gradient(175deg, #0c1c3a 0%, #0f3460 58%, #0e4a6e 100%);
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          flex-shrink: 0;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 100;
          box-shadow: 4px 0 24px rgba(0,0,0,0.18);
        }

        /* Logo area */
        .al-logo {
          height: 68px;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }

        .al-logo-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }

        .al-logo-wrap { overflow: hidden; white-space: nowrap; opacity: ${collapsed ? 0 : 1}; transition: opacity 0.2s; }
        .al-logo-name { font-size: 0.95rem; font-weight: 700; color: #fff; line-height: 1.1; }
        .al-logo-sub  { font-size: 0.55rem; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }

        /* Nav scroll area */
        .al-nav-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem 0.5rem;
          scrollbar-width: none;
        }
        .al-nav-scroll::-webkit-scrollbar { display: none; }

        /* Nav group */
        .al-nav-group { margin-bottom: 0.25rem; }

        .al-nav-group-label {
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.28);
          padding: 0.6rem 0.75rem 0.35rem;
          white-space: nowrap;
          overflow: hidden;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
          height: ${collapsed ? "0" : "auto"};
          pointer-events: none;
        }

        /* Nav item */
        .al-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 11px;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.18s ease;
          color: rgba(255,255,255,0.52);
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-decoration: none;
          position: relative;
          border: 1px solid transparent;
          margin-bottom: 1px;
        }

        .al-nav-item:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.88);
        }

        .al-nav-item.active {
          background: rgba(14,165,233,0.16);
          border-color: rgba(14,165,233,0.28);
          color: #7dd3fc;
        }

        .al-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: #38bdf8;
          border-radius: 0 3px 3px 0;
        }

        .al-nav-icon { font-size: 0.95rem; flex-shrink: 0; width: 20px; text-align: center; }

        .al-nav-label { flex: 1; opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s; overflow: hidden; }

        .al-nav-badge {
          font-size: 0.55rem; font-weight: 700;
          background: rgba(14,165,233,0.25);
          color: #7dd3fc;
          padding: 2px 6px; border-radius: 99px;
          flex-shrink: 0;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
        }

        /* Divider */
        .al-nav-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0.5rem 0.75rem;
        }

        /* Collapse toggle */
        .al-collapse-btn {
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? "center" : "flex-end"};
          padding: 0 1rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          cursor: pointer;
          flex-shrink: 0;
        }

        .al-collapse-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5);
          font-size: 0.75rem;
          transition: all 0.2s;
          transform: rotate(${collapsed ? "180deg" : "0deg"});
        }

        .al-collapse-btn:hover .al-collapse-icon {
          background: rgba(255,255,255,0.13);
          color: rgba(255,255,255,0.9);
        }

        /* User card at bottom */
        .al-user-card {
          padding: 0.75rem 0.5rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }

        .al-user-inner {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 11px; border-radius: 9px;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          transition: background 0.18s;
          overflow: hidden;
        }
        .al-user-inner:hover { background: rgba(255,255,255,0.1); }

        .al-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg,#0ea5e9,#6366f1);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: #fff;
          flex-shrink: 0; letter-spacing: 0.03em;
        }

        .al-user-info { overflow: hidden; opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s; }
        .al-user-name { font-size: 0.75rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .al-user-role { font-size: 0.58rem; color: rgba(255,255,255,0.38); margin-top: 1px; }

        /* ══════════════ MAIN AREA ══════════════ */
        .al-main {
          margin-left: ${sideW};
          transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-width: 0;
        }

        /* ══════════════ TOPBAR ══════════════ */
        .al-topbar {
          height: 68px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.75rem;
          position: sticky; top: 0; z-index: 90;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          gap: 12px;
        }

        .al-topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }

        .al-hamburger {
          width: 34px; height: 34px; flex-shrink: 0;
          border-radius: 8px; border: 1.5px solid #e2e8f0;
          background: #f8fafc; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; transition: background 0.15s;
          color: #475569;
        }
        .al-hamburger:hover { background: #f1f5f9; }

        /* Breadcrumbs */
        .al-breadcrumbs {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; color: #94a3b8;
          overflow: hidden;
        }

        .al-bc-item {
          white-space: nowrap;
          text-decoration: none;
          color: #94a3b8;
          transition: color 0.15s;
        }
        .al-bc-item:hover { color: #0ea5e9; }
        .al-bc-item.last  { color: #0f172a; font-weight: 600; pointer-events: none; }
        .al-bc-sep { color: #cbd5e1; font-size: 0.65rem; }

        /* Search */
        .al-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #f8fafc;
          border: 1.5px solid ${searchFocused ? "#0ea5e9" : "#e2e8f0"};
          border-radius: 9px;
          padding: 0 12px;
          height: 36px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: ${searchFocused ? "0 0 0 3px rgba(14,165,233,0.1)" : "none"};
          min-width: 180px;
        }

        .al-search-input {
          border: none; background: transparent;
          font-size: 0.78rem; color: #0f172a;
          font-family: 'Sora', sans-serif;
          outline: none; width: 140px;
        }
        .al-search-input::placeholder { color: #94a3b8; }

        .al-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* Icon buttons */
        .al-icon-btn {
          width: 34px; height: 34px;
          border-radius: 9px; border: 1.5px solid #e2e8f0;
          background: #f8fafc; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; transition: background 0.15s;
          position: relative;
        }
        .al-icon-btn:hover { background: #f1f5f9; }

        .al-notif-dot {
          position: absolute; top: 5px; right: 5px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #ef4444;
          border: 1.5px solid #fff;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .al-notif-count {
          position: absolute; top: -4px; right: -4px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #ef4444; color: #fff;
          font-size: 0.55rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #fff;
        }

        /* Status pill */
        .al-status-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          font-size: 0.65rem; font-weight: 600; color: #16a34a;
        }
        .al-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 2px rgba(34,197,94,0.25)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0.1)} }

        /* Topbar avatar */
        .al-topbar-avatar {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg,#0ea5e9,#6366f1);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: #fff;
          cursor: pointer; border: 2px solid #e2e8f0;
          position: relative;
        }

        /* ══════════════ DROPDOWN PANEL ══════════════ */
        .al-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(15,23,42,0.14);
          z-index: 200;
          overflow: hidden;
          animation: dropIn 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .al-notif-panel { width: 340px; }
        .al-profile-panel { width: 220px; }

        .al-dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .al-dropdown-title { font-size: 0.82rem; font-weight: 700; color: #0f172a; }
        .al-dropdown-action {
          font-size: 0.68rem; color: #0ea5e9;
          cursor: pointer; font-weight: 600;
        }
        .al-dropdown-action:hover { text-decoration: underline; }

        .al-notif-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 11px 16px;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.12s;
          cursor: pointer;
        }
        .al-notif-item:last-child { border-bottom: none; }
        .al-notif-item:hover { background: #f8fafc; }
        .al-notif-item.unread { background: #f0f9ff; }

        .al-notif-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; flex-shrink: 0;
        }

        .al-notif-body { flex: 1; min-width: 0; }
        .al-notif-title { font-size: 0.75rem; font-weight: 600; color: #0f172a; line-height: 1.3; }
        .al-notif-sub   { font-size: 0.67rem; color: #94a3b8; margin-top: 2px; }
        .al-notif-unread-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #0ea5e9; flex-shrink: 0; margin-top: 5px;
        }

        /* Profile dropdown */
        .al-profile-info {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 10px;
        }

        .al-profile-name { font-size: 0.8rem; font-weight: 700; color: #0f172a; }
        .al-profile-email { font-size: 0.65rem; color: #94a3b8; margin-top: 1px; }

        .al-profile-menu { padding: 6px 8px; }

        .al-profile-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px; border-radius: 8px;
          font-size: 0.78rem; color: #334155;
          cursor: pointer; transition: background 0.12s;
          text-decoration: none;
        }
        .al-profile-item:hover { background: #f8fafc; }
        .al-profile-item.danger { color: #ef4444; }
        .al-profile-item.danger:hover { background: #fff1f2; }

        .al-profile-divider { height: 1px; background: #f1f5f9; margin: 4px 10px; }

        /* ══════════════ CONTENT ══════════════ */
        .al-content {
          flex: 1;
          padding: 1.75rem;
          overflow-y: auto;
        }
        .al-content::-webkit-scrollbar { width: 5px; }
        .al-content::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

        /* ══════════════ FOOTER ══════════════ */
        .al-footer {
          height: 44px;
          background: #fff;
          border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.75rem;
          font-size: 0.65rem; color: #94a3b8;
          flex-shrink: 0;
        }

        .al-footer-links { display: flex; gap: 16px; }
        .al-footer-link { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
        .al-footer-link:hover { color: #0ea5e9; }

        /* Tooltip for collapsed sidebar */
        .al-nav-item[title]:hover::after {
          content: attr(title);
          position: absolute;
          left: calc(100% + 10px);
          top: 50%; transform: translateY(-50%);
          background: #0f172a;
          color: #fff;
          font-size: 0.72rem;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 300;
          opacity: ${collapsed ? 1 : 0};
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      `}</style>

      <div className="al-root">

        {/* ══ SIDEBAR ══ */}
        <aside className="al-sidebar">

          {/* Logo */}
          <div className="al-logo">
            <div className="al-logo-icon">🏥</div>
            <div className="al-logo-wrap">
              <div className="al-logo-name">Aroha AI</div>
              <div className="al-logo-sub">Admin Portal</div>
            </div>
          </div>

          {/* Nav */}
          <div className="al-nav-scroll">
            {NAV_GROUPS.map((group, gi) => (
              <div className="al-nav-group" key={gi}>
                <div className="al-nav-group-label">{group.group}</div>
                {group.items.map(item => {
                  const isActive = location.pathname === item.to ||
                    (item.to !== "/admin/dashboard" && location.pathname.startsWith(item.to));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`al-nav-item${isActive ? " active" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="al-nav-icon">{item.icon}</span>
                      <span className="al-nav-label">{item.label}</span>
                      {item.badge && <span className="al-nav-badge">{item.badge}</span>}
                    </Link>
                  );
                })}
                {gi < NAV_GROUPS.length - 1 && <div className="al-nav-divider"/>}
              </div>
            ))}
          </div>

          {/* User card */}
          <div className="al-user-card">
            <div className="al-user-inner">
              <div className="al-avatar">AD</div>
              <div className="al-user-info">
                <div className="al-user-name">Admin User</div>
                <div className="al-user-role">Super Administrator</div>
              </div>
            </div>
          </div>

          {/* Collapse toggle */}
          <div className="al-collapse-btn" onClick={() => setCollapsed(c => !c)}>
            <div className="al-collapse-icon">◀</div>
          </div>

        </aside>

        {/* ══ MAIN ══ */}
        <div className="al-main">

          {/* ── Topbar ── */}
          <header className="al-topbar">
            <div className="al-topbar-left">

              {/* Hamburger */}
              <div className="al-hamburger" onClick={() => setCollapsed(c => !c)}>☰</div>

              {/* Breadcrumbs */}
              <nav className="al-breadcrumbs">
                <Link to="/admin/dashboard" className="al-bc-item">🏠</Link>
                {crumbs.map((c, i) => (
                  <React.Fragment key={i}>
                    <span className="al-bc-sep">›</span>
                    <Link to={c.path} className={`al-bc-item${c.last ? " last" : ""}`}>
                      {c.label}
                    </Link>
                  </React.Fragment>
                ))}
              </nav>
            </div>

            <div className="al-topbar-right">

              {/* Search */}
              <div className="al-search-wrap">
                <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>🔍</span>
                <input
                  className="al-search-input"
                  placeholder="Search patients, doctors…"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>

              {/* System status */}
              <div className="al-status-pill">
                <div className="al-status-dot"/>
                System Online
              </div>

              {/* Notifications */}
              <div style={{ position: "relative" }} ref={notifRef}>
                <div
                  className="al-icon-btn"
                  onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                >
                  🔔
                  {unread > 0 && <span className="al-notif-count">{unread}</span>}
                </div>

                {notifOpen && (
                  <div className="al-dropdown al-notif-panel">
                    <div className="al-dropdown-header">
                      <span className="al-dropdown-title">Notifications {unread > 0 && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>({unread} new)</span>}</span>
                      <span className="al-dropdown-action" onClick={markAllRead}>Mark all read</span>
                    </div>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`al-notif-item${!n.read ? " unread" : ""}`}
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                      >
                        <div className="al-notif-icon" style={{ background: n.color + "18" }}>{n.icon}</div>
                        <div className="al-notif-body">
                          <div className="al-notif-title">{n.title}</div>
                          <div className="al-notif-sub">{n.sub}</div>
                        </div>
                        {!n.read && <div className="al-notif-unread-dot"/>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div style={{ position: "relative" }} ref={profileRef}>
                <div
                  className="al-topbar-avatar"
                  onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                >
                  AD
                </div>

                {profileOpen && (
                  <div className="al-dropdown al-profile-panel">
                    <div className="al-profile-info">
                      <div className="al-avatar">AD</div>
                      <div>
                        <div className="al-profile-name">Admin User</div>
                        <div className="al-profile-email">admin@arohaai.com</div>
                      </div>
                    </div>
                    <div className="al-profile-menu">
                      <Link to="/admin/settings" className="al-profile-item" onClick={() => setProfileOpen(false)}>
                        <span>⚙️</span> Settings
                      </Link>
                      <Link to="/admin/audit" className="al-profile-item" onClick={() => setProfileOpen(false)}>
                        <span>🔍</span> Audit Log
                      </Link>
                      <div className="al-profile-divider"/>
                      <div className="al-profile-item danger" onClick={handleLogout}>
                        <span>🚪</span> Sign Out
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* ── Page Content ── */}
          <main className="al-content">
            <Outlet />
          </main>

          {/* ── Footer ── */}
          <footer className="al-footer">
            <span>© {new Date().getFullYear()} Aroha AI — Medical Records Platform</span>
            <div className="al-footer-links">
              <a href="#" className="al-footer-link">Privacy Policy</a>
              <a href="#" className="al-footer-link">Terms of Use</a>
              <a href="#" className="al-footer-link">Support</a>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
};

export default AdminLayout;