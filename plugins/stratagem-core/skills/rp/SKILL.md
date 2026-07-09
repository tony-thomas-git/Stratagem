---
name: rp
description: Read Plan - Resume work on existing plan, assess current progress via git diff
argument-hint: "plan file name"
---

# RP (Read Plan)

**Purpose:** Resume work on existing plan, assess current progress via git diff. You cannot modify the plan. You only can read the existing plan and obtain context about where we left off with the implementation.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ RP (Read Plan) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Plan Discovery:**
   - List the **`.md` execution plans** (`*_plan.md`) in `docs/plans` — these are the resumable CP plans that `/px` `/ax` `/phx` edit. **Ignore `.html` siblings** in that folder: `*_seed.html` (PS seeds), `*_plan.html` (PF plans — already consumed by CP), `*_completed.html` (CF reports), `*_retrospective.html` (RS logs). Those are human-read artifacts, not resumable execution state.
   - If multiple `.md` plans exist, request user to specify which one
   - Read specified plan file completely

2. **Progress Assessment:**
   - Execute `git status` and `git diff` to see current changes
   - Compare git changes against plan tasks
   - Identify which tasks have been completed/partially completed

3. **Plan Synchronization:**
   - Update plan file to reflect actual progress
   - Mark completed tasks based on git diff analysis
   - Identify next task to be executed

4. **Context Restoration:**
   - Summarize current project state
   - Highlight what's been accomplished
   - Present next recommended action (PX for next task)

5. **Question Batch (Pre-Resume Lockdown):**

   **Purpose:** Same as CP step 7 — surface every visible decision before downstream `/phx` (or `/px`→`/ax` chains) so phase loops don't stop mid-flight to ask. RP fires this at resume time because the resume point IS the initial working point for the next phase, even though the plan was created earlier.

   **What to scan for (RP-specific):**
   - The plan's `### Open Design Decisions` section — any unresolved entries
   - The next task or upcoming phase's task descriptions — visible decisions in scope
   - Drift surfaced by the git diff — e.g., implementation diverged from plan; confirm direction
   - Decisions that may have been valid when CP wrote them but stale now (dependency versions, env state, completed siblings have set patterns)

   **Source for defaults (priority order):**
   1. Plan's Open Design Decisions section (explicit leanings)
   2. Patterns established by already-completed tasks in this plan (consistency over arbitrary)
   3. Git-diff evidence of user's actual choices
   4. Sensible best-practice pick

   **Output format:** identical to CP step 7 — topic-grouped tabular batch with `# | Question | Default | Override?`. See CP skill step 7 for the full format spec, topic grouping rules, and quality bar.

   **Skip case (rare):** plan has zero open decisions, the next task/phase has zero visible decisions, AND git diff shows no drift → emit `## Question batch — none detected. /phx ready to resume.` Don't skip silently.

   **After user replies:**
   - Update plan's `### Open Design Decisions` section — append RESOLVED rows date-stamped today
   - If overrides invalidate upcoming tasks, edit them in the Task List and update phase counts
   - Then proceed to step 6 (Output)

6. **Output:** Current progress summary and next steps recommendation

**Next:** `/px` — analyze the identified next task, or `/ax` if already analyzed