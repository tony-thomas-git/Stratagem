---
type: pattern
sources:
  - C:\code\docs\Steward-docs\Plans\vault-reconciliation_260614_154025_plan.md
  - c:\code\Steward\CLAUDE.md
updated: 2026-06-15
tags:
  - status/active
  - scope/workflow
---

# Counterpart Model

> **Summary.** A wiki vault should hold **transformed counterparts** of project-resident gold docs, not copies. A copy *promises* to equal its source, so any divergence is rot. A counterpart is a *view* of the source — terse, link-rich, §4.5-shaped — and is **allowed to differ**, so there is no "must-equal" promise to break and no rot to blame. The model dissolves the staleness problem rather than managing it.

## The dissolve

| | GOLD DOC (canon) | VAULT COUNTERPART |
|---|---|---|
| **Lives in** | `<project>-docs/patterns/` (project-resident) | `vault/wiki/<folder>/` (a node) |
| **Form** | verbose, accumulative **ledger** | terse, link-rich **retrieval node** (§4.5) |
| **Promise** | the full truth | a *view* of the truth — **allowed to differ** |
| **Sync obligation** | — | **none** (transformed ≠ clone → no "must equal" → no rot blame) |

The rot it kills came from a `raw/patterns/` slot holding **identical copies**. Identical copies must be kept identical; the moment canon moves, the copy is stale and the staleness is *blame-worthy*. Counterparts carry no such obligation — the gold doc IS the ledger, the counterpart IS the node, two forms for two purposes, intentionally different.

## How it stays honest — the "one breath" refresh (D-5)

The counterpart can't fall behind because **nothing updates the canon without updating the counterpart**. **Both `/rs` and `/crs` own this** (step 6): when either updates a gold doc, in the *same operation* it re-renders that doc's vault counterpart by invoking `/wiki-ingest <vault> <live-gold-doc-path>` (UPDATE mode auto-detects the existing node and edits in place — no duplicate). A **content-delta guard** re-renders only on counterpart-surfaced change (summary / `[[links]]` / mirrored sections) and skips+logs on ledger-only appends. **Scope: gold-doc-sourced counterparts only** — a counterpart whose `sources:` points at a `plans/...` path has no gold-doc parent to re-render from and is excluded. No separate detector, no copy to diff, no drift window opens. See [[d5-counterpart-refresh-hook]] for the build and [[wiki-ingest-drift-prevention-upgrade]] for the UPDATE path it reuses.

## `sources:` points at live external canon

A counterpart's `sources:` field points **directly at the live gold-doc path** (`C:/code/docs/<project>-docs/patterns/…`) — external to the vault, no `raw/` staging. `/wiki-ingest §0.4` permits non-`raw/` sources, so the generator reads canon directly. This eliminates the copy entirely: there is no second artifact to keep in sync, only a pointer.

## Why the old "copy → reference" crux was void

Early framings treated the vault↔canon relationship as a copy that must be referenced/symlinked/staged — an H-complexity coupling problem. The Counterpart Model voids it: a transformed view has no equality contract, so there is nothing to couple. The architecture got *simpler* than its plan assumed (no staging layer at all).

## Proven via tracer bullet

The model was unproven mechanism, so it was validated end-to-end on ONE node before any bulk op — render a §4.5 counterpart from live external canon, confirm it lands correct + audit-clean, *then* scale. Classic [[tracer-bullet-discipline]]: prove the risky vertical slice first.

## When it applies

- A project keeps verbose authoritative docs (gold docs / ADRs / runbooks) AND a retrieval-optimized wiki vault.
- The vault would otherwise duplicate canon (the copy-rot trap).
- A retrospective skill (`/rs`) already touches the canon, giving the refresh a natural host.

## Related

- [[wiki-graph-shape-contract]] — the §4.5 shape a counterpart node must take
- [[wiki-ingest-drift-prevention-upgrade]] — the `/wiki-ingest` UPDATE path the refresh reuses
- [[tracer-bullet-discipline]] — how the model was proven before bulk rollout
- [[multi-stage-migration-pitfalls]] — pitfalls hit while migrating copies → counterparts
