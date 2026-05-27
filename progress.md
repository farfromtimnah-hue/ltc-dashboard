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

---

## How to Run Locally

```bash
cd /Users/nicolel/ltc-dashboard
npm install --cache /tmp/npm-cache   # use if npm cache has permission issues
npm run dev
```

_Last updated: 2026-05-26 — Session 2 complete._
