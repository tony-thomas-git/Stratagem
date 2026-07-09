# Stratagem Wiki — Schema & Operating Rules

This file is the **schema** for the Stratagem-Wiki, an LLM Wiki (idea from Andrej
Karpathy) repurposed as the knowledge base for the Stratagem AI coding workflow
system. Read this file fully every time you open this vault. Everything below
is binding: it tells you what the wiki is, where things live, how to ingest
new sources, how to format pages, and how to answer questions.

---

## 1. Purpose

**This wiki is the knowledge base for the Stratagem AI coding workflow
system** — the meta-system that Steward orchestrates across all coding
projects (Portal, SAAS, FogBOM, and future projects).

**Topics in scope:**
- Operating modes: `PF`/`CP`/`PX`/`AX`/`EX`/`FX`/`CF`, `MPX`/`MAX`, `PHX`, `PICA`, `RS`/`CRS`
- Skill catalog (`~/.claude/skills/`) and skill-design principles
- Configuration hierarchy: global `CLAUDE.md` → project `CLAUDE.md` → Steward `CLAUDE.md`
- Tracer-bullet discipline (vertical-slice vs. horizontal-layer decisions)
- MCP orchestration patterns
- Cross-project workflow patterns and anti-patterns
- The Steward role itself (orchestrator, architect, toolchain designer)

**Ingest sources** (the kinds of things that go in `raw/`):
- `C:\code\docs\Steward-docs\*` — workflow docs, hooks registry, retrospectives, gold-standard patterns
- `C:\code\Steward\CLAUDE.md` — the Steward meta-system definition
- `C:\code\CLAUDE.md` — the global instructions
- Completed retrospectives (`*_retrospective.md`) from any project
- Conversation retros (`/crs` output)
- Feedback memory files (`~/.claude/projects/*/memory/feedback_*.md`)
- Skill files (`~/.claude/skills/*/SKILL.md`) when their patterns matter

**Scope boundary:** This wiki is *about how we work*, never about *what we
work on*. Domain knowledge (Portal's entity model, FogBOM's data pipeline,
SAAS features) belongs in **per-project wikis** (Portal-Wiki, SAAS-Wiki,
FogBOM-Wiki — each a separate vault), not here.

The wiki exists so that workflow knowledge accumulates. When the user adds a
new source, you don't just store it — you read it, extract the ideas, and
integrate them into a structured, interlinked set of markdown pages. The
next question the user asks should benefit from every source ingested before it.

---

## 2. The three layers

1. **`raw/`** — original sources (PDFs, articles, transcripts, notes).
   - **Read-only.** Never edit, rename, or delete files in here.
   - Treat this as the source of truth. Every claim in the wiki must
     trace back to a file in `raw/`.
2. **`wiki/`** — the knowledge base you create and maintain.
   - Markdown files only. Free to create, edit, rename, restructure.
   - Pages are interlinked with `[[wiki-link]]` syntax (Obsidian/standard
     wiki-link). Folders inside `wiki/` are allowed if a topic warrants it.
3. **`templates/`** — optional manual-authoring templates. Ignore unless
   the user asks.
4. **`logs/`** — your activity log.
   - `CHANGELOG.md` — running, human-readable history of every ingest.
   - `ingest-log.md` — structured per-source record (what was read, what
     pages were touched).

---

## 3. Ingest workflow

When the user says *"I added a new source"* (or anything equivalent), do
the following in order. Do not skip steps.

1. **Identify the new file(s)** in `raw/`. If unsure, ask.
2. **Read the source fully.** For long files, read in chunks until you've
   covered the whole thing. SRT/VTT transcripts often repeat lines across
   subtitle frames — extract the underlying prose, not the duplicates.
3. **Trust-But-Verify the scope.** List (internally) the concepts, entities,
   and claims worth pulling out. Pick defaults — do not wait for confirmation.
   Follow the **Trust-But-Verify** pattern defined in `c:\code\Steward\CLAUDE.md`
   (Meta-Architecture Framework). Tag each decision L/M/H; H-complexity
   decisions STOP and escalate inline. Surface a "Decisions Made" block in §8
   at the end of the round; the user verifies and adjusts there if needed.
4. **Create or update pages via `/wiki-ingest`.**
   - Invoke `/wiki-ingest <vault-path> <source-file>` — it routes new pages to the correct folder per §4.5.1, generates §4.5.2-compliant frontmatter, and updates `wiki/index.md`.
   - One page per distinct concept, entity, or topic.
   - If a relevant page already exists, **update it** rather than
     creating a duplicate. Merge new claims in, don't overwrite.
   - Use `[[wiki-link]]` to connect related pages liberally.
   - After ingest, `/wiki-graph-audit` runs at close-out and reports any §4.5 violations (offers auto-fix per category).
5. **Update `wiki/index.md`** with any new top-level entries.
6. **Check for contradictions.** If the new source disagrees with a
   claim already in the wiki, do not silently overwrite. Add an entry to
   `wiki/contradictions.md` describing both claims, their sources, and
   which page(s) are affected. Flag it to the user.
7. **Log the ingest.** Append to `logs/CHANGELOG.md` and
   `logs/ingest-log.md` (see formats in §6).
8. **Report back** with a short summary: source name, pages created,
   pages updated, contradictions flagged.

---

## 4. Page formatting rules

Every wiki page must follow this shape:

```markdown
---
type: concept | entity | topic | comparison | summary
sources: [filename-in-raw.md, other-source.pdf]
updated: YYYY-MM-DD
---

# Page Title

> **Summary.** One- or two-sentence elevator pitch. Read this and you
> understand what the page is about.

## Body sections as needed

Content here. Every non-obvious claim cites a source inline using the
format: (source: `filename-in-raw.ext`). Use `[[wiki-link]]` for any
mention of another concept that has (or could have) its own page.

## Related

- [[other-page]]
- [[another-page]]
```

Hard rules:

- **Summary first.** Always.
- **Cite sources** for non-trivial claims, inline.
- **Link liberally.** A bare mention of a concept that exists elsewhere
  in the wiki should be a `[[link]]`. Forward-links to pages that don't
  exist yet are fine — they mark gaps worth filling.
- **No editorializing.** Stick to what the sources say. If you're
  inferring or extrapolating, mark it: *(inferred)*.
- **Keep pages focused.** If a page grows past ~300 lines or covers two
  distinct ideas, split it.

---

## 4.5 Folder & graph shape (binding)

This section is the **vault-shape contract** — what must be true of every wiki produced by `/wiki-ingest` and every wiki page that passes `/wiki-graph-audit`. The contract has four enforcement points: this schema (human-readable), `/wiki-ingest` (generator), `/wiki-graph-audit` (verifier), and `vault/.obsidian/graph.json` (renderer). All four must agree.

### 4.5.1 Folder taxonomy (9 folders inside `wiki/`)

Every wiki page lives inside exactly one of these folders. The folder is determined by the page's frontmatter `type:` value (see routing table below). Each folder maps to one Obsidian graph color group.

| Folder | Holds pages with `type:` | Graph color |
|---|---|---|
| `architecture/` | `architecture`, `concept`, `comparison` (when comparing architectures) | Blue (#2e7eaa) |
| `patterns/` | `pattern`, `entity`, `comparison` (when comparing pattern instances) | Green (#50b864) |
| `anti-patterns/` | `anti-pattern` | Red (#dc3545) |
| `retrospectives/` | `retrospective` | Rust (#b03e08) |
| `decisions/` | `decision` | Magenta (#dc1ddd) |
| `plans/` | `plan` | Purple (#9c27b0) |
| `runbooks/` | `runbook` | Yellow (#fbc02d) |
| `api/` | `api` | Sky (#7fb8ff) |
| `meta/` | `index`, `summary`, `meta` | Grey (#9e9e9e) |

**Hard rule:** `wiki/index.md` stays at `wiki/` root (NOT inside `wiki/meta/`) — Obsidian centers the graph on the file at the shortest path. All other `index`/`summary`/`meta` pages live in `wiki/meta/`.

**Distinction — `decision` vs `retrospective`:** A `decision` records a chosen approach plus rationale and alternatives rejected (forward-looking). A `retrospective` records what happened after execution and what we learned (backward-looking).

### 4.5.2 Frontmatter contract (all 4 fields required)

Every wiki page begins with:

```yaml
---
type: architecture | pattern | anti-pattern | retrospective | decision | plan | runbook | api | concept | entity | comparison | summary | index | meta
sources: [list]                       # required; empty list `[]` allowed for meta pages
updated: YYYY-MM-DD                   # required; ISO date
tags:                                 # required; status/* always present
  - status/active | status/draft | status/superseded
  - scope/v2 | scope/workflow | scope/saas | scope/fogbom        # v1 retired — fleet vocabulary
  - pattern-family/entity-system | pattern-family/navigation | pattern-family/filters | pattern-family/schema | pattern-family/layout   # optional, multi
  - layer/api | layer/ui | layer/db | layer/orchestrator   # optional, multi
---
```

**Required:** `type`, `sources`, `updated`, `tags` (with at least one `status/*` and one `scope/*`).
**Optional, multi-valued:** `pattern-family/*`, `layer/*`.

### 4.5.3 Tag vocabulary (closed sets)

| Axis | Values | Required? | Multi? |
|---|---|---|---|
| `status/*` | `active`, `draft`, `superseded` | Yes — exactly one | No |
| `scope/*` | `v2`, `workflow`, `saas`, `fogbom` | Yes — at least one | Yes |
| `pattern-family/*` | `entity-system`, `navigation`, `filters`, `schema`, `layout` | No | Yes |
| `layer/*` | `api`, `ui`, `db`, `orchestrator` | No | Yes |

`scope/workflow` is the value for Stratagem-Wiki pages (workflow knowledge, not a specific product).

**`scope/v1` retired (2026-06-14):** removed from the fleet vocabulary. Product wikis are V2-only (the ISCI-Web-App-Wiki rule); V1 appears only as *simple Heritage-note mentions*, never as a scope tag or source. This vault is `scope/workflow`, so the change is vocabulary-alignment only — no Stratagem pages were affected.

### 4.5.4 Filename convention (no enforcement either way)

- **No enforced casing.** A filename may preserve the source's casing and emoji **or** use lowercase-kebab — both are valid; the audit enforces neither. (Counterpart nodes of project gold docs conventionally use lowercase-kebab stems and carry the gold-doc name in `sources:` — see the Counterpart Model — but this is convention, not a rule.)
- No kebab-case enforcement; no emoji stripping; no casing requirement.
- Plan files keep the format `{slug}_YYMMDD_HHMMSS_plan.md`.
- Filename uniqueness across the vault is required — Obsidian's `[[wikilink]]` shortest-match resolution depends on it. `/wiki-graph-audit` flags duplicates.

### 4.5.5 `vault/.obsidian/graph.json` (renderer)

This file is committed to the vault. It is identical across all Stratagem wikis (proves the contract is vault-agnostic):

- `colorGroups`: 9 path-query rules per §4.5.1 + 1 tag-query rule (`["#status/superseded"] → dark grey`)
- `showOrphans: true` (orphans must remain visible — they signal linking gaps)
- `hideUnresolved: false` (forward-link gaps render as faded nodes — they show what pages should exist)
- `showAttachments: false`, `showTags: false`
- Forces: `nodeSizeMultiplier: 1.2`, `linkDistance: 220`, `repelStrength: 12`

### 4.5.6 Enforcement

- **`/wiki-ingest`** is the generator: every page it creates conforms to §4.5.1–§4.5.4 by construction.
- **`/wiki-graph-audit`** is the verifier: read-only sweep over `vault/wiki/` that flags violations grouped by category (folder/type mismatch, missing frontmatter, orphans, duplicate filenames, broken `[[wikilinks]]`). Supports `--category <name>` for filtered runs. Offers auto-fix per category after report.
- **`/rs` and `/crs`** route new wiki pages through `/wiki-ingest` when a wiki vault is registered for the active project (see Wiki Registry in `c:\code\Steward\CLAUDE.md`). They run `/wiki-graph-audit` at close-out and offer auto-fix if violations are found.

### 4.5.7 Invariant

What `/wiki-ingest` produces must equal what a hand-placement following §4.5.1–§4.5.4 produces. If they diverge, the skill is wrong — fix the skill, not the placement.

---

## 5. Question-answering behavior

When the user asks a question (anything that isn't an ingest request):

1. **Consult the wiki first.** Read relevant pages in `wiki/` before
   reaching for `raw/` or your own training knowledge.
2. **Cite the wiki page(s)** you used, by name. If you also pulled from
   a raw source, cite that too.
3. **Flag uncertainty.** If the wiki doesn't cover the question, say so
   plainly. Offer to ingest a source that would close the gap, rather
   than guessing.
4. **Don't silently update the wiki** mid-answer. If answering reveals
   something missing, mention it and ask whether to add it.

---

## 6. Log formats

### `logs/CHANGELOG.md`

Append entries to the top of the file (newest first):

```markdown
## YYYY-MM-DD — <short title>
- **Source:** `filename-in-raw.ext`
- **Created:** [[page-one]], [[page-two]]
- **Updated:** [[existing-page]]
- **Contradictions:** none | see [[contradictions#anchor]]
- **Notes:** one line of context if useful.
```

### `logs/ingest-log.md`

Append entries to the bottom (oldest first), structured for
machine-grep:

```markdown
---
source: filename-in-raw.ext
ingested: YYYY-MM-DD
pages_created:
  - page-one
  - page-two
pages_updated:
  - existing-page
contradictions: 0
---
```

---

## 7. What not to do

- Never modify files in `raw/`.
- Never delete wiki pages without asking — even if they seem outdated.
- Never make up sources, citations, or facts. If you don't know, say so.
- Never ingest a source you haven't actually read end-to-end.
- Never skip the Decisions Made surface at the end of a round (see §3 step 3
  and Steward's Trust-But-Verify pattern). The end-of-round surface is the
  user's only verification point — omitting it breaks the loop.

---

## 8. End-of-round Decisions Made surface

Every ingest round ends with a Decisions Made block (see Steward CLAUDE.md →
Meta-Architecture Framework → Trust-But-Verify Pattern for the canonical
format). Include this **before** the short summary in §3 step 8. The user
replies with `adjust N` to revise a specific row, or silence/`ok` to accept.

High-stakes choices — deletions, renames, contradictions, scope-boundary
crossings, and any **High-complexity** decision per the Complexity Ranking
guardrail — are escalated inline during the round, not deferred to this block.
