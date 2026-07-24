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

### FEAT-002 — `/stratagem-tavily:setup` one-command key setup
- **Date:** 2026-07-21
- **Description:** Added a `setup` skill to the `stratagem-tavily` add-on so a user runs `/stratagem-tavily:setup` (optionally with the key inline) to write `tavily.config.json` — instead of hand-creating the file at the `<plugin>-<marketplace>` data-dir path.
- **Motivation:** On the clean `steep` install, supplying the key meant manually finding `~/.claude/plugins/data/stratagem-tavily-stratagem/` (the `-<marketplace>` suffix is the #1 first-install mistake) and writing BOM-free JSON. The skill removes both footguns. We can't ship the key (it's a secret — the repo ships only `tavily.config.example.json`), but we can ship the *setup*.
- **Files changed:**
  - **NEW** `plugins/stratagem-tavily/skills/setup/SKILL.md` — prompts for the key (or arg), validates (`tvly-` prefix, rejects placeholder), resolves the data dir via the launcher's `stratagem-tavily*` newest-wins glob, writes `tavily.config.json` BOM-free via `node` (never echoes the key), sets restrictive perms.
  - **MOD** `plugins/stratagem-tavily/.claude-plugin/plugin.json` — version `0.1.0` → `0.2.0`.
  - **MOD** `plugins/stratagem-tavily/INSTALL.md`, root `INSTALL.md`, `readme.md` — lead the key step with the skill; manual path kept as fallback.
  - **MOD** `docs/DERIVATION.md` — new §5 records the skill as a dist-local enhancement / upstream candidate for stratagem-core's canonical add-on.
- **Implementation summary:** Instruction skill (no build) + a one-line `node` write reusing the launcher's `stratagem-tavily*` glob (DRY, no new abstraction). Key passed to `node` as a process arg (never interpolated into JS or a printed command). Launcher + tests untouched.
- **Verification:** `node --test resolve-cred-dir.test.mjs` **9/9** ✅ · `claude plugin validate .` ✅ · skill frontmatter valid · `plugin.json` v0.2.0.

---

## Bug Log

### BUG-001 — `marketplace add <owner/repo>` fails: manifest not at repo root
- **Date:** 2026-07-21
- **Description:** On a clean test-install machine, `claude plugin marketplace add tony-thomas-git/Stratagem` failed with "Marketplace file not found." The git-remote form reads `.claude-plugin/marketplace.json` at the **repo root**, but the manifest lived one level down at `plugins/.claude-plugin/marketplace.json` — a location only the local-path add form can reach.
- **Root cause:** The marketplace manifest was authored under `plugins/` with `source` paths relative to that dir (`./stratagem-core`, `./stratagem-tavily`). The `owner/repo` git-remote install form cannot point at a subdirectory, so it never found the manifest. Auth + clone were fine (repo reached HEAD `95a8131`).
- **Files changed:**
  - **NEW** `.claude-plugin/marketplace.json` (repo root) — the manifest, `source` re-rooted to `./plugins/stratagem-core` + `./plugins/stratagem-tavily`.
  - **DEL** `plugins/.claude-plugin/marketplace.json` — moved to root (single source of truth).
  - **MOD** `readme.md` — repo-layout block now shows the manifest at root.
  - **MOD** `docs/DERIVATION.md` — live-marketplace path reference updated to root.
- **Fix summary:** Moved the manifest to the repo root and re-rooted the two plugin `source` paths so both the git-remote (`owner/repo`) and local-path add forms resolve. Verified valid JSON + both sources resolve to a real `plugin.json`. End-to-end confirmation is the `steep` test machine re-running `marketplace add` after push.

---

## Hot-Spot Map

| Area | Files | Notes |
|------|-------|-------|
| Marketplace / distribution | `.claude-plugin/marketplace.json` **(repo root)** | ships `sg` + `stratagem-tavily`; manifest moved root-side so `marketplace add owner/repo` resolves (BUG-001) |
| Research add-on | `plugins/stratagem-tavily/` | bundled Tavily MCP, ships disabled (FEAT-001) |
| Research add-on · setup | `plugins/stratagem-tavily/skills/setup/` | `/stratagem-tavily:setup` one-command key setup; add-on v0.2.0 (FEAT-002) |
| Docs | `readme.md` | generic-core + enable-research (FEAT-001) |

---

## Session History

| Date | Entry | Summary |
|------|-------|---------|
| 2026-07-19 | FEAT-001 | Ship `stratagem-tavily` research add-on (bundled Tavily MCP, disabled by default) |
| 2026-07-21 | BUG-001 | Move marketplace manifest to repo root so `marketplace add owner/repo` resolves |
| 2026-07-21 | FEAT-002 | Add `/stratagem-tavily:setup` — one-command key setup (no manual data-dir path) |
