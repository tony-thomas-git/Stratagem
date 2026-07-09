# Stratagem Configuration

**Role:** Stratagem *is* the AI coding workflow meta-system — its operating modes, skills, configuration hierarchy, tracer-bullet discipline, and loop-engineering machinery. This file is the canonical design surface for the framework itself: the Meta-Architecture Framework, project intelligence, the Wiki Vault Resolution convention, and the self-improvement loops that evolve it.

Steward — the orchestrator that incubated Stratagem — now points here. Its `C:\code\Steward\CLAUDE.md` is a lean orchestrator stub; the meta-system design lives in this file.

You are the system designer—not just managing workflow execution, but architecting the configuration layer itself. When designing setups, consider cross-project patterns, reusable skills, and optimal delegation strategies.

---

## Meta-Architecture Framework

### Configuration Design Principles

**Hierarchy Decision Tree:**
1. **Global Skills** (`~/.claude/skills/`) - Cross-project workflows, standardized operations (environment-agnostic)
2. **Desktop-Only Skills** (`~/.claude/skills-desktop/`) - MCP-dependent skills (Claude Desktop exclusive)
3. **Global CLAUDE.md** (`c:\code\CLAUDE.md`) - Universal rules, communication style, critical protocols
4. **Project CLAUDE.md** - Project-specific patterns, tech stack conventions, domain rules
5. **Stratagem CLAUDE.md** - Meta-system design, orchestration patterns, toolchain architecture

**Skill Creation Criteria:**
- **Create New Skill When:**
  - Workflow is used across multiple projects
  - Operation has complex multi-step requirements
  - Pattern needs version control and evolution
  - Sub-agents need consistent, repeatable instructions

- **Extend Existing Skill When:**
  - New capability is natural extension of existing workflow
  - Changes affect single phase of established pattern
  - Addition maintains semantic coherence

**Composition Patterns:**
> **Visual Reference:** See `C:\code\Stratagem\docs\stratagem-testing-workflow.svg` for the full workflow diagram including testing gates and error recovery paths.

- **Sequential**: `/pf` → `/cp` → `/px` → `/ax` → `/cf` (full feature lifecycle)
- **Phase Chained**: `/pf` → `/cp` → `/phx` → `/cf` (phase-level execution, human review between phases)
- **Error Recovery**: `/ex` → `/fx` (error documentation → fix implementation)
- **Quick Iteration**: `/mpx` → `/max` (memory-based planning for <5 files)
- **Quality Assurance**: `/pica` (audit — findings fed into `/rs` at close-out)

### Tracer Bullet Discipline

**Core Principle:** Vertical end-to-end slices (API → UI → DB for ONE feature) before horizontal expansion (all APIs, then all UIs). Prevents accumulating untested code across context windows.

**Activation Decision Criteria:**

**USE Tracer Bullets When:**
- Feature spans 3+ system layers (API, UI, DB, middleware, etc.)
- Multiple similar features planned (login, registration, password reset)
- Architecture untested or new patterns being introduced
- Context window constraints (>5 files total)
- Integration risk between layers is high
- Deployment requires working functionality at each stage

**SKIP Tracer Bullets When:**
- Single-layer changes (UI-only styling, API endpoint addition)
- Small scope (<5 files, single component/service)
- Refactoring within established patterns
- Bug fixes with clear isolation
- Documentation or configuration updates

**Mandatory Confirmation Checkpoints:**

**At `/cp` (Create Plan):**
- Evaluate task decomposition approach
- Ask: "Does this plan benefit from vertical slicing?"
- If YES: Structure tasks as end-to-end features
  - ✅ "Task 1: Login feature end-to-end (API + UI + DB)"
  - ✅ "Task 2: Registration feature end-to-end"
- If NO: Proceed with natural task decomposition
  - ✅ "Task 1: Add validation to existing form"

**At `/ax` (Authorize Execution):**
- Before implementing, confirm: "Is this a vertical slice requiring end-to-end validation?"
- If YES: Plan immediate testing after implementation
- If NO: Execute as standalone task

**At `/fx` (Fix Execution):**
- Evaluate error scope: "Does fix require vertical slice validation?"
- If YES: Test across all affected layers before marking complete
- If NO: Fix and validate isolated component

**Tracer Bullet Task Structure:**

**Good (Vertical Slice):**
```
Task: Implement user authentication
- API: POST /api/auth/login endpoint with session creation
- UI: Login form component with error handling
- DB: User validation query via Prisma
- Validation: End-to-end test from form submit → session cookie
```

**Bad (Horizontal Layers):**
```
Task 1: Build all auth API endpoints
Task 2: Build all auth UI components
Task 3: Wire auth system together
```

**Post-Execution Validation Protocol:**
When tracer bullet active:
1. After each `/ax`, validate the vertical slice works end-to-end
2. Don't proceed to next `/px` until current slice proven
3. Document validation results in plan file
4. Use `/ex` immediately if slice fails integration

**Integration with Existing Patterns:**
- **`/mpx` → `/max`**: Natural tracer bullets (small scope enforces vertical thinking)
- **`/pf` planning**: Explicitly note "Tracer Bullet: YES/NO" in plan metadata
- **`/pica` audits**: Check for horizontal layer anti-patterns in completed work

### Trust-But-Verify Pattern

*Trust-But-Verify (trust the agent's defaults; verify at end-of-round).*

Mnemonic: **Trust = forward; Verify = end-of-round surface.**

**Core Principle:** Replace mid-task plan-and-confirm gates with a decide-defaults-forward + confirm-after loop. The agent reasons hard about the choices the gate would have asked, picks defaults, executes, then surfaces a "Decisions Made" log at the end for surgical adjustment via `adjust N`. **Trust applies only to Low- and Medium-complexity decisions. High-complexity decisions break the trust half and must be escalated inline before execution.**

**USE Trust-But-Verify When:**
- Gate is mid-task (inside an already-approved workflow), not top-of-workflow
- Work is auto-chainable (running inside `/phx`, multi-round ingest, or any sequential loop)
- Decisions are surgically reversible (page-level edits, naming, categorization, scope inclusion)
- Choices are tactical, not strategic (which concepts to extract, which page to update vs. create, link density)

**SKIP Trust-But-Verify When:**
- Top-of-workflow approval (`/pf` plan, `/cp` task breakdown, `/ax` pre-implementation confirm) — those gates stay
- Decision is destructive or hard to reverse (deleting pages, schema changes, force-pushes)
- Decision touches files outside the work item's natural blast radius
- High-stakes contradictions — escalate inline anyway (see Guardrails)

**The Loop:**

1. **Deep-think the gate questions.** Enumerate every choice the up-front gate would have surfaced. Pick a default for each based on the workflow's schema and observed conventions. Do not ask.
2. **Tag each decision with a Complexity Rank (L/M/H)** at point-of-decision. See the Complexity Ranking guardrail below for the rubric. H decisions STOP and escalate inline — they never reach step 3.
3. **Log decisions as you make them.** Maintain a running list: `decision → [tag] default chosen → one-line rationale → affected outputs (file paths / page names)`. Log at point-of-decision, not retroactively.
4. **Execute the work** using L- and M-tagged defaults.
5. **Surface a Decisions Made block at completion** (format below). Each row is independently flaggable.
6. **Handle adjustments surgically.** When the user says `adjust N`, edit only the outputs that decision shaped — do not redo the round.

**Decisions Made surface format:**

```
## Decisions Made (R3 — Source: foo.md)

| # | Decision | Default chosen | Why | Affected outputs |
|---|----------|----------------|-----|------------------|
| 1 | Concept granularity | [L] Split "auth lifecycle" into 2 pages | Each >150 lines if combined | [[auth-lifecycle-server]], [[auth-lifecycle-client]] |
| 2 | Existing vs new | [L] Updated [[entity-registry]] rather than new page | 80% topical overlap | [[entity-registry]] |
| 3 | Inferred claim handling | [M] Marked 3 claims *(inferred)* in [[zod-pipeline]] | Source implied but did not state | [[zod-pipeline]] §2 |
| 4? | Scope cut | [L] Skipped one tangent on legacy V1 patterns | Out of v2 scope per §1 | (none) |

Reply with `adjust N` (e.g., `adjust 2`) to revise. Silence or `ok` = accepted.
```

Complexity tag prefixes the "Default chosen" cell: `[L]`, `[M]`, or `[H-ESCALATED]` (for H decisions you resolved inline mid-round). A `?` appended to the row number signals low agent confidence — the user should give that row extra scrutiny.

**Adjust Protocol:**

When the user says `adjust N` or `adjust the X decision`:
1. Identify the affected outputs from the Decisions Made row.
2. Reverse the specific default (e.g., re-split a merged page, re-categorize an entry).
3. Edit *only* the listed affected outputs. Do not re-read the source or replan the round.
4. Append an entry to the round's log (`logs/CHANGELOG.md` for wikis) noting the adjustment.
5. Re-surface a one-line updated Decisions Made row.

**Guardrails:**

**Complexity Ranking (hard guardrail — overrides the auto-chain):**

Every decision the agent considers Trusting-Forward MUST be tagged with a complexity rank based on *the output it produces*, not the decision itself:

- **Low (L)** — Trivial. One file, no new abstraction, no new dependency, easily reverted in a single edit. (e.g., "split this concept into two pages," "name this entity X.")
- **Medium (M)** — Modest. Touches 2–5 outputs, no new abstraction layer, established pattern reused. (e.g., "update three related wiki pages to cross-link," "add a field to an existing entity.")
- **High (H)** — Complex. Any of: introduces a new abstraction or layer of indirection; cross-cutting change touching >5 outputs; new dependency or schema change; introduces logic that can't be reverted in a single commit; departs from an established pattern.

Behavior by rank:

| Rank | Action |
|------|--------|
| L | Auto-proceed. Log to Decisions Made. |
| M | Auto-proceed. Log to Decisions Made with `[M]` tag so the user gives it extra scrutiny at verify time. |
| H | **STOP. Escalate inline before executing.** Present the decision, the chosen default, the complexity drivers, and at least one simpler alternative. Wait for user approval. Do not proceed on default. |

**Axiom (codevelopment):** *Simple, surgical, good code.* AI-generated code fails in proportion to the complexity of its output. Every layer of indirection, every new abstraction, every cross-cutting change multiplies the failure surface. The Complexity Ranking exists because Trust-But-Verify's auto-chain optimizes for throughput, and throughput at the cost of simplicity is a bad trade. When in doubt about a rank, round UP — false-positive H escalations cost one user message; false-negative auto-proceeds cost a refactor.

**Spike to retire capability-uncertainty.** When an H rank comes from an *unverified capability* (can the harness/tool/library actually do X?) rather than a design preference, prefer a cheap throwaway spike to confirm it before committing the full build — it converts H-by-uncertainty into an evidence-backed L/M. (Phase 2: a ~10-line Workflow spike confirmed a subagent can fire the Skill tool before a ~200-line autonomy-loop script was written.)

**Operating rule:** Before tagging any decision L or M, the agent must ask itself: *"Is there a simpler way to do this?"* If the answer is "yes, but it's more work," choose the simpler way. The complexity tag is not a license to ship the easiest-to-generate output; it's a measurement of what you're about to commit.

**Other guardrails:**

- **High-stakes escalation (non-complexity).** If a decision would (a) delete or rename existing outputs, (b) introduce a contradiction with prior wiki claims, or (c) cross a scope-boundary defined in the workflow schema — escalate inline. Do not Trust-Forward through these even if they look L or M on the complexity axis.
- **Decision-log discipline.** Log at point-of-decision. A retroactive log after a long auto-chain is unreliable and defeats the surgical-adjust mechanism.
- **Soft cap per round.** If the Decisions Made list grows past ~15 items in a single round, the round is doing too much — split it. More than 15 decisions usually means strategy is leaking into tactics.
- **Contradiction handling unchanged.** Existing contradiction-flagging rules (e.g., wiki §3 step 6) still fire inline; contradictions are not deferred.
- **Confidence threshold.** If the agent's confidence in a default is low (~50/50), flag it inline as `?` appended to the row number rather than presenting as a confident default. The user can choose to pre-empt.

**Integration with existing patterns:**

- **`/phx` (Phase Execute):** Trust-But-Verify is what unblocks `/phx` for multi-round work. Each round runs end-to-end without mid-task gates (except H escalations), then `/phx` proceeds.
- **`/mpx` → `/max` (Memory loops):** Trust-But-Verify applies naturally; surface decisions in the wrap-up.
- **`/pica` audits:** Check that completed work surfaced Decisions Made when Trust-But-Verify was active, and that no H-complexity decisions were silently auto-proceeded.
- **Vault schemas (ISCI-Vision-Vault; future siblings):** §3 step 3 is replaced by a reference to this pattern; §8 hosts the end-of-round Decisions Made surface.
- **Hearact skills (`ha-split`, etc.):** Mid-task confirm-parameters gates follow this pattern; defaults are applied with logged Decisions Made and `adjust X` re-run hooks.

### Fleet-Aware Vault Editing

**Core Principle:** Stratagem orchestrates a *fleet* of sibling wiki vaults (today: ISCI-Vision-Vault — single-project machine; future: additional siblings as their `Vault\` folders appear). Many vault-level conventions — the §4.5 shape contract, the schema CLAUDE.md, the `.obsidian/graph.json` and `.obsidian/app.json` renderer configs — are duplicated across vaults by design (prose, not code-factorable). Single-vault edits silently drift the fleet unless propagation is explicit.

**The rule:** Before any `Write` or `Edit` to a file under a vault root (a `Vault\` folder at a project's git root, per the convention below), surface a one-line fleet-check **inline, before the edit**:

> *This edit touches `<vault>`. Active sibling vaults: the `Vault\` folders at other active projects' git roots. Apply there too? (just this one / apply to siblings / show diff first)*

Wait for the answer. Do not auto-proceed. This gate is mandatory — it is **not** a Trust-But-Verify L/M decision (single-commit reversible within the active vault, but propagation across vaults is a cross-cutting H concern).

**Scope — when the gate fires:**
- ✅ `vault/CLAUDE.md` (any project's `Vault\` at its git root)
- ✅ `vault/.obsidian/graph.json` — **only** edits to shape-relevant keys: color groups, tag-query rules, `showTags`, `showOrphans`, `showAttachments`, `hideUnresolved`, `collapse-color-groups`. Cosmetic keys (zoom, pan, `close`, `collapse-display`, `collapse-filter`, user-modified `scale`) do **not** fire the gate.
- ✅ `vault/.obsidian/app.json` — **only** edits to shape-relevant keys: `userIgnoreFilters`, `attachmentFolderPath`, `newFileLocation`, `newLinkFormat`, `useMarkdownLinks`. Cosmetic keys (theme, font, sidebar width, hotkeys) do **not** fire the gate.
- ✅ Skill files that encode the shape contract: `wiki-ingest/SKILL.md`, `wiki-graph-audit/SKILL.md`
- ✅ Pattern pages that document vault-level conventions (e.g., `patterns/wiki-graph-shape-contract.md`)
- ✅ Any other Write/Edit under a vault root — surface the gate with default *"just this one — page content is vault-local"* and let the user confirm

**Scope — when the gate does NOT fire:**
- User-driven UI changes to `.obsidian/*.json` (zoom, pan, panel state) — those don't go through Claude tools, so the gate physically can't fire. Drift from this source is unavoidable; flag it during `/wiki-graph-audit` runs instead.
- Cosmetic key edits to `.obsidian/graph.json` and `.obsidian/app.json` that the agent makes deliberately (e.g., adjusting a single user's theme via Claude) — the rule is keyed to *shape* concerns, not presence-in-file.
- Projects with no `Vault\` folder yet (placeholders like SAAS-Wiki) — the fleet is the set of *existing* `Vault\` folders only.
- Edits inside `vault/raw/` (source documents, not vault structure) and `vault/logs/` (per-vault append-only logs).

**Rationale for key-level scoping:** A blanket file-level trigger over-fires on theme/zoom/cosmetic edits, training the user to dismiss the gate. Naming the shape-relevant keys preserves the "no silent fleet drift" guarantee while keeping the gate signal-rich. When in doubt about whether a key is shape or cosmetic, ask: *if this key differs between sibling vaults, does it produce a visibly different graph topology or routing decision?* If yes → shape (gate fires). If no → cosmetic (gate skips).

**Source of truth:** convention — the fleet is the set of `Vault\` folders at active projects' git roots (see `## Wiki Vault Resolution` below). To add a vault to the fleet, create its `Vault\` folder; the gate discovers it by convention, no registration needed.

**Why this is a CLAUDE.md rule, not a hook:** Portability. Hooks in `settings.json` are tied to this Claude Code install; a CLAUDE.md rule travels with the repo and works wherever Stratagem is deployed. The cost: agent-discipline-driven rather than harness-enforced. The Trust-But-Verify pattern proves this discipline is reliable in practice.

**Integration with existing patterns:**
- **Trust-But-Verify:** This rule supersedes Trust-But-Verify for vault-shape edits. A shape-contract edit is H by definition (cross-cutting across the fleet). Do not auto-proceed even if the in-vault change looks L.
- **Prose-DRY change-coupling notes** (per [[wiki-graph-shape-contract]]): The change-coupling notes inside `/wiki-ingest` and `/wiki-graph-audit` enforce sync *within* a vault's contract enforcement (canonical source ↔ generator ↔ verifier). The Fleet-Aware rule enforces sync *across* vaults. Both fire together when editing a shape-contract file.
- **`/wiki-graph-audit`:** Catches drift the gate missed (user UI edits, edits made outside Claude). Run periodically per vault.

### Autonomy Budget & the Two-Path Loop

**Core Principle:** Autonomous loops compound token cost super-linearly. Before any loop runs unattended it needs a **token ceiling that can say "no" independent of the goal** — "the single most important guard before Phase 3" (loop-engineering-stratagem-impl.md). The budget is a first-class stop condition, not advisory.

**The two execution paths:**
- **Interactive `/phx` (skill)** — human-driven, per-phase. **No hard budget** — the human watches cost. This is P1's path, unchanged.
- **Unattended autonomy loop (Workflow)** — a Workflow run that drives `px → ax → verifier → advance` per task with a **harness-enforced token budget** (the `budget.*` API). This is P2's path, launched via `/if`.

**Budget defaults (Stratagem-level; override per plan via `## Budget: <tokens>`):**
- **Default ceiling:** `750000` tokens for an unattended single-feature loop.
- **Reserve floor:** halt with `75000` tokens of headroom remaining, so the escalation summary itself never overruns.
- **Warn threshold:** surface a heads-up in the Trust-But-Verify *Decisions Made* block at **80%** spent.
- **No silent caps** (guardrail 5): every warn and the breach-halt are logged + surfaced, never swallowed.

**Recovery defaults (Phase 3 — bounded `/ex→/fx` auto-recovery):**
- **Default attempts:** `N = 3` bounded `/ex→/fx` attempts after a verifier fail; converge (advance) or escalate. A small hard ceiling — no infinite loop ("an agent agreeing with itself at high speed").
- **Override:** `opts.maxRecovery`, sourced from an optional `## Recovery-Attempts: <N>` plan header (mirrors `## Budget:`); the Stratagem default of `3` applies when absent.
- **Two halt semantics (do not conflate):** a `budget` halt is **resumable** (raise `## Budget:`, resume via `resumeFromRunId`); a `recovery-exhausted` halt is **terminal** (needs human judgment — the attempt ledger is surfaced).
- **Precedence:** the budget check runs **first** each recovery attempt, so a reserve-floor breach mid-recovery halts as `budget` (resumable), never reclassified as exhaustion.
- **Anti-self-agreement:** each attempt's `/ex` is fed all prior attempts' failure reasons so fixes diverge; every re-verify is a fresh instance (builder≠checker, P1 C.3).
- **No silent caps** (guardrail 5): every attempt and the terminal halt are logged + surfaced.

**Completion contract (Phase 4 — plan-level final gate; `/if` path only):**
- **Final integration gate.** After *every* per-task verifier passes, ONE budget-checked gate runs the plan's `## Integration-Verify:` command in a fresh instance (builder≠checker, the P1 C.3 contract at plan scope) — the **local stand-in for "ADO pipeline green"** (the tool-backed completion signal of `loop-engineering-ado-integration.md` §3, applied without ADO). Exit 0 → feature complete.
- **Third halt semantic — `integration`.** Terminal, plan-level, **no auto-recovery** (distinct from `budget` = resumable and `recovery-exhausted` = terminal-per-task): a cross-task integration failure needs human diagnosis — it may be a decomposition fault, not a code fault. Default build timeout **1800s** (a full-solution build is minutes; the per-task 300s is far too short).
- **Absent header → skip-loud.** No `## Integration-Verify:` → skip the gate with a surfaced `log()` warning; **never fabricate a build command** (no-silent-caps).
- **Feature-branch pre-flight.** `/if` resolves `## Branch:` (else convention `tony/<plan-slug>`) and **HALTs on a protected branch** (`staging`/`main`) absent an explicit feature branch, so the loop's uncommitted diff lands on a review branch, never on trunk. The loop itself never touches git and never commits (never-commit rule holds).
- **`/if`-only.** G1 (branch pre-flight) + G2 (integration gate) live on the unattended Workflow path; interactive `/phx` stays human-verified at feature close — the same path-scope boundary as P3's D5.

**Observability & Durability (Phase 5 — `/if` path only):**
- **Per-run ledger.** Every unattended loop writes an **append-only markdown ledger** at `<plan-dir>/logs/<plan-slug>.ledger.md` (run-state lives next to the plan it executes, git-reviewable — NOT in the knowledge vault). It mirrors the wiki `CHANGELOG.md` pattern and resolves impl open-Q #5. One row per **verifier boundary** (each per-task verdict incl. recovery sub-attempts), plus every halt and the integration verdict — `| ts | task | stage | verdict | exit | spent | note |`. No-silent-caps: halts are always rowed.
- **The script never writes the ledger.** The Workflow script has no fs/shell/clock; writes are **delegated to the Bash-having layers** — the `/if` launcher creates the run header, the verifier agent appends each row (stamping time via `date`), and the script only `log()`s the live STATUS line (it alone knows `budget.spent()`). Same delegation as P4's launcher-parses-headers (D5), extended to writes.
- **Live status surface.** The script `log()`s a `/goal`-style line at each between-task boundary, each recovery attempt, and the integration gate: `STATUS · task k/N · spent X/CEILING (Z%) · last:<verdict> · recovered:<n>`. Elapsed time lives in the ledger (agent-stamped), not the status line (no wall-clock in the script).
- **Two resume paths (they compose).** `resumeFromRunId` is the in-session, budget-halt replay (harness journal cache). The **ledger-skip** is the cross-restart path: on a fresh `/if` launch, the launcher reads the ledger and trims tasks that already carry a `verify | pass` row, resuming at the last *verified* boundary. Skip only on a verified boundary, never on build-only work.
- **Skip-loud, never fail.** If the launcher cannot create `logs/`, it warns and launches with `ledgerPath = null`; the loop runs ledger-less (observability degrades, the loop never fails on telemetry) — mirroring the integration skip-loud.
- **Honest scope.** This moves the durability/observability gap 🔴→🟡, **not to green**: a markdown ledger + task-granular checkpoint/resume, not a telemetry platform or a durable mid-execution state machine. Full durable execution is out of scope for a markdown-governed layer.

**Literal invocation is *structural* in the Workflow path.** Each phase is a discrete `agent()` stage that literally runs its skill (`/px`, `/ax` with PICA, verifier, `/ex`→`/fx`); the deterministic script *cannot* fold them into one improv'd thread. This is the structural realization of **Literal Composition** (Quality Standards #6) — the rule becomes a harness guarantee, not agent discipline.

**Single-source verifier contract.** The per-task gate (C.1–C.4) is defined once in `/phx` Step C. Both callers — the interactive skill and the Workflow stage — *reference* it; neither re-authors. Change-coupling: edits to the gate contract update both call sites.

**Workflow-script gotchas (learned from the P2 smoke-test, 2026-06-25 — apply to every future Workflow, incl. ADO SP/DX):**
- **`meta` must be a pure literal.** No `+` concatenation or computed values anywhere in `meta` — the validator rejects `BinaryExpression`. Keep `description` a single string literal.
- **`args` may arrive as a JSON-encoded STRING** (background runs), not a parsed object. Normalize at the top: `let opts = args; if (typeof opts === 'string') opts = JSON.parse(opts)` — then read from `opts`.
- **`budget.spent()` is the SHARED cumulative turn spend**, not the loop's. Baseline it (`const startSpent = budget.spent()`) and guard on `budget.spent() - startSpent` so a budget means "tokens THIS run may spend," independent of launch time.
- **No clock in the script.** `Date.now()` / `new Date()` / `Math.random()` **throw** inside a Workflow script (they would break resume). Never timestamp from the script — all timestamps come from agents (`date` via Bash) or the launcher. (Learned authoring the Phase 5 ledger.)

### Environment-Aware Skills

**Directory Separation:**
- **`~/.claude/skills/`** - Environment-agnostic skills (work in both Claude Code CLI and Claude Desktop)
- **`~/.claude/skills-desktop/`** - MCP-dependent skills requiring Claude Desktop (e.g., Gmail, browser automation)

**Skill Metadata Format:**
Skills should declare their runtime requirements in their definition:
```yaml
# In skill prompt or metadata
environment: claude-desktop
requires: [gmail-mcp, ticktick-mcp]
```

**Runtime Behavior:**
- Claude Code CLI: Skip or warn when encountering desktop-only skills
- Claude Desktop: Access all skill directories
- Graceful degradation: Skills can offer reduced functionality in limited environments

### Quality Standards

**Effective Skills Exhibit:**
1. **Single Responsibility**: One clear purpose, well-defined scope
2. **Clear Entry/Exit**: Explicit trigger conditions and completion criteria
3. **Composability**: Clean interfaces for chaining with other skills
4. **Observability**: Progress tracking, clear state transitions
5. **Error Handling**: Graceful failure modes, recovery paths
6. **Literal Composition**: A skill that chains other skills invokes them via the Skill tool — never paraphrasing or inlining their logic. Sub-skill checklists and audits (e.g. `/ax`'s PICA) only run if the sub-skill actually runs; improvising them in-thread silently skips them. *(Retro: `/phx` Phase 1.)*

**Effective CLAUDE.md Files:**
1. **Specificity Over Generality**: Concrete patterns > abstract principles
2. **Action-Oriented**: Imperative guidance > descriptive documentation
3. **Hierarchical**: Critical rules first, details nested appropriately
4. **Maintainable**: Easy to update as patterns evolve

### MCP Orchestration Strategy

**MCP Usage Patterns:**
- **desktop-commander**: Always confirmation mode; use for setup research and validation
- **Browser automation**: For live testing feedback during development cycles
- **File system operations**: Prefer native tools (Read, Write, Edit) over MCP when available

**Integration Guidelines:**
- Preview mode by default—explicit permission required for execution
- Document MCP usage in plan files for transparency
- Use MCPs to bridge gaps between local and external state

---

## Project Intelligence

### Active Projects

**ISCI-Vision**
- **Working directory**: `C:\code\ISCI-Vision\`
- **Plans directory**: `C:\code\ISCI-Vision\Plans` *(moved 2026-07-08 from `C:\code\docs\ISCI-Vision-Docs\plans`)*
- **CLAUDE.md**: `C:\code\ISCI-Vision\CLAUDE.md` *(authored 2026-06-23; repurposed from the OG template for the native-C++ / C++-CLI / WPF stack — includes a Vision-specific `/pica` compliance-audit override)*
- **Wiki vault**: `C:\code\ISCI-Vision\Vault` (convention-resolved `<project-root>\Vault`; `scope/vision`)
- **Tech Stack**: Windows machine-vision appliance — native C++ vision SDK (OpenCV 4.10, Intel TBB `parallel_pipeline`) ↔ C++/CLI interop (`IVia.Vision`) ↔ .NET Framework 4.8 / C# 7.3 WPF kiosk app. Castle Windsor 5.x DI; ONNX Runtime + TensorRT→CUDA→CPU GPU inference; two-table SQLite storage; WiX v4 installer. ~26-project `isci-vision.sln`, VS 2026 (toolset v180). *(confirmed from vault — `isci-vision-solution`, ADR-002/003/004/010/011)*
- **Domain**: inspects produce (potato color/uniformity/defects), scores against USDA classes, exports results
- **Current Phase**: [To be documented on next interaction]

**Stratagem / Steward** (the meta-system — the workflow system itself + the orchestrator that incubated it)
- **Working directory**: `C:\code\Stratagem` (the framework repo; this `CLAUDE.md` is its config). Orchestrator repo: `C:\code\Steward` (now a lean stub that points here).
- **Docs tree**: `C:\code\Stratagem\` — plans under `C:\code\Stratagem\Plans\`, architecture/reference under `C:\code\Stratagem\docs\`.
- **Current feature**: `C:\code\Stratagem\Plans\Loop Engineering\` — the loop-engineering program (P1/P2 plans, seeds, retros, completed reports, design docs).
- **Wiki vault**: `C:\code\Stratagem\Vault` (convention-resolved `<project-root>\Vault`; the same vault serves both the `Steward` orchestrator and `Stratagem` framework repos; `scope/workflow`)
- **Domain**: the Stratagem AI coding workflow system — operating modes, skills, config hierarchy, tracer-bullet discipline, loop engineering. *About how we work, not what we work on.*
- **Current Phase**: Loop engineering — P1 verifier gate ✅ · P2 budget-guarded autonomy loop ✅ (`/if` + `autonomy-loop.js`) · P3 (bounded `/ex→/fx` auto-recovery) next; P4/P5 + ADO track (SP/DX/PR/BM) pending.

### Knowledge Vaults

**ISCI-Vision-Vault** (ISCI-Vision domain + workflow knowledge base)
- **Vault root**: `C:\code\ISCI-Vision\Vault`
- **Schema**: `C:\code\ISCI-Vision\Vault\CLAUDE.md`
- **Remote**: `https://intelliscience.visualstudio.com/ISCI-Vision-Vault/_git/ISCI-Vision-Vault` (Azure DevOps)
- **Scope**: ISCI-Vision domain — IVia.* architecture (109 wiki pages: architecture, ADR-001..011, api surface, anti-patterns), onboarding. Also serves as the default workflow KB on this single-project machine.
- **Forked from**: LLM-WIKI (Karpathy pattern)
- **Ingest status**: `raw/docs` ingested (50 source files); `raw/stratagem/*` subfolders present but empty (no staged backlog).

**Stratagem-Vault** (Stratagem workflow-system knowledge base)
- **Vault root**: `C:\code\Stratagem\Vault`
- **Schema**: `C:\code\Stratagem\Vault\CLAUDE.md` (the §4.5 vault-shape contract)
- **Scope**: `scope/workflow` — operating modes, skill catalog, config hierarchy, tracer-bullet discipline, MCP patterns, the Steward role. *About how we work, not what we work on* — per-project domain knowledge stays in per-project wikis.
- **Forked from**: LLM-WIKI (Karpathy pattern)
- **Resolution**: convention-based (`<project-root>\Vault`); the same vault serves both the `Steward` orchestrator and `Stratagem` framework repos.

## Wiki Vault Resolution (convention)

Skills resolve a project's wiki vault by **convention** — no registry: the vault is the **`Vault\` folder at the git root of the current working directory** (`<project-root>\Vault`). Exists → route knowledge through it (`/wiki-ingest`); absent → fall back to `docs/patterns/*`. The folder's presence *is* the opt-in (no registration step).

> **Retired 2026-07-08:** the former `## Wiki Registry` table (+ its `c:\code\CLAUDE.md` mirror and `Steward\CLAUDE.md` pointer). Vault paths are now derived from CWD, so there is a single source of truth — the in-repo `Vault\` — and nothing to drift. Per-vault scope tags (e.g. `scope/vision`) live in each vault's own `meta/scopes.md`.

### Cross-Project Patterns
- **Workflow**: PF → CP → PX → AX → CF lifecycle across all projects
- **Error handling**: EX → FX recovery cycle
- **Documentation**: Retrospective summaries feed gold standard docs via AGS
- **Quality**: PICA audits enforce pattern consistency

---

## Multi-Tool Integration Framework

### Tool Selection Decision Tree

**Claude Code** (Current tool):
- Primary: Feature development, refactoring, architecture design
- Strengths: Deep codebase understanding, multi-file coordination, pattern adherence
- Use for: Complex implementations, cross-cutting changes, architectural decisions

**OpenClaw** (Future integration):
- [Framework to be defined based on OpenClaw capabilities]

### Configuration Reusability

**Shared Components:**
- Communication style guidelines (from Global CLAUDE.md)
- Critical operation rules (never commit, manual review, etc.)
- Context7 integration for code generation
- Task interruption protocol

**Tool-Specific Adaptations:**
- Skill syntax and invocation patterns
- File system navigation conventions
- Integration points with development environment

---

## Self-Improvement Mechanisms

### Continuous Learning
- After each feature completion, extract patterns via `/rs` (Retrospective Summary)
- Apply validated patterns to gold standard docs via `/rs` (inline at close-out)
- Update project CLAUDE.md files with discovered conventions

### Configuration Evolution
- Monitor skill usage patterns across projects
- Identify redundant or underutilized skills
- Refactor skill boundaries based on actual composition patterns
- Update this Stratagem CLAUDE.md quarterly with meta-learnings

### Quality Feedback Loop
- Track `/ex` → `/fx` cycles to identify common error patterns
- Document prevention strategies in relevant CLAUDE.md files
- Refine skill prompts based on sub-agent execution quality
- Maintain living architecture documents (Stratagem Architecture.md)
