---
id: TASK-6
title: DDC identity + theme mechanics + polish
status: Done
assignee:
  - '@agent'
created_date: '2026-11-06T03:41:00Z'
updated_date: '2026-11-06T06:17:00Z'
labels: []
dependencies:
  - TASK-5
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Task 3 of the plan: DDC masthead as rasterized PNGs in BOTH palettes (light-ink #242424 and dark-ink #EAEAEA variants) with CSS prefers-color-scheme swap + ThemeToggle (vanilla JS only); reading column capped (clamp for 680-740px, works < 430px viewports); syntax highlighting for code blocks; TOC conditionally only for notes with >= 3 h2s; optional reading progress bar (respects prefers-reduced-motion); footer EULA credit verbatim: DDC Hardware 45 (c) Aaron James Draplin & Brian Bonislawsky via DDC Fonts - www.ddcfonts.com; Lighthouse review is the OPERATOR's manual check, not gated in verify.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 both wordmark variants exist and swap per scheme/toggle
- [ ] #2 mobile reading column clamp works (< 430px viewports render correctly)
- [ ] #3 TOC only appears on notes with >= 3 h2s
- [ ] #4 footer carries the EULA credit verbatim
- [ ] #5 npm run check && npm run build green; verify script green
<!-- AC:END -->
