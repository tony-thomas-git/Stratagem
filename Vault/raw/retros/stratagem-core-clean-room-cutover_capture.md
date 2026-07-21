# Capture — Stratagem Core Clean-Room Cutover + Plugin Lifecycle

> Raw conversation capture (`/crs`, capture-only). Additive delta-append; synthesized into `wiki/` only at `/cf` via `/wiki-ingest`. Source: active chat session (ISCI-Vision working dir).
>
> **Prior-synthesis note (avoid CF double-create):** the core-extraction / clean-room / persona findings were **already synthesized to `wiki/`** by an earlier `/sg:crs` run — pages `stratagem-core-clean-room-cutover`, `reversible-teardown-safety-net`, `persona-replace-model-scope`, and AP-6/AP-7 in `claude-code-plugin-bundled-mcp-gotchas`. This capture emphasizes the **plugin-lifecycle / teardown** delta and the **Add-Ons marketplace-split** architecture observed 2026-07-20.

## 2026-07-20 — cutover, distribution, old-plugin teardown

### Decisions
- **Builder ≠ Artifact** — the deployable core is a distributable plugin; names no builder repo, ships no secret; the operational system on a machine IS the installed plugin.
- **Reversible teardown before destroying non-git config** — back up irreplaceable secrets (ADO `pat.b64` + `ado.config.json`) *before* uninstalling; git is no undo for plugin data / global `CLAUDE.md`.
- **Per-project persona scope, never a global base** — personas are complete replace-model cores.
- **Prove before you demolish; test in the *stripped* workspace, not a fresh project.**
- **`--keep-data` on the ADO uninstall** — preserve the PAT in place for the new install (also backed up).

### Patterns
- **reversible-teardown-safety-net** — snapshot (move-not-delete) + generated RESTORE + verify (counts + SHA256) + a proven live test-restore, before demolishing.
- **persona = replace-model core → per-project scope** — the full core recompiled with domain fragments (skill-count parity; empty comm-diff); one flavor per project.
- **Clean plugin teardown** — uninstall (mind the scope) → `marketplace remove` → clear `cache/` residue (AP-5); preserve secret data dirs via `--keep-data` or a prior backup.

### Anti-patterns / gotchas
- `settings.json` rejects `mcpServers` (that's Claude *Desktop*'s format) → use `.mcp.json` / `claude mcp add`.
- `claude plugin uninstall` defaults to `--scope user` → silent no-op + duplicate installs on local/project-scoped plugins.
- `uninstall` leaves a `cache/<marketplace>/…` source residue (AP-5) → `rm -rf` explicitly.
- A **global base install** is an anti-pattern under a per-project persona architecture (it duplicates whatever persona a project installs).

### Insights
- **The workflow chaperoned its own migration** — `/mpx`→`/max` + runbook logging kept a self-modifying migration surgical; keep the operational system running *through* the transition so the scaffold never blinks out.
- **"Clean room" is stricter than "no local skills"** — every project under a parent `CLAUDE.md` inherits it.
- **Coexistence window** — a running session keeps startup-cached skills until restart; judge state from disk, not a slash-menu screenshot (the `/sg:` menu strips the prefix from completions).
- **Add-Ons marketplace split (observed 2026-07-20):** the shipped `stratagem` marketplace now lists **only** the core `sg`; the MCP-wrapping Add-Ons (Azure DevOps, Teams, Tavily) moved to a separate `stratagem-addons` marketplace; personas (`sg-coder`) ship from their own marketplace. Two Teams plugins now exist — a **notify** (bot identity, one-way outbound) and a **self** (user identity) variant.
- **CRS itself evolved** — this session's core work was harvested by a wiki-writing `/sg:crs`; the reinstalled `sg-coder` v0.4.3 `/crs` is **capture-only** (raw/-only, additive, non-blocking), deferring wiki synthesis wholesale to `/cf`'s single `/wiki-ingest` pass (Karpathy two-phase: dumb `raw/` substrate vs gated `wiki/` synthesis).

### Open items
- How the Add-Ons (ADO / Teams-notify / Teams-self / Tavily) install + configure **per-project** under the new `stratagem-addons` split.
- When to register the (now Azure-git-remote) marketplaces as team-shareable vs keep personal.
- Teams **notify** (outbound bot) vs **self** (user identity) — when to use which; their auth/config homes.
