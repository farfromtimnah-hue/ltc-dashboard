import { useState, useEffect, useCallback } from "react";

const API = "https://ltc-api.farfromtimnah.workers.dev";

const GIFTINGS = [
  "Worship & Music","Gift of Helps","Visual Storytelling","Digital Communication",
  "Intercession","Hospitality","Evangelism","Encouragement","Faith","Teaching",
  "Administration","Technical Arts","Influence & Servant Leadership","Creativity",
  "Discernment & Prophetic"
];

const GIFTING_ICONS = {
  "Worship & Music":"🎵","Gift of Helps":"🔧","Visual Storytelling":"🎬",
  "Digital Communication":"📱","Intercession":"🙏","Hospitality":"🤝",
  "Evangelism":"🌍","Encouragement":"💛","Faith":"✨","Teaching":"📖",
  "Administration":"📋","Technical Arts":"⚙️","Influence & Servant Leadership":"🧭",
  "Creativity":"🎨","Discernment & Prophetic":"🔮"
};

const STAGES = ["New","Reached Out","Responded","Meeting Scheduled","Meeting Done","Placed in Ministry"];

const STAGE_COLORS = {
  "New":"#505050",
  "Reached Out":"#2563eb",
  "Responded":"#7c3aed",
  "Meeting Scheduled":"#d97706",
  "Meeting Done":"#059669",
  "Placed in Ministry":"#2ABFBF"
};

const PASTOR_SUGGESTIONS = ["Pra Alice","Pr Rafa"];

const MINISTRIES_STARTER = [
  "Worship Team","Media — ProPresenter","Media — Lights","Media — Sound",
  "Media — Stream","Media — Camera","Content & Creative","Hospitality — Café",
  "Hospitality — Welcome","Stage Operations","Intercession","Kids Ministry",
  "Youth","Legacy","English Service","Link","Parking","Setup & Teardown"
];

const SPECIAL_GROUPS = ["Youth","Link","Legacy","English Service","Other"];
const LANGUAGES = ["English","Português","Both"];

// ─── CSS ─────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0A0A0A;color:#F0F0F0;font-family:'Barlow',sans-serif;}
  ::-webkit-scrollbar{width:6px;height:6px;}
  ::-webkit-scrollbar-track{background:#141414;}
  ::-webkit-scrollbar-thumb{background:#2ABFBF33;border-radius:3px;}
  ::-webkit-scrollbar-thumb:hover{background:#2ABFBF66;}
`;

// ─── HELPERS ─────────────────────────────────────────────────────
function parseJSON(str, fallback = []) {
  try { return JSON.parse(str) || fallback; } catch { return fallback; }
}

function ministryBadge(count) {
  if (count === 0) return { color: "#2ABFBF", label: "Available", bg: "rgba(42,191,191,0.15)" };
  if (count <= 2) return { color: "#22c55e", label: `${count} min`, bg: "rgba(34,197,94,0.15)" };
  if (count <= 3) return { color: "#f59e0b", label: `${count} min`, bg: "rgba(245,158,11,0.15)" };
  return { color: "#ef4444", label: `${count} min`, bg: "rgba(239,68,68,0.15)" };
}

function timeAgo(ts) {
  if (!ts) return "";
  const d = new Date(ts + (ts.includes("Z") ? "" : "Z"));
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ─── LOGIN ────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw })
      });
      const d = await r.json();
      if (d.success) { onLogin(pw); }
      else { setError("Incorrect password."); }
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0A0A0A"}}>
      <style>{css}</style>
      <div style={{width:380,padding:"48px 40px",background:"#141414",border:"1px solid #252525",borderTop:"2px solid #2ABFBF",borderRadius:4}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:3,color:"#2ABFBF",textTransform:"uppercase",marginBottom:8}}>LTC Ministry</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:32}}>Pastor Dashboard</div>
        <input
          type="password" placeholder="Enter dashboard password"
          value={pw} onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          style={{width:"100%",padding:"12px 16px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:15,fontFamily:"'Barlow',sans-serif",outline:"none",marginBottom:12}}
        />
        {error && <div style={{color:"#ef4444",fontSize:13,marginBottom:12}}>{error}</div>}
        <button onClick={handleLogin} disabled={loading}
          style={{width:"100%",padding:"13px",background:"#2ABFBF",color:"#0A0A0A",fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,letterSpacing:2,textTransform:"uppercase",border:"none",borderRadius:3,cursor:"pointer"}}>
          {loading ? "Checking..." : "Enter"}
        </button>
      </div>
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────
function AnalyticsTab({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <div style={{padding:40,color:"#505050"}}>Loading analytics…</div>;

  const stageFunnel = STAGES.map(s => {
    const found = data.byStage.find(x => x.stage === s);
    return { stage: s, count: found ? found.count : 0 };
  });
  const maxStage = Math.max(...stageFunnel.map(x => x.count), 1);

  const maxGifting = Math.max(...(data.byGifting || []).map(x => x.count), 1);

  const ptCount = data.byLanguage.find(x => x.language === "PT")?.count || 0;
  const enCount = data.byLanguage.find(x => x.language === "EN")?.count || 0;
  const total = data.total || 1;

  return (
    <div style={{padding:"32px 28px",display:"grid",gap:24}}>
      {/* Top stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
        {[
          {label:"Total Submissions",value:data.total,accent:"#2ABFBF"},
          {label:"Placed in Ministry",value:stageFunnel.find(x=>x.stage==="Placed in Ministry")?.count||0,accent:"#22c55e"},
          {label:"Awaiting Contact",value:stageFunnel.find(x=>x.stage==="New")?.count||0,accent:"#ef4444"},
          {label:"In Progress",value:stageFunnel.filter(x=>!["New","Placed in Ministry"].includes(x.stage)).reduce((a,b)=>a+b.count,0),accent:"#f59e0b"},
        ].map(({label,value,accent})=>(
          <div key={label} style={{background:"#141414",border:"1px solid #252525",borderTop:`2px solid ${accent}`,borderRadius:4,padding:"20px 24px"}}>
            <div style={{fontSize:36,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:accent}}>{value}</div>
            <div style={{fontSize:12,color:"#999",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Stage funnel */}
      <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20,color:"#F0F0F0"}}>Connection Pipeline</div>
        {stageFunnel.map(({stage,count})=>(
          <div key={stage} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,color:"#F0F0F0"}}>{stage}</span>
              <span style={{fontSize:13,fontWeight:600,color:STAGE_COLORS[stage]||"#2ABFBF"}}>{count}</span>
            </div>
            <div style={{height:8,background:"#1C1C1C",borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(count/maxStage)*100}%`,background:STAGE_COLORS[stage]||"#2ABFBF",borderRadius:4,transition:"width 0.6s ease"}}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        {/* Top giftings */}
        <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20}}>Top Giftings</div>
          {(data.byGifting||[]).slice(0,8).map(({gifting,count})=>(
            <div key={gifting} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,color:"#F0F0F0"}}>{GIFTING_ICONS[gifting]||"◆"} {gifting}</span>
                <span style={{fontSize:12,fontWeight:600,color:"#2ABFBF"}}>{count}</span>
              </div>
              <div style={{height:6,background:"#1C1C1C",borderRadius:3}}>
                <div style={{height:"100%",width:`${(count/maxGifting)*100}%`,background:"#2ABFBF",borderRadius:3}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:24}}>
          {/* Language split */}
          <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px",flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20}}>Language Split</div>
            {[{label:"Português",count:ptCount,color:"#2ABFBF"},{label:"English",count:enCount,color:"#4DD4D4"}].map(({label,count,color})=>(
              <div key={label} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13}}>{label}</span>
                  <span style={{fontSize:13,fontWeight:600,color}}>{count} <span style={{color:"#505050",fontWeight:400}}>({Math.round((count/total)*100)}%)</span></span>
                </div>
                <div style={{height:8,background:"#1C1C1C",borderRadius:4}}>
                  <div style={{height:"100%",width:`${(count/total)*100}%`,background:color,borderRadius:4}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly submissions */}
          <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px",flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20}}>Weekly Submissions</div>
            {data.byWeek?.length > 0 ? (
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
                {(() => {
                  const maxW = Math.max(...data.byWeek.map(x=>x.count),1);
                  return data.byWeek.slice(-10).map(({week,count})=>(
                    <div key={week} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:10,color:"#2ABFBF",fontWeight:600}}>{count}</div>
                      <div style={{width:"100%",background:"rgba(42,191,191,0.2)",borderRadius:"2px 2px 0 0",height:`${(count/maxW)*60}px`,minHeight:4}}/>
                    </div>
                  ));
                })()}
              </div>
            ) : <div style={{color:"#505050",fontSize:13}}>No data yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PERSON CARD ──────────────────────────────────────────────────
function PersonCard({ person, onClick }) {
  const ministries = parseJSON(person.current_ministries);
  const groups = parseJSON(person.special_groups);
  const langs = parseJSON(person.languages_spoken);
  const badge = ministryBadge(person.ministry_count || 0);
  const stageColor = STAGE_COLORS[person.stage] || "#505050";

  return (
    <div onClick={onClick} style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"16px 20px",cursor:"pointer",transition:"border-color 0.2s",borderLeft:`3px solid ${stageColor}`}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#2ABFBF"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="#252525"}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700}}>{person.name}</div>
          <div style={{fontSize:12,color:"#999",marginTop:2}}>{person.whatsapp || person.email || "No contact"}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={{fontSize:11,padding:"3px 8px",background:`${stageColor}22`,color:stageColor,borderRadius:2,fontWeight:600,whiteSpace:"nowrap"}}>{person.stage||"New"}</span>
          <span style={{fontSize:11,padding:"3px 8px",background:badge.bg,color:badge.color,borderRadius:2,fontWeight:600}}>{badge.label}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:person.assigned_pastor?8:0}}>
        {[person.gifting_1,person.gifting_2,person.gifting_3].filter(Boolean).map((g,i)=>(
          <span key={i} style={{fontSize:11,padding:"2px 8px",background:i===0?"rgba(42,191,191,0.15)":"#1C1C1C",color:i===0?"#2ABFBF":"#999",borderRadius:2,border:`1px solid ${i===0?"rgba(42,191,191,0.3)":"#252525"}`}}>
            {GIFTING_ICONS[g]||"◆"} {g}
          </span>
        ))}
      </div>
      {(langs.length>0||groups.length>0||person.assigned_pastor) && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6,paddingTop:6,borderTop:"1px solid #252525"}}>
          {person.assigned_pastor && <span style={{fontSize:11,color:"#2ABFBF"}}>→ {person.assigned_pastor}</span>}
          {langs.map(l=><span key={l} style={{fontSize:10,padding:"1px 6px",background:"#1C1C1C",color:"#999",borderRadius:2}}>{l}</span>)}
          {groups.map(g=><span key={g} style={{fontSize:10,padding:"1px 6px",background:"rgba(42,191,191,0.08)",color:"#4DD4D4",borderRadius:2}}>{g}</span>)}
        </div>
      )}
    </div>
  );
}

// ─── PERSON DETAIL PANEL ──────────────────────────────────────────
function PersonPanel({ personId, token, onClose, onUpdated }) {
  const [person, setPerson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [newMinistry, setNewMinistry] = useState("");
  const [showMinistryInput, setShowMinistryInput] = useState(false);

  const load = useCallback(() => {
    fetch(`${API}/person/${personId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPerson).catch(() => {});
  }, [personId, token]);

  useEffect(() => { load(); }, [load]);

  if (!person) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div style={{color:"#2ABFBF"}}>Loading…</div>
    </div>
  );

  const ministries = parseJSON(person.current_ministries);
  const langs = parseJSON(person.languages_spoken);
  const groups = parseJSON(person.special_groups);
  const scores = parseJSON(person.scores, {});
  const badge = ministryBadge(person.ministry_count || 0);

  async function updateConnection(patch) {
    setSaving(true);
    await fetch(`${API}/person/${personId}/connection`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch)
    });
    load(); onUpdated(); setSaving(false);
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setSaving(true);
    await fetch(`${API}/person/${personId}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pastor_name: pastorName || "Pastor", note_text: noteText, stage_at_time: person.stage })
    });
    setNoteText(""); load(); setSaving(false);
  }

  function toggleLang(l) {
    const current = parseJSON(person.languages_spoken);
    const next = current.includes(l) ? current.filter(x=>x!==l) : [...current,l];
    updateConnection({ languages_spoken: next });
  }

  function toggleGroup(g) {
    const current = parseJSON(person.special_groups);
    const next = current.includes(g) ? current.filter(x=>x!==g) : [...current,g];
    updateConnection({ special_groups: next });
  }

  function addMinistry(m) {
    if (!m || ministries.includes(m)) return;
    updateConnection({ current_ministries: [...ministries, m] });
    setNewMinistry(""); setShowMinistryInput(false);
  }

  function removeMinistry(m) {
    updateConnection({ current_ministries: ministries.filter(x=>x!==m) });
  }

  const sortedScores = Object.entries(scores).sort((a,b)=>b[1]-a[1]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",justifyContent:"flex-end"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"min(600px,100vw)",height:"100vh",background:"#141414",borderLeft:"1px solid #252525",overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{padding:"24px 28px",borderBottom:"1px solid #252525",borderTop:"2px solid #2ABFBF",position:"sticky",top:0,background:"#141414",zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800}}>{person.name}</div>
            <div style={{display:"flex",gap:12,marginTop:4,flexWrap:"wrap"}}>
              {person.whatsapp && (
                <a href={`https://wa.me/${person.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                  style={{fontSize:12,color:"#22c55e",textDecoration:"none"}}>💬 WhatsApp</a>
              )}
              {person.email && (
                <a href={`mailto:${person.email}`} style={{fontSize:12,color:"#2ABFBF",textDecoration:"none"}}>✉ {person.email}</a>
              )}
              <span style={{fontSize:12,color:"#505050"}}>{person.language === "PT" ? "🇧🇷 Português" : "🇺🇸 English"}</span>
              <span style={{fontSize:12,color:"#505050"}}>{timeAgo(person.submitted_at)}</span>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer",padding:"4px 8px",lineHeight:1}}>✕</button>
        </div>

        <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:24}}>

          {/* Stage */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Connection Stage</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {STAGES.map(s => (
                <button key={s} onClick={()=>updateConnection({stage:s})} disabled={saving}
                  style={{padding:"7px 14px",borderRadius:3,border:`1px solid ${person.stage===s?STAGE_COLORS[s]:"#252525"}`,
                    background:person.stage===s?`${STAGE_COLORS[s]}22`:"transparent",
                    color:person.stage===s?STAGE_COLORS[s]:"#505050",
                    fontSize:12,cursor:"pointer",fontFamily:"'Barlow',sans-serif",transition:"all 0.15s"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Pastor */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Assigned Pastor</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              {PASTOR_SUGGESTIONS.map(p=>(
                <button key={p} onClick={()=>updateConnection({assigned_pastor:p})} disabled={saving}
                  style={{padding:"6px 14px",borderRadius:3,border:`1px solid ${person.assigned_pastor===p?"#2ABFBF":"#252525"}`,
                    background:person.assigned_pastor===p?"rgba(42,191,191,0.15)":"transparent",
                    color:person.assigned_pastor===p?"#2ABFBF":"#999",fontSize:12,cursor:"pointer"}}>
                  {p}
                </button>
              ))}
            </div>
            <input placeholder="Or type another pastor name…"
              defaultValue={!PASTOR_SUGGESTIONS.includes(person.assigned_pastor)?person.assigned_pastor:""}
              onBlur={e=>{ if(e.target.value && !PASTOR_SUGGESTIONS.includes(e.target.value)) updateConnection({assigned_pastor:e.target.value}); }}
              style={{width:"100%",padding:"8px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none"}}/>
          </div>

          {/* Ministry Load */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Current Ministries</div>
              <span style={{fontSize:12,padding:"3px 10px",background:badge.bg,color:badge.color,borderRadius:2,fontWeight:600}}>{badge.label}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {ministries.map(m=>(
                <span key={m} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,padding:"4px 10px",background:"rgba(42,191,191,0.1)",color:"#4DD4D4",borderRadius:2,border:"1px solid rgba(42,191,191,0.2)"}}>
                  {m}
                  <button onClick={()=>removeMinistry(m)} style={{background:"none",border:"none",color:"#2ABFBF",cursor:"pointer",fontSize:14,lineHeight:1,padding:0}}>×</button>
                </span>
              ))}
              <button onClick={()=>setShowMinistryInput(true)} style={{fontSize:12,padding:"4px 10px",background:"#1C1C1C",color:"#505050",border:"1px dashed #252525",borderRadius:2,cursor:"pointer"}}>+ Add</button>
            </div>
            {showMinistryInput && (
              <div style={{display:"flex",gap:8}}>
                <select value={newMinistry} onChange={e=>setNewMinistry(e.target.value)}
                  style={{flex:1,padding:"8px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none"}}>
                  <option value="">Select ministry…</option>
                  {MINISTRIES_STARTER.filter(m=>!ministries.includes(m)).map(m=><option key={m} value={m}>{m}</option>)}
                  <option value="__custom">Type custom…</option>
                </select>
                <button onClick={()=>newMinistry==="__custom"?setShowMinistryInput("custom"):addMinistry(newMinistry)}
                  style={{padding:"8px 16px",background:"#2ABFBF",color:"#0A0A0A",border:"none",borderRadius:3,cursor:"pointer",fontSize:13,fontWeight:600}}>Add</button>
                <button onClick={()=>{setShowMinistryInput(false);setNewMinistry("");}}
                  style={{padding:"8px 12px",background:"#1C1C1C",color:"#999",border:"1px solid #252525",borderRadius:3,cursor:"pointer",fontSize:13}}>✕</button>
              </div>
            )}
            {showMinistryInput === "custom" && (
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <input placeholder="Type ministry name…" value={newMinistry==="__custom"?"":newMinistry}
                  onChange={e=>setNewMinistry(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addMinistry(newMinistry)}
                  style={{flex:1,padding:"8px 12px",background:"#1C1C1C",border:"1px solid #2ABFBF",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none"}}/>
                <button onClick={()=>addMinistry(newMinistry)}
                  style={{padding:"8px 16px",background:"#2ABFBF",color:"#0A0A0A",border:"none",borderRadius:3,cursor:"pointer",fontSize:13,fontWeight:600}}>Add</button>
              </div>
            )}
          </div>

          {/* Languages */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Languages Spoken</div>
            <div style={{display:"flex",gap:8}}>
              {LANGUAGES.map(l=>(
                <button key={l} onClick={()=>toggleLang(l)} disabled={saving}
                  style={{padding:"6px 16px",borderRadius:3,border:`1px solid ${langs.includes(l)?"#2ABFBF":"#252525"}`,
                    background:langs.includes(l)?"rgba(42,191,191,0.15)":"transparent",
                    color:langs.includes(l)?"#2ABFBF":"#505050",fontSize:13,cursor:"pointer"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Special Groups */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Special Groups</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SPECIAL_GROUPS.map(g=>(
                <button key={g} onClick={()=>toggleGroup(g)} disabled={saving}
                  style={{padding:"6px 16px",borderRadius:3,border:`1px solid ${groups.includes(g)?"#4DD4D4":"#252525"}`,
                    background:groups.includes(g)?"rgba(77,212,212,0.1)":"transparent",
                    color:groups.includes(g)?"#4DD4D4":"#505050",fontSize:13,cursor:"pointer"}}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Gifting Profile */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Gifting Profile</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[person.gifting_1,person.gifting_2,person.gifting_3].filter(Boolean).map((g,i)=>(
                <span key={i} style={{fontSize:12,padding:"4px 12px",background:i===0?"rgba(42,191,191,0.15)":"#1C1C1C",color:i===0?"#2ABFBF":"#999",borderRadius:2,border:`1px solid ${i===0?"rgba(42,191,191,0.3)":"#252525"}`}}>
                  {i===0?"#1 ":i===1?"#2 ":"#3 "}{GIFTING_ICONS[g]||""} {g}
                </span>
              ))}
            </div>
            {sortedScores.length > 0 && (
              <div style={{background:"#1C1C1C",borderRadius:4,padding:"16px 18px"}}>
                {sortedScores.map(([gifting,score])=>{
                  const pct = Math.round((score/10)*100);
                  return (
                    <div key={gifting} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:"#999"}}>{GIFTING_ICONS[gifting]||"◆"} {gifting}</span>
                        <span style={{fontSize:11,color:"#2ABFBF",fontWeight:600}}>{pct}%</span>
                      </div>
                      <div style={{height:4,background:"#252525",borderRadius:2}}>
                        <div style={{height:"100%",width:`${pct}%`,background:"#2ABFBF",borderRadius:2,opacity:0.7}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>Notes & Audit Trail</div>
            <div style={{marginBottom:12}}>
              <input placeholder="Your name (pastor)…" value={pastorName} onChange={e=>setPastorName(e.target.value)}
                style={{width:"100%",padding:"8px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:"3px 3px 0 0",color:"#F0F0F0",fontSize:13,outline:"none",marginBottom:2}}/>
              <textarea placeholder="Add a note…" value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3}
                style={{width:"100%",padding:"8px 12px",background:"#1C1C1C",border:"1px solid #252525",borderTop:"none",borderRadius:"0 0 3px 3px",color:"#F0F0F0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"'Barlow',sans-serif"}}/>
              <button onClick={addNote} disabled={saving||!noteText.trim()}
                style={{marginTop:8,padding:"8px 20px",background:noteText.trim()?"#2ABFBF":"#252525",color:noteText.trim()?"#0A0A0A":"#505050",border:"none",borderRadius:3,cursor:noteText.trim()?"pointer":"default",fontSize:13,fontWeight:600,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textTransform:"uppercase"}}>
                Save Note
              </button>
            </div>
            {(person.notes||[]).map(note=>(
              <div key={note.id} style={{borderLeft:"2px solid #252525",paddingLeft:12,marginBottom:14}}>
                <div style={{display:"flex",gap:8,marginBottom:4,alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#2ABFBF"}}>{note.pastor_name}</span>
                  <span style={{fontSize:11,color:"#505050"}}>{timeAgo(note.created_at)}</span>
                  {note.stage_at_time && <span style={{fontSize:10,padding:"1px 6px",background:"#1C1C1C",color:"#505050",borderRadius:2}}>{note.stage_at_time}</span>}
                </div>
                <div style={{fontSize:13,color:"#F0F0F0",lineHeight:1.5}}>{note.note_text}</div>
              </div>
            ))}
            {(!person.notes||person.notes.length===0) && <div style={{fontSize:13,color:"#505050"}}>No notes yet.</div>}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── PEOPLE TAB ───────────────────────────────────────────────────
function PeopleTab({ token }) {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [filterGifting, setFilterGifting] = useState("All");
  const [filterLang, setFilterLang] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(() => {
    fetch(`${API}/people`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setPeople(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = people.filter(p => {
    const s = search.toLowerCase();
    if (s && !p.name?.toLowerCase().includes(s) && !p.email?.toLowerCase().includes(s) && !p.whatsapp?.includes(s)) return false;
    if (filterStage !== "All" && p.stage !== filterStage) return false;
    if (filterGifting !== "All" && p.gifting_1 !== filterGifting && p.gifting_2 !== filterGifting && p.gifting_3 !== filterGifting) return false;
    if (filterLang !== "All") {
      const langs = parseJSON(p.languages_spoken);
      if (!langs.includes(filterLang)) return false;
    }
    if (filterGroup !== "All") {
      const grps = parseJSON(p.special_groups);
      if (!grps.includes(filterGroup)) return false;
    }
    return true;
  });

  return (
    <div style={{padding:"24px 28px"}}>
      <style>{css}</style>
      {/* Filters */}
      <div style={{display:"grid",gridTemplateColumns:"1fr repeat(4,auto)",gap:10,marginBottom:20,alignItems:"center"}}>
        <input placeholder="Search name, email, WhatsApp…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{padding:"9px 14px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none"}}/>
        {[
          {label:"Stage",val:filterStage,set:setFilterStage,opts:["All",...STAGES]},
          {label:"Gifting",val:filterGifting,set:setFilterGifting,opts:["All",...GIFTINGS]},
          {label:"Language",val:filterLang,set:setFilterLang,opts:["All",...LANGUAGES]},
          {label:"Group",val:filterGroup,set:setFilterGroup,opts:["All",...SPECIAL_GROUPS]},
        ].map(({label,val,set,opts})=>(
          <select key={label} value={val} onChange={e=>set(e.target.value)}
            style={{padding:"9px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:val==="All"?"#505050":"#F0F0F0",fontSize:13,outline:"none"}}>
            {opts.map(o=><option key={o} value={o}>{o==="All"?`All ${label}s`:o}</option>)}
          </select>
        ))}
      </div>

      <div style={{fontSize:12,color:"#505050",marginBottom:14}}>{filtered.length} of {people.length} people</div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
        {filtered.map(p => (
          <PersonCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} />
        ))}
        {filtered.length === 0 && (
          <div style={{gridColumn:"1/-1",padding:40,textAlign:"center",color:"#505050"}}>No people match these filters.</div>
        )}
      </div>

      {selectedId && (
        <PersonPanel personId={selectedId} token={token} onClose={()=>setSelectedId(null)} onUpdated={load} />
      )}
    </div>
  );
}

// ─── GIFTING FILTER TAB ───────────────────────────────────────────
function GiftingTab({ token }) {
  const [selectedGifting, setSelectedGifting] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback((g) => {
    if (!g) return;
    setLoading(true);
    fetch(`${API}/gifting/${encodeURIComponent(g)}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setPeople(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { if (selectedGifting) load(selectedGifting); }, [selectedGifting, load]);

  return (
    <div style={{padding:"24px 28px"}}>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:2,color:"#505050",textTransform:"uppercase",marginBottom:16}}>
        Select a gifting to find available people — sorted by ministry load (least connected first)
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:28}}>
        {GIFTINGS.map(g=>(
          <button key={g} onClick={()=>setSelectedGifting(g)}
            style={{padding:"12px 16px",background:selectedGifting===g?"rgba(42,191,191,0.15)":"#141414",
              border:`1px solid ${selectedGifting===g?"#2ABFBF":"#252525"}`,borderRadius:4,color:selectedGifting===g?"#2ABFBF":"#F0F0F0",
              fontSize:13,cursor:"pointer",textAlign:"left",fontFamily:"'Barlow',sans-serif",transition:"all 0.15s"}}>
            <span style={{marginRight:8}}>{GIFTING_ICONS[g]||"◆"}</span>{g}
          </button>
        ))}
      </div>

      {selectedGifting && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700,textTransform:"uppercase"}}>
              {GIFTING_ICONS[selectedGifting]} {selectedGifting}
            </div>
            {!loading && <div style={{fontSize:12,color:"#505050"}}>{people.length} people</div>}
          </div>
          {loading ? <div style={{color:"#505050"}}>Loading…</div> : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
              {people.map(p=>(
                <PersonCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} />
              ))}
              {people.length===0 && <div style={{color:"#505050",fontSize:13}}>No one has this gifting yet.</div>}
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <PersonPanel personId={selectedId} token={token} onClose={()=>setSelectedId(null)} onUpdated={()=>load(selectedGifting)} />
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("ltc_token") || null);
  const [tab, setTab] = useState("analytics");

  function handleLogin(pw) {
    sessionStorage.setItem("ltc_token", pw);
    setToken(pw);
  }

  if (!token) return <Login onLogin={handleLogin} />;

  const tabs = [
    { id: "analytics", label: "Analytics" },
    { id: "people", label: "People" },
    { id: "gifting", label: "By Gifting" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0A0A0A"}}>
      <style>{css}</style>

      {/* Nav */}
      <div style={{borderBottom:"1px solid #252525",background:"#0A0A0A",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 28px",display:"flex",alignItems:"center",gap:32}}>
          <div style={{padding:"16px 0",display:"flex",alignItems:"baseline",gap:10}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:"#2ABFBF"}}>LTC</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:600,textTransform:"uppercase",letterSpacing:2,color:"#505050"}}>Ministry Dashboard</span>
          </div>
          <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{padding:"10px 18px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#2ABFBF":"transparent"}`,
                  color:tab===t.id?"#2ABFBF":"#505050",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
                  letterSpacing:1,textTransform:"uppercase",cursor:"pointer",transition:"all 0.15s"}}>
                {t.label}
              </button>
            ))}
            <button onClick={()=>{sessionStorage.removeItem("ltc_token");setToken(null);}}
              style={{padding:"10px 14px",background:"none",border:"none",color:"#252525",fontSize:12,cursor:"pointer",marginLeft:8}}
              onMouseEnter={e=>e.target.style.color="#505050"} onMouseLeave={e=>e.target.style.color="#252525"}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1400,margin:"0 auto"}}>
        {tab === "analytics" && <AnalyticsTab token={token} />}
        {tab === "people" && <PeopleTab token={token} />}
        {tab === "gifting" && <GiftingTab token={token} />}
      </div>
    </div>
  );
}
