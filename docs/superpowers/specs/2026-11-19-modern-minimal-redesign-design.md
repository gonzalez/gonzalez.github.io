# Modern Minimal Redesign — Design

**Date:** 2026-11-19
**Task:** TASK-12
**Status:** Approved (opted out of questions; defaults stated below)

## Intent

Refresh the digital garden's visual layer to a modern, minimal aesthetic while
keeping the site's contracts, content, and structure intact. The garden stays
quiet: one centered reading column, system-aware light/dark, no analytics,
no client JS beyond the existing toggle/progress scripts. Output remains a
plain static build.

## Goals

- Refine tokens (color, type, spacing, radius, shadow) for a calmer, more
  contemporary feel in both palettes.
- Improve typographic hierarchy and vertical rhythm across pages and notes.
- Polish components (chip, terminal line, experiment card, TOC, theme toggle,
  code blocks, nav, footer) with consistent radii, borders, and hover states.
- Add baseline accessibility polish: focus-visible rings, selection color,
  reduced-motion respect, smooth scrolling only when not reduced.
- Preserve every site-contract probe and the DDC wordmark pipeline.

## Non-goals

- No new dependencies, no framework change, no new pages or routes.
- No content changes (notes, projects, about copy).
- No change to the reading-column width/clamp, nav inventory, or footer
  EULA credit.
- No font binaries; DDC stays rasterized.

## Constraints

- Stack stays Astro 5 + Tailwind v4 + TypeScript. System fonts only.
- `scripts/verify-site.mjs` must still report 19/19.
- `npm run check`, build, and unittest must stay green.
- No `.otf/.ttf/.woff/.woff2/.eot` in `dist/`.

## Approaches considered

1. **Token-only refresh** (just recolor global.css). Cheapest, but leaves
   hierarchy and components feeling dated. Rejected: doesn't address "modern".
2. **Full component rewrite** (restructure markup, new layouts). High risk to
   probes and large diff. Rejected: scope creep; contracts are the product.
3. **Layered refresh (chosen):** refine tokens + base styles + component
   classes in `global.css`, plus small markup/spacing tweaks in layouts and
   components. Preserves contracts, moderate diff, visible improvement.

## Defaults (stated, not agreed)

- Palette: warm paper retained but nudged; accent stays violet `#7c5cff`
  (light) / `#a78bfa` (dark). Neutral grays tightened for contrast.
- Type: modern system stack (`ui-sans-serif`/`system-ui`/`-apple-system`/
  `Segoe UI`/`Helvetica Neue`); mono stays `ui-monospace` stack. Base 17px,
  line-height 1.7, headings use tighter tracking and a stepped scale.
- Radius: 6px default, 999px pills. Borders: 1px `--edge`.
- Motion: 150ms ease transitions on interactive elements; reduced-motion
  disables them.
- Focus: 2px accent outline with offset.

## What's left to the builder

- Exact hex values and spacing numbers, kept consistent with the tokens.
- Which components get the polished treatment beyond the core set.
- Whether to add a subtle divider under the nav.

## Calls made during implementation

Marked in the code where a value is a judgment call rather than a contract.
