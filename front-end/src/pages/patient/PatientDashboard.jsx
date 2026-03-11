import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  API CONFIG
//  Set USE_REAL_API = true and BASE_URL when backend is ready.
//  Patient token is read from localStorage under "token".
// ─────────────────────────────────────────────────────────────────────────────
const API = {
  BASE_URL: "http://localhost:5000/api",
  USE_REAL_API: false,
  EP: {
    profile:       "/patient/me",
    records:       "/patient/records",
    appointments:  "/patient/appointments",
    medications:   "/patient/medications",
    vitals:        "/patient/vitals",
    notifications: "/patient/notifications",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  DUMMY DATA
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_PROFILE = {
  id: "P-1001", name: "Aisha Nair", email: "aisha.nair@gmail.com",
  phone: "+91 94400 11111", dob: "1990-04-12", age: 34,
  gender: "Female", bloodGroup: "B+",
  address: "12 MG Road, Kochi, Kerala — 682001",
  assignedDoctor: "Dr. Arjun Pillai", department: "Cardiology",
  diagnosis: "Hypertension", status: "Admitted",
  insurance: "Star Health", insuranceId: "SH-2024-112233",
  emergencyContact: "Rahul Nair — +91 94400 99991",
  weight: "58 kg", height: "162 cm", bmi: "22.1",
  allergies: ["Penicillin"],
  avatar: "AN", joinedDate: "2021-03-15",
};

const DUMMY_VITALS = [
  { label: "Blood Pressure", value: "124/82", unit: "mmHg", icon: "❤️", status: "Moderate", trend: "+2", date: "Today" },
  { label: "Heart Rate",     value: "78",      unit: "bpm",  icon: "💓", status: "Normal",   trend: "-3", date: "Today" },
  { label: "Blood Sugar",    value: "108",     unit: "mg/dL",icon: "🩸", status: "Normal",   trend: "+5", date: "Today" },
  { label: "Weight",         value: "58",      unit: "kg",   icon: "⚖️", status: "Normal",   trend: "0",  date: "Today" },
  { label: "SpO₂",           value: "98",      unit: "%",    icon: "🫁", status: "Normal",   trend: "+1", date: "Today" },
  { label: "Temperature",    value: "98.4",    unit: "°F",   icon: "🌡️", status: "Normal",   trend: "0",  date: "Today" },
];

const DUMMY_RECORDS = [
  { id:"REC-001", type:"Lab Report",        icon:"🧪", color:"#0ea5e9", title:"Complete Blood Count (CBC)",       date:"2025-03-08", doctor:"Dr. Arjun Pillai", severity:"Moderate", aiSummary:"CBC shows mild anaemia. Iron supplementation initiated. Follow-up in 2 weeks.", attachments:["CBC_Report_Mar08.pdf"], tags:["Blood Test","Anaemia"] },
  { id:"REC-002", type:"Prescription",      icon:"💊", color:"#6366f1", title:"Antihypertensive Medication",      date:"2025-03-01", doctor:"Dr. Arjun Pillai", severity:"Moderate", aiSummary:"BP management started with Amlodipine & Telmisartan. DASH diet recommended.", attachments:["Prescription_Mar01.pdf"], tags:["Hypertension","Prescription"] },
  { id:"REC-003", type:"Consultation Note", icon:"🩺", color:"#8b5cf6", title:"Cardiology Follow-up Consultation", date:"2025-02-15", doctor:"Dr. Arjun Pillai", severity:"Mild",     aiSummary:"Routine follow-up. BP improved to 132/86. Continue current medication regime.", attachments:[], tags:["Follow-up","Cardiology"] },
  { id:"REC-004", type:"Imaging",           icon:"🫁", color:"#14b8a6", title:"Chest X-Ray — Routine Screening",  date:"2025-01-20", doctor:"Dr. Nikhil Thomas", severity:"Normal",   aiSummary:"Chest X-ray shows clear lung fields. No active cardiopulmonary disease detected.", attachments:["Xray_Jan20.jpg"], tags:["Imaging","Clear"] },
];

const DUMMY_APPOINTMENTS = [
  { id:"APT-001", doctor:"Dr. Arjun Pillai", specialty:"Cardiology",     date:"2025-03-15", time:"10:30 AM", type:"Follow-up",    status:"Upcoming",   location:"OPD Room 4, Floor 2", avatar:"AP", notes:"Bring previous BP readings." },
  { id:"APT-002", doctor:"Dr. Arjun Pillai", specialty:"Cardiology",     date:"2025-03-01", time:"11:00 AM", type:"Consultation", status:"Completed",  location:"OPD Room 4, Floor 2", avatar:"AP", notes:"" },
  { id:"APT-003", doctor:"Dr. Kavya Menon",  specialty:"Dermatology",    date:"2025-02-10", time:"09:00 AM", type:"Routine",      status:"Completed",  location:"OPD Room 7, Floor 1", avatar:"KM", notes:"" },
  { id:"APT-004", doctor:"Dr. Nikhil Thomas",specialty:"Radiology",      date:"2025-01-20", time:"07:30 AM", type:"Imaging",      status:"Completed",  location:"Radiology Dept.",    avatar:"NT", notes:"" },
  { id:"APT-005", doctor:"Dr. Arjun Pillai", specialty:"Cardiology",     date:"2025-04-12", time:"10:00 AM", type:"Follow-up",    status:"Scheduled",  location:"OPD Room 4, Floor 2", avatar:"AP", notes:"3-month review." },
];

const DUMMY_MEDICATIONS = [
  { id:"MED-001", name:"Amlodipine",     dose:"5mg",    freq:"Once daily",   time:"Morning",  duration:"Ongoing",          purpose:"Blood pressure control", remaining:18, total:30, color:"#0ea5e9" },
  { id:"MED-002", name:"Telmisartan",    dose:"40mg",   freq:"Once daily",   time:"Morning",  duration:"Ongoing",          purpose:"Blood pressure control", remaining:18, total:30, color:"#6366f1" },
  { id:"MED-003", name:"Ferrous Sulfate",dose:"200mg",  freq:"Twice daily",  time:"After food",duration:"6 weeks",         purpose:"Iron deficiency anaemia",remaining:22, total:60, color:"#f59e0b" },
  { id:"MED-004", name:"Folic Acid",     dose:"5mg",    freq:"Once daily",   time:"Morning",  duration:"6 weeks",          purpose:"Anaemia support",        remaining:22, total:42, color:"#10b981" },
];

const DUMMY_NOTIFICATIONS = [
  { id:1, type:"appointment", msg:"Appointment with Dr. Arjun Pillai on Mar 15 at 10:30 AM", time:"2 hrs ago",   read:false, icon:"📅" },
  { id:2, type:"record",      msg:"New lab report uploaded: Complete Blood Count (CBC)",       time:"1 day ago",   read:false, icon:"🧪" },
  { id:3, type:"medication",  msg:"Reminder: Take Amlodipine — Morning dose",                 time:"3 hrs ago",   read:true,  icon:"💊" },
  { id:4, type:"ai",          msg:"AI health summary updated for your latest records",         time:"1 day ago",   read:true,  icon:"🤖" },
  { id:5, type:"billing",     msg:"Insurance claim #SH-2024-112233 approved",                 time:"3 days ago",  read:true,  icon:"🛡" },
];

const BLOOD_PRESSURE_TREND = [
  { day:"Mon", sys:148, dia:92 },{ day:"Tue", sys:142, dia:88 },
  { day:"Wed", sys:138, dia:86 },{ day:"Thu", sys:135, dia:84 },
  { day:"Fri", sys:132, dia:83 },{ day:"Sat", sys:128, dia:82 },
  { day:"Sun", sys:124, dia:80 },
];

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";

const VITAL_STATUS = {
  Normal:   { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e" },
  Moderate: { bg:"#fffbeb", color:"#92400e", dot:"#f59e0b" },
  High:     { bg:"#fff1f2", color:"#be123c", dot:"#ef4444" },
};
const APT_STATUS = {
  Upcoming:  { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
  Scheduled: { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" },
  Completed: { bg:"#f8fafc", color:"#475569", border:"#e2e8f0" },
  Cancelled: { bg:"#fff1f2", color:"#be123c", border:"#fecdd3" },
};
const SEV_COLOR = {
  Normal:   "#15803d", Mild:"#0369a1", Moderate:"#92400e", Severe:"#c2410c", Critical:"#be123c"
};
const SEV_BG = {
  Normal:"#f0fdf4", Mild:"#f0f9ff", Moderate:"#fffbeb", Severe:"#fff7ed", Critical:"#fff1f2"
};

const AVATAR_COLORS = ["#0ea5e9","#14b8a6","#f59e0b","#6366f1","#10b981","#ef4444","#8b5cf6","#ec4899"];
const avatarColor = s => AVATAR_COLORS[(s?.charCodeAt(0)??0) % AVATAR_COLORS.length];
const initials = n => n ? n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";

function useDummyData(key, delay=400) {
  const MAP = { profile:DUMMY_PROFILE, vitals:DUMMY_VITALS, records:DUMMY_RECORDS, appointments:DUMMY_APPOINTMENTS, medications:DUMMY_MEDICATIONS, notifications:DUMMY_NOTIFICATIONS };
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{
     
    setLoading(true);
    if (!API.USE_REAL_API) { const t=setTimeout(()=>{setData(MAP[key]);setLoading(false);},delay+Math.random()*200); return ()=>clearTimeout(t); }
    fetch(`${API.BASE_URL}${API.EP[key]}`,{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}})
      .then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>{setData(MAP[key]);setLoading(false);});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key]);
  return {data,loading};
}

function Skel({h=18,w="100%",r=8}){
  return <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#f1f5f9 25%,#e8edf4 50%,#f1f5f9 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MINI SPARKLINE (pure CSS-free SVG)
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color="#0ea5e9", h=40 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v,i)=>{
    const x = (i/(data.length-1))*100;
    const y = h - ((v-min)/(max-min||1))*(h-6)-3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} 100,${h}`} fill={`url(#sg-${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  RECORD DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function RecordModal({ record, onClose }) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:"rgba(10,20,40,0.65)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .2s ease"}}>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:580,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.25)",animation:"slideUp .28s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:5,borderRadius:"20px 20px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:40,height:40,borderRadius:11,background:record.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>{record.icon}</div>
            <div>
              <div style={{fontSize:"0.93rem",fontWeight:800,color:"#0f172a"}}>{record.title}</div>
              <div style={{fontSize:"0.65rem",color:record.color,fontWeight:700,marginTop:1}}>{record.type} · {fmtDate(record.date)}</div>
            </div>
          </div>
          <div onClick={onClose} style={{width:32,height:32,borderRadius:9,background:"#f8fafc",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b"}}>✕</div>
        </div>
        <div style={{padding:"1.5rem",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{padding:"3px 10px",borderRadius:99,background:SEV_BG[record.severity],color:SEV_COLOR[record.severity],fontSize:"0.65rem",fontWeight:700,border:`1px solid ${SEV_COLOR[record.severity]}33`}}>{record.severity}</span>
            {record.tags?.map(t=><span key={t} style={{padding:"3px 10px",borderRadius:99,background:"#f1f5f9",color:"#475569",fontSize:"0.65rem",fontWeight:600,border:"1px solid #e2e8f0"}}>{t}</span>)}
          </div>
          <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:"0.62rem",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Attending Doctor</div>
            <div style={{fontSize:"0.8rem",fontWeight:700,color:"#0f172a"}}>{record.doctor}</div>
          </div>
          {record.aiSummary && (
            <div style={{background:"linear-gradient(135deg,#f5f3ff,#eff6ff)",borderRadius:12,padding:"14px",border:"1px solid #e0e7ff"}}>
              <div style={{fontSize:"0.65rem",color:"#6366f1",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>🤖 AI Summary <span style={{fontWeight:400,color:"#818cf8",textTransform:"none",letterSpacing:0}}>by Aroha AI</span></div>
              <div style={{fontSize:"0.78rem",color:"#1e1b4b",lineHeight:1.65}}>{record.aiSummary}</div>
            </div>
          )}
          {record.attachments?.length>0 && (
            <div>
              <div style={{fontSize:"0.62rem",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Attachments</div>
              {record.attachments.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,background:"#f8fafc",border:"1px solid #e2e8f0",marginBottom:6,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
                  <span>{f.endsWith(".pdf")?"📄":f.match(/\.(jpg|jpeg|png)$/i)?"🖼":"📎"}</span>
                  <span style={{fontSize:"0.76rem",fontWeight:600,color:"#0f172a",flex:1}}>{f}</span>
                  <span style={{fontSize:"0.68rem",color:"#0ea5e9",fontWeight:700}}>↓ Download</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION PANEL
// ─────────────────────────────────────────────────────────────────────────────
function NotifPanel({ notifs, onMarkAllRead }) {
  return (
    <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,background:"#fff",borderRadius:14,border:"1px solid #e2e8f0",boxShadow:"0 12px 40px rgba(0,0,0,.14)",width:340,zIndex:200,overflow:"hidden",animation:"dropDown .18s cubic-bezier(.22,1,.36,1)"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:"0.83rem",fontWeight:800,color:"#0f172a"}}>Notifications</span>
        <span onClick={onMarkAllRead} style={{fontSize:"0.68rem",color:"#0ea5e9",fontWeight:700,cursor:"pointer"}}>Mark all read</span>
      </div>
      {notifs.map(n=>(
        <div key={n.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"11px 16px",borderBottom:"1px solid #f8fafc",background:n.read?"#fff":"#f0f9ff",cursor:"pointer",transition:"background .12s"}}
          onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background=n.read?"#fff":"#f0f9ff"}>
          <div style={{width:32,height:32,borderRadius:9,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",flexShrink:0}}>{n.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"0.73rem",fontWeight:n.read?500:700,color:"#0f172a",lineHeight:1.35}}>{n.msg}</div>
            <div style={{fontSize:"0.62rem",color:"#94a3b8",marginTop:2}}>{n.time}</div>
          </div>
          {!n.read && <div style={{width:7,height:7,borderRadius:"50%",background:"#0ea5e9",flexShrink:0,marginTop:5}}/>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, sub, action, actionLabel, children }) {
  return (
    <div style={{marginBottom:"1.75rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",gap:10}}>
        <div>
          <div style={{fontSize:"1rem",fontWeight:800,color:"#0f172a"}}>{title}</div>
          {sub && <div style={{fontSize:"0.68rem",color:"#94a3b8",marginTop:2}}>{sub}</div>}
        </div>
        {action && <button onClick={action} style={{fontSize:"0.72rem",fontWeight:700,color:"#0ea5e9",background:"none",border:"none",cursor:"pointer",padding:"4px 0"}}>{actionLabel||"View all →"}</button>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGES
// ─────────────────────────────────────────────────────────────────────────────

function OverviewPage({ profile, vitals, records, appointments, medications, onViewRecord, onPage }) {
  const nextAppt = appointments?.find(a=>a.status==="Upcoming"||a.status==="Scheduled");
  const activeMeds = medications?.filter(m=>m.remaining>0)||[];
  const recentRecs = records?.slice(0,3)||[];

  return (
    <div style={{animation:"fadeUp .35s ease"}}>

      {/* Welcome hero */}
      <div style={{background:"linear-gradient(135deg,#0c1c3a 0%,#0f3460 55%,#0e4a6e 100%)",borderRadius:20,padding:"1.75rem 2rem",marginBottom:"1.5rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:200,height:200,borderRadius:"50%",background:"rgba(14,165,233,0.12)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-50,right:80,width:150,height:150,borderRadius:"50%",background:"rgba(99,102,241,0.1)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1.1rem",fontWeight:800,boxShadow:"0 8px 24px rgba(14,165,233,0.4)"}}>
              {profile?.avatar||"?"}
            </div>
            <div>
              <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)",fontWeight:600,marginBottom:2}}>Good {new Date().getHours()<12?"morning":"afternoon"},</div>
              <div style={{fontSize:"1.3rem",fontWeight:800,color:"#fff",lineHeight:1.1}}>{profile?.name?.split(" ")[0]||"Patient"} 👋</div>
              <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.45)",marginTop:3}}>{profile?.department} · {profile?.assignedDoctor}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {nextAppt && (
              <div style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"10px 16px",border:"1px solid rgba(255,255,255,0.12)",backdropFilter:"blur(8px)"}}>
                <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.45)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Next Appointment</div>
                <div style={{fontSize:"0.8rem",fontWeight:800,color:"#fff"}}>{fmtDate(nextAppt.date)}</div>
                <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.55)",marginTop:1}}>{nextAppt.time} · {nextAppt.doctor}</div>
              </div>
            )}
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"10px 16px",border:"1px solid rgba(255,255,255,0.12)",backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.45)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Active Meds</div>
              <div style={{fontSize:"0.8rem",fontWeight:800,color:"#fff"}}>{activeMeds.length}</div>
              <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.55)",marginTop:1}}>medications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals grid */}
      <Section title="My Vitals" sub="Last recorded today" action={()=>onPage("vitals")} actionLabel="View trends →">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12}}>
          {(vitals||Array(6).fill(null)).map((v,i)=>{
            const vs = VITAL_STATUS[v?.status||"Normal"];
            return (
              <div key={i} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"1rem",transition:"box-shadow .2s,transform .2s",cursor:"default",position:"relative",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.07)";e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)"}}>
                {v ? <>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:"1.3rem"}}>{v.icon}</div>
                    <span style={{fontSize:"0.58rem",fontWeight:700,padding:"2px 7px",borderRadius:99,background:vs.bg,color:vs.color}}>{v.status}</span>
                  </div>
                  <div style={{fontSize:"1.5rem",fontWeight:800,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{v.value}</div>
                  <div style={{fontSize:"0.62rem",color:"#94a3b8",marginTop:1}}>{v.unit}</div>
                  <div style={{fontSize:"0.65rem",color:"#0f172a",fontWeight:600,marginTop:4}}>{v.label}</div>
                  <div style={{fontSize:"0.6rem",color:v.trend==="+0"||v.trend==="0"?"#94a3b8":v.trend.startsWith("-")?"#15803d":"#c2410c",marginTop:2,fontWeight:600}}>
                    {v.trend==="0"?"→ Stable":v.trend.startsWith("-")?`↓ ${v.trend} vs last`:`↑ +${v.trend} vs last`}
                  </div>
                </> : <Skel h={90} r={8}/>}
              </div>
            );
          })}
        </div>
      </Section>

      {/* BP Trend mini chart */}
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"1.25rem",marginBottom:"1.75rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <div style={{fontSize:"0.88rem",fontWeight:800,color:"#0f172a"}}>Blood Pressure Trend</div>
            <div style={{fontSize:"0.65rem",color:"#94a3b8",marginTop:1}}>Systolic & Diastolic — Last 7 days</div>
          </div>
          <div style={{display:"flex",gap:12,fontSize:"0.65rem",fontWeight:700}}>
            <span style={{color:"#ef4444"}}>■ Systolic</span>
            <span style={{color:"#0ea5e9"}}>■ Diastolic</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
          {BLOOD_PRESSURE_TREND.map((d,i)=>{
            const maxSys=160, minSys=100, maxDia=100, minDia=60;
            const sysH = ((d.sys-minSys)/(maxSys-minSys))*70+10;
            const diaH = ((d.dia-minDia)/(maxDia-minDia))*70+10;
            return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:2,height:70}}>
                  <div style={{width:"40%",borderRadius:"3px 3px 0 0",background:"#ef444460",height:`${sysH}px`,transition:"height .5s ease",position:"relative"}}
                    title={`Sys: ${d.sys}`}/>
                  <div style={{width:"40%",borderRadius:"3px 3px 0 0",background:"#0ea5e960",height:`${diaH}px`,transition:"height .5s ease"}}
                    title={`Dia: ${d.dia}`}/>
                </div>
                <div style={{fontSize:"0.58rem",color:"#94a3b8",fontWeight:600}}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Records */}
      <Section title="Recent Records" sub="Your latest medical documents" action={()=>onPage("records")} actionLabel="View all →">
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {recentRecs.map(r=>(
            <div key={r.id} onClick={()=>onViewRecord(r)}
              style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all .15s",borderLeft:`3px solid ${r.color}`}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.07)";e.currentTarget.style.transform="translateX(3px)"}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateX(0)"}}>
              <div style={{width:38,height:38,borderRadius:10,background:r.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.78rem",fontWeight:700,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</div>
                <div style={{fontSize:"0.63rem",color:"#94a3b8",marginTop:1}}>{r.type} · {fmtDate(r.date)} · {r.doctor}</div>
              </div>
              <span style={{fontSize:"0.62rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:SEV_BG[r.severity],color:SEV_COLOR[r.severity],flexShrink:0}}>{r.severity}</span>
              <span style={{color:"#94a3b8",fontSize:"0.8rem",flexShrink:0}}>›</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Medications quick view */}
      <Section title="Today's Medications" sub="Your active prescriptions" action={()=>onPage("medications")} actionLabel="View all →">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {activeMeds.slice(0,4).map(m=>(
            <div key={m.id} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"12px 14px",borderLeft:`3px solid ${m.color}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:"0.78rem",fontWeight:700,color:"#0f172a"}}>{m.name}</div>
                <span style={{fontSize:"0.65rem",fontWeight:700,color:m.color,background:m.color+"15",padding:"1px 7px",borderRadius:99}}>{m.dose}</span>
              </div>
              <div style={{fontSize:"0.65rem",color:"#64748b",marginBottom:8}}>💊 {m.freq} · ⏰ {m.time}</div>
              <div style={{background:"#f1f5f9",borderRadius:99,height:5,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:m.color,width:`${(m.remaining/m.total)*100}%`,transition:"width .6s ease"}}/>
              </div>
              <div style={{fontSize:"0.6rem",color:"#94a3b8",marginTop:4}}>{m.remaining} of {m.total} doses remaining</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function RecordsPage({ records, loading, onViewRecord }) {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("All");
  const types=["All",...new Set((records||[]).map(r=>r.type))];
  const filtered=(records||[]).filter(r=>(filter==="All"||r.type===filter)&&(!search||r.title.toLowerCase().includes(search.toLowerCase())||r.doctor.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:"1.5rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>My Medical Records</div>
        <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>All your health documents in one place</div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"7px 13px",flex:1,minWidth:180}}>
          <span style={{color:"#94a3b8"}}>🔍</span>
          <input placeholder="Search records…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:"none",background:"transparent",fontSize:"0.78rem",color:"#0f172a",fontFamily:"'Sora',sans-serif",outline:"none",width:"100%"}}/>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {types.map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 14px",borderRadius:99,border:`1.5px solid ${filter===t?"#0f172a":"#e2e8f0"}`,background:filter===t?"#0f172a":"#fff",color:filter===t?"#fff":"#64748b",fontSize:"0.72rem",fontWeight:600,cursor:"pointer",transition:"all .15s",fontFamily:"'Sora',sans-serif"}}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:"#fff",borderRadius:12,padding:"14px"}}><Skel h={60}/></div>)
          : filtered.length===0 ? <div style={{textAlign:"center",padding:"3rem",color:"#94a3b8"}}>No records found</div>
          : filtered.map(r=>(
            <div key={r.id} onClick={()=>onViewRecord(r)}
              style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all .15s",display:"flex",gap:14,alignItems:"flex-start",borderLeft:`4px solid ${r.color}`}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.08)";e.currentTarget.style.transform="translateX(4px)"}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateX(0)"}}>
              <div style={{width:44,height:44,borderRadius:12,background:r.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:4}}>
                  <div style={{fontSize:"0.85rem",fontWeight:700,color:"#0f172a"}}>{r.title}</div>
                  <span style={{fontSize:"0.62rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:SEV_BG[r.severity],color:SEV_COLOR[r.severity],flexShrink:0,border:`1px solid ${SEV_COLOR[r.severity]}33`}}>{r.severity}</span>
                </div>
                <div style={{fontSize:"0.68rem",color:r.color,fontWeight:700,marginBottom:3}}>{r.type}</div>
                <div style={{fontSize:"0.65rem",color:"#94a3b8"}}>{fmtDate(r.date)} · {r.doctor}</div>
                {r.aiSummary && <div style={{fontSize:"0.68rem",color:"#6366f1",background:"#f5f3ff",padding:"5px 9px",borderRadius:7,marginTop:8,border:"1px solid #e0e7ff",lineHeight:1.5}}>🤖 {r.aiSummary.slice(0,90)}…</div>}
                {r.attachments?.length>0 && <div style={{fontSize:"0.62rem",color:"#64748b",marginTop:6}}>📎 {r.attachments.length} attachment{r.attachments.length>1?"s":""}</div>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function AppointmentsPage({ appointments, loading }) {
  const [tab,setTab]=useState("All");
  const tabs=["All","Upcoming","Scheduled","Completed"];
  const filtered=(appointments||[]).filter(a=>tab==="All"||a.status===tab);
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:"1.5rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>My Appointments</div>
        <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>Past and upcoming consultations</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:"1.25rem",background:"#f1f5f9",borderRadius:10,padding:3}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:tab===t?"#fff":"transparent",color:tab===t?"#0f172a":"#94a3b8",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",boxShadow:tab===t?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .15s",fontFamily:"'Sora',sans-serif"}}>{t}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {loading ? Array(3).fill(0).map((_,i)=><div key={i} style={{background:"#fff",borderRadius:12,padding:"14px"}}><Skel h={70}/></div>)
          : filtered.length===0 ? <div style={{textAlign:"center",padding:"3rem",color:"#94a3b8"}}>No appointments found</div>
          : filtered.map(a=>{
            const as=APT_STATUS[a.status]||APT_STATUS.Completed;
            const upcoming=a.status==="Upcoming"||a.status==="Scheduled";
            return (
              <div key={a.id} style={{background:"#fff",border:`1px solid ${upcoming?"#bfdbfe":"#e2e8f0"}`,borderRadius:14,padding:"14px 16px",transition:"box-shadow .15s",boxShadow:upcoming?"0 4px 14px rgba(37,99,235,.06)":"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,borderRadius:12,background:avatarColor(initials(a.doctor)),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.8rem",fontWeight:800,flexShrink:0}}>{initials(a.doctor)}</div>
                    <div>
                      <div style={{fontSize:"0.82rem",fontWeight:800,color:"#0f172a"}}>{a.doctor}</div>
                      <div style={{fontSize:"0.65rem",color:"#6366f1",fontWeight:700}}>{a.specialty}</div>
                    </div>
                  </div>
                  <span style={{fontSize:"0.63rem",fontWeight:700,padding:"3px 10px",borderRadius:99,background:as.bg,color:as.color,border:`1px solid ${as.border}`,flexShrink:0}}>{a.status}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[["📅 Date",fmtDate(a.date)],["⏰ Time",a.time],["🏷 Type",a.type]].map(([l,v])=>(
                    <div key={l} style={{background:"#f8fafc",borderRadius:8,padding:"7px 10px"}}>
                      <div style={{fontSize:"0.59rem",color:"#94a3b8",fontWeight:700,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0f172a"}}>{v}</div>
                    </div>
                  ))}
                </div>
                {a.location && <div style={{fontSize:"0.65rem",color:"#64748b",marginTop:8,display:"flex",alignItems:"center",gap:5}}>📍 {a.location}</div>}
                {a.notes && <div style={{fontSize:"0.65rem",color:"#64748b",marginTop:4,padding:"6px 10px",background:"#fffbeb",borderRadius:7,border:"1px solid #fde68a"}}>📝 {a.notes}</div>}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

function MedicationsPage({ medications, loading }) {
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:"1.5rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>My Medications</div>
        <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>Active prescriptions and dosage tracker</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:"#fff",borderRadius:14,padding:"16px"}}><Skel h={80}/></div>)
          : (medications||[]).map(m=>{
            const pct = Math.round((m.remaining/m.total)*100);
            return (
              <div key={m.id} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"16px 18px",borderLeft:`4px solid ${m.color}`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <div style={{fontSize:"0.88rem",fontWeight:800,color:"#0f172a"}}>{m.name}</div>
                      <span style={{fontSize:"0.65rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:m.color+"15",color:m.color,border:`1px solid ${m.color}30`}}>{m.dose}</span>
                    </div>
                    <div style={{fontSize:"0.68rem",color:"#64748b"}}>{m.purpose}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"1.1rem",fontWeight:800,color:pct<25?"#ef4444":m.color,fontFamily:"'JetBrains Mono',monospace"}}>{pct}%</div>
                    <div style={{fontSize:"0.6rem",color:"#94a3b8"}}>remaining</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                  {[["💊 Dose",m.freq],["⏰ Time",m.time],["📅 Duration",m.duration]].map(([l,v])=>(
                    <div key={l} style={{background:"#f8fafc",borderRadius:8,padding:"6px 10px"}}>
                      <div style={{fontSize:"0.59rem",color:"#94a3b8",fontWeight:700,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:"0.7rem",fontWeight:700,color:"#0f172a"}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#f1f5f9",borderRadius:99,height:6,overflow:"hidden",marginBottom:4}}>
                  <div style={{height:"100%",borderRadius:99,background:pct<25?"#ef4444":m.color,width:`${pct}%`,transition:"width .7s cubic-bezier(.34,1.56,.64,1)"}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"0.62rem",color:"#94a3b8"}}>
                  <span>{m.remaining} doses left</span>
                  <span>{m.total - m.remaining} taken</span>
                </div>
                {pct < 25 && <div style={{marginTop:8,fontSize:"0.68rem",color:"#be123c",fontWeight:700,background:"#fff1f2",padding:"6px 10px",borderRadius:7,border:"1px solid #fecdd3"}}>⚠️ Running low — request refill from your doctor</div>}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

function ProfilePage({ profile, loading }) {
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({phone:profile?.phone||"",address:profile?.address||"",emergencyContact:profile?.emergencyContact||""});
  if (loading) return <div style={{padding:"2rem"}}><Skel h={400}/></div>;
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      {/* Profile card */}
      <div style={{background:"linear-gradient(135deg,#0c1c3a,#0f3460)",borderRadius:20,padding:"1.75rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
        <div style={{width:68,height:68,borderRadius:18,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1.3rem",fontWeight:800,boxShadow:"0 8px 24px rgba(14,165,233,.4)",flexShrink:0}}>
          {profile?.avatar||"?"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:"1.2rem",fontWeight:800,color:"#fff"}}>{profile?.name}</div>
          <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginTop:3}}>{profile?.id} · Joined {fmtDate(profile?.joinedDate)}</div>
          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
            <span style={{padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.8)",fontSize:"0.65rem",fontWeight:700,border:"1px solid rgba(255,255,255,.15)"}}>🩸 {profile?.bloodGroup}</span>
            <span style={{padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.8)",fontSize:"0.65rem",fontWeight:700,border:"1px solid rgba(255,255,255,.15)"}}>{profile?.gender}</span>
            <span style={{padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.8)",fontSize:"0.65rem",fontWeight:700,border:"1px solid rgba(255,255,255,.15)"}}>Age {profile?.age}</span>
            <span style={{padding:"3px 10px",borderRadius:99,background:"rgba(14,165,233,.25)",color:"#7dd3fc",fontSize:"0.65rem",fontWeight:700,border:"1px solid rgba(14,165,233,.3)"}}>{profile?.status}</span>
          </div>
        </div>
        <button onClick={()=>setEditing(e=>!e)} style={{padding:"9px 18px",borderRadius:10,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",backdropFilter:"blur(6px)"}}>
          {editing?"✕ Cancel":"✏️ Edit"}
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* Personal */}
        <ProfileSection title="Personal Details" icon="👤">
          <PRow label="Full Name"   val={profile?.name}/>
          <PRow label="Date of Birth" val={fmtDate(profile?.dob)}/>
          <PRow label="Gender"      val={profile?.gender}/>
          <PRow label="Blood Group" val={profile?.bloodGroup}/>
          {editing
            ? <div style={{display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontSize:"0.62rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em"}}>Phone</div>
                <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} style={{padding:"7px 10px",borderRadius:8,border:"1.5px solid #0ea5e9",fontSize:"0.76rem",fontFamily:"'Sora',sans-serif",outline:"none",color:"#0f172a"}}/>
              </div>
            : <PRow label="Phone" val={profile?.phone}/>
          }
          <PRow label="Email" val={profile?.email}/>
        </ProfileSection>

        {/* Medical */}
        <ProfileSection title="Medical Info" icon="🏥">
          <PRow label="Department"      val={profile?.department}/>
          <PRow label="Assigned Doctor" val={profile?.assignedDoctor}/>
          <PRow label="Diagnosis"       val={profile?.diagnosis}/>
          <PRow label="Weight"          val={profile?.weight}/>
          <PRow label="Height"          val={profile?.height}/>
          <PRow label="BMI"             val={profile?.bmi}/>
        </ProfileSection>

        {/* Address */}
        <ProfileSection title="Address" icon="🏠">
          {editing
            ? <textarea value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} style={{padding:"7px 10px",borderRadius:8,border:"1.5px solid #0ea5e9",fontSize:"0.76rem",fontFamily:"'Sora',sans-serif",outline:"none",color:"#0f172a",resize:"vertical",minHeight:60,width:"100%",boxSizing:"border-box"}}/>
            : <PRow label="Address" val={profile?.address}/>
          }
        </ProfileSection>

        {/* Insurance & Emergency */}
        <ProfileSection title="Insurance & Emergency" icon="🛡">
          <PRow label="Provider"   val={profile?.insurance}/>
          <PRow label="Policy No." val={profile?.insuranceId}/>
          {editing
            ? <div style={{display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontSize:"0.62rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em"}}>Emergency Contact</div>
                <input value={form.emergencyContact} onChange={e=>setForm(f=>({...f,emergencyContact:e.target.value}))} style={{padding:"7px 10px",borderRadius:8,border:"1.5px solid #0ea5e9",fontSize:"0.76rem",fontFamily:"'Sora',sans-serif",outline:"none",color:"#0f172a"}}/>
              </div>
            : <PRow label="Emergency" val={profile?.emergencyContact}/>
          }
          {profile?.allergies?.length>0 && (
            <div>
              <div style={{fontSize:"0.62rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Known Allergies</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {profile.allergies.map(a=><span key={a} style={{padding:"2px 9px",borderRadius:99,background:"#fff1f2",color:"#be123c",fontSize:"0.65rem",fontWeight:700,border:"1px solid #fecdd3"}}>⚠ {a}</span>)}
              </div>
            </div>
          )}
        </ProfileSection>
      </div>

      {editing && (
        <div style={{marginTop:14,display:"flex",justifyContent:"flex-end",gap:10}}>
          <button onClick={()=>setEditing(false)} style={{padding:"9px 20px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"0.8rem",fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>setEditing(false)} style={{padding:"9px 24px",borderRadius:9,border:"none",background:"#0ea5e9",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:"pointer"}}>💾 Save Changes</button>
        </div>
      )}
    </div>
  );
}

function ProfileSection({ title, icon, children }) {
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"1.1rem"}}>
      <div style={{fontSize:"0.7rem",fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><span>{icon}</span>{title}</div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>{children}</div>
    </div>
  );
}
function PRow({ label, val }) {
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
      <span style={{fontSize:"0.62rem",color:"#94a3b8",fontWeight:700,width:90,flexShrink:0,paddingTop:1,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</span>
      <span style={{fontSize:"0.76rem",fontWeight:600,color:"#0f172a",flex:1,lineHeight:1.4}}>{val||"—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const [page,setPage]              = useState("overview");
  const [notifOpen,setNotifOpen]    = useState(false);
  const [viewRecord,setViewRecord]  = useState(null);
  const [sideOpen,setSideOpen]      = useState(false);
  const [notifs,setNotifs]          = useState(DUMMY_NOTIFICATIONS);
  const notifRef = useRef(null);

  const {data:profile,  loading:pl} = useDummyData("profile",     300);
  const {data:vitals} = useDummyData("vitals",      450);
  const {data:records,  loading:rl} = useDummyData("records",     500);
  const {data:appts,    loading:al} = useDummyData("appointments",550);
  const {data:meds,     loading:ml} = useDummyData("medications", 480);

  const unread = notifs.filter(n=>!n.read).length;

  useEffect(()=>{
    const h=e=>{if(notifRef.current&&!notifRef.current.contains(e.target))setNotifOpen(false);};
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const NAV = [
    {id:"overview",     label:"Overview",     icon:"🏠"},
    {id:"records",      label:"My Records",   icon:"🗂️"},
    {id:"appointments", label:"Appointments", icon:"📅"},
    {id:"medications",  label:"Medications",  icon:"💊"},
    {id:"profile",      label:"Profile",      icon:"👤"},
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { height:100%; }
        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dropDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInL  { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse4    { 0%,100%{opacity:1}50%{opacity:0.5} }

        .pd-root {
          display:flex; min-height:100vh;
          background:#f4f6fa;
          font-family:'Sora',sans-serif;
          color:#0f172a;
        }

        /* ── Sidebar ── */
        .pd-sidebar {
          width:240px; min-height:100vh;
          background:#fff;
          border-right:1px solid #e8edf4;
          display:flex; flex-direction:column;
          position:fixed; top:0; left:0; height:100vh;
          z-index:100;
          box-shadow:2px 0 16px rgba(0,0,0,0.04);
          transition:transform .3s ease;
        }
        .pd-sidebar.closed { transform:translateX(-100%); }

        .pd-logo {
          height:66px; padding:0 1.25rem;
          display:flex; align-items:center; gap:10px;
          border-bottom:1px solid #f1f5f9; flex-shrink:0;
        }
        .pd-logo-icon {
          width:34px; height:34px; border-radius:9px;
          background:linear-gradient(135deg,#0ea5e9,#6366f1);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; flex-shrink:0;
        }
        .pd-logo-name { font-size:0.88rem; font-weight:800; color:#0f172a; }
        .pd-logo-sub  { font-size:0.55rem; color:#94a3b8; letter-spacing:0.08em; text-transform:uppercase; margin-top:1px; }

        .pd-nav-scroll { flex:1; overflow-y:auto; padding:0.75rem 0.75rem; scrollbar-width:none; }
        .pd-nav-scroll::-webkit-scrollbar { display:none; }

        .pd-nav-item {
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:10px;
          cursor:pointer; transition:all .18s;
          color:#64748b; font-size:0.8rem; font-weight:600;
          text-decoration:none; margin-bottom:2px;
          border:1px solid transparent;
        }
        .pd-nav-item:hover { background:#f8fafc; color:#0f172a; }
        .pd-nav-item.active {
          background:linear-gradient(135deg,#eff6ff,#f5f3ff);
          color:#0f172a; border-color:#e0e7ff;
        }
        .pd-nav-item.active .pd-nav-dot {
          display:block;
        }
        .pd-nav-dot {
          display:none; width:5px; height:5px; border-radius:50%;
          background:#0ea5e9; margin-left:auto; flex-shrink:0;
        }

        .pd-user-card {
          padding:0.75rem; border-top:1px solid #f1f5f9; flex-shrink:0;
        }
        .pd-user-inner {
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:10px;
          background:#f8fafc; transition:background .15s;
        }
        .pd-user-inner:hover { background:#f1f5f9; cursor:pointer; }
        .pd-user-av {
          width:34px; height:34px; border-radius:9px;
          background:linear-gradient(135deg,#0ea5e9,#6366f1);
          display:flex; align-items:center; justify-content:center;
          font-size:0.72rem; font-weight:800; color:#fff; flex-shrink:0;
        }
        .pd-user-name { font-size:0.75rem; font-weight:700; color:#0f172a; }
        .pd-user-role { font-size:0.58rem; color:#94a3b8; }

        /* ── Main ── */
        .pd-main {
          margin-left:240px;
          flex:1; display:flex; flex-direction:column; min-height:100vh;
          transition:margin-left .3s ease;
        }
        .pd-main.full { margin-left:0; }

        /* ── Topbar ── */
        .pd-topbar {
          height:66px; background:#fff; border-bottom:1px solid #e8edf4;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 1.75rem; position:sticky; top:0; z-index:90;
          box-shadow:0 1px 4px rgba(0,0,0,0.04); gap:12px;
        }

        .pd-topbar-title { font-size:1.05rem; font-weight:800; color:#0f172a; }
        .pd-topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }

        .pd-icon-btn {
          width:36px; height:36px; border-radius:10px;
          border:1.5px solid #e2e8f0; background:#f8fafc;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          font-size:0.9rem; transition:background .15s; position:relative;
        }
        .pd-icon-btn:hover { background:#f1f5f9; }

        .pd-notif-count {
          position:absolute; top:-5px; right:-5px;
          width:17px; height:17px; border-radius:50%;
          background:#ef4444; color:#fff;
          font-size:0.52rem; font-weight:800;
          display:flex; align-items:center; justify-content:center;
          border:2px solid #fff;
          animation:pulse4 2s infinite;
        }

        .pd-content { flex:1; padding:1.75rem; overflow-y:auto; }
        .pd-content::-webkit-scrollbar { width:5px; }
        .pd-content::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }

        .pd-footer {
          height:44px; background:#fff; border-top:1px solid #f1f5f9;
          display:flex; align-items:center; justify-content:center;
          font-size:0.62rem; color:#94a3b8;
        }

        .pd-hamburger {
          display:none; width:34px; height:34px; border-radius:9px;
          border:1.5px solid #e2e8f0; background:#f8fafc;
          align-items:center; justify-content:center;
          cursor:pointer; font-size:0.9rem; color:#475569;
        }

        @media(max-width:768px) {
          .pd-sidebar { transform:translateX(-100%); }
          .pd-sidebar.open { transform:translateX(0); animation:slideInL .25s ease; }
          .pd-main { margin-left:0; }
          .pd-hamburger { display:flex; }
          .pd-content { padding:1.25rem; }
        }
      `}</style>

      <div className="pd-root">

        {/* ── SIDEBAR ── */}
        <aside className={`pd-sidebar${sideOpen?" open":""}`}>
          <div className="pd-logo">
            <div className="pd-logo-icon">🏥</div>
            <div>
              <div className="pd-logo-name">Aroha AI</div>
              <div className="pd-logo-sub">Patient Portal</div>
            </div>
          </div>

          <div className="pd-nav-scroll">
            {NAV.map(n=>(
              <div
                key={n.id}
                className={`pd-nav-item${page===n.id?" active":""}`}
                onClick={()=>{ setPage(n.id); setSideOpen(false); }}
              >
                <span style={{fontSize:"1rem",width:20,textAlign:"center"}}>{n.icon}</span>
                <span>{n.label}</span>
                <span className="pd-nav-dot"/>
              </div>
            ))}
          </div>

          {!pl && (
            <div className="pd-user-card">
              <div className="pd-user-inner" onClick={()=>setPage("profile")}>
                <div className="pd-user-av">{profile?.avatar||"?"}</div>
                <div>
                  <div className="pd-user-name">{profile?.name?.split(" ").slice(0,2).join(" ")||"Patient"}</div>
                  <div className="pd-user-role">{profile?.department}</div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile overlay */}
        {sideOpen && <div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:99}}/>}

        {/* ── MAIN ── */}
        <div className="pd-main">

          {/* Topbar */}
          <header className="pd-topbar">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="pd-hamburger" onClick={()=>setSideOpen(s=>!s)}>☰</div>
              <div className="pd-topbar-title">
                {NAV.find(n=>n.id===page)?.icon} {NAV.find(n=>n.id===page)?.label}
              </div>
            </div>
            <div className="pd-topbar-right">
              {/* API badge */}
              <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:API.USE_REAL_API?"#f0fdf4":"#fffbeb",border:`1px solid ${API.USE_REAL_API?"#bbf7d0":"#fde68a"}`,color:API.USE_REAL_API?"#15803d":"#92400e"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:API.USE_REAL_API?"#22c55e":"#f59e0b",display:"inline-block"}}/>
                {API.USE_REAL_API?"Live":"Demo"}
              </div>

              {/* Notifications */}
              <div ref={notifRef} style={{position:"relative"}}>
                <div className="pd-icon-btn" onClick={()=>setNotifOpen(o=>!o)}>
                  🔔
                  {unread>0 && <span className="pd-notif-count">{unread}</span>}
                </div>
                {notifOpen && (
                  <NotifPanel
                    notifs={notifs}
                    onClose={()=>setNotifOpen(false)}
                    onMarkAllRead={()=>setNotifs(n=>n.map(x=>({...x,read:true})))}
                  />
                )}
              </div>

              {/* Profile avatar */}
              <div
                onClick={()=>setPage("profile")}
                style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.68rem",fontWeight:800,cursor:"pointer",border:"2px solid #e2e8f0"}}
              >
                {profile?.avatar||"?"}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="pd-content">
            {page==="overview"     && <OverviewPage     profile={profile} vitals={vitals} records={records} appointments={appts} medications={meds} onViewRecord={setViewRecord} onPage={setPage}/>}
            {page==="records"      && <RecordsPage      records={records}      loading={rl} onViewRecord={setViewRecord}/>}
            {page==="appointments" && <AppointmentsPage appointments={appts}   loading={al}/>}
            {page==="medications"  && <MedicationsPage  medications={meds}     loading={ml}/>}
            {page==="profile"      && <ProfilePage      profile={profile}      loading={pl}/>}
          </main>

          <footer className="pd-footer">
            © {new Date().getFullYear()} Aroha AI — Your health, beautifully managed.
          </footer>
        </div>
      </div>

      {/* Record detail modal */}
      {viewRecord && <RecordModal record={viewRecord} onClose={()=>setViewRecord(null)}/>}
    </>
  );
}