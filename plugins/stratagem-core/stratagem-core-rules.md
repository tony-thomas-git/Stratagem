# Stratagem Core — Operating Rules

> **What this is.** The runtime operating rules for the Stratagem workflow engine, shipped as the `sg` plugin. Skills in this plugin reference these rules via `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md`. This file is self-contained — it names no builder repo, no external orchestrator, and no machine-specific path. It is the single home for the SYSTEM-level rules the deployed workflow modes rely on.
>
> **Command surface.** Every command below is namespaced by the plugin: `/sg:pf`, `/sg:cp`, `/sg:px`, `/sg:ax`, … (see **Skills Catalog** for the full list). The bare-command forms in prose refer to the same modes.

---

## Composition Patterns

The workflow modes compose into a small set of canonical chains:

- **Sequential**: `/sg:pf` → `/sg:cp` → `/sg:px` → `/sg:ax` → `/sg:cf` (full feature lifecycle)
- **Phase Chained**: `/sg:pf` → `/sg:cp` → `/sg:phx` → `/sg:cf` (phase-level execution, human review between phases)
- **Error Recovery**: `/sg:ex` → `/sg:fx` (error documentation → fix implementation)
- **Quick Iteration**: `/sg:mpx` → `/sg:max` (memory-based planning for < 5 files)
- **Quality Assurance**: `/sg:pica` (audit — findings fed into `/sg:rs` at close-out)

---

## Tracer Bullet Discipline

**Core Principle:** Vertical end-to-end slices (API → UI → DB for ONE feature) before horizontal expansion (all APIs, then all UIs). Prevents accumulating untested code across context windows.

**USE Tracer Bullets When:**
- Feature spans 3+ system layers (API, UI, DB, middleware, etc.)
- Multiple similar features planned (login, registration, password reset)
- Architecture untested or new patterns being introduced
- Context-window constraints (> 5 files total)
- Integration risk between layers is high
- Deployment requires working functionality at each stage

**SKIP Tracer Bullets When:**
- Single-layer changes (UI-only styling, API endpoint addition)
- Small scope (< 5 files, single component/service)
- Refactoring within established patterns
- Bug fixes with clear isolation
- Documentation or configuration updates

**Mandatory Confirmation Checkpoints:**
- **At `/sg:cp`:** evaluate task decomposition. Ask "Does this plan benefit from vertical slicing?" If YES, structure tasks as end-to-end features (✅ "Task 1: Login feature end-to-end (API + UI + DB)"). If NO, proceed with natural decomposition.
- **At `/sg:ax`:** before implementing, confirm "Is this a vertical slice requiring end-to-end validation?" If YES, plan immediate testing after implementation.
- **At `/sg:fx`:** evaluate error scope. If the fix requires vertical-slice validation, test across all affected layers before marking complete.

**Tracer Bullet Task Structure:**

Good (vertical slice):
```
Task: Implement user authentication
- API: POST /api/auth/login endpoint with session creation
- UI: Login form component with error handling
- DB: User validation query
- Validation: End-to-end test from form submit → session cookie
```

Bad (horizontal layers):
```
Task 1: Build all auth API endpoints
Task 2: Build all auth UI components
Task 3: Wire auth system together
```

**Post-Execution Validation Protocol:** When a tracer bullet is active — (1) after each `/sg:ax`, validate the vertical slice works end-to-end; (2) don't proceed to the next `/sg:px` until the current slice is proven; (3) document validation results in the plan file; (4) use `/sg:ex` immediately if the slice fails integration.

**Integration with existing patterns:**
- **`/sg:mpx` → `/sg:max`:** natural tracer bullets (small scope enforces vertical thinking).
- **`/sg:pf` planning:** explicitly note "Tracer Bullet: YES/NO" in plan metadata.
- **`/sg:pica` audits:** check for horizontal-layer anti-patterns in completed work.

---

## Trust-But-Verify Pattern

*Trust the agent's defaults; verify at end-of-round.* Mnemonic: **Trust = forward; Verify = end-of-round surface.**

**Core Principle:** Replace mid-task plan-and-confirm gates with a decide-defaults-forward + confirm-after loop. The agent reasons hard about the choices the gate would have asked, picks defaults, executes, then surfaces a "Decisions Made" log at the end for surgical adjustment via `adjust N`. **Trust applies only to Low- and Medium-complexity decisions. High-complexity decisions break the trust half and must be escalated inline before execution.**

**USE Trust-But-Verify When:**
- Gate is mid-task (inside an already-approved workflow), not top-of-workflow
- Work is auto-chainable (running inside `/sg:phx`, a multi-round loop, or any sequential chain)
- Decisions are surgically reversible (page-level edits, naming, categorization, scope inclusion)
- Choices are tactical, not strategic

**SKIP Trust-But-Verify When:**
- Top-of-workflow approval (`/sg:pf` plan, `/sg:cp` task breakdown, `/sg:ax` pre-implementation confirm) — those gates stay
- Decision is destructive or hard to reverse (deleting pages, schema changes, force-pushes)
- Decision touches files outside the work item's natural blast radius
- High-stakes contradictions — escalate inline anyway (see Guardrails)

**The Loop:**
1. **Deep-think the gate questions.** Enumerate every choice the up-front gate would have surfaced. Pick a default for each based on the workflow's schema and observed conventions. Do not ask.
2. **Tag each decision with a Complexity Rank (L/M/H)** at point-of-decision (rubric below). H decisions STOP and escalate inline — they never reach step 3.
3. **Log decisions as you make them.** Maintain a running list: `decision → [tag] default chosen → one-line rationale → affected outputs`. Log at point-of-decision, not retroactively.
4. **Execute the work** using L- and M-tagged defaults.
5. **Surface a Decisions Made block at completion** (format below). Each row is independently flaggable.
6. **Handle adjustments surgically.** When the user says `adjust N`, edit only the outputs that decision shaped — do not redo the round.

**Decisions Made surface format:**
```
## Decisions Made (R3 — Source: foo.md)

| # | Decision | Default chosen | Why | Affected outputs |
|---|----------|----------------|-----|------------------|
| 1 | Concept granularity | [L] Split "auth lifecycle" into 2 pages | Each > 150 lines if combined | [[auth-lifecycle-server]], [[auth-lifecycle-client]] |
| 2 | Existing vs new | [L] Updated [[entity-registry]] rather than new page | 80% topical overlap | [[entity-registry]] |
| 3 | Inferred claim handling | [M] Marked 3 claims *(inferred)* | Source implied but did not state | [[zod-pipeline]] §2 |
| 4? | Scope cut | [L] Skipped one tangent on legacy patterns | Out of scope per §1 | (none) |

Reply with `adjust N` (e.g., `adjust 2`) to revise. Silence or `ok` = accepted.
```
The complexity tag prefixes the "Default chosen" cell: `[L]`, `[M]`, or `[H-ESCALATED]`. A `?` appended to the row number signals low agent confidence — give that row extra scrutiny.

**Adjust Protocol:** When the user says `adjust N` — (1) identify the affected outputs from the row; (2) reverse that specific default; (3) edit *only* the listed outputs — do not re-read the source or replan the round; (4) append a note to the round's log; (5) re-surface a one-line updated row.

**Guardrails — Complexity Ranking (hard guardrail; overrides the auto-chain):**

Every decision considered for Trust-Forward MUST be tagged based on *the output it produces*, not the decision itself:
- **Low (L)** — Trivial. One file, no new abstraction, no new dependency, revertible in a single edit.
- **Medium (M)** — Modest. Touches 2–5 outputs, no new abstraction layer, established pattern reused.
- **High (H)** — Complex. Any of: introduces a new abstraction or layer of indirection; cross-cutting change touching > 5 outputs; new dependency or schema change; logic that can't be reverted in a single commit; departs from an established pattern.

| Rank | Action |
|------|--------|
| L | Auto-proceed. Log to Decisions Made. |
| M | Auto-proceed. Log with `[M]` tag so the user gives it extra scrutiny at verify time. |
| H | **STOP. Escalate inline before executing.** Present the decision, the chosen default, the complexity drivers, and at least one simpler alternative. Wait for approval. Do not proceed on default. |

**Axiom (codevelopment):** *Simple, surgical, good code.* AI-generated code fails in proportion to the complexity of its output. Every layer of indirection, every new abstraction, every cross-cutting change multiplies the failure surface. Trust-But-Verify's auto-chain optimizes for throughput, and throughput at the cost of simplicity is a bad trade. When in doubt about a rank, round UP — a false-positive H escalation costs one user message; a false-negative auto-proceed costs a refactor.

**Spike to retire capability-uncertainty.** When an H rank comes from an *unverified capability* (can the harness/tool/library actually do X?) rather than a design preference, prefer a cheap throwaway spike to confirm it before committing the full build — it converts H-by-uncertainty into an evidence-backed L/M.

**Operating rule:** Before tagging any decision L or M, ask: *"Is there a simpler way to do this?"* If the answer is "yes, but it's more work," choose the simpler way. The complexity tag is a measurement of what you're about to commit, not a license to ship the easiest-to-generate output.

**Other guardrails:**
- **High-stakes escalation (non-complexity).** If a decision would (a) delete or rename existing outputs, (b) introduce a contradiction with prior claims, or (c) cross a scope boundary defined in the workflow schema — escalate inline even if it looks L or M.
- **Decision-log discipline.** Log at point-of-decision; a retroactive log after a long auto-chain is unreliable and defeats surgical-adjust.
- **Soft cap per round.** If the Decisions Made list grows past ~15 items, the round is doing too much — split it.
- **Confidence threshold.** If confidence in a default is ~50/50, flag it inline as `?` rather than presenting it as a confident default.

**Integration with existing patterns:**
- **`/sg:phx`:** Trust-But-Verify is what unblocks `/sg:phx` for multi-round work. Each round runs end-to-end without mid-task gates (except H escalations), then `/sg:phx` proceeds.
- **`/sg:mpx` → `/sg:max`:** applies naturally; surface decisions in the wrap-up.
- **`/sg:pica` audits:** check that completed work surfaced Decisions Made when Trust-But-Verify was active, and that no H-complexity decision was silently auto-proceeded.

---

## Fleet-Aware Vault Editing

**Core Principle:** Stratagem orchestrates a *fleet* of sibling wiki vaults (each project's `Vault\` folder as it appears). Many vault-level conventions — the §4.5 shape contract, the schema `CLAUDE.md`, the `.obsidian/graph.json` and `.obsidian/app.json` renderer configs — are duplicated across vaults by design (prose, not code-factorable). Single-vault edits silently drift the fleet unless propagation is explicit.

**The rule:** Before any `Write` or `Edit` to a file under a vault root (a `Vault\` folder at a project's git root, per **Wiki Vault Resolution**), surface a one-line fleet-check **inline, before the edit**:

> *This edit touches `<vault>`. Active sibling vaults: the `Vault\` folders at other active projects' git roots. Apply there too? (just this one / apply to siblings / show diff first)*

Wait for the answer. Do not auto-proceed. This gate is mandatory — it is **not** a Trust-But-Verify L/M decision (single-commit reversible within the active vault, but propagation across vaults is a cross-cutting H concern).

**Scope — when the gate fires:**
- ✅ `vault/CLAUDE.md` (any project's `Vault\` at its git root)
- ✅ `vault/.obsidian/graph.json` — **only** shape-relevant keys: color groups, tag-query rules, `showTags`, `showOrphans`, `showAttachments`, `hideUnresolved`, `collapse-color-groups`. Cosmetic keys (zoom, pan, `close`, `collapse-display`, `collapse-filter`, user-modified `scale`) do **not** fire the gate.
- ✅ `vault/.obsidian/app.json` — **only** shape-relevant keys: `userIgnoreFilters`, `attachmentFolderPath`, `newFileLocation`, `newLinkFormat`, `useMarkdownLinks`. Cosmetic keys (theme, font, sidebar width, hotkeys) do **not** fire the gate.
- ✅ Skill files that encode the shape contract: `wiki-ingest/SKILL.md`, `wiki-graph-audit/SKILL.md`
- ✅ Pattern pages that document vault-level conventions (e.g., the wiki-graph shape-contract page)
- ✅ Any other Write/Edit under a vault root — surface the gate with default *"just this one — page content is vault-local"* and let the user confirm

**Scope — when the gate does NOT fire:**
- User-driven UI changes to `.obsidian/*.json` (zoom, pan, panel state) — those don't go through Claude tools, so the gate physically can't fire. Flag drift during `/sg:wiki-graph-audit` runs instead.
- Cosmetic key edits the agent makes deliberately — the rule is keyed to *shape* concerns, not presence-in-file.
- Projects with no `Vault\` folder yet — the fleet is the set of *existing* `Vault\` folders only.
- Edits inside `vault/raw/` (source documents) and `vault/logs/` (per-vault append-only logs).

**Rationale for key-level scoping:** A blanket file-level trigger over-fires on theme/zoom/cosmetic edits, training the user to dismiss the gate. Naming the shape-relevant keys preserves the "no silent fleet drift" guarantee while keeping the gate signal-rich. When in doubt: *if this key differs between sibling vaults, does it produce a visibly different graph topology or routing decision?* Yes → shape (gate fires). No → cosmetic (gate skips).

**Source of truth:** convention — the fleet is the set of `Vault\` folders at active projects' git roots (see **Wiki Vault Resolution**). To add a vault to the fleet, create its `Vault\` folder; the gate discovers it by convention, no registration needed.

**Why this is a rule, not a hook:** Portability. A rule travels with the plugin and works wherever Stratagem is deployed; a `settings.json` hook is tied to one install. The cost is agent-discipline-driven rather than harness-enforced — Trust-But-Verify proves this discipline is reliable in practice.

**Integration:**
- **Trust-But-Verify:** this rule supersedes it for vault-shape edits — a shape-contract edit is H by definition (cross-cutting across the fleet). Do not auto-proceed even if the in-vault change looks L.
- **`/sg:wiki-graph-audit`:** catches drift the gate missed (user UI edits, edits made outside Claude). Run periodically per vault.

---

## Autonomy Budget & the Two-Path Loop

**Core Principle:** Autonomous loops compound token cost super-linearly. Before any loop runs unattended it needs a **token ceiling that can say "no" independent of the goal** — the single most important guard on an unattended loop. The budget is a first-class stop condition, not advisory.

**The two execution paths:**
- **Interactive `/sg:phx`** — human-driven, per-phase. **No hard budget** — the human watches cost.
- **Unattended autonomy loop (`/sg:if`)** — a Workflow run that drives `px → ax → verifier → advance` per task with a **harness-enforced token budget** (the `budget.*` API).

**Budget defaults (override per plan via `## Budget: <tokens>`):**
- **Default ceiling:** `750000` tokens for an unattended single-feature loop.
- **Reserve floor:** halt with `75000` tokens of headroom remaining, so the escalation summary itself never overruns.
- **Warn threshold:** surface a heads-up in the Trust-But-Verify *Decisions Made* block at **80%** spent.
- **No silent caps:** every warn and the breach-halt are logged + surfaced, never swallowed.

**Recovery defaults (bounded `/sg:ex → /sg:fx` auto-recovery):**
- **Default attempts:** `N = 3` bounded attempts after a verifier fail; converge (advance) or escalate. A small hard ceiling — no infinite loop.
- **Override:** `opts.maxRecovery`, sourced from an optional `## Recovery-Attempts: <N>` plan header; the default of `3` applies when absent.
- **Two halt semantics (do not conflate):** a `budget` halt is **resumable** (raise `## Budget:`, resume via `resumeFromRunId`); a `recovery-exhausted` halt is **terminal** (needs human judgment — the attempt ledger is surfaced).
- **Precedence:** the budget check runs **first** each recovery attempt, so a reserve-floor breach mid-recovery halts as `budget` (resumable), never reclassified as exhaustion.
- **Anti-self-agreement:** each attempt's `/sg:ex` is fed all prior attempts' failure reasons so fixes diverge; every re-verify is a fresh instance (builder ≠ checker).
- **No silent caps:** every attempt and the terminal halt are logged + surfaced.

**Completion contract (plan-level final gate; `/sg:if` path only):**
- **Final integration gate.** After *every* per-task verifier passes, ONE budget-checked gate runs the plan's `## Integration-Verify:` command in a fresh instance (builder ≠ checker, at plan scope). Exit 0 → feature complete.
- **Third halt semantic — `integration`.** Terminal, plan-level, **no auto-recovery** (distinct from `budget` = resumable and `recovery-exhausted` = terminal-per-task): a cross-task integration failure needs human diagnosis — it may be a decomposition fault, not a code fault. Default build timeout **1800s** (a full-solution build is minutes; the per-task 300s is far too short).
- **Absent header → skip-loud.** No `## Integration-Verify:` → skip the gate with a surfaced `log()` warning; **never fabricate a build command**.
- **Feature-branch pre-flight.** `/sg:if` resolves `## Branch:` (else convention `tony/<plan-slug>`) and **HALTs on a protected branch** (`staging`/`main`) absent an explicit feature branch, so the loop's uncommitted diff lands on a review branch, never on trunk. The loop itself never touches git and never commits.

**Observability & Durability (`/sg:if` path only):**
- **Per-run ledger.** Every unattended loop writes an **append-only markdown ledger** at `<plan-dir>/logs/<plan-slug>.ledger.md` (run-state lives next to the plan it executes, git-reviewable). One row per **verifier boundary** (each per-task verdict incl. recovery sub-attempts), plus every halt and the integration verdict — `| ts | task | stage | verdict | exit | spent | note |`.
- **The script never writes the ledger.** The Workflow script has no fs/shell/clock; writes are **delegated to the Bash-having layers** — the launcher creates the run header, the verifier agent appends each row (stamping time via `date`), and the script only `log()`s the live STATUS line (it alone knows `budget.spent()`).
- **Live status surface.** The script `log()`s a status line at each between-task boundary, each recovery attempt, and the integration gate: `STATUS · task k/N · spent X/CEILING (Z%) · last:<verdict> · recovered:<n>`.
- **Two resume paths (they compose).** `resumeFromRunId` is the in-session, budget-halt replay (harness journal cache). The **ledger-skip** is the cross-restart path: on a fresh `/sg:if` launch, the launcher reads the ledger and trims tasks that already carry a `verify | pass` row, resuming at the last *verified* boundary.
- **Skip-loud, never fail.** If the launcher cannot create `logs/`, it warns and launches with `ledgerPath = null`; the loop runs ledger-less (observability degrades, the loop never fails on telemetry).

**Literal invocation is *structural* in the Workflow path.** Each phase is a discrete `agent()` stage that literally runs its skill (`/sg:px`, `/sg:ax` with PICA, verifier, `/sg:ex` → `/sg:fx`); the deterministic script *cannot* fold them into one improvised thread. This is the structural realization of **Literal Composition** (below) — the rule becomes a harness guarantee, not agent discipline.

**Single-source verifier contract.** The per-task gate (C.1–C.4) is defined once in `/sg:phx` Step C. Both callers — the interactive skill and the Workflow stage — *reference* it; neither re-authors. Change-coupling: edits to the gate contract update both call sites.

**Workflow-script gotchas (apply to every Workflow script):**
- **`meta` must be a pure literal.** No `+` concatenation or computed values anywhere in `meta` — the validator rejects `BinaryExpression`. Keep `description` a single string literal.
- **`args` may arrive as a JSON-encoded STRING** (background runs), not a parsed object. Normalize at the top: `let opts = args; if (typeof opts === 'string') opts = JSON.parse(opts)` — then read from `opts`.
- **`budget.spent()` is the SHARED cumulative turn spend**, not the loop's. Baseline it (`const startSpent = budget.spent()`) and guard on `budget.spent() - startSpent`, so a budget means "tokens THIS run may spend," independent of launch time.
- **No clock in the script.** `Date.now()` / `new Date()` / `Math.random()` **throw** inside a Workflow script (they would break resume). All timestamps come from agents (`date` via Bash) or the launcher.

---

## Literal Composition

A skill that chains other skills invokes them via the Skill tool — **never** paraphrasing or inlining their logic. Sub-skill checklists and audits (e.g. `/sg:ax`'s PICA) only run if the sub-skill actually runs; improvising them in-thread silently skips them. On the interactive path this is agent discipline; on the unattended Workflow path it is structural (each stage is a discrete `agent()` call that literally runs its skill).

---

## Skills Catalog

The workflow operating modes, invoked as `/sg:<name>`:

| Command | Purpose |
|---------|---------|
| `/sg:ps` | Plan Seed — bridge raw ideas into a seed doc (input to `/sg:pf`) |
| `/sg:pf` | Plan Features — comprehensive feature planning |
| `/sg:cp` | Create Plan — break a plan down into tasks |
| `/sg:px` | Plan Execute — analyze one specific task |
| `/sg:ax` | Authorize Execution — implement a planned task |
| `/sg:ex` | Error Executing — document errors, create fix plans |
| `/sg:fx` | Fix Execution — implement fixes |
| `/sg:cf` | Complete Feature — finalize and generate a summary |
| `/sg:rs` | Retrospective Summary — extract learnings from a completed plan |
| `/sg:crs` | Conversation Retrospective — extract learnings from the active session |
| `/sg:mpx` | Memory Plan Execute — quick planning (< 5 files) |
| `/sg:max` | Memory Authorize Execute — execute an mPX plan |
| `/sg:phx` | Phase Execute — chain PX→AX across a phase, range, or single task |
| `/sg:pica` | Post-Implementation Compliance Audit |
| `/sg:rp` | Read Plan — resume work, assess progress |
| `/sg:um` | UpdateMe — instant plan status snapshot |
| `/sg:if` | Implement Feature — budget-guarded unattended autonomy loop |
| `/sg:sa` | Skill Audit — check skills against the canonical layout |
| `/sg:handoff` | Handoff — slice session context into a durable, self-sufficient brief |
| `/sg:wiki-ingest` | Wiki Ingest — add a page to a Stratagem Wiki vault |
| `/sg:wiki-graph-audit` | Wiki Graph Audit — sweep a vault for shape-contract violations |

---

## Critical Operation Rules

- **Never commit changes** — all changes remain uncommitted for manual review.
- **Read-only repositories** — never commit; leave changes uncommitted for manual review.
- **Follow Context7 guidelines** in `/sg:ax` and `/sg:max` for all code generation (see **Context7 Integration**).
- **Update plan files** with all progress and changes.
- **Use `git diff`** to track actual implementation progress.
- **One task at a time** — complete the current task before starting the next.
- **Mid-task confirmation gates:** use the **Trust-But-Verify Pattern** (above). Mid-task gates inside auto-chainable work proceed on best-default judgment for Low/Medium-complexity decisions and surface a "Decisions Made" block at completion for the user to verify. **High-complexity decisions (new abstractions, cross-cutting changes, new dependencies, anything not single-commit reversible) STOP and escalate inline before execution** — simple, surgical, good code is non-negotiable. Top-of-workflow gates (`/sg:pf`, `/sg:cp`, `/sg:ax`) remain unchanged.

---

## Research & Web Lookup Routing

Always pick the cheapest tool that answers the question.

1. **Library / framework / SDK / CLI / cloud-service docs → context7. Always.** (React, Next.js, Prisma, MSAL, AG Grid, Tailwind, AWS/Azure SDKs, etc.)
2. For everything else, climb the **Tavily ladder** from cheapest up:
   - `tavily_search` — single keyword query for an error message, news, or current state
   - `tavily_extract` — known URL, want clean content (use after a search returns a good link)
   - `tavily_map` — known doc site, find which pages are relevant
   - `tavily_map → tavily_extract` — preferred pattern for mining a known doc site
   - `tavily_crawl` — whole-site offline reference (rare)
   - `tavily_research` — multi-source synthesis with citations. Quota-heavy. **Last resort.**

**Rules:** keyword queries, not sentences · one search at a time (if the first answers, stop) · after a useful URL appears, switch to `tavily_extract` · justify any `tavily_research` in one line first.

---

## MCP Integration Rules

- **Always preview mode:** never execute unless explicitly given permission.
- **desktop-commander:** always confirmation mode, never command execution.
- **Single atomic exceptions:** explicit run commands are treated as exceptions.
- Prefer native tools (Read / Write / Edit) over MCP for file operations when available.

---

## Context7 Integration

**Mandatory for `/sg:ax` and `/sg:max`:** all code generation resolves current documentation via context7 first — `resolve-library-id` → `get-library-docs` → generate against retrieved docs, not training-time assumptions. This ensures consistent code quality, proper integration with the existing architecture, adherence to established conventions, and optimal context-window use.

---

## Task Interruption Protocol

When the user provides feedback during task execution:

1. **Assess interruption type:**
   - **CRITICAL** — keywords "STOP", "PAUSE", "ABORT", "HALT" → stop immediately.
   - **CONCERN** — screenshot / error report / question → acknowledge but COMPLETE the current task.
   - **CLARIFICATION** — "What about X?" → answer briefly and CONTINUE the task.
2. **Protect architectural integrity:** never skip mandatory components to fix symptoms; complete atomic tasks — partial implementation creates more problems.
3. **Task Sanctuary Principle:** once in `/sg:ax`, the task must complete unless an explicit "STOP" is given; user concerns during execution are queued, not acted upon. Architectural integrity > immediate satisfaction.

---

## Wiki Vault Resolution

Skills resolve a project's wiki vault by **convention**. The vault is the **`Vault\` folder at the git root of the current working directory** (`<project-root>\Vault`). Exists → route knowledge through it (`/sg:wiki-ingest`); absent → fall back to `docs/patterns/*`. The folder's presence *is* the opt-in — no registration step, a single source of truth (the in-repo `Vault\`), nothing to drift. Per-vault scope tags (e.g. `scope/vision`) live in each vault's own `meta/scopes.md`.
