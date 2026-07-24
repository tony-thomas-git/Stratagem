---
name: setup
description: Tavily Setup — write your Tavily API key into the add-on's data dir so the research MCP can authenticate. Prompts for the key (or takes it as an argument), resolves the correct <plugin>-<marketplace> data dir, and writes tavily.config.json BOM-free — no manual path-hunting.
argument-hint: "optional: your Tavily API key (tvly-…)"
---

# stratagem-tavily :setup

**Purpose:** One-command key setup for the Tavily research add-on. Resolves the add-on's data dir and writes `tavily.config.json` with your key — removing the two manual-setup footguns: the `<plugin>-<marketplace>` folder name, and the UTF-8/BOM encoding that breaks `JSON.parse`.

**Argument (optional):** `$ARGUMENTS` — your Tavily API key. If omitted, you'll be prompted.

**IMMEDIATELY display this banner:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🔑 stratagem-tavily · key setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Steps

1. **Get the key.**
   - If `$ARGUMENTS` is non-empty, use it as the key.
   - Otherwise ask: *"Paste your Tavily API key (free tier at https://app.tavily.com):"* and wait for the reply.
   - **Never echo the key back in full** — mask all but the last 4 characters in any output.

2. **Validate.** The key must start with `tvly-` and must NOT contain `<` (the shipped placeholder). If it fails, STOP and tell the user to get a real key at https://app.tavily.com — do not write a file.

3. **Resolve the data dir** (mirror the launcher's newest-wins glob so both agree):
   - List existing dirs matching `~/.claude/plugins/data/stratagem-tavily*`.
   - Exactly one → use it. Several → prefer `stratagem-tavily-stratagem` (the `<plugin>-<marketplace>` canonical). None → create `~/.claude/plugins/data/stratagem-tavily-stratagem`.

4. **Write the config — BOM-free, valid JSON — via `node`** (already this add-on's runtime; guarantees no UTF-16 BOM). Pass the key as a **process argument to node** (never interpolated into JS or exposed in a printed command), substituting the resolved dir and the key:
   ```
   node -e "const fs=require('fs'),path=require('path');const d=process.argv[1];fs.mkdirSync(d,{recursive:true});const f=path.join(d,'tavily.config.json');fs.writeFileSync(f,JSON.stringify({apiKey:process.argv[2]},null,2)+'\n');console.log('wrote '+f)" "<RESOLVED_DIR>" "<KEY>"
   ```
   Single-quote the key argument for the shell so it is never expanded. Do not print the key.

5. **Lock it down (best-effort, skip-loud — a perms failure is a warning, not a stop).**
   - Windows: `icacls "<file>" /inheritance:r /grant:r "%USERNAME%:(R)"`
   - POSIX: `chmod 600 "<file>"`

6. **Confirm** — print the file **path** (not the key), then:
   > ✅ Key saved to `<path>`. **Restart Claude Code**, then run `claude mcp list` — the `tavily` MCP should show **connected**.

## Notes
- The key lives **only** in your local data dir — never in the repo. `tavily.config.json` is gitignored as a second line of defence, and the add-on ships no secret (only `tavily.config.example.json`).
- **Idempotent** — re-run any time to replace the key.
- If the add-on isn't enabled yet, run `claude plugin enable stratagem-tavily@stratagem` first (it ships `defaultEnabled: false`).
- Full mechanics + the manual fallback are in this add-on's `INSTALL.md` §3.

**Next:** restart Claude Code → `claude mcp list` to confirm the MCP connects.
