# Design — Homepage holding page + DDC rasterized headings

**Status**: proposed
**Date**: 2026-11-06
**Repo**: `~/agentic-dev/repos/gonzalez.github.io`
**Follows**: 2026-11-05 digital-garden design (site structure unchanged; homepage simplified per operator 2026-11-06, TASK-9)

## Intent and why

The operator wants the site to read as **DDC Hardware 45 everywhere** ("DDC for all
fonts") and the **homepage stripped to a simple holding page** that tells visitors
**"more is coming soon."** `/writing`, `/projects`, `/about`, RSS, sitemap, and SEO
stay as they are; nothing is deleted — the garden homepage sections simply stop
being the front door.

## Goals

- Homepage = holding page: DDC wordmark PNG, one short line of copy, explicit
  "more is coming soon" marker; global nav + footer (EULA credit) unchanged.
- All static page headings — `Writing`, `Projects`, `About`, plus the holding
  headline — render as DDC Hardware 45 PNGs (light + dark ink, 1x + 2x) with alt
  text, matching the wordmark pattern already in production.

## Non-goals (this change)

- Article titles on individual notes (dynamic strings per note) stay the current
  system-font h1. Queued as a possible follow-up, not here.
- Body/reading text stays the system stack (`--font-sans` / `--font-mono` tokens).
- No content, routes, RSS, or layout changes beyond `index.astro` + heading markup.

## Anti-goals (what would make this a failure)

- Serving the DDC OTF as a webfont — prohibited by the DDC Fonts EULA §2.1.
- Body text rasterized into images (unreadable, not selectable, not searchable).
- A holding page that breaks the live `verify-site.mjs` contract suite.

## Constraints

- **EULA**: rasterized images for websites permitted (§2.2); font file never
  committed or served; footer credit line stays verbatim.
- **CI path**: the licensed OTF is a gitignored local fixture (only 2 licensed
  machines). Heading PNGs must be **committed** so CI builds without the font,
  exactly like the committed wordmark PNGs (prebuild skips local render when
  PNGs are present and the font is absent).
- Theme variants: every rendered string ships `light/` (#242424 ink) + `dark/`
  (#EAEAEA ink) at 1x and 2x — four files per heading, CSS swap as today.
- **Verification posture**: `verify-site.mjs` home probes change with the page
  (contract tests updated in the same commit — RED→GREEN); the full gate stays
  one command: rasterizer suite + `npm run check` + build + verify probes.

## Approaches considered

- **A. Rasterized display type (chosen)** — extend the existing build-time
  rasterizer to the static heading strings. Only path that matches "DDC for all
  fonts" within the EULA; infrastructure already exists; adds committed PNGs
  (~KB-scale) and prebuild entries.
- **B. Wordmark only** — rejected: does not deliver the operator's ask.
- **C. Lookalike OFL font for headings** — rejected: not DDC; contradicts the ask.
- **D. Special DDC webfont license** — rejected for now: costs money and an
  operator purchase; rasterization needs none. Revisitable if body text in DDC
  is ever wanted.

## Parts decided by the operator

- Simplify **only the homepage**; all other pages and RSS stay live. ✅
- Approach **A**, applied **site-wide** to static headings. ✅

## Calls I made (builder's defaults — reject any)

- Holding-page copy (draft, operator may rewrite before publish): wordmark, then
  a single muted line — *"Glad you're here. Most of the garden is still in the
  ground — more is coming soon."*
- Global nav on the homepage **stays** (the other pages are still live).
- Heading PNG alt text = the heading text itself; the visual PNG carries it only
  where the rasterizer succeeded — otherwise the text h1 renders as-is (fail-safe,
  build still green).
- Note-title h1s left as-is (see non-goals).

## Left to the builder

- Exact probe rewrites in `scripts/verify-site.mjs` (home becomes a holding-page
  contract; heading-PNG presence probed like the wordmark probes).
- Spacing/positioning of the holding block and rendered headings in the one
  global stylesheet (tokens only, no new dependencies).
