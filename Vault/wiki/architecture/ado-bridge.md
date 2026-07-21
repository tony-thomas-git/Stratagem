---
type: architecture
sources:
  - plugins/stratagem-ado/.claude-plugin/plugin.json
  - plugins/stratagem-ado/INSTALL.md
  - plugins/stratagem-ado/.mcp.json
  - plugins/stratagem-ado/bin/ado-mcp-launch.js
  - plugins/stratagem-ado/owner-identity-resolver.md
  - plugins/stratagem-ado/skills/sp/SKILL.md
  - plugins/stratagem-ado/skills/pr/SKILL.md
  - plugins/stratagem-ado/skills/ss/SKILL.md
  - plugins/stratagem-ado/skills/board-sync/SKILL.md
code_sources:
  - "plugins/stratagem-ado/bin/ado-mcp-launch.js@v0.1.0"
  - "plugins/stratagem-ado/.mcp.json@v0.1.0"
  - "plugins/stratagem-ado/.claude-plugin/plugin.json@v0.1.0"
updated: 2026-07-10
tags:
  - status/active
  - scope/ado
  - vendor/azure-devops
  - boundary/core-ado
  - release/v0.1.0
---

# ADO Bridge — the detachable `stratagem-ado` plugin

> **Summary.** `stratagem-ado` is a **detachable Claude Code plugin** (v0.1.0, `defaultEnabled: false`) that is the *only* component aware Azure DevOps exists — core Stratagem stays board-blind. It ships four namespaced skills (`sp`/`pr`/`ss`/`board-sync`), a bundled ADO MCP server registered through a launcher shim that reads a PAT + org from the plugin's per-install data dir, and one shared owner-identity resolver. It composes with the board-blind core only through a neutral `{ event, syncId, task }` seam, and installs / enables / disables / uninstalls **atomically** (code: `plugins/stratagem-ado/.claude-plugin/plugin.json:1`).

---

## 1. What it is

A single Claude Code plugin that bolts Azure DevOps board integration onto Stratagem without core ever naming ADO. Its manifest describes it as a "Detachable Stratagem-Azure DevOps bridge — board sync, SP, PR skills plus bundled MCP registration. Core stays ADO-blind; install/enable/disable/uninstall atomically." (code: `plugins/stratagem-ado/.claude-plugin/plugin.json:1`). It **ships OFF** — `defaultEnabled: false`, so installing does nothing until an explicit `enable` (code: `plugins/stratagem-ado/.claude-plugin/plugin.json:1`; source: `INSTALL.md`).

The plugin root contains only: `INSTALL.md`, `ado.config.example.json`, `bin/` (the launcher shim), `owner-identity-resolver.md`, `skills/`, and `.mcp.json` — **no credential, no identity, no vendored server binary**. The secret and identity are supplied per-install into the data dir, never committed (source: `INSTALL.md`).

## 2. The four skills

All four are namespaced `/stratagem-ado:*`. See [[sp-sync-plan]], [[pr-open-pull-request]], [[ss-sync-seed]], and [[board-sync-adapter]] for the per-skill contracts.

| Skill | Role | Board effect |
|---|---|---|
| `sp` (Sync Plan) | Turn a `/cp` plan into a Feature + one child User Story per task, apply the create-time field contract, write `Sync-Id` markers back into the plan | **create + link only** (source: `skills/sp/SKILL.md`) |
| `ss` (Sync Seed) | Turn a seed file into a spike User Story in the `Spike / Waiting on Delivery` lane and attach the seed doc; stamp `Spike-Sync-Id` back into the seed | create one spike card + attachment (source: `skills/ss/SKILL.md`) |
| `pr` (Open Pull Request) | Open a PR on a pre-pushed branch, link Feature + Stories **at PR-time**, gate the Feature roll-up on all Stories closed | link + close-on-merge (source: `skills/pr/SKILL.md`) |
| `board-sync` | The adapter the core seam resolves to — map a neutral `{ event, syncId, task }` signal onto one ADO `System.State` transition | move exactly one item's state (source: `skills/board-sync/SKILL.md`) |

**Division of labour — create vs. transition.** `sp`/`ss` *create* work items; `board-sync` *transitions* them (`New→Active→Resolved→Closed`); `pr` *links* them and arranges close-on-merge. `sp` never sets `System.State` at create — new items default to `New`, and State/Reason are the transition pair owned by the loop's `board-sync` adapter (source: `skills/sp/SKILL.md`, "Do NOT set `System.State` or `System.Reason`"). The **one exception**: when `sp` retires an originating spike it does not write `System.State` directly — it *requests* the close through the `board-sync {merged}` seam (source: `skills/sp/SKILL.md` step 5a).

## 3. The neutral seam (how it composes with board-blind core)

The composition boundary is a single generic signal — `{ event, syncId, task }` — with **zero ADO vocabulary** (tagged here `boundary/core-ado`). Core Stratagem hands the adapter this signal *by neutral name*; `board-sync` is "the ONLY component that maps generic loop events onto ADO state — the core stays board-blind" (source: `skills/board-sync/SKILL.md`).

- **`Sync-Id` markers are deliberately generic.** `sp` writes `## ADO-Feature-Id:` into the plan header and appends ` — Sync-Id: <Story id>` to each task line, choosing `Sync-Id` (not "ADO" / "Story") "so the core seam reads them with zero ADO awareness" (source: `skills/sp/SKILL.md` step 8).
- **Event → State map (D5):** `task-started → Active`, `verified → Resolved`, `merged → Closed` (source: `skills/board-sync/SKILL.md`). `board-sync` never sets `System.Reason` — ADO derives it from the State transition.
- **Board is a mirror, never a gate.** The adapter is best-effort / skip-loud: on any failure (invalid id, auth error, a state-flow rule ADO rejects, MCP unreachable) it logs one `⚠ board-sync skip: <reason>` line and returns success-shaped without throwing. "A dropped board update is acceptable; a failed feature build because the board hiccuped is not." (source: `skills/board-sync/SKILL.md`, skip-loud contract). This is what lets the *same* core loop run whether or not the plugin is installed — see [[neutral-board-seam]] and [[skip-loud-board-telemetry]].

## 4. The bundled MCP + launcher shim

The plugin registers one MCP server, `azure-devops`, via `.mcp.json` — but it launches through the shim `bin/ado-mcp-launch.js`, not directly (code: `plugins/stratagem-ado/.mcp.json:1`). The registration invokes:

```
node ${CLAUDE_PLUGIN_ROOT}/bin/ado-mcp-launch.js --package @azure-devops/mcp@2.7.0 --pat-dir ${CLAUDE_PLUGIN_DATA}
```
(code: `plugins/stratagem-ado/.mcp.json:4`)

**Why a shim exists (D15).** A Claude Code plugin's `.mcp.json` does *string substitution only* — it cannot read a file's contents into an `env` value, so a bare `${CLAUDE_PLUGIN_DATA}` reference would pass the *path*, not the token, and the server would 401 (code: `plugins/stratagem-ado/bin/ado-mcp-launch.js:6`). The shim bridges the gap:

1. **Reads the secret.** It reads `base64("email:PAT")` from `${CLAUDE_PLUGIN_DATA}/pat.b64` and exports it as `PERSONAL_ACCESS_TOKEN` for the child (code: `plugins/stratagem-ado/bin/ado-mcp-launch.js:57`, `:100`). Empty or missing → fail loud (code: `:61`, `:67`).
2. **Reads the identity (org).** Org gets the *same* file-based treatment as the secret — the same "AP-3" reason `.mcp.json` can't inject it directly. The shim reads `org` from `${CLAUDE_PLUGIN_DATA}/ado.config.json`; a `--org` CLI arg is an optional fallback; no org from either source → fail loud (code: `plugins/stratagem-ado/bin/ado-mcp-launch.js:73`, `:81`).
3. **Registration, not binary (D14).** The shim is a thin *launcher*, not a vendored server — the pinned server `@azure-devops/mcp@2.7.0` still installs from npm via `npx` at launch (code: `plugins/stratagem-ado/bin/ado-mcp-launch.js:104`; comment `:20`). It spawns `npx -y <pkg> <org> -a pat` with `shell: true` (required because on Windows `npx` is a `.cmd` shim that Node ≥20 refuses to spawn shell-less) and `stdio: "inherit"` so the server speaks MCP over stdin/stdout to the host (code: `:104`).
4. **PATH robustness.** The VSCode extension spawns plugin MCP servers with a minimal PATH containing `node` but not `npx`; the shim prepends the `node` dir to the child's PATH, augmenting the existing case-insensitive `Path`/`PATH` key rather than duplicating it (code: `plugins/stratagem-ado/bin/ado-mcp-launch.js:100`–`:103`).
5. **Signal forwarding.** `SIGTERM`/`SIGINT` are forwarded to the child, and the shim exits with the child's exit code (code: `:110`–`:115`).

See [[ado-mcp-launcher-shim]] for the full mechanics and [[ado-plugin-secret-and-identity]] for the `pat.b64` + `ado.config.json` supply model.

## 5. Per-install secret + identity (the plugin ships none)

The plugin carries **zero** credential and **zero** identity literal — both live only in the plugin's persistent data dir, resolved by Claude Code to `~/.claude/plugins/data/<plugin>-<marketplace>/` (for this repo's `stratagem` marketplace: `~/.claude/plugins/data/stratagem-ado-stratagem/`) (source: `INSTALL.md` §2b):

- **`pat.b64`** — `base64("<work-email>:<PAT>")` (a *raw* PAT decodes to non-UTF-8 garbage → 401). The MCP server base64-decodes `PERSONAL_ACCESS_TOKEN`, splits on `:`, and uses everything after the first `:` as the PAT (source: `INSTALL.md` §2a). PAT scopes: Work Items (R&W) + Code (R&W) (source: `INSTALL.md` §1).
- **`ado.config.json`** — `{ org, project, owner }`, the plugin's non-secret **per-install identity home**, sitting beside `pat.b64` (source: `INSTALL.md` §2c; `ado.config.example.json`).

**Newest-wins glob (survives marketplace rename).** Both the shim and every skill resolve these files with a newest-match glob `~/.claude/plugins/data/stratagem-ado-*/{pat.b64,ado.config.json}` rather than a fixed path, so a marketplace rename doesn't break resolution (code: `plugins/stratagem-ado/bin/ado-mcp-launch.js:20` comment; source: `skills/sp/SKILL.md` step 2, `skills/ss/SKILL.md` step 2/5). Skills fail loud with `… ABORT: no ado.config.json found — see INSTALL.md §2c` when it's absent (source: `skills/sp/SKILL.md` step 2).

## 6. Owner-identity resolver (shared convention)

`owner-identity-resolver.md` is the single source of truth for turning the config `owner` into a *valid, assignable* ADO identity before any skill writes `System.AssignedTo`. `sp` and `ss` both **reference** it rather than re-inlining the algorithm, so the rule can't drift (source: `owner-identity-resolver.md`; `skills/sp/SKILL.md` step 2). It is **validation only** (never writes fields) and self-heals per decision #3 — *validate → self-correct + warn, never silent replace*: if the config `owner` isn't assignable it falls back to the PAT identity with a visible warning; on a double-miss it proceeds with the config value so the real ADO error surfaces (source: `owner-identity-resolver.md`). See [[owner-identity-resolver]].

## 7. Atomic detachability (the detach proof)

The whole plugin is a clean, reversible unit (source: `INSTALL.md` §5–6):

- **Ships OFF** — `defaultEnabled: false`; install is inert until `enable` (code: `plugin.json:1`).
- **Disable proves ADO-blindness.** With the plugin disabled, "every Stratagem loop runs identically with zero ADO awareness — the neutral seams presence-check and no-op. This is the detach proof: nothing in core names 'ADO.'" (source: `INSTALL.md` §5).
- **Uninstall reverts as-if-never-installed** — the bundled MCP registration, the `/stratagem-ado:*` skills, and the plugin data are removed; `~/.claude.json` should contain no `stratagem-ado` MCP residue and no `/stratagem-ado:*` skills (the Phase-4 atomic-detach test asserts this). `--keep-data` preserves the data dir incl. `pat.b64` (source: `INSTALL.md` §6).

Because the seam is neutral and skip-loud (§3), detach is *behaviour-preserving* for core — the plugin is additive telemetry, never a dependency. See [[atomic-plugin-detach]].

## Related

- **api** — [[sp-field-contract]] · [[board-sync-event-map]] · [[autonomy-loop-args]] — the create / transition / loop surfaces this plugin exposes
- **patterns** — [[sync-id-linkage]] · [[neutral-board-seam]] (the `{ event, syncId, task }` boundary) · [[idempotency-and-skip-loud]] · [[owner-identity-resolver]]
- **decisions** — [[board-blind-core]] — why core names no ADO · [[plugin-distribution-model]] — the marketplace + ships-disabled model
- **anti-patterns** — [[direct-state-write-bypassing-seam]] · [[hardcoded-home-paths]] — the ADO data-dir suffix bug
- **architecture** — [[system-topology]] · [[plugin-marketplace-distribution]] (install / enable / SessionStart) · [[autonomy-loop]] — the `/if` loop that emits the neutral lifecycle events
- [[scopes]] — tag vocabulary (`scope/ado`, `boundary/core-ado`)
