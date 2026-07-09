---
type: pattern
sources:
  - C:\code\Steward\CLAUDE.md
  - phase2-budget-guard_260625_163229_plan.md
updated: 2026-06-25
tags:
  - status/active
  - scope/workflow
---

# Spike to Retire Capability-Uncertainty

> **Summary.** When a decision ranks **High-complexity because of an unverified *capability*** ("can the harness / tool / library actually do X?") rather than a design preference, prefer a cheap throwaway **spike** to confirm the capability *before* committing the full build. It converts H-by-uncertainty into an evidence-backed L/M.

## The check

1. **Isolate the unknown.** Name the single capability the whole build rests on.
2. **Spike it.** Write the smallest possible throwaway that exercises *only* that capability and reports yes/no.
3. **Decide on evidence.** Green → build for real on solid ground. Red → you learned it before sinking the effort, and can pick a fallback knowingly.

## The case

Phase 2's autonomy loop hinged on one unknown: *can a Workflow-spawned subagent invoke the Skill tool* (needed to run the real `/px`/`/ax` per [[literal-skill-composition]])? Rather than author the ~200-line script on faith, a ~10-line, 1-agent, 12-second spike invoked `/px` from inside a Workflow subagent and confirmed it launched. The H-complexity unknown was retired for ~25k tokens before the real build (source: `C:\code\Steward\CLAUDE.md`, Trust-But-Verify).

## Why it matters

H decisions normally STOP and escalate (Complexity Ranking). But escalation answers *"is this worth the risk?"* — a spike answers *"is the risk even real?"* For capability questions the spike is almost always cheaper than the deliberation, and it turns a guess into a fact.

## Distinction from the sibling pattern

- [[verify-premise-before-building]] falsifies an *existence* premise — "does X already exist?" (a static `grep` / `git log`).
- **This pattern** confirms a *capability* — "can the tool DO X?" (a dynamic, runnable probe).

Same instinct — cheaply verify before committing — different target and mechanism.

## Related

- [[verify-premise-before-building]] — the existence-premise sibling
- [[trust-but-verify-mid-task-gate]] — the H-escalation guardrail this refines
- [[autonomy-loop-and-budget-guard]] — the build this de-risked
