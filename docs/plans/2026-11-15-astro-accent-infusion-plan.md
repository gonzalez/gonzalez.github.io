# astro.build Accent Infusion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Infuse astro.build-style accent elements (violet accent token, accent DDC home headline, chip, terminal one-liner, experiment cards) while keeping the quiet reading column, system light/dark, and zero client JS.

**Architecture:** The manifest builder learns to scan *any* ink directory under `public/assets/word/` (not just `light`/`dark`), so the prebuild can render the home headline in two accent inks (`accent-light`/`accent-dark`) without touching the rasterizer CLI. The homepage renders the accent rasters directly (dims from the manifest), gains a chip and a static terminal line; `/experiments/` items become cards with status chips. One CSS token (`--accent`) drives link/selection/chip/card accents in both themes. Probes extend `heading-rasters` for the accent files + home references (still 19 probes).

**Tech Stack:** Python manifest builder + Bash prebuild, Astro 5 + Tailwind v4 tokens, Node contract probes, Python unittest.

**Spec:** `docs/plans/2026-11-15-astro-accent-infusion-design.md` (operator approved 2026-11-15 — approach A accent infusion)

## Global Constraints

- EULA: rasterized PNGs only; the OTF is never committed or served; footer credit verbatim.
- Accent hexes (pinned): light-bg ink `#7c5cff`, dark-bg ink `#a78bfa`; CSS `--accent: #7c5cff` with dark-theme override `#a78bfa`.
- Zero client JS: chip, terminal line, and cards are static HTML/CSS; terminal line is `aria-hidden`.
- Committed accent PNGs + regenerated manifest (font-absent CI path).
- Gate stays one command: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`.
- Homepage holding copy, nav, routes, RSS, sitemap unchanged.

## Review Focus

1. **Dark-theme accent contrast** — `#7c5cff` on near-black is muddy; the dark override must actually switch (both CSS token and the `accent-dark` raster). Pin: probe asserts both accent ink dirs exist in dist + manifest + home references both (Task 1/2).
2. **Manifest drift for accent dirs** — the builder must derive ink dirs dynamically, or a new ink dir silently vanishes from the manifest. Pin: new unit test `test_dynamic_ink_dirs` (Task 1).
3. **Probe 8/17 still pass with accent imgs** — the home headline keeps `alt="more is coming soon"`; no probe may hardcode the neutral ink URLs on home. Pin: probe 17 asserts home references `/assets/word/accent-*` URLs (Task 2).
4. **Experiments cards vs probe 19** — the tagged-list contract reads text content; wrapping items in cards must not change names/descriptions/status rendering. Pin: full gate (Task 2).
5. **Chip/terminal a11y** — decorative terminal line `aria-hidden="true"`; chip must remain readable text. Pin: probe 8's `home-holding` still finds `coming soon` + `Glad you` (Task 2).

---

### Task 1: Dynamic ink dirs + accent rasters + manifest

**Files:**
- Modify: `scripts/build_headings_manifest.py` (scan any subdirectory as an ink)
- Modify: `scripts/prebuild-wordmark.sh` (accent renders for the home headline)
- Modify: `scripts/verify-site.mjs` (probe 17 gains accent file/manifest checks)
- Create (generated, committed): `public/assets/word/{accent-light,accent-dark}/more-is-coming-soon@{1,2}x.png`, regenerated `manifest.json`
- Test: `tests/test_heading_manifest.py`

**Interfaces:**
- Consumes: existing `render_wordmark.py` CLI (unchanged).
- Produces: manifest shape `{slug: {<ink-dir>: {"1":[w,h],"2":[w,h]}}}` — ink keys now arbitrary (`light`, `dark`, `accent-light`, `accent-dark`); Task 2 consumes `manifest["more-is-coming-soon"]["accent-light"]["1"]` etc.

- [ ] **Step 1: Write the failing test** — add to `tests/test_heading_manifest.py`:

```python
    def test_dynamic_ink_dirs(self):
        self._png(self.word / "accent-light", "writing", 40, 12, 80, 24)
        self._png(self.word / "accent-dark", "writing", 40, 12, 80, 24)
        manifest = build_manifest(self.word)
        self.assertEqual(manifest["writing"]["accent-light"]["1"], [40, 12])
        self.assertEqual(manifest["writing"]["accent-dark"]["2"], [80, 24])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest discover tests -v`
Expected: FAIL — `KeyError: 'accent-light'` (builder only scans `light`/`dark`).

- [ ] **Step 3: Implement dynamic ink scanning in `build_headings_manifest.py`**

Replace the `INK_DIRS = ("light", "dark")` loop with: iterate sorted subdirectories of `word_dir`; for each, scan its `*.png` files as before (ink key = directory name). Docstring updated.

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest discover tests -v`
Expected: PASS (11 tests).

- [ ] **Step 5: Write the failing probe change** — extend probe 17 before the summary:

```js
  // TASK-11: accent inks for the home headline (astro.build-inspired).
  for (const ink of ['accent-light', 'accent-dark']) {
    for (const scale of ['1', '2']) {
      const png = `assets/word/${ink}/more-is-coming-soon@${scale}x.png`;
      if (!existsSync(join(DIST, png))) errors.push(`${png} missing from dist`);
      const dims = manifest?.['more-is-coming-soon']?.[ink]?.[scale];
      if (!Array.isArray(dims) || dims.length !== 2) {
        errors.push(`manifest lacks more-is-coming-soon/${ink}/${scale} dimensions`);
      }
    }
  }
```

Note: `manifest` is currently scoped inside the `else` of the manifest check — hoist it (`let manifest = null;` before, assign in the try) so this block can read it regardless.

Run: `node scripts/verify-site.mjs`
Expected: FAIL — four `missing from dist` / manifest-dims messages.

- [ ] **Step 6: Render the accent inks** — in `prebuild-wordmark.sh`, after the neutral heading loop:

```bash
# TASK-11: home headline in the astro-inspired accent inks (design: accent
# infusion). Only "more is coming soon" carries an accent variant.
python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/accent-light" --text "more is coming soon" --ink 7C5CFF --height 30
python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/accent-dark" --text "more is coming soon" --ink A78BFA --height 30
```

Then rebuild locally: `bash scripts/prebuild-wordmark.sh && python3 -m unittest discover tests -v && npm run build && node scripts/verify-site.mjs`
Expected: PASS — 19/19; accent PNGs + manifest committed-ready.

- [ ] **Step 7: Commit**

```bash
git add -f scripts/ tests/ public/assets/word/
git commit -m "feat(garden): dynamic manifest ink dirs + accent home-headline rasters"
```

### Task 2: Accent CSS + home page + experiment cards + probe

**Files:**
- Modify: `src/styles/global.css` (`--accent` tokens, link/selection color, `.chip`, `.terminal-line`, `.experiment-card`, `.status-chip`, home spacing)
- Modify: `src/pages/index.astro` (chip, accent headline imgs from manifest dims, terminal line, spacing)
- Modify: `src/pages/experiments.astro` (items → cards, status → chip)
- Modify: `scripts/verify-site.mjs` (probe 17 gains home-reference assertions)

**Interfaces:**
- Consumes: `manifest["more-is-coming-soon"]["accent-light"|"accent-dark"]["1"|"2"]` (Task 1).

- [ ] **Step 1: Write the failing probe change** — in probe 17's accent block, after the file/dims loop add:

```js
  const home = existsSync(homePath) ? readFileSync(homePath, 'utf8') : '';
  for (const reference of [
    '/assets/word/accent-light/more-is-coming-soon@1x.png',
    '/assets/word/accent-dark/more-is-coming-soon@1x.png',
  ]) {
    if (home && !home.includes(reference)) errors.push(`home does not reference ${reference}`);
  }
```

Run: `node scripts/verify-site.mjs`
Expected: FAIL — home references the neutral `/assets/word/light|dark/...` URLs, not the accent ones.

- [ ] **Step 2: CSS tokens + components** in `src/styles/global.css`:

```css
:root {
  --accent: #7c5cff;
  --accent-soft: rgba(124, 92, 255, 0.14);
}
[data-theme='dark'] + the prefers-color-scheme dark block:
  --accent: #a78bfa;
  --accent-soft: rgba(167, 139, 250, 0.16);

a { color: var(--accent); }           /* links carry the accent; underline on hover */
::selection { background: var(--accent-soft); }

.chip {
  display: inline-block;
  padding: 0.2rem 0.75rem;
  border: 1px solid var(--accent);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent);
}

.terminal-line {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--line, currentColor);
  border-radius: 8px;
  display: inline-block;
  color: var(--ink-muted);
}

.experiment-card {
  border: 1px solid var(--line, currentColor);
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  transition: transform 0.15s ease;
}
.experiment-card:hover { transform: translateY(-2px); }

.status-chip { /* small mono pill, muted border */ }
```

(Exact `--line`/muted-token names follow the existing global.css token set; reuse existing tokens, add none that duplicate them.)

- [ ] **Step 3: Home page** — in `src/pages/index.astro`:

- Read the manifest once in frontmatter (`readFileSync` + `JSON.parse`, fail-soft to `null` like HeadingWord) and use `manifest['more-is-coming-soon']['accent-light'|'accent-dark']` dims to render the two accent `<img>`s (same `masthead-word`-style CSS swap classes: `heading-word heading-word--accent-light/--accent-dark`; keep `alt="more is coming soon"`). Remove the neutral HeadingWord imgs from home only.
- Above the headline: `<p class="mt-10"><span class="chip">v2 · rebuilt on astro</span></p>`
- Below the copy: `<p class="terminal-line mt-6" aria-hidden="true">git push origin main&nbsp;&nbsp;&nbsp;# publishing is a deliberate push</p>`
- Increase the headline block's top margin (`mt-10` where it was `mt-2`).

- [ ] **Step 4: Experiments cards** — in `src/pages/experiments.astro`: each `<li>` becomes `<li class="experiment-card">`; the status `<span>` becomes `<span class="status-chip font-mono text-sm">{status}</span>`. Text content unchanged (names, descriptions, links, status values).

- [ ] **Step 5: Theme swap CSS for accent headline** — extend the four existing `.masthead-word--light/--dark` swap rules (and `.heading-word--*`) to also cover `.heading-word--accent-light` (visible by default, hidden in dark) and `--accent-dark` (hidden by default, visible in dark) — mirroring exactly the light/dark pattern.

- [ ] **Step 6: Verify gate green**

Run: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`
Expected: PASS — 19/19.

- [ ] **Step 7: Commit**

```bash
git add src/ scripts/verify-site.mjs
git commit -m "feat(garden): astro.build-inspired accent infusion — accent headline, chip, terminal line, experiment cards"
```

---

## Self-review

- **Spec coverage:** accent token ✓ (Task 2), accent DDC headline ✓ (Tasks 1–2), chip ✓, terminal line ✓, cards ✓, spacing ✓ — every design goal has a task; non-goals respected.
- **Step scan:** each step is one artifact; CSS values pinned where the design pins them (hexes), left to builder where it doesn't.
- **Type consistency:** manifest ink keys `accent-light`/`accent-dark` identical across builder test, prebuild, home page, probes.
- **Review Focus:** each line pinned in the owning task (listed per line).
- **Proportion:** ~1 page of plan for a CSS + two-page change — proportionate.
