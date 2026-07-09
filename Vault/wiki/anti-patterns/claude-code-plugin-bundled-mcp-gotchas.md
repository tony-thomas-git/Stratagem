---
type: anti-pattern
sources:
  - stratagem-ado-plugin_260628_211148_plan.md
updated: 2026-06-29
tags:
  - status/active
  - scope/workflow
  - layer/orchestrator
---

# Claude Code Plugin — Bundled-MCP Gotchas

> **Summary.** Five defects that block or silently break a Claude Code plugin that bundles its own MCP server (a `.mcp.json` at the plugin root) — each invisible to file-gates (`node --check`, grep, the verifier confirmer) and surfacing ONLY when the host actually launches the plugin on the target OS/venue. Found shipping the `stratagem-ado` plugin (a bundled `@azure-devops/mcp` registration) on Windows, validated live in both the `claude` CLI and the VSCode extension. Apply to any plugin with a bundled `.mcp.json`.

## AP-1 — `spawn EINVAL` on Windows: a `.cmd` needs a shell

A launcher that `spawn`s `npx` (or any `.cmd`/`.bat`) **without** `shell:true` throws `spawn EINVAL` on Node ≥20 — the CVE-2024-27980 mitigation that forbids spawning batch files without a shell. The MCP simply "fails to connect" with no obvious cause; older Node special-cased `.cmd`, so the code *looks* correct.

**Fix:** spawn through a shell (the args are static/trusted — the pinned package + org — so there is no injection surface):
```js
spawn('npx', ['-y', pkg, org, '-a', 'pat'], { stdio: 'inherit', shell: true, env })
```

## AP-2 — the VSCode extension spawns MCP with a minimal PATH

A plugin MCP that connects fine under the `claude` CLI can still show `✘ Failed` in the **VSCode extension**: the extension spawns plugin MCP servers with a minimal PATH that contains `node` but NOT `npx`, so the shell can't resolve `npx` → `'npx' is not recognized` → failed to connect. The CLI worked only because its PATH is fuller.

**Fix:** `npx` ships in the SAME directory as the `node` running the shim — prepend that dir to the child's PATH, case-correct for Windows' `Path` key:
```js
const dir = path.dirname(process.execPath)
const key = Object.keys(env).find(k => k.toLowerCase() === 'path') || 'PATH'
env[key] = dir + path.delimiter + (env[key] || '')
```
**Lesson: validate a plugin in BOTH venues — the CLI and the extension spawn MCP differently.**

## AP-3 — `.mcp.json` cannot read a file's contents into `env`

A plugin `.mcp.json` does **string-substitution only** (`${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, host env vars). There is no `${read:file}` form. So a user secret placed at install time under `${CLAUDE_PLUGIN_DATA}` cannot reach the server's env directly — `env: { TOKEN: "${CLAUDE_PLUGIN_DATA}/secret" }` injects the *path string*, not the file contents, and the server fails auth (e.g. 401).

**Fix:** a thin launcher shim reads the secret file and execs the real server — see [[bundled-mcp-launcher-shim]].

## AP-4 — plugin MCP tools are plugin-NAMESPACED

A plugin-bundled MCP server's tools surface to the model as `mcp__plugin_<plugin>_<server>__<tool>` — NOT the bare `mcp__<server>__<tool>` (guides and docs claim the bare name). A skill's `allowed-tools` or instructions that reference the bare name **silently don't resolve** to the plugin's tools.

**Fix:** reference the namespaced prefix, e.g. `mcp__plugin_stratagem-ado_azure-devops__wit_create_work_item`. The prefix is `plugin_<pluginName>_<serverName>` (colons→underscores) — **marketplace-independent**, so it stays stable across publish.

## AP-5 — `uninstall` + `marketplace remove` leave a `cache/` residue

After `claude plugin uninstall` + `claude plugin marketplace remove` (and even `prune`), `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` **persists** — a copy of the plugin SOURCE (manifest, bin, skills). It carries no secret and no config, but it defeats a true "as-if-never-installed" revert and no plugin command clears it.

**Fix:** `rm -rf` the cache dir explicitly when you need a clean detach. (The plugin's **data dir + its secret ARE deleted** on uninstall — that part is clean; only the source cache lingers.)

## Why these matter

Every one of these **passes** `node --check`, a grep verify, and the verifier confirmer — they are **environment-coupled**, visible only when the host spawns the plugin on the real OS and venue. The live tracer bullet (install → connect → use, in BOTH the CLI and the extension) is the only gate that catches them. (source: `stratagem-ado-plugin_260628_211148_plan.md` Error Log.)

## Related

- [[bundled-mcp-launcher-shim]] — the file-based-secret pattern AP-3 points to
- [[tracer-bullet-discipline]] — why live-on-target is the only gate for AP-1/AP-2
- [[verify-premise-before-building]] — AP-4: the guide claimed bare names; live proved namespaced
- [[workflow-script-authoring-gotchas]] — sibling "invisible-until-runtime" gotchas list
