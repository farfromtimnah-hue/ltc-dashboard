import { useState, useEffect, useCallback } from "react";

const API = "https://ltc-api.farfromtimnah.workers.dev";

// ─── CARISMA LOGO (embedded) ──────────────────────────────────────
const CARISMA_LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzNTkgNTE3Ij4KICA8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMzAuNC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogMi4xLjQgQnVpbGQgMjI2KSAgLS0+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5zdDAgewogICAgICAgIGZpbGw6ICM1OTIyMWM7CiAgICAgIH0KCiAgICAgIC5zdDEgewogICAgICAgIGZpbGw6ICNiNDY5Njg7CiAgICAgIH0KCiAgICAgIC5zdDIgewogICAgICAgIGZpbGw6ICM0NDFjMTc7CiAgICAgIH0KCiAgICAgIC5zdDMgewogICAgICAgIGZpbGw6ICM2ODEyMTE7CiAgICAgIH0KCiAgICAgIC5zdDQgewogICAgICAgIGZpbGw6ICM0ZDFlMTk7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxnIGlkPSJXVlU2elgiPgogICAgPGc+CiAgICAgIDxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0yODUuNCwzMy41OWwtMzAuMzYsNTUuMTZjMTIuMSw4LjkuMTgsMTkuODUtNy40OCwyNi4zMy0yLjI4LDIuNC04LjMsMTIuOTctNC41MywxNi44OSwyNS4xMSwyLjYyLDUwLjE3LDEuNDEsNzUuNS0xLjk3LDI0LjQ1LDM2Ljc4LDI5LjYxLDc0Ljk2LDMwLjU4LDExNi45NywyLjU0LDExMC40Ni03My44LDIwMC4xNC0xNjkuOTMsMjU2LjItMzMuNDYtMTYuMTEtNTguOTItMzguNzItODQuNjYtNjUuOTgtMTkuNzgsMTcuMzYtMTguMTIsNDguOTQtNTQuMjgsNTUuNzEtMjYuNDctNDAuMjcsMzQuOTYtNzYuNzQsMTUuNzMtMTA2Ljg2LTIyLjMxLTM0Ljk1LTM4Ljk1LTc0LjI0LTM4LjgxLTExNC4xMi0zLjQ3LTE1Ljk0LTMuOTItMzIuMTMtMS4zNC00OC41Nyw1LjcyLTI5Ljg0LDEwLjAyLTY2Ljg2LDM0LjkxLTkxLjEsMzMuOTUtMTEuODgsODUuNDgsOS4yMiwxMzkuMDUtMS4xNywxNS43OS0zLjA2LDIzLjg2LTM1LjAxLDE0LjY0LTQ1LjQ4LTEuMzktMTEuMjMsMy42OC0xMi44MiwxMy43Ny05LjcxLDE3LTIuMzEsMTUuMDUtMjguMTksMjguOTctMzguMjMsNy4yOC0yNS43LDM1LjcyLTMxLjE0LDM4LjI0LTQuMDVaTTE4Mi43OCwzMzguNDljLTMyLjI2LTEuODYtNDguNzgtMjkuODktNTAuMzUtNTUuMzctMS42MS0yNi4xNiwxOS4wNC01My43Niw0Ny4wNy01Ni40OCwyMi4zOS0yLjE3LDM4LjQ4LDEyLjMxLDU0LjA3LDI1LjAxbDM0LjAzLTE2Ljc0Yy0xNC4wOC0yOS41Ni0zOC41LTQ2LjE0LTY1LjEyLTUxLjYxLTI2LjkzLTUuNTMtNTcuMTksNC41OS03Ni43OCwyMy44NC00MS45LDQxLjE4LTQ0LjU1LDEwNC43NC00LjEyLDE0Ny4zMiwyMS4wNCwyMi4xNiw1MS42MiwzMS44OSw4MS45NCwyNS41NywyNS42Ny01LjM1LDU0LjQ0LTIwLjYzLDY0LjQ1LTUwLTkuNTEtOS4yMi0xOS42Ni0xNS4zNi0zMi4wNS0yMC43MS0xMy41NywxMy43MS0yOS4yNywzMC41NC01My4xMywyOS4xNloiLz4KICAgICAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTI4NS40LDMzLjU5Yy00LjQxLTkuMjMtMTYuNDgtMTUuMS0yNS4xMi03LjI2LTUuMDgsNC42LTguOTgsOC4zMy0xMy4xMiwxMS4zMWw2LjgzLTI2LjYxYzIuMi04LjEzLDM0LjY4LDEuMjcsMzYuNDQsMTQuMTguNTEsMy43Mi0zLjcyLDYuMDEtNS4wMiw4LjM3WiIvPgogICAgICA8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNMjQ3LjU2LDExNS4wN2MtMy44MS0xMC4zOCwzLjQxLTE4LjkyLDcuNDgtMjYuMzMsMTAuMzIsMTAuMTksMjQuODYsOC43MywzNS4zOSwyMy4zLTE4LjIxLDUuODYtMzMuNDQtOS41Ny00Mi44OCwzLjAzWiIvPgogICAgICA8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMjE4LjE5LDc1Ljg3Yy0yLjAzLDYuMDktNy43Niw5LjcyLTEzLjc3LDkuNzEtNi41Ny03LjQ2LTE0LjQ2LTEyLjc5LTE1LjE1LTI1LjEzLDEzLjQ3LDIuMzksMTkuMzQsMTEuNjgsMjguOTIsMTUuNDJaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNy4xNywyNzEuOWMtOS4xMS0xNC44NS00LjM0LTMyLjk0LTEuMzQtNDguNTdsMS4zNCw0OC41N1oiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==";

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

const GIFTING_PT = {
  "Worship & Music":"Louvor & Música",
  "Gift of Helps":"Dom de Ajudar",
  "Visual Storytelling":"Narrativa Visual",
  "Digital Communication":"Comunicação Digital",
  "Intercession":"Intercessão",
  "Hospitality":"Hospitalidade",
  "Evangelism":"Evangelismo",
  "Encouragement":"Encorajamento",
  "Faith":"Fé",
  "Teaching":"Ensino",
  "Administration":"Administração",
  "Technical Arts":"Artes Técnicas",
  "Influence & Servant Leadership":"Influência & Liderança",
  "Creativity":"Criatividade",
  "Discernment & Prophetic":"Discernimento & Profético"
};

function giftingLabel(name, personLang) {
  if (!name) return "";
  if (personLang === "PT") return GIFTING_PT[name] || name;
  return name;
}

const STAGES = ["New","Reached Out","Responded","Meeting Scheduled","Meeting Done","Placed in Ministry"];
const STAGES_PT = ["Novo","Contato Feito","Respondeu","Reunião Agendada","Reunião Realizada","Colocado no Ministério"];
const SPECIAL_GROUPS_PT = ["Jovens","Link","Legacy","Serviço em Inglês","Outro"];

const STAGE_LABEL = {
  PT: {"New":"Novo","Reached Out":"Contato Feito","Responded":"Respondeu","Meeting Scheduled":"Reunião Agendada","Meeting Done":"Reunião Realizada","Placed in Ministry":"Colocado no Ministério"},
  EN: {"New":"New","Reached Out":"Reached Out","Responded":"Responded","Meeting Scheduled":"Meeting Scheduled","Meeting Done":"Meeting Done","Placed in Ministry":"Placed in Ministry"}
};

const GIFTING_LABEL_PT = {
  "Worship & Music":"Louvor & Música","Gift of Helps":"Dom de Ajudar","Visual Storytelling":"Narrativa Visual",
  "Digital Communication":"Comunicação Digital","Intercession":"Intercessão","Hospitality":"Hospitalidade",
  "Evangelism":"Evangelismo","Encouragement":"Encorajamento","Faith":"Fé","Teaching":"Ensino",
  "Administration":"Administração","Technical Arts":"Artes Técnicas",
  "Influence & Servant Leadership":"Influência & Liderança","Creativity":"Criatividade",
  "Discernment & Prophetic":"Discernimento & Profético"
};

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
  "Worship Team","Sound","Lighting","Projection","Streaming","Photo & Video",
  "Social Media","Service Experience","Consolidation","Translation",
  "Lagoinha Kids","Intercession","Volunteer Coffee","Hospitality — Welcome",
  "Parking","Setup & Teardown","GC Leader","Legacy","English Service"
];

const MINISTRY_PT = {
  "Worship Team":"Ministério de Louvor",
  "Sound":"Som",
  "Lighting":"Luz",
  "Projection":"Projeção",
  "Streaming":"Transmissão",
  "Photo & Video":"Foto & Vídeo",
  "Social Media":"Mídias Sociais",
  "Service Experience":"Experiência do Culto",
  "Consolidation":"Consolidação",
  "Translation":"Tradução",
  "Lagoinha Kids":"Lagoinha Kids",
  "Intercession":"Intercessão",
  "Volunteer Coffee":"Café dos Voluntários",
  "Hospitality — Welcome":"Recepção",
  "Parking":"Estacionamento",
  "Setup & Teardown":"Montagem",
  "GC Leader":"Líder de GC",
  "Legacy":"Legacy",
  "English Service":"Culto em Inglês"
};

function ministryLabel(name, lang, personLang) {
  var displayLang = personLang || lang;
  if (displayLang === "PT") return MINISTRY_PT[name] || name;
  return name;
}

const SPECIAL_GROUPS = ["Rocket","Link","Legacy","Shine","Hero","Culto Hope","Culto Fé","English Service","Other"];
const LANGUAGES = ["English","Português","Both"];

const DEFAULT_TEMPLATE_PT = "Oi, {{name}}! Tudo bem? 😊 Que alegria ter você conosco! Vi que você tem o dom de {{gifting}} e isso é incrível! Adoraria marcar um tempo com você para te conhecer melhor e ver como podemos servir os seus dons aqui na Lagoinha Tampa. Quando seria um bom momento?";
const DEFAULT_TEMPLATE_EN = "Hi {{name}}! So glad you are here with us! I saw that you have the gifting of {{gifting}} and that is amazing! I would love to find a time to meet with you and see how we can best serve your giftings here at Lagoinha Tampa. When would be a good time?";

const L = {
  PT: {
    dashboard:"Painel Pastoral",analytics:"Análise",people:"Pessoas",byGifting:"Por Dom",
    logout:"Sair",enter:"Entrar",password:"Digite a senha do painel",
    totalSub:"Total de Respostas",placedMin:"Colocados no Ministério",
    awaitContact:"Aguardando Contato",inProgress:"Em Andamento",
    pipeline:"Funil de Conexão",topGiftings:"Principais Dons",
    langSplit:"Idiomas",weeklySub:"Respostas Semanais",noData:"Sem dados ainda",
    searchPlaceholder:"Buscar nome, email, WhatsApp…",
    allStages:"Todos os Estágios",allGiftings:"Todos os Dons",
    allLanguages:"Todos os Idiomas",allGroups:"Todos os Grupos",allPastors:"Todos os Pastores",
    filterPastor:"Pastor",noMatch:"Nenhuma pessoa encontrada.",
    connStage:"Estágio de Conexão",assignedPastor:"Pastor Responsável",
    orType:"Ou digite outro nome…",currentMin:"Ministérios Atuais",
    langSpoken:"Idiomas Falados",specialGroups:"Grupos Especiais",
    giftingProfile:"Perfil de Dons",notesAudit:"Notas e Histórico",
    yourName:"Seu nome (pastor)…",addNote:"Adicionar nota…",saveNote:"Salvar Nota",
    noNotes:"Sem notas ainda.",loading:"Carregando…",available:"Disponível",
    selectGifting:"Selecione um dom para ver pessoas disponíveis — ordenado por carga ministerial",
    noPeople:"Ninguém tem este dom ainda.",
    ministryHealth:"Saúde dos Ministérios",
    settings:"Configurações",
    settingsTitle:"Configurações do Painel",
    templatePT:"Modelo de Mensagem — Português",
    templateEN:"Modelo de Mensagem — English",
    templateHint:"Variáveis disponíveis: {{name}} e {{gifting}}",
    saveSettings:"Salvar",
    settingsSaved:"Salvo!",
    whatsappMsg:"WhatsApp",
    carisma:"Carisma",
    carismaLabel:"Carisma",
  },
  EN: {
    dashboard:"Ministry Dashboard",analytics:"Analytics",people:"People",byGifting:"By Gifting",
    logout:"Logout",enter:"Enter",password:"Enter dashboard password",
    totalSub:"Total Submissions",placedMin:"Placed in Ministry",
    awaitContact:"Awaiting Contact",inProgress:"In Progress",
    pipeline:"Connection Pipeline",topGiftings:"Top Giftings",
    langSplit:"Language Split",weeklySub:"Weekly Submissions",noData:"No data yet",
    searchPlaceholder:"Search name, email, WhatsApp…",
    allStages:"All Stages",allGiftings:"All Giftings",
    allLanguages:"All Languages",allGroups:"All Groups",allPastors:"All Pastors",
    filterPastor:"Pastor",noMatch:"No people match these filters.",
    connStage:"Connection Stage",assignedPastor:"Assigned Pastor",
    orType:"Or type another pastor name…",currentMin:"Current Ministries",
    langSpoken:"Languages Spoken",specialGroups:"Special Groups",
    giftingProfile:"Gifting Profile",notesAudit:"Notes & Audit Trail",
    yourName:"Your name (pastor)…",addNote:"Add a note…",saveNote:"Save Note",
    noNotes:"No notes yet.",loading:"Loading…",available:"Available",
    selectGifting:"Select a gifting to find available people — sorted by ministry load",
    noPeople:"No one has this gifting yet.",
    ministryHealth:"Ministry Health",
    settings:"Settings",
    settingsTitle:"Dashboard Settings",
    templatePT:"Message Template — Português",
    templateEN:"Message Template — English",
    templateHint:"Available variables: {{name}} and {{gifting}}",
    saveSettings:"Save",
    settingsSaved:"Saved!",
    whatsappMsg:"WhatsApp",
    carisma:"Carisma",
    carismaLabel:"Carisma",
  }
};

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

function parseCarisma(val) {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
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

// ─── FIX: buildWhatsAppURL now accepts skipTemplate flag ──────────
// PersonCard (active): skipTemplate = false  → uses template
// PlacedCard (placed): skipTemplate = true   → empty chat, no ?text=
function buildWhatsAppURL(person, templatePT, templateEN, skipTemplate) {
  if (!person.whatsapp) return null;
  const phone = person.whatsapp.replace(/\D/g, "");
  if (skipTemplate) return "https://wa.me/" + phone;
  const lang = person.language === "EN" ? "EN" : "PT";
  const template = lang === "EN"
    ? (templateEN || DEFAULT_TEMPLATE_EN)
    : (templatePT || DEFAULT_TEMPLATE_PT);
  const firstName = (person.name || "").split(" ")[0];
  const gifting = person.gifting_1 || "";
  const message = template
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{gifting\}\}/g, gifting);
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
}

// ─── CARISMA BADGE COMPONENT ──────────────────────────────────────
// Used in PersonCard (size="sm") and PersonPanel (size="lg")
function CarismaBadge({ levels }) {
  if (!levels || levels.length === 0) return null;
  return (
    <>
      {levels.map(lv => (
        <span key={lv} style={{
          display:"inline-flex", alignItems:"center", gap:"3px",
          background:"rgba(89,34,28,0.18)", border:"1px solid rgba(180,105,104,0.45)",
          borderRadius:"3px", padding:"2px 6px",
          fontSize:"10px", color:"#b46968", fontWeight:700, whiteSpace:"nowrap"
        }}>
          <img src={CARISMA_LOGO} alt="Carisma" style={{ width:13, height:13, objectFit:"contain", verticalAlign:"middle" }} />
          {lv}
        </span>
      ))}
    </>
  );
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────
function SettingsModal({ token, t, onClose, onSaved }) {
  const [templatePT, setTemplatePT] = useState("");
  const [templateEN, setTemplateEN] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setTemplatePT(d.whatsapp_template_pt || DEFAULT_TEMPLATE_PT);
        setTemplateEN(d.whatsapp_template_en || DEFAULT_TEMPLATE_EN);
      })
      .catch(() => {
        setTemplatePT(DEFAULT_TEMPLATE_PT);
        setTemplateEN(DEFAULT_TEMPLATE_EN);
      });
  }, [token]);

  async function handleSave() {
    setSaving(true);
    await fetch(`${API}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ whatsapp_template_pt: templatePT, whatsapp_template_en: templateEN })
    });
    setSaving(false);
    setSaved(true);
    onSaved({ whatsapp_template_pt: templatePT, whatsapp_template_en: templateEN });
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{width:"min(560px,95vw)",background:"#141414",border:"1px solid #252525",borderTop:"2px solid #2ABFBF",borderRadius:4,padding:"32px 36px",display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>{t.settingsTitle}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{fontSize:12,color:"#505050",background:"#1C1C1C",padding:"8px 12px",borderRadius:3,borderLeft:"2px solid #2ABFBF"}}>
          {t.templateHint}
        </div>
        <div>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.templatePT}</div>
          <textarea value={templatePT} onChange={e => setTemplatePT(e.target.value)} rows={5}
            style={{width:"100%",padding:"10px 14px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"'Barlow',sans-serif",lineHeight:1.6}}/>
        </div>
        <div>
          <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.templateEN}</div>
          <textarea value={templateEN} onChange={e => setTemplateEN(e.target.value)} rows={5}
            style={{width:"100%",padding:"10px 14px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"'Barlow',sans-serif",lineHeight:1.6}}/>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
          {saved && <span style={{fontSize:13,color:"#22c55e"}}>{t.settingsSaved}</span>}
          <button onClick={onClose}
            style={{padding:"9px 20px",background:"#1C1C1C",border:"1px solid #333",borderRadius:3,color:"#999",fontSize:13,cursor:"pointer"}}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{padding:"9px 24px",background:"#2ABFBF",border:"none",borderRadius:3,color:"#0A0A0A",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>
            {saving ? "..." : t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
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
function AnalyticsTab({ token, t }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/analytics`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <div style={{padding:40,color:"#505050"}}>{t ? t.loading : "Loading..."}</div>;

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
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}>
        {[
          {label:t.totalSub,value:data.total,accent:"#2ABFBF"},
          {label:t.placedMin,value:stageFunnel.find(x=>x.stage==="Placed in Ministry")?.count||0,accent:"#22c55e"},
          {label:t.awaitContact,value:stageFunnel.find(x=>x.stage==="New")?.count||0,accent:"#ef4444"},
          {label:t.inProgress,value:stageFunnel.filter(x=>!["New","Placed in Ministry"].includes(x.stage)).reduce((a,b)=>a+b.count,0),accent:"#f59e0b"},
        ].map(({label,value,accent})=>(
          <div key={label} style={{background:"#141414",border:"1px solid #252525",borderTop:`2px solid ${accent}`,borderRadius:4,padding:"20px 24px"}}>
            <div style={{fontSize:36,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:accent}}>{value}</div>
            <div style={{fontSize:12,color:"#999",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20,color:"#F0F0F0"}}>{t.pipeline}</div>
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
        <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20}}>{t.topGiftings}</div>
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
          <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px",flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20}}>{t.langSplit}</div>
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

          <div style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"24px 28px",flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:20}}>{t.weeklySub}</div>
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
            ) : <div style={{color:"#505050",fontSize:13}}>{t.noData}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PERSON CARD ──────────────────────────────────────────────────
function PersonCard({ person, onClick, templatePT, templateEN, t }) {
  const ministries = parseJSON(person.current_ministries);
  const groups = parseJSON(person.special_groups);
  const langs = parseJSON(person.languages_spoken);
  const badge = ministryBadge(person.ministry_count || 0);
  const stageColor = STAGE_COLORS[person.stage] || "#505050";
  const carisma = parseCarisma(person.carisma_completed);
  // PersonCard: use template (skipTemplate = false)
  const waURL = buildWhatsAppURL(person, templatePT, templateEN, false);

  return (
    <div onClick={onClick} style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"16px 20px",cursor:"pointer",transition:"border-color 0.2s",borderLeft:`3px solid ${stageColor}`}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#2ABFBF"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="#252525"}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {person.photo_url ? (
            <img src={person.photo_url} alt={person.name} style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",border:"2px solid #2ABFBF",flexShrink:0}} />
          ) : (
            <div style={{width:40,height:40,borderRadius:"50%",background:"#252525",border:"1px solid #333",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:"#505050"}}>
              {(person.name||"?")[0].toUpperCase()}
            </div>
          )}
          <div>
            {/* Name row with Carisma badges inline */}
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700}}>{person.name}</span>
              <CarismaBadge levels={carisma} />
            </div>
            <div style={{fontSize:12,color:"#999",marginTop:2}}>{person.whatsapp || person.email || "No contact"}</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={{fontSize:11,padding:"3px 8px",background:`${stageColor}22`,color:stageColor,borderRadius:2,fontWeight:600,whiteSpace:"nowrap"}}>{person.stage||"New"}</span>
          <span style={{fontSize:11,padding:"3px 8px",background:badge.bg,color:badge.color,borderRadius:2,fontWeight:600}}>{badge.label}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
        {[person.gifting_1,person.gifting_2,person.gifting_3].map(g=>typeof g==="object"?null:(g||null)).filter(Boolean).map((g,i)=>(
          <span key={i} style={{fontSize:11,padding:"2px 8px",background:i===0?"rgba(42,191,191,0.15)":"#1C1C1C",color:i===0?"#2ABFBF":"#999",borderRadius:2,border:`1px solid ${i===0?"rgba(42,191,191,0.3)":"#252525"}`}}>
            {GIFTING_ICONS[g]||"◆"} {giftingLabel(g, person.language)}
          </span>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {person.assigned_pastor && <span style={{fontSize:11,color:"#2ABFBF"}}>→ {person.assigned_pastor}</span>}
          {langs.map(l=><span key={l} style={{fontSize:10,padding:"1px 6px",background:"#1C1C1C",color:"#999",borderRadius:2}}>{l}</span>)}
          {groups.map(g=><span key={g} style={{fontSize:10,padding:"1px 6px",background:"rgba(42,191,191,0.08)",color:"#4DD4D4",borderRadius:2}}>{g}</span>)}
        </div>
        {waURL && (
          <button
            onClick={e=>{ e.stopPropagation(); window.open(waURL, "_blank"); }}
            style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"4px 10px",background:"rgba(37,211,102,0.12)",color:"#25D366",borderRadius:2,border:"1px solid rgba(37,211,102,0.25)",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Barlow',sans-serif"}}>
            💬 {t.whatsappMsg}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PLACED CARD (Victory View) ───────────────────────────────────
function PlacedCard({ person, onClick, templatePT, templateEN, t }) {
  const ministries = parseJSON(person.current_ministries);
  const carisma = parseCarisma(person.carisma_completed);
  // FIX: PlacedCard opens empty chat — no template pre-fill (skipTemplate = true)
  const waURL = buildWhatsAppURL(person, templatePT, templateEN, true);

  return (
    <div onClick={onClick} style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"18px 20px",cursor:"pointer",borderTop:"2px solid #2ABFBF",transition:"border-color 0.2s",position:"relative"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#2ABFBF"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="#252525"}>

      {/* Check mark */}
      <div style={{position:"absolute",top:12,right:12,width:22,height:22,borderRadius:"50%",background:"rgba(42,191,191,0.15)",border:"1px solid rgba(42,191,191,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#2ABFBF",fontWeight:700}}>✓</div>

      {/* Photo + Name */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.name} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"2px solid #2ABFBF",flexShrink:0}} />
        ) : (
          <div style={{width:48,height:48,borderRadius:"50%",background:"#252525",border:"2px solid #2ABFBF33",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,color:"#505050"}}>
            {(person.name||"?")[0].toUpperCase()}
          </div>
        )}
        <div>
          {/* Name + Carisma badges inline */}
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700}}>{person.name}</span>
            <CarismaBadge levels={carisma} />
          </div>
          {person.gifting_1 && (
            <span style={{fontSize:11,padding:"2px 8px",background:"rgba(42,191,191,0.15)",color:"#2ABFBF",borderRadius:2,border:"1px solid rgba(42,191,191,0.3)"}}>
              {GIFTING_ICONS[person.gifting_1]||"◆"} {giftingLabel(person.gifting_1, person.language)}
            </span>
          )}
        </div>
      </div>

      {/* Ministries they landed in */}
      {ministries.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:waURL?10:0}}>
          {ministries.map(function(m){
            return (
              <span key={m} style={{fontSize:11,padding:"2px 8px",background:"rgba(42,191,191,0.08)",color:"#4DD4D4",borderRadius:2,border:"1px solid rgba(42,191,191,0.15)"}}>
                {ministryLabel(m, "EN", person.language)}
              </span>
            );
          })}
        </div>
      )}

      {/* WhatsApp — empty chat, no template */}
      {waURL && (
        <div style={{marginTop:8}}>
          <button
            onClick={function(e){ e.stopPropagation(); window.open(waURL, "_blank"); }}
            style={{fontSize:11,padding:"4px 10px",background:"rgba(37,211,102,0.12)",color:"#25D366",borderRadius:2,border:"1px solid rgba(37,211,102,0.25)",cursor:"pointer",fontFamily:"'Barlow',sans-serif"}}>
            {"💬 "}{t.whatsappMsg}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PERSON DETAIL PANEL ──────────────────────────────────────────
function PersonPanel({ personId, token, onClose, onUpdated, t, lang, templatePT, templateEN }) {
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
      <div style={{color:"#2ABFBF"}}>{t ? t.loading : "Loading..."}</div>
    </div>
  );

  const ministries = parseJSON(person.current_ministries);
  const langs = parseJSON(person.languages_spoken);
  const groups = parseJSON(person.special_groups);
  const scores = parseJSON(person.scores, {});
  const badge = ministryBadge(person.ministry_count || 0);
  const carisma = parseCarisma(person.carisma_completed);
  // PersonPanel WhatsApp: same as PersonCard — uses template
  const waURL = buildWhatsAppURL(person, templatePT, templateEN, false);

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

  function toggleCarisma(level) {
    const next = carisma.includes(level)
      ? carisma.filter(x => x !== level)
      : [...carisma, level];
    updateConnection({ carisma_completed: next });
  }

  function addMinistry(m) {
    if (!m || ministries.includes(m)) return;
    updateConnection({ current_ministries: [...ministries, m] });
    setNewMinistry(""); setShowMinistryInput(false);
  }

  function removeMinistry(m) {
    updateConnection({ current_ministries: ministries.filter(x=>x!==m) });
  }

  const SHORT_TO_FULL = {visual:"Visual Storytelling",encouragement:"Encouragement",creativity:"Creativity",worship:"Worship & Music",hospitality:"Hospitality",faith:"Faith",administration:"Administration",prophetic:"Discernment & Prophetic",helps:"Gift of Helps",digital:"Digital Communication",intercession:"Intercession",evangelism:"Evangelism",teaching:"Teaching",technical:"Technical Arts",leadership:"Influence & Servant Leadership"};
  const sortedScores = Object.entries(scores).map(([k,v])=>[SHORT_TO_FULL[k]||k,Math.min(Number(v),100)]).sort((a,b)=>b[1]-a[1]);

  const CARISMA_LEVELS = ["1 Ano", "Masters"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",justifyContent:"flex-end"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"min(600px,100vw)",height:"100vh",background:"#141414",borderLeft:"1px solid #252525",overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{padding:"24px 28px",borderBottom:"1px solid #252525",borderTop:"2px solid #2ABFBF",position:"sticky",top:0,background:"#141414",zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.name} style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"2px solid #2ABFBF",flexShrink:0}} />
            ) : (
              <div style={{width:56,height:56,borderRadius:"50%",background:"#252525",border:"1px solid #333",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:700,color:"#505050"}}>
                {(person.name||"?")[0].toUpperCase()}
              </div>
            )}
            <div>
              {/* Name + Carisma badges in panel header */}
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800}}>{person.name}</span>
                <CarismaBadge levels={carisma} />
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                {waURL && (
                  <a href={waURL} target="_blank" rel="noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,padding:"5px 12px",background:"rgba(37,211,102,0.12)",color:"#25D366",borderRadius:3,border:"1px solid rgba(37,211,102,0.25)",textDecoration:"none",fontWeight:600}}>
                    💬 {t.whatsappMsg}
                  </a>
                )}
                {person.email && (
                  <a href={`mailto:${person.email}`} style={{fontSize:12,color:"#2ABFBF",textDecoration:"none"}}>✉ {person.email}</a>
                )}
                <span style={{fontSize:12,color:"#505050"}}>{person.language === "PT" ? "🇧🇷 Português" : "🇺🇸 English"}</span>
                <span style={{fontSize:12,color:"#505050"}}>{timeAgo(person.submitted_at)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#999",fontSize:20,cursor:"pointer",padding:"4px 8px",lineHeight:1}}>✕</button>
        </div>

        <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:24}}>

          {/* Stage */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.connStage}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {STAGES.map(s => (
                <button key={s} onClick={()=>updateConnection({stage:s})} disabled={saving}
                  style={{padding:"7px 14px",borderRadius:3,border:`1px solid ${person.stage===s?STAGE_COLORS[s]:"#252525"}`,
                    background:person.stage===s?`${STAGE_COLORS[s]}22`:"transparent",
                    color:person.stage===s?STAGE_COLORS[s]:"#505050",
                    fontSize:12,cursor:"pointer",fontFamily:"'Barlow',sans-serif",transition:"all 0.15s"}}>
                  {(STAGE_LABEL[lang||"EN"]||STAGE_LABEL.EN)[s]||s}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Pastor */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.assignedPastor}</div>
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
            <input placeholder={t.orType}
              defaultValue={!PASTOR_SUGGESTIONS.includes(person.assigned_pastor)?person.assigned_pastor:""}
              onBlur={e=>{ if(e.target.value && !PASTOR_SUGGESTIONS.includes(e.target.value)) updateConnection({assigned_pastor:e.target.value}); }}
              style={{width:"100%",padding:"8px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none"}}/>
          </div>

          {/* Ministry Load */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.currentMin}</div>
              <span style={{fontSize:12,padding:"3px 10px",background:badge.bg,color:badge.color,borderRadius:2,fontWeight:600}}>{badge.label}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {ministries.map(m=>(
                <span key={m} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,padding:"4px 10px",background:"rgba(42,191,191,0.1)",color:"#4DD4D4",borderRadius:2,border:"1px solid rgba(42,191,191,0.2)"}}>
                  {ministryLabel(m, "EN", person.language)}
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

          {/* Carisma — Pastor can toggle levels */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
              <img src={CARISMA_LOGO} alt="" style={{width:14,height:14,objectFit:"contain",verticalAlign:"middle"}} />
              {t.carismaLabel}
            </div>
            <div style={{display:"flex",gap:8}}>
              {CARISMA_LEVELS.map(level => {
                const active = carisma.includes(level);
                return (
                  <button key={level} onClick={() => toggleCarisma(level)} disabled={saving}
                    style={{
                      display:"flex", alignItems:"center", gap:5,
                      padding:"7px 16px", borderRadius:3,
                      border:`1px solid ${active?"rgba(180,105,104,0.7)":"#252525"}`,
                      background:active?"rgba(89,34,28,0.2)":"transparent",
                      color:active?"#b46968":"#505050",
                      fontSize:13, cursor:"pointer", fontFamily:"'Barlow',sans-serif",
                      transition:"all 0.15s"
                    }}>
                    {active && <img src={CARISMA_LOGO} alt="" style={{width:13,height:13,objectFit:"contain"}} />}
                    {level}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:11,color:"#505050",marginTop:6,lineHeight:1.5}}>
              {lang === "PT"
                ? "Escola teológica da Lagoinha. Exige 4h/mês de serviço ministerial documentado."
                : "Lagoinha theological school. Requires 4h/month of documented ministry service."}
            </div>
          </div>

          {/* Languages */}
          <div>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.langSpoken}</div>
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
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.specialGroups}</div>
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
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.giftingProfile}</div>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {[person.gifting_1,person.gifting_2,person.gifting_3].map(g=>typeof g==="object"?null:(g||null)).filter(Boolean).map((g,i)=>(
                <span key={i} style={{fontSize:12,padding:"4px 12px",background:i===0?"rgba(42,191,191,0.15)":"#1C1C1C",color:i===0?"#2ABFBF":"#999",borderRadius:2,border:`1px solid ${i===0?"rgba(42,191,191,0.3)":"#252525"}`}}>
                  {i===0?"#1 ":i===1?"#2 ":"#3 "}{GIFTING_ICONS[g]||""} {giftingLabel(g, person.language)}
                </span>
              ))}
            </div>
            {sortedScores.length > 0 && (
              <div style={{background:"#1C1C1C",borderRadius:4,padding:"16px 18px"}}>
                {sortedScores.map(([gifting,score])=>{
                  const pct = Math.min(Math.round(Number(score)),100);
                  return (
                    <div key={gifting} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:"#999"}}>{GIFTING_ICONS[gifting]||"◆"} {giftingLabel(gifting, person.language)}</span>
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
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:2,color:"#505050",marginBottom:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{t.notesAudit}</div>
            <div style={{marginBottom:12}}>
              <input placeholder={t.yourName} value={pastorName} onChange={e=>setPastorName(e.target.value)}
                style={{width:"100%",padding:"8px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:"3px 3px 0 0",color:"#F0F0F0",fontSize:13,outline:"none",marginBottom:2}}/>
              <textarea placeholder={t.addNote} value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3}
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
            {(!person.notes||person.notes.length===0) && <div style={{fontSize:13,color:"#505050"}}>{t.noNotes}</div>}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── PEOPLE TAB ───────────────────────────────────────────────────
async function executeSplit(people, token, reload, setDone, setSaving, ratio, setShowSplit) {
  setSaving(true);
  setDone("");
  const unassigned = people.filter(p => !p.assigned_pastor);
  const englishSpeakers = unassigned.filter(p => {
    const langs = JSON.parse(p.languages_spoken || "[]");
    return langs.includes("English") || langs.includes("Both");
  });
  const ptOnly = unassigned.filter(p => {
    const langs = JSON.parse(p.languages_spoken || "[]");
    return !langs.includes("English") && !langs.includes("Both");
  });

  const aliceList = [...englishSpeakers];
  const rafaList = [];
  const pct = ratio === "7525" ? 0.75 : 0.5;
  const aliceCount = Math.round(ptOnly.length * pct);
  ptOnly.forEach((p, i) => {
    if (i < aliceCount) aliceList.push(p);
    else rafaList.push(p);
  });

  const assigns = [
    ...aliceList.map(p => ({id: p.id, pastor: "Pra Alice"})),
    ...rafaList.map(p => ({id: p.id, pastor: "Pr Rafa"}))
  ];

  await Promise.all(assigns.map(a =>
    fetch(`${API}/person/${a.id}/connection`, {
      method: "PUT",
      headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
      body: JSON.stringify({assigned_pastor: a.pastor})
    })
  ));

  reload();
  setSaving(false);
  setShowSplit(false);
  setDone("Done! " + englishSpeakers.length + " English -> Pra Alice. " + aliceCount + " PT -> Pra Alice. " + rafaList.length + " PT -> Pr Rafa.");
}

function PeopleTab({ token, t, lang, templatePT, templateEN }) {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [filterGifting, setFilterGifting] = useState("All");
  const [filterLang, setFilterLang] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterPastor, setFilterPastor] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [showSplit, setShowSplit] = useState(false);
  const [splitRatio, setSplitRatio] = useState("5050");
  const [splitDone, setSplitDone] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("active");

  const load = useCallback(() => {
    fetch(`${API}/people`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setPeople(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const activePeople = people.filter(p => p.stage !== "Placed in Ministry");
  const placedPeople = people.filter(p => p.stage === "Placed in Ministry");
  const currentPool = view === "active" ? activePeople : placedPeople;

  const filtered = currentPool.filter(p => {
    const s = search.toLowerCase();
    if (s && !p.name?.toLowerCase().includes(s) && !p.email?.toLowerCase().includes(s) && !p.whatsapp?.includes(s)) return false;
    if (view === "active") {
      if (filterStage !== "All" && p.stage !== filterStage) return false;
    }
    if (filterGifting !== "All" && p.gifting_1 !== filterGifting && p.gifting_2 !== filterGifting && p.gifting_3 !== filterGifting) return false;
    if (filterLang !== "All") {
      const langs = parseJSON(p.languages_spoken);
      if (!langs.includes(filterLang)) return false;
    }
    if (filterGroup !== "All") {
      const grps = parseJSON(p.special_groups);
      if (!grps.includes(filterGroup)) return false;
    }
    if (filterPastor !== "All" && p.assigned_pastor !== filterPastor) return false;
    return true;
  });

  const pastorOptions = ["All",...Array.from(new Set(people.map(p=>p.assigned_pastor).filter(Boolean)))];
  const activeStages = STAGES.filter(s => s !== "Placed in Ministry");

  return (
    <div style={{padding:"24px 28px"}}>
      <style>{css}</style>

      {/* Active / Placed sub-view toggle */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <button onClick={()=>{ setView("active"); setFilterStage("All"); }}
          style={{padding:"8px 20px",borderRadius:20,border:`1px solid ${view==="active"?"#2ABFBF":"#252525"}`,background:view==="active"?"rgba(42,191,191,0.12)":"transparent",color:view==="active"?"#2ABFBF":"#505050",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,cursor:"pointer",transition:"all 0.15s"}}>
          {lang==="PT" ? "Em Andamento" : "Active"}
          <span style={{marginLeft:8,fontSize:11,padding:"1px 7px",background:view==="active"?"rgba(42,191,191,0.2)":"#1C1C1C",borderRadius:10,color:view==="active"?"#2ABFBF":"#505050"}}>{activePeople.length}</span>
        </button>
        <button onClick={()=>{ setView("placed"); setFilterStage("All"); }}
          style={{padding:"8px 20px",borderRadius:20,border:`1px solid ${view==="placed"?"#2ABFBF":"#252525"}`,background:view==="placed"?"rgba(42,191,191,0.12)":"transparent",color:view==="placed"?"#2ABFBF":"#505050",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,cursor:"pointer",transition:"all 0.15s"}}>
          {lang==="PT" ? "Colocados" : "Placed"}
          <span style={{marginLeft:8,fontSize:11,padding:"1px 7px",background:view==="placed"?"rgba(42,191,191,0.2)":"#1C1C1C",borderRadius:10,color:view==="placed"?"#2ABFBF":"#505050"}}>{placedPeople.length}</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{display:"grid",gridTemplateColumns:"1fr repeat(5,auto)",gap:10,marginBottom:12,alignItems:"center"}}>
        <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
          style={{padding:"9px 14px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:"#F0F0F0",fontSize:13,outline:"none"}}/>
        {view === "active" && (
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
            style={{padding:"9px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:filterStage==="All"?"#888":"#F0F0F0",fontSize:13,outline:"none",WebkitAppearance:"menulist"}}>
            {["All",...activeStages].map(o=><option key={o} value={o} style={{background:"#1C1C1C",color:"#F0F0F0"}}>{o==="All"?t.allStages:o}</option>)}
          </select>
        )}
        {[
          {label:t.allGiftings,val:filterGifting,set:setFilterGifting,opts:["All",...GIFTINGS]},
          {label:t.allLanguages,val:filterLang,set:setFilterLang,opts:["All",...LANGUAGES]},
          {label:t.allGroups,val:filterGroup,set:setFilterGroup,opts:["All",...SPECIAL_GROUPS]},
          {label:t.allPastors,val:filterPastor,set:setFilterPastor,opts:pastorOptions},
        ].map(({label,val,set,opts})=>(
          <select key={label} value={val} onChange={e=>set(e.target.value)}
            style={{padding:"9px 12px",background:"#1C1C1C",border:"1px solid #252525",borderRadius:3,color:val==="All"?"#888":"#F0F0F0",fontSize:13,outline:"none",WebkitAppearance:"menulist"}}>
            {opts.map(o=><option key={o} value={o} style={{background:"#1C1C1C",color:"#F0F0F0"}}>{o==="All"?label:o}</option>)}
          </select>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:12,color:"#505050"}}>{filtered.length} / {currentPool.length}</div>
        {view === "active" && (
          <button onClick={()=>setShowSplit(true)}
            style={{padding:"6px 14px",background:"rgba(42,191,191,0.1)",border:"1px solid rgba(42,191,191,0.3)",borderRadius:3,color:"#2ABFBF",fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>
            {"⚡ "}{lang==="PT"?"Distribuir Pessoas":"Split Assignments"}
          </button>
        )}
        {view === "placed" && placedPeople.length > 0 && (
          <div style={{fontSize:12,color:"#2ABFBF"}}>{"🏠 "}{lang==="PT" ? `${placedPeople.length} pessoa${placedPeople.length!==1?"s":""} colocada${placedPeople.length!==1?"s":""}` : `${placedPeople.length} person${placedPeople.length!==1?"s":""} placed`}</div>
        )}
      </div>

      {showSplit && (
        <div style={{background:"#141414",border:"1px solid #2ABFBF",borderRadius:4,padding:"20px 24px",marginBottom:16}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,textTransform:"uppercase",marginBottom:8,color:"#F0F0F0"}}>
            {lang==="PT"?"Distribuir Pessoas Não Atribuídas":"Split Unassigned People"}
          </div>
          <div style={{fontSize:12,color:"#777",marginBottom:14,lineHeight:1.6}}>
            {lang==="PT"
              ? "Inglês/Ambos → Pra Alice automaticamente. Português → dividido entre os pastores."
              : "English/Both speakers → Pra Alice automatically. Portuguese → split between pastors."}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button onClick={()=>setSplitRatio("5050")}
              style={{padding:"8px 16px",borderRadius:3,border:`1px solid ${splitRatio==="5050"?"#2ABFBF":"#333"}`,background:splitRatio==="5050"?"rgba(42,191,191,0.15)":"#1C1C1C",color:splitRatio==="5050"?"#2ABFBF":"#777",fontSize:12,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
              50 / 50
            </button>
            <button onClick={()=>setSplitRatio("7525")}
              style={{padding:"8px 16px",borderRadius:3,border:`1px solid ${splitRatio==="7525"?"#2ABFBF":"#333"}`,background:splitRatio==="7525"?"rgba(42,191,191,0.15)":"#1C1C1C",color:splitRatio==="7525"?"#2ABFBF":"#777",fontSize:12,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>
              75 (Alice) / 25 (Rafa)
            </button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>executeSplit(people,token,load,setSplitDone,setSaving,splitRatio,setShowSplit)}
              style={{padding:"9px 20px",background:"#2ABFBF",border:"none",borderRadius:3,color:"#0A0A0A",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:1,cursor:"pointer"}}>
              {lang==="PT"?"Confirmar":"Confirm Split"}
            </button>
            <button onClick={()=>setShowSplit(false)}
              style={{padding:"9px 16px",background:"#1C1C1C",border:"1px solid #333",borderRadius:3,color:"#777",fontSize:12,cursor:"pointer"}}>
              {lang==="PT"?"Cancelar":"Cancel"}
            </button>
          </div>
          {splitDone && <div style={{marginTop:12,fontSize:12,color:"#2ABFBF"}}>{splitDone}</div>}
        </div>
      )}

      {/* Cards grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
        {view === "active" && filtered.map(p => (
          <PersonCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} templatePT={templatePT} templateEN={templateEN} t={t} />
        ))}
        {view === "placed" && filtered.map(p => (
          <PlacedCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} templatePT={templatePT} templateEN={templateEN} t={t} />
        ))}
        {filtered.length === 0 && (
          <div style={{gridColumn:"1/-1",padding:40,textAlign:"center",color:"#505050"}}>
            {view === "placed"
              ? (lang==="PT" ? "Ninguém colocado ainda. Em breve! 🏠" : "No one placed yet. Keep going! 🏠")
              : t.noMatch}
          </div>
        )}
      </div>

      {selectedId && (
        <PersonPanel personId={selectedId} token={token} onClose={()=>setSelectedId(null)} onUpdated={load} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} />
      )}
    </div>
  );
}

// ─── GIFTING FILTER TAB ───────────────────────────────────────────
function GiftingTab({ token, t, lang, templatePT, templateEN }) {
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
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:2,color:"#505050",textTransform:"uppercase",marginBottom:16}}>{t.selectGifting}</div>
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
          {loading ? <div style={{color:"#505050"}}>{t.loading}</div> : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
              {people.map(p=>(
                <PersonCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} templatePT={templatePT} templateEN={templateEN} t={t} />
              ))}
              {people.length===0 && <div style={{color:"#505050",fontSize:13}}>{t.noPeople}</div>}
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <PersonPanel personId={selectedId} token={token} onClose={()=>setSelectedId(null)} onUpdated={()=>load(selectedGifting)} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} />
      )}
    </div>
  );
}

// ─── MINISTRY HEALTH TAB ──────────────────────────────────────────
const MINISTRY_HEALTH_DATA = [
  { name:"Worship Team", min:6, ideal:10, current:8, leader:"Kênia" },
  { name:"Sound", min:2, ideal:4, current:2, leader:"Cláudio" },
  { name:"Lighting", min:2, ideal:4, current:3, leader:"Kevin" },
  { name:"Projection", min:2, ideal:4, current:2, leader:"Marjorie" },
  { name:"Streaming", min:1, ideal:2, current:1, leader:"Maurício" },
  { name:"Photo & Video", min:2, ideal:4, current:2, leader:"Marjorie" },
  { name:"Social Media", min:2, ideal:4, current:3, leader:"Marjorie" },
  { name:"Service Experience", min:3, ideal:6, current:3, leader:"Fabi" },
  { name:"Consolidation", min:4, ideal:8, current:5, leader:"Petito" },
  { name:"Translation", min:2, ideal:4, current:1, leader:"Pastora Paula" },
  { name:"Lagoinha Kids", min:6, ideal:12, current:5, leader:"Babi" },
  { name:"Intercession", min:4, ideal:8, current:7, leader:"Vânia" },
  { name:"Volunteer Coffee", min:2, ideal:4, current:3, leader:"Juliana" },
  { name:"Hospitality — Welcome", min:4, ideal:8, current:6, leader:"—" },
  { name:"Parking", min:3, ideal:6, current:2, leader:"—" },
  { name:"Setup & Teardown", min:4, ideal:8, current:6, leader:"Anderson" },
  { name:"GC Leader", min:5, ideal:10, current:4, leader:"—" },
];

function ministryHealthStatus(current, min, ideal) {
  if (current < min) return { color:"#ef4444", label:"Critical", bg:"rgba(239,68,68,0.12)" };
  if (current < ideal) return { color:"#f59e0b", label:"Needs Volunteers", bg:"rgba(245,158,11,0.12)" };
  return { color:"#22c55e", label:"Healthy", bg:"rgba(34,197,94,0.12)" };
}

function MinistryHealthTab({ t, lang }) {
  const healthy = MINISTRY_HEALTH_DATA.filter(function(m){ return m.current >= m.ideal; }).length;
  const needs = MINISTRY_HEALTH_DATA.filter(function(m){ return m.current >= m.min && m.current < m.ideal; }).length;
  const critical = MINISTRY_HEALTH_DATA.filter(function(m){ return m.current < m.min; }).length;
  return (
    <div style={{padding:"32px 28px"}}>
      <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.3)",borderLeft:"3px solid #f59e0b",borderRadius:4,padding:"16px 20px",marginBottom:32,display:"flex",gap:14,alignItems:"flex-start"}}>
        <div style={{fontSize:20,flexShrink:0}}>{"🚧"}</div>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#f59e0b",marginBottom:4}}>
            {lang==="PT" ? "Em Desenvolvimento" : "Under Construction"}
          </div>
          <div style={{fontSize:13,color:"#999",lineHeight:1.6}}>
            {lang==="PT"
              ? "Esta aba ainda nao esta ativa. Em breve os pastores poderao acompanhar a saude de cada ministerio em tempo real."
              : "This tab is not yet active. Coming soon — pastors will be able to track each ministry's health in real time, seeing current volunteer counts, targets, and who is at capacity."}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:32}}>
        {[
          { label: lang==="PT" ? "Total de Ministerios" : "Total Ministries", value: MINISTRY_HEALTH_DATA.length, accent:"#2ABFBF" },
          { label: lang==="PT" ? "Saudaveis" : "Healthy", value: healthy, accent:"#22c55e" },
          { label: lang==="PT" ? "Precisam de Voluntarios" : "Needs Volunteers", value: needs, accent:"#f59e0b" },
          { label: lang==="PT" ? "Criticos" : "Critical", value: critical, accent:"#ef4444" },
        ].map(function(item){
          return (
            <div key={item.label} style={{background:"#141414",border:"1px solid #252525",borderTop:"2px solid "+item.accent,borderRadius:4,padding:"20px 24px",opacity:0.75}}>
              <div style={{fontSize:36,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:item.accent}}>{item.value}</div>
              <div style={{fontSize:12,color:"#999",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{item.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {MINISTRY_HEALTH_DATA.map(function(m){
          var status = ministryHealthStatus(m.current, m.min, m.ideal);
          var pct = Math.min(Math.round((m.current / m.ideal) * 100), 100);
          return (
            <div key={m.name} style={{background:"#141414",border:"1px solid #252525",borderRadius:4,padding:"18px 20px",opacity:0.8,cursor:"default"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,marginBottom:3}}>{lang==="PT" ? (MINISTRY_PT[m.name] || m.name) : m.name}</div>
                  <div style={{fontSize:11,color:"#505050"}}>{"-> "}{m.leader}</div>
                </div>
                <span style={{fontSize:11,padding:"3px 8px",background:status.bg,color:status.color,borderRadius:2,fontWeight:600,whiteSpace:"nowrap"}}>{status.label}</span>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"#999"}}>{lang==="PT" ? "Voluntarios" : "Volunteers"}</span>
                  <span style={{fontSize:12,fontWeight:600,color:status.color}}>{m.current}{" "}<span style={{color:"#505050",fontWeight:400}}>{"/ "}{m.ideal}</span></span>
                </div>
                <div style={{height:8,background:"#1C1C1C",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:status.color,borderRadius:4}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:12}}>
                <span style={{fontSize:11,color:"#505050"}}>{lang==="PT" ? "Min: " : "Min: "}<span style={{color:"#F0F0F0"}}>{m.min}</span></span>
                <span style={{fontSize:11,color:"#505050"}}>{"Ideal: "}<span style={{color:"#F0F0F0"}}>{m.ideal}</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("ltc_token") || null);
  const [tab, setTab] = useState("analytics");
  const [lang, setLang] = useState("PT");
  const [showSettings, setShowSettings] = useState(false);
  const [templatePT, setTemplatePT] = useState(DEFAULT_TEMPLATE_PT);
  const [templateEN, setTemplateEN] = useState(DEFAULT_TEMPLATE_EN);
  const t = L[lang];

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.whatsapp_template_pt) setTemplatePT(d.whatsapp_template_pt);
        if (d.whatsapp_template_en) setTemplateEN(d.whatsapp_template_en);
      })
      .catch(() => {});
  }, [token]);

  function handleLogin(pw) {
    sessionStorage.setItem("ltc_token", pw);
    setToken(pw);
  }

  if (!token) return <Login onLogin={handleLogin} lang={lang} t={t} />;

  const tabs = [
    { id: "analytics", label: t.analytics },
    { id: "people", label: t.people },
    { id: "gifting", label: t.byGifting },
    { id: "health", label: t.ministryHealth },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0A0A0A"}}>
      <style>{css}</style>

      {/* Nav */}
      <div style={{borderBottom:"1px solid #252525",background:"#0A0A0A",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 28px",display:"flex",alignItems:"center",gap:32}}>
          <div style={{padding:"16px 0",display:"flex",alignItems:"baseline",gap:10}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:"#2ABFBF"}}>LTC</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:600,textTransform:"uppercase",letterSpacing:2,color:"#505050"}}>{t.dashboard}</span>
          </div>
          <div style={{display:"flex",gap:4,marginLeft:"auto",alignItems:"center"}}>
            {tabs.map(t2=>(
              <button key={t2.id} onClick={()=>setTab(t2.id)}
                style={{padding:"10px 18px",background:"none",border:"none",borderBottom:`2px solid ${tab===t2.id?"#2ABFBF":"transparent"}`,
                  color:tab===t2.id?"#2ABFBF":"#505050",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
                  letterSpacing:1,textTransform:"uppercase",cursor:"pointer",transition:"all 0.15s"}}>
                {t2.label}
              </button>
            ))}
            <button onClick={()=>setLang(lang==="PT"?"EN":"PT")}
              style={{padding:"7px 14px",background:"none",border:"1.5px solid #2ABFBF",color:"#2ABFBF",borderRadius:3,
                fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:2,
                textTransform:"uppercase",cursor:"pointer",marginLeft:8}}>
              {lang==="PT"?"EN":"PT"}
            </button>
            <button onClick={()=>setShowSettings(true)}
              title={t.settings}
              style={{padding:"7px 10px",background:"none",border:"1px solid #252525",borderRadius:3,color:"#505050",fontSize:16,cursor:"pointer",marginLeft:4,lineHeight:1,transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#2ABFBF";e.currentTarget.style.color="#2ABFBF";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#252525";e.currentTarget.style.color="#505050";}}>
              ⚙️
            </button>
            <button onClick={()=>{sessionStorage.removeItem("ltc_token");setToken(null);}}
              style={{padding:"10px 14px",background:"none",border:"none",color:"#252525",fontSize:12,cursor:"pointer"}}
              onMouseEnter={e=>e.target.style.color="#505050"} onMouseLeave={e=>e.target.style.color="#252525"}>
              {t.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1400,margin:"0 auto"}}>
        {tab === "analytics" && <AnalyticsTab token={token} t={t} lang={lang} />}
        {tab === "people" && <PeopleTab token={token} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} />}
        {tab === "gifting" && <GiftingTab token={token} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} />}
        {tab === "health" && <MinistryHealthTab t={t} lang={lang} />}
      </div>

      {showSettings && (
        <SettingsModal
          token={token}
          t={t}
          onClose={() => setShowSettings(false)}
          onSaved={d => { setTemplatePT(d.whatsapp_template_pt); setTemplateEN(d.whatsapp_template_en); }}
        />
      )}
    </div>
  );
}
