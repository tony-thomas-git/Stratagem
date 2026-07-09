---
name: sp
description: >
  Sync Plan — turn a Stratagem /cp execution plan into an Azure DevOps Feature
  with one child User Story per task, applying the create-time field contract,
  then write the board ids back into the plan as Sync-Id markers. Use when the
  user wants to push a planned feature onto the ADO Kanban board before /if runs.
argument-hint: "[plan-file]"
allowed-tools: >
  Read, Edit, Glob,
  mcp__plugin_stratagem-ado_azure-devops__wit_create_work_item,
  mcp__plugin_stratagem-ado_azure-devops__wit_add_child_work_items,
  mcp__plugin_stratagem-ado_azure-devops__wit_update_work_item,
  mcp__plugin_stratagem-ado_azure-devops__wit_get_work_item
---

# SP (Sync Plan)

**Purpose:** Push one `/cp` execution plan onto the Azure DevOps board as a Feature + child User Stories, with the create-time field contract applied, and write the board ids back into the plan so the autonomy loop can transition them later. This is the ADO occupant of the neutral `Sync-Id` seam — core Stratagem never names ADO; this skill does.

**Task:** $1 (a `/cp` plan path; if omitted, resolve the active plan in `docs/plans/`)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ SP (Sync Plan) MODE ACTIVE — stratagem-ado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Plan:    [resolved plan file]
 Project: [## ADO-Project or default]
 Area:    [## ADO-Area or board root]
 Owner:   [## ADO-Owner or config owner]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Instructions

1. **Resolve the plan.** Use `$1` if given, else find the most recent `*_plan.md` in the project's `docs/plans/`. Read it whole.

2. **Resolve the plugin identity config, then the headers (with defaults).**
   First resolve the plugin's per-install identity home (the same newest-wins glob the plugin uses for `pat.b64`, so it survives marketplace renames): `Glob` `~/.claude/plugins/data/stratagem-ado-*/ado.config.json` → newest match → `Read` it → parse `{ org, project, owner }`. Fail loud if absent (`SP ABORT: no ado.config.json found — see INSTALL.md §2c`). The config is the plugin's identity home; a plan header still overrides it per-plan.
   | Header | Default (from `ado.config.json`) |
   |---|---|
   | `## ADO-Project:` | the config's `project` |
   | `## ADO-Area:` | *(none — omit `System.AreaPath`; item lands at the team's board root)* |
   | `## ADO-Owner:` | the config's `owner` |
   Surface the resolved values in the banner before any write.

   > **Area fallback is deliberately empty, not a leaf.** The real default lives in the project's
   > `ado-board-config.md` (`## ADO-Area-Default`, e.g. `<Project>\<Area-Leaf>`)
   > and `/cp` bakes it into the plan header at plan time. When `## ADO-Area:` is absent, SP does
   > **not** substitute a leaf (never `…\<Area-Leaf>`) — it omits `System.AreaPath` so the item lands
   > at the board root as visible "uncategorized." (Fail-loud, no silent default fallback.)

3. **Idempotency guard (do this BEFORE creating anything).** Scan the plan's task lines for an existing `Sync-Id:` and the header for `## ADO-Feature-Id:`.
   - If ANY task already carries a `Sync-Id:` → **STOP**. Report: `plan already synced (Feature <id>, N stories) — re-sync is an update, not a create. Aborting to avoid duplicate cards.` Do not create work items.
   - This guard is load-bearing: SP is create-only; without it a re-run duplicates the whole board hierarchy.

4. **Extract the work.**
   - **Feature title** = the plan's `# Feature:` line text.
   - **Feature description** = the plan's Problem Statement / Solution summary (Markdown).
   - **Stories** = one per uncompleted task in `### Task List`. Story title = the task's one-line title; Story description = the task body + its `Verify:` line (Markdown).

5. **Create the Feature** with `mcp__plugin_stratagem-ado_azure-devops__wit_create_work_item`:
   - `project` = resolved Project, `workItemType` = `Feature`
   - `fields`:
     - `System.Title` = Feature title
     - `System.AreaPath` = resolved Area — **only if a `## ADO-Area:` was resolved; OMIT this field entirely when it wasn't** (ADO then assigns the team's root area; never substitute a leaf)
     - `System.AssignedTo` = resolved Owner
     - `System.Description` = Feature description (`format: Markdown`)
   - **Do NOT set `System.State` or `System.Reason`** — new items default to `New`; State/Reason are the *transition* pair owned by the loop (board-sync skill), not creation fields.
   - **Do NOT set `System.IterationPath`** — omitting it lands the item at the team's backlog root (no sprint), per the field contract.
   - Capture the returned **Feature id**.

6. **Create the child Stories** with `mcp__plugin_stratagem-ado_azure-devops__wit_add_child_work_items`:
   - `project` = resolved Project, `parentId` = Feature id, `workItemType` = `User Story`
   - `items` = one `{ title, description, areaPath: <resolved Area> }` per task — **omit `areaPath` too when no `## ADO-Area:` was resolved** (stories then inherit the board root, matching the Feature). Omit `iterationPath` (backlog root). `format: Markdown`.
   - Capture each returned **Story id**, in task order.
   - > Note: this API accepts only title/description/areaPath/iterationPath — it cannot set AssignedTo or State at create. Owner is applied in the next step.

7. **Apply Owner to each Story** (the field-contract step the child API can't do at create) with `mcp__plugin_stratagem-ado_azure-devops__wit_update_work_item`:
   - For each Story id: `updates` = `[{ op: "add", path: "/fields/System.AssignedTo", value: <resolved Owner> }]`.
   - State stays `New` (transitions happen later in the loop).

8. **Write the ids back into the plan (D9 — the neutral linkage seam).** Edit the plan file:
   - Add a header line under the title block: `## ADO-Feature-Id: <Feature id>`
   - Append ` — Sync-Id: <Story id>` to the end of each corresponding task line in `### Task List`.
   - These markers are deliberately generic (`Sync-Id`, not "ADO" / "Story") so the core seam reads them with zero ADO awareness.

9. **Report.** Emit:
   ```
   ✅ SP COMPLETE — <plan name>
      Feature: <id>  "<title>"   (Area <area>, Owner <owner>, State New)
      Stories: <id> "<task 1>"
               <id> "<task 2>"
               ...
      Board: https://dev.azure.com/<org>/.../  (Feature <id>)
      Wrote Sync-Id back into N task lines + ## ADO-Feature-Id header.
   ```

## Field contract (create-time only)

| Field | Value at create | Notes |
|---|---|---|
| Assigned To | `## ADO-Owner` / config `owner` | Feature via `fields`; Stories via follow-up `wit_update_work_item` |
| Area Path | `## ADO-Area` (else omitted → board root) | creation field; **no leaf default** — the default lives in `ado-board-config.md` via `/cp`, not here |
| Iteration Path | (omitted → backlog root) | no sprint at create |
| State | `New` (default — not set) | transition field, owned by the loop |
| Reason | (derives) | transition field, not set at create |

Transitions (New→Active→Resolved→Closed) are NOT this skill's job — they belong to the board-sync adapter driven by the autonomy loop. SP is create + link only.

## Guards

- **Never create on a plan that already has `Sync-Id:` markers** (step 3).
- **Read-only first if unsure:** if MCP auth is in doubt, the user can run `core_list_projects` (see INSTALL.md) before SP.
- **Throwaway tests:** when syncing a test/tracer plan, title the Feature `[TRACER-BULLET — DELETE ME] …` and tag `stratagem-tracer-bullet`, then delete after — never leave fixtures on the live board.
