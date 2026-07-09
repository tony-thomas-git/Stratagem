---
name: pica
description: Post-Implementation Compliance Audit - Ensure pattern consistency across implementations
argument-hint: "pattern name or file"
---

# PICA (Post-Implementation Compliance Audit)

**Purpose:** Ensure pattern consistency across Layer-5 (C#/WPF) implementations immediately after each change.

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
   - Identify the pattern just implemented (Windsor registration, UI-thread marshalling, storage/export flow, MVVM binding, module wiring, etc.).
   - **Audit targets:** the Layer-5 `.cs/.xaml` files touched by the change — `IVia.App/` (+ `IVia.Common`, `IVia.Controls`, `IVia.Config`, `IVia.WebServices`, `IVia.Imaging`) — **plus their sibling files implementing the same pattern.**
   - Do NOT audit native C++ below the interop seam — that's the C++ dev's domain.

2. **Audit the consistency dimensions** (check the ones the change touches):
   1. **Windsor registration** — new ViewModel/service/dialog/module registered in `IVia.App/Services/ComponentService.cs`; constructor injection only (property injection disabled — no public settable injected props).
   2. **UI-thread marshalling** — TBB / `InspectionResponseReadyEvent` callbacks and every `ObservableCollection` mutation go through `Dispatcher.Invoke/BeginInvoke`; flag any XAML-bound write off the UI thread.
   3. **Live vs aggregated** — export/scoring/history never bind `PipelineLiveResult`; live preview never binds `AggregatedResult`.
   4. **Dialogs** — created via `UserInterfaceService.ShowDialogAsync(...)`, never `new …Dialog().ShowDialog()`.
   5. **Export ordering** — history-cache write precedes `base.OnOkCommandAsync()` (reverse = silent file-deletion data loss).
   6. **C# style** (`[[CSharpCodeStyle]]`) — `_camelCase` fields, `PascalCase` props, `PascalCaseAsync` methods, required region order, braces on all `if`, one class per file, fail-fast (no silent default fallbacks).
   7. **Interop consumption** (shared `IVia.Vision/` seam) — consume `IVisualInspectionControlInterop` events via the double-buffer pattern; surface changes are *coordinated* with the C++ dev, never unilateral.
   8. **New inspection module — our half** — C# `InspectionKind` enum, Windsor registration, `RegisterStorageTargetSupport<TModule,TModel>`, `[[module-index]]` entry. *(Native half — `InspectionPipelineKind` + `PipelineBuilderMap` — is the C++ dev's; coordinate so both halves stay consistent.)*

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