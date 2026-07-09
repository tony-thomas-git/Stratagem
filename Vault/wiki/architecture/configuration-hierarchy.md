---
type: architecture
sources:
  - Steward-CLAUDE.md
updated: 2026-06-14
tags:
  - status/active
  - scope/workflow
---

# Configuration Hierarchy

> **Summary.** Stratagem's configuration is layered: global rules cascade
> down to projects, projects override with domain specifics, and the Steward
> layer sits on top to orchestrate the system itself. Environment-agnostic
> skills are separated from MCP-dependent (Claude Desktop only) skills.

## The five layers

| Layer | Path | Purpose |
|-------|------|---------|
| 1. **Global skills** | `~/.claude/skills/` | Cross-project workflows, environment-agnostic |
| 2. **Desktop-only skills** | `~/.claude/skills-desktop/` | MCP-dependent (Gmail, browser automation) |
| 3. **Global `CLAUDE.md`** | `c:\code\CLAUDE.md` | Universal rules, communication style, critical protocols |
| 4. **Project `CLAUDE.md`** | per-repo | Tech-stack conventions, domain rules |
| 5. **Steward `CLAUDE.md`** | `c:\code\Steward\CLAUDE.md` | Meta-system design, orchestration patterns |

*(source: `Steward-CLAUDE.md`, §"Hierarchy Decision Tree")*

## Skill creation criteria

Create a **new skill** when:
- Workflow is used across multiple projects
- Operation has complex multi-step requirements
- Pattern needs version control and evolution
- Sub-agents need consistent, repeatable instructions

**Extend an existing skill** when:
- New capability is a natural extension of an existing workflow
- Changes affect a single phase of an established pattern
- Addition maintains semantic coherence

*(source: `Steward-CLAUDE.md`, §"Skill Creation Criteria")*

## Environment separation

Two skill directories enforce a runtime boundary:

- **`~/.claude/skills/`** — works in both Claude Code CLI and Claude Desktop
- **`~/.claude/skills-desktop/`** — requires Claude Desktop (MCP servers like Gmail, browser automation, TickTick)

Claude Code CLI **skips or warns** when it encounters desktop-only skills. Claude Desktop accesses both directories. Skills can declare requirements in their definition (`environment: claude-desktop`, `requires: [gmail-mcp, ticktick-mcp]`) for graceful degradation *(source: `Steward-CLAUDE.md`, §"Environment-Aware Skills")*.

## Quality standards for `CLAUDE.md` files

1. **Specificity over generality.** Concrete patterns beat abstract principles.
2. **Action-oriented.** Imperative guidance beats descriptive documentation.
3. **Hierarchical.** Critical rules first, details nested appropriately.
4. **Maintainable.** Easy to update as patterns evolve.

*(source: `Steward-CLAUDE.md`, §"Effective CLAUDE.md Files")*

## Vault-shape contract layer (per-wiki)

Each Stratagem Wiki vault carries its own §4.5 schema in `vault/CLAUDE.md`. This is a sixth de-facto layer that sits *outside* the 5-layer skill/CLAUDE.md hierarchy — it constrains vault content, not Claude behavior. The schema, generator skill (`/wiki-ingest`), verifier (`/wiki-graph-audit`), and renderer (`graph.json`) form a closed contract. See [[wiki-graph-shape-contract]].

Folder taxonomy is fixed across all Stratagem wikis: `architecture / patterns / anti-patterns / retrospectives / decisions / plans / runbooks / api / meta`. The 9 folders map to 9 Obsidian graph color groups (`+ 1` for `status/superseded` tag override). New wikis (SAAS-Wiki, FogBOM-Wiki) inherit the same taxonomy by copying `graph.json` and §4.5.

## The Wiki Registry (config that routes retrospectives)

A seventh config artifact: the **Wiki Registry** in `c:\code\Steward\CLAUDE.md` is the canonical `<project> → <wiki vault path>` mapping. `/rs` and `/crs` read it during their **Wiki vault discovery** step to decide whether new gold-doc pages route through `/wiki-ingest` (registered vault present) or fall back to `docs/patterns/*` (no entry). **Explicit registration is required** — a vault existing on disk is not enough; an unregistered project never routes to a wiki *(source: `c:\code\Steward\CLAUDE.md`, §"Wiki Registry")*.

| Project | Vault path | Scope tag |
|---|---|---|
| `ISCI-Web-App` | `…/ISCI-Web-App-Wiki/vault/` | `scope/v2` |
| `Stratagem` (workflow / no project) | `…/Stratagem-Wiki/vault/` | `scope/workflow` |
| `ISICI-SAAS`, `fog-bom-app` | *(deferred — Phases 3–4)* | `scope/saas`, `scope/fogbom` |

Project name resolves from CWD or plan-file path; pure-workflow `/crs` runs default to `Stratagem`.

## Fleet-Aware vault editing (cross-vault sync gate)

Steward orchestrates a *fleet* of sibling vaults. Many vault-level conventions (the §4.5 contract, `vault/CLAUDE.md`, the `graph.json`/`app.json` shape keys) are **duplicated across vaults by design** (prose, not code-factorable), so a single-vault edit silently drifts the fleet. The rule: before any `Write`/`Edit` to a **shape-relevant** file under a registered vault root, surface a one-line fleet-check inline *(just-this-one / apply-to-siblings / show-diff)* and wait — it is **not** a Trust-But-Verify auto-proceed (cross-vault propagation is H by definition). The gate is **key-scoped**, not file-blanket: it fires on shape keys (color groups, `userIgnoreFilters`, `useMarkdownLinks`, the §4.5 sections) but not cosmetic ones (theme, zoom, pan), so it stays signal-rich. Page-content edits (like this node) are vault-local and skip the gate *(source: `c:\code\Steward\CLAUDE.md`, §"Fleet-Aware Vault Editing")*. See [[wiki-graph-shape-contract]] for the contract this protects.

## Related

- [[stratagem]]
- [[operating-modes]]
- [[skill-catalog]] *(forward-link)*
- [[mcp-orchestration]] *(forward-link)*
