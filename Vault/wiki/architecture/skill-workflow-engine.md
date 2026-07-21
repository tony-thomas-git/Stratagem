---
type: architecture
sources: [stratagem-core-rules.md, pf/SKILL.md, cp/SKILL.md, ps/SKILL.md, if/SKILL.md, README.md, stratagem-current-flow.md]
code_sources:
  - "plugins/stratagem-core/skills/pf/SKILL.md@drTim/hardening"
  - "plugins/stratagem-core/skills/cp/SKILL.md@drTim/hardening"
  - "plugins/stratagem-core/stratagem-core-rules.md@v0.1.0"
updated: 2026-07-10
tags:
  - status/active
  - scope/skills
---

# Skill Workflow Engine

> **Summary.** The `sg` plugin is a set of 21 **operating-mode skills** — each a `skills/<name>/SKILL.md` invoked as `/sg:<name>` — that turn a raw idea into a planned, executed, verified, and retrospected feature. Skills are shaped identically (YAML frontmatter → banner → numbered instructions) and compose into a small set of canonical chains driving **seed → plan → execute → verify → complete → retrospect**.

---

## 1. What a skill is (its shape)

Every workflow mode is a Markdown file `plugins/stratagem-core/skills/<name>/SKILL.md`. Each follows the same shape, visible in every skill read:

1. **YAML frontmatter** — `name:`, `description:`, and an `argument-hint:` (code: `plugins/stratagem-core/skills/pf/SKILL.md:1-5`).
2. **Title + Purpose** — a one-line statement of the mode's job (code: `plugins/stratagem-core/skills/cp/SKILL.md:7-9`).
3. **`**Task:** $ARGUMENTS`** — the invocation carries the user's argument string into the mode (code: `plugins/stratagem-core/skills/pf/SKILL.md:11`).
4. **An IMMEDIATELY-display banner** — a fixed ASCII banner announcing the mode is active, e.g. `⚡ PF (Plan Features) MODE ACTIVE` (code: `plugins/stratagem-core/skills/pf/SKILL.md:13-20`).
5. **Numbered Instructions** — the mode's procedure (research → analysis → planning → output), plus a terminal **Next:** handoff naming the successor skill (code: `plugins/stratagem-core/skills/pf/SKILL.md:22`, `:64`).

Skills reference shared rules via `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md` rather than re-authoring them (source: `README.md:22`).

## 2. How a skill is invoked

Each mode is namespaced by the plugin: `/sg:pf`, `/sg:cp`, `/sg:px`, `/sg:ax`, … (code: `plugins/stratagem-core/stratagem-core-rules.md:5`). The full 21-mode catalog:

| Command | Purpose |
|---|---|
| `/sg:ps` | Plan Seed — bridge a raw idea into a seed doc (input to `/sg:pf`) |
| `/sg:pf` | Plan Features — comprehensive feature planning |
| `/sg:cp` | Create Plan — break a plan into tasks |
| `/sg:px` | Plan Execute — analyze one specific task |
| `/sg:ax` | Authorize Execution — implement a planned task |
| `/sg:ex` / `/sg:fx` | Error Executing (docs-only) → Fix Execution |
| `/sg:cf` | Complete Feature — finalize + executive summary |
| `/sg:rs` / `/sg:crs` | Retrospective Summary / Conversation Retrospective |
| `/sg:mpx` / `/sg:max` | Memory Plan/Authorize Execute — quick <5-file scope |
| `/sg:phx` | Phase Execute — chain PX→AX across a phase/range/task |
| `/sg:pica` | Post-Implementation Compliance Audit |
| `/sg:rp` / `/sg:um` | Read Plan / UpdateMe status snapshot |
| `/sg:if` | Implement Feature — budget-guarded unattended loop |
| `/sg:sa` | Skill Audit — conformance to canonical layout |
| `/sg:handoff` | slice session context into a durable brief |
| `/sg:wiki-ingest` / `/sg:wiki-graph-audit` | vault page generator / contract verifier |

(code: `plugins/stratagem-core/stratagem-core-rules.md:240-262`)

## 3. The lifecycle the skills drive

The canonical order is **seed → plan → execute → verify → complete → retrospect** (source: `README.md:9`):

```
/sg:ps  seed  →  /sg:pf  plan features  →  /sg:cp  create plan
        →  /sg:phx  phase-execute (px→ax→verifier per task)
        →  /sg:cf  complete  →  /sg:rs  retrospective
```

(code: `README.md:15-18`)

- **Seed (`/sg:ps`).** Always opens with clarifying questions, does deep codebase exploration to ground the seed in measured fact, and authors a `{topic}_{YYMMDD}_seed.html` capturing Problem/why · Evidence · Shape · Open questions for `/pf` · Non-negotiables (code: `plugins/stratagem-core/skills/ps/SKILL.md:19-47`).
- **Plan features (`/sg:pf`).** Research → analysis → strategic planning, **no code**; emits `{feature}_{YYMMDD}_plan.html` (HTML chassis for layout, SVG only for free geometry) (code: `plugins/stratagem-core/skills/pf/SKILL.md:22-64`).
- **Create plan (`/sg:cp`).** The **format-normalization seam**: reads the pf `.html`, extracts its meaning into a self-contained `.md` execution plan, does the tracer-bullet checkpoint, and breaks the work into atomic tasks — each with a **mandatory `Verify:` line** (a single shell command whose exit 0 proves the task done) plus a plan-level `## Integration-Verify:` gate (code: `plugins/stratagem-core/skills/cp/SKILL.md:45`, `:92`, `:189`). See [[plan-lifecycle]].
- **Execute + verify.** `/sg:px` analyzes one task; `/sg:ax` implements it exactly per the px strategy; the verifier runs the task's `Verify:` (exit 0 = pass). `/sg:phx` chains px→ax across a phase for human-in-the-loop runs; `/sg:if` runs the same chain unattended under a budget (source: `stratagem-current-flow.md:116-125`). See [[autonomy-loop]].
- **Complete + retrospect.** `/sg:cf` completes remaining tasks and generates an executive summary; `/sg:rs` extracts learnings into the wiki / gold-standard docs (source: `stratagem-current-flow.md:136-154`).

## 4. Composition patterns

The modes compose into canonical chains (code: `plugins/stratagem-core/stratagem-core-rules.md:11-17`):

- **Sequential:** `/sg:pf → /sg:cp → /sg:px → /sg:ax → /sg:cf` (full feature lifecycle)
- **Phase Chained:** `/sg:pf → /sg:cp → /sg:phx → /sg:cf` (phase-level, human review between phases)
- **Error Recovery:** `/sg:ex → /sg:fx` (document error → implement fix)
- **Quick Iteration:** `/sg:mpx → /sg:max` (in-memory plan+execute for <5 files, skips the pf/cp/if machinery) (source: `stratagem-current-flow.md:29`)
- **Quality Assurance:** `/sg:pica` (audit, fed into `/sg:rs` at close-out)

Chaining is governed by [[literal-composition]]: a skill that chains others invokes them via the Skill tool — never paraphrasing or inlining their logic — so sub-skill audits (e.g. `/sg:ax`'s PICA) actually run (code: `plugins/stratagem-core/stratagem-core-rules.md:232`).

## 5. Cross-cutting rules the modes obey

- **CORPUS-READ-FIRST** — eight modes (`pf/cp/px/ax/ex/fx/mpx/max`) carry a verbatim, change-coupled block that consults the vault before web/context7 (code: `plugins/stratagem-core/skills/pf/SKILL.md:26-35`). See [[vault-knowledge-system]].
- **Trust-But-Verify** — mid-task gates auto-proceed on Low/Medium decisions and surface a "Decisions Made" block; High-complexity decisions STOP and escalate inline (code: `plugins/stratagem-core/stratagem-core-rules.md:76`).
- **Tracer-bullet discipline** — vertical end-to-end slices before horizontal expansion; decided at `/sg:cp` (code: `plugins/stratagem-core/stratagem-core-rules.md:23`).
- **Never commit** — all changes stay uncommitted for manual review (code: `plugins/stratagem-core/stratagem-core-rules.md:268`).

See [[operating-rules]] for the full rule set.

## Related

- **patterns** — [[skill-shape]] — the canonical `SKILL.md` layout `/sa` enforces · [[corpus-read-first]] — the vault-first block inside eight modes · [[two-path-model]] — `/phx` vs `/if` composition · [[verifier-contract]] — the `Verify:` gates `/cp` emits
- **architecture** — [[system-topology]] — where the engine sits · [[autonomy-loop]] — `/sg:if` running the modes as stages · [[vault-knowledge-system]] — CORPUS-READ-FIRST inside the modes
- **decisions** — [[plans-dir-lifecycle]] — where the plan artifacts these modes emit live
- [[scopes]] · [[index]]
