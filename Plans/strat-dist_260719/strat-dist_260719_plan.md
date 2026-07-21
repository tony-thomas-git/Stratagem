# Feature: strat-dist — Stack-Neutral Generic Distribution

## Created: 2026-07-19 18:24 (local) · 2026-07-20T00:24Z
## Status: In Progress
## Source PF: strat-dist_260719_plan.html
## Tracer Bullet: NO
## Budget: 500000

<!-- Not board-synced: this is the board-AGNOSTIC distribution repo; no Vault/ado-board-config.md → no ADO headers, by design. -->

---

## Strategic Context

### Problem Statement & Solution

The `sg` plugin on `tt/strat-dist` is a **hand-derived distributable of the intelliscience coder flavor**. It is already **board-neutralized** (commit `dd4deee`: ADO naming stripped, `stratagem-ado` removed, notify seam present, `stratagem-tavily` add-on shipped) — verified clean today (zero `ADO-|azure devops|ado-board-config|stratagem-ado` hits in `plugins/stratagem-core`).

It is **not yet stack-neutral**: the skills still bake in intelliscience's C#/WPF/.NET stack (`IVia.*`, Castle.Windsor, OnnxRuntime, OpenCV, GoogleTest/MSTest, `npm`/`eslint`, `.cs/.xaml`, native-C++ interop). This feature closes three gaps + one small fix:

1. **Genericize the stack specifics** across the skills so the core privileges no language, framework, or test runner.
2. **Add the generic `INSTALL.md`** (the originating question) — a concrete, org-neutral onboarding doc.
3. **Document the derivation** (`docs/DERIVATION.md`) so `strat-dist` is a reproducible transform, not a black-box one-off.
4. **Fix** the `.gitignore` discrepancy the tavily `INSTALL.md` already claims exists.

**Locked decision (prior session):** NOT a compiler flavor — the compiler (`compile.mjs` + `core/` + `templates/`) stays untouched in the separate `stratagem-core` repo. `strat-dist` is a hand-derived snapshot; re-deriving is a manual, *documented* procedure (why Gap 3 exists).

### What's Already Built

| Component | State | Location |
|---|---|---|
| Board neutralization | ✅ done (`dd4deee`) — verified zero ADO hits | `plugins/stratagem-core/**` |
| `stratagem-tavily` add-on | ✅ shipped, ships-disabled; 9-test suite + launcher present | `plugins/stratagem-tavily/` |
| Neutral board + notify seams | ✅ present | `plugins/stratagem-core/SEAM-CONTRACT.md` |
| `marketplace.json` | ✅ `sg` + `stratagem-tavily`, name `stratagem` | `plugins/.claude-plugin/marketplace.json` |
| `readme.md` | ⚠️ has install block with `<owner>/stratagem` placeholder — trim to point at new INSTALL.md | `readme.md` |
| Root `INSTALL.md` | ❌ absent (left with ADO scrub) — net-new | — |
| `docs/DERIVATION.md` | ❌ absent — net-new | — |
| `pica/SKILL.md` `Stack:` line (L24) | ✅ already generic ("derive scope from active project's CLAUDE.md") — keep verbatim | `plugins/stratagem-core/skills/pica/SKILL.md` |

### Architecture Decisions

- **Neutral-noun voice (D1):** replace baked stack names with placeholder nouns ("the app", "the libraries your task touches", "your test runner scoped to this task's suite"). A worked example in one stack just privileges a different stack; nouns privilege none.
- **`pica` defers to `CLAUDE.md` (D2):** the `Stack:` line already derives audit scope from the project's `CLAUDE.md`. Keep banner/report/action-by-mode mechanics byte-stable; replace the 8 IVia/Windsor/WPF dimensions with a short **stack-neutral** dimension set framed as "the dimensions your CLAUDE.md + style docs define." No new abstraction → stays M, not H.
- **Anchored verification gate (D3):** the seed's gate uses bare `ISCI`, which matches the word "di**sci**pline" (6 false hits). Anchor to `ISCI-Vision|\bISCI\b`. **The grep is necessary but not sufficient** — stack-flavored *examples* naming other libraries (React/MSAL/AG Grid/AWS/Azure at `stratagem-core-rules.md:282`) are invisible to it, so a **read-scan** pass is mandatory (Tasks 2 & 6).
- **Doc-only DERIVATION (D5):** a substitution script is a new abstraction with its own failure surface; the doc is the reproducible baseline. Script is a fast-follow if re-derivation becomes frequent.
- **Dedicated INSTALL.md (D6):** goes deeper than a README should (workflow auto-install mechanics, `settings.json` pre-grant, Tavily key); readme links it.

### Phase Strategy

Natural decomposition (no tracer bullet — single-layer prose genericization, files independent, no cross-layer integration). Order: genericize (Tasks 1–6) → net-new docs (Tasks 7–8) → small fix (Task 9). Per-task `Verify:` is a **targeted token-absence grep** for that concern; the plan-level `## Integration-Verify:` is the anchored full-gate + board regression + add-on integrity. Treat Tasks 1–6 as **one coherent sweep and re-grep after** (guards against scope-by-category blindness — see [[scope-by-category-blindness]], [[audit-glob-self-blindness]]).

### Entity/Component Notes — the stack-bound hot-spot inventory

Lines are a **2026-07-19 snapshot** — every task **re-greps before editing** (line staleness risk).

| File | Line(s) | Baked in | Genericize to | Task |
|---|---|---|---|---|
| `skills/pica/SKILL.md` | 9, 30–41 | Purpose + all 8 audit dimensions (Windsor/TBB/Dispatcher/XAML/interop/IVia) | Full re-author → neutral dimensions (D2); keep mechanics | 5 |
| `skills/ax/SKILL.md` | 46, 97 | context7 lib list (`Castle.Windsor, CommunityToolkit.Mvvm, Microsoft.ML.OnnxRuntime, OpenCV`); `/pica` "Layer-5 `.cs/.xaml` … Native C++ below interop seam out of scope" | "the libraries your task touches"; "the changed source files" | 2, 1 |
| `skills/fx/SKILL.md` | 52, 100 | same lib list; same `/pica` Layer-5 line | same | 2, 1 |
| `skills/max/SKILL.md` | 81 | same `/pica` Layer-5 line | "the changed source files" | 1 |
| `skills/cp/SKILL.md` | 92, 123, 306 | `Verify: npm test … && eslint`; `Board-Area` example `ISCI - Consolidated - Kanban`; "manual smoke test of `IVia.App (WPF)`" | "your test runner, scoped to this task's suite"; neutral board-area example; "the app" | 3 |
| `skills/wiki-ingest/SKILL.md` | 152, 300 | `scope/vision` for `ISCI-Vision-Vault` worked example | neutral example scope (`scope/<your-project>`) | 4 |
| `skills/wiki-graph-audit/SKILL.md` | 116 | same `scope/vision` / `ISCI-Vision-Vault` example | neutral example scope | 4 |
| `stratagem-core-rules.md` | 282 | context7 brand list (`React, Next.js, Prisma, MSAL, AG Grid, Tailwind, AWS/Azure SDKs`) — **grep-invisible** | generalize to a category, drop brand privilege | 2 |
| `skills/ex/SKILL.md`, `skills/ps/SKILL.md` | read-scan | stack-flavored phrasing (seed-flagged) — **grep-invisible**, likely light/no-op | neutralize any found | 6 |

### Dependencies

- **None external.** All edits are in-repo prose + two net-new docs. `node` on PATH for the add-on integrity checks (already required by the add-on).
- Task 7 (INSTALL.md) synthesizes from existing vault pages: `[[plugin-marketplace-distribution]]`, `[[workflow-auto-install-hook]]`, `[[bundled-mcp-launcher-shim]]` — synthesis, not discovery.

### Risk Assessment

| Risk | Sev | Mitigation |
|---|---|---|
| Cross-cutting edit surface (~9 files) misses a same-family instance | M | Tasks 1–6 as one sweep; plan-level anchored gate re-greps the whole `plugins/stratagem-core` tree |
| Grep blindness to brand examples / soft phrasing | M | Mandatory read-scan (Tasks 2, 6); a clean per-file grep is a floor, not proof of neutrality |
| `pica` re-author drops the *mechanism* (CLAUDE.md scope + PICA-log + report format) | L | Keep mechanics byte-stable; only the dimension list becomes generic (Task 5 acceptance criteria) |
| Line-number staleness | L | Every task re-greps before editing |
| `readme.md` link check false-positives on the existing tavily INSTALL.md mention | L | Task 7 `Verify:` matches a link to root INSTALL specifically (`](INSTALL.md)`), not any "INSTALL" |

### Open Design Decisions — RESOLVED 2026-07-19

All decisions locked. /phx can run phases without stopping.

| # | Decision | Resolution |
|---|---|---|
| 1 | Genericization voice | Neutral-noun placeholders (no stack privileged) |
| 2 | `pica` dimensions | 6-item neutral set, mechanics byte-stable, defers to project `CLAUDE.md`. **+ readme note (Task 7): PICA adapts to your codebase — populate your `CLAUDE.md` + style docs to train it on your patterns** |
| 3 | `cp` Board-Area example | `Portfolio - Team - Board\Area` |
| 4 | wiki example scope | `scope/<your-project>` *(operator affirmed the Vault/CORPUS-READ-FIRST as a standard Stratagem component — this is what makes it portable)* |
| 5 | Test-runner phrasing | "your test runner, scoped to this task's suite"; per-layer table structure kept, runner specifics neutralized |
| 6 | INSTALL.md pre-grant snippet | Yes — include the `.claude/settings.json` `Workflow(autonomy-loop)` pre-grant |
| 7 | readme install block | Trim to a pointer at `INSTALL.md`; replace `<owner>/stratagem` placeholder |
| 8 | DERIVATION scope | Doc-only (no `derive-generic.sh`) |
| 9 | `.gitignore` | Add `**/tavily.config.json` |
| 10 | Budget + execution | `## Budget: 500000`; operator lean deferred to the execution fork below |

### Success Criteria

1. `## Integration-Verify:` passes: anchored stack-neutral gate reads zero **and** board-neutral regression holds **and** the Tavily add-on's tests + launcher pass.
2. Read-scan (Tasks 2, 6) confirms no stack-flavored *examples* remain (the grep-invisible surface).
3. Root `INSTALL.md` documents the concrete marketplace install + workflow auto-install + Tavily key, and `readme.md` links it.
4. `docs/DERIVATION.md` records what/how/re-derive + the genericization map.
5. `.gitignore` ignores `tavily.config.json` (the tavily `INSTALL.md` claim becomes true).
6. All edits uncommitted on `tt/strat-dist` for review (never-commit).

---

## Task List

- [x] **Task 1: Genericize the shared `/pica`-caller scope line (ax, fx, max).** ✅ 2026-07-19 — replaced the byte-identical line across ax:97, fx:100, max:81 with the stack-neutral phrasing "the changed source files + their sibling files implementing the same pattern"; native-C++ out-of-scope semantics preserved generically in `pica/SKILL.md`'s byte-stable `Stack:` line. Verify PASS (zero hits).
  - Verify: `! rg -qn '\.cs/\.xaml|Native C\+\+ below the interop seam|Layer-5' plugins/stratagem-core/skills/ax/SKILL.md plugins/stratagem-core/skills/fx/SKILL.md plugins/stratagem-core/skills/max/SKILL.md`

- [x] **Task 2: Genericize the context7 library-example lists (ax, fx, rules).** ✅ 2026-07-19 — replaced the baked brand lists at ax:46, fx:52, and `stratagem-core-rules.md:282` with neutral category phrasing ("any library, framework, SDK, (CLI,) or cloud service your task touches/uses"); routing semantics (context7-first, resolve/get-library-docs, the SDK-attributable predicate) kept byte-stable. Read-scan confirmed the 3 named lines were the entire brand surface in these files. Verify PASS (zero hits). Replace the baked brand lists — `Castle.Windsor, CommunityToolkit.Mvvm, Microsoft.ML.OnnxRuntime, OpenCV` (ax:46, fx:52) and `React, Next.js, Prisma, MSAL, AG Grid, Tailwind, AWS/Azure SDKs` (`stratagem-core-rules.md:282`) — with category phrasing ("the libraries your task touches" / "any library, framework, SDK, CLI, or cloud service"). This is a **read-scan** target: the rules.md brands are grep-invisible to the stack gate.
  - Verify: `! rg -qn 'Castle\.Windsor|CommunityToolkit|OnnxRuntime|OpenCV|MSAL|AG Grid|Next\.js|Prisma|Tailwind|React' plugins/stratagem-core/skills/ax/SKILL.md plugins/stratagem-core/skills/fx/SKILL.md plugins/stratagem-core/stratagem-core-rules.md`

- [x] **Task 3: Genericize `cp/SKILL.md` stack examples.** ✅ 2026-07-19 — three surgical edits: (a) L92 `Verify: npm test -- auth.spec && eslint src/auth` → house-style placeholder `Verify: <your test runner, scoped to this task's suite>`; (b) L123 `Board-Area` example `ISCI - Consolidated - Kanban\ISCI-SAAS` → `Portfolio - Team - Board\Area` (Q#3 verbatim); (c) L306 `manual smoke test of IVia.App (WPF)` → `manual smoke test of the app`. **Phantom-reference resolved:** the task body's "per-layer runner-map table (GoogleTest/MSTest)" does **not** exist in cp/SKILL.md (zero gtest/MSTest/GoogleTest hits) — nothing to neutralize there; read-scan confirmed the 3 lines were the entire stack surface. Verify PASS (zero hits under a correct rg invocation). Original spec below. (a) `Verify: npm test -- auth.spec && eslint src/auth` → "your test runner, scoped to this task's suite"; (b) `Board-Area` example `ISCI - Consolidated - Kanban\ISCI-SAAS` → a neutral placeholder path; (c) "manual smoke test of `IVia.App (WPF)`" → "manual smoke test of the app". Keep the per-layer runner-map table's *structure* but neutralize its GoogleTest/MSTest specifics to "your test runner (scoped filter)".
  - Verify: `! rg -qn 'npm test|eslint|\bIVia|\bISCI|WPF|gtest|MSTest|dotnet test|vstest' plugins/stratagem-core/skills/cp/SKILL.md`

- [x] **Task 4: Genericize the wiki-scope examples (wiki-ingest, wiki-graph-audit).** ✅ 2026-07-19 — replaced the `scope/vision`↔`ISCI-Vision-Vault` pairings at wiki-ingest:152,300 and wiki-graph-audit:116 with `scope/<your-project>`, preserving the "infer from `meta/scopes.md`" mechanics + "prompt if ambiguous" fallbacks. Also dropped the ISCI-domain `vision` token from two sibling example enumerations (wiki-ingest:142 frontmatter template, wiki-graph-audit:107 validation rule) so no `vision` example survives; left wiki-ingest:153 (`build/app/storage` — generic nouns) untouched. **PICA sibling sweep caught one out-of-named-scope same-family instance** — `stratagem-core-rules.md:325` also used `scope/vision` as an example — genericized to `scope/<your-project>` under the plan's "Tasks 1–6 = one coherent sweep" directive (a bare `scope/vision` survives the `## Integration-Verify:` `ISCI-Vision|\bISCI\b` gate, so the sweep is the only thing that catches it). Verify PASS (zero hits, both named files + tree-wide). Original spec below. Replace `scope/vision` for `ISCI-Vision-Vault` (wiki-ingest:152,300; wiki-graph-audit:116) with a neutral example scope (`scope/<your-project>`), preserving the "infer scope from the vault's `meta/scopes.md`" mechanics.
  - Verify: `! rg -qn 'ISCI-Vision-Vault|scope/vision' plugins/stratagem-core/skills/wiki-ingest/SKILL.md plugins/stratagem-core/skills/wiki-graph-audit/SKILL.md`

- [x] **Task 5: Re-author `pica/SKILL.md` to stack-neutral dimensions (D2).** ✅ 2026-07-19 — 4 surgical edits: Purpose L9 (`Layer-5 (C#/WPF)` → `the implementations your change touches`); pattern-ID examples L29 (`Windsor/UI-thread/MVVM` → `component registration, thread/async marshalling, resource-lifecycle ordering, data-binding, module wiring`); audit-targets L30-31 (`.cs/.xaml` + `IVia.App/…` file list + native-C++ carve-out → `the changed source files + their sibling files … scoped per the Stack: boundary above`, native-interop out-of-scope semantics now carried solely by the byte-stable `Stack:` line); dimensions L33-41 (the 8 IVia/Windsor/WPF dimensions → 6 neutral: DI/registration consistency, concurrency/async correctness, resource-lifecycle ordering, style-guide conformance, boundary/seam coordination, new-component wiring, framed "check the dimensions your `CLAUDE.md` + style docs define; common ones:"). `[[CSharpCodeStyle]]`/`[[module-index]]` stack links dropped. Byte-stable islands (frontmatter, banner, `Stack:` L24, Report Compliance Status, Output Format, action-by-mode, Next) untouched — git diff = 10 ins / 13 del, all inside L9+L29-41. Verify PASS (zero hits) + wider read-scan clean (TBB/ObservableCollection/MVVM/InspectionKind/CSharpCodeStyle/module-index all gone). Keep the `Stack:` line (L24), banner, `## Report Compliance Status`, `## Output Format`, and the AX/FX/mAX action-by-mode block **byte-stable**. Replace the Purpose (L9) and the 8 IVia/Windsor/WPF dimensions (L30–41) with a short neutral set — DI/registration consistency, concurrency/async correctness, resource-lifecycle ordering, style-guide conformance, boundary/seam coordination, new-component wiring — framed as "check the dimensions your `CLAUDE.md` + style docs define; common ones:". Audit target = "the changed source files + their siblings," not `.cs/.xaml`.
  - Verify: `! rg -qn '\bIVia|Windsor|\.cs/\.xaml|Dispatcher|XAML|InspectionResponseReadyEvent|C#/WPF|PipelineLiveResult|UserInterfaceService' plugins/stratagem-core/skills/pica/SKILL.md`

- [x] **Task 6: Read-scan `ex` + `ps` and neutralize any stack-flavored phrasing.** ✅ 2026-07-19 — **no-op outcome (sanctioned).** Full-read + two grep passes (token-floor + broad brand/stack sweep: React/MSAL/AWS/Azure/.NET/C#/C++/ONNX/Windsor/MVVM/vision/…) over both files: **zero hits, zero edits.** `ex/SKILL.md` already *defers* to the project everywhere it touches a stack — "project-appropriate terminology" (L38), "Check for common framework-specific issues" (L41), "Error Assessment (Override in Project)" (L24), "Project EX implementation" (L62); "error messages and stack traces" (L39) is the universal call-stack/diagnostic sense, not a tech-stack privilege. The `CORPUS-READ-FIRST` block (L26–35) is sync-locked verbatim across 8 SKILL.md files and already generic — left untouched (unilateral edit forbidden). `ps/SKILL.md` is entirely meta-process (seed authoring, HTML/SVG output, `/ss`→`/pf` flow) — no stack references at all. Verify PASS (zero hits). Original spec below. No hard grep hits today; the substantive check is a human/PICA read for issue-class / diagnostic / exploration wording that assumes a stack. Neutralize anything found; if none, that is a valid outcome (the Verify is a token floor, not the whole check).
  - Verify: `! rg -qn '\bIVia|\.cs\b|\.xaml|WPF|Castle\.Windsor|OnnxRuntime|OpenCV|gtest|MSTest|dotnet test|npm test|eslint|Native C\+\+' plugins/stratagem-core/skills/ex/SKILL.md plugins/stratagem-core/skills/ps/SKILL.md`

- [x] **Task 7: Author root `INSTALL.md` + link from `readme.md` + PICA-adapts note.** ✅ 2026-07-19 — created net-new root `INSTALL.md` (7 sections: marketplace table, prereqs, 3-line core install `claude plugin marketplace add tony-thomas-git/Stratagem`→`install sg@stratagem`→restart with zero-config `defaultEnabled` note, the SessionStart auto-install of `autonomy-loop.js` + the one-time `Workflow(autonomy-loop)` grant + `.claude/settings.json` pre-grant snippet, the Tavily `install`+`enable` pair + key at `~/.claude/plugins/data/stratagem-tavily-stratagem/tavily.config.json`, external-adapter seam pointer, PICA-trains-on-your-CLAUDE.md section, verification checklist). Edited `readme.md`: trimmed the Install block (`<owner>/stratagem`→`tony-thomas-git/Stratagem`, added `[`INSTALL.md`](INSTALL.md)` root pointer) + added a `## What sg gives you` bullet "PICA adapts to your codebase" (Q#2). Verify PASS (ripgrep-correct: the plan's `rg -qE` string uses grep's `-E`, which ripgrep reads as `--encoding` — re-ran each assertion with native rg regex; all 7 pass incl. the strict `](INSTALL.md)` root-link match). Synthesized from the actual live manifests (`marketplace.json` ships `sg`+`stratagem-tavily`, **no ADO**) — not the stale vault page that still names `stratagem-ado`. Original spec below. Document: the concrete 3-line marketplace install (`claude plugin marketplace add tony-thomas-git/Stratagem` → `install sg@stratagem` → restart); `sg` is zero-config (`defaultEnabled`); the SessionStart workflow auto-install (`hooks.json` → `sync-autonomy-workflow.sh` copies `autonomy-loop.js`) + the one-time `Workflow(autonomy-loop)` grant + the `.claude/settings.json` pre-grant snippet; the Tavily `install`+`enable` pair + the key at `~/.claude/plugins/data/stratagem-tavily-stratagem/tavily.config.json`. Link it from `readme.md` and trim the readme's `<owner>/stratagem` placeholder block to a pointer. **Per Q#2: add a short note in `readme.md` that PICA adapts to your codebase** — `/pica` derives its audit dimensions from your project's `CLAUDE.md` + style docs, so populating those *trains it on your patterns* (this is the flip side of the Task 5 genericization: neutral dimensions ship, your CLAUDE.md specializes them).
  - Verify: `test -f INSTALL.md && rg -q 'tony-thomas-git/Stratagem' INSTALL.md && rg -q 'sg@stratagem' INSTALL.md && rg -q 'autonomy-loop' INSTALL.md && rg -q 'tavily.config.json' INSTALL.md && rg -q '\]\(INSTALL\.md\)' readme.md && rg -qi 'pica' readme.md`

- [x] **Task 8: Author `docs/DERIVATION.md`.** ✅ 2026-07-19 — created net-new `docs/DERIVATION.md` (4 sections synthesized from the LIVE manifests + `readme.md`/`INSTALL.md`, not the stale ADO-naming vault pages): (1) **what strat-dist is** — the hand-derived generic distributable = coder `sg` + board-neutralized (`dd4deee`) + stack-neutralized (this feature) + `stratagem-tavily`, with the Builder≠Artifact framing (the compiler `compiler/ core/ templates/ golden/` stays in the separate `C:\code\stratagem-core` repo, out of scope) + the D5 doc-only-not-compiler-flavor locked decision; (2) the **four gaps** this feature closed; (3) the **genericization map** — the Entity/Component Notes table promoted to a file→baked-in→genericized-to→task table + the D2 PICA-defers-to-CLAUDE.md flip side; (4) the **manual re-derivation procedure** (7 steps) incl. the D3 anchored gate (`ISCI-Vision|\bISCI\b`, NOT bare `ISCI` — the "di**sci**pline" false-hit) + the mandatory read-scan for the grep-invisible brand surface + the add-on integrity checks, and the D5 doc-only rationale. Verify PASS under a correct rg invocation (file exists; `stratagem-tavily`×4; `derive`/`genericiz` present). **Plan-authoring defect flagged (not fixed here — same class as EX-1):** the Task 8 `Verify:` `rg -qiE` triggers ripgrep's `-E`→`--encoding` error (exit 2); the deliverable satisfies the verify *intent* — a `!`-less orchestrator run of the literal line will exit 2 on the flag, not on content. Original spec below. What `strat-dist` is (coder `sg` + board-neutralized + stack-neutralized + `stratagem-tavily`); the genericization map (promote the Entity/Component Notes table); the manual re-derivation steps when the coder flavor updates. Doc-only (no `derive-generic.sh` — D5).
  - Verify: `test -f docs/DERIVATION.md && rg -qi 'stratagem-tavily' docs/DERIVATION.md && rg -qi 're-deriv|derive|genericiz' docs/DERIVATION.md`

- [x] **Task 9: Fix the `.gitignore` discrepancy.** ✅ 2026-07-19 — added a single line `**/tavily.config.json` to the repo-root `C:/code/Stratagem/.gitignore`, placed in the credential/secret block immediately after `**/ado.config.json` (same `**/` glob as its sibling secret entries; tavily.config.json holds an API key). Now the tavily `INSTALL.md:73` "second line of defence" claim is true (D4). Diff = 1 additive line, no other line touched (ADO-flavored L1 header comment is pre-existing + out of the `plugins/stratagem-core` integration-gate scope, left as-is). Verify PASS (`rg -q 'tavily\.config\.json' .gitignore` → exit 0).
  - Verify: `rg -q 'tavily\.config\.json' .gitignore`

## Completed Tasks
- [x] **Task 1: Genericize the shared `/pica`-caller scope line (ax, fx, max).** ✅ 2026-07-19 — ax:97, fx:100, max:81 now read "the changed source files + their sibling files implementing the same pattern." Verify PASS.
- [x] **Task 2: Genericize the context7 library-example lists (ax, fx, rules).** ✅ 2026-07-19 — ax:46, fx:52, `stratagem-core-rules.md:282` now use neutral category phrasing (no brand privileged); routing semantics byte-stable. Read-scan clean. Verify PASS (zero hits).
- [x] **Task 3: Genericize `cp/SKILL.md` stack examples.** ✅ 2026-07-19 — L92 `Verify:` example → `<your test runner, scoped to this task's suite>` (house-style angle-bracket placeholder, matching L156); L123 Board-Area example → `Portfolio - Team - Board\Area` (Q#3); L306 `IVia.App (WPF)` smoke-test example → `the app`. The task body's "per-layer runner-map table (GoogleTest/MSTest)" was a phantom reference — no such table exists in cp/SKILL.md; the 3 edited lines were the complete stack surface (grep + read-scan confirmed). Verify PASS (zero hits). Diff scope: cp/SKILL.md only (3 lines).
- [x] **Task 4: Genericize the wiki-scope examples (wiki-ingest, wiki-graph-audit).** ✅ 2026-07-19 — wiki-ingest:152,300 + wiki-graph-audit:116 `scope/vision`↔`ISCI-Vision-Vault` pairings → `scope/<your-project>` (meta/scopes.md inference + prompt-if-ambiguous kept); sibling `vision` example token dropped from wiki-ingest:142 + wiki-graph-audit:107; wiki-ingest:153 (generic nouns) left as-is. PICA sibling sweep found + genericized one out-of-named-scope same-family instance at `stratagem-core-rules.md:325` (bare `scope/vision`, invisible to the plan's ISCI-anchored integration gate). Verify PASS (zero hits, tree-wide). Diff scope: wiki-ingest/SKILL.md, wiki-graph-audit/SKILL.md, stratagem-core-rules.md.
- [x] **Task 5: Re-author `pica/SKILL.md` to stack-neutral dimensions (D2).** ✅ 2026-07-19 — Purpose L9, pattern-ID examples L29, audit-targets L30-31 (`.cs/.xaml`+`IVia.*` file list + native-C++ carve-out dropped; out-of-scope semantics carried by the byte-stable `Stack:` line), and the 8 IVia/Windsor/WPF dimensions L33-41 → 6 neutral dimensions (DI/registration, concurrency/async, resource-lifecycle ordering, style-guide conformance, boundary/seam coordination, new-component wiring) framed "check the dimensions your `CLAUDE.md` + style docs define." `[[CSharpCodeStyle]]`/`[[module-index]]` dropped. Byte-stable islands (banner, `Stack:` L24, Report Compliance Status, Output Format, action-by-mode, Next) untouched — git diff confined to L9+L29-41 (10 ins/13 del). Verify PASS + wider read-scan clean. Diff scope: pica/SKILL.md only (1 file).
- [x] **Task 6: Read-scan `ex` + `ps` and neutralize any stack-flavored phrasing.** ✅ 2026-07-19 — **no-op outcome (sanctioned by the task: "if none, that is a valid outcome").** Full-read + two grep passes over both files (token-floor grep + broad brand/stack sweep: React/MSAL/AWS/Azure/.NET/C#/C++/ONNX/Windsor/MVVM/vision/…) → **zero hits, zero source edits.** `ex/SKILL.md` already defers to the project at every stack-touching phrase ("project-appropriate terminology", "framework-specific issues", "Override in Project", "Project EX implementation"); "stack traces" = universal call-stack diagnostic, not a tech-stack privilege; the sync-locked `CORPUS-READ-FIRST` block left untouched (identical across 8 files). `ps/SKILL.md` is pure meta-process (seed authoring / HTML output / `/ss`→`/pf`), no stack references. Verify PASS (zero hits). Diff scope: plan bookkeeping only (0 SKILL.md edits).
- [x] **Task 8: Author `docs/DERIVATION.md`.** ✅ 2026-07-19 — net-new `C:/code/Stratagem/docs/DERIVATION.md` (§1 what strat-dist is: hand-derived `sg` + board-neutral + stack-neutral + `stratagem-tavily`, Builder≠Artifact / compiler-stays-in-sibling-`stratagem-core`-repo, D5 doc-not-compiler; §2 the four gaps closed; §3 the genericization map promoted from the Entity/Component Notes table + D2 PICA-defers-to-CLAUDE.md; §4 the 7-step manual re-derivation procedure incl. the D3 anchored gate `ISCI-Vision|\bISCI\b` + mandatory read-scan for grep-invisible brand examples + add-on integrity + D5 doc-only rationale). Reflects the LIVE marketplace (`sg`+`stratagem-tavily`, no ADO), not the stale vault pages (same call Task 7 made). Verify PASS (correct rg; the literal `rg -qiE` carries the EX-1 `-E`→`--encoding` flag defect — deliverable is correct, verifier line is a plan bug). PICA: compliant — `docs/DERIVATION.md` is outside the `plugins/stratagem-core` integration-gate scope, so the map table's *documented* stack tokens (IVia/Windsor/etc., naming what was replaced) are intentional and allowed; case-sensitive gate + board-neutral regression both clean tree-wide; add-on launcher `--check` passes. Diff scope: docs/DERIVATION.md (net-new).
- [x] **Task 7: Author root `INSTALL.md` + link from `readme.md` + PICA-adapts note.** ✅ 2026-07-19 — net-new `C:/code/Stratagem/INSTALL.md` (org-neutral onboarding synthesized from `[[plugin-marketplace-distribution]]`, `[[workflow-auto-install-hook]]`, `[[bundled-mcp-launcher-shim]]` + live manifests): marketplace table, prereqs, 3-line core install, workflow auto-install + one-time `Workflow(autonomy-loop)` grant + pre-grant snippet, Tavily `install`+`enable` + `tavily.config.json` key path, adapter-seam pointer, PICA-trains-on-your-CLAUDE.md section, verification checklist. `readme.md`: Install block trimmed (`<owner>/stratagem`→`tony-thomas-git/Stratagem` + `](INSTALL.md)` root pointer) + "PICA adapts to your codebase" bullet added. Verify PASS (ripgrep-correct; the plan's `rg -qE` uses grep `-E` which rg reads as `--encoding` — re-ran with native rg regex, all 7 assertions pass incl. strict `](INSTALL.md)`). Reflects the real marketplace (`sg`+`stratagem-tavily`, no ADO), not the stale ADO-naming vault page. PICA: compliant (only "Azure DevOps/Jira/GitHub Projects" adapter-candidate list, matching pre-existing readme; no `stratagem-ado`/stack/org tokens; both docs at repo root, outside the integration-gate scope). Diff scope: INSTALL.md (net-new), readme.md (2 edits).
- [x] **Task 9: Fix the `.gitignore` discrepancy.** ✅ 2026-07-19 — added a single line `**/tavily.config.json` to the repo-root `C:/code/Stratagem/.gitignore`, in the credential/secret block right after `**/ado.config.json` (same `**/` glob as its sibling secret entries — tavily.config.json holds an API key). The tavily `INSTALL.md:73` "second line of defence" claim is now true (D4). Diff = 1 additive line; no other line touched (ADO-flavored L1 header comment is pre-existing and outside the `plugins/stratagem-core` integration-gate scope). Verify PASS (`rg -q 'tavily\.config\.json' .gitignore` → exit 0).

## Error Log

### EX-1 (2026-07-19) — Task 7 Verify defect: `rg -qE` invalid flag → exit 2
- **Error type:** Verifier-command defect (plan authoring bug), NOT a deliverable defect. Task 7's INSTALL.md + readme.md are complete and correct.
- **Failing command (plan line 133):** chain segment `rg -qE '\]\(INSTALL\.md\)|INSTALL\.md' readme.md`.
- **Root cause:** ripgrep does not accept grep's `-E` (extended-regex) flag. rg parses `-E` as `--encoding` and consumes the following regex as an encoding name → `error parsing flag -E: unknown encoding: \]\(INSTALL\.md\)|INSTALL\.md`, exit 2. The non-zero breaks the `&&` chain before the readme-link/PICA assertions run. Per P1 ODD-8 a non-zero executed exit is always fail and cannot be flipped. (Tasks 5/6 carried the identical `-E` bug but were `!`-prefixed, which negated the error into exit 0 and masked it.)
- **Evidence (from repo root C:/code/Stratagem):** literal Task 7 Verify → EXIT=2; isolated `rg -qE …` → EXIT=2; every other assertion (`test -f INSTALL.md`, `rg -q 'tony-thomas-git/Stratagem'`, `sg@stratagem`, `autonomy-loop`, `tavily.config.json` in INSTALL.md; `rg -qi 'pica' readme.md`) → EXIT=0; corrected `rg -q '\]\(INSTALL\.md\)' readme.md` → EXIT=0; corrected full chain → EXIT=0.
- **Files affected:** plan line 133 only (the Task 7 `- Verify:` line). No source files.

- [x] FIX: correct the Task 7 Verify `rg -qE` segment to a valid, intent-aligned ripgrep invocation ✅ 2026-07-19
  - Error Type: Verifier-command defect (invalid rg flag)
  - Files Affected: `C:/code/Stratagem/Plans/strat-dist_260719/strat-dist_260719_plan.md` line 133
  - Root Cause: `-E` is grep extended-regex; ripgrep reads `-E` as `--encoding` → exit 2 (ripgrep uses extended regex by default, so no flag is needed).
  - Fix Strategy: replace `rg -qE '\]\(INSTALL\.md\)|INSTALL\.md' readme.md` with `rg -q '\]\(INSTALL\.md\)' readme.md`. Removes the invalid `-E` flag AND drops the loose `|INSTALL.md` alternation — the loose branch would false-positive on readme:52's legitimate `plugins/stratagem-tavily/INSTALL.md` (a NON-root link), exactly the false-positive the plan's Risk Assessment (line 82) says the Verify must avoid ("matches a link to root INSTALL specifically (`](INSTALL.md)`), not any 'INSTALL'"). Do NOT touch INSTALL.md / readme.md. Diverges from the prior attempt's `rg -qE`→`rg -q` (which kept the loose alternation and its documented false-positive risk).
  - **Resolution:** Task 7 `- Verify:` line edited (single segment). No source files touched — INSTALL.md / readme.md deliverable left as-built. Corrected full chain re-run from repo root `C:/code/Stratagem` → **EXIT=0**. Task 7 verifier now passes.

### EX-2 (2026-07-19) — Task 8 Verify defect: `rg -qiE` invalid flag → exit 2 (EX-1 class, on the line FX-1 missed)
- **Error type:** Verifier-command defect (plan-authoring bug), NOT a deliverable defect. Task 8's `docs/DERIVATION.md` is complete and correct (149 lines; all 4 sections present).
- **Failing command (plan line 136):** chain segment `rg -qiE 're-deriv|derive|genericiz' docs/DERIVATION.md`.
- **Root cause:** identical class to EX-1 — ripgrep does not accept grep's `-E` (extended-regex) flag. In the combined `-qiE` cluster the trailing `-E` is parsed as `--encoding`, consuming the following regex `re-deriv|derive|genericiz` as an encoding name → `error parsing flag -E: grep config error: unknown encoding: re-deriv|derive|genericiz`, exit 2. The non-zero breaks the `&&` chain before the content intent is tested. Per P1 ODD-8 a non-zero executed exit is always fail and cannot be flipped. FX-1 corrected only line 133 (Task 7); this same-class defect on line 136 was *flagged* in Task 8's completion note but the `- Verify:` line was never actually edited (it still reads `-qiE`).
- **Evidence (from repo root C:/code/Stratagem):** literal Task 8 Verify → EXIT=2; isolated `rg -qiE …` → EXIT=2 (`unknown encoding`); assertion 1 `test -f docs/DERIVATION.md` → EXIT=0; assertion 2 `rg -qi 'stratagem-tavily' docs/DERIVATION.md` → EXIT=0; corrected assertion 3 `rg -qi 're-deriv|derive|genericiz' docs/DERIVATION.md` (drop `-E`, keep `-qi`) → EXIT=0; corrected full chain → EXIT=0.
- **Files affected:** plan line 136 only (the Task 8 `- Verify:` line). No source files. The `docs/DERIVATION.md` deliverable is left untouched.

- [x] FIX: correct the Task 8 Verify `rg -qiE` segment to a valid, intent-aligned ripgrep invocation ✅ 2026-07-19
  - Error Type: Verifier-command defect (invalid rg flag)
  - Files Affected: `C:/code/Stratagem/Plans/strat-dist_260719/strat-dist_260719_plan.md` line 136
  - Root Cause: `-E` is grep's extended-regex flag; in the `-qiE` cluster ripgrep reads the trailing `-E` as `--encoding` → exit 2. Ripgrep uses extended regex by default, so no `-E` is needed; `-qi` (quiet + case-insensitive) is intentional and kept.
  - Fix Strategy: replace `rg -qiE 're-deriv|derive|genericiz' docs/DERIVATION.md` with `rg -qi 're-deriv|derive|genericiz' docs/DERIVATION.md`. Drop only the invalid `-E`; keep `-qi` and the three-branch alternation verbatim (the intended content check). Do NOT touch `docs/DERIVATION.md`. This applies the accepted FX-1 fix pattern to the line FX-1 missed. **Divergence from the prior recovery attempt:** that attempt documented the defect via `/ex` but never edited line 136 — this fix actually applies the edit and re-runs the corrected chain to EXIT=0.
  - **Resolution:** Task 8 `- Verify:` line edited (single segment: `-qiE`→`-qi`, `-E` dropped). No source files touched — `docs/DERIVATION.md` deliverable left as-built (still untracked/unmodified per git status). Corrected literal Task 8 Verify chain re-run from repo root `C:/code/Stratagem` → **EXIT=0** (all three assertions pass). Task 8 verifier now passes. Remaining `rg -qiE 're-deriv` occurrences in the plan are inside the EX-2 log / Fix Strategy prose (documenting the BEFORE state), not the active `- Verify:` line.

## PICA Log
| Task | Pattern | Audited | Issues | Action |
|------|---------|---------|--------|--------|
| T1 | byte-identical /pica-caller scope line (ax, fx, max) | 3 | 0 | — |
| T2 | context7 brand-list genericization (D1 neutral-noun) | 9 (3 changed + 6 sibling context7 files) | 0 | — |
| T3 | stack-example genericization (D1 neutral-noun) in cp/SKILL.md | 1 (full-file grep + read-scan) | 0 | — |
| T4 | wiki-scope example genericization (D1 neutral-noun) | 3 (2 named files + tree-wide sibling sweep) | 1 (rules.md:325 same-family `scope/vision`) | fixed in-sweep (same D1 pattern; no follow-up) |
| T5 | pica dimension re-author (D2 neutral dimensions, mechanics byte-stable) | 1 (pica/SKILL.md; byte-stable islands + full-file re-grep + wider read-scan) | 0 | — |
| T6 | stack-flavored phrasing read-scan (D1 neutral-noun, grep-invisible surface) | 2 (ex/SKILL.md, ps/SKILL.md; full-read + token-floor + broad brand/stack sweep) | 0 (already stack-neutral; both defer to project) | — |
| T7 | net-new onboarding doc neutrality (D1 board+stack neutral) in INSTALL.md + readme.md | 2 (full stack/ADO/org token scan) | 0 (adapter-candidate list only, matches pre-existing readme; outside integration-gate scope) | — |
| FX1 | verifier-command hygiene (rg vs grep `-E` flag) | 0 source files (plan `- Verify:` line only; no `.cs/.xaml` or source touched) | 0 | — |
| T8 | net-new derivation doc neutrality (docs/, outside integration-gate scope) in DERIVATION.md | 1 (full stack/board/org token scan + gate-scope check) | 0 (documented map tokens intentional & out-of-scope; case-sensitive gate + board regression clean; `-i` "Trivial" is a pre-existing English-word false positive, not touched) | — |
| FX2 | verifier-command hygiene (rg vs grep `-E` flag) — same class as FX1, on the Task 8 `- Verify:` line FX-1 missed | 0 source files (plan `- Verify:` line only; no `.cs/.xaml` or source touched) | 0 | — |
| T9 | .gitignore secret-glob entry consistency (credential block) | 1 (`.gitignore`; sibling-glob prefix + placement + literal-claim match) | 0 (`**/` prefix matches siblings; ADO-flavored L1 header pre-existing + out of integration-gate scope, untouched) | — |

## Integration-Verify: `! rg -qi '\bIVia|\.cs\b|\.xaml|WPF|Castle\.Windsor|OnnxRuntime|OpenCV|TensorRT|gtest|MSTest|dotnet test|vstest|npm test|eslint|Native C\+\+|intelliscience|ISCI-Vision|\bISCI\b' plugins/stratagem-core && ! rg -qi 'ADO-|azure devops|ado-board-config|stratagem-ado' plugins/stratagem-core && node --test plugins/stratagem-tavily/test/resolve-cred-dir.test.mjs && node --check plugins/stratagem-tavily/bin/tavily-mcp-launch.js`
