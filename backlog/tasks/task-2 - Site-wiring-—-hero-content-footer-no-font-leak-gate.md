---
id: TASK-2
title: Site wiring — hero, content, footer, no-font-leak gate
status: To Do
assignee:
  - '@agent'
created_date: '2026-11-06T03:33:00Z'
updated_date: '2026-11-06T03:33:00Z'
labels: []
dependencies:
  - TASK-1
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Task 2 of the plan: scripts/prebuild-wordmark.sh renders heading strings (gonzalez, Repositories) into public/assets/word/; package.json prebuild hook; src/content/site.ts gains intro copy + two flagship links (agent-dev-setup repo, Datums site root) and REMOVES socials entirely; src/app hero renders the wordmark PNGs; layout footer carries the EULA credit verbatim; README rasterizer/license/local-first publish note; site-contract unittest suite (wordmark assets exist; build output has no font binaries; footer credit asserted; no-socials asserted; flagship links asserted).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 site-contract tests green incl. no-font-binaries-in-out and no-socials assertions
- [ ] #2 npm run typecheck && npm run build green (prebuild renders wordmarks)
- [ ] #3 footer carries the EULA credit verbatim
- [ ] #4 hero renders wordmark PNGs; intro links to platform repo and Datums
<!-- AC:END -->
