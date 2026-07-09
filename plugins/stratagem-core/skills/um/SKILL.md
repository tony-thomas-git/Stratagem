---
name: um
description: UpdateMe - Instant plan status snapshot — what's done, what's running, what's next
argument-hint: "optional: plan file name"
---

# UM (UpdateMe)

**Purpose:** Deliver a sub-10-second plan status snapshot — agent state, last completed task, current in-progress task, and next task.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ UM (UpdateMe) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "scanning..."]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Plan Discovery (priority order — stop at first match):**
   - **Scope:** discovery targets the `.md` execution plans (`*_plan.md`). Ignore `.html` siblings (`*_seed.html`, `*_plan.html`, `*_completed.html`, `*_retrospective.html`) — those are human-read artifacts, not live execution state. (Exception: honor an explicit $ARGUMENTS or IDE-open file even if HTML, but a status snapshot only makes sense for the `.md` execution plan.)
   1. If $ARGUMENTS specifies a plan file → use it
   2. If an `ide_opened_file` context shows a plan file currently open in the IDE → use that file
   3. Run `git diff --name-only` and scan `docs/plans/` for the `.md` plan whose "Files Modified" or task list has the most file overlap with the diff — active regardless of completion status (completed plans serve as ongoing bug logs)
   4. Fall back to most recently modified `.md` execution plan only if no match found above
   - Read the plan file's task list (completed/in-progress/pending markers)

2. **Agent Activity Detection:**
   - Run `git status` and `git diff --stat`
   - If uncommitted changes exist → agent is **ACTIVE** (implementation in flight)
   - If working tree is clean → agent is **IDLE** (between tasks or finished)
   - Note which files are modified — cross-reference against the plan's current task to confirm alignment

3. **Task Position Scan:**
   - **Last completed:** Most recent task marked done in the plan
   - **In progress:** Current task — if ACTIVE, confirm it matches the modified files; if IDLE and no explicit marker, mark as "none / between tasks"
   - **Up next:** First uncompleted task after the in-progress one

4. **Status Output:**
   Emit this block and nothing else — keep each line to one short phrase:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📋 PLAN STATUS — [plan file name]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Agent:  ACTIVE 🟢  |  IDLE ⚫  (pick one)
    ✅ Done:    [last completed task — one line]
    🔄 Now:     [current task or "between tasks"]
    ⏭  Next:    [next pending task — one line]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
   If the agent is ACTIVE but the modified files don't match the expected task, add one warning line:
   `⚠️  Modified files don't match expected task — manual check recommended`

**Key Principles:**
- Speed over completeness — this is a glance, not a briefing
- Never explain the output — just emit the status block
- One line per field, no sub-bullets
- If the plan file is ambiguous or missing, say so in the "Now" field and stop

**Next:** `/rp` — full plan context restore, or `/px` — analyze the next task
