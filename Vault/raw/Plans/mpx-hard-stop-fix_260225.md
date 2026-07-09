# mPX Hard Stop Fix — Handoff Doc
**Date:** 2026-02-25
**File Changed:** `C:\Users\steep\.claude\skills\mpx\SKILL.md`

---

## Problem

The `/mpx` skill was not enforcing its own human-in-the-loop gate. The skill instructions said:

> "Wait for explicit 'mAX' approval before implementing"

But the AI was reading past this and jumping straight to file edits. The plan-present → wait → mAX → execute contract was being violated every time.

---

## Root Cause

The gate language was **advisory**, not imperative. "Wait for approval" reads as a soft preference. The model optimistically continued because nothing hard-stopped it.

---

## Fix Applied

Replaced the soft gate in Step 3 with a **HARD STOP** block:

**Before:**
```
- Wait for explicit "mAX" approval before implementing
```

**After:**
```
- **HARD STOP — DO NOT EDIT ANY FILES**
- Output this exact block and wait:
  ⛔ AWAITING mAX AUTHORIZATION
  Plan is ready. Type "mAX" to execute or provide feedback to revise.
  No files will be touched until mAX is received.
```

Also added to Step 4:
```
- **NEVER skip step 3. Implementing without mAX is a workflow violation.**
```

---

## Why It Works Now

1. **Explicit output requirement** — the model must emit the `⛔ AWAITING mAX` block, which forces a visible pause the user can see and verify
2. **"Workflow violation" framing** — labels skipping the gate as an error, not an omission, which the model treats differently
3. **Hard imperative language** — "DO NOT EDIT ANY FILES" is unambiguous; "wait for approval" was not

---

## Expected Behavior After Fix

| Trigger | Expected Output |
|---------|----------------|
| `/mpx some task` | Plan presented + `⛔ AWAITING mAX AUTHORIZATION` block — no file edits |
| `mAX` | Execution begins from in-memory plan |
| Anything else | Waits — no file edits |

---

## The Contract (mPX → mAX)

```
/mpx  →  [Plan presented]  →  ⛔ AWAITING mAX  →  user types "mAX"  →  /max executes
```

This is the human-in-the-loop checkpoint that separates planning from execution.
