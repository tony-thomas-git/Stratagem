---
type: anti-pattern
sources: [stratagem-core-buildlog.md, SKILL.md (stratagem-ado/sp)]
updated: 2026-07-10
tags:
  - status/active
  - scope/stratagem-core
  - risk/upstream-drift
---

# Anti-Pattern: Hard-Coded `~/.claude` Home Paths (Skills That Assume the Pre-Plugin Layout)

> **Summary.** Skills that hard-code `~/.claude/skills` or a fixed plans directory silently broke when Stratagem moved to the plugin/marketplace model: the plugin migration empties `~/.claude/skills`, so a `sa` audit found **0 skills**, and three skills disagree on where plans live (`<git-root>/Plans/` vs `~/.claude/plans/` vs `docs/plans/`). The fix is to standardize on **plugin-relative** paths (`${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}`) for plugin assets and **`<git-root>/Plans`** for work products.

---

## Symptom 1 — `sa` audits the wrong directory (empties to zero)

The Skill Audit skill (`/sg:sa`) globs `~/.claude/skills/` to enumerate skills. But installing Stratagem as a plugin migrates all skills out of that directory: the uninstall step left "`~/.claude/skills/*` → 0 remaining" (source: `stratagem-core-buildlog.md`, Step 1), and plugin skills now load from a version-keyed cache under `~/.claude/plugins/cache/stratagem/sg/<version>/…` (source: `stratagem-core-buildlog.md`, Step 4.6).

Consequently `sa`, "as shipped it audits **0 skills**. Must be plugin-aware (`${CLAUDE_PLUGIN_ROOT}/skills`)." (source: `stratagem-core-buildlog.md`, Step 5.2 `/sg:sa` finding). The audit ran green while inspecting nothing — a silent false-pass, the worst kind of failure for a verifier skill.

The buildlog generalizes it into a bug class:

> "**General class:** any hard-coded `~/.claude/skills` or `~/.claude/plans` path is stale in plugin mode — audit all skills for this." (source: `stratagem-core-buildlog.md`, Step 5.2).

## Symptom 2 — plans-directory drift (three conventions in one plugin)

The same class shows up as disagreement about where plan files live. Testing surfaced **three** different conventions across the skill set:

| Skill(s) | Plans location assumed | Source |
|---|---|---|
| `px` / `ax` | `<git-root>/Plans/` | `stratagem-core-buildlog.md`, Step 5.2 `/sg:px` finding |
| `ps` / `pf` / `cp` | "the plans directory" (ambiguous → resolved to `~/.claude/plans/`) | `stratagem-core-buildlog.md`, Step 5.2 `/sg:px` finding |
| `sp` | `docs/plans/` (default resolution) | `stratagem-core-buildlog.md`, Step 5.2 `/sg:sp` finding |

Because `ps`/`pf`/`cp` were ambiguous, "this session's artifacts landed in **`~/.claude/plans/`** (the stale CLAUDE.md convention)" while `px`/`ax` looked in `<git-root>/Plans/`, forcing a manual relocation of the plan to continue (source: `stratagem-core-buildlog.md`, Step 5.2 `/sg:px` finding). `sp`'s `docs/plans/` default is "a **THIRD** path variant" adding to the drift (source: `stratagem-core-buildlog.md`, Step 5.2 `/sg:sp` finding). Note: `sp`'s SKILL.md itself resolves the active plan in `<git-root>/Plans/` in its banner (code: `plugins/stratagem-ado/skills/sp/SKILL.md:24`), so even a single skill's docs are internally inconsistent about the location.

## Why it breaks (root cause)

The skills were authored for the **pre-plugin layout**, where everything lived under the user home (`~/.claude/skills`, `~/.claude/plans`, `~/.claude/workflows`). The plugin/repo model relocates plugin assets into a marketplace cache and expects work products in the git repo. A path baked to `~/.claude/...` therefore points at either an emptied directory (skills) or an out-of-repo, un-shareable location (plans). This is an **upstream-drift** risk: the Claude Code plugin API decides where `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}` resolve, and hard-coded homes don't follow.

A related instance of the *same* root cause (assuming a fixed home path) is the ADO data-dir bug: `${CLAUDE_PLUGIN_DATA}` resolves to `stratagem-ado-<marketplace>` (e.g. `stratagem-ado-stratagem`), **not** `stratagem-ado`, so a launcher expecting the bare name couldn't find `pat.b64` (source: `stratagem-core-buildlog.md`, Step 6 bug). See [[ado-data-dir-marketplace-suffix]].

## The correct standard (fix)

**Plugin assets → plugin-relative.** Skills that read their own bundled files must use `${CLAUDE_PLUGIN_ROOT}` (skills, rules, shared conventions) or `${CLAUDE_PLUGIN_DATA}` (per-install secrets/config), never `~/.claude/...`. This pattern is already used correctly elsewhere:
- `sp` resolves the owner algorithm via `${CLAUDE_PLUGIN_ROOT}/owner-identity-resolver.md` as its single source of truth (code: `plugins/stratagem-ado/skills/sp/SKILL.md:53`).
- `sp` locates per-install identity config with a newest-wins glob that survives marketplace renames: `~/.claude/plugins/data/stratagem-ado-*/ado.config.json` (code: `plugins/stratagem-ado/skills/sp/SKILL.md:45`) — a deliberate hedge against exactly the drift this page describes.
- The `sg` plugin references its rules via `${CLAUDE_PLUGIN_ROOT}` and is "self-contained, no builder refs" (source: `stratagem-core-buildlog.md`, discovery findings).

**Work products → `<git-root>/Plans`.** The authoritative lifecycle convention (per user, 2026-07-09): every Stratagem project has `Plans/.gitkeep` and `Vault/raw/`; **active plans live in per-feature folders inside `<git-root>/Plans/`** (git-shareable, co-located with code), and on completion move `Plans/ → Vault/raw/` for synthesis (source: `stratagem-core-buildlog.md`, "FUTURE WORK — Plans/Seeds lifecycle convention"). The required skill fixes are:
1. `ps`/`pf`/`cp` must author into `<git-root>/Plans/<feature-folder>/`, not `~/.claude/plans/`.
2. `cf`/`rs` must move the finished folder `Plans/ → Vault/raw/`.
3. Update the project `CLAUDE.md` (still says `Plans: ~/.claude/plans/`).
4. Project bootstrap must scaffold `Plans/.gitkeep` + `Vault/raw/`.
(source: `stratagem-core-buildlog.md`, "FUTURE WORK" gap list).

**Skill-introspection skills → plugin cache.** `sa` specifically must enumerate `${CLAUDE_PLUGIN_ROOT}/skills` (source: `stratagem-core-buildlog.md`, Step 5.2 `/sg:sa` finding).

## Scope note

The buildlog observed one *counter-example* that is NOT a bug: `ps` saving a seed to `~/.claude/plans/` "WORKS (`~/.claude/plans/` valid per CLAUDE.md) — confirms the path bug is specific to skill-introspection (`sa`), not the plan lifecycle." (source: `stratagem-core-buildlog.md`, Step 5.2 `/sg:ps` finding). The defect is the *inconsistency and staleness* of hard-coded homes, not that `~/.claude/plans` is unreachable — which is why the fix is to **standardize**, not merely to repoint.

## Related

- [[skill-shape]] — the `/sa` audit (the skill that audited zero skills) and the shape it enforces
- [[plans-dir-lifecycle]] — the `<git-root>/Plans` → `Vault/raw` convention this fix standardizes
- [[plugin-distribution-model]] — the version-keyed cache + `${CLAUDE_PLUGIN_ROOT}` model
- [[ado-bridge]] — the ADO launcher where the same root cause (data-dir suffix) appeared
- [[install-and-skill-test-pass]] — the retro that surfaced all of these findings
- [[direct-state-write-bypassing-seam]] — sibling ADO/core anti-pattern
