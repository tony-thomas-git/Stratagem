# Task 10 — Single-Feature E2E Evidence (stratagem-ado)

- **Date:** 2026-06-29
- **Venue:** VSCode Claude Code extension (plugin MCP working after the PATH-robust shim fix). Driven LIVE against `ISCI - Consolidated - Kanban` / `ISCI-SAAS`, through the plugin's bundled MCP (`mcp__plugin_stratagem-ado_azure-devops__*`).
- **Scope chosen:** option (i) — core E2E live; live PR→Closed deferred to the real `/if` flow (see below).

## 1. sp — cards created (create-time field contract, LIVE)
| ID | Type | Title | State@create | Owner | Area | Iteration | Parent | Tag |
|---|---|---|---|---|---|---|---|---|
| **5493** | Feature | `[TRACER-BULLET — DELETE ME] stratagem-ado E2E smoke · Feature Plan` | New | Tony Thomas | ISCI-SAAS | backlog root | — | `stratagem-tracer-bullet` |
| **5494** | User Story | `… · Task 1` | New | Tony Thomas | ISCI-SAAS | backlog root | 5493 | inherited |
| **5495** | User Story | `… · Task 2` | New | Tony Thomas | ISCI-SAAS | backlog root | 5493 | inherited |

Contract verified live: State `New` (default, not set), Iteration omitted → backlog root (no sprint), Owner on Feature via `fields` + on Stories via follow-up `wit_update_work_item`, Stories nested under the Feature (Hierarchy-Reverse). **Sync-Ids written back** to `_e2e-smoke_throwaway.md`: `## ADO-Feature-Id: 5493`, Task 1 → `5494`, Task 2 → `5495`.

## 2. board-sync — transitions (LIVE, on 5494)
| Rev | State | Reason (ADO auto-derived) | Adapter event |
|---|---|---|---|
| 1 | New | New | (create) |
| 3 | **Active** | "Implementation started" | `task-started` |
| 4 | **Resolved** | "Code complete and unit tests pass" | `verified` |

**New → Active → Resolved proven live.** The adapter sets only `System.State`; `Reason` auto-derives (the contract).

## 2b. /if terminal run — loop-driven board-sync (LIVE, validated)
A subsequent **`/if` run in a terminal `claude` session** (run `wf_082d12ac-c9d`) drove the autonomy loop over both tasks unattended (halted:false, 2/2 passed first verify, 0 recovery, ~119k tokens, branch `tony/e2e-smoke`, integration gate skip-loud):
- The `/if` launcher **resolved the neutral seam** → `Board: stratagem-ado:board-sync` (banner).
- **5495 (Sync-Id) → New → Resolved** driven by the loop's verifier boundary (`verified` event).
- **5494 → already Resolved → no-op** — the adapter's **idempotency pre-check** correctly skipped the redundant write.
This proves the full **core → neutral seam → board-sync adapter → live ADO** path end-to-end, unattended, in a second venue. Confirms `verified → Resolved` is the intended pre-merge state (Model A).

## 3. State model (D5) confirmed — Model A
`verified → Resolved` (code-complete, pending merge), `merged → Closed`. The cards correctly rest at **Resolved** because the PR-merge was deferred; **Closed is reserved for actual merge** (not local verify). Decision re-confirmed by the user 2026-06-29 after seeing it live.

## 4. PR → Closed leg — DEFERRED (option i)
The live **PR** was NOT created in this session (avoids real-repo churn for a throwaway). The PR + linkage + Closed-on-merge path is:
- **Validated by construction:** the `pr` skill is gate-verified (Task 8); its `repo_*` / `wit_link_work_item_to_pull_request` tools run on the SAME plugin MCP proven working here.
- **To be exercised in normal usage:** the terminal `/if → /cf → /stratagem-ado:pr` flow opens the real PR, links Feature+Stories at PR-time, and the work items reach **Closed** on merge (ADO auto-complete OR `board-sync {event:"merged"}`).

So live PR-create + merge→**Closed** is deferred to the real `/if` flow — honestly NOT performed in this session.

## Verdict
Core single-feature E2E proven **LIVE** through the plugin's bundled MCP: install → connect → `sp` (create + full field contract) → `board-sync` (New → Active → **Resolved**). The **PR** → merge → **Closed** leg is deferred to the user's terminal `/if` run (option i). The plugin is functionally validated end-to-end for the create + board-state lifecycle.
