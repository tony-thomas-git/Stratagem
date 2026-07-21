---
type: pattern
sources: [sa/SKILL.md, pf/SKILL.md, cp/SKILL.md, if/SKILL.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/skills
---

# Canonical SKILL.md Shape

> **Summary.** Every Stratagem workflow-mode skill is a single `SKILL.md` that follows one fixed layout — YAML frontmatter, a `# SHORTNAME (Full Name)` title, a one-line `**Purpose:**`, a `**Task:** $ARGUMENTS` line, a `━━━`-bordered `⚡ … MODE ACTIVE` banner, numbered `**Instructions:**`, and a terminal `**Next:**` line. `/sa` (Skill Audit) is the verifier that enforces this shape across all skills.

---

## 1. The seven-point layout

The canonical shape is defined by the conformance checklist `/sa` runs against every `SKILL.md` (code: `plugins/stratagem-core/skills/sa/SKILL.md:L32-L38`). Each check has a two-letter code:

| Code | Requirement | Source |
|---|---|---|
| **[FM]** | Frontmatter block present with `name`, `description`, and `argument-hint` fields | (code: `skills/sa/SKILL.md:L32`) |
| **[TI]** | Title line matches `# SHORTNAME (Full Name)` (all-caps short name) | (code: `skills/sa/SKILL.md:L33`) |
| **[PU]** | `**Purpose:**` present as a single line immediately after the title block | (code: `skills/sa/SKILL.md:L34`) |
| **[TA]** | `**Task:** $ARGUMENTS` line present | (code: `skills/sa/SKILL.md:L35`) |
| **[BN]** | Activation banner uses `━━━` bordered format with `⚡` emoji and `MODE ACTIVE` title | (code: `skills/sa/SKILL.md:L36`) |
| **[IN]** | `**Instructions:**` uses a numbered list — not H2/H3 headers (exception: `phx` is exempt) | (code: `skills/sa/SKILL.md:L37`) |
| **[NX]** | `**Next:**` line is the last line of the file | (code: `skills/sa/SKILL.md:L38`) |

## 2. Anatomy of a conforming skill

`/pf` is a clean example of the full shape end-to-end:

- **Frontmatter** carries `name: pf`, `description:`, and `argument-hint:` (code: `skills/pf/SKILL.md:L1-L5`).
- **Title** is `# PF (Plan Features)` — all-caps short name, parenthesized full name (code: `skills/pf/SKILL.md:L7`).
- **Purpose** is a single line directly under the title (code: `skills/pf/SKILL.md:L9`).
- **Task** relays the argument: `**Task:** $ARGUMENTS` (code: `skills/pf/SKILL.md:L11`).
- **Banner** — the `━━━`-bordered `⚡ PF (Plan Features) MODE ACTIVE` block, shown on activation, echoing `$ARGUMENTS` or `"awaiting input"` (code: `skills/pf/SKILL.md:L13-L20`).
- **Instructions** — a numbered list (`1. Research Phase … 4. Output`) (code: `skills/pf/SKILL.md:L22-L62`).
- **Next** — the terminal handoff line pointing at the successor skill, `/cp` (code: `skills/pf/SKILL.md:L64`).

`/cp` and `/if` follow the same seven-point shape (code: `skills/cp/SKILL.md:L1-L20`; code: `skills/if/SKILL.md:L1-L24`).

## 3. The banner (`[BN]`)

The activation banner is a load-bearing, not decorative, element — every skill displays it on activation so the operator can see which mode is live. It is three `━━━` rule lines wrapping a `⚡ <NAME> MODE ACTIVE` title and an echoed `Task:` line (code: `skills/pf/SKILL.md:L14-L20`). `/if`'s banner is richer — it also surfaces the resolved `Plan / Scope / Budget / Branch / Ledger` for the run (code: `skills/if/SKILL.md:L14-L24`), but keeps the same `━━━`/`⚡`/`MODE ACTIVE` chassis the `[BN]` check requires.

## 4. The `**Next:**` handoff (`[NX]`)

The last line of every skill is a `**Next:**` pointer to the next mode in the chain — this is what wires the skills into the canonical composition chains. `/pf` ends `**Next:** /cp …` (code: `skills/pf/SKILL.md:L64`); `/cp` ends pointing at `/sp` / `/phx` / `/if` / `/px` (code: `skills/cp/SKILL.md:L383`); `/if` ends pointing at `/cf` or a resumed `/if` (code: `skills/if/SKILL.md:L78`). The `[NX]` check requires it be the **final** line.

## 5. The `phx` exemption

The `[IN]` check normally forbids H2/H3 headers inside instructions — instructions must be a numbered list. The **single documented exception is `phx`**, which is exempt (code: `skills/sa/SKILL.md:L37`). `/phx`'s length and internal structure (it defines the reusable per-task verifier contract in a Step C) justify header-structured instructions the other skills may not use.

## 6. How the shape is enforced — `/sa`

`/sa` globs all `SKILL.md` files (excluding `SKILL-TEMPLATE.md`), reads each, and checks every one of the seven items, emitting a conformance table with one column per check code plus an `Issues` count, followed by a per-skill violations list citing the offending line (code: `skills/sa/SKILL.md:L27-L63`). It can audit one named skill or all skills (code: `skills/sa/SKILL.md:L26-L27`). If the canonical `SKILL-TEMPLATE.md` is absent, `/sa` falls back to the embedded checklist so the audit is self-contained (code: `skills/sa/SKILL.md:L25`). `/sa` is itself a member of the [[wiki-graph-audit]]-style verifier family — a skill whose whole job is contract conformance.

## Related

- [[corpus-read-first]] — the shared research block embedded in the `**Instructions:**` of eight skills
- [[verifier-contract]] — the per-task `Verify:` / `## Integration-Verify:` contract these skills emit and consume
- [[two-path-model]] — how `/phx` and `/if` (both conforming skills) drive the same per-task contract
- [[skill-workflow-engine]] — the architecture page: the full roster of `/sg:*` modes and their lifecycle
- [[hardcoded-home-paths]] — the anti-pattern that made `/sa` (the enforcer) audit zero skills
