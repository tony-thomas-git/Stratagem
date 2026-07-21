---
type: pattern
sources: [cp/SKILL.md, if/SKILL.md, stratagem-core-rules.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/skills
---

# Verifier Contract

> **Summary.** Two always-on gates prove work is done objectively. Per task, a `Verify:` line — a single shell command whose exit 0 proves that one task complete — authored by `/cp` for every task. Per plan, a mandatory `## Integration-Verify:` header — a single command run once after every per-task gate passes, the local stand-in for "pipeline green." Both are pre-flight HALTs: a plan missing either never launches under `/if`.

---

## 1. The per-task `Verify:` line

`/cp` emits a `Verify:` line for **every** task — "a single shell command whose exit 0 objectively proves the task complete" (e.g. `Verify: npm test -- auth.spec && eslint src/auth`) (code: `plugins/stratagem-core/skills/cp/SKILL.md:L92-L94`). It is always-on: *"There is **no `Verifier:` opt-in flag** — the verifier is always-on."* (code: `skills/cp/SKILL.md:L96`). A verifier-era plan with any task missing `Verify:` **HALTs** at `/phx`'s upfront sweep (code: `skills/cp/SKILL.md:L95`).

Each task in the plan template carries its own line:

```markdown
- [ ] Task 1: Description with acceptance criteria
  - Verify: <single shell command — exit 0 proves this task complete>
```
(code: `skills/cp/SKILL.md:L172-L177`)

## 2. Build-cost guard (decision #10) — scoped filters

A test-running `Verify:` must target the layer's **native test runner** and stay **scoped** so it never triggers a whole-solution build (code: `skills/cp/SKILL.md:L98-L110`):

| Layer | Runner | Scoped `Verify:` shape |
|---|---|---|
| Native C++ | GoogleTest | `<test-exe> --gtest_filter="SuiteName.*"` |
| Managed C# | MSTest / xUnit | `dotnet test --filter "FullyQualifiedName~SuiteName"` |

The guard: a per-task `Verify:` MUST use a scoped filter that compiles/runs only that task's suite — *never* `dotnet test` bare or an unfiltered GoogleTest binary, which forces a full rebuild + full-suite run on every task gate (code: `skills/cp/SKILL.md:L104-L110`). The full build and whole-suite run are **deferred to the plan-level gate** (§3).

## 3. The plan-level `## Integration-Verify:` gate

One command, run **once** after all per-task gates pass — "the local stand-in for 'pipeline green'" (full build / whole-suite run / cross-task smoke); exit 0 → feature complete (code: `skills/cp/SKILL.md:L189`). It is the build-cost-guarded home for the work the per-task scoped filters deliberately defer (code: `skills/cp/SKILL.md:L198-L199`).

Unlike the optional `## Budget:` and ADO headers, `## Integration-Verify:` is **MANDATORY — always emit it** (code: `skills/cp/SKILL.md:L196`). `/cp`'s presence self-check reports `Integration-Verify: present` and authors it before emitting if missing (code: `skills/cp/SKILL.md:L224-L226`).

## 4. Enforcement as pre-flight HALTs

Both gates are hard HALTs at launch, never soft-skips:

- **Per-task sweep** — `/if` step 3 scans target tasks for `Verify:` lines; any missing → HALT (`tasks 3, 7 declare no verifier — cannot launch`). A plan with zero `Verify:` anywhere is legacy and out of scope for `/if` (code: `plugins/stratagem-core/skills/if/SKILL.md:L32`).
- **Integration presence guard** — `/if` step 4: an absent/empty `## Integration-Verify:` → HALT with `⛔ no "## Integration-Verify: <command>" header …`; does *not* fall through to skip-with-warning (code: `skills/if/SKILL.md:L36-L40`). `/cp` mirrors this: a plan without it HALTs at `/if` pre-flight (code: `skills/cp/SKILL.md:L200-L201`).

*"both gates are mandatory pre-flight HALTs, never soft-skips."* (code: `skills/if/SKILL.md:L40`).

## 5. Single-source verifier contract (C.1–C.4)

The per-task gate is defined **once** — in `/phx` Step C (C.1–C.4). Both callers, the interactive `/phx` skill and the `/if` Workflow stage, *reference* it; neither re-authors. Change-coupling: edits to the gate contract update both call sites (code: `plugins/stratagem-core/stratagem-core-rules.md:L220`). Inside the [[two-path-model]] loop, `/if` runs each task as `/px → /ax → verifier → advance`, with the verifier being that same C.1–C.4 gate executed in a fresh instance — builder ≠ checker (code: `skills/if/SKILL.md:L56`, `L71`).

## 6. The integration gate as a distinct halt semantic

When the plan-level gate fails after every per-task gate passed, `/if` halts `integration` — terminal, plan-level, **no auto-recovery**: a cross-task integration failure needs human diagnosis (may be a decomposition fault, not a code fault) (code: `stratagem-core-rules.md:L207`; code: `skills/if/SKILL.md:L61`). Default build timeout is **1800s** (a full-solution build is minutes; the per-task 300s is far too short) (code: `stratagem-core-rules.md:L207`). Raising `## Budget:` does not help — do not suggest a budget resume (code: `skills/if/SKILL.md:L61`).

## Related

- [[two-path-model]] — `/phx` vs `/if`, both driving this per-task gate
- [[autonomy-loop]] — the Workflow that runs the per-task verifier + integration gate
- [[autonomy-loop-args]] — `integrationVerify` / `taskNumbers`: how these gates enter the loop
- [[skill-shape]] — the SKILL.md layout `/cp` and `/if` conform to
- [[skill-workflow-engine]] — where `/cp` emits `Verify:` in the lifecycle
