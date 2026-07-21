# 🐛 Bug-Hunt Runbook — Stratagem (strat-dist)

> Append-only log of **non-plan** bug fixes (`BUG-###`) and feature additions (`FEAT-###`) done via `/mpx`→`/max` (in-memory, no formal plan file). Formal plan tasks are logged by `/ax` in their own plan file, not here.

---

## Feature Log

### FEAT-001 — Ship `stratagem-tavily` research add-on in strat-dist
- **Date:** 2026-07-19
- **Description:** Packaged the Tavily MCP as a detachable Claude Code plugin (`stratagem-tavily`) and registered it in the Stratagem marketplace as the *one* bundled, **disabled-by-default** add-on shipped with strat-dist.
- **Motivation:** The generic `sg` core names `tavily_*` in its research ladder but degrades to `WebSearch` — the *provider* was unpackaged. stratagem-core (the going concern) already solved this by wrapping the Tavily MCP in a plugin following the addon-blind bundled-MCP pattern (like `stratagem-ado` / `stratagem-teams`). Ported that pattern into strat-dist so the distribution ships the research provider as a recommended, opt-in add-on while the core stays **research-provider-blind**.
- **Files changed:**
  - **NEW** `plugins/stratagem-tavily/` — `.claude-plugin/plugin.json` (`defaultEnabled:false`), `.mcp.json` (wraps `tavily-mcp@0.2.21` via the launcher), `bin/tavily-mcp-launch.js` (shim: reads key from `${CLAUDE_PLUGIN_DATA}`, newest-wins cred resolution), `tavily.config.example.json`, `INSTALL.md`, `test/resolve-cred-dir.test.mjs`
  - **MOD** `plugins/.claude-plugin/marketplace.json` — added the `stratagem-tavily` entry; updated marketplace description (was "none are bundled")
  - **MOD** `readme.md` — added a "Recommended: enable research (Tavily)" section + repo-layout entry
- **Implementation summary:** Verbatim port from `stratagem-core@origin/master:stratagem-addons/plugins/stratagem-tavily/`, adjusted for the dist context: neutralized 2 stale `stratagem-ado` comment refs in the launcher; rewrote the INSTALL install/enable commands from a separate `@addons` marketplace to `@stratagem` (tavily ships in the *same* marketplace as `sg`); data-dir refs `stratagem-tavily-addons` → `stratagem-tavily-stratagem`. The test's `-addons`/`-stratagem` fixtures were left intact (they simulate the marketplace-move scenario). Ships **no secret** (config example only). Core untouched — degrades to `WebSearch` without the add-on.
- **Verification:** `node --check` launcher ✅ · `node --test` cred-resolution **9/9** ✅ · `marketplace.json` valid JSON (plugins: `sg`, `stratagem-tavily`) · `plugin.json` `defaultEnabled:false`.

---

## Bug Log

*(none yet)*

---

## Hot-Spot Map

| Area | Files | Notes |
|------|-------|-------|
| Marketplace / distribution | `plugins/.claude-plugin/marketplace.json` | ships `sg` + `stratagem-tavily` (FEAT-001) |
| Research add-on | `plugins/stratagem-tavily/` | bundled Tavily MCP, ships disabled (FEAT-001) |
| Docs | `readme.md` | generic-core + enable-research (FEAT-001) |

---

## Session History

| Date | Entry | Summary |
|------|-------|---------|
| 2026-07-19 | FEAT-001 | Ship `stratagem-tavily` research add-on (bundled Tavily MCP, disabled by default) |
