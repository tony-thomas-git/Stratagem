---
type: meta
sources: []
updated: 2026-06-10
tags:
  - status/active
  - scope/meta
---

# Component Page Template

> **Summary.** The standard shape for documenting an individual
> component, service, class hierarchy, or module. Use this for the
> bulk of `architecture/` pages.

---

## Template

```markdown
---
type: architecture
sources:
  - <design-doc>.md   # if applicable
code_sources:
  - "src/<path-to-main-file>@<commit>"
updated: YYYY-MM-DD
tags:
  - status/active
  - scope/<your-scope>
  - layer/<n>          # optional but useful
---

# <Component Name>

> **Summary.** One paragraph: what this component IS, what
> responsibility it owns, why it exists. A future reader who reads
> only the summary should know whether to keep reading.

## 1. Responsibility

What this component is responsible for. Bullet list of bounded
concerns. If the list is long (>5), the component is probably doing
too much — note it as a candidate for split.

- ...

## 2. Public surface (what it exposes)

What other components see when they use this one. Skim-able list of
methods/classes/events. For exact signatures, link to a separate
[[api/<component>-public-surface]] page.

- ...

## 3. Dependencies (what it consumes)

- **Hard dependencies** (mandatory): [[other-component]], …
- **Soft dependencies** (configurable / pluggable): [[other-component]], …
- **Vendor SDKs**: list with version

Each dependency should link to its own architecture page.

## 4. Consumers (who depends on it)

- [[upstream-component]] — uses for X
- ...

The backlinks make the graph navigable in both directions. Even if
you don't write this section initially, Obsidian's backlinks pane
will find them — but writing them out makes intent explicit.

## 5. Key concepts / vocabulary

If this component introduces terms used in its API, define them
here OR link to [[glossary]] entries.

## 6. State & lifecycle

- Construction: when is it created? Singleton? Per-request?
- Initialization: what does it need before it can serve calls?
- Active phase: ...
- Shutdown: cleanup contract; ordering requirements

## 7. Threading model

- Which threads can call into this component?
- What does it guarantee about callback / event threads?
- Internal synchronization (lock-free? coarse lock? actor-style?)

For components that sit at a boundary (cross-process, cross-language,
service contract, etc.), this section is critical. Consider whether
the component warrants the full triangle pattern — see
[[boundary-page-template]].

## 8. Error handling

- How does this component surface errors?
- Exceptions? Return codes? Result types?
- Logging conventions

## 9. Performance characteristics (optional)

- Typical CPU / memory footprint
- Latency / throughput targets
- Known bottlenecks

## 10. Open questions / known issues

Things that came up while documenting but weren't resolved. Each
becomes a forward-link to a future [[decision]] or [[retrospective]]
page.

- [[issue-name]] — context

## 11. Related

- [[<patterns-used>]]
- [[<anti-patterns-rejected>]]
- [[<decisions-affecting>]]
- [[<retrospectives-mentioning>]]
- [[<api-page>]]
```

---

## How to use the template

1. **Start with §1 + §3 + §4.** Even a stub with just "what does this
   do, what does it depend on, who uses it" earns its place in the
   graph.
2. **Fill in §2 + §6 + §7** when you do the deep pass on the
   component's code.
3. **Fill in §9 + §10 + §11** as the wiki grows around it — these
   sections accumulate over time, not on the first pass.

## When NOT to use this template

- For a CONTRACT page — use a clean `api/` page or, for high-risk
  surfaces, the [[boundary-page-template]] triangle.
- For a CROSS-CUTTING concern (like "all our retry policies") — use
  the pattern shape, not the component shape.
- For a SUBSYSTEM / LAYER OVERVIEW (an entire functional area, not a
  specific component) — use [[layer-map-template]] instead.

## Notes for the agent

- A new component page should usually have at least 3 backlinks (3
  pages link to it) within a session of being created. If it sits
  with 0 backlinks for a week, it's an orphan candidate — either
  the page isn't useful, or someone should be linking to it from
  upstream pages.
- If you find yourself writing a component page that has 0
  dependencies AND 0 consumers, you're describing something
  disconnected. Either the page is too generic (split it) or the
  component itself is dead code (note that).
