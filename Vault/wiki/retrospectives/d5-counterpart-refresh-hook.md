---
type: retrospective
sources:
  - C:\Users\steep\.claude\skills\rs\SKILL.md
  - C:\Users\steep\.claude\skills\crs\SKILL.md
  - C:\code\docs\Steward-docs\Plans\260615_213932_handoff_feature-c-d5-counterpart-hook.md
updated: 2026-06-15
tags:
  - status/active
  - scope/workflow
---

# D-5 Counterpart-Refresh Hook — Build

> **Summary.** Built the net-new D-5 "one breath" counterpart-refresh hook in
> `/rs` and `/crs` step 6, with a content-delta guard, scoped to
> **gold-doc-sourced counterparts only**. When either skill updates a gold doc
> whose vault counterpart's `sources:` resolves to a `<project>-docs/patterns/`
> path, it re-renders the counterpart in the same operation via `/wiki-ingest`
> UPDATE mode. The shared guard criteria are **byte-identical** across both
> files, proven by an HTML-comment fence + `sha256`.

**Log ID:** FEAT-WF-003

## The premise was false — it's net-new, not a tune

The hook was "Feature C" of the one-corpus plan, framed as *tuning* an existing
D-5 refresh. Investigation (EX-001) proved that premise false: **the hook it was
meant to tune never existed** in any committed state. `grep -c "D-5\|counterpart"`
returned `0` in both `rs/SKILL.md` and `crs/SKILL.md` at build time. So this was
built from scratch. The [[counterpart-model]] page itself had asserted the hook
existed ("`/rs` owns this") — a documented claim that was aspirational until this
session made it true. That contradiction is now reconciled.

## What changed

Two files, both in `~/.claude/skills/`:

| File | Edit |
|---|---|
| `rs/SKILL.md` | step 6: D-5 guard block + sync-note; step 8: counterpart re-rendered log line |
| `crs/SKILL.md` | step 6: byte-identical guard block + reciprocal sync-note; step 8: same log line |

## The guard — three parts

- **Trigger:** when step 6 updates a gold doc with a counterpart whose `sources:`
  resolves to that doc's live path → re-render via `/wiki-ingest <vault> <gold-doc>`
  (UPDATE auto-detect, no duplicate). Reuses [[wiki-ingest-drift-prevention-upgrade]].
- **Scope:** fire **only** when `sources:` points under `<project>-docs/patterns/`.
  Plan-sourced counterparts (`plans/...`) are excluded — no gold-doc parent exists.
- **Content-delta guard:** re-render on counterpart-surfaced change (summary,
  `[[links]]`, mirrored sections); skip on ledger-only append, logging
  `D-5 SKIP — <gold-doc> updated (ledger-only: <reason>); counterpart unchanged`
  to `<vault>/logs/CHANGELOG.md`.

## Byte-identical guard via fence markers

The shared criteria are wrapped in `<!-- D-5-GUARD-START -->` / `<!-- D-5-GUARD-END -->`
in both files. Extracting between the markers and hashing proves equality
mechanically — `sha256` matched (`0236a3cc…`), `diff` was empty. The surrounding
prose (the sync-note's reciprocal pointer) is allowed to differ; only the criteria
block is contractually identical. This satisfies the "hash the guard block"
acceptance criterion as a static lint, the same **prose-DRY change-coupling**
discipline established in [[wiki-skills-sync-symmetry]].

## Tested by simulation, not mutation

The live acceptance items (an actual re-render, a `D-5 SKIP` log write) mutate
canon, so they were **not** fired as a test. Instead the hook's scope decision was
*simulated* against the live ISCI-Web-App-Wiki: across 28 pattern counterparts,
**13 resolved to gold-doc paths (eligible), 15 to `plans/` (skipped), 0 had a
missing parent.** The ~half-and-half split confirms the scoping rule was
necessary, not theoretical — an unscoped hook would have wrongly re-rendered 15
plan-sourced nodes. Simulating the decision logic against real data is a safe
proxy for an end-to-end test on a canon-mutating skill.

## Not tested live

Like [[wiki-skills-sync-symmetry]], the integration path (real `/rs` run →
re-render → `/wiki-graph-audit` clean) is deferred to the first natural retro that
updates a counterpart-backed gold doc. The failure mode is recoverable: a missed
re-render leaves a stale counterpart, caught by the next audit.

## Mirror asymmetry (by design)

`/rs` reads a completed plan file; `/crs` reads the active conversation. The guard
*criteria* are identical; only the trigger source differs. This single asymmetry
is documented in each file's sync-note so a future editor doesn't "unify" it.

## Related

- [[counterpart-model]] — the model this hook enforces; its D-5 section is now true
- [[wiki-ingest-drift-prevention-upgrade]] — the UPDATE path the re-render reuses
- [[wiki-skills-sync-symmetry]] — prior instance of the same mirrored-skill discipline
- [[wiki-graph-shape-contract]] — the §4.5 shape a re-rendered counterpart must hold
