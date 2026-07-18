# PWA & Layout Audit Findings — LTC Ministry Dashboard

**Scope:** `/Users/nicolel/ltc-dashboard` (React 18 + Vite) and `/Users/nicolel/ministry-gifting` (vanilla JS public forms).
**Type:** Read-only investigation. No files were edited. Fixes to be implemented in a separate session.

---

## 1. PWA Infrastructure

### ltc-dashboard

| Item | Status | Detail |
|---|---|---|
| Web app manifest | ❌ Missing | No `manifest.json`/`.webmanifest` anywhere in `public/`, `src/`, or `dist/`. No `<link rel="manifest">` in `index.html`. |
| Service worker | ❌ Missing | No `sw.js`, no Workbox artifacts, no `navigator.serviceWorker.register(...)` call anywhere (checked `src/main.jsx:1-9` — plain `ReactDOM.createRoot` render, nothing else). No offline/caching strategy of any kind. |
| Viewport meta | ✅ Present | `index.html:5` — `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` |
| `theme-color` meta | ❌ Missing | Not present in `index.html`. |
| `apple-mobile-web-app-capable` / related Apple meta tags | ❌ Missing | Not present. Only `apple-touch-icon` link exists (`index.html:7`, 180×180 PNG, confirmed via `file`). |
| Icons | ⚠️ Partial | `public/favicon.png` (32×32) and `public/apple-touch-icon.png` (180×180) exist and are linked (`index.html:6-7`), but there are no maskable/any-purpose icons or the additional sizes (192×192, 512×512) a manifest would need for install prompts / splash screens. |
| `vite-plugin-pwa` or similar | ❌ Not configured | `vite.config.js` only has `@vitejs/plugin-react` and sets `base: '/ltc-dashboard/'`. `package.json` devDependencies: `@vitejs/plugin-react`, `sharp`, `vite` — no PWA plugin installed. Noting as a gap, not proposing to add it here per task scope. |
| Installability (conceptual Lighthouse PWA check) | ❌ Not installable today | Fails on: no manifest (required for `display: standalone`, `name`, `theme_color`, icons), no service worker (required for the installability/offline criteria), no `theme-color` meta as a fallback signal. Viewport meta and HTTPS-served GitHub Pages hosting are the only boxes currently checked. |
| Deploy pipeline | ℹ️ Context | `.github/workflows/deploy.yml` does a plain `npm run build` → `actions/upload-pages-artifact` → GitHub Pages deploy. No manifest/SW generation step exists to hook into if one is added later. |

### ministry-gifting

Six public-facing HTML files: `index.html`, `cafe-form.html`, `confirm.html`, `ministry-leader-form.html`, `new-believer-form.html`, `service-attendance-form.html`.

| Item | Status | Detail |
|---|---|---|
| Web app manifest | ❌ Missing | None of the 6 HTML files link a manifest; no manifest file exists in the repo. |
| Service worker | ❌ Missing | No `sw.js`, no registration code found in any file. |
| Viewport meta | ✅ Present | All 6 files have `<meta name="viewport" content="width=device-width, initial-scale=1.0">` at line 5. |
| `theme-color` meta | ❌ Missing | Not present in any of the 6 files. |
| `apple-mobile-web-app-capable` | ❌ Missing | Not present anywhere. |
| Icons | ❌ None | No favicon/apple-touch-icon links found in any of the 6 files (only inline `LTC1.svg` used as an in-page logo image, not a `<link rel="icon">`). |
| Installability | ❌ Not installable | These are standalone forms (assessment, confirmation, attendance) rather than an app shell — a manifest/SW is arguably lower priority here than for the dashboard, but the complete absence of even basic favicon/theme-color is worth flagging since these are the public-facing pages members interact with directly (often shared via WhatsApp links, per the dashboard's invite flow). |

**Overall PWA gap:** Both repos are currently plain websites with zero PWA affordances — no manifest, no service worker, no installability, no offline behavior, no theme-color branding in the browser chrome/app-switcher. The dashboard has partial icon assets in place (favicon + apple-touch-icon) that a manifest could reuse; ministry-gifting has none.

---

## 2. Layout/Overflow Bugs Found

Each entry: file:line — bug pattern — severity.

### Flex rows with fixed/many children and no `flexWrap` (same pattern as the already-fixed GroupLeaderView bug)

1. **`src/App.jsx:3184`** — `LANGUAGES.map(...)` button row (Portugues / English / Espanol) uses `style={{display:"flex",gap:8}}` with no `flexWrap`. This is the clearest unfixed sibling of the known bug: it sits in the same person-detail panel as `STAGES` (line 3049, already has `flexWrap:"wrap"`) and `PASTOR_SUGGESTIONS` (line 3074, already has `flexWrap:"wrap"`), but was missed. Three buttons with longer labels ("Portugues", "Espanol") in a fixed-width panel. **Severity: breaks on mobile** (narrow viewports, ~375-414px).

2. **`src/App.jsx:3099`** — `CARISMA_OPTIONS.map(...)` button row, same panel, `style={{display:"flex",gap:8}}`, no `flexWrap`. Same pattern as #1, two buttons ("Masters"/"1st Year" style labels). **Severity: breaks on mobile** (narrower risk than #1 since only 2 items, but same missing property in the same component).

3. **`src/App.jsx:7898`** — MinistryLeaderView sub-tab bar (Team/Schedule/Resources), `style={{display:"flex",gap:4,...}}`, no `flexWrap`; tab buttons have `whiteSpace:"nowrap"` (line 7865). Only 3 short labels in English but longer in Portuguese ("Agenda"/"Recursos"). **Severity: edge case** (low risk in English, possible clipping in Portuguese on very narrow screens).

4. **`src/App.jsx:3709` and `src/App.jsx:3720`** — "Add ministry" inline rows combining a `<select>` (has `flex:1`, will shrink) with sibling buttons carrying `whiteSpace:"nowrap"` text ("+ Add Ministry" / "✕"), row itself has no `flexWrap`. The `flex:1` select mitigates most risk, but on very narrow viewports the nowrap button text plus shrunk select can still combine to overflow. **Severity: edge case**.

5. **`src/App.jsx:8528`** — GroupLeaderView `PillBtn` row ("Attending (N)" / "Serving (N)"), `style={{display:"flex",gap:8}}`, no `flexWrap`. Only 2 short pills — unlikely to overflow at common mobile widths, but flagged because it's in the exact component (GroupLeaderView) that had the sibling bug already manually fixed. **Severity: cosmetic**.

All other flex rows surveyed across the file (chip/tag rows for ministries, groups, giftings, role toggles, position-assignment chips, stat-card rows, and header rows — e.g. lines 1891, 4886, 4952, 4999, 5197, 7021, 7490, 9787, 9853) already have `flexWrap:"wrap"` set correctly and are **not** bugs.

### Missing null/optional-chaining guards

6. **`src/App.jsx:8890, 8893, 8894, 8903`** — In `GroupLeaderView`'s `renderPositionArea(area)`:
   - Line 8890: `const positions = area.positions;` — no `?.` and no `|| []` fallback, in direct violation of this codebase's stated convention (`const positions = selectedItem?.positions || [];`).
   - Line 8893: `positions.length === 1 && ...` — throws if `positions` is `undefined`/`null`.
   - Line 8894: `positions.map(...)` inside a `new Set(...)` construction — same risk.
   - Line 8903: `positions.map(pos => renderPositionRow(area, pos))` — same risk.

   This is inconsistent with the sibling function `renderArea` two lines below (line 8910), which correctly guards the same field: `Array.isArray(area?.positions) && area.positions.length > 0`. If `renderPositionArea` is ever invoked with an `area` object whose `.positions` is missing or null (malformed API response, a schema drift mid-fetch, or a future caller that doesn't pre-filter the way `renderArea` does today), this throws `Cannot read properties of undefined (reading 'length')` and would crash the GroupLeaderView schedule section entirely. **Severity: breaks on mobile and desktop alike — this is a crash risk, not a layout/cosmetic issue.**

   All other `useState(null)`-derived selection state checked (`labelPopup`, `ministryPopup`, `modalMinistry`, `pickerPos`, `confirmPopup`, `guestModal`, `conflictInfo`, `refContent`, `person` in `PersonPanel`, and props into `MinistryModal`/`LeaderPersonModal`/`PositionAssignModal`) are properly guarded via `{x && (...)}` JSX gating, early-return `if (!x) return (...)` patterns, or `x?.field` access. `ScheduleInvite.jsx` is fully guarded throughout — it has an explicit header comment (`ScheduleInvite.jsx:9`) stating the null-guard rule and complies with it in every function (`waUrl`, `hasNumber`, `useNeedsAttention`, `InviteSendButton`, `NeedsAttentionBadges`).

### Inconsistent responsive-system usage

7. **`src/App.jsx:10121, 10202, 10273, 10344, 10516, 10627, 10722, 10805`** — `isMobile` (`window.innerWidth < 768`, tracked via a `resize` listener at `10121-10128`) is used **only** at the top-level `AppInner` component, to switch between the desktop nav bar (IntersectionObserver-driven overflow, per the already-fixed nav bug) and a completely separate mobile bottom dock (`MobileDock`). No other component in the file — `GroupLeaderView`, `MinistryLeaderView`, `PeopleTab`, `PersonPanel`, `AgendaTab`, `RecursosTab`, etc. — reads or reacts to `isMobile`; they all rely purely on inline `flexWrap`/`minWidth`/`gridTemplateColumns:"repeat(auto-fill,minmax(...))"` CSS behavior with no JS-driven breakpoint logic. Meanwhile the `<style>` block defines two isolated `@media (min-width: 640px)` rules (`App.jsx:774, 784`, styling around the Settings/dropdown area) and one `prefers-reduced-motion` rule (`App.jsx:873`) — none coordinated with the 768px JS breakpoint.

   **Severity: edge case** — not a crash, but a real inconsistency: three different responsive strategies (JS `isMobile` state at 768px, inline `flexWrap` with no explicit breakpoint, and CSS media queries at 640px) coexist with no shared breakpoint constant. This creates a plausible dead zone in the 640–767px range where the CSS rules have already applied but the JS-driven dock/nav switch hasn't (or vice versa), and is worth resolving with one canonical breakpoint before any broader mobile-responsiveness pass.

8. **`src/App.jsx:774, 784`** — The two `@media (min-width: 640px)` blocks use a breakpoint (640px) that doesn't match the app-wide JS `isMobile` breakpoint (768px, set at `App.jsx:10121`). Any component whose layout depends on both the CSS rule and a parent's `isMobile` state could show a mismatched/inconsistent layout in the 640–767px window. **Severity: edge case** (needs closer verification of exactly which modal these two rules affect, but the breakpoint mismatch itself is confirmed).

---

## Priority Summary (for the next build session)

**High confidence, real bugs — fix first:**
- `App.jsx:8890` — add null guard on `area.positions` in `renderPositionArea` (crash risk, not just cosmetic).
- `App.jsx:3184` and `App.jsx:3099` — add `flexWrap:"wrap"`, matching the sibling rows in the same panel that already have it.

**Worth a look, lower confidence/impact:**
- `App.jsx:7898` sub-tab bar, `App.jsx:8528` PillBtn row, `App.jsx:3709`/`3720` add-ministry rows.

**Architectural note, not a single-line fix:**
- Reconcile the 768px JS `isMobile` breakpoint with the 640px CSS media queries before any broader mobile pass, and decide whether other views should adopt JS-driven responsive logic or stay flexWrap-only.

**PWA infrastructure:**
- Both repos currently have zero PWA affordances (no manifest, no service worker, no theme-color, no installability). This is a from-scratch build, not a bug fix — scope and priority for that work is a separate decision from the layout bugs above.
