---
name: fx
description: Fix Execution - Implement fixes for errors logged in EX operation
argument-hint: "fix task reference or iq"
---

# FX (Fix Execution)

**Purpose:** Implement fixes for errors logged in EX operation.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ FX (Fix Execution) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Fix Selection:**
   - Read plan file and identify next fix task
   - Review error details and fix strategy from EX

   **🎯 TRACER BULLET CHECKPOINT:**
   - **Ask:** "Does this fix require vertical slice validation?"
   - **Evaluate:**
     - ✅ YES if: Fix affects multiple layers (API + UI + DB)
     - ❌ NO if: Isolated component fix, single-layer change
   - **If YES:** Test across all affected layers before completing
   - **If NO:** Fix and validate isolated component only

2. **Research (before implementing):**

   **★ CORPUS-READ-FIRST (check the corpus before web/context7):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   Then, on a corpus miss, research externally:
   - Extract the exact error message and stack trace from the EX log
   - **Route per global "Research & Web Lookup Routing" rule:**
     - If the error is library/framework/SDK-attributable (any library, framework, SDK, or cloud service your code uses) → **context7 first** (`resolve-library-id` then `get-library-docs`). Stop here if it answers.
     - Otherwise → **one** `tavily_search` with a keyword-style query: `"[exact error message]" [framework/library name]`. Bias toward `stackoverflow.com` and `github.com`.
     - If a Stack Overflow / GitHub URL surfaces → switch to `tavily_extract` on that URL. Do **not** fire more searches.
     - **`tavily_research` is forbidden in this skill** — use it only outside `/fx` and only with one-line justification.
   - Synthesize findings: known cause, community-recommended fixes, related issues
   - If Tavily is unavailable, use built-in WebSearch as fallback
   - Incorporate findings into fix strategy before writing any code

3. **Implementation:**
   - Follow fix strategy exactly (updated with research findings)
   - Use minimal changes to resolve issue
   - Maintain existing architectural patterns
   - Test fix against original error condition

4. **Documentation:**
   - Update error log with fix details
   - Move fix task to completed section
   - Note any additional changes required

5. **Runbook Logging — MANDATORY GATE:**
   - First ask: is this fix tracked in a **formal plan file**? If yes → log to plan only, **skip runbook entirely** (the plan IS the authoritative record).
   - If no formal plan (defensive — `/fx` is normally plan-bound, but capture rather than lose): open the active project's `Plans\🐛Bug-Hunt-Runbook.md` (the `Plans\` folder at the git root of CWD) and add entry immediately — do not defer.
   - Entry must include: Bug ID, description, root cause, files changed, fix summary
   - Update Hot-Spot Map if file had no prior entries
   - Without this step (for ad-hoc fixes), `/rs` has no evidence to harvest.

6. **Validation:**
   - Ensure fix doesn't introduce new issues
   - Verify original functionality still works

7. **Implementation Summary:** Display this block:

   **📋 FIX SUMMARY**

   What was fixed:
   [2-3 sentences: root cause and what changed]

   Files changed:
   [list created/modified files]

   How to test:
   [Concrete steps to verify the fix: reproduce the original error scenario and confirm it no longer occurs]

   What's next:
   [1-3 bullets: remaining fixes, next task in plan, or "return to /ax [task]" if fix unblocks execution]

8. **Post-Implementation Compliance Audit:**
   - Identify the pattern touched by this fix
   - Run the `/pica` compliance dimensions (the pica skill is the single source of truth) against the changed source files + their sibling files implementing the same pattern.
   - Emit:
     ```
     COMPLIANCE AUDIT: [Pattern Name]
     Audited: [N] files
     Compliant: [X] | Need Alignment: [Y]
     [If Y > 0: filename — specific discrepancy]
     ```
   - If non-compliant files found: add follow-up task to plan file before proceeding
   - Append one row to `### PICA Log` in the plan file:
     `| FX[fix#] | [pattern] | [N audited] | [N issues] | [follow-up added / —] |`

**Next:** `/px` — continue with next task, or `/cf` if all tasks are complete