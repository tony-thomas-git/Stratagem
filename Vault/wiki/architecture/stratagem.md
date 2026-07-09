---
type: concept
sources:
  - Steward-CLAUDE.md
  - 🪙Steward-Patterns.md
updated: 2026-06-14
tags:
  - status/active
  - scope/workflow
---

# Stratagem

> **Summary.** Stratagem is an AI coding workflow system: a layered
> configuration stack plus a lifecycle of operating modes (PF→CP→PX→AX→CF)
> that lets Claude Code agents execute software work with consistency,
> traceability, and compounding learning. **Steward** is the role that
> orchestrates Stratagem across projects.

## What Stratagem is

A meta-system that combines three things:

1. **A configuration hierarchy.** Global `CLAUDE.md` rules at `c:\code\CLAUDE.md`, project-level `CLAUDE.md` files in each repo, and the meta-orchestration layer at `c:\code\Steward\CLAUDE.md` (source: `Steward-CLAUDE.md`). See [[configuration-hierarchy]].

2. **A lifecycle of operating modes.** Discrete slash commands (`/pf`, `/cp`, `/px`, `/ax`, `/cf`, plus error-recovery and memory-mode variants) that chain into a full feature-development cycle. See [[operating-modes]].

3. **A discipline of compounding learning.** Retrospectives (`/rs`, `/crs`) extract patterns from completed work, update gold-standard docs, and route new pages into the **knowledge vaults** via `/wiki-ingest` (gated by the Wiki Registry). `/rs` now also re-renders a gold doc's vault counterpart in the same operation (the "one breath" refresh), so counterparts can't drift. See [[configuration-hierarchy]] §"Wiki Registry".

## Knowledge vaults (the live wiki fleet)

Stratagem maintains a *fleet* of sibling wiki vaults — terse, link-rich retrieval nodes synthesized from the verbose gold-doc ledgers (the [[wiki-graph-shape-contract|§4.5 counterpart model]], not copies):

| Vault | Scope | Holds |
|---|---|---|
| **Stratagem-Wiki** (this vault) | `scope/workflow` | how we work — operating modes, config hierarchy, tracer-bullet/Trust-But-Verify patterns, skill catalog |
| **ISCI-Web-App-Wiki** | `scope/v2` | Portal domain — v2 architecture, entity/pattern counterparts, schema pipeline, anti-patterns |
| *SAAS-Wiki, FogBOM-Wiki* | `scope/saas`, `scope/fogbom` | deferred (Phases 3–4) |

Cross-vault conventions are kept in sync by the [[configuration-hierarchy|Fleet-Aware editing gate]] *(source: `Steward-CLAUDE.md`, §"Knowledge Vaults")*.

## Why it exists

Without Stratagem, AI coding sessions are one-shot: every conversation re-derives context from scratch, patterns drift across projects, and learnings evaporate when the chat closes. Stratagem makes the workflow itself **persistent and inspectable** — plans live in files, decisions log into runbooks, patterns crystallize into pattern docs, and memory survives across conversations *(source: `Steward-CLAUDE.md`, §"Self-Improvement Mechanisms")*.

## Who runs it

**[[steward-role|Steward]]** — the orchestrator, architect, and toolchain designer. Steward doesn't write feature code directly; it configures the system that lets sub-agents (Claude Code terminals in specific project working directories) execute effectively *(source: `Steward-CLAUDE.md`, §"Role")*.

## Active projects under Stratagem orchestration

| Project | Working dir | Stack |
|---------|-------------|-------|
| Portal (ISCI-Web-App) | `C:\code\ISCI-Web-App\` | Next.js 15, TypeScript, Prisma, Azure SQL, TailwindCSS |
| SAAS (ISICI-SAAS) | `C:\code\ISICI-SAAS\` | TBD |
| FogBOM (fog-bom-app) | `C:\code\fog-bom-app\` | TBD |

*(source: `Steward-CLAUDE.md`, §"Active Projects")*

## Related

- [[operating-modes]]
- [[configuration-hierarchy]]
- [[tracer-bullet-discipline]]
- [[steward-role]] *(forward-link)*
