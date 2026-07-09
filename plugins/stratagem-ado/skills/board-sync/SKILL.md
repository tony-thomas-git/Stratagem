---
name: board-sync
description: >
  Board-sync adapter — the bridge the neutral core seam resolves to. Consumes a
  generic { event, syncId, task } lifecycle signal and moves the matching Azure
  DevOps work item through its state (New→Active→Resolved→Closed) via a single
  wit_update_work_item call. Best-effort / skip-loud: never fails the caller.
  Use when the autonomy loop or /ax notifies that a synced task changed state.
argument-hint: "{ event, syncId, task }"
allowed-tools: >
  mcp__plugin_stratagem-ado_azure-devops__wit_update_work_item,
  mcp__plugin_stratagem-ado_azure-devops__wit_get_work_item
---

# board-sync (Board Sync Adapter)

**Purpose:** Translate a neutral lifecycle event from the Stratagem core into an Azure DevOps state transition on one work item. This is the ONLY component that maps generic loop events onto ADO state — the core stays board-blind and hands this adapter a `{ event, syncId, task }` signal by neutral name.

**Task:** $ARGUMENTS — a `{ event, syncId, task }` signal.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ board-sync — stratagem-ado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Event:   [event]
 Sync-Id: [work-item id]
 Task:    [task #]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Input contract

A single signal object:
- `event` — one of `task-started`, `verified`, `merged`.
- `syncId` — the ADO work-item id (the value of the task's `Sync-Id:` marker written by `/stratagem-ado:sp`).
- `task` — the plan task number (for logging only).

If `syncId` is missing or non-numeric → log `⚠ board-sync skip: no Sync-Id` and return cleanly (the task was never synced; nothing to move).

## Event → State map (D5)

<!-- TODO TEMP (2026-07-03): `verified` remapped Resolved→Closed until the board situation is resolved. Revert `verified` to `Resolved` then. `merged` row is unchanged and stays `Closed`. -->
| `event` | `System.State` |
|---|---|
| `task-started` | `Active` |
| `verified` | `Closed` |
| `merged` | `Closed` |

`Reason` is the lifecycle PAIR of `State` — **do not set it**; ADO derives the correct Reason for each transition automatically.

An unrecognized `event` → log `⚠ board-sync skip: unknown event "<event>"` and return cleanly.

## Instructions

1. **Validate** the signal (see Input contract). Resolve the target `System.State` from the event map.

2. **Idempotency pre-check (optional, cheap):** read the item with `mcp__plugin_stratagem-ado_azure-devops__wit_get_work_item` (id = `syncId`). If its `System.State` already equals the target → log `board-sync: <id> already <state> (no-op)` and return success. (Avoids a redundant write and a confusing duplicate revision.)

3. **Apply the transition** with `mcp__plugin_stratagem-ado_azure-devops__wit_update_work_item`:
   - `id` = `syncId`
   - `updates` = `[{ "op": "add", "path": "/fields/System.State", "value": "<target state>" }]`

4. **Report** `✅ board-sync: <id> → <state> (task <task>, event <event>)`.

5. **Roll-up note (NOT this skill's job):** a Feature moving to `Closed` when all its child Stories close is handled at PR-merge by `/stratagem-ado:pr` (Task 8), not here. This adapter transitions exactly the one item named by `syncId`.

## Skip-loud contract (load-bearing — Phase-5 posture)

This adapter is **best-effort board telemetry**. On ANY failure — invalid id, auth error, a transition ADO rejects (e.g. a state-flow rule), MCP unreachable — it must:
- log a single `⚠ board-sync skip: <reason>` line, and
- return cleanly (success-shaped) WITHOUT throwing.

It must **NEVER** fail, block, or change the verdict of the caller (the autonomy loop's verifier or `/ax`). The board is a mirror of the run, never a gate on it. A dropped board update is acceptable; a failed feature build because the board hiccuped is not.

## Guards

- Transition exactly ONE item per call (the `syncId`). Never fan out.
- Never set `System.Reason` (ADO derives it from the State transition).
- Never create work items here — that's `/stratagem-ado:sp`. This adapter only updates state.
