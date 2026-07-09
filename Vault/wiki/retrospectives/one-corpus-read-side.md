---
type: retrospective
sources:
  - C:\code\docs\Steward-docs\Plans\one-corpus-ai-first_260615_204202_plan.md
  - C:\code\docs\Steward-docs\Plans\one-corpus-ai-first_260615_plan.html
updated: 2026-06-16
tags:
  - status/active
  - scope/workflow
---

# One Corpus, AI-First — Read Side

> **Summary.** Wired the read-side of the one-corpus system: planning skills now consult the local wiki graph before web/context7 ([[index-first-retrieval]]), and a research-capture path deposits external findings once for synthesis via `/wiki-ingest`. Two error cycles (false premise, coverage gap) shaped the result. Zero new abstractions.

## What shipped

- **Feature A — read-first wiring.** The `CORPUS-READ-FIRST` block was added to the four plan-side skills, then extended to all eight read/write skills (`/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`) after EX-002. Body byte-identical across all eight (`sha256` `29437286…`), kept honest by a change-coupling sync-note.
- **Feature B — research capture.** `raw/research/` + `raw/library-docs/` in both vaults; proven end-to-end by a tracer round-trip (deposit → `/wiki-ingest` → indexed node → audit-clean).

## The two error cycles

- **EX-001 — false premise.** Feature C assumed an existing D-5 hook; it never existed. Re-scoped to net-new and deferred, then built separately. See [[verify-premise-before-building]] and [[d5-counterpart-refresh-hook]].
- **EX-002 — coverage gap.** Feature A reached only four of eight read-side skills. Extended to the full family. See [[scope-by-category-blindness]].

## What held

- **Simplicity.** All work is prose edits to existing skills + folder creation + reuse of `/wiki-ingest`. No new skill, no new abstraction.
- **Prose-DRY discipline.** The byte-identical + sync-note + `sha256` pattern from [[wiki-skills-sync-symmetry]] carried both the CORPUS-READ-FIRST block and the D-5 guard.

## Doc-refinement pass (2026-06-16)

A close-out pass on the completed-report (`_completed.html`) surfaced three small learnings:

- **Read-side / write-side / bridge framing.** Added a section explaining "(Read Side)" as the *consumption* half (corpus serves the agent) atop the already-built *production* half (agent serves the corpus), joined by Feature B as the capture bridge. Interpretation, not new facts — the sidecar's fact-parity rule held.
- **CSS over SVG for reflowable concept diagrams.** The two-halves concept diagram was authored in **HTML/CSS** (reflows, selectable, editable without coordinate math); the mechanism "loop" diagram stayed **SVG** (free geometry — crossing arcs). The split rule: SVG for free geometry, CSS for box-and-label layouts that must reflow.
- **Don't flatten routing downstream.** The loop diagram had collapsed the fallback to "web/context7"; corrected to name the [[research-tool-routing-ladder]] (context7 for libs, Tavily ladder for else). Document-currency discipline for stale seeds/plans was folded into [[verify-premise-before-building]] the same day.

## Related

- [[index-first-retrieval]] — the read-path mechanism Feature A wires in
- [[wiki-skills-sync-symmetry]] — the prose-DRY discipline reused here
- [[verify-premise-before-building]] · [[scope-by-category-blindness]] — the two error-cycle learnings
- [[research-tool-routing-ladder]] — the routed fallback the loop diagram must name, not flatten
