---
type: decision
sources: [plugins/stratagem-core/stratagem-core-rules.md, INSTALL.md, README.md, stratagem-current-flow.md, stratagem-core-buildlog.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/stratagem-core
  - boundary/core-ado
---

# Decision — Core `sg` Is Board-Blind

> **Summary.** The core `sg` workflow engine names no Azure DevOps (or any external tracker). Every ADO concept lives behind a neutral `{ event, syncId, task }` seam that resolves — at runtime, by presence-check — to the detachable `stratagem-ado` plugin. Rationale: detachability and portability. Rejected: baking ADO calls into the core skills.

---

## 1. The decision

The two plugins are strictly separated: `sg` (core) knows nothing about boards; `stratagem-ado` is "the only thing that knows ADO exists" (source: stratagem-current-flow.md, Legend). The core rules file is deliberately self-contained — it "names no builder repo, no external orchestrator, and no machine-specific path" (code: plugins/stratagem-core/stratagem-core-rules.md:3). `stratagem-ado` ships **disabled** and carries its own bundled MCP; "Core (`sg`) does not depend on this — the two compose but are independent" (code: INSTALL.md:64).

## 2. How board-blindness is realized in the flow

Core skills that appear to touch the board never call it directly — they read or write **neutral markers**:

- **`/sg:cp`** resolves an ADO area and writes `## ADO-Project:` / `## ADO-Area:` headers into the plan, but "Core stays board-blind — `/cp` only writes headers it's told; it never calls ADO" (source: stratagem-current-flow.md, Phase 2 §6).
- **`/sg:sp`** (an ADO skill) writes linkage back into the plan using generic names — `## ADO-Feature-Id:` and per-task `Sync-Id:` — "so the core loop reads them with zero ADO awareness" (source: stratagem-current-flow.md, Phase 3 §6).
- **`/sg:if`** does **board-adapter resolution** as a neutral, presence-checked step: "if a board plugin exposing a `board-sync` skill is installed+enabled, set `boardSync` to it; else `null`. Core names no external system — it threads a handle" (source: stratagem-current-flow.md, Phase 4 pre-flight §6).

The seam the core threads is a generic lifecycle signal `{ event, syncId, task }`; the `stratagem-ado` [[board-sync]] adapter is what resolves it to a `wit_update_work_item` call (best-effort / skip-loud — a board hiccup never fails the caller). See [[neutral-board-seam]] and [[boundary-page-template]].

## 3. Rationale

- **Detachability.** `sg` is `defaultEnabled: true` and runs the full lifecycle "with **zero external dependencies**" (code: INSTALL.md:33); `stratagem-ado` is an opt-in add-on that needs the user's own PAT (code: INSTALL.md:57).
- **Portability / Builder ≠ Artifact.** The repo "names no builder repo, no orchestrator, and no machine-specific path, and it ships no secrets. Point Claude Code at it and the full workflow runs with zero dependency on the machine that produced it" (code: README.md:37). Board coupling would violate that principle.
- **Best-effort isolation.** Board events are "best-effort/skip-loud — a board hiccup never fails the task" (source: stratagem-current-flow.md, Phase 4 per-task §2), which is only possible because the core never depends on the board completing.

## 4. Rejected alternative

Baking ADO into the core skills (direct `wit_*` calls from `/sg:cp`, `/sg:ax`, `/sg:if`). Rejected because it would make the board a hard dependency of every install, break the self-contained/portable guarantee, and prevent non-ADO teams from using the engine.

## 5. Consequences & open edges

- The neutral seam requires each ADO skill to be trusted to self-resolve identity; today skills "trust `ado.config.json` `owner` verbatim" with "no auto-detection/self-heal", a gap flagged for the seam to own (source: stratagem-core-buildlog.md, Step 5.2 · Step 9). See [[owner-identity-resolver]].
- The hardening run proved the seam end-to-end: spike-close went "via the `board-sync` seam not direct State write" (source: stratagem-core-buildlog.md, Step 9 human review).

## Related

- **patterns** — [[neutral-board-seam]] — the `{event,syncId,task}` seam this decision mandates · [[owner-identity-resolver]] — the self-heal gap this decision flagged
- **api** — [[board-sync-event-map]] — the adapter the seam resolves to
- **anti-patterns** — [[direct-state-write-bypassing-seam]] — the invariant that keeps core board-blind
- **decisions** — [[plugin-distribution-model]] — the ships-disabled bridge that makes detachability real
- **architecture** — [[system-topology]] · [[ado-bridge]] — the only ADO-aware component
- [[scopes]]
