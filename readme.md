# 🎯 Stratagem

> The clean, board-agnostic AI coding workflow core for Claude Code.

Stratagem is a Claude Code **plugin marketplace** that ships one plugin — **`sg`**, the generic Stratagem Core. It's a self-contained workflow engine: a full plan → execute → verify → retrospect lifecycle plus a budget-guarded autonomy loop, running with **zero external dependencies**. External board and chat systems attach through **neutral seams** by presence-check — none are bundled, and the core names no external system.

## Why "generic"

This is the **generic distribution** of Stratagem. It carries no organization-specific integrations: the core stays board-blind and chat-blind, exposing neutral seams that any external adapter can resolve to. Bring your own board (Azure DevOps, Jira, GitHub Projects, …) or chat (Teams, Slack, …) as a **separate adapter plugin** — the core never changes.

## What `sg` gives you

- **The lifecycle** — `/sg:pf` (plan features) → `/sg:cp` (create plan) → `/sg:px` → `/sg:ax` (execute) → `/sg:cf` (complete), with `/sg:rs` retrospectives.
- **Phase execution** — `/sg:phx` chains `/px`→`/ax` per phase (human-in-the-loop; you watch cost, it halts on error).
- **Unattended autonomy** — `/sg:if` runs the loop itself under a hard token **budget**, verifier-gated per task, with bounded `/ex`→`/fx` auto-recovery and a plan-level integration gate.
- **Discipline built in** — Trust-But-Verify gates, tracer-bullet slicing, and CORPUS-READ-FIRST (consult your in-repo `Vault/` knowledge base before the web).
- **PICA adapts to your codebase** — `/pica` (the post-implementation compliance audit) derives its audit dimensions from your project's `CLAUDE.md` + style docs, not a baked-in stack; populating those *trains it on your patterns*.
- **Neutral seams** — a board seam `{ event, syncId, task }` and a notify seam `{ event, summary, task }`, both presence-checked (silent no-op with no adapter). Contract: [`plugins/stratagem-core/SEAM-CONTRACT.md`](plugins/stratagem-core/SEAM-CONTRACT.md).

## Install

```
claude plugin marketplace add tony-thomas-git/Stratagem   # git remote, or a local clone path
claude plugin install sg@stratagem
# restart Claude Code to register the /sg:* commands
```

`sg` is `defaultEnabled` — it activates on install and runs the full lifecycle with **zero external dependencies**. Verify with `/help` (you should see `/sg:pf`, `/sg:cp`, `/sg:px`, `/sg:phx`, `/sg:if`, …).

**Full walkthrough** — the workflow auto-install, the one-time `Workflow(autonomy-loop)` grant + pre-grant snippet, and the Tavily research key: **[`INSTALL.md`](INSTALL.md)**.

## Attaching an external board or chat adapter

The core is board- and chat-blind by design. To sync a board or push chat notifications, install a **separate adapter plugin** that exposes the neutral seam skill:

- A **board adapter** exposes a `board-sync` skill. `/sg:if` resolves it by presence-check and threads it into the loop; task-lifecycle events (`task-started`, `verified`, …) fire across the seam, and the adapter maps them onto its own system's state.
- A **notify / chat adapter** exposes a `notify-sync` skill (strictly outbound). Task-boundary notifications fire across the notify seam.

Presence contract: **0 adapters → silent no-op · 1 → use it · 2+ → the core asks which.** A board/chat hiccup never changes or fails a task verdict (best-effort, skip-loud). Full details for adapter authors: [`SEAM-CONTRACT.md`](plugins/stratagem-core/SEAM-CONTRACT.md).

## Recommended: enable research (Tavily)

The **one add-on that ships with this distribution** is `stratagem-tavily` — it bundles the Tavily research MCP for the CORPUS-READ-FIRST web-fallback ladder. It ships **disabled** (`defaultEnabled: false`) and adds no dependency: without it, research falls back to built-in `WebSearch`. Enabling it gives sharper, citation-friendly results — a **recommended basic step**:

```
claude plugin install stratagem-tavily@stratagem
claude plugin enable  stratagem-tavily@stratagem
/stratagem-tavily:setup                 # paste your key (free tier at https://app.tavily.com) — writes the config for you
# (manual alt: ~/.claude/plugins/data/stratagem-tavily-stratagem/tavily.config.json  →  { "apiKey": "<your-key>" })
```

Full steps: [`plugins/stratagem-tavily/INSTALL.md`](plugins/stratagem-tavily/INSTALL.md). The core stays research-provider-blind — Tavily is the only bundled add-on; board and chat adapters remain external.

## Repository layout

```
.claude-plugin/marketplace.json     # the Stratagem marketplace — at REPO ROOT (ships sg + stratagem-tavily)
plugins/
  stratagem-core/                   # the sg plugin
    .claude-plugin/plugin.json      # name: sg · version · defaultEnabled
    skills/                         # the /sg:* operating modes
    hooks/                          # SessionStart sync of the autonomy workflow
    workflows/autonomy-loop.js      # the /sg:if unattended loop
    SEAM-CONTRACT.md                # neutral board + notify seam contract
  stratagem-tavily/                 # the one bundled add-on — Tavily MCP, ships disabled
    .mcp.json · bin/tavily-mcp-launch.js · tavily.config.example.json · INSTALL.md
Vault/                              # the knowledge base (CORPUS-READ-FIRST)
Plans/                              # active feature plans
```

## Branching

This is the long-living **generic** line — it deliberately does not track organization-specific upgrades that live on other branches. Adapters and org-specific integrations stay outside this generic core.

---

<p align="center"><strong>🎯 Board-agnostic core · neutral seams · zero external dependencies</strong></p>
