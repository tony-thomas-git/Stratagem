---
type: meta
sources: []
updated: 2026-06-10
tags:
  - status/active
  - scope/meta
---

# Ingest Backlog

> **Summary.** Tracking list of `raw/` documents that have been
> dropped in but NOT YET ingested into the wiki. The agent works
> through this list when the operator says "consume mode" or
> "process the backlog." Each entry has a checkbox; tick when the
> ingest is complete.

---

## How this works

1. Operator drops a new file into `raw/<subfolder>/`.
2. Operator (or agent) adds an entry here under the appropriate
   section.
3. At ingest time, the agent works the entry per the
   `CLAUDE.md §3` workflow, then ticks the box and removes the
   entry (or leaves it ticked for history — operator preference).

When you have a large stack of unprocessed sources, this file is
the queue. Tackle them in priority order, not arrival order.

---

## Pending — high priority

(Documents that block other work — e.g. they're the foundational
design doc that everything else references.)

- [ ] *(no entries yet)*

## Pending — medium priority

- [ ] *(no entries yet)*

## Pending — low priority

- [ ] *(no entries yet)*

## Recently ingested (last 30 days, optional history)

Leave checked items here for ~30 days as a quick history, then
move to `logs/CHANGELOG.md` or delete. Operator preference.

- [x] (no entries yet)

---

## Conventions for entries

- **Filename relative to `raw/`** so it's grep-able.
- **One line of context** so the priority is judge-able without
  opening the file.
- **Priority is operator's call** (urgent vs nice-to-have).

## Notes for the agent

- When you process an entry, follow the §3 ingest workflow IN FULL
  (plan-and-confirm on first ingest of a topic; you can skip the
  confirm step on routine same-topic follow-ups once trust is
  established).
- After processing, log to `logs/CHANGELOG.md` AND
  `logs/ingest-log.md` per §6.
- If a document is too low-value to ingest, DON'T pretend to ingest
  it. Mark the entry with a strikethrough + note "not ingested —
  reason: <reason>". This is honest and preserves the queue's
  audit value.
