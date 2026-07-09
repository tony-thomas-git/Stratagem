---
name: rs
description: Retrospective Summary - Extract learnings from a completed plan OR the ad-hoc Bug-Hunt Runbook and apply updates to the wiki / gold docs
argument-hint: "plan file name or runbook"
---

# RS (Retrospective Summary)

**Purpose:** Extract learnings from a completed plan **or the ad-hoc Bug-Hunt Runbook**, generate exact wiki / gold-doc proposals, show them, and apply inline.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ RS (Retrospective Summary) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Source Analysis (completed plan file OR the ad-hoc Bug-Hunt Runbook):**
   - **Determine the source.** If `$ARGUMENTS` names a plan file (`docs/plans/*_plan.md`) → **plan mode**. If it names / resolves to the **Bug-Hunt Runbook** (`…\<project>-Docs\🐛Bug-Hunt-Runbook.md`) → **runbook-harvest mode**.
   - **Plan mode:**
     - Read the completed plan file
     - Extract all Error [N] and Refinement [N] entries
     - Identify implementation patterns used
     - Count total fixes (>3 signals meaningful gold standard gaps)
     - Read `### PICA Log` table and emit summary:
       ```
       PICA EFFECTIVENESS — [feature name]
       Runs: [N] | Issues found: [X] | Follow-ups generated: [Y]
       Hot patterns: [list any pattern with issues > 0]
       Verdict: [EARNING ITS PLACE / CLEAN RUN — consider value vs. overhead]
       ```
   - **Runbook-harvest mode:**
     - Read the runbook. Extract **only un-stamped** entries — every `BUG-###` / `FEAT-###` (and resolved Error Log items), plus new Anti-Pattern Blacklist / Hot-Spot Map rows, that do **NOT** carry an `**Ingested:**` line.
     - **Stamped entries are already drained — SKIP them** (this is the idempotency contract; never re-ingest a stamped entry).
     - Treat each un-stamped entry as one learning to categorize (step 2) and route to the wiki (steps 4–6). If there are zero un-stamped entries, report "runbook already drained" and stop.

2. **Learning Categorization:**
   - **Critical Patterns:** Must-have for future implementations
   - **Bug Patterns to Avoid:** Pitfalls discovered during implementation
   - **Configuration Optimizations:** Best practice values found
   - **UX Enhancements:** Improvements beyond original spec

3. **Wiki vault discovery (NEW — §4.5 contract):**
   - Resolve the active project's vault as `<project-root>\Vault` — the `Vault\` folder at the git root of the plan file's working directory.
   - **If that `Vault\` folder exists:** wiki vault path is known → route new pages through `/wiki-ingest` in step 5.
   - **If it does not exist:** preserve existing behavior — write to `docs/patterns/*`.

4. **Gold Standard Discovery:**
   - If wiki vault path resolved in step 3: gold docs are wiki pages under `<vault-path>/wiki/`.
   - Else: search for all gold docs at `docs/patterns/*`.
   - Map each learning to the most relevant doc(s)

5. **Proposal Generation:**
   - For each relevant gold doc, generate exact changes
   - Read 5-10 existing entries in the target section to match style
   - Size limits: checklist item 1 line, warning 1-2 lines, code 3-5 lines
   - Display all proposals before touching any file:
     ```
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      GOLD STANDARD PROPOSALS — [N] changes across [M] files
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      📄 [filename] — [section]
        + [exact text that would be added]
        - [exact text that would be removed, if any]
      [repeat per file]
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Apply [N] proposals to gold docs? (yes / no)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ```
   - Wait for user response before proceeding

6. **Apply (if yes):**
   - **If wiki vault path resolved (step 3):** For each new page, invoke `/wiki-ingest <vault-path> <topic-or-source>` — it places the page in the correct folder with valid frontmatter per §4.5. For updates to existing wiki pages, edit directly (they're already routed).
   - **MANDATORY — invoke `/wiki-ingest` for new pages; do NOT author them with `Write`/`Edit`.** Beyond placement + frontmatter, `/wiki-ingest` performs the vault's ingest logging (vault `CLAUDE.md` §7 — append to `logs/CHANGELOG.md` + `logs/ingest-log.md`); a direct write silently skips it (the [[literal-skill-composition]] anti-pattern, generalized to tool substitution). If you author directly anyway, you OWE that §7 log append yourself.
   - **MANDATORY LOGGING — EVERY vault change is logged to `logs/CHANGELOG.md`, no exceptions.** Any create OR edit under the vault root (new page, edited existing page, frontmatter-only bump, structural version/link correction) REQUIRES a `logs/CHANGELOG.md` append per vault `CLAUDE.md` §6 (newest-first; `Source: N/A` for structural changes with no `raw/` source). There is **no "wiki docs only — skip the changelog" option** — never offer it in the step-5 proposal, and a vault edit without a matching CHANGELOG entry is INCOMPLETE. New pages via `/wiki-ingest` log automatically; **direct edits to existing pages you MUST log yourself.** *(Change-coupled: mirror any edit to this rule in both /rs and /crs step 6.)*
   - **Else:** Apply all proposals to gold docs at `docs/patterns/*`.
   - Match existing style exactly
   - Leave all changes uncommitted
   - **Runbook-harvest write-back (runbook mode only) — idempotency:** after an entry's learning is ingested into the wiki, append to that entry **in the runbook**: `**Ingested:** {today YYYY-MM-DD} → wiki/<folder>/<page>.md`. A future `/rs` skips stamped entries (step 1). If the active logs are large, instead **move** the stamped entry to the runbook's `## Archive (ingested)` section. Never delete an entry outright — the stamp/archive IS the provenance trail.
   - **D-5 counterpart refresh (gold-doc-scoped) — guard block (byte-identical with /crs step 6):**
     <!-- D-5-GUARD-START -->
     - **Trigger:** whenever this step *updates a gold doc* (canon under `<project>-docs/patterns/`) that has a vault counterpart whose `sources:` resolves to that gold doc's live path, re-render the counterpart in the **same operation** by invoking `/wiki-ingest <vault-path> <live-gold-doc-path>` — the counterpart's `sources:` lets `/wiki-ingest` §2 auto-detect and UPDATE the page in place (no duplicate).
     - **Scope (do not skip):** counterpart `sources:` are mixed. Fire **only** when `sources:` resolves to a gold-doc path under `<project>-docs/patterns/`. **Skip** when the gold doc has no counterpart yet (normal new-create) **or** when the counterpart's `sources:` points at a **plan** (`plans/...`) — plan-sourced nodes have no gold-doc parent to re-render from and are NOT D-5-eligible.
     - **Content-delta guard:** before firing the re-render, judge whether the update changes content the *counterpart surfaces* (summary blockquote, `[[links]]`, focused/mirrored sections) vs. pure-ledger detail it does not (verbose EX logs, dated cycle history). **Re-render** on summary / boundary / cross-link / mirrored-section change. **Skip** on ledger-only append, logging the skip to `<vault-path>/logs/CHANGELOG.md` as: `D-5 SKIP — <gold-doc> updated (ledger-only: <reason>); counterpart unchanged`.
     <!-- D-5-GUARD-END -->
     > **Sync note:** This content-delta guard is mirrored in /crs step 6. **Change-coupling:** any edit to the guard's re-render/skip criteria must be applied to both /rs and /crs SKILL.md step 6 in the same change. One asymmetry: /rs reads a completed plan file; /crs reads the active conversation — the guard logic is identical, only the trigger source differs.

7. **Wiki audit close-out (NEW — §4.5.6):**
   - If wiki vault path was used in step 6, invoke `/wiki-graph-audit <vault-path>` to verify §4.5 compliance.
   - The audit reports violations grouped by category. If any are found, it prompts per-category auto-fix.
   - User decides whether to apply auto-fixes. Do not block close-out on findings.
   - If no wiki vault was used, skip this step.

8. **Retrospective Log:**
   - Write record to `docs/plans/{feature_name}_{unique_id}_retrospective.html`
   - **Format — HTML.** The retrospective log is a standalone, human-read, write-once review document. Author it as `.html`: HTML chassis for layout (sections, tables of learnings/proposals), SVG only where a diagram beats prose. Prefer simplicity — HTML earns its place only where layout helps. (This is the LOG only. The gold-doc updates in steps 5–6 are a separate concern and remain `.md` — those are AI-consumed canon, out of scope for this format change.)
   - Include: learnings extracted, proposals generated, whether applied, wiki vault used (yes/no + path), audit result (clean / N violations / N fixed)
   - **counterpart(s) re-rendered (D-5):** list any gold docs whose vault counterpart was re-rendered this run, or "none"

**Next:** `/cf` — if not already complete, or done

