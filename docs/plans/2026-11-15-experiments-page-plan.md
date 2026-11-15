# Experiments Page + About Reframe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `/experiments/` page rendered from `projects` entries tagged `experiment`, reframe About as the doorway to "a place for experiment", and make the site nav Home / About / Experiments.

**Architecture:** The `projects` collection schema gains an optional `tags` array (default `[]`) — the operator's tagging mechanism. The new page filters that collection on the literal tag `experiment` and renders name + description + status + links, with a muted empty state. "Experiments" joins the prebuild heading list so its DDC raster ships like the other headings; the committed manifest gains the new slug. Probes move with the contract: `dist-pages` and `sitemap-roots` gain `/experiments/`, `nav-inventory` expects `href="/experiments/"`, `heading-rasters` gains the `experiments` slug, and a new `experiments-source` probe pins that the page lists exactly the tagged projects (and that About links the page).

**Tech Stack:** Astro 5 + TypeScript + zod, Python rasterizer/prebuild, Node contract probes, Python unittest.

**Spec:** `docs/plans/2026-11-15-experiments-page-design.md` (operator approved 2026-11-15 — tag-driven experiments, nav Home/About/Experiments, About reframe)

## Global Constraints

- EULA: rasterized PNGs only; the OTF is never committed or served; footer credit verbatim.
- "Experiments" heading raster renders at `--height 30`, both inks, 1x/2x; PNGs + `manifest.json` committed for the font-absent CI path.
- Tag filter is the literal string `experiment` (lowercase) in a project entry's `tags` array.
- Copy discipline: no invented entries; the page renders whatever the operator tags, plus the muted empty state "Nothing is on the bench right now."
- Gate stays one command: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`.
- No changes to the homepage holding page, writing/projects page content, or RSS.
- Loop posture: commit locally only; pushes are operator-run.

## Review Focus

1. **Tag drift** — the page and the schema must agree on the literal `experiment`; a renamed tag silently empties the page. Pin: probe `experiments-source` asserts every project entry whose JSON carries `"experiment"` in `tags` appears on the page, and untagged ones don't (Task 2).
2. **Empty-state regression** — an untagged collection must render the muted line, not an empty `<ul>`. Pin: `experiments-source` asserts the empty-state string is absent when ≥1 entry is tagged and present when none are (Task 2; empty case exercised by the probe reading the built page — both branches derivable from source JSON, only the tagged branch is live).
3. **Nav contract** — Experiments joins everywhere; Writing/Projects stay banned. Pin: `nav-inventory` updated both ways (Task 2).
4. **Heading raster missing from manifest** — a page rendering `<span>` instead of the DDC raster would pass unrelated probes. Pin: `heading-rasters` gains the `experiments` slug + `experiments/index.html` carries `<img … alt="Experiments"` (Task 2).
5. **Schema loosening** — `tags` optional with default `[]` must not break existing entries or the `/projects/` page. Pin: full gate (astro check + build + all probes) and existing pages unchanged (Task 2).

---

### Task 1: "Experiments" heading raster + manifest

**Files:**
- Modify: `scripts/prebuild-wordmark.sh` (HEADINGS list)
- Modify: `scripts/verify-site.mjs` (probe 17 `HEADING_SLUGS` gains `'experiments'`)
- Create (generated, committed): `public/assets/word/{light,dark}/experiments@{1,2}x.png`, regenerated `public/assets/word/manifest.json`

**Interfaces:**
- Consumes: existing prebuild heading loop; manifest builder from TASK-9.
- Produces: `manifest["experiments"]` = `{ light: {"1":[w,h],"2":[w,h]}, dark: {…} }` consumed by Task 2's page.

- [ ] **Step 1: Write the failing probe change** — in `verify-site.mjs` probe 17, extend `HEADING_SLUGS` to `['more-is-coming-soon', 'writing', 'projects', 'about', 'experiments']`.

Run: `node scripts/verify-site.mjs`
Expected: FAIL — `assets/word/light/experiments@1x.png missing from dist` (+ manifest dims).

- [ ] **Step 2: Add `"Experiments"` to the prebuild heading loop**

In `scripts/prebuild-wordmark.sh`: `HEADINGS=("more is coming soon" "Writing" "Projects" "About" "Experiments")`.

- [ ] **Step 3: Render locally and verify outputs**

Run: `bash scripts/prebuild-wordmark.sh && python3 -m unittest discover tests -v && npm run build && node scripts/verify-site.mjs`
Expected: `experiments@{1,2}x.png` in `light/` and `dark/`, manifest gains `experiments`, suite green, 18/18 probes.

- [ ] **Step 4: Commit**

```bash
git add -f scripts/ public/assets/word/
git commit -m "feat(garden): Experiments heading raster (both inks, 1x/2x)"
```

### Task 2: Tags schema + `/experiments/` page + nav + About reframe

**Files:**
- Modify: `src/content/config.ts` (projects schema gains `tags: z.array(z.string()).default([])`)
- Modify: `src/content/projects/agent-dev-setup.json`, `src/content/projects/gonzalez-github-io.json` (seed `"tags": ["experiment"]`)
- Create: `src/pages/experiments.astro`
- Modify: `src/layouts/BaseLayout.astro` (nav gains `<a href="/experiments/">Experiments</a>`)
- Modify: `src/pages/about.astro` (lab framing, links `/experiments/`, drop garden/`/projects/`/RSS copy)
- Modify: `scripts/verify-site.mjs` (probe 1 `expected` gains `experiments/index.html`; `SITEMAP_ROOTS` gains `${SITE}/experiments/`; `nav-inventory` expects Experiments; new probe 19 `experiments-source`)

**Interfaces:**
- Consumes: `manifest["experiments"]` (Task 1); `HeadingWord` component; `getCollection('projects')`.
- Produces: nothing downstream.

- [ ] **Step 1: Write the failing probe changes**

In `scripts/verify-site.mjs`:

- Probe 1 `expected` list: add `'experiments/index.html'` after `'about/index.html'`.
- `SITEMAP_ROOTS`: add `` `${SITE}/experiments/` `` after the about root.
- `nav-inventory`: the required set becomes `href="/"`, `href="/about/"`, `href="/experiments/"` (forbidden set unchanged).
- Docstring: add probe 19 and note the roots/nav updates:

```
 *  19. experiments-source — /experiments/ lists exactly the project entries
 *                        tagged `experiment` (About links the page; the
 *                        muted empty state only shows when none are tagged)
```

- New probe 19:

```js
// --- probe 19: /experiments/ mirrors the tagged projects --------------------
const EXPERIMENT_TAG = 'experiment';
{
  const errors = [];
  const pagePath = join(DIST, 'experiments/index.html');
  if (!existsSync(pagePath)) {
    errors.push('experiments/index.html missing');
  } else {
    const page = readFileSync(pagePath, 'utf8');
    const tagged = [];
    for (const { file } of projectEntries) {
      const entry = JSON.parse(readFileSync(join(PROJECTS_DIR, file), 'utf8'));
      if ((entry.tags ?? []).includes(EXPERIMENT_TAG)) tagged.push(entry.name);
    }
    for (const name of tagged) {
      if (!page.includes(name)) errors.push(`tagged experiment "${name}" not listed`);
    }
    for (const { file } of projectEntries) {
      const entry = JSON.parse(readFileSync(join(PROJECTS_DIR, file), 'utf8'));
      if ((entry.tags ?? []).includes(EXPERIMENT_TAG)) continue;
      if (page.includes(entry.name)) errors.push(`untagged "${entry.name}" leaked onto /experiments/`);
    }
    if (tagged.length === 0 && !page.includes('Nothing is on the bench right now.')) {
      errors.push('empty state missing with zero tagged entries');
    }
    if (tagged.length > 0 && page.includes('Nothing is on the bench right now.')) {
      errors.push('empty state shows while experiments are tagged');
    }
  }
  const aboutPath = join(DIST, 'about/index.html');
  if (!existsSync(aboutPath)) {
    errors.push('about/index.html missing');
  } else if (!readFileSync(aboutPath, 'utf8').includes('href="/experiments/"')) {
    errors.push('about page does not link /experiments/');
  }
  probe('experiments-source', errors.length === 0, errors.join('; '));
}
```

Run: `node scripts/verify-site.mjs`
Expected: FAIL — `experiments/index.html missing`; `nav-inventory` fails about missing Experiments; `dist-pages` and `sitemap-roots` fail on the new root.

- [ ] **Step 2: Schema + seed tags**

`src/content/config.ts` projects schema: add `tags: z.array(z.string()).default([]),` after `technologies`. Both project JSON files gain `"tags": ["experiment"],`.

- [ ] **Step 3: Create `src/pages/experiments.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import HeadingWord from '../components/HeadingWord.astro';

// "A place for experiment": the operator tags project entries `experiment`;
// this page renders exactly those, newest status first is not needed —
// collection order is deterministic by slug.
const EXPERIMENT_TAG = 'experiment';
const experiments = (await getCollection('projects')).filter((p) =>
  (p.data.tags ?? []).includes(EXPERIMENT_TAG)
);
---

<BaseLayout
  title="Experiments — gonzalez"
  description="A place for experiment — small things in flight."
>
  <main class="reading-column">
    <h1 class="text-3xl font-semibold tracking-tight"><HeadingWord text="Experiments" /></h1>
    <p class="mt-4">Small things I'm building to see what happens.</p>
    {experiments.length === 0 ? (
      <p class="mt-4 text-ink-muted">Nothing is on the bench right now.</p>
    ) : (
      <ul class="mt-4 space-y-3">
        {experiments.map((experiment) => (
          <li>
            {experiment.data.github ? (
              <a href={experiment.data.github}>{experiment.data.name}</a>
            ) : (
              <strong>{experiment.data.name}</strong>
            )}
            {' — '}
            {experiment.data.description}{' '}
            <span class="font-mono text-sm text-ink-muted">({experiment.data.status})</span>
          </li>
        ))}
      </ul>
    )}
  </main>
</BaseLayout>
```

- [ ] **Step 4: Nav + About**

`BaseLayout.astro` nav becomes:

```astro
<a href="/">Home</a>
<a href="/about/">About</a>
<a href="/experiments/">Experiments</a>
```

`about.astro` body becomes:

```astro
<h1 class="text-3xl font-semibold tracking-tight"><HeadingWord text="About" /></h1>
<p class="mt-4">
  I'm <strong>gonzalez</strong>. I work on agentic development tooling —
  the <a href="https://github.com/gonzalez/agent-dev-setup">agent-dev-setup</a>
  outer-loop platform.
</p>
<p class="mt-4">
  This site is my lab — a place for experiment. What's in flight lives on
  the <a href="/experiments/">experiments</a> page; publishing here is a
  deliberate push of a static Astro build.
</p>
<p class="mt-4">
  No analytics, no comments, no database. To reach me,
  <a href="https://github.com/gonzalez">GitHub is the door</a>.
</p>
```

(Frontmatter title/description unchanged except description → `"About gonzalez — a place for experiment."`)

- [ ] **Step 5: Verify gate green**

Run: `python3 -m unittest discover tests -v && npm run check && npm run build && node scripts/verify-site.mjs`
Expected: PASS — 19/19.

- [ ] **Step 6: Commit**

```bash
git add src/ scripts/verify-site.mjs
git commit -m "feat(garden): /experiments/ renders tagged projects; nav Home/About/Experiments; About reframed (probes RED→GREEN)"
```

---

## Self-review

- **Spec coverage:** tag-driven list ✓ (schema + filter), page + raster ✓, nav ✓, About reframe ✓, empty state ✓, probes move with the contract ✓.
- **Step scan:** each step is one artifact; bodies only where copy/shape are pinned by the design.
- **Type consistency:** tag literal `experiment` identical across schema seed, page filter, probe; manifest slug `experiments` identical Tasks 1→2.
- **Review Focus:** each line pinned in the owning task (listed per line).
- **Proportion:** ~1 page of plan for a one-file page + schema field + nav/copy — proportionate.
