---
id: TASK-13
title: Add subtle site-wide grain texture + accent radial glow
status: Done
assignee:
  - '@edwin'
created_date: '2026-11-20T03:39:00Z'
updated_date: '2026-11-20T03:40:00Z'
labels: []
dependencies: []
priority: low
type: enhancement
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Combine two minimal background treatments site-wide: (1) a faint grain/noise overlay via inline SVG data URI (~4% opacity), (2) a soft violet radial glow (~6% opacity) in one corner. Pure CSS, no image files, theme-aware, respects reduced-motion. Fits the quiet garden aesthetic.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Grain + glow render on all pages in both themes
- [x] #2 No extra network requests or image files added
- [x] #3 Full local gate passes (unittest, astro check, build, verify-site)
- [x] #4 Reduced-motion and print unaffected
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Validation: unittest 11/11 OK; astro check 0 errors; build 7 pages; verify-site 19/19. Added grain SVG data URI (theme-aware light/dark speckles) + violet radial glow as body background layers. Pure CSS, no image files, no extra requests.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Site-wide grain texture + accent radial glow added as pure-CSS body background layers (theme-aware SVG noise + violet radial glow). No image files or network requests. Full gate green (11/11 tests, 0 check errors, 7-page build, 19/19 probes).
<!-- SECTION:FINAL_SUMMARY:END -->
