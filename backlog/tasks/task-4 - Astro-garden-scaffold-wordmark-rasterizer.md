---
id: TASK-4
title: Astro garden scaffold + wordmark rasterizer
status: In Progress
assignee:
  - '@agent'
created_date: '2026-11-06T03:41:00Z'
updated_date: '2026-11-06T03:41:00Z'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Task 1 of docs/plans/2026-11-05-digital-garden-plan.md: init Astro (static, TypeScript) on master; Tailwind CSS v4 via @tailwindcss/vite; global tokens per spec palette; MDX content collections config (writing/projects); vendored DDC OTF (gitignored assets/fonts-src) + scripts/render_wordmark.py (Pillow; deterministic; 1x/2x transparent; unittest suite from the retired plan) + prebuild shell wrapper. PILLOW IS AVAILABLE on the machine; unittest is part of the loop's gate command.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 rasterizer unittest suite green (deterministic sha256, 1x+2x, transparent, missing-font loud, max-width)
- [ ] #2 assets/fonts-src gitignored; no font bytes under public/
- [ ] #3 npm run check && npm run build green on the scaffold
- [ ] #4 content collections config (writing, projects) valid with maturity enum seedling|growing|evergreen
<!-- AC:END -->
