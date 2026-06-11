# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for **Longeia** ("Centro de Bienestar" — a wellness brand). It is a static Vite site with **no framework**: hand-written `index.html`, vanilla TypeScript for interactions, and a layered CSS system. UI copy is in **Spanish** — keep new content in Spanish to match.

## Commands

The repo uses **pnpm** (see `pnpm-lock.yaml`).

```bash
pnpm dev        # Vite dev server with HMR
pnpm build      # tsc type-check (noEmit) THEN vite build → dist/
pnpm preview    # serve the production build
```

There is no test runner and no linter. `pnpm build` is the only gate: `tsc` runs first as a strict type-check (it emits nothing — `noEmit: true`), so a type error fails the build before Vite bundles. Run `pnpm build` to validate TypeScript changes.

## Architecture

### Entry point
`src/main.ts` is the single entry (loaded by `index.html` indirectly via the CSS link + Vite). It:
1. Sets up [Lenis](https://github.com/darkroomengineering/lenis) smooth scrolling — **gated on `prefers-reduced-motion`** (skipped entirely if the user prefers reduced motion).
2. Calls three init functions, each idempotent and DOM-query-driven: `initHeroCarousel()`, `initCarousels()`, `initReveal()`.

### Interaction scripts (`src/scripts/`)
Each script is a standalone `init*()` function that queries the DOM by `data-*` attributes and bails out (`return`) if its required elements are absent. There is no shared state or framework — HTML is the source of truth and scripts attach behavior to it.

- **`hero-carousel.ts`** — the hero's index-based carousel. Shifts `[data-carousel-track]` by setting a `--carousel-index` CSS custom property (CSS does the transform). Shows `VISIBLE_CARDS = 3` at a time; nav buttons get `data-disabled` at the ends.
- **`carousel.ts`** — generic **scroll-snap** carousel (used by Productos & Viandas). Different mechanism from the hero: it `scrollBy`s a `[data-carousel-viewport]` by one card+gap. Any `[data-carousel]` block with viewport + prev/next buttons gets wired automatically.
- **`reveal.ts`** — IntersectionObserver that **toggles** `is-visible` on `.reveal` elements while in view: the transition plays as an exit animation when they leave and re-runs on every re-entry. Containers with `data-reveal-stagger="<ms>"` cascade their children in/out (`.reveal-item` + incremental `--reveal-delay`). Falls back to showing everything immediately under reduced-motion or when IO is unavailable.
- **`scroll-link.ts`** — scroll-linked motion recomputed every frame (plays forward and in reverse). Elements with `data-scroll-from="left|right|zoom"` slide/scale toward their natural position as they rise through the viewport and split apart again when exiting through the top; `data-scroll-distance` (px) tunes the offset. Used by About and the Comunidad mosaic — sections using it need `overflow-x: clip`.

The hero and the section carousels are **two separate implementations** — don't assume changing one affects the other.

### CSS system (`src/styles/`)
`main.css` is a manifest of `@import`s in strict cascade order: `base/` (variables, reset, global) → `layout/` (primitives) → `sections/` (one file per page section). When adding a section, create `sections/<name>.css` and add its `@import` to `main.css` in the right position.

- **`base/variables.css`** is the design-token source of truth. It is split into a **raw palette** and **semantic tokens** (`--color-accent`, `--color-surface`, `--text-display-md`, `--spacing-*`, `--radius-*`, `--motion-*`, etc.). **Style with semantic tokens, not raw hex/palette vars.** The accent tokens are currently *neutralised placeholders* — the comment notes the brand color isn't committed yet; changing the three `--color-accent*` vars re-themes the whole site.
- The **Hero is legacy**: it predates the token system and still uses raw `--terra*` brand vars and back-compat aliases (`--linea`). New sections use the semantic tokens. Treat the hero as a different convention from everything below it.
- **`layout/primitives.css`** holds reusable classes (`.container`, `.container--narrow`, `.eyebrow`, `.section-title`, `.text-link`, `.btn`/`.btn--dark`, `.reveal`). Reuse these before writing new section CSS.

### Conventions
- JS↔HTML contract is **`data-carousel*` attributes**, not classes/IDs. New carousel markup must use the same attribute names to be picked up.
- Section files are named in Spanish (`viandas`, `marcas`, `comunidad`, `productos`) matching `id`s in `index.html`.
- Fonts (Fraunces for titles, Roboto for body, Great Vibes for script accents) load from Google Fonts in `index.html`; `--font-title` / `--font-body` / `--font-script` reference them.

## Skills

`.agents/skills/` vendors two skills (tracked in `skills-lock.json`): **frontend-design** (anthropics/skills) and **css-animations** (heygen-com/hyperframes). They are relevant when designing UI or writing animations here.
