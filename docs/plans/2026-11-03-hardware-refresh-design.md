# Design — gonzalez.github.io hardware-type refresh

**Status**: approved pending operator sign-off (2026-11-03)
**Type**: small change to `~/agentic-dev/repos/gonzalez.github.io` (Next.js 16 static export on GitHub Pages)
**License context**: DDC Hardware 45 purchased (EULA in `~/Downloads/DDC Hardware 45/license.pdf`)

## Intent

A minimalist refresh of the personal GitHub Pages portfolio, typeset in
DDC Hardware 45 where the type reads as identity, with the existing
repo-listing kept as the substance.

## Decisions (operator)

- **Minimal content shape**: wordmark hero + one typed line about what
  gets built (the agentic platform, Datums — each linked) + the existing
  curated repo grid + footer. No bio, no blog, no contact form.
- **No socials**: the TODO social block is removed entirely.
- **Font**: DDC Hardware 45 (`DDCHardware45-Regular.otf`), license
  purchased. **Rasterized images only** — the EULA prohibits webfont
  serving (§4.4/§6f) and permits rasterized images for web sites (§2.2).
- Everything else about the refresh is minimalism: no framework changes,
  no new dependencies in the site itself.

## Approaches considered

- **Webfont** — prohibited by the license at this tier. Rejected.
- **SVG outlines converted from the font** — "Flash/HTML5 Type
  Embedding"/outlines embedded in HTML is prohibited territory.
  Rejected as risky under the EULA.
- **Rasterized PNG headings (chosen)** — explicitly permitted
  (§2.2 "rasterized images for web sites"); needs a small build-time
  rasterizer; identical visual result.

## Technical shape

1. `tools/render_wordmark.py` (Python + Pillow, stdlib otherwise):
   renders any Hardware-45 string to a transparent PNG at 1× + 2×
   (retina), `public/assets/word/*`. Runs as a build step, deterministic
   (same input → same pixels), so re-theming text is reproducible.
2. `src/app` layout changes: hero uses the wordmark PNGs; one typed
   intro line (The agentic platform → agent-dev-setup repo link;
   Datums → datums site link); repo grid stays; footer loses socials,
   gains the required font credit line:
   `DDC Hardware 45 © Aaron James Draplin & Brian Bonislawsky
   via DDC Fonts – www.ddcfonts.com`.
3. `src/content/site.ts` updated: socials removed, links added.
4. Font source files stay OUT of the published site (they live in
   `assets/fonts-src/` for the rasterizer only; `.gitignore` or
   excluded from `public/`).

## Verification

- Add a small unittest suite (`tests/`) for the rasterizer (PNG exists,
  non-trivial size, transparent, deterministic hash) — the platform's
  engine discovers unittest by default; loop validation uses
  `--test-command "npm run typecheck && npm run build"` as the site gate
  (build is the artifact proof).
- `next build` static export must succeed (deployable to Pages as today;
  publishing = an explicit `git push` by the operator, per their
  local-first rule).

## Non-goals / anti-goals

- No socials, no tracked fonts/photos, no dark-mode toggle, no JS
  animations, no layout re-themes beyond this hero/grid refresh.
- Anti-goals: serving the font file; missing the EULA credit; a build
  that depends on the font file at runtime.

## Inventories for the builder

- Font file path (operator-provided): `~/Downloads/DDC Hardware 45/OpenType/DDCHardware45-Regular.otf`
- Site copy source of truth: `src/content/site.ts`
- Static export: `next.config.mjs` (already `output: 'export'`, domain root, trailing slash)
