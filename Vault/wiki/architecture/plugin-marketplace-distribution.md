---
type: architecture
sources: [marketplace.json, plugin.json, hooks.json, sync-autonomy-workflow.sh, INSTALL.md]
code_sources:
  - ".claude-plugin/marketplace.json@v0.1.0"
  - "plugins/stratagem-core/.claude-plugin/plugin.json@v0.1.0"
  - "plugins/stratagem-core/hooks/hooks.json@v0.1.0"
  - "plugins/stratagem-core/hooks/sync-autonomy-workflow.sh@v0.1.0"
updated: 2026-07-10
tags:
  - status/active
  - scope/plugin
---

# Plugin Marketplace & Distribution

> **Summary.** Stratagem ships as a single Claude Code **marketplace** named `stratagem` that hosts two independent plugins — always-on `sg` (Stratagem Core) and detachable `stratagem-ado`. You add the marketplace once, then `plugin install` whichever plugins you want. Because Claude Code plugins cannot register a Workflow script directly, `sg` bundles the `/sg:if` autonomy workflow and auto-installs it into each project via a **SessionStart hook**.

---

## 1. The `stratagem` marketplace — two plugins

The repo root is a plugin marketplace. `.claude-plugin/marketplace.json` declares `name: "stratagem"`, owner "Tony Thomas", and a two-entry `plugins` array (code: `.claude-plugin/marketplace.json:1-19`):

| Plugin | Command prefix | Default | Source | What it is |
|---|---|---|---|---|
| `sg` (Stratagem Core) | `/sg:*` | **auto-enabled** | `./plugins/stratagem-core` | The workflow engine — planning, execution, phase loops, retros. Self-contained. |
| `stratagem-ado` | `/stratagem-ado:*` | **ships disabled** | `./plugins/stratagem-ado` | Optional Azure DevOps bridge (board sync, PR/story sync) + bundled MCP. Needs your own ADO credentials. |

The marketplace description frames the pair as an engine plus an optional bridge: "distributable AI coding workflow engine (sg) + optional Azure DevOps bridge (stratagem-ado)" (code: `.claude-plugin/marketplace.json:5`). The two **compose but are independent** — core does not depend on the bridge (source: `INSTALL.md`). The bridge's `stratagem-ado` entry is documented as "Ships disabled; requires your own ADO PAT + config" (code: `.claude-plugin/marketplace.json:16`) — no secrets ship in this repo (source: `INSTALL.md`). The detachable-bridge design is covered in [[ado-bridge]] and its board seam in [[board-sync-adapter]].

## 2. The `sg` plugin manifest — always-on core

`plugins/stratagem-core/.claude-plugin/plugin.json` names the plugin `sg`, pins `version: "0.1.0"`, and sets `defaultEnabled: true` (code: `plugins/stratagem-core/.claude-plugin/plugin.json:1-7`). Because it is default-enabled, `sg` **activates on install** — the core lifecycle (`/sg:pf → /sg:cp → /sg:phx → /sg:cf → /sg:rs`) then works with zero external dependencies (source: `INSTALL.md`). The workflow-mode skills it exposes are catalogued in [[workflow-skills-overview]] and the plan lifecycle in [[plan-lifecycle]].

## 3. Install flow — marketplace add, then plugin install

Installation is two stages (source: `INSTALL.md`):

**Add the marketplace once** — from the Azure DevOps remote (SSH or HTTPS) or a local clone:

```
claude plugin marketplace add intelliscience@vs-ssh.visualstudio.com:v3/intelliscience/Stratagem-Core/Stratagem-Core
claude plugin marketplace add https://intelliscience.visualstudio.com/Stratagem-Core/_git/Stratagem-Core
claude plugin marketplace add C:\path\to\stratagem-core
```

**Install the plugin(s):**

```
claude plugin install sg@stratagem
```

After install you must **Restart Claude Code** to register the commands; verify with `/help` (you should see `/sg:cp`, `/sg:px`, `/sg:phx`, `/sg:pf`, …) (source: `INSTALL.md`). The optional bridge is a separate `install` **plus** an explicit `enable` (because it ships disabled) followed by its own credential/MCP setup (source: `INSTALL.md`):

```
claude plugin install stratagem-ado@stratagem
claude plugin enable  stratagem-ado@stratagem
```

## 4. Version-keyed plugin cache + the dev loop

Claude Code caches an installed plugin **keyed by the version** in its `plugin.json`. Because `sg` pins `version: "0.1.0"` (code: `plugins/stratagem-core/.claude-plugin/plugin.json:2`), iterating on the plugin during development means the cache must be invalidated: the dev loop is **uninstall + reinstall** so a code change under `plugins/stratagem-core/` is picked up rather than served stale from the version-keyed cache. *(inferred from the fixed `version` field + Claude Code's version-keyed plugin caching — the manifest carries no auto-refresh mechanism for a stable version string.)* The one distribution path that does **not** require a reinstall is the bundled workflow — it re-syncs from the bundle every session (see §5).

## 5. The SessionStart hook — auto-installing the `/if` workflow

The load-bearing distribution trick. `/sg:if` drives its unattended loop through a **Workflow script** (`autonomy-loop.js`), but **Claude Code plugins cannot register a Workflow script directly** — the Workflow tool only discovers scripts under `<project>/.claude/workflows/` or `~/.claude/workflows/` (code: `plugins/stratagem-core/hooks/sync-autonomy-workflow.sh:7-9`). So `sg` ships the script inside the plugin bundle and copies it into the active project on every session start.

`hooks/hooks.json` registers one `SessionStart` hook that runs the sync script, passing the project dir (code: `plugins/stratagem-core/hooks/hooks.json:2-13`):

```
bash "${CLAUDE_PLUGIN_ROOT}/hooks/sync-autonomy-workflow.sh" "${CLAUDE_PROJECT_DIR}"
```

`sync-autonomy-workflow.sh` is **best-effort / skip-loud: it always exits 0 and never fails the session** (code: `sync-autonomy-workflow.sh:12-13`). Its guards and behavior:

- **Resolve the project dir** from `$1` or `$CLAUDE_PROJECT_DIR`; exit 0 if empty or not a directory (code: `sync-autonomy-workflow.sh:18-20`).
- **Real-workspace guard** — only touch a dir that is a git repo (`.git`) or already has `.claude/`, never a random cwd (code: `sync-autonomy-workflow.sh:22-23`).
- **Locate the bundled source** relative to the script itself (`…/stratagem-core/workflows/autonomy-loop.js`), so the body does not rely on `${CLAUDE_PLUGIN_ROOT}`; exit 0 if the source is missing (code: `sync-autonomy-workflow.sh:25-27`).
- **Idempotent copy** — `mkdir -p` the project's `.claude/workflows/`, then copy **only when the destination is missing or differs** (`cmp -s`) (code: `sync-autonomy-workflow.sh:29-37`).

The effect: the workflow re-syncs from the bundle on each session start, so **plugin updates flow through automatically** with zero manual copy (code: `sync-autonomy-workflow.sh:9-11`; source: `INSTALL.md`). This is why the workflow, unlike the plugin code itself (§4), never needs a reinstall to update. The workflow it installs is documented in [[autonomy-loop]].

## 6. The one grant a plugin can't ship

Even with the workflow auto-installed, the first `/sg:if` run prompts to allow `Workflow(autonomy-loop)` — a one-time permission. Plugins cannot ship this grant themselves; only `agent` / `subagentStatusLine` keys are allowed in a plugin `settings.json` (source: `INSTALL.md`). A project can pre-grant it in `.claude/settings.json`:

```json
{ "permissions": { "allow": ["Workflow(autonomy-loop)"] } }
```

Invoking `/sg:if` is itself the user's explicit opt-in to run the multi-agent Workflow (source: `INSTALL.md`; and see [[autonomy-loop]]).

## 7. What ships (and what doesn't)

Per `INSTALL.md`'s manifest:

- ✅ `sg` core — rules doc + 21 workflow skills, no builder-repo references.
- ✅ `stratagem-ado` — code, skills, MCP launcher, and a config **example** only.
- ✅ `autonomy-loop.js` — bundled in `sg`, auto-installed per project via the SessionStart hook.
- ➖ **Tavily is not bundled** — a recommended companion research MCP you configure yourself; skills fall back to built-in `WebSearch` without it (see [[tavily-research-ladder]]).
- ❌ **No secrets** — no PAT, no filled `ado.config.json`.
- ❌ No builder-repo dependencies.

## Related

- **decisions** — [[plugin-distribution-model]] — why ship as a marketplace, not loose files · [[workflow-auto-install-hook]] — the SessionStart sync decision
- **architecture** — [[autonomy-loop]] — the workflow this hook installs and `/if` launches · [[ado-bridge]] — the detachable, ships-disabled second plugin · [[skill-workflow-engine]] — the `/sg:*` skills `sg` exposes · [[system-topology]]
- **anti-patterns** — [[hardcoded-home-paths]] — why plugin assets moved to `${CLAUDE_PLUGIN_ROOT}`
- **retrospectives** — [[install-and-skill-test-pass]] — the clean-machine v0.1.0 install that exercised this flow
