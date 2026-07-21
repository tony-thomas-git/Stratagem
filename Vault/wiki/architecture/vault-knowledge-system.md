---
type: architecture
sources: [pf/SKILL.md, cp/SKILL.md, stratagem-core-rules.md, stratagem-current-flow.md, CLAUDE.md]
code_sources:
  - "plugins/stratagem-core/skills/pf/SKILL.md@drTim/hardening"
  - "plugins/stratagem-core/skills/cp/SKILL.md@drTim/hardening"
  - "plugins/stratagem-core/stratagem-core-rules.md@v0.1.0"
updated: 2026-07-10
tags:
  - status/active
  - scope/vault
---

# Vault Knowledge System

> **Summary.** Every planning/execution skill consults a local **wiki vault before the web** via the shared **CORPUS-READ-FIRST** block: resolve the vault (`<git-root>/Vault`, else a sibling `<repo>-Vault`), read `wiki/index.md`, drill and link-walk the pattern mesh, grep as fallback, and only-on-miss fall through to the web/context7 ladder — depositing the cleaned finding into `<vault>/raw/` so the next query hits the cache. Feature work-products live in `Plans/` while active and (by intended convention) move to `Vault/raw/` on completion.

---

## 1. Why the vault is consulted first

CORPUS-READ-FIRST frames the vault as "a pre-built reasoning surface; the web is the fallback" — the skills "consult the local wiki corpus before reaching for web/context7" (code: `plugins/stratagem-core/skills/pf/SKILL.md:29`). The graph is curated ground truth for patterns and anti-patterns, so re-deriving from the web is the last resort, not the first move.

## 2. The CORPUS-READ-FIRST procedure

The block is a verbatim six-step routine (code: `plugins/stratagem-core/skills/pf/SKILL.md:30-35`):

1. **Resolve the vault.** `<project-root>\Vault` — the `Vault\` folder at the git root of the CWD. If absent, fall back to a **sibling-repo vault** `<project-root>-Vault` (git-root basename + `-Vault`) beside the repo — e.g. `ISCI-Vision` → `ISCI-Vision-Vault`. Use the first that exists; if neither does, no-op the block and fall through to normal research (no regression) (code: `plugins/stratagem-core/skills/pf/SKILL.md:30`).
2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]` + hook per entry).
3. **Drill.** Open the relevant linked pages whole — no chunking.
4. **Link-walk.** Follow wiki-links + backlinks across the pattern mesh as the question needs.
5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly.
6. **Only on miss** fall through to the web (Tavily) / context7 ladder — and that miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache, to be synthesized later via `/sg:wiki-ingest` (code: `plugins/stratagem-core/skills/pf/SKILL.md:35`).

The block is **change-coupled**: it is "duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`" and "all eight occurrences must remain identical" — any edit must be applied to all eight SKILL.md files in the same change (code: `plugins/stratagem-core/skills/pf/SKILL.md:27`).

## 3. Vault resolution by convention

Vault resolution is a **convention, not a registry**: the vault is "the `Vault\` folder at the git root of the current working directory (`<project-root>\Vault`). Exists → route knowledge through it (`/sg:wiki-ingest`); absent → fall back to `docs/patterns/*`. The folder's presence *is* the opt-in — no registration step" (code: `plugins/stratagem-core/stratagem-core-rules.md:325`). Per-vault scope tags live in each vault's own `meta/scopes.md`.

> **Known ambiguity (current impl).** CORPUS-READ-FIRST resolves `<git-root>/Vault` first while the Wiki Vault Resolution rule also allows a sibling-repo vault, and the flow doc logs "Vault-location ambiguity — CORPUS-READ-FIRST uses `<git-root>/Vault` but the authoritative vault may be a sibling repo" as an open gap (source: `stratagem-current-flow.md:211`). See [[neutral-board-seam]]-style seam pages and [[plan-lifecycle]] for related open items.

## 4. The three vault layers

The vault is a three-layer knowledge base (this file's schema, `<vault>/CLAUDE.md`):

- **`raw/`** — original sources, read-only; "every claim in the wiki must trace back to a file in `raw/`" (source: `CLAUDE.md`). CORPUS-READ-FIRST writes web/context7 misses here for later synthesis.
- **`wiki/`** — the interlinked knowledge base, one page per concept, `[[wiki-link]]`-connected, folder-taxonomy'd per the §4.5 shape contract.
- **`logs/`** — `CHANGELOG.md` + `ingest-log.md` activity records.

Vault edits are governed by [[fleet-aware-vault-editing]] — shape-contract changes gate before propagating across sibling vaults (code: `plugins/stratagem-core/stratagem-core-rules.md:149`).

## 5. The plan lifecycle: `Plans/` active → `Vault/raw` on complete

Feature work-products and the knowledge vault are **separate stores**:

- **While active**, every artifact for a feature lives together in the per-feature folder `<git-root>/Plans/<slug>/` — the `.md` execution plan, its context files, and the later `_completed.html` / `_retrospective.html` sidecars (code: `plugins/stratagem-core/skills/cp/SKILL.md:27`). Run-state (the `/sg:if` ledger) lives at `<plan-dir>/logs/<slug>.ledger.md`, next to the plan, **not** in the knowledge vault (source: `stratagem-current-flow.md:112`).
- **On completion**, the intended convention is that the finished plan folder moves `<git-root>/Plans/ → Vault/raw/` for synthesis + wiki linkage, feeding the next feature's CORPUS-READ-FIRST. The current flow marks this as a **future convention, not yet implemented** — "no step moves a finished plan `Plans/ → Vault/raw/`" is logged as an open gap (source: `stratagem-current-flow.md:140`, `:209`). *(inferred that `/cf` or `/rs` is the intended mover — the flow doc says "`/cf` or `/rs` should".)*
- **Retrospect** (`/sg:rs`) extracts learnings from a completed plan and applies updates to the wiki / gold-standard docs — the loop that keeps the corpus smarter for the next CORPUS-READ-FIRST (source: `stratagem-current-flow.md:152-154`).

So the arc is: **`Plans/<slug>/` (active work) → `Vault/raw/` (source of truth on complete) → `wiki/` (synthesized, via `/sg:wiki-ingest` + `/sg:rs`) → consulted first by CORPUS-READ-FIRST on the next feature.**

## Related

- **patterns** — [[corpus-read-first]] — the six-step vault-before-web block this system implements
- **decisions** — [[plans-dir-lifecycle]] — `Plans/` active → `Vault/raw/` on completion, the store this feeds
- **architecture** — [[skill-workflow-engine]] — the modes that run CORPUS-READ-FIRST · [[system-topology]] — where the vault sits among components
- [[scopes]] · [[ingest-backlog]] · [[index]]
