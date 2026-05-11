import { useState, useEffect, useRef, useCallback } from "react";

/* ══ LOAD qrcodejs from CDN ══════════════════════════════ */
let qrLibReady = false;
function loadQRLib(cb) {
  if (qrLibReady) { cb(); return; }
  if (document.getElementById("qrlib")) {
    const wait = setInterval(() => { if (window.QRCode) { qrLibReady=true; clearInterval(wait); cb(); } }, 80);
    return;
  }
  const s = document.createElement("script");
  s.id = "qrlib";
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  s.onload = () => { qrLibReady = true; cb(); };
  document.head.appendChild(s);
}

/* ══ GLOBAL CSS ══════════════════════════════════════════ */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Plus Jakarta Sans',sans-serif; background:#fff; color:#1e3a8a; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#2563eb;border-radius:4px}
  html{scroll-behavior:smooth}
`;

const C = {
  blue:"#1d4ed8", blue2:"#2563eb", blueL:"#eff6ff",
  blueM:"#dbeafe", border:"#bfdbfe",
  t1:"#1e3a8a", t2:"#3b5fc0", t3:"#93c5fd", white:"#ffffff",
};

/* ══ DATA ════════════════════════════════════════════════ */
const initStaff = [
  {id:"a123", name:"Michael Jackson", short:"M. Jackson"},
  {id:"b123", name:"Abdul Kalam",     short:"A. Kalam"  },
  {id:"c123", name:"Aleem",           short:"Aleem"     },
];

/* Initial schedule — dynamic (more added when staff added) */
const initSchedule = [
  {id:1, staffId:"a123",dept:"AI&DS",name:"AI&DS A",subject:"Python",       room:"C5-05",period:"1st",time:"08:30–09:30"},
  {id:2, staffId:"a123",dept:"AI&DS",name:"AI&DS A",subject:"Python",       room:"C5-05",period:"5th",time:"12:30–13:30"},
  {id:3, staffId:"a123",dept:"CSBS", name:"CSBS B", subject:"Python",       room:"C7-04",period:"3rd",time:"10:30–11:30"},
  {id:4, staffId:"a123",dept:"CSBS", name:"CSBS B", subject:"Python",       room:"C7-04",period:"7th",time:"14:30–15:30"},
  {id:5, staffId:"a123",dept:"CCE",  name:"CCE A",  subject:"Python",       room:"C6-05",period:"2nd",time:"09:30–10:30"},
  {id:6, staffId:"b123",dept:"AI&DS",name:"AI&DS B",subject:"DBMS",         room:"C5-06",period:"1st",time:"08:30–09:30"},
  {id:7, staffId:"b123",dept:"AI&DS",name:"AI&DS A",subject:"DBMS",         room:"C5-05",period:"2nd",time:"09:30–10:30"},
  {id:8, staffId:"b123",dept:"CSBS", name:"CSBS B", subject:"DBMS",         room:"C7-04",period:"1st",time:"08:30–09:30"},
  {id:9, staffId:"c123",dept:"CSE",  name:"CSE A",  subject:"C Programming",room:"C4-06",period:"1st",time:"08:30–09:30"},
  {id:10,staffId:"c123",dept:"ECE",  name:"ECE A",  subject:"C Programming",room:"C3-04",period:"2nd",time:"09:30–10:30"},
  {id:11,staffId:"c123",dept:"MECH", name:"MECH B", subject:"C Programming",room:"C2-04",period:"5th",time:"12:30–13:30"},
];

const ALT_CLASSES = [
  {id:101,dept:"AI&DS",name:"AI&DS A",room:"C5-05"},{id:102,dept:"AI&DS",name:"AI&DS B",room:"C5-06"},
  {id:103,dept:"AI&DS",name:"AI&DS C",room:"C5-07"},{id:104,dept:"AI&DS",name:"AI&DS D",room:"C5-08"},
  {id:105,dept:"CSBS", name:"CSBS A", room:"C7-03"},{id:106,dept:"CSBS", name:"CSBS B", room:"C7-04"},
  {id:107,dept:"CSBS", name:"CSBS C", room:"C7-05"},{id:108,dept:"CSBS", name:"CSBS D", room:"C7-06"},
  {id:109,dept:"CSE",  name:"CSE A",  room:"C4-01"},{id:110,dept:"CSE",  name:"CSE B",  room:"C4-02"},
  {id:111,dept:"CSE",  name:"CSE C",  room:"C4-03"},{id:112,dept:"CSE",  name:"CSE D",  room:"C4-04"},
  {id:113,dept:"CCE",  name:"CCE A",  room:"C6-05"},{id:114,dept:"CCE",  name:"CCE B",  room:"C6-06"},
  {id:115,dept:"ECE",  name:"ECE A",  room:"C3-04"},{id:116,dept:"ECE",  name:"ECE B",  room:"C3-05"},
  {id:117,dept:"ECE",  name:"ECE C",  room:"C3-06"},{id:118,dept:"MECH", name:"MECH A", room:"C2-03"},
  {id:119,dept:"MECH", name:"MECH B", room:"C2-04"},
];

const DEPT_COLOR = {
  "AI&DS":"#2563eb","CSBS":"#7c3aed","CSE":"#0891b2",
  "CCE":"#d97706","ECE":"#059669","MECH":"#dc2626",
};

const CLASS_STUDENTS = {
  "AI&DS A":[{id:1,name:"Ram",        roll:"21AD001"},{id:2,name:"Priya",      roll:"21AD002"},{id:3,name:"Thirsha",    roll:"21AD003"},{id:4,name:"Supraja",    roll:"21AD004"},{id:5,name:"Roshini",    roll:"21AD005"}],
  "AI&DS B":[{id:1,name:"Arjun",      roll:"21AD011"},{id:2,name:"Kavya",      roll:"21AD012"},{id:3,name:"Nitin",      roll:"21AD013"},{id:4,name:"Shreya",     roll:"21AD014"},{id:5,name:"Arun Kumar",  roll:"21AD015"}],
  "AI&DS C":[{id:1,name:"Deepak",     roll:"21AD021"},{id:2,name:"Nithya",     roll:"21AD022"},{id:3,name:"Karthik",    roll:"21AD023"},{id:4,name:"Lavanya",    roll:"21AD024"},{id:5,name:"Surya",      roll:"21AD025"}],
  "AI&DS D":[{id:1,name:"Prashanth",  roll:"21AD031"},{id:2,name:"Divya",      roll:"21AD032"},{id:3,name:"Ganesh",     roll:"21AD033"},{id:4,name:"Kowsalya",   roll:"21AD034"},{id:5,name:"Hari",       roll:"21AD035"}],
  "CSBS A": [{id:1,name:"Naveen",     roll:"21CS001"},{id:2,name:"Swetha",     roll:"21CS002"},{id:3,name:"Abishek",    roll:"21CS003"},{id:4,name:"Preethi",    roll:"21CS004"},{id:5,name:"Dinesh",     roll:"21CS005"}],
  "CSBS B": [{id:1,name:"Rajesh",     roll:"21CS011"},{id:2,name:"Rahul",      roll:"21CS012"},{id:3,name:"Sathya",     roll:"21CS013"},{id:4,name:"Vidya",      roll:"21CS014"},{id:5,name:"Rekha",      roll:"21CS015"}],
  "CSBS C": [{id:1,name:"Ashwin",     roll:"21CS021"},{id:2,name:"Megha",      roll:"21CS022"},{id:3,name:"Praveen",    roll:"21CS023"},{id:4,name:"Sindhu",     roll:"21CS024"},{id:5,name:"Vivek",      roll:"21CS025"}],
  "CSBS D": [{id:1,name:"Suresh",     roll:"21CS031"},{id:2,name:"Anitha",     roll:"21CS032"},{id:3,name:"Balaji",     roll:"21CS033"},{id:4,name:"Hema",       roll:"21CS034"},{id:5,name:"Manoj",      roll:"21CS035"}],
  "CSE A":  [{id:1,name:"Vikram",     roll:"21CE001"},{id:2,name:"Vijay",      roll:"21CE002"},{id:3,name:"Dheetha",    roll:"21CE003"},{id:4,name:"Tharshini",  roll:"21CE004"},{id:5,name:"Harini",     roll:"21CE005"}],
  "CSE B":  [{id:1,name:"Kiran",      roll:"21CE011"},{id:2,name:"Sundar",     roll:"21CE012"},{id:3,name:"Meena",      roll:"21CE013"},{id:4,name:"Ravi",       roll:"21CE014"},{id:5,name:"Latha",      roll:"21CE015"}],
  "CSE C":  [{id:1,name:"Ajith",      roll:"21CE021"},{id:2,name:"Pooja S",    roll:"21CE022"},{id:3,name:"Sanjay",     roll:"21CE023"},{id:4,name:"Nandha",     roll:"21CE024"},{id:5,name:"Revathi",    roll:"21CE025"}],
  "CSE D":  [{id:1,name:"Murugan",    roll:"21CE031"},{id:2,name:"Janani",     roll:"21CE032"},{id:3,name:"Subash",     roll:"21CE033"},{id:4,name:"Kavitha",    roll:"21CE034"},{id:5,name:"Srinath",    roll:"21CE035"}],
  "CCE A":  [{id:1,name:"Akash",      roll:"21CC001"},{id:2,name:"Brindha",    roll:"21CC002"},{id:3,name:"Chandru",    roll:"21CC003"},{id:4,name:"Devi",       roll:"21CC004"},{id:5,name:"Elango",     roll:"21CC005"}],
  "CCE B":  [{id:1,name:"Fathima",    roll:"21CC011"},{id:2,name:"Guru",       roll:"21CC012"},{id:3,name:"Hameed",     roll:"21CC013"},{id:4,name:"Indira",     roll:"21CC014"},{id:5,name:"Jagan",      roll:"21CC015"}],
  "ECE A":  [{id:1,name:"Dinesh K",   roll:"21EC001"},{id:2,name:"Pooja R",    roll:"21EC002"},{id:3,name:"Aakash",     roll:"21EC003"},{id:4,name:"Nithya S",   roll:"21EC004"},{id:5,name:"Surya K",    roll:"21EC005"}],
  "ECE B":  [{id:1,name:"Kamal",      roll:"21EC011"},{id:2,name:"Lakshmi",    roll:"21EC012"},{id:3,name:"Mani",       roll:"21EC013"},{id:4,name:"Nandhini",   roll:"21EC014"},{id:5,name:"Oviya",      roll:"21EC015"}],
  "ECE C":  [{id:1,name:"Pavan",      roll:"21EC021"},{id:2,name:"Qutub",      roll:"21EC022"},{id:3,name:"Rohini",     roll:"21EC023"},{id:4,name:"Sakthi",     roll:"21EC024"},{id:5,name:"Tamilarasi", roll:"21EC025"}],
  "MECH A": [{id:1,name:"Udhay",      roll:"21ME001"},{id:2,name:"Vasanth",    roll:"21ME002"},{id:3,name:"Waqar",      roll:"21ME003"},{id:4,name:"Xavier",     roll:"21ME004"},{id:5,name:"Yogesh",     roll:"21ME005"}],
  "MECH B": [{id:1,name:"Bala",       roll:"21ME011"},{id:2,name:"Muthu",      roll:"21ME012"},{id:3,name:"Selvam",     roll:"21ME013"},{id:4,name:"Ramesh",     roll:"21ME014"},{id:5,name:"Gopal",      roll:"21ME015"}],
};
const getStu = n => CLASS_STUDENTS[n] || CLASS_STUDENTS["CSE A"];
const nowStr = () => new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const genCode = () => String(Math.floor(1000+Math.random()*9000));

/* ══ RIT LOGO (accurate SVG) ════════════════════════════ */
function RITLogo({size=56}){
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* outer circle */}
      <circle cx="50" cy="50" r="48" fill="#1a56a0"/>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#5b9bd5" strokeWidth="1.5"/>
      {/* ground line */}
      <rect x="30" y="80" width="40" height="3" rx="1.5" fill="#fff"/>
      {/* trunk */}
      <rect x="47" y="60" width="6" height="20" rx="2" fill="#fff"/>
      {/* main horizontal branch */}
      <rect x="28" y="56" width="44" height="4" rx="2" fill="#fff"/>
      {/* upper horiz branch */}
      <rect x="34" y="44" width="32" height="3.5" rx="1.5" fill="#fff"/>
      {/* top horiz branch */}
      <rect x="40" y="33" width="20" height="3" rx="1.5" fill="#fff"/>
      {/* vertical connectors left side */}
      <rect x="30" y="44" width="3.5" height="16" rx="1.5" fill="#fff"/>
      <rect x="36" y="33" width="3.5" height="14" rx="1.5" fill="#fff"/>
      {/* vertical connectors right side */}
      <rect x="66.5" y="44" width="3.5" height="16" rx="1.5" fill="#fff"/>
      <rect x="60.5" y="33" width="3.5" height="14" rx="1.5" fill="#fff"/>
      {/* top center */}
      <rect x="48.25" y="24" width="3.5" height="12" rx="1.5" fill="#fff"/>
      {/* orange circuit nodes */}
      <circle cx="50" cy="23"  r="4.5" fill="#f97316"/>
      <circle cx="40" cy="32"  r="4"   fill="#f97316"/>
      <circle cx="60" cy="32"  r="4"   fill="#f97316"/>
      <circle cx="34" cy="43"  r="3.8" fill="#f97316"/>
      <circle cx="66" cy="43"  r="3.8" fill="#f97316"/>
      <circle cx="28" cy="56"  r="3.5" fill="#f97316"/>
      <circle cx="72" cy="56"  r="3.5" fill="#f97316"/>
      {/* small dots on branches */}
      <circle cx="50" cy="44"  r="2.5" fill="#f97316"/>
      <circle cx="50" cy="56"  r="2.5" fill="#f97316"/>
    </svg>
  );
}

/* ══ REAL QR using qrcodejs ══════════════════════════════ */
function RealQR({data, size=190}){
  const ref = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ok | err

  useEffect(()=>{
    if(!data){ setStatus("idle"); return; }
    setStatus("loading");
    loadQRLib(()=>{
      if(!ref.current) return;
      ref.current.innerHTML = "";
      try{
        new window.QRCode(ref.current,{
          text: data,
          width: size,
          height: size,
          colorDark: "#1d4ed8",
          colorLight: "#eff6ff",
          correctLevel: window.QRCode.CorrectLevel.M,
        });
        setStatus("ok");
      } catch(e){ setStatus("err"); }
    });
  },[data, size]);

  return(
    <div style={{width:size,height:size,borderRadius:12,overflow:"hidden",
      border:`2px solid ${C.border}`,background:C.blueL,
      display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      {status==="loading"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,border:`3px solid ${C.border}`,
            borderTop:`3px solid ${C.blue2}`,borderRadius:"50%",
            animation:"spin 0.8s linear infinite"}}/>
          <span style={{fontSize:11,color:C.t2}}>Generating QR…</span>
        </div>
      )}
      {status==="err"&&(
        <div style={{textAlign:"center",padding:12}}>
          <div style={{fontSize:28,marginBottom:6}}>⚠️</div>
          <div style={{fontSize:11,color:"#dc2626"}}>QR generation failed</div>
        </div>
      )}
      <div ref={ref} style={{display:status==="ok"?"block":"none"}}/>
    </div>
  );
}

function Ring({s,total=30}){
  const r=44, circ=2*Math.PI*r;
  const col=s>15?C.blue2:s>7?"#f59e0b":"#ef4444";
  return(
    <svg width={104} height={104} viewBox="0 0 104 104">
      <circle cx={52} cy={52} r={r} fill="none" stroke={C.border} strokeWidth={6}/>
      <circle cx={52} cy={52} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ*(1-s/total)} strokeLinecap="round"
        transform="rotate(-90 52 52)" style={{transition:"stroke-dashoffset 1s,stroke .3s"}}/>
      <text x={52} y={49} textAnchor="middle" fill={col}
        style={{font:"700 24px Plus Jakarta Sans,sans-serif",dominantBaseline:"middle"}}>{s}</text>
      <text x={52} y={65} textAnchor="middle" fill={C.t2}
        style={{font:"500 9px Plus Jakarta Sans,sans-serif"}}>sec</text>
    </svg>
  );
}

/* ══ WEBSITE ═════════════════════════════════════════════ */
function Navbar({onLogin}){
  const [stuck,setStuck]=useState(false);
  useEffect(()=>{
    const fn=()=>setStuck(window.scrollY>10);
    window.addEventListener("scroll",fn); return()=>window.removeEventListener("scroll",fn);
  },[]);
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:500,height:64,
      display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 48px",
      background:stuck?"rgba(255,255,255,0.96)":"#fff",
      backdropFilter:stuck?"blur(14px)":"none",
      borderBottom:stuck?`1px solid ${C.border}`:"1px solid transparent",transition:"all .25s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <RITLogo size={38}/>
        <div>
          <div style={{fontWeight:800,fontSize:13,color:C.t1,lineHeight:1}}>AttendX</div>
          <div style={{fontSize:9,color:C.t2}}>RIT · Attendance System</div>
        </div>
      </div>
      <div style={{display:"flex",gap:28,alignItems:"center"}}>
        {[["Features","#features"],["How It Works","#howitworks"],["Departments","#departments"]].map(([l,h])=>(
          <a key={l} href={h} style={{color:C.t2,fontSize:14,fontWeight:500,textDecoration:"none",transition:"color .18s"}}
            onMouseEnter={e=>e.target.style.color=C.t1}
            onMouseLeave={e=>e.target.style.color=C.t2}>{l}</a>
        ))}
      </div>
      <button onClick={onLogin} style={{padding:"10px 22px",borderRadius:9,border:"none",
        background:`linear-gradient(135deg,${C.blue2},#1e40af)`,color:"#fff",
        fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer",
        boxShadow:"0 4px 14px rgba(37,99,235,0.3)"}}>Staff Login →</button>
    </nav>
  );
}

function Hero({onLogin}){
  return(
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"100px 40px 60px",background:"#fff",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"58%",
        background:"linear-gradient(180deg,#eff6ff 0%,#fff 100%)",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:700,animation:"fadeUp .6s ease"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:12,
          background:"#1a56a0",borderRadius:14,padding:"12px 22px",marginBottom:26,
          boxShadow:"0 4px 20px rgba(26,86,160,0.3)"}}>
          <RITLogo size={38}/>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>
              Rajalakshmi Institute of Technology
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>
              Approved by AICTE · Affiliated to Anna University · NAAC A++
            </div>
          </div>
        </div>
        <h1 style={{fontWeight:800,fontSize:"clamp(34px,5vw,58px)",color:C.t1,
          lineHeight:1.1,letterSpacing:"-1.5px",marginBottom:16}}>
          Smart QR-Based<br/><span style={{color:C.blue2}}>Attendance Management</span>
        </h1>
        <p style={{fontSize:16,color:C.t2,lineHeight:1.75,maxWidth:500,margin:"0 auto 32px"}}>
          Faculty generate secure rotating QR codes, verify student presence, and sync records to IMS — in seconds.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={onLogin} style={{padding:"13px 30px",borderRadius:10,border:"none",
            background:`linear-gradient(135deg,${C.blue2},#1e40af)`,color:"#fff",
            fontFamily:"inherit",fontSize:15,fontWeight:700,cursor:"pointer",
            boxShadow:"0 6px 20px rgba(37,99,235,0.3)",transition:"transform .2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            Launch App →
          </button>
          <a href="#features" style={{padding:"13px 24px",borderRadius:10,
            border:`1.5px solid ${C.border}`,background:"#fff",color:C.t1,
            fontFamily:"inherit",fontSize:15,fontWeight:600,textDecoration:"none",transition:"border-color .18s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue2}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            See Features ↓
          </a>
        </div>
      </div>
    </section>
  );
}

function Features(){
  const feats=[
    {icon:"⬡", title:"Real QR Codes",           desc:"Every QR is generated locally — unique per session, expires in 30 seconds. No duplicates, no proxy.",            col:C.blue2},
    {icon:"🔢", title:"Verification Code",        desc:"Staff screen shows one correct 4-digit code. Students see 4 codes on their device and select the matching one.", col:"#0891b2"},
    {icon:"📡", title:"GPS + Wi-Fi Check",        desc:"Students must be inside classroom bounds and on campus Wi-Fi for attendance to register.",                       col:"#059669"},
    {icon:"⬆", title:"Auto IMS Sync",             desc:"One click after class pushes all records to the college IMS portal. Zero manual entry.",                        col:"#7c3aed"},
    {icon:"👤", title:"Add Staff Members",         desc:"Admin can add new staff, assign them classes, subjects, and periods directly from the portal.",                  col:"#d97706"},
    {icon:"◧", title:"Reports & Analytics",       desc:"Per-student attendance %, class summaries, department-wide view, PDF and Excel export.",                        col:"#dc2626"},
  ];
  return(
    <section id="features" style={{padding:"90px 60px",background:"#fff"}}>
      <div style={{maxWidth:1080,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:46}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.blue2,marginBottom:8}}>
            Platform Features
          </p>
          <h2 style={{fontWeight:800,fontSize:36,color:C.t1,letterSpacing:"-1px"}}>Everything faculty needs</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {feats.map(f=>(
            <div key={f.title} style={{background:"#fff",border:`1.5px solid ${C.border}`,
              borderRadius:14,padding:"22px 20px",transition:"all .22s",cursor:"default"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=f.col;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.07)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{width:44,height:44,borderRadius:11,background:C.blueL,
                border:`1px solid ${C.border}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:20,marginBottom:12}}>{f.icon}</div>
              <h3 style={{fontWeight:700,fontSize:15,color:C.t1,marginBottom:7}}>{f.title}</h3>
              <p style={{fontSize:13,color:C.t2,lineHeight:1.7}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks(){
  const steps=[
    {num:"01",icon:"🔑",title:"Staff Logs In",        desc:"Sign in with Staff ID. Every staff sees their own schedule plus an option to take any alternate class."},
    {num:"02",icon:"⬡", title:"Generate QR",          desc:"One click generates a real 30-second QR + one correct 4-digit code is shown to the class."},
    {num:"03",icon:"📱",title:"Students Scan & Match", desc:"Students scan QR on their phones, see 4 codes, select the one matching the teacher's screen."},
    {num:"04",icon:"⬆", title:"Sync to IMS",          desc:"Click Finalize. All records push to the college IMS portal automatically."},
  ];
  return(
    <section id="howitworks" style={{padding:"90px 60px",background:C.blueL}}>
      <div style={{maxWidth:1080,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:46}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.blue2,marginBottom:8}}>
            How It Works
          </p>
          <h2 style={{fontWeight:800,fontSize:36,color:C.t1,letterSpacing:"-1px"}}>Four steps, fully automated</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {steps.map(s=>(
            <div key={s.num} style={{background:"#fff",border:`1px solid ${C.border}`,
              borderRadius:14,padding:"22px 16px",textAlign:"center",position:"relative"}}>
              <div style={{width:54,height:54,borderRadius:13,
                background:`linear-gradient(135deg,${C.blue2},#1e40af)`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                margin:"0 auto 14px",boxShadow:"0 4px 16px rgba(37,99,235,0.25)",position:"relative"}}>
                {s.icon}
                <div style={{position:"absolute",top:-8,right:-8,width:20,height:20,borderRadius:6,
                  background:C.blue2,color:"#fff",fontSize:8,fontWeight:800,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>{s.num}</div>
              </div>
              <h3 style={{fontWeight:700,fontSize:14,color:C.t1,marginBottom:8}}>{s.title}</h3>
              <p style={{fontSize:12.5,color:C.t2,lineHeight:1.7}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Departments(){
  const depts=[
    {code:"AI&DS",name:"Artificial Intelligence & Data Science",sections:["A","B","C","D"],col:C.blue2},
    {code:"CSBS", name:"Computer Science & Business Systems",   sections:["A","B","C","D"],col:"#7c3aed"},
    {code:"CSE",  name:"Computer Science & Engineering",       sections:["A","B","C","D"],col:"#0891b2"},
    {code:"CCE",  name:"Computer & Communication Engineering", sections:["A","B"],         col:"#d97706"},
    {code:"ECE",  name:"Electronics & Communication Engg.",    sections:["A","B","C"],     col:"#059669"},
    {code:"MECH", name:"Mechanical Engineering",               sections:["A","B"],         col:"#dc2626"},
  ];
  return(
    <section id="departments" style={{padding:"90px 60px",background:"#fff"}}>
      <div style={{maxWidth:1080,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:46}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:C.blue2,marginBottom:8}}>
            Departments
          </p>
          <h2 style={{fontWeight:800,fontSize:36,color:C.t1,letterSpacing:"-1px"}}>
            All departments. Every section.
          </h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {depts.map(d=>(
            <div key={d.code} style={{background:"#fff",border:`1.5px solid ${C.border}`,
              borderRadius:13,padding:"18px 18px",display:"flex",gap:13,alignItems:"flex-start",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=d.col;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{width:40,height:40,borderRadius:9,flexShrink:0,background:C.blueL,
                border:`1px solid ${C.border}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontWeight:800,fontSize:10,color:d.col}}>{d.code}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:C.t1,marginBottom:7}}>{d.name}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {d.sections.map(s=>(
                    <span key={s} style={{fontSize:10,fontWeight:700,padding:"2px 7px",
                      borderRadius:5,background:C.blueM,color:d.col,border:`1px solid ${C.border}`}}>
                      Sec {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WebFooter(){
  return(
    <footer style={{background:"#1a56a0",padding:"26px 60px",
      display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <RITLogo size={30}/>
        <div>
          <div style={{fontWeight:800,fontSize:13,color:"#fff"}}>AttendX</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Rajalakshmi Institute of Technology</div>
        </div>
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Staff Attendance Management System · 2026</div>
    </footer>
  );
}

/* ══ LOGIN (RIT IMS Style) ═══════════════════════════════ */
function Login({staffList,onLogin}){
  const [id,setId]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPw,setShowPw]=useState(false);

  const go=()=>{
    if(!id.trim()||!pw.trim()){setErr("Please enter User ID and password");return;}
    const found=staffList.find(s=>s.id===id.trim().toLowerCase());
    if(!found){setErr("Invalid User ID. Please check and try again.");return;}
    setErr("");setLoading(true);
    setTimeout(()=>{setLoading(false);onLogin(found);},700);
  };

  const inp={
    width:"100%",background:"#fff",border:"1.5px solid #d1d5db",
    borderRadius:6,padding:"12px 14px",color:"#111827",fontSize:15,
    fontFamily:"inherit",outline:"none",transition:"border-color .2s"
  };

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <style>{G}</style>
      {/* Blue RIT header — exactly like screenshot */}
      <div style={{width:"100%",background:"#1a56a0",padding:"32px 24px",
        display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <RITLogo size={76}/>
          <div style={{borderLeft:"2px solid rgba(255,255,255,0.3)",paddingLeft:16}}>
            <div style={{fontSize:28,fontWeight:800,color:"#fff",fontStyle:"italic",letterSpacing:"-0.5px"}}>rit</div>
            <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.9)",letterSpacing:"1px"}}>RAJALAKSHMI</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",letterSpacing:"0.5px"}}>INSTITUTE OF TECHNOLOGY</div>
          </div>
        </div>
        <p style={{color:"rgba(255,255,255,0.85)",fontSize:13,textAlign:"center",
          maxWidth:380,lineHeight:1.75,fontWeight:400}}>
          Rajalakshmi Institute of Technology is an engineering college in Chennai, Tamil Nadu, India.
          RIT is approved by AICTE and affiliated with Anna University, Chennai and accredited with 'A++' Grade in NAAC.
        </p>
      </div>

      {/* Login form */}
      <div style={{width:"100%",maxWidth:380,padding:"36px 24px",animation:"fadeUp .5s ease"}}>
        <h2 style={{fontWeight:700,fontSize:28,color:"#111827",marginBottom:22}}>Login</h2>
        <div style={{marginBottom:14}}>
          <input value={id} onChange={e=>setId(e.target.value)} type="text"
            placeholder="User ID" onKeyDown={e=>e.key==="Enter"&&go()} style={inp}
            onFocus={e=>e.target.style.borderColor=C.blue2}
            onBlur={e=>e.target.style.borderColor="#d1d5db"}/>
        </div>
        <div style={{marginBottom:6,position:"relative"}}>
          <input value={pw} onChange={e=>setPw(e.target.value)}
            type={showPw?"text":"password"} placeholder="Password"
            onKeyDown={e=>e.key==="Enter"&&go()}
            style={{...inp,paddingRight:44}}
            onFocus={e=>e.target.style.borderColor=C.blue2}
            onBlur={e=>e.target.style.borderColor="#d1d5db"}/>
          <button onClick={()=>setShowPw(v=>!v)}
            style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
              background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:16,lineHeight:1}}>
            {showPw?"🙈":"👁"}
          </button>
        </div>
        {err&&<p style={{color:"#dc2626",fontSize:13,marginBottom:8}}>⚠ {err}</p>}
        <button onClick={go} disabled={loading} style={{
          width:"100%",padding:"13px 0",borderRadius:6,border:"none",
          background:loading?"#93c5fd":C.blue2,
          color:"#fff",fontFamily:"inherit",fontSize:15,fontWeight:700,
          cursor:loading?"not-allowed":"pointer",marginTop:10}}>
          {loading?"Signing in…":"Login"}
        </button>
        <p style={{fontSize:12,color:"#9ca3af",marginTop:14,textAlign:"center"}}>
          Use your Staff ID to login · a123 / b123 / c123
        </p>
      </div>
    </div>
  );
}

/* ══ SIDEBAR ═════════════════════════════════════════════ */
function Sidebar({active,go,staff,logout}){
  const items=[
    ["▣","dash","Dashboard"],["◈","qr","QR Session"],
    ["◧","rep","Reports"],["↻","ims","IMS Sync"],["👤","staff","Staff Members"],
  ];
  return(
    <aside style={{width:215,background:C.blueL,borderRight:`1px solid ${C.border}`,
      display:"flex",flexDirection:"column",padding:"16px 12px",minHeight:"100vh",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 4px",marginBottom:20}}>
        <RITLogo size={30}/>
        <div>
          <div style={{fontWeight:800,fontSize:12,color:C.t1,lineHeight:1}}>AttendX</div>
          <div style={{fontSize:9,color:C.t2}}>RIT Attendance System</div>
        </div>
      </div>
      <div style={{background:C.blueM,borderRadius:10,padding:"10px 12px",marginBottom:18,
        border:`1px solid ${C.border}`}}>
        <div style={{fontSize:9,color:C.t2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>👨‍🏫 Staff</div>
        <div style={{fontWeight:700,fontSize:13,color:C.t1}}>{staff.name}</div>
        <div style={{fontSize:10,color:C.blue2,marginTop:2}}>● Online</div>
      </div>
      <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
        {items.map(([ic,id,lb])=>(
          <button key={id} onClick={()=>go(id)} style={{
            width:"100%",display:"flex",alignItems:"center",gap:8,
            padding:"9px 11px",borderRadius:9,border:"none",cursor:"pointer",
            fontFamily:"inherit",fontSize:13,fontWeight:active===id?700:400,
            background:active===id?C.blueM:"transparent",
            color:active===id?C.blue2:C.t2,
            borderLeft:active===id?`2px solid ${C.blue2}`:"2px solid transparent",
            transition:"all .15s",textAlign:"left"
          }}>{ic} {lb}</button>
        ))}
      </nav>
      <button onClick={logout} style={{width:"100%",padding:"9px 12px",borderRadius:9,
        border:"1px solid #fecaca",background:"transparent",color:"#dc2626",
        cursor:"pointer",fontFamily:"inherit",fontSize:13,textAlign:"left",transition:"all .15s"}}
        onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        ⏻ Sign Out
      </button>
    </aside>
  );
}

/* ══ DASHBOARD ═══════════════════════════════════════════ */
function Dashboard({staff,staffList,schedule,onPick}){
  const [tab,setTab]=useState("my");
  const mine=schedule.filter(s=>s.staffId===staff.id);
  const today=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const greet=new Date().getHours()<12?"Morning":"Afternoon";
  const grouped=ALT_CLASSES.reduce((a,c)=>{if(!a[c.dept])a[c.dept]=[];a[c.dept].push(c);return a;},{});

  return(
    <div style={{padding:"26px 30px",animation:"fadeUp .3s ease"}}>
      {/* RIT strip */}
      <div style={{background:"#1a56a0",borderRadius:14,padding:"14px 18px",marginBottom:20,
        display:"flex",alignItems:"center",gap:14}}>
        <RITLogo size={42}/>
        <div>
          <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Rajalakshmi Institute of Technology</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Chennai · AICTE Approved · Anna University · NAAC A++</div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>AttendX Portal</div>
          <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{today}</div>
        </div>
      </div>

      <h2 style={{fontWeight:800,fontSize:21,color:C.t1,marginBottom:16,letterSpacing:"-0.4px"}}>
        Good {greet}, {staff.short} 👋
      </h2>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[["📋","Periods Today",mine.length],["👥","Students/Class",5],
          ["📚","Subject",mine[0]?.subject||"—"],["👔","Staff Total",staffList.length]].map(([ic,l,v])=>(
          <div key={l} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:11,padding:"14px"}}>
            <div style={{fontSize:18,marginBottom:5}}>{ic}</div>
            <div style={{fontWeight:800,fontSize:18,color:C.blue2,marginBottom:1}}>{v}</div>
            <div style={{fontSize:11,color:C.t2}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs — both tabs for ALL staff */}
      <div style={{display:"flex",background:C.blueL,border:`1px solid ${C.border}`,
        borderRadius:9,padding:3,marginBottom:16,width:"fit-content",gap:2}}>
        {[["my","My Classes"],["alt","Alternate Class"]].map(([k,lb])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"8px 16px",borderRadius:7,border:"none",cursor:"pointer",
            fontFamily:"inherit",fontSize:13,fontWeight:tab===k?700:400,
            background:tab===k?C.blueM:"transparent",
            color:tab===k?C.blue2:C.t2,transition:"all .15s"
          }}>{lb}</button>
        ))}
      </div>

      {/* My Classes */}
      {tab==="my"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {mine.length===0&&(
            <div style={{background:C.blueL,borderRadius:12,padding:"24px",
              textAlign:"center",color:C.t2,fontSize:13}}>
              No classes assigned. Use "Alternate Class" to take any available class.
            </div>
          )}
          {mine.map(cls=>{
            const col=DEPT_COLOR[cls.dept]||C.blue2;
            return(
              <div key={cls.id} onClick={()=>onPick(cls)}
                style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:12,
                  padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",
                  cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=col;e.currentTarget.style.transform="translateX(3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateX(0)";}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:C.blueL,
                    border:`1px solid ${C.border}`,display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:18}}>📋</div>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                      <span style={{fontWeight:700,fontSize:14,color:C.t1}}>{cls.name}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:20,
                        background:C.blueM,color:col}}>Period {cls.period}</span>
                    </div>
                    <div style={{fontSize:12,color:C.t2}}>{cls.subject} · {cls.time} · Room {cls.room}</div>
                  </div>
                </div>
                <div style={{background:`linear-gradient(135deg,${C.blue2},#1e40af)`,color:"#fff",
                  borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:700,whiteSpace:"nowrap",
                  boxShadow:"0 3px 10px rgba(37,99,235,0.25)"}}>Generate QR →</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alternate Classes — shown for ALL staff */}
      {tab==="alt"&&(
        <div style={{animation:"fadeUp .25s ease"}}>
          <p style={{color:C.t2,fontSize:13,marginBottom:16}}>
            Select any available class to take attendance.
          </p>
          {Object.entries(grouped).map(([dept,classes])=>{
            const col=DEPT_COLOR[dept]||C.blue2;
            return(
              <div key={dept} style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                  <div style={{width:3,height:16,background:col,borderRadius:2}}/>
                  <span style={{fontWeight:700,fontSize:13,color:col}}>{dept}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {classes.map(cls=>(
                    <div key={cls.id} onClick={()=>onPick(cls)}
                      style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:10,
                        padding:"12px 13px",cursor:"pointer",transition:"all .18s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=col;e.currentTarget.style.transform="translateY(-2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.t1,marginBottom:2}}>{cls.name}</div>
                      <div style={{fontSize:11,color:C.t2,marginBottom:7}}>Room {cls.room}</div>
                      <div style={{fontSize:11,fontWeight:600,color:col}}>Take Class →</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══ QR SESSION ══════════════════════════════════════════ */
function QRSession({cls,onBack}){
  const [timeLeft,setTimeLeft]=useState(0);
  const [active,setActive]=useState(false);
  const [expired,setExpired]=useState(false);
  const [qrData,setQrData]=useState("");
  const [correctCode,setCorrectCode]=useState("");
  const [students,setStudents]=useState(getStu(cls.name).map(s=>({...s,done:false,t:null})));
  const timerRef=useRef(null);
  const col=DEPT_COLOR[cls.dept]||C.blue2;

  const generate=useCallback(()=>{
    clearInterval(timerRef.current);
    const ts=Date.now();
    const code=genCode();
    // QR encodes full session info
    const qr=`RIT-ATTENDX\nClass:${cls.name}\nRoom:${cls.room}\nPeriod:${cls.period}\nDate:${new Date(ts).toLocaleDateString("en-IN")}\nTime:${new Date(ts).toLocaleTimeString("en-IN")}\nCode:${code}\nToken:${ts}`;
    setQrData(qr);
    setCorrectCode(code);
    setTimeLeft(30);setActive(true);setExpired(false);
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);setActive(false);setExpired(true);return 0;}
        return t-1;
      });
    },1000);
  },[cls]);

  useEffect(()=>()=>clearInterval(timerRef.current),[]);
  const present=students.filter(s=>s.done).length;

  return(
    <div style={{padding:"26px 30px",animation:"fadeUp .3s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{background:C.blueL,border:`1px solid ${C.border}`,
          borderRadius:9,padding:"8px 14px",color:C.t2,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
          ← Back
        </button>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <h2 style={{fontWeight:800,fontSize:19,color:C.t1}}>{cls.name}</h2>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,
              background:C.blueM,color:col}}>
              {cls.period!=="—"?"Period "+cls.period:"Alternate Class"}
            </span>
          </div>
          <p style={{color:C.t2,fontSize:12}}>
            {cls.subject!=="—"&&cls.subject+" · "}{cls.room}{cls.time!=="—"&&" · "+cls.time}
          </p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* QR Panel */}
        <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:16,padding:22}}>
          <h3 style={{fontWeight:700,fontSize:15,color:C.t1,marginBottom:14}}>QR Code</h3>

          {!active&&!expired&&(
            <div style={{textAlign:"center",padding:"32px 16px"}}>
              <div style={{fontSize:40,marginBottom:12}}>📡</div>
              <p style={{color:C.t2,fontSize:13,marginBottom:20,lineHeight:1.6}}>
                Click below to generate a real 30-second QR.<br/>
                Each QR is unique and session-locked.
              </p>
              <button onClick={generate} style={{
                background:`linear-gradient(135deg,${C.blue2},#1e40af)`,color:"#fff",
                border:"none",borderRadius:10,padding:"12px 28px",cursor:"pointer",
                fontFamily:"inherit",fontSize:14,fontWeight:700,
                boxShadow:"0 4px 14px rgba(37,99,235,0.3)"}}>
                ⬡ Generate QR Code
              </button>
            </div>
          )}

          {(active||expired)&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
              {/* Real QR */}
              <div style={{position:"relative",opacity:expired?.3:1,filter:expired?"grayscale(1)":"none"}}>
                <RealQR data={qrData} size={190}/>
                {expired&&(
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.88)",
                    borderRadius:12,gap:4}}>
                    <span style={{color:"#dc2626",fontWeight:700,fontSize:15}}>EXPIRED</span>
                    <span style={{color:C.t2,fontSize:11}}>Generate a new QR</span>
                  </div>
                )}
              </div>

              {active&&<Ring s={timeLeft}/>}

              {/* ONE correct code shown to staff */}
              {active&&(
                <div style={{width:"100%"}}>
                  <p style={{fontSize:10,color:C.t2,marginBottom:8,textAlign:"center",
                    textTransform:"uppercase",letterSpacing:"0.6px",fontWeight:600}}>
                    Show this code to students on your screen
                  </p>
                  <div style={{
                    background:C.blueM, border:`2px solid ${C.blue2}`,
                    borderRadius:12, padding:"16px", textAlign:"center",
                  }}>
                    <div style={{fontWeight:800,fontSize:36,color:C.blue2,
                      letterSpacing:"8px",fontFamily:"monospace"}}>{correctCode}</div>
                    <div style={{fontSize:11,color:C.t2,marginTop:4,fontWeight:500}}>
                      ✓ Correct verification code — students pick this from 4 options on their device
                    </div>
                  </div>
                </div>
              )}

              <button onClick={generate} style={{width:"100%",padding:"10px 0",borderRadius:9,
                border:`1px solid ${C.border}`,background:C.blueL,color:C.blue2,
                cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,transition:"all .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.blueM}
                onMouseLeave={e=>e.currentTarget.style.background=C.blueL}>
                ↻ {expired?"New QR":"Regenerate"}
              </button>
            </div>
          )}
        </div>

        {/* Attendance list */}
        <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:16,padding:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
            <h3 style={{fontWeight:700,fontSize:15,color:C.t1}}>Attendance · {cls.name}</h3>
            <div style={{display:"flex",gap:6}}>
              <span style={{background:"#dcfce7",color:"#15803d",borderRadius:20,
                padding:"3px 10px",fontSize:12,fontWeight:700}}>✓ {present}</span>
              <span style={{background:"#fee2e2",color:"#dc2626",borderRadius:20,
                padding:"3px 10px",fontSize:12,fontWeight:700}}>✗ {students.length-present}</span>
            </div>
          </div>
          <div style={{background:C.blueL,borderRadius:5,height:5,marginBottom:12,overflow:"hidden"}}>
            <div style={{height:"100%",width:((present/students.length)*100)+"%",
              background:`linear-gradient(90deg,${C.blue2},#059669)`,borderRadius:5,transition:"width .5s"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:288,overflowY:"auto"}}>
            {students.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"9px 11px",borderRadius:9,
                background:s.done?"#f0fdf4":C.blueL,
                border:`1px solid ${s.done?"#bbf7d0":C.border}`,transition:"all .3s"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:30,height:30,borderRadius:8,
                    background:s.done?"#dcfce7":C.blueM,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:700,fontSize:13,color:s.done?"#15803d":C.t2}}>
                    {s.done?"✓":"○"}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:C.t1}}>{s.name}</div>
                    <div style={{fontSize:10,color:C.t2,fontFamily:"monospace"}}>{s.roll}</div>
                  </div>
                </div>
                {s.done
                  ?<span style={{fontSize:10,color:C.t2,fontFamily:"monospace"}}>{s.t}</span>
                  :<button onClick={()=>setStudents(p=>p.map(x=>x.id===s.id?{...x,done:true,t:nowStr()}:x))}
                    style={{fontSize:11,background:"#fff",border:`1px solid ${C.border}`,
                      color:C.blue2,borderRadius:7,padding:"4px 10px",cursor:"pointer",
                      fontFamily:"inherit",fontWeight:600,transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.blueM;e.currentTarget.style.borderColor=C.blue2;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=C.border;}}>
                    Manual ✓
                  </button>
                }
              </div>
            ))}
          </div>
          <button style={{width:"100%",marginTop:12,padding:"11px 0",borderRadius:9,border:"none",
            background:"linear-gradient(135deg,#059669,#047857)",color:"#fff",cursor:"pointer",
            fontFamily:"inherit",fontWeight:700,fontSize:14,
            boxShadow:"0 4px 12px rgba(5,150,105,0.25)"}}>
            ⬆ Finalize & Sync to IMS
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══ REPORTS ═════════════════════════════════════════════ */
function Reports(){
  const seed=useRef(Math.random());
  const allRows=Object.entries(CLASS_STUDENTS).flatMap(([cls,stus])=>
    stus.map((s,i)=>{
      const p=Math.floor(27+(seed.current*17+i*7+cls.length*3)%19);
      return({...s,class:cls,dept:cls.split(" ")[0],p,tot:45,pct:Math.round((p/45)*100)});
    })
  );
  const [q,setQ]=useState("");
  const rows=allRows.filter(r=>
    r.name.toLowerCase().includes(q.toLowerCase())||
    r.roll.includes(q)||
    r.class.toLowerCase().includes(q.toLowerCase())
  );
  return(
    <div style={{padding:"26px 30px",animation:"fadeUp .3s ease"}}>
      <h2 style={{fontWeight:800,fontSize:22,color:C.t1,marginBottom:2}}>Reports</h2>
      <p style={{color:C.t2,fontSize:13,marginBottom:16}}>Attendance summary for all classes</p>
      <div style={{display:"flex",gap:9,marginBottom:14,flexWrap:"wrap"}}>
        <input placeholder="🔍 Search name, roll or class…" value={q} onChange={e=>setQ(e.target.value)}
          style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:9,
            padding:"9px 14px",color:C.t1,fontSize:13,fontFamily:"inherit",outline:"none",
            minWidth:220,flex:1}}
          onFocus={e=>e.target.style.borderColor=C.blue2}
          onBlur={e=>e.target.style.borderColor=C.border}/>
        <button style={{background:"#7c3aed",color:"#fff",border:"none",borderRadius:9,
          padding:"9px 16px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12}}>↓ PDF</button>
        <button style={{background:"#059669",color:"#fff",border:"none",borderRadius:9,
          padding:"9px 16px",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12}}>↓ Excel</button>
      </div>
      <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`,background:C.blueL}}>
              {["Class","Roll No","Name","Present","Total","Attendance","Status"].map(h=>(
                <th key={h} style={{padding:"10px 13px",textAlign:"left",fontSize:10,color:C.t2,
                  textTransform:"uppercase",letterSpacing:"0.7px",fontWeight:700}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.roll+r.class}
                style={{borderBottom:`1px solid ${C.blueL}`,
                  background:i%2===0?"#fff":C.blueL,transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.blueM}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":C.blueL}>
                <td style={{padding:"9px 13px",fontSize:11,color:DEPT_COLOR[r.dept]||C.blue2,fontWeight:700}}>{r.class}</td>
                <td style={{padding:"9px 13px",fontSize:11,color:C.t2,fontFamily:"monospace"}}>{r.roll}</td>
                <td style={{padding:"9px 13px",fontSize:13,fontWeight:600,color:C.t1}}>{r.name}</td>
                <td style={{padding:"9px 13px",fontSize:13,color:"#059669",fontWeight:700}}>{r.p}</td>
                <td style={{padding:"9px 13px",fontSize:13,color:C.t2}}>{r.tot}</td>
                <td style={{padding:"9px 13px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{flex:1,background:C.blueL,borderRadius:4,height:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:r.pct+"%",borderRadius:4,
                        background:r.pct>=75?"#059669":"#dc2626"}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,minWidth:34,
                      color:r.pct>=75?"#059669":"#dc2626"}}>{r.pct}%</span>
                  </div>
                </td>
                <td style={{padding:"9px 13px"}}>
                  <span style={{fontSize:10,fontWeight:700,borderRadius:20,padding:"2px 9px",
                    background:r.pct>=75?"#dcfce7":"#fee2e2",
                    color:r.pct>=75?"#15803d":"#dc2626"}}>
                    {r.pct>=75?"Good":"Low"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══ IMS ═════════════════════════════════════════════════ */
function IMS(){
  const [syncing,setSyncing]=useState(false);
  const [logs,setLogs]=useState([
    {id:1,s:"AI&DS A · Python · P1",d:"02-05-2026 09:35",ok:true,n:5},
    {id:2,s:"CSBS B · Python · P3", d:"01-05-2026 11:32",ok:true,n:5},
    {id:3,s:"AI&DS B · DBMS · P1",  d:"01-05-2026 09:31",ok:false,n:0},
    {id:4,s:"CCE A · Python · P2",  d:"30-04-2026 10:32",ok:true,n:5},
  ]);
  const sync=()=>{
    setSyncing(true);
    setTimeout(()=>{
      setSyncing(false);
      setLogs(p=>[{id:Date.now(),s:"Manual Sync — All Classes",
        d:new Date().toLocaleString("en-IN"),ok:true,n:15},...p]);
    },2200);
  };
  return(
    <div style={{padding:"26px 30px",animation:"fadeUp .3s ease"}}>
      <h2 style={{fontWeight:800,fontSize:22,color:C.t1,marginBottom:2}}>IMS Sync</h2>
      <p style={{color:C.t2,fontSize:13,marginBottom:16}}>Push attendance records to RIT IMS portal</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[["🔗","Connected","IMS Status","#059669"],["🕐","2 min ago","Last Sync",C.blue2],["⏳","0 records","Pending","#d97706"]].map(([ic,v,l,col])=>(
          <div key={l} style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:11,
            padding:"14px 16px",display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:22}}>{ic}</span>
            <div>
              <div style={{fontWeight:800,fontSize:17,color:col}}>{v}</div>
              <div style={{fontSize:11,color:C.t2}}>{l}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,
        padding:"16px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h3 style={{fontWeight:700,fontSize:15,color:C.t1,marginBottom:2}}>Manual Sync</h3>
          <p style={{color:C.t2,fontSize:12}}>Force push all pending records to IMS</p>
        </div>
        <button onClick={sync} disabled={syncing} style={{padding:"10px 22px",borderRadius:9,border:"none",
          cursor:syncing?"not-allowed":"pointer",
          background:syncing?C.blueL:`linear-gradient(135deg,${C.blue2},#1e40af)`,
          color:syncing?C.t2:"#fff",fontFamily:"inherit",fontWeight:700,fontSize:13,
          display:"flex",alignItems:"center",gap:7}}>
          {syncing?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>↻</span>Syncing…</>:"⬆ Sync Now"}
        </button>
      </div>
      <p style={{fontSize:10,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:9}}>Sync Logs</p>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {logs.map(l=>(
          <div key={l.id} style={{background:"#fff",
            border:`1px solid ${l.ok?"#bbf7d0":"#fecaca"}`,
            borderRadius:10,padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:8,
                background:l.ok?"#dcfce7":"#fee2e2",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:l.ok?"#15803d":"#dc2626",fontWeight:700,fontSize:13}}>{l.ok?"✓":"✗"}</div>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:C.t1}}>{l.s}</div>
                <div style={{fontSize:11,color:C.t2}}>{l.d}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              {l.n>0&&<span style={{fontSize:11,color:C.t2}}>{l.n} records</span>}
              <span style={{fontSize:11,fontWeight:700,borderRadius:20,padding:"3px 10px",
                background:l.ok?"#dcfce7":"#fee2e2",
                color:l.ok?"#15803d":"#dc2626"}}>{l.ok?"SUCCESS":"FAILED"}</span>
              {!l.ok&&<button style={{fontSize:11,background:"#fff",border:"1px solid #fecaca",
                color:"#dc2626",borderRadius:7,padding:"3px 8px",cursor:"pointer",fontFamily:"inherit"}}>Retry</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ ADD STAFF ═══════════════════════════════════════════ */
const PERIODS = [
  {label:"1st · 08:30–09:30",period:"1st",time:"08:30–09:30"},
  {label:"2nd · 09:30–10:30",period:"2nd",time:"09:30–10:30"},
  {label:"3rd · 10:30–11:30",period:"3rd",time:"10:30–11:30"},
  {label:"4th · 11:30–12:30",period:"4th",time:"11:30–12:30"},
  {label:"5th · 12:30–13:30",period:"5th",time:"12:30–13:30"},
  {label:"6th · 13:30–14:30",period:"6th",time:"13:30–14:30"},
  {label:"7th · 14:30–15:30",period:"7th",time:"14:30–15:30"},
];

function StaffManager({staffList,setStaffList,schedule,setSchedule}){
  const emptyForm={name:"",id:"",subject:"",dept:"AI&DS",section:"A",periodKey:"1st · 08:30–09:30",room:""};
  const [form,setForm]=useState(emptyForm);
  const [success,setSuccess]=useState("");
  const [err,setErr]=useState("");

  const classOptions=ALT_CLASSES.filter(c=>c.dept===form.dept);

  const add=()=>{
    if(!form.name.trim()||!form.id.trim()||!form.subject.trim()||!form.room.trim()){
      setErr("Please fill all fields");return;
    }
    if(staffList.find(s=>s.id===form.id.trim().toLowerCase())){
      setErr("Staff ID already exists");return;
    }
    const pid=PERIODS.find(p=>p.label===form.periodKey)||PERIODS[0];
    const className=`${form.dept} ${form.section}`;
    const newStaff={
      id:form.id.trim().toLowerCase(),
      name:form.name.trim(),
      short:form.name.trim().split(" ").map((w,i)=>i===0?w[0]+".":w).join(" "),
    };
    const newCls={
      id:Date.now(),
      staffId:newStaff.id,
      dept:form.dept,
      name:className,
      subject:form.subject.trim(),
      room:form.room.trim(),
      period:pid.period,
      time:pid.time,
    };
    setStaffList(p=>[...p,newStaff]);
    setSchedule(p=>[...p,newCls]);
    setForm(emptyForm);
    setErr("");
    setSuccess(`✓ ${newStaff.name} added with class ${className}`);
    setTimeout(()=>setSuccess(""),3500);
  };

  const inp={
    width:"100%",background:"#fff",border:`1.5px solid ${C.border}`,
    borderRadius:8,padding:"10px 12px",color:C.t1,fontSize:13,
    fontFamily:"inherit",outline:"none",transition:"border-color .2s"
  };
  const lbl={display:"block",fontSize:10,fontWeight:700,color:C.t2,
    textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:5};

  return(
    <div style={{padding:"26px 30px",animation:"fadeUp .3s ease"}}>
      <h2 style={{fontWeight:800,fontSize:22,color:C.t1,marginBottom:2}}>Staff Members</h2>
      <p style={{color:C.t2,fontSize:13,marginBottom:20}}>Add new staff and assign their class</p>

      <div style={{display:"grid",gridTemplateColumns:"400px 1fr",gap:20}}>

        {/* Add form */}
        <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:14,padding:"22px"}}>
          <h3 style={{fontWeight:700,fontSize:15,color:C.t1,marginBottom:16}}>➕ Add New Staff</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={lbl}>Full Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                placeholder="e.g. Dr. S. Preethi" style={inp}
                onFocus={e=>e.target.style.borderColor=C.blue2}
                onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
            <div>
              <label style={lbl}>Staff ID (used to login)</label>
              <input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))}
                placeholder="e.g. d456" style={inp}
                onFocus={e=>e.target.style.borderColor=C.blue2}
                onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
            <div>
              <label style={lbl}>Subject</label>
              <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                placeholder="e.g. Data Structures" style={inp}
                onFocus={e=>e.target.style.borderColor=C.blue2}
                onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>

            {/* Class assignment */}
            <div style={{background:C.blueL,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px"}}>
              <p style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",
                letterSpacing:"0.5px",marginBottom:10}}>Class Assignment</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                <div>
                  <label style={lbl}>Department</label>
                  <select value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value,section:"A"}))}
                    style={{...inp,cursor:"pointer"}}>
                    {["AI&DS","CSBS","CSE","CCE","ECE","MECH"].map(d=>(
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Section</label>
                  <select value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value}))}
                    style={{...inp,cursor:"pointer"}}>
                    {[...new Set(classOptions.map(c=>c.name.split(" ")[1]))].map(sec=>(
                      <option key={sec} value={sec}>{form.dept} {sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Period & Time</label>
                  <select value={form.periodKey} onChange={e=>setForm(f=>({...f,periodKey:e.target.value}))}
                    style={{...inp,cursor:"pointer",gridColumn:"span 1"}}>
                    {PERIODS.map(p=>(
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Room No.</label>
                  <input value={form.room} onChange={e=>setForm(f=>({...f,room:e.target.value}))}
                    placeholder="e.g. C5-09" style={inp}
                    onFocus={e=>e.target.style.borderColor=C.blue2}
                    onBlur={e=>e.target.style.borderColor=C.border}/>
                </div>
              </div>
              {/* Preview */}
              <div style={{marginTop:10,padding:"8px 10px",background:"#fff",borderRadius:7,
                border:`1px solid ${C.border}`,fontSize:12,color:C.t1}}>
                📋 <strong>{form.dept} {form.section}</strong> · {form.subject||"Subject"} · {PERIODS.find(p=>p.label===form.periodKey)?.period||"—"} Period · Room {form.room||"—"}
              </div>
            </div>

            {err&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,
              padding:"8px 11px",color:"#dc2626",fontSize:12}}>⚠ {err}</div>}
            {success&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:7,
              padding:"8px 11px",color:"#15803d",fontSize:12}}>{success}</div>}
            <button onClick={add} style={{padding:"11px 0",borderRadius:9,border:"none",
              background:`linear-gradient(135deg,${C.blue2},#1e40af)`,color:"#fff",
              fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer",
              boxShadow:"0 4px 12px rgba(37,99,235,0.25)"}}>
              Add Staff Member
            </button>
          </div>
        </div>

        {/* Staff list */}
        <div>
          <h3 style={{fontWeight:700,fontSize:14,color:C.t1,marginBottom:12}}>
            All Staff ({staffList.length})
          </h3>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {staffList.map((s,i)=>{
              const myClasses=schedule.filter(c=>c.staffId===s.id);
              return(
                <div key={s.id} style={{background:"#fff",border:`1px solid ${C.border}`,
                  borderRadius:11,padding:"13px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:myClasses.length?8:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:11}}>
                      <div style={{width:36,height:36,borderRadius:9,
                        background:C.blueM,border:`1px solid ${C.border}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:800,fontSize:15,color:C.blue2}}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:C.t1}}>{s.name}</div>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginTop:2}}>
                          <span style={{fontFamily:"monospace",fontSize:11,
                            background:C.blueL,color:C.t2,padding:"2px 8px",borderRadius:5}}>{s.id}</span>
                          <span style={{fontSize:10,color:C.t3}}>Any password to login</span>
                        </div>
                      </div>
                    </div>
                    {i>=3&&(
                      <button onClick={()=>{setStaffList(p=>p.filter(x=>x.id!==s.id));setSchedule(p=>p.filter(x=>x.staffId!==s.id));}}
                        style={{fontSize:11,background:"#fff",border:"1px solid #fecaca",
                          color:"#dc2626",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"inherit"}}>
                        Remove
                      </button>
                    )}
                  </div>
                  {myClasses.length>0&&(
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {myClasses.map(c=>(
                        <span key={c.id} style={{fontSize:10,fontWeight:600,padding:"3px 9px",
                          borderRadius:20,background:C.blueL,color:DEPT_COLOR[c.dept]||C.blue2,
                          border:`1px solid ${C.border}`}}>
                          {c.name} · {c.subject} · P{c.period}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ APP SHELL ═══════════════════════════════════════════ */
function AppShell({staff,staffList,setStaffList,schedule,setSchedule,logout}){
  const [page,setPage]=useState("dash");
  const [cls,setCls]=useState(null);
  const nav=p=>{setPage(p);if(p!=="qr")setCls(null);};
  const pick=c=>{setCls(c);setPage("qr");};
  return(
    <>
      <style>{G}</style>
      <div style={{display:"flex",minHeight:"100vh",background:"#f0f5ff"}}>
        <Sidebar active={page} go={nav} staff={staff} logout={logout}/>
        <main style={{flex:1,overflowY:"auto"}}>
          {page==="dash" &&<Dashboard staff={staff} staffList={staffList} schedule={schedule} onPick={pick}/>}
          {page==="qr"   &&<QRSession cls={cls||schedule.find(s=>s.staffId===staff.id)||ALT_CLASSES[0]} onBack={()=>nav("dash")}/>}
          {page==="rep"  &&<Reports/>}
          {page==="ims"  &&<IMS/>}
          {page==="staff"&&<StaffManager staffList={staffList} setStaffList={setStaffList} schedule={schedule} setSchedule={setSchedule}/>}
        </main>
      </div>
    </>
  );
}

/* ══ ROOT ════════════════════════════════════════════════ */
export default function App(){
  const [view,setView]=useState("web");
  const [staff,setStaff]=useState(null);
  const [staffList,setStaffList]=useState([...initStaff]);
  const [schedule,setSchedule]=useState([...initSchedule]);

  if(view==="login")
    return <Login staffList={staffList} onLogin={s=>{setStaff(s);setView("app");}}/>;
  if(view==="app"&&staff)
    return <AppShell staff={staff} staffList={staffList} setStaffList={setStaffList}
             schedule={schedule} setSchedule={setSchedule}
             logout={()=>{setStaff(null);setView("web");}}/>;

  return(
    <>
      <style>{G}</style>
      <Navbar onLogin={()=>setView("login")}/>
      <Hero   onLogin={()=>setView("login")}/>
      <Features/>
      <HowItWorks/>
      <Departments/>
      <WebFooter/>
    </>
  );
}
