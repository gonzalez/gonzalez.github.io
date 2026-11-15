# Design — astro.build-inspired accent infusion

**Status**: proposed
**Date**: 2026-11-15
**Repo**: `~/agentic-dev/repos/gonzalez.github.io`
**Follows**: TASK-9/10 holding-page + experiments structure (unchanged); operator picked approach A (2026-11-15)

## Intent and why

Borrow astro.build's signature design elements — accent color, chip, card
list, a monospace build touch, generous spacing — while keeping the site's
quiet reading column, near-zero client JS, system light/dark themes, and the
EULA-safe DDC raster identity. The result should still read as "your site",
just with a pulse.

## Goals

1. **Accent token** — one CSS custom property `--accent` (light: deep violet
   `#7c5cff`; dark: lifted tint `#a78bfa` for contrast on near-black) applied
   to links, chips, and selection highlights. No gradients needed at A scale.
2. **Accent DDC headline on the holding page** — "more is coming soon"
   re-rendered as rasterized PNGs in the accent ink (two variants: light-bg
   `#7c5cff`, dark-bg `#a78bfa`), same EULA-safe rasterization, replacing the
   neutral-ink headline on the homepage only.
3. **Chip** — a small pill above the home headline: "v2 · rebuilt on astro"
   (static text, CSS pill, no JS).
4. **Monospace build touch** — a terminal-style one-liner under the home copy:
   `git push origin main   # publishing is a deliberate push` (static box, no
   copy button — no client JS).
5. **Cards for experiments** — the `/experiments/` list items become bordered
   rounded cards with hover lift; status renders as a small chip instead of
   parenthetical mono text.
6. **Spacing** — slightly larger vertical rhythm on the holding page (headline
   block breathes more), reading column width unchanged.

## Non-goals

- No dark-first flip, no gradients/glows/starfields (that was approach B).
- No client JS (no copy buttons, no animated starfields).
- Homepage holding copy, nav, routes, RSS, sitemap unchanged.
- Article-title and body-text fonts unchanged.

## Anti-goals (failure conditions)

- Serving the DDC OTF (EULA §2.1) — accent ink ships only as rasterized PNGs.
- Breaking the contract suite — probes move with the contract.
- Losing light/dark correctness: every accent element must have both theme
  variants (Review Focus 1 below).

## Constraints

- Accent raster PNGs + regenerated manifest are committed (font-absent CI path).
- Gate stays one command; local commits; pushes operator-run.

## Approaches considered

- **A. Accent infusion (chosen)** — elements above; quiet structure intact.
- **B. Dark cosmic restyle** — rejected this round (operator picked A); the
  accent token makes B a cheap follow-up later since the palette hook exists.
- **CSS-only recolor of the neutral headline rasters** — rejected: ink is
  baked into the PNGs; recoloring requires re-rendering, not CSS.

## Operator decisions

- Approach **A** (accent infusion, quiet column stays). ✅

## Calls I made (reject any)

- Accent hex: `#7c5cff` (light bg) / `#a78bfa` (dark bg) — close to Astro's
  violet without copying their gradient.
- Chip copy: "v2 · rebuilt on astro" (factual; homepage already is).
- The accent headline replaces the neutral one on the home page only; other
  page headings (About/Experiments/Writing/Projects) keep neutral ink.
- Terminal one-liner is decorative-but-honest (it is literally how this site
  publishes); aria-hidden so screen readers don't read a command.

## Left to the builder

- Exact CSS values for chip/card/hover styles (tokens only, no new deps);
  probe updates: heading/accent raster presence in dist + home references.
