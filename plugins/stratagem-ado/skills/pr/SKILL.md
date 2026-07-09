---
name: pr
description: >
  Open a pull request for a completed feature and link its Azure DevOps Feature
  + child Stories to it, so the board reflects "code in review" and the work
  items auto-close on merge. Use after /cf, once the feature branch is pushed.
  Linkage happens at PR-time (not commit-time), keeping the never-commit rule intact.
argument-hint: "[plan-file]"
allowed-tools: >
  Read, Glob,
  mcp__plugin_stratagem-ado_azure-devops__repo_get_repo_by_name_or_id,
  mcp__plugin_stratagem-ado_azure-devops__repo_create_pull_request,
  mcp__plugin_stratagem-ado_azure-devops__wit_link_work_item_to_pull_request,
  mcp__plugin_stratagem-ado_azure-devops__repo_update_pull_request_reviewers,
  mcp__plugin_stratagem-ado_azure-devops__core_get_identity_ids
---

# PR (Open Pull Request)

**Purpose:** Turn a completed feature into a linked Azure DevOps pull request — create the PR from the `/cf` executive summary, link the Feature and every child Story, optionally request reviewers, and arrange for the work items to close on merge. Linkage is done **at PR-time** (via the work-item-to-PR API), never via a git commit hook — so Stratagem's never-commit rule stays intact.

**Task:** $1 (the completed `/cf` plan; if omitted, resolve the active plan in `docs/plans/`)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ PR (Open Pull Request) MODE ACTIVE — stratagem-ado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Plan:    [resolved plan]
 Repo:    [## ADO-Repo or default]
 Source:  [feature branch]
 Target:  [## ADO-Target or staging]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Precondition (never-commit boundary)

This skill **does not commit or push**. The feature branch must already exist on the remote (the user pushes their reviewed diff manually — Stratagem never commits). If the branch is not on the remote, **HALT**: `feature branch '<b>' not found on remote — push it, then re-run /stratagem-ado:pr`. The PR is opened against an existing remote branch only.

## Instructions

1. **Resolve the plugin identity config, then inputs** from the plan header (defaults in parens).
   First resolve the plugin's per-install identity home (newest-wins glob, same as `pat.b64`): `Glob` `~/.claude/plugins/data/stratagem-ado-*/ado.config.json` → newest → `Read` → parse `{ org, project }`. Fail loud if absent (`PR ABORT: no ado.config.json found — see INSTALL.md §2c`). The `org` builds the PR/board URL; `project` is the `## ADO-Project:` default. A plan header still overrides.
   | Source | Default |
   |---|---|
   | `## ADO-Project:` | the config's `project` |
   | `## ADO-Repo:` | the project's primary repo |
   | `## Branch:` (source) | `tony/<plan-slug>` |
   | `## ADO-Target:` | `staging` |
   | `## ADO-Reviewers:` | (none — reviewer request skipped) |
   - The Feature id = `## ADO-Feature-Id:`; the Story ids = each task's `Sync-Id:` marker (written by `/stratagem-ado:sp`). If these markers are absent → **HALT**: `plan not synced (no ADO-Feature-Id) — run /stratagem-ado:sp first`.

2. **Resolve IDs (required for linkage).** Call `mcp__plugin_stratagem-ado_azure-devops__repo_get_repo_by_name_or_id` with `{ project, repositoryNameOrId: <repo> }`. Capture the **repository ID** (GUID) and the **project ID** (GUID) from the result. The linkage API needs both as IDs — names are rejected.

3. **Create the PR** with `mcp__plugin_stratagem-ado_azure-devops__repo_create_pull_request`:
   - `repositoryId` = repo ID, `project` = project name/ID
   - `sourceRefName` = `refs/heads/<feature branch>`, `targetRefName` = `refs/heads/<target>`
   - `title` = the plan's `# Feature:` title
   - `description` = the `/cf` **Executive Overview + Key Achievements** (trimmed to ≤ 4000 chars; Markdown)
   - `isDraft` = false (override only if requested)
   - Capture the returned **pullRequestId**.

4. **Link the work items (PR-time linkage).** For the Feature id AND each Story `Sync-Id`, call `mcp__plugin_stratagem-ado_azure-devops__wit_link_work_item_to_pull_request`:
   - `projectId` = project **GUID** (name is NOT valid here)
   - `repositoryId` = repo **GUID**
   - `pullRequestId` = the new PR id
   - `workItemId` = the Feature id / Story id
   - This is the linkage seam: it associates work items at PR-creation, NOT via a commit message `#id` — which is why the never-commit rule holds.

5. **Request reviewers (optional, skip-loud).** If `## ADO-Reviewers:` lists people, resolve their ids with `mcp__plugin_stratagem-ado_azure-devops__core_get_identity_ids`, then `mcp__plugin_stratagem-ado_azure-devops__repo_update_pull_request_reviewers` with `{ repositoryId, pullRequestId, reviewerIds, action: "add" }`. If none listed or resolution fails → log `board-sync: reviewers skipped` and continue (never fail the PR on reviewer resolution).

6. **Closed-on-merge.** Linked work items move to **Closed** when the PR merges. Two paths, in order of preference:
   - If the repo/PR has "complete linked work items on merge" enabled, ADO closes them automatically.
   - Otherwise, after merge, notify the board adapter to close each: invoke `/stratagem-ado:board-sync` with `{ event: "merged", syncId: <id>, task: <n> }` for the Feature and each Story (the `merged → Closed` map). A Feature closes once all its child Stories are Closed.
   - Document which path applies for this repo in the PR description footer.

7. **Report:**
   ```
   ✅ PR COMPLETE — <plan name>
      PR #<id>: "<title>"   (<source> → <target>)
      Linked: Feature <id> + Stories <id, id, ...>
      Reviewers: <added | skipped>
      URL: https://dev.azure.com/<org>/.../pullrequest/<id>
      On merge: linked items → Closed (<auto | via board-sync 'merged'>).
   ```

## Guards

- **Never commit or push** — open the PR on a pre-pushed branch only.
- **Linkage at PR-time**, never via a commit `#id` hook (keeps the never-commit boundary; matches the plugin's D8 decision).
- **Reviewer + close-on-merge are best-effort** — never fail the PR creation on either.
- Resolve repo + project to **GUIDs** before linking — the link API rejects names.
