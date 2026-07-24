# DERIVATION — how `strat-dist` is made

> **What this doc is.** The reproducible record of how the `tt/strat-dist` line
> of this repository is *derived* from the intelliscience coder flavor of
> Stratagem. `strat-dist` is a **hand-derived snapshot**, not a compiler output —
> so "how it was made" has to be written down, or the transform becomes a
> black-box one-off. This is that write-down: what the distributable is, the
> genericization map that produced it, and the manual steps to re-derive it when
> the upstream coder flavor changes.

---

## 1. What `strat-dist` is

`strat-dist` is the **stack-neutral, board-neutral generic distribution** of
Stratagem — a clean core anyone can install into any codebase without inheriting
intelliscience's stack or board. It is the composition of four transforms applied
to the intelliscience coder flavor:

| Layer | State | Evidence |
|---|---|---|
| **Coder `sg` flavor** | the base — the 21-skill workflow engine (`plugins/stratagem-core/`) | `plugins/stratagem-core/skills/` (21 dirs) |
| **Board-neutralized** | ADO naming stripped, `stratagem-ado` removed, neutral `{event, syncId, task}` board + notify seams left in place | commit `dd4deee`; `plugins/stratagem-core/SEAM-CONTRACT.md` |
| **Stack-neutralized** | the skills privilege no language, framework, or test runner — baked C#/WPF/.NET/native-C++ nouns replaced with neutral placeholders | this feature (`strat-dist_260719`, Tasks 1–6) |
| **`stratagem-tavily` add-on** | the one bundled research add-on — Tavily MCP for the web-fallback ladder, ships **disabled** (`defaultEnabled: false`) | `plugins/stratagem-tavily/` |

The live marketplace (`.claude-plugin/marketplace.json` at the repo root, name `stratagem`)
ships exactly **two** plugins — `sg` (the core) and `stratagem-tavily` (the
add-on). **No board plugin ships here.** External board (Azure DevOps, Jira,
GitHub Projects, …) and chat (Teams, Slack, …) systems attach as *separate
adapter plugins* through the neutral seams; none are bundled.

### Builder ≠ Artifact (the boundary this line enforces)

`strat-dist` is the **artifact**, not the factory. The Stratagem *compiler* —
`compiler/`, `core/`, `templates/`, `golden/` — lives in the **separate
`stratagem-core` repository** (`C:\code\stratagem-core`), and it stays there. It
is **not** part of this repo and is **out of scope** for `strat-dist`.

> **Locked decision (D5).** `strat-dist` is a **hand-derived snapshot**, not a
> compiler flavor. Re-deriving is a *manual, documented procedure* (§4), not a
> `derive-generic.sh` run. A substitution script is a new abstraction with its
> own failure surface; the doc is the reproducible baseline. A script is a
> fast-follow only if re-derivation becomes frequent.

---

## 2. The four gaps this feature closed

The board-neutralization (`dd4deee`) left the core still stack-bound and missing
its onboarding surface. The `strat-dist_260719` feature closed four gaps:

1. **Genericize the stack specifics** across the skills — no language, framework,
   or test runner is privileged (Tasks 1–6; §3).
2. **Add the generic `INSTALL.md`** — a concrete, org-neutral onboarding doc
   (Task 7; the originating question).
3. **Document the derivation** — *this file* — so the transform is reproducible,
   not a one-off (Task 8).
4. **Fix the `.gitignore` discrepancy** — add `**/tavily.config.json` so the
   claim the Tavily `INSTALL.md` already makes becomes true (Task 9).

---

## 3. The genericization map

The stack-neutralization was a bounded, grep-anchored sweep over a fixed
hot-spot inventory. Voice: **neutral-noun placeholders** — replace a baked stack
name with a placeholder noun ("the app", "the libraries your task touches",
"your test runner scoped to this task's suite"). A worked example in one stack
just privileges a *different* stack; nouns privilege none.

| File | Baked in | Genericized to | Task |
|---|---|---|---|
| `skills/ax`, `skills/fx`, `skills/max` (`/pica`-caller scope line) | `Layer-5 .cs/.xaml … Native C++ below the interop seam out of scope` | "the changed source files + their sibling files implementing the same pattern" | 1 |
| `skills/ax`, `skills/fx`, `stratagem-core-rules.md` (context7 lib lists) | `Castle.Windsor, CommunityToolkit.Mvvm, Microsoft.ML.OnnxRuntime, OpenCV`; `React, Next.js, Prisma, MSAL, AG Grid, Tailwind, AWS/Azure SDKs` | "any library, framework, SDK, CLI, or cloud service your task touches" | 2 |
| `skills/cp` (stack examples) | `Verify: npm test … && eslint`; Board-Area `ISCI - Consolidated - Kanban`; smoke test of `IVia.App (WPF)` | `<your test runner, scoped to this task's suite>`; `Portfolio - Team - Board\Area`; "the app" | 3 |
| `skills/wiki-ingest`, `skills/wiki-graph-audit`, `stratagem-core-rules.md` (wiki-scope examples) | `scope/vision` ↔ `ISCI-Vision-Vault` | `scope/<your-project>` (infer-from-`meta/scopes.md` mechanics kept) | 4 |
| `skills/pica` (audit dimensions) | Purpose + 8 IVia/Windsor/Dispatcher/XAML/interop dimensions | 6 neutral dimensions (DI/registration, concurrency/async, resource-lifecycle, style-guide conformance, boundary/seam coordination, new-component wiring), framed "the dimensions your `CLAUDE.md` + style docs define"; mechanics byte-stable | 5 |
| `skills/ex`, `skills/ps` (soft phrasing) | stack-flavored phrasing | read-scan — no-op outcome (both already defer to the project) | 6 |

**The flip side of genericization (D2).** `/pica` ships **stack-neutral** and
*defers to your project*: it derives its audit dimensions from your `CLAUDE.md` +
style docs. The neutral dimensions ship; your `CLAUDE.md` specializes them.
Populating those files is what trains the audit on your patterns.

---

## 4. Re-deriving `strat-dist` when the coder flavor updates

When the upstream intelliscience coder flavor gains a skill change worth pulling
into the generic line, re-derive by hand — carry the *change*, then re-apply the
two neutralization transforms and re-verify. This is the manual procedure D5
keeps instead of a script.

1. **Bring the changed skill(s) across** from the coder flavor into
   `plugins/stratagem-core/` on `tt/strat-dist`.
2. **Re-board-neutralize.** Strip any ADO/board naming; confirm board concepts
   live only behind the neutral `{event, syncId, task}` seam
   (`SEAM-CONTRACT.md`). Re-derived skills must name **no** external board.
3. **Re-stack-neutralize.** Re-apply the §3 neutral-noun map to any stack tokens
   the change introduced. Treat this as **one coherent sweep**, not per-file — a
   scoped-by-category sweep is blind to same-family instances outside the named
   file list (cf. `[[scope-by-category-blindness]]`, `[[audit-glob-self-blindness]]`).
4. **Run the anchored verification gate** over the whole `plugins/stratagem-core`
   tree. Two halves:
   - **Stack-neutral gate (anchored).** Use `ISCI-Vision|\bISCI\b`, **not** bare
     `ISCI` — bare `ISCI` matches the word "di**sci**pline" (false hits). Full
     token set (must read **zero**):
     ```
     ! rg -qiE 'IVia|\.cs\b|\.xaml|WPF|Castle\.Windsor|OnnxRuntime|OpenCV|TensorRT|gtest|MSTest|dotnet test|vstest|npm test|eslint|Native C\+\+|intelliscience|ISCI-Vision|\bISCI\b' plugins/stratagem-core
     ```
   - **Board-neutral regression (must read zero):**
     ```
     ! rg -qiE 'ADO-|azure devops|ado-board-config|stratagem-ado' plugins/stratagem-core
     ```
5. **Read-scan for the grep-invisible surface.** The grep is **necessary but not
   sufficient.** Stack-flavored *examples* that name *other* libraries
   (React/MSAL/AG Grid/AWS/Azure/…) are invisible to the ISCI-anchored gate — a
   clean grep is a floor, not proof of neutrality. A human/PICA read-scan of the
   changed skills is **mandatory** (this is exactly why Tasks 2 & 6 carried
   read-scan mandates the greps could not enforce).
6. **Confirm the add-on still integrates.** The Tavily add-on ships disabled but
   must stay intact:
   ```
   node --test plugins/stratagem-tavily/test/resolve-cred-dir.test.mjs
   node --check plugins/stratagem-tavily/bin/tavily-mcp-launch.js
   ```
7. **Leave uncommitted for review.** The generic line never auto-commits
   (never-commit rule); the re-derived diff lands on `tt/strat-dist` for human
   review.

> **Why doc-only, not a script (D5 restated).** A `derive-generic.sh`
> substitution script would carry its own failure surface — brittle regex
> substitutions that silently mis-edit, and no answer to the grep-invisible brand
> examples step 5 exists to catch. The manual procedure keeps a human in the one
> loop (read-scan) that cannot be automated safely. Promote to a script only if
> re-derivation becomes frequent enough to justify the new abstraction.

---

## 5. Dist-local enhancements (upstream candidates)

Improvements made directly on `strat-dist` that are **not yet in the canonical
`stratagem-core` tavily add-on** — candidates to upstream so every flavor gets them:

- **`/stratagem-tavily:setup` skill** (`plugins/stratagem-tavily/skills/setup/`, add-on
  v0.2.0) — prompts for the Tavily key and writes `tavily.config.json` to the resolved
  `<plugin>-<marketplace>` data dir (BOM-free), removing the two manual-setup footguns
  (wrong folder + UTF-16 BOM). Port into `stratagem-core`'s
  `stratagem-addons/plugins/stratagem-tavily/` when convenient.

---

## Related

- `readme.md` — the generic distribution's front door
- `INSTALL.md` — concrete org-neutral onboarding (marketplace install, workflow
  auto-install, the Tavily key)
- `plugins/stratagem-core/SEAM-CONTRACT.md` — the neutral board + notify seam
  contract external adapters resolve to
- `Plans/strat-dist_260719/strat-dist_260719_plan.md` — the feature plan this
  derivation was executed under
