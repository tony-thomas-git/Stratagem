# T11 — Notify/Chat Seam Audit + Build

**Date:** 2026-07-19 · **Task:** T11 (converted audit → build per operator: "A and mimic the pattern arch of board seam")

## Finding (the audit)
This branch's generic core had a **mature board seam** but **no notify/chat seam**:

| Touch point | Board seam (present) | Notify seam (was absent) |
|---|---|---|
| Core skill emit | `ax/SKILL.md` — board-adapter seam | — |
| Launcher resolution | `if/SKILL.md` — `boardSync` resolution + arg | — |
| Loop | `autonomy-loop.js` — `boardSync` + `boardNotify()` | — |

A grep for `notifier|notify-sync|heartbeat` over `plugins/stratagem-core` returned **zero**. The seam exists elsewhere in the ecosystem (the installed `sg` 0.3.7 carries it; a `stratagem-teams` notify-sync adapter exists upstream), so the goal "interface with … chats" was portable, not hypothetical.

## Decision — **A (build it)**
Formalize a neutral, presence-checked notify/chat seam in the generic core, **architecturally mirroring the board seam** (not the elaborate launcher-heartbeat variant — the board-seam pattern is the target: neutral handle, presence-check, thread-through, skip-loud).

## What was built (exact twin of the board seam)
| Touch point | Board seam | New notify twin |
|---|---|---|
| `ax/SKILL.md` | Board-adapter seam bullet | **Notifier-adapter seam** bullet (strictly outbound; no-op if absent) |
| `if/SKILL.md` | `boardSync` resolution → args | **`notifier` resolution** → threaded into `args: { …, boardSync, notifier }` |
| `autonomy-loop.js` | `const boardSync`, `boardNotify()`, wired @ verify + reverify | **`const notifier`, `notify()`**, wired at the same two boundaries |

- **Signal shape:** board = `{ event, syncId, task }`; notify = `{ event, summary, task }` (human-readable summary instead of a board id — notify is an outbound status push).
- **Neutrality:** core names no chat vendor/channel; it threads only a skill name the launcher was handed. A notifier-less run is byte-for-byte the same loop.
- **Skip-loud:** best-effort telemetry; a notifier hiccup never changes or fails a task verdict.

## Verdict
**Built and verified.** `node --check` passes; the seam is symmetric with the board seam across all three touch points; scope limited to the 3 files. An external chat adapter (e.g. `stratagem-teams`) now attaches by presence-check with zero core changes.

**Recommend (fast-follow, not in T11):** document the notify signal in `SEAM-CONTRACT.md` (T13); the launcher-driven **heartbeat** (recurring status beat) is a deliberate non-goal here — it goes beyond the board-seam pattern and can be a separate decision.
