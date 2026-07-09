# stratagem-ado — Install / Uninstall

A detachable Stratagem↔Azure DevOps bridge, shipped as a Claude Code plugin. Core Stratagem stays **ADO-blind**; this plugin is the only thing that knows ADO exists. It installs, enables, disables, and uninstalls atomically.

> **Ships OFF.** `defaultEnabled: false` — installing does nothing until you `enable` it.

---

## 1. Prerequisites

- **Claude Code ≥ v2.1.154** (plugin `enable`/`disable` + `defaultEnabled`).
- **`node` on PATH** — the bundled MCP launcher shim (`bin/ado-mcp-launch.js`) runs under Node; `npx` fetches the pinned server at launch.
- **An Azure DevOps PAT** with **Work Items (Read & Write)** and **Code (Read & Write)** scopes, for your org (`<your-org>`).

---

## 2. Supply the secret (the plugin ships none)

The plugin contains **no credential**. At MCP launch the shim reads a single file —
`${CLAUDE_PLUGIN_DATA}/pat.b64` — and exports its contents as `PERSONAL_ACCESS_TOKEN`.

### 2a. Encode the token

The azure-devops MCP server **base64-decodes** `PERSONAL_ACCESS_TOKEN`, splits on `:`, and uses everything **after** the first `:` as the PAT. So the value must be `base64("<work-email>:<PAT>")` — **not** a raw PAT (a raw PAT decodes to non-UTF-8 garbage → `401`).

Windows PowerShell:

```powershell
$pair = "<your-work-email>:<YOUR_RAW_PAT>"
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pair))
```

(Use your **work email** — the same one you put in `ado.config.json` as `owner` — paired with your raw PAT. The org name is **not** always the email domain; set it explicitly in `ado.config.json`.)

### 2b. Resolve the data dir and write the file

`${CLAUDE_PLUGIN_DATA}` is the plugin's persistent data directory (survives plugin updates). Default location:

```
~/.claude/plugins/data/stratagem-ado/
```

Write the encoded string into `pat.b64` there (single line, no trailing junk):

```powershell
$dir = "$env:USERPROFILE\.claude\plugins\data\stratagem-ado"
New-Item -ItemType Directory -Force $dir | Out-Null
"<BASE64_FROM_STEP_2a>" | Out-File -NoNewline -Encoding ascii "$dir\pat.b64"

# Lock it down to your account only:
icacls "$dir\pat.b64" /inheritance:r /grant:r "$($env:USERNAME):(R)" | Out-Null
```

POSIX equivalent:

```bash
mkdir -p "$HOME/.claude/plugins/data/stratagem-ado"
printf '%s' '<BASE64_FROM_STEP_2a>' > "$HOME/.claude/plugins/data/stratagem-ado/pat.b64"
chmod 600 "$HOME/.claude/plugins/data/stratagem-ado/pat.b64"
```

> **Never commit `pat.b64`.** It lives in the data dir, never in the plugin repo.

### 2c. Supply the identity config

The plugin also ships **no identity**. Org, default project, and owner live in a
per-install config file **beside the secret**, read by both the launcher shim (which
passes `--org` to the MCP server) and the skills (`sp` / `pr` / `ss`, for their
project/owner defaults + board URLs). See `ado.config.example.json` in the plugin
root for the shape:

```json
{ "org": "<your-org>", "project": "<your-default-project>", "owner": "<your-work-email>" }
```

Write your values into `ado.config.json` in the **same data dir** as `pat.b64`:

```powershell
$dir = "$env:USERPROFILE\.claude\plugins\data\stratagem-ado"
@{ org = "<your-org>"; project = "<your-default-project>"; owner = "<your-work-email>" } |
  ConvertTo-Json | Out-File -NoNewline -Encoding ascii "$dir\ado.config.json"
```

POSIX equivalent:

```bash
cat > "$HOME/.claude/plugins/data/stratagem-ado/ado.config.json" <<'JSON'
{ "org": "<your-org>", "project": "<your-default-project>", "owner": "<your-work-email>" }
JSON
```

> **Never commit `ado.config.json`.** Like `pat.b64`, it lives only in the data dir —
> the plugin source carries zero identity literals.

---

## 3. Install + enable

During development the plugin is a **local directory** (`C:\code\Steward\plugins\stratagem-ado\`, D10 — promoted to a git marketplace repo after Phase 4):

```
# add the local marketplace dir, then install + enable
claude plugin marketplace add C:\code\Steward\plugins
claude plugin install stratagem-ado
claude plugin enable stratagem-ado
```

`enable` is required because the plugin ships `defaultEnabled: false`. After enabling, restart Claude Code so the bundled `.mcp.json` registration is picked up (MCP env/registration is read at launch).

---

## 4. Post-install probe (auth green check)

This is a **read-only** validation — the exact de-risk used when the integration was first proven. In a Claude Code session with the plugin enabled, run the MCP tool:

```
core_list_projects
```

Expected: a project list including **your default project** (the one you set as `project` in `ado.config.json`). If you instead get `401`:

- the `pat.b64` is a **raw** PAT, not `base64("email:PAT")` (re-do step 2a), or
- the `org` in `ado.config.json` is wrong (or missing), or
- Claude Code wasn't restarted after writing `pat.b64` / `ado.config.json`.

No work items are created by the probe — it only reads.

---

## 5. Disable (prove ADO-blindness)

```
claude plugin disable stratagem-ado
```

With the plugin **disabled**, every Stratagem loop runs **identically with zero ADO awareness** — the neutral seams (`board adapter`) presence-check and no-op. This is the detach proof: nothing in core names "ADO."

---

## 6. Uninstall (clean detach)

```
claude plugin uninstall stratagem-ado
```

A clean uninstall reverts as-if-never-installed: the bundled MCP registration, the namespaced skills (`/stratagem-ado:*`), and the plugin's data are removed. The data dir (incl. `pat.b64`) is deleted **unless** you pass `--keep-data`:

```
claude plugin uninstall stratagem-ado --keep-data   # keeps ${CLAUDE_PLUGIN_DATA}
```

After uninstall, `~/.claude.json` should contain **no** `stratagem-ado` MCP residue and **no** `/stratagem-ado:*` skills (this is what the Phase-4 atomic-detach test asserts).

---

## Security notes

- The secret exists **only** in `${CLAUDE_PLUGIN_DATA}/pat.b64`, owned by your account. The plugin files carry none.
- `.mcp.json` cannot read file contents into env — that's *why* the launcher shim exists (it reads `pat.b64` at runtime). There is no env-var or in-file path that exposes the token in the repo.
- Rotate the PAT by overwriting `pat.b64` and restarting Claude Code.
