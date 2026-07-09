---
type: pattern
sources:
  - C:\code\docs\Steward-docs\Plans\one-corpus-ai-first_260615_204202_plan.md
  - C:\code\docs\Steward-docs\Plans\one-corpus-ai-first_260605_seed.html
updated: 2026-06-16
tags:
  - status/active
  - scope/workflow
---

# Verify the Premise Before Building

> **Summary.** Before building work framed as "tune / extend / fix the existing X," cheaply *falsify* that X exists. A one-line `grep` or `git log -S` is enough. A false premise that survives into execution produces fabricated "done" work.

## The check

When a plan says "the existing X already does Y" and your task is to modify it:

1. **Falsify first.** `grep -c "X" <file>` or `git log --all -S "X"`. Expect a non-zero result; if it's zero, the premise is false.
2. **Re-scope on falsification.** "Tune an existing hook" becomes "author a new hook" — a different size and complexity. Escalate the re-scope; do not silently absorb it.

## The case (EX-001)

The claim *"the `/rs` D-5 counterpart-refresh hook already exists"* ran through the seed, the PF, and the plan unchallenged. `grep -c "D-5\|counterpart" rs/SKILL.md` returned **0**; `git log --all -S "D-5"` found no commit ever added it. The hook never existed. Catching this converted Feature C from a phantom "tune" into honest net-new work (see [[d5-counterpart-refresh-hook]]) and prevented guarding a hook that wasn't there.

## Why it matters

A premise asserted in one document gets copied forward as fact. The cost of checking is one command; the cost of not checking is building against a fiction.

## Sibling check — document currency before /pf or /rp

The EX-001 case falsifies a *claim inside* a doc. The same instinct applies to a *whole seed/plan* before you build from it: a document written before its own prerequisite completed is automatically suspect. Verify three axes against disk:

- **Intention** — is the goal still the right one? (usually timeless — preserve it)
- **Scope** — has upstream work narrowed it? (a completed prerequisite shrinks what's left)
- **Facts** — split each claim into: timeless-sound · count-drifted · superseded-by-done-work. Counts and "open question" status rot fastest; grep them against disk.

**A document that names its own prerequisite is a verification anchor:** when that prerequisite completes, re-validate the document before feeding it to `/pf` — or you re-plan already-built work.

## Refresh, don't rewrite

When a stale doc is still mostly sound, overlay rather than replace: a STATUS UPDATE banner at the top, inline `✓ RESOLVED` / `⟳ UPDATED` tags at each changed claim, and reframe superseded evidence as *historical motivation* (the why) rather than deleting it or leaving it as live state. Preserves the original reasoning chain; makes the delta auditable.

**Real instance:** the one-corpus seed (2026-06-05) named the Two-Vault Reconciliation as its prerequisite. When that completed, a currency pass found intention sound, scope narrowed (4 of 8 questions resolved), and facts split (29 gold docs ✓ · 37→48 nodes drifted · the `raw/` rot evidence superseded). Refreshed in place with banner + inline tags before `/pf`.

## Related

- [[d5-counterpart-refresh-hook]] — the net-new work EX-001 unmasked
- [[decision-ids-in-plans]] — how premises and decisions are tracked through a plan
- [[counterpart-model]] — other seed "DONE" claims that *were* verified true
