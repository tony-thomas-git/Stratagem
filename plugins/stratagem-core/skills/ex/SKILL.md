---
name: ex
description: Error Executing - Handle development errors and create fix plans (documentation only)
argument-hint: "error description or iq"
---

# EX (Error Executing)

**Purpose:** Handle development errors or critical bugs discovered during testing. Do not implement the changes - only create a plan. Provide summary of fixes required. Always ask clarifying question when you see critical patterns.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ EX (Error Executing) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Error Assessment (Override in Project):**

   **★ CORPUS-READ-FIRST (read prior lessons + anti-patterns before root-causing):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   Then assess the error:
   - Identify error type using project-appropriate terminology
   - Analyze error messages and stack traces
   - Determine root cause and impact scope
   - Check for common framework-specific issues

2. **Documentation (Universal):**
   - Add detailed error entry to plan file "Error Log" section
   - Include: Error type, messages, files affected, suspected cause
   - Create new task in plan file specifically for this fix

3. **Fix Planning (Universal):**
   - Analyze what needs to be changed to resolve error
   - Determine if fix affects other components
   - Estimate complexity of fix implementation

4. **Task Creation Format (Universal):**
   ```markdown
   - [ ] FIX: {Error Description}
     - Error Type: [See Project EX for specific types]
     - Files Affected: [List files]
     - Root Cause: [Analysis]
     - Fix Strategy: [Detailed approach]
   ```

**Note:** This EX base class MUST be combined with Project EX implementation.

**Next:** `/fx` — implement the fix