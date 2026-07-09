---
type: anti-pattern
sources:
  - C:\Users\steep\.claude\skills\sa\SKILL.md
  - C:\Users\steep\.claude\skills\SKILL-TEMPLATE.md
updated: 2026-06-14
tags:
  - status/active
  - scope/workflow
---

# Audit Glob Self-Blindness

> **Summary.** When an audit tool enumerates its targets via a glob or
> pattern match, the pattern itself becomes a hidden contract. Files that
> don't match the pattern are invisible to the audit — they don't fail,
> they don't show up at all. The audit silently passes a corpus smaller
> than reality.

## AP-WF-8: Audit blind to off-pattern files

**Pattern:** `/sa` enumerates skill files via `**/SKILL.md`. A skill stored as `skill.md` (lowercase) matches the case-insensitive filesystem at the OS level but is invisible to a case-sensitive glob for `SKILL.md`. The audit reports "20 audited, 0 violations" while one file is silently skipped.

**Symptom:** A skill that drifts from convention in an audit-enumeration-relevant way is *never* flagged. The user trusts the clean audit report; the drift accumulates.

**Real instance:** `~/.claude/skills/fx/skill.md` (lowercase) was invisible to `/sa`'s primary glob. Discovery required a separate case-aware glob during an *unrelated* investigation (the Tavily routing rule needed to grep all skills for Tavily references). The audit was not the discovery mechanism — accidental cross-traffic was.

**Correct pattern (defensive):**

1. **Report enumeration boundary.** The audit should state what pattern it used and what didn't match. "Audited 20 SKILL.md files. Found 1 off-pattern file: `fx/skill.md` — review."
2. **Cross-check via a sibling enumeration.** Glob for `**/*.md` inside the target tree; diff against the canonical pattern; report the delta.
3. **Treat the pattern as a contract.** Non-matching files are a separate violation class, not silent skips.

**Recovery — case-only rename on NTFS:**

    mv skill.md SKILL.tmp.md && mv SKILL.tmp.md SKILL.md

Single-step `mv skill.md SKILL.md` is a no-op on case-insensitive NTFS — the OS sees no difference.

## The generalization

This is a meta-anti-pattern: whenever a tool's coverage is defined by a
pattern, *its blind spots are defined by the same pattern*. The blind
spots are usually invisible to the tool's own report. Cousins:

- **PICA** grepping `*-V1.vue` — V2-named or differently-named files are invisible
- **Runbook scans** keyed on standard headers — non-standard entries are missed
- **MCP allow-lists** — see [[research-tool-misrouting]] AP-WF-7
- **Wiki audits scoped to one folder** (`wiki/patterns/*filter*`) — a node of the same concept living in a *sibling* folder (`architecture/`) is invisible; the audit reports it as a "phantom" (does-not-exist) when it is merely off-scope. *(Real instance: `filter-architecture` was mis-flagged BUILD-not-re-source until a wider glob found it in `architecture/`. Folder-scope blindness — the sibling of the case-scope blindness above.)*

The defense is always the same: name the pattern, name what's outside it, periodically re-run with a wider net.

## Related

- [[research-tool-misrouting]] — AP-WF-7 is the same shape (MCP allow-list)
- [[multi-stage-migration-pitfalls]] — AP-WF-1 (Edit-cache blindness) is cousin: silent failures from invisible state
- [[skill-catalog]] — the conformance rules `/sa` enforces
