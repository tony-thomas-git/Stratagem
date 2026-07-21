---
type: meta
sources: []
updated: 2026-06-10
tags:
  - status/active
  - scope/meta
---

# Contradictions Log

> **Summary.** When a newly ingested source disagrees with a claim
> already in the wiki, the conflict is recorded here BEFORE either
> claim is silently overwritten. Each entry names both claims, their
> sources, the affected pages, and a resolution (or "unresolved" if
> the operator needs to weigh in).

---

## How this works

Per `CLAUDE.md §3` step 6: silent overwrites destroy audit value.
Instead, when you (the agent) notice that an ingest contradicts an
existing wiki claim:

1. STOP. Don't update either claim yet.
2. Add an entry below describing both claims.
3. Flag it to the operator in the ingest report.
4. Operator decides: keep A, keep B, both with caveats, or
   investigate further (perhaps the situation has changed and both
   were once true).
5. Update the affected page(s) per the resolution. Mark this entry
   as "resolved" with a one-line note.

---

## Active contradictions

(None yet — this is a seed.)

---

## Resolved contradictions (history)

(None yet.)

---

## Entry template

```markdown
## YYYY-MM-DD — <short description of the conflict>

- **Claim A** (existing wiki): "<quote or summary>" — [[<page>]]
  cites (source: `<file>.ext`).
- **Claim B** (new ingest): "<quote or summary>" — from
  `<new-source>.ext`.
- **Affected pages**: [[<page-1>]], [[<page-2>]]
- **Possible reasons for conflict**:
  - Upstream version change (A was for vendor v12.3, B for v12.4)?
  - Different context (the two claims actually apply to different
    scenarios that looked the same)?
  - One source is wrong / outdated?
- **Resolution**: TBD — operator to decide.
```

When resolved, append:

```markdown
- **Resolved YYYY-MM-DD**: <decision>. Affected pages updated.
```

---

## Why this matters

Silent overwrites destroy the wiki's audit value. When a new source
disagrees with an existing claim, the disagreement itself is
information — it might surface a version-drift bug, a context
mismatch one side didn't notice, or a documentation error in one of
the sources. Logging the conflict means it can be resolved
deliberately rather than blurred away.

The log is cheap. Use it.
