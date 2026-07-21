---
type: retrospective
sources: [stratagem-core-buildlog.md, stratagem-current-flow.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/workflow
---

# First `/if` Autonomy Run — Dogfood: Stratagem Improving Itself

> **Summary.** On 2026-07-10 the first full `/sg:if` autonomy run was executed as a dogfood: it built the *current-system hardening* feature on the plugin repo itself (`Stratagem-Core@drTim/hardening`). The loop ran a 12-task execution plan Route-B (unattended), halted:false, passed the integration gate (exit 0), completed all 12 tasks with **0 errors** across 25 agents in ~60 min under budget — and, notably, did so **cross-repo** (CWD in one repo, work in another). Human review of the three hardest diffs found them high-quality and invariant-respecting, a strong quality signal for the [[autonomy-loop]].

---

## Context — what was run

The run exercised the full `ps → pf → cp → if` chain to produce the hardening feature (source: `stratagem-core-buildlog.md`):
- `/sg:ps` → seed, `/sg:pf` → plan, `/sg:cp` → a **12-task execution plan** with 10 decisions locked (decision #5, the Epic behavior, overridden to "prompt at sp"), then `/sg:if` → the autonomy loop in **Route B** (source: `stratagem-core-buildlog.md`).

`/sg:if` is the unattended loop: per task it runs the real skills `/sg:px → /sg:ax → verify(P1)`, with bounded `/sg:ex → /sg:fx` recovery (≤3 attempts) on verifier FAIL, then a plan-level `## Integration-Verify:` gate before declaring the feature complete (source: `stratagem-current-flow.md`). See [[autonomy-loop]] and [[if-launch-contract]].

---

## What worked

- **Loop result: clean.** `halted:false`, integration gate **passed (exit 0)**, **all 12 tasks complete**, **25 agents**, **0 errors**, ~60 min, ~1.17M subagent tokens (under budget) (source: `stratagem-core-buildlog.md`).
- **Cross-repo execution held.** CWD was ISCI-Vision while the work targeted Stratagem-Core — the loop operated across repos end-to-end without incident (source: `stratagem-core-buildlog.md`). This is the notable structural result: the launcher's fs/shell/parsing and the pure Workflow script tolerated a working directory distinct from the edit target.
- **Footprint stayed on-scope.** 20 files +157/−56 (all under `plugins/*/skills/`) plus a new `plugins/stratagem-ado/owner-identity-resolver.md` (source: `stratagem-core-buildlog.md`). The `## ADO-Iteration-Policy` config edit (task 1) landed in **ISCI-Vision's** `Vault/` board-config file, correctly kept **separate** from the plugin PR (source: `stratagem-core-buildlog.md`).
- **Invariant respected.** All changes remained uncommitted on the feature branch through the whole loop — the loop never commits (source: `stratagem-current-flow.md`). The branch just isolates the diff. See [[never-commit-boundary]].

---

## The quality signal for autonomy

The reservation going in was **unattended prompt-quality** — whether an autonomous loop would produce diffs good enough to trust. Human review (with the explicit caveat that *grep gates prove presence, not correctness*) spot-checked the three hardest diffs (source: `stratagem-core-buildlog.md`):

1. **`board-sync`** — the `verified → Resolved` change, plus a board-reality note added by an agent that had actually queried `wit_get_work_item_type` (i.e. the agent checked the live board's process states rather than assuming) (source: `stratagem-core-buildlog.md`). This directly addresses the [[verified-to-closed-temp-remap]] temp state.
2. **`owner-identity-resolver.md`** — the new [[neutral-board-seam]] artifact implementing the [[ado-owner-identity]] self-heal (resolve assignee from the authenticated PAT identity) (source: `stratagem-core-buildlog.md`).
3. **`sp`** — the epic-prompt override, spike-close routed through the `board-sync` seam (not a direct `State` write), and iteration/AC wiring (source: `stratagem-core-buildlog.md`). See [[sp-sync-plan]].

Verdict: **all high-quality and invariant-respecting**; the reservation about unattended prompt-quality was "largely unfounded this run" (source: `stratagem-core-buildlog.md`).

> **★ Signal for north-star:** a real cross-repo `/if` run editing the plugin repo *itself* succeeded end-to-end — strong evidence the autonomy loop + event/verifier design is sound (source: `stratagem-core-buildlog.md`).

---

## Outcome & open items

- **PR #1748 opened** (`drTim/hardening` → `master`, commit `9717886`, 21 files) with **Tony Thomas added as a REQUIRED reviewer** (source: `stratagem-core-buildlog.md`). Setting `isRequired:true` needed a raw-REST `PUT …/reviewers/{id}` because the MCP reviewer tool can't set it, and Tony's identity had to be resolved from a work item he authored (WIQL) since `core_get_identity_ids` 401'd — the **PAT lacks Identity/Graph read scope** (source: `stratagem-core-buildlog.md`). North-star note: the ADO PAT needs Identity/Graph read scope, and `stratagem-ado` should expose a required-reviewer path (source: `stratagem-core-buildlog.md`).
- **Do not merge until Tony reviews + a dogfood-smoke passes** — pending pre-merge validation: reinstall the branch build, reload, and run a tracer feature through `sp`/`board-sync` asserting epic/iteration/AC/`verified→Resolved`/spike-close/roll-up (source: `stratagem-core-buildlog.md`).

## Related

- **decisions revisited** — [[board-blind-core]] — the seam this run proved end-to-end (spike-close via seam, not direct write) · [[workflow-auto-install-hook]] — the bundled workflow this run exercised · [[plans-dir-lifecycle]]
- **architecture** — [[autonomy-loop]] — the loop this run drove · [[ado-bridge]] — the plugin repo it hardened
- **api** — [[autonomy-loop-args]] · [[board-sync-event-map]] · [[sp-field-contract]] — the surfaces the hardened diffs touched
- **patterns** — [[owner-identity-resolver]] — the new self-heal artifact this run wrote · [[neutral-board-seam]] · [[idempotency-and-skip-loud]]
- **anti-patterns** — [[direct-state-write-bypassing-seam]] — the invariant human review spot-checked
- **retrospectives** — [[install-and-skill-test-pass]] — the prior install/skill pass this run followed
