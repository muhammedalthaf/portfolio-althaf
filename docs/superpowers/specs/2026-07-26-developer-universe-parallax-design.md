# Developer Universe Parallax — Design Spec

**Date:** 2026-07-26
**Project:** portfolio-althaf (static site: index.html + styles.css + script.js, Tailwind CDN, Firebase Hosting)
**Goal:** Add extreme, layered parallax scrolling inspired by the Wix Studio "space" inspiration page — but themed around developer items (laptops, terminals, AI agents, workflows, charts) instead of space imagery. Clean, consistent, precisely placed.

## Decisions Made (with user)

1. **No space theme.** Decorative items are developer-themed: wireframe laptop, terminal windows, agent node-graphs, workflow diagrams, bar/line charts, code glyphs (`</>`), git branches.
2. **Item style: Mixed** — neon line-art inline SVG for ambient items + 3-4 glassmorphic mini-cards as foreground hero items.
3. **Engine: GSAP + ScrollTrigger via CDN.**
4. **Scroll feel: free-flow + exactly 2 pinned moments** (hero exit, AI section).
5. **All imagery hand-coded SVG/CSS** — no AI-generated raster images. (Nano Banana hero illustration deferred as optional future work.)

## Architecture

### Depth layer system

Every decorative item is assigned exactly one depth class. Depth determines scroll speed, opacity, blur, and stroke weight — uniformly. This is the consistency contract.

| Depth class | Speed vs scroll | Opacity | Treatment |
|---|---|---|---|
| `.px-far` | ~0.15x | 6-8% | Huge outline items (300-500px), slight blur |
| `.px-mid` | ~0.4x | 15-25% | Medium items (120-200px), neon stroke + soft glow |
| `.px-near` | ~0.7x | 35-50% | Small items (60-100px), sharp, stronger glow |
| `.px-front` | ~1.25x | 90-100% | Glassmorphic mini-cards (160-220px), backdrop-blur, shadow |

Speeds implemented as GSAP `yPercent`/`y` tweens with `scrub: true` on per-section ScrollTriggers.

### Item inventory (inline SVG, stroke-based)

Ambient (far/mid/near): wireframe laptop, terminal window w/ blinking cursor, agent node-graph (circles + connecting lines), workflow flowchart (boxes + arrows), bar chart, rising line chart, `</>` glyph, `{ }` glyph, git branch, cloud/server rack, cursor arrow.

Front glass cards (HTML/CSS, not SVG): mini terminal card (`$ deploy … ✔ done`), mini analytics card (small bar chart + trend line), agent status card (pulsing dot + "Agent running").

Strokes use accent palette only: `#00d4ff`, `#7c3aed`, `#ec4899` (+ existing card accents where thematic). One shared SVG glow filter / CSS `drop-shadow`. Stroke width 1.5 uniformly.

### Placement rules

- Items live in a per-section absolutely-positioned decor layer (`.px-decor`, `pointer-events: none`, `z-index` below content, `overflow: hidden` on section).
- Positioned only in outer gutters (content is `max-w-7xl`; wide screens leave free margins) and section corners — never overlapping text at ≥1280px.
- Max 2-3 items per side per viewport; alternate left/right rhythm down the page.
- Thematic matching per section: charts → Skills; agent graphs → AI; workflow nodes → Experience; terminal cards → Projects; laptop + glyphs → Hero/About; cloud/server → Tools; converging glyphs → Contact.

### Pinned moments (2)

1. **Hero exit** — ScrollTrigger pins `#hero` for ~70vh of scroll: avatar drifts up + fades, near/front items fly upward faster, particle canvas keeps running; releases into About.
2. **AI & Intelligence** — section header area pins briefly (~50-60vh) while a large agent node-graph behind it draws in (stroke-dashoffset scrubbed per line, nodes pop in staggered); then releases.

### Free-flow choreography (all sections)

- Section titles: slight slower drift than their cards (subtle heading/content depth split).
- Card grids (bento, skills, projects): small per-column `y` offsets scrubbed on scroll so grids feel 3D.
- Experience timeline vertical line draws with scroll scrub.
- Existing geo shapes and about/circuit backgrounds get depth speeds joining the same system.
- Existing IntersectionObserver `animate-on-scroll` reveals stay as-is (no regression).

## Implementation Surface

- `index.html`: add GSAP + ScrollTrigger CDN scripts before `script.js`; add `.px-decor` layers with SVG items per section; add glass mini-cards.
- `styles.css`: depth classes, glow filter, glass card styles, reduced-motion overrides.
- `script.js`: new `initParallax()` module — registers ScrollTrigger, builds per-depth tweens by class, the 2 pins, timeline/chart draw effects. Guarded so page works if CDN fails (decor renders static).

## Performance & Accessibility

- Animate `transform` and `opacity` only; `will-change: transform` on moving items.
- `<1024px`: no pinning, parallax distances ~50%, hide `.px-far` and roughly half the items (CSS).
- `prefers-reduced-motion: reduce`: all parallax/pins disabled; decor static at low opacity.
- If GSAP fails to load (offline), site functions identically to today with static decor.

## Error Handling / Regressions to Guard

- Pins must not break anchor navigation (`#about` etc.) — ScrollTrigger pin spacing accounted for; test nav clicks.
- `overflow-x` must remain hidden — no horizontal scrollbars from off-gutter items.
- Preloader, typewriter, particle canvas, counters, marquee must keep working.

## Verification

- Serve locally (e.g. `python3 -m http.server`), drive with Playwright: screenshots at ~6 scroll positions, desktop (1440px) + mobile (390px) viewports; console must be error-free.
- Manual checks: nav anchor clicks land correctly; no item overlaps text at 1280/1440/1920 widths; reduced-motion emulation shows static page.

## Out of Scope

- Nano Banana / AI-generated hero illustration (optional future work).
- Any content, copy, or layout changes to existing sections.
