# Atomic-Detach Test Evidence — stratagem-ado plugin

- **Date:** 2026-06-29
- **Venue:** terminal `claude` CLI (driven via Bash). The VSCode extension cannot host the plugin's bundled MCP (`✘ Failed` in `/mcp`) — a separate finding; the detach test is venue-independent (footprint, not in-session tools).
- **Lifecycle exercised:** install → enable → probe(green) → disable(ADO-blind) → uninstall → marketplace remove → assert clean.

## A. Installed state (before detach)
| Signal | Value |
|---|---|
| `claude plugin list` | `stratagem-ado@steward-local` v0.1.0 — ✔ enabled |
| `settings.json` enabledPlugins | `"stratagem-ado@steward-local": true` |
| `known_marketplaces.json` | `steward-local` present |
| cache dir | `~/.claude/plugins/cache/steward-local` present |
| data dir | `~/.claude/plugins/data/stratagem-ado-steward-local` present; `pat.b64` present |
| **PROBE (green)** | `plugin:stratagem-ado:azure-devops … ✔ Connected` (CLI). The shim → `npx` → live ADO server (org `intelliscience`, v2.7.0) — after the `spawn EINVAL` → `shell:true` fix. |

## B. Disable → ADO-blind
- `claude plugin disable stratagem-ado@steward-local` → success.
- `claude mcp list` after disable: **no azure-devops MCP at all** → with the plugin off, core is fully **ADO-blind**. ✔

## C. Uninstall + marketplace remove
- `claude plugin uninstall stratagem-ado@steward-local` → success.
- `claude plugin marketplace remove steward-local` → success.

## D. Residue assertion
| Location | After uninstall | Verdict |
|---|---|---|
| `claude plugin list` | none | ✔ |
| `settings.json` enabledPlugins | 0 matches | ✔ |
| `known_marketplaces.json` | 0 matches | ✔ |
| data dir + `pat.b64` (the secret) | **gone** (deleted with the data dir) | ✔ secret leaves no trace |
| `~/.claude.json` mcpServers | only `tavily` — untouched | ✔ |
| source plugin dir (`C:\code\Steward\plugins\stratagem-ado`) | intact | ✔ (uninstall never deletes source) |
| **cache dir** | **persisted** after uninstall + `marketplace remove` + `prune`; required explicit `rm -rf` | ⚠️ see finding |

## Finding — cache residue (CC behavior, not a plugin defect)
`claude plugin uninstall` + `claude plugin marketplace remove` + `claude plugin prune` all leave
`~/.claude/plugins/cache/steward-local/stratagem-ado/0.1.0/` behind — a copy of the plugin **source**
(INSTALL.md, bin, skills). It contains **no secret and no config** (verified: no `pat.b64` in cache).
For a true "as-if-never-installed" revert, that cache dir must be purged explicitly (`rm -rf`). This is
a Claude Code cleanup gap, not a `stratagem-ado` issue — the plugin ships nothing that lingers there.

## Conclusion
With the cache purge, the plugin **reverts clean**: no config, marketplace, data, or secret residue;
`~/.claude.json` untouched; source intact. Disabling the plugin makes the core fully ADO-blind.
**Atomic-detach: PASS** (with the documented one-line cache-purge caveat).
