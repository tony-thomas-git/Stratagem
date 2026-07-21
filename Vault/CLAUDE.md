# LLM Wiki — Schema & Operating Rules

This file is the **schema** for an LLM Wiki, an idea from Andrej Karpathy.
Read this file fully every time you open this vault. Everything below is
binding: it tells you what the wiki is, where things live, how to ingest
new sources, how to format pages, and how to answer questions.

This vault is designed to render in Obsidian. The graph view
(color-grouped by folder) is the primary navigational surface — the
folder taxonomy and the renderer settings in `vault/.obsidian/graph.json`
are part of the contract, not decoration.

---

## 1. Purpose

**This wiki is the second-brain for the Stratagem system.** It holds two
scopes of the same system: the `stratagem-core` implementation
(`scope/stratagem-core`, `scope/ado`, `scope/plugin`, `scope/skills` — how the
marketplace, plugins, and neutral seam are *built*) and the workflow
meta-system (`scope/workflow` — operating modes, skills, tracer-bullet and
loop-engineering discipline; *how we work*, and the dominant scope by page
count). See [[scopes]] for the full vocabulary and [[index]] for the routing
surface.

The wiki interlinks **plans, architecture, working patterns,
anti-patterns we've ruled out, decisions with their rationale,
retrospectives on what shipped and what broke, runbooks, API
contracts, and research from external sources** (docs, RFCs, blog
posts, vendor PDFs, interview transcripts, design memos). It exists
so the next question — from the operator OR from a future agent —
benefits from every source ingested before it.

When the user adds a new source, follow the ingest workflow in §3:
read fully, plan, confirm, synthesize into interlinked pages, log.
Don't dump raw content into the wiki — extract the ideas, link them,
and trace every claim back to a `raw/` source.

The vault is **domain-agnostic by design**. The schema below works
for any software project — backend services, embedded firmware,
mobile apps, ML systems, desktop applications, infrastructure
code. Project-specific conventions are added by amending this file
in-session as patterns emerge; the §4.5.7 invariant ensures the
shape stays coherent.

---

## 2. The three layers

1. **`raw/`** — original sources (PDFs, articles, transcripts, design
   memos, header snapshots, interview notes).
   - **Read-only.** Never edit, rename, or delete files in here.
   - Treat this as the source of truth. Every claim in the wiki must
     trace back to a file in `raw/`.
   - The `raw/` subfolder layout is up to you. Common groupings:
     `raw/transcripts/`, `raw/plans/`, `raw/design-docs/`,
     `raw/reference-pdfs/`, `raw/vendor-docs/`,
     `raw/code-snapshots/`. Create what fits.
2. **`wiki/`** — the knowledge base you create and maintain.
   - Markdown files only. Free to create, edit, rename, restructure.
   - Pages are interlinked with `[[wiki-link]]` syntax (Obsidian /
     standard wiki-link). Folders inside `wiki/` follow the taxonomy
     in §4.5.1.
3. **`logs/`** — your activity log.
   - `CHANGELOG.md` — running, human-readable history of every
     ingest and major wiki restructure (newest first).
   - `ingest-log.md` — structured per-source record (what was read,
     what pages were touched) for machine-grep.

---

## 3. Ingest workflow

When the user says *"I added a new source"* (or anything equivalent),
do the following in order. Do not skip steps.

1. **Identify the new file(s)** in `raw/`. If unsure, ask.
2. **Read the source fully.** For long files, read in chunks until
   you've covered the whole thing. SRT/VTT transcripts often repeat
   lines across subtitle frames — extract the underlying prose, not
   the duplicates. For code files — read every public declaration
   and the implementation it points to where available.
3. **Plan before writing.** List the concepts, entities, and claims
   worth pulling out. Present this plan to the user and wait for
   confirmation before creating or modifying any wiki pages. The user
   may want to narrow or expand the scope.
4. **Create or update pages.**
   - One page per distinct concept, entity, or topic.
   - Place each page in the folder whose `type:` it matches (see
     §4.5.1).
   - If a relevant page already exists, **update it** rather than
     creating a duplicate. Merge new claims in, don't overwrite.
   - Use `[[wiki-link]]` to connect related pages liberally.
     Forward-links to pages that don't exist yet are fine — they mark
     gaps worth filling.
5. **Update `wiki/index.md`** with any new top-level entries.
6. **Check for contradictions.** If the new source disagrees with a
   claim already in the wiki, do not silently overwrite. Add an entry
   to `wiki/meta/contradictions.md` describing both claims, their
   sources, and which page(s) are affected. Flag it to the user.
7. **Log the ingest.** Append to `logs/CHANGELOG.md` and
   `logs/ingest-log.md` (see formats in §6).
8. **Report back** with a short summary: source name, pages created,
   pages updated, contradictions flagged.

### 3.1 Code-file ingest (optional addendum if your project includes code)

When the source is a code file (header, implementation, project file,
build script):

- **Extract APIs and contracts, not lines.** A code file's value to
  the wiki is its declared types, function signatures, lifetime
  contracts, threading guarantees, error-handling shape — not the
  syntax. Write those into pages.
- **Mark version + path.** Every page that cites a code file should
  include a frontmatter field `code_sources:` with relative paths
  AND the commit-or-version snapshot you read. Code changes; pages
  need to be re-verified against newer versions.
- **High-risk surface code (e.g. system boundaries, security
  surfaces, public API contracts)** typically warrants the
  "boundary triangle" pattern — see
  [[boundary-page-template]].

### 3.2 Versioned-source ingest (optional)

If the source is a versioned vendor doc, dependency manual, or
external spec (anything that may change in subsequent releases):

- Note the version in frontmatter (`upstream_version:` or
  `sdk_version:` — pick a convention and stay consistent).
- When a new version's docs are ingested, scan all existing pages
  citing the old version. Add them to a "needs re-verification"
  entry in `wiki/meta/contradictions.md` (or a dedicated
  `wiki/meta/upstream-version-changes.md` log) until they're
  re-checked.

---

## 4. Page formatting rules

Every wiki page must follow this shape:

```markdown
---
type: concept | entity | topic | comparison | summary
sources: [filename-in-raw.md, other-source.pdf]
code_sources: ["src/path/Foo.h@<commit-or-version>"]   # optional
upstream_version: "<vendor> X.Y.Z"                     # optional
updated: YYYY-MM-DD
tags:
  - status/active
  - scope/your-project-slug
---

# Page Title

> **Summary.** One- or two-sentence elevator pitch. Read this and you
> understand what the page is about.

## Body sections as needed

Content here. Every non-obvious claim cites a source inline using the
format: (source: `filename-in-raw.ext`) or (code:
`src/path/Foo.h:L42`). Use `[[wiki-link]]` for any mention of another
concept that has (or could have) its own page.

## Related

- [[other-page]]
- [[another-page]]
```

Hard rules:

- **Summary first.** Always.
- **Cite sources** for non-trivial claims, inline. Code claims cite
  file + line (or symbol).
- **Link liberally.** A bare mention of a concept that exists
  elsewhere in the wiki should be a `[[link]]`. Forward-links to
  pages that don't exist yet are fine — they mark gaps worth filling.
- **No editorializing.** Stick to what the sources say. If you're
  inferring or extrapolating, mark it: *(inferred)*.
- **Keep pages focused.** If a page grows past ~300 lines or covers
  two distinct ideas, split it.

---

## 4.5 Folder & graph shape (binding)

This section is the **vault-shape contract** — what must be true of
every wiki page in this vault. The contract has three enforcement
points: this schema (human-readable), the rules you follow when
creating pages, and `vault/.obsidian/graph.json` (renderer). All
three must agree.

### 4.5.1 Folder taxonomy (9 folders inside `wiki/`)

Every wiki page lives inside exactly one of these folders. The folder
is determined by the page's frontmatter `type:` value. Each folder
maps to one Obsidian graph color group.

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

**Hard rule:** `wiki/index.md` stays at `wiki/` root (NOT inside
`wiki/meta/`) — Obsidian centers the graph on the file at the shortest
path. All other `index`/`summary`/`meta` pages live in `wiki/meta/`.

**Distinction — `decision` vs `retrospective`:** A `decision` records
a chosen approach plus rationale and alternatives rejected
(forward-looking). A `retrospective` records what happened after
execution and what was learned (backward-looking).

**Distinction — `api` vs `architecture`:** An `api` page documents the
CONTRACT a component exposes (function signatures, types, lifetime
rules, version compatibility). An `architecture` page documents what
the component IS and how it fits with neighbors.

Projects may ignore folders they don't use. Empty folders are fine —
they don't hurt the graph.

### 4.5.2 Frontmatter contract (4 fields required, 2 optional)

Every wiki page begins with:

```yaml
---
type: architecture | pattern | anti-pattern | retrospective | decision | plan | runbook | api | concept | entity | comparison | summary | index | meta
sources: [list]                       # required; empty list `[]` allowed for meta pages
updated: YYYY-MM-DD                   # required; ISO date
tags:                                 # required; at least one status/* and one scope/*
  - status/active | status/draft | status/superseded
  - scope/stratagem-core
code_sources: [list]                  # optional; for pages citing code files
upstream_version: "Vendor X.Y.Z"     # optional; for pages citing versioned external docs
---
```

**Required:** `type`, `sources`, `updated`, `tags` (with at least one
`status/*` and one `scope/*`).

**Optional but recommended where applicable:** `code_sources`,
`upstream_version` — see §3.1 and §3.2.

### 4.5.3 Tag vocabulary

| Axis | Values | Required? | Multi? |
|---|---|---|---|
| `status/*` | `active`, `draft`, `superseded` (closed set) | Yes — exactly one | No |
| `scope/*` | open vocabulary — define your own slugs | Yes — at least one | Yes |

`scope/*` is open vocabulary. Pick slugs for your project and document
them in `wiki/meta/scopes.md`. At least one `scope/*` tag is required
per page.

**Supplementary tag axes you may adopt** (optional — only if useful
for the graph view filtering):

- `layer/<n>` — layer index for layered systems
- `boundary/<name>` — when a page describes a boundary or crossing
- `risk/<concern>` — annotate areas where a class of bug is acute
- `vendor/<name>` — when a page describes a vendor/third-party
  component
- `release/<version>` — when a page is tied to a specific release

If you adopt one, document it in `wiki/meta/scopes.md` alongside
your `scope/*` vocabulary.

### 4.5.4 Filename convention

- Filenames preserve casing. No kebab-case enforcement; no emoji
  stripping. Prefer descriptive, queryable names.
- Filename uniqueness across the vault is required — Obsidian's
  `[[wikilink]]` shortest-match resolution depends on it.

### 4.5.5 `vault/.obsidian/graph.json` (renderer)

This file is committed to the vault. The settings encode the contract:

- `colorGroups`: 9 path-query rules per §4.5.1 + 1 tag-query rule
  (`#status/superseded` → dark grey)
- `showOrphans: true` (orphans must remain visible — they signal
  linking gaps)
- `hideUnresolved: false` (forward-link gaps render as faded nodes
  — they show what pages should exist)
- `showAttachments: false`, `showTags: false`
- Forces: `nodeSizeMultiplier: 1.2`, `linkDistance: 220`,
  `repelStrength: 12`

### 4.5.6 Enforcement (manual)

There is no automated verifier in this template. Periodically scan
`wiki/` by hand for:

- **Folder/type mismatch** — pages whose `type:` doesn't match the
  folder they live in per §4.5.1.
- **Missing frontmatter** — pages lacking any of the 4 required
  fields.
- **Orphans** — pages with zero incoming and outgoing `[[wikilinks]]`
  (the graph view makes these obvious — they appear disconnected).
- **Duplicate filenames** — two pages with the same filename anywhere
  in the vault break `[[wikilink]]` resolution.
- **Unresolved `[[wikilinks]]`** — forward-links to pages that should
  exist by now; the graph view renders these as faded nodes.

When you find a violation, fix it inline.

### 4.5.7 Invariant

Whatever conventions accrete on top of this contract (additional tag
axes, project-specific page types, custom folders) must remain
consistent with §4.5.1–§4.5.4. If automation is later added (a
generator skill, a verifier script), what it produces must equal
what hand-placement following these rules produces. If they diverge,
the schema is canon — fix the automation.

---

## 5. Question-answering behavior

When the user asks a question (anything that isn't an ingest request):

1. **Consult the wiki first.** Read relevant pages in `wiki/` before
   reaching for `raw/` or your own training knowledge.
2. **Cite the wiki page(s)** you used, by name. If you also pulled
   from a raw source, cite that too. If you cite a code line, give
   file path + line.
3. **Flag uncertainty.** If the wiki doesn't cover the question, say
   so plainly. Offer to ingest a source that would close the gap,
   rather than guessing.
4. **Don't silently update the wiki** mid-answer. If answering
   reveals something missing, mention it and ask whether to add it.

---

## 6. Log formats

### `logs/CHANGELOG.md`

Append entries to the top of the file (newest first):

```markdown
## YYYY-MM-DD — <short title>
- **Source:** `filename-in-raw.ext` (or N/A for structural changes)
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
upstream_version: "<vendor> X.Y.Z"   # optional
---
```

---

## 7. What not to do

- Never modify files in `raw/`.
- Never delete wiki pages without asking — even if they seem outdated.
- Never make up sources, citations, or facts. If you don't know, say
  so.
- Never ingest a source you haven't actually read end-to-end.
- Never skip the plan-and-confirm step in §3 on the first few ingests.
  Once the user trusts the workflow, they may tell you to skip it.
- Never document a public API signature from memory when a header or
  source file is available. The signature in the wiki must match the
  code, byte for byte (modulo whitespace/comments).

---

## 8. First-time bootstrap checklist (delete this section after first use)

If you are the agent that received this vault as a bootstrap kit:

1. Read this file fully. ✓ (you are doing it now)
2. Read `wiki/index.md` — the landing page lists what exists.
3. Read `wiki/meta/scopes.md` — adopt or amend the scope vocabulary
   for your specific project.
4. Read every template in `wiki/meta/*-template.md` — these are the
   page shapes you'll use most.
5. Decide where the target project's primary materials live (code
   directory, design docs, existing documentation). Ask the operator
   if unclear.
6. Begin the FIRST INGEST PASS — see `AGENT-BRIEF.md` at the root of
   the bootstrap kit. The recommended first pass: survey the
   top-level project structure → write a `system-topology.md`
   skeleton → identify each major area / layer / subsystem → write a
   stub `architecture/` page for each with TODO sections → identify
   the highest-risk surfaces (boundaries, integrations, complex
   subsystems) → write stubs for those. Don't try to fill in details
   yet — get the skeleton up so subsequent ingests have a place to
   link.
7. Delete this §8 from CLAUDE.md once the skeleton is in place.
