---
name: mpx
description: Memory Plan Execute - Plan small tasks (<5 files) without formal plan files
argument-hint: "task description"
---

# MPX (Memory Plan Execute)

**Purpose:** Plan and execute small tasks (<5 files) without creating formal feature plan files. Planning stays in memory for immediate execution.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ MPX (Memory Plan Execute) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Task Analysis:**

   **★ CORPUS-READ-FIRST (pull known patterns before planning):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   Then analyze the task:
   - Understand requirement and identify all files requiring creation/modification
   - If >5 files or >1 hour work: Recommend using full PF->CP->PX workflow instead

2. **Implementation Strategy:**
   - Determine approach and integration points
   - Suggest specific patterns (NOT full implementations)
   - Plan testing approach

3. **Plan Presentation:**
   - Present scope (files to modify/create, estimated complexity)
   - Show implementation strategy and integration points
   - **HARD STOP — DO NOT EDIT ANY FILES**
   - Output this exact block and wait:
   ```
   ⛔ AWAITING mAX AUTHORIZATION
   Plan is ready. Type "mAX" to execute or provide feedback to revise.
   No files will be touched until mAX is received.
   ```

4. **Memory Retention:**
   - Hold plan in conversation memory for subsequent mAX execution
   - **NEVER skip step 3. Implementing without mAX is a workflow violation.**

**Next:** `mAX` — execute the plan above