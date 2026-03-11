import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  API CONFIG — flip USE_REAL_API = true and set BASE_URL when backend ready
// ─────────────────────────────────────────────────────────────────────────────
const API = {
  BASE_URL: "http://localhost:5000/api",
  USE_REAL_API: false,
  EP: {
    list:   "/doctors",
    create: "/doctors", 
    update: "/doctors/:id",
    delete: "/doctors/:id",
    toggle: "/doctors/:id/status",
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
//  DUMMY DATA
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_DOCTORS = [
  { id:"D-001", name:"Dr. Arjun Pillai",    email:"arjun.pillai@arohaai.com",   phone:"+91 98400 11111", specialty:"Cardiology",    department:"Cardiac Sciences",   qualification:"MD, DM Cardiology",       experience:14, patients:231, status:"Active",   gender:"Male",   joined:"2021-03-15", schedule:"Mon–Fri", consultFee:800,  rating:4.8, avatar:"AP", licenseNo:"MCI-2010-AP" },
  { id:"D-002", name:"Dr. Kavya Menon",     email:"kavya.menon@arohaai.com",    phone:"+91 98400 22222", specialty:"Dermatology",   department:"Skin & Aesthetics",  qualification:"MD Dermatology",          experience:9,  patients:184, status:"Active",   gender:"Female", joined:"2022-06-01", schedule:"Mon–Sat", consultFee:600,  rating:4.9, avatar:"KM", licenseNo:"MCI-2015-KM" },
  { id:"D-003", name:"Dr. Lena Mathew",     email:"lena.mathew@arohaai.com",    phone:"+91 98400 33333", specialty:"Neurology",     department:"Neuro Sciences",     qualification:"MD, DM Neurology",        experience:11, patients:196, status:"On Leave", gender:"Female", joined:"2020-11-20", schedule:"Tue–Sat", consultFee:900,  rating:4.7, avatar:"LM", licenseNo:"MCI-2013-LM" },
  { id:"D-004", name:"Dr. Ravi Shankar",    email:"ravi.shankar@arohaai.com",   phone:"+91 98400 44444", specialty:"Orthopedics",   department:"Bone & Joint",       qualification:"MS Orthopedics",          experience:16, patients:278, status:"Active",   gender:"Male",   joined:"2019-08-10", schedule:"Mon–Fri", consultFee:750,  rating:4.6, avatar:"RS", licenseNo:"MCI-2008-RS" },
  { id:"D-005", name:"Dr. Priya Nambiar",   email:"priya.nambiar@arohaai.com",  phone:"+91 98400 55555", specialty:"Pediatrics",    department:"Child Health",       qualification:"MD Pediatrics, DNB",      experience:8,  patients:312, status:"Active",   gender:"Female", joined:"2022-01-10", schedule:"Mon–Sat", consultFee:500,  rating:4.9, avatar:"PN", licenseNo:"MCI-2016-PN" },
  { id:"D-006", name:"Dr. Suresh Kumar",    email:"suresh.kumar@arohaai.com",   phone:"+91 98400 66666", specialty:"General Medicine",department:"General OPD",      qualification:"MBBS, MD General",        experience:20, patients:405, status:"Active",   gender:"Male",   joined:"2018-04-05", schedule:"Mon–Fri", consultFee:400,  rating:4.5, avatar:"SK", licenseNo:"MCI-2004-SK" },
  { id:"D-007", name:"Dr. Anjali Varghese", email:"anjali.v@arohaai.com",       phone:"+91 98400 77777", specialty:"Gynecology",    department:"Women's Health",     qualification:"MS Obstetrics & Gynae",   experience:12, patients:267, status:"Inactive", gender:"Female", joined:"2021-07-22", schedule:"Tue–Sat", consultFee:700,  rating:4.7, avatar:"AV", licenseNo:"MCI-2012-AV" },
  { id:"D-008", name:"Dr. Nikhil Thomas",   email:"nikhil.thomas@arohaai.com",  phone:"+91 98400 88888", specialty:"Radiology",     department:"Imaging & Diagnostics",qualification:"MD Radiology, FRCR",   experience:7,  patients:89,  status:"Active",   gender:"Male",   joined:"2023-02-14", schedule:"Mon–Fri", consultFee:650,  rating:4.4, avatar:"NT", licenseNo:"MCI-2017-NT" },
];

const SPECIALTIES   = ["Cardiology","Dermatology","Neurology","Orthopedics","Pediatrics","General Medicine","Gynecology","Radiology","Psychiatry","Oncology","ENT","Ophthalmology","Urology","Nephrology","Endocrinology"];
const DEPARTMENTS   = ["Cardiac Sciences","Skin & Aesthetics","Neuro Sciences","Bone & Joint","Child Health","General OPD","Women's Health","Imaging & Diagnostics","Mental Health","Cancer Centre","ENT Care","Eye Care","Urology","Nephrology","Endocrinology"];
const QUALIFICATIONS= ["MBBS","MD","MS","DM","DNB","MBBS, MD","MD, DM","MS Orthopedics","MD Pediatrics, DNB","MD Dermatology","MD, DM Cardiology","MD, DM Neurology","MS Obstetrics & Gynae","MD Radiology, FRCR","MBBS, MD General"];

const EMPTY_FORM = {
  name:"", email:"", phone:"", specialty:"", department:"", qualification:"",
  experience:"", consultFee:"", gender:"", schedule:"", licenseNo:"", bio:"",
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#0ea5e9","#6366f1","#14b8a6","#f59e0b","#8b5cf6","#ef4444","#10b981","#ec4899"];
const avatarColor = s => AVATAR_COLORS[(s?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const initials = name => name.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();

const STATUS_S = {
  Active:     { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", border:"#bbf7d0" },
  Inactive:   { bg:"#f8fafc", color:"#475569", dot:"#94a3b8", border:"#e2e8f0" },
  "On Leave": { bg:"#fff7ed", color:"#c2410c", dot:"#f97316", border:"#fed7aa" },
};

function StatusPill({ status }) {
  const s = STATUS_S[status] || STATUS_S.Inactive;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,background:s.bg,color:s.color,border:`1px solid ${s.border}`,fontSize:"0.63rem",fontWeight:700,whiteSpace:"nowrap" }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:s.dot }}/>
      {status}
    </span>
  );
}

function StarRating({ v }) {
  return (
    <span style={{ fontSize:"0.7rem",color:"#f59e0b",fontWeight:700 }}>
      {"★".repeat(Math.round(v))}{"☆".repeat(5-Math.round(v))} <span style={{color:"#64748b"}}>{v}</span>
    </span>
  );
}

function Skel({ h=18,w="100%",r=6 }) {
  return <div style={{ width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite" }}/>;
}

function Field({ label, required, error, children }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
      <label style={{ fontSize:"0.68rem",fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em" }}>
        {label}{required && <span style={{color:"#ef4444",marginLeft:3}}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize:"0.63rem",color:"#ef4444" }}>{error}</span>}
    </div>
  );
}

const inputStyle = (err) => ({
  width:"100%", padding:"9px 12px", borderRadius:9,
  border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
  fontSize:"0.8rem", color:"#0f172a", fontFamily:"'Sora',sans-serif",
  background:"#fafafa", outline:"none", transition:"border-color .15s,box-shadow .15s",
});

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE / EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DoctorModal({ mode, doctor, onClose, onSave }) {
  const [form, setForm]     = useState(mode==="edit" && doctor ? { ...doctor } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [step, setStep]     = useState(1);
  const overlayRef = useRef(null);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name         = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.phone.trim())         e.phone        = "Phone number is required";
    if (!form.specialty)            e.specialty    = "Specialty is required";
    if (!form.department)           e.department   = "Department is required";
    if (!form.qualification.trim()) e.qualification= "Qualification is required";
    if (!form.experience || isNaN(form.experience)) e.experience = "Valid years required";
    if (!form.gender)               e.gender       = "Gender is required";
    if (!form.licenseNo.trim())     e.licenseNo    = "License number is required";
    if (!form.consultFee || isNaN(form.consultFee)) e.consultFee = "Valid fee required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); setStep(Object.keys(e).some(k=>["name","email","phone","gender"].includes(k)) ? 1 : 2); return; }
    setSaving(true);
    try {
      if (API.USE_REAL_API) {
        if (mode==="edit") await apiFetch("PUT", `/doctors/${doctor.id}`, form);
        else               await apiFetch("POST", "/doctors", form);
      }
      onSave({ ...form, id: doctor?.id || `D-${Date.now()}`, patients: doctor?.patients || 0, rating: doctor?.rating || 4.5, avatar: initials(form.name), joined: doctor?.joined || new Date().toISOString().slice(0,10), status: doctor?.status || "Active" });
    } finally { setSaving(false); }
  };

  return (
    <div ref={overlayRef} onClick={e=>{ if(e.target===overlayRef.current) onClose(); }} style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .2s ease" }}>
      <div style={{ background:"#fff",borderRadius:18,width:"100%",maxWidth:640,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.2)",animation:"slideUp .25s cubic-bezier(.22,1,.36,1)" }}>

        {/* Modal Header */}
        <div style={{ padding:"1.25rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:10,borderRadius:"18px 18px 0 0" }}>
          <div>
            <div style={{ fontSize:"1rem",fontWeight:800,color:"#0f172a" }}>{mode==="edit"?"Edit Doctor":"Add New Doctor"}</div>
            <div style={{ fontSize:"0.68rem",color:"#94a3b8",marginTop:2 }}>{mode==="edit"?`Editing ${doctor.name}`:"Fill in the doctor's credentials and details"}</div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {/* Step indicators */}
            {[1,2,3].map(s=>(
              <div key={s} onClick={()=>setStep(s)} style={{ width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"0.7rem",fontWeight:700,background:step===s?"#0f172a":step>s?"#0ea5e9":"#f1f5f9",color:step===s?"#fff":step>s?"#fff":"#94a3b8",transition:"all .2s" }}>
                {step>s ? "✓" : s}
              </div>
            ))}
            <div onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:"#f8fafc",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"1rem",color:"#64748b",marginLeft:4 }}>✕</div>
          </div>
        </div>

        <div style={{ padding:"1.5rem" }}>

          {/* ── STEP 1: Personal Info ── */}
          {step===1 && (
            <div style={{ display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .2s ease" }}>
              <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#0ea5e9",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:-4 }}>Step 1 — Personal Information</div>

              <Field label="Full Name" required error={errors.name}>
                <input style={inputStyle(errors.name)} placeholder="Dr. First Last" value={form.name} onChange={e=>set("name",e.target.value)}/>
              </Field>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Field label="Email" required error={errors.email}>
                  <input style={inputStyle(errors.email)} type="email" placeholder="doctor@arohaai.com" value={form.email} onChange={e=>set("email",e.target.value)}/>
                </Field>
                <Field label="Phone" required error={errors.phone}>
                  <input style={inputStyle(errors.phone)} placeholder="+91 98400 XXXXX" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
                </Field>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Field label="Gender" required error={errors.gender}>
                  <select style={inputStyle(errors.gender)} value={form.gender} onChange={e=>set("gender",e.target.value)}>
                    <option value="">Select gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Work Schedule" error={errors.schedule}>
                  <input style={inputStyle(false)} placeholder="e.g. Mon–Fri" value={form.schedule} onChange={e=>set("schedule",e.target.value)}/>
                </Field>
              </div>

              <Field label="Short Bio / Profile Summary" error={errors.bio}>
                <textarea style={{ ...inputStyle(false),resize:"vertical",minHeight:80 }} placeholder="Brief professional summary…" value={form.bio} onChange={e=>set("bio",e.target.value)}/>
              </Field>
            </div>
          )}

          {/* ── STEP 2: Professional ── */}
          {step===2 && (
            <div style={{ display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .2s ease" }}>
              <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:-4 }}>Step 2 — Professional Details</div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Field label="Specialty" required error={errors.specialty}>
                  <select style={inputStyle(errors.specialty)} value={form.specialty} onChange={e=>set("specialty",e.target.value)}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Department" required error={errors.department}>
                  <select style={inputStyle(errors.department)} value={form.department} onChange={e=>set("department",e.target.value)}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Qualification" required error={errors.qualification}>
                <input style={inputStyle(errors.qualification)} placeholder="e.g. MD, DM Cardiology" value={form.qualification} onChange={e=>set("qualification",e.target.value)} list="qual-list"/>
                <datalist id="qual-list">{QUALIFICATIONS.map(q=><option key={q} value={q}/>)}</datalist>
              </Field>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <Field label="Years of Experience" required error={errors.experience}>
                  <input style={inputStyle(errors.experience)} type="number" min={0} max={60} placeholder="e.g. 10" value={form.experience} onChange={e=>set("experience",e.target.value)}/>
                </Field>
                <Field label="Consultation Fee (₹)" required error={errors.consultFee}>
                  <input style={inputStyle(errors.consultFee)} type="number" min={0} placeholder="e.g. 700" value={form.consultFee} onChange={e=>set("consultFee",e.target.value)}/>
                </Field>
              </div>

              <Field label="Medical License No." required error={errors.licenseNo}>
                <input style={inputStyle(errors.licenseNo)} placeholder="e.g. MCI-2015-XX" value={form.licenseNo} onChange={e=>set("licenseNo",e.target.value)}/>
              </Field>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step===3 && (
            <div style={{ animation:"fadeUp .2s ease" }}>
              <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#14b8a6",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16 }}>Step 3 — Review & Confirm</div>

              {/* Preview Card */}
              <div style={{ background:"linear-gradient(135deg,#f0f9ff,#f5f3ff)",borderRadius:14,padding:"1.25rem",border:"1px solid #e0e7ff",marginBottom:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14 }}>
                  <div style={{ width:52,height:52,borderRadius:14,background:avatarColor(initials(form.name||"?")),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1rem",fontWeight:800 }}>
                    {initials(form.name||"?")}
                  </div>
                  <div>
                    <div style={{ fontSize:"1rem",fontWeight:800,color:"#0f172a" }}>{form.name||"—"}</div>
                    <div style={{ fontSize:"0.72rem",color:"#6366f1",fontWeight:600 }}>{form.specialty||"—"} · {form.department||"—"}</div>
                    <div style={{ fontSize:"0.65rem",color:"#94a3b8",marginTop:2 }}>{form.qualification||"—"} · {form.experience||"—"} yrs exp.</div>
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {[
                    ["📧 Email",   form.email],
                    ["📞 Phone",   form.phone],
                    ["⚧ Gender",   form.gender],
                    ["📅 Schedule",form.schedule],
                    ["🪪 License", form.licenseNo],
                    ["💰 Fee",     form.consultFee ? `₹${form.consultFee}` : "—"],
                  ].map(([k,v])=>(
                    <div key={k} style={{ background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"8px 10px" }}>
                      <div style={{ fontSize:"0.6rem",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>{k}</div>
                      <div style={{ fontSize:"0.75rem",fontWeight:600,color:"#0f172a",marginTop:2 }}>{v||"—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <div style={{ background:"#fff1f2",border:"1px solid #fecdd3",borderRadius:9,padding:"10px 14px",fontSize:"0.73rem",color:"#be123c",marginBottom:12 }}>
                  ⚠️ Please fix validation errors in steps 1 & 2 before saving.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{ padding:"1rem 1.5rem",borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,position:"sticky",bottom:0,background:"#fff",borderRadius:"0 0 18px 18px" }}>
          <button onClick={onClose} style={{ padding:"9px 20px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"0.8rem",fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <div style={{ display:"flex",gap:8 }}>
            {step>1 && <button onClick={()=>setStep(s=>s-1)} style={{ padding:"9px 20px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#0f172a",fontSize:"0.8rem",fontWeight:600,cursor:"pointer" }}>← Back</button>}
            {step<3
              ? <button onClick={()=>setStep(s=>s+1)} style={{ padding:"9px 24px",borderRadius:9,border:"none",background:"#0f172a",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:"pointer" }}>Next →</button>
              : <button onClick={handleSave} disabled={saving} style={{ padding:"9px 24px",borderRadius:9,border:"none",background:saving?"#94a3b8":"#0ea5e9",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8 }}>
                  {saving ? "Saving…" : mode==="edit" ? "💾 Save Changes" : "✅ Add Doctor"}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DOCTOR DETAIL DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function DoctorDrawer({ doctor, onClose, onEdit, onDelete, onToggleStatus }) {
  const sc = STATUS_S[doctor.status] || STATUS_S.Inactive;
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(3px)",zIndex:900,display:"flex",justifyContent:"flex-end",animation:"fadeIn .2s ease" }}>
      <div style={{ width:"100%",maxWidth:420,background:"#fff",height:"100%",overflowY:"auto",boxShadow:"-12px 0 40px rgba(0,0,0,0.15)",animation:"slideLeft .25s cubic-bezier(.22,1,.36,1)" }}>

        {/* Drawer Header */}
        <div style={{ background:`linear-gradient(135deg, ${avatarColor(doctor.avatar)}22, ${avatarColor(doctor.avatar)}08)`, padding:"1.5rem", borderBottom:"1px solid #f1f5f9", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
            <StatusPill status={doctor.status}/>
            <div onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:"rgba(255,255,255,0.8)",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b",fontSize:"1rem" }}>✕</div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:60,height:60,borderRadius:16,background:avatarColor(doctor.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"1.1rem",fontWeight:800,boxShadow:`0 8px 20px ${avatarColor(doctor.avatar)}44` }}>
              {doctor.avatar}
            </div>
            <div>
              <div style={{ fontSize:"1.05rem",fontWeight:800,color:"#0f172a" }}>{doctor.name}</div>
              <div style={{ fontSize:"0.75rem",color:"#6366f1",fontWeight:600,marginTop:2 }}>{doctor.specialty}</div>
              <div style={{ fontSize:"0.65rem",color:"#94a3b8",marginTop:1 }}>{doctor.id} · Joined {doctor.joined}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:8,marginTop:14 }}>
            <button onClick={onEdit} style={{ flex:1,padding:"8px",borderRadius:9,border:"none",background:"#0f172a",color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer" }}>✏️ Edit</button>
            <button onClick={()=>onToggleStatus(doctor)} style={{ flex:1,padding:"8px",borderRadius:9,border:`1.5px solid ${sc.border}`,background:sc.bg,color:sc.color,fontSize:"0.75rem",fontWeight:700,cursor:"pointer" }}>
              {doctor.status==="Active"?"⏸ Deactivate":"▶ Activate"}
            </button>
            <button onClick={()=>onDelete(doctor)} style={{ padding:"8px 12px",borderRadius:9,border:"1.5px solid #fecdd3",background:"#fff1f2",color:"#be123c",fontSize:"0.75rem",fontWeight:700,cursor:"pointer" }}>🗑</button>
          </div>
        </div>

        <div style={{ padding:"1.25rem" }}>

          {/* Stats row */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18 }}>
            {[
              { label:"Patients",   val:doctor.patients, icon:"🧑" },
              { label:"Experience", val:`${doctor.experience}y`, icon:"⏱" },
              { label:"Rating",     val:doctor.rating, icon:"⭐" },
            ].map(s=>(
              <div key={s.label} style={{ background:"#f8fafc",borderRadius:10,padding:"10px",textAlign:"center",border:"1px solid #f1f5f9" }}>
                <div style={{ fontSize:"1rem" }}>{s.icon}</div>
                <div style={{ fontSize:"0.95rem",fontWeight:800,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace" }}>{s.val}</div>
                <div style={{ fontSize:"0.6rem",color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <Section title="Contact Information">
            <InfoRow icon="📧" label="Email"   val={doctor.email}/>
            <InfoRow icon="📞" label="Phone"   val={doctor.phone}/>
            <InfoRow icon="⚧"  label="Gender"  val={doctor.gender}/>
          </Section>

          <Section title="Professional Details">
            <InfoRow icon="🏥" label="Department"    val={doctor.department}/>
            <InfoRow icon="🎓" label="Qualification" val={doctor.qualification}/>
            <InfoRow icon="📅" label="Schedule"      val={doctor.schedule}/>
            <InfoRow icon="💰" label="Consult Fee"   val={`₹${doctor.consultFee}`}/>
            <InfoRow icon="🪪" label="License No."   val={doctor.licenseNo}/>
          </Section>

          <Section title="Rating">
            <StarRating v={doctor.rating}/>
          </Section>

          {doctor.bio && (
            <Section title="Bio">
              <p style={{ fontSize:"0.75rem",color:"#475569",lineHeight:1.6 }}>{doctor.bio}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:"0.63rem",fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8 }}>{title}</div>
      <div style={{ background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:"1px solid #f1f5f9",display:"flex",flexDirection:"column",gap:8 }}>{children}</div>
    </div>
  );
}
function InfoRow({ icon, label, val }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:9 }}>
      <span style={{ fontSize:"0.8rem",width:18 }}>{icon}</span>
      <span style={{ fontSize:"0.65rem",color:"#94a3b8",fontWeight:600,width:90,flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:"0.75rem",color:"#0f172a",fontWeight:600 }}>{val||"—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE CONFIRM
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirm({ doctor, onCancel, onConfirm }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",backdropFilter:"blur(4px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }}>
      <div style={{ background:"#fff",borderRadius:16,padding:"1.75rem",maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 24px 60px rgba(0,0,0,0.2)",animation:"slideUp .2s ease" }}>
        <div style={{ width:52,height:52,borderRadius:"50%",background:"#fff1f2",border:"2px solid #fecdd3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",margin:"0 auto 14px" }}>🗑️</div>
        <div style={{ fontSize:"1rem",fontWeight:800,color:"#0f172a",marginBottom:6 }}>Remove Doctor?</div>
        <div style={{ fontSize:"0.75rem",color:"#64748b",marginBottom:20,lineHeight:1.6 }}>
          Are you sure you want to remove <strong>{doctor.name}</strong>? This action cannot be undone and will also remove all associated records.
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,padding:"10px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:"0.8rem",fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1,padding:"10px",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:"pointer" }}>Yes, Remove</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDoctors() {
  const [doctors,    setDoctors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterSpec, setFilterSpec] = useState("All");
  const [filterStat, setFilterStat] = useState("All");
  const [sortBy,     setSortBy]     = useState("name");
  const [viewMode,   setViewMode]   = useState("table"); // "table" | "grid"
  const [modal,      setModal]      = useState(null);    // null | {mode, doctor}
  const [drawer,     setDrawer]     = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3000);
  };

  // Load doctors
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (!API.USE_REAL_API) {
      setTimeout(() => { setDoctors(DUMMY_DOCTORS); setLoading(false); }, 500);
      return;
    }
    apiFetch("GET", API.EP.list)
      .then(d => { setDoctors(d); setLoading(false); })
      .catch(() => { setDoctors(DUMMY_DOCTORS); setLoading(false); });
  }, []);

  // Stats
  const total    = doctors.length;
  const active   = doctors.filter(d=>d.status==="Active").length;
  const onLeave  = doctors.filter(d=>d.status==="On Leave").length;
  const inactive = doctors.filter(d=>d.status==="Inactive").length;
  const avgRating= doctors.length ? (doctors.reduce((s,d)=>s+(d.rating||0),0)/doctors.length).toFixed(1) : "—";

  // Filter + search + sort
  const specs = ["All", ...Array.from(new Set(doctors.map(d=>d.specialty)))];
  const filtered = doctors
    .filter(d => filterSpec==="All" || d.specialty===filterSpec)
    .filter(d => filterStat==="All" || d.status===filterStat)
    .filter(d => {
      const q = search.toLowerCase();
      return !q || d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    })
    .sort((a,b) => {
      if (sortBy==="name")       return a.name.localeCompare(b.name);
      if (sortBy==="experience") return b.experience - a.experience;
      if (sortBy==="patients")   return b.patients - a.patients;
      if (sortBy==="rating")     return b.rating - a.rating;
      return 0;
    });

  // CRUD handlers
  const handleSave = (doc) => {
    setDoctors(prev => {
      const idx = prev.findIndex(d=>d.id===doc.id);
      if (idx>=0) { const n=[...prev]; n[idx]=doc; return n; }
      return [...prev, doc];
    });
    setModal(null);
    showToast(modal.mode==="edit" ? `${doc.name} updated successfully` : `${doc.name} added successfully`);
  };

  const handleDelete = async () => {
    if (API.USE_REAL_API) await apiFetch("DELETE", `/doctors/${delTarget.id}`).catch(()=>{});
    setDoctors(prev=>prev.filter(d=>d.id!==delTarget.id));
    if (drawer?.id===delTarget.id) setDrawer(null);
    showToast(`${delTarget.name} removed`, "error");
    setDelTarget(null);
  };

  const handleToggle = async (doc) => {
    const newStatus = doc.status==="Active" ? "Inactive" : "Active";
    if (API.USE_REAL_API) await apiFetch("PATCH", `/doctors/${doc.id}/status`, { status: newStatus }).catch(()=>{});
    const updated = {...doc, status: newStatus};
    setDoctors(prev=>prev.map(d=>d.id===doc.id ? updated : d));
    if (drawer?.id===doc.id) setDrawer(updated);
    showToast(`${doc.name} is now ${newStatus}`);
  };

  return (
    <>
      <style>{`
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideLeft{ from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes toastIn  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .doc-root { animation: fadeUp .35s ease; font-family:'Sora',sans-serif; }

        .doc-stat { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1rem 1.2rem; display:flex; align-items:flex-start; gap:12px; position:relative; overflow:hidden; transition:box-shadow .2s,transform .2s; }
        .doc-stat:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }

        .doc-table-row { transition:background .12s; cursor:pointer; }
        .doc-table-row:hover td { background:#f8fafc; }

        .doc-grid-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.25rem; transition:box-shadow .2s,transform .2s; cursor:pointer; }
        .doc-grid-card:hover { box-shadow:0 10px 28px rgba(0,0,0,.09); transform:translateY(-2px); }

        .doc-action-btn { width:30px; height:30px; borderRadius:8px; border:1.5px solid #e2e8f0; background:#f8fafc; display:flex; align-items:center; justify-content:center; cursor:pointer; fontSize:0.8rem; transition:all .15s; }
        .doc-action-btn:hover { background:#f1f5f9; }

        .doc-filter-chip { padding:5px 14px; borderRadius:99px; fontSize:0.72rem; fontWeight:600; cursor:pointer; border:1.5px solid transparent; transition:all .15s; }

        .doc-sort-select { padding:6px 10px; borderRadius:9px; border:1.5px solid #e2e8f0; background:#f8fafc; fontSize:0.75rem; color:#475569; fontFamily:inherit; cursor:pointer; outline:none; }
      `}</style>

      <div className="doc-root">

        {/* ── Header ── */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.5rem",gap:12,flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:"1.3rem",fontWeight:800,color:"#0f172a" }}>Doctors</div>
            <div style={{ fontSize:"0.72rem",color:"#94a3b8",marginTop:3 }}>Manage all registered doctors · {total} total</div>
          </div>
          <button
            onClick={()=>setModal({mode:"create",doctor:null})}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#0f172a,#1e3a5f)",color:"#fff",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(15,23,42,.25)",transition:"transform .15s,box-shadow .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 20px rgba(15,23,42,.3)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 14px rgba(15,23,42,.25)"}}
          >
            <span style={{ fontSize:"1rem" }}>+</span> Add New Doctor
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:"1.5rem" }}>
          {[
            { label:"Total Doctors",  val:loading?null:total,    icon:"👨‍⚕️", color:"#6366f1" },
            { label:"Active",         val:loading?null:active,   icon:"✅",   color:"#0ea5e9" },
            { label:"On Leave",       val:loading?null:onLeave,  icon:"📅",   color:"#f59e0b" },
            { label:"Inactive",       val:loading?null:inactive, icon:"⏸",   color:"#94a3b8" },
            { label:"Avg. Rating",    val:loading?null:avgRating,icon:"⭐",   color:"#14b8a6" },
          ].map(s=>(
            <div key={s.label} className="doc-stat">
              <div style={{ width:40,height:40,borderRadius:10,background:s.color+"18",color:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:"0.6rem",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3 }}>{s.label}</div>
                {loading ? <Skel h={24} w={60} r={5}/> : <div style={{ fontSize:"1.3rem",fontWeight:800,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace" }}>{s.val}</div>}
              </div>
              <div style={{ position:"absolute",top:0,right:0,width:60,height:60,borderRadius:"50%",background:s.color+"08",transform:"translate(30%,-30%)",pointerEvents:"none" }}/>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"1rem 1.25rem",marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>

          {/* Search */}
          <div style={{ display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"6px 12px",flex:1,minWidth:180 }}>
            <span style={{ color:"#94a3b8",fontSize:"0.85rem" }}>🔍</span>
            <input
              placeholder="Search by name, ID, specialty…"
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ border:"none",background:"transparent",fontSize:"0.78rem",color:"#0f172a",fontFamily:"'Sora',sans-serif",outline:"none",width:"100%" }}
            />
            {search && <span onClick={()=>setSearch("")} style={{ color:"#94a3b8",cursor:"pointer",fontSize:"0.9rem" }}>✕</span>}
          </div>

          {/* Status filter */}
          <div style={{ display:"flex",gap:5 }}>
            {["All","Active","On Leave","Inactive"].map(s=>(
              <button key={s} className="doc-filter-chip"
                onClick={()=>setFilterStat(s)}
                style={{ background:filterStat===s?"#0f172a":"#f8fafc", color:filterStat===s?"#fff":"#64748b", borderColor:filterStat===s?"#0f172a":"#e2e8f0" }}
              >{s}</button>
            ))}
          </div>

          {/* Specialty filter */}
          <select className="doc-sort-select" value={filterSpec} onChange={e=>setFilterSpec(e.target.value)}>
            {specs.map(s=><option key={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <select className="doc-sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="experience">Sort: Experience</option>
            <option value="patients">Sort: Patients</option>
            <option value="rating">Sort: Rating</option>
          </select>

          {/* View toggle */}
          <div style={{ display:"flex",background:"#f1f5f9",borderRadius:9,padding:3,gap:2,flexShrink:0 }}>
            {[["table","☰"],["grid","⊞"]].map(([m,ico])=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{ width:32,height:30,borderRadius:7,border:"none",background:viewMode===m?"#fff":"transparent",color:viewMode===m?"#0f172a":"#94a3b8",cursor:"pointer",fontSize:"0.9rem",boxShadow:viewMode===m?"0 1px 3px rgba(0,0,0,.08)":"none",transition:"all .15s" }}>{ico}</button>
            ))}
          </div>

          <div style={{ fontSize:"0.7rem",color:"#94a3b8",flexShrink:0 }}>{filtered.length} result{filtered.length!==1?"s":""}</div>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode==="table" && (
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                    {["Doctor","Specialty","Department","Experience","Patients","Consult Fee","Status","Actions"].map(h=>(
                      <th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:"0.61rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"#94a3b8",whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_,i)=>(
                      <tr key={i}><td colSpan={8} style={{ padding:"14px" }}><Skel h={32} r={6}/></td></tr>
                    ))
                    : filtered.length===0
                      ? <tr><td colSpan={8} style={{ padding:"3rem",textAlign:"center",color:"#94a3b8",fontSize:"0.8rem" }}>No doctors match your filters</td></tr>
                      : filtered.map(doc=>(
                        <tr key={doc.id} className="doc-table-row" onClick={()=>setDrawer(doc)}>
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                              <div style={{ width:34,height:34,borderRadius:9,background:avatarColor(doc.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.65rem",fontWeight:800,flexShrink:0 }}>{doc.avatar}</div>
                              <div>
                                <div style={{ fontSize:"0.78rem",fontWeight:700,color:"#0f172a" }}>{doc.name}</div>
                                <div style={{ fontSize:"0.62rem",color:"#94a3b8" }}>{doc.id} · {doc.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"12px 14px",fontSize:"0.75rem",color:"#475569",fontWeight:500 }}>{doc.specialty}</td>
                          <td style={{ padding:"12px 14px",fontSize:"0.72rem",color:"#64748b" }}>{doc.department}</td>
                          <td style={{ padding:"12px 14px",fontSize:"0.78rem",fontWeight:700,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace" }}>{doc.experience}y</td>
                          <td style={{ padding:"12px 14px",fontSize:"0.78rem",fontWeight:700,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace" }}>{doc.patients}</td>
                          <td style={{ padding:"12px 14px",fontSize:"0.75rem",color:"#475569" }}>₹{doc.consultFee}</td>
                          <td style={{ padding:"12px 14px" }}><StatusPill status={doc.status}/></td>
                          <td style={{ padding:"12px 14px" }} onClick={e=>e.stopPropagation()}>
                            <div style={{ display:"flex",gap:5 }}>
                              <div title="Edit" className="doc-action-btn" onClick={()=>setModal({mode:"edit",doctor:doc})}>✏️</div>
                              <div title="Toggle Status" className="doc-action-btn" onClick={()=>handleToggle(doc)}>
                                {doc.status==="Active"?"⏸":"▶"}
                              </div>
                              <div title="Delete" className="doc-action-btn" style={{ borderColor:"#fecdd3",background:"#fff1f2" }} onClick={()=>setDelTarget(doc)}>🗑</div>
                            </div>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode==="grid" && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14 }}>
            {loading
              ? Array(6).fill(0).map((_,i)=><div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"1.25rem" }}><Skel h={100}/></div>)
              : filtered.length===0
                ? <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"3rem",color:"#94a3b8",fontSize:"0.8rem" }}>No doctors match your filters</div>
                : filtered.map(doc=>(
                  <div key={doc.id} className="doc-grid-card" onClick={()=>setDrawer(doc)}>
                    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:44,height:44,borderRadius:12,background:avatarColor(doc.avatar),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.85rem",fontWeight:800,boxShadow:`0 4px 12px ${avatarColor(doc.avatar)}44` }}>{doc.avatar}</div>
                        <div>
                          <div style={{ fontSize:"0.82rem",fontWeight:700,color:"#0f172a" }}>{doc.name}</div>
                          <div style={{ fontSize:"0.63rem",color:"#6366f1",fontWeight:600 }}>{doc.specialty}</div>
                        </div>
                      </div>
                      <StatusPill status={doc.status}/>
                    </div>
                    <div style={{ fontSize:"0.65rem",color:"#94a3b8",marginBottom:10 }}>{doc.department} · {doc.qualification}</div>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12 }}>
                      {[["Patients",doc.patients,"🧑"],["Exp.",`${doc.experience}y`,"⏱"],["Fee",`₹${doc.consultFee}`,"💰"]].map(([l,v,i])=>(
                        <div key={l} style={{ background:"#f8fafc",borderRadius:8,padding:"6px",textAlign:"center" }}>
                          <div style={{ fontSize:"0.85rem" }}>{i}</div>
                          <div style={{ fontSize:"0.75rem",fontWeight:700,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace" }}>{v}</div>
                          <div style={{ fontSize:"0.57rem",color:"#94a3b8",fontWeight:600,textTransform:"uppercase" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <StarRating v={doc.rating}/>
                    <div style={{ display:"flex",gap:6,marginTop:12 }} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>setModal({mode:"edit",doctor:doc})} style={{ flex:1,padding:"7px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontSize:"0.72rem",fontWeight:700,cursor:"pointer" }}>✏️ Edit</button>
                      <button onClick={()=>handleToggle(doc)} style={{ flex:1,padding:"7px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontSize:"0.72rem",fontWeight:700,cursor:"pointer" }}>
                        {doc.status==="Active"?"⏸ Pause":"▶ Activate"}
                      </button>
                      <button onClick={()=>setDelTarget(doc)} style={{ padding:"7px 10px",borderRadius:8,border:"1.5px solid #fecdd3",background:"#fff1f2",color:"#be123c",fontSize:"0.72rem",fontWeight:700,cursor:"pointer" }}>🗑</button>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

      </div>

      {/* ── Modals & overlays ── */}
      {modal    && <DoctorModal  mode={modal.mode} doctor={modal.doctor} onClose={()=>setModal(null)}  onSave={handleSave}/>}
      {drawer   && <DoctorDrawer doctor={drawer} onClose={()=>setDrawer(null)} onEdit={()=>{setModal({mode:"edit",doctor:drawer});setDrawer(null);}} onDelete={d=>{setDelTarget(d);setDrawer(null);}} onToggleStatus={handleToggle}/>}
      {delTarget && <DeleteConfirm doctor={delTarget} onCancel={()=>setDelTarget(null)} onConfirm={handleDelete}/>}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",bottom:24,right:24,zIndex:2000,display:"flex",alignItems:"center",gap:10,padding:"12px 18px",borderRadius:12,background:toast.type==="error"?"#fff1f2":"#f0fdf4",border:`1px solid ${toast.type==="error"?"#fecdd3":"#bbf7d0"}`,color:toast.type==="error"?"#be123c":"#15803d",fontSize:"0.78rem",fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.12)",animation:"toastIn .3s ease",fontFamily:"'Sora',sans-serif" }}>
          <span>{toast.type==="error"?"❌":"✅"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}