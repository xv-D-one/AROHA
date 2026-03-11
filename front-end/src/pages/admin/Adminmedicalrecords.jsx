import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  API CONFIG — set USE_REAL_API = true + BASE_URL when backend is ready
// ─────────────────────────────────────────────────────────────────────────────
const API = {
  BASE_URL: "http://localhost:5000/api",
  USE_REAL_API: false,
  EP: {
    list:      "/records",
    create:    "/records",
    update:    "/records/:id",
    delete:    "/records/:id",
    aiSummary: "/records/:id/ai-summary",
    patients:  "/patients?select=id,name,dob,bloodGroup,department",
    doctors:   "/doctors?select=id,name,specialty",
  },
};

async function apiFetch(method, path, body = null) {
  const res = await fetch(`${API.BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const RECORD_TYPES = [
  { value: "Lab Report",       color: "#0ea5e9" },
  { value: "Prescription",      color: "#6366f1" },
  { value: "Imaging",          color: "#14b8a6" },
  { value: "Discharge Summary", color: "#f59e0b" },
  { value: "Consultation Note", color: "#8b5cf6" },
  { value: "Surgery Report",   color: "#ef4444" },
  { value: "Vaccination",      color: "#10b981" },
  { value: "Allergy Report",   color: "#f97316" },
];

const SEVERITY = ["Normal", "Mild", "Moderate", "Severe", "Critical"];
const SEV_STYLE = {
  Normal:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  Mild:     { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  Moderate: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  Severe:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  Critical: { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
};

const DUMMY_PATIENTS = [
  { id:"P-1001", name:"Aisha Nair",     dob:"1990-04-12", bloodGroup:"B+",  department:"Cardiology"     },
  { id:"P-1002", name:"Samuel Thomas",  dob:"1972-09-25", bloodGroup:"O+",  department:"Neurology"      },
  { id:"P-1003", name:"Rohan Varma",    dob:"1997-01-08", bloodGroup:"A-",  department:"Orthopedics"    },
  { id:"P-1004", name:"Priya Krishnan", dob:"1980-07-30", bloodGroup:"AB+", department:"General Medicine"},
  { id:"P-1005", name:"Meera Suresh",   dob:"1963-12-14", bloodGroup:"B-",  department:"Pediatrics"     },
  { id:"P-1006", name:"Arjun Dev",      dob:"1985-03-20", bloodGroup:"O-",  department:"Dermatology"    },
  { id:"P-1007", name:"Lakshmi Pillai", dob:"1955-06-18", bloodGroup:"A+",  department:"Cardiology"     },
];

const DUMMY_DOCTORS = [
  { id:"D-001", name:"Dr. Arjun Pillai",  specialty:"Cardiology"      },
  { id:"D-002", name:"Dr. Kavya Menon",   specialty:"Dermatology"     },
  { id:"D-003", name:"Dr. Lena Mathew",   specialty:"Neurology"       },
  { id:"D-004", name:"Dr. Ravi Shankar",  specialty:"Orthopedics"     },
  { id:"D-005", name:"Dr. Priya Nambiar", specialty:"Pediatrics"      },
  { id:"D-006", name:"Dr. Suresh Kumar",  specialty:"General Medicine" },
];

const DUMMY_RECORDS = [
  {
    id: "REC-001", patientId: "P-1001", patientName: "Aisha Nair", patientDept: "Cardiology",
    doctorId: "D-001", doctorName: "Dr. Arjun Pillai",
    type: "Lab Report", title: "Complete Blood Count (CBC)",
    date: "2025-03-08", time: "09:30",
    severity: "Moderate",
    description: "CBC panel showing mild anaemia with haemoglobin at 10.2 g/dL. WBC count within normal range. Platelet count slightly elevated.",
    findings: "Hb: 10.2 g/dL (Low)\nWBC: 7,400/μL (Normal)\nPlatelets: 420,000/μL (High-Normal)\nMCV: 72 fL (Low)",
    medications: "Ferrous sulfate 200mg twice daily\nFolic acid 5mg once daily",
    followUp: "2025-03-22",
    aiSummary: "Patient shows signs of iron-deficiency anaemia. Iron supplementation initiated. Follow-up CBC recommended in 2 weeks to monitor response to treatment.",
    attachments: ["CBC_Report_Mar08.pdf"],
    tags: ["Blood Test", "Anaemia", "Follow-up Required"],
    isConfidential: false,
    createdBy: "Admin",
    createdAt: "2025-03-08T09:45:00",
  },
  {
    id: "REC-002", patientId: "P-1001", patientName: "Aisha Nair", patientDept: "Cardiology",
    doctorId: "D-001", doctorName: "Dr. Arjun Pillai",
    type: "Prescription", title: "Antihypertensive Medication",
    date: "2025-03-01", time: "11:00",
    severity: "Moderate",
    description: "Patient presenting with persistent hypertension (BP: 148/92 mmHg). Initiating pharmacological management alongside lifestyle modifications.",
    findings: "BP: 148/92 mmHg\nHR: 78 bpm\nWeight: 58kg",
    medications: "Amlodipine 5mg once daily\nTelmisartan 40mg once daily",
    followUp: "2025-03-15",
    aiSummary: "Hypertension management initiated with calcium channel blocker and ARB combination. Patient counselled on DASH diet and sodium restriction.",
    attachments: ["Prescription_Mar01.pdf"],
    tags: ["Hypertension", "Prescription", "BP Management"],
    isConfidential: false,
    createdBy: "Admin",
    createdAt: "2025-03-01T11:20:00",
  },
  {
    id: "REC-003", patientId: "P-1002", patientName: "Samuel Thomas", patientDept: "Neurology",
    doctorId: "D-003", doctorName: "Dr. Lena Mathew",
    type: "Consultation Note", title: "Migraine Assessment & Management Plan",
    date: "2025-02-18", time: "14:15",
    severity: "Mild",
    description: "Patient reports recurrent migraines, 3-4 episodes per month, each lasting 6-12 hours. Associated with photophobia and nausea. No aura reported.",
    findings: "Neurological exam: Normal\nCranial nerves: Intact\nFundoscopy: Normal\nMRI Brain (prior): No structural abnormality",
    medications: "Sumatriptan 50mg PRN\nPropranolol 40mg daily (prophylaxis)\nOndansetron 4mg PRN for nausea",
    followUp: "2025-03-18",
    aiSummary: "Episodic migraine without aura confirmed. Prophylactic therapy with beta-blocker initiated. Triptan provided for acute attacks. Patient educated on trigger identification.",
    attachments: ["Neuro_Consult_Feb18.pdf", "MRI_Report.pdf"],
    tags: ["Migraine", "Neurology", "Prophylaxis"],
    isConfidential: false,
    createdBy: "Admin",
    createdAt: "2025-02-18T14:30:00",
  },
  {
    id: "REC-004", patientId: "P-1003", patientName: "Rohan Varma", patientDept: "Orthopedics",
    doctorId: "D-004", doctorName: "Dr. Ravi Shankar",
    type: "Surgery Report", title: "ACL Reconstruction — Right Knee",
    date: "2025-01-12", time: "08:00",
    severity: "Severe",
    description: "Elective ACL reconstruction performed using patellar tendon autograft. Surgery proceeded without complications. Tourniquet time: 62 minutes.",
    findings: "Procedure: Arthroscopic ACL reconstruction\nGraft: Patellar tendon autograft\nAnesthesia: Spinal\nEBL: 150mL\nDuration: 95 minutes",
    medications: "Cefazolin 1g IV pre-op\nMorphine PCA post-op\nCelecoxib 200mg BD\nLow-molecular-weight heparin (DVT prophylaxis)",
    followUp: "2025-01-19",
    aiSummary: "Successful ACL reconstruction. Patient to begin physiotherapy at 2 weeks post-op. Weight bearing as tolerated with crutches. Ice and elevation advised for 72 hours.",
    attachments: ["Surgery_Report_Jan12.pdf", "Pre-op_Imaging.pdf", "Post-op_Xray.jpg"],
    tags: ["ACL", "Knee Surgery", "Post-op Care"],
    isConfidential: false,
    createdBy: "Admin",
    createdAt: "2025-01-12T16:00:00",
  },
  {
    id: "REC-005", patientId: "P-1004", patientName: "Priya Krishnan", patientDept: "General Medicine",
    doctorId: "D-006", doctorName: "Dr. Suresh Kumar",
    type: "Lab Report", title: "HbA1c & Diabetic Panel",
    date: "2025-03-05", time: "07:45",
    severity: "Moderate",
    description: "Routine diabetic monitoring panel. HbA1c elevated, indicating suboptimal glycaemic control. Renal function and lipid profile also assessed.",
    findings: "HbA1c: 8.4% (Target <7%)\nFasting Glucose: 178 mg/dL\nCreatinine: 0.9 mg/dL\neGFR: >60\nLDL: 112 mg/dL\nTriglycerides: 168 mg/dL",
    medications: "Metformin 1000mg BD (continue)\nGlimepiride 2mg OD (increase to 4mg)\nAtorvastatin 20mg ON",
    followUp: "2025-04-05",
    aiSummary: "Diabetic control suboptimal. Intensification of oral hypoglycaemic therapy recommended. Statin initiated for dyslipidaemia. Dietary counselling reinforced.",
    attachments: ["Diabetic_Panel_Mar05.pdf"],
    tags: ["Diabetes", "HbA1c", "Lipids"],
    isConfidential: false,
    createdBy: "Admin",
    createdAt: "2025-03-05T08:00:00",
  },
  {
    id: "REC-006", patientId: "P-1007", patientName: "Lakshmi Pillai", patientDept: "Cardiology",
    doctorId: "D-001", doctorName: "Dr. Arjun Pillai",
    type: "Imaging", title: "12-Lead ECG — Atrial Fibrillation",
    date: "2025-03-07", time: "16:30",
    severity: "Critical",
    description: "Urgent ECG performed for palpitations and breathlessness. Findings consistent with new-onset atrial fibrillation with rapid ventricular response.",
    findings: "Rhythm: Irregularly irregular\nVentricular rate: 142 bpm\nNo P waves identifiable\nNo ST changes\nAxis: Normal",
    medications: "Metoprolol 5mg IV stat\nWarfarin 5mg OD (anticoagulation)\nDigoxin 0.25mg OD (rate control)\nAdmit for monitoring",
    followUp: "2025-03-08",
    aiSummary: "New-onset AF with RVR detected. Rate control achieved with IV metoprolol. Anticoagulation initiated to reduce stroke risk. Echocardiogram and thyroid function tests ordered.",
    attachments: ["ECG_Mar07.pdf", "Echo_Request.pdf"],
    tags: ["Atrial Fibrillation", "ECG", "Urgent", "Cardiology"],
    isConfidential: true,
    createdBy: "Admin",
    createdAt: "2025-03-07T16:45:00",
  },
];

const EMPTY_FORM = {
  patientId: "", patientName: "", patientDept: "",
  doctorId: "", doctorName: "",
  type: "", title: "", date: "", time: "",
  severity: "Normal",
  description: "", findings: "", medications: "",
  followUp: "", tags: "", attachments: "",
  isConfidential: false,
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#0ea5e9","#14b8a6","#f59e0b","#6366f1","#10b981","#ef4444","#8b5cf6","#ec4899"];
const avatarColor  = s => AVATAR_COLORS[(s?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const initials     = n => n ? n.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";
const fmtDate      = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
const typeInfo     = t => RECORD_TYPES.find(r=>r.value===t) || { icon:"📄", color:"#64748b" };

function Skel({ h=18, w="100%", r=6 }) {
  return <div style={{ width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite" }}/>;
}

function SevBadge({ s }) {
  const st = SEV_STYLE[s] || SEV_STYLE.Normal;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:99,background:st.bg,color:st.color,border:`1px solid ${st.border}`,fontSize:"0.62rem",fontWeight:700 }}>{s}</span>;
}

function Tag({ label }) {
  return <span style={{ padding:"2px 8px",borderRadius:99,background:"#f1f5f9",color:"#475569",fontSize:"0.62rem",fontWeight:600,border:"1px solid #e2e8f0" }}>{label}</span>;
}

function Field({ label, required, error, hint, span, children }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:4,gridColumn:span?`span ${span}`:undefined }}>
      <label style={{ fontSize:"0.66rem",fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em" }}>
        {label}{required && <span style={{color:"#ef4444",marginLeft:3}}>*</span>}
        {hint && <span style={{color:"#94a3b8",fontWeight:400,textTransform:"none",letterSpacing:0,marginLeft:6,fontSize:"0.62rem"}}>{hint}</span>}
      </label>
      {children}
      {error && <span style={{ fontSize:"0.61rem",color:"#ef4444" }}>⚠ {error}</span>}
    </div>
  );
}

const inp = err => ({
  width:"100%",padding:"8px 11px",borderRadius:8,
  border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
  fontSize:"0.78rem",color:"#0f172a",fontFamily:"'Sora',sans-serif",
  background:"#fafafa",outline:"none",boxSizing:"border-box",
});

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE / EDIT RECORD MODAL
// ─────────────────────────────────────────────────────────────────────────────
function RecordModal({ mode, record, patients, doctors, onClose, onSave }) {
  const [form,   setForm]   = useState(() => {
    if (mode==="edit" && record) return {
      ...EMPTY_FORM, ...record,
      tags: Array.isArray(record.tags) ? record.tags.join(", ") : record.tags || "",
      attachments: Array.isArray(record.attachments) ? record.attachments.join(", ") : record.attachments || "",
    };
    return { ...EMPTY_FORM, date: new Date().toISOString().slice(0,10), time: new Date().toTimeString().slice(0,5) };
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [step,   setStep]   = useState(1);
  const [aiLoading, setAiLoading] = useState(false);
  const overlayRef = useRef(null);

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); };

  const onPatientChange = (id) => {
    const p = patients.find(x=>x.id===id);
    set("patientId", id);
    set("patientName", p?.name||"");
    set("patientDept", p?.department||"");
  };

  const onDoctorChange = (id) => {
    const d = doctors.find(x=>x.id===id);
    set("doctorId", id);
    set("doctorName", d?.name||"");
  };

  const validate = () => {
    const e = {};
    if (!form.patientId)       e.patientId   = "Select a patient";
    if (!form.doctorId)        e.doctorId    = "Assign a doctor";
    if (!form.type)            e.type        = "Select record type";
    if (!form.title.trim())    e.title       = "Title is required";
    if (!form.date)            e.date        = "Date is required";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const mockAISummary = async () => {
    setAiLoading(true);
    await new Promise(r=>setTimeout(r,1800));
    const summaries = {
      "Lab Report": `Auto-generated summary: Lab findings reviewed. ${form.findings?.split("\n")[0]||"Results noted"}. Clinical correlation advised.`,
      "Prescription": `Auto-generated summary: Medications prescribed for ${form.title}. Patient counselled on dosage and side effects. Follow-up scheduled.`,
      "Consultation Note": `Auto-generated summary: ${form.title} assessed. Clinical examination performed. Management plan initiated as documented.`,
      "Surgery Report": `Auto-generated summary: ${form.title} performed successfully. Post-operative care instructions given. Follow-up arranged.`,
      "Imaging": `Auto-generated summary: Imaging study reviewed by radiologist. Findings documented. Further clinical correlation recommended.`,
    };
    set("aiSummary", summaries[form.type] || `Auto-generated summary for ${form.title}. Clinical details documented. Follow-up as scheduled.`);
    setAiLoading(false);
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      const s1 = ["patientId","doctorId","type","title","date","severity"];
      setStep(Object.keys(e).some(k=>s1.includes(k)) ? 1 : 2);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [],
        attachments: form.attachments ? form.attachments.split(",").map(a=>a.trim()).filter(Boolean) : [],
        createdBy: "Admin",
        createdAt: record?.createdAt || new Date().toISOString(),
      };
      if (API.USE_REAL_API) {
        if (mode==="edit") await apiFetch("PUT", `/records/${record.id}`, payload);
        else               await apiFetch("POST", "/records", payload);
      }
      onSave({ ...payload, id: record?.id || `REC-${Date.now()}` });
    } finally { setSaving(false); }
  };

  const STEPS = ["Identity","Clinical","Review"];

  return (
    <div
      ref={overlayRef}
      onClick={e=>{ if(e.target===overlayRef.current) onClose(); }}
      style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.62)",backdropFilter:"blur(5px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .2s ease" }}
    >
      <div style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:720,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,.24)",animation:"slideUp .28s cubic-bezier(.22,1,.36,1)",display:"flex",flexDirection:"column" }}>

        {/* Header */}
        <div style={{ padding:"1.2rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:10,borderRadius:"20px 20px 0 0",gap:12 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem" }}>📁</div>
            <div>
              <div style={{ fontSize:"0.98rem",fontWeight:800,color:"#0f172a" }}>{mode==="edit"?"Edit Medical Record":"Add Medical Record"}</div>
              <div style={{ fontSize:"0.67rem",color:"#94a3b8",marginTop:1 }}>{mode==="edit"?`Editing: ${record.title}`:"Link a record to a patient's profile"}</div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {STEPS.map((label,i)=>{
              const s=i+1, done=step>s, active=step===s;
              return (
                <React.Fragment key={s}>
                  <div onClick={()=>setStep(s)} title={label} style={{ display:"flex",alignItems:"center",gap:5,cursor:"pointer" }}>
                    <div style={{ width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:800,background:done?"#0ea5e9":active?"#0f172a":"#f1f5f9",color:done||active?"#fff":"#94a3b8",transition:"all .2s",flexShrink:0 }}>{done?"✓":s}</div>
                    <span style={{ fontSize:"0.65rem",fontWeight:600,color:active?"#0f172a":"#94a3b8" }}>{label}</span>
                  </div>
                  {i<STEPS.length-1 && <div style={{ width:16,height:2,background:step>s?"#0ea5e9":"#f1f5f9",borderRadius:2 }}/>}
                </React.Fragment>
              );
            })}
            <div onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:"#f8fafc",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b",marginLeft:6,fontSize:"0.95rem" }}>✕</div>
          </div>
        </div>

        <div style={{ padding:"1.5rem",flex:1 }}>

          {/* ── STEP 1: Identity ── */}
          {step===1 && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,animation:"fadeUp .22s ease" }}>
              <div style={{ gridColumn:"span 2",fontSize:"0.68rem",fontWeight:800,color:"#0ea5e9",textTransform:"uppercase",letterSpacing:"0.09em",paddingBottom:4,borderBottom:"2px solid #e0f2fe" }}>
                Step 1 — Record Identity
              </div>

              <Field label="Patient" required error={errors.patientId}>
                <select style={inp(errors.patientId)} value={form.patientId} onChange={e=>onPatientChange(e.target.value)}>
                  <option value="">Select patient</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
              </Field>

              <Field label="Attending Doctor" required error={errors.doctorId}>
                <select style={inp(errors.doctorId)} value={form.doctorId} onChange={e=>onDoctorChange(e.target.value)}>
                  <option value="">Select doctor</option>
                  {doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                </select>
              </Field>

              {/* Record type grid */}
              <div style={{ gridColumn:"span 2" }}>
                <Field label="Record Type" required error={errors.type}>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:4 }}>
                    {RECORD_TYPES.map(rt=>(
                      <div
                        key={rt.value}
                        onClick={()=>set("type",rt.value)}
                        style={{ padding:"10px 8px",borderRadius:10,border:`2px solid ${form.type===rt.value?rt.color:"#e2e8f0"}`,background:form.type===rt.value?rt.color+"10":"#fafafa",cursor:"pointer",textAlign:"center",transition:"all .15s" }}
                      >
                        <div style={{ fontSize:"1.2rem",marginBottom:4 }}>{rt.icon}</div>
                        <div style={{ fontSize:"0.62rem",fontWeight:700,color:form.type===rt.value?rt.color:"#475569",lineHeight:1.3 }}>{rt.value}</div>
                      </div>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Record Title" required error={errors.title} span={2}>
                <input style={inp(errors.title)} placeholder="e.g. Complete Blood Count (CBC)" value={form.title} onChange={e=>set("title",e.target.value)}/>
              </Field>

              <Field label="Record Date" required error={errors.date}>
                <input style={inp(errors.date)} type="date" value={form.date} onChange={e=>set("date",e.target.value)}/>
              </Field>

              <Field label="Time">
                <input style={inp(false)} type="time" value={form.time} onChange={e=>set("time",e.target.value)}/>
              </Field>

              <Field label="Severity / Urgency" required>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {SEVERITY.map(s=>{
                    const st=SEV_STYLE[s]; const active=form.severity===s;
                    return (
                      <div
                        key={s} onClick={()=>set("severity",s)}
                        style={{ padding:"5px 14px",borderRadius:99,border:`1.5px solid ${active?st.color:st.border}`,background:active?st.bg:"#fafafa",color:active?st.color:"#64748b",fontSize:"0.7rem",fontWeight:700,cursor:"pointer",transition:"all .15s" }}
                      >{s}</div>
                    );
                  })}
                </div>
              </Field>

              <Field label="Confidential Record">
                <div
                  onClick={()=>set("isConfidential",!form.isConfidential)}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,border:`1.5px solid ${form.isConfidential?"#fca5a5":"#e2e8f0"}`,background:form.isConfidential?"#fff1f2":"#fafafa",cursor:"pointer",width:"fit-content",transition:"all .15s" }}
                >
                  <div style={{ width:18,height:18,borderRadius:5,border:`2px solid ${form.isConfidential?"#ef4444":"#cbd5e1"}`,background:form.isConfidential?"#ef4444":"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.7rem",transition:"all .15s" }}>
                    {form.isConfidential && "✓"}
                  </div>
                  <span style={{ fontSize:"0.75rem",fontWeight:600,color:form.isConfidential?"#be123c":"#64748b" }}>
                    🔒 Mark as Confidential
                  </span>
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 2: Clinical ── */}
          {step===2 && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,animation:"fadeUp .22s ease" }}>
              <div style={{ gridColumn:"span 2",fontSize:"0.68rem",fontWeight:800,color:"#14b8a6",textTransform:"uppercase",letterSpacing:"0.09em",paddingBottom:4,borderBottom:"2px solid #ccfbf1" }}>
                Step 2 — Clinical Details
              </div>

              <Field label="Clinical Description" required error={errors.description} span={2}>
                <textarea style={{ ...inp(errors.description),resize:"vertical",minHeight:80 }} placeholder="Detailed clinical description, patient complaints, observations…" value={form.description} onChange={e=>set("description",e.target.value)}/>
              </Field>

              <Field label="Clinical Findings / Results" hint="(one finding per line)" span={2}>
                <textarea style={{ ...inp(false),resize:"vertical",minHeight:80,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.74rem" }} placeholder={"e.g.\nHb: 10.2 g/dL (Low)\nWBC: 7,400/μL (Normal)"} value={form.findings} onChange={e=>set("findings",e.target.value)}/>
              </Field>

              <Field label="Medications / Treatment Prescribed" span={2}>
                <textarea style={{ ...inp(false),resize:"vertical",minHeight:70 }} placeholder="e.g. Amlodipine 5mg once daily, Metformin 1000mg BD…" value={form.medications} onChange={e=>set("medications",e.target.value)}/>
              </Field>

              <Field label="Follow-up Date">
                <input style={inp(false)} type="date" value={form.followUp} onChange={e=>set("followUp",e.target.value)}/>
              </Field>

              <Field label="Attachments" hint="(comma-separated filenames)">
                <input style={inp(false)} placeholder="e.g. CBC_Report.pdf, Xray.jpg" value={form.attachments} onChange={e=>set("attachments",e.target.value)}/>
              </Field>

              <Field label="Tags / Keywords" hint="(comma-separated)" span={2}>
                <input style={inp(false)} placeholder="e.g. Hypertension, Follow-up Required, Urgent" value={form.tags} onChange={e=>set("tags",e.target.value)}/>
              </Field>

              {/* AI Summary section */}
              <div style={{ gridColumn:"span 2",background:"linear-gradient(135deg,#f5f3ff,#eff6ff)",borderRadius:12,padding:"1rem",border:"1px solid #e0e7ff" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                  <div style={{ fontSize:"0.72rem",fontWeight:800,color:"#4f46e5",display:"flex",alignItems:"center",gap:7 }}>
                    🤖 AI Summary <span style={{ fontSize:"0.6rem",fontWeight:600,color:"#818cf8",background:"#eef2ff",padding:"2px 7px",borderRadius:99,border:"1px solid #c7d2fe" }}>Aroha AI</span>
                  </div>
                  <button
                    onClick={mockAISummary}
                    disabled={aiLoading || (!form.title && !form.description)}
                    style={{ padding:"5px 14px",borderRadius:99,border:"none",background:aiLoading?"#c7d2fe":"#6366f1",color:"#fff",fontSize:"0.68rem",fontWeight:700,cursor:aiLoading?"wait":"pointer",display:"flex",alignItems:"center",gap:6,transition:"all .15s" }}
                  >
                    {aiLoading ? <><span style={{ display:"inline-block",width:10,height:10,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/> Generating…</> : "✨ Generate Summary"}
                  </button>
                </div>
                <textarea
                  style={{ ...inp(false),background:"rgba(255,255,255,0.7)",minHeight:70,resize:"vertical",fontSize:"0.76rem",fontStyle:form.aiSummary?"normal":"italic" }}
                  placeholder="AI-generated summary will appear here, or type manually…"
                  value={form.aiSummary||""}
                  onChange={e=>set("aiSummary",e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step===3 && (
            <div style={{ animation:"fadeUp .22s ease" }}>
              <div style={{ fontSize:"0.68rem",fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.09em",paddingBottom:4,borderBottom:"2px solid #e0e7ff",marginBottom:16 }}>
                Step 3 — Review & Confirm
              </div>

              {/* Preview */}
              <div style={{ background:"linear-gradient(135deg,#f8fafc,#f0f9ff)",borderRadius:16,padding:"1.25rem",border:"1px solid #e2e8f0",marginBottom:14 }}>
                {/* Top row */}
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,gap:10,flexWrap:"wrap" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:typeInfo(form.type).color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",border:`1px solid ${typeInfo(form.type).color}22` }}>
                      {typeInfo(form.type).icon||"📄"}
                    </div>
                    <div>
                      <div style={{ fontSize:"0.95rem",fontWeight:800,color:"#0f172a" }}>{form.title||"—"}</div>
                      <div style={{ fontSize:"0.68rem",color:typeInfo(form.type).color,fontWeight:600,marginTop:2 }}>{form.type||"—"}</div>
                      <div style={{ fontSize:"0.62rem",color:"#94a3b8",marginTop:1 }}>{fmtDate(form.date)} {form.time && `· ${form.time}`}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                    <SevBadge s={form.severity}/>
                    {form.isConfidential && <span style={{ fontSize:"0.62rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:"#fff1f2",color:"#be123c",border:"1px solid #fecdd3" }}>🔒 Confidential</span>}
                  </div>
                </div>

                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
                  {[
                    ["👤 Patient",  form.patientName, form.patientId],
                    ["👨‍⚕️ Doctor",  form.doctorName,  ""],
                    ["🏥 Department",form.patientDept, ""],
                    ["📅 Follow-up", form.followUp ? fmtDate(form.followUp) : "Not scheduled",""],
                  ].map(([k,v,sub])=>(
                    <div key={k} style={{ background:"rgba(255,255,255,0.8)",borderRadius:8,padding:"8px 10px" }}>
                      <div style={{ fontSize:"0.59rem",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>{k}</div>
                      <div style={{ fontSize:"0.77rem",fontWeight:700,color:"#0f172a",marginTop:2 }}>{v||"—"}</div>
                      {sub && <div style={{ fontSize:"0.6rem",color:"#94a3b8" }}>{sub}</div>}
                    </div>
                  ))}
                </div>

                {form.description && (
                  <div style={{ background:"rgba(255,255,255,0.8)",borderRadius:8,padding:"10px 12px",marginBottom:8 }}>
                    <div style={{ fontSize:"0.59rem",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>Description</div>
                    <div style={{ fontSize:"0.74rem",color:"#0f172a",lineHeight:1.55 }}>{form.description}</div>
                  </div>
                )}

                {form.aiSummary && (
                  <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.06))",borderRadius:8,padding:"10px 12px",border:"1px solid #e0e7ff" }}>
                    <div style={{ fontSize:"0.59rem",color:"#6366f1",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>🤖 AI Summary</div>
                    <div style={{ fontSize:"0.73rem",color:"#1e1b4b",lineHeight:1.55 }}>{form.aiSummary}</div>
                  </div>
                )}

                {form.tags && (
                  <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:10 }}>
                    {form.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=><Tag key={t} label={t}/>)}
                  </div>
                )}
              </div>

              {Object.keys(errors).length>0 && (
                <div style={{ background:"#fff1f2",border:"1px solid #fecdd3",borderRadius:9,padding:"10px 14px",fontSize:"0.72rem",color:"#be123c" }}>
                  ⚠️ Required fields are missing. Review steps 1 & 2.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding:"1rem 1.5rem",borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,position:"sticky",bottom:0,background:"#fff",borderRadius:"0 0 20px 20px" }}>
          <button onClick={onClose} style={{ padding:"9px 20px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"0.8rem",fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <div style={{ display:"flex",gap:8 }}>
            {step>1 && <button onClick={()=>setStep(s=>s-1)} style={{ padding:"9px 20px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#0f172a",fontSize:"0.8rem",fontWeight:600,cursor:"pointer" }}>← Back</button>}
            {step<3
              ? <button onClick={()=>setStep(s=>s+1)} style={{ padding:"9px 28px",borderRadius:9,border:"none",background:"#0f172a",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:"pointer" }}>Next →</button>
              : <button onClick={handleSave} disabled={saving} style={{ padding:"9px 28px",borderRadius:9,border:"none",background:saving?"#94a3b8":"#0ea5e9",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8 }}>
                  {saving?"Saving…":mode==="edit"?"💾 Save Changes":"📁 Save Record"}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  RECORD DETAIL DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function RecordDrawer({ record, onClose, onEdit, onDelete }) {
  const ti = typeInfo(record.type);
  return (
    <div
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(3px)",zIndex:900,display:"flex",justifyContent:"flex-end",animation:"fadeIn .2s ease" }}
    >
      <div style={{ width:"100%",maxWidth:460,background:"#fff",height:"100%",overflowY:"auto",boxShadow:"-12px 0 40px rgba(0,0,0,.15)",animation:"slideLeft .25s cubic-bezier(.22,1,.36,1)" }}>

        {/* Sticky header */}
        <div style={{ padding:"1.4rem 1.4rem 1rem",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <SevBadge s={record.severity}/>
              {record.isConfidential && <span style={{ fontSize:"0.62rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:"#fff1f2",color:"#be123c",border:"1px solid #fecdd3" }}>🔒 Confidential</span>}
            </div>
            <div onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:"#f8fafc",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b" }}>✕</div>
          </div>

          <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:14 }}>
            <div style={{ width:48,height:48,borderRadius:13,background:ti.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",border:`1px solid ${ti.color}25`,flexShrink:0 }}>{ti.icon}</div>
            <div>
              <div style={{ fontSize:"0.97rem",fontWeight:800,color:"#0f172a",lineHeight:1.3 }}>{record.title}</div>
              <div style={{ fontSize:"0.7rem",color:ti.color,fontWeight:700,marginTop:3 }}>{record.type}</div>
              <div style={{ fontSize:"0.63rem",color:"#94a3b8",marginTop:2 }}>{record.id} · {fmtDate(record.date)} {record.time && `· ${record.time}`}</div>
            </div>
          </div>

          <div style={{ display:"flex",gap:8 }}>
            <button onClick={onEdit} style={{ flex:1,padding:"8px",borderRadius:9,border:"none",background:"#0f172a",color:"#fff",fontSize:"0.74rem",fontWeight:700,cursor:"pointer" }}>✏️ Edit</button>
            <button onClick={()=>onDelete(record)} style={{ padding:"8px 14px",borderRadius:9,border:"1.5px solid #fecdd3",background:"#fff1f2",color:"#be123c",fontSize:"0.74rem",fontWeight:700,cursor:"pointer" }}>🗑 Delete</button>
          </div>
        </div>

        <div style={{ padding:"1.2rem" }}>

          {/* Patient & Doctor */}
          <DSection title="Linked To">
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
              <div style={{ width:36,height:36,borderRadius:9,background:avatarColor(initials(record.patientName)),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.7rem",fontWeight:800,flexShrink:0 }}>{initials(record.patientName)}</div>
              <div>
                <div style={{ fontSize:"0.78rem",fontWeight:700,color:"#0f172a" }}>{record.patientName}</div>
                <div style={{ fontSize:"0.62rem",color:"#94a3b8" }}>{record.patientId} · {record.patientDept}</div>
              </div>
            </div>
            <DRow icon="👨‍⚕️" label="Doctor"    val={record.doctorName}/>
            {record.followUp && <DRow icon="📅" label="Follow-up" val={fmtDate(record.followUp)}/>}
          </DSection>

          {/* Description */}
          {record.description && (
            <DSection title="Description">
              <p style={{ fontSize:"0.75rem",color:"#334155",lineHeight:1.65,margin:0 }}>{record.description}</p>
            </DSection>
          )}

          {/* Findings */}
          {record.findings && (
            <DSection title="Clinical Findings">
              <pre style={{ fontSize:"0.73rem",color:"#0f172a",fontFamily:"'JetBrains Mono',monospace",whiteSpace:"pre-wrap",margin:0,lineHeight:1.7 }}>{record.findings}</pre>
            </DSection>
          )}

          {/* Medications */}
          {record.medications && (
            <DSection title="Medications & Treatment">
              <div style={{ fontSize:"0.75rem",color:"#334155",lineHeight:1.65,whiteSpace:"pre-line" }}>{record.medications}</div>
            </DSection>
          )}

          {/* AI Summary */}
          {record.aiSummary && (
            <DSection title="🤖 AI Summary" titleColor="#6366f1" bg="linear-gradient(135deg,#f5f3ff,#eff6ff)" border="#e0e7ff">
              <p style={{ fontSize:"0.75rem",color:"#1e1b4b",lineHeight:1.65,margin:0 }}>{record.aiSummary}</p>
            </DSection>
          )}

          {/* Attachments */}
          {record.attachments?.length>0 && (
            <DSection title="Attachments">
              {record.attachments.map((f,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:8,background:"#f8fafc",border:"1px solid #e2e8f0",marginBottom:i<record.attachments.length-1?6:0,cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}
                >
                  <span style={{ fontSize:"1rem" }}>{f.endsWith(".pdf")?"📄":f.match(/\.(jpg|jpeg|png)$/i)?"🖼":"📎"}</span>
                  <span style={{ fontSize:"0.73rem",fontWeight:600,color:"#0f172a",flex:1 }}>{f}</span>
                  <span style={{ fontSize:"0.65rem",color:"#0ea5e9",fontWeight:600 }}>↓ Download</span>
                </div>
              ))}
            </DSection>
          )}

          {/* Tags */}
          {record.tags?.length>0 && (
            <DSection title="Tags">
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {record.tags.map(t=><Tag key={t} label={t}/>)}
              </div>
            </DSection>
          )}

          {/* Meta */}
          <DSection title="Record Metadata">
            <DRow icon="👤" label="Created by" val={record.createdBy||"Admin"}/>
            <DRow icon="🕐" label="Created at" val={record.createdAt ? new Date(record.createdAt).toLocaleString("en-IN") : "—"}/>
          </DSection>

        </div>
      </div>
    </div>
  );
}

function DSection({ title, titleColor="#64748b", bg="#f8fafc", border="#f1f5f9", children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:"0.6rem",fontWeight:800,color:titleColor,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:7 }}>{title}</div>
      <div style={{ background:bg,borderRadius:10,padding:"10px 12px",border:`1px solid ${border}`,display:"flex",flexDirection:"column",gap:7 }}>{children}</div>
    </div>
  );
}
function DRow({ icon, label, val }) {
  return (
    <div style={{ display:"flex",alignItems:"flex-start",gap:8 }}>
      <span style={{ fontSize:"0.8rem",width:18,flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:"0.62rem",color:"#94a3b8",fontWeight:600,width:76,flexShrink:0,paddingTop:1 }}>{label}</span>
      <span style={{ fontSize:"0.74rem",color:"#0f172a",fontWeight:600,flex:1,lineHeight:1.4 }}>{val||"—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE CONFIRM
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirm({ record, onCancel, onConfirm }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",backdropFilter:"blur(5px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }}>
      <div style={{ background:"#fff",borderRadius:18,padding:"2rem",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 28px 70px rgba(0,0,0,.22)",animation:"slideUp .2s ease" }}>
        <div style={{ width:54,height:54,borderRadius:"50%",background:"#fff1f2",border:"2px solid #fecdd3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",margin:"0 auto 14px" }}>🗑️</div>
        <div style={{ fontSize:"1rem",fontWeight:800,color:"#0f172a",marginBottom:6 }}>Delete Record?</div>
        <div style={{ fontSize:"0.75rem",color:"#64748b",marginBottom:22,lineHeight:1.65 }}>
          Permanently delete <strong>"{record.title}"</strong> for <strong>{record.patientName}</strong>? This cannot be undone.
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,padding:"10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"0.8rem",fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1,padding:"10px",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:"pointer" }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TIMELINE VIEW
// ─────────────────────────────────────────────────────────────────────────────
function TimelineView({ records, onSelect }) {
  const sorted = [...records].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const grouped = sorted.reduce((acc,r)=>{
    const d = fmtDate(r.date);
    if (!acc[d]) acc[d]=[];
    acc[d].push(r);
    return acc;
  },{});

  return (
    <div style={{ position:"relative",paddingLeft:28 }}>
      <div style={{ position:"absolute",left:8,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,#e2e8f0,#f1f5f9)",borderRadius:2 }}/>
      {Object.entries(grouped).map(([date,recs])=>(
        <div key={date} style={{ marginBottom:24 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
            <div style={{ position:"absolute",left:0,width:18,height:18,borderRadius:"50%",background:"#0f172a",border:"3px solid #fff",boxShadow:"0 0 0 2px #e2e8f0",zIndex:1 }}/>
            <div style={{ fontSize:"0.72rem",fontWeight:800,color:"#0f172a",background:"#f1f5f9",padding:"3px 10px",borderRadius:99,border:"1px solid #e2e8f0" }}>{date}</div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {recs.map(r=>{
              const ti = typeInfo(r.type);
              return (
                <div
                  key={r.id}
                  onClick={()=>onSelect(r)}
                  style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all .15s",borderLeft:`3px solid ${ti.color}` }}
                  onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"; e.currentTarget.style.transform="translateX(3px)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateX(0)"; }}
                >
                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <span style={{ fontSize:"1.1rem" }}>{ti.icon}</span>
                      <div>
                        <div style={{ fontSize:"0.78rem",fontWeight:700,color:"#0f172a" }}>{r.title}</div>
                        <div style={{ fontSize:"0.63rem",color:"#94a3b8",marginTop:1 }}>{r.patientName} · {r.doctorName}{r.time && ` · ${r.time}`}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                      <SevBadge s={r.severity}/>
                      {r.isConfidential && <span style={{ fontSize:"0.6rem" }}>🔒</span>}
                    </div>
                  </div>
                  {r.aiSummary && (
                    <div style={{ marginTop:8,fontSize:"0.7rem",color:"#6366f1",background:"#f5f3ff",padding:"6px 10px",borderRadius:7,lineHeight:1.5,border:"1px solid #e0e7ff" }}>
                      🤖 {r.aiSummary.length>100?r.aiSummary.slice(0,100)+"…":r.aiSummary}
                    </div>
                  )}
                  {r.tags?.length>0 && (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:8 }}>
                      {r.tags.slice(0,3).map(t=><Tag key={t} label={t}/>)}
                      {r.tags.length>3 && <span style={{ fontSize:"0.6rem",color:"#94a3b8",padding:"2px 6px" }}>+{r.tags.length-3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminMedicalRecords() {
  const [records,    setRecords]    = useState([]);
  const [patients,   setPatients]   = useState([]);
  const [doctors,    setDoctors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSev,  setFilterSev]  = useState("All");
  const [filterPat,  setFilterPat]  = useState("All");
  const [sortBy,     setSortBy]     = useState("date");
  const [viewMode,   setViewMode]   = useState("table");
  const [modal,      setModal]      = useState(null);
  const [drawer,     setDrawer]     = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3200);
  };

  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (!API.USE_REAL_API) {
      setTimeout(()=>{ setRecords(DUMMY_RECORDS); setPatients(DUMMY_PATIENTS); setDoctors(DUMMY_DOCTORS); setLoading(false); }, 500);
      return;
    }
    Promise.all([
      apiFetch("GET", API.EP.list),
      apiFetch("GET", API.EP.patients),
      apiFetch("GET", API.EP.doctors),
    ]).then(([r,p,d])=>{ setRecords(r); setPatients(p); setDoctors(d); setLoading(false); })
      .catch(()=>{ setRecords(DUMMY_RECORDS); setPatients(DUMMY_PATIENTS); setDoctors(DUMMY_DOCTORS); setLoading(false); });
  },[]);

  // Stats
  const total     = records.length;
  const byType    = RECORD_TYPES.reduce((a,t)=>{ a[t.value]=records.filter(r=>r.type===t.value).length; return a; },{});
  const critical  = records.filter(r=>r.severity==="Critical"||r.severity==="Severe").length;
  const withAI    = records.filter(r=>r.aiSummary).length;
  const confidential = records.filter(r=>r.isConfidential).length;

  // Filters
  const patNames = ["All",...Array.from(new Set(records.map(r=>r.patientName)))];
  const filtered = records
    .filter(r => filterType==="All" || r.type===filterType)
    .filter(r => filterSev==="All"  || r.severity===filterSev)
    .filter(r => filterPat==="All"  || r.patientName===filterPat)
    .filter(r => {
      const q = search.toLowerCase();
      return !q || r.title.toLowerCase().includes(q) || r.patientName.toLowerCase().includes(q)
        || r.doctorName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
        || r.diagnosis?.toLowerCase().includes(q) || r.tags?.some(t=>t.toLowerCase().includes(q));
    })
    .sort((a,b)=>{
      if (sortBy==="date")    return new Date(b.date)-new Date(a.date);
      if (sortBy==="title")   return a.title.localeCompare(b.title);
      if (sortBy==="patient") return a.patientName.localeCompare(b.patientName);
      if (sortBy==="severity"){
        const order = ["Critical","Severe","Moderate","Mild","Normal"];
        return order.indexOf(a.severity)-order.indexOf(b.severity);
      }
      return 0;
    });

  // CRUD
  const handleSave = (rec) => {
    setRecords(prev=>{
      const idx=prev.findIndex(r=>r.id===rec.id);
      if(idx>=0){const n=[...prev];n[idx]=rec;return n;}
      return [...prev,rec];
    });
    setModal(null);
    showToast(modal.mode==="edit"?`Record "${rec.title}" updated`:`Record "${rec.title}" added`);
  };

  const handleDelete = async () => {
    if(API.USE_REAL_API) await apiFetch("DELETE",`/records/${delTarget.id}`).catch(()=>{});
    setRecords(prev=>prev.filter(r=>r.id!==delTarget.id));
    if(drawer?.id===delTarget.id) setDrawer(null);
    showToast(`"${delTarget.title}" deleted`,"error");
    setDelTarget(null);
  };

  return (
    <>
      <style>{`
        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes toastIn   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }

        .mr-root { animation: fadeUp .35s ease; font-family:'Sora',sans-serif; }
        .mr-stat { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:.95rem 1.1rem; display:flex; align-items:flex-start; gap:11px; position:relative; overflow:hidden; transition:box-shadow .2s,transform .2s; cursor:default; }
        .mr-stat:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }
        .mr-row { transition:background .12s; cursor:pointer; }
        .mr-row:hover td { background:#f8fafc; }
        .mr-act { width:29px; height:29px; border-radius:8px; border:1.5px solid #e2e8f0; background:#f8fafc; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.78rem; transition:background .15s; }
        .mr-act:hover { background:#f1f5f9; }
      `}</style>

      <div className="mr-root">

        {/* ── Header ── */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.5rem",gap:12,flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:"1.3rem",fontWeight:800,color:"#0f172a" }}>Medical Records</div>
            <div style={{ fontSize:"0.72rem",color:"#94a3b8",marginTop:3 }}>All patient records · {total} total</div>
          </div>
          <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
            <div style={{ display:"flex",background:"#f1f5f9",borderRadius:9,padding:3,gap:2 }}>
              {[["table","☰ Table"],["timeline","⏱ Timeline"],["grid","⊞ Grid"]].map(([m,label])=>(
                <button key={m} onClick={()=>setViewMode(m)} style={{ padding:"5px 12px",borderRadius:7,border:"none",background:viewMode===m?"#fff":"transparent",color:viewMode===m?"#0f172a":"#94a3b8",cursor:"pointer",fontSize:"0.72rem",fontWeight:600,boxShadow:viewMode===m?"0 1px 3px rgba(0,0,0,.08)":"none",transition:"all .15s",whiteSpace:"nowrap" }}>{label}</button>
              ))}
            </div>
            <button
              onClick={()=>setModal({mode:"create",record:null})}
              style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#0f172a,#0369a1)",color:"#fff",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(3,105,161,.3)",transition:"transform .15s,box-shadow .15s",whiteSpace:"nowrap" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(3,105,161,.4)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 14px rgba(3,105,161,.3)"}}
            >
              <span style={{ fontSize:"1rem" }}>+</span> Add Record
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,marginBottom:"1.5rem" }}>
          {[
            { label:"Total Records", val:total,       icon:"🗂️", color:"#0ea5e9" },
            { label:"High Severity", val:critical,    icon:"🚨",  color:"#ef4444" },
            { label:"AI Summarised", val:withAI,      icon:"🤖",  color:"#6366f1" },
            { label:"Confidential",  val:confidential,icon:"🔒",  color:"#f59e0b" },
            { label:"Lab Reports",   val:byType["Lab Report"]||0,      icon:"🧪",  color:"#0ea5e9" },
            { label:"Prescriptions", val:byType["Prescription"]||0,    icon:"💊",  color:"#8b5cf6" },
          ].map(s=>(
            <div key={s.label} className="mr-stat">
              <div style={{ width:38,height:38,borderRadius:10,background:s.color+"18",color:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:"0.58rem",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2 }}>{s.label}</div>
                {loading?<Skel h={22} w={44} r={5}/>:<div style={{ fontSize:"1.3rem",fontWeight:800,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace",lineHeight:1 }}>{s.val}</div>}
              </div>
              <div style={{ position:"absolute",top:0,right:0,width:55,height:55,borderRadius:"50%",background:s.color+"08",transform:"translate(30%,-30%)",pointerEvents:"none" }}/>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:".9rem 1.25rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"6px 12px",flex:1,minWidth:200 }}>
            <span style={{ color:"#94a3b8" }}>🔍</span>
            <input placeholder="Search records, patients, doctors, tags…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ border:"none",background:"transparent",fontSize:"0.78rem",color:"#0f172a",fontFamily:"'Sora',sans-serif",outline:"none",width:"100%" }}/>
            {search && <span onClick={()=>setSearch("")} style={{ color:"#94a3b8",cursor:"pointer" }}>✕</span>}
          </div>

          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ padding:"6px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontSize:"0.75rem",color:"#475569",fontFamily:"'Sora',sans-serif",cursor:"pointer",outline:"none" }}>
            <option value="All">All Types</option>
            {RECORD_TYPES.map(t=><option key={t.value}>{t.value}</option>)}
          </select>

          <select value={filterSev} onChange={e=>setFilterSev(e.target.value)} style={{ padding:"6px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontSize:"0.75rem",color:"#475569",fontFamily:"'Sora',sans-serif",cursor:"pointer",outline:"none" }}>
            <option value="All">All Severity</option>
            {SEVERITY.map(s=><option key={s}>{s}</option>)}
          </select>

          <select value={filterPat} onChange={e=>setFilterPat(e.target.value)} style={{ padding:"6px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontSize:"0.75rem",color:"#475569",fontFamily:"'Sora',sans-serif",cursor:"pointer",outline:"none" }}>
            {patNames.map(p=><option key={p}>{p}</option>)}
          </select>

          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"6px 10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",fontSize:"0.75rem",color:"#475569",fontFamily:"'Sora',sans-serif",cursor:"pointer",outline:"none" }}>
            <option value="date">Sort: Date (Newest)</option>
            <option value="severity">Sort: Severity</option>
            <option value="patient">Sort: Patient</option>
            <option value="title">Sort: Title</option>
          </select>

          <div style={{ fontSize:"0.7rem",color:"#94a3b8",flexShrink:0 }}>{filtered.length} result{filtered.length!==1?"s":""}</div>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode==="table" && (
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                    {["Record","Patient","Doctor","Date","Severity","AI","Actions"].map(h=>(
                      <th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:"0.6rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"#94a3b8",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_,i)=><tr key={i}><td colSpan={7} style={{ padding:"14px" }}><Skel h={34} r={6}/></td></tr>)
                    : filtered.length===0
                      ? <tr><td colSpan={7} style={{ padding:"3rem",textAlign:"center",color:"#94a3b8",fontSize:"0.8rem" }}>No records match your filters</td></tr>
                      : filtered.map(r=>{
                        const ti=typeInfo(r.type);
                        return (
                          <tr key={r.id} className="mr-row" onClick={()=>setDrawer(r)}>
                            <td style={{ padding:"11px 14px" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                                <div style={{ width:34,height:34,borderRadius:9,background:ti.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0 }}>{ti.icon}</div>
                                <div>
                                  <div style={{ fontSize:"0.77rem",fontWeight:700,color:"#0f172a",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.title}</div>
                                  <div style={{ fontSize:"0.61rem",color:ti.color,fontWeight:600 }}>{r.type} {r.isConfidential&&"· 🔒"}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"11px 14px" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                                <div style={{ width:26,height:26,borderRadius:7,background:avatarColor(initials(r.patientName)),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.58rem",fontWeight:800,flexShrink:0 }}>{initials(r.patientName)}</div>
                                <div>
                                  <div style={{ fontSize:"0.74rem",fontWeight:600,color:"#0f172a" }}>{r.patientName}</div>
                                  <div style={{ fontSize:"0.6rem",color:"#94a3b8" }}>{r.patientId}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"11px 14px",fontSize:"0.73rem",color:"#475569" }}>{r.doctorName}</td>
                            <td style={{ padding:"11px 14px",fontSize:"0.73rem",color:"#475569",whiteSpace:"nowrap" }}>
                              {fmtDate(r.date)}{r.time&&<div style={{ fontSize:"0.6rem",color:"#94a3b8" }}>{r.time}</div>}
                            </td>
                            <td style={{ padding:"11px 14px" }}><SevBadge s={r.severity}/></td>
                            <td style={{ padding:"11px 14px" }}>
                              {r.aiSummary
                                ? <span style={{ fontSize:"0.65rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:"#f5f3ff",color:"#6366f1",border:"1px solid #e0e7ff" }}>🤖 Yes</span>
                                : <span style={{ fontSize:"0.65rem",color:"#cbd5e1" }}>—</span>
                              }
                            </td>
                            <td style={{ padding:"11px 14px" }} onClick={e=>e.stopPropagation()}>
                              <div style={{ display:"flex",gap:5 }}>
                                <div title="Edit" className="mr-act" onClick={()=>setModal({mode:"edit",record:r})}>✏️</div>
                                <div title="Delete" className="mr-act" style={{ borderColor:"#fecdd3",background:"#fff1f2" }} onClick={()=>setDelTarget(r)}>🗑</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TIMELINE VIEW ── */}
        {viewMode==="timeline" && (
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"1.5rem 1.75rem" }}>
            {loading ? <Skel h={300}/>
              : filtered.length===0
                ? <div style={{ textAlign:"center",padding:"3rem",color:"#94a3b8",fontSize:"0.8rem" }}>No records to show on timeline</div>
                : <TimelineView records={filtered} onSelect={r=>setDrawer(r)}/>
            }
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode==="grid" && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:14 }}>
            {loading
              ? Array(6).fill(0).map((_,i)=><div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"1.2rem" }}><Skel h={120}/></div>)
              : filtered.length===0
                ? <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"3rem",color:"#94a3b8",fontSize:"0.8rem" }}>No records match your filters</div>
                : filtered.map(r=>{
                  const ti=typeInfo(r.type);
                  return (
                    <div
                      key={r.id}
                      onClick={()=>setDrawer(r)}
                      style={{ background:"#fff",border:`1px solid #e2e8f0`,borderRadius:14,padding:"1.2rem",cursor:"pointer",transition:"all .18s",borderTop:`3px solid ${ti.color}` }}
                      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,.09)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateY(0)"; }}
                    >
                      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                          <div style={{ width:38,height:38,borderRadius:10,background:ti.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",border:`1px solid ${ti.color}20` }}>{ti.icon}</div>
                          <div>
                            <div style={{ fontSize:"0.78rem",fontWeight:700,color:"#0f172a",lineHeight:1.3 }}>{r.title}</div>
                            <div style={{ fontSize:"0.62rem",color:ti.color,fontWeight:600 }}>{r.type}</div>
                          </div>
                        </div>
                        <SevBadge s={r.severity}/>
                      </div>

                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                        <div style={{ width:24,height:24,borderRadius:6,background:avatarColor(initials(r.patientName)),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.55rem",fontWeight:800 }}>{initials(r.patientName)}</div>
                        <span style={{ fontSize:"0.7rem",fontWeight:600,color:"#0f172a" }}>{r.patientName}</span>
                        <span style={{ fontSize:"0.62rem",color:"#94a3b8",marginLeft:"auto" }}>{fmtDate(r.date)}</span>
                      </div>

                      {r.description && (
                        <div style={{ fontSize:"0.7rem",color:"#64748b",lineHeight:1.5,marginBottom:10,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
                          {r.description}
                        </div>
                      )}

                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                        <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                          {r.tags?.slice(0,2).map(t=><Tag key={t} label={t}/>)}
                        </div>
                        <div style={{ display:"flex",gap:5 }} onClick={e=>e.stopPropagation()}>
                          {r.aiSummary && <span style={{ fontSize:"0.62rem",padding:"2px 7px",borderRadius:99,background:"#f5f3ff",color:"#6366f1",border:"1px solid #e0e7ff",fontWeight:700 }}>🤖</span>}
                          {r.isConfidential && <span style={{ fontSize:"0.7rem" }}>🔒</span>}
                          <div className="mr-act" onClick={()=>setModal({mode:"edit",record:r})}>✏️</div>
                          <div className="mr-act" style={{ borderColor:"#fecdd3",background:"#fff1f2" }} onClick={()=>setDelTarget(r)}>🗑</div>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}
      </div>

      {/* ── Overlays ── */}
      {modal && (
        <RecordModal
          mode={modal.mode}
          record={modal.record}
          patients={patients}
          doctors={doctors}
          onClose={()=>setModal(null)}
          onSave={handleSave}
        />
      )}
      {drawer && (
        <RecordDrawer
          record={drawer}
          onClose={()=>setDrawer(null)}
          onEdit={()=>{ setModal({mode:"edit",record:drawer}); setDrawer(null); }}
          onDelete={r=>{ setDelTarget(r); setDrawer(null); }}
        />
      )}
      {delTarget && (
        <DeleteConfirm
          record={delTarget}
          onCancel={()=>setDelTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {toast && (
        <div style={{ position:"fixed",bottom:24,right:24,zIndex:2000,display:"flex",alignItems:"center",gap:10,padding:"12px 18px",borderRadius:12,background:toast.type==="error"?"#fff1f2":"#f0fdf4",border:`1px solid ${toast.type==="error"?"#fecdd3":"#bbf7d0"}`,color:toast.type==="error"?"#be123c":"#15803d",fontSize:"0.78rem",fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.12)",animation:"toastIn .3s ease",fontFamily:"'Sora',sans-serif" }}>
          <span>{toast.type==="error"?"❌":"✅"}</span> {toast.msg}
        </div>
      )}
    </>
  );
}