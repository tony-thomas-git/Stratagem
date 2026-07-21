---
type: pattern
sources:
  - plugins/stratagem-ado/skills/sp/SKILL.md
  - plugins/stratagem-core/skills/ax/SKILL.md
  - plugins/stratagem-ado/skills/board-sync/SKILL.md
  - plugins/stratagem-ado/skills/ss/SKILL.md
updated: 2026-07-10
tags:
  - status/active
  - scope/ado
  - boundary/core-ado
---

# Sync-Id Linkage

> **Summary.** After creating the board hierarchy, `/sp` writes two deliberately-generic markers back into the plan file — a `## ADO-Feature-Id:` header line and a per-task ` — Sync-Id: <id>` suffix — so that core skills can read the board linkage with **zero ADO awareness**. The generic naming is the whole point: `Sync-Id`, not "ADO" or "Story".

## The write-back

`/sp` (Sync Plan) creates an ADO Feature plus one child User Story per task, then edits the plan file to record the ids (code: `plugins/stratagem-ado/skills/sp/SKILL.md:109-112`):

- Add a header line under the title block: `## ADO-Feature-Id: <Feature id>`.
- Append ` — Sync-Id: <Story id>` to the end of each corresponding task line in `### Task List`.

This is step 8, labelled "the neutral linkage seam" (D9) (code: `plugins/stratagem-ado/skills/sp/SKILL.md:109`).

## Why the names are generic

The naming is intentional, not incidental: "These markers are deliberately generic (`Sync-Id`, not "ADO" / "Story") so the core seam reads them with zero ADO awareness." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:112`). The `sp` purpose statement frames the same idea: "This is the ADO occupant of the neutral `Sync-Id` seam — core Stratagem never names ADO; this skill does." (code: `plugins/stratagem-ado/skills/sp/SKILL.md:22`).

So the plan file carries a board id in a name that reveals nothing about which board it came from. A future non-ADO adapter could reuse the identical marker.

## The read side (core, board-blind)

Core reads `Sync-Id:` without knowing what system minted it:

- **`/ax`** gates its emit on the marker's mere presence: "if a board adapter is configured for this run AND the task line carries a `Sync-Id:` marker, notify the adapter that this task is starting" (code: `plugins/stratagem-core/skills/ax/SKILL.md:27`). It reads the marker; it does not parse it as ADO.
- **`board-sync`** is where the id is finally interpreted as an ADO work-item id: `syncId` is "the value of the task's `Sync-Id:` marker written by `/stratagem-ado:sp`" (code: `plugins/stratagem-ado/skills/board-sync/SKILL.md:35`). Interpretation happens only on the adapter side — see [[neutral-board-seam]].

## The seed-level sibling: `Spike-Sync-Id`

The same generic-marker technique appears one level up, at the seed stage. `/ss` (Sync Seed) stamps a `Spike-Sync-Id:` marker into the seed file after creating its spike card (code: `plugins/stratagem-ado/skills/ss/SKILL.md:65-69`):

- HTML seed → `<!-- Spike-Sync-Id: <Story id> -->` after the `<title>` line.
- Non-HTML seed → a top-of-file `## Spike-Sync-Id: <Story id>` line.

`/cp` propagates that marker into the plan header, and `/sp` reads it (`## Spike-Sync-Id:`) to link the delivery Feature back to its originating spike (`related`) and retire the spike (code: `plugins/stratagem-ado/skills/sp/SKILL.md:94-97`, `plugins/stratagem-ado/skills/ss/SKILL.md:65`). Same pattern, same generic-name discipline — the marker names a "spike", not "ADO".

## Idempotency of the write-back

The markers double as the idempotency signal that stops `/sp` re-creating cards on a re-run: it scans task lines for an existing `Sync-Id:` (and the header for `## ADO-Feature-Id:`) and **aborts** if any is found (code: `plugins/stratagem-ado/skills/sp/SKILL.md:62-64`). `/ss` likewise skips re-stamping if a `Spike-Sync-Id` already exists (code: `plugins/stratagem-ado/skills/ss/SKILL.md:66`). See [[idempotency-and-skip-loud]].

## Related

- [[neutral-board-seam]] — the `{ event, syncId, task }` boundary these markers feed.
- [[idempotency-and-skip-loud]] — the markers as create-only guard.
- [[sp-field-contract]] — the skill that writes the `Sync-Id:` / `## ADO-Feature-Id:` markers.
- [[board-sync-event-map]] — where `syncId` is finally interpreted as an ADO work-item id.
- [[autonomy-loop-args]] — the loop that surfaces these markers to the board seam.
