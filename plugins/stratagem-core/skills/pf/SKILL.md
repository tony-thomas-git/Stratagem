---
name: pf
description: Plan Features - Create comprehensive feature implementation plan without coding
argument-hint: "feature description"
---

# PF (Plan Features)

**Purpose:** Create comprehensive feature implementation plan without any coding.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ PF (Plan Features) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Research Phase:** Explore existing codebase to understand:

   **★ CORPUS-READ-FIRST (do this before codebase/web research):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   Then explore the existing codebase to understand:
   - Relevant components, libraries, and architectural patterns
   - Similar existing features and their implementation approaches
   - Framework-specific usage patterns
   - Authentication flows and state management
   - Routing and navigation patterns

2. **Analysis Phase:** Identify:
   - What new components/modules need to be created
   - What existing files need modification
   - Dependency updates required
   - Potential architectural challenges or design decisions

3. **Planning Phase:** Create detailed feature plan including:
   - High-level architecture approach
   - Major components and their relationships
   - Integration points with existing systems
   - Testing strategy
   - Implementation complexity assessment

4. **Output:** Present comprehensive plan for approval - NO CODE, only strategic planning.
   - **Format — HTML.** The feature plan is a human-reasoned document, authored once and then *consumed by `/cp`* (which re-emits a self-contained `.md` execution plan). Author it as `.html`:
     - **HTML chassis** for layout — its box/flow engine is bulletproof and won't let objects overlap. Use it for all structure (sections, tables, side-by-side comparisons).
     - **SVG only for free geometry** — crossing connectors, arrows over objects, spatial/architecture diagrams. The one thing HTML's layout cannot do.
     - Prefer simplicity. HTML earns its place only where layout or a diagram beats prose.
   - **Save** to the plans directory as `{feature_name}_{YYMMDD}_plan.html` (or `_{YYMMDD_HHMMSS}_` per project convention). Leave uncommitted for review.

**Next:** `/cp` — break this plan into tasks (it reads this `.html` plan and emits the `.md` execution plan)
