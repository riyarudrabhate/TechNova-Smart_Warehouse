import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════
const C = {
  bg: "#F1F5F9",
  bgAlt: "#E8EEF5",
  white: "#FFFFFF",
  border: "#E2E8F0",
  borderMed: "#CBD5E1",
  // Blues
  blue900: "#1E3A8A",
  blue800: "#1D4ED8",
  blue700: "#2563EB",
  blue600: "#3B82F6",
  blue100: "#DBEAFE",
  blue50:  "#EFF6FF",
  // Text
  ink:   "#0F172A",
  inkMid:"#334155",
  inkSub:"#64748B",
  inkFaint:"#94A3B8",
  // Status
  green:  "#15803D", greenBg: "#F0FDF4", greenBd: "#BBF7D0",
  yellow: "#92400E", yellowBg:"#FFFBEB", yellowBd:"#FDE68A",
  orange: "#C2410C", orangeBg:"#FFF7ED", orangeBd:"#FED7AA",
  red:    "#B91C1C", redBg:   "#FEF2F2", redBd:   "#FECACA",
  purple: "#6D28D9", purpleBg:"#F5F3FF", purpleBd:"#DDD6FE",
  // Shadows
  s1: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
  s2: "0 4px 16px rgba(15,23,42,0.08)",
  s3: "0 12px 40px rgba(15,23,42,0.12)",
};

// ═══════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════
const INIT_WAREHOUSES = [
  { id: "WH01", name: "Grain Central", location: "Ludhiana, Punjab", capacity: 10000, used: 7200, type: "Dry Storage", status: "Active", manager: "Deepak S." },
  { id: "WH02", name: "VegFresh Hub",  location: "Nashik, Maharashtra", capacity: 4000, used: 2710, type: "Controlled Atmosphere", status: "Active", manager: "Anita R." },
  { id: "WH03", name: "ColdChain Pro", location: "Pune, Maharashtra",   capacity: 3000, used: 800,  type: "Cold Storage",  status: "Active", manager: "Ramesh P." },
  { id: "WH04", name: "South Depot",   location: "Bangalore, Karnataka", capacity: 6000, used: 5700, type: "Dry Storage",   status: "Active", manager: "Kavitha M." },
];

const INIT_INVENTORY = [
  { id: "INV001", warehouseId: "WH01", produce: "Wheat",        qty: 3200, unit: "kg", storageDate: "2025-01-10", shelfLife: 180, idealTempMin: 15, idealTempMax: 22, currentTemp: 19, humidity: 52, status: "Optimal" },
  { id: "INV002", warehouseId: "WH01", produce: "Rice (Basmati)",qty: 2800, unit: "kg", storageDate: "2025-01-15", shelfLife: 365, idealTempMin: 16, idealTempMax: 24, currentTemp: 21, humidity: 50, status: "Optimal" },
  { id: "INV003", warehouseId: "WH01", produce: "Maize",         qty: 1200, unit: "kg", storageDate: "2025-02-01", shelfLife: 150, idealTempMin: 18, idealTempMax: 26, currentTemp: 29, humidity: 60, status: "Warning" },
  { id: "INV004", warehouseId: "WH02", produce: "Tomatoes",      qty: 340,  unit: "kg", storageDate: "2025-02-21", shelfLife: 14,  idealTempMin: 10, idealTempMax: 15, currentTemp: 13, humidity: 88, status: "Expiring" },
  { id: "INV005", warehouseId: "WH02", produce: "Onions",        qty: 870,  unit: "kg", storageDate: "2025-01-20", shelfLife: 90,  idealTempMin: 12, idealTempMax: 18, currentTemp: 15, humidity: 65, status: "Optimal" },
  { id: "INV006", warehouseId: "WH02", produce: "Potatoes",      qty: 1500, unit: "kg", storageDate: "2025-01-25", shelfLife: 90,  idealTempMin: 8,  idealTempMax: 14, currentTemp: 10, humidity: 80, status: "Optimal" },
  { id: "INV007", warehouseId: "WH03", produce: "Mangoes",       qty: 220,  unit: "kg", storageDate: "2025-02-20", shelfLife: 21,  idealTempMin: 5,  idealTempMax: 10, currentTemp: 14, humidity: 90, status: "Warning" },
  { id: "INV008", warehouseId: "WH03", produce: "Apples",        qty: 580,  unit: "kg", storageDate: "2025-01-30", shelfLife: 90,  idealTempMin: 2,  idealTempMax: 8,  currentTemp: 5,  humidity: 92, status: "Optimal" },
  { id: "INV009", warehouseId: "WH04", produce: "Soybeans",      qty: 5600, unit: "kg", storageDate: "2025-01-05", shelfLife: 200, idealTempMin: 16, idealTempMax: 22, currentTemp: 20, humidity: 54, status: "Overstock" },
  { id: "INV010", warehouseId: "WH04", produce: "Chickpeas",     qty: 100,  unit: "kg", storageDate: "2025-02-10", shelfLife: 300, idealTempMin: 18, idealTempMax: 25, currentTemp: 21, humidity: 52, status: "Understock" },
];

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
const daysInStorage = (dateStr) => Math.floor((Date.now() - new Date(dateStr)) / 86400000);
const daysLeft = (dateStr, shelfLife) => Math.max(0, shelfLife - daysInStorage(dateStr));
const pct = (used, cap) => Math.min(100, Math.round((used / cap) * 100));

const statusMeta = {
  Optimal:   { bg: C.greenBg,  text: C.green,  border: C.greenBd  },
  Good:      { bg: C.blue50,   text: C.blue800, border: C.blue100  },
  Warning:   { bg: C.yellowBg, text: C.yellow, border: C.yellowBd },
  Expiring:  { bg: C.orangeBg, text: C.orange, border: C.orangeBd },
  Overstock: { bg: C.purpleBg, text: C.purple, border: C.purpleBd },
  Understock:{ bg: C.redBg,    text: C.red,    border: C.redBd    },
};

function autoStatus(item) {
  const dl = daysLeft(item.storageDate, item.shelfLife);
  const cap = INIT_WAREHOUSES.find(w => w.id === item.warehouseId)?.capacity || 10000;
  if (dl <= 7) return "Expiring";
  if (item.currentTemp > item.idealTempMax + 2 || item.currentTemp < item.idealTempMin - 2) return "Warning";
  if (item.qty > cap * 0.80) return "Overstock";
  if (item.qty < 200) return "Understock";
  return "Optimal";
}

// ═══════════════════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════════════════
const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.ink}; font-family: 'Lato', sans-serif; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-thumb { background: ${C.borderMed}; border-radius: 4px; }
  input, select, textarea, button { font-family: 'Lato', sans-serif; }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #fff inset !important; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  @keyframes dropIn   { from { opacity:0; transform:translateY(-6px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes toastUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  .page-enter { animation: fadeUp 0.35s ease both; }
  .nav-btn:hover { background: ${C.blue50} !important; color: ${C.blue700} !important; }
  .row-hover:hover td { background: ${C.bgAlt} !important; }
  .card-hover:hover { box-shadow: ${C.s2} !important; transform: translateY(-1px); }
`;

function Badge({ label, status }) {
  const m = statusMeta[status] || statusMeta.Good;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20,
      fontSize:11, fontWeight:700, letterSpacing:.4,
      background:m.bg, color:m.text, border:`1px solid ${m.border}` }}>
      {label || status}
    </span>
  );
}

function ProgressBar({ value, color = C.blue700, thin = false }) {
  return (
    <div style={{ background: C.border, borderRadius: 6, height: thin ? 5 : 8, overflow:"hidden" }}>
      <div style={{ width:`${Math.min(100,value)}%`, height:"100%", background: color,
        borderRadius:6, transition:"width .7s ease" }} />
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${active ? C.blue700 : C.borderMed}`,
      background: active ? C.blue50 : C.white, color: active ? C.blue700 : C.inkSub,
      fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s" }}>
      {label}
    </button>
  );
}

function Btn({ children, variant="primary", size="md", style:s, ...p }) {
  const base = { display:"inline-flex", alignItems:"center", gap:6, borderRadius:8, fontWeight:600, cursor:"pointer", transition:"all .15s", border:"none" };
  const sizes = { sm: { padding:"6px 12px", fontSize:12 }, md: { padding:"9px 18px", fontSize:13 }, lg: { padding:"12px 24px", fontSize:14 } };
  const variants = {
    primary:   { background: C.blue700, color:"#fff" },
    secondary: { background: C.white, color: C.inkMid, border:`1px solid ${C.borderMed}` },
    ghost:     { background:"transparent", color: C.blue700 },
    danger:    { background: C.redBg, color: C.red, border:`1px solid ${C.redBd}` },
  };
  return <button {...p} style={{ ...base, ...sizes[size], ...variants[variant], ...s }}
    onMouseEnter={e=>e.currentTarget.style.opacity=".82"}
    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.inkMid, marginBottom:5, letterSpacing:.3 }}>
        {label}{required && <span style={{ color:C.red }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ ...p }) {
  return <input {...p} style={{ width:"100%", background:C.white, border:`1.5px solid ${C.borderMed}`,
    borderRadius:8, padding:"9px 12px", color:C.ink, fontSize:13, outline:"none", transition:"border .15s", ...p.style }}
    onFocus={e=>e.target.style.borderColor=C.blue700}
    onBlur={e=>e.target.style.borderColor=C.borderMed} />;
}

function SelectInput({ options, ...p }) {
  return <select {...p} style={{ width:"100%", background:C.white, border:`1.5px solid ${C.borderMed}`,
    borderRadius:8, padding:"9px 12px", color:C.ink, fontSize:13, outline:"none", ...p.style }}>
    {options.map(o => typeof o === "string" ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}

function Modal({ open, title, onClose, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.35)", backdropFilter:"blur(4px)",
      zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:width, background:C.white, borderRadius:16,
        boxShadow:C.s3, animation:"dropIn .25s ease" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:16, color:C.ink }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, color:C.inkSub, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
      background: toast.ok ? C.green : C.red,
      color:"#fff", padding:"11px 22px", borderRadius:10, fontSize:13, fontWeight:600,
      boxShadow:C.s3, zIndex:999, animation:"toastUp .3s ease", whiteSpace:"nowrap",
      display:"flex", alignItems:"center", gap:8 }}>
      {toast.ok ? "✓" : "✗"} {toast.msg}
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20 }}>
      <div>
        <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:20, fontWeight:800, color:C.ink, letterSpacing:"-.3px" }}>{title}</h2>
        {sub && <p style={{ fontSize:13, color:C.inkSub, marginTop:3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// AUTH PAGE
// ═══════════════════════════════════════════════════════
const USERS = [
  { id:1, email:"admin@agrivault.com", password:"admin123", name:"Rajan Mehta",  role:"Warehouse Manager",  avatar:"RM" },
  { id:2, email:"ops@agrivault.com",   password:"ops123",   name:"Priya Sharma", role:"Operations Lead",    avatar:"PS" },
];

function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [f, setF] = useState({ email:"", password:"", name:"", role:"Warehouse Manager" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const login = () => {
    setErr(""); setLoading(true);
    setTimeout(() => {
      const u = USERS.find(u=>u.email===f.email&&u.password===f.password);
      if (u) onLogin(u); else setErr("Invalid email or password.");
      setLoading(false);
    }, 800);
  };

  const register = () => {
    if (!f.name||!f.email||!f.password) { setErr("All fields are required."); return; }
    setLoading(true);
    setTimeout(() => {
      const u = { id:Date.now(), ...f, avatar:f.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() };
      USERS.push(u); onLogin(u);
    }, 800);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", fontFamily:"'Lato',sans-serif" }}>
      <style>{GS}</style>

      {/* Left brand panel */}
      <div style={{ width:"42%", background:`linear-gradient(150deg, ${C.blue900} 0%, ${C.blue800} 55%, ${C.blue600} 100%)`,
        padding:"52px 56px", display:"flex", flexDirection:"column", justifyContent:"space-between",
        position:"relative", overflow:"hidden", flexShrink:0 }}>
        {/* decorative rings */}
        {[["-100px","60%",400],["-60px","-80px",280],["70%","85%",200]].map(([t,l,sz],i) => (
          <div key={i} style={{ position:"absolute", top:t, left:l, width:sz, height:sz, borderRadius:"50%",
            border:"1px solid rgba(255,255,255,.09)", pointerEvents:"none" }} />
        ))}
        <div style={{ position:"relative", zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:60 }}>
            <div style={{ width:42, height:42, background:"rgba(255,255,255,.15)", borderRadius:10,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🌾</div>
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:19, color:"#fff" }}>AgriVault</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.45)", letterSpacing:2, textTransform:"uppercase" }}>Warehouse OS</div>
            </div>
          </div>
          <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:32, fontWeight:800,
            color:"#fff", lineHeight:1.2, letterSpacing:"-.6px", marginBottom:16 }}>
            Smart Agricultural<br/>Warehouse<br/>Management
          </div>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", lineHeight:1.75, maxWidth:300 }}>
            Minimize post-harvest losses, track real-time inventory, and optimize supply chain efficiency across all storage facilities.
          </p>
        </div>

        <div style={{ position:"relative", zIndex:1 }}>
          {[
            { icon:"🏭", label:"Multi-warehouse management" },
            { icon:"📊", label:"Live inventory & expiry tracking" },
            { icon:"💡", label:"AI-powered smart suggestions" },
            { icon:"🌡️", label:"Storage condition monitoring" },
          ].map(f => (
            <div key={f.label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:30, height:30, background:"rgba(255,255,255,.12)", borderRadius:7,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{f.icon}</div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,.65)", fontWeight:400 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 64px" }}>
        <div style={{ width:"100%", maxWidth:400 }}>
          {/* Tab switcher */}
          <div style={{ display:"flex", background:C.bgAlt, borderRadius:10, padding:3, marginBottom:32 }}>
            {[["login","Sign In"],["register","Register"]].map(([t,l]) => (
              <button key={t} onClick={()=>{setTab(t);setErr("");}} style={{ flex:1, padding:"9px", border:"none",
                borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700, transition:"all .2s",
                background: tab===t ? C.white : "transparent",
                color: tab===t ? C.blue800 : C.inkSub,
                boxShadow: tab===t ? C.s1 : "none" }}>{l}</button>
            ))}
          </div>

          {tab === "login" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ marginBottom:4 }}>
                <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:24, fontWeight:800, color:C.ink, letterSpacing:"-.4px" }}>Welcome back</h1>
                <p style={{ fontSize:13, color:C.inkSub, marginTop:4 }}>Sign in to your AgriVault account</p>
              </div>
              <Field label="Email Address"><TextInput type="email" placeholder="admin@agrivault.com" value={f.email} onChange={e=>set("email",e.target.value)} /></Field>
              <Field label="Password"><TextInput type="password" placeholder="••••••••" value={f.password} onChange={e=>set("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} /></Field>
              {err && <div style={{ background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:8, padding:"10px 14px", color:C.red, fontSize:13 }}>⚠ {err}</div>}
              <Btn onClick={login} disabled={loading} s={{ width:"100%", justifyContent:"center", padding:"11px" }}>
                {loading ? <span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block" }} /> : "Sign In →"}
              </Btn>
              <div style={{ textAlign:"center", fontSize:12, color:C.inkFaint, padding:"8px 12px",
                background:C.bgAlt, borderRadius:8, border:`1px solid ${C.border}` }}>
                Demo: <strong style={{ color:C.inkMid }}>admin@agrivault.com</strong> / <strong style={{ color:C.inkMid }}>admin123</strong>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ marginBottom:4 }}>
                <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:24, fontWeight:800, color:C.ink, letterSpacing:"-.4px" }}>Create Account</h1>
                <p style={{ fontSize:13, color:C.inkSub, marginTop:4 }}>Join the AgriVault platform</p>
              </div>
              <Field label="Full Name" required><TextInput placeholder="Your full name" value={f.name} onChange={e=>set("name",e.target.value)} /></Field>
              <Field label="Email Address" required><TextInput type="email" placeholder="you@company.com" value={f.email} onChange={e=>set("email",e.target.value)} /></Field>
              <Field label="Password" required><TextInput type="password" placeholder="Minimum 6 characters" value={f.password} onChange={e=>set("password",e.target.value)} /></Field>
              <Field label="Role">
                <SelectInput value={f.role} onChange={e=>set("role",e.target.value)}
                  options={["Warehouse Manager","Operations Lead","Inventory Analyst","Logistics Coordinator","Supervisor"]} />
              </Field>
              {err && <div style={{ background:C.redBg, border:`1px solid ${C.redBd}`, borderRadius:8, padding:"10px 14px", color:C.red, fontSize:13 }}>⚠ {err}</div>}
              <Btn onClick={register} disabled={loading} s={{ width:"100%", justifyContent:"center", padding:"11px" }}>
                {loading ? <span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block" }} /> : "Create Account →"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DASHBOARD PAGES
// ═══════════════════════════════════════════════════════

// ── 1. OVERVIEW ──────────────────────────────────────
function OverviewPage({ warehouses, inventory }) {
  const totalCap = warehouses.reduce((s,w)=>s+w.capacity,0);
  const totalUsed = warehouses.reduce((s,w)=>s+w.used,0);
  const alerts = inventory.map(i=>({ ...i, days: daysLeft(i.storageDate,i.shelfLife), status: autoStatus(i) }))
    .filter(i=>i.status!=="Optimal");

  const kpis = [
    { label:"Total Warehouses",  value: warehouses.length,  sub:`${warehouses.filter(w=>w.status==="Active").length} active`, icon:"🏭", accent:`linear-gradient(90deg,${C.blue800},${C.blue600})` },
    { label:"Total Capacity",    value:`${(totalCap/1000).toFixed(0)}T`, sub:"across all blocks", icon:"📦", accent:`linear-gradient(90deg,${C.purple},#8B5CF6)` },
    { label:"Current Stock",     value:`${(totalUsed/1000).toFixed(1)}T`, sub:`${pct(totalUsed,totalCap)}% utilized`, icon:"🗂", accent:`linear-gradient(90deg,${C.green},#22C55E)` },
    { label:"Active Alerts",     value: alerts.length,  sub:`${alerts.filter(a=>a.status==="Expiring").length} expiring soon`, icon:"⚠️", accent:`linear-gradient(90deg,${C.orange},#F97316)` },
    { label:"Total SKUs",        value: inventory.length, sub:"across all warehouses", icon:"🌾", accent:`linear-gradient(90deg,#0369A1,${C.blue600})` },
  ];

  return (
    <div className="page-enter">
      <SectionHeader title="Operations Overview" sub="Real-time summary across all facilities" />

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, marginBottom:24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12,
            padding:"20px", boxShadow:C.s1, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:k.accent }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.inkSub, textTransform:"uppercase", letterSpacing:.6, marginBottom:8 }}>{k.label}</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:28, fontWeight:800, color:C.ink, letterSpacing:"-.5px" }}>{k.value}</div>
                <div style={{ fontSize:12, color:C.blue700, marginTop:5, fontWeight:500 }}>{k.sub}</div>
              </div>
              <span style={{ fontSize:24 }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {/* Warehouse utilization */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:C.s1 }}>
          <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14, color:C.ink, marginBottom:18 }}>Warehouse Utilization</h3>
          {warehouses.map(w => {
            const p = pct(w.used,w.capacity);
            const color = p>90?C.red:p>70?C.orange:C.blue700;
            return (
              <div key={w.id} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                  <span style={{ fontWeight:600, color:C.ink }}>{w.name}</span>
                  <span style={{ color, fontWeight:700 }}>{p}%</span>
                </div>
                <ProgressBar value={p} color={color} />
                <div style={{ fontSize:11, color:C.inkFaint, marginTop:4 }}>{w.used.toLocaleString()} / {w.capacity.toLocaleString()} kg · {w.location}</div>
              </div>
            );
          })}
        </div>

        {/* Alert summary */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:C.s1 }}>
          <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14, color:C.ink, marginBottom:16 }}>Alert Summary</h3>
          {alerts.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 0", color:C.inkFaint }}>
              <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
              <div style={{ fontSize:13 }}>All inventory in healthy condition</div>
            </div>
          ) : alerts.slice(0,6).map(a => {
            const m = statusMeta[a.status];
            return (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                borderRadius:8, background:m.bg, border:`1px solid ${m.border}`, marginBottom:8 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:m.text, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{a.produce}</div>
                  <div style={{ fontSize:11, color:C.inkSub }}>{a.status} · {a.days}d left · {warehouses.find(w=>w.id===a.warehouseId)?.name}</div>
                </div>
                <Badge label={a.status} status={a.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 2. WAREHOUSES PAGE ───────────────────────────────
function WarehousesPage({ warehouses, setWarehouses, inventory, showToast }) {
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name:"", location:"", capacity:"", type:"Dry Storage", manager:"", status:"Active" });
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const openAdd = () => { setSelected(null); setForm({ name:"", location:"", capacity:"", type:"Dry Storage", manager:"", status:"Active" }); setModal(true); };
  const openEdit = (w) => { setSelected(w); setForm({ ...w, capacity: String(w.capacity) }); setModal(true); };

  const save = () => {
    if (!form.name||!form.location||!form.capacity) { showToast("Name, location and capacity are required.", false); return; }
    if (selected) {
      setWarehouses(p=>p.map(w=>w.id===selected.id?{...w,...form,capacity:+form.capacity}:w));
      showToast("Warehouse updated.");
    } else {
      const id = "WH"+String(warehouses.length+1).padStart(2,"0");
      setWarehouses(p=>[...p,{id,...form,capacity:+form.capacity,used:0}]);
      showToast("Warehouse added.");
    }
    setModal(false);
  };

  const remove = (id) => {
    setWarehouses(p=>p.filter(w=>w.id!==id));
    showToast("Warehouse removed.");
  };

  return (
    <div className="page-enter">
      <SectionHeader
        title="Warehouses"
        sub={`${warehouses.length} total facilities · ${warehouses.reduce((s,w)=>s+w.capacity,0).toLocaleString()} kg total capacity`}
        action={<Btn onClick={openAdd}>+ Add Warehouse</Btn>}
      />

      {/* Summary strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:22 }}>
        {[
          { label:"Total Warehouses", value:warehouses.length, color:C.blue700 },
          { label:"Total Capacity",   value:`${(warehouses.reduce((s,w)=>s+w.capacity,0)/1000).toFixed(0)}T`, color:C.green },
          { label:"Avg. Utilization", value:`${Math.round(warehouses.reduce((s,w)=>s+pct(w.used,w.capacity),0)/warehouses.length)}%`, color:C.orange },
        ].map(s => (
          <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px 20px", boxShadow:C.s1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.inkSub, textTransform:"uppercase", letterSpacing:.5, marginBottom:6 }}>{s.label}</div>
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Warehouse Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
        {warehouses.map(w => {
          const p = pct(w.used,w.capacity);
          const barColor = p>90?C.red:p>70?C.orange:C.blue700;
          const itemCount = inventory.filter(i=>i.warehouseId===w.id).length;
          return (
            <div key={w.id} className="card-hover" style={{ background:C.white, border:`1px solid ${C.border}`,
              borderRadius:14, padding:22, boxShadow:C.s1, transition:"all .2s", position:"relative", overflow:"hidden" }}>
              {/* Top accent */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${C.blue800},${C.blue600})` }} />

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:22 }}>🏭</span>
                    <div>
                      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, color:C.ink }}>{w.name}</div>
                      <div style={{ fontSize:11, color:C.inkSub, marginTop:1 }}>{w.id}</div>
                    </div>
                  </div>
                </div>
                <Badge label={w.status} status={w.status === "Active" ? "Optimal" : "Warning"} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[
                  { icon:"📍", label:"Location",    val:w.location },
                  { icon:"🏷",  label:"Type",        val:w.type },
                  { icon:"👤", label:"Manager",     val:w.manager },
                  { icon:"📦", label:"SKUs Stored", val:`${itemCount} item${itemCount!==1?"s":""}` },
                ].map(d => (
                  <div key={d.label} style={{ background:C.bgAlt, borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:10, color:C.inkFaint, fontWeight:700, textTransform:"uppercase", letterSpacing:.4, marginBottom:3 }}>{d.icon} {d.label}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.ink }}>{d.val}</div>
                  </div>
                ))}
              </div>

              {/* Capacity bar */}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                  <span style={{ color:C.inkSub, fontWeight:500 }}>Storage Capacity</span>
                  <span style={{ color:barColor, fontWeight:700 }}>{p}% used</span>
                </div>
                <ProgressBar value={p} color={barColor} />
                <div style={{ fontSize:11, color:C.inkFaint, marginTop:4 }}>{w.used.toLocaleString()} / {w.capacity.toLocaleString()} kg</div>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="secondary" size="sm" onClick={()=>openEdit(w)} s={{ flex:1, justifyContent:"center" }}>✏ Edit</Btn>
                <Btn variant="danger"    size="sm" onClick={()=>remove(w.id)} s={{ justifyContent:"center" }}>🗑</Btn>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal open={modal} title={selected?"Edit Warehouse":"Add Warehouse"} onClose={()=>setModal(false)}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Warehouse Name" required><TextInput placeholder="e.g. Grain Central" value={form.name} onChange={e=>setF("name",e.target.value)} /></Field>
            <Field label="Location" required><TextInput placeholder="City, State" value={form.location} onChange={e=>setF("location",e.target.value)} /></Field>
            <Field label="Storage Capacity (kg)" required><TextInput type="number" placeholder="e.g. 10000" value={form.capacity} onChange={e=>setF("capacity",e.target.value)} /></Field>
            <Field label="Storage Type"><SelectInput value={form.type} onChange={e=>setF("type",e.target.value)} options={["Dry Storage","Cold Storage","Controlled Atmosphere","Multi-Purpose"]} /></Field>
            <Field label="Manager Name"><TextInput placeholder="Full name" value={form.manager} onChange={e=>setF("manager",e.target.value)} /></Field>
            <Field label="Status"><SelectInput value={form.status} onChange={e=>setF("status",e.target.value)} options={["Active","Inactive","Under Maintenance"]} /></Field>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <Btn variant="secondary" onClick={()=>setModal(false)} s={{ flex:1, justifyContent:"center" }}>Cancel</Btn>
            <Btn onClick={save} s={{ flex:1, justifyContent:"center" }}>Save Warehouse</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── 3. INVENTORY PAGE ────────────────────────────────
function InventoryPage({ warehouses, inventory, setInventory, showToast }) {
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterWH, setFilterWH] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const blank = { warehouseId: warehouses[0]?.id||"", produce:"", qty:"", unit:"kg", storageDate:"", shelfLife:"", idealTempMin:"", idealTempMax:"", currentTemp:"", humidity:"" };
  const [form, setForm] = useState(blank);
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const openAdd = () => { setSelected(null); setForm(blank); setModal(true); };
  const openEdit = (i) => { setSelected(i); setForm({...i, qty:String(i.qty), shelfLife:String(i.shelfLife), idealTempMin:String(i.idealTempMin), idealTempMax:String(i.idealTempMax), currentTemp:String(i.currentTemp), humidity:String(i.humidity)}); setModal(true); };

  const save = () => {
    if (!form.produce||!form.qty||!form.storageDate||!form.warehouseId) { showToast("Required fields missing.", false); return; }
    const item = { ...form, qty:+form.qty, shelfLife:+form.shelfLife||90, idealTempMin:+form.idealTempMin||15, idealTempMax:+form.idealTempMax||25, currentTemp:+form.currentTemp||20, humidity:+form.humidity||60 };
    item.status = autoStatus(item);
    if (selected) {
      setInventory(p=>p.map(i=>i.id===selected.id?{...i,...item}:i));
      showToast("Inventory item updated.");
    } else {
      setInventory(p=>[{id:"INV"+String(Date.now()).slice(-4), ...item}, ...p]);
      showToast("Item added to inventory.");
    }
    setModal(false);
  };

  const remove = (id) => { setInventory(p=>p.filter(i=>i.id!==id)); showToast("Item removed."); };

  const filtered = inventory.filter(i => {
    const dl = daysLeft(i.storageDate,i.shelfLife);
    const s = autoStatus({...i});
    const matchSearch = i.produce.toLowerCase().includes(search.toLowerCase());
    const matchWH = filterWH==="All" || i.warehouseId===filterWH;
    const matchS = filterStatus==="All" || s===filterStatus;
    return matchSearch && matchWH && matchS;
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="page-enter">
      <SectionHeader
        title="Inventory"
        sub={`${inventory.length} items tracked across ${warehouses.length} warehouses`}
        action={<Btn onClick={openAdd}>+ Add Item</Btn>}
      />

      {/* Filters */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:18, alignItems:"center" }}>
        <input placeholder="🔍  Search produce…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, background:C.white, border:`1.5px solid ${C.borderMed}`,
            borderRadius:8, padding:"8px 12px", color:C.ink, fontSize:13, outline:"none" }}
          onFocus={e=>e.target.style.borderColor=C.blue700}
          onBlur={e=>e.target.style.borderColor=C.borderMed}
        />
        <SelectInput value={filterWH} onChange={e=>setFilterWH(e.target.value)}
          options={[{value:"All",label:"All Warehouses"},...warehouses.map(w=>({value:w.id,label:w.name}))]}
          style={{ width:190 }}
        />
        {["All","Optimal","Warning","Expiring","Overstock","Understock"].map(s => (
          <Chip key={s} label={s} active={filterStatus===s} onClick={()=>setFilterStatus(s)} />
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:C.s1 }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.bgAlt, borderBottom:`1px solid ${C.border}` }}>
                {["Produce","Warehouse","Quantity","Stored On","Shelf Life","Ideal Temp","Current Temp","Humidity","Days Left","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700,
                    color:C.inkSub, textTransform:"uppercase", letterSpacing:.5, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const dl = daysLeft(item.storageDate, item.shelfLife);
                const s = autoStatus(item);
                const wh = warehouses.find(w=>w.id===item.warehouseId);
                const tempAlert = item.currentTemp > item.idealTempMax || item.currentTemp < item.idealTempMin;
                return (
                  <tr key={item.id} className="row-hover" style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ fontWeight:700, fontSize:13, color:C.ink }}>{item.produce}</div>
                      <div style={{ fontSize:11, color:C.inkFaint }}>{item.id}</div>
                    </td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:C.inkMid }}>{wh?.name || item.warehouseId}</td>
                    <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color:C.ink }}>{item.qty.toLocaleString()} {item.unit}</td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:C.inkSub }}>{item.storageDate}</td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:C.inkSub }}>{item.shelfLife}d</td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:C.inkSub }}>{item.idealTempMin}–{item.idealTempMax}°C</td>
                    <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color: tempAlert?C.red:C.green }}>{item.currentTemp}°C</td>
                    <td style={{ padding:"12px 14px", fontSize:13, color:C.inkMid }}>{item.humidity}%</td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14,
                        color: dl<=7?C.red:dl<=20?C.orange:C.green }}>{dl}d</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}><Badge label={s} status={s} /></td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <Btn variant="secondary" size="sm" onClick={()=>openEdit(item)}>✏</Btn>
                        <Btn variant="danger" size="sm" onClick={()=>remove(item.id)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && (
                <tr><td colSpan={11} style={{ textAlign:"center", padding:"48px", color:C.inkFaint, fontSize:13 }}>No items match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modal} title={selected?"Edit Inventory Item":"Add Inventory Item"} onClose={()=>setModal(false)} width={580}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Warehouse" required>
              <SelectInput value={form.warehouseId} onChange={e=>setF("warehouseId",e.target.value)}
                options={warehouses.map(w=>({value:w.id,label:w.name}))} />
            </Field>
            <Field label="Produce Name" required><TextInput placeholder="e.g. Wheat" value={form.produce} onChange={e=>setF("produce",e.target.value)} /></Field>
            <Field label="Quantity" required><TextInput type="number" placeholder="e.g. 500" value={form.qty} onChange={e=>setF("qty",e.target.value)} /></Field>
            <Field label="Unit">
              <SelectInput value={form.unit} onChange={e=>setF("unit",e.target.value)} options={["kg","tonne","quintal","bags"]} />
            </Field>
            <Field label="Storage Date" required><TextInput type="date" max={today} value={form.storageDate} onChange={e=>setF("storageDate",e.target.value)} /></Field>
            <Field label="Shelf Life (days)" required><TextInput type="number" placeholder="e.g. 90" value={form.shelfLife} onChange={e=>setF("shelfLife",e.target.value)} /></Field>
            <Field label="Ideal Temp Min (°C)"><TextInput type="number" placeholder="e.g. 10" value={form.idealTempMin} onChange={e=>setF("idealTempMin",e.target.value)} /></Field>
            <Field label="Ideal Temp Max (°C)"><TextInput type="number" placeholder="e.g. 20" value={form.idealTempMax} onChange={e=>setF("idealTempMax",e.target.value)} /></Field>
            <Field label="Current Temp (°C)"><TextInput type="number" placeholder="e.g. 15" value={form.currentTemp} onChange={e=>setF("currentTemp",e.target.value)} /></Field>
            <Field label="Humidity (%)"><TextInput type="number" placeholder="e.g. 65" value={form.humidity} onChange={e=>setF("humidity",e.target.value)} /></Field>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <Btn variant="secondary" onClick={()=>setModal(false)} s={{ flex:1, justifyContent:"center" }}>Cancel</Btn>
            <Btn onClick={save} s={{ flex:1, justifyContent:"center" }}>Save Item</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── 4. SMART SUGGESTIONS PAGE ─────────────────────────
function SuggestionsPage({ warehouses, inventory }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const items = inventory.map(i => {
    const dl = daysLeft(i.storageDate, i.shelfLife);
    const s = autoStatus(i);
    const wh = warehouses.find(w=>w.id===i.warehouseId);
    return { ...i, days: dl, status: s, wh };
  });

  const generate = () => {
    const suggestions = [];

    // OVERSTOCK
    items.filter(i=>i.status==="Overstock").forEach(i=>{
      suggestions.push({
        id:`OVER-${i.id}`, type:"Overstock", priority:"high",
        title:`Overstock Detected — ${i.produce}`,
        warehouse: i.wh?.name||i.warehouseId,
        detail: `Current stock: ${i.qty.toLocaleString()} ${i.unit} at ${i.wh?.name}. This exceeds the recommended 80% threshold for warehouse capacity.`,
        actions: [
          "Schedule partial dispatch to secondary distribution center.",
          "Contact downstream buyers to accelerate offtake.",
          "Redistribute excess to nearest underutilized warehouse.",
        ],
        icon:"📦", color:C.purple, bg:C.purpleBg, border:C.purpleBd,
      });
    });

    // UNDERSTOCK
    items.filter(i=>i.status==="Understock").forEach(i=>{
      suggestions.push({
        id:`UNDER-${i.id}`, type:"Understock", priority:"medium",
        title:`Low Stock Alert — ${i.produce}`,
        warehouse: i.wh?.name||i.warehouseId,
        detail: `Only ${i.qty.toLocaleString()} ${i.unit} remaining at ${i.wh?.name}. Stock is critically low and may cause supply gaps.`,
        actions: [
          "Initiate procurement order from nearest verified supplier.",
          "Check availability in adjacent warehouses for transfer.",
          "Notify procurement team to raise purchase request.",
        ],
        icon:"📉", color:C.red, bg:C.redBg, border:C.redBd,
      });
    });

    // EXPIRING
    items.filter(i=>i.days<=14).forEach(i=>{
      suggestions.push({
        id:`EXP-${i.id}`, type:"Expiry", priority: i.days<=7 ? "critical" : "high",
        title:`Expiring Soon — ${i.produce} (${i.days}d left)`,
        warehouse: i.wh?.name||i.warehouseId,
        detail: `${i.qty.toLocaleString()} ${i.unit} of ${i.produce} stored at ${i.wh?.name} will expire in ${i.days} day${i.days!==1?"s":""}. Immediate action required.`,
        actions: [
          i.days<=3 ? "URGENT: Arrange emergency dispatch or donation to minimize total loss." : "Schedule priority dispatch to nearest market or processing facility.",
          "Apply discount or bulk-sale offer to clear stock rapidly.",
          "Update inventory records and notify logistics team immediately.",
        ],
        icon: i.days<=3?"🚨":"⏰", color: i.days<=3?C.red:C.orange, bg: i.days<=3?C.redBg:C.orangeBg, border: i.days<=3?C.redBd:C.orangeBd,
      });
    });

    // UNFAVORABLE TEMPERATURE
    items.filter(i=>i.currentTemp>i.idealTempMax+1||i.currentTemp<i.idealTempMin-1).forEach(i=>{
      const above = i.currentTemp > i.idealTempMax;
      suggestions.push({
        id:`TEMP-${i.id}`, type:"Temperature", priority:"high",
        title:`Temperature Alert — ${i.produce} at ${i.wh?.name}`,
        warehouse: i.wh?.name||i.warehouseId,
        detail: `Current temperature ${i.currentTemp}°C is ${above?"above the maximum":"below the minimum"} ideal range of ${i.idealTempMin}–${i.idealTempMax}°C. Prolonged exposure may accelerate spoilage.`,
        actions: [
          above ? "Increase cooling system output or check refrigeration unit for faults." : "Activate heating system or reposition produce away from cold zones.",
          "Conduct manual temperature readings every 2 hours until stabilized.",
          "Flag batch for quality inspection to assess current condition.",
        ],
        icon:"🌡️", color:C.yellow, bg:C.yellowBg, border:C.yellowBd,
      });
    });

    // WAREHOUSE CLEANLINESS (capacity > 90%)
    warehouses.filter(w=>pct(w.used,w.capacity)>90).forEach(w=>{
      suggestions.push({
        id:`CLEAN-${w.id}`, type:"Cleanliness", priority:"medium",
        title:`Cleanliness Risk — ${w.name} Near Full Capacity`,
        warehouse: w.name,
        detail: `${w.name} is at ${pct(w.used,w.capacity)}% capacity (${w.used.toLocaleString()}/${w.capacity.toLocaleString()} kg). Overcrowded storage increases contamination risk, reduces airflow, and impedes pest inspection.`,
        actions: [
          "Schedule deep cleaning and fumigation before next inbound shipment.",
          "Increase aisle inspection frequency to daily protocol.",
          "Clear expired or dispatched stock records and reclaim floor space.",
          "Ensure pest control logs are up to date.",
        ],
        icon:"🧹", color:"#0369A1", bg:"#F0F9FF", border:"#BAE6FD",
      });
    });

    return suggestions;
  };

  const suggestions = generate();
  const types = ["All","Overstock","Understock","Expiry","Temperature","Cleanliness"];
  const filtered = activeFilter==="All" ? suggestions : suggestions.filter(s=>s.type===activeFilter);

  const priorityOrder = { critical:0, high:1, medium:2, low:3 };
  const sorted = [...filtered].sort((a,b)=>priorityOrder[a.priority]-priorityOrder[b.priority]);

  const priorityMeta = {
    critical: { label:"Critical", bg:C.redBg,    text:C.red,    border:C.redBd },
    high:     { label:"High",     bg:C.orangeBg,  text:C.orange, border:C.orangeBd },
    medium:   { label:"Medium",   bg:C.yellowBg,  text:C.yellow, border:C.yellowBd },
    low:      { label:"Low",      bg:C.blue50,    text:C.blue700, border:C.blue100 },
  };

  return (
    <div className="page-enter">
      <SectionHeader
        title="Smart Suggestions"
        sub={`${suggestions.length} active recommendation${suggestions.length!==1?"s":""}  across all facilities`}
      />

      {/* Count strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:22 }}>
        {[
          { type:"Overstock",    icon:"📦", color:C.purple },
          { type:"Understock",   icon:"📉", color:C.red },
          { type:"Expiry",       icon:"⏰", color:C.orange },
          { type:"Temperature",  icon:"🌡️", color:C.yellow },
          { type:"Cleanliness",  icon:"🧹", color:"#0369A1" },
        ].map(t => {
          const count = suggestions.filter(s=>s.type===t.type).length;
          return (
            <button key={t.type} onClick={()=>setActiveFilter(activeFilter===t.type?"All":t.type)}
              style={{ background: activeFilter===t.type?C.bgAlt:C.white,
                border:`1.5px solid ${activeFilter===t.type?t.color:C.border}`,
                borderRadius:10, padding:"12px 14px", cursor:"pointer", textAlign:"left", transition:"all .15s" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{t.icon}</div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:20, fontWeight:800, color:t.color }}>{count}</div>
              <div style={{ fontSize:11, color:C.inkSub, fontWeight:600, marginTop:2 }}>{t.type}</div>
            </button>
          );
        })}
      </div>

      {/* Filter chips */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {types.map(t => <Chip key={t} label={t} active={activeFilter===t} onClick={()=>setActiveFilter(t)} />)}
      </div>

      {sorted.length === 0 ? (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"64px 32px", textAlign:"center", boxShadow:C.s1 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
          <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:18, fontWeight:700, color:C.ink, marginBottom:6 }}>All Clear</div>
          <div style={{ fontSize:14, color:C.inkSub }}>No active recommendations. All inventory and warehouses are in optimal condition.</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {sorted.map(s => {
            const pm = priorityMeta[s.priority];
            return (
              <div key={s.id} style={{ background:C.white, border:`1px solid ${C.border}`,
                borderRadius:14, overflow:"hidden", boxShadow:C.s1 }}>
                {/* Header bar */}
                <div style={{ background:s.bg, borderBottom:`1px solid ${s.border}`, padding:"14px 22px",
                  display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, color:s.color }}>{s.title}</div>
                      <div style={{ fontSize:12, color:C.inkSub, marginTop:2 }}>📍 {s.warehouse}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20,
                      fontSize:11, fontWeight:700, background:pm.bg, color:pm.text, border:`1px solid ${pm.border}` }}>
                      {pm.label} Priority
                    </span>
                    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20,
                      fontSize:11, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                      {s.type}
                    </span>
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding:"18px 22px" }}>
                  <p style={{ fontSize:13, color:C.inkMid, lineHeight:1.65, marginBottom:16 }}>{s.detail}</p>
                  <div style={{ background:C.bgAlt, borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.inkSub, textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
                      Recommended Actions
                    </div>
                    {s.actions.map((a,i) => (
                      <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom: i<s.actions.length-1?8:0 }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:s.color,
                          color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center",
                          justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</div>
                        <span style={{ fontSize:13, color:C.ink, lineHeight:1.55 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 5. SHIPMENTS (simplified) ─────────────────────────
const SHIPMENTS_DATA = [
  { id:"SHP-001", from:"WH01", destination:"Delhi Market",      items:"Wheat 500kg, Rice 200kg", status:"In Transit", date:"2025-02-24", driver:"Suresh K.",  eta:"2 hours" },
  { id:"SHP-002", from:"WH02", destination:"Mumbai Hub",        items:"Tomatoes 150kg",          status:"Pending",    date:"2025-02-27", driver:"Anita R.",   eta:"Tomorrow" },
  { id:"SHP-003", from:"WH03", destination:"Pune Cold Chain",   items:"Mangoes 100kg",           status:"Delivered",  date:"2025-02-22", driver:"Ramesh P.",  eta:"—" },
  { id:"SHP-004", from:"WH04", destination:"Bangalore Depot",   items:"Maize 800kg",             status:"In Transit", date:"2025-02-26", driver:"Kavitha M.", eta:"5 hours" },
  { id:"SHP-005", from:"WH04", destination:"Hyderabad Market",  items:"Onions 400kg",            status:"Loading",    date:"2025-02-27", driver:"Vijay S.",   eta:"6 hours" },
];

const shipColor = { "Delivered":"Optimal","In Transit":"Good","Pending":"Warning","Loading":"Understock" };

function ShipmentsPage({ warehouses }) {
  return (
    <div className="page-enter">
      <SectionHeader title="Shipments & Distribution" sub="Track outbound deliveries and logistics pipeline" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
        {SHIPMENTS_DATA.map(s => {
          const wh = warehouses.find(w=>w.id===s.from);
          return (
            <div key={s.id} className="card-hover" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:20, boxShadow:C.s1, transition:"all .2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, color:C.ink }}>{s.id}</div>
                  <div style={{ fontSize:11, color:C.inkFaint, marginTop:2 }}>{s.date}</div>
                </div>
                <Badge label={s.status} status={shipColor[s.status]} />
              </div>
              {[
                { icon:"📍", label:"Destination", val:s.destination },
                { icon:"🏭", label:"From",        val:wh?.name||s.from },
                { icon:"📦", label:"Items",       val:s.items },
                { icon:"👤", label:"Driver",      val:s.driver },
                ...(s.eta!=="—" ? [{ icon:"⏱", label:"ETA", val:s.eta }] : []),
              ].map(d => (
                <div key={d.label} style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:14, width:18 }}>{d.icon}</span>
                  <div style={{ fontSize:13 }}>
                    <span style={{ color:C.inkSub }}>{d.label}: </span>
                    <span style={{ color:C.ink, fontWeight:600 }}>{d.val}</span>
                  </div>
                </div>
              ))}
              {s.status==="In Transit" && (
                <div style={{ marginTop:12 }}>
                  <ProgressBar value={60} color={C.blue700} thin />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DASHBOARD SHELL
// ═══════════════════════════════════════════════════════
function Dashboard({ user, onLogout }) {
  const [nav, setNav] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [warehouses, setWarehouses] = useState(INIT_WAREHOUSES);
  const [inventory, setInventory] = useState(INIT_INVENTORY);
  const [alertPanel, setAlertPanel] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const alertCount = inventory.filter(i=>{
    const s = autoStatus(i);
    return ["Expiring","Warning","Overstock","Understock"].includes(s);
  }).length;

  const navItems = [
    { id:"overview",     label:"Overview",     icon:"⊞" },
    { id:"warehouses",   label:"Warehouses",   icon:"🏭" },
    { id:"inventory",    label:"Inventory",    icon:"📦" },
    { id:"suggestions",  label:"Suggestions",  icon:"💡", badge: alertCount },
    { id:"shipments",    label:"Shipments",    icon:"🚚" },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, fontFamily:"'Lato',sans-serif", color:C.ink }}>
      <style>{GS}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:collapsed?56:228, transition:"width .28s ease",
        background:C.white, borderRight:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0, overflow:"hidden" }}>

        {/* Logo */}
        <div style={{ padding:"16px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:34, height:34, background:`linear-gradient(135deg,${C.blue900},${C.blue700})`,
            borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🌾</div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:14, color:C.ink, letterSpacing:"-.2px" }}>AgriVault</div>
              <div style={{ fontSize:10, color:C.inkFaint, letterSpacing:1.8, textTransform:"uppercase" }}>Warehouse OS</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {navItems.map(n => {
            const active = nav===n.id;
            return (
              <button key={n.id} className="nav-btn" onClick={()=>setNav(n.id)} style={{
                display:"flex", alignItems:"center", gap:10, padding:"9px 10px",
                borderRadius:8, border:"none", cursor:"pointer", transition:"all .15s",
                background: active ? C.blue50 : "transparent",
                color: active ? C.blue800 : C.inkSub,
                fontWeight: active ? 700 : 400, fontSize:13,
                borderLeft: active ? `3px solid ${C.blue700}` : "3px solid transparent",
                whiteSpace:"nowrap", overflow:"hidden", position:"relative",
              }}>
                <span style={{ fontSize:15, flexShrink:0 }}>{n.icon}</span>
                {!collapsed && n.label}
                {!collapsed && n.badge > 0 && (
                  <span style={{ marginLeft:"auto", background:C.red, color:"#fff",
                    fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10 }}>{n.badge}</span>
                )}
                {collapsed && n.badge > 0 && (
                  <span style={{ position:"absolute", top:4, right:4, width:7, height:7,
                    background:C.red, borderRadius:"50%", animation:"pulse 1.5s infinite" }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding:"10px 8px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
            borderRadius:8, background:C.bgAlt }}>
            <div style={{ width:30, height:30, background:`linear-gradient(135deg,${C.blue800},${C.blue600})`,
              borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:700, color:"#fff", flexShrink:0 }}>{user.avatar}</div>
            {!collapsed && <>
              <div style={{ flex:1, overflow:"hidden" }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
                <div style={{ fontSize:10, color:C.inkFaint, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.role}</div>
              </div>
              <button onClick={onLogout} title="Sign out" style={{ background:"none", border:"none", cursor:"pointer", color:C.inkSub, fontSize:14 }}>↩</button>
            </>}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* Topbar */}
        <header style={{ background:C.white, borderBottom:`1px solid ${C.border}`,
          padding:"0 24px", height:56, display:"flex", alignItems:"center", gap:14,
          position:"sticky", top:0, zIndex:200 }}>
          <button onClick={()=>setCollapsed(p=>!p)}
            style={{ background:C.bgAlt, border:`1px solid ${C.border}`, borderRadius:7,
              width:32, height:32, color:C.inkMid, fontSize:13, cursor:"pointer" }}>☰</button>

          <div style={{ flex:1 }}>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:15, color:C.ink, textTransform:"capitalize" }}>
              {navItems.find(n=>n.id===nav)?.label}
            </span>
            <span style={{ fontSize:12, color:C.inkFaint, marginLeft:10 }}>
              {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
            </span>
          </div>

          {/* Alert bell */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setAlertPanel(p=>!p)} style={{
              background: alertPanel ? C.blue50 : C.bgAlt,
              border:`1px solid ${alertPanel?C.blue100:C.border}`,
              borderRadius:7, width:34, height:34, cursor:"pointer", fontSize:15,
              display:"flex", alignItems:"center", justifyContent:"center",
              color: alertPanel ? C.blue700 : C.inkMid }}>🔔</button>
            {alertCount>0 && <span style={{ position:"absolute", top:-3, right:-3, width:16, height:16,
              background:C.red, color:"#fff", borderRadius:"50%", fontSize:9, fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>{alertCount}</span>}
          </div>

          {/* User chip */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px 5px 6px",
            background:C.bgAlt, border:`1px solid ${C.border}`, borderRadius:8 }}>
            <div style={{ width:24, height:24, background:`linear-gradient(135deg,${C.blue800},${C.blue600})`,
              borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:9, fontWeight:700, color:"#fff" }}>{user.avatar}</div>
            <span style={{ fontSize:12, fontWeight:600, color:C.inkMid }}>{user.name.split(" ")[0]}</span>
          </div>
        </header>

        {/* Alert dropdown */}
        {alertPanel && (
          <div style={{ position:"fixed", top:60, right:16, width:360, background:C.white,
            border:`1px solid ${C.border}`, borderRadius:14, boxShadow:C.s3, zIndex:300, animation:"dropIn .22s ease" }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14, color:C.ink }}>
                Alerts ({alertCount})
              </span>
              <button onClick={()=>setAlertPanel(false)} style={{ background:"none", border:"none", color:C.inkSub, fontSize:20, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>
            <div style={{ maxHeight:380, overflowY:"auto" }}>
              {inventory.map(i=>{
                const s = autoStatus(i);
                const dl = daysLeft(i.storageDate,i.shelfLife);
                const wh = INIT_WAREHOUSES.find(w=>w.id===i.warehouseId);
                if (!["Expiring","Warning","Overstock","Understock"].includes(s)) return null;
                const m = statusMeta[s];
                return (
                  <div key={i.id} style={{ padding:"12px 18px", borderBottom:`1px solid ${C.border}`,
                    display:"flex", gap:10, alignItems:"flex-start", background:"transparent" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:m.text, flexShrink:0, marginTop:4 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{i.produce} — {s}</div>
                      <div style={{ fontSize:11, color:C.inkSub, marginTop:2 }}>{wh?.name} · {dl}d left · {i.qty} {i.unit}</div>
                    </div>
                    <Badge label={s} status={s} />
                  </div>
                );
              })}
            </div>
            <div style={{ padding:"12px 18px", borderTop:`1px solid ${C.border}` }}>
              <button onClick={()=>{setAlertPanel(false);setNav("suggestions");}}
                style={{ width:"100%", padding:"9px", background:C.blue50, border:`1px solid ${C.blue100}`,
                  borderRadius:8, color:C.blue700, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                View All Suggestions →
              </button>
            </div>
          </div>
        )}

        {/* Page */}
        <main style={{ flex:1, padding:"28px 28px", overflowY:"auto" }} key={nav}>
          {nav==="overview"    && <OverviewPage    warehouses={warehouses} inventory={inventory} />}
          {nav==="warehouses"  && <WarehousesPage  warehouses={warehouses} setWarehouses={setWarehouses} inventory={inventory} showToast={showToast} />}
          {nav==="inventory"   && <InventoryPage   warehouses={warehouses} inventory={inventory} setInventory={setInventory} showToast={showToast} />}
          {nav==="suggestions" && <SuggestionsPage warehouses={warehouses} inventory={inventory} />}
          {nav==="shipments"   && <ShipmentsPage   warehouses={warehouses} />}
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  return user ? <Dashboard user={user} onLogout={()=>setUser(null)} /> : <AuthPage onLogin={setUser} />;
}
