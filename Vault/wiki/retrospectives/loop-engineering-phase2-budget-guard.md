---
type: retrospective
sources:
  - phase2-budget-guard_260625_163229_plan.md
  - C:\code\Steward\CLAUDE.md
updated: 2026-07-03
tags:
  - status/active
  - scope/workflow
  - layer/orchestrator
---

# Loop Engineering — Phase 2: Budget-Guarded Autonomy Loop

> **Summary.** Phase 2 added a first-class **token budget that can say "no" independent of the goal** — the guard the roadmap calls mandatory before P3. Because the harness `budget.*` API lives only inside a Workflow, P2 stood the unattended loop up **as a Workflow run** and adopted a **two-path** model: interactive `/phx` (human-driven, no budget) stays; new `/if` launches the budget-guarded loop. The first real `/if` smoke-test proved the loop mechanics GREEN and unmasked three real defects. **7/7 tasks, PICA-clean.**

## What shipped

- **Two-path model:** `/phx` (interactive, no budget — the human watches cost) and `/if` (unattended → the `autonomy-loop` Workflow with a harness-enforced token ceiling). See [[autonomy-loop-and-budget-guard]].
- **The budget guard:** plan-sourced ceiling (`## Budget:` else 750k default); real spend via `budget.spent()` **baselined** loop-relative; an **80% warn** to the Decisions-Made surface → **hard halt below a 75k reserve floor** with an `/ex`-style escalation summary + `resumeFromRunId`; **no silent caps**.
- **The per-task loop** reuses P1's C.1–C.4 gate as discrete real-skill stages (build `/px`→`/ax` → separate verifier → single-pass `/ex`→`/fx`), making [[literal-skill-composition]] a *structural* guarantee (the deterministic Workflow can't improv).

## De-risking the one unknown

The loop hinged on a single unverified capability: *can a Workflow subagent invoke the Skill tool* (needed to run the real `/px`/`/ax`)? A ~10-line, 1-agent, 12s spike confirmed it **before** the ~200-line script — the [[spike-to-retire-capability-uncertainty]] pattern, born here.

## The smoke-test that earned its keep

The first real `/if` run validated mechanics **GREEN** (discrete `--- PX/AX/Verifier ---` stages, `/ax` PICA present, builder ≠ checker via a separate verifier) — and unmasked **three real defects**, now the [[workflow-script-authoring-gotchas]] page:

- **ERR-1** — `meta` must be a *pure literal* (`+` concat → validator reject).
- **ERR-2** — `args` arrives as a *JSON-encoded string* in background runs (normalize before use).
- **ERR-3** — `budget.spent()` is *shared cumulative turn spend*, not the loop's → **baseline** it (`startSpent`) so a budget means "tokens this run may spend."

## Verification & honesty notes

- **PICA: CLEAN RUN** (7/7, 0 issues) — skill/Workflow-definition artifacts, no Layer-5; correctness carried by `node --check` + `/sa` + snapshot-and-diff, not PICA.
- **Behavioral gaps (deferred):** the 80%-warn-with-tasks-running and `resumeFromRunId` assertions were not demonstrated end-to-end (the reserve-floor halt + escalation *were*, verbatim). First real feature run remains the full proof.

## Patterns this phase spawned

- [[autonomy-loop-and-budget-guard]] — the two-path loop + budget architecture
- [[spike-to-retire-capability-uncertainty]] — the de-risk pattern
- [[workflow-script-authoring-gotchas]] — the three ERR findings

## Related

- [[loop-engineering-phase1-verifier]] — Phase 1, whose verifier gate this loop reuses
- [[trust-but-verify-mid-task-gate]] — where the budget warn/halt surfaces
