---
name: pica
description: Post-Implementation Compliance Audit - Ensure pattern consistency across implementations
argument-hint: "pattern name or file"
---

# PICA (Post-Implementation Compliance Audit)

**Purpose:** Ensure pattern consistency across the implementations your change touches immediately after each change.

**Task:** $ARGUMENTS

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ PICA (Post-Implementation Compliance Audit) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Trigger:** Embedded as the final step in AX, mAX, and FX — also available standalone for ad-hoc audits

**Stack:** Derive the audit scope from the active project's `CLAUDE.md` (the `CLAUDE.md` at the git root of CWD) — its languages, layers, the working-scope boundary, and the source-of-truth style/pattern docs. Audit only the layers `CLAUDE.md` marks as in-scope; treat any layer it delegates to another owner (e.g. a native interop seam) as out of audit scope.

**Instructions:**

1. **Scope the audit:**
   - Identify the pattern just implemented (component registration, thread/async marshalling, resource-lifecycle ordering, data-binding, module wiring, etc.).
   - **Audit targets:** the changed source files — **plus their sibling files implementing the same pattern** — scoped per the `Stack:` boundary above (any layer `CLAUDE.md` delegates to another owner stays out of audit scope).

2. **Audit the consistency dimensions** — check the dimensions your `CLAUDE.md` + style docs define; common ones:
   1. **DI / registration consistency** — new components (services, view-models, handlers, modules) are registered through the project's DI/composition mechanism the way their siblings are, following the established construction/injection convention.
   2. **Concurrency / async correctness** — cross-thread and async callbacks marshal to the required context per the project's threading model; shared-state mutations follow its synchronization convention.
   3. **Resource-lifecycle ordering** — acquire/release, write/commit, and teardown steps run in the order the pattern requires (reversing them risks data loss or leaks).
   4. **Style-guide conformance** — naming, member/region ordering, bracing, one-unit-per-file, and fail-fast conventions match the project's style docs (no silent default fallbacks).
   5. **Boundary / seam coordination** — changes at a shared seam (interop, API, module boundary) honor the seam's contract and are *coordinated* with the owning side, never applied unilaterally.
   6. **New-component wiring** — a new unit is wired into every registry / index / enum the pattern requires so it is fully discoverable, not half-registered.

3. **Report Compliance Status:**
   ```
   COMPLIANCE AUDIT: [Dimension / Pattern]
   Audited: [N] files
   Compliant: [X] files
   Need Alignment: [Y] files
   - [file:line]: [specific discrepancy]
   ```

4. **Action Based on Mode:**
   - **AX/FX (with plan file):** Create follow-up task in plan file for non-compliant files
   - **mAX (memory mode):** Note inconsistencies for user decision (no auto-fix)

**Output Format:**
```
POST-IMPLEMENTATION AUDIT COMPLETE
Pattern: [e.g., "UI-thread marshalling on pipeline callback"]
Files Audited: [N]
Result: [All compliant / X files need alignment]
[If non-compliant: list files and discrepancies]
[If AX/FX: "Follow-up task added to plan file"]
[If mAX: "Recommend manual review of: [files]"]
```

**Next:** done — audit complete, address non-compliant files if found