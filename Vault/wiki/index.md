---
type: meta
sources: []
updated: 2026-07-18
tags:
  - status/active
  - scope/meta
---

# Stratagem — Wiki Index

> **Summary.** Single routing surface for the merged Stratagem vault. It now
> holds **two scopes of the same system**: the `stratagem-core` implementation
> second-brain (`scope/stratagem-core` — how the marketplace, plugins, and
> neutral seam are *built*) and the workflow meta-system knowledge base
> (`scope/workflow` — how we *work*: operating modes, skills, loop engineering).
> New here? Start with [[system-topology]] (core) or [[stratagem]] (meta), then
> [[skill-workflow-engine]]. Folder = graph color group (see [[scopes]]).

## Start here

- [[system-topology]] — top-down map of the built system (marketplace → two plugins → neutral seam) · `core`
- [[stratagem]] — what the workflow meta-system is and who runs it · `workflow`
- [[skill-workflow-engine]] — the `/sg:*` operating modes and the seed→plan→execute→retrospect lifecycle
- [[scopes]] — the `scope/*` + `status/*` tag vocabulary every page carries
- [[glossary]] — project-specific terms

## Two scopes, twinned pages

The two source vaults describe the same system at different altitudes, so a few
pages are near-twins — kept separate (implementation vs. meta-design view):

- [[system-topology]] `core` ≈ [[stratagem]] `workflow` — whole-system overview
- [[autonomy-loop]] `core` ≈ [[autonomy-loop-and-budget-guard]] `workflow` — the `/if` loop
- [[vault-knowledge-system]] + [[corpus-read-first]] `core` ≈ [[index-first-retrieval]] + [[research-tool-routing-ladder]] `workflow` — corpus retrieval
- [[skill-workflow-engine]] `core` ≈ [[operating-modes]] + [[skill-catalog]] `workflow` — the mode/skill catalog

*(Content-merging the twins is a separate pass; this index only unifies routing.)*

## Architecture (the WHAT) — `architecture/`

Components and subsystems — the system's anatomy.

**`core`**
- [[system-topology]] — marketplace, the two plugins, and the seam that joins them
- [[skill-workflow-engine]] — 21 operating-mode skills shaped as `SKILL.md`, composing into canonical chains
- [[autonomy-loop]] — `/sg:if`: the unattended launcher + pure Workflow script running `px→ax→verify→(ex→fx)` under a budget
- [[vault-knowledge-system]] — CORPUS-READ-FIRST: consult the local wiki before the web; the raw/wiki/logs three-layer store
- [[plugin-marketplace-distribution]] — the `stratagem` marketplace, install/dev loop, and the SessionStart workflow-sync hook
- [[ado-bridge]] — the detachable `stratagem-ado` plugin: four skills, a bundled MCP launcher, per-install secret + identity

**`workflow`**
- [[stratagem]] — what the workflow system is and who runs it
- [[configuration-hierarchy]] — global → project → Steward layer model
- [[autonomy-loop-and-budget-guard]] — two-path execution (interactive `/phx` vs unattended `/if`) + first-class token budget
- [[index-first-retrieval]] — LLM-Wiki corpus-query mechanism (index → drill → link-walk → grep); not RAG, no embeddings

## Patterns (the HOW) — `patterns/`

Conventions and idioms deliberately reused.

**`core`**
- [[skill-shape]] — the seven-point `SKILL.md` layout `/sa` enforces
- [[corpus-read-first]] — the six-step vault-before-web block duplicated verbatim in eight skills
- [[two-path-model]] — a locked plan runs manual (`/phx`) or unattended (`/if`) over the same per-task contract
- [[verifier-contract]] — per-task `Verify:` + plan-level `## Integration-Verify:`, both pre-flight HALTs
- [[neutral-board-seam]] — the board-blind `{event, syncId, task}` boundary between core and any tracker
- [[sync-id-linkage]] — deliberately-generic `Sync-Id:` markers so core reads board linkage with zero ADO awareness
- [[idempotency-and-skip-loud]] — create-once + best-effort telemetry: the board is a mirror, never a gate
- [[owner-identity-resolver]] — validate the config `owner`, self-heal to the PAT identity, warn — never silent-replace

**`workflow`**
- [[tracer-bullet-discipline]] — vertical-slice vs. horizontal-layer decisions
- [[trust-but-verify-mid-task-gate]] — L/M auto-proceed, H escalate-inline; Decisions Made block + Adjust Protocol
- [[counterpart-model]] — hold transformed *views* of gold docs, not copies; `/rs` "one breath" refresh kills rot
- [[decision-ids-in-plans]] — stable numeric IDs (`D1`…) for locked decisions; one-keystroke `/px` confirm
- [[research-tool-routing-ladder]] — cheapest-tool-first; context7 over Tavily for libraries; one-search-at-a-time
- [[verify-premise-before-building]] — falsify "the existing X already does Y" with a one-line grep first
- [[spike-to-retire-capability-uncertainty]] — a cheap throwaway spike confirms an unverified capability before the full build
- [[literal-skill-composition]] — a chaining skill invokes real sub-skills via the Skill tool, never inline/improv
- [[bundled-mcp-launcher-shim]] — a thin `node` launcher reads a per-install secret → env → execs the pinned MCP; ships no secret
- [[wiki-graph-shape-contract]] — the four-enforcement-point pattern for shared-vault artifact production

## Anti-patterns (what was REJECTED) — `anti-patterns/`

Approaches deliberately ruled out and why.

**`core`**
- [[direct-state-write-bypassing-seam]] — writing `System.State` outside `board-sync` forks the single source of transitions
- [[hardcoded-home-paths]] — `~/.claude/...` assumptions broke under the plugin model; use `${CLAUDE_PLUGIN_ROOT}` + `<git-root>/Plans`

**`workflow`**
- [[multi-stage-migration-pitfalls]] — Edit-cache invalidated by `mv`; concurrent-agent vault drift; silent table dup; unverified worklist scope
- [[research-tool-misrouting]] — research-as-default; library questions bypassing context7; burst-firing searches; MCP allow-list masking
- [[audit-glob-self-blindness]] — pattern-match enumeration as a hidden contract; off-pattern files invisible to the audit
- [[scope-by-category-blindness]] — scoping a cross-cutting change to a named subset omits same-family members you didn't enumerate
- [[workflow-script-authoring-gotchas]] — six Workflow runtime defects that look like no-op success (meta-literal, args-string, budget baseline, empty-list, truthy headers, no clock)
- [[forward-reference-comments-go-stale]] — a "Phase N will do X HERE" seam comment goes stale; update at the resolving phase
- [[claude-code-plugin-bundled-mcp-gotchas]] — five bundled-MCP defects invisible to file-gates (spawn EINVAL, minimal PATH, `.mcp.json` env, namespacing, uninstall residue)

## Decisions (the WHY, forward-looking) — `decisions/`

Chosen approaches with rationale. *(all `core`)*

- [[board-blind-core]] — core `sg` names no ADO; every board concept lives behind the neutral seam
- [[plugin-distribution-model]] — ship as a Claude Code plugin marketplace, not loose `~/.claude/` skill files
- [[workflow-auto-install-hook]] — a SessionStart hook syncs `autonomy-loop.js` per project (plugins can't register Workflows)
- [[plans-dir-lifecycle]] — standardize active plans in `<git-root>/Plans/<slug>/`, moving to `Vault/raw/` on completion

## API contracts (the SURFACES) — `api/`

Exact signatures of each component's public face. *(all `core`)*

- [[autonomy-loop-args]] — the `{planPath, taskNumbers, budget, branch, integrationVerify, ledgerPath, boardSync}` the launcher hands the Workflow
- [[board-sync-event-map]] — `{event, syncId, task}` → one `System.State` transition; skip-loud, `Reason` auto-derived
- [[sp-field-contract]] — what `/sp` sets, prompts, and leaves unset when it creates a Feature + child Stories

## Retrospectives (the WHY, backward-looking) — `retrospectives/`

What happened after execution, what was learned.

**`core`**
- [[install-and-skill-test-pass]] — clean-machine v0.1.0 install + 10-skill live-board verification, four findings captured
- [[first-if-autonomy-run]] — first cross-repo `/sg:if` dogfood: 12 tasks, 25 agents, 0 errors, invariant-respecting diffs

**`workflow`**
- [[loop-engineering-phase1-verifier]] — self-assessed → tool-backed verifier gate (executed check + separate confirmer); 3-layer Verify guarantee
- [[loop-engineering-phase2-budget-guard]] — two-path model + first-class token budget; the Skill-in-Workflow spike; first `/if` smoke-test caught 3 bugs
- [[stratagem-ado-plugin-scrub]] — made the ADO plugin portable: one per-install `ado.config.json`; same-family grep-gate blindness
- [[wiki-ingest-drift-prevention-upgrade]] — 5 `/wiki-ingest` enhancements (state-hash drift, dup pre-check, stray-file scan, `--backfill`, `--route-all`)
- [[wiki-skills-sync-symmetry]] — `/wiki-ingest` ↔ `/wiki-graph-audit` perfect sync via mirrored pre-flight + shared-contract footer
- [[d5-counterpart-refresh-hook]] — net-new D-5 "one breath" counterpart refresh in `/rs` + `/crs`; byte-identical guard
- [[one-corpus-read-side]] — read-first wiring (8 skills) + research-capture path; two error cycles (EX-001, EX-002)

## Meta — `meta/`

Index, scope vocabulary, templates, contradictions log.

- [[scopes]] — tag vocabulary (`scope/*`, `status/*`, supplementary axes)
- [[glossary]] — concept vocabulary
- [[operating-modes]] — `PF`/`CP`/`PX`/`AX`/`EX`/`FX`/`CF`, `MPX`/`MAX`, `PHX`, `PICA`, `RS`/`CRS` catalog · `workflow`
- [[skill-catalog]] — conformance contract: 7 `/sa` checks + filename rule + body-shape rules · `workflow`
- [[ingest-backlog]] — pending `raw/` sources to process
- [[contradictions]] — flagged source conflicts log
- [[component-page-template]] · [[boundary-page-template]] · [[layer-map-template]] — page-shape templates

---

## Note for the agent

This index lists **landing pages**, folder-grouped, one hook per page. Two scopes
now coexist (`scope/stratagem-core`, `scope/workflow`); keep new pages under the
right folder + scope, and add an entry here. Keep this file under ~200 lines — it
is a navigation surface, not a file listing. Open follow-ups from the merge:
merge the twinned pages, reconcile [[scopes]] to document `scope/workflow`, and
unify the two `CLAUDE.md` schemas if the vault is to run single-scope.
