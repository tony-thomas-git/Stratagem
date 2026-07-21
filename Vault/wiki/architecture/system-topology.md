---
type: architecture
sources: [README.md, stratagem-current-flow.md, marketplace.json, stratagem-core-rules.md, hooks.json, plugin.json]
code_sources:
  - ".claude-plugin/marketplace.json@v0.1.0"
  - "plugins/stratagem-core/.claude-plugin/plugin.json@v0.1.0"
  - "plugins/stratagem-ado/.claude-plugin/plugin.json@v0.1.0"
  - "plugins/stratagem-core/hooks/hooks.json@drTim/hardening"
updated: 2026-07-10
tags:
  - status/active
  - scope/stratagem-core
---

# System Topology

> **Summary.** Stratagem is a single Claude Code **plugin marketplace** named `stratagem` shipping two plugins: **`sg`** (Stratagem Core — a board-blind workflow engine of 21 skills + operating rules + an unattended autonomy loop + a SessionStart hook) and **`stratagem-ado`** (the only ADO-aware component — a detachable Azure DevOps bridge). The two are joined by a neutral `{event, syncId, task}` seam so the core never names ADO.

---

## 1. The marketplace

The repository root is a Claude Code plugin marketplace: `.claude-plugin/marketplace.json` declares `name: "stratagem"` with two plugin entries (code: `.claude-plugin/marketplace.json:2`). Users add it and install the plugins with `claude plugin marketplace add <owner>/stratagem-core` then `claude plugin install sg@stratagem` (code: `README.md:29`).

| Plugin | Prefix | `defaultEnabled` | Role |
|---|---|---|---|
| **`sg`** — Stratagem Core | `/sg:*` | `true` | Always-on workflow engine; self-contained (code: `plugins/stratagem-core/.claude-plugin/plugin.json:6`) |
| **`stratagem-ado`** | `/stratagem-ado:*` | `false` | Detachable ADO bridge; ships disabled, needs your own PAT + config (code: `plugins/stratagem-ado/.claude-plugin/plugin.json:6`) |

Both are versioned `0.1.0` (code: `plugins/stratagem-core/.claude-plugin/plugin.json:3`). See [[plugin-marketplace-distribution]] for the install and dev loop.

## 2. The `sg` core plugin (board-blind)

`sg` is the always-on half. It has four kinds of component under `plugins/stratagem-core/`:

- **Skills (21).** The workflow operating modes, each a `skills/<name>/SKILL.md`, invoked as `/sg:<name>` (source: `stratagem-core-rules.md` Skills Catalog). The directory holds exactly 21: `ax cf cp crs ex fx handoff if max mpx pf phx pica ps px rp rs sa um wiki-graph-audit wiki-ingest` (code: `plugins/stratagem-core/skills/`). See [[skill-workflow-engine]].
- **Operating rules.** `stratagem-core-rules.md` is "the single home for the SYSTEM-level rules the deployed workflow modes rely on" — Trust-But-Verify, the autonomy budget & two-path loop, tracer-bullet discipline, the verifier contract, research routing, Literal Composition, Fleet-Aware Vault Editing, Wiki Vault Resolution (code: `plugins/stratagem-core/stratagem-core-rules.md:3`). Skills reference it via `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md`, so it travels with the plugin (source: `README.md:22`). See [[operating-rules]].
- **Autonomy loop.** `workflows/autonomy-loop.js` — the deterministic Workflow script `/sg:if` launches to drive `px → ax → verifier → advance` per task under a token budget (code: `plugins/stratagem-core/workflows/autonomy-loop.js`; source: `stratagem-current-flow.md:104`). See [[autonomy-loop]].
- **SessionStart hook.** `hooks/hooks.json` registers a `SessionStart` command that runs `hooks/sync-autonomy-workflow.sh "${CLAUDE_PROJECT_DIR}"` (code: `plugins/stratagem-core/hooks/hooks.json:5-11`). Claude Code plugins cannot register a Workflow script directly — the Workflow tool only discovers scripts under `<project>/.claude/workflows/` or `~/.claude/workflows/` — so the hook copies the bundled `autonomy-loop.js` into the active project's `.claude/workflows/` on every session start, idempotently (copy only when missing or changed) and skip-loud (always exits 0) (code: `plugins/stratagem-core/hooks/sync-autonomy-workflow.sh`). See [[SessionStart-workflow-sync-hook]].

`sg` is **board-blind**: `stratagem-core-rules.md` "names no builder repo, no external orchestrator, and no machine-specific path" (code: `plugins/stratagem-core/stratagem-core-rules.md:3`), and the README states the artifact "names no builder repo, no orchestrator, and no machine-specific path, and it ships no secrets" (code: `README.md:37`).

## 3. The `stratagem-ado` bridge (the only ADO-aware piece)

`stratagem-ado` is the detachable half — "the only thing that knows ADO exists" (source: `stratagem-current-flow.md:12`). Under `plugins/stratagem-ado/` it bundles:

- **Four skills** — `board-sync`, `pr`, `sp`, `ss` (code: `plugins/stratagem-ado/skills/`). See [[ado-bridge]].
- **A bundled MCP server** — `.mcp.json` registers an `azure-devops` server launched via `bin/ado-mcp-launch.js` wrapping `@azure-devops/mcp@2.7.0`, reading its PAT from `${CLAUDE_PLUGIN_DATA}` (code: `plugins/stratagem-ado/.mcp.json`).
- **Config + identity** — `ado.config.example.json` and `owner-identity-resolver.md` (code: `plugins/stratagem-ado/`).

It "ships disabled; requires your own ADO PAT + config" and is designed to "install/enable/disable/uninstall atomically" (code: `plugins/stratagem-ado/.claude-plugin/plugin.json:3`, `:6`), so removing it leaves the core fully functional.

## 4. The seam — `{event, syncId, task}`

The two plugins meet at a **neutral lifecycle seam** so the core stays board-blind. It has two halves:

- **Static (plan headers).** `/sg:cp` writes `## ADO-Project:` / `## ADO-Area:` headers and per-task `Sync-Id:` markers using values it is *told* (from `<vault>/board-config.md`); "core Stratagem names no ADO mechanics" (code: `plugins/stratagem-core/skills/cp/SKILL.md:116`). `/stratagem-ado:sp` consumes those headers verbatim and writes `Sync-Id` / `## ADO-Feature-Id` back into the plan (source: `stratagem-current-flow.md:97`).
- **Dynamic (runtime events).** `/sg:if` resolves a board adapter by *presence* — if a board plugin exposing a `board-sync` skill is installed+enabled, it threads a `boardSync` handle into the Workflow args; else `null`. "Core names no external system — it threads a handle" (source: `stratagem-current-flow.md:113`; code: `plugins/stratagem-core/skills/if/SKILL.md` step 6). Inside the loop, task-lifecycle events (`task-started`, `verified`) fire `board-sync { event, syncId, task }`, best-effort / skip-loud (source: `stratagem-current-flow.md:119`, `:184`).

This is the `boundary/core-ado` crossing named in [[scopes]] §3. See [[neutral-board-seam]] for the full contract.

## 5. Dependency map (who references whom)

- Every `sg` skill → `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md` (rules travel with the plugin) (source: `README.md:22`).
- `/sg:if` → `workflows/autonomy-loop.js` (the Workflow it launches) → runs the real skills `/sg:px`, `/sg:ax`, verifier, `/sg:ex`, `/sg:fx` as discrete stages, the structural realization of [[literal-composition]] (source: `stratagem-current-flow.md:116`; code: `plugins/stratagem-core/skills/if/SKILL.md` step 6).
- SessionStart hook → copies `autonomy-loop.js` into `<project>/.claude/workflows/` so `/sg:if` can discover it (code: `plugins/stratagem-core/hooks/sync-autonomy-workflow.sh`).
- `sg` skills → the vault (`<git-root>/Vault`) via CORPUS-READ-FIRST before web/context7 (code: `plugins/stratagem-core/skills/pf/SKILL.md:30`). See [[vault-knowledge-system]].
- `stratagem-ado` skills → the bundled `azure-devops` MCP + `ado.config.json` (code: `plugins/stratagem-ado/.mcp.json`).

## Related

- **architecture** — [[skill-workflow-engine]] — the 21-skill lifecycle engine · [[vault-knowledge-system]] — CORPUS-READ-FIRST + `<git-root>/Vault` · [[autonomy-loop]] — the `/sg:if` Workflow · [[plugin-marketplace-distribution]] — install & dev loop · [[ado-bridge]] — the detachable ADO half
- **patterns** — [[neutral-board-seam]] — the `{event, syncId, task}` boundary joining the two plugins
- **decisions** — [[board-blind-core]] — the board-blindness decision · [[plugin-distribution-model]] — the marketplace shape · [[workflow-auto-install-hook]] — how the workflow reaches a project
- **twin (`scope/workflow`)** — [[stratagem]] — the same whole-system overview from the meta-design side
- [[scopes]] · [[index]]
