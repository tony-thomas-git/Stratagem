# Stratagem — New Box Setup (standalone)

Set up Stratagem (the `/px → /ax → /ex → /fx` skills + the `/if` autonomy loop) and,
optionally, the `stratagem-ado` plugin on a fresh machine. **Self-contained** — no owner
wiki, no shared docs, no shared credentials required.

## Prerequisites
- **Claude Code ≥ v2.1.154** (plugin enable/disable + `defaultEnabled`).
- **Node on PATH** — *only* if you install the ADO plugin (its MCP launcher runs under Node). Core Stratagem needs no Node.
- Windows / PowerShell (commands below are PowerShell; POSIX equivalents are obvious).

---

## Part A — Stratagem core (skills + `/if` loop)

From the owner's `.claude` zip, extract **only these two** into your *own* `~/.claude`:

| From the zip | Copy to | Why |
|---|---|---|
| `skills/` (all folders) | `%USERPROFILE%\.claude\skills\` | the `/px /ax /ex /fx /cp /pf /rs /if …` skills |
| `workflows\autonomy-loop.js` | `%USERPROFILE%\.claude\workflows\` | **the engine `/if` launches** — without it `/if` no-ops |

```powershell
# from the extracted zip root:
Copy-Item -Recurse .\skills\*    "$env:USERPROFILE\.claude\skills\"
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\workflows" | Out-Null
Copy-Item .\workflows\autonomy-loop.js "$env:USERPROFILE\.claude\workflows\"
```

Restart Claude Code. `/if`, `/px`, `/ax`, `/cp`, `/pf`, `/ex`, `/fx`, `/rs` now resolve.

### Do NOT copy (owner-private / secret / machine-local)
- `.credentials.json`, `plugins\data\**\pat.b64` — **owner secrets.** You make your own (Part B).
- `plugins\cache\`, `plugins\marketplaces\`, `installed_plugins.json`, `known_marketplaces.json` — hardcoded to the owner's paths. You re-add the marketplace fresh (Part B).
- `projects\` — the owner's session history **and private project memory**. Yours starts empty and accrues on its own.
- `sessions\ history.jsonl shell-snapshots\ file-history\ backups\ cache\` — local state.

### The owner's Stratagem wiki is NOT a requirement
The skills resolve a **Wiki Registry** for knowledge augmentation. The `Steward` / `Stratagem`
rows of that registry point at the **owner's private dev wiki** — you never get it and never
need it. With no registry present at all, the skills **no-op that block and fall through to
normal research — zero regression**. `autonomy-loop.js` has no filesystem access and reads
nothing private.

### Engage the ISCI-Vision vault (you have this one)
The ISCI-Vision **project vault** is different — it's the project's source of truth, and you
have it. To make Stratagem vault-aware on ISCI-Vision work (skills consult it during `/px`,
`/ax`, `/cp`, and route learnings through it on `/rs`), give the skills a **minimal registry
stub** — *just the ISCI-Vision row*, none of the owner's private content.

The skills read this exact path: `C:\code\Steward\CLAUDE.md`. Create that file (do **not**
clone the owner's Steward repo — it carries their private wiki rows) with only:

```markdown
## Wiki Registry

| Project | Wiki vault path | Active scope tag |
|---|---|---|
| `ISCI-Vision` | `C:\code\docs\ISCI-Vision-Vault` | `scope/vision` |
```

```powershell
# adjust the vault path to wherever YOUR vision vault actually lives:
$reg = @'
## Wiki Registry

| Project | Wiki vault path | Active scope tag |
|---|---|---|
| `ISCI-Vision` | `C:\code\docs\ISCI-Vision-Vault` | `scope/vision` |
'@
New-Item -ItemType Directory -Force "C:\code\Steward" | Out-Null
$reg | Out-File -Encoding utf8 "C:\code\Steward\CLAUDE.md"
```

Omit the `Steward` / `Stratagem` rows — those are the owner's private wiki. If your vault sits
at a different path, set the row to your actual path. (Skills only consult the registry; a
missing or ISCI-only file degrades cleanly — no regression on the core loop.)

### Optional settings
In your own `~/.claude/settings.json` you may set `"effortLevel"` to taste. Do **not** copy the owner's `settings.json` wholesale (it points at the owner's marketplace path).

### Smoke test (core, no ADO)
1. Check out a **feature branch** — the loop HALTS on `main`/`staging` by design.
2. Write a tiny plan file with one task that declares a `Verify:` line, plus a `## Budget: 50000` header.
3. Run `/if <plan-file> task 1`. Expect the **IF MODE** banner, then the loop running `/px → /ax → verify` under the budget.

---

## Part B — `stratagem-ado` plugin (OPTIONAL — only for ADO board sync)

Core Stratagem runs fully without this. Install only if you want work items to move on the ADO board.

1. **Get the plugin dir.** Clone the Steward repo, or have the owner send you the `plugins\` folder. **The path does not have to match the owner's** — point the marketplace wherever it lands.
2. **Add + install + enable** (it ships disabled):
   ```
   claude plugin marketplace add <your-path>\plugins
   claude plugin install stratagem-ado
   claude plugin enable stratagem-ado
   ```
3. **Make your OWN PAT** (Azure DevOps, org `intelliscience`, scopes **Work Items R/W** + **Code R/W**). Encode as `base64("<your-work-email>:<PAT>")` — **not** the raw PAT (a raw PAT 401s):
   ```powershell
   $pair = "you@intelliscience.com:<YOUR_RAW_PAT>"
   [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pair))
   ```
4. **Write the encoded value** to your plugin data dir (single line, no trailing junk):
   ```powershell
   $dir = "$env:USERPROFILE\.claude\plugins\data\stratagem-ado"
   New-Item -ItemType Directory -Force $dir | Out-Null
   "<BASE64_FROM_STEP_3>" | Out-File -NoNewline -Encoding ascii "$dir\pat.b64"
   icacls "$dir\pat.b64" /inheritance:r /grant:r "$($env:USERNAME):(R)" | Out-Null
   ```
5. **Restart Claude Code** (MCP registration is read at launch).
6. **Probe (read-only):** in a session, run the MCP tool `core_list_projects`. Expect a list including `ISCI - Consolidated - Kanban`.
   - `401` → the `pat.b64` is a raw PAT not `base64("email:PAT")`, or wrong org, or you didn't restart.

Full detail (uninstall, rotate, security): the plugin's own `plugins\stratagem-ado\INSTALL.md`.

### Detach proof
`claude plugin disable stratagem-ado` → the core loop runs **identically, ADO-blind**. The plugin is genuinely optional; nothing in core names "ADO."

---

## What "done" looks like
- `/if` runs a tiny plan on a feature branch under budget (Part A smoke test). ✅
- *(if installed)* `core_list_projects` returns the Kanban project (Part B probe). ✅
