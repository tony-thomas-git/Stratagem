---
type: decision
sources: [INSTALL.md, stratagem-core-buildlog.md, plugins/stratagem-core/stratagem-core-rules.md, stratagem-current-flow.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/plugin
  - release/v0.1.0
---

# Decision — Auto-Install the `autonomy-loop` Workflow via a SessionStart Hook

> **Summary.** Claude Code plugins cannot register Workflow scripts, so `sg` bundles `autonomy-loop.js` inside the plugin and ships a **SessionStart hook** that auto-syncs it into each project's `.claude/workflows/`. Rationale: no manual copy, and it re-syncs on every plugin update so the workflow always follows the bundle. Shipped in PR #1747.

---

## 1. The problem

`/sg:if` drives its unattended loop through a Workflow script (`autonomy-loop`). The Workflow tool discovers scripts only in `~/.claude/workflows/` (user) or `<project>/.claude/workflows/` (project) — **plugins can't register Workflow scripts directly** (code: INSTALL.md:41; source: stratagem-current-flow.md, Phase 6.5). The v0.1.0 stopgap during testing was a manual copy of the file into `ISCI-Vision/.claude/workflows/` (source: stratagem-core-buildlog.md, Step 6.5).

## 2. The decision

Bundle the script **inside the plugin** and auto-sync it per session (code: INSTALL.md:41):

- `sg` ships `autonomy-loop.js` in the plugin bundle.
- A **SessionStart hook** copies it into the current project's `.claude/workflows/` on each session.
- The copy is **idempotent** — it re-syncs from the bundle, "so plugin updates flow through automatically" (code: INSTALL.md:41).
- It "**Runs only in a real workspace** (a git repo, or a dir that already has `.claude/`); best-effort — it never fails or blocks the session" (code: INSTALL.md:43).
- Once present, `/sg:if <plan-file>` resolves the workflow by name (`autonomy-loop`) (code: INSTALL.md:44).

## 3. What shipped (PR #1747)

PR #1747 (`drTim/install-fixes` → `master`, commit `a3a3be1`) landed (source: stratagem-core-buildlog.md, Step 8):

- `plugins/stratagem-core/workflows/autonomy-loop.js` (the bundled script),
- `plugins/stratagem-core/hooks/hooks.json` (the SessionStart registration),
- `plugins/stratagem-core/hooks/sync-autonomy-workflow.sh` (committed executable, mode `100755`).

**Validated live:** deleting the project's copy then reloading re-created it byte-identical, and `sg:autonomy-loop` re-registered (source: stratagem-core-buildlog.md, Step 8). A follow-up commit (`c070ca0`) removed the superseded repo-root `workflows/autonomy-loop.js` so the plugin bundle is the single source of truth (source: stratagem-core-buildlog.md, Step 8 follow-up).

## 4. The permission caveat

The hook syncs the file but **cannot grant the run permission**. The first `/sg:if` run prompts to allow `Workflow(autonomy-loop)` — approve once (code: INSTALL.md:46). Plugins can't ship this grant: a plugin `settings.json` allows only `agent` / `subagentStatusLine` keys, not permissions (code: INSTALL.md:46; source: stratagem-core-buildlog.md, Step 8). To pre-grant, add `{"permissions":{"allow":["Workflow(autonomy-loop)"]}}` to the project's `.claude/settings.json` (code: INSTALL.md:48-51).

## 5. Rationale & rejected alternatives

- **Rationale:** zero user action, version-locked to the bundle, and it re-syncs on update — the workflow always tracks the installed plugin version.
- **Rejected — manual copy:** the v0.1.0 approach; drifts from the bundle and must be redone on every update (source: stratagem-core-buildlog.md, Step 6.5).
- **Rejected — a `/sg:setup` self-provisioning skill (option b):** the design memo weighed a SessionStart hook (a) vs a setup skill (b) and recommended (a) + a pre-grant `settings.json` "for smoothest" integration (source: stratagem-core-buildlog.md, Step 6.5).
- **Why a hook, not the workflow itself:** the [[autonomy-loop]] script has no fs/shell access, so delivery must be external to it.

## Related

- **decisions** — [[plugin-distribution-model]] — the marketplace model this hook completes · [[board-blind-core]]
- **architecture** — [[autonomy-loop]] — the fs/shell-less Workflow that forces external delivery · [[plugin-marketplace-distribution]] — the SessionStart hook mechanics
- **api** — [[autonomy-loop-args]] — the Workflow this hook installs, resolved by name
- [[scopes]]
