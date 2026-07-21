---
type: api
sources: [if/SKILL.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/workflow
  - boundary/core-ado
---

# Autonomy-Loop Launcher Args

> **Summary.** The interface `/if` (the launcher) hands the `autonomy-loop` Workflow: `{ planPath, taskNumbers, budget, branch, integrationVerify, ledgerPath, boardSync }`. The launcher owns all filesystem/shell/clock work (header parsing, ledger I/O, board-adapter resolution) because the Workflow script has none; it threads pre-resolved handles the script consumes to run each task as `/px → /ax → verifier → /ex/fx` stages under a hard budget ceiling.

---

## The call

Step 6 of `/if` invokes the **Workflow** tool — `name: 'autonomy-loop'` (fallback `scriptPath: ~/.claude/workflows/autonomy-loop.js`) — with a single `args` object (code: `plugins/stratagem-core/skills/if/SKILL.md:56`):

```
args: { planPath, taskNumbers, budget, branch, integrationVerify, ledgerPath, boardSync }
```

Invoking `/if` IS the user's explicit opt-in to run this multi-agent Workflow (code: `plugins/stratagem-core/skills/if/SKILL.md:56`). The division of labor is load-bearing: **the launcher owns parsing/fs/shell/clock because the Workflow script has no fs/shell (D5)** (code: `plugins/stratagem-core/skills/if/SKILL.md:34`) and no fs/shell/clock (code: `plugins/stratagem-core/skills/if/SKILL.md:49`).

---

## Arg-by-arg contract

### `planPath`
The resolved plan file. `/if` parses `[plan-file] [phase N | tasks M-K | tasks M,K,L | task M]` and reads the plan (code: `plugins/stratagem-core/skills/if/SKILL.md:28`).

### `taskNumbers`
An **array of integers** — the target scope resolved to concrete uncompleted task numbers (same semantics as `/phx` step 1: skip completed, warn on missing) (code: `plugins/stratagem-core/skills/if/SKILL.md:28`). Two pre-flight sieves shape this array before launch:
- **`Verify:` sweep** — every target task must declare a `Verify:` line; if any is missing, `/if` HALTs and lists offenders. A plan with zero `Verify:` anywhere is legacy and out of scope for `/if` (code: `plugins/stratagem-core/skills/if/SKILL.md:32`).
- **Ledger resume-trim** — already-verified tasks are trimmed (see `ledgerPath`). If trimming empties `taskNumbers`, `/if` reports "all tasks already verified — nothing to launch" and stops — it does not launch an empty scope (code: `plugins/stratagem-core/skills/if/SKILL.md:51`).

### `budget` (D7)
The token ceiling. Read from the plan's `## Budget: <tokens>` header if present; otherwise the **default of 750000** (code: `plugins/stratagem-core/skills/if/SKILL.md:30`). The budget is a hard, harness-enforced stop condition — interactive `/phx` carries none (code: `plugins/stratagem-core/skills/if/SKILL.md:70`).

### `branch`
The feature branch. `## Branch:` if set, else the convention `tony/<plan-slug>` where `<plan-slug>` is the plan filename stem (D7) (code: `plugins/stratagem-core/skills/if/SKILL.md:41`). A **protected-branch guard (D3)** HALTs if the current branch is `staging`/`main` and no explicit `## Branch:` was given (code: `plugins/stratagem-core/skills/if/SKILL.md:42`). The loop never touches git and never commits — the branch only isolates the uncommitted diff for review (code: `plugins/stratagem-core/skills/if/SKILL.md:46`).

### `integrationVerify`
The plan's `## Integration-Verify: <command>` — the plan-level completion gate, the local stand-in for "pipeline green" (code: `plugins/stratagem-core/skills/if/SKILL.md:73`). This header is **mandatory**: an absent/empty value HALTs at pre-flight (step 4 presence guard) and the loop never launches — no skip-with-warning, mirroring the per-task `Verify:` sweep (code: `plugins/stratagem-core/skills/if/SKILL.md:36`). After every per-task gate passes, the loop runs this command once in a fresh instance: exit 0 → feature complete, non-zero → terminal `integration` halt (code: `plugins/stratagem-core/skills/if/SKILL.md:73`).

### `ledgerPath` (G3, Phase 5)
`<plan-dir>/logs/<plan-slug>.ledger.md` — run-state next to the plan (D2), NOT the knowledge vault (code: `plugins/stratagem-core/skills/if/SKILL.md:50`). The launcher owns ledger fs (script has no fs/clock) — it resume-reads on a fresh launch, trimming any task with a `verify | pass` row so a killed run resumes at the last verified task (cross-restart durability) (code: `plugins/stratagem-core/skills/if/SKILL.md:51`). The ledger row layout is `| ts | task | stage | verdict | exit | spent | note |` — it **leads with a timestamp**, so the task number is the 2nd pipe-field, not the first (code: `plugins/stratagem-core/skills/if/SKILL.md:51`). **Skip-loud (D6):** if `logs/` can't be created/written, `/if` warns `⚠ ledger unavailable — launching ledger-less` and sets `ledgerPath = null`; the loop still runs — never fail the launch on telemetry (code: `plugins/stratagem-core/skills/if/SKILL.md:53`).

### `boardSync` (neutral board-adapter handle)
Resolved by presence check: if a board adapter is configured for this run — e.g. a board plugin installed and enabled exposing a board-sync skill — `boardSync` is set to that adapter's skill name; otherwise `boardSync = null` (code: `plugins/stratagem-core/skills/if/SKILL.md:56`). The launcher **names no external system**; it threads a handle it was given (the same delegation as `ledgerPath`) (code: `plugins/stratagem-core/skills/if/SKILL.md:56`). In an ADO install this resolves to [[board-sync-event-map|the board-sync adapter]] — the loop emits the neutral `{event,syncId,task}` signals it consumes, keeping the core board-blind ([[neutral-board-seam]]).

---

## What the loop does with these args

The loop runs each task as discrete real-skill stages — `/px → /ax → verifier → (/ex→/fx on fail)` — under the budget guard, then the plan-level `## Integration-Verify:` gate before declaring the feature complete (code: `plugins/stratagem-core/skills/if/SKILL.md:56`). On a verifier fail it runs up to `maxRecovery` `/ex→/fx` attempts (plugin default **3**), each fed prior failure reasons so fixes diverge (code: `plugins/stratagem-core/skills/if/SKILL.md:72`).

### Halt reasons surfaced on return

| Halt | Nature | Budget resume helps? |
|---|---|---|
| `budget` (reserve-floor breach) | resumable — raise `## Budget:` and resume via `resumeFromRunId` | Yes (code: `plugins/stratagem-core/skills/if/SKILL.md:59`) |
| `recovery-exhausted` (task failed all `maxRecovery` attempts) | terminal — needs human judgment | No (code: `plugins/stratagem-core/skills/if/SKILL.md:60`) |
| `integration` (plan-level gate failed after all per-task gates passed) | terminal — cross-task fault | No (code: `plugins/stratagem-core/skills/if/SKILL.md:61`) |

On `halted:false` (feature complete), `/if` surfaces tasks completed, the integration verdict (`passed`), the feature branch, and the ledger path, ending with "All changes are uncommitted on `<branch>` — review the diff and commit manually" — the never-commit boundary (code: `plugins/stratagem-core/skills/if/SKILL.md:63-65`).

---

## Related

- [[board-sync-event-map]] — what `boardSync` resolves to in an ADO install
- [[sp-field-contract]] — writes the `Sync-Id` markers the loop's board signals reference
- [[neutral-board-seam]] — the neutral seam keeping the launcher board-agnostic
- [[autonomy-loop]] — the `/if` skill + Workflow engine overview these args drive
- [[two-path-model]] · [[verifier-contract]] — the budget/branch and gate contracts these args realize
- [[workflow-auto-install-hook]] — how the Workflow this calls reaches the project
