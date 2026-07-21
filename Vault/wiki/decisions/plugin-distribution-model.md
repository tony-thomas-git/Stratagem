---
type: decision
sources: [README.md, INSTALL.md, stratagem-core-buildlog.md, plugins/stratagem-core/stratagem-core-rules.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/plugin
  - release/v0.1.0
---

# Decision — Ship Stratagem as a Claude Code Plugin Marketplace

> **Summary.** Stratagem is distributed as a Claude Code **plugin marketplace** (named `stratagem`) hosting two independent plugins — installed via `marketplace add` then `plugin install`. The current v0.1.0 is a precompiled "coder-only" plugin build. Rationale: zero-git consumers, plugin-managed updates, and bundling of rules + skills + workflow. Rejected: shipping loose skill files copied into `~/.claude/`.

---

## 1. The decision

The repo "**is** a Claude Code marketplace named `stratagem`" declared in `/.claude-plugin/marketplace.json` (source: stratagem-core-buildlog.md, Discovery findings). It hosts two independent plugins (code: INSTALL.md:5):

| Plugin | Prefix | Default | Source |
|---|---|---|---|
| `sg` (Stratagem Core) | `/sg:*` | auto-enabled (`defaultEnabled: true`) | `./plugins/stratagem-core` |
| `stratagem-ado` | `/stratagem-ado:*` | ships disabled | `./plugins/stratagem-ado` |

Install is two steps: add the marketplace once, then install whichever plugin(s) you want (code: INSTALL.md:10) — `claude plugin marketplace add <source>` (code: INSTALL.md:14-23) then `claude plugin install sg@stratagem` (code: INSTALL.md:29). `sg` auto-activates on install; a **Claude Code restart** registers the `/sg:*` commands (code: INSTALL.md:31).

The current release is **v0.1.0** — "the first precompiled coder-only plugin build the team checked in" (source: stratagem-core-buildlog.md, North-star context); the discovery inventory confirms "`sg@stratagem` v0.1.0 installed" with 21 skills (source: stratagem-core-buildlog.md, Step 3).

## 2. What ships in the marketplace

- `sg`: the rules doc (`stratagem-core-rules.md`) + 21 workflow skills, referenced via `${CLAUDE_PLUGIN_ROOT}` so the rules travel with the plugin (code: README.md:22; code: INSTALL.md:88).
- `stratagem-ado`: code, skills, an MCP launcher, and a **config *example* only** — no filled `ado.config.json`, **no secrets** (code: INSTALL.md:89-92).
- `autonomy-loop.js` bundled inside `sg`, auto-installed via a SessionStart hook — see [[workflow-auto-install-hook]].
- **Not** bundled: Tavily (a recommended companion MCP the user configures themselves) (code: INSTALL.md:91).

## 3. Rationale

- **Zero-git consumers.** A marketplace install works from an SSH remote, an HTTPS remote, or a local clone (code: INSTALL.md:14-23) — a consumer needs no build step, just the plugin CLI. The [[builder-vs-artifact]] principle: "Point Claude Code at it and the full workflow runs with zero dependency on the machine that produced it" (code: README.md:37).
- **Plugin-managed updates.** Content loads from a **version-keyed cache** (`~/.claude/plugins/cache/stratagem/sg/<version>/`), so bumping the plugin `version` flows an update through `marketplace update` → `plugin update` (source: stratagem-core-buildlog.md, Step 4.6).
- **Bundling.** Rules, skills, hooks, and the workflow ship as one unit under `${CLAUDE_PLUGIN_ROOT}`, so there is nothing loose to drift.

## 4. Rejected alternative

The prior footprint copied 27 loose skill files into `~/.claude/skills/` plus a user-scope `~/.claude/workflows/autonomy-loop.js` and a separate Steward builder/registry (source: stratagem-core-buildlog.md, Discovery — Local footprint). That model was uninstalled in favor of the marketplace: loose files drift, aren't version-keyed, and can't be updated as a unit.

## 5. Consequences / operational gotchas

- **Version-keyed cache.** Same-version content edits may **not** re-copy — `plugin update` reports "already at the latest version" and does nothing; the reliable dev refresh is `plugin uninstall && plugin install` (source: stratagem-core-buildlog.md, Step 4.6, canonical dev loop). See [[plugin-dev-refresh-loop]].
- **Namespace = identity.** The plugin name is the `/sg:` namespace, so only ONE `sg` is installable; coexisting builds need distinct names (`sg` vs `sg-dev`) (source: stratagem-core-buildlog.md, Step 4.5 collision rule).
- **Custom marketplaces don't auto-update** by default (only official ones do) (source: stratagem-core-buildlog.md, Step 4.5).

## Related

- **decisions** — [[workflow-auto-install-hook]] — the bundled-workflow delivery this enables · [[board-blind-core]] — the independent-plugins split
- **architecture** — [[plugin-marketplace-distribution]] — the install flow, version-keyed cache, and dev loop in detail · [[system-topology]]
- **anti-patterns** — [[hardcoded-home-paths]] — why the loose-`~/.claude/` model was rejected
- **retrospectives** — [[install-and-skill-test-pass]] — the clean-machine install that validated this model
- [[scopes]]
