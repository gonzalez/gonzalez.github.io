# gonzalez.github.io Hardware-Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A hardware-typed minimalist refresh of the static Next.js portfolio: DDC Hardware 45 rendered into deterministic PNG wordmark/headings at build time, content reshaped to a hero + linked flagship line + curated repo grid, socials removed, EULA credit in the footer.

**Architecture:** The licensed OTF is vendored into an gitignored source dir and rasterized by a deterministic Pillow-based build script into `public/assets/word/*.png` (1× + 2× retina, transparent). The Next.js site consumes the PNGs (`next/image` with `unoptimized: true` already set); enumeration stays from `src/content/repos-snapshot.json`; all editable copy lives in `src/content/site.ts` as today.

**Tech Stack:** Next.js 16 static export (unchanged), React 19, TypeScript; Python 3 stdlib + Pillow for the rasterizer; unittest for rasterizer gates.

**Spec:** `docs/plans/2026-11-03-hardware-refresh-design.md` (approved 2026-11-03)

## Global Constraints

- The OTF **must never** land in `public/` or be served: rasterized PNGs only.
- The post-build check must assert the build output contains **no `.otf`/`.woff2`/font binaries** (fail otherwise).
- EULA credit line, verbatim, in the site footer:
  `DDC Hardware 45 © Aaron James Draplin & Brian Bonislawsky via DDC Fonts – www.ddcfonts.com`
- No social links of any kind (the operator removed them).
- Hero intro link targets, exactly two: `https://github.com/gonzalez/agent-dev-setup` (agentic platform), `https://gonzalez.github.io` root (Datums site — link with label "Datums").
- Repo grid: keep the existing snapshot mechanism and sorted list.
- All new copy for humans must read like a terminal, not a brochure: no marketing adjectives.
- Validation gate for the loop: `npm run typecheck && npm run build` (build produces `out/`); `python3 -m unittest discover tests` for the rasterizer suites.

## Review Focus

1. **Font leak into `public/`** — any `.otf/.ttf/.woff(.woff2)` bytes in the exported site fail it. Pinned by Task 1's post-build scan test (`test_build_output_has_no_font_binaries`).
2. **Missing EULA credit** — silent footer drift. Pinned by Task 2 (`test_footer_carries_font_credit`).
3. **Non-reproducible PNGs** — rasterizer rerun changes bytes. Pinned by Task 1 (`test_rasterizer_is_deterministic`).
4. **Hero image missing at runtime** — PNG referenced but absent from `public/`. Pinned by Task 2 (`test_wordmark_assets_exist`).
5. **Socials sneaking back** — any socials key/array reappearing (or socials rendered) fails. Pinned by Task 2 (`test_no_socials`).

---

### Task 1: Font intake + deterministic rasterizer

**Files:**
- Create: `assets/fonts-src/DDCHardware45-Regular.otf` (operator file, gitignored)
- Create: `.gitignore` (add `assets/fonts-src/`)
- Create: `tools/render_wordmark.py`
- Create: `tests/test_render_wordmark.py` (unittest)
- Create: `tools/README.md` (short: purpose, license reference)

**Interfaces:**
- Produces: `render_wordmark(text: str, out_png: str, scale: int = 2, height_px: int | None = None) -> str` and a `main()` CLI: `python3 tools/render_wordmark.py --font assets/fonts-src/DDCHardware45-Regular.otf --out public/assets/word --text "gonzalez"`; deterministic PNG bytes for identical inputs.

- [ ] **Step 1: Write failing tests** — `test_renders_pngs_at_1x_and_2x`, `test_font_missing_fails_loudly` (points at a nonexistent path → nonzero exit + stderr), `test_rasterizer_is_deterministic` (two runs → identical sha256), `test_max_width_option_constrains_width` (long text respects a max width without upscaling distortion).
- [ ] **Step 2: RED** — `python3 -m unittest discover tests` → failures/errors (module missing).
- [ ] **Step 3: Implement** with Pillow (`ImageFont.truetype`, `Image.draw.text`, alpha canvas, `box=(baseline offset)`, save with `optimize=True`); deterministic = same font/text/params → same bytes (Pillow stable; assert sha256 equality).
- [ ] **Step 4: GREEN** — unittest green.
- [ ] **Step 5: Commit** — `git add tools tests .gitignore && git commit -m "feat(rasterizer): deterministic DDC Hardware 45 wordmark renderer"`

---

### Task 2: Site wiring — hero, content, footer, no-font leak gate

**Files:**
- Create: `scripts/prebuild-wordmark.sh` (invokes Task 1 CLI for the site's heading strings: `gonzalez`, `Repositories`)
- Modify: `package.json` (`"prebuild": "bash scripts/prebuild-wordmark.sh"`)
- Modify: `src/content/site.ts` (add `intro` copy + two flagship links; **remove** socials entirely)
- Modify: `src/app/page.tsx` + `src/app/page.module.css` (hero renders wordmark PNG, intro line, repo grid unchanged)
- Modify: `src/app/layout.tsx` footer component (credit line)
- Create: `tests/test_site_contract.py` (site-level contract tests, unittest)
- Modify: `README.md` (rasterizer note + EULA credit + local-first publish note)

**Interfaces:**
- Consumes: Task 1's CLI (`prebuild-wordmark.sh`).
- Produces: `public/assets/word/gonzalez@2x.png` (+ 1x) etc.; site copy without socials.

- [ ] **Step 1: Write failing tests** — `test_wordmark_assets_exist`, `test_build_output_has_no_font_binaries` (glob `out/**/*.{otf,ttf,woff,woff2}` == empty after `npm run build`), `test_footer_carries_font_credit` (source grep of layout.tsx), `test_no_socials` (`site.ts` has no `socials` key and page.tsx never renders one), `test_flagship_links_present`.
- [ ] **Step 2: RED** — tests fail (no prebuild script, socials still present in site.ts).
- [ ] **Step 3: Implement** — prebuild script, `prebuild` hook in package.json (npm auto-runs `prebuild` before `build`), content/hero/footer changes.
- [ ] **Step 4: GREEN** — `npm run typecheck && npm run build` + `python3 -m unittest discover tests` green; visually `npx serve out` and eyeball typography.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(site): hardware-type hero, no socials, EULA credit; no-font-leak build gate"`

---

### Task 3: Docs + cleanup

**Files:**
- Modify: `README.md` (front: how to rebuild wordmarks, license note, deploy note: manual `git push` to Pages = the operator's publish gate)
- Modify: `docs/plans/2026-11-03-hardware-refresh-design.md` (mark decisions implemented)
- Remove: `docs/plans/2026-11-03-hardware-refresh-design.md`'s TODOs list becomes historical (no dangling TODOs in repo)

**Interfaces:**
- Consumes: everything above (docs-only task).

- [ ] **Step 1: README update** — rasterizer usage, license note (purchased license; rasterized-only per EULA), local-first publish rule.
- [ ] **Step 2: Verify** — `npm run build` + `python3 -m unittest discover tests` + `make`-style manual check `npx serve out` renders.
- [ ] **Step 3: Commit** — `git commit -am "docs: hardware refresh README + design status"`

---

## Self-review notes

- **Spec coverage**: rasterizer (T1), hero/credit/no-socials (T2), docs (T3); anti-goals covered by the no-font-leak gate (Review Focus #1) and `test_no_socials`.
- **Type consistency**: `render_wordmark(text, out_png, scale=2)` named once and consumed by the shell prebuild; page topic stays on PNG paths.
- **Review Focus**: each of the five has a pinning test in its owning task.
- **Proportion**: plan ≈ design length, no transcripts.
