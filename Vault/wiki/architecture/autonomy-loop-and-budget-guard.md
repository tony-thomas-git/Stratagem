---
type: architecture
sources:
  - C:\code\Steward\CLAUDE.md
  - phase2-budget-guard_260625_163229_plan.md
  - phase3-recovery-loop_260626_134136_plan.md
  - phase4-loop-completes-plan_260628_161836_plan.md
  - phase5-observability-durability_260628_174746_plan.md
updated: 2026-06-28
tags:
  - status/active
  - scope/workflow
  - layer/orchestrator
---

# Autonomy Loop & the Two-Path Model

> **Summary.** Stratagem runs feature execution two ways: **interactive `/phx`** (human-driven, per-phase, no hard budget — the human watches cost) and an **unattended autonomy loop** (a Workflow launched by `/if`, with a harness-enforced **token budget** as a first-class stop condition). Both reuse the same per-task verifier gate; only the autonomy path carries the budget. On a verifier fail the autonomy path runs a **bounded `/ex→/fx` recovery micro-loop** (up to N=3 attempts, each fed prior failure reasons so fixes diverge) before it converges or escalates — within the budget, which always takes precedence. **Phase 4** adds the plan-level bookend: after every per-task gate passes, a single budgeted **final integration gate** runs the plan's `## Integration-Verify:` (the local stand-in for "ADO pipeline green") — exit 0 → feature complete, non-zero → a third **terminal `integration` halt** — plus a **feature-branch pre-flight** that keeps the loop's uncommitted diff off `staging`/`main`. **Phase 5** makes a running loop *trustworthy at scale*: a per-run append-only **markdown ledger** (one row per verifier boundary) gives observability, each row doubles as a **checkpoint** so a fresh `/if` launch **resume-skips** already-verified tasks across restarts, and a live **STATUS** line surfaces progress — all written by the launcher + agents because the script has no fs/clock (honest scope: 🔴→🟡, not a durable state machine).

## Why two paths

Autonomous loops compound token cost super-linearly — "the single most important guard before Phase 3" (source: `C:\code\Steward\CLAUDE.md`). Because the harness `budget.*` API exists only inside a Workflow script, the budget-guarded loop *must* run as a Workflow. The interactive `/phx` skill stays unchanged for human-driven runs where the human is the cost governor.

## The loop (per task)

Discrete `agent()` stages — this is where [[literal-skill-composition]] is enforced structurally:

1. **build** — one subagent invokes the real `/px` then `/ax` (PICA inside), preserving the px→ax handoff.
2. **verify** — a *separate* instance (builder ≠ checker) runs the task's `Verify:` command and judges intent-vs-diff; the executed exit code is primary.
3. **recover** — on FAIL, a **bounded `/ex`→`/fx` micro-loop** (`MAX_RECOVERY` = 3, `opts.maxRecovery` override): a *fresh* re-verify after each attempt; **break** on pass (advance), else **escalate terminally** after N. See *Bounded recovery & the two halt semantics* below.

## The budget guard

- **Ceiling:** plan-sourced — per-plan `## Budget:` else a Steward default (750k tokens).
- **Spend:** `budget.spent()` is the *shared cumulative turn* spend, so it is **baselined** at loop start (`startSpent`) and measured loop-relative — a budget means "tokens **this run** may spend," independent of launch time (see [[workflow-script-authoring-gotchas]]).
- **Behavior:** an 80% **warn** surfaces in the Trust-But-Verify Decisions-Made block; below a reserve floor (75k) the loop **hard-halts** with an `/ex`-style escalation summary and `resumeFromRunId`. **No silent caps** — every warn and halt is logged.

## Bounded recovery & the two halt semantics

On a verifier FAIL the autonomy loop runs up to **N=3** `/ex→/fx` attempts (`MAX_RECOVERY`, overridable via `opts.maxRecovery` / an optional `## Recovery-Attempts:` plan header) before giving up:

- **Budget checked FIRST each attempt (D2).** A reserve-floor breach mid-recovery halts as the **resumable** `budget` reason — never reclassified as exhaustion. The two halts are load-bearing and must not be conflated:
  - `budget` → **resumable**: raise `## Budget:`, resume via `resumeFromRunId`.
  - `recovery-exhausted` → **terminal**: needs human judgment; the full attempt ledger is surfaced; raising the budget will **not** help.
- **Anti-self-agreement (D4).** Each retry's `/ex` receives *all prior failure reasons* with an explicit "do NOT repeat — diverge" instruction; re-verify is always a fresh instance (builder ≠ checker). The defense against "an agent agreeing with itself at high speed" is a real task, not a counter.
- **Scope boundary (D5).** Auto-recovery is the **`/if` (Workflow) path only**. Interactive `/phx` stays human-gated on fail — it HALTs, never auto-recovers.
- **No silent caps** — every attempt line, the budget warn, and the terminal/budget halt are logged verbatim.
- **(Phase 4 adds a third terminal halt — `integration`** — plan-level; see *The completion contract* below. Like `recovery-exhausted` it carries no budget-resume.)

## The completion contract & branch pre-flight (Phase 4)

Per-task gates prove each task in isolation; they cannot prove the feature **builds as a whole**. Phase 4 adds a plan-level bookend, **`/if`-path only** (interactive `/phx` stays human-verified at close — the same scope boundary as D5):

- **Final integration gate (G2).** After every per-task gate passes, ONE budget-checked, *fresh-instance* run of the plan's `## Integration-Verify:` command — builder ≠ checker at plan scope, exit code primary. It is the **local stand-in for "ADO pipeline green"** (the tool-backed completion signal of the ADO track, applied without ADO). Exit 0 → feature complete; non-zero → `integrationEscalation()`.
- **A third halt semantic — `integration`.** Terminal, plan-level, **no auto-recovery** (a cross-task fault needs human diagnosis — it may be a decomposition error, not a code one). The third sibling to `escalation()` (budget) and `recoveryEscalation()`; like the latter it carries **no budget-resume** advice. Default build timeout **1800s** (a full build is minutes, not the per-task 300s).
- **Absent header → skip-loud.** No `## Integration-Verify:` → the gate is skipped with a *surfaced* warning, never silently and never with a fabricated build command.
- **Feature-branch pre-flight (G1).** `/if` resolves `## Branch:` (else the convention `tony/<plan-slug>`) and **HALTs on a protected branch** (`staging`/`main`) absent an explicit feature branch — the loop's uncommitted diff lands on a review branch, never trunk. The loop never touches git; never-commit holds.
- **Feature-complete handoff (G3).** On success `/if` surfaces one block: tasks · integration verdict (passed / skipped-with-warning) · branch · "uncommitted — review & commit manually."

Two authoring gotchas this exposed — an empty task list skips the post-loop gate, and a string header value is truthy — are in [[workflow-script-authoring-gotchas]] (AP-4, AP-5).

## Observability & durability (Phase 5)

Phases 1–4 make the loop *run*; Phase 5 makes a long unattended run *trustworthy* — the two axes the landscape contrast scored honestly behind the frontier (observability, durability). `/if`-path only, same scope boundary as the rest.

- **The run ledger (observability).** Every loop writes an **append-only markdown ledger** at `<plan-dir>/logs/<slug>.ledger.md` — run-state next to the plan it executes, git-reviewable, *not* in the knowledge vault. One row per **verifier boundary** (each per-task verdict incl. recovery sub-attempts), plus the integration verdict and a greppable `STATUS · HALT(<reason>)` on every terminal path: `| ts | task | stage | verdict | exit | spent | note |`. Mirrors the wiki `CHANGELOG.md` pattern; resolves the impl roadmap's open audit-trail question.
- **The script never writes it — delegation is the whole design.** A Workflow script has no fs, no shell, **no clock** (`Date.now()` throws — see [[workflow-script-authoring-gotchas]] AP-6). So the ledger is written by the layers that *do* have Bash: the **`/if` launcher** creates the run header and reads the ledger back for resume; the **verifier agents** append each row, stamping the time themselves (`$(date)`). The script only `log()`s the live **STATUS** line (`task k/N · spent X/CEILING (Z%) · last:<verdict> · recovered:<n>`) — it alone knows `budget.spent()`. This is the same launcher-does-the-fs delegation P4 used for header-parsing, extended to writes. **Cost:** zero added `agent()` calls — the append folds into the verifier that already runs Bash.
- **Ledger-row-as-checkpoint (durability).** Each `verify | pass` row *is* a checkpoint. On a fresh launch the launcher reads the ledger, collects verified task numbers, and **trims them from the scope** — resuming at the last *verified* boundary, not the round start. This is the **cross-restart** path; it composes with the harness's in-session `resumeFromRunId` (journal replay). Honest scope: task-granular checkpoint/resume (🔴→🟡), **not** a durable mid-execution state machine.
- **The row format is a contract — name the columns.** The resume-reader parses the ledger the writer produced, so the row shape is a shared interface. The row **leads with a timestamp**, so the task number is field *2*, the stage field *3*, the verdict field *4*. The first cut of the resume-read prose said only "collect the task number that carries a `verify | pass` row" and a naive extractor anchored field 1 → matched nothing → a silent wrong-resume risk (re-runs completed work). **Lesson:** when a skill's prose becomes a parser, it must specify the data's shape — name the columns and give the exact extraction (`awk -F'|' '$4 ~ /verify/ && $5 ~ /pass/ {gsub(/ /,"",$3); print $3}'`). Surfaced live as EX-260628-P5-1, fixed in-flight.
- **Skip-loud, never fail on telemetry.** If `logs/` can't be created, the launcher warns and passes `ledgerPath = null`; the loop runs ledger-less. Observability degrades; the loop never fails because a row couldn't be written — same posture as the integration skip-loud.

## Validation note

The loop's mechanics were proven by a real smoke-test run (discrete real-skill stages + PICA confirmed, builder≠checker, reserve-floor halt + escalation surfaced verbatim). The run also unmasked the three [[workflow-script-authoring-gotchas]]. **Phase 3's bounded recovery** was proven by unattended `/if` runs (recover-within-N; exhaust-N→terminal; budget-precedes-exhaustion) plus a `/phx` regression confirming the D5 boundary. That regression *read* also caught a **stale forward-reference seam comment** a later decision had overruled — see [[forward-reference-comments-go-stale]]. **Phase 4's completion gate + branch pre-flight** were proven by live `/if` runs — feature-complete (exit 0), a terminal `integration` halt (`## Integration-Verify: false` → exit 1, no budget-resume), and a G1 branch-HALT on `staging` — plus a reasoned skip-loud path. **Phase 5's ledger + resume** were proven by two live `/if` runs: a full scope landing three ledger rows (per-task + integration verdict, agent-stamped), then a **cross-restart resume** that — after a simulated kill (ledger truncated to the task-1 row) — read the ledger, trimmed the verified task, and launched only the unverified one (exit 0). The first live run also surfaced EX-260628-P5-1 (the resume-read column contract), fixed in-flight.

## Related

- [[literal-skill-composition]] — enforced structurally by the discrete stages
- [[workflow-script-authoring-gotchas]] — pitfalls of the Workflow this loop is built on
- [[spike-to-retire-capability-uncertainty]] — how the Skill-in-Workflow unknown was retired before building
- [[trust-but-verify-mid-task-gate]] — where the budget warn/halt surfaces
- [[tracer-bullet-discipline]] — the single-feature-first build order this followed
- [[forward-reference-comments-go-stale]] — the seam-comment hazard P3's regression surfaced
