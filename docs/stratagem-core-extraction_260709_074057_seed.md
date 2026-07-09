# Seed: Stratagem Core Extraction — Builder ⇄ Artifact Disconnection

**Authored:** 2026-07-09 · **For:** `/pf` (comprehensive feature planning) · **Project:** Stratagem (builder) → produces the deployable Stratagem core
**Type:** architecture / distribution boundary · **Sibling of:** the completed `stratagem-ado` Plugin-Scrub (identity portability) — this is the same builder/artifact boundary, one level up (build-time dependency portability).

---

## Problem

The deployable Stratagem system is **entangled with its builder**. Two coupled failures:

1. **Deployed artifacts reference builder-only paths.** Skills that ship into a consuming project cite the workshop that made them — they dangle on any machine without the builder repos. Grep-verified coupling inventory (2026-07-09):
   | Deployed artifact | References the builder as |
   |---|---|
   | `c:\code\CLAUDE.md` (workspace) :66 | "Trust-But-Verify pattern (**Steward CLAUDE.md, Meta-Architecture Framework**)" |
   | `.claude/skills/cp/SKILL.md` | "**Steward CLAUDE.md** — Autonomy Budget / two-path model" |
   | `.claude/skills/if/SKILL.md` | "**Steward CLAUDE.md** — Autonomy Budget" |
   | `.claude/skills/wiki-ingest/SKILL.md` | "**Steward/CLAUDE.md** Wiki Registry" (doubly stale — Registry retired 2026-07-08) |
   | `.claude/skills/wiki-graph-audit/SKILL.md` | "**Steward/CLAUDE.md** Wiki Registry" |

2. **Stratagem-system rules are smeared across TWO builder files**, neither of which ships cleanly:
   - `C:\code\Stratagem\CLAUDE.md` — the design surface. Mixes *design-time* content (how to author the system) with *runtime rules* the deployed skills obey.
   - `C:\code\CLAUDE.md` — the workspace config. Mixes *operator-personal* prefs with *Stratagem-system* rules (skills catalog, Critical Operation Rules, Context7 integration, Task-Interruption Protocol, vault convention, research routing, MCP rules).

   A fresh deployment (or a second dev) inherits dangling references and cannot reconstruct the system's operating rules — they live only on the builder's machine.

**Core principle — Builder ≠ Artifact.** `C:\code\Stratagem` (+ `Steward`) is the *factory*: design surface + authoring brain. The *artifact* is what installs into a consuming project. A deployed skill referencing `Steward CLAUDE.md` is a build-time dependency baked into the product. The artifact must be self-contained and reference only artifact-relative paths.

## The three-bucket model (the extraction the whole plan turns on)

| Bucket | Current home(s) | Destination | Shipped? |
|---|---|---|---|
| **Builder / design-time** — Meta-Architecture Framework, Hierarchy Decision Tree, Skill-Creation Criteria, Project Intelligence, Multi-Tool Integration, Self-Improvement Mechanisms, Configuration Evolution | `Stratagem\CLAUDE.md` | **stays** in `Stratagem\CLAUDE.md` (slimmed to design-only) | ❌ never |
| **Operator-personal** — communication style, technical-communication prefs, MCP/preview tooling prefs, research-tool routing *(borderline — see open Q)*, personal identity | `c:\code\CLAUDE.md` | **stays** in the operator's own machine config | ❌ never (per-install, like identity/PAT) |
| **Stratagem-system runtime rules** — Trust-But-Verify (L/M/H + Decisions Made + Adjust), Autonomy Budget & Two-Path Loop, tracer-bullet *execution* discipline, Fleet-Aware Vault Editing, Literal Composition, the verifier contract; PLUS skills catalog, Critical Operation Rules, Context7 integration, Task-Interruption Protocol, Wiki Vault Resolution convention | **smeared across BOTH** `Stratagem\CLAUDE.md` + `c:\code\CLAUDE.md` | **extracted + consolidated into the deployable package** | ✅ ships |

## Locked decisions (from the design conversation, 2026-07-09)

1. **Package form = Claude Code plugin.** The deployable core ships as a plugin (the `stratagem-ado` precedent): skills + a bundled rules doc, marketplace-installable, enable/disable, `${CLAUDE_PLUGIN_ROOT}`-relative paths. Strongest builder/artifact isolation. Working name: **`stratagem-core`** (sibling to `stratagem-ado`).
2. **Rules home = one package rules doc.** A single canonical file bundled in the plugin (the plugin's own `CLAUDE.md` or `stratagem-core-rules.md`) consolidates ALL extracted Stratagem-system rules from both builder files. Deployed skills reference *that* package-relative path — never the builder. Single source of truth, no per-skill duplication.
3. **Extract cut = everything Stratagem-touched.** Maximal extraction: every section of `c:\code\CLAUDE.md` that mentions a Stratagem concept (incl. research routing + MCP rules) extracts into the package, leaving `c:\code\CLAUDE.md` near-empty. **Guardrail:** `/pf` must draw the precise line and FLAG genuinely-personal items (communication style, verification tone) so the operator consciously keeps them — the chosen cut risks pulling personal prefs into the shared package.

## Solution architecture (to be detailed by /pf)

- **`stratagem-core` plugin** — `.claude-plugin/plugin.json` + marketplace entry; `skills/` (all operating-mode skills: ps, pf, cp, px, ax, ex, fx, um, rp, cf, rs, crs, wiki-ingest, wiki-graph-audit, mpx, max, phx, pica, if, sa, handoff, …); one bundled **package rules doc**.
- **Consolidated rules doc** — the runtime bucket from both builder files, restructured into one coherent surface (operating modes + composition, Trust-But-Verify, Autonomy Budget & two-path loop, tracer-bullet execution, Fleet-Aware vault editing, Literal Composition, verifier contract, Critical Operation Rules, Context7 integration, Task-Interruption, vault convention).
- **Reference re-pointing** — the 5 known builder references → the package rules doc via plugin-relative paths; kill the stale Wiki-Registry citations in wiki-ingest/wiki-graph-audit at the same time (already retired).
- **Builder residue** — `Stratagem\CLAUDE.md` slims to design-time only + a **one-way** note: "runtime rules authored here → shipped to the `stratagem-core` plugin; the deployed system reads them there, never from this file." (One-way: builder knows the artifact; artifact never names the builder.)
- **Operator residue** — `c:\code\CLAUDE.md` slims to operator-personal only (the exact residue = an open Q).

## Open design questions for /pf

1. **Skill source-of-truth & the bootstrapping paradox.** The skills currently live in `<project>/.claude/skills/` (and/or `~/.claude/skills/`). The plugin becomes the single source. Does the **builder** then *dogfood* the plugin (install `stratagem-core` to run its own `/cp` etc.), or keep separate authoring copies? Map current skill locations → plugin, and resolve the "the factory uses the product it builds" loop.
2. **Migration / back-compat.** Consuming projects (ISCI-Vision) have copied skills in `.claude/skills/`. Moving to a plugin means removing the copies and installing `stratagem-core`. Sequence + rollback.
3. **`stratagem-core` ↔ `stratagem-ado` relationship.** `stratagem-ado` (board bridge) is a separate plugin that consumes core's neutral seams (`Sync-Id`, board adapter). Confirm they compose as **siblings** (core = workflow engine; ado = optional board adapter) and that ado's references resolve to core's shipped seams, not the builder.
4. **Exact operator-personal residue.** Given "extract everything Stratagem-touched," precisely which lines of `c:\code\CLAUDE.md` are genuinely personal and stay (comm style? verification tone? research routing?). Flag each for a conscious keep/extract call.
5. **Does the package ship the vault?** Rules-home decision was "one package rules doc," NOT vault. Confirm the workflow-pattern vault (`Stratagem\Vault`) stays builder-side and is NOT shipped with the plugin (skills reference the rules doc, not `[[pattern]]` nodes at runtime).
6. **Global vs project layering post-extraction.** The consuming project keeps its own project `CLAUDE.md` (domain rules, e.g. ISCI-Vision's vision stack). Confirm the clean 3-layer runtime: plugin rules doc (workflow) + project CLAUDE.md (domain) + operator personal config (style) — with no cross-references to the builder.

## Corpus grounding (Stratagem-Vault — pull in /pf CORPUS-READ-FIRST)

- `[[bundled-mcp-launcher-shim]]` — the plugin-packaging + `${CLAUDE_PLUGIN_ROOT}`/`${CLAUDE_PLUGIN_DATA}` shape this reuses.
- `[[claude-code-plugin-bundled-mcp-gotchas]]` — AP-1..AP-5 for bundled plugins (namespacing AP-4, cache residue AP-5) — relevant if the plugin bundles anything beyond skills.
- `[[stratagem-ado-plugin-scrub]]` — the sibling boundary (identity portability); its "org de-declarative" evolution + EX-001 grep-completeness lesson (enumerate the extraction family by role, not recall — a real risk for "everything Stratagem-touched").
- `[[configuration-hierarchy]]` — the global → project → Steward layer model this restructures.
- `[[scope-by-category-blindness]]` — extracting "everything Stratagem-touched" is exactly a scope-by-enumeration task; sweep for same-family items not on the first list.

## Success criteria (draft — /pf to finalize)

- A `stratagem-core` plugin exists whose skills + rules doc are **fully self-contained**: 0 references to `C:\code\Stratagem`, `C:\code\Steward`, `Steward CLAUDE.md`, `Meta-Architecture Framework`, or any builder path in shipped artifacts (grep-clean, incl. near-miss sweep).
- All Stratagem-system runtime rules from BOTH `c:\code\CLAUDE.md` and `Stratagem\CLAUDE.md` live in the one package rules doc; the 5 known builder references re-point to it.
- `Stratagem\CLAUDE.md` = design-time only + one-way ship note; `c:\code\CLAUDE.md` = operator-personal only.
- A fresh consuming project installs `stratagem-core`, runs the full `/pf → /cp → /phx → /cf → /rs` lifecycle with zero dependency on the builder repos.
- `stratagem-ado` still composes with `stratagem-core` (siblings), both builder-independent.

---

**Next:** `/pf` — comprehensive feature plan (authored as `.html`), then `/cp` → execution.
