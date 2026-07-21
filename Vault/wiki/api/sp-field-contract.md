---
type: api
sources: [sp/SKILL.md]
updated: 2026-07-10
tags:
  - status/active
  - scope/ado
  - boundary/core-ado
---

# SP Create-Time Field Contract

> **Summary.** The field contract `/stratagem-ado:sp` applies when it turns a `/cp` plan into an Azure DevOps Feature + one child User Story per task: which fields are set at create, which are prompted, which are policy-driven, and which are deliberately left unset. State is never set (items default to `New`); transitions belong to [[board-sync-event-map]]. After create, SP writes the board ids back into the plan as neutral `Sync-Id` markers.

---

## Shape produced

`/stratagem-ado:sp` creates one **Feature** (from the plan's `# Feature:` line) and one child **User Story** per uncompleted task in `### Task List` (code: `plugins/stratagem-ado/skills/sp/SKILL.md:67-70`). It is **create-only**: a load-bearing idempotency guard STOPs the run if any task already carries a `Sync-Id:` or the header has `## ADO-Feature-Id:`, to avoid duplicating the whole board hierarchy (code: `plugins/stratagem-ado/skills/sp/SKILL.md:62-64`).

---

## Field contract (create-time only)

| Field | Value at create | Set how |
|---|---|---|
| **Assigned To (owner)** | resolved `owner`, **self-healed** | Feature via `fields`; Stories via follow-up `wit_update_work_item` (code: `plugins/stratagem-ado/skills/sp/SKILL.md:130`) |
| **Area Path** | `## ADO-Area` else **omitted → board root** | creation field; no leaf default (code: `plugins/stratagem-ado/skills/sp/SKILL.md:131`) |
| **Iteration Path** | current sprint (policy `current`) / omitted → backlog root | `System.IterationPath`; Stories inherit (code: `plugins/stratagem-ado/skills/sp/SKILL.md:132`) |
| **Acceptance Criteria** | Feature ← Success Criteria; Story ← per-task `Verify:` | `Microsoft.VSTS.Common.AcceptanceCriteria`; Feature at create, Story via follow-up (code: `plugins/stratagem-ado/skills/sp/SKILL.md:133`) |
| **Epic (Parent)** | **user-prompted** — no config/header default | `Feature → Epic` via `wit_work_items_link` after create, else unparented (code: `plugins/stratagem-ado/skills/sp/SKILL.md:134`) |
| **Spike (retire)** | `## Spike-Sync-Id` else skipped | link `related` + close via `board-sync {merged}` (code: `plugins/stratagem-ado/skills/sp/SKILL.md:135`) |
| **State** | `New` — **not set** (default) | transition field, owned by the loop (code: `plugins/stratagem-ado/skills/sp/SKILL.md:136`) |
| **Reason** | derives — not set | transition field (code: `plugins/stratagem-ado/skills/sp/SKILL.md:137`) |

### Owner — self-healed, never silently replaced

Owner resolves to the plugin's `ado.config.json` `owner` (a `## ADO-Owner:` header overrides per-plan) (code: `plugins/stratagem-ado/skills/sp/SKILL.md:50`). Resolution follows the shared `owner-identity-resolver.md` convention: validate the resolved owner via `core_get_identity_ids`, self-heal to the PAT identity and **warn on mismatch** — validation only, never a silent replace (code: `plugins/stratagem-ado/skills/sp/SKILL.md:53`).

### Area — empty fallback, not a leaf

When `## ADO-Area:` is absent SP does **not** substitute a leaf (never `…\<Area-Leaf>`); it omits `System.AreaPath` so the item lands at the board root as visible "uncategorized" — fail-loud, no silent default fallback (code: `plugins/stratagem-ado/skills/sp/SKILL.md:57-60`). The real default lives in the project's `board-config.md` (`## ADO-Area-Default`) and `/cp` bakes it into the plan header (code: `plugins/stratagem-ado/skills/sp/SKILL.md:57`).

### Iteration — policy toggle (decision #4, default `current`)

Per the resolved `## ADO-Iteration-Policy` (code: `plugins/stratagem-ado/skills/sp/SKILL.md:77`):
- **`current`** → resolve the team's current sprint via `work_list_team_iterations` (`timeframe: "current"`); stamp its `path` as the Feature's `IterationPath` (Stories inherit). If no current iteration resolves, warn loudly and fall back to omitting the field — skip-loud, never block (code: `plugins/stratagem-ado/skills/sp/SKILL.md:78`).
- **`backlog`** → no `IterationPath`; Feature and Stories land at the backlog root (code: `plugins/stratagem-ado/skills/sp/SKILL.md:79`).

### Epic — prompted, fail-open (decision #5)

SP asks the user whether to attach the Feature to an Epic (id or exact title). Blank/declined leaves the Feature **UNPARENTED** — no Epic link, no error — the fail-open default. A given Epic is linked `Feature → Epic` after create; an unresolvable Epic title warns loudly and proceeds unparented (skip-loud, never blocks the sync) (code: `plugins/stratagem-ado/skills/sp/SKILL.md:73-76`).

### AcceptanceCriteria (decision #6)

The child-create API accepts only title/description/areaPath/iterationPath — it **cannot** set AssignedTo, State, or AcceptanceCriteria at create (code: `plugins/stratagem-ado/skills/sp/SKILL.md:103`). So Owner + AcceptanceCriteria are applied to each Story in a follow-up `wit_update_work_item` op; the AcceptanceCriteria op is omitted for a task with no `Verify:`/acceptance text (code: `plugins/stratagem-ado/skills/sp/SKILL.md:105-107`).

### State = `New`, never set

SP must **not** set `System.State` or `System.Reason` — new items default to `New`; State/Reason are the *transition* pair owned by the loop ([[board-sync-event-map]]), not creation fields (code: `plugins/stratagem-ado/skills/sp/SKILL.md:90`). The `New→Active→Resolved→Closed` transitions are not SP's job (code: `plugins/stratagem-ado/skills/sp/SKILL.md:139`).

---

## Spike retirement — delegated close (decision #8)

The one place SP touches a transition is the originating spike, and even then only by *requesting* it. When a `## Spike-Sync-Id:` resolved, SP links the Feature to the spike as a peer via the **`related`** link type (`System.LinkTypes.Related`, NOT a parent link), then closes the spike through the single-source transition seam — it invokes `/stratagem-ado:board-sync` with `{ event: "merged", syncId: <Spike-Sync-Id>, task: 0 }` and never writes `System.State` itself (code: `plugins/stratagem-ado/skills/sp/SKILL.md:94-96`). Skip-loud and one-way: a missing/non-numeric id, unresolvable Story, or link/close failure logs `⚠ SP: spike retirement skipped — <reason>` and continues; retirement only ever closes the spike, never reopens it (code: `plugins/stratagem-ado/skills/sp/SKILL.md:97`).

---

## Sync-Id write-back (D9 — the neutral linkage seam)

After create, SP edits the plan file to record the board ids (code: `plugins/stratagem-ado/skills/sp/SKILL.md:109-112`):
- adds a header line `## ADO-Feature-Id: <Feature id>`,
- appends ` — Sync-Id: <Story id>` to the end of each corresponding task line in `### Task List`.

These markers are deliberately generic — `Sync-Id`, not "ADO" / "Story" — so the [[neutral-board-seam|core seam]] reads them with zero ADO awareness (code: `plugins/stratagem-ado/skills/sp/SKILL.md:112`). This is the value [[board-sync-event-map]] receives as `syncId` and [[autonomy-loop-args]] surfaces to the loop.

---

## Guards

- Never create on a plan that already has `Sync-Id:` markers (code: `plugins/stratagem-ado/skills/sp/SKILL.md:143`).
- Spike retirement is delegated + skip-loud — never write the spike's `System.State` directly (code: `plugins/stratagem-ado/skills/sp/SKILL.md:144`).
- Throwaway tests: title tracer Features `[TRACER-BULLET — DELETE ME] …`, tag `stratagem-tracer-bullet`, and delete after — never leave fixtures on the live board (code: `plugins/stratagem-ado/skills/sp/SKILL.md:146`).

---

## Related

- [[board-sync-event-map]] — the transition adapter SP hands the `Sync-Id` to (and requests the spike close from)
- [[autonomy-loop-args]] — consumes the `## ADO-Feature-Id:` / `Sync-Id:` markers SP writes
- [[sync-id-linkage]] — the neutral `Sync-Id` linkage seam SP occupies on the ADO side
- [[owner-identity-resolver]] — the shared convention SP uses to self-heal `Assigned To`
- [[direct-state-write-bypassing-seam]] — why SP never sets `System.State`, even at create
- [[ado-bridge]] — the plugin SP ships in · [[verifier-contract]] — the `Verify:` lines SP reads into AcceptanceCriteria
