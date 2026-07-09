---
type: summary
sources:
  - Steward-CLAUDE.md
  - mpx-hard-stop_260225_retrospective.md
updated: 2026-06-14
tags:
  - status/active
  - scope/workflow
---

# Operating Modes

> **Summary.** The discrete slash commands that drive a Stratagem feature
> lifecycle. Modes are designed to compose: a feature flows from planning
> (`/pf`) through task breakdown (`/cp`), per-task analysis (`/px`),
> implementation (`/ax`), and close-out (`/cf`), with branching paths for
> errors (`/ex`→`/fx`), small tasks (`/mpx`→`/max`), and audits (`/pica`).

## The full lifecycle

```
Planning → Breakdown → Per-task → Implementation → Close-out
  /pf   →   /cp    →   /px    →     /ax       →    /cf
```

*(source: `Steward-CLAUDE.md`, §"Composition Patterns")*

## Mode catalog

| Mode | Purpose |
|------|---------|
| `/pf` | **Plan Features** — comprehensive feature planning |
| `/cp` | **Create Plan** — break feature into tasks |
| `/px` | **Plan Execute** — analyze one specific task |
| `/ax` | **Authorize Execution** — implement the planned task |
| `/cf` | **Complete Feature** — finalize, generate executive summary |
| `/ex` | **Error Executing** — document errors, create fix plan |
| `/fx` | **Fix Execution** — implement fixes for errors logged in `/ex` |
| `/mpx` | **Memory Plan Execute** — quick in-memory plan for <5-file tasks |
| `/max` | **Memory Authorize Execute** — execute the mPX plan |
| `/phx` | **Phase Execute** — chain `/px`→`/ax` across all tasks in a phase |
| `/pica` | **Post-Implementation Compliance Audit** — pattern consistency check |
| `/rs` | **Retrospective Summary** — extract learnings from completed plan |
| `/crs` | **Conversation Retrospective** — extract learnings from chat session |
| `/rp` | **Read Plan** — resume work on an existing plan |
| `/um` | **UpdateMe** — instant plan status snapshot |

*(source: `Steward-CLAUDE.md`, §"Available Skills")*

## Composition patterns

- **Sequential (full lifecycle):** `/pf` → `/cp` → `/px` → `/ax` → `/cf`
- **Phase-chained:** `/pf` → `/cp` → `/phx` → `/cf` (human review between phases)
- **Error recovery:** `/ex` → `/fx`
- **Quick iteration:** `/mpx` → `/max` (memory-based, <5 files)
- **Quality assurance:** `/pica` (audit; findings fed into `/rs` at close-out)
- **Decision lockdown:** `/cp` step 7 emits a question batch that resolves all visible decisions before `/phx` starts. Resolves "stop-mid-flight" risk for phase-chained execution. See [[wiki-graph-shape-contract]] for a concrete instance (40 decisions locked, 1 halt only — and that halt was external drift, not a question)
- **Wiki-aware retrospective:** `/rs` and `/crs` route new gold-doc pages through [[wiki-graph-shape-contract|/wiki-ingest]] when the active project has a registered wiki vault (see Wiki Registry in `c:\code\Steward\CLAUDE.md`). They run `/wiki-graph-audit` at close-out and offer per-category auto-fix. Falls back to `docs/patterns/*` for projects without a wiki
- **Trust-But-Verify mid-task gate:** Auto-chainable workflows (`/phx`, `/wiki-ingest`, `/rs`) proceed on agent best-default for Low/Medium-complexity decisions and escalate only High-complexity decisions inline. End-of-round "Decisions Made" block lets the user verify and `adjust N`. Complements the [[cp-question-batch-pattern|/cp question batch]] (top-of-workflow lockdown). See [[trust-but-verify-mid-task-gate]]

*(source: `Steward-CLAUDE.md`, §"Composition Patterns")*

## Hard-stop discipline

The `/mpx` mode enforces a **hard-stop gate** before any file edits — implementation is forbidden until the user types `mAX`. A 2026-02-25 retrospective documents how this gate was strengthened after a regression where `/mpx` proceeded straight to implementation *(source: `mpx-hard-stop_260225_retrospective.md`)*. The lesson generalizes: **planning modes must end with an explicit authorization handoff**, never auto-flow into execution.

## Steward-specific extensions

Steward (the meta-orchestrator) adds **`s`-prefix** commands that operate at the workflow-design layer rather than inside a feature:

- **`/ps` (Plan Seed)** — **promoted to a global skill** (`~/.claude/skills/ps/SKILL.md`). Bridges a raw idea into a structured **seed document** (authored as `.html`) that becomes the input to `/pf` — grounded via deep codebase exploration, always opening with clarifying questions *(source: `Steward-CLAUDE.md`, §"Steward-Specific Commands")*
- **`IQ` (Input Queue)** — reads and consumes `C:\code\Steward\IQ.md` (primary channel for browser console output)

The `s`-prefix convention distinguishes Steward-level operations from sub-agent (CC) operations.

## Related

- [[stratagem]]
- [[configuration-hierarchy]]
- [[tracer-bullet-discipline]]
- [[gold-standard-docs]] *(forward-link)*
