---
type: anti-pattern
sources:
  - phase3-recovery-loop_260626_134136_plan.md
updated: 2026-06-26
tags:
  - status/active
  - scope/workflow
---

# Forward-Reference Comments Go Stale

> **Summary.** A comment that forward-references a *future* decision ("Phase N will do X **here**") silently goes stale when that later decision lands differently — the code can be correct while the comment now actively lies. Update forward-reference comments in the **same** phase that resolves the seam they point at.

## The hazard

When an early phase leaves a seam for later work, it's natural to annotate it: *"◆ P3 EXTENSION SEAM — Phase 3 replaces this with auto-recovery HERE."* That comment is a **promise about a decision not yet made**. If the later phase decides differently — e.g. P3's D5 ruled auto-recovery goes in the `/if` Workflow path **only**, never in the interactive `/phx` seam — the comment becomes an active lie: a future reader or agent following it would re-introduce the very thing the decision forbade.

The danger is **asymmetric**: the *code* gets exercised and verified, so it stays correct; the *comment* is never executed, so nothing catches the drift except a human (or agent) who reads it.

## The rule

- When a phase **resolves** a seam that an earlier comment forward-referenced, update that comment in the **same change** — flip "will do X here" to "X was resolved into Y; do **not** do X here."
- Prefer describing the *resolution and its boundary* over re-promising future work.
- Forward-reference comments are highest-risk where a later **decision** (not just code) can invert them — flag them for a review read when that decision locks.

## How it surfaced

P3's D5 regression — a *read* of `phx/SKILL.md`, not a test run — caught a stale `◆ P3 EXTENSION SEAM` comment promising auto-recovery would be inserted into `/phx`. D5 had ruled the opposite. The fix was one line; the durable lesson is that **regression reads, not just runs, are where stale forward-references get caught** (source: `phase3-recovery-loop_260626_134136_plan.md`).

## Related

- [[autonomy-loop-and-budget-guard]] — the feature whose D5 regression surfaced this
- [[multi-stage-migration-pitfalls]] — sibling workflow anti-pattern (drift between artifact and intent)
- [[loop-engineering-phase1-verifier]] — the verifier gate whose D5 boundary the stale comment contradicted
