# Ingest Log (Structured)

> Oldest first. Per-source structured entries. Use grep / table tools
> on this file when you want to answer "when did we last ingest a
> document about X?" or "what did the v12.4 doc ingest touch?"
>
> Format documented in `vault/CLAUDE.md` §6.

---

```markdown
---
source: <kit-init>
ingested: 2026-06-10
pages_created:
  - vault/CLAUDE.md
  - wiki/index.md
  - wiki/architecture/system-topology.md
  - wiki/meta/scopes.md
  - wiki/meta/glossary.md
  - wiki/meta/contradictions.md
  - wiki/meta/ingest-backlog.md
  - wiki/meta/component-page-template.md
  - wiki/meta/boundary-page-template.md
  - wiki/meta/layer-map-template.md
pages_updated: []
contradictions: 0
notes: |
  Bootstrap kit init — no raw source yet. First REAL ingest entry
  will follow after Phase 1 project survey.
---
```

```markdown
---
source: stratagem-core-bootstrap-ingest
ingested: 2026-07-10
pages_created:
  - wiki/architecture/ado-bridge.md
  - wiki/architecture/autonomy-loop.md
  - wiki/architecture/plugin-marketplace-distribution.md
  - wiki/architecture/skill-workflow-engine.md
  - wiki/architecture/system-topology.md
  - wiki/architecture/vault-knowledge-system.md
  - wiki/patterns/corpus-read-first.md
  - wiki/patterns/idempotency-and-skip-loud.md
  - wiki/patterns/neutral-board-seam.md
  - wiki/patterns/owner-identity-resolver.md
  - wiki/patterns/skill-shape.md
  - wiki/patterns/sync-id-linkage.md
  - wiki/patterns/two-path-model.md
  - wiki/patterns/verifier-contract.md
  - wiki/anti-patterns/direct-state-write-bypassing-seam.md
  - wiki/anti-patterns/hardcoded-home-paths.md
  - wiki/decisions/board-blind-core.md
  - wiki/decisions/plans-dir-lifecycle.md
  - wiki/decisions/plugin-distribution-model.md
  - wiki/decisions/workflow-auto-install-hook.md
  - wiki/api/autonomy-loop-args.md
  - wiki/api/board-sync-event-map.md
  - wiki/api/sp-field-contract.md
  - wiki/retrospectives/first-if-autonomy-run.md
  - wiki/retrospectives/install-and-skill-test-pass.md
pages_updated:
  - wiki/index.md            # rewritten as curated routing surface; type index -> meta
  - wiki/logs/CHANGELOG.md
  - "wiki/**/*.md"           # Related-section cross-link reconciliation across all 25 pages
contradictions: 0
notes: |
  Synthesis pass over the bootstrap ingest. Wrote the curated index,
  reconciled ~90 broken-alias/orphan [[links]] in Related sections to
  real basenames, and added the architecture->pattern/api/decision and
  retro->decision cross-links. §4.5 audit clean (frontmatter, folder=type,
  no duplicate basenames); only fix was index.md type index->meta.
  Residual body-prose red links to not-yet-created pages left as forward
  links (ss-sync-seed, pr-open-pull-request, operating-rules, budget-guard,
  literal-composition, plan-lifecycle, etc.).
---
```
