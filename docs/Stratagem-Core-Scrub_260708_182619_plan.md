# Feature: Stratagem Core Scrub — externalize Profile literals + per-project install
## Created: 2026-07-08 18:26:19
## Status: In Progress
## Source PF: lovely-napping-pnueli.md (harness plan; C:\Users\TonyThomas\.claude\plans\)
## Tracer Bullet: NO
## Budget: 400000

## ⚡ Execution Re-Evaluation (2026-07-08 · post-scrub)

**Done:** Tasks 1–5 (backup + the mechanical scrub) — verified: **0 hits** on `Steward\CLAUDE.md` / `C:\code\ISCI-Vision` / `C:\code\docs` / `intelliscience`; the `<project-root>\Vault` convention is present in **all 10** skills.

**Decisions made (Trust-But-Verify defaults applied — flag to adjust):**
- [Q1] Scrub-first, in global (physical move deferred).
- [Q2] `pica` neutral-strip → derive scope from the active project's `CLAUDE.md`.
- [Q3] `ss` env vars = `STRATAGEM_ADO_ORG` / `_OWNER` / `_PROJECT`.
- [backup] `~/.claude/_backup/preScrub/`.

**Residual (minor):** 3 `ISCI-Vision-Vault` name refs remain in `wiki-ingest` / `wiki-graph-audit` (scope-tag *examples*, not path leaks) — genericize as a small follow-up (Task 12b).

**Hazard cleared:** the self-modifying risk is gone (the loop's own skills are now scrubbed) → `/phx` and `/if` are viable for the automatable remainder.

**New fork point:** the 24 scrubbed skills now sit in global `~/.claude/skills` — fully working everywhere, portable, zero literals. A clean checkpoint. **Task 7 (the move) is the packaging COMMITMENT** — it empties global and pins Stratagem to ISCI-Vision, and packaging (plugin vs per-project) is still open (Q5/Q7). So the remainder splits:

| Remaining task | Prejudges packaging? | When |
|---|---|---|
| 11 Harvest scrub → repo | No — needed for both | **do next** (locks the gains; plugin & per-project each a copy away) |
| 12b Genericize residual vault refs | No | now (finishes the scrub) |
| 9 Dissolve registry (edit CLAUDE.md) | No — either way | now (runs from this session) |
| 12a Doc reconcile | No | anytime |
| 6 Gitignore + dir | **Yes** | gate on packaging |
| 7 Move → project (empties global) | **Yes (commit)** | gate on packaging |
| 8 Profile config | **Yes** | gate on packaging |
| 10 MVP `/if` smoke | proof | after install (ISCI-Vision session) |

**Recommendation:** the scrub delivered the reusable core. Before the move (Tasks 6–8 — the per-project commitment that empties global), **lock plugin-vs-per-project**. Meanwhile run the packaging-neutral tasks (11 harvest → 9 registry → 12a/12b docs) to bank the gains and keep both doors open.

### Strategic Context

**Problem & solution.** Stratagem's skills bake in machine/person/install-specific literals (paths, org, email), so Core can't be shared. Solution: **strip every Profile literal out of Core assets and have them *reference* the value** (convention or `env`), then **install Core into the project** (`<project>\.claude\skills`, gitignored, moved out of global). Core becomes portable; Profile lives in its own homes; the machine ends up in the shape a fresh Core install + filled Profile would produce. First / MVP install target: **`C:\code\ISCI-Vision`**.

#### What's Already Built
| Component | State | Location |
|---|---|---|
| 24 Core skills | live, global, **leaky** | `~/.claude/skills/` |
| `autonomy-loop.js` workflow (drives `/if`) | clean (fs-blind, zero paths) | `~/.claude/workflows/` |
| `stratagem-ado` plugin (`sp`/`pr`/`board-sync` + MCP) | done, detachable, ships disabled | `C:\code\Stratagem\plugins\` |
| ISCI-Vision Vault | **in-repo**, 187 tracked files, convention-ready | `C:\code\ISCI-Vision\Vault` |
| `pat.b64` secret | correct home (plugin reads it) | `~/.claude/plugins/data/stratagem-ado/` |
| Design doc (living memory) | current | `C:\code\Stratagem\docs\strat-dist-wip.html` |

**Leak map (grep-verified, Explore 2026-07-08):** dominant leak `c:\code\Steward\CLAUDE.md` hardcoded as the registry anchor in **10 skills** (a `CORPUS-READ-FIRST` block **duplicated verbatim across 8**: `pf cp px ax ex fx mpx max`, + standalone reads in `crs`/`rs`); plus `max`/`fx` runbook write-targets + `crs` doc fallbacks; `px`'s stale `C:\code\docs\{ws}-docs\plans`; `ss` org/email/ADO-org REST URLs; `pica` hardwired ISCI-Vision stack; `settings.json` marketplace path + prefs.

#### Architecture Decisions
- **Per-project install, not global, not parent.** Skills at `<project>\.claude\skills` sit inside the repo → discovered normally. *Rationale:* verified git topology — `c:\code` is NOT a repo; `ISCI-Vision`/`Stratagem` each ARE; Claude Code skill discovery stops at the **repo root**, so a parent `c:\code\.claude\skills` is invisible inside project sessions. Per-project dissolves the boundary problem entirely (no cascade, no junctions, no spike).
- **Vault = `<project-root>\Vault` convention** (git-root of CWD). Zero machine literals, zero config, no registry. Validated: the vault is committed inside ISCI-Vision. Standardize the dir name on `Vault`.
- **Single Profile config home = `<project>\.claude\settings.local.json`** (gitignored) for prefs + `enabledPlugins` + ADO `env`. `pat.b64` stays global. **`CLAUDE.local.md` not needed** (registry dissolved).
- **Gitignored, not committed** — ISCI-Vision is a shared repo (ADO remote, colleagues); Core must not be pushed to the team. (`Vault\` stays committed — intentional shared knowledge.) *[user-confirmed]*
- **Move, not copy** — a project copy is shadowed by global (global wins on name-collision), so move (backup first). *[user-confirmed]*
- **Scrub-first, move-last** *(default; overridable — Q1)* — scrub in place in global, defer the physical move, so the cleaned set feeds either fork (project install **or** a future plugin) with one copy. Keeps the plugin option free.

#### Phase Strategy
Backup → scrub-in-global (the reusable, high-value work) → stand up the gitignored project `.claude` → move → Profile → dissolve registry → verify. Post-MVP: harvest the scrubbed Core into a version-controlled `strat-dist` repo (durability + plugin source) and reconcile docs / standardize the Stratagem vault name. Ordering puts the durable scrub before any location commitment.

#### Entity/Component Notes
- **CORPUS-READ-FIRST block is change-coupled** — identical text in 8 SKILL.md files (`px:41-50` is the reference; sync note at `:42`). Edit all 8 in one atomic, verbatim-identical change or they diverge.
- **`ss`** is the heaviest identity leak: `intelliscience` in REST URLs (`:58,59`), owner email (`:42`), default project `ISCI - Consolidated - Kanban` (`:40`). PAT path already dynamic — leave it.
- **`pica`** hardwires the whole ISCI-Vision stack (`:24`) — not a path but a product identity. ISCI-Vision already ships a `/pica` override, so scope is meant to be project-provided; derive from the project's `CLAUDE.md`.
- **Stale paths:** `crs`/`px` reference `C:\code\docs\…-docs\` — the *old* external-docs home, pre-vault-move. Replace with project-relative, don't just externalize.
- **`px`/`rs` ISCI-Vision paths are examples**, not dependencies (the doc overstated these five).

#### Dependencies
- Git topology (verified) + Claude Code skill discovery = repo-root boundary (docs-confirmed).
- Claude Code config cascade: settings merge, `.local` overrides, `env` block sets session env vars.
- ADO plugin + `pat.b64` unchanged; `ss` reads ADO identity from `$env:STRATAGEM_ADO_*`.

#### Risk Assessment
| Risk | Mitigation |
|---|---|
| Editing **live daily-driver** skills breaks the working system | Phase-0 snapshot = full restore |
| **Gitignore-before-move ordering** — a shared repo could stage Core | Gitignore `.claude/` BEFORE creating/moving any file (Task 6 precedes Task 7) |
| Functional plan-path change (`px`/`max`/`fx` change where they read/write) | Verify a real `/px` after; grep-clean gate |
| `pica` may not fully parameterize in one pass | Neutral-strip + follow-up is acceptable |
| Scrubbed skills exist only as gitignored local files | Task 11 harvests them into a version-controlled repo |

#### Open Design Decisions
- **Q1 Scrub order:** scrub-first/move-last *(default)* vs strictly move-then-scrub (source plan).
- **Q2 Core-rules home:** skill-embedded *(default; plugin-friendly)* vs `<project>\CLAUDE.local.md` (gitignored).
- **Q3 Global `settings.json`:** strip the moved personal keys *(default)* vs leave it.
- **Q4 `pica`:** neutral-strip + defer *(default)* vs full project-derive now.
- **Q5 Packaging:** **plugin deferred** *(default — this plan ships per-project skills; scrubbed set is ~85–90% reusable as a future `sg` plugin payload)*.
- **Q6 Stratagem-Vault → Vault rename:** include as post-MVP Task 12 *(default)* vs separate later.

#### Success Criteria
- Installed skills contain **zero** Profile literals (grep-clean: no `Steward\CLAUDE.md`, `C:\code\ISCI-Vision`, `C:\code\docs`, `intelliscience`).
- `<project-root>\Vault` convention resolves ISCI-Vision's vault; unregistered projects no-op cleanly.
- `git status` in ISCI-Vision clean (Core gitignored, nothing staged).
- ADO plugin still loads (`core_list_projects`); **MVP `/if` smoke green** in ISCI-Vision.
- Scrubbed Core is version-controlled (recovery/plugin-pivot bulletproof).

### Context Files
- `strat-dist-wip.html`: living design memory (Core/Profile model, invariant, convention, decision log).
- `lovely-napping-pnueli.md`: the source narrative plan this CP decomposes.

### Task List
- [x] Task 1: **Backup snapshot** — copy `~/.claude/skills/`, `~/.claude/settings.json`, and `C:\code\CLAUDE.md` / `Stratagem\CLAUDE.md` / `Steward\CLAUDE.md` to `~/.claude/_backup/preScrub/`. *AC: all 24 skills + settings present in backup.*
  - Verify: `powershell -NoProfile -Command "exit ([int](-not (Test-Path \"$env:USERPROFILE\.claude\_backup\preScrub\skills\px\SKILL.md\")))"`
- [x] Task 2: **Scrub registry anchor → convention (10 skills, in global).** Rewrite CORPUS-READ-FIRST step 1 `Read \`c:\code\Steward\CLAUDE.md\`…` → `Resolve the vault as \`<project-root>\Vault\` (git root of CWD); exists→use, else no-op & fall through`. Verbatim-identical across the 8 (`pf cp px ax ex fx mpx max`) + `crs:41` + `rs:50`. *AC: no `Steward\CLAUDE.md` literal remains; block still identical across the 8.*
  - Verify: `powershell -NoProfile -Command "if (Get-ChildItem -Recurse -Filter SKILL.md \"$env:USERPROFILE\.claude\skills\" | Select-String -SimpleMatch 'Steward\CLAUDE.md' -Quiet) { exit 1 } else { exit 0 }"`
- [x] Task 3: **Scrub write-targets + `px` doc-path.** `max:51-52`/`fx:73` runbook → active project's `Plans\🐛Bug-Hunt-Runbook.md`; `crs:45,49,75,95` → project-relative / `docs/patterns/*`; `px:25,31` → project-relative `Plans\`; `px:32` example dropped. *AC: no `C:\code\ISCI-Vision` / `C:\code\docs` literals in these skills.*
  - Verify: `powershell -NoProfile -Command "if (Get-ChildItem -Recurse -Filter SKILL.md \"$env:USERPROFILE\.claude\skills\" | Select-String -SimpleMatch @('C:\code\ISCI-Vision','C:\code\docs') -Quiet) { exit 1 } else { exit 0 }"`
- [x] Task 4: **Scrub `ss` identity → env.** Resolve ADO org/owner/project from `$env:STRATAGEM_ADO_ORG/OWNER/PROJECT`; build `dev.azure.com/<org>/…` from resolved org. *AC: no `intelliscience` / owner-email literal in `ss`; `STRATAGEM_ADO_` referenced.*
  - Verify: `powershell -NoProfile -Command "if (Select-String -SimpleMatch 'intelliscience' \"$env:USERPROFILE\.claude\skills\ss\SKILL.md\" -Quiet) { exit 1 } else { exit 0 }"`
- [x] Task 5: **Scrub `pica` → project-derived.** Strip the ISCI-Vision stack hardcode (`:24`); derive audit scope from the active project's `CLAUDE.md`. Neutral-strip acceptable (Q4). *AC: no `IVia.App` / `ISCI-Vision` stack literal in `pica`.*
  - Verify: `powershell -NoProfile -Command "if (Select-String -SimpleMatch @('IVia.App','ISCI-Vision') \"$env:USERPROFILE\.claude\skills\pica\SKILL.md\" -Quiet) { exit 1 } else { exit 0 }"`
- [x] Task 6: **Gitignore + stand up project `.claude` (BEFORE any move).** Add `.claude/skills/`, `.claude/settings.local.json`, `CLAUDE.local.md` to `C:\code\ISCI-Vision\.gitignore`; create `C:\code\ISCI-Vision\.claude\skills\`. *AC: `.gitignore` covers `.claude/skills`; dir exists.*
  - Verify: `powershell -NoProfile -Command "if ((Test-Path 'C:\code\ISCI-Vision\.claude\skills') -and (Select-String -SimpleMatch '.claude/skills' 'C:\code\ISCI-Vision\.gitignore' -Quiet)) { exit 0 } else { exit 1 }"`
- [x] Task 7: **Move scrubbed skills global → project.** Move all 24 folders `~/.claude/skills/*` → `C:\code\ISCI-Vision\.claude\skills\`; global left empty. *AC: 24 skills in project, global empty.*
  - Verify: `powershell -NoProfile -Command "if (((Get-ChildItem -Directory 'C:\code\ISCI-Vision\.claude\skills').Count -ge 24) -and ((Get-ChildItem -Directory \"$env:USERPROFILE\.claude\skills\" -EA SilentlyContinue).Count -eq 0)) { exit 0 } else { exit 1 }"`
- [x] Task 8: **Profile config.** Create `C:\code\ISCI-Vision\.claude\settings.local.json` with `enabledPlugins` (`stratagem-ado@stratagem-local`), prefs (`effortLevel`/`theme`/`tui`/notif), and `env` (`STRATAGEM_ADO_ORG=intelliscience`, `_OWNER=tony.thomas@intelliscience.com`, `_PROJECT=ISCI - Consolidated - Kanban`). Strip those keys from global `settings.json` (Q3). *AC: valid JSON; `env.STRATAGEM_ADO_ORG` present.*
  - Verify: `powershell -NoProfile -Command "try { $j = Get-Content 'C:\code\ISCI-Vision\.claude\settings.local.json' -Raw | ConvertFrom-Json; if ($j.env.STRATAGEM_ADO_ORG) { exit 0 } else { exit 1 } } catch { exit 1 }"`
- [x] Task 9: **Core rules + dissolve registry.** Land cross-cutting rules per Q2 (skill-embedded default). Remove the `## Wiki Registry` path table from `C:\code\CLAUDE.md` + `Stratagem\CLAUDE.md`; retire the `Steward\CLAUDE.md` pointer + AP-WF-3 mirror coupling. *AC: no live registry path-rows the skills would read.*
  - Verify: `powershell -NoProfile -Command "if (Select-String -SimpleMatch 'C:\code\ISCI-Vision\Vault' 'C:\code\CLAUDE.md' -Quiet) { exit 1 } else { exit 0 }"`
- [x] Task 10: **Verification pass (grep-clean gate).** Sweep the *installed* skills for any residual literal. *AC: zero hits across the four literal classes in the project skills.*
  - Verify: `powershell -NoProfile -Command "if (Get-ChildItem -Recurse -Filter SKILL.md 'C:\code\ISCI-Vision\.claude\skills' | Select-String -SimpleMatch @('Steward\CLAUDE.md','C:\code\ISCI-Vision','C:\code\docs','intelliscience') -Quiet) { exit 1 } else { exit 0 }"`
- [ ] Task 11: **Harvest scrubbed Core → `strat-dist` repo** (durability + future plugin source). Copy the cleaned skills into a version-controlled repo/branch and commit. *AC: scrubbed skills present + committed in the repo.*
  - Verify: `powershell -NoProfile -Command "exit ([int](-not (Test-Path 'C:\code\strat-dist\skills\px\SKILL.md')))"`
- [ ] Task 12: **Doc reconcile + Vault-name standardize (post-MVP).** Update `strat-dist-wip.html` to the per-project model (parent-level section obsolete; correct the leak table); `git mv Stratagem-Vault → Vault` + reference sweep. *AC: doc says per-project; `C:\code\Stratagem\Vault` exists.*
  - Verify: `powershell -NoProfile -Command "if ((Test-Path 'C:\code\Stratagem\Vault') -and (Select-String -SimpleMatch 'per-project' 'C:\code\Stratagem\docs\strat-dist-wip.html' -Quiet)) { exit 0 } else { exit 1 }"`

### Completed Tasks
- **Task 1 — Backup** ✅ 2026-07-08 — 24 skills + `settings.json` + 3 `CLAUDE.md` → `~/.claude/_backup/preScrub/`.
- **Tasks 2–5 — Scrub** ✅ 2026-07-08 — registry anchor → `<project-root>\Vault` convention (8-file coupled block byte-identical + `crs`/`rs`); write-targets/`px` → project-relative; `ss` → `$env:STRATAGEM_ADO_*`; `pica` → project-derived. **Verified:** 0 literal hits, convention in all 10 skills. Decisions Made + residual → see the Execution Re-Evaluation section.
- **Tasks 6–8 — Per-project install** ✅ 2026-07-08 — `postScrub` durability snapshot taken; `.claude/skills/` gitignored (verified ignored pre-move); 24 skills moved global → `ISCI-Vision\.claude\skills` (global empty, git-clean); ADO `env` merged into existing `settings.local.json` (gitignored, `permissions` preserved). **Decisions:** Q5/Q7 = per-project now (plugin deferred); Q3 adjusted — did NOT strip global prefs/plugin config (legitimate personal global config, not a Core leak); only the ADO `env` went per-project.
- **Task 9 — Dissolve registry** ✅ 2026-07-08 — retired the `## Wiki Registry` apparatus in all 3 files (`Steward\CLAUDE.md` pointer, `Stratagem\CLAUDE.md` canonical table + AP-WF-3 sync note, `c:\code\CLAUDE.md` mirror) → replaced with a "Wiki Vault Resolution (convention)" note. **Core-rules (Q2/Q6):** skill-embedded — no move needed; the rules each skill needs travel in its `SKILL.md` (now in ISCI-Vision). Triggered by the `/rs` MVP run surfacing the dead/divergent registry.
- **Task 10 — Verification / MVP proof** ✅ 2026-07-08 — installed skills grep-clean (0 literal hits in `ISCI-Vision\.claude\skills`). **MVP proven in a live ISCI-Vision session:** sanity passed (per-project skills resolve + `/um` read real ISCI plans); convention passed (`/rs` resolved `C:\code\ISCI-Vision\Vault` via `<project-root>\Vault`, matching `AGENT.md`). Optional `/if` full-loop smoke + a live `/ss` (exercises the ADO `env`) still un-run.
- **Gap-fix (plan omission)** ✅ 2026-07-08 — the plan's Task 7 moved *skills* only; the `autonomy-loop.js` workflow was still global. Moved it → `ISCI-Vision\.claude\workflows\` (gitignored, git-clean; global workflows now empty). Confirmed via docs that project-level `.claude/workflows/` is discovered (walks cwd→repo-root, project wins on collision). **Per-project install now complete: skills + workflow + Profile all in-project.**
- **Correction — `ss` reclassified Core → plugin** ✅ 2026-07-08 — `ss` (Sync Seed) is ADO-specific (it already targets the plugin's MCP tools); it only shipped in the global set by accident. Moved `ISCI-Vision\.claude\skills\ss` → `Stratagem\plugins\stratagem-ado\skills\ss` (now `stratagem-ado:ss`; untracked in the Stratagem repo — commit later). **Core is now 23 skills.** Findings: the scrubbed `ss` uses `$env:STRATAGEM_ADO_*` — the *cleaner* pattern; its siblings `sp`/`pr` + `.mcp.json` still hardcode `intelliscience`/email/`Kanban` → a future **plugin-scrub**. Open: `STRATAGEM_ADO_*` lives per-project in `ISCI-Vision\settings.local.json`, but `ss` is now a global plugin skill → promote the env to a global home for cross-project use.

### Error Log
(none yet)

### PICA Log
| Task | Pattern | Audited | Issues | Action |
|------|---------|---------|--------|--------|
