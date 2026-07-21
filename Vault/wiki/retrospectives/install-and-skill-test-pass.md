---
type: retrospective
sources: [stratagem-core-buildlog.md, stratagem-current-flow.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/stratagem-core
  - release/v0.1.0
---

# Clean-Machine Install + 10-Skill Verification Pass (v0.1.0)

> **Summary.** On 2026-07-09 the `stratagem` marketplace (plugins `sg` + `stratagem-ado`, both v0.1.0) was installed from scratch on a WSL2/Windows machine after a full backup-and-uninstall of the prior local Stratagem footprint, then 10 skills were driven end-to-end against a live Azure DevOps board. The plugin worked; the pass surfaced four install/config findings — the [[ado-data-dir-suffix]] path bug, an [[ado-owner-identity]] mismatch, [[plans-dir-drift]], and the [[verified-to-closed-temp-remap]] — all captured and mostly fixed in-session, later rolled into install-fixes PR #1747.

---

## Context — what was tested

The clean-machine bring-up followed an 8-step plan of record: discover → back up → uninstall → clone → install → test → verify → contribute (source: `stratagem-core-buildlog.md`). Before install, the machine carried an *old* Stratagem footprint — 27 skills under `~/.claude/skills/`, a user-scope `autonomy-loop.js`, the Steward builder/registry, and an inline-PAT ADO MCP (source: `stratagem-core-buildlog.md`). All of it was backed up to `/mnt/c/code/old-stratagem/` (1.4 MB, verified, with a `RESTORE.md`) and removed, leaving `~/.claude/skills` at 0 (source: `stratagem-core-buildlog.md`).

The repo under test **is** the Claude Code marketplace `stratagem` — two plugins: `sg` (21 skills, `defaultEnabled: true`) and `stratagem-ado` (4 skills, ships disabled, bundles its own ADO MCP) (source: `stratagem-core-buildlog.md`). See [[plugin-distribution-model]] and [[ado-bridge]].

---

## What worked

- **Remote and local-path installs both proved out.** `sg@stratagem` v0.1.0 installed user-scope + enabled first from the SSH remote, then the dev workflow pivoted to a **local-path** marketplace (`source: directory`, read live from the working tree) so git branches act as the released↔dev switch (source: `stratagem-core-buildlog.md`). See [[dev-refresh-loop]].
- **Structural check: 0 problems.** All 21 `sg` skills had valid `name`/`description` frontmatter + non-empty bodies (28–272 lines); `stratagem-core-rules.md` present (27 KB); manifest clean (source: `stratagem-core-buildlog.md`).
- **10 skills verified PASS** end-to-end: `um`, `sa`, `ps`, `pf`, `cp`, `ss`, `px`, `ax`, `sp`, `board-sync` (source: `stratagem-core-buildlog.md`). Highlights:
  - `/sg:um` — banner + plan-discovery + `git status`/`diff` scan, correct IDLE fallback (source: `stratagem-core-buildlog.md`).
  - `/sg:ps` → `/sg:pf` → `/sg:cp` — full planning lifecycle: seed HTML → plan HTML → self-contained `.md` execution plan with `Verify:` on every task and a `## Budget: 50000` header for later `/if` testing (source: `stratagem-core-buildlog.md`). See [[plan-lifecycle]].
  - `/sg:cp` **auto-detected board-sync** via `<git-root>/Vault`'s board-config file and wrote `## ADO-Project` / `## ADO-Area` headers — core stayed board-blind (source: `stratagem-core-buildlog.md`). See [[ado-area-resolution]].
  - `/sg:ax` applied a surgical 1-line edit (ctor:54 of `PotatoUniformityPipelineBuilder.cpp`), `git diff` = 1 file/+1 line, task `Verify:` exit 0 (source: `stratagem-core-buildlog.md`).
  - `/stratagem-ado:ss` / `/sp` / `board-sync` — live board round-trip: Story #5623 spike created + seed attached; Feature #5625 + child Story #5626 created with owner assigned; `board-sync {task-started}` moved #5626 New→Active (source: `stratagem-core-buildlog.md`).
- **ADO MCP fully restored via the plugin** — after the data-dir fix (below), `/mcp reconnect all` surfaced the tools in-session and `core_list_projects` returned org projects with no 401 (source: `stratagem-core-buildlog.md`).

**Deferred (not failures):** `pr, if, ex, fx, phx, mpx, max, rp, pica, handoff, crs, wiki-ingest, wiki-graph-audit` — user was satisfied the plugin worked (source: `stratagem-core-buildlog.md`). `/sg:if` was later exercised in [[first-if-autonomy-run]].

---

## Findings

### 1. ADO data-dir suffix path bug (fixed)
`${CLAUDE_PLUGIN_DATA}` resolves to `<plugin>-<marketplace>` = `stratagem-ado-**stratagem**`, **not** `stratagem-ado` as INSTALL.md §2b stated — so the MCP launcher couldn't find `pat.b64`, exited, and `claude mcp list` showed `plugin:stratagem-ado:azure-devops` = *Failed to connect* (source: `stratagem-core-buildlog.md`). Fix: copied `pat.b64` + `ado.config.json` into `~/.claude/plugins/data/stratagem-ado-stratagem/` (source: `stratagem-core-buildlog.md`). Detail page: [[ado-data-dir-suffix]].

### 2. ADO owner identity must be an assignable ADO identity (fixed)
`ado.config.json` `owner` was `zavdielx@gmail.com` (the PAT/MS-account email) which is **not an assignable ADO identity**, so `AssignedTo` failed; the real identity `tim.hachigian@intelliscience.com` came from `CreatedBy` (source: `stratagem-core-buildlog.md`). Fixed in both data-dir config files and validated by re-assigning #5623. All owner-writing skills (`ss`, `sp`, `board-sync`) trust the config `owner` verbatim with no self-heal — the recommended fix is to resolve the assignee from the authenticated PAT identity at runtime, in the [[neutral-board-seam]] (source: `stratagem-core-buildlog.md`). Detail page: [[ado-owner-identity]].

### 3. Plans-dir convention drift (worked around)
Three different plan locations coexist in one plugin: `px`/`ax` read `<git-root>/Plans/`; `ps`/`pf`/`cp` say only "the plans directory" (ambiguous → landed artifacts in `~/.claude/plans/`); `sp` defaults to `docs/plans/` (source: `stratagem-core-buildlog.md`). The session's plan was relocated to `<git-root>/Plans/` by hand to continue. Authoritative future convention: per-feature folders under `<git-root>/Plans/`, moving to `Vault/raw/` on completion (source: `stratagem-core-buildlog.md`). Detail page: [[plans-dir-drift]].

### 4. `verified → Closed` temp remap (known temp state)
`board-sync`'s event map currently remaps `verified → Closed` (was `Resolved`) "until the board situation is resolved"; `merged → Closed` is unchanged (source: `stratagem-current-flow.md`). Only one event fires per call, so `verified→Closed` / `merged→Closed` were not both exercised in this pass (source: `stratagem-core-buildlog.md`). Detail page: [[verified-to-closed-temp-remap]].

### Secondary finds
- **`/sg:sa` path bug** — the skill globs `~/.claude/skills/`, which plugin migration emptied → audits 0 skills as shipped; must be plugin-aware (`${CLAUDE_PLUGIN_ROOT}/skills`). It still found 3 real minor conformance deviations in `ps`, `wiki-graph-audit`, `wiki-ingest` (source: `stratagem-core-buildlog.md`). See [[skill-audit]].
- **Vault-location ambiguity** — CORPUS-READ-FIRST resolves the vault as `<git-root>/Vault`, but the project's authoritative vault may be a sibling repo (source: `stratagem-core-buildlog.md`). See [[corpus-read-first]].
- **Dev-refresh gotcha** — plugin content loads from a **version-keyed cache copy**; `marketplace update` + `plugin update` fails on same-version edits, `uninstall` + `install` forces a fresh copy (source: `stratagem-core-buildlog.md`). See [[dev-refresh-loop]].

---

## Outcome

Step 5 closed with 10 skills PASS + structural check of all 21 (source: `stratagem-core-buildlog.md`). Findings 1–3 plus workflow auto-install and Tavily docs were fixed on the current v0.1.0 build and shipped as **install-fixes PR #1747** (`drTim/install-fixes` → `master`, 5 files +368/−19) (source: `stratagem-core-buildlog.md`). The autonomy loop itself was validated next in [[first-if-autonomy-run]].

## Related

- **decisions revisited** — [[plugin-distribution-model]] — the marketplace model this pass installed · [[plans-dir-lifecycle]] — the plans-dir drift finding · [[workflow-auto-install-hook]] — the auto-install fix shipped in PR #1747
- **architecture** — [[plugin-marketplace-distribution]] — install & dev-refresh loop · [[ado-bridge]] — the bridge whose data-dir suffix bug this found
- **anti-patterns** — [[hardcoded-home-paths]] — the `/sa` zero-skills + data-dir root cause captured here
- **patterns** — [[owner-identity-resolver]] — the owner self-heal this pass recommended · [[corpus-read-first]] — the vault-location ambiguity finding
- **api** — [[board-sync-event-map]] — the `verified → Closed` temp-remap finding
- **retrospectives** — [[first-if-autonomy-run]] — the autonomy run validated next
