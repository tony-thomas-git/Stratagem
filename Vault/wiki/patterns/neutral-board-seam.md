---
type: pattern
sources:
  - plugins/stratagem-core/skills/ax/SKILL.md
  - plugins/stratagem-core/skills/if/SKILL.md
  - plugins/stratagem-ado/skills/board-sync/SKILL.md
updated: 2026-07-10
tags:
  - status/active
  - scope/ado
  - boundary/core-ado
  - layer/core
---

# Neutral Board Seam

> **Summary.** The board-blind boundary between Stratagem core and any external work-tracking system. Core emits a generic `{ event, syncId, task }` lifecycle signal by neutral name; a presence-checked board adapter (if installed) reacts and maps that signal onto a real system's state. Core names no external system, so the ADO bridge is entirely detachable.

## The boundary

Stratagem core (`stratagem-core`) never mentions Azure DevOps, work items, or Kanban states. Where a task changes lifecycle state, core signals a **generic** event and lets a separately-installed adapter decide what — if anything — it means for an external board.

The only component that maps generic loop events onto ADO state is the `board-sync` adapter: "This is the ONLY component that maps generic loop events onto ADO state — the core stays board-blind and hands this adapter a `{ event, syncId, task }` signal by neutral name." (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:17`).

## The signal shape

A single neutral object crosses the seam (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:31-37`):

| Field | Meaning |
|---|---|
| `event` | a generic lifecycle event — one of `task-started`, `verified`, `merged`. |
| `syncId` | the opaque board id read from the task's `Sync-Id:` marker (see [[sync-id-linkage]]). |
| `task` | the plan task number — **for logging only**. |

None of these names an external system. `syncId` is just "the value of the task's `Sync-Id:` marker" (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:35`); it is the adapter, not core, that knows this happens to be an ADO work-item id.

## Presence-check on both ends

The seam is **presence-checked** — it degrades to a silent no-op when no adapter is installed.

- **Emit side (core, `/ax`):** "**Board-adapter seam (neutral, presence-checked):** if a board adapter is configured for this run AND the task line carries a `Sync-Id:` marker, notify the adapter that this task is starting (mark in-progress) before implementation. Presence-checked — with no adapter configured this is a silent no-op. Core names no external system; it signals a generic lifecycle event only." (code: `plugins/stratagem-core/skills/ax/SKILL.md:27`).
- **Launcher side (`/if`):** board-adapter resolution threads a handle the launcher was given rather than hard-wiring a name — "if a board adapter is configured for this run — e.g. a board plugin is installed and enabled exposing a board-sync skill — set `boardSync` to that adapter's skill name; otherwise `boardSync = null`. The launcher names no external system; it threads a handle it was given (the same delegation as `ledgerPath`)." (code: `plugins/stratagem-core/skills/if/SKILL.md:56`). The resolved `boardSync` is passed into the Workflow `args` alongside `planPath`, `taskNumbers`, `budget`, etc. (code: `plugins/stratagem-core/skills/if/SKILL.md:56`).

## Event → state resolves only inside the adapter

Core emits `task-started` / `verified` / `merged`; translating those to a concrete `System.State` is the adapter's private business (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:42-47`):

| `event` (neutral) | `System.State` (ADO — adapter-private) |
|---|---|
| `task-started` | `Active` |
| `verified` | `Resolved` |
| `merged` | `Closed` |

Because this map lives entirely inside `board-sync`, swapping ADO for another tracker means swapping the adapter, not touching core. See [[board-sync-adapter]] for the adapter's own contract.

## Why the seam matters

- **Detachability.** `stratagem-ado` is a separate plugin; with it uninstalled, every emit point becomes a no-op and core runs unchanged.
- **The board is a mirror, never a gate.** The adapter is best-effort telemetry — see [[idempotency-and-skip-loud]]. A board hiccup never changes core's verdict.
- **One-way naming.** Core → generic event; adapter → system-specific transition. The dependency arrow points only from adapter to core, never back.

## Related

- [[sync-id-linkage]] — how the `Sync-Id:` marker that populates `syncId` gets written and read.
- [[idempotency-and-skip-loud]] — the best-effort / skip-loud posture that keeps the mirror from becoming a gate.
- [[board-sync-event-map]] — the ADO occupant of this seam (the `event → System.State` map).
- [[autonomy-loop-args]] — the launcher arg (`boardSync`) that threads this seam into the loop.
- [[owner-identity-resolver]] — a sibling shared-convention boundary on the ADO side.
- [[autonomy-loop]] — the `/if` loop that emits lifecycle events across this seam.
- [[board-blind-core]] — the decision this seam exists to serve.
- [[direct-state-write-bypassing-seam]] — the anti-pattern of writing state around this seam.
