---
name: px
description: Plan Execute - Select and analyze one specific task from the plan file
argument-hint: "task number or plan file"
---

# PX (Plan Execute)

**Purpose:** Select and analyze one specific task from the plan file.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ PX (Plan Execute) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Task Selection:**
   - Read current plan file from the active project's `Plans\` directory (the `Plans\` folder at the git root of CWD)
   - Identify next uncompleted task in sequence
   - If task seems too large, recommend splitting it

2. **Context File Loading (If Present):**
   - Check if the plan file contains a `### Context Files` section
   - **Documentation Path Convention:** the active project's `Plans\` directory — the `Plans\` folder at the git root of CWD.
   - For each listed file:
     - Confirm the file exists in the docs folder
     - Load the file contents into memory for reference during this PX step
   - Use these files to inform planning
   - These context files should be assumed present in downstream `AX` mode via mcp `context7`

3. **Task Analysis:**

   **★ CORPUS-READ-FIRST (resolve the task's corpus nodes before analysis):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   For PX specifically: resolve the patterns this task touches and any prior EX lessons in the corpus — not just the files the plan names. Then:
   - Break down selected task into implementation steps
   - Identify all files that need creation or modification
   - Estimate context window requirements (tokens)
   - Determine if task fits in single execution window

   **Design Validation Checks:**

   API Design Validation:
   - [ ] **Method Necessity Check**: Can default parameters handle all use cases instead of multiple methods?
   - [ ] **YAGNI Validation**: Is each method/feature actually needed, or is it "nice to have"?
   - [ ] **Redundancy Analysis**: Do any methods duplicate functionality that defaults could provide?
   - [ ] **Existing Pattern Comparison**: How do similar utilities in the codebase handle this?
   - [ ] **Parameter Design**: Are optional parameters better than separate methods?

   Implementation Complexity Assessment:
   - [ ] **Single Responsibility**: Does each method have one clear purpose?
   - [ ] **Delegation Patterns**: Are we creating unnecessary wrapper methods?
   - [ ] **Validation Placement**: Where should validation logic live to avoid duplication?
   - [ ] **Interface Minimalism**: What's the smallest API that meets all requirements?

   Real Usage Pattern Review:
   - [ ] **Common Case**: What will 90% of users actually call?
   - [ ] **Edge Cases**: Do edge cases require separate methods or just parameters?
   - [ ] **Future Flexibility**: Does the design allow growth without breaking changes?
   - [ ] **Testing Simplicity**: Will this design be easy to test comprehensively?

4. **Implementation Strategy:**
   - Provide detailed approach for implementation
   - Suggest specific patterns and approaches (NOT full implementations)
   - Identify integration points with existing systems
   - Plan testing approach

5. **Size Assessment:**
   - If estimated >6000 tokens: Recommend task splitting and CP file update
   - If appropriate size: Present implementation plan for approval

6. **Output:** Comprehensive task execution plan with implementation strategy

**Next:** `/ax` — implement the analyzed task