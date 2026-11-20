# Modern Minimal Redesign — Implementation Plan

**Task:** TASK-12
**Design:** docs/superpowers/specs/2026-11-19-modern-minimal-redesign-design.md

## Slices

1. **Tokens & base (global.css)** — refine color tokens, type stack, base
   styles, focus-visible, selection, smooth-scroll, reduced-motion.
2. **Reading column & masthead** — keep clamp; refine masthead spacing,
   wordmark rendering, heading-word scaling (must retain max-width/height auto).
3. **Components** — chip, terminal-line, experiment-card, status-chip, toc,
   theme-toggle, code blocks: consistent radius/border/padding/hover.
4. **Layouts** — BaseLayout nav/footer spacing and typography; ArticleLayout
   header/meta rhythm; reading progress.
5. **Pages** — minor spacing/typography tweaks only; no structural changes.
6. **Verify** — run full gate; fix any regressions.

## Constraints to preserve (do not touch)

- `.reading-column { padding-inline: max(0.5rem, calc((100% - 680px)/2)); }`
- Nav: Home, About, Experiments only.
- Footer EULA credit verbatim.
- `data-theme-toggle` on every page.
- `.heading-word { height: auto; max-width: 100%; }`
- Wordmark inks light/dark @1x+@2x referenced by home.
- TOC conditional (≥3 h2s).

## Verification

- `python3 -m unittest discover tests -v`
- `npm run check`
- `npm run build`
- `node scripts/verify-site.mjs` (19/19)
