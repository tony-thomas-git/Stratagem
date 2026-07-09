# Retrospective: mPX Hard Stop Fix
**Date:** 2026-02-25
**Type:** Skill enforcement failure → fix
**Source:** `mpx-hard-stop-fix_260225.md` (handoff doc, backfilled via RS)

---

## What Happened

The `/mpx` → `/max` human-in-the-loop gate was being consistently bypassed. The model would present the plan and then immediately begin editing files, skipping the explicit `mAX` authorization step.

**Error [1]:** Advisory gate language ("Wait for explicit 'mAX' approval") treated as soft preference — model optimistically continued.

---

## Root Cause Analysis

| Factor | Detail |
|--------|--------|
| Language type | Advisory ("wait for") vs imperative ("DO NOT") |
| Output requirement | None — model could silently skip the gate |
| Violation framing | Omission vs labeled error |

The model has no intrinsic reason to stop unless the instruction creates an unambiguous hard boundary. "Wait for approval" has a plausible continuation path (proceed if approval seems implicit). "DO NOT EDIT ANY FILES" does not.

---

## Fix Summary

Three-part fix applied to `~/.claude/skills/mpx/SKILL.md`:

1. **Hard stop language** — "HARD STOP — DO NOT EDIT ANY FILES"
2. **Explicit output requirement** — model must emit `⛔ AWAITING mAX AUTHORIZATION` block (visible proof of gate)
3. **Violation framing** — "Implementing without mAX is a workflow violation" (error label, not just omission)

---

## Pattern Extracted: Skill Gate Authoring

**Refinement [1] — CRITICAL:** Advisory gate language fails. Skill gates require three elements to be effective:

```
1. Hard imperative: "DO NOT [action]" (not "wait for" or "ensure")
2. Required visible output: Model MUST emit a specific block — creates observable pause
3. Violation label: Skipping = "workflow violation" (not just an omission)
```

This is the skill-prompt equivalent of the commit-blocking hook — mechanical enforcement within the prompt layer.

---

## Generalization

This pattern applies to **any** skill that has a human-in-the-loop checkpoint:

| Skill | Gate | Needs Hard Stop? |
|-------|------|-----------------|
| `/mpx` → `/max` | Plan → Execute | ✅ Fixed |
| `/px` → user review → `/ax` | Analysis → Implementation | ⚠️ Check |
| `/ex` → `/fx` | Error doc → Fix | ⚠️ Check |
| `/rs` → user confirmation → `/ags` | Proposals → Apply | ⚠️ Check |

---

## Gold Standard Update Proposals

### Proposal [1] — CRITICAL
**Target:** `C:\code\docs\Steward-docs\hooks-architecture.md`
**Section:** New section — "Skill-Level Enforcement Patterns" (complement to hook-level enforcement)
**Change type:** Addition
**Rationale:** Hooks enforce at the tool-call layer; skill prompt language enforces at the instruction layer. Both are needed. Currently hooks-architecture.md only documents the hook layer.

**Proposed addition:**
```markdown
## Skill-Level Enforcement Patterns

The same mechanical-over-advisory principle that governs hooks applies to skill prompt language.

### Gate Language Standard

**Failing pattern (advisory):**
> "Wait for explicit approval before implementing"

**Required pattern (imperative):**
```
**HARD STOP — DO NOT EDIT ANY FILES**
Output this exact block and wait:
  ⛔ AWAITING [COMMAND] AUTHORIZATION
  [description]. Type "[command]" to execute.
  No files will be touched until [command] is received.
```

**Three required elements for effective gates:**
1. **Hard imperative** — "DO NOT [action]" not "wait for" or "ensure"
2. **Required visible output** — model must emit a specific block (observable proof of gate)
3. **Violation label** — "Skipping this step is a workflow violation" (error, not omission)

### Skills with Human-in-the-Loop Gates (Audit Checklist)
- [ ] `/mpx` → `mAX` gate ✅ Hard stop applied
- [ ] `/px` → user review → `/ax` gate
- [ ] `/rs` → user confirmation → `/ags` gate
- [ ] `/ex` → user review → `/fx` gate
```

### Proposal [2] — RECOMMENDED
**Target:** `C:\code\docs\Steward-docs\hooks-architecture.md`
**Section:** Notes (bottom)
**Change type:** Addition of one note
**Proposed addition:**
```
- **Skill prompt gates ≠ hook gates** — hooks block at tool-call layer; skill language enforces at instruction layer. Both needed; neither alone is sufficient.
```

---

## Success Criteria Validated

- [x] Gate reliably stops before file edits
- [x] User sees explicit `⛔ AWAITING mAX` block before execution
- [x] Pattern generalized and documented
- [x] Gold standard proposals created

---

## Disposition

Proposals above to be applied via AGS to `hooks-architecture.md`.
