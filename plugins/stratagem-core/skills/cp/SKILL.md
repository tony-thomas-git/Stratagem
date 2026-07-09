---
name: cp
description: Create Plan - Break down approved feature plan into manageable tasks
argument-hint: "feature name or plan reference"
---

# CP (Create Plan)

**Purpose:** Break down approved feature plan into manageable, context-window-sized tasks.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ CP (Create Plan) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Setup Phase:**
   - Get current date/time using terminal command
   - Create unique ID: `YYMMDD_HHMMSS` format
   - Create filename: `{feature_name}_{unique_id}_plan.md` — **the CP execution plan is always `.md`** (machine-edited by /px /ax /phx /cf, and graph-bound), even though the PF input it's built from is `.html`.

2. **Context File Handling (Optional):**
   - If context files are provided, write them to the `docs/plans/` folder using this naming convention:
     ```
     {unique_id}_{feature_name}_ctx_{descriptor}.ext
     ```
   - Write all context files **before creating the plan markdown file**
   - Add a section to the plan markdown:
     ```markdown
     ### Context Files
     - `filename.ext`: Short description of purpose
     ```
   - This ensures `PX` can reference them later for context loading

3. **Strategic Context Preservation (from PF):**

   **📄 PF input is HTML.** The PF plan you are consuming is authored as `.html` (`{feature}_{date}_plan.html`). Read it and extract its content — sections, tables, lists, and any SVG/diagram captions — into the structured `.md` you produce. Ignore presentation markup (tags, `<style>`, SVG path geometry); carry the *meaning*: prose, table data, decisions, per-entity notes. **This is the format-normalization seam:** PF authors in HTML for human reasoning; CP re-emits a self-contained `.md` execution plan for machine editing and the graph. The CP output stays `.md` (see step 1) — only the *input* format changed.

   **⚠️ CRITICAL: The CP plan MUST be self-contained.** Executors (/px, /ax, /phx) should NOT need to read the PF plan to understand what they're building or why. Preserve the following from the PF output — do NOT summarize into oblivion:

   **Mandatory sections to carry forward:**
   - **Source PF Reference:** Link to the PF plan file by name
   - **Problem Statement & Solution:** What we're solving and the chosen approach
   - **What's Already Built:** Inventory of existing components the work builds on (tables, lists — not prose compression)
   - **Architecture Decisions & Rationale:** WHY this approach, phase ordering rationale, key design choices with their reasoning
   - **Entity/Component Notes:** Per-entity or per-component quirks, edge cases, special handling — these get lost first and hurt executors most
   - **Dependencies:** Backend dependencies, external service requirements, blocking items
   - **Risk Assessment:** Top risks from PF with mitigation strategies
   - **Success Criteria:** How we know this feature is done
   - **Open Design Decisions:** Unresolved choices with current leanings

   **Preservation rule:** If PF has a table, keep the table. If PF has per-entity notes, keep per-entity notes. Convert prose to structured format where helpful, but NEVER drop content to "save space." The CP plan is the living execution document — it must carry the full picture.

4. **Task Breakdown:**

   **★ CORPUS-READ-FIRST (pull known patterns before decomposing):**
   > **Sync note:** This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**

   Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback.
   1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of the current working directory. If it exists, use it; otherwise no-op this block and fall through to normal research (no regression).
   2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry).
   3. **Drill.** Open the relevant linked pages whole — no chunking.
   4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs.
   5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
   6. **Only on miss** fall through to the web/context7 ladder. When you do fetch externally, that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — synthesize it later via `/wiki-ingest`.

   For CP specifically: pull task-level patterns + anti-patterns from the corpus so the decomposition below reuses known shapes instead of re-deriving them.

   **🎯 TRACER BULLET CHECKPOINT:**
   - **Ask:** "Does this plan benefit from vertical slicing (tracer bullets)?"
   - **Evaluate using criteria:**
     - ✅ USE if: 3+ system layers, multiple similar features, untested architecture, >5 files
     - ❌ SKIP if: Single layer, <5 files, refactoring, bug fix, config/docs
   - **If YES:** Structure tasks as end-to-end vertical slices
     - Example: "Task 1: Login feature (API + UI + DB + validation)"
   - **If NO:** Use natural task decomposition
     - Example: "Task 1: Add form validation to existing component"
   - **Document decision:** Add "Tracer Bullet: YES/NO" to plan metadata

   - Convert high-level plan into specific, actionable tasks
   - Each task must be completable within AI context window (~8000 tokens)
   - Tasks should be atomic (one logical unit of work)
   - Include clear acceptance criteria for each task
   - **Emit a `Verify:` line for EVERY task** — a single shell command whose exit 0
     objectively proves the task complete (e.g. `Verify: npm test -- auth.spec && eslint src/auth`).
     Mandatory: a verifier-era plan with any task missing `Verify:` HALTS at `/phx`'s upfront
     sweep. There is **no `Verifier:` opt-in flag** — the verifier is always-on.

5. **Plan File Structure:**

   **🎯 ADO AREA RESOLUTION (optional — board-synced projects only; resolve BEFORE writing the header below):**
   > Decides which board area path the Feature + all its Stories will carry. `/cp` stays
   > otherwise ADO-blind — it only writes a header that `stratagem-ado:sp` consumes verbatim
   > (the neutral-seam contract: core Stratagem names no ADO mechanics).
   1. **Resolve `<vault>`** for the active project by the `Vault\` folder at the project's git root
      (the same project→vault mapping CORPUS-READ-FIRST uses above). No `<vault>` resolved →
      **no-op this whole block** (non-ADO projects emit no ADO header; zero regression).
   2. **Read `<vault>/ado-board-config.md`.** Absent → **no-op** (project not board-synced).
   3. **Prompt the user to pick one area** from the config's `## ADO-Areas` list (each entry is a
      **full area path**); default = the config's `## ADO-Area-Default` (also a full path). One
      choice — the whole Feature and every child Story inherit it (per-story override is out of
      scope by design).
   4. **Emit the two ADO headers** in the template below using the picked value **verbatim**:
      `## ADO-Area: <chosen full path>` (the config already stores full paths — do **NOT** re-prefix
      with the area root, or you double it) and `## ADO-Project: <ADO-Project>`, both from the
      config. Omit both lines entirely when the block no-ops (steps 1–2).

   ```markdown
   # Feature: {Feature Name}
   ## Created: {Date/Time}
   ## Status: In Progress
   ## Source PF: {pf-plan-filename.md}
   ## Tracer Bullet: YES/NO
   ## Budget: {tokens — OPTIONAL, unattended /if runs only}
   ## ADO-Project: {board project — OPTIONAL, board-synced projects only (from ado-board-config.md)}
   ## ADO-Area: {full path e.g. ISCI - Consolidated - Kanban\ISCI-SAAS — OPTIONAL, board-synced only}

   ### Strategic Context

   #### What's Already Built
   (Inventory table/list from PF — components, status, location)

   #### Architecture Decisions
   (Key decisions with rationale — preserve WHY, not just WHAT)

   #### Phase Strategy
   (Phase ordering rationale, scope boundaries per phase)

   #### Entity/Component Notes
   (Per-entity quirks, edge cases, special handling from PF)

   #### Dependencies
   (Backend, external services, blocking items)

   #### Risk Assessment
   (Top risks with mitigation — from PF)

   #### Open Design Decisions
   (Unresolved choices with leanings — from PF)

   #### Success Criteria
   (How we know the feature is complete — from PF)

   ### Context Files
   - `filename.ext`: Description of purpose

   ### Task List
   - [ ] Task 1: Description with acceptance criteria
     - Verify: <single shell command — exit 0 proves this task complete>
   - [ ] Task 2: Description with acceptance criteria
     - Verify: <single shell command — exit 0 proves this task complete>
   - [ ] Task 3: Description with acceptance criteria
     - Verify: <single shell command — exit 0 proves this task complete>

   ### Completed Tasks
   (Tasks move here when completed)

   ### Error Log
   (Errors and fixes get logged here)

   ### PICA Log
   | Task | Pattern | Audited | Issues | Action |
   |------|---------|---------|--------|--------|
   ```

   The `## Budget:` field is **optional** — emit it ONLY for plans intended for unattended `/if`
   (autonomy-loop) execution; the `/if` launcher reads it, else the plugin default (750k) applies.
   Omit it for interactive `/phx` plans (two-path model — see `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md` "Autonomy Budget").

   The `## ADO-Project:` / `## ADO-Area:` fields are likewise **optional** — emit them ONLY when the
   ADO Area Resolution block above resolved a `ado-board-config.md` (board-synced projects). They are
   consumed by `stratagem-ado:sp` at sync time; when absent, `sp` falls back to its own default. Omit
   both for non-board-synced projects.

6. **Validation:**
   - Ensure each task is appropriately sized for single AI execution
   - **`Verify:` completeness self-check (layer 1 — prevention):** before finishing, confirm
     every task in `### Task List` carries a `Verify:` line. Report `Verify: present on N/N tasks`.
     If any task lacks one, add it before emitting — the plan must be born complete so `/phx`'s
     upfront sweep never trips.

7. **Question Batch (Pre-Execution Lockdown):**

   **Purpose:** Surface every visible decision across the task list NOW so downstream `/phx` (or `/px`→`/ax` chains) don't stop mid-flight to ask. Especially valuable when user has expressed `/phx` preference, but emit always — even per-task chains benefit from upfront resolution.

   **What to scan for:** Every *visible decision* across all tasks — UI copy, color choices, label formats, icon vs no-icon, ordering, default values, edge-case behavior, copy variants, layout micro-choices. Anything an executor might pause to ask about during `/ax`. Don't skip "obvious" defaults — surface them so the user can override consciously.

   **Source for defaults (priority order):**
   1. PF "Open Design Decisions" section (already-leaned values)
   2. Seed file design intent
   3. Established portal/codebase conventions
   4. Sensible best-practice pick

   **Output format (after the plan file is written, before PF cleanup):**

   ```markdown
   ## Question batch (answer each `OK` or override)

   Got the `/phx` preference (mention only if user expressed it) — locking every visible decision now so the phase loops don't stop mid-flight. Grouped by visual prominence.

   ### {Topic 1 — e.g. Visual identity}
   | # | Question | Default | Override? |
   |---|---|---|---|
   | 1 | ... | ... | |

   ### {Topic 2 — e.g. Status indicators}
   | # | Question | Default | Override? |
   |---|---|---|---|
   | N | ... | ... | |

   ---
   **Fastest reply if all defaults are good:** just say `all OK`.
   Otherwise call out the # numbers to override (e.g. `1 = blue, 4 = caps`).
   I'll codify answers into the CP plan's Open Design Decisions table.
   `/phx` is unblocked once locked.
   ```

   **Topic grouping rules:**
   - Group thematically by visual/UX domain, NOT by task. Users scan by topic, not by task #.
   - Aim 3–7 topical sections. Too few = flat list. Too many = noise.
   - Order topics by visual prominence: chrome → primary indicators → secondary → micro-copy.
   - Re-confirm decisions PF already defaulted as a final section ("Re-confirming PF defaults") so the user can flip them with the same notation.

   **Quality bar:**
   - Every question has a stated default. Never `Default: TBD` — that defeats the purpose.
   - Defaults are the answer if user says nothing. Don't hedge.
   - One row = one decision. Don't compound.
   - "Override?" column stays blank — it's the user's response slot.

   **After user replies:**
   - Update the CP plan's `### Open Design Decisions` section header to: `### Open Design Decisions — RESOLVED {YYYY-MM-DD}`
   - Add a line below the header: `All decisions locked. /phx can run phases without stopping.`
   - Convert each row to a Resolution table with the chosen value (default or override).
   - If an override invalidates a task (e.g. "no tooltip" removes the tooltip task), strike or rewrite that task in the Task List — and update the Phase Strategy task count.
   - THEN proceed to PF Cleanup (step 8).

   **Edge cases:**
   - If zero visible decisions exist (rare — usually pure refactor/bug-fix plans): emit `## Question batch — none detected. /phx ready to run.` Don't skip the section silently; the explicit "none" signals the AI checked.
   - If user is NOT using `/phx`: still emit. Resolution helps `/ax` runs too.

8. **PF Cleanup:** After the CP plan file is written and validated:
   - Identify the Source PF file recorded in the CP plan header (`Source PF: {filename}`)
   - If a PF file was read during planning, prompt the user:
     ```
     🗑️ Source PF file: {filename}
     Delete it? It is superseded by this CP plan. (yes / no)
     ```
   - Delete only if user confirms — do not auto-delete

9. **Execution Mode Recommendation — MANDATORY (do this after PF Cleanup, before the "Next:" handoff):**

   **Purpose:** Maximize non-human-in-the-loop execution. Once the plan is locked (decisions resolved, tasks atomic, every task carries `Verify:`), recommend the best execution path for *this specific plan* — the **two-path model** (`${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md` "Autonomy Budget & the Two-Path Loop"):

   - **Manual / human-in-the-loop** — `/phx` (per-phase `/px`→`/ax` chain), or finer `/px`→`/ax` task-by-task, with `/ex`→`/fx` on errors. **No hard budget — you watch cost.** Halts on first error for review.
   - **Unattended** — `/if` (the autonomy-loop Workflow). Drives `/px`→`/ax`→verifier→advance per task under a **hard `## Budget:` token ceiling**, with bounded `/ex`→`/fx` auto-recovery and a plan-level integration gate.

   > **`/if` pre-flight:** it reads `## Budget:` (else the plugin 750k default) and runs on a **feature branch** — it HALTs on `staging`/`main`. If you'll go unattended, confirm the plan carries `## Budget:`; add it now if missing.

   **Decision criteria:**

   **Favor MANUAL (`/phx`, or `/px`→`/ax`) when:**
   - One or more tasks need human-at-browser smoke testing, manual click-test, or eyes-on verification
   - Acceptance criteria are mixed or not fully code-observable
   - You want to watch token cost, or a clean halt on any error for manual review
   - Decisions still lurking (step 7's question batch left items open)

   **Favor UNATTENDED (`/if`) when:**
   - Every task declares an objective `Verify:` (a single command whose exit 0 proves it done)
   - Acceptance criteria are code-observable (tests, type-check, lint, contract audit, `git diff --stat`)
   - All decisions locked via step 7's question batch (no per-task discoveries lurking)
   - You're comfortable letting the loop run and self-recover within the budget, no prompting

   **Split (`/phx` or `/if` for Tasks 1..N, then hand back) when:**
   - A specific task needs your eyes, or an external service / human approval that breaks autonomy — run the autonomous remainder unattended and do that task manually

   **Output format — emit the analysis, THEN the bifurcation banner. The banner is MANDATORY and TERMINAL (the last thing the user sees). NEVER collapse it to a single `/phx`/`/px` prompt or silently default to one mode — the fork must be displayed, not just described.**

   First, the analysis:

   ```markdown
   ## Execution Mode Recommendation: manual (/phx) vs unattended (/if)

   ### Readiness
   - Decisions locked: [N from step 7 question batch]
   - Per-task discoveries lurking: [none | list]
   - Acceptance-criteria style: [code-observable | mixed | requires human eyes]
   - `## Budget:` present (required for /if): [yes <N> | no — add before /if]
   - `Verify:` present on: [N/N tasks]

   ### Task autonomy

   | Task | Depends on | Runs unattended? |
   |------|------------|------------------|
   | 1. [title] | [Nothing (leaf) / Task N] | ✅ / ⚠️ / ❌ |
   | 2. [title] | [Task N] | ✅ / ⚠️ / ❌ |
   | ... | ... | ... |

   ### The catch (if any)
   [Which task(s) break full autonomy and why — e.g. "Task 5 is a manual smoke test of IVia.App (WPF) — needs your eyes."]
   ```

   Then **ALWAYS** close with this exact loud bifurcation banner — show BOTH routes even when you have a strong lean; the user chooses the path:

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ⚡ PLAN LOCKED — CHOOSE YOUR EXECUTION PATH
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [📌 board-synced? → run /sp FIRST, before either route]

    ▸ ROUTE A — MANUAL (human-in-the-loop; you watch cost, halts on error)
        /phx phase 1   chain /px→/ax across the phase
        /px            one task at a time   (/ex→/fx on errors)

    ▸ ROUTE B — UNATTENDED (autonomy loop; runs itself, verifier-gated)
        /if <plan> phase 1   under ## Budget, on a feature branch;
                             auto-recovers via /ex→/fx
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ▶ My lean: <route + one-line why — e.g. "B /if: all tasks code-observable">
   ```

   **Board-sync gating (the `[📌 …]` line in the banner):**
   - **Board-synced plan** (step 5 wrote `## ADO-Project:` / `## ADO-Area:`) → make that line **loud and unmissable**, replacing it with:
     `📌 BOARD-SYNCED — run /sp FIRST: it creates the Feature + one Story per task and writes Sync-Id back so the loop moves the cards. THEN pick a route ↓`
   - **Not board-synced** → **remove that line entirely** (core stays board-blind; gate on the headers `/cp` itself wrote, never on ADO knowledge).

   **Symbol legend (autonomy column):**
   - ✅ — unattended-safe: code-observable `Verify:`, no human checkpoint
   - ⚠️ — partial: has a manual or external checkpoint
   - ❌ — requires human-in-the-loop, blocks unattended execution

   **Quality bar:**
   - **The bifurcation banner is mandatory and terminal — ALWAYS emit it, showing BOTH routes, as the final output. Never skip straight to a single launch prompt or auto-pick a mode.**
   - State an opinionated lean (the `▶ My lean:` line) with one-line reasoning — but the lean never replaces the fork; the user picks.
   - Always include the task-autonomy table above the banner — it's the evidence behind the lean.
   - Board-synced plans MUST show the loud `/sp`-first line at the top of the banner.

**Next:** if board-synced, **`/sp`** first (sync the plan to the board) — then `/phx phase 1` or `/if <plan> phase 1` per the recommendation, or `/px` to analyze the first task manually.