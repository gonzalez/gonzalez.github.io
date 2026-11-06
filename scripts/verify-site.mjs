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
 *   8. home-markers    — the home page carries the three garden markers
 *                        (Currently Exploring / Selected Projects / Recent Writing)
 *   9. sitemap-roots   — the sitemap lists all four roots
 *
 * Exits 0 with a summary when every probe passes; exits 1 listing each failure.
 * fast-xml-parser rides along with @astrojs/rss (the serializer this feed is
 * produced by), so no extra dependency is introduced.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const WRITING_DIR = join(ROOT, 'src', 'content', 'writing');
const PROJECTS_DIR = join(ROOT, 'src', 'content', 'projects');
const SITE = 'https://gonzalez.github.io';

const FONT_EXTENSIONS = new Set(['.otf', '.ttf', '.woff', '.woff2', '.eot']);
const HOME_MARKERS = ['Currently Exploring', 'Selected Projects', 'Recent Writing'];
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
  const validity = XMLValidator.validate(xml);
  const wellFormed = validity === true;
  probe('rss-xml', wellFormed, wellFormed ? '' : `malformed XML: ${JSON.stringify(validity)}`);

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

// --- probe 8: home garden markers -------------------------------------------

const homePath = join(DIST, 'index.html');
if (!existsSync(homePath)) {
  probe('home-markers', false, 'dist/index.html missing');
} else {
  const home = readFileSync(homePath, 'utf8');
  const missing = HOME_MARKERS.filter((marker) => !home.includes(marker));
  probe(
    'home-markers',
    missing.length === 0,
    missing.length ? `home is missing: ${missing.join(', ')}` : ''
  );
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
