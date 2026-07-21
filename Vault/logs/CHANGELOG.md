# Wiki Changelog

> Newest first. Every ingest, every meaningful wiki restructure, and
> every contradiction-log resolution gets an entry. See
> `vault/CLAUDE.md` §6 for the entry format.

---

## 2026-07-19 — Rename `ado-board-config.md` → `board-config.md` (neutralize the board-config file)

- **Source:** N/A (structural rename — clean-core-distributable Task 9; the generic
  `tt/strat-dist` branch owns the neutral board-config contract).
- **Renamed:** `Vault/ado-board-config.md` → `Vault/board-config.md` (via `git mv`,
  history preserved). Neutralized the file's internals: title `ADO Board Configuration`
  → `Board Configuration`; tags `[ado, board, config]` → `[board, config]`; keys
  `## ADO-Project`/`## ADO-Area-Root`/`## ADO-Area-Default`/`## ADO-Iteration-Policy`/`## ADO-Areas`
  → `## Board-*` (aligns the file with `/cp`'s post-T7 read-path, which opens
  `<vault>/board-config.md` for `## Board-Areas` / `## Board-Area-Default` / `## Board-Project`);
  neutralized the intro + Notes prose (was "Consumed by `stratagem-ado` skills") to describe
  `/cp` + a separately-installed board adapter.
- **Repointed refs:** the filename token `ado-board-config.md` → `board-config.md` in
  [[sp-field-contract]] and [[system-topology]]; the two retrospectives
  ([[first-if-autonomy-run]], [[install-and-skill-test-pass]]) were reworded to drop the
  old filename truthfully — they name **ISCI-Vision's** separate-repo config file, which
  this task does not rename.
- **Fleet-check:** this vault only — the sibling ISCI-Vision-Vault is a different project
  and keeps its own `ado-board-config.md` (plan-resolved).
- **Contradictions:** none.
- **Notes:** Out of scope (left as-is): `## ADO-Project:` / `## ADO-Area:` header-name
  mentions inside [[system-topology]] and [[sp-field-contract]] (they describe the seam /
  upstream adapter's header vocabulary, not the renamed file), and `Plans/` + `docs/` plan
  artifacts that record the old filename historically.

## 2026-07-18 — Merge stratagem-core vault + reconcile to one scope-coherent vault

- **Source:** N/A (cross-repo merge — cherry-picked `stratagem-core` `6aec5ae`
  into Stratagem `tt/strat-dist` with `-X theirs`, no commit).
- **Created:** 41 files added from core's vault — architecture (6), api (3),
  decisions (4), patterns (8), anti-patterns (2), retrospectives (2), meta
  templates + `ado-board-config.md` + folder scaffolding.
- **Updated:** `wiki/index.md` rewritten as one routing surface over all 62
  wiki pages, folder-grouped and split by the two scopes now present
  (`scope/stratagem-core`, `scope/workflow`). 6 spine files were overwritten
  with core's versions during the merge (`CLAUDE.md`, `index.md`, this
  `CHANGELOG.md`, `ingest-log.md`, [[contradictions]], `.obsidian/graph.json`).
- **Reconciled (single-scope coherence):** broadened `scope/workflow` in
  [[scopes]] to its real dominant meaning — the whole workflow meta-system,
  41 pages (was defined narrowly as only the `/if` loop); corrected `CLAUDE.md`
  §1 identity from "second-brain for stratagem-core" to the two-scope Stratagem
  vault; added reciprocal twin cross-links [[system-topology]]↔[[stratagem]] and
  [[autonomy-loop]]↔[[autonomy-loop-and-budget-guard]].
- **Contradictions:** none newly logged. The two source vaults carry near-twin
  pages (whole-system overview, the `/if` loop, corpus retrieval, mode/skill
  catalog) — enumerated under the index's "Two scopes, twinned pages" section,
  kept separate pending a content-merge pass.
- **Notes:** Twins are **cross-linked, not hard-merged** — they are distinct
  implementation-vs-meta pages, so collapsing them would lose content
  (hard-merge available on request). Remaining nit: stray *prose* scope
  mentions from other projects (`scope/saas`, `scope/fogbom`, `scope/v…`) if a
  cleanup is wanted. Committed to `tt/strat-dist` this session.

## 2026-07-10 — Bootstrap ingest synthesis pass (25 wiki pages)

- **Source:** `stratagem-core-buildlog.md`, `stratagem-current-flow.md`,
  `README.md`, `INSTALL.md`, `.claude-plugin/marketplace.json`, and the
  `plugins/stratagem-core` + `plugins/stratagem-ado` SKILL.md / manifest /
  hook / launcher files (see per-page `sources:`).
- **Ingested:** 25 pages written by the ingest stage — architecture (6),
  patterns (8), anti-patterns (2), decisions (4), api (3),
  retrospectives (2).
- **Synthesis actions:**
  - Rewrote `wiki/index.md` as a curated routing surface (folder-grouped,
    one `[[link]]` + hook per page; frontmatter retyped `index → meta`).
  - Reconciled every page's `## Related` section to real basenames and
    added the missing directional cross-links (architecture → its
    patterns/api/decisions; retros → the decisions they revisit; pattern
    ↔ api ↔ anti-pattern meshes). ~90 broken-alias/orphan links repointed
    to existing pages across the 25 pages.
  - Fixed two inline orphan links in `api/board-sync-event-map.md`.
- **§4.5 audit:** all 25 content pages + 7 meta pages pass — required
  frontmatter present (type/sources/updated, a `status/*` and a `scope/*`
  tag each), folder matches type, no duplicate basenames vault-wide. Only
  fix needed was `index.md` type (`index → meta`).
- **Contradictions:** none.
- **Notes:** Residual **red links to pages that do not yet exist** remain
  in page *bodies* (e.g. `[[ss-sync-seed]]`, `[[pr-open-pull-request]]`,
  `[[operating-rules]]`, `[[budget-guard]]`, `[[literal-composition]]`,
  `[[plan-lifecycle]]`) — future ingest targets, left as forward links,
  not rewritten in prose.

## 2026-06-10 — Vault initialized from bootstrap kit

- **Source:** N/A (structural setup)
- **Created:** `vault/CLAUDE.md`, `wiki/index.md`,
  `wiki/architecture/system-topology.md` (draft skeleton),
  `wiki/meta/scopes.md`, `wiki/meta/glossary.md`,
  `wiki/meta/contradictions.md`, `wiki/meta/ingest-backlog.md`,
  `wiki/meta/component-page-template.md`,
  `wiki/meta/boundary-page-template.md`,
  `wiki/meta/layer-map-template.md`,
  `vault/.obsidian/graph.json`
- **Contradictions:** none
- **Notes:** Initial bootstrap from `vault-bootstrap-kit/`. The
  receiving AI agent should now read `AGENT-BRIEF.md` at the root
  of the kit and begin Phase 1 (project survey + system-topology
  population). Until the agent completes Phase 1, the vault is a
  skeleton; once Phase 1 is done, `system-topology.md` should be
  `status/active` and each major subsystem should have at least a
  draft architecture page.
