# Feature: /map — the lifecycle-map skill
## Created: 2026-07-24T06:34:21Z
## Status: In Progress
## Source PF: map-skill_260724_plan.html
## Tracer Bullet: NO
## Branch: tony/map-skill
## Spike-Sync-Id: null

> **CORRECTED SCOPE (2026-07-24).** Implementation home is the **strat-dist**: a single hand-authored file `plugins/stratagem-core/skills/map/SKILL.md` **inside this repo** (`c:\code\Stratagem`) — the *same* repo as this plan. The earlier `stratagem-core` framing was wrong: per `docs/DERIVATION.md` (D5), `strat-dist` is a **hand-derived snapshot, not a compiler output**; the compiler/`core`/`templates`/`golden` live in the separate `stratagem-core` repo and are **out of scope**. So there is **no compiler, no golden, no purity lint, no flavors, no vars, no drift test, no diff-harness**. `/map` is one directory-driven `SKILL.md`.

### Strategic Context

#### Problem Statement & Solution
No single command renders how the Stratagem skills chain together — the lifecycle lives only as prose + hand-drawn SVGs. **Solution:** a static reference skill `/map` shipped in the `sg` plugin that prints the lifecycle as ASCII — the spine diagram **plus** a grouped legend where every line is `/<cmd>  <Full Name>  <one-liner>` (acronym expansion shown, e.g. `/ps  Plan Seed`) — with a `--html` flag that writes a pre-authored `.html` context-swimlane. Static + deterministic — the skill **prints/copies literal content, it never generates** (the `um` ethos).

#### What's Already Built
| Component | Role | Location |
|-----------|------|----------|
| strat-dist `sg` plugin | the hand-authored distribution (21 skills, dir-driven) | `plugins/stratagem-core/skills/*/SKILL.md` |
| `um` skill | authoring model — clean frontmatter + inline banner, no `{{include}}`, no GENERATED header, emits nothing | `plugins/stratagem-core/skills/um/SKILL.md` |
| Marketplace `stratagem` | ships `sg` + `stratagem-tavily`; **board-neutral, stack-neutral** | `.claude-plugin/marketplace.json`, `docs/DERIVATION.md` |
| House visual language | 5-category color legend + emoji the `--html` block reuses | `docs/stratagem-testing-workflow.svg` |

#### Architecture Decisions
- **One hand-authored file, directory-driven.** `plugins/stratagem-core/skills/map/SKILL.md`. Claude Code discovers `skills/<name>/SKILL.md` automatically — no manifest/`plugin.json` edit. The `um` precedent.
- **Match the strat-dist convention exactly:** frontmatter (`name`/`description`/`argument-hint`) → `# MAP (Lifecycle Map)` → Purpose → `**Task:** $ARGUMENTS` → **inline** `**IMMEDIATELY display this banner:**` block → Instructions → Key Principles → Next. **No** `{{include:}}`, **no** session-preamble, **no** GENERATED header, **no** version-stamp line, **no** emit blocks (like `um`).
- **`STRATAGEM` title is literal and fine.** strat-dist neutralizes *stack* and *board* nouns only — the product is still Stratagem. Title = `STRATAGEM · lifecycle map`.
- **Board/stack-neutral content.** The map references only workflow-engine skills (all present in strat-dist); `/ss` (ADO) is **omitted** (Q5) — correct, since no board plugin ships here.
- **Fully static output — zero agent generation.** Both the ASCII and the `--html` page are **literal, byte-fixed content in `SKILL.md`**. `/map` prints the ASCII verbatim; `/map --html` writes the embedded HTML block verbatim to disk (**copy, not generate**). Deterministic by construction.
- **No drift guard (Q4).** Manually maintained, like the existing SVGs. Accepted.

#### Phase Strategy
Single phase — one authoring task + its structural gate. Too small to slice.

#### Entity/Component Notes
- **Same-repo now:** plan and code both under `c:\code\Stratagem` → the earlier cross-repo `/if` blocker is **gone**. (Two housekeeping items remain for any `/if` run: the repo is on `main`, and there's an untracked stray `claude-plugins-commands.html` in the root that a branch cut must not sweep in.)
- **ASCII output = card:** spine diagram + `/ax`-fail recovery loop + variant lanes + a grouped legend. Every skill line shows the **acronym expansion** then the one-liner. Groups: PLANNING / EXECUTION / RECOVERY / CLOSE·LEARN / VARIANT LANES / SUPPORTING. `/ss` omitted.
- **Name expansions** (authoring data, 17 skills): `/ps` Plan Seed · `/pf` Plan Features · `/cp` Create Plan · `/px` Plan Execute · `/ax` Authorize Execution · `/ex` Error Executing · `/fx` Fix Execution · `/cf` Complete Feature · `/rs` Retrospective Summary · `/mpx` Memory Plan Execute · `/max` Memory Authorize Execute · `/phx` Phase Execute · `/if` Implement Feature · `/rp` Read Plan · `/um` UpdateMe · `/pica` Post-Implementation Compliance Audit · `/crs` Conversation Retrospective.
- **`--html`** = a pre-authored context-swimlane, house palette + emoji (📋🔍🚀✅⚠️🔧), written verbatim to `docs/` (or a caller path), path echoed.

#### Dependencies
- None. A SKILL.md is plain markdown; no build, no packages, no tests infra in strat-dist.

#### Risk Assessment
| Risk | Mitigation |
|------|------------|
| Stray untracked `claude-plugins-commands.html` swept into a branch cut | Any branch cut adds only `skills/map/` + the plan folder; leave the stray file alone (or the operator removes/ignores it) |
| Map goes stale when a skill is renamed | Unguarded by design (Q4) — manual upkeep, like the SVGs |
| Divergence from upstream `stratagem-core` coder flavor (re-derivation could drop `/map`) | Out of scope per operator; noted — if wanted upstream too, add to `stratagem-core` separately (`docs/DERIVATION.md` re-derive) |

#### Open Design Decisions — RESOLVED 2026-07-24
All decisions locked.

| # | Decision | Resolved value |
|---|----------|----------------|
| 1 | Command name | `/map` |
| 2 | ASCII title string | `STRATAGEM · lifecycle map` |
| 3 | `--html` default output path | `docs/` (echo the written path) |
| 4 | Drift test | **DROPPED** — manual upkeep |
| 5 | Show `/ss` | **NO** — omitted (also correct: no board plugin in strat-dist) |
| 6 | Delete PF `.html` | **NO** — kept as historical |

#### Success Criteria
- `/map` prints the `STRATAGEM · lifecycle map` card (diagram + grouped legend with acronym expansions), then stops.
- `/map --html` writes the pre-authored `.html` swimlane to `docs/` (or a caller path), echoes the path.
- `plugins/stratagem-core/skills/map/SKILL.md` exists, is well-formed (frontmatter + inline banner + literal ASCII + literal HTML block), and matches the strat-dist convention (no `{{include}}`, no GENERATED header).

### Context Files
- `map-skill_260724_seed.html`: the originating seed
- `map-skill_260724_plan.html`: the PF plan (kept as historical; its compiler/flavor/golden framing is **superseded** by this `.md`)

### Task List

#### Plan-phase A — Author the skill
- [ ] Task 1: (Phase A) Author `plugins/stratagem-core/skills/map/SKILL.md`, matching the strat-dist convention (the `um` model). Frontmatter: `name: map`, `description: Lifecycle Map - print the Stratagem skill flow as an ASCII reference card; --html writes a swimlane page`, `argument-hint: "[--html [path]]"`. Body: `# MAP (Lifecycle Map)` + Purpose + `**Task:** $ARGUMENTS` + inline `**IMMEDIATELY display this banner:**` block + Instructions: (1) print the literal ASCII card verbatim — hardcoded `STRATAGEM · lifecycle map` title, spine `/ps→…→/rs`, `/ax`-fail recovery loop, variant lanes, grouped legend (`/<cmd>  <Full Name>  <one-liner>` per the name-expansion table; `/ss` omitted); (2) on `--html`, write the embedded literal HTML block (a fenced ```html context-swimlane, house palette + emoji) **verbatim** to a caller path defaulting under `docs/`, then echo the path — copy, never generate; + Key Principles (static, silent, deterministic, never explain) + Next. No `{{include}}`, no GENERATED header, no session-preamble.
  - Verify: `test -f plugins/stratagem-core/skills/map/SKILL.md && head -1 plugins/stratagem-core/skills/map/SKILL.md | grep -q '^---$' && grep -q '^name: map$' plugins/stratagem-core/skills/map/SKILL.md && grep -q 'STRATAGEM · lifecycle map' plugins/stratagem-core/skills/map/SKILL.md && grep -q 'Plan Seed' plugins/stratagem-core/skills/map/SKILL.md && grep -q '/mpx' plugins/stratagem-core/skills/map/SKILL.md && grep -qi '<!doctype html' plugins/stratagem-core/skills/map/SKILL.md && ! grep -q '{{include' plugins/stratagem-core/skills/map/SKILL.md`

### Completed Tasks
(none yet)

### Error Log
(none yet)

### PICA Log
| Task | Pattern | Audited | Issues | Action |
|------|---------|---------|--------|--------|

## Deferred Human Verification / Integration Tests
> Rendered terminal/HTML output is a human/runtime proof — worked once before `/cf`.
- [ ] HV1 (Phase A): Run `/map` → prints the `STRATAGEM · lifecycle map` card (diagram + recovery loop + variant lanes + grouped legend with acronym expansions), correctly aligned, then stops. — No shell can introspect rendered terminal output.
- [ ] HV2 (Phase A): Run `/map --html` → writes the pre-authored `.html` swimlane (house palette + emoji) to `docs/`, echoes the path, opens clean in a browser. — Rendered HTML is a human/visual proof.

## Integration-Verify: test -f plugins/stratagem-core/skills/map/SKILL.md && awk 'NR==1&&$0!="---"{exit 1} END{exit 0}' plugins/stratagem-core/skills/map/SKILL.md && grep -q 'STRATAGEM · lifecycle map' plugins/stratagem-core/skills/map/SKILL.md && grep -qi '<!doctype html' plugins/stratagem-core/skills/map/SKILL.md && ! grep -q '{{include' plugins/stratagem-core/skills/map/SKILL.md
