---
type: pattern
sources: [cp/SKILL.md, if/SKILL.md, stratagem-core-rules.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/workflow
---

# Two-Path Execution Model

> **Summary.** A locked plan runs one of two ways over the **same** per-task `px → ax → verify` contract, differing only in the driver: `/phx` is manual (human-in-the-loop, no hard budget, halts on first error for review) and `/if` is unattended (a budget-guarded autonomy-loop Workflow that runs itself, auto-recovers via `/ex → /fx`, and closes on a plan-level integration gate). `/cp` closes every plan by presenting both routes in a mandatory bifurcation banner.

---

## 1. The two paths

The plugin defines exactly two execution paths for a locked plan (code: `plugins/stratagem-core/stratagem-core-rules.md:L187-L189`):

- **Interactive `/phx`** — human-driven, per-phase. **No hard budget** — the human watches cost. Halts on the first error for manual review (code: `stratagem-core-rules.md:L188`; code: `skills/cp/SKILL.md:L307-L311`).
- **Unattended `/if`** — a Workflow run that drives `px → ax → verifier → advance` per task with a **harness-enforced token budget** (code: `stratagem-core-rules.md:L189`; code: `skills/if/SKILL.md:L9`).

`/if`'s own purpose statement frames the pair: *"the Workflow counterpart to interactive `/phx`. For human-driven, watch-the-cost execution use `/phx`; use `/if` when you want the loop to run itself under a hard token ceiling."* (code: `skills/if/SKILL.md:L9`).

## 2. Same contract, different driver

Both paths execute the identical per-task unit — `/px` (analyze) → `/ax` (implement) → verifier gate — and both reference the single-source per-task gate defined once in `/phx` Step C (C.1–C.4); neither re-authors it (code: `stratagem-core-rules.md:L220`). What differs is the **driver**:

| Aspect | `/phx` (manual) | `/if` (unattended) |
|---|---|---|
| Driver | Human chains phases | `autonomy-loop` Workflow script |
| Budget | None — human watches cost | Hard `## Budget:` ceiling (default 750k) |
| On error | Halts for review | Bounded `/ex → /fx` auto-recovery (default 3) |
| Completion | Human-verified at close | Plan-level `## Integration-Verify:` gate |
| Branch guard | — | HALTs on `staging`/`main` absent a feature branch |

(code: `stratagem-core-rules.md:L205-L209`; code: `skills/if/SKILL.md:L69-L76`)

## 3. Why the budget belongs only to `/if`

Autonomous loops compound token cost super-linearly, so an unattended loop needs "a token ceiling that can say 'no' independent of the goal — the single most important guard" (code: `stratagem-core-rules.md:L185`). The budget is a first-class stop condition, harness-enforced via the `budget.*` API (code: `stratagem-core-rules.md:L185`, `L189`). Interactive `/phx` carries **no** budget because a human is present to watch cost (code: `skills/if/SKILL.md:L70`). See [[budget-guard]] for the ceiling / reserve-floor / warn-threshold defaults.

## 4. `/if`-only machinery

Three mechanisms exist only on the unattended path — they replace the human `/phx` would rely on:

- **Bounded recovery** — on a verifier fail the loop runs up to `maxRecovery` `/ex → /fx` attempts (default **3**), each fed prior failure reasons so fixes diverge, then converges or halts `recovery-exhausted` (terminal) (code: `skills/if/SKILL.md:L72`; code: `stratagem-core-rules.md:L197-L204`).
- **Plan-level completion gate** — after every per-task gate passes, the loop runs `## Integration-Verify:` once in a fresh instance; exit 0 → complete, non-zero → terminal `integration` halt (code: `skills/if/SKILL.md:L73`). See [[verifier-contract]].
- **Ledger + resume** — a per-run markdown ledger at `<plan-dir>/logs/<slug>.ledger.md` lets a fresh launch resume-skip already-verified tasks (cross-restart) (code: `skills/if/SKILL.md:L74`; code: `stratagem-core-rules.md:L211-L216`).

`/if` also HALTs on a protected branch (`staging`/`main`) absent an explicit `## Branch:`, isolating the uncommitted diff on a review branch; the loop itself never touches git and never commits (code: `skills/if/SKILL.md:L42-L46`).

## 5. Choosing a path — `/cp`'s bifurcation banner

`/cp`'s final, mandatory step recommends a path for *this* plan and **always** presents both routes in a terminal bifurcation banner — it may never collapse to a single launch prompt or auto-pick a mode (code: `skills/cp/SKILL.md:L296-L322`, `L348-L365`, `L378`).

- **Favor manual (`/phx`)** when a task needs human-at-browser smoke testing, acceptance criteria are mixed/not code-observable, you want to watch cost or halt cleanly on error, or decisions still lurk (code: `skills/cp/SKILL.md:L307-L311`).
- **Favor unattended (`/if`)** when every task declares an objective `Verify:`, acceptance criteria are code-observable, all decisions are locked, and you're comfortable letting the loop self-recover within budget (code: `skills/cp/SKILL.md:L313-L317`).
- **Split** — run the autonomous remainder unattended and do the one human-eyes task manually (code: `skills/cp/SKILL.md:L319-L320`).

The banner emits `▶ My lean:` — an opinionated recommendation with one-line reasoning — but the lean never replaces the fork; the user picks (code: `skills/cp/SKILL.md:L364`, `L379`).

## 6. Literal composition on both paths

On both paths a skill that chains other skills invokes them via the Skill tool — never paraphrasing their logic. On the interactive path this is agent discipline; on the `/if` Workflow path it is **structural** — each phase is a discrete `agent()` stage that literally runs its skill, so the deterministic script *cannot* fold them into one improvised thread (code: `stratagem-core-rules.md:L218`, `L231-L232`).

## Related

- [[autonomy-loop]] — the Workflow engine `/if` launches (budget guard, recovery, halts)
- [[verifier-contract]] — the per-task + plan-level gates both paths honor
- [[autonomy-loop-args]] — the `budget` / `branch` / `integrationVerify` args that realize the `/if` column
- [[skill-shape]] — the SKILL.md layout `/phx` and `/if` conform to
- [[skill-workflow-engine]] — the mode catalog and composition chains this fork lives in
