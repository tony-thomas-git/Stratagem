# Neutral Seam Contract — for adapter authors

Stratagem Core (`sg`) is **board-blind and chat-blind**: it names no external work-tracker or chat system. Where a task changes lifecycle state, core emits a **generic signal by neutral name** and lets a separately-installed adapter decide what it means. This document is the contract an adapter implements.

Core threads only a **skill name** it was handed; it never imports, calls, or names a vendor. With no adapter installed, every emit is a **silent no-op** — a run with no adapter is byte-for-byte identical to one with an adapter that does nothing.

## The two seams

| Seam | Direction | Signal | Core emits from |
|---|---|---|---|
| **Board** | core → adapter | `{ event, syncId, task }` | `/sg:ax` (interactive) + `autonomy-loop.js` (verifier boundaries) |
| **Notify** | core → adapter (strictly outbound) | `{ event, summary, task }` | `/sg:ax` (interactive) + `autonomy-loop.js` (verifier boundaries) |

The notify seam is the **outbound twin** of the board seam — same architecture (neutral handle, presence-check, skip-loud), different payload (a human-readable `summary` instead of a board `syncId`). A notifier adapter never reads or waits for a reply.

## Signal fields

**Board — `{ event, syncId, task }`**
- `event` — a generic lifecycle event: `task-started`, `verified`, `merged`.
- `syncId` — the opaque id from the task line's `Sync-Id:` marker. Core does not know this is (e.g.) a work-item id — the adapter does.
- `task` — the plan task number (correlation / logging only).

**Notify — `{ event, summary, task }`**
- `event` — the lifecycle event (e.g. `verified`).
- `summary` — a short human-readable status line (e.g. `"task 7 verified"`).
- `task` — the plan task number.

## Presence contract (both seams)

When core needs to emit, it resolves installed + enabled adapters and branches:

- **0 adapters** → silent no-op.
- **exactly 1** → invoke its neutral skill once with the signal.
- **2 or more** → do NOT guess — core asks which adapter should receive the signal.

## What an adapter provides

- A **board adapter** is a Claude Code plugin exposing a `board-sync` skill. Core resolves its name and invokes it with `{ event, syncId, task }`; the adapter maps `event` → its own system state (e.g. `task-started → Active`, `verified → Resolved`, `merged → Closed`). That map is the adapter's private business.
- A **notify adapter** exposes a `notify-sync` skill; core invokes it with `{ event, summary, task }`; the adapter pushes it to a channel. Strictly outbound.

## Load-bearing rules

1. **Best-effort / skip-loud.** An adapter that is absent, errors, or times out must NEVER change or fail a task verdict. Core logs and moves on. The board/chat is a **mirror**, never a gate.
2. **Core names nothing.** Adapters name their system; core threads a handle. The dependency arrow points only adapter → core, never back.
3. **Byte-identical no-op.** A run with no adapter is identical to a run with an adapter that no-ops.

## Where it lives in core

- **Emit (interactive):** `skills/ax/SKILL.md` — the board-adapter + notifier-adapter seam bullets.
- **Resolution + threading:** `skills/if/SKILL.md` — `boardSync` / `notifier` resolution → the Workflow `args`.
- **Loop emit:** `workflows/autonomy-loop.js` — `boardNotify()` / `notify()`, folded into the existing verifier agents (zero extra `agent()` calls).

See the vault page `neutral-board-seam` for the design rationale.
