---
type: pattern
sources:
  - Steward-CLAUDE.md
  - testing-philosophy-v3.md
updated: 2026-05-27
tags:
  - status/active
  - scope/workflow
---

# Tracer-Bullet Discipline

> **Summary.** When a feature spans multiple system layers, build a single
> vertical end-to-end slice (API + UI + DB for ONE feature) before expanding
> horizontally (all APIs, then all UIs). This prevents accumulating untested
> code across context windows.

## Core principle

**Vertical slices beat horizontal layers** when:
- Architecture is untested or new patterns are being introduced
- Multiple similar features are planned (login, registration, password reset)
- Integration risk between layers is high
- Context-window constraints limit total file scope

*(source: `Steward-CLAUDE.md`, §"Tracer Bullet Discipline")*

## Activation decision

**USE tracer bullets when:**
- Feature spans 3+ system layers (API, UI, DB, middleware)
- Multiple similar features planned
- Architecture untested or new patterns being introduced
- Context window constraints (>5 files total)
- Integration risk between layers is high
- Deployment requires working functionality at each stage

**SKIP tracer bullets when:**
- Single-layer changes (UI-only styling, API endpoint addition)
- Small scope (<5 files, single component/service)
- Refactoring within established patterns
- Bug fixes with clear isolation
- Documentation or configuration updates

*(source: `Steward-CLAUDE.md`, §"Activation Decision Criteria")*

## Mandatory checkpoints

The decision is forced at three points in the lifecycle:

1. **At `/cp` (Create Plan):** Ask "Does this plan benefit from vertical slicing?" If yes, structure tasks as end-to-end features.
2. **At `/ax` (Authorize Execution):** Confirm "Is this a vertical slice requiring end-to-end validation?" If yes, plan immediate testing after implementation.
3. **At `/fx` (Fix Execution):** Evaluate fix scope. If it requires vertical-slice validation, test across all affected layers before marking complete.

*(source: `Steward-CLAUDE.md`, §"Mandatory Confirmation Checkpoints")*

## Task structure examples

### Good (vertical slice)
```
Task: Implement user authentication
- API: POST /api/auth/login endpoint with session creation
- UI: Login form component with error handling
- DB: User validation query via Prisma
- Validation: End-to-end test from form submit → session cookie
```

### Bad (horizontal layers)
```
Task 1: Build all auth API endpoints
Task 2: Build all auth UI components
Task 3: Wire auth system together
```

*(source: `Steward-CLAUDE.md`, §"Tracer Bullet Task Structure")*

## Post-execution validation protocol

When tracer-bullet mode is active:
1. After each `/ax`, validate the vertical slice works end-to-end
2. Don't proceed to the next `/px` until the current slice is proven
3. Document validation results in the plan file
4. Use `/ex` immediately if the slice fails integration

*(source: `Steward-CLAUDE.md`, §"Post-Execution Validation Protocol")*

## Integration with other patterns

- **`/mpx` → `/max`**: Natural tracer bullets — small scope enforces vertical thinking *(source: `Steward-CLAUDE.md`)*
- **`/pf` planning**: Explicitly note "Tracer Bullet: YES/NO" in plan metadata
- **`/pica` audits**: Check for horizontal-layer anti-patterns in completed work
- **Testing philosophy**: Cross-references the broader testing approach in `testing-philosophy-v3.md` *(source: `testing-philosophy-v3.md`)*
- **Environment-coupled defects**: process-spawn, PATH, and host-config bugs are invisible to file-gates (`node --check`, grep, the verifier confirmer) and surface ONLY running live on the target OS/venue — the tracer bullet is the only gate that catches them. See [[claude-code-plugin-bundled-mcp-gotchas]] (two Windows spawn bugs that passed every file-gate).

## Related

- [[operating-modes]]
- [[stratagem]]
- [[claude-code-plugin-bundled-mcp-gotchas]]
- [[gold-standard-docs]] *(forward-link)*
