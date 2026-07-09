# 🪙 Steward Workflow Patterns

**Created:** 2026-03-13
**Status:** 🪙 GOLD STANDARD
**Applies To:** All skill authoring, hook design, and orchestration decisions

> Gold docs capture the *what* and *why* that survive forever — not the *when* and *how we got here* that ages out. The event is ephemeral; the principle is permanent.

---

## Skill Conformance — verify with `/sa`

- **[FM]** Frontmatter: `name`, `description`, `argument-hint`
- **[TI]** `# SHORTNAME (Full Name)` — short name all-caps
- **[PU]** `**Purpose:**` single line, immediately after title
- **[TA]** `**Task:** $ARGUMENTS` verbatim
- **[BN]** Banner: `━━━` bordered format with `⚡` emoji and `MODE ACTIVE` title
- **[IN]** `**Instructions:**` exact label, numbered list (not H2/H3)
- **[NX]** `**Next:**` is the last line of the file

**Banner standard:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚡ SHORTNAME (Full Name) MODE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: [show $ARGUMENTS or "awaiting input"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
`━━━` borders required in activation banners; also allowed in model output blocks (completions, phase results). Skills are self-contained execution units; they produce no side effects outside the task boundary.

**Instructions rules:** Label must be `**Instructions:**` exactly. Checklists go inside the step that uses them. Skills have no Post-Execution steps — orchestration side effects belong in the calling context, not the skill.

---

## Hook Design

Hooks enforce workflow discipline mechanically — removing reliance on agent memory or human oversight for critical rules. The same rule embedded in a skill prompt is advisory; the same rule enforced by a hook is mechanical.

Hooks receive full tool I/O as JSON on stdin. `jq` is not available in the hook shell environment — use `grep` exclusively. Status detection:
```bash
grep -qiE '"isError"\s*:\s*true'  # → error
grep -qE '"\[\]"|"null"'          # → empty (else ok)
```
Claude Code hook matchers are exact strings — regex is not supported. Each tool requires its own matcher entry.

`PostToolUse` hooks are warn-only — the tool has already executed and cannot be undone. `PreToolUse` hooks can block via exit code 2.

Hooks enforce at the tool-call layer; skill prompt language enforces at the instruction layer. Both are required — neither alone is sufficient.

---

## Gate Language

Skills that require human confirmation before proceeding must use imperative gates, not advisory language. Advisory language is ignored under pressure; a visible, mandatory output block creates a mechanical gate.

Three required elements:
1. **Hard imperative** — "DO NOT [action]" not "wait for" or "ensure"
2. **Required visible output** — model must emit a specific block (observable proof of gate)
3. **Violation label** — explicitly naming the skip as a workflow violation, not an omission

**Failing (advisory):** "Wait for explicit approval before implementing"

**Required (imperative):**
```
⛔ AWAITING [COMMAND] AUTHORIZATION
[description]. Type "[command]" to execute.
No files will be touched until [command] is received.
```

---

## Orchestration

| Pattern | Chain |
|---------|-------|
| Standard | `/pf → /cp → /px → /ax → /cf → /rs` |
| Phase-level | `/pf → /cp → /phx → /cf` |
| Quick (<5 files) | `/mpx → /max` |
| Error recovery | `/ex → /fx` |

**Tracer bullet — USE when:** 3+ layers, multiple similar features, untested architecture, >5 files.
**SKIP when:** single-layer, <5 files, refactor, bug fix, docs. Document: `Tracer Bullet: YES/NO`.

---

## Skill Config Resolution

When a skill can receive the same config value from multiple sources, establish a documented priority order inside the step that resolves it:
1. `$ARGUMENTS` keyword — user explicit, highest priority
2. Stored project config (e.g., `hearact.json` field) — project default
3. Hardcoded default — lowest priority

Display the resolved value in the step's output line. Reject inferring config from filename suffix — fragile to rename and leaves downstream skills with no reliable source of truth.

---

## Common Pitfalls

- Read file immediately before editing — parallel reads don't register write permission
- Exit plan mode before editing skill or hook files
- Checklists (YAGNI, Code Quality) belong inside their numbered step — not floating before `**Instructions:**`
- Hook matchers are exact strings — regex patterns silently fail to match
- SVG box height growth cascades every downstream coordinate — compute as full delta cascade, not incremental edits
