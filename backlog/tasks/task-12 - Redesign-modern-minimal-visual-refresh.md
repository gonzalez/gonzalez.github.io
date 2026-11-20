---
id: TASK-12
title: 'Redesign: modern minimal visual refresh'
status: Done
assignee:
  - '@edwin'
created_date: '2026-11-20T03:31:00Z'
updated_date: '2026-11-20T03:33:00Z'
labels: []
dependencies: []
priority: medium
type: enhancement
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Visual refresh of the digital garden to a modern, minimal aesthetic. Scope: global.css tokens and base styles, BaseLayout nav/footer, ArticleLayout, components. Preserve all site-contract probes (pages, RSS, slugs, wordmark inks, footer EULA, theme toggle, TOC rule, code highlighting, no font binaries, sitemap, nav inventory, experiments). No new dependencies; keep Astro 5 + Tailwind v4.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Full local gate passes (unittest, astro check, build, verify-site)
- [x] #2 All 19 site-contract probes still pass
- [x] #3 No font binaries ship; DDC wordmark inks preserved
- [x] #4 Theme toggle and EULA credit present on every page
- [x] #5 Reading column clamp unchanged
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Refine tokens & base styles in global.css (color, type, focus, motion). 2. Polish components (chip, terminal-line, experiment-card, status-chip, toc, theme-toggle, code blocks). 3. Refine layouts (nav/footer/ArticleLayout) spacing & typography. 4. Minor page spacing tweaks (no structural change). 5. Run full gate; fix regressions. Preserve: reading-column clamp, nav inventory, footer EULA, theme toggle, heading-word scaling, wordmark inks, TOC rule.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Validation: unittest 11/11 OK; astro check 0 errors; build 7 pages; verify-site 19/19 probes. Redesigned global.css tokens/base/components, BaseLayout nav/footer, ArticleLayout header, page spacing. No new deps, no font binaries.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Modern minimal visual refresh shipped. Refined color/type/motion tokens, base styles, and component classes in global.css; polished nav/footer in BaseLayout and header rhythm in ArticleLayout; minor spacing tweaks across pages. Preserved all site contracts (19/19 probes) and the full local gate (11/11 tests, 0 check errors, 7-page build). No new dependencies or font binaries.
<!-- SECTION:FINAL_SUMMARY:END -->
