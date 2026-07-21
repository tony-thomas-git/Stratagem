---
name: wiki-graph-audit
description: Wiki Graph Audit - Verifier skill that sweeps a Stratagem Wiki vault for §4.5 contract violations and offers per-category auto-fix
argument-hint: "<vault-path> [--category <name>]"
---

# Wiki Graph Audit

**Purpose:** The verifier half of the §4.5 vault-shape contract. Read-only sweep over `<vault-path>/wiki/`, reports violations grouped by category, then offers per-category auto-fix.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ WIKI-GRAPH-AUDIT MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Vault: [vault-path from $ARGUMENTS]
 Filter: [--category value or "all"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Argument parsing

- `<vault-path>` — absolute path to the wiki vault root. REQUIRED.
- `--category <name>` — restrict audit to one category. Optional. Valid values: `folder-mismatch`, `frontmatter`, `orphans`, `duplicates`, `broken-links`.

## Pre-flight

> **Sync note:** §0.1–§0.5 mirror `/wiki-ingest` §0.1–§0.5 step-for-step. The two skills share this block by design — any change here must be applied to `/wiki-ingest` SKILL.md §0 in the same edit. **Single source of truth: this block + `/wiki-ingest` §0.**

### 0.1 Schema present

Confirm `<vault-path>/CLAUDE.md` exists and contains `## 4.5 Folder & graph shape (binding)`. If not, HALT — vault doesn't have the contract to audit against.

### 0.2 Folder structure

Confirm `<vault-path>/wiki/` exists. If not, HALT. Do NOT create folders here — the audit is read-only; absent folders are themselves a finding (report and continue with whatever exists).

### 0.3 Vault state hash (drift detection — informational for audit)

Capture a snapshot hash of all `.md` files in the vault at skill entry. Hold in memory for the duration of the run.

```bash
find "<vault-path>" -name "*.md" -printf "%T@ %s %p\n" | sort | sha256sum
```

(Path + mtime + size, deterministic order, single hash.)

**Re-check at end of run:** if the hash has changed since entry (e.g., a concurrent agent modified the vault during the audit), emit a `⚠️ DRIFT DETECTED` warning in the final report. The audit does NOT halt on drift — it's read-only — but the warning tells the user that some violations may be stale. Asymmetric from `/wiki-ingest`'s §0.3, which halts: see [[multi-stage-migration-pitfalls#AP-WF-2]] for the rationale.

### 0.4 Duplicate basename scan

This is also Category 4 below — the pre-flight version is identical detection logic, surfaced early so a user running a partial-category audit (`--category folder-mismatch`) still sees duplicate warnings. If duplicates exist, emit a banner before the main report:

```
⚠️  DUPLICATE FILENAMES DETECTED — N collisions (see Category 4 below)
```

### 0.5 Stray-file scan

Sweep `<vault-path>/` root and `<vault-path>/wiki/` root for loose `.md` files that should be in folders.

- `vault/` root: only `CLAUDE.md` is allowed.
- `wiki/` root: only `index.md` is allowed.

Stray files are reported as part of Category 1 (folder-mismatch) with a special "**stray**" sub-label, so they appear in the same auto-fix bucket as misplaced files. Pre-flight surfaces a count:

```
⚠️  STRAY FILES — N at vault root, M at wiki/ root (see Category 1)
```

## Violation categories

> **Sync note:** Categories 1 and 2 below are derived from the §4.5 contract in `vault/CLAUDE.md`. The same routing and frontmatter rules are encoded in `/wiki-ingest` SKILL.md §3 (routing) and §4 (frontmatter generation). **Change-coupling:** any edit to the routing table or frontmatter spec must update `vault/CLAUDE.md §4.5.1/§4.5.2` + `/wiki-ingest` SKILL.md §3/§4 + this section in the same change. Three places, one truth.

### Category 1: `folder-mismatch` (page in wrong folder for its `type:`)

**Rule:** Per §4.5.1 routing table:

| `type:` | Must live in |
|---|---|
| `architecture`, `concept` | `wiki/architecture/` |
| `pattern`, `entity` | `wiki/patterns/` |
| `anti-pattern` | `wiki/anti-patterns/` |
| `retrospective` | `wiki/retrospectives/` |
| `decision` | `wiki/decisions/` |
| `plan` | `wiki/plans/` |
| `runbook` | `wiki/runbooks/` |
| `api` | `wiki/api/` |
| `summary`, `meta` | `wiki/meta/` |
| `comparison` | `wiki/architecture/` OR `wiki/patterns/` (either valid) |
| `index` | `wiki/` root for the single `index.md` only; other indexes live in `wiki/meta/` |

**Detection:** Parse frontmatter `type:` of each `.md` file in `wiki/**`. Compare path against the allowed folder for that type.

**Auto-fix:** Move the file to the correct folder. Filename preserved. No link rewrites needed (Obsidian shortest-match).

### Category 2: `frontmatter` (missing or invalid required fields)

**Rules** (§4.5.2):
- `type:` present and one of the closed-set values (`architecture | pattern | anti-pattern | retrospective | decision | plan | runbook | api | concept | entity | comparison | summary | index | meta`)
- `sources:` present (empty list `[]` allowed)
- `updated:` present and matches `^\d{4}-\d{2}-\d{2}$`
- `tags:` present
  - At least one `status/*` tag (exactly one of `active`, `draft`, `superseded`)
  - At least one `scope/*` tag (value(s) from the vault's `meta/scopes.md` — e.g. `build`, `app`, `storage`, `meta`)
- Optional axes (`pattern-family/*`, `layer/*`) — if present, values must be from the closed set

**Detection:** YAML frontmatter delimited by `---`. Parse and validate against rules. On parse failure, report file path with raw error.

**Auto-fix:**
- Missing `updated:` → set to today's date
- Missing `sources:` → set to `[]` and flag for manual review
- Missing `status/*` → add `status/draft` (safest)
- Missing `scope/*` → infer from vault: `scope/<your-project>` per the vault's `meta/scopes.md` (or a finer `scope/*` for a sub-area); prompt user if ambiguous
- Invalid `type:` → cannot auto-fix; report only

### Category 3: `orphans` (no inbound or outbound `[[wikilink]]`)

**Rule:** Every wiki page should be linked from at least one other page (inbound) OR link to at least one other page (outbound). Pages with `type: index` are exempt (they're hubs). Pages with `status/draft` are exempt (stub mode per §4.5.6).

**Detection:**
1. Build a link graph: for each `.md`, extract `[[targets]]`.
2. Compute inbound count per file and outbound count per file.
3. Files with `inbound = 0 AND outbound = 0 AND type != index AND status/draft NOT present` are orphans.

**Auto-fix:** Cannot auto-fix safely — orphans need editorial decisions. Report only, with a suggested action ("link from `wiki/index.md`?" or "delete?"). Show the file's `type:` and tags so the user can decide.

### Category 4: `duplicates` (filename collision)

**Rule (§4.5.4):** Filename uniqueness across the entire vault is required — Obsidian's shortest-match resolution depends on it. Two files named `entity-pattern.md` in different folders is a violation.

**Detection:** Collect all `.md` basenames under `wiki/**`. Group by basename. Any group with count > 1 is a violation.

**Auto-fix:** Cannot auto-fix safely — the right rename requires knowing the content. Report only, list all colliding paths.

### Category 5: `broken-links` (`[[wikilink]]` target doesn't exist)

**Rule:** Every `[[target]]` reference should resolve to a real `.md` file in `wiki/**`. EXCEPTION: forward-link gaps are allowed and rendered as faded nodes by Obsidian (`hideUnresolved: false`). The audit reports them as "forward-link gaps" (informational), NOT as violations.

**Detection:**
1. Build the set of all wiki page basenames (without `.md`).
2. For each `[[target]]` in each page, check if `target` (basename, ignoring `#anchor` and `|alias`) matches any page basename.
3. Targets that don't match → "forward-link gaps" — informational, never violations.

**Auto-fix:** For genuine broken links (currently none — all unresolved targets are valid forward-links per `hideUnresolved: false`), no fix offered. The category exists for future-proofing; current contract treats all unresolved as intentional gaps. The audit lists them as "forward-link gaps" with their source page so the user can decide whether to create them via `/wiki-ingest --stub`.

## NOT violations (per overrides Q26, Q27)

- Emoji in filenames — allowed per §4.5.4 (preserve-source is valid)
- PascalCase, snake_case, **lowercase-kebab**, etc. — no enforced convention per §4.5.4 (counterpart nodes conventionally use kebab + gold-doc name in `sources:`, but the audit flags none of these)
- Empty `Untitled.canvas` or other non-`.md` files at vault root — out of scope

## Output format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WIKI-GRAPH-AUDIT REPORT — <vault-path>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 folder-mismatch — <N> violations
  • wiki/patterns/v2-architecture.md (type: architecture → should be in wiki/architecture/)
  • wiki/meta/anti-patterns.md (type: anti-pattern → should be in wiki/anti-patterns/)

📋 frontmatter — <N> violations
  • wiki/patterns/entity-pattern.md — missing tags: status/*
  • wiki/architecture/schema-pipeline.md — invalid type: "schema" (not in vocabulary)

🌀 orphans — <N> pages
  • wiki/meta/contradictions.md (type: meta, status/active) — suggest: link from wiki/index.md

🔁 duplicates — <N> collisions
  • entity-pattern.md appears in: wiki/patterns/, wiki/architecture/

🔗 forward-link gaps (informational, not violations) — <N>
  • [[navrail-pattern]] in wiki/index.md
  • [[breadcrumb-trail-pattern]] in wiki/index.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TOTAL: <X> violations across <Y> categories
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If vault state hash changed between §0.3 entry and final report, append:

```
⚠️  DRIFT DETECTED — vault state hash changed during audit
   Some violations above may be stale. Re-run /wiki-graph-audit to verify.
```

If 0 violations and no drift: `✅ WIKI-GRAPH-AUDIT — 0 violations. Contract upheld.`

## Auto-fix prompt (per Q33, Q36)

After the report, for each category that has fixable violations:

```
Category: folder-mismatch — <N> auto-fixable.
Auto-fix? (yes / no / show-each)
```

- `yes` → apply all fixes in this category. Report each move.
- `no` → skip; move to next category.
- `show-each` → prompt per-file before applying.

Categories `orphans`, `duplicates`, and `broken-links` cannot be auto-fixed safely — skip the prompt for those.

After all categories processed, emit a final summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUTO-FIX SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Fixed: <N>
 Skipped: <N>
 Manual review needed: <N>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Invariant (§4.5.7)

If `/wiki-ingest` produced any of the violations being reported, the skill is broken — file it as a bug and fix `/wiki-ingest`, not the page. The audit is also a regression test for the generator.

---

## Shared contract reference (sync table)

This skill and `/wiki-ingest` enforce the same §4.5 contract from opposite directions (generator vs. verifier). The shared logic lives in three places that must change together:

| Concept | Canonical source | Generator reference | Verifier reference |
|---|---|---|---|
| Pre-flight (drift, duplicate, stray scans) | This skill §0 + `/wiki-ingest` §0 (identical) | `/wiki-ingest` §0.1–§0.5 | This skill §0.1–§0.5 |
| Type → folder routing | `vault/CLAUDE.md` §4.5.1 | `/wiki-ingest` §3 | This skill §Category 1 |
| Frontmatter required fields | `vault/CLAUDE.md` §4.5.2 | `/wiki-ingest` §4 | This skill §Category 2 |
| Tag vocabulary (closed sets) | `vault/CLAUDE.md` §4.5.3 | `/wiki-ingest` §4 | This skill §Category 2 |
| Scope tag selection | `vault/CLAUDE.md` §4.5.3 | `/wiki-ingest` §4 "Scope tag selection" | This skill §Category 2 auto-fix bullet |
| Filename convention | `vault/CLAUDE.md` §4.5.4 | `/wiki-ingest` §4 "Filename rule" | This skill §"NOT violations" + §Category 4 |
| Tag-style filename rules NOT enforced (emoji, casing) | `vault/CLAUDE.md` §4.5.4 (Q26/Q27) | `/wiki-ingest` (preserved by §4) | This skill §"NOT violations" |

**Change-coupling rule:** any edit to a row's "canonical source" must be reflected in both the generator and verifier references in the same change. Three places, one truth.

**Next:** Done. Re-run `/wiki-graph-audit` to confirm fixes if any were applied.
