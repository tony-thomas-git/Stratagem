---
name: phx
description: Phase Execute - Chain PX→AX for a phase, a task range, or a single task
argument-hint: "plan-file (phase N [from task N] | task M | tasks M-K | tasks M,K,L)"
---

# PHX (Phase Execute)

**Purpose:** Execute a scope of plan work by chaining PX (analysis) → AX (implementation) for each task sequentially. Scope can be an entire phase, a task range, an explicit task list, or a single task. Moves the human checkpoint from per-task to per-scope.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ PHX (Phase Execute) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
 Scope: [phase N | tasks M-K | tasks M,K,L | task M]
 Mode: Chained PX → AX per task
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Usage

```
/phx [plan-file] phase 2              # All tasks in phase 2
/phx [plan-file] phase 2 from task 3  # Resume from task 3 in phase 2
/phx [plan-file] task 5               # Single task (auto-discovers phase)
/phx [plan-file] tasks 3-7            # Task range (may cross phase boundaries)
/phx [plan-file] tasks 3,5,8          # Explicit task list
```

**Instructions:**

## 1. Scope Discovery

Parse the scope argument and build the **target task list**:

| Argument form | Target list |
|---------------|-------------|
| `phase N` | All uncompleted tasks in phase N |
| `phase N from task M` | Uncompleted tasks in phase N, starting at task M |
| `task M` | The single task M (auto-discover its phase for context) |
| `tasks M-K` | Tasks M through K inclusive — may cross phase boundaries, executes straight through |
| `tasks M,K,L` | Explicit list of task numbers, in the order given |

- Read plan file from docs plans directory
- Resolve the target list against actual plan content (skip already-completed tasks, warn if any requested task is missing)
- Display scope summary:
  ```
  Scope: [phase N | task M | tasks M-K | tasks M,K,L]
  Target tasks: [list of task numbers and titles, in execution order]
  Crossing phase boundaries: [yes / no — only relevant for range/list scopes]
  ```

## 2. Scope Safety Check

**Max 10 tasks per execution** (applies to every scope form). If the target list has >10 tasks:
- HALT and recommend splitting the scope
- Suggest a natural breakpoint (phase boundary if range crosses one; else mid-list)

**Upfront `Verify:` sweep (verifier precondition — layer 2).** Before executing ANY task, scan the whole target task list for `Verify:` lines and classify the plan — this runs once, before Step A of task 1:
- **(a) Every target task HAS `Verify:`** → verifier-era plan → proceed to Step 3.
- **(b) MIX** (≥1 target task missing `Verify:`, others have it) → **HALT immediately**, listing the offending task numbers — the gate cannot be bypassed by omission:
  ```
  ⛔ tasks 3, 7 declare no verifier — cannot start
  Action: add a Verify: line to each, then re-run /phx
  ```
- **(c) ZERO `Verify:` anywhere** → legacy plan (authored before the verifier) → emit a one-time notice and run today's behavior. This is the ONLY un-gated path:
  ```
  ℹ️ This plan predates the verifier (no Verify: lines) — running legacy (pre-verifier) behavior.
  ```

## 3. Execution Loop

**For each task in the target list, in order, execute this cycle:**

**★ LITERAL SKILL INVOCATION (mandatory — no improv).** Each step below MUST be executed by **invoking the real skill via the Skill tool** — `/px` for Step A, `/ax` for Step B (PICA fires *inside* `/ax`), and `/ex`→`/fx` on the Step-C FAIL/error path. Do **NOT** inline, paraphrase, or fold a skill's logic into your own reasoning thread: the sub-skills' validation checklists and the per-task PICA audit only run if the skills are actually called. Improvising the analysis in-thread is the failure mode this gate exists to prevent. Surface every phase transition with an explicit label:
```
--- Task N: PX Analysis ---       (Skill: px)
--- Task N: AX Implementation --- (Skill: ax — PICA runs inside)
--- Task N: Verifier Gate ---     (Step C, C.1–C.4)
✅ Task N complete
--- on FAIL/error: Skill: ex → Skill: fx ---
```

### Step A: PX Analysis (per task) — invoke `/px`
- Read the task from plan file
- Load any context files referenced in the plan
- Break down into implementation steps
- Identify files to create/modify
- Assess context window requirements
- Apply all PX validation checklists:
  - API Design Validation
  - Implementation Complexity Assessment
  - Real Usage Pattern Review
- If task is too large (>6000 tokens estimated): HALT chain, recommend task split

### Step B: AX Implementation (per task) — invoke `/ax` (PICA runs inside)
- **MANDATORY:** Use `context7` for all code generation
- Follow PX analysis exactly — NO deviations
- Apply all AX quality checks:
  - YAGNI Implementation Checkpoint
  - Code Quality Validation
- Update plan file: move task to "Completed Tasks" with timestamp
- Leave all changes uncommitted

### Step C: Task Checkpoint — ★ VERIFIER GATE (always-on) ★

A task advances ONLY on an executed check + separate-confirmer approval — never on self-assessment. The verifier is always-on; there is no opt-in flag. Run C.1–C.4 in order:

- **C.1 — Resolve `Verify:`.** Read the task's `Verify:` command from the plan file.
  - Missing here (verifier-era plan) → **HALT** backstop (should already be caught by the Step-2 sweep):
    `task [N] declares no verifier — cannot advance`.
- **C.2 — Execute.** Run the `Verify:` command; capture exit code + stdout/stderr.
  - Bounded by a per-check wall-clock **timeout (default 300s; optional per-task override)**.
  - Timeout → **FAIL**, logged (no silent caps).
- **C.3 — Separate confirmer (spawned subagent).** Invoke a confirmer via the **Agent tool** — a NEW subagent instance, NOT the Step-B `/ax` builder and NOT a self-prompt — so it cannot inherit the builder's reasoning (structural separation, not a prompt convention). Pass it exactly `{ executed result (exit + output), task diff, task intent }`. It returns a structured verdict — `pass` | `fail` **with a one-line reason**. Per **ODD-8** the executed exit code is the PRIMARY signal: the confirmer may only add a gate ON TOP of an exit-0 pass — it can never flip a non-zero/timeout FAIL into a pass.
- **C.4 — Verdict** (executed exit code is primary — ODD-8):
  - **PASS** — exit 0 AND confirmer `pass` → log completion, then Step D:
    ```
    ✅ Task [N]: [title] — COMPLETE
       Files: [created/modified list]
       Verify: [command] → exit 0 | confirmer: approved
    ```
  - **CHECK-FAIL** — non-zero exit OR timeout → display this message, then HALT via the EX-format block below:
    ```
    ⛔ VERIFIER FAILED at Task [N]: [title]
    Check: [command] → exit [code]   (or: timed out at [N]s)
    Action: Review error, then /fx or resume /phx from task [N]
    ```
  - **CONFIRMER-FAIL** — exit 0 but confirmer returns `fail` (change does not satisfy intent — ODD-7) → display this message, then HALT via the EX-format block below:
    ```
    ⛔ CONFIRMER REJECTED Task [N]: [title]
    Check passed (exit 0) but the change does not satisfy task intent.
    Reason: [confirmer's one-line reason]
    Action: Review the diff vs intent, then /fx or resume /phx from task [N]
    ```
  - **◆ P3 RESOLUTION (D5)** — both FAIL modes HALT for the human, and they stay that way. Phase 3 added the 3-try `/ex→/fx` auto-recovery loop to the **`/if` Workflow path only** (`autonomy-loop.js`), NOT here: interactive `/phx` is deliberately human-gated on verifier fail. Do **not** insert a recovery loop at this seam.

- **On a verifier FAIL or ANY error:** HALT the chain immediately
  - Document error using EX format in plan file Error Log
  - Display halt message:
    ```
    ⛔ PHASE HALTED at Task [N]: [title]
    Error: [brief description]
    Action: Review error, then use /fx or resume with /phx from task [N]
    ```
  - Do NOT continue to next task

### Step D: Advance to next task
- Proceed to Step A for the next uncompleted task in the phase

## 4. Scope Completion

When all tasks in the target list are complete, emit a scope-shaped summary. The wording adapts to scope form:

**✅ SCOPE COMPLETE** — `[phase N | task M | tasks M-K | tasks M,K,L]`

Tasks completed: [count]
Files created:   [list]
Files modified:  [list]
Errors:          [0 or count]

**📋 SCOPE SUMMARY**

What was done:
[2-4 sentences covering what the scope
 accomplished at a feature/system level]

How to test:
[Concrete steps: URLs, commands, UI flows,
 or API calls to verify the scope output
 works end-to-end]

What's next:
[1-3 bullets: next scope to run, remaining
 tasks in the current phase, or
 "run /cf" if this was the final scope]

Next: Review changes, then continue with the next scope or run /cf if done.

## Key Principles

- **Atomic task completion:** Each task is fully complete (plan updated) before next begins
- **Fail-fast:** Any error halts the chain — no partial task completion
- **Resumable:** For `phase N` scope, use `from task N`. For range/list scopes, re-invoke with the remaining task numbers
- **Scope flexibility:** One skill handles single-task, range, list, and full-phase execution — no separate `/tx` needed
- **Inherits all quality gates:** PX checklists + AX validations
- **Context window aware:** Monitors token usage, halts if a task would exceed limits
- **No commits:** All changes remain uncommitted for manual review

**Next:** `/phx phase [N+1]` — execute the next phase, or `/cf` if this was the final phase