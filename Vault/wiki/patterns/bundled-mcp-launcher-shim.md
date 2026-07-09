---
type: pattern
sources:
  - stratagem-ado-plugin_260628_211148_plan.md
  - stratagem-ado-plugin-scrub_260708_210440_plan.md
updated: 2026-07-09
tags:
  - status/active
  - scope/workflow
  - layer/orchestrator
---

# Bundled-MCP Launcher Shim (file-based secret)

> **Summary.** A Claude Code plugin that bundles an MCP server needing a USER SECRET can't inject a file-based secret through `.mcp.json` (string-substitution only — it cannot read file contents). The pattern: `.mcp.json` runs a thin `node` launcher shim that reads the secret from `${CLAUDE_PLUGIN_DATA}/<file>`, exports it as the server's env var, and execs the pinned server. The plugin ships the registration + a ~30-line shim, **never the secret**.

## The problem

`.mcp.json` env values are static string substitutions; there is no `${read:file}` form. A user secret placed at install time under `${CLAUDE_PLUGIN_DATA}` cannot reach the server's env directly — a bare reference injects the *path*, not the token. (See [[claude-code-plugin-bundled-mcp-gotchas]] AP-3.)

## The shape

```
.mcp.json
  command: "node"
  args: ["${CLAUDE_PLUGIN_ROOT}/bin/launch.js",
         "--package", "<pinned-server>", "--org", "<org>", "--pat-dir", "${CLAUDE_PLUGIN_DATA}"]

launch.js
  read  <pat-dir>/secret.b64            # the secret the user placed at install
  env.TOKEN = contents.trim()
  spawn the pinned server via npx       # stdio:'inherit', shell:true, PATH augmented (AP-1/AP-2)
  forward SIGTERM/SIGINT; propagate the child's exit code
```

The pinned package stays **declarative** as a `.mcp.json` arg (keeps config readable and satisfies a string-grep verify); the shim only adds the secret injection + the spawn-robustness the bare registration can't express. **Org is declarative only while it's fixed config** — once the plugin is a distributable installed by multiple identities, org becomes per-install and moves into the config too (see below).

## Why a shim, not a vendored binary

The plugin bundles the **registration + a thin launcher**, NOT the server code — the server still installs from npm via `npx` at launch (pin the version). This keeps install/uninstall atomic and the secret out of the repo:
- Plugin files carry **no** secret; it lives only in `${CLAUDE_PLUGIN_DATA}/secret.b64` (deleted on uninstall).
- The shim's PATH augmentation makes it run in BOTH the CLI and the VSCode extension.

## When identity is per-install, it joins the secret

If the plugin is a **distributable** installed by multiple identities, a value like `org` is no longer fixed config — it's per-install Profile, exactly like the secret. It then moves **out** of `.mcp.json` (which can't read files anyway — AP-3) and **into** the launcher-read data-dir config, resolved the same newest-wins way as the secret file. The plugin source stops naming it. This deliberately reverses the "keep org declarative" default above, once org is reclassified from config → identity. See [[stratagem-ado-plugin-scrub]].

## Related

- [[claude-code-plugin-bundled-mcp-gotchas]] — the runtime gotchas this shim must handle
- [[configuration-hierarchy]] — where plugin data + secrets sit
- [[stratagem-ado-plugin-scrub]] — the scrub that moved org from declarative arg → per-install config (this pattern's evolution)
