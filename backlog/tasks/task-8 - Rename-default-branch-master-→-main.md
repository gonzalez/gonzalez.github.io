---
id: TASK-8
title: Rename default branch master → main
status: Done
assignee:
  - '@agent'
created_date: '2026-11-06T04:41:00Z'
updated_date: '2026-11-06T22:50:00Z'
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
- [x] #1 local checkout default branch renamed to main with no leftover master (local-only; push steps listed for the operator)
- [x] #2 platform loop config no longer needs the base_branch override
- [x] #3 README/design docs updated to reference main
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Executed 2026-11-06 (agent): branch rename was already operator-complete before this task started — verified evidence: local branches only 'main' (no master); origin has only main; gh repo defaultBranchRef = main. Precondition (step 5) verified: find_open_runs shows no unreconciled rows — every INTERRUPTED row from the active era carries an operator reconcile note dated 2026-11-06, old-era AWAITING_REVIEW rows predate the astro era, no agent/* branches remain (all merged into main). AC#2: dropped the redundant git.base_branch override from agent-dev-setup/orchestrator/config.yaml (commit 1db44c5) — core/gitops.py default resolves to 'main'; orchestrator unittest suite 216/216 OK after the change. Note: the committed config had never carried a master override (it was per-run only), so the drop removes a line that already equaled the platform default. AC#3: README already referenced main (operator commit 63b89eb); design + plan docs updated in commit 0fc9119 (status row, repo realities, builder inventory, architecture, global constraints branch section). Site contract probes re-run: 16/16.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
TASK-8 closed. The master→main rename was operator-complete at start (verified: local + origin branches, GitHub default = main, no leftover master, all agent branches merged); this task's remaining work was (a) dropping the git.base_branch override in agent-dev-setup/orchestrator/config.yaml — the platform default 'main' now applies verbatim, orchestrator suite 216/216 OK (commit 1db44c5); (b) design/plan docs updated to reference main with the rename noted (site repo commit 0fc9119, design status row also updated); site-contract probes 16/16. Screenshots n/a (docs-only). Follow-ups: none — board is drained; the design doc's queued 'auto-detect origin/HEAD' platform item remains out of scope.
<!-- SECTION:FINAL_SUMMARY:END -->
