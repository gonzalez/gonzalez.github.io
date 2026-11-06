---
id: TASK-8
title: Rename default branch master → main
status: In Progress
assignee:
  - '@agent'
created_date: '2026-11-06T04:41:00Z'
updated_date: '2026-11-06T22:48:00Z'
labels: []
dependencies:
  - TASK-7
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Housekeeping per operator: rename the repo's default branch from master to main. (1) after the garden chain lands and all agent branches merge: git branch -m master main; (2) push the renamed branch + set origin default: git push -u origin main && git push origin --delete master (both are OPERATOR-run pushes — the local-only rule does not apply to the publish gate, this happens once at publish time, operator-approved); (3) update GitHub Pages branch-source so Pages serves main; (4) update the platform loop config (drop the git.base_branch: master override so the platform default main applies); (5) confirm find_open_runs shows no stale rows and all agent merges complete first. This task runs LAST (after TASK-7).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 local checkout default branch renamed to main with no leftover master (local-only; push steps listed for the operator)
- [ ] #2 platform loop config no longer needs the base_branch override
- [ ] #3 README/design docs updated to reference main
<!-- AC:END -->
