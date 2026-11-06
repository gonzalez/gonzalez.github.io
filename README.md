# gonzalez.github.io

A personal **digital garden**: notes that start rough and mature over time, a
text directory of projects, and a short about page. It is a static Astro site
whose content lives as files in this repository.

## Philosophy

This is not a portfolio and not a blog feed. Notes are planted as
*seedlings*, tended into *growing* pieces, and only called *evergreen* once
they are trusted to stay true. The point is durable, readable writing — not a
stream of new posts.

The site stays deliberately quiet: one centered reading column, system-aware
light and dark themes, no analytics, comments, database, auth, or CMS. Almost
no client JavaScript ships. Content is Markdown/MDX in git, and the output is
a plain static build. The design test is simple: remove any visual element
that does not improve clarity.

## Stack

- [Astro](https://astro.build) 5 (static output) with TypeScript
- Markdown/MDX content collections (`src/content/writing`, `src/content/projects`)
- Tailwind CSS v4 through `@tailwindcss/vite`
- `@astrojs/rss` and `@astrojs/sitemap`
- DDC Hardware 45, rasterized to PNG at build time (see below)

```
src/
  content/
    config.ts          # collection schemas
    writing/           # garden notes: .md / .mdx
    projects/          # project directory entries: .json
  layouts/             # BaseLayout, ArticleLayout
  pages/               # /, /writing, /writing/<slug>, /projects, /about, /rss.xml
  styles/global.css    # tokens + the one global stylesheet
  components/          # ThemeToggle, Toc
scripts/
  render_wordmark.py   # deterministic Pillow rasterizer
  prebuild-wordmark.sh # build step: both ink variants, 1x + 2x
  verify-site.mjs      # site-contract probes over dist/
tests/
  test_rasterizer.py   # rasterizer unit contracts
```

## Local development

Requires Node 22+ and, for the wordmark and its tests, Python 3 with
[Pillow](https://python-pillow.org) (`python3 -m pip install Pillow`).

```sh
npm install
npm run dev        # local dev server
npm run check      # astro check / TypeScript
npm run build      # static build into dist/ (runs the wordmark prebuild)
npm run preview    # serve the built dist/ locally
```

The full local gate — the same one a change must pass before it counts as
done — is:

```sh
python3 -m unittest discover tests -v \
  && npm run check \
  && npm run build \
  && node scripts/verify-site.mjs
```

`scripts/verify-site.mjs` reads the built `dist/` and checks the site's
contracts: every page exists, the RSS feed is well-formed and complete, slugs
are unique across collections, both wordmark ink variants ship, the footer
carries the EULA credit, the theme toggle is present on every page, TOC only
appears on notes with three or more `h2`s, fenced code is highlighted, no
font binaries leak, and the sitemap lists all four roots.

## Adding writing

Create `src/content/writing/<slug>.md` (or `.mdx`). The filename is the URL
slug, so `my-note.md` becomes `/writing/my-note/`. Start the file with
frontmatter:

```md
---
title: A note worth keeping
description: One sentence shown on the index, on the home page, and in RSS.
createdDate: 2026-11-06
updatedDate: 2026-11-06        # optional
tags: [gardens, astro]         # optional, defaults to []
maturity: seedling             # seedling | growing | evergreen
draft: false                   # optional; true hides the note completely
---

The body, in Markdown or MDX. Use `##` headings for sections.
```

- `title` and `description` are required; `createdDate` is required.
- `draft: true` keeps a note out of the writing index, the home page, RSS, and
  the static build.
- Link between notes by URL: `[another note](/writing/another-note/)`.
- Rendered `h2` headings get stable ids. A table of contents is added
  automatically only when a note has at least three `h2` sections.
- Update `maturity` as the note earns trust; there is no schedule.

## Adding a project

Create `src/content/projects/<slug>.json`; the filename is the entry's slug.

```json
{
  "name": "project-name",
  "description": "One line on what it is and why it exists.",
  "technologies": ["Astro", "TypeScript"],
  "status": "Active",
  "github": "https://github.com/gonzalez/project-name",
  "writeUp": "/writing/a-related-note/",
  "links": [{ "label": "Website", "href": "https://example.com" }]
}
```

`name`, `description`, and `status` are required; `technologies` defaults to
an empty array. `github`, `writeUp`, and `links` are optional — leave out
link targets that do not exist yet rather than inventing them. Keep slugs unique across the writing and
projects collections; the contract script fails on a collision.

The home page's **Selected Projects** list and the `/projects/` directory both
read this collection. The home page's **Currently Exploring** list is edited
directly in `src/pages/index.astro`.

## The wordmark rasterizer

The masthead is **DDC Hardware 45**, rendered to transparent PNGs — never
served as a webfont. The licensed OTF lives at
`assets/fonts-src/DDCHardware45-Regular.otf` and is gitignored: it is a local,
purchased operator fixture and must never be committed or served.

`npm run build` runs `scripts/prebuild-wordmark.sh`, which rasterizes both
palette variants into `public/assets/word/` (also gitignored and regenerated
on every build):

- `light/` — ink `#242424` for the light theme
- `dark/` — ink `#EAEAEA` for the dark theme

Each variant is emitted at 1x and 2x. To render a variant by hand:

```sh
python3 scripts/render_wordmark.py \
  --font assets/fonts-src/DDCHardware45-Regular.otf \
  --out public/assets/word/light \
  --text "gonzalez" \
  --ink 242424
```

Optional flags: `--height`, `--max-width` (shrink to fit, never upscale),
`--scales 1,2`, and `--ink <rrggbb>`. Output is deterministic: identical
inputs produce byte-identical PNGs. The unit contracts are run with:

```sh
python3 -m unittest discover tests -v
```

If the font is missing, the prebuild step fails loudly rather than shipping a
site without a masthead.

## License and font credit

There is no `LICENSE` file: the writing and site code remain © gonzalez, and
no reuse license is granted unless a file says otherwise.

DDC Hardware 45 is used under a purchased license. It is rasterized to PNG
only; the OTF is never committed or served. The footer must keep the EULA
credit verbatim:

> DDC Hardware 45 © Aaron James Draplin & Brian Bonislawsky via DDC Fonts – www.ddcfonts.com

`scripts/verify-site.mjs` fails the build gate if that line is missing from
any page.

## Publishing

Publishing is a deliberate operator act. Nothing in this repository rebuilds
or deploys by itself: there is no push-triggered workflow, no scheduled
rebuild, and no agent-driven deploy. The Next.js-era deploy workflow is
retired — a green local gate never publishes by itself.

The operator's flow:

1. Run the full local gate above (unittest → `astro check` → `astro build` →
   `node scripts/verify-site.mjs`).
2. `npm run preview` and read the built site once more.
3. Publish the built `dist/` to the branch GitHub Pages is configured to
   serve, then push `master` to origin for the record.

Two consequences of the manual posture are worth knowing:

- `dist/` is gitignored, so what GitHub Pages serves is the built output the
  operator publishes — never the sources.
- The Pages source must therefore be the branch that carries that output
  (branch deploy), **not** "GitHub Actions": with the deploy workflow
  retired, there is no run left to build or publish the site.

Because the licensed font and the generated wordmark are local-only, the site
is always built and reviewed locally before it goes out.
