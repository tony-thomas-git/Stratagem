---
type: meta
sources: []
updated: 2026-07-10
tags:
  - status/active
  - scope/meta
---

# Scopes & Tag Vocabulary

> **Summary.** The `scope/*` and supplementary tag vocabulary for the merged **Stratagem** vault (the `stratagem-core` implementation + the workflow meta-system). Every wiki page MUST carry at least one `scope/*` tag and exactly one `status/*` tag. This page is the canonical list — add a new scope here in the same session you start using it.

---

## 1. Scope axis (required, multi) — Stratagem

| Scope | What it covers |
|---|---|
| `scope/stratagem-core` | The `stratagem-core` implementation as a whole; cross-cutting build/architecture pages (fallback for the core side). |
| `scope/skills` | The workflow-mode skills (`ps/pf/cp/px/ax/phx/cf/rs/…`) — their shape, contracts, lifecycle. |
| `scope/plugin` | Plugin/marketplace **distribution**: install, dev loop, the SessionStart hook, versioning. |
| `scope/workflow` | The workflow meta-system — *how we work*: operating modes, skill & config design, tracer-bullet and loop-engineering discipline, the `/if` autonomy loop + Workflow engine, and their retros/anti-patterns. **The dominant scope by page count.** |
| `scope/ado` | The detachable `stratagem-ado` bridge: board-sync, sp/pr/ss, the bundled MCP, the neutral seam. |
| `scope/vault` | The knowledge system: CORPUS-READ-FIRST, `<git-root>/Vault`, this §4.5 contract. |
| `scope/lifecycle` | The plan lifecycle (seed → plan → execute → retrospect), `Plans/` + `Vault/raw`. |
| `scope/meta` | Index pages, templates, this scopes page, glossary. |
| `scope/research` | External material (docs, posts) mined for ideas. |

### Adding a scope mid-session
1. Add a row above with a one-line description.
2. Note it in `logs/CHANGELOG.md`.
3. Start using it. Don't retroactively re-tag old pages unless relevance is clear.

---

## 2. Status axis (required, single — closed set)

| Status | When to use |
|---|---|
| `status/active` | Reflects current understanding. Default for new pages. |
| `status/draft` | Stub or partial. Pre-condition for `active`. |
| `status/superseded` | Replaced or no longer holds. Keep for history; forward-link to the replacement. |

A page is **exactly one** of these.

---

## 3. Optional supplementary axes (adopt only if they earn their keep)

- **`layer/<n>`** — for the plugin stack (e.g. `layer/core` board-blind vs `layer/ado` bridge).
- **`risk/<concern>`** — e.g. `risk/upstream-drift` (Claude Code plugin API), `risk/board-assumptions` (ADO process states).
- **`boundary/<name>`** — for pages describing a crossing (e.g. `boundary/core-ado` — the neutral `{event,syncId,task}` seam; pair with [[boundary-page-template]]).
- **`release/<version>`** — e.g. `release/v0.1.0`, retros/decisions tied to a version.

---

## 4. Tag naming conventions
- Lowercase, kebab-case. Singular nouns. One concept per scope.

## 5. Related
- [[index]] — landing page · [[glossary]] — domain vocabulary · [[ingest-backlog]] — pending sources

## 6. Notes for the agent
When a page needs a scope not listed here: ✋ pause, confirm the name with the operator (or pick the closest existing), add the row to §1, then write.
