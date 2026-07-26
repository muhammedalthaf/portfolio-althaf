# Developer Universe Parallax — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add layered, GSAP-ScrollTrigger-driven parallax with developer-themed SVG items and glass mini-cards to the static portfolio, including two pinned scroll moments.

**Architecture:** Decorative items live in per-section absolutely-positioned `.px-decor` layers (pointer-events none, behind content). A single depth engine in `script.js` assigns scrubbed y-tweens by `data-px` depth attribute. Two pins (hero exit, AI section) are desktop-only. Card/title micro-parallax rides a CSS custom property (`--px-shift`) so it composes with the existing `.animate-on-scroll` reveal system instead of fighting it.

**Tech Stack:** Static HTML + Tailwind CDN + vanilla JS. New: GSAP 3.12.5 + ScrollTrigger via cdnjs. No build step, no test framework — verification is browser-based (local server + Playwright screenshots + console checks).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-26-developer-universe-parallax-design.md`
- Only these files change: `index.html`, `styles.css`, `script.js` (+ this plan's checkboxes).
- No content/copy/layout changes to existing sections beyond: adding decor layers, adding `relative z-10` to four content wrappers, wrapping the AI section header in a pin wrapper.
- Decor strokes use only `#00d4ff`, `#7c3aed`, `#ec4899` (via `color:` on the item; SVG uses `stroke="currentColor"`), stroke-width `1.5`.
- Animate `transform`/`opacity`/CSS vars only. All decor `pointer-events: none`.
- Site must work identically to today if GSAP CDN fails (guard clause).
- `prefers-reduced-motion: reduce` → no parallax, no pins, decor static at low opacity.
- `< 1024px`: no pins, parallax distance halved, `.px-far` and `data-mobile-hide` items hidden.
- No horizontal scrollbar at any viewport width.
- Existing features must keep working: preloader, typewriter, particle canvas, custom cursor, counters, marquee, tool tabs, reveal animations, nav anchor links, back-to-top.
- Verification server: `python3 -m http.server 8080` from repo root (background). Playwright MCP tools drive the browser. Console must stay error-free after every task.
- Commit after every task. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Foundation — GSAP load, decor CSS system, depth engine skeleton

**Files:**
- Modify: `index.html:2042` (add CDN scripts before `script.js`)
- Modify: `styles.css` (append decor system block at end)
- Modify: `script.js` (append `initParallax` module at end)

**Interfaces:**
- Produces: CSS classes `.px-decor`, `.px-item`, `.px-glow`, depth classes via `data-px="far|mid|near|front"`; JS module `initParallax()` (IIFE) exposing nothing globally; internal `LAG` map `{far:200, mid:120, near:50, front:-160}` and `isDesktop` media check that Tasks 5-7 extend inside the same IIFE.

- [ ] **Step 1: Add GSAP scripts.** In `index.html`, immediately before `<script src="script.js"></script>`:

```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

- [ ] **Step 2: Append decor CSS** at the end of `styles.css`:

```css
/* ============================================
   Parallax Decor System (developer universe)
   ============================================ */
.px-decor {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.px-item {
  position: absolute;
  will-change: transform;
  pointer-events: none;
}

.px-item svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.px-item[data-px="far"]  { opacity: 0.07; filter: blur(2px); }
.px-item[data-px="mid"]  { opacity: 0.20; }
.px-item[data-px="near"] { opacity: 0.45; }

.px-glow { filter: drop-shadow(0 0 6px currentColor); }
.px-item[data-px="far"].px-glow { filter: blur(2px) drop-shadow(0 0 10px currentColor); }

@media (max-width: 1023px) {
  .px-item[data-px="far"],
  .px-item[data-mobile-hide] { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .px-item { opacity: 0.08 !important; }
}
```

- [ ] **Step 3: Append engine skeleton** at the end of `script.js`:

```js
/* ============================================
   Parallax Engine — GSAP ScrollTrigger
   ============================================ */
(function initParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  var LAG = { far: 200, mid: 120, near: 50, front: -160 };
  var dist = isDesktop ? 1 : 0.5;

  // Depth engine: every .px-item drifts vertically at its depth's speed.
  // Negative-to-positive y = lags behind scroll (background feel);
  // front items get the inverse (lead the scroll).
  gsap.utils.toArray('.px-item').forEach(function (el) {
    var depth = el.getAttribute('data-px') || 'mid';
    var d = (LAG[depth] || 0) * dist;
    var section = el.closest('section');
    if (!section) return;
    gsap.fromTo(el, { y: -d }, {
      y: d,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
})();
```

- [ ] **Step 4: Verify in browser.** Start server (background): `python3 -m http.server 8080` in repo root. Playwright: navigate `http://localhost:8080`, wait for preloader to clear, check `browser_console_messages` — no errors; evaluate `typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'` → true. Take a screenshot; page must look identical to before (no decor items exist yet).

- [ ] **Step 5: Commit.**

```bash
git add index.html styles.css script.js
git commit -m "Add GSAP ScrollTrigger and parallax decor foundation"
```

---

### Task 2: SVG item library + hero & about decor layers

**Files:**
- Modify: `index.html:64-103` (hero section), `index.html:106-231` (about section)

**Interfaces:**
- Consumes: `.px-decor` / `.px-item` / `data-px` / `.px-glow` from Task 1 (engine picks new items up automatically).
- Produces: The canonical SVG item snippets reused (copy-paste + reposition) by Task 3. Every item is a `div.px-item` with inline `style` for `top/bottom/left/right`, `width`, and `color`.

The library (all `stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"` on the `<svg>`):

**Laptop** — `viewBox="0 0 200 140"`: `<rect x="40" y="20" width="120" height="75" rx="6"/><rect x="48" y="28" width="104" height="59" rx="3"/><path d="M25 110 L40 95 h120 l15 15 z"/><path d="M85 103 h30"/>`

**Terminal** — `viewBox="0 0 160 110"`: `<rect x="5" y="5" width="150" height="100" rx="8"/><circle cx="20" cy="18" r="3"/><circle cx="32" cy="18" r="3"/><circle cx="44" cy="18" r="3"/><path d="M5 30 h150"/><path d="M18 48 l10 8 -10 8"/><path d="M36 64 h24"/><path d="M18 82 h40"/>`

**Agent graph** — `viewBox="0 0 180 120"`: `<circle cx="30" cy="60" r="10"/><circle cx="90" cy="25" r="10"/><circle cx="90" cy="95" r="10"/><circle cx="150" cy="60" r="10"/><path d="M39 55 L81 30"/><path d="M39 65 L81 90"/><path d="M99 30 L141 55"/><path d="M99 90 L141 65"/>`

**Workflow** — `viewBox="0 0 200 90"`: `<rect x="5" y="30" width="44" height="30" rx="6"/><rect x="78" y="5" width="44" height="30" rx="6"/><rect x="78" y="55" width="44" height="30" rx="6"/><rect x="151" y="30" width="44" height="30" rx="6"/><path d="M49 40 L78 22"/><path d="M49 50 L78 68"/><path d="M122 22 L151 40"/><path d="M122 68 L151 50"/>`

**Bar chart** — `viewBox="0 0 120 100"`: `<path d="M10 90 h100"/><path d="M10 90 V10"/><rect x="25" y="55" width="12" height="35"/><rect x="45" y="40" width="12" height="50"/><rect x="65" y="60" width="12" height="30"/><rect x="85" y="25" width="12" height="65"/>`

**Line chart** — `viewBox="0 0 120 100"`: `<path d="M10 90 h100"/><path d="M10 90 V10"/><path d="M18 80 L44 55 L70 65 L106 25"/><circle cx="44" cy="55" r="3"/><circle cx="70" cy="65" r="3"/><circle cx="106" cy="25" r="3"/>`

**Code glyph** — `viewBox="0 0 120 100"`: `<path d="M40 25 L18 50 L40 75"/><path d="M80 25 L102 50 L80 75"/><path d="M68 18 L52 82"/>`

**Braces glyph** — `viewBox="0 0 120 100"`: `<path d="M45 15 c-12 0 -12 10 -12 17 c0 8 0 13 -12 18 c12 5 12 10 12 18 c0 7 0 17 12 17"/><path d="M75 15 c12 0 12 10 12 17 c0 8 0 13 12 18 c-12 5 -12 10 -12 18 c0 7 0 17 -12 17"/>`

**Git branch** — `viewBox="0 0 100 120"`: `<circle cx="30" cy="20" r="9"/><circle cx="30" cy="100" r="9"/><circle cx="72" cy="55" r="9"/><path d="M30 29 V91"/><path d="M30 40 C30 55 60 42 66 48"/>`

**Server rack** — `viewBox="0 0 120 130"`: `<rect x="15" y="10" width="90" height="32" rx="6"/><rect x="15" y="49" width="90" height="32" rx="6"/><rect x="15" y="88" width="90" height="32" rx="6"/><circle cx="30" cy="26" r="3"/><circle cx="30" cy="65" r="3"/><circle cx="30" cy="104" r="3"/><path d="M60 26 h30"/><path d="M60 65 h30"/><path d="M60 104 h30"/>`

- [ ] **Step 1: Add hero decor.** Inside `#hero`, right after the three existing `geo-shape` divs (after `index.html:69`), insert:

```html
    <!-- Parallax decor -->
    <div class="px-decor" aria-hidden="true">
      <div class="px-item px-glow" data-px="far" style="top: 8%; right: -6%; width: 480px; color: #00d4ff;">
        <!-- Laptop SVG here -->
      </div>
      <div class="px-item px-glow" data-px="mid" style="top: 18%; left: 3%; width: 170px; color: #7c3aed;" data-mobile-hide>
        <!-- Code glyph SVG here -->
      </div>
      <div class="px-item px-glow" data-px="mid" style="bottom: 22%; right: 4%; width: 180px; color: #00d4ff;">
        <!-- Terminal SVG here -->
      </div>
      <div class="px-item px-glow" data-px="near" style="bottom: 12%; left: 6%; width: 90px; color: #ec4899;" data-mobile-hide>
        <!-- Braces glyph SVG here -->
      </div>
    </div>
```

(Replace each comment with the full `<svg>` from the library above.)

- [ ] **Step 2: Add about decor.** Inside `#about` right after `<div class="about-floating-shapes"></div>` (`index.html:107`):

```html
    <div class="px-decor" aria-hidden="true">
      <div class="px-item px-glow" data-px="far" style="bottom: 5%; left: -5%; width: 420px; color: #7c3aed;">
        <!-- Braces glyph SVG -->
      </div>
      <div class="px-item px-glow" data-px="mid" style="top: 10%; right: 2%; width: 150px; color: #00d4ff;" data-mobile-hide>
        <!-- Git branch SVG -->
      </div>
      <div class="px-item px-glow" data-px="near" style="top: 45%; left: 2%; width: 80px; color: #00d4ff;">
        <!-- Code glyph SVG -->
      </div>
    </div>
```

- [ ] **Step 3: Verify.** Reload `http://localhost:8080` via Playwright at 1440×900. Screenshot hero and about (scroll to each). Confirm: items visible at correct faint opacities, none overlap text, items drift at different speeds when scrolling (screenshot at 2 scroll offsets and compare item positions relative to content). `document.body.scrollWidth === window.innerWidth` (no h-scroll). Console error-free. Also screenshot at 390×844 — far/mobile-hide items absent.

- [ ] **Step 4: Commit.** `git add index.html && git commit -m "Add hero and about parallax decor items"`

---

### Task 3: Decor layers for skills, AI, tools, experience, projects, contact

**Files:**
- Modify: `index.html` sections at lines ~234 (skills), ~372 (ai-skills), ~610 (tools), ~1279 (experience), ~1415 (projects), ~1953 (contact)

**Interfaces:**
- Consumes: SVG library + `.px-decor` pattern from Task 2.
- Produces: `relative z-10` added to the content wrappers of tools/experience/projects/contact (their `max-w-7xl` divs currently lack it; skills/ai/about/hero already have it). Task 4-6 rely on these z-index guarantees.

- [ ] **Step 1: Add `relative z-10`** to the `max-w-7xl` wrapper divs of `#tools` (line ~611), `#experience` (~1280), `#projects` (~1416), `#contact` (~1954): `class="max-w-7xl mx-auto px-4 ... relative z-10"`.

- [ ] **Step 2: Insert one `.px-decor` layer as the first child of each section**, thematically matched, alternating sides down the page (same markup pattern as Task 2):

  - `#skills`: far **bar chart** (left, `top: 12%; left: -5%; width: 400px; color: #00d4ff`), mid **line chart** (right, `top: 8%; right: 2%; width: 160px; color: #ec4899`, mobile-hide), near **code glyph** (right, `bottom: 10%; right: 5%; width: 85px; color: #7c3aed`).
  - `#ai-skills`: far **agent graph** (right, `top: 30%; right: -6%; width: 460px; color: #7c3aed`), mid **workflow** (left, `bottom: 15%; left: 2%; width: 190px; color: #00d4ff`, mobile-hide), near **git branch** (left, `top: 12%; left: 5%; width: 75px; color: #ec4899`).
  - `#tools`: far **server rack** (left, `top: 15%; left: -4%; width: 380px; color: #00d4ff`), mid **terminal** (right, `bottom: 20%; right: 2%; width: 170px; color: #7c3aed`, mobile-hide).
  - `#experience`: far **workflow** (right, `top: 20%; right: -5%; width: 440px; color: #00d4ff`), mid **git branch** (left, `top: 45%; left: 2%; width: 140px; color: #ec4899`, mobile-hide), near **braces glyph** (left, `bottom: 8%; left: 5%; width: 80px; color: #00d4ff`).
  - `#projects`: far **laptop** (left, `top: 25%; left: -6%; width: 460px; color: #7c3aed`), mid **terminal** (right, `top: 10%; right: 2%; width: 165px; color: #00d4ff`, mobile-hide), near **line chart** (right, `bottom: 12%; right: 4%; width: 90px; color: #ec4899`).
  - `#contact`: mid **agent graph** (right, `top: 15%; right: 2%; width: 160px; color: #00d4ff`, mobile-hide), near **code glyph** (left, `bottom: 15%; left: 3%; width: 80px; color: #7c3aed`).

- [ ] **Step 3: Verify.** Playwright full-page pass at 1440×900: screenshot each section; check no item overlaps text at 1280, 1440, 1920 widths (resize + screenshot); `document.body.scrollWidth === window.innerWidth` at each width; console clean; tools tabs still filter; counters still count.

- [ ] **Step 4: Commit.** `git add index.html && git commit -m "Add parallax decor to all remaining sections"`

---

### Task 4: Glassmorphic front cards

**Files:**
- Modify: `styles.css` (append `.px-glass` styles)
- Modify: `index.html` (3 cards: hero, skills, experience sections' decor layers)

**Interfaces:**
- Consumes: depth engine (`data-px="front"` → LAG -160 lead).
- Produces: `.px-glass` class; the three cards are `.px-item.px-glass[data-px="front"]` so the engine drives them with no extra JS.

- [ ] **Step 1: Append CSS** to `styles.css`:

```css
/* Foreground glass mini-cards */
.px-glass {
  background: rgba(18, 18, 26, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 24px rgba(0, 212, 255, 0.08);
  padding: 14px 16px;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  line-height: 1.7;
  z-index: 20;
  filter: none; /* glass cards don't inherit .px-glow blur/glow */
}

.px-glass .px-glass-dots { display: flex; gap: 5px; margin-bottom: 8px; }
.px-glass .px-glass-dots span { width: 8px; height: 8px; border-radius: 50%; }

.px-glass-bars { display: flex; align-items: flex-end; gap: 6px; height: 44px; margin-top: 6px; }
.px-glass-bars span { width: 10px; border-radius: 3px 3px 0 0; background: linear-gradient(180deg, #00d4ff, #7c3aed); }

.px-glass .px-pulse {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: #10b981; margin-right: 6px;
  animation: pulse 2s ease-in-out infinite;
}

@media (max-width: 1023px) {
  .px-item.px-glass { display: none; }
}
```

(Note: Tailwind's `animate-pulse` keyframes aren't available to plain CSS; add `@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }` alongside if `pulse` isn't already defined in `styles.css` — check with grep first.)

- [ ] **Step 2: Add the three cards** inside existing `.px-decor` layers:

Hero (`#hero .px-decor`), terminal card, left gutter:

```html
      <div class="px-item px-glass" data-px="front" style="bottom: 28%; left: 2%; width: 200px; color: #e2e8f0;">
        <div class="px-glass-dots"><span style="background:#ff5f57"></span><span style="background:#ffbd2e"></span><span style="background:#28c840"></span></div>
        <div><span style="color:#00d4ff">$</span> npm run deploy</div>
        <div style="color:#10b981">&#10004; build passed</div>
        <div style="color:#10b981">&#10004; deployed in 3.2s</div>
      </div>
```

Skills (`#skills .px-decor`), analytics card, right gutter:

```html
      <div class="px-item px-glass" data-px="front" style="top: 40%; right: 1%; width: 170px; color: #e2e8f0;">
        <div style="color:#94a3b8">performance</div>
        <div class="px-glass-bars">
          <span style="height:40%"></span><span style="height:65%"></span><span style="height:50%"></span><span style="height:85%"></span><span style="height:100%"></span>
        </div>
        <div style="color:#10b981; margin-top:6px">&#9650; +32% this sprint</div>
      </div>
```

Experience (`#experience .px-decor`), agent status card, right gutter:

```html
      <div class="px-item px-glass" data-px="front" style="top: 30%; right: 1%; width: 185px; color: #e2e8f0;">
        <div><span class="px-pulse"></span>Agent running</div>
        <div style="color:#94a3b8">task: refactor api</div>
        <div style="color:#00d4ff">tools: 4 active</div>
      </div>
```

- [ ] **Step 3: Verify.** Playwright 1440×900: cards render glassy, move noticeably faster than page content while scrolling (two-offset screenshot comparison), never cover text at 1280/1440/1920. Hidden at 390px. Console clean.

- [ ] **Step 4: Commit.** `git add index.html styles.css && git commit -m "Add glassmorphic foreground parallax cards"`

---

### Task 5: Pinned moment 1 — hero exit

**Files:**
- Modify: `script.js` (inside `initParallax` IIFE, after depth engine)

**Interfaces:**
- Consumes: `isDesktop` from Task 1; hero markup (`.hero-character-glow` inner wrapper — NOT `.hero-character-wrapper`, which carries `animate-on-scroll` and must not receive GSAP transforms; scroll indicator is the `div.absolute.bottom-6` in `#hero`).
- Produces: nothing consumed later; pin uses `yPercent`/`opacity` so it composes with the depth engine's `y` tweens on the same items.

- [ ] **Step 1: Give the scroll indicator a hook.** In `index.html:95` add an id: `<div id="heroScrollHint" class="absolute bottom-6 ...">`.

- [ ] **Step 2: Add pin code** inside the IIFE:

```js
  // Pinned moment 1: hero exit — avatar lifts away, foreground flies past.
  if (isDesktop) {
    var heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '+=70%',
        scrub: true,
        pin: true,
        anticipatePin: 1
      }
    });
    heroTl
      .to('.hero-character-glow', { yPercent: -25, opacity: 0, ease: 'none' }, 0)
      .to('#hero .px-item[data-px="near"], #hero .px-item[data-px="front"]', { yPercent: -120, ease: 'none' }, 0)
      .to('#hero .px-item[data-px="mid"]', { yPercent: -60, ease: 'none' }, 0)
      .to('#heroScrollHint', { opacity: 0, ease: 'none' }, 0);
  }
```

- [ ] **Step 3: Verify.** Playwright 1440×900: scroll slowly from top — hero holds while avatar drifts up/fades and items sweep past, then releases into About. Click nav "About", "Projects", "Contact" links — each lands on the correct section heading (pin spacing must not break anchors). Reload mid-page — no layout jump. 390×844: no pin (page scrolls straight through). Console clean.

- [ ] **Step 4: Commit.** `git add index.html script.js && git commit -m "Add hero exit pinned parallax moment"`

---

### Task 6: Pinned moment 2 — AI section agent-graph draw

**Files:**
- Modify: `index.html:376-380` (wrap AI header, add backdrop SVG)
- Modify: `styles.css` (backdrop styles)
- Modify: `script.js` (pin + draw timeline)

**Interfaces:**
- Consumes: `isDesktop`; `.px-glow`.
- Produces: `.ai-pin-wrap`, `.ai-graph-bg` with `.ai-graph-lines path` (each `pathLength="1"`) and `.ai-graph-nodes circle`.

- [ ] **Step 1: Wrap the AI header.** In `#ai-skills`, wrap the `<h2>`, `.section-title-bar`, and intro `<p>` (lines 376-380) in:

```html
      <div class="ai-pin-wrap relative">
        <svg class="ai-graph-bg" viewBox="0 0 900 300" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <g class="ai-graph-lines">
            <path pathLength="1" d="M120 150 L300 70"/>
            <path pathLength="1" d="M120 150 L300 230"/>
            <path pathLength="1" d="M300 70 L480 150"/>
            <path pathLength="1" d="M300 230 L480 150"/>
            <path pathLength="1" d="M480 150 L640 60"/>
            <path pathLength="1" d="M480 150 L640 240"/>
            <path pathLength="1" d="M640 60 L790 150"/>
            <path pathLength="1" d="M640 240 L790 150"/>
          </g>
          <g class="ai-graph-nodes">
            <circle cx="120" cy="150" r="14"/>
            <circle cx="300" cy="70" r="14"/>
            <circle cx="300" cy="230" r="14"/>
            <circle cx="480" cy="150" r="14"/>
            <circle cx="640" cy="60" r="14"/>
            <circle cx="640" cy="240" r="14"/>
            <circle cx="790" cy="150" r="14"/>
          </g>
        </svg>
        <h2 ...existing h2...>AI &amp; Intelligence</h2>
        <div class="section-title-bar mx-auto mb-4"></div>
        <p ...existing p...>...</p>
      </div>
```

- [ ] **Step 2: Backdrop CSS** (append to `styles.css`):

```css
/* AI section pinned agent-graph backdrop */
.ai-graph-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(900px, 92%);
  color: #7c3aed;
  opacity: 0.22;
  pointer-events: none;
  filter: drop-shadow(0 0 8px currentColor);
}

.ai-graph-lines path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

@media (max-width: 1023px) { .ai-graph-bg { display: none; } }
@media (prefers-reduced-motion: reduce) { .ai-graph-bg { display: none; } }
```

- [ ] **Step 3: Pin + draw** (inside IIFE):

```js
  // Pinned moment 2: AI header holds while the agent graph draws itself.
  if (isDesktop) {
    var aiTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.ai-pin-wrap',
        start: 'center center',
        end: '+=55%',
        scrub: true,
        pin: true,
        anticipatePin: 1
      }
    });
    aiTl
      .to('.ai-graph-lines path', { strokeDashoffset: 0, stagger: 0.08, ease: 'none' }, 0)
      .from('.ai-graph-nodes circle', { scale: 0, transformOrigin: '50% 50%', stagger: 0.05, ease: 'none' }, 0);
  }
```

- [ ] **Step 4: Verify.** Playwright 1440×900: scroll into AI section — header pins, lines draw progressively, nodes pop in, releases cleanly; capability cards below still reveal normally. Nav anchor `#ai-skills` and later anchors (`#experience`) still land correctly with both pins active. Mobile 390px: no pin, no graph. Console clean.

- [ ] **Step 5: Commit.** `git add index.html styles.css script.js && git commit -m "Add AI section pinned agent-graph draw"`

---

### Task 7: Free-flow choreography — timeline draw, card/title micro-parallax, geo-shape depth

**Files:**
- Modify: `styles.css:781-784` (`.animate-on-scroll.in-view` rule)
- Modify: `script.js` (inside IIFE)

**Interfaces:**
- Consumes: existing `.timeline-line` / `.timeline-line-mobile` (note: desktop line is centered via `-translate-x-1/2` — GSAP must preserve `xPercent: -50` or the line shifts right), grids `#skills .grid`, `#projects .grid`, `.bento-grid`, `.section-title`, `.geo-shape`.
- Produces: CSS var `--px-shift` consumed by the modified `.in-view` transform.

- [ ] **Step 1: Make reveal transform parallax-composable.** In `styles.css`, change:

```css
.animate-on-scroll.in-view {
  opacity: 1;
  transform: translateY(var(--px-shift, 0px)) translateX(0) scale(1);
}
```

- [ ] **Step 2: Timeline draw** (inside IIFE — runs on all viewports; cheap):

```js
  // Experience timeline lines draw with scroll.
  gsap.fromTo('.timeline-line',
    { scaleY: 0, xPercent: -50 },
    { scaleY: 1, xPercent: -50, transformOrigin: 'top center', ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: true } });
  gsap.fromTo('.timeline-line-mobile',
    { scaleY: 0 },
    { scaleY: 1, transformOrigin: 'top center', ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: true } });
```

- [ ] **Step 3: Card column micro-parallax via `--px-shift`** (desktop only — animates the CSS var, so it never fights the reveal transition):

```js
  // Grid cards: alternating column drift for subtle 3D depth.
  if (isDesktop) {
    ['#skills .grid', '#projects .grid', '.bento-grid'].forEach(function (sel) {
      var grid = document.querySelector(sel);
      if (!grid) return;
      Array.prototype.forEach.call(grid.children, function (card, i) {
        var amp = i % 2 === 0 ? 16 : -16;
        gsap.fromTo(card, { '--px-shift': amp + 'px' }, {
          '--px-shift': (-amp) + 'px',
          ease: 'none',
          scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    });

    // Section titles drift slightly slower than their content.
    gsap.utils.toArray('.section-title').forEach(function (title) {
      gsap.fromTo(title, { '--px-shift': '-14px' }, {
        '--px-shift': '14px',
        ease: 'none',
        scrollTrigger: { trigger: title.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }
```

- [ ] **Step 4: Geo shapes join the depth system.** The `.geo-shape` CSS animation owns `transform` (rotate keyframes), so GSAP must animate the shapes via `y` on a per-shape basis is NOT safe — instead give them depth through their existing container by adding `data-px` drift wrappers is unnecessary scope. Do the minimal safe version: animate `top` is layout-thrashing — skip. **Concrete action:** wrap each `.geo-shape` div (`index.html:67-69`) in a plain positioned div that takes over the placement, and move the shape inside:

```html
    <div class="px-item" data-px="mid" style="top: 15%; left: 8%; width: 120px;"><div class="geo-shape geo-shape-1" style="position: static; width: 100%; height: 120px;"></div></div>
    <div class="px-item" data-px="near" style="top: 20%; right: 10%; width: 80px;"><div class="geo-shape geo-shape-2" style="position: static; width: 100%; height: 80px;"></div></div>
    <div class="px-item" data-px="far" style="bottom: 20%; left: 15%; width: 60px;"><div class="geo-shape geo-shape-3" style="position: static; width: 100%; height: 60px;"></div></div>
```

The wrapper gets GSAP `y`; the inner keeps its rotate keyframes. (`.px-item` opacity rules will fade them by depth — acceptable and consistent. The `@media (max-width:480px) .geo-shape{display:none}` rule still applies.)

- [ ] **Step 5: Verify.** Playwright 1440×900: timeline line draws while scrolling Experience (desktop line stays centered on the dots — regression check for `xPercent`); skills/projects/bento cards show subtle opposing drift; titles lag slightly; reveals still play on first scroll into each section (hard refresh, then scroll slowly — cards must still fade in). Geo shapes still rotate AND now drift. 390px: reveals fine, no column drift. Console clean.

- [ ] **Step 6: Commit.** `git add index.html styles.css script.js && git commit -m "Add timeline draw, card/title micro-parallax, geo-shape depth"`

---

### Task 8: Final regression + multi-viewport verification sweep

**Files:**
- No new code expected; fix-ups only if checks fail.

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Full desktop sweep.** Playwright 1440×900 at `http://localhost:8080` (hard reload): step-scroll the entire page in ~8 increments, screenshot each. Check: both pins engage/release; decor speeds layered; no element overlaps text; footer reachable; back-to-top works.
- [ ] **Step 2: Interaction regression.** Preloader clears; typewriter cycles; particle canvas reacts to mouse; custom cursor moves; stat counters count; marquee scrolls; tools tabs filter; contact form fields focus; every navbar anchor lands on its section; back-to-top returns to hero (pinned) correctly.
- [ ] **Step 3: Width sweep.** 1920, 1600, 1280, 1024, 768, 390 px: at each, `browser_run_code_unsafe` → `document.body.scrollWidth <= window.innerWidth` must be true; screenshot hero + one mid section; on <1024 confirm no pins and reduced decor.
- [ ] **Step 4: Reduced motion.** Emulate `prefers-reduced-motion: reduce` (Playwright `browser_run_code_unsafe` can't set it — relaunch context via `browser_resize` won't either; instead verify by code inspection that the guard returns early, and manually toggle via macOS setting if available; minimum bar: confirm the early-return guard + CSS override exist and the page functions with `initParallax` returning early by temporarily testing `gsap` undefined path in DevTools: `delete window.gsap` before script would be needed — acceptable to verify guard by reading code).
- [ ] **Step 5: Console + network.** Zero console errors/warnings from our code; GSAP loads from cdnjs (200s in `browser_network_requests`).
- [ ] **Step 6: Fix anything found, re-verify, then commit** any fixes: `git add -A && git commit -m "Polish parallax after full regression sweep"` (skip commit if no changes).

---

## Self-Review (done at planning time)

- **Spec coverage:** depth system (T1), item inventory + gutter placement (T2-3), glass cards (T4), pin 1 (T5), pin 2 + graph draw (T6), timeline draw + title/card drift + geo shapes join (T7), mobile/reduced-motion/CDN-failure guards (T1, T4, T5-7 desktop gates), verification (every task + T8). Anchor-nav and overflow-x regressions explicitly tested (T5, T3, T8).
- **Known deviation from spec:** none — "per-column y offsets" implemented as alternating per-card `--px-shift` which composes with the reveal system.
- **Type consistency:** `LAG` map + `data-px` names consistent across tasks; `--px-shift` defined in T7 CSS and only used there; `.px-glass` defined T4, referenced T5 selector `#hero .px-item[data-px="front"]` (matches — glass cards carry `data-px="front"`).
