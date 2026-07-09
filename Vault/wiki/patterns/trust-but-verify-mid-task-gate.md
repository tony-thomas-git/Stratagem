---
type: pattern
sources:
  - c:\code\CLAUDE.md
  - c:\code\Steward\CLAUDE.md
  - c:\code\docs\ISCI-Web-App-Wiki\vault\CLAUDE.md
  - c:\code\docs\Stratagem-Wiki\vault\CLAUDE.md
  - c:\code\docs\Steward-docs\plans\trust-but-verify_260528_164554_plan.md
updated: 2026-05-28
tags:
  - status/active
  - scope/workflow
---

# Trust-But-Verify Mid-Task Gate

> **Summary.** Mid-task confirmation gates inside auto-chainable workflows
> (`/phx`, `/rs`, `/wiki-ingest`) proceed on the agent's best-default
> judgment for Low/Medium-complexity decisions and surface a "Decisions
> Made" block at completion for the user to verify and adjust.
> High-complexity decisions STOP and escalate inline before execution.
> Top-of-workflow gates (`/pf`, `/cp`, `/ax`) remain unchanged.

## The problem this solves

Pre-Trust-But-Verify, every routine decision inside auto-chained work either (a) halted the chain to ask the user, killing the autonomy `/phx` is built for, or (b) was made silently with no audit trail. Both are bad: (a) wastes the chain; (b) means surprises at completion.

## The three complexity ranks

Every Trust-But-Verify decision MUST be tagged with a complexity rank based on *the output it produces*, not the decision itself.

| Rank | Definition | Behavior |
|------|------------|----------|
| **Low (L)** | Trivial. One file, no new abstraction, no new dependency, easily reverted in a single edit. | Auto-proceed. Log to Decisions Made. |
| **Medium (M)** | Modest. Touches 2–5 outputs, no new abstraction layer, established pattern reused. | Auto-proceed. Tag `[M]` in Decisions Made so user gives extra scrutiny. |
| **High (H)** | Any of: new abstraction, cross-cutting change touching >5 outputs, new dependency, schema change, departs from an established pattern, not single-commit reversible. | **STOP. Escalate inline before executing.** Present default + drivers + simpler alternative. Wait for approval. |

**Note on the SKIP bucket.** The `SKIP Trust-But-Verify When` rule "Decision is destructive or hard to reverse" is the load-bearing bullet in practice. A decision can look L on the complexity axis (one file, no new abstraction) but still belong in SKIP because its wrong default is not single-commit reversible (e.g. a chunk-ordering confirm where a wrong order silently produces a wrong concatenation downstream). When in doubt, ask: *if the default is wrong, can a single edit undo all the damage?* If no → escalate inline regardless of complexity rank.

## The Decisions Made block (end-of-round artifact)

At the end of every round (ingest, retro, phase), the agent surfaces a single block:

```
| # | Decision | Default chosen | Why | Affected outputs |
|---|----------|----------------|-----|------------------|
| 1 | Concept granularity | [L] Split "auth lifecycle" into 2 pages | Each >150 lines if combined | [[auth-lifecycle-server]], [[auth-lifecycle-client]] |
| 2 | Existing vs new | [L] Updated [[entity-registry]] rather than new page | 80% topical overlap | [[entity-registry]] |
| 3 | Inferred claim handling | [M] Marked 3 claims *(inferred)* in [[zod-pipeline]] | Source implied but did not state | [[zod-pipeline]] §2 |
| 4? | Scope cut | [L] Skipped one tangent on legacy V1 patterns | Out of v2 scope per §1 | (none) |

Reply with `adjust N` (e.g., `adjust 2`) to revise. Silence or `ok` = accepted.
```

A `?` appended to the row number signals low agent confidence — give that row extra scrutiny.

## The Adjust Protocol

When the user says `adjust N`:
1. Identify the affected outputs from the row.
2. Reverse the specific default (re-split a merged page, re-categorize an entry).
3. Edit *only* the listed affected outputs. Do not re-read source or replan.
4. Append an entry to the round's log (`logs/CHANGELOG.md` for wikis).
5. Re-surface a one-line updated Decisions Made row.

## Anti-pattern: bulk apply from grep

When sweeping for mid-task gates with a regex like `wait for confirmation|confirm.*user|ask the user|before proceeding`, **never bulk-apply the TBV replacement to all hits**. The regex finds paraphrased gates of every complexity class — including HARD STOPs that *should* exist (orchestrator gates, destructive-action confirms, chunk-order verifications). The agent MUST inspect each hit in context, tag by complexity, and route H-hits through the inline escalation path. The regex is a discovery tool, not a decision tool.

## Where it applies

| Context | Applies? | Notes |
|---|---|---|
| `/phx` chained execution | Yes | Each `/ax` inside the chain runs Trust-But-Verify for L/M decisions |
| `/wiki-ingest` per-page routing | Yes | Folder routing, type inference, scope tag selection are L; type-vocabulary changes are H |
| `/rs` and `/crs` proposal generation | Yes | "Which doc gets which learning" is L; new-page vs update-existing is M |
| `/pf` top-of-workflow planning | **No** | Question batch (40-decision lockdown) is the canonical pattern here; that's not a mid-task gate |
| `/cp` task decomposition | **No** | Same — top-of-workflow |
| `/ax` initial authorization | **No** | The authorization itself is the gate |

## Asymmetric with the `/cp` question batch

Both patterns address "stop the chain from stalling on decisions." The question batch is **top-of-workflow** (lock 40 decisions upfront before `/phx` starts). Trust-But-Verify is **mid-task** (auto-resolve L/M decisions inside `/phx`, escalate H). They compose: a well-locked plan plus mid-task Trust-But-Verify means `/phx` runs end-to-end with the human checking the Decisions Made block at completion.

## Where it's defined

Canonical source: `c:\code\Steward\CLAUDE.md` (Meta-Architecture Framework).
Cross-referenced from:
- `c:\code\CLAUDE.md` § Critical Operation Rules — global rule citing the pattern
- Vault `CLAUDE.md` §3 step 3 in both ISCI-Web-App-Wiki and Stratagem-Wiki — per-vault application during ingest workflow

## First validation in production

The pattern was first installed and exercised in the same plan (`trust-but-verify_260528_164554_plan.md`). On Task 5 of the rollout (`/phx`-driven Hearact sweep), grep returned 4 mid-task confirmation gates across 3 skills. The agent inspected each in context, tagged each by complexity, and the **Complexity Ranking guardrail fired as designed on its first real run**:

| Hit | File | Default tag | Outcome |
|-----|------|-------------|---------|
| `ha-split` step 3 | `ha-split/SKILL.md` | `[L]` | Auto-proceeded, replaced with TBV |
| `ha-gen` step 3 | `ha-gen/SKILL.md` | `[L]` | Auto-proceeded, replaced with TBV |
| `ha-init` HARD STOP | `ha-init/SKILL.md` | `[H-ESCALATED]` | Stopped inline → user approved KEEP |
| `ha-pipe` HARD STOP | `ha-pipe/SKILL.md` | `[H-ESCALATED]` | Stopped inline → user approved KEEP |
| `ha-split` 3 GB override | `ha-split/SKILL.md` | `[L]` | Auto-proceeded; size threshold + split-mode swap logged as Decisions Made row, no prompt |

Both H-classifications correctly identified gates whose wrong-default would silently produce wrong output (chunk-reorder cascades into wrong concatenation; orchestrator gate cascades across the whole pipeline) — i.e. *not single-commit reversible*. The pattern self-validated on its first chance to fail.

## Related

- [[wiki-graph-shape-contract]]
- [[operating-modes]]
- [[tracer-bullet-discipline]]
