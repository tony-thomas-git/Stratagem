---
type: api
sources: [board-sync/SKILL.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/ado
  - boundary/core-ado
  - risk/board-assumptions
---

# board-sync Event → State Map

> **Summary.** The contract of the `board-sync` adapter: it consumes a neutral `{ event, syncId, task }` signal from the board-blind Stratagem core and moves ONE Azure DevOps work item through its `System.State` via a single `wit_update_work_item` call. Three events map to three canonical states; `Reason` is never set (ADO derives it); the whole call is best-effort / skip-loud and never gates the caller.

---

## Input contract

A single signal object with three named fields (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:33`):

| Field | Meaning |
|---|---|
| `event` | one of `task-started`, `verified`, `merged` (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:34`) |
| `syncId` | the ADO work-item id — the value of the task's `Sync-Id:` marker written by [[sp-field-contract]] (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:35`) |
| `task` | the plan task number, **for logging only** (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:36`) |

If `syncId` is missing or non-numeric, the adapter logs `⚠ board-sync skip: no Sync-Id` and returns cleanly — the task was never synced, so there is nothing to move (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:38`).

The signal is passed by neutral name so the core stays board-blind — this adapter is the ONLY component that maps generic loop events onto ADO state (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:17`). It is the ADO occupant of the [[neutral-board-seam]] that [[autonomy-loop-args]] threads as `boardSync`.

---

## Event → State map (D5)

| `event` | `System.State` |
|---|---|
| `task-started` | `Active` |
| `verified` | `Resolved` |
| `merged` | `Closed` |

(code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:44-46`). This matches the canonical `New→Active→Resolved→Closed` flow named in the skill frontmatter (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:6`). Note `New` is not an event target here — items are created in `New` by [[sp-field-contract]]; this adapter only drives the *transitions*.

An unrecognized `event` logs `⚠ board-sync skip: unknown event "<event>"` and returns cleanly (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:52`).

### `Reason` is auto-derived — never set

`Reason` is the lifecycle PAIR of `State`; the adapter must **not** set it — ADO derives the correct Reason for each transition automatically (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:50`). Never setting `System.Reason` is also an explicit guard (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:79`).

### Skip-loud on boards without a `Resolved` state (decision #7)

`verified` maps to the canonical `Resolved` state, but the currently-reachable ISCI board (`ISCI - Consolidated - Kanban`) User Story process exposes **New / Ready / Active / Closed with NO `Resolved`** (verified via `wit_get_work_item_type`) (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:48`). On such a board the `verified → Resolved` transition is a **clean no-op**: the [skip-loud contract](#skip-loud-contract) catches the rejected state-flow transition, logs one skip line, and returns success-shaped — the loop is never gated. The map stays canonical and self-heals the day the board's process template gains a `Resolved` state, with no skill edit required (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:48`). See [[install-and-skill-test-pass]] for the `verified → Closed` temp-remap record and [[idempotency-and-skip-loud]] for the self-heal mechanism.

---

## Apply sequence

1. **Validate** the signal and resolve the target `System.State` from the map (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:56`).
2. **Idempotency pre-check (optional, cheap):** read the item with `wit_get_work_item` (id = `syncId`); if its `System.State` already equals the target, log `board-sync: <id> already <state> (no-op)` and return success — avoids a redundant write and a duplicate revision (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:58`).
3. **Apply** the transition with `wit_update_work_item`: `id = syncId`, `updates = [{ "op": "add", "path": "/fields/System.State", "value": "<target state>" }]` (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:60-63`).
4. **Report** `✅ board-sync: <id> → <state> (task <task>, event <event>)` (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:64`).

Allowed tools are exactly `wit_update_work_item` and `wit_get_work_item` (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:10-12`).

---

## Skip-loud contract (load-bearing — Phase-5 posture)

This adapter is **best-effort board telemetry**. On ANY failure — invalid id, auth error, a transition ADO rejects (e.g. a state-flow rule), MCP unreachable — it must log a single `⚠ board-sync skip: <reason>` line and return cleanly (success-shaped) WITHOUT throwing (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:68-72`). It must **NEVER** fail, block, or change the verdict of the caller — the verifier or `/ax`. The board is a mirror of the run, never a gate on it: a dropped board update is acceptable, a failed feature build because the board hiccuped is not (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:74`).

---

## Guards

- Transition exactly ONE item per call (the `syncId`); never fan out (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:78`).
- Never set `System.Reason` — ADO derives it (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:79`).
- Never create work items here — that is [[sp-field-contract]]; this adapter only updates state (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:80`).
- **Feature roll-up is NOT this skill's job:** a Feature moving to `Closed` when all child Stories close is handled at PR-merge by `/stratagem-ado:pr` (Task 5), not here — this adapter transitions exactly the one item named by `syncId` (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:66`).

---

## Related

- [[sp-field-contract]] — writes the `Sync-Id:` markers this adapter reads; requests the spike close via the `merged` event
- [[autonomy-loop-args]] — the loop that emits `task-started` / `verified` and threads this adapter as `boardSync`
- [[neutral-board-seam]] — the neutral `{ event, syncId, task }` boundary this adapter occupies
- [[idempotency-and-skip-loud]] — the skip-loud contract that makes the `Resolved`-less board a clean no-op
- [[direct-state-write-bypassing-seam]] — why only this adapter may write `System.State`
- [[board-blind-core]] — the decision the neutral seam serves
- [[ado-bridge]] — the plugin this adapter ships in
