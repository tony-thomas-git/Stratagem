# Installing Stratagem

> The concrete, org-neutral onboarding for the **generic** Stratagem distribution.
> Higher-level tour: [`readme.md`](readme.md). This doc goes deeper — workflow
> auto-install mechanics, the one permission a plugin can't ship, and the research key.

Stratagem ships as a Claude Code **plugin marketplace** named `stratagem`. It hosts:

| Plugin | Prefix | Default | What it is |
|---|---|---|---|
| `sg` (Stratagem Core) | `/sg:*` | **auto-enabled** | The workflow engine — PF→CP→PX→AX→CF lifecycle, `/phx`, the budget-guarded `/if` autonomy loop, `/ex`→`/fx` recovery. **Zero external dependencies.** |
| `stratagem-tavily` | — | **ships disabled** | The one bundled add-on — the Tavily research MCP for the web-fallback ladder. Optional; skills fall back to built-in `WebSearch` without it. |

The core is **board- and chat-blind**. External board (Azure DevOps, Jira, GitHub Projects, …) or chat (Teams, Slack, …) systems attach as **separate adapter plugins** through neutral seams — none are bundled here. See [Attaching an external adapter](#5-attaching-an-external-board-or-chat-adapter).

---

## 1. Prerequisites

- **Claude Code** recent enough to support plugin marketplaces and `enable`/`disable` + `defaultEnabled` (used by the Tavily add-on).
- **`node` on PATH** — only needed if you enable the `stratagem-tavily` add-on (its MCP launcher shim runs under Node). The core `sg` plugin needs nothing external.
- **A git checkout or remote** of this repository — the marketplace is added from either a local clone path or the git remote.

---

## 2. Install the core (`sg`)

Three steps — add the marketplace once, install the plugin, restart:

```
# 1. Add the marketplace (git remote, or a local clone path)
claude plugin marketplace add tony-thomas-git/Stratagem       # or:  claude plugin marketplace add C:\path\to\Stratagem

# 2. Install the core plugin
claude plugin install sg@stratagem

# 3. Restart Claude Code to register the /sg:* commands
```

**`sg` is zero-config.** Its manifest sets `defaultEnabled: true`, so it **activates on install** and runs the full lifecycle with zero external dependencies — no keys, no board, no services. Verify with `/help`; you should see `/sg:pf`, `/sg:cp`, `/sg:px`, `/sg:phx`, `/sg:if`, `/sg:cf`, `/sg:rs`, ….

> **Updating the core.** Claude Code caches an installed plugin **keyed by the version** in its `plugin.json`. To pick up a new core build, `claude plugin uninstall sg` then `install` again. (The autonomy-loop workflow is the one exception — it re-syncs itself every session; see §3.)

---

## 3. The autonomy-loop workflow — auto-installed, one grant to approve

`/sg:if` drives its unattended loop through a **Workflow script**, `autonomy-loop.js`. Claude Code plugins **cannot register a Workflow script directly** — the Workflow tool only discovers scripts under `<project>/.claude/workflows/` or `~/.claude/workflows/`. So `sg` ships the script inside the plugin bundle and **auto-installs it per project** via a SessionStart hook.

**How the auto-install works (no action needed):**

- `hooks/hooks.json` registers a **SessionStart** hook that runs `hooks/sync-autonomy-workflow.sh`, passing the project dir.
- The script **idempotently copies** `autonomy-loop.js` into the active project's `.claude/workflows/` — copying only when the destination is missing or differs, so it always tracks the bundled version and **plugin updates flow through automatically**.
- It is **best-effort / skip-loud**: it only touches a real workspace (a git repo, or a dir that already has `.claude/`) and always exits 0 — it never fails or blocks a session.

**The one grant a plugin can't ship.** Even with the workflow synced, the **first** `/sg:if` run prompts you to allow `Workflow(autonomy-loop)` — a one-time permission. Plugins cannot ship this grant (a plugin `settings.json` may carry only `agent` / `subagentStatusLine` keys, not permissions). Approve it once when prompted, or **pre-grant** it per project by adding this to `.claude/settings.json`:

```json
{ "permissions": { "allow": ["Workflow(autonomy-loop)"] } }
```

Invoking `/sg:if` is itself your explicit opt-in to run the multi-agent loop; the pre-grant just skips the interactive prompt.

---

## 4. Recommended: enable research (Tavily)

The single add-on that ships with this distribution is **`stratagem-tavily`** — it bundles the Tavily research MCP for the CORPUS-READ-FIRST web-fallback ladder. It **ships disabled** (`defaultEnabled: false`) and adds no dependency: without it, research falls back to built-in `WebSearch` and everything keeps working. Enabling it gives sharper, citation-friendly results — a recommended basic step.

```
# The add-on lives in the same `stratagem` marketplace (already added in §2):
claude plugin install stratagem-tavily@stratagem
claude plugin enable  stratagem-tavily@stratagem
```

Then supply your own key (free tier at <https://app.tavily.com>). The add-on ships **no** credential — at MCP launch its shim reads a single file and exports the key to the server through the environment (never argv). Write it to the **`<plugin>-<marketplace>`** data dir:

```
~/.claude/plugins/data/stratagem-tavily-stratagem/tavily.config.json   ->   { "apiKey": "<your-tavily-api-key>" }
```

> ⚠️ The `-stratagem` marketplace suffix is load-bearing — `stratagem-tavily-stratagem`, **not** a bare `stratagem-tavily/`. Guessing the bare path is the most common first-install mistake.

Restart Claude Code, then confirm with `claude mcp list` — `plugin:stratagem-tavily:tavily` should be **connected**. Full mechanics, the pinned server version, and troubleshooting: [`plugins/stratagem-tavily/INSTALL.md`](plugins/stratagem-tavily/INSTALL.md).

> **Never commit `tavily.config.json`.** It lives only in the data dir, owned by your account. The repo-root `.gitignore` ignores `**/tavily.config.json` as a second line of defence.

---

## 5. Attaching an external board or chat adapter

The core is board- and chat-blind by design. To sync a Kanban board or push chat notifications, install a **separate adapter plugin** that exposes the neutral seam skill:

- A **board adapter** exposes a `board-sync` skill. `/sg:if` resolves it by presence-check and threads it into the loop; generic task-lifecycle events (`task-started`, `verified`, …) fire across the seam and the adapter maps them onto its own system's state.
- A **notify / chat adapter** exposes a `notify-sync` skill (strictly outbound). Task-boundary notifications fire across the notify seam.

Presence contract: **0 adapters → silent no-op · 1 → use it · 2+ → the core asks which.** A board/chat hiccup never changes or fails a task verdict (best-effort, skip-loud). Adapter-author contract: [`plugins/stratagem-core/SEAM-CONTRACT.md`](plugins/stratagem-core/SEAM-CONTRACT.md).

---

## 6. Train `/pica` on your codebase

The core ships **stack-neutral** — it privileges no language, framework, or test runner. `/pica` (the post-implementation compliance audit) derives its audit dimensions from **your project's `CLAUDE.md` + style docs** rather than any baked-in stack. Populating those files is what *trains the audit on your patterns* — the neutral dimensions ship, and your `CLAUDE.md` specializes them. The richer your project conventions, the sharper the audit.

---

## 7. Quick verification checklist

- [ ] `/help` lists the `/sg:*` commands → core installed and enabled.
- [ ] A new session in a git repo created `.claude/workflows/autonomy-loop.js` → the SessionStart hook is syncing.
- [ ] First `/sg:if` prompts for `Workflow(autonomy-loop)` (or is pre-granted) → the loop can run.
- [ ] *(optional)* `claude mcp list` shows `plugin:stratagem-tavily:tavily` connected → research add-on live.
