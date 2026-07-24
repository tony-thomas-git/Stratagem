# stratagem-tavily — Install / Uninstall

A detachable Stratagem research bridge, shipped as a Claude Code Add-On. It registers the **Tavily** MCP server so the skills' research ladder has a real web surface. Core Stratagem stays **research-provider-blind**; this Add-On is the only thing that knows Tavily exists. It installs, enables, disables, and uninstalls atomically.

> **Ships OFF.** `defaultEnabled: false` — installing does nothing until you `enable` it.

> **Optional by design.** Without this Add-On, skills fall back to Claude Code's built-in `WebSearch` and keep working. Tavily gives sharper, cheaper, citation-friendly results — it is *recommended*, never *required*. That fallback is what makes this Add-On safe to leave uninstalled.

---

## 1. Prerequisites

- **Claude Code ≥ v2.1.154** (plugin `enable`/`disable` + `defaultEnabled`).
- **`node` on PATH** — the bundled MCP launcher shim (`bin/tavily-mcp-launch.js`) runs under Node; `npx` fetches the pinned server at launch.
- **A Tavily API key** — free tier is enough. Get one at <https://app.tavily.com>.

---

## 2. Install and enable

```
# Ships in the same `stratagem` marketplace as the sg core — if you installed sg,
# the marketplace is already added. Just install + enable this add-on:
claude plugin install stratagem-tavily@stratagem
claude plugin enable  stratagem-tavily@stratagem
```

---

## 3. Supply the key (the Add-On ships none)

The Add-On contains **no credential**. At MCP launch the shim reads a single file —
`${CLAUDE_PLUGIN_DATA}/tavily.config.json` — and exports the key as `TAVILY_API_KEY`
for the server. The key is passed to the child through the **environment, never argv**.

### 3.0 The easy way — `/stratagem-tavily:setup` (recommended)

Once the Add-On is enabled, just run the setup skill and paste your key:

```
/stratagem-tavily:setup                 # prompts for the key
/stratagem-tavily:setup tvly-your-key    # or pass it inline
```

It resolves the correct `<plugin>-<marketplace>` data dir and writes `tavily.config.json`
BOM-free for you — removing the two footguns the manual steps below warn about (the folder
suffix and the encoding). Restart Claude Code afterward. The manual path (§3a–3b) is the
fallback if you'd rather not run a skill.

### 3a. Resolve the data dir (manual fallback)

`${CLAUDE_PLUGIN_DATA}` is the Add-On's persistent data directory (survives updates). Claude Code resolves it to **`~/.claude/plugins/data/<plugin>-<marketplace>/`** — the plugin name **plus the marketplace name**, *not* a bare `stratagem-tavily/`. Installed from the `stratagem` marketplace, that is:

```
~/.claude/plugins/data/stratagem-tavily-stratagem/
```

> ⚠️ **Do not guess this path** — the `-<marketplace>` suffix is the single most common first-install mistake across every Stratagem Add-On (it once cost a clean-machine install a "Failed to connect" debug session). The shim resolves the config with a **newest-wins glob** over `stratagem-tavily*` data dirs, so a key written to the bare directory *is* still found — but it will warn, because two dirs holding a config race by modification time. Write it to the suffixed dir and keep exactly one.

### 3b. Write the config

Copy the shipped example and add your key:

Windows PowerShell:

```powershell
$dir = "$env:USERPROFILE\.claude\plugins\data\stratagem-tavily-stratagem"   # <plugin>-<marketplace>
New-Item -ItemType Directory -Force $dir | Out-Null
'{ "apiKey": "<your-tavily-api-key>" }' | Out-File -NoNewline -Encoding ascii "$dir\tavily.config.json"

# Lock it down to your account only:
icacls "$dir\tavily.config.json" /inheritance:r /grant:r "$($env:USERNAME):(R)" | Out-Null
```

POSIX equivalent:

```bash
dir="$HOME/.claude/plugins/data/stratagem-tavily-stratagem"   # <plugin>-<marketplace>
mkdir -p "$dir"
printf '%s' '{ "apiKey": "<your-tavily-api-key>" }' > "$dir/tavily.config.json"
chmod 600 "$dir/tavily.config.json"
```

> **Never commit `tavily.config.json`.** It lives in the data dir, never in a repo. The repo-root `.gitignore` ignores `**/tavily.config.json` as a second line of defence; the file should not be in a tree to begin with.

Then **restart Claude Code** and confirm:

```
claude mcp list
```

`plugin:stratagem-tavily:tavily` should be **connected**.

---

## 4. What you get

The pinned server is **`tavily-mcp@0.2.21`**, which exposes the exact five-rung ladder the
Stratagem rules document describes (`stratagem-core-rules.md` → "Research & Web Lookup Routing"):

| Tool | Use |
|---|---|
| `tavily_search` | single keyword query — an error message, news, current state |
| `tavily_extract` | known URL → clean content (use after a search returns a good link) |
| `tavily_map` | known doc site → which pages are relevant |
| `tavily_crawl` | whole-site offline reference (rare) |
| `tavily_research` | multi-source synthesis with citations. Quota-heavy. **Last resort.** |

> **The pin is load-bearing.** `tavily-mcp@0.1.x` exposed only two tools and named them
> with **hyphens** (`tavily-search`, `tavily-extract`) — so three rungs of the documented
> ladder did not exist and the other two did not resolve by the names the skills use.
> `0.2.21` is the first surface that matches the docs. Do not float this to `@latest`:
> an unpinned server is a silent, unreviewable dependency bump on every launch.

---

## 5. Troubleshooting

**"Failed to connect."** Run the shim by hand — it reports the exact reason to stderr:

```bash
node ./bin/tavily-mcp-launch.js --package tavily-mcp@0.2.21 \
     --data-dir "$HOME/.claude/plugins/data/stratagem-tavily-stratagem"
```

| Message | Meaning |
|---|---|
| `no tavily.config.json found in …` | The config is not in any `stratagem-tavily*` data dir. Redo §3b. |
| `the "apiKey" … is still the example placeholder` | You copied the example but never replaced the key. |
| `no "apiKey" in …` | The JSON parsed, but the field is missing or empty. |
| `WARNING: N data dirs hold a tavily.config.json` | Two dirs race by mtime. Delete all but the `-stratagem` one. |

The shim writes diagnostics to **stderr only** — stdout is the MCP protocol stream and
anything printed there corrupts it.

---

## 6. Disable / uninstall

```
claude plugin disable   stratagem-tavily@stratagem     # keeps it installed, stops the MCP
claude plugin uninstall stratagem-tavily --keep-data # keeps ${CLAUDE_PLUGIN_DATA}
```

Skills fall back to built-in `WebSearch` the moment it is disabled — nothing else breaks.

---

## 7. Security notes

- The key exists **only** in `${CLAUDE_PLUGIN_DATA}/tavily.config.json`, owned by your account. The Add-On files carry none — `tavily.config.example.json` holds a placeholder.
- The key reaches the server via the child's **environment**, never argv.
- Rotate at <https://app.tavily.com> and overwrite the file; no reinstall needed.
