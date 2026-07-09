---
type: anti-pattern
sources:
  - C:\code\Steward\CLAUDE.md
  - phase2-budget-guard_260625_163229_plan.md
  - phase4-loop-completes-plan_260628_161836_plan.md
  - phase5-observability-durability_260628_174746_plan.md
updated: 2026-06-28
tags:
  - status/active
  - scope/workflow
  - layer/orchestrator
---

# Workflow-Script Authoring Gotchas

> **Summary.** Six concrete defects that block or silently break a harness `Workflow` script — each invisible until runtime and each *looks* like a no-op success rather than an error. AP-1–AP-3 surfaced launching the Phase 2 autonomy loop; AP-4–AP-5 surfaced completing Phase 4's integration gate; AP-6 surfaced building Phase 5's run-ledger. Apply them to every future Workflow (including the ADO SP/DX skills).

## AP-1 — `meta` must be a pure literal

The `meta` object (and its `description`) must be a **pure literal** — no `+` string concatenation, no computed values anywhere. The validator rejects a `BinaryExpression` with `meta must be a pure literal` and the run never starts.

**Fix:** keep `description` a single string literal.

## AP-2 — `args` may arrive as a JSON-encoded STRING

In background runs the harness delivers `args` as a **JSON-encoded string**, not a parsed object. Reading `args.planPath` then yields `undefined` and the loop no-ops with 0 agents — a silent, confusing failure.

**Fix:** normalize at the top, then read from the normalized object:
```js
let opts = args
if (typeof opts === 'string') { try { opts = JSON.parse(opts) } catch (e) { opts = null } }
```

## AP-3 — `budget.spent()` is SHARED cumulative turn spend

`budget.spent()` returns output tokens for the **whole turn** (main loop + all workflows), not just this loop. A mid-session launch inherits prior spend, so a naive `ceiling - budget.spent()` can be negative at task 1 → instant halt before any work.

**Fix:** baseline once and measure loop-relative:
```js
const startSpent = budget.spent()          // before the loop
// inside: const spent = budget.spent() - startSpent
```
So a budget means "tokens **this run** may spend," independent of launch time.

## AP-4 — an empty task list skips post-loop stages

`/if` resolves only *uncompleted* tasks. Re-run a plan whose tasks are all `[x]` → `taskNumbers` is `[]` → the loop's guard `if (taskNumbers.length === 0) return` fires and **early-exits before any post-loop stage** (e.g. the Phase 4 integration gate). The feature *looks* "done" but the plan-level gate never ran.

**Fix:** decide deliberately whether post-loop stages should run on an empty task list, and **surface a zero-task launch** rather than returning silently — a no-op return reads as success.

## AP-5 — a string header value is truthy (guard on absence, not falsiness)

A plan header arrives as a **string**, and `"false"` / `"0"` / `"off"` are all **truthy** in JS. A gate guarded `if (!integrationVerify)` to mean "header absent" works *only* because absence yields `undefined`/`null` — NOT because the value is falsy. `## Integration-Verify: false` does not *disable* the gate; it **runs `false` as a command** (exit 1). The header value is a *command*, never a boolean.

**Fix:** guard on absence explicitly (`if (integrationVerify == null)`) and document the value as a shell command. (The truthy-string behavior is itself correct — it is how a deliberately-failing smoke test exercises the fail path — but it surprises authors who read `false` as "off".)

## AP-6 — no clock in the script

`Date.now()`, `new Date()` (argless), and `Math.random()` **throw** inside a Workflow script — they would break the harness's resume/replay (a replayed run must be deterministic). So a script can never timestamp its own output. When Phase 5's loop needed a wall-clock time for each ledger row, the script had no way to produce one.

**Fix:** push every timestamp to the layer that *can* produce one — an `agent()` stamps it via Bash (`$(date +%H:%M)`), or the launcher stamps the run header before/after the Workflow call. The script only `log()`s relative facts it already holds (task index, `budget.spent()`). This is the same delegation that lets the clock-less, fs-less script own a *file* ledger: see [[autonomy-loop-and-budget-guard]] (the launcher + verifier agents write; the script only threads paths into prompts).

## Why these matter

Each is invisible until runtime and each *looks* like a no-op success (0 agents, instant return) rather than an error. Without these six checks, the next Workflow author re-discovers them the hard way. (source: `C:\code\Steward\CLAUDE.md`, Workflow-script gotchas.)

## Related

- [[autonomy-loop-and-budget-guard]] — the Workflow these were found authoring
- [[literal-skill-composition]] — what the Workflow's discrete stages enforce
