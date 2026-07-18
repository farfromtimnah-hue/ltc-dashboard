import React from "react";

// ─── VOLUNTEER SELF-SERVICE VIEW (July 2026) ─────────────────────────────────
// Available to anyone whose own submissions row is status = 'complete',
// regardless of role. Five sections: My Schedule (read only), My Availability
// (block-out dates, with family-wide apply for delegates), My Profile (contact
// fields only - assessment-derived fields are absent from this form entirely),
// My Resources (ministries the person actually serves in), and Family and
// Delegates (spouse delegates, kids accounts, minor_can_self_accept toggle).
// The volunteer-facing decline rule holds everywhere here: nothing in this
// view offers a decline action of any kind.
// NULL GUARD: every property access and .map() is guarded (codebase rule).

const API = "https://ltc-api.farfromtimnah.workers.dev";

const mono = "'JetBrains Mono',monospace";
const grotesk = "'Space Grotesk',sans-serif";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders(token) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// ── Shared UI bits ───────────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <div style={{ fontFamily: mono, fontSize: "10.5px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#5eead4", margin: "0 0 14px" }}>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div className="glass" style={{ padding: "16px 18px", borderRadius: 14, ...(style || {}) }}>
      {children}
    </div>
  );
}

function EmptyNote({ children }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 11.5, color: "#475a64", letterSpacing: "0.04em", padding: "10px 2px" }}>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 9,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
  color: "#e6f1f0", fontFamily: grotesk, fontSize: 13.5, outline: "none",
};

const labelStyle = {
  display: "block", fontFamily: mono, fontSize: 10, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "#6b7a82", margin: "0 0 5px",
};

const primaryBtn = {
  padding: "9px 18px", borderRadius: 9, fontSize: 12.5, fontFamily: mono, fontWeight: 600,
  letterSpacing: "0.04em", border: "1px solid rgba(94,234,212,0.35)",
  background: "rgba(94,234,212,0.1)", color: "#5eead4", cursor: "pointer",
};

const ghostBtn = {
  padding: "7px 14px", borderRadius: 9, fontSize: 12, fontFamily: mono,
  border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)",
  color: "#aebac0", cursor: "pointer",
};

const dangerBtn = {
  padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontFamily: mono,
  border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.07)",
  color: "#f87171", cursor: "pointer",
};

function formatDate(dateStr, lang) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(lang === "EN" ? "en-US" : "pt-BR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// Volunteer-facing status labels. 'declined' rows are filtered out before
// display (leader-side state, not something we surface to the volunteer),
// and no action of any kind is offered on any row - read only by design.
function statusChip(status, lang) {
  const map = {
    confirmed: { pt: "Confirmado", en: "Confirmed", color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.35)" },
    wants_reschedule: { pt: "Outra data solicitada", en: "Another day requested", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.35)" },
    pending_parent_confirm: { pt: "Aguardando responsavel", en: "Awaiting guardian", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.35)" },
  };
  const it = map[status] || { pt: "Aguardando confirmacao", en: "Awaiting confirmation", color: "#8fa3ad", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.12)" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 999, whiteSpace: "nowrap", fontFamily: mono, color: it.color, background: it.bg, border: `1px solid ${it.border}` }}>
      {lang === "PT" ? it.pt : it.en}
    </span>
  );
}

// ── My Schedule ──────────────────────────────────────────────────────────────

function MySchedule({ token, lang }) {
  const [rows, setRows] = React.useState(null);
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    fetch(`${API}/my/schedule`, { headers: authHeaders(token) })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (!cancelled) setRows(Array.isArray(d) ? d.filter(a => a && a.status !== "declined") : []); })
      .catch(() => { if (!cancelled) { setRows([]); setError(true); } });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div>
      <SectionHeading>{lang === "PT" ? "Minha Agenda" : "My Schedule"}</SectionHeading>
      {rows === null && <EmptyNote>...</EmptyNote>}
      {rows !== null && rows.length === 0 && (
        <EmptyNote>{error
          ? (lang === "PT" ? "Nao foi possivel carregar sua agenda." : "Could not load your schedule.")
          : (lang === "PT" ? "Nenhuma escala futura no momento." : "No upcoming serving dates right now.")}</EmptyNote>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(rows || []).map(a => (
          <Card key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: grotesk, fontSize: 15, fontWeight: 600, color: "#e6f1f0", marginBottom: 3 }}>
                  {a.position_name || ""}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#8fa3ad", letterSpacing: "0.04em" }}>
                  {a.ministry || ""}{a.service_name ? ` · ${a.service_name}` : ""}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11.5, color: "#5eead4", marginTop: 6 }}>
                  {formatDate(a.service_date, lang)}
                </div>
              </div>
              {statusChip(a.status, lang)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── My Availability (block-out dates + family-wide apply) ────────────────────

function MyAvailability({ token, lang, me }) {
  const [rows, setRows] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [reason, setReason] = React.useState("");
  // When the person manages someone else's schedule, saving asks: just for
  // me, or for my whole family? null = choice pending (form submitted).
  const [askingScope, setAskingScope] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  const hasFamily = ((me && me.delegates_for) || []).some(d => d && d.status === "complete");

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${API}/my/unavailability`, { headers: authHeaders(token) })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (!cancelled) setRows(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, [token, refresh]);

  function save(applyToFamily) {
    if (busy) return;
    setBusy(true);
    setError(null);
    fetch(`${API}/my/unavailability`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ start_date: start, end_date: end || start, reason: reason || null, apply_to_family: !!applyToFamily }),
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(() => {
        setBusy(false); setAskingScope(false); setStart(""); setEnd(""); setReason("");
        setRefresh(k => k + 1);
      })
      .catch(() => { setBusy(false); setAskingScope(false); setError(lang === "PT" ? "Erro ao salvar. Verifique as datas." : "Could not save. Check the dates."); });
  }

  function handleAdd() {
    if (!start) { setError(lang === "PT" ? "Escolha ao menos a data inicial." : "Pick at least a start date."); return; }
    if (hasFamily) { setAskingScope(true); setError(null); return; }
    save(false);
  }

  function remove(id) {
    fetch(`${API}/my/unavailability/${id}`, { method: "DELETE", headers: authHeaders(token) })
      .then(() => setRefresh(k => k + 1))
      .catch(() => {});
  }

  return (
    <div>
      <SectionHeading>{lang === "PT" ? "Minha Disponibilidade" : "My Availability"}</SectionHeading>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: grotesk, fontSize: 13.5, color: "#aebac0", marginBottom: 12 }}>
          {lang === "PT"
            ? "Marque os dias em que voce nao pode servir. Os lideres verao isso ao montar as escalas."
            : "Mark days you cannot serve. Leaders will see this when building schedules."}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: "1 1 130px" }}>
            <label style={labelStyle}>{lang === "PT" ? "De" : "From"}</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <label style={labelStyle}>{lang === "PT" ? "Ate (opcional)" : "To (optional)"}</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{lang === "PT" ? "Motivo (opcional)" : "Reason (optional)"}</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} style={inputStyle}
            placeholder={lang === "PT" ? "Viagem, ferias..." : "Trip, vacation..."} />
        </div>
        {!askingScope && (
          <button onClick={handleAdd} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.5 : 1 }}>
            {busy ? "..." : (lang === "PT" ? "Adicionar" : "Add")}
          </button>
        )}
        {askingScope && (
          <div>
            <div style={{ fontFamily: grotesk, fontSize: 13.5, color: "#e6f1f0", marginBottom: 10 }}>
              {lang === "PT" ? "Aplicar essas datas para quem?" : "Apply these dates for whom?"}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => save(false)} disabled={busy} style={primaryBtn}>
                {lang === "PT" ? "So para mim" : "Just for me"}
              </button>
              <button onClick={() => save(true)} disabled={busy} style={primaryBtn}>
                {lang === "PT" ? "Para minha familia toda" : "For my whole family"}
              </button>
              <button onClick={() => setAskingScope(false)} disabled={busy} style={ghostBtn}>
                {lang === "PT" ? "Cancelar" : "Cancel"}
              </button>
            </div>
          </div>
        )}
        {error && <div style={{ fontFamily: mono, fontSize: 11, color: "#f87171", marginTop: 10 }}>{error}</div>}
      </Card>
      {rows === null && <EmptyNote>...</EmptyNote>}
      {rows !== null && rows.length === 0 && (
        <EmptyNote>{lang === "PT" ? "Nenhuma data bloqueada." : "No blocked dates yet."}</EmptyNote>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(rows || []).map(r => (
          <Card key={r.id} style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 12, color: "#e6f1f0" }}>
                  {formatDate(r.start_date, lang)}{r.end_date && r.end_date !== r.start_date ? `${lang === "PT" ? " ate " : " to "}${formatDate(r.end_date, lang)}` : ""}
                  {r.is_own !== 1 && r.name ? (
                    <span style={{ marginLeft: 8, fontSize: 10, color: "#93c5fd" }}>({r.name})</span>
                  ) : null}
                </div>
                {r.reason && <div style={{ fontFamily: mono, fontSize: 10.5, color: "#6b7a82", marginTop: 3 }}>{r.reason}</div>}
              </div>
              <button onClick={() => remove(r.id)} style={dangerBtn}>{lang === "PT" ? "Remover" : "Remove"}</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── My Profile (contact fields only) ─────────────────────────────────────────

function MyProfile({ token, lang, me, onSaved }) {
  const [name, setName] = React.useState((me && me.name) || "");
  const [preferred, setPreferred] = React.useState((me && me.preferred_name) || "");
  const [whatsapp, setWhatsapp] = React.useState((me && me.whatsapp) || "");
  const [email, setEmail] = React.useState((me && me.email) || "");
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState(false);

  function save() {
    if (busy) return;
    setBusy(true); setSaved(false); setError(false);
    fetch(`${API}/my/profile`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify({ name, preferred_name: preferred, whatsapp, email }),
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(() => { setBusy(false); setSaved(true); if (onSaved) onSaved(); })
      .catch(() => { setBusy(false); setError(true); });
  }

  return (
    <div>
      <SectionHeading>{lang === "PT" ? "Meu Perfil" : "My Profile"}</SectionHeading>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <div>
            <label style={labelStyle}>{lang === "PT" ? "Nome" : "Name"}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{lang === "PT" ? "Como gosta de ser chamado" : "Preferred name"}</label>
            <input type="text" value={preferred} onChange={e => setPreferred(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={save} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.5 : 1 }}>
              {busy ? "..." : (lang === "PT" ? "Salvar" : "Save")}
            </button>
            {saved && <span style={{ fontFamily: mono, fontSize: 11, color: "#4ade80" }}>{lang === "PT" ? "Salvo!" : "Saved!"}</span>}
            {error && <span style={{ fontFamily: mono, fontSize: 11, color: "#f87171" }}>{lang === "PT" ? "Erro ao salvar" : "Could not save"}</span>}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── My Resources ─────────────────────────────────────────────────────────────

function MyResources({ token, lang }) {
  const [rows, setRows] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch(`${API}/recursos?mine=1`, { headers: authHeaders(token) })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (!cancelled) setRows(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, [token]);

  const byMinistry = {};
  (rows || []).forEach(r => {
    if (!r || !r.ministry) return;
    if (!byMinistry[r.ministry]) byMinistry[r.ministry] = [];
    byMinistry[r.ministry].push(r);
  });
  const ministries = Object.keys(byMinistry);

  return (
    <div>
      <SectionHeading>{lang === "PT" ? "Meus Recursos" : "My Resources"}</SectionHeading>
      {rows === null && <EmptyNote>...</EmptyNote>}
      {rows !== null && ministries.length === 0 && (
        <EmptyNote>{lang === "PT" ? "Nenhum recurso disponivel para seus ministerios ainda." : "No resources available for your ministries yet."}</EmptyNote>
      )}
      {ministries.map(m => (
        <div key={m} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8fa3ad", margin: "0 0 8px" }}>{m}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(byMinistry[m] || []).map(r => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Card style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15 }}>{r.type === "youtube" ? "🎬" : r.type === "pdf_link" ? "📄" : "🔗"}</span>
                    <div>
                      <div style={{ fontFamily: grotesk, fontSize: 13.5, fontWeight: 600, color: "#e6f1f0" }}>{r.title || ""}</div>
                      {r.description && <div style={{ fontFamily: mono, fontSize: 10.5, color: "#6b7a82", marginTop: 2 }}>{r.description}</div>}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Kids placeholder form ────────────────────────────────────────────────────
// Deliberately simple and unscored: a warm handful of age-appropriate
// questions until a real kids assessment is designed. Answers are stored as a
// plain JSON blob (kids_answers) and are NEVER mapped into disc_* or
// gifting_* fields - those belong to the real 60-question instrument only.

const KIDS_QUESTIONS = [
  { key: "likes_helping_with", pt: "O que voce gosta de ajudar a fazer?", en: "What do you like to help with?", type: "choice",
    options: [
      { value: "welcoming_people", pt: "Receber as pessoas", en: "Welcoming people" },
      { value: "music", pt: "Musica", en: "Music" },
      { value: "organizing", pt: "Organizar as coisas", en: "Organizing things" },
      { value: "helping_teachers", pt: "Ajudar os professores", en: "Helping teachers" },
    ] },
  { key: "group_size", pt: "Voce prefere estar com muitas pessoas ou um grupo menor?", en: "Do you like being around lots of people or a smaller group?", type: "choice",
    options: [
      { value: "lots_of_people", pt: "Muitas pessoas", en: "Lots of people" },
      { value: "small_group", pt: "Grupo menor", en: "A smaller group" },
      { value: "both", pt: "Os dois", en: "Both" },
    ] },
  { key: "build_organize_lead", pt: "Voce prefere construir algo, organizar as coisas ou liderar uma atividade em grupo?", en: "Would you rather build something, organize things, or lead a group activity?", type: "choice",
    options: [
      { value: "build", pt: "Construir algo", en: "Build something" },
      { value: "organize", pt: "Organizar as coisas", en: "Organize things" },
      { value: "lead_activity", pt: "Liderar uma atividade", en: "Lead a group activity" },
    ] },
  { key: "talking_in_front", pt: "Voce gosta de falar na frente dos outros?", en: "Do you like talking in front of others?", type: "choice",
    options: [
      { value: "yes", pt: "Sim!", en: "Yes!" },
      { value: "sometimes", pt: "As vezes", en: "Sometimes" },
      { value: "not_really", pt: "Nem tanto", en: "Not really" },
    ] },
  { key: "helping_younger_kids", pt: "Voce gosta de ajudar criancas menores?", en: "Do you like helping younger kids?", type: "choice",
    options: [
      { value: "yes", pt: "Sim!", en: "Yes!" },
      { value: "sometimes", pt: "As vezes", en: "Sometimes" },
      { value: "not_really", pt: "Nem tanto", en: "Not really" },
    ] },
  { key: "happiest_at_church", pt: "O que te deixa mais feliz na igreja?", en: "What makes you happiest at church?", type: "text" },
  { key: "favorite_thing_to_do", pt: "Tem alguma coisa que voce adora fazer?", en: "Anything you really love doing?", type: "text" },
];

function KidsForm({ token, lang, child, onDone, onCancel }) {
  // child: { name, kids_form_token }
  const [answers, setAnswers] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);

  function setAnswer(key, value) {
    setAnswers(a => ({ ...a, [key]: value }));
  }

  function submit() {
    if (busy) return;
    setBusy(true); setError(false);
    fetch(`${API}/kids-form/${encodeURIComponent(child.kids_form_token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(() => { setBusy(false); if (onDone) onDone(); })
      .catch(() => { setBusy(false); setError(true); });
  }

  const answeredAll = KIDS_QUESTIONS.filter(q => q.type === "choice").every(q => !!answers[q.key]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(2,6,10,0.85)", overflowY: "auto", padding: "24px 16px" }}
      onClick={e => { if (e.target === e.currentTarget && onCancel) onCancel(); }}>
      <div className="glass" style={{ maxWidth: 520, margin: "0 auto", borderRadius: 18, padding: "24px 22px" }}>
        <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5eead4", marginBottom: 6 }}>
          {lang === "PT" ? "Formulario Kids" : "Kids Form"}
        </div>
        <div style={{ fontFamily: grotesk, fontSize: 18, fontWeight: 700, color: "#e6f1f0", marginBottom: 4 }}>
          {lang === "PT" ? `Oi, ${(child && child.name) || ""}!` : `Hi, ${(child && child.name) || ""}!`}
        </div>
        <div style={{ fontFamily: grotesk, fontSize: 13.5, color: "#aebac0", marginBottom: 18 }}>
          {lang === "PT"
            ? "Queremos te conhecer melhor! Responda essas perguntinhas do seu jeito."
            : "We want to get to know you! Answer these little questions your own way."}
        </div>
        {KIDS_QUESTIONS.map(q => (
          <div key={q.key} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: grotesk, fontSize: 14, fontWeight: 600, color: "#e6f1f0", marginBottom: 8 }}>
              {lang === "PT" ? q.pt : q.en}
            </div>
            {q.type === "choice" ? (
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {(q.options || []).map(o => (
                  <button key={o.value} onClick={() => setAnswer(q.key, o.value)}
                    style={{
                      ...ghostBtn,
                      ...(answers[q.key] === o.value ? { border: "1px solid rgba(94,234,212,0.5)", background: "rgba(94,234,212,0.12)", color: "#5eead4" } : {}),
                    }}>
                    {lang === "PT" ? o.pt : o.en}
                  </button>
                ))}
              </div>
            ) : (
              <input type="text" value={answers[q.key] || ""} onChange={e => setAnswer(q.key, e.target.value)} style={inputStyle} />
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20 }}>
          <button onClick={submit} disabled={busy || !answeredAll} style={{ ...primaryBtn, opacity: busy || !answeredAll ? 0.5 : 1 }}>
            {busy ? "..." : (lang === "PT" ? "Enviar" : "Send")}
          </button>
          {onCancel && (
            <button onClick={onCancel} style={ghostBtn}>{lang === "PT" ? "Depois" : "Later"}</button>
          )}
          {error && <span style={{ fontFamily: mono, fontSize: 11, color: "#f87171" }}>{lang === "PT" ? "Erro ao enviar" : "Could not send"}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Family and Delegates ─────────────────────────────────────────────────────

function FamilyDelegates({ token, lang, me, onChanged }) {
  const [spouseSearch, setSpouseSearch] = React.useState("");
  const [spouseResults, setSpouseResults] = React.useState([]);
  const [addingSpouse, setAddingSpouse] = React.useState(false);
  const [addingChild, setAddingChild] = React.useState(false);
  const [childName, setChildName] = React.useState("");
  const [childDob, setChildDob] = React.useState("");
  const [childLang, setChildLang] = React.useState(lang === "EN" ? "EN" : "PT");
  const [childEmail, setChildEmail] = React.useState("");
  const [kidsFormChild, setKidsFormChild] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  const delegatesFor = (me && me.delegates_for) || [];
  const managedBy = (me && me.managed_by) || [];

  React.useEffect(() => {
    if (!addingSpouse || spouseSearch.trim().length < 2) { setSpouseResults([]); return; }
    let cancelled = false;
    const tid = setTimeout(() => {
      fetch(`${API}/my/delegate-search?q=${encodeURIComponent(spouseSearch.trim())}`, { headers: authHeaders(token) })
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(d => { if (!cancelled) setSpouseResults(Array.isArray(d) ? d : []); })
        .catch(() => { if (!cancelled) setSpouseResults([]); });
    }, 300);
    return () => { cancelled = true; clearTimeout(tid); };
  }, [spouseSearch, addingSpouse, token]);

  function addSpouse(person, direction) {
    // direction 'they_manage_me' -> delegate_id = them; 'i_manage_them' -> principal_id = them
    if (busy || !person) return;
    setBusy(true); setError(null);
    const body = direction === "they_manage_me" ? { delegate_id: person.id } : { principal_id: person.id };
    fetch(`${API}/my/delegates`, { method: "POST", headers: jsonHeaders(token), body: JSON.stringify(body) })
      .then(r => (r.ok ? r.json() : r.json().then(d => Promise.reject(d && d.error))))
      .then(() => { setBusy(false); setAddingSpouse(false); setSpouseSearch(""); setSpouseResults([]); if (onChanged) onChanged(); })
      .catch(msg => { setBusy(false); setError(typeof msg === "string" && msg ? msg : (lang === "PT" ? "Erro ao adicionar" : "Could not add")); });
  }

  function addChild() {
    if (busy || !childName.trim()) return;
    setBusy(true); setError(null);
    fetch(`${API}/my/children`, {
      method: "POST", headers: jsonHeaders(token),
      body: JSON.stringify({ name: childName.trim(), date_of_birth: childDob || null, language: childLang, email: childEmail.trim() || null }),
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        setBusy(false); setAddingChild(false);
        const created = { name: childName.trim(), kids_form_token: d && d.kids_form_token };
        setChildName(""); setChildDob(""); setChildEmail("");
        if (created.kids_form_token) setKidsFormChild(created);
        if (onChanged) onChanged();
      })
      .catch(() => { setBusy(false); setError(lang === "PT" ? "Erro ao criar a conta" : "Could not create the account"); });
  }

  function toggleMcsa(rel) {
    fetch(`${API}/my/delegates/${rel.id}`, {
      method: "PUT", headers: jsonHeaders(token),
      body: JSON.stringify({ minor_can_self_accept: rel.minor_can_self_accept === 1 ? 0 : 1 }),
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(() => { if (onChanged) onChanged(); })
      .catch(() => {});
  }

  function removeSpouse(rel) {
    fetch(`${API}/my/delegates/${rel.id}`, { method: "DELETE", headers: authHeaders(token) })
      .then(() => { if (onChanged) onChanged(); })
      .catch(() => {});
  }

  const typeLabel = t2 => t2 === "parent_guardian"
    ? (lang === "PT" ? "Responsavel" : "Parent or guardian")
    : (lang === "PT" ? "Conjuge" : "Spouse");

  return (
    <div>
      <SectionHeading>{lang === "PT" ? "Familia e Delegados" : "Family and Delegates"}</SectionHeading>

      {managedBy.length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ ...labelStyle, marginBottom: 8 }}>{lang === "PT" ? "Quem cuida da minha agenda" : "Who manages my schedule"}</div>
          {managedBy.map(rel => (
            <div key={rel.id} style={{ fontFamily: grotesk, fontSize: 13.5, color: "#e6f1f0", padding: "4px 0" }}>
              {rel.name || ""} <span style={{ fontFamily: mono, fontSize: 10, color: "#6b7a82" }}>({typeLabel(rel.delegate_type)})</span>
            </div>
          ))}
        </Card>
      )}

      <Card style={{ marginBottom: 14 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>{lang === "PT" ? "Agendas que eu cuido" : "Schedules I manage"}</div>
        {delegatesFor.length === 0 && (
          <EmptyNote>{lang === "PT" ? "Voce ainda nao cuida da agenda de ninguem." : "You do not manage anyone's schedule yet."}</EmptyNote>
        )}
        {delegatesFor.map(rel => (
          <div key={rel.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontFamily: grotesk, fontSize: 13.5, fontWeight: 600, color: "#e6f1f0" }}>{rel.name || ""}</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#6b7a82", marginLeft: 8 }}>({typeLabel(rel.delegate_type)})</span>
                {rel.status === "draft" && rel.assessment_type === "kids_basic" && (
                  <span style={{ fontFamily: mono, fontSize: 10, color: "#f59e0b", marginLeft: 8 }}>
                    {lang === "PT" ? "formulario pendente" : "form pending"}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {rel.status === "draft" && rel.kids_form_token && (
                  <button style={primaryBtn} onClick={() => setKidsFormChild({ name: rel.name, kids_form_token: rel.kids_form_token })}>
                    {lang === "PT" ? "Abrir formulario" : "Open form"}
                  </button>
                )}
                {rel.delegate_type === "spouse_manager" && (
                  <button style={dangerBtn} onClick={() => removeSpouse(rel)}>{lang === "PT" ? "Remover" : "Remove"}</button>
                )}
              </div>
            </div>
            {rel.delegate_type === "parent_guardian" && rel.status === "complete" && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={rel.minor_can_self_accept === 1} onChange={() => toggleMcsa(rel)} />
                <span style={{ fontFamily: mono, fontSize: 10.5, color: "#8fa3ad", letterSpacing: "0.03em" }}>
                  {lang === "PT"
                    ? "Deixar a crianca responder primeiro (voce ainda confirma depois)"
                    : "Let the child respond first (you still confirm afterward)"}
                </span>
              </label>
            )}
          </div>
        ))}
      </Card>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button style={primaryBtn} onClick={() => { setAddingSpouse(s => !s); setAddingChild(false); setError(null); }}>
          {lang === "PT" ? "Adicionar conjuge" : "Add spouse"}
        </button>
        <button style={primaryBtn} onClick={() => { setAddingChild(c => !c); setAddingSpouse(false); setError(null); }}>
          {lang === "PT" ? "Adicionar filho(a)" : "Add child"}
        </button>
      </div>
      {error && <div style={{ fontFamily: mono, fontSize: 11, color: "#f87171", marginBottom: 10 }}>{error}</div>}

      {addingSpouse && (
        <Card style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{lang === "PT" ? "Buscar pelo nome" : "Search by name"}</label>
          <input type="text" value={spouseSearch} onChange={e => setSpouseSearch(e.target.value)} style={inputStyle}
            placeholder={lang === "PT" ? "Nome do seu conjuge..." : "Your spouse's name..."} />
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {(spouseResults || []).map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "6px 0" }}>
                <span style={{ fontFamily: grotesk, fontSize: 13.5, color: "#e6f1f0" }}>{p.name || ""}</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button style={ghostBtn} disabled={busy} onClick={() => addSpouse(p, "they_manage_me")}>
                    {lang === "PT" ? "Cuida da minha agenda" : "Manages my schedule"}
                  </button>
                  <button style={ghostBtn} disabled={busy} onClick={() => addSpouse(p, "i_manage_them")}>
                    {lang === "PT" ? "Eu cuido da agenda" : "I manage their schedule"}
                  </button>
                </div>
              </div>
            ))}
            {spouseSearch.trim().length >= 2 && spouseResults.length === 0 && (
              <EmptyNote>{lang === "PT" ? "Ninguem encontrado." : "No one found."}</EmptyNote>
            )}
          </div>
        </Card>
      )}

      {addingChild && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: grotesk, fontSize: 13, color: "#aebac0", marginBottom: 12 }}>
            {lang === "PT"
              ? "Crie a conta do seu filho ou filha (8 a 12 anos) para servir no Link. Depois de criar, entregue o aparelho para a crianca responder o formulario."
              : "Create your child's account (ages 8 to 12) to serve with Link. After creating it, hand the device to your child to answer the form."}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
            <div>
              <label style={labelStyle}>{lang === "PT" ? "Nome da crianca" : "Child's name"}</label>
              <input type="text" value={childName} onChange={e => setChildName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{lang === "PT" ? "Data de nascimento (opcional)" : "Date of birth (optional)"}</label>
              <input type="date" value={childDob} onChange={e => setChildDob(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{lang === "PT" ? "Idioma" : "Language"}</label>
              <div style={{ display: "flex", gap: 6 }}>
                {["PT", "EN"].map(l => (
                  <button key={l} onClick={() => setChildLang(l)}
                    style={{ ...ghostBtn, ...(childLang === l ? { border: "1px solid rgba(94,234,212,0.5)", color: "#5eead4" } : {}) }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{lang === "PT" ? "Email para login (opcional)" : "Login email (optional)"}</label>
              <input type="email" value={childEmail} onChange={e => setChildEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <button onClick={addChild} disabled={busy || !childName.trim()} style={{ ...primaryBtn, opacity: busy || !childName.trim() ? 0.5 : 1 }}>
                {busy ? "..." : (lang === "PT" ? "Criar conta" : "Create account")}
              </button>
            </div>
          </div>
        </Card>
      )}

      {kidsFormChild && (
        <KidsForm token={token} lang={kidsFormChild ? (childLang || lang) : lang} child={kidsFormChild}
          onDone={() => { setKidsFormChild(null); if (onChanged) onChanged(); }}
          onCancel={() => setKidsFormChild(null)} />
      )}
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────────────────
// Reachable two ways, both through the existing viewMode pattern in AppInner:
// the member_portal role renders it as their whole app, and every other role
// with a complete linked submission can switch to it via the view switcher
// ('volunteer_view').

export const VOLUNTEER_SECTIONS = [
  { id: "my_schedule", pt: "Agenda", en: "Schedule" },
  { id: "availability", pt: "Disponibilidade", en: "Availability" },
  { id: "my_profile", pt: "Perfil", en: "Profile" },
  { id: "resources", pt: "Recursos", en: "Resources" },
  { id: "family", pt: "Familia", en: "Family" },
];

export default function VolunteerView({ token, lang, activeSection, onSectionChange }) {
  const [me, setMe] = React.useState(null);
  const [meState, setMeState] = React.useState("loading"); // loading | ok | none
  const [meRefresh, setMeRefresh] = React.useState(0);
  const [ownSection, setOwnSection] = React.useState("my_schedule");
  const section = activeSection || ownSection;
  const setSection = onSectionChange || setOwnSection;

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${API}/me`, { headers: authHeaders(token) })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        if (cancelled) return;
        setMe(d);
        setMeState(d && d.eligible ? "ok" : "none");
      })
      .catch(() => { if (!cancelled) setMeState("none"); });
    return () => { cancelled = true; };
  }, [token, meRefresh]);

  if (meState === "loading") {
    return <div style={{ padding: 32 }}><EmptyNote>...</EmptyNote></div>;
  }
  if (meState === "none") {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <div className="glass" style={{ display: "inline-block", padding: "28px 26px", borderRadius: 16, maxWidth: 380 }}>
          <div style={{ fontFamily: grotesk, fontSize: 15, color: "#e6f1f0", fontWeight: 600, marginBottom: 8 }}>
            {lang === "PT" ? "Perfil de voluntario nao encontrado" : "No volunteer profile found"}
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: "#6b7a82", lineHeight: 1.6 }}>
            {lang === "PT"
              ? "Seu login ainda nao esta ligado a uma avaliacao concluida. Fale com a lideranca."
              : "Your login is not linked to a completed assessment yet. Talk to your leadership."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", maxWidth: 720, margin: "0 auto" }}>
      {!activeSection && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
          {VOLUNTEER_SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              style={{
                ...ghostBtn,
                ...(section === s.id ? { border: "1px solid rgba(94,234,212,0.5)", background: "rgba(94,234,212,0.1)", color: "#5eead4" } : {}),
              }}>
              {lang === "PT" ? s.pt : s.en}
            </button>
          ))}
        </div>
      )}
      {section === "my_schedule" && <MySchedule token={token} lang={lang} />}
      {section === "availability" && <MyAvailability token={token} lang={lang} me={me} />}
      {section === "my_profile" && <MyProfile token={token} lang={lang} me={me} onSaved={() => setMeRefresh(k => k + 1)} />}
      {section === "resources" && <MyResources token={token} lang={lang} />}
      {section === "family" && <FamilyDelegates token={token} lang={lang} me={me} onChanged={() => setMeRefresh(k => k + 1)} />}
    </div>
  );
}
