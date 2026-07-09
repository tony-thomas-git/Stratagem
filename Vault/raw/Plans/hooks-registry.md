# Hooks Registry

**Status:** 3 hooks deployed
**Scripts:** `C:/Users/steep/.claude/hooks/`
**Config:** `~/.claude/settings.json` → `"hooks"` key

---

## Deployed Hooks

### 1. Commit Protection

- **Event:** `PreToolUse` → matcher: `Bash`
- **Purpose:** Mechanically enforce "never commit" rule — blocks any `git commit` or `git push`
- **Type:** `command` hook, exit 2 on match (blocks execution)
- **Script:** `block-commits.sh`

```json
{
  "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "bash \"C:/Users/steep/.claude/hooks/block-commits.sh\"" }] }]
}
```

```bash
#!/bin/bash
LOG="$HOME/.claude/hooks/hook.log"
INPUT=$(cat)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if echo "$INPUT" | grep -qiE 'git\s+(commit|push)'; then
  echo "[$TIMESTAMP] BLOCKED: git commit/push attempt" >> "$LOG"
  echo "BLOCKED: git commit/push not allowed. All changes must remain uncommitted for manual review." >&2
  exit 2
fi

echo "[$TIMESTAMP] PASS: bash command allowed" >> "$LOG"
exit 0
```

**Log:** `~/.claude/hooks/hook.log`

---

### 2. Plan Watcher

- **Event:** `PostToolUse` → matcher: `Write`
- **Purpose:** Alert when Claude Code writes to `~/.claude/plans/` — catches background planning operations and misdirected saves that should go to `C:\code\docs\`
- **Type:** `command` hook, exit 0 (warn-only — PostToolUse cannot block)
- **Script:** `watch-plans.sh`

```json
{
  "PostToolUse": [{ "matcher": "Write", "hooks": [{ "type": "command", "command": "bash \"C:/Users/steep/.claude/hooks/watch-plans.sh\"" }] }]
}
```

```bash
#!/bin/bash
INPUT=$(cat)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG="$HOME/.claude/hooks/hook.log"

if echo "$INPUT" | grep -qiE '\.claude[/\\]plans[/\\]'; then
  FILE_PATH=$(echo "$INPUT" | grep -oiE '[A-Za-z]:[/\\][^"]*\.claude[/\\]plans[/\\][^"]*' | head -1)
  [ -z "$FILE_PATH" ] && FILE_PATH="(path not extracted)"
  echo "[$TIMESTAMP] PLAN WATCH ALERT: $FILE_PATH" >> "$LOG"
  echo "PLAN FILE WRITTEN to ~/.claude/plans/: $FILE_PATH"
  powershell.exe -WindowStyle Hidden -NonInteractive -Command "
    \$AppId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    \$xmlDoc = New-Object Windows.Data.Xml.Dom.XmlDocument
    \$xmlDoc.LoadXml('<toast><visual><binding template=\"ToastText02\"><text id=\"1\">Claude Code: Plan File Written</text><text id=\"2\">$FILE_PATH</text></binding></visual></toast>')
    \$toast = [Windows.UI.Notifications.ToastNotification]::new(\$xmlDoc)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier(\$AppId).Show(\$toast)
  " 2>/dev/null &
fi
exit 0
```

**Notes:**
- AppId uses PowerShell's registered AUMID — Windows recognizes it and shows the toast
- `&` makes PowerShell fire-and-forget so hook exits immediately
- Double-quoted bash string expands `$FILE_PATH`; `\$` escapes PowerShell variables

---

### 3. Tool Metrics Logger

- **Event:** `PostToolUse` → 5 separate matchers (one per tool)
- **Purpose:** Passively track invocation success/failure of context7 and tavily — feeds `/rs` retrospectives with real usage data
- **Type:** `command` hook, exit 0 (log-only, never blocks)
- **Script:** `log-tool-metrics.sh`
- **Log:** `~/.claude/hooks/tool-metrics.log`

**Matchers:**
- `mcp__context7__resolve-library-id`
- `mcp__context7__query-docs`
- `mcp__tavily__tavily_search`
- `mcp__tavily__tavily_research`
- `mcp__tavily__tavily_extract`

**Log format:**
```
[2026-03-13 10:00:00] TOOL=context7/query-docs | STATUS=ok | QUERY="react useState hook"
[2026-03-13 10:01:00] TOOL=tavily/search | STATUS=empty | QUERY="obscure library"
[2026-03-13 10:02:00] TOOL=context7/resolve-library-id | STATUS=error | QUERY="nonexistent"
```

**Status detection (grep-based, no jq):**
- `error` → stdin contains `"isError": true`, `"error":`, or `"failed"`
- `empty` → stdin contains `"[]"` or `"null"`, or no `"content":` key
- `ok` → default

**Monitoring:**
```bash
cat ~/.claude/hooks/tool-metrics.log
grep STATUS=error ~/.claude/hooks/tool-metrics.log | wc -l
grep TOOL=context7 ~/.claude/hooks/tool-metrics.log
```

---

## Candidate Hooks (Not Deployed)

### Plan File Validation

- **Event:** `Stop`
- **Purpose:** Verify plan file was updated before session completion — prevents silent task tracking drift
- **Type:** `agent` hook with file inspection; blocks stop if plan wasn't updated

```json
{
  "Stop": [{ "hooks": [{ "type": "agent", "prompt": "Check if any plan file in C:/code/docs/*/plans/ was modified in this session. Verify that at least one task was moved to the Completed Tasks section. If no plan was updated, respond {\"ok\": false, \"reason\": \"Plan file not updated with task completion\"}", "timeout": 30 }] }]
}
```

---

### Context Survival After Compaction

- **Event:** `SessionStart` → matcher: `compact`
- **Purpose:** Long `/phx` runs hit compaction and lose execution state — re-inject current plan, task number, tracer bullet status
- **Type:** `command` hook reading from `.claude/session-state.json`

Skills write state during execution; hook re-injects on compaction:
```json
{ "active_skill": "phx", "plan_file": "...", "current_phase": 2, "current_task": 5, "tracer_bullet": true }
```

---

### CP Strategic Context Enforcement

- **Event:** `PostToolUse` → matcher: `Write`
- **Purpose:** Catch CP plans that drop PF strategic context — warn if `### Strategic Context` subsections are missing
- **Type:** `command` hook, warn-only

Required sections: `#### What's Already Built`, `#### Architecture Decisions`, `#### Phase Strategy`, `#### Entity/Component Notes`, `#### Dependencies`, `#### Risk Assessment`, `#### Open Design Decisions`, `#### Success Criteria`

---

## Skill Gates (Human-in-the-Loop)

Skills requiring confirmation before proceeding — audit checklist:
- [x] `/mpx` → `mAX` gate — hard stop enforced
- [ ] `/px` → user review → `/ax` gate
- [ ] `/rs` → user confirmation → `/ags` gate
- [ ] `/ex` → user review → `/fx` gate

Gate language standard and three required elements: see 🪙Steward-Patterns.md → Gate Language.

---

## Notes

- All hooks tested in isolation before global deployment
- Hooks communicate through stdin/stdout/exit codes only
- `PostToolUse` hooks cannot undo actions — warn only
- `Stop` hooks fire on every stop — may need filtering logic
- No `jq` on this system — grep raw stdin
- Hook scripts: `C:/Users/steep/.claude/hooks/`
- Config: `~/.claude/settings.json` under `"hooks"` key
