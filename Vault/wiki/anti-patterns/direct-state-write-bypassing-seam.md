---
type: anti-pattern
sources: [SKILL.md (stratagem-ado/sp), SKILL.md (stratagem-ado/board-sync), stratagem-core-buildlog.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/ado
  - boundary/core-ado
  - risk/board-assumptions
---

# Anti-Pattern: Direct `System.State` Write Bypassing the Board-Sync Seam

> **Summary.** Writing an Azure DevOps work item's `System.State` directly — instead of emitting a neutral `{ event, syncId, task }` signal through the [[board-sync-event-map]] adapter — breaks the single-source-of-transitions invariant. State transitions belong to exactly one component (board-sync); any other skill that pokes `System.State` itself forks that authority and desynchronizes the board from the run.

---

## The invariant being protected

There is exactly **one** component that maps generic loop lifecycle events onto ADO state: the board-sync adapter. "This is the ONLY component that maps generic loop events onto ADO state — the core stays board-blind and hands this adapter a `{ event, syncId, task }` signal by neutral name." (source: `SKILL.md` board-sync, L17). Board-sync transitions exactly the one item named by `syncId` and never fans out (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:77`).

The event→state map is board-sync's private property (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:44`):

| `event` | `System.State` |
|---|---|
| `task-started` | `Active` |
| `verified` | `Resolved` |
| `merged` | `Closed` |

Because this map lives in one place, the board's `New→Active→Resolved→Closed` flow has a single source of truth. Any direct `System.State` write elsewhere is a second, uncoordinated source — the anti-pattern.

## Where the temptation appears — and how `sp` resists it

The clearest live example is spike retirement in [[sp-field-contract]] (Sync Plan). When a plan carries a `## Spike-Sync-Id:`, `sp` must *close* the originating spike Story after it creates the delivery Feature. The naive move is to just write `System.State = Closed` on the spike from inside `sp`. The skill explicitly forbids this:

> "**Close** the spike through the single-source transition seam — do **not** write `System.State` here. Invoke `/stratagem-ado:board-sync` with `{ event: "merged", syncId: <Spike-Sync-Id>, task: 0 }`" (code: `plugins/stratagem-ado/skills/sp/SKILL.md:96`).

So `sp` *requests* the transition through the neutral seam rather than performing it. The field contract restates the rule: the spike is closed "via the `board-sync {merged}` seam (never a direct State write)" (code: `plugins/stratagem-ado/skills/sp/SKILL.md:135`), and the Guards section repeats it: "never write the spike's `System.State` directly — close it only through the `board-sync {merged}` seam (single-source transition)." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:144`).

`sp` calls out the *one exception* to its own create-only scope precisely to route it back through the seam: "The one exception is the **originating spike** (step 5a): its close is still a transition owned by board-sync — SP only *requests* it through the neutral `{event,syncId,task}` seam, never sets `System.State` itself." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:139`).

## Corollary: create-time is not a transition either

The same discipline governs creation. `sp` must **not** set `System.State` or `System.Reason` when creating work items — new items default to `New`, and "State/Reason are the *transition* pair owned by the loop (board-sync skill), not creation fields." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:90`). Setting `New` explicitly at create would be a (redundant) direct-state write; the contract keeps creation and transition strictly separated so the seam owns every state move.

## Related corollary: never set `System.Reason`

`Reason` is the lifecycle *pair* of `State`; ADO derives it automatically from each transition. Board-sync must not set it (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:79`), and a live run confirmed the behavior: a `task-started` signal moved Story #5626 New→Active and "**`Reason` auto-derived by ADO** ('Implementation started') — skill correctly did NOT set it" (source: `stratagem-core-buildlog.md`, Step 5.2 board-sync result). Writing `Reason` by hand is the same class of bug — bypassing ADO's own derivation with an out-of-band write.

## Why it matters (failure mode)

If a second component writes `System.State`:
- **The board forks from the run.** Two writers race; a stale write can move an item backward (e.g. reopen a closed spike). `sp`'s retirement is deliberately one-way — it "only ever closes the spike, never reopens it." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:97`). A direct write outside the seam loses that guarantee.
- **The skip-loud safety net is bypassed.** Board-sync is best-effort telemetry: on any rejected transition it logs one `⚠ board-sync skip` line and returns success-shaped so the autonomy loop is never gated (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:68`). A raw `wit_update_work_item` on `System.State` from another skill has no such contract and can throw into the caller — turning "the board hiccuped" into "the feature build failed," exactly the outcome board-sync exists to prevent (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:74`).
- **Idempotency is lost.** Board-sync pre-checks current state and no-ops if already at target (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:58`); an already-closed spike becomes a clean no-op (code: `plugins/stratagem-ado/skills/sp/SKILL.md:96`). Direct writes duplicate revisions and confuse history.

## Evidence it holds in practice

The first `/if` autonomy run (Step 9) hardened `sp` on `drTim/hardening`; human review specifically spot-checked that spike close went "via the `board-sync` seam not direct State write" and found the diff "invariant-respecting." (source: `stratagem-core-buildlog.md`, Step 9).

## Correct pattern (do this instead)

1. Never call `wit_update_work_item` on `/fields/System.State` from any skill other than [[board-sync-event-map]].
2. To move an item, emit the neutral signal `{ event, syncId, task }` and invoke `/stratagem-ado:board-sync` — let it resolve the target state from its own map.
3. Never touch `System.Reason` anywhere — ADO derives it.
4. At create time ([[sp-field-contract]]), leave `System.State`/`System.Reason` unset so items default to `New`.

## Related

- [[board-sync-event-map]] — the single owner of state transitions
- [[sp-field-contract]] — requests spike close through the seam, never a direct write
- [[neutral-board-seam]] — the `{ event, syncId, task }` boundary
- [[idempotency-and-skip-loud]] — the skip-loud safety net a direct write bypasses
- [[board-blind-core]] — the decision this invariant protects
- [[ado-bridge]] — the plugin where the single-source-of-transitions rule lives
- [[hardcoded-home-paths]] — sibling ADO/core anti-pattern
