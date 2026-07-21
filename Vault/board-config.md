---
title: Board Configuration — Stratagem-Core
tags: [board, config]
updated: 2026-07-19
---

# Board Configuration

> Consumed by `/cp` when running Stratagem **inside the Stratagem-Core workspace**: `/cp` reads `## Board-Areas` + `## Board-Area-Default` + `## Board-Project` and bakes the resolved area/project into the plan header (`## Board-Area:` / `## Board-Project:`). When a board adapter is installed, its sync skill consumes those headers (plus `## Board-Iteration-Policy`) at create. Core stays board-blind — it only resolves values it is *told*.

## Board-Project
Stratagem-Core

## Board-Area-Root
Stratagem-Core

## Board-Area-Default
Stratagem-Core

## Board-Iteration-Policy
current

## Board-Areas
Leaf areas available for Stratagem-Core work items:

| Leaf | Full Path | Use for |
|---|---|---|
| *(root)* | `Stratagem-Core` | All Stratagem-Core work (default — refine into leaf areas as the board grows) |

## Notes
- ⚠️ **Provisional.** Set with the root area only — refine `## Board-Areas` / `## Board-Area-Default` once the Stratagem-Core board defines leaf areas (query the board UI / adapter). `## Board-Iteration-Policy: current` places new Features on the team's current sprint (skip-loud → backlog if none).
- `/cp` reads `## Board-Areas` / `## Board-Area-Default` / `## Board-Project` from this file and emits `## Board-Area:` + `## Board-Project:` into the plan header; a board adapter (installed separately) consumes those headers verbatim. This file is the source of truth `/cp` resolves those from.
- When a board adapter is installed, owner is resolved via that adapter's identity-resolver convention (validate config `owner` → self-heal to the authenticated identity + warn).
