---
type: anti-pattern
sources:
  - C:\code\docs\Steward-docs\plans\stratagem-wiki-graph-shape-contract_260528_164639_plan.md
  - C:\code\docs\Steward-docs\Plans\vault-reconciliation_260614_154025_plan.md
updated: 2026-06-14
tags:
  - status/active
  - scope/workflow
---

# Multi-Stage Migration Pitfalls

> **Summary.** Two failure modes hit during the §4.5 contract migration that
> any future bulk-file-move work will hit unless mitigated: Edit-cache
> invalidation after `mv`, and concurrent-agent vault drift.

## AP-WF-1: Edit cache invalidated by `mv`

**Pattern:** A migration moves a file with `mv old/file.md new/file.md`, then immediately tries to Edit the file at the new path. The Edit tool's "have I read this?" cache is keyed on path; the new path has never been read, so the Edit silently no-ops or errors.

**Symptom:** Some files end up partially edited; verifier flags violations on the partially-edited ones.

**Correct pattern:** Multi-stage migrations need a **Read-batch after the moves, before the frontmatter edits**. Read all destination paths in parallel; then Edit in parallel. The Read primes the cache for the new path.

**Real instance:** Task 7 of the §4.5 contract migration. `entity-pattern.md` got its `type:` updated (before the move) but missed its `tags:` backfill (after the move) — the tag-edit hit the stale pre-move cache and silently failed. Caught by the Task 11 audit, not by execution.

## AP-WF-2: Concurrent-agent vault drift

**Pattern:** Two agents write to the same vault directory without coordination. Agent A snapshots state at start; Agent B writes 9 new files mid-execution; Agent A's plan is now stale; routing decisions made on the stale snapshot are wrong.

**Symptom:** Mid-task halt because new files appear with unknown types and unknown frontmatter status. Potential duplicate filenames (the canonical Obsidian shortest-match resolution depends on uniqueness).

**Correct pattern:** Generator skills should record a **vault state hash at skill entry** (e.g., hash of `find vault/ -name "*.md" | sort | xargs ls -la`). At each write, check the hash hasn't changed. If it has, halt and report drift — let the user decide whether to merge or roll back.

**Real instance:** Phase 1b Task 7 of the §4.5 contract migration. Recovered via snapshot-read-route, no data loss. The migration just performed manually is the reference implementation for the `--route-all` and `--backfill` modes that should be added to `/wiki-ingest`.

## AP-WF-3: Silent table duplication across sibling files

**Pattern:** Two sibling artifacts (e.g., paired skills, paired configs, a schema doc and a skill that enforces it) carry copies of the same table or rule list. No cross-reference links them. The first time the table evolves, only one copy gets updated. Drift wins.

**Symptom:** A contract change works in one location but the sibling still encodes the old rule. Audit/verifier reports stale violations against pages the generator just produced correctly (or vice versa).

**Correct pattern:** Either (a) factor into a single source of truth that both reference (where possible), or (b) apply **Prose-DRY via change-coupling notes** — at every duplication point, insert an inline `> **Sync note:**` pointing at all other locations that must change together. Add a footer "sync table" listing every shared concept and every occurrence. See [[wiki-graph-shape-contract#Maintaining the contract]].

**Real instance:** Before FEAT-WF-002, the §4.5 type→folder routing table existed in three places (`vault/CLAUDE.md` §4.5.1, `/wiki-ingest` §3, `/wiki-graph-audit` §Category 1) with no link between them. First edit attempt would have hit drift. FEAT-WF-002 added the sync notes and the footer sync table to both skills.

## AP-WF-9: Worklist source-classification trusted without point-of-build verification

**Pattern:** A migration audit (Task 1) classifies each source by reading its *title/path* and records a worklist (op + target + scope). Downstream build tasks trust the worklist instead of re-checking scope when the source is actually opened. Titles lie: a doc titled "Endpoint-Master-Pattern" is a V1 edit-route pattern; "details-polish-routes" is a V1 inventory; "Decision-IDs-in-Plans" is workflow- not domain-scope.

**Symptom:** Build tasks produce out-of-scope nodes, or halt mid-chain to escalate, because the worklist's premise was wrong. Six such corrections surfaced across one reconciliation.

**Correct pattern:** Treat the worklist as a *hypothesis*, not a contract. At point-of-build, re-verify scope against the opened source's actual content before producing output. Encode a binding scope filter (e.g. "vault is V2-only") so mis-scoped items fail loudly. Escalate inline on any scope contradiction rather than auto-proceeding (the "V1-heavy → STOP + flag" gate; see [[trust-but-verify-mid-task-gate]] H-escalation). The audit title is a routing hint, not a source of truth.

**Real instance:** Two-Vault Reconciliation Task 1 worklist had 6 corrections (Filter-Master = V1, the [[audit-glob-self-blindness|filter-architecture phantom]], decision-ids = workflow-scope, + 4f/4h/4j V1 builds). The V2-only binding rule was the through-line for 4 of the 6; each V1 drop escalated inline.

## Related

- [[wiki-graph-shape-contract]]
- [[wiki-skills-sync-symmetry]]
- [[tracer-bullet-discipline]]
