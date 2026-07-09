---
type: index
sources: []
updated: 2026-06-26
tags:
  - status/active
  - scope/workflow
---

# Stratagem-Wiki Index

> **Summary.** Top-level entry point for the Stratagem AI coding workflow knowledge base. Every page is grouped by its §4.5.1 folder.

## Architecture (`wiki/architecture/`)

- [[configuration-hierarchy]] — global → project → Steward layer model
- [[index-first-retrieval]] — LLM-Wiki corpus-query mechanism (index → drill → link-walk → grep); not RAG, no embeddings
- [[autonomy-loop-and-budget-guard]] — two-path execution (interactive `/phx` vs unattended `/if` Workflow); first-class token budget (plan `## Budget:` / 750k default, 80% warn → reserve-floor halt, no silent caps); P4 integration gate + branch pre-flight; **P5 run-ledger + STATUS surface + cross-restart resume** (launcher/agents write — script has no fs/clock; 🔴→🟡)

## Patterns (`wiki/patterns/`)

- [[tracer-bullet-discipline]] — vertical-slice vs. horizontal-layer decisions
- [[counterpart-model]] — hold transformed *views* of gold docs, not copies; "allowed to differ" → no rot; `/rs` + `/crs` "one breath" refresh (gold-doc-scoped) keeps it honest
- [[wiki-graph-shape-contract]] — four-enforcement-point pattern for shared-vault artifact production; skill-as-generator invariant; closed tag vocabularies; Obsidian UX gotchas; **maintaining the contract** via change-coupling notes
- [[trust-but-verify-mid-task-gate]] — L/M auto-proceed, H escalate-inline; Decisions Made block + Adjust Protocol; complements `/cp` question-batch lockdown
- [[decision-ids-in-plans]] — stable numeric IDs (`D1`…) for locked decisions; cite on tasks; `/px` confirm becomes one-keystroke; surgical overrides + audit trail
- [[research-tool-routing-ladder]] — cheapest-tool-first routing; context7 over Tavily for libraries; Tavily endpoint ladder; one-search-at-a-time discipline
- [[verify-premise-before-building]] — falsify "the existing X already does Y" with a one-line grep before building against it; EX-001 case
- [[spike-to-retire-capability-uncertainty]] — when H-complexity stems from an unverified *capability*, a cheap throwaway spike confirms it before the full build; sibling of verify-premise (capability vs existence)
- [[literal-skill-composition]] — a chaining skill must invoke real sub-skills via the Skill tool, never inline/improv (else checklists + PICA silently skip); structurally enforced in a Workflow
- [[bundled-mcp-launcher-shim]] — CC plugin bundling an MCP that needs a user secret: `.mcp.json` can't read files, so a thin `node` launcher reads `${CLAUDE_PLUGIN_DATA}/secret` → env → execs the pinned server; ships no secret

## Anti-patterns (`wiki/anti-patterns/`)

- [[multi-stage-migration-pitfalls]] — AP-WF-1 Edit-cache invalidated by `mv`; AP-WF-2 concurrent-agent vault drift; AP-WF-3 silent table duplication; AP-WF-9 worklist scope trusted without point-of-build verification
- [[research-tool-misrouting]] — AP-WF-4 research-as-default; AP-WF-5 library questions bypassing context7; AP-WF-6 burst-firing parallel searches; AP-WF-7 MCP allow-list silently masks endpoints
- [[audit-glob-self-blindness]] — AP-WF-8 pattern-match enumeration as hidden contract; off-pattern files invisible to the audit (case-scope + folder-scope)
- [[scope-by-category-blindness]] — scoping a cross-cutting change to a named subset omits same-family members you didn't enumerate; EX-002 case (4-of-8 read-side skills)
- [[workflow-script-authoring-gotchas]] — six runtime defects that look like no-op success: AP-1 `meta` pure literal; AP-2 `args` may arrive JSON-string; AP-3 `budget.spent()` shared cumulative (baseline it); AP-4 empty task list skips post-loop stages; AP-5 string header values are truthy; AP-6 no clock (`Date.now()` throws — stamp via agents/launcher)
- [[forward-reference-comments-go-stale]] — a "Phase N will do X HERE" seam comment goes stale when a later decision overrules it; update at the resolving phase; caught by regression *reads*, not runs
- [[claude-code-plugin-bundled-mcp-gotchas]] — five bundled-MCP defects invisible to file-gates: AP-1 `spawn EINVAL` (`.cmd` needs `shell:true`); AP-2 the VSCode extension's minimal PATH lacks `npx`; AP-3 `.mcp.json` can't read files into env; AP-4 plugin MCP tools are plugin-namespaced; AP-5 uninstall leaves a `cache/` residue

## Retrospectives (`wiki/retrospectives/`)

- [[wiki-ingest-drift-prevention-upgrade]] — FEAT-WF-001 — 5 enhancements to `/wiki-ingest` (state-hash drift detection, duplicate pre-check, stray-file scan, `--backfill`, `--route-all`)
- [[wiki-skills-sync-symmetry]] — FEAT-WF-002 — `/wiki-ingest` ↔ `/wiki-graph-audit` perfect sync via mirrored §0 pre-flight, sync-note headers, shared-contract footer table, explicit change-coupling rule
- [[d5-counterpart-refresh-hook]] — FEAT-WF-003 — net-new D-5 "one breath" counterpart refresh in /rs + /crs; gold-doc-scoped; byte-identical guard via fence-marker + hash; corrects the false "hook exists" claim
- [[one-corpus-read-side]] — read-first wiring (8 skills) + research-capture path; two error cycles (EX-001 false premise, EX-002 coverage gap); zero new abstractions
- [[loop-engineering-phase1-verifier]] — Phase 1: self-assessed → tool-backed verifier gate (executed check + separate confirmer); 3-layer Verify guarantee; the `/phx`-improv defect → Task-7 anti-improv hardening
- [[loop-engineering-phase2-budget-guard]] — Phase 2: two-path model (interactive `/phx` vs unattended `/if` Workflow); first-class token budget (80% warn → reserve halt, no silent caps); the spike that de-risked Skill-in-Workflow; first `/if` smoke-test caught 3 bugs (ERR-1/2/3)
- [[stratagem-ado-plugin-scrub]] — made the ADO plugin portable: identity → one per-install `ado.config.json` home read by launcher + sp/pr/ss; org de-declarative evolution of [[bundled-mcp-launcher-shim]]; EX-001 — enumerated-grep-gate blind to same-family variants (`ISCI-SAAS`)

## Decisions (`wiki/decisions/`)

*(empty)*

## Plans (`wiki/plans/`)

*(empty)*

## Runbooks (`wiki/runbooks/`)

*(empty)*

## API (`wiki/api/`)

*(empty — N/A for workflow wiki)*

## Meta (`wiki/meta/`)

- [[stratagem]] — what the workflow system is and who runs it
- [[operating-modes]] — PF/CP/PX/AX/EX/FX/CF, MPX/MAX, PHX, PICA, RS/CRS catalog
- [[skill-catalog]] — full conformance contract: 7 `/sa` checks + filename rule + body-shape rules + `phx` exemption
- [[contradictions]] — known disagreements between sources (currently none)

## Gaps (forward-links worth filling)

- [[mcp-orchestration]] — preview-mode discipline, server boundaries
- [[gold-standard-docs]] — how `/rs` and `/crs` feed pattern docs
- [[steward-role]] — orchestrator vs. sub-agent boundary
- [[memory-system]] — `~/.claude/projects/*/memory/` patterns
- [[cp-question-batch-pattern]] — `/cp` step-7 numbered question batch (referenced by [[decision-ids-in-plans]])
- ~~[[wiki-graph-shape-contract]]~~ — **resolved 2026-05-28 (this RS)**
