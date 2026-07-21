---
type: decision
sources: [stratagem-core-buildlog.md, stratagem-current-flow.md, plugins/stratagem-core/stratagem-core-rules.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/lifecycle
---

# Decision — Standardize the `Plans/` Directory & Completion Lifecycle

> **Summary.** Active plans live in per-feature folders under `<git-root>/Plans/<slug>/` (replacing three divergent path conventions). On completion, a plan folder moves `Plans/<slug>/ → Vault/raw/` for synthesis into the wiki. This is the hardening standardization — decided authoritatively 2026-07-09; the move-on-complete step is decided but not yet fully wired.

---

## 1. The problem — three divergent path conventions

During v0.1.0 skill testing the plans directory drifted across skills (source: stratagem-core-buildlog.md, Step 5.2 · Gaps):

- `/sg:px` and `/sg:ax` read the plan from **`<git-root>/Plans/`** (source: stratagem-core-buildlog.md, Step 5.2 `/sg:px` finding).
- `/sg:ps` / `/sg:pf` / `/sg:cp` said only "the plans directory" (ambiguous) → artifacts landed in the stale **`~/.claude/plans/`** (source: stratagem-core-buildlog.md, Step 5.2 `/sg:px` finding).
- `/sg:sp`'s default plan resolution said **`docs/plans/`** — "a **THIRD** path variant" (source: stratagem-core-buildlog.md, Step 5.2 `/sg:sp` finding).

Two (three) conventions in one plugin meant the same session's artifacts split across directories and had to be relocated by hand to continue.

## 2. The decision (authoritative, per user 2026-07-09)

Standardize on `<git-root>/Plans/` as the home of the **active** plan set (source: stratagem-core-buildlog.md, "FUTURE WORK — Plans/Seeds lifecycle convention (AUTHORITATIVE)"):

- Every Stratagem project always has **`Plans/.gitkeep`** and **`Vault/raw/`**.
- **Active plans live in per-feature FOLDERS** inside `<git-root>/Plans/` (e.g. `Plans/tt--render_mode_override_app/`) — the feature's seed + PF `.html` + CP `.md` co-located. Active plans stay in the repo → git-shareable, always beside the code.

**Lifecycle:** on completion a plan folder **moves OUT of `<git-root>/Plans/` (active) → `Vault/raw/`** for synthesis + raw linkage (feeds `/sg:wiki-ingest` / the graph). So `Plans/` = the *active* set; `Vault/raw/` = *finished*, awaiting synthesis (source: stratagem-core-buildlog.md, FUTURE WORK — Lifecycle).

## 3. Rationale

- **One convention, git-shareable, code-adjacent.** Active plans in the repo travel with the branch and review; the per-feature folder keeps seed + PF + CP together for a single unit of work (source: stratagem-core-buildlog.md, FUTURE WORK).
- **Feeds the second brain.** The completion move hands finished plans to `Vault/raw/`, the source-of-truth layer every wiki claim traces back to — closing the loop into `/sg:wiki-ingest` and the graph.

## 4. Work required to realize it

The standardization names four skill/scaffold changes (source: stratagem-core-buildlog.md, FUTURE WORK — Gap to fix):

1. `ps` / `pf` / `cp` must author into `<git-root>/Plans/<feature-folder>/` — not `~/.claude/plans/`.
2. Completion skills (`cf` / `rs`) must move the finished folder `Plans/ → Vault/raw/`.
3. Update project `CLAUDE.md` (still says `Plans: ~/.claude/plans/`).
4. Project bootstrap must scaffold `Plans/.gitkeep` + `Vault/raw/` as standard project shape.

## 5. Status — decided, partially wired

The completion move is confirmed **decided but not yet implemented**: the flow doc marks Phase 5 (`/sg:cf`) with "*(Future convention, not yet implemented: on completion the plan folder moves `<git-root>/Plans/ → Vault/raw/` for synthesis + wiki linkage.)*" (source: stratagem-current-flow.md, Phase 5), and both the path standardization and the completion move remain open items in the pre-north-star Gaps list (source: stratagem-current-flow.md, § Gaps). *(inferred)* the hardening PR #1748 touched only `plugins/*/skills/` (source: stratagem-core-buildlog.md, Step 9 footprint), so any authored-path fixes there would still need the `cf`/`rs` move and the `CLAUDE.md` / bootstrap changes to complete this decision.

## Related

- **architecture** — [[vault-knowledge-system]] — the `Plans/` → `Vault/raw/` → `wiki/` arc this decision wires · [[skill-workflow-engine]] — the `ps`/`pf`/`cp`/`cf`/`rs` modes that must change
- **anti-patterns** — [[hardcoded-home-paths]] — the three-convention drift this decision resolves
- **decisions** — [[plugin-distribution-model]] — the bootstrap/scaffold shape this depends on
- **retrospectives** — [[install-and-skill-test-pass]] — where the plans-dir drift was first observed
- [[scopes]]
