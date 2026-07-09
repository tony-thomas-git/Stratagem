---
type: pattern
sources:
  - C:\code\Steward\CLAUDE.md
  - phx-verifier_260625_125048_plan.md
  - stratagem-ado-plugin_260628_211148_plan.md
updated: 2026-06-29
tags:
  - status/active
  - scope/workflow
  - layer/orchestrator
---

# Literal Skill Composition

> **Summary.** A skill that chains other skills must **invoke them via the Skill tool** — never inline, paraphrase, or "improv" their logic in one reasoning thread. The sub-skills' validation checklists and per-task audits (e.g. `/ax`'s PICA) only run if the skills are *actually called*; folding them into your own thinking silently skips them.

## The failure mode

A live `/phx` run was observed *describing* the `/px`/`/ax` analysis inline instead of invoking the real skills, and skipping per-task PICA entirely (source: `C:\code\Steward\CLAUDE.md`, Quality Standards #6). It "didn't matter" only because the tasks happened to touch no Layer-5 files — had they, a Windsor or UI-thread issue would have slipped through unaudited. The agent grading its own homework, one level up.

## The rule

For each step in a chaining skill, **call the real skill** (`/px`, `/ax`, `/ex`→`/fx`, …) through the Skill tool, and surface an explicit phase label per transition (`--- Task N: PX Analysis ---`, etc.). If a skill isn't invoked, its checklist and audit did not run — treat the step as incomplete.

## Generalization — don't substitute a prescribed mechanism either

The same failure mode applies when a step names a **specific tool**, not just a sub-skill. `/rs` step 6 (and the vault `CLAUDE.md` §3.4/§7) say "create/update pages **via `/wiki-ingest`**." On the stratagem-ado `/rs` run the pages were authored with raw `Write` instead — they *looked* fine and passed the §4.5 audit, but `/wiki-ingest` also performs §7's ingest logging, so the `CHANGELOG.md` + `ingest-log.md` entries were **silently dropped** (caught only when the user noticed the missing changelog).

Substituting a lower-level tool (`Write`) for the prescribed one (`/wiki-ingest`) is the *same* anti-pattern as inlining a sub-skill: **the named mechanism does work you can't see** (here the §7 log step; with sub-skills, the checklists + PICA), and bypassing it drops that work silently. Use the named mechanism. If you believe a deviation is warranted, **surface it first** — naming the obligations the mechanism performs that you would then owe — and wait for agreement. Never substitute silently. *(source: `stratagem-ado-plugin_260628_211148_plan.md`)*

## Structural enforcement beats discipline

In-skill prose ("please invoke the real skill") is discipline — it can be ignored. The stronger form is **structural**: when the loop runs as a deterministic Workflow (see [[autonomy-loop-and-budget-guard]]), each phase is a separate `agent()` stage that literally runs its skill, so the control flow *cannot* fold the phases into one improv'd thread. The rule becomes a harness guarantee, not a request.

## Related

- [[autonomy-loop-and-budget-guard]] — where literal composition is enforced structurally
- [[skill-catalog]] — the skills being composed
- [[operating-modes]] — the PX→AX→… chain this governs
- [[trust-but-verify-mid-task-gate]] — the per-step verification this protects
