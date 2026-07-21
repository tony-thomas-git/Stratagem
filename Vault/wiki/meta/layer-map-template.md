---
type: meta
sources: []
updated: 2026-06-10
tags:
  - status/active
  - scope/meta
---

# Layer / Subsystem Overview Template

> **Summary.** For documenting an entire layer, subsystem, or
> major component as a single overview page (e.g. "the API layer",
> "the auth subsystem", "the data pipeline"). Each overview sits at
> `architecture/<name>.md` and is the entry point for that area's
> finer-grained component pages.

---

## Template

```markdown
---
type: architecture
sources: [optional design memos]
updated: YYYY-MM-DD
tags:
  - status/active
  - scope/<your-scope>     # e.g. scope/auth
  - layer/<n>              # optional; for layered systems
---

# <Subsystem Name> — Overview

> **Summary.** One paragraph: what this subsystem is responsible for,
> what calls into it, what it depends on.

## 1. Neighbors

- **Above / upstream** (consumers): [[<upstream-area>]] — calls us via …
- **Below / downstream** (dependencies): [[<downstream-area>]] — we call it via …
- **Boundary type** (above): direct method call / message / HTTP / IPC / …
- **Boundary type** (below): …

If there's a [[boundary-<name>]] page at either of these boundaries,
link it.

## 2. Components in this subsystem

A flat list of every architecture page that belongs to this area.
Group by sub-concern if helpful.

### Core components

- [[<component-1>]] — one-line description
- [[<component-2>]] — one-line description

### Supporting / utility

- [[<utility-1>]] — one-line description

## 3. Public surface this subsystem exposes

Link to the consolidated [[api/<subsystem>-public-surface]] page
that lists the contracts upstream callers depend on.

## 4. Public surface this subsystem consumes

Link to the [[api/<downstream>-public-surface]] page(s) for what we
call.

## 5. Threading / concurrency model for this subsystem

If the subsystem has a single concurrency model (e.g. "all calls
async, no blocking I/O"), state it here. If it varies
component-by-component, point at the component pages.

## 6. Cross-cutting patterns this subsystem relies on

- [[pattern-1]]
- [[pattern-2]]

Cross-cutting concerns like logging, error reporting, dependency
injection, configuration loading — link the pattern pages here so
the subsystem overview captures the WHOLE shape.

## 7. Anti-patterns to avoid in this subsystem

- [[anti-pattern-1]] — why it's bad here specifically
- ...

## 8. Open questions

- ...

## 9. Build & dependency notes

- Project files / modules: `<paths>`
- Build outputs: `<paths>`
- Runtime location: `<paths>`
- External dependencies (vendor libs, services, etc.)

## 10. Related

- [[system-topology]] — the system-wide map
- [[<adjacent-subsystem>]]
- ...
```

---

## How subsystems usually look

A typical instantiation for a project with 4-6 major subsystems:

```
architecture/
├── system-topology.md
├── <subsystem-A>.md
├── <subsystem-B>.md
├── <subsystem-C>.md
├── <subsystem-D>.md
├── boundary-<x-y>.md     ← high-risk boundaries get triangle pages
└── <component-pages>.md  ← finer-grained components, either flat
                            in architecture/ or in a subfolder
```

(Whether you put components in a sub-folder or flat in
`architecture/` is your choice — both work; pick one and stay
consistent. The kit defaults to flat.)

## Notes for the agent

- The subsystem overview is the LANDING PAGE for that area. Treat
  it like the subsystem's README. Anyone reading it should know
  what's in the subsystem and where to go for details.
- If a subsystem doesn't have enough components yet to need a
  separate overview, just have a single component-shaped page until
  it does. Don't pre-make empty overview pages.
- When you complete an overview + each component page, the graph
  view should show a clean spine of overview nodes, with
  cluster-clouds of components around each.
