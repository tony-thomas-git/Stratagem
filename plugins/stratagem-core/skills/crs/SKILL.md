---
name: crs
description: Conversation Retrospective - Extract learnings from the active chat session and apply updates to gold standard docs
argument-hint: "optional topic label"
---

# CRS (Conversation Retrospective Summary)

**Purpose:** Extract learnings, decisions, and patterns from any conversation and apply them to gold standard docs inline — the RS pattern applied without a plan file.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ CRS (Conversation Retrospective) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Topic: [show $ARGUMENTS or "inferred from conversation"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Conversation Mining:**
   - Scan the entire current chat session
   - Extract evidence, assigned as Evidence [N]:
     - **Decisions Made:** Architectural, workflow, or design choices resolved
     - **Patterns Discovered:** Techniques or conventions that emerged or were validated
     - **Directions Rejected:** Approaches discarded — and why
     - **Insights Surfaced:** Non-obvious observations about tools, systems, or processes
     - **Open Questions:** Unresolved items for future investigation
   - If conversation was purely transactional with no decisions or discoveries, note this and stop

2. **Learning Categorization:**
   - **Critical Patterns:** Must-have for future implementations or configurations
   - **Workflow Enhancements:** Improvements to skill design, orchestration, or process
   - **Anti-Patterns to Avoid:** Pitfalls identified during conversation
   - **Open Items:** Questions worth revisiting in a future session

3. **Wiki vault discovery (NEW — §4.5 contract):**
   - Resolve the active project's vault as `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory.
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
   - **If wiki vault path resolved (step 3):** For each new page, invoke `/wiki-ingest <vault-path> <topic-label>` — it places the page in the correct folder with valid frontmatter per §4.5. For updates to existing wiki pages, edit directly.
   - **MANDATORY — invoke `/wiki-ingest` for new pages; do NOT author them with `Write`/`Edit`.** Beyond placement + frontmatter, `/wiki-ingest` performs the vault's ingest logging (vault `CLAUDE.md` §7 — append to `logs/CHANGELOG.md` + `logs/ingest-log.md`); a direct write silently skips it (the [[literal-skill-composition]] anti-pattern, generalized to tool substitution). If you author directly anyway, you OWE that §7 log append yourself.
   - **MANDATORY LOGGING — EVERY vault change is logged to `logs/CHANGELOG.md`, no exceptions.** Any create OR edit under the vault root (new page, edited existing page, frontmatter-only bump, structural version/link correction) REQUIRES a `logs/CHANGELOG.md` append per vault `CLAUDE.md` §6 (newest-first; `Source: N/A` for structural changes with no `raw/` source). There is **no "wiki docs only — skip the changelog" option** — never offer it in the step-5 proposal, and a vault edit without a matching CHANGELOG entry is INCOMPLETE. New pages via `/wiki-ingest` log automatically; **direct edits to existing pages you MUST log yourself.** *(Change-coupled: mirror any edit to this rule in both /rs and /crs step 6.)*
   - **Else:** Apply all proposals to gold docs at `docs/patterns/*`.
   - Match existing style exactly
   - Leave all changes uncommitted
   - **D-5 counterpart refresh (gold-doc-scoped) — guard block (byte-identical with /rs step 6):**
     <!-- D-5-GUARD-START -->
     - **Trigger:** whenever this step *updates a gold doc* (canon under `<project>-docs/patterns/`) that has a vault counterpart whose `sources:` resolves to that gold doc's live path, re-render the counterpart in the **same operation** by invoking `/wiki-ingest <vault-path> <live-gold-doc-path>` — the counterpart's `sources:` lets `/wiki-ingest` §2 auto-detect and UPDATE the page in place (no duplicate).
     - **Scope (do not skip):** counterpart `sources:` are mixed. Fire **only** when `sources:` resolves to a gold-doc path under `<project>-docs/patterns/`. **Skip** when the gold doc has no counterpart yet (normal new-create) **or** when the counterpart's `sources:` points at a **plan** (`plans/...`) — plan-sourced nodes have no gold-doc parent to re-render from and are NOT D-5-eligible.
     - **Content-delta guard:** before firing the re-render, judge whether the update changes content the *counterpart surfaces* (summary blockquote, `[[links]]`, focused/mirrored sections) vs. pure-ledger detail it does not (verbose EX logs, dated cycle history). **Re-render** on summary / boundary / cross-link / mirrored-section change. **Skip** on ledger-only append, logging the skip to `<vault-path>/logs/CHANGELOG.md` as: `D-5 SKIP — <gold-doc> updated (ledger-only: <reason>); counterpart unchanged`.
     <!-- D-5-GUARD-END -->
     > **Sync note:** This content-delta guard is mirrored in /rs step 6. **Change-coupling:** any edit to the guard's re-render/skip criteria must be applied to both /rs and /crs SKILL.md step 6 in the same change. One asymmetry: /rs reads a completed plan file; /crs reads the active conversation — the guard logic is identical, only the trigger source differs.

7. **Wiki audit close-out (NEW — §4.5.6):**
   - If wiki vault path was used in step 6, invoke `/wiki-graph-audit <vault-path>` to verify §4.5 compliance.
   - The audit reports violations grouped by category. If any are found, it prompts per-category auto-fix.
   - User decides whether to apply auto-fixes. Do not block close-out on findings.
   - If no wiki vault was used, skip this step.

8. **Retrospective Log:**
   - Save to `docs/plans/conversation_{topic_label}_{unique_id}_retrospective.html`
   - **Format — HTML.** The retrospective log is a standalone, human-read, write-once review document. Author it as `.html`: HTML chassis for layout (sections, tables of decisions/patterns/insights), SVG only where a diagram beats prose. Prefer simplicity — HTML earns its place only where layout helps. (This is the LOG only. The gold-doc updates in steps 5–6 remain `.md` — AI-consumed canon, owned by the wiki process, out of scope for this format change.)
   - If no project context, save to the active project's `Plans\` directory (the `Plans\` folder at the git root of CWD)
   - Include: wiki vault used (yes/no + path), audit result (clean / N violations / N fixed)
   - **counterpart(s) re-rendered (D-5):** list any gold docs whose vault counterpart was re-rendered this run, or "none"

**When to use `/crs` vs `/rs`:**
- `/rs` — After a formal PF→AX→CF cycle; input is the plan file with Error/Refinement logs
- `/crs` — After any valuable conversation: config work, architectural discussions, debugging, skill design

**Next:** done

