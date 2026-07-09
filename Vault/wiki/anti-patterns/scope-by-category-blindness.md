---
type: anti-pattern
sources:
  - C:\code\docs\Steward-docs\Plans\one-corpus-ai-first_260615_204202_plan.md
  - stratagem-ado-plugin-scrub_260708_210440_plan.md
updated: 2026-07-09
tags:
  - status/active
  - scope/workflow
---

# Scope-by-Category Blindness

> **Summary.** Scoping a cross-cutting change to a *named subset* silently omits other members of the same conceptual family. You cover the names that came to mind, not the role they share — and the gap hides in the members you never enumerated.

## The shape

A change applies to "the X-side skills." You list the obvious ones and ship. Later you notice another skill that is X-side *in role* but wasn't in your list — so it never got the change. The boundary was an omission, not a principled exclusion.

## The case (EX-002)

Feature A wired the `CORPUS-READ-FIRST` routine into the four *plan-side* skills (`/pf`, `/cp`, `/px`, `/ax`). But `/ex` (diagnoses + plans fixes) is read-side in everything but name, and `/fx` / `/max` are write-side parallels to `/ax` — all four were omitted. The fix extended the routine to all eight, making the read-first family symmetric.

## The fix heuristic

Enumerate the family by **role**, not by recall. Ask: *"What is the defining behavior of the members I listed, and does any skill outside my list share it?"* If yes, it belongs in scope.

## Sibling instance — enumerated-literal verification gates (EX-001)

The same blindness hits *verification*, not just *change scope*. A grep-clean gate that enumerates exact literals (`intelliscience`, `ISCI - Consolidated - Kanban`, …) is blind to same-*family* variants it never listed. In the stratagem-ado plugin-scrub the gate passed (exit 0) while `ISCI-SAAS` — a real tenant area-path leaf — survived in a skill, because it was a different token from the enumerated `ISCI - Consolidated - Kanban`. An adversarial completeness-critic caught it by sweeping near-miss forms (`\bISCI\b`, `visualstudio`) the list didn't enumerate. Fix: pair enumerated-literal gates with a word-boundary/near-miss sweep — enumerate the family by role, not recall. See [[stratagem-ado-plugin-scrub]].

## Related

- [[audit-glob-self-blindness]] — sibling failure: a tool that can't see what its own enumeration excludes
- [[one-corpus-read-side]] — the plan where this was caught and fixed
- [[stratagem-ado-plugin-scrub]] — EX-001: the enumerated-grep-gate manifestation of this anti-pattern
