---
type: pattern
sources: [pf/SKILL.md, cp/SKILL.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/vault
---

# CORPUS-READ-FIRST

> **Summary.** A six-step "consult the local wiki vault before reaching for web/context7" protocol embedded **verbatim** in eight skills (`/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`). The vault graph is a pre-built reasoning surface; the web is the fallback. The eight copies are change-coupled by an explicit sync note that declares them a single source of truth.

---

## 1. What it is

`CORPUS-READ-FIRST` is a marked block (`★ CORPUS-READ-FIRST`) that appears inside the `**Instructions:**` of every planning/execution skill. Its rule: *"Consult the local wiki corpus before reaching for web/context7 — the graph is a pre-built reasoning surface; the web is the fallback."* (code: `plugins/stratagem-core/skills/pf/SKILL.md:L29`; code: `plugins/stratagem-core/skills/cp/SKILL.md:L67`).

## 2. The six steps

The ladder, in order (code: `skills/pf/SKILL.md:L30-L35`; code: `skills/cp/SKILL.md:L68-L73`):

1. **Resolve the vault.** The vault is `<project-root>\Vault` — the `Vault\` folder at the git root of CWD. If absent, fall back to a **sibling-repo vault** `<project-root>-Vault` (git-root basename + `-Vault`) — e.g. `ISCI-Vision` → `ISCI-Vision-Vault`. Use the first that exists; if neither does, **no-op the block** and fall through to normal research (no regression) (code: `skills/pf/SKILL.md:L30`).
2. **Index-first.** Open `<vault>/wiki/index.md` — the curated routing surface (frontmatter-tagged, folder-grouped, `[[link]]`+hook per entry) (code: `skills/pf/SKILL.md:L31`).
3. **Drill.** Open the relevant linked pages whole — no chunking (code: `skills/pf/SKILL.md:L32`).
4. **Link-walk.** Follow wiki-links + backlinks across the feature-pattern mesh as the question needs (code: `skills/pf/SKILL.md:L33`).
5. **Grep fallback.** ripgrep over `<vault>/wiki/**/*.md` only if the index doesn't route cleanly (code: `skills/pf/SKILL.md:L34`).
6. **Only on miss** fall through to the web/context7 ladder. A miss is the signal to deposit the cleaned finding into `<vault>/raw/research/` (web) or `<vault>/raw/library-docs/` (context7) so the next query hits the cache — later synthesized via `/wiki-ingest` (code: `skills/pf/SKILL.md:L35`).

The vault-resolution rule (step 1) is the same project→vault convention used across the plugin (see [[wiki-vault-resolution]]).

## 3. Change-coupling — one source of truth, eight copies

Each copy is prefixed with an identical **sync note**:

> *"This `CORPUS-READ-FIRST` block is duplicated verbatim in `/pf`, `/cp`, `/px`, `/ax`, `/ex`, `/fx`, `/mpx`, `/max`. **Change-coupling:** any edit here must be applied to all eight SKILL.md files in the same change. **Single source of truth: all eight occurrences must remain identical.**"* (code: `skills/pf/SKILL.md:L27`; code: `skills/cp/SKILL.md:L65`).

The block is prose (not code-factorable across separate skill files), so the invariant is maintained by discipline, not by a shared import — the sync note is the contract that keeps the eight copies from drifting. This is the same fleet-wide duplication problem the [[fleet-aware-vault-editing]] rule addresses for vault config files.

## 4. Per-skill tailoring

The block body is verbatim, but each host skill adds a one-line framing for its own phase — the shared block sits inside skill-specific instructions:

- `/pf` uses it in its **Research Phase**, before codebase/web research (code: `skills/pf/SKILL.md:L26`).
- `/cp` uses it in **Task Breakdown** to "pull known patterns before decomposing," so the decomposition reuses known shapes instead of re-deriving them (code: `skills/cp/SKILL.md:L64`, `L75`).

## 5. Why vault-first

The protocol encodes the plugin's research-routing philosophy: *always pick the cheapest tool that answers the question*, and treat the curated wiki graph as cheaper and higher-signal than a fresh web/context7 round-trip (code: `skills/pf/SKILL.md:L29`). The cache-deposit step (6) is a feedback loop — every external miss seeds the vault so the corpus monotonically improves.

## Related

- [[skill-shape]] — the canonical SKILL.md layout this block lives inside
- [[vault-knowledge-system]] — the architecture page: vault resolution, the raw/wiki/logs layers, and the cache-deposit loop
- [[skill-workflow-engine]] — the eight modes that carry this block verbatim
- [[scopes]] — tag vocabulary for the pages this block routes to
