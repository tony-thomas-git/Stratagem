---
type: pattern
sources:
  - plugins/stratagem-ado/skills/board-sync/SKILL.md
  - plugins/stratagem-ado/skills/sp/SKILL.md
  - plugins/stratagem-ado/skills/ss/SKILL.md
  - plugins/stratagem-core/skills/if/SKILL.md
updated: 2026-07-10
tags:
  - status/active
  - scope/stratagem-core
  - boundary/core-ado
---

# Idempotency & Skip-Loud

> **Summary.** Two invariants that keep the board a mirror of the run, never a gate on it. **Idempotency:** create paths never double-create — they pre-check for an existing marker/state and no-op. **Skip-loud:** any board hiccup logs a single visible line and returns success-shaped, never failing the code, the verdict, or the loop.

## The governing principle: mirror, never gate

The board reflects the run; it can never block it. `board-sync` states it directly: "The board is a mirror of the run, never a gate on it. A dropped board update is acceptable; a failed feature build because the board hiccuped is not." (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:74`). Everything below serves that principle.

## Idempotency — never double-create / double-write

- **`/sp` is create-only and aborts on a re-run.** Before creating anything it scans task lines for an existing `Sync-Id:` and the header for `## ADO-Feature-Id:`; if any task already carries a `Sync-Id:` it STOPs with "plan already synced (Feature <id>, N stories) — re-sync is an update, not a create. Aborting to avoid duplicate cards." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:62-64`). This guard is called "load-bearing: SP is create-only; without it a re-run duplicates the whole board hierarchy." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:64`).
- **`board-sync` has a cheap idempotency pre-check.** It optionally reads the item and, "If its `System.State` already equals the target → log `board-sync: <id> already <state> (no-op)` and return success. (Avoids a redundant write and a confusing duplicate revision.)" (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:58`). It also transitions "exactly ONE item per call (the `syncId`). Never fan out." (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:78`).
- **`/ss` stamps the `Spike-Sync-Id` marker at most once.** "if the seed already contains a `Spike-Sync-Id` marker → **skip** the stamp … never write a second marker." (code: `plugins/stratagem-ado/skills/ss/SKILL.md:66`).
- **Spike retirement is one-way.** `/sp` step 5a "only ever closes the spike, never reopens it" and relies on board-sync's idempotency pre-check to make an already-closed spike "a clean no-op." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:96-97`).

## Skip-loud — one line, then continue

Skip-loud is the failure posture: surface the problem visibly (never silently swallow it) but never let it fail the caller.

- **`board-sync` skip-loud contract (load-bearing).** "On ANY failure — invalid id, auth error, a transition ADO rejects (e.g. a state-flow rule), MCP unreachable — it must: log a single `⚠ board-sync skip: <reason>` line, and return cleanly (success-shaped) WITHOUT throwing." It "must **NEVER** fail, block, or change the verdict of the caller (the autonomy loop's verifier or `/ax`)." (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:68-74`). Concrete skips: a missing/non-numeric `syncId` logs `⚠ board-sync skip: no Sync-Id` and returns cleanly (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:38`); an unrecognized `event` logs `⚠ board-sync skip: unknown event "<event>"` and returns cleanly (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:52`).
- **`board-sync`'s canonical map self-heals via skip-loud.** The `verified → Resolved` transition is a clean no-op on a board with no `Resolved` state: "the skip-loud contract below catches the rejected state-flow transition, logs one skip line, and returns success-shaped — the loop is never gated." (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:48`).
- **`/sp` spike retirement is skip-loud.** "a missing/non-numeric id, an unresolvable Story, or a link/close failure logs `⚠ SP: spike retirement skipped — <reason>` and continues — the Feature is already created; a spike hiccup must never fail the sync." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:97`). Epic-link and iteration failures are handled the same way — warn loudly and proceed unparented / at backlog root (code: `plugins/stratagem-ado/skills/sp/SKILL.md:75-78,92`).
- **`/ss` stamp is skip-loud** (the card already exists): a failed seed write logs `⚠ SS: could not stamp Spike-Sync-Id … — retire the spike manually` and continues (code: `plugins/stratagem-ado/skills/ss/SKILL.md:69`).
- **The loop degrades on telemetry loss, never fails.** `/if` treats a missing ledger the same way: "If `logs/` can't be created or written, **warn** (`⚠ ledger unavailable — launching ledger-less; observability degraded`) … The loop still runs; never fail the launch on telemetry." (code: `plugins/stratagem-core/skills/if/SKILL.md:53`). The presence-checked board seam is likewise a silent no-op when no adapter is installed (code: `plugins/stratagem-core/skills/if/SKILL.md:56`).

## Fail-loud where fabrication would be worse

Skip-loud is not "swallow everything." Where continuing would fabricate success, the skills **fail loud** instead: `/sp` aborts if no `ado.config.json` is found (`SP ABORT: no ado.config.json found`) (code: `plugins/stratagem-ado/skills/sp/SKILL.md:45`); `/ss` aborts on a missing seed file or missing PAT rather than creating a half-synced card (code: `plugins/stratagem-ado/skills/ss/SKILL.md:35,82`). The rule: never fabricate success, never fail the run on best-effort telemetry.

## Related

- [[neutral-board-seam]] — the presence-checked boundary this posture protects.
- [[sync-id-linkage]] — the markers that double as the idempotency signal.
- [[board-sync-event-map]] — the adapter whose skip-loud contract is load-bearing.
- [[owner-identity-resolver]] — a validation-only, skip-loud sibling on the ADO side.
- [[direct-state-write-bypassing-seam]] — the anti-pattern that bypasses this skip-loud safety net.
- [[ado-bridge]] — the plugin whose skills embody these two invariants.
