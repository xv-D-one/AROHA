import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  API CONFIG
//  When backend is ready:
//    1. Set BASE_URL to your server URL
//    2. Set USE_REAL_API to true
//  Mirrors the same pattern used in AdminDoctors & AdminDashboard
// ─────────────────────────────────────────────────────────────────────────────
const API = {
  BASE_URL: "http://localhost:5000/api",
  USE_REAL_API: false,
  EP: {
    list:   "/patients",
    create: "/patients",          // POST  — body: patient object
    update: "/patients/:id",      // PUT   — body: updated patient
    delete: "/patients/:id",      // DELETE
    toggle: "/patients/:id/status", // PATCH — body: { status }
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
const DUMMY_PATIENTS = [
  { id:"P-1001", name:"Aisha Nair",       email:"aisha.nair@gmail.com",     phone:"+91 94400 11111", dob:"1990-04-12", age:34, gender:"Female", bloodGroup:"B+",  address:"12 MG Road, Kochi, Kerala",          assignedDoctor:"Dr. Arjun Pillai",  department:"Cardiology",     diagnosis:"Hypertension",          status:"Admitted",   admitDate:"2025-03-01", weight:"58kg",  height:"162cm", allergies:"Penicillin",   emergencyContact:"Rahul Nair — +91 94400 99991", avatar:"AN", insurance:"Star Health",    visits:6 },
  { id:"P-1002", name:"Samuel Thomas",    email:"samuel.t@gmail.com",       phone:"+91 94400 22222", dob:"1972-09-25", age:52, gender:"Male",   bloodGroup:"O+",  address:"45 Convent Road, Thrissur, Kerala",  assignedDoctor:"Dr. Lena Mathew",   department:"Neurology",      diagnosis:"Migraine Disorder",     status:"Outpatient", admitDate:"2025-02-18", weight:"74kg",  height:"175cm", allergies:"None",          emergencyContact:"Mary Thomas — +91 94400 99992", avatar:"ST", insurance:"HDFC Ergo",     visits:3 },
  { id:"P-1003", name:"Rohan Varma",      email:"rohan.v@gmail.com",        phone:"+91 94400 33333", dob:"1997-01-08", age:28, gender:"Male",   bloodGroup:"A-",  address:"78 Gandhi Nagar, Trivandrum, Kerala", assignedDoctor:"Dr. Ravi Shankar",  department:"Orthopedics",    diagnosis:"ACL Tear — Post Surgery",status:"Discharged", admitDate:"2025-01-10", weight:"70kg",  height:"178cm", allergies:"Aspirin",       emergencyContact:"Kavya Varma — +91 94400 99993", avatar:"RV", insurance:"New India",     visits:4 },
  { id:"P-1004", name:"Priya Krishnan",   email:"priya.k@gmail.com",        phone:"+91 94400 44444", dob:"1980-07-30", age:45, gender:"Female", bloodGroup:"AB+", address:"33 Beach Road, Kozhikode, Kerala",   assignedDoctor:"Dr. Suresh Kumar",  department:"General Medicine", diagnosis:"Type 2 Diabetes",      status:"Admitted",   admitDate:"2025-03-05", weight:"65kg",  height:"158cm", allergies:"Sulfa drugs",   emergencyContact:"Arun Krishnan — +91 94400 99994", avatar:"PK", insurance:"Bajaj Allianz", visits:9 },
  { id:"P-1005", name:"Meera Suresh",     email:"meera.s@gmail.com",        phone:"+91 94400 55555", dob:"1963-12-14", age:61, gender:"Female", bloodGroup:"B-",  address:"22 Lake View, Alappuzha, Kerala",    assignedDoctor:"Dr. Priya Nambiar", department:"Pediatrics",     diagnosis:"Respiratory Infection", status:"Outpatient", admitDate:"2025-02-28", weight:"52kg",  height:"154cm", allergies:"None",          emergencyContact:"Suresh Kumar — +91 94400 99995",  avatar:"MS", insurance:"Oriental",      visits:2 },
  { id:"P-1006", name:"Arjun Dev",        email:"arjun.d@gmail.com",        phone:"+91 94400 66666", dob:"1985-03-20", age:40, gender:"Male",   bloodGroup:"O-",  address:"56 Hill Top, Munnar, Kerala",         assignedDoctor:"Dr. Kavya Menon",   department:"Dermatology",    diagnosis:"Psoriasis",             status:"Outpatient", admitDate:"2025-03-03", weight:"80kg",  height:"182cm", allergies:"Latex",         emergencyContact:"Sunita Dev — +91 94400 99996",   avatar:"AD", insurance:"Star Health",    visits:5 },
  { id:"P-1007", name:"Lakshmi Pillai",   email:"lakshmi.p@gmail.com",      phone:"+91 94400 77777", dob:"1955-06-18", age:69, gender:"Female", bloodGroup:"A+",  address:"90 Fort Road, Palakkad, Kerala",      assignedDoctor:"Dr. Arjun Pillai",  department:"Cardiology",     diagnosis:"Atrial Fibrillation",   status:"Critical",   admitDate:"2025-03-07", weight:"60kg",  height:"155cm", allergies:"Ibuprofen",     emergencyContact:"Vijay Pillai — +91 94400 99997",  avatar:"LP", insurance:"HDFC Ergo",     visits:12 },
  { id:"P-1008", name:"Kevin Mathew",     email:"kevin.m@gmail.com",        phone:"+91 94400 88888", dob:"2001-11-03", age:23, gender:"Male",   bloodGroup:"AB-", address:"14 River Side, Ernakulam, Kerala",   assignedDoctor:"Dr. Nikhil Thomas", department:"Radiology",      diagnosis:"Appendicitis — Imaging",status:"Discharged", admitDate:"2025-02-05", weight:"68kg",  height:"171cm", allergies:"None",          emergencyContact:"Thomas Mathew — +91 94400 99998", avatar:"KM", insurance:"None",          visits:1 },
];

const BLOOD_GROUPS   = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const DEPARTMENTS    = ["Cardiology","Dermatology","Neurology","Orthopedics","Pediatrics","General Medicine","Gynecology","Radiology","Psychiatry","Oncology","ENT","Ophthalmology"];
const DUMMY_DOCTORS  = ["Dr. Arjun Pillai","Dr. Kavya Menon","Dr. Lena Mathew","Dr. Ravi Shankar","Dr. Priya Nambiar","Dr. Suresh Kumar","Dr. Anjali Varghese","Dr. Nikhil Thomas"];
const INSURERS       = ["Star Health","HDFC Ergo","Bajaj Allianz","New India","Oriental","United India","None"];

const EMPTY_FORM = {
  name:"", email:"", phone:"", dob:"", gender:"", bloodGroup:"",
  address:"", assignedDoctor:"", department:"", diagnosis:"",
  weight:"", height:"", allergies:"", emergencyContact:"",
  insurance:"None", password:"",
};

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#0ea5e9","#14b8a6","#f59e0b","#6366f1","#10b981","#ef4444","#8b5cf6","#ec4899"];
const avatarColor  = s => AVATAR_COLORS[(s?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const initials     = name => name.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const calcAge      = dob => dob ? Math.floor((Date.now() - new Date(dob)) / 3.156e10) : "—";

const STATUS_S = {
  Admitted:   { bg:"#eff6ff", color:"#2563eb", dot:"#3b82f6", border:"#bfdbfe" },
  Outpatient: { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", border:"#bbf7d0" },
  Discharged: { bg:"#f8fafc", color:"#475569", dot:"#94a3b8", border:"#e2e8f0" },
  Critical:   { bg:"#fff1f2", color:"#be123c", dot:"#ef4444", border:"#fecdd3" },
};

const BG_COLORS = {
  "A+":"#dbeafe","A-":"#ede9fe","B+":"#dcfce7","B-":"#fef9c3",
  "AB+":"#fce7f3","AB-":"#ffedd5","O+":"#e0f2fe","O-":"#f1f5f9",
};
const BG_TEXT = {
  "A+":"#1d4ed8","A-":"#7c3aed","B+":"#15803d","B-":"#854d0e",
  "AB+":"#9d174d","AB-":"#9a3412","O+":"#0369a1","O-":"#475569",
};

function StatusPill({ status }) {
  const s = STATUS_S[status] || STATUS_S.Discharged;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:"0.63rem", fontWeight:700, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot }}/>
      {status}
    </span>
  );
}

function BloodBadge({ bg }) {
  return (
    <span style={{ padding:"2px 9px", borderRadius:99, background:BG_COLORS[bg]||"#f1f5f9", color:BG_TEXT[bg]||"#475569", fontSize:"0.65rem", fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
      {bg||"—"}
    </span>
  );
}

function Skel({ h=18, w="100%", r=6 }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }}/>;
}

function Field({ label, required, error, hint, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:"0.67rem", fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em" }}>
        {label}{required && <span style={{ color:"#ef4444", marginLeft:3 }}>*</span>}
        {hint && <span style={{ color:"#94a3b8", fontWeight:400, textTransform:"none", letterSpacing:0, marginLeft:6 }}>{hint}</span>}
      </label>
      {children}
      {error && <span style={{ fontSize:"0.62rem", color:"#ef4444", display:"flex", alignItems:"center", gap:4 }}>⚠ {error}</span>}
    </div>
  );
}

const inp = (err) => ({
  width:"100%", padding:"9px 12px", borderRadius:9,
  border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
  fontSize:"0.8rem", color:"#0f172a", fontFamily:"'Sora',sans-serif",
  background:"#fafafa", outline:"none",
});

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE PATIENT COMPONENT (exportable standalone too)
// ─────────────────────────────────────────────────────────────────────────────
export function CreatePatient({ mode = "create", patient = null, onClose, onSave }) {
  const [form,   setForm]   = useState(mode==="edit" && patient ? { ...patient, password:"" } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [step,   setStep]   = useState(1);
  const [pwShow, setPwShow] = useState(false);
  const overlayRef = useRef(null);

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.dob)          e.dob   = "Date of birth is required";
    if (!form.gender)       e.gender = "Gender is required";
    if (!form.bloodGroup)   e.bloodGroup = "Blood group is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.department)   e.department = "Department is required";
    if (!form.assignedDoctor) e.assignedDoctor = "Assign a doctor";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    if (!form.emergencyContact.trim()) e.emergencyContact = "Emergency contact required";
    if (mode==="create" && !form.password) e.password = "Password is required";
    if (mode==="create" && form.password && form.password.length < 6) e.password = "Min. 6 characters";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      const step1Keys = ["name","email","phone","dob","gender","bloodGroup","password"];
      const step2Keys = ["address","department","assignedDoctor","diagnosis","emergencyContact"];
      if (Object.keys(e).some(k=>step1Keys.includes(k))) { setStep(1); return; }
      if (Object.keys(e).some(k=>step2Keys.includes(k))) { setStep(2); return; }
      return;
    }
    setSaving(true);
    try {
      if (API.USE_REAL_API) {
        if (mode==="edit") await apiFetch("PUT", `/patients/${patient.id}`, form);
        else               await apiFetch("POST", "/patients", form);
      }
      const age = calcAge(form.dob);
      onSave({
        ...form,
        id:      patient?.id || `P-${Date.now()}`,
        age:     typeof age === "number" ? age : patient?.age || 0,
        avatar:  initials(form.name),
        status:  patient?.status || "Outpatient",
        admitDate: patient?.admitDate || new Date().toISOString().slice(0,10),
        visits:  patient?.visits || 0,
      });
    } finally { setSaving(false); }
  };

  const STEPS = ["Personal","Medical","Review"];

  return (
    <div
      ref={overlayRef}
      onClick={e=>{ if(e.target===overlayRef.current) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(5px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"fadeIn .2s ease" }}
    >
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:660, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 28px 70px rgba(0,0,0,0.22)", animation:"slideUp .28s cubic-bezier(.22,1,.36,1)", display:"flex", flexDirection:"column" }}>

        {/* ── Modal Header ── */}
        <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#fff", zIndex:10, borderRadius:"20px 20px 0 0", gap:12 }}>
          <div>
            <div style={{ fontSize:"1rem", fontWeight:800, color:"#0f172a" }}>
              {mode==="edit" ? "Edit Patient" : "Register New Patient"}
            </div>
            <div style={{ fontSize:"0.68rem", color:"#94a3b8", marginTop:2 }}>
              {mode==="edit" ? `Editing record for ${patient.name}` : "Complete all steps to create a patient account"}
            </div>
          </div>
          {/* Step progress */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {STEPS.map((label,i)=>{
              const s = i+1;
              const done = step > s, active = step === s;
              return (
                <React.Fragment key={s}>
                  <div
                    onClick={()=>setStep(s)}
                    title={label}
                    style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}
                  >
                    <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", fontWeight:800, background:done?"#0ea5e9":active?"#0f172a":"#f1f5f9", color:done||active?"#fff":"#94a3b8", transition:"all .2s" }}>
                      {done ? "✓" : s}
                    </div>
                    <span style={{ fontSize:"0.65rem", fontWeight:600, color:active?"#0f172a":"#94a3b8", display:"none" }}>{label}</span>
                  </div>
                  {i < STEPS.length-1 && <div style={{ width:18, height:2, borderRadius:2, background:step>s?"#0ea5e9":"#f1f5f9", transition:"background .3s" }}/>}
                </React.Fragment>
              );
            })}
            <div onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:"#f8fafc", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b", marginLeft:8, fontSize:"0.95rem" }}>✕</div>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div style={{ padding:"1.5rem", flex:1 }}>

          {/* STEP 1 — Personal */}
          {step===1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:15, animation:"fadeUp .22s ease" }}>
              <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#0ea5e9", textTransform:"uppercase", letterSpacing:"0.09em", paddingBottom:2, borderBottom:"2px solid #e0f2fe", marginBottom:2 }}>
                Step 1 — Personal Information
              </div>

              <Field label="Full Name" required error={errors.name}>
                <input style={inp(errors.name)} placeholder="Patient's full name" value={form.name} onChange={e=>set("name",e.target.value)}/>
              </Field>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Email Address" required error={errors.email}>
                  <input style={inp(errors.email)} type="email" placeholder="patient@email.com" value={form.email} onChange={e=>set("email",e.target.value)}/>
                </Field>
                <Field label="Phone Number" required error={errors.phone}>
                  <input style={inp(errors.phone)} placeholder="+91 94400 XXXXX" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
                </Field>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <Field label="Date of Birth" required error={errors.dob}>
                  <input style={inp(errors.dob)} type="date" value={form.dob} onChange={e=>set("dob",e.target.value)}/>
                </Field>
                <Field label="Gender" required error={errors.gender}>
                  <select style={inp(errors.gender)} value={form.gender} onChange={e=>set("gender",e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Blood Group" required error={errors.bloodGroup}>
                  <select style={inp(errors.bloodGroup)} value={form.bloodGroup} onChange={e=>set("bloodGroup",e.target.value)}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(b=><option key={b}>{b}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Full Address" required error={errors.address}>
                <textarea style={{ ...inp(errors.address), resize:"vertical", minHeight:60 }} placeholder="Street, City, State, PIN" value={form.address} onChange={e=>set("address",e.target.value)}/>
              </Field>

              {mode==="create" && (
                <Field label="Account Password" required hint="(min. 6 chars)" error={errors.password}>
                  <div style={{ position:"relative" }}>
                    <input
                      style={{ ...inp(errors.password), paddingRight:40 }}
                      type={pwShow?"text":"password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e=>set("password",e.target.value)}
                    />
                    <span
                      onClick={()=>setPwShow(p=>!p)}
                      style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", cursor:"pointer", fontSize:"0.85rem", color:"#94a3b8" }}
                    >{pwShow?"🙈":"👁"}</span>
                  </div>
                </Field>
              )}
            </div>
          )}

          {/* STEP 2 — Medical */}
          {step===2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:15, animation:"fadeUp .22s ease" }}>
              <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#14b8a6", textTransform:"uppercase", letterSpacing:"0.09em", paddingBottom:2, borderBottom:"2px solid #ccfbf1", marginBottom:2 }}>
                Step 2 — Medical & Clinical Details
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Department" required error={errors.department}>
                  <select style={inp(errors.department)} value={form.department} onChange={e=>set("department",e.target.value)}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Assigned Doctor" required error={errors.assignedDoctor}>
                  <select style={inp(errors.assignedDoctor)} value={form.assignedDoctor} onChange={e=>set("assignedDoctor",e.target.value)}>
                    <option value="">Select doctor</option>
                    {DUMMY_DOCTORS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Primary Diagnosis" required error={errors.diagnosis}>
                <input style={inp(errors.diagnosis)} placeholder="e.g. Type 2 Diabetes, Hypertension…" value={form.diagnosis} onChange={e=>set("diagnosis",e.target.value)}/>
              </Field>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <Field label="Weight" error={errors.weight}>
                  <input style={inp(false)} placeholder="e.g. 65kg" value={form.weight} onChange={e=>set("weight",e.target.value)}/>
                </Field>
                <Field label="Height" error={errors.height}>
                  <input style={inp(false)} placeholder="e.g. 165cm" value={form.height} onChange={e=>set("height",e.target.value)}/>
                </Field>
                <Field label="Insurance Provider" error={errors.insurance}>
                  <select style={inp(false)} value={form.insurance} onChange={e=>set("insurance",e.target.value)}>
                    {INSURERS.map(i=><option key={i}>{i}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Known Allergies" hint="(leave blank if none)">
                <input style={inp(false)} placeholder="e.g. Penicillin, Aspirin, Latex" value={form.allergies} onChange={e=>set("allergies",e.target.value)}/>
              </Field>

              <Field label="Emergency Contact" required hint="(Name — Phone)" error={errors.emergencyContact}>
                <input style={inp(errors.emergencyContact)} placeholder="e.g. Rahul Nair — +91 94400 XXXXX" value={form.emergencyContact} onChange={e=>set("emergencyContact",e.target.value)}/>
              </Field>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step===3 && (
            <div style={{ animation:"fadeUp .22s ease" }}>
              <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.09em", paddingBottom:2, borderBottom:"2px solid #e0e7ff", marginBottom:16 }}>
                Step 3 — Review & Confirm
              </div>

              {/* Preview card */}
              <div style={{ background:"linear-gradient(135deg,#f0f9ff 0%,#f5f3ff 100%)", borderRadius:16, padding:"1.25rem", border:"1px solid #e0e7ff", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  <div style={{ width:54, height:54, borderRadius:14, background:avatarColor(initials(form.name||"?")), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"1.05rem", fontWeight:800, boxShadow:`0 8px 20px ${avatarColor(initials(form.name||"?"))}44` }}>
                    {initials(form.name||"?")}
                  </div>
                  <div>
                    <div style={{ fontSize:"1rem", fontWeight:800, color:"#0f172a" }}>{form.name||"—"}</div>
                    <div style={{ fontSize:"0.72rem", color:"#6366f1", fontWeight:600, marginTop:2 }}>
                      {form.department||"—"} · {form.assignedDoctor||"—"}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                      {form.bloodGroup && <BloodBadge bg={form.bloodGroup}/>}
                      <span style={{ fontSize:"0.65rem", color:"#94a3b8" }}>{form.gender||""}{form.dob ? ` · ${calcAge(form.dob)}y` : ""}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    ["📧 Email",       form.email],
                    ["📞 Phone",       form.phone],
                    ["🏥 Diagnosis",   form.diagnosis],
                    ["⚖️ Weight",      form.weight],
                    ["📏 Height",      form.height],
                    ["🛡 Insurance",   form.insurance],
                    ["💊 Allergies",   form.allergies || "None"],
                    ["🚨 Emergency",   form.emergencyContact],
                  ].map(([k,v])=>(
                    <div key={k} style={{ background:"rgba(255,255,255,0.75)", borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ fontSize:"0.59rem", color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>{k}</div>
                      <div style={{ fontSize:"0.74rem", fontWeight:600, color:"#0f172a", marginTop:2, wordBreak:"break-word" }}>{v||"—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <div style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:9, padding:"10px 14px", fontSize:"0.73rem", color:"#be123c" }}>
                  ⚠️ Some required fields are missing. Go back and complete steps 1 & 2.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, position:"sticky", bottom:0, background:"#fff", borderRadius:"0 0 20px 20px" }}>
          <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>Cancel</button>
          <div style={{ display:"flex", gap:8 }}>
            {step > 1 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ padding:"9px 20px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#0f172a", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>← Back</button>
            )}
            {step < 3
              ? <button onClick={()=>setStep(s=>s+1)} style={{ padding:"9px 28px", borderRadius:9, border:"none", background:"#0f172a", color:"#fff", fontSize:"0.8rem", fontWeight:700, cursor:"pointer" }}>Next →</button>
              : <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding:"9px 28px", borderRadius:9, border:"none", background:saving?"#94a3b8":"#0ea5e9", color:"#fff", fontSize:"0.8rem", fontWeight:700, cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:8 }}
                >
                  {saving ? "Saving…" : mode==="edit" ? "💾 Save Changes" : "✅ Register Patient"}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PATIENT DETAIL DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function PatientDrawer({ patient, onClose, onEdit, onDelete, onStatusChange }) {
  const sc = STATUS_S[patient.status] || STATUS_S.Discharged;
  const statuses = Object.keys(STATUS_S).filter(s=>s!==patient.status);

  return (
    <div
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", backdropFilter:"blur(3px)", zIndex:900, display:"flex", justifyContent:"flex-end", animation:"fadeIn .2s ease" }}
    >
      <div style={{ width:"100%", maxWidth:440, background:"#fff", height:"100%", overflowY:"auto", boxShadow:"-12px 0 40px rgba(0,0,0,0.15)", animation:"slideLeft .25s cubic-bezier(.22,1,.36,1)" }}>

        {/* Drawer header */}
        <div style={{ background:`linear-gradient(135deg,${avatarColor(patient.avatar)}18,${avatarColor(patient.avatar)}06)`, padding:"1.5rem", borderBottom:"1px solid #f1f5f9", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <StatusPill status={patient.status}/>
            <div onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:"#f8fafc", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b" }}>✕</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:56, height:56, borderRadius:15, background:avatarColor(patient.avatar), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"1rem", fontWeight:800, boxShadow:`0 8px 20px ${avatarColor(patient.avatar)}44`, flexShrink:0 }}>
              {patient.avatar}
            </div>
            <div>
              <div style={{ fontSize:"1rem", fontWeight:800, color:"#0f172a" }}>{patient.name}</div>
              <div style={{ fontSize:"0.72rem", color:"#6366f1", fontWeight:600, marginTop:2 }}>{patient.department} · {patient.assignedDoctor}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                <BloodBadge bg={patient.bloodGroup}/>
                <span style={{ fontSize:"0.63rem", color:"#94a3b8" }}>{patient.id} · {patient.age}y · {patient.gender}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
            {[["Visits",patient.visits,"🔁"],["Admitted",patient.admitDate?.slice(5),"📅"],["Insurance",patient.insurance==="None"?"N/A":patient.insurance?.split(" ")[0],"🛡"]].map(([l,v,i])=>(
              <div key={l} style={{ background:"#f8fafc", borderRadius:10, padding:"8px", textAlign:"center", border:"1px solid #f1f5f9" }}>
                <div style={{ fontSize:"0.9rem" }}>{i}</div>
                <div style={{ fontSize:"0.8rem", fontWeight:800, color:"#0f172a", fontFamily:"'JetBrains Mono',monospace" }}>{v||"—"}</div>
                <div style={{ fontSize:"0.58rem", color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={onEdit} style={{ flex:1, padding:"8px", borderRadius:9, border:"none", background:"#0f172a", color:"#fff", fontSize:"0.74rem", fontWeight:700, cursor:"pointer" }}>✏️ Edit</button>
            <div style={{ flex:1, position:"relative" }}>
              <select
                value={patient.status}
                onChange={e=>onStatusChange(patient,e.target.value)}
                style={{ width:"100%", padding:"8px 10px", borderRadius:9, border:`1.5px solid ${sc.border}`, background:sc.bg, color:sc.color, fontSize:"0.74rem", fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", outline:"none" }}
              >
                <option value={patient.status}>{patient.status}</option>
                {statuses.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={()=>onDelete(patient)} style={{ padding:"8px 12px", borderRadius:9, border:"1.5px solid #fecdd3", background:"#fff1f2", color:"#be123c", fontSize:"0.74rem", fontWeight:700, cursor:"pointer" }}>🗑</button>
          </div>
        </div>

        <div style={{ padding:"1.25rem" }}>
          <DrawerSection title="Contact">
            <DrawerRow icon="📧" label="Email"   val={patient.email}/>
            <DrawerRow icon="📞" label="Phone"   val={patient.phone}/>
            <DrawerRow icon="🏠" label="Address" val={patient.address}/>
          </DrawerSection>
          <DrawerSection title="Medical">
            <DrawerRow icon="🩺" label="Diagnosis"  val={patient.diagnosis}/>
            <DrawerRow icon="⚖️" label="Weight"     val={patient.weight}/>
            <DrawerRow icon="📏" label="Height"     val={patient.height}/>
            <DrawerRow icon="💊" label="Allergies"  val={patient.allergies||"None"}/>
          </DrawerSection>
          <DrawerSection title="Emergency Contact">
            <DrawerRow icon="🚨" label="Contact" val={patient.emergencyContact}/>
          </DrawerSection>
          {patient.dob && (
            <DrawerSection title="Demographics">
              <DrawerRow icon="🎂" label="DOB" val={patient.dob}/>
            </DrawerSection>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerSection({ title, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:"0.6rem", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:7 }}>{title}</div>
      <div style={{ background:"#f8fafc", borderRadius:10, padding:"10px 12px", border:"1px solid #f1f5f9", display:"flex", flexDirection:"column", gap:8 }}>{children}</div>
    </div>
  );
}
function DrawerRow({ icon, label, val }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
      <span style={{ fontSize:"0.8rem", width:18, flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:"0.63rem", color:"#94a3b8", fontWeight:600, width:80, flexShrink:0, paddingTop:1 }}>{label}</span>
      <span style={{ fontSize:"0.74rem", color:"#0f172a", fontWeight:600, flex:1, lineHeight:1.4 }}>{val||"—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE CONFIRM
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirm({ patient, onCancel, onConfirm }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.65)", backdropFilter:"blur(5px)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:18, padding:"2rem", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 28px 70px rgba(0,0,0,.22)", animation:"slideUp .2s ease" }}>
        <div style={{ width:54, height:54, borderRadius:"50%", background:"#fff1f2", border:"2px solid #fecdd3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", margin:"0 auto 14px" }}>🗑️</div>
        <div style={{ fontSize:"1rem", fontWeight:800, color:"#0f172a", marginBottom:6 }}>Remove Patient?</div>
        <div style={{ fontSize:"0.75rem", color:"#64748b", marginBottom:22, lineHeight:1.65 }}>
          This will permanently remove <strong>{patient.name}</strong> and all their medical records. This cannot be undone.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"10px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:"#ef4444", color:"#fff", fontSize:"0.8rem", fontWeight:700, cursor:"pointer" }}>Yes, Remove</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE — AdminPatients
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPatients() {
  const [patients,   setPatients]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterStat, setFilterStat] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterBG,   setFilterBG]   = useState("All");
  const [sortBy,     setSortBy]     = useState("name");
  const [viewMode,   setViewMode]   = useState("table");
  const [modal,      setModal]      = useState(null);
  const [drawer,     setDrawer]     = useState(null);
  const [delTarget,  setDelTarget]  = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3200);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    if (!API.USE_REAL_API) {
      setTimeout(() => { setPatients(DUMMY_PATIENTS); setLoading(false); }, 480);
      return;
    }
    apiFetch("GET", API.EP.list)
      .then(d=>{ setPatients(d); setLoading(false); })
      .catch(()=>{ setPatients(DUMMY_PATIENTS); setLoading(false); });
  }, []);

  // Stats
  const total      = patients.length;
  const admitted   = patients.filter(p=>p.status==="Admitted").length;
  const outpatient = patients.filter(p=>p.status==="Outpatient").length;
  const discharged = patients.filter(p=>p.status==="Discharged").length;
  const critical   = patients.filter(p=>p.status==="Critical").length;

  // Filters
  const depts = ["All", ...Array.from(new Set(patients.map(p=>p.department)))];
  const filtered = patients
    .filter(p => filterStat==="All" || p.status===filterStat)
    .filter(p => filterDept==="All" || p.department===filterDept)
    .filter(p => filterBG==="All"   || p.bloodGroup===filterBG)
    .filter(p => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
        || p.id.toLowerCase().includes(q) || p.diagnosis?.toLowerCase().includes(q)
        || p.assignedDoctor?.toLowerCase().includes(q);
    })
    .sort((a,b) => {
      if (sortBy==="name")     return a.name.localeCompare(b.name);
      if (sortBy==="age")      return b.age - a.age;
      if (sortBy==="visits")   return b.visits - a.visits;
      if (sortBy==="admitted") return new Date(b.admitDate||0) - new Date(a.admitDate||0);
      return 0;
    });

  // CRUD
  const handleSave = (p) => {
    setPatients(prev => {
      const idx = prev.findIndex(x=>x.id===p.id);
      if (idx>=0) { const n=[...prev]; n[idx]=p; return n; }
      return [...prev, p];
    });
    setModal(null);
    showToast(modal.mode==="edit" ? `${p.name}'s record updated` : `${p.name} registered successfully`);
  };

  const handleDelete = async () => {
    if (API.USE_REAL_API) await apiFetch("DELETE", `/patients/${delTarget.id}`).catch(()=>{});
    setPatients(prev=>prev.filter(p=>p.id!==delTarget.id));
    if (drawer?.id===delTarget.id) setDrawer(null);
    showToast(`${delTarget.name} removed`, "error");
    setDelTarget(null);
  };

  const handleStatusChange = async (pat, newStatus) => {
    if (API.USE_REAL_API) await apiFetch("PATCH", `/patients/${pat.id}/status`, { status: newStatus }).catch(()=>{});
    const updated = { ...pat, status: newStatus };
    setPatients(prev=>prev.map(p=>p.id===pat.id ? updated : p));
    if (drawer?.id===pat.id) setDrawer(updated);
    showToast(`${pat.name} → ${newStatus}`);
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

        .pat-root { animation: fadeUp .35s ease; font-family:'Sora',sans-serif; }
        .pat-stat { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1rem 1.2rem; display:flex; align-items:flex-start; gap:12px; position:relative; overflow:hidden; transition:box-shadow .2s,transform .2s; cursor:default; }
        .pat-stat:hover { box-shadow:0 8px 24px rgba(0,0,0,.08); transform:translateY(-2px); }
        .pat-row { transition:background .12s; cursor:pointer; }
        .pat-row:hover td { background:#f8fafc; }
        .pat-grid-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.2rem; transition:box-shadow .2s,transform .2s; cursor:pointer; }
        .pat-grid-card:hover { box-shadow:0 10px 30px rgba(0,0,0,.09); transform:translateY(-2px); }
        .pat-act { width:29px; height:29px; border-radius:8px; border:1.5px solid #e2e8f0; background:#f8fafc; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.78rem; transition:background .15s; }
        .pat-act:hover { background:#f1f5f9; }
        .pat-chip { padding:5px 13px; border-radius:99px; font-size:0.71rem; font-weight:600; cursor:pointer; border:1.5px solid transparent; transition:all .15s; font-family:'Sora',sans-serif; }
      `}</style>

      <div className="pat-root">

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.5rem", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#0f172a" }}>Patients</div>
            <div style={{ fontSize:"0.72rem", color:"#94a3b8", marginTop:3 }}>Manage all patient records · {total} registered</div>
          </div>
          <button
            onClick={()=>setModal({mode:"create", patient:null})}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#0f172a,#0ea5e9)", color:"#fff", fontSize:"0.82rem", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(14,165,233,.3)", transition:"transform .15s,box-shadow .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 22px rgba(14,165,233,.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(14,165,233,.3)";}}
          >
            <span style={{ fontSize:"1rem" }}>+</span> Register Patient
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:"1.5rem" }}>
          {[
            { label:"Total Patients",  val:total,      icon:"🧑",  color:"#0ea5e9" },
            { label:"Admitted",        val:admitted,   icon:"🏥",  color:"#6366f1" },
            { label:"Outpatient",      val:outpatient, icon:"🚶",  color:"#14b8a6" },
            { label:"Discharged",      val:discharged, icon:"✅",  color:"#94a3b8" },
            { label:"Critical",        val:critical,   icon:"🚨",  color:"#ef4444" },
          ].map(s=>(
            <div key={s.label} className="pat-stat" onClick={()=>setFilterStat(s.label==="Total Patients"?"All":s.label)}>
              <div style={{ width:40, height:40, borderRadius:10, background:s.color+"18", color:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:"0.59rem", color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>{s.label}</div>
                {loading ? <Skel h={24} w={50} r={5}/> : <div style={{ fontSize:"1.35rem", fontWeight:800, color:"#0f172a", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{s.val}</div>}
              </div>
              <div style={{ position:"absolute", top:0, right:0, width:60, height:60, borderRadius:"50%", background:s.color+"08", transform:"translate(30%,-30%)", pointerEvents:"none" }}/>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:"1rem 1.25rem", marginBottom:"1.25rem", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>

          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:9, padding:"6px 12px", flex:1, minWidth:200 }}>
            <span style={{ color:"#94a3b8", fontSize:"0.85rem" }}>🔍</span>
            <input
              placeholder="Search name, ID, diagnosis, doctor…"
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ border:"none", background:"transparent", fontSize:"0.78rem", color:"#0f172a", fontFamily:"'Sora',sans-serif", outline:"none", width:"100%" }}
            />
            {search && <span onClick={()=>setSearch("")} style={{ color:"#94a3b8", cursor:"pointer" }}>✕</span>}
          </div>

          {/* Status chips */}
          <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
            {["All","Admitted","Outpatient","Discharged","Critical"].map(s=>(
              <button key={s} className="pat-chip"
                onClick={()=>setFilterStat(s)}
                style={{ background:filterStat===s?"#0f172a":"#f8fafc", color:filterStat===s?"#fff":"#64748b", borderColor:filterStat===s?"#0f172a":"#e2e8f0" }}
              >{s}</button>
            ))}
          </div>

          {/* Dept filter */}
          <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{ padding:"6px 10px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#f8fafc", fontSize:"0.75rem", color:"#475569", fontFamily:"'Sora',sans-serif", cursor:"pointer", outline:"none" }}>
            {depts.map(d=><option key={d}>{d}</option>)}
          </select>

          {/* Blood group filter */}
          <select value={filterBG} onChange={e=>setFilterBG(e.target.value)} style={{ padding:"6px 10px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#f8fafc", fontSize:"0.75rem", color:"#475569", fontFamily:"'Sora',sans-serif", cursor:"pointer", outline:"none" }}>
            <option value="All">All Blood Groups</option>
            {BLOOD_GROUPS.map(b=><option key={b}>{b}</option>)}
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"6px 10px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#f8fafc", fontSize:"0.75rem", color:"#475569", fontFamily:"'Sora',sans-serif", cursor:"pointer", outline:"none" }}>
            <option value="name">Sort: Name</option>
            <option value="age">Sort: Age</option>
            <option value="visits">Sort: Visits</option>
            <option value="admitted">Sort: Admit Date</option>
          </select>

          {/* View toggle */}
          <div style={{ display:"flex", background:"#f1f5f9", borderRadius:9, padding:3, gap:2, flexShrink:0 }}>
            {[["table","☰"],["grid","⊞"]].map(([m,ic])=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{ width:32, height:30, borderRadius:7, border:"none", background:viewMode===m?"#fff":"transparent", color:viewMode===m?"#0f172a":"#94a3b8", cursor:"pointer", fontSize:"0.9rem", boxShadow:viewMode===m?"0 1px 3px rgba(0,0,0,.08)":"none", transition:"all .15s" }}>{ic}</button>
            ))}
          </div>

          <div style={{ fontSize:"0.7rem", color:"#94a3b8", flexShrink:0 }}>{filtered.length} result{filtered.length!==1?"s":""}</div>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode==="table" && (
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                    {["Patient","Blood","Department","Assigned Doctor","Diagnosis","Visits","Status","Actions"].map(h=>(
                      <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#94a3b8", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array(5).fill(0).map((_,i)=>(
                      <tr key={i}><td colSpan={8} style={{ padding:"14px" }}><Skel h={34} r={6}/></td></tr>
                    ))
                    : filtered.length===0
                      ? <tr><td colSpan={8} style={{ padding:"3rem", textAlign:"center", color:"#94a3b8", fontSize:"0.8rem" }}>No patients match your filters</td></tr>
                      : filtered.map(pat=>(
                        <tr key={pat.id} className="pat-row" onClick={()=>setDrawer(pat)}>
                          <td style={{ padding:"11px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:34, height:34, borderRadius:9, background:avatarColor(pat.avatar), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.62rem", fontWeight:800, flexShrink:0 }}>{pat.avatar}</div>
                              <div>
                                <div style={{ fontSize:"0.78rem", fontWeight:700, color:"#0f172a" }}>{pat.name}</div>
                                <div style={{ fontSize:"0.61rem", color:"#94a3b8" }}>{pat.id} · {pat.age}y · {pat.gender}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"11px 14px" }}><BloodBadge bg={pat.bloodGroup}/></td>
                          <td style={{ padding:"11px 14px", fontSize:"0.73rem", color:"#475569" }}>{pat.department}</td>
                          <td style={{ padding:"11px 14px", fontSize:"0.73rem", color:"#475569" }}>{pat.assignedDoctor}</td>
                          <td style={{ padding:"11px 14px", fontSize:"0.73rem", color:"#0f172a", maxWidth:160 }}>
                            <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pat.diagnosis}</div>
                          </td>
                          <td style={{ padding:"11px 14px", fontSize:"0.8rem", fontWeight:700, color:"#0f172a", fontFamily:"'JetBrains Mono',monospace" }}>{pat.visits}</td>
                          <td style={{ padding:"11px 14px" }}><StatusPill status={pat.status}/></td>
                          <td style={{ padding:"11px 14px" }} onClick={e=>e.stopPropagation()}>
                            <div style={{ display:"flex", gap:5 }}>
                              <div title="Edit" className="pat-act" onClick={()=>setModal({mode:"edit", patient:pat})}>✏️</div>
                              <div title="Delete" className="pat-act" style={{ borderColor:"#fecdd3", background:"#fff1f2" }} onClick={()=>setDelTarget(pat)}>🗑</div>
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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))", gap:14 }}>
            {loading
              ? Array(6).fill(0).map((_,i)=>(
                <div key={i} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:"1.2rem" }}><Skel h={110}/></div>
              ))
              : filtered.length===0
                ? <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:"#94a3b8", fontSize:"0.8rem" }}>No patients match your filters</div>
                : filtered.map(pat=>(
                  <div key={pat.id} className="pat-grid-card" onClick={()=>setDrawer(pat)}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:42, height:42, borderRadius:11, background:avatarColor(pat.avatar), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.82rem", fontWeight:800, boxShadow:`0 4px 12px ${avatarColor(pat.avatar)}44`, flexShrink:0 }}>{pat.avatar}</div>
                        <div>
                          <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#0f172a" }}>{pat.name}</div>
                          <div style={{ fontSize:"0.62rem", color:"#94a3b8" }}>{pat.id} · {pat.age}y · {pat.gender}</div>
                        </div>
                      </div>
                      <BloodBadge bg={pat.bloodGroup}/>
                    </div>

                    <div style={{ fontSize:"0.7rem", color:"#6366f1", fontWeight:600, marginBottom:4 }}>{pat.department}</div>
                    <div style={{ fontSize:"0.68rem", color:"#475569", marginBottom:4 }}>👨‍⚕️ {pat.assignedDoctor}</div>
                    <div style={{ fontSize:"0.68rem", color:"#0f172a", fontWeight:600, marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>🩺 {pat.diagnosis}</div>

                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:12 }}>
                      {[["Visits",pat.visits,"🔁"],["Age",`${pat.age}y`,"👤"],["Admit",pat.admitDate?.slice(5),"📅"]].map(([l,v,i])=>(
                        <div key={l} style={{ background:"#f8fafc", borderRadius:8, padding:"6px", textAlign:"center" }}>
                          <div style={{ fontSize:"0.8rem" }}>{i}</div>
                          <div style={{ fontSize:"0.73rem", fontWeight:700, color:"#0f172a", fontFamily:"'JetBrains Mono',monospace" }}>{v}</div>
                          <div style={{ fontSize:"0.56rem", color:"#94a3b8", fontWeight:600, textTransform:"uppercase" }}>{l}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <StatusPill status={pat.status}/>
                      <div style={{ display:"flex", gap:5 }} onClick={e=>e.stopPropagation()}>
                        <div className="pat-act" onClick={()=>setModal({mode:"edit", patient:pat})}>✏️</div>
                        <div className="pat-act" style={{ borderColor:"#fecdd3", background:"#fff1f2" }} onClick={()=>setDelTarget(pat)}>🗑</div>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        )}
      </div>

      {/* ── Overlays ── */}
      {modal && (
        <CreatePatient
          mode={modal.mode}
          patient={modal.patient}
          onClose={()=>setModal(null)}
          onSave={handleSave}
        />
      )}
      {drawer && (
        <PatientDrawer
          patient={drawer}
          onClose={()=>setDrawer(null)}
          onEdit={()=>{ setModal({mode:"edit", patient:drawer}); setDrawer(null); }}
          onDelete={p=>{ setDelTarget(p); setDrawer(null); }}
          onStatusChange={handleStatusChange}
        />
      )}
      {delTarget && (
        <DeleteConfirm
          patient={delTarget}
          onCancel={()=>setDelTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:2000, display:"flex", alignItems:"center", gap:10, padding:"12px 18px", borderRadius:12, background:toast.type==="error"?"#fff1f2":"#f0fdf4", border:`1px solid ${toast.type==="error"?"#fecdd3":"#bbf7d0"}`, color:toast.type==="error"?"#be123c":"#15803d", fontSize:"0.78rem", fontWeight:700, boxShadow:"0 8px 24px rgba(0,0,0,.12)", animation:"toastIn .3s ease", fontFamily:"'Sora',sans-serif" }}>
          <span>{toast.type==="error"?"❌":"✅"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}