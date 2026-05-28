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

const DISC_TYPE = {
  PT: { D:"Executor", I:"Comunicador", S:"Planejador", C:"Analista" },
  EN: { D:"Driver", I:"Influencer", S:"Supporter", C:"Analyst" }
};
const DISC_COLORS = { D:"#f87171", I:"#f59e0b", S:"#34d399", C:"#60a5fa" };

const LANGUAGE_DISPLAY = {
  PT: { "English":"Inglês", "Português":"Português", "Both":"Ambos" },
  EN: { "English":"English", "Português":"Português", "Both":"Both" }
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

// Maps DISC letter to anchorId
const DISC_TO_ANCHOR = { D:"executor", I:"comunicador", S:"planejador", C:"analista" };

const SPECIAL_GROUP_PT = {
  "Rocket":"Rocket","Link":"Link","Legacy":"Legacy","Shine":"Shine","Hero":"Hero",
  "Culto Hope":"Culto Hope","Culto Fé":"Culto Fé","English Service":"Culto em Inglês","Other":"Outro"
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
    langSplit:"Idioma Preferido",weeklySub:"Respostas Semanais",noData:"Sem dados ainda",
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
function Login({ onLogin, lang, t }) {
  const tt = t || L["PT"];
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
      else { setError(tt.loginErrorPw); }
    } catch { setError(tt.loginErrorConn); }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"40px 20px",position:"relative"}}>
      <style>{css}</style>
      {/* Backdrop glow halo behind logo */}
      <div style={{position:"absolute",top:"24%",left:"50%",transform:"translateX(-50%)",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle, rgba(94,234,212,0.08), transparent 70%)",pointerEvents:"none"}} />
      <div style={{width:440,maxWidth:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:36,position:"relative"}}>
        {/* LTC2 circle mark — displayed directly on background, no wrapper */}
        <img src={`${import.meta.env.BASE_URL}LTC2.svg`} alt="LTC" style={{width:84,height:84,objectFit:"contain",flexShrink:0}} />
        {/* Card */}
        <div className="glass" style={{width:"100%",padding:36,borderRadius:20,boxShadow:"0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(94,234,212,0.08) inset",position:"relative"}}>
          {/* Top accent line */}
          <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:1,background:"linear-gradient(90deg, transparent, #5eead4, transparent)",opacity:0.6}} />
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:10}}>LTC Ministry</div>
            <h1 style={{margin:0,fontSize:30,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,letterSpacing:"-0.01em",color:"#e6f1f0"}}>
              {tt.loginTitle}
            </h1>
            <p style={{margin:"10px 0 0",color:"#6b7a82",fontSize:13.5}}>
              {tt.loginDesc}
            </p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:8}}>{tt.loginPasswordLabel}</div>
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
              {loading ? tt.loginChecking : tt.loginEnter} {!loading && <span style={{fontSize:14}}>→</span>}
            </button>
          </div>
          <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#475a64"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase",fontSize:"10.5px"}}>{tt.loginInternal}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.18em",textTransform:"uppercase",fontSize:"10.5px",color:"#5eead4",opacity:0.7}}>{tt.loginConnected}</span>
          </div>
        </div>
        <p style={{fontSize:11.5,color:"#475a64",textAlign:"center",maxWidth:320,lineHeight:1.6}}>
          {tt.loginTagline}
        </p>
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
function AnalyticsTab({ token, t, lang }) {
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
        <AreaChart data={(data.byWeek||[]).slice(-10)} height={160} noDataMsg={t.noData}/>
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Leadership Tendencies */}
        <div className="glass" style={{padding:28,borderRadius:12}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,
            letterSpacing:"0.10em",textTransform:"uppercase",color:"#e6f1f0",marginBottom:20}}>
            {t.byLeadership}
          </div>
          {(data.byLeadership||[]).length === 0 ? (
            <div style={{fontSize:13,color:"#475a64",fontFamily:"'JetBrains Mono',monospace"}}>{t.noDistData}</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(data.byLeadership||[]).map(function(row,i){
                const pct=total>0?(row.count/total)*100:0;
                const colors=["#5eead4","#60a5fa","#a78bfa","#f59e0b","#34d399"];
                const color=colors[i%colors.length];
                const ldEntry2=row.leadership_tendency?LEADERSHIP_MAP[row.leadership_tendency]:null;
                const label=ldEntry2?(lang==="PT"?ldEntry2.PT:ldEntry2.EN):(row.leadership_tendency||"Outro");
                return (
                  <div key={row.leadership_tendency||i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,color:"#aebac0"}}>{label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#e6f1f0",fontWeight:500}}>{row.count}</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:(row.count>0?Math.max(pct,2):0)+"%",
                        background:"linear-gradient(90deg,"+color+"aa,"+color+")",borderRadius:999,transition:"width 0.8s"}}/>
                    </div>
                  </div>
                );
              })}
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
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(data.byEmotional||[]).map(function(row,i){
                const pct=total>0?(row.count/total)*100:0;
                const colors=["#5eead4","#f59e0b","#f87171","#a78bfa","#34d399"];
                const color=colors[i%colors.length];
                const emEntry2=row.emotional_profile?EMOTIONAL_MAP[row.emotional_profile]:null;
                const label=emEntry2?(lang==="PT"?emEntry2.PT:emEntry2.EN):(row.emotional_profile||"Outro");
                return (
                  <div key={row.emotional_profile||i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,color:"#aebac0"}}>{label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#e6f1f0",fontWeight:500}}>{row.count}</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:(row.count>0?Math.max(pct,2):0)+"%",
                        background:"linear-gradient(90deg,"+color+"aa,"+color+")",borderRadius:999,transition:"width 0.8s"}}/>
                    </div>
                  </div>
                );
              })}
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
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(data.byNatural||[]).map(function(row,i){
                const pct=total>0?(row.count/total)*100:0;
                const colors=["#34d399","#5eead4","#60a5fa","#a78bfa"];
                const color=colors[i%colors.length];
                const nsEntry2=row.natural_strength?NATURAL_STRENGTH_MAP[row.natural_strength]:null;
                const label=nsEntry2?(lang==="PT"?nsEntry2.PT:nsEntry2.EN):(row.natural_strength||"Outro");
                return (
                  <div key={row.natural_strength||i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,color:"#aebac0"}}>{label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#e6f1f0",fontWeight:500}}>{row.count}</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:(row.count>0?Math.max(pct,2):0)+"%",
                        background:"linear-gradient(90deg,"+color+"aa,"+color+")",borderRadius:999,transition:"width 0.8s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── PERSON CARD ──────────────────────────────────────────────────
function PersonCard({ person, onClick, templatePT, templateEN, t, lang, onNavigate }) {
  const [showAllGiftings, setShowAllGiftings] = useState(false);
  const ministries = parseJSON(person.current_ministries);
  const groups = parseJSON(person.special_groups);
  const langs = parseJSON(person.languages_spoken);
  const pairingLabels = parseJSON(person.pairing_labels, []);
  const badge = ministryBadge(person.ministry_count || 0);
  const stageColor = STAGE_COLORS[person.stage] || "#6b7a82";
  const carisma = parseCarisma(person.carisma_completed);
  const scores = parseJSON(person.scores, {});
  const sortedScores = Object.entries(scores).map(function(e){return [SHORT_TO_FULL[e[0]]||e[0], Math.min(Number(e[1]),100)];}).sort(function(a,b){return b[1]-a[1];});
  // PersonCard: use template (skipTemplate = false)
  const waURL = buildWhatsAppURL(person, templatePT, templateEN, false);

  function navTo(e, anchor) {
    e.stopPropagation();
    if (onNavigate) onNavigate("reference", anchor);
  }

  // Resolve profile labels with translation
  var nsEntry = person.natural_strength ? (NATURAL_STRENGTH_MAP[person.natural_strength] || null) : null;
  var ldEntry = person.leadership_tendency ? (LEADERSHIP_MAP[person.leadership_tendency] || null) : null;
  var emEntry = person.emotional_profile ? (EMOTIONAL_MAP[person.emotional_profile] || null) : null;

  var tagStyle = {
    display:"inline-flex", alignItems:"center", gap:4, fontSize:11, padding:"3px 9px",
    borderRadius:999, background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(255,255,255,0.08)", color:"#aebac0",
    cursor:"pointer", whiteSpace:"nowrap"
  };

  return (
    <div onClick={onClick} className="glass glow-hover" style={{borderRadius:12,padding:"16px 20px",cursor:"pointer",transition:"all 0.2s ease",borderLeft:"3px solid " + stageColor,boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
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
              {person.pastoral_flag==1 && (
                <span title={lang==="PT" ? "Potencial Pastoral" : "Pastoral Potential"} style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",color:"#fbd590",fontWeight:700}}>★</span>
              )}
              <CarismaBadge levels={carisma} />
            </div>
            <div style={{fontSize:11.5,color:"#6b7a82",marginTop:2}}>{person.whatsapp || person.email || t.noContact}</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={{fontSize:11,padding:"3px 9px",background:stageColor+"1a",color:stageColor,borderRadius:999,fontWeight:600,whiteSpace:"nowrap",border:"1px solid " + stageColor + "33"}}>{(STAGE_LABEL[lang||"PT"]||STAGE_LABEL.PT)[person.stage||"New"]||person.stage||"New"}</span>
          <span style={{fontSize:11,padding:"3px 9px",background:badge.bg,color:badge.color,borderRadius:999,fontWeight:600,border:"1px solid " + badge.color + "33"}}>{badge.label==="Available"?t.available:badge.label}</span>
        </div>
      </div>

      {/* ── Top gifting tags ── */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
        {[person.gifting_1,person.gifting_2,person.gifting_3].map(function(g){return typeof g==="object"?null:(g||null);}).filter(Boolean).map(function(g,i){
          var anchor = GIFTING_TO_ANCHOR[g] || null;
          return (
            <span key={i} onClick={anchor ? function(e){navTo(e,anchor);} : undefined}
              style={{fontSize:11,padding:"3px 9px",
                background:i===0?"rgba(94,234,212,0.1)":"rgba(255,255,255,0.03)",
                color:i===0?"#c5f5ec":"#aebac0",
                borderRadius:999,border:"1px solid " + (i===0?"rgba(94,234,212,0.25)":"rgba(255,255,255,0.05)"),
                cursor:anchor?"pointer":"default"}}>
              {GIFTING_ICONS[g]||"◆"} {giftingLabel(g, person.language)}
            </span>
          );
        })}
        {/* Toggle for all gifting scores */}
        {sortedScores.length > 0 && (
          <button onClick={function(e){e.stopPropagation();setShowAllGiftings(function(v){return !v;});}}
            style={{fontSize:10,padding:"3px 9px",borderRadius:999,background:"rgba(94,234,212,0.04)",
              color:"#5eead4",border:"1px solid rgba(94,234,212,0.18)",cursor:"pointer",fontWeight:500,
              fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>
            {showAllGiftings ? (lang==="PT" ? "Ocultar dons" : "Hide giftings") : (lang==="PT" ? "Ver todos os dons" : "View all giftings")}
          </button>
        )}
      </div>

      {/* ── Collapsible gifting score bars ── */}
      {showAllGiftings && sortedScores.length > 0 && (
        <div onClick={function(e){e.stopPropagation();}} style={{marginBottom:8,background:"rgba(8,16,22,0.55)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 12px"}}>
          {sortedScores.map(function(entry, idx){
            var gifting = entry[0];
            var score = entry[1];
            var pct = Math.min(Math.round(Number(score)), 100);
            var anchor = GIFTING_TO_ANCHOR[gifting] || null;
            return (
              <div key={gifting} style={{marginBottom:idx<sortedScores.length-1?8:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,alignItems:"center"}}>
                  <span onClick={anchor ? function(e){navTo(e,anchor);} : undefined}
                    style={{fontSize:11,color:"#aebac0",display:"flex",alignItems:"center",gap:4,cursor:anchor?"pointer":"default"}}>
                    {GIFTING_ICONS[gifting]||"◆"} {giftingLabel(gifting, person.language)}
                  </span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:idx===0?"#5eead4":"#e6f1f0",fontWeight:500}}>{pct}%</span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.04)",borderRadius:999}}>
                  <div style={{height:"100%",width:pct+"%",
                    background:idx===0?"linear-gradient(90deg,#5eead4,#2dd4bf)":"linear-gradient(90deg,rgba(94,234,212,0.45),rgba(94,234,212,0.25))",
                    borderRadius:999,boxShadow:idx===0?"0 0 8px rgba(94,234,212,0.35)":"none"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DISC row ── */}
      {person.disc_primary && (
        <div onClick={function(e){e.stopPropagation();}} style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:5,alignItems:"center"}}>
          <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#6b7a82",flexShrink:0,minWidth:52}}>DISC</span>
          <span onClick={function(e){navTo(e,DISC_TO_ANCHOR[person.disc_primary]||"executor");}}
            style={{fontSize:11,padding:"2px 8px",borderRadius:4,
              background:DISC_COLORS[person.disc_primary]+"18",
              border:"1px solid " + DISC_COLORS[person.disc_primary] + "44",
              color:DISC_COLORS[person.disc_primary],fontWeight:700,cursor:"pointer"}}>
            {(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[person.disc_primary]}
          </span>
          {person.disc_secondary && (
            <span onClick={function(e){navTo(e,DISC_TO_ANCHOR[person.disc_secondary]||"executor");}}
              style={{fontSize:10,padding:"2px 7px",borderRadius:4,
                background:DISC_COLORS[person.disc_secondary]+"0d",
                border:"1px solid " + DISC_COLORS[person.disc_secondary] + "28",
                color:DISC_COLORS[person.disc_secondary],opacity:0.75,cursor:"pointer"}}>
              {(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[person.disc_secondary]}
            </span>
          )}
        </div>
      )}

      {/* ── Natural Strength ── */}
      {nsEntry && (
        <div onClick={function(e){e.stopPropagation();}} style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#6b7a82",flexShrink:0,minWidth:52}}>{lang==="PT"?"Forca":"Strength"}</span>
          <span onClick={function(e){navTo(e,nsEntry.anchorId);}} style={tagStyle}>
            {lang==="PT" ? nsEntry.PT : nsEntry.EN}
          </span>
        </div>
      )}

      {/* ── Leadership Tendency ── */}
      {ldEntry && (
        <div onClick={function(e){e.stopPropagation();}} style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#6b7a82",flexShrink:0,minWidth:52}}>{lang==="PT"?"Lideranca":"Leadership"}</span>
          <span onClick={function(e){navTo(e,ldEntry.anchorId);}} style={tagStyle}>
            {lang==="PT" ? ldEntry.PT : ldEntry.EN}
          </span>
          {person.pastoral_flag==1 && (
            <span title={lang==="PT"?"Potencial Pastoral":"Pastoral Potential"} style={{width:7,height:7,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 6px #f59e0b",flexShrink:0,display:"inline-block"}} />
          )}
        </div>
      )}

      {/* ── Emotional Profile ── */}
      {emEntry && (
        <div onClick={function(e){e.stopPropagation();}} style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#6b7a82",flexShrink:0,minWidth:52}}>{lang==="PT"?"Emocional":"Emotional"}</span>
          <span onClick={function(e){navTo(e,emEntry.anchorId);}} style={tagStyle}>
            {lang==="PT" ? emEntry.PT : emEntry.EN}
          </span>
        </div>
      )}

      {/* ── Pairing Labels ── */}
      {pairingLabels.length > 0 && (
        <div onClick={function(e){e.stopPropagation();}} style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#6b7a82",flexShrink:0,minWidth:52}}>{lang==="PT"?"Parceria":"Pairing"}</span>
          {pairingLabels.slice(0,2).map(function(pl,i){
            var anchor = pl ? pl.toLowerCase().replace(/ /g,"-") : null;
            return (
              <span key={i} onClick={anchor ? function(e){navTo(e,anchor);} : undefined}
                style={{fontSize:11,padding:"2px 8px",borderRadius:999,
                  background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",
                  color:"#c4b5fd",cursor:anchor?"pointer":"default"}}>
                {pl}
              </span>
            );
          })}
          {pairingLabels.length > 2 && (
            <span style={{fontSize:10,color:"#6b7a82",fontFamily:"'JetBrains Mono',monospace"}}>
              {"+" + (pairingLabels.length-2) + " " + (lang==="PT"?"a mais":"more")}
            </span>
          )}
        </div>
      )}

      {/* ── Ministry Fit ── */}
      {person.ministry_fit && (
        <div onClick={function(e){e.stopPropagation();}} style={{marginBottom:5}}>
          <span style={{fontSize:11,color:"#6b7a82",fontStyle:"italic"}}>{person.ministry_fit}</span>
        </div>
      )}

      {/* ── Footer: pastor / langs / groups / WA ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {person.assigned_pastor && <span style={{fontSize:11,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace"}}>{"→ " + person.assigned_pastor}</span>}
          {langs.map(function(l){return <span key={l} style={{fontSize:10,padding:"2px 7px",background:"rgba(255,255,255,0.03)",color:"#6b7a82",borderRadius:999,border:"1px solid rgba(255,255,255,0.05)"}}>{l}</span>;
          })}
          {groups.map(function(g){return <span key={g} style={{fontSize:10,padding:"2px 7px",background:"rgba(94,234,212,0.06)",color:"#5eead4",borderRadius:999,border:"1px solid rgba(94,234,212,0.15)"}}>{g}</span>;
          })}
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
          {/* Name + DISC badge + Carisma badges inline */}
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:"#e6f1f0"}}>{person.preferred_name || person.name}</span>
            {person.disc_primary && (
              <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,
                background:`${DISC_COLORS[person.disc_primary]}1a`,
                border:`1px solid ${DISC_COLORS[person.disc_primary]}44`,
                color:DISC_COLORS[person.disc_primary],fontWeight:700}}>
                {(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[person.disc_primary]}
              </span>
            )}
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

  const sortedScores = Object.entries(scores).map(([k,v])=>[SHORT_TO_FULL[k]||k,Math.min(Number(v),100)]).sort((a,b)=>b[1]-a[1]);

  const CARISMA_LEVELS = ["1 Ano", "1st Year", "Masters", "Level 5"];

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
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,color:"#e6f1f0"}}>{person.preferred_name || person.name}</span>
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
              <span style={{fontSize:11,padding:"4px 10px",background:badge.bg,color:badge.color,borderRadius:999,fontWeight:600,border:`1px solid ${badge.color}44`}}>{badge.label==="Available"?t.available:badge.label}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {ministries.map(m=>(
                <span key={m} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,padding:"6px 11px",background:"rgba(94,234,212,0.08)",color:"#c5f5ec",borderRadius:8,border:"1px solid rgba(94,234,212,0.22)"}}>
                  {ministryLabel(m, lang, person.language)}
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
                  {(LANGUAGE_DISPLAY[lang]||LANGUAGE_DISPLAY.EN)[l]||l}
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

          {/* DISC Profile */}
          {(person.disc_primary || person.natural_strength) && (
            <div style={{paddingTop:22,paddingBottom:22,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginBottom:12,fontWeight:500}}>{t.discProfile}</div>
              {/* Type badges */}
              {person.disc_primary && (
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:12,padding:"6px 12px",borderRadius:8,
                    background:`${DISC_COLORS[person.disc_primary]}18`,
                    border:`1px solid ${DISC_COLORS[person.disc_primary]}50`,
                    color:DISC_COLORS[person.disc_primary],fontWeight:700,
                    display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,opacity:0.7}}>#1</span>
                    {(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[person.disc_primary]}
                  </span>
                  {person.disc_secondary && (
                    <span style={{fontSize:11,padding:"5px 10px",borderRadius:8,
                      background:`${DISC_COLORS[person.disc_secondary]}0e`,
                      border:`1px solid ${DISC_COLORS[person.disc_secondary]}30`,
                      color:DISC_COLORS[person.disc_secondary],fontWeight:600,
                      display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,opacity:0.7}}>#2</span>
                      {(DISC_TYPE[lang||"PT"]||DISC_TYPE.PT)[person.disc_secondary]}
                    </span>
                  )}
                  {person.pastoral_flag==1 && (
                    <span style={{fontSize:10,padding:"4px 10px",borderRadius:6,
                      background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",
                      color:"#fbd590",fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                      {"★ "}{t.pastoralAlert}
                    </span>
                  )}
                </div>
              )}
              {/* Trait rows */}
              {(person.natural_strength || person.leadership_tendency || person.emotional_profile) && (
                <div style={{background:"rgba(8,16,22,0.6)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
                  {person.natural_strength && (
                    <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                      <span style={{fontSize:11,color:"#6b7a82",flexShrink:0}}>{t.naturalStr}</span>
                      <span style={{fontSize:12,color:"#aebac0",textAlign:"right"}}>{person.natural_strength}</span>
                    </div>
                  )}
                  {person.leadership_tendency && (
                    <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                      <span style={{fontSize:11,color:"#6b7a82",flexShrink:0}}>{t.leadership}</span>
                      <span style={{fontSize:12,color:"#aebac0",textAlign:"right"}}>{person.leadership_tendency}</span>
                    </div>
                  )}
                  {person.emotional_profile && (
                    <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                      <span style={{fontSize:11,color:"#6b7a82",flexShrink:0}}>{t.emotional}</span>
                      <span style={{fontSize:12,color:"#aebac0",textAlign:"right"}}>{person.emotional_profile}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Ministry fit tags */}
              {person.ministry_fit && parseJSON(person.ministry_fit,[]).length > 0 && (
                <div>
                  <div style={{fontSize:11,color:"#6b7a82",marginBottom:6}}>{t.ministryFit}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {parseJSON(person.ministry_fit,[]).map(function(m){return(
                      <span key={m} style={{fontSize:11,padding:"3px 9px",background:"rgba(94,234,212,0.06)",color:"#5eead4",borderRadius:6,border:"1px solid rgba(94,234,212,0.15)"}}>{m}</span>
                    );})}
                  </div>
                </div>
              )}
            </div>
          )}

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

function PeopleTab({ token, t, lang, templatePT, templateEN, onNavigate }) {
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
            {["All",...activeStages].map(o=><option key={o} value={o}>{o==="All"?t.allStages:(STAGE_LABEL[lang||"PT"]||STAGE_LABEL.PT)[o]||o}</option>)}
          </select>
        )}
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
              {t.cancel}
            </button>
          </div>
          {splitDone && <div style={{marginTop:12,fontSize:12,color:"#5eead4",fontFamily:"'JetBrains Mono',monospace"}}>{splitDone}</div>}
        </div>
      )}

      {/* Cards grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
        {view === "active" && filtered.map(p => (
          <PersonCard key={p.id} person={p} onClick={()=>setSelectedId(p.id)} templatePT={templatePT} templateEN={templateEN} t={t} lang={lang} onNavigate={onNavigate} />
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
  const healthy  = MINISTRY_HEALTH_DATA.filter(m => m.current >= m.ideal).length;
  const needs    = MINISTRY_HEALTH_DATA.filter(m => m.current >= m.min && m.current < m.ideal).length;
  const critical = MINISTRY_HEALTH_DATA.filter(m => m.current < m.min).length;
  return (
    <div style={{padding:"32px 28px",display:"flex",flexDirection:"column",gap:20}}>

      {/* ── Dev banner ── */}
      <div style={{display:"flex",gap:14,padding:"16px 22px",borderRadius:14,
        background:"linear-gradient(90deg,rgba(245,158,11,0.10),rgba(245,158,11,0.02))",
        border:"1px solid rgba(245,158,11,0.2)",alignItems:"center"}}>
        <div style={{width:36,height:36,borderRadius:8,flexShrink:0,
          background:"rgba(245,158,11,0.18)",display:"grid",placeItems:"center",
          color:"#fbd590",fontSize:16}}>
          🚧
        </div>
        <div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,
            letterSpacing:"0.1em",textTransform:"uppercase",color:"#fbd590",marginBottom:4}}>
            {lang==="PT" ? "Em Desenvolvimento" : "Under Construction"}
          </div>
          <p style={{margin:0,fontSize:12,color:"#6b7a82",lineHeight:1.6}}>
            {lang==="PT"
              ? "Em breve, pastores poderão acompanhar a saúde de cada ministério em tempo real."
              : "Coming soon — pastors will track each ministry's health in real time."}
          </p>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[
          {label:lang==="PT"?"Total de Ministérios":"Total Ministries", value:MINISTRY_HEALTH_DATA.length, accent:"#5eead4", spark:[16,16,16,17,17,17,17,17]},
          {label:lang==="PT"?"Saudáveis":"Healthy",                     value:healthy,  accent:"#34d399", spark:[2,2,1,1,1,0,0,healthy]},
          {label:lang==="PT"?"Precisam de Voluntários":"Need Volunteers",value:needs,   accent:"#f59e0b", spark:[10,11,12,12,13,13,13,needs]},
          {label:lang==="PT"?"Críticos":"Critical",                      value:critical, accent:"#f87171", spark:[3,4,4,3,4,4,4,critical]},
        ].map(({label,value,accent,spark})=>(
          <div key={label} className="glass" style={{padding:24,position:"relative",overflow:"hidden",borderRadius:12}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,
              background:`linear-gradient(90deg,${accent},transparent 60%)`,
              boxShadow:`0 0 12px ${accent}66`}}/>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:52,
                  color:accent,lineHeight:1,letterSpacing:"-0.02em",textShadow:`0 0 24px ${accent}33`}}>
                  {value}
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",
                  letterSpacing:"0.18em",textTransform:"uppercase",color:"#6b7a82",marginTop:10}}>
                  {label}
                </div>
              </div>
              <div style={{opacity:0.65,paddingTop:4}}>
                <MiniSpark values={spark} color={accent} width={72} height={28}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Ministry health cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
        {MINISTRY_HEALTH_DATA.map(m => {
          const status = ministryHealthStatus(m.current, m.min, m.ideal);
          const isCritical = m.current < m.min;
          const aboveMin = m.current >= m.min;
          const pct = (m.current / m.ideal) * 100;
          return (
            <div key={m.name} className={`glass ${isCritical ? "" : "glow-hover"}`}
              style={{padding:20,position:"relative",overflow:"hidden",borderRadius:12,
                borderLeft:`2px solid ${status.color}88`,
                boxShadow:isCritical
                  ?"0 0 0 1px rgba(248,113,113,0.15), 0 20px 40px -20px rgba(248,113,113,0.2)"
                  :"0 4px 16px rgba(0,0,0,0.25)"}}>

              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <h3 style={{margin:0,fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:"#e6f1f0"}}>
                  {lang==="PT" ? (MINISTRY_PT[m.name]||m.name) : m.name}
                </h3>
                <span style={{fontSize:9.5,padding:"3px 9px",background:status.bg,color:status.color,
                  borderRadius:999,fontWeight:600,whiteSpace:"nowrap",border:`1px solid ${status.color}33`,
                  fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>
                  ● {status.label==="Critical" ? t.statusCritical : status.label==="Healthy" ? t.statusHealthy : t.statusNeeds}
                </span>
              </div>
              <div style={{fontSize:11.5,color:"#6b7a82",marginBottom:16,display:"flex",alignItems:"center",gap:4}}>
                → {m.leader}
              </div>

              {/* Gauge + metrics */}
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <RadialGauge value={m.current} max={m.ideal} size={84} thickness={6} color={status.color}/>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
                  {/* Bar with min marker */}
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9.5px",
                        letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82"}}>
                        {t.volunteers}
                      </span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#aebac0"}}>
                        <span style={{color:status.color}}>{m.current}</span> / {m.ideal}
                      </span>
                    </div>
                    <div style={{position:"relative",height:6,background:"rgba(255,255,255,0.04)",borderRadius:999}}>
                      <div style={{position:"absolute",left:0,top:0,height:"100%",
                        width:`${Math.min(pct,100)}%`,
                        background:`linear-gradient(90deg,${status.color},${status.color}aa)`,
                        borderRadius:999,boxShadow:`0 0 8px ${status.color}66`}}/>
                      {/* Min marker */}
                      <div style={{position:"absolute",left:`${(m.min/m.ideal)*100}%`,
                        top:-3,bottom:-3,width:1,background:"rgba(255,255,255,0.25)"}}/>
                    </div>
                  </div>
                  {/* MIN / IDEAL / GAP stats */}
                  <div style={{display:"flex",gap:14}}>
                    {[
                      {label:"MIN",  val:m.min,             color:aboveMin?"#34d399":"#f87171"},
                      {label:"IDEAL",val:m.ideal,           color:"#aebac0"},
                      {label:"GAP",  val:`−${m.ideal-m.current}`, color:status.color},
                    ].map(({label,val,color})=>(
                      <div key={label} style={{display:"flex",flexDirection:"column",gap:2}}>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",
                          letterSpacing:"0.14em",textTransform:"uppercase",color:"#6b7a82"}}>
                          {label}
                        </span>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                          fontWeight:600,color}}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REFERENCE CONTENT (full pastoral reference data) ──────────
const REFERENCE_CONTENT = {
  giftings: [
    {
      id: "worship-and-music",
      anchorId: "worship-and-music",
      labelPT: "Louvor e Música",
      labelEN: "Worship and Music",
      summaryPT: "Dom para adoração, música e expressão criativa que conecta pessoas à presença de Deus.",
      summaryEN: "Gifting for worship, music, and creative expression that connects people to God's presence.",
      bodyPT: "A música sempre foi central para como o povo de Deus encontra a Sua presença. A harpa de Davi fez um espírito maligno sair de Saul. Eliseu pediu um músico antes de o Espírito vir sobre ele para profetizar. O maior livro da Bíblia é uma coleção de músicas e poemas. Depois da Ceia, Jesus e Seus discípulos cantaram um hino juntos antes de ir ao Getsêmani (Mateus 26:30). Alguém com o dom de Louvor e Música carrega mais do que talento musical. Carrega uma sensibilidade para a presença de Deus que, quando serve, torna essa presença tangível no ambiente ao redor. O dom não é medido apenas pela habilidade técnica, mas pelo modo como a atmosfera muda quando essa pessoa se engaja. Pode se expressar pelo canto, pelo instrumento, pela composição, pela poesia, pelo movimento ou simplesmente pela presença intencional de alguém que sabe criar espaço para que Deus seja sentido. Essa pessoa recorre a uma música ou a um poema quando as palavras sozinhas não bastam. Sente o peso de preparar não só as notas, mas a atmosfera. Para ela, a adoração não é o que faz no domingo, mas a maneira como processa a vida inteira. Fundamentação bíblica: 1 Crônicas 25, Salmos, 2 Reis 3:15, Efésios 5:19, Mateus 26:30.",
      bodyEN: "Music has always been central to how God's people encounter His presence. David's harp caused an evil spirit to leave Saul. Elisha called for a musician before the Spirit came upon him to prophesy. The largest book of the Bible is a collection of songs and poems. After the Last Supper, Jesus and His disciples sang a hymn together before going out to Gethsemane (Matthew 26:30). Someone with the Worship and Music gifting carries more than musical talent. They carry a sensitivity to God's presence that, when they serve, makes it tangible in the space around them. The gift is not measured by technical skill alone but by the way the atmosphere shifts when they engage. It can express itself through singing, playing, composing, poetry, movement, or the intentional presence of someone who knows how to create space for God to be felt. This person turns to a song or a poem when words alone are not enough. They feel the weight of preparing not just the notes but the atmosphere. For them, worship is not what they do on Sunday but how they process the whole of life. Biblically grounded in: 1 Chronicles 25, Psalms, 2 Kings 3:15, Ephesians 5:19, Matthew 26:30.",
      footnote: "1. Adapted from O Chamado e os Dons Ministeriais, Drummond Lacerda and Braulio Brandao, Editora Comunicacao Lagoinha, 2014. Chapter 12.",
    },
    {
      id: "gift-of-helps",
      anchorId: "gift-of-helps",
      labelPT: "Dom de Ajudar",
      labelEN: "Gift of Helps",
      summaryPT: "Dom para servir nos bastidores, notar o que precisa ser feito e agir com fidelidade e amor.",
      summaryEN: "Gifting for behind-the-scenes service, noticing what needs doing, and acting with faithfulness and love.",
      bodyPT: "Em João 13, Jesus sabia que a hora tinha chegado, que todas as coisas estavam em Suas mãos, que havia vindo de Deus e para Deus estava indo. E, desse lugar de autoridade completa e conhecimento pleno, levantou-se da mesa, tirou a roupa de cima, amarrou uma toalha na cintura e começou a lavar os pés dos discípulos. Pedro recusou. Jesus lhe disse: \"O que estou fazendo você não entende agora, mas depois entenderá.\" Quando Pedro ainda resistiu, Jesus disse: \"Se eu não te lavar, você não terá parte comigo.\" Isso não foi Jesus notando uma tarefa que precisava ser feita. Foi o Senhor de toda a criação escolhendo a posição mais baixa como um ato de amor de aliança, virando de cabeça para baixo toda suposição sobre grandeza e autoridade que Seus discípulos carregavam. A repreensão a Pedro revela o que estava realmente acontecendo. Para receber esse tipo de serviço, é preciso largar a própria compreensão sobre quem merece servir quem. Para dá-lo, é preciso já ter largado completamente essa compreensão. Alguém com o Dom de Ajudar carrega esse mesmo espírito. Não precisa de reconhecimento para se sentir satisfeito. Sente-se mais em casa nos bastidores, garantindo que tudo funcione para que outros possam florescer. Nota o que é necessário antes que alguém anuncie. Há uma satisfação genuína nos atos pequenos e consistentes que mantêm tudo unido. O apóstolo Paulo coloca esse dom ao lado de milagres e cura em 1 Coríntios 12:28. Sem pessoas que o carregam, todo outro ministério opera com capacidade reduzida. Fundamentação bíblica: João 13:1-17, 1 Coríntios 12:28, Romanos 12:7.",
      bodyEN: "In John 13, Jesus knew that the hour had come, that all things were in His hands, that He had come from God and was going to God. And from that place of complete authority and full knowledge, He rose from the table, took off His outer garment, tied a towel around His waist, and began to wash His disciples' feet. Peter refused. Jesus told him: \"What I am doing you do not understand now, but afterward you will understand.\" When Peter still resisted, Jesus said: \"If I do not wash you, you have no share with me.\" This was not Jesus noticing a task that needed doing. It was the Lord of all creation choosing the lowest position as an act of covenant love, turning upside down every assumption about greatness and authority His disciples had carried. The rebuke to Peter reveals what was really happening. To receive this kind of service, you have to let go of your own understanding of who deserves to serve whom. To give it, you have to have already let go of that understanding completely. Someone with the Gift of Helps carries that same spirit. They do not need recognition to feel satisfied. They feel most at home in the background, making sure everything works so others can thrive. They notice what is needed before anyone announces it. There is genuine fulfillment in the small, consistent acts that hold everything together. The apostle Paul places this gift alongside miracles and healing in 1 Corinthians 12:28. Without people who carry it, every other ministry operates at reduced capacity. Biblically grounded in: John 13:1-17, 1 Corinthians 12:28, Romans 12:7.",
    },
    {
      id: "visual-storytelling",
      anchorId: "visual-storytelling",
      labelPT: "Narrativa Visual",
      labelEN: "Visual Storytelling",
      summaryPT: "Dom para capturar, criar e contar histórias visuais que tornam o invisível visível.",
      summaryEN: "Gifting for capturing, creating, and telling visual stories that make the invisible visible.",
      bodyPT: "Deus sempre usou meios visuais para comunicar verdades eternas. Colocou um arco-íris no céu como sinal de aliança. Instruiu Israel a construir símbolos físicos de Sua fidelidade. Veio à terra e ensinou através de imagens, sementes, vinhedos, moedas perdidas e filhos pródigos. Quando chamou Bezalel pelo nome em Êxodo 31, encheu-o do Espírito de Deus especificamente para o trabalho de artesanato artístico, para que a beleza e a precisão do Tabernáculo tornassem a presença de Deus tangível para um povo aprendendo a estar perto d'Ele. Alguém com o dom de Narrativa Visual carrega um olhar criativo que enxerga histórias em imagens, movimento, luz e espaço. Pode trabalhar através de filme, fotografia, design gráfico, direção de arte ou cenografia. O que distingue isso de uma habilidade artística geral é o impulso de comunicar algo. Tornar o invisível visível. Tornar o complexo acessível. Tornar o eterno expresso de uma forma que alcança esta pessoa neste momento. Fundamentação bíblica: Êxodo 31:1-6, João 1:14, Colossenses 1:15.",
      bodyEN: "God has always used visual means to communicate eternal truth. He placed a rainbow in the sky as a covenant sign. He instructed Israel to build physical symbols of His faithfulness. He came to earth and taught through images, seeds, vineyards, lost coins, and prodigal sons. When He called Bezalel by name in Exodus 31, He filled him with the Spirit of God specifically for the work of artistic craftsmanship, so that the beauty and precision of the Tabernacle would make His presence tangible to a people learning how to be near Him. Someone with the Visual Storytelling gifting carries a creative eye that sees stories in images, movement, light, and space. They may work through film, photography, graphic design, art direction, or set design. What distinguishes this from general artistic skill is the drive to communicate something. To take what is invisible and make it visible. To take what is complex and render it accessible. To take what is eternal and express it in a form that lands in this moment with this person. Biblically grounded in: Exodus 31:1-6, John 1:14, Colossians 1:15.",
    },
    {
      id: "digital-communication",
      anchorId: "digital-communication",
      labelPT: "Comunicacao Digital",
      labelEN: "Digital Communication",
      summaryPT: "Dom para levar o evangelho aos espaços onde as pessoas ja vivem, usando linguagem e plataformas digitais.",
      summaryEN: "Gifting for bringing the Gospel into the spaces where people already live, using digital language and platforms.",
      bodyPT: "Quando Paulo chegou em Atenas, nao ficou do lado de fora da cidade anunciando o Evangelho. Entrou na cidade, observou o que o povo valorizava, leu a cultura com cuidado suficiente para encontrar a pergunta que ja estavam fazendo e entao construiu a ponte a partir dali. No Areopago, disse a eles: \"Percebo que em todos os sentidos voces sao muito religiosos. Pois ao passar e observar os objetos de vosso culto, encontrei tambem um altar com esta inscricao: A um deus desconhecido. Pois bem, esse que voces adoram sem conhecer, e esse que eu anuncio a voces\" (Atos 17:22-23). Ele nao comprometeu a mensagem. Encontrou o lugar onde o anseio existente deles encontrava a verdade que carregava e entrou nesse lugar sem desculpas e sem diluicao. Alguem com o dom de Comunicacao Digital faz isso nos espacos onde as pessoas vivem hoje. Pensa instintivamente em como o Evangelho alcanca uma pessoa que nao esta buscando. Entende atencao, timing, linguagem e plataforma. Sente o impulso de traduzir o que e verdadeiro para a forma que alcanca a pessoa que esta passando rolando o feed neste momento especifico da historia. Isso nao e marketing. E evangelismo. Fundamentacao biblica: Atos 17:16-34, Romanos 10:14-15, 1 Corintios 9:22.",
      bodyEN: "When Paul arrived in Athens, he did not stand outside the city and announce the Gospel. He walked through the city, observed what the people valued, read their culture carefully enough to find the question they were already asking, and then built the bridge from there. At the Areopagus, he told them: \"I perceive that in every way you are very religious. For as I passed along and observed the objects of your worship, I found also an altar with this inscription: To the unknown god. What therefore you worship as unknown, this I proclaim to you\" (Acts 17:22-23). He did not compromise the message. He found the place where their existing longing met the truth he carried, and he stepped into that place without apology and without dilution. Someone with the Digital Communication gifting does this in the spaces where people actually live today. They think instinctively about how the Gospel reaches a person who is not already looking for it. They understand attention, timing, language, and platform. They feel the pull of wanting to translate what is true into the form that reaches the person who is scrolling past at this particular moment in history. This is not marketing. In a generation where more people encounter the church online before they ever walk through a door, this is evangelism. Biblically grounded in: Acts 17:16-34, Romans 10:14-15, 1 Corinthians 9:22.",
    },
    {
      id: "intercession",
      anchorId: "intercession",
      labelPT: "Intercessao",
      labelEN: "Intercession",
      summaryPT: "Dom para oracao persistente e profunda em favor de outros, sustentando o que acontece no campo espiritual.",
      summaryEN: "Gifting for sustained, deep prayer on behalf of others, sustaining what happens in the spiritual realm.",
      bodyPT: "Moises ficou entre um Deus santo e um povo que acabara de construir um bezerro de ouro, e porque ficou la, a nacao foi poupada (Exodo 32:11-14). Neemias, ao ouvir que os muros de Jerusalem estavam destruidos, sentou, chorou, jejuou e orou por dias antes de fazer um unico plano (Neemias 1:4-11). Daniel se pos a orar e jejuar por vinte e um dias antes que a resposta chegasse (Daniel 10:2-13). Intercessao nao e uma pratica espiritual suave. E um trabalho espiritual sustentado e custoso em beneficio de outros. Alguem com o dom de Intercessao sente um chamado para a oracao que vai alem da devocao pessoal. Carrega cargas por pessoas, situacoes e lugares que nao sao seus. Ora com persistencia, com especificidade e com uma conveccao profunda de que o que faz no reino invisivel afeta diretamente o que acontece no visivel. Pode nao ser visivel no ministerio. Muitas vezes e a razao pela qual as coisas acontecem nele. Fundamentacao biblica: Exodo 32:11-14, Neemias 1, Daniel 10, Romanos 8:26-27.",
      bodyEN: "Moses stood between a holy God and a people who had just built a golden calf, and because he stood there, the nation was spared (Exodus 32:11-14). Nehemiah, upon hearing the walls of Jerusalem were broken down, sat down and wept and fasted and prayed for days before he made a single plan (Nehemiah 1:4-11). Daniel set himself to pray and fast for twenty-one days before the answer broke through (Daniel 10:2-13). Intercession is not a gentle spiritual practice. It is sustained, costly, spiritual labor conducted on behalf of others. Someone with the Intercession gifting feels a pull toward prayer that goes beyond personal devotion. They carry burdens for people, situations, and places that are not their own. They pray with persistence, with specificity, and with a deep conviction that what they do in the unseen realm directly affects what happens in the visible one. They may not be visible in the ministry. They are often the reason things happen in it. Biblically grounded in: Exodus 32:11-14, Nehemiah 1, Daniel 10, Romans 8:26-27.",
    },
    {
      id: "hospitality",
      anchorId: "hospitality",
      labelPT: "Hospitalidade",
      labelEN: "Hospitality",
      summaryPT: "Dom para fazer com que estranhos se sintam em casa e que pessoas que se sentem de fora sejam vistas e acolhidas.",
      summaryEN: "Gifting for making strangers feel at home and ensuring people who feel on the outside are seen and welcomed.",
      bodyPT: "Abraao estava sentado na entrada de sua tenda no calor do dia e, quando tres estranhos apareceram na estrada, correu para encontra-los, inclinou-se ate o chao e imediatamente providenciou agua, comida, descanso e boas-vindas (Genesis 18:1-8). Ele ainda nao sabia quem eles eram. O autor de Hebreus olha para momentos exatamente como este e diz: \"Nao se esquecam de receber os estranhos com amor, porque, ao praticarem isso, alguns ja hospedaram anjos sem o saber\" (Hebreus 13:2). O dom de Hospitalidade nao e a capacidade de organizar eventos ou cozinhar bem, embora possa incluir ambos. E um desejo genuino e profundo de que as pessoas se sintam em casa, que sintam que ha um lugar para elas, que sao esperadas, que pertencem. Pessoas com esse dom tem uma habilidade sobrenatural de fazer estranhos se sentirem familia em pouco tempo. Estao sintonizadas para quem se sente de fora e se movem em direcao a essa pessoa antes que qualquer outra pessoa perceba. Em um contexto de igreja, esse dom muitas vezes e a diferenca entre uma pessoa voltar apos sua primeira visita ou nunca mais voltar. Fundamentacao biblica: Genesis 18:1-8, Romanos 12:13, Hebreus 13:2, 1 Pedro 4:9.",
      bodyEN: "Abraham sat at the entrance of his tent in the heat of the day, and when three strangers appeared on the road, he ran to meet them, bowed to the ground, and immediately moved to provide water, food, rest, and welcome (Genesis 18:1-8). He did not know yet who they were. The writer of Hebrews looks back on moments exactly like this one and says: \"Do not neglect to show hospitality to strangers, for thereby some have entertained angels unawares\" (Hebrews 13:2). The Hospitality gifting is not the ability to host events or cook well, though it may include both. It is a deep, genuine desire for people to feel at home, to feel that there is a place for them, that they are expected, that they belong. People with this gifting have a supernatural ability to make strangers feel like family in a short time. They are attuned to who feels out of place and they move toward that person before anyone else notices. In a church context, this gifting is often the difference between a person returning after their first visit or never coming back. Biblically grounded in: Genesis 18:1-8, Romans 12:13, Hebrews 13:2, 1 Peter 4:9.",
    },
    {
      id: "evangelism",
      anchorId: "evangelism",
      labelPT: "Evangelismo",
      labelEN: "Evangelism",
      summaryPT: "Dom para anunciar o Evangelho com clareza, coragem e um peso genuino pelas pessoas que ainda nao conhecem Jesus.",
      summaryEN: "Gifting for announcing the Gospel with clarity, boldness, and a genuine burden for people who do not yet know Jesus.",
      bodyPT: "O livro de Atos registra Filipe o evangelista com esse titulo especifico, \"o evangelista\" (Atos 21:8), o unico na Novidade Testamento a recebe-lo formalmente. Comecou como um diacono servindo mesas. Quando a perseguicao dispersou a igreja, o dom que vivia nele foi liberado. Pregou Cristo em Samaria e multidoes creram. Entao o Espirito o enviou de volta ao deserto para uma unica conversa com um oficial etiopio cuja vida eterna estava em jogo. Depois de batiza-lo nas aguas, Filipe foi levado pelo Espirito a proximo cidade. Lacerda e Brandao observam isso sobre Filipe: ele nao ficou para discipular os que havia alcancado. Esse era o trabalho dos apostolos. Seu coracao batia pelas pessoas que ainda estavam no caminho para o inferno, nao pelas que ja estavam no redil. Alguem com o dom de Evangelismo carrega um peso pelas pessoas que ainda nao conhecem Jesus, e esse peso nao diminui com o tempo. E dotado da capacidade de comunicar o Evangelho de forma clara e acessivel a pessoas que nunca o ouviram. Se sente mais vivo quando alguem passa da morte para a vida. Fundamentacao biblica: Atos 8, Atos 21:8, Efesios 4:11, Marcos 16:15.",
      bodyEN: "The book of Acts records Philip the evangelist with that specific title, \"the evangelist\" (Acts 21:8), the only person in the New Testament to formally receive it. He began as a deacon serving tables. When persecution scattered the church, the gift that lived in him was released. He preached Christ in Samaria and multitudes believed. Then the Spirit sent him away from the revival to a desert road for a single conversation with one Ethiopian official whose eternal life was at stake. After baptizing him in water, Philip was carried away by the Spirit to the next city. Lacerda and Brandao observe this about Philip: he did not stay to disciple those he had reached. That was the apostles' work. His heart beat for the ones who were still on the road to death, not the ones already in the fold. Someone with the Evangelism gifting carries a burden for people who do not yet know Jesus, and it does not diminish over time. They are gifted with the ability to communicate the Gospel clearly and accessibly to people who have never heard it. They feel most alive when someone crosses from death to life. Biblically grounded in: Acts 8, Acts 21:8, Ephesians 4:11, Mark 16:15.",
      footnote: "1. Adaptado de O Chamado e os Dons Ministeriais, Drummond Lacerda e Braulio Brandao, Editora Comunicacao Lagoinha, 2014. Capitulo 3.",
    },
    {
      id: "encouragement",
      anchorId: "encouragement",
      labelPT: "Encorajamento",
      labelEN: "Encouragement",
      summaryPT: "Dom para ver o que e verdadeiro e digno nas pessoas antes que qualquer outro veja, e se recusar a ficar em silencio sobre isso.",
      summaryEN: "Gifting for seeing what is true and worthy in people before others see it, and refusing to stay quiet about it.",
      bodyPT: "O nome dado de nascimento era Jose, mas os apostolos o chamavam de Barnabe, que significa \"filho do encorajamento\" (Atos 4:36). Quando Paulo chegou a Jerusalem depois de sua conversao, os outros discipulos se recusaram a crer que ele era realmente um crente. Estavam com medo dele. Sabiam quem ele havia sido. Barnabe o tomou, levou-o aos apostolos e o garantiu pessoalmente, contando como Paulo havia visto o Senhor na estrada de Damasco e como havia pregado ousadamente naquela cidade (Atos 9:26-27). Esse unico ato de crenca em favor de alguem que estava sendo deixado de fora mudou a trajetoria da igreja primitiva. Alguem com o dom de Encorajamento ve o que e verdadeiro e digno nas pessoas antes que outros o vejam, e se recusa a ficar quieto sobre isso. Nao sao bajuladores. Seu encorajamento e especifico, fundamentado e tem peso porque e enraizado em algo real. Percebe quando alguem esta carregando desencorajamento e algo nele se move em direcao a essa pessoa. Suas palavras tem uma qualidade de pousar de forma diferente, como se carregassem algo alem das proprias palavras. Fundamentacao biblica: Atos 4:36, Atos 9:26-27, Romanos 12:8.",
      bodyEN: "His given name was Joseph, but the apostles called him Barnabas, which means \"son of encouragement\" (Acts 4:36). When Paul arrived in Jerusalem after his conversion, the other disciples refused to believe he was really a believer. They were afraid of him. They knew who he had been. Barnabas took him, brought him to the apostles, and vouched for him personally, recounting how Paul had seen the Lord on the Damascus road and how he had preached boldly in that city (Acts 9:26-27). That one act of belief on behalf of someone being left out changed the trajectory of the early church. Someone with the Encouragement gifting sees what is true and worthy in people before others see it, and they refuse to stay quiet about it. They are not flatterers. Their encouragement is specific, grounded, and carries weight because it is rooted in something real. They notice when someone is carrying discouragement and something in them moves toward that person. Their words have a quality of landing differently, as if they are carrying something beyond the words themselves. Biblically grounded in: Acts 4:36, Acts 9:26-27, Romans 12:8.",
    },
    {
      id: "faith",
      anchorId: "faith",
      labelPT: "Fe",
      labelEN: "Faith",
      summaryPT: "Dom para carregar uma conviccao sobre o carater de Deus que permanece firme quando tudo o que e visivel discorda.",
      summaryEN: "Gifting for carrying a conviction about God's character that holds steady when everything visible argues otherwise.",
      bodyPT: "Hebreus 11 e o salao da fe, e o que une cada pessoa nessa lista nao e a ausencia de medo, mas a disposicao de avancar antes de poder ver. Abraao partiu sem saber para onde ia (Hebreus 11:8). Noe construiu uma arca sem ter visto chuva. O dom de Fe nao e a ausencia de duvida. E a presenca de uma conviccao sobre o carater de Deus que permanece firme quando tudo o que e visivel discorda. Alguem com o dom de Fe se torna uma presenca estabilizadora quando as pessoas ao redor estao com medo. Nao minimiza a realidade da situacao. Simplesmente carrega uma confianca que nao desmorona sob ela. Em momentos de crise, de incerteza, de espera, sao os que a firmeza da sua presenca da aos outros permissao para continuar se movendo. A igreja precisa de pessoas que possam carregar fe em nome do ambiente. Fundamentacao biblica: Hebreus 11, 1 Corintios 12:9, Romanos 4:18-21.",
      bodyEN: "Hebrews 11 is the hall of faith, and what unites every person on that list is not the absence of fear but the willingness to move forward before they could see. Abraham left without knowing where he was going (Hebrews 11:8). Noah built an ark without having ever seen rain. The gift of Faith is not the absence of doubt. It is the presence of a conviction about the character of God that holds steady when everything visible argues the opposite. Someone with the Faith gifting becomes a stabilizing presence when the people around them are afraid. They do not minimize the reality of the situation. They simply carry a trust that does not collapse under it. In moments of crisis, of uncertainty, of waiting, they are the ones whose steadiness gives others permission to keep moving. The church needs people who can hold faith on behalf of the room. Biblically grounded in: Hebrews 11, 1 Corinthians 12:9, Romans 4:18-21.",
    },
    {
      id: "teaching",
      anchorId: "teaching",
      labelPT: "Ensino",
      labelEN: "Teaching",
      summaryPT: "Dom para abrir as Escrituras de forma que a compreensao das pessoas seja aberta junto com elas.",
      summaryEN: "Gifting for opening Scripture in a way that opens the understanding of the listener along with it.",
      bodyPT: "Na estrada para Emaus, dois discipulos caminhavam para longe de Jerusalem em tristeza e confusao, sua esperanca destruida pela crucificacao. Um estranho se juntou a eles e comecou, desde Moises e todos os Profetas, a explicar-lhes o que estava escrito em todas as Escrituras a Seu respeito. Ele nao se revelou rapidamente. Ensinou primeiro. Mais tarde, quando seus olhos foram abertos e o reconheceram, disseram um ao outro: \"Nao ardia em nos o nosso coracao quando ele nos falava pelo caminho e nos explicava as Escrituras?\" (Lucas 24:32). A palavra traduzida como \"abriu\" ali, dianoigo em grego, significa abrir completamente, fazer alguem entender, despertar a faculdade da compreensao. Quando as Escrituras foram abertas, os olhos deles foram abertos junto. Alguem com o dom de Ensino carrega esse mesmo impulso: abrir as Escrituras de uma forma que abre a compreensao do ouvinte. Nao se contenta com a verdade superficial. E atraido pela profundidade, pelo detalhe, pela pergunta por tras da pergunta. Tem uma forte indignacao com o ensino falso e a ignorancia, nao por orgulho, mas por um instinto protetor pelas pessoas que seriam prejudicadas por eles. Fundamentacao biblica: Efesios 4:11, Lucas 24:27-32, 2 Timoteo 2:2, Atos 18:24-25.",
      bodyEN: "On the road to Emmaus, two disciples were walking away from Jerusalem in grief and confusion, their hope collapsed by the crucifixion. A stranger joined them and began, from Moses and all the Prophets, to explain to them what was said in all the Scriptures concerning Himself. He did not reveal Himself quickly. He taught first. Later, when their eyes were opened and they recognized Him, they said to each other: \"Did not our hearts burn within us while he talked to us on the road, while he opened to us the Scriptures?\" (Luke 24:32). The word translated \"opened\" there, dianoigo in Greek, means to open completely, to cause someone to understand, to awaken the faculty of understanding. When the Scriptures were opened, their eyes were opened along with them. Someone with the Teaching gifting carries that same drive: to open the Scriptures in a way that opens the understanding of the listener. They cannot settle for surface-level truth. They are drawn to depth, to detail, to the question behind the question. They hold a strong indignation toward false teaching and ignorance, not from pride but from a protective instinct for the people who would be harmed by them. Biblically grounded in: Ephesians 4:11, Luke 24:27-32, 2 Timothy 2:2, Acts 18:24-25.",
      footnote: "1. Adaptado de O Chamado e os Dons Ministeriais, Drummond Lacerda e Braulio Brandao, Editora Comunicacao Lagoinha, 2014. Capitulo 4.",
    },
    {
      id: "administration",
      anchorId: "administration",
      labelPT: "Administracao",
      labelEN: "Administration",
      summaryPT: "Dom para construir sistemas e estruturas que permitem que todos os outros dons funcionem com excelencia.",
      summaryEN: "Gifting for building systems and structures that allow every other gift to function with excellence.",
      bodyPT: "Em 1 Corintios 12:28, o dom de administracao vem da palavra grega kubernetes, que literalmente significa guiar um navio. O administrador e o timoneiro: aquele que mantem o curso quando o mar fica dificil. Neemias e o modelo biblico. Quando ouviu que os muros de Jerusalem estavam destruidos, orou, depois fez um plano. Avaliou o problema, apresentou-o ao rei, garantiu recursos, designou cada familia a sua propria secao do muro, acompanhou o progresso, lidou com a oposicao externa, resolveu conflitos internos e os muros de Jerusalem ficaram em pe em cinquenta e dois dias (Neemias 6:15). Alguem com o dom de Administracao ve naturalmente como as pecas de uma situacao complexa poderiam se encaixar de forma mais eficaz. Pensa em sistemas, sequencias e funcoes. Experimenta satisfacao genuina quando uma estrutura bem projetada permite que as pessoas realizem seu melhor trabalho. Nao sao burocratas. Sao arquitetos de ambientes onde o ministerio pode florescer. Sem pessoas que carregam esse dom, toda visao eventualmente desmorona sob o peso de seu proprio caos organizacional. Fundamentacao biblica: 1 Corintios 12:28, Neemias 1-6, Atos 6:1-7.",
      bodyEN: "In 1 Corinthians 12:28, the gift of administration comes from the Greek word kubernetes, which literally means to steer a ship. The administrator is the helmsman: the one who holds the course when the sea becomes difficult. Nehemiah is the biblical model. When he heard the walls of Jerusalem were broken down, he prayed, then made a plan. He assessed the problem, presented it to the king, secured resources, assigned every family to their own section of wall, monitored progress, dealt with opposition from outside, resolved internal conflict, and brought the walls of Jerusalem back standing in fifty-two days (Nehemiah 6:15). Someone with the Administration gifting naturally sees how the pieces of a complex situation could fit together more effectively. They think in systems, sequences, and roles. They experience genuine satisfaction when a well-designed structure allows people to do their best work. They are not bureaucrats. They are architects of environments where ministry can thrive. Without people who carry this gift, every vision eventually collapses under the weight of its own organizational chaos. Biblically grounded in: 1 Corinthians 12:28, Nehemiah 1-6, Acts 6:1-7.",
      footnote: "1. Adaptado de O Chamado e os Dons Ministeriais, Drummond Lacerda e Braulio Brandao, Editora Comunicacao Lagoinha, 2014. Capitulo 8.",
    },
    {
      id: "technical-arts",
      anchorId: "technical-arts",
      labelPT: "Artes Tecnicas",
      labelEN: "Technical Arts",
      summaryPT: "Dom para dominar sistemas e habilidades tecnicas que tornam a presenca e a missao da igreja possiveis.",
      summaryEN: "Gifting for mastering systems and technical skills that make the church's presence and mission possible.",
      bodyPT: "Quando Deus comissionou a construcao do Tabernaculo, chamou Bezalel pelo nome e disse: \"Enchi-o do Espirito de Deus, com habilidade, inteligencia, conhecimento e toda sorte de artesanato\" (Exodo 31:3). A mesma linguagem usada para uncao profetica foi usada aqui para artesanato. Entao Deus designou Ooliaabe para trabalhar ao lado dele, dando-lhe habilidades diferentes mas complementares, e reuniu em torno deles toda uma equipe de artesaos, cada um dotado pelo Espirito para sua contribuicao especifica, porque o trabalho era grande demais e variado demais para qualquer tipo de pessoa sozinha. A beleza e a precisao do que construiram tornaram a presenca de Deus tangivel para um povo aprendendo a estar perto d'Ele. Alguem com o dom de Artes Tecnicas encontra satisfacao profunda em dominar como sistemas complexos funcionam. Pode servir em som, video, iluminacao, software, construcao ou qualquer campo tecnico que apoie o ministerio. Mantem padroes elevados, percebe o que nao esta funcionando antes que outros notem e tem um orgulho real e genuino na qualidade do que produz. Quando o microfone funciona, quando a transmissao e limpa, quando o palco esta bem preparado, isso e ato de adoracao. Fundamentacao biblica: Exodo 31:1-6, 35:30-35, Romanos 12:6-8.",
      bodyEN: "When God commissioned the building of the Tabernacle, He called Bezalel by name and said: \"I have filled him with the Spirit of God, with ability and intelligence, with knowledge and all craftsmanship\" (Exodus 31:3). The same language used for prophetic anointing was used here for craftsmanship. Then God appointed Oholiab to work alongside him, giving him different but complementary skills, and gathered around them a whole team of artisans, each Spirit-gifted for their specific contribution, because the work was too large and too varied for any one type of person. The beauty and precision of what they built made the presence of God tangible to a people learning how to be near Him. Someone with the Technical Arts gifting finds deep satisfaction in mastering how complex systems work. They may serve in sound, video, lighting, software, construction, or any technical field that supports ministry. They hold themselves to high standards, notice what is not working before others do, and take real pride in the quality of what they produce. When the microphone works, when the stream is clean, when the stage is set well, that is their act of worship. Biblically grounded in: Exodus 31:1-6, 35:30-35, Romans 12:6-8.",
    },
    {
      id: "influence-and-servant-leadership",
      anchorId: "influence-and-servant-leadership",
      labelPT: "Influencia e Lideranca Servidora",
      labelEN: "Influence and Servant Leadership",
      summaryPT: "Dom para influenciar e liderar outros de dentro de um coracao genuinamente voltado para o servico e o desenvolvimento das pessoas.",
      summaryEN: "Gifting for influencing and leading others from a heart genuinely oriented toward service and the development of people.",
      bodyPT: "Pedro era um dos lideres mais naturalmente dotados do Novo Testamento e tambem um dos mais obviamente despreparados para isso. Declarou que nunca negaria Jesus e o negou tres vezes antes do amanhecer. Era ousado, impulsivo, profundamente comprometido e frequentemente errado de formas embaracosas e publicas. Nao era refinado. Nao era cuidadoso. Nao estava, por nenhuma avaliacao razoavel, preparado para a responsabilidade que lhe foi dada. Apos a ressurreicao, Jesus nao deu uma palestra a Pedro. Nao revisou os fracassos. Perguntou-lhe tres vezes: \"Voce me ama?\" E tres vezes o mandato se seguiu: \"Apascenta as minhas ovelhas\" (Joao 21:15-17). A lideranca no Reino esta enraizada nao na competencia ou na confianca, mas no amor pelas pessoas a ela confiadas. O dom precede a prontidao. A prontidao e desenvolvida atraves de ser pastoreado, falhar, ser restaurado e ser enviado novamente. Alguem com o dom de Influencia e Lideranca Servidora tem uma atracao natural pela responsabilidade por outros. Pensa em como ajudar as pessoas a crescer, em como mover um grupo em direcao a um objetivo compartilhado, em como organizar o esforco para que todos contribuam. As pessoas naturalmente olham para essa pessoa quando e preciso direcao. O que distingue esse dom da mera ambicao e a sua orientacao. Essa pessoa e mais energizada nao quando esta no comando, mas quando as pessoas ao redor estao florescendo. Fundamentacao biblica: Joao 21:15-17, Efesios 4:11-12, Marcos 10:42-45, Atos 2:14.",
      bodyEN: "Peter was one of the most naturally gifted leaders in the New Testament, and also one of the most obviously unready for it. He declared he would never deny Jesus, and denied Him three times before morning. He was bold, impulsive, deeply committed, and frequently wrong in ways that were embarrassing and public. He was not polished. He was not careful. He was not, by any reasonable assessment, prepared for the responsibility he was given. After the resurrection, Jesus did not give Peter a lecture. He did not review the failures. He asked him three times: \"Do you love me?\" And three times the commission followed: \"Feed my sheep\" (John 21:15-17). Leadership in the Kingdom is rooted not in competence or confidence but in love for the people entrusted to you. The gifting precedes the readiness. The readiness is developed through being shepherded, failing, being restored, and being sent again. Someone with the Influence and Servant Leadership gifting has a natural pull toward responsibility for others. They think about how to help people grow, how to move a group toward a shared goal, how to organize effort so everyone contributes. People naturally look to them when direction is needed. What distinguishes this gift from mere ambition is its orientation. They are most energized not when they are in charge but when the people around them are thriving. Biblically grounded in: John 21:15-17, Ephesians 4:11-12, Mark 10:42-45, Acts 2:14.",
    },
    {
      id: "creativity",
      anchorId: "creativity",
      labelPT: "Criatividade",
      labelEN: "Creativity",
      summaryPT: "Dom para imaginar o que ainda nao existe e traz-lo a existencia em servico ao reino de Deus.",
      summaryEN: "Gifting for imagining what does not yet exist and bringing it into being in service of God's kingdom.",
      bodyPT: "O primeiro ato de Deus na Escritura e um ato de criacao, trazendo forma do caos, preenchendo o que estava vazio, nomeando o que nao tinha nome (Genesis 1:1-2). A criatividade humana, em sua raiz, e participacao na natureza do Deus que faz. Quando Deus comissionou o Tabernaculo, encheu Bezalel e Ooliaabe do Espirito especificamente para o trabalho criativo e artistico, e seus dons complementares juntos produziram algo que nenhum deles poderia ter construido sozinho. Havia uma amplitude impressionante de dom entre os dois que lhes permitia liderar cada aspecto do artesanato necessario. Alguem com o dom de Criatividade aborda problemas, espacos e comunicacoes de forma diferente. Ve possibilidades onde outros veem limitacoes. Gera ideias naturalmente e consistentemente. Nao consegue desligar isso. Sua contribuicao para uma equipe ministerial muitas vezes e a percepcao que mais ninguem tinha, a abordagem que ninguem mais considerou, a solucao que veio de um angulo completamente inesperado. Precisa de ambientes que lhe dem espaco para pensar e a seguranca relacional para propor ideias que podem nao fazer sentido para todos imediatamente. Fundamentacao biblica: Genesis 1, Exodo 31:1-6, Salmo 33:3, Salmo 96:1.",
      bodyEN: "God's first act in Scripture is an act of creative making, bringing form out of formlessness, filling what was void, naming what had no name (Genesis 1:1-2). Human creativity, at its root, is participation in the nature of the God who makes. When God commissioned the Tabernacle, He filled Bezalel and Oholiab with the Spirit specifically for creative and artistic work, and their complementary gifts together produced something neither could have built alone. There was an amazing breadth of gifting between the two of them that enabled them to lead each aspect of craftsmanship required. Someone with the Creativity gifting approaches problems, spaces, and communications differently. They see possibilities where others see limitations. They generate ideas naturally and consistently. They cannot turn it off. Their contribution to a ministry team is often the insight no one else had, the approach no one else considered, the solution that came from a completely unexpected angle. They need environments that give them room to think and the relational safety to propose ideas that might not immediately make sense to everyone. Biblically grounded in: Genesis 1, Exodus 31:1-6, Psalm 33:3, Psalm 96:1.",
    },
    {
      id: "discernment-and-prophetic",
      anchorId: "discernment-and-prophetic",
      labelPT: "Discernimento e Profetico",
      labelEN: "Discernment and Prophetic",
      summaryPT: "Dom para ouvir a voz de Deus com clareza e transmitir o que O Espirito Santo diz para edificacao, exortacao e consolacao.",
      summaryEN: "Gifting for hearing God's voice clearly and transmitting what the Holy Spirit says for building up, exhortation, and comfort.",
      bodyPT: "Lacerda e Brandao descrevem o profeta com esta imagem: um microfone nao tem nada para amplificar a menos que alguem esteja falando nele. O profeta existe apenas para carregar a voz d'Aquele que fala. Um profeta que para de se aquietar diante de Deus simplesmente nao tem nada a dizer. Alguem com o dom de Discernimento e Profetico tem uma sensibilidade elevada para a dimensao espiritual de situacoes e pessoas. Pode sentir o que esta acontecendo por baixo da superficie, receber impressoes ou conviccoes que se mostram precisas, ou carregar um fardo em oracao por alguem cuja situacao nao poderia conhecer naturalmente. Seu dom nao e para autoridade pessoal. E para a edificacao, a exortacao e o consolo do Corpo (1 Corintios 14:3). Opera sob cobertura pastoral e e expresso com humildade, nao como plataforma. Esse dom em sua congregacao e um presente para toda a equipe pastoral. Sao as pessoas que oram para que as coisas acontecam antes que alguem anuncie a necessidade. Proteja-as. Pastorei-as cuidadosamente. Uma pessoa profetica sem boa cobertura pastoral e ao mesmo tempo mais vulneravel e menos eficaz. Fundamentacao biblica: 1 Corintios 12:10, 14:1-3, Atos 13:1, 1 Samuel 10:5-6, 2 Pedro 1:21.",
      bodyEN: "Lacerda and Brandao describe the prophet with this image: a microphone has nothing to amplify unless someone is speaking into it. The prophet exists only to carry the voice of the One who speaks. A prophet who stops quieting himself before God simply has nothing to say. Someone with the Discernment and Prophetic gifting has a heightened sensitivity to the spiritual dimension of situations and people. They may sense what is happening beneath the surface, receive impressions or convictions that prove accurate, or carry a burden in prayer for someone whose situation they could not naturally know. Their gift is not for personal authority. It is for the building up, exhortation, and comfort of the Body (1 Corinthians 14:3). It operates under pastoral covering and is expressed with humility, not as a platform. This gifting in your congregation is a gift to your entire pastoral team. These are the people praying for things to happen before anyone announces the need. Protect them. Shepherd them carefully. A prophetic person without good pastoral covering is both more vulnerable and less effective. Biblically grounded in: 1 Corinthians 12:10, 14:1-3, Acts 13:1, 1 Samuel 10:5-6, 2 Peter 1:21.",
      footnote: "1. Adaptado de O Chamado e os Dons Ministeriais, Drummond Lacerda e Braulio Brandao, Editora Comunicacao Lagoinha, 2014. Capitulo 5.",
    },
  ],
  discProfiles: [
    {
      id: "executor",
      anchorId: "executor",
      labelPT: "Executor",
      labelEN: "Executor (D)",
      summaryPT: "Orientado para resultados, decisivo e direto. Lidera com energia e toma iniciativa.",
      summaryEN: "Results-oriented, decisive, and direct. Leads with energy and takes initiative.",
      brazilPT: "O Executor e orientado para resultados, direto e decisivo. E a pessoa que faz as coisas avancarem, assume o comando quando decisoes precisam ser tomadas e nao foge dos desafios. No contexto brasileiro, o Executor lidera com energia e determinacao, mas tipicamente expressa isso atraves de autoridade relacional em vez de confrontacao direta. Sao competitivos e orientados para metas, mas sua diretividade geralmente e suavizada por calor e respeito relacionalmente incorporado. Em um contexto de igreja brasileira, o Executor e a pessoa que organiza o evento enquanto todos os outros ainda estao discutindo. Se apresenta naturalmente em momentos de ambiguidade e cria movimento onde havia estagnacao. Na comunidade tendem a tomar iniciativa sem ser solicitados, se sentir frustrados quando decisoes emperram ou reunioes nao produzem acao, comunicar com clareza e esperar o mesmo em troca, preferir resultados a processos prolongados e liderar pelo exemplo e energia mais do que pelo titulo formal. Executores brasileiros raramente desafiam abertamente um pastor ou figura de autoridade diretamente, raramente expressam frustracao bruscamente a colegas e raramente priorizam velocidade em detrimento do relacionamento. O que precisam da lideranca: propriedade clara, responsabilidade significativa e liberdade para executar. Prosperam quando sao confiados e estagnham quando sao microgerenciados. Nota importante: pesquisas sobre dados brasileiros de DISC mostram consistentemente que o Executor e um dos perfis menos comuns nacionalmente. Quando voce ve esse perfil, reconheca-o como uma forca significativa. Essa pessoa tem um dom para mobilizacao.",
      usaPT: "Pessoas com o estilo americano D sao diretas, determinadas e orientadas para resultados. Agem de forma assertiva, tomam decisoes rapidas e falam com franqueza. Sao pessoas de vontade forte e competitivas, orientadas para a acao, que se esforcan para ter sucesso e genuinamente apreciam um bom desafio. O estilo americano D e moldado por um ambiente cultural que recompensa a diretividade, celebra a realizacao individual e trata o desacordo saudavel como produtivo. Como se comunicam: vao direto ao ponto imediatamente. Nao gastam tempo construindo contexto relacional antes de uma conversa. Dizem o que pensam, esperam o mesmo de voce e consideram isso respeitoso. O silencio ou comunicacao indireta lhes parece esquiva. Como lidam com conflitos: estao confortaveis com isso. Um desacordo direto nao parece uma ameaca ao relacionamento para um D americano. Parece honestidade. Podem ate confiar mais em alguem apos um bom debate porque mostrou que a outra pessoa estava disposta a se engajar. Exemplos reais em contexto de igreja: em uma reuniao de equipe, falam primeiro, declaram sua posicao claramente e pressionam por uma decisao antes que a reuniao termine. Quando um processo e ineficiente, dirao isso diretamente, as vezes sem suavizar a entrega. Se discordarem de uma decisao pastoral, podem dize-lo diretamente e em particular ao pastor, sem entender por que isso parece ousado ou inapropriado em outro contexto cultural.",
      culturalPT: "Esta secao e especialmente importante. Por favor, leia com atencao antes de pastorear um americano com pontuacao alta nesse perfil. A diferenca central: na cultura americana, a diretividade e um sinal de respeito e honestidade. Na cultura brasileira, a diretividade no desacordo pode ser percebida como agressao ou uma ruptura relacional. Um D americano nao esta sendo rude quando fala bruscamente. Esta se comunicando do jeito que toda a sua cultura o ensinou a se comunicar. Provavelmente nao tem ideia de que o que disse soou como um ataque. Em ambientes de equipe, um D americano frequentemente vai interromper, redirecionar conversas e empurrar o grupo para conclusoes. Na cultura americana isso e lideranca. Na cultura de igreja brasileira, pode ser lido como dominador ou desdenhoso. Os colegas brasileiros provavelmente nao dirao nada diretamente. Vao se retrair silenciosamente, e o americano nao tera ideia de que ofendeu alguem. O que essa pessoa precisa primeiro: uma conversa de ponte. Antes de coloca-la em qualquer funcao de equipe ministerial, tenha uma reuniao pessoal que cubra os valores relacionais da comunidade, por que a harmonia e ativamente protegida aqui e como canalizar seu dom de lideranca de uma forma que construa em vez de perturbar. Enquadre como equipando-os para o sucesso, nao corrigindo um problema. O dom por baixo do desafio: a decisao, iniciativa e orientacao para resultados desta pessoa sao exatamente o que uma igreja em crescimento precisa. Vao comecar coisas, terminar coisas e superar obstaculos que travarao outros. A igreja precisa de Executores. O trabalho pastoral e ajuda-los a expressar esse dom de uma forma que esta comunidade possa receber. Nota sobre dados: o perfil D/Executor representa aproximadamente 9% da populacao mundial. E genuinamente raro. Quando voce o vir, leve-o a serio como um recurso de lideranca significativo. Nota sobre as questoes: as versoes em portugues e ingles das questoes DISC nesta avaliacao diferem em pontos especificos. Isso e intencional. A comunidade de pesquisa comportamental brasileira desenvolveu estruturas culturalmente validadas para cada perfil e nossas questoes em portugues refletem esses padroes estabelecidos. As questoes em ingles refletem normas americanas de DISC validadas. Ambas as versoes medem as mesmas dimensoes comportamentais subjacentes com precisao para seus respectivos contextos culturais.",
      usaEN: "People with the American D style are direct, driven, and results-oriented. They act assertively, make quick decisions, and speak candidly. They are strong-willed and competitive, action-oriented individuals who strive for success and genuinely enjoy a challenge. The American D style is shaped by a cultural environment that rewards directness, celebrates individual achievement, and treats healthy disagreement as productive. Common characteristics include being direct, firm, results-oriented, driven, strong-willed, competitive, self-reliant, independent, ambitious, assertive, straightforward, bold, tough-minded, outspoken, and commanding. How they communicate: they get to the point immediately. They do not spend time building relational context before a conversation. They say what they think, expect you to do the same, and consider this respectful. Silence or indirect communication reads to them as avoidance. How they handle conflict: they are comfortable with it. A direct disagreement does not feel like a relationship threat to an American D. It feels like honesty. They may actually trust someone more after a good debate because it showed the other person was willing to engage. Real-life examples in a church setting: in a team meeting, they speak first, state their position clearly, and push for a decision before the meeting ends. When a process is inefficient, they will say so directly, sometimes without softening the delivery. If they disagree with a pastoral decision, they may say so directly and privately, without understanding why this feels bold or inappropriate in another cultural context.",
      culturalEN: "This section is especially important. Please read it carefully before pastoring an American who scores high in this profile. The core difference: in American culture, directness is a sign of respect and honesty. In Brazilian culture, directness in disagreement can be perceived as aggression or a relational rupture. An American D is not being rude when they speak bluntly. They are communicating the way their entire culture taught them to communicate. They likely have no idea that what they said landed as an attack. In team settings, an American D will often interrupt, redirect conversations, and push the group toward conclusions. In American culture this is leadership. In Brazilian church culture, it may read as dominating or dismissive. The Brazilian teammates will likely not say anything directly. They will pull back quietly, and the American will have no idea they offended anyone. What this person needs first: a bridge conversation before placing them in any ministry team role. Cover the community's relational values, why harmony is actively protected here, and how to channel their leadership gift in a way that builds rather than disrupts. Frame it as equipping them for success, not correcting a problem. The gift underneath the challenge: this person's decisiveness, initiative, and results-orientation are exactly what a growing church needs. They will start things, finish things, and push through obstacles that would stall others. The church needs Executors. The pastoral work is helping them express that gift in a way this community can receive. On data: the D/Executor profile represents approximately 9% of the worldwide population. It is genuinely rare. When you see it, take it seriously as a significant leadership resource. Note on questions: the Portuguese and English versions of the DISC questions in this assessment differ at specific points. This is intentional. The Brazilian behavioral research community has developed culturally validated frameworks for each profile and our Portuguese questions reflect those established standards. The English questions reflect validated American DISC norms. Both versions measure the same underlying behavioral dimensions accurately for their respective cultural contexts.",
    },
    {
      id: "comunicador",
      anchorId: "comunicador",
      labelPT: "Comunicador",
      labelEN: "Comunicador (I)",
      summaryPT: "Expressivo, entusiasmado e relacional. Lidera por meio de conexao e visao.",
      summaryEN: "Expressive, enthusiastic, and relational. Leads through connection and vision.",
      brazilPT: "Pesquisas mostram consistentemente que o Comunicador e o perfil mais comum entre os brasileiros, aparecendo acima de todos os outros perfis em todas as areas estudadas. Isso e explicado pelo estilo de lideranca dominante mas informal tipico da cultura brasileira. Em termos praticos, voce vera muitos resultados de Comunicador em sua congregacao. Isso nao e um erro de dados. Reflete com precisao a realidade cultural. O Comunicador brasileiro e profundamente relacional, expressivo e caloroso. Lidera por conexao pessoal, historia e entusiasmo genuino. Sao os conectores naturais de sua comunidade, os que fazem as pessoas novas se sentirem bem-vindas, que mantêm a energia de uma equipe viva e que naturalmente reúnem pessoas em torno de uma visao compartilhada. Na comunidade tendem a fazer as pessoas se sentirem vistas e valorizadas rapidamente, falar sobre ideias em voz alta com outros, energizar grupos por meio de sua presenca e entusiasmo, construir redes amplas de relacionamentos significativos e inspirar outros a se envolverem. Nota importante: como o Comunicador e culturalmente dominante no Brasil, uma pessoa com pontuacao alta nesse perfil nao e necessariamente incomum. Uma pessoa com pontuacao extremamente alta nas tres questoes de Comunicador pode mostrar uma tendencia I genuinamente forte que justifica colocacao intencional em ministerio relacional em vez de equipes tecnicas ou administrativas.",
      usaPT: "O estilo americano I foca em comunicacao, entusiasmo e colaboracao, com individuos tipicamente mostrando otimismo e sociabilidade. Um I americano e energizado por grupos, atrai pessoas com animacao e visao e naturalmente se move para o centro das situacoes sociais. Processa em voz alta, pensa em relacionamentos e lidera inspirando em vez de ordenando. Caracteristicas comuns incluem ser motivado por reconhecimento social e relacionamentos, priorizar colaboracao e expressar entusiasmo, e ser descrito como convincente, magnetico, entusiasmado, caloroso, confiante e otimista. Areas de crescimento incluem impulsividade, desorganizacao e dificuldade em dar seguimento.",
      culturalPT: "O alinhamento superficial: um I americano de alto indice se sentira imediatamente confortavel em um ambiente de igreja brasileira. A expressividade, o calor, a energia comunal e a abertura relacional parecem familiares. Provavelmente tera uma otima primeira experiencia e sentira que pertence. A lacuna oculta: os Comunicadores brasileiros constroem relacionamentos por meio de consistencia ao longo do tempo. O calor e genuino, mas a confianca profunda e conquistada lentamente ao aparecer repetidamente, nao por uma conexao entusiastica. Um I americano pode confundir o calor do acolhimento inicial com a profundidade do relacionamento estabelecido e se mover para intimidade, responsabilidade ou familiaridade rapidamente demais. Orientacao pastoral: ajude essa pessoa a entender a distincao entre calor relacional e profundidade relacional nesta comunidade. Encoraje-a a investir em um pequeno numero de relacionamentos em vez de conexao ampla de superficie. Seu dom e real e necessario. Seu ritmo so precisa corresponder ao ritmo da comunidade. Nota sobre pontuacoes: se um americano pontua alto em Comunicador, observe que, embora isso se alinhe culturalmente com as normas brasileiras, a expressao pode diferir em textura. O calor de um Comunicador brasileiro e comunal e relacional em seu nucleo. O calor de um Comunicador americano pode ser socialmente expressivo e individualmente orientado. Ambos sao genuinos. Vale uma conversa pastoral.",
      usaEN: "The American I style focuses on communication, enthusiasm, and collaboration, with individuals typically showing optimism and sociability. An American I is energized by groups, draws people in through excitement and vision, and naturally moves toward the center of social situations. They process out loud, think in relationships, and lead by inspiring rather than commanding. Common characteristics include being motivated by social recognition and relationships, prioritizing collaboration and expressing enthusiasm, and being described as convincing, magnetic, enthusiastic, warm, trusting, and optimistic. Growth areas include impulsiveness, disorganization, and difficulty following through.",
      culturalEN: "The surface alignment: an American high-I will feel immediately comfortable in a Brazilian church environment. The expressiveness, warmth, communal energy, and relational openness all feel familiar. The hidden gap: Brazilian Comunicadores build relationship through consistency over time. The warmth is genuine, but deep trust is earned slowly by showing up repeatedly, not through one enthusiastic connection. An American I may mistake the warmth of initial welcome for the depth of established relationship and move into intimacy or familiarity too quickly. Pastoral guidance: help this person understand the distinction between relational warmth and relational depth in this community. Encourage them to invest in a small number of relationships rather than wide surface connection. Their gift is real and needed. Their pace just needs to match the community's rhythm. On scoring: because this community values harmony and relational warmth, and because the Comunicador profile is culturally dominant in Brazil, a high Comunicador score is expected and normal. If an American scores high in this profile, note that while it culturally aligns with Brazilian norms, the expression may differ in texture. Both are genuine. This is worth a pastoral conversation.",
    },
    {
      id: "planejador",
      anchorId: "planejador",
      labelPT: "Planejador",
      labelEN: "Planejador (S)",
      summaryPT: "Calmo, estavel e leal. Fornece consistencia e profundidade relacional ao longo do tempo.",
      summaryEN: "Calm, stable, and loyal. Provides consistency and relational depth over time.",
      brazilPT: "O Planejador e calmo, estavel e paciente, tornando-o um parceiro natural em equipes que precisam de enraizamento ao lado da iniciativa. Na cultura de igreja brasileira, o Planejador e a espinha dorsal silenciosa de cada equipe ministerial. Aparece consistentemente, serve sem precisar de reconhecimento e mantem o tecido relacional da comunidade unido ao longo do tempo. Como a cultura brasileira ja valoriza amplamente paciencia, consistencia relacional e harmonia, as tendencias naturais do Planejador se alinham estreitamente com a linha de base cultural. Os verdadeiros Planejadores nesta congregacao sao ainda mais profundamente pacientes e orientados para pessoas do que a pessoa media aqui, o que ja e muito. Na comunidade tendem a aparecer confiavelmente toda semana sem ser solicitados, construir lealdade profunda com um pequeno circulo consistente de relacionamentos, ser o ultimo a falar em ambientes de grupo mas o mais ouvido quando o faz, evitar conflitos instintivamente e trabalhar para a paz quando surge tensao e permanecer em uma funcao ministerial por anos porque lealdade importa profundamente para eles. O que precisam da lideranca: estabilidade, expectativas claras e uma equipe consistente. Nao os mova com frequencia ou coloque-os em ambientes de alto conflito sem suporte. Lhes dê uma funcao e deixe-os crescer nela ao longo do tempo.",
      usaPT: "O estilo americano S prioriza harmonia, consistencia e cuidado genuino pelas pessoas ao redor. Sao otimos ouvintes, profundamente leais e o tipo de pessoa a quem outros recorrem quando precisam se sentir compreendidos. Caracteristicas comuns incluem ser paciente, leal, confiavel, orientado para a equipe, avesso ao conflito, empatico, consistente ao longo do tempo, lento para se irritar e relutante em mudar de funcao ou ambiente uma vez estabelecido. Em contexto de igreja frequentemente serviram no mesmo ministerio por anos e nao tem desejo de mudar. Sao a pessoa que voluntarios novos ligam quando tem uma pergunta porque sempre tem uma resposta gentil e calma. Raramente se manifestam em reunioes de grupo mas tem opinioes fortes e pensativas quando perguntados diretamente. Percebem quando alguem esta lutando antes que qualquer outra pessoa perceba.",
      culturalPT: "O ajuste natural: este e o alinhamento cultural mais facil de todos os quatro perfis. Um S americano se sentira profundamente em casa na cultura de igreja brasileira. O calor comunal, o ritmo relacional paciente e os valores de harmonia em primeiro lugar ressoam naturalmente. A diferenca sutil: a cultura relacional brasileira se move ainda mais devagar do que um S americano esta acostumado, particularmente em torno de confianca profunda e propriedade ministerial compartilhada. Um S americano pode se sentir um bom encaixe rapidamente e se surpreender quando a integracao mais profunda demorar mais do que o esperado. Isso nao e rejeicao. E o ritmo estabelecido da comunidade. Orientacao pastoral: essa pessoa e um encaixe natural e um presente genuino para a congregacao. Coloque-a em uma equipe consistente com uma funcao estavel e ela servira fielmente por anos. Proteja sua necessidade de um ambiente harmonioso.",
      usaEN: "The American S style prioritizes harmony, consistency, and genuine care for the people around them. They are excellent listeners, deeply loyal, and the kind of person others go to when they need to feel understood. Common characteristics include being patient, loyal, reliable, team-oriented, conflict-averse, empathetic, consistent over time, slow to anger, and reluctant to change roles or environments once settled.",
      culturalEN: "The natural fit: this is the easiest cultural alignment of all four profiles. An American S will feel deeply at home in Brazilian church culture. The communal warmth, the patient relational pace, and the harmony-first values resonate naturally. The subtle difference: Brazilian relational culture moves even slower than an American S is accustomed to, particularly around deep trust. An American S may feel they are a good fit quickly and be surprised when deeper integration takes longer than expected. This is not rejection. It is the community's established rhythm. Pastoral guidance: this person is a natural fit and a genuine gift to the congregation. Place them in a consistent team with a stable role and they will serve faithfully for years.",
    },
    {
      id: "analista",
      anchorId: "analista",
      labelPT: "Analista",
      labelEN: "Analista (C)",
      summaryPT: "Analitico, preciso e orientado para qualidade. Garante que o trabalho seja feito corretamente.",
      summaryEN: "Analytical, precise, and quality-focused. Ensures work is done correctly.",
      brazilPT: "O Analista e o perfil menos identificado entre os brasileiros nacionalmente. Pesquisas conectam isso a padroes mais amplos de flexibilidade e informalidade na cultura brasileira. Em contexto de igreja, um Analista brasileiro frequentemente e contracultural em sua propria comunidade. Valoriza precisao, processo e qualidade em um ambiente que valoriza calor, flexibilidade e espontaneidade relacional. Nao sao frios. Se importam profundamente. Mas expressam cuidado por meio de precisao, minucia e fazer as coisas corretamente em vez de por expressividade ou entusiasmo. Sao a pessoa que percebe o erro antes que se torne um problema, que mantem os padroes tecnicos em que todos dependem e que silenciosamente carrega qualidade para toda a equipe. Nota importante: como o Analista e raro na cultura brasileira, essa pessoa pode ter passado anos se sentindo como um ponto fora da curva em ambientes relacionais. Um relacionamento pastoral que genuinamente valoriza sua precisao e a ve como um dom, nao uma excentricidade a ser suavizada, vai significar mais para ela do que quase qualquer outra coisa.",
      usaPT: "Pessoas com o estilo americano C sao analiticas, precisas e focadas em qualidade. Pensam profundamente, questionam suposicoes e garantem padroes elevados. O C americano lidera com logica, pesquisa e pensamento sistematico. Sao a pessoa que le as letras miudas, que constroi o processo e que pergunta \"o que pode dar errado?\" antes que todos os outros terminem de celebrar. Caracteristicas comuns incluem ser detalhista, analitico, focado em qualidade, orientado para processos, cuidadoso, independente, com padroes pessoais elevados, consciente de riscos, minucioso antes de agir e desconfortavel com ambiguidade.",
      culturalPT: "O desafio central: na cultura de igreja brasileira, pertencimento e participacao fluem do relacionamento primeiro. Um C americano lidera com competencia e processo. Vai naturalmente tentar ganhar seu lugar fazendo um trabalho excelente, melhorando sistemas e resolvendo problemas tecnicos. Mas nesta comunidade, fazer um trabalho excelente sem primeiro construir credibilidade relacional pode passar despercebido ou parecer frio e transacional para os outros. Uma cautela especifica: um C americano que identifica problemas em sistemas ministeriais e oferece solucoes frequentemente estara completamente certo. Mas se oferecer essas observacoes antes de ter construido suficiente credibilidade relacional na comunidade, sera educadamente ouvido e silenciosamente desconsiderado. Na cultura brasileira, o direito de oferecer critica e conquistado por meio do pertencimento, nao estabelecido pela expertise. Orientacao pastoral: ajude essa pessoa a entender que seus dons tecnicos sao genuinamente valorizados aqui, mas que os relacionamentos vem primeiro nesta comunidade. Invista tempo em um relacionamento pastoral pessoal com ela. Conecte-a com uma ou duas pessoas na equipe antes de implantar suas habilidades.",
      usaEN: "People with the American C style are analytical, precise, and quality-focused. They think deeply, question assumptions, and ensure high standards. The American C leads with logic, research, and systematic thinking. They are the person who reads the fine print, who builds the process, and who asks \"what could go wrong?\" before everyone else has finished celebrating. Common characteristics include being detail-oriented, analytical, quality-focused, process-driven, cautious, independent, risk-aware, thorough before acting, high in personal standards, and uncomfortable with ambiguity.",
      culturalEN: "The core challenge: in Brazilian church culture, belonging and participation flow from relationship first. An American C leads with competence and process. They will naturally try to earn their place by doing excellent work, improving systems, and solving technical problems. But in this community, doing excellent work without first building relational credibility may go unnoticed or feel cold and transactional. A specific caution: an American C who identifies problems in ministry systems and offers solutions will often be entirely correct. But if they offer those observations before they have built sufficient relational standing in the community, they will be politely heard and quietly disregarded. In Brazilian culture, the right to offer critique is earned through belonging, not established by expertise. Pastoral guidance: help this person understand that their technical gifts are genuinely valued here, but that relationships come first in this community. Invest time in a personal pastoral relationship with them. Connect them with one or two people on the team before deploying their skills.",
    },
  ],
  naturalStrengths: [
    {
      id: "mobilizador",
      anchorId: "mobilizador",
      labelPT: "Mobilizador",
      labelEN: "Mobilizer",
      summaryPT: "Toma iniciativa naturalmente, faz as coisas avancarem e transforma visao em acao.",
      summaryEN: "Naturally takes initiative, moves things forward, and turns vision into action.",
      bodyPT: "O Mobilizador e a pessoa que naturalmente inicia, faz as coisas avancarem e transforma visao em acao. Nao espera permissao. Identifica o que precisa acontecer e cria momento. Em qualquer equipe, sao os que impedem que boas ideias morram no planejamento. Sua forca e a lacuna entre intencao e execucao. Esse e o ponto onde eles vivem.",
      bodyEN: "The Mobilizer is the person who naturally initiates, moves things forward, and turns vision into action. They do not wait for permission. They identify what needs to happen and create momentum. In any team, they are the ones who prevent good ideas from dying in planning. Their strength is the gap between intention and execution. That is where they live.",
    },
    {
      id: "conector",
      anchorId: "conector",
      labelPT: "Conector",
      labelEN: "Connector",
      summaryPT: "Constroi pontes entre pessoas, cria pertencimento e gera entusiasmo pelo proposito compartilhado.",
      summaryEN: "Builds bridges between people, creates belonging, and generates enthusiasm for shared purpose.",
      bodyPT: "O Conector e a pessoa que naturalmente constroi pontes entre pessoas, cria pertencimento e gera entusiasmo pelo proposito compartilhado. Transforma estranhos em membros de equipe e membros de equipe em comunidade. Em qualquer equipe, sao os que fazem as pessoas sentirem que o trabalho importa e que elas importam dentro dele. Sua forca e a infraestrutura humana que mantem tudo unido.",
      bodyEN: "The Connector is the person who naturally builds bridges between people, creates belonging, and generates enthusiasm for shared purpose. They turn strangers into teammates and teammates into community. In any team, they are the ones who make people feel the work matters and that they matter within it. Their strength is the human infrastructure that holds everything together.",
    },
    {
      id: "sustentador",
      anchorId: "sustentador",
      labelPT: "Sustentador",
      labelEN: "Sustainer",
      summaryPT: "Fornece consistencia, lealdade e estabilidade relacional ao longo do tempo quando o entusiasmo diminui.",
      summaryEN: "Provides consistency, loyalty, and relational stability over time when enthusiasm fades.",
      bodyPT: "O Sustentador e a pessoa que naturalmente fornece consistencia, lealdade e estabilidade relacional ao longo do tempo. E a razao pela qual as equipes nao desmoronam quando as coisas ficam dificeis. Aparece quando o entusiasmo se foi, carrega as pessoas pelos periodos dificeis e mantem a memoria institucional que nenhum sistema pode substituir. Sua forca e a fidelidade de longo prazo que torna tudo mais confiavel.",
      bodyEN: "The Sustainer is the person who naturally provides consistency, loyalty, and relational stability over time. They are the reason teams do not fall apart when things get hard. They show up when the enthusiasm has faded, they carry people through seasons of difficulty, and they hold institutional memory that no system can replace. Their strength is the long-term faithfulness that makes everything else trustworthy.",
    },
    {
      id: "arquiteto",
      anchorId: "arquiteto",
      labelPT: "Arquiteto",
      labelEN: "Architect",
      summaryPT: "Ve o que esta faltando, o que pode dar errado e como construir algo que se mantera ao longo do tempo.",
      summaryEN: "Sees what is missing, what could go wrong, and how to build something that will hold up over time.",
      bodyPT: "O Arquiteto e a pessoa que naturalmente ve o que esta faltando, o que pode dar errado e como construir algo que se mantera ao longo do tempo. Traz qualidade, precisao e pensamento estrutural a tudo que toca. Em qualquer equipe, sao os que detectam o erro antes que se torne uma crise e constroem os sistemas que dao a todos os outros uma base a partir da qual trabalhar. Sua forca e o andaime invisivel que torna a excelencia possivel.",
      bodyEN: "The Architect is the person who naturally sees what is missing, what could go wrong, and how to build something that will hold up over time. They bring quality, precision, and structural thinking to everything they touch. In any team, they are the ones who catch the mistake before it becomes a crisis and build the systems that give everyone else a foundation to work from. Their strength is the invisible scaffolding that makes excellence possible.",
    },
  ],
  leadershipTendencies: [
    {
      id: "lider-visionario",
      anchorId: "lider-visionario",
      labelPT: "Lider Visionario",
      labelEN: "Visionary Leader",
      summaryPT: "Lanca direcao, mobiliza pessoas em torno de um objetivo e lidera a partir da frente.",
      summaryEN: "Casts direction, mobilizes people around a goal, and leads from the front.",
      bodyPT: "Paulo escreveu aos Romanos, uma igreja que nunca havia visitado, com uma visao totalmente formada de como o Evangelho chegaria a Espanha por meio de sua parceria. Ele nao estava gerenciando o que existia. Ja estava vendo o que ainda nao existia e construindo o caminho para isso. Esse e o Lider Visionario. Carregam uma imagem do que poderia ser e se movem em direcao a ela com convicca suficiente para que outros os sigam, nao porque tem que seguir, mas porque querem fazer parte do destino para onde essa pessoa esta indo. Maxwell observou que os mais altos niveis de lideranca sao alcancados nao por posicao, mas por resultados provados seguidos de investimento nas pessoas ao redor. O Lider Visionario alcancou resultados. O convite pastoral para essa pessoa e move-la de produzir resultados para desenvolver as pessoas por meio de quem a visao os sobrevivera. \"O valor duradouro de um lider e medido pela sucessao\", escreveu Maxwell. O que essa pessoa constroi deve ainda estar de pe quando ela nao estiver mais na frente. Essa pessoa naturalmente lanca direcao e reune pessoas em torno de um objetivo. Lidera a partir da frente. E mais eficaz quando tem uma missao clara e liberdade para persegui-la e mais frustrado quando colocado em funcoes de manutencao sem espaco para construir mais. Nota pastoral: essa pessoa precisa de uma visao significativa para carregar ou encontrara uma por conta propria, que pode ou nao se alinhar com a direcao da igreja. Invista cedo em um relacionamento que canaliza sua tendencia para a frente em direcao a casa. Conecte-a operacionalmente com alguem com o dom de Administracao ou a forca de Sustentador que possa lidar com os detalhes que sua visao gera. Fundamentacao biblica: Romanos 15:20-24, a visao missionaria de Paulo. Atos 16:6-10, o chamado macedonio.",
      bodyEN: "Paul wrote to the Romans, a church he had never visited, with a fully formed vision for how the Gospel would reach Spain through their partnership. He was not managing what existed. He was already seeing what did not yet exist and building the road toward it. That is the Visionary Leader. They carry a picture of what could be and they move toward it with enough conviction that others follow, not because they have to, but because they want to be part of where this person is going. Maxwell observed that the highest levels of leadership are reached not through position but through proven results followed by investment in the people around you. The Visionary Leader has earned results. The pastoral invitation for this person is to move them from producing outcomes toward developing the people through whom the vision will outlast them. \"A leader's lasting value is measured by succession.\" What this person builds should still be standing when they are no longer standing in front of it. This person naturally casts direction and rallies people around a goal. They lead from the front. They are most effective when they have a clear mission and freedom to pursue it, and most frustrated when placed in maintenance roles with no room to build further. Pastoral note: this person needs meaningful vision to carry or they will find one on their own, which may or may not align with the church's direction. Invest early in a relationship that channels their forward pull toward the house. Connect them operationally with someone whose Administration gifting or Sustainer strength can handle the details their vision generates. Biblically grounded in: Romans 15:20-24, Acts 16:6-10.",
    },
    {
      id: "lider-relacional",
      anchorId: "lider-relacional",
      labelPT: "Lider Relacional",
      labelEN: "Relational Leader",
      summaryPT: "Lidera por meio do relacionamento, confianca e investimento pessoal nas pessoas ao redor.",
      summaryEN: "Leads through relationship, trust, and personal investment in the people around them.",
      bodyPT: "Barnabe foi a Antioquia, viu a graca de Deus e ficou feliz. Entao foi e encontrou Paulo porque o trabalho era maior do que o que podia carregar sozinho. Ele nao recrutou Paulo porque Paulo era util. Foi encontra-lo porque genuinamente acreditava nele quando todos os outros estavam com medo dele. Liderou por meio do relacionamento e sustentou esse relacionamento por meio de investimento pessoal ao longo de anos e distancias. As pessoas seguiram Barnabe porque confiavam nele, e confiavam nele porque ele havia provado que iria por elas pessoalmente. Maxwell ensinou que lideres que ficam no nivel relacional sem desenvolver outros eventualmente se tornam um teto para sua equipe em vez de um catalisador. A borda de crescimento pastoral para essa pessoa e ajuda-la a ver que o amor que tem pelas pessoas e mais plenamente expresso quando comeca a desenvolver essas pessoas em lideres elas mesmas. Essa pessoa lidera investindo nas pessoas pessoalmente. Sua equipe a segue porque se sente conhecida e cuidada. E mais eficaz em contextos ministeriais sustentados onde relacionamentos de longo prazo podem se desenvolver e mais tensionada em ambientes de alto ritmo e implantacao rapida onde nao ha tempo para construir confianca primeiro. Nota pastoral: a influencia de lideranca dessa pessoa pode ser maior do que seu titulo sugere porque opera por meio do relacionamento em vez da posicao. Nao a subestime porque e quieta sobre isso. Proteja sua saude cuidadosamente, porque quando essa pessoa esta esgotada toda a rede relacional ao redor dela sente sem conseguir nomear a fonte. Fundamentacao biblica: Atos 11:22-26, Barnabe em Antioquia. Atos 9:26-27, Barnabe garantindo Paulo.",
      bodyEN: "Barnabas went to Antioch, saw the grace of God, and was glad. Then he went and found Paul because the work was bigger than what he could carry alone. He did not recruit Paul because Paul was useful. He went and found him because he genuinely believed in him when everyone else was afraid of him. He led through relationship and sustained that relationship through personal investment across years and miles. People followed Barnabas because they trusted him, and they trusted him because he had proven he would go to bat for them personally. Maxwell taught that leaders who stay at the relational level without developing others eventually become a ceiling on their team rather than a catalyst. The pastoral growth edge for this person is helping them see that the love they have for people is most fully expressed when they begin developing those people into leaders themselves. This person leads by investing in people personally. Their team follows them because they feel known and cared for. They are most effective in sustained ministry contexts where long-term relationships can develop and most strained in high-pressure, rapid-deployment environments where there is no time to build trust first. Pastoral note: this person's leadership influence may be larger than their title suggests because it operates through relationship rather than position. Do not underestimate them because they are quiet about it. Protect their health carefully, because when this person is depleted the entire relational web around them feels it without anyone being able to name the source. Biblically grounded in: Acts 11:22-26, Acts 9:26-27.",
    },
    {
      id: "lider-estrutural",
      anchorId: "lider-estrutural",
      labelPT: "Lider Estrutural",
      labelEN: "Structural Leader",
      summaryPT: "Lidera construindo sistemas e estruturas que permitem que outros realizem seu melhor trabalho.",
      summaryEN: "Leads by building systems and structures that allow others to do their best work.",
      bodyPT: "Neemias nao chegou a Jerusalem e comecou a inspirar as pessoas sobre como as muralhas poderiam ser grandes. Chegou, avaliou a situacao silenciosamente por tres dias, desenvolveu um plano especifico, designou cada familia a sua propria secao da muralha e gerenciou o projeto atraves da oposicao, conflito interno e escassez de suprimentos ate que o trabalho fosse concluido em cinquenta e dois dias. Liderou pela estrutura. A visao era clara, o plano estava documentado e todos sabiam exatamente pelo que eram responsaveis. Maxwell ensinou que no nivel de Producao, lideres ganham admiracao e confianca por meio de realizacoes e resultados tangiveis, fomentando um ambiente eficiente que impulsiona o crescimento coletivo. O Lider Estrutural faz exatamente isso. Sua contribuicao frequentemente e invisivel precisamente porque esta funcionando. Quando os sistemas funcionam bem, ninguem percebe quem os construiu. Quando falham, todos percebem imediatamente. Essa pessoa lidera construindo estruturas que permitem que outros realizem seu melhor trabalho. Pode nao ser a presenca mais visivelmente inspiradora em uma sala, mas frequentemente e a razao pela qual as coisas realmente funcionam. E mais eficaz quando recebe autoridade genuina sobre uma area definida e mais frustrado quando constroi sistemas que outros ignoram ou contornam. Nota pastoral: essa pessoa e frequentemente subvalorizada em culturas de igreja que celebram a lideranca expressiva ou relacional. Reconheca o trabalho dela especifica e regularmente. Lhe dê autoridade real em seu dominio, nao apenas responsabilidade. Fundamentacao biblica: Neemias 2:11-18, Neemias 3.",
      bodyEN: "Nehemiah did not arrive in Jerusalem and begin inspiring people about how great the walls could be. He arrived, assessed the situation quietly for three days, developed a specific plan, assigned every family to their own section of wall, and managed the project through opposition, internal conflict, and supply shortages until the work was complete in fifty-two days. He led through structure. The vision was clear, the plan was documented, and everyone knew exactly what they were responsible for. Maxwell taught that at the Production level, leaders gain admiration and trust through tangible accomplishments and results, fostering an efficient environment that drives collective growth. The Structural Leader does precisely this. Their contribution is often invisible because it is working. When systems function well, no one notices who built them. When systems fail, everyone notices immediately. This person leads by building structures that allow others to do their best work. They may not be the most visibly inspiring presence in a room, but they are often the reason things actually work. They are most effective when given genuine authority over a defined area and most frustrated when they build systems that others ignore or work around. Pastoral note: this person is frequently undervalued in church cultures that celebrate expressive or relational leadership. Acknowledge their work specifically and regularly. Give them real authority in their domain, not just responsibility. Biblically grounded in: Nehemiah 2:11-18, Nehemiah 3.",
    },
    {
      id: "influenciador-de-suporte",
      anchorId: "influenciador-de-suporte",
      labelPT: "Influenciador de Suporte",
      labelEN: "Supporting Influencer",
      summaryPT: "Nao tem lideranca formal, mas molda a cultura de cada equipe da qual faz parte por meio de presenca e cuidado.",
      summaryEN: "Holds no formal leadership but shapes the culture of every team they are part of through presence and care.",
      bodyPT: "Maxwell foi claro: influencia e a verdadeira medida de lideranca, nada mais e nada menos. Posicao nao faz um lider. Uma pessoa pode ter um titulo e nenhuma influencia real, enquanto outra nao tem titulo e molda a cultura de cada sala que entra. O Influenciador de Suporte e a segunda pessoa. Ganhou influencia genuina por meio de presenca, fidelidade e o tipo de atencao que faz as pessoas se sentirem genuinamente vistas. Quando a igreja primitiva em Jerusalem estava lutando com a distribuicao de alimentos para as viuvas, foi a comunidade, nao os apostolos, que identificou o problema e o trouxe adiante. As pessoas que estavam perto o suficiente para ver e se importavam o suficiente com os afetados para falar. Essas pessoas carregavam influencia nao por titulo, mas por sua proximidade com a necessidade e a confianca que outros depositavam em sua percepcao do que estava acontecendo. Essa pessoa nao e um lider formal e nao precisa ser. Mas molda a cultura de cada equipe da qual faz parte. Quando ela esta florescendo, as equipes ao seu redor sao saudaveis. Quando esta lutando, esse sinal se espalha sem que ninguem consiga nomear a fonte. Nota pastoral: a influencia dessa pessoa opera abaixo do organograma, o que significa que e facil de ignorar ate que algo dea errado. Invista nessa pessoa proativamente. Maxwell observou que as pessoas que carregam influencia informal em uma organizacao frequentemente determinam a cultura real mais do que as pessoas com autoridade formal. Um Influenciador de Suporte que e bem pastoreado multiplica saude. Um que se sente invisivel ou desvalorizado pode inadvertidamente se tornar uma fonte de unidade silenciosa sem nunca ter intencao de ser. Fundamentacao biblica: Atos 6:1-3, Proverbios 11:14.",
      bodyEN: "Maxwell was clear: influence is the true measure of leadership, nothing more and nothing less. Position does not make a leader. A person can hold a title and have no real influence, while another person holds no title and shapes the culture of every room they enter. The Supporting Influencer is the second person. They have earned genuine influence through presence, faithfulness, and the kind of attentiveness that makes people feel genuinely seen. When the early church in Jerusalem was struggling with the distribution of food to widows, it was the community, not the apostles, who identified the problem and brought it forward. The people who were near enough to see it and cared enough about those affected to speak up. Those people carried influence not through title but through their closeness to the need and the trust others placed in their perception of what was happening. This person is not a formal leader and does not need to be. But they shape the culture of every team they are part of. When they are thriving, teams around them are healthy. When they are struggling, that signal spreads without anyone being able to name the source. Pastoral note: this person's influence operates below the organizational chart, which means it is easy to overlook until something goes wrong. Invest in this person proactively. Maxwell observed that the people who carry informal influence in an organization often determine the actual culture more than the people with formal authority. A Supporting Influencer who is pastored well multiplies health. One who feels unseen or undervalued can inadvertently become a source of quiet disunity without ever intending to. Biblically grounded in: Acts 6:1-3, Proverbs 11:14.",
    },
  ],
  emotionalProfiles: [
    {
      id: "processador-expressivo",
      anchorId: "processador-expressivo",
      labelPT: "Processador Expressivo",
      labelEN: "Expressive Processor",
      summaryPT: "Processa dificuldades por meio de conversa, expressao e conexao relacional.",
      summaryEN: "Processes difficulty through conversation, expression, and relational connection.",
      bodyPT: "Os Salmos nao foram arquivados em particular. Foram escritos para serem cantados, compartilhados, orados juntos. Davi processou tristeza, medo, alegria, raiva e fe colocando tudo em palavras e entregando essas palavras a uma comunidade. Quando clamou \"Deus meu, Deus meu, por que me abandonaste?\", nao manteve isso entre ele e Deus. Deu a linguagem a todos que precisariam um dia pedir emprestado. Esse e o Processador Expressivo. Avanca pelas dificuldades dando-lhes linguagem, trazendo-as para o relacionamento, conversando sobre elas ate que algo internamente se assemelhe. Essa pessoa precisa de conversa para processar. Precisa ser ouvida antes de poder ser ajudada. Precisa falar sobre o que esta carregando ate que algo dentro dela se assemelhe. Quando fica quieta e para de compartilhar, algo esta errado. O silencio e um sinal de sofrimento nesse perfil. Forca sob pressao: nomeiam o que outros nao conseguem. Em uma equipe que esta lutando mas nao conversando sobre isso, essa pessoa quebra o silencio e cria o espaco para a dificuldade ser abordada. Frequentemente sao a razao pela qual uma equipe processa a adversidade juntos em vez de separados. Sombra a observar: podem processar mais publicamente do que e sempre util, buscando mais contato relacional do que sua comunidade pode sustentar em uma crise. Isso nao e manipulacao. E simplesmente como sobrevivem as dificuldades. Preste atencao a uma necessidade crescente de reasseguracao que nao resolve mesmo apos a conversa. Orientacao de linguagem pastoral: pesquisas mostram que o que um lider diz em voz alta a alguem carrega mais peso do que o proprio dialogo interno dessa pessoa. Para esse perfil, sua voz como pastor e a ancora externa para a qual essa pessoa retornara quando o proprio barulho interno ficar alto. Visite-a pessoalmente em vez de enviar uma mensagem. Sente-se com ela. Faca perguntas abertas e ouca sem ir rapidamente para solucoes. Quando falar sobre a situacao dela, fale identidade e valor diretamente e especificamente sobre ela. Ajudar alguem a substituir uma narrativa interna negativa por uma mais verdadeira e mais eficaz do que simplesmente encorajar a se sentir melhor. Para essa pessoa, ouvi-la dizer o que e verdadeiro sobre ela permanecera muito tempo apos o fim da conversa. Fundamentacao biblica: Salmo 22, o arco completo de expressao honesta ate a confianca. 1 Samuel 1:12-15, Ana derramando sua alma perante o Senhor.",
      bodyEN: "The Psalms were not filed away privately. They were written to be sung, to be shared, to be prayed together. David processed grief, fear, joy, anger, and faith by putting it into words and handing those words to a community. When he cried out \"My God, my God, why have you forsaken me?\" he did not keep it between himself and God. He gave the language to everyone who would ever need to borrow it. That is the Expressive Processor. They move through difficulty by giving it language, by bringing it into relationship, by talking through it until something inside them settles. This person needs conversation to process. They need to be heard before they can be helped. They need to talk through what they are carrying until something inside them settles. When they go quiet and stop sharing, something is wrong. Silence is a distress signal in this profile. Strength under pressure: they name what others cannot. In a team that is struggling but not talking about it, this person breaks the silence and creates the space for the difficulty to be addressed. They are often the reason a team processes hardship together rather than apart. Shadow to watch for: they may process more publicly than is always helpful, seeking more relational contact than their community can sustain in a crisis. This is not manipulation. It is simply how they survive difficulty. Watch for an escalating need for reassurance that does not resolve even after conversation. Pastoral language guidance: research shows that what a leader says out loud to someone carries more weight than that person's own internal self-talk. For this person, your voice as their pastor is the external anchor they will return to when their own internal noise gets loud. Visit them in person rather than sending a message. Sit with them. Ask open questions and listen without moving toward solutions too quickly. When you speak into their situation, speak identity and worth directly and specifically over them. Helping someone replace a negative internal narrative with a truer one is more effective than simply encouraging them to feel better. For this person, hearing you say what is true about them out loud will stay with them long after the conversation ends. Biblically grounded in: Psalm 22, 1 Samuel 1:12-15.",
    },
    {
      id: "carregador-estavel",
      anchorId: "carregador-estavel",
      labelPT: "Carregador Estavel",
      labelEN: "Steady Carrier",
      summaryPT: "Absorve o peso das pessoas ao redor silenciosamente e consistentemente sem torna-lo visivel.",
      summaryEN: "Absorbs the weight of the people around them quietly and consistently without making it visible.",
      bodyPT: "Ana, a profetisa, estava no templo dia e noite, jejuando e orando, por decadas. O texto nao nos diz o que ela estava carregando. Diz que ela estava la. O Carregador Estavel processa segurando. Absorve o peso das pessoas ao redor, as preocupacoes do ministerio, o luto da comunidade e os carrega silenciosamente e consistentemente sem tornar isso visivel. Sao as pessoas em que todos se apoiam e em quem ninguem pensa para verificar. Essa pessoa raramente pede ajuda e frequentemente e quem mais precisa dela. Nao processa por conversa como o Processador Expressivo. Processa por oracao, por quietude, por ser fiel as pequenas coisas que tem significado para ela. Precisa ser verificada especificamente e pessoalmente, nao por um convite geral que vai declinar silenciosamente. Forca sob pressao: quando tudo ao redor e incerto e instavel, essa pessoa se torna a presenca constante na qual outros se anchoram. Nao entra em panico. Nao escala. Segura, e seu segurar da aos outros permissao para continuar se movendo. Sombra a observar: se retiram lentamente e de maneiras que sao faceis de perder. Nao param de aparecer, o que e o motivo pelo qual a retirada pode passar despercebida. Preste atencao a uma diminuicao dos pequenos gestos relacionais que normalmente sao naturais para ela. Um Carregador Estavel que para de oferecer as pequenas coisas esta carregando algo pesado. Orientacao de linguagem pastoral: va ate ela em vez de esperar que venha ate voce. Como esta comunidade valoriza harmonia e expressao indireta, chegar com calor e simplesmente passar tempo com ela abrira mais do que qualquer pergunta direta abriria. Deixe sua presenca ser o sinal de que ela importa, antes que qualquer palavra seja dita. Quando falar, lide primeiro com afirmacao do que voce viu nela especificamente antes de se mover para qualquer preocupacao. Pesquisas mostram que o que uma voz confiavel diz em voz alta a alguem carrega mais peso do que o proprio dialogo interno dessa pessoa. Para essa pessoa, que processa silenciosamente e raramente busca contribuicao de outros, sua voz como pastor pode ser a unica voz externa falando para a situacao dela. Use-a com cuidado e intencao. Ajude-a a nomear o que e verdadeiro sobre quem ela e, porque quando um Carregador Estavel esta esgotado frequentemente perde o acesso a essa verdade sozinho. Fundamentacao biblica: Lucas 2:36-38, Ana, presente e fiel por decadas. Galatas 6:2, carregai os fardalos uns dos outros.",
      bodyEN: "Anna, the prophetess, was in the temple day and night, fasting and praying, for decades. The text does not tell us what she was carrying. It tells us she was there. The Steady Carrier processes by holding. They absorb the weight of the people around them, the concerns of the ministry, the grief of the community, and they carry it quietly and consistently without making it visible. They are the ones everyone leans on and no one thinks to check on. This person rarely asks for help and often needs it most. They do not process through conversation the way an Expressive Processor does. They process through prayer, through quiet, through being faithful to the small things that hold meaning for them. They need to be checked on specifically and personally, not through a general invitation that they will quietly decline. Strength under pressure: when everything around them is uncertain and unstable, this person becomes the steady presence others anchor to. They do not panic. They do not escalate. They hold, and their holding gives others permission to keep moving. Shadow to watch for: they withdraw slowly and in ways that are easy to miss. They do not stop showing up, which is why the withdrawal can go unnoticed. Watch for a decrease in the small relational gestures that are normally natural to them. A Steady Carrier who stops offering the small things is carrying something heavy. Pastoral language guidance: go to them rather than waiting for them to come to you. Because this community values harmony and indirect expression, arriving with warmth and simply spending time with them will open more than any direct question would. Let your presence be the signal that they matter, before any words are spoken. When you do speak, lead with affirmation of what you have seen in them specifically before moving anywhere near the concern. Research shows that what a trusted voice says out loud to someone carries more weight than that person's own internal self-talk. For this person, who processes quietly and rarely seeks input from others, your voice as their pastor may be the only external voice speaking into their situation. Use it carefully and with intention. Help them name what is true about who they are, because when a Steady Carrier is depleted they often lose access to that truth on their own. Biblically grounded in: Luke 2:36-38, Galatians 6:2.",
    },
    {
      id: "processador-orientado",
      anchorId: "processador-orientado",
      labelPT: "Processador Orientado",
      labelEN: "Driven Processor",
      summaryPT: "Processa dificuldades por meio de acao e resolucao de problemas. A produtividade pode mascarar a luta subjacente.",
      summaryEN: "Processes difficulty through action and problem-solving. Productivity can mask underlying struggle.",
      bodyPT: "Paulo escreveu sua carta aos Filipenses da prisao. Nela descreve contentamento aprendido por meio da experiencia, confianca na suficiencia de Cristo e gratidao por seus amigos. Nao a escreveu de um lugar de facilidade resolvida. A escreveu de um lugar de confianca ativa no meio de restricao. O Processador Orientado nao para quando as coisas ficam dificeis. Encontra uma maneira de continuar se movendo, e muitas vezes o proprio movimento e como gerencia a dificuldade. Essa pessoa processa por meio de acao e resolucao de problemas. Quando esta lutando emocionalmente, frequentemente se torna mais produtiva, nao menos. A produtividade pode mascarar a dificuldade subjacente por muito tempo. Raramente oferece informacoes emocionais voluntariamente e resiste ao cuidado pastoral que parece intrometido ou que questiona sua capacidade de lidar com as coisas. Forca sob pressao: mantêm a equipe se movendo quando outros congelam. Sua capacidade de agir sob pressao em vez de fechar da as pessoas ao redor um modelo e um momento que podem seguir. Em uma crise, essa pessoa e um recurso. Sombra a observar: o isolamento crescente e o sinal de sofrimento mais confiavel nesse perfil. Um Processador Orientado que para de colaborar, que comeca a lidar com tudo sozinho, que se torna menos disponivel relacionalmente, frequentemente esta protegendo algo dificil por baixo da atividade. A agitacao parece uma forca. Vale a pena olhar mais de perto. Orientacao de linguagem pastoral: construa confianca com essa pessoa por meio de respeitar sua competencia e autonomia antes de qualquer outra coisa. Como esta comunidade valoriza harmonia e calor relacional, e como o perfil D dessa pessoa ja a torna menos naturalmente inclinada para a vulnerabilidade, ela precisa saber que voce e por ela antes de deixa-lo entrar. Ganhe o acesso relacional ao longo do tempo em vez de pressioná-la diretamente. Pesquisas mostram que manter a linguagem neutra e focada no comportamento em vez de emocionalmente carregada e mais eficaz com esse estilo de processamento. Uma vez que a confianca esteja estabelecida, fale diretamente e especificamente. Essa pessoa responde bem a conversas honestas e tranquilas com alguem que genuinamente respeita. Ajude-a a se reconectar com a verdade de quem e por baixo da produtividade. Fundamentacao biblica: Filipenses 4:11-13, contentamento aprendido por meio da experiencia. 2 Corintios 11:23-28, Paulo catalogando dificuldades como marca do ministerio autentico.",
      bodyEN: "Paul wrote his letter to the Philippians from prison. In it he describes contentment learned through experience, confidence in the sufficiency of Christ, and gratitude for his friends. He did not write it from a place of resolved ease. He wrote it from a place of active trust in the middle of constraint. The Driven Processor does not stop when things are hard. They find a way to keep moving, and often the movement itself is how they manage the difficulty. This person processes through action and problem-solving. When they are struggling emotionally, they often become more productive, not less. The productivity can mask the underlying difficulty for a long time. They rarely volunteer emotional information and resist pastoral care that feels intrusive or that questions their capacity to handle things. Strength under pressure: they keep the team moving when others freeze. Their ability to act under pressure rather than shutting down gives the people around them a model and a momentum they can follow. In a crisis, this person is an asset. Shadow to watch for: increasing isolation is the most reliable distress signal in this profile. A Driven Processor who stops collaborating, who begins handling everything alone, who becomes less available relationally, is often protecting something difficult underneath the activity. The busyness looks like strength. It is worth looking closer. Pastoral language guidance: build trust with this person through respecting their competence and autonomy before anything else. Because this community values harmony and relational warmth, and because this person's D profile already makes them less naturally inclined toward vulnerability, they need to know you are for them before they will let you in. Earn the relational access over time rather than pressing for it directly. Research shows that keeping language neutral and behavior-focused rather than emotionally charged is more effective with this processing style. Once trust is established, speak directly and specifically. This person responds well to honest, unhurried conversation with someone they genuinely respect. Help them reconnect with the truth of who they are beneath the productivity. Biblically grounded in: Philippians 4:11-13, 2 Corinthians 11:23-28.",
    },
    {
      id: "processador-analitico",
      anchorId: "processador-analitico",
      labelPT: "Processador Analitico",
      labelEN: "Analytical Processor",
      summaryPT: "Processa dificuldades analisando-as. Precisa entender antes que o peso emocional possa se assentar.",
      summaryEN: "Processes difficulty by analyzing it. Needs to understand before the emotional weight can settle.",
      bodyPT: "Quando os tres amigos de Jo vieram consolá-lo, ficaram com ele em silencio por sete dias antes que alguem falasse. Esse foi o instinto certo. O que veio depois foi menos util, porque se moveram rapidamente demais da presenca para a explicacao. O Processador Analitico nao precisa que alguem fique em silencio indefinidamente, mas precisa de espaco e tempo antes de poder receber cuidado. Processa a dificuldade entendendo-a primeiro. Precisa saber o que aconteceu, por que aconteceu e o que pode ser feito razoavelmente, antes que o peso emocional tenha um lugar para se assentar. Essa pessoa pode parecer inafetada no periodo imediatamente apos algo dificil. Nao esta. Esta pensando. A resposta emocional vem depois, frequentemente em particular, e pode ser mais significativa do que sua compostura inicial sugeria. Nao confunda compostura inicial com ausencia de necessidade. Forca sob pressao: permanece lucida quando outros sao reativos. Faz as perguntas que impedem uma equipe de tomar decisoes em panico e percebe o que outros perdem quando a emocao esta elevada. Sua estabilidade sob pressao e um presente genuino para as pessoas ao redor. Sombra a observar: pode se tornar excessivamente analitica sobre situacoes que requerem presenca emocional em vez de diagnostico. Em seu esforco para ajudar, pode parecer fria ou distante para colegas que precisavam se sentir ouvidos em vez de compreendidos. Preste atencao tambem ao perfeccionismo que se torna autocritico de maneiras que nao sao ditas. Orientacao de linguagem pastoral: lhe dê tempo antes de fazer acompanhamento. Como esta comunidade valoriza calor e conexao relacional, e como essa pessoa processa em particular antes de estar pronta para receber cuidado, chegar muito rapidamente apos uma dificuldade pode parecer intrometido em vez de apoiador. Espere, depois faca acompanhamento com algo especifico e atencioso. Pesquisas mostram que uma pessoa de confianca que fala diretamente e especificamente sobre a situacao de alguem e mais eficaz do que encorajamento geral. Para essa pessoa, \"Estive pensando no que voce esta carregando e queria sentar com voce\" ira alcanca-la. \"Como voce esta?\" no final de um servico nao ira. Quando falar sobre a situacao dela, ajude-a a nomear o que e verdadeiro sobre quem ela e e nao apenas analisar o que aconteceu. Essa pessoa vive em sua mente. Um pastor que a ajuda a encontrar o caminho de volta a sua identidade por baixo da analise esta oferecendo algo que ela nao consegue facilmente dar a si mesma. Fundamentacao biblica: Jo 2:13, os amigos sentados em silencio. Eclesiastes 3:1, ha um tempo para cada proposito debaixo do ceu.",
      bodyEN: "When Job's three friends came to comfort him, they sat with him in silence for seven days before anyone spoke. That was the right instinct. What came after was less helpful, because they moved too quickly from presence to explanation. The Analytical Processor does not need someone to sit in silence indefinitely, but they do need space and time before they can receive care. They process difficulty by understanding it first. They need to know what happened, why it happened, and what can reasonably be done, before the emotional weight has a place to settle. This person may appear unaffected in the immediate aftermath of something hard. They are not. They are thinking. The emotional response comes later, often privately, and it can be more significant than their initial composure suggested. Do not mistake early composure for the absence of need. Strength under pressure: they stay clear-headed when others are reactive. They ask the questions that prevent a team from making decisions in panic, and they notice what others miss when emotion is running high. Their steadiness under pressure is a genuine gift to the people around them. Shadow to watch for: they may become overly analytical about situations that require emotional presence rather than diagnosis. In their effort to help, they can come across as cold or detached to teammates who needed to feel heard rather than understood. Watch also for perfectionism becoming self-critical in ways that go unspoken. Pastoral language guidance: give them time before following up. Because this community values warmth and relational connection, and because this person processes privately before they are ready to receive care, arriving too quickly after a difficulty can feel intrusive rather than supportive. Wait, then follow up with something specific and thoughtful. Research shows that a trusted person speaking directly and specifically into someone's situation is more effective than general encouragement. For this person, \"I have been thinking about what you are carrying and I wanted to sit with you\" will reach them. \"How are you doing?\" at the end of a service will not. When you speak into their situation, help them name what is true about who they are rather than only analyzing what happened. This person lives in their mind. A pastor who helps them find their way back to their identity beneath the analysis is offering something they cannot easily give themselves. Biblically grounded in: Job 2:13, Ecclesiastes 3:1.",
    },
  ],
  pairings: [
    {
      id: "worship-culture-builder",
      anchorId: "worship-culture-builder",
      labelPT: "Construtor de Cultura de Louvor",
      labelEN: "Worship Culture Builder",
      summaryPT: "Combina sensibilidade de adoracao com impulso de excelencia e movimento.",
      summaryEN: "Combines worship sensitivity with a drive for excellence and movement.",
      bodyPT: "O que produz: um adorador com energia de Executor e raro e produz algo incomum. Combina genuina sensibilidade espiritual com um impulso incomum para excelencia e movimento. Nao apenas flui na adoracao. Constroi cultura de adoracao. Eleva o padrao de todos ao redor, empurra equipes em direcao a maior consistencia e frequentemente e quem muda um ministerio de adoracao de manutencao para impulso. Tensao a observar: sua diretividade de Executor pode chocar com o calor relacional que a cultura de equipe de adoracao tipicamente requer. O que experimenta como elevar o padrao, um colega pode experimentar como pressao ou critica. Orientacao pastoral: lhe dê propriedade clara de uma area definida do ministerio de adoracao. Ajude-a a entender que nesta comunidade como lidera importa tanto quanto onde lidera. Com quem emparelhar: alguem com o dom de Encorajamento ou um perfil Comunicador para equilibrar a diretividade com calor relacional. Fundamentacao biblica: 1 Cronicas 25:1-7, a abordagem organizada e estruturada de Davi para a adoracao.",
      bodyEN: "What it produces: a worshiper with Executor drive is rare and produces something unusual. They combine genuine spiritual sensitivity with an unusually strong drive for excellence and movement. They do not just flow in worship. They build worship culture. They raise the standard of everyone around them, push teams toward greater consistency, and are often the ones who shift a worship ministry from maintenance to momentum. Tension to watch: their D directness can clash with the relational warmth that worship team culture typically requires. What they experience as raising the standard, a teammate may experience as pressure or criticism. Pastoral guidance: give this person clear ownership of a defined area of the worship ministry. Help them understand that in this community, how they lead matters as much as where they lead. Team with: someone with the Encouragement gifting or a Comunicador profile to balance their directness with relational warmth. Biblically grounded in: 1 Chronicles 25:1-7.",
    },
    {
      id: "deep-worshiper",
      anchorId: "deep-worshiper",
      labelPT: "Adorador Profundo",
      labelEN: "Deep Worshiper",
      summaryPT: "Combina sensibilidade de adoracao com profundidade analitica e padroes de qualidade excepcionais.",
      summaryEN: "Combines worship sensitivity with analytical depth and exceptional quality standards.",
      bodyPT: "O que produz: um adorador que tambem e profundamente analitico produz profundidade musical e precisao teologica extraordinarias em seu artesanato. Estuda os Salmos como um estudioso estuda um texto. Seus arranjos sao intencionais em cada detalhe. A qualidade de seu trabalho ao longo do tempo e excepcional. Tensao a observar: pode pensar demais em momentos que requerem espontaneidade e vulnerabilidade genuinas. A busca pela excelencia ocasionalmente pode se tornar uma barreira para a presenca que era dotado para criar. Orientacao pastoral: ajude-o a confiar na preparacao o suficiente para se soltar no momento. Com quem emparelhar: alguem com o dom de Fe ou um perfil Planejador cuja confianca firme possa lhe dar permissao para liberar o que preparou tao cuidadosamente. Fundamentacao biblica: Salmo 119, a peca de literatura de adoracao mais estruturalmente precisa na Escritura, produzida com artesanato disciplinado e profundidade espiritual evidente.",
      bodyEN: "What it produces: a worshiper who is also deeply analytical produces extraordinary musical depth and theological precision in their craft. They study the Psalms the way a scholar studies a text. Their arrangements are intentional at every detail. The quality of their work over time is exceptional. Tension to watch: they can overthink in moments that require spontaneity and genuine vulnerability. The pursuit of excellence can occasionally become a barrier to the presence they were gifted to create. Pastoral guidance: help them trust their preparation enough to let go in the moment. Team with: someone with the Faith gifting or a Planejador profile whose steady trust can give them permission to release what they have so carefully prepared. Biblically grounded in: Psalm 119.",
    },
    {
      id: "initiative-servant",
      anchorId: "initiative-servant",
      labelPT: "Servidor de Iniciativa",
      labelEN: "Initiative Servant",
      summaryPT: "Combina o espirito de servico humilde com velocidade e eficacia incomuns.",
      summaryEN: "Combines a humble servant spirit with unusual speed and effectiveness.",
      bodyPT: "O que produz: esta e uma das combinacoes mais surpreendentes e poderosas no sistema. O Dom de Ajudar e naturalmente humilde e orientado para os bastidores. O perfil D empurra para iniciativa, propriedade e movimento para a frente. Juntos produzem alguem que ve o que precisa ser feito E se move com velocidade e eficacia incomuns. Nao esperam para ser solicitados e nao fazem pela metade. Frequentemente ja resolveram o problema antes que a reuniao para discuti-lo aconteca. Tensao a observar: podem acidentalmente assumir espacos que deveriam apoiar. A energia de Executor pode superar a consciencia relacional que o dom de Ajudar requer. Orientacao pastoral: ajude-os a canalizar a energia D em servico do dom de Ajudar em vez de apesar dele. Lembre-os de que o dom e mais poderoso quando permanece nos bastidores. Com quem emparelhar: alguem com o dom de Hospitalidade ou um perfil Comunicador cuja sensibilidade relacional possa ajuda-los a ler o ambiente. Fundamentacao biblica: Atos 6:1-7, a nomeacao dos diaconos, pessoas de boa reputacao e iniciativa que organizaram o servico pratico para que os apostolos pudessem se concentrar na oracao e na Palavra.",
      bodyEN: "What it produces: this is one of the most surprising and powerful combinations in the system. The Gift of Helps is naturally humble and background-oriented. The D profile pushes toward initiative, ownership, and forward movement. Together they produce someone who sees what needs doing AND moves on it with unusual speed and effectiveness. They do not wait to be asked and they do not do it halfway. They have often already solved the problem before the meeting to discuss it happens. Tension to watch: they can accidentally take over spaces they were meant to support. Their Executor drive can outpace the relational awareness that the Helps gifting requires. Pastoral guidance: help them channel the D energy in service of the Helps gifting rather than in spite of it. Remind them that the gift is most powerful when it remains in the background. Team with: someone with the Hospitality gifting or a Comunicador profile whose relational sensitivity can help them read the room. Biblically grounded in: Acts 6:1-7.",
    },
    {
      id: "relational-evangelist",
      anchorId: "relational-evangelist",
      labelPT: "Evangelista Relacional",
      labelEN: "Relational Evangelist",
      summaryPT: "Combina o fardo evangelistico com calor relacional e facilidade natural com estranhos.",
      summaryEN: "Combines evangelistic burden with relational warmth and natural ease with strangers.",
      bodyPT: "O que produz: esta e a combinacao de evangelismo mais natural. O calor relacional, o entusiasmo e a facilidade do perfil I com estranhos amplificam o dom de Evangelismo em algo genuinamente contagioso. Estas sao as pessoas que levam outros a Cristo em conversas naturais porque colocam todos a vontade e genuinamente interessados. Sao seus evangelistas de linha de frente mais eficazes. Tensao a observar: sua forca e o encontro inicial. A fase do discipulado requer a consistencia relacional sustentada e a profundidade de ensino que os perfis S e C tendem a carregar de forma mais natural. Sem uma estrutura de suporte, as pessoas que alcancam podem nao ter alguem para caminha-las para a frente. Orientacao pastoral: conecte essa pessoa com membros da equipe dotados de ensino e Planejador que possam carregar o trabalho de discipulado que se segue as suas conversas evangelisticas. Emparelhe estruturalmente, nao apenas relacionalmente. Com quem emparelhar: alguem com o dom de Ensino ou um perfil Planejador para o trabalho de discipulado que se segue. Fundamentacao biblica: Atos 8:4-8, Filipe em Samaria. Os apostolos vieram depois para construir sobre o que seu evangelismo havia aberto.",
      bodyEN: "What it produces: this is the most natural evangelism combination. The I profile's relational warmth, enthusiasm, and ease with strangers amplifies the Evangelism gifting into something genuinely contagious. These are the people who lead others to Christ in natural conversation because they make everyone feel at ease and genuinely interested. They are your most effective front-line evangelists. Tension to watch: their strength is the initial encounter. The discipleship phase requires the sustained relational consistency and teaching depth that S and C profiles tend to carry more naturally. Without a support structure, the people they reach may not have someone to walk them forward. Pastoral guidance: connect this person with Teaching-gifted and Planejador team members who can carry the discipleship work that follows their evangelistic conversations. Pair them structurally, not just relationally. Team with: someone with the Teaching gifting or a Planejador profile for the discipleship work that follows. Biblically grounded in: Acts 8:4-8.",
    },
    {
      id: "bold-evangelist",
      anchorId: "bold-evangelist",
      labelPT: "Evangelista Ousado",
      labelEN: "Bold Evangelist",
      summaryPT: "Combina o fardo pelas almas perdidas com coragem direta e disposicao para criar o momento.",
      summaryEN: "Combines burden for lost souls with direct boldness and willingness to create the moment.",
      bodyPT: "O que produz: um evangelista de alto D e incomum e altamente eficaz. Combina o conforto do D com desafio e diretividade com o fardo do dom de Evangelismo pelos perdidos. Nao esperam o momento certo. Criam-no. Compartilham o Evangelho ousadamente e sem desculpas. Sao energizados em vez de desanimados pela resistencia. Tensao a observar: em contextos culturais brasileiros, sua diretividade pode parecer confrontacional para pessoas ainda nao prontas para a conversa. O que experimentam como ousadia, o ouvinte pode experimentar como pressao. Orientacao pastoral: em uma congregacao culturalmente diversa, essa pessoa precisa de orientacao especifica sobre como ler o ambiente antes de falar. Seu dom e genuino e extremamente frutifero quando implantado com consciencia cultural. Com quem emparelhar: um Planejador que possa ajuda-los a ler os sinais relacionais que podem perder naturalmente. Fundamentacao biblica: Atos 17:16-34, Paulo em Atenas, ousado, direto e culturalmente consciente.",
      bodyEN: "What it produces: a high-D evangelist is rare and highly effective. They combine the D's comfort with challenge and directness with the Evangelism gifting's burden for the lost. They do not wait for the right moment. They create it. They share the Gospel boldly and without apology. They are energized rather than deflated by resistance. Tension to watch: in Brazilian cultural contexts, their directness may feel confrontational to people not yet ready for the conversation. What they experience as boldness, the listener may experience as pressure. Pastoral guidance: in a culturally diverse congregation, this person needs specific guidance on reading the room before they speak. Their gift is genuine and enormously fruitful when deployed with cultural awareness. Team with: a Planejador who can help them read the relational signals they may naturally overlook. Biblically grounded in: Acts 17:16-34.",
    },
    {
      id: "deep-teacher",
      anchorId: "deep-teacher",
      labelPT: "Professor em Profundidade",
      labelEN: "Deep Teacher",
      summaryPT: "Combina o dom de ensino com profundidade analitica e padroes teologicos precisos.",
      summaryEN: "Combines teaching gifting with analytical depth and precise theological standards.",
      bodyPT: "O que produz: o lar mais natural para o dom de Ensino. Um professor de alto C produz trabalho de profundidade, precisao e exatidao notaveis. Seus padroes teologicos sao elevados. Sua preparacao e minuciosa. Este e Apollos, \"homem eloquente, poderoso nas Escrituras\" (Atos 18:24). Tensao a observar: pode sacrificar acessibilidade pela profundidade, amando o conteudo mais do que a capacidade do publico de recebe-lo. Sem esforco intencional em direcao a didatica, seu conhecimento produz admiradores em vez de aprendizes, exatamente o desequilibrio que Lacerda e Brandao alertam. Orientacao pastoral: encoraje regularmente essa pessoa a perguntar nao apenas \"o que e verdadeiro?\" mas \"como isso alcanca a pessoa na minha frente?\" Com quem emparelhar: um Comunicador cujo dom de comunicacao relacional possa ajuda-lo a calibrar sua entrega. Fundamentacao biblica: Atos 18:24-28, Apollos, aprendido e preciso, tornando-se ainda mais eficaz quando Priscila e Aquila o ajudaram a comunicar o caminho de Deus com mais precisao.",
      bodyEN: "What it produces: the most natural home for the Teaching gifting. A high-C teacher produces work of remarkable depth, accuracy, and precision. Their theological standards are high. Their preparation is thorough. This is Apollos, \"a learned man, with a thorough knowledge of the Scriptures\" (Acts 18:24). Tension to watch: they may sacrifice accessibility for depth, loving the content more than the audience's capacity to receive it. Without intentional effort toward didactics, their knowledge produces admirers rather than learners. Pastoral guidance: regularly encourage this person to ask not only \"what is true?\" but \"how does this land for the person in front of me?\" Team with: a Comunicador whose relational communication gift can help them calibrate their delivery. Biblically grounded in: Acts 18:24-28.",
    },
    {
      id: "activating-teacher",
      anchorId: "activating-teacher",
      labelPT: "Professor Ativador",
      labelEN: "Activating Teacher",
      summaryPT: "Combina o dom de ensino com urgencia e energia que mobiliza pessoas com a verdade.",
      summaryEN: "Combines teaching gifting with urgency and energy that mobilizes people with truth.",
      bodyPT: "O que produz: um professor com forte energia de Executor produz algo incomum: ensino com urgencia. Nao apenas abre a verdade. Mobiliza pessoas com ela. Suas licoes tem uma qualidade de \"portanto, va fazer isso\" que professores puramente analiticos as vezes nao tem. Tensao a observar: podem se mover muito rapidamente pelo conteudo e subvalorizar a atmosfera reflexiva que o ensino profundo requer. A energia de D em direcao a acao pode comprimir o espaco que as pessoas precisam para deixar a verdade se assentar. Orientacao pastoral: ajude-os a criar pausas intencionais em seu ensino. Com quem emparelhar: um membro da equipe Planejador ou de alto C que possa fornecer o acompanhamento mais lento e metodico que da raizes ao ensino. Fundamentacao biblica: Neemias 8:8-12, Esdras leu e explicou a Palavra e o povo foi embora celebrar com grande alegria. Conteudo que produziu movimento imediato.",
      bodyEN: "What it produces: a teacher with strong D drive produces something unusual: teaching with urgency. They do not just open truth. They mobilize people with it. Their lessons have a \"therefore, go do this\" quality that pure analytical teachers sometimes lack. Tension to watch: they may move through content too fast and undervalue the reflective atmosphere that deep teaching requires. The D drive toward action can compress the space people need to let truth settle. Pastoral guidance: help them create intentional pauses in their teaching. Team with: a Planejador or high-C team member who can provide the slower, more methodical follow-up that gives their teaching roots. Biblically grounded in: Nehemiah 8:8-12.",
    },
    {
      id: "systems-architect",
      anchorId: "systems-architect",
      labelPT: "Arquiteto de Sistemas",
      labelEN: "Systems Architect",
      summaryPT: "A combinacao mais natural do sistema, produzindo excelencia operacional sustentada ao longo do tempo.",
      summaryEN: "The most natural combination in the system, producing sustained operational excellence over time.",
      bodyPT: "O que produz: a combinacao mais natural de todo o sistema. O dom de Administracao e o perfil C juntos produzem alguem que constroi os sistemas que fazem uma igreja funcionar com excelencia ao longo do tempo. Seus padroes sao elevados, sua atencao aos detalhes e excepcional e sua capacidade de antecipar problemas antes que surjam e notavel. Tensao a observar: essa pessoa precisa de autoridade clara em seu dominio. Se construir um sistema e outros o ignorarem ou contornarem, a frustracao pode ser significativa e o dano relacional real. Orientacao pastoral: lhe dê propriedade genuina. Reconheca o trabalho dela especifica e regularmente. Com quem emparelhar: um Comunicador que possa ajuda-la a comunicar seus sistemas para equipes de uma forma que obtenha adesao em vez de conformidade. Fundamentacao biblica: Neemias 1-6, o planejamento sistematico e a execucao do muro, cada familia na secao designada, cada problema potencial antecipado e abordado.",
      bodyEN: "What it produces: the most natural pairing in the entire system. The Administration gifting and C profile together produce someone who builds the systems that make a church function with excellence over time. Their standards are high, their attention to detail exceptional, and their ability to anticipate problems before they arise is remarkable. Tension to watch: this person needs clear authority in their domain. If they build a system and others ignore it or work around it, the frustration can be significant and the relationship damage real. Pastoral guidance: give this person genuine ownership. Acknowledge their work specifically and regularly. Team with: a Comunicador who can help them communicate their systems to teams in a way that gets buy-in rather than compliance. Biblically grounded in: Nehemiah 1-6.",
    },
    {
      id: "structure-builder",
      anchorId: "structure-builder",
      labelPT: "Construtor de Estruturas",
      labelEN: "Structure Builder",
      summaryPT: "Extraordinariamente eficaz na construcao e lancamento de novos sistemas, melhor em fases de partida do que de manutencao.",
      summaryEN: "Extraordinarily effective at building and launching new systems, better in startup phases than maintenance.",
      bodyPT: "O que produz: um Administrador com energia D e extraordinariamente eficaz na construcao e lancamento de novos sistemas. Move-se rapidamente, toma decisoes e cria estruturas onde nao havia nenhuma. E a pessoa a chamar quando algo precisa ser construido do zero. Tensao a observar: a inquietacao natural do perfil D significa que e melhor para construir novas estruturas do que para mante-las existentes. Uma vez que algo esta funcionando bem, pode se desengajar ou pressionar por mudanca antes que ela seja necessaria. Orientacao pastoral: implante essa pessoa em fases de partida e epocas de novo desenvolvimento em vez de contextos de manutencao. Com quem emparelhar: um Planejador de alto S que possa carregar o trabalho fiel e constante de manutencao uma vez que a estrutura esteja estabelecida. Fundamentacao biblica: Atos 6:1-7, o design rapido e eficaz do sistema diaconal, uma solucao estrutural criada e implantada sob pressao.",
      bodyEN: "What it produces: an Administrator with D drive is extraordinarily effective at building and launching new systems. They move fast, make decisions, and create structures where there were none. They are the person to call when something needs to be built from scratch. Tension to watch: the D profile's natural restlessness means they are better suited to building new structures than maintaining existing ones. Once something is running well, they may disengage or push for change before the change is needed. Pastoral guidance: deploy this person in startup phases and seasons of new development rather than maintenance contexts. Team with: a high-S Planejador who can carry the faithful, steady maintenance work once the structure is established. Biblically grounded in: Acts 6:1-7.",
    },
    {
      id: "faithful-intercessor",
      anchorId: "faithful-intercessor",
      labelPT: "Intercessor Fiel",
      labelEN: "Faithful Intercessor",
      summaryPT: "A combinacao de intercessao mais eficaz e sustentada, aparecendo fielmente por decadas.",
      summaryEN: "The most effective sustained intercession combination, showing up faithfully for decades.",
      bodyPT: "O que produz: a combinacao de intercessao sustentada mais eficaz. A presenca paciente do perfil S, a lealdade relacional profunda e a consistencia ao longo do tempo produz um intercessor que aparece toda semana sem ser celebrado, carrega fardalos de oracao a longo prazo fielmente e mantem pessoas diante de Deus ao longo de anos em vez de epocas. Tensao a observar: essa pessoa frequentemente e invisivel porque trabalha no reino invisivel. A falta de fruto visivel pode faze-la se sentir desvalorizada em culturas de ministerio que recompensam a contribuicao visivel. Orientacao pastoral: certifique-se de que essa pessoa sabe que seu trabalho e visto e que seus frutos sao reais. Um reconhecimento privado e especifico de sua fidelidade a sustentara muito mais do que o reconhecimento publico. Com quem emparelhar: um Comunicador que possa ajudar a tirar e expressar os insights de oracao que carrega silenciosamente. Fundamentacao biblica: Lucas 2:36-37, Ana, presente e fiel por decadas.",
      bodyEN: "What it produces: the most effective sustained intercession combination. The S profile's patient presence, deep relational loyalty, and consistency over time produces an intercessor who shows up every week without celebration, carries long-term prayer burdens faithfully, and holds people before God across years rather than seasons. Tension to watch: this person is often invisible because they work in the unseen realm. The lack of visible output can make them feel undervalued in ministry cultures that reward visible contribution. Pastoral guidance: make sure this person knows that their work is seen and that its fruit is real. A private, specific acknowledgment of their faithfulness will sustain them far longer than public recognition. Team with: a Comunicador who can help draw out and express the prayer insights they are carrying quietly. Biblically grounded in: Luke 2:36-37.",
    },
    {
      id: "strategic-intercessor",
      anchorId: "strategic-intercessor",
      labelPT: "Intercessor Estrategico",
      labelEN: "Strategic Intercessor",
      summaryPT: "Ora com especificidade e atencao incomuns ao que Deus esta dizendo, conectando padroes ao longo do tempo.",
      summaryEN: "Prays with unusual specificity and attention to what God is saying, connecting patterns over time.",
      bodyPT: "O que produz: um intercessor analitico ora com especificidade e atencao incomuns ao que Deus esta dizendo. Documenta, acompanha e percebe padroes ao longo do tempo. Traz precisao a sua intercessao que produz algo que funciona quase profeticamente. Esta observando com cuidado e conectando o que ve ao longo do tempo. Tensao a observar: pode esperar para orar ate sentir que entende o suficiente, o que pode criar uma barreira analitica para a responsividade espontanea que a intercessao tambem requer. Orientacao pastoral: encoraje-o a confiar na conducao do Espirito mesmo quando seu entendimento esta incompleto. Com quem emparelhar: alguem com o dom de Fe ou o dom de Discernimento e Profetico que possa ajuda-lo a segurar o misterio ao lado da precisao. Fundamentacao biblica: Daniel 9:2-3, Daniel estudando as Escrituras, entendendo dos textos o numero de anos e entao se pondo a orar com jejum.",
      bodyEN: "What it produces: an analytical intercessor prays with unusual specificity and attention to what God is saying. They document, track, and notice patterns across time. They bring precision to their intercession that produces something that functions almost prophetically. They are watching carefully and connecting what they see over time. Tension to watch: they may wait to pray until they feel they understand enough, which can create an analytical barrier to the spontaneous responsiveness intercession also requires. Pastoral guidance: encourage them to trust the Spirit's leading even when their understanding is incomplete. Team with: someone with the Faith gifting or the Discernment and Prophetic gifting, who can help hold the mystery alongside the precision. Biblically grounded in: Daniel 9:2-3.",
    },
    {
      id: "high-care-prophetic",
      anchorId: "high-care-prophetic",
      labelPT: "Profetico de Alta Atencao",
      labelEN: "High-Care Prophetic",
      summaryPT: "Um dos emparelhamentos de maior cuidado pastoral no sistema. A energia profetica e o impulso D podem colidir sem orientacao intencional.",
      summaryEN: "One of the highest pastoral care pairings in the system. Prophetic gifting and D drive can collide without intentional guidance.",
      bodyPT: "O que produz: esta e uma das combinacoes de maior cuidado pastoral no sistema. O dom profetico requer quietude, submissao a autoridade pastoral e paciencia com o tempo. O perfil D se move para acao direta, decisao rapida e iniciativa independente. Quando coexistem, a pessoa pode entregar palavras profeticas com uma diretividade e urgencia que ignora o contexto relacional que a comunidade precisa para recebe-las. Frequentemente estao certas. Frequentemente sao cedo. E frequentemente ficam surpresas quando o que disseram nao pousou como esperado. Tensao a observar: o impulso D pode leva-los a agir sobre o que sentem antes que o tempo esteja certo, ou a entregar correcoes de uma forma que parece confrontacao em vez de cuidado. Orientacao pastoral: essa pessoa precisa de relacionamento pastoral proximo e confiante acima de quase qualquer outra pessoa na congregacao. Ajude-a a desenvolver a disciplina de esperar, de trazer o que sente para o lider antes de agir. Com quem emparelhar: um Planejador cuja firmeza e paciencia podem fornecer o contrapeso relacional que o impulso D precisa. Fundamentacao biblica: 1 Reis 19:11-13, Elias. Apos o fogo, o terremoto e o vento, Deus estava na voz mansa e delicada. O profetico requer a capacidade de quietude.",
      bodyEN: "What it produces: this is one of the highest pastoral care pairings in the system. The prophetic gifting requires quietness, submission to pastoral authority, and patience with timing. The D profile drives toward direct action, quick decision, and independent initiative. When these coexist, the person may deliver prophetic words with a directness and urgency that bypasses the relational context the community needs to receive them. They are often right. They are often early. And they are often surprised when what they said did not land the way they expected. Tension to watch: the D drive can push them to act on what they sense before the timing is right, or to deliver correction in a way that feels like confrontation rather than care. Pastoral guidance: this person needs close, trusting pastoral relationship above almost any other person in the congregation. Help them develop the discipline of waiting, of bringing what they sense to their pastor before they act on it. Team with: a Planejador whose steadiness and patience can provide the relational counterbalance their D drive needs. Biblically grounded in: 1 Kings 19:11-13.",
    },
    {
      id: "steady-prophetic",
      anchorId: "steady-prophetic",
      labelPT: "Profetico Estavel",
      labelEN: "Steady Prophetic",
      summaryPT: "Uma das expressoes mais eficazes do dom profetico em um contexto de igreja local.",
      summaryEN: "One of the most effective expressions of the prophetic gifting in a local church context.",
      bodyPT: "O que produz: a paciencia e a firmeza relacional do perfil S cria o recipiente ideal para o dom profetico. Essa pessoa espera, observa, ora e entrega percepcoes profeticas no momento certo, no relacionamento certo, com o calor e a seguranca que fazem a palavra realmente pousar e ser recebida. Raramente se apressam. Sao confiados porque tem sido consistentemente presentes. Tensao a observar: a aversao ao conflito do perfil S pode faze-los reter palavras que precisam ser entregues, particularmente quando o conteudo e corretivo. Orientacao pastoral: crie canais claros e seguros para essa pessoa trazer impressoes profeticas a lideranca pastoral. Com quem emparelhar: um lider de alto D ou Executor que possa ajuda-los a agir quando a acao e necessaria. Fundamentacao biblica: Atos 13:1-3, os profetas e mestres em Antioquia, ministrando ao Senhor juntos, em comunidade, antes de o Espirito falar.",
      bodyEN: "What it produces: the patience and relational steadiness of the S profile creates the ideal container for the prophetic gifting. This person waits, watches, prays, and delivers prophetic insight at the right time, in the right relationship, with the warmth and safety that makes the word actually land and be received. They rarely rush. They are trusted because they have been consistently present. Tension to watch: the S profile's conflict-aversion may cause them to hold back words that need to be delivered, particularly when the content is corrective. Pastoral guidance: create clear, safe channels for this person to bring prophetic impressions to pastoral leadership. Team with: a high-D leader or Executor who can help them act when action is required. Biblically grounded in: Acts 13:1-3.",
    },
    {
      id: "natural-relational-leader",
      anchorId: "natural-relational-leader",
      labelPT: "Lider Relacional Natural",
      labelEN: "Natural Relational Leader",
      summaryPT: "A combinacao de lideranca mais natural para um contexto de igreja relacional, construindo equipes por meio do relacionamento.",
      summaryEN: "The most natural leadership combination for a relational church context, building teams through relationship.",
      bodyPT: "O que produz: a combinacao de lideranca mais natural para um contexto de igreja relacional. Um Comunicador com o dom de Lideranca reune pessoas naturalmente, constroi cultura de equipe por meio de relacionamentos e lidera com visao e calor. As pessoas querem segui-los. Sao os lideres que fazem as pessoas sentirem que sua contribuicao importa. Tensao a observar: sua tendencia natural e pessoas sobre processo. Podem subinvestir nas estruturas administrativas e sistemas de responsabilizacao que tornam sua lideranca sustentavel a longo prazo. Orientacao pastoral: conecte essa pessoa com membros dotados de Administracao ou Analista que possam construir e manter as estruturas que a visao de sua lideranca precisa. Com quem emparelhar: alguem com o dom de Administracao ou um Analista que possa construir os sistemas que a visao de sua lideranca exige. Fundamentacao biblica: Atos 11:22-26, Barnabe em Antioquia, vendo a graca de Deus, ficando feliz, encorajando todos a permanecerem fieis e entao indo encontrar Paulo porque o trabalho era maior do que uma pessoa podia carregar.",
      bodyEN: "What it produces: the most natural leadership combination for a relational church context. A Comunicador with the Leadership gifting rallies people naturally, builds team culture through relationships, and leads with vision and warmth. People want to follow them. They are the leaders who make people feel that their contribution matters. Tension to watch: their natural tendency is people over process. They may under-invest in the administrative structures and accountability systems that make their leadership sustainable long-term. Pastoral guidance: connect this person with Administration-gifted or Analista team members who can build and maintain the structures their leadership vision needs. Team with: someone with the Administration gifting or an Analista who can build the systems their leadership vision requires. Biblically grounded in: Acts 11:22-26.",
    },
    {
      id: "high-impact-leader",
      anchorId: "high-impact-leader",
      labelPT: "Lider de Alto Impacto",
      labelEN: "High-Impact Leader",
      summaryPT: "A combinacao mais eficaz para lideranca organizacional e crescimento sustentado da igreja.",
      summaryEN: "The most effective combination for organizational leadership and sustained church growth.",
      bodyPT: "O que produz: a combinacao mais eficaz para lideranca organizacional e crescimento sustentado da igreja. Um lider de perfil D com o dom de lideranca servidora combina iniciativa, decisao e impulso com uma orientacao genuina para o desenvolvimento das pessoas. Constroem coisas. Tomam decisoes dificeis. Movem a igreja para a frente sem perder de vista as pessoas que estao movendo. Tensao a observar: em contexto brasileiro, essa combinacao precisa de orientacao especifica sobre ritmo relacional e estilo de comunicacao. A diretividade D sem calibracao relacional danificara a unidade de equipe que o dom de lideranca visa produzir. Orientacao pastoral: o potencial de impacto dessa pessoa e significativo. Invista tempo pastoral serio nela. Ajude-a a entender as diferencas de comunicacao cultural cedo. Com quem emparelhar: um Planejador cuja presenca relacional firme possa ajuda-lo a manter os relacionamentos de equipe que o impulso D pode ultrapassar. Fundamentacao biblica: Atos 15:36-41, Paulo e Barnabe se separando. Ambos lideres, estilos diferentes e ambos eventualmente mais eficazes porque o Corpo tem espaco para mais de uma abordagem.",
      bodyEN: "What it produces: the most effective combination for organizational leadership and sustained church growth. A D-profile leader with the servant leadership gifting combines initiative, decisiveness, and drive with a genuine orientation toward people's development. They build things. They make hard calls. They move the church forward without losing sight of the people they are moving forward for. Tension to watch: in a Brazilian context, this combination needs specific coaching on relational pace and communication style. Their D directness without relational calibration will damage the team unity their leadership gift is meant to produce. Pastoral guidance: this person's potential for impact is significant. Invest serious pastoral time in them. Help them understand the cultural communication differences early. Team with: a Planejador whose steady relational presence can help them pace and maintain the team relationships their D drive might otherwise outrun. Biblically grounded in: Acts 15:36-41.",
    },
    {
      id: "deep-hospitality",
      anchorId: "deep-hospitality",
      labelPT: "Hospitalidade Profunda",
      labelEN: "Deep Hospitality",
      summaryPT: "Hospitalidade que nao e uma performance, mas uma forma de ser, consistente e genuinamente calorosa.",
      summaryEN: "Hospitality that is not a performance but a way of being, consistent and genuinely warm.",
      bodyPT: "O que produz: o emparelhamento mais natural para o dom de Hospitalidade. A presenca paciente do perfil S, o calor relacional profundo e o interesse genuino nos outros produz uma hospitalidade que nao e uma performance, mas uma forma de ser. As pessoas se sentem genuinamente em casa com essa pessoa porque o acolhimento e consistente, tranquilo e real. Tensao a observar: seu calor e profundo mas quieto. Em ambientes grandes ou caoticos, podem ser ignorados ou subutilizados porque nao se autopromovem ou chamam atencao para o que oferecem. Orientacao pastoral: seja intencional ao posicionar essa pessoa em pontos de entrada, experiencias para visitantes de primeira vez e equipes de cuidado de acompanhamento. Com quem emparelhar: um Comunicador que possa ajuda-la a se engajar com pessoas que nao abordaria naturalmente. Fundamentacao biblica: Atos 16:14-15, Lidia, ouviu, creu e imediatamente abriu sua casa. Hospitalidade como primeira expressao da nova fe.",
      bodyEN: "What it produces: the most natural pairing for the Hospitality gifting. The S profile's patient presence, deep relational warmth, and genuine interest in others produces hospitality that is not a performance but a way of being. People feel genuinely at home with this person because the welcome is consistent, unhurried, and real. Tension to watch: their warmth is deep but quiet. In large or chaotic environments, they may be overlooked or underutilized because they do not self-promote or call attention to what they offer. Pastoral guidance: be intentional about placing this person at entry points, first-time guest experiences, and care follow-up teams. Team with: a Comunicador who can help them engage people they might not naturally approach. Biblically grounded in: Acts 16:14-15.",
    },
    {
      id: "expressive-hospitality",
      anchorId: "expressive-hospitality",
      labelPT: "Hospitalidade Expressiva",
      labelEN: "Expressive Hospitality",
      summaryPT: "Hospitalidade que e calorosa e energetica, fazendo as pessoas se sentirem nao apenas aceitas mas celebradas.",
      summaryEN: "Hospitality that is warm and energetic, making people feel not just accepted but celebrated.",
      bodyPT: "O que produz: um Comunicador com o dom de Hospitalidade cria ambientes que parecem vivos. Seu calor e expressivo, seu acolhimento e entusiasmado e as pessoas se sentem nao apenas aceitas mas celebradas. Esta e uma expressao diferente de hospitalidade do que a versao do perfil S. Nao quieta e consistente, mas calorosa e energetica. Ambas sao genuinas. Ambas sao necessarias e servem a pessoas diferentes bem. Tensao a observar: a energia social natural do perfil I pode ocasionalmente fazer visitantes mais reservados ou introvertidos se sentirem sobrecarregados em vez de acolhidos, especialmente aqueles que processam em um ritmo mais lento. Orientacao pastoral: ajude essa pessoa a desenvolver sensibilidade para ritmos relacionais diferentes. Com quem emparelhar: um Planejador que fornece naturalmente essa forma mais quieta de acolhimento ao lado deles. Fundamentacao biblica: Lucas 19:5-6, Zaqueu. Jesus o chamou pelo nome e disse que estava vindo para a sua casa, e Zaqueus o recebeu com alegria. O acolhimento era especifico, pessoal e recebido com alegria.",
      bodyEN: "What it produces: a Comunicador with the Hospitality gifting creates environments that feel alive. Their warmth is expressive, their welcome is enthusiastic, and people feel not just accepted but celebrated. This is a different expression of hospitality than the S-profile version. Not quiet and consistent but warm and energetic. Both are genuine. Both are needed, and they serve different people well. Tension to watch: the I profile's natural social energy can occasionally make quieter or more reserved guests feel overwhelmed rather than welcomed, particularly those who process at a slower pace. Pastoral guidance: help this person develop sensitivity to different relational paces. Team with: a Planejador who naturally provides that quieter form of welcome alongside them. Biblically grounded in: Luke 19:5-6.",
    },
    {
      id: "collaborative-creative",
      anchorId: "collaborative-creative",
      labelPT: "Criativo Colaborativo",
      labelEN: "Collaborative Creative",
      summaryPT: "Gera ideias E as comunica com entusiasmo contagioso, puxando outros para processos criativos naturalmente.",
      summaryEN: "Generates ideas AND communicates them with contagious enthusiasm, pulling others into creative processes naturally.",
      bodyPT: "O que produz: Criatividade amplificada pela expressividade relacional do perfil I produz alguem que gera ideias E as comunica com entusiasmo contagioso. Puxam outros para processos criativos naturalmente. Fazem a colaboracao parecer energizante em vez de exaustiva. Seu melhor trabalho frequentemente acontece em comunidade em vez de em isolamento. Tensao a observar: a precisao do perfil C e a consistencia do perfil S nao sao forcas naturais aqui. As ideias podem ser abundantes mas a execucao pode ser dispersa sem suporte estrutural. Orientacao pastoral: emparelhe essa pessoa com um membro da equipe dotado de Administracao ou Analista que possa pegar seu resultado criativo e construir um caminho para que seja realizado bem. Com quem emparelhar: alguem com o dom de Administracao ou um Analista que possa transformar as ideias em realidade bem executada. Fundamentacao biblica: Exodo 35:34, Deus colocou no coracao de Bezalel a habilidade de ensinar, o lider criativo que reuniu e mobilizou toda uma comunidade de pessoas habilidosas em torno da visao.",
      bodyEN: "What it produces: Creativity amplified by the I profile's relational expressiveness produces someone who generates ideas AND communicates them with contagious enthusiasm. They pull others into creative processes naturally. They make collaboration feel energizing rather than exhausting. Their best work often happens in community rather than in solitude. Tension to watch: the C profile's precision and the S profile's consistency are not natural strengths here. Ideas may be abundant but execution may be scattered without structural support. Pastoral guidance: pair this person with an Administration-gifted or Analista team member who can take their creative output and build a pathway for it to be realized well. Team with: someone with the Administration gifting or an Analista who can turn the ideas into well-executed reality. Biblically grounded in: Exodus 35:34.",
    },
    {
      id: "high-execution-creative",
      anchorId: "high-execution-creative",
      labelPT: "Criativo de Alta Execucao",
      labelEN: "High-Execution Creative",
      summaryPT: "Raro e profundamente valioso: imagina E executa com precisao e padroes de qualidade excepcionais.",
      summaryEN: "Rare and deeply valuable: imagines AND executes with precision and exceptional quality standards.",
      bodyPT: "O que produz: esta e uma combinacao rara e profundamente valiosa. O dom de Criatividade gera ideias e possibilidades. O perfil C traz precisao, padroes de qualidade e execucao minuciosa a essas ideias. Essa pessoa nao apenas imagina, constroi. Seu resultado criativo e tanto inovador quanto excepcionalmente bem executado. Tensao a observar: o impulso do C pela precisao pode desacelerar o processo criativo de formas que produzem frustracao quando a colaboracao com membros da equipe mais rapidos e necessaria. Tambem pode ser autocritic sobre o trabalho criativo de formas que o impedem de compartilha-lo. Orientacao pastoral: crie espaco protegido para essa pessoa trabalhar com a profundidade que precisa. Com quem emparelhar: um Comunicador que possa ajudar a traduzir e apresentar o trabalho para a comunidade mais ampla de uma forma que homenageie o que foi feito. Fundamentacao biblica: Exodo 38:23, Ooliaabe, gravador, artesao habilidoso e tecelao em azul e purpura e escarlate e linho fino. Precisao tecnica a servico da beleza.",
      bodyEN: "What it produces: this is a rare and deeply valuable combination. The Creativity gifting generates ideas and possibilities. The C profile brings precision, quality standards, and thorough execution to those ideas. This person does not just imagine. They build. Their creative output is both innovative and exceptionally well-executed. Tension to watch: the C's drive for precision can slow the creative process in ways that produce frustration when collaboration with faster-moving teammates is required. They may also be self-critical about creative work in ways that prevent them from sharing it. Pastoral guidance: create protected space for this person to work with the depth they need. Team with: a Comunicador who can help translate and present their work to the wider community in a way that does justice to what they have made. Biblically grounded in: Exodus 38:23.",
    },
    {
      id: "worship-music-analista-c",
      anchorId: "worship-music-planejador-s",
      labelPT: "(NOTE: This slot intentionally holds the 20th pairing which is Worship Music + Planejador per original planning. Describe below.)",
      labelEN: "Consistent Worshiper",
      summaryPT: "Combina sensibilidade de adoracao com fidelidade inabalavel e presenca consistente ao longo do tempo.",
      summaryEN: "Combines worship sensitivity with unshakeable faithfulness and consistent presence over time.",
      bodyPT: "O que produz: a combinacao de adoracao mais sustentada ao longo do tempo. O perfil S traz a qualidade mais profunda que a adoracao requer: aparecer, toda vez, independente de como se sente. Essa pessoa nao serve no louvor apenas quando a experiencia e alta. Serve quando e ordinario, quando e silencioso, quando ninguem esta prestando atencao. Essa fidelidade, ao longo dos anos, e o que cria uma cultura de adoracao genuina em vez de um desempenho. Tensao a observar: podem ter dificuldade em expressar-se vocalmente ou criativamente em momentos que requerem espontaneidade, preferindo o conhecido e o familiar. Podem tambem guardar insights sobre a adoracao para si em vez de compartilha-los com a equipe. Orientacao pastoral: proteja a consistencia dessa pessoa. Nao os mova de funcao com frequencia. Deixe-os se aprofundar em um papel ao longo do tempo. Com quem emparelhar: alguem com o dom de Criatividade ou um Comunicador que possa trazer energia e espontaneidade ao lado da fidelidade desta pessoa. Fundamentacao biblica: 1 Cronicas 25, os levitas designados, treinados e dedicados ao ministerio de adoracao ao longo do tempo, nao apenas por talento, mas por chamado e compromisso.",
      bodyEN: "What it produces: the most sustained worship combination over time. The S profile brings the deepest quality worship requires: showing up, every time, regardless of how they feel. This person does not serve in worship only when the experience is high. They serve when it is ordinary, when it is quiet, when no one is paying attention. That faithfulness, over years, is what creates a genuine culture of worship rather than a performance. Tension to watch: they may struggle to express themselves vocally or creatively in moments that require spontaneity, preferring the known and familiar. They may also keep worship insights to themselves rather than sharing them with the team. Pastoral guidance: protect this person's consistency. Do not move them from their role frequently. Let them go deep in one place over time. Team with: someone with the Creativity gifting or a Comunicador who can bring energy and spontaneity alongside this person's faithfulness. Biblically grounded in: 1 Chronicles 25.",
    },
  ],
  teamBuilding: {
    id: "building-healthy-teams",
    anchorId: "building-healthy-teams",
    labelPT: "Construindo Equipes Saudaveis",
    labelEN: "Building Healthy Teams",
    bodyPT: "Uma equipe ministerial saudavel nao e uma colecao de pessoas com o mesmo perfil. E uma colecao de pessoas cujos perfis diferentes cobrem as lacunas uns dos outros. Quando Bezalel e Ooliaabe construiram o Tabernaculo juntos, havia uma amplitude impressionante de dom entre os dois que lhes permitia liderar cada aspecto do artesanato necessario. Nenhum deles poderia te-lo construido sozinho. Deus designou dois e entao reuniu toda uma equipe de artesaos adicionais, porque o trabalho era grande e variado demais para qualquer tipo de pessoa. Lendo o perfil de uma equipe: olhe primeiro para a distribuicao de DISC em uma equipe. Uma equipe composta inteiramente de Comunicadores e Planejadores sera calorosa, relacional e consistente, mas lutara com acao decisiva e planejamento estrutural. Uma equipe composta inteiramente de Executores e Analistas sera eficaz e precisa, mas lutara para manter a saude relacional que sustenta o ministerio a longo prazo. O que uma equipe equilibrada tipicamente precisa: pelo menos uma pessoa com forca natural de Executor ou Comunicador para gerar impulso e manter energia. Pelo menos uma pessoa com forca natural de Planejador ou Analista para fornecer consistencia e qualidade. Pelo menos uma pessoa com tendencia de lideranca relacional para manter a equipe unida interpessoalmente. Pelo menos uma pessoa cujo perfil emocional e suficientemente diferente dos outros para captar o que o perfil majoritario tende a perder. Sinais de alerta de desequilibrio de equipe: quando uma equipe nao tem ninguem com um perfil de Sustentador ou Carregador Estavel, o esgotamento tende a se desenvolver silenciosamente ate se tornar uma crise. Quando uma equipe nao tem ninguem com um perfil de Mobilizador ou Lider Visionario, a manutencao do ministerio tende a substituir o crescimento do ministerio. Quando uma equipe nao tem ninguem com um perfil de Processador Analitico, lacunas de qualidade tendem a se acumular sem verificacao. Quando uma equipe nao tem ninguem com um perfil de Processador Expressivo, as necessidades emocionais dentro da equipe tendem a nao serem ditas ate se tornarem problemas relacionais. Usando os dados de emparelhamento: quando esta construindo uma equipe em torno de uma pessoa cujo dom e combinacao de DISC produz uma tensao conhecida, use as descricoes de emparelhamento neste guia para identificar quem colocar ao lado delas. O sistema e projetado para sinalizar o que uma pessoa traz e o que precisa ao redor. Uma equipe e bem construida quando as lacunas no perfil de uma pessoa sao as forcas de outra pessoa na mesma equipe. Fundamentacao biblica: 1 Corintios 12:14-20, o corpo nao consiste de um membro, mas de muitos. Exodo 31:6, Ooliaabe designado ao lado de Bezalel e outros artesaos habilidosos reunidos ao redor de ambos.",
    bodyEN: "A healthy ministry team is not a collection of people with the same profile. It is a collection of people whose different profiles cover each other's gaps. When Bezalel and Oholiab built the Tabernacle together, there was an amazing breadth of gifting between the two of them that enabled them to lead each aspect of craftsmanship required. Neither one could have built it alone. God appointed two, then gathered a whole team of additional artisans, because the work was too large and too varied for any one type of person. Reading a team's profile: look at the DISC distribution across a team first. A team made up entirely of Comunicadores and Planejadores will be warm, relational, and consistent, but it will struggle with decisive action and structural planning. A team made up entirely of Executores and Analistas will be effective and precise, but it will struggle to maintain the relational health that sustains long-term ministry. What a balanced team typically needs: at least one person with strong Executor or Comunicador natural strength to generate momentum and maintain energy. At least one person with strong Planejador or Analista natural strength to provide consistency and quality. At least one person with a relational leadership tendency to hold the team together interpersonally. At least one person whose emotional profile is different enough from the others to catch what the majority profile tends to miss. Warning signs of team imbalance: when a team has no one with a Sustainer or Steady Carrier profile, burnout tends to develop quietly until it becomes a crisis. When a team has no one with a Mobilizer or Visionary Leader profile, ministry maintenance tends to replace ministry growth. When a team has no one with an Analytical Processor profile, quality gaps tend to accumulate unchecked. When a team has no one with an Expressive Processor profile, emotional needs within the team tend to go unspoken until they become relational problems. Using the pairing data: when you are building a team around a person whose gifting and DISC combination produces a known tension, use the pairing descriptions in this guide to identify who to place alongside them. The system is designed to flag what a person brings and what they need around them. A team is built well when the gaps in one person's profile are the strengths of someone else on the same team. Biblically grounded in: 1 Corinthians 12:14-20, Exodus 31:6. ======================================================== SECTION 8: FOOTNOTES AND SOURCES ======================================================== 1. Adapted from O Chamado e os Dons Ministeriais, Drummond Lacerda and Braulio Brandao, Editora Comunicacao Lagoinha, 2014. (Referenced in: Worship and Music, Evangelism, Teaching, Administration, Discernment and Prophetic, Deep Teacher pairing) 2. Brazilian DISC cultural adaptation research: Instituto Brasileiro de Coaching IBC. Solides Tecnologia, Perfil Comportamental DISC, 2019. Extended DISC Validation Study. 3. DISC behavioral profile research: DiSC Profile research by Inscape Publishing and Wiley. Everything DiSC Workplace, Wiley, 2012. 4. Brazilian DISC population distribution data: research consistently shows Comunicador as most common profile nationally, Analista as least common. Source: Instituto Brasileiro de Coaching and associated research literature. 5. DISC behavioral descriptors: Everything DiSC Workplace, Wiley. DiSC Classic by Inscape Publishing. 6. DISC global population distribution: D approximately 9 percent, I approximately 28 percent, S approximately 32 percent, C approximately 31 percent. Source: Extended DISC validation research. 7. DISC I-style characteristics: Everything DiSC Workplace profile descriptions, Wiley. 8. DISC S-style characteristics: Everything DiSC Workplace profile descriptions, Wiley. 9. John C. Maxwell, The 21 Irrefutable Laws of Leadership, revised edition, HarperChristian Resources, 2007. The 5 Levels of Leadership, Center Street, 2011. The 21 Indispensable Qualities of a Leader, Thomas Nelson, 1999. 10. Trevor Moawad, It Takes What It Takes, HarperOne, 2020. Getting to Neutral, HarperOne, 2022. 11. Collin Henderson, Master Your Mindset, 2018. Proverbs 4:23 ESV anchor text.",
  },
  footnotesPT: [
    "1. Adapted from O Chamado e os Dons Ministeriais, Drummond Lacerda and Braulio Brandao, Editora Comunicacao Lagoinha, 2014. (Referenced in: Worship and Music, Evangelism, Teaching, Administration, Discernment and Prophetic, Deep Teacher pairing)",
    "2. Brazilian DISC cultural adaptation research: Instituto Brasileiro de Coaching IBC. Solides Tecnologia, Perfil Comportamental DISC, 2019. Extended DISC Validation Study.",
    "3. DISC behavioral profile research: DiSC Profile research by Inscape Publishing and Wiley. Everything DiSC Workplace, Wiley, 2012.",
    "4. Brazilian DISC population distribution data: research consistently shows Comunicador as most common profile nationally, Analista as least common. Source: Instituto Brasileiro de Coaching and associated research literature.",
    "5. DISC behavioral descriptors: Everything DiSC Workplace, Wiley. DiSC Classic by Inscape Publishing.",
    "6. DISC global population distribution: D approximately 9 percent, I approximately 28 percent, S approximately 32 percent, C approximately 31 percent. Source: Extended DISC validation research.",
    "7. DISC I-style characteristics: Everything DiSC Workplace profile descriptions, Wiley.",
    "8. DISC S-style characteristics: Everything DiSC Workplace profile descriptions, Wiley.",
    "9. John C. Maxwell, The 21 Irrefutable Laws of Leadership, revised edition, HarperChristian Resources, 2007. The 5 Levels of Leadership, Center Street, 2011. The 21 Indispensable Qualities of a Leader, Thomas Nelson, 1999.",
    "10. Trevor Moawad, It Takes What It Takes, HarperOne, 2020. Getting to Neutral, HarperOne, 2022.",
    "11. Collin Henderson, Master Your Mindset, 2018. Proverbs 4:23 ESV anchor text.",
  ],
  footnotesEN: [
    "1. Adapted from O Chamado e os Dons Ministeriais, Drummond Lacerda and Braulio Brandao, Editora Comunicacao Lagoinha, 2014. (Referenced in: Worship and Music, Evangelism, Teaching, Administration, Discernment and Prophetic, Deep Teacher pairing)",
    "2. Brazilian DISC cultural adaptation research: Instituto Brasileiro de Coaching IBC. Solides Tecnologia, Perfil Comportamental DISC, 2019. Extended DISC Validation Study.",
    "3. DISC behavioral profile research: DiSC Profile research by Inscape Publishing and Wiley. Everything DiSC Workplace, Wiley, 2012.",
    "4. Brazilian DISC population distribution data: research consistently shows Comunicador as most common profile nationally, Analista as least common. Source: Instituto Brasileiro de Coaching and associated research literature.",
    "5. DISC behavioral descriptors: Everything DiSC Workplace, Wiley. DiSC Classic by Inscape Publishing.",
    "6. DISC global population distribution: D approximately 9 percent, I approximately 28 percent, S approximately 32 percent, C approximately 31 percent. Source: Extended DISC validation research.",
    "7. DISC I-style characteristics: Everything DiSC Workplace profile descriptions, Wiley.",
    "8. DISC S-style characteristics: Everything DiSC Workplace profile descriptions, Wiley.",
    "9. John C. Maxwell, The 21 Irrefutable Laws of Leadership, revised edition, HarperChristian Resources, 2007. The 5 Levels of Leadership, Center Street, 2011. The 21 Indispensable Qualities of a Leader, Thomas Nelson, 1999.",
    "10. Trevor Moawad, It Takes What It Takes, HarperOne, 2020. Getting to Neutral, HarperOne, 2022.",
    "11. Collin Henderson, Master Your Mindset, 2018. Proverbs 4:23 ESV anchor text.",
  ],
};

// ─── EXPANDABLE REFERENCE CARD ────────────────────────────────────
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
              {/* DISC subsection tabs */}
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
                <p style={{fontSize:13,color:"#aebac0",lineHeight:1.7,margin:0}}>
                  {lang==="PT" ? item.brazilPT : (item.usaEN || item.brazilPT || "")}
                </p>
              )}
              {discSection === "usa" && (
                <p style={{fontSize:13,color:"#aebac0",lineHeight:1.7,margin:0}}>
                  {lang==="PT" ? item.usaPT : item.usaEN}
                </p>
              )}
              {discSection === "cult" && (
                <p style={{fontSize:13,color:"#aebac0",lineHeight:1.7,margin:0}}>
                  {lang==="PT" ? item.culturalPT : item.culturalEN}
                </p>
              )}
            </div>
          ) : (
            <div style={{paddingTop:12}}>
              {body && <p style={{fontSize:13,color:"#aebac0",lineHeight:1.7,margin:0}}>{body}</p>}
              {pastoral && (
                <div style={{marginTop:12,padding:"10px 14px",borderLeft:"3px solid rgba(245,158,11,0.7)",background:"rgba(245,158,11,0.05)",borderRadius:"0 8px 8px 0"}}>
                  <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em",textTransform:"uppercase",color:"#f59e0b",marginBottom:4}}>
                    {lang==="PT" ? "Nota Pastoral" : "Pastoral Note"}
                  </div>
                  <p style={{fontSize:12.5,color:"#fbd590",lineHeight:1.6,margin:0}}>{pastoral}</p>
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
function ReferenceTab({ t, lang, anchor, onAnchorConsumed }) {
  var ref = REFERENCE[lang] || REFERENCE.PT;

  // Scroll to anchor element when anchor prop changes
  useEffect(function(){
    if (!anchor) return;
    var el = document.getElementById("anchor-" + anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (onAnchorConsumed) onAnchorConsumed();
    } else {
      // Retry after paint
      var timer = setTimeout(function(){
        var el2 = document.getElementById("anchor-" + anchor);
        if (el2) el2.scrollIntoView({ behavior: "smooth", block: "start" });
        if (onAnchorConsumed) onAnchorConsumed();
      }, 200);
      return function(){ clearTimeout(timer); };
    }
  }, [anchor]);

  function SectionHeader(titlePT, titleEN) {
    return (
      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,
        letterSpacing:"0.12em",textTransform:"uppercase",color:"#5eead4",
        marginBottom:12,marginTop:4,paddingBottom:8,
        borderBottom:"1px solid rgba(94,234,212,0.12)"}}>
        {lang==="PT" ? titlePT : titleEN}
      </div>
    );
  }

  return (
    <div style={{padding:"32px 28px",display:"flex",flexDirection:"column",gap:24,maxWidth:1100,margin:"0 auto"}}>
      {/* ── Header ── */}
      <div style={{padding:"24px 28px",borderRadius:14,
        background:"linear-gradient(90deg,rgba(94,234,212,0.06),transparent)",
        border:"1px solid rgba(255,255,255,0.04)",borderLeft:"2px solid #5eead4"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:8}}>LTC Ministry</div>
        <h2 style={{margin:"0 0 8px",fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:700,color:"#e6f1f0",letterSpacing:"-0.01em"}}>{ref.title}</h2>
        <p style={{margin:0,fontSize:13,color:"#6b7a82"}}>{ref.subtitle}</p>
      </div>

      {/* ── How to read + Calibration ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div className="glass" style={{padding:24,borderRadius:12}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:14}}>{ref.howToRead}</div>
          <ol style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:10}}>
            {ref.howToReadItems.map(function(item,i){return(<li key={i} style={{fontSize:13,color:"#aebac0",lineHeight:1.6}}>{item}</li>);})}
          </ol>
        </div>
        <div className="glass" style={{padding:24,borderRadius:12}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10.5px",letterSpacing:"0.18em",textTransform:"uppercase",color:"#5eead4",marginBottom:14}}>{ref.calibTitle}</div>
          <p style={{margin:0,fontSize:13,color:"#aebac0",lineHeight:1.7}}>{ref.calibDesc}</p>
          <div style={{marginTop:16,display:"flex",gap:12}}>
            {[{label:"75%+",color:"#34d399",desc:lang==="PT"?"Alta consistencia":"High consistency"},
              {label:"50-74%",color:"#f59e0b",desc:lang==="PT"?"Moderada":"Moderate"},
              {label:"<50%",color:"#f87171",desc:lang==="PT"?"Requer conversa":"Needs conversation"}
            ].map(function(item){return(
              <div key={item.label} style={{flex:1,padding:"10px 12px",borderRadius:8,background:item.color+"10",border:"1px solid " + item.color + "30",textAlign:"center"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:item.color,marginBottom:4}}>{item.label}</div>
                <div style={{fontSize:10,color:"#6b7a82"}}>{item.desc}</div>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* ── DISC Profiles ── */}
      <div>
        {SectionHeader("Perfis DISC", "DISC Profiles")}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {REFERENCE_CONTENT.discProfiles.map(function(item){
            var color = DISC_COLORS[item.id === "executor" ? "D" : item.id === "comunicador" ? "I" : item.id === "planejador" ? "S" : "C"] || "#5eead4";
            return (
              <RefCard key={item.id} item={item} lang={lang} isDisc={true} discColor={color} />
            );
          })}
        </div>
      </div>

      {/* ── Ministry Giftings ── */}
      <div>
        {SectionHeader("Dons Ministeriais", "Ministry Giftings")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {REFERENCE_CONTENT.giftings.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* ── Natural Strengths ── */}
      <div>
        {SectionHeader("Forcas Naturais", "Natural Strengths")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {REFERENCE_CONTENT.naturalStrengths.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* ── Leadership Tendencies ── */}
      <div>
        {SectionHeader("Tendencias de Lideranca", "Leadership Tendencies")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {REFERENCE_CONTENT.leadershipTendencies.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* ── Emotional Profiles ── */}
      <div>
        {SectionHeader("Perfis Emocionais", "Emotional Profiles")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {REFERENCE_CONTENT.emotionalProfiles.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* ── Gifting and DISC Pairings ── */}
      <div>
        {SectionHeader("Combinacoes Dom e DISC", "Gifting and DISC Pairings")}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {REFERENCE_CONTENT.pairings.map(function(item){
            return <RefCard key={item.id} item={item} lang={lang} isDisc={false} />;
          })}
        </div>
      </div>

      {/* ── Team Building ── */}
      <div>
        {SectionHeader("Construindo Equipes Saudaveis", "Building Healthy Teams")}
        <RefCard item={REFERENCE_CONTENT.teamBuilding} lang={lang} isDisc={false} />
      </div>

      {/* ── Footnotes ── */}
      <div>
        {SectionHeader("Notas e Fontes", "Notes and Sources")}
        <div className="glass" style={{padding:20,borderRadius:12}}>
          <ol style={{margin:0,paddingLeft:18,display:"flex",flexDirection:"column",gap:8}}>
            {(lang === "PT" ? REFERENCE_CONTENT.footnotesPT : REFERENCE_CONTENT.footnotesEN).map(function(fn, i){
              return <li key={i} style={{fontSize:11.5,color:"#6b7a82",lineHeight:1.6}}>{fn}</li>;
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("ltc_token") || null);
  const [tab, setTab] = useState("analytics");
  const [refAnchor, setRefAnchor] = useState(null);
  const [lang, setLang] = useState("PT");
  const [showSettings, setShowSettings] = useState(false);
  const [templatePT, setTemplatePT] = useState(DEFAULT_TEMPLATE_PT);
  const [templateEN, setTemplateEN] = useState(DEFAULT_TEMPLATE_EN);
  const t = L[lang];

  function handleNavigate(tabId, anchor) {
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
    { id: "reference", label: t.reference },
  ];

  return (
    <div className="app" style={{minHeight:"100vh"}}>
      <style>{css}</style>

      {/* Nav */}
      <div className="nav" style={{position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:1600,margin:"0 auto",padding:"18px 32px",display:"flex",alignItems:"center",gap:28,justifyContent:"space-between"}}>
          {/* Brand cluster */}
          <div style={{display:"flex",alignItems:"center",gap:20,flexShrink:0}}>
            <img src={`${import.meta.env.BASE_URL}LTC1.svg`} alt="Lagoinha Tampa" style={{height:32,width:"auto",objectFit:"contain",display:"block"}} />
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
        {tab === "people" && <PeopleTab token={token} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} onNavigate={handleNavigate} />}
        {tab === "gifting" && <GiftingTab token={token} t={t} lang={lang} templatePT={templatePT} templateEN={templateEN} />}
        {tab === "health" && <MinistryHealthTab t={t} lang={lang} />}
        {tab === "reference" && <ReferenceTab t={t} lang={lang} anchor={refAnchor} onAnchorConsumed={function(){setRefAnchor(null);}} />}
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
    </div>
  );
}
