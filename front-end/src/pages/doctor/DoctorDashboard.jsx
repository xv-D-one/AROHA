import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  API CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API = {
  BASE_URL: "http://localhost:5000/api",
  USE_REAL_API: false,
  EP: {
    profile:      "/doctor/me",
    patients:     "/doctor/patients",
    appointments: "/doctor/appointments",
    records:      "/doctor/records",
    notes:        "/doctor/notes",
    messages:     "/doctor/messages",
    stats:        "/doctor/stats",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  DUMMY DATA
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_DOCTOR = {
  id:"D-001", name:"Dr. Arjun Pillai", email:"arjun.pillai@arohaai.com",
  phone:"+91 98400 11111", specialty:"Cardiology", department:"Cardiac Sciences",
  qualification:"MD, DM Cardiology", experience:14, licenseNo:"MCI-2010-AP",
  consultFee:800, rating:4.8, schedule:"Mon–Fri", avatar:"AP",
  patients:19, todayAppointments:7, pendingReports:4, newMessages:3,
};

const DUMMY_PATIENTS = [
  { id:"P-1001", name:"Aisha Nair",     age:34, gender:"Female", bloodGroup:"B+", phone:"+91 94400 11111", diagnosis:"Hypertension",         status:"Admitted",   lastVisit:"2025-03-08", nextVisit:"2025-03-15", avatar:"AN", risk:"Moderate", vitals:{bp:"124/82",hr:"78",spo2:"98",temp:"98.4"}, allergies:["Penicillin"],   dept:"Cardiology" },
  { id:"P-1002", name:"Samuel Thomas",  age:52, gender:"Male",   bloodGroup:"O+", phone:"+91 94400 22222", diagnosis:"Atrial Fibrillation",   status:"Admitted",   lastVisit:"2025-03-07", nextVisit:"2025-03-12", avatar:"ST", risk:"High",     vitals:{bp:"148/92",hr:"142",spo2:"96",temp:"99.1"}, allergies:[],               dept:"Cardiology" },
  { id:"P-1003", name:"Lakshmi Pillai", age:69, gender:"Female", bloodGroup:"A+", phone:"+91 94400 77777", diagnosis:"Heart Failure — Class II",status:"Critical",  lastVisit:"2025-03-07", nextVisit:"2025-03-08", avatar:"LP", risk:"Critical", vitals:{bp:"155/98",hr:"110",spo2:"94",temp:"99.8"}, allergies:["Ibuprofen"],    dept:"Cardiology" },
  { id:"P-1004", name:"Rajan Menon",    age:58, gender:"Male",   bloodGroup:"AB-",phone:"+91 94400 34567", diagnosis:"Stable Angina",         status:"Outpatient", lastVisit:"2025-03-05", nextVisit:"2025-03-20", avatar:"RM", risk:"Moderate", vitals:{bp:"132/84",hr:"72",spo2:"97",temp:"98.6"}, allergies:[],               dept:"Cardiology" },
  { id:"P-1005", name:"Divya Suresh",   age:44, gender:"Female", bloodGroup:"O-", phone:"+91 94400 45678", diagnosis:"Mitral Valve Prolapse",  status:"Outpatient", lastVisit:"2025-02-20", nextVisit:"2025-03-25", avatar:"DS", risk:"Low",      vitals:{bp:"118/76",hr:"68",spo2:"99",temp:"98.2"}, allergies:["Aspirin"],      dept:"Cardiology" },
  { id:"P-1006", name:"Mohan Varghese", age:63, gender:"Male",   bloodGroup:"B+", phone:"+91 94400 56789", diagnosis:"Post-MI Recovery",       status:"Discharged", lastVisit:"2025-03-01", nextVisit:"2025-04-01", avatar:"MV", risk:"Moderate", vitals:{bp:"128/80",hr:"65",spo2:"98",temp:"98.4"}, allergies:[],               dept:"Cardiology" },
];

const DUMMY_APPOINTMENTS = [
  { id:"APT-001", patientId:"P-1001", patientName:"Aisha Nair",     date:"2025-03-15", time:"10:30 AM", type:"Follow-up",    status:"Upcoming",  duration:20, reason:"BP review & CBC follow-up",        avatar:"AN" },
  { id:"APT-002", patientId:"P-1002", patientName:"Samuel Thomas",  date:"2025-03-12", time:"09:00 AM", type:"Urgent",       status:"Upcoming",  duration:30, reason:"AF management review",             avatar:"ST" },
  { id:"APT-003", patientId:"P-1003", patientName:"Lakshmi Pillai", date:"2025-03-08", time:"08:30 AM", type:"Review",       status:"Today",     duration:45, reason:"Heart failure monitoring",          avatar:"LP" },
  { id:"APT-004", patientId:"P-1004", patientName:"Rajan Menon",    date:"2025-03-08", time:"11:00 AM", type:"Consultation", status:"Today",     duration:20, reason:"Stress test results discussion",    avatar:"RM" },
  { id:"APT-005", patientId:"P-1005", patientName:"Divya Suresh",   date:"2025-03-08", time:"02:30 PM", type:"Follow-up",    status:"Today",     duration:15, reason:"MVP routine check",                 avatar:"DS" },
  { id:"APT-006", patientId:"P-1001", patientName:"Aisha Nair",     date:"2025-03-01", time:"11:00 AM", type:"Consultation", status:"Completed", duration:25, reason:"Initial BP consultation",           avatar:"AN" },
  { id:"APT-007", patientId:"P-1006", patientName:"Mohan Varghese", date:"2025-04-01", time:"10:00 AM", type:"Review",       status:"Scheduled", duration:30, reason:"3-month post-MI review",            avatar:"MV" },
];

const DUMMY_RECORDS = [
  { id:"REC-001", patientId:"P-1001", patientName:"Aisha Nair",     type:"Lab Report",        title:"CBC Panel",                  date:"2025-03-08", severity:"Moderate", aiSummary:"Mild anaemia detected. Iron therapy initiated.", icon:"🧪", color:"#0ea5e9", tags:["Anaemia","Lab"] },
  { id:"REC-002", patientId:"P-1002", patientName:"Samuel Thomas",  type:"Imaging",           title:"12-Lead ECG — AF Detection", date:"2025-03-07", severity:"Critical", aiSummary:"New-onset AF with RVR. Rate control achieved.",  icon:"🫁", color:"#ef4444", tags:["AF","ECG","Urgent"] },
  { id:"REC-003", patientId:"P-1003", patientName:"Lakshmi Pillai", type:"Consultation Note", title:"HF Class II Assessment",     date:"2025-03-07", severity:"Critical", aiSummary:"NYHA Class II confirmed. BNP elevated at 480.",  icon:"🩺", color:"#ef4444", tags:["HF","BNP"] },
  { id:"REC-004", patientId:"P-1004", patientName:"Rajan Menon",    type:"Lab Report",        title:"Stress Echocardiogram",      date:"2025-03-05", severity:"Moderate", aiSummary:"Mild ischaemia on stress echo. Statin optimised.", icon:"🧪", color:"#f59e0b", tags:["Ischaemia","Echo"] },
  { id:"REC-005", patientId:"P-1001", patientName:"Aisha Nair",     type:"Prescription",      title:"Antihypertensives",          date:"2025-03-01", severity:"Mild",     aiSummary:"Amlodipine & Telmisartan initiated for BP.",     icon:"💊", color:"#6366f1", tags:["Prescription","BP"] },
];

const DUMMY_NOTES = [
  { id:"N-001", patientId:"P-1003", patientName:"Lakshmi Pillai", note:"Patient reports worsening dyspnoea on exertion. SpO₂ dipping to 94%. Consider increasing loop diuretic. Echocardiogram pending.", date:"2025-03-07", pinned:true,  color:"#ef4444" },
  { id:"N-002", patientId:"P-1002", patientName:"Samuel Thomas",  note:"AF with RVR controlled post IV metoprolol. INR at 1.4 — warfarin dose to be reviewed. Echocardiogram to rule out structural disease.", date:"2025-03-07", pinned:true,  color:"#f59e0b" },
  { id:"N-003", patientId:"P-1001", patientName:"Aisha Nair",     note:"BP trending down — 124/82 today. Patient compliant with medications. CBC shows improving Hb (now 11.4 g/dL). Continue iron therapy.", date:"2025-03-08", pinned:false, color:"#0ea5e9" },
  { id:"N-004", patientId:"P-1004", patientName:"Rajan Menon",    note:"Stress echo mildly positive. LDL at 118 — rosuvastatin increased to 20mg. Repeat stress test in 3 months.", date:"2025-03-05", pinned:false, color:"#14b8a6" },
];

const DUMMY_MESSAGES = [
  { id:"M-001", from:"Admin Team",      role:"admin",   avatar:"AD", msg:"New patient Arjun Dev transferred to your ward. Please review records.", time:"10 min ago", read:false, urgent:false },
  { id:"M-002", from:"Aisha Nair",      role:"patient", avatar:"AN", msg:"Doctor, I've been experiencing mild dizziness after taking Amlodipine in the morning.", time:"1 hr ago",  read:false, urgent:false },
  { id:"M-003", from:"Lab Department",  role:"lab",     avatar:"LA", msg:"URGENT: Lakshmi Pillai's troponin levels elevated — 0.4 ng/mL. Please review immediately.", time:"2 hrs ago", read:false, urgent:true  },
  { id:"M-004", from:"Dr. Lena Mathew", role:"doctor",  avatar:"LM", msg:"Hi Arjun, could you consult on a neuro-cardiac case? Patient has syncope + AF.", time:"3 hrs ago", read:true,  urgent:false },
  { id:"M-005", from:"Samuel Thomas",   role:"patient", avatar:"ST", msg:"Doctor, I am having palpitations again since last night.", time:"5 hrs ago", read:true,  urgent:false },
];

const WEEKLY_STATS = [
  { day:"Mon", patients:6, completed:6 }, { day:"Tue", patients:8, completed:7 },
  { day:"Wed", patients:5, completed:5 }, { day:"Thu", patients:9, completed:8 },
  { day:"Fri", patients:7, completed:7 }, { day:"Sat", patients:3, completed:3 },
  { day:"Sun", patients:0, completed:0 },
];

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate   = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
const AVATAR_COLORS = ["#0ea5e9","#14b8a6","#f59e0b","#6366f1","#10b981","#ef4444","#8b5cf6","#ec4899"];
const avatarColor   = s => AVATAR_COLORS[(s?.charCodeAt(0)??0) % AVATAR_COLORS.length];

const RISK_S = {
  Low:      { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0", dot:"#22c55e" },
  Moderate: { bg:"#fffbeb", color:"#92400e", border:"#fde68a", dot:"#f59e0b" },
  High:     { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa", dot:"#f97316" },
  Critical: { bg:"#fff1f2", color:"#be123c", border:"#fecdd3", dot:"#ef4444" },
};
const STATUS_S = {
  Admitted:   { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
  Outpatient: { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" },
  Discharged: { bg:"#f8fafc", color:"#475569", border:"#e2e8f0" },
  Critical:   { bg:"#fff1f2", color:"#be123c", border:"#fecdd3" },
};
const APT_STATUS_S = {
  Today:     { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" },
  Upcoming:  { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" },
  Scheduled: { bg:"#f5f3ff", color:"#6d28d9", border:"#ddd6fe" },
  Completed: { bg:"#f8fafc", color:"#64748b", border:"#e2e8f0" },
};
const SEV_S = {
  Normal:  { bg:"#f0fdf4",color:"#15803d" }, Mild:{bg:"#f0f9ff",color:"#0369a1"},
  Moderate:{ bg:"#fffbeb",color:"#92400e" }, Severe:{bg:"#fff7ed",color:"#c2410c"},
  Critical:{ bg:"#fff1f2",color:"#be123c" },
};

function Skel({ h=18, w="100%", r=8 }) {
  return <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#f1f5f9 25%,#e8edf4 50%,#f1f5f9 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;
}

function RiskBadge({ risk }) {
  const s = RISK_S[risk]||RISK_S.Low;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:99,background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontSize:"0.6rem",fontWeight:800,whiteSpace:"nowrap"}}>
    <span style={{width:5,height:5,borderRadius:"50%",background:s.dot}}/>{risk}
  </span>;
}

function StatusPill({ status }) {
  const s = STATUS_S[status]||STATUS_S.Discharged;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:99,background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontSize:"0.6rem",fontWeight:700}}>{status}</span>;
}

function Tag({ t }) {
  return <span style={{padding:"2px 7px",borderRadius:99,background:"#f1f5f9",color:"#475569",fontSize:"0.6rem",fontWeight:600,border:"1px solid #e2e8f0"}}>{t}</span>;
}

function useDummyFetch(key, dummyData, delay=420) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (!API.USE_REAL_API) { const t=setTimeout(()=>{setData(dummyData);setLoading(false);},delay+Math.random()*180); return()=>clearTimeout(t); }
    fetch(`${API.BASE_URL}${API.EP[key]}`,{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}})
      .then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>{setData(dummyData);setLoading(false);});
  },[delay, dummyData, key]);
  return {data,loading};
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADD NOTE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function NoteModal({ patients, editNote, onClose, onSave }) {
  const [form,setForm]=useState(editNote ? {patientId:editNote.patientId,note:editNote.note,pinned:editNote.pinned} : {patientId:"",note:"",pinned:false});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const handleSave=async()=>{
    if(!form.patientId||!form.note.trim()) return;
    setSaving(true);
    await new Promise(r=>setTimeout(r,600));
    const pat=patients?.find(p=>p.id===form.patientId);
    onSave({...editNote,...form,id:editNote?.id||`N-${Date.now()}`,patientName:pat?.name||"",date:new Date().toISOString().slice(0,10),color:avatarColor(pat?.avatar||"A")});
    setSaving(false);
  };
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:"rgba(10,18,38,0.65)",backdropFilter:"blur(5px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .2s"}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:520,boxShadow:"0 28px 70px rgba(0,0,0,.22)",animation:"slideUp .25s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{padding:"1.2rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:"0.95rem",fontWeight:800,color:"#0f172a"}}>{editNote?"Edit Clinical Note":"Add Clinical Note"}</div>
          <div onClick={onClose} style={{width:30,height:30,borderRadius:8,background:"#f8fafc",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b"}}>✕</div>
        </div>
        <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <label style={{fontSize:"0.65rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em"}}>Patient *</label>
            <select value={form.patientId} onChange={e=>set("patientId",e.target.value)} style={{padding:"9px 12px",borderRadius:9,border:`1.5px solid ${!form.patientId?"#fca5a5":"#e2e8f0"}`,fontSize:"0.8rem",fontFamily:"'Sora',sans-serif",color:"#0f172a",background:"#fafafa",outline:"none"}}>
              <option value="">Select patient</option>
              {(patients||[]).map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <label style={{fontSize:"0.65rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em"}}>Clinical Note *</label>
            <textarea value={form.note} onChange={e=>set("note",e.target.value)} rows={5}
              style={{padding:"9px 12px",borderRadius:9,border:`1.5px solid ${!form.note.trim()?"#fca5a5":"#e2e8f0"}`,fontSize:"0.8rem",fontFamily:"'Sora',sans-serif",color:"#0f172a",background:"#fafafa",outline:"none",resize:"vertical"}}
              placeholder="Enter clinical observations, treatment notes, follow-up actions…"/>
          </div>
          <div onClick={()=>set("pinned",!form.pinned)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",borderRadius:9,border:`1.5px solid ${form.pinned?"#f59e0b":"#e2e8f0"}`,background:form.pinned?"#fffbeb":"#fafafa",cursor:"pointer",transition:"all .15s",width:"fit-content"}}>
            <div style={{width:17,height:17,borderRadius:5,border:`2px solid ${form.pinned?"#f59e0b":"#cbd5e1"}`,background:form.pinned?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.7rem",transition:"all .15s"}}>{form.pinned&&"✓"}</div>
            <span style={{fontSize:"0.76rem",fontWeight:600,color:form.pinned?"#92400e":"#64748b"}}>📌 Pin this note</span>
          </div>
        </div>
        <div style={{padding:"1rem 1.5rem",borderTop:"1px solid #f1f5f9",display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"9px 20px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"0.8rem",fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button onClick={handleSave} disabled={saving||!form.patientId||!form.note.trim()} style={{padding:"9px 24px",borderRadius:9,border:"none",background:saving||!form.patientId||!form.note.trim()?"#94a3b8":"#0f172a",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:saving?"wait":"pointer",display:"flex",alignItems:"center",gap:8}}>
            {saving?<><span style={{display:"inline-block",width:10,height:10,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Saving…</>:"💾 Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PATIENT FULL PROFILE DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function PatientDrawer({ patient, records, notes, onClose, onAddNote }) {
  const [tab,setTab]=useState("overview");
  const patRecs = (records||[]).filter(r=>r.patientId===patient.id);
  const patNotes = (notes||[]).filter(n=>n.patientId===patient.id);
  const rk = RISK_S[patient.risk]||RISK_S.Low;

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:"rgba(10,18,38,0.5)",backdropFilter:"blur(4px)",zIndex:900,display:"flex",justifyContent:"flex-end",animation:"fadeIn .2s"}}>
      <div style={{width:"100%",maxWidth:500,background:"#fff",height:"100%",overflowY:"auto",boxShadow:"-14px 0 48px rgba(0,0,0,.15)",animation:"slideLeft .28s cubic-bezier(.22,1,.36,1)"}}>

        {/* Header */}
        <div style={{background:"linear-gradient(145deg,#0c1c3a,#0f3460)",padding:"1.4rem",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",gap:6}}>
              <StatusPill status={patient.status}/>
              <RiskBadge risk={patient.risk}/>
            </div>
            <div onClick={onClose} style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:"0.95rem"}}>✕</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
            <div style={{width:54,height:54,borderRadius:15,background:avatarColor(patient.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1rem",fontWeight:800,boxShadow:`0 8px 20px ${avatarColor(patient.avatar)}44`,flexShrink:0}}>{patient.avatar}</div>
            <div>
              <div style={{fontSize:"1.05rem",fontWeight:800,color:"#fff"}}>{patient.name}</div>
              <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,.55)",marginTop:2}}>{patient.id} · {patient.age}y · {patient.gender} · 🩸{patient.bloodGroup}</div>
              <div style={{fontSize:"0.7rem",color:"#7dd3fc",marginTop:3,fontWeight:600}}>{patient.diagnosis}</div>
            </div>
          </div>
          {/* Vitals strip */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[["❤️","BP",patient.vitals.bp],["💓","HR",`${patient.vitals.hr}bpm`],["🫁","SpO₂",`${patient.vitals.spo2}%`],["🌡️","Temp",`${patient.vitals.temp}°F`]].map(([ic,l,v])=>(
              <div key={l} style={{background:"rgba(255,255,255,.1)",borderRadius:9,padding:"7px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{fontSize:"0.85rem"}}>{ic}</div>
                <div style={{fontSize:"0.8rem",fontWeight:800,color:"#fff",fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                <div style={{fontSize:"0.56rem",color:"rgba(255,255,255,.45)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div>
              </div>
            ))}
          </div>
          {/* Tabs */}
          <div style={{display:"flex",gap:4,marginTop:14,background:"rgba(0,0,0,.2)",borderRadius:10,padding:3}}>
            {["overview","records","notes"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"6px",borderRadius:8,border:"none",background:tab===t?"rgba(255,255,255,.15)":"transparent",color:tab===t?"#fff":"rgba(255,255,255,.45)",fontSize:"0.7rem",fontWeight:700,cursor:"pointer",textTransform:"capitalize",fontFamily:"'Sora',sans-serif",transition:"all .15s"}}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{padding:"1.2rem"}}>
          {/* Overview tab */}
          {tab==="overview" && (
            <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .25s ease"}}>
              <DrawSection title="Contact & Personal">
                <DrawRow icon="📞" label="Phone"   val={patient.phone}/>
                <DrawRow icon="🏥" label="Department" val={patient.dept}/>
                <DrawRow icon="📅" label="Last Visit"  val={fmtDate(patient.lastVisit)}/>
                <DrawRow icon="📅" label="Next Visit"  val={fmtDate(patient.nextVisit)}/>
                {patient.allergies?.length>0 && (
                  <div>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>Known Allergies</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {patient.allergies.map(a=><span key={a} style={{padding:"2px 9px",borderRadius:99,background:"#fff1f2",color:"#be123c",fontSize:"0.63rem",fontWeight:700,border:"1px solid #fecdd3"}}>⚠ {a}</span>)}
                    </div>
                  </div>
                )}
              </DrawSection>
              {/* Risk radar */}
              <div style={{background:rk.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${rk.border}`}}>
                <div style={{fontSize:"0.65rem",fontWeight:800,color:rk.color,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>⚠ Patient Risk Level</div>
                <div style={{fontSize:"1.3rem",fontWeight:800,color:rk.color,fontFamily:"'JetBrains Mono',monospace"}}>{patient.risk}</div>
                <div style={{fontSize:"0.68rem",color:rk.color,opacity:.7,marginTop:2}}>
                  {patient.risk==="Critical"?"Requires immediate attention":patient.risk==="High"?"Close monitoring needed":patient.risk==="Moderate"?"Regular check-ins required":"Routine monitoring"}
                </div>
              </div>
            </div>
          )}

          {/* Records tab */}
          {tab==="records" && (
            <div style={{animation:"fadeUp .25s ease"}}>
              {patRecs.length===0 ? <div style={{textAlign:"center",padding:"2rem",color:"#94a3b8",fontSize:"0.8rem"}}>No records yet</div>
                : patRecs.map(r=>(
                  <div key={r.id} style={{background:"#f8fafc",borderRadius:11,padding:"11px 13px",marginBottom:9,border:`1px solid #e2e8f0`,borderLeft:`3px solid ${r.color}`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:"1rem"}}>{r.icon}</span>
                        <div style={{fontSize:"0.76rem",fontWeight:700,color:"#0f172a"}}>{r.title}</div>
                      </div>
                      <span style={{fontSize:"0.6rem",fontWeight:700,padding:"2px 7px",borderRadius:99,background:SEV_S[r.severity]?.bg,color:SEV_S[r.severity]?.color}}>{r.severity}</span>
                    </div>
                    <div style={{fontSize:"0.63rem",color:"#94a3b8",marginBottom:6}}>{r.type} · {fmtDate(r.date)}</div>
                    {r.aiSummary && <div style={{fontSize:"0.68rem",color:"#6366f1",background:"#f5f3ff",padding:"5px 9px",borderRadius:7,border:"1px solid #e0e7ff",lineHeight:1.5}}>🤖 {r.aiSummary}</div>}
                  </div>
                ))
              }
            </div>
          )}

          {/* Notes tab */}
          {tab==="notes" && (
            <div style={{animation:"fadeUp .25s ease"}}>
              <button onClick={onAddNote} style={{width:"100%",padding:"9px",borderRadius:9,border:"1.5px dashed #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",marginBottom:12,fontFamily:"'Sora',sans-serif",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#0ea5e9";e.currentTarget.style.color="#0ea5e9"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.color="#64748b"}}>
                + Add Clinical Note
              </button>
              {patNotes.length===0 ? <div style={{textAlign:"center",padding:"2rem",color:"#94a3b8",fontSize:"0.8rem"}}>No notes yet</div>
                : patNotes.map(n=>(
                  <div key={n.id} style={{background:"#fff",borderRadius:11,padding:"11px 13px",marginBottom:9,border:"1px solid #e2e8f0",borderLeft:`3px solid ${n.color}`,position:"relative"}}>
                    {n.pinned && <span style={{position:"absolute",top:10,right:10,fontSize:"0.8rem"}}>📌</span>}
                    <div style={{fontSize:"0.75rem",color:"#0f172a",lineHeight:1.6,marginBottom:5,paddingRight:20}}>{n.note}</div>
                    <div style={{fontSize:"0.62rem",color:"#94a3b8"}}>{fmtDate(n.date)}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawSection({ title, children }) {
  return (
    <div>
      <div style={{fontSize:"0.6rem",fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>{title}</div>
      <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:"1px solid #f1f5f9",display:"flex",flexDirection:"column",gap:8}}>{children}</div>
    </div>
  );
}
function DrawRow({ icon, label, val }) {
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
      <span style={{fontSize:"0.8rem",width:18,flexShrink:0}}>{icon}</span>
      <span style={{fontSize:"0.62rem",color:"#94a3b8",fontWeight:600,width:80,flexShrink:0,paddingTop:1,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</span>
      <span style={{fontSize:"0.74rem",fontWeight:600,color:"#0f172a",flex:1,lineHeight:1.4}}>{val||"—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGES
// ─────────────────────────────────────────────────────────────────────────────

function OverviewPage({ doctor, patients, appointments, notes, messages, onViewPatient, onPage }) {
  const todayApts = (appointments||[]).filter(a=>a.status==="Today");
  const criticalPats = (patients||[]).filter(p=>p.risk==="Critical"||p.risk==="High");
  const unreadMsgs = (messages||[]).filter(m=>!m.read).length;
  const pinnedNotes = (notes||[]).filter(n=>n.pinned);

  return (
    <div style={{animation:"fadeUp .35s ease"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#0c1c3a 0%,#0f3460 50%,#134e7a 100%)",borderRadius:20,padding:"1.75rem 2rem",marginBottom:"1.5rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:220,height:220,borderRadius:"50%",background:"rgba(14,165,233,0.1)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,right:100,width:160,height:160,borderRadius:"50%",background:"rgba(99,102,241,0.08)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16,position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:58,height:58,borderRadius:16,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1.1rem",fontWeight:800,boxShadow:"0 8px 24px rgba(14,165,233,0.45)",flexShrink:0}}>
              {doctor?.avatar||"?"}
            </div>
            <div>
              <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,.45)",fontWeight:600,marginBottom:2}}>Welcome back,</div>
              <div style={{fontSize:"1.3rem",fontWeight:800,color:"#fff",lineHeight:1.15}}>{doctor?.name||"Doctor"}</div>
              <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,.5)",marginTop:3}}>{doctor?.specialty} · {doctor?.department}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[
              {label:"Today's Appointments", val:todayApts.length, icon:"📅", c:"#0ea5e9"},
              {label:"Active Patients",      val:(patients||[]).filter(p=>p.status==="Admitted").length, icon:"🧑", c:"#14b8a6"},
              {label:"Critical Alerts",      val:criticalPats.length, icon:"🚨", c:"#ef4444"},
              {label:"New Messages",         val:unreadMsgs, icon:"💬", c:"#8b5cf6"},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,.08)",borderRadius:12,padding:"10px 16px",border:"1px solid rgba(255,255,255,.1)",backdropFilter:"blur(8px)",minWidth:100,textAlign:"center"}}>
                <div style={{fontSize:"1.2rem",marginBottom:2}}>{s.icon}</div>
                <div style={{fontSize:"1.3rem",fontWeight:800,color:s.c,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:"0.58rem",color:"rgba(255,255,255,.4)",fontWeight:600,marginTop:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"1.25rem",marginBottom:"1.5rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:"0.88rem",fontWeight:800,color:"#0f172a"}}>This Week's Consultations</div>
            <div style={{fontSize:"0.65rem",color:"#94a3b8",marginTop:1}}>Scheduled vs completed appointments</div>
          </div>
          <div style={{display:"flex",gap:12,fontSize:"0.64rem",fontWeight:700}}>
            <span style={{color:"#bfdbfe"}}>■ Scheduled</span>
            <span style={{color:"#0ea5e9"}}>■ Completed</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:10,height:90}}>
          {WEEKLY_STATS.map((d,i)=>{
            const maxV=10;
            const sH=((d.patients/maxV)*72)+4;
            const cH=((d.completed/maxV)*72)+4;
            const isToday=i===4;
            return (
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:2,height:76}}>
                  <div style={{width:"44%",borderRadius:"4px 4px 0 0",background:isToday?"#bfdbfe":"#e0f2fe",height:`${sH}px`,transition:"height .6s ease"}}/>
                  <div style={{width:"44%",borderRadius:"4px 4px 0 0",background:isToday?"#0ea5e9":"#7dd3fc",height:`${cH}px`,transition:"height .6s ease"}}/>
                </div>
                <div style={{fontSize:"0.6rem",color:isToday?"#0ea5e9":"#94a3b8",fontWeight:isToday?800:600}}>{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",marginBottom:"1.5rem"}}>
        {/* Today's appointments */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"1.1rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:"0.85rem",fontWeight:800,color:"#0f172a"}}>Today's Schedule</div>
            <button onClick={()=>onPage("appointments")} style={{fontSize:"0.68rem",fontWeight:700,color:"#0ea5e9",background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          {todayApts.length===0
            ? <div style={{textAlign:"center",padding:"1.5rem",color:"#94a3b8",fontSize:"0.78rem"}}>No appointments today</div>
            : todayApts.map(a=>{
              const as=APT_STATUS_S[a.status]||APT_STATUS_S.Completed;
              return (
                <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,background:"#f8fafc",border:"1px solid #f1f5f9",marginBottom:7,cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>
                  <div style={{width:32,height:32,borderRadius:9,background:avatarColor(a.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.62rem",fontWeight:800,flexShrink:0}}>{a.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.75rem",fontWeight:700,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.patientName}</div>
                    <div style={{fontSize:"0.62rem",color:"#94a3b8"}}>{a.time} · {a.type} · {a.duration}min</div>
                  </div>
                  <span style={{fontSize:"0.58rem",fontWeight:700,padding:"2px 7px",borderRadius:99,background:as.bg,color:as.color,border:`1px solid ${as.border}`,flexShrink:0}}>{a.status}</span>
                </div>
              );
            })
          }
        </div>

        {/* Critical patients */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"1.1rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:"0.85rem",fontWeight:800,color:"#0f172a"}}>⚠ High Priority Patients</div>
            <button onClick={()=>onPage("patients")} style={{fontSize:"0.68rem",fontWeight:700,color:"#ef4444",background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          {criticalPats.length===0
            ? <div style={{textAlign:"center",padding:"1.5rem",color:"#94a3b8",fontSize:"0.78rem"}}>No critical patients</div>
            : criticalPats.map(p=>(
              <div key={p.id} onClick={()=>onViewPatient(p)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,background:p.risk==="Critical"?"#fff1f2":"#fffbeb",border:`1px solid ${p.risk==="Critical"?"#fecdd3":"#fde68a"}`,marginBottom:7,cursor:"pointer",transition:"all .12s"}}
                onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.97)"}
                onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}>
                <div style={{width:32,height:32,borderRadius:9,background:avatarColor(p.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.62rem",fontWeight:800,flexShrink:0}}>{p.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.75rem",fontWeight:700,color:"#0f172a"}}>{p.name}</div>
                  <div style={{fontSize:"0.62rem",color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.diagnosis}</div>
                </div>
                <RiskBadge risk={p.risk}/>
              </div>
            ))
          }
        </div>
      </div>

      {/* Pinned notes + recent messages */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"1.1rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:"0.85rem",fontWeight:800,color:"#0f172a"}}>📌 Pinned Notes</div>
            <button onClick={()=>onPage("notes")} style={{fontSize:"0.68rem",fontWeight:700,color:"#0ea5e9",background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          {pinnedNotes.length===0
            ? <div style={{textAlign:"center",padding:"1.5rem",color:"#94a3b8",fontSize:"0.78rem"}}>No pinned notes</div>
            : pinnedNotes.map(n=>(
              <div key={n.id} style={{background:"#fffbeb",borderRadius:10,padding:"10px 12px",border:"1px solid #fde68a",marginBottom:8,borderLeft:`3px solid ${n.color}`}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0f172a",marginBottom:3}}>{n.patientName}</div>
                <div style={{fontSize:"0.68rem",color:"#475569",lineHeight:1.5}}>{n.note.length>100?n.note.slice(0,100)+"…":n.note}</div>
                <div style={{fontSize:"0.6rem",color:"#94a3b8",marginTop:4}}>{fmtDate(n.date)}</div>
              </div>
            ))
          }
        </div>

        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"1.1rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:"0.85rem",fontWeight:800,color:"#0f172a"}}>💬 Messages</div>
            <button onClick={()=>onPage("messages")} style={{fontSize:"0.68rem",fontWeight:700,color:"#0ea5e9",background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          {(messages||[]).slice(0,4).map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"8px 9px",borderRadius:10,background:m.read?"#fff":"#f0f9ff",border:m.urgent?"1px solid #fecdd3":"1px solid #f1f5f9",marginBottom:6,cursor:"pointer",transition:"background .12s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
              onMouseLeave={e=>e.currentTarget.style.background=m.read?"#fff":"#f0f9ff"}>
              <div style={{width:28,height:28,borderRadius:7,background:avatarColor(m.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.58rem",fontWeight:800,flexShrink:0}}>{m.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{fontSize:"0.7rem",fontWeight:m.read?500:700,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{m.from}</div>
                  {m.urgent && <span style={{fontSize:"0.55rem",fontWeight:800,padding:"1px 5px",borderRadius:99,background:"#fff1f2",color:"#be123c",border:"1px solid #fecdd3",flexShrink:0}}>URGENT</span>}
                  {!m.read && <span style={{width:6,height:6,borderRadius:"50%",background:"#0ea5e9",flexShrink:0}}/>}
                </div>
                <div style={{fontSize:"0.64rem",color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{m.msg}</div>
                <div style={{fontSize:"0.59rem",color:"#94a3b8",marginTop:1}}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PatientsPage({ patients, loading, onViewPatient, onAddNote }) {
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("All");
  const [filterRisk,setFilterRisk]=useState("All");
  const [sort,setSort]=useState("name");
  const filtered=(patients||[])
    .filter(p=>filterStatus==="All"||p.status===filterStatus)
    .filter(p=>filterRisk==="All"||p.risk===filterRisk)
    .filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase())||p.diagnosis.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):sort==="risk"?["Critical","High","Moderate","Low"].indexOf(a.risk)-["Critical","High","Moderate","Low"].indexOf(b.risk):new Date(b.lastVisit)-new Date(a.lastVisit));
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>My Patients</div>
        <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>{(patients||[]).length} patients under your care</div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:"1.1rem",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"7px 13px",flex:1,minWidth:180}}>
          <span style={{color:"#94a3b8"}}>🔍</span>
          <input placeholder="Search patients, diagnosis, ID…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:"none",background:"transparent",fontSize:"0.78rem",color:"#0f172a",fontFamily:"'Sora',sans-serif",outline:"none",width:"100%"}}/>
          {search&&<span onClick={()=>setSearch("")} style={{color:"#94a3b8",cursor:"pointer"}}>✕</span>}
        </div>
        <div style={{display:"flex",gap:5}}>
          {["All","Admitted","Outpatient","Critical","Discharged"].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${filterStatus===s?"#0f172a":"#e2e8f0"}`,background:filterStatus===s?"#0f172a":"#fff",color:filterStatus===s?"#fff":"#64748b",fontSize:"0.7rem",fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"all .15s"}}>{s}</button>
          ))}
        </div>
        <select value={filterRisk} onChange={e=>setFilterRisk(e.target.value)} style={{padding:"6px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",fontSize:"0.75rem",color:"#475569",fontFamily:"'Sora',sans-serif",cursor:"pointer",outline:"none"}}>
          <option value="All">All Risk</option>
          {["Critical","High","Moderate","Low"].map(r=><option key={r}>{r}</option>)}
        </select>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:"6px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",fontSize:"0.75rem",color:"#475569",fontFamily:"'Sora',sans-serif",cursor:"pointer",outline:"none"}}>
          <option value="name">Sort: Name</option>
          <option value="risk">Sort: Risk</option>
          <option value="visit">Sort: Last Visit</option>
        </select>
      </div>
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:"1px solid #f1f5f9"}}>
              {["Patient","Diagnosis","Vitals","Risk","Status","Last Visit","Actions"].map(h=>(
                <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:"0.59rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"#94a3b8",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(4).fill(0).map((_,i)=><tr key={i}><td colSpan={7} style={{padding:"14px"}}><Skel h={36} r={6}/></td></tr>)
              : filtered.length===0 ? <tr><td colSpan={7} style={{padding:"3rem",textAlign:"center",color:"#94a3b8",fontSize:"0.8rem"}}>No patients found</td></tr>
              : filtered.map(p=>(
                <tr key={p.id} style={{cursor:"pointer",transition:"background .12s"}}
                  onMouseEnter={e=>{ for(let td of e.currentTarget.cells) td.style.background="#f8fafc"; }}
                  onMouseLeave={e=>{ for(let td of e.currentTarget.cells) td.style.background=""; }}
                  onClick={()=>onViewPatient(p)}>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:34,height:34,borderRadius:9,background:avatarColor(p.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.62rem",fontWeight:800,flexShrink:0}}>{p.avatar}</div>
                      <div>
                        <div style={{fontSize:"0.77rem",fontWeight:700,color:"#0f172a"}}>{p.name}</div>
                        <div style={{fontSize:"0.61rem",color:"#94a3b8"}}>{p.id} · {p.age}y · {p.gender} · 🩸{p.bloodGroup}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:"11px 14px",fontSize:"0.73rem",color:"#334155",maxWidth:160}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.diagnosis}</div></td>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:"0.6rem",fontWeight:700,padding:"2px 6px",borderRadius:6,background:"#fff1f2",color:"#be123c",fontFamily:"'JetBrains Mono',monospace"}}>BP {p.vitals.bp}</span>
                      <span style={{fontSize:"0.6rem",fontWeight:700,padding:"2px 6px",borderRadius:6,background:"#f0f9ff",color:"#0369a1",fontFamily:"'JetBrains Mono',monospace"}}>HR {p.vitals.hr}</span>
                    </div>
                  </td>
                  <td style={{padding:"11px 14px"}}><RiskBadge risk={p.risk}/></td>
                  <td style={{padding:"11px 14px"}}><StatusPill status={p.status}/></td>
                  <td style={{padding:"11px 14px",fontSize:"0.72rem",color:"#64748b"}}>{fmtDate(p.lastVisit)}</td>
                  <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                    <div style={{display:"flex",gap:5}}>
                      <div title="View Profile" onClick={()=>onViewPatient(p)} style={{width:28,height:28,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"0.75rem",transition:"background .12s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>👁</div>
                      <div title="Add Note" onClick={()=>onAddNote(p)} style={{width:28,height:28,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"0.75rem",transition:"background .12s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}>📝</div>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AppointmentsPage({ appointments, loading }) {
  const [tab,setTab]=useState("All");
  const tabs=["All","Today","Upcoming","Scheduled","Completed"];
  const filtered=(appointments||[]).filter(a=>tab==="All"||a.status===tab);
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>Appointments</div>
        <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>All scheduled consultations</div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:"1.1rem",background:"#f1f5f9",borderRadius:10,padding:3}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px",borderRadius:8,border:"none",background:tab===t?"#fff":"transparent",color:tab===t?"#0f172a":"#94a3b8",fontSize:"0.7rem",fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:tab===t?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .15s"}}>{t}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:"#fff",borderRadius:12,padding:"14px"}}><Skel h={70}/></div>)
          : filtered.length===0 ? <div style={{textAlign:"center",padding:"3rem",color:"#94a3b8"}}>No appointments</div>
          : filtered.map(a=>{
            const as=APT_STATUS_S[a.status]||APT_STATUS_S.Completed;
            return (
              <div key={a.id} style={{background:"#fff",border:`1px solid ${a.status==="Today"?"#bfdbfe":"#e2e8f0"}`,borderRadius:14,padding:"14px 16px",boxShadow:a.status==="Today"?"0 4px 14px rgba(37,99,235,.07)":"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,borderRadius:12,background:avatarColor(a.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.82rem",fontWeight:800,flexShrink:0}}>{a.avatar}</div>
                    <div>
                      <div style={{fontSize:"0.84rem",fontWeight:800,color:"#0f172a"}}>{a.patientName}</div>
                      <div style={{fontSize:"0.65rem",color:"#94a3b8"}}>{a.patientId}</div>
                    </div>
                  </div>
                  <span style={{fontSize:"0.63rem",fontWeight:700,padding:"3px 10px",borderRadius:99,background:as.bg,color:as.color,border:`1px solid ${as.border}`,flexShrink:0}}>{a.status}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
                  {[["📅 Date",fmtDate(a.date)],["⏰ Time",a.time],["🏷 Type",a.type],["⏱ Duration",`${a.duration} min`]].map(([l,v])=>(
                    <div key={l} style={{background:"#f8fafc",borderRadius:8,padding:"7px 9px"}}>
                      <div style={{fontSize:"0.58rem",color:"#94a3b8",fontWeight:700,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0f172a"}}>{v}</div>
                    </div>
                  ))}
                </div>
                {a.reason && <div style={{fontSize:"0.68rem",color:"#475569",padding:"7px 10px",background:"#f8fafc",borderRadius:8,border:"1px solid #f1f5f9"}}>📋 {a.reason}</div>}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

function RecordsPage({ records, loading }) {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("All");
  const types=["All",...new Set((records||[]).map(r=>r.type))];
  const filtered=(records||[]).filter(r=>(filter==="All"||r.type===filter)&&(!search||r.title.toLowerCase().includes(search.toLowerCase())||r.patientName.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>Patient Records</div>
        <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>All records across your patients</div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:"1.1rem",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"7px 13px",flex:1,minWidth:180}}>
          <span style={{color:"#94a3b8"}}>🔍</span>
          <input placeholder="Search records or patients…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:"none",background:"transparent",fontSize:"0.78rem",color:"#0f172a",fontFamily:"'Sora',sans-serif",outline:"none",width:"100%"}}/>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {types.map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${filter===t?"#0f172a":"#e2e8f0"}`,background:filter===t?"#0f172a":"#fff",color:filter===t?"#fff":"#64748b",fontSize:"0.7rem",fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"all .15s"}}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:"#fff",borderRadius:12,padding:"14px"}}><Skel h={60}/></div>)
          : filtered.length===0 ? <div style={{textAlign:"center",padding:"3rem",color:"#94a3b8"}}>No records found</div>
          : filtered.map(r=>(
            <div key={r.id} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"14px 16px",display:"flex",gap:14,alignItems:"flex-start",borderLeft:`4px solid ${r.color}`,transition:"box-shadow .15s",cursor:"default"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.07)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <div style={{width:42,height:42,borderRadius:11,background:r.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:4}}>
                  <div style={{fontSize:"0.83rem",fontWeight:700,color:"#0f172a"}}>{r.title}</div>
                  <span style={{fontSize:"0.6rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:SEV_S[r.severity]?.bg,color:SEV_S[r.severity]?.color,flexShrink:0,border:`1px solid ${SEV_S[r.severity]?.color}33`}}>{r.severity}</span>
                </div>
                <div style={{fontSize:"0.65rem",color:r.color,fontWeight:700,marginBottom:2}}>{r.type} · {r.patientName} · {fmtDate(r.date)}</div>
                {r.aiSummary && <div style={{fontSize:"0.68rem",color:"#6366f1",background:"#f5f3ff",padding:"5px 9px",borderRadius:7,marginTop:6,border:"1px solid #e0e7ff",lineHeight:1.5}}>🤖 {r.aiSummary}</div>}
                {r.tags?.length>0 && <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:7}}>{r.tags.map(t=><Tag key={t} t={t}/>)}</div>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function NotesPage({ notes, loading, onAdd, onDelete }) {
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
        <div>
          <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>Clinical Notes</div>
          <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>Private notes attached to your patients</div>
        </div>
        <button onClick={()=>onAdd(null)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:10,border:"none",background:"#0f172a",color:"#fff",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>+ Add Note</button>
      </div>
      {/* Pinned */}
      {(notes||[]).filter(n=>n.pinned).length>0 && (
        <div style={{marginBottom:"1.25rem"}}>
          <div style={{fontSize:"0.65rem",fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>📌 Pinned</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
            {(notes||[]).filter(n=>n.pinned).map(n=>(
              <div key={n.id} style={{background:"#fffbeb",borderRadius:13,padding:"13px 14px",border:"1px solid #fde68a",borderLeft:`3px solid ${n.color}`,position:"relative"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontSize:"0.76rem",fontWeight:800,color:"#0f172a"}}>{n.patientName}</div>
                  <div style={{display:"flex",gap:5}}>
                    <span style={{fontSize:"0.8rem",cursor:"pointer"}} onClick={()=>onDelete(n.id)}>🗑</span>
                  </div>
                </div>
                <div style={{fontSize:"0.72rem",color:"#334155",lineHeight:1.6}}>{n.note}</div>
                <div style={{fontSize:"0.6rem",color:"#94a3b8",marginTop:8}}>{fmtDate(n.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* All notes */}
      <div style={{fontSize:"0.65rem",fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>All Notes</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:"#fff",borderRadius:12,padding:"14px"}}><Skel h={80}/></div>)
          : (notes||[]).filter(n=>!n.pinned).map(n=>(
            <div key={n.id} style={{background:"#fff",borderRadius:13,padding:"13px 14px",border:"1px solid #e2e8f0",borderLeft:`3px solid ${n.color}`,transition:"box-shadow .15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.07)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:"0.76rem",fontWeight:800,color:"#0f172a"}}>{n.patientName}</div>
                <span style={{fontSize:"0.8rem",cursor:"pointer",color:"#94a3b8"}} onClick={()=>onDelete(n.id)}>🗑</span>
              </div>
              <div style={{fontSize:"0.72rem",color:"#334155",lineHeight:1.6}}>{n.note}</div>
              <div style={{fontSize:"0.6rem",color:"#94a3b8",marginTop:8}}>{fmtDate(n.date)}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function MessagesPage({ messages, loading }) {
  const [selected,setSelected]=useState(null);
  const [reply,setReply]=useState("");
  const msg = selected ? messages?.find(m=>m.id===selected) : null;
  const roleColor = { admin:"#6366f1", patient:"#0ea5e9", lab:"#f59e0b", doctor:"#14b8a6" };
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"#0f172a"}}>Messages</div>
        <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>{(messages||[]).filter(m=>!m.read).length} unread messages</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:14,height:"60vh"}}>
        {/* List */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #f1f5f9",fontSize:"0.72rem",fontWeight:700,color:"#475569",background:"#f8fafc"}}>Inbox</div>
          <div style={{flex:1,overflowY:"auto"}}>
            {loading ? <div style={{padding:"1rem"}}><Skel h={200}/></div>
              : (messages||[]).map(m=>(
                <div key={m.id} onClick={()=>setSelected(m.id)} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",borderBottom:"1px solid #f8fafc",background:selected===m.id?"#eff6ff":m.read?"#fff":"#f0f9ff",cursor:"pointer",transition:"background .12s"}}
                  onMouseEnter={e=>{ if(selected!==m.id) e.currentTarget.style.background="#f8fafc"; }}
                  onMouseLeave={e=>{ if(selected!==m.id) e.currentTarget.style.background=m.read?"#fff":"#f0f9ff"; }}>
                  <div style={{width:34,height:34,borderRadius:9,background:avatarColor(m.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.65rem",fontWeight:800,flexShrink:0}}>{m.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                      <div style={{fontSize:"0.74rem",fontWeight:m.read?500:800,color:"#0f172a",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.from}</div>
                      {m.urgent && <span style={{fontSize:"0.55rem",fontWeight:800,padding:"1px 5px",borderRadius:99,background:"#fff1f2",color:"#be123c",border:"1px solid #fecdd3",flexShrink:0}}>!</span>}
                      {!m.read && <span style={{width:6,height:6,borderRadius:"50%",background:"#0ea5e9",flexShrink:0}}/>}
                    </div>
                    <div style={{fontSize:"0.64rem",color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.msg}</div>
                    <div style={{fontSize:"0.58rem",color:"#94a3b8",marginTop:2}}>{m.time}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        {/* Conversation panel */}
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {!msg
            ? <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:"0.8rem"}}>Select a message to read</div>
            : <>
              <div style={{padding:"14px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:12,background:"#f8fafc"}}>
                <div style={{width:38,height:38,borderRadius:10,background:avatarColor(msg.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.72rem",fontWeight:800,flexShrink:0}}>{msg.avatar}</div>
                <div>
                  <div style={{fontSize:"0.82rem",fontWeight:800,color:"#0f172a"}}>{msg.from}</div>
                  <div style={{fontSize:"0.63rem",padding:"1px 8px",borderRadius:99,background:roleColor[msg.role]+"18",color:roleColor[msg.role],fontWeight:700,display:"inline-block",marginTop:2,border:`1px solid ${roleColor[msg.role]}30`,textTransform:"capitalize"}}>{msg.role}</div>
                </div>
                {msg.urgent && <span style={{marginLeft:"auto",fontSize:"0.65rem",fontWeight:800,padding:"3px 10px",borderRadius:99,background:"#fff1f2",color:"#be123c",border:"1px solid #fecdd3"}}>URGENT</span>}
              </div>
              <div style={{flex:1,padding:"18px 16px",overflowY:"auto",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                <div style={{background:"#f1f5f9",borderRadius:"12px 12px 12px 3px",padding:"12px 14px",maxWidth:"85%",marginBottom:8}}>
                  <div style={{fontSize:"0.78rem",color:"#0f172a",lineHeight:1.65}}>{msg.msg}</div>
                  <div style={{fontSize:"0.61rem",color:"#94a3b8",marginTop:5}}>{msg.time}</div>
                </div>
              </div>
              <div style={{padding:"12px 14px",borderTop:"1px solid #f1f5f9",display:"flex",gap:10}}>
                <input value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type a reply…" style={{flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:"0.78rem",fontFamily:"'Sora',sans-serif",color:"#0f172a",background:"#fafafa",outline:"none"}}
                  onKeyDown={e=>{ if(e.key==="Enter"&&reply.trim()){setReply("");} }}/>
                <button onClick={()=>setReply("")} style={{padding:"9px 18px",borderRadius:9,border:"none",background:"#0f172a",color:"#fff",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>Send ↑</button>
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ doctor, loading }) {
  if(loading) return <div><Skel h={400}/></div>;
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{background:"linear-gradient(135deg,#0c1c3a,#0f3460)",borderRadius:20,padding:"1.75rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
        <div style={{width:68,height:68,borderRadius:18,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1.2rem",fontWeight:800,boxShadow:"0 8px 24px rgba(14,165,233,.45)",flexShrink:0}}>{doctor?.avatar||"?"}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:"1.2rem",fontWeight:800,color:"#fff"}}>{doctor?.name}</div>
          <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,.5)",marginTop:3}}>{doctor?.specialty} · {doctor?.department}</div>
          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
            {[doctor?.qualification,`${doctor?.experience} yrs exp.`,`⭐ ${doctor?.rating}`].map(v=>(
              <span key={v} style={{padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.8)",fontSize:"0.65rem",fontWeight:700,border:"1px solid rgba(255,255,255,.15)"}}>{v}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[
          {title:"Personal Details",icon:"👤",rows:[["Name",doctor?.name],["Email",doctor?.email],["Phone",doctor?.phone],["License No.",doctor?.licenseNo]]},
          {title:"Professional Info",icon:"🏥",rows:[["Specialty",doctor?.specialty],["Department",doctor?.department],["Qualification",doctor?.qualification],["Experience",`${doctor?.experience} years`]]},
          {title:"Work & Fees",icon:"💼",rows:[["Schedule",doctor?.schedule],["Consult Fee",`₹${doctor?.consultFee}`],["Rating",`${doctor?.rating}/5.0`],["Doctor ID",doctor?.id]]},
        ].map(s=>(
          <div key={s.title} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"1.1rem"}}>
            <div style={{fontSize:"0.68rem",fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,display:"flex",alignItems:"center",gap:6}}><span>{s.icon}</span>{s.title}</div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {s.rows.map(([l,v])=>(
                <div key={l} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  <span style={{fontSize:"0.6rem",color:"#94a3b8",fontWeight:700,width:90,flexShrink:0,paddingTop:1,textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</span>
                  <span style={{fontSize:"0.76rem",fontWeight:600,color:"#0f172a",flex:1}}>{v||"—"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const [page,setPage]          = useState("overview");
  const [notifOpen,setNotifOpen]= useState(false);
  const [sideOpen,setSideOpen]  = useState(false);
  const [drawer,setDrawer]      = useState(null);
  const [noteModal,setNoteModal]= useState(null); // null | { patient } | { editNote }
  const notifRef = useRef(null);

  const {data:doctor,    loading:dl} = useDummyFetch("profile",      DUMMY_DOCTOR,       300);
  const {data:patients,  loading:pl} = useDummyFetch("patients",     DUMMY_PATIENTS,     420);
  const {data:appts,     loading:al} = useDummyFetch("appointments", DUMMY_APPOINTMENTS, 460);
  const {data:records,   loading:rl} = useDummyFetch("records",      DUMMY_RECORDS,      500);
  const [notes,setNotes]             = useState(null);
  const [notesLoading,setNL]         = useState(true);
  const {data:messages,  loading:ml} = useDummyFetch("messages",     DUMMY_MESSAGES,     400);

  useEffect(()=>{ setTimeout(()=>{setNotes(DUMMY_NOTES);setNL(false);},440); },[]);

  useEffect(()=>{
    const h=e=>{if(notifRef.current&&!notifRef.current.contains(e.target))setNotifOpen(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  const unreadMsgs = (messages||[]).filter(m=>!m.read).length;

  const handleAddNote = (savedNote) => {
    setNotes(prev=>{
      const idx=(prev||[]).findIndex(n=>n.id===savedNote.id);
      if(idx>=0){const a=[...prev];a[idx]=savedNote;return a;}
      return [...(prev||[]),savedNote];
    });
    setNoteModal(null);
  };

  const handleDeleteNote = (id) => setNotes(prev=>(prev||[]).filter(n=>n.id!==id));

  const NAV = [
    {id:"overview",     label:"Overview",     icon:"🏠",  badge:null},
    {id:"patients",     label:"My Patients",  icon:"🧑",  badge:(patients||[]).length||null},
    {id:"appointments", label:"Appointments", icon:"📅",  badge:(appts||[]).filter(a=>a.status==="Today").length||null},
    {id:"records",      label:"Records",      icon:"🗂️", badge:null},
    {id:"notes",        label:"Notes",        icon:"📝",  badge:(notes||[]).filter(n=>n.pinned).length||null},
    {id:"messages",     label:"Messages",     icon:"💬",  badge:unreadMsgs||null},
    {id:"profile",      label:"My Profile",   icon:"👤",  badge:null},
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { height:100%; }
        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(13px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }

        .dd-root { display:flex; min-height:100vh; background:#f0f4f8; font-family:'Sora',sans-serif; color:#0f172a; }

        .dd-sidebar {
          width:248px; min-height:100vh; background:#fff;
          border-right:1px solid #e8edf4;
          display:flex; flex-direction:column;
          position:fixed; top:0; left:0; height:100vh; z-index:100;
          box-shadow:2px 0 16px rgba(0,0,0,.04);
        }
        .dd-logo { height:68px; padding:0 1.25rem; display:flex; align-items:center; gap:11px; border-bottom:1px solid #f1f5f9; flex-shrink:0; }
        .dd-logo-ic { width:36px; height:36px; borderRadius:10px; background:linear-gradient(135deg,#0c1c3a,#0f3460); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; border-radius:10px; }
        .dd-logo-name { font-size:0.9rem; font-weight:800; color:#0f172a; }
        .dd-logo-sub  { font-size:0.55rem; color:#94a3b8; letter-spacing:0.08em; text-transform:uppercase; margin-top:1px; }

        .dd-nav { flex:1; overflow-y:auto; padding:.75rem .75rem; scrollbar-width:none; }
        .dd-nav::-webkit-scrollbar { display:none; }

        .dd-nav-grp-label { font-size:0.56rem; font-weight:800; color:#cbd5e1; text-transform:uppercase; letter-spacing:0.1em; padding:6px 12px 4px; }

        .dd-nav-item {
          display:flex; align-items:center; gap:10px;
          padding:9px 12px; border-radius:10px; cursor:pointer;
          transition:all .18s; color:#64748b; font-size:0.79rem; font-weight:600;
          margin-bottom:2px; border:1px solid transparent; position:relative; text-decoration:none;
        }
        .dd-nav-item:hover { background:#f8fafc; color:#0f172a; }
        .dd-nav-item.on { background:linear-gradient(135deg,#f0f9ff,#eff6ff); color:#0f172a; border-color:#bfdbfe; }
        .dd-nav-item.on::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:3px; background:#0ea5e9; border-radius:0 3px 3px 0; }

        .dd-nav-badge { margin-left:auto; font-size:0.55rem; font-weight:800; background:#ef4444; color:#fff; padding:1px 6px; border-radius:99px; flex-shrink:0; }
        .dd-nav-badge.blue { background:#0ea5e9; }

        .dd-user { padding:.75rem; border-top:1px solid #f1f5f9; flex-shrink:0; }
        .dd-user-inner { display:flex; align-items:center; gap:10px; padding:9px 11px; border-radius:10px; background:#f8fafc; cursor:pointer; transition:background .15s; }
        .dd-user-inner:hover { background:#f1f5f9; }
        .dd-av-sm { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#0c1c3a,#0ea5e9); display:flex; align-items:center; justify-content:center; font-size:0.68rem; font-weight:800; color:#fff; flex-shrink:0; }

        .dd-main { margin-left:248px; flex:1; display:flex; flex-direction:column; min-height:100vh; }
        .dd-topbar { height:68px; background:#fff; border-bottom:1px solid #e8edf4; display:flex; align-items:center; justify-content:space-between; padding:0 1.75rem; position:sticky; top:0; z-index:90; box-shadow:0 1px 4px rgba(0,0,0,.04); gap:12px; }
        .dd-icon-btn { width:36px; height:36px; border-radius:10px; border:1.5px solid #e2e8f0; background:#f8fafc; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.88rem; transition:background .15s; position:relative; }
        .dd-icon-btn:hover { background:#f1f5f9; }
        .dd-notif-ct { position:absolute; top:-5px; right:-5px; width:17px; height:17px; border-radius:50%; background:#ef4444; color:#fff; font-size:0.52rem; font-weight:800; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }

        .dd-content { flex:1; padding:1.75rem; overflow-y:auto; }
        .dd-content::-webkit-scrollbar { width:5px; }
        .dd-content::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
        .dd-footer { height:44px; background:#fff; border-top:1px solid #f1f5f9; display:flex; align-items:center; justify-content:center; font-size:0.62rem; color:#94a3b8; }

        @media(max-width:900px) {
          .dd-sidebar { transform:translateX(-100%); transition:transform .3s; }
          .dd-sidebar.open { transform:translateX(0); }
          .dd-main { margin-left:0; }
        }
      `}</style>

      <div className="dd-root">

        {/* ── SIDEBAR ── */}
        <aside className={`dd-sidebar${sideOpen?" open":""}`}>
          <div className="dd-logo">
            <div className="dd-logo-ic" style={{background:"linear-gradient(135deg,#0c1c3a,#0f3460)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏥</div>
            <div>
              <div className="dd-logo-name">Aroha AI</div>
              <div className="dd-logo-sub">Doctor Portal</div>
            </div>
          </div>

          <div className="dd-nav">
            <div className="dd-nav-grp-label">Workspace</div>
            {NAV.map(n=>(
              <div key={n.id} className={`dd-nav-item${page===n.id?" on":""}`} onClick={()=>{setPage(n.id);setSideOpen(false);}}>
                <span style={{fontSize:"1rem",width:20,textAlign:"center"}}>{n.icon}</span>
                <span>{n.label}</span>
                {n.badge && <span className={`dd-nav-badge${n.id==="appointments"?" blue":""}`}>{n.badge}</span>}
              </div>
            ))}
          </div>

          {!dl && doctor && (
            <div className="dd-user">
              <div className="dd-user-inner" onClick={()=>setPage("profile")}>
                <div className="dd-av-sm">{doctor.avatar}</div>
                <div>
                  <div style={{fontSize:"0.73rem",fontWeight:700,color:"#0f172a"}}>{doctor.name?.split(" ").slice(0,3).join(" ")}</div>
                  <div style={{fontSize:"0.58rem",color:"#94a3b8"}}>{doctor.specialty}</div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {sideOpen && <div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:99}}/>}

        {/* ── MAIN ── */}
        <div className="dd-main">
          <header className="dd-topbar">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{display:"none"}} className="dd-hamburger" onClick={()=>setSideOpen(s=>!s)}>☰</div>
              <div style={{fontSize:"1.05rem",fontWeight:800,color:"#0f172a"}}>{NAV.find(n=>n.id===page)?.icon} {NAV.find(n=>n.id===page)?.label}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:API.USE_REAL_API?"#f0fdf4":"#fffbeb",border:`1px solid ${API.USE_REAL_API?"#bbf7d0":"#fde68a"}`,color:API.USE_REAL_API?"#15803d":"#92400e"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:API.USE_REAL_API?"#22c55e":"#f59e0b",display:"inline-block"}}/>
                {API.USE_REAL_API?"Live API":"Demo Mode"}
              </div>
              <div ref={notifRef} style={{position:"relative"}}>
                <div className="dd-icon-btn" onClick={()=>setNotifOpen(o=>!o)}>
                  🔔
                  {(messages||[]).filter(m=>!m.read).length>0 && <span className="dd-notif-ct">{(messages||[]).filter(m=>!m.read).length}</span>}
                </div>
                {notifOpen && (
                  <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,background:"#fff",borderRadius:14,border:"1px solid #e2e8f0",boxShadow:"0 12px 40px rgba(0,0,0,.14)",width:320,zIndex:200,overflow:"hidden",animation:"fadeUp .18s ease"}}>
                    <div style={{padding:"11px 15px",borderBottom:"1px solid #f1f5f9",fontSize:"0.8rem",fontWeight:800,color:"#0f172a"}}>Inbox Preview</div>
                    {(messages||[]).filter(m=>!m.read).slice(0,4).map(m=>(
                      <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"10px 15px",borderBottom:"1px solid #f8fafc",background:"#f0f9ff",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="#f0f9ff"}>
                        <div style={{width:28,height:28,borderRadius:7,background:avatarColor(m.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.58rem",fontWeight:800,flexShrink:0}}>{m.avatar}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0f172a"}}>{m.from}</div>
                          <div style={{fontSize:"0.63rem",color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.msg}</div>
                        </div>
                      </div>
                    ))}
                    <div onClick={()=>{setPage("messages");setNotifOpen(false);}} style={{padding:"10px 15px",fontSize:"0.7rem",fontWeight:700,color:"#0ea5e9",textAlign:"center",cursor:"pointer",background:"#f8fafc"}}>View all messages →</div>
                  </div>
                )}
              </div>
              <div onClick={()=>setPage("profile")} style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0c1c3a,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.68rem",fontWeight:800,cursor:"pointer",border:"2px solid #e2e8f0"}}>
                {doctor?.avatar||"?"}
              </div>
            </div>
          </header>

          <main className="dd-content">
            {page==="overview"     && <OverviewPage     doctor={doctor} patients={patients} appointments={appts} records={records} notes={notes} messages={messages} onViewPatient={p=>{setDrawer(p);}} onPage={setPage} onAddNote={p=>setNoteModal({patient:p})}/>}
            {page==="patients"     && <PatientsPage     patients={patients} records={records} notes={notes} loading={pl} onViewPatient={p=>setDrawer(p)} onAddNote={p=>setNoteModal({patient:p})}/>}
            {page==="appointments" && <AppointmentsPage appointments={appts} loading={al}/>}
            {page==="records"      && <RecordsPage      records={records} loading={rl}/>}
            {page==="notes"        && <NotesPage        notes={notes} patients={patients} loading={notesLoading} onAdd={p=>setNoteModal({patient:p})} onDelete={handleDeleteNote}/>}
            {page==="messages"     && <MessagesPage     messages={messages} loading={ml}/>}
            {page==="profile"      && <ProfilePage      doctor={doctor} loading={dl}/>}
          </main>

          <footer className="dd-footer">© {new Date().getFullYear()} Aroha AI — Clinical workspace for {doctor?.name||"doctor"}</footer>
        </div>
      </div>

      {drawer && (
        <PatientDrawer
          patient={drawer}
          records={records}
          notes={notes}
          onClose={()=>setDrawer(null)}
          onAddNote={()=>setNoteModal({patient:drawer})}
        />
      )}

      {noteModal && (
        <NoteModal
          patients={patients}
          editNote={noteModal.editNote||null}
          onClose={()=>setNoteModal(null)}
          onSave={handleAddNote}
          preselect={noteModal.patient?.id}
        />
      )}
    </>
  );
}