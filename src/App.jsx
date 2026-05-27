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
  "New":"#f87171",
  "Reached Out":"#60a5fa",
  "Responded":"#a78bfa",
  "Meeting Scheduled":"#f59e0b",
  "Meeting Done":"#34d399",
  "Placed in Ministry":"#5eead4"
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
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg-0: #050a10;
    --bg-1: #08121a;
    --bg-2: #0c1a24;
    --surface: rgba(14,26,36,0.55);
    --surface-2: rgba(20,36,48,0.62);
    --surface-flat: #0f1c26;
    --border: rgba(94,234,212,0.07);
    --border-strong: rgba(94,234,212,0.18);
    --border-soft: rgba(255,255,255,0.04);
    --teal: #5eead4;
    --teal-2: #2dd4bf;
    --teal-deep: #0d9488;
    --teal-dark: #064e4a;
    --blue: #4cb6c8;
    --text: #e6f1f0;
    --text-2: #aebac0;
    --text-3: #6b7a82;
    --text-4: #475a64;
    --danger: #f87171;
    --warn: #f59e0b;
    --ok: #34d399;
    --info: #60a5fa;
  }

  *{box-sizing:border-box;margin:0;padding:0;}

  body {
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    background:
      radial-gradient(ellipse 1100px 700px at 12% -10%, rgba(45,212,191,0.10), transparent 60%),
      radial-gradient(ellipse 1300px 800px at 95% 110%, rgba(30,90,130,0.18), transparent 60%),
      radial-gradient(ellipse 700px 500px at 70% 30%, rgba(94,234,212,0.05), transparent 70%),
      linear-gradient(180deg, #050a10 0%, #07101a 50%, #050a10 100%);
    background-attachment: fixed;
  }
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.012) 1px, transparent 1px),
      radial-gradient(circle at 70% 70%, rgba(255,255,255,0.012) 1px, transparent 1px);
    background-size: 80px 80px, 120px 120px;
    pointer-events: none; z-index: 0;
  }

  .display { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.01em; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .micro {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--text-3); font-weight: 500;
  }

  .glass {
    background: var(--surface);
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
    border: 1px solid var(--border);
    border-radius: 16px;
    position: relative;
  }
  .glass::before {
    content: ''; position: absolute; inset: 0;
    border-radius: inherit; pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 40%);
  }
  .glow-hover { transition: all 0.25s ease; }
  .glow-hover:hover {
    border-color: var(--border-strong) !important;
    box-shadow: 0 0 0 1px rgba(94,234,212,0.12), 0 12px 36px -12px rgba(94,234,212,0.18) !important;
  }
  .glow-active {
    border-color: var(--border-strong) !important;
    box-shadow: 0 0 0 1px rgba(94,234,212,0.22), 0 12px 40px -10px rgba(94,234,212,0.28) !important;
  }

  ::-webkit-scrollbar{width:8px;height:8px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(94,234,212,0.08);border-radius:6px;}
  ::-webkit-scrollbar-thumb:hover{background:rgba(94,234,212,0.16);}

  input[type="text"],input[type="password"],input[type="search"],textarea,select {
    background: rgba(7,14,20,0.7);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 10px;
    padding: 12px 14px;
    font-family: inherit;
    font-size: 14px;
    outline: none;
    transition: all 0.18s ease;
    width: 100%;
  }
  input:focus,textarea:focus,select:focus {
    border-color: var(--teal);
    box-shadow: 0 0 0 3px rgba(94,234,212,0.12);
  }
  input::placeholder,textarea::placeholder { color: var(--text-4); }
  select option { background: #0c1a24; color: var(--text); }

  button { font-family: inherit; cursor: pointer; }
  .btn-primary {
    background: linear-gradient(180deg, #5eead4, #2dd4bf);
    color: #042220;
    border: none;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 12px;
    padding: 12px 22px;
    border-radius: 10px;
    transition: all 0.2s ease;
    box-shadow: 0 8px 24px -8px rgba(94,234,212,0.5), inset 0 -1px 0 rgba(0,0,0,0.15);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px -8px rgba(94,234,212,0.6), inset 0 -1px 0 rgba(0,0,0,0.15); }
  .btn-ghost {
    background: rgba(94,234,212,0.06);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    transition: all 0.18s ease;
  }
  .btn-ghost:hover { background: rgba(94,234,212,0.1); border-color: var(--border-strong); }

  .chip-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 11px; border-radius: 999px;
    font-size: 11.5px; font-weight: 500; line-height: 1.2;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: var(--text-2);
  }
  .chip-pill.teal { background: rgba(94,234,212,0.08); border-color: rgba(94,234,212,0.22); color: #c5f5ec; }
  .chip-pill.warn { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); color: #fbd590; }
  .chip-pill.danger { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.25); color: #fcb6b6; }
  .chip-pill.ok { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.25); color: #a7eccc; }
  .chip-pill.info { background: rgba(96,165,250,0.1); border-color: rgba(96,165,250,0.25); color: #bcd5f8; }

  ::selection { background: rgba(94,234,212,0.25); color: white; }
  #root { position: relative; z-index: 1; }
  .app { position: relative; z-index: 1; }

  .nav {
    background: rgba(5,10,16,0.7);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  @keyframes drawerSlide {
    from { transform: translateX(40px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }
  .drawer-panel { animation: drawerSlide 0.32s cubic-bezier(0.16,1,0.3,1); }

  @keyframes modalIn {
    from { transform: scale(0.96) translateY(8px); opacity: 0; }
    to   { transform: scale(1) translateY(0); opacity: 1; }
  }
  .modal-panel { animation: modalIn 0.32s cubic-bezier(0.16,1,0.3,1); }

  @keyframes shake {
    0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
  }
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
  if (count === 0) return { color: "#5eead4", label: "Available", bg: "rgba(94,234,212,0.1)" };
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
      <div className="glass modal-panel" style={{width:"min(720px,95vw)",maxHeight:"90vh",overflowY:"auto",borderRadius:16,display:"flex",flexDirection:"column",boxShadow:"0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(94,234,212,0.08) inset",position:"relative"}}>
        {/* Top accent line */}
        <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg, transparent, #5eead4, transparent)",opacity:0.6,boxShadow:"0 0 16px #5eead4"}} />
        <div style={{padding:"24px 32px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,marginBottom:6}}>Settings</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:"#e6f1f0",letterSpacing:"-0.01em"}}>{t.settingsTitle}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#6b7a82",fontSize:14,cursor:"pointer",width:32,height:32,display:"grid",placeItems:"center"}}>✕</button>
        </div>
        <div style={{padding:"32px",display:"flex",flexDirection:"column",gap:24}}>
          {/* Variables hint */}
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:"rgba(94,234,212,0.04)",border:"1px solid rgba(94,234,212,0.1)",borderRadius:10}}>
            <span style={{fontSize:20,flexShrink:0}}>✨</span>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,marginBottom:6}}>Variáveis Disponíveis</div>
              <div style={{fontSize:13,color:"#aebac0",display:"flex",gap:8,flexWrap:"wrap"}}>
                {["{{name}}","{{gifting}}"].map(v=>(
                  <code key={v} style={{padding:"3px 8px",borderRadius:5,background:"rgba(94,234,212,0.08)",border:"1px solid rgba(94,234,212,0.15)",color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{v}</code>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>🇧🇷 {t.templatePT}</div>
            <textarea value={templatePT} onChange={e => setTemplatePT(e.target.value)} rows={5}
              style={{resize:"vertical",lineHeight:1.6}}/>
          </div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>🇺🇸 {t.templateEN}</div>
            <textarea value={templateEN} onChange={e => setTemplateEN(e.target.value)} rows={5}
              style={{resize:"vertical",lineHeight:1.6}}/>
          </div>
        </div>
        <div style={{padding:"18px 32px",borderTop:"1px solid rgba(255,255,255,0.04)",background:"rgba(0,0,0,0.2)",display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center",borderRadius:"0 0 16px 16px"}}>
          {saved && <span style={{fontSize:13,color:"#34d399",marginRight:8}}>{t.settingsSaved}</span>}
          <button onClick={onClose} className="btn-ghost" style={{padding:"9px 20px"}}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{padding:"9px 24px"}}>
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
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"40px 20px",position:"relative"}}>
      <style>{css}</style>
      {/* Backdrop glow halo behind logo */}
      <div style={{position:"absolute",top:"24%",left:"50%",transform:"translateX(-50%)",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle, rgba(94,234,212,0.08), transparent 70%)",pointerEvents:"none"}} />
      <div style={{width:440,maxWidth:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:36,position:"relative"}}>
        {/* LTC2 circle mark */}
        <div style={{width:84,height:84,borderRadius:"50%",background:"radial-gradient(circle at 30% 30%, #f5fefb, #d4f5ed 60%, #b8e8df 100%)",display:"grid",placeItems:"center",boxShadow:"0 0 40px rgba(94,234,212,0.45), 0 0 0 1px rgba(94,234,212,0.4), inset 0 -4px 12px rgba(13,148,136,0.15)",flexShrink:0}}>
          <img src="/LTC2.svg" alt="LTC" style={{width:60,height:60,objectFit:"contain"}} />
        </div>
        {/* Card */}
        <div className="glass" style={{width:"100%",padding:36,borderRadius:20,boxShadow:"0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(94,234,212,0.08) inset",position:"relative"}}>
          {/* Top accent line */}
          <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg, transparent, #5eead4, transparent)",opacity:0.6}} />
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:10}}>LTC Ministry</div>
            <h1 style={{margin:0,fontSize:30,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,letterSpacing:"-0.01em",color:"#e6f1f0"}}>
              Pastor Dashboard
            </h1>
            <p style={{margin:"10px 0 0",color:"#6b7a82",fontSize:13.5}}>
              Sign in to access ministry insights for Lagoinha Tampa.
            </p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:8}}>Dashboard Password</div>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#6b7a82",pointerEvents:"none",fontSize:14}}>🔒</div>
                <input
                  type="password" placeholder="• • • • • • • •"
                  value={pw} onChange={e=>setPw(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                  style={{paddingLeft:40,height:46}}
                />
              </div>
            </div>
            {error && <div style={{color:"#f87171",fontSize:13}}>{error}</div>}
            <button onClick={handleLogin} disabled={loading} className="btn-primary"
              style={{height:46,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:6}}>
              {loading ? "Checking..." : "Enter Dashboard"} {!loading && <span style={{fontSize:14}}>→</span>}
            </button>
          </div>
          <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#475a64"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase",fontSize:"10.5px"}}>v2.4 · Internal</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase",fontSize:"10.5px",color:"#5eead4",opacity:0.7}}>● Connected</span>
          </div>
        </div>
        <p style={{fontSize:11.5,color:"#475a64",textAlign:"center",maxWidth:320,lineHeight:1.6}}>
          A safe place for pastors to walk alongside new volunteers as they discover their gifts and find a ministry home.
        </p>
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

  if (!data) return <div style={{padding:40,color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>{t ? t.loading : "Loading..."}</div>;

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
          {label:t.totalSub,value:data.total,accent:"#5eead4"},
          {label:t.placedMin,value:stageFunnel.find(x=>x.stage==="Placed in Ministry")?.count||0,accent:"#34d399"},
          {label:t.awaitContact,value:stageFunnel.find(x=>x.stage==="New")?.count||0,accent:"#f87171"},
          {label:t.inProgress,value:stageFunnel.filter(x=>!["New","Placed in Ministry"].includes(x.stage)).reduce((a,b)=>a+b.count,0),accent:"#f59e0b"},
        ].map(({label,value,accent})=>(
          <div key={label} className="glass" style={{borderTop:`2px solid ${accent}`,borderRadius:12,padding:"20px 24px",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:40,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:accent,letterSpacing:"-0.02em",lineHeight:1}}>{value}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",color:"#6b7a82",textTransform:"uppercase",letterSpacing:"0.14em",marginTop:8}}>{label}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{borderRadius:12,padding:"24px 28px",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:20,fontWeight:500}}>{t.pipeline}</div>
        {stageFunnel.map(({stage,count})=>(
          <div key={stage} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,color:"#aebac0"}}>{stage}</span>
              <span style={{fontSize:13,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:STAGE_COLORS[stage]||"#5eead4"}}>{count}</span>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(count/maxStage)*100}%`,background:STAGE_COLORS[stage]||"#5eead4",borderRadius:999,transition:"width 0.6s ease",opacity:0.85}}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div className="glass" style={{borderRadius:12,padding:"24px 28px",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:20,fontWeight:500}}>{t.topGiftings}</div>
          {(data.byGifting||[]).slice(0,8).map(({gifting,count})=>(
            <div key={gifting} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,color:"#aebac0"}}>{GIFTING_ICONS[gifting]||"◆"} {gifting}</span>
                <span style={{fontSize:12,fontWeight:500,fontFamily:"'JetBrains Mono',monospace",color:"#5eead4"}}>{count}</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:999}}>
                <div style={{height:"100%",width:`${(count/maxGifting)*100}%`,background:"linear-gradient(90deg,#5eead4,#2dd4bf)",borderRadius:999,boxShadow:"0 0 8px rgba(94,234,212,0.25)"}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:24}}>
          <div className="glass" style={{borderRadius:12,padding:"24px 28px",flex:1,boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:20,fontWeight:500}}>{t.langSplit}</div>
            {[{label:"Português",count:ptCount,color:"#5eead4"},{label:"English",count:enCount,color:"#4cb6c8"}].map(({label,count,color})=>(
              <div key={label} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13,color:"#aebac0"}}>{label}</span>
                  <span style={{fontSize:13,fontWeight:500,fontFamily:"'JetBrains Mono',monospace",color}}>{count} <span style={{color:"#475a64",fontWeight:400}}>({Math.round((count/total)*100)}%)</span></span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,0.04)",borderRadius:999}}>
                  <div style={{height:"100%",width:`${(count/total)*100}%`,background:color,borderRadius:999,opacity:0.8}}/>
                </div>
              </div>
            ))}
          </div>

          <div className="glass" style={{borderRadius:12,padding:"24px 28px",flex:1,boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:20,fontWeight:500}}>{t.weeklySub}</div>
            {data.byWeek?.length > 0 ? (
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
                {(() => {
                  const maxW = Math.max(...data.byWeek.map(x=>x.count),1);
                  return data.byWeek.slice(-10).map(({week,count})=>(
                    <div key={week} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:10,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{count}</div>
                      <div style={{width:"100%",background:"linear-gradient(180deg,rgba(94,234,212,0.35),rgba(94,234,212,0.12))",borderRadius:"3px 3px 0 0",height:`${(count/maxW)*60}px`,minHeight:4}}/>
                    </div>
                  ));
                })()}
              </div>
            ) : <div style={{color:"#475a64",fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{t.noData}</div>}
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
  const stageColor = STAGE_COLORS[person.stage] || "#6b7a82";
  const carisma = parseCarisma(person.carisma_completed);
  // PersonCard: use template (skipTemplate = false)
  const waURL = buildWhatsAppURL(person, templatePT, templateEN, false);

  return (
    <div onClick={onClick} className="glass glow-hover" style={{borderRadius:12,padding:"16px 20px",cursor:"pointer",transition:"all 0.2s ease",borderLeft:`3px solid ${stageColor}`,boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {person.photo_url ? (
            <img src={person.photo_url} alt={person.name} style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(94,234,212,0.4)",flexShrink:0}} />
          ) : (
            <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,rgba(94,234,212,0.15),rgba(94,234,212,0.04))",border:"1px solid rgba(94,234,212,0.18)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:"#5eead4"}}>
              {(person.name||"?")[0].toUpperCase()}
            </div>
          )}
          <div>
            {/* Name row with Carisma badges inline */}
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:"#e6f1f0"}}>{person.name}</span>
              <CarismaBadge levels={carisma} />
            </div>
            <div style={{fontSize:11.5,color:"#6b7a82",marginTop:2}}>{person.whatsapp || person.email || "No contact"}</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={{fontSize:11,padding:"3px 9px",background:`${stageColor}1a`,color:stageColor,borderRadius:999,fontWeight:600,whiteSpace:"nowrap",border:`1px solid ${stageColor}33`}}>{person.stage||"New"}</span>
          <span style={{fontSize:11,padding:"3px 9px",background:badge.bg,color:badge.color,borderRadius:999,fontWeight:600,border:`1px solid ${badge.color}33`}}>{badge.label}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
        {[person.gifting_1,person.gifting_2,person.gifting_3].map(g=>typeof g==="object"?null:(g||null)).filter(Boolean).map((g,i)=>(
          <span key={i} style={{fontSize:11,padding:"3px 9px",
            background:i===0?"rgba(94,234,212,0.1)":"rgba(255,255,255,0.03)",
            color:i===0?"#c5f5ec":"#aebac0",
            borderRadius:999,border:`1px solid ${i===0?"rgba(94,234,212,0.25)":"rgba(255,255,255,0.05)"}`}}>
            {GIFTING_ICONS[g]||"◆"} {giftingLabel(g, person.language)}
          </span>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {person.assigned_pastor && <span style={{fontSize:11,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace"}}>→ {person.assigned_pastor}</span>}
          {langs.map(l=><span key={l} style={{fontSize:10,padding:"2px 7px",background:"rgba(255,255,255,0.03)",color:"#6b7a82",borderRadius:999,border:"1px solid rgba(255,255,255,0.05)"}}>{l}</span>)}
          {groups.map(g=><span key={g} style={{fontSize:10,padding:"2px 7px",background:"rgba(94,234,212,0.06)",color:"#5eead4",borderRadius:999,border:"1px solid rgba(94,234,212,0.15)"}}>{g}</span>)}
        </div>
        {waURL && (
          <button
            onClick={e=>{ e.stopPropagation(); window.open(waURL, "_blank"); }}
            style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"5px 11px",
              background:"linear-gradient(180deg,rgba(34,197,94,0.18),rgba(34,197,94,0.08))",
              color:"#86efac",borderRadius:8,border:"1px solid rgba(34,197,94,0.3)",
              cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontWeight:500}}>
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
    <div onClick={onClick} className="glass glow-hover" style={{borderRadius:12,padding:"18px 20px",cursor:"pointer",borderTop:"2px solid rgba(94,234,212,0.5)",transition:"all 0.2s ease",position:"relative",boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>

      {/* Check mark */}
      <div style={{position:"absolute",top:12,right:12,width:22,height:22,borderRadius:"50%",background:"rgba(94,234,212,0.12)",border:"1px solid rgba(94,234,212,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#5eead4",fontWeight:700}}>✓</div>

      {/* Photo + Name */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.name} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(94,234,212,0.4)",flexShrink:0}} />
        ) : (
          <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,rgba(94,234,212,0.18),rgba(94,234,212,0.04))",border:"2px solid rgba(94,234,212,0.22)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:"#5eead4"}}>
            {(person.name||"?")[0].toUpperCase()}
          </div>
        )}
        <div>
          {/* Name + Carisma badges inline */}
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:"#e6f1f0"}}>{person.name}</span>
            <CarismaBadge levels={carisma} />
          </div>
          {person.gifting_1 && (
            <span style={{fontSize:11,padding:"3px 9px",background:"rgba(94,234,212,0.1)",color:"#c5f5ec",borderRadius:999,border:"1px solid rgba(94,234,212,0.25)"}}>
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
              <span key={m} style={{fontSize:11,padding:"3px 9px",background:"rgba(94,234,212,0.07)",color:"#5eead4",borderRadius:999,border:"1px solid rgba(94,234,212,0.18)"}}>
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
            style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,padding:"5px 11px",
              background:"linear-gradient(180deg,rgba(34,197,94,0.18),rgba(34,197,94,0.08))",
              color:"#86efac",borderRadius:8,border:"1px solid rgba(34,197,94,0.3)",
              cursor:"pointer",fontWeight:500}}>
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
      <div style={{color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>{t ? t.loading : "Loading..."}</div>
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
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(2,6,12,0.65)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"}} />
      <div className="drawer-panel" style={{width:"min(560px,100vw)",height:"100vh",background:"linear-gradient(180deg, rgba(12,24,32,0.96), rgba(6,14,20,0.96))",backdropFilter:"blur(30px) saturate(140%)",WebkitBackdropFilter:"blur(30px) saturate(140%)",borderLeft:"1px solid rgba(94,234,212,0.18)",boxShadow:"-30px 0 80px -20px rgba(0,0,0,0.7), -1px 0 30px -10px rgba(94,234,212,0.15)",overflowY:"auto",display:"flex",flexDirection:"column",position:"relative"}}>
        {/* Top accent line */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg, transparent, #5eead4, transparent)",boxShadow:"0 0 16px #5eead4",zIndex:1}} />

        {/* Header */}
        <div style={{padding:"28px 32px 0",position:"sticky",top:0,background:"rgba(6,14,20,0.95)",backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",zIndex:10,paddingBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              {person.photo_url ? (
                <img src={person.photo_url} alt={person.name} style={{width:64,height:64,borderRadius:"50%",objectFit:"cover",border:"2px solid #5eead4",boxShadow:"0 0 0 4px rgba(94,234,212,0.08)",flexShrink:0}} />
              ) : (
                <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg, rgba(94,234,212,0.18), rgba(94,234,212,0.04))",border:"1px solid rgba(94,234,212,0.2)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,color:"#5eead4"}}>
                  {(person.name||"?")[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,color:"#e6f1f0"}}>{person.name}</span>
                  <CarismaBadge levels={carisma} />
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",fontSize:12,color:"#6b7a82"}}>
                  <span>{person.language === "PT" ? "🇧🇷 Português" : "🇺🇸 English"}</span>
                  {person.submitted_at && <span>· {timeAgo(person.submitted_at)}</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#6b7a82",fontSize:14,cursor:"pointer",width:32,height:32,display:"grid",placeItems:"center",flexShrink:0}}>✕</button>
          </div>
          {/* Contact actions */}
          <div style={{display:"flex",gap:10,paddingBottom:18,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            {waURL && (
              <a href={waURL} target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,padding:"7px 14px",background:"linear-gradient(180deg,rgba(34,197,94,0.18),rgba(34,197,94,0.08))",color:"#86efac",borderRadius:8,border:"1px solid rgba(34,197,94,0.3)",textDecoration:"none",fontWeight:500}}>
                💬 {t.whatsappMsg}
              </a>
            )}
            {person.email && (
              <a href={`mailto:${person.email}`} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,padding:"7px 14px",background:"rgba(255,255,255,0.04)",color:"#aebac0",borderRadius:8,border:"1px solid rgba(255,255,255,0.07)",textDecoration:"none"}}>✉ Email</a>
            )}
          </div>
        </div>

        <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:0}}>

          {/* Stage */}
          <div style={{paddingBottom:22,marginBottom:0}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.connStage}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {STAGES.map(s => (
                <button key={s} onClick={()=>updateConnection({stage:s})} disabled={saving}
                  style={{padding:"8px 14px",borderRadius:8,border:person.stage===s?`1px solid ${STAGE_COLORS[s]}55`:"1px solid rgba(255,255,255,0.04)",
                    background:person.stage===s?`linear-gradient(180deg, ${STAGE_COLORS[s]}2e, ${STAGE_COLORS[s]}14)`:"rgba(255,255,255,0.02)",
                    color:person.stage===s?STAGE_COLORS[s]:"#6b7a82",
                    fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                    boxShadow:person.stage===s?`0 0 14px ${STAGE_COLORS[s]}2e`:"none"}}>
                  {(STAGE_LABEL[lang||"EN"]||STAGE_LABEL.EN)[s]||s}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Pastor */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.assignedPastor}</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
              {PASTOR_SUGGESTIONS.map(p=>(
                <button key={p} onClick={()=>updateConnection({assigned_pastor:p})} disabled={saving}
                  style={{padding:"8px 14px",borderRadius:8,border:person.assigned_pastor===p?"1px solid rgba(94,234,212,0.35)":"1px solid rgba(255,255,255,0.04)",
                    background:person.assigned_pastor===p?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                    color:person.assigned_pastor===p?"#5eead4":"#aebac0",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                    boxShadow:person.assigned_pastor===p?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
                  {p}
                </button>
              ))}
            </div>
            <input placeholder={t.orType}
              defaultValue={!PASTOR_SUGGESTIONS.includes(person.assigned_pastor)?person.assigned_pastor:""}
              onBlur={e=>{ if(e.target.value && !PASTOR_SUGGESTIONS.includes(e.target.value)) updateConnection({assigned_pastor:e.target.value}); }}
              style={{padding:"10px 14px"}}/>
          </div>

          {/* Ministry Load */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500}}>{t.currentMin}</div>
              <span style={{fontSize:11,padding:"4px 10px",background:badge.bg,color:badge.color,borderRadius:999,fontWeight:600,border:`1px solid ${badge.color}44`}}>{badge.label}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {ministries.map(m=>(
                <span key={m} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,padding:"6px 11px",background:"rgba(94,234,212,0.08)",color:"#c5f5ec",borderRadius:8,border:"1px solid rgba(94,234,212,0.22)"}}>
                  {ministryLabel(m, "EN", person.language)}
                  <button onClick={()=>removeMinistry(m)} style={{background:"none",border:"none",color:"#5eead4",cursor:"pointer",fontSize:14,lineHeight:1,padding:0,opacity:0.7}}>×</button>
                </span>
              ))}
              <button onClick={()=>setShowMinistryInput(true)} style={{fontSize:12,padding:"6px 11px",background:"rgba(255,255,255,0.02)",color:"#6b7a82",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:8,cursor:"pointer"}}>+ Add</button>
            </div>
            {showMinistryInput && (
              <div style={{display:"flex",gap:8}}>
                <select value={newMinistry} onChange={e=>setNewMinistry(e.target.value)} style={{flex:1}}>
                  <option value="">Select ministry…</option>
                  {MINISTRIES_STARTER.filter(m=>!ministries.includes(m)).map(m=><option key={m} value={m}>{m}</option>)}
                  <option value="__custom">Type custom…</option>
                </select>
                <button onClick={()=>newMinistry==="__custom"?setShowMinistryInput("custom"):addMinistry(newMinistry)} className="btn-primary" style={{padding:"8px 16px",whiteSpace:"nowrap"}}>Add</button>
                <button onClick={()=>{setShowMinistryInput(false);setNewMinistry("");}} className="btn-ghost" style={{padding:"8px 12px"}}>✕</button>
              </div>
            )}
            {showMinistryInput === "custom" && (
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <input placeholder="Type ministry name…" value={newMinistry==="__custom"?"":newMinistry}
                  onChange={e=>setNewMinistry(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addMinistry(newMinistry)}/>
                <button onClick={()=>addMinistry(newMinistry)} className="btn-primary" style={{padding:"8px 16px",whiteSpace:"nowrap"}}>Add</button>
              </div>
            )}
          </div>

          {/* Carisma — Pastor can toggle levels */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500,display:"flex",alignItems:"center",gap:8}}>
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
                      padding:"8px 14px", borderRadius:8,
                      border:`1px solid ${active?"rgba(180,105,104,0.5)":"rgba(255,255,255,0.04)"}`,
                      background:active?"rgba(89,34,28,0.25)":"rgba(255,255,255,0.02)",
                      color:active?"#e89494":"#aebac0",
                      fontSize:12, fontWeight:500, cursor:"pointer",
                      transition:"all 0.18s",
                      boxShadow:active?"0 0 14px rgba(180,105,104,0.18)":"none"
                    }}>
                    {active && <img src={CARISMA_LOGO} alt="" style={{width:13,height:13,objectFit:"contain"}} />}
                    {level}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:11.5,color:"#6b7a82",marginTop:8,lineHeight:1.6}}>
              {lang === "PT"
                ? "Escola teológica da Lagoinha. Exige 4h/mês de serviço ministerial documentado."
                : "Lagoinha theological school. Requires 4h/month of documented ministry service."}
            </div>
          </div>

          {/* Languages */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.langSpoken}</div>
            <div style={{display:"flex",gap:8}}>
              {LANGUAGES.map(l=>(
                <button key={l} onClick={()=>toggleLang(l)} disabled={saving}
                  style={{padding:"8px 14px",borderRadius:8,
                    border:`1px solid ${langs.includes(l)?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.04)"}`,
                    background:langs.includes(l)?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                    color:langs.includes(l)?"#5eead4":"#aebac0",
                    fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                    boxShadow:langs.includes(l)?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Special Groups */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.specialGroups}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SPECIAL_GROUPS.map(g=>(
                <button key={g} onClick={()=>toggleGroup(g)} disabled={saving}
                  style={{padding:"8px 14px",borderRadius:8,
                    border:`1px solid ${groups.includes(g)?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.04)"}`,
                    background:groups.includes(g)?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                    color:groups.includes(g)?"#5eead4":"#aebac0",
                    fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                    boxShadow:groups.includes(g)?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Gifting Profile */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.giftingProfile}</div>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {[person.gifting_1,person.gifting_2,person.gifting_3].map(g=>typeof g==="object"?null:(g||null)).filter(Boolean).map((g,i)=>(
                <span key={i} style={{fontSize:12,padding:"6px 11px",
                  background:i===0?"rgba(94,234,212,0.12)":"rgba(255,255,255,0.03)",
                  color:i===0?"#5eead4":"#aebac0",
                  borderRadius:8,
                  border:`1px solid ${i===0?"rgba(94,234,212,0.3)":"rgba(255,255,255,0.05)"}`,
                  display:"inline-flex",alignItems:"center",gap:5}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,opacity:0.6}}>#{i+1}</span>
                  {GIFTING_ICONS[g]||""} {giftingLabel(g, person.language)}
                </span>
              ))}
            </div>
            {sortedScores.length > 0 && (
              <div style={{background:"rgba(8,16,22,0.6)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:12,padding:"16px 18px"}}>
                {sortedScores.map(([gifting,score],idx)=>{
                  const pct = Math.min(Math.round(Number(score)),100);
                  return (
                    <div key={gifting} style={{marginBottom:idx<sortedScores.length-1?12:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
                        <span style={{fontSize:12.5,color:"#aebac0",display:"flex",alignItems:"center",gap:6}}>
                          <span>{GIFTING_ICONS[gifting]||"◆"}</span> {giftingLabel(gifting, person.language)}
                        </span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:idx===0?"#5eead4":"#e6f1f0",fontWeight:500}}>{pct}%</span>
                      </div>
                      <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:999}}>
                        <div style={{height:"100%",width:`${pct}%`,
                          background:idx===0
                            ?"linear-gradient(90deg, #5eead4, #2dd4bf)"
                            :"linear-gradient(90deg, rgba(94,234,212,0.55), rgba(94,234,212,0.3))",
                          borderRadius:999,
                          boxShadow:idx===0?"0 0 10px rgba(94,234,212,0.45)":"none"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.notesAudit}</div>
            <div style={{marginBottom:16}}>
              <input placeholder={t.yourName} value={pastorName} onChange={e=>setPastorName(e.target.value)}
                style={{width:"100%",padding:"10px 14px",marginBottom:8}}/>
              <textarea placeholder={t.addNote} value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3}
                style={{width:"100%",padding:"10px 14px",resize:"vertical"}}/>
              <button onClick={addNote} disabled={saving||!noteText.trim()}
                className={noteText.trim()?"btn-primary":"btn-ghost"}
                style={{marginTop:8,padding:"9px 20px",opacity:noteText.trim()?1:0.45,cursor:noteText.trim()?"pointer":"default"}}>
                {t.saveNote||"Save Note"}
              </button>
            </div>
            {(person.notes||[]).map(note=>(
              <div key={note.id} style={{borderLeft:"2px solid rgba(94,234,212,0.2)",paddingLeft:14,marginBottom:16}}>
                <div style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#5eead4"}}>{note.pastor_name}</span>
                  <span style={{fontSize:11,color:"#475a64"}}>{timeAgo(note.created_at)}</span>
                  {note.stage_at_time && <span style={{fontSize:10,padding:"2px 7px",background:"rgba(255,255,255,0.03)",color:"#6b7a82",borderRadius:6,border:"1px solid rgba(255,255,255,0.05)"}}>{note.stage_at_time}</span>}
                </div>
                <div style={{fontSize:13,color:"#e6f1f0",lineHeight:1.6}}>{note.note_text}</div>
              </div>
            ))}
            {(!person.notes||person.notes.length===0) && <div style={{fontSize:13,color:"#475a64"}}>{t.noNotes}</div>}
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
          style={{padding:"8px 20px",borderRadius:999,
            border:`1px solid ${view==="active"?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.05)"}`,
            background:view==="active"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
            color:view==="active"?"#5eead4":"#6b7a82",
            fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",
            cursor:"pointer",transition:"all 0.18s",
            boxShadow:view==="active"?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
          {lang==="PT" ? "Em Andamento" : "Active"}
          <span style={{marginLeft:8,fontSize:11,padding:"1px 7px",background:view==="active"?"rgba(94,234,212,0.22)":"rgba(255,255,255,0.04)",borderRadius:999,color:view==="active"?"#5eead4":"#6b7a82"}}>{activePeople.length}</span>
        </button>
        <button onClick={()=>{ setView("placed"); setFilterStage("All"); }}
          style={{padding:"8px 20px",borderRadius:999,
            border:`1px solid ${view==="placed"?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.05)"}`,
            background:view==="placed"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
            color:view==="placed"?"#5eead4":"#6b7a82",
            fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",
            cursor:"pointer",transition:"all 0.18s",
            boxShadow:view==="placed"?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
          {lang==="PT" ? "Colocados" : "Placed"}
          <span style={{marginLeft:8,fontSize:11,padding:"1px 7px",background:view==="placed"?"rgba(94,234,212,0.22)":"rgba(255,255,255,0.04)",borderRadius:999,color:view==="placed"?"#5eead4":"#6b7a82"}}>{placedPeople.length}</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{display:"grid",gridTemplateColumns:"1fr repeat(5,auto)",gap:10,marginBottom:12,alignItems:"center"}}>
        <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
          style={{padding:"9px 14px"}}/>
        {view === "active" && (
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={{padding:"9px 12px"}}>
            {["All",...activeStages].map(o=><option key={o} value={o}>{o==="All"?t.allStages:o}</option>)}
          </select>
        )}
        {[
          {label:t.allGiftings,val:filterGifting,set:setFilterGifting,opts:["All",...GIFTINGS]},
          {label:t.allLanguages,val:filterLang,set:setFilterLang,opts:["All",...LANGUAGES]},
          {label:t.allGroups,val:filterGroup,set:setFilterGroup,opts:["All",...SPECIAL_GROUPS]},
          {label:t.allPastors,val:filterPastor,set:setFilterPastor,opts:pastorOptions},
        ].map(({label,val,set,opts})=>(
          <select key={label} value={val} onChange={e=>set(e.target.value)} style={{padding:"9px 12px"}}>
            {opts.map(o=><option key={o} value={o}>{o==="All"?label:o}</option>)}
          </select>
        ))}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#475a64"}}>{filtered.length} / {currentPool.length}</div>
        {view === "active" && (
          <button onClick={()=>setShowSplit(true)}
            style={{padding:"7px 14px",background:"rgba(94,234,212,0.08)",border:"1px solid rgba(94,234,212,0.22)",borderRadius:8,color:"#5eead4",fontSize:11,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.18s"}}>
            {"⚡ "}{lang==="PT"?"Distribuir Pessoas":"Split Assignments"}
          </button>
        )}
        {view === "placed" && placedPeople.length > 0 && (
          <div style={{fontSize:12,color:"#5eead4"}}>{"🏠 "}{lang==="PT" ? `${placedPeople.length} pessoa${placedPeople.length!==1?"s":""} colocada${placedPeople.length!==1?"s":""}` : `${placedPeople.length} person${placedPeople.length!==1?"s":""} placed`}</div>
        )}
      </div>

      {showSplit && (
        <div className="glass" style={{borderRadius:12,padding:"20px 24px",marginBottom:16,borderColor:"rgba(94,234,212,0.22)"}}>
          {/* Top accent */}
          <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,#5eead4,transparent)",opacity:0.5,borderRadius:1}} />
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:8,color:"#e6f1f0"}}>
            {lang==="PT"?"Distribuir Pessoas Não Atribuídas":"Split Unassigned People"}
          </div>
          <div style={{fontSize:12,color:"#6b7a82",marginBottom:14,lineHeight:1.6}}>
            {lang==="PT"
              ? "Inglês/Ambos → Pra Alice automaticamente. Português → dividido entre os pastores."
              : "English/Both speakers → Pra Alice automatically. Portuguese → split between pastors."}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <button onClick={()=>setSplitRatio("5050")}
              style={{padding:"8px 16px",borderRadius:8,
                border:`1px solid ${splitRatio==="5050"?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.05)"}`,
                background:splitRatio==="5050"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                color:splitRatio==="5050"?"#5eead4":"#6b7a82",fontSize:12,cursor:"pointer",
                fontFamily:"'JetBrains Mono',monospace",fontWeight:600,transition:"all 0.18s"}}>
              50 / 50
            </button>
            <button onClick={()=>setSplitRatio("7525")}
              style={{padding:"8px 16px",borderRadius:8,
                border:`1px solid ${splitRatio==="7525"?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.05)"}`,
                background:splitRatio==="7525"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                color:splitRatio==="7525"?"#5eead4":"#6b7a82",fontSize:12,cursor:"pointer",
                fontFamily:"'JetBrains Mono',monospace",fontWeight:600,transition:"all 0.18s"}}>
              75 (Alice) / 25 (Rafa)
            </button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>executeSplit(people,token,load,setSplitDone,setSaving,splitRatio,setShowSplit)}
              className="btn-primary" style={{padding:"9px 20px"}}>
              {lang==="PT"?"Confirmar":"Confirm Split"}
            </button>
            <button onClick={()=>setShowSplit(false)}
              className="btn-ghost" style={{padding:"9px 16px"}}>
              {lang==="PT"?"Cancelar":"Cancel"}
            </button>
          </div>
          {splitDone && <div style={{marginTop:12,fontSize:12,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace"}}>{splitDone}</div>}
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
          <div style={{gridColumn:"1/-1",padding:40,textAlign:"center",color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>
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
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",color:"#6b7a82",textTransform:"uppercase",marginBottom:16,fontWeight:500}}>{t.selectGifting}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:28}}>
        {GIFTINGS.map(g=>(
          <button key={g} onClick={()=>setSelectedGifting(g)}
            style={{padding:"12px 16px",
              background:selectedGifting===g?"linear-gradient(180deg,rgba(94,234,212,0.15),rgba(94,234,212,0.07))":"rgba(255,255,255,0.02)",
              border:`1px solid ${selectedGifting===g?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.04)"}`,
              borderRadius:10,color:selectedGifting===g?"#5eead4":"#aebac0",
              fontSize:13,cursor:"pointer",textAlign:"left",
              transition:"all 0.18s",
              boxShadow:selectedGifting===g?"0 0 14px rgba(94,234,212,0.15)":"none"}}>
            <span style={{marginRight:8}}>{GIFTING_ICONS[g]||"◆"}</span>{g}
          </button>
        ))}
      </div>

      {selectedGifting && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,color:"#e6f1f0"}}>
              {GIFTING_ICONS[selectedGifting]} {selectedGifting}
            </div>
            {!loading && <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#475a64"}}>{people.length} people</div>}
          </div>
          {loading ? <div style={{color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>{t.loading}</div> : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
              {people.map(p=>(
                <PersonCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} templatePT={templatePT} templateEN={templateEN} t={t} />
              ))}
              {people.length===0 && <div style={{color:"#475a64",fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{t.noPeople}</div>}
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
      <div style={{background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.22)",borderLeft:"3px solid rgba(245,158,11,0.7)",borderRadius:10,padding:"16px 20px",marginBottom:32,display:"flex",gap:14,alignItems:"flex-start"}}>
        <div style={{fontSize:20,flexShrink:0}}>{"🚧"}</div>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",fontWeight:500,textTransform:"uppercase",color:"#f59e0b",marginBottom:6}}>
            {lang==="PT" ? "Em Desenvolvimento" : "Under Construction"}
          </div>
          <div style={{fontSize:13,color:"#6b7a82",lineHeight:1.7}}>
            {lang==="PT"
              ? "Esta aba ainda nao esta ativa. Em breve os pastores poderao acompanhar a saude de cada ministerio em tempo real."
              : "This tab is not yet active. Coming soon — pastors will be able to track each ministry's health in real time, seeing current volunteer counts, targets, and who is at capacity."}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:32}}>
        {[
          { label: lang==="PT" ? "Total de Ministerios" : "Total Ministries", value: MINISTRY_HEALTH_DATA.length, accent:"#5eead4" },
          { label: lang==="PT" ? "Saudaveis" : "Healthy", value: healthy, accent:"#34d399" },
          { label: lang==="PT" ? "Precisam de Voluntarios" : "Needs Volunteers", value: needs, accent:"#f59e0b" },
          { label: lang==="PT" ? "Criticos" : "Critical", value: critical, accent:"#f87171" },
        ].map(function(item){
          return (
            <div key={item.label} className="glass" style={{borderTop:"2px solid "+item.accent,borderRadius:12,padding:"20px 24px",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
              <div style={{fontSize:40,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:item.accent,letterSpacing:"-0.02em",lineHeight:1}}>{item.value}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",color:"#6b7a82",textTransform:"uppercase",letterSpacing:"0.14em",marginTop:8}}>{item.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {MINISTRY_HEALTH_DATA.map(function(m){
          var status = ministryHealthStatus(m.current, m.min, m.ideal);
          var pct = Math.min(Math.round((m.current / m.ideal) * 100), 100);
          return (
            <div key={m.name} className="glass glow-hover" style={{borderRadius:12,padding:"18px 20px",cursor:"default",boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:600,color:"#e6f1f0",marginBottom:3}}>{lang==="PT" ? (MINISTRY_PT[m.name] || m.name) : m.name}</div>
                  <div style={{fontSize:11,color:"#475a64"}}>{"→ "}{m.leader}</div>
                </div>
                <span style={{fontSize:11,padding:"3px 9px",background:status.bg,color:status.color,borderRadius:999,fontWeight:600,whiteSpace:"nowrap",border:`1px solid ${status.color}33`}}>{status.label}</span>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"#6b7a82"}}>{lang==="PT" ? "Voluntários" : "Volunteers"}</span>
                  <span style={{fontSize:12,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:status.color}}>{m.current}<span style={{color:"#475a64",fontWeight:400}}>{" / "}{m.ideal}</span></span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:status.color,borderRadius:999,opacity:0.8}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:12}}>
                <span style={{fontSize:11,color:"#475a64"}}>{"Min: "}<span style={{color:"#aebac0"}}>{m.min}</span></span>
                <span style={{fontSize:11,color:"#475a64"}}>{"Ideal: "}<span style={{color:"#aebac0"}}>{m.ideal}</span></span>
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
    <div className="app" style={{minHeight:"100vh"}}>
      <style>{css}</style>

      {/* Nav */}
      <div className="nav" style={{position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:1600,margin:"0 auto",padding:"18px 32px",display:"flex",alignItems:"center",gap:28,justifyContent:"space-between"}}>
          {/* Brand cluster */}
          <div style={{display:"flex",alignItems:"center",gap:20,flexShrink:0}}>
            <img src="/LTC1.svg" alt="Lagoinha Tampa" style={{height:32,width:"auto",objectFit:"contain",display:"block"}} />
            <div style={{width:1,height:28,background:"rgba(255,255,255,0.04)"}} />
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,whiteSpace:"nowrap"}}>{t.dashboard}</span>
          </div>
          {/* Nav tabs */}
          <nav style={{display:"flex",gap:28,alignItems:"center"}}>
            {tabs.map(t2=>(
              <button key={t2.id} onClick={()=>setTab(t2.id)}
                style={{background:"transparent",border:"none",padding:"8px 4px",position:"relative",color:tab===t2.id?"#e6f1f0":"#6b7a82",fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"color 0.18s",whiteSpace:"nowrap"}}
                onMouseEnter={e=>{ if(tab!==t2.id) e.currentTarget.style.color="#aebac0"; }}
                onMouseLeave={e=>{ if(tab!==t2.id) e.currentTarget.style.color="#6b7a82"; }}>
                {t2.label}
                {tab===t2.id && <span style={{position:"absolute",left:0,right:0,bottom:-18,height:2,background:"linear-gradient(90deg,transparent,#5eead4,transparent)",boxShadow:"0 0 12px #5eead4"}} />}
              </button>
            ))}
          </nav>
          {/* Utility */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Language toggle */}
            <div style={{display:"flex",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:8,padding:2,fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>
              <button onClick={()=>lang==="EN"&&setLang("PT")} style={{padding:"5px 10px",background:lang==="PT"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",border:lang==="PT"?"1px solid rgba(94,234,212,0.3)":"none",color:lang==="PT"?"#5eead4":"#6b7a82",cursor:"pointer",borderRadius:6,fontWeight:lang==="PT"?600:400,fontFamily:"inherit",transition:"all 0.18s"}}>PT</button>
              <button onClick={()=>lang==="PT"&&setLang("EN")} style={{padding:"5px 10px",background:lang==="EN"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",border:lang==="EN"?"1px solid rgba(94,234,212,0.3)":"none",color:lang==="EN"?"#5eead4":"#6b7a82",cursor:"pointer",borderRadius:6,fontWeight:lang==="EN"?600:400,fontFamily:"inherit",transition:"all 0.18s"}}>EN</button>
            </div>
            <button onClick={()=>setShowSettings(true)} title={t.settings} className="btn-ghost"
              style={{padding:"8px 10px",borderRadius:8,fontSize:15,lineHeight:1,color:"#aebac0"}}>
              ⚙️
            </button>
            <button onClick={()=>{sessionStorage.removeItem("ltc_token");setToken(null);}} className="btn-ghost"
              style={{padding:"8px 14px",borderRadius:8,fontSize:12,color:"#aebac0",display:"flex",alignItems:"center",gap:6}}>
              ↪ {t.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1600,margin:"0 auto"}}>
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
