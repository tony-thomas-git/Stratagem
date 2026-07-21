---
name: max
description: Memory Authorize Execute - Execute the in-memory plan from mPX mode
argument-hint: "optional instructions"
---

# MAX (Memory Authorize Execute)

**Purpose:** Execute the in-memory plan from mPX mode.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ MAX (Memory Authorize Execute) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Pre-Execution:**
   - Retrieve mPX plan from conversation memory

   **★ CORPUS-READ-FIRST (check the corpus before context7):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   - **MANDATORY — Context7 Doc Injection:** Before writing any code, resolve current documentation for every library being used:
     1. Call `resolve-library-id` with the library name to get its context7-compatible ID
     2. Call `get-library-docs` with that ID to inject live API docs into context
     3. Generate code against retrieved docs — not training-time assumptions

2. **Implementation:**
   - Follow mPX plan exactly - NO deviations without approval
   - Use TodoWrite to track implementation steps
   - Follow established patterns and conventions

3. **Runbook Logging — MANDATORY GATE (do this before writing the summary):**
   - First ask: is this task tracked in a **formal plan file**? If yes → skip entirely (AX handles logging for plan tasks).
   - If no formal plan: **classify now** — bug fix or feature addition? `/mpx` is non-plan-in-memory, so **both classes must log** or knowledge is lost forever.
     - **Bug fix** → open the active project's `Plans\🐛Bug-Hunt-Runbook.md` (the `Plans\` folder at the git root of CWD), add entry under **Bug Log** with next `BUG-###` ID. Must include: description, root cause, files changed, fix summary.
     - **Feature addition** → open the active project's `Plans\🐛Bug-Hunt-Runbook.md` (the `Plans\` folder at the git root of CWD), add entry under **Feature Log** with next `FEAT-###` ID. Must include: description, motivation, files changed, implementation summary.
   - Do NOT defer to after the summary — log first, summarize second.
   - Update Hot-Spot Map and Session History in the same edit.
   - **Capture the log entry ID** (e.g., `BUG-052` or `FEAT-007`) — step 4's Implementation Summary MUST cite it. No ID in the summary = gate was skipped = workflow violation.

4. **Task Completion:**
   - Leave uncommitted for user review
   - Display this block:

   **📋 IMPLEMENTATION SUMMARY**

   Logged as: [BUG-### | FEAT-### | "plan: <plan-file-name>"]   ← required; omission = gate violation

   What was done:
   [2-3 sentences: what changed and why]

   Files changed:
   [list created/modified files]

   How to test:
   [Concrete steps: URLs, commands, UI actions,
    or API calls to verify the implementation]

   What's next:
   [1-3 bullets: next task(s) or phase in the plan,
    and any dependencies or blockers to be aware of]

5. **Post-Implementation Compliance Audit:**
   - Identify the pattern just implemented
   - Run the `/pica` compliance dimensions (the pica skill is the single source of truth) against the changed source files + their sibling files implementing the same pattern.
   - Emit:
     ```
     COMPLIANCE AUDIT: [Pattern Name]
     Audited: [N] files
     Compliant: [X] | Need Alignment: [Y]
     [If Y > 0: filename — specific discrepancy]
     ```
   - If non-compliant files found: note for user decision (no auto-fix in memory mode)

**Next:** `/px` — continue with the next task, or `/cf` if all tasks are complete