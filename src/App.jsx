import React, { useState, useEffect, useCallback, useRef, useLayoutEffect, useMemo } from "react";
import QRCode from "qrcode";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase.js';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import SchedulingPrototype from './SchedulingPrototype';

/*
 * ──────────────────────────────────────────────────────────────────────────
 * D1: ministry_notes table — RUN MANUALLY IN THE CLOUDFLARE D1 CONSOLE
 *     (ltc-db) BEFORE TESTING the Ministry Modal "Notes" section.
 *
 * No timestamped notes table exists yet (only a single `coaching_notes` TEXT
 * column per ministry). The Notes section persists one row per saved note:
 *
 *   CREATE TABLE IF NOT EXISTS ministry_notes (
 *     id          INTEGER PRIMARY KEY AUTOINCREMENT,
 *     ministry    TEXT NOT NULL,
 *     pastor_name TEXT,
 *     note_text   TEXT NOT NULL,
 *     created_at  TEXT NOT NULL DEFAULT (datetime('now'))
 *   );
 *   CREATE INDEX IF NOT EXISTS idx_ministry_notes_ministry
 *     ON ministry_notes (ministry);
 *
 * WORKER ENDPOINTS STILL REQUIRED (worker.js lives in /Users/nicolel/ltc-api,
 * outside this repo — add them there, then redeploy via wrangler):
 *   GET  /ministry-health
 *        -> include `notes` (array, newest first) on each card:
 *           SELECT id, pastor_name, note_text, created_at FROM ministry_notes
 *           WHERE ministry = ?1 ORDER BY created_at DESC
 *   POST /ministry-health/:ministry/notes   body { pastor_name, note_text }
 *        -> INSERT INTO ministry_notes (ministry, pastor_name, note_text)
 *           VALUES (?1, ?2, ?3)
 *
 * Until the table + endpoints exist, saving a note still updates the UI
 * optimistically but will not persist across reloads.
 * ──────────────────────────────────────────────────────────────────────────
 */

const API = "https://ltc-api.farfromtimnah.workers.dev";

// ─── CARISMA LOGO (embedded) ──────────────────────────────────────
const CARISMA_LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzNTkgNTE3Ij4KICA8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMzAuNC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogMi4xLjQgQnVpbGQgMjI2KSAgLS0+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5zdDAgewogICAgICAgIGZpbGw6ICM1OTIyMWM7CiAgICAgIH0KCiAgICAgIC5zdDEgewogICAgICAgIGZpbGw6ICNiNDY5Njg7CiAgICAgIH0KCiAgICAgIC5zdDIgewogICAgICAgIGZpbGw6ICM0NDFjMTc7CiAgICAgIH0KCiAgICAgIC5zdDMgewogICAgICAgIGZpbGw6ICM2ODEyMTE7CiAgICAgIH0KCiAgICAgIC5zdDQgewogICAgICAgIGZpbGw6ICM0ZDFlMTk7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxnIGlkPSJXVlU2elgiPgogICAgPGc+CiAgICAgIDxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0yODUuNCwzMy41OWwtMzAuMzYsNTUuMTZjMTIuMSw4LjkuMTgsMTkuODUtNy40OCwyNi4zMy0yLjI4LDIuNC04LjMsMTIuOTctNC41MywxNi44OSwyNS4xMSwyLjYyLDUwLjE3LDEuNDEsNzUuNS0xLjk3LDI0LjQ1LDM2Ljc4LDI5LjYxLDc0Ljk2LDMwLjU4LDExNi45NywyLjU0LDExMC40Ni03My44LDIwMC4xNC0xNjkuOTMsMjU2LjItMzMuNDYtMTYuMTEtNTguOTItMzguNzItODQuNjYtNjUuOTgtMTkuNzgsMTcuMzYtMTguMTIsNDguOTQtNTQuMjgsNTUuNzEtMjYuNDctNDAuMjcsMzQuOTYtNzYuNzQsMTUuNzMtMTA2Ljg2LTIyLjMxLTM0Ljk1LTM4Ljk1LTc0LjI0LTM4LjgxLTExNC4xMi0zLjQ3LTE1Ljk0LTMuOTItMzIuMTMtMS4zNC00OC41Nyw1LjcyLTI5Ljg0LDEwLjAyLTY2Ljg2LDM0LjkxLTkxLjEsMzMuOTUtMTEuODgsODUuNDgsOS4yMiwxMzkuMDUtMS4xNywxNS43OS0zLjA2LDIzLjg2LTM1LjAxLDE0LjY0LTQ1LjQ4LTEuMzktMTEuMjMsMy42OC0xMi44MiwxMy43Ny05LjcxLDE3LTIuMzEsMTUuMDUtMjguMTksMjguOTctMzguMjMsNy4yOC0yNS43LDM1LjcyLTMxLjE0LDM4LjI0LTQuMDVaTTE4Mi43OCwzMzguNDljLTMyLjI2LTEuODYtNDguNzgtMjkuODktNTAuMzUtNTUuMzctMS42MS0yNi4xNiwxOS4wNC01My43Niw0Ny4wNy01Ni40OCwyMi4zOS0yLjE3LDM4LjQ4LDEyLjMxLDU0LjA3LDI1LjAxbDM0LjAzLTE2Ljc0Yy0xNC4wOC0yOS41Ni0zOC41LTQ2LjE0LTY1LjEyLTUxLjYxLTI2LjkzLTUuNTMtNTcuMTksNC41OS03Ni43OCwyMy44NC00MS45LDQxLjE4LTQ0LjU1LDEwNC43NC00LjEyLDE0Ny4zMiwyMS4wNCwyMi4xNiw1MS42MiwzMS44OSw4MS45NCwyNS41NywyNS42Ny01LjM1LDU0LjQ0LTIwLjYzLDY0LjQ1LTUwLTkuNTEtOS4yMi0xOS42Ni0xNS4zNi0zMi4wNS0yMC43MS0xMy41NywxMy43MS0yOS4yNywzMC41NC01My4xMywyOS4xNloiLz4KICAgICAgPHBhdGggY2xhc3M9InN0MCIgZD0iTTI4NS40LDMzLjU5Yy00LjQxLTkuMjMtMTYuNDgtMTUuMS0yNS4xMi03LjI2LTUuMDgsNC42LTguOTgsOC4zMy0xMy4xMiwxMS4zMWw2LjgzLTI2LjYxYzIuMi04LjEzLDM0LjY4LDEuMjcsMzYuNDQsMTQuMTguNTEsMy43Mi0zLjcyLDYuMDEtNS4wMiw4LjM3WiIvPgogICAgICA8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNMjQ3LjU2LDExNS4wN2MtMy44MS0xMC4zOCwzLjQxLTE4LjkyLDcuNDgtMjYuMzMsMTAuMzIsMTAuMTksMjQuODYsOC43MywzNS4zOSwyMy4zLTE4LjIxLDUuODYtMzMuNDQtOS41Ny00Mi44OCwzLjAzWiIvPgogICAgICA8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMjE4LjE5LDc1Ljg3Yy0yLjAzLDYuMDktNy43Niw5LjcyLTEzLjc3LDkuNzEtNi41Ny03LjQ2LTE0LjQ2LTEyLjc5LTE1LjE1LTI1LjEzLDEzLjQ3LDIuMzksMTkuMzQsMTEuNjgsMjguOTIsMTUuNDJaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNy4xNywyNzEuOWMtOS4xMS0xNC44NS00LjM0LTMyLjk0LTEuMzQtNDguNTdsMS4zNCw0OC41N1oiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==";

const ROLES = { OWNER: 'owner', SENIOR_PASTOR: 'senior_pastor', PASTOR: 'pastor', GROUP_LEADER: 'group_leader' };

// ─── Dock icons (inline SVG, no external dependency) ─────────────
const IconUsers = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IconBarChart = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
const IconCalendar = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const IconHeart = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>);
const IconGrid = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>);
const IconStar = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const IconClock = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const IconUser = ({s=22,c="currentColor"}) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);

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
const SPECIAL_GROUPS_PT = ["Jovens","Link","Legacy","Brilho","Herói","Culto Hope","Culto Fé","Serviço em Inglês","Outro","CRIE","Gerações","Equipe Carisma"];

const STAGE_LABEL = {
  PT: {"New":"Novo","Reached Out":"Contato Feito","Responded":"Respondeu","Meeting Scheduled":"Reunião Agendada","Meeting Done":"Reunião Realizada","Placed in Ministry":"Colocado no Ministério"},
  EN: {"New":"New","Reached Out":"Reached Out","Responded":"Responded","Meeting Scheduled":"Meeting Scheduled","Meeting Done":"Meeting Done","Placed in Ministry":"Placed in Ministry"}
};

// Discipleship journey axis — separate from the volunteer placement `stage` field above.
const DISCIPLESHIP_STAGES = ["New Believer", "Start Class", "Baptism", "New Members Cafe", "Not Yet Serving", "Active", "Placed"];

const DISCIPLESHIP_STAGE_LABEL = {
  PT: {
    "New Believer": "Novo Crente",
    "Start Class": "Start",
    "Baptism": "Batismo",
    "New Members Cafe": "Cafe de Membros",
    "Not Yet Serving": "Ainda Nao Serve",
    "Active": "Voluntarios",
    "Placed": "Colocados"
  },
  EN: {
    "New Believer": "New Believers",
    "Start Class": "Start Class",
    "Baptism": "Baptism",
    "New Members Cafe": "New Members Cafe",
    "Not Yet Serving": "Not Yet Serving",
    "Active": "Volunteers",
    "Placed": "Placed"
  }
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

const DISC_TYPE = {
  PT: { D:"Executor", I:"Comunicador", S:"Planejador", C:"Analista" },
  EN: { D:"Driver", I:"Influencer", S:"Supporter", C:"Analyst" }
};
const DISC_COLORS = { D:"#f87171", I:"#f59e0b", S:"#34d399", C:"#60a5fa" };

const LANGUAGE_DISPLAY = {
  PT: { "Portugues":"🇧🇷 Portugues", "English":"🇺🇸 Ingles", "Espanol":"🌎 Espanol", "Português":"🇧🇷 Portugues", "Both":"🌐 Ambos" },
  EN: { "Portugues":"🇧🇷 Portugues", "English":"🇺🇸 English", "Espanol":"🌎 Espanol", "Português":"🇧🇷 Portugues", "Both":"🌐 Both" }
};

const COUNTRY_FLAGS = {
  "Mexico":"🇲🇽","Colombia":"🇨🇴","Spain":"🇪🇸","Argentina":"🇦🇷","Peru":"🇵🇪",
  "Venezuela":"🇻🇪","Chile":"🇨🇱","Ecuador":"🇪🇨","Guatemala":"🇬🇹","Cuba":"🇨🇺",
  "Bolivia":"🇧🇴","Dominican Republic":"🇩🇴","Honduras":"🇭🇳","Paraguay":"🇵🇾",
  "El Salvador":"🇸🇻","Nicaragua":"🇳🇮","Costa Rica":"🇨🇷","Panama":"🇵🇦",
  "Uruguay":"🇺🇾","Puerto Rico":"🇵🇷","Equatorial Guinea":"🇬🇶"
};

// ─── GIFTING ANCHOR MAP ───────────────────────────────────────────
const GIFTING_TO_ANCHOR = {
  "Worship & Music":"worship-and-music",
  "Gift of Helps":"gift-of-helps",
  "Visual Storytelling":"visual-storytelling",
  "Digital Communication":"digital-communication",
  "Intercession":"intercession",
  "Hospitality":"hospitality",
  "Evangelism":"evangelism",
  "Encouragement":"encouragement",
  "Faith":"faith",
  "Teaching":"teaching",
  "Administration":"administration",
  "Technical Arts":"technical-arts",
  "Influence & Servant Leadership":"influence-and-servant-leadership",
  "Creativity":"creativity",
  "Discernment & Prophetic":"discernment-and-prophetic"
};

// ─── SHORT KEY → FULL GIFTING NAME (shared across PersonPanel and PersonCard) ─
const SHORT_TO_FULL = {
  visual:"Visual Storytelling",encouragement:"Encouragement",creativity:"Creativity",
  worship:"Worship & Music",hospitality:"Hospitality",faith:"Faith",
  administration:"Administration",prophetic:"Discernment & Prophetic",
  helps:"Gift of Helps",digital:"Digital Communication",
  intercession:"Intercession",evangelism:"Evangelism",
  teaching:"Teaching",technical:"Technical Arts",
  leadership:"Influence & Servant Leadership"
};

// ─── PROFILE TRANSLATION MAPS ────────────────────────────────────
// Maps raw DB value (PT or EN) to { PT, EN, anchorId }
const NATURAL_STRENGTH_MAP = {
  "Mobilizador":         { PT:"Mobilizador",            EN:"Mobilizer",            anchorId:"mobilizador" },
  "Mobilizer":           { PT:"Mobilizador",            EN:"Mobilizer",            anchorId:"mobilizador" },
  "Conector":            { PT:"Conector",               EN:"Connector",            anchorId:"conector" },
  "Connector":           { PT:"Conector",               EN:"Connector",            anchorId:"conector" },
  "Sustentador":         { PT:"Sustentador",            EN:"Sustainer",            anchorId:"sustentador" },
  "Sustainer":           { PT:"Sustentador",            EN:"Sustainer",            anchorId:"sustentador" },
  "Arquiteto":           { PT:"Arquiteto",              EN:"Architect",            anchorId:"arquiteto" },
  "Architect":           { PT:"Arquiteto",              EN:"Architect",            anchorId:"arquiteto" }
};

const LEADERSHIP_MAP = {
  "Lider Visionario":         { PT:"Líder Visionário",          EN:"Visionary Leader",       anchorId:"lider-visionario" },
  "Líder Visionário":         { PT:"Líder Visionário",          EN:"Visionary Leader",       anchorId:"lider-visionario" },
  "Visionary Leader":         { PT:"Líder Visionário",          EN:"Visionary Leader",       anchorId:"lider-visionario" },
  "Lider Relacional":         { PT:"Líder Relacional",          EN:"Relational Leader",      anchorId:"lider-relacional" },
  "Líder Relacional":         { PT:"Líder Relacional",          EN:"Relational Leader",      anchorId:"lider-relacional" },
  "Relational Leader":        { PT:"Líder Relacional",          EN:"Relational Leader",      anchorId:"lider-relacional" },
  "Lider Estrutural":         { PT:"Líder Estrutural",          EN:"Structural Leader",      anchorId:"lider-estrutural" },
  "Líder Estrutural":         { PT:"Líder Estrutural",          EN:"Structural Leader",      anchorId:"lider-estrutural" },
  "Structural Leader":        { PT:"Líder Estrutural",          EN:"Structural Leader",      anchorId:"lider-estrutural" },
  "Influenciador de Suporte": { PT:"Influenciador de Suporte",  EN:"Supporting Influencer",  anchorId:"influenciador-de-suporte" },
  "Supporting Influencer":    { PT:"Influenciador de Suporte",  EN:"Supporting Influencer",  anchorId:"influenciador-de-suporte" }
};

const EMOTIONAL_MAP = {
  "Processador Expressivo":   { PT:"Processador Expressivo",   EN:"Expressive Processor",   anchorId:"processador-expressivo" },
  "Expressive Processor":     { PT:"Processador Expressivo",   EN:"Expressive Processor",   anchorId:"processador-expressivo" },
  "Carregador Estavel":       { PT:"Carregador Estável",        EN:"Steady Carrier",         anchorId:"carregador-estavel" },
  "Carregador Estável":       { PT:"Carregador Estável",        EN:"Steady Carrier",         anchorId:"carregador-estavel" },
  "Steady Carrier":           { PT:"Carregador Estável",        EN:"Steady Carrier",         anchorId:"carregador-estavel" },
  "Processador Orientado":    { PT:"Processador Orientado",    EN:"Driven Processor",       anchorId:"processador-orientado" },
  "Driven Processor":         { PT:"Processador Orientado",    EN:"Driven Processor",       anchorId:"processador-orientado" },
  "Processador Analitico":    { PT:"Processador Analítico",    EN:"Analytical Processor",   anchorId:"processador-analitico" },
  "Processador Analítico":    { PT:"Processador Analítico",    EN:"Analytical Processor",   anchorId:"processador-analitico" },
  "Analytical Processor":     { PT:"Processador Analítico",    EN:"Analytical Processor",   anchorId:"processador-analitico" }
};

// Maps canonical English ministry_fit string to PT display
const MINISTRY_FIT_MAP = {
  "Best in relational and creative ministry. Build connection before deploying.":
    "Melhor em ministerios relacionais e criativos. Construa conexao antes de convocar.",
  "Strong in operational and technical roles. Give autonomy and clear standards.":
    "Forte em funcoes operacionais e tecnicas. Autonomia e padroes claros.",
  "High evangelistic energy. Pair with a discipleship-oriented teammate.":
    "Alta energia evangelistica. Emparelhe com alguem orientado ao discipulado.",
  "Prophetic and intercession gifting. Protect prayer space and provide pastoral covering.":
    "Dom profetico e de intercessao. Proteja o espaco de oracao e proporcione cobertura pastoral.",
  "Natural relational gifting. Position at entry points and care roles.":
    "Dom relacional natural. Posicione em pontos de entrada e cuidado."
};

// Maps canonical English pairing label to PT display
const PAIRING_LABEL_MAP = {
  "Worship Culture Builder":     "Construtor de Cultura de Louvor",
  "Deep Worshiper":              "Adorador Profundo",
  "Consistent Worshiper":        "Adorador Consistente",
  "Initiative Servant":          "Servidor de Iniciativa",
  "Relational Evangelist":       "Evangelista Relacional",
  "Bold Evangelist":             "Evangelista Ousado",
  "Deep Teacher":                "Professor em Profundidade",
  "Activating Teacher":          "Professor Ativador",
  "Systems Architect":           "Arquiteto de Sistemas",
  "Structure Builder":           "Construtor de Estruturas",
  "Faithful Intercessor":        "Intercessor Fiel",
  "Strategic Intercessor":       "Intercessor Estrategico",
  "High-Care Prophetic":         "Profetico de Alta Atencao",
  "Steady Prophetic":            "Profetico Estavel",
  "Natural Relational Leader":   "Lider Relacional Natural",
  "High-Impact Leader":          "Lider de Alto Impacto",
  "Deep Hospitality":            "Hospitalidade Profunda",
  "Expressive Hospitality":      "Hospitalidade Expressiva",
  "Collaborative Creative":      "Criativo Colaborativo",
  "High-Execution Creative":     "Criativo de Alta Execucao"
};

// Maps pairing EN label to anchorId in reference-content.json
const PAIRING_TO_ANCHOR = {
  "Worship Culture Builder":"worship-culture-builder",
  "Deep Worshiper":"deep-worshiper",
  "Consistent Worshiper":"worship-music-planejador-s",
  "Initiative Servant":"initiative-servant",
  "Relational Evangelist":"relational-evangelist",
  "Bold Evangelist":"bold-evangelist",
  "Deep Teacher":"deep-teacher",
  "Activating Teacher":"activating-teacher",
  "Systems Architect":"systems-architect",
  "Structure Builder":"structure-builder",
  "Faithful Intercessor":"faithful-intercessor",
  "Strategic Intercessor":"strategic-intercessor",
  "High-Care Prophetic":"high-care-prophetic",
  "Steady Prophetic":"steady-prophetic",
  "Natural Relational Leader":"natural-relational-leader",
  "High-Impact Leader":"high-impact-leader",
  "Deep Hospitality":"deep-hospitality",
  "Expressive Hospitality":"expressive-hospitality",
  "Collaborative Creative":"collaborative-creative",
  "High-Execution Creative":"high-execution-creative"
};

// Maps DISC letter to anchorId
const DISC_TO_ANCHOR = { D:"executor", I:"comunicador", S:"planejador", C:"analista" };

const SPECIAL_GROUP_PT = {
  "Rocket":"Rocket","Link":"Link","Legacy":"Legacy","Shine":"Shine","Hero":"Hero",
  "Culto Hope":"Culto Hope","Culto Fé":"Culto Fé","English Service":"Culto em Inglês","Other":"Outro",
  "CRIE":"CRIE","Gerações":"Gerações","Carisma Serve Team":"Equipe Carisma","Carisma Student":"Equipe Carisma"
};

const PASTOR_SUGGESTIONS = ["Pra Alice","Pr Rafa"];

const MINISTRIES_STARTER = [
  "Worship Team","Sound","Lighting","Projection","Streaming","Photo & Video",
  "Social Media","Service Experience","Consolidation","Translation",
  "Lagoinha Kids","Intercession","Volunteer Coffee","Hospitality — Welcome",
  "Parking","Setup & Teardown","GC Leader","Legacy","English Service","WE CARE"
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
  "English Service":"Culto em Inglês",
  "Choir":"Coral",
  "Instrumental Ministry":"Ministerio Instrumental",
  "Setup and Teardown":"Montagem e Desmontagem",
  "Parking Ministry":"Ministerio de Estacionamento",
  "Facilities Support":"Suporte as Instalacoes",
  "Video Editing":"Edicao de Video",
  "Photography":"Fotografia",
  "Graphics Team":"Equipe de Design",
  "Camera Operation":"Camera",
  "Social Media Team":"Equipe de Redes Sociais",
  "Kids Ministry":"Ministerio Infantil",
  "Youth Ministry":"Ministerio de Jovens",
  "Ushers":"Recepcao",
  "Intercessors":"Intercessores",
  "GC":"GC",
  "Hospitality - Welcome":"Recepção",
  "WE CARE - Helps":"WE CARE - Ajuda Pratica",
  "WE CARE - Evangelism":"WE CARE - Evangelismo",
  "WE CARE":"WE CARE"
};

function ministryLabel(name, lang, personLang) {
  var displayLang = personLang || lang;
  if (displayLang === "PT") return MINISTRY_PT[name] || name;
  return name;
}

const SPECIAL_GROUPS = ["Rocket","Link","Legacy","Shine","Hero","Culto Hope","Culto Fé","English Service","Other","CRIE","Gerações","Carisma Serve Team"];
const LANGUAGES = ["Portugues","English","Espanol"];

const ATTENDANCE_GROUPS_DASH = ["Legacy","Rocket","SHINE","HERO","Link","Culto Hope","Culto Fé","English Service","CRIE","Esportes"];
const GROUP_ROLE_MAP_DASH = {
  "Legacy":          ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Kids","Translation"],
  "Rocket":          ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Translation"],
  "SHINE":           ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Translation","Cafe/Food"],
  "HERO":            ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Translation"],
  "Link":            ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Translation"],
  "Culto Hope":      ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Translation"],
  "Culto Fé":        ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Translation"],
  "English Service": ["Welcome","Set Up","Worship","Sound","Lighting","Projection","Streaming","Photo & Video","Social Media","Service Experience","Consolidation","Intercession","Translation"],
  "CRIE":            ["Welcome","Set Up","Sound","Projection","Streaming","Photo & Video","Social Media","Service Experience","Intercession"],
  "Esportes":        ["Welcome","Set Up","Photo & Video","Social Media","Intercession"],
  "Carisma Serve Team": ["Welcome","Set Up","Sound","Projection","Photo & Video","Social Media","Kids","Cafe/Food"]
};

const GL_GROUPS = ["Legacy","Rocket","SHINE","HERO","Link","Culto Hope","Culto Fé","English Service","CRIE","Esportes","Carisma Serve Team"];

const MINISTRY_TO_GL_ROLE = {
  "Worship Team":         "Worship",
  "Sound":                "Sound",
  "Lighting":             "Lighting",
  "Projection":           "Projection",
  "Streaming":            "Streaming",
  "Photo & Video":        "Photo & Video",
  "Social Media":         "Social Media",
  "Service Experience":   "Service Experience",
  "Consolidation":        "Consolidation",
  "Translation":          "Translation",
  "Lagoinha Kids":        "Kids",
  "Intercession":         "Intercession",
  "Volunteer Coffee":     "Cafe/Food",
  "Hospitality - Welcome":"Welcome",
  "Setup & Teardown":     "Set Up",
};

const MINISTRY_LEADERS = {
  "Worship Team":         "Kenia",
  "Sound":                "Claudio",
  "Lighting":             "Kevin",
  "Projection":           "Marjorie",
  "Streaming":            "Mauricio",
  "Photo & Video":        "Marjorie",
  "Social Media":         "Marjorie",
  "Service Experience":   "Fabi",
  "Consolidation":        "Petito",
  "Translation":          "Pastora Paula",
  "Lagoinha Kids":        "Babi",
  "Intercession":         "Vania",
  "Volunteer Coffee":     "Juliana",
  "Hospitality - Welcome":"Fabi",
  "Setup & Teardown":     "Anderson",
};

const DEFAULT_TEMPLATE_PT = "Oi, {{name}}! Tudo bem? 😊 Que alegria ter você conosco! Vi que você tem o dom de {{gifting}} e isso é incrível! Adoraria marcar um tempo com você para te conhecer melhor e ver como podemos servir os seus dons aqui na Lagoinha Tampa. Quando seria um bom momento?";
const DEFAULT_TEMPLATE_EN = "Hi {{name}}! So glad you are here with us! I saw that you have the gifting of {{gifting}} and that is amazing! I would love to find a time to meet with you and see how we can best serve your giftings here at Lagoinha Tampa. When would be a good time?";

const L = {
  PT: {
    dashboard:"Painel Pastoral",analytics:"Análise",people:"Pessoas",byGifting:"Por Dom",
    logout:"Sair",enter:"Entrar",password:"Digite a senha do painel",
    totalSub:"Total de Respostas",placedMin:"Colocados no Ministério",
    awaitContact:"Aguardando Contato",inProgress:"Em Andamento",
    pipeline:"Funil de Conexão",topGiftings:"Principais Dons",
    langSplit:"Idioma Preferido",weeklySub:"Respostas Semanais",noData:"Sem dados ainda",
    searchPlaceholder:"Buscar nome, email, WhatsApp…",
    allStages:"Todos os Estágios",allGiftings:"Todos os Dons",
    allLanguages:"Todos os Idiomas",allGroups:"Todos os Grupos",allPastors:"Todos os Pastores",
    filterPastor:"Pastor",noMatch:"Nenhuma pessoa encontrada.",
    connStage:"Estágio de Conexão",assignedPastor:"Pastor Responsável",
    orType:"Ou digite outro nome…",currentMin:"Ministérios Atuais",
    langSpoken:"Idiomas Falados",specialGroups:"Grupos Especiais",
    groupRolesHd:"Funcoes nos Grupos",groupsAttendedHd:"Grupos que frequenta",giftingProfile:"Perfil de Dons",notesAudit:"Notas e Histórico",
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
    cancel:"Cancelar",
    noContact:"Sem contato",
    loginTitle:"Painel do Pastor",
    loginDesc:"Entre para acessar os dados ministeriais da Lagoinha Tampa.",
    loginPasswordLabel:"Senha do Painel",
    loginEnter:"Acessar Painel",
    loginChecking:"Verificando...",
    loginConnected:"● Conectado",
    loginInternal:"v2.4 · Interno",
    loginTagline:"Um espaço seguro para pastores acompanharem novos voluntários enquanto descobrem seus dons e encontram seu lar ministerial.",
    loginErrorPw:"Senha incorreta.",
    loginErrorConn:"Erro de conexão. Tente novamente.",
    statusHealthy:"Saudável",
    statusNeeds:"Precisa de Voluntários",
    statusCritical:"Crítico",
    moreGiftings:"a mais",
    gifts:"DONS",
    conversion:"Conversão",
    mapped:"mapeados",
    funnelDesc:"Caminho do voluntário desde inscrição até colocação ministerial",
    donutDesc:"Distribuição entre voluntários ativos",
    weeklyDesc:"Volume de novas inscrições por semana",
    addMinistry:"Adicionar",
    selectMinistry:"Selecionar ministério…",
    typeMinistry:"Digitar nome do ministério…",
    addBtn:"+ Adicionar",
    selectCustom:"Digitar personalizado…",
    volunteers:"VOLUNTÁRIOS",
    availableVars:"Variáveis Disponíveis",
    discProfile:"Perfil DISC",discType:"Tipo DISC",naturalStr:"Forca Natural",
    leadership:"Lideranca",emotional:"Perfil Emocional",pairing:"Parceria",
    ministryFit:"Fit Ministerial",pastoralAlert:"Potencial Pastoral",
    discDist:"Distribuicao DISC",byLeadership:"Tendencias de Lideranca",byEmotional:"Perfis Emocionais",
    byNatural:"Forcas Naturais",discCulturalNote:"No Brasil, o perfil Comunicador e mais prevalente do que nos EUA, refletindo a cultura relacional e expressiva da comunidade.",
    noDistData:"Sem dados suficientes ainda.",
    reference:"Referencia",
    loginRestricted:"Acesso Restrito",loginEmail:"Email",loginPassword:"Senha",
    loginSignIn:"Entrar",loginSignInGoogle:"Entrar com Google",loginOr:"ou",loginSigningIn:"Entrando...",
    roleOwner:"Desenvolvedor",roleSeniorPastor:"Pastor Sênior",rolePastor:"Pastor",roleGroupLeader:"Líder de Grupo",
    usersTab:"Usuários",groupLeaderMsg:"Em breve — área do líder de grupo",scheduling:"Agendamento",
    addUser:"Adicionar Usuário",userCreated:"Usuário criado com sucesso.",sendCredentials:"Envie as credenciais via WhatsApp.",
    userRoleSenior:"Pastor Sênior",userRolePastor:"Pastor",userRoleGroupLeader:"Líder de Grupo",
    attendance:"Presença",attOpenForm:"Abrir formulário",attQrLabel:"QR",
    attSunday10:"Último Domingo 10h",attEnglish:"Último Culto Inglês",
    attAvgVol:"Média de Voluntários",attAvgKids:"Média de Kids",
    attTrend:"Tendência por Culto",attByService:"Média de Presença por Culto",
    attVolRatio:"Proporção de Voluntários",attLog:"Histórico Completo",
    attDate:"Data",attService:"Culto",attTemplo:"Templo",attVol:"Voluntários",attKids:"Kids",attTotal:"Total",attVolPct:"Vol%",
  },
  EN: {
    dashboard:"Ministry Dashboard",analytics:"Analytics",people:"People",byGifting:"By Gifting",
    logout:"Logout",enter:"Enter",password:"Enter dashboard password",
    totalSub:"Total Submissions",placedMin:"Placed in Ministry",
    awaitContact:"Awaiting Contact",inProgress:"In Progress",
    pipeline:"Connection Pipeline",topGiftings:"Top Giftings",
    langSplit:"Preferred Language",weeklySub:"Weekly Submissions",noData:"No data yet",
    searchPlaceholder:"Search name, email, WhatsApp…",
    allStages:"All Stages",allGiftings:"All Giftings",
    allLanguages:"All Languages",allGroups:"All Groups",allPastors:"All Pastors",
    filterPastor:"Pastor",noMatch:"No people match these filters.",
    connStage:"Connection Stage",assignedPastor:"Assigned Pastor",
    orType:"Or type another pastor name…",currentMin:"Current Ministries",
    langSpoken:"Languages Spoken",specialGroups:"Special Groups",
    groupRolesHd:"Group Roles",groupsAttendedHd:"Groups Attended",giftingProfile:"Gifting Profile",notesAudit:"Notes & Audit Trail",
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
    cancel:"Cancel",
    noContact:"No contact",
    loginTitle:"Pastor Dashboard",
    loginDesc:"Sign in to access ministry insights for Lagoinha Tampa.",
    loginPasswordLabel:"Dashboard Password",
    loginEnter:"Enter Dashboard",
    loginChecking:"Checking...",
    loginConnected:"● Connected",
    loginInternal:"v2.4 · Internal",
    loginTagline:"A safe place for pastors to walk alongside new volunteers as they discover their gifts and find a ministry home.",
    loginErrorPw:"Incorrect password.",
    loginErrorConn:"Connection error. Try again.",
    statusHealthy:"Healthy",
    statusNeeds:"Needs Volunteers",
    statusCritical:"Critical",
    moreGiftings:"more",
    gifts:"GIFTS",
    conversion:"Conversion",
    mapped:"mapped",
    funnelDesc:"Volunteer journey from sign-up to ministry placement",
    donutDesc:"Distribution across active volunteers",
    weeklyDesc:"New sign-ups per week — last 10 weeks",
    addMinistry:"Add",
    selectMinistry:"Select ministry…",
    typeMinistry:"Type ministry name…",
    addBtn:"+ Add",
    selectCustom:"Type custom…",
    volunteers:"VOLUNTEERS",
    availableVars:"Available Variables",
    discProfile:"DISC Profile",discType:"DISC Type",naturalStr:"Natural Strength",
    leadership:"Leadership",emotional:"Emotional Profile",pairing:"Pairing",
    ministryFit:"Ministry Fit",pastoralAlert:"Pastoral Potential",
    discDist:"DISC Profile Distribution",byLeadership:"Leadership Tendencies",byEmotional:"Emotional Profiles",
    byNatural:"Natural Strengths",discCulturalNote:"In Brazilian communities, the Comunicador profile is more prevalent than in the US, reflecting the relational and expressive culture of the congregation.",
    noDistData:"Not enough data yet.",
    reference:"Reference",
    loginRestricted:"Restricted Access",loginEmail:"Email",loginPassword:"Password",
    loginSignIn:"Sign In",loginSignInGoogle:"Sign in with Google",loginOr:"or",loginSigningIn:"Signing in...",
    roleOwner:"Developer",roleSeniorPastor:"Senior Pastor",rolePastor:"Pastor",roleGroupLeader:"Group Leader",
    usersTab:"Users",groupLeaderMsg:"Coming soon — group leader area",scheduling:"Scheduling",
    addUser:"Add User",userCreated:"User created successfully.",sendCredentials:"Send credentials via WhatsApp.",
    userRoleSenior:"Senior Pastor",userRolePastor:"Pastor",userRoleGroupLeader:"Group Leader",
    attendance:"Attendance",attOpenForm:"Open form",attQrLabel:"QR",
    attSunday10:"Latest Sunday 10AM",attEnglish:"Latest English Service",
    attAvgVol:"Avg Volunteers",attAvgKids:"Avg Kids",
    attTrend:"Trend by Service",attByService:"Avg Attendance by Service",
    attVolRatio:"Volunteer Ratio",attLog:"Full Log",
    attDate:"Date",attService:"Service",attTemplo:"Sanctuary",attVol:"Volunteers",attKids:"Kids",attTotal:"Total",attVolPct:"Vol%",
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

  .pp-dropdown { position:absolute; top:calc(100% + 8px); right:0; background:#1a1a1a; border:1px solid rgba(42,191,191,0.18); border-radius:8px; padding:6px; z-index:200; min-width:200px; box-shadow:0 8px 32px rgba(0,0,0,0.5); }
  .pp-item { display:block; width:100%; background:transparent; border:none; padding:9px 14px; min-height:44px; color:#aebac0; font-size:11px; font-family:'JetBrains Mono',monospace; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; text-align:left; border-radius:6px; transition:background 0.12s,color 0.12s; white-space:nowrap; box-sizing:border-box; }
  .pp-item:hover { background:rgba(42,191,191,0.10); color:#2ABFBF; }
  .pp-active { color:#2ABFBF; background:rgba(42,191,191,0.08); }
  .pp-divider { height:1px; background:rgba(255,255,255,0.06); margin:5px 8px; }
  .pp-sub { padding:4px 8px 2px; }
  .pp-sub select { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#aebac0; border-radius:8px; padding:6px 10px; font-size:11px; font-family:'JetBrains Mono',monospace; cursor:pointer; outline:none; margin-bottom:5px; box-sizing:border-box; }



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

  @keyframes dockSheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  .dock-sheet { animation: dockSheetUp 0.2s ease; }

  /* ─── LTC Login Logo Animation ─────────────────────────────── */
  .ltc-logo-ring {
    fill: none;
    stroke: rgba(255,255,255,0.88);
    stroke-width: 10;
    stroke-linecap: round;
    stroke-dasharray: 440 440;
    stroke-dashoffset: 440;
    opacity: 0;
    animation: ltcRingDraw 1.1s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes ltcRingDraw {
    0%   { stroke-dashoffset: 440; opacity: 0; }
    8%   { opacity: 0.9; }
    85%  { opacity: 0.9; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  .ltc-ring-fill {
    opacity: 0;
    animation: ltcRingFill 0.8s ease-out 0.3s both;
  }
  @keyframes ltcRingFill {
    to { opacity: 1; }
  }
  .ltc-logo-mark {
    animation:
      ltcMarkReveal 0.45s ease-out 0.75s both,
      ltcFloat 5.5s ease-in-out 2.1s infinite;
  }
  @keyframes ltcMarkReveal {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0px); }
  }
  @keyframes ltcFloat {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-1.5px); }
  }
  .ltc-light-sweep {
    fill: none;
    stroke: rgba(255,255,255,0.9);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 62 378;
    stroke-dashoffset: 0;
    opacity: 0;
    filter: url(#ltcSoftGlow);
    animation: ltcLightSweep 0.75s ease-out 1.2s forwards;
  }
  @keyframes ltcLightSweep {
    0%   { stroke-dashoffset: 0;    opacity: 0; }
    10%  { opacity: 0.45; }
    90%  { opacity: 0.45; }
    100% { stroke-dashoffset: -440; opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ltc-logo-ring,
    .ltc-logo-mark,
    .ltc-light-sweep,
    .ltc-ring-fill {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      stroke-dashoffset: 0 !important;
    }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────
function renderLangFlags(person, lang) {
  var ls = person.languages_spoken;
  var arr = [];
  try {
    if (typeof ls === "string") arr = JSON.parse(ls);
    else if (Array.isArray(ls)) arr = ls;
  } catch(e) { arr = []; }
  // Legacy single-string "Both"
  if (arr.length === 0 && ls === "Both") arr = ["Portugues","English"];
  if (arr.length === 0) {
    // Fall back to submission language field
    return person.language === "EN" ? "🇺🇸 English" : "🇧🇷 Portugues";
  }
  return arr.map(function(l) {
    if (l === "English") return "🇺🇸 English";
    if (l === "Espanol") {
      var flag = person.country_of_origin ? (COUNTRY_FLAGS[person.country_of_origin] || "🌎") : "🌎";
      var country = person.country_of_origin ? " (" + person.country_of_origin + ")" : "";
      return flag + " Espanol" + country;
    }
    return "🇧🇷 Portugues";
  }).join(" · ");
}

function parseJSON(str, fallback = []) {
  if (Array.isArray(str)) return str;
  if (str && typeof str === 'object') return str;
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

function formatNoteDate(ts, lang) {
  if (!ts) return "";
  const d = new Date(ts + (ts.includes("Z") ? "" : "Z"));
  if (lang === "PT") {
    const day = d.getDate();
    const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    const mon = months[d.getMonth()];
    const yr = d.getFullYear();
    const h = String(d.getHours()).padStart(2,"0");
    const m = String(d.getMinutes()).padStart(2,"0");
    return `${day} ${mon} ${yr} as ${h}:${m}`;
  } else {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const mon = months[d.getMonth()];
    const day = d.getDate();
    const yr = d.getFullYear();
    var h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const m = String(d.getMinutes()).padStart(2,"0");
    return `${mon} ${day}, ${yr} at ${h}:${m} ${ampm}`;
  }
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
function getMinistryRecommendations(person, lang) {
  if (!person.gifting_1) return [];

  var allScores = {};
  try {
    allScores = JSON.parse(person.scores || '{}');
  } catch(e) { allScores = {}; }

  var discPrimary = person.disc_primary || '';
  var discSecondary = person.disc_secondary || '';
  var discTypes = [discPrimary, discSecondary].filter(Boolean);

  // Parse languages spoken
  var langsSpoken = [];
  try {
    var ls = person.languages_spoken;
    if (typeof ls === 'string') langsSpoken = JSON.parse(ls);
    else if (Array.isArray(ls)) langsSpoken = ls;
  } catch(e) { langsSpoken = []; }
  var isBilingual = langsSpoken.indexOf('Both') > -1 || (langsSpoken.indexOf('Portugues') > -1 && langsSpoken.indexOf('English') > -1);

  // Reliability flag
  var isReliable = person.reliability_flag === 1;

  // Ministry score and reason accumulator
  var ministryData = {};
  function add(ministry, points, reason) {
    if (!ministryData[ministry]) {
      ministryData[ministry] = { score: 0, reasons: [] };
    }
    ministryData[ministry].score += points;
    if (reason &&
        ministryData[ministry].reasons.indexOf(reason) === -1) {
      ministryData[ministry].reasons.push(reason);
    }
  }

  // Rank weight multipliers
  // gifting_1=3x, gifting_2=2x, gifting_3=1x
  // Strong non-top3 (>=70%) = 1.5x
  // Moderate (50-69%) = 0.75x
  // Below 50% and not in top 3 = 0 (no contribution)
  function rankWeight(giftingName) {
    if (giftingName === person.gifting_1) return 3;
    if (giftingName === person.gifting_2) return 2;
    if (giftingName === person.gifting_3) return 1;
    var pct = allScores[giftingName] || 0;
    if (pct >= 70) return 1.5;
    if (pct >= 50) return 0.75;
    return 0;
  }

  // Reason label for a gifting
  function giftingReason(giftingName) {
    var pct = allScores[giftingName] || 0;
    var rank = '';
    if (giftingName === person.gifting_1) rank = ' (#1)';
    else if (giftingName === person.gifting_2) rank = ' (#2)';
    else if (giftingName === person.gifting_3) rank = ' (#3)';
    return giftingName + rank + ' - ' + pct + '%';
  }

  // Strong gifting check (top 3 OR >=70%)
  function isStrong(giftingName) {
    return (giftingName === person.gifting_1 ||
            giftingName === person.gifting_2 ||
            giftingName === person.gifting_3 ||
            (allScores[giftingName] || 0) >= 70);
  }

  // PRIMARY GIFTING DOMINANCE RULE
  var MINISTRY_PRIMARY_GIFTING = {
    'Worship Team': 'Worship & Music',
    'Sound': 'Technical Arts',
    'Lighting': 'Technical Arts',
    'Projection': 'Technical Arts',
    'Streaming': 'Technical Arts',
    'Photo & Video': 'Visual Storytelling',
    'Social Media': 'Digital Communication',
    'Service Experience': 'Administration',
    'Hospitality - Welcome': 'Hospitality',
    'Volunteer Coffee': 'Gift of Helps',
    'Parking': 'Gift of Helps',
    'Setup & Teardown': 'Gift of Helps',
    'GC Leader': 'Influence & Servant Leadership',
    'Lagoinha Kids': 'Teaching',
    'Consolidation': 'Encouragement',
    'Intercession': 'Intercession',
    'WE CARE - Helps': 'Gift of Helps',
    'WE CARE - Evangelism': 'Evangelism',
    'Translation': 'Bilingual'
  };

  function isSuppressed(ministry) {
    var primaryGifting = MINISTRY_PRIMARY_GIFTING[ministry];
    if (!primaryGifting) return false;
    // Translation uses bilingual check not gifting
    if (primaryGifting === 'Bilingual') return !isBilingual;
    var inTop3 = (primaryGifting === person.gifting_1 ||
                  primaryGifting === person.gifting_2 ||
                  primaryGifting === person.gifting_3);
    if (!inTop3 && (allScores[primaryGifting] || 0) < 40) {
      return true;
    }
    return false;
  }

  // GIFTING TO MINISTRY SCORING
  var GIFTING_MINISTRY_MAP = {
    'Worship & Music': [
      ['Worship Team', 20],
      ['Sound', 3],
      ['Lighting', 1]
    ],
    'Gift of Helps': [
      ['Setup & Teardown', 10],
      ['Parking', 9],
      ['Volunteer Coffee', 9],
      ['WE CARE - Helps', 10]
    ],
    'Technical Arts': [
      ['Sound', 12],
      ['Lighting', 12],
      ['Projection', 12],
      ['Streaming', 11],
      ['Photo & Video', 5],
      ['Service Experience', 3]
    ],
    'Visual Storytelling': [
      ['Photo & Video', 12],
      ['Streaming', 7],
      ['Social Media', 5]
    ],
    'Digital Communication': [
      ['Social Media', 12],
      ['Streaming', 3]
    ],
    'Creativity': [
      ['Photo & Video', 5],
      ['Social Media', 4]
    ],
    'Administration': [
      ['Service Experience', 12],
      ['GC Leader', 6],
      ['Setup & Teardown', 4]
    ],
    'Intercession': [
      ['Intercession', 15]
    ],
    'Hospitality': [
      ['Hospitality - Welcome', 12],
      ['Volunteer Coffee', 4],
      ['Consolidation', 5],
      ['WE CARE - Evangelism', 5]
    ],
    'Evangelism': [
      ['Consolidation', 7],
      ['WE CARE - Evangelism', 12],
      ['Hospitality - Welcome', 4]
    ],
    'Encouragement': [
      ['Consolidation', 12],
      ['Hospitality - Welcome', 6],
      ['Lagoinha Kids', 8],
      ['GC Leader', 5],
      ['WE CARE - Evangelism', 6]
    ],
    'Teaching': [
      ['Lagoinha Kids', 12],
      ['GC Leader', 7],
      ['Translation', 5]
    ],
    'Influence & Servant Leadership': [
      ['GC Leader', 12],
      ['Service Experience', 5],
      ['Lagoinha Kids', 5]
    ],
    'Faith': [
      ['Intercession', 4],
      ['GC Leader', 3],
      ['Lagoinha Kids', 3]
    ]
  };

  // Apply gifting scores with rank weighting and reasons
  Object.keys(GIFTING_MINISTRY_MAP).forEach(function(gifting) {
    var weight = rankWeight(gifting);
    if (weight === 0) return;
    var mappings = GIFTING_MINISTRY_MAP[gifting];
    mappings.forEach(function(pair) {
      add(pair[0], pair[1] * weight, giftingReason(gifting));
    });
  });

  // DISC MODIFIER SCORES
  if (discTypes.some(function(d){
    return d==='I'||d==='Comunicador';
  })) {
    add('Hospitality - Welcome', 4, 'DISC: Comunicador');
    add('Consolidation', 4, 'DISC: Comunicador');
    add('WE CARE - Evangelism', 3, 'DISC: Comunicador');
  }
  if (discTypes.some(function(d){
    return d==='D'||d==='Executor';
  })) {
    add('GC Leader', 4, 'DISC: Executor');
    add('Service Experience', 5, 'DISC: Executor');
    add('Setup & Teardown', 3, 'DISC: Executor');
  }
  if (discTypes.some(function(d){
    return d==='S'||d==='Planejador';
  })) {
    add('Projection', 3, 'DISC: Planejador');
    add('Streaming', 3, 'DISC: Planejador');
    add('Volunteer Coffee', 3, 'DISC: Planejador');
    add('Parking', 3, 'DISC: Planejador');
    add('Lagoinha Kids', 3, 'DISC: Planejador');
  }
  if (discTypes.some(function(d){
    return d==='C'||d==='Analista';
  })) {
    add('Sound', 4, 'DISC: Analista');
    add('Lighting', 4, 'DISC: Analista');
    add('Projection', 5, 'DISC: Analista');
    add('Streaming', 3, 'DISC: Analista');
    add('Photo & Video', 3, 'DISC: Analista');
  }

  // COMBINATION BONUSES
  if (isStrong('Worship & Music') && isStrong('Administration')) {
    add('Service Experience', 10,
      'Combination: Worship & Music + Administration');
  }
  if (isStrong('Worship & Music') && isStrong('Technical Arts')) {
    add('Sound', 8,
      'Combination: Worship & Music + Technical Arts');
    add('Lighting', 6,
      'Combination: Worship & Music + Technical Arts');
    add('Streaming', 5,
      'Combination: Worship & Music + Technical Arts');
  }
  if (isStrong('Administration') &&
      isStrong('Influence & Servant Leadership')) {
    add('GC Leader', 10,
      'Combination: Administration + Influence & Servant Leadership');
  }
  if (isStrong('Teaching') && isStrong('Encouragement')) {
    add('Lagoinha Kids', 10,
      'Combination: Teaching + Encouragement');
  }
  if (isStrong('Evangelism') && isStrong('Hospitality')) {
    add('Consolidation', 8,
      'Combination: Evangelism + Hospitality');
    add('WE CARE - Evangelism', 8,
      'Combination: Evangelism + Hospitality');
  }
  if (isStrong('Technical Arts') &&
      isStrong('Visual Storytelling')) {
    add('Photo & Video', 8,
      'Combination: Technical Arts + Visual Storytelling');
    add('Streaming', 6,
      'Combination: Technical Arts + Visual Storytelling');
    add('Projection', 6,
      'Combination: Technical Arts + Visual Storytelling');
  }
  if (isStrong('Gift of Helps') && isStrong('Evangelism')) {
    add('WE CARE - Helps', 8,
      'Combination: Gift of Helps + Evangelism');
    add('WE CARE - Evangelism', 6,
      'Combination: Gift of Helps + Evangelism');
  }

  // BILINGUAL BONUS
  if (isBilingual) {
    add('WE CARE - Helps', 4, 'Bilingual');
    add('WE CARE - Evangelism', 5, 'Bilingual');
    add('Consolidation', 3, 'Bilingual');
  }

  // TRANSLATION -- bilingual + reliable only
  if (isBilingual && isReliable) {
    add('Translation', 20,
      'Bilingual + Reliability commitment');
  }

  // GUARANTEED SLOT RULE
  var GUARANTEED = {
    'Worship & Music': 'Worship Team',
    'Intercession': 'Intercession',
    'Gift of Helps': 'Setup & Teardown',
    'Technical Arts': 'Sound',
    'Administration': 'Service Experience',
    'Encouragement': 'Consolidation',
    'Teaching': 'Lagoinha Kids',
    'Influence & Servant Leadership': 'GC Leader',
    'Hospitality': 'Hospitality - Welcome',
    'Visual Storytelling': 'Photo & Video',
    'Digital Communication': 'Social Media',
    'Evangelism': 'WE CARE - Evangelism'
  };
  var guaranteed = GUARANTEED[person.gifting_1];
  if (guaranteed && !isSuppressed(guaranteed)) {
    if (!ministryData[guaranteed]) {
      ministryData[guaranteed] = { score: 0, reasons: [] };
    }
    var currentScore = ministryData[guaranteed].score;
    if (currentScore < 30) {
      ministryData[guaranteed].score = 30;
      if (ministryData[guaranteed].reasons.length === 0) {
        ministryData[guaranteed].reasons.push(
          'Primary gifting: ' + person.gifting_1
        );
      }
    }
  }

  // APPLY PRIMARY GIFTING DOMINANCE SUPPRESSION
  Object.keys(ministryData).forEach(function(ministry) {
    if (isSuppressed(ministry)) {
      ministryData[ministry].score = -999;
    }
  });

  // SORT AND RETURN TOP 5
  var sorted = Object.keys(ministryData)
    .filter(function(m) { return ministryData[m].score > 0; })
    .sort(function(a, b) {
      return ministryData[b].score - ministryData[a].score;
    })
    .slice(0, 5)
    .map(function(m) {
      return {
        ministry: m,
        reasons: ministryData[m].reasons.slice(0, 3)
      };
    });

  return sorted;
}

function carismaLevelDisplay(lv, lang) {
  if (!lv) return lv;
  if (lv === "Masters") return "Masters";
  if (lv === "1st Year" || lv === "1 Ano") return lang === "PT" ? "1o Ano" : "1st Year";
  if (lv === "Level 5") return "Masters";
  return lv;
}
function CarismaBadge({ levels, lang }) {
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
          {carismaLevelDisplay(lv, lang)}
        </span>
      ))}
    </>
  );
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────
function SettingsModal({ token, t, onClose, onSaved, lang }) {
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
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,marginBottom:6}}>{t.settings}</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:"#e6f1f0",letterSpacing:"-0.01em"}}>{t.settingsTitle}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#6b7a82",fontSize:14,cursor:"pointer",width:32,height:32,display:"grid",placeItems:"center"}}>✕</button>
        </div>
        <div style={{padding:"32px",display:"flex",flexDirection:"column",gap:24}}>
          {/* Variables hint */}
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:"rgba(94,234,212,0.04)",border:"1px solid rgba(94,234,212,0.1)",borderRadius:10}}>
            <span style={{fontSize:20,flexShrink:0}}>✨</span>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,marginBottom:6}}>{t.availableVars}</div>
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
          <button onClick={onClose} className="btn-ghost" style={{padding:"9px 20px"}}>{t.cancel}</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{padding:"9px 24px"}}>
            {saving ? "..." : t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────
function Login({ lang, t, onLangChange }) {
  const tt = t || L["PT"];
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn() {
    if (!email || !pw) return;
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch(e) {
      const badCred = e.code === "auth/invalid-credential" || e.code === "auth/wrong-password" || e.code === "auth/user-not-found";
      setError(badCred ? tt.loginErrorPw : tt.loginErrorConn);
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch(e) {
      if (e.code !== "auth/popup-closed-by-user") setError(tt.loginErrorConn);
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"40px 20px",position:"relative"}}>
      <style>{css}</style>
      {/* Lang toggle top right */}
      <div style={{position:"fixed",top:20,right:24,display:"flex",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:8,padding:2,fontSize:11,fontFamily:"'JetBrains Mono',monospace",zIndex:10}}>
        <button onClick={()=>onLangChange("PT")} style={{padding:"5px 10px",background:lang==="PT"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",border:lang==="PT"?"1px solid rgba(94,234,212,0.3)":"none",color:lang==="PT"?"#5eead4":"#6b7a82",cursor:"pointer",borderRadius:6,fontWeight:lang==="PT"?600:400,fontFamily:"inherit",transition:"all 0.18s"}}>PT</button>
        <button onClick={()=>onLangChange("EN")} style={{padding:"5px 10px",background:lang==="EN"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",border:lang==="EN"?"1px solid rgba(94,234,212,0.3)":"none",color:lang==="EN"?"#5eead4":"#6b7a82",cursor:"pointer",borderRadius:6,fontWeight:lang==="EN"?600:400,fontFamily:"inherit",transition:"all 0.18s"}}>EN</button>
      </div>
      {/* Backdrop glow halo */}
      <div style={{position:"absolute",top:"24%",left:"50%",transform:"translateX(-50%)",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle, rgba(94,234,212,0.08), transparent 70%)",pointerEvents:"none"}} />
      <div style={{width:440,maxWidth:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:36,position:"relative"}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 158.38 159" style={{width:80,height:80,flexShrink:0}} aria-label="Lagoinha Tampa">
          <defs>
            <style>{`.ltc2-st0{fill:#121111}.ltc2-st1{fill:#777}.ltc2-st2{fill:#7e7d7d}.ltc2-st3{fill:#373737}.ltc2-st4{fill:#353434}.ltc2-st5{fill:#fff}.ltc2-st6{fill:#121212}.ltc2-st7{fill:#848484}.ltc2-st8{fill:#161717}.ltc2-st9{fill:#616161}`}</style>
            <filter id="ltcSoftGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path className="ltc2-st6" d="M87.32,157.84l-.03,1.16h-23l-2.97-3.17,2.49-1.73c6.99,1.33,14.02,1.99,21.1,1.97l2.41,1.77Z"/>
          <path className="ltc2-st3" d="M86.29,0l-.06,1.52-1.87,1.81c-1.66.26-14.25.73-14.7.14-.56-.72-.59-1.59-.39-2.45l1.03-1.02h16Z"/>
          <path className="ltc2-st5 ltc-ring-fill" d="M69.27,1.02c2.61,2.16,7.32-.76,16.96.5,16.15,2.11,31.85,8.07,44.23,19.18,11.66,10.47,19.99,23.11,24.32,38.07,1.18,4.07,2.53,7.23,2.48,11.26.87,6.04.69,13.07-.24,18.92-.14,2.98-.51,5.99-1.1,9.04-3.03,11.18-7.53,22.63-16.43,31.5l-10.77,10.73c-9.18,9.15-28.35,15.88-41.41,17.62-8.73,1.16-17.43-1.14-26-2.01-5.43-.55-10.23-2.92-15.33-5.23C20.88,139.24,5.25,115.65,1.22,89.06c-1.47-9.45-.83-18.49,1.91-27.1C9.46,32.89,35.5,6.97,65.66,2.45c1.14-.17,2.74-1.73,3.6-1.43ZM74.31,17.03c-9.77.02-26.64,5.97-31.98,12.15-.73.84-2.92,1.32-3.97,1.88-1.45,3.91-5.55,5.29-7.72,8.36l-4.47,6.34c-3.3,4.67-6.7,12.85-8.09,18.26-8.59,33.54,11.89,67.68,45.36,76.82,3.62.99,6.53,1.22,9.86,1.21,3.69,2.12,8.3.61,12,.2,29.77-3.23,53.51-25.84,56.71-56.65,3.49-33.64-22.39-65.89-57.69-68.61-2.9-1.51-7.19-1.51-10.02.02Z"/>
          <path className="ltc2-st8" d="M1.22,89.06c-1.34-8.83-2.54-23.96,1.91-27.1-1.94,8.91-2.24,17.87-1.91,27.1Z"/>
          <path className="ltc2-st0" d="M158.09,89.96c-.74.85-1.1.5-1.08-1.02l.24-18.92c.65.05,1.14.84,1.13,1.92l-.29,18.02Z"/>
          <path className="ltc2-st4" d="M158.09,89.96l-2.17,8.02c-.14.12-.67-.31-.53-1l1.63-8.05,1.08,1.02Z"/>
          <g>
            <path className="ltc2-st1" d="M85.31,142.26c-3.71.4-8.31,1.91-12-.2l12,.2Z"/>
            <path className="ltc2-st7" d="M84.34,17.01l-10.02.02c2.83-1.53,7.12-1.53,10.02-.02Z"/>
            <g className="ltc-logo-mark">
              <path className="ltc2-st5" d="M83.37,74.43c.2,3.38.64,6.6,1.31,9.66l42.33-.11c1.96,4.05-1.67,6.07-2.82,8.37-1.61,3.23-3.01,3.48-5.17,5.33-3.68,3.14-7.24,4.59-11.79,5.72-3.46.43-7.02.4-10.49-.11-2.52-.69-5.14-.47-7.67-2.29-5.11-3.66-4.49,7.23-11.05,13.09-4.27-3.25-6.44-8.02-7.23-13.65-8.92,2.33-17.41,4.1-25.54,1.6-8.53-2.63-15.8-9.3-17.38-17.87l44.13-.29c1.44-11.25-.37-22.15-6.09-31.45-.62-1.01-.59-1.77-.13-2.39.21-.28.65-1.02,1.21-.78l9.74,4.29c3.03,1.33,9.07-5.73,14.07-2.84-4.58,7.84-7.36,15.22-7.42,23.72Z"/>
              <path className="ltc2-st9" d="M84.67,84.09c-.72,0-1.38-.25-1.37-1.09l.07-8.57c.59-.32.98.42.98,1.49l.33,8.18Z"/>
              <path className="ltc2-st2" d="M107.23,103.4c-3.57.89-6.72.92-10.49-.11l10.49.11Z"/>
            </g>
            <circle cx="79.19" cy="79.5" r="70" className="ltc-logo-ring" />
            <circle cx="79.19" cy="79.5" r="70" className="ltc-light-sweep" />
          </g>
        </svg>
        <div className="glass" style={{width:"100%",padding:36,borderRadius:20,boxShadow:"0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(94,234,212,0.08) inset",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg, transparent, #5eead4, transparent)",opacity:0.6}} />
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:10}}>LTC Ministry</div>
            <h1 style={{margin:0,fontSize:28,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,letterSpacing:"-0.01em",color:"#e6f1f0"}}>{tt.loginRestricted}</h1>
            <p style={{margin:"10px 0 0",color:"#6b7a82",fontSize:13.5}}>{tt.loginDesc}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:8}}>{tt.loginEmail}</div>
              <input type="email" placeholder="email@lagoinha.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleEmailSignIn()} style={{height:46}} />
            </div>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:8}}>{tt.loginPassword}</div>
              <input type="password" placeholder="• • • • • • • •" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleEmailSignIn()} style={{height:46}} />
            </div>
            {error && <div style={{color:"#f87171",fontSize:13}}>{error}</div>}
            <button onClick={handleEmailSignIn} disabled={loading} className="btn-primary" style={{height:46,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:6}}>
              {loading ? tt.loginSigningIn : tt.loginSignIn}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0"}}>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}} />
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",color:"#475a64",letterSpacing:"0.1em"}}>{tt.loginOr}</span>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}} />
            </div>
            <button onClick={handleGoogleSignIn} disabled={loading}
              style={{height:46,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"#fff",border:"1px solid rgba(0,0,0,0.12)",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"#3c4043",fontFamily:"Inter,sans-serif",transition:"box-shadow 0.18s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.2)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-21.5 0-1.4-.1-2.7-.5-4.5z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16 2 9.1 7.4 6.3 14.7z"/>
                <path fill="#FBBC05" d="M24 46c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 37.6 26.9 38.5 24 38.5c-5.1 0-9.4-3.4-11-8l-6.9 5.3C9.4 42.3 16.1 46 24 46z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 2.2-2.2 4.1-4 5.5l6.5 5.3c3.8-3.5 6.2-8.7 6.2-15.3 0-1.4-.1-2.7-.5-4.5z"/>
              </svg>
              {tt.loginSignInGoogle}
            </button>
          </div>
          <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#475a64"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase",fontSize:"10.5px"}}>{tt.loginInternal}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase",fontSize:"10.5px",color:"#5eead4",opacity:0.7}}>{tt.loginConnected}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG CHART PRIMITIVES ─────────────────────────────────────────
function MiniSpark({ values, color="#5eead4", width=80, height=30 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const pts = values.map((v,i) => `${i*stepX},${height - ((v-min)/range)*(height-4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        style={{filter:`drop-shadow(0 0 3px ${color})`}} />
    </svg>
  );
}

function Donut({ data, size=180, strokeWidth=18, centerLabel, centerValue, gap=2 }) {
  const total = data.reduce((s,d)=>s+d.value,0)||1;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} fill="none"/>
        {data.map((d,i) => {
          const frac = d.value/total;
          const len = c*frac - gap;
          const da = `${Math.max(len,0)} ${c}`;
          const do_ = -offset;
          offset += c*frac;
          return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={d.color} strokeWidth={strokeWidth}
            strokeDasharray={da} strokeDashoffset={do_}
            strokeLinecap="butt"
            style={{filter:`drop-shadow(0 0 8px ${d.color}66)`}} />;
        })}
      </svg>
      <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",textAlign:"center"}}>
        <div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:size*0.22,color:"#e6f1f0",lineHeight:1}}>{centerValue}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82",marginTop:6}}>{centerLabel}</div>
        </div>
      </div>
    </div>
  );
}

function SegmentRing({ stages, size=260 }) {
  const center = size/2;
  const baseR = 28, gap = 13;
  return (
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size}>
        <defs>
          {stages.map((s,i) => (
            <linearGradient key={i} id={`seg-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.95"/>
              <stop offset="100%" stopColor={s.color} stopOpacity="0.45"/>
            </linearGradient>
          ))}
        </defs>
        {stages.map((s,i) => {
          const r = baseR + i*gap;
          const c = 2*Math.PI*r;
          const pct = s.total>0 ? s.count/s.total : 0;
          const dash = c*pct;
          return (
            <g key={i} transform={`rotate(-90 ${center} ${center})`}>
              <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={7}/>
              <circle cx={center} cy={center} r={r} fill="none"
                stroke={`url(#seg-${i})`} strokeWidth={7}
                strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
                style={{filter:`drop-shadow(0 0 6px ${s.color}66)`,transition:"stroke-dasharray 0.8s"}}/>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function AreaChart({ data, height=160, noDataMsg="No data yet" }) {
  if (!data || data.length < 2) return <div style={{color:"#475a64",fontSize:13,fontFamily:"'JetBrains Mono',monospace",padding:"20px 0"}}>{noDataMsg}</div>;
  const W=600, max=Math.max(...data.map(d=>d.count),1);
  const stepX = W/(data.length-1);
  const pts = data.map((d,i)=>[i*stepX, height-(d.count/max)*(height-30)-8]);
  const path = pts.map((p,i)=>`${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${W} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25,0.5,0.75].map((g,i)=>(
        <line key={i} x1={0} x2={W} y1={height*g} y2={height*g}
          stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4"/>
      ))}
      <path d={area} fill="url(#area-grad)"/>
      <path d={path} stroke="#5eead4" strokeWidth="2" fill="none"
        style={{filter:"drop-shadow(0 0 6px #5eead4)"}}/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#050a10" stroke="#5eead4" strokeWidth="2"/>
          <text x={p[0]} y={p[1]-10} textAnchor="middle" fontSize="11" fill="#5eead4"
            fontFamily="JetBrains Mono, monospace">{data[i].count}</text>
          <text x={p[0]} y={height-2} textAnchor="middle" fontSize="9" fill="#475a64"
            fontFamily="JetBrains Mono, monospace">{String(data[i].week||"").slice(-5)}</text>
        </g>
      ))}
    </svg>
  );
}

// Converts an ISO week string ("2026-W24" / "2026-24") or a date ("2026-06-08")
// into a readable "MMM D" label (e.g. "Jun 8"). Falls back to the raw string.
function formatWeekLabel(week) {
  var s = String(week == null ? "" : week);
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return MON[d.getUTCMonth()] + " " + d.getUTCDate();
  }
  m = s.match(/(\d{4})\D*W?(\d{1,2})$/i);
  if (m) {
    var year = +m[1], wk = +m[2];
    var simple = new Date(Date.UTC(year, 0, 1 + (wk - 1) * 7));
    var dow = simple.getUTCDay();
    var monday = new Date(simple);
    if (dow <= 4) monday.setUTCDate(simple.getUTCDate() - dow + 1);
    else monday.setUTCDate(simple.getUTCDate() + 8 - dow);
    return MON[monday.getUTCMonth()] + " " + monday.getUTCDate();
  }
  return s;
}

function RadialGauge({ value, max, color="#5eead4", size=84, thickness=6 }) {
  const r = (size-thickness)/2;
  const c = 2*Math.PI*r;
  const pct = Math.min(value/Math.max(max,1),1);
  const dash = c*pct;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={thickness}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 8px ${color}55)`,transition:"stroke-dasharray 0.6s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",textAlign:"center"}}>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:Math.round(size*0.26),color:"#e6f1f0",lineHeight:1}}>
          {value}<span style={{color:"#6b7a82",fontWeight:400,fontSize:Math.round(size*0.15)}}>/{max}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────
// ─── SERVICE ATTENDANCE TAB ───────────────────────────────────────
const ATTENDANCE_DATA = [
  { date:'2026-06-04', service:'Culto Fé', templo:106, volunteers:23, kids:12, total:118 },
  { date:'2026-06-03', service:'Culto Hope', templo:116, volunteers:26, kids:14, total:130 },
  { date:'2026-06-01', service:'Sunday 6:30PM', templo:103, volunteers:30, kids:11, total:114 },
  { date:'2026-06-01', service:'Sunday 10AM', templo:198, volunteers:46, kids:22, total:220 },
  { date:'2026-05-31', service:'English Service', templo:18, volunteers:16, kids:2, total:20 },
  { date:'2026-05-31', service:'Rocket', templo:63, volunteers:17, kids:null, total:63 },
  { date:'2026-05-30', service:'Legacy', templo:84, volunteers:21, kids:null, total:84 },
  { date:'2026-05-28', service:'Culto Fé', templo:109, volunteers:24, kids:14, total:123 },
  { date:'2026-05-27', service:'Culto Hope', templo:124, volunteers:27, kids:16, total:140 },
  { date:'2026-05-25', service:'Sunday 6:30PM', templo:108, volunteers:33, kids:12, total:120 },
  { date:'2026-05-25', service:'Sunday 10AM', templo:211, volunteers:47, kids:24, total:235 },
  { date:'2026-05-24', service:'English Service', templo:21, volunteers:16, kids:2, total:23 },
  { date:'2026-05-24', service:'Rocket', templo:58, volunteers:16, kids:null, total:58 },
  { date:'2026-05-23', service:'Legacy', templo:79, volunteers:20, kids:null, total:79 },
  { date:'2026-05-21', service:'Culto Fé', templo:102, volunteers:23, kids:10, total:112 },
  { date:'2026-05-18', service:'Sunday 10AM', templo:195, volunteers:44, kids:20, total:215 },
  { date:'2026-05-17', service:'English Service', templo:22, volunteers:17, kids:3, total:25 },
  { date:'2026-05-11', service:'Sunday 10AM', templo:203, volunteers:45, kids:21, total:224 },
  { date:'2026-05-10', service:'English Service', templo:18, volunteers:16, kids:2, total:20 },
  { date:'2026-05-04', service:'Sunday 10AM', templo:187, volunteers:42, kids:18, total:205 },
];

const ALL_SERVICES = ['Sunday 10AM','Sunday 6:30PM','Culto Hope','Culto Fé','Legacy','Rocket','English Service'];
const NO_KIDS_SERVICES = new Set(['Rocket','Legacy']);

const SERVICE_CHIP_COLORS = {
  'Sunday 10AM':   { bg:'rgba(94,234,212,0.08)',  border:'rgba(94,234,212,0.22)',  color:'#c5f5ec' },
  'Sunday 6:30PM': { bg:'rgba(96,165,250,0.08)',  border:'rgba(96,165,250,0.22)',  color:'#bcd5f8' },
  'Culto Hope':    { bg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.22)', color:'#d8cffd' },
  'Culto Fé':      { bg:'rgba(248,113,113,0.08)', border:'rgba(248,113,113,0.22)', color:'#fcb6b6' },
  'Legacy':        { bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.22)',  color:'#fbd590' },
  'Rocket':        { bg:'rgba(251,146,60,0.08)',  border:'rgba(251,146,60,0.22)',  color:'#fed5ae' },
  'English Service':{ bg:'rgba(52,211,153,0.08)', border:'rgba(52,211,153,0.22)', color:'#a7eccc' },
};

function ServiceChip({ service }) {
  const c = SERVICE_CHIP_COLORS[service] || { bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.1)', color:'#aebac0' };
  return (
    <span style={{display:'inline-block',padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:600,
      background:c.bg,border:`1px solid ${c.border}`,color:c.color,whiteSpace:'nowrap'}}>
      {service}
    </span>
  );
}

function volPctColor(pct) {
  if (pct >= 40) return '#5eead4';
  if (pct >= 25) return '#6b7a82';
  return '#f87171';
}

function ServiceAttendanceTab({ t, lang }) {
  const [selectedService, setSelectedService] = useState('Sunday 10AM');

  // Section 2 metrics
  const latestSunday10 = ATTENDANCE_DATA.find(d => d.service === 'Sunday 10AM');
  const latestEnglish  = ATTENDANCE_DATA.find(d => d.service === 'English Service');
  const cutoff = '2026-05-06'; // 30 days before 2026-06-05
  const last30 = ATTENDANCE_DATA.filter(d => d.date >= cutoff);
  const avgVol = last30.length ? Math.round(last30.reduce((s,d) => s + d.volunteers, 0) / last30.length) : 0;
  const kidsRows = last30.filter(d => d.kids !== null);
  const avgKids = kidsRows.length ? Math.round(kidsRows.reduce((s,d) => s + d.kids, 0) / kidsRows.length) : 0;

  const metrics = [
    { label: t.attSunday10, value: latestSunday10 ? latestSunday10.total : '—', accent: '#5eead4' },
    { label: t.attEnglish,  value: latestEnglish  ? latestEnglish.total  : '—', accent: '#34d399' },
    { label: t.attAvgVol,   value: avgVol,                                       accent: '#a78bfa' },
    { label: t.attAvgKids,  value: avgKids,                                      accent: '#f59e0b' },
  ];

  // Section 3 trend chart data
  const trendData = ATTENDANCE_DATA
    .filter(d => d.service === selectedService)
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(d => ({ date: d.date.slice(5), templo: d.templo, volunteers: d.volunteers, kids: d.kids }));
  const showKids = !NO_KIDS_SERVICES.has(selectedService);

  // Section 4 — avg total by service
  const avgByService = ALL_SERVICES.map(svc => {
    const rows = ATTENDANCE_DATA.filter(d => d.service === svc);
    const avg = rows.length ? Math.round(rows.reduce((s,d) => s + d.total, 0) / rows.length) : 0;
    return { service: svc, avg };
  }).sort((a,b) => b.avg - a.avg);

  // Section 4 — volunteer ratio by service
  const volRatioByService = ALL_SERVICES.map(svc => {
    const rows = ATTENDANCE_DATA.filter(d => d.service === svc);
    if (!rows.length) return { service: svc, ratio: 0 };
    const ratio = Math.round(rows.reduce((s,d) => s + (d.volunteers / (d.total||1)) * 100, 0) / rows.length);
    return { service: svc, ratio };
  }).sort((a,b) => b.ratio - a.ratio);

  // Section 5 log — most recent first
  const logRows = [...ATTENDANCE_DATA].sort((a,b) => b.date.localeCompare(a.date) || a.service.localeCompare(b.service));

  const monoSm = { fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase' };
  const sectionTitle = (label) => (
    <div style={{...monoSm, fontSize:12, fontWeight:700, color:'#e6f1f0', letterSpacing:'0.16em', marginBottom:16}}>
      {label}
    </div>
  );

  return (
    <div style={{padding:'32px 28px', display:'flex', flexDirection:'column', gap:20}}>

      {/* Section 1 — Header bar */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
        <h2 style={{fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#e6f1f0', margin:0, letterSpacing:'-0.01em'}}>
          {lang === 'PT' ? 'Presença' : 'Attendance'}
        </h2>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <a href="https://farfromtimnah-hue.github.io/ministry-gifting/service-attendance-form.html"
            target="_blank" rel="noreferrer"
            style={{padding:'8px 16px', borderRadius:8, background:'rgba(94,234,212,0.1)', border:'1px solid rgba(94,234,212,0.25)',
              color:'#5eead4', fontSize:12, fontFamily:"'JetBrains Mono',monospace", fontWeight:600,
              letterSpacing:'0.12em', textDecoration:'none', textTransform:'uppercase', whiteSpace:'nowrap'}}>
            {t.attOpenForm} ↗
          </a>
          <div style={{width:64, height:64, border:'1px solid rgba(255,255,255,0.12)', borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:2,
            background:'rgba(255,255,255,0.02)'}}>
            <span style={{fontSize:9, color:'#475a64', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.1em'}}>{t.attQrLabel}</span>
          </div>
        </div>
      </div>

      {/* Section 2 — Metric cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16}}>
        {metrics.map(({label, value, accent}) => (
          <div key={label} className="glass" style={{padding:24, position:'relative', overflow:'hidden', borderRadius:12}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,
              background:`linear-gradient(90deg, ${accent}, transparent 60%)`,
              boxShadow:`0 0 12px ${accent}66`}} />
            <div style={{fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:44,
              color:accent, lineHeight:1, letterSpacing:'-0.02em', textShadow:`0 0 24px ${accent}33`}}>
              {value}
            </div>
            <div style={{...monoSm, color:'#6b7a82', marginTop:10}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Section 3 — Trend chart */}
      <div className="glass" style={{padding:28, borderRadius:12}}>
        {sectionTitle(t.attTrend)}
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)}
            style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
              color:'#e6f1f0', borderRadius:8, padding:'7px 12px', fontSize:12,
              fontFamily:"'JetBrains Mono',monospace", outline:'none', cursor:'pointer'}}>
            {ALL_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{display:'flex', gap:16}}>
            {[['#534AB7', lang==='PT'?'Templo':'Sanctuary'], ['#1D9E75', lang==='PT'?'Voluntários':'Volunteers'], ...(showKids?[['#D85A30','Kids']]:[])].map(([c,l])=>(
              <span key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#6b7a82',fontFamily:"'JetBrains Mono',monospace"}}>
                <span style={{width:16,height:2,borderRadius:1,background:c,display:'inline-block'}} />{l}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{top:4,right:8,bottom:4,left:0}}>
            <XAxis dataKey="date" tick={{fill:'#475a64',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill:'#475a64',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={{background:'#0c1a24',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}} labelStyle={{color:'#aebac0'}} itemStyle={{color:'#e6f1f0'}} />
            <Line type="monotone" dataKey="templo" stroke="#534AB7" strokeWidth={2} dot={{r:3,fill:'#534AB7'}} activeDot={{r:5}} name={lang==='PT'?'Templo':'Sanctuary'} />
            <Line type="monotone" dataKey="volunteers" stroke="#1D9E75" strokeWidth={2} dot={{r:3,fill:'#1D9E75'}} activeDot={{r:5}} name={lang==='PT'?'Voluntários':'Volunteers'} />
            {showKids && <Line type="monotone" dataKey="kids" stroke="#D85A30" strokeWidth={2} dot={{r:3,fill:'#D85A30'}} activeDot={{r:5}} name="Kids" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Section 4 — Two side-by-side bar charts */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        {/* Left: avg total by service */}
        <div className="glass" style={{padding:28, borderRadius:12}}>
          {sectionTitle(t.attByService)}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={avgByService} layout="vertical" margin={{top:0,right:16,bottom:0,left:0}}>
              <XAxis type="number" tick={{fill:'#475a64',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="service" width={110} tick={{fill:'#aebac0',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'#0c1a24',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}} labelStyle={{color:'#aebac0'}} itemStyle={{color:'#e6f1f0'}} />
              <Bar dataKey="avg" name={lang==='PT'?'Média':'Avg'} radius={[0,4,4,0]}>
                {avgByService.map((entry) => {
                  const c = SERVICE_CHIP_COLORS[entry.service];
                  return <Cell key={entry.service} fill={c ? c.color.replace(')',',0.7)').replace('rgb','rgba') : '#5eead4'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: volunteer ratio by service */}
        <div className="glass" style={{padding:28, borderRadius:12}}>
          {sectionTitle(t.attVolRatio)}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volRatioByService} layout="vertical" margin={{top:0,right:16,bottom:0,left:0}}>
              <XAxis type="number" unit="%" tick={{fill:'#475a64',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="service" width={110} tick={{fill:'#aebac0',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'#0c1a24',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}} labelStyle={{color:'#aebac0'}} itemStyle={{color:'#e6f1f0'}} formatter={(v)=>`${v}%`} />
              <Bar dataKey="ratio" name="Vol%" radius={[0,4,4,0]}>
                {volRatioByService.map((entry) => (
                  <Cell key={entry.service} fill={volPctColor(entry.ratio)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 5 — Full log table */}
      <div className="glass" style={{padding:28, borderRadius:12}}>
        {sectionTitle(t.attLog)}
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                {[t.attDate, t.attService, t.attTemplo, t.attVol, t.attKids, t.attTotal, t.attVolPct].map(h => (
                  <th key={h} style={{...monoSm, color:'#475a64', padding:'6px 12px', textAlign:'left', fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logRows.map((row, i) => {
                const pct = row.total > 0 ? Math.round((row.volunteers / row.total) * 100) : 0;
                return (
                  <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                    <td style={{padding:'8px 12px', color:'#6b7a82', fontFamily:"'JetBrains Mono',monospace", fontSize:12}}>{row.date}</td>
                    <td style={{padding:'8px 12px'}}><ServiceChip service={row.service} /></td>
                    <td style={{padding:'8px 12px', color:'#aebac0'}}>{row.templo}</td>
                    <td style={{padding:'8px 12px', color:'#aebac0'}}>{row.volunteers}</td>
                    <td style={{padding:'8px 12px', color:'#aebac0'}}>{row.kids !== null ? row.kids : '—'}</td>
                    <td style={{padding:'8px 12px', fontWeight:600, color:'#e6f1f0'}}>{row.total}</td>
                    <td style={{padding:'8px 12px', fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:600, color:volPctColor(pct)}}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function AnalyticsTab({ token, t, lang }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/analytics?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <div style={{padding:40,color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>{t ? t.loading : "Loading..."}</div>;

  const stageFunnel = STAGES.map(s => {
    const found = data.byStage.find(x => x.stage === s);
    return { stage: s, count: found ? found.count : 0 };
  });
  const maxGifting = Math.max(...(data.byGifting || []).map(x => x.count), 1);
  const ptCount = data.byLanguage.find(x => x.language === "PT")?.count || 0;
  const enCount = data.byLanguage.find(x => x.language === "EN")?.count || 0;
  const total = data.total || 1;
  const placedCount = stageFunnel.find(x => x.stage === "Placed in Ministry")?.count || 0;
  const newCount = stageFunnel.find(x => x.stage === "New")?.count || 0;
  const inProgressCount = stageFunnel.filter(x => !["New","Placed in Ministry"].includes(x.stage)).reduce((a,b) => a+b.count, 0);
  const conversionPct = total > 0 ? Math.round((placedCount/total)*100) : 0;

  // Donut colors aligned with STAGE_COLORS palette
  const donutColors = ["#5eead4","#60a5fa","#a78bfa","#f59e0b","#f472b6","#34d399","#fb923c","#e879f9"];

  // Weekly sparkline from byWeek data (last 8 points)
  const sparkWeekly = (data.byWeek||[]).slice(-8).map(x=>x.count);

  return (
    <div style={{padding:"32px 28px",display:"flex",flexDirection:"column",gap:20}}>

      {/* ── KPI row ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[
          {label:t.totalSub,        value:data.total,       accent:"#5eead4", spark:sparkWeekly},
          {label:t.placedMin,       value:placedCount,      accent:"#34d399", spark:[0,0,1,1,0,1,placedCount]},
          {label:t.awaitContact,    value:newCount,         accent:"#f87171", spark:[2,3,2,4,3,newCount]},
          {label:t.inProgress,      value:inProgressCount,  accent:"#f59e0b", spark:[4,3,3,inProgressCount]},
        ].map(({label,value,accent,spark})=>(
          <div key={label} className="glass" style={{padding:24,position:"relative",overflow:"hidden",borderRadius:12}}>
            {/* Left-top gradient line */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,
              background:`linear-gradient(90deg, ${accent}, transparent 60%)`,
              boxShadow:`0 0 12px ${accent}66`}}/>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:52,
                  color:accent,lineHeight:1,letterSpacing:"-0.02em",
                  textShadow:`0 0 24px ${accent}33`}}>
                  {value}
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",
                  letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginTop:10}}>
                  {label}
                </div>
              </div>
              {spark.length >= 2 && (
                <div style={{opacity:0.65,paddingTop:4}}>
                  <MiniSpark values={spark} color={accent} width={72} height={28}/>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Connection Funnel ── */}
      <div className="glass" style={{padding:28,borderRadius:12}}>
        <div style={{marginBottom:22}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,
            letterSpacing:"0.12em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:4}}>
            {t.pipeline}
          </div>
          <p style={{margin:0,fontSize:12,color:"#6b7a82"}}>
            {t.funnelDesc}
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center"}}>
          {/* Left: numbered stage rows */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {stageFunnel.map(({stage,count},i) => {
              const color = STAGE_COLORS[stage]||"#5eead4";
              const pct = total>0 ? (count/total)*100 : 0;
              return (
                <div key={stage} style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:24,height:24,borderRadius:6,flexShrink:0,
                    background:`linear-gradient(135deg,${color}44,${color}22)`,
                    border:`1px solid ${color}55`,display:"grid",placeItems:"center",
                    fontSize:10,fontWeight:700,color,fontFamily:"'JetBrains Mono',monospace"}}>
                    {i+1}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:12.5,color:"#aebac0"}}>{(STAGE_LABEL[lang||"PT"]||STAGE_LABEL.PT)[stage]||stage}</span>
                      <span style={{fontSize:13,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color}}>
                        {count}
                        <span style={{color:"#475a64",fontWeight:400,fontSize:11,marginLeft:5}}>/ {total}</span>
                      </span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.max(pct,1)}%`,
                        background:`linear-gradient(90deg,${color}aa,${color})`,
                        borderRadius:999,boxShadow:`0 0 10px ${color}55`,
                        transition:"width 0.8s cubic-bezier(0.16,1,0.3,1)"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: concentric ring + conversion rate */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",position:"relative"}}>
            <SegmentRing
              size={260}
              stages={stageFunnel.map(({stage,count}) => ({
                color: STAGE_COLORS[stage]||"#5eead4",
                count,
                total
              }))}
            />
            <div style={{position:"absolute",top:"50%",left:"50%",
              transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",
                letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:4}}>
                {t.conversion}
              </div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,
                fontSize:38,color:"#5eead4",lineHeight:1}}>
                {conversionPct}%
              </div>
              <div style={{fontSize:11,color:"#6b7a82",marginTop:4}}>
                {placedCount} / {total}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-col: Giftings donut + Languages ── */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:20}}>

        {/* Donut + legend */}
        <div className="glass" style={{padding:28,borderRadius:12}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,
            letterSpacing:"0.12em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:4}}>
            {t.topGiftings}
          </div>
          <p style={{margin:"0 0 22px",fontSize:12,color:"#6b7a82"}}>
            {t.donutDesc}
          </p>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:28,alignItems:"center"}}>
            <Donut
              size={180} strokeWidth={18}
              centerValue={String(data.total||0)}
              centerLabel={t.mapped}
              data={(data.byGifting||[]).slice(0,6).map((g,i)=>({
                value:g.count,
                color:donutColors[i]||"#5eead4"
              }))}
            />
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(data.byGifting||[]).slice(0,6).map(({gifting,count},i)=>(
                <div key={gifting} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,
                    background:donutColors[i]||"#5eead4",
                    boxShadow:`0 0 8px ${donutColors[i]||"#5eead4"}`}}/>
                  <span style={{fontSize:16,flexShrink:0}}>{GIFTING_ICONS[gifting]||"◆"}</span>
                  <span style={{flex:1,fontSize:12.5,color:"#aebac0",lineHeight:1.3}}>{lang==="PT" ? GIFTING_PT[gifting]||gifting : gifting}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e6f1f0",fontWeight:600}}>{count}</span>
                </div>
              ))}
              {(data.byGifting||[]).length > 6 && (
                <div style={{fontSize:11,color:"#475a64",fontFamily:"'JetBrains Mono',monospace",paddingTop:4,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                  +{(data.byGifting||[]).length - 6} {t.moreGiftings}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="glass" style={{padding:28,borderRadius:12}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,
            letterSpacing:"0.12em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:22}}>
            {t.langSplit}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            {[
              {label:"Português",flag:"🇧🇷",count:ptCount,color:"#5eead4",grad:"linear-gradient(90deg,#5eead4,#2dd4bf)"},
              {label:"English",  flag:"🇺🇸",count:enCount,color:"#4cb6c8",grad:"linear-gradient(90deg,#4cb6c8,#60a5fa)"},
            ].map(({label,flag,count,color,grad})=>(
              <div key={label}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20}}>{flag}</span>
                    <span style={{fontSize:14,color:"#e6f1f0",fontWeight:500}}>{label}</span>
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e6f1f0"}}>
                    {count} <span style={{color:"#6b7a82"}}>({Math.round((count/total)*100)}%)</span>
                  </span>
                </div>
                <div style={{height:8,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(count/total)*100}%`,
                    background:grad,
                    boxShadow:`0 0 12px ${color}66`,
                    borderRadius:999,transition:"width 0.8s"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Weekly responses area chart ── */}
      <div className="glass" style={{padding:28,borderRadius:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,
              letterSpacing:"0.12em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:4}}>
              {t.weeklySub}
            </div>
            <p style={{margin:0,fontSize:12,color:"#6b7a82"}}>
              {t.weeklyDesc}
            </p>
          </div>
        </div>
        {(function(){
          var weekData = (data.byWeek||[]).slice(-10).map(function(d){
            return { label: formatWeekLabel(d && d.week), count: (d && d.count) || 0 };
          });
          if (!weekData.length) return (
            <div style={{color:"#475a64",fontSize:13,fontFamily:"'JetBrains Mono',monospace",padding:"20px 0"}}>{t.noData}</div>
          );
          return (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekData} margin={{top:24,right:8,bottom:4,left:0}}>
                <XAxis dataKey="label" interval={0} tick={{fill:'#475a64',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fill:'#475a64',fontSize:10,fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} width={28} />
                <Tooltip cursor={{fill:'rgba(94,234,212,0.06)'}} contentStyle={{background:'#0c1a24',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace"}} labelStyle={{color:'#aebac0'}} itemStyle={{color:'#e6f1f0'}} />
                <Bar dataKey="count" name={lang==='PT'?'Respostas':'Responses'} fill="#5eead4" radius={[4,4,0,0]} maxBarSize={48}
                  label={{position:'top',fill:'#5eead4',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}} />
              </BarChart>
            </ResponsiveContainer>
          );
        })()}
      </div>

      {/* ── DISC Profile Distribution ── */}
      <div className="glass" style={{padding:28,borderRadius:12}}>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,
          letterSpacing:"0.12em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:22}}>
          {t.discDist}
        </div>
        {(data.byDisc||[]).length === 0 ? (
          <div style={{fontSize:13,color:"#475a64",fontFamily:"'JetBrains Mono',monospace"}}>{t.noDistData}</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {["D","I","S","C"].map(function(letter){
              const found=(data.byDisc||[]).find(function(x){return x.disc_primary===letter;});
              const count=found?found.count:0;
              const pct=total>0?(count/total)*100:0;
              const color=DISC_COLORS[letter]||"#5eead4";
              const name=(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[letter];
              return (
                <div key={letter}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:color,boxShadow:"0 0 6px "+color}}/>
                      <span style={{fontSize:12.5,color:"#aebac0"}}>{name}</span>
                    </div>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e6f1f0",fontWeight:600}}>
                      {count} <span style={{fontWeight:400,fontSize:11,color:"#6b7a82"}}>({Math.round(pct)}%)</span>
                    </span>
                  </div>
                  <div style={{height:6,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:(count>0?Math.max(pct,2):0)+"%",
                      background:"linear-gradient(90deg,"+color+"aa,"+color+")",
                      borderRadius:999,boxShadow:"0 0 8px "+color+"55",
                      transition:"width 0.8s cubic-bezier(0.16,1,0.3,1)"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p style={{margin:"16px 0 0",fontSize:11,color:"#475a64",lineHeight:1.6,fontStyle:"italic"}}>{t.discCulturalNote}</p>
      </div>

      {/* ── Leadership + Emotional + Natural Strength Distribution ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
        {/* Leadership Tendencies */}
        <div className="glass" style={{padding:28,borderRadius:12}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,
            letterSpacing:"0.10em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:20}}>
            {t.byLeadership}
          </div>
          {(data.byLeadership||[]).length === 0 ? (
            <div style={{fontSize:13,color:"#475a64",fontFamily:"'JetBrains Mono',monospace"}}>{t.noDistData}</div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:24,alignItems:"center"}}>
              <Donut
                size={180} strokeWidth={18}
                centerValue={String((data.byLeadership||[]).reduce((s,r)=>s+r.count,0))}
                centerLabel={t.mapped}
                data={(data.byLeadership||[]).map((row,i)=>({value:row.count,color:donutColors[i]||"#5eead4"}))}
              />
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {(data.byLeadership||[]).map(function(row,i){
                  const color=donutColors[i]||"#5eead4";
                  const ldEntry2=row.leadership_tendency?LEADERSHIP_MAP[row.leadership_tendency]:null;
                  const label=ldEntry2?(lang==="PT"?ldEntry2.PT:ldEntry2.EN):(row.leadership_tendency||"Outro");
                  return (
                    <div key={row.leadership_tendency||i} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:color,boxShadow:"0 0 8px "+color}}/>
                      <span style={{flex:1,fontSize:12,color:"#aebac0",lineHeight:1.3}}>{label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e6f1f0",fontWeight:600}}>{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Emotional Profiles */}
        <div className="glass" style={{padding:28,borderRadius:12}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,
            letterSpacing:"0.10em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:20}}>
            {t.byEmotional}
          </div>
          {(data.byEmotional||[]).length === 0 ? (
            <div style={{fontSize:13,color:"#475a64",fontFamily:"'JetBrains Mono',monospace"}}>{t.noDistData}</div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:24,alignItems:"center"}}>
              <Donut
                size={180} strokeWidth={18}
                centerValue={String((data.byEmotional||[]).reduce((s,r)=>s+r.count,0))}
                centerLabel={t.mapped}
                data={(data.byEmotional||[]).map((row,i)=>({value:row.count,color:donutColors[i]||"#5eead4"}))}
              />
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {(data.byEmotional||[]).map(function(row,i){
                  const color=donutColors[i]||"#5eead4";
                  const emEntry2=row.emotional_profile?EMOTIONAL_MAP[row.emotional_profile]:null;
                  const label=emEntry2?(lang==="PT"?emEntry2.PT:emEntry2.EN):(row.emotional_profile||"Outro");
                  return (
                    <div key={row.emotional_profile||i} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:color,boxShadow:"0 0 8px "+color}}/>
                      <span style={{flex:1,fontSize:12,color:"#aebac0",lineHeight:1.3}}>{label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e6f1f0",fontWeight:600}}>{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Natural Strengths */}
        <div className="glass" style={{padding:28,borderRadius:12}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,
            letterSpacing:"0.10em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:20}}>
            {t.byNatural}
          </div>
          {(data.byNatural||[]).length === 0 ? (
            <div style={{fontSize:13,color:"#475a64",fontFamily:"'JetBrains Mono',monospace"}}>{t.noDistData}</div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:24,alignItems:"center"}}>
              <Donut
                size={180} strokeWidth={18}
                centerValue={String((data.byNatural||[]).reduce((s,r)=>s+r.count,0))}
                centerLabel={t.mapped}
                data={(data.byNatural||[]).map((row,i)=>({value:row.count,color:donutColors[i]||"#5eead4"}))}
              />
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {(data.byNatural||[]).map(function(row,i){
                  const color=donutColors[i]||"#5eead4";
                  const nsEntry2=row.natural_strength?NATURAL_STRENGTH_MAP[row.natural_strength]:null;
                  const label=nsEntry2?(lang==="PT"?nsEntry2.PT:nsEntry2.EN):(row.natural_strength||"Outro");
                  return (
                    <div key={row.natural_strength||i} style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:color,boxShadow:"0 0 8px "+color}}/>
                      <span style={{flex:1,fontSize:12,color:"#aebac0",lineHeight:1.3}}>{label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e6f1f0",fontWeight:600}}>{row.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── PERSON CARD ──────────────────────────────────────────────────
function PersonCard({ person, onClick, templatePT, templateEN, t, lang }) {
  const [showPastoralTip, setShowPastoralTip] = useState(false);
  const ministries = parseJSON(person.current_ministries);
  const groups = parseJSON(person.special_groups);
  const langs = parseJSON(person.languages_spoken);
  const badge = ministryBadge(person.ministry_count || 0);
  const stageColor = STAGE_COLORS[person.stage] || "#6b7a82";
  const carisma = parseCarisma(person.carisma_completed);
  // PersonCard: use template (skipTemplate = false)
  const waURL = buildWhatsAppURL(person, templatePT, templateEN, false);
  const isPastor = person.is_pastor == 1;
  const isLeader = person.is_ministry_leader == 1 && !isPastor;
  const topBorderColor = isPastor ? "#F0E6D3" : isLeader ? "#5B9BD5" : "#2ABFBF";

  return (
    <div onClick={onClick} className="glass glow-hover" style={{borderRadius:12,padding:"16px 20px",cursor:"pointer",transition:"all 0.2s ease",borderLeft:"3px solid " + stageColor,borderTop:"2px solid " + topBorderColor,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",position:"relative"}}>
      {/* ── Header row ── */}
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
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:"#e6f1f0"}}>{person.preferred_name || person.name}</span>
              {(person.pastoral_flag==1 || person.pastoral_flag==2) && (
                <div style={{position:"relative",display:"inline-block"}}
                  onMouseEnter={()=>setShowPastoralTip(true)}
                  onMouseLeave={()=>setShowPastoralTip(false)}>
                  <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,
                    background:person.pastoral_flag==2?"rgba(42,191,191,0.12)":"rgba(245,158,11,0.12)",
                    border:person.pastoral_flag==2?"1px solid rgba(42,191,191,0.3)":"1px solid rgba(245,158,11,0.3)",
                    color:person.pastoral_flag==2?"#2ABFBF":"#fbd590",fontWeight:700,cursor:"default"}}>★</span>
                  {showPastoralTip && (
                    <div style={{position:"absolute",bottom:"125%",left:"50%",transform:"translateX(-50%)",background:"#1a2a2a",color:"#e6f1f0",fontSize:12,lineHeight:1.5,padding:"8px 12px",borderRadius:6,border:"1px solid #2ABFBF",zIndex:999,width:220,pointerEvents:"none",whiteSpace:"normal"}}>
                      {person.pastoral_flag==2
                        ? (lang==="PT"
                          ? "Marcado Pastoral" + (person.pastor_confirmed_by ? " — por " + person.pastor_confirmed_by : "")
                          : "Marked for Pastoral" + (person.pastor_confirmed_by ? " — by " + person.pastor_confirmed_by : ""))
                        : (lang==="PT" ? "Potencial Pastoral" : "Pastoral Potential")}
                    </div>
                  )}
                </div>
              )}
              <CarismaBadge levels={carisma} lang={lang} />
            </div>
            {person.full_name && person.preferred_name &&
              person.preferred_name.trim() !== person.full_name.trim() && (
              <div style={{marginTop:2}}>
                <span style={{color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{lang==="PT" ? "Nome completo: " : "Full name: "}</span>
                <span style={{color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{person.full_name}</span>
              </div>
            )}
            <div style={{fontSize:11.5,color:"#6b7a82",marginTop:2}}>{person.whatsapp || person.email || t.noContact}</div>
            <div style={{fontSize:11,color:"#475a64",marginTop:2}}>
              {renderLangFlags(person, lang)}
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={{fontSize:11,padding:"3px 9px",background:stageColor+"1a",color:stageColor,borderRadius:999,fontWeight:600,whiteSpace:"nowrap",border:"1px solid " + stageColor + "33"}}>{(STAGE_LABEL[lang||"PT"]||STAGE_LABEL.PT)[person.stage||"New"]||person.stage||"New"}</span>
          {(isPastor || isLeader) && (
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:999,fontWeight:600,whiteSpace:"nowrap",
              background:isPastor?"#F0E6D3":"#5B9BD5",
              color:isPastor?"#3a2e1e":"#fff"}}>
              {isPastor ? "Pastor/Pastora" : (lang==="PT" ? "Lider" : "Leader")}
            </span>
          )}
        </div>
      </div>

      {/* ── Footer: assigned pastor + WA ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
        <div>
          {person.assigned_pastor && (
            <div style={{fontSize:11,color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace"}}>
              {lang==="PT" ? "Atribuido a: " : "Assigned to: "}{person.assigned_pastor}
            </div>
          )}
        </div>
        {waURL && (
          <button
            onClick={function(e){ e.stopPropagation(); window.open(waURL, "_blank"); }}
            style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"5px 11px",
              background:"linear-gradient(180deg,rgba(34,197,94,0.18),rgba(34,197,94,0.08))",
              color:"#86efac",borderRadius:8,border:"1px solid rgba(34,197,94,0.3)",
              cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontWeight:500}}>
            {"💬 "}{t.whatsappMsg}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PLACED CARD (Victory View) ───────────────────────────────────
function PlacedCard({ person, onClick, templatePT, templateEN, t, lang }) {
  const ministries = parseJSON(person.current_ministries);
  const carisma = parseCarisma(person.carisma_completed);
  // FIX: PlacedCard opens empty chat — no template pre-fill (skipTemplate = true)
  const waURL = buildWhatsAppURL(person, templatePT, templateEN, true);
  const isPastor = person.is_pastor == 1;
  const isLeader = person.is_ministry_leader == 1 && !isPastor;
  const topBorderColor = isPastor ? "#F0E6D3" : isLeader ? "#5B9BD5" : "rgba(94,234,212,0.5)";

  return (
    <div onClick={onClick} className="glass glow-hover" style={{borderRadius:12,padding:"18px 20px",cursor:"pointer",borderTop:"2px solid " + topBorderColor,transition:"all 0.2s ease",position:"relative",boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>

      {/* Check mark or role badge */}
      {(isPastor || isLeader) ? (
        <div style={{position:"absolute",top:8,right:8,fontSize:10,padding:"2px 7px",borderRadius:999,fontWeight:600,
          background:isPastor?"#F0E6D3":"#5B9BD5",color:isPastor?"#3a2e1e":"#fff"}}>
          {isPastor ? "Pastor/Pastora" : (lang==="PT" ? "Lider" : "Leader")}
        </div>
      ) : (
        <div style={{position:"absolute",top:12,right:12,width:22,height:22,borderRadius:"50%",background:"rgba(94,234,212,0.12)",border:"1px solid rgba(94,234,212,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#5eead4",fontWeight:700}}>✓</div>
      )}

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
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:"#e6f1f0"}}>{person.preferred_name || person.name}</span>
            <CarismaBadge levels={carisma} lang={lang} />
          </div>
          <div style={{fontSize:11.5,color:"#6b7a82",marginTop:2}}>{person.whatsapp || person.email || ""}</div>
          <div style={{fontSize:11,color:"#475a64",marginTop:2}}>
            {renderLangFlags(person, lang)}
          </div>
          {person.assigned_pastor && (
            <div style={{fontSize:11,color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>
              {lang==="PT" ? "Atribuido a: " : "Assigned to: "}{person.assigned_pastor}
            </div>
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

// ─── GC NAME EDITOR ───────────────────────────────────────────────
function GcNameEditor({ person, updateConnection, saving, lang }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(person.gc_name || "");
  useEffect(() => { setVal(person.gc_name || ""); }, [person.gc_name]);
  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} disabled={saving}
        style={{marginTop:8,background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#6b7a82",cursor:"pointer"}}>
        {person.gc_name ? (lang==="PT"?"Editar nome do GC":"Edit GC name") : (lang==="PT"?"Adicionar nome do GC":"Add GC name")}
      </button>
    );
  }
  return (
    <div style={{marginTop:10,display:"flex",gap:6,alignItems:"center"}}>
      <input value={val} onChange={e=>setVal(e.target.value)}
        placeholder={lang==="PT"?"Nome do GC":"GC name"}
        style={{flex:1,padding:"6px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(94,234,212,0.3)",borderRadius:6,color:"#e6f1f0",fontSize:12,fontFamily:"'Space Grotesk',sans-serif",outline:"none"}} />
      <button onClick={()=>{updateConnection({gc_name:val.trim()||null});setEditing(false);}} disabled={saving}
        style={{padding:"6px 12px",background:"rgba(42,191,191,0.18)",border:"1px solid rgba(42,191,191,0.35)",borderRadius:6,color:"#2ABFBF",fontSize:12,cursor:"pointer"}}>
        {lang==="PT"?"Salvar":"Save"}
      </button>
      <button onClick={()=>setEditing(false)}
        style={{padding:"6px 10px",background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#6b7a82",fontSize:12,cursor:"pointer"}}>
        {lang==="PT"?"Cancelar":"Cancel"}
      </button>
    </div>
  );
}

// ─── PERSON DETAIL PANEL ──────────────────────────────────────────
function PersonPanel({ personId, token, role, onClose, onUpdated, t, lang, templatePT, templateEN, onNavigate, fbUser }) {
  const [person, setPerson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [newMinistry, setNewMinistry] = useState("");
  const [showMinistryInput, setShowMinistryInput] = useState(false);
  const [labelPopup, setLabelPopup] = useState(null); // {type, value} or null
  const [showAllGiftings, setShowAllGiftings] = useState(false);
  const [ministryPopup, setMinistryPopup] = useState(null); // {ministry, reasons} or null
  const [pastoralUI, setPastoralUI] = useState(false); // show pastor name selector
  const [pastoralAction, setPastoralAction] = useState(null); // "confirm" | "flag" | null
  const [pastoralPastorName, setPastoralPastorName] = useState("");
  const [pastoralCustomName, setPastoralCustomName] = useState("");
  const [editGroupRoles, setEditGroupRoles] = useState({}); // {groupName: [role,...]}
  const [groupRolesDirty, setGroupRolesDirty] = useState(false);
  const [pastoralInfoPopup, setPastoralInfoPopup] = useState(false);
  const [assignedPastorOpen, setAssignedPastorOpen] = useState(false);
  const [groupsRolesOpen, setGroupsRolesOpen] = useState(false);
  const [nameEditMode, setNameEditMode] = useState(false);
  const [nameEditFull, setNameEditFull] = useState("");
  const [nameEditPreferred, setNameEditPreferred] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [stageAdvanceMsg, setStageAdvanceMsg] = useState(false); // teal "moved to Not Yet Serving" confirmation

  const load = useCallback(() => {
    fetch(`${API}/person/${personId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPerson).catch(() => {});
  }, [personId, token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!person || !person.group_roles) return;
    const map = {};
    person.group_roles.forEach(function(r){ if(!map[r.group_name]) map[r.group_name]=[]; map[r.group_name].push(r.role); });
    setEditGroupRoles(map);
    setGroupRolesDirty(false);
    // Init collapsible states on first load
    setAssignedPastorOpen(!person.assigned_pastor);
    const hasGroups = (parseJSON(person.group_attendance)||[]).length > 0 || (person.group_roles||[]).length > 0;
    setGroupsRolesOpen(!hasGroups);
    setNameEditFull(person.name || "");
    setNameEditPreferred(person.preferred_name || "");
  }, [person]);

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

  async function saveName() {
    if (!nameEditFull.trim()) return;
    setNameSaving(true);
    await fetch(`${API}/person/${personId}/name`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: nameEditFull.trim(), preferred_name: nameEditPreferred.trim() || null })
    });
    setNameEditMode(false); setNameSaving(false); load(); onUpdated();
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setSaving(true);
    var autoName = (fbUser && fbUser.displayName) ? fbUser.displayName : (fbUser && fbUser.email) ? fbUser.email : "Pastor";
    await fetch(`${API}/person/${personId}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pastor_name: autoName, note_text: noteText, stage_at_time: person.stage })
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

  function toggleCarisma(value) {
    // Remove all equivalent legacy values for this slot, then toggle canonical value
    var equivalents = { "1st Year":["1st Year","1 Ano"], "Masters":["Masters","Level 5"] };
    var toRemove = equivalents[value] || [value];
    var current = parseJSON(person.carisma_completed);
    var hadAny = toRemove.some(function(v){ return current.includes(v); });
    var cleaned = current.filter(function(x){ return !toRemove.includes(x); });
    var next = hadAny ? cleaned : [...cleaned, value];
    updateConnection({ carisma_completed: next });
  }

  function addMinistry(m) {
    if (!m || ministries.includes(m)) return;
    updateConnection({ current_ministries: [...ministries, m] });
    setNewMinistry(""); setShowMinistryInput(false);
  }

  // Completed discipleship stages (checkbox section). NULL-GUARDED: completed_stages may
  // be null/undefined/string — always coerce to an array before any operation.
  function toggleCompletedStage(stageName) {
    try {
      var raw = person.completed_stages;
      var arr = Array.isArray(raw) ? raw.slice() : JSON.parse(raw || "[]");
      if (!Array.isArray(arr)) arr = [];
      var idx = arr.indexOf(stageName);
      if (idx > -1) arr.splice(idx, 1);
      else arr.push(stageName);
      var patch = { completed_stages: JSON.stringify(arr) };
      // Auto-advance: when all 4 core stages are complete, move to Not Yet Serving —
      // but never move someone already at/past that stage backwards.
      var core = ["New Believer", "Start Class", "Baptism", "New Members Cafe"];
      var allDone = core.every(function(s){ return arr.indexOf(s) > -1; });
      var cur = person.discipleship_stage || "Active";
      if (allDone && cur !== "Active" && cur !== "Placed" && cur !== "Not Yet Serving") {
        patch.discipleship_stage = "Not Yet Serving";
        patch.not_yet_serving_date = new Date().toISOString();
        setStageAdvanceMsg(true);
        setTimeout(function(){ setStageAdvanceMsg(false); }, 3000);
      }
      updateConnection(patch);
    } catch(e) { /* graceful fallback — leave checkboxes untouched on parse failure */ }
  }

  function removeMinistry(m) {
    updateConnection({ current_ministries: ministries.filter(x=>x!==m) });
  }

  const sortedScores = Object.entries(scores).map(([k,v])=>[SHORT_TO_FULL[k]||k,Math.min(Number(v),100)]).sort((a,b)=>b[1]-a[1]);

  // Canonical Carisma options. Legacy stored values: "1 Ano" maps to "1st Year", "Level 5" maps to "Masters"
  const CARISMA_OPTIONS = [
    { value:"Masters",  displayPT:"Masters",   displayEN:"Masters" },
    { value:"1st Year", displayPT:"1o Ano",    displayEN:"1st Year" }
  ];
  function carismaOptionActive(val) {
    if (val === "1st Year") return carisma.includes("1st Year") || carisma.includes("1 Ano");
    if (val === "Masters")  return carisma.includes("Masters")  || carisma.includes("Level 5");
    return carisma.includes(val);
  }

  // Behavioral Profile pre-calculations (moved out of IIFE for reliable React rendering)
  var nsDisplay = person.natural_strength ? (NATURAL_STRENGTH_MAP[person.natural_strength] || null) : null;
  var ldDisplay = person.leadership_tendency ? (LEADERSHIP_MAP[person.leadership_tendency] || null) : null;
  var emDisplay = person.emotional_profile ? (EMOTIONAL_MAP[person.emotional_profile] || null) : null;
  var bpPairingLabels = parseJSON(person.pairing_labels, []);
  var bpClickableTag = {display:"inline-flex",alignItems:"center",gap:4,fontSize:12,padding:"4px 11px",borderRadius:999,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#aebac0",cursor:"pointer",whiteSpace:"nowrap",transition:"border-color 0.15s"};
  var ministryFitDisplay = null;
  if (person.ministry_fit && typeof person.ministry_fit === "string" && !person.ministry_fit.startsWith("[")) {
    ministryFitDisplay = lang === "PT" ? (MINISTRY_FIT_MAP[person.ministry_fit] || person.ministry_fit) : person.ministry_fit;
  } else if (person.ministry_fit) {
    var mfParsed = parseJSON(person.ministry_fit, null);
    if (Array.isArray(mfParsed) && mfParsed.length > 0) ministryFitDisplay = mfParsed[0];
  }
  var showBehavioralProfile = !!(person.disc_primary || person.natural_strength || person.ministry_fit);
  var discBars = [
    { key: 'D', field: person.disc_d, ptLabel: 'Executor', enLabel: 'Executor' },
    { key: 'I', field: person.disc_i, ptLabel: 'Comunicador', enLabel: 'Communicator' },
    { key: 'S', field: person.disc_s, ptLabel: 'Planejador', enLabel: 'Planner' },
    { key: 'C', field: person.disc_c, ptLabel: 'Analista', enLabel: 'Analyst' }
  ].filter(function(b){ return b.field !== null && b.field !== undefined; });
  var ministryRecs = getMinistryRecommendations(person, lang);

  function recLabel(m) {
    if (m === 'WE CARE - Helps') {
      return lang === 'PT' ? 'WE CARE - Ajuda Pratica' : 'WE CARE - Helps';
    }
    if (m === 'WE CARE - Evangelism') {
      return lang === 'PT' ? 'WE CARE - Evangelismo' : 'WE CARE - Evangelism';
    }
    if (lang === 'PT') return (MINISTRY_PT[m] || m);
    return m;
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",justifyContent:"flex-end"}}>
      {labelPopup && (
        <LabelDescriptionPopup
          type={labelPopup.type}
          value={labelPopup.value}
          lang={lang}
          onClose={function(){ setLabelPopup(null); }}
          pastoralFlag={labelPopup.pastoralFlag}
          confirmedBy={labelPopup.confirmedBy}
        />
      )}
      {ministryPopup && (
        <>
          <div
            style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:999}}
            onClick={() => setMinistryPopup(null)} />
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",zIndex:1000,background:"#0f1e24",borderRadius:"12px",width:"90%",maxWidth:"400px",padding:"24px"}}>
            <button
              onClick={() => setMinistryPopup(null)}
              style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:"#6b7a82",cursor:"pointer",fontSize:13}}>
              {lang==="PT" ? "Fechar" : "Close"}
            </button>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.15em",textTransform:"uppercase",color:"#6b7a82",marginBottom:8}}>
              {lang==="PT" ? "Por que esta sugestao?" : "Why this suggestion?"}
            </div>
            <div style={{fontSize:15,fontWeight:600,color:"#2ABFBF",marginBottom:12}}>
              {recLabel(ministryPopup.ministry)}
            </div>
            <ul style={{margin:0,padding:"0 0 0 16px",color:"#aebac0",fontSize:12,lineHeight:1.7}}>
              {ministryPopup.reasons.map(function(r,i){
                return <li key={i}>{r}</li>;
              })}
            </ul>
          </div>
        </>
      )}
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
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,color:"#e6f1f0"}}>{person.preferred_name || person.name}</span>
                  {role && role !== 'group_leader' && !nameEditMode && (
                    <button onClick={()=>{ setNameEditFull(person.name||""); setNameEditPreferred(person.preferred_name||""); setNameEditMode(true); }}
                      style={{background:"none",border:"none",color:"#475a64",cursor:"pointer",padding:"2px 4px",fontSize:14,lineHeight:1}} title={lang==="PT"?"Editar nome":"Edit name"}>✎</button>
                  )}
                  <CarismaBadge levels={carisma} lang={lang} />
                  {person.is_pastor == 1 && (
                    <span style={{fontSize:11,padding:"2px 9px",borderRadius:999,background:"#F0E6D3",color:"#3a2e1e",fontWeight:600}}>Pastor/Pastora</span>
                  )}
                  {person.is_ministry_leader == 1 && person.is_pastor != 1 && (
                    <span style={{fontSize:11,padding:"2px 9px",borderRadius:999,background:"#5B9BD5",color:"#fff",fontWeight:600}}>{lang==="PT"?"Lider":"Leader"}</span>
                  )}
                </div>
                {person.full_name && person.preferred_name &&
                  person.preferred_name.trim() !== person.full_name.trim() && (
                  <div style={{fontSize:11,color:"#6b7a82",marginBottom:3}}>
                    <span style={{color:"#475a64",fontFamily:"'JetBrains Mono',monospace"}}>{lang==="PT"?"Nome completo: ":"Full name: "}</span>
                    <span style={{color:"#475a64",fontFamily:"'JetBrains Mono',monospace"}}>{person.full_name}</span>
                  </div>
                )}
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",fontSize:12,color:"#6b7a82"}}>
                  <span>{person.language === "PT" ? "🇧🇷 Português" : "🇺🇸 English"}</span>
                  {person.submitted_at && <span>· {timeAgo(person.submitted_at)}</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,color:"#6b7a82",fontSize:14,cursor:"pointer",width:32,height:32,display:"grid",placeItems:"center",flexShrink:0}}>✕</button>
          </div>
          {/* Name edit inline form */}
          {nameEditMode && (
            <div style={{padding:"12px 0 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",flexDirection:"column",gap:8}}>
              <input value={nameEditFull} onChange={e=>setNameEditFull(e.target.value)}
                placeholder={lang==="PT"?"Nome completo...":"Full name..."}
                style={{padding:"8px 12px",fontSize:13}}/>
              <input value={nameEditPreferred} onChange={e=>setNameEditPreferred(e.target.value)}
                placeholder={lang==="PT"?"Nome preferido...":"Preferred name..."}
                style={{padding:"8px 12px",fontSize:13}}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveName} disabled={nameSaving||!nameEditFull.trim()}
                  style={{fontSize:11,padding:"6px 14px",borderRadius:7,border:"1px solid rgba(42,191,191,0.3)",background:"rgba(42,191,191,0.1)",color:"#2ABFBF",cursor:"pointer",opacity:nameSaving||!nameEditFull.trim()?0.4:1}}>
                  {lang==="PT"?"Salvar":"Save"}
                </button>
                <button onClick={()=>setNameEditMode(false)}
                  style={{fontSize:11,padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"none",color:"#6b7a82",cursor:"pointer"}}>
                  {lang==="PT"?"Cancelar":"Cancel"}
                </button>
              </div>
            </div>
          )}
          {/* Contact actions */}
          <div style={{display:"flex",gap:10,paddingBottom:18,borderBottom:"1px solid rgba(255,255,255,0.04)",flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",gap:10,flex:1,flexWrap:"wrap"}}>
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
            {/* Pastor/Leader role toggles */}
            <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start"}}>
              {[
                {field:"is_pastor", label:lang==="PT"?"Pastor/Pastora":"Pastor/Pastora", other:"is_ministry_leader"},
                {field:"is_ministry_leader", label:lang==="PT"?"Lider de Ministerio":"Ministry Leader", other:"is_pastor"}
              ].map(function(tog){
                var isOn = person[tog.field] == 1;
                var canEdit = role === "owner" || role === "senior_pastor" || role === "pastor";
                return (
                  <div key={tog.field} style={{display:"flex",alignItems:"center",gap:8}}>
                    <button
                      disabled={!canEdit || saving}
                      onClick={function(){
                        if (!canEdit) return;
                        var patch = {};
                        patch[tog.field] = isOn ? 0 : 1;
                        patch[tog.other] = person[tog.other] != null ? Number(person[tog.other]) : 0;
                        updateConnection(patch);
                      }}
                      style={{
                        width:36,height:20,borderRadius:999,border:"none",cursor:canEdit?"pointer":"default",
                        background:isOn?"#2ABFBF":"#333",position:"relative",transition:"background 0.2s",
                        flexShrink:0,opacity:!canEdit?0.5:1,padding:0
                      }}>
                      <span style={{position:"absolute",top:2,left:isOn?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s",display:"block"}} />
                    </button>
                    <span style={{fontSize:11,color:"#aebac0",whiteSpace:"nowrap"}}>{tog.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:0}}>

          {/* Completed Stages — interactive checkboxes (NULL-GUARDED, wrapped in try/catch) */}
          {(function(){
            try {
              var rawCompleted = person.completed_stages;
              var completedStages = Array.isArray(rawCompleted)
                ? rawCompleted
                : JSON.parse(rawCompleted || "[]");
              if (!Array.isArray(completedStages)) completedStages = [];
              var canEditStages = role !== "group_leader";
              var stageBoxes = [
                { key:"New Believer",     labelPT:"Novo Crente",    labelEN:"New Believer" },
                { key:"Start Class",      labelPT:"Start",          labelEN:"Start Class" },
                { key:"Baptism",          labelPT:"Batismo",        labelEN:"Baptism" },
                { key:"New Members Cafe", labelPT:"Cafe de Membros",labelEN:"New Members Cafe" }
              ];
              return (
                <div style={{paddingBottom:22,marginBottom:0}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{lang==="PT"?"Etapas Concluidas":"Completed Stages"}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                    {stageBoxes.map(function(sb){
                      var checked = completedStages.indexOf(sb.key) > -1;
                      return (
                        <label key={sb.key}
                          style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:8,
                            border:checked?"1px solid rgba(94,234,212,0.35)":"1px solid rgba(255,255,255,0.06)",
                            background:checked?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                            color:checked?"#5eead4":"#aebac0",fontSize:12,fontWeight:500,
                            cursor:(canEditStages&&!saving)?"pointer":"default",opacity:canEditStages?1:0.55,transition:"all 0.18s"}}>
                          <input type="checkbox" checked={checked} disabled={!canEditStages||saving}
                            onChange={function(){ if(canEditStages) toggleCompletedStage(sb.key); }}
                            style={{width:15,height:15,accentColor:"#5eead4",cursor:(canEditStages&&!saving)?"pointer":"default"}} />
                          {lang==="PT"?sb.labelPT:sb.labelEN}
                        </label>
                      );
                    })}
                  </div>
                  {stageAdvanceMsg && (
                    <div style={{marginTop:12,display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:8,border:"1px solid rgba(94,234,212,0.3)",background:"rgba(94,234,212,0.1)",color:"#5eead4",fontSize:12,fontWeight:500}}>
                      {"✓ "}{lang==="PT"?"Movido para Ainda Nao Serve":"Moved to Not Yet Serving"}
                    </div>
                  )}
                </div>
              );
            } catch(e) { return null; }
          })()}

          {/* Discipleship Stage — read-only display (separate axis from volunteer pipeline Stage below) */}
          <div style={{paddingBottom:22,marginBottom:0}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{lang==="PT"?"Etapa de Discipulado":"Discipleship Stage"}</div>
            <div style={{display:"inline-flex",alignItems:"center",padding:"8px 14px",borderRadius:8,border:"1px solid rgba(94,234,212,0.22)",background:"rgba(94,234,212,0.08)",color:"#5eead4",fontSize:12,fontWeight:500}}>
              {(DISCIPLESHIP_STAGE_LABEL[lang||"EN"]||DISCIPLESHIP_STAGE_LABEL.EN)[person.discipleship_stage||"Active"]||(person.discipleship_stage||"Active")}
            </div>
          </div>

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
            <button onClick={()=>setAssignedPastorOpen(o=>!o)}
              style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:0,width:"100%",marginBottom:assignedPastorOpen?12:0}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500}}>
                {person.assigned_pastor ? `${t.assignedPastor}: ${person.assigned_pastor}` : t.assignedPastor}
              </span>
              <span style={{color:"#475a64",fontSize:11,marginLeft:"auto"}}>{assignedPastorOpen?"▼":"▶"}</span>
            </button>
            {assignedPastorOpen && (
              <>
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
              </>
            )}
          </div>

          {/* Carisma — Pastor can toggle levels */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500,display:"flex",alignItems:"center",gap:8}}>
              <img src={CARISMA_LOGO} alt="" style={{width:14,height:14,objectFit:"contain",verticalAlign:"middle"}} />
              {t.carismaLabel}
            </div>
            <div style={{display:"flex",gap:8}}>
              {CARISMA_OPTIONS.map(function(opt){
                var active = carismaOptionActive(opt.value);
                var label = lang === "PT" ? opt.displayPT : opt.displayEN;
                return (
                  <button key={opt.value} onClick={function(){ toggleCarisma(opt.value); }} disabled={saving}
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
                    {label}
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

          {/* GC Connected — display + pastor edit */}
          {(person.gc_connected === 1 || person.gc_connected === 0 || role === "owner" || role === "senior_pastor" || role === "pastor") && (
            <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>
                {lang==="PT" ? "GC" : "GC"}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                {person.gc_connected === 1 && (
                  <span style={{fontSize:12,padding:"5px 12px",borderRadius:999,fontWeight:600,
                    background:"rgba(42,191,191,0.12)",border:"1px solid rgba(42,191,191,0.3)",color:"#2ABFBF"}}>
                    {lang==="PT" ? "Conectado" : "Connected"}
                  </span>
                )}
                {person.gc_connected === 0 && (
                  <span style={{fontSize:12,padding:"5px 12px",borderRadius:999,fontWeight:600,
                    background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#6b7a82"}}>
                    {lang==="PT" ? "Nao conectado" : "Not connected"}
                  </span>
                )}
                {(role==="owner"||role==="senior_pastor"||role==="pastor") && (
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={function(){updateConnection({gc_connected:1});}} disabled={saving}
                      style={{padding:"5px 13px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                        border:person.gc_connected===1?"1px solid rgba(42,191,191,0.35)":"1px solid rgba(255,255,255,0.04)",
                        background:person.gc_connected===1?"linear-gradient(180deg,rgba(42,191,191,0.18),rgba(42,191,191,0.08))":"rgba(255,255,255,0.02)",
                        color:person.gc_connected===1?"#2ABFBF":"#aebac0",
                        boxShadow:person.gc_connected===1?"0 0 14px rgba(42,191,191,0.18)":"none"}}>
                      {lang==="PT" ? "Sim" : "Yes"}
                    </button>
                    <button onClick={function(){updateConnection({gc_connected:0});}} disabled={saving}
                      style={{padding:"5px 13px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                        border:person.gc_connected===0?"1px solid rgba(255,255,255,0.18)":"1px solid rgba(255,255,255,0.04)",
                        background:person.gc_connected===0?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",
                        color:person.gc_connected===0?"#aebac0":"#6b7a82"}}>
                      {lang==="PT" ? "Nao" : "No"}
                    </button>
                  </div>
                )}
              </div>
              {/* GC Name — display */}
              {person.gc_connected === 1 && person.gc_name && (
                <div style={{marginTop:10,fontSize:12,color:"#aebac0"}}>
                  <span style={{color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",marginRight:6}}>{lang==="PT"?"GC:":"GC:"}</span>
                  {person.gc_name}
                </div>
              )}
              {/* GC Name — editable by pastor */}
              {person.gc_connected === 1 && (role==="owner"||role==="senior_pastor"||role==="pastor") && (
                <GcNameEditor person={person} updateConnection={updateConnection} saving={saving} lang={lang} />
              )}
            </div>
          )}

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
                  {(LANGUAGE_DISPLAY[lang]||LANGUAGE_DISPLAY.EN)[l]||l}
                </button>
              ))}
            </div>
          </div>

          {/* Groups & Roles collapsible wrapper */}
          <div style={{paddingTop:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <button onClick={()=>setGroupsRolesOpen(o=>!o)}
              style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:0,width:"100%",marginBottom:groupsRolesOpen?14:22}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500}}>
                {lang==="PT"?"Grupos e Funcoes":"Groups & Roles"}
              </span>
              <span style={{color:"#475a64",fontSize:11,marginLeft:"auto"}}>{groupsRolesOpen?"▼":"▶"}</span>
            </button>
            {groupsRolesOpen && (
              <>
          {/* GC Connected display + pastor toggle */}
          <div style={{paddingBottom:18}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:10,fontWeight:500}}>
              {lang==="PT" ? "GC" : "GC"}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              {/* Read-only chip for all roles when value is set */}
              {person.gc_connected === 1 && (
                <span style={{fontSize:12,padding:"5px 12px",borderRadius:999,fontWeight:600,
                  background:"rgba(42,191,191,0.12)",border:"1px solid rgba(42,191,191,0.3)",color:"#2ABFBF"}}>
                  {lang==="PT" ? "Conectado" : "Connected"}
                </span>
              )}
              {person.gc_connected === 0 && (
                <span style={{fontSize:12,padding:"5px 12px",borderRadius:999,fontWeight:600,
                  background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#6b7a82"}}>
                  {lang==="PT" ? "Nao conectado" : "Not connected"}
                </span>
              )}
              {/* Pastor-only Yes/No edit toggle */}
              {(role==="owner"||role==="senior_pastor"||role==="pastor") && (
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>updateConnection({gc_connected:1})} disabled={saving}
                    style={{padding:"5px 13px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                      border:person.gc_connected===1?"1px solid rgba(42,191,191,0.35)":"1px solid rgba(255,255,255,0.04)",
                      background:person.gc_connected===1?"linear-gradient(180deg,rgba(42,191,191,0.18),rgba(42,191,191,0.08))":"rgba(255,255,255,0.02)",
                      color:person.gc_connected===1?"#2ABFBF":"#aebac0",
                      boxShadow:person.gc_connected===1?"0 0 14px rgba(42,191,191,0.18)":"none"}}>
                    {lang==="PT" ? "Sim" : "Yes"}
                  </button>
                  <button onClick={()=>updateConnection({gc_connected:0})} disabled={saving}
                    style={{padding:"5px 13px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                      border:person.gc_connected===0?"1px solid rgba(255,255,255,0.18)":"1px solid rgba(255,255,255,0.04)",
                      background:person.gc_connected===0?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",
                      color:person.gc_connected===0?"#aebac0":"#6b7a82",
                      boxShadow:"none"}}>
                    {lang==="PT" ? "Nao" : "No"}
                  </button>
                </div>
              )}
            </div>
            {/* GC Name display + edit */}
            {person.gc_connected === 1 && person.gc_name && (
              <div style={{marginTop:8,fontSize:12,color:"#aebac0"}}>
                <span style={{color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",marginRight:6}}>GC:</span>
                {person.gc_name}
              </div>
            )}
            {person.gc_connected === 1 && (role==="owner"||role==="senior_pastor"||role==="pastor") && (
              <GcNameEditor person={person} updateConnection={updateConnection} saving={saving} lang={lang} />
            )}
          </div>

          {/* Group Attendance (edit) */}
          <div style={{paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:18}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:10,fontWeight:500}}>{t.groupsAttendedHd||"Groups Attended"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {ATTENDANCE_GROUPS_DASH.map(g => {
                const curAttend = parseJSON(person.group_attendance) || [];
                const active = curAttend.includes(g);
                return (
                  <button key={g} onClick={()=>{ const next = active ? curAttend.filter(x=>x!==g) : [...curAttend,g]; updateConnection({group_attendance:next}); }} disabled={saving}
                    style={{padding:"7px 13px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                      border:active?"1px solid rgba(94,234,212,0.35)":"1px solid rgba(255,255,255,0.04)",
                      background:active?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                      color:active?"#5eead4":"#aebac0",
                      boxShadow:active?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group Roles (edit) */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500}}>{t.groupRolesHd||"Group Roles"}</div>
              {groupRolesDirty && (
                <button onClick={()=>{
                  const flat = [];
                  Object.entries(editGroupRoles).forEach(([gn,roles])=>roles.forEach(r=>flat.push({group_name:gn,role:r})));
                  updateConnection({group_roles:flat}).then(()=>setGroupRolesDirty(false)).catch(()=>{});
                }} disabled={saving}
                  style={{padding:"5px 12px",borderRadius:6,background:"#2abfbf",color:"#000",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase"}}>
                  Save
                </button>
              )}
            </div>
            {Object.keys(GROUP_ROLE_MAP_DASH).map(groupName => {
              const roles = GROUP_ROLE_MAP_DASH[groupName];
              const isOpen = !!(editGroupRoles[groupName] && editGroupRoles[groupName].length >= 0) || Object.prototype.hasOwnProperty.call(editGroupRoles, groupName);
              const groupSelected = Object.prototype.hasOwnProperty.call(editGroupRoles, groupName);
              return (
                <div key={groupName} style={{marginBottom:8}}>
                  <button onClick={()=>{
                    setEditGroupRoles(prev => {
                      const next = Object.assign({}, prev);
                      if(Object.prototype.hasOwnProperty.call(next, groupName)) { delete next[groupName]; }
                      else { next[groupName] = []; }
                      return next;
                    });
                    setGroupRolesDirty(true);
                  }} disabled={saving}
                    style={{padding:"7px 13px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.18s",
                      border:groupSelected?"1px solid rgba(94,234,212,0.35)":"1px solid rgba(255,255,255,0.04)",
                      background:groupSelected?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                      color:groupSelected?"#5eead4":"#aebac0",
                      boxShadow:groupSelected?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
                    {groupName}
                  </button>
                  {groupSelected && (
                    <div style={{marginTop:6,paddingLeft:12,display:"flex",flexWrap:"wrap",gap:5}}>
                      {roles.map(role => {
                        const checked = (editGroupRoles[groupName]||[]).includes(role);
                        return (
                          <button key={role} onClick={()=>{
                            setEditGroupRoles(prev => {
                              const next = Object.assign({}, prev);
                              const cur = next[groupName] ? [...next[groupName]] : [];
                              const idx = cur.indexOf(role);
                              if(idx>-1) cur.splice(idx,1); else cur.push(role);
                              next[groupName] = cur;
                              return next;
                            });
                            setGroupRolesDirty(true);
                          }} disabled={saving}
                            style={{padding:"4px 9px",borderRadius:5,fontSize:11,fontWeight:500,cursor:"pointer",transition:"all 0.15s",
                              border:checked?"1px solid rgba(42,191,191,0.4)":"1px solid rgba(255,255,255,0.06)",
                              background:checked?"rgba(42,191,191,0.1)":"rgba(255,255,255,0.02)",
                              color:checked?"#2abfbf":"#6b7a82"}}>
                            {role}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
              </>
            )}
          </div>

          {/* Gifting Profile */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.giftingProfile}</div>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {[person.gifting_1,person.gifting_2,person.gifting_3].map(g=>typeof g==="object"?null:(g||null)).filter(Boolean).map((g,i)=>(
                <span key={i} onClick={function(){ setLabelPopup({type:'gifting',value:g}); }}
                  style={{fontSize:12,padding:"6px 11px",
                  background:i===0?"rgba(94,234,212,0.12)":"rgba(255,255,255,0.03)",
                  color:i===0?"#5eead4":"#aebac0",
                  borderRadius:8,
                  border:`1px solid ${i===0?"rgba(94,234,212,0.3)":"rgba(255,255,255,0.05)"}`,
                  display:"inline-flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,opacity:0.6}}>#{i+1}</span>
                  {GIFTING_ICONS[g]||""} {giftingLabel(g, lang)}
                </span>
              ))}
            </div>
            {sortedScores.length > 0 && (
              <>
                <button onClick={()=>setShowAllGiftings(p=>!p)}
                  style={{fontSize:11.5,color:"#5eead4",background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:showAllGiftings?10:0,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.04em"}}>
                  {showAllGiftings ? (lang==="PT" ? "Ocultar dons" : "Hide giftings") : (lang==="PT" ? "Ver todos os dons" : "View all giftings")}
                </button>
                {showAllGiftings && (
                  <div style={{background:"rgba(8,16,22,0.6)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:12,padding:"16px 18px"}}>
                    {sortedScores.map(([gifting,score],idx)=>{
                      const pct = Math.min(Math.round(Number(score)),100);
                      return (
                        <div key={gifting} style={{marginBottom:idx<sortedScores.length-1?12:0}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
                            <span style={{fontSize:12.5,color:"#aebac0",display:"flex",alignItems:"center",gap:6}}>
                              <span>{GIFTING_ICONS[gifting]||"◆"}</span> {giftingLabel(gifting, lang)}
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
              </>
            )}
          </div>

          {/* DISC Profile + Behavioral Profile */}
          {showBehavioralProfile && (
            <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.discProfile}</div>
              {/* DISC type badges — tap to open description popup */}
              {person.disc_primary && (
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                  <span onClick={function(){ setLabelPopup({type:"disc",value:person.disc_primary}); }}
                    style={{fontSize:12,padding:"6px 12px",borderRadius:8,
                      background:`${DISC_COLORS[person.disc_primary]}18`,
                      border:`1px solid ${DISC_COLORS[person.disc_primary]}50`,
                      color:DISC_COLORS[person.disc_primary],fontWeight:700,
                      display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,opacity:0.7}}>#1</span>
                    {(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[person.disc_primary]}
                  </span>
                  {person.disc_secondary && (
                    <span onClick={function(){ setLabelPopup({type:"disc",value:person.disc_secondary}); }}
                      style={{fontSize:11,padding:"5px 10px",borderRadius:8,
                        background:`${DISC_COLORS[person.disc_secondary]}0e`,
                        border:`1px solid ${DISC_COLORS[person.disc_secondary]}30`,
                        color:DISC_COLORS[person.disc_secondary],fontWeight:600,
                        display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,opacity:0.7}}>#2</span>
                      {(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[person.disc_secondary]}
                    </span>
                  )}
                  {(person.pastoral_flag==1 || person.pastoral_flag==2) && (
                    <span onClick={function(){ setLabelPopup({type:'pastoral',value:'pastoral-potential',pastoralFlag:person.pastoral_flag,confirmedBy:person.pastor_confirmed_by||null}); }}
                      style={{fontSize:10,padding:"4px 10px",borderRadius:6,
                      background:person.pastoral_flag==2?"rgba(42,191,191,0.12)":"rgba(245,158,11,0.12)",
                      border:person.pastoral_flag==2?"1px solid rgba(42,191,191,0.3)":"1px solid rgba(245,158,11,0.3)",
                      color:person.pastoral_flag==2?"#2ABFBF":"#fbd590",
                      fontWeight:700,display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                      {"★ "}{person.pastoral_flag==2
                        ? (lang==="PT"
                          ? "Marcado Pastoral" + (person.pastor_confirmed_by ? " — por " + person.pastor_confirmed_by : "")
                          : "Marked for Pastoral" + (person.pastor_confirmed_by ? " — by " + person.pastor_confirmed_by : ""))
                        : t.pastoralAlert}
                    </span>
                  )}
                </div>
              )}
              {discBars.length > 0 && (
                <div style={{marginTop:12,marginBottom:4}}>
                  {discBars.map(function(bar) {
                    var pct = Math.round((bar.field / 15) * 100);
                    var color = DISC_COLORS[bar.key] || '#2ABFBF';
                    return (
                      <div key={bar.key} style={{marginBottom:6}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <span style={{color:color,fontWeight:700,fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>{bar.key}</span>
                            <span style={{color:'#6b7a82',fontSize:11}}>{lang==='PT' ? bar.ptLabel : bar.enLabel}</span>
                          </div>
                          <span style={{color:'#6b7a82',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{bar.field}/15</span>
                        </div>
                        <div style={{background:'rgba(255,255,255,0.06)',height:4,borderRadius:2}}>
                          <div style={{width:`${pct}%`,background:color,height:'100%',borderRadius:2}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Behavioral Profile section */}
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500,marginTop:4}}>
                {lang==="PT" ? "Perfil Comportamental" : "Behavioral Profile"}
              </div>
              {(nsDisplay || ldDisplay || emDisplay || bpPairingLabels.length > 0) && (
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
                  {/* Natural Strength */}
                  {nsDisplay && (
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10.5,color:"#6b7a82",flexShrink:0,minWidth:90,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>{t.naturalStr}</span>
                      <span onClick={function(){ setLabelPopup({type:"natural_strength",value:person.natural_strength}); }}
                        style={bpClickableTag}>
                        {lang==="PT" ? nsDisplay.PT : nsDisplay.EN}
                      </span>
                    </div>
                  )}
                  {/* Leadership Tendency */}
                  {ldDisplay && (
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10.5,color:"#6b7a82",flexShrink:0,minWidth:90,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>{t.leadership}</span>
                      <span onClick={function(){ setLabelPopup({type:"leadership_tendency",value:person.leadership_tendency}); }}
                        style={bpClickableTag}>
                        {lang==="PT" ? ldDisplay.PT : ldDisplay.EN}
                      </span>
                      {(person.pastoral_flag==1 || person.pastoral_flag==2) && (
                        <span title={person.pastoral_flag==2?(lang==="PT"?"Confirmado pelo Pastor":"Confirmed by Pastor"):(lang==="PT"?"Potencial Pastoral":"Pastoral Potential")}
                          style={{width:7,height:7,borderRadius:"50%",
                            background:person.pastoral_flag==2?"#2ABFBF":"#f59e0b",
                            boxShadow:person.pastoral_flag==2?"0 0 6px #2ABFBF":"0 0 6px #f59e0b",
                            flexShrink:0,display:"inline-block"}} />
                      )}
                    </div>
                  )}
                  {/* Emotional Profile */}
                  {emDisplay && (
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10.5,color:"#6b7a82",flexShrink:0,minWidth:90,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>{t.emotional}</span>
                      <span onClick={function(){ setLabelPopup({type:"emotional_profile",value:person.emotional_profile}); }}
                        style={bpClickableTag}>
                        {lang==="PT" ? emDisplay.PT : emDisplay.EN}
                      </span>
                    </div>
                  )}
                  {/* Pairing Labels */}
                  {bpPairingLabels.length > 0 && (
                    <div style={{display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:10.5,color:"#6b7a82",flexShrink:0,minWidth:90,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em",paddingTop:4}}>{t.pairing}</span>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {bpPairingLabels.map(function(pl,pi){
                          var displayLabel = lang==="PT" ? (PAIRING_LABEL_MAP[pl]||pl) : pl;
                          return (
                            <span key={pi} onClick={function(){ setLabelPopup({type:"pairing",value:pl}); }}
                              style={{fontSize:11,padding:"4px 10px",borderRadius:999,
                                background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",
                                color:"#c4b5fd",cursor:"pointer"}}>
                              {displayLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Ministry Fit */}
              {ministryFitDisplay && (
                <div style={{marginTop:8}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.15em",textTransform:"uppercase",color:"#6b7a82",marginBottom:4}}>
                    {lang==="PT" ? "Orientacao Pastoral" : "Pastoral Guidance"}
                  </div>
                  <p style={{fontStyle:"italic",fontSize:12,color:"#6b7a82",lineHeight:1.6,margin:0}}>
                    {ministryFitDisplay}
                  </p>
                </div>
              )}
              {/* Reliability indicator */}
              {person.reliability_flag === 1 && (
                <div style={{
                  display:'inline-flex',
                  alignItems:'center',
                  gap:4,
                  fontSize:11,
                  color:'#2ABFBF',
                  fontFamily:"'JetBrains Mono',monospace",
                  marginTop:4
                }}>
                  <span>✓</span>
                  <span>{lang==='PT'
                    ? 'Comprometimento confirmado'
                    : 'Reliability confirmed'}</span>
                </div>
              )}
              {/* Pastoral Flag Management — visible only when auth token present */}
              {token && (
                <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,position:"relative"}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.15em",textTransform:"uppercase",color:"#6b7a82"}}>
                      {lang==="PT" ? "Candidato Pastoral" : "Pastoral Candidate"}
                    </div>
                    <button onClick={()=>setPastoralInfoPopup(o=>!o)}
                      style={{background:"none",border:"none",color:"#475a64",cursor:"pointer",padding:"0 2px",fontSize:13,lineHeight:1}}>i</button>
                    {pastoralInfoPopup && (
                      <div onClick={()=>setPastoralInfoPopup(false)}
                        style={{position:"absolute",top:22,left:0,zIndex:20,background:"#1a1a1a",color:"#e6f1f0",borderRadius:6,padding:"10px 14px",fontSize:11,lineHeight:1.6,maxWidth:280,boxShadow:"0 4px 20px rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer"}}>
                        {lang==="PT"
                          ? "Esta indicacao identifica alguem cujo perfil de dons e padrao comportamental sugere potencial para desenvolvimento pastoral. Pode ser definida automaticamente pelo sistema quando criterios especificos sao atendidos, ou manualmente por um pastor. Indicacoes do sistema e de pastores sao registradas separadamente. Esta e uma nota pastoral privada - nao visivel ao voluntario."
                          : "This flag identifies someone whose gifting profile and behavioral pattern suggest potential for pastoral development. It can be set automatically by the system when specific criteria are met, or manually by a pastor. System flags and pastor flags are tracked separately. This is a private pastoral note - not visible to the volunteer."}
                      </div>
                    )}
                  </div>
                  {/* State: not flagged */}
                  {(!person.pastoral_flag || person.pastoral_flag==0) && !pastoralUI && (
                    <button onClick={function(){ setPastoralAction("flag"); setPastoralUI(true); setPastoralPastorName(""); setPastoralCustomName(""); }}
                      disabled={saving}
                      style={{fontSize:11,padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#aebac0",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                      {lang==="PT" ? "Candidato Pastoral" : "Pastoral Candidate"}
                    </button>
                  )}
                  {/* State: algorithm flagged */}
                  {person.pastoral_flag==1 && !pastoralUI && (
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <button onClick={function(){ setPastoralAction("confirm"); setPastoralUI(true); setPastoralPastorName(""); setPastoralCustomName(""); }}
                        disabled={saving}
                        style={{fontSize:11,padding:"6px 12px",borderRadius:7,border:"1px solid rgba(42,191,191,0.3)",background:"rgba(42,191,191,0.08)",color:"#2ABFBF",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                        {lang==="PT" ? "Candidato Pastoral" : "Pastoral Candidate"}
                      </button>
                      <button onClick={function(){ updateConnection({pastoral_flag:0,pastor_confirmed_by:null}); }}
                        disabled={saving}
                        style={{fontSize:11,padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#aebac0",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                        {lang==="PT" ? "Remover indicacao" : "Remove Flag"}
                      </button>
                    </div>
                  )}
                  {/* State: pastor confirmed */}
                  {person.pastoral_flag==2 && !pastoralUI && (
                    <div>
                      <div style={{fontSize:11,color:"#2ABFBF",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>
                        {lang==="PT" ? "Confirmado pelo Pastor" : "Confirmed by Pastor"}
                        {person.pastor_confirmed_by ? " - " + person.pastor_confirmed_by : ""}
                      </div>
                      <button onClick={function(){ updateConnection({pastoral_flag:0,pastor_confirmed_by:null}); }}
                        disabled={saving}
                        style={{fontSize:11,padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#aebac0",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                        {lang==="PT" ? "Remover indicacao" : "Remove Flag"}
                      </button>
                    </div>
                  )}
                  {/* Pastor name selector — shown when action is pending */}
                  {pastoralUI && (
                    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"10px 12px"}}>
                      <div style={{fontSize:11,color:"#aebac0",fontFamily:"'JetBrains Mono',monospace",marginBottom:8}}>
                        {lang==="PT" ? "Quem esta confirmando?" : "Who is confirming?"}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                        {["Pr. Daniel","Pra. Alice","Pr. Rafa"].map(function(name){
                          return (
                            <button key={name} onClick={function(){ setPastoralPastorName(name); setPastoralCustomName(""); }}
                              style={{fontSize:11,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontFamily:"'Inter',sans-serif",
                                border:pastoralPastorName===name?"1px solid rgba(42,191,191,0.4)":"1px solid rgba(255,255,255,0.08)",
                                background:pastoralPastorName===name?"rgba(42,191,191,0.1)":"rgba(255,255,255,0.02)",
                                color:pastoralPastorName===name?"#2ABFBF":"#aebac0"}}>
                              {name}
                            </button>
                          );
                        })}
                        <button onClick={function(){ setPastoralPastorName("outro"); }}
                          style={{fontSize:11,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontFamily:"'Inter',sans-serif",
                            border:pastoralPastorName==="outro"?"1px solid rgba(42,191,191,0.4)":"1px solid rgba(255,255,255,0.08)",
                            background:pastoralPastorName==="outro"?"rgba(42,191,191,0.1)":"rgba(255,255,255,0.02)",
                            color:pastoralPastorName==="outro"?"#2ABFBF":"#aebac0"}}>
                          {lang==="PT" ? "Outro" : "Other"}
                        </button>
                      </div>
                      {pastoralPastorName==="outro" && (
                        <input value={pastoralCustomName} onChange={function(e){ setPastoralCustomName(e.target.value); }}
                          placeholder={lang==="PT" ? "Nome do pastor..." : "Pastor name..."}
                          style={{width:"100%",fontSize:12,padding:"6px 10px",borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.03)",color:"#e6f1f0",fontFamily:"'Inter',sans-serif",boxSizing:"border-box",marginBottom:8}} />
                      )}
                      <div style={{display:"flex",gap:8,marginTop:4}}>
                        <button
                          disabled={saving || !pastoralPastorName || (pastoralPastorName==="outro" && !pastoralCustomName.trim())}
                          onClick={function(){
                            var confirmedBy = pastoralPastorName==="outro" ? pastoralCustomName.trim() : pastoralPastorName;
                            updateConnection({pastoral_flag:2, pastor_confirmed_by:confirmedBy});
                            setPastoralUI(false); setPastoralAction(null);
                          }}
                          style={{fontSize:11,padding:"6px 14px",borderRadius:7,border:"1px solid rgba(42,191,191,0.3)",background:"rgba(42,191,191,0.1)",color:"#2ABFBF",cursor:"pointer",fontFamily:"'Inter',sans-serif",opacity:(saving||!pastoralPastorName||(pastoralPastorName==="outro"&&!pastoralCustomName.trim()))?0.4:1}}>
                          {lang==="PT" ? "Salvar" : "Save"}
                        </button>
                        <button onClick={function(){ setPastoralUI(false); setPastoralAction(null); setPastoralPastorName(""); setPastoralCustomName(""); }}
                          style={{fontSize:11,padding:"6px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"none",color:"#6b7a82",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                          {lang==="PT" ? "Cancelar" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Suggested Placements */}
              {ministryRecs.length > 0 && (
                <div style={{marginTop:10}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.15em",textTransform:"uppercase",color:"#6b7a82",marginBottom:6}}>
                    {lang==="PT" ? "Encaixes Sugeridos" : "Suggested Placements"}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {ministryRecs.map(function(rec,i){
                      return (
                        <span key={i}
                          onClick={() => setMinistryPopup(rec)}
                          style={{fontSize:11,padding:"3px 10px",borderRadius:999,background:"rgba(42,191,191,0.08)",border:"1px solid rgba(42,191,191,0.25)",color:"#2ABFBF",whiteSpace:"nowrap",cursor:"pointer"}}>
                          {recLabel(rec.ministry)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Current Ministries — editable (3F: follows Suggested Placements) */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500}}>{t.currentMin}</div>
              <span style={{fontSize:11,padding:"4px 10px",background:badge.bg,color:badge.color,borderRadius:999,fontWeight:600,border:`1px solid ${badge.color}44`}}>{badge.label==="Available"?t.available:badge.label}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {ministries.map(m=>(
                <span key={m} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,padding:"6px 11px",background:"rgba(94,234,212,0.08)",color:"#c5f5ec",borderRadius:8,border:"1px solid rgba(94,234,212,0.22)"}}>
                  {ministryLabel(m, lang)}
                  <button onClick={()=>removeMinistry(m)} style={{background:"none",border:"none",color:"#5eead4",cursor:"pointer",fontSize:14,lineHeight:1,padding:0,opacity:0.7}}>×</button>
                </span>
              ))}
              <button onClick={()=>setShowMinistryInput(true)} style={{fontSize:12,padding:"6px 11px",background:"rgba(255,255,255,0.02)",color:"#6b7a82",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:8,cursor:"pointer"}}>{t.addBtn}</button>
            </div>
            {showMinistryInput && (
              <div style={{display:"flex",gap:8}}>
                <select value={newMinistry} onChange={e=>setNewMinistry(e.target.value)} style={{flex:1}}>
                  <option value="">{t.selectMinistry}</option>
                  {MINISTRIES_STARTER.filter(m=>!ministries.includes(m)).map(m=><option key={m} value={m}>{ministryLabel(m, lang, lang)}</option>)}
                  <option value="__custom">{t.selectCustom}</option>
                </select>
                <button onClick={()=>newMinistry==="__custom"?setShowMinistryInput("custom"):addMinistry(newMinistry)} className="btn-primary" style={{padding:"8px 16px",whiteSpace:"nowrap"}}>{t.addMinistry}</button>
                <button onClick={()=>{setShowMinistryInput(false);setNewMinistry("");}} className="btn-ghost" style={{padding:"8px 12px"}}>✕</button>
              </div>
            )}
            {showMinistryInput === "custom" && (
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <input placeholder={t.typeMinistry} value={newMinistry==="__custom"?"":newMinistry}
                  onChange={e=>setNewMinistry(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addMinistry(newMinistry)}/>
                <button onClick={()=>addMinistry(newMinistry)} className="btn-primary" style={{padding:"8px 16px",whiteSpace:"nowrap"}}>{t.addMinistry}</button>
              </div>
            )}
          </div>

          {/* Group Attendance */}
          {(() => {
            const attended = parseJSON(person.group_attendance);
            if (!attended || attended.length === 0) return null;
            return (
              <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:10,fontWeight:500}}>{t.groupsAttendedHd||"Groups Attended"}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {attended.map(g => (
                    <span key={g} style={{fontSize:12,padding:"4px 10px",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#aebac0",border:"1px solid rgba(255,255,255,0.07)"}}>{g}</span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Group Roles */}
          {(() => {
            const gr = person.group_roles;
            if (!gr || gr.length === 0) return null;
            const byGroup = {};
            gr.forEach(function(r){ if(!byGroup[r.group_name]) byGroup[r.group_name]=[]; byGroup[r.group_name].push(r.role); });
            return (
              <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.groupRolesHd||"Group Roles"}</div>
                {Object.entries(byGroup).map(([gname, roles]) => (
                  <div key={gname} style={{marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#5eead4",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{gname}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {roles.map(role => (
                        <span key={role} style={{fontSize:12,padding:"3px 9px",borderRadius:5,border:"1px solid rgba(42,191,191,0.35)",color:"#2abfbf",background:"rgba(42,191,191,0.06)"}}>{role}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Notes */}
          <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.notesAudit}</div>
            <div style={{marginBottom:16}}>
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
                <div style={{display:"flex",gap:8,marginBottom:4,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#5eead4"}}>{note.pastor_name}</span>
                  <span style={{fontSize:11,color:"#475a64"}}>{formatNoteDate(note.created_at, lang)}</span>
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
    var ls = p.languages_spoken;
    var langs = [];
    try { langs = JSON.parse(ls || "[]"); } catch { langs = []; }
    return langs.includes("English") || langs.includes("Both") || ls === "Both";
  });
  const ptOnly = unassigned.filter(p => {
    var ls = p.languages_spoken;
    var langs = [];
    try { langs = JSON.parse(ls || "[]"); } catch { langs = []; }
    return !langs.includes("English") && !langs.includes("Both") && ls !== "Both";
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

function PeopleTab({ token, role, t, lang, templatePT, templateEN, onNavigate, fbUser, viewMode }) {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [filterGifting, setFilterGifting] = useState("All");
  const [filterLang, setFilterLang] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterPastor, setFilterPastor] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [myPeopleOnly, setMyPeopleOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [qrModal, setQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrLabel, setQrLabel] = useState("");
  const [qrFileName, setQrFileName] = useState("lagoinha-tampa-qr.png");
  const [qrUrlLabel, setQrUrlLabel] = useState("");
  const ASSESSMENT_URL = "https://farfromtimnah-hue.github.io/ministry-gifting/";
  const CAFE_URL = "https://farfromtimnah-hue.github.io/ministry-gifting/cafe-form.html";
  const BAPTISM_URL = "https://farfromtimnah-hue.github.io/ministry-gifting/baptism-form.html";

  function openQrModal(url, label, fileName, urlLabel) {
    QRCode.toDataURL(url, { width: 300, margin: 2 }).then(function(dataUrl) {
      setQrDataUrl(dataUrl);
      setQrLabel(label || "");
      setQrFileName(fileName || "lagoinha-tampa-qr.png");
      setQrUrlLabel(urlLabel || "");
      setQrModal(true);
    });
  }

  function downloadQr() {
    if (!qrDataUrl) return;
    var a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = qrFileName;
    a.click();
  }
  const [showSplit, setShowSplit] = useState(false);
  const [splitRatio, setSplitRatio] = useState("5050");
  const [splitDone, setSplitDone] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("active");
  const [langFilter, setLangFilter] = useState(null);

  const load = useCallback(() => {
    fetch(`${API}/people`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setPeople(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Stage-view roles (set via the top-nav view switcher) drive which discipleship
  // tab opens by default and which pills are visible. Maps view role -> default tab view key.
  const STAGE_VIEW_TAB_DEFAULT = {
    new_believer_view: "new_believer",
    start_class_view: "start_class",
    baptism_view: "baptism",
    cafe_view: "cafe"
  };
  const isStageView = !!STAGE_VIEW_TAB_DEFAULT[viewMode];

  // When the active view role changes, jump to that view's default discipleship tab.
  useEffect(() => {
    if (STAGE_VIEW_TAB_DEFAULT[viewMode]) {
      setView(STAGE_VIEW_TAB_DEFAULT[viewMode]);
    } else if (viewMode === "my_view" || viewMode === "senior_pastor_view" || viewMode === "pastor_view") {
      setView("active");
    }
    setFilterStage("All");
    setLangFilter(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const STAGE_TO_VIEW = {
    "New Believer": "new_believer",
    "Start Class": "start_class",
    "Baptism": "baptism",
    "New Members Cafe": "cafe",
    "Not Yet Serving": "not_yet_serving",
    "Active": "active",
    "Placed": "placed"
  };

  const peopleByView = (viewKey) => people.filter(p => {
    const ds = p.discipleship_stage || "Active";
    return STAGE_TO_VIEW[ds] === viewKey;
  });

  const currentPool = peopleByView(view);

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
    if (langFilter !== null) {
      const langs = parseJSON(p.languages_spoken);
      if (!langs.includes(langFilter)) return false;
    }
    if (filterGroup !== "All") {
      const grps = parseJSON(p.special_groups);
      if (!grps.includes(filterGroup)) return false;
    }
    if (filterPastor !== "All" && p.assigned_pastor !== filterPastor) return false;
    if (filterType === "Pastors" && p.is_pastor != 1) return false;
    if (filterType === "Leaders" && (p.is_ministry_leader != 1 || p.is_pastor == 1)) return false;
    if (filterType === "Congregation" && (p.is_pastor == 1 || p.is_ministry_leader == 1)) return false;
    if (myPeopleOnly) {
      var myName = (fbUser && fbUser.displayName) ? fbUser.displayName : null;
      if (!myName || p.assigned_pastor !== myName) return false;
    }
    return true;
  });

  const pastorOptions = ["All",...Array.from(new Set(people.map(p=>p.assigned_pastor).filter(Boolean)))];
  const activeStages = STAGES.filter(s => s !== "Placed in Ministry");

  return (
    <div style={{padding:"24px 28px"}}>
      <style>{css}</style>

      {/* Discipleship-stage sub-view toggle — 6 mutually exclusive tabs */}
      <style>{`.disc-pill-row::-webkit-scrollbar{display:none;}`}</style>
      <div className="disc-pill-row" style={{display:"flex",flexWrap:"nowrap",gap:8,marginBottom:20,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",paddingBottom:2}}>
        {(isStageView ? DISCIPLESHIP_STAGES.slice(0, 5) : DISCIPLESHIP_STAGES).map(ds => {
          const vk = STAGE_TO_VIEW[ds];
          const isActive = view === vk;
          const count = peopleByView(vk).length;
          return (
            <button key={vk} onClick={()=>{ setView(vk); setFilterStage("All"); setLangFilter(null); setMyPeopleOnly(false); }}
              style={{flex:"0 0 auto",whiteSpace:"nowrap",padding:"8px 20px",borderRadius:999,
                border:`1px solid ${isActive?"rgba(94,234,212,0.35)":"rgba(255,255,255,0.05)"}`,
                background:isActive?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                color:isActive?"#5eead4":"#6b7a82",
                fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",
                cursor:"pointer",transition:"all 0.18s",
                boxShadow:isActive?"0 0 14px rgba(94,234,212,0.18)":"none"}}>
              {(DISCIPLESHIP_STAGE_LABEL[lang||"EN"]||DISCIPLESHIP_STAGE_LABEL.EN)[ds]||ds}
              <span style={{marginLeft:8,fontSize:11,padding:"1px 7px",background:isActive?"rgba(94,234,212,0.22)":"rgba(255,255,255,0.04)",borderRadius:999,color:isActive?"#5eead4":"#6b7a82"}}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <div onClick={function(){setQrModal(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:"#0c1a24",border:"1px solid rgba(94,234,212,0.18)",borderRadius:12,padding:28,display:"flex",flexDirection:"column",alignItems:"center",gap:16,maxWidth:300,width:"90%"}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,color:"#e6f1f0"}}>
              {qrLabel}
            </div>
            {qrDataUrl && <img src={qrDataUrl} alt="QR Code" style={{width:200,height:200,borderRadius:8}}/>}
            <div style={{fontSize:11,color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace",textAlign:"center"}}>{qrUrlLabel}</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={downloadQr} className="btn-primary" style={{padding:"9px 20px",fontSize:13}}>
                {lang==="PT"?"Baixar":"Download"}
              </button>
              <button onClick={function(){setQrModal(false);}} className="btn-ghost" style={{padding:"9px 20px",fontSize:13}}>
                {lang==="PT"?"Fechar":"Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-tab toolbars */}

      {/* TABS 1 & 2 — New Believer + Start Class */}
      {(view === "new_believer" || view === "start_class") && (
        <div style={{marginBottom:4}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
            <button
              onClick={function(){
                var msgPT = "Oi! Gostaria de te convidar para preencher o formulario de Batismo da Lagoinha Tampa: " + BAPTISM_URL;
                var msgEN = "Hi! I would like to invite you to fill out the Baptism form at Lagoinha Tampa: " + BAPTISM_URL;
                var msgES = "Hola! Me gustaria invitarte a completar el formulario de Bautismo de Lagoinha Tampa: " + BAPTISM_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Formulario de Batismo":lang==="ES"?"Compartir Formulario de Bautismo":"Share Baptism Form"}
            </button>
            <button
              onClick={function(){ openQrModal(BAPTISM_URL, lang==="PT"?"QR Code - Formulario de Batismo":lang==="ES"?"QR Code - Formulario de Bautismo":"QR Code - Baptism Form", "lagoinha-batismo-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/baptism-form.html"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
            <button
              onClick={function(){
                var msgPT = "Oi! Gostaria de te convidar para preencher o formulario do Cafe de Novos Membros da Lagoinha Tampa: " + CAFE_URL;
                var msgEN = "Hi! I would like to invite you to fill out the New Members Cafe form at Lagoinha Tampa: " + CAFE_URL;
                var msgES = "Hola! Me gustaria invitarte a completar el formulario del Cafe de Nuevos Miembros de Lagoinha Tampa: " + CAFE_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Formulario do Cafe":lang==="ES"?"Compartir Formulario del Cafe":"Share Cafe Form"}
            </button>
            <button
              onClick={function(){ openQrModal(CAFE_URL, lang==="PT"?"QR Code - Formulario do Cafe":lang==="ES"?"QR Code - Formulario del Cafe":"QR Code - Cafe Form", "lagoinha-cafe-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/cafe-form.html"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
          </div>
          <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
            style={{padding:"9px 14px",width:"100%",marginBottom:10}}/>
          {/* Language tally chips */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
            {[{key:"Portugues",flag:"🇧🇷",label:"Portugues"},{key:"English",flag:"🇺🇸",label:"English"},{key:"Espanol",flag:"🌐",label:"Espanol"}].map(function(lo){
              var count = currentPool.filter(function(p){ return parseJSON(p.languages_spoken).includes(lo.key); }).length;
              var active = langFilter === lo.key;
              return (
                <button key={lo.key}
                  onClick={function(){ setLangFilter(active ? null : lo.key); }}
                  style={{fontSize:12,padding:"5px 14px",borderRadius:999,cursor:"pointer",fontWeight:600,transition:"all 0.15s",
                    background:active?"#2ABFBF":"transparent",color:active?"#0a1a1a":"#6b7a82",
                    border:active?"1px solid #2ABFBF":"1px solid rgba(255,255,255,0.12)"}}>
                  {lo.flag} {lo.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3 — Baptism */}
      {view === "baptism" && (
        <div style={{marginBottom:4}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
            <button
              onClick={function(){
                var msgPT = "Oi! Gostaria de te convidar para preencher o formulario do Cafe de Novos Membros da Lagoinha Tampa: " + CAFE_URL;
                var msgEN = "Hi! I would like to invite you to fill out the New Members Cafe form at Lagoinha Tampa: " + CAFE_URL;
                var msgES = "Hola! Me gustaria invitarte a completar el formulario del Cafe de Nuevos Miembros de Lagoinha Tampa: " + CAFE_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Formulario do Cafe":lang==="ES"?"Compartir Formulario del Cafe":"Share Cafe Form"}
            </button>
            <button
              onClick={function(){ openQrModal(CAFE_URL, lang==="PT"?"QR Code - Formulario do Cafe":lang==="ES"?"QR Code - Formulario del Cafe":"QR Code - Cafe Form", "lagoinha-cafe-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/cafe-form.html"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
            <button
              onClick={function(){
                var msgPT = "Oi! Tudo bem? Gostaria de te convidar para fazer uma avaliacao rapida de dons ministeriais aqui na Lagoinha Tampa. Leva poucos minutos e vai te ajudar a descobrir como voce pode servir. Acesse aqui: " + ASSESSMENT_URL;
                var msgEN = "Hi! How are you doing? I would love to invite you to take a quick ministry gifting assessment here at Lagoinha Tampa. It only takes a few minutes and will help you discover how you can serve. Access it here: " + ASSESSMENT_URL;
                var msgES = "Hola! Me gustaria invitarte a hacer una evaluacion rapida de dones ministeriales aqui en Lagoinha Tampa. Solo toma unos minutos. Accede aqui: " + ASSESSMENT_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Avaliacao":lang==="ES"?"Compartir Evaluacion":"Share Assessment"}
            </button>
            <button
              onClick={function(){ openQrModal(ASSESSMENT_URL, lang==="PT"?"QR Code da Avaliacao":lang==="ES"?"QR Code de la Evaluacion":"Assessment QR Code", "lagoinha-tampa-avaliacao-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
          </div>
          <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
            style={{padding:"9px 14px",width:"100%",marginBottom:10}}/>
          {/* Language tally chips */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
            {[{key:"Portugues",flag:"🇧🇷",label:"Portugues"},{key:"English",flag:"🇺🇸",label:"English"},{key:"Espanol",flag:"🌐",label:"Espanol"}].map(function(lo){
              var count = currentPool.filter(function(p){ return parseJSON(p.languages_spoken).includes(lo.key); }).length;
              var active = langFilter === lo.key;
              return (
                <button key={lo.key}
                  onClick={function(){ setLangFilter(active ? null : lo.key); }}
                  style={{fontSize:12,padding:"5px 14px",borderRadius:999,cursor:"pointer",fontWeight:600,transition:"all 0.15s",
                    background:active?"#2ABFBF":"transparent",color:active?"#0a1a1a":"#6b7a82",
                    border:active?"1px solid #2ABFBF":"1px solid rgba(255,255,255,0.12)"}}>
                  {lo.flag} {lo.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4 — New Members Cafe */}
      {view === "cafe" && (
        <div style={{marginBottom:4}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
            <button
              onClick={function(){
                var msgPT = "Oi! Gostaria de te convidar para preencher o formulario de Batismo da Lagoinha Tampa: " + BAPTISM_URL;
                var msgEN = "Hi! I would like to invite you to fill out the Baptism form at Lagoinha Tampa: " + BAPTISM_URL;
                var msgES = "Hola! Me gustaria invitarte a completar el formulario de Bautismo de Lagoinha Tampa: " + BAPTISM_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Formulario de Batismo":lang==="ES"?"Compartir Formulario de Bautismo":"Share Baptism Form"}
            </button>
            <button
              onClick={function(){ openQrModal(BAPTISM_URL, lang==="PT"?"QR Code - Formulario de Batismo":lang==="ES"?"QR Code - Formulario de Bautismo":"QR Code - Baptism Form", "lagoinha-batismo-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/baptism-form.html"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
            <button
              onClick={function(){
                var msgPT = "Oi! Tudo bem? Gostaria de te convidar para fazer uma avaliacao rapida de dons ministeriais aqui na Lagoinha Tampa. Leva poucos minutos e vai te ajudar a descobrir como voce pode servir. Acesse aqui: " + ASSESSMENT_URL;
                var msgEN = "Hi! How are you doing? I would love to invite you to take a quick ministry gifting assessment here at Lagoinha Tampa. It only takes a few minutes and will help you discover how you can serve. Access it here: " + ASSESSMENT_URL;
                var msgES = "Hola! Me gustaria invitarte a hacer una evaluacion rapida de dones ministeriales aqui en Lagoinha Tampa. Solo toma unos minutos. Accede aqui: " + ASSESSMENT_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Avaliacao":lang==="ES"?"Compartir Evaluacion":"Share Assessment"}
            </button>
            <button
              onClick={function(){ openQrModal(ASSESSMENT_URL, lang==="PT"?"QR Code da Avaliacao":lang==="ES"?"QR Code de la Evaluacion":"Assessment QR Code", "lagoinha-tampa-avaliacao-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
          </div>
          <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
            style={{padding:"9px 14px",width:"100%",marginBottom:10}}/>
          {/* Language tally chips */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
            {[{key:"Portugues",flag:"🇧🇷",label:"Portugues"},{key:"English",flag:"🇺🇸",label:"English"},{key:"Espanol",flag:"🌐",label:"Espanol"}].map(function(lo){
              var count = currentPool.filter(function(p){ return parseJSON(p.languages_spoken).includes(lo.key); }).length;
              var active = langFilter === lo.key;
              return (
                <button key={lo.key}
                  onClick={function(){ setLangFilter(active ? null : lo.key); }}
                  style={{fontSize:12,padding:"5px 14px",borderRadius:999,cursor:"pointer",fontWeight:600,transition:"all 0.15s",
                    background:active?"#2ABFBF":"transparent",color:active?"#0a1a1a":"#6b7a82",
                    border:active?"1px solid #2ABFBF":"1px solid rgba(255,255,255,0.12)"}}>
                  {lo.flag} {lo.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB — Not Yet Serving (Baptism + Cafe + Assessment share, search, language chips) */}
      {view === "not_yet_serving" && (
        <div style={{marginBottom:4}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
            <button
              onClick={function(){
                var msgPT = "Oi! Gostaria de te convidar para preencher o formulario de Batismo da Lagoinha Tampa: " + BAPTISM_URL;
                var msgEN = "Hi! I would like to invite you to fill out the Baptism form at Lagoinha Tampa: " + BAPTISM_URL;
                var msgES = "Hola! Me gustaria invitarte a completar el formulario de Bautismo de Lagoinha Tampa: " + BAPTISM_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Formulario de Batismo":lang==="ES"?"Compartir Formulario de Bautismo":"Share Baptism Form"}
            </button>
            <button
              onClick={function(){ openQrModal(BAPTISM_URL, lang==="PT"?"QR Code - Formulario de Batismo":lang==="ES"?"QR Code - Formulario de Bautismo":"QR Code - Baptism Form", "lagoinha-batismo-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/baptism-form.html"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
            <button
              onClick={function(){
                var msgPT = "Oi! Gostaria de te convidar para preencher o formulario do Cafe de Novos Membros da Lagoinha Tampa: " + CAFE_URL;
                var msgEN = "Hi! I would like to invite you to fill out the New Members Cafe form at Lagoinha Tampa: " + CAFE_URL;
                var msgES = "Hola! Me gustaria invitarte a completar el formulario del Cafe de Nuevos Miembros de Lagoinha Tampa: " + CAFE_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Formulario do Cafe":lang==="ES"?"Compartir Formulario del Cafe":"Share Cafe Form"}
            </button>
            <button
              onClick={function(){ openQrModal(CAFE_URL, lang==="PT"?"QR Code - Formulario do Cafe":lang==="ES"?"QR Code - Formulario del Cafe":"QR Code - Cafe Form", "lagoinha-cafe-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/cafe-form.html"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
            <button
              onClick={function(){
                var msgPT = "Oi! Tudo bem? Gostaria de te convidar para fazer uma avaliacao rapida de dons ministeriais aqui na Lagoinha Tampa. Leva poucos minutos e vai te ajudar a descobrir como voce pode servir. Acesse aqui: " + ASSESSMENT_URL;
                var msgEN = "Hi! How are you doing? I would love to invite you to take a quick ministry gifting assessment here at Lagoinha Tampa. It only takes a few minutes and will help you discover how you can serve. Access it here: " + ASSESSMENT_URL;
                var msgES = "Hola! Me gustaria invitarte a hacer una evaluacion rapida de dones ministeriales aqui en Lagoinha Tampa. Solo toma unos minutos. Accede aqui: " + ASSESSMENT_URL;
                var msg = lang==="PT"?msgPT:lang==="ES"?msgES:msgEN;
                window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Avaliacao":lang==="ES"?"Compartir Evaluacion":"Share Assessment"}
            </button>
            <button
              onClick={function(){ openQrModal(ASSESSMENT_URL, lang==="PT"?"QR Code da Avaliacao":lang==="ES"?"QR Code de la Evaluacion":"Assessment QR Code", "lagoinha-tampa-avaliacao-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="12" y="1" width="7" height="7" rx="1"/><rect x="1" y="12" width="7" height="7" rx="1"/><rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/><rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/><line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/><line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/></svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
          </div>
          <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
            style={{padding:"9px 14px",width:"100%",marginBottom:10}}/>
          {/* Language tally chips */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
            {[{key:"Portugues",flag:"🇧🇷",label:"Portugues"},{key:"English",flag:"🇺🇸",label:"English"},{key:"Espanol",flag:"🌐",label:"Espanol"}].map(function(lo){
              var count = currentPool.filter(function(p){ return parseJSON(p.languages_spoken).includes(lo.key); }).length;
              var active = langFilter === lo.key;
              return (
                <button key={lo.key}
                  onClick={function(){ setLangFilter(active ? null : lo.key); }}
                  style={{fontSize:12,padding:"5px 14px",borderRadius:999,cursor:"pointer",fontWeight:600,transition:"all 0.15s",
                    background:active?"#2ABFBF":"transparent",color:active?"#0a1a1a":"#6b7a82",
                    border:active?"1px solid #2ABFBF":"1px solid rgba(255,255,255,0.12)"}}>
                  {lo.flag} {lo.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5 — Volunteers (Active) — UNCHANGED */}
      {view === "active" && (
        <div style={{marginBottom:4}}>
          <div style={{marginBottom:14,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <button
              onClick={function(){
                var msgPT = "Oi! Tudo bem? Gostaria de te convidar para fazer uma avaliacao rapida de dons ministeriais aqui na Lagoinha Tampa. Leva poucos minutos e vai te ajudar a descobrir como voce pode servir. Acesse aqui: " + ASSESSMENT_URL;
                var msgEN = "Hi! How are you doing? I would love to invite you to take a quick ministry gifting assessment here at Lagoinha Tampa. It only takes a few minutes and will help you discover how you can serve. Access it here: " + ASSESSMENT_URL;
                var msg = lang === "PT" ? msgPT : msgEN;
                window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
              }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",
                background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",
                cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              {"↗ "}{lang==="PT"?"Compartilhar Avaliacao":"Share Assessment"}
            </button>
            <button
              onClick={function(){ openQrModal(ASSESSMENT_URL, lang==="PT"?"QR Code da Avaliacao":"Assessment QR Code", "lagoinha-tampa-avaliacao-qr.png", "farfromtimnah-hue.github.io/ministry-gifting/"); }}
              style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,padding:"8px 16px",
                background:"transparent",border:"1px solid #2ABFBF",borderRadius:8,color:"#2ABFBF",
                cursor:"pointer",fontWeight:500,transition:"all 0.18s"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#2ABFBF" strokeWidth="1.8">
                <rect x="1" y="1" width="7" height="7" rx="1"/>
                <rect x="12" y="1" width="7" height="7" rx="1"/>
                <rect x="1" y="12" width="7" height="7" rx="1"/>
                <rect x="3" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/>
                <rect x="14" y="3" width="3" height="3" fill="#2ABFBF" stroke="none"/>
                <rect x="3" y="14" width="3" height="3" fill="#2ABFBF" stroke="none"/>
                <line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round"/>
                <line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" strokeLinecap="round"/>
                <line x1="19" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"/>
                <line x1="16" y1="16" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/>
                <line x1="19" y1="16" x2="19" y2="19" strokeWidth="3" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="16" y2="19" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              {lang==="PT"?"Baixar QR Code":"Download QR Code"}
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr repeat(5,auto)",gap:10,marginBottom:12,alignItems:"center"}}>
            <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
              style={{padding:"9px 14px"}}/>
            <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={{padding:"9px 12px"}}>
              {["All",...activeStages].map(o=><option key={o} value={o}>{o==="All"?t.allStages:(STAGE_LABEL[lang||"PT"]||STAGE_LABEL.PT)[o]||o}</option>)}
            </select>
            {[
              {label:t.allGiftings,val:filterGifting,set:setFilterGifting,opts:["All",...GIFTINGS],
                disp:o=>lang==="PT"?GIFTING_PT[o]||o:o},
              {label:t.allLanguages,val:filterLang,set:setFilterLang,opts:["All",...LANGUAGES],
                disp:o=>(LANGUAGE_DISPLAY[lang]||LANGUAGE_DISPLAY.EN)[o]||o},
              {label:t.allGroups,val:filterGroup,set:setFilterGroup,opts:["All",...SPECIAL_GROUPS],
                disp:o=>lang==="PT"?SPECIAL_GROUP_PT[o]||o:o},
              {label:t.allPastors,val:filterPastor,set:setFilterPastor,opts:pastorOptions,
                disp:o=>o},
            ].map(({label,val,set,opts,disp})=>(
              <select key={label} value={val} onChange={e=>set(e.target.value)} style={{padding:"9px 12px"}}>
                {opts.map(o=><option key={o} value={o}>{o==="All"?label:disp(o)}</option>)}
              </select>
            ))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#475a64",letterSpacing:"0.12em",textTransform:"uppercase",marginRight:2}}>{lang==="PT"?"Tipo":"Type"}</span>
            {[
              {val:"Pastors", labelPT:"Pastores", labelEN:"Pastors"},
              {val:"Leaders", labelPT:"Lideres", labelEN:"Leaders"},
              {val:"Congregation", labelPT:"Congregacao", labelEN:"Congregation"}
            ].map(function(chip){
              var active = filterType === chip.val;
              return (
                <button key={chip.val}
                  onClick={function(){ setFilterType(active ? "All" : chip.val); }}
                  style={{fontSize:11,padding:"4px 12px",borderRadius:999,cursor:"pointer",transition:"all 0.15s",fontWeight:600,
                    background:active?"#2ABFBF":"transparent",
                    color:active?"#0a1a1a":"#6b7a82",
                    border:active?"1px solid #2ABFBF":"1px solid rgba(255,255,255,0.12)"}}>
                  {lang==="PT"?chip.labelPT:chip.labelEN}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6 — Placed */}
      {view === "placed" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr repeat(3,auto)",gap:10,marginBottom:12,alignItems:"center"}}>
          <input placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}
            style={{padding:"9px 14px"}}/>
          {[
            {label:t.allGiftings,val:filterGifting,set:setFilterGifting,opts:["All",...GIFTINGS],
              disp:o=>lang==="PT"?GIFTING_PT[o]||o:o},
            {label:t.allLanguages,val:filterLang,set:setFilterLang,opts:["All",...LANGUAGES],
              disp:o=>(LANGUAGE_DISPLAY[lang]||LANGUAGE_DISPLAY.EN)[o]||o},
            {label:t.allGroups,val:filterGroup,set:setFilterGroup,opts:["All",...SPECIAL_GROUPS],
              disp:o=>lang==="PT"?SPECIAL_GROUP_PT[o]||o:o},
          ].map(({label,val,set,opts,disp})=>(
            <select key={label} value={val} onChange={e=>set(e.target.value)} style={{padding:"9px 12px"}}>
              {opts.map(o=><option key={o} value={o}>{o==="All"?label:disp(o)}</option>)}
            </select>
          ))}
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#475a64"}}>{filtered.length} / {currentPool.length}</div>
          {(fbUser && fbUser.displayName) && (
            <button
              onClick={()=>setMyPeopleOnly(v=>!v)}
              style={{fontSize:11,padding:"4px 12px",borderRadius:999,cursor:"pointer",transition:"all 0.15s",fontWeight:600,
                background:myPeopleOnly?"#2ABFBF":"transparent",
                color:myPeopleOnly?"#0a1a1a":"#6b7a82",
                border:myPeopleOnly?"1px solid #2ABFBF":"1px solid rgba(255,255,255,0.12)"}}>
              {lang==="PT"?"Meu Povo":"My People"}
            </button>
          )}
        </div>
        {view === "active" && (
          <button onClick={()=>setShowSplit(true)}
            style={{padding:"7px 14px",background:"rgba(94,234,212,0.08)",border:"1px solid rgba(94,234,212,0.22)",borderRadius:8,color:"#5eead4",fontSize:11,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.18s"}}>
            {"⚡ "}{lang==="PT"?"Distribuir Pessoas":"Split Assignments"}
          </button>
        )}
        {view === "placed" && currentPool.length > 0 && (
          <div style={{fontSize:12,color:"#5eead4"}}>{"🏠 "}{lang==="PT" ? `${currentPool.length} pessoa${currentPool.length!==1?"s":""} colocada${currentPool.length!==1?"s":""}` : `${currentPool.length} person${currentPool.length!==1?"s":""} placed`}</div>
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
              {t.cancel}
            </button>
          </div>
          {splitDone && <div style={{marginTop:12,fontSize:12,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace"}}>{splitDone}</div>}
        </div>
      )}

      {/* Cards grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
        {view !== "placed" && filtered.map(p => (
          <PersonCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} templatePT={templatePT} templateEN={templateEN} t={t} lang={lang} />
        ))}
        {view === "placed" && filtered.map(p => (
          <PlacedCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} templatePT={templatePT} templateEN={templateEN} t={t} lang={lang} />
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
        <PersonPanel personId={selectedId} token={token} role={role} onClose={()=>setSelectedId(null)} onUpdated={load} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} onNavigate={onNavigate} fbUser={fbUser} />
      )}
    </div>
  );
}

// ─── GIFTING FILTER TAB ───────────────────────────────────────────
function GiftingTab({ token, role, t, lang, templatePT, templateEN, onNavigate, fbUser }) {
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
    <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:24}}>

      {/* ── Intro strip ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"18px 24px",borderRadius:14,
        background:"linear-gradient(90deg,rgba(94,234,212,0.06),transparent)",
        border:"1px solid rgba(255,255,255,0.04)",
        borderLeft:"2px solid #5eead4"}}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",
            textTransform:"uppercase",color:"#5eead4",marginBottom:6}}>
            {t.selectGifting}
          </div>
          <p style={{margin:0,fontSize:13,color:"#aebac0"}}>
            {lang==="PT"
              ? "Visualize pessoas disponíveis ordenadas por carga ministerial."
              : "See available people sorted by ministry load."}
          </p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#6b7a82"}}>
            {GIFTINGS.length} {lang==="PT" ? "DONS" : "GIFTS"}
          </span>
        </div>
      </div>

      {/* ── Gifting tile grid ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
        {GIFTINGS.map(g => {
          const sel = selectedGifting === g;
          return (
            <button key={g} onClick={()=>setSelectedGifting(g)}
              className={`glass ${sel ? "glow-active" : "glow-hover"}`}
              style={{
                padding:18, textAlign:"left", cursor:"pointer",
                display:"flex", flexDirection:"column", gap:10,
                minHeight:110, position:"relative", overflow:"hidden",
                background:sel?"linear-gradient(180deg,rgba(94,234,212,0.12),rgba(94,234,212,0.04))":undefined,
                border:sel?"1px solid rgba(94,234,212,0.35)":undefined,
                borderRadius:12,
              }}>
              {/* Icon box + label row */}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:10,flexShrink:0,
                  background:"linear-gradient(135deg,rgba(94,234,212,0.16),rgba(94,234,212,0.04))",
                  border:"1px solid rgba(94,234,212,0.12)",
                  display:"grid",placeItems:"center",fontSize:20}}>
                  {GIFTING_ICONS[g]||"◆"}
                </div>
                <span style={{fontSize:13.5,color:"#e6f1f0",fontWeight:500,lineHeight:1.3,flex:1}}>
                  {lang==="PT" ? GIFTING_PT[g]||g : g}
                </span>
              </div>
              {/* Footer */}
              <div style={{marginTop:"auto",display:"flex",justifyContent:"space-between",
                alignItems:"center",paddingTop:8,
                borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",
                  letterSpacing:"0.14em",textTransform:"uppercase",
                  color:sel?"#5eead4":"#475a64"}}>
                  {sel && people.length > 0 ? `${people.length} ${lang==="PT"?"disponíve"+(people.length===1?"l":"is"):"available"}` : lang==="PT"?"Ver pessoas":"View people"}
                </span>
                {sel && <span style={{color:"#5eead4",fontSize:14}}>→</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected gifting results panel ── */}
      {selectedGifting && (
        <div className="glass" style={{padding:24,borderRadius:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",
                textTransform:"uppercase",color:"#6b7a82",marginBottom:8}}>
                {lang==="PT" ? "DISPONÍVEIS PARA" : "AVAILABLE FOR"}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:24}}>{GIFTING_ICONS[selectedGifting]||"◆"}</span>
                <h2 style={{margin:0,fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,
                  color:"#e6f1f0",letterSpacing:"-0.01em"}}>
                  {lang==="PT" ? GIFTING_PT[selectedGifting]||selectedGifting : selectedGifting}
                </h2>
                {!loading && (
                  <span style={{fontSize:11,padding:"4px 10px",borderRadius:999,
                    background:"rgba(94,234,212,0.1)",border:"1px solid rgba(94,234,212,0.25)",
                    color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>
                    {people.length} {lang==="PT"?"pessoa"+(people.length!==1?"s":""):"person"+(people.length!==1?"s":"")}
                  </span>
                )}
              </div>
            </div>
            {!loading && people.length > 0 && (
              <span style={{fontSize:11.5,color:"#6b7a82"}}>
                {lang==="PT" ? "Ordenado por " : "Sorted by "}
                <span style={{color:"#5eead4"}}>{lang==="PT" ? "carga ministerial ↑" : "ministry load ↑"}</span>
              </span>
            )}
          </div>

          {loading ? (
            <div style={{color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:13,padding:"16px 0"}}>
              {t.loading}
            </div>
          ) : people.length === 0 ? (
            <div style={{color:"#475a64",fontSize:13,fontFamily:"'JetBrains Mono',monospace",padding:"16px 0"}}>
              {t.noPeople}
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
              {people.map(p => {
                const pMinistries = parseJSON(p.current_ministries);
                const pLangs = parseJSON(p.languages_spoken);
                const waURL = buildWhatsAppURL(p, templatePT, templateEN, false);
                const initials = (p.name||"?").split(" ").map(n=>n[0]).slice(0,2).join("");
                return (
                  <div key={p.id} onClick={()=>setSelectedId(p.id)}
                    style={{padding:14,borderRadius:10,cursor:"pointer",
                      background:"rgba(255,255,255,0.02)",
                      border:"1px solid rgba(255,255,255,0.04)",
                      display:"flex",alignItems:"center",gap:12,
                      transition:"all 0.18s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(94,234,212,0.04)";e.currentTarget.style.borderColor="rgba(94,234,212,0.18)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(255,255,255,0.04)";}}>
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                    ) : (
                      <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                        background:"rgba(94,234,212,0.1)",border:"1px solid rgba(94,234,212,0.18)",
                        display:"grid",placeItems:"center",
                        fontSize:12,color:"#5eead4",fontWeight:700,
                        fontFamily:"'Space Grotesk',sans-serif"}}>
                        {initials}
                      </div>
                    )}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,color:"#e6f1f0",fontWeight:500,
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {p.name}
                      </div>
                      <div style={{fontSize:11,color:"#6b7a82",marginTop:2}}>
                        {pMinistries.length} {lang==="PT"?"ministério":"ministr"}{lang!=="PT"&&(pMinistries.length!==1?"ies":"y")}
                        {p.assigned_pastor ? ` · ${p.assigned_pastor}` : ""}
                      </div>
                    </div>
                    {waURL && (
                      <button onClick={e=>{e.stopPropagation();window.open(waURL,"_blank");}}
                        style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.25)",
                          color:"#86efac",padding:6,borderRadius:6,cursor:"pointer",
                          display:"grid",placeItems:"center",fontSize:14,flexShrink:0}}>
                        💬
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <PersonPanel personId={selectedId} token={token} role={role} onClose={()=>setSelectedId(null)} onUpdated={()=>load(selectedGifting)} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} onNavigate={onNavigate} fbUser={fbUser} />
      )}
    </div>
  );
}

// ─── MINISTRY HEALTH TAB ──────────────────────────────────────────
const MH_API = 'https://ltc-api.farfromtimnah.workers.dev';
const FORM_LINK = 'https://farfromtimnah-hue.github.io/ministry-gifting/ministry-leader-form.html';

const MH_MINISTRIES = [
  "Worship Team","Sound","Lighting","Projection","Streaming",
  "Photo & Video","Social Media","Service Experience","Consolidation",
  "Translation","Lagoinha Kids","Intercession","Volunteer Coffee",
  "Hospitality - Welcome","Parking","Setup & Teardown",
  "WE CARE","GC Leader",
  "Art Factory","Decoracao","Diaconia","Esportes","Eventos","Geracoes","Lakestore",
];

const MH_DEFAULT_LEADERS = {
  "Worship Team":"Kenia","Sound":"Claudio","Lighting":"Kevin",
  "Projection":"Marjorie","Streaming":"Mauricio","Photo & Video":"Marjorie",
  "Social Media":"Marjorie","Service Experience":"Fabi","Consolidation":"Petito",
  "Translation":"Pastora Paula","Lagoinha Kids":"Babi","Intercession":"Vania",
  "Volunteer Coffee":"Juliana","Hospitality - Welcome":"Fabi","Parking":"Anderson",
  "Setup & Teardown":"Anderson","WE CARE":null,
  "GC Leader":null,
  "Art Factory":null,"Decoracao":null,"Diaconia":null,"Esportes":null,"Eventos":null,"Geracoes":null,"Lakestore":null,
};

const MH_GIFTING_MAP = {
  "Worship Team":"Worship & Music",
  "Sound":"Technical Arts",
  "Lighting":"Technical Arts",
  "Projection":"Technical Arts",
  "Streaming":"Technical Arts",
  "Photo & Video":"Visual Storytelling",
  "Social Media":"Digital Communication",
  "Service Experience":"Hospitality",
  "Consolidation":"Evangelism",
  "Translation":null,
  "Lagoinha Kids":"Gift of Helps",
  "Intercession":"Intercession",
  "Volunteer Coffee":"Gift of Helps",
  "Hospitality - Welcome":"Hospitality",
  "Parking":"Gift of Helps",
  "Setup & Teardown":"Gift of Helps",
  "WE CARE":null,
  "GC Leader":"Influence & Servant Leadership",
  "Art Factory":null,
  "Lakestore":["Gift of Helps","Administration"],
  "Decoracao":"Creativity",
  "Diaconia":["Gift of Helps","Hospitality"],
  "Eventos":"Administration",
  "Esportes":null,
  "Geracoes":null,
};

const MH_MINISTRY_PT = {
  "Worship Team":"Equipe de Louvor",
  "Sound":"Som",
  "Lighting":"Luz",
  "Projection":"Projecao",
  "Streaming":"Transmissao",
  "Photo & Video":"Foto e Video",
  "Social Media":"Midias Sociais",
  "Stage Crew":"Palco",
  "Service Experience":"Experiencia do Culto",
  "Consolidation":"Consolidacao",
  "Translation":"Traducao",
  "Lagoinha Kids":"Lagoinha Kids",
  "Intercession":"Intercessao",
  "Volunteer Coffee":"Cafe dos Voluntarios",
  "Welcome":"Recepcao",
  "Parking":"Estacionamento",
  "Setup & Teardown":"Montagem",
  "WE CARE":"WE CARE",
  "GC Leader":"Lider de GC",
  "Art Factory":"Art Factory",
  "Decoration":"Decoracao",
  "Diaconia":"Diaconia",
  "Esportes":"Esportes",
  "Eventos":"Eventos",
  "Geracoes":"Geracoes",
  "Lakestore":"Lakestore",
};

function mhStatusBadge(total, minCount, idealCount) {
  if (minCount === null || minCount === undefined) return { label:"No Data", color:"#666", bg:"rgba(102,102,102,0.12)" };
  if (total < minCount) return { label:"Critical", color:"#E74C3C", bg:"rgba(231,76,60,0.12)" };
  if (total < idealCount) return { label:"Needs Volunteers", color:"#F39C12", bg:"rgba(243,156,18,0.12)" };
  return { label:"Healthy", color:"#27AE60", bg:"rgba(39,174,96,0.12)" };
}

function mhSortOrder(status) {
  if (status.label === "Critical") return 0;
  if (status.label === "Needs Volunteers") return 1;
  if (status.label === "Healthy") return 2;
  return 3;
}

function mhStatusColor(s) {
  if (s === 'critical') return '#C0392B';
  if (s === 'needs_volunteers') return '#E67E22';
  if (s === 'healthy') return '#27AE60';
  return '#555555';
}

function mhStatusLabel(s, l) {
  if (s === 'critical') return l === 'PT' ? 'CRITICO' : 'CRITICAL';
  if (s === 'needs_volunteers') return l === 'PT' ? 'PRECISA DE VOLUNTARIOS' : 'NEEDS VOLUNTEERS';
  if (s === 'healthy') return l === 'PT' ? 'SAUDAVEL' : 'HEALTHY';
  return l === 'PT' ? 'SEM DADOS' : 'NO DATA';
}

// Filled headcount for a position, null-guarded (form + system reports).
function mhPosFilled(pos) {
  if (!pos) return 0;
  return (pos.actual_count_form || 0) + (pos.actual_count_system || 0);
}

// Per-position status from raw counts. Thresholds (per spec):
//   green  (healthy)          -> filled >= ideal
//   amber  (needs_volunteers) -> filled >= min
//   red    (critical)         -> filled < min
// Returns 'no_data' only when a position has no min, no ideal and nobody filled.
function mhPosStatus(filled, min, ideal) {
  var f = filled || 0;
  var hasMin = (min || 0) > 0;
  var hasIdeal = (ideal || 0) > 0;
  if (!hasMin && !hasIdeal && f === 0) return 'no_data';
  if (hasIdeal && f >= ideal) return 'healthy';
  if (hasMin && f >= min) return 'needs_volunteers';
  return 'critical';
}

// Card-level status = the WORST position status on the card (NOT an average).
// One critical position turns the whole card critical regardless of headcount.
function mhWorstStatus(positions) {
  var order = { critical: 0, needs_volunteers: 1, healthy: 2, no_data: 3 };
  var worst = 'no_data';
  (positions || []).forEach(function(p) {
    var st = mhPosStatus(mhPosFilled(p), p && p.min_count, p && p.ideal_count);
    if (order[st] < order[worst]) worst = st;
  });
  return worst;
}

function SurveyModal({ ministry, token, lang, onClose }) {
  var [rows, setRows] = useState([]);
  useEffect(function() {
    fetch(MH_API + '/ministry-health', { headers: { Authorization: 'Bearer ' + token } })
      .then(function(r) { return r.json(); })
      .catch(function() { return []; });
    // For now just show a coming soon — full survey row fetch not implemented
    setRows([]);
  }, []);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={onClose}>
      <div style={{background:"#08121a",border:"1px solid rgba(94,234,212,0.18)",borderRadius:16,padding:32,maxWidth:540,width:"90%",maxHeight:"80vh",overflow:"auto"}}
        onClick={function(e){e.stopPropagation();}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:"#e6f1f0"}}>
            {lang==="PT" ? "Resultados da Pesquisa" : "Survey Results"} - {ministry}
          </h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7a82",cursor:"pointer",fontSize:18}}>x</button>
        </div>
        <p style={{color:"#6b7a82",fontSize:13}}>
          {lang==="PT" ? "Nenhum resultado ainda." : "No results yet."}
        </p>
      </div>
    </div>
  );
}

function MinistryModal({ card, lang, role, token, fbUser, posAlerts, onClose, onSaved, onNavigateToML }) {
  var isOwnerRole = role === 'owner';
  var isPastorRole = role === 'pastor' || role === 'senior_pastor' || role === 'owner';
  var ministryKey = (card && card.ministry) || '';
  var ptName = MH_MINISTRY_PT[ministryKey] || ministryKey;
  var displayName = lang === 'PT' ? ptName : ministryKey;
  // Step 3: every .map() guards the array first; every access is null-safe.
  var positions = (card && card.positions) || [];
  var worst = mhWorstStatus(positions);
  var sc = mhStatusColor(worst);
  var sl = mhStatusLabel(worst, lang);
  var leaderName = (card && card.leader_name) || MH_DEFAULT_LEADERS[ministryKey] || null;
  var leaderPhone = (card && card.leader_whatsapp) ? String(card.leader_whatsapp).replace(/\D/g, '') : '';
  var alertNote = (posAlerts && posAlerts[ministryKey]) || null;

  var seedNotes = Array.isArray(card && card.notes) ? card.notes : [];
  var [noteList, setNoteList] = useState(seedNotes);
  var [noteText, setNoteText] = useState('');
  var [savingNote, setSavingNote] = useState(false);

  // Newest first (ISO timestamps sort lexicographically = chronologically).
  var sortedNotes = (Array.isArray(noteList) ? noteList.slice() : []).sort(function(a, b) {
    return String((b && b.created_at) || '').localeCompare(String((a && a.created_at) || ''));
  });

  function addMinistryNote() {
    var text = noteText.trim();
    if (!text) return;
    setSavingNote(true);
    // Auto-stamp the author from Firebase — never ask the pastor to type their name.
    var authorName = (fbUser && fbUser.displayName) ? fbUser.displayName
      : (fbUser && fbUser.email) ? fbUser.email : 'Pastor';
    var optimistic = { id: 'tmp-' + Date.now(), author_name: authorName, note_text: text, created_at: new Date().toISOString() };
    fetch(MH_API + '/ministry-health/' + encodeURIComponent(ministryKey) + '/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ author_name: authorName, note_text: text }),
    }).then(function(res) {
      // On success, refresh the parent ministry-health data so the persisted note
      // survives close/reopen (the modal re-seeds from mhList, not local state).
      if (res && res.ok && typeof onSaved === 'function') onSaved();
    }).catch(function() {}).finally(function() { setSavingNote(false); });
    setNoteList(function(prev) { return [optimistic].concat(Array.isArray(prev) ? prev : []); });
    setNoteText('');
  }

  var sectionLabel = {fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:'0.14em',
    textTransform:'uppercase',color:'#6b7a82',marginBottom:12};

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',zIndex:100,
      display:'flex',alignItems:'flex-start',justifyContent:'center',overflowY:'auto',padding:'40px 16px 60px'}}
      onClick={onClose}>
      <div style={{background:'#08121a',border:'1px solid rgba(94,234,212,0.15)',borderRadius:16,
        width:'100%',maxWidth:640,padding:'28px 32px',position:'relative',flexShrink:0}}
        onClick={function(e){e.stopPropagation();}}>

        {/* SECTION 1 — Header: name + worst-status badge + close */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',flex:1,minWidth:0}}>
            <h2 style={{margin:0,fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:'#e6f1f0'}}>
              {displayName}
            </h2>
            <span style={{fontSize:10,padding:'3px 10px',background:sc+'22',color:sc,
              borderRadius:999,fontWeight:700,whiteSpace:'nowrap',border:'1px solid '+sc+'44',
              fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.06em'}}>
              {sl}
            </span>
          </div>
          <button onClick={onClose}
            style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',
              color:'#aebac0',cursor:'pointer',fontSize:12,fontWeight:600,borderRadius:7,
              padding:'6px 14px',flexShrink:0,fontFamily:'inherit'}}>
            {lang==='PT'?'Fechar':'Close'}
          </button>
        </div>

        {/* SECTION 2 — Per-Position Breakdown */}
        <div style={{marginBottom:24}}>
          <div style={sectionLabel}>{lang==='PT'?'Saude por Funcao':'Position Health'}</div>
          <div style={{display:'flex',flexDirection:'column'}}>
            {positions.length === 0 && (
              <div style={{fontSize:13,color:'#475a64'}}>{lang==='PT'?'Sem funcoes cadastradas':'No positions on file'}</div>
            )}
            {positions.map(function(pos, pi) {
              var filled = mhPosFilled(pos);
              var minC = (pos && pos.min_count) || 0;
              var idealC = (pos && pos.ideal_count) || 0;
              var pc = mhStatusColor(mhPosStatus(filled, minC, idealC));
              // Never divide by 0 — denominator fallback: ideal -> min -> 1.
              var denom = idealC > 0 ? idealC : (minC > 0 ? minC : 1);
              var pct = Math.min(filled / denom, 1);
              var posName = (lang === 'PT' ? (pos && pos.position_name_pt) : (pos && pos.position_name))
                || (pos && pos.position_name) || (lang==='PT'?'Funcao':'Position');
              return (
                <div key={(pos && pos.position_name) || pi}
                  style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,gap:10}}>
                    <span style={{fontSize:13,color:'#e6f1f0',fontWeight:500,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{posName}</span>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span style={{fontSize:11,color:'#aebac0',fontFamily:"'JetBrains Mono',monospace",whiteSpace:'nowrap'}}>{filled}/{minC}</span>
                      <span style={{width:8,height:8,borderRadius:'50%',background:pc,display:'inline-block',flexShrink:0}}/>
                    </div>
                  </div>
                  <div style={{height:8,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',width:(pct*100)+'%',background:pc,borderRadius:4,transition:'width 0.3s'}}/>
                  </div>
                </div>
              );
            })}
          </div>
          {isOwnerRole && alertNote && (
            <div style={{marginTop:14,padding:'10px 14px',borderRadius:8,
              background:'rgba(230,126,34,0.1)',border:'1px solid rgba(230,126,34,0.25)'}}>
              <span style={{color:'#E67E22',fontSize:12,fontWeight:600}}>
                {lang==='PT'?'Lider reportou funcoes nao listadas: ':'Leader reported unlisted roles: '}
              </span>
              <span style={{color:'#aebac0',fontSize:12}}>{alertNote}</span>
            </div>
          )}
        </div>

        {/* SECTION 3 — Contact leader (only if a phone number exists) */}
        <div style={{marginBottom:24}}>
          <div style={sectionLabel}>{lang==='PT'?'Lider do Ministerio':'Ministry Leader'}</div>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <span style={{fontSize:13,color:leaderName?'#aebac0':'#475a64'}}>
              {leaderName||(lang==='PT'?'Lider nao definido':'Leader not set')}
            </span>
            {leaderPhone && (
              <a href={'https://wa.me/'+leaderPhone} target="_blank" rel="noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,padding:"7px 14px",
                  background:"linear-gradient(180deg,rgba(34,197,94,0.18),rgba(34,197,94,0.08))",color:"#86efac",
                  borderRadius:8,border:"1px solid rgba(34,197,94,0.3)",textDecoration:"none",fontWeight:500}}>
                💬 {lang==='PT'?'Contatar lider':'Contact leader'}
              </a>
            )}
            {typeof onNavigateToML === 'function' && (
              <button onClick={onNavigateToML}
                style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,padding:"7px 14px",
                  background:"linear-gradient(180deg,rgba(94,234,212,0.14),rgba(94,234,212,0.06))",color:"#5eead4",
                  borderRadius:8,border:"1px solid rgba(94,234,212,0.28)",cursor:"pointer",fontWeight:500,
                  fontFamily:"inherit"}}>
                ↗ {lang==='PT'?'Ver Visao do Lider':'View Leader Dashboard'}
              </button>
            )}
          </div>
        </div>

        {/* SECTION 4 — Notes (auto-stamped from Firebase) */}
        <div style={{marginBottom:24}}>
          <div style={sectionLabel}>{lang==='PT'?'Notas':'Notes'}</div>
          {isPastorRole && (
            <div style={{marginBottom:16}}>
              <textarea
                value={noteText}
                placeholder={lang==='PT'?'Escrever uma nota sobre este ministerio...':'Write a note about this ministry...'}
                onChange={function(e){ setNoteText(e.target.value); }}
                rows={3}
                style={{width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#e6f1f0',
                  fontSize:13,padding:'10px 12px',resize:'vertical',fontFamily:'inherit',outline:'none'}} />
              <button onClick={addMinistryNote} disabled={savingNote||!noteText.trim()}
                className={noteText.trim()?'btn-primary':'btn-ghost'}
                style={{marginTop:8,padding:'9px 20px',opacity:noteText.trim()?1:0.45,cursor:noteText.trim()?'pointer':'default'}}>
                {lang==='PT'?'Salvar nota':'Save note'}
              </button>
            </div>
          )}
          {sortedNotes.map(function(note, ni) {
            return (
              <div key={(note && note.id) || ni} style={{borderLeft:'2px solid rgba(94,234,212,0.2)',paddingLeft:14,marginBottom:16}}>
                <div style={{display:'flex',gap:8,marginBottom:4,alignItems:'center',flexWrap:'wrap'}}>
                  <span style={{fontSize:12,fontWeight:700,color:'#5eead4'}}>{(note && note.author_name) || 'Pastor'}</span>
                  <span style={{fontSize:11,color:'#475a64'}}>{formatNoteDate(note && note.created_at, lang)}</span>
                </div>
                <div style={{fontSize:13,color:'#e6f1f0',lineHeight:1.6}}>{(note && note.note_text) || ''}</div>
              </div>
            );
          })}
          {sortedNotes.length === 0 && (
            <div style={{fontSize:13,color:'#475a64'}}>{lang==='PT'?'Nenhuma nota ainda':'No notes yet'}</div>
          )}
        </div>

        {/* SECTION 5 — Profile synthesis placeholder */}
        <div style={{paddingTop:18,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div style={sectionLabel}>{lang==='PT'?'Resumo do Ministerio':'Ministry Summary'}</div>
          <div style={{fontSize:13,color:'#475a64',fontStyle:'italic'}}>
            {lang==='PT'?'Em breve':'Coming soon'}
          </div>
        </div>

      </div>
    </div>
  );
}

function MinistryHealthTab({ token, role, t, lang, fbUser, onNavigateToML, userGrants }) {
  var [mhList, setMhList] = useState([]);
  var [loading, setLoading] = useState(true);
  var [modalMinistry, setModalMinistry] = useState(null);
  var [posAlerts, setPosAlerts] = useState({});
  var [posAlertRows, setPosAlertRows] = useState([]);
  var [showPosAlerts, setShowPosAlerts] = useState(false);
  var [surveyModal, setSurveyModal] = useState(null);
  var [otherFlags, setOtherFlags] = useState([]);
  var [showOtherFlags, setShowOtherFlags] = useState(false);
  var [csvRows, setCsvRows] = useState(null);
  var [csvMapping, setCsvMapping] = useState({});
  var [csvHeaders, setCsvHeaders] = useState([]);
  var [csvImporting, setCsvImporting] = useState(false);
  var [csvMsg, setCsvMsg] = useState(null);

  var isOwnerRole = role === 'owner';
  var isPastorRole = role === 'pastor' || role === 'senior_pastor' || role === 'owner';

  function loadMH() {
    setLoading(true);
    fetch(MH_API + '/ministry-health', { headers: { Authorization: 'Bearer ' + token } })
      .then(function(r) { return r.json(); })
      .then(function(list) {
        setMhList(Array.isArray(list) ? list : []);
      })
      .catch(function() { setMhList([]); })
      .finally(function() { setLoading(false); });

    if (isOwnerRole) {
      fetch(MH_API + '/ministry-positions-alert', { headers: { Authorization: 'Bearer ' + token } })
        .then(function(r) { return r.json(); })
        .then(function(rows) {
          var list = Array.isArray(rows) ? rows : [];
          var map = {};
          list.forEach(function(row) {
            if (row && row.ministry && !map[row.ministry]) map[row.ministry] = row.custom_positions_notes;
          });
          setPosAlerts(map);
          setPosAlertRows(list);
        })
        .catch(function() { setPosAlertRows([]); });
    }
  }

  useEffect(function() { loadMH(); }, []);

  function parseCSV(text) {
    var lines = text.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };
    var headers = lines[0].split(',').map(function(h) { return h.trim().replace(/^"|"$/g,''); });
    var rows = lines.slice(1).map(function(line) {
      var cols = line.split(',').map(function(c) { return c.trim().replace(/^"|"$/g,''); });
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = cols[i] || ''; });
      return obj;
    });
    return { headers: headers, rows: rows };
  }

  function handleCSVFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var parsed = parseCSV(ev.target.result);
      setCsvHeaders(parsed.headers);
      setCsvRows(parsed.rows);
      var mapping = {};
      parsed.headers.forEach(function(h) { mapping[h] = 'ignore'; });
      setCsvMapping(mapping);
      setCsvMsg(null);
    };
    reader.readAsText(file);
  }

  function handleCSVImport() {
    if (!csvRows) return;
    setCsvImporting(true);
    var items = csvRows.map(function(row) {
      var item = {};
      Object.keys(csvMapping).forEach(function(col) {
        var target = csvMapping[col];
        if (target !== 'ignore') item[target] = row[col];
      });
      return item;
    }).filter(function(item) { return item.ministry_name; });

    fetch(MH_API + '/ministry-health/survey-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(items),
    })
      .then(function(r) { return r.json(); })
      .then(function() {
        var mSet = new Set(items.map(function(i) { return i.ministry_name; }));
        setCsvMsg(lang==="PT"
          ? items.length + ' respostas importadas para ' + mSet.size + ' ministerio(s)'
          : items.length + ' responses imported for ' + mSet.size + ' ministr' + (mSet.size===1?'y':'ies'));
        setCsvRows(null); setCsvHeaders([]); setCsvMapping({});
        loadMH();
      })
      .catch(function() { setCsvMsg(lang==="PT"?"Erro ao importar":"Import error"); })
      .finally(function() { setCsvImporting(false); });
  }

  // Counts use the same worst-position logic as the cards so they stay in sync.
  var healthy = mhList.filter(function(c) { return mhWorstStatus(c && c.positions) === 'healthy'; }).length;
  var needs = mhList.filter(function(c) { return mhWorstStatus(c && c.positions) === 'needs_volunteers'; }).length;
  var critical = mhList.filter(function(c) { return mhWorstStatus(c && c.positions) === 'critical'; }).length;

  var whatsappTemplatePT = 'Oi! Tudo bem? Preparei um formulario rapido sobre o seu ministerio e seria muito valioso ter a sua visao. Leva menos de 1 minuto. ' + FORM_LINK;
  var whatsappTemplateEN = 'Hi! How are you doing? I put together a quick form about your ministry and your input would mean a lot. It takes less than a minute. ' + FORM_LINK;
  var sendFormMsg = lang === 'PT' ? whatsappTemplatePT : whatsappTemplateEN;

  return (
    <div style={{padding:"32px 28px",display:"flex",flexDirection:"column",gap:20}}>

      {/* Other flags notice (owner only) */}
      {isOwnerRole && otherFlags.length > 0 && (
        <div style={{padding:"12px 18px",borderRadius:10,background:"rgba(243,156,18,0.08)",border:"1px solid rgba(243,156,18,0.25)",cursor:"pointer"}}
          onClick={function(){setShowOtherFlags(!showOtherFlags);}}>
          <span style={{color:"#F39C12",fontSize:13,fontWeight:600}}>
            {lang==="PT"
              ? otherFlags.length + ' ministerio(s) nao identificado(s) aguardando revisao'
              : otherFlags.length + ' unidentified ministr' + (otherFlags.length===1?'y':'ies') + ' awaiting review'}
          </span>
          {showOtherFlags && (
            <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
              {otherFlags.map(function(f,i) {
                return <span key={i} style={{color:"#aebac0",fontSize:12}}>{f}</span>;
              })}
            </div>
          )}
        </div>
      )}

      {/* Custom position submissions alert (owner only) — review queue for unlisted positions
          reported by ministry leaders via the Leader Form free-text field. */}
      {isOwnerRole && posAlertRows.length > 0 && (
        <div style={{padding:"12px 18px",borderRadius:10,background:"rgba(243,156,18,0.08)",border:"1px solid rgba(243,156,18,0.25)",cursor:"pointer"}}
          onClick={function(){setShowPosAlerts(!showPosAlerts);}}>
          <span style={{color:"#F39C12",fontSize:13,fontWeight:600}}>
            {lang==="PT"
              ? posAlertRows.length + ' ministerio(s) relataram posicoes nao listadas'
              : posAlertRows.length + ' ministr' + (posAlertRows.length===1?'y':'ies') + ' reported unlisted position' + (posAlertRows.length===1?'':'s')}
          </span>
          {showPosAlerts && (
            <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:12}}>
              {posAlertRows.map(function(row,i) {
                var ministryRaw = (row && row.ministry) || (lang==="PT"?"Ministerio desconhecido":"Unknown ministry");
                var ministryName = (lang==="PT" && MH_MINISTRY_PT[ministryRaw]) ? MH_MINISTRY_PT[ministryRaw] : ministryRaw;
                var leader = (row && row.preferred_name) || (lang==="PT"?"Lider desconhecido":"Unknown leader");
                var noteTxt = (row && row.custom_positions_notes) || "";
                var when = (row && row.submitted_at) ? formatNoteDate(row.submitted_at, lang) : "";
                return (
                  <div key={(row && row.id) || i} style={{padding:"10px 12px",borderRadius:8,background:"rgba(0,0,0,0.18)",borderLeft:"2px solid #F39C12"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
                      <span style={{color:"#e6f1f0",fontSize:13,fontWeight:600}}>{ministryName}</span>
                      {when && <span style={{color:"#6b7a82",fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>{when}</span>}
                    </div>
                    <div style={{color:"#aebac0",fontSize:12,marginTop:2}}>{leader}</div>
                    {noteTxt && <div style={{color:"#e6f1f0",fontSize:13,marginTop:6,whiteSpace:"pre-wrap"}}>{noteTxt}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Top actions */}
      <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"flex-start"}}>
        {/* Send Form button — unchanged */}
        <a href={'https://wa.me/?text=' + encodeURIComponent(sendFormMsg)}
          target="_blank" rel="noopener noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",
            borderRadius:8,background:"linear-gradient(135deg,#25D366,#128C7E)",
            color:"#fff",fontWeight:600,fontSize:13,textDecoration:"none",border:"none",cursor:"pointer"}}>
          {lang==="PT" ? "Enviar Formulario aos Lideres" : "Send Form to Leaders"}
        </a>

        {/* CSV import (owner only) */}
        {isOwnerRole && (
          <div style={{display:"flex",flexDirection:"column",gap:8,padding:"14px 18px",borderRadius:10,
            background:"rgba(14,26,36,0.55)",border:"1px solid rgba(94,234,212,0.07)",minWidth:260}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",
              textTransform:"uppercase",color:"#6b7a82"}}>
              {lang==="PT" ? "Importar Resultados da Pesquisa" : "Import Survey Results"}
            </div>
            <input type="file" accept=".csv" onChange={handleCSVFile}
              style={{fontSize:12,color:"#aebac0",cursor:"pointer"}} />
            {csvRows && csvRows.length > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{overflowX:"auto"}}>
                  <table style={{fontSize:11,color:"#aebac0",borderCollapse:"collapse",width:"100%"}}>
                    <thead>
                      <tr>{csvHeaders.map(function(h) {
                        return <th key={h} style={{padding:"4px 8px",textAlign:"left",color:"#6b7a82",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>{h}</th>;
                      })}</tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0,5).map(function(row,i) {
                        return <tr key={i}>{csvHeaders.map(function(h) {
                          return <td key={h} style={{padding:"4px 8px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{row[h]}</td>;
                        })}</tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {csvHeaders.map(function(h) {
                    return (
                      <div key={h} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                        <span style={{color:"#aebac0",minWidth:120}}>{h}</span>
                        <select value={csvMapping[h]||'ignore'}
                          onChange={function(e){
                            var v=e.target.value;
                            setCsvMapping(function(prev){var n=Object.assign({},prev);n[h]=v;return n;});
                          }}
                          style={{background:"#0c1a24",border:"1px solid rgba(94,234,212,0.15)",color:"#e6f1f0",
                            borderRadius:6,padding:"3px 6px",fontSize:12,cursor:"pointer"}}>
                          <option value="ignore">ignore</option>
                          <option value="ministry_name">ministry_name</option>
                          <option value="response_text">response_text</option>
                          <option value="sentiment">sentiment</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleCSVImport} disabled={csvImporting}
                  style={{padding:"8px 16px",borderRadius:7,background:"linear-gradient(135deg,rgba(42,191,191,0.9),rgba(13,148,136,0.9))",
                    border:"none",color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                  {csvImporting ? (lang==="PT"?"Importando...":"Importing...") : (lang==="PT"?"Importar":"Import")}
                </button>
              </div>
            )}
            {csvMsg && <div style={{fontSize:12,color:"#27AE60",fontWeight:600}}>{csvMsg}</div>}
          </div>
        )}
      </div>

      {/* KPI row + cards */}
      {loading ? (
        <div style={{color:"#6b7a82",fontSize:13,padding:20}}>{lang==="PT"?"Carregando...":"Loading..."}</div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
            {[
              {label:lang==="PT"?"Total":"Total", value:mhList.length, accent:"#5eead4"},
              {label:lang==="PT"?"Saudaveis":"Healthy", value:healthy, accent:"#27AE60"},
              {label:lang==="PT"?"Precisam de Voluntarios":"Need Volunteers", value:needs, accent:"#E67E22"},
              {label:lang==="PT"?"Criticos":"Critical", value:critical, accent:"#C0392B"},
            ].map(function(kpi) {
              return (
                <div key={kpi.label} className="glass" style={{padding:20,position:"relative",overflow:"hidden",borderRadius:12}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,
                    background:'linear-gradient(90deg,'+kpi.accent+',transparent 60%)'}}/>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:40,
                    color:kpi.accent,lineHeight:1,letterSpacing:"-0.02em"}}>{kpi.value}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",
                    letterSpacing:"0.16em",textTransform:"uppercase",color:"#6b7a82",marginTop:8}}>{kpi.label}</div>
                </div>
              );
            })}
          </div>

          {/* Ministry cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14,alignItems:"start"}}>
            {mhList.map(function(card) {
              var positions = Array.isArray(card && card.positions) ? card.positions : [];
              // Card color = the WORST position status (not card.card_status, not an average).
              var worst = mhWorstStatus(positions);
              var sc = mhStatusColor(worst);
              var sl = mhStatusLabel(worst, lang);
              var ptName = MH_MINISTRY_PT[card.ministry] || card.ministry;
              var displayName = lang === 'PT' ? ptName : card.ministry;
              var healthyPos = positions.filter(function(p) {
                return mhPosStatus(mhPosFilled(p), p && p.min_count, p && p.ideal_count) === 'healthy';
              }).length;
              var leaderName = card.leader_name || MH_DEFAULT_LEADERS[card.ministry] || null;

              // Compact, non-expanding card — clicking anywhere opens the Ministry Modal.
              return (
                <div key={card.ministry} className="glass glow-hover"
                  onClick={function(){ setModalMinistry(card); }}
                  style={{borderRadius:12,overflow:"hidden",borderTop:'2px solid '+sc,
                    background: sc+'0d',
                    boxShadow: worst === 'critical' ? '0 0 0 1px '+sc+'33, 0 8px 28px '+sc+'22' : 'none',
                    cursor:'pointer',padding:'18px 20px',display:'flex',flexDirection:'column',gap:10}}>

                  {/* Name + worst-status badge */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h3 style={{margin:0,fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:'#e6f1f0'}}>
                      {displayName}
                    </h3>
                    <span style={{fontSize:9,padding:'3px 9px',background:sc+'22',color:sc,
                      borderRadius:999,fontWeight:700,whiteSpace:'nowrap',border:'1px solid '+sc+'44',
                      fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.06em',flexShrink:0,marginLeft:8}}>
                      {sl}
                    </span>
                  </div>

                  {/* Leader */}
                  <div style={{fontSize:12,color:'#6b7a82'}}>
                    {lang==='PT'?'Lider':'Leader'}{': '}
                    <span style={{color:leaderName?'#aebac0':'#475a64'}}>
                      {leaderName||(lang==='PT'?'Nao definido':'Not set')}
                    </span>
                  </div>

                  {/* Compact summary (static, not a toggle) */}
                  <div style={{fontSize:12,color:'#6b7a82'}}>
                    <span style={{color:'#27AE60',fontWeight:700}}>{healthyPos}</span>
                    {' / '}{positions.length}
                    {'  '}{lang==='PT'?'posicoes saudaveis':'positions healthy'}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Ministry modal */}
      {modalMinistry && (function() {
        var modalMinKey = (modalMinistry && modalMinistry.ministry) || '';
        // Show ML entry-point button to pastors (blanket access) or grant-holders for this specific ministry.
        var canAccessMLForThis = isPastorRole || (userGrants || []).some(function(g) {
          return (g.grant_type || g.grantType || g.type) === 'ministry_leader' &&
                 (g.scope_name || g.scopeName || g.scope) === modalMinKey;
        });
        return (
          <MinistryModal
            card={modalMinistry}
            lang={lang}
            role={role}
            token={token}
            fbUser={fbUser}
            posAlerts={posAlerts}
            onClose={function(){setModalMinistry(null);}}
            onSaved={loadMH}
            onNavigateToML={canAccessMLForThis && typeof onNavigateToML === 'function' ? function() { setModalMinistry(null); onNavigateToML(modalMinKey); } : undefined}
          />
        );
      })()}

      {/* Survey modal */}
      {surveyModal && (
        <SurveyModal ministry={surveyModal} token={token} lang={lang} onClose={function(){setSurveyModal(null);}} />
      )}
    </div>
  );
}

// ─── REFERENCE ERROR BOUNDARY ───────────────────────────────────
class RefErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  render() {
    var lang = (this.props && this.props.lang) || "PT";
    if (this.state.hasError) {
      return (
        <div style={{padding:"64px 28px",textAlign:"center",maxWidth:480,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,color:"#e6f1f0",marginBottom:16}}>
            {lang==="PT" ? "Algo deu errado nesta pagina" : "Something went wrong on this page"}
          </h2>
          <button
            onClick={function(){this.props.onBack && this.props.onBack();}.bind(this)}
            style={{fontSize:13,padding:"10px 22px",borderRadius:8,background:"rgba(94,234,212,0.12)",
              border:"1px solid rgba(94,234,212,0.3)",color:"#5eead4",cursor:"pointer",fontWeight:600}}>
            {lang==="PT" ? "Voltar ao painel" : "Back to dashboard"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── EXPANDABLE REFERENCE CARD ────────────────────────────────────
// ─── LABEL DESCRIPTION POPUP ────────────────────────────────────
// Overlay rendered inside PersonPanel; shows Reference content for a label tag.
// type: "disc" | "natural_strength" | "leadership_tendency" | "emotional_profile" | "pairing" | "gifting" | "pastoral"
// value: canonical English value, e.g. "Sustainer", "D", "Deep Worshiper", "pastoral-potential"
function LabelDescriptionPopup({ type, value, lang, onClose, pastoralFlag, confirmedBy }) {
  const [refContent, setRefContent] = useState(null);
  const [discTab, setDiscTab] = useState("brazil");

  useEffect(function(){
    fetch(import.meta.env.BASE_URL + "reference-content.json?v=" + Date.now())
      .then(function(r){ if (!r.ok) throw new Error(); return r.json(); })
      .then(setRefContent)
      .catch(function(){});
  }, []);

  var item = null;
  if (refContent) {
    var discIdMap = {D:"executor",I:"comunicador",S:"planejador",C:"analista"};
    if (type === "disc") {
      item = (refContent.discProfiles||[]).find(function(p){ return p.id === discIdMap[value]; });
    } else if (type === "natural_strength") {
      // Stored value may be PT or EN — normalise to EN via map
      var nsEN = (NATURAL_STRENGTH_MAP[value] || {}).EN || value;
      item = (refContent.naturalStrengths||[]).find(function(p){ return p.labelEN === nsEN; });
    } else if (type === "leadership_tendency") {
      // Stored value may be PT or EN — normalise to EN via map
      var ldEN = (LEADERSHIP_MAP[value] || {}).EN || value;
      item = (refContent.leadershipTendencies||[]).find(function(p){ return p.labelEN === ldEN; });
    } else if (type === "emotional_profile") {
      // Stored value may be PT or EN — normalise to EN via map
      var emEN = (EMOTIONAL_MAP[value] || {}).EN || value;
      item = (refContent.emotionalProfiles||[]).find(function(p){ return p.labelEN === emEN; });
    } else if (type === "pairing") {
      item = (refContent.pairings||[]).find(function(p){ return p.labelEN === value; });
    } else if (type === "gifting") {
      // Stored gifting names use " & " but JSON labelEN uses " and "
      var gEN = value.replace(/ & /g, ' and ');
      item = (refContent.giftings||[]).find(function(p){ return p.labelEN === gEN; });
    } else if (type === "pastoral") {
      item = (refContent.leadershipTendencies||[]).find(function(p){ return p.id === value; });
    }
  }

  var isDisc = type === "disc";
  var headingLabel = (type === "pastoral" && pastoralFlag === 2)
    ? (lang === "PT" ? "Marcado Pastoral" : "Marked for Pastoral")
    : (item ? (lang === "PT" ? item.labelPT : item.labelEN) : value);
  var body = item ? (lang === "PT" ? item.bodyPT : item.bodyEN) : null;

  function tabBtnStyle(active) {
    return {fontSize:10,padding:"4px 10px",borderRadius:999,
      fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em",cursor:"pointer",
      background:active?"rgba(94,234,212,0.12)":"rgba(255,255,255,0.03)",
      border:active?"1px solid rgba(94,234,212,0.3)":"1px solid rgba(255,255,255,0.05)",
      color:active?"#5eead4":"#6b7a82",transition:"all 0.15s"};
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)"}} />
      <div style={{width:"min(540px,100vw)",height:"100vh",
        background:"linear-gradient(180deg,rgba(8,14,22,0.99),rgba(4,10,16,0.99))",
        borderLeft:"1px solid rgba(94,234,212,0.2)",
        boxShadow:"-20px 0 60px rgba(0,0,0,0.65)",
        overflowY:"auto",display:"flex",flexDirection:"column",
        position:"relative",zIndex:1}}>

        {/* Sticky header */}
        <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)",
          position:"sticky",top:0,background:"rgba(4,10,16,0.97)",zIndex:10,
          display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,
            color:"#e6f1f0",lineHeight:1.3}}>
            {headingLabel}
          </div>
          <button onClick={onClose} style={{
            padding:"6px 16px",borderRadius:8,flexShrink:0,
            background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",
            color:"#aebac0",cursor:"pointer",fontSize:12,
            fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>
            {lang === "PT" ? "Fechar" : "Close"}
          </button>
        </div>

        {/* Body */}
        <div style={{padding:"20px 24px",flex:1}}>
          {!refContent ? (
            <div style={{fontSize:11,color:"#475a64",fontFamily:"'JetBrains Mono',monospace",
              textAlign:"center",paddingTop:32,letterSpacing:"0.1em"}}>
              {lang === "PT" ? "Carregando..." : "Loading..."}
            </div>
          ) : !item ? (
            <div style={{fontSize:13,color:"#475a64"}}>
              {lang === "PT" ? "Conteudo nao encontrado." : "Content not found."}
            </div>
          ) : isDisc ? (
            <div>
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {[
                  {key:"brazil",labelPT:"Expressao Brasileira",labelEN:"Brazilian Expression"},
                  {key:"usa",   labelPT:"Expressao Americana", labelEN:"American Expression"},
                  {key:"cult",  labelPT:"Diferencas Culturais",labelEN:"Cultural Differences"},
                ].map(function(tab){
                  return (
                    <button key={tab.key} onClick={function(){ setDiscTab(tab.key); }}
                      style={tabBtnStyle(discTab===tab.key)}>
                      {lang==="PT"?tab.labelPT:tab.labelEN}
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:13,color:"#aebac0",lineHeight:1.75}}>
                {discTab==="brazil" && renderParagraphs(lang==="PT"?item.brazilPT:(item.brazilEN||item.brazilPT||""))}
                {discTab==="usa"    && renderParagraphs(lang==="PT"?item.usaPT:item.usaEN)}
                {discTab==="cult"   && renderParagraphs(lang==="PT"?item.culturalPT:item.culturalEN)}
              </div>
            </div>
          ) : (type === "pastoral" && pastoralFlag === 2) ? (
            <div style={{fontSize:13,color:"#aebac0",lineHeight:1.75}}>
              {lang === "PT" ? (
                <>
                  <p style={{margin:0,marginBottom:"0.85em"}}>{"Esta pessoa foi identificada para desenvolvimento pastoral por meio de observacao e relacionamento pastoral direto."}</p>
                  <p style={{margin:0,marginBottom:"0.85em"}}>{"Esta designacao foi feita por um pastor com base em conhecimento pessoal do carater, maturidade de fe e chamado desta pessoa — fatores que vao alem do que qualquer avaliacao pode medir."}</p>
                  <p style={{margin:0,marginBottom:confirmedBy?"0.85em":0}}>{"A avaliacao pode revelar padroes. Somente o pastor pode discernir o chamado."}</p>
                  {confirmedBy && <p style={{margin:0,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{"Identificado por: " + confirmedBy}</p>}
                </>
              ) : (
                <>
                  <p style={{margin:0,marginBottom:"0.85em"}}>{"This person has been identified for pastoral development by direct pastoral observation and relationship."}</p>
                  <p style={{margin:0,marginBottom:"0.85em"}}>{"This designation was made by a pastor based on personal knowledge of this person's character, faith maturity, and calling — factors that go beyond what any assessment can measure."}</p>
                  <p style={{margin:0,marginBottom:confirmedBy?"0.85em":0}}>{"The assessment can surface patterns. Only the pastor can discern the calling."}</p>
                  {confirmedBy && <p style={{margin:0,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{"Identified by: " + confirmedBy}</p>}
                </>
              )}
            </div>
          ) : (
            <div style={{fontSize:13,color:"#aebac0",lineHeight:1.75}}>
              {renderParagraphs(body, item.footnoteCitations)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Renders body text with paragraph breaks (split on \n\n) and optional inline footnote superscripts
function renderParagraphs(text, footnoteCitations) {
  if (!text) return null;
  var parts = text.split(/\n\n+/);
  return parts.map(function(para, idx) {
    var isLast = idx === parts.length - 1;
    return (
      <p key={idx} style={{margin:0, marginBottom: isLast ? 0 : "0.85em"}}>
        {para}
        {isLast && footnoteCitations && footnoteCitations.map(function(num) {
          return (
            <sup key={num}
              style={{color:"#2ABFBF",fontSize:"0.7rem",marginLeft:1,cursor:"pointer",verticalAlign:"super"}}
              onClick={function(){ var el=document.getElementById("reference-footnotes"); if(el) el.scrollIntoView({behavior:"smooth"}); }}>
              {num}
            </sup>
          );
        })}
      </p>
    );
  });
}

function RefCard({ item, lang, isDisc, discColor }) {
  const [open, setOpen] = useState(false);
  const [discSection, setDiscSection] = useState("brazil");
  var label = lang === "PT" ? item.labelPT : item.labelEN;
  var summary = lang === "PT" ? item.summaryPT : item.summaryEN;
  var body = lang === "PT" ? item.bodyPT : item.bodyEN;
  var pastoral = lang === "PT" ? item.pastoralNotePT : item.pastoralNoteEN;

  return (
    <div id={"anchor-" + item.anchorId} style={{borderRadius:12,background:"rgba(14,26,36,0.45)",border:"1px solid rgba(94,234,212,0.08)",borderLeft:discColor?"3px solid "+discColor:"none",overflow:"hidden",transition:"all 0.2s ease"}}>
      <button onClick={function(){setOpen(function(v){return !v;});}}
        style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"14px 18px",background:"none",border:"none",cursor:"pointer",textAlign:"left",gap:12}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:"#e6f1f0",marginBottom:4}}>{label}</div>
          {summary && <div style={{fontSize:12,color:"#6b7a82",lineHeight:1.5}}>{summary}</div>}
        </div>
        <span style={{color:"#5eead4",fontSize:14,flexShrink:0,marginTop:2,opacity:0.7}}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{padding:"0 18px 16px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
          {isDisc ? (
            <div>
              <div style={{display:"flex",gap:6,marginTop:14,marginBottom:12}}>
                {[
                  {key:"brazil", labelPT:"Expressao Brasileira", labelEN:"Brazilian Expression"},
                  {key:"usa",    labelPT:"Expressao Americana",  labelEN:"American Expression"},
                  {key:"cult",   labelPT:"Diferencas Culturais", labelEN:"Cultural Differences"},
                ].map(function(tab){
                  var active = discSection === tab.key;
                  return (
                    <button key={tab.key} onClick={function(){setDiscSection(tab.key);}}
                      style={{fontSize:10,padding:"4px 10px",borderRadius:999,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em",cursor:"pointer",
                        background:active?"rgba(94,234,212,0.12)":"rgba(255,255,255,0.03)",
                        border:active?"1px solid rgba(94,234,212,0.3)":"1px solid rgba(255,255,255,0.05)",
                        color:active?"#5eead4":"#6b7a82",transition:"all 0.15s"}}>
                      {lang==="PT" ? tab.labelPT : tab.labelEN}
                    </button>
                  );
                })}
              </div>
              {discSection === "brazil" && (
                <div style={{fontSize:13,color:"#aebac0",lineHeight:1.7}}>
                  {renderParagraphs(lang==="PT" ? item.brazilPT : (item.brazilEN || item.brazilPT || ""))}
                </div>
              )}
              {discSection === "usa" && (
                <div style={{fontSize:13,color:"#aebac0",lineHeight:1.7}}>
                  {renderParagraphs(lang==="PT" ? item.usaPT : item.usaEN)}
                </div>
              )}
              {discSection === "cult" && (
                <div style={{fontSize:13,color:"#aebac0",lineHeight:1.7}}>
                  {renderParagraphs(lang==="PT" ? item.culturalPT : item.culturalEN)}
                </div>
              )}
            </div>
          ) : (
            <div style={{paddingTop:12}}>
              {body && (
                <div style={{fontSize:13,color:"#aebac0",lineHeight:1.7}}>
                  {renderParagraphs(body, item.footnoteCitations)}
                </div>
              )}
              {pastoral && (
                <div style={{marginTop:12,padding:"10px 14px",borderLeft:"3px solid rgba(245,158,11,0.7)",background:"rgba(245,158,11,0.05)",borderRadius:"0 8px 8px 0"}}>
                  <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em",textTransform:"uppercase",color:"#f59e0b",marginBottom:4}}>
                    {lang==="PT" ? "Nota Pastoral" : "Pastoral Note"}
                  </div>
                  <div style={{fontSize:12.5,color:"#fbd590",lineHeight:1.6}}>
                    {renderParagraphs(pastoral)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── REFERENCE TAB ───────────────────────────────────────────────
function ReferenceTab({ t, lang, anchor, onAnchorConsumed, onBack }) {
  const [refContent, setRefContent] = useState(null);
  const [loadErr, setLoadErr] = useState(false);

  function doFetch(setC, setE) {
    fetch(import.meta.env.BASE_URL + "reference-content.json?v=" + Date.now())
      .then(function(r){ if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function(data){ setC(data); })
      .catch(function(){ setE(true); });
  }

  useEffect(function(){
    doFetch(setRefContent, setLoadErr);
  }, []);

  useEffect(function(){
    if (!anchor || !refContent) return;
    var el = document.getElementById("anchor-" + anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (onAnchorConsumed) onAnchorConsumed();
    } else {
      var timer = setTimeout(function(){
        var el2 = document.getElementById("anchor-" + anchor);
        if (el2) el2.scrollIntoView({ behavior: "smooth", block: "start" });
        if (onAnchorConsumed) onAnchorConsumed();
      }, 300);
      return function(){ clearTimeout(timer); };
    }
  }, [anchor, refContent]);

  var backBtnStyle = {display:"inline-flex",alignItems:"center",gap:6,fontSize:12,
    padding:"7px 16px",borderRadius:8,background:"rgba(94,234,212,0.08)",
    border:"1px solid rgba(94,234,212,0.25)",color:"#5eead4",cursor:"pointer",
    fontWeight:600,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"};

  var backBtn = (
    <div style={{marginBottom:24}}>
      <button onClick={function(){ if (onBack) onBack(); }} style={backBtnStyle}>
        {"← "}{lang==="PT" ? "Voltar ao painel" : "Back to dashboard"}
      </button>
    </div>
  );

  var SECTIONS_PT = ["Perfis DISC","Dons Ministeriais","Forcas Naturais",
    "Tendencias de Lideranca","Perfil Emocional","Combinacoes Dom e DISC",
    "Construindo Equipes Saudaveis","Notas e Fontes"];
  var SECTIONS_EN = ["DISC Profiles","Ministry Giftings","Natural Strengths",
    "Leadership Tendencies","Emotional Profile","Gifting and DISC Pairings",
    "Building Healthy Teams","Notes and Sources"];
  var sections = lang==="PT" ? SECTIONS_PT : SECTIONS_EN;

  function SectionHead(ptLabel, enLabel) {
    return (
      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,
        letterSpacing:"0.12em",textTransform:"uppercase",color:"#5eead4",
        marginBottom:12,marginTop:4,paddingBottom:8,
        borderBottom:"1px solid rgba(94,234,212,0.12)"}}>
        {lang==="PT" ? ptLabel : enLabel}
      </div>
    );
  }

  if (loadErr) {
    return (
      <div style={{padding:"32px 28px",maxWidth:1100,margin:"0 auto"}}>
        {backBtn}
        <div style={{padding:"32px",borderRadius:12,background:"rgba(248,113,113,0.06)",
          border:"1px solid rgba(248,113,113,0.2)",textAlign:"center"}}>
          <p style={{margin:"0 0 16px",fontSize:14,color:"#f87171",fontWeight:600}}>
            {lang==="PT" ? "Nao foi possivel carregar o conteudo. Tente novamente." : "Could not load content. Please try again."}
          </p>
          <button onClick={function(){
            setLoadErr(false);
            setRefContent(null);
            doFetch(setRefContent, setLoadErr);
          }}
            style={{fontSize:12,padding:"8px 18px",borderRadius:8,background:"rgba(248,113,113,0.1)",
              border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",cursor:"pointer",fontWeight:600}}>
            {lang==="PT" ? "Tentar novamente" : "Try again"}
          </button>
        </div>
      </div>
    );
  }

  if (!refContent) {
    return (
      <div style={{padding:"32px 28px",maxWidth:1100,margin:"0 auto"}}>
        {backBtn}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
          {sections.map(function(s,i){
            return (
              <div key={i} className="glass" style={{padding:"18px 20px",borderRadius:12,opacity:0.45}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,
                  color:"#5eead4",letterSpacing:"0.08em",textTransform:"uppercase"}}>{s}</div>
              </div>
            );
          })}
        </div>
        <div style={{textAlign:"center",fontSize:11,fontFamily:"'JetBrains Mono',monospace",
          letterSpacing:"0.1em",color:"#475a64"}}>
          {lang==="PT" ? "Carregando guia de referencia..." : "Loading reference guide..."}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"32px 28px",display:"flex",flexDirection:"column",gap:24,maxWidth:1100,margin:"0 auto"}}>
      {backBtn}

      {/* DISC Profiles */}
      <div>
        {SectionHead("Perfis DISC", "DISC Profiles")}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {refContent.discProfiles.map(function(item){
            var color = DISC_COLORS[item.id === "executor" ? "D" : item.id === "comunicador" ? "I" : item.id === "planejador" ? "S" : "C"] || "#5eead4";
            return <RefCard key={item.id} item={item} lang={lang} isDisc={true} discColor={color} />;
          })}
        </div>
      </div>

      {/* Ministry Giftings */}
      <div>
        {SectionHead("Dons Ministeriais", "Ministry Giftings")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {refContent.giftings.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* Natural Strengths */}
      <div>
        {SectionHead("Forcas Naturais", "Natural Strengths")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {refContent.naturalStrengths.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* Leadership Tendencies */}
      <div>
        {SectionHead("Tendencias de Lideranca", "Leadership Tendencies")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {refContent.leadershipTendencies.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* Emotional Profiles */}
      <div>
        {SectionHead("Perfil Emocional", "Emotional Profile")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {refContent.emotionalProfiles.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* Gifting and DISC Pairings */}
      <div>
        {SectionHead("Combinacoes Dom e DISC", "Gifting and DISC Pairings")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {refContent.pairings.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* Team Building */}
      <div>
        {SectionHead("Construindo Equipes Saudaveis", "Building Healthy Teams")}
        <RefCard item={refContent.teamBuilding} lang={lang} isDisc={false} />
      </div>

      {/* Footnotes */}
      <div id="reference-footnotes">
        {SectionHead("Notas e Fontes", "Notes and Sources")}
        <div className="glass" style={{padding:20,borderRadius:12}}>
          <ol style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:8}}>
            {(lang === "PT" ? refContent.footnotesPT : refContent.footnotesEN).map(function(fn, i){
              return <li key={i} style={{fontSize:11.5,color:"#6b7a82",lineHeight:1.6}}>{fn}</li>;
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}



// ─── USER GRANTS SECTION ─────────────────────────────────────────
// Stacks ministry_leader / group_leader grants on top of a user's base role.
// Rendered inside the per-user inline-edit state of UserManagementTab.
function UserGrantsSection({ token, uid, lang }) {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [addType, setAddType] = useState("ministry_leader");
  const [addScope, setAddScope] = useState("");
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [removeErr, setRemoveErr] = useState("");

  // Defensive field accessors — exact shapes aren't documented anywhere.
  const gId = (g) => (g && (g.id ?? g.grant_id ?? g.grantId ?? g.ID)) ?? null;
  const gType = (g) => (g && (g.grant_type ?? g.grantType ?? g.type)) || "";
  const gScope = (g) => (g && (g.scope_name ?? g.scopeName ?? g.scope)) || "";

  const typeLabel = (gt) =>
    gt === "group_leader"
      ? (lang === "PT" ? "Lider de Grupo" : "Group Leader")
      : (lang === "PT" ? "Lider de Ministerio" : "Ministry Leader");

  function load() {
    setLoading(true); setLoadErr("");
    fetch(`${API}/user/${uid}/grants`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) return r.json().catch(() => ({})).then(d => { throw new Error(d.error || r.status); });
        return r.json();
      })
      .then(d => {
        const arr = Array.isArray(d) ? d : (d && Array.isArray(d.grants) ? d.grants : []);
        setGrants(arr || []);
        setLoading(false);
      })
      .catch(e => {
        setLoadErr((lang === "PT" ? "Erro ao carregar permissoes" : "Error loading grants") + (e.message ? ` (${e.message})` : ""));
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, [uid, token]);

  async function handleAdd() {
    if (!addScope) return;
    setAdding(true); setAddErr("");
    try {
      const r = await fetch(`${API}/user/${uid}/grants`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grant_type: addType, scope_name: addScope })
      });
      if (r.status === 409) {
        setAddErr(lang === "PT" ? "Ja atribuido" : "Already assigned");
        setAdding(false);
        return;
      }
      if (!r.ok) {
        let m = r.status;
        try { const d = await r.json(); m = d.error || m; } catch (e) {}
        throw new Error(m);
      }
      setAddScope("");
      load(); // refetch so the new chip appears immediately
    } catch (e) {
      setAddErr((lang === "PT" ? "Erro ao adicionar" : "Error adding") + (e.message ? ` (${e.message})` : ""));
    }
    setAdding(false);
  }

  async function handleRemove(g) {
    const id = gId(g);
    if (id == null) { setRemoveErr(lang === "PT" ? "Nao foi possivel remover" : "Could not remove"); return; }
    setRemovingId(id); setRemoveErr("");
    try {
      const r = await fetch(`${API}/user/${uid}/grants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) {
        let m = r.status;
        try { const d = await r.json(); m = d.error || m; } catch (e) {}
        throw new Error(m);
      }
      setGrants(prev => (prev || []).filter(x => gId(x) !== id));
    } catch (e) {
      setRemoveErr((lang === "PT" ? "Erro ao remover" : "Error removing") + (e.message ? ` (${e.message})` : ""));
    }
    setRemovingId(null);
  }

  const scopeOptions = addType === "group_leader" ? GL_GROUPS : MH_MINISTRIES;
  // Group existing grants by type for display.
  const safeGrants = grants || [];
  const ministryGrants = safeGrants.filter(g => gType(g) !== "group_leader");
  const groupGrants = safeGrants.filter(g => gType(g) === "group_leader");

  const labelStyle = { fontFamily: "'JetBrains Mono',monospace", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b7a82", marginBottom: 8 };
  const selStyle = { background: "rgba(5,10,16,0.8)", border: "1px solid rgba(94,234,212,0.25)", borderRadius: 6, color: "#e6f1f0", fontSize: 12, padding: "5px 8px", fontFamily: "'JetBrains Mono',monospace" };

  function chip(g) {
    const id = gId(g);
    return (
      <span key={id ?? `${gType(g)}:${gScope(g)}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 6px 4px 10px", borderRadius: 999, fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.25)", color: "#5eead4" }}>
        <span>{typeLabel(gType(g))}: <span style={{ color: "#e6f1f0" }}>{gScope(g)}</span></span>
        <button
          onClick={() => handleRemove(g)}
          disabled={removingId === id}
          title={lang === "PT" ? "Remover" : "Remove"}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 999, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "#aebac0", fontSize: 11, lineHeight: 1, padding: 0 }}>
          {removingId === id ? "…" : "✕"}
        </button>
      </span>
    );
  }

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10.5px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5eead4", marginBottom: 12 }}>
        {lang === "PT" ? "Permissoes" : "Grants"}
      </div>

      {loadErr ? (
        <div style={{ color: "#f87171", fontSize: 12 }}>{loadErr}</div>
      ) : loading ? (
        <div style={{ color: "#6b7a82", fontSize: 12 }}>{lang === "PT" ? "Carregando..." : "Loading..."}</div>
      ) : (
        <>
          {safeGrants.length === 0 ? (
            <div style={{ color: "#6b7a82", fontSize: 12, marginBottom: 14 }}>{lang === "PT" ? "Nenhuma permissao atribuida." : "No grants assigned."}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              {ministryGrants.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ministryGrants.map(chip)}</div>
              )}
              {groupGrants.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{groupGrants.map(chip)}</div>
              )}
            </div>
          )}
          {removeErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}>{removeErr}</div>}

          {/* Add grant control */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
            <div>
              <div style={labelStyle}>{lang === "PT" ? "Tipo" : "Type"}</div>
              <select value={addType} onChange={e => { setAddType(e.target.value); setAddScope(""); setAddErr(""); }} style={selStyle}>
                <option value="ministry_leader">{lang === "PT" ? "Lider de Ministerio" : "Ministry Leader"}</option>
                <option value="group_leader">{lang === "PT" ? "Lider de Grupo" : "Group Leader"}</option>
              </select>
            </div>
            <div>
              <div style={labelStyle}>{addType === "group_leader" ? (lang === "PT" ? "Grupo" : "Group") : (lang === "PT" ? "Ministerio" : "Ministry")}</div>
              <select value={addScope} onChange={e => { setAddScope(e.target.value); setAddErr(""); }} style={{ ...selStyle, minWidth: 170 }}>
                <option value="">{lang === "PT" ? "Selecionar..." : "Select..."}</option>
                {(scopeOptions || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || !addScope}
              style={{ padding: "6px 16px", borderRadius: 6, fontSize: 12, fontFamily: "'JetBrains Mono',monospace", cursor: addScope ? "pointer" : "not-allowed", border: "1px solid rgba(94,234,212,0.3)", background: "rgba(94,234,212,0.1)", color: "#5eead4", opacity: (adding || !addScope) ? 0.5 : 1 }}>
              {adding ? "…" : (lang === "PT" ? "Adicionar" : "Add")}
            </button>
          </div>
          {addErr && <div style={{ color: "#f87171", fontSize: 12, marginTop: 10 }}>{addErr}</div>}
        </>
      )}
    </div>
  );
}

// ─── USER MANAGEMENT TAB ─────────────────────────────────────────
function UserManagementTab({ token, t, lang }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pw, setPw] = useState("");
  const [newRole, setNewRole] = useState("pastor");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);
  const [editingUid, setEditingUid] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editName, setEditName] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [saveError, setSaveError] = useState("");

  const roleNames = {
    senior_pastor: t.userRoleSenior,
    pastor: t.userRolePastor,
    group_leader: t.userRoleGroupLeader,
  };

  const fetchErrMsg = lang === "PT" ? "Erro ao carregar usuários." : lang === "ES" ? "Error al cargar usuarios." : "Error loading users.";

  function loadUsers() {
    setFetchError("");
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) return r.json().then(d => { throw new Error(d.error || r.status); });
        return r.json();
      })
      .then(d => {
        if (d.users) setUsers(d.users);
        else setFetchError(fetchErrMsg);
        setLoadingUsers(false);
      })
      .catch(e => { setFetchError(fetchErrMsg + (e.message ? " (" + e.message + ")" : "")); setLoadingUsers(false); });
  }

  useEffect(() => { loadUsers(); }, [token]);

  async function handleSave(uid, originalName) {
    setSavingRole(true); setSaveError("");
    const trimmedName = editName.trim();
    const hadName = (originalName || "").trim() !== "";
    if (hadName && trimmedName === "") {
      setSaveError(lang === "PT" ? "Nome não pode ficar vazio." : "Name cannot be blank.");
      setSavingRole(false);
      return;
    }
    try {
      const rr = await fetch(`${API}/admin/user/${uid}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: editRole })
      });
      const rd = await rr.json();
      if (!rd.success) { setSaveError(rd.error || fetchErrMsg); setSavingRole(false); return; }
      if (trimmedName) {
        const nr = await fetch(`${API}/admin/user/${uid}/name`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: trimmedName })
        });
        const nd = await nr.json();
        if (!nd.success) { setSaveError(nd.error || (lang === "PT" ? "Erro ao salvar nome." : "Error saving name.")); setSavingRole(false); return; }
      }
      setEditingUid(null); setSaveError(""); loadUsers();
    } catch(e) { setSaveError(e.message || fetchErrMsg); }
    setSavingRole(false);
  }

  async function handleAddUser() {
    if (!email || !pw) return;
    setAdding(true); setAddError("");
    try {
      const r = await fetch(`${API}/admin/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, password: pw, role: newRole, displayName })
      });
      const d = await r.json();
      if (d.success) {
        setCreatedUser({ email, password: pw });
        setEmail(""); setDisplayName(""); setPw(""); setNewRole("pastor");
        loadUsers();
      } else {
        setAddError(d.error || (lang === "PT" ? "Erro ao criar usuário." : "Error creating user."));
      }
    } catch { setAddError(lang === "PT" ? "Erro de conexão." : "Connection error."); }
    setAdding(false);
  }

  return (
    <div style={{padding:"40px 32px",maxWidth:900}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:8}}>LTC Ministry</div>
      <h2 style={{margin:"0 0 32px",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:28,color:"#e6f1f0"}}>{t.usersTab}</h2>

      {/* Add user form */}
      <div className="glass" style={{padding:28,borderRadius:16,marginBottom:32,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,transparent,#5eead4,transparent)",opacity:0.4}} />
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:20}}>{t.addUser}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82",marginBottom:6}}>{t.loginEmail}</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@lagoinha.com" style={{height:42}} />
          </div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82",marginBottom:6}}>{lang==="PT"?"Nome de exibicao":lang==="ES"?"Nombre para mostrar":"Display Name"}</div>
            <input type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder={lang==="PT"?"Nome completo":lang==="ES"?"Nombre completo":"Full name"} style={{height:42}} />
          </div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82",marginBottom:6}}>{lang==="PT"?"Senha Temporária":"Temporary Password"}</div>
            <input type="text" value={pw} onChange={e=>setPw(e.target.value)} placeholder={lang==="PT"?"Senha inicial...":"Initial password..."} style={{height:42}} />
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82",marginBottom:10}}>{lang==="PT"?"Função":"Role"}</div>
          <div style={{display:"flex",gap:8}}>
            {["senior_pastor","pastor","group_leader"].map(r=>(
              <button key={r} onClick={()=>setNewRole(r)} style={{padding:"8px 16px",borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",border:"1px solid",background:newRole===r?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",borderColor:newRole===r?"rgba(94,234,212,0.3)":"rgba(255,255,255,0.06)",color:newRole===r?"#5eead4":"#6b7a82",transition:"all 0.18s"}}>
                {roleNames[r]}
              </button>
            ))}
          </div>
        </div>
        {addError && <div style={{color:"#f87171",fontSize:13,marginBottom:12}}>{addError}</div>}
        <button onClick={handleAddUser} disabled={adding||!email||!pw} className="btn-primary" style={{padding:"10px 24px",fontSize:13}}>
          {adding ? "..." : t.addUser}
        </button>
      </div>

      {/* User list */}
      <div className="glass" style={{padding:28,borderRadius:16,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,transparent,#5eead4,transparent)",opacity:0.4}} />
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:16}}>{lang==="PT"?"Usuários Ativos":lang==="ES"?"Usuarios Activos":"Active Users"}</div>
        {fetchError && <div style={{color:"#f87171",fontSize:13,marginBottom:12}}>{fetchError}</div>}
        {loadingUsers ? (
          <div style={{color:"#6b7a82",fontSize:13}}>{t.loading}</div>
        ) : users.length === 0 && !fetchError ? (
          <div style={{color:"#6b7a82",fontSize:13}}>{lang==="PT"?"Nenhum usuário encontrado.":lang==="ES"?"No se encontraron usuarios.":"No users found."}</div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase",color:"#6b7a82",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <th style={{textAlign:"left",padding:"8px 0 12px",fontWeight:500}}>Email</th>
                <th style={{textAlign:"left",padding:"8px 0 12px",fontWeight:500}}>{lang==="PT"?"Nome":"Name"}</th>
                <th style={{textAlign:"left",padding:"8px 0 12px",fontWeight:500}}>{lang==="PT"?"Função":lang==="ES"?"Función":"Role"}</th>
                <th style={{textAlign:"left",padding:"8px 0 12px",fontWeight:500}}>{lang==="PT"?"Último acesso":lang==="ES"?"Último acceso":"Last sign in"}</th>
                <th style={{textAlign:"left",padding:"8px 0 12px",fontWeight:500}}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u,i)=>{
                var customAttrs = {};
                try { customAttrs = u.customAttributes ? JSON.parse(u.customAttributes) : {}; } catch(e) {}
                var lastSignIn = u.lastLoginAt || u.lastSignedInAt;
                var isEditing = editingUid === u.localId;
                return (
                  <React.Fragment key={u.localId||i}>
                  <tr style={{borderBottom: isEditing ? "none" : "1px solid rgba(255,255,255,0.03)"}}>
                    <td style={{padding:"12px 8px 12px 0",color:"#e6f1f0"}}>{u.email}</td>
                    <td style={{padding:"12px 8px 12px 0",color:"#aebac0"}}>
                      {isEditing ? (
                        <input type="text" value={editName} onChange={e=>{setEditName(e.target.value);setSaveError("");}} placeholder={lang==="PT"?"Nome completo":"Full name"} style={{background:"rgba(5,10,16,0.8)",border:"1px solid rgba(94,234,212,0.25)",borderRadius:6,color:"#e6f1f0",fontSize:12,padding:"4px 8px",fontFamily:"'JetBrains Mono',monospace",width:160}} />
                      ) : (u.displayName || "—")}
                    </td>
                    <td style={{padding:"12px 8px 12px 0"}}>
                      {isEditing ? (
                        <select value={editRole} onChange={e=>setEditRole(e.target.value)} style={{background:"rgba(5,10,16,0.8)",border:"1px solid rgba(94,234,212,0.25)",borderRadius:6,color:"#e6f1f0",fontSize:12,padding:"4px 8px",fontFamily:"'JetBrains Mono',monospace"}}>
                          <option value="senior_pastor">{t.userRoleSenior}</option>
                          <option value="pastor">{t.userRolePastor}</option>
                          <option value="group_leader">{t.userRoleGroupLeader}</option>
                        </select>
                      ) : (
                        <span style={{color:"#aebac0"}}>{roleNames[customAttrs.role] || t.userRolePastor}</span>
                      )}
                    </td>
                    <td style={{padding:"12px 8px 12px 0",color:"#6b7a82"}}>{lastSignIn ? new Date(parseInt(lastSignIn)).toLocaleDateString() : "—"}</td>
                    <td style={{padding:"12px 0",textAlign:"right"}}>
                      {customAttrs.role === "owner" ? null : isEditing ? (
                        <span style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                          <button onClick={()=>handleSave(u.localId, u.displayName)} disabled={savingRole} style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",border:"1px solid rgba(94,234,212,0.3)",background:"rgba(94,234,212,0.1)",color:"#5eead4"}}>
                            {savingRole?"…":"✓"}
                          </button>
                          <button onClick={()=>{setEditingUid(null);setSaveError("");}} style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"#6b7a82"}}>✕</button>
                        </span>
                      ) : (
                        <button onClick={()=>{ setEditingUid(u.localId); setEditRole(customAttrs.role || "pastor"); setEditName(u.displayName || ""); setSaveError(""); }} style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"#6b7a82"}}>
                          {lang==="PT"?"Editar":lang==="ES"?"Editar":"Edit"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isEditing && saveError && (
                    <tr>
                      <td colSpan={5} style={{padding:"0 0 8px",color:"#f87171",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{saveError}</td>
                    </tr>
                  )}
                  {isEditing && customAttrs.role !== "owner" && (
                    <tr style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                      <td colSpan={5} style={{padding:"0 0 16px"}}>
                        <RefErrorBoundary lang={lang} onBack={()=>setEditingUid(null)}>
                          <UserGrantsSection token={token} uid={u.localId} lang={lang} />
                        </RefErrorBoundary>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Created user modal */}
      {createdUser && (
        <div style={{position:"fixed",inset:0,background:"rgba(5,10,16,0.85)",backdropFilter:"blur(8px)",zIndex:200,display:"grid",placeItems:"center"}}
          onClick={()=>setCreatedUser(null)}>
          <div className="glass" style={{padding:36,borderRadius:20,maxWidth:420,width:"90%",position:"relative"}} onClick={e=>e.stopPropagation()}>
            <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg,transparent,#5eead4,transparent)",opacity:0.6}} />
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:16}}>{t.userCreated}</div>
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:16,marginBottom:16,fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:1.9,color:"#e6f1f0"}}>
              <div>Email: <span style={{color:"#5eead4"}}>{createdUser.email}</span></div>
              <div>{lang==="PT"?"Senha":"Password"}: <span style={{color:"#5eead4"}}>{createdUser.password}</span></div>
            </div>
            <p style={{color:"#6b7a82",fontSize:13,margin:"0 0 20px"}}>{t.sendCredentials}</p>
            <button onClick={()=>setCreatedUser(null)} className="btn-primary" style={{width:"100%",padding:"10px",fontSize:13}}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
const CHART_TEAL = "#5eead4";
const CHART_GREY = "#2a3a40";
const CHART_GOLD = "#f0c060";
const CHART_COLORS = [CHART_TEAL, CHART_GOLD, "#a78bfa", "#fb923c", "#34d399", "#60a5fa", "#f472b6"];

function GroupHealthBox({ attending, serving, lang, groupName }) {
  // Engagement donut: serving vs attending-only
  const servingIds = new Set(serving.map(p => p.id));
  const attendingOnly = attending.filter(p => !servingIds.has(p.id)).length;
  const engagementData = [
    { name: lang === "PT" ? "Servindo" : "Serving", value: serving.length },
    { name: lang === "PT" ? "Frequentando" : "Attending only", value: attendingOnly },
  ];

  // Group Growth line: cumulative attendees over time from attendance_log
  const growthMap = {};
  attending.forEach(p => {
    const log = Array.isArray(p.attendance_log) ? p.attendance_log : [];
    const groupEntry = log.find(e => e.group_name === groupName);
    const dateStr = groupEntry?.joined_at || p.submitted_at || null;
    if (dateStr) {
      const month = dateStr.slice(0, 7);
      growthMap[month] = (growthMap[month] || 0) + 1;
    }
  });
  const sortedMonths = Object.keys(growthMap).sort();
  let cumulative = 0;
  const growthData = sortedMonths.map(m => {
    cumulative += growthMap[m];
    return { month: m.slice(5), total: cumulative };
  });

  // Serving Growth line: cumulative servers over time
  const servingGrowthMap = {};
  serving.forEach(p => {
    const log = Array.isArray(p.attendance_log) ? p.attendance_log : [];
    const groupEntry = log.find(e => e.group_name === groupName);
    const dateStr = groupEntry?.joined_at || p.submitted_at || null;
    if (dateStr) {
      const month = dateStr.slice(0, 7);
      servingGrowthMap[month] = (servingGrowthMap[month] || 0) + 1;
    }
  });
  const servingMonths = Object.keys(servingGrowthMap).sort();
  let servingCumulative = 0;
  const servingGrowthData = servingMonths.map(m => {
    servingCumulative += servingGrowthMap[m];
    return { month: m.slice(5), total: servingCumulative };
  });

  // Giftings donut: top gifting distribution among attendees
  const giftCount = {};
  attending.forEach(p => {
    if (p.gifting_1) giftCount[p.gifting_1] = (giftCount[p.gifting_1] || 0) + 1;
  });
  const giftingsData = Object.entries(giftCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({
      name: lang === "PT" ? (GIFTING_LABEL_PT[name] || name) : name,
      value,
      icon: GIFTING_ICONS[name] || "◆",
    }));

  const sectionLabel = {
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#6b7a82",
    fontWeight: 600,
    marginBottom: 10,
    textAlign: "center",
  };

  const chartBox = {
    background: "rgba(255,255,255,0.015)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: "14px 10px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{background:"#0f1e24",border:"1px solid rgba(94,234,212,0.2)",borderRadius:6,padding:"6px 10px",fontSize:11,color:"#aebac0"}}>
        {payload[0].name}: <strong style={{color:"#5eead4"}}>{payload[0].value}</strong>
      </div>
    );
  };

  const engagementPct = attending.length > 0 ? Math.round((serving.length / attending.length) * 100) : 0;

  return (
    <div className="glass" style={{borderRadius:16,padding:24,marginBottom:20}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,marginBottom:16}}>
        {lang === "PT" ? "Saúde do Grupo" : "Group Health"}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

        {/* Engagement donut */}
        <div style={chartBox}>
          <div style={sectionLabel}>{lang === "PT" ? "Engajamento" : "Engagement"}</div>
          <div style={{position:"relative",width:120,height:120}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={engagementData} cx="50%" cy="50%" innerRadius={34} outerRadius={52} dataKey="value" stroke="none">
                  {engagementData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? CHART_TEAL : CHART_GREY} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#5eead4",fontFamily:"'Space Grotesk',sans-serif"}}>{engagementPct}%</div>
            </div>
          </div>
          <div style={{marginTop:8,display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {engagementData.map((d, i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#6b7a82"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:i===0?CHART_TEAL:CHART_GREY,border:"1px solid rgba(255,255,255,0.12)"}} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Group Giftings donut */}
        <div style={chartBox}>
          <div style={sectionLabel}>{lang === "PT" ? "Dons no Grupo" : "Group Giftings"}</div>
          {giftingsData.length === 0
            ? <div style={{fontSize:11,color:"#475a64",marginTop:20,textAlign:"center"}}>{lang==="PT"?"Sem dados":"No data"}</div>
            : <>
              <div style={{position:"relative",width:120,height:120}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={giftingsData} cx="50%" cy="50%" innerRadius={34} outerRadius={52} dataKey="value" stroke="none">
                      {giftingsData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:3,width:"100%"}}>
                {giftingsData.slice(0,4).map((d, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#6b7a82"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:CHART_COLORS[i % CHART_COLORS.length],flexShrink:0}} />
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.icon} {d.name}</span>
                    <span style={{color:"#aebac0"}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          }
        </div>

        {/* Group Growth line */}
        <div style={chartBox}>
          <div style={sectionLabel}>{lang === "PT" ? "Crescimento do Grupo" : "Group Growth"}</div>
          {growthData.length < 2
            ? <div style={{fontSize:11,color:"#475a64",marginTop:16,textAlign:"center"}}>{lang==="PT"?"Poucos dados":"Not enough data"}</div>
            : <ResponsiveContainer width="100%" height={90}>
              <LineChart data={growthData} margin={{top:4,right:4,left:-28,bottom:0}}>
                <XAxis dataKey="month" tick={{fontSize:9,fill:"#475a64"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:9,fill:"#475a64"}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke={CHART_TEAL} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Serving Growth line */}
        <div style={chartBox}>
          <div style={sectionLabel}>{lang === "PT" ? "Crescimento em Serviço" : "Serving Growth"}</div>
          {servingGrowthData.length < 2
            ? <div style={{fontSize:11,color:"#475a64",marginTop:16,textAlign:"center"}}>{lang==="PT"?"Poucos dados":"Not enough data"}</div>
            : <ResponsiveContainer width="100%" height={90}>
              <LineChart data={servingGrowthData} margin={{top:4,right:4,left:-28,bottom:0}}>
                <XAxis dataKey="month" tick={{fontSize:9,fill:"#475a64"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:9,fill:"#475a64"}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke={CHART_GOLD} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          }
        </div>

      </div>
    </div>
  );
}

// ─── LEADER PERSON MODAL (Mode 1) ─────────────────────────────────────────────
// Standalone component — intentionally separate from PersonPanel. Do NOT merge or share props.
// Shows: photo+name, current ministries, groups attended, top giftings, position checkboxes.
function LeaderPersonModal({ person, ministryName, ministryPositions, token, lang, onClose, onChanged }) {
  // volunteer_positions may arrive as a JSON string (D1 GROUP_ARRAY) or a parsed array — handle both.
  var personVPs = parseJSON((person && person.volunteer_positions), []);
  // Ensure it's actually an array (parseJSON with [] fallback handles null/undefined/malformed).

  // Local state tracks which positions are assigned: { position_name -> volunteer_positions id }
  const [localAssigned, setLocalAssigned] = React.useState(function() {
    // The roster endpoint is already scoped to a single ministry, so EVERY volunteer_position
    // returned for this person belongs to the current ministry. Do NOT filter by ministry_name —
    // if that field is absent/mismatched it wrongly drops all assignments, leaving assigned
    // positions shown as unchecked (which then triggers a duplicate POST → 409 → checkbox reverts).
    var map = {};
    personVPs.forEach(function(vp) { if (vp && vp.position_name) map[vp.position_name] = vp.id; });
    return map;
  });
  const [toggling, setToggling] = React.useState({}); // position_name -> bool

  var noName = lang === 'PT' ? 'Sem nome' : 'No name';
  const displayName = (person && (person.preferred_name || person.full_name || person.name)) || noName;
  const ministries = parseJSON((person && person.current_ministries));
  const groups = parseJSON((person && person.group_attendance));
  const topGiftings = [
    person && person.gifting_1,
    person && person.gifting_2,
    person && person.gifting_3
  ].filter(Boolean);

  // WhatsApp — only rendered if the roster response includes a whatsapp field.
  var waPhone = person && (person.whatsapp || person.phone || '');
  var waHref = waPhone ? 'https://wa.me/' + String(waPhone).replace(/\D/g, '') : null;

  async function togglePosition(positionName) {
    var existingId = localAssigned[positionName];
    setToggling(function(prev) { return Object.assign({}, prev, {[positionName]: true}); });
    try {
      if (existingId) {
        var delRes = await fetch(MH_API + '/volunteer-positions/' + existingId, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!delRes.ok) throw new Error('DELETE failed: ' + delRes.status);
        setLocalAssigned(function(prev) {
          var n = Object.assign({}, prev);
          delete n[positionName];
          return n;
        });
      } else {
        var res = await fetch(MH_API + '/volunteer-positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ person_id: person.id, ministry_name: ministryName, position_name: positionName })
        });
        var data = await res.json().catch(function() { return {}; });
        if (!res.ok) throw new Error('POST failed: ' + res.status + ' ' + JSON.stringify(data));
        var newId = (data && data.id) || ('_' + Date.now());
        setLocalAssigned(function(prev) { return Object.assign({}, prev, {[positionName]: newId}); });
      }
      onChanged();
    } catch(e) { console.error('[volunteer-positions] toggle failed:', e && e.message); /* revert optimistic state on failure by triggering reload */ onChanged(); }
    setToggling(function(prev) { return Object.assign({}, prev, {[positionName]: false}); });
  }

  var tx = {
    close:       lang === 'PT' ? 'Fechar' : 'Close',
    ministries:  lang === 'PT' ? 'Ministerios que serve' : 'Ministries serving in',
    groups:      lang === 'PT' ? 'Grupos que frequenta' : 'Groups attended',
    giftings:    lang === 'PT' ? 'Dons principais' : 'Top giftings',
    positions:   lang === 'PT' ? 'Posicoes nesta ministerio' : 'Positions in this ministry',
    none:        lang === 'PT' ? 'Nenhum' : 'None',
    saving:      lang === 'PT' ? 'Salvando...' : 'Saving...',
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:5000,display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingTop:0}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:380,maxWidth:'95vw',height:'100vh',overflowY:'auto',background:'#08121a',borderLeft:'1px solid rgba(94,234,212,0.18)',boxShadow:'-8px 0 40px rgba(0,0,0,0.5)'}}>
        {/* Header */}
        <div style={{padding:'20px 20px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:14,background:'linear-gradient(180deg,rgba(94,234,212,0.06),transparent)',flexShrink:0}}>
          {(person && person.photo_url) ? (
            <img src={person.photo_url} alt={displayName} style={{width:48,height:48,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(94,234,212,0.4)',flexShrink:0}} />
          ) : (
            <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,rgba(94,234,212,0.18),rgba(94,234,212,0.04))',border:'2px solid rgba(94,234,212,0.22)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:'#5eead4'}}>
              {displayName[0].toUpperCase()}
            </div>
          )}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:'#e6f1f0',lineHeight:1.2,wordBreak:'break-word'}}>{displayName}</div>
            {/* Language flags — renders only when languages_spoken is in the roster response */}
            {(person && person.languages_spoken) && (
              <div style={{fontSize:11,color:'#6b7a82',marginTop:3}}>{renderLangFlags(person, lang)}</div>
            )}
            {/* WhatsApp button — renders only when whatsapp/phone is in the roster response */}
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer"
                onClick={function(e){e.stopPropagation();}}
                style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:6,fontSize:11,padding:'4px 10px',
                  background:'linear-gradient(180deg,rgba(34,197,94,0.18),rgba(34,197,94,0.08))',
                  color:'#86efac',borderRadius:8,border:'1px solid rgba(34,197,94,0.3)',
                  cursor:'pointer',textDecoration:'none',fontWeight:500}}>
                {'💬 '}{lang==='PT'?'WhatsApp':'WhatsApp'}
              </a>
            )}
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#6b7a82',fontSize:18,cursor:'pointer',padding:'4px 8px',flexShrink:0,alignSelf:'flex-start'}}>×</button>
        </div>

        {/* Body — no nested scroll; the outer panel (height:100vh, overflowY:auto) scrolls
            everything as one, matching PersonPanel's single-scroll-container pattern. A nested
            flex:1 + overflowY:auto here clips long content because flex min-height defaults to auto. */}
        <div style={{padding:'20px',display:'flex',flexDirection:'column',gap:20}}>

          {/* Section 2 — Current ministries */}
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'#475a64',marginBottom:8}}>{tx.ministries}</div>
            {ministries.length > 0 ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {ministries.map(function(m) {
                  return (
                    <span key={m} style={{fontSize:11,padding:'3px 10px',background:'rgba(94,234,212,0.07)',color:'#5eead4',borderRadius:999,border:'1px solid rgba(94,234,212,0.18)'}}>
                      {lang === 'PT' ? (MINISTRY_PT[m] || m) : m}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span style={{fontSize:12,color:'#475a64'}}>{tx.none}</span>
            )}
          </div>

          {/* Section 3 — Groups attended */}
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'#475a64',marginBottom:8}}>{tx.groups}</div>
            {groups.length > 0 ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {groups.map(function(g) {
                  return (
                    <span key={g} style={{fontSize:11,padding:'3px 10px',background:'rgba(255,255,255,0.04)',color:'#aebac0',borderRadius:999,border:'1px solid rgba(255,255,255,0.08)'}}>
                      {g}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span style={{fontSize:12,color:'#475a64'}}>{tx.none}</span>
            )}
          </div>

          {/* Section 4 — Top giftings */}
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'#475a64',marginBottom:8}}>{tx.giftings}</div>
            {topGiftings.length > 0 ? (
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {topGiftings.map(function(g, i) {
                  return (
                    <span key={g} style={{fontSize:11,padding:'3px 10px',background:i===0?'rgba(94,234,212,0.1)':'rgba(255,255,255,0.04)',color:i===0?'#5eead4':'#aebac0',borderRadius:999,border:i===0?'1px solid rgba(94,234,212,0.22)':'1px solid rgba(255,255,255,0.08)',fontWeight:i===0?600:400}}>
                      {'#'+(i+1)+' '+(lang==='PT'?(GIFTING_PT[g]||g):g)}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span style={{fontSize:12,color:'#475a64'}}>{tx.none}</span>
            )}
          </div>

          {/* Section 5 — Position checkboxes */}
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'#475a64',marginBottom:8}}>{tx.positions}</div>
            {(ministryPositions || []).length === 0 ? (
              <span style={{fontSize:12,color:'#475a64'}}>{tx.none}</span>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {(ministryPositions || []).map(function(pos) {
                  var posName = pos.position_name || pos.name || '';
                  var isChecked = !!localAssigned[posName];
                  var isSaving = !!toggling[posName];
                  return (
                    <label key={posName} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'8px 10px',borderRadius:8,background:isChecked?'rgba(94,234,212,0.06)':'rgba(255,255,255,0.02)',border:isChecked?'1px solid rgba(94,234,212,0.18)':'1px solid rgba(255,255,255,0.05)',transition:'all 0.15s'}}>
                      <input type="checkbox" checked={isChecked} disabled={isSaving}
                        onChange={function() { togglePosition(posName); }}
                        style={{accentColor:'#5eead4',width:15,height:15,flexShrink:0,cursor:'pointer'}} />
                      <span style={{flex:1,fontSize:13,color:isChecked?'#e6f1f0':'#aebac0',fontFamily:"'Space Grotesk',sans-serif"}}>{posName}</span>
                      {isSaving && (
                        <span style={{fontSize:10,color:'#5eead4',fontFamily:"'JetBrains Mono',monospace"}}>{tx.saving}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── POSITION ASSIGN MODAL (Mode 2) ────────────────────────────────────────────
// Opened when user clicks a position row in the positions list.
// Shows: position name header, searchable roster multi-select, toggle calls POST/DELETE.
function PositionAssignModal({ position, roster, ministryName, token, lang, onClose, onChanged }) {
  var posName = (position && (position.position_name || position.name)) || '';

  // Local state: { person_id -> volunteer_positions id }
  const [localAssigned, setLocalAssigned] = React.useState(function() {
    var map = {};
    (roster || []).forEach(function(person) {
      // volunteer_positions may be a JSON string from D1 GROUP_ARRAY — parse defensively.
      parseJSON((person && person.volunteer_positions), [])
        .filter(function(vp) { return vp && vp.position_name === posName; }) // roster is already ministry-scoped; match position only
        .forEach(function(vp) { map[person.id] = vp.id; });
    });
    return map;
  });
  const [toggling, setToggling] = React.useState({});
  const [search, setSearch] = React.useState('');

  var filteredRoster = (roster || []).filter(function(p) {
    if (!search.trim()) return true;
    var name = (p.preferred_name || p.full_name || p.name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  async function togglePerson(person) {
    var existingId = localAssigned[person.id];
    setToggling(function(prev) { return Object.assign({}, prev, {[person.id]: true}); });
    try {
      if (existingId) {
        var delRes = await fetch(MH_API + '/volunteer-positions/' + existingId, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!delRes.ok) throw new Error('DELETE failed');
        setLocalAssigned(function(prev) { var n = Object.assign({}, prev); delete n[person.id]; return n; });
      } else {
        var res = await fetch(MH_API + '/volunteer-positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ person_id: person.id, ministry_name: ministryName, position_name: posName })
        });
        if (!res.ok) throw new Error('POST failed');
        var data = await res.json().catch(function() { return {}; });
        var newId = (data && data.id) || ('_' + Date.now());
        setLocalAssigned(function(prev) { return Object.assign({}, prev, {[person.id]: newId}); });
      }
      onChanged();
    } catch(e) { /* revert optimistic state on failure by triggering reload */ onChanged(); }
    setToggling(function(prev) { return Object.assign({}, prev, {[person.id]: false}); });
  }

  var tx = {
    close:      lang === 'PT' ? 'Fechar' : 'Close',
    position:   lang === 'PT' ? 'Posicao' : 'Position',
    search:     lang === 'PT' ? 'Buscar por nome...' : 'Search by name...',
    noResults:  lang === 'PT' ? 'Nenhum resultado' : 'No results',
    saving:     lang === 'PT' ? 'Salvando...' : 'Saving...',
    team:       lang === 'PT' ? 'Equipe' : 'Team',
  };

  var showSearch = (roster || []).length > 15;

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:5000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:440,maxWidth:'95vw',maxHeight:'85vh',overflowY:'auto',background:'#08121a',border:'1px solid rgba(94,234,212,0.18)',borderRadius:16,boxShadow:'0 8px 40px rgba(0,0,0,0.6)',display:'flex',flexDirection:'column'}}>
        {/* Header */}
        <div style={{padding:'18px 20px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,background:'linear-gradient(180deg,rgba(94,234,212,0.06),transparent)'}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'#475a64',marginBottom:4}}>{tx.position}</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:'#e6f1f0'}}>{posName}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#6b7a82',fontSize:18,cursor:'pointer',padding:'4px 8px'}}> × </button>
        </div>

        {/* Search — only if roster > 15 */}
        {showSearch && (
          <div style={{padding:'12px 20px 0',flexShrink:0}}>
            <input value={search} onChange={function(e){setSearch(e.target.value);}}
              placeholder={tx.search}
              style={{width:'100%',boxSizing:'border-box',padding:'8px 12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(94,234,212,0.18)',borderRadius:8,color:'#e6f1f0',fontSize:13,fontFamily:"'Space Grotesk',sans-serif",outline:'none'}} />
          </div>
        )}

        {/* Roster list */}
        <div style={{flex:1,overflowY:'auto',padding:'12px 20px 20px',display:'flex',flexDirection:'column',gap:6}}>
          {filteredRoster.length === 0 ? (
            <div style={{color:'#475a64',fontSize:13,textAlign:'center',padding:20}}>{tx.noResults}</div>
          ) : filteredRoster.map(function(person) {
            var pName = person.preferred_name || person.full_name || person.name || (lang==='PT'?'Sem nome':'No name');
            var isChecked = !!localAssigned[person.id];
            var isSaving = !!toggling[person.id];
            return (
              <label key={person.id} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'8px 10px',borderRadius:8,background:isChecked?'rgba(94,234,212,0.06)':'rgba(255,255,255,0.02)',border:isChecked?'1px solid rgba(94,234,212,0.18)':'1px solid rgba(255,255,255,0.05)',transition:'all 0.15s'}}>
                <input type="checkbox" checked={isChecked} disabled={isSaving}
                  onChange={function() { togglePerson(person); }}
                  style={{accentColor:'#5eead4',width:15,height:15,flexShrink:0,cursor:'pointer'}} />
                {person.photo_url ? (
                  <img src={person.photo_url} alt={pName} style={{width:30,height:30,borderRadius:'50%',objectFit:'cover',border:'1px solid rgba(94,234,212,0.3)',flexShrink:0}} />
                ) : (
                  <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,rgba(94,234,212,0.15),rgba(94,234,212,0.04))',border:'1px solid rgba(94,234,212,0.18)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#5eead4',fontFamily:"'Space Grotesk',sans-serif"}}>
                    {pName[0].toUpperCase()}
                  </div>
                )}
                <span style={{flex:1,fontSize:13,color:isChecked?'#e6f1f0':'#aebac0',fontFamily:"'Space Grotesk',sans-serif"}}>{pName}</span>
                {isSaving && (
                  <span style={{fontSize:10,color:'#5eead4',fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{tx.saving}</span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── RECURSOS TAB ─────────────────────────────────────────────────────────────
// Training library: YouTube embeds + external links, per-ministry, PT/EN toggle.
// All users of MinistryLeaderView are leaders — add/delete controls are always shown.
// NULL GUARD: every .map() is guarded, every prop access uses || fallback.
function RecursosTab({ ministry, token, lang }) {
  var [resources, setResources] = React.useState([]);
  var [recLoading, setRecLoading] = React.useState(false);
  var [recError, setRecError] = React.useState(null);
  var [recLang, setRecLang] = React.useState("PT");
  var [expandedIds, setExpandedIds] = React.useState({});
  var [showAddForm, setShowAddForm] = React.useState(false);
  var [deletingId, setDeletingId] = React.useState(null);
  var [formData, setFormData] = React.useState({
    title: "", type: "youtube", url: "", language: "both", description: ""
  });
  var [formSaving, setFormSaving] = React.useState(false);
  var [formError, setFormError] = React.useState(null);

  var txR = {
    heading:       recLang === "PT" ? "Recursos" : "Resources",
    langPT:        "PT",
    langEN:        "EN",
    addBtn:        recLang === "PT" ? "+ Adicionar recurso" : "+ Add resource",
    cancel:        recLang === "PT" ? "Cancelar" : "Cancel",
    save:          recLang === "PT" ? "Salvar" : "Save",
    titleLabel:    recLang === "PT" ? "Titulo" : "Title",
    typeLabel:     recLang === "PT" ? "Tipo" : "Type",
    urlLabel:      "URL",
    langLabel:     recLang === "PT" ? "Idioma" : "Language",
    descLabel:     recLang === "PT" ? "Descricao (opcional)" : "Description (optional)",
    typeYoutube:   "YouTube",
    typeLink:      recLang === "PT" ? "Link" : "Link",
    typePdfLink:   "PDF Link",
    langBoth:      recLang === "PT" ? "Ambos" : "Both",
    langPTOpt:     "PT",
    langENOpt:     "EN",
    open:          recLang === "PT" ? "Abrir" : "Open",
    play:          recLang === "PT" ? "Assistir" : "Watch",
    collapse:      recLang === "PT" ? "Recolher" : "Collapse",
    expand:        recLang === "PT" ? "Expandir" : "Expand",
    deleteBtn:     recLang === "PT" ? "Excluir" : "Delete",
    empty:         recLang === "PT"
      ? "Nenhum recurso adicionado ainda. Adicione videos e links uteis para a sua equipe."
      : "No resources yet. Add helpful videos and links for your team.",
    loadErr:       recLang === "PT" ? "Erro ao carregar recursos." : "Error loading resources.",
    titleReq:      recLang === "PT" ? "Titulo obrigatorio." : "Title is required.",
    urlReq:        recLang === "PT" ? "URL obrigatoria." : "URL is required.",
    noMinistry:    recLang === "PT" ? "Selecione um ministerio." : "Select a ministry.",
  };

  function loadResources() {
    if (!ministry || !token) return;
    setRecLoading(true);
    setRecError(null);
    fetch(MH_API + '/recursos?ministry=' + encodeURIComponent(ministry), {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        setResources(Array.isArray(data) ? data : []);
        setRecLoading(false);
      })
      .catch(function(e) {
        setRecError(txR.loadErr);
        setRecLoading(false);
      });
  }

  React.useEffect(function() {
    loadResources();
  }, [ministry, token]);

  function getYoutubeEmbedId(url) {
    if (!url) return null;
    var match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_\-]{11})/);
    return match ? match[1] : null;
  }

  function toggleExpand(id) {
    setExpandedIds(function(prev) {
      var next = Object.assign({}, prev);
      next[id] = !prev[id];
      return next;
    });
  }

  function handleDelete(id) {
    if (!id) return;
    setDeletingId(id);
    fetch(MH_API + '/recursos/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function() {
        setDeletingId(null);
        setResources(function(prev) {
          return (prev || []).filter(function(rec) { return rec && rec.id !== id; });
        });
      })
      .catch(function() {
        setDeletingId(null);
      });
  }

  function handleFormChange(field, value) {
    setFormData(function(prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  }

  function handleFormSubmit() {
    if (!ministry) { setFormError(txR.noMinistry); return; }
    var title = (formData.title || '').trim();
    var url = (formData.url || '').trim();
    if (!title) { setFormError(txR.titleReq); return; }
    if (!url) { setFormError(txR.urlReq); return; }
    setFormSaving(true);
    setFormError(null);
    fetch(MH_API + '/recursos', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ministry: ministry,
        title: title,
        type: formData.type || 'link',
        url: url,
        language: formData.language || 'both',
        description: (formData.description || '').trim() || null,
        added_by: null,
      })
    })
      .then(function(r) {
        if (!r.ok) return r.json().then(function(d) { throw new Error(d.error || ('HTTP ' + r.status)); });
        return r.json();
      })
      .then(function() {
        setFormSaving(false);
        setShowAddForm(false);
        setFormData({ title: "", type: "youtube", url: "", language: "both", description: "" });
        loadResources();
      })
      .catch(function(e) {
        setFormSaving(false);
        setFormError(e.message || 'Error saving.');
      });
  }

  // Filter by recLang (show 'both' + matching language cards)
  var filteredResources = (resources || []).filter(function(rec) {
    if (!rec) return false;
    var rLang = rec.language || 'both';
    return rLang === 'both' || rLang === recLang;
  });

  var typeBadgeStyle = function(type) {
    var isYt = type === 'youtube';
    return {
      fontSize: 10,
      padding: "2px 7px",
      borderRadius: 5,
      background: isYt ? "rgba(239,68,68,0.12)" : "rgba(94,234,212,0.08)",
      border: isYt ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(94,234,212,0.2)",
      color: isYt ? "#f87171" : "#5eead4",
      fontFamily: "'JetBrains Mono',monospace",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    };
  };

  var langBadgeStyle = function(rl) {
    return {
      fontSize: 10,
      padding: "2px 7px",
      borderRadius: 5,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#6b7a82",
      fontFamily: "'JetBrains Mono',monospace",
      whiteSpace: "nowrap",
    };
  };

  var langPillStyle = function(active) {
    return {
      padding: "5px 14px",
      borderRadius: 20,
      border: active ? "1px solid rgba(94,234,212,0.4)" : "1px solid rgba(255,255,255,0.07)",
      background: active ? "linear-gradient(180deg,rgba(94,234,212,0.15),rgba(94,234,212,0.07))" : "rgba(255,255,255,0.02)",
      color: active ? "#5eead4" : "#6b7a82",
      fontSize: 11,
      fontFamily: "'JetBrains Mono',monospace",
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      letterSpacing: "0.05em",
      transition: "all 0.18s",
    };
  };

  var inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "8px 10px",
    color: "#e6f1f0",
    fontSize: 13,
    fontFamily: "'Space Grotesk',sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  var selectStyle = Object.assign({}, inputStyle, { cursor: "pointer" });

  var labelStyle = {
    fontSize: 10,
    fontFamily: "'JetBrains Mono',monospace",
    color: "#6b7a82",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 4,
  };

  return (
    <div>
      {/* Header row: title + PT/EN lang toggle */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:20}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"#475a64"}}>
          {txR.heading}
          {!recLoading && <span style={{marginLeft:8,opacity:0.6}}>{"("+(filteredResources.length)+")"}</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={function(){setRecLang("PT");}} style={langPillStyle(recLang === "PT")}>{txR.langPT}</button>
          <button onClick={function(){setRecLang("EN");}} style={langPillStyle(recLang === "EN")}>{txR.langEN}</button>
        </div>
      </div>

      {/* Loading */}
      {recLoading && (
        <div style={{color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontSize:12,padding:"40px 0",textAlign:"center"}}>
          {recLang === "PT" ? "Carregando..." : "Loading..."}
        </div>
      )}

      {/* Error */}
      {recError && !recLoading && (
        <div style={{color:"#f87171",fontFamily:"'JetBrains Mono',monospace",fontSize:12,padding:"20px 0"}}>
          {recError}
        </div>
      )}

      {/* Empty state */}
      {!recLoading && !recError && filteredResources.length === 0 && (
        <div style={{color:"#475a64",fontSize:13,fontFamily:"'Space Grotesk',sans-serif",padding:"32px 0",lineHeight:1.6}}>
          {txR.empty}
        </div>
      )}

      {/* Resource cards */}
      {!recLoading && !recError && filteredResources.length > 0 && (
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
          {filteredResources.map(function(rec) {
            if (!rec) return null;
            var recId = rec.id;
            var recType = rec.type || 'link';
            var recTitle = rec.title || '';
            var recDesc = rec.description || null;
            var recUrl = rec.url || '';
            var recLangVal = rec.language || 'both';
            var isExpanded = !!expandedIds[recId];
            var embedId = recType === 'youtube' ? getYoutubeEmbedId(recUrl) : null;
            var isDeleting = deletingId === recId;
            var typeBadgeLabel = recType === 'youtube' ? "YouTube" : recType === 'pdf_link' ? "PDF" : "Link";

            return (
              <div key={recId} className="glass" style={{borderRadius:10,padding:"14px 16px",border:"1px solid rgba(255,255,255,0.06)"}}>
                {/* Card header row */}
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom: (recDesc || embedId) ? 10 : 0}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:14,color:"#e6f1f0",lineHeight:1.3,marginBottom:6}}>
                      {recTitle}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      <span style={typeBadgeStyle(recType)}>{typeBadgeLabel}</span>
                      {recLangVal !== 'both' && <span style={langBadgeStyle(recLangVal)}>{recLangVal}</span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
                    {recType === 'youtube' && embedId && (
                      <button
                        onClick={function(){toggleExpand(recId);}}
                        style={{padding:"5px 12px",borderRadius:6,background:"transparent",border:"1px solid rgba(94,234,212,0.25)",color:"#5eead4",fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",whiteSpace:"nowrap"}}
                      >
                        {isExpanded ? txR.collapse : txR.play}
                      </button>
                    )}
                    {recType !== 'youtube' && recUrl && (
                      <a
                        href={recUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{padding:"5px 12px",borderRadius:6,background:"transparent",border:"1px solid rgba(94,234,212,0.25)",color:"#5eead4",fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",textDecoration:"none",whiteSpace:"nowrap"}}
                      >
                        {txR.open}
                      </a>
                    )}
                    <button
                      onClick={function(){handleDelete(recId);}}
                      disabled={isDeleting}
                      style={{padding:"5px 10px",borderRadius:6,background:"transparent",border:"1px solid rgba(248,113,113,0.2)",color:isDeleting?"#475a64":"#f87171",fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:isDeleting?"default":"pointer",opacity:isDeleting?0.5:1,transition:"opacity 0.15s"}}
                    >
                      {txR.deleteBtn}
                    </button>
                  </div>
                </div>

                {/* Description */}
                {recDesc && (
                  <div style={{fontSize:12,color:"#8a9ba3",fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.5,marginBottom: embedId && isExpanded ? 10 : 0}}>
                    {recDesc}
                  </div>
                )}

                {/* YouTube embed (expanded) */}
                {recType === 'youtube' && embedId && isExpanded && (
                  <div style={{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:8,marginTop: recDesc ? 0 : 0}}>
                    <iframe
                      src={"https://www.youtube.com/embed/" + embedId}
                      title={recTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none",borderRadius:8}}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource form */}
      {!showAddForm ? (
        <button
          onClick={function(){setShowAddForm(true); setFormError(null);}}
          style={{padding:"8px 16px",borderRadius:8,background:"transparent",border:"1px solid rgba(94,234,212,0.25)",color:"#5eead4",fontSize:12,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",letterSpacing:"0.05em",transition:"all 0.18s"}}
        >
          {txR.addBtn}
        </button>
      ) : (
        <div className="glass" style={{borderRadius:10,padding:"18px 18px 14px",border:"1px solid rgba(94,234,212,0.15)",marginTop:4}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#5eead4",marginBottom:16}}>
            {txR.addBtn.replace("+ ", "")}
          </div>

          {/* Title */}
          <div style={{marginBottom:12}}>
            <label style={labelStyle}>{txR.titleLabel}</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={function(e){handleFormChange("title", e.target.value);}}
              placeholder={txR.titleLabel}
              style={inputStyle}
            />
          </div>

          {/* Type */}
          <div style={{marginBottom:12}}>
            <label style={labelStyle}>{txR.typeLabel}</label>
            <select
              value={formData.type || "youtube"}
              onChange={function(e){handleFormChange("type", e.target.value);}}
              style={selectStyle}
            >
              <option value="youtube">{txR.typeYoutube}</option>
              <option value="link">{txR.typeLink}</option>
              <option value="pdf_link">{txR.typePdfLink}</option>
            </select>
          </div>

          {/* URL */}
          <div style={{marginBottom:12}}>
            <label style={labelStyle}>{txR.urlLabel}</label>
            <input
              type="url"
              value={formData.url || ""}
              onChange={function(e){handleFormChange("url", e.target.value);}}
              placeholder={formData.type === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
              style={inputStyle}
            />
          </div>

          {/* Language */}
          <div style={{marginBottom:12}}>
            <label style={labelStyle}>{txR.langLabel}</label>
            <select
              value={formData.language || "both"}
              onChange={function(e){handleFormChange("language", e.target.value);}}
              style={selectStyle}
            >
              <option value="both">{txR.langBoth}</option>
              <option value="PT">{txR.langPTOpt}</option>
              <option value="EN">{txR.langENOpt}</option>
            </select>
          </div>

          {/* Description */}
          <div style={{marginBottom:16}}>
            <label style={labelStyle}>{txR.descLabel}</label>
            <textarea
              value={formData.description || ""}
              onChange={function(e){handleFormChange("description", e.target.value);}}
              rows={2}
              placeholder={txR.descLabel}
              style={Object.assign({}, inputStyle, {resize:"vertical",minHeight:48})}
            />
          </div>

          {/* Error */}
          {formError && (
            <div style={{color:"#f87171",fontSize:11,fontFamily:"'JetBrains Mono',monospace",marginBottom:10}}>
              {formError}
            </div>
          )}

          {/* Buttons */}
          <div style={{display:"flex",gap:8}}>
            <button
              onClick={handleFormSubmit}
              disabled={formSaving}
              style={{padding:"8px 18px",borderRadius:7,background:formSaving?"rgba(94,234,212,0.07)":"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))",border:"1px solid rgba(94,234,212,0.35)",color:"#5eead4",fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,cursor:formSaving?"default":"pointer",opacity:formSaving?0.6:1,transition:"opacity 0.18s"}}
            >
              {formSaving ? (recLang === "PT" ? "Salvando..." : "Saving...") : txR.save}
            </button>
            <button
              onClick={function(){setShowAddForm(false); setFormError(null); setFormData({title:"",type:"youtube",url:"",language:"both",description:"" });}}
              disabled={formSaving}
              style={{padding:"8px 14px",borderRadius:7,background:"transparent",border:"1px solid rgba(255,255,255,0.08)",color:"#6b7a82",fontSize:12,fontFamily:"'JetBrains Mono',monospace",cursor:formSaving?"default":"pointer"}}
            >
              {txR.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MINISTRY LEADER VIEW ──────────────────────────────────────────────────────
// Shell only. Pool/Roster (Mode 1/2/3 assignment UI) plugs into MinistryTeamTab below.
// hasBlanketAccess: owner/senior_pastor/pastor — nav dropdown controls ministry (activeMinistryOverride).
// Grant-only: pill or single-header selector inside this component; activeMinistryOverride sets initial value.
function MinistryLeaderView({ lang, grants, hasBlanketAccess, activeMinistryOverride, token }) {
  const ministryGrants = (grants || []).filter(g => (g.grant_type || g.grantType || g.type) === 'ministry_leader');

  // Access guard — should never be reachable without access, but guard anyway.
  if (!hasBlanketAccess && !ministryGrants.length) {
    return (
      <div style={{padding:"60px 32px",textAlign:"center",color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>
        {lang === "PT" ? "Voce nao tem acesso a esta visao." : "You don't have access to this view."}
      </div>
    );
  }

  const getScope = (g) => g.scope_name || g.scopeName || g.scope || "";
  const ministries = ministryGrants.map(getScope).filter(Boolean);

  // Grant-only: internal selection state, seeded from activeMinistryOverride (e.g. modal entry-point).
  const [activeMinistry, setActiveMinistry] = React.useState(activeMinistryOverride || ministries[0] || "");
  const [mlTab, setMlTab] = React.useState("team");

  // Blanket-access: ministry is fully controlled by the nav dropdown (activeMinistryOverride).
  // Grant-only: ministry is controlled internally via pill/header.
  const currentMinistry = hasBlanketAccess ? (activeMinistryOverride || "") : activeMinistry;

  // Equipe tab data
  const [roster, setRoster] = React.useState([]);
  const [ministryPositions, setMinistryPositions] = React.useState([]);
  const [equipeLoading, setEquipeLoading] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState(null); // Mode 1
  const [selectedPosition, setSelectedPosition] = React.useState(null); // Mode 2

  const loadEquipe = React.useCallback(function() {
    if (!currentMinistry || !token) return;
    setEquipeLoading(true);
    var rosterUrl = MH_API + '/ministry/' + encodeURIComponent(currentMinistry) + '/roster';
    var healthUrl = MH_API + '/ministry-health';
    Promise.all([
      fetch(rosterUrl, { headers: { Authorization: 'Bearer ' + token } }).then(function(r) { return r.json(); }).catch(function() { return []; }),
      fetch(healthUrl, { headers: { Authorization: 'Bearer ' + token } }).then(function(r) { return r.json(); }).catch(function() { return []; })
    ]).then(function(results) {
      var rosterData = Array.isArray(results[0]) ? results[0] : [];
      var healthList = Array.isArray(results[1]) ? results[1] : [];
      setRoster(rosterData);
      var card = healthList.find(function(c) { return c && c.ministry === currentMinistry; });
      setMinistryPositions(Array.isArray(card && card.positions) ? card.positions : []);
      setEquipeLoading(false);
    });
  }, [currentMinistry, token]);

  // Silent background refetch used by modals after each toggle — does NOT set equipeLoading so
  // the modal is never affected by the loading-state re-render while its own state is still updating.
  const silentRefetch = React.useCallback(function() {
    if (!currentMinistry || !token) return;
    var rosterUrl = MH_API + '/ministry/' + encodeURIComponent(currentMinistry) + '/roster';
    var healthUrl = MH_API + '/ministry-health';
    Promise.all([
      fetch(rosterUrl, { headers: { Authorization: 'Bearer ' + token } }).then(function(r) { return r.json(); }).catch(function() { return []; }),
      fetch(healthUrl, { headers: { Authorization: 'Bearer ' + token } }).then(function(r) { return r.json(); }).catch(function() { return []; })
    ]).then(function(results) {
      var rosterData = Array.isArray(results[0]) ? results[0] : [];
      var healthList = Array.isArray(results[1]) ? results[1] : [];
      setRoster(rosterData);
      var card = healthList.find(function(c) { return c && c.ministry === currentMinistry; });
      setMinistryPositions(Array.isArray(card && card.positions) ? card.positions : []);
      // Sync selectedPerson with fresh data so re-opens show current assignments.
      setSelectedPerson(function(prev) {
        if (!prev) return prev;
        return rosterData.find(function(p) { return p.id === prev.id; }) || prev;
      });
    });
  }, [currentMinistry, token]);

  React.useEffect(function() {
    if (mlTab === 'team') loadEquipe();
  }, [mlTab, loadEquipe]);

  const tx = {
    team:      lang === "PT" ? "Equipe"   : "Team",
    schedule:  lang === "PT" ? "Agenda"   : "Schedule",
    resources: lang === "PT" ? "Recursos" : "Resources",
    soon:      lang === "PT" ? "Em breve" : "Coming soon",
    viewLabel: lang === "PT" ? "VISAO DO LIDER DE MINISTERIO" : "MINISTRY LEADER VIEW",
  };

  const pillStyle = (active) => ({
    padding:"6px 14px",
    borderRadius:20,
    border: active ? "1px solid rgba(94,234,212,0.4)" : "1px solid rgba(255,255,255,0.07)",
    background: active ? "linear-gradient(180deg,rgba(94,234,212,0.15),rgba(94,234,212,0.07))" : "rgba(255,255,255,0.02)",
    color: active ? "#5eead4" : "#6b7a82",
    fontSize:12,
    fontFamily:"'JetBrains Mono',monospace",
    fontWeight: active ? 600 : 400,
    cursor:"pointer",
    letterSpacing:"0.05em",
    transition:"all 0.18s",
  });

  const subTabStyle = (active) => ({
    background:"transparent",
    border:"none",
    padding:"6px 10px",
    position:"relative",
    color: active ? "#e6f1f0" : "#6b7a82",
    fontSize:12,
    fontFamily:"'JetBrains Mono',monospace",
    fontWeight:600,
    letterSpacing:"0.08em",
    textTransform:"uppercase",
    cursor:"pointer",
    transition:"color 0.18s",
    whiteSpace:"nowrap",
  });

  return (
    <div style={{padding:"28px 32px",maxWidth:1200}}>
      {/* View label */}
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#475a64",marginBottom:20}}>
        {tx.viewLabel}
      </div>

      {/* Ministry header / selector:
          - Blanket access: nav dropdown is the selector; show chosen ministry as plain header here.
          - Grant-only, 1 ministry: plain header.
          - Grant-only, multiple ministries: pill selector. */}
      {hasBlanketAccess ? (
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:22,color:"#e6f1f0",marginBottom:24,lineHeight:1.25}}>
          {currentMinistry}
        </div>
      ) : ministries.length === 1 ? (
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:22,color:"#e6f1f0",marginBottom:24,lineHeight:1.25}}>
          {activeMinistry}
        </div>
      ) : (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
          {ministries.map(m => (
            <button key={m} onClick={() => setActiveMinistry(m)} style={pillStyle(activeMinistry === m)}>
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Sub-tab bar */}
      <div style={{display:"flex",gap:4,borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:28}}>
        {[["team", tx.team], ["schedule", tx.schedule], ["resources", tx.resources]].map(([id, label]) => (
          <button key={id} onClick={() => setMlTab(id)} style={subTabStyle(mlTab === id)}>
            {label}
            {mlTab === id && <span style={{position:"absolute",left:0,right:0,bottom:-1,height:2,background:"linear-gradient(90deg,transparent,#5eead4,transparent)",boxShadow:"0 0 12px #5eead4"}} />}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {mlTab === "team" && (
        <RefErrorBoundary onBack={function() { setMlTab("schedule"); }}>
          <div>
            {equipeLoading ? (
              <div style={{color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",fontSize:12,padding:"40px 0",textAlign:"center"}}>{lang==="PT"?"Carregando...":"Loading..."}</div>
            ) : (
              <div>

                {/* ── TOP: Equipe / Roster grid ── */}
                <div style={{marginBottom:40}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:16}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"#475a64"}}>
                      {lang==="PT"?"EQUIPE":"TEAM"}
                    </span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#475a64"}}>
                      {"("+(roster||[]).length+")"}
                    </span>
                  </div>

                  {(roster||[]).length === 0 ? (
                    <div style={{color:"#475a64",fontSize:13,fontFamily:"'Space Grotesk',sans-serif",padding:"20px 0"}}>
                      {lang==="PT"?"Nenhum membro encontrado neste ministerio.":"No members found for this ministry."}
                    </div>
                  ) : (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                      {(roster||[]).map(function(person) {
                        var pName = person.preferred_name || person.full_name || person.name || (lang==="PT"?"Sem nome":"No name");
                        var pMins = parseJSON(person.current_ministries);
                        var topGift = person.gifting_1 ? (lang==="PT"?(GIFTING_PT[person.gifting_1]||person.gifting_1):person.gifting_1) : null;
                        // volunteer_positions may be a JSON string from D1 — parse defensively.
                        var personVPs = parseJSON(person.volunteer_positions, []);
                        // Roster is already scoped to this ministry — every VP here belongs to it.
                        var myPos = personVPs.filter(function(vp){ return vp && vp.position_name; });
                        return (
                          <div key={person.id} onClick={function(){ setSelectedPerson(person); }}
                            className="glass glow-hover"
                            style={{borderRadius:10,padding:"14px 14px 12px",cursor:"pointer",transition:"all 0.18s",borderTop:"1px solid rgba(94,234,212,0.12)"}}>
                            {/* Photo + name row */}
                            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                              {person.photo_url ? (
                                <img src={person.photo_url} alt={pName} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(94,234,212,0.35)",flexShrink:0}} />
                              ) : (
                                <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,rgba(94,234,212,0.18),rgba(94,234,212,0.04))",border:"1px solid rgba(94,234,212,0.2)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#5eead4",fontFamily:"'Space Grotesk',sans-serif"}}>
                                  {pName[0].toUpperCase()}
                                </div>
                              )}
                              <div style={{minWidth:0}}>
                                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:"#e6f1f0",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pName}</div>
                                {topGift && <div style={{fontSize:10,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace",marginTop:2,opacity:0.8}}>{topGift}</div>}
                                {person.languages_spoken && <div style={{fontSize:10,color:"#6b7a82",marginTop:2}}>{renderLangFlags(person, lang)}</div>}
                              </div>
                            </div>
                            {/* Ministry chips (other ministries this person serves) */}
                            {pMins.length > 0 && (
                              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                                {pMins.slice(0,3).map(function(m){
                                  return <span key={m} style={{fontSize:10,padding:"2px 7px",background:"rgba(255,255,255,0.04)",color:"#6b7a82",borderRadius:999,border:"1px solid rgba(255,255,255,0.07)"}}>
                                    {lang==="PT"?(MINISTRY_PT[m]||m):m}
                                  </span>;
                                })}
                              </div>
                            )}
                            {/* Position tags for THIS ministry */}
                            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                              {myPos.length > 0 ? myPos.map(function(vp){
                                return <span key={vp.id||vp.position_name} style={{fontSize:10,padding:"2px 8px",background:"rgba(94,234,212,0.1)",color:"#5eead4",borderRadius:999,border:"1px solid rgba(94,234,212,0.22)",fontWeight:600}}>
                                  {vp.position_name}
                                </span>;
                              }) : (
                                <span style={{fontSize:10,color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontStyle:"italic"}}>
                                  {lang==="PT"?"Sem posicao":"No position"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── BOTTOM: Posicoes / Positions list ── */}
                <div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"#475a64",marginBottom:14}}>
                    {lang==="PT"?"POSICOES":"POSITIONS"}
                  </div>
                  {ministryPositions.length === 0 ? (
                    <div style={{color:"#475a64",fontSize:13,fontFamily:"'Space Grotesk',sans-serif"}}>
                      {lang==="PT"?"Nenhuma posicao cadastrada.":"No positions on file."}
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {ministryPositions.map(function(pos) {
                        var posName = pos.position_name || pos.name || "";
                        // Collect the people in the roster assigned to this position (roster is already
                        // ministry-scoped, so a position_name match is sufficient). Used for both the
                        // filled count AND the avatar+name chips below.
                        var assignedPeople = (roster||[]).filter(function(p){
                          return parseJSON(p.volunteer_positions, []).some(function(vp){ return vp && vp.position_name===posName; });
                        });
                        var filledFromRoster = assignedPeople.length;
                        // Use filled from roster if > 0, otherwise fall back to mhPosFilled (form+system counts)
                        var filled = filledFromRoster > 0 ? filledFromRoster : mhPosFilled(pos);
                        var minC = pos.min_count || 0;
                        var idealC = pos.ideal_count || 0;
                        var st = mhPosStatus(filled, minC, idealC);
                        var dotColor = st==="healthy"?"#34d399":st==="needs_volunteers"?"#f59e0b":st==="critical"?"#f87171":"#475a64";
                        var posNoName = lang==="PT"?"Sem nome":"No name";
                        return (
                          <div key={posName} onClick={function(){ setSelectedPosition(pos); }}
                            className="glow-hover"
                            style={{display:"flex",flexDirection:"column",gap:8,padding:"10px 14px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",cursor:"pointer",transition:"all 0.15s"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                              <span style={{width:8,height:8,borderRadius:"50%",background:dotColor,flexShrink:0,boxShadow:"0 0 6px "+dotColor+"99"}} />
                              <span style={{flex:1,fontFamily:"'Space Grotesk',sans-serif",fontSize:13,color:"#e6f1f0"}}>{posName}</span>
                              <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"#6b7a82",flexShrink:0}}>
                                {filled}{minC>0?" / "+minC:""}
                              </span>
                            </div>
                            {/* Assigned-people chips — small avatar (or initial fallback) + preferred name. */}
                            {assignedPeople.length > 0 && (
                              <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingLeft:20}}>
                                {assignedPeople.map(function(p){
                                  var pcName = p.preferred_name || p.full_name || posNoName;
                                  return (
                                    <span key={p.id} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px 3px 3px",background:"rgba(94,234,212,0.07)",borderRadius:999,border:"1px solid rgba(94,234,212,0.15)"}}>
                                      {p.photo_url ? (
                                        <img src={p.photo_url} alt={pcName} style={{width:20,height:20,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
                                      ) : (
                                        <span style={{width:20,height:20,borderRadius:"50%",background:"linear-gradient(135deg,rgba(94,234,212,0.25),rgba(94,234,212,0.08))",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#5eead4",fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>{(pcName[0]||"?").toUpperCase()}</span>
                                      )}
                                      <span style={{fontSize:11,color:"#cfe9e5",fontFamily:"'Space Grotesk',sans-serif"}}>{pcName}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Mode 1 — person modal */}
            {selectedPerson && (
              <LeaderPersonModal
                person={selectedPerson}
                ministryName={currentMinistry}
                ministryPositions={ministryPositions}
                token={token}
                lang={lang}
                onClose={function(){ setSelectedPerson(null); }}
                onChanged={silentRefetch}
              />
            )}

            {/* Mode 2 — position assign modal */}
            {selectedPosition && (
              <PositionAssignModal
                position={selectedPosition}
                roster={roster||[]}
                ministryName={currentMinistry}
                token={token}
                lang={lang}
                onClose={function(){ setSelectedPosition(null); }}
                onChanged={silentRefetch}
              />
            )}
          </div>
        </RefErrorBoundary>
      )}
      {mlTab === "schedule" && (
        <div style={{color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace",fontSize:12,letterSpacing:"0.05em"}}>
          {tx.soon}
        </div>
      )}
      {mlTab === "resources" && (
        <RecursosTab
          ministry={currentMinistry}
          token={token}
          lang={lang}
        />
      )}
    </div>
  );
}

function GroupLeaderView({ token, lang, groupName, scheduledBy }) {
  const [allPersons, setAllPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [glTab, setGlTab] = useState("attending");
  const [sundayOpen, setSundayOpen] = useState(false);
  const [expandedMinistry, setExpandedMinistry] = useState(null);
  const [alsoServingOpen, setAlsoServingOpen] = useState(false);
  const [schedDateIdx, setSchedDateIdx] = useState(0);
  const [schedRefresh, setSchedRefresh] = useState(0);
  const [schedData, setSchedData] = useState(null);
  const [schedLoading, setSchedLoading] = useState(false);
  const [schedError, setSchedError] = useState(false);
  const [assignPickerArea, setAssignPickerArea] = useState(null);
  const [assignPickerSearch, setAssignPickerSearch] = useState("");
  const [conflictInfo, setConflictInfo] = useState(null);
  const [savingArea, setSavingArea] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [pnnSavingArea, setPnnSavingArea] = useState(null);

  const tx = {
    serving:       lang === "PT" ? "Servindo"        : "Serving",
    attending:     lang === "PT" ? "Frequentando"    : "Attending",
    ourTeam:       lang === "PT" ? "Nossa Equipe"    : "Our Team",
    sundayPool:    lang === "PT" ? "Voluntarios do Culto de Domingo" : "Sunday Ministry Volunteers",
    sundaySub:     lang === "PT" ? "Pessoas servindo no culto que podem ter interesse neste grupo" : "People serving on Sundays who may be a fit for this group",
    noServing:        lang === "PT" ? "Nenhum voluntario neste grupo ainda." : "No volunteers in this group yet.",
    noAttending:      lang === "PT" ? "Nenhum membro registrado neste grupo." : "No members recorded for this group.",
    noSunday:         lang === "PT" ? "Nenhum voluntario do culto identificado para este grupo." : "No Sunday volunteers identified for this group yet.",
    notYetServing:    lang === "PT" ? "Nao serve ainda" : "Not yet serving",
    leader:           lang === "PT" ? "Lider" : "Leader",
    people:           lang === "PT" ? "pessoas" : "people",
    person:           lang === "PT" ? "pessoa"  : "person",
    glView:           lang === "PT" ? "VISAO DO LIDER" : "GROUP LEADER VIEW",
    scheduling:       lang === "PT" ? "AGENDAMENTO DO SERVICO" : "SERVICE SCHEDULING",
    openSlot:         lang === "PT" ? "Em aberto" : "Open",
    notNeeded:        lang === "PT" ? "Nao necessario" : "Not Needed",
    markNotNeeded:    lang === "PT" ? "Marcar como nao necessario" : "Mark as Not Needed",
    unmarkNotNeeded:  lang === "PT" ? "Desfazer" : "Undo",
    assign:           lang === "PT" ? "Atribuir" : "Assign",
    reassign:         lang === "PT" ? "Reatribuir" : "Reassign",
    remove:           lang === "PT" ? "Remover" : "Remove",
    pcLocked:         lang === "PT" ? "Nao sincronizado com o Planning Center ainda" : "Not yet synced from Planning Center",
    conflictTitle:    lang === "PT" ? "Conflito de Agendamento" : "Scheduling Conflict",
    confirmOverride:  lang === "PT" ? "Confirmar mesmo assim" : "Confirm Anyway",
    cancel:           lang === "PT" ? "Cancelar" : "Cancel",
    searchPeople:     lang === "PT" ? "Buscar pessoa..." : "Search people...",
    noResults:        lang === "PT" ? "Nenhum resultado" : "No results",
    unfilled:         lang === "PT" ? "Areas em Aberto" : "Unfilled Areas",
    noUnfilled:       lang === "PT" ? "Nenhuma area em aberto para este servico." : "No unfilled areas for this service.",
    noScheduleData:   lang === "PT" ? "Nenhum dado de agendamento para esta data." : "No schedule data for this date.",
    schedErr:         lang === "PT" ? "Erro ao carregar agendamento." : "Error loading schedule.",
  };

  useEffect(() => {
    if (!token || !groupName) return;
    setLoading(true);
    fetch(`${API}/people`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(async (people) => {
        if (!Array.isArray(people)) { setLoading(false); return; }
        const detailed = await Promise.all(
          people.map(p =>
            fetch(`${API}/person/${p.id}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.json())
              .catch(() => p)
          )
        );
        setAllPersons(detailed.filter(Boolean));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, groupName]);

  const upcomingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSun = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const base = new Date(today);
    base.setDate(today.getDate() + daysToSun);
    for (let i = 0; i < 8; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i * 7);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const schedDate = upcomingDates[schedDateIdx] || upcomingDates[0] || "";

  useEffect(() => {
    if (!token || !groupName || !schedDate) return;
    setSchedLoading(true);
    setSchedError(false);
    fetch(`${API}/group-schedule?group_name=${encodeURIComponent(groupName)}&service_date=${encodeURIComponent(schedDate)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        setSchedData(Array.isArray(data) ? data : (Array.isArray(data?.areas) ? data.areas : []));
        setSchedLoading(false);
      })
      .catch(() => { setSchedError(true); setSchedLoading(false); });
  }, [token, groupName, schedDate, schedRefresh]);

  function refreshSchedule() { setSchedRefresh(c => c + 1); }

  const STATUS_OPTIONS = [
    { value: "not_contacted",    label: lang === "PT" ? "Nao contatado"   : "Not Contacted" },
    { value: "pending",          label: lang === "PT" ? "Pendente"         : "Pending" },
    { value: "confirmed",        label: lang === "PT" ? "Confirmado"       : "Confirmed" },
    { value: "wants_reschedule", label: lang === "PT" ? "Quer remarcar"    : "Wants Reschedule" },
    { value: "declined",         label: lang === "PT" ? "Recusou"          : "Declined" },
  ];

  function doAssign(area, personId, overrideConflict) {
    const areaKey = area?.area_name || area?.name || "";
    const body = {
      ministry: areaKey,
      position_name: area?.position_name || areaKey,
      person_id: personId,
      service_date: schedDate,
      service_name: groupName,
      scheduled_by: scheduledBy || "group_leader",
      ...(overrideConflict ? { override_conflict: true } : {}),
    };
    setSavingArea(areaKey);
    fetch(`${API}/schedule/assignment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(r => {
        if (r.status === 409) return r.json().then(d => { throw { conflict: true, conflicting_ministry: d?.conflicting_ministry || "another service", area, personId }; });
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(() => {
        setSavingArea(null);
        setAssignPickerArea(null);
        setAssignPickerSearch("");
        setConflictInfo(null);
        refreshSchedule();
      })
      .catch(err => {
        setSavingArea(null);
        if (err && err.conflict) {
          setAssignPickerArea(null);
          setAssignPickerSearch("");
          setConflictInfo(err);
        }
      });
  }

  function doUpdateStatus(assignmentId, status) {
    if (!assignmentId) return;
    setStatusSavingId(assignmentId);
    fetch(`${API}/schedule/assignment/${assignmentId}/status`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status, updated_by: scheduledBy || "group_leader" }),
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(() => { setStatusSavingId(null); refreshSchedule(); })
      .catch(() => setStatusSavingId(null));
  }

  function doDeleteAssignment(assignmentId) {
    if (!assignmentId) return;
    setDeletingId(assignmentId);
    fetch(`${API}/schedule/assignment/${assignmentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(() => { setDeletingId(null); refreshSchedule(); })
      .catch(() => setDeletingId(null));
  }

  function doMarkNotNeeded(area) {
    const areaKey = area?.area_name || area?.name || "";
    setPnnSavingArea(areaKey);
    fetch(`${API}/schedule/position-not-needed`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ministry: areaKey,
        position_name: area?.position_name || areaKey,
        service_date: schedDate,
        service_name: groupName,
        marked_by: scheduledBy || "group_leader",
      }),
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(() => { setPnnSavingArea(null); refreshSchedule(); })
      .catch(() => setPnnSavingArea(null));
  }

  function doUnmarkNotNeeded(pnnId) {
    if (!pnnId) return;
    setPnnSavingArea("_unmark_");
    fetch(`${API}/schedule/position-not-needed/${pnnId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(() => { setPnnSavingArea(null); refreshSchedule(); })
      .catch(() => setPnnSavingArea(null));
  }

  const groupRolesFor = (person) => {
    if (!person.group_roles) return [];
    return person.group_roles.filter(r => r.group_name === groupName).map(r => r.role);
  };

  const serving = allPersons.filter(p => groupRolesFor(p).length > 0);
  const servingIds = new Set(serving.map(p => p.id));

  // All attendees (including those who also serve)
  const attending = allPersons.filter(p => {
    const att = parseJSON(p.group_attendance);
    return att && att.includes(groupName);
  });
  // Sub-sections for Attending tab
  const attendingAlsoServing = attending.filter(p => servingIds.has(p.id));
  const attendingNotServing = attending.filter(p => !servingIds.has(p.id));

  const groupRoles = GROUP_ROLE_MAP_DASH[groupName] || [];
  const sundayByMinistry = {};
  Object.entries(MINISTRY_TO_GL_ROLE).forEach(([ministry, glRole]) => {
    if (!groupRoles.includes(glRole)) return;
    const pool = allPersons.filter(p => {
      if (servingIds.has(p.id)) return false;
      const minis = parseJSON(p.current_ministries);
      return minis && minis.includes(ministry);
    });
    if (pool.length > 0) sundayByMinistry[ministry] = pool;
  });

  const displayName = (p) => p.preferred_name || p.name || "";

  const GlAvatar = ({ person }) => {
    const initials = displayName(person).split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    return (
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,rgba(94,234,212,0.2),rgba(94,234,212,0.08))",border:"1px solid rgba(94,234,212,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#5eead4",fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>{initials||"?"}</div>
    );
  };

  const Chip = ({ label, teal }) => (
    <span style={{fontSize:11,padding:"3px 8px",borderRadius:5,background:teal?"rgba(94,234,212,0.07)":"rgba(255,255,255,0.04)",border:teal?"1px solid rgba(94,234,212,0.28)":"1px solid rgba(255,255,255,0.07)",color:teal?"#5eead4":"#aebac0",whiteSpace:"nowrap"}}>{label}</span>
  );

  const GiftBadge = ({ person }) => {
    if (!person.gifting_1) return null;
    const label = lang === "PT" ? (GIFTING_LABEL_PT[person.gifting_1] || person.gifting_1) : person.gifting_1;
    return <span style={{fontSize:11,padding:"3px 8px",borderRadius:5,background:"rgba(94,234,212,0.06)",border:"1px solid rgba(94,234,212,0.2)",color:"#5eead4"}}>{GIFTING_ICONS[person.gifting_1]||"◆"} {label}</span>;
  };

  const PersonRow = ({ person, showRoles }) => {
    const roles = showRoles ? groupRolesFor(person) : [];
    const minis = parseJSON(person.current_ministries) || [];
    return (
      <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <GlAvatar person={person} />
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:14,color:"#e6f1f0",marginBottom:6}}>{displayName(person)}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {roles.map(r => <Chip key={r} label={r} teal />)}
            {minis.map(m => <Chip key={m} label={m} />)}
            {!showRoles && minis.length === 0 && <span style={{fontSize:11,color:"#475a64",fontStyle:"italic"}}>{tx.notYetServing}</span>}
            <GiftBadge person={person} />
          </div>
        </div>
      </div>
    );
  };

  const PillBtn = ({ id, label, count }) => {
    const active = glTab === id;
    return (
      <button onClick={() => setGlTab(id)} style={{padding:"6px 14px",borderRadius:999,fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.1em",cursor:"pointer",transition:"all 0.18s",background:active?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",border:active?"1px solid rgba(94,234,212,0.35)":"1px solid rgba(255,255,255,0.06)",color:active?"#5eead4":"#6b7a82"}}>
        {label} ({count})
      </button>
    );
  };

  if (loading) return (
    <div style={{padding:60,textAlign:"center",color:"#475a64",fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase"}}>...</div>
  );

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:8}}>{tx.glView}</div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:28,color:"#e6f1f0",margin:0}}>{groupName}</h1>
      </div>

      {/* Section A */}
      <div className="glass" style={{borderRadius:16,padding:24,marginBottom:20}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:14,fontWeight:500}}>{tx.ourTeam}</div>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          <PillBtn id="attending" label={tx.attending} count={attending.length} />
          <PillBtn id="serving" label={tx.serving} count={serving.length} />
        </div>
        {glTab === "serving" && (
          serving.length === 0
            ? <div style={{color:"#475a64",fontSize:13,padding:"12px 0"}}>{tx.noServing}</div>
            : serving.map(p => <PersonRow key={p.id} person={p} showRoles />)
        )}
        {glTab === "attending" && (
          attending.length === 0
            ? <div style={{color:"#475a64",fontSize:13,padding:"12px 0"}}>{tx.noAttending}</div>
            : (
              <>
                {/* Also Serving sub-section */}
                {attendingAlsoServing.length > 0 && (
                  <div style={{marginBottom:18}}>
                    <button onClick={()=>setAlsoServingOpen(o=>!o)}
                      style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",padding:"0 0 10px",width:"100%"}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#5eead4",fontWeight:600}}>
                        {lang==="PT"?"Tambem Servindo":"Also Serving"} ({attendingAlsoServing.length})
                      </span>
                      <span style={{color:"#475a64",fontSize:10,marginLeft:"auto"}}>{alsoServingOpen?"▼":"▶"}</span>
                    </button>
                    {alsoServingOpen && attendingAlsoServing.map(p => (
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                        <GlAvatar person={p} />
                        <span style={{fontSize:13,color:"#aebac0",flex:1}}>{displayName(p)}</span>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {groupRolesFor(p).map(r=><Chip key={r} label={r} teal />)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Not Yet Serving sub-section */}
                <div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82",fontWeight:600,marginBottom:12}}>
                    {lang==="PT"?"Ainda nao Servindo":"Not Yet Serving"} ({attendingNotServing.length})
                  </div>
                  {attendingNotServing.length === 0
                    ? <div style={{color:"#475a64",fontSize:13}}>{lang==="PT"?"Todos os membros ja servem neste grupo.":"All members already serve in this group."}</div>
                    : attendingNotServing.map(p => <PersonRow key={p.id} person={p} showRoles={false} />)
                  }
                </div>
              </>
            )
        )}
      </div>

      {/* Section B — Group Health Analytics (4C) */}
      <GroupHealthBox attending={attending} serving={serving} lang={lang} groupName={groupName} />

      {/* Section D — Service Scheduler */}
      <div className="glass" style={{borderRadius:16,padding:24,marginBottom:20}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,marginBottom:16}}>{tx.scheduling}</div>

        {/* Date selector */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={()=>setSchedDateIdx(i=>Math.max(0,i-1))} disabled={schedDateIdx===0}
            style={{background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:schedDateIdx===0?"#475a64":"#aebac0",cursor:schedDateIdx===0?"default":"pointer",padding:"4px 10px",fontSize:14,lineHeight:1}}>
            {"<"}
          </button>
          {upcomingDates.slice(Math.max(0,schedDateIdx-1), schedDateIdx+4).map((d) => {
            const absIdx = upcomingDates.indexOf(d);
            const isSelected = d === schedDate;
            return (
              <button key={d} onClick={()=>setSchedDateIdx(absIdx)}
                style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",
                  background:isSelected?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"rgba(255,255,255,0.02)",
                  border:isSelected?"1px solid rgba(94,234,212,0.35)":"1px solid rgba(255,255,255,0.05)",
                  color:isSelected?"#5eead4":"#6b7a82",fontWeight:isSelected?600:400}}>
                {d}
              </button>
            );
          })}
          <button onClick={()=>setSchedDateIdx(i=>Math.min(upcomingDates.length-1,i+1))} disabled={schedDateIdx===upcomingDates.length-1}
            style={{background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:schedDateIdx===upcomingDates.length-1?"#475a64":"#aebac0",cursor:schedDateIdx===upcomingDates.length-1?"default":"pointer",padding:"4px 10px",fontSize:14,lineHeight:1}}>
            {">"}
          </button>
        </div>

        {/* Area list */}
        {schedLoading && (
          <div style={{color:"#475a64",fontSize:12,padding:"12px 0",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em"}}>...</div>
        )}
        {schedError && (
          <div style={{color:"#e07070",fontSize:13,padding:"12px 0"}}>{tx.schedErr}</div>
        )}
        {!schedLoading && !schedError && schedData !== null && (schedData || []).length === 0 && (
          <div style={{color:"#475a64",fontSize:13,padding:"12px 0"}}>{tx.noScheduleData}</div>
        )}
        {!schedLoading && !schedError && (schedData || []).map((area) => {
          const areaKey = area?.area_name || area?.name || "";
          const isLocked = area?.is_locked_external === 1;
          const assignments = area?.assignments || [];
          const firstAssignment = assignments[0] || null;
          const pnn = area?.position_not_needed || null;
          const pnnId = pnn && typeof pnn === "object" ? (pnn?.id || null) : null;
          const isNotNeeded = !!pnn;
          const isSaving = savingArea === areaKey;
          const isDeleting = !!(firstAssignment && deletingId === firstAssignment?.id);
          const isStatusSaving = !!(firstAssignment && statusSavingId === firstAssignment?.id);
          const isPnnSaving = pnnSavingArea === areaKey || (isNotNeeded && pnnSavingArea === "_unmark_");

          const assignedPersonName = firstAssignment
            ? (firstAssignment?.person_name || (() => { const p = allPersons.find(x => x && x.id === firstAssignment?.person_id); return p ? displayName(p) : String(firstAssignment?.person_id || ""); })())
            : null;

          return (
            <div key={areaKey || String(area?.display_order)} style={{
              display:"flex",alignItems:"flex-start",gap:10,padding:"12px 0",
              borderBottom:"1px solid rgba(255,255,255,0.04)",
              opacity:isNotNeeded ? 0.45 : 1,
            }}>
              {/* Area name */}
              <div style={{flex:"0 0 148px",minWidth:0,paddingTop:2}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:13,color:isNotNeeded?"#475a64":"#e6f1f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{areaKey}</div>
              </div>

              {/* Assignment content */}
              <div style={{flex:1,minWidth:0}}>
                {isLocked ? (
                  <span style={{fontSize:12,color:"#475a64",fontStyle:"italic"}}>{tx.pcLocked}</span>
                ) : isNotNeeded ? (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Chip label={tx.notNeeded} />
                    <button onClick={()=>{ if (!isPnnSaving) doUnmarkNotNeeded(pnnId); }}
                      style={{fontSize:11,color:"#5eead4",background:"none",border:"none",cursor:"pointer",padding:0,opacity:isPnnSaving?0.4:1}}>
                      {tx.unmarkNotNeeded}
                    </button>
                  </div>
                ) : firstAssignment ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,color:"#e6f1f0",fontWeight:500}}>{assignedPersonName}</span>
                    <select
                      disabled={isStatusSaving}
                      value={firstAssignment?.status || "not_contacted"}
                      onChange={e => doUpdateStatus(firstAssignment?.id, e.target.value)}
                      style={{fontSize:11,background:"#0f1e24",border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,color:"#aebac0",padding:"2px 6px",cursor:"pointer",opacity:isStatusSaving?0.4:1}}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={()=>{ if (!isSaving) { setAssignPickerArea(area); setAssignPickerSearch(""); } }}
                      style={{fontSize:11,color:"#5eead4",background:"none",border:"1px solid rgba(94,234,212,0.25)",borderRadius:5,padding:"2px 8px",cursor:"pointer",opacity:isSaving?0.4:1}}>
                      {tx.reassign}
                    </button>
                    <button onClick={()=>{ if (!isDeleting) doDeleteAssignment(firstAssignment?.id); }}
                      style={{fontSize:11,color:"#e07070",background:"none",border:"1px solid rgba(220,100,100,0.2)",borderRadius:5,padding:"2px 8px",cursor:"pointer",opacity:isDeleting?0.4:1}}>
                      {tx.remove}
                    </button>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Chip label={tx.openSlot} />
                    <button onClick={()=>{ setAssignPickerArea(area); setAssignPickerSearch(""); }}
                      style={{fontSize:12,color:"#5eead4",background:"rgba(94,234,212,0.06)",border:"1px solid rgba(94,234,212,0.2)",borderRadius:6,padding:"4px 12px",cursor:"pointer"}}>
                      {tx.assign}
                    </button>
                  </div>
                )}
              </div>

              {/* Not-needed toggle */}
              {!isLocked && !isNotNeeded && (
                <button onClick={()=>{ if (!isPnnSaving) doMarkNotNeeded(area); }}
                  style={{fontSize:10,color:"#475a64",background:"none",border:"none",cursor:"pointer",padding:"4px 0",flexShrink:0,opacity:isPnnSaving?0.4:1,whiteSpace:"nowrap",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.05em"}}>
                  {tx.markNotNeeded}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign picker modal */}
      {assignPickerArea !== null && (
        <div onClick={()=>{ setAssignPickerArea(null); setAssignPickerSearch(""); }}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} className="glass modal-panel"
            style={{width:"min(460px,92vw)",maxHeight:"80vh",borderRadius:16,padding:24,display:"flex",flexDirection:"column",boxShadow:"0 40px 80px -30px rgba(0,0,0,0.7),0 0 0 1px rgba(94,234,212,0.08) inset"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#5eead4",marginBottom:4}}>
              {tx.assign}
            </div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:16,color:"#e6f1f0",marginBottom:16}}>
              {assignPickerArea?.area_name || assignPickerArea?.name || ""}
            </div>
            <input
              autoFocus
              placeholder={tx.searchPeople}
              value={assignPickerSearch}
              onChange={e=>setAssignPickerSearch(e.target.value || "")}
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#e6f1f0",fontSize:13,fontFamily:"'Space Grotesk',sans-serif",marginBottom:12,outline:"none"}}
            />
            <div style={{overflowY:"auto",flex:1}}>
              {(() => {
                const search = (assignPickerSearch || "").toLowerCase();
                const filtered = (attending || []).filter(p => {
                  const n = (p?.preferred_name || p?.name || "").toLowerCase();
                  return !search || n.includes(search);
                });
                if (filtered.length === 0) return <div style={{color:"#475a64",fontSize:13,padding:"12px 0"}}>{tx.noResults}</div>;
                return filtered.map(p => {
                  const isSav = savingArea === (assignPickerArea?.area_name || assignPickerArea?.name || "");
                  return (
                    <button key={p?.id} onClick={()=>{ if (!isSav) doAssign(assignPickerArea, p?.id, false); }}
                      disabled={isSav}
                      style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px",cursor:isSav?"default":"pointer",marginBottom:4,opacity:isSav?0.5:1,textAlign:"left"}}>
                      <GlAvatar person={p} />
                      <span style={{fontSize:13,color:"#e6f1f0",fontFamily:"'Space Grotesk',sans-serif",fontWeight:500}}>{displayName(p)}</span>
                    </button>
                  );
                });
              })()}
            </div>
            <button onClick={()=>{ setAssignPickerArea(null); setAssignPickerSearch(""); }}
              style={{marginTop:16,padding:"8px 20px",borderRadius:8,background:"none",border:"1px solid rgba(255,255,255,0.08)",color:"#6b7a82",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em"}}>
              {tx.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Conflict confirmation modal */}
      {conflictInfo !== null && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div className="glass modal-panel"
            style={{width:"min(420px,92vw)",borderRadius:16,padding:28,boxShadow:"0 40px 80px -30px rgba(0,0,0,0.7),0 0 0 1px rgba(94,234,212,0.08) inset"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#e07070",marginBottom:10}}>{tx.conflictTitle}</div>
            <div style={{fontSize:14,color:"#e6f1f0",marginBottom:20,lineHeight:1.6}}>
              {lang === "PT"
                ? `Esta pessoa ja esta agendada em ${conflictInfo?.conflicting_ministry || ""} nesta data.`
                : `This person is already scheduled in ${conflictInfo?.conflicting_ministry || ""} on this date.`}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>doAssign(conflictInfo?.area, conflictInfo?.personId, true)}
                style={{flex:1,padding:"9px 0",borderRadius:8,background:"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))",border:"1px solid rgba(94,234,212,0.35)",color:"#5eead4",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em"}}>
                {tx.confirmOverride}
              </button>
              <button onClick={()=>setConflictInfo(null)}
                style={{flex:1,padding:"9px 0",borderRadius:8,background:"none",border:"1px solid rgba(255,255,255,0.08)",color:"#6b7a82",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em"}}>
                {tx.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section C — Unfilled Areas (wired to schedule data from Section D) */}
      <div className="glass" style={{borderRadius:16,padding:24}}>
        <button onClick={()=>setSundayOpen(o=>!o)}
          style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:0,width:"100%",marginBottom:sundayOpen?16:0}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,textAlign:"left"}}>
            {lang==="PT"?"Precisa de ajuda para preencher uma area?":"Need Help Filling an Area?"}
          </div>
          <span style={{color:"#475a64",fontSize:11,marginLeft:"auto",flexShrink:0}}>{sundayOpen?"▼":"▶"}</span>
        </button>
        {sundayOpen && (() => {
          const unfilledAreas = (schedData || []).filter(area => {
            if (area?.is_locked_external === 1) return false;
            if (area?.position_not_needed) return false;
            const assignments = area?.assignments || [];
            return assignments.length === 0;
          });
          if (schedLoading) return <div style={{color:"#475a64",fontSize:12,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em"}}>...</div>;
          if (schedError) return <div style={{color:"#e07070",fontSize:13}}>{tx.schedErr}</div>;
          if (!schedData) return <div style={{color:"#475a64",fontSize:13}}>{tx.noScheduleData}</div>;
          if (unfilledAreas.length === 0) return <div style={{color:"#475a64",fontSize:13}}>{tx.noUnfilled}</div>;
          return (
            <div>
              {unfilledAreas.map(area => {
                const areaKey = area?.area_name || area?.name || "";
                return (
                  <div key={areaKey} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{fontSize:13,color:"#e6f1f0",flex:1,fontFamily:"'Space Grotesk',sans-serif",fontWeight:500}}>{areaKey}</span>
                    <Chip label={tx.openSlot} />
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

const WELCOME_BLESSINGS = {
  PT: [
    "Que Deus te abençoe hoje enquanto serves.",
    "Que Deus fale ao seu coração enquanto cuida das ovelhas Dele.",
    "Que Deus abençoe você e sua família hoje.",
  ],
  EN: [
    "May God bless you today as you serve.",
    "May God speak to your heart as you care for His sheep.",
    "May God bless you and your family today.",
  ],
};
const WELCOME_VISIONS = {
  PT: [
    "Uma igreja grande para servir e pequena para se importar.",
    "Levando cada pessoa a um relacionamento público e crescente com Jesus Cristo.",
    "Obrigado por cuidar do Corpo de Cristo com excelência.",
    "Cada pessoa que você ajuda a conectar é um passo na missão de alcançar 10% da nossa cidade para Cristo.",
  ],
  EN: [
    "A church big enough to serve and small enough to care.",
    "Leading each person to a public and growing relationship with Jesus Christ.",
    "Thank you for caring for the Body of Christ with excellence.",
    "Every person you help connect is a step toward reaching 10% of our city for Christ.",
  ],
};

// ─── Mobile bottom dock ───────────────────────────────────────────
// items / moreItems: [{ id, label, Icon, action }]
// activeId: which dock item is currently highlighted
function MobileDock({ items, moreItems, moreOpen, onMoreToggle, onMoreClose, activeId }) {
  const DOCK_H = 56;
  return (
    <>
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:60,
        background:'rgba(10,24,32,0.97)',
        borderTop:'1px solid rgba(255,255,255,0.07)',
        backdropFilter:'blur(16px)',
        WebkitBackdropFilter:'blur(16px)',
        height:`calc(${DOCK_H}px + env(safe-area-inset-bottom, 16px))`,
        paddingBottom:'env(safe-area-inset-bottom, 16px)',
        display:'flex', alignItems:'flex-start',
      }}>
        {(items || []).map(item => {
          const isActive = activeId === item.id;
          const col = isActive ? '#5eead4' : '#475a64';
          const Ic = item.Icon;
          return (
            <button key={item.id} onClick={item.action}
              style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap:3, background:'transparent', border:'none',
                cursor:'pointer', color:col, transition:'color 0.15s',
                fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:600,
                letterSpacing:'0.06em', textTransform:'uppercase',
                padding:'10px 4px 0', height:`${DOCK_H}px`,
                WebkitTapHighlightColor:'transparent',
              }}>
              <Ic s={21} c={col} />
              <span style={{marginTop:3}}>{item.label}</span>
            </button>
          );
        })}
      </div>
      {moreOpen && (
        <>
          <div onClick={onMoreClose}
            style={{position:'fixed',inset:0,zIndex:61,background:'rgba(0,0,0,0.45)'}} />
          <div className="dock-sheet" style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:62,
            background:'#0f1e24',
            borderRadius:'16px 16px 0 0',
            borderTop:'1px solid rgba(255,255,255,0.08)',
            paddingBottom:'env(safe-area-inset-bottom, 16px)',
          }}>
            <div style={{display:'flex',justifyContent:'center',padding:'10px 0 6px'}}>
              <div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.18)'}} />
            </div>
            {(moreItems || []).map(item => {
              const Ic = item.Icon;
              return (
                <button key={item.id}
                  onClick={() => { item.action(); onMoreClose(); }}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:14,
                    background:'transparent', border:'none', cursor:'pointer',
                    color:'#aebac0', fontFamily:"'JetBrains Mono',monospace",
                    fontSize:12, fontWeight:500, letterSpacing:'0.04em',
                    padding:'14px 24px', textAlign:'left', transition:'color 0.15s',
                    WebkitTapHighlightColor:'transparent',
                  }}>
                  <Ic s={19} c="#6b7a82" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [fbUser, setFbUser] = useState(null);
  const [tab, setTab] = useState("analytics");
  const [refAnchor, setRefAnchor] = useState(null);
  const [lang, setLang] = useState("PT");
  const [viewMode, setViewMode] = useState("my_view");
  const [glGroup, setGlGroup] = useState("");
  const [glMinistry, setGlMinistry] = useState("");
  const [welcomeBlessing] = useState(() => Math.floor(Math.random() * 3));
  const [welcomeVision] = useState(() => Math.floor(Math.random() * 4));
  // Banner shows only on the initial post-login screen; dismissed on first navigation.
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // Grants fetched on login to drive view-switcher options (e.g. ministry_leader_view).
  const [myGrants, setMyGrants] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [dockMoreOpen, setDockMoreOpen] = useState(false);
  // Priority+ nav: measure the actual rendered width of the nav row and of every
  // collapsible item (via getBoundingClientRect on a hidden mirror row), then decide
  // what to collapse into the More dropdown. No hardcoded per-item pixel estimates.
  const navRowRef = useRef(null);   // live nav inner row (gives available width)
  const navMeasRef = useRef(null);  // hidden mirror row (gives intrinsic item widths)
  const [navRowW, setNavRowW] = useState(0);
  const [navMeas, setNavMeas] = useState(null);
  useEffect(() => {
    const el = navRowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setNavRowW(entry.contentRect.width);
    });
    ro.observe(el);
    setNavRowW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [token]);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useLayoutEffect(() => {
    if (navRowRef.current) setNavRowW(navRowRef.current.getBoundingClientRect().width);
    const root = navMeasRef.current;
    if (!root) return;
    const widthOf = sel => { const n = root.querySelector(sel); return n ? n.getBoundingClientRect().width : 0; };
    setNavMeas({
      logo: widthOf('[data-meas="logo"]'),
      title: widthOf('[data-meas="title"]'),
      langtoggle: widthOf('[data-meas="langtoggle"]'),
      more: widthOf('[data-meas="more"]'),
      switcher: widthOf('[data-meas="switcher"]'),
      aux: widthOf('[data-meas="aux"]'),
      tabs: Array.from(root.querySelectorAll('[data-meas="tab"]')).map(n => n.getBoundingClientRect().width),
    });
  }, [token, lang, role, viewMode]);
  const [templatePT, setTemplatePT] = useState(DEFAULT_TEMPLATE_PT);
  const [templateEN, setTemplateEN] = useState(DEFAULT_TEMPLATE_EN);
  const t = L[lang];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const result = await user.getIdTokenResult();
          setToken(idToken);
          setRole(result.claims.role || 'pastor');
          setFbUser(user);
          setBannerDismissed(false);
          if (user.email === 'nicoleylepage@gmail.com') setLang('EN');
          // Fetch grants to determine which view-switcher options to show.
          try {
            const gr = await fetch(`${API}/user/${user.uid}/grants`, { headers: { Authorization: `Bearer ${idToken}` } });
            if (gr.ok) {
              const gd = await gr.json();
              const list = Array.isArray(gd) ? gd : (Array.isArray(gd?.grants) ? gd.grants : []);
              setMyGrants(list);
            }
          } catch(_) { setMyGrants([]); }
        } catch(e) {
          setToken(null);
          setRole(null);
          setFbUser(null);
          setMyGrants([]);
        }
      } else {
        setToken(null);
        setRole(null);
        setFbUser(null);
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  function handleNavigateToML(ministryName) {
    setBannerDismissed(true);
    setViewMode('ministry_leader_view');
    setGlMinistry(ministryName || "");
  }

  function handleNavigate(tabId, anchor) {
    setBannerDismissed(true);
    setTab(tabId);
    if (anchor) setRefAnchor(anchor);
  }

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

  if (!authReady) return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#050a10"}}>
      <style>{css}</style>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#475a64"}}>...</div>
    </div>
  );

  if (!token) return <Login lang={lang} t={t} onLangChange={setLang} />;

  if (role === 'group_leader') {
    if (!isMobile) return (
      <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#050a10"}}>
        <style>{css}</style>
        <div className="glass" style={{padding:40,borderRadius:20,textAlign:"center",maxWidth:400}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:16}}>LTC Ministry</div>
          <p style={{color:"#e6f1f0",fontSize:16,margin:"0 0 24px"}}>{t.groupLeaderMsg}</p>
          <button onClick={()=>signOut(auth)} className="btn-ghost" style={{padding:"8px 20px",fontSize:12}}>{t.logout}</button>
        </div>
      </div>
    );
    // Mobile GL experience
    const glDockItems = [
      { id:'my_group', label:lang==='PT'?'Meu Grupo':'My Group', Icon:IconUsers,
        action:()=>{ setBannerDismissed(true); setTab('my_group'); setDockMoreOpen(false); } },
      { id:'health', label:lang==='PT'?'Saude':'Health', Icon:IconHeart,
        action:()=>{ setBannerDismissed(true); setTab('health'); setDockMoreOpen(false); } },
      { id:'more', label:lang==='PT'?'Mais':'More', Icon:IconGrid,
        action:()=>setDockMoreOpen(o=>!o) },
    ];
    const glMoreItems = [
      { id:'settings', label:lang==='PT'?'Configuracoes':'Settings', Icon:IconUser,
        action:()=>setShowSettings(true) },
      { id:'logout', label:lang==='PT'?'Sair':'Sign Out', Icon:IconUser,
        action:()=>signOut(auth) },
    ];
    const glActiveId = tab === 'health' ? 'health' : tab === 'my_group' ? 'my_group' : 'my_group';
    return (
      <div style={{minHeight:'100vh',background:'#050a10',overflowY:'auto',
        paddingBottom:'calc(56px + env(safe-area-inset-bottom, 16px))'}}>
        <style>{css}</style>
        {/* GL group selector when no group chosen */}
        {tab !== 'health' && !glGroup && (
          <div style={{padding:'32px 20px'}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:16,textAlign:'center'}}>
              {lang==='PT'?'Escolha seu grupo':'Select your group'}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:320,margin:'0 auto'}}>
              {(GL_GROUPS || []).map(g => (
                <button key={g} onClick={()=>{ setGlGroup(g); setTab('my_group'); }}
                  className="btn-ghost"
                  style={{padding:'12px 16px',borderRadius:10,fontSize:13,textAlign:'left'}}>
                  {g}
                </button>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:24}}>
              <button onClick={()=>signOut(auth)} className="btn-ghost" style={{padding:"8px 20px",fontSize:12}}>
                {t.logout}
              </button>
            </div>
          </div>
        )}
        {tab !== 'health' && glGroup && (
          <GroupLeaderView token={token} lang={lang} groupName={glGroup}
            scheduledBy={fbUser?.uid || fbUser?.email || "group_leader"} />
        )}
        {tab === 'health' && (
          <RefErrorBoundary lang={lang} onBack={()=>setTab('my_group')}>
            <MinistryHealthTab token={token} role="group_leader" t={t} lang={lang}
              fbUser={fbUser} onNavigateToML={()=>{}} userGrants={myGrants} />
          </RefErrorBoundary>
        )}
        <MobileDock items={glDockItems} moreItems={glMoreItems}
          moreOpen={dockMoreOpen} onMoreToggle={()=>setDockMoreOpen(o=>!o)}
          onMoreClose={()=>setDockMoreOpen(false)} activeId={glActiveId} />
        {showSettings && (
          <SettingsModal token={token} t={t} lang={lang} onClose={()=>setShowSettings(false)}
            onSaved={d=>{setTemplatePT(d.whatsapp_template_pt);setTemplateEN(d.whatsapp_template_en);}} />
        )}
      </div>
    );
  }

  if (role === 'member_portal') {
    const mpDockItems = [
      { id:'my_schedule', label:lang==='PT'?'Agenda':'Schedule', Icon:IconCalendar,
        action:()=>setTab('my_schedule') },
      { id:'availability', label:lang==='PT'?'Disp.':'Avail.', Icon:IconClock,
        action:()=>setTab('availability') },
      { id:'my_profile', label:lang==='PT'?'Perfil':'Profile', Icon:IconUser,
        action:()=>setTab('my_profile') },
    ];
    const mpMoreItems = [
      { id:'logout', label:lang==='PT'?'Sair':'Sign Out', Icon:IconUser, action:()=>signOut(auth) },
    ];
    const mpActiveTab = ['my_schedule','availability','my_profile'].includes(tab) ? tab : 'my_schedule';
    const placeholder = (title) => (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        minHeight:'60vh',padding:32}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",
          textTransform:"uppercase",color:"#5eead4",marginBottom:12}}>{title}</div>
        <div className="glass" style={{padding:'32px 28px',borderRadius:16,maxWidth:320,width:'100%',textAlign:'center'}}>
          <div style={{fontSize:28,marginBottom:12}}>🚧</div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,color:"#e6f1f0",fontWeight:600,marginBottom:8}}>
            Em breve
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#475a64",letterSpacing:'0.06em'}}>
            {lang==='PT'?'Esta funcionalidade esta sendo desenvolvida.':'This feature is coming soon.'}
          </div>
        </div>
      </div>
    );
    return (
      <div style={{minHeight:'100vh',background:'#050a10',overflowY:'auto',
        paddingBottom:'calc(56px + env(safe-area-inset-bottom, 16px))'}}>
        <style>{css}</style>
        {mpActiveTab === 'my_schedule' && placeholder(lang==='PT'?'Minha Agenda':'My Schedule')}
        {mpActiveTab === 'availability' && placeholder(lang==='PT'?'Disponibilidade':'Availability')}
        {mpActiveTab === 'my_profile' && placeholder(lang==='PT'?'Meu Perfil':'My Profile')}
        <MobileDock items={mpDockItems} moreItems={mpMoreItems}
          moreOpen={dockMoreOpen} onMoreToggle={()=>setDockMoreOpen(o=>!o)}
          onMoreClose={()=>setDockMoreOpen(false)} activeId={mpActiveTab} />
      </div>
    );
  }

  const roleLabel = { owner: t.roleOwner, senior_pastor: t.roleSeniorPastor, pastor: t.rolePastor, group_leader: t.roleGroupLeader };

  const effectiveRole = viewMode === 'senior_pastor_view' ? 'senior_pastor'
    : viewMode === 'pastor_view' ? 'pastor'
    : role;

  const tabs = [
    { id: "analytics", label: t.analytics },
    ...(effectiveRole === 'pastor' || effectiveRole === 'senior_pastor' || effectiveRole === 'owner' ? [{ id: "attendance", label: t.attendance }] : []),
    { id: "people", label: t.people },
    { id: "gifting", label: t.byGifting },
    { id: "health", label: t.ministryHealth },
    { id: "reference", label: t.reference },
    { id: "scheduling", label: t.scheduling },
  ];
  if (effectiveRole === 'owner') tabs.push({ id: "users", label: t.usersTab });

  // ── Priority+ collapse: measured, not hardcoded ──────────────────
  // Always visible: logo + PT/EN toggle. Collapse order as space shrinks:
  //   1) title text  2) gear + logout  3) view switcher  4) tabs (right→left).
  // The More button appears only once something has collapsed into it.
  const TAB_GAP = 4;
  const REGION_GAP = 10;
  const hasSwitcher = (role === 'owner' || role === 'senior_pastor' || role === 'pastor') || hasMinistryLeaderGrant;

  let showTitle = true, showSwitcher = hasSwitcher, showAux = true, visibleTabCount = tabs.length, showMore = false;
  if (navMeas && navRowW > 0) {
    const m = navMeas;
    const PAD = 48, SAFETY = 16;
    const room = navRowW - PAD - SAFETY - (m.logo + m.langtoggle + REGION_GAP * 2);
    const need = (s) => {
      let w = 0;
      if (s.title) w += m.title + REGION_GAP;
      for (let i = 0; i < s.tabCount; i++) w += (m.tabs[i] || 0) + TAB_GAP;
      if (s.switcher && hasSwitcher && m.switcher > 0) w += m.switcher + REGION_GAP;
      if (s.aux) w += m.aux + REGION_GAP;
      if (s.more) w += m.more + REGION_GAP;
      return w;
    };
    const s = { title: true, switcher: hasSwitcher, aux: true, tabCount: tabs.length, more: false };
    if (need(s) > room) {
      s.title = false;                                       // 1) title text first (just hidden)
      if (need(s) > room) {
        s.more = true;                                       // beyond here, items go INTO More
        if (need(s) > room) s.aux = false;                   // 2) gear + logout
        if (need(s) > room) s.switcher = false;              // 3) view switcher
        while (s.tabCount > 0 && need(s) > room) s.tabCount--; // 4) tabs, right → left
      }
    }
    showTitle = s.title; showSwitcher = s.switcher && hasSwitcher; showAux = s.aux;
    visibleTabCount = s.tabCount; showMore = s.more;
  }
  const visibleTabs = tabs.slice(0, visibleTabCount);
  const overflowTabs = tabs.slice(visibleTabCount);

  // ── Shared renderers (live nav + hidden measurement mirror use the same markup) ──
  const tabBtn = (t2) => (
    <button key={t2.id} onClick={() => { setBannerDismissed(true); setTab(t2.id); }}
      style={{background:"transparent",border:"none",padding:"6px 10px",position:"relative",color:tab===t2.id?"#e6f1f0":"#6b7a82",fontSize:12,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",transition:"color 0.18s",whiteSpace:"nowrap",flexShrink:0}}
      onMouseEnter={e=>{ if(tab!==t2.id) e.currentTarget.style.color="#aebac0"; }}
      onMouseLeave={e=>{ if(tab!==t2.id) e.currentTarget.style.color="#6b7a82"; }}>
      {t2.label}
      {tab===t2.id && <span style={{position:"absolute",left:0,right:0,bottom:-2,height:2,background:"linear-gradient(90deg,transparent,#5eead4,transparent)",boxShadow:"0 0 12px #5eead4"}} />}
    </button>
  );
  const onViewChange = (e) => { const v=e.target.value; setBannerDismissed(true); setViewMode(v); if(v==='my_view'){ setGlGroup(""); setGlMinistry(""); } if(['new_believer_view','start_class_view','baptism_view','cafe_view'].includes(v)) setTab("people"); };
  const hasMinistryLeaderGrant = (myGrants || []).some(g => (g.grant_type || g.grantType || g.type) === 'ministry_leader');
  const hasBlanketMLAccess = role === 'owner' || role === 'senior_pastor' || role === 'pastor';
  const hasAnyMLAccess = hasBlanketMLAccess || hasMinistryLeaderGrant;

  // ── Mobile dock item definitions (isMobile=true only) ────────────
  // Blanket-access dock (owner / senior_pastor / pastor)
  const blanketDockItems = [
    { id:'people',     label:lang==='PT'?'Pessoas':'People',   Icon:IconUsers,    action:()=>{ setBannerDismissed(true); setTab('people');    setDockMoreOpen(false); } },
    { id:'analytics',  label:lang==='PT'?'Anal.':'Analytics',  Icon:IconBarChart, action:()=>{ setBannerDismissed(true); setTab('analytics'); setDockMoreOpen(false); } },
    { id:'scheduling', label:lang==='PT'?'Agenda':'Schedule',  Icon:IconCalendar, action:()=>{ setBannerDismissed(true); setTab('scheduling');setDockMoreOpen(false); } },
    { id:'health',     label:lang==='PT'?'Saude':'Health',     Icon:IconHeart,    action:()=>{ setBannerDismissed(true); setTab('health');    setDockMoreOpen(false); } },
    { id:'more',       label:lang==='PT'?'Mais':'More',        Icon:IconGrid,     action:()=>setDockMoreOpen(o=>!o) },
  ];
  const blanketMoreItems = [
    ...(effectiveRole==='pastor'||effectiveRole==='senior_pastor'||effectiveRole==='owner'
      ? [{ id:'attendance', label:lang==='PT'?'Cultos':'Attendance', Icon:IconCalendar,
           action:()=>{ setBannerDismissed(true); setTab('attendance'); } }] : []),
    { id:'gifting', label:lang==='PT'?'Dons':'Gifting', Icon:IconStar,
      action:()=>{ setBannerDismissed(true); setTab('gifting'); } },
    { id:'reference', label:lang==='PT'?'Referencia':'Reference', Icon:IconUser,
      action:()=>{ setBannerDismissed(true); setTab('reference'); } },
    ...(effectiveRole==='owner'
      ? [{ id:'users', label:lang==='PT'?'Usuarios':'Users', Icon:IconUser,
           action:()=>{ setBannerDismissed(true); setTab('users'); } }] : []),
    { id:'settings_dock', label:lang==='PT'?'Config.':'Settings', Icon:IconUser,
      action:()=>setShowSettings(true) },
    { id:'logout_dock', label:lang==='PT'?'Sair':'Sign Out', Icon:IconUser,
      action:()=>signOut(auth) },
  ];
  const blanketDockOverflowIds = new Set(['attendance','gifting','reference','users']);
  const blanketDockActiveId = blanketDockOverflowIds.has(tab) ? 'more'
    : ['people','analytics','scheduling','health'].includes(tab) ? tab : 'more';

  // ML-grant dock (has ministry_leader grant but no blanket access)
  const mlDockItems = [
    { id:'ministry_leader_view', label:lang==='PT'?'Meu Min.':'Ministry', Icon:IconStar,
      action:()=>{ setBannerDismissed(true); setViewMode('ministry_leader_view'); setDockMoreOpen(false); } },
    { id:'people', label:lang==='PT'?'Pessoas':'People', Icon:IconUsers,
      action:()=>{ setBannerDismissed(true); setTab('people'); setViewMode('my_view'); setDockMoreOpen(false); } },
    { id:'scheduling', label:lang==='PT'?'Agenda':'Schedule', Icon:IconCalendar,
      action:()=>{ setBannerDismissed(true); setTab('scheduling'); setViewMode('my_view'); setDockMoreOpen(false); } },
    { id:'more', label:lang==='PT'?'Mais':'More', Icon:IconGrid, action:()=>setDockMoreOpen(o=>!o) },
  ];
  const mlMoreItems = [
    { id:'health', label:lang==='PT'?'Saude':'Health', Icon:IconHeart,
      action:()=>{ setBannerDismissed(true); setTab('health'); setViewMode('my_view'); } },
    { id:'gifting', label:lang==='PT'?'Dons':'Gifting', Icon:IconStar,
      action:()=>{ setBannerDismissed(true); setTab('gifting'); setViewMode('my_view'); } },
    { id:'settings_ml', label:lang==='PT'?'Config.':'Settings', Icon:IconUser, action:()=>setShowSettings(true) },
    { id:'logout_ml', label:lang==='PT'?'Sair':'Sign Out', Icon:IconUser, action:()=>signOut(auth) },
  ];
  const mlDockActiveId = viewMode === 'ministry_leader_view' ? 'ministry_leader_view'
    : tab === 'people' ? 'people' : tab === 'scheduling' ? 'scheduling' : 'more';

  // Which dock set applies
  const activeDockItems = hasBlanketMLAccess ? blanketDockItems : mlDockItems;
  const activeDockMoreItems = hasBlanketMLAccess ? blanketMoreItems : mlMoreItems;
  const activeDockActiveId = hasBlanketMLAccess ? blanketDockActiveId : mlDockActiveId;
  const VIEW_OPTS = [
    ['my_view', lang==="PT"?"Minha visao":"My View"],
    ['senior_pastor_view', lang==="PT"?"Visao do Pastor Senior":"Senior Pastor View"],
    ['pastor_view', lang==="PT"?"Visao do Pastor":"Pastor View"],
    ['new_believer_view', lang==="PT"?"Vista Novos Crentes":"New Believer View"],
    ['start_class_view', lang==="PT"?"Vista Start":"Start Class View"],
    ['baptism_view', lang==="PT"?"Vista Batismo":"Baptism View"],
    ['cafe_view', lang==="PT"?"Vista Cafe":"Cafe View"],
    ['group_leader', lang==="PT"?"Visao do Lider":"Group Leader View"],
    ...(hasAnyMLAccess ? [['ministry_leader_view', lang==="PT"?"Visao do Lider de Ministerio":"Ministry Leader View"]] : []),
  ];
  const selStyle = {background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#aebac0",borderRadius:8,padding:"6px 8px",fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",maxWidth:170};
  const switcherNav = () => (
    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
      <select value={viewMode} onChange={onViewChange} style={selStyle}>
        {VIEW_OPTS.map(o=><option key={o[0]} value={o[0]}>{o[1]}</option>)}
      </select>
      {viewMode==='group_leader' && (
        <select value={glGroup} onChange={e=>setGlGroup(e.target.value)} style={{...selStyle,maxWidth:150}}>
          <option value="">{lang==="PT"?"Escolher grupo...":"Select group..."}</option>
          {GL_GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      )}
      {viewMode==='ministry_leader_view' && hasBlanketMLAccess && (
        <select value={glMinistry} onChange={e=>setGlMinistry(e.target.value)} style={{...selStyle,maxWidth:170}}>
          <option value="">{lang==="PT"?"Escolher ministerio...":"Select ministry..."}</option>
          {MH_MINISTRIES.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      )}
    </div>
  );
  const switcherMore = () => (
    <div className="pp-sub">
      <select value={viewMode} onChange={onViewChange}>
        {VIEW_OPTS.map(o=><option key={o[0]} value={o[0]}>{o[1]}</option>)}
      </select>
      {viewMode==='group_leader' && (
        <select value={glGroup} onChange={e=>setGlGroup(e.target.value)}>
          <option value="">{lang==="PT"?"Escolher grupo...":"Select group..."}</option>
          {GL_GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
        </select>
      )}
      {viewMode==='ministry_leader_view' && hasBlanketMLAccess && (
        <select value={glMinistry} onChange={e=>setGlMinistry(e.target.value)}>
          <option value="">{lang==="PT"?"Escolher ministerio...":"Select ministry..."}</option>
          {MH_MINISTRIES.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      )}
    </div>
  );
  const auxNav = () => (
    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
      <button onClick={()=>setShowSettings(true)} title={t.settings} className="btn-ghost" style={{padding:"7px 10px",borderRadius:8,fontSize:14,lineHeight:1,color:"#aebac0"}}>&#9881;</button>
      <button onClick={()=>signOut(auth)} title={t.logout} className="btn-ghost" style={{padding:"7px 10px",borderRadius:8,fontSize:14,lineHeight:1,color:"#aebac0"}}>&#8618;</button>
    </div>
  );
  const langToggle = () => (
    <div style={{display:"flex",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:8,padding:2,fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>
      <button onClick={()=>setLang("PT")} style={{padding:"5px 10px",background:lang==="PT"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",border:lang==="PT"?"1px solid rgba(94,234,212,0.3)":"none",color:lang==="PT"?"#5eead4":"#6b7a82",cursor:"pointer",borderRadius:6,fontWeight:lang==="PT"?600:400,fontFamily:"inherit",transition:"all 0.18s"}}>PT</button>
      <button onClick={()=>setLang("EN")} style={{padding:"5px 10px",background:lang==="EN"?"linear-gradient(180deg,rgba(94,234,212,0.18),rgba(94,234,212,0.08))":"transparent",border:lang==="EN"?"1px solid rgba(94,234,212,0.3)":"none",color:lang==="EN"?"#5eead4":"#6b7a82",cursor:"pointer",borderRadius:6,fontWeight:lang==="EN"?600:400,fontFamily:"inherit",transition:"all 0.18s"}}>EN</button>
    </div>
  );
  const moreBtn = () => (
    <button onClick={()=>setMoreOpen(o=>!o)} className="btn-ghost"
      style={{padding:"8px 14px",borderRadius:8,fontSize:12,color:"#aebac0",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
      {lang==="PT"?"Mais":"More"} <span style={{fontSize:9,lineHeight:1}}>&#9660;</span>
    </button>
  );
  const titleEl = () => (
    <>
      <div style={{width:1,height:24,background:"rgba(255,255,255,0.06)",flexShrink:0}} />
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>{t.dashboard}</span>
    </>
  );

  return (
    <div className="app" style={{height:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{css}</style>

      {/* Nav: logo + title | tabs | switcher | gear/logout | (spacer) | PT/EN | More
          Hidden on mobile — replaced by the fixed bottom dock below. */}
      {!isMobile && <div className="nav" style={{flexShrink:0,zIndex:50}}>
        <div ref={navRowRef} style={{maxWidth:1600,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:REGION_GAP,height:52}}>

          {/* Logo (always) + title (collapses 1st) */}
          <div style={{display:"flex",alignItems:"center",gap:12,flex:"0 0 auto"}}>
            <img src={`${import.meta.env.BASE_URL}LTC1.svg`} alt="Lagoinha Tampa" style={{height:32,width:"auto",objectFit:"contain",display:"block",flexShrink:0}} />
            {showTitle && titleEl()}
          </div>

          {/* Tabs (collapse last, right → left) */}
          <div style={{display:"flex",alignItems:"center",gap:TAB_GAP,flex:"0 1 auto",minWidth:0,overflow:"hidden"}}>
            {visibleTabs.map(t2=>tabBtn(t2))}
          </div>

          {/* View switcher (collapses 3rd) */}
          {showSwitcher && switcherNav()}

          {/* Gear + logout (collapse 2nd) */}
          {showAux && auxNav()}

          {/* Spacer pushes lang toggle + More to the right */}
          <div style={{flex:"1 1 0",minWidth:0}} />

          {/* PT/EN toggle — always visible */}
          <div style={{flex:"0 0 auto"}}>{langToggle()}</div>

          {/* More — only when something is collapsed into it */}
          {showMore && (
            <div style={{flex:"0 0 auto",position:"relative"}}>
              {moreBtn()}
              {moreOpen && (
                <>
                  <div onClick={()=>setMoreOpen(false)} style={{position:"fixed",inset:0,zIndex:199}} />
                  <div className="pp-dropdown">
                    {overflowTabs.map(t2=>(
                      <button key={t2.id} className={"pp-item"+(tab===t2.id?" pp-active":"")}
                        onClick={()=>{setBannerDismissed(true);setTab(t2.id);setMoreOpen(false);}}>
                        {t2.label}
                      </button>
                    ))}
                    {overflowTabs.length>0 && ((!showSwitcher && hasSwitcher) || !showAux) && <div className="pp-divider"/>}
                    {!showSwitcher && hasSwitcher && switcherMore()}
                    {!showAux && (
                      <>
                        <button className="pp-item" onClick={()=>{setShowSettings(true);setMoreOpen(false);}}>&#9881; {t.settings}</button>
                        <button className="pp-item" onClick={()=>{signOut(auth);setMoreOpen(false);}}>&#8618; {t.logout}</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Hidden mirror row — used ONLY to measure intrinsic widths via getBoundingClientRect */}
        <div ref={navMeasRef} aria-hidden="true"
          style={{position:"absolute",top:-9999,left:0,visibility:"hidden",pointerEvents:"none",display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>
          <span data-meas="logo" style={{display:"inline-flex"}}>
            <img src={`${import.meta.env.BASE_URL}LTC1.svg`} alt="" style={{height:32,width:"auto"}} />
          </span>
          <span data-meas="title" style={{display:"inline-flex",alignItems:"center",gap:12}}>{titleEl()}</span>
          {tabs.map(t2=><span key={t2.id} data-meas="tab" style={{display:"inline-flex"}}>{tabBtn(t2)}</span>)}
          {hasSwitcher && <span data-meas="switcher" style={{display:"inline-flex"}}>{switcherNav()}</span>}
          <span data-meas="aux" style={{display:"inline-flex"}}>{auxNav()}</span>
          <span data-meas="langtoggle" style={{display:"inline-flex"}}>{langToggle()}</span>
          <span data-meas="more" style={{display:"inline-flex"}}>{moreBtn()}</span>
        </div>
      </div>}

      {/* Content — dedicated scroll region (flex:1 + minHeight:0 + overflowY:auto) so content
          scrolls reliably regardless of document-body overflow quirks (body has overflow-x:hidden,
          which can break viewport scroll propagation). The nav above stays pinned as a flexShrink:0
          sibling. This is the canonical sticky-header app-shell scroll pattern. */}
      <div style={{flex:1,minHeight:0,overflowY:"auto"}}>
      {/* paddingBottom lives on the INNER content child, not the scroll container above — Blink/WebKit
          exclude a scroll container's own padding-bottom from the scrollable overflow region (honored
          at top, collapsed at bottom), so padding on the overflow:auto div has no effect on the
          max-scroll boundary. On the inner child it counts as real content height and is scrollable. */}
      <div style={{maxWidth:1600,margin:"0 auto",
        paddingBottom: isMobile ? 'calc(80px + 56px + env(safe-area-inset-bottom, 16px))' : 80}}>

        {/* Welcome banner — shown only on the initial post-login screen; dismissed on first tab/view navigation */}
        {fbUser && !bannerDismissed && (() => {
          const h = new Date().getHours();
          const greeting = h >= 5 && h < 12 ? "Bom dia" : h >= 12 && h < 18 ? "Boa tarde" : "Boa noite";
          const name = (fbUser.displayName || fbUser.email || "").trim();
          const langKey = lang === "EN" ? "EN" : "PT";
          return (
            <div style={{padding:"28px 32px 0",maxWidth:860}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:22,color:"#e6f1f0",marginBottom:6,lineHeight:1.25}}>
                {greeting}{name ? `, ${name}` : ""}!
              </div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,color:"#aebac0",marginBottom:5,lineHeight:1.5}}>
                {WELCOME_BLESSINGS[langKey][welcomeBlessing]}
              </div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",letterSpacing:"0.06em",color:"#475a64",lineHeight:1.6}}>
                {WELCOME_VISIONS[langKey][welcomeVision]}
              </div>
            </div>
          );
        })()}

        {viewMode === 'group_leader' && glGroup
          ? <GroupLeaderView token={token} lang={lang} groupName={glGroup} scheduledBy={fbUser?.uid || fbUser?.email || "group_leader"} />
          : null}
        {viewMode === 'ministry_leader_view' && (!hasBlanketMLAccess || glMinistry) && (
          <RefErrorBoundary lang={lang} onBack={function(){setViewMode('my_view');}}>
            <MinistryLeaderView lang={lang} grants={myGrants} hasBlanketAccess={hasBlanketMLAccess} activeMinistryOverride={glMinistry} token={token} />
          </RefErrorBoundary>
        )}
        {!(viewMode === 'group_leader' && glGroup) && viewMode !== 'ministry_leader_view' && tab === "analytics" && <AnalyticsTab token={token} t={t} lang={lang} />}
        {!(viewMode === 'group_leader' && glGroup) && viewMode !== 'ministry_leader_view' && tab === "attendance" && <ServiceAttendanceTab t={t} lang={lang} />}
        {!(viewMode === 'group_leader' && glGroup) && viewMode !== 'ministry_leader_view' && tab === "people" && <PeopleTab token={token} role={role} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} onNavigate={handleNavigate} fbUser={fbUser} viewMode={viewMode} />}
        {!(viewMode === 'group_leader' && glGroup) && viewMode !== 'ministry_leader_view' && tab === "gifting" && <GiftingTab token={token} role={role} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} onNavigate={handleNavigate} fbUser={fbUser} />}
        {!(viewMode === 'group_leader' && glGroup) && viewMode !== 'ministry_leader_view' && tab === "health" && (
          <RefErrorBoundary lang={lang} onBack={function(){setTab("people");}}>
            <MinistryHealthTab token={token} role={effectiveRole} t={t} lang={lang} fbUser={fbUser} onNavigateToML={handleNavigateToML} userGrants={myGrants} />
          </RefErrorBoundary>
        )}
        {!(viewMode === 'group_leader' && glGroup) && viewMode !== 'ministry_leader_view' && tab === "reference" && (
          <RefErrorBoundary lang={lang} onBack={function(){setTab("people");}}>
            <ReferenceTab t={t} lang={lang} anchor={refAnchor} onAnchorConsumed={function(){setRefAnchor(null);}} onBack={function(){setTab("people");}} />
          </RefErrorBoundary>
        )}
        {!(viewMode === 'group_leader' && glGroup) && viewMode !== 'ministry_leader_view' && tab === "scheduling" && <SchedulingPrototype />}
        {tab === "users" && effectiveRole === "owner" && <UserManagementTab token={token} t={t} lang={lang} />}
      </div>
      </div>

      {showSettings && (
        <SettingsModal
          token={token}
          t={t}
          lang={lang}
          onClose={() => setShowSettings(false)}
          onSaved={d => { setTemplatePT(d.whatsapp_template_pt); setTemplateEN(d.whatsapp_template_en); }}
        />
      )}

      {/* Mobile bottom dock — renders only on narrow viewports */}
      {isMobile && (
        <MobileDock
          items={activeDockItems}
          moreItems={activeDockMoreItems}
          moreOpen={dockMoreOpen}
          onMoreToggle={() => setDockMoreOpen(o => !o)}
          onMoreClose={() => setDockMoreOpen(false)}
          activeId={activeDockActiveId}
        />
      )}
    </div>
  );
}
