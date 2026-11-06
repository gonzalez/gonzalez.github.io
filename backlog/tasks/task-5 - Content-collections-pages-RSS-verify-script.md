---
id: TASK-5
title: Content collections + pages + RSS + verify script
status: In Progress
assignee:
  - '@agent'
created_date: '2026-11-06T03:41:00Z'
updated_date: '2026-11-06T05:02:00Z'
labels: []
dependencies:
  - TASK-4
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Task 2 of the plan (scope narrowed by operator 2026-11-06: agents do not work on or read datums/finfocus material): writing index + note pages + projects directory + about + home (Currently Exploring, Selected Projects, Recent Writing) per spec IA; RSS via @astrojs/rss; scripts/verify-site.mjs contract probes; seed content limited to the operator's OWN work on github.com/gonzalez/* (the agentic outer loop platform). Previously drafted datums/finfocus posts and project entries scrubbed from content.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 verify-site.mjs contract probes green (pages, rss xml validity, no font binaries, slug uniqueness)
- [ ] #2 writing notes render with maturity + dates + tags via ArticleLayout
- [ ] #3 projects page renders text directory with status/tech/links
- [ ] #4 home includes three real posts/projects entries and no invented claims
- [ ] #5 RSS/at least writing slugs + dates all valid
<!-- AC:END -->
