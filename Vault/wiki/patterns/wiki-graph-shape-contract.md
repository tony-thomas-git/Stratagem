---
type: pattern
sources:
  - C:\code\docs\Steward-docs\plans\stratagem-wiki-graph-shape-contract_260528_164639_plan.md
  - c:\code\docs\Stratagem-Wiki\vault\CLAUDE.md
updated: 2026-06-14
tags:
  - status/active
  - scope/workflow
---

# Wiki Graph-Shape Contract

> **Summary.** When multiple agents/skills produce artifacts into a shared
> vault, declare a contract with **four enforcement points** working in
> concert: a human-readable schema, a generator skill, a verifier skill,
> and a renderer config. Skip any one and drift wins.

## The four enforcement points

| # | Point | Form | Owner |
|---|---|---|---|
| 1 | Schema | `vault/CLAUDE.md` §4.5 | Humans read it; skills cite it |
| 2 | Generator | `/wiki-ingest` | Produces conformant pages by construction |
| 3 | Verifier | `/wiki-graph-audit` | Reports + per-category auto-fix |
| 4 | Renderer | `vault/.obsidian/graph.json` | Visualizes the contract via color groups |

All four must agree. If they diverge, the schema is the canon and the others get corrected.

## The skill-as-generator invariant

What the generator skill produces must equal what a hand-execution following the schema produces. **If they diverge, the skill is wrong — fix the skill, not the placement.** Migration of existing content is just the first execution of the contract.

## Folder = color group = type (one query, three dimensions)

Collapsing three semantic dimensions onto one `path:` query in `graph.json` is what makes cluster discovery work. Adding more tag-based color groups degrades signal — limit tag-based overrides to genuinely cross-cutting states (e.g., `status/superseded` → grey).

## Closed tag vocabularies beat freeform

| Axis | Values | Required? |
|---|---|---|
| `status/*` | `active`, `draft`, `superseded` | Yes, exactly one |
| `scope/*` | project-specific set | Yes, ≥1 |
| `pattern-family/*` | domain-specific set | Optional, multi |
| `layer/*` | `api`, `ui`, `db`, `orchestrator` | Optional, multi |

Closed sets are searchable, filterable, and machine-validatable. The verifier's frontmatter category depends on them being closed.

## Renderer defaults that earn their place

- `hideUnresolved: false` — forward-link gaps render as faded nodes, doubling as a content roadmap
- `showOrphans: true` — orphans signal linking gaps the user should fix
- `nodeSizeMultiplier: 1.2`, `linkDistance: 220`, `repelStrength: 12` — readable clusters at zoom-out without label collision

## Stub mode for forward-link targets

The generator should support a `--stub` mode that writes frontmatter only (`status/draft`, empty summary). Resolves the "I want this forward-link to render but don't have content yet" problem. The verifier recognizes `status/draft` and skips orphan flagging for stubs.

## Obsidian UX gotchas (defensive workflow)

- **X next to a color group deletes the group**, not hides it. No confirm, no undo.
- **⟳ "Restore default settings"** wipes all groups + force tuning. No confirm, no undo.
- Defensive habit: `cp graph.json graph.json.bak` before experimenting in the Filters UI.

## Maintaining the contract

The contract evolves. When it does, the danger is *silent drift* — one enforcement point updated, the others left stale. Three disciplines keep the four points in sync:

### Prose-DRY via change-coupling notes

Skills are prose; the schema is markdown; there's no code to factor. The next-best discipline is explicit cross-pointers at every duplication point. Every shared concept gets:

1. **Local sync note** at the top of each occurrence — `> **Sync note:** This <X> encodes <canonical source>. The <other skill> enforces the same in §<Y>. Change-coupling: edit all <N> places in the same change.`
2. **Footer sync table** in both skills — every shared concept listed with canonical source + generator reference + verifier reference. Three places, one truth.

### Asymmetric-by-design call-outs

When paired artifacts have an intentional asymmetry (e.g., `/wiki-ingest` §0.3 HALTs on drift; `/wiki-graph-audit` §0.3 only WARNs because it's read-only), document the asymmetry **at each occurrence**, not just at the pair-level. Otherwise a future editor "fixes" the asymmetry and breaks the contract. Pattern: inline note `One asymmetry: <skill A> does X; <skill B> does Y because <reason>`.

### Bottom-anchored reference, top-anchored cues

The footer sync table is the reference; the inline sync notes are the cues. A reader navigating to a section sees the local cue first; if they need the full coupling map, they scroll to the footer. Both locations exist for different reading patterns.

### Worked example — the 2026-06-14 contract amendment (the "3-place + fleet" change)

A two-part amendment exercised all the disciplines above at once, plus the [[configuration-hierarchy|Fleet-Aware gate]]:

1. **§4.5.4 made casing/emoji-permissive.** The original rule said "preserve casing and emoji from source"; canon-counterpart nodes use lowercase-kebab stems (gold-doc name carried in `sources:`, not the filename). The literal rule was relaxed to permit *either* source-casing **or** kebab — neither enforced.
2. **§4.5.3 dropped `scope/v1`.** Domain vaults went V2-only; `scope/v1` was removed from the valid `scope/*` set and swept from all nodes.

Each change touched **three points in lockstep** (`vault/CLAUDE.md §4.5` + `/wiki-ingest §4` + `/wiki-graph-audit` category rules) **and** propagated across the fleet (both active vaults) via the Fleet-Aware gate — because a shape-contract edit is H by definition. This is the canonical illustration: a contract change is never one edit; it is *N enforcement points × M sibling vaults*, synced in a single change.

## Related

- [[multi-stage-migration-pitfalls]]
- [[trust-but-verify-mid-task-gate]]
- [[operating-modes]]
- [[configuration-hierarchy]]
