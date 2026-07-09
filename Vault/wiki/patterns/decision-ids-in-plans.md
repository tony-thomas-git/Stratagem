---
type: pattern
sources:
  - C:/code/docs/ISCI-Web-App-docs/patterns/Decision-IDs-in-Plans-Pattern.md
updated: 2026-06-14
tags:
  - status/active
  - scope/workflow
---

# Decision IDs in Plans

> **Summary.** Give every locked decision a stable numeric ID (`D1`, `D2`, …), cite those IDs on every task, and `/px` confirm-or-override becomes a one-keystroke contract instead of a fresh question batch. Most question-batch friction is solved by making decisions **citable**, not by asking fewer questions.

This is the terse counterpart of the canon ledger at `Decision-IDs-in-Plans-Pattern.md` (source) — the gold doc holds the full origin story, the worked V2-In-Place-Edit example (D1–D40), and per-phase mechanics. This node is the retrieval view. Routed here (Stratagem-Wiki, `scope/workflow`) because it's `/pf→/cp→/px→/ax` methodology, not domain knowledge.

## The mechanism (4 moves)

1. **Lock decisions in a numbered table** — at the end of `/pf`/`/cp` (or `/rp` on resume), surface every visible micro-decision as `| # | Decision | Resolution |`. One row = one atomic decision.
2. **Cite IDs on every task** — each task header lists the `D#`s that govern it (`*D1, D2, D4*`). The task becomes a contract with specific clauses, not a free-floating instruction.
3. **`/px` becomes a confirmation step** — instead of re-asking "what color is the hover?", `/px` re-surfaces the cited decisions: "T4 is governed by D1, D2, D4 — still in effect?" Normal answer is `all good` (one keystroke); override is `D4 = amber not green, continue`.
4. **`/ax` cites IDs in the narrative** — "Applied `surface-100 @ 40%` on hover (per D1)" so the next reviewer traces the *why* without re-reading the PF.

## Naming convention

- Prefix `D` (avoids `T` tasks / `P` phases). Flat integer namespace across the whole plan.
- **Numbers are permanent** — dropped decisions stay as `~~struck~~` rows with a reason; never renumber (references would silently rot).
- Split into "PF-level" (architecture) vs "CP-level" (UI micro-choices) when 20+ rows; numbers stay global.
- Cite `(per D4)` in prose; `*D1, D2*` italic in task headers.

## The leverage

| Property | Enables |
|---|---|
| One-keystroke confirms | `all good` replaces re-thinking — high agency, low fatigue |
| Surgical overrides | `D4 = amber, continue` points at one row, not a paragraph |
| Audit trail | "per D1" in the commit/PR tells the next reader the rationale chain |
| Drift visibility | a row overridden often = the original lockdown was stale |
| Plan as living contract | tasks point at the resolution table as source of truth |

## Anti-patterns (do not)

- ❌ **Bury decisions in prose** — "we decided green for success" inside a paragraph is unparseable later.
- ❌ **Re-ask a locked decision** — if `D4` is locked, cite it, never re-prompt.
- ❌ **Renumber on edit** — dropping D7 must not shift D8→D7.
- ❌ **Compound rows** — "hover is X and cursor is Y" should be two rows so they override independently.
- ❌ **Decisions only in the PF, not in tasks** — the contract must be two-sided.

## Related

- [[cp-question-batch-pattern]] — the `/cp` step-7 batch that produces the decisions this pattern numbers *(forward-link)*
- [[trust-but-verify-mid-task-gate]] — the complement: this locks decisions up-front; Trust-But-Verify handles the ones that surface mid-task
- [[operating-modes]] — the `/pf→/cp→/px→/ax` lifecycle these IDs thread through
- [[tracer-bullet-discipline]] — sibling planning-discipline pattern
