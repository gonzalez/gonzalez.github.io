---
id: TASK-10
title: Experiments page + About reframe (place for experiment)
status: Done
assignee:
  - '@agent'
created_date: '2026-11-15T22:28:00Z'
updated_date: '2026-11-15T22:33:00Z'
labels: []
dependencies: []
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Operator directive (2026-11-15): the site should be "a place for experiment" — a new /experiments/ page rendered from project entries the operator tags `experiment` (projects schema gains an optional tags array), the About page reframed as the doorway to that idea (stale garden//projects/RSS copy removed), and the site nav becomes exactly Home / About / Experiments. Homepage holding posture, DDC rasterized-heading system, RSS, sitemap, and the EULA posture are unchanged. Design (approved): docs/plans/2026-11-15-experiments-page-design.md; plan: docs/plans/2026-11-15-experiments-page-plan.md. The operator adds/untags the `experiment` tag in src/content/projects/*.json themselves; the page renders whatever is tagged plus a muted empty state.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 /experiments/ exists with a DDC-rasterized Experiments heading and lists exactly the project entries tagged `experiment` (name, description, status, GitHub link when present); nothing tagged shows the muted empty state
- [x] #2 The projects collection schema accepts an optional tags array (default []); both existing entries are seeded with "tags": ["experiment"]; existing pages and astro check unaffected
- [x] #3 Site nav carries exactly Home, About, Experiments on every page (Writing/Projects links stay banned); About links /experiments/ with the lab framing
- [x] #4 "Experiments" heading PNGs (both inks, 1x/2x) + updated manifest.json are committed for the font-absent CI path; no font binaries in dist
- [x] #5 Full gate green: python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs (19/19 probes: dist-pages + sitemap-roots gain /experiments/, nav-inventory expects it, heading-rasters gains the slug, new experiments-source probe)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Experiments heading raster + manifest (probe 17 slug RED → prebuild HEADINGS → render → commit PNGs+manifest). 2. tags schema + seed + /experiments/ page + nav + About reframe + probe updates (RED: dist-pages/sitemap-roots/nav-inventory/experiments-source → implement → full gate 19/19 → commit). 3. Whole-branch review, TDD fix pass if needed, finalize (ACs, summary, Done).

3. Whole-branch review (fresh subagent): 'With fixes' → one TDD fix pass added the two missing probe pins (experiments-page DDC raster assertion; allPages membership) with mutation-verified RED→GREEN.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Evidence (2026-11-15, all commands exit 0): full gate = unittest 10/10 OK + astro check 0/0/0 + build ok + verify-site 19/19. Commits: c0c5052 (Experiments raster + manifest, probe 17 RED→GREEN), a5b3770 (tags schema + seeds + /experiments/ + nav + About, 4 probes RED→GREEN), 33bc7f5 (final-review fix: probe 17 asserts the on-page DDC raster with width/height; allPages covers the new page for footer-eula/theme-toggle/nav-inventory — sensitivity verified by mutation: stripping credit/img/toggle from the built page fails 3 probes naming experiments/index.html, rebuild restores 19/19). Reviewer (fresh subagent, whole-branch f86f769..a5b3770): product correct, EULA intact, sitemap gains exactly /experiments/; verdict 'With fixes' on the two probe pins, now fixed. Deferred minors: tag-drift vacuous pass (untag-all is operator-permitted), stale 'four roots/4 slugs' docstrings. Operator workflow: tag/untag entries in src/content/projects/*.json with "tags": ["experiment"] — the page follows; no page edit needed.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
TASK-10 closed. The site is now 'a place for experiment': /experiments/ renders exactly the project entries tagged experiment (projects schema gained an optional tags array; both existing entries seeded), About is reframed to the lab idea linking /experiments/, and the nav is exactly Home / About / Experiments everywhere. The Experiments DDC raster ships both inks at 1x/2x with a committed manifest (font-absent CI path intact). Verification: unittest 10/10, astro check 0/0/0, build ok, 19/19 probes (dist-pages + sitemap-roots gain /experiments/, nav-inventory expects it, heading-rasters gains the slug + on-page img assertion, new experiments-source probe). Fresh whole-branch reviewer: product correct, 'With fixes' on two probe pins → fixed with mutation-verified RED→GREEN (33bc7f5). Risks/follow-ups: untag-all leaves the page in its muted empty state by design; article titles/body text still system font; operator push is the publish gate.
<!-- SECTION:FINAL_SUMMARY:END -->
