---
type: meta
sources: []
updated: 2026-06-10
tags:
  - status/active
  - scope/meta
---

# Boundary Page Template (the "triangle" pattern)

> **Summary.** A reusable page-shape for documenting any high-risk
> SURFACE in your system — a place where two parts of the system
> meet across a meaningful boundary, with non-trivial rules about
> what crosses, in what shape, with what guarantees. Examples:
> service-to-service APIs, cross-process IPC, native ↔ managed
> interop, file format parsers, security boundaries, hardware
> protocols. This file documents the pattern; copy + adapt it per
> boundary you need to document.

---

## When to use the triangle

Not every component pair needs the full triangle. Use it when:

- A bug at the boundary would be expensive (data loss, security
  breach, hard-to-reproduce concurrency bug, customer-visible
  failure).
- The contract is non-obvious — there are conventions a reader
  could violate without realizing.
- The boundary spans a tool / language / process / trust shift.
- The boundary is **the** load-bearing seam of your project (the
  one place an incoming engineer most needs to understand).

If a boundary is straightforward (two modules in the same language
with one well-named interface), a single `architecture/` page is
enough — don't over-document.

---

## The triangle (three coordinated pages per boundary)

When documenting a boundary that warrants this treatment, you produce
THREE pages, each covering one face of the same triangle:

| Page | Lives in | Answers |
|---|---|---|
| **Pattern** — conventions used at this boundary | `patterns/boundary-conventions-<name>.md` | "What are the GENERAL RULES this boundary follows?" |
| **Architecture** — the boundary in context | `architecture/boundary-<name>.md` | "WHERE is this boundary, what crosses it, why" |
| **API** — the exact public surface | `api/boundary-public-surface-<name>.md` | "What are the EXACT signatures + contracts of every function/type/message crossing?" |

If you find yourself with only one of these three, the documentation
is incomplete. Stub the other two with `status/draft` so the gap is
visible in the graph.

---

## Template — pattern page (`patterns/boundary-conventions-<name>.md`)

```markdown
---
type: pattern
sources:
  - <design-doc-or-vendor-doc>.pdf
code_sources:
  - "src/<path>@<commit-or-version>"
updated: YYYY-MM-DD
tags:
  - status/active
  - scope/<your-scope>
  - boundary/<boundary-name>
  - risk/<applicable-risk>
---

# <Boundary-Name> — Conventions

> **Summary.** One paragraph: which boundary, what conventions, what
> are the most common mistakes.

## 1. Data representation conventions

How is data shaped as it crosses? Per crossing class, document:
- Encoding (UTF-8 vs UTF-16, big-endian vs little-endian, etc.)
- Type sizes (`int`, `bool`, fixed-width integers)
- Null / optional handling
- Empty vs absent
- Common mistake patterns

(For wire protocols: schema versioning + back/forward compat.
For native interop: marshalling rules.
For service APIs: serialization format.
Pick what's relevant.)

## 2. Resource lifetime conventions

- Who allocates? Who frees?
- Bounded by a scope (`using`, RAII) vs explicit cleanup?
- Handles vs raw pointers?
- Reference counting?
- Common mistake patterns (leaks, use-after-free, double-free)

## 3. Threading & concurrency model

- Which threads can call across the boundary?
- Which thread does a callback / response fire on?
- Reentrancy assumptions
- Cancellation semantics
- Synchronization conventions (locks held? lock-free?)

## 4. Error handling

- How are errors surfaced?
  - Exceptions (and which can propagate across)?
  - Return codes / `Result` types?
  - Error events / callbacks?
- Recovery vs fatal distinction
- Logging conventions at the boundary

## 5. Versioning & evolution

- How does this boundary evolve over time?
- Back-compat rules (e.g. "additive only", "MAJOR breaks allowed")
- Schema migrations
- Versioned endpoint / contract names

## 6. Anti-patterns (link to deliberately rejected approaches)

- [[anti-pattern-name]]
- ...

## 7. Related

- [[boundary-<boundary>]] — the architecture page
- [[boundary-public-surface-<boundary>]] — the API page
```

---

## Template — architecture page (`architecture/boundary-<name>.md`)

```markdown
---
type: architecture
sources:
  - <design-memo>.md
code_sources:
  - "src/<dir>/@<commit>"
updated: YYYY-MM-DD
tags:
  - status/active
  - scope/<your-scope>
  - boundary/<boundary-name>
---

# <Boundary-Name> — The Boundary

> **Summary.** Where in the codebase / system this boundary lives,
> which subsystems it bridges, what the highest-level reason for it
> is.

## 1. What's on each side

- **Side A**: file paths, key types, responsibility summary. Link to
  [[<side-a-architecture-page>]].
- **Side B**: file paths, key types, responsibility summary. Link to
  [[<side-b-architecture-page>]].

## 2. Why this boundary exists here (not somewhere else)

- The architectural reasoning. What's gained by drawing the line at
  this point. Link to any [[decision]] page that captures the
  choice.

## 3. Mechanism

- HOW does the crossing work technically? (e.g. method calls,
  pub-sub, sockets, gRPC, P/Invoke, HTTP, shared memory…)
- Build / link / deploy considerations
- Network / port / endpoint considerations

## 4. What crosses

A high-level list (not the exact signatures — that goes in the API
page). Group by purpose:

- **Lifecycle**: initialization, shutdown, reset, health check
- **Inbound** (side A → side B): operations that side A invokes
- **Outbound** (side B → side A): events / callbacks / async
  responses side B emits
- **Query**: capability / status discovery
- **Error reporting**: how failures surface

Each item links to its [[boundary-public-surface-<boundary>]] entry.

## 5. Threading & lifetime overview

- Calling context expectations
- Callback / response delivery context
- Lifetime of any registered handlers (when must they be cleaned
  up?)

Detailed conventions live in [[boundary-conventions-<boundary>]].

## 6. Known fragilities (the canary list)

- Things that have broken before
- Things that require manual re-verification when boundary code
  changes
- Link to [[retrospective]] pages for each

## 7. Related

- [[boundary-conventions-<boundary>]] — patterns
- [[boundary-public-surface-<boundary>]] — exact signatures
- [[<adjacent-architecture-page>]]
```

---

## Template — API page (`api/boundary-public-surface-<name>.md`)

```markdown
---
type: api
sources: []
code_sources:
  - "src/<file>@<commit-or-version>"
upstream_version: "<vendor X.Y.Z if applicable>"
updated: YYYY-MM-DD
tags:
  - status/active
  - scope/<your-scope>
  - boundary/<boundary-name>
---

# <Boundary-Name> — Public API Surface

> **Summary.** Exact signatures of every operation, type, and event
> crossing this boundary, MATCHED to the code. Whenever the code
> changes, this page needs re-verification.

## Compatibility note

This page was verified against:
- `<path>@<commit-or-tag>`
- (any other ground-truth references)

If those have changed, re-verify before using as a reference.

## Operations

### `OperationName`

```
<exact signature(s) here — whatever form your boundary uses:
 function declarations, method signatures, gRPC service+method,
 HTTP method+path+body schema, message-bus topic+payload, etc.>
```

- **Inputs**: types, validation rules, where they come from
- **Outputs**: types, semantics, error cases
- **Side effects**: state mutated, events emitted
- **Idempotency**: yes / no / conditional
- **Threading**: callable from which context
- **Failure modes**: enumerate the ways this can fail and how the
  caller learns
- **Cites**: [[boundary-conventions-<boundary>]] §X (relevant
  convention section)

### `OtherOperation`
... (repeat shape)

## Types / Messages

### `TypeName`

```
<exact type / message definition>
```

- Field documentation, especially for non-obvious fields
- Lifetime / ownership rules
- Versioning compatibility notes

### `EnumName`
... (repeat shape)

## Events / Callbacks

### `EventName`

```
<exact event / callback signature>
```

- **Trigger**: what causes it to fire
- **Delivery context**: which thread / queue / channel
- **Lifetime**: subscription / unsubscribe semantics
- **Ordering**: are events ordered? per-key? globally?
- **Reentrancy**: can this fire while the handler is running?

## Related

- [[boundary-conventions-<boundary>]] — patterns
- [[boundary-<boundary>]] — architecture
```

---

## Naming convention

Use a short, descriptive `<boundary-name>` that uniquely identifies
the surface. Examples:

- `user-api` (service-to-frontend)
- `payment-webhook` (third-party-to-us)
- `worker-queue` (api-to-workers)
- `native-interop` (managed-to-native FFI)
- `device-protocol` (host-to-device wire protocol)
- `plugin-host` (host application ↔ plugin)

Don't smush multiple boundaries into one page. The conventions,
threading model, and lifetime rules differ per boundary, and combining
them is the failure mode.

## Notes for the agent

- Start the triangle with the API page (the exact signatures /
  contracts). You can't write the pattern or architecture pages
  credibly without knowing the surface.
- Cite ground truth aggressively in the API page. The whole point
  of this page is to be a SECOND SOURCE OF TRUTH (after the code /
  spec itself).
- Use `[[forward-links]]` to anti-patterns or retros even before
  those pages exist — they mark where lessons-learned should go
  when they happen.
- When the operator says "X changed in the upstream version", scan
  pages tagged `risk/upstream-drift` and the relevant `boundary/<x>`
  first.
