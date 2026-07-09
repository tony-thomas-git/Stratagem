---
type: summary
sources:
  - C:\Users\steep\.claude\skills\SKILL-TEMPLATE.md
  - C:\Users\steep\.claude\skills\sa\SKILL.md
updated: 2026-06-12
tags:
  - status/active
  - scope/workflow
---

# Skill Catalog

> **Summary.** Conformance contract for all `~/.claude/skills/*/SKILL.md`
> files, enforced by `/sa` (see [[operating-modes]]). The canonical
> template lives at `~/.claude/skills/SKILL-TEMPLATE.md`; this page
> summarizes the binding rules and their rationale.

## The seven conformance checks (`/sa`)

| Code | Rule | Violation looks like |
|---|---|---|
| **FM** | Frontmatter has `name`, `description`, `argument-hint` | Missing field |
| **TI** | Title is `# SHORTNAME (Full Name)` — no suffix | `# CX (Chunk-eXamine) - LEGACY` |
| **PU** | `**Purpose:**` is one line, directly after title block | Multi-line, missing |
| **TA** | `**Task:** $ARGUMENTS` present | Missing or modified |
| **BN** | Activation banner uses `━━━` + `⚡` + `MODE ACTIVE` | Wrong borders, missing emoji |
| **IN** | `**Instructions:**` is a numbered list, not H2/H3 (exception: `phx`) | H2 headers inside Instructions |
| **NX** | `**Next:**` is the file's last line | Trailing `**Key Principles:**` or `---` separator after Next |

## Filename rule (separate from the 7 checks)

Every skill file MUST be named `SKILL.md` (uppercase). Lowercase
`skill.md` is invisible to `/sa`'s glob and is a violation in its own
right — see [[audit-glob-self-blindness]] for the recovery procedure
(case-only NTFS rename requires two-step `mv`).

## Body-shape rules (template §Optional Sections)

- `**Key Principles:**` block, when present, goes **above** `**Next:**`,
  not after (so that NX holds). `phx` is the precedent.
- Suffix annotations like *LEGACY* or *BASE* belong in the frontmatter
  description (e.g., `description: ... (legacy)`) or a body `**Note:**`
  line, never in the H1 title.
- H2 sprawl outside `**Instructions:**` is permitted but discouraged —
  lean skills (`pf`, `mpx`, `sa`) fold content into bold-labeled
  sub-sections. `cn`, `gbx`, `azure` are the current outliers.

## The `phx` exemption

`phx` is the only skill exempt from IN (numbered-list inside
Instructions). Its branching `## Step A / B / C / D` H2 structure is too
complex for a flat numbered list. The exemption is named in
`SKILL-TEMPLATE.md` and the `/sa` checklist explicitly — extending the
exemption requires updating both.

## Conformance source contradiction (resolved)

SKILL-TEMPLATE.md has an internal disagreement between the conformance
checklist ("Next is last line") and the optional sections table ("Key
Principles can come after Next"). Resolved in favor of the checklist —
see [[contradictions#skill-template-next-vs-key-principles]]. `um` was
the only skill exposing this contradiction; it was re-ordered to match
`phx`.

## Related

- [[operating-modes]] — what each skill does
- [[audit-glob-self-blindness]] — how `/sa` itself can miss files
- [[contradictions]] — open and resolved template-level disagreements
