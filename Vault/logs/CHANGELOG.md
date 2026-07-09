# CHANGELOG

Running log of every ingest, newest first. See `CLAUDE.md` §6 for the
entry format.

---

## 2026-07-09 — stratagem-ado Plugin-Scrub learnings (/rs)
- **Source:** `stratagem-ado-plugin-scrub_260708_210440_plan.md` (completed — the portability scrub)
- **Created:** [[stratagem-ado-plugin-scrub]] (retrospective)
- **Updated:** [[bundled-mcp-launcher-shim]] (+"When identity is per-install" subsection + amended "org declarative" note + Related; +source; date bump), [[scope-by-category-blindness]] (+"Sibling instance — enumerated-literal verification gates (EX-001)" + Related; +source; date bump), [[index]] (1 new link under Retrospectives)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — source is a plan file, not a `<project>-docs/patterns/` gold doc; the two pattern/anti-pattern pages were edited directly (already vault-routed).
- **Notes:** Two learnings — (1) "org de-declarative" evolution of [[bundled-mcp-launcher-shim]] (per-install identity joins the secret in the data-dir config; `.mcp.json` stops naming it); (2) EX-001 — enumerated-literal grep gates are blind to same-family variants (`ISCI-SAAS` survived a gate scoped to `ISCI - Consolidated - Kanban`; caught by an adversarial completeness-critic), folded into [[scope-by-category-blindness]] as the verification-gate sibling. §0.2: `decisions/ plans/ runbooks/ api/` folders absent — not created (empty untracked dirs; they materialize on first routed page). Stray `README.md` at vault root noted (pre-existing).

## 2026-07-03 — Phase 2 retrospective page (/rs)
- **Source:** `phase2-budget-guard_260625_163229_plan.md` (completed Phase 2 plan)
- **Created:** [[loop-engineering-phase2-budget-guard]] (retrospective)
- **Updated:** [[index]] (1 new link under Retrospectives)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — source is a plan file, not a `<project>-docs/patterns/` gold doc.
- **Notes:** Second loop-engineering retro page (companion to [[loop-engineering-phase1-verifier]]). Pattern learnings were already captured — the P2 patterns ([[autonomy-loop-and-budget-guard]], [[spike-to-retire-capability-uncertainty]], [[workflow-script-authoring-gotchas]]) exist; this run only added the narrative and linked them. Ingested via the real `/wiki-ingest` per the updated `/rs` tool-substitution rule. Vault now flat (root `C:\code\docs\Stratagem-Wiki`).

## 2026-06-29 — Literal-composition generalized to tool substitution (/crs)
- **Source:** active conversation — corrective follow-up to the stratagem-ado `/rs` §7-log miss
- **Created:** none
- **Updated:** [[literal-skill-composition]] (+"Generalization — don't substitute a prescribed mechanism either" section + the stratagem-ado instance; +source; date bump)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — vault-native page edit; no `<project>-docs/patterns/` gold doc.
- **Fleet-Aware gate:** not fired — vault-local content + changelog only; no shape-contract files.
- **Notes:** Closes the loop on the prior entry's miss. The "invoke the real mechanism, don't substitute" principle already existed ([[literal-skill-composition]] + `/phx`'s LITERAL SKILL INVOCATION gate) — **extended** it from sub-skill inlining to *tool substitution* (`Write` vs `/wiki-ingest`) rather than spawning a new rule or memory. Also hardened `/rs` + `/crs` step 6 with a MANDATORY "invoke `/wiki-ingest`; don't author directly" gate (skill files — not vault content, not logged here). The mis-placed memory (`follow-explicit-instructions-no-substitution`) was deleted — wrong layer (project-scoped + machine-local → not portable).

## 2026-06-29 — Detachable ADO plugin learnings (/rs)
- **Source:** `stratagem-ado-plugin_260628_211148_plan.md` (completed — the detachable Stratagem↔ADO Claude Code plugin)
- **Created:** [[claude-code-plugin-bundled-mcp-gotchas]] (anti-pattern), [[bundled-mcp-launcher-shim]] (pattern)
- **Updated:** [[tracer-bullet-discipline]] (+"Environment-coupled defects" bullet + Related link), [[index]] (2 new links — Patterns + Anti-patterns)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — source is a plan file, not a `<project>-docs/patterns/` gold doc; the pattern page was edited directly (already vault-routed).
- **Fleet-Aware gate:** not fired — vault-local content + changelog only; no shape-contract files (`CLAUDE.md`, `.obsidian/*.json`, ingest/audit skills). `scope/workflow`, no propagation to product wikis.
- **Notes:** Pages were authored **directly** (Write) for content precision rather than via `/wiki-ingest` — which got pages + §4.5 frontmatter right (audit clean, 0 violations) but **bypassed this CHANGELOG/ingest-log append** (added retroactively; lesson: direct authoring must still run §7's log step). The harvest: five bundled-MCP defects on Windows that every file-gate (`node --check`, grep, verifier confirmer) passed and only the live tracer caught — `spawn EINVAL` (`.cmd` needs `shell:true`), the VSCode-extension minimal-PATH (`npx` unfound), plugin-namespaced MCP tools, the `cache/` uninstall residue — plus the D15 file-based-secret launcher-shim pattern. Reinforces tracer-bullet-discipline (live-on-target is the only gate for environment-coupled bugs).

## 2026-06-26 — Phase 3 bounded-recovery learnings (/rs)
- **Source:** `phase3-recovery-loop_260626_134136_plan.md` (completed Phase 3 plan)
- **Created:** [[forward-reference-comments-go-stale]] (anti-pattern)
- **Updated:** [[autonomy-loop-and-budget-guard]] (D7 refresh — bounded recovery + two halt semantics, recover-stage rewrite, sources/date bump), [[index]] (1 new anti-pattern link + date)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — source is a plan file, not a `<project>-docs/patterns/` gold doc; the architecture page was edited directly (already vault-routed).
- **Notes:** Discharges P3 Future-Work D7. The novel meta-learning (stale forward-reference seam comment, caught by a regression *read*, `phx/SKILL.md:140`) became the new anti-pattern page; the D2/D4 recovery mechanics folded into the existing architecture page.

## 2026-06-26 — Phase 1 retrospective page (/rs)
- **Source:** `phx-verifier_260625_125048_plan.md` (completed Phase 1 plan)
- **Created:** [[loop-engineering-phase1-verifier]] (retrospective)
- **Updated:** [[index]] (1 new link under Retrospectives)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — source is a plan file, not a `<project>-docs/patterns/` gold doc.
- **Notes:** Re-run of `/rs` after the Stratagem-Wiki was registered + flattened (`vault/` layer dropped → root is `C:\code\docs\Stratagem-Wiki`). The pattern learnings were already captured in the pre-registration run ([[literal-skill-composition]] etc.), so this run only added the missing *retrospective narrative* page. The page I first wrote landed in the stale `vault/wiki/` during the concurrent restructure and was moved to the correct `wiki/retrospectives/`; Steward CLAUDE.md vault paths were corrected (dropped `\vault`).

## 2026-06-25 — Phase 1+2 loop-engineering learnings (/max backfill from Steward CLAUDE.md)
- **Source:** `C:\code\Steward\CLAUDE.md` — four learnings promoted from the P1/P2 loop-engineering retros
- **Created:** [[literal-skill-composition]] (pattern), [[autonomy-loop-and-budget-guard]] (architecture), [[spike-to-retire-capability-uncertainty]] (pattern), [[workflow-script-authoring-gotchas]] (anti-pattern)
- **Updated:** [[index]] (4 new links)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — source is Steward CLAUDE.md (meta-system gold doc), not a `<project>-docs/patterns/` gold doc with a vault counterpart.
- **Fleet-Aware gate:** not fired — vault-local page creation + changelog; no shape-contract files. (Vault was newly registered in the Steward Wiki Registry this session: `Steward → …\Stratagem-Wiki\vault`, scope/workflow.)
- **Notes:** First backfill into the newly-registered Stratagem-Wiki — captures the P1 verifier / literal-composition and P2 autonomy-loop / budget-guard / spike / Workflow-gotchas learnings as interlinked pages instead of accreting in CLAUDE.md. The spike page is a sibling of [[verify-premise-before-building]] (capability vs existence). The three gotchas were unmasked by the first real `/if` smoke-test run.

## 2026-06-16 — Seed-currency verification + refresh discipline (/crs)
- **Source:** `/crs` (active conversation, no plan file) — verifying + refreshing the one-corpus seed before `/pf`
- **Created:** none
- **Updated:** [[verify-premise-before-building]] (+"Sibling check — document currency before /pf or /rp" + "Refresh, don't rewrite" sections; +seed to `sources:`)
- **Contradictions:** none
- **D-5 counterpart refresh:** none — no gold doc under `<project>-docs/patterns/` updated; vault-native page edit.
- **Fleet-Aware gate:** not fired — vault-local content + changelog only; no shape-contract files.
- **Notes:** Extends the EX-001 premise-falsification page with its sibling: verifying a *whole seed/plan's* currency (intention/scope/facts) before building from it, + the refresh-don't-rewrite overlay technique (STATUS banner + inline RESOLVED/UPDATED tags + superseded-as-historical). Real instance: the one-corpus seed, refreshed in place after its prerequisite (Two-Vault Reconciliation) completed. No new page — it's a sibling of an existing one (no-new-abstraction). Audit clean. Evidence on duplicate-hygiene + verify-scope deliberately not proposed (minor / already captured).

## 2026-06-16 — One-corpus read-side retrospective (/rs)
- **Source:** `/rs` over `one-corpus-ai-first_260615_204202_plan.md` (Features A/B + EX-001, EX-002)
- **Created:** [[verify-premise-before-building]] (pattern), [[scope-by-category-blindness]] (anti-pattern), [[one-corpus-read-side]] (retrospective)
- **Updated:** [[wiki-skills-sync-symmetry]] (second/third prose-DRY instances + membership-couples-sync-note lesson), [[index]] (3 new links)
- **Contradictions:** none
- **D-5 counterpart refresh:** none fired — all targets are vault-native pages; no gold doc under `<project>-docs/patterns/` with a counterpart was updated.
- **Fleet-Aware gate:** not fired — vault-local content + changelog only; no shape-contract files.
- **Notes:** Two error-cycle learnings (EX-001 false premise, EX-002 coverage gap) became durable pages. Prose-DRY discipline reused twice this session (D-5 guard, CORPUS-READ-FIRST) — recorded as instances 2 and 3 on the sync-symmetry page. No new abstractions.

## 2026-06-15 — D-5 counterpart-refresh hook build (FEAT-WF-003)
- **Source:** `/crs` (active conversation, no plan file) — building + testing the D-5 hook per handoff `260615_213932_handoff_feature-c-d5-counterpart-hook.md`
- **Created:** [[d5-counterpart-refresh-hook]]
- **Updated:** [[counterpart-model]] (D-5 section rewritten + `updated:` bumped), [[index]] (retrospectives list + counterpart-model hook)
- **Contradictions:** **reconciled** — [[counterpart-model]] previously asserted the D-5 hook existed and "`/rs` owns this." That claim was false (the hook was never built); this session built it net-new in `/rs` + `/crs`, making the claim true. The page now reflects the gold-doc-scoped, dual-skill reality.
- **Fleet-Aware gate:** not fired — all edits are vault-local content + the §8 changelog; no shape-contract files (`CLAUDE.md`, `.obsidian/*.json`, ingest/audit skills) touched. Workflow scope, no propagation to product wikis.
- **Notes:** Guard criteria are byte-identical across `/rs` and `/crs` step 6 (HTML-comment fence + `sha256` `0236a3cc…`). Live re-render/audit deferred; validated by decision-logic simulation against the live ISCI-Web-App-Wiki (13 eligible / 15 plan-skipped / 0 broken parents). Outstanding follow-ups (out of `/crs` scope): the one-corpus seed banner and `counterpart-model-vault-rot-killer` auto-memory still assert the hook pre-existed.

## 2026-06-15 — Index-first retrieval (research capture tracer)
- **Source:** `raw/research/karpathy-llm-wiki-index-first-retrieval.md`
- **Created:** [[index-first-retrieval]]
- **Updated:** [[index]]
- **Contradictions:** none
- **Notes:** First node via the one-corpus research-capture path (Feature B tracer round-trip). Karpathy LLM-Wiki index-first mechanism; complements [[research-tool-routing-ladder]] (corpus-first, web on miss).

---

## 2026-06-14 — Deferred 4d build: decision-ids-in-plans (the re-routed workflow pattern)
- **Source:** live external gold doc — `Decision-IDs-in-Plans-Pattern.md` (titled "...Workflow Pattern")
- **Created:** [[decision-ids-in-plans]] (`patterns/` — stable `D#` IDs for locked decisions, cited on tasks)
- **Updated:** [[index]] (new pattern entry + `cp-question-batch-pattern` added to Gaps)
- **Contradictions:** none
- **Notes:** Closes the last open thread of the Two-Vault Reconciliation. This gold doc was Task 4d — originally on the ISCI worklist, re-routed to Stratagem-Wiki because it's `/pf→/cp→/px→/ax` methodology (workflow scope), not Portal domain (Task-1's 3rd worklist correction). Now built as a `scope/workflow` counterpart. Terse, gold-sourced, audit-clean: type→folder ✓, 3/4 links resolve + 1 intentional forward-gap (`cp-question-batch-pattern`, tracked in Gaps), not orphan, no scope/v1. Complements [[trust-but-verify-mid-task-gate]] (up-front lock vs mid-task gate).

## 2026-06-14 — Vault-reconciliation /rs: learnings ingest (1 new pattern + 2 anti-pattern extensions)
- **Source:** `/rs` retrospective of `vault-reconciliation_260614_154025_plan.md` (workflow-scope → Stratagem-Wiki default)
- **Created:** [[counterpart-model]] (`patterns/` — transformed-view-not-copy architecture; the rot-killer)
- **Updated:** [[multi-stage-migration-pitfalls]] (+AP-WF-9: worklist scope trusted without point-of-build verification), [[audit-glob-self-blindness]] (+folder-scope cousin: the filter-architecture phantom), [[index]] (new pattern entry + 2 AP-WF row updates)
- **Contradictions:** none
- **Notes:** Three highest-value learnings from the two-vault reconciliation. The Counterpart Model earned a new page (no prior home) — it's the architectural core that dissolved copy-rot. AP-WF-9 captures the 6 Task-1 worklist corrections (titles don't signal scope; verify at point-of-build) with the V2-only binding rule as through-line. The folder-scope phantom extends the existing audit-glob meta-anti-pattern. Audit clean: new node §4.5-conformant, 0 new orphans, no scope/v1 tags. D-5 counterpart-refresh: none (no project gold-doc canon updated — vault pages only). Fleet-Aware gate did not fire (vault-local page content).

## 2026-06-14 — Vault-reconciliation Phase S (S-0/S-1/S-2): freshness pass — STRATAGEM ALIGNED
- **Source:** internal freshness reconciliation — drift scan of all 15 nodes vs current `c:\code\Steward\CLAUDE.md` + skill files (no external ingest)
- **Created:** none
- **Updated:** [[configuration-hierarchy]] (+Wiki Registry section, +Fleet-Aware editing gate section), [[stratagem]] (compounding-learning bullet → live wiki routing; +Knowledge Vaults section), [[wiki-graph-shape-contract]] (+2026-06-14 contract-amendment worked example: §4.5.4 kebab-permissive + §4.5.3 scope/v1 removed), [[operating-modes]] (/ps corrected → global skill producing `.html` seed)
- **Contradictions:** none
- **Notes:** Phase S of the two-vault reconciliation. S-0 drift scan flagged 5, resolved to 4 stale at execution (`skill-catalog` dropped — it's the `/sa` conformance contract, keeps no roster; `/ps` conforms cleanly, so "missing /ps" was a category error). All 4 fixes were surgical (drift additive, not wholesale — no ingest-regen). NOT stale (verified current): trust-but-verify-mid-task-gate (has full L/M/H ranking + self-validation), tracer-bullet-discipline (topic untouched), the 06-12 research-tool/audit nodes, the migration retrospectives. S-2 audit: 5/5 categories clean (the lone `scope/v1` grep-hit is documentation prose in wiki-graph-shape-contract's worked example, not a frontmatter tag). All edits vault-local page content → Fleet-Aware gate did not fire. **Stratagem-Wiki ALIGNED. Both vaults now aligned → one-corpus steady-state loop unblocked.**

## 2026-06-12 — Research-tool routing rule + `/sa` conformance lessons
- **Source:** `/crs` conversation retrospective — Tavily quota-limit incident triggered investigation of skill-level Tavily usage; `/sa` audit surfaced 4 conformance gaps; meta-anti-pattern surfaced when SA's own glob missed `fx/skill.md` (lowercase). See `C:\code\docs\Steward-docs\Plans\conversation_tavily-routing-sa-conformance_260612_000800_retrospective.md`.
- **Created:** [[research-tool-routing-ladder]], [[research-tool-misrouting]], [[audit-glob-self-blindness]]
- **Updated:** [[skill-catalog]] (stub → full conformance contract), [[contradictions]] (first resolved entry), [[index]] (3 new entries, un-stub skill-catalog)
- **Contradictions:** 1 resolved — see [[contradictions#skill-template-next-vs-key-principles]]
- **Notes:** Routing rule introduces 6th canonical pattern page; misrouting and audit-glob blindness extend the anti-pattern numbering to AP-WF-8. Fleet-Aware gate evaluated: vault-local content only, no propagation to product wikis (these are workflow patterns, out of scope for ISCI-Web-App-Wiki / future SAAS-Wiki / FogBOM-Wiki).

## 2026-05-29 — Vault-infra: exclude `logs/` from Obsidian graph
- **Source:** mPX→mAX (in-memory, no plan file). User observation that `logs/CHANGELOG.md` is a §8-mandated hub that dominates the graph view as a priori central, adding noise.
- **Updated:** `.obsidian/app.json` — set `userIgnoreFilters: ["logs/"]` to globally exclude the `logs/` directory from Obsidian graph, search, and quick switcher
- **Fleet-Aware gate:** fired and answered (`apply to siblings`); identical edit applied to ISCI-Web-App-Wiki vault in the same round
- **Contradictions:** none
- **Notes:** §8 requires CHANGELOG as a per-round hub for provenance (every page links back via `appended on R{N}`). That contract is preserved — only the graph *display* is suppressed. CHANGELOG is still readable and still the canonical append-only log. User note recorded for future refinement of Fleet-Aware Vault Editing rule: the rule treats `app.json` as a blanket fleet-sync trigger, which over-fires on purely cosmetic edits (theme toggles) but is the correct safe default — over-fire costs one user message, under-fire costs silent drift.

## 2026-05-27 — Stratagem-Wiki seed ingest
- **Source:** `Steward-CLAUDE.md`, `🪙Steward-Patterns.md`, `testing-philosophy-v3.md`, `hooks-registry.md`, `mpx-hard-stop_260225_retrospective.md` (initial corpus from Steward-docs)
- **Created:** [[stratagem]], [[operating-modes]], [[configuration-hierarchy]], [[tracer-bullet-discipline]], [[contradictions]]
- **Updated:** [[index]] (created)
- **Contradictions:** none
- **Notes:** Initial seed for the Stratagem-Wiki. Forked from LLM-WIKI; §1 purpose rewritten for Stratagem scope. Seeded 5 concept pages plus index and contradictions placeholder.
