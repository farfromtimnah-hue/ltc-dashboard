import { useState } from "react";

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const SERVICES = [
  "Sunday 10AM (PT)",
  "Sunday 6:30PM (EN)",
  "Legacy (Friday)",
  "Culto Hope (Tuesday)",
  "Culto Fé (Wednesday)",
  "Rocket Youth (Saturday)",
  "Link (Sunday)",
];

const MINISTRIES_BY_SERVICE = {
  "Sunday 10AM (PT)": [
    { name: "Worship Team", leader: "Kênia", status: "green", positions: [
      { title: "Vocal Lead", person: "Ana Souza", status: "confirmed", log: [
        { ts: "Jun 2 9:00am", text: "Ana Souza scheduled by Kênia" },
        { ts: "Jun 2 10:15am", text: "Ana CONFIRMED ✅" },
      ]},
      { title: "Acoustic Guitar", person: "Marcos Lima", status: "confirmed", log: [
        { ts: "Jun 2 9:02am", text: "Marcos Lima scheduled by Kênia" },
        { ts: "Jun 3 2:00pm", text: "Marcos CONFIRMED ✅" },
      ]},
    ]},
    { name: "Sound", leader: "Cláudio", status: "yellow", positions: [
      { title: "Sound Operator", person: "João Silva", status: "declined", log: [
        { ts: "Jun 2 9:14am", text: "João Silva scheduled by Cláudio" },
        { ts: "Jun 3 11:00am", text: "João DECLINED ❌" },
        { ts: "Jun 4 11:05am", text: "No response from Maria — 24hr alert sent to Cláudio" },
        { ts: "Jun 4 3:00pm", text: "Position still open 🔴" },
      ]},
      { title: "Backup Sound", person: "Rafael T.", status: "confirmed", log: [
        { ts: "Jun 3 10:00am", text: "Rafael T. scheduled by Cláudio" },
        { ts: "Jun 3 12:30pm", text: "Rafael CONFIRMED ✅" },
      ]},
    ]},
    { name: "Translation", leader: "Pra. Paula", status: "red", positions: [
      { title: "English Translator", person: null, status: "open", log: [
        { ts: "Jun 1 2:00pm", text: "Position opened for scheduling" },
        { ts: "Jun 3 9:00am", text: "Nicole L. DECLINED ❌" },
        { ts: "Jun 4 8:00am", text: "Emergency — position still open 🔴" },
      ]},
    ]},
    { name: "Projection", leader: "Marjorie", status: "green", positions: [
      { title: "ProPresenter Operator", person: "Livia C.", status: "confirmed", log: [
        { ts: "Jun 1 10:00am", text: "Livia C. scheduled by Marjorie" },
        { ts: "Jun 1 11:00am", text: "Livia CONFIRMED ✅" },
      ]},
    ]},
    { name: "Lagoinha Kids", leader: "Babi", status: "yellow", positions: [
      { title: "Teacher — Babies", person: "Camila F.", status: "confirmed", log: [
        { ts: "Jun 2 8:00am", text: "Camila F. scheduled by Babi" },
        { ts: "Jun 2 9:00am", text: "Camila CONFIRMED ✅" },
      ]},
      { title: "Teacher — 4-6yr", person: null, status: "open", log: [
        { ts: "Jun 3 9:00am", text: "Position opened for scheduling" },
        { ts: "Jun 4 9:05am", text: "No response — follow-up sent" },
      ]},
    ]},
  ],
  "Sunday 6:30PM (EN)": [
    { name: "Worship Team", leader: "Kênia", status: "green", positions: [
      { title: "Vocal Lead", person: "Sarah M.", status: "confirmed", log: [
        { ts: "Jun 3 10:00am", text: "Sarah M. scheduled by Kênia" },
        { ts: "Jun 3 11:00am", text: "Sarah CONFIRMED ✅" },
      ]},
      { title: "Keys", person: "Daniel R.", status: "confirmed", log: [
        { ts: "Jun 3 10:05am", text: "Daniel R. scheduled by Kênia" },
        { ts: "Jun 3 2:00pm", text: "Daniel CONFIRMED ✅" },
      ]},
    ]},
    { name: "Sound", leader: "Cláudio", status: "green", positions: [
      { title: "Sound Operator", person: "Thiago S.", status: "confirmed", log: [
        { ts: "Jun 2 4:00pm", text: "Thiago S. scheduled by Cláudio" },
        { ts: "Jun 2 5:30pm", text: "Thiago CONFIRMED ✅" },
      ]},
    ]},
    { name: "Projection", leader: "Marjorie", status: "yellow", positions: [
      { title: "ProPresenter Operator", person: null, status: "open", log: [
        { ts: "Jun 3 9:00am", text: "Position opened for scheduling" },
        { ts: "Jun 3 9:05am", text: "WhatsApp sent to Pedro A." },
        { ts: "Jun 4 9:05am", text: "No response — follow-up sent" },
      ]},
    ]},
  ],
  "Legacy (Friday)": [
    { name: "Worship Team", leader: "Kênia", status: "green", positions: [
      { title: "Vocal Lead", person: "Bruna K.", status: "confirmed", log: [
        { ts: "Jun 1 2:00pm", text: "Bruna K. scheduled by Kênia" },
        { ts: "Jun 1 3:00pm", text: "Bruna CONFIRMED ✅" },
      ]},
    ]},
    { name: "Sound", leader: "Nicole", status: "yellow", positions: [
      { title: "Sound Operator", person: "Victor M.", status: "pending", log: [
        { ts: "Jun 3 11:00am", text: "Victor M. scheduled by Nicole" },
        { ts: "Jun 3 11:05am", text: "WhatsApp sent to Victor" },
      ]},
    ]},
    { name: "Streaming", leader: "Nicole", status: "red", positions: [
      { title: "Stream Operator", person: null, status: "open", log: [
        { ts: "Jun 2 8:00am", text: "Position opened for scheduling" },
        { ts: "Jun 2 8:05am", text: "WhatsApp sent to Maurício" },
        { ts: "Jun 3 8:05am", text: "Maurício DECLINED ❌" },
        { ts: "Jun 3 8:10am", text: "No other available volunteers" },
      ]},
    ]},
  ],
  "Culto Hope (Tuesday)": [
    { name: "Worship Team", leader: "Kênia", status: "green", positions: [
      { title: "Vocal Lead", person: "Cinthia F.", status: "confirmed", log: [
        { ts: "Jun 1 9:00am", text: "Cinthia F. scheduled by Kênia" },
        { ts: "Jun 1 10:00am", text: "Cinthia CONFIRMED ✅" },
      ]},
    ]},
    { name: "Intercession", leader: "Vânia", status: "green", positions: [
      { title: "Intercession Lead", person: "Rosa T.", status: "confirmed", log: [
        { ts: "Jun 1 9:00am", text: "Rosa T. scheduled by Vânia" },
        { ts: "Jun 1 9:30am", text: "Rosa CONFIRMED ✅" },
      ]},
    ]},
  ],
  "Culto Fé (Wednesday)": [
    { name: "Worship Team", leader: "Kênia", status: "yellow", positions: [
      { title: "Vocal Lead", person: "Fábio L.", status: "confirmed", log: [
        { ts: "Jun 2 9:00am", text: "Fábio L. scheduled by Kênia" },
        { ts: "Jun 2 10:00am", text: "Fábio CONFIRMED ✅" },
      ]},
      { title: "Bass Guitar", person: null, status: "open", log: [
        { ts: "Jun 3 9:00am", text: "Position opened for scheduling" },
        { ts: "Jun 4 9:00am", text: "No response after 24hr — alert sent" },
      ]},
    ]},
    { name: "Sound", leader: "Cláudio", status: "green", positions: [
      { title: "Sound Operator", person: "Renata O.", status: "confirmed", log: [
        { ts: "Jun 2 8:00am", text: "Renata O. scheduled by Cláudio" },
        { ts: "Jun 2 8:30am", text: "Renata CONFIRMED ✅" },
      ]},
    ]},
  ],
  "Rocket Youth (Saturday)": [
    { name: "Worship Team", leader: "Kênia", status: "green", positions: [
      { title: "Vocal Lead", person: "Diego P.", status: "confirmed", log: [
        { ts: "Jun 1 3:00pm", text: "Diego P. scheduled by Kênia" },
        { ts: "Jun 1 4:00pm", text: "Diego CONFIRMED ✅" },
      ]},
    ]},
    { name: "Service Experience", leader: "Fabi", status: "red", positions: [
      { title: "Stage Host", person: null, status: "open", log: [
        { ts: "Jun 2 10:00am", text: "Position opened for scheduling" },
        { ts: "Jun 2 10:05am", text: "WhatsApp sent to Larissa M." },
        { ts: "Jun 3 10:05am", text: "Larissa DECLINED ❌" },
        { ts: "Jun 3 10:10am", text: "No other volunteers available" },
      ]},
      { title: "Usher", person: "Gabi S.", status: "confirmed", log: [
        { ts: "Jun 2 11:00am", text: "Gabi S. scheduled by Fabi" },
        { ts: "Jun 2 11:30am", text: "Gabi CONFIRMED ✅" },
      ]},
    ]},
  ],
  "Link (Sunday)": [
    { name: "Lagoinha Kids", leader: "Babi", status: "green", positions: [
      { title: "Teacher — Link", person: "Paula H.", status: "confirmed", log: [
        { ts: "Jun 2 9:00am", text: "Paula H. scheduled by Babi" },
        { ts: "Jun 2 9:30am", text: "Paula CONFIRMED ✅" },
      ]},
      { title: "Assistant Teacher", person: "Igor S.", status: "confirmed", log: [
        { ts: "Jun 2 9:00am", text: "Igor S. scheduled by Babi" },
        { ts: "Jun 2 10:00am", text: "Igor CONFIRMED ✅" },
      ]},
    ]},
  ],
};

const OTHER_SERVICES = [
  { name: "Rocket", leader: "Pr. Andrey", leaderPhone: "18135550010", eligibleCount: 3 },
  { name: "Culto Hope", leader: "Tatiana M.", leaderPhone: "18135550011", eligibleCount: 2 },
  { name: "Legacy", leader: "Pr. Andrey", leaderPhone: "18135550012", eligibleCount: 1 },
];

const SUNDAY_POOL = [
  { name: "Fernanda Oliveira", position: "Sound Operator", service: "Rocket", serviceLeader: "Pr. Andrey", serviceLeaderPhone: "18135550010" },
  { name: "Lucas Martins", position: "Projection", service: "Culto Hope", serviceLeader: "Tatiana M.", serviceLeaderPhone: "18135550011" },
  { name: "Beatriz Costa", position: "Translation", service: "Legacy", serviceLeader: "Pr. Andrey", serviceLeaderPhone: "18135550012" },
];

const MY_SUNDAY_TEAM = [
  { name: "Rafael T.", status: "confirmed" },
  { name: "Maria Souza", status: "pending" },
  { name: "João Silva", status: "declined" },
];

// Training Library dummy data — split by language
const TRAINING_RESOURCES = {
  ministry: "Sound",
  ministryPT: "Som",
  leader: "Cláudio",
  PT: {
    pdfs: [
      { id: 1, title: "POP — Operação do Console no Culto de Domingo", size: "2.4 MB", uploadedBy: "Cláudio", uploadedAt: "10 mai 2026", url: "#" },
      { id: 2, title: "Checklist de Montagem e Desmontagem do PA", size: "890 KB", uploadedBy: "Nicole", uploadedAt: "28 abr 2026", url: "#" },
    ],
    videos: [
      { id: 1, title: "Como Operar o Console em Cultos", channel: "Tech Worship BR", duration: "24:10", url: "https://youtube.com" },
      { id: 2, title: "Guia de In-Ear Monitor para Equipe de Louvor", channel: "Som ao Vivo", duration: "18:05", url: "https://youtube.com" },
    ],
    links: [
      { id: 1, title: "Manual Behringer X32 (PT)", url: "https://example.com", addedBy: "Cláudio" },
      { id: 2, title: "Doc Google — Configuração de Som LTC", url: "https://example.com", addedBy: "Nicole" },
    ],
  },
  EN: {
    pdfs: [
      { id: 3, title: "Sound Board SOP — Sunday Service", size: "2.1 MB", uploadedBy: "Cláudio", uploadedAt: "May 10, 2026", url: "#" },
      { id: 4, title: "In-Ear Monitor Guide for Worship Team", size: "1.1 MB", uploadedBy: "Cláudio", uploadedAt: "Mar 15, 2026", url: "#" },
    ],
    videos: [
      { id: 3, title: "Intro to Live Sound for Beginners", channel: "Worship Tutorials", duration: "18:42", url: "https://youtube.com" },
      { id: 4, title: "Feedback Prevention & Ring-Out Tutorial", channel: "Live Sound Pro", duration: "11:30", url: "https://youtube.com" },
    ],
    links: [
      { id: 3, title: "Behringer X32 Official Manual (EN)", url: "https://example.com", addedBy: "Cláudio" },
    ],
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const STATUS_COLOR = { green: "#2ABFBF", yellow: "#F59E0B", red: "#EF4444", open: "#EF4444", confirmed: "#2ABFBF", declined: "#EF4444", pending: "#F59E0B" };
const STATUS_LABEL = { green: "Fully Staffed", yellow: "Partial", red: "Understaffed", open: "Open", confirmed: "Confirmed", declined: "Declined", pending: "Pending" };

function PrototypeBanner() {
  return (
    <div style={{
      background: "#F59E0B0d",
      border: "1px solid #F59E0B44",
      borderRadius: 8,
      padding: "7px 12px",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 11,
      color: "#F59E0B",
      fontFamily: "'Barlow Condensed', sans-serif",
      letterSpacing: "0.07em",
    }}>
      🚧 PROTOTYPE — Dummy data. Interactions show planned behavior. Real data connects on build.
    </div>
  );
}

function StatusDot({ status, size = 10 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      borderRadius: "50%", background: STATUS_COLOR[status] || "#666",
      flexShrink: 0, boxShadow: `0 0 5px ${STATUS_COLOR[status] || "#666"}66`,
    }} />
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#0f1f1f", border: "1px solid #1e3535",
      borderRadius: 12, padding: "13px 15px", marginBottom: 9, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      color: "#2ABFBF", fontSize: 10, letterSpacing: "0.13em",
      fontFamily: "'Barlow Condensed', sans-serif",
      marginBottom: 8, marginTop: 4,
    }}>{children}</div>
  );
}

// ─── VIEW 1: SENIOR PASTOR COMMAND CENTER ────────────────────────────────────

function SeniorPastorView() {
  const [service, setService] = useState(SERVICES[0]);
  const [expanded, setExpanded] = useState({});
  const [logOpen, setLogOpen] = useState({});

  const toggle = k => setExpanded(e => ({ ...e, [k]: !e[k] }));
  const toggleLog = k => setLogOpen(e => ({ ...e, [k]: !e[k] }));

  // Reset expanded state when service changes
  const handleServiceChange = (val) => {
    setService(val);
    setExpanded({});
    setLogOpen({});
  };

  const ministries = MINISTRIES_BY_SERVICE[service] || [];
  const counts = { green: 0, yellow: 0, red: 0 };
  ministries.forEach(m => counts[m.status]++);

  return (
    <div>
      <PrototypeBanner />
      <SectionLabel>SERVICE / SERVIÇO</SectionLabel>
      <select value={service} onChange={e => handleServiceChange(e.target.value)} style={{
        background: "#0a1a1a", border: "1px solid #1e3535", borderRadius: 8,
        color: "#e0f0f0", padding: "8px 12px", fontSize: 13,
        fontFamily: "'Barlow Condensed', sans-serif", width: "100%", marginBottom: 14,
      }}>
        {SERVICES.map(s => <option key={s}>{s}</option>)}
      </select>

      {/* Summary row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["green","Staffed"],["yellow","Partial"],["red","Critical"]].map(([s,l]) => (
          <div key={s} style={{
            flex: 1, background: "#0f1f1f",
            border: `1px solid ${STATUS_COLOR[s]}33`,
            borderRadius: 10, padding: "9px 0", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: STATUS_COLOR[s], fontFamily: "'Barlow Condensed', sans-serif" }}>{counts[s]}</div>
            <div style={{ fontSize: 10, color: "#6a9c9c", letterSpacing: "0.07em", fontFamily: "'Barlow Condensed', sans-serif" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Ministry cards */}
      {ministries.map((min, mi) => (
        <Card key={mi}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => toggle(`m${mi}`)}>
            <StatusDot status={min.status} size={11} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e0f0f0", fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15 }}>{min.name}</div>
              <div style={{ color: "#6a9c9c", fontSize: 11 }}>Leader: {min.leader}</div>
            </div>
            <div style={{ color: STATUS_COLOR[min.status], fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif" }}>
              {min.positions.filter(p => p.status === "confirmed").length}/{min.positions.length} filled
            </div>
            <span style={{ color: "#2ABFBF", fontSize: 12 }}>{expanded[`m${mi}`] ? "▲" : "▼"}</span>
          </div>

          {expanded[`m${mi}`] && (
            <div style={{ marginTop: 11, borderTop: "1px solid #1a2e2e", paddingTop: 11 }}>
              {min.positions.map((pos, pi) => (
                <div key={pi} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <StatusDot status={pos.status} size={7} />
                    <span style={{ color: "#cce8e8", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif", flex: 1 }}>{pos.title}</span>
                    <span style={{ color: pos.person ? "#e0f0f0" : "#EF4444", fontSize: 12 }}>{pos.person || "UNFILLED"}</span>
                  </div>
                  <button onClick={() => toggleLog(`${mi}-${pi}`)} style={{
                    background: "none", border: "none", color: "#2ABFBF",
                    fontSize: 10, cursor: "pointer", padding: "2px 0",
                    fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em",
                  }}>
                    {logOpen[`${mi}-${pi}`] ? "▲ Hide log" : "▼ Scheduling log"}
                  </button>
                  {logOpen[`${mi}-${pi}`] && (
                    <div style={{
                      background: "#060e0e", borderRadius: 8, padding: "9px 11px",
                      marginTop: 5, borderLeft: "2px solid #1e3535",
                    }}>
                      {pos.log.map((entry, li) => (
                        <div key={li} style={{ display: "flex", gap: 9, marginBottom: li < pos.log.length - 1 ? 5 : 0 }}>
                          <span style={{ color: "#3a6a6a", fontSize: 10, whiteSpace: "nowrap", minWidth: 95, fontFamily: "monospace" }}>{entry.ts}</span>
                          <span style={{ color: "#90b4b4", fontSize: 11 }}>{entry.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── VIEW 2: GROUP LEADER — SUNDAY POOL WHATSAPP ─────────────────────────────

function GroupLeaderView() {
  const [waModal, setWaModal] = useState(null);

  const buildMsg = (person, type) => type === "recruit"
    ? `Oi ${person.serviceLeader}! Estamos precisando de alguém para ${person.position} no domingo. Você consegue perguntar alguém do seu time do ${person.service} se pode nos ajudar dessa vez?`
    : `Oi ${person.serviceLeader}! Temos um novo voluntário interessado em servir em ${person.position}. Você conseguiria treiná-lo durante o serviço do ${person.service}?`;

  return (
    <div>
      <PrototypeBanner />
      <SectionLabel>SUNDAY POOL — VOLUNTEERS FROM OTHER SERVICES</SectionLabel>

      {SUNDAY_POOL.map((person, i) => (
        <Card key={i}>
          <div style={{ marginBottom: 9 }}>
            <div style={{ color: "#e0f0f0", fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15 }}>{person.name}</div>
            <div style={{ color: "#2ABFBF", fontSize: 11, marginTop: 2 }}>{person.position}</div>
            <div style={{ color: "#6a9c9c", fontSize: 11 }}>Service: {person.service} · Leader: {person.serviceLeader}</div>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {[["recruit","Ask leader to recruit","#25D36611","#25D36644","#25D366"],
              ["train","New volunteer training","#2ABFBF11","#2ABFBF44","#2ABFBF"]].map(([type, label, bg, border, color]) => (
              <button key={type} onClick={() => setWaModal({ person, msgType: type })} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: 20, color, fontSize: 11,
                padding: "5px 11px", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>
                📱 {label}
              </button>
            ))}
          </div>
        </Card>
      ))}

      {waModal && (
        <div onClick={() => setWaModal(null)} style={{
          position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 100, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1f1f", border: "1px solid #1e3535",
            borderRadius: 16, padding: 20, width: "100%", maxWidth: 480,
          }}>
            <div style={{ color: "#2ABFBF", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.1em", marginBottom: 11 }}>
              {waModal.msgType === "recruit" ? "ASK LEADER TO RECRUIT" : "REQUEST TRAINING"}
            </div>
            <div style={{
              background: "#060e0e", borderRadius: 10, padding: 13,
              color: "#cce8e8", fontSize: 13, lineHeight: 1.65, marginBottom: 15,
              border: "1px solid #1e3535",
            }}>
              {buildMsg(waModal.person, waModal.msgType)}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <a href={`https://wa.me/${waModal.person.serviceLeaderPhone}?text=${encodeURIComponent(buildMsg(waModal.person, waModal.msgType))}`}
                target="_blank" rel="noreferrer" style={{
                  flex: 1, textAlign: "center", padding: 10,
                  background: "#25D36618", border: "1px solid #25D36644",
                  borderRadius: 10, color: "#25D366", textDecoration: "none",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
                }}>
                Open in WhatsApp
              </a>
              <button onClick={() => setWaModal(null)} style={{
                padding: "10px 15px", background: "none",
                border: "1px solid #1e3535", borderRadius: 10,
                color: "#6a9c9c", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VIEW 3: SCHEDULER VIEW — TWO INNER TABS ─────────────────────────────────

function SchedulerView() {
  const [innerTab, setInnerTab] = useState("schedule");

  return (
    <div>
      <PrototypeBanner />

      {/* Inner tab toggle */}
      <div style={{
        display: "flex", background: "#0a1515", borderRadius: 10,
        padding: 3, marginBottom: 14, border: "1px solid #1e3535",
      }}>
        {[["schedule","📋 Schedule"],["resources","📚 Resources"]].map(([id, label]) => (
          <button key={id} onClick={() => setInnerTab(id)} style={{
            flex: 1, padding: "8px 0",
            background: innerTab === id ? "#2ABFBF22" : "none",
            border: innerTab === id ? "1px solid #2ABFBF55" : "1px solid transparent",
            borderRadius: 8, color: innerTab === id ? "#2ABFBF" : "#6a9c9c",
            cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13, letterSpacing: "0.05em", transition: "all 0.15s",
          }}>
            {label}
          </button>
        ))}
      </div>

      {innerTab === "schedule" && <SchedulePanel />}
      {innerTab === "resources" && <ResourcesPanel />}
    </div>
  );
}

function SchedulePanel() {
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [blastLogged, setBlastLogged] = useState(false);
  const [blastModal, setBlastModal] = useState(false);

  const buildLeaderMsg = s =>
    `Oi ${s.leader}! Estamos com uma posição de Som em aberto no domingo. Você tem alguém do ${s.name} que poderia nos ajudar dessa vez?`;

  return (
    <div>
      <SectionLabel>SOUND — SUNDAY JUNE 8</SectionLabel>

      <SectionLabel>MY SUNDAY TEAM</SectionLabel>
      {MY_SUNDAY_TEAM.map((vol, i) => (
        <Card key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px" }}>
          <StatusDot status={vol.status} size={8} />
          <span style={{ flex: 1, color: "#e0f0f0", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14 }}>{vol.name}</span>
          <span style={{ fontSize: 11, color: STATUS_COLOR[vol.status], fontFamily: "'Barlow Condensed', sans-serif" }}>{STATUS_LABEL[vol.status]}</span>
        </Card>
      ))}

      {!blastLogged ? (
        <button onClick={() => setBlastModal(true)} style={{
          width: "100%", padding: 10, marginTop: 4, marginBottom: 14,
          background: "#0d1f0d", border: "1px solid #25D36633",
          borderRadius: 10, color: "#25D366",
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
          cursor: "pointer", letterSpacing: "0.05em",
        }}>
          📢 Mark: Ministry group WhatsApp posted
        </button>
      ) : (
        <div style={{
          background: "#091509", border: "1px solid #25D36633",
          borderRadius: 10, padding: "8px 13px", marginTop: 4, marginBottom: 14,
          color: "#25D366", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif",
          display: "flex", alignItems: "center", gap: 7,
        }}>
          ✅ Group blast posted — Jun 4 3:15pm · Other services panel unlocked
        </div>
      )}

      {/* GC Accordion */}
      <div onClick={() => setGroupsOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 9,
        background: "#0f1f1f", border: "1px solid #1e3535",
        borderRadius: 12, padding: "12px 15px", cursor: "pointer",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#e0f0f0", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14 }}>Outros Serviços — Backup de Posição</div>
          <div style={{ color: "#6a9c9c", fontSize: 11, marginTop: 2 }}>
            {blastLogged ? "Leaders from other services available for backup" : "Available after your ministry group post"}
          </div>
        </div>
        <span style={{ color: "#2ABFBF", fontSize: 12 }}>{groupsOpen ? "▲" : "▼"}</span>
      </div>

      {groupsOpen && (
        <div style={{
          border: "1px solid #1e3535", borderTop: "none",
          borderRadius: "0 0 12px 12px", padding: "12px 14px", marginBottom: 10,
        }}>
          {OTHER_SERVICES.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: i < OTHER_SERVICES.length - 1 ? 11 : 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#cce8e8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13 }}>{s.name}</div>
                <div style={{ color: "#6a9c9c", fontSize: 11 }}>{s.leader} · {s.eligibleCount} eligible</div>
              </div>
              <a href={blastLogged ? `https://wa.me/${s.leaderPhone}?text=${encodeURIComponent(buildLeaderMsg(s))}` : undefined}
                target={blastLogged ? "_blank" : undefined}
                rel="noreferrer"
                onClick={!blastLogged ? e => e.preventDefault() : undefined}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 10px",
                  background: blastLogged ? "#25D36611" : "#1a2a2a",
                  border: `1px solid ${blastLogged ? "#25D36644" : "#222"}`,
                  borderRadius: 20, color: blastLogged ? "#25D366" : "#3a5a5a",
                  fontSize: 11, textDecoration: "none",
                  cursor: blastLogged ? "pointer" : "not-allowed",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  opacity: blastLogged ? 1 : 0.5,
                }}>
                📱 Ask leader
              </a>
            </div>
          ))}

        </div>
      )}

      {blastModal && (
        <div onClick={() => setBlastModal(false)} style={{
          position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 100, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1f1f", border: "1px solid #1e3535",
            borderRadius: 16, padding: 20, width: "100%", maxWidth: 480,
          }}>
            <div style={{ color: "#e0f0f0", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, marginBottom: 7 }}>Confirm Group Post</div>
            <div style={{ color: "#6a9c9c", fontSize: 13, lineHeight: 1.6, marginBottom: 15 }}>
              Did you post in your ministry WhatsApp group asking for help?
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => { setBlastLogged(true); setBlastModal(false); setGroupsOpen(true); }} style={{
                flex: 1, padding: 10, background: "#25D36618",
                border: "1px solid #25D36644", borderRadius: 10,
                color: "#25D366", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              }}>Yes, I posted</button>
              <button onClick={() => setBlastModal(false)} style={{
                padding: "10px 15px", background: "none",
                border: "1px solid #1e3535", borderRadius: 10,
                color: "#6a9c9c", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESOURCES PANEL ─────────────────────────────────────────────────────────

// Reusable resource list section (pdfs, videos, or links) for one language
function ResourceSection({ lang, section, items, onDelete, onAdd }) {
  const isPT = lang === "PT";

  const labels = {
    pdf:   { PT: { section: "📄 DOCUMENTOS & POPs",        empty: "Nenhum documento ainda. Adicione seu primeiro POP.", add: "+ Adicionar PDF",   modal: "ADICIONAR DOCUMENTO",  upload: "Selecionar arquivo PDF", uploadSub: "Armazenado no Cloudflare R2 · Máx 10MB", save: "Salvar", view: "Abrir" },
              EN: { section: "📄 SOPs & DOCUMENTS",         empty: "No documents yet. Add your first SOP.",            add: "+ Add PDF",         modal: "ADD SOP / DOCUMENT",    upload: "Tap to upload PDF",      uploadSub: "Stored in Cloudflare R2 · Max 10MB",    save: "Upload & Save", view: "View" } },
    video: { PT: { section: "🎬 VÍDEOS DE TREINAMENTO",    empty: "Nenhum vídeo ainda.",                              add: "+ Adicionar Vídeo", modal: "ADICIONAR VÍDEO",       upload: null, uploadSub: null, save: "Salvar", view: null },
              EN: { section: "🎬 TRAINING VIDEOS",           empty: "No training videos yet.",                         add: "+ Add Video",       modal: "ADD TRAINING VIDEO",    upload: null, uploadSub: null, save: "Save",   view: null } },
    link:  { PT: { section: "🔗 LINKS & DOCS EXTERNOS",    empty: "Nenhum link ainda.",                               add: "+ Adicionar Link",  modal: "ADICIONAR LINK",        upload: null, uploadSub: null, save: "Salvar", view: null },
              EN: { section: "🔗 EXTERNAL LINKS & DOCS",    empty: "No links yet.",                                   add: "+ Add Link",        modal: "ADD EXTERNAL LINK",     upload: null, uploadSub: null, save: "Save",   view: null } },
  };

  const L = labels[section][lang];
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", channel: "", duration: "" });

  const handleAdd = () => {
    if (!form.title) return;
    const newId = Date.now();
    const dateStr = isPT ? "5 jun 2026" : "Jun 5, 2026";
    let newItem;
    if (section === "pdf")   newItem = { id: newId, title: form.title, size: "—", uploadedBy: isPT ? "Você" : "You", uploadedAt: dateStr, url: "#" };
    if (section === "video") newItem = { id: newId, title: form.title, channel: form.channel || "—", duration: form.duration || "—", url: form.url || "#" };
    if (section === "link")  newItem = { id: newId, title: form.title, url: form.url || "#", addedBy: isPT ? "Você" : "You" };
    onAdd(section, newItem);
    setForm({ title: "", url: "", channel: "", duration: "" });
    setAddOpen(false);
  };

  const fieldGroups = {
    pdf:   [["title", isPT ? "Título do documento" : "Document title"]],
    video: [["title", isPT ? "Título do vídeo" : "Video title"], ["channel", isPT ? "Canal do YouTube" : "YouTube Channel"], ["duration", isPT ? "Duração (ex: 14:30)" : "Duration (e.g. 14:30)"], ["url", "URL YouTube"]],
    link:  [["title", isPT ? "Nome do link" : "Link name"], ["url", "URL"]],
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <SectionLabel>{L.section}</SectionLabel>
        <button onClick={() => setAddOpen(true)} style={{
          background: "#2ABFBF11", border: "1px solid #2ABFBF44",
          borderRadius: 15, color: "#2ABFBF", fontSize: 10,
          padding: "3px 9px", cursor: "pointer",
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em",
        }}>{L.add}</button>
      </div>

      {items.length === 0 && (
        <div style={{ color: "#3a6060", fontSize: 12, padding: "8px 0", fontFamily: "'Barlow Condensed', sans-serif" }}>{L.empty}</div>
      )}

      {items.map(item => (
        <div key={item.id} style={{
          background: "#0f1f1f", border: "1px solid #1e3535",
          borderRadius: 10, padding: "10px 12px", marginBottom: 7,
          display: "flex", alignItems: "center", gap: 9,
        }}>
          {section === "pdf" && <span style={{ fontSize: 17, flexShrink: 0 }}>📄</span>}
          {section === "video" && (
            <div style={{
              width: 48, height: 34, background: "#EF444418", borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0, border: "1px solid #EF444430",
            }}>▶️</div>
          )}
          {section === "link" && <span style={{ fontSize: 15, flexShrink: 0 }}>🔗</span>}

          <div style={{ flex: 1, minWidth: 0 }}>
            {section === "link"
              ? <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#2ABFBF", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif", textDecoration: "none", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</a>
              : <div style={{ color: "#cce8e8", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
            }
            <div style={{ color: "#3a6a6a", fontSize: 10, marginTop: 2 }}>
              {section === "pdf"   && `${item.size} · ${item.uploadedBy} · ${item.uploadedAt}`}
              {section === "video" && `${item.channel} · ${item.duration}`}
              {section === "link"  && `${isPT ? "Adicionado por" : "Added by"} ${item.addedBy}`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {section === "pdf" && (
              <a href={item.url} target="_blank" rel="noreferrer" style={{
                color: "#2ABFBF", fontSize: 11, textDecoration: "none",
                background: "#2ABFBF11", border: "1px solid #2ABFBF30",
                borderRadius: 11, padding: "3px 7px",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>{L.view}</a>
            )}
            {section === "video" && (
              <a href={item.url} target="_blank" rel="noreferrer" style={{
                color: "#EF4444", fontSize: 10, textDecoration: "none",
                background: "#EF444411", border: "1px solid #EF444430",
                borderRadius: 11, padding: "3px 7px",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>YT</a>
            )}
            <button onClick={() => onDelete(section, item.id, item.title)} style={{
              background: "#EF444411", border: "1px solid #EF444430",
              borderRadius: 11, color: "#EF4444", fontSize: 11,
              padding: "3px 6px", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>✕</button>
          </div>
        </div>
      ))}

      {/* Add modal */}
      {addOpen && (
        <div onClick={() => setAddOpen(false)} style={{
          position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 200, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1f1f", border: "1px solid #1e3535",
            borderRadius: 16, padding: 20, width: "100%", maxWidth: 480,
          }}>
            <div style={{ color: "#2ABFBF", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.1em", marginBottom: 14 }}>
              {L.modal} — {lang}
            </div>
            {section === "pdf" && (
              <div style={{
                border: "2px dashed #1e3535", borderRadius: 10,
                padding: 18, textAlign: "center", marginBottom: 12,
                color: "#4a7a7a", fontFamily: "'Barlow Condensed', sans-serif",
              }}>
                <div style={{ fontSize: 26, marginBottom: 5 }}>📄</div>
                <div style={{ fontSize: 13 }}>{L.upload}</div>
                <div style={{ fontSize: 10, color: "#2a5a5a", marginTop: 3 }}>{L.uploadSub}</div>
              </div>
            )}
            {fieldGroups[section].map(([key, placeholder]) => (
              <input key={key} placeholder={placeholder} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{
                  width: "100%", background: "#0a1515",
                  border: "1px solid #1e3535", borderRadius: 8,
                  color: "#e0f0f0", padding: "9px 11px",
                  fontSize: 13, marginBottom: 9,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  boxSizing: "border-box",
                }} />
            ))}
            <div style={{ display: "flex", gap: 9, marginTop: 4 }}>
              <button onClick={handleAdd} style={{
                flex: 1, padding: 10, background: "#2ABFBF22",
                border: "1px solid #2ABFBF44", borderRadius: 10,
                color: "#2ABFBF", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              }}>{L.save}</button>
              <button onClick={() => setAddOpen(false)} style={{
                padding: "10px 14px", background: "none",
                border: "1px solid #1e3535", borderRadius: 10,
                color: "#6a9c9c", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              }}>{isPT ? "Cancelar" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcesPanel() {
  // "leader" view shows both PT and EN tabs and can add to either
  // In real build, "volunteer" view defaults to their preferred language
  const [langTab, setLangTab] = useState("PT"); // PT | EN
  const [resources, setResources] = useState(TRAINING_RESOURCES);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleAdd = (section, newItem) => {
    setResources(r => ({
      ...r,
      [langTab]: { ...r[langTab], [section + "s"]: [...r[langTab][section + "s"], newItem] },
    }));
  };

  const handleDeleteRequest = (section, id, title) => {
    setDeleteConfirm({ lang: langTab, section, id, title });
  };

  const handleDeleteConfirm = () => {
    const { lang, section, id } = deleteConfirm;
    setResources(r => ({
      ...r,
      [lang]: {
        ...r[lang],
        [section + "s"]: r[lang][section + "s"].filter(item => item.id !== id),
      },
    }));
    setDeleteConfirm(null);
  };

  const cur = resources[langTab];
  const isPT = langTab === "PT";

  // Count items per language to show indicator
  const ptCount = resources.PT.pdfs.length + resources.PT.videos.length + resources.PT.links.length;
  const enCount = resources.EN.pdfs.length + resources.EN.videos.length + resources.EN.links.length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: "#e0f0f0", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 600 }}>
          {isPT ? resources.ministryPT : resources.ministry} — {isPT ? "Recursos" : "Resources"}
        </div>
        <div style={{ color: "#6a9c9c", fontSize: 11, marginTop: 2 }}>
          {isPT ? `Gerenciado por ${resources.leader} · Visível para seus voluntários` : `Managed by ${resources.leader} · Visible to your volunteers`}
        </div>
      </div>

      {/* PT / EN language tab selector */}
      <div style={{
        display: "flex", background: "#0a1515", borderRadius: 10,
        padding: 3, marginBottom: 16, border: "1px solid #1e3535",
      }}>
        {[["PT", `🇧🇷 Português`, ptCount], ["EN", `🇺🇸 English`, enCount]].map(([id, label, count]) => (
          <button key={id} onClick={() => setLangTab(id)} style={{
            flex: 1, padding: "8px 6px",
            background: langTab === id ? "#2ABFBF22" : "none",
            border: langTab === id ? "1px solid #2ABFBF55" : "1px solid transparent",
            borderRadius: 8,
            color: langTab === id ? "#2ABFBF" : "#6a9c9c",
            cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, letterSpacing: "0.04em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.15s",
          }}>
            {label}
            <span style={{
              background: langTab === id ? "#2ABFBF33" : "#1a2e2e",
              borderRadius: 10, padding: "1px 6px",
              fontSize: 10, color: langTab === id ? "#2ABFBF" : "#4a7a7a",
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Volunteer default-language note */}
      <div style={{
        background: "#0a1515", border: "1px solid #1e3535",
        borderRadius: 8, padding: "6px 11px", marginBottom: 14,
        color: "#4a7a7a", fontSize: 10,
        fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.6,
      }}>
        {isPT
          ? "🗣️ Voluntários abrem no idioma preferido. Podem alternar para o outro idioma se precisarem."
          : "🗣️ Volunteers open in their preferred language. They can switch to the other tab if needed."}
      </div>

      {/* The three resource sections for the active language */}
      <ResourceSection lang={langTab} section="pdf"   items={cur.pdfs}   onDelete={handleDeleteRequest} onAdd={handleAdd} />
      <ResourceSection lang={langTab} section="video" items={cur.videos} onDelete={handleDeleteRequest} onAdd={handleAdd} />
      <ResourceSection lang={langTab} section="link"  items={cur.links}  onDelete={handleDeleteRequest} onAdd={handleAdd} />

      {/* Access note */}
      <div style={{
        background: "#0a1515", border: "1px solid #1e3535",
        borderRadius: 10, padding: "8px 12px",
        color: "#3a6060", fontSize: 10,
        fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.6,
      }}>
        {isPT
          ? "🔐 Líderes podem adicionar/editar/excluir · Voluntários veem somente leitura (seus ministérios) · Pastores veem todos"
          : "🔐 Ministry leaders can add/edit/delete · Volunteers see read-only (their ministries only) · Pastors see all ministries"}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{
          position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 200, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1f1f", border: "1px solid #EF444433",
            borderRadius: 16, padding: 20, width: "100%", maxWidth: 480,
          }}>
            <div style={{ color: "#e0f0f0", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, marginBottom: 7 }}>
              {isPT ? "Remover recurso?" : "Remove Resource?"}
            </div>
            <div style={{ color: "#6a9c9c", fontSize: 13, marginBottom: 15 }}>
              "{deleteConfirm.title}" {isPT ? "será removido da biblioteca deste ministério." : "will be removed from this ministry's library."}
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={handleDeleteConfirm} style={{
                flex: 1, padding: 10, background: "#EF444418",
                border: "1px solid #EF444444", borderRadius: 10,
                color: "#EF4444", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              }}>{isPT ? "Remover" : "Remove"}</button>
              <button onClick={() => setDeleteConfirm(null)} style={{
                padding: "10px 14px", background: "none",
                border: "1px solid #1e3535", borderRadius: 10,
                color: "#6a9c9c", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              }}>{isPT ? "Cancelar" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "pastor", label: "Pastor View", emoji: "🏛️" },
  { id: "groupleader", label: "GL Pool", emoji: "👥" },
  { id: "scheduler", label: "Scheduler", emoji: "📋" },
];

const TAB_DESC = {
  pastor: "Pr. Daniel / Pr. Rafa / Pra. Alice — Sunday staffing at a glance with full audit trail",
  groupleader: "Group Leader — Sunday pool with pre-filled WhatsApp messages to GC leaders",
  scheduler: "Ministry Leader — Schedule + Training Library (SOPs, videos, links)",
};

export default function SchedulingPrototype() {
  const [tab, setTab] = useState("pastor");

  return (
    <div style={{ minHeight: "100vh", background: "#060e0e", color: "#e0f0f0", fontFamily: "'Segoe UI', sans-serif", fontSize: 14 }}>
      {/* Header */}
      <div style={{ background: "#091515", borderBottom: "1px solid #1a2e2e", padding: "13px 18px 10px" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "#2ABFBF", marginBottom: 2 }}>
          LAGOINHA TAMPA · LTC SYSTEM
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, fontWeight: 700, color: "#e0f0f0", letterSpacing: "0.04em" }}>
          Scheduling + Training Prototype
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", background: "#091515", borderBottom: "1px solid #1a2e2e", padding: "0 6px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "9px 6px",
            background: "none", border: "none",
            borderBottom: tab === t.id ? "2px solid #2ABFBF" : "2px solid transparent",
            color: tab === t.id ? "#2ABFBF" : "#6a9c9c",
            cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, letterSpacing: "0.06em",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 15 }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <div style={{
        background: "#091515", padding: "7px 18px",
        borderBottom: "1px solid #1a2e2e",
        fontSize: 10, color: "#3a6060",
        fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em",
      }}>
        {TAB_DESC[tab]}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 14px 80px" }}>
        {tab === "pastor" && <SeniorPastorView />}
        {tab === "groupleader" && <GroupLeaderView />}
        {tab === "scheduler" && <SchedulerView />}
      </div>
    </div>
  );
}
