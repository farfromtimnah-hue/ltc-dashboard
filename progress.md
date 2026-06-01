# LTC Dashboard — Design Implementation Progress Log

> **Purpose:** Recovery log for future sessions. Summarises what is done, what changed, where assets live, and what (if anything) remains. Update after each meaningful milestone.

---

## Project Overview

| Item | Value |
|---|---|
| Repo | https://github.com/farfromtimnah-hue/ltc-dashboard |
| Framework | React 18 + Vite |
| Primary source file | `src/App.jsx` (~1600 lines — all CSS, constants, and JSX in one file) |
| API | `https://ltc-api.farfromtimnah.workers.dev` — **do not change** |
| Design reference | `/tmp/ltc-handoff/design_handoff_ltc_dashboard/` (ZIP handoff from Claude Design) |

---

## Design System Tokens (implemented in `css` constant at top of `src/App.jsx`)

```
--bg-0: #050a10        --bg-1: #08121a       --bg-2: #0c1a24
--surface: rgba(14,26,36,0.55)               --surface-2: rgba(20,36,48,0.62)
--border: rgba(94,234,212,0.07)              --border-strong: rgba(94,234,212,0.18)
--border-soft: rgba(255,255,255,0.04)
--teal: #5eead4        --teal-2: #2dd4bf     --teal-deep: #0d9488
--text: #e6f1f0        --text-2: #aebac0     --text-3: #6b7a82   --text-4: #475a64
--danger: #f87171      --warn: #f59e0b       --ok: #34d399        --info: #60a5fa
```

**Typography stack:**
- Display / headings — `Space Grotesk` (700)
- Body / UI — `Inter`
- Micro-labels / mono data — `JetBrains Mono`

**Global CSS classes available (defined in `css` constant):**
- `.glass` — backdrop-blur surface with teal border
- `.glass::before` — top-shimmer gradient
- `.glow-hover` — teal border + shadow on hover
- `.glow-active` — persistent teal glow
- `.display` — Space Grotesk 700
- `.mono` — JetBrains Mono
- `.micro` — JetBrains Mono, 10.5px, uppercase, letter-spacing 0.18em
- `.btn-primary` — teal gradient button
- `.btn-ghost` — subtle bordered button
- `.chip-pill` — pill badge (variants: `.teal`, `.warn`, `.danger`, `.ok`, `.info`)
- `.nav` — sticky header surface
- `.drawer-panel` — animated slide-in
- `.modal-panel` — animated scale-in

---

## Logo Assets

### LTC1.svg — Full church logo
- **File location:** `/Users/nicolel/ltc-dashboard/public/LTC1.svg`
- **Source:** Copied from `~/Library/Mobile Documents/com~apple~CloudDocs/Lagoinha/LTC1.svg`
- **Used in:** App shell nav header — `<img src="/LTC1.svg" alt="Lagoinha Tampa" style={{height:32,...}} />`
- **Component:** Inside the `App` function, inside the `.nav` sticky header, in the brand cluster div

### LTC2.svg — Circle icon
- **File location:** `/Users/nicolel/ltc-dashboard/public/LTC2.svg`
- **Source:** Copied from `~/Library/Mobile Documents/com~apple~CloudDocs/Lagoinha/LTC2.svg`
- **Used in:** Login screen — `<img src="/LTC2.svg" alt="LTC" style={{width:60,height:60,...}} />`
- **Component:** Inside the `Login` function, wrapped in a circular white-plate div with teal glow shadow, positioned above the glass sign-in card

### Carisma logo — ⚠️ DO NOT TOUCH
- **Implementation:** Base64-encoded SVG data URL embedded directly as `const CARISMA_LOGO = "data:image/svg+xml;base64,..."` on **line 6** of `src/App.jsx`
- **Used in two places:**
  1. `CarismaBadge` component — renders small maroon badges next to person names on cards and in the drawer header
  2. `PersonPanel` drawer — Carisma section header (14×14px icon next to label) and inside active Carisma level buttons (13×13px icon)
- **Status: LEFT EXACTLY AS-IS.** Colors, size, placement, and the `CARISMA_LOGO` constant were not modified.

---

## Files Changed

| File | What changed |
|---|---|
| `src/App.jsx` | All visual styling — see detail below |
| `public/LTC1.svg` | Created (copied from iCloud) |
| `public/LTC2.svg` | Created (copied from iCloud) |
| `.gitignore` | Created — excludes `node_modules/`, `dist/`, `package-lock.json` |

---

## Implementation Detail by Component

### `css` constant (global styles)
- Full design token system via CSS custom properties
- Body: deep space radial-gradient atmosphere + fixed starfield overlay via `body::before`
- `.glass` panel system with `backdrop-filter: blur(22px) saturate(140%)`
- Complete typography classes, scrollbar, input/button/chip styles
- Keyframe animations: `drawerSlide`, `modalIn`, `shake`

### `Login` component
- Backdrop glow halo (radial gradient orb behind the card)
- LTC2.svg on a circular white-plate with teal glow box-shadow
- Glass card with top accent line gradient
- Space Grotesk h1, JetBrains Mono field labels, `.btn-primary` sign-in button
- "Connected" indicator in JetBrains Mono with teal dot

### `SettingsModal` component
- `.glass.modal-panel` with top accent line
- JetBrains Mono section header + Space Grotesk title
- Variables hint chip block
- `.btn-ghost` Cancel + `.btn-primary` Save footer

### App nav (inside `App` function)
- `.nav` sticky header with backdrop-blur
- LTC1.svg brand logo (height:32)
- Vertical divider → JetBrains Mono "PASTORAL DASHBOARD" label
- Tab buttons: JetBrains Mono, active = teal underline glow line
- PT/EN segmented toggle with teal active gradient
- `.btn-ghost` settings and logout buttons

### `PersonPanel` (drawer)
- Backdrop: separate `<div onClick={onClose}>` with `blur(6px)` overlay
- Panel: `.drawer-panel` slide animation, glass gradient, teal left border glow
- Top accent line: teal gradient with `boxShadow` glow
- Sticky header: Space Grotesk name, teal avatar placeholder, green-gradient WA button, email link
- **Stage section:** Status-color gradient active buttons with matching glow shadow
- **Pastor section:** Teal active buttons; custom input field
- **Ministry Load section:** Teal pill chips with × remove; `.btn-primary` Add, `.btn-ghost` Cancel
- **Carisma section:** JetBrains Mono header with `CARISMA_LOGO` img; maroon active button tones; Carisma logo in active button — all untouched
- **Languages section:** Teal active buttons
- **Special Groups section:** Teal active buttons
- **Gifting Profile section:** Pill chips with `#1/#2/#3` rank in mono; glass bar chart with gradient fills + top-score glow
- **Notes section:** Inherited input/textarea styles; `.btn-primary` save; teal left border on each note, teal author name

### `PersonCard`
- `.glass.glow-hover` card class
- `borderLeft: 3px solid stageColor` left accent
- Space Grotesk name, teal avatar placeholder
- Stage + ministry-load chips as pills with matching color
- Gifting chips as pills (teal #1, muted #2/#3)
- Lang/group pills in muted/teal styles
- Green-gradient WA button

### `PlacedCard`
- `.glass.glow-hover` card class
- `borderTop: 2px solid rgba(94,234,212,0.5)`
- Teal checkmark badge (absolute top-right)
- Space Grotesk name, teal avatar placeholder
- Teal pill ministry chips
- Green-gradient WA button

### `AnalyticsTab`
- Space Grotesk 40px KPI numbers on `.glass` cards with colored `borderTop`
- JetBrains Mono section headers (all panels)
- Pipeline funnel: gradient bar fills, muted track
- Top Giftings: teal gradient bars with glow
- Language Split: teal / blue bars
- Weekly sparkline: gradient fill bars

### `PeopleTab`
- Active/Placed toggle: JetBrains Mono pill buttons with teal active gradient
- Filters: inherited global input/select styles
- Split Assignments button: JetBrains Mono, teal ghost style
- Split modal: `.glass` card with top accent line, ratio toggle buttons, `.btn-primary`/`.btn-ghost`

### `GiftingTab`
- JetBrains Mono intro label
- Gifting tile grid: teal gradient active tiles with glow

### `MinistryHealthTab`
- Under-construction banner: borderRadius:10, amber left accent
- KPI cards: Space Grotesk 40px numbers on `.glass` with colored `borderTop`
- Ministry cards: `.glass.glow-hover`, Space Grotesk name, pill status chips

---

## Color Migration (completed — zero old values remain)

| Old | New |
|---|---|
| `#2ABFBF` (primary teal) | `#5eead4` |
| `rgba(42,191,191,*)` | `rgba(94,234,212,*)` |
| `#4DD4D4` (secondary teal) | `#5eead4` or `#4cb6c8` |
| `#505050` (muted text) | `#6b7a82` (`--text-3`) |
| `#999` (muted text) | `#aebac0` (`--text-2`) or `#6b7a82` |
| `#252525` (border) | `rgba(255,255,255,0.04)` |
| `#1C1C1C` (surface) | glass surface via `.glass` or `rgba(8,16,22,0.6)` |
| `#141414` (surface) | glass surface via `.glass` |
| `#F0F0F0` (text) | `#e6f1f0` (`--text`) |
| `#0A0A0A` (bg) | `#050a10` (`--bg-0`) |
| `Barlow Condensed` / `Barlow` fonts | `Space Grotesk` (display), `JetBrains Mono` (micro), `Inter` (body) |
| `borderRadius: 2/3/4` (squared) | `borderRadius: 8/10/12/999` (rounded/pill) |

---

## Absolute Implementation Rules (carry forward to all future sessions)

1. **Do NOT change any JavaScript functions, logic, fetch() calls, or API endpoints**
2. **Do NOT change text content, labels, or copy**
3. **Do NOT add or remove screens, buttons, or form fields**
4. **Do NOT change `id=` attributes used by JavaScript**
5. **The Carisma logo (`CARISMA_LOGO` base64 constant, `CarismaBadge` component, and all its usages) must remain exactly as-is — no restyling, no removal, no replacement**
6. **LTC1.svg is the full church logo — use only in nav/header**
7. **LTC2.svg is the circle icon — use only on login screen**
8. **Do not generate or substitute any fake church branding**
9. **Visual/design-layer changes only: colors, surfaces, typography, spacing, shadows, blur, borders**

---

## Remaining Work

As of the last commit (`d867361`), the design implementation is **complete**. All components, all tabs, all drawer sections, and all cards have been updated to the new design system. No old color values (`#2ABFBF`, `#505050`, `#252525`, `#1C1C1C`, `#F0F0F0`, Barlow) remain in the file.

**Potential future polish (not required, not started):**
- Micro-animations on KPI numbers (count-up on load)
- Responsive mobile layout refinement (currently optimised for tablet/desktop)
- Loading skeleton states for cards (currently shows text "Loading…")
- Empty state illustrations

---

## Commit History

| Commit | Description |
|---|---|
| `820aa83` | Initial file upload |
| `3bd4839` | Update App.jsx (pre-redesign edits) |
| `28d79a9` | Visual redesign: glassmorphism style (Session 1 baseline) |
| `d867361` | Complete design system: cards, tabs, all drawer sections (Session 2 final) |
| `3df2a05` | Add progress.md — design implementation recovery log |
| `8852aea` | Session 3: Logo fix + fidelity corrections (analytics, health, giftings) |

---

## Session 3 — Fidelity Correction Pass (Complete)

### Issues identified

#### 1. Logo asset broken in live build
- **Root cause:** `vite.config.js` has `base: '/ltc-dashboard/'` for GitHub Pages. Assets in `public/` are served at `/ltc-dashboard/LTC1.svg` in production, but JSX references them as `/LTC1.svg` (domain root). This breaks on any non-root deployment.
- **Fix:** Replace `/LTC1.svg` → `` `${import.meta.env.BASE_URL}LTC1.svg` `` and same for LTC2.
- **Files are present** in `public/` — no file movement needed, only reference fix.

#### 2. Analytics fidelity gaps
| Element | Current | Handoff target |
|---|---|---|
| KPI cards | Solid `borderTop` color strip | Left-top angled gradient line from color; no border-top |
| Funnel section | Simple labelled bars | Two-col: numbered stage rows left + SegmentRing concentric arc right |
| Top Giftings | Horizontal bars | Donut/ring SVG + legend list |
| Weekly chart | Block column bars | SVG area/line chart with data points |
| Languages | Basic bars | Gradient bars with glow; flag icons |

#### 3. Ministry Health fidelity gaps
| Element | Current | Handoff target |
|---|---|---|
| Health cards | Simple linear progress bar | RadialGauge SVG arc + MIN/IDEAL/GAP metric row |
| Card left accent | None | `borderLeft: 2px solid statusColor` |
| Critical card | No special treatment | Extra glow shadow |
| Banner | Basic pill-border | Icon-box (36×36 rounded square) + gradient background |

#### 4. Gifting tab fidelity gaps
| Element | Current | Handoff target |
|---|---|---|
| Intro strip | Plain micro header | Teal-bordered strip with gradient bg, count chip |
| Tiles | Flat glass button | Icon-box (38×38), footer section w/ count + arrow, min-height 110px |
| People panel | None shown | Glass panel w/ header, person rows w/ initials avatar |

### SVG components being added to App.jsx
- `MiniSpark` — sparkline polyline for KPI cards
- `Donut` — multi-segment donut ring for top giftings
- `SegmentRing` — concentric arcs for connection funnel visualization
- `AreaChart` — SVG line+area chart for weekly trend
- `RadialGauge` — arc gauge for ministry health cards

---

## How to Run Locally

```bash
cd /Users/nicolel/ltc-dashboard
npm install --cache /tmp/npm-cache   # use if npm cache has permission issues
npm run dev
```

### Session 3 — What was completed

#### Logo fix ✅
- **Root cause confirmed:** `vite.config.js` has `base: '/ltc-dashboard/'`. Assets in `public/` are served at `/ltc-dashboard/LTC*.svg` in production but were referenced as `/LTC*.svg` (domain root) — broken on GitHub Pages.
- **Fix applied:** Both references now use `` `${import.meta.env.BASE_URL}LTC2.svg` `` and `` `${import.meta.env.BASE_URL}LTC1.svg` ``
- **LTC1.svg** — nav header, line 2069 of `src/App.jsx`
- **LTC2.svg** — login screen circle mark, line 534 of `src/App.jsx`
- **Carisma logo** — `CARISMA_LOGO` base64 constant at line 6, used in `CarismaBadge` component and drawer Carisma section. **Left completely untouched.**

#### SVG chart primitives added to `src/App.jsx` ✅
Five pure-JSX SVG components inserted before `AnalyticsTab`:
| Component | Purpose |
|---|---|
| `MiniSpark` | Polyline sparkline for KPI card top-right corner |
| `Donut` | Multi-segment ring chart for top giftings breakdown |
| `SegmentRing` | Concentric arc rings for connection funnel visualization |
| `AreaChart` | SVG line+area chart for weekly sign-up trend |
| `RadialGauge` | Arc gauge for ministry health cards |

#### AnalyticsTab fidelity corrections ✅
| Element | Before | After |
|---|---|---|
| KPI cards | Solid `borderTop` strip | Left-top gradient line from color; 52px Space Grotesk number; `MiniSpark` in top-right |
| Connection Funnel | Simple labelled bars (single column) | Two-col: numbered badge + gradient bar rows left; `SegmentRing` concentric arcs right; conversion % center label |
| Top Giftings | Horizontal bars list | `Donut` SVG ring + legend list with color dot, icon, name, count |
| Weekly chart | Block column bars | `AreaChart` SVG with line, area fill, data point circles, week labels |
| Languages | Plain bars | Gradient bars with glow + flag emoji + percentage |
| Section headers | JetBrains Mono micro only | Space Grotesk display title + JetBrains Mono subtitle |

#### MinistryHealthTab fidelity corrections ✅
| Element | Before | After |
|---|---|---|
| Dev banner | Emoji + pill border | Icon-box (36×36 rounded square) + horizontal gradient background |
| KPI cards | Solid `borderTop` strip | Left-top gradient line + `MiniSpark` (matches analytics) |
| Health cards | Linear progress bar only | `RadialGauge` SVG arc + MIN/IDEAL/GAP metric row |
| Card accent | None | `borderLeft: 2px solid statusColor` |
| Critical cards | No distinction | Extra depth shadow glow |
| Status chips | Plain pill | JetBrains Mono, dot prefix (● Critical / ● Needs Volunteers) |

#### GiftingTab fidelity corrections ✅
| Element | Before | After |
|---|---|---|
| Intro strip | Plain micro label | Teal left-border strip, gradient bg, gift count |
| Tiles | Simple glass button | Icon-box (38×38 rounded square), min-height 110px, footer row with count + arrow, `.glow-active` on selected |
| People section header | Inline name + count | Glass panel with DISPONÍVEIS PARA header, icon, Space Grotesk title, teal pill count chip |
| People rows | Full `PersonCard` | Compact rows: initials avatar, name + ministry count + pastor, WA button; click opens drawer |

#### Files changed in Session 3
- `src/App.jsx` — logo refs, 5 chart components, AnalyticsTab, GiftingTab, MinistryHealthTab
- `progress.md` — this file

#### Remaining work
None identified. All three screens match the Claude Design handoff fidelity targets. Product structure, navigation, workflows, and all functionality are unchanged.

#### Next-session notes
- If a new visual pass is needed, reference the design handoff at `/tmp/ltc-handoff/design_handoff_ltc_dashboard/`
- All SVG chart components are self-contained in `src/App.jsx` — no external chart library
- The `ministryHealthStatus` helper still uses three status levels: Critical (`< min`), Needs Volunteers (`< ideal`), Healthy (`>= ideal`)
- `MINISTRY_HEALTH_DATA` is static mock data — future work could wire it to the API

_Last updated: 2026-05-27 — Session 3 complete._

---

## Session 4 — Login Logo Cleanup + Full Localization Pass

### Objective
Two-part cleanup pass:
1. Remove decorative wrapper from LTC2.svg on login screen
2. Full static UI localization — ensure all app chrome switches correctly with the PT/EN toggle; default language is Portuguese

### Constraints respected
- No structural changes
- No feature additions or removals
- No workflow changes
- No backend logic changes
- No data model changes
- No language-selection logic changes (how person language is stored, how templates are selected, how cards reflect `person.language`)
- Carisma logo (`CARISMA_LOGO` constant, `CarismaBadge`, all usages) left completely untouched
- Proper names preserved: Carisma, Legacy, Rocket, Culto Hope, Culto Fé, Link, Shine, Hero, Pra Alice, Pr Rafa, LTC Ministry

### Files changed
- `src/App.jsx` — all changes
- `progress.md` — this file

### What was corrected

#### 1. Login logo (LTC2.svg) ✅
- **Before:** LTC2.svg was placed inside a circular white radial-gradient `<div>` with teal glow box-shadow — a decorative badge/disc wrapper
- **After:** `<img>` displayed directly on the page background, no wrapper div, no added circle, plate, or glow container
- Size preserved at 84×84px; placement unchanged

#### 2. L dictionary — new keys added ✅
Added 32 new translation keys to both `L.PT` and `L.EN` blocks:

| Key | PT | EN |
|---|---|---|
| `cancel` | Cancelar | Cancel |
| `noContact` | Sem contato | No contact |
| `loginTitle` | Painel do Pastor | Pastor Dashboard |
| `loginDesc` | Entre para acessar… | Sign in to access… |
| `loginPasswordLabel` | Senha do Painel | Dashboard Password |
| `loginEnter` | Acessar Painel | Enter Dashboard |
| `loginChecking` | Verificando... | Checking... |
| `loginConnected` | ● Conectado | ● Connected |
| `loginInternal` | v2.4 · Interno | v2.4 · Internal |
| `loginTagline` | Um espaço seguro… | A safe place… |
| `loginErrorPw` | Senha incorreta. | Incorrect password. |
| `loginErrorConn` | Erro de conexão… | Connection error… |
| `statusHealthy` | Saudável | Healthy |
| `statusNeeds` | Precisa de Voluntários | Needs Volunteers |
| `statusCritical` | Crítico | Critical |
| `moreGiftings` | a mais | more |
| `gifts` | DONS | GIFTS |
| `conversion` | Conversão | Conversion |
| `mapped` | mapeados | mapped |
| `funnelDesc` | Caminho do voluntário… | Volunteer journey… |
| `donutDesc` | Distribuição entre… | Distribution across… |
| `weeklyDesc` | Volume de novas… | New sign-ups per week… |
| `addMinistry` | Adicionar | Add |
| `selectMinistry` | Selecionar ministério… | Select ministry… |
| `typeMinistry` | Digitar nome do ministério… | Type ministry name… |
| `addBtn` | + Adicionar | + Add |
| `selectCustom` | Digitar personalizado… | Type custom… |
| `volunteers` | VOLUNTÁRIOS | VOLUNTEERS |
| `availableVars` | Variáveis Disponíveis | Available Variables |

#### 3. New display-mapping constants ✅
Added `LANGUAGE_DISPLAY` (Inglês/Português/Ambos vs English/Português/Both) and `SPECIAL_GROUP_PT` (English Service → Culto em Inglês, Other → Outro; proper names preserved) constants.

#### 4. Login component ✅
- Added `lang` and `t` to props destructure; uses `tt = t || L["PT"]` fallback
- All 9 hardcoded English strings replaced with `tt.*` keys
- Error messages now localize correctly

#### 5. AnalyticsTab ✅
- Added `lang` to props destructure (was passed from App but not destructured — causing all `t.lang` checks to be undefined/always-false → always showing English descriptions)
- Fixed 3 occurrences of `t.lang==="PT"` → `lang==="PT"`
- Funnel stage labels now show localized stage names
- Donut legend gifting names now localize via `GIFTING_PT`
- "more" → `t.moreGiftings`
- "Conversão" center label → `t.conversion`
- `centerLabel="mapeados"` → `centerLabel={t.mapped}`
- All section descriptions use L dict keys

#### 6. GiftingTab ✅
- Tile labels now use `GIFTING_PT[g]||g` in PT mode
- Results panel heading uses localized gifting name
- "DONS" / "GIFTS" count label now switches correctly

#### 7. PersonCard ✅
- Added `lang` prop
- Stage chip now uses `STAGE_LABEL[lang][person.stage]` — was always showing raw English value
- "No contact" fallback → `t.noContact`
- "Available" badge label → `t.available`

#### 8. PlacedCard ✅
- Added `lang` prop (wired for future use; `ministryLabel` already handles `person.language`)

#### 9. PeopleTab ✅
- Passes `lang` to both `PersonCard` and `PlacedCard`
- Stage filter `<option>` display now uses `STAGE_LABEL[lang][o]`
- Gifting filter options display via `GIFTING_PT` in PT
- Language filter options display via `LANGUAGE_DISPLAY` (Both → Ambos in PT)
- Group filter options display via `SPECIAL_GROUP_PT` (English Service → Culto em Inglês; proper names kept)
- Split modal Cancel button → `t.cancel`

#### 10. PersonPanel ✅
- Ministry badge "Available" → `t.available`
- Ministry chip display now uses `ministryLabel(m, lang, person.language)` instead of hardcoded `"EN"`
- "+ Add" button → `t.addBtn`
- "Select ministry…" option → `t.selectMinistry`
- Ministry dropdown options display in UI language via `ministryLabel(m, lang, lang)`
- "Type custom…" option → `t.selectCustom`
- "Add" buttons in ministry selector → `t.addMinistry`
- "Type ministry name…" placeholder → `t.typeMinistry`
- Language toggle buttons display via `LANGUAGE_DISPLAY` (Inglês/Ambos in PT)

#### 11. MinistryHealthTab ✅
- Status chip now uses `status.label` from `ministryHealthStatus()` to distinguish all three states (Critical, Needs Volunteers, **Healthy**) — previously Healthy cards incorrectly showed "Needs Volunteers"
- All three status labels now localize via `t.statusCritical` / `t.statusHealthy` / `t.statusNeeds`
- "VOLUNTÁRIOS" / "VOLUNTEERS" label → `t.volunteers`

#### 12. SettingsModal ✅
- Added `lang` prop
- "Settings" micro-label → `t.settings`
- "Variáveis Disponíveis" hardcoded PT heading → `t.availableVars`
- "Cancel" button → `t.cancel`

#### 13. AreaChart ✅
- Added `noDataMsg` prop with default; AnalyticsTab passes `t.noData`

#### 14. App main ✅
- `SettingsModal` call now passes `lang` prop

### Backend / language-selection logic — confirmed untouched ✅
- `buildWhatsAppURL` — unchanged; still uses `person.language` to select template
- `giftingLabel(name, personLang)` — unchanged; still uses person's preferred language
- `ministryLabel` function — unchanged; logic preserved
- `STAGES`, `STAGE_LABEL` — unchanged; internal keys remain English (required for API compatibility)
- `LANGUAGES` — unchanged; stored values remain "English", "Português", "Both"
- `SPECIAL_GROUPS` — unchanged; stored values remain English keys
- All `updateConnection` calls — unchanged
- All `fetch()` calls — unchanged
- All filter logic using stored values — unchanged (only display layer translated)

### Carisma logo — confirmed untouched ✅
- `CARISMA_LOGO` base64 constant — unchanged (line 6)
- `CarismaBadge` component — unchanged
- All usages in PersonCard, PlacedCard, PersonPanel — unchanged

### LTC2.svg correction confirmed ✅
- Wrapper `<div>` with circular background, radial-gradient, and glow box-shadow **removed**
- `<img src="...LTC2.svg">` now renders directly on the page background at 84×84px
- No new decorative elements added around it

### Portuguese is the default UI language ✅
- `const [lang, setLang] = useState("PT")` in App — unchanged default
- All new L.PT keys provide complete Portuguese translations
- Login screen (shown before toggle is accessible) now fully localizes from the L.PT default

### Proper names preserved ✅
Carisma, Legacy, Rocket, Culto Hope, Culto Fé, Link, Shine, Hero — all unchanged in display and in stored values

### Remaining work
None identified. All static UI text now switches correctly with PT/EN toggle. Product structure, navigation, workflows, and all data-driven behavior are unchanged.

### Next-session notes
- The `executeSplit` done message (shown after split assignment completes) contains mixed EN/PT shorthand ("English → Pra Alice", "PT → Pr Rafa") — this is a technical status message, left intentionally as-is since it references proper names and shorthand that are unambiguous in both languages
- `timeAgo` helper returns English relative times ("2h ago", "3d ago") — left as-is; it is dynamic data-driven output, not static UI chrome
- All SVG chart components are still self-contained in `src/App.jsx`

_Last updated: 2026-05-27 — Session 4 complete._

---

## Session 5 — DISC Assessment, Draft/Resume, Dashboard Expansion

### Objective
Major system expansion across three layers:
1. **D1 database** — 17 new columns on submissions table
2. **Cloudflare Worker v5** — POST /draft, GET /resume/:token, expanded POST /submit, analytics
3. **Assessment app (index.html)** — DISC questions, calibration, preferred name, draft system, Saiba Mais modals
4. **Dashboard (App.jsx)** — DISC labels on cards, Reference tab, DISC/leadership/emotional analytics

### D1 Schema — new columns added (17 total)

```sql
preferred_name TEXT
full_name TEXT
status TEXT DEFAULT 'complete'
resume_token TEXT
calibration_score REAL
disc_d INTEGER
disc_i INTEGER
disc_s INTEGER
disc_c INTEGER
disc_primary TEXT
disc_secondary TEXT
natural_strength TEXT
leadership_tendency TEXT
emotional_profile TEXT
pairing_labels TEXT    -- JSON array
ministry_fit TEXT      -- JSON array
pastoral_flag INTEGER DEFAULT 0
```

### Worker v5 (deployed as ltc-api v5)

New endpoints:
- `POST /draft` — saves partial state, returns resume token
- `GET /resume/:token` — retrieves saved draft by token

Modified endpoints:
- `POST /submit` — accepts all 17 new fields; updates draft if resume_token present
- `GET /people` — filters `status='complete' OR status IS NULL` to not break old records
- `GET /analytics` — added `byDisc`, `byLeadership`, `byEmotional` arrays

New helpers: `num()`, `flt()`, `arr()`, `flag()` to prevent undefined-to-bind D1 issues.

### Assessment app (index.html) changes

#### New questions (59 total)
- 2 calibration questions (CA1, CA2) — anchor/bias detection
- 45 original gifting questions
- 12 DISC questions (3 per dimension D/I/S/C)

#### New screens and flows
- Preferred name screen (between welcome and assessment)
- Continue Later button during assessment (saves draft via POST /draft)
- Resume banner on welcome screen (restores from localStorage token)

#### DISC scoring and derivation
- `calcCalibration()` — returns 0-1 float from CA1/CA2 answers
- `calcDisc()` — returns {D,I,S,C} raw scores (3-15 range)
- `deriveDISC(d,i,s,c)` — returns primary/secondary type, natural_strength, leadership_tendency, emotional_profile, pairing_labels (JSON), ministry_fit (JSON), pastoral_flag

Portuguese DISC names: Executor (D), Comunicador (I), Planejador (S), Analista (C)
— NEVER use D/I/S/C letters as labels

#### New UI elements
- Saiba Mais modals on top-3 gift cards
- Carisma Level 5 confirmation modal
- DISC profile card in results (discSection div)
- full_name field in contact form

### Dashboard (App.jsx) changes

#### New constants
- `DISC_TYPE` — PT and EN name maps (Executor/Comunicador/Planejador/Analista, Driver/Influencer/Supporter/Analyst)
- `DISC_COLORS` — D:#f87171, I:#f59e0b, S:#34d399, C:#60a5fa
- `REFERENCE` — bilingual JS constant with DISC type guide, strengths, leadership, watch-outs, calibration guide, how-to-read items

#### PersonCard and PlacedCard
- Shows `preferred_name || name` as display name
- DISC type badge (colored, labeled with Portuguese name)
- Amber ★ badge if `pastoral_flag == 1`

#### PersonPanel
- Shows `preferred_name || name` in drawer header
- New DISC Profile section: primary/secondary type badges, natural_strength, leadership_tendency, emotional_profile, ministry_fit tags, pastoral_flag indicator
- CARISMA_LEVELS expanded to `["1 Ano", "1st Year", "Masters", "Level 5"]`

#### AnalyticsTab
- DISC distribution panel (horizontal bars with DISC_COLORS)
- Leadership tendency distribution panel
- Emotional profile distribution panel
- All three panels are conditional (only render if API returns data)

#### ReferenceTab
- New Reference tab in nav
- DISC type cards (one per D/I/S/C): description, strengths chips, leadership style, watch-out box
- Calibration score guide (75%+, 50-74%, <50% tiers)
- How-to-read profile guide (5 bullets)

#### L dictionary additions
12 new keys in both PT and EN: `discProfile`, `discType`, `naturalStr`, `leadership`, `emotional`, `pairing`, `ministryFit`, `pastoralAlert`, `discDist`, `byLeadership`, `byEmotional`, `reference`

### Critical rules carried forward
- Portuguese default; English toggle
- DISC labels: always Executor/Comunicador/Planejador/Analista (never D/I/S/C)
- No em dashes or en dashes in any user-facing string
- Visual design frozen: teal #5eead4, dark background, Space Grotesk / JetBrains Mono fonts
- D1: never pass undefined to bind(); always use null; always JSON.stringify arrays
- iOS Safari: addEventListener at bottom of body; IIFE closures for dynamic buttons
- CARISMA_LOGO base64 constant on line 6 of App.jsx — do not touch

### Carisma levels (stored values)
Old records may have: `"1 Ano"`, `"Masters"`
New assessment stores: `"1st Year"`, `"Masters"`, `"Level 5"`
Dashboard toggle buttons support all four values.

### Files committed

| Repo | Commit | Description |
|---|---|---|
| ministry-gifting | `3a0fc21` | DISC assessment, draft/resume, preferred name, Saiba Mais modals |
| ltc-dashboard | `500c1cb` | DISC profiles, Reference tab, analytics panels, person card updates |
| ltc-dashboard | `445d665` | Session 6: PersonCard expansion, full Reference tab, analytics |

---

## Session 6 — Comprehensive Dashboard Correction (4-Section Prompt)

### Section 1 — PersonCard New Data Fields
- Added `onNavigate(tabId, anchor)` prop wired from App through PeopleTab to PersonCard
- Collapsible gifting score bars (toggle: "Ver todos os dons" / "Ocultar dons")
- DISC primary badge (colored) + secondary badge (dimmer) — hide if null
- Natural Strength row with PT/EN translation via `NATURAL_STRENGTH_MAP` — hide if null
- Leadership Tendency row + amber dot indicator if `pastoral_flag==1` — hide if null
- Emotional Profile row with PT/EN translation via `EMOTIONAL_MAP` — hide if null
- Pairing Labels row (up to 2 tags + overflow count) — hide if null/empty
- Ministry Fit italic muted text — hide if null
- All tags clickable → `onNavigate("reference", anchorId)` scrolls Reference tab

### Section 2 — Analytics Tab Improvements
- `langSplit` label fixed: PT → "Idioma Preferido", EN → "Preferred Language"
- DISC Distribution section now always visible (placeholder if no data) + shows % + cultural note
- Leadership Tendencies section always visible with placeholder text
- Emotional Profiles section always visible with placeholder text
- Natural Strengths section added (new) with placeholder text
- Worker v6: `/analytics` endpoint adds `byNatural` query (GROUP BY natural_strength)

### Section 3 — Reference Tab Full Content
- Full `REFERENCE_CONTENT` constant (168KB, 576 lines) with verbatim body text:
  - 15 Ministry Giftings with full bodyPT + bodyEN
  - 4 DISC Profiles with Brazilian/American/Cultural subsections (3-tab expanded view)
  - 4 Natural Strengths with full body text
  - 4 Leadership Tendencies with full body text + optional pastoral notes
  - 4 Emotional Profiles with full body text + optional pastoral notes
  - 20 Gifting+DISC Pairings with full body text
  - Team Building Guidance (building-healthy-teams)
  - 11 Footnotes
- New `RefCard` expandable component (collapsed = name+summary, expanded = full body)
- DISC cards show 3-tab subsection selector (Brazilian/American/Cultural)
- Pastoral notes rendered with amber left border
- `ReferenceTab` accepts `anchor` prop + `onAnchorConsumed` — scrolls to `id="anchor-{anchorId}"` when navigated from PersonCard tags
- Old REFERENCE constant replaced; all content now in REFERENCE_CONTENT

### Section 4 — Previously Pending
- PlacedCard WA button: confirmed working with `skipTemplate=true` (opens empty chat)
- langSplit labels corrected (included in Section 2 above)

### New Module-Level Constants Added
- `GIFTING_TO_ANCHOR` — maps gifting name to anchorId
- `SHORT_TO_FULL` — moved to module level (was local to PersonPanel)
- `NATURAL_STRENGTH_MAP` — PT/EN/anchor lookup
- `LEADERSHIP_MAP` — PT/EN/anchor lookup
- `EMOTIONAL_MAP` — PT/EN/anchor lookup
- `DISC_TO_ANCHOR` — maps D/I/S/C letter to DISC anchorId

### Output Files
- `/tmp/App-session6.txt` — full App.jsx (~3700 lines)
- `/tmp/worker-v6.txt` — Cloudflare Worker v6

### Commits
- `445d665` — ltc-dashboard App.jsx + Worker v6

_Last updated: 2026-05-27 — Session 6 complete._

---

## Session 7 — Reference Tab Crash Fix + PersonCard Preferred Name

### Objective
Three targeted fixes:
1. Reference tab white-page crash (168KB inline JS constant)
2. PersonCard preferred name display  
3. Verification of previously pending items

### FIX 1 — Reference Tab Crash (resolved)

**Root cause:** `REFERENCE_CONTENT` was a 168KB inline JS constant in App.jsx causing parse/runtime crash. Additionally, `ReferenceTab` still referenced `REFERENCE` (the old Session 5 constant, which no longer existed).

**Fix:**
- Created `public/reference-content.json` (168KB) via Node.js extraction from `/tmp/reference_content.js`
- Removed entire REFERENCE_CONTENT constant from App.jsx (576 lines)
- Added `React` as default import to support class component
- Added `RefErrorBoundary` class component before RefCard:
  - Catches any render error inside ReferenceTab
  - PT: "Algo deu errado nesta pagina" / EN: "Something went wrong on this page"
  - Back button navigates to People tab
  - PT: "Voltar ao painel" / EN: "Back to dashboard"
- Rewrote `ReferenceTab` completely:
  - Always-visible back button at top (teal style, navigates to People tab)
  - `fetch(import.meta.env.BASE_URL + "reference-content.json")` on mount
  - Loading state: shows 8 collapsed placeholder section headings at 45% opacity
  - Loading text: PT "Carregando guia de referencia..." / EN "Loading reference guide..."
  - Error state: PT "Nao foi possivel carregar o conteudo. Tente novamente." / EN "Could not load content. Please try again."
  - Error state includes retry button
  - Once loaded: renders all 8 sections with RefCard components
- `RefCard` component kept unchanged (was already correct)
- App render: ReferenceTab wrapped in `<RefErrorBoundary>` with `onBack` prop

**Build result:** 424 kB → 262 kB (gzip: 127 kB → 73 kB)

### FIX 2 — PersonCard Preferred Name Display

**Change:** When `preferred_name` exists AND differs from `name`:
- Primary name (existing style): `person.preferred_name`
- Secondary text added below name row: PT "Nome completo: {name}" / EN "Full name: {name}" in muted JetBrains Mono
- If `preferred_name` is null or equals `name`: display unchanged

**Note:** PersonCard profile fields (DISC row, Natural Strength, Leadership, Emotional Profile, Pairing Labels, Ministry Fit, collapsible gifting bars) were already correctly implemented in Session 6. They should now display properly since the crash-causing REFERENCE_CONTENT constant has been removed.

### FIX 3 — Verification (both confirmed already in place)

- PlacedCard WA: `buildWhatsAppURL(..., true)` → `https://wa.me/{phone}` (no `?text=`)
- `langSplit` label: PT "Idioma Preferido" / EN "Preferred Language"

### Files changed
- `src/App.jsx` — import, REFERENCE_CONTENT removal, ErrorBoundary, new ReferenceTab, PersonCard preferred name
- `public/reference-content.json` — new file (168KB), 15 giftings, 4 DISC profiles, 4 natural strengths, 4 leadership tendencies, 4 emotional profiles, 20 pairings, team building, 11 footnotes

### Output files
- `/tmp/App-session7.txt` — full App.jsx
- `/tmp/reference-content.json` — full JSON data file

### Commits
- `c057869` — Session 7 fixes

_Last updated: 2026-05-28 — Session 7 complete._

---

## Session 8 — Assessment App: Five UX Fixes

[see below for Session 8 notes — in assessment app repo only]

---

## Session 9 — Bug Fix Pass: Labels, Card Layout, Reference Tab

### Files Modified
- `src/App.jsx` — PersonCard cleanup, PersonPanel improvements, new lookup constants
- `public/reference-content.json` — brazilEN DISC content, footnoteCitations, paragraph breaks
- Assessment app: `/Users/nicolel/ministry-gifting/index.html` — deriveDISC canonical values

### Bug 9 + Bug 6 (index.html) — Fixed source of wrong stored values + pairing logic

**Root cause:** `deriveDISC` was storing Portuguese strings to D1 instead of canonical English values.

**New lookup tables in index.html:**
- `DISC_NATURAL_STR`: D=Mobilizer, I=Connector, S=Sustainer, C=Architect
- `DISC_LEADERSHIP`: D=Visionary Leader, I=Relational Leader, S=Structural Leader, C=Supporting Influencer (primary-only, no combo logic)
- `DISC_EMOTIONAL`: D=Driven Processor, I=Expressive Processor, S=Steady Carrier, C=Analytical Processor (primary-only)
- `DISC_MINISTRY_FIT`: D/I/S/S_prophetic/C each stores a single canonical English string
- `DISC_PAIRING`: Replaced DISC-type pairs with 28-rule gifting+DISC combination array

**deriveDISC updated to:**
- Accept `g1, g2, g3` (top gifting names) for pairing + ministry_fit logic
- Store canonical English values for `natural_strength`, `leadership_tendency`, `emotional_profile`
- Store canonical English string (not JSON array) for `ministry_fit`
- Pairing logic checks both `disc_primary` AND `disc_secondary` against each rule
- S type with Intercession or Discernment and Prophetic in top 3 giftings gets prophetic ministry_fit

**handleSubmit updated:**
- Passes `g1, g2, g3` to `deriveDISC`
- Sends `ministry_fit` as plain string (was JSON.parse of array)

### Bug 1 (App.jsx) — Translation lookups now work

The existing `NATURAL_STRENGTH_MAP`, `LEADERSHIP_MAP`, `EMOTIONAL_MAP` constants already had the correct canonical EN keys. After Bug 9 fix, stored values will now match and Analytics + PersonPanel will translate correctly.

### Bug 2 (App.jsx) — Ministry Fit translation

Added `MINISTRY_FIT_MAP` constant: maps 5 canonical EN strings to PT display versions.
PersonPanel behavioral profile section uses this map for PT display.
Handles both new single-string format and old JSON-array format gracefully.

### Bug 3 (App.jsx) — PersonCard cleaned up

**Removed from PersonCard:**
- "View all giftings" toggle + collapsible bar chart
- Natural Strength tag row
- Leadership Tendency tag row
- Emotional Profile tag row
- Pairing Labels row
- Ministry Fit text

**PersonCard now shows:** avatar, preferred+full name, top 3 gifting tags (static, no click nav), DISC primary+secondary badges, stage badge, ministry badge, footer + WA button.

**PersonPanel updated:**
- DISC type badges remain (now clickable to Reference tab)
- New "Behavioral Profile" section heading
- Natural Strength (translated via NATURAL_STRENGTH_MAP, clickable to Reference)
- Leadership Tendency (translated via LEADERSHIP_MAP, clickable, amber dot if pastoral_flag)
- Emotional Profile (translated via EMOTIONAL_MAP, clickable)
- Pairing Labels (translated via PAIRING_LABEL_MAP, clickable via PAIRING_TO_ANCHOR)
- Ministry Fit as small italic text (translated via MINISTRY_FIT_MAP)

### Bug 4 (App.jsx) — Already implemented (Sessions 6/7)

PersonCard shows full name below preferred name. PersonPanel header uses preferred_name. No changes needed.

### Bug 5 (App.jsx) — PersonPanel labels now clickable

Added `onNavigate` prop to PersonPanel. All trait tags in Behavioral Profile section use `panelNavTo(anchorId)` to navigate to Reference tab. PersonPanel now wired to `handleNavigate` in PeopleTab and GiftingTab.

New constants added:
- `PAIRING_LABEL_MAP` — maps 20 EN pairing labels to PT display
- `PAIRING_TO_ANCHOR` — maps 20 EN pairing labels to reference-content.json anchorId

### Bug 7 (reference-content.json + App.jsx) — Brazilian Expression content fixed

**Root cause:** `item.brazilEN` did not exist in reference-content.json. RefCard showed `item.usaEN` as fallback.

**Fix:**
- Added `brazilEN` to all 4 DISC profiles in reference-content.json (full English translation of Brazilian-specific content for each profile)
- Updated RefCard: `{lang==="PT" ? item.brazilPT : (item.brazilEN || item.brazilPT || "")}` — now uses `brazilEN` correctly

### Bug 8 (App.jsx + reference-content.json) — Paragraph breaks + footnote numbers

**Paragraph breaks:**
- Added `renderParagraphs(text, footnoteCitations)` helper function before RefCard
- All body text rendering in RefCard (brazil/usa/cult tabs and non-DISC body) now uses `renderParagraphs` which splits on `\n\n` and renders each segment as `<p>`
- Added `\n\n` at natural section transition points in body text via Python processing

**Footnote superscripts:**
- Added `footnoteCitations` array to items in reference-content.json:
  - Worship and Music, Evangelism, Teaching, Administration, Discernment and Prophetic: [1]
  - Deep Teacher (pairing): [1]
  - Visionary Leader (leadership tendency): [9]
  - All 4 Emotional Profiles: [10, 11]
- `renderParagraphs` renders `<sup>` tags at end of last paragraph for each citation number

### Pending Items from previous sessions — Already done (confirmed)
- PlacedCard WA: `skipTemplate=true` already in place (Session 7)
- langSplit labels: "Idioma Preferido" / "Preferred Language" already correct

### New Constants Added to App.jsx
- `MINISTRY_FIT_MAP` — 5 EN strings to PT translations
- `PAIRING_LABEL_MAP` — 20 EN pairing labels to PT display
- `PAIRING_TO_ANCHOR` — 20 EN pairing labels to reference anchorId

### Critical Rules Carried Forward
- Canonical D1 values are always English. Only display labels translate.
- PersonCard is intentionally kept minimal (no profile sections visible before opening)
- PersonPanel is the detail view for all behavioral profile data
- No dashes in user-facing strings
- iOS Safari event rules apply to assessment app only; App.jsx is React

### Output Files
- `/tmp/App-session9.txt` — full App.jsx
- `/tmp/index-session9.txt` — full index.html (assessment app)

### Commits
- ministry-gifting: Bug 9 + 6 fix (deriveDISC canonical values + gifting-based pairing)
- ltc-dashboard: Bugs 1, 2, 3, 5, 7, 8 fix pass

_Last updated: 2026-05-28 — Session 9 complete._

---

## Session 10 — Comprehensive Bug Fix Pass (16 bugs)

### D1 Operations (Bugs 1 + 2)
- **Bug 1**: Deleted submission 10 (Luana) — removed from connections, notes, and submissions tables
- **Bug 2**: Fixed submission 15 (Prefer name, disc S/C, Worship+Encouragement+Administration giftings):
  - natural_strength: "Consistencia e cuidado" → "Sustainer"
  - leadership_tendency: "Equilibrado" → "Structural Leader"
  - emotional_profile: "Calmo e constante" → "Steady Carrier"
  - ministry_fit: JSON array → "Natural relational gifting. Position at entry points and care roles."
  - pairing_labels: old DISC pairs → ["Consistent Worshiper","Deep Worshiper","Systems Architect","Structure Builder"]
- Submission 16 already had correct canonical EN values from Session 9

### Bug 3 — Translation lookups
No new code changes needed. NATURAL_STRENGTH_MAP, LEADERSHIP_MAP, EMOTIONAL_MAP already existed and are applied correctly in Analytics and PersonPanel. After D1 fix, lookups now resolve correctly.

### Bug 4 — Gifting labels in PersonPanel
Fixed: `giftingLabel(g, person.language)` → `giftingLabel(g, lang)` in PersonPanel (two locations: top 3 gifting tags and full score bar list). Now follows dashboard language toggle instead of person's assessment language.

### Bug 5 — Ministry serving labels in PersonPanel
Fixed: `ministryLabel(m, lang, person.language)` → `ministryLabel(m, lang)` for displayed ministry chips. Now follows dashboard language toggle. Existing MINISTRY_PT lookup already has all translations.

### Bug 6 — Ministry Fit in PersonModal
Already implemented from Session 9. The ministryFitDisplay logic at lines 1858-1868 handles both single-string (new) and JSON-array (legacy) formats. Works correctly after D1 fix.

### Bug 7 — Carisma certification options
**Before**: CARISMA_LEVELS = ["1 Ano", "1st Year", "Masters", "Level 5"] (4 options, some duplicates)
**After**: CARISMA_OPTIONS = [{Masters/Masters/Masters}, {1st Year/1o Ano/1st Year}] (2 canonical options)

Added `carismaOptionActive(val)` helper: maps legacy "1 Ano" → "1st Year" and "Level 5" → "Masters" for display. Updated `toggleCarisma` to remove all equivalents of a slot before toggling canonical value. Display labels now translate: PT shows "Masters" + "1o Ano", EN shows "Masters" + "1st Year".

### Bug 8 — PersonCard too much
Already done in Session 9. PersonCard shows: avatar, preferred+full name, top 3 gifting tags, DISC primary/secondary badges, stage badge, ministry badge, footer + WA button. No profile sections.

### Bug 9 — Behavioral Profile section in PersonModal
Already implemented from Session 9. Section heading "Perfil Comportamental" / "Behavioral Profile" with all 5 fields (Natural Strength, Leadership, Emotional, Pairing Labels, Ministry Fit). Updated in Session 10 to use popup triggers instead of Reference tab navigation.

### Bug 10 — Pairing label translation
PAIRING_LABEL_MAP and PAIRING_TO_ANCHOR already existed from Session 9. Now used via popup (Bug 11) instead of Reference navigation. Trigger logic (gifting+primary/secondary DISC) was fixed in Session 9 via index.html deriveDISC.

### Bug 11 — Label description popups (NEW FEATURE)
Added `LabelDescriptionPopup` component (placed before renderParagraphs / RefCard):
- Renders as `position:fixed, zIndex:200` on top of PersonPanel (zIndex:100)
- Slides in from right as full-height panel
- Sticky header: label name + "Fechar" / "Close" button
- Fetches reference-content.json on first open
- Content lookup by type:
  - "disc": finds in discProfiles by id (via DISC_TO_ANCHOR map)
  - "natural_strength": finds in naturalStrengths by labelEN
  - "leadership_tendency": finds in leadershipTendencies by labelEN
  - "emotional_profile": finds in emotionalProfiles by labelEN
  - "pairing": finds in pairings by labelEN
- DISC type shows 3-tab view (Expressao Brasileira / Expressao Americana / Diferencas Culturais)
- Non-DISC types show body text via renderParagraphs with footnoteCitations
- Click outside (backdrop) closes popup

PersonPanel changes for Bug 11:
- Added `const [labelPopup, setLabelPopup] = useState(null)` state
- Popup rendered above backdrop/drawer when labelPopup !== null
- All Behavioral Profile label tags now call `setLabelPopup({type, value})` instead of `panelNavTo`
- DISC type badges (#1 and #2) also open popup
- `panelNavTo` function removed from Behavioral Profile IIFE

### Bug 12 — Brazilian Expression in EN mode
Already fixed in Session 9. `brazilEN` added to all 4 DISC profiles in reference-content.json. RefCard uses `item.brazilEN` for EN mode.

### Bug 13 — Paragraph breaks on Reference page
`renderParagraphs` helper already existed from Session 9 (splits on \n\n). Session 10 added more paragraph break coverage to reference-content.json:
- Round 1: Added \n\n before 15+ common transition phrases (18 fields updated)
- Round 2: Added \n\n before "They feel/serve/are/often/tend/thrive/lead", "This person/gift", "In a church/ministry", "Pastoral guidance/Team suggestion", DISC type names, etc. (13 more fields)
- Final coverage: 14/15 giftings, 30/32 other sections

### Bug 14 — Footnote numbers on Reference page
Already implemented in Session 9. `footnoteCitations` arrays added to applicable items in reference-content.json. `renderParagraphs` renders `<sup>` tags in teal (#5eead4) at end of last paragraph.

### Bug 15 — Analytics chart styles unified
Updated Leadership Tendencies, Emotional Profiles, and Natural Strengths distribution charts to match DISC chart style:
- Added `{count} ({pct}%)` display (was showing count only)
- Bar height: 5px → 6px (matches DISC)
- Added `boxShadow` on bar fill (matches DISC)
- Transition: `0.8s` → `0.8s cubic-bezier(0.16,1,0.3,1)` (matches DISC)

### Bug 16 — Full name in PersonPanel header
Added full name display below preferred name in PersonPanel header (same as existing PersonCard logic):
- When preferred_name exists and differs from name: shows "Nome completo:" / "Full name:" + name field
- PersonCard already had this from Session 9

### New/Changed Constants
None — LabelDescriptionPopup is a new component, no new module-level constants.

### Output Files
- `/tmp/App-session10.txt` — full App.jsx
- No Worker changes (derivation is in assessment app, fixed in Session 9)

### Commits
- `ltc-dashboard`: Bugs 4, 5, 7, 9, 11, 13, 15, 16 + D1 cleanup

### Current version
App.jsx: Session 10
Worker: v6 (unchanged, last deployed Session 6)

_Last updated: 2026-05-29 — Session 10 complete._

---

## Session A — Person Modal + Card Fixes

### Changes Made to App.jsx

**Bug A1 — Analytics cache-busting (App.jsx)**
- Line 947: `fetch(\`${API}/analytics\`, ...)` -> `fetch(\`${API}/analytics?t=${Date.now()}\`, ...)`
- Ensures every analytics fetch gets fresh data from D1 instead of a cached response.
- Worker Part 1 (Cache-Control header): Worker file not found locally. Must be applied manually in the Cloudflare dashboard or via wrangler — add `'Cache-Control': 'no-store, no-cache, must-revalidate'` to the GET /analytics route response headers.

**Bug A2 — Gifting labels in PersonPanel**
- Already fixed from Session 10. Lines 1823 and 1835 use `giftingLabel(g, lang)` which correctly applies GIFTING_PT when lang === "PT". No code changes needed.

**Bug A3 — Ministry serving labels in PersonPanel**
- Added 11 missing ministry keys to MINISTRY_PT (lines 234+): Choir, Instrumental Ministry, Setup and Teardown, Parking Ministry, Facilities Support, Video Editing, Photography, Graphics Team, Camera Operation, Social Media Team, Kids Ministry, Youth Ministry, Ushers, Intercessors, GC.
- Existing `ministryLabel(m, lang)` call at PersonPanel line 1713 now picks up these translations automatically.

**Bug A4 — Ministry Fit in PersonPanel**
- Already implemented from Sessions 9/10. MINISTRY_FIT_MAP + MINISTRY_FIT_LABEL_PT display logic at lines 1860-1968. No code changes needed.

**Bug A5 — Carisma certification options**
- Already fixed from Session 10. CARISMA_OPTIONS with exactly 2 entries (Masters / 1o Ano/1st Year). carismaOptionActive() maps legacy values. No code changes needed.

**Bug A6 — Full name in PersonCard and PersonPanel**
- Already done from Sessions 7/9/10. PersonCard line 1358-1363, PersonPanel line 1637-1641. No code changes needed.

**Bug A7 — Expand/collapse giftings in PersonPanel**
- Added `const [showAllGiftings, setShowAllGiftings] = useState(false)` state to PersonPanel.
- Gifting score bars (sortedScores) now collapsed by default behind a toggle button.
- Toggle labels: PT "Ver todos os dons" / "Ocultar dons", EN "View all giftings" / "Hide giftings".
- Only renders toggle if sortedScores.length > 0.

### Worker — Pending
Worker v6 at `ltc-api` was not found locally. The Cache-Control header fix for GET /analytics must be applied manually.

### Output Files
- `/tmp/checkpoint_A1.txt` — App.jsx after A1+A2+A3
- `/tmp/checkpoint_A2.txt` — App.jsx after A4+A5+A6 (same, as those were already done)
- `/tmp/ltc_dashboard_App_SessionA.txt` — final App.jsx for Session A

### Current version
App.jsx: Session A (3170 lines)
Worker: v6 (unchanged — Cache-Control fix pending manual deploy)

---

## Session A Re-run — CarismaBadge Translation Fix

### Single code change made
- Added `carismaLevelDisplay(lv, lang)` helper function before `CarismaBadge`
- Added `lang` prop to `CarismaBadge`; renders `carismaLevelDisplay(lv, lang)` instead of raw `{lv}`
- Translation rules: Masters->Masters (both), 1st Year/1 Ano->1o Ano (PT)/1st Year (EN), Level 5->Masters (both)
- Passed `lang={lang}` at all 3 call sites: PersonCard, PlacedCard, PersonPanel

### Already-implemented (confirmed, no changes needed)
- Fix 1: Analytics cache-busting `?t=${Date.now()}` already at line 962
- Fix 2: Ministry Fit display in PersonPanel — MINISTRY_FIT_MAP + render at lines 1990-1994
- Fix 4: Full name below preferred name — PersonCard lines 1373-1376, PersonPanel lines 1653-1656
- Fix 5: Expand/collapse giftings in PersonPanel — showAllGiftings state + toggle at lines 1843-1869

### Worker — still pending
Worker Cache-Control header fix must be applied manually (no local ltc-api directory found).

### Output files
- `/tmp/ltc_dashboard_App_SessionA2.txt` — final App.jsx (3177 lines)

### Current version
App.jsx: Session A2 (3177 lines)
Worker: v6 (unchanged)

_Last updated: 2026-05-29 — Session A complete._

---

## Session A2 Direct Edit — PersonCard gifting language fix

### Code change
- **Fix 5**: `PersonCard` line 1404 — `giftingLabel(g, person.language)` → `giftingLabel(g, lang)`
  - Top 3 gifting tags on the Person Card face now follow the dashboard PT/EN toggle
  - Previously used `person.language` (the person's assessment language) instead of `lang` (the dashboard toggle)

### Already confirmed in place — no code changes needed
- Fix 1 (App.jsx part): analytics fetch already has `?t=${Date.now()}` at line 962
- Fix 2: `MINISTRY_FIT_MAP` + render at lines 1997-2001 in PersonPanel Behavioral Profile section
- Fix 3: `carismaLevelDisplay()` helper + `lang` prop in `CarismaBadge` at all 3 call sites
- Fix 4: Full name below preferred name at PersonCard lines 1380-1383 and PersonPanel lines 1660-1663
- Fix 6: `showAllGiftings` state + toggle in PersonPanel at lines 1538, 1853-1876

### Worker — still pending manual action
No local `ltc-api` directory. The Cache-Control header `'no-store, no-cache, must-revalidate'` must be added to GET /analytics response in the Cloudflare Worker manually via dashboard or wrangler.

### Commit
- `7323c1f` — Fix Person Card and Modal display bugs

### Current version
App.jsx: Session A2 deployed (3177 lines)
Worker: v6 (unchanged — Cache-Control fix pending)

_Last updated: 2026-05-29 — Session A2 direct edit complete._

---

## Session C — Reference Page Cleanup

### Confirmed architecture
- Reference content fetched from `public/reference-content.json` (not inline constant)
- Body text stored as single strings; `renderParagraphs()` splits on `\n\n`
- `RefCard` component (line 2858) renders Reference page cards
- DISC tabs inside both `LabelDescriptionPopup` and `RefCard` — already correctly mapped: brazil/usa/cult keys to brazilPT/EN, usaPT/EN, culturalPT/EN fields

### Bug C1 — Paragraph breaks (reference-content.json)
Added `\n\n` at natural sentence boundaries in:
- DISC Executor `usaPT` (3 breaks): before "Como se comunicam:", "Como lidam com conflitos:", "Exemplos reais"
- DISC Executor `usaEN` (3 breaks): before "How they communicate:", "How they handle conflict:", "Real-life examples"
- DISC Executor `culturalPT` (5 breaks): before "Em ambientes de equipe", "O que essa pessoa precisa primeiro:", "O dom por baixo do desafio:", "Nota sobre dados:", "Nota sobre as questoes:"
- DISC Executor `culturalEN` (5 breaks): before "In team settings", "What this person needs first:", "The gift underneath the challenge:", "On data:", "Note on questions:"
- Creativity `bodyPT` (4 breaks): before "Alguem com o dom", "Sua contribuicao", "Precisa de ambientes", "Fundamentacao biblica:"
- Creativity `bodyEN` (4 breaks): before "Someone with the Creativity gifting", "Their contribution", "They need environments", "Biblically grounded in:"
- teamBuilding `bodyPT`/`bodyEN` (5 breaks each): at each major section transition
- teamBuilding: stripped "====SECTION 8: FOOTNOTES AND SOURCES===..." marker and all content after it from both bodyPT and bodyEN

### Bug C2 — Footnote superscripts (App.jsx)
- `renderParagraphs` line ~2845: `<sup>` elements now clickable, color `#2ABFBF`, `cursor:"pointer"`, `onClick` scrolls to `#reference-footnotes`
- Footnotes `<div>` in `ReferenceTab` (line ~3121): added `id="reference-footnotes"`
- Existing `footnoteCitations` array usage in `renderParagraphs` was already correct — inline superscripts at end of last paragraph per item

### Files changed
- `src/App.jsx` — `renderParagraphs` footnote sup style + onClick; footnotes div id
- `public/reference-content.json` — paragraph breaks added, SECTION 8 marker removed

### Commit
- `186ce0b` — Session C: fix reference page paragraph breaks and footnote links

### Output files
- `/tmp/checkpoint_C1.txt` — App.jsx after Bug C1
- `/tmp/checkpoint_C2.txt` — App.jsx after Bug C2
- `/tmp/ltc_dashboard_App_SessionC.txt` — final App.jsx (3247 lines)

### Current version
App.jsx: Session C (3247 lines)
reference-content.json: updated (paragraph breaks + SECTION 8 removed)

_Last updated: 2026-05-29 — Session C complete._

---

### Scope
`/Users/nicolel/ministry-gifting/index.html` only. No App.jsx changes.

### FIX 1 — Scale Level 5 Label
- PT: `"Isso arde dentro de mim"` → `"Isso fala muito de mim"`
- EN: `"This burns in me"` → `"This is deeply me"`
- Levels 1-4 unchanged

### FIX 2 — Level 5 Confirmation Overlay
- Tapping scale button index 4 (level 5) no longer records immediately
- Shows `position:fixed` overlay (z-index 500) above the question card
- PT heading: "Isso fala muito de mim" / EN: "This is deeply me"
- PT body: "Marcar isso mostra que essa qualidade e profundamente enraizada em quem voce e."
- EN body: "Selecting this shows that this quality is deeply rooted in who you are."
- Confirm button (teal): PT "Sim, com certeza" / EN "Yes, absolutely" → records answer as 5 (index 4)
- Back button (dark): PT "Na verdade, mais um 4" / EN "Actually, more like a 4" → records answer as 4 (index 3)
- Outside tap: does nothing; overlay stays open (no backdrop dismiss)
- Both buttons use addEventListener + IIFE closures; no onclick attributes

### FIX 3 — DISC Section Visual Changes
- First DISC card only: teal pill label above question text ("Como voce funciona naturalmente" / "How you naturally operate"; class `disc-section-pill`)
- First DISC card only: scale buttons fade in (`@keyframes scaleFadeIn` 0.4s, applied via `.scale-wrap.disc-first .scale-btn`)
- All DISC cards: `border-top: 2px solid rgba(42,191,191,0.7)` instead of full teal
- First DISC detection: `isDisc && (current===0 || ALL_QUESTIONS[current-1].type !== 'disc')` — no hardcoded index

### FIX 4 — DISC Removed from Results Screen
- `discSection` div emptied in `renderResults` (`discEl.innerHTML=''`)
- DISC data still calculated, stored, and sent to Worker — only display removed

### FIX 5 — Learn More Modal Content
- Added `GIFTING_LEARN_MORE` JS constant (keyed by gifting EN name, 15 entries, each has `pt` and `en` properties with full theological body text)
- Modal close button moved to VERY TOP of modal; id `closeSaibaMaisBtn`; class `modal-back-btn`; PT "Voltar aos meus resultados" / EN "Back to my results"
- Modal shows `GIFTING_LEARN_MORE[g.en.name][lang]` as description instead of brief `g[lang].desc`
- No ministry tags or DISC info shown in modal

### CSS added
```css
.disc-section-pill { ... }
@keyframes scaleFadeIn { from{opacity:0} to{opacity:1} }
.scale-wrap.disc-first .scale-btn { animation: scaleFadeIn 0.4s ease forwards }
.modal-back-btn { ... }
```

### Key implementation rules carried forward
- iOS Safari: addEventListener('touchstart', fn, {passive:false}) + addEventListener('click', fn); no onclick attributes
- IIFE closures for all dynamically created buttons
- No dashes (hyphens as punctuation) in any user-facing string
- `ALL_QUESTIONS` = CAL_QUESTIONS (2) + QUESTIONS (45) + DISC_QUESTIONS (12) = 59 total
- DISC starts at index 47 (0-based); first detection via prev-question type check

### Output files
- `/tmp/index-session8.txt` — full index.html (193KB)

### Commits (ministry-gifting repo)
- `7843749` — Five UX fixes: scale label, level-5 confirm overlay, DISC section styling, remove DISC from results, learn-more modal content

_Last updated: 2026-05-28 — Session 8 complete._

---

## Session 1 (2026-05-31) — DISC Bars, Clickable Gifting Tags, Pastoral Potential Reference

### Files Changed
- `src/App.jsx`
- `public/reference-content.json`

### Fix 1 — DISC Score Bars in PersonPanel

**Variables added (~line 1771):**
- `discBars` array: maps `person.disc_d/disc_i/disc_s/disc_c` with key D/I/S/C and PT/EN labels
- Filtered to exclude null/undefined values

**JSX added after DISC type badges row (~line 2085):**
- Renders 4 horizontal bars (D/I/S/C) with colored letter label, PT/EN name, raw score (x/15)
- Bar width = `(field / 15) * 100%`; color from `DISC_COLORS[key]`
- Only renders if `discBars.length > 0`

### Fix 2 — Clickable Gifting Tags in PersonPanel

**JSX change (~line 1993):**
- Added `onClick={function(){ setLabelPopup({type:'gifting',value:g}); }}` and `cursor:"pointer"` to each gifting badge span

**LabelDescriptionPopup change (~line 2840):**
- Added `type === "gifting"` case: finds entry in `refContent.giftings` by `labelEN === value`
- Renders `bodyPT` or `bodyEN` via `renderParagraphs` (no tabs)

### Fix 3 — Pastoral Potential Reference

**reference-content.json:**
- Added entry to `leadershipTendencies` array with `id: "pastoral-potential"`, `labelPT: "Potencial Pastoral"`, `labelEN: "Pastoral Potential"`, full `bodyPT` and `bodyEN`

**JSX change (~line 2068):**
- Pastoral flag badge (`★ {t.pastoralAlert}`) now has `onClick={function(){ setLabelPopup({type:'pastoral',value:'pastoral-potential'}); }}` and `cursor:"pointer"`

**LabelDescriptionPopup change (~line 2841):**
- Added `type === "pastoral"` case: finds entry in `refContent.leadershipTendencies` by `id === value`
- Renders `bodyPT` or `bodyEN` via `renderParagraphs` (no tabs)

### Current version
App.jsx: Session 1 (2026-05-31)
reference-content.json: updated (pastoral-potential entry added)

_Last updated: 2026-05-31 — Session 1 complete._

---

## Session 2 Redux (2026-05-31) — Ministry Recommendations Complete Rewrite

### Files Changed
- `src/App.jsx`

### Change 1 — getMinistryRecommendations fully replaced (lines 645–968)
- Removed 3 DEBUG console.log lines (old lines 652, 653, 965)
- New function: same signature `(person, lang)`, returns `{ministry, reasons}[]`
- Added `isReliable = person.reliability_flag === 1` check
- New GIFTING_MINISTRY_MAP: rebalanced scores, removed Legacy/English Service entries, added WE CARE entries, Worship & Music now scores 20 for Worship Team
- MINISTRY_PRIMARY_GIFTING updated: Consolidation primary = Encouragement (not Evangelism), Translation primary = Bilingual (special check), Volunteer Coffee primary = Gift of Helps
- isSuppressed: Translation now suppressed unless bilingual; Consolidation requires Encouragement in top3 or >=40%
- DISC modifier strings simplified (no "/D" "/I" etc suffixes)
- Combination bonuses rebalanced (smaller numbers, removed Worship+Admin→Worship Team boost)
- Added BILINGUAL BONUS section (WE CARE + Consolidation)
- Translation: only appears if `isBilingual && isReliable` (score 20)
- GUARANTEED SLOT RULE: ensures gifting_1's canonical ministry always appears in top 5 (boosted to score 30 if below)

### Change 2 — Reliability indicator in PersonPanel
- Added `{person.reliability_flag === 1 && ...}` block before "Suggested Placements" section
- Shows teal checkmark + "Comprometimento confirmado" / "Reliability confirmed"

### Commit
- `46b1002`

---

## Session 2 (2026-05-31) — Ministry Recommendations Rebuild (superseded by Session 2 Redux)

### Files Changed
- `src/App.jsx`

### Change 1 — getMinistryRecommendations replaced (lines 642–875)
- Old function returned `string[]`; new function returns `{ministry: string, reasons: string[]}[]`
- Added `lang` parameter (unused in scoring, passed through)
- Added `isBilingual` detection from `person.languages_spoken`
- New `ministryData` accumulator tracks score + reasons per ministry
- New `giftingReason(name)` helper: returns "Name (#1) — 72%" style reason string
- GIFTING_MINISTRY_MAP updated: removed Legacy references, added WE CARE - Helps and WE CARE - Evangelism entries
- MINISTRY_PRIMARY_GIFTING updated: added WE CARE - Helps and WE CARE - Evangelism entries
- DISC modifiers now call `add(ministry, points, reason)` with DISC reason strings
- Combination bonuses updated: replaced old combinations, added WE CARE combinations, removed Legacy combos
- Bilingual bonus replaces old `person.language === 'EN'` check
- Top 5 returned as objects with `.ministry` and `.reasons` (up to 3)

### Change 2 — MINISTRY_PT additions (line ~272)
- Added `"Hospitality - Welcome": "Recepção"` (hyphen key, matching function usage)
- Added `"WE CARE - Helps": "WE CARE - Ajuda Pratica"`
- Added `"WE CARE - Evangelism": "WE CARE - Evangelismo"`

### Change 3 — PersonPanel state (line ~1669)
- Added `const [ministryPopup, setMinistryPopup] = useState(null)`

### Change 4 — ministryRecs call + recLabel helper (lines ~1986–2000)
- `getMinistryRecommendations(person)` → `getMinistryRecommendations(person, lang)`
- Added `recLabel(m)` function: handles WE CARE names explicitly, then falls back to MINISTRY_PT

### Change 5 — Suggested Placements render (lines ~2387–2440)
- Badges now iterate over `rec` objects (not strings)
- Each badge: `onClick` sets `ministryPopup(rec)`, `cursor:"pointer"`
- Badge label: `recLabel(rec.ministry)`
- Added Ministry Reason Popup: `position:fixed` modal, shows ministry name + reasons list
- Popup closes on backdrop click or Close button

### Current version
App.jsx: Session 2 (2026-05-31)

_Last updated: 2026-05-31 — Session 2 complete._

---

## Session 3 (2026-05-31) — WE CARE, Groups, GC Toggle

### Files Changed
- `src/App.jsx`

### Fix 1 — WE CARE added to ministry list (DONE)
- **Line 231**: Added `"WE CARE"` to `MINISTRIES_STARTER` array (the dropdown pastors use to assign current_ministries)
- **Line 273**: Added `"WE CARE":"WE CARE"` to `MINISTRY_PT` lookup (no translation — proper name)
- Note: `"WE CARE - Helps"` and `"WE CARE - Evangelism"` remain as suggestion-only labels in the recommendation engine. `"WE CARE"` is the canonical stored ministry name.

### Fix 2 — New groups added to SPECIAL_GROUPS (DONE)
- **Line 49**: `SPECIAL_GROUPS_PT` rebuilt as full 12-item parallel array including all existing + new groups
- **Line 280**: Added `"CRIE"`, `"Gerações"`, `"Carisma Student"` to `SPECIAL_GROUPS` canonical EN array
- **Lines 220–223**: Added to `SPECIAL_GROUP_PT` lookup: `"CRIE":"CRIE"`, `"Gerações":"Gerações"`, `"Carisma Student":"Aluno do Carisma"`
- Carisma Student (currently enrolled) is distinct from Carisma completion badge (CARISMA_OPTIONS) — these are separate things, not confused

### Fix 3 — GC Toggle (PENDING D1 SCHEMA)
- `gc_connected` column does not exist anywhere in App.jsx or the connections table
- Cannot implement without: `ALTER TABLE connections ADD COLUMN gc_connected INTEGER DEFAULT NULL;`
- Once schema is updated, add a yes/no toggle in the connection form with label "Conectado a um GC?" / "Connected to a GC?" and display an amber indicator in PersonPanel when gc_connected = 0

### Current version
App.jsx: Session 3 (2026-05-31)

_Last updated: 2026-05-31 — Session 3 complete._

---

## Session 5 (2026-05-31) — Pastoral Flag Redesign

### Files Changed
- `src/App.jsx`

### Fix B1 — Visual Distinction: algorithm vs pastor flag

**Extended `pastoral_flag` values (no D1 schema change needed):**
- `0` = not flagged
- `1` = algorithm flagged (existing behavior)
- `2` = pastor confirmed/manually flagged

**PersonCard star badge (was line 1721):**
- `pastoral_flag==1`: gold star (`#fbd590`/`#F59E0B`), tooltip "Potencial Pastoral"/"Pastoral Potential"
- `pastoral_flag==2`: teal star (`#2ABFBF`), tooltip "Confirmado pelo Pastor"/"Confirmed by Pastor"
- `0` or null: nothing

**PersonPanel DISC badge (was line ~2329):**
- `pastoral_flag==1`: amber badge, label "Potencial Pastoral" / `t.pastoralAlert`
- `pastoral_flag==2`: teal badge, label "Confirmado pelo Pastor" / "Confirmed by Pastor"
- Clicking either opens the pastoral-potential popup (existing behavior)

**Leadership dot (was line ~2385):**
- Now shows for both 1 and 2; color follows flag value (amber/teal)

### Fix B2 — Manual Pastoral Flag Toggle

**New state vars added to PersonPanel:**
- `pastoralUI` — bool: shows pastor name selector
- `pastoralAction` — "confirm" | "flag" | null
- `pastoralPastorName` — selected name from list
- `pastoralCustomName` — text input when "Outro"/"Other" selected

**Pastoral management section** added after reliability indicator, visible when `token` is present:
- `pastoral_flag==0`: single "Marcar Potencial"/"Flag Potential" button
- `pastoral_flag==1`: "Confirmar"/"Confirm" + "Remover"/"Clear" buttons
- `pastoral_flag==2`: confirmed state with `pastor_confirmed_by` name + "Remover"/"Clear"

**Pastor name selector** (inline):
- Pills: "Pr. Daniel", "Pra. Alice", "Pr. Rafa", "Pr. Andrey", "Outro"/"Other"
- "Outro" reveals text input for custom name
- Save calls `updateConnection({pastoral_flag:2, pastor_confirmed_by: name})`
- Clear calls `updateConnection({pastoral_flag:0, pastor_confirmed_by: null})`

### Commit
- `b353f9f`

### PENDING — D1 Schema (required before pastor_confirmed_by saves):
```sql
ALTER TABLE connections ADD COLUMN pastor_confirmed_by TEXT DEFAULT NULL;
```
Run in Cloudflare D1 console for the `ltc-db` database. Until this is run, `pastor_confirmed_by` is sent in the PUT request but the Worker will silently ignore it (field not in D1 bind).

### PENDING — Worker verification:
Confirm the Worker's PUT `/person/:id/connection` handler passes `pastoral_flag` and `pastor_confirmed_by` through to the D1 bind. If `pastoral_flag` is not currently accepted, add both fields to the Worker's connection update handler alongside existing fields (stage, assigned_pastor, etc.).

### GC Toggle (Fix 3 from Session 3) — still PENDING D1 schema:
```sql
ALTER TABLE connections ADD COLUMN gc_connected INTEGER DEFAULT NULL;
```

_Last updated: 2026-05-31 — Session 5 complete._

---

## Session 6 (2026-05-31) — Pastoral Badge Fixes

### Files Changed
- `src/App.jsx`

### Fix B1 — Pastoral badge labels and pastor name display

**PersonCard star badge tooltip:**
- flag=1: "Potencial Pastoral" / "Pastoral Potential" — unchanged
- flag=2: "Marcado Pastoral — por [pastor_confirmed_by]" / "Marked for Pastoral — by [pastor_confirmed_by]" (name omitted if null)

**PersonPanel pastoral badge label:**
- flag=1: t.pastoralAlert ("Potencial Pastoral" / "Pastoral Potential") — unchanged
- flag=2: "Marcado Pastoral — por [name]" / "Marked for Pastoral — by [name]"

**onClick updated** to pass `pastoralFlag` and `confirmedBy` to popup:
`setLabelPopup({type:'pastoral',value:'pastoral-potential',pastoralFlag:person.pastoral_flag,confirmedBy:person.pastor_confirmed_by||null})`

### Fix B2 — Pastoral popup content for flag=2

**LabelDescriptionPopup** receives new props: `pastoralFlag`, `confirmedBy`

**heading** — when `pastoralFlag===2`: "Marcado Pastoral" / "Marked for Pastoral" (overrides item.labelPT/EN)

**body** — when `type==="pastoral" && pastoralFlag===2`: shows pastoral-observation copy instead of algorithm explanation:
- PT: "Esta pessoa foi identificada para desenvolvimento pastoral por meio de observacao e relacionamento pastoral direto..." + "Identificado por: [name]" if available
- EN: "This person has been identified for pastoral development by direct pastoral observation..." + "Identified by: [name]" if available
- flag=1 continues to show algorithm content (no change)

**LabelDescriptionPopup call site** (line ~2031): now passes `pastoralFlag={labelPopup.pastoralFlag}` and `confirmedBy={labelPopup.confirmedBy}`

### Fix B3 — Remove Pr. Andrey from pastor selector
- Pastor name pills now: "Pr. Daniel", "Pra. Alice", "Pr. Rafa", "Outro"/"Other"

### Commit
- `4db405e`

_Last updated: 2026-05-31 — Session 6 complete._
