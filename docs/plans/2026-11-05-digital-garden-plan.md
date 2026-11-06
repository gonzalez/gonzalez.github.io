# gonzalez.github.io Digital-Garden Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A rebuild of `gonzalez.github.io` on Astro as a digital garden per the operator's embedded spec: content-as-files writing (maturity model) + a text projects directory + About, DDC Hardware 45 rasterized identity, light/dark, RSS/sitemap/SEO, near-zero client JS, GitHub Pages static hosting, agent-loop built locally.

**Architecture:** Astro static site in `~/agentic-dev/repos/gonzalez.github.io` (default branch `master`), content collections (`src/content/{writing,projects}` + `content.config.ts`), one global stylesheet inlined into each page's `<head>` (garden-sized CSS), DDC wordmark rasterized at build time as PNGs. Loop validation carries the Python rasterizer suite + Astro check + build + site-contract Node script (one command, proven pattern).

**Tech Stack:** Astro (^5), TypeScript, Tailwind CSS v4 via `@tailwindcss/vite`, MDX (content collections), `@astrojs/rss`, Pillow (rasterizer), Node verify script, Python unittest.

**Spec:** `docs/plans/2026-11-05-digital-garden-design.md` (operator spec embedded verbatim; approved approach A — Astro rebuild; the 2026-11-03 Next.js plan is retired, its rasterizer task survives here)

## Global Constraints

- Branch: engine/engine config override `git.base_branch: master`; loop commits only locally on `agent/TASK-n` branches from master (operator merges + pushes; upstream untouched).
- DDC font: rasterized PNG only; `assets/fonts-src/` gitignored; **no font binaries in `dist/`**; EULA credit verbatim in footer:
  `DDC Hardware 45 © Aaron James Draplin & Brian Bonislawsky via DDC Fonts – www.ddcfonts.com`
- Copy discipline: every post/project/about statement must derive from real session work (`github.com/gonzalez/agent-dev-setup` public; FinFocus PR rshade/finfocus/pull/2022 public; Datums repo local-only → Datums posts describe it and link to `datums.net` when live — **operator verifies link targets at publish**; seedling drafts exist for genuinely exploratory topics only).
- Loop validation gate (single command):
  `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`
- retired: the entire 2026-11-03 Next.js plan (board archived; sources deleted in Task 2's cleanup commit).

## Review Focus

1. **Reading column on mobile** — 680–740px cap must not break <430px viewports (clamp: `max(0.5rem, calc((100% - 680px)/2)))` + vanilla responsive padding). Pinned: `test_verify_script_uses_clamp` (Task 1) + visual review.
2. **Dark wordmark invisible** — rasterized dark-ink PNG on dark bg. Pinned: Task 3 renders **two variants (light-ink #242424 for light, ivory #EAEAEA for dark)** with `unavailableAnomalyDrift`-style CSS `prefers-color-scheme` swap + toggle; tests assert both assets exist (Task 3).
3. **RSS malformed** — missing title/date breaks parsers. Pinned: Task 2 asserts `dist/rss.xml` parses as XML and all items have title+pubDate (Task 2).
4. **Note slugs collide** — `/writing/<slug>` uniqueness. Pinned: Task 2 verify scriptfails on duplicate slugs across collections (Task 2).
5. **TOC on short notes** — TOC only injected for notes with ≥3 h2s (Task 3: conditional injection, tested).

---

## File Structure (final tree)

```
gonzalez.github.io/
  astro.config.mjs               # static + site config + Tailwind v4 via @tailwindcss/vite
  package.json                   # scripts: dev/build/check/verify; deps: astro, mdx-js, tailwind, rss, sharp?, react-toggle? NO react — vanilla
  src/
    content/config.ts
    content/writing/*.md(x)
    content/projects/*.json (or md)
    components/{Header,Footer,ThemeToggle,NoteList,ProjectList,Toc,ProgressBar}.astro
    layouts/{BaseLayout,ArticleLayout}.astro
    pages/{index,writing/[...slug],projects,about}.astro
    pages/rss.xml.js
    styles/global.css            # tokens + inlined into head at build
  scripts/
    render_wordmark.py           # deterministic Pillow rasterizer (from retired plan)
    verify-site.mjs              # contract probes (assertions above)
    prebuild-wordmark.sh         # wordmark + section pill renders → public/assets/word/
  public/assets/word/*.png       # wordmark light/dark @1x2x
  assets/fonts-src/              # gitignored OTF (operator fixture)
  tests/test_rasterizer.py       # unittest (rasterizer contracts)
```

## Tasks

### Task 1: Rasterizer intake + garden scaffold (Astro init + Tailwind + content config)

- [ ] **Files** per tree above; delete Next.js sources (`next.config.mjs`, `src` old files? — Next folders handled here: `package.json` rewritten; cleanup commit = removal step)
- [ ] **RED** — unittest `test_rasterizer.py` (same contracts as retired plan: 1x/2x deterministic sha256, transparent, missing-font fail-loud, max-width) runs, rasterizer exists.
- [ ] **GREEN** — implement `scripts/render_wordmark.py` (Pillow) + prebuild shell script.
- [ ] **Verify** — `python3 -m unittest discover tests` green; fixture font vendored (gitignored); `npm run check && npm run build` green on scaffold.
- [ ] Commit `feat(garden): astro scaffold + wordmark rasterizer`.

### Task 2: Content collections + writing/projects/about pages + RSS + verify script

- [ ] `src/content/config.ts`: `writing` collection (title, description, createdDate, updatedDate, tags, maturity enum seedling|growing|evergreen, draft, body) + `projects` collection (name, description, technologies, status, github link, writeUp optional).
- [ ] Pages: writing index with **filter at compile time per maturity/topic** (URL params for runtime filter via query, no JS) + note pages with ArticleLayout; projects page text directory; about page; home with Currently Exploring + Selected Projects + Recent Writing (5).
- [ ] RSS: `@astrojs/rss` wired to writing collection with real dates.
- [ ] `scripts/verify-site.mjs` contract probes (dist pages exist, rss parses, no font binaries, slug uniqueness, home contains muted garden markers).
- [ ] Seed content (real, from session work): two evergreen/growing posts + one seedling + project entries (outer loop platform, Datums web presence, FinFocus robust-median contribution with PR link, `hello-agent`/`agentic-ruby` one-liners). Copy sourced from the session ledger; **no invented claims**; operator revises copy before publish.
- [ ] **RED→GREEN** on verify-script probes; commit `feat(garden): content collections + pages + rss/verify`.

### Task 3: DDC identity + theme mechanics + polish

- [ ] Tailwind v4 tokens per spec palette (light + dark), masthead swap via system/toggle (monthly-agnostic): wordmark variants (light-ink/dark-ink).
- [ ] Reading progress optional on long articles (`prefers-reduced-motion` respected); footer EULA credit; minimal nav; syntax highlighting for code blocks; TOC-conditional (≥3 h2s).
- [ ] Verify loop: contract + reading column clamp + both wordmark variants exist + RSS valid.
- [ ] Commit `feat(garden): identity + theme + polish`.

### Task 4: Retire Next.js + docs

- [ ] Cleanup commit: delete `next.config.mjs`/`next`-era sources; update README (garden philosophy, how to add notes/projects, rasterizer, license + EULA line, publish = operator push).
- [ ] Verify full gate command green; design doc status row updated; board archive order preserved.
- [ ] Commit `docs/retire: next.js era closes at astro garden`.

---

## Self-review

- **Spec coverage**: all operator-spec sections → tasks 2–4 (Astro/collections/garden model/theme/RSS/SEO/sitemap/highlight/TOC/internal links/Lighthouse left to operator review — documented); DDC fold (masthead only) ✓; Next.js retirement ✓.
- **Step scan**: each task one deliverable; verification commands copy-precise.
- **Type consistency**: verify command identical everywhere: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`.
- **Review Focus**: mobile clamp/unwritable RSS/slug collision/TOC-conditional/dark wordmark — Test plan pins (1, 3, 4 in verify script; 2, 5 in task assertions/conditional logic).
- **Proportion**: ~220 words per task; spec carries design authority.
