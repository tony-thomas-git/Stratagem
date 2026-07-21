---
type: architecture
sources: [SKILL.md, autonomy-loop.js, INSTALL.md]
code_sources:
  - "plugins/stratagem-core/skills/if/SKILL.md@v0.1.0"
  - "plugins/stratagem-core/workflows/autonomy-loop.js@v0.1.0"
updated: 2026-07-10
tags:
  - status/active
  - scope/workflow
---

# Autonomy Loop (`/sg:if`)

> **Summary.** `/sg:if` runs a plan scope **unattended** — the Workflow counterpart to interactive `/phx`. The `/if` skill is the **launcher** (a real fs/shell/git context that does all pre-flight: budget resolution, `Verify:` sweep, feature-branch guard, ledger resume, board-adapter resolution), then it invokes the **`autonomy-loop` Workflow script**, which runs `px → ax → verifier → (ex → fx)` per task under a hard token budget and finishes with a plan-level `## Integration-Verify:` gate.

---

## 1. Two halves: launcher (fs/shell) + script (pure)

The design splits along a capability line. The **`autonomy-loop.js` script has NO shell/fs access** — every real action (reading the plan, invoking skills, running `Verify:` commands) happens **inside agents** it spawns (code: `workflows/autonomy-loop.js:8-10`). The script also **has no wall-clock**: `Date.now()` throws inside a Workflow (code: `autonomy-loop.js:39,133`). So the **`/if` skill is the launcher** and owns everything requiring fs/shell/git/clock, "because the Workflow script has no fs/shell (D5)" (code: `skills/if/SKILL.md:34`). This is why headers are parsed by the launcher, the ledger is written by Bash-having agents, and the time is stamped by `date` — never by the script.

The launcher invokes the Workflow tool by `name: 'autonomy-loop'` (fallback `scriptPath: ~/.claude/workflows/autonomy-loop.js`) with `args: { planPath, taskNumbers, budget, branch, integrationVerify, ledgerPath, boardSync }` (code: `skills/if/SKILL.md:56`). The script is placed there by the SessionStart hook — see [[plugin-marketplace-distribution]].

## 2. Launcher pre-flight (the `/if` skill)

Before launch the skill runs, in order (code: `skills/if/SKILL.md:28-56`):

1. **Scope discovery** — parse `[plan-file] [phase N | tasks M-K | tasks M,K,L | task M]`, read the plan, resolve to concrete uncompleted `taskNumbers` (same semantics as `/phx` — skip completed, warn on missing) (code: `SKILL.md:28`).
2. **Budget resolution (D7)** — read the plan's `## Budget: <tokens>` header; if absent use the **default 750000** (code: `SKILL.md:30`).
3. **Pre-flight `Verify:` sweep** — every target task must declare a `Verify:` line; if any is missing, **HALT** and list the offenders — never start a non-gated plan. A plan with zero `Verify:` is legacy and out of scope for `/if` (code: `SKILL.md:32`).
4. **Feature-branch pre-flight + header parse (G1)** (code: `SKILL.md:34-47`):
   - Parse `## Branch:` (optional) and `## Integration-Verify:` (**mandatory**).
   - **Integration-Verify presence guard** — an absent/empty `## Integration-Verify:` is a **HALT**, not a soft-skip; it is the local stand-in for "pipeline green" (code: `SKILL.md:36-40`).
   - **Resolve the branch** — `## Branch:` if set, else convention `tony/<plan-slug>` (code: `SKILL.md:41`).
   - **Protected-branch guard (D3)** — if the current branch is `staging` or `main` AND no explicit `## Branch:` was given → **HALT**; never auto-create or switch branches unattended. The loop never touches git and never commits — the branch only isolates the uncommitted diff (code: `SKILL.md:42-46`).
5. **Ledger lifecycle + resume-read (G3)** — see [[autonomy-run-ledger]]; the launcher owns ledger fs (code: `SKILL.md:49-54`).
6. **Board-adapter resolution (neutral)** — if a board adapter is configured (a board plugin installed + enabled exposing a board-sync skill), set `boardSync` to that adapter's skill name; else `null`. The launcher **names no external system**; it threads a handle it was given (code: `SKILL.md:56`). See [[board-sync-adapter]].

## 3. The per-task loop (script)

For each task number the script runs three stages (code: `autonomy-loop.js:143-231`):

- **Stage 1 — BUILDER.** One subagent invokes the **real `/px` then `/ax`** in a single agent so the `/px→/ax` handoff stays in-context; "Honor LITERAL SKILL INVOCATION — do NOT inline or improvise the skills." PICA fires inside `/ax`. Changes are left **uncommitted** (code: `autonomy-loop.js:160-169`). See [[px-ax-execution]].
- **Stage 2 — VERIFIER + CONFIRMER.** A **separate** agent instance (builder ≠ checker — the P1 C.3 contract, structurally honored by a distinct `agent()` call). It runs the task's `Verify:` command via Bash, reads the actual diff vs the task intent/acceptance, and returns `{ pass, exitCode, reason }` against a `VERDICT` schema (code: `autonomy-loop.js:12-20,173-183`). **The executed exit code is PRIMARY (P1 ODD-8):** a pass may only be *withheld* on top of an exit-0; a non-zero/timeout exit is ALWAYS `pass=false` and can never be flipped to pass (code: `autonomy-loop.js:177-179`).
- **Stage 3 — bounded `/ex → /fx` recovery on FAIL.** Up to `MAX_RECOVERY` attempts (plugin default **3**, override via `opts.maxRecovery`) (code: `autonomy-loop.js:82,194`). Each attempt: budget check first, then an `/ex → /fx` agent, then a **FRESH** re-verifier. Every attempt's `/ex` is fed **all prior failure reasons** so fixes diverge (anti-self-agreement, D4) (code: `autonomy-loop.js:192-220`). Converge → advance; exhaust all attempts → terminal `recovery-exhausted` halt (code: `autonomy-loop.js:222-223`). See [[ex-fx-error-recovery]].

## 4. Budget guard — ceiling, warn, reserve floor

The budget is a **hard, harness-enforced stop** (interactive `/phx` carries none) (code: `SKILL.md:70`). Parameters (code: `autonomy-loop.js:75-89`):

- `CEILING` = `opts.budget` or **750000** (plan `## Budget:` override).
- `RESERVE` = `opts.reserve` or **75000** — halt with this headroom so the escalation summary never overruns.
- `WARN_AT` = **0.8** — surface a Decisions-Made warning at 80% of ceiling.
- Spend is **loop-relative**: `budget.spent()` is the shared cumulative turn spend, so it is baselined once at start (`startSpent`) so the ceiling measures **this run's** spend (code: `autonomy-loop.js:87-89`).

The budget is checked **between tasks** and **first inside every recovery attempt** and before the integration gate — so a reserve breach mid-recovery halts as `budget` (resumable), never reclassified as exhaustion (D2 precedence) (code: `autonomy-loop.js:144-155,196-199,246-250`).

## 5. Three terminal halts (no silent caps)

The loop never caps silently — every halt is logged, surfaced, and carries a distinct `reason` so `/if` keys its resume guidance off it (code: `autonomy-loop.js:91-129`; `SKILL.md:58-61`):

| Halt `reason` | Trigger | Resumable? | `/if` guidance |
|---|---|---|---|
| `budget` | reserve-floor breach | **Yes** — resumable | raise `## Budget:` and resume the same run via `resumeFromRunId` (code: `autonomy-loop.js:91-100`) |
| `recovery-exhausted` | a task failed all `maxRecovery` attempts | **No** — terminal | surface the attempt ledger; needs human — raising `## Budget:` will NOT help (code: `autonomy-loop.js:105-115`) |
| `integration` | plan-level `## Integration-Verify:` failed after all per-task gates passed | **No** — terminal | surface executed command + exit code; a cross-task fault for a human (code: `autonomy-loop.js:120-129`) |

Each halt emits a **greppable terminal marker** — `STATUS · HALT(<reason>) · …` (code: `autonomy-loop.js:98,112,127`). A live `statusLine()` (`STATUS · <where> · done x/y · spent Nk/Mk (P%) · last:… · recovered:…`) is logged at each boundary — pure observability, no control-flow effect (code: `autonomy-loop.js:131-141`).

## 6. The `## Integration-Verify` gate

After **every** per-task verifier passes, the loop runs the plan-level `## Integration-Verify:` command **once** in a FRESH instance (builder ≠ checker at plan scope) — the local stand-in for "ADO pipeline green," exit-code primary (code: `autonomy-loop.js:233-267`). exit 0 → **feature complete**; non-zero/timeout → terminal `integration` halt (code: `autonomy-loop.js:263-266`). The gate timeout defaults to **1800s** (`opts.integrationTimeout`) — a full-solution build is minutes, not 300s (code: `autonomy-loop.js:85`).

The header is **mandatory** at the launcher (§2 step 4): an absent/empty `## Integration-Verify:` HALTs at pre-flight and the loop never launches (code: `SKILL.md:73`). *(Note: the **script** still carries a legacy skip-loud branch for a missing `integrationVerify` arg (code: `autonomy-loop.js:236-242`), but the launcher's mandatory guard means a launched run always has one — so completion always implies the gate ran and passed; there is no `skipped` completion verdict (code: `SKILL.md:64`).)* This gate is `/if`-only — interactive `/phx` is human-verified at close.

## 7. On completion / halt reporting

On `halted:false` the launcher surfaces a single handoff block — tasks completed, integration verdict `passed`, the resolved feature branch, and the ledger path — ending with **"All changes are uncommitted on `<branch>` — review the diff and commit manually"** (never-commit boundary) (code: `SKILL.md:63-65`). On any halt it points the user at the ledger, and notes a fresh `/if` re-launch will **resume-skip** already-verified tasks via the ledger, independent of the in-session `resumeFromRunId` path (code: `SKILL.md:67`). Follow-up: `/cf` to finalize or `/if` again (raised budget) to resume a budget-halted run (code: `SKILL.md:78`).

## Related

- **api** — [[autonomy-loop-args]] — the exact `{planPath, taskNumbers, budget, …, boardSync}` the launcher threads to the Workflow
- **patterns** — [[two-path-model]] — `/phx` (manual) vs `/if` (unattended) over one contract · [[verifier-contract]] — the per-task + integration gates the loop runs · [[idempotency-and-skip-loud]] — the skip-loud posture on telemetry/board · [[neutral-board-seam]] — the seam `boardSync` resolves to
- **decisions** — [[workflow-auto-install-hook]] — how `autonomy-loop.js` reaches a project · [[board-blind-core]] — why the loop names no external system
- **architecture** — [[plugin-marketplace-distribution]] — the bundle + SessionStart sync · [[skill-workflow-engine]] — the `/px`/`/ax`/`/ex`/`/fx` skills run as stages · [[system-topology]]
- **twin (`scope/workflow`)** — [[autonomy-loop-and-budget-guard]] — the same loop from the meta-design / budget-guard angle
- **retrospectives** — [[first-if-autonomy-run]] — the first live cross-repo `/if` dogfood run
