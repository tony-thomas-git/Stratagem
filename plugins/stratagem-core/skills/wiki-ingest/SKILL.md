---
name: wiki-ingest
description: Wiki Ingest - Generator skill that adds a new page to a Stratagem Wiki vault, conforming to the §4.5 vault-shape contract
argument-hint: "<vault-path> <source-file-or-topic> [--stub] [--backfill] [--route-all]"
---

# Wiki Ingest

**Purpose:** The generator half of the §4.5 vault-shape contract. Reads a source, routes the new page to the correct folder by `type:`, writes valid frontmatter, updates `wiki/index.md`, appends logs, and runs `/wiki-graph-audit` at close-out.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ WIKI-INGEST MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Vault: [vault-path from $ARGUMENTS]
 Source: [source from $ARGUMENTS or "stub mode"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Argument parsing

- `<vault-path>` — absolute path to the wiki vault root (the directory containing `CLAUDE.md`, `wiki/`, `raw/`, `logs/`). REQUIRED.
- `<source-file-or-topic>` — either a path to a file in `raw/` (preferred) or a topic label for a stub page. REQUIRED for ingest mode; ignored in `--backfill` and `--route-all` modes.
- `--stub` — create a draft placeholder page with frontmatter only, no body, `status/draft`. Use for forward-link targets that don't have content yet.
- `--backfill` — sweep vault for pages missing required frontmatter fields and offer per-field fixes. See §11.
- `--route-all` — sweep `vault/` root + `wiki/` root for loose `.md` files and route them all into the correct folder by `type:`. See §12.

### Mode resolution

| Flags present | Run |
|---|---|
| None | Normal ingest flow (§1–§10) |
| `--stub` | Normal flow, body skipped (stub mode noted inline §1, §5) |
| `--backfill` | §11 only; §1–§10 skipped |
| `--route-all` | §12 only; §1–§10 skipped |
| Both `--backfill` and `--route-all` | HALT — pick one |

## Pre-flight checks

Run ALL of §0.1–§0.5 before any mode-specific flow (§1, §11, or §12). These are the drift-prevention guards added after the §4.5 contract's first migration was halted by concurrent-agent drift.

> **Sync note:** §0.1–§0.5 mirror `/wiki-graph-audit` §0.1–§0.5 step-for-step. The two skills share this block by design — any change here must be applied to `/wiki-graph-audit` SKILL.md §0 in the same edit. **Single source of truth: this block + `/wiki-graph-audit` §0.** One asymmetry: ingest §0.3 HALTs on drift (it writes); audit §0.3 warns only (read-only).

### 0.1 Schema present

Confirm `<vault-path>/CLAUDE.md` exists and contains `## 4.5 Folder & graph shape (binding)`. If not, HALT and tell the user the vault doesn't have the §4.5 contract yet.

### 0.2 Folder structure

Confirm `<vault-path>/wiki/` exists. Create the 9 §4.5.1 folders if any are missing (`architecture/`, `patterns/`, `anti-patterns/`, `retrospectives/`, `decisions/`, `plans/`, `runbooks/`, `api/`, `meta/`).

### 0.3 Vault state hash (drift detection)

Capture a snapshot hash of all `.md` files in the vault at skill entry. Hold in memory for the duration of the run.

```bash
find "<vault-path>" -name "*.md" -printf "%T@ %s %p\n" | sort | sha256sum
```

(Path + mtime + size, deterministic order, single hash.)

**Re-check before each write:** if the hash has changed since entry, HALT and report drift. Show the user what changed (`find` diff of the snapshot vs current). Ask whether to merge or roll back. This is the guard for [[multi-stage-migration-pitfalls#AP-WF-2]] — concurrent-agent vault drift.

### 0.4 Duplicate basename scan

Before any new write, collect basenames of all `.md` under `<vault-path>/wiki/`. If the target filename already exists anywhere in the vault, HALT and report:
- The colliding paths (existing vs proposed)
- Sizes, frontmatter status (present/absent), `updated:` dates
- Prompt: `keep existing / overwrite / rename new / merge`

Reason: Obsidian's `[[wikilink]]` shortest-match resolution requires filename uniqueness across the vault. Two files with the same basename in different folders breaks navigation.

### 0.5 Stray-file scan

Sweep `<vault-path>/` root and `<vault-path>/wiki/` root for loose `.md` files that should be in folders.

- `vault/` root: only `CLAUDE.md` is allowed. Any other `.md` at vault root is a stray.
- `wiki/` root: only `index.md` is allowed. Any other `.md` at `wiki/` root is misplaced and should be in a `wiki/<folder>/`.

Report findings before proceeding:

```
⚠️  STRAY FILES DETECTED
  vault/ root:   <list>
  wiki/ root:    <list>
```

If running normal ingest mode (§1–§10), this is informational — proceed. If running `--route-all` (§12), strays are the input set.

## 1. Source reading (skipped in `--stub` mode)

- Read the source file fully. For long files, read in chunks until end.
- SRT/VTT transcripts: extract underlying prose, not duplicate subtitle frames.
- Extract: concepts, entities, claims worth preserving, source citations to record in `sources:`.

## 2. Page planning (skipped in `--stub` mode)

- One page per distinct concept, entity, or topic.
- If a relevant page already exists in `<vault-path>/wiki/<folder>/`, plan an UPDATE not a duplicate.
- Present the plan to the user (list of pages to create + pages to update) and wait for confirmation before writing — unless the user has previously authorized skipping plan-and-confirm for this vault.

## 3. Type → folder routing (binding §4.5.1 table)

> **Sync note:** This table encodes `vault/CLAUDE.md` §4.5.1. The verifier `/wiki-graph-audit` enforces the same mapping in its §Category 1. **Change-coupling:** any edit to this table must update `vault/CLAUDE.md §4.5.1` (in both vaults) + `/wiki-graph-audit` SKILL.md §Category 1 in the same change. Three places, one truth.

| `type:` value | → Folder |
|---|---|
| `architecture` | `wiki/architecture/` |
| `concept` | `wiki/architecture/` (concept = architectural concept) |
| `pattern` | `wiki/patterns/` |
| `entity` | `wiki/patterns/` |
| `anti-pattern` | `wiki/anti-patterns/` |
| `retrospective` | `wiki/retrospectives/` |
| `decision` | `wiki/decisions/` |
| `plan` | `wiki/plans/` |
| `runbook` | `wiki/runbooks/` |
| `api` | `wiki/api/` |
| `comparison` | `wiki/architecture/` if comparing architectures; `wiki/patterns/` if comparing pattern instances. Ask the user if ambiguous. |
| `summary` | `wiki/meta/` |
| `meta` | `wiki/meta/` |
| `index` | `wiki/` ROOT — only `wiki/index.md` lives at root; other index/summary/meta pages go in `wiki/meta/` |

**Decision rule** for routing: choose `type:` based on the page's primary content, then route. If a page covers multiple types, split it.

## 4. Frontmatter generation (§4.5.2 contract)

> **Sync note:** This frontmatter spec encodes `vault/CLAUDE.md` §4.5.2 + §4.5.3. The verifier `/wiki-graph-audit` enforces the same fields and closed-set values in its §Category 2. **Change-coupling:** any edit to the frontmatter spec or tag vocabulary must update `vault/CLAUDE.md §4.5.2/§4.5.3` (in both vaults) + `/wiki-graph-audit` SKILL.md §Category 2 in the same change. Three places, one truth.

Generate this exact frontmatter shape for every new page:

```yaml
---
type: <one of the §4.5.2 values>
sources:
  - <source-path-relative-to-vault-raw-or-empty-list>
updated: <today YYYY-MM-DD>
tags:
  - status/<active|draft|superseded>
  - scope/<vision|build|app|storage|…>     # see the vault's meta/scopes.md for the authoritative set
  # Optional, multi-valued:
  # - pattern-family/<entity-system|navigation|filters|schema|layout>
  # - layer/<api|ui|db|orchestrator>
---
```

**Required:** `type`, `sources` (empty list `[]` OK for meta pages), `updated`, `tags` with at least one `status/*` and one `scope/*`.

**Scope tag selection:**
- ISCI-Vision-Vault pages → `scope/vision` (single-project machine; domain + workflow knowledge)
- For a sub-area, use a finer `scope/*` per the vault's `meta/scopes.md` (e.g. `scope/build`, `scope/app`, `scope/storage`)

**Filename rule (§4.5.4):** no enforced casing — a filename may preserve source casing/emoji **or** use lowercase-kebab (both valid; audit enforces neither). Counterpart nodes of project gold docs conventionally use lowercase-kebab stems with the gold-doc name in `sources:` (convention, not a rule). For non-file topics (`--stub` mode), use the topic label as-is.

## 5. Page body (skipped in `--stub` mode)

After frontmatter, the body follows §4 page formatting rules from the vault's `CLAUDE.md`:

```markdown
# Page Title

> **Summary.** One- or two-sentence elevator pitch.

## Body sections as needed

Content here. Cite sources inline: (source: `filename-in-raw.ext`). Use `[[wiki-link]]` for cross-references.

## Related

- [[other-page]]
- [[another-page]]
```

For `--stub` mode: write frontmatter only with `status/draft`, body is the single line `> **Summary.** _Stub. Forward-link target — content to be added._`.

## 6. Index update

Edit `<vault-path>/wiki/index.md` and add the new page(s) under the appropriate folder section. If the section doesn't exist, add it. If the page is a `--stub`, list it under "Gaps (forward-links worth filling)" instead of a folder section.

## 7. Contradiction check (skipped in `--stub` mode)

If the new source disagrees with a claim already in the wiki, do not silently overwrite. Add an entry to `wiki/meta/contradictions.md` describing both claims, their sources, and which page(s) are affected. Flag it to the user.

## 8. Log append (§6 of vault CLAUDE.md)

Append to `<vault-path>/logs/CHANGELOG.md` (newest first):

```markdown
## YYYY-MM-DD — <short title>
- **Source:** `<source-relative-path>`
- **Created:** [[page-one]], [[page-two]]
- **Updated:** [[existing-page]]
- **Contradictions:** none | see [[contradictions#anchor]]
- **Notes:** one line of context if useful.
```

Append to `<vault-path>/logs/ingest-log.md` (oldest first):

```markdown
---
source: <source-relative-path>
ingested: YYYY-MM-DD
pages_created:
  - <page-one>
  - <page-two>
pages_updated:
  - <existing-page>
contradictions: 0
---
```

## 9. Close-out: run `/wiki-graph-audit`

Invoke `/wiki-graph-audit <vault-path>` and display the results. If violations are found, offer auto-fix per category (the audit skill handles the prompting). Do NOT skip this step — it's the contract's verifier.

## 10. Report back

Short summary:
- Source name
- Pages created (with folder paths)
- Pages updated
- Contradictions flagged (count)
- Audit result (clean / N violations)

## Invariant (§4.5.7)

What this skill produces must equal what a hand-placement following §4.5.1–§4.5.4 produces. If they diverge, the skill is wrong — fix the skill, not the placement.

## Shared contract reference (sync table)

This skill and `/wiki-graph-audit` enforce the same §4.5 contract from opposite directions (generator vs. verifier). The shared logic lives in three places that must change together:

| Concept | Canonical source | Generator reference | Verifier reference |
|---|---|---|---|
| Pre-flight (drift, duplicate, stray scans) | This skill §0 + `/wiki-graph-audit` §0 (identical) | This skill §0.1–§0.5 | `/wiki-graph-audit` §0.1–§0.5 |
| Type → folder routing | `vault/CLAUDE.md` §4.5.1 | This skill §3 | `/wiki-graph-audit` §Category 1 |
| Frontmatter required fields | `vault/CLAUDE.md` §4.5.2 | This skill §4 | `/wiki-graph-audit` §Category 2 |
| Tag vocabulary (closed sets) | `vault/CLAUDE.md` §4.5.3 | This skill §4 | `/wiki-graph-audit` §Category 2 |
| Scope tag selection | `vault/CLAUDE.md` §4.5.3 | This skill §4 "Scope tag selection" | `/wiki-graph-audit` §Category 2 auto-fix bullet |
| Filename convention | `vault/CLAUDE.md` §4.5.4 | This skill §4 "Filename rule" | `/wiki-graph-audit` §"NOT violations" + §Category 4 |
| Tag-style filename rules NOT enforced (emoji, casing) | `vault/CLAUDE.md` §4.5.4 (Q26/Q27) | This skill §4 (preserved) | `/wiki-graph-audit` §"NOT violations" |

**Change-coupling rule:** any edit to a row's "canonical source" must be reflected in both the generator and verifier references in the same change. Three places, one truth.

---

## 11. Backfill mode (`--backfill`)

Sweep the vault for pages missing required §4.5.2 frontmatter and offer per-field fixes. Read-only until the user confirms each fix.

### 11.1 Sweep

For every `.md` under `<vault-path>/wiki/`:
- Parse YAML frontmatter (delimited by `---`). On parse failure, report file path + raw error and continue.
- Check required fields per §4.5.2:
  - `type:` present and one of the closed-set values (§4.5.2)
  - `sources:` present (empty list `[]` allowed)
  - `updated:` present and matches `^\d{4}-\d{2}-\d{2}$`
  - `tags:` present with at least one `status/*` AND at least one `scope/*`

### 11.2 Report grouped by violation type

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WIKI-INGEST BACKFILL — <vault-path>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Missing 'tags:' — <N> files
  • wiki/patterns/entity-pattern.md

📋 Missing 'status/*' tag — <N> files
  • wiki/architecture/foo.md (has tags but no status/)

📋 Missing 'scope/*' tag — <N> files
  • wiki/meta/bar.md

📋 Missing 'updated:' — <N> files
  • wiki/runbooks/baz.md

📋 Missing 'sources:' — <N> files
  • wiki/api/qux.md

📋 Invalid 'type:' (not in closed set) — <N> files
  • wiki/patterns/legacy.md — has type: "schema" (closest match: "pattern"?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 11.3 Per-category fix prompt

For each fixable category, prompt:

```
Category: missing 'tags:' — <N> files
Auto-fix? (yes / no / show-each)
```

**Auto-fix rules (apply only on `yes`):**
- Missing `tags:` → add block with `status/active` + inferred `scope/*` (per §4.5.3 — `scope/vision` for ISCI-Vision-Vault, or a finer scope per `meta/scopes.md`; prompt user if ambiguous)
- Missing `status/*` → add `status/draft` (safest default; user can promote to `active` later)
- Missing `scope/*` → infer from vault path; prompt if ambiguous
- Missing `updated:` → set to today's date
- Missing `sources:` → set to `[]` and flag for manual review (cannot infer source from content)
- Invalid `type:` → cannot auto-fix safely; report with closest-match suggestion, leave for manual edit

**`show-each` mode:** prompt per-file before applying that file's fix.

### 11.4 Multi-stage migration safeguard ([[multi-stage-migration-pitfalls#AP-WF-1]])

Backfill never moves files — only edits frontmatter in place. No `mv` → no Edit-cache invalidation risk. If a backfill exposes a folder/type mismatch, report it but do NOT auto-fix (that's a `--route-all` job).

### 11.5 Re-hash and report

After all fixes, re-capture the vault state hash (§0.3) and emit summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BACKFILL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Fixed:               <N>
 Skipped:             <N>
 Manual review:       <N>  (invalid types, ambiguous scopes)
 Vault hash change:   <old> → <new>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Recommend re-running `/wiki-graph-audit` to confirm clean state.

---

## 12. Route-all mode (`--route-all`)

Bulk-migrate every loose `.md` into its correct folder by `type:`. The reference implementation for this mode is the 22-file manual migration performed in the §4.5 contract plan Phase 1b Tasks 7–9 (see [[wiki-graph-shape-contract]]).

### 12.1 Input set

The pre-flight stray-file scan (§0.5) produces the input set:
- All `.md` at `<vault-path>/` root except `CLAUDE.md`
- All `.md` at `<vault-path>/wiki/` root except `index.md`

If the input set is empty, emit `✅ No loose files — vault structure clean.` and exit.

### 12.2 Per-file routing decision

For each file in the input set:

1. **Read frontmatter.** If absent, prompt: "No frontmatter. Add minimal frontmatter and route by inferred type? (yes / skip / abort)"
2. **Determine `type:`.** Use the file's frontmatter `type:` if present and valid. If invalid or missing, propose a `type:` based on filename + first H1 + content scan, present to user for confirmation.
3. **Determine target folder.** Apply the §4.5.1 routing table (same as §3 in normal mode).
4. **Duplicate basename check (§0.4).** If the target filename already exists in the target folder OR anywhere else in the vault → prompt collision resolution (keep / overwrite / rename / merge / skip).

### 12.3 Report routing plan BEFORE moving anything

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ROUTE-ALL PLAN — <N> files
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ Clean route:    <N>
 ⚠️  Needs decision: <N>
 ❌ Collisions:     <N>

  vault/foo.md          → wiki/patterns/foo.md           [type: pattern]
  wiki/bar.md           → wiki/architecture/bar.md       [type: architecture]
  wiki/baz.md           → wiki/retrospectives/baz.md     [type: retrospective; needs frontmatter add]
  vault/dup-name.md     → COLLISION with wiki/patterns/dup-name.md [needs decision]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceed with route-all? (yes / show-each / abort)
```

### 12.4 Execute (multi-stage safeguard against [[multi-stage-migration-pitfalls#AP-WF-1]])

The critical sequencing — encoded to prevent the Edit-cache `mv` bug:

1. **Stage A — Moves only.** `mv` all files into target folders. No frontmatter edits yet.
2. **Stage B — Read-batch at new paths.** Read every moved file at its new path (parallel batch). This primes the Edit cache for the new paths.
3. **Stage C — Frontmatter edits.** Apply tag backfills, type normalizations, missing-field additions (per §11 rules). Parallel batch.
4. **Stage D — State hash re-check (§0.3).** Confirm no external drift during the run.
5. **Stage E — Index regenerate.** Update `<vault-path>/wiki/index.md` with folder-grouped sections listing every routed file.

If Stage D detects drift, halt and prompt: "External agent modified vault during route-all. Roll back? (yes / merge / keep changes)". Roll-back uses the Stage A `mv` list reversed.

### 12.5 Close-out

After Stage E:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ROUTE-ALL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Routed:              <N>
 Collisions resolved: <N>
 Index updated:       yes
 Vault hash change:   <old> → <new>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then run `/wiki-graph-audit <vault-path>` for final verification.

---

**Next:** Done. Or `/wiki-graph-audit` for an additional sweep, or `/wiki-ingest` for the next source.
