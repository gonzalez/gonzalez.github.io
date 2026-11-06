# Holding Page + DDC Heading Rasters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the homepage to a "more is coming soon" holding page and render every static page heading in DDC Hardware 45 as build-time PNGs (same EULA-safe pattern as the wordmark).

**Architecture:** A manifest builder scripts (`scripts/build_headings_manifest.py`) scans the rasterized word directory and records PNG dimensions; `prebuild-wordmark.sh` renders the four new heading strings in both inks and emits the manifest; a new `HeadingWord.astro` component consumes the manifest (fail-soft to plain text); `index.astro` loses the three garden sections and becomes the holding page; `verify-site.mjs` probes are updated in step with the contract (RED→GREEN each time).

**Tech Stack:** Python 3 + Pillow (rasterizer, manifest), Bash prebuild, Astro 5 + TypeScript, Node contract probes (`verify-site.mjs`), Python unittest.

**Spec:** `docs/plans/2026-11-06-holding-page-ddc-headings-design.md` (operator approved 2026-11-06 — homepage holding page, approach A rasterized headings site-wide)

## Global Constraints

- EULA: the DDC OTF is never committed or served (gitignored `assets/fonts-src/`); only rasterized PNGs from the existing `scripts/render_wordmark.py`; footer credit line stays verbatim.
- CI path: heading PNGs **and** `public/assets/word/manifest.json` are committed, and `prebuild-wordmark.sh` skips local render when they are present and the font is absent (extend the existing guard).
- Every rendered string ships both inks (`light/` #242424, `dark/` #EAEAEA) at 1x and 2x — four files per slug, CSS swap pattern shared with the existing `.masthead-word` rules.
- Heading rasters render at `--height 30` (1x) to match the existing `text-3xl` h1 size.
- Gate stays one command: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`.
- No new runtime dependencies; no content, routes, RSS, or sitemap changes.
- Holding-page copy (operator-approved draft, may be revised before publish): *"Glad you're here. Most of the garden is still in the ground — more is coming soon."*
- Loop posture: commit locally only; pushes are operator-run (publish gate).

## Review Focus

1. **Theme-invisible headings** — a heading rastered in light-ink only disappears on dark. Pin: probe `heading-rasters` asserts both ink files per slug (Task 1) *and* the CSS swap covers `.heading-word` (Task 2).
2. **Slug drift** — Python `slugify` and the component's TS mirror disagree on punctuation and the `<img>` 404s. Pin: strings are fixed constants on both sides and the probe asserts dist images referenced by the pages actually exist (Task 2).
3. **Layout shift** — heading images without `width`/`height` attrs shift the h1 line. Pin: probe asserts both attrs present on each heading `<img>` in `writing/index.html` (Task 2).
4. **Missing-raster fail-open** — if the manifest or PNGs are absent, the component must render the plain-text heading, never a broken image. Pin: fail-soft branch in `HeadingWord.astro` + the probe still passes on a dist built without new PNGs… not constructible here — reviewed by checking the code path runs when the manifest IS present and the fail-soft fallback exists in source (Task 2 review).
5. **Copy drift vs. probe** — the operator may rewrite the holding line; the probe keys on the literal `coming soon` in the rendered `alt`/text. Pin: probe `home-holding` (Task 3); a copy rewrite that drops the phrase must update the probe in the same commit.

---

### Task 1: Heading rasters + manifest builder

**Files:**
- Create: `scripts/build_headings_manifest.py`
- Modify: `scripts/prebuild-wordmark.sh`
- Create (generated, committed): `public/assets/word/manifest.json`, `public/assets/word/{light,dark}/{more-is-coming-soon,writing,projects,about}@{1,2}x.png`
- Test: `tests/test_heading_manifest.py`

**Interfaces:**
- Consumes: `scripts/render_wordmark.py --font F --out D/LIGHT --text T --ink 242424 --height 30` (existing CLI unchanged).
- Produces: manifest JSON shape consumed by Task 2 —
  `{ "more-is-coming-soon": { "light": { "1": [w, h], "2": [w, h] }, "dark": { "1": [w, h], "2": [w, h] } }, ... }` (one key per PNG slug under `light/` and `dark/`; keys are `ink: list[str(path), ..]`? **No** — exactly as written above: ink → scale string → `[width, height]` ints).

- [ ] **Step 1: Write the failing test** `tests/test_heading_manifest.py`

```python
class BuildManifestTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        word = Path(self.tmp) / "public" / "assets" / "word"
        for ink in ("light", "dark"):
            self._png(word / ink, "writing", 40, 12, 80, 24)
            self._png(word / ink, "gonzalez", 30, 5, 148, 25)

    def _png(self, directory, slug, w1, h1, w2, h2):
        directory.mkdir(parents=True, exist_ok=True)
        for scale, (w, h) in {"1": (w1, h1), "2": (w2, h2)}.items():
            Image.new("RGBA", (w, h)).save(directory / f"{slug}@{scale}x.png")

    def test_shape_and_values(self):
        manifest = build_manifest(Path(self.tmp) / "public" / "assets" / "word")
        self.assertEqual(list(manifest), ["writing", "gonzalez"])
        self.assertEqual(manifest["writing"]["light"]["1"], [40, 12])
        self.assertEqual(manifest["writing"]["dark"]["2"], [80, 24])

    def test_write_creates_json(self):
        manifest = build_manifest(Path(self.tmp) / "public" / "assets" / "word")
        out = Path(self.tmp) / "manifest.json"
        write_manifest(manifest, out)
        self.assertEqual(json.loads(out.read_text()), manifest)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_heading_manifest -v`
Expected: FAIL — `ImportError: cannot import name 'build_manifest'`

- [ ] **Step 3: Implement `scripts/build_headings_manifest.py`**

```python
def build_manifest(word_dir: str | Path) -> dict:
    """Slug → ink → scale-string → [png width, png height]. Slug = filename minus @Nx."""
def write_manifest(manifest: dict, out_path: str | Path) -> None:
```

Reads PNG dimensions with PIL, sorted slug keys, `json.dump(..., sort_keys=True, indent=2)`. CLI: `--word-dir` (default `public/assets/word`), `--out` (default `public/assets/word/manifest.json`).

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_heading_manifest -v && python3 -m unittest discover tests -v`
Expected: PASS (all suites)

- [ ] **Step 5: Extend `scripts/prebuild-wordmark.sh`**

After the existing `gonzalez` renders, add:

```bash
HEADINGS=("more is coming soon" "Writing" "Projects" "About")
for heading in "${HEADINGS[@]}"; do
  python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/light" --text "$heading" --ink 242424 --height 30
  python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/dark" --text "$heading" --ink EAEAEA --height 30
done
python3 scripts/build_headings_manifest.py
```

And require the manifest in the CI skip guard:

```bash
if [ ! -f "assets/fonts-src/DDCHardware45-Regular.otf" ] \
   && ls public/assets/word/*/*.png >/dev/null 2>&1 \
   && [ -f public/assets/word/manifest.json ]; then
```

- [ ] **Step 6: Render locally (font is present) and verify outputs**

Run: `bash scripts/prebuild-wordmark.sh && python3 -m unittest discover tests -v`
Expected: `public/assets/word/manifest.json` exists; `alt`-less PNGs `more-is-coming-soon@{1,2}x.png`, `writing@{1,2}x.png`, `projects@{1,2}x.png`, `about@{1,2}x.png` exist under `light/` and `dark/`; suite green.

- [ ] **Step 7: Commit**

```bash
git add scripts/ tests/ public/assets/word/
git commit -m "feat(garden): DDC heading rasters (both inks, 1x/2x) + build manifest"
```

### Task 2: `HeadingWord` component + directory headings

**Files:**
- Create: `src/components/HeadingWord.astro`
- Modify: `src/pages/writing/index.astro:29`, `src/pages/projects.astro:32`, `src/pages/about.astro:10` (each `<h1>` wraps `<HeadingWord … />`)
- Modify: `src/styles/global.css:116-133` (CSS swap selectors cover `.heading-word--light`/`--dark`)
- Modify: `scripts/verify-site.mjs` (probe `heading-rasters`)

**Interfaces:**
- Consumes: manifest from Task 1 (`public/assets/word/manifest.json`, committed).
- Produces: `<HeadingWord text={string} />` used by Task 3 on the home h1; slug = TS mirror `t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'wordmark'`.

- [ ] **Step 1: Extend the probe (write it failing)** — add `heading-rasters` to `scripts/verify-site.mjs`:

For each slug in `['more-is-coming-soon', 'writing', 'projects', 'about']`: `dist` ships `assets/word/light/<slug>@{1,2}x.png` and `assets/word/dark/<slug>@{1,2}x.png`; `manifest.json` is valid JSON in dist; `dist/writing/index.html` carries an `<img … alt="Writing"` with both `width=` and `height=` attrs. Run: `node scripts/verify-site.mjs`
Expected: FAIL (`manifest.json` missing from dist).

- [ ] **Step 2: Implement `src/components/HeadingWord.astro`**

```astro
---
import { readFileSync } from 'node:fs';
interface Props { text: string }
const { text } = Astro.props;
const slug = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'wordmark';
let raster: { light: [number, number]; dark: [number, number] } | null = null;
try { raster = JSON.parse(readFileSync('public/assets/word/manifest.json', 'utf8'))[slug]; } catch { /* fail-soft */ }
---
{raster ? (
  ['light', 'dark'].map((ink) => (
    <img class={`heading-word heading-word--${ink}`} src={`/assets/word/${ink}/${slug}@1x.png`}
         srcset={`/assets/word/${ink}/${slug}@1x.png 1x, /assets/word/${ink}/${slug}@2x.png 2x`}
         width={raster[ink][0]} height={raster[ink][1]} alt={text} />
  ))
) : (
  <span>{text}</span>
)}
```

- [ ] **Step 3: Wire the three directory headings**

Each of the three pages: wrap the existing `<h1>` content: `<h1 class="text-3xl font-semibold tracking-tight"><HeadingWord text="Writing" /></h1>` (import the component at the top of each file's frontmatter).

- [ ] **Step 4: Share the theme swap with the heading images**

In `src/styles/global.css` add `.heading-word` to the radiating selectors (same `display`/size treatment as `.masthead-word`: `height: 0.95em; width: auto; vertical-align: -0.15em;`) and include `.heading-word--light`/`--dark` in the four theme-swap rules at lines 123–133.

- [ ] **Step 5: Verify gate green**

Run: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`
Expected: PASS, probe count now 17.

- [ ] **Step 6: Commit**

```bash
git add src/ scripts/verify-site.mjs
git commit -m "feat(garden): HeadingWord component renders Writing/Projects/About in DDC"
```

### Task 3: Home holding page + probe contract rewrite

**Files:**
- Modify: `src/pages/index.astro` (full rewrite)
- Modify: `scripts/verify-site.mjs` (probes 8 and 10 redefined; docstring updated)

**Interfaces:**
- Consumes: `<HeadingWord text="more is coming soon" />` from Task 2.

- [ ] **Step 1: Rewrite the failing probes** — in `scripts/verify-site.mjs` update the docstring and:

- `home-markers` → `home-holding`: `dist/index.html` contains the literal `coming soon` (the holding headline) and the alt text `"Glad you're here"`.
- `home-entries` → `home-no-entries`: `dist/index.html` contains **no** `data-home-entry` attribute.

Run: `node scripts/verify-site.mjs`
Expected: FAIL on both (home is still the garden landing).

- [ ] **Step 2: Rewrite `src/pages/index.astro`**

Keep: frontmatter imports reduced to `BaseLayout` (+ `HeadingWord`), the `mastheadVariants` block and `<p class="masthead">` wordmark rendering verbatim. Body becomes:

```astro
<h1 class="text-3xl font-semibold tracking-tight"><HeadingWord text="more is coming soon" /></h1>
<p class="mt-2">
  Glad you're here. Most of the garden is still in the ground — more is
  coming soon.
</p>
```

Remove the three sections, the `notes`/`projects`/`exploring`/`formatDate` code, the `astro:content` import, and the `data-home-entry` attributes. Keep `<BaseLayout title="gonzalez — digital garden">` and `</main>`.

- [ ] **Step 3: Verify gate green**

Run: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`
Expected: PASS — 17/17, home is the holding page.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro scripts/verify-site.mjs
git commit -m "feat(garden): home becomes a 'more is coming soon' holding page; probes updated"
```

---

## Self-review

- **Spec coverage:** holding page (Task 3) ✓; DDC headings site-wide static h1s (Tasks 1–2) ✓; PNGs + manifest committed for CI (Task 1) ✓; fail-soft fallback (Task 2, Review Focus 4) ✓; note titles and body text untouched (non-goals) ✓.
- **Step scan:** each step is one artifact; bodies only where the sign isn't a transcript.
- **Type consistency:** manifest shape identical across Tasks 1→2; `HeadingWord` signature identical Tasks 2→3; slugs pinned constants on both sides.
- **Review Focus:** every line pinned in the task that owns the code (listed per line).
- **Proportion:** ~1 page of plan for a 4-file change plus probes — proportionate.
