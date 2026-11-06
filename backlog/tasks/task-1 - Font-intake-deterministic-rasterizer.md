---
id: TASK-1
title: Font intake + deterministic rasterizer
status: To Do
assignee:
  - '@agent'
created_date: '2026-11-06T03:33:00Z'
updated_date: '2026-11-06T03:33:00Z'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Task 1 of docs/plans/2026-11-03-hardware-refresh-plan.md: vendor the licensed OTF (operator-provided, gitignored assets/fonts-src/DDCHardware45-Regular.otf — never in public/), build tools/render_wordmark.py (Pillow; render_wordmark(text, out_png, scale=2); deterministic bytes; --font/--out/--text CLI; max-width option), unittest suite (1x+2x render, missing-font fail-loud, sha256 determinism, max-width constrain), .gitignore entry, tools/README.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 unittest suite green with the four Task-1 assertions
- [ ] #2 rasterizer produces 1x+2x transparent PNGs from the licensed OTF deterministically (two runs identical sha256)
- [ ] #3 absent font file exits nonzero with stderr guidance
- [ ] #4 assets/fonts-src/ is gitignored
<!-- AC:END -->
