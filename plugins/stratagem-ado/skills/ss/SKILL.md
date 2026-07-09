---
name: ss
description: Sync Seed - create an Azure DevOps board Story from a seed file and attach the seed file to the new card. Use to drop a seed doc onto the Kanban board as a spike awaiting delivery.
argument-hint: "[seed-file] (optional: \"Story title\")"
allowed-tools: >
  Read, Glob, Bash,
  mcp__plugin_stratagem-ado_azure-devops__wit_create_work_item,
  mcp__plugin_stratagem-ado_azure-devops__wit_update_work_item,
  mcp__plugin_stratagem-ado_azure-devops__wit_get_work_item
---

# SS (Sync Seed)

**Purpose:** Turn one seed file into an Azure DevOps board User Story — created in the spike swimlane awaiting delivery — and attach the seed file itself to the new card. This codifies the manual create → move-to-lane → attach flow; the attach step uses the raw ADO REST API because the azure-devops MCP has no attachment-upload capability.

**Task:** $ARGUMENTS

**Display this banner on activation:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ SS (Sync Seed) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Seed:    [resolved seed file]
 Title:   [resolved Story title]
 Project: [## ADO-Project or default]
 Lane:    [resolved swimlane]
 State:   [resolved column state]
 Owner:   [current identity]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Resolve the seed file.** Take the first argument (`$1`) as the seed file path; if quoted text follows, treat it as an explicit Story title. **Verify the file exists** (`ls`/`Read`) and capture its `basename` and byte size — fail loud if missing (`SS ABORT: seed file not found: <path>`). Never create a card for a seed that isn't there.

2. **Resolve values (with defaults).** First resolve the plugin's per-install identity home — the same newest-wins glob used for `pat.b64` (survives marketplace renames): the newest `~/.claude/plugins/data/stratagem-ado-*/ado.config.json` → parse `{ org, project, owner }`; fail loud if absent (`SS ABORT: no ado.config.json found — see INSTALL.md §2c`). `org`/`project`/`owner` below come from it (`org` is also resolved in the step-5 Bash block). Surface all of these in the banner before any write:
   | Value | Default |
   |---|---|
   | Story title | the seed's **file name** with extension removed (e.g. `0-7-tray-defect-counting-fix_260707_seed`); an explicit quoted title arg still overrides |
   | `## ADO-Project` | the `project` from `ado.config.json` |
   | `## ADO-Area` | *(omit `System.AreaPath` → item lands at board root; no leaf default)* |
   | Owner | the `owner` from `ado.config.json` (the plugin's per-install identity home) |
   | Swimlane | `Spike / Waiting on Delivery` |
   | Column state | `Ready` |
   | Iteration | *(omit → backlog root; do not hardcode a sprint)* |

3. **Create the User Story** with `wit_create_work_item`:
   - `project` = resolved Project, `workItemType` = `User Story`
   - `fields`: `System.Title` = resolved title; `System.State` = `Ready`; `System.AssignedTo` = Owner; `System.AreaPath` = Area **only if resolved** (omit otherwise); `System.Description` = ``Seed synced from `<basename>`. See attached.`` (`format: Markdown`).
   - **Omit `System.IterationPath`** (backlog root).
   - Capture the returned **Story id** and the full `fields` block.

4. **Move it into the swimlane — discover the field, don't hardcode the GUID.** In the create response `fields`, find the key matching `^WEF_.*_Kanban\.Lane$` (e.g. `WEF_E14E5B66A743473C8E6D5339426B59E2_Kanban.Lane`). The friendly alias `System.BoardLane` is **ReadOnly at create and update** — you must write the board-scoped `WEF_…` key. `wit_update_work_item` with `[{ op: "add", path: "/fields/<that WEF key>", value: "<resolved swimlane>" }]`. A new card defaults to the board's first lane (`Development / Assembly` here), not `Default` — this step is what lands it in the spike lane.

5. **Attach the seed file (raw ADO REST — the MCP cannot do this).** Run one Bash block; **never echo the token**:
   - Resolve the PAT, newest-wins across identity dirs (survives marketplace renames):
     `PATFILE=$(ls -t "$HOME"/.claude/plugins/data/stratagem-ado-*/pat.b64 2>/dev/null | head -1)` → fail loud if empty (`SS ABORT: no pat.b64 found — cannot attach`). `TOKEN=$(tr -d '\r\n' < "$PATFILE")` (this is the base64 `email:PAT` Basic-auth token — pass it verbatim as `Authorization: Basic $TOKEN`).
   - **Step 5a — upload bytes:** resolve the org from the config in the same data dir — `CFGFILE=$(ls -t "$HOME"/.claude/plugins/data/stratagem-ado-*/ado.config.json 2>/dev/null | head -1)` → fail loud if empty (`SS ABORT: no ado.config.json found — cannot resolve org`); `ORG=$(node -e "process.stdout.write((require(process.argv[1]).org||''))" "$CFGFILE")` → fail loud if empty. Then `POST https://dev.azure.com/$ORG/_apis/wit/attachments?fileName=<basename>&api-version=7.1` with `Content-Type: application/octet-stream` and `--data-binary @"<seed file>"`. Parse `.url` from the JSON response (the attachment URL).
   - **Step 5b — link the relation:** `PATCH https://dev.azure.com/$ORG/_apis/wit/workitems/<Story id>?api-version=7.1` with `Content-Type: application/json-patch+json` and body `[{"op":"add","path":"/relations/-","value":{"rel":"AttachedFile","url":"<attachment url>","attributes":{"comment":"seed doc"}}}]`.
   - Print only a size/rev summary — never the token or full payload.

6. **Verify.** `wit_get_work_item` with `expand: relations` on the Story id. Confirm one `AttachedFile` relation whose `attributes.name` = the seed basename and `attributes.resourceSize` = the source byte size. If absent or size-mismatched, report FAIL — do not claim success.

7. **Report.**
   ```
   ✅ SS COMPLETE
      Story <id>  "<title>"   (State Ready · Lane Spike / Waiting on Delivery)
      Attached: <basename>  (<size> bytes, AttachedFile #<attachment id>)
      Board:  https://dev.azure.com/<org>/.../_workitems/edit/<id>
   ```
   Then surface a **Decisions Made** block (title source, State, lane, iteration=backlog-root) so the user can `adjust N` any default.

**Guards:**
- **Fail loud, never fabricate:** missing seed file (step 1) or missing PAT (step 5) aborts with a clear message — never create a half-synced card or a card with no attachment when one was requested.
- **Token hygiene:** the PAT is read into a shell variable only; never print, log, or pass it outside the two curl calls.
- **Board-GUID-agnostic:** always discover the `WEF_…_Kanban.Lane` key from the live item (step 4) — do not hardcode a team GUID; it differs per board.
- **Throwaway tests:** when syncing a test seed, prefix the title `[TRACER — DELETE ME]` and delete the card after — never leave fixtures on the live board.
- **Never commit:** SS writes to the board and reads the seed; it does not touch git.

**Next:** groom the new spike card on the board, or run `/ss <another-seed>` to sync the next one.
