---
id: TASK-5
title: Content collections + pages + RSS + verify script
status: In Progress
assignee:
  - '@agent'
created_date: '2026-11-06T03:41:00Z'
updated_date: '2026-11-06T04:32:00Z'
labels: []
dependencies:
  - TASK-4
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Task 2 of the plan: writing index + note pages + projects directory + about + home (Currently Exploring, Selected Projects, Recent Writing) per spec IA; RSS via @astrojs/rss; scripts/verify-site.mjs contract probes (dist pages exist, rss parses as XML with title+pubDate, no font binaries in dist, duplicate-slug failure, home garden markers). Seed content REAL per ledger: agentic outer loop post (links to github.com/gonzalez/agent-dev-setup), Datums web presence rebuild post (no live external link claims — describes the work), FinFocus robust-median contribution (public: https://github.com/rshade/finfocus/pull/2022 and #1863), plus project entries for the same three (status/tech from real repos). No invented claims anywhere.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 verify-site.mjs contract probes green (pages, rss xml validity, no font binaries, slug uniqueness)
- [ ] #2 writing notes render with maturity + dates + tags via ArticleLayout
- [ ] #3 projects page renders text directory with status/tech/links
- [ ] #4 home includes three real posts/projects entries and no invented claims
- [ ] #5 RSS/at least writing slugs + dates all valid
<!-- AC:END -->
