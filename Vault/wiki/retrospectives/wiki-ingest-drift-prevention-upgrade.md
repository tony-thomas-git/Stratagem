---
type: retrospective
sources:
  - C:\Users\steep\.claude\skills\wiki-ingest\SKILL.md
  - C:\code\docs\Steward-docs\plans\stratagem-wiki-graph-shape-contract_260528_164639_retrospective.md
updated: 2026-05-28
tags:
  - status/active
  - scope/workflow
---

# `/wiki-ingest` Drift-Prevention Upgrade

> **Summary.** `/wiki-ingest` SKILL.md upgraded with 5 enhancements to prevent
> the concurrent-agent and multi-stage-migration failure modes that halted
> Phase 1b of the §4.5 contract migration. Reference implementation for
> `--route-all` and `--backfill` is the 22-file manual migration from that
> plan.

**Log ID:** FEAT-WF-001 (first entry in the workflow-scoped feature log)

## What changed

Single file: `C:\Users\steep\.claude\skills\wiki-ingest\SKILL.md` — 188 → 383 lines.

## The 5 enhancements

| # | Enhancement | Section |
|---|---|---|
| 1 | Vault state-hash drift detection | §0.3 |
| 2 | Duplicate basename pre-check | §0.4 |
| 3 | Stray-file scan pre-check | §0.5 |
| 4 | `--backfill` mode (sweep + fix missing required frontmatter) | §11 |
| 5 | `--route-all` mode (bulk-migrate loose files into folders) | §12 |

## Architecture

- New `### Mode resolution` table at top of skill — `--backfill` and `--route-all` short-circuit the normal ingest flow (§1–§10); both flags together is an error.
- Pre-flight expanded from 2 checks to 5 (§0.1–§0.5) — runs before every mode.
- §12 Stage A–E sequencing explicitly encodes the **read-batch-after-mv** safeguard from [[multi-stage-migration-pitfalls#AP-WF-1]]. Stage D's state-hash re-check guards [[multi-stage-migration-pitfalls#AP-WF-2]].

## Why this matters

The §4.5 contract migration ran into both failure modes:
- AP-WF-1 (cache-after-mv) silently broke `entity-pattern.md`'s tag backfill — caught only by the audit, not by execution.
- AP-WF-2 (concurrent drift) halted Phase 1b mid-Task-7 when 9 unexpected files appeared.

Both are now encoded as preventable in the skill's structure, not just documented as anti-patterns.

## Not tested live

The new modes haven't been exercised against a real vault yet. The next migration (likely another Stratagem wiki, or a SAAS-Wiki scaffold) is the first integration test. If the modes don't behave as specified, the gap is in the skill prompt — fix the skill, not the migration (per the [[wiki-graph-shape-contract#The skill-as-generator invariant]]).

## Related

- [[wiki-graph-shape-contract]]
- [[multi-stage-migration-pitfalls]]
