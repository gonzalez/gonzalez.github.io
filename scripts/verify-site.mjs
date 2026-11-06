#!/usr/bin/env node
/**
 * Site-contract probes for the digital garden. Run after `npm run build`:
 *
 *   node scripts/verify-site.mjs
 *
 * Part of the loop validation gate (docs/plans/2026-11-05-digital-garden-plan.md):
 *
 *   1. dist-pages      — the four roots and every non-draft note page exist
 *   2. rss-xml         — dist/rss.xml parses as XML (well-formed)
 *   3. rss-title       — the channel carries a non-empty <title>
 *   4. rss-items       — every item carries a <title> and a valid <pubDate>
 *   5. rss-slugs       — item links cover exactly the writing slugs in source
 *   6. no-font-binaries— no .otf/.ttf/.woff/.woff2/.eot anywhere in dist
 *                        (DDC EULA: rasterized PNGs only, never font binaries)
 *   7. slug-uniqueness — no duplicate slugs across the writing and projects
 *                        collections (Review Focus #4: /writing/<slug> collision)
 *   8. home-holding    — home carries the DDC "more is coming soon" headline
 *                        and the short holding line (TASK-9: garden sections
 *                        are gone from the front door, pages stay live)
 *   9. sitemap-roots   — the sitemap lists all four roots
 *  10. home-no-entries — home lists no post/project entries or garden
 *                        sections (TASK-9: it is a holding page, not a landing)
 *  11. wordmark-variants — BOTH rasterized masthead inks ship in dist
 *                        (light/ #242424 + dark/ #EAEAEA @1x+@2x) and home
 *                        references both (TASK-3, plan Review Focus #2)
 *  12. footer-eula     — the footer carries the DDC EULA credit line verbatim
 *                        (TASK-3; checked on home, directories, and notes)
 *  13. theme-toggle    — a [data-theme-toggle] control exists on every page
 *                        (TASK-3: system detection + vanilla-JS toggle)
 *  14. reading-clamp   — global.css caps the reading column with the
 *                        max(0.5rem, calc((100% - 680px)/2)) clamp and keeps
 *                        the column class in use (TASK-3, Review Focus #1);
 *                        <430px behavior stays a manual visual check
 *  15. toc-conditional — note pages with ≥ 3 h2s carry a [data-toc] nav;
 *                        shorter notes must NOT (TASK-3, Review Focus #5)
 *  16. syntax-highlight— notes that contain fenced code blocks ship them
 *                        highlighted (`astro-code` class present in dist)
 *                        (TASK-3)
 *  17. heading-rasters  — DDC heading PNGs (4 slugs × both inks × 1x+2x) +
 *                        manifest.json ship in dist, and directory headings
 *                        carry width/height attrs (TASK-9, Review Focus 1–3)
 *
 * Lighthouse performance is deliberately NOT gated here: per the plan it is
 * the operator's manual review (`npm run preview`/`npx serve dist`), not a
 * verify-script contract.
 *
 * Exits 0 with a summary when every probe passes; exits 1 listing each failure.
 * fast-xml-validator validates the RSS feed without pulling in the deprecated
 * XMLValidator export from fast-xml-parser.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const WRITING_DIR = join(ROOT, 'src', 'content', 'writing');
const PROJECTS_DIR = join(ROOT, 'src', 'content', 'projects');
const SITE = 'https://gonzalez.github.io';

const FONT_EXTENSIONS = new Set(['.otf', '.ttf', '.woff', '.woff2', '.eot']);
const SITEMAP_ROOTS = [`${SITE}/`, `${SITE}/writing/`, `${SITE}/projects/`, `${SITE}/about/`];

const failures = [];
let total = 0;

/** Record one probe. `ok` false pushes a failure line. */
function probe(name, ok, detail = '') {
  total += 1;
  if (!ok) failures.push(detail ? `${name} — ${detail}` : name);
}

/** Recursively list every file under `dir` (relative paths). */
function walk(dir, prefix = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

/** Content-file slugs for a collection dir: [{ slug, file }]. */
function sourceSlugs(dir, extensions) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extensions.includes(extname(f).toLowerCase()))
    .map((f) => ({ slug: f.slice(0, -extname(f).length), file: f }));
}

/** Frontmatter `draft: true` check (drafts must not ship to dist or RSS). */
function isDraft(file) {
  const text = readFileSync(file, 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return frontmatter ? /^draft:\s*true\s*$/m.test(frontmatter[1]) : false;
}

// --- source slugs -----------------------------------------------------------

const writingNotes = sourceSlugs(WRITING_DIR, ['.md', '.mdx']);
const projectEntries = sourceSlugs(PROJECTS_DIR, ['.json']);
const publishedNotes = writingNotes.filter((n) => !isDraft(join(WRITING_DIR, n.file)));

// --- probe 7: slug uniqueness across collections ----------------------------

{
  const seen = new Map();
  const duplicates = [];
  for (const [collection, entries] of [
    ['writing', writingNotes],
    ['projects', projectEntries],
  ]) {
    for (const { slug, file } of entries) {
      const key = slug.toLowerCase();
      if (seen.has(key)) duplicates.push(`'${key}' in ${seen.get(key)} and ${collection}/${file}`);
      else seen.set(key, `${collection}/${file}`);
    }
  }
  probe(
    'slug-uniqueness',
    duplicates.length === 0,
    duplicates.length ? `duplicate slug(s): ${duplicates.join('; ')}` : ''
  );
}

// --- probe 1: dist pages ----------------------------------------------------

if (!existsSync(DIST)) {
  probe('dist-pages', false, 'dist/ missing — run `npm run build` first');
} else {
  const expected = [
    'index.html',
    'writing/index.html',
    'projects/index.html',
    'about/index.html',
    ...publishedNotes.map((n) => `writing/${n.slug.toLowerCase()}/index.html`),
  ];
  const missing = expected.filter((p) => !existsSync(join(DIST, p)));
  probe('dist-pages', missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : '');
}

// --- probes 2–5: rss.xml ----------------------------------------------------

const rssPath = join(DIST, 'rss.xml');
const expectedLinks = new Set(publishedNotes.map((n) => `/writing/${n.slug.toLowerCase()}/`));

if (!existsSync(rssPath)) {
  probe('rss-xml', false, 'dist/rss.xml missing');
  probe('rss-title', false, 'feed missing');
  probe('rss-items', false, 'feed missing');
  probe('rss-slugs', false, 'feed missing');
} else {
  const xml = readFileSync(rssPath, 'utf8');
  let wellFormed = true;
  let validity = null;
  try {
    SyntaxValidator.validate(xml);
  } catch (err) {
    wellFormed = false;
    validity = err;
  }
  probe('rss-xml', wellFormed, wellFormed ? '' : `malformed XML: ${validity?.message ?? JSON.stringify(validity)}`);

  if (!wellFormed) {
    probe('rss-title', false, 'feed did not parse');
    probe('rss-items', false, 'feed did not parse');
    probe('rss-slugs', false, 'feed did not parse');
  } else {
    const doc = new XMLParser({ ignoreAttributes: false }).parse(xml);
    const channel = doc?.rss?.channel;

    const title = channel?.title;
    probe(
      'rss-title',
      typeof title === 'string' && title.trim().length > 0,
      'channel has no non-empty <title>'
    );

    const rawItems = channel?.item ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];
    const undatedOrUntitled = items.filter((item) => {
      const hasTitle = typeof item?.title === 'string' && item.title.trim().length > 0;
      const hasDate = item?.pubDate != null && !Number.isNaN(Date.parse(String(item.pubDate)));
      return !hasTitle || !hasDate;
    });
    probe(
      'rss-items',
      items.length > 0 && undatedOrUntitled.length === 0,
      items.length === 0
        ? 'no <item> elements'
        : `${undatedOrUntitled.length} item(s) missing <title> or valid <pubDate>`
    );

    // @astrojs/rss absolutizes links against `site`; compare URL paths so
    // the probe checks slugs regardless of how the feed spells the origin.
    const toPath = (link) => (link.startsWith(SITE) ? link.slice(SITE.length) : link);
    const links = new Set(items.map((item) => toPath(String(item?.link ?? ''))));
    const missingLinks = [...expectedLinks].filter((l) => !links.has(l));
    const staleLinks = [...links].filter((l) => !expectedLinks.has(l));
    const detail = [
      missingLinks.length ? `not in feed: ${missingLinks.join(', ')}` : '',
      staleLinks.length ? `no source note: ${staleLinks.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('; ');
    probe('rss-slugs', missingLinks.length === 0 && staleLinks.length === 0, detail);
  }
}

// --- probe 6: no font binaries in dist --------------------------------------

if (!existsSync(DIST)) {
  probe('no-font-binaries', false, 'dist/ missing — run `npm run build` first');
} else {
  const fontFiles = walk(DIST).filter((f) => FONT_EXTENSIONS.has(extname(f).toLowerCase()));
  probe(
    'no-font-binaries',
    fontFiles.length === 0,
    fontFiles.length ? `font binaries shipped: ${fontFiles.join(', ')}` : ''
  );
}

// --- probe 8: home is the holding page (TASK-9) ------------------------------

const homePath = join(DIST, 'index.html');
{
  const home = existsSync(homePath) ? readFileSync(homePath, 'utf8') : '';
  const missing = [
    ['the coming-soon headline', /<img[^>]*alt="more is coming soon"[^>]*>/],
    ['the holding copy', /Glad you/],
  ]
    .filter(([, pattern]) => !pattern.test(home))
    .map(([label]) => label);
  probe(
    'home-holding',
    existsSync(homePath) && missing.length === 0,
    existsSync(homePath) ? `home is missing: ${missing.join(', ')}` : 'dist/index.html missing'
  );
}

// --- probe 10: home lists no garden entries or sections (TASK-9) -------------

// A holding page has no post/project rows and no garden-section headings.
{
  const home = existsSync(homePath) ? readFileSync(homePath, 'utf8') : '';
  const present = [
    'data-home-entry=',
    'Currently Exploring',
    'Selected Projects',
    'Recent Writing',
  ].filter((marker) => home.includes(marker));
  probe(
    'home-no-entries',
    existsSync(homePath) && present.length === 0,
    existsSync(homePath)
      ? `home still carries: ${present.join(', ')}`
      : 'dist/index.html missing'
  );
}

// --- probe 11: both wordmark ink variants ship -------------------------------
//
// TASK-3 (Review Focus #2): a rasterized light-ink masthead on a dark page is
// invisible, so dist must carry both variants and the home page must show
// both of them to the CSS palette swap.
{
  const expected = [
    'assets/word/light/gonzalez@1x.png',
    'assets/word/light/gonzalez@2x.png',
    'assets/word/dark/gonzalez@1x.png',
    'assets/word/dark/gonzalez@2x.png',
  ];
  const missing = existsSync(DIST) ? expected.filter((p) => !existsSync(join(DIST, p))) : expected;
  const home = existsSync(homePath) ? readFileSync(homePath, 'utf8') : '';
  const unreferenced = existsSync(homePath)
    ? ['/assets/word/light/gonzalez@1x.png', '/assets/word/dark/gonzalez@1x.png'].filter(
        (reference) => !home.includes(reference)
      )
    : ['/assets/word/* (dist/index.html missing)'];
  probe(
    'wordmark-variants',
    missing.length === 0 && unreferenced.length === 0,
    [
      missing.length ? `not in dist: ${missing.join(', ')}` : '',
      unreferenced.length ? `not referenced by home: ${unreferenced.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('; ')
  );
}

// --- probe 12: footer carries the EULA credit verbatim -----------------------
//
// The exact line pinned by the plan's Global Constraints. HTML normalization
// only — decode entities, strip tags, collapse whitespace — so the probe
// reads the browser-facing text, which is what the EULA requires.
const EULA_CREDIT =
  'DDC Hardware 45 © Aaron James Draplin & Brian Bonislawsky via DDC Fonts – www.ddcfonts.com';

const decodeHtml = (html) =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ');

const allPages = [
  'index.html',
  'writing/index.html',
  'projects/index.html',
  'about/index.html',
  ...publishedNotes.map((n) => `writing/${n.slug.toLowerCase()}/index.html`),
];
{
  const withPages = existsSync(DIST) ? allPages : [];
  const missingCredit = withPages.filter((page) => {
    const file = join(DIST, page);
    return !existsSync(file) || !decodeHtml(readFileSync(file, 'utf8')).includes(EULA_CREDIT);
  });
  probe(
    'footer-eula',
    existsSync(DIST) && missingCredit.length === 0,
    existsSync(DIST) && missingCredit.length > 0
      ? `missing the verbatim credit on: ${missingCredit.join(', ')}`
      : existsSync(DIST)
        ? ''
        : 'dist/ missing — run `npm run build` first'
  );
}

// --- probe 13: theme toggle present (vanilla JS control) ---------------------

{
  const withoutToggle = existsSync(DIST)
    ? allPages.filter((page) => {
        const file = join(DIST, page);
        return !existsSync(file) || !readFileSync(file, 'utf8').includes('data-theme-toggle');
      })
    : allPages;
  probe(
    'theme-toggle',
    existsSync(DIST) && withoutToggle.length === 0,
    existsSync(DIST) && withoutToggle.length > 0
      ? `no [data-theme-toggle] on: ${withoutToggle.join(', ')}`
      : existsSync(DIST)
        ? ''
        : 'dist/ missing'
  );
}

// --- probe 14: reading-column clamp pinned at the source --------------------
//
// Inline stylesheets are minified in dist, so the exact clamp formula is
// asserted in src/styles/global.css (Task 1's planned contract). The <430px
// visual behavior itself stays the operator's manual review — no browser in
// this loop, per plan Task 3.
{
  const cssPath = join(ROOT, 'src', 'styles', 'global.css');
  const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
  const hasClamp = css.includes('max(0.5rem, calc((100% - 680px)/2))');
  const hasColumn = /^\.reading-column \{/m.test(css);
  probe(
    'reading-clamp',
    hasClamp && hasColumn,
    hasColumn
      ? hasClamp
        ? ''
        : 'global.css lost the max(0.5rem, calc((100% - 680px)/2)) reading-column clamp'
      : 'global.css has no .reading-column rule'
  );
}

// --- probe 15: TOC only on notes with >= 3 h2s (TASK-3, Review Focus #5) ----
//
// Count the h2s actually rendered into each dist note page (not source
// greps — walls of truth stay in the browser-facing artifact) and require
// [data-toc] exactly when there are three or more.
{
  const errors = [];
  if (!existsSync(DIST)) errors.push('dist/ missing — run `npm run build` first');
  for (const n of publishedNotes) {
    const page = `writing/${n.slug.toLowerCase()}/index.html`;
    const file = join(DIST, page);
    if (!existsSync(file)) {
      errors.push(`${page} missing`);
      continue;
    }
    const html = readFileSync(file, 'utf8');
    const h2Count = (html.match(/<h2[\s>]/g) ?? []).length;
    const hasToc = html.includes('data-toc');
    if (h2Count >= 3 && !hasToc) errors.push(`${page}: ${h2Count} h2s but no TOC`);
    if (h2Count < 3 && hasToc) errors.push(`${page}: only ${h2Count} h2(s) but a TOC is present`);
  }
  probe('toc-conditional', errors.length === 0, errors.join('; '));
}

// --- probe 16: fenced code blocks ship syntax-highlighted (Shiki) ------------

const CODE_FENCE = /^```/m;
{
  const errors = [];
  if (!existsSync(DIST)) errors.push('dist/ missing — run `npm run build` first');
  for (const n of writingNotes) {
    const source = join(WRITING_DIR, n.file);
    if (!CODE_FENCE.test(readFileSync(source, 'utf8'))) continue;
    const page = `writing/${n.slug.toLowerCase()}/index.html`;
    const file = join(DIST, page);
    if (!existsSync(file) || !readFileSync(file, 'utf8').includes('astro-code')) {
      errors.push(`${page}: fenced code not highlighted (no astro-code block)`);
    }
  }
  probe('syntax-highlight', errors.length === 0, errors.join('; '));
}

// --- probe 17: DDC heading rasters (TASK-9) ---------------------------------
//
// Every static heading ships both ink variants at 1x+2x, the dimension
// manifest is present in dist (CI path builds without the licensed font), and
// directory headings render as <img> with width/height (no layout shift).
{
  const HEADING_SLUGS = ['more-is-coming-soon', 'writing', 'projects', 'about'];
  const errors = [];
  const manifestPath = join(DIST, 'assets/word/manifest.json');
  if (!existsSync(DIST)) errors.push('dist/ missing — run `npm run build` first');
  if (!existsSync(manifestPath)) {
    errors.push('dist/assets/word/manifest.json missing');
  } else {
    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      errors.push(`manifest.json is not valid JSON: ${error.message}`);
    }
    if (manifest) {
      for (const slug of HEADING_SLUGS) {
        for (const ink of ['light', 'dark']) {
          for (const scale of ['1', '2']) {
            const png = `assets/word/${ink}/${slug}@${scale}x.png`;
            if (!existsSync(join(DIST, png))) errors.push(`${png} missing from dist`);
            const dims = manifest[slug]?.[ink]?.[scale];
            if (!Array.isArray(dims) || dims.length !== 2) {
              errors.push(`manifest lacks ${slug}/${ink}/${scale} dimensions`);
            }
          }
        }
      }
    }
  }
  const writingPage = join(DIST, 'writing/index.html');
  if (!existsSync(writingPage)) {
    errors.push('writing/index.html missing');
  } else {
    const html = readFileSync(writingPage, 'utf8');
    const img = html.match(/<img[^>]*alt="Writing"[^>]*>/)?.[0] ?? '';
    if (!img) errors.push('no heading <img alt="Writing"> on writing/index.html');
    if (img && !/width=/.test(img)) errors.push('heading <img> has no width attribute');
    if (img && !/height=/.test(img)) errors.push('heading <img> has no height attribute');
  }
  // Narrow viewports: the long "more is coming soon" raster must scale
  // proportionally instead of being squished by a fixed height (final review).
  const css = readFileSync(join(ROOT, 'src', 'styles', 'global.css'), 'utf8');
  const headingRule = css.match(/\.heading-word\s*\{([^}]*)\}/)?.[1] ?? '';
  if (!/max-width:\s*100%/.test(headingRule)) {
    errors.push('.heading-word lacks max-width: 100% (squished headline on small screens)');
  }
  if (!/height:\s*auto/.test(headingRule)) {
    errors.push('.heading-word lacks height: auto (non-proportional scaling)');
  }
  probe('heading-rasters', errors.length === 0, errors.join('; '));
}

// --- probe 9: sitemap lists the four roots ----------------------------------

const sitemapIndexPath = join(DIST, 'sitemap-index.xml');
const sitemapPath = join(DIST, 'sitemap-0.xml');
if (!existsSync(sitemapIndexPath) || !existsSync(sitemapPath)) {
  probe('sitemap-roots', false, 'sitemap files missing from dist/');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const missing = SITEMAP_ROOTS.filter((root) => !sitemap.includes(`<loc>${root}</loc>`));
  probe(
    'sitemap-roots',
    missing.length === 0,
    missing.length ? `sitemap missing: ${missing.join(', ')}` : ''
  );
}

// --- summary ----------------------------------------------------------------

if (failures.length > 0) {
  console.error(`✗ ${failures.length}/${total} site-contract probes FAILED`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`✓ ${total}/${total} site-contract probes passed`);
