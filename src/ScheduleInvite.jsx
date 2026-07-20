import React from "react";

// ─── SCHEDULE INVITE + NEEDS-ATTENTION ───────────────────────────────────────
// Since the 2026-07-19 WAHA cutover, "Send invite" first attempts the
// automated WhatsApp send (POST /schedule/:id/send-invite). When that fails
// (WAHA down/unconfigured, or the person has a delegate - delegate routing
// only exists in the manual flow), the button surfaces a secondary
// "Send manually" action that runs the original generate-invite-link flow:
// the Worker returns a confirm link + pre-filled message and WhatsApp opens
// for the human to tap send. The public link offers only confirm or a soft
// reschedule request - there is no volunteer-facing decline in this flow.
// NULL GUARD: every property access and .map() is guarded (codebase rule).

const API = "https://ltc-api.farfromtimnah.workers.dev";

function waUrl(message, whatsapp) {
  const digits = (whatsapp || "").replace(/\D/g, "");
  const text = encodeURIComponent(message || "");
  // No number on file: fall back to the generic wa.me share link.
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

function hasNumber(whatsapp) {
  return ((whatsapp || "").replace(/\D/g, "")).length > 0;
}

// Poll-free fetch of GET /schedule/needs-attention, mapped by assignment_id.
// refreshKey bumps re-fetch after an invite is generated or status changes.
export function useNeedsAttention(token, refreshKey) {
  const [byId, setById] = React.useState({});
  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${API}/schedule/needs-attention`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : { items: [] }))
      .then(d => {
        if (cancelled) return;
        const map = {};
        ((d && d.items) || []).forEach(it => {
          if (it && it.assignment_id !== null && it.assignment_id !== undefined) map[it.assignment_id] = it;
        });
        setById(map);
      })
      .catch(() => { if (!cancelled) setById({}); });
    return () => { cancelled = true; };
  }, [token, refreshKey]);
  return byId;
}

// Send-invite button for a schedule_assignments row. Hidden once the
// volunteer has answered (confirmed / wants_reschedule) or was declined by a
// leader. Primary tap: WAHA auto-send (no WhatsApp window). If the Worker
// answers { sent: false } (WAHA down, unconfigured, delegate routing needed)
// or the request fails, a secondary "Send manually" button appears and runs
// the manual link flow: generate the invite link, then open WhatsApp
// immediately via a hidden anchor's click() (preserves the user-gesture
// chain), before calling onSent - onSent can remount this component without
// interrupting the already-triggered anchor click.
export function InviteSendButton({ assignmentId, status, inviteSentAt, person, token, lang, onSent }) {
  const anchorRef = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [noNumber, setNoNumber] = React.useState(false);
  const [error, setError] = React.useState(null);
  // WAHA cutover (2026-07-19): sentOk flashes after a successful auto-send;
  // wahaFail holds the failure reason and switches on the manual fallback.
  const [sentOk, setSentOk] = React.useState(false);
  const [wahaFail, setWahaFail] = React.useState(null);
  // Delegate routing (July 2026): when the Worker routed the actionable
  // invite to a delegate, it also returns an informational notice for the
  // principal. One user gesture can only open one WhatsApp window, so the
  // notice becomes a second explicit button the leader taps right after.
  const [notice, setNotice] = React.useState(null);
  const [routedName, setRoutedName] = React.useState(null);

  if (status === "confirmed" || status === "wants_reschedule" || status === "declined") return null;
  if (assignmentId === null || assignmentId === undefined) return null;

  const personLang = person && person.language === "EN" ? "EN" : "PT";
  const alreadySent = !!inviteSentAt;

  const tx = {
    send:     lang === "PT" ? "Enviar convite" : "Send invite",
    resend:   lang === "PT" ? "Reenviar" : "Resend",
    sending:  "...",
    noNumber: lang === "PT" ? "Numero nao encontrado para esta pessoa" : "No number found for this person",
    noPerm:   lang === "PT" ? "Sem permissao" : "No permission",
    failed:   lang === "PT" ? "Erro ao gerar convite" : "Could not generate invite",
    notice:   lang === "PT" ? "Enviar aviso" : "Send notice",
    viaDelegate: lang === "PT" ? "via" : "via",
    sentOk:   lang === "PT" ? "Enviado ✓" : "Sent ✓",
    autoFailed: lang === "PT" ? "Envio automatico indisponivel" : "Auto-send unavailable",
    manualBtn:  lang === "PT" ? "Enviar manualmente" : "Send manually",
  };

  // Primary path: WAHA auto-send. The Worker either sends for real and stamps
  // the row ({ sent: true }), or reports { sent: false, reason } without
  // touching the assignment - in which case we offer the manual fallback.
  function handleClick() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setSentOk(false);
    setWahaFail(null);
    fetch(`${API}/schedule/${assignmentId}/send-invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 403) throw new Error("403");
        return r.json().catch(() => ({})).then(d => ({ httpOk: r.ok, d }));
      })
      .then(({ httpOk, d }) => {
        setBusy(false);
        if (httpOk && d && d.sent === true) {
          setSentOk(true);
          if (onSent) onSent();
          return;
        }
        // sent:false (WAHA down / unconfigured / delegate routing) or any
        // non-403 HTTP failure: keep it calm, offer the manual flow.
        setWahaFail((d && d.reason) || (d && d.error) || "request_failed");
      })
      .catch(e => {
        setBusy(false);
        if (e && e.message === "403") setError(tx.noPerm);
        else setWahaFail("network_error");
      });
  }

  // Fallback path: the original manual link flow, unchanged.
  function handleManual() {
    if (busy) return;
    setBusy(true);
    setError(null);
    fetch(`${API}/schedule/${assignmentId}/generate-invite-link`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 403) throw new Error("403");
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(d => {
        setBusy(false);
        setWahaFail(null);
        const info = { message: (d && d.message) || "", whatsapp: (d && d.whatsapp) || null };
        setNoNumber(!hasNumber(info.whatsapp));
        setNotice(d && d.notice && d.notice.message && hasNumber(d.notice.whatsapp) ? d.notice : null);
        setRoutedName(d && d.routed_to === "delegate" ? (d.delegate_name || null) : null);
        if (anchorRef.current) {
          anchorRef.current.href = waUrl(info.message, info.whatsapp);
          anchorRef.current.click();
        }
        if (onSent) onSent();
      })
      .catch(e => {
        setBusy(false);
        setError(e && e.message === "403" ? tx.noPerm : tx.failed);
      });
  }

  const mainBtnStyle = {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999,
    fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap",
    border: alreadySent ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(94,234,212,0.3)",
    background: alreadySent ? "rgba(255,255,255,0.03)" : "rgba(94,234,212,0.08)",
    color: alreadySent ? "#6b7a82" : "#5eead4",
    cursor: busy ? "default" : "pointer", opacity: busy ? 0.5 : 1, transition: "all 0.15s",
  };
  const langTag = (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      color: personLang === "EN" ? "#93c5fd" : "#86efac",
    }}>{personLang}</span>
  );

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      <a ref={anchorRef} href="#" target="_blank" rel="noopener noreferrer" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
      <button onClick={e => { e.stopPropagation(); handleClick(); }} aria-busy={busy} style={mainBtnStyle}>
        {busy ? tx.sending : (alreadySent ? tx.resend : tx.send)}
        {langTag}
      </button>
      {sentOk && (
        <span style={{ fontSize: 9.5, color: "#34d399", fontFamily: "'JetBrains Mono',monospace" }}>{tx.sentOk}</span>
      )}
      {wahaFail && (
        <>
          <span title={wahaFail} style={{ fontSize: 9.5, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace", fontStyle: "italic" }}>
            {tx.autoFailed}
          </span>
          <button onClick={e => { e.stopPropagation(); handleManual(); }} aria-busy={busy} style={{
            padding: "2px 8px", borderRadius: 999, fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
            border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.1)",
            color: "#f59e0b", cursor: busy ? "default" : "pointer", opacity: busy ? 0.5 : 1, whiteSpace: "nowrap",
          }}>
            {tx.manualBtn}
          </button>
        </>
      )}
      {routedName && (
        <span style={{ fontSize: 9, color: "#93c5fd", fontFamily: "'JetBrains Mono',monospace" }}>
          {tx.viaDelegate} {routedName}
        </span>
      )}
      {notice && (
        <a href={waUrl(notice.message, notice.whatsapp)} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            padding: "2px 8px", borderRadius: 999, fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
            border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.1)",
            color: "#f59e0b", cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none", display: "inline-block",
          }}>
          {tx.notice} {notice.language === "EN" ? "EN" : "PT"}
        </a>
      )}
      {noNumber && (
        <span style={{ fontSize: 9.5, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace", fontStyle: "italic" }}>{tx.noNumber}</span>
      )}
      {error && (
        <span style={{ fontSize: 9.5, color: "#f87171", fontFamily: "'JetBrains Mono',monospace", fontStyle: "italic" }}>{error}</span>
      )}
    </span>
  );
}

// Needs-attention indicators for one assignment row:
//   reschedule_requested - prominent violet chip, dashboard-only alert, the
//     leader arranges a new day outside this system for now. No WhatsApp button.
//   reminder - amber clock with tooltip + one-tap wa.me reminder send using
//     the filled reminder text in the person's language.
//   escalation - red clock with tooltip. Dashboard alert only, no button.
export function NeedsAttentionBadges({ item, lang }) {
  if (!item || !Array.isArray(item.flags) || item.flags.length === 0) return null;

  const tx = {
    resched:      lang === "PT" ? "Quer outra data!" : "Wants another day!",
    reschedTip:   lang === "PT" ? "Pediu para servir em outro dia. Encontre uma nova data com essa pessoa." : "Asked to serve on a different day. Arrange a new date with this person.",
    remindTip:    lang === "PT" ? "Sem resposta ha mais de 24 horas" : "No response for over 24 hours",
    remindBtn:    lang === "PT" ? "Lembrar" : "Remind",
    escalateTip:  lang === "PT" ? "Sem resposta ha mais de 48 horas" : "No response for over 48 hours",
  };

  const hasResched = item.flags.indexOf("reschedule_requested") !== -1;
  const hasReminder = item.flags.indexOf("reminder") !== -1;
  const hasEscalation = item.flags.indexOf("escalation") !== -1;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {hasResched && (
        <span title={tx.reschedTip} style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
          background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.5)",
          color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap",
          boxShadow: "0 0 8px rgba(167,139,250,0.35)",
        }}>{tx.resched}</span>
      )}
      {hasEscalation ? (
        <span title={tx.escalateTip} style={{ fontSize: 12, color: "#f87171", cursor: "help", filter: "drop-shadow(0 0 3px rgba(248,113,113,0.6))" }}>🕐</span>
      ) : hasReminder ? (
        <span title={tx.remindTip} style={{ fontSize: 12, color: "#f59e0b", cursor: "help", filter: "drop-shadow(0 0 3px rgba(245,158,11,0.6))" }}>🕐</span>
      ) : null}
      {hasReminder && item.reminder_message && (
        <a href={waUrl(item.reminder_message, item.whatsapp)} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          title={tx.remindTip}
          style={{
            padding: "2px 8px", borderRadius: 999, fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
            border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.1)",
            color: "#f59e0b", cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none", display: "inline-block",
          }}>
          {tx.remindBtn} {item.language === "EN" ? "EN" : "PT"}
        </a>
      )}
    </span>
  );
}
