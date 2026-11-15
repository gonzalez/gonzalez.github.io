# Design — Experiments page + About reframe ("a place for experiment")

**Status**: proposed
**Date**: 2026-11-06 (revised 2026-11-15)
**Repo**: `~/agentic-dev/repos/gonzalez.github.io`
**Follows**: 2026-11-06 holding-page design (TASK-9) — homepage holding posture unchanged

## Intent and why

The operator wants the site to be **a place for experiment**: About reframed as
the doorway to that idea, plus a dedicated **Experiments** page listing what's
in flight. Site nav becomes exactly three entries: **Home / About /
Experiments**. The homepage holding page, DDC rasterized-heading system, RSS,
sitemap, and the EULA posture all stay as they are.

## Goals

- New `/experiments/` page: DDC-rasterized "Experiments" heading (same
  HeadingWord/manifest pattern as the other pages), a one-line intro, and the
  experiments list — **sourced from the `projects` content collection**,
  filtered to entries the operator tags `experiment` (the operator adds the
  tag/label themselves; the page renders whatever is tagged, so adding an
  experiment = one JSON field, no page edit).
- `projects` schema gains an optional `tags: array(string)` field (default
  `[]`) — the tagging mechanism the operator asked for.
- About rewritten: personal intro kept; stale garden/`/projects/` copy
  replaced with the lab framing ("a place for experiments", link to
  `/experiments/`); contact line stays.
- Nav: Home + About + Experiments everywhere (probe 18 updated to expect
  Experiments and still forbid Writing/Projects links).

## Non-goals

- No new content collection — the `projects` collection carries the tag; the
  Experiments page renders from it.
- No changes to the homepage, writing/projects page content, or RSS feeds.
- No article-title or body-text font changes (existing non-goal stands).

## Anti-goals (failure conditions)

- Serving the DDC OTF as a webfont (EULA §2.1) — rasterized PNGs only.
- Invented or aspirational experiment entries (copy discipline).
- Breaking the site-contract suite — probes move with the contract (18/18 →
  still 18, definitions updated: dist-pages and sitemap-roots gain
  `/experiments/`, nav-inventory gains `href="/experiments/"`, heading-rasters
  gains the `experiments` slug).

## Constraints

- "Experiments" joins the prebuild HEADINGS list (both inks, 1x/2x, height 30);
  new PNGs + regenerated manifest are committed for the font-absent CI path.
- Gate stays one command; local commits only; pushes are operator-run.

## Approaches considered

- **Static list in the page (dropped)** — superseded by the operator's
  tag-driven direction: the source of truth is the `projects` collection.
- **New `experiments` content collection** — rejected: the `projects`
  collection + a `tags` field is the smaller honest version of the same thing.
- **Copy-only About reframe** — rejected: the operator's nav spec ("home about
  experiments") asks for a real page.

## Operator decisions

- Nav = Home / About / Experiments. ✅ (2026-11-15)

## Calls I made (reject any)

- Tag value: the literal tag **`experiment`** (lowercase, in the projects
  entries' new `tags` array); the page filters on exactly that string.
- Empty state: if nothing is tagged, the page shows one muted line —
  "Nothing is on the bench right now." — so the build never ships an empty box.
- Seed the two existing project entries (`agent-dev-setup`,
  `gonzalez-github-io`) with `"tags": ["experiment"]` so the page ships
  non-empty; the operator untags at will (both are genuinely active experiments).
- About keeps "GitHub is the door" contact line and loses the RSS mention
  (the footer already links RSS).
- Experiments intro line: "Small things I'm building to see what happens."

## Left to the builder

- Exact probe edits and the prebuild heading-loop entry; spacing/copy polish.
