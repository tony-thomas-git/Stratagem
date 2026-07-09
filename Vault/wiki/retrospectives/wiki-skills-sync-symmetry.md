---
type: retrospective
sources:
  - C:\Users\steep\.claude\skills\wiki-ingest\SKILL.md
  - C:\Users\steep\.claude\skills\wiki-graph-audit\SKILL.md
updated: 2026-05-28
tags:
  - status/active
  - scope/workflow
---

# `/wiki-ingest` ↔ `/wiki-graph-audit` Sync Symmetry

> **Summary.** Made the generator and verifier skills structurally symmetric
> for the §4.5 vault-shape contract. Both now share an identical §0
> pre-flight block, mirror sync-note headers on shared tables, and carry an
> identical "Shared contract reference" footer that explicitly couples any
> contract change across three places.

**Log ID:** FEAT-WF-002

## What changed

Two files, both in `~/.claude/skills/`:

| File | Before | After |
|---|---|---|
| `wiki-ingest/SKILL.md` | 383 lines, §0 pre-flight added in FEAT-WF-001, no sync notes | 405 lines, added sync notes on §0/§3/§4 + shared-contract footer |
| `wiki-graph-audit/SKILL.md` | 176 lines, 2-step pre-flight only, no sync notes | 243 lines, §0 pre-flight (5 steps mirroring ingest), sync notes, drift-warning in output, shared-contract footer |

## Symmetry now enforced

**Shared §0 pre-flight** (identical in both skills):
- §0.1 Schema present
- §0.2 Folder structure
- §0.3 Vault state hash (one asymmetry: ingest HALTs on drift, audit warns only — verifier is read-only)
- §0.4 Duplicate basename scan
- §0.5 Stray-file scan

**Shared contract reference footer** in both skills — same table content, perspective inverted (each skill labels itself "generator" or "verifier"):

| Concept | Canonical source | Generator reference | Verifier reference |
|---|---|---|---|
| Pre-flight | both §0 (identical) | ingest §0.1–§0.5 | audit §0.1–§0.5 |
| Type → folder | `vault/CLAUDE.md` §4.5.1 | ingest §3 | audit §Cat-1 |
| Frontmatter required | `vault/CLAUDE.md` §4.5.2 | ingest §4 | audit §Cat-2 |
| Tag vocabulary | `vault/CLAUDE.md` §4.5.3 | ingest §4 | audit §Cat-2 |
| Scope tag selection | `vault/CLAUDE.md` §4.5.3 + Wiki Registry | ingest §4 | audit §Cat-2 auto-fix |
| Filename rule | `vault/CLAUDE.md` §4.5.4 | ingest §4 | audit §NOT-violations |
| Filename NON-rules (Q26/Q27) | `vault/CLAUDE.md` §4.5.4 | ingest §4 (preserved) | audit §NOT-violations |

## The change-coupling rule

Every shared concept now has an inline `> **Sync note:**` block at the top of each occurrence, pointing at:
1. The canonical source (one of the vaults' `CLAUDE.md §4.5.X`)
2. The reciprocal skill's section reference
3. An explicit instruction: "edit all three in the same change"

This is **prose DRY**, not code DRY — there's no code to factor. The cross-references function as static lint: future-me editing the type→folder table sees a pointer to the two other files that must change in the same edit.

## Why this matters

Before this edit, the routing table existed in three places (vault CLAUDE.md, ingest, audit) with no explicit link between them. The first time the contract evolves (e.g., adding a new folder, renaming a `type:` value, expanding the tag vocabulary), the change is one place away from drift. Now the change is explicitly coupled.

## Not tested live

Like FEAT-WF-001, the sync structure hasn't been exercised against a real contract change yet. The first integration test is the next §4.5 evolution. If someone edits the routing table in one place and forgets the others, that's the test failing — and the failure is recoverable because the sync notes point at the other files that need updating.

## Asymmetric-by-design points

- **§0.3 drift detection:** ingest HALTs (it writes; stale state corrupts output). Audit WARNS (read-only; stale state just means re-run). Documented in both sync notes.
- **§0.2 folder structure:** ingest creates missing folders. Audit refuses to (read-only; absent folders are themselves a finding).
- **Auto-fix scope:** ingest auto-fixes during generation (it's writing anyway). Audit prompts before auto-fix (it's primarily a reporter).

These asymmetries are intentional and called out where they occur, so a future editor doesn't "fix" them and break the contract.

## Second + third instances (2026-06-16)

The prose-DRY + change-coupling + `sha256`-equality discipline has since been reused twice:

- **D-5 guard** — mirrored across `/rs` and `/crs` step 6, 2 occurrences, hash `0236a3cc…` ([[d5-counterpart-refresh-hook]]).
- **CORPUS-READ-FIRST** — duplicated across 8 read/write skills, hash `29437286…` ([[one-corpus-read-side]]).

**New lesson — membership change couples the sync-note text.** When the CORPUS-READ-FIRST block grew from 4 skills to 8, the sync-note in every *existing* occurrence had to change too (its "duplicated verbatim in …" list). Adding members is not just N new copies — it edits all prior copies. Verify with a single `sha256` across the full set, not a spot-check.

## Related

- [[wiki-graph-shape-contract]]
- [[wiki-ingest-drift-prevention-upgrade]] — FEAT-WF-001 prerequisite
- [[d5-counterpart-refresh-hook]] · [[one-corpus-read-side]] — the second and third instances
- [[multi-stage-migration-pitfalls]]
