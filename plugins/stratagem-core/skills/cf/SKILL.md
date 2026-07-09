---
name: cf
description: Complete Feature - Complete remaining tasks and generate executive summary
argument-hint: "plan file name"
---

# CF (Complete Feature)

**Purpose:** Complete all remaining tasks in a feature plan and generate an executive summary suitable for Kanban stories.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ CF (Complete Feature) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Instructions:**

1. **Plan Analysis:**
   - Read current plan file from `docs/plans` folder
   - Identify all uncompleted tasks in the plan
   - Validate that most tasks are completed and only final tasks remain

2. **Task Completion Status Update:**
   - Review all uncompleted tasks in the plan file
   - Verify that the work described in each task appears to be already implemented (check git diff, file existence, etc.)
   - Mark uncompleted tasks as completed with timestamp and note: "COMPLETED via CF mode - work verified as implemented"
   - If any tasks appear genuinely incomplete, ask user for confirmation before marking as complete
   - Do NOT implement new code - only update task status to reflect existing work

3. **Feature Validation:**
   - Verify all core functionality works as specified
   - Confirm all tests pass with adequate coverage
   - Validate integration points and dependencies
   - Ensure no breaking changes unless intentional

4. **Executive Summary Generation:**
   - Create comprehensive feature completion summary at the top of the plan file
   - Include the following sections in the summary:
     ```markdown
     # FEATURE COMPLETION SUMMARY
     ## Executive Overview
     [Brief description of feature and its purpose]

     ## Key Achievements
     - [List of major accomplishments]
     - [Architectural improvements made]
     - [Performance enhancements delivered]

     ## Acceptance Criteria Completed
     - [Detailed list of all acceptance criteria met]
     - [Include quantifiable metrics where applicable]

     ## Testing Coverage
     - **Unit Tests:** [Number] tests created with [percentage]% coverage
     - **Integration Tests:** [Description of integration test scenarios]
     - **Performance Tests:** [Performance validation results]

     ## Technical Implementation
     - **Files Created:** [List of new files with brief descriptions]
     - **Files Modified:** [List of modified files with changes]
     - **API Changes:** [Breaking changes or new interfaces]

     ## Usage Examples
     [Code examples showing how to use the new feature]

     ## Validation Results
     - **Build Status:** Debug and Release configurations compile successfully
     - **Test Results:** All tests pass
     - **Performance Impact:** [Measured performance characteristics]
     ```

5. **Completed-Feature Report Sidecar (HTML):**
   - In addition to the inline `.md` summary above, emit a **standalone Completed-Feature report** as an HTML sidecar next to the plan file: `docs/plans/{feature_name}_{unique_id}_completed.html`.
   - **Purpose:** a terminal, human-read report of what shipped — the one completion artifact that earns HTML's layout + diagrams (architecture deltas, before/after, component maps).
   - **Lifecycle:** write-once. A completed feature is done; the sidecar is authored at completion and never edited again. (This is why it cannot drift from the plan: both are frozen at the same moment — see the rule below.)
   - **Content:** mirror the FEATURE COMPLETION SUMMARY sections, then enrich with presentation — narrative flow, SVG diagrams where a drawing beats prose. Use the HTML chassis for layout; SVG only for free geometry (crossing connectors, arrows over objects).
   - **The one hard rule (no two-source-of-truth):** the sidecar may be richer in **presentation** (diagrams, narrative) but must **not** contain facts the `.md` plan record lacks. The `.md` plan is authoritative for *what happened* (tasks, status, audit trail); the `.html` sidecar is authoritative for *how to understand it* (the story). If a fact matters to the record, it belongs in the `.md` too. Richer story — yes. Divergent facts — no.

6. **Plan File Finalization:**
   - Mark all tasks as completed with timestamps
   - Update plan status to "COMPLETED"
   - Preserve all error logs and resolution details
   - Maintain complete audit trail of implementation

7. **Documentation Validation:**
   - Ensure summary is suitable for copying into Kanban story
   - Verify technical details are accurate and complete
   - Confirm usage examples are functional
   - Validate that other developers can understand and use the feature

8. **Output Requirements:**
   - Executive summary must be standalone and comprehensive
   - Technical details must be sufficient for code review
   - Usage examples must be copy-paste ready
   - All claims must be verifiable through testing

9. **Board-adapter handoff (neutral, presence-checked):**
   - If a board adapter exposing a publish / pull-request capability is configured (e.g. a board plugin is installed and enabled), offer to hand the executive summary off to it — e.g. open a linked pull request from this completed feature. Presence-checked: with no such adapter this is a silent no-op.
   - Core names no external system; this is a generic completion handoff. The adapter (when present) owns all external linkage.

**Acceptance Criteria for CF Mode:**
- All plan tasks marked as completed with appropriate CF mode notation
- Task completion status reflects actual implementation state (verified via git diff/file checks)
- Executive summary is Kanban-ready and comprehensive
- Completed-Feature HTML sidecar emitted (`{feature}_{id}_completed.html`); presentation-richer than the inline summary but with no facts the `.md` record lacks
- Feature works end-to-end as specified
- No new code implementation - only status updates and documentation

**Completion Gate:** Emit this block and wait for response:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✅ FEATURE COMPLETE — [feature name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Run /rs to extract learnings and update gold docs.
 Type "skip" to close without retrospective.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Next:** `/rs` — extract learnings and update gold standard docs