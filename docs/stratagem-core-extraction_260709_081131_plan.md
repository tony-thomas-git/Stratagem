# Feature: Stratagem Core Extraction — Builder ⇄ Artifact Disconnection

## Created: 2026-07-09 08:11:31
## Status: In Progress
## Source PF: stratagem-core-extraction_260709_074057_plan.html
## Tracer Bullet: NO (phased packaging refactor — but a mandatory live-install tracer gates the destructive phase)
## Budget: 600000

---

### Strategic Context

#### Problem Statement & Solution
The deployable Stratagem system is **entangled with its builder**. Two coupled failures: (1) deployed skills cite builder-only paths (`Steward CLAUDE.md`, `Meta-Architecture Framework`) that dangle on any machine without the builder repos; (2) the Stratagem-system operating rules are **smeared across TWO builder files** — `C:\code\Stratagem\CLAUDE.md` (design surface) + `C:\code\CLAUDE.md` (workspace config) — neither of which ships cleanly.

**Principle — Builder ≠ Artifact.** `C:\code\Stratagem` (+ `Steward`) is the *factory*; the *artifact* is what installs into a consuming project. A deployed skill referencing the factory is a build-time dependency baked into the product.

**Solution:** package the deployable core as a Claude Code **plugin** with **one consolidated rules doc**, extracting **all Stratagem-system logic** from both builder files. The plugin references only `${CLAUDE_PLUGIN_ROOT}`-relative paths; the builder keeps design-only; the operator keeps personal-only. Commands become **`/sg:cp`** (plugin named `sg`).

#### The three-bucket model (the extraction this plan turns on)
| Bucket | Content | Current home | Destination |
|---|---|---|---|
| **BUILDER** (design-time) | Meta-Architecture Framework, Hierarchy Decision Tree, Skill-Creation Criteria, Project Intelligence, Multi-Tool Integration, Self-Improvement Mechanisms, Config Evolution | `Stratagem\CLAUDE.md` | **stays** (slimmed to design-only) — never ships |
| **OPERATOR** (personal) | Communication style, technical-communication prefs, verification tone, MCP/preview tooling, personal identity | `c:\code\CLAUDE.md` | **stays** in operator's machine config — never ships (per-install, like identity/PAT) |
| **SYSTEM** (runtime rules) | Trust-But-Verify, Autonomy Budget & Two-Path Loop, tracer-bullet execution, Fleet-Aware vault editing, Literal Composition, verifier contract; skills catalog, Critical Operation Rules, Context7 integration, Task-Interruption Protocol, vault convention, research routing, MCP rules | **smeared across BOTH** builder files | **extracted + consolidated** into the `sg` plugin's rules doc — **ships** |

#### What's Already Built
| Asset | Location | Note |
|---|---|---|
| Live workflow skills (23) | `<project>\.claude\skills\` (ISCI-Vision) | **project-copied** — each consuming project holds its own copy (the smell this fixes). ps pf cp px ax ex fx cf rs crs mpx max phx pica rp um if sa handoff wiki-ingest wiki-graph-audit + **gbx, cx (non-core → excluded)** |
| Pre-scrub skill backup | `~/.claude/_backup/preScrub/skills/` | a prior scrub happened; backup precedent |
| `stratagem-ado` plugin (precedent) | `Stratagem\plugins\stratagem-ado\` | manifest `{name,version,description,author,defaultEnabled:false}`; `.claude-plugin/plugin.json` + local `marketplace.json`; skills namespaced `/stratagem-ado:*` (**live proof** that prefix = plugin name) |
| Builder design surface | `Stratagem\CLAUDE.md` | BUILDER + SYSTEM mixed |
| Workspace config | `c:\code\CLAUDE.md` | OPERATOR + SYSTEM mixed; `:66` cites `Steward CLAUDE.md, Meta-Architecture Framework` |
| Workflow vault | `Stratagem\Vault` | stays builder-side; **NOT shipped** (rules-home = doc, not vault) |

#### Coupling inventory — the leak (grep-verified 2026-07-09)
| Deployed artifact | References the builder as |
|---|---|
| `c:\code\CLAUDE.md` :66 | "Trust-But-Verify (**Steward CLAUDE.md, Meta-Architecture Framework**)" |
| `skills/cp/SKILL.md` | "**Steward CLAUDE.md** — Autonomy Budget / two-path" |
| `skills/if/SKILL.md` | "**Steward CLAUDE.md** — Autonomy Budget" |
| `skills/wiki-ingest/SKILL.md` | "**Steward/CLAUDE.md** Wiki Registry" (doubly stale — Registry retired) |
| `skills/wiki-graph-audit/SKILL.md` | "**Steward/CLAUDE.md** Wiki Registry" |

#### Architecture Decisions
- **D1 — Package = plugin `sg`.** Mirror `stratagem-ado`: `.claude-plugin/plugin.json` (`name: sg`, `defaultEnabled: true` — core is always-on) + a local `marketplace.json` entry **also named `sg`** (the marketplace entry name drives the command prefix; set both to be safe). Plugin **directory** = `stratagem-core` (descriptive); manifest `description` = "Stratagem Core — workflow operating modes". **No MCP** (unlike ado) — no launcher, no `pat.b64`.
- **D2 — One rules doc** = `plugins/stratagem-core/stratagem-core-rules.md` — a named file (not the plugin's `CLAUDE.md`, to avoid auto-load ambiguity). All SYSTEM rules from both builder files consolidate here; skills reference it via `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md`.
- **D3 — Extract everything Stratagem-touched** from `c:\code\CLAUDE.md`; leave only genuinely-personal OPERATOR content.
- **D4 — Namespacing RESOLVED (spike 2026-07-09):** plugin commands are always namespaced by plugin name (proven live: `stratagem-ado` → `/stratagem-ado:sp`). `sg` → `/sg:cp`, `/sg:px`, … **No bare-command or alias path exists** (accepted). A plugin `/sg:cp` and a leftover project-level bare `/cp` do **not** collide — this gives a clean migration window.

#### Phase Strategy — **safety-critical ordering**
The feature modifies the **running system** (the skills executing this plan; the global `c:\code\CLAUDE.md` loaded every session). Therefore: **additive first, destructive last, with a live proof in between.**
- **Phase 1 — Scaffold + Rules (additive):** create the plugin skeleton + author the consolidated rules doc. Nothing existing is touched.
- **Phase 2 — Skills + Re-point (additive):** COPY the 21 skills into the plugin (originals stay as fallback); re-point builder refs to the rules doc.
- **Phase 3 — Prove (gate before destroying):** grep-clean the plugin, then **dogfood-install + live tracer** — confirm `/sg:*` surface and the rules doc resolves. This is the gate that licenses Phase 4.
- **Phase 4 — Slim + Migrate (destructive, ONLY after Phase 3 passes):** slim `Stratagem\CLAUDE.md` → design-only; slim `c:\code\CLAUDE.md` → operator-only; remove the ISCI-Vision skill copies. Backup before each destructive step. *(Note: the global CLAUDE.md slim takes effect next session — so the plugin MUST be installed first, which Phase 3 ensures.)*

#### Entity/Component Notes
- **Skill copy, not move (Phase 2).** Originals in `<project>/.claude/skills/` remain until Phase 4 Task 10 — additive safety.
- **Shared-block change-coupling.** CORPUS-READ-FIRST (8 skills, byte-identical) and the verifier contract are duplicated across skills with sync notes. Re-pointing (Task 5) must preserve those invariants — don't desync the shared blocks. Ref `[[literal-skill-composition]]`.
- **`Steward` must vanish from shipped artifacts entirely** — it's the builder orchestrator; the deployed core never names it. (The grep gate anchors on `Steward` / `Meta-Architecture Framework` / `Wiki Registry`.)
- **`sg` prefix requires marketplace entry name = `sg`** (not just plugin.json), per the spike's finding #6.
- **`stratagem-ado` sibling.** Confirm ado still composes and names no builder file (it's identity-scrubbed but sweep for builder refs too).
- **`[[configuration-hierarchy]]` corpus page** is both the model this restructures AND itself stale — re-render is an `/rs` concern post-impl (not a task here).

#### Dependencies
- Claude Code plugin system (marketplace add/install/enable; restart to register).
- A restart + the VSCode extension venue for the live tracer (AP-2: CLI and extension spawn differently).
- The local marketplace at `Stratagem\plugins\.claude-plugin\marketplace.json` (already hosts `stratagem-ado`).

#### Risk Assessment
| Risk | Mitigation |
|---|---|
| Self-modification breaks the running system | Additive-first ordering; destructive Phase 4 only after the live tracer (Phase 3) proves the plugin; backup before each destructive edit |
| Incomplete extraction — a SYSTEM rule left behind or a builder ref missed | Near-miss grep sweep (`Steward`/`Meta-Architecture`/`Wiki Registry` + path patterns) across ALL shipped artifacts; role-not-recall enumeration (`[[scope-by-category-blindness]]`, plugin-scrub EX-001) |
| Over-extraction — personal prefs pulled into the shared package (D3) | Per-section keep/extract review; comm-style + verification-tone flagged for conscious operator keep |
| `/sg:cp` prefix regression on muscle memory | Accepted (spike); documented; migration window (bare `/cp` coexists until Task 10) |
| Shared-block desync during re-point | Preserve CORPUS-READ-FIRST byte-identity + sync notes; verify no shared-block drift |
| Plugin cache residue (AP-5) / uninstall cleanliness | Known from `[[claude-code-plugin-bundled-mcp-gotchas]]`; document clean-detach |

#### Open Design Decisions
1. **Plugin dir name** — `stratagem-core` (dir) with manifest `name: sg`. *Lean: yes — descriptive dir, short prefix.*
2. **Rules-doc filename** — `stratagem-core-rules.md`. *Lean: yes (avoids CLAUDE.md auto-load ambiguity).*
3. **Exact OPERATOR residue** in `c:\code\CLAUDE.md` — keep: Response Guidelines (comm style), Technical Communication, Verification Rules, personal MCP/preview prefs. Extract: everything else. *Confirm at Task 9.*
4. **Migrate ISCI-Vision now (Task 10) or defer** — *Lean: do it, but as the final gated step with a backup + rollback.*
5. **Research-routing + MCP rules** — D3 says extract into the package (they're workflow tooling conventions). *Confirm they're SYSTEM not OPERATOR.*
6. **Ship the vault?** — No; vault stays builder-side (rules-home = doc).

**RESOLVED 2026-07-09 (RP pre-resume lockdown, operator "OK ALL"):**
- D#1 ✅ plugin dir `stratagem-core`, manifest `name: sg`, marketplace entry `sg`.
- D#2 ✅ rules doc `stratagem-core-rules.md`.
- D#3 ✅ OPERATOR keep = {Response Guidelines/comm style, Technical Communication, Verification Rules}; extract everything else (Task 9).
- D#4 ✅ migrate ISCI-Vision NOW as final gated step (Task 10), backup + rollback.
- D#4b ✅ cut a fresh `tony/` branch before Phase 4 destructive edits (Stratagem tree already dirty from ado-scrub).
- D#5 ✅ research-routing ladder + MCP preview rules → SYSTEM → extract into plugin rules doc (Tasks 2/3).
- D#6 ✅ vault NOT shipped.

#### Success Criteria
- `sg` plugin is fully self-contained: **0** builder references in shipped artifacts (skills + rules doc + manifest) — enumerated + near-miss sweep.
- All SYSTEM rules from BOTH `c:\code\CLAUDE.md` and `Stratagem\CLAUDE.md` live in the one rules doc; the 5 leak refs re-point to it.
- `Stratagem\CLAUDE.md` = design-only + one-way ship note; `c:\code\CLAUDE.md` = operator-only.
- A fresh consuming project installs `sg` and runs the full `/sg:pf → /sg:cp → /sg:phx → /sg:cf → /sg:rs` lifecycle with **zero dependency on the builder repos**.
- `stratagem-ado` still composes with `sg`; both builder-independent.

### Context Files
- Source PF: `stratagem-core-extraction_260709_074057_plan.html` (in `docs/`).
- Seed: `stratagem-core-extraction_260709_074057_seed.md`.
- Corpus (Stratagem-Vault): `[[bundled-mcp-launcher-shim]]`, `[[claude-code-plugin-bundled-mcp-gotchas]]`, `[[stratagem-ado-plugin-scrub]]`, `[[configuration-hierarchy]]`, `[[scope-by-category-blindness]]`, `[[spike-to-retire-capability-uncertainty]]`, `[[literal-skill-composition]]`.

### Task List

#### Phase 1 — Scaffold + Rules (additive)

- [x] Task 1: Scaffold the `sg` plugin skeleton. Create `plugins/stratagem-core/.claude-plugin/plugin.json` = `{ "name": "sg", "version": "0.1.0", "description": "Stratagem Core — workflow operating modes (PF/CP/PX/AX/…)", "author": {"name":"Tony Thomas"}, "defaultEnabled": true }`. Add a `sg` entry to `plugins/.claude-plugin/marketplace.json` beside `stratagem-ado`: `{ "name": "sg", "source": "./stratagem-core", "description": "Stratagem Core — workflow engine" }`. Create the empty `plugins/stratagem-core/skills/` dir. **Acceptance:** both JSON files parse; plugin `name`===`sg`; marketplace has an entry named `sg`.
  - Verify: `cd /c/code/Stratagem && node -e "if(require('./plugins/stratagem-core/.claude-plugin/plugin.json').name!=='sg')process.exit(1)" && node -e "if(!require('./plugins/.claude-plugin/marketplace.json').plugins.some(p=>p.name==='sg'))process.exit(1)"`

- [x] Task 2: Author the consolidated rules doc — **SYSTEM rules from `Stratagem\CLAUDE.md`**. Create `plugins/stratagem-core/stratagem-core-rules.md` and extract (restructured, not verbatim-with-builder-refs): Trust-But-Verify (L/M/H + Decisions Made + Adjust), Autonomy Budget & Two-Path Loop + verifier contract, Tracer-Bullet execution discipline, Fleet-Aware Vault Editing (convention-based), Literal Composition, Composition Patterns. Strip any `Steward`/`Meta-Architecture`/builder-path references as you go. **Acceptance:** file exists with those section headers; 0 `Steward`/builder refs in what was written.
  - Verify: `cd /c/code/Stratagem && f=plugins/stratagem-core/stratagem-core-rules.md; test -f "$f" && grep -q "Trust-But-Verify" "$f" && grep -q "Autonomy Budget" "$f" && grep -q "Fleet-Aware" "$f" && grep -q "Literal Composition" "$f" && grep -q "Tracer" "$f" && ! grep -qiE "steward|meta-architecture framework" "$f"`

- [x] Task 3: Extend the rules doc — **SYSTEM rules from `c:\code\CLAUDE.md`** (D3: everything Stratagem-touched). Add: skills catalog (workflow operating modes as `/sg:*`), Critical Operation Rules (never-commit, plan updates, git-diff, one-task, mid-task gates → reference Trust-But-Verify above), Context7 Integration, Task-Interruption Protocol, Wiki Vault Resolution convention, Research routing ladder, MCP preview rules. Genericize any operator-specific bits. **Acceptance:** the rules doc now carries these sections; still 0 builder refs.
  - Verify: `cd /c/code/Stratagem && f=plugins/stratagem-core/stratagem-core-rules.md; grep -q "Critical Operation Rules" "$f" && grep -qi "task interruption" "$f" && grep -q "Context7" "$f" && grep -qi "vault" "$f" && ! grep -qiE "steward|meta-architecture framework|wiki registry" "$f"`

#### Phase 2 — Skills + Re-point (additive)

- [x] Task 4: **Copy** the 21 workflow skills into `plugins/stratagem-core/skills/` (originals in `<project>/.claude/skills/` stay as fallback). Set = ps pf cp px ax ex fx cf rs crs mpx max phx pica rp um if sa handoff wiki-ingest wiki-graph-audit. **Exclude** `gbx` and `cx` (non-core, confirmed). **Acceptance:** all 21 skill `SKILL.md` present in the plugin; `gbx`/`cx` absent.
  - Verify: `cd /c/code/Stratagem && d=plugins/stratagem-core/skills; for s in ps pf cp px ax ex fx cf rs crs mpx max phx pica rp um if sa handoff wiki-ingest wiki-graph-audit; do test -f "$d/$s/SKILL.md" || { echo "MISSING $s"; exit 1; }; done; ! test -e "$d/gbx" && ! test -e "$d/cx"`

- [x] Task 5: Re-point builder references in the plugin's skills → the rules doc. In `cp`, `if`, `wiki-ingest`, `wiki-graph-audit` (and any other hit), replace `Steward CLAUDE.md` / `Steward/CLAUDE.md Wiki Registry` / `Meta-Architecture Framework` citations with `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md` (kill the stale Wiki-Registry mentions entirely). **Preserve** the CORPUS-READ-FIRST byte-identical shared block + sync notes (don't desync). **Acceptance:** 0 `Steward`/`Meta-Architecture`/`Wiki Registry` refs anywhere under the plugin's `skills/`.
  - Verify: `cd /c/code/Stratagem && ! grep -rniE "steward|meta-architecture framework|wiki registry" plugins/stratagem-core/skills`

#### Phase 3 — Prove (gate before destroying)

- [ ] Task 6: **Grep-clean gate.** Assert 0 builder references across ALL shipped plugin artifacts (skills + rules doc + manifests) — enumerated anchors + a near-miss note. **Acceptance:** aggregate grep returns nothing.
  - Verify: `cd /c/code/Stratagem && ! grep -rniE "steward|meta-architecture framework|wiki registry|c:\\\\code\\\\stratagem|c:\\\\code\\\\steward" plugins/stratagem-core`

- [ ] Task 7: **Dogfood-install + live tracer (MANUAL — human eyes, both venues).** The gate that licenses Phase 4. Install `sg` from the local marketplace (`claude plugin marketplace add C:\code\Stratagem\plugins` if not present → `claude plugin install sg` → `claude plugin enable sg`), restart Claude Code, confirm `/sg:cp` / `/sg:px` / `/sg:phx` surface in `/help`, run one lifecycle command (e.g. `/sg:um` or a dry `/sg:rp`), and confirm a skill resolves `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md`. Do it in **both** the CLI and the VSCode extension (AP-2). **Acceptance (human-verified):** `/sg:*` commands work and the rules doc resolves in both venues. Shell Verify only checks the install precondition.
  - Verify: `cd /c/code/Stratagem && node -e "if(require('./plugins/stratagem-core/.claude-plugin/plugin.json').name!=='sg')process.exit(1)" && test -f plugins/stratagem-core/stratagem-core-rules.md`

#### Phase 4 — Slim + Migrate (destructive — ONLY after Task 7 passes)

- [ ] Task 8: Slim `C:\code\Stratagem\CLAUDE.md` → **BUILDER-only**. Back it up first (`CLAUDE.md.bak`). Remove the SYSTEM sections now living in the plugin (Trust-But-Verify Pattern, Autonomy Budget & the Two-Path Loop, Tracer Bullet Discipline, Fleet-Aware Vault Editing, Literal Composition, Composition Patterns). Keep BUILDER content (Meta-Architecture config-design principles, Hierarchy Decision Tree, Skill-Creation Criteria, Project Intelligence, Multi-Tool Integration, Self-Improvement Mechanisms). Add a one-way note: "Runtime rules authored here are shipped to the `sg` plugin (`plugins/stratagem-core/stratagem-core-rules.md`); the deployed system reads them there, never from this file." **Acceptance:** SYSTEM section headers gone; ship note present; file still coherent.
  - Verify: `f=/c/code/Stratagem/CLAUDE.md; grep -qiE "shipped to the .sg. plugin|stratagem-core-rules" "$f" && ! grep -qE "^### Trust-But-Verify Pattern$" "$f" && ! grep -qE "^### Autonomy Budget & the Two-Path Loop$" "$f"`

- [ ] Task 9: Slim `C:\code\CLAUDE.md` → **OPERATOR-only** (D3). Back it up first. Remove every SYSTEM section (Available Skills catalog, Critical Operation Rules, Research & Web Lookup Routing, MCP Integration Rules, Context7 Integration, Task Interruption Protocol, Wiki Vault Resolution, Branch Management) — now in the plugin. Keep OPERATOR content (Response Guidelines / communication style, Technical Communication, Verification Rules). Optionally add a one-line pointer: "Workflow rules now provided by the `sg` plugin." **Acceptance:** SYSTEM section headers gone; OPERATOR sections remain; valid.
  - Verify: `f=/c/code/CLAUDE.md; ! grep -qE "^## Available Skills$|^## Critical Operation Rules$|^## Task Interruption Protocol$" "$f" && grep -qiE "communication style|response guidelines" "$f"`

- [ ] Task 10: Migrate ISCI-Vision — remove the now-redundant project skill copies. Back up `c:\code\ISCI-Vision\.claude\skills\` first. With `sg` installed + proven (Task 7), remove the 21 copied workflow skill dirs from `ISCI-Vision\.claude\skills\` (leave any genuinely-project-local skills, and `gbx`/`cx` if the operator wants them personally). Confirm the workflow still runs via `/sg:*`. **Acceptance (human-verified):** the copied core skills are gone from ISCI-Vision; `/sg:cp` etc. still work (provided by the plugin). Shell Verify checks the copies are removed.
  - Verify: `test ! -e /c/code/ISCI-Vision/.claude/skills/cp && test ! -e /c/code/ISCI-Vision/.claude/skills/phx && test -d /c/code/ISCI-Vision/.claude/skills.bak`

### Completed Tasks
- [x] **Task 1** — Scaffold `sg` plugin skeleton (2026-07-09). Created `plugins/stratagem-core/.claude-plugin/plugin.json` (`name:sg`, `defaultEnabled:true`), added `sg` entry to `plugins/.claude-plugin/marketplace.json`, created `plugins/stratagem-core/skills/.gitkeep`. Verify: exit 0.
- [x] **Task 2** — Authored `plugins/stratagem-core/stratagem-core-rules.md` with the 6 Stratagem SYSTEM sections (Composition Patterns, Tracer Bullet Discipline, Trust-But-Verify, Fleet-Aware Vault Editing, Autonomy Budget & Two-Path Loop, Literal Composition), builder-refs scrubbed, `/sg:` command surface (2026-07-09). Verify: exit 0.
- [x] **Task 3** — Extended the rules doc with the 7 workspace SYSTEM sections (Skills Catalog `/sg:*`, Critical Operation Rules incl. Branch Management, Research & Web Lookup Routing, MCP Integration Rules, Context7 Integration, Task Interruption Protocol, Wiki Vault Resolution). Killed the `c:\code\CLAUDE.md:66` leak by re-pointing the mid-task-gate to the doc's own Trust-But-Verify section; no "Wiki Registry" wording. (2026-07-09). Verify: exit 0.
- [x] **Task 4** — Copied 21 core skills into `plugins/stratagem-core/skills/` (recursive; source = `ISCI-Vision/.claude/skills/`); `gbx`/`cx` excluded. 21 SKILL.md present. Originals left intact as fallback (removed later in Task 10). (2026-07-09). Verify: exit 0.
- [x] **Task 5** — Re-pointed 11 builder refs across 5 skills (`if`×3, `cp`×5, `ps`×1, `wiki-ingest`×1, `wiki-graph-audit`×1): `Steward CLAUDE.md "Autonomy Budget"` citations → `${CLAUDE_PLUGIN_ROOT}/stratagem-core-rules.md`; "Steward default" → "plugin default"; `Steward ## Wiki Registry` vault-resolution → `Vault\`-convention; stale `+ Steward/CLAUDE.md Wiki Registry` cells removed. CORPUS-READ-FIRST shared block untouched (byte-identity preserved). (2026-07-09). Verify: exit 0.

### Error Log
(Errors and fixes get logged here)

### PICA Log
| Task | Pattern | Audited | Issues | Action |
|------|---------|---------|--------|--------|
| T1 | plugin-manifest scaffold (mirror `stratagem-ado`) | 2 JSON | 0 | — (Layer-5 C#/WPF dims N/A) |
| T2 | rules-doc extraction (SYSTEM prose, builder-scrub) | 1 md | 0 | — (Layer-5 C#/WPF dims N/A; scrub verified by gate) |
| T3 | rules-doc extension (workspace SYSTEM, leak re-point) | 1 md | 0 | — (Layer-5 C#/WPF dims N/A; scrub verified by gate) |
| T4 | skill-copy (flat `skills/<name>/` mirror of stratagem-ado) | 21 dirs | 0 | — (mechanical copy; Layer-5 C#/WPF dims N/A) |
| T5 | builder-ref re-point (`${CLAUDE_PLUGIN_ROOT}` citation) | 5 skills | 0 | — (shared-block byte-identity preserved; Layer-5 dims N/A) |
