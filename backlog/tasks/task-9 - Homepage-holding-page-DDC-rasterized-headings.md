---
id: TASK-9
title: Homepage holding page + DDC rasterized headings
status: Done
assignee:
  - '@agent'
created_date: '2026-11-06T23:20:00Z'
updated_date: '2026-11-06T23:37:00Z'
labels: []
dependencies: []
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Operator directive (2026-11-06): the personal site should read as DDC Hardware 45 across its type, and the homepage should be simplified to a plain holding page telling visitors "more is coming soon" while /writing, /projects, /about, RSS and sitemap stay live. The DDC Fonts EULA (§2.1) prohibits serving the OTF over the Internet; §2.2 permits rasterized images for websites, so all display type must be build-time PNGs (both ink variants, 1x+2x), exactly like the existing wordmark. Design (approved): docs/plans/2026-11-06-holding-page-ddc-headings-design.md; plan: docs/plans/2026-11-06-holding-page-ddc-headings-plan.md. Note: article-title h1s on individual notes and body text are out of scope (system font stays); the EULA footer credit must remain verbatim.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Home renders as a holding page (wordmark + DDC "more is coming soon" headline + one short line); the three garden sections and their entry listings are gone; other routes, nav, footer and RSS remain live
- [x] #2 Writing/Projects/About h1s and the home headline render as DDC Hardware 45 PNGs with alt text, light/dark ink variants and 1x/2x rasters, with a plain-text fail-soft fallback
- [x] #3 Heading PNGs and public/assets/word/manifest.json are committed so the CI build succeeds with the licensed font absent; no font binaries appear in dist
- [x] #4 Full gate green: python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs (contract probes updated to 17/17 for the holding page and heading rasters)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Heading rasters + manifest builder (RED python test → build_headings_manifest.py → prebuild-wordmark.sh extended → render PNGs locally → commit). 2. HeadingWord.astro + directory headings (RED heading-rasters probe → component + CSS theme swap + page wiring → gate → commit). 3. Home holding page (RED home-holding/home-no-entries probes → index.astro rewrite → full gate → commit). 4. Whole-branch review, then finalize task (ACs checked, final summary, Done). Per approved plan docs/plans/2026-11-06-holding-page-ddc-headings-plan.md.

4. Final whole-branch review + one TDD fix pass (narrow-viewport proportional headline scaling), then CI simulation with the licensed font absent.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Evidence (2026-11-06, all commands exit 0): full gate = python unittest 10/10 OK + astro check 0 errors/0 warnings/0 hints + astro build 6 pages + verify-site 17/17. Commits: 2add39f (heading rasters + manifest, Python test RED→GREEN), 7d494e9 (HeadingWord + directory h1s + probe 17 RED→GREEN), ed1a179 (home holding page + probes 8/10 RED→GREEN), 39814dc (final-review fix: proportional headline CSS, probe 17 RED→GREEN). CI path verified end-to-end with the licensed font absent: git archive HEAD into a temp copy (no assets/fonts-src) + symlinked node_modules → prebuild printed 'wordmark PNGs + manifest present ... skipping local render', build succeeded, 17/17 probes, 0 font binaries in dist. Reviewer (fresh subagent, whole-branch f4b2303..ed1a179): 'Ready to merge: Yes', all five Review Focus items covered, no Critical/Important findings; 2 minors deferred (ledger). Holding copy is the operator-approved draft, revisable before publish; a rewrite dropping 'coming soon'/'Glad you' must update probe 8.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Home is now a quiet holding page (DDC wordmark + DDC 'more is coming soon' headline + one line); /writing, /projects, /about, RSS, sitemap, nav and the EULA footer stay live. Static directory h1s (Writing/Projects/About) and the holding headline render as committed build-time DDC Hardware 45 PNGs (both inks, 1x+2x) via a dimension manifest and a fail-soft HeadingWord component — EULA-clean (OTF never served). Contract suite reworked to 17 probes (home holding/no-entries, heading rasters with width/height + responsive CSS). Verification: 10/10 unit, astro check 0/0/0, 6 pages built, 17/17 probes; font-absent CI simulation green; fresh reviewer verdict 'Ready to merge: Yes' with 2 deferred minors. Follow-ups: article-title h1s/body text remain system font (spec non-goal); 2 ledgered minors are test-hardening; exact holding copy is operator-revisable at publish; operator push is the publish gate.
<!-- SECTION:FINAL_SUMMARY:END -->
