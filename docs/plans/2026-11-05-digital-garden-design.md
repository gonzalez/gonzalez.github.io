# Design — gonzalez.github.io digital-garden rebuild (Astro)

**Status**: implemented (2026-11-06) — Astro garden shipped; Next.js sources and deploy workflow retired
**Date**: 2026-11-05
**Repo**: `~/agentic-dev/repos/gonzalez.github.io` (GitHub user-pages site, default branch **master**, origin `gonzalez/gonzalez.github.io`)
**Supersedes**: the 2026-11-03 "hardware refresh" plan (Next.js incremental) — superseded by the operator's own comprehensive spec, embedded below. The DDC Hardware 45 rasterized-wordmark approach and the EULA constraints carry over; the Next.js implementation tasks are retired.

## Operator spec (verbatim, 2026-11-05)

> Build a minimalist personal website inspired by the digital-garden philosophy —
> timeless, understated, highly readable, technically elegant. Avoid corporate-résumé,
> SaaS-landing or conventional-portfolio looks. Content first, radical simplicity,
> intentional whitespace, quiet sophistication, fast/lightweight, timeless, human.
> References (concept, not copy): paco.me, maggieappleton.com, gwern.net, sive.rs.
>
> Typography: clean readable sans (Inter/Geist/system-ui), optional serif editorial
> headings, mono for metadata; body 16–18px / 1.6–1.8 line height / 680–740px reading
> column; hierarchy by type, not decoration.
>
> Palette (light `#FAFAF8` bg / `#242424` text / `#737373` secondary / `#E8E8E5`
> borders / muted slate accent; dark `#151515` / `#EAEAEA` / `#999999` / `#303030`),
> system theme detection + optional toggle.
>
> Single centered column, 760–800px container, generous spacing, minimal nav,
> no hero art, no shadows, no decorative backgrounds; typeset-notebook feel.
>
> IA: Home (wordmark, nav Home/Writing/Projects/About, theme toggle, short personal
> intro, Currently Exploring (3–5 active interests), Selected Projects (text list),
> Recent Writing, minimal footer), Writing (digital garden: seedling/growing/
> evergreen, title/description/dates/tags/maturity/MDX/internal links, filterable
> index — no big-image blog), Projects (text directory: name, one-liner, tech,
> status, GitHub link), About (concise personal).
>
> Interaction: restrained hovers, underlined links, keyboard-accessible nav,
> fast transitions, optional reading progress on long articles, prefers-reduced-motion,
> no scroll-triggered animation.
>
> Stack: Astro SSG, TypeScript, Tailwind CSS, Markdown/MDX, Astro Content
> Collections, minimal client JS, static hosting. Content-as-files in the repo
> (`src/content/writing`, `src/content/projects`, `src/content/config.ts`),
> components/layouts per the given tree, example content included.
>
> Features: mobile-first responsive, light/dark, RSS, sitemap + SEO, accessible
> semantic HTML, code syntax highlighting, TOC for long articles, internal links
> between notes, excellent Lighthouse, clean slugs. Avoid analytics/comments/databases/auth/CMS.
>
> Workflow: review the existing repo first; propose IA + visual direction; light
> plan; reusable components; incremental implementation; validate responsive/
> a11y/performance; run build/lint/typechecks; document how to add content. Use
> Superpowers brainstorming before implementation (done — this doc series).
>
> DoD: feels like a thoughtful developer's garden; fast + beautiful mobile/desktop;
> writing/projects discoverable; content via markdown; accessible + SEO; visually
> stable for years. Final design test: remove any visual element that does not
> improve clarity.

**Operator adds (2026-11-05): "**use DDC**" — the purchased DDC Hardware 45 stays the identity font, per the 2026-11-03 rasterized-images decision: the site masthead/wordmark renders in DDC (PNG, EULA-clean). Reading text follows the operator spec's typography. The EULA credit line remains in the footer.

## Repo realities (verified 2026-11-05)

- Default branch is **`master`** (not `main`) — the loop's engine config must set `git.base_branch: master` per run (a one-line config-override, verified pattern from finfocus runs). Platform follow-up queued: auto-detect `origin/HEAD`.
- Legacy existed as one commit (static Next.js portfolio, repo-snapshot listing). **Retired by the cleanup commit** (the Next.js sources — `next.config.mjs`, `src/app`, `src/content/site.ts`, `src/content/repos-snapshot.json`, the `next build` deploy workflow — are deleted; the commit message points back at this design).
- The board task files for the superseded 2026-11-03 plan (TASK-1..3) are archived, not executed.
- Publish = the operator's explicit `git push` to origin master (Pages serves it). Local-only posture preserved: the loop only ever commits locally. The Next.js deploy workflow is retired with the rest of the Next.js era: nothing rebuilds or deploys automatically, so the operator publishes the locally built `dist/` to the branch Pages serves (branch deploy, not "GitHub Actions").
- Font: `DDCHardware45-Regular.otf` (licensed operator copy) → rasterizer (same `tools/render_wordmark.py` approach as the retired plan: Pillow, deterministic, PNG @1×/2× for the masthead; **never a webfont**). Reuse is additive: the rasterizer manuscript from the retired plan survives into this build (Task 1 below), so no re-typing.

## Approach (chosen: Astro rebuild)

**A. Astro rebuild (chosen)**: new Astro static site in this repo, staged content per the operator's tree; Next.js retired after parity. Matches the operator's own stack guidance, makes the garden "content-as-files" real, and shrinks client JS to ~zero (g RSS focus). Trade-off: rewrite of one page's worth of UI (cheap — the legacy is a single listing page).
**B. Next.js incremental**: rejected — contradicts the operator's preferred stack and drags a runtime into a garden notebook.

## Goals

1. Astro static build serving the four pages (Home, Writing index + notes, Projects, About) with the garden model (maturity enum, dates, tags, MDX+internal links).
2. Typography/palette per spec; masthead = DDC rasterized wordmark + typed headings.
3. Theme toggle + system detection; RSS; sitemap; semantic HTML + a11y; syntax highlighting; TOC on long notes; reading progress optional (spec allows).
4. Content = files under `src/content/{writing,projects}`, seeded with **real** entries: (a) the agentic outer loop platform post (seedling→growing), (b) Datums site post, (c) FinFocus #1863 robust-median contribution (evergreen, linked to the merged PR), plus 2–3 seedling placeholders only where genuinely exploratory運. **No invented claims/customers.**
5. Lighthouse-mob-ready basics: system fonts + 2 rasterized masthead images + inline critical CSS (Tailwind JIT legacy) → tiny payload; `astro build` static.

## Non-goals / anti-goals

Per operator spec: no analytics, comments, DB, auth, CMS; no scroll-triggered animation; no hero art beyond the rasterized wordmark; no big-image blog. Deploy automation stays manual (operator pushes Pages). No socials block (operator decision carries over). **Anti-goals**: font served as webfont (EULA), invented identities/customers in content, corporate-résumé vibes, marketing copy.

## Verification

- Engine loop on this repo (validation command): `npm run check && npm run build && node scripts/verify-site.mjs` — a node verify script asserting: `dist/` has index + writing + projects + about; RSS exists; no asset named like a font in dist; the sitemap lists all four roots. The `astro check` type gate plus the script = the commissioning proof. (unittest doesn't apply to an Astro repo — the loop's `--test-command` carries this node command; pattern proven in the finfocus run.)
- Rasterizer: unit tests as in the retired plan (deterministic bytes, fonts present, fail-loud).
- Operator visual review at `npx serve dist` before any push (local-only posture; publish = operator's later push).

## Builder inventory

- Repo path `~/agentic-dev/repos/gonzalez.github.io`, branch `master` (engine config override: `git.base_branch: master`).
- Operator font: `~/Downloads/DDC Hardware 45/OpenType/DDCHardware45-Regular.otf` (vendored under `assets/fonts-src/`, gitignored).
- License-PDF sits alongside the font (EULA credit required in the footer).
- Board tasks: retire the February 3 plan (TASK-1..3 archived), then implement per the plan this design births.

## Open (theirs/builders pre-check)

- The operator's name/handle copy: the site identifies as `gonzalez` (the existing wordmark); realname text optional.
- Writing seeds list: confirm the three real posts above, plus the seedling placeholder topics ("digital-garden philosophy works", "provider-fallback economics") — or supply topics.

