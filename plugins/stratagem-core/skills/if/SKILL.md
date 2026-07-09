---
name: if
description: Implement Feature - launch the budget-guarded autonomy loop (Workflow) for a plan scope
argument-hint: "plan-file (phase N | task M | tasks M-K | tasks M,K,L)"
---

# IF (Implement Feature)

**Purpose:** Run a plan scope UNATTENDED via the budget-guarded autonomy loop — the Workflow counterpart to interactive `/phx`. For human-driven, watch-the-cost execution use `/phx`; use `/if` when you want the loop to run itself under a hard token ceiling.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ IF (Implement Feature) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Plan:   [plan file or "awaiting input"]
 Scope:  [phase N | task M | tasks M-K | tasks M,K,L]
 Budget: [tokens — plan ## Budget: or plugin default]
 Branch: [plan ## Branch: or tony/<plan-slug>]
 Ledger: [<plan-dir>/logs/<slug>.ledger.md — or "skip-loud (logs/ unavailable)"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Scope discovery.** Parse `[plan-file] [phase N | tasks M-K | tasks M,K,L | task M]`. Read the plan and resolve the target list to concrete uncompleted task numbers (same semantics as `/phx` step 1 — skip completed, warn on missing). Build `taskNumbers` (an array of integers).

2. **Budget resolution (D7).** Read the plan's `## Budget: <tokens>` header field. If present, that is the ceiling. If absent, use the **default of 750000** (see `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md` "Autonomy Budget & the Two-Path Loop"). Record `budget = <ceiling>`.

3. **Pre-flight `Verify:` sweep.** Scan the target tasks for `Verify:` lines (mirrors `/phx` step 2): every target task must declare one. If any is missing, **HALT** and list the offenders (`tasks 3, 7 declare no verifier — cannot launch`) — never start a non-gated plan. A plan with zero `Verify:` anywhere is legacy and is out of scope for `/if` (use interactive `/phx`).

4. **Feature-branch pre-flight + header parse (G1, Phase 4).** Before launching — the launcher owns parsing because the Workflow script has no fs/shell (D5):
   - **Parse headers.** Read the plan's `## Branch: <name>` and `## Integration-Verify: <command>` (each optional).
   - **Resolve the branch.** `## Branch:` if set, else the convention `tony/<plan-slug>`, where `<plan-slug>` is the plan filename stem (D7).
   - **Protected-branch guard (D3).** Read the current branch (`git rev-parse --abbrev-ref HEAD`). If it is `staging` or `main` AND no explicit `## Branch:` was given → **HALT**:
     ```
     ⛔ on protected branch '<cur>' — set a "## Branch: tony/<feature>" header or checkout a feature branch before /if
     ```
     Do NOT auto-create or switch branches unattended; auto-create only on explicit user confirmation. The loop never touches git and never commits — the branch only isolates the uncommitted diff for review.
   - **Surface** the resolved feature branch in the banner.

5. **Ledger lifecycle + resume-read (G3, Phase 5).** The launcher owns ledger fs because the Workflow script has no fs/shell/clock (the same delegation as header-parsing above):
   - **Resolve the path.** `ledgerPath = <plan-dir>/logs/<plan-slug>.ledger.md` — run-state lives next to the plan (D2), NOT the knowledge vault.
   - **Resume-read FIRST (before creating/appending).** If a ledger already exists, read it and collect every task number that already carries a `verify | pass` row (a *verified* boundary). **Mind the column order:** a row is `| ts | task | stage | verdict | exit | spent | note |` — the row **leads with a timestamp**, so the task number is the **2nd** pipe-field, the stage the **3rd**, the verdict the **4th**. Extract the task number from field 3 (1-based incl. the leading empty field) only when stage=`verify` AND verdict=`pass` — e.g. `awk -F'|' '$4 ~ /verify/ && $5 ~ /pass/ {gsub(/ /,"",$3); print $3}'`. Do NOT anchor the task number as the first field (it isn't — the timestamp is). **Trim those task numbers from `taskNumbers`** so a killed/crashed run resumes at the last verified task, not the start (cross-restart durability). Surface the skip: `↩ resume: ledger shows tasks [1,2] verified — skipping; launching [3-6]`. Skip ONLY on a `verify | pass` row, never on a build-only or failed row. If trimming empties `taskNumbers`, report "all tasks already verified — nothing to launch" and stop (do not launch an empty scope).
   - **Create + header.** Ensure `logs/` exists and append a run header via Bash (`mkdir -p "<plan-dir>/logs"` then write `## Run <date> · scope tasks [...] · budget <ceiling> · branch <branch>`). The launcher has Bash; stamp the time here (`date`), never in the script.
   - **Skip-loud on failure (D6).** If `logs/` can't be created or written, **warn** (`⚠ ledger unavailable — launching ledger-less; observability degraded`) and set `ledgerPath = null`. The loop still runs; never fail the launch on telemetry.
   - **Surface** the resolved ledger path (or the skip-loud notice) in the banner.

6. **Resolve the board adapter, then launch the autonomy loop.** First, **board-adapter resolution (neutral, presence-checked):** if a board adapter is configured for this run — e.g. a board plugin is installed and enabled exposing a board-sync skill — set `boardSync` to that adapter's skill name; otherwise `boardSync = null`. The launcher names no external system; it threads a handle it was given (the same delegation as `ledgerPath`). Then invoke the **Workflow** tool — `name: 'autonomy-loop'` (fallback `scriptPath: ~/.claude/workflows/autonomy-loop.js`) — with `args: { planPath, taskNumbers, budget, branch, integrationVerify, ledgerPath, boardSync }`. Invoking `/if` IS the user's explicit opt-in to run this multi-agent Workflow. The loop runs each task as discrete real-skill stages (`/px` -> `/ax` -> verifier -> `/ex`->`/fx` on fail) under the budget guard, then a plan-level integration gate (`## Integration-Verify:`) before declaring the feature complete.

7. **Report on completion.** When the Workflow returns (or a `<task-notification>` arrives), surface: tasks completed, attempts used on any `/ex→/fx` recovery, and the halt reason if any — `budget` vs `recovery-exhausted`:
   - **`budget`** (reserve-floor breach) → **resumable**: report the escalation summary (spent/ceiling, stopped-before-task) and tell the user to raise `## Budget:` and resume the same run via `resumeFromRunId`.
   - **`recovery-exhausted`** (a task failed all `maxRecovery` attempts) → **terminal**: surface the attempt ledger; this needs human judgment — raising `## Budget:` will NOT help, so do **not** suggest a budget resume.
   - **`integration`** (the plan-level `## Integration-Verify:` gate failed after every per-task gate passed) → **terminal**: surface the executed command + exit code; this is a cross-task fault for human diagnosis — raising `## Budget:` will NOT help, so do **not** suggest a budget resume (same posture as `recovery-exhausted`).

   **On `halted:false` (feature complete)** → surface a single handoff block:
   - **Tasks completed** (count + list) · **Integration verdict** — `passed` (exit 0) or `skipped` (carry the loop's loud "no `## Integration-Verify:`" warning verbatim) · the resolved **feature branch** · the **ledger path** (`<plan-dir>/logs/<slug>.ledger.md`, or the skip-loud notice if it ran ledger-less).
   - End with: **"All changes are uncommitted on `<branch>` — review the diff and commit manually."** (never-commit boundary).

   On ANY halt (`budget` / `recovery-exhausted` / `integration`), also point the user at the **ledger** for the per-task run trail (verdicts, spend, timing) — and note that a fresh `/if` re-launch will **resume-skip** the already-verified tasks via the ledger (cross-restart), independent of the in-session `resumeFromRunId` path.

**Key Principles:**
- **Unattended path only** — the budget is a hard, harness-enforced stop condition; interactive `/phx` carries no budget.
- **Reuse, don't re-derive** — scope discovery and the `Verify:` sweep mirror `/phx`; the per-task gate is P1's C.1-C.4 contract, executed inside the loop.
- **Bounded recovery** — on a verifier fail the loop runs up to `maxRecovery` `/ex→/fx` attempts (plugin default **3**), each fed prior failure reasons so fixes diverge, then converges or halts `recovery-exhausted`. Override via an optional `## Recovery-Attempts: <N>` plan header — documented now; the active override channel is `opts.maxRecovery` (header parsing deferred, default 3 applies meanwhile).
- **Plan-level completion gate (Phase 4)** — after every per-task gate passes, the loop runs the plan's `## Integration-Verify:` once in a fresh instance (the local stand-in for "ADO pipeline green"): exit 0 → feature complete, non-zero → terminal `integration` halt. Absent header → **skipped with a surfaced warning**, never silently. `/if`-only — interactive `/phx` is human-verified at close.
- **Observability + durability (Phase 5)** — the launcher creates a per-run markdown ledger at `<plan-dir>/logs/<slug>.ledger.md` and reads it on a fresh launch to **resume-skip** already-verified tasks (cross-restart, task-granular). The loop emits a live `STATUS` line per boundary. The script never writes the ledger (no fs/clock) — agents append rows. Skip-loud if `logs/` is unavailable; the loop never fails on telemetry. Scope is honestly 🔴→🟡 (markdown ledger, not durable mid-execution state).
- **No silent caps** — the loop logs every budget warn, the breach-halt, and the full recovery attempt ledger; surface them verbatim.
- **No commits** — all changes remain uncommitted for manual review.

**Next:** review the loop's result, then `/cf` to finalize the feature or `/if` again (raised `## Budget:`) to resume a budget-halted run.
