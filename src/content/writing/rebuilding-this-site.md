---
title: Rebuilding this site as a digital garden
description: Why this repo went from a static export to an Astro garden — content as files, one validation gate, publishing as a deliberate act.
createdDate: 2026-11-06
tags: [gardens, astro, meta]
maturity: seedling
---

This site used to be a single static page that listed my public repositories.
It read like a dashboard. What I wanted instead was a **garden**: notes that
start rough and get better, a directory of projects, and pages that stay
readable for years.

So [gonzalez.github.io](https://github.com/gonzalez/gonzalez.github.io) is now
an Astro site, and content lives as files in the repo:

- `src/content/writing/*.md` — notes, each with a maturity
  ([seedling](/writing/), growing, or evergreen), a date, and tags.
- `src/content/projects/*.json` — a text directory, no cards or screenshots.

## What the loop gates

Nothing counts as done until one command passes locally: the rasterizer test
suite, `astro check`, a static build, and a set of site-contract probes that
read `dist/` — pages exist, the feed parses, no font binaries ship, slugs stay
unique. That discipline is the same one described in
[the agentic outer loop platform](/writing/agentic-outer-loop-platform/) note.

In one command:

```sh
python3 -m unittest discover tests && npm run check && npm run build && node scripts/verify-site.mjs
```

Publishing is not a side effect of a green run. It is a deliberate push by me.

## Status

Seedling. It is here to be edited as the garden grows — that is the point.
