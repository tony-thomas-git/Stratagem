---
type: meta
sources: []
updated: 2026-05-27
tags:
  - status/active
  - scope/workflow
---

# Contradictions

> **Summary.** Known disagreements between sources, where multiple raw inputs
> assert conflicting claims about the Stratagem workflow system. Currently
> empty — no contradictions detected in the seed ingest.

## Format

Each contradiction entry follows this shape:

```markdown
## YYYY-MM-DD — <short title> ## <anchor-slug>

- **Claim A:** ... (source: `source-a.md`)
- **Claim B:** ... (source: `source-b.md`)
- **Affected pages:** [[page-x]], [[page-y]]
- **Status:** open | resolved (notes if resolved)
```

## Open contradictions

*(none)*

## Resolved contradictions

## 2026-06-12 — SKILL-TEMPLATE.md: Next-last vs Key-Principles-after ## skill-template-next-vs-key-principles

- **Claim A:** `**Next:**` line must be the **last line of the file** (source: `~/.claude/skills/SKILL-TEMPLATE.md` § Conformance Checklist, line 74)
- **Claim B:** `**Key Principles:**` is an optional section placed **after the `**Next:**` line** (source: `~/.claude/skills/SKILL-TEMPLATE.md` § Optional Sections table, line 56)
- **Affected pages:** [[skill-catalog]]
- **Status:** resolved 2026-06-12 — **Claim A wins.** Key Principles goes **above** Next, matching `phx` precedent (where this was already the practice). `um` was the only skill exposing the contradiction and was re-ordered. Future template revision should remove the Claim B row.
