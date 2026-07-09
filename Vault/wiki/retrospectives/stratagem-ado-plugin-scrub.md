---
type: retrospective
sources:
  - stratagem-ado-plugin-scrub_260708_210440_plan.md
updated: 2026-07-09
tags:
  - status/active
  - scope/workflow
---

# stratagem-ado Plugin-Scrub — one per-install identity home

> **Summary.** Made the `stratagem-ado` plugin portable: moved all identity (org / project / owner) out of plugin **source** into one per-install `ado.config.json` home beside `pat.b64`, read by the launcher shim and the read-side skills (sp / pr / ss). Zero source literals; live-proven (`core_list_projects` in the extension venue). One error cycle (EX-001) that the adversarial verifier caught. Sibling effort to the completed Core-Scrub — closes the last non-portable distributable (the marketplace ships exactly one plugin).

## What shipped

- **One identity home.** New `${CLAUDE_PLUGIN_DATA}/ado.config.json` `{ org, project, owner }`, per-install and outside the repo, beside the `pat.b64` secret. An `ado.config.example.json` template ships in-repo (placeholders); INSTALL.md §2c documents the write (mirrors the `pat.b64` §2b flow — there was no `profile.bat`, contrary to the PF's assumption).
- **Launcher self-resolves org.** `bin/ado-mcp-launch.js` reads `org` from the config (precedence `config.org || --org`, fail-loud), so `.mcp.json` drops the hardcoded `--org`. **AP-1 (`shell:true`) and AP-2 (`execPath` PATH-prepend) preserved** — the env-coupled guards from [[claude-code-plugin-bundled-mcp-gotchas]].
- **All three read-side skills** (sp / pr / ss) resolve org/project/owner from the one home — replacing the hardcodes *and* the `$env:STRATAGEM_ADO_*` session-env home (the "wrong home"). `pr` gained `Glob` for the newest-wins config lookup; `ss` resolves org via `node -e` in its existing Bash block. Board URLs standardized to `dev.azure.com/<org>`.
- **Orphan env removed** from the consuming repo's `settings.local.json` — confirming the env-promote would have been throwaway.

## The critical learning — org de-declarative

[[bundled-mcp-launcher-shim]] originally kept the **org declarative** in `.mcp.json` (readable, string-grep-verifiable) *because it treated org as fixed config*. This scrub **reclassifies org as per-install Profile** — like the secret — the moment the plugin is a distributable installed by multiple identities. Org then gets the *same* treatment as `pat.b64`: it moves **out** of `.mcp.json` (which can't read files anyway — AP-3) and **into** the launcher-read data-dir config. The plugin source stops naming it. Deliberate pattern evolution, not a new invention — the shim shape was reused, only the org's classification changed (config → identity).

## EX-001 — enumerated-literal grep gates are blind to same-family variants

The Task-8 grep-clean gate enumerated exact literals (`intelliscience`, `tony.thomas@…`, `ISCI - Consolidated - Kanban`, `STRATAGEM_ADO_`) and passed (exit 0) — yet `ISCI-SAAS`, a **real ISCI-tenant area-path leaf**, survived in `sp/SKILL.md` (an illustrative "don't substitute a leaf" example). It was a *different token* from the enumerated `ISCI - Consolidated - Kanban`, so the gate never saw it. Caught only by an **adversarial completeness-critic** confirmer that swept for near-miss forms (`\bISCI\b`, `visualstudio`) the plan's list didn't enumerate. Fix: `ISCI-SAAS` → generic `<Area-Leaf>`; re-verified with the extended sweep → 0 hits. This is a sibling of [[scope-by-category-blindness]] applied to *verification* (a gate enumerating literals) rather than *change scope* (a fix enumerating files). **Lesson:** pair enumerated-literal gates with a word-boundary/near-miss sweep — enumerate the family by role, not by recall.

## What held

- **Simplicity / surgical.** Prose + config edits + a ~15-line launcher change; no new abstraction. Owner was *stored* in the config (not derived from the PAT at runtime) specifically to keep sp/pr free of a base64-decode/Bash dependency — the simplest design that kept all three read-side skills uniform.
- **Live tracer is the only gate for env-coupled defects.** AP-1/AP-2 pass every file-gate; a launcher smoke test (`initialize` handshake) + a live `core_list_projects` in the **VSCode extension venue** were what actually proved the change — reaffirming [[tracer-bullet-discipline]].
- **Verifier gate earned its place.** 9/9 tasks passed an executed `Verify:` + an independent confirmer; the one issue (EX-001) was found by that confirmer, not the grep.

## Related

- [[bundled-mcp-launcher-shim]] — the pattern this scrub evolved (org de-declarative)
- [[claude-code-plugin-bundled-mcp-gotchas]] — AP-1/AP-2/AP-3 the launcher edit had to respect
- [[scope-by-category-blindness]] — EX-001 is the enumerated-grep-gate sibling of this anti-pattern
- [[audit-glob-self-blindness]] — the same enumeration-blindness in a tool that can't see what it excludes
