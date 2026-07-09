---
name: ax
description: Authorize Execution - Implement the planned task exactly as specified
argument-hint: "task reference or instructions"
---

# AX (Authorize Execution)

**Purpose:** Implement the planned task exactly as specified in PX plan.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ AX (Authorize Execution) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Pre-Execution:**
   - Read the specific task from plan file
   - Review the PX implementation strategy
   - **Board-adapter seam (neutral, presence-checked):** if a board adapter is configured for this run AND the task line carries a `Sync-Id:` marker, notify the adapter that this task is starting (mark in-progress) before implementation. Presence-checked — with no adapter configured this is a silent no-op. Core names no external system; it signals a generic lifecycle event only.

   **★ CORPUS-READ-FIRST (check the corpus before context7):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   For AX specifically: check `<vault>/raw/library-docs/` for already-captured docs of the libraries this task touches before calling context7. Context7 fires only for libraries the corpus doesn't already cover (fetch-once-cache-forever). Then:
   - **MANDATORY — Context7 Doc Injection:** Before writing any code, resolve current documentation for every library being used:
     1. Call `resolve-library-id` with the library name to get its context7-compatible ID
     2. Call `get-library-docs` with that ID to inject live API docs into context
     3. Generate code against retrieved docs — not training-time assumptions
     - Apply this to every library touched in the task (Castle.Windsor, CommunityToolkit.Mvvm, Microsoft.ML.OnnxRuntime, OpenCV, etc.)

2. **Implementation Rules:**
   - Follow PX plan exactly - NO deviations without approval
   - Follow established patterns and conventions
   - Use appropriate frameworks and libraries
   - Follow established naming conventions

   **YAGNI Implementation Checkpoint:**
   - [ ] **Component Count Justification**: Can I explain why each component is necessary?
   - [ ] **Parameter Utilization**: Am I using defaults instead of variants where appropriate?
   - [ ] **Logic Consolidation**: Is business logic happening in exactly one place per logical unit?
   - [ ] **Code Duplication Scan**: Am I about to write the same logic twice?

3. **File Operations:**
   - Create new files as planned
   - Modify existing files as specified
   - Update configuration files
   - Add corresponding test files
   - **Verify scope without git:** when editing files outside a git repo (e.g. `~/.claude/skills/`), snapshot before editing (`cp f f.bak`), then `diff f.bak f` after and remove the `.bak` — substitutes the unavailable `git diff` "touches only X" acceptance gate.
   - **Script artifacts:** for executable scripts (e.g. a Workflow `.js`), add `node --check <file>` as a syntax gate alongside the diff — proves it parses before it's trusted to run.

   **Code Quality Validation:**
   - [ ] **Pattern Consistency**: Does this match established patterns in the codebase?
   - [ ] **Minimal Interface**: Is this the smallest API that solves the problem?
   - [ ] **Clear Responsibility**: Does each component have a single, obvious purpose?
   - [ ] **Maintenance Burden**: Will this be easy to maintain and extend?

4. **Task Completion:**
   - Update plan file: Move completed task to "Completed Tasks" section
   - Check off task with timestamp
   - Leave all changes uncommitted

5. **Implementation Summary:** Display this block:

   **IMPLEMENTATION SUMMARY**

   What was done:
   [2-3 sentences: what changed and why]

   Files changed:
   [list created/modified files]

   How to test:
   [Concrete steps: URLs, commands, UI actions, or API calls to verify the implementation]

   What's next:
   [1-3 bullets: next task(s) or phase in the plan, and any dependencies or blockers to be aware of]

6. **Post-Implementation Compliance Audit:**
   - Identify the pattern just implemented
   - Run the `/pica` compliance dimensions (the pica skill is the single source of truth) against the Layer-5 `.cs/.xaml` files touched + their sibling files. Native C++ below the interop seam is out of scope.
   - Emit:
     ```
     COMPLIANCE AUDIT: [Pattern Name]
     Audited: [N] files
     Compliant: [X] | Need Alignment: [Y]
     [If Y > 0: filename — specific discrepancy]
     ```
   - If non-compliant files found: add follow-up task to plan file before proceeding
   - Append one row to `### PICA Log` in the plan file:
     `| T[task#] | [pattern] | [N audited] | [N issues] | [follow-up added / —] |`

**Next:** `/px` — analyze the next task, or `/cf` if all tasks are complete